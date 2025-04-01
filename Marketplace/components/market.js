"use client";
import { AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  ShoppingBag,
  Truck,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Loader2,
  PackageOpen
} from "lucide-react";

export default function Market() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buying, setBuying] = useState(null);
  const router = useRouter();

  const fetchNFTs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "/api/mystore",
        { walletAddress: process.env.NEXT_PUBLIC_WALLET },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const nftsWithKeys = response.data.map((nft, index) => ({
        ...nft,
        uniqueKey: `${nft.contract}-${nft.identifier || index}`,
        price:
          nft.price || generateStableCryptoPrice(nft.contract, nft.identifier),
        currency: nft.currency || "ETH",
        image_url: nft.image_url || "/image.png",
        token_id: nft.identifier,
      }));

      setNfts(nftsWithKeys);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch NFTs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateStableCryptoPrice = (contract, tokenId) => {
    const hash = `${contract}-${tokenId}`.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    const patterns = [
      0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5,
    ];
    const selectedPattern = patterns[hash % patterns.length];
    const variation = 0.9 + (hash % 20) / 100;

    return Math.round(selectedPattern * variation * 10 ** 18);
  };

  const handleBuy = async (nft) => {
    setBuying(nft.uniqueKey);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const nftDataString = JSON.stringify(nft);
      const encodedNftData = btoa(encodeURIComponent(nftDataString));

      router.push(`/purchase/success?nft=${encodedNftData}`);
    } catch (err) {
      setError("Purchase failed. Please try again.");
    } finally {
      setBuying(null);
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, []);

  const formatPrice = (price, currency) => {
    if (!price) return "No price set";

    const parsedPrice = parseFloat(price) / 10 ** 18;
    if (isNaN(parsedPrice)) return "Invalid price";

    let decimals = parsedPrice < 0.01 ? 4 : parsedPrice < 1 ? 3 : 2;
    const formattedPrice = parsedPrice.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    return `${formattedPrice} ${currency}`;
  };

  const SkeletonCard = () => (
    <div className="bg-[#000] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow animate-pulse">
      <div className="aspect-square bg-[#111]"></div>
      <div className="p-4 space-y-3">
        <div className="h-5 bg-[#111] rounded w-3/4"></div>
        <div className="h-4 bg-[#111] rounded w-1/2"></div>
        <div className="h-9 bg-lime-500 bg-opacity-20 rounded mt-2"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <h1 className="text-4xl md:text-5xl mr-10 font-bold bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
        Discover Latest NFTs
      </h1>
      <main className="container mx-auto px-4 py-12">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/50 backdrop-blur-sm border border-red-800/50 text-red-100 p-4 mb-8 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <div className="font-semibold">Error Occurred</div>
                <div className="text-sm mt-1">{error}</div>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 hover:bg-red-800/30 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={`skeleton-${i}`} />
            ))}
          </div>
        ) : nfts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {nfts.map((nft) => (
              <motion.div
                key={nft.uniqueKey}
                whileHover={{ y: -5 }}
                className="group bg-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl hover:shadow-lime-500/20 transition-all border border-gray-800/50 hover:border-lime-400/30"
              >
                <div className="relative aspect-square overflow-hidden">
                  <motion.img
                    src={nft.image_url}
                    alt={nft.name || `NFT #${nft.identifier}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => (e.target.src = "/image.png")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-lime-400 text-sm font-medium flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      View Details
                    </span>
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <h3 className="font-semibold truncate text-lg bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">
                    {nft.name || `#${nft.identifier}`}
                  </h3>
                  <p className="text-lime-400/80 text-sm truncate">
                    {nft.collection_name || nft.collection || "Unnamed Collection"}
                  </p>
                  <div className="mt-auto pt-4 flex justify-between items-center">
                    <div className="font-medium text-lime-400 bg-lime-400/10 px-3 py-1.5 rounded-lg text-sm">
                      {formatPrice(nft.price, nft.currency)}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleBuy(nft)}
                      disabled={buying === nft.uniqueKey}
                      className={`px-4 py-2 text-sm rounded-xl font-medium transition-all ${buying === nft.uniqueKey
                          ? "bg-lime-400/30 text-lime-400 cursor-not-allowed"
                          : "bg-lime-400 hover:bg-lime-300 text-gray-900 shadow-md hover:shadow-lime-400/30"
                        }`}
                    >
                      {buying === nft.uniqueKey ? (
                        <div className="flex items-center gap-2">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="w-4 h-4 border-2 border-current border-t-transparent cursor-pointer rounded-full"
                          />
                          Processing
                        </div>
                      ) : (
                        "Buy Now"
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 space-y-6"
          >
            <div className="inline-block p-6 bg-gray-900/50 rounded-2xl border border-gray-800/50">
              <PackageOpen className="w-16 h-16 text-lime-400 mx-auto mb-4" />
              <div className="text-2xl text-lime-400 mb-2">Collection Empty</div>
              <div className="text-gray-400 max-w-md mx-auto">
                No NFTs found in this collection
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchNFTs}
              className="px-6 py-3 bg-lime-400 hover:bg-lime-300 text-gray-900 rounded-xl font-medium flex items-center gap-2 mx-auto shadow-md hover:shadow-lime-400/30"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh Collection
            </motion.button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
