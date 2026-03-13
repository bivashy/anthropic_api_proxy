import { NextFunction, Request, Response } from 'express';
import anthropicService from '../services/anthropic';
import logger from '../utils/logger';

export const proxyRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const originalPath = req.path;
        const fullPath = `/v1${originalPath}`;
        const method = req.method;
        const hasApiKey = !!req.headers['x-api-key'];

        logger.info(`API: ${method} ${fullPath}`, {
            originalPath,
            fullPath,
            method,
            hasApiKey,
            hasAnthropicVersion: !!req.headers['anthropic-version'],
            contentType: req.headers['content-type'],
            bodySize: req.body ? JSON.stringify(req.body).length : 0
        });

        const response = await anthropicService.proxyRequest(
            fullPath,
            method,
            req.headers,
            req.body
        );


        Object.entries(response.headers).forEach(([key, value]) => {
            if (value !== undefined && key !== 'x-api-key') {
                res.setHeader(key, value as string);
            }
        });

        res.status(response.status);

        logger.info(`Pre sending request: ${method} ${fullPath}`, {
            status: response.status,
            originalPath,
            fullPath,
            method
        });

        response.data.pipe(res);
    } catch (error: any) {
        if (error.response) {
            const { status, headers, data } = error.response;

            logger.warn(`Anthropic API返回错误状态码: ${status}`, {
                status,
                path: req.path,
                fullPath: `/v1${req.path}`,
                method: req.method
            });

            Object.entries(headers).forEach(([key, value]) => {
                if (value !== undefined) {
                    res.setHeader(key, value as string);
                }
            });

            res.status(status);

            if (data && typeof data.pipe === 'function') {
                data.pipe(res);
            } else {
                res.json(data);
            }
        } else {
            const errorDetails = {
                path: req.path,
                fullPath: `/v1${req.path}`,
                method: req.method,
                errorName: error.name || '未知错误',
                errorMessage: error.message || '未提供错误消息',
                stack: error.stack
            };

            logger.error('代理请求时发生错误:', errorDetails);

            const enhancedError = new Error(`代理请求失败: ${error.message}`);
            (enhancedError as any).originalError = error;
            (enhancedError as any).requestInfo = {
                path: req.path,
                fullPath: `/v1${req.path}`,
                method: req.method
            };

            next(enhancedError);
        }
    }
};
