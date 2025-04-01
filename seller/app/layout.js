import StoreProvider from "./StoreProvider";
import "@/app/globals.css";

export const metadata = {
  title: "BarterX Product Dashboard",
  description: "Add your products and let users buy them.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <StoreProvider>
          <main>{children}</main>
        </StoreProvider>
      </body>
    </html>
  );
}
