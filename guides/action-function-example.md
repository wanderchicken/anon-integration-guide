# Action Function Example

```typescript
import { Address, encodeFunctionData, parseUnits } from "viem";
import {
  FunctionReturn,
  SystemTools,
  TransactionParams,
} from "libs/adapters/types";
import { toResult } from "libs/adapters/transformers";
import { getChainFromName } from "libs/blockchain";
import { supportedChains, PROTOCOL_ADDRESS, TOKEN_ADDRESS } from "../constants";
import { protocolAbi } from "../abis";
import { checkToApprove } from "libs/adapters/helpers";

interface Props {
  chainName: string;
  account: Address;
  amount: string;
}

/**
 * Deposits a specified amount of tokens into the protocol.
 * @param props - The deposit parameters.
 * @param tools - System tools for blockchain interactions.
 * @returns Transaction result.
 */
export async function deposit(
  { chainName, account, amount }: Props,
  tools: SystemTools
): Promise<FunctionReturn> {
  const { sign, notify } = tools;

  // Check wallet connection
  if (!account) return toResult("Wallet not connected", true);

  // Validate chain
  const chainId = getChainFromName(chainName);
  if (!chainId) return toResult(`Unsupported chain name: ${chainName}`, true);
  if (!supportedChains.includes(chainId))
    return toResult(`Protocol is not supported on ${chainName}`, true);

  // Validate amount
  const amountInWei = parseUnits(amount, 18);
  if (amountInWei === 0n)
    return toResult("Amount must be greater than 0", true);

  await notify("Preparing to deposit tokens...");

  const txData: TransactionParams[] = [];

  // Check and prepare approve transaction if needed
  const approve = await checkToApprove(
    chainName,
    account,
    TOKEN_ADDRESS,
    PROTOCOL_ADDRESS,
    amountInWei
  );
  if (approve.length > 0) {
    await notify("Approval needed for token transfer...");
  }
  txData.push(...approve);

  // Prepare deposit transaction
  const tx: TransactionParams = {
    target: PROTOCOL_ADDRESS,
    data: encodeFunctionData({
      abi: protocolAbi,
      functionName: "deposit",
      args: [amountInWei, account],
    }),
  };
  txData.push(tx);

  await notify("Waiting for transaction confirmation...");

  // Sign and send transaction
  const result = await sign(chainId, account, txData);
  const depositMessage = result.messages[result.messages.length - 1];

  return toResult(
    result.isMultisig
      ? depositMessage
      : `Successfully deposited ${amount} tokens. ${depositMessage}`
  );
}
```

**Key Points**:

- Validates input arguments.
- Uses `notify` to inform the user.
- Calls `sign` only once with the transaction array.
- Returns the result using `toResult`.
- Includes JSDoc comments.
  </code_block_to_apply_changes_from>
