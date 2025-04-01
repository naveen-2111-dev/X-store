import Erc_contract from "@/contract/erc.json";
import { ethers } from "ethers";

export default async function BrrtxBalance() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const brtxContract = new ethers.Contract(
    Erc_contract.address,
    Erc_contract.abi,
    signer
  );

  const balance = await brtxContract.balanceOf(address);
  const decimals = await brtxContract.decimals();
  const formattedBalance = ethers.formatUnits(balance, decimals);

  return formattedBalance;
}
