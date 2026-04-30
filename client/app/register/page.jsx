// client/app/register/page.jsx

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Link from "next/link";
import FoodZeroLogo from "@/components/FoodZeroLogo";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "donor",
    ngoType: "organization" // New field: "organization" or "individual"
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("/auth/register", formData);
      router.push("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Animated Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1200 200" className="w-full h-48 text-green-200 opacity-30">
            <path fill="currentColor" d="M0,100 L200,40 L400,80 L600,20 L800,60 L1000,40 L1200,80 L1200,200 L0,200 Z" />
          </svg>
        </div>
        
        <div className="absolute top-20 left-10 animate-bounce-slow">
          <div className="text-6xl opacity-20">🥕</div>
        </div>
        <div className="absolute top-40 right-20 animate-float">
          <div className="text-5xl opacity-20">🍞</div>
        </div>
        <div className="absolute bottom-40 left-1/4 animate-bounce-slow" style={{ animationDelay: '1s' }}>
          <div className="text-5xl opacity-20">🥦</div>
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float" style={{ animationDelay: '2s' }}>
          <div className="text-6xl opacity-20">🍅</div>
        </div>
        
        <div className="absolute top-1/2 left-0 animate-drive">
          <div className="text-7xl">🚚</div>
        </div>
        
        <div className="absolute bottom-32 left-0 w-full h-2 bg-gray-300 opacity-20">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
        </div>
        
        <div className="absolute top-10 right-10 animate-spin-slow">
          <div className="text-8xl opacity-10">♻️</div>
        </div>
        
        <div className="absolute bottom-1/4 right-10 animate-pulse">
          <div className="text-5xl opacity-20">💚</div>
        </div>
        
        <div className="absolute top-1/4 left-20 animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
          <div className="text-6xl opacity-20">🧺</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-6">
              <div className="bg-white p-6 rounded-full shadow-2xl animate-bounce-slow">
                <FoodZeroLogo size="xl" showText={false} />
              </div>
            </div>
            <FoodZeroLogo size="xl" className="justify-center mb-4" />
            <p className="text-green-600 text-lg font-medium">
              Be Part of FoodZero Movement
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-2 border-green-100">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-2xl">✨</span>
              <h2 className="text-3xl font-bold text-gray-800">
                Create Account
              </h2>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium flex items-center gap-2">
                  <span>👤</span>
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium flex items-center gap-2">
                  <span>📧</span>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium flex items-center gap-2">
                  <span>🎭</span>
                  I am a
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
                >
                  <option value="donor">🤲 Donor - I want to donate food</option>
                  <option value="ngo">🏥 NGO/Individual - I want to collect donations</option>
                  <option value="admin">👨‍💼 Admin - Platform management</option>
                </select>
              </div>

              {/* NGO Type Selection */}
              {formData.role === "ngo" && (
                <div>
                  <label className="block text-gray-700 mb-2 font-medium flex items-center gap-2">
                    <span>🏢</span>
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, ngoType: "organization" })}
                      className={`p-4 rounded-xl border-2 transition ${
                        formData.ngoType === "organization"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-green-300"
                      }`}
                    >
                      <div className="text-3xl mb-2">🏥</div>
                      <div className="font-semibold">Organization</div>
                      <div className="text-xs mt-1">Registered NGO/Trust</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, ngoType: "individual" })}
                      className={`p-4 rounded-xl border-2 transition ${
                        formData.ngoType === "individual"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-green-300"
                      }`}
                    >
                      <div className="text-3xl mb-2">👤</div>
                      <div className="font-semibold">Individual</div>
                      <div className="text-xs mt-1">Personal volunteer</div>
                    </button>
                  </div>
                </div>
              )}

              {/* NGO Information Note */}
              {formData.role === "ngo" && (
                <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800 font-semibold mb-2">
                    <span>ℹ️</span>
                    <span>{formData.ngoType === "organization" ? "Organization" : "Individual"} Account Information</span>
                  </div>
                  {formData.ngoType === "organization" ? (
                    <>
                      <p className="text-sm text-blue-700 mb-2">
                        After registration, you'll need to complete your NGO verification details (registration number, documents, etc.) from your dashboard to start accepting donations.
                      </p>
                      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded mt-2">
                        <p className="text-sm text-yellow-800">
                          <span className="font-semibold">⚠️ Note:</span> Your account will be in "Pending Verification" status until you submit verification details and an admin approves them.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-blue-700 mb-2">
                        As an individual volunteer, you'll need to provide your personal details and verification information from your dashboard to start collecting donations.
                      </p>
                      <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded mt-2">
                        <p className="text-sm text-green-800">
                          <span className="font-semibold">✅ Note:</span> Individual accounts have a simplified verification process. You can start helping your community quickly!
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>Create Account</span>
                <span>🚀</span>
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-green-600 hover:text-green-700 font-semibold hover:underline">
                  Login Here
                </Link>
              </p>
            </div>

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

          <div className="mt-6 text-center">
            <p className="text-green-700 font-medium flex items-center justify-center gap-2">
              <span>🌱</span>
              <span>Together we can achieve FoodZero</span>
              <span>🌱</span>
            </p>
          </div>
        </div>
      </div>

      {/* Side Info Panel (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/3 bg-gradient-to-br from-green-600 to-emerald-700 text-white p-12 relative overflow-hidden">
        <div className="relative z-10 space-y-8">
          <div className="text-center">
            <div className="text-8xl mb-4">🌾</div>
            <h3 className="text-3xl font-bold mb-4">Join Our Mission</h3>
            <p className="text-green-100 text-lg">
              Connect donors with those in need and reduce food waste
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <div className="text-4xl">🚚</div>
              <div>
                <h4 className="font-bold text-lg">Real-time Tracking</h4>
                <p className="text-green-100 text-sm">Track your donations from pickup to delivery</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <div className="text-4xl">🗺️</div>
              <div>
                <h4 className="font-bold text-lg">Smart Routing</h4>
                <p className="text-green-100 text-sm">Efficient delivery to minimize waste</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <div className="text-4xl">❄️</div>
              <div>
                <h4 className="font-bold text-lg">Temperature Control</h4>
                <p className="text-green-100 text-sm">Ensure food safety throughout delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 text-9xl opacity-10 animate-spin-slow">
          ♻️
        </div>
        <div className="absolute bottom-10 left-10 text-7xl opacity-10 animate-bounce-slow">
          🌍
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
