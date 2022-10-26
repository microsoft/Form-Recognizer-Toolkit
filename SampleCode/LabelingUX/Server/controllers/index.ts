import fs from "fs";
import { Request, Response, NextFunction } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";

export const getServerConnection = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const success = fs.existsSync("/");
    res.status(200).json({
        success,
    });
});
