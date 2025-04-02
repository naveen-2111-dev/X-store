"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import {
  Truck,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Loader2,
  PackageOpen,
  X,
  Star,
  Heart,
  Shield,
  ChevronDown,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import marketplaceABI from "@/contract/Market_place.json";
import { useRouter } from "next/navigation";

export default function Marketplace() {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [account, setAccount] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesDropdown, setShowFavoritesDropdown] = useState(false);
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("barterx-favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("barterx-favorites", JSON.stringify(favorites));
  }, [favorites]);

  const initializeContract = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error("Please install MetaMask");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractAddress = marketplaceABI.address;

      const marketplaceContract = new ethers.Contract(
        contractAddress,
        marketplaceABI.abi,
        signer
      );

      setContract(marketplaceContract);
      const count = Number(await marketplaceContract.productCount());

      const loadedProducts = [];
      for (let i = 1; i <= count; i++) {
        try {
          const productData = await marketplaceContract.store(i);

          loadedProducts.push({
            id: i,
            name: ethers.decodeBytes32String(productData.name),
            price: ethers.formatUnits(productData.price.toString(), 18),
            stock: productData.stock.toString(),
            description: ethers.toUtf8String(productData.description),
            image: ethers.toUtf8String(productData.image),
            productType: ethers.decodeBytes32String(productData.productType),
            condition: ethers.decodeBytes32String(productData.condition),
            seller: productData.seller,
            rating: Math.floor(Math.random() * 2) + 4,
            reviews: Math.floor(Math.random() * 100) + 1,
          });
        } catch (error) {
          console.error(`Error fetching product ${i}:`, error);
        }
      }

      setProducts(loadedProducts);
    } catch (err) {
      console.error("Initialization error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (productId) => {
    if (!contract || !paymentMethod) {
      setError("Contract not initialized or payment method not selected");
      return;
    }

    try {
      setLoading(true);
      const isPayNow = paymentMethod === "paynow";
      const product = products.find((p) => p.id === productId);
      const priceInWei = ethers.parseUnits(product.price, 18);

      const tx = await contract.buyProduct(productId, isPayNow, {
        value: isPayNow ? priceInWei : 0,
      });

      await tx.wait();
      setShowPaymentModal(false);
      alert(
        `Order placed successfully! Payment: ${
          isPayNow ? "Paid" : "On Delivery"
        }`
      );
      initializeContract();
    } catch (error) {
      console.error("Error placing order:", error);
      setError(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const filteredProducts = products.filter((product) => {
    if (filter === "favorites") {
      return favorites.includes(product.id);
    }
    return true;
  });

  useEffect(() => {
    if (window.ethereum) {
      initializeContract();

      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0] || "");
        initializeContract();
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });

      return () => {
        window.ethereum.removeListener("accountsChanged", () => {});
        window.ethereum.removeListener("chainChanged", () => {});
      };
    }
  }, []);

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {[...Array(10)].map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="bg-gray-900 rounded-xl h-full flex flex-col border border-gray-800"
              >
                <div className="relative pt-[100%] bg-gray-800 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-800 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-800 rounded w-full animate-pulse"></div>
                  <div className="h-8 bg-gray-800 rounded mt-4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/50 p-4 rounded-lg mb-8">
            <div className="flex items-center">
              <AlertCircle className="mr-2" />
              <span>Error: {error}</span>
            </div>
            <button
              onClick={initializeContract}
              className="mt-3 px-4 py-2 bg-lime-600 hover:bg-lime-500 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-4 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 px-4 py-3 bg-gray-900 rounded-lg border border-gray-800 shadow-sm">
          <div className="text-sm text-gray-300">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "item" : "items"}
            {filter === "favorites" && " in favorites"}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFavoritesDropdown(!showFavoritesDropdown)}
              className="flex items-center space-x-1 text-sm text-gray-300 hover:text-lime-400 transition-colors"
            >
              <span>Favorites ({favorites.length})</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showFavoritesDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showFavoritesDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg border border-gray-800 z-10"
              >
                <button
                  onClick={() => {
                    setFilter("all");
                    setShowFavoritesDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    filter === "all"
                      ? "text-lime-400 bg-gray-800"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  Show All
                </button>
                <button
                  onClick={() => {
                    setFilter("favorites");
                    setShowFavoritesDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    filter === "favorites"
                      ? "text-lime-400 bg-gray-800"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  Show Favorites Only
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -5 }}
                className="group bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-lime-500/5 transition-all h-full flex flex-col border border-gray-800 hover:border-lime-500/20"
              >
                <div className="relative aspect-square bg-gray-800 overflow-hidden">
                  {product.image ? (
                    <Image
                      src={product.image}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      alt={product.name}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/image.png";
                      }}
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <PackageOpen className="w-10 h-10 text-gray-500" />
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-gray-900/80 rounded-full hover:bg-lime-500/80 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.includes(product.id)
                          ? "text-red-500 fill-red-500"
                          : "text-gray-300 hover:text-white"
                      }`}
                    />
                  </button>

                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute bottom-2 left-2 bg-yellow-500/90 text-black text-xs px-2 py-1 rounded-md">
                      Only {product.stock} left
                    </div>
                  )}
                </div>

                <div className="p-4 flex-grow flex flex-col">
                  <div className="mb-2">
                    <h2 className="text-sm font-medium text-gray-100 mb-1 line-clamp-2 leading-tight">
                      {product.name}
                    </h2>
                    <div className="flex items-center">
                      <div className="flex mr-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < product.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        ({product.reviews})
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-baseline mb-1">
                      <span className="text-lg font-bold text-lime-400">
                        {product.price}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">BRTX</span>
                    </div>

                    <div className="flex items-center text-xs text-gray-400 mt-2">
                      <Shield className="w-3 h-3 mr-1 text-lime-400" />
                      <span>BarterX Protection</span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        if (product.stock > 0) {
                          router.push(`/home/${product.id}`);
                        }
                      }}
                      className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer mt-3 ${
                        product.stock <= 0
                          ? "bg-gray-800 cursor-not-allowed text-gray-500"
                          : "bg-lime-600 hover:bg-lime-500 shadow-md text-white"
                      }`}
                      disabled={product.stock <= 0}
                    >
                      {product.stock <= 0 ? "Out of Stock" : "Buy now"}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : filter === "favorites" ? (
          <div className="text-center py-20 space-y-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="inline-block p-8 bg-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl hover:shadow-lime-500/10 transition-all duration-300"
            >
              <div className="relative w-20 h-20 mx-auto mb-5">
                <div className="absolute inset-0 bg-lime-400/10 rounded-full blur-sm"></div>
                <Heart className="relative w-full h-full text-lime-400 p-4" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-gray-200 mb-1">
                  No Favorites Yet
                </h3>
                <p className="text-gray-400/90 max-w-xs mx-auto text-sm leading-relaxed">
                  You haven't added any items to your favorites collection
                </p>
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilter("all")}
              className="px-7 py-3.5 bg-lime-600 hover:bg-lime-500 rounded-xl font-medium mx-auto shadow-lg hover:shadow-lime-500/30 transition-all duration-200 flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Browse All Products</span>
            </motion.button>
          </div>
        ) : (
          <div className="text-center py-20 space-y-6">
            <div className="inline-block p-6 bg-gray-900 rounded-2xl border border-gray-800 shadow-lg">
              <PackageOpen className="w-16 h-16 text-lime-400 mx-auto mb-4" />
              <div className="text-2xl text-gray-300 mb-2">
                Marketplace Empty
              </div>
              <div className="text-gray-400 max-w-md mx-auto">
                No products available for trading at the moment
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={initializeContract}
              className="px-6 py-3 bg-lime-600 hover:bg-lime-500 rounded-xl font-medium flex items-center space-x-2 mx-auto shadow-lg hover:shadow-lime-500/20"
            >
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Refresh Products</span>
            </motion.button>
          </div>
        )}
      </div>

      {showPaymentModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-800 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-100">Checkout</h2>
              <X
                className="w-5 h-5 text-gray-400 hover:text-lime-400 cursor-pointer transition-colors"
                onClick={() => setShowPaymentModal(false)}
              />
            </div>

            <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-start">
                <div className="w-16 h-16 bg-gray-700 rounded-md overflow-hidden mr-3 flex-shrink-0">
                  {products.find((p) => p.id === selectedProduct)?.image ? (
                    <Image
                      src={
                        products.find((p) => p.id === selectedProduct)?.image
                      }
                      width={64}
                      height={64}
                      alt={
                        products.find((p) => p.id === selectedProduct)?.name ||
                        "Product"
                      }
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/image.png";
                      }}
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                      <PackageOpen className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-100 line-clamp-2">
                    {products.find((p) => p.id === selectedProduct)?.name ||
                      "Product"}
                  </h3>
                  <div className="text-lime-400 font-bold mt-1">
                    {products.find((p) => p.id === selectedProduct)?.price ||
                      "0"}{" "}
                    BRTX
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-medium text-gray-300 mb-2">
                Payment Method
              </h3>
              {[
                {
                  method: "paynow",
                  title: "Pay Now",
                  description: "Instant payment with crypto",
                  icon: <DollarSign className="w-4 h-4" />,
                  color: "bg-lime-500",
                },
                {
                  method: "delivery",
                  title: "Pay on Delivery",
                  description: "Pay when you receive the product",
                  icon: <Truck className="w-4 h-4" />,
                  color: "bg-gray-700",
                },
              ].map((option) => (
                <motion.div
                  key={option.method}
                  whileHover={{ scale: 1.01 }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    paymentMethod === option.method
                      ? "border-lime-400 bg-lime-400/10"
                      : "border-gray-700 hover:border-lime-400/30"
                  }`}
                  onClick={() => setPaymentMethod(option.method)}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`${option.color} p-2 rounded-md w-8 h-8 flex items-center justify-center`}
                    >
                      {option.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-100">
                        {option.title}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-700 hover:border-lime-400/50 text-gray-300 hover:text-lime-400 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePlaceOrder(selectedProduct)}
                disabled={!paymentMethod || loading}
                className={`px-4 py-2 text-sm rounded-lg transition-all ${
                  paymentMethod
                    ? "bg-lime-600 hover:bg-lime-500 shadow-md text-white"
                    : "bg-gray-800 cursor-not-allowed text-gray-500"
                }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Place Order"
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
