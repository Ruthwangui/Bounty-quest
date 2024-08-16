# DeFi Script: Uniswap and Aave Integration

## Overview of the Script

This script demonstrates a comprehensive integration between Uniswap V3 and Aave protocols on the Ethereum Sepolia testnet. The script allows users to swap USDC tokens for LINK tokens using Uniswap, and then supply the acquired LINK tokens to Aave to start earning interest. 

### Key Features:
1. **Token Swap on Uniswap**: The script initiates a swap of USDC for LINK using Uniswap V3's decentralized exchange. It interacts with various Uniswap smart contracts, including the Factory, Pool, and Swap Router.

2. **Approval Mechanism**: Before performing any token transactions (e.g., swap or supply), the script ensures that the required approvals are granted. It first approves Uniswap's Swap Router contract to spend USDC, and later approves Aave's Lending Pool contract to spend LINK.

3. **Liquidity Pool Interaction**: The script retrieves essential information about the USDC-LINK liquidity pool, such as the pool address, fee tier, and token pair details, to facilitate the swap.

4. **Token Supply on Aave**: After the LINK tokens are acquired through Uniswap, the script supplies these tokens to Aave's Lending Pool to earn interest, showcasing the composability of DeFi protocols.

### Work Summary:

1. **Initialize Environment**: The script begins by loading environment variables and initializing the Ethereum provider and signer with the user's private key.
   
2. **Approve USDC for Uniswap**: It approves the Uniswap Swap Router contract to spend the user's USDC tokens for the swap.
   
3. **Retrieve Pool Information**: The script retrieves the necessary information about the USDC-LINK pool from Uniswap's Factory contract.
   
4. **Execute Swap**: The script swaps USDC for LINK using Uniswap's Swap Router.

5. **Approve LINK for Aave**: It then approves the Aave Lending Pool contract to spend the acquired LINK tokens.

6. **Supply LINK to Aave**: Finally, the script supplies the LINK tokens to Aave's Lending Pool to start earning interest.

## Diagram Illustration

The diagram below illustrates the sequence of steps and interactions between the Uniswap and Aave protocols:

![DeFi Script Flowchart](image.png)

This flowchart provides a visual representation of the process, showing how the script interacts with different smart contracts on Uniswap and Aave, from initiating the token swap to supplying tokens to Aave.


# Code Explanation

## Introduction

This document provides a detailed explanation of the code that integrates Uniswap and Aave protocols on the Ethereum Sepolia testnet. The script performs a series of operations including swapping USDC for LINK on Uniswap and supplying the acquired LINK to Aave to start earning interest. This guide breaks down the key functions, logic, and how the script handles interactions with the DeFi protocols.

## Key Functions and Logic

### 1. `approveToken`

