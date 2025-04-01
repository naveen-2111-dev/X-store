import NftContract_config from "@/contract/Nftname_transfer.json";
import Marketplace_config from "@/contract/Market_place.json";
import Erc_config from "@/contract/Erc20.json";
import { ethers } from "ethers";
import { approveToken } from "./approval";
import { erc721Abi } from "viem";

export async function useContract() {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask or similar wallet extension not detected!");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    if (!signer) {
      throw new Error("Signer not found! Please connect your wallet.");
    }

    const Nft = new ethers.Contract(
      NftContract_config.address,
      NftContract_config.abi,
      signer
    );
    const BRTX = new ethers.Contract(
      Erc_config.address,
      Erc_config.abi,
      signer
    );
    const Marketplace = new ethers.Contract(
      Marketplace_config.address,
      Marketplace_config.abi,
      signer
    );

    const PlaceOrder = async (productId, isPrepaid) => {
      try {
        const marketPlaceContract = new ethers.Contract(
          Marketplace_config.address,
          Marketplace_config.abi,
          signer
        );

        const storeData = await marketPlaceContract.store(productId);

        if (isPrepaid) {
          await approveToken(
            signer,
            Marketplace_config.address,
            storeData.price
          );
        }

        const tx = await marketPlaceContract.buyProduct(productId, isPrepaid);
        await tx.wait();

        return true;
      } catch (error) {
        console.error("Purchase failed:", error.message);
        throw error;
      }
    };

    const GetProducts = async () => {
      const productCount = await Marketplace.productCount();
      const products = [];

      for (let i = 1; i < productCount; i++) {
        const productData = await Marketplace.store(i);
        products.push(productData);
      }

      console.log(products);
      return products;
    };

    const NameTransfer = async (
      nftContractAddress,
      tokenId,
      brtxAmount = "1"
    ) => {
      try {
        const nftContract = new ethers.Contract(
          nftContractAddress,
          erc721Abi,
          signer
        );

        const owner = await nftContract.ownerOf(tokenId);
        if (owner.toLowerCase() !== signer.address.toLowerCase()) {
          throw new Error("You don't own this NFT");
        }

        const approvedAddress = await nftContract.getApproved(tokenId);
        const nftManagerAddress = NftContract_config.address;
        if (
          approvedAddress?.toLowerCase() !== nftManagerAddress.toLowerCase()
        ) {
          console.log("Approving NFT transfer...");
          const approvalTx = await nftContract.approve(
            nftManagerAddress,
            tokenId
          );
          await approvalTx.wait();
          console.log("NFT Approval confirmed");
        }

        console.log("Depositing NFT...");
        const depositTx = await Nft.depositNFT(
          nftContractAddress,
          tokenId,
          ethers.parseEther(brtxAmount)
        );
        await depositTx.wait();

        console.log("NFT deposited and BRTX minted!");
        return true;
      } catch (error) {
        console.error("Transfer failed:", error);
        throw error;
      }
    };

    return {
      NameTransfer,
      GetProducts,
      PlaceOrder,
      contracts: { Nft, BRTX, Marketplace },
    };
  } catch (error) {
    console.error("Contract initialization failed:", error);
    throw new Error(`Contract initialization failed: ${error.message}`);
  }
}
