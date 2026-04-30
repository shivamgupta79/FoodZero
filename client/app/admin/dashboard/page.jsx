// client/app/admin/dashboard/page.jsx

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonations: 0,
    totalNGOs: 0,
    activePickups: 0,
    totalDonors: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [donationsPerDay, setDonationsPerDay] = useState([]);
  const [ngoPerformance, setNgoPerformance] = useState([]);
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

    if (parsedUser.role !== "admin") {
      router.push(`/${parsedUser.role}/dashboard`);
      return;
    }

    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      console.log("Fetching dashboard data...");
      
      const [usersRes, donationsRes, statsRes] = await Promise.all([
        axios.get("/admin/users").catch(err => {
          console.error("Error fetching users:", err.response?.status, err.response?.data);
          throw err;
        }),
        axios.get("/donations/all").catch(err => {
          console.error("Error fetching donations:", err.response?.status, err.response?.data);
          throw err;
        }),
        axios.get("/admin/stats").catch(err => {
          console.error("Error fetching stats:", err.response?.status, err.response?.data);
          throw err;
        })
      ]);

      console.log("Data fetched successfully");
      setUsers(usersRes.data);
      
      // Handle both old format (array) and new format (object with donations array)
      const allDonations = Array.isArray(donationsRes.data) ? donationsRes.data : (donationsRes.data.donations || []);
      setDonations(allDonations);
      setStats(statsRes.data);

      // Generate recent activity
      const activity = allDonations.slice(0, 10).map((d, idx) => ({
        id: idx,
        time: new Date(d.createdAt).toLocaleTimeString(),
        message: `New donation: ${d.foodType || "Unknown"} by ${d.donor?.name || "Unknown"}`,
        type: "donation"
      }));
      setRecentActivity(activity);

      // Calculate donations per day (last 7 days)
      const last7Days = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const count = allDonations.filter(d => {
          const donationDate = new Date(d.createdAt).toISOString().split('T')[0];
          return donationDate === dateStr;
        }).length;
        
        last7Days.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: dateStr,
          count: count
        });
      }
      setDonationsPerDay(last7Days);

      // Calculate NGO performance (top 5 NGOs by delivered donations)
      const ngoStats = {};
      allDonations.forEach(d => {
        if (d.ngoAssigned && d.ngoAssigned.name && d.status === "delivered") {
          const ngoName = d.ngoAssigned.name;
          if (!ngoStats[ngoName]) {
            ngoStats[ngoName] = 0;
          }
          ngoStats[ngoName]++;
        }
      });

      const ngoPerformanceData = Object.entries(ngoStats)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      setNgoPerformance(ngoPerformanceData);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert(`Failed to load dashboard: ${error.response?.data?.message || error.message}`);
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
    const deliveredDonations = donations.filter(d => d.status === "delivered");
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
    const deliveredDonations = donations.filter(d => d.status === "delivered");
    let totalKg = 0;
    
    deliveredDonations.forEach(donation => {
      const kg = convertToKg(donation.quantity, donation.quantityUnit);
      totalKg += kg;
    });
    
    // Minimum fallback if no quantity data
    return totalKg > 0 ? totalKg : deliveredDonations.length * 2.5;
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await axios.delete(`/admin/users/${userId}`);
      fetchDashboardData();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar role="admin" />
        
        <main className="flex-1 p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Admin Dashboard 👨‍💼
            </h1>
            <p className="text-gray-600">System monitoring and control center</p>
          </div>

          {/* Global System Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-5xl">👤</span>
                <span className="text-3xl font-bold">{stats.totalUsers || users.length}</span>
              </div>
              <p className="text-blue-100">Total Users</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-5xl">🍱</span>
                <span className="text-3xl font-bold">{stats.totalDonations || donations.length}</span>
              </div>
              <p className="text-green-100">Total Donations</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-5xl">🏥</span>
                <span className="text-3xl font-bold">{stats.totalNGOs || users.filter(u => u.role === "ngo").length}</span>
              </div>
              <p className="text-purple-100">Total NGOs</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-5xl">🚚</span>
                <span className="text-3xl font-bold">{donations.filter(d => d.status === "accepted").length}</span>
              </div>
              <p className="text-orange-100">Active Pickups</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-5xl">🤲</span>
                <span className="text-3xl font-bold">{stats.totalDonors || users.filter(u => u.role === "donor").length}</span>
              </div>
              <p className="text-yellow-100">Total Donors</p>
            </div>
          </div>

          {/* Impact Metrics - Meals Saved & Waste Diverted */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Meals Saved Card */}
            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <span className="text-5xl">🍽️</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Meals Saved</h3>
                    <p className="text-teal-100 text-sm">From food waste</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-6xl font-bold mb-2">
                    {calculateTotalMeals().toLocaleString()}
                  </div>
                  <p className="text-teal-100 text-lg">
                    Meals provided to communities in need
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                  <div>
                    <div className="text-2xl font-bold">{donations.filter(d => d.status === "delivered").length}</div>
                    <div className="text-teal-100 text-sm">Donations Delivered</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {donations.filter(d => d.status === "delivered").length > 0 
                        ? Math.round((donations.filter(d => d.status === "delivered").length / donations.length) * 100) 
                        : 0}%
                    </div>
                    <div className="text-teal-100 text-sm">Success Rate</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm">
                    <span>💡</span>
                    <span>Based on actual donation quantities and serving sizes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Waste Diverted Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <span className="text-5xl">♻️</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Waste Diverted</h3>
                    <p className="text-emerald-100 text-sm">From landfills</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-bold">
                      {calculateTotalWaste().toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    </span>
                    <span className="text-3xl font-semibold">kg</span>
                  </div>
                  <p className="text-emerald-100 text-lg mt-2">
                    Food waste prevented from disposal
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                  <div>
                    <div className="text-2xl font-bold">
                      {(calculateTotalWaste() * 0.342).toFixed(1)}
                    </div>
                    <div className="text-emerald-100 text-sm">kg CO₂ Saved</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {(calculateTotalWaste() / 1000).toFixed(2)}
                    </div>
                    <div className="text-emerald-100 text-sm">Tonnes Total</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm">
                    <span>🌍</span>
                    <span>0.342 kg CO₂ saved per kg of food waste diverted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Graph Section - Active Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Donations Per Day Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📈</span>
                Donations Per Day
              </h2>
              <div className="h-64">
                {donationsPerDay.length > 0 ? (
                  <div className="h-full flex items-end justify-between gap-2 px-2">
                    {donationsPerDay.map((day, index) => {
                      const maxCount = Math.max(...donationsPerDay.map(d => d.count), 1);
                      const heightPercent = (day.count / maxCount) * 100;
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex flex-col items-center">
                            <span className="text-sm font-bold text-gray-700 mb-1">{day.count}</span>
                            <div 
                              className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-500 hover:from-green-600 hover:to-green-500 cursor-pointer relative group"
                              style={{ height: `${Math.max(heightPercent, 10)}%`, minHeight: '20px' }}
                            >
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {day.count} donation{day.count !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-gray-600 mt-1">{day.day}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📊</div>
                      <p className="text-gray-600">No donation data available</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last 7 days</span>
                  <span className="font-semibold text-green-600">
                    Total: {donationsPerDay.reduce((sum, day) => sum + day.count, 0)} donations
                  </span>
                </div>
              </div>
            </div>

            {/* NGO Performance Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🏆</span>
                NGO Performance
              </h2>
              <div className="h-64">
                {ngoPerformance.length > 0 ? (
                  <div className="h-full flex flex-col justify-center gap-3">
                    {ngoPerformance.map((ngo, index) => {
                      const maxCount = Math.max(...ngoPerformance.map(n => n.count), 1);
                      const widthPercent = (ngo.count / maxCount) * 100;
                      const colors = [
                        'from-yellow-500 to-yellow-400',
                        'from-blue-500 to-blue-400',
                        'from-purple-500 to-purple-400',
                        'from-pink-500 to-pink-400',
                        'from-indigo-500 to-indigo-400'
                      ];
                      
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]" title={ngo.name}>
                                {ngo.name}
                              </span>
                              <span className="text-sm font-bold text-gray-800 ml-2">{ngo.count}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r ${colors[index]} rounded-full transition-all duration-500 hover:opacity-80 cursor-pointer relative group`}
                                style={{ width: `${Math.max(widthPercent, 5)}%` }}
                              >
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                  {ngo.count} delivered
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📊</div>
                      <p className="text-gray-600">No NGO performance data available</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Top 5 NGOs by deliveries</span>
                  <span className="font-semibold text-blue-600">
                    Total: {ngoPerformance.reduce((sum, ngo) => sum + ngo.count, 0)} delivered
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* User Management Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>👥</span>
              User Management
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 10).map((u) => (
                    <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium">{u.name}</td>
                      <td className="py-4 px-4 text-gray-600">{u.email}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          u.role === "donor" ? "bg-green-100 text-green-800" :
                          u.role === "ngo" ? "bg-blue-100 text-blue-800" :
                          "bg-purple-100 text-purple-800"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Donation Monitoring Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>📦</span>
              Donation Monitoring
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Food Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Donor</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">NGO</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.slice(0, 10).map((d) => (
                    <tr key={d._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium">{d.foodType}</td>
                      <td className="py-4 px-4 text-gray-600">{d.donor?.name || "Unknown"}</td>
                      <td className="py-4 px-4 text-gray-600">{d.ngoAssigned?.name || "Not assigned"}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          d.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          d.status === "accepted" ? "bg-blue-100 text-blue-800" :
                          d.status === "delivered" ? "bg-green-100 text-green-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-sm">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>📡</span>
              Live Activity Feed
            </h2>

            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">🔔</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{activity.time}</p>
                    <p className="text-gray-800">{activity.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
