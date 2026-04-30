// client/components/VerificationBanner.jsx

"use client";
import { CheckCircle, XCircle, AlertCircle, Clock, X, Info } from "lucide-react";
import { useState } from "react";

export default function VerificationBanner({ verificationStatus, onAction }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (verificationStatus === "verified") {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-lg mb-6 shadow-md animate-in slide-in-from-top duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-green-800 text-lg">Verified Account</h3>
              <p className="text-green-700 text-sm">
                Your account is verified and you can access all features
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-green-600 hover:text-green-800 transition-colors p-1"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (verificationStatus === "rejected") {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-4 rounded-lg mb-6 shadow-md animate-in slide-in-from-top duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-800 text-lg">Verification Rejected</h3>
              <p className="text-red-700 text-sm mb-2">
                Your verification was rejected. Please contact admin for more details.
              </p>
              {onAction && (
                <button
                  onClick={onAction}
                  className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
                >
                  <Info className="w-4 h-4" />
                  Contact Support
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-red-600 hover:text-red-800 transition-colors p-1"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (verificationStatus === "unverified") {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-500 p-4 rounded-lg mb-6 shadow-md animate-in slide-in-from-top duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg">Account Not Verified</h3>
              <p className="text-gray-700 text-sm mb-2">
                Please upload your documents to get verified and access all features
              </p>
              {onAction && (
                <button
                  onClick={onAction}
                  className="text-sm bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors inline-flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Upload Documents
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-600 hover:text-gray-800 transition-colors p-1"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Default: pending
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 p-6 rounded-lg mb-6 shadow-md animate-in slide-in-from-top duration-300">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center animate-pulse">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-yellow-900 text-xl flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Verification Pending</span>
            </h3>
            <button
              onClick={() => setDismissed(true)}
              className="text-yellow-600 hover:text-yellow-800 transition-colors p-1"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-yellow-800 mb-3">
            Your account is currently under review by our admin team. You cannot accept donations until your account is verified.
          </p>
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-3">
            <p className="text-sm text-yellow-900 font-semibold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              What happens next:
            </p>
            <ul className="text-sm text-yellow-800 space-y-1 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>Admin will review your registration details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>Verification typically takes 24-48 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>You'll be notified once verified</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>After verification, you can accept donations</span>
              </li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 mb-3">
            <p className="text-sm text-blue-900 font-semibold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              How did I apply for verification?
            </p>
            <p className="text-sm text-blue-800">
              Your verification was automatically submitted when you registered with your details. 
              No additional action needed - just wait for admin approval!
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="italic">
              You can browse available donations but cannot accept them yet
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
