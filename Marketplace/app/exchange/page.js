"use client";

import GetSlug from "@/services/getslug";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Loader2, Gem, ShoppingBag, Wallet } from "lucide-react";
import { useContract } from "@/hooks/useContract";
import { ethers } from "ethers";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Exchange() {
  const { address } = useAccount();
  const [nftData, setNftData] = useState(null);
  const [loading, setIsLoading] = useState(true);
  const [contract, setContract] = useState(null);
  const [transferLoading, setTransferLoading] = useState(false);
  const [error, setError] = useState(null);

  const initializeContract = async () => {
    try {
      const contractFunctions = await useContract();
      setContract(contractFunctions);
    } catch (err) {
      console.error("Contract initialization error:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    async function fetchNFTs() {
      if (!address) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const slugData = await GetSlug(address);
        if (slugData?.collections?.[0]?.data) {
          const { ownerNFTs = [], listedNFTs = [] } =
            slugData.collections[0].data;

          const generateRandomPrice = () =>
            (0.001 + Math.random() * 0.009).toFixed(3);

          const processedOwnerNFTs = ownerNFTs.map((nft) => ({
            ...nft,
            uniqueKey: `owned-${nft.identifier}-${nft.contract_address || ""
              }-${Math.random().toString(36).substr(2, 9)}`,
            price: generateRandomPrice(),
            currency: "ETH",
          }));

          const processedListedNFTs = listedNFTs.map((nft) => ({
            ...nft,
            uniqueKey: `listed-${nft.order_hash || nft.identifier}-${nft.contract_address || ""
              }-${Math.random().toString(36).substr(2, 9)}`,
            price: nft.price || generateRandomPrice(),
            currency: nft.currency || "ETH",
          }));

          setNftData({
            ownerNFTs: processedOwnerNFTs,
            listedNFTs: processedListedNFTs,
            collectionName: slugData.collections[0].slug || "My Collection",
          });
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    initializeContract();
    fetchNFTs();
  }, [address]);

  const handleNFTTransfer = async (nft) => {
    if (!contract || !address) {
      setError("Contract not initialized or wallet not connected");
      return;
    }

    setTransferLoading(true);
    setError(null);

    try {
      const tokenId = parseInt(nft.identifier);
      const nftContractAddress = nft.contract;

      const brtxAmount = nft.price ? nft.price.toString() : "1";
      console.log("Transferring NFT with:", {
        contractAddress: nftContractAddress,
        tokenId: tokenId,
        price: brtxAmount,
      });

      const tx = await contract.NameTransfer(
        nftContractAddress,
        tokenId,
        brtxAmount
      );

      console.log("Transaction Sent:", tx);

      const slugData = await GetSlug(address);
      if (slugData?.collections?.[0]?.data) {
        setNftData({
          ...nftData,
          ownerNFTs: slugData.collections[0].data.ownerNFTs || [],
        });
      }
    } catch (error) {
      console.error("Transfer error:", error);
      setError(
        error.message.includes("user rejected")
          ? "Transaction was cancelled"
          : "Transfer failed. See console for details."
      );
    } finally {
      setTransferLoading(false);
    }
  };

  const handleNFTClick = (nft) => {
    console.log("Selected NFT:", {
      contractAddress: nft.contract,
      tokenId: nft.identifier,
      price: nft.price,
    });
    handleNFTTransfer(nft);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-lime-500" />
        <p className="mt-4 text-lg text-gray-300">Loading your NFTs...</p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Wallet className="w-12 h-12 text-gray-400" />
        <p className="mt-4 text-xl text-gray-300">
          Connect your wallet to view NFTs
        </p>
        <div className="mt-4">
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (
    !nftData ||
    (nftData.ownerNFTs.length === 0 && nftData.listedNFTs.length === 0)
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Gem className="w-12 h-12 text-gray-400" />
        <p className="mt-4 text-xl text-gray-300">
          No NFTs found in your collection
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {nftData.collectionName}
            </h1>
            <p className="text-gray-400">Your exclusive NFT collection</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 text-red-200 rounded-lg">
            Error: {error}
          </div>
        )}

        {transferLoading && (
          <div className="mb-6 p-4 bg-blue-900/50 text-blue-200 rounded-lg flex items-center">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Processing NFT transfer...
          </div>
        )}

        {nftData.ownerNFTs.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center mb-6">
              <Wallet className="w-6 h-6 text-lime-500 mr-2" />
              <h2 className="text-2xl font-semibold text-white">Owned NFTs</h2>
              <span className="ml-2 px-2 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                {nftData.ownerNFTs.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {nftData.ownerNFTs.map((nft) => (
                <NFTCard
                  key={nft.uniqueKey}
                  nft={nft}
                  type="owned"
                  onClick={() => handleNFTClick(nft)}
                />
              ))}
            </div>
          </div>
        )}

        {nftData.listedNFTs.length > 0 && (
          <div>
            <div className="flex items-center mb-6">
              <ShoppingBag className="w-6 h-6 text-lime-500 mr-2" />
              <h2 className="text-2xl font-semibold text-white">Listed NFTs</h2>
              <span className="ml-2 px-2 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                {nftData.listedNFTs.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {nftData.listedNFTs.map((nft) => (
                <NFTCard
                  key={nft.uniqueKey}
                  nft={nft}
                  type="listed"
                  onClick={() => handleNFTClick(nft)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NFTCard({ nft, type, onClick }) {
  return (
    <div
      className="group bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer relative"
      onClick={onClick}
    >
      <div className="relative pb-[100%] bg-gray-700 overflow-hidden">
        {nft.image_url ? (
          <img
            src={nft.image_url}
            alt={nft.name}
            className="absolute h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.src = "https://placehold.co/400x400/1e293b/9ca3af?text=NFT";
            }}
          />
        ) : (
          <div className="absolute h-full w-full flex items-center justify-center bg-gray-700">
            <Gem className="w-12 h-12 text-gray-500 transition-transform duration-500 group-hover:scale-110" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-white font-medium truncate">
          {nft.name || "Unnamed NFT"}
        </h3>
        <p className="text-gray-400 text-sm mt-1 truncate">
          {nft.description || "No description"}
        </p>
        <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
          <span
            className={`text-xs px-2 py-1 rounded-full ${type === "owned"
                ? "bg-lime-500 text-black-300"
                : "bg-blue-900 text-blue-300"
              }`}
          >
            {type === "owned" ? "OWNED" : "LISTED"}
          </span>
          <span className="text-white font-medium">
            {nft.price} {nft.currency || "ETH"}
          </span>
        </div>
      </div>
    </div>
  );
}
