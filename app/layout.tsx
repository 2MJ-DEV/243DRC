"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScrollLinked from "@/components/ui/ScrollLinked";
import LenisScroll from "@/components/ui/LenisScroll";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { ToastProvider } from "@/components/ToastContainer";
import { BannerProvider } from "@/context/BannerContext";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/u");

  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <BannerProvider>
          <ToastProvider>
            <AnnouncementBanner
            message="Bienvenue sur 243 DRC ! Plateforme open source pour développeurs congolais"
            type="info"
            link={{
              text: "En savoir plus",
              href: "/about"
            }}
            dismissible={false}
          />
          
          {!isDashboard && <Navbar />}

          <main>
            {!isDashboard ? (
              <LenisScroll>
                <ScrollLinked />
                {children}
              </LenisScroll>
            ) : (
              children
            )}
          </main>

          {!isDashboard && <Footer />}
          </ToastProvider>
        </BannerProvider>
      </body>
    </html>
  );
}
