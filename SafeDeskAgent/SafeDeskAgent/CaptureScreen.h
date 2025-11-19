#pragma once
#define _CRT_SECURE_NO_WARNINGS
#include <Windows.h>

#pragma pack(push, 1)
typedef struct {
    BITMAPFILEHEADER fileHeader;
    BITMAPINFOHEADER infoHeader;
} BMPHeader;
#pragma pack(pop)

int SaveBitmapToFile(HBITMAP hBitmap, HDC hDC, char* filename);
int CaptureScreen(const char* fileName);
