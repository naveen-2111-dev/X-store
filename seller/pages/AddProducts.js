import Sidebar from "@/components/Sidebar";
import NavBar from "@/components/NavBar";
import ProductForm from "@/components/ProductForm";
import "@/app/globals.css";

export default function AddProducts() {
  return (
    <div className="min-h-screen relative">
      <div className="relative z-50">
        <NavBar />
      </div>
      <div className="flex flex-col h-screen bg-black text-white">
        <div className="flex flex-1">
          <Sidebar className="w-64 border-r border-gray-800" />

          <main className="flex-1 p-8">
            <ProductForm
              onSubmit={(formData) => {
                console.log("Product Data Submitted:", formData);
              }}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
