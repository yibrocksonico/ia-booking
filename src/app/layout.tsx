import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cápsula Condesa - Sistema IA Booking",
  description: "Reserva tu cápsula individual o habitación privada en la Colonia Condesa. Experiencia futurista con comodidades premium y reservas en tiempo real.",
  keywords: ["capsula condesa", "hotel capsula cdmx", "hotel condesa", "booking capsula", "ia booking"],
  authors: [{ name: "Cápsula Condesa" }],
  icons: {
    icon: "/logo-hotel-capsula-condesa-horiz.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

