"use client";

import { AddressFetcher } from "@/components/Connect";
import { useInstance } from "@/contract/hooks/useInstance";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import getAddress from "@/hooks/getAddress";

const Dashboard = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const address = getAddress();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const contract = await useInstance();
        const count = Number(await contract.productCount());

        const fetchedProducts = [];

        for (let i = 1; i <= count; i++) {
          try {
            const productData = await contract.store(i);
            if (
              productData.seller.toLowerCase() === (await address).toLowerCase()
            ) {
              fetchedProducts.push({
                id: i,
                name: ethers.decodeBytes32String(productData.name),
                price: ethers.formatUnits(productData.price.toString(), 18),
                stock: productData.stock.toString(),
                description: ethers.toUtf8String(productData.description),
                image: ethers.toUtf8String(productData.image),
                productType: ethers.decodeBytes32String(
                  productData.productType
                ),
                condition: ethers.decodeBytes32String(productData.condition),
                seller: productData.seller,
              });
            }
          } catch (error) {
            console.error(`Error fetching product ${i}:`, error);
          }
        }

        setProducts(fetchedProducts);
        console.log("Fetched products:", fetchedProducts);
      } catch (error) {
        console.error("Error connecting to contract:", error);
      }
    };

    fetchProducts();
  }, [address]);

  return (
    <div className="p-6 font-mono">
      <div className="mb-10">
        <Card className="flex items-start gap-4 bg-gradient-to-br from-red-900/70 to-red-800/40 p-4 border border-red-400/30 rounded-xl w-full md:w-auto">
          <div className="mt-1 flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="text-gray-300">
            Keep Your Dashboard Secure! Unauthorized access can lead to
            malicious listings or unwanted products under your account. Protect
            your assets—never share your credentials!
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <Card className="h-full bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer rounded-2xl p-4">
              <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-product.png";
                    }}
                  />
                )}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {product.name}
              </h3>
              <p className="text-gray-400 text-sm mb-2 line-clamp-3">
                {product.description}
              </p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-green-400 font-bold">
                  {product.price} BRTX
                </span>
                <span className="text-sm text-gray-400">
                  Stock: {product.stock}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-sm text-gray-400">
                <span>{product.productType}</span>
                <span>{product.condition}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No products found in your dashboard
        </div>
      )}
    </div>
  );
};

export default Dashboard;
