require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

// Load ABIs
const USDC_ABI = JSON.parse(fs.readFileSync('./abis/USDC.json', 'utf-8'));
const LINK_ABI = JSON.parse(fs.readFileSync('./abis/LINK.json', 'utf-8'));
const SWAP_ROUTER_ABI = JSON.parse(fs.readFileSync('./abis/SwapRouter.json', 'utf-8'));
const AAVE_LENDING_POOL_ABI = JSON.parse(fs.readFileSync('./abis/AaveLendingPool.json', 'utf-8'));
const POOL_ABI = JSON.parse(fs.readFileSync('./abis/UniswapV3Pool.json', 'utf-8'));

// Set up the provider and signer
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract addresses (Sepolia testnet)
const USDC_ADDRESS = '0x...';  // USDC address on Sepolia
const LINK_ADDRESS = '0x...';  // LINK address on Sepolia
const SWAP_ROUTER_ADDRESS = '0x...';  // Uniswap V3 Swap Router address on Sepolia
const AAVE_LENDING_POOL_ADDRESS = '0x...';  // Aave Lending Pool address on Sepolia
const FACTORY_ADDRESS = '0x...';  // Uniswap V3 Factory contract address on Sepolia

// Approve Token Function
async function approveToken(tokenAddress, tokenABI, amount, wallet) {
    try {
        const tokenContract = new ethers.Contract(tokenAddress, tokenABI, wallet);
        const approveAmount = ethers.parseUnits(amount.toString(), 6);  // Assuming USDC has 6 decimals
        const approveTransaction = await tokenContract.approve(SWAP_ROUTER_ADDRESS, approveAmount);
        const transactionResponse = await wallet.sendTransaction(approveTransaction);
        const receipt = await transactionResponse.wait();
        console.log(`Approval Transaction Confirmed: https://sepolia.etherscan.io/tx/${receipt.hash}`);
    } catch (error) {
        console.error("Token approval failed:", error);
    }
}

// Get Pool Info Function
async function getPoolInfo(factoryContract, tokenIn, tokenOut) {
    const poolAddress = await factoryContract.getPool(tokenIn, tokenOut, 3000);
    if (!poolAddress) {
        throw new Error("Failed to get pool address");
    }
    const poolContract = new ethers.Contract(poolAddress, POOL_ABI, provider);
    const [token0, token1, fee] = await Promise.all([
        poolContract.token0(),
        poolContract.token1(),
        poolContract.fee(),
    ]);
    return { poolContract, token0, token1, fee };
}

// Prepare Swap Params Function
async function prepareSwapParams(poolContract, signer, amountIn) {
    return {
        tokenIn: USDC_ADDRESS,
        tokenOut: LINK_ADDRESS,
        fee: await poolContract.fee(),
        recipient: signer.address,
        amountIn: amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    };
}

// Execute Swap Function
async function executeSwap(swapRouter, params, signer) {
    const transaction = await swapRouter.exactInputSingle(params);
    const receipt = await signer.sendTransaction(transaction);
    console.log(`Swap Transaction Confirmed: https://sepolia.etherscan.io/tx/${receipt.hash}`);
}

// Supply LINK to Aave Function
async function supplyToAave(linkAmount) {
    const aaveContract = new ethers.Contract(AAVE_LENDING_POOL_ADDRESS, AAVE_LENDING_POOL_ABI, signer);
    const transaction = await aaveContract.deposit(LINK_ADDRESS, linkAmount, signer.address, 0);
    const receipt = await transaction.wait();
    console.log(`LINK Supplied to Aave: https://sepolia.etherscan.io/tx/${receipt.hash}`);
}

// Main Function
async function main(swapAmount) {
    const amountIn = ethers.parseUnits(swapAmount.toString(), 6);  // Assuming USDC has 6 decimals

    try {
        // Approve USDC for swapping
        await approveToken(USDC_ADDRESS, USDC_ABI, swapAmount, signer);

        // Get Uniswap pool information
        const factoryContract = new ethers.Contract(FACTORY_ADDRESS, POOL_ABI, provider);
        const { poolContract } = await getPoolInfo(factoryContract, USDC_ADDRESS, LINK_ADDRESS);

        // Prepare swap parameters
        const params = await prepareSwapParams(poolContract, signer, amountIn);

        // Execute swap on Uniswap
        const swapRouter = new ethers.Contract(SWAP_ROUTER_ADDRESS, SWAP_ROUTER_ABI, signer);
        await executeSwap(swapRouter, params, signer);

        // Get LINK balance after swap
        const linkContract = new ethers.Contract(LINK_ADDRESS, LINK_ABI, provider);
        const linkBalance = await linkContract.balanceOf(signer.address);

        // Supply LINK to Aave
        await supplyToAave(linkBalance);
    } catch (error) {
        console.error("An error occurred:", error.message);
    }
}

// Execute the main function with a specified amount to swap (e.g., 100 USDC)
main(100);
