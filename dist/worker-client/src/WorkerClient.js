"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerClient = void 0;
const txRx_1 = require("../../shared/txRx");
class WorkerClient {
    constructor(worker, actions) {
        this.worker = worker;
        this.actionTable = {};
        this.addAction = (action, callback) => {
            this.on((0, txRx_1.rxToTx)(action), callback);
        };
        this.addActions = (actions) => {
            for (const [action, callback] of Object.entries(actions)) {
                this.on((0, txRx_1.rxToTx)(action), callback);
            }
        };
        this.sendMessage = async (action, payload, transfer) => {
            this.worker.postMessage({ action, payload }, transfer);
        };
        this.on = (action, callback) => {
            this.actionTable[action] = callback;
        };
        this.addActions(actions);
        this.worker.onmessage = (event) => {
            const { action, payload } = event.data;
            if (this.actionTable[action]) {
                this.actionTable[action](payload);
            }
        };
    }
}
exports.WorkerClient = WorkerClient;
