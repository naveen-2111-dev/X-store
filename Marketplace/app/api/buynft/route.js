import { ethers } from "ethers";
import { NextResponse } from "next/server";
import { erc721Abi } from "viem";

const MARKETPLACE_FEE_PERCENT = 2;
const FEE_RECIPIENT = "0x059a36538f6357DEe444c2f566B16847d9cfB511";

export async function POST(request) {
  try {
    const { nftContract, tokenId, buyerAddress, paymentAmount } =
      await request.json();

    console.log("Incoming purchase request:", {
      nftContract,
      tokenId,
      buyerAddress,
      paymentAmount,
    });

    if (!nftContract || !tokenId || !buyerAddress || !paymentAmount) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    if (!ethers.isAddress(nftContract) || !ethers.isAddress(buyerAddress)) {
      return NextResponse.json(
        { error: "Invalid address format" },
        { status: 400 }
      );
    }

    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL
    );
    const signer = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIV, provider);
    const nft = new ethers.Contract(nftContract, erc721Abi, signer);

    // Verify NFT ownership
    const currentOwner = await nft.ownerOf(tokenId);
    if (currentOwner.toLowerCase() !== signer.address.toLowerCase()) {
      return NextResponse.json(
        { error: "NFT not owned by marketplace" },
        { status: 403 }
      );
    }

    // Process payment and fees
    const feeAmount =
      (BigInt(paymentAmount) * BigInt(MARKETPLACE_FEE_PERCENT)) / BigInt(100);
    const sellerAmount = BigInt(paymentAmount) - feeAmount;

    // Execute transactions
    const feeTx = await signer.sendTransaction({
      to: FEE_RECIPIENT,
      value: feeAmount,
    });

    const transferTx = await nft.transferFrom(
      signer.address,
      buyerAddress,
      tokenId,
      { gasLimit: 500000 }
    );

    await Promise.all([feeTx.wait(), transferTx.wait()]);

    return NextResponse.json({
      success: true,
      feeCollected: ethers.formatEther(feeAmount.toString()),
      sellerAmount: ethers.formatEther(sellerAmount.toString()),
      txHash: transferTx.hash,
    });
  } catch (error) {
    console.error("Transaction Error:", error);
    return NextResponse.json(
      {
        error: "Transaction failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
