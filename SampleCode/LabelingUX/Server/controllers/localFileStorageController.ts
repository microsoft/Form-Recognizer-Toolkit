import { Request, Response, NextFunction } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import { readFile, readdir, writeFile, unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const dataLocation = resolve("Server/data");

export const getLocalFilePath = (filename: string) => {
    const filePath = resolve(dataLocation, filename);
    if (dirname(filePath) !== dataLocation) {
        const error = new Error("Invalid filename") as Error & { statusCode: number };
        error.statusCode = 400;
        throw error;
    }
    return filePath;
};

// Get file => /files/:fileName
export const getFile = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const filePath = getLocalFilePath(req.params.filename);
    try {
        const file = await readFile(filePath);
        res.send(file);
    } catch (err: any) {
        err.statusCode = 404;
        throw err;
    }
});

// Get file => /files
export const listFiles = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const files = await readdir(dataLocation);
        res.send(files);
    } catch (err: any) {
        err.statusCode = 404;
        throw err;
    }
});

// Put file => /files/:fileName
export const uploadFile = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const filePath = getLocalFilePath(req.params.filename);
    try {
        await writeFile(filePath, req.body.content);
        res.status(201).send({
            success: true,
        });
    } catch (err: any) {
        err.statusCode = 404;
        throw err;
    }
});

// Delete file => /files/:fileName
export const deleteFile = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const filePath = getLocalFilePath(req.params.filename);
    try {
        await unlink(filePath);
        res.status(204).send();
    } catch (err: any) {
        err.statusCode = 404;
        throw err;
    }
});
