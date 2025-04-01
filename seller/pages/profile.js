'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import NavBar from '@/components/NavBar';
import "@/app/globals.css"

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [nfts, setNfts] = useState([]);
    const [activeTab, setActiveTab] = useState('collected');
    const [loading, setLoading] = useState(true);

    const [walletAddress, setWalletAddress] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedWallet = localStorage.getItem("walletAddress");
            if (storedWallet) {
                setWalletAddress(storedWallet);
            }
        }
    }, []);


    useEffect(() => {
        setTimeout(() => {
            setUser({
                name: 'Saran Srinivasan V',
                username: 'saran_srini',
                avatar: '/defaultavatar.png',
                banner: '/defaultbanner.png',
                stats: { collected: 142, created: 28, favorited: 89 }
            });
            setNfts([
                { id: 1, image: '/nft1.jpg', title: 'Digital Dreamscape', price: '0.45 ETH' },
                { id: 2, image: '/nft2.jpg', title: 'Crypto Genesis', price: '1.2 ETH' },
                { id: 3, image: '/nft3.jpg', title: 'Lime Vortex', price: '0.89 ETH' },
            ]);
            setLoading(false);
        }, 2000);
    }, []);



    return (
        <div>

            <NavBar />
            <div className="w-full max-w-5xl mx-auto p-4 bg-gradient-to-b from-gray-950 to-lime-950/20 min-h-screen font-mono">
                {/* Banner Section */}
                <div className="relative w-full h-48 bg-lime-900 overflow-hidden rounded-2xl shadow-2xl shadow-lime-900/30">
                    {loading ? (
                        <div className="w-full h-full bg-gradient-to-r from-lime-800 via-lime-700 to-lime-800 animate-pulse" />
                    ) : user?.banner && (
                        <Image
                            src={user.banner}
                            alt="Banner"
                            layout="fill"
                            objectFit="cover"
                            className="opacity-90 saturate-110"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-lime-950/60 to-transparent" />
                </div>

                {/* Profile Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-[-60px] px-4 relative  space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4">
                        {loading ? (
                            <div className="w-20 h-20 rounded-full border-4 border-lime-100/20 shadow-xl bg-gradient-to-r from-lime-700 to-lime-600 animate-pulse" />
                        ) : (
                            <div className="relative group">
                                <Image
                                    src={user.avatar}
                                    alt="Avatar"
                                    width={80}
                                    height={80}
                                    className="rounded-full border-4 border-lime-100/30 shadow-xl ring-2 ring-lime-500 group-hover:ring-4 transition-all duration-300"
                                />
                                <div className="absolute inset-0 rounded-full border-4 border-transparent group-hover:border-lime-500/20 transition-all duration-300" />
                            </div>
                        )}
                        <div>
                            {loading ? (
                                <>
                                    <div className="w-48 h-7 mb-2 bg-lime-700 rounded-full animate-pulse" />
                                    <div className="w-32 h-5 bg-lime-700 rounded-full animate-pulse" />
                                </>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-lime-100 drop-shadow-lg">{user?.name}</h2>

                                    {/* <p className="text-lg bg-black text-white font-mono px-2 py-1 inline-block">@{user?.username}</p> */}
                                    <p className="text-lg text-white font-mono px-4 py-2 inline-block bg-black/10 backdrop-blur-md rounded-lg border-0 border-black/20 shadow-lg">
                                        @{walletAddress || "Guest"}
                                    </p>

                                </>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    {!loading && (
                        <div className="flex space-x-6 bg-lime-900/30 px-6 py-3 rounded-xl backdrop-blur-sm">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-lime-300">{user.stats.collected}</p>
                                <p className="text-sm text-lime-400">Collected</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-lime-300">{user.stats.created}</p>
                                <p className="text-sm text-lime-400">Created</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-lime-300">{user.stats.favorited}</p>
                                <p className="text-sm text-lime-400">Favorited</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs Section */}
                <Tabs defaultValue="collected" className="w-full mt-8">
                    <TabsList className="grid w-full grid-cols-3 bg-lime-900/20 p-1 rounded-2xl h-14 backdrop-blur-sm border border-lime-800/30">
                        {['collected', 'created', 'favorited'].map((tab) => (
                            <TabsTrigger
                                key={tab}
                                value={tab}
                                className="data-[state=active]:bg-lime-500 data-[state=active]:text-lime-950 data-[state=active]:font-bold 
                                      text-lime-300 hover:bg-lime-500/20 rounded-xl py-2 transition-all duration-200 uppercase tracking-wider"
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* NFT Grid */}
                    <TabsContent value={activeTab} className="mt-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {loading ? (
                                [...Array(8)].map((_, index) => (
                                    <Card key={index} className="overflow-hidden border-0 bg-lime-900/10 backdrop-blur-sm animate-pulse">
                                        <CardContent className="p-0">
                                            <div className="w-full aspect-square bg-gradient-to-r from-lime-800 to-lime-700" />
                                            <div className="p-4">
                                                <div className="w-3/4 h-5 bg-lime-800 rounded-full mb-2" />
                                                <div className="w-1/2 h-4 bg-lime-800 rounded-full" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                nfts.map((nft) => (
                                    <Card
                                        key={nft.id}
                                        className="overflow-hidden border-0 bg-lime-900/10 backdrop-blur-sm hover:bg-lime-900/20 
                                              transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-lime-900/10 
                                              hover:shadow-lime-500/20 group"
                                    >
                                        <CardContent className="p-0 cursor-pointer">
                                            <div className="relative aspect-square">
                                                <Image
                                                    src={nft.image}
                                                    alt={nft.title}
                                                    layout="fill"
                                                    objectFit="cover"
                                                    className="brightness-95 group-hover:brightness-105 transition-all duration-300"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-lime-950/40 to-transparent" />
                                            </div>
                                            <div className="p-4 ">
                                                <h3 className="text-lg font-semibold text-lime-200">{nft.title}</h3>
                                                <p className="text-lime-400 text-sm mt-1 font-mono">{nft.price}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>

    );
};

export default ProfilePage;