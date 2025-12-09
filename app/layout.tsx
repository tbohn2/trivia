import type { Metadata } from "next";
import { Geist, Geist_Mono, Henny_Penny, Atma } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const hennyPenny = Henny_Penny({
  variable: "--font-henny-penny",
  subsets: ["latin"],
  weight: "400",
});

const atma = Atma({
  variable: "--font-atma",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Christmas Trivia",
  description: "Christmas Movie Trivia",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${hennyPenny.variable} ${atma.variable} min-h-screen w-full`}
      >
        <div className="w-full h-[100px]"></div>
        {children}
      </body>
    </html>
  );
}
