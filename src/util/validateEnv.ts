const { cleanEnv, str, port, bool } = require('envalid'); // eslint-disable-line @typescript-eslint/no-var-requires

type envType = {
    MONGO_USER: string;
    MONGO_PASSWORD: string;
    MONGO_HOST: string;
    MONGO_DB: string;
    PORT: number;

    PATTERN_HOST: string;
    PYTHON_RPC_SOCKET: string;

    ENABLE_AUTH: boolean;

    IDM_HOST: string;
    CPM_HOST: string;

    PATTERN_IDM_USER: string;
    PATTERN_IDM_PASS: string;

    BROKER_HOST: string;

    ENABLE_BATCH_OPERATIONS: boolean;
};

export const env: envType = cleanEnv(process.env, {
    MONGO_USER: str(),
    MONGO_PASSWORD: str({}),
    MONGO_HOST: str({ devDefault: 'localhost:27017' }),
    MONGO_DB: str({ default: 'iotcrawler' }),
    PORT: port({ devDefault: 3000 }),
    PATTERN_HOST: str(),
    PYTHON_RPC_SOCKET: str({devDefault: 'tcp://localhost:4242'}),
    ENABLE_AUTH: bool({ default: true }),
    IDM_HOST: str(),
    CPM_HOST: str(),
    PATTERN_IDM_USER: str(),
    PATTERN_IDM_PASS: str(),
    BROKER_HOST: str(),
    ENABLE_BATCH_OPERATIONS: bool({ default: false }),
} as envType, {
    transformer: (env: envType): envType => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        ...env,
        MONGO_USER: encodeURIComponent(env.MONGO_USER),
        MONGO_PASSWORD: encodeURIComponent(env.MONGO_PASSWORD),
        MONGO_DB: encodeURIComponent(env.MONGO_DB)
    })
});
