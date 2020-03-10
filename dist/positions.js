"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class PositionsContract {
    constructor(connector) {
        this.contractName = "eosdtcntract";
        this.tokenSymbol = "EOS";
        this.tokenContract = "eosio.token";
        this.decimals = 4;
        this.rpc = connector.rpc;
        this.api = connector.api;
    }
    create(accountName, collatAmount, eosdtAmount, transactionParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const trxParams = utils_1.setTransactionParams(transactionParams);
            const authorization = [{ actor: accountName, permission: trxParams.permission }];
            // Creates a new empty position
            const actions = [];
            actions.push({
                account: this.contractName,
                name: "positionadd",
                authorization,
                data: { maker: accountName }
            });
            // Sends collateral and generates EOSDT if collatAmount > 0
            if (typeof collatAmount === "string")
                collatAmount = parseFloat(collatAmount);
            if (collatAmount > 0) {
                const collatAssetString = utils_1.amountToAssetString(collatAmount, this.tokenSymbol, this.decimals);
                const eosdtAssetString = utils_1.amountToAssetString(eosdtAmount, "EOSDT");
                actions.push({
                    account: this.tokenContract,
                    name: "transfer",
                    authorization,
                    data: {
                        from: accountName,
                        to: this.contractName,
                        quantity: collatAssetString,
                        memo: eosdtAssetString
                    }
                });
            }
            const receipt = yield this.api.transact({ actions }, {
                blocksBehind: trxParams.blocksBehind,
                expireSeconds: trxParams.expireSeconds
            });
            return receipt;
        });
    }
    createWithReferral(accountName, collatAmount, eosdtAmount, referralId, transactionParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const trxParams = utils_1.setTransactionParams(transactionParams);
            const authorization = [{ actor: accountName, permission: trxParams.permission }];
            // Creates a new empty position
            const actions = [];
            actions.push({
                account: this.contractName,
                name: "posandrefadd",
                authorization,
                data: {
                    referral_id: referralId,
                    maker: accountName
                }
            });
            // Sends collateral and generates EOSDT if collatAmount > 0
            if (typeof collatAmount === "string")
                collatAmount = parseFloat(collatAmount);
            if (collatAmount > 0) {
                const collatAssetString = utils_1.amountToAssetString(collatAmount, this.tokenSymbol, this.decimals);
                if (typeof eosdtAmount === "string")
                    eosdtAmount = parseFloat(eosdtAmount);
                const eosdtAssetString = utils_1.amountToAssetString(eosdtAmount, "EOSDT");
                actions.push({
                    account: this.tokenContract,
                    name: "transfer",
                    authorization,
                    data: {
                        from: accountName,
                        to: this.contractName,
                        quantity: collatAssetString,
                        memo: eosdtAssetString
                    }
                });
            }
            const receipt = yield this.api.transact({ actions }, {
                blocksBehind: trxParams.blocksBehind,
                expireSeconds: trxParams.expireSeconds
            });
            return receipt;
        });
    }
    createInThreeActions(accountName, collatAmount, eosdtAmount, referralId, transactionParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const trxParams = utils_1.setTransactionParams(transactionParams);
            const authorization = [{ actor: accountName, permission: trxParams.permission }];
            let createPosAction;
            if (referralId) {
                createPosAction = {
                    account: this.contractName,
                    name: "posandrefadd",
                    authorization,
                    data: {
                        referral_id: referralId,
                        maker: accountName
                    }
                };
            }
            else {
                createPosAction = {
                    account: this.contractName,
                    name: "positionadd",
                    authorization,
                    data: { maker: accountName }
                };
            }
            // Creating position and getting it's ID
            const creationReceipt = yield this.api.transact({ actions: [createPosAction] }, {
                blocksBehind: trxParams.blocksBehind,
                expireSeconds: trxParams.expireSeconds
            });
            const position = yield this.getLatestUserPosition(accountName);
            if (!position)
                throw new Error(`Couldn't find position for user ${accountName}`);
            const positionId = position.position_id;
            const actions = [];
            // Sends collateral and generates EOSDT if collatAmount > 0
            if (typeof collatAmount === "string")
                collatAmount = parseFloat(collatAmount);
            if (collatAmount > 0) {
                const collatAssetString = utils_1.amountToAssetString(collatAmount, this.tokenSymbol, this.decimals);
                actions.push({
                    account: this.tokenContract,
                    name: "transfer",
                    authorization,
                    data: {
                        from: accountName,
                        to: this.contractName,
                        quantity: collatAssetString,
                        memo: `position_id:${positionId}`
                    }
                });
            }
            if (typeof eosdtAmount === "string")
                eosdtAmount = parseFloat(eosdtAmount);
            if (eosdtAmount > 0) {
                const eosdtAssetString = utils_1.amountToAssetString(eosdtAmount, "EOSDT");
                actions.push({
                    account: this.contractName,
                    name: "debtgenerate",
                    authorization,
                    data: {
                        debt: eosdtAssetString,
                        position_id: positionId
                    }
                });
            }
            const receipt = yield this.api.transact({ actions }, {
                blocksBehind: trxParams.blocksBehind,
                expireSeconds: trxParams.expireSeconds
            });
            return [creationReceipt, receipt];
        });
    }
    close(senderAccount, positionId, transactionParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const trxParams = utils_1.setTransactionParams(transactionParams);
            const authorization = [{ actor: senderAccount, permission: trxParams.permission }];
            const receipt = yield this.api.transact({
                actions: [
                    {
                        account: this.contractName,
                        name: "close",
                        authorization,
                        data: { position_id: positionId }
                    }
                ]
            }, {
                blocksBehind: trxParams.blocksBehind,
                expireSeconds: trxParams.expireSeconds
            });
            return receipt;
        });
    }
    del(creator, positionId, transactionParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const trxParams = utils_1.setTransactionParams(transactionParams);
            const authorization = [{ actor: creator, permission: trxParams.permission }];
            const receipt = yield this.api.transact({
                actions: [
                    {
                        account: this.contractName,
                        name: "positiondel",
                        authorization,
                        data: { position_id: positionId }
                    }
                ]
            }, {
                blocksBehind: trxParams.blocksBehind,
                expireSeconds: trxParams.expireSeconds
            });
            return receipt;
        });
    }
    give(giverAccount, receiver, positionId, transactionParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const trxParams = utils_1.setTransactionParams(transactionParams);
            const authorization = [{ actor: giverAccount, permission: trxParams.permission }];
            const receipt = yield this.api.transact({
                actions: [
                    {
                        account: this.contractName,
                        name: "positiongive",
                        authorization,
                        data: {
                            position_id: positionId,
                            to: receiver
                        }
                    }
                ]
            }, {
                blocksBehind: trxParams.blocksBehind,
                expireSeconds: trxParams.expireSeconds
            });
            return receipt;
        });
    }
    addCollateral(senderName, amount, positionId, transactionParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const collatAssetString = utils_1.amountToAssetString(amount, this.tokenSymbol, this.decimals);
            const trxParams = utils_1.setTransactionParams(transactionParams);
            const authorization = [{ actor: senderName, permission: trxParams.permission }];
            const receipt = yield this.api.transact({
                actions: [
                    {
                        account: this.tokenContract,
                        name: "transfer",
                        authorization,
                        data: {
                            to: this.contractName,
                            from: senderName,
                            maker: senderName,
                            quantity: collatAssetString,
                            memo: `position_id:${positionId}`
                        }
                    }
                ]
            }, {
                blocksBehind: trxParams.blocksBehind,
                expireSeconds: trxParams.expireSeconds
            });
            return receipt;
        });
    }
    deleteCollateral(senderName, amount, positionId, transactionParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const collatAssetString = utils_1.amountToAssetString(amount, this.tokenSymbol, this.decimals);
            const trxParams = utils_1.setTransactionParams(transactionParams);
            const authorization = [{ actor: senderName, permission: trxParams.permission }];
            const receipt = yield this.api.transact({
                actions: [
                    {
                        account: this.contractName,
                        name: "colateraldel",
                        authorization,
                        data: {
                            position_id: positionId,
                            collateral: collatAssetString
                        }
                    }
                ]
            }, {
                blocksBehind: trxParams.blocksBehind,
                expireSeconds: trxParams.expireSeconds
            });
            return receipt;
        });
    }
    generateDebt(senderName, amount, positionId, transactionParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const eosdtAssetString = utils_1.amountToAssetString(amount, "EOSDT");
            const trxParams = utils_1.setTransactionParams(transactionParams);
            const authorization = [{ actor: senderName, permission: trxParams.permission }];
            const receipt = yield this.api.transact({
                actions: [
                    {
                        account: this.contractName,
                        name: "debtgenerate",
                        authorization,
                        data: {
                            debt: eosdtAssetString,
                            position_id: positionId
                        }
                    }
                ]
            }, {
                blocksBehind: trxParams.blocksBehind,
                expireSeconds: trxParams.expireSeconds
            });
            return receipt;
        });
    }
    burnbackDebt(senderName, amount, positionId, transactionParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const eosdtAssetString = utils_1.amountToAssetString(amount, "EOSDT");
            const trxParams = utils_1.setTransactionParams(transactionParams);
            const authorization = [{ actor: senderName, permission: trxParams.permission }];
            const receipt = yield this.api.transact({
                actions: [
                    {
                        account: "eosdtsttoken",
                        name: "transfer",
                        authorization,
                        data: {
                            to: this.contractName,
                            from: senderName,
                            maker: senderName,
                            quantity: eosdtAssetString,
                            memo: `position_id:${positionId}`
                        }
                    }
                ]
            }, {
                blocksBehind: trxParams.blocksBehind,
                expireSeconds: trxParams.expireSeconds
            });
            return receipt;
        });
    }
    marginCall(senderName, positionId, transactionParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const trxParams = utils_1.setTransactionParams(transactionParams);
            const authorization = [{ actor: senderName, permission: trxParams.permission }];
            const receipt = yield this.api.transact({
                actions: [
                    {
                        account: this.contractName,
                        name: "margincall",
                        authorization,
                        data: {
                            position_id: positionId
                        }
                    }
                ]
            }, {
                blocksBehind: trxParams.blocksBehind,
                expireSeconds: trxParams.expireSeconds
            });
            return receipt;
        });
    }
    getContractTokenAmount() {
        return __awaiter(this, void 0, void 0, function* () {
            const balance = yield this.rpc.get_currency_balance(this.tokenContract, this.contractName, this.tokenSymbol);
            return utils_1.balanceToNumber(balance);
        });
    }
    /* @deprecated */
    getContractEosAmount() {
        return __awaiter(this, void 0, void 0, function* () {
            const balance = yield this.rpc.get_currency_balance("eosio.token", "eosdtcntract", "EOS");
            return utils_1.balanceToNumber(balance);
        });
    }
    /* @deprecated */
    getRates() {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.rpc.get_table_rows({
                code: "eosdtorclize",
                scope: "eosdtorclize",
                table: "orarates",
                json: true,
                limit: 1000
            });
            return table.rows;
        });
    }
    getRelativeRates() {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.rpc.get_table_rows({
                code: "eosdtorclize",
                scope: "eosdtorclize",
                table: "oraclerates",
                json: true,
                limit: 1000
            });
            return table.rows;
        });
    }
    getPositionById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.rpc.get_table_rows({
                code: this.contractName,
                scope: this.contractName,
                table: "positions",
                table_key: "position_id",
                lower_bound: id,
                upper_bound: id
            });
            return table.rows[0];
        });
    }
    getPositionByMaker(maker) {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.rpc.get_table_rows({
                code: this.contractName,
                scope: this.contractName,
                table: "positions",
                json: true,
                limit: 1,
                table_key: "maker",
                index_position: "secondary",
                key_type: "name",
                lower_bound: maker,
                upper_bound: maker
            });
            return table.rows[0];
        });
    }
    getAllUserPositions(maker) {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.rpc.get_table_rows({
                code: this.contractName,
                scope: this.contractName,
                table: "positions",
                limit: 10000,
                table_key: "maker",
                index_position: "secondary",
                key_type: "name",
                lower_bound: maker,
                upper_bound: maker
            });
            return table.rows;
        });
    }
    getParameters() {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.rpc.get_table_rows({
                code: this.contractName,
                scope: this.contractName,
                table: "parameters"
            });
            return table.rows[0];
        });
    }
    getSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.rpc.get_table_rows({
                code: this.contractName,
                scope: this.contractName,
                table: "ctrsettings"
            });
            return table.rows[0];
        });
    }
    addReferral(senderName, nutAmount, transactionParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const nutAssetString = utils_1.amountToAssetString(nutAmount, "NUT");
            const trxParams = utils_1.setTransactionParams(transactionParams);
            const authorization = [{ actor: senderName, permission: trxParams.permission }];
            const receipt = yield this.api.transact({
                actions: [
                    {
                        account: "eosdtnutoken",
                        name: "transfer",
                        authorization,
                        data: {
                            to: this.contractName,
                            from: senderName,
                            quantity: nutAssetString,
                            memo: `referral`
                        }
                    }
                ]
            }, {
                blocksBehind: trxParams.blocksBehind,
                expireSeconds: trxParams.expireSeconds
            });
            return receipt;
        });
    }
    deleteReferral(senderName, referralId, transactionParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const trxParams = utils_1.setTransactionParams(transactionParams);
            const authorization = [{ actor: senderName, permission: trxParams.permission }];
            const receipt = yield this.api.transact({
                actions: [
                    {
                        account: "eosdtcntract",
                        name: "referraldel",
                        authorization,
                        data: { referral_id: referralId }
                    }
                ]
            }, {
                blocksBehind: trxParams.blocksBehind,
                expireSeconds: trxParams.expireSeconds
            });
            return receipt;
        });
    }
    getReferralById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.rpc.get_table_rows({
                code: this.contractName,
                scope: this.contractName,
                table: "ctrreferrals",
                table_key: "referral_id",
                lower_bound: id,
                upper_bound: id
            });
            return table.rows[0];
        });
    }
    getAllReferrals() {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.rpc.get_table_rows({
                code: this.contractName,
                scope: this.contractName,
                table: "ctrreferrals",
                limit: 10000
            });
            return table.rows;
        });
    }
    getReferralByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.getAllReferrals();
            return table.find(row => row.referral === name);
        });
    }
    getPositionReferral(positionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.rpc.get_table_rows({
                code: this.contractName,
                scope: this.contractName,
                table: "positionrefs",
                table_key: "position_id",
                lower_bound: positionId,
                upper_bound: positionId
            });
            return table.rows[0];
        });
    }
    getPositionReferralsTable() {
        return __awaiter(this, void 0, void 0, function* () {
            let lowerBound = 0;
            const limit = 10000;
            function getTablePart(that) {
                return __awaiter(this, void 0, void 0, function* () {
                    return yield that.rpc.get_table_rows({
                        code: that.contractName,
                        scope: that.contractName,
                        table: "positionrefs",
                        lower_bound: lowerBound,
                        limit
                    });
                });
            }
            const firstRequest = yield getTablePart(this);
            const result = firstRequest.rows;
            let more = firstRequest.more;
            while (more) {
                lowerBound = result[result.length - 1].position_id + 1;
                const moreReferrals = yield getTablePart(this);
                result.push(...moreReferrals.rows);
                more = moreReferrals.more;
            }
            return result;
        });
    }
    getAllReferralPositionsIds(referralId) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getPositionReferralsTable())
                .filter(refPos => refPos.referral_id === referralId)
                .map(refInfo => refInfo.position_id);
        });
    }
    getLatestUserPosition(accountName) {
        return __awaiter(this, void 0, void 0, function* () {
            const userPositions = yield this.getAllUserPositions(accountName);
            if (userPositions.length === 0) {
                const logMsg = `${this.getLatestUserPosition.name}(): ` +
                    `user ${accountName} does not have positions`;
                throw new Error(logMsg);
            }
            return userPositions.reduce((a, b) => {
                if (Math.max(a.position_id, b.position_id) === a.position_id)
                    return a;
                else
                    return b;
            });
        });
    }
    getLtvRatiosTable() {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.rpc.get_table_rows({
                code: this.contractName,
                scope: this.contractName,
                table: "ctrltvratios",
                limit: 10000
            });
            return table.rows;
        });
    }
    getPositionLtvRatio(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.rpc.get_table_rows({
                code: this.contractName,
                scope: this.contractName,
                table: "ctrltvratios",
                table_key: "position_id",
                lower_bound: id,
                upper_bound: id
            });
            return table.rows[0];
        });
    }
}
exports.PositionsContract = PositionsContract;
