type WorkerActionCallback = (payload: any, reply: (payload: Record<string, any>) => void) => void;
export declare class WorkerClient {
    worker: Worker;
    actionTable: Record<string, (rxPayload: any) => void>;
    constructor(worker: Worker, actions: Record<string, WorkerActionCallback>);
    addActions: (actions: Record<string, WorkerActionCallback>) => void;
    sendMessage: (action: string, payload?: Record<string, any>, transfer?: any) => Promise<void>;
    fetch: (action: string, txPayload?: Record<string, any>) => Promise<Record<string, unknown>>;
}
export {};
