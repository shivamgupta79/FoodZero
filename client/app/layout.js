// client/app/layout.js

"use client";
import "./globals.css";
import { useEffect } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function RootLayout({ children }) {
  useEffect(() => {
    // Suppress ONLY MetaMask-related errors from browser extensions
    // DO NOT suppress Google Maps or other legitimate errors
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' && 
        (args[0].includes('MetaMask') || 
         args[0].includes('ethereum') ||
         args[0].includes('web3')) &&
        !args[0].includes('Google') &&
        !args[0].includes('Maps')
      ) {
        // Silently ignore MetaMask/Web3 errors only
        return;
      }
      originalError.apply(console, args);
    };

    // Prevent window.ethereum access errors (but not Google Maps errors)
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        if (
          event.message && 
          (event.message.includes('MetaMask') || 
           event.message.includes('ethereum') ||
           event.message.includes('web3')) &&
          !event.message.includes('Google') &&
          !event.message.includes('Maps')
        ) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      });

      // Prevent unhandled promise rejections from MetaMask (but not Google Maps)
      window.addEventListener('unhandledrejection', (event) => {
        if (
          event.reason && 
          event.reason.message &&
          (event.reason.message.includes('MetaMask') || 
           event.reason.message.includes('ethereum') ||
           event.reason.message.includes('web3')) &&
          !event.reason.message.includes('Google') &&
          !event.reason.message.includes('Maps')
        ) {
          event.preventDefault();
          return false;
        }
      });
    }

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <html lang="en">
      <body className="bg-gray-50">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
