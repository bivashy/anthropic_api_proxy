import { Request, Response, NextFunction } from 'express';
import config from '../config';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (!config.auth.proxyApiKey) {
        return next();
    }

    const proxyApiKey = req.headers['x-api-key'];

    if (!proxyApiKey || proxyApiKey !== config.auth.proxyApiKey) {
        return res.status(401).json({ error: 'Unauthorized: Invalid proxy API key' });
    }

    next();
};

export const validateAnthropicApiKey = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Missing Anthropic API key. Please provide it in the x-api-key header.'
        });
    }

    next();
};
