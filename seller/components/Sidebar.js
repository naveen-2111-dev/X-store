import { Settings } from "lucide-react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const router = useRouter();

  // Function to determine if a button is active
  const isActive = (path) => router.pathname === path;

  return (
    <div className="flex w-60 flex-col justify-between border-r border-gray-800 bg-black p-5 font-mono">
      <div>
        <nav className="space-y-3">
          <Button
            variant="ghost"
            className={`w-full font-bold rounded-full border border-lime-500 px-3 py-6 text-center cursor-pointer 
              ${isActive("/AddProducts") ? "bg-lime-500 text-black" : "bg-white/10 hover:bg-zinc-700 backdrop-blur-md"}`}
            onClick={() => router.push("/AddProducts")}
          >
            Add Product
          </Button>

          <Button
            variant="ghost"
            className={`w-full font-bold rounded-full border border-lime-500 px-3 py-6 text-center cursor-pointer 
              ${isActive("/Profit") ? "bg-lime-500 text-black" : "bg-white/10 hover:bg-zinc-700 backdrop-blur-md"}`}
            onClick={() => router.push("/Profit")}
          >
            Total Earnings
          </Button>

          <Button
            variant="ghost"
            className={`w-full font-bold rounded-full border border-lime-500 px-3 py-6 text-center cursor-pointer 
              ${isActive("/productUI") ? "bg-lime-500 text-black" : "bg-white/10 hover:bg-zinc-700 backdrop-blur-md"}`}
            onClick={() => router.push("/productUI")}
          >
            My Products
          </Button>
        </nav>
      </div>

      <div>
        <Button
          variant="ghost"
          className="flex w-full items-center justify-start gap-2 hover:bg-zinc-800"
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
