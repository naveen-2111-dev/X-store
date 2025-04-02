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
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

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
      alert(
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
      setError(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div className="mb-8 lg:mb-0">
              <div className="bg-gray-800 rounded-xl aspect-square animate-pulse"></div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-800 rounded w-3/4 animate-pulse"></div>
              <div className="h-6 bg-gray-800 rounded w-1/2 animate-pulse"></div>
              <div className="h-4 bg-gray-800 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-800 rounded w-5/6 animate-pulse"></div>
              <div className="h-12 bg-gray-800 rounded w-full animate-pulse mt-8"></div>
            </div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/50 p-4 rounded-lg mb-8">
            <div className="flex items-center">
              <span>Error: {error}</span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-lime-600 hover:bg-lime-500 rounded-lg"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/")}
              className="mt-3 ml-3 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen bg-black text-white p-8 text-center">
        <PackageOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-medium text-gray-200">Product not found</h2>
        <p className="text-gray-400 mt-2">
          The product you're looking for doesn't exist or may have been removed.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-4 py-2 bg-lime-600 hover:bg-lime-500 rounded-lg"
        >
          Back to Marketplace
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push("/")}
          className="mb-6 flex items-center text-lime-400 hover:text-lime-300"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Marketplace
        </button>

        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Product Image Section */}
          <div className="mb-8 lg:mb-0">
            <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 relative aspect-square">
              {product.image ? (
                <Image
                  src={product.image}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  alt={product.name}
                  className="object-contain p-4"
                  priority
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/image-placeholder.png";
                  }}
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <PackageOpen className="w-20 h-20 text-gray-500" />
                </div>
              )}

              <button
                onClick={toggleFavorite}
                className="absolute top-3 right-3 p-2 bg-gray-900/80 rounded-full hover:bg-lime-500/80 transition-colors"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isFavorite ? "text-red-500 fill-red-500" : "text-gray-300"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Product Info Section */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-100">{product.name}</h1>

            <div className="flex items-center">
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

            <div className="border-t border-gray-800 pt-4">
              <div className="text-2xl font-semibold text-lime-400">
                {product.price}{" "}
                <span className="text-sm text-gray-400">BRTX</span>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {product.stock > 0 ? (
                  <span className="text-lime-400">
                    In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="text-red-400">Out of Stock</span>
                )}
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4">
              <h2 className="text-lg font-medium text-gray-100">
                About this item
              </h2>
              <ul className="mt-2 space-y-2">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-lime-400 mr-2" />
                  <span>Condition: {product.condition}</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-lime-400 mr-2" />
                  <span>Type: {product.productType}</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-lime-400 mr-2" />
                  <span>
                    Seller: {product.seller.slice(0, 6)}...
                    {product.seller.slice(-4)}
                  </span>
                </li>
              </ul>
            </div>

            <div className="border-t border-gray-800 pt-4">
              <h2 className="text-lg font-medium text-gray-100">Description</h2>
              <p className="mt-2 text-gray-400 whitespace-pre-line">
                {product.description}
              </p>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPaymentModal(true);
                }}
                className={`w-full py-3 px-4 rounded-lg font-medium ${
                  product.stock <= 0
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-lime-600 hover:bg-lime-500 text-white"
                }`}
                disabled={product.stock <= 0}
              >
                {product.stock <= 0 ? "Out of Stock" : "Buy Now"}
              </motion.button>
            </div>

            <div className="border-t border-gray-800 pt-4 flex items-start">
              <Shield className="w-5 h-5 text-lime-400 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">
                  <span className="font-medium">BarterX Protection</span> covers
                  your purchase from click to delivery
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
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => e.stopPropagation()}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPaymentModal(false);
                }}
              />
            </div>

            <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-start">
                <div className="w-16 h-16 bg-gray-700 rounded-md overflow-hidden mr-3 flex-shrink-0">
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
                    <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                      <PackageOpen className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-100 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="text-lime-400 font-bold mt-1">
                    {product.price} BRTX
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setPaymentMethod(option.method);
                  }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPaymentModal(false);
                }}
                className="px-4 py-2 text-sm rounded-lg border border-gray-700 hover:border-lime-400/50 text-gray-300 hover:text-lime-400 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
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
