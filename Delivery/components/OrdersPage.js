"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import contMk_config from "@/contract/mk.json";
import erc_config from "@/contract/erc.json";
import {
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Package,
  Wallet,
  Info,
  Settings,
  X,
} from "lucide-react";
import { QRCode } from "react-qr-code";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState({});
  const [fulfillingOrder, setFulfillingOrder] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: "",
    aadharNumber: "",
    phoneNumber: "",
  });
  const [activeTab, setActiveTab] = useState("all");

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      if (!window.ethereum) throw new Error("Please install MetaMask");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== 11155111) {
        throw new Error(
          "Please connect to Sepolia network (Chain ID: 11155111)"
        );
      }

      const accounts = await provider.send("eth_requestAccounts", []);
      setCurrentAccount(accounts[0]);
      await fetchOrdersAndProducts(provider);
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchOrdersAndProducts = async (provider, forceUpdate = false) => {
    try {
      if (forceUpdate) setLoading(true);
      setError(null);

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contMk_config.address,
        contMk_config.abi,
        signer
      );

      const orderCount = Number(await contract.orderCount());
      const ordersArray = [];
      for (let i = 1; i < orderCount; i++) {
        try {
          const order = await contract.orders(i);
          if (order.buyer === ethers.ZeroAddress) continue; // Skip deleted orders
          ordersArray.push({
            id: i,
            productId: order.productId.toString(),
            amount: ethers.formatUnits(order.amountPaid, 18),
            amountRaw: order.amountPaid.toString(),
            buyer: order.buyer,
            seller: order.seller,
            isPaid: order.isPaid,
            isDelivered: order.isDelivered,
            timestamp: new Date().toLocaleString(), // Fallback since contract doesn't store timestamp
          });
        } catch (err) {
          console.warn(`Error fetching order ${i}:`, err);
        }
      }
      setOrders(ordersArray);

      const productsMap = {};
      for (const order of ordersArray) {
        try {
          const product = await contract.store(order.productId);
          productsMap[order.productId] = {
            name: ethers.decodeBytes32String(product.name),
            price: ethers.formatUnits(product.price, 18),
            priceRaw: product.price.toString(),
            description: ethers.toUtf8String(product.description),
            image: product.image,
            productType: ethers.decodeBytes32String(product.productType),
            condition: ethers.decodeBytes32String(product.condition),
            seller: product.seller,
            stock: Number(product.stock),
          };
        } catch (err) {
          console.warn(`Error fetching product ${order.productId}:`, err);
        }
      }
      setProducts(productsMap);
    } catch (err) {
      console.error("Data fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (orderId) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const tokenContract = new ethers.Contract(
        erc_config.address,
        erc_config.abi,
        provider
      );
      const order = orders.find((o) => o.id === orderId);
      if (!order) return false;

      const product = products[order.productId];
      const balance = await tokenContract.balanceOf(order.seller);
      return balance >= ethers.getBigInt(product.priceRaw);
    } catch (error) {
      console.error("Payment check error:", error);
      return false;
    }
  };

  const checkPaymentStatusWithRetry = async (
    orderId,
    retries = 3,
    delay = 5000
  ) => {
    for (let i = 0; i < retries; i++) {
      const isPaid = await checkPaymentStatus(orderId);
      if (isPaid) return true;
      if (i < retries - 1)
        await new Promise((resolve) => setTimeout(resolve, delay));
    }
    return false;
  };

  const confirmDelivery = async (orderId) => {
    try {
      setFulfillingOrder(orderId);
      const order = orders.find((o) => o.id === orderId);

      if (!order.isPaid) {
        const isPaid = await checkPaymentStatusWithRetry(orderId);
        if (!isPaid) {
          const product = products[order.productId];
          throw new Error(
            `Payment not detected. Please send ${product.price} BRTX to ${order.seller} ` +
              `using token contract ${erc_config.address} and wait for confirmation`
          );
        }
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contMk_config.address,
        contMk_config.abi,
        signer
      );

      const tx = await contract.confirmDelivery(orderId);
      await tx.wait();
      await fetchOrdersAndProducts(provider, true);
    } catch (error) {
      console.error("Delivery confirmation failed:", error);
      setError(error.reason || error.message || "Failed to confirm delivery");
    } finally {
      setFulfillingOrder(null);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      setFulfillingOrder(orderId);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contMk_config.address,
        contMk_config.abi,
        signer
      );

      const tx = await contract.cancelOrder(orderId);
      await tx.wait();
      await fetchOrdersAndProducts(provider, true);
    } catch (error) {
      console.error("Order cancellation failed:", error);
      setError(error.reason || error.message || "Failed to cancel order");
    } finally {
      setFulfillingOrder(null);
    }
  };

  useEffect(() => {
    if (!window.ethereum || !currentAccount) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(
      contMk_config.address,
      contMk_config.abi,
      provider
    );

    const onOrderPlaced = (orderId, productId, buyer, seller, isPaid) => {
      setOrders((prev) => [
        ...prev,
        {
          id: Number(orderId),
          productId: productId.toString(),
          amount: "0", // Updated after payment
          amountRaw: "0",
          buyer,
          seller,
          isPaid,
          isDelivered: false,
          timestamp: new Date().toLocaleString(),
        },
      ]);
    };

    const onOrderPaid = (orderId, amountPaid) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === Number(orderId)
            ? {
                ...order,
                isPaid: true,
                amount: ethers.formatUnits(amountPaid, 18),
                amountRaw: amountPaid.toString(),
              }
            : order
        )
      );
    };

    const onOrderDelivered = (orderId) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === Number(orderId) ? { ...order, isDelivered: true } : order
        )
      );
    };

    contract.on("OrderPlaced", onOrderPlaced);
    contract.on("OrderPaid", onOrderPaid);
    contract.on("OrderDelivered", onOrderDelivered);

    return () => {
      contract.off("OrderPlaced", onOrderPlaced);
      contract.off("OrderPaid", onOrderPaid);
      contract.off("OrderDelivered", onOrderDelivered);
    };
  }, [currentAccount]);

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      fetchOrdersAndProducts(provider);
    }
  }, []);

  const bytesToImageUrl = (bytes) => {
    try {
      const hexString = ethers.hexlify(bytes);
      if (hexString.startsWith("0x64617461")) {
        return `data:image/png;base64,${hexString.slice(10)}`;
      }
      return `https://ipfs.io/ipfs/${hexString.slice(2)}`;
    } catch (e) {
      return "/placeholder-product.png";
    }
  };

  const formatAddress = (address) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const getStatusBadge = (order) => {
    const statusConfig = {
      Delivered: {
        icon: <CheckCircle className="h-4 w-4" />,
        color: "bg-green-900 text-green-200",
        text: "Delivered",
      },
      Paid: {
        icon: <Truck className="h-4 w-4" />,
        color: "bg-blue-900 text-blue-200",
        text: "Shipped",
      },
      Pending: {
        icon: <Clock className="h-4 w-4" />,
        color: "bg-yellow-900 text-yellow-200",
        text: "Processing",
      },
    };

    const status = order.isDelivered
      ? "Delivered"
      : order.isPaid
      ? "Paid"
      : "Pending";
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[status].color}`}
      >
        {statusConfig[status].icon}
        {statusConfig[status].text}
      </span>
    );
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return !order.isPaid && !order.isDelivered;
    if (activeTab === "completed") return order.isPaid && order.isDelivered;
    return true;
  });

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-gray-400">Loading orders...</p>
      </div>
    );

  if (error && !currentAccount)
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/50 p-4 rounded-lg mb-8 border border-red-700">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-400 mr-2" />
              <span>{error}</span>
            </div>
            <button
              onClick={connectWallet}
              className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <Package className="mr-3 text-purple-400" />
            BarterX Orders
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-full hover:bg-gray-700"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            {currentAccount ? (
              <div className="px-4 py-2 bg-purple-600 rounded-lg">
                {formatAddress(currentAccount)}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>
        </div>
      </header>

      <nav className="mb-6">
        <div className="max-w-7xl mx-auto flex space-x-2">
          {["all", "pending", "completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize ${
                activeTab === tab
                  ? "bg-purple-600"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              {tab} Orders
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 rounded-xl">
            <Truck className="mx-auto h-16 w-16 text-gray-600" />
            <h3 className="mt-4 text-xl font-medium text-gray-300">
              No {activeTab} orders found
            </h3>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const product = products[order.productId];
              const isExpanded = expandedOrder === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all"
                >
                  <div
                    className="px-5 py-4 cursor-pointer"
                    onClick={() =>
                      setExpandedOrder(isExpanded ? null : order.id)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {product?.image && (
                          <img
                            src={bytesToImageUrl(product.image)}
                            alt={product?.name || "Product"}
                            className="flex-shrink-0 h-12 w-12 rounded-lg object-cover border border-gray-700"
                          />
                        )}
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-white">
                            {product?.name || "Unknown Product"}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Order #{order.id} • {order.timestamp}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(order)}
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-700 px-5 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                            <Info className="mr-2 h-4 w-4 text-purple-400" />
                            Product Information
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <span className="text-xs text-gray-500">
                                Type
                              </span>
                              <p className="text-sm">
                                {product?.productType || "Unknown"}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">
                                Condition
                              </span>
                              <p className="text-sm">
                                {product?.condition || "Unknown"}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">
                                Description
                              </span>
                              <p className="text-sm">
                                {product?.description || "No description"}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">
                                Stock
                              </span>
                              <p className="text-sm">
                                {product?.stock ?? "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                            <Wallet className="mr-2 h-4 w-4 text-purple-400" />
                            Transaction Details
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <span className="text-xs text-gray-500">
                                Seller
                              </span>
                              <p className="text-sm">
                                {formatAddress(order.seller)}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">
                                Buyer
                              </span>
                              <p className="text-sm">
                                {formatAddress(order.buyer)}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">
                                Amount
                              </span>
                              <p className="text-sm font-mono">
                                {order.isPaid
                                  ? order.amount
                                  : product?.price || "0"}{" "}
                                BRTX
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetailsModal(true);
                          }}
                          className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                        >
                          <Info className="mr-2 h-4 w-4" />
                          View Full Details
                        </button>
                        {!order.isDelivered &&
                          order.buyer.toLowerCase() ===
                            currentAccount?.toLowerCase() && (
                            <button
                              onClick={() => cancelOrder(order.id)}
                              disabled={fulfillingOrder === order.id}
                              className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                                fulfillingOrder === order.id
                                  ? "bg-gray-600"
                                  : "bg-red-600 hover:bg-red-700"
                              }`}
                            >
                              {fulfillingOrder === order.id ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                  Cancelling...
                                </>
                              ) : (
                                <>
                                  <XCircle className="-ml-1 mr-2 h-4 w-4" />
                                  Cancel Order
                                </>
                              )}
                            </button>
                          )}
                        {order.isPaid &&
                          !order.isDelivered &&
                          order.seller.toLowerCase() ===
                            currentAccount?.toLowerCase() && (
                            <button
                              onClick={() => confirmDelivery(order.id)}
                              disabled={fulfillingOrder === order.id}
                              className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                                fulfillingOrder === order.id
                                  ? "bg-gray-600"
                                  : "bg-purple-600 hover:bg-purple-700"
                              }`}
                            >
                              {fulfillingOrder === order.id ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="-ml-1 mr-2 h-4 w-4" />
                                  Confirm Delivery
                                </>
                              )}
                            </button>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full border border-gray-700">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Package className="mr-2 text-purple-400" />
                Order Details #{selectedOrder.id}
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Product Details
                </h3>
                {products[selectedOrder.productId] ? (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <img
                        src={bytesToImageUrl(
                          products[selectedOrder.productId].image
                        )}
                        alt={products[selectedOrder.productId].name}
                        className="h-24 w-24 rounded-lg object-cover border border-gray-700"
                      />
                      <div className="ml-4">
                        <h4 className="text-lg font-medium">
                          {products[selectedOrder.productId].name}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {products[selectedOrder.productId].productType}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-gray-500">Condition</span>
                        <p className="text-sm">
                          {products[selectedOrder.productId].condition}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Price</span>
                        <p className="text-lg font-mono">
                          {products[selectedOrder.productId].price} BRTX
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Description</span>
                      <p className="text-sm">
                        {products[selectedOrder.productId].description ||
                          "No description available"}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-700">
                      <span className="text-xs text-gray-500">Seller</span>
                      <p className="text-sm">
                        {formatAddress(
                          products[selectedOrder.productId].seller
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    Loading product details...
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {!selectedOrder.isPaid && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      Payment Required (BRTX Token)
                    </h3>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex flex-col items-center">
                        <div className="mb-4 p-2 bg-white rounded">
                          <QRCode
                            value={`ethereum:${
                              erc_config.address
                            }@11155111/transfer?address=${
                              selectedOrder.seller
                            }&uint256=${
                              products[selectedOrder.productId]?.priceRaw || "0"
                            }`}
                            size={160}
                            level="H"
                          />
                        </div>
                        <p className="text-sm text-gray-300 mb-2">
                          Scan to transfer BRTX tokens to seller
                        </p>
                        <div className="text-center w-full">
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-gray-400">Amount</p>
                              <p className="text-lg font-mono">
                                {products[selectedOrder.productId]?.price ||
                                  "0"}{" "}
                                BRTX
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">
                                Seller Address
                              </p>
                              <p className="text-sm">
                                {formatAddress(selectedOrder.seller)}
                              </p>
                            </div>
                          </div>
                          <div className="bg-gray-800 p-3 rounded-lg">
                            <p className="text-xs text-gray-400">
                              Token Contract
                            </p>
                            <p className="text-sm font-mono">
                              {formatAddress(erc_config.address)}
                            </p>
                          </div>
                          <div className="mt-3 text-xs text-gray-500">
                            Network: Sepolia (Chain ID: 11155111)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Order Status
                  </h3>
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      {selectedOrder.isPaid ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                          <span>Payment Received</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-5 w-5 text-yellow-400 mr-2" />
                          <span>Awaiting Payment</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={async () => {
                          const isPaid = await checkPaymentStatus(
                            selectedOrder.id
                          );
                          if (isPaid) {
                            setPaymentStatus((prev) => ({
                              ...prev,
                              [selectedOrder.id]: "detected",
                            }));
                          } else {
                            setError("Payment not yet received");
                          }
                        }}
                        className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded"
                      >
                        Check Payment
                      </button>
                      <button
                        onClick={async () => {
                          const provider = new ethers.BrowserProvider(
                            window.ethereum
                          );
                          await fetchOrdersAndProducts(provider, true);
                        }}
                        className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh
                      </button>
                    </div>
                  </div>
                </div>

                {selectedOrder.isPaid && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      Delivery Status
                    </h3>
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        {selectedOrder.isDelivered ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                            <span>Delivered</span>
                          </>
                        ) : (
                          <>
                            <Truck className="h-5 w-5 text-blue-400 mr-2" />
                            <span>In transit</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-900/50 rounded-lg text-sm">
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              {!selectedOrder.isDelivered &&
                selectedOrder.buyer.toLowerCase() ===
                  currentAccount?.toLowerCase() && (
                  <button
                    onClick={() => cancelOrder(selectedOrder.id)}
                    disabled={fulfillingOrder === selectedOrder.id}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                      fulfillingOrder === selectedOrder.id
                        ? "bg-gray-600"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {fulfillingOrder === selectedOrder.id ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle className="-ml-1 mr-2 h-4 w-4" />
                        Cancel Order
                      </>
                    )}
                  </button>
                )}
              {selectedOrder.isPaid &&
                !selectedOrder.isDelivered &&
                selectedOrder.seller.toLowerCase() ===
                  currentAccount?.toLowerCase() && (
                  <button
                    onClick={() => confirmDelivery(selectedOrder.id)}
                    disabled={fulfillingOrder === selectedOrder.id}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                      fulfillingOrder === selectedOrder.id
                        ? "bg-gray-600"
                        : "bg-purple-600 hover:bg-purple-700"
                    }`}
                  >
                    {fulfillingOrder === selectedOrder.id ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="-ml-1 mr-2 h-4 w-4" />
                        Confirm Delivery
                      </>
                    )}
                  </button>
                )}
              {!selectedOrder.isPaid &&
                selectedOrder.seller.toLowerCase() ===
                  currentAccount?.toLowerCase() && (
                  <button
                    onClick={() => confirmDelivery(selectedOrder.id)}
                    disabled={fulfillingOrder === selectedOrder.id}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                      fulfillingOrder === selectedOrder.id
                        ? "bg-gray-600"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {fulfillingOrder === selectedOrder.id ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Verify Payment & Deliver
                      </>
                    )}
                  </button>
                )}
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">User Settings</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userDetails.name}
                  onChange={(e) =>
                    setUserDetails({ ...userDetails, name: e.target.value })
                  }
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Aadhar Number
                </label>
                <input
                  type="text"
                  value={userDetails.aadharNumber}
                  onChange={(e) =>
                    setUserDetails({
                      ...userDetails,
                      aadharNumber: e.target.value,
                    })
                  }
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600"
                  pattern="[0-9]{12}"
                  title="12-digit Aadhar number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={userDetails.phoneNumber}
                  onChange={(e) =>
                    setUserDetails({
                      ...userDetails,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600"
                  pattern="[0-9]{10}"
                  title="10-digit phone number"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 border border-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
