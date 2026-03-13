import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import config from '../config';
import logger from '../utils/logger';

class AnthropicService {
    private baseURL: string;

    constructor() {
        this.baseURL = config.anthropic.baseUrl;
    }

    async proxyRequest(path: string, method: string, headers: any, body: any) {
        try {
            const anthropicApiKey = headers['x-api-key'];

            const forwardHeaders = { ...headers };

            delete forwardHeaders.host;
            delete forwardHeaders['content-length'];
            delete forwardHeaders['proxy-api-key'];

            if (!forwardHeaders['anthropic-version']) {
                forwardHeaders['anthropic-version'] = '2023-06-01';
            }

            if (!forwardHeaders['content-type']) {
                forwardHeaders['content-type'] = 'application/json';
            }
            if (config.anthropic.realToken) {
                forwardHeaders['x-api-key'] = config.anthropic.realToken
            }

            logger.debug('Anthropic API请求配置:', {
                method,
                path,
                hasApiKey: !!anthropicApiKey,
                anthropicVersion: forwardHeaders['anthropic-version'],
                contentType: forwardHeaders['content-type'],
                bodyFields: body ? Object.keys(body) : []
            });

            const requestConfig: AxiosRequestConfig = {
                method: method as any,
                url: this.baseURL + path,
                headers: forwardHeaders,
                data: method !== 'GET' ? body : undefined,
                params: method === 'GET' ? body : undefined,
                responseType: 'stream',
            };

            logger.debug(`Proxying request to Anthropic API: ${method} ${path}`);
            return await axios.request(requestConfig);
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;

                if (axiosError.response) {
                    logger.error('Anthropic API 返回错误:', {
                        status: axiosError.response.status,
                        statusText: axiosError.response.statusText,
                        method,
                        path,
                        responseData: axiosError.response.data
                    });
                } else if (axiosError.request) {
                    logger.error('未收到Anthropic API响应:', {
                        method,
                        path,
                        request: axiosError.request,
                        message: axiosError.message
                    });
                } else {
                    logger.error('Anthropic API请求配置错误:', {
                        method,
                        path,
                        message: axiosError.message
                    });
                }
            } else {
                logger.error('调用Anthropic API时出现非HTTP错误:', {
                    method,
                    path,
                    errorType: error.constructor.name,
                    message: error.message,
                    stack: error.stack
                });
            }

            throw error;
        }
    }
}

export default new AnthropicService();
