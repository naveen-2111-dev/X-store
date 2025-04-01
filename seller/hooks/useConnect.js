"use client";

import { ethers } from "ethers";

export default function useConnect() {
  return async () => {
    try {
      if (!window.ethereum) {
        alert("Metamask not found");
        return null;  
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        alert("No accounts found");
        return null;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = accounts[0];

      return { signer, provider, address };
    } catch (error) {
      console.error("Connection Error:", error.message);
      return error.message;
    }
  };
}
