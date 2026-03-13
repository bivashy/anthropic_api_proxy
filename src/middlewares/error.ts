import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface ExtendedError extends Error {
    originalError?: any;
    requestInfo?: {
        path: string;
        method: string;
    };
    statusCode?: number;
}

export const errorHandler = (
    err: ExtendedError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const sanitizedReq = {
        method: req.method,
        url: req.url,
        path: req.path,
        query: req.query,
    };

    const statusCode = err.statusCode || 500;

    const errorDetails = {
        errorName: err.name,
        errorMessage: err.message,
        errorStack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        requestInfo: err.requestInfo || sanitizedReq,
        timestamp: new Date().toISOString(),
    };

    logger.error(`API错误 [${statusCode}]: ${err.message}`, errorDetails);

    res.status(statusCode).json({
        error: statusCode === 500 ? 'Internal Server Error' : err.name || 'Error',
        message: process.env.NODE_ENV === 'development' ? err.message : '处理请求时发生错误',
        requestId: req.headers['x-request-id'] || undefined,
        timestamp: new Date().toISOString(),
        path: req.path,
    });
};
