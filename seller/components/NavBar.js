"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FiMenu, FiX } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, User, LogOut } from "lucide-react";
import BrrtxBalance from "@/hooks/useBrtxBalance";
import { ethers } from "ethers";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const router = useRouter();
  const UserIcon = (props) => <User {...props} />;
  const LogOutIcon = (props) => <LogOut {...props} />;

  useEffect(() => {
    const fetchBalancePeriodically = async () => {
      if (walletAddress) {
        try {
          const currentBalance = await BrrtxBalance();
          setBalance(currentBalance);
        } catch (error) {
          console.error("Balance fetch failed:", error);
        }
      }
    };

    fetchBalancePeriodically();

    const interval = setInterval(fetchBalancePeriodically, 30000);

    return () => clearInterval(interval);
  }, [walletAddress]);

  const checkWalletConnection = async () => {
    console.log("Checking wallet connection...");

    const storedAddress = localStorage.getItem("walletAddress");
    if (storedAddress) {
      console.log("Wallet found in localStorage:", storedAddress);
      setWalletAddress(storedAddress);
    } else {
      console.log("No wallet found in localStorage.");
      setWalletAddress("");
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
        localStorage.setItem("walletAddress", accounts[0]);

        window.location.reload();
      } catch (error) {
        console.error("MetaMask connection failed", error);
      }
    } else {
      alert("MetaMask is not installed!");
    }
  };

  const disconnectWallet = () => {
    console.log("Clearing all local storage...");
    localStorage.clear();
    setWalletAddress("");
    setDropdownOpen(false);
    window.dispatchEvent(new Event("walletDisconnected"));

    router.push("/");
  };

  useEffect(() => {
    const handleStorageChange = () => {
      checkWalletConnection();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const storedAddress = localStorage.getItem("walletAddress");
    if (storedAddress) {
      setWalletAddress(storedAddress);
    } else {
      setWalletAddress("");
    }
  }, []);

  return (
    <nav
      className="mx-auto m-5 flex justify-between items-center p-4 
    shadow-2xl font-mono bg-transparent backdrop-blur-lg 
    border border-black/20 text-white relative rounded-full  "
    >
      <div>
        <Link href="/dashboard">
          <Image
            src="/logo.png"
            alt="logo"
            width={100}
            height={100}
            className="ml-10 cursor-pointer"
          />
        </Link>
      </div>
      <div className="flex-1 flex justify-center items-center">
        <div>
          <Link
            href="/marketplace"
            className="text-white/80 ml-26 hover:text-lime-400 transition-colors duration-300 text-lg font-medium hidden md:block"
          >
            Explore Marketplace.
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative inline-block w-16 sm:w-20 group">
          <img
            src="/BarterxCoin.png"
            alt="BarterX Coin"
            className="w-full h-auto"
          />
          <span className="absolute -top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
            {balance}
          </span>
          <span className="absolute top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-lg transition-opacity duration-200 whitespace-nowrap">
            You have {balance} BarterX Coins
          </span>
        </div>

        <div className="relative">
          {walletAddress ? (
            <>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="rounded-lg bg-lime-500 px-4 py-2 text-black hover:bg-lime-600"
              >
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 shadow-xl shadow-black/50 rounded-lg overflow-hidden animate-in fade-in-80 slide-in-from-top-2 z-50">
                  <button
                    onClick={() => router.push("/AddProducts")}
                    className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 group"
                  >
                    <Plus className="w-5 h-5 mr-3 text-gray-400 group-hover:text-white" />
                    <span>Add Product</span>
                  </button>
                  <button
                    onClick={() => router.push("/profile")}
                    className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 group"
                  >
                    <UserIcon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-white" />
                    <span>Profile</span>
                  </button>

                  <div className="border-t border-gray-700 my-1" />

                  <button
                    onClick={disconnectWallet}
                    className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-red-400 transition-all duration-200 group"
                  >
                    <LogOutIcon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-red-400" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <button
              onClick={connectWallet}
              className="rounded-lg bg-lime-500 px-4 py-2 text-black hover:bg-lime-600"
            >
              Connect Wallet
            </button>
          )}
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
        </button>
      </div>
    </nav>
  );
}
