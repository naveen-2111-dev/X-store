"use client";

import { ethers } from "ethers";

export default async function signer() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    return signer;
  } catch (error) {
    throw error;
  }
}
