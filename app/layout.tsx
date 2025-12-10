import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KidneyGuard AI | Deep Scope Diagnostics",
  description: "Advanced AI diagnostics for Lupus Nephritis powered by Liquid Intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "bg-background text-foreground overflow-x-hidden")}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
