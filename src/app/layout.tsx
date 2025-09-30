import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthWrapper } from "../components/AuthWrapper";
import { SidebarProvider } from "../contexts/SidebarContext";
import { ReLoginPrompt } from "../components/Auth/ReLoginPrompt";
import { SystemStatus } from "../components/SystemStatus";
import engagehubLogo from "../assets/images/engagehub-logo.jpg";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EngageHub - Community Engagement Platform",
  description: "The ultimate platform for building engaged communities through gamification and rewards",
  icons: {
    icon: engagehubLogo.src,
    shortcut: engagehubLogo.src,
    apple: engagehubLogo.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={engagehubLogo.src} />
        <link rel="shortcut icon" href={engagehubLogo.src} />
        <link rel="apple-touch-icon" href={engagehubLogo.src} />
      </head>
      <body className={`${inter.className} text-stone-950 bg-stone-100`}>
        <AuthWrapper>
          <SidebarProvider>
            {children}
            <ReLoginPrompt />
            <SystemStatus />
          </SidebarProvider>
        </AuthWrapper>
      </body>
    </html>
  );
}
