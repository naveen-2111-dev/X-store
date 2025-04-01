import { ethers } from "ethers";

export default async function addProduct(
  executeTransaction,
  Price,
  Stock,
  ProductName,
  ProductImage,
  ProductDescription,
  ProductType,
  ProductCondition
) {
  try {
    const parsedPrice = ethers.parseUnits(Price.toString(), 18);

    const args = [
      parsedPrice,
      Stock,
      ethers.encodeBytes32String(ProductName),
      ethers.toUtf8Bytes(ProductImage),
      ethers.toUtf8Bytes(ProductDescription),
      ethers.encodeBytes32String(ProductType),
      ethers.encodeBytes32String(ProductCondition),
    ];

    const res = await executeTransaction(...args);
    console.log("Transaction Result:", res);
  } catch (error) {
    console.error("Error executing contract function:", error);
    alert("An error occurred! Please try again.");
  }
}
