import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScrollLinked from "@/components/ui/ScrollLinked";
import LenisScroll from "@/components/ui/LenisScroll";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "243 DRC",
  description: "A Next.js project template with Tailwind CSS and App Router.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <Navbar />

        <main>
          <LenisScroll>
            <ScrollLinked />
            {children}
          </LenisScroll>
        </main>

        <Footer />
      </body>
    </html>
  );
}
