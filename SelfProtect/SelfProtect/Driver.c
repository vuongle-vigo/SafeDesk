#include "stdafx.h"
#include "Driver.h"
#include "FileProtect.h"
#include "Communication.h"
#include "Filter.h"
#include "ProcessProtect.h"

// DriverEntry: Initialize the driver
NTSTATUS DriverEntry(PDRIVER_OBJECT DriverObject, PUNICODE_STRING RegistryPath)
{
    UNREFERENCED_PARAMETER(RegistryPath);

    NTSTATUS status;
    PDEVICE_OBJECT deviceObject = NULL;
    UNICODE_STRING deviceName, symbolicLinkName;

    // Init file list to store path protect
    InitializeProtectedFilesList();
    InitializeProtectedProcessesList();

    InitializeProcessProtection();

    // Initialize device and symbolic link names
    RtlInitUnicodeString(&deviceName, DEVICE_NAME);
    RtlInitUnicodeString(&symbolicLinkName, SYMBOLIC_LINK_NAME);

    // Create device object
    status = IoCreateDevice(DriverObject, 0, &deviceName, FILE_DEVICE_UNKNOWN, 0, FALSE, &deviceObject);
    if (!NT_SUCCESS(status)) {
        KdPrint(("[SelfProtect] Failed to create device: 0x%08lX\n", (ULONG)status));
        return status;
    }

    // Create symbolic link
    status = IoCreateSymbolicLink(&symbolicLinkName, &deviceName);
    if (!NT_SUCCESS(status)) {
        IoDeleteDevice(deviceObject);
        KdPrint(("[SelfProtect] Failed to create symbolic link: 0x%08lX\n", (ULONG)status));
        return status;
    }

    // Set dispatch routines
    DriverObject->MajorFunction[IRP_MJ_CREATE] = HandleFileAccess; // For compatibility
    DriverObject->MajorFunction[IRP_MJ_CLOSE] = HandleCreateClose;
    DriverObject->MajorFunction[IRP_MJ_DEVICE_CONTROL] = HandleDeviceControl;
    DriverObject->DriverUnload = DriverUnload;

    // Initialize file protection (minifilter)
    status = InitializeFilter(DriverObject);
    if (!NT_SUCCESS(status)) {
        IoDeleteSymbolicLink(&symbolicLinkName);
        IoDeleteDevice(deviceObject);
        KdPrint(("[SelfProtect] Failed to initialize file protection: 0x%08lX\n", (ULONG)status));
        return status;
    }

    //printf value gFilterHandle and gServerPort
    DEBUG("[SelfProtect] gFilterHandle: %p, gServerPort: %p\n", gFilterHandle, gServerPort);

    status = InitializeCommunicationPort();
    if (!NT_SUCCESS(status)) {
        FltUnregisterFilter(gFilterHandle);
        return status;
    }

    KdPrint(("[SelfProtect] Driver initialized successfully\n"));
    return STATUS_SUCCESS;
}

//// DriverUnload: Cleanup routine
// global debug helper (optional)
static __forceinline ULONGLONG NowMs(void)
{
    // milliseconds since boot
    return KeQueryInterruptTime() / 10000ULL;
}

