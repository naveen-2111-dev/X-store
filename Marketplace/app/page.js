"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion"
import {
  Eye,
  ShoppingBag,
  Truck,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Loader2,
  PackageOpen,
  X
} from "lucide-react";

import marketplaceABI from "@/contract/Market_place.json";


export default function Marketplace() {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [account, setAccount] = useState("");

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

      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);

      setContract(marketplaceContract);

      const productCount = await marketplaceContract.productCount();
      console.log("Total products:", Number(productCount));

      const loadedProducts = [];
      for (let i = 1; i <= Number(productCount); i++) {
        try {
          const product = await marketplaceContract.store(i);

          loadedProducts.push({
            id: i,
            price: ethers.formatUnits(product.price, 18),
            stock: Number(product.stock),
            name: ethers.decodeBytes32String(product.name),
            description: ethers.toUtf8String(product.description),
            image: "/laptop.png",
            productType: ethers.decodeBytes32String(product.productType),
            condition: ethers.decodeBytes32String(product.condition),
            seller: product.seller,
          });
        } catch (err) {
          console.error(`Error loading product ${i}:`, err);
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
        `Order placed successfully! Payment: ${isPayNow ? "Paid" : "On Delivery"
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
        window.ethereum.removeListener("accountsChanged", () => { });
        window.ethereum.removeListener("chainChanged", () => { });
      };
    }
  }, []);

  const bytesToImageUrl = (bytes) => {
    try {
      // Handle empty or undefined bytes
      if (!bytes || bytes.length === 0) {
        return "/placeholder-product.png";
      }

      const hexString = ethers.hexlify(bytes);

      // 1. Check for common image magic numbers (first few bytes)
      const imageHeaders = {
        "0x89504e47": "data:image/png;base64,", // PNG
        "0xffd8ffe0": "data:image/jpeg;base64,", // JPEG
        "0xffd8ffe1": "data:image/jpeg;base64,", // JPEG
        "0x47494638": "data:image/gif;base64,", // GIF
        "0x52494646": "data:image/webp;base64,", // WEBP
      };

      for (const [header, prefix] of Object.entries(imageHeaders)) {
        if (hexString.startsWith(header)) {
          const base64Data = ethers.toBase64(bytes);
          return `${prefix}${base64Data}`;
        }
      }

      if (hexString.startsWith("0x64617461")) {
        const base64Data = hexString.slice(10);
        if (/^[a-zA-Z0-9+/]+={0,2}$/.test(base64Data)) {
          return `data:image/png;base64,${base64Data}`;
        }
      }

      const potentialCid = hexString.slice(2);

      const ipfsGateways = [
        `https://ipfs.io/ipfs/${potentialCid}`,
        `https://cloudflare-ipfs.com/ipfs/${potentialCid}`,
        `https://dweb.link/ipfs/${potentialCid}`,
        `https://gateway.pinata.cloud/ipfs/${potentialCid}`,
      ];

      return ipfsGateways[0];
    } catch (e) {
      console.error("Image conversion error:", e);
      return "/image.png";
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      Delivered: {
        icon: <CheckCircle2 className="mr-1" />,
        color: "bg-green-100 text-green-800",
      },
      Paid: {
        icon: <DollarSign className="mr-1" />,
        color: "bg-blue-100 text-blue-800",
      },
      Pending: {
        icon: <AlertCircle className="mr-1" />,
        color: "bg-yellow-100 text-yellow-800",
      },
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig[status].color}`}
      >
        {statusConfig[status].icon}
        {status}
      </span>
    );
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="bg-gray-800 rounded-xl overflow-hidden shadow-lg h-full"
              >
                <div className="h-48 bg-gray-700 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-700 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div>
                  <div className="h-10 bg-gray-700 rounded mt-4 animate-pulse"></div>
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
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/50 p-4 rounded-lg mb-8">
            <div className="flex items-center">
              <AlertCircle className="mr-2" />
              <span>Error: {error}</span>
            </div>
            <button
              onClick={initializeContract}
              className="mt-3 px-4 py-2 bg-lime-500 hover:bg-lime-600 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-lime-500/20 rounded-xl shadow-lg">
              <ShoppingBag className="w-8 h-8 text-lime-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-lime-400 to-lime-800 bg-clip-text text-transparent">
              BarterX Marketplace
            </h1>
          </div>
          {account && (
            <div className="flex items-center space-x-3 bg-gray-800/50 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-gray-700/50 shadow-sm">
              <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />
              <span className="font-mono text-sm text-gray-300">
                {formatAddress(account)}
              </span>
            </div>
          )}
        </div>

        {/* Enhanced Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -5 }}
                className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl hover:shadow-lime-500/10 transition-all h-full flex flex-col border border-gray-700/30 hover:border-lime-500/30"
              >
                <div className="relative h-60 bg-gray-900 overflow-hidden">
                  <img
                    src={bytesToImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => (e.target.src = "/image.png")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-lime-400 text-sm font-medium flex items-center">
                      <Eye className="mr-2 w-4 h-4" />
                      View Details
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-grow flex flex-col space-y-4">
                  <h2 className="text-xl font-semibold truncate bg-gradient-to-r from-lime-300 to-cyan-300 bg-clip-text text-transparent">
                    {product.name}
                  </h2>
                  <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                    {product.description}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: 'Price', value: `${product.price} BRTX`, color: 'text-lime-400' },
                      { label: 'Stock', value: product.stock, color: product.stock <= 0 ? 'text-red-400' : 'text-gray-300' },
                      { label: 'Type', value: product.productType },
                      { label: 'Condition', value: product.condition }
                    ].map((item) => (
                      <div key={item.label} className="bg-gray-900/30 p-2.5 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                        <div className={`${item.color || 'text-gray-300'} font-medium truncate`}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSelectedProduct(product.id);
                      setShowPaymentModal(true);
                    }}
                    className={`w-full py-3 rounded-xl font-medium transition-all cursor-pointer mt-auto ${product.stock <= 0
                        ? 'bg-gray-700/50 cursor-not-allowed'
                        : 'bg-lime-500/90 hover:bg-lime-400 shadow-lg hover:shadow-lime-500/30'
                      }`}
                    disabled={product.stock <= 0}
                  >
                    {product.stock <= 0 ? "Out of Stock" : "Purchase Now"}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-6">
            <div className="inline-block p-6 bg-gray-800/50 rounded-2xl border border-gray-700/30">
              <PackageOpen className="w-16 h-16 text-lime-400 mx-auto mb-4" />
              <div className="text-2xl text-gray-300 mb-2">Marketplace Empty</div>
              <div className="text-gray-400 max-w-md mx-auto">
                No products available for trading at the moment
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={initializeContract}
              className="px-6 py-3 bg-lime-500/90 hover:bg-lime-400 rounded-xl font-medium flex items-center space-x-2 mx-auto shadow-lg hover:shadow-lime-500/20"
            >
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Refresh Products</span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Enhanced Payment Modal */}
      {showPaymentModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="bg-gray-800/90 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-gray-700/30 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-lime-300 to-cyan-300 bg-clip-text text-transparent">
                Payment Method
              </h2>
              <X
                className="w-6 h-6 text-gray-400 hover:text-lime-400 cursor-pointer transition-colors"
                onClick={() => setShowPaymentModal(false)}
              />
            </div>

            <div className="space-y-4 mb-8">
              {[
                {
                  method: 'paynow',
                  title: 'Pay Now',
                  description: 'Instant payment with crypto',
                  icon: <DollarSign className="w-5 h-5 text-gray-900" />,
                  color: 'bg-lime-400'
                },
                {
                  method: 'delivery',
                  title: 'Pay on Delivery',
                  description: 'Pay when you receive the product',
                  icon: <Truck className="w-5 h-5 text-white" />,
                  color: 'bg-gray-600'
                }
              ].map((option) => (
                <motion.div
                  key={option.method}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === option.method
                      ? 'border-lime-400 bg-lime-400/10'
                      : 'border-gray-700 hover:border-lime-400/30'
                    }`}
                  onClick={() => setPaymentMethod(option.method)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`${option.color} p-2.5 rounded-lg w-10 h-10 flex items-center justify-center`}>
                      {option.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-100">{option.title}</h3>
                      <p className="text-sm text-gray-400">{option.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowPaymentModal(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-600 hover:border-lime-400/50 text-gray-300 hover:text-lime-400 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handlePlaceOrder(selectedProduct)}
                disabled={!paymentMethod || loading}
                className={`px-5 py-2.5 rounded-lg transition-all ${paymentMethod
                    ? 'bg-lime-500/90 hover:bg-lime-400 shadow-lg hover:shadow-lime-500/20'
                    : 'bg-gray-700 cursor-not-allowed'
                  }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Confirm Order'
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}