import winston from 'winston';
import config from '../config';
import util from 'util';

const formatObject = (obj: any): string => {
    if (obj === null) return 'null';
    if (obj === undefined) return 'undefined';
    if (typeof obj === 'object') {
        try {
            return util.inspect(obj, { depth: 4, colors: false, maxArrayLength: 10 });
        } catch (err) {
            return String(obj);
        }
    }
    return String(obj);
};

const sanitizeLogFormat = winston.format((info) => {
    if (info.headers && typeof info.headers === 'object') {
        const sanitizedHeaders: Record<string, any> = { ...info.headers };
        delete sanitizedHeaders['x-api-key'];
        delete sanitizedHeaders['authorization'];
        info.headers = sanitizedHeaders;
    }

    if (info.body && typeof info.body === 'object') {
        const sanitizedBody: Record<string, any> = { ...info.body };
        delete sanitizedBody.api_key;
        info.body = sanitizedBody;
    }

    if (info.error && typeof info.error === 'object') {
        if (info.error instanceof Error) {
            info.errorMessage = info.error.message;
            info.errorStack = info.error.stack;
            info.errorName = info.error.name;
        } else {
            info.errorDetails = formatObject(info.error);
        }
        delete info.error;
    }

    return info;
});

const objectFormat = winston.format((info) => {
    const args = info[Symbol.for('splat')];

    if (args && Array.isArray(args) && args.length > 0) {
        info.message = `${info.message} ${args.map(formatObject).join(' ')}`;
    }

    return info;
});

const logger = winston.createLogger({
    level: config.server.env === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
        objectFormat(),
        sanitizeLogFormat(),
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

export default logger;
