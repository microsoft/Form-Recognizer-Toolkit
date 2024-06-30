import { Request, Response, NextFunction } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import { readFile, readdir, writeFile, unlink } from "node:fs/promises";

const dataLocation = "./data";

// Get file => /files/:fileName
export const getFile = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const file = await readFile(`${dataLocation}/${req.params.filename}`);
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
    const { params, body } = req;
    try {
        await writeFile(`${dataLocation}/${params.filename}`, body.content);
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
    try {
        await unlink(`${dataLocation}/${req.params.filename}`);
        res.status(204).send();
    } catch (err: any) {
        err.statusCode = 404;
        throw err;
    }
});
