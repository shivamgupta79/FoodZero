// client/app/donor/subscription/page.jsx

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import SubscriptionPlans from "@/components/SubscriptionPlans";

export default function DonorSubscription() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.role !== "donor") {
      router.push(`/${parsedUser.role}/dashboard`);
      return;
    }

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar role="donor" />
        
        <main className="flex-1 p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Subscription Plans 💳
            </h1>
            <p className="text-gray-600">
              Upgrade your account to unlock more features and make a bigger impact
            </p>
          </div>

          {/* Current Plan Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Your Current Plan</h2>
                <p className="text-gray-600">
                  Plan: <span className="font-semibold capitalize">{user?.subscription?.plan || "Free"}</span>
                </p>
                <p className="text-gray-600">
                  Status: <span className={`font-semibold ${
                    user?.subscription?.status === "active" ? "text-green-600" : "text-gray-600"
                  }`}>
                    {user?.subscription?.status || "Active"}
                  </span>
                </p>
              </div>
              <div className="text-5xl">
                {user?.subscription?.plan === "premium" ? "💎" :
                 user?.subscription?.plan === "basic" ? "⭐" :
                 user?.subscription?.plan === "enterprise" ? "🏢" : "🆓"}
              </div>
            </div>
          </div>

          {/* Subscription Plans Component */}
          <SubscriptionPlans 
            userRole="donor" 
            currentPlan={user?.subscription?.plan || "free"}
          />

          {/* Benefits Section */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>🎁</span>
              Why Upgrade?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="text-5xl mb-3">🚀</div>
                <h4 className="font-bold text-gray-800 mb-2">More Impact</h4>
                <p className="text-sm text-gray-600">
                  Donate more food and help more people in need
                </p>
              </div>
              <div className="text-center p-4">
                <div className="text-5xl mb-3">📊</div>
                <h4 className="font-bold text-gray-800 mb-2">Better Insights</h4>
                <p className="text-sm text-gray-600">
                  Track your impact with detailed analytics and reports
                </p>
              </div>
              <div className="text-center p-4">
                <div className="text-5xl mb-3">⚡</div>
                <h4 className="font-bold text-gray-800 mb-2">Priority Service</h4>
                <p className="text-sm text-gray-600">
                  Get faster pickups and dedicated support
                </p>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Need Help Choosing?
            </h3>
            <p className="text-green-700 mb-4">
              Our team is here to help you find the perfect plan for your needs
            </p>
            <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-semibold">
              Contact Support
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
