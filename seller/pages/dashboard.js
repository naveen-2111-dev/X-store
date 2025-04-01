import NavBar from "@/components/NavBar";
import "@/app/globals.css";
import Link from "next/link";


export default function Dashboard() {
  return (
    <div className="min-h-screen relative">
      {/* NavBar with proper z-index */}
      <div className="relative z-50">
        <NavBar />
      </div>
      {/* Full-screen Hero Section */}
      <section className="flex items-center justify-center px-6">
        
        {/* Background Gradient Animations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-r from-lime-400/10 to-green-500/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-r from-lime-400/5 to-green-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          
          {/* Animated Icon */}
          <div className="mb-8 flex justify-center">
            <div className="p-5 bg-gradient-to-br from-lime-400 to-green-500 rounded-2xl shadow-2xl shadow-lime-400/20 animate-pulse-slow">
              <svg
                className="w-16 h-16 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-bold bg-gradient-to-r from-lime-400 to-green-500 bg-clip-text text-transparent mb-6 leading-tight">
            Launch Your Products <br /> in the Metaverse
          </h1>

          {/* Description */}
          <p className="text-xl text-lime-200/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Showcase your digital assets to a global audience with our decentralized marketplace.
            <span className="block mt-2 text-lime-400/90 font-medium">
              Zero fees • Instant visibility • Web3 powered
            </span>
          </p>

          {/* CTA Button */}
          <Link href="/AddProducts">
            <button className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-lime-400 to-green-500 rounded-xl font-bold text-black hover:shadow-2xl hover:shadow-lime-400/30 transition-all duration-300 transform hover:-translate-y-1">
              <span className="relative z-10 flex items-center">
                Start Listing Now
                <svg
                  className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-lime-400 to-green-500 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>
            </button>
          </Link>

          {/* Features Grid */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {["NFT Support", "0% Fees", "Instant Settlement", "DAO Governance"].map((feature) => (
              <article
                key={feature}
                className="p-4 bg-black/20 backdrop-blur-sm border border-lime-400/20 rounded-xl hover:border-lime-400/40 transition-colors"
              >
                <span className="text-lime-400/80 text-sm font-medium">{feature}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
