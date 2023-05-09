import {rxToTx} from '../../shared/txRx'

export class WorkerClient {
    actionTable: Record<string, (payload: any)=>void> = {}
    constructor(public worker: Worker, actions: Record<string, (payload: any)=>void>){
        this.addActions(actions)
        this.worker.onmessage = (event: MessageEvent<{action: string, payload: any}>) => {
            const {action, payload} = event.data
            if (this.actionTable[action]){
                this.actionTable[action](payload)
            } 
        } 
    }
    addAction = (action: string, callback: (payload: any)=>void) => {
        this.on(rxToTx(action), callback)
    }

    addActions = (actions: Record<string, (payload: any)=>void>) => {
        for (const [action, callback] of Object.entries(actions)){
            this.on(rxToTx(action), callback)
        }
    }
    sendMessage = async (action: string, payload: Record<string, any>, transfer?: any) => {
        this.worker.postMessage({action, payload}, transfer)
    }
    private on = (action: string, callback: (payload: any)=>void) => {
        this.actionTable[action] = callback
    }
}