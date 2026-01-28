#include "Communication.h"
#include "Common.h"
#include "FileProtect.h"
#include "ProcessProtect.h"

PFLT_PORT gClientPort = NULL; // Global client port handle

// Init port
NTSTATUS InitializeCommunicationPort()
{
    NTSTATUS status;
    UNICODE_STRING portName;
    OBJECT_ATTRIBUTES oa;
    PSECURITY_DESCRIPTOR sd;

    if (!gFilterHandle) {
        KdPrint(("[SelfProtect] Invalid FilterHandle\n"));
        return STATUS_INVALID_PARAMETER;
    }

    status = FltBuildDefaultSecurityDescriptor(&sd, FLT_PORT_ALL_ACCESS);
    if (!NT_SUCCESS(status)) {
        KdPrint(("[SelfProtect] Failed to build security descriptor: 0x%08lX\n", status));
        return status;
    }

    // Init port name
    RtlInitUnicodeString(&portName, PORT_NAME);
    InitializeObjectAttributes(&oa, &portName, OBJ_KERNEL_HANDLE | OBJ_CASE_INSENSITIVE, NULL, sd);
    status = RtlSetDaclSecurityDescriptor(sd, TRUE, NULL, FALSE);

    // Create port
    if (gFilterHandle) {
        status = FltCreateCommunicationPort(gFilterHandle,
            &gServerPort,
            &oa,
            NULL,
            PortConnectNotify,
            PortDisconnectNotify,
            PortMessageNotify,
            1); // Max connections
    }

    FltFreeSecurityDescriptor(sd);

    if (!NT_SUCCESS(status)) {
        KdPrint(("[SelfProtect] Failed to create communication port: 0x%08lX\n", status));
    }
    else {
        KdPrint(("[SelfProtect] Communication port created: %wZ\n", &portName));
    }

    return status;
}

// Clean port after use
VOID CleanupCommunicationPort(PFLT_PORT ServerPort)
{
    if (ServerPort) {
        FltCloseCommunicationPort(ServerPort);
        KdPrint(("[SelfProtect] Communication port closed\n"));
    }
    if (gClientPort) {
        FltCloseClientPort(gFilterHandle, &gClientPort);
        gClientPort = NULL;
    }
}

// Handle client connection
NTSTATUS PortConnectNotify(
    PFLT_PORT ClientPort,
    PVOID ServerPortCookie,
    PVOID ConnectionContext,
    ULONG SizeOfContext,
    PVOID* ConnectionPortCookie
)
{
    UNREFERENCED_PARAMETER(ServerPortCookie);
    UNREFERENCED_PARAMETER(ConnectionContext);
    UNREFERENCED_PARAMETER(SizeOfContext);
    UNREFERENCED_PARAMETER(ConnectionPortCookie);

    gClientPort = ClientPort;
    KdPrint(("[SelfProtect] Client connected to port\n"));
    return STATUS_SUCCESS;
}

// Handle client disconnection
VOID PortDisconnectNotify(PVOID ConnectionCookie)
{
    UNREFERENCED_PARAMETER(ConnectionCookie);

    if (gClientPort) {
        FltCloseClientPort(gFilterHandle, &gClientPort);
        gClientPort = NULL;
        KdPrint(("[SelfProtect] Client disconnected from port\n"));
    }
}


// Handle messages from client
NTSTATUS PortMessageNotify(
    PVOID PortCookie,
    PVOID InputBuffer,
    ULONG InputBufferLength,
    PVOID OutputBuffer,
    ULONG OutputBufferLength,
    PULONG ReturnOutputBufferLength
)
{
    NTSTATUS status = STATUS_SUCCESS;
    UNICODE_STRING FilePath;
    UNREFERENCED_PARAMETER(PortCookie);
    UNREFERENCED_PARAMETER(OutputBuffer);
    UNREFERENCED_PARAMETER(OutputBufferLength);
    UNREFERENCED_PARAMETER(ReturnOutputBufferLength);

    if (InputBuffer && InputBufferLength == sizeof(PROTECT_MESSAGE)) {
        PPROTECT_MESSAGE message = (PPROTECT_MESSAGE)InputBuffer;
        if (message->FilePath[0] != L'\0') {
            switch (message->Type) {
            case MESSAGE_ADD_PROTECTED_FILE:
                RtlInitUnicodeString(&FilePath, message->FilePath);
                status = AddProtectedFile(&FilePath);
				if (NT_SUCCESS(status)) {
					KdPrint(("[SelfProtect] Added file to protection list: %ws\n", message->FilePath));
				}
				else {
					KdPrint(("[SelfProtect] Failed to add file to protection list: %ws\n", message->FilePath));
				}

                break;
            case MESSAGE_REMOVE_PROTECTED_FILE:
                RtlInitUnicodeString(&FilePath, message->FilePath);
                RemoveProtectedFile(&FilePath);
                KdPrint(("[SelfProtect] Removed file: %ws\n", message->FilePath));
                break;
            case MESSAGE_ADD_PROTECTED_PROCESS:
                RtlInitUnicodeString(&FilePath, message->FilePath);
                status = AddProtectedProcess(&FilePath);
				if (NT_SUCCESS(status)) {
					KdPrint(("[SelfProtect] Added process to protection list: %ws\n", message->FilePath));
				}
				else {
					KdPrint(("[SelfProtect] Failed to add process to protection list: %ws\n", message->FilePath));
				}

                break;
            case MESSAGE_REMOVE_PROTECTED_PROCESS:
                RtlInitUnicodeString(&FilePath, message->FilePath);
                RemoveProtectedProcess(&FilePath);
                KdPrint(("[SelfProtect] Removed process: %ws\n", message->FilePath));
                break;
            default:
                status = STATUS_INVALID_PARAMETER;
                KdPrint(("[SelfProtect] Invalid message type\n"));
            }
        }
        else {
            status = STATUS_INVALID_PARAMETER;
            KdPrint(("[SelfProtect] Empty file path\n"));
        }
    }
    else {
        status = STATUS_INVALID_PARAMETER;
        KdPrint(("[SelfProtect] Invalid input buffer or length\n"));
    }

    return status;
}
