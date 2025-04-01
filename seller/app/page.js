"use client";
import WalletConnect from "@/components/Connect";
import Aurora from "@/components/Aurora";
import { useEffect, useState } from "react";
import FolderStack from "@/components/FolderStack";

export default function Home() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const particleCount = window.innerWidth < 768 ? 15 : 20;
    const newParticles = Array.from({ length: particleCount }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="relative w-full min-h-screen h-auto overflow-hidden flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 py-12 sm:py-16 md:py-20 lg:py-0">
      <div className="absolute inset-0 -z-10 opacity-40">
        <Aurora
          colorStops={["#b2ff14", "#9ef01a", "#70e000"]}
          amplitude={1.5}
          blend={0.4}
        />
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
        <div className="flex-1 max-w-xl sm:max-w-2xl xl:max-w-3xl space-y-4 sm:space-y-6 lg:space-y-8 text-center lg:text-left">
          <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black">
            <span className="bg-gradient-to-r from-lime-400 to-emerald-500 bg-clip-text text-transparent">
              Step into
            </span>
            <br />
            <span className="text-white/90 mt-1 sm:mt-2 lg:mt-4 block">
              the future of digital art.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl font-mono text-lime-100/80 font-light max-w-md sm:max-w-lg md:max-w-xl mx-auto lg:mx-0">
            Create, collect, and trade unique digital assets secured by
            blockchain technology. Experience art in motion with our immersive
            NFT platform.
          </p>

          <div className="relative inline-block mt-4 sm:mt-6">
            <WalletConnect className="rounded-xl bg-gradient-to-br from-lime-500/30 to-emerald-600/20 backdrop-blur-xl border border-lime-400/20 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base hover:border-lime-400/40 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(190,255,100,0.3)] hover:shadow-[0_0_50px_-5px_rgba(190,255,100,0.5)]" />
            <div className="absolute inset-0 -z-10 bg-lime-500/10 blur-3xl animate-pulse" />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center lg:justify-end w-full h-full mt-8 sm:mt-12 lg:mt-0">
          <FolderStack className="w-[200px] h-[250px] xs:w-[250px] xs:h-[300px] sm:w-[300px] sm:h-[400px] lg:w-[350px] lg:h-[450px] xl:w-[400px] xl:h-[500px]" />
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-lime-400/40 rounded-full animate-float"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
}
