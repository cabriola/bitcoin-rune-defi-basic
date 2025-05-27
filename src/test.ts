import { RuneToken, LiquidityPool } from './types';

// Test data
const tokenA: RuneToken = {
    runeId: '1',
    name: 'Test Token A',
    symbol: 'TTA',
    decimals: 8,
    totalSupply: '1000000',
    creator: 'test-address-1',
    timestamp: Date.now()
};

const tokenB: RuneToken = {
    runeId: '2',
    name: 'Test Token B',
    symbol: 'TTB',
    decimals: 8,
    totalSupply: '1000000',
    creator: 'test-address-2',
    timestamp: Date.now()
};

// Create a test pool
const pool: LiquidityPool = {
    id: `${tokenA.runeId}-${tokenB.runeId}`,
    tokenA: tokenA,
    tokenB: tokenB,
    reserveA: '100000',
    reserveB: '100000',
    totalSupply: '100000',
    fee: 3,
    lastUpdate: Date.now()
};

// Test functions
function testPoolCreation() {
    console.log('Testing pool creation...');
    console.log('Pool ID:', pool.id);
    console.log('Token A:', pool.tokenA.symbol);
    console.log('Token B:', pool.tokenB.symbol);
    console.log('Reserve A:', pool.reserveA);
    console.log('Reserve B:', pool.reserveB);
    console.log('Total Supply:', pool.totalSupply);
    console.log('Fee:', pool.fee);
    console.log('Last Update:', new Date(pool.lastUpdate).toISOString());
}

function testSwapCalculation() {
    console.log('\nTesting swap calculation...');
    const amountIn = '1000';
    const amountInWithFee = (Number(amountIn) * (1000 - pool.fee)) / 1000;
    const numerator = amountInWithFee * Number(pool.reserveB);
    const denominator = Number(pool.reserveA) + amountInWithFee;
    const amountOut = numerator / denominator;
    
    console.log('Amount In:', amountIn);
    console.log('Amount Out:', amountOut.toFixed(8));
    console.log('Price Impact:', ((amountOut / Number(pool.reserveB)) * 100).toFixed(2) + '%');
}

// Run tests
console.log('Starting tests...\n');
testPoolCreation();
testSwapCalculation();
console.log('\nTests completed!'); 