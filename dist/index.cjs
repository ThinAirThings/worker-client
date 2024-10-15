"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  WorkerClient: () => WorkerClient
});
module.exports = __toCommonJS(src_exports);

// src/WorkerClient.ts
var import_txrx = require("@thinairthings/txrx");
var import_nanoid = require("nanoid");
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
      this.actionTable[(0, import_txrx.rxToTx)(action)] = (rxPayload) => {
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
    const messageId = (0, import_nanoid.nanoid)();
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WorkerClient
});
//# sourceMappingURL=index.cjs.map