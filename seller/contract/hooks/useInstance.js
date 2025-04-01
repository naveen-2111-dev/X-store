import contractMetadata from "@/contract/Abi.json";
import { ethers } from "ethers";

export async function useInstance() {
  try {
    if (!contractMetadata.contractAddress || !contractMetadata.abi) {
      throw new Error("Contract address or ABI is missing");
    }

    if (!window.ethereum) {
      throw new Error("Ethereum provider not found");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    return new ethers.Contract(
      contractMetadata.contractAddress,
      contractMetadata.abi,
      signer
    );
  } catch (error) {
    console.error("useInstance error:", error);
    throw error;
  }
}
