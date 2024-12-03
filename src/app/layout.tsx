import type { Metadata } from "next";
import { Header } from "@/components/home/Header";
import { headers } from 'next/headers' // added
import './globals.css';
import ContextProvider from '@/context'
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "Poidh AI",
  description: "poidh ai",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersData = await headers();
  const cookies = headersData.get('cookie');

  return (
    <html lang="en">
      <body>
        <ContextProvider cookies={cookies}>
        <Toaster   position="top-right"
  reverseOrder={false}/>
        <Header />
        {children}</ContextProvider>
      </body>
    </html>
  );
}
