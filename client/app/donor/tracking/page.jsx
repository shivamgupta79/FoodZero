// client/app/donor/tracking/page.jsx

"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import MapComponent from "@/components/MapComponent";
import LiveTracking from "@/components/LiveTracking";

export default function DonorTracking() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [donations, setDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "donor") {
      router.push(`/${parsedUser.role}/dashboard`);
      return;
    }

    fetchDonations();
  }, [router]);

  const fetchDonations = async () => {
    try {
      const { data } = await axios.get("/donations/all");
      
      // Handle both old format (array) and new format (object with donations array)
      const allDonations = Array.isArray(data) ? data : (data.donations || []);
      
      const userId = JSON.parse(localStorage.getItem("user"))._id;
      const userDonations = allDonations.filter(d => d.donor?._id === userId);
      setDonations(userDonations);

      // If ID in URL, select that donation
      const donationId = searchParams.get("id");
      if (donationId) {
        const selected = userDonations.find(d => d._id === donationId);
        if (selected) setSelectedDonation(selected);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching donations:", error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "accepted": return "bg-blue-100 text-blue-800 border-blue-300";
      case "picked_up": return "bg-purple-100 text-purple-800 border-purple-300";
      case "in_transit": return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case "delivered": return "bg-green-100 text-green-800 border-green-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return "🕐";
      case "accepted": return "✅";
      case "picked_up": return "📦";
      case "in_transit": return "🚚";
      case "delivered": return "🎉";
      default: return "📋";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <p className="text-gray-600">Loading tracking information...</p>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Track Your Donations 📍
            </h1>
            <p className="text-gray-600">Monitor the status and location of your donations</p>
          </div>

          {donations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Donations Yet</h2>
              <p className="text-gray-600 mb-6">Start making a difference by donating food</p>
              <button
                onClick={() => router.push("/donor/donate")}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-semibold"
              >
                Donate Food Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Donations List */}
              <div className="lg:col-span-1 space-y-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Your Donations</h2>
                {donations.map((donation) => (
                  <div
                    key={donation._id}
                    onClick={() => setSelectedDonation(donation)}
                    className={`bg-white rounded-xl p-4 cursor-pointer transition border-2 ${
                      selectedDonation?._id === donation._id
                        ? "border-green-500 shadow-lg"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                          <span className="text-2xl">🍱</span>
                          {donation.foodType}
                        </h3>
                        <p className="text-sm text-gray-600">Qty: {donation.quantity}</p>
                      </div>
                      <span className="text-2xl">{getStatusIcon(donation.status)}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(donation.status)} inline-block`}>
                      {donation.status}
                    </div>
                    {donation.ngoAssigned && (
                      <p className="text-sm text-gray-600 mt-2">
                        NGO: {donation.ngoAssigned.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tracking Details */}
              <div className="lg:col-span-2">
                {selectedDonation ? (
                  <div className="space-y-6">
                    {/* Status Timeline */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tracking Status</h2>
                      
                      <div className="space-y-4">
                        {/* Pending */}
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                            selectedDonation.status === "pending" || selectedDonation.status === "accepted" || selectedDonation.status === "picked_up" || selectedDonation.status === "in_transit" || selectedDonation.status === "delivered"
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}>
                            ✓
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800">Donation Created</h3>
                            <p className="text-sm text-gray-600">Your donation request has been submitted</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(selectedDonation.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Accepted */}
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                            selectedDonation.status === "accepted" || selectedDonation.status === "picked_up" || selectedDonation.status === "in_transit" || selectedDonation.status === "delivered"
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}>
                            {selectedDonation.status === "accepted" || selectedDonation.status === "picked_up" || selectedDonation.status === "in_transit" || selectedDonation.status === "delivered" ? "✓" : "○"}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800">Accepted by NGO</h3>
                            <p className="text-sm text-gray-600">
                              {selectedDonation.ngoAssigned
                                ? `${selectedDonation.ngoAssigned.name} accepted your donation`
                                : "Waiting for NGO to accept"}
                            </p>
                          </div>
                        </div>

                        {/* Picked Up */}
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                            selectedDonation.status === "picked_up" || selectedDonation.status === "in_transit" || selectedDonation.status === "delivered"
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}>
                            {selectedDonation.status === "picked_up" || selectedDonation.status === "in_transit" || selectedDonation.status === "delivered" ? "✓" : "○"}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800">Food Picked Up</h3>
                            <p className="text-sm text-gray-600">NGO has collected the food</p>
                          </div>
                        </div>

                        {/* Delivered */}
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                            selectedDonation.status === "delivered"
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}>
                            {selectedDonation.status === "delivered" ? "✓" : "○"}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800">Delivered Successfully</h3>
                            <p className="text-sm text-gray-600">Food has been distributed to those in need</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Live GPS Tracking */}
                    {selectedDonation.status !== "pending" && selectedDonation.status !== "delivered" && (
                      <LiveTracking 
                        donationId={selectedDonation._id} 
                        userRole="donor" 
                      />
                    )}

                    {/* Map */}
                    {selectedDonation.location && (
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Location</h2>
                        <MapComponent
                          center={selectedDonation.location}
                          markers={[
                            {
                              lat: selectedDonation.location.lat,
                              lng: selectedDonation.location.lng,
                              title: "Donation Location"
                            }
                          ]}
                        />
                      </div>
                    )}

                    {/* Donation Details */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">Donation Details</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Food Type</p>
                          <p className="font-semibold text-gray-800">{selectedDonation.foodType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Quantity</p>
                          <p className="font-semibold text-gray-800">{selectedDonation.quantity}</p>
                        </div>
                        {selectedDonation.temperature && (
                          <div>
                            <p className="text-sm text-gray-600">Temperature</p>
                            <p className="font-semibold text-gray-800">{selectedDonation.temperature}°C</p>
                          </div>
                        )}
                        {selectedDonation.expiryTime && (
                          <div>
                            <p className="text-sm text-gray-600">Expiry Time</p>
                            <p className="font-semibold text-gray-800">
                              {new Date(selectedDonation.expiryTime).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* NGO Details - Show when donation is accepted */}
                    {selectedDonation.ngoAssigned && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border-2 border-blue-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <span>🏥</span>
                          NGO Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">NGO Name</p>
                            <p className="font-semibold text-gray-800">{selectedDonation.ngoAssigned.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-semibold text-gray-800">{selectedDonation.ngoAssigned.email}</p>
                          </div>
                          {selectedDonation.ngoAssigned.ngoDetails?.contactPerson && (
                            <div>
                              <p className="text-sm text-gray-600">Contact Person</p>
                              <p className="font-semibold text-gray-800">{selectedDonation.ngoAssigned.ngoDetails.contactPerson}</p>
                            </div>
                          )}
                          {selectedDonation.ngoAssigned.ngoDetails?.contactPhone && (
                            <div>
                              <p className="text-sm text-gray-600">Contact Phone</p>
                              <p className="font-semibold text-gray-800">{selectedDonation.ngoAssigned.ngoDetails.contactPhone}</p>
                            </div>
                          )}
                          {selectedDonation.ngoAssigned.ngoDetails?.registeredAddress && (
                            <div className="md:col-span-2">
                              <p className="text-sm text-gray-600">Address</p>
                              <p className="font-semibold text-gray-800">{selectedDonation.ngoAssigned.ngoDetails.registeredAddress}</p>
                            </div>
                          )}
                          {selectedDonation.ngoAssigned.ngoDetails?.city && (
                            <div>
                              <p className="text-sm text-gray-600">City</p>
                              <p className="font-semibold text-gray-800">{selectedDonation.ngoAssigned.ngoDetails.city}</p>
                            </div>
                          )}
                          {selectedDonation.ngoAssigned.ngoDetails?.state && (
                            <div>
                              <p className="text-sm text-gray-600">State</p>
                              <p className="font-semibold text-gray-800">{selectedDonation.ngoAssigned.ngoDetails.state}</p>
                            </div>
                          )}
                          {selectedDonation.ngoAssigned.ngoDetails?.registrationNumber && (
                            <div>
                              <p className="text-sm text-gray-600">Registration Number</p>
                              <p className="font-semibold text-gray-800">{selectedDonation.ngoAssigned.ngoDetails.registrationNumber}</p>
                            </div>
                          )}
                          {selectedDonation.ngoAssigned.ngoDetails?.registrationType && (
                            <div>
                              <p className="text-sm text-gray-600">Registration Type</p>
                              <p className="font-semibold text-gray-800">{selectedDonation.ngoAssigned.ngoDetails.registrationType}</p>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <span className="font-semibold">✓ Verified NGO:</span> This organization has been verified by our admin team.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <div className="text-6xl mb-4">👈</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Select a Donation</h2>
                    <p className="text-gray-600">Click on a donation from the list to view tracking details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
