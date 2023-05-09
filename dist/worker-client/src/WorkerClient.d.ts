export declare class WorkerClient {
    worker: Worker;
    actionTable: Record<string, (payload: any) => void>;
    constructor(worker: Worker, actions: Record<string, (payload: any) => void>);
    addAction: (action: string, callback: (payload: any) => void) => void;
    addActions: (actions: Record<string, (payload: any) => void>) => void;
    sendMessage: (action: string, payload: Record<string, any>, transfer?: StructuredSerializeOptions) => Promise<void>;
    private on;
}
