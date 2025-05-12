"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID}>
          <SessionProvider>
            {children}
          </SessionProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}