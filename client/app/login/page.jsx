// client/app/login/page.jsx

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Link from "next/link";
import FoodZeroLogo from "@/components/FoodZeroLogo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await axios.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push(`/${data.user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Animated Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Mountains */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1200 200" className="w-full h-48 text-green-200 opacity-30">
            <path fill="currentColor" d="M0,100 L200,40 L400,80 L600,20 L800,60 L1000,40 L1200,80 L1200,200 L0,200 Z" />
          </svg>
        </div>
        
        {/* Floating Food Icons */}
        <div className="absolute top-20 left-10 animate-bounce-slow">
          <div className="text-6xl opacity-20">🍎</div>
        </div>
        <div className="absolute top-40 right-20 animate-float">
          <div className="text-5xl opacity-20">🥖</div>
        </div>
        <div className="absolute bottom-40 left-1/4 animate-bounce-slow" style={{ animationDelay: '1s' }}>
          <div className="text-5xl opacity-20">🥗</div>
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float" style={{ animationDelay: '2s' }}>
          <div className="text-6xl opacity-20">🍊</div>
        </div>
        
        {/* Delivery Truck Animation */}
        <div className="absolute top-1/2 left-0 animate-drive">
          <div className="text-7xl">🚚</div>
        </div>
        
        {/* Road */}
        <div className="absolute bottom-32 left-0 w-full h-2 bg-gray-300 opacity-20">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
        </div>
        
        {/* Recycling Symbol */}
        <div className="absolute top-10 right-10 animate-spin-slow">
          <div className="text-8xl opacity-10">♻️</div>
        </div>
        
        {/* Hearts for care */}
        <div className="absolute bottom-1/4 right-10 animate-pulse">
          <div className="text-5xl opacity-20">💚</div>
        </div>
        
        {/* Food Basket */}
        <div className="absolute top-1/4 left-20 animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
          <div className="text-6xl opacity-20">🧺</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo and Title Section */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-white p-6 rounded-full shadow-2xl animate-bounce-slow">
                <FoodZeroLogo size="xl" showText={false} />
              </div>
            </div>
            <FoodZeroLogo size="xl" className="justify-center mb-4" />
            <p className="text-green-600 text-lg font-medium">
              Share Food, Waste Zero
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-2 border-green-100">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-2xl">🔐</span>
              <h2 className="text-3xl font-bold text-gray-800">
                Welcome Back
              </h2>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-gray-700 mb-2 font-medium flex items-center gap-2">
                  <span>📧</span>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium flex items-center gap-2">
                  <span>🔒</span>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>Login</span>
                <span>🚀</span>
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link href="/register" className="text-green-600 hover:text-green-700 font-semibold hover:underline">
                  Register Now
                </Link>
              </p>
            </div>

            {/* Stats Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl mb-1">🍲</div>
                  <div className="text-xs text-gray-600">Zero Waste</div>
                </div>
                <div>
                  <div className="text-2xl mb-1">🤝</div>
                  <div className="text-xs text-gray-600">Help Others</div>
                </div>
                <div>
                  <div className="text-2xl mb-1">🌍</div>
                  <div className="text-xs text-gray-600">Save Planet</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Message */}
          <div className="mt-6 text-center">
            <p className="text-green-700 font-medium flex items-center justify-center gap-2">
              <span>🌱</span>
              <span>Together we can achieve FoodZero</span>
              <span>🌱</span>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes drive {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(calc(100vw + 100px)); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-drive {
          animation: drive 15s linear infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
