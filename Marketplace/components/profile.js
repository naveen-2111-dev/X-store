"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useAccount, useEnsAvatar, useEnsName } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  MoreVertical,
  X,
  ExternalLink,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import SetSlug from "@/services/saveSlug";
import GetSlug from "@/services/getslug";

const ProfileSkeleton = () => (
  <div className="min-h-screen bg-black text-white relative">
    <div className="relative h-80 bg-gradient-to-br from-black to-[#151515] rounded-b-3xl">
      <div className="absolute -bottom-20 left-6 flex items-end">
        <div className="w-28 h-28 bg-[#252525] rounded-full border-4 border-black animate-pulse" />
        <div className="ml-6 mb-1 space-y-4">
          <div className="h-8 w-48 bg-[#252525] rounded animate-pulse" />
          <div className="flex gap-3">
            <div className="h-8 w-32 bg-[#252525] rounded-full animate-pulse" />
            <div className="h-8 w-24 bg-[#252525] rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#404040] animate-pulse"
          >
            <div className="w-full aspect-square bg-[#252525]" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 rounded bg-[#252525]" />
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-3 w-12 rounded bg-[#252525]" />
                  <div className="h-4 w-16 rounded bg-[#252525]" />
                </div>
                <div className="h-8 w-20 rounded bg-[#252525]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { data: avatar } = useEnsAvatar({ name: ensName });
  const [menuOpen, setMenuOpen] = useState(false);
  const [slugPopup, setSlugPopup] = useState(false);
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [nftData, setNftData] = useState({
    ownerNFTs: [],
    listedNFTs: [],
    collectionName: ""
  });
  const menuRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        slugPopup
      ) {
        setSlugPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [slugPopup]);

  useEffect(() => {
    async function fetchNFTs() {
      if (!address) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const slugData = await GetSlug(address);
        if (slugData?.collections?.[0]?.data) {
          const { ownerNFTs = [], listedNFTs = [] } = slugData.collections[0].data;
          setNftData({
            ownerNFTs,
            listedNFTs,
            collectionName: slugData.collections[0].slug || "My Collection"
          });
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchNFTs();
  }, [address]);

  const isValidSlug = (slug) => {
    return /^(?!-)(?!.*--)[a-z0-9-]+(?<!-)$/.test(slug);
  };

  const handleSaveSlug = async () => {
    setLoading(true);
    if (!slug.trim()) {
      alert("Please enter a valid slug");
      setLoading(false);
      return;
    }
    if (!isValidSlug(slug)) {
      alert(
        "Slug can only contain lowercase letters, numbers, and single hyphens (no leading, trailing, or consecutive hyphens)"
      );
      setLoading(false);
      return;
    }
    try {
      const res = await SetSlug(address, slug);
      if (!res) {
        console.log("Failed to save slug");
        return;
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setSlug("");
      setSlugPopup(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isNFTListed = (nft) => {
    return nftData.listedNFTs.some(
      listedNFT => listedNFT.identifier === nft.identifier
    );
  };

  const getListingDetails = (nft) => {
    return nftData.listedNFTs.find(
      listedNFT => listedNFT.identifier === nft.identifier
    );
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl">Connect your wallet to view profile</h2>
        <ConnectButton />
      </div>
    );
  }

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="relative h-80 bg-gradient-to-br from-black to-[#151515] rounded-b-3xl">
        <div className="absolute top-6 right-6">
          <div className="relative" ref={menuRef}>
            <button
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreVertical size={24} className="text-white" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-[#404040] rounded-lg shadow-lg p-1 z-10 animate-fade-in">
                <button
                  className="w-full flex items-center px-4 py-2 text-sm text-white hover:bg-[#b2ff00]/20 rounded transition-colors"
                  onClick={() => {
                    setMenuOpen(false);
                    setSlugPopup(true);
                  }}
                >
                  <span className="text-[#b2ff00] mr-2">+</span> Add Slug
                </button>
                <button className="w-full flex items-center px-4 py-2 text-sm text-white hover:bg-[#b2ff00]/20 rounded transition-colors">
                  <ExternalLink size={16} className="mr-2" /> View on Explorer
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="absolute -bottom-20 left-6 flex items-end">
          <div className="relative group">
            {avatar ? (
              <Image
                src={avatar}
                alt="Profile"
                width={120}
                height={120}
                className="w-28 h-28 rounded-full border-4 border-black object-cover shadow-lg shadow-[#b2ff00]/30 hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-28 h-28 bg-[#b2ff00] rounded-full border-4 border-black flex items-center justify-center shadow-lg shadow-[#b2ff00]/30 hover:scale-105 transition-transform">
                <span className="text-black font-bold text-3xl">
                  {address?.slice(2, 4).toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute -inset-2 rounded-full border-2 border-[#b2ff00] opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none"></div>
          </div>
          <div className="ml-6 mb-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#b2ff00] to-white">
                {ensName || "DapRader"}
              </h1>
              <button
                onClick={copyAddress}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
                title="Copy address"
              >
                {copied ? (
                  <Check size={18} className="text-[#b2ff00]" />
                ) : (
                  <Copy size={18} />
                )}
              </button>
            </div>
            <div className="flex items-center mt-3 gap-3">
              <span className="text-[#b2ff00] text-sm font-mono bg-black/50 px-3 py-1.5 rounded-full border border-[#404040]">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <span className="text-sm bg-[#b2ff00]/10 text-[#b2ff00] px-3 py-1.5 rounded-full border border-[#b2ff00]/20">
                {nftData.ownerNFTs.length} NFTs
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
        {nftData.listedNFTs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-[#fffff]">Listed NFTs</span>
              <span className="text-sm bg-[#b2ff00]/10 text-[#b2ff00] px-2 py-1 rounded">
                {nftData.listedNFTs.length} for sale
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {nftData.listedNFTs.map((nft) => {
                const listing = getListingDetails(nft);
                return (
                  <NFTCard 
                    key={`listed-${nft.identifier}`} 
                    nft={nft} 
                    isListed={true}
                    price={listing ? (parseInt(listing.price?.value || "0") / 1e18) : 0}
                  />
                );
              })}
            </div>
          </div>
        )}
        <h2 className="text-xl font-bold mb-6">{nftData.collectionName}</h2>
        {nftData.ownerNFTs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {nftData.ownerNFTs.map((nft) => {
              const isListed = isNFTListed(nft);
              const listing = isListed ? getListingDetails(nft) : null;
              return (
                <NFTCard 
                  key={`owned-${nft.identifier}`} 
                  nft={nft} 
                  isListed={isListed}
                  price={listing ? (parseInt(listing.price?.value || "0") / 1e18) : 0}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400">No NFTs found in your collection</p>
          </div>
        )}
      </div>
      {slugPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div
            ref={popupRef}
            className="bg-[#1a1a1a] p-6 rounded-xl border border-[#404040] w-full max-w-md shadow-xl transform transition-all duration-300 scale-95 hover:scale-100"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Create New Slug</h2>
              <button
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
                onClick={() => setSlugPopup(false)}
              >
                <X size={20} className="text-white" />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                Slug URL
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md bg-[#252525] border border-r-0 border-[#404040] text-gray-400 text-sm">
                  testnets.opensea.io/collection/
                </span>
                <input
                  type="text"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-r-md bg-[#252525] border border-[#404040] text-white focus:ring-2 focus:ring-[#b2ff00] focus:border-transparent"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="your-slug"
                  onKeyDown={(e) => e.key === "Enter" && handleSaveSlug()}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Only lowercase letters, numbers, and hyphens allowed
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-white bg-transparent border border-[#404040] rounded-lg hover:bg-[#252525] transition-colors"
                onClick={() => setSlugPopup(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-black bg-[#b2ff00] rounded-lg hover:bg-[#a0e000] transition-colors font-medium flex items-center justify-center gap-2"
                onClick={handleSaveSlug}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Save Slug</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const NFTCard = ({ nft, isListed, price }) => {
  return (
    <div className={`bg-[#1a1a1a] rounded-xl overflow-hidden border ${
      isListed 
        ? 'border-[#b2ff00] shadow-[0_0_15px_-5px_#b2ff00]' 
        : 'border-[#404040] hover:border-[#b2ff00]/50'
    } transition-all group relative`}>
      {isListed && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm border border-[#b2ff00] text-[#b2ff00] text-xs font-bold px-2 py-1 rounded-full z-10 transform transition-transform hover:scale-105">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="text-[#b2ff00]"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
        </svg>
        LISTED
      </div>
      )}
      <div className="w-full aspect-square relative overflow-hidden">
        {nft.image_url ? (
          <Image
            src={nft.image_url}
            alt={nft.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-black flex items-center justify-center">
            <span className="text-[#b2ff00]">No Image</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium group-hover:text-[#b2ff00] transition-colors truncate">
          {nft.name || `NFT #${nft.identifier}`}
        </h3>
        <div className="flex justify-between items-center mt-3">
          <div>
            <p className="text-xs text-gray-400">
              {isListed ? "Price" : "ID"}
            </p>
            {isListed ? (
              <span className="text-[#b2ff00] text-sm font-mono">
                {price} ETH
              </span>
            ) : (
              <span className="text-[#b2ff00] text-sm font-mono">
                #{nft.identifier}
              </span>
            )}
          </div>
          <a
            href={nft.opensea_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-[#b2ff00]/10 text-[#b2ff00] px-3 py-1.5 rounded-lg border border-[#b2ff00]/30 hover:bg-[#b2ff00]/20 transition-colors flex items-center gap-1"
          >
            <ExternalLink size={14} /> View
          </a>
        </div>
      </div>
    </div>
  );
};