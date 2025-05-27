import express, { Request, Response } from 'express';
import * as bitcoin from 'bitcoinjs-lib';
import Decimal from 'decimal.js';
import { 
    RuneToken, 
    LiquidityPool, 
    SwapRequest, 
    SwapResponse,
    AddLiquidityRequest,
    RemoveLiquidityRequest,
    YieldFarm,
    StakeRequest,
    UnstakeRequest,
    ErrorResponse 
} from './types';

const app = express();
const network = bitcoin.networks.testnet;

// In-memory storage (replace with database in production)
const pools: Map<string, LiquidityPool> = new Map();
const farms: Map<string, YieldFarm> = new Map();

// Middleware
app.use(express.json());

// Helper function to calculate swap amount
function calculateSwapAmount(
    amountIn: string,
    reserveIn: string,
    reserveOut: string,
    fee: number
): string {
    const amountInWithFee = new Decimal(amountIn).mul(1000 - fee).div(1000);
    const numerator = amountInWithFee.mul(reserveOut);
    const denominator = new Decimal(reserveIn).add(amountInWithFee);
    return numerator.div(denominator).toString();
}

// Helper function to calculate price impact
function calculatePriceImpact(
    amountIn: string,
    reserveIn: string,
    reserveOut: string
): number {
    const priceBefore = new Decimal(reserveOut).div(reserveIn);
    const priceAfter = new Decimal(reserveOut)
        .sub(calculateSwapAmount(amountIn, reserveIn, reserveOut, 0))
        .div(new Decimal(reserveIn).add(amountIn));
    return priceBefore.sub(priceAfter).div(priceBefore).mul(100).toNumber();
}

// API Endpoints

// Get all liquidity pools
app.get('/pools', (req: Request, res: Response) => {
    res.json(Array.from(pools.values()));
});

// Get pool by ID
app.get('/pools/:id', (req: Request, res: Response) => {
    const pool = pools.get(req.params.id);
    if (!pool) {
        return res.status(404).json({ error: 'Pool not found' });
    }
    res.json(pool);
});

// Create new liquidity pool
app.post('/pools', (req: Request, res: Response) => {
    const { tokenA, tokenB, fee } = req.body;
    const poolId = `${tokenA}-${tokenB}`;
    
    if (pools.has(poolId)) {
        return res.status(400).json({ error: 'Pool already exists' });
    }

    const pool: LiquidityPool = {
        id: poolId,
        tokenA,
        tokenB,
        reserveA: '0',
        reserveB: '0',
        totalSupply: '0',
        fee: fee || 3, // Default 0.3% fee
        lastUpdate: Date.now()
    };

    pools.set(poolId, pool);
    res.json(pool);
});

// Add liquidity to pool
app.post('/pools/add-liquidity', async (req: Request<{}, {}, AddLiquidityRequest>, res: Response) => {
    try {
        const { tokenA, tokenB, amountA, amountB, minLiquidity, deadline } = req.body;
        const poolId = `${tokenA}-${tokenB}`;
        const pool = pools.get(poolId);

        if (!pool) {
            return res.status(404).json({ error: 'Pool not found' });
        }

        if (Date.now() > deadline) {
            return res.status(400).json({ error: 'Transaction expired' });
        }

        // TODO: Implement actual liquidity addition logic
        // 1. Create transaction
        // 2. Sign transaction
        // 3. Broadcast transaction

        res.json({ success: true, poolId });
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

// Remove liquidity from pool
app.post('/pools/remove-liquidity', async (req: Request<{}, {}, RemoveLiquidityRequest>, res: Response) => {
    try {
        const { poolId, liquidity, minAmountA, minAmountB, deadline } = req.body;
        const pool = pools.get(poolId);

        if (!pool) {
            return res.status(404).json({ error: 'Pool not found' });
        }

        if (Date.now() > deadline) {
            return res.status(400).json({ error: 'Transaction expired' });
        }

        // TODO: Implement actual liquidity removal logic
        // 1. Create transaction
        // 2. Sign transaction
        // 3. Broadcast transaction

        res.json({ success: true, poolId });
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

// Execute swap
app.post('/swap', async (req: Request<{}, {}, SwapRequest>, res: Response<SwapResponse | ErrorResponse>) => {
    try {
        const { tokenIn, tokenOut, amountIn, minAmountOut, slippage, deadline } = req.body;
        const poolId = `${tokenIn}-${tokenOut}`;
        const pool = pools.get(poolId);

        if (!pool) {
            return res.status(404).json({ error: 'Pool not found' });
        }

        if (Date.now() > deadline) {
            return res.status(400).json({ error: 'Transaction expired' });
        }

        const amountOut = calculateSwapAmount(amountIn, pool.reserveA, pool.reserveB, pool.fee);
        const priceImpact = calculatePriceImpact(amountIn, pool.reserveA, pool.reserveB);

        if (new Decimal(amountOut).lt(minAmountOut)) {
            return res.status(400).json({ error: 'Insufficient output amount' });
        }

        // TODO: Implement actual swap logic
        // 1. Create transaction
        // 2. Sign transaction
        // 3. Broadcast transaction

        res.json({
            success: true,
            transactionHex: '0x...', // Replace with actual transaction hex
            amountOut,
            priceImpact
        });
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

// Get all yield farms
app.get('/farms', (req: Request, res: Response) => {
    res.json(Array.from(farms.values()));
});

// Create new yield farm
app.post('/farms', (req: Request, res: Response) => {
    const { token, rewardToken, rewardPerBlock, startBlock, endBlock } = req.body;
    const farmId = `${token.runeId}-${rewardToken.runeId}`;
    
    if (farms.has(farmId)) {
        return res.status(400).json({ error: 'Farm already exists' });
    }

    const farm: YieldFarm = {
        id: farmId,
        token,
        rewardToken,
        totalStaked: '0',
        rewardPerBlock,
        startBlock,
        endBlock,
        lastRewardBlock: startBlock,
        accRewardPerShare: '0'
    };

    farms.set(farmId, farm);
    res.json(farm);
});

// Stake tokens in farm
app.post('/farms/stake', async (req: Request<{}, {}, StakeRequest>, res: Response) => {
    try {
        const { farmId, amount, deadline } = req.body;
        const farm = farms.get(farmId);

        if (!farm) {
            return res.status(404).json({ error: 'Farm not found' });
        }

        if (Date.now() > deadline) {
            return res.status(400).json({ error: 'Transaction expired' });
        }

        // TODO: Implement actual staking logic
        // 1. Create transaction
        // 2. Sign transaction
        // 3. Broadcast transaction

        res.json({ success: true, farmId });
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

// Unstake tokens from farm
app.post('/farms/unstake', async (req: Request<{}, {}, UnstakeRequest>, res: Response) => {
    try {
        const { farmId, amount, deadline } = req.body;
        const farm = farms.get(farmId);

        if (!farm) {
            return res.status(404).json({ error: 'Farm not found' });
        }

        if (Date.now() > deadline) {
            return res.status(400).json({ error: 'Transaction expired' });
        }

        // TODO: Implement actual unstaking logic
        // 1. Create transaction
        // 2. Sign transaction
        // 3. Broadcast transaction

        res.json({ success: true, farmId });
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Bitcoin Rune DeFi application running on port ${PORT}`);
}); 