import { Settings } from "lucide-react";
import ProfitShow from "@/components/ProfitShow"; // Import the ProfitShow component
import Sidebar from "@/components/Sidebar";
import NavBar from "@/components/NavBar";
import "@/app/globals.css"

function App() {
    return (
        <div>

            <NavBar className="h-16 border-b border-gray-800 shadow-lg" />
            <div className="flex flex-col h-screen bg-black text-white">
                {/* Top Navbar */}

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar */}
                    <Sidebar className="w-64 border-r border-gray-800" />

                    {/* Main Content Area with ProfitShow */}
                    <div className="flex-1 overflow-auto p-6">
                        <div className="max-w-7xl mx-auto">
                            <ProfitShow
                                totalProducts={245}
                                totalSales={125400}
                                totalProfit={45200}
                            />
                            {/* Add other content below if needed */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;