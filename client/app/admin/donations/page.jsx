// client/app/admin/donations/page.jsx

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Package, Clock, CheckCircle, Truck, PartyPopper, TrendingUp, AlertCircle } from "lucide-react";

export default function AdminDonations() {
  const router = useRouter();
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      router.push(`/${parsedUser.role}/dashboard`);
      return;
    }

    fetchDonations();
  }, [router]);

  useEffect(() => {
    filterDonations();
  }, [donations, activeFilter, searchTerm]);

  const fetchDonations = async () => {
    try {
      const { data } = await axios.get("/donations/all");
      
      // Handle both old format (array) and new format (object with donations array)
      const allDonations = Array.isArray(data) ? data : (data.donations || []);
      
      setDonations(allDonations);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching donations:", error);
      alert("Failed to load donations. Please try again.");
      setLoading(false);
    }
  };

  const filterDonations = () => {
    let filtered = donations;

    if (activeFilter !== "all") {
      if (activeFilter === "in_transit") {
        filtered = filtered.filter(d => d.status === "in_transit" || d.status === "picked_up");
      } else {
        filtered = filtered.filter(d => d.status === activeFilter);
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(d =>
        (d.foodType && d.foodType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.donor?.name && d.donor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.ngoAssigned?.name && d.ngoAssigned.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredDonations(filtered);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    setSearchTerm(""); // Clear search when changing filter
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-blue-100 text-blue-800";
      case "picked_up": return "bg-purple-100 text-purple-800";
      case "in_transit": return "bg-indigo-100 text-indigo-800";
      case "delivered": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
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
          <div className="text-6xl mb-4 animate-spin">🔄</div>
          <p className="text-gray-600">Loading donations...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: donations.length,
    pending: donations.filter(d => d.status === "pending").length,
    accepted: donations.filter(d => d.status === "accepted").length,
    inTransit: donations.filter(d => d.status === "in_transit" || d.status === "picked_up").length,
    delivered: donations.filter(d => d.status === "delivered").length
  };

  const deliveryRate = stats.total > 0 ? ((stats.delivered / stats.total) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar role="admin" />
        
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Package className="w-8 h-8 text-green-600" />
              All Donations
            </h1>
            <p className="text-gray-600">Monitor and manage all food donations across the platform</p>
          </div>

          {/* Clickable Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Total Donations */}
            <button
              onClick={() => handleFilterClick("all")}
              className={`bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200 text-left cursor-pointer ${
                activeFilter === "all" ? "ring-4 ring-blue-300 scale-105" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Package className="w-8 h-8" />
                </div>
                <TrendingUp className="w-6 h-6 opacity-80" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.total}</div>
              <div className="text-blue-100 text-sm font-medium">Total Donations</div>
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs text-blue-100 flex items-center justify-between">
                  <span>Click to view all</span>
                  {activeFilter === "all" && <span>✓ Active</span>}
                </div>
              </div>
            </button>

            {/* Pending */}
            <button
              onClick={() => handleFilterClick("pending")}
              className={`bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200 text-left cursor-pointer ${
                activeFilter === "pending" ? "ring-4 ring-yellow-300 scale-105 animate-pulse" : stats.pending > 0 ? "animate-pulse" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Clock className="w-8 h-8" />
                </div>
                {stats.pending > 0 && (
                  <div className="bg-white/30 px-3 py-1 rounded-full">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold mb-1">{stats.pending}</div>
              <div className="text-yellow-100 text-sm font-medium">Pending</div>
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs text-yellow-100 flex items-center justify-between">
                  <span>{stats.pending > 0 ? "Needs attention" : "All clear"}</span>
                  {activeFilter === "pending" && <span>✓ Active</span>}
                </div>
              </div>
            </button>

            {/* Accepted */}
            <button
              onClick={() => handleFilterClick("accepted")}
              className={`bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200 text-left cursor-pointer ${
                activeFilter === "accepted" ? "ring-4 ring-blue-300 scale-105" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{stats.accepted}</div>
                  <div className="text-xs text-blue-100">Ready</div>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats.accepted}</div>
              <div className="text-blue-100 text-sm font-medium">Accepted</div>
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs text-blue-100 flex items-center justify-between">
                  <span>Click to view</span>
                  {activeFilter === "accepted" && <span>✓ Active</span>}
                </div>
              </div>
            </button>

            {/* In Transit */}
            <button
              onClick={() => handleFilterClick("in_transit")}
              className={`bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200 text-left cursor-pointer ${
                activeFilter === "in_transit" ? "ring-4 ring-purple-300 scale-105" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Truck className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{stats.inTransit}</div>
                  <div className="text-xs text-purple-100">Moving</div>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats.inTransit}</div>
              <div className="text-purple-100 text-sm font-medium">In Transit</div>
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs text-purple-100 flex items-center justify-between">
                  <span>Click to track</span>
                  {activeFilter === "in_transit" && <span>✓ Active</span>}
                </div>
              </div>
            </button>

            {/* Delivered */}
            <button
              onClick={() => handleFilterClick("delivered")}
              className={`bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200 text-left cursor-pointer ${
                activeFilter === "delivered" ? "ring-4 ring-green-300 scale-105" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <PartyPopper className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{deliveryRate}%</div>
                  <div className="text-xs text-green-100">Rate</div>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats.delivered}</div>
              <div className="text-green-100 text-sm font-medium">Delivered</div>
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs text-green-100 flex items-center justify-between">
                  <span>Click to view</span>
                  {activeFilter === "delivered" && <span>✓ Active</span>}
                </div>
              </div>
            </button>
          </div>

          {/* Info Banners */}
          {activeFilter === "all" && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6 mb-8 shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    All {stats.total} Donations
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Complete overview of all food donations on the FoodZero platform across all statuses.
                  </p>
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <Clock className="w-4 h-4" />
                      <span>{stats.pending} Pending</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-700">
                      <CheckCircle className="w-4 h-4" />
                      <span>{stats.accepted} Accepted</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-700">
                      <Truck className="w-4 h-4" />
                      <span>{stats.inTransit} In Transit</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700">
                      <PartyPopper className="w-4 h-4" />
                      <span>{stats.delivered} Delivered</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeFilter === "pending" && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg p-6 mb-8 shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {stats.pending} Pending Donation{stats.pending !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-gray-700">
                    These donations are awaiting NGO acceptance. They need to be picked up soon to maintain food quality and safety.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeFilter === "accepted" && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 rounded-lg p-6 mb-8 shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {stats.accepted} Accepted Donation{stats.accepted !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-gray-700">
                    These donations have been accepted by NGOs and are ready for pickup. They are scheduled for collection and delivery.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeFilter === "in_transit" && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-lg p-6 mb-8 shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Truck className="w-8 h-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {stats.inTransit} Donation{stats.inTransit !== 1 ? 's' : ''} In Transit
                  </h3>
                  <p className="text-gray-700">
                    These donations are currently being transported from donors to NGOs. Track their progress and monitor temperature conditions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeFilter === "delivered" && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-6 mb-8 shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <PartyPopper className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {stats.delivered} Delivered Donation{stats.delivered !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-gray-700">
                    These donations have been successfully delivered to NGOs and are helping feed communities in need. Great work!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search Filter */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Donations
                </label>
                <input
                  type="text"
                  placeholder="Search by food type, donor, or NGO..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-7 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Donations Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Table Header with Filter Info */}
            <div className="bg-gray-50 border-b-2 border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {activeFilter === "all" && <Package className="w-6 h-6 text-blue-600" />}
                  {activeFilter === "pending" && <Clock className="w-6 h-6 text-yellow-600" />}
                  {activeFilter === "accepted" && <CheckCircle className="w-6 h-6 text-blue-600" />}
                  {activeFilter === "in_transit" && <Truck className="w-6 h-6 text-purple-600" />}
                  {activeFilter === "delivered" && <PartyPopper className="w-6 h-6 text-green-600" />}
                  
                  {activeFilter === "all" && `All Donations (${filteredDonations.length})`}
                  {activeFilter === "pending" && `Pending Donations (${filteredDonations.length})`}
                  {activeFilter === "accepted" && `Accepted Donations (${filteredDonations.length})`}
                  {activeFilter === "in_transit" && `In Transit (${filteredDonations.length})`}
                  {activeFilter === "delivered" && `Delivered Donations (${filteredDonations.length})`}
                </h2>
                <div className="text-sm text-gray-600">
                  {searchTerm ? `Filtered by search: "${searchTerm}"` : "Showing all donations in this category"}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Food Type</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Quantity</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Donor</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">NGO Assigned</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Created</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Temperature</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-gray-600">No donations found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredDonations.map((donation) => (
                      <tr key={donation._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🍱</span>
                            <span className="font-semibold text-gray-800">{donation.foodType}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{donation.quantity}</td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-800">{donation.donor?.name || "Unknown"}</p>
                            <p className="text-sm text-gray-500">{donation.donor?.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {donation.ngoAssigned ? (
                            <div>
                              <p className="font-medium text-gray-800">{donation.ngoAssigned.name}</p>
                              <p className="text-sm text-gray-500">{donation.ngoAssigned.email}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not assigned</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(donation.status)} flex items-center gap-1 w-fit`}>
                            <span>{getStatusIcon(donation.status)}</span>
                            <span>{donation.status}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600 text-sm">
                          {new Date(donation.createdAt).toLocaleDateString()}
                          <br />
                          <span className="text-xs text-gray-500">
                            {new Date(donation.createdAt).toLocaleTimeString()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {donation.temperature ? (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              donation.temperature > 25 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                            }`}>
                              {donation.temperature}°C
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
            <p className="text-blue-800">
              Showing <span className="font-bold">{filteredDonations.length}</span> of <span className="font-bold">{donations.length}</span> donations
            </p>
          </div>

          {/* Temperature Alerts */}
          {donations.filter(d => d.temperature && d.temperature > 25).length > 0 && (
            <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                <span>⚠️</span>
                Temperature Alerts
              </h3>
              <div className="space-y-2">
                {donations
                  .filter(d => d.temperature && d.temperature > 25)
                  .map(d => (
                    <div key={d._id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{d.foodType}</p>
                        <p className="text-sm text-gray-600">Donor: {d.donor?.name}</p>
                      </div>
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        {d.temperature}°C
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
