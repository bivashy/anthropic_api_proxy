import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export default {
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development',
    },
    anthropic: {
        baseUrl: process.env.ANTHROPIC_API_BASE_URL || 'https://api.anthropic.com',
        realToken: process.env.ORIGINAL_API_KEY
    },
    auth: {
        proxyApiKey: process.env.PROXY_API_KEY,
    },
};
