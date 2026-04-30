// client/app/ngo/requests/page.jsx

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import MapComponent from "@/components/MapComponent";
import VerificationBanner from "@/components/VerificationBanner";

export default function NGORequests() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [availableDonations, setAvailableDonations] = useState([]);
  const [acceptedDonations, setAcceptedDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("available");
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

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

    fetchDonations();
  }, [router]);

  const fetchDonations = async () => {
    try {
      const { data } = await axios.get("/donations/all");
      
      // Handle both old format (array) and new format (object with donations array)
      const allDonations = Array.isArray(data) ? data : (data.donations || []);
      
      const userId = JSON.parse(localStorage.getItem("user"))._id;
      
      const available = allDonations.filter(d => d.status === "pending");
      const accepted = allDonations.filter(d => d.ngoAssigned?._id === userId && d.status !== "delivered");
      
      setAvailableDonations(available);
      setAcceptedDonations(accepted);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching donations:", error);
      setLoading(false);
    }
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
      fetchDonations();
    } catch (error) {
      console.error("Error accepting donation:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to accept donation";
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleUpdateStatus = async (donationId, newStatus) => {
    try {
      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          await axios.post("/ngo/tracking", {
            donationId,
            status: newStatus,
            location,
            note: `Status updated to ${newStatus.replace(/_/g, " ")}`
          });
          
          alert(`Status updated to ${newStatus.replace(/_/g, " ").toUpperCase()} successfully!`);
          fetchDonations();
        }, (error) => {
          // If location permission denied, still update status without location
          axios.post("/ngo/tracking", {
            donationId,
            status: newStatus,
            location: { lat: 0, lng: 0 },
            note: `Status updated to ${newStatus.replace(/_/g, " ")}`
          }).then(() => {
            alert(`Status updated to ${newStatus.replace(/_/g, " ").toUpperCase()} successfully!`);
            fetchDonations();
          }).catch(err => {
            console.error("Error updating status:", err);
            alert("Failed to update status");
          });
        });
      } else {
        // Browser doesn't support geolocation
        await axios.post("/ngo/tracking", {
          donationId,
          status: newStatus,
          location: { lat: 0, lng: 0 },
          note: `Status updated to ${newStatus.replace(/_/g, " ")}`
        });
        alert(`Status updated to ${newStatus.replace(/_/g, " ").toUpperCase()} successfully!`);
        fetchDonations();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar role="ngo" />
        
        <main className="flex-1 p-8">
          {/* Verification Banner */}
          {user?.ngoDetails && (
            <VerificationBanner verificationStatus={user.ngoDetails.verificationStatus} />
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              FoodZero Requests 📦
            </h1>
            <p className="text-gray-600">Accept and manage donations in your area</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("available")}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === "available"
                  ? "bg-green-500 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Available Requests ({availableDonations.length})
            </button>
            <button
              onClick={() => setActiveTab("accepted")}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === "accepted"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              My Accepted ({acceptedDonations.length})
            </button>
          </div>

          {/* Available Donations */}
          {activeTab === "available" && (
            <div>
              {availableDonations.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">No Available Donations</h2>
                  <p className="text-gray-600">Check back later for new donation requests</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableDonations.map((donation) => (
                    <div key={donation._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border-2 border-gray-200 hover:border-green-500">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span className="text-3xl">🍱</span>
                            {donation.foodType}
                          </h3>
                          <p className="text-gray-600 mt-1">Quantity: {donation.quantity}</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                          Pending
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>👤</span>
                          <span>Donor: {donation.donor?.name || "Anonymous"}</span>
                        </div>
                        
                        {donation.donor?.donorDetails?.phoneNumber && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>📞</span>
                            <span>Phone: {donation.donor.donorDetails.phoneNumber}</span>
                          </div>
                        )}

                        {donation.donor?.donorDetails?.address ? (
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <span>📍</span>
                            <span>Address: {donation.donor.donorDetails.address}</span>
                          </div>
                        ) : donation.location ? (
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <span>📍</span>
                            <span>Location: Lat {donation.location.lat.toFixed(4)}, Lng {donation.location.lng.toFixed(4)}</span>
                          </div>
                        ) : null}

                        {donation.donor?.donorDetails?.donorType && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>🏠</span>
                            <span className="capitalize">Type: {donation.donor.donorDetails.donorType}</span>
                          </div>
                        )}
                        
                        {donation.expiryTime && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>⏰</span>
                            <span>Expires: {new Date(donation.expiryTime).toLocaleDateString()}</span>
                          </div>
                        )}

                        {donation.temperature && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>🌡️</span>
                            <span>Temp: {donation.temperature}°C</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>📍</span>
                          <span>Distance: ~2.5 km</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>📅</span>
                          <span>Posted: {new Date(donation.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAcceptDonation(donation._id)}
                        disabled={user?.ngoDetails?.verificationStatus !== "verified"}
                        className={`w-full py-3 rounded-lg transition font-semibold flex items-center justify-center gap-2 ${
                          user?.ngoDetails?.verificationStatus === "verified"
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {user?.ngoDetails?.verificationStatus === "verified" ? (
                          <>
                            <span>✓</span>
                            <span>Accept Donation</span>
                          </>
                        ) : (
                          <>
                            <span>🔒</span>
                            <span>Verification Required</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Accepted Donations */}
          {activeTab === "accepted" && (
            <div>
              {acceptedDonations.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">📦</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">No Accepted Donations</h2>
                  <p className="text-gray-600">Accept donations from the available requests tab</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {acceptedDonations.map((donation) => (
                    <div key={donation._id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Donation Info */}
                        <div className="lg:col-span-2">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <span className="text-3xl">🍱</span>
                                {donation.foodType}
                              </h3>
                              <p className="text-gray-600 mt-1">Quantity: {donation.quantity}</p>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                              donation.status === "accepted" ? "bg-blue-100 text-blue-800" :
                              donation.status === "picked_up" ? "bg-purple-100 text-purple-800" :
                              donation.status === "in_transit" ? "bg-indigo-100 text-indigo-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {donation.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Donor</p>
                              <p className="font-semibold text-gray-800">{donation.donor?.name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Donor Email</p>
                              <p className="font-semibold text-gray-800">{donation.donor?.email}</p>
                            </div>
                            {donation.donor?.donorDetails?.phoneNumber && (
                              <div>
                                <p className="text-sm text-gray-600">Donor Phone</p>
                                <p className="font-semibold text-gray-800">{donation.donor.donorDetails.phoneNumber}</p>
                              </div>
                            )}
                            {donation.donor?.donorDetails?.address ? (
                              <div className="col-span-2">
                                <p className="text-sm text-gray-600">Pickup Address</p>
                                <p className="font-semibold text-gray-800">{donation.donor.donorDetails.address}</p>
                              </div>
                            ) : donation.location ? (
                              <div className="col-span-2">
                                <p className="text-sm text-gray-600">Pickup Location (GPS)</p>
                                <p className="font-semibold text-gray-800">
                                  Latitude: {donation.location.lat.toFixed(6)}, Longitude: {donation.location.lng.toFixed(6)}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">📍 Use map below for navigation</p>
                              </div>
                            ) : null}
                            {donation.donor?.donorDetails?.donorType && (
                              <div>
                                <p className="text-sm text-gray-600">Donor Type</p>
                                <p className="font-semibold text-gray-800 capitalize">{donation.donor.donorDetails.donorType}</p>
                              </div>
                            )}
                            {donation.temperature && (
                              <div>
                                <p className="text-sm text-gray-600">Temperature</p>
                                <p className="font-semibold text-gray-800">{donation.temperature}°C</p>
                              </div>
                            )}
                            {donation.expiryTime && (
                              <div>
                                <p className="text-sm text-gray-600">Expiry</p>
                                <p className="font-semibold text-gray-800">
                                  {new Date(donation.expiryTime).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => {
                                setSelectedDonation(donation);
                                setShowTrackingModal(true);
                              }}
                              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition font-semibold flex items-center gap-2"
                            >
                              <span>📍</span>
                              <span>View Tracking</span>
                            </button>
                            
                            {donation.status === "accepted" && (
                              <button
                                onClick={() => handleUpdateStatus(donation._id, "picked_up")}
                                className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition font-semibold flex items-center gap-2"
                              >
                                <span>📦</span>
                                <span>Mark as Picked Up</span>
                              </button>
                            )}
                            {donation.status === "picked_up" && (
                              <button
                                onClick={() => handleUpdateStatus(donation._id, "in_transit")}
                                className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition font-semibold flex items-center gap-2"
                              >
                                <span>🚚</span>
                                <span>Mark In Transit</span>
                              </button>
                            )}
                            {donation.status === "in_transit" && (
                              <button
                                onClick={() => handleUpdateStatus(donation._id, "delivered")}
                                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition font-semibold flex items-center gap-2"
                              >
                                <span>✅</span>
                                <span>Mark as Delivered</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Map */}
                        <div className="lg:col-span-1">
                          {donation.location && (
                            <div className="h-full min-h-[200px]">
                              <MapComponent
                                center={donation.location}
                                markers={[
                                  {
                                    lat: donation.location.lat,
                                    lng: donation.location.lng,
                                    title: "Pickup Location"
                                  }
                                ]}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tracking Modal */}
          {showTrackingModal && selectedDonation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <span>📍</span>
                      Tracking Details
                    </h2>
                    <button
                      onClick={() => {
                        setShowTrackingModal(false);
                        setSelectedDonation(null);
                      }}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  {/* Donation Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {selectedDonation.foodType}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-semibold ml-2">{selectedDonation.quantity}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-semibold ml-2 ${
                          selectedDonation.status === "accepted" ? "text-blue-600" :
                          selectedDonation.status === "picked_up" ? "text-purple-600" :
                          selectedDonation.status === "in_transit" ? "text-indigo-600" :
                          "text-gray-600"
                        }`}>
                          {selectedDonation.status.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Donor:</span>
                        <span className="font-semibold ml-2">{selectedDonation.donor?.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Contact:</span>
                        <span className="font-semibold ml-2">{selectedDonation.donor?.email}</span>
                      </div>
                      {selectedDonation.donor?.donorDetails?.phoneNumber && (
                        <div>
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-semibold ml-2">{selectedDonation.donor.donorDetails.phoneNumber}</span>
                        </div>
                      )}
                      {selectedDonation.donor?.donorDetails?.address ? (
                        <div className="col-span-2">
                          <span className="text-gray-600">Pickup Address:</span>
                          <span className="font-semibold ml-2">{selectedDonation.donor.donorDetails.address}</span>
                        </div>
                      ) : selectedDonation.location ? (
                        <div className="col-span-2">
                          <span className="text-gray-600">Pickup Location (GPS):</span>
                          <span className="font-semibold ml-2">
                            {selectedDonation.location.lat.toFixed(6)}, {selectedDonation.location.lng.toFixed(6)}
                          </span>
                          <p className="text-xs text-blue-600 mt-1">📍 See map below for exact location</p>
                        </div>
                      ) : null}
                      {selectedDonation.donor?.donorDetails?.donorType && (
                        <div>
                          <span className="text-gray-600">Type:</span>
                          <span className="font-semibold ml-2 capitalize">{selectedDonation.donor.donorDetails.donorType}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Status Timeline</h3>
                    <div className="space-y-4">
                      <div className={`flex items-start gap-3 ${
                        selectedDonation.status === "accepted" || 
                        selectedDonation.status === "picked_up" || 
                        selectedDonation.status === "in_transit" || 
                        selectedDonation.status === "delivered" 
                        ? "opacity-100" : "opacity-40"
                      }`}>
                        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                          ✓
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Accepted</p>
                          <p className="text-sm text-gray-600">Donation accepted by NGO</p>
                        </div>
                      </div>

                      <div className={`flex items-start gap-3 ${
                        selectedDonation.status === "picked_up" || 
                        selectedDonation.status === "in_transit" || 
                        selectedDonation.status === "delivered" 
                        ? "opacity-100" : "opacity-40"
                      }`}>
                        <div className={`${
                          selectedDonation.status === "picked_up" || 
                          selectedDonation.status === "in_transit" || 
                          selectedDonation.status === "delivered"
                          ? "bg-purple-500" : "bg-gray-300"
                        } text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0`}>
                          {selectedDonation.status === "picked_up" || 
                           selectedDonation.status === "in_transit" || 
                           selectedDonation.status === "delivered" ? "✓" : "○"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Picked Up</p>
                          <p className="text-sm text-gray-600">Food collected from donor</p>
                        </div>
                      </div>

                      <div className={`flex items-start gap-3 ${
                        selectedDonation.status === "in_transit" || 
                        selectedDonation.status === "delivered" 
                        ? "opacity-100" : "opacity-40"
                      }`}>
                        <div className={`${
                          selectedDonation.status === "in_transit" || 
                          selectedDonation.status === "delivered"
                          ? "bg-indigo-500" : "bg-gray-300"
                        } text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0`}>
                          {selectedDonation.status === "in_transit" || 
                           selectedDonation.status === "delivered" ? "✓" : "○"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">In Transit</p>
                          <p className="text-sm text-gray-600">On the way to destination</p>
                        </div>
                      </div>

                      <div className={`flex items-start gap-3 ${
                        selectedDonation.status === "delivered" 
                        ? "opacity-100" : "opacity-40"
                      }`}>
                        <div className={`${
                          selectedDonation.status === "delivered"
                          ? "bg-green-500" : "bg-gray-300"
                        } text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0`}>
                          {selectedDonation.status === "delivered" ? "✓" : "○"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Delivered</p>
                          <p className="text-sm text-gray-600">Successfully delivered to beneficiaries</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Map */}
                  {selectedDonation.location && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Pickup Location</h3>
                      <div className="h-64 rounded-lg overflow-hidden">
                        <MapComponent
                          center={selectedDonation.location}
                          markers={[
                            {
                              lat: selectedDonation.location.lat,
                              lng: selectedDonation.location.lng,
                              title: "Pickup Location"
                            }
                          ]}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {selectedDonation.status === "accepted" && (
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedDonation._id, "picked_up");
                          setShowTrackingModal(false);
                        }}
                        className="flex-1 bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition font-semibold"
                      >
                        Mark as Picked Up
                      </button>
                    )}
                    {selectedDonation.status === "picked_up" && (
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedDonation._id, "in_transit");
                          setShowTrackingModal(false);
                        }}
                        className="flex-1 bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 transition font-semibold"
                      >
                        Mark In Transit
                      </button>
                    )}
                    {selectedDonation.status === "in_transit" && (
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedDonation._id, "delivered");
                          setShowTrackingModal(false);
                        }}
                        className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-semibold"
                      >
                        Mark as Delivered
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowTrackingModal(false);
                        setSelectedDonation(null);
                      }}
                      className="px-6 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
