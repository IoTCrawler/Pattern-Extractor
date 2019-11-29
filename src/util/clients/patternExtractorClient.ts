import { env } from '../validateEnv'
import { RpcClient, RpcAsync } from '../rpcClient';

interface PatternExtractor {
    clusterize(model: Buffer, sample: number[][]): number[];
    startTraining(data: number[][]): string;
    getTrainedModel(modelFile: string): Buffer;
}

class PatternExtractorClient extends RpcClient<PatternExtractor> implements RpcAsync<PatternExtractor> {
    constructor(socket: string) {
        super(socket);
    }

    public async clusterize(model: Buffer, sample: number[][]): Promise<number[]> {
        return await this.Promisify(callback => this.client.invoke('clusterize', model, sample, callback));
    }

    public async startTraining(data: number[][]): Promise<string> {
        return await this.Promisify(callback => this.client.invoke('startTraining', data, callback));
    }

    public async getTrainedModel(modelFile: string): Promise<Buffer> {
        return await this.Promisify(callback => this.client.invoke('getTrainedModel', modelFile, callback));
    }
}

export const PatternExtractor = new PatternExtractorClient(env.PYTHON_RPC_SOCKET);