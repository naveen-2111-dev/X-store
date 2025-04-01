import { PinataSDK } from "pinata-web3";

export const Pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
});

export default async function useUpload(File) {
  try {
    const result = await Pinata.upload.file(File);
    
    if (!result || !result.IpfsHash) {
      throw new Error("Invalid response from Pinata");
    }

    // Construct the IPFS URL
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
    
    // Alternatively use the public gateway:
    // const imageUrl = `https://ipfs.io/ipfs/${result.IpfsHash}`;
    
    return {
      success: true,
      imageUrl,
      ipfsHash: result.IpfsHash
    };

  } catch (error) {
    console.error("Error uploading file to Pinata:", error);
    return {
      success: false,
      error: error.message || "Failed to upload file",
      imageUrl: null,
      ipfsHash: null
    };
  }
}