VOID DriverUnload(PDRIVER_OBJECT DriverObject)
{
    UNICODE_STRING symbolicLinkName;

    KdPrint(("[SelfProtect][Unload] ENTER t=%llu ms\n", NowMs()));

    KdPrint(("[SelfProtect][Unload] Step 1: UnregisterProcessProtection...\n"));
    UnregisterProcessProtection();
    KdPrint(("[SelfProtect][Unload] Step 1: done\n"));

    // ---- communication ports cleanup ----
    KdPrint(("[SelfProtect][Unload] Step 2: Close communication port(s)... gServerPort=%p\n", gServerPort));
    if (gServerPort) {
        FltCloseCommunicationPort(gServerPort);
        gServerPort = NULL;
    }
    // nếu bạn có client port global thì đóng luôn:
    // if (gClientPort) { FltCloseClientPort(gFilterHandle, &gClientPort); gClientPort=NULL; }

    KdPrint(("[SelfProtect][Unload] Step 2: done\n"));

    // ---- minifilter unregister ----
    KdPrint(("[SelfProtect][Unload] Step 3: FltUnregisterFilter... gFilterHandle=%p\n", gFilterHandle));
    if (gFilterHandle) {
        // NOTE: hàm này có thể BLOCK nếu còn callback/refs
        FltUnregisterFilter(gFilterHandle);
        gFilterHandle = NULL;
    }
    KdPrint(("[SelfProtect][Unload] Step 3: done\n"));

    // ---- cleanup lists ----
    KdPrint(("[SelfProtect][Unload] Step 4: CleanupFileProtection...\n"));
    CleanupFileProtection();
    KdPrint(("[SelfProtect][Unload] Step 4: done\n"));

    // nếu có cleanup process list thì gọi:
    // KdPrint(("[SelfProtect][Unload] Step 5: CleanupProcessProtection...\n"));
    // CleanupProcessProtection();
    // KdPrint(("[SelfProtect][Unload] Step 5: done\n"));

    // ---- delete sym link + device ----
    KdPrint(("[SelfProtect][Unload] Step 6: IoDeleteSymbolicLink...\n"));
    RtlInitUnicodeString(&symbolicLinkName, SYMBOLIC_LINK_NAME);
    IoDeleteSymbolicLink(&symbolicLinkName);
    KdPrint(("[SelfProtect][Unload] Step 6: done\n"));

    KdPrint(("[SelfProtect][Unload] Step 7: IoDeleteDevice(s)...\n"));
    while (DriverObject->DeviceObject) {
        PDEVICE_OBJECT next = DriverObject->DeviceObject->NextDevice;
        IoDeleteDevice(DriverObject->DeviceObject);
        DriverObject->DeviceObject = next;
    }
    KdPrint(("[SelfProtect][Unload] Step 7: done\n"));

    KdPrint(("[SelfProtect][Unload] LEAVE t=%llu ms\n", NowMs()));
}

// HandleCreateClose: Process IRP_MJ_CLOSE
NTSTATUS HandleCreateClose(PDEVICE_OBJECT DeviceObject, PIRP Irp)
{
    DeviceObject; // Suppress unused parameter warning

    Irp->IoStatus.Status = STATUS_SUCCESS;
    Irp->IoStatus.Information = 0;
    IoCompleteRequest(Irp, IO_NO_INCREMENT);
    return STATUS_SUCCESS;
}

// HandleDeviceControl: Process IOCTL requests
NTSTATUS HandleDeviceControl(PDEVICE_OBJECT DeviceObject, PIRP Irp)
{
    NTSTATUS status = STATUS_SUCCESS;
    PIO_STACK_LOCATION irpStack = IoGetCurrentIrpStackLocation(Irp);
    ULONG controlCode = irpStack->Parameters.DeviceIoControl.IoControlCode;
    PVOID inputBuffer = Irp->AssociatedIrp.SystemBuffer;
    ULONG inputBufferLength = irpStack->Parameters.DeviceIoControl.InputBufferLength;

    DeviceObject; // Suppress unused parameter warning

    switch (controlCode) {
    case IOCTL_PROTECT_FILE:
        if (inputBuffer && inputBufferLength > sizeof(WCHAR)) {
            UNICODE_STRING filePath;
            RtlInitUnicodeString(&filePath, (PCWSTR)inputBuffer);
            status = AddProtectedFile(&filePath);
            if (!NT_SUCCESS(status)) {
                KdPrint(("[SelfProtect] Failed to protect file: %wZ, status: 0x%08lX\n", &filePath, (ULONG)status));
            }
            else {
                KdPrint(("[SelfProtect] Successfully protected file: %wZ\n", &filePath));
            }
        }
        else {
            status = STATUS_INVALID_PARAMETER;
        }

        break;
    case IOCTL_PROTECT_PROCESS:
        status = STATUS_NOT_IMPLEMENTED;
        KdPrint(("[SelfProtect] IOCTL_PROTECT_PROCESS not implemented\n"));
        break;
    default:
        status = STATUS_INVALID_DEVICE_REQUEST;
        KdPrint(("[SelfProtect] Invalid IOCTL: 0x%08lX\n", (ULONG)controlCode));
        break;
    }

    Irp->IoStatus.Status = status;
    Irp->IoStatus.Information = 0;
    IoCompleteRequest(Irp, IO_NO_INCREMENT);
    return status;
}