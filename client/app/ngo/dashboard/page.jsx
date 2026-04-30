// client/app/ngo/dashboard/page.jsx

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import DonationCard from "@/components/DonationCard";
import VerificationBanner from "@/components/VerificationBanner";
import { calculateDistance, getUserLocation } from "@/lib/utils";

export default function NGODashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    availableNearby: 0,
    acceptedDonations: 0,
    pendingPickups: 0,
    totalCollected: 0
  });
  const [nearbyDonations, setNearbyDonations] = useState([]);
  const [acceptedDonations, setAcceptedDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationData, setVerificationData] = useState({
    registrationNumber: "",
    registrationType: "",
    registeredAddress: "",
    city: "",
    state: "",
    contactPerson: "",
    contactPhone: "",
    gstNumber: "",
    panNumber: "",
    website: ""
  });
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  
  // Feedback states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    comment: "",
    recipientCount: "",
    distributionDate: ""
  });
  const [feedbackImages, setFeedbackImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.role !== "ngo") {
      router.push(`/${parsedUser.role}/dashboard`);
      return;
    }

    fetchDashboardData();
    
    // Get user's location
    getUserLocation().then(location => {
      setUserLocation(location);
    });

    // Load existing NGO details if available
    if (parsedUser.ngoDetails) {
      setVerificationData({
        registrationNumber: parsedUser.ngoDetails.registrationNumber || "",
        registrationType: parsedUser.ngoDetails.registrationType || "",
        registeredAddress: parsedUser.ngoDetails.registeredAddress || "",
        city: parsedUser.ngoDetails.city || "",
        state: parsedUser.ngoDetails.state || "",
        contactPerson: parsedUser.ngoDetails.contactPerson || "",
        contactPhone: parsedUser.ngoDetails.contactPhone || "",
        gstNumber: parsedUser.ngoDetails.gstNumber || "",
        panNumber: parsedUser.ngoDetails.panNumber || "",
        website: parsedUser.ngoDetails.website || ""
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
      if (data.ngoDetails) {
        setVerificationData({
          registrationNumber: data.ngoDetails.registrationNumber || "",
          registrationType: data.ngoDetails.registrationType || "",
          registeredAddress: data.ngoDetails.registeredAddress || "",
          city: data.ngoDetails.city || "",
          state: data.ngoDetails.state || "",
          contactPerson: data.ngoDetails.contactPerson || "",
          contactPhone: data.ngoDetails.contactPhone || "",
          gstNumber: data.ngoDetails.gstNumber || "",
          panNumber: data.ngoDetails.panNumber || "",
          website: data.ngoDetails.website || ""
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
      
      const pending = allDonations.filter(d => d.status === "pending");
      const accepted = allDonations.filter(d => d.ngoAssigned?._id === JSON.parse(localStorage.getItem("user"))._id);
      const delivered = accepted.filter(d => d.status === "delivered");

      setNearbyDonations(pending.slice(0, 6));
      setAcceptedDonations(accepted);
      
      setStats({
        availableNearby: pending.length,
        acceptedDonations: accepted.filter(d => d.status !== "delivered").length,
        pendingPickups: accepted.filter(d => d.status === "accepted").length,
        totalCollected: delivered.length
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
    const deliveredDonations = acceptedDonations.filter(d => d.status === "delivered");
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
    const deliveredDonations = acceptedDonations.filter(d => d.status === "delivered");
    let totalKg = 0;
    
    deliveredDonations.forEach(donation => {
      const kg = convertToKg(donation.quantity, donation.quantityUnit);
      totalKg += kg;
    });
    
    // Minimum fallback if no quantity data
    return totalKg > 0 ? totalKg : deliveredDonations.length * 2.5;
  };

  const handleAcceptDonation = async (donationId) => {
    // Check if NGO is verified
    if (user?.ngoDetails?.verificationStatus !== "verified") {
      alert("Your NGO must be verified before accepting donations. Please wait for admin approval.");
      return;
    }

    try {
      const response = await axios.put(`/ngo/accept/${donationId}`);
      alert(response.data.message || "Donation accepted successfully!");
      fetchDashboardData();
    } catch (error) {
      console.error("Error accepting donation:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to accept donation";
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const { data } = await axios.put("/ngo/update-details", verificationData);
      
      // Update local user data
      const updatedUser = { ...user, ngoDetails: data.ngoDetails };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setSubmitSuccess("Verification details submitted successfully! Waiting for admin approval.");
      setShowVerificationForm(false);
      
      // Refresh page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error submitting verification:", error);
      setSubmitError(error.response?.data?.message || "Failed to submit verification details");
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + feedbackImages.length > 5) {
      alert("You can upload maximum 5 images");
      return;
    }

    setFeedbackImages([...feedbackImages, ...files]);

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview([...imagePreview, ...previews]);
  };

  const removeImage = (index) => {
    const newImages = feedbackImages.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setFeedbackImages(newImages);
    setImagePreview(newPreviews);
  };

  const openFeedbackModal = (donation) => {
    setSelectedDonation(donation);
    setShowFeedbackModal(true);
    setFeedbackData({
      rating: 5,
      comment: "",
      recipientCount: "",
      distributionDate: new Date().toISOString().split('T')[0]
    });
    setFeedbackImages([]);
    setImagePreview([]);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    
    if (feedbackImages.length === 0) {
      alert("Please upload at least one image of the received food");
      return;
    }

    setFeedbackSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("donationId", selectedDonation._id);
      formData.append("rating", feedbackData.rating);
      formData.append("comment", feedbackData.comment);
      formData.append("recipientCount", feedbackData.recipientCount);
      formData.append("distributionDate", feedbackData.distributionDate);
      
      feedbackImages.forEach((image, index) => {
        formData.append("images", image);
      });

      await axios.post("/ngo/feedback", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Feedback submitted successfully! Thank you for sharing your impact.");
      setShowFeedbackModal(false);
      fetchDashboardData();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert(error.response?.data?.message || "Failed to submit feedback");
    } finally {
      setFeedbackSubmitting(false);
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
        <Sidebar role="ngo" impactMetrics={{ totalMeals: calculateTotalMeals(), totalWaste: calculateTotalWaste() }} />
        
        <main className="flex-1 p-8">
          {/* Verification Banner with Refresh Button */}
          {user?.ngoDetails && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <VerificationBanner verificationStatus={user.ngoDetails.verificationStatus} />
                </div>
                <button
                  onClick={async () => {
                    try {
                      await refreshUserProfile();
                      alert("✅ Verification status refreshed successfully!");
                    } catch (error) {
                      alert("❌ Failed to refresh status. Please try again.");
                    }
                  }}
                  className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-semibold flex items-center gap-2 shadow-md"
                  title="Click to check if your verification status has been updated"
                >
                  <span>🔄</span>
                  <span>Refresh Status</span>
                </button>
              </div>
            </div>
          )}

          {/* Verification Form Section */}
          {user?.ngoDetails?.verificationStatus !== "verified" && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    {user?.ngoDetails?.ngoType === "individual" ? (
                      <>
                        <span>👤</span>
                        Individual Volunteer Verification
                      </>
                    ) : (
                      <>
                        <span>🏥</span>
                        NGO Verification Details
                      </>
                    )}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Account Type: <span className="font-semibold">{user?.ngoDetails?.ngoType === "individual" ? "Individual Volunteer" : "Organization"}</span>
                  </p>
                </div>
                {!showVerificationForm && (
                  <button
                    onClick={() => setShowVerificationForm(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-semibold"
                  >
                    {user?.ngoDetails?.registrationNumber || user?.ngoDetails?.contactPerson ? "Update Details" : "Submit Details"}
                  </button>
                )}
              </div>

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

              {showVerificationForm ? (
                <form onSubmit={handleVerificationSubmit} className="space-y-4">
                  {/* Show different fields based on ngoType */}
                  {user?.ngoDetails?.ngoType === "individual" ? (
                    <>
                      {/* Individual Volunteer Fields - Simplified */}
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">ℹ️ Note:</span> As an individual volunteer, you need to provide basic contact information for verification.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 mb-2 font-medium text-sm">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={verificationData.contactPerson}
                            onChange={(e) => setVerificationData({ ...verificationData, contactPerson: e.target.value })}
                            placeholder="Your full name"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-2 font-medium text-sm">
                            Contact Phone *
                          </label>
                          <input
                            type="tel"
                            value={verificationData.contactPhone}
                            onChange={(e) => setVerificationData({ ...verificationData, contactPhone: e.target.value })}
                            placeholder="+91 1234567890"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2 font-medium text-sm">
                          Address *
                        </label>
                        <input
                          type="text"
                          value={verificationData.registeredAddress}
                          onChange={(e) => setVerificationData({ ...verificationData, registeredAddress: e.target.value })}
                          placeholder="Your address"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 mb-2 font-medium text-sm">
                            City *
                          </label>
                          <input
                            type="text"
                            value={verificationData.city}
                            onChange={(e) => setVerificationData({ ...verificationData, city: e.target.value })}
                            placeholder="City"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2 font-medium text-sm">
                            State *
                          </label>
                          <input
                            type="text"
                            value={verificationData.state}
                            onChange={(e) => setVerificationData({ ...verificationData, state: e.target.value })}
                            placeholder="State"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Organization Fields - Full verification */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 mb-2 font-medium text-sm">
                            Registration Number *
                          </label>
                          <input
                            type="text"
                            value={verificationData.registrationNumber}
                            onChange={(e) => setVerificationData({ ...verificationData, registrationNumber: e.target.value })}
                            placeholder="e.g., MH/2020/123456"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-2 font-medium text-sm">
                            Registration Type *
                          </label>
                          <select
                            value={verificationData.registrationType}
                            onChange={(e) => setVerificationData({ ...verificationData, registrationType: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                            required
                          >
                            <option value="">Select Type</option>
                            <option value="Trust">Trust Act</option>
                            <option value="Society">Society Registration Act</option>
                            <option value="Section8">Section 8 Company</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2 font-medium text-sm">
                          Registered Address *
                        </label>
                        <input
                          type="text"
                          value={verificationData.registeredAddress}
                          onChange={(e) => setVerificationData({ ...verificationData, registeredAddress: e.target.value })}
                          placeholder="Full registered address"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 mb-2 font-medium text-sm">
                            City *
                          </label>
                          <input
                            type="text"
                            value={verificationData.city}
                            onChange={(e) => setVerificationData({ ...verificationData, city: e.target.value })}
                            placeholder="City"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2 font-medium text-sm">
                            State *
                          </label>
                          <input
                            type="text"
                            value={verificationData.state}
                            onChange={(e) => setVerificationData({ ...verificationData, state: e.target.value })}
                            placeholder="State"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 mb-2 font-medium text-sm">
                            Contact Person Name *
                          </label>
                          <input
                            type="text"
                            value={verificationData.contactPerson}
                            onChange={(e) => setVerificationData({ ...verificationData, contactPerson: e.target.value })}
                            placeholder="Contact person name"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-2 font-medium text-sm">
                            Contact Phone *
                          </label>
                          <input
                            type="tel"
                            value={verificationData.contactPhone}
                            onChange={(e) => setVerificationData({ ...verificationData, contactPhone: e.target.value })}
                            placeholder="+91 1234567890"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 mb-2 font-medium text-sm">
                            GST Number (Optional)
                          </label>
                          <input
                            type="text"
                            value={verificationData.gstNumber}
                            onChange={(e) => setVerificationData({ ...verificationData, gstNumber: e.target.value })}
                            placeholder="GST Number"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2 font-medium text-sm">
                            PAN Number (Optional)
                          </label>
                          <input
                            type="text"
                            value={verificationData.panNumber}
                            onChange={(e) => setVerificationData({ ...verificationData, panNumber: e.target.value })}
                            placeholder="PAN Number"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2 font-medium text-sm">
                          Website (Optional)
                        </label>
                        <input
                          type="url"
                          value={verificationData.website}
                          onChange={(e) => setVerificationData({ ...verificationData, website: e.target.value })}
                          placeholder="https://your-ngo-website.com"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                      </div>
                    </>
                  )}

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                    <p className="text-sm text-yellow-800">
                      <span className="font-semibold">⚠️ Note:</span> After submitting, your details will be reviewed by an admin. You'll be able to accept donations once verified.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-semibold"
                    >
                      Submit for Verification
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
              ) : (
                <div className="space-y-3">
                  {user?.ngoDetails?.contactPerson ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {user?.ngoDetails?.ngoType === "organization" && user?.ngoDetails?.registrationNumber && (
                          <>
                            <div>
                              <span className="font-semibold text-gray-700">Registration Number:</span>
                              <p className="text-gray-600">{user.ngoDetails.registrationNumber}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">Registration Type:</span>
                              <p className="text-gray-600">{user.ngoDetails.registrationType}</p>
                            </div>
                          </>
                        )}
                        <div>
                          <span className="font-semibold text-gray-700">City:</span>
                          <p className="text-gray-600">{user.ngoDetails.city}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">State:</span>
                          <p className="text-gray-600">{user.ngoDetails.state}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">{user?.ngoDetails?.ngoType === "individual" ? "Name" : "Contact Person"}:</span>
                          <p className="text-gray-600">{user.ngoDetails.contactPerson}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Contact Phone:</span>
                          <p className="text-gray-600">{user.ngoDetails.contactPhone}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-5xl mb-3">📋</div>
                      <p className="text-gray-600 mb-4">No verification details submitted yet</p>
                      <p className="text-sm text-gray-500">Click "Submit Details" to complete your verification</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {user?.name} Dashboard 🏥
            </h1>
            <p className="text-gray-600">Manage donations with FoodZero and help those in need</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-5xl">📦</span>
                <span className="text-3xl font-bold">{stats.availableNearby}</span>
              </div>
              <p className="text-orange-100">Available Donations</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-5xl">🚚</span>
                <span className="text-3xl font-bold">{stats.acceptedDonations}</span>
              </div>
              <p className="text-blue-100">Accepted Donations</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-5xl">🕒</span>
                <span className="text-3xl font-bold">{stats.pendingPickups}</span>
              </div>
              <p className="text-yellow-100">Pending Pickups</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-5xl">🍲</span>
                <span className="text-3xl font-bold">{stats.totalCollected}</span>
              </div>
              <p className="text-green-100">Total Collected</p>
            </div>
          </div>

          {/* Nearby Food Requests */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>🗺️</span>
              Nearby Food Requests
            </h2>

            {nearbyDonations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-600">No available donations at the moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nearbyDonations.map((donation) => (
                  <div key={donation._id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-green-500 transition">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                          <span>🍱</span>
                          {donation.foodType}
                        </h3>
                        <p className="text-gray-600">Quantity: {donation.quantity}</p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        Pending
                      </span>
                    </div>

                    {donation.expiryTime && (
                      <p className="text-sm text-gray-600 mb-2">
                        ⏰ Expires: {new Date(donation.expiryTime).toLocaleString()}
                      </p>
                    )}

                    {userLocation && donation.location && (
                      <p className="text-sm text-gray-600 mb-2">
                        📍 Distance: {calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          donation.location.lat,
                          donation.location.lng
                        )} km
                      </p>
                    )}

                    <p className="text-sm text-gray-600 mb-4">
                      👤 Donor: {donation.donor?.name || "Anonymous"}
                    </p>

                    <button
                      onClick={() => handleAcceptDonation(donation._id)}
                      disabled={user?.ngoDetails?.verificationStatus !== "verified"}
                      className={`w-full py-2 rounded-lg transition font-semibold ${
                        user?.ngoDetails?.verificationStatus === "verified"
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {user?.ngoDetails?.verificationStatus === "verified" 
                        ? "Accept Donation" 
                        : "🔒 Verification Required"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accepted Requests */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>✅</span>
                Accepted Requests
              </h2>
              <button
                onClick={() => router.push("/ngo/requests")}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm font-semibold"
              >
                View All →
              </button>
            </div>

            {acceptedDonations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-600">No accepted donations yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {acceptedDonations.filter(d => d.status !== "delivered").map((donation) => (
                  <div key={donation._id} className="border-2 border-green-200 rounded-xl p-5 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                          {donation.foodType} - {donation.quantity}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Donor: {donation.donor?.name}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          Status: <span className={`font-semibold ${
                            donation.status === "accepted" ? "text-blue-600" :
                            donation.status === "picked_up" ? "text-purple-600" :
                            donation.status === "in_transit" ? "text-indigo-600" :
                            "text-gray-600"
                          }`}>{donation.status.replace(/_/g, " ").toUpperCase()}</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push("/ngo/requests")}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm font-semibold"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivered Donations - Feedback Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>📸</span>
                Share Your Impact - Delivered Donations
              </h2>
            </div>

            {acceptedDonations.filter(d => d.status === "delivered").length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-600">No delivered donations yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {acceptedDonations.filter(d => d.status === "delivered").map((donation) => (
                  <div key={donation._id} className="border-2 border-purple-200 rounded-xl p-5 bg-purple-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                          {donation.foodType} - {donation.quantity}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Donor: {donation.donor?.name}
                        </p>
                        <p className="text-sm text-green-600 font-semibold mb-2">
                          ✅ Delivered Successfully
                        </p>
                        {donation.feedback ? (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-purple-200">
                            <p className="text-sm text-gray-600 mb-2">
                              <span className="font-semibold">Feedback submitted:</span> {new Date(donation.feedback.submittedAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Rating: {"⭐".repeat(donation.feedback.rating)}
                            </p>
                          </div>
                        ) : (
                          <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm text-yellow-800 mb-2">
                              📸 Share photos and feedback about this donation to inspire more donors!
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!donation.feedback && (
                          <button
                            onClick={() => openFeedbackModal(donation)}
                            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-700 text-sm font-semibold flex items-center gap-2 shadow-lg"
                          >
                            <span>📸</span>
                            <span>Share Feedback</span>
                          </button>
                        )}
                        {donation.feedback && (
                          <button
                            className="bg-green-500 text-white px-6 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-default"
                          >
                            <span>✅</span>
                            <span>Feedback Submitted</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Performance Metrics */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-purple-800 mb-4 flex items-center gap-2">
              <span>📊</span>
              Your Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-700">{stats.totalCollected}</div>
                <p className="text-purple-600">Total Food Collected</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-700">{stats.totalCollected * 15}</div>
                <p className="text-purple-600">People Served (Est.)</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-700">95%</div>
                <p className="text-purple-600">Pickup Success Rate</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <span>📸</span>
                    Share Your Impact
                  </h2>
                  <p className="text-purple-100 text-sm mt-1">
                    {selectedDonation.foodType} - {selectedDonation.quantity}
                  </p>
                </div>
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-6">
              {/* Image Upload Section */}
              <div>
                <label className="block text-gray-700 mb-3 font-bold text-lg flex items-center gap-2">
                  <span>📷</span>
                  Upload Food Pictures *
                </label>
                <div className="border-3 border-dashed border-purple-300 rounded-xl p-6 bg-purple-50 hover:bg-purple-100 transition">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <div className="text-6xl mb-3">📸</div>
                    <p className="text-purple-700 font-semibold mb-1">
                      Click to upload images
                    </p>
                    <p className="text-purple-600 text-sm">
                      Upload up to 5 images (Required)
                    </p>
                  </label>
                </div>

                {/* Image Previews */}
                {imagePreview.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-purple-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">
                  Rate the Food Quality *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                      className="text-4xl transition-transform hover:scale-110"
                    >
                      {star <= feedbackData.rating ? "⭐" : "☆"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Count */}
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">
                  Number of People Served *
                </label>
                <input
                  type="number"
                  value={feedbackData.recipientCount}
                  onChange={(e) => setFeedbackData({ ...feedbackData, recipientCount: e.target.value })}
                  placeholder="e.g., 50"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  min="1"
                />
              </div>

              {/* Distribution Date */}
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">
                  Distribution Date *
                </label>
                <input
                  type="date"
                  value={feedbackData.distributionDate}
                  onChange={(e) => setFeedbackData({ ...feedbackData, distributionDate: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">
                  Share Your Experience
                </label>
                <textarea
                  value={feedbackData.comment}
                  onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                  placeholder="Tell us about the impact this donation made..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="4"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={feedbackSubmitting || feedbackImages.length === 0}
                  className={`flex-1 py-4 rounded-lg font-bold text-lg transition ${
                    feedbackSubmitting || feedbackImages.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-lg"
                  }`}
                >
                  {feedbackSubmitting ? "Submitting..." : "Submit Feedback"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-6 bg-gray-300 text-gray-700 py-4 rounded-lg hover:bg-gray-400 transition font-bold"
                >
                  Cancel
                </button>
              </div>

              {feedbackImages.length === 0 && (
                <p className="text-red-600 text-sm text-center">
                  ⚠️ At least one image is required to submit feedback
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
