# Getter Function Example

```typescript
import { Address } from "viem";
import { FunctionReturn, toResult, getChainFromName } from "@heyanon/sdk";

interface Props {
  chainName: string;
  userAddress: Address;
}

/**
 * Retrieves the rewards earned by a user.
 * @param props - The query parameters.
 * @returns The user's rewards information.
 */
export async function getRewardsExample({
  chainName,
  userAddress,
}: Props): Promise<FunctionReturn> {
  if (!userAddress) {
    return toResult("User address is required", true);
  }

  const chainId = getChainFromName(chainName);
  if (!chainId) return toResult(`Unsupported chain name: ${chainName}`, true);

  // Fetch rewards data from the protocol
  const rewardsData = await fetchRewardsData(chainId, userAddress);

  if (!rewardsData) {
    return toResult("No rewards data found", true);
  }

  // Limit data to 500 tokens
  const limitedData = rewardsData.slice(0, 500);

  return toResult(JSON.stringify(limitedData));
}
```

**Key Points**:

- Validates input arguments.
- Does not use `signTransactions`.
- Ensures data returned does not exceed 500 tokens.
- Returns the result using `toResult`.
- Includes JSDoc comments.
