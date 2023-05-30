"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerClient = void 0;
const txRx_1 = require("../../shared/txRx");
const nanoid_1 = require("nanoid");
class WorkerClient {
    constructor(worker, actions) {
        this.worker = worker;
        this.actionTable = {};
        // addAction = (action: string, callback: WorkerActionCallback) => {
        //     this.on(rxToTx(action), callback)
        // }
        this.addActions = (actions) => {
            for (const [action, callback] of Object.entries(actions)) {
                this.actionTable[(0, txRx_1.rxToTx)(action)] = (rxPayload) => {
                    const reply = (txPayload) => {
                        // Return message
                        console.log("Replying to message with id: ", rxPayload.messageId);
                        this.worker.postMessage({
                            action: rxPayload.messageId,
                            payload: txPayload
                        });
                    };
                    callback(rxPayload, reply);
                };
            }
        };
        this.sendMessage = async (action, payload, transfer) => {
            this.worker.postMessage({ action, payload }, transfer);
        };
        this.fetch = async (action, txPayload) => {
            // YOU LEFT OFF HERE
            const messageId = (0, nanoid_1.nanoid)();
            console.log("MessageID", messageId);
            return new Promise((resolve, reject) => {
                this.actionTable[messageId] = (rxPayload) => {
                    console.log("Received reply with id: ", rxPayload.messageId);
                    resolve(rxPayload.payload);
                };
                this.worker.postMessage({
                    action,
                    messageId,
                    payload: txPayload
                });
            });
        };
        this.addActions(actions);
        this.worker.onmessage = (event) => {
            const { action, messageId, payload } = event.data;
            if (this.actionTable[action]) {
                this.actionTable[action]({ messageId, ...payload });
            }
        };
    }
}
exports.WorkerClient = WorkerClient;
