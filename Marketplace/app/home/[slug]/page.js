"use client";

import { ethers } from "ethers";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import marketConto from "@/contract/Market_place.json";
import erccont from "@/contract/Erc20.json";
import {
  Star,
  Heart,
  Shield,
  Check,
  PackageOpen,
  X,
  DollarSign,
  Truck,
  ArrowLeft,
  Loader2,
  Copy,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function ProductDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [contract, setContract] = useState(null);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        if (!window.ethereum) throw new Error("Please install MetaMask");

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(
          marketConto.address,
          marketConto.abi,
          signer
        );

        setContract(contractInstance);
        const productData = await contractInstance.store(slug);

        if (!productData.name) throw new Error("Product not found");

        const productDetails = {
          id: slug,
          name: ethers.decodeBytes32String(productData.name),
          price: ethers.formatUnits(productData.price.toString(), 18),
          stock: productData.stock.toString(),
          description: ethers.toUtf8String(productData.description),
          image: ethers.toUtf8String(productData.image),
          productType: ethers.decodeBytes32String(productData.productType),
          condition: ethers.decodeBytes32String(productData.condition),
          seller: productData.seller,
          rating: Math.floor(Math.random() * 5) + 1,
          reviewCount: Math.floor(Math.random() * 1000),
        };

        setProduct(productDetails);

        const favorites = JSON.parse(
          localStorage.getItem("barterx-favorites") || "[]"
        );
        setIsFavorite(favorites.includes(slug));
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [slug]);

  const toggleFavorite = (e) => {
    e.stopPropagation();
    const favorites = JSON.parse(
      localStorage.getItem("barterx-favorites") || "[]"
    );
    const newFavorites = isFavorite
      ? favorites.filter((id) => id !== slug)
      : [...favorites, slug];

    localStorage.setItem("barterx-favorites", JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  const handlePlaceOrder = async (e) => {
    e.stopPropagation();
    if (!contract || !paymentMethod) {
      setError("Contract not initialized or payment method not selected");
      return;
    }

    try {
      setLoading(true);
      const isPayNow = paymentMethod === "paynow";

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      if (isPayNow) {
        const brtxContract = new ethers.Contract(
          erccont.address,
          erccont.abi,
          signer
        );

        const txApprove = await brtxContract.approve(
          marketConto.address,
          ethers.parseUnits(product.price, 18)
        );
        await txApprove.wait();
      }

      const tx = await contract.buyProduct(slug, isPayNow);
      await tx.wait();

      setShowPaymentModal(false);
      toast.success(
        `Order placed successfully! Payment: ${
          isPayNow ? "Paid" : "On Delivery"
        }`
      );

      const productData = await contract.store(slug);
      setProduct({
        ...product,
        stock: productData.stock.toString(),
      });
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(error.message || "Failed to place order");
      setError(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12">
            <div className="mb-8 lg:mb-0">
              <div className="bg-gray-800/50 rounded-2xl aspect-square animate-pulse"></div>
            </div>
            <div className="space-y-6">
              <div className="h-9 bg-gray-800/50 rounded-full w-3/4 animate-pulse"></div>
              <div className="h-7 bg-gray-800/50 rounded-full w-1/2 animate-pulse"></div>
              <div className="h-4 bg-gray-800/50 rounded-full w-full animate-pulse"></div>
              <div className="h-4 bg-gray-800/50 rounded-full w-5/6 animate-pulse"></div>
              <div className="h-14 bg-gray-800/50 rounded-xl w-full animate-pulse mt-8"></div>
            </div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/30 p-6 rounded-xl border border-red-800/50 mb-8 backdrop-blur-sm">
            <div className="flex flex-col space-y-4">
              <span className="text-lg font-medium">Error: {error}</span>
              <div className="flex space-x-3">
                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2.5 bg-lime-600 hover:bg-lime-500 rounded-xl font-medium transition-all duration-200"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-all duration-200"
                >
                  Back to Marketplace
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen bg-black text-white p-8 text-center flex flex-col items-center justify-center">
        <PackageOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-medium text-gray-200 mb-2">
          Product not found
        </h2>
        <p className="text-gray-400 max-w-md">
          The product you're looking for doesn't exist or may have been removed.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 px-5 py-2.5 bg-lime-600 hover:bg-lime-500 rounded-xl font-medium transition-all duration-200"
        >
          Back to Marketplace
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push("/")}
          className="mb-6 flex items-center text-lime-400 hover:text-lime-300 transition-colors duration-200 group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Marketplace
        </button>

        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Product Image Section */}
          <div className="mb-8 lg:mb-0">
            <div className="bg-gray-900/30 rounded-2xl overflow-hidden border border-gray-800/50 relative aspect-square shadow-lg">
              {product.image ? (
                <Image
                  src={product.image}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  alt={product.name}
                  className="object-contain p-6"
                  priority
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/image-placeholder.png";
                  }}
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gray-800/30 flex items-center justify-center">
                  <PackageOpen className="w-20 h-20 text-gray-500" />
                </div>
              )}

              <button
                onClick={toggleFavorite}
                className="absolute top-4 right-4 p-2.5 bg-gray-900/80 rounded-xl hover:bg-lime-500/20 transition-all duration-200 backdrop-blur-sm border border-gray-800/50 hover:border-lime-400/30"
              >
                <Heart
                  className={`w-6 h-6 transition-all duration-200 ${
                    isFavorite
                      ? "text-red-500 fill-red-500"
                      : "text-gray-300 hover:text-red-500"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-100">
                  {product.name}
                </h1>
                <div className="flex items-center mt-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < product.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-lime-400 ml-2 hover:underline cursor-pointer">
                    {product.reviewCount} ratings
                  </span>
                </div>
              </div>
              <div className="text-3xl font-semibold text-lime-400">
                {product.price}{" "}
                <span className="text-base text-gray-400">BRTX</span>
              </div>
            </div>

            <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-800/50">
              <div className="flex items-center space-x-2">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.stock > 0
                      ? "bg-lime-500/10 text-lime-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </div>
                {product.stock > 0 && (
                  <span className="text-sm text-gray-400">
                    ({product.stock} available)
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-medium text-gray-100 mb-3">
                  Product Details
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-lime-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">
                      <span className="font-medium">Condition:</span>{" "}
                      {product.condition}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-lime-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">
                      <span className="font-medium">Type:</span>{" "}
                      {product.productType}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-lime-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="flex items-center">
                      <span className="text-gray-300 mr-2">
                        <span className="font-medium">Seller:</span>{" "}
                        {product.seller.slice(0, 6)}...
                        {product.seller.slice(-4)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(product.seller)}
                        className="text-gray-400 hover:text-lime-400 transition-colors duration-200 p-1"
                        title="Copy address"
                      >
                        {copied ? (
                          <CheckCircle className="w-4 h-4 text-lime-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-100 mb-3">
                  Description
                </h2>
                <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPaymentModal(true);
                }}
                className={`w-full py-3.5 px-6 rounded-xl font-medium text-lg transition-all duration-200 ${
                  product.stock <= 0
                    ? "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                    : "bg-lime-600 hover:bg-lime-500 text-white shadow-lg hover:shadow-lime-500/20"
                }`}
                disabled={product.stock <= 0}
              >
                {product.stock <= 0 ? "Out of Stock" : "Buy Now"}
              </motion.button>
            </div>

            <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-800/50 flex items-start">
              <Shield className="w-6 h-6 text-lime-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-100 mb-1">
                  BarterX Protection
                </h3>
                <p className="text-sm text-gray-400">
                  Covers your purchase from click to delivery. Full refund if
                  item is not as described.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPaymentModal(false);
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-800/50 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-gray-100">Checkout</h2>
              <X
                className="w-6 h-6 text-gray-400 hover:text-lime-400 cursor-pointer transition-colors duration-200"
                onClick={() => setShowPaymentModal(false)}
              />
            </div>

            <div className="mb-5 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
              <div className="flex items-start">
                <div className="w-16 h-16 bg-gray-700/50 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                  {product.image ? (
                    <Image
                      src={product.image}
                      width={64}
                      height={64}
                      alt={product.name}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/image-placeholder.png";
                      }}
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-600/50 flex items-center justify-center">
                      <PackageOpen className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-100 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="text-lime-400 font-bold mt-1 text-lg">
                    {product.price} BRTX
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-medium text-gray-300 mb-3">
                Select Payment Method
              </h3>
              {[
                {
                  method: "paynow",
                  title: "Pay Now",
                  description: "Instant payment with crypto",
                  icon: <DollarSign className="w-5 h-5" />,
                  color: "bg-lime-500",
                },
                {
                  method: "delivery",
                  title: "Pay on Delivery",
                  description: "Pay when you receive the product",
                  icon: <Truck className="w-5 h-5" />,
                  color: "bg-gray-700",
                },
              ].map((option) => (
                <motion.div
                  key={option.method}
                  whileHover={{ scale: 1.01 }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === option.method
                      ? "border-lime-400 bg-lime-400/10"
                      : "border-gray-700/50 hover:border-lime-400/30"
                  }`}
                  onClick={() => setPaymentMethod(option.method)}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`${option.color} p-2.5 rounded-lg w-10 h-10 flex items-center justify-center`}
                    >
                      {option.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-gray-100">
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-400">
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
                className="px-5 py-2.5 text-sm rounded-xl border border-gray-700/50 hover:border-lime-400/30 text-gray-300 hover:text-lime-400 transition-all duration-200"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={!paymentMethod || loading}
                className={`px-5 py-2.5 text-sm rounded-xl transition-all duration-200 ${
                  paymentMethod
                    ? "bg-lime-600 hover:bg-lime-500 text-white shadow-md hover:shadow-lime-500/20"
                    : "bg-gray-800/50 cursor-not-allowed text-gray-500"
                }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
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
