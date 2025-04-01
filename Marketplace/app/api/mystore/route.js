import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const nftsResponse = await axios.get(
      `https://testnets-api.opensea.io/api/v2/chain/sepolia/account/${walletAddress}/nfts`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const nfts = nftsResponse.data.nfts || [];

    const enhancedNFTs = await Promise.all(
      nfts.map(async (nft) => {
        try {
          const collectionResponse = await axios.get(
            `https://testnets-api.opensea.io/api/v2/collections/${nft.collection}/stats`,
            {
              headers: {
                "X-API-KEY": process.env.OPENSEA_API_KEY || "",
              },
            }
          );

          const listingsResponse = await axios.get(
            `https://testnets-api.opensea.io/api/v2/chain/sepolia/contract/${nft.contract}/nfts/${nft.identifier}/listings`
          );

          const listings = listingsResponse.data.listings || [];
          const lowestPrice =
            listings.length > 0 ? listings[0].price.current.value : null;
          const currency =
            listings.length > 0 ? listings[0].price.current.currency : null;

          return {
            ...nft,
            collection_name: collectionResponse.data?.name || nft.collection,
            collection_stats: collectionResponse.data?.stats || {},
            price: lowestPrice,
            currency: currency,
            listed: listings.length > 0,
          };
        } catch (error) {
          console.error(
            `Error enhancing NFT ${nft.identifier}:`,
            error.message
          );
          return {
            ...nft,
            collection_name: nft.collection,
            price: null,
            currency: null,
            listed: false,
          };
        }
      })
    );

    return NextResponse.json(enhancedNFTs);
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch NFTs" },
      { status: error.response?.status || 500 }
    );
  }
}
