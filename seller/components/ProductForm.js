"use client";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useContract } from "@/contract/hooks/useContract";
import addProduct from "@/contract/services/AddProducts";
import { useEffect, useState } from "react";
import useUpload from "@/hooks/usePinata";
import { Plus } from "lucide-react";

export default function ProductForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    type: "",
    condition: "new",
    image: null,
    stock: 1,
  });

  const [executeTransaction, setExecuteTransaction] = useState(null);
  const [transactionError, setTransactionError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchContractFunction = async () => {
      const contractFunction = await useContract({
        functionName: "addProduct",
      });
      setExecuteTransaction(() => contractFunction);
    };

    fetchContractFunction();
  }, []);

  const callContractFunction = async () => {
    if (!executeTransaction) {
      setTransactionError("Contract connection not initialized");
      return;
    }

    setTransactionError(null);
    setIsSubmitting(true);

    try {
      await addProduct(
        executeTransaction,
        formData.price.toString(),
        formData.stock,
        formData.name,
        formData.image,
        formData.description,
        formData.type,
        formData.condition
      );
      onSubmit?.();
    } catch (error) {
      if (error.code === 4001 || error.code === 4100) {
        setTransactionError("Transaction canceled by user");
      } else if (error.message?.includes("user rejected transaction")) {
        setTransactionError("You rejected the transaction");
      } else {
        setTransactionError(error.message || "Transaction failed");
      }
      console.error("Transaction error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      const uploadResult = await useUpload(file);
      if (uploadResult.success) {
        setFormData((prev) => ({
          ...prev,
          image: uploadResult.imageUrl,
        }));
      } else {
        console.error("Upload failed:", uploadResult.error);
        setTransactionError("Image upload failed");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gray-900/90 backdrop-blur-xl border border-lime-400/30 rounded-3xl shadow-2xl shadow-lime-400/10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-lime-400 to-green-500 bg-clip-text text-transparent">
            ADD NEW PRODUCT
          </h2>
          <p className="text-lime-300/80 mt-1">
            List your item on the blockchain marketplace
          </p>
        </div>

        <Card className="flex items-start gap-4 bg-gradient-to-br from-red-900/70 to-red-800/40 p-4 border border-red-400/30 rounded-xl w-full md:w-auto">
          <div className="mt-1 flex-shrink-0 animate-pulse">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="text-gray-200 text-sm">
            <h3 className="font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              SECURITY NOTICE
            </h3>
            <p className="text-gray-300">
              Protect your dashboard from unauthorized access
            </p>
          </div>
        </Card>
      </div>

      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-lime-300 text-sm font-medium uppercase tracking-wider">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-800/60 border border-lime-400/40 rounded-lg 
                         focus:border-lime-400 focus:ring-2 focus:ring-lime-400/30 
                         hover:border-lime-400/60 transition-all duration-200 text-lime-100
                         placeholder:text-lime-400/40"
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-lime-300 text-sm font-medium uppercase tracking-wider">
              Price (BTX)
            </label>
            <div className="relative">
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800/60 border border-lime-400/40 rounded-lg 
                           focus:border-lime-400 focus:ring-2 focus:ring-lime-400/30 
                           hover:border-lime-400/60 transition-all duration-200 text-lime-100
                           placeholder:text-lime-400/40 pr-12"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lime-400/70 font-mono text-sm">
                BTX
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-lime-300 text-sm font-medium uppercase tracking-wider">
              Available Stock
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-800/60 border border-lime-400/40 rounded-lg 
                         focus:border-lime-400 focus:ring-2 focus:ring-lime-400/30 
                         hover:border-lime-400/60 transition-all duration-200 text-lime-100
                         placeholder:text-lime-400/40"
              placeholder="Quantity"
              min="1"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-lime-300 text-sm font-medium uppercase tracking-wider">
              Product Type
            </label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-800/60 border border-lime-400/40 rounded-lg 
                         focus:border-lime-400 focus:ring-2 focus:ring-lime-400/30 
                         hover:border-lime-400/60 transition-all duration-200 text-lime-100
                         placeholder:text-lime-400/40"
              placeholder="e.g., Electronics, Clothing"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-lime-300 text-sm font-medium uppercase tracking-wider">
              Condition
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-800/60 border border-lime-400/40 rounded-lg 
                         focus:border-lime-400 focus:ring-2 focus:ring-lime-400/30 
                         hover:border-lime-400/60 transition-all duration-200 text-lime-100
                         appearance-none"
            >
              <option value="new" className="bg-gray-900">
                New
              </option>
              <option value="used" className="bg-gray-900">
                Used
              </option>
              <option value="refurbished" className="bg-gray-900">
                Refurbished
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-lime-300 text-sm font-medium uppercase tracking-wider">
              Product Image
            </label>
            <div className="relative">
              <label
                className="flex flex-col items-center justify-center h-full min-h-[120px] border-2 border-dashed border-lime-400/40 rounded-lg 
                            hover:border-lime-400/60 hover:bg-gray-800/30 transition-all duration-200 cursor-pointer"
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-24 object-cover rounded-md mb-2"
                    />
                  ) : (
                    <>
                      <svg
                        className="w-8 h-8 mb-2 text-lime-400/60"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <p className="text-sm text-lime-400/70">
                        Click to upload
                      </p>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-lime-300 text-sm font-medium uppercase tracking-wider">
            Product Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-800/60 border border-lime-400/40 rounded-lg 
                       focus:border-lime-400 focus:ring-2 focus:ring-lime-400/30 
                       hover:border-lime-400/60 transition-all duration-200 text-lime-100
                       placeholder:text-lime-400/40 h-32 resize-none"
            placeholder="Describe your product in detail..."
            required
          />
        </div>

        {transactionError && (
          <div className="p-4 bg-red-900/40 border border-red-400/30 rounded-lg flex items-start gap-3 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-red-300 text-sm">{transactionError}</div>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={callContractFunction}
            disabled={isSubmitting}
            className={`w-full py-4 bg-gradient-to-r from-lime-500 to-green-600 rounded-lg
                      hover:from-lime-400 hover:to-green-500 hover:shadow-[0_0_30px_-5px_rgba(132,255,0,0.3)]
                      active:scale-[0.98] transition-all duration-200 font-bold text-black
                      flex items-center justify-center gap-2
                      ${isSubmitting ? "opacity-80 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Transaction...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                LIST PRODUCT ON BLOCKCHAIN
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
