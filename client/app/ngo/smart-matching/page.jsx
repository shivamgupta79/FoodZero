"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { MapPin, Clock, TrendingUp, Route, Package, AlertCircle } from "lucide-react";

export default function SmartMatching() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [batchSuggestions, setBatchSuggestions] = useState(null);
  const [pickupSequence, setPickupSequence] = useState(null);
  const [activeTab, setActiveTab] = useState("recommendations");
  const [radius, setRadius] = useState(10);

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

    setLoading(false);
    fetchData();
  }, [router, radius]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch recommendations
      const recResponse = await axios.get(`/api/matching/recommendations?radius=${radius}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecommendations(recResponse.data.recommendations || []);

      // Fetch batch suggestions
      const batchResponse = await axios.get(`/api/matching/batch-suggestions?radius=${radius}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBatchSuggestions(batchResponse.data);

      // Fetch pickup sequence
      const seqResponse = await axios.get(`/api/matching/pickup-sequence`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPickupSequence(seqResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getUrgencyColor = (level) => {
    const colors = {
      CRITICAL: "text-red-600 bg-red-50 border-red-300",
      HIGH: "text-orange-600 bg-orange-50 border-orange-300",
      MEDIUM: "text-yellow-600 bg-yellow-50 border-yellow-300",
      LOW: "text-green-600 bg-green-50 border-green-300"
    };
    return colors[level] || "text-gray-600 bg-gray-50 border-gray-300";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      URGENT: "bg-red-500",
      MODERATE: "bg-orange-500",
      NORMAL: "bg-green-500"
    };
    return colors[priority] || "bg-gray-500";
  };

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
        <Sidebar role="ngo" />
        
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              Smart Matching & Logistics
            </h1>
            <p className="text-gray-600">
              AI-powered recommendations and route optimization for efficient food collection
            </p>
          </div>

          {/* Radius Selector */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-blue-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search Radius
            </label>
            <select
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full md:w-64 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={15}>15 km</option>
              <option value={20}>20 km</option>
              <option value={30}>30 km</option>
            </select>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("recommendations")}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === "recommendations"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Package className="w-5 h-5 inline mr-2" />
              Recommendations ({recommendations.length})
            </button>
            <button
              onClick={() => setActiveTab("batch")}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === "batch"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Route className="w-5 h-5 inline mr-2" />
              Batch Suggestions
            </button>
            <button
              onClick={() => setActiveTab("sequence")}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === "sequence"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <MapPin className="w-5 h-5 inline mr-2" />
              Pickup Sequence
            </button>
          </div>

          {/* Recommendations Tab */}
          {activeTab === "recommendations" && (
            <div className="space-y-4">
              {recommendations.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No donations available within {radius} km</p>
                </div>
              ) : (
                recommendations.map((rec, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-blue-400 transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {rec.donation.foodType}
                        </h3>
                        <p className="text-gray-600">Quantity: {rec.donation.quantity}</p>
                        <p className="text-sm text-gray-500">
                          Donor: {rec.donation.donor?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {rec.matchScore}
                        </div>
                        <div className="text-sm text-gray-600">Match Score</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="text-sm text-gray-600">Distance</div>
                          <div className="font-semibold">{rec.distance} km</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <div>
                          <div className="text-sm text-gray-600">Pickup Time</div>
                          <div className="font-semibold">{rec.estimatedPickupTime}</div>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-gray-600 mb-1">Urgency</div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${getUrgencyColor(rec.urgencyLevel)}`}>
                          {rec.urgencyLevel}
                        </span>
                      </div>
                    </div>

                    {rec.suggestedTimeSlots && rec.suggestedTimeSlots.length > 0 && (
                      <div className="border-t pt-4">
                        <div className="text-sm font-semibold text-gray-700 mb-2">
                          Suggested Time Slots:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {rec.suggestedTimeSlots.map((slot, idx) => (
                            <div key={idx} className="bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 text-sm">
                              <div className="font-semibold text-blue-800">{slot.label}</div>
                              <div className="text-blue-600 text-xs">
                                Arrival: {slot.estimatedArrival}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition font-semibold">
                      Accept Donation
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Batch Suggestions Tab */}
          {activeTab === "batch" && batchSuggestions && (
            <div className="space-y-4">
              {batchSuggestions.suggestions && batchSuggestions.suggestions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No batch suggestions available</p>
                </div>
              ) : (
                batchSuggestions.suggestions?.map((suggestion, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${getPriorityColor(suggestion.priority)}`}></div>
                        <h3 className="text-xl font-bold text-gray-800">{suggestion.priority} Priority</h3>
                      </div>
                      <div className="text-sm text-gray-600">
                        {suggestion.numberOfStops} stops
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{suggestion.description}</p>

                    <div className="grid grid-cols-3 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <div className="text-sm text-gray-600">Total Distance</div>
                        <div className="text-lg font-bold text-gray-800">{suggestion.totalDistance} km</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Estimated Time</div>
                        <div className="text-lg font-bold text-gray-800">{suggestion.estimatedTime.formatted}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Recommended Slot</div>
                        <div className="text-sm font-semibold text-blue-600">
                          {suggestion.recommendedTimeSlot?.label}
                        </div>
                      </div>
                    </div>

                    {suggestion.route && suggestion.route.length > 0 && (
                      <div className="border-t pt-4">
                        <div className="text-sm font-semibold text-gray-700 mb-3">Route Details:</div>
                        <div className="space-y-2">
                          {suggestion.route.map((stop, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800">{stop.foodType}</div>
                                <div className="text-sm text-gray-600">{stop.quantity}</div>
                              </div>
                              <div className="text-sm text-gray-600">{stop.distance} km</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pickup Sequence Tab */}
          {activeTab === "sequence" && pickupSequence && (
            <div>
              {pickupSequence.optimizedRoute && pickupSequence.optimizedRoute.route.length > 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Optimized Pickup Sequence for Accepted Donations
                  </h3>

                  <div className="grid grid-cols-3 gap-4 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-600">Total Pickups</div>
                      <div className="text-2xl font-bold text-blue-600">{pickupSequence.totalPickups}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Total Distance</div>
                      <div className="text-2xl font-bold text-blue-600">{pickupSequence.summary?.totalDistance} km</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Estimated Time</div>
                      <div className="text-2xl font-bold text-blue-600">{pickupSequence.summary?.estimatedTime}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {pickupSequence.optimizedRoute.route.map((stop, index) => (
                      <div key={index} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                            {stop.order}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-800 mb-1">{stop.foodType}</h4>
                            <p className="text-gray-600 mb-2">Quantity: {stop.quantity}</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600">Donor:</span>
                                <span className="font-semibold ml-1">{stop.donor?.name}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Distance:</span>
                                <span className="font-semibold ml-1">{stop.distance} km</span>
                              </div>
                              {stop.donor?.phone && (
                                <div>
                                  <span className="text-gray-600">Phone:</span>
                                  <span className="font-semibold ml-1">{stop.donor.phone}</span>
                                </div>
                              )}
                            </div>
                            {stop.donor?.address && (
                              <p className="text-sm text-gray-600 mt-2">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                {stop.donor.address}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No accepted donations to pickup</p>
                  <p className="text-sm text-gray-500 mt-2">Accept some donations to see the optimized pickup sequence</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
