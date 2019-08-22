import { Api, JsonRpc } from "eosjs"
import JsSignatureProvider from "eosjs/dist/eosjs-jssig"
import Fetch from "node-fetch"
import { TextDecoder, TextEncoder } from "text-encoding"
import { GovernanceContract, LiquidatorContract } from "."
import { BalanceGetter } from "./balance"
import { PositionsContract } from "./positions"

export class EosdtConnector {
    public readonly rpc: JsonRpc
    public readonly api: Api

    constructor(nodeAddress: string, privateKeys: string[]) {
        const fetch: any = Fetch // Workaroung to avoid incompatibility of fetch types in 'eosjs' and 'node-fetch'
        this.rpc = new JsonRpc(nodeAddress, { fetch })
        const signatureProvider = new JsSignatureProvider(privateKeys)
        this.api = new Api({
            rpc: this.rpc,
            signatureProvider,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder()
        })
    }

    public getPositions(): PositionsContract {
        return new PositionsContract(this)
    }

    public getLiquidator(): LiquidatorContract {
        return new LiquidatorContract(this)
    }

    public getGovernance(): GovernanceContract {
        return new GovernanceContract(this)
    }

    public getBalances(): BalanceGetter {
        return new BalanceGetter(this)
    }
}
