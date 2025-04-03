"use client";
import {
  AlertTriangle,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  ShoppingBag,
  RefreshCw,
  PackageOpen,
  Star,
  Heart,
} from "lucide-react";

export default function Market() {
  const [allNfts, setAllNfts] = useState([]);
  const [displayedNfts, setDisplayedNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buying, setBuying] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const nftsPerPage = 4;
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

      const nftsWithKeys = response.data
        .filter((nft) => nft.image_url)
        .map((nft, index) => ({
          ...nft,
          uniqueKey: `${nft.contract}-${nft.identifier || index}`,
          price:
            nft.price ||
            generateStableCryptoPrice(nft.contract, nft.identifier),
          currency: nft.currency || "ETH",
          image_url: nft.image_url,
          token_id: nft.identifier,
          rating: Math.floor(Math.random() * 5) + 1,
          reviewCount: Math.floor(Math.random() * 100),
          openseaLink: `https://testnets.opensea.io/assets/${nft.contract}/${nft.identifier}`,
        }));

      setAllNfts(nftsWithKeys);
      updateDisplayedNfts(nftsWithKeys, currentPage);

      const savedFavorites = JSON.parse(
        localStorage.getItem("nft-favorites") || "[]"
      );
      setFavorites(new Set(savedFavorites));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch NFTs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateDisplayedNfts = (nfts, page) => {
    const startIndex = (page - 1) * nftsPerPage;
    const endIndex = startIndex + nftsPerPage;
    setDisplayedNfts(nfts.slice(startIndex, endIndex));
  };

  const nextPage = () => {
    const nextPage = currentPage + 1;
    if (nextPage <= Math.ceil(allNfts.length / nftsPerPage)) {
      setCurrentPage(nextPage);
      updateDisplayedNfts(allNfts, nextPage);
    }
  };

  const prevPage = () => {
    const prevPage = currentPage - 1;
    if (prevPage >= 1) {
      setCurrentPage(prevPage);
      updateDisplayedNfts(allNfts, prevPage);
    }
  };

  const toggleFavorite = (nftId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(nftId)) {
      newFavorites.delete(nftId);
    } else {
      newFavorites.add(nftId);
    }
    setFavorites(newFavorites);
    localStorage.setItem(
      "nft-favorites",
      JSON.stringify(Array.from(newFavorites))
    );
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
      await new Promise((resolve) => setTimeout(resolve, 500));
      const openseaProfileUrl = `https://testnets.opensea.io/assets/${nft.contract}/${nft.identifier}`;

      if (typeof window !== "undefined") {
        window.open(openseaProfileUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setError("Failed to open OpenSea. Please try again.");
      console.error("OpenSea redirect error:", err);
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
    return `${parsedPrice.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })} ${currency}`;
  };

  const SkeletonCard = () => (
    <div className="bg-gradient-to-br from-gray-900/50 to-gray-900 rounded-2xl overflow-hidden border border-gray-800/30 animate-pulse">
      <div className="aspect-square bg-gradient-to-br from-gray-800/50 to-gray-900/50"></div>
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gray-800/50 rounded-full w-3/4"></div>
        <div className="h-4 bg-gray-800/50 rounded-full w-1/2"></div>
        <div className="flex justify-between items-center pt-4">
          <div className="h-8 bg-gray-800/50 rounded-full w-20"></div>
          <div className="h-10 bg-lime-500/20 rounded-xl w-24"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
              Discover Latest NFTs
            </h1>
            <p className="text-gray-400 mt-2 max-w-2xl">
              Explore unique digital assets from creators worldwide
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchNFTs}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700/80 rounded-xl font-medium flex items-center gap-2 border border-gray-700/50 hover:border-lime-400/30 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh Collection
          </motion.button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/30 backdrop-blur-sm border border-red-800/50 text-red-100 p-4 mb-8 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={`skeleton-${i}`} />
            ))}
          </div>
        ) : allNfts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {displayedNfts.map((nft) => (
                  <motion.div
                    key={nft.uniqueKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="group bg-gradient-to-br from-gray-900/50 to-gray-900 rounded-2xl overflow-hidden border border-gray-800/30 hover:border-lime-400/50 transition-all shadow-lg hover:shadow-lime-500/10 relative"
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(nft.uniqueKey);
                      }}
                      className="absolute top-4 right-4 z-10 p-2 bg-gray-900/80 backdrop-blur-sm rounded-full hover:bg-lime-500/20 transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 transition-all ${
                          favorites.has(nft.uniqueKey)
                            ? "text-red-500 fill-red-500"
                            : "text-gray-300 hover:text-red-500"
                        }`}
                      />
                    </button>

                    <div className="relative aspect-square overflow-hidden">
                      <motion.img
                        src={nft.image_url}
                        alt={nft.name || `NFT #${nft.identifier}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/image-placeholder.png";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                        <div className="w-full">
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < nft.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-600"
                                }`}
                              />
                            ))}
                            <span className="text-xs text-gray-300 ml-1">
                              ({nft.reviewCount})
                            </span>
                          </div>
                          <a
                            href={nft.openseaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lime-400 text-sm font-medium flex items-center gap-2 hover:text-lime-300 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View on OpenSea
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col gap-3">
                      <div>
                        <h3 className="font-semibold text-lg bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">
                          {nft.name || `#${nft.identifier}`}
                        </h3>
                        <p className="text-gray-400 text-sm truncate">
                          {nft.collection_name ||
                            nft.collection ||
                            "Unnamed Collection"}
                        </p>
                      </div>

                      <div className="mt-auto pt-4 flex justify-between items-center">
                        <div className="font-medium text-lime-400 bg-lime-400/10 px-3 py-1.5 rounded-lg text-sm">
                          {formatPrice(nft.price, nft.currency)}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleBuy(nft)}
                          disabled={buying === nft.uniqueKey}
                          className={`px-4 py-2 text-sm rounded-xl font-medium transition-all ${
                            buying === nft.uniqueKey
                              ? "bg-lime-400/30 text-lime-400 cursor-not-allowed flex items-center gap-2"
                              : "bg-lime-400 hover:bg-lime-300 text-gray-900 shadow-md hover:shadow-lime-400/30"
                          }`}
                        >
                          {buying === nft.uniqueKey ? (
                            <>
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                              />
                              Processing
                            </>
                          ) : (
                            "Buy Now"
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {allNfts.length > nftsPerPage && (
              <div className="flex justify-center items-center mt-8 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>

                <span className="text-gray-300">
                  Page {currentPage} of{" "}
                  {Math.ceil(allNfts.length / nftsPerPage)}
                </span>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextPage}
                  disabled={
                    currentPage === Math.ceil(allNfts.length / nftsPerPage)
                  }
                  className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            )}

            <div className="mt-16 text-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent mb-4">
                Love These NFTs?
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto mb-6">
                Discover more amazing digital collectibles on OpenSea, BarterX
              </p>
              <motion.a
                href="https://testnets.opensea.io/BarterX"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block px-6 py-3 bg-gradient-to-r from-lime-500 to-emerald-500 text-gray-900 rounded-xl font-medium shadow-lg hover:shadow-lime-500/30 transition-all"
              >
                Explore OpenSea
              </motion.a>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 space-y-6"
          >
            <div className="inline-block p-8 bg-gradient-to-br from-gray-900/50 to-gray-900 rounded-2xl border border-gray-800/50 shadow-lg">
              <PackageOpen className="w-16 h-16 text-lime-400 mx-auto mb-4" />
              <div className="text-2xl font-medium text-lime-400 mb-2">
                Collection Empty
              </div>
              <div className="text-gray-400 max-w-md mx-auto">
                No NFTs found in this collection. Check back later or refresh to
                load items.
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
      </div>
    </div>
  );
}
