// client/app/admin/users/page.jsx

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Users, UserCheck, Building, Shield, TrendingUp, AlertCircle } from "lucide-react";

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
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

    fetchUsers();
  }, [router]);

  useEffect(() => {
    filterUsers();
  }, [users, activeFilter, searchTerm]);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get("/admin/users");
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to load users. Please try again.");
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (activeFilter !== "all") {
      filtered = filtered.filter(u => u.role === activeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(u =>
        (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredUsers(filtered);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    setSearchTerm(""); // Clear search when changing filter
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) return;

    try {
      await axios.delete(`/admin/users/${userId}`);
      alert("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "donor": return "bg-green-100 text-green-800";
      case "ngo": return "bg-blue-100 text-blue-800";
      case "admin": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "donor": return "🤲";
      case "ngo": return "🏥";
      case "admin": return "👨‍💼";
      default: return "👤";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">🔄</div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: users.length,
    donors: users.filter(u => u.role === "donor").length,
    ngos: users.filter(u => u.role === "ngo").length,
    admins: users.filter(u => u.role === "admin").length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar role="admin" />
        
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Users className="w-8 h-8 text-green-600" />
              User Management
            </h1>
            <p className="text-gray-600">Manage all platform users and monitor activity</p>
          </div>

          {/* Clickable Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <button
              onClick={() => handleFilterClick("all")}
              className={`bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200 text-left cursor-pointer ${
                activeFilter === "all" ? "ring-4 ring-blue-300 scale-105" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Users className="w-8 h-8" />
                </div>
                <TrendingUp className="w-6 h-6 opacity-80" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.total}</div>
              <div className="text-blue-100 text-sm font-medium">Total Users</div>
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs text-blue-100 flex items-center justify-between">
                  <span>Click to view all</span>
                  {activeFilter === "all" && <span>✓ Active</span>}
                </div>
              </div>
            </button>

            {/* Donors */}
            <button
              onClick={() => handleFilterClick("donor")}
              className={`bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200 text-left cursor-pointer ${
                activeFilter === "donor" ? "ring-4 ring-green-300 scale-105" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <UserCheck className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{((stats.donors / stats.total) * 100).toFixed(0)}%</div>
                  <div className="text-xs text-green-100">of total</div>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats.donors}</div>
              <div className="text-green-100 text-sm font-medium">Donors</div>
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs text-green-100 flex items-center justify-between">
                  <span>Click to view donors</span>
                  {activeFilter === "donor" && <span>✓ Active</span>}
                </div>
              </div>
            </button>

            {/* NGOs */}
            <button
              onClick={() => handleFilterClick("ngo")}
              className={`bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200 text-left cursor-pointer ${
                activeFilter === "ngo" ? "ring-4 ring-purple-300 scale-105" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Building className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{((stats.ngos / stats.total) * 100).toFixed(0)}%</div>
                  <div className="text-xs text-purple-100">of total</div>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats.ngos}</div>
              <div className="text-purple-100 text-sm font-medium">NGOs</div>
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs text-purple-100 flex items-center justify-between">
                  <span>Click to view NGOs</span>
                  {activeFilter === "ngo" && <span>✓ Active</span>}
                </div>
              </div>
            </button>

            {/* Admins */}
            <button
              onClick={() => handleFilterClick("admin")}
              className={`bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200 text-left cursor-pointer ${
                activeFilter === "admin" ? "ring-4 ring-orange-300 scale-105" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Shield className="w-8 h-8" />
                </div>
                <AlertCircle className="w-6 h-6 opacity-80" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.admins}</div>
              <div className="text-orange-100 text-sm font-medium">Administrators</div>
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs text-orange-100 flex items-center justify-between">
                  <span>Click to view admins</span>
                  {activeFilter === "admin" && <span>✓ Active</span>}
                </div>
              </div>
            </button>
          </div>

          {/* Info Banner */}
          {activeFilter === "all" && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6 mb-8 shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    All {stats.total} Platform Users
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Complete list of all users registered on the FoodZero platform across all roles.
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-green-700">
                      <UserCheck className="w-4 h-4" />
                      <span>{stats.donors} Donors</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-700">
                      <Building className="w-4 h-4" />
                      <span>{stats.ngos} NGOs</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-700">
                      <Shield className="w-4 h-4" />
                      <span>{stats.admins} Admins</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeFilter === "donor" && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-6 mb-8 shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <UserCheck className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {stats.donors} Donor{stats.donors !== 1 ? 's' : ''} Registered
                  </h3>
                  <p className="text-gray-700">
                    These users are registered as donors on the FoodZero platform. They can donate surplus food to help reduce waste and feed those in need.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeFilter === "ngo" && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-lg p-6 mb-8 shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Building className="w-8 h-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {stats.ngos} NGO{stats.ngos !== 1 ? 's' : ''} Registered
                  </h3>
                  <p className="text-gray-700">
                    These organizations are registered as NGOs on the FoodZero platform. They can accept food donations and distribute them to communities in need.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeFilter === "admin" && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-lg p-6 mb-8 shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {stats.admins} Administrator{stats.admins !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-gray-700">
                    Platform administrators with full access to manage users, verify accounts, and oversee all FoodZero operations.
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
                  Search Users
                </label>
                <input
                  type="text"
                  placeholder="Search by name or email..."
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

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Table Header with Filter Info */}
            <div className="bg-gray-50 border-b-2 border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {activeFilter === "all" && <Users className="w-6 h-6 text-blue-600" />}
                  {activeFilter === "donor" && <UserCheck className="w-6 h-6 text-green-600" />}
                  {activeFilter === "ngo" && <Building className="w-6 h-6 text-purple-600" />}
                  {activeFilter === "admin" && <Shield className="w-6 h-6 text-orange-600" />}
                  
                  {activeFilter === "all" && `All Users (${filteredUsers.length})`}
                  {activeFilter === "donor" && `Donors (${filteredUsers.length})`}
                  {activeFilter === "ngo" && `NGOs (${filteredUsers.length})`}
                  {activeFilter === "admin" && `Administrators (${filteredUsers.length})`}
                </h2>
                <div className="text-sm text-gray-600">
                  {searchTerm ? `Filtered by search: "${searchTerm}"` : "Showing all users in this category"}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">User</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Role</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Joined</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-gray-600">No users found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{user.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{user.email}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)} flex items-center gap-1 w-fit`}>
                            <span>{getRoleIcon(user.role)}</span>
                            <span>{user.role}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600 text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDeleteUser(user._id, user.name)}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
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
              Showing <span className="font-bold">{filteredUsers.length}</span> of <span className="font-bold">{users.length}</span> users
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
