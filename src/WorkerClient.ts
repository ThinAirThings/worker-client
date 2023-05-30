import {rxToTx} from '../../shared/txRx'
import {nanoid} from 'nanoid'

type WorkerActionCallback = (payload: any, reply: (payload: Record<string, any>)=>void)=>void
export class WorkerClient {
    actionTable: Record<string, (rxPayload: any)=>void> = {}
    constructor(public worker: Worker, actions: Record<string, WorkerActionCallback>){
        this.addActions(actions)
        this.worker.onmessage = (event: MessageEvent<{action: string, payload: any}>) => {
            const {action, payload} = event.data
            if (this.actionTable[action]){
                this.actionTable[action](payload)
            } 
        } 
    }
    // addAction = (action: string, callback: WorkerActionCallback) => {
    //     this.on(rxToTx(action), callback)
    // }
    addActions = (actions: Record<string, WorkerActionCallback>) => {
        for (const [action, callback] of Object.entries(actions)){
            this.actionTable[rxToTx(action)]= (rxPayload: {messageId: string}) => {
                const reply = (txPayload: Record<string, any>) => {
                    // Return message
                    console.log("Replying to message with id: ", rxPayload.messageId)
                    this.worker.postMessage( {
                        action: rxPayload.messageId,
                        payload: txPayload
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
        console.log("MessageID",  messageId)
        return new Promise((resolve, reject) => {
            this.actionTable[messageId] = (rxPayload: {messageId: string, payload: Record<string, unknown>}) => {
                console.log("Received reply with id: ", rxPayload.messageId)
                resolve(rxPayload.payload)
            }
            this.worker.postMessage({
                action,
                payload: {
                    messageId,
                    ...txPayload
                }
            })
        })

    }
}