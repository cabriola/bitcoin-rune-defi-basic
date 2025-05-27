export interface RuneToken {
    runeId: string;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    creator: string;
    timestamp: number;
}

export interface LiquidityPool {
    id: string;
    tokenA: RuneToken;
    tokenB: RuneToken;
    reserveA: string;
    reserveB: string;
    totalSupply: string;
    fee: number;
    lastUpdate: number;
}

export interface SwapRequest {
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    minAmountOut: string;
    slippage: number;
    deadline: number;
}

export interface SwapResponse {
    success: boolean;
    transactionHex: string;
    amountOut: string;
    priceImpact: number;
}

export interface AddLiquidityRequest {
    tokenA: string;
    tokenB: string;
    amountA: string;
    amountB: string;
    minLiquidity: string;
    deadline: number;
}

export interface RemoveLiquidityRequest {
    poolId: string;
    liquidity: string;
    minAmountA: string;
    minAmountB: string;
    deadline: number;
}

export interface YieldFarm {
    id: string;
    token: RuneToken;
    rewardToken: RuneToken;
    totalStaked: string;
    rewardPerBlock: string;
    startBlock: number;
    endBlock: number;
    lastRewardBlock: number;
    accRewardPerShare: string;
}

export interface StakeRequest {
    farmId: string;
    amount: string;
    deadline: number;
}

export interface UnstakeRequest {
    farmId: string;
    amount: string;
    deadline: number;
}

export interface ErrorResponse {
    error: string;
    code?: number;
} 