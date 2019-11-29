import * as zerorpc from 'zerorpc';

export type RpcAsync<T> = {
    [K in keyof T]: T[K] extends (...args: infer P) => infer R ? (...args: P) => Promise<R> : never;
}

export abstract class RpcClient<T> {
    protected readonly client: zerorpc.Client<T>;

    constructor(socket: string) {
        this.client = new zerorpc.Client<T>();
        this.client.connect(socket);
    }

    protected Promisify<P>(invoke: (callback: (err: Error | undefined, res: P | undefined, more: boolean) => void) => void): Promise<P> {
        return new Promise<P>((resolve, reject): void => {
            invoke((err, res, more) => this.Callback(resolve, reject, err, res, more));
        });
    }

    private Callback<P>(resolve: (value?: P | PromiseLike<P> | undefined) => void, reject: (reason?: Error) => void,
        err: Error | undefined, res: P | undefined, _: boolean): void { // eslint-disable-line @typescript-eslint/no-unused-vars
        if (err) {
            reject(err);
            return;
        }

        resolve(res);
    }
}