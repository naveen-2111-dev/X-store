import axios from "axios";

export default async function GetSlug(walletId) {
  try {
    if (!walletId) {
      console.error("No walletId provided");
      return null;
    }

    const res = await axios.post(
      "/api/getslug",
      { walletId },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (res.data?.error) {
      console.error("API Error:", res.data.error);
      return null;
    }

    const slugs = res.data?.data?.Slug || [];

    if (slugs.length === 0) {
      return { slugs: [], collections: [] };
    }

    const collections = [];
    for (const slug of slugs) {
      try {
        const collectionRes = await axios.get(
          `/api/opensea?slug=${encodeURIComponent(slug)}`
        );

        if (collectionRes.data?.data) {
          const collectionData = collectionRes.data.data;
          const { nftMetadata, ownerNFTs, listedNFTs } = await fetchNFTMetadata(
            collectionData,
            walletId
          );

          collections.push({
            slug,
            data: {
              ...collectionData,
              nftMetadata,
              ownerNFTs,
              listedNFTs,
            },
          });
        }
      } catch (error) {
        console.error(
          `Error fetching collection for slug ${slug}:`,
          error.message
        );
        collections.push({
          slug,
          error: error.message,
        });
      }
    }

    return {
      slugs,
      collections,
    };
  } catch (error) {
    console.error(
      "Error fetching slug:",
      error.response?.data || error.message
    );
    return null;
  }
}

async function fetchNFTMetadata(collectionData, walletId) {
  try {
    const contractAddress =
      collectionData.listings?.[0]?.protocol_data?.parameters?.offer?.[0]
        ?.token;

    if (!contractAddress) {
      return {
        nftMetadata: [],
        ownerNFTs: [],
        listedNFTs: [],
      };
    }

    const allNFTsUrl = `https://testnets-api.opensea.io/api/v2/chain/sepolia/contract/${contractAddress}/nfts`;
    const allNFTsResponse = await axios.get(allNFTsUrl);
    const allNFTs = allNFTsResponse.data.nfts || [];

    const ownerNFTs = await fetchOwnedNFTs(contractAddress, walletId);
    const listedNFTs = await fetchListedNFTs(
      collectionData,
      walletId,
      contractAddress
    );

    return {
      nftMetadata: allNFTs,
      ownerNFTs: ownerNFTs.map((nft) => ({
        ...nft,
        uniqueKey: `${contractAddress}-${nft.identifier}-owned`,
      })),
      listedNFTs: listedNFTs.map((nft) => ({
        ...nft,
        uniqueKey: `${contractAddress}-${nft.identifier}-listed-${nft.order_hash}`,
      })),
    };
  } catch (error) {
    console.error(
      "Error fetching NFTs:",
      error.response?.data || error.message
    );
    return { nftMetadata: [], ownerNFTs: [], listedNFTs: [] };
  }
}

async function fetchOwnedNFTs(contractAddress, walletAddress) {
  try {
    const url = `https://testnets-api.opensea.io/api/v2/chain/sepolia/account/${walletAddress}/nfts?asset_contract_address=${contractAddress}`;
    const response = await axios.get(url);
    return response.data.nfts || [];
  } catch (error) {
    console.error("Error fetching owned NFTs:", error.message);
    return [];
  }
}

async function fetchListedNFTs(collectionData, walletAddress, contractAddress) {
  try {
    const listings = collectionData.listings || [];

    const ownerListings = listings.filter(
      (listing) =>
        listing.protocol_data?.parameters?.offerer?.toLowerCase() ===
        walletAddress.toLowerCase()
    );

    if (ownerListings.length === 0) {
      return [];
    }

    const nftsUrl = `https://testnets-api.opensea.io/api/v2/chain/sepolia/contract/${contractAddress}/nfts`;
    const nftsResponse = await axios.get(nftsUrl);
    const allNFTs = nftsResponse.data.nfts || [];

    const nftMap = {};
    allNFTs.forEach((nft) => {
      nftMap[nft.identifier] = nft;
    });

    return ownerListings.map((listing) => {
      const offer = listing.protocol_data?.parameters?.offer?.[0];
      const tokenId = offer?.identifierOrCriteria;
      const nftMetadata = nftMap[tokenId] || {};

      return {
        identifier: tokenId,
        name: nftMetadata?.name || "Unknown",
        description: nftMetadata?.description || "",
        image_url: nftMetadata?.image_url || "",
        price:
          listing.protocol_data?.parameters?.consideration?.[0]?.startAmount,
        currency: listing.protocol_data?.parameters?.consideration?.[0]?.token,
        order_hash: listing.order_hash,
        contract_address: contractAddress,
      };
    });
  } catch (error) {
    console.error("Error fetching listed NFTs:", error.message);
    return [];
  }
}
