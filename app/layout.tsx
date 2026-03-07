import type { Metadata } from "next";
import { Cairo, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import LocaleSync from "@/components/LocaleSync";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "نواة | Nawaa AI — وكالتك التسويقية الذكية",
  description:
    "Saudi Arabia's AI-powered marketing agency platform. Strategy, content calendar, copywriting, and visual content. نواة للذكاء الاصطناعي.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${plusJakarta.variable} font-sans antialiased scrollbar-nawaa`}
      >
        <LocaleSync />
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            className: "!glass-strong !text-[#D0EBDA] !rounded-xl !shadow-[0_0_20px_rgba(0,0,0,0.3)]",
            duration: 4000,
            success: {
              className: "!glass-strong !text-[#D0EBDA] !border !border-[#006C35]/30 !rounded-xl",
              iconTheme: { primary: "#00A352", secondary: "#D0EBDA" },
            },
            error: {
              className: "!glass-strong !text-[#D0EBDA] !border !border-red-500/30 !rounded-xl",
              iconTheme: { primary: "#ef4444", secondary: "#D0EBDA" },
            },
          }}
        />
      </body>
    </html>
  );
}
