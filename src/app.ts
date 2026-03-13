import express, { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authMiddleware, validateAnthropicApiKey } from './middlewares/auth';
import { loggingMiddleware } from './middlewares/logging';
import { errorHandler } from './middlewares/error';
import { proxyRequest } from './controllers/proxy';
import config from './config';
import logger from './utils/logger';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(loggingMiddleware as RequestHandler);
app.use(authMiddleware as RequestHandler);

app.use('/v1', validateAnthropicApiKey as RequestHandler, proxyRequest as RequestHandler);

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

app.use(errorHandler as ErrorRequestHandler);

const PORT = config.server.port;
app.listen(PORT, () => {
    logger.info(`Anthropic API Proxy server running on port ${PORT}`);
});

export default app;
