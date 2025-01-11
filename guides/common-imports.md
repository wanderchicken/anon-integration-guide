# Common Imports Guide

This document lists the most commonly used imports from the core libraries.

## Adapter Imports

### Types (`libs/adapters/types`)

```typescript
import {
    FunctionReturn, // Standard return type for all functions
    SystemTools, // Tools provided by the system (sign, notify)
    TransactionParams, // Transaction parameters type
    ProcessedTransactionReturn, // Return type for processed transactions
    ProjectExport, // Project export interface
} from 'libs/adapters/types';
```

### Transformers (`libs/adapters/transformers`)

```typescript
import { toResult } from 'libs/adapters/transformers'; // Standard result wrapper
```

#### Function Details

`toResult<T>(data: T | string, isError?: boolean): FunctionReturn`

-   **Parameters**:
    -   `data`: Data to wrap or error message
    -   `isError`: Optional flag to indicate error state
-   **Returns**: Standardized `FunctionReturn` object
-   **Usage**: Wraps function results or error messages in a standard format

### Helpers (`libs/adapters/helpers`)

```typescript
import {
    checkToApprove, // Check and prepare token approval
    getToken, // Get token information
    getTokens, // Get multiple tokens information
    balanceOf, // Get token balance
    findWorkingRpcUrl, // Find working RPC URL for a chain
} from 'libs/adapters/helpers';
```

#### Function Details

`checkToApprove(chainName: string, owner: Address, token: Address, spender: Address, amount: bigint): Promise<TransactionParams[]>`

-   **Parameters**:
    -   `chainName`: Network name
    -   `owner`: Token owner address
    -   `token`: Token contract address
    -   `spender`: Address to approve
    -   `amount`: Amount to approve
-   **Returns**: Array of approval transactions if needed
-   **Usage**: Checks allowance and prepares approval transaction if needed

`getToken(chainName: string, address: Address): Promise<Token>`

-   **Parameters**:
    -   `chainName`: Network name
    -   `address`: Token contract address
-   **Returns**: Token information (symbol, decimals, etc.)
-   **Usage**: Retrieves token metadata from the blockchain

`getTokens(chainName: string, addresses: Address[]): Promise<Token[]>`

-   **Parameters**:
    -   `chainName`: Network name
    -   `addresses`: Array of token addresses
-   **Returns**: Array of token information
-   **Usage**: Batch retrieval of token metadata

`balanceOf(chainName: string, token: Address, account: Address): Promise<FunctionReturn>`

-   **Parameters**:
    -   `chainName`: Network name
    -   `token`: Token contract address
    -   `account`: Account to check balance
-   **Returns**: Token balance wrapped in FunctionReturn
-   **Usage**: Gets token balance for an account

`findWorkingRpcUrl(chainId: ChainId): Promise<string>`

-   **Parameters**:
    -   `chainId`: Chain identifier
-   **Returns**: Working RPC URL
-   **Usage**: Finds a responsive RPC endpoint for a chain

## Blockchain Imports

### Core Utilities (`libs/blockchain`)

```typescript
import {
    getChainFromName, // Convert chain name to ChainId
    getChainName, // Convert ChainId to chain name
    getViemClient, // Get viem client for a chain
    allChainNames, // List of all supported chain names
} from 'libs/blockchain';
```

#### Function Details

`getChainFromName(name: string): ChainId | undefined`

-   **Parameters**:
    -   `name`: Chain name (case-insensitive)
-   **Returns**: ChainId or undefined if not found
-   **Usage**: Converts chain name to ChainId enum value

`getChainName(chainId: ChainId): string`

-   **Parameters**:
    -   `chainId`: Chain identifier
-   **Returns**: Human-readable chain name
-   **Usage**: Converts ChainId to standardized chain name

`getViemClient(chainId: ChainId): PublicClient`

-   **Parameters**:
    -   `chainId`: Chain identifier
-   **Returns**: Configured viem client
-   **Usage**: Creates a viem client for blockchain interaction

`allChainNames: string[]`

-   **Type**: Read-only array of strings
-   **Contents**: List of supported chain names
-   **Usage**: Reference for supported networks

### Constants and Types (`libs/blockchain`)

```typescript
import {
    ChainId, // Enum of supported chain IDs
    ETH_MOCK_ADDRESS, // ETH mock address for native token
    WETH9, // WETH9 contract addresses
    chainNames, // Chain names mapping
} from 'libs/blockchain';
```

#### Constants Details

`ChainId`: Enum of supported blockchain networks

-   **Type**: Enum
-   **Values**:
    ```typescript
    enum ChainId {
        ETHEREUM = 1, // Ethereum Mainnet
        OPTIMISM = 10, // Optimism
        BSC = 56, // BNB Smart Chain
        POLYGON = 137, // Polygon
        FANTOM = 250, // Fantom
        ZKSYNC = 324, // zkSync Era
        METIS = 1088, // Metis
        KAVA = 2222, // Kava EVM
        BASE = 8453, // Base
        IOTA = 1074, // IOTA EVM
        AVALANCHE = 43114, // Avalanche C-Chain
        ARBITRUM = 42161, // Arbitrum One
        SEPOLIA = 11155111, // Ethereum Testnet Sepolia
        SONIC = 146, // Sonic
        GNOSIS = 100, // Gnosis Chain
        SCROLL = 534352, // Scroll
        ONE_SEPOLIA = 421614, // Arbitrum Sepolia Testnet
    }
    ```
-   **Usage**: Type-safe chain identification
-   **Supported Networks**:
    -   **Mainnet Networks**:
        -   Ethereum Mainnet (1)
        -   Optimism (10)
        -   BNB Smart Chain (56)
        -   Polygon (137)
        -   Fantom (250)
        -   zkSync Era (324)
        -   Metis (1088)
        -   Kava EVM (2222)
        -   Base (8453)
        -   IOTA EVM (1074)
        -   Avalanche C-Chain (43114)
        -   Arbitrum One (42161)
        -   Gnosis Chain (100)
        -   Scroll (534352)
        -   Sonic (146)
    -   **Testnet Networks**:
        -   Sepolia (11155111)
        -   Arbitrum Sepolia (421614)

`ETH_MOCK_ADDRESS`: Special address for native token

-   **Type**: `Address`
-   **Value**: `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE`
-   **Usage**: Represents native token in token operations

`WETH9`: Wrapped native token addresses

-   **Type**: `Record<ChainId, Address>`
-   **Contents**: WETH contract addresses per chain
-   **Usage**: Reference for wrapped native token contracts

`chainNames`: Chain name mapping

-   **Type**: `Record<ChainId, string>`
-   **Contents**: Human-readable names for each chain
-   **Usage**: Chain name localization and display

## Usage Guidelines

1. **Types and Transformers**

    - Always use `FunctionReturn` for function return types
    - Wrap all returns with `toResult`
    - Use `SystemTools` for action functions

2. **Chain Management**

    - Use `getChainFromName` to validate chain names
    - Use `getChainName` for user-facing chain names
    - Use `ChainId` for type-safe chain references

3. **Token Operations**

    - Use `checkToApprove` for token approvals
    - Use `balanceOf` for token balance checks
    - Use `ETH_MOCK_ADDRESS` for native token references

4. **Network Interaction**
    - Use `getViemClient` for blockchain interaction
    - Use `findWorkingRpcUrl` for RPC fallback
