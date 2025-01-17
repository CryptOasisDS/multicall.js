/// <reference types="node"/>

declare module '@wonderwall/multicall' {
  import { BigNumber } from 'bignumber.js';

  export interface IConfig {
    interval?: number;
    staleBlockRetryWait?: number;
    errorRetryWait?: number;
  }

  export interface IPresetConfig extends IConfig {
    preset: 'ethereum' | 'kovan' | 'rinkeby' | 'goerli' | 'xdai' | 'ropsten' | 'bsc';
  }

  export interface ICustomConfig extends IConfig {
    rpcUrl: string;
    multicallAddress: string;
  }

  export interface IPostProcess {
    (v: any): any;
  }

  export interface ICall {
    target: string;
    call: string | (string | number | boolean)[];
    returns: (string | IPostProcess)[][];
  }

  export interface IArgumentsMapping {
    [key: string]: string[];
  }

  export interface IKeysValues {
    [key: string]: any;
  }

  export interface IResult {
    blockNumber: BigNumber;
    blockHash: string;
    original: IKeysValues;
    transformed: IKeysValues;
    keyToArgMap: IArgumentsMapping;
  }

  export interface IResponse {
    results: IResult;
  }

  export interface IUpdate {
    type: string;
    value: any;
    args: any[];
  }

  export interface ISubscription {
    unsub(): void;
  }

  export interface ISubscriber {
    subscribe(callback: (updates: IUpdate[]) => void): ISubscription;
  }

  export interface IPollData {
    id: number;
    latestBlockNumber: number;
    retry?: number;
  }

  export interface IState {
    model: Partial<ICall>[];
    store: IKeysValues;
    storeTransformed: IKeysValues;
    keyToArgMap: IKeysValues;
    latestPromiseId: number;
    latestBlockNumber: number | null;
    id: number;
    listeners: {
      subscribe: any[];
      block: any[];
      poll: any[];
      error: any[];
    };
    handler: any | null;
    wsReconnectHandler: any | null;
    watching: boolean;
    config: IPresetConfig | ICustomConfig;
    ws: WebSocket | null;
  }

  export interface IWatcher {
    initialFetch: Promise<void>;

    schemas: Partial<ICall>[];

    tap(callback: (calls: Partial<ICall>[]) => Partial<ICall>[]): Promise<undefined>;

    poll(): Promise<void>;

    subscribe(callback: (update: IUpdate) => void): ISubscriber;

    batch(): ISubscriber;

    onNewBlock(callback: (blockNumber: number) => void): ISubscription;

    onPoll(callback: (pollData: IPollData) => void): ISubscription;

    onError(callback: (error: Error, state: IState) => void): ISubscription;

    recreate(calls: Partial<ICall>[], config: IPresetConfig | ICustomConfig): Promise<undefined>;

    start(): Promise<undefined>;

    stop(): undefined;

    awaitInitialFetch(): Promise<undefined>;
  }

  export function aggregate(calls: Partial<ICall>[], requireSuccess: boolean, config: IPresetConfig | ICustomConfig): Promise<IResponse>;

  export function createWatcher(calls: Partial<ICall>[], requireSuccess: boolean, config: IPresetConfig | ICustomConfig): IWatcher;
}
