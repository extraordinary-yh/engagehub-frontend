import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthWrapper } from "../components/AuthWrapper";
import { SidebarProvider } from "../contexts/SidebarContext";
import { ReLoginPrompt } from "../components/Auth/ReLoginPrompt";
import { SystemStatus } from "../components/SystemStatus";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EngageHub - Community Engagement Platform",
  description: "The ultimate platform for building engaged communities through gamification and rewards",
  icons: {
    icon: '/images/engagehub-logo.jpg',
    shortcut: '/images/engagehub-logo.jpg',
    apple: '/images/engagehub-logo.jpg',
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
        <link rel="icon" href="/images/engagehub-logo.jpg" />
        <link rel="shortcut icon" href="/images/engagehub-logo.jpg" />
        <link rel="apple-touch-icon" href="/images/engagehub-logo.jpg" />
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
