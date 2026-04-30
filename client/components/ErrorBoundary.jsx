// client/components/ErrorBoundary.jsx

"use client";
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Check if it's a MetaMask/Web3 related error
    if (
      error.message && 
      (error.message.includes('MetaMask') || 
       error.message.includes('ethereum') ||
       error.message.includes('web3') ||
       error.message.includes('wallet'))
    ) {
      // Don't show error for MetaMask issues
      return { hasError: false };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log non-MetaMask errors
    if (
      !error.message || 
      (!error.message.includes('MetaMask') && 
       !error.message.includes('ethereum') &&
       !error.message.includes('web3'))
    ) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-semibold"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
