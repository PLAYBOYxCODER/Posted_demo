import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ClickSpark from "@/components/ClickSpark";
import { CartProvider } from "@/components/CartProvider";
import { OrderProvider } from "@/components/OrderProvider";
import { ProductProvider } from "@/components/ProductProvider";
import { VerifiedPhotoProvider } from "@/components/VerifiedPhotoProvider";
import { OffersProvider } from "@/components/OffersProvider";
import { AuthProvider } from "@/components/AuthProvider";
import DynamicTitle from "@/components/DynamicTitle";
import LiquidAlertProvider from "@/components/LiquidAlertProvider";
import MobileDock from "@/components/MobileDock";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Poster Store | Premium Arts",
  description: "Exclusive posters, retro prints, and custom designs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} antialiased bg-black text-white min-h-screen`}>
        <ClickSpark
          sparkColor="#ffffff"
          sparkSize={8}
          sparkRadius={20}
          sparkCount={12}
          duration={500}
        >
          <AuthProvider>
            <OffersProvider>
              <VerifiedPhotoProvider>
                <ProductProvider>
                  <OrderProvider>
                    <CartProvider>
                      <DynamicTitle />
                      <LiquidAlertProvider />
                      {children}
                      <MobileDock />
                    </CartProvider>
                  </OrderProvider>
                </ProductProvider>
              </VerifiedPhotoProvider>
            </OffersProvider>
          </AuthProvider>
        </ClickSpark>
      </body>
    </html>
  );
}
