import { Request, Response, NextFunction } from "express";

const errors = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 404;

    res.status(err.statusCode).json({
        success: false,
        error: err,
        errMessage: err.message,
        stack: err.stack,
    });
};

export default errors;
