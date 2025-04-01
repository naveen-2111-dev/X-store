
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, Wallet } from "lucide-react";
import useConnect from "@/hooks/useConnect";
import { isConnected, disconnected } from "@/lib/features/Connect/ConnectSlice";
import {
  Connect_Address,
  Disconnect_address,
} from "@/lib/features/address/AddresSlice";
let AddressConnecter = null;

export default function ConnectButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const isConnectedState = useSelector((state) => state.connected.value);
  AddressConnecter = useSelector((state) => state.address.value);
  const connect = useConnect();

  const handleConnect = useCallback(async () => {
    setLoading(true);
    try {
      const result = await connect();
      if (result && result.address) {
        dispatch(Connect_Address(result.address));
        dispatch(isConnected());
        localStorage.setItem("walletAddress", result.address); 
        router.push("/dashboard");
        window.location.reload(); 
      } else {
        console.error("Failed to connect");
        dispatch(Disconnect_address());
        dispatch(disconnected());
      }
    } catch (error) {
      console.error("Error connecting:", error);
      dispatch(Disconnect_address());
      dispatch(disconnected());
    } finally {
      setLoading(false);
    }
  }, [dispatch, connect, router]);


  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        console.log("Accounts changed:", accounts);
        if (accounts.length === 0) {
          dispatch(Disconnect_address());
          dispatch(disconnected());
        } else {
          dispatch(Connect_Address(accounts[0]));
          dispatch(isConnected());
        }
      };

      const handleDisconnect = () => {
        console.log("Metamask disconnected");
        dispatch(Disconnect_address());
        dispatch(disconnected());
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("disconnect", handleDisconnect);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("disconnect", handleDisconnect);
      };
    }
  }, [dispatch, isConnectedState]);

  useEffect(() => {
    if (isConnectedState) {
      router.push("/dashboard");
    }
  }, [isConnectedState, router]);

  useEffect(() => {
    const storedAddress = localStorage.getItem("walletAddress");
    if (storedAddress) {
      dispatch(Connect_Address(storedAddress));
      dispatch(isConnected());
    }
  }, [dispatch]);


  return (
    <div>
      {isConnectedState && AddressConnecter ? (
        <div className="px-6 py-3 rounded-xl bg-gradient-to-br from-lime-500/20 to-emerald-600/10 backdrop-blur-lg border border-lime-400/30 text-lime-300 font-mono text-sm shadow-[0_0_20px_-5px_rgba(190,255,100,0.1)]">
          Connected: {AddressConnecter.slice(0, 6)}...{AddressConnecter.slice(-4)}
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={loading}
          className={`px-8 py-4 rounded-full flex items-center gap-2 transition-all duration-300 cursor-pointer
            ${loading
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-lime-500 hover:from-lime-600 hover:to-emerald-700 shadow-lg hover:shadow-xl"
            }
            ${!loading && "hover:shadow-lime-500/30"} text-white font-medium`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-lime-400" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5 text-lime-200 " />
              <span>Connect Wallet</span>
            </>
          )}
        </button>
      )}
    </div>
  );

}

export function AddressFetcher() {
  return AddressConnecter;
}
