"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PurchaseSuccess() {
  const params = useSearchParams();
  const encodedNftData = params.get("nft");
  const [nftDetails, setNftDetails] = useState(null);

  useEffect(() => {
    if (encodedNftData) {
      try {
        // Decode the base64 and parse the JSON
        const decodedData = decodeURIComponent(atob(encodedNftData));
        const nftData = JSON.parse(decodedData);
        setNftDetails(nftData);
      } catch (error) {
        console.error("Error parsing NFT data:", error);
        setNftDetails({
          name: "Unknown NFT",
          image_url: "/image.png",
          price: "0 ETH",
          identifier: "unknown",
        });
      }
    }
  }, [encodedNftData]);

  const formatPrice = (price, currency = "ETH") => {
    if (!price) return "0 ETH";
    const parsedPrice = parseFloat(price) / 10 ** 18;
    return `${parsedPrice.toFixed(4)} ${currency}`;
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-[#111] border-2 border-[#b2ff00] rounded-xl p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold text-[#b2ff00] text-center mb-4">
          🎉 Purchase Successful!
        </h1>

        {nftDetails ? (
          <>
            <div className="aspect-square w-full mb-4">
              <img
                src={nftDetails.image_url || "/image.png"}
                alt={nftDetails.name}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => (e.target.src = "/image.png")}
              />
            </div>

            <div className="text-center">
              <h2 className="text-xl font-semibold mb-1">
                {nftDetails.name || `NFT #${nftDetails.identifier}`}
              </h2>
              <p className="text-[#b2ff00] mb-2">
                {formatPrice(nftDetails.price, nftDetails.currency)}
              </p>
              <p className="text-sm text-gray-400">
                {nftDetails.collection_name ||
                  nftDetails.collection ||
                  "Unnamed Collection"}
              </p>
            </div>
          </>
        ) : (
          <div className="animate-pulse">
            <div className="aspect-square bg-gray-800 rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-800 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2 mx-auto"></div>
          </div>
        )}

        <button
          onClick={() => (window.location.href = "/nftmarketplace")}
          className="mt-6 w-full py-2 bg-[#b2ff00] hover:bg-[#9ae000] text-black font-medium rounded-lg transition-colors"
        >
          Back to Marketplace
        </button>
      </div>
    </div>
  );
}
