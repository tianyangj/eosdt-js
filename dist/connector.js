"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eosjs_jssig_1 = __importDefault(require("eosjs/dist/eosjs-jssig"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const eosjs_1 = require("eosjs");
const _1 = require(".");
const text_encoding_1 = require("text-encoding");
const positions_1 = require("./positions");
class EosdtConnector {
    constructor(nodeAddress, privateKeys) {
        const fetch = node_fetch_1.default; // Workaroung to avoid incompatibility of fetch types in 'eosjs' and 'node-fetch'
        this.rpc = new eosjs_1.JsonRpc(nodeAddress, { fetch });
        const signatureProvider = new eosjs_jssig_1.default(privateKeys);
        this.api = new eosjs_1.Api({
            rpc: this.rpc, signatureProvider, textDecoder: new text_encoding_1.TextDecoder(), textEncoder: new text_encoding_1.TextEncoder(),
        });
    }
    getPositions() {
        return new positions_1.PositionsContract(this);
    }
    getLiquidator() {
        return new _1.LiquidatorContract(this);
    }
    getGovernance() {
        return new _1.GovernanceContract(this);
    }
}
exports.EosdtConnector = EosdtConnector;
