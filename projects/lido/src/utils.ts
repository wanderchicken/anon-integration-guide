import { Address } from "viem";
type Result<Data> =
	| {
			success: false;
			errorMessage: string;
	  }
	| {
			success: true;
			data: Data;
	  };

export const validateWallet = <Props extends { account: Address }>({ account }: Props): Result<{ account: Address }> => {
	if (!account) return { success: false, errorMessage: 'Wallet not connected' };
	return {
		success: true,
		data: {
			account,
		},
	};
};