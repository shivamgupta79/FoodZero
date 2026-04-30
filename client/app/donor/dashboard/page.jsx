// client/app/donor/dashboard/page.jsx

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

export default function DonorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalDonations: 0,
    activeDonations: 0,
    completedPickups: 0,
    peopleServed: 0
  });
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Verification states
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationData, setVerificationData] = useState({
    phoneNumber: "",
    address: "",
    donorType: ""
  });
  const [phoneOTP, setPhoneOTP] = useState("");
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [verificationStep, setVerificationStep] = useState("details"); // details, phone, email, location

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

    fetchDashboardData();
    
    // Load existing donor details if available
    if (parsedUser.donorDetails) {
      setVerificationData({
        phoneNumber: parsedUser.donorDetails.phoneNumber || "",
        address: parsedUser.donorDetails.address || "",
        donorType: parsedUser.donorDetails.donorType || ""
      });
    }
  }, [router]);

  // Function to refresh user profile from server
  const refreshUserProfile = async () => {
    try {
      const { data } = await axios.get("/auth/profile");
      
      // Update localStorage with fresh data
      localStorage.setItem("user", JSON.stringify(data));
      
      // Update state
      setUser(data);
      
      // Update verification form data if available
      if (data.donorDetails) {
        setVerificationData({
          phoneNumber: data.donorDetails.phoneNumber || "",
          address: data.donorDetails.address || "",
          donorType: data.donorDetails.donorType || ""
        });
      }
      
      return data;
    } catch (error) {
      console.error("Error refreshing user profile:", error);
      throw error;
    }
  };

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get("/donations/all");
      
      // Handle both old format (array) and new format (object with donations array)
      const allDonations = Array.isArray(data) ? data : (data.donations || []);
      const userDonations = allDonations.filter(d => d.donor?._id === JSON.parse(localStorage.getItem("user"))._id);
      
      setRecentDonations(userDonations);
      setStats({
        totalDonations: userDonations.length,
        activeDonations: userDonations.filter(d => d.status === "pending" || d.status === "accepted").length,
        completedPickups: userDonations.filter(d => d.status === "delivered").length,
        peopleServed: userDonations.length * 15 // Estimate 15 people per donation
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  // Helper function to convert different units to kg for waste calculation
  const convertToKg = (quantity, unit) => {
    const qty = parseFloat(quantity) || 0;
    
    switch(unit?.toLowerCase()) {
      case 'kg':
        return qty;
      case 'grams':
      case 'g':
        return qty / 1000;
      case 'plates':
      case 'servings':
        return qty * 0.4; // Average plate/serving = 400g
      case 'liters':
      case 'l':
        return qty * 1; // Approximate 1L = 1kg for liquids
      case 'pieces':
        return qty * 0.15; // Average piece = 150g
      case 'boxes':
        return qty * 2; // Average box = 2kg
      case 'bags':
        return qty * 1.5; // Average bag = 1.5kg
      default:
        return qty * 0.5; // Default fallback
    }
  };

  // Helper function to calculate meals from quantity and unit
  const calculateMeals = (quantity, unit) => {
    const qty = parseFloat(quantity) || 0;
    
    switch(unit?.toLowerCase()) {
      case 'kg':
        return Math.floor(qty / 0.1); // 100g per meal (rice, grains, etc.)
      case 'grams':
      case 'g':
        return Math.floor(qty / 100); // 100g per meal
      case 'plates':
      case 'servings':
        return qty; // Already in meal units
      case 'liters':
      case 'l':
        return Math.floor(qty * 4); // 250ml per serving
      case 'pieces':
        return Math.floor(qty * 0.5); // 2 pieces per meal
      case 'boxes':
        return Math.floor(qty * 5); // Average box feeds 5 people
      case 'bags':
        return Math.floor(qty * 3); // Average bag feeds 3 people
      default:
        return Math.floor(qty); // Default 1:1
    }
  };

  // Calculate total meals saved from delivered donations
  const calculateTotalMeals = () => {
    const deliveredDonations = recentDonations.filter(d => d.status === "delivered");
    let totalMeals = 0;
    
    deliveredDonations.forEach(donation => {
      const meals = calculateMeals(donation.quantity, donation.quantityUnit);
      totalMeals += meals;
    });
    
    // Minimum fallback if no quantity data
    return totalMeals > 0 ? totalMeals : deliveredDonations.length * 3;
  };

  // Calculate total waste diverted in kg
  const calculateTotalWaste = () => {
    const deliveredDonations = recentDonations.filter(d => d.status === "delivered");
    let totalKg = 0;
    
    deliveredDonations.forEach(donation => {
      const kg = convertToKg(donation.quantity, donation.quantityUnit);
      totalKg += kg;
    });
    
    // Minimum fallback if no quantity data
    return totalKg > 0 ? totalKg : deliveredDonations.length * 2.5;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-blue-100 text-blue-800";
      case "picked_up": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    try {
      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          const { data } = await axios.put("/donor/update-details", {
            ...verificationData,
            location
          });

          const updatedUser = { ...user, donorDetails: data.donorDetails, location: data.location };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));

          setSubmitSuccess("Details saved! Now let's verify your information.");
          setVerificationStep("phone");
        }, (error) => {
          setSubmitError("Location permission denied. Please enable location access.");
        });
      } else {
        setSubmitError("Geolocation is not supported by your browser.");
      }
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Failed to save details");
    }
  };

  const handleSendOTP = async () => {
    try {
      const { data } = await axios.post("/donor/send-phone-otp", {
        phoneNumber: verificationData.phoneNumber
      });
      setSubmitSuccess(data.message + (data.devOTP ? ` (Dev OTP: ${data.devOTP})` : ""));
      setShowOTPInput(true);
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyPhone = async () => {
    try {
      const { data } = await axios.post("/donor/verify-phone", {
        phoneNumber: verificationData.phoneNumber,
        otp: phoneOTP
      });

      const updatedUser = { ...user, donorDetails: data.donorDetails };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSubmitSuccess(data.message);
      setVerificationStep("email");
      setPhoneOTP("");
      setShowOTPInput(false);
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Invalid OTP");
    }
  };

  const handleSendEmailVerification = async () => {
    try {
      const { data } = await axios.post("/donor/send-email-verification");
      setSubmitSuccess(data.message + (data.devToken ? ` (Dev Token: ${data.devToken})` : ""));
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Failed to send verification email");
    }
  };

  const handleVerifyEmail = async (token) => {
    try {
      const { data } = await axios.post("/donor/verify-email", { token });

      const updatedUser = { ...user, donorDetails: data.donorDetails };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSubmitSuccess(data.message);
      setVerificationStep("location");
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Email verification failed");
    }
  };

  const handleVerifyLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { data } = await axios.post("/donor/verify-location", {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });

          const updatedUser = { ...user, donorDetails: data.donorDetails, location: data.location };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));

          setSubmitSuccess("All verifications complete! You're now a verified donor.");
          setShowVerificationForm(false);
          
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (error) {
          setSubmitError(error.response?.data?.message || "Location verification failed");
        }
      }, (error) => {
        setSubmitError("Location permission denied. Please enable location access.");
      });
    } else {
      setSubmitError("Geolocation is not supported by your browser.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar role="donor" impactMetrics={{ totalMeals: calculateTotalMeals(), totalWaste: calculateTotalWaste() }} />
        
        <main className="flex-1 p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-gray-600">Here's your impact on reducing food waste</p>
          </div>

          {/* Donor Verification Section */}
          {user?.donorDetails?.verificationStatus !== "verified" && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span>✅</span>
                    Donor Verification
                  </h2>
                  <p className="text-gray-600 mt-1">Complete verification to unlock full donor features</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      try {
                        await refreshUserProfile();
                        alert("✅ Verification status refreshed successfully!");
                      } catch (error) {
                        alert("❌ Failed to refresh status. Please try again.");
                      }
                    }}
                    className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition font-semibold flex items-center gap-2 shadow-md"
                    title="Click to check if your verification status has been updated by admin"
                  >
                    <span>🔄</span>
                    <span>Refresh Status</span>
                  </button>
                  {!showVerificationForm && (
                    <button
                      onClick={() => setShowVerificationForm(true)}
                      className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
                    >
                      {user?.donorDetails?.phoneNumber ? "Continue Verification" : "Start Verification"}
                    </button>
                  )}
                </div>
              </div>

              {/* Verification Progress */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className={`p-4 rounded-lg border-2 ${user?.donorDetails?.phoneVerified ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{user?.donorDetails?.phoneVerified ? '✅' : '📱'}</span>
                    <span className="font-semibold">Phone Verification</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {user?.donorDetails?.phoneVerified ? 'Verified' : 'Pending'}
                  </p>
                </div>

                <div className={`p-4 rounded-lg border-2 ${user?.donorDetails?.emailVerified ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{user?.donorDetails?.emailVerified ? '✅' : '📧'}</span>
                    <span className="font-semibold">Email Verification</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {user?.donorDetails?.emailVerified ? 'Verified' : 'Pending'}
                  </p>
                </div>

                <div className={`p-4 rounded-lg border-2 ${user?.donorDetails?.locationVerified ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{user?.donorDetails?.locationVerified ? '✅' : '📍'}</span>
                    <span className="font-semibold">Location Permission</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {user?.donorDetails?.locationVerified ? 'Verified' : 'Pending'}
                  </p>
                </div>

                <div className={`p-4 rounded-lg border-2 ${user?.donorDetails?.govtIdVerified ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{user?.donorDetails?.govtIdVerified ? '✅' : '🆔'}</span>
                    <span className="font-semibold">Document Verification</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {user?.donorDetails?.govtIdVerified ? 'Verified' : 'Pending'}
                  </p>
                </div>
              </div>

              {/* Level 2 Verification Link */}
              {user?.donorDetails?.phoneVerified && user?.donorDetails?.emailVerified && user?.donorDetails?.locationVerified && !user?.donorDetails?.govtIdVerified && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        <span>🎯</span>
                        Ready for Level 2 Verification?
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Upload your documents for enhanced verification and unlock premium features
                      </p>
                    </div>
                    <Link href="/donor/verification">
                      <button className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition font-semibold whitespace-nowrap">
                        Upload Documents
                      </button>
                    </Link>
                  </div>
                </div>
              )}

              {submitSuccess && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
                  <span>✅</span>
                  <span>{submitSuccess}</span>
                </div>
              )}

              {submitError && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{submitError}</span>
                </div>
              )}

              {showVerificationForm && (
                <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                  {/* Step 1: Basic Details */}
                  {verificationStep === "details" && (
                    <form onSubmit={handleDetailsSubmit} className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Step 1: Basic Information</h3>
                      
                      <div>
                        <label className="block text-gray-700 mb-2 font-medium">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={verificationData.phoneNumber}
                          onChange={(e) => setVerificationData({ ...verificationData, phoneNumber: e.target.value })}
                          placeholder="+91 1234567890"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2 font-medium">
                          Full Address *
                        </label>
                        <textarea
                          value={verificationData.address}
                          onChange={(e) => setVerificationData({ ...verificationData, address: e.target.value })}
                          placeholder="Enter your complete address"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2 font-medium">
                          I am donating from *
                        </label>
                        <select
                          value={verificationData.donorType}
                          onChange={(e) => setVerificationData({ ...verificationData, donorType: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          required
                        >
                          <option value="">Select donor type</option>
                          <option value="household">🏠 Household</option>
                          <option value="restaurant">🍽️ Restaurant</option>
                          <option value="store">🏪 Store/Grocery</option>
                          <option value="hotel">🏨 Hotel</option>
                        </select>
                      </div>

                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">📍 Location Permission:</span> We'll request your location to ensure accurate pickup coordinates.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
                        >
                          Save & Continue
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowVerificationForm(false)}
                          className="px-6 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Step 2: Phone Verification */}
                  {verificationStep === "phone" && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Step 2: Verify Phone Number</h3>
                      
                      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-4">
                        <p className="text-sm text-green-800">
                          Phone: <span className="font-semibold">{verificationData.phoneNumber}</span>
                        </p>
                      </div>

                      {!showOTPInput ? (
                        <button
                          onClick={handleSendOTP}
                          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
                        >
                          Send OTP
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-700 mb-2 font-medium">
                              Enter OTP
                            </label>
                            <input
                              type="text"
                              value={phoneOTP}
                              onChange={(e) => setPhoneOTP(e.target.value)}
                              placeholder="Enter 6-digit OTP"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              maxLength="6"
                            />
                          </div>
                          <button
                            onClick={handleVerifyPhone}
                            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-semibold"
                          >
                            Verify Phone
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Email Verification */}
                  {verificationStep === "email" && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Step 3: Verify Email</h3>
                      
                      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-4">
                        <p className="text-sm text-green-800">
                          Email: <span className="font-semibold">{user?.email}</span>
                        </p>
                      </div>

                      <button
                        onClick={handleSendEmailVerification}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
                      >
                        Send Verification Email
                      </button>

                      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                        <p className="text-sm text-yellow-800">
                          <span className="font-semibold">Note:</span> In development mode, use the token shown above to verify. In production, click the link in your email.
                        </p>
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2 font-medium">
                          Or enter verification token manually
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Paste verification token"
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && e.target.value) {
                                handleVerifyEmail(e.target.value);
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = e.target.previousSibling;
                              if (input.value) handleVerifyEmail(input.value);
                            }}
                            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-semibold"
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Location Verification */}
                  {verificationStep === "location" && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Step 4: Verify Location</h3>
                      
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">📍 Why we need location:</span>
                          <br />• Accurate pickup coordinates for NGOs
                          <br />• Calculate distance to nearby NGOs
                          <br />• Ensure food reaches the right location
                        </p>
                      </div>

                      <button
                        onClick={handleVerifyLocation}
                        className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-semibold flex items-center justify-center gap-2"
                      >
                        <span>📍</span>
                        <span>Allow Location Access</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Impact Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-5xl">🍱</span>
                <span className="text-3xl font-bold">{stats.totalDonations}</span>
              </div>
              <p className="text-green-100">Total Donations Made</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-5xl">🥗</span>
                <span className="text-3xl font-bold">{stats.activeDonations}</span>
              </div>
              <p className="text-yellow-100">Active Donations</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-5xl">🚚</span>
                <span className="text-3xl font-bold">{stats.completedPickups}</span>
              </div>
              <p className="text-blue-100">Completed Pickups</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-5xl">👥</span>
                <span className="text-3xl font-bold">{stats.peopleServed}</span>
              </div>
              <p className="text-purple-100">People Served (Est.)</p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/donor/donate">
              <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3">
                <span className="text-2xl">➕</span>
                <span>Donate Food Now</span>
              </button>
            </Link>
            {user?.donorDetails?.phoneVerified && user?.donorDetails?.emailVerified && user?.donorDetails?.locationVerified && !user?.donorDetails?.govtIdVerified && (
              <Link href="/donor/verification">
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:to-pink-700 transition font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3">
                  <span className="text-2xl">📄</span>
                  <span>Complete Document Verification</span>
                </button>
              </Link>
            )}
          </div>

          {/* Recent Donations Table */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>📋</span>
                Recent Donations
              </h2>
              <Link href="/donor/tracking" className="text-green-600 hover:text-green-700 font-medium">
                View All →
              </Link>
            </div>

            {recentDonations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-gray-600 mb-4">No donations yet</p>
                <Link href="/donor/donate">
                  <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600">
                    Make Your First Donation
                  </button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Food Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">NGO Assigned</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDonations.map((donation) => (
                      <tr key={donation._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🍲</span>
                            <span className="font-medium">{donation.foodType}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">{donation.quantity}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(donation.status)}`}>
                            {donation.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {donation.ngoAssigned?.name || (
                            <span className="text-gray-400">Waiting...</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <Link href={`/donor/tracking?id=${donation._id}`}>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm">
                              Track
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Impact Message */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">🌱</div>
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Thank you for making a difference!
            </h3>
            <p className="text-green-700">
              Your donations have helped feed approximately {stats.peopleServed} people and prevented food waste.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
