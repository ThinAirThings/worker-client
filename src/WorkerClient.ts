import { rxToTx } from '@thinairthings/txrx'
import {nanoid} from 'nanoid'

type WorkerActionCallback = (payload: any, reply: (payload: Record<string, any>)=>void)=>void
export class WorkerClient {
    actionTable: Record<string, (rxPayload: any)=>void> = {}
    constructor(public worker: Worker | MessagePort, actions: Record<string, WorkerActionCallback>){
        this.addActions(actions)
        this.worker.onmessage = (event: MessageEvent<{action: string, messageId?:string, payload: any}>) => {
            const {action, messageId, payload} = event.data
            if (this.actionTable[action]){
                this.actionTable[action]({messageId, ...payload})
            } 
        } 
    }
    addActions = (actions: Record<string, WorkerActionCallback>) => {
        for (const [action, callback] of Object.entries(actions)){
            this.actionTable[rxToTx(action)]= (rxPayload: {messageId: string}) => {
                const reply = (txPayload: Record<string, any>) => {
                    // Return message
                    this.worker.postMessage( {
                        action: rxPayload.messageId,
                        payload: {messageId: rxPayload.messageId, ...txPayload}
                    })
                }
                callback(rxPayload, reply)
            }
        }
    }
    sendMessage = async (action: string, payload?: Record<string, any>, transfer?: any) => {
        this.worker.postMessage({action, payload}, transfer)
    }
    fetch = async (
        action: string,
        txPayload?: Record<string, any>,
    ): Promise<Record<string, unknown>> => {
        // YOU LEFT OFF HERE
        const messageId = nanoid()
        return new Promise((resolve, reject) => {
            this.actionTable[messageId] = (rxPayload: {messageId: string, payload: Record<string, unknown>}) => {
                resolve(rxPayload)
            }
            this.worker.postMessage({
                action,
                messageId,
                payload: txPayload
            })
        })

    }
    cleanup = () => {
        if (this.worker instanceof Worker) {
            this.worker.terminate()
            return
        }
        if (this.worker instanceof MessagePort) {
            this.worker.close()
            return
        }
    }
}