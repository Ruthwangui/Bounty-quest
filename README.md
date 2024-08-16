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

## How to Run the Script

1. **Clone the Repository**: Clone the project repository to your local machine.

    ```bash
    git clone https://github.com/your-repo/defi-script.git
    cd defi-script
    ```

2. **Install Dependencies**: Install the necessary Node.js dependencies.

    ```bash
    npm install
    ```

3. **Set Up Environment Variables**: Create a `.env` file in the root directory and add your Sepolia RPC URL and private key.

    ```
    RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"
    PRIVATE_KEY="YOUR_PRIVATE_KEY"
    ```

4. **Run the Script**: Execute the script to perform the token swap and supply process.

    ```bash
    node index.js
    ```

## Requirements

- Node.js and npm installed on your local machine.
- An Ethereum wallet with USDC, LINK, and some Sepolia ETH to cover gas fees.
- Infura account for obtaining the Sepolia RPC URL.

## Notes

- Ensure you are connected to the Sepolia testnet, as this script is designed for test purposes.
- The `.env` file should be kept secure and should not be shared, as it contains sensitive information like your private key.

## License

This project is licensed under the MIT License.
