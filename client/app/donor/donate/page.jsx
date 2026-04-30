// client/app/donor/donate/page.jsx

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function Donate() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    foodType: "",
    quantity: "",
    quantityNumber: "",
    quantityUnit: "kg",
    foodCategory: "other",
    expiryTime: "",
    temperature: "",
    pickupAddress: "",
    specialInstructions: "",
    perishable: true,
    location: { lat: 0, lng: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

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

    // Get user's location
    getCurrentLocation();
  }, [router]);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
          setLocationLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default location (Delhi, India)
          setFormData(prev => ({
            ...prev,
            location: { lat: 28.6139, lng: 77.2090 }
          }));
          setLocationLoading(false);
        }
      );
    } else {
      // Default location
      setFormData(prev => ({
        ...prev,
        location: { lat: 28.6139, lng: 77.2090 }
      }));
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.foodType || !formData.quantityNumber || !formData.quantityUnit) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // Combine quantity number and unit into a single string
      const quantityString = `${formData.quantityNumber} ${formData.quantityUnit}`;
      
      const donationData = {
        ...formData,
        quantity: quantityString
      };

      const response = await axios.post("/donations/create", donationData);
      
      // Backend now handles Socket.io notification to NGOs
      alert("Donation submitted successfully! NGOs have been notified.");
      
      // Reset form
      setFormData({
        foodType: "",
        quantity: "",
        quantityNumber: "",
        quantityUnit: "kg",
        foodCategory: "other",
        expiryTime: "",
        temperature: "",
        pickupAddress: "",
        specialInstructions: "",
        perishable: true,
        location: formData.location
      });

      // Redirect to tracking page
      setTimeout(() => {
        router.push("/donor/tracking");
      }, 1500);

    } catch (error) {
      console.error("Error submitting donation:", error);
      alert(error.response?.data?.message || "Failed to submit donation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
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
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-4xl">🍱</span>
                Donate Food
              </h1>
              <p className="text-gray-600">Share your surplus food and help those in need</p>
            </div>

            {/* Donation Form */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Food Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-xl">🍽️</span>
                    Food Type *
                  </label>
                  <input
                    type="text"
                    value={formData.foodType}
                    onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                    placeholder="e.g., Rice, Vegetables, Cooked Meals"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Food Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-xl">📦</span>
                    Food Category *
                  </label>
                  <select
                    value={formData.foodCategory}
                    onChange={(e) => setFormData({ ...formData, foodCategory: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    required
                  >
                    <option value="cooked">🍲 Cooked Food</option>
                    <option value="raw">🥩 Raw Ingredients</option>
                    <option value="packaged">📦 Packaged Food</option>
                    <option value="fruits">🍎 Fruits</option>
                    <option value="vegetables">🥬 Vegetables</option>
                    <option value="dairy">🥛 Dairy Products</option>
                    <option value="bakery">🍞 Bakery Items</option>
                    <option value="other">🍱 Other</option>
                  </select>
                </div>

                {/* Quantity - Improved with separate number and unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-xl">⚖️</span>
                    Quantity *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.quantityNumber}
                      onChange={(e) => setFormData({ ...formData, quantityNumber: e.target.value })}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                    <select
                      value={formData.quantityUnit}
                      onChange={(e) => setFormData({ ...formData, quantityUnit: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                      required
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="grams">Grams (g)</option>
                      <option value="plates">Plates</option>
                      <option value="servings">Servings</option>
                      <option value="liters">Liters (L)</option>
                      <option value="pieces">Pieces</option>
                      <option value="boxes">Boxes</option>
                      <option value="bags">Bags</option>
                    </select>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.quantityNumber && formData.quantityUnit && 
                      `Total: ${formData.quantityNumber} ${formData.quantityUnit}`
                    }
                  </p>
                </div>

                {/* Perishable */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-xl">❄️</span>
                    Food Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.perishable === true}
                        onChange={() => setFormData({ ...formData, perishable: true })}
                        className="w-4 h-4 text-green-600"
                      />
                      <span>Perishable (needs quick pickup)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.perishable === false}
                        onChange={() => setFormData({ ...formData, perishable: false })}
                        className="w-4 h-4 text-green-600"
                      />
                      <span>Non-perishable</span>
                    </label>
                  </div>
                </div>

                {/* Expiry Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-xl">⏰</span>
                    Best Before Date & Time {formData.perishable && "*"}
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expiryTime}
                    onChange={(e) => setFormData({ ...formData, expiryTime: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required={formData.perishable}
                  />
                  <p className="text-sm text-gray-500 mt-1">When should this food be consumed by?</p>
                </div>

                {/* Temperature */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-xl">🌡️</span>
                    Storage Temperature (°C) (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    placeholder="e.g., 4 for refrigerated, 25 for room temperature"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Current storage temperature</p>
                </div>

                {/* Pickup Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-xl">🏠</span>
                    Pickup Address *
                  </label>
                  <textarea
                    value={formData.pickupAddress}
                    onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                    placeholder="Enter complete pickup address with landmarks"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows="2"
                    required
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-xl">📍</span>
                    GPS Coordinates
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={`${formData.location.lat.toFixed(4)}, ${formData.location.lng.toFixed(4)}`}
                      readOnly
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                      className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-medium disabled:bg-gray-400"
                    >
                      {locationLoading ? "Getting..." : "Update Location"}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {locationLoading ? "Getting your location..." : "Location detected automatically"}
                  </p>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-xl">📝</span>
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    value={formData.specialInstructions}
                    onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                    placeholder="Any special handling instructions, dietary information, or notes for the NGO"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                {/* Info Box */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <h4 className="font-semibold text-green-800 mb-1">What happens next?</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• All registered NGOs will be notified instantly</li>
                        <li>• NGOs can see the distance from their location</li>
                        <li>• Nearest NGO can accept your donation</li>
                        <li>• You'll receive updates on pickup status</li>
                        <li>• Track your donation in real-time</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || locationLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">🔄</span>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      <span>Submit Donation</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Impact Message */}
            <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🌱</div>
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Thank you for making a difference!
              </h3>
              <p className="text-green-700">
                Your donation can help feed approximately 15 people and prevent food waste.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}