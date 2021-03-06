import { EosdtConnectorInterface } from "./interfaces/connector";
import { EosdtContractParameters, EosdtContractSettings, EosdtPosition, LtvRatios, PositionReferral, Referral, TokenRate } from "./interfaces/positions-contract";
import { ITrxParamsArgument } from "./interfaces/transaction";
export declare class PositionsContract {
    protected contractName: string;
    protected tokenSymbol: string;
    protected tokenContract: string;
    protected decimals: number;
    private rpc;
    private api;
    constructor(connector: EosdtConnectorInterface);
    create(accountName: string, collatAmount: string | number, eosdtAmount: string | number, transactionParams?: ITrxParamsArgument): Promise<any>;
    createWithReferral(accountName: string, collatAmount: string | number, eosdtAmount: string | number, referralId: number, transactionParams?: ITrxParamsArgument): Promise<any>;
    createWhenPositionsExist(accountName: string, collatAmount: string | number, eosdtAmount: string | number, referralId?: number, transactionParams?: ITrxParamsArgument): Promise<any>;
    close(senderAccount: string, positionId: number, transactionParams?: ITrxParamsArgument): Promise<any>;
    paybackAndDelete(maker: string, positionId: number, debtAmount?: string | number, transactionParams?: ITrxParamsArgument): Promise<any>;
    del(creator: string, positionId: number, transactionParams?: ITrxParamsArgument): Promise<any>;
    give(giverAccount: string, receiver: string, positionId: number, transactionParams?: ITrxParamsArgument): Promise<any>;
    addCollateral(senderName: string, amount: string | number, positionId: number, transactionParams?: ITrxParamsArgument): Promise<any>;
    deleteCollateral(senderName: string, amount: string | number, positionId: number, transactionParams?: ITrxParamsArgument): Promise<any>;
    generateDebt(senderName: string, amount: string | number, positionId: number, transactionParams?: ITrxParamsArgument): Promise<any>;
    burnbackDebt(senderName: string, amount: string | number, positionId: number, transactionParams?: ITrxParamsArgument): Promise<any>;
    marginCall(senderName: string, positionId: number, transactionParams?: ITrxParamsArgument): Promise<any>;
    getContractTokenBalance(): Promise<number>;
    getContractEosBalance(): Promise<number>;
    getRates(): Promise<TokenRate[]>;
    getRelativeRates(): Promise<TokenRate[]>;
    getPositionById(id: number): Promise<EosdtPosition | undefined>;
    getPositionByMaker(maker: string): Promise<EosdtPosition | undefined>;
    getAllUserPositions(maker: string): Promise<EosdtPosition[]>;
    getParameters(): Promise<EosdtContractParameters>;
    getSettings(): Promise<EosdtContractSettings>;
    addReferral(senderName: string, nutAmount: string | number, transactionParams?: ITrxParamsArgument): Promise<any>;
    deleteReferral(senderName: string, referralId: number, transactionParams?: ITrxParamsArgument): Promise<any>;
    getReferralById(id: number): Promise<Referral | undefined>;
    getAllReferrals(): Promise<Referral[]>;
    getReferralByName(name: string): Promise<Referral | undefined>;
    getPositionReferral(positionId: number): Promise<PositionReferral | undefined>;
    getPositionReferralsTable(): Promise<PositionReferral[]>;
    getAllPositions(): Promise<EosdtPosition[]>;
    getAllReferralPositionsIds(referralId: number): Promise<number[]>;
    getLatestUserPosition(accountName: string): Promise<EosdtPosition | undefined>;
    getLtvRatiosTable(): Promise<LtvRatios[]>;
    getPositionLtvRatio(id: number): Promise<LtvRatios | undefined>;
}