```javascript
async function approveToken(tokenAddress, tokenABI, amount, wallet) {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, wallet);
    const approveAmount = ethers.parseUnits(amount.toString(), USDC.decimals);
    const approveTransaction = await tokenContract.approve.populateTransaction(
      SWAP_ROUTER_CONTRACT_ADDRESS,
      approveAmount
    );
    const transactionResponse = await wallet.sendTransaction(approveTransaction);
    const receipt = await transactionResponse.wait();
  } catch (error) {
    console.error("An error occurred during token approval:", error);
    throw new Error("Token approval failed");
  }
}

- **Purpose**: This function approves a specified amount of a token (USDC) to be used by another contract (Uniswap's Swap Router or Aave's Lending Pool).
- **Parameters**:
  - `tokenAddress`: The address of the token contract (e.g., USDC).
  - `tokenABI`: The ABI of the token contract.
  - `amount`: The amount of tokens to approve.
  - `wallet`: The wallet instance used to sign the transaction.
- **Logic**: The function initializes a contract instance for the token, converts the amount to the correct units, and then sends an approval transaction to the blockchain. The transaction allows the specified contract to spend the tokens on behalf of the user.

### 2. `getPoolInfo`

```javascript
async function getPoolInfo(factoryContract, tokenIn, tokenOut) {
  const poolAddress = await factoryContract.getPool(
    tokenIn.address,
    tokenOut.address,
    3000
  );
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
```

- **Purpose**: This function retrieves essential information about a Uniswap V3 liquidity pool that contains the pair of tokens to be swapped.
- **Parameters**:
  - `factoryContract`: The Uniswap Factory contract instance.
  - `tokenIn`: The input token (USDC).
  - `tokenOut`: The output token (LINK).
- **Logic**: The function queries the Factory contract to get the address of the pool corresponding to the specified token pair. It then initializes a contract instance for the pool and retrieves the token addresses and fee tier associated with the pool.

### 3. `prepareSwapParams`

```javascript
async function prepareSwapParams(poolContract, signer, amountIn) {
  return {
    tokenIn: USDC.address,
    tokenOut: LINK.address,
    fee: await poolContract.fee(),
    recipient: signer.address,
    amountIn: amountIn,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  };
}
```

- **Purpose**: Prepares the parameters required to execute a swap on Uniswap.
- **Parameters**:
  - `poolContract`: The contract instance of the Uniswap pool.
  - `signer`: The wallet instance to sign the transaction.
  - `amountIn`: The amount of input tokens to swap.
- **Logic**: This function creates a structured object containing all necessary parameters for the Uniswap swap, such as the input/output token addresses, fee tier, recipient address, and amount to swap.

### 4. `executeSwap`

```javascript
async function executeSwap(swapRouter, params, signer) {
  const transaction = await swapRouter.exactInputSingle.populateTransaction(
    params
  );
  const receipt = await signer.sendTransaction(transaction);
}
```

- **Purpose**: Executes the token swap on Uniswap using the prepared swap parameters.
- **Parameters**:
  - `swapRouter`: The Uniswap Swap Router contract instance.
  - `params`: The parameters object prepared by `prepareSwapParams`.
  - `signer`: The wallet instance that will send the transaction.
- **Logic**: The function sends a transaction to the Uniswap Swap Router to perform the swap. It uses the provided parameters and waits for the transaction to be confirmed on the blockchain.

### 5. `supplyToAave`

```javascript
async function supplyToAave(aaveLendingPool, amount, wallet) {
  try {
    const supplyTransaction = await aaveLendingPool.supply(
      LINK.address,
      amount,
      wallet.address,
      0
    );
    const receipt = await supplyTransaction.wait();
  } catch (error) {
    console.error("An error occurred during LINK supply to Aave:", error);
    throw new Error("LINK supply to Aave failed");
  }
}
```

- **Purpose**: Supplies the acquired LINK tokens to Aave’s Lending Pool to earn interest.
- **Parameters**:
  - `aaveLendingPool`: The Aave Lending Pool contract instance.
  - `amount`: The amount of LINK tokens to supply.
  - `wallet`: The wallet instance to sign the transaction.
- **Logic**: The function sends a transaction to the Aave Lending Pool to supply the specified amount of LINK tokens. The transaction is then confirmed on the blockchain, effectively starting the interest-earning process.

### 6. `main`

```javascript
async function main(swapAmount) {
  const inputAmount = swapAmount;
  const amountIn = ethers.parseUnits(inputAmount.toString(), USDC.decimals);

  try {
    await approveToken(USDC.address, TOKEN_IN_ABI, inputAmount, signer);
    const { poolContract } = await getPoolInfo(factoryContract, USDC, LINK);
    const params = await prepareSwapParams(poolContract, signer, amountIn);
    const swapRouter = new ethers.Contract(
      SWAP_ROUTER_CONTRACT_ADDRESS,
      SWAP_ROUTER_ABI,
      signer
    );
    await executeSwap(swapRouter, params, signer);

    const linkBalance = await LINK_CONTRACT.balanceOf(signer.address);
    await approveToken(LINK.address, TOKEN_OUT_ABI, linkBalance, signer);
    await supplyToAave(aaveLendingPool, linkBalance, signer);
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}
```

- **Purpose**: The main function coordinates the entire process of swapping USDC for LINK and then supplying LINK to Aave.
- **Parameters**:
  - `swapAmount`: The amount of USDC to swap for LINK.
- **Logic**:
  - Converts the swap amount to the correct units.
  - Approves the Uniswap Swap Router to spend USDC.
  - Retrieves pool information and prepares swap parameters.
  - Executes the swap on Uniswap.
  - Retrieves the LINK balance and approves the Aave Lending Pool to spend LINK.
  - Supplies the LINK to Aave.

## Interaction with DeFi Protocols

### Uniswap
- **Token Swap**: The script interacts with Uniswap's Factory, Pool, and Swap Router contracts to perform a USDC to LINK swap. It involves approving token spending, retrieving pool information, and executing the swap.

### Aave
- **Token Supply**: After the swap, the script supplies LINK to Aave's Lending Pool. This process involves approving the Aave contract to spend LINK and sending a transaction to supply the tokens, allowing the user to earn interest.



This script showcases the composability of DeFi protocols by seamlessly integrating Uniswap and Aave. By following the logical sequence of approving tokens, retrieving necessary information, and executing transactions, the script demonstrates how to perform a token swap and supply the swapped tokens to another DeFi protocol. Each function plays a crucial role in managing the interactions with the smart contracts, ensuring the entire process is executed efficiently and securely.
```



