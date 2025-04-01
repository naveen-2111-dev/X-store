import Dashboard from "@/components/Dashboard";
import Sidebar from "@/components/Sidebar";
import NavBar from "@/components/NavBar";
import "@/app/globals.css";

function App() {
  return (
    <div>
      <NavBar className="h-16 border-b border-gray-800 shadow-lg" />
      <div className="flex flex-col h-screen bg-black text-white">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar className="w-64 border-r border-gray-800" />

          <div className="flex-1 overflow-auto">
            <Dashboard className="p-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
