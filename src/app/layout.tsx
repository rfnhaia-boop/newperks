import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "https://fidelix.newflowsys.cloud"),
  title: "NewPerks — Cartão Fidelidade Digital",
  description:
    "Cartão fidelidade digital por QR code. Sem app, sem papel. Cliente escaneia, junta selos e volta mais vezes.",
  openGraph: {
    title: "NewPerks — Cartão Fidelidade Digital",
    description:
      "Fidelize seus clientes com um cartão digital por QR code. Sem app, sem papel.",
    siteName: "NewPerks",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NewPerks — Cartão Fidelidade Digital",
    description: "Fidelize seus clientes com um cartão digital por QR code.",
  },
  appleWebApp: {
    capable: true,
    title: "NewPerks",
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
