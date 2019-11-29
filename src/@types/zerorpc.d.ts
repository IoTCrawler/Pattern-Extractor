/* eslint-disable */

type func = (...args: any[]) => any;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

type Callback<T> = (T extends any[] ? (((err: undefined, res: T, more: true) => void) | (((err: undefined, res: undefined, more: false) => void)))
    : (err: undefined, res: T, more: false) => void)
    | ((err: Error, res: undefined, more: false) => void);
type Arg<P extends Array<any>, T> = P extends [infer P1] ? [P1, Callback<T>?]
    : P extends [infer P1, infer P2] ? [P1, P2, Callback<T>?]
    : P extends [infer P1, infer P2, infer P3] ? [P1, P2, P3, Callback<T>?]
    : P extends [infer P1, infer P2, infer P3, infer P4] ? [P1, P2, P3, P4, Callback<T>?]
    : P extends [infer P1, infer P2, infer P3, infer P4, infer P5] ? [P1, P2, P3, P4, P5, Callback<T>?]
    : P extends [infer P1, infer P2, infer P3, infer P4, infer P5, infer P6] ? [P1, P2, P3, P4, P5, P6, Callback<T>?]
    : P extends [infer P1, infer P2, infer P3, infer P4, infer P5, infer P6, infer P7] ? [P1, P2, P3, P4, P5, P6, P7, Callback<T>?]
    : P extends [infer P1, infer P2, infer P3, infer P4, infer P5, infer P6, infer P7, infer P8] ? [P1, P2, P3, P4, P5, P6, P7, P8, Callback<T>?]
    : never;
type Method<K extends keyof any, T extends func, P extends Array<any> = Parameters<T>> = (method: K, ...args: Arg<P, ReturnType<T>>) => void
type Invoke<C, K extends keyof any, T extends func, M extends func = Method<K, T>> = M & ((options: C, ...args: Parameters<M>) => ReturnType<M>);

type Rpc<T, C> = { [K in keyof T]: T[K] extends func ? Invoke<C, K, T[K]> : never };

declare module 'zerorpc' {
    import * as events from 'events'

    export interface ClientOptions {
        heartbeatInterval: number;
        timeout: number;
    }

    export interface CallbackOptions {
        timeout: string;
    }

    export class Client<T, R = Rpc<T, CallbackOptions>> extends events.EventEmitter {
        constructor(options?: ClientOptions);

        public bind(endpoint: string): void;
        public connect(endpoint: string): void;
        public close(linger?: boolean): void;
        public closed(): boolean;

        public readonly invoke: UnionToIntersection<R[keyof R]>;
    }

    export class Server<T> extends events.EventEmitter {
        constructor(context: T, heartbeat?: number);

        public bind(endpoint: string): void;
        public connect(endpoint: string): void;
        public close(): void;
        public closed(): boolean;
    }
}

/* eslint-enable */