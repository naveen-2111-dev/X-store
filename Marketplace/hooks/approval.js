import { ethers } from "ethers";
import Erc_config from "@/contract/Erc20.json";

export const approveToken = async (signer, marketPlaceAddress, price) => {
  try {
    const brtxContract = new ethers.Contract(
      Erc_config.address,
      Erc_config.abi,
      signer
    );

    if (!brtxContract.approve) {
      console.error("Contract does not have an 'approve' function!");
      throw new Error("Contract does not have an 'approve' function!");
    }

    const allowance = await brtxContract.allowance(
      await signer.getAddress(),
      marketPlaceAddress
    );

    if (allowance >= price) {
      console.log("Already approved");
      return true;
    }

    const tx = await brtxContract.approve(marketPlaceAddress, price);
    await tx.wait();
    console.log("Approval successful");

    return true;
  } catch (error) {
    console.error("Approval failed", error);
    throw error;
  }
};
