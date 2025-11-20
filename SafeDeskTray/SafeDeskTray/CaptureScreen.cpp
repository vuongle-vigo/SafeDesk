#include "CaptureScreen.h"
#include <stdio.h>

int SaveBitmapToFile(HBITMAP hBitmap, HDC hDC, char* filename) {
    BITMAP bmp;
    GetObject(hBitmap, sizeof(BITMAP), &bmp);

    BMPHeader header;
    DWORD bytesPerPixel = 3; // 24-bit BMP
    DWORD stride = (bmp.bmWidth * bytesPerPixel + 3) & ~3;
    DWORD bitmapDataSize = stride * bmp.bmHeight;

    // Create header BMP
    header.fileHeader.bfType = 0x4D42;
    header.fileHeader.bfOffBits = sizeof(BMPHeader);
    header.fileHeader.bfSize = header.fileHeader.bfOffBits + bitmapDataSize;
    header.fileHeader.bfReserved1 = 0;
    header.fileHeader.bfReserved2 = 0;

    header.infoHeader.biSize = sizeof(BITMAPINFOHEADER);
    header.infoHeader.biWidth = bmp.bmWidth;
    header.infoHeader.biHeight = -bmp.bmHeight; // ?nh không b? l?t ng??c
    header.infoHeader.biPlanes = 1;
    header.infoHeader.biBitCount = 24;
    header.infoHeader.biCompression = BI_RGB;
    header.infoHeader.biSizeImage = bitmapDataSize;
    header.infoHeader.biXPelsPerMeter = 0;
    header.infoHeader.biYPelsPerMeter = 0;
    header.infoHeader.biClrUsed = 0;
    header.infoHeader.biClrImportant = 0;

    // Create buffer pixel
    BYTE* bitmapData = (BYTE*)malloc(bitmapDataSize);
    if (!bitmapData) { 
		printf("Failed to allocate memory for bitmap data\n");
        return 0;
    }

    BITMAPINFO bi;
    ZeroMemory(&bi, sizeof(bi));
    bi.bmiHeader = header.infoHeader;

    if (!GetDIBits(hDC, hBitmap, 0, bmp.bmHeight, bitmapData, &bi, DIB_RGB_COLORS)) {
        free(bitmapData);
		printf("GetDIBits failed\n");
        return 0;
    }

    // Save to file
    FILE* fp = fopen(filename, "wb");
    if (!fp) {
		printf("Failed to open file for writing: %s\n", filename);
        free(bitmapData);
        return 0;
    }

    fwrite(&header, sizeof(BMPHeader), 1, fp);
    fwrite(bitmapData, bitmapDataSize, 1, fp);
    fclose(fp);
    free(bitmapData);

    return 1;
}

int CaptureScreen(const char* fileName) {
    // Get size of the screen
    int screenX = GetSystemMetrics(SM_CXSCREEN);
    int screenY = GetSystemMetrics(SM_CYSCREEN);

    HDC hScreenDC = GetDC(NULL);
    HDC hMemoryDC = CreateCompatibleDC(hScreenDC);

    HBITMAP hBitmap = CreateCompatibleBitmap(hScreenDC, screenX, screenY);
    HBITMAP hOldBitmap = (HBITMAP)SelectObject(hMemoryDC, hBitmap);

    // Copy save all screen to hMemoryDC
    BitBlt(hMemoryDC, 0, 0, screenX, screenY, hScreenDC, 0, 0, SRCCOPY);

    // Save to file bmp
    int r = SaveBitmapToFile(hBitmap, hScreenDC, (char*)fileName);
    if (!r) {
        printf("SaveBitmapToFile failed\n");
    }

    // Free
    SelectObject(hMemoryDC, hOldBitmap);
    DeleteObject(hBitmap);
    DeleteDC(hMemoryDC);
    ReleaseDC(NULL, hScreenDC);

    return r;
}