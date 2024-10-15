// src/WorkerClient.ts
import { rxToTx } from "@thinairthings/txrx";
import { nanoid } from "nanoid";
var WorkerClient = class {
  constructor(worker, actions) {
    this.worker = worker;
    this.addActions(actions);
    this.worker.onmessage = (event) => {
      const { action, messageId, payload } = event.data;
      if (this.actionTable[action]) {
        this.actionTable[action]({ messageId, ...payload });
      }
    };
  }
  actionTable = {};
  addActions = (actions) => {
    for (const [action, callback] of Object.entries(actions)) {
      this.actionTable[rxToTx(action)] = (rxPayload) => {
        const reply = (txPayload) => {
          this.worker.postMessage({
            action: rxPayload.messageId,
            payload: { messageId: rxPayload.messageId, ...txPayload }
          });
        };
        callback(rxPayload, reply);
      };
    }
  };
  sendMessage = async (action, payload, transfer) => {
    this.worker.postMessage({ action, payload }, transfer);
  };
  fetch = async (action, txPayload) => {
    const messageId = nanoid();
    return new Promise((resolve, reject) => {
      this.actionTable[messageId] = (rxPayload) => {
        resolve(rxPayload);
      };
      this.worker.postMessage({
        action,
        messageId,
        payload: txPayload
      });
    });
  };
  cleanup = () => {
    if (this.worker instanceof Worker) {
      this.worker.terminate();
      return;
    }
    if (this.worker instanceof MessagePort) {
      this.worker.close();
      return;
    }
  };
};
export {
  WorkerClient
};
//# sourceMappingURL=index.js.map