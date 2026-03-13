import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    const sanitizedReq = {
        method: req.method,
        url: req.url,
    };

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            ...sanitizedReq,
            status: res.statusCode,
            duration: `${duration}ms`,
        });
    });

    next();
};
