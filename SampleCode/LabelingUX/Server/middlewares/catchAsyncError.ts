import { Request, Response, NextFunction } from "express";

const catchAsyncError =
    (func: (req: Request, res: Response, next: NextFunction) => void) =>
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(func(req, res, next)).catch(next);
    };

export default catchAsyncError;
