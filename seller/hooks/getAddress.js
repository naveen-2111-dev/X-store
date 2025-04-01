import { ethers } from "ethers";

export default async function getAddress() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner(); 
    const address = await signer.getAddress();

    return address;
  } catch (error) {
    console.error("Error fetching address:", error);
    return null;
  }
}
