// client/app/admin/verify-ngos/page.jsx

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { CheckCircle, XCircle, Clock, Building, TrendingUp, AlertCircle, Users } from "lucide-react";

export default function VerifyNGOs() {
  const router = useRouter();
  const [allNGOs, setAllNGOs] = useState([]);
  const [filteredNGOs, setFilteredNGOs] = useState([]);
  const [activeFilter, setActiveFilter] = useState("pending");
  const [stats, setStats] = useState({
    totalNGOs: 0,
    verifiedNGOs: 0,
    pendingNGOs: 0,
    rejectedNGOs: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

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

    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      // Fetch all users to calculate stats
      const { data: allUsers } = await axios.get("/admin/users");
      const ngos = allUsers.filter(user => user.role === "ngo");
      setAllNGOs(ngos);
      
      const verifiedCount = ngos.filter(ngo => ngo.ngoDetails?.verificationStatus === "verified").length;
      const pendingCount = ngos.filter(ngo => ngo.ngoDetails?.verificationStatus === "pending").length;
      const rejectedCount = ngos.filter(ngo => ngo.ngoDetails?.verificationStatus === "rejected").length;

      setStats({
        totalNGOs: ngos.length,
        verifiedNGOs: verifiedCount,
        pendingNGOs: pendingCount,
        rejectedNGOs: rejectedCount
      });

      // Set initial filter to pending
      filterNGOs("pending", ngos);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load NGO data. Please try again.");
      setLoading(false);
    }
  };

  const filterNGOs = (filter, ngoList = allNGOs) => {
    setActiveFilter(filter);
    let filtered = [];

    switch(filter) {
      case "all":
        filtered = ngoList;
        break;
      case "verified":
        filtered = ngoList.filter(ngo => ngo.ngoDetails?.verificationStatus === "verified");
        break;
      case "pending":
        filtered = ngoList.filter(ngo => ngo.ngoDetails?.verificationStatus === "pending");
        break;
      case "rejected":
        filtered = ngoList.filter(ngo => ngo.ngoDetails?.verificationStatus === "rejected");
        break;
      default:
        filtered = ngoList;
    }

    setFilteredNGOs(filtered);
  };

  const handleVerify = async (ngoId, status) => {
    if (status === "rejected" && !rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    if (!confirm(`Are you sure you want to ${status === "verified" ? "approve" : "reject"} this NGO?`)) {
      return;
    }

    try {
      await axios.post("/admin/verify-ngo", {
        ngoId,
        status,
        rejectionReason: status === "rejected" ? rejectionReason : undefined
      });
      
      alert(`NGO ${status} successfully!`);
      setSelectedNGO(null);
      setRejectionReason("");
      fetchData();
    } catch (error) {
      console.error("Error verifying NGO:", error);
      alert(error.response?.data?.message || "Failed to verify NGO. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">🔄</div>
          <p className="text-gray-600">Loading verification data...</p>
        </div>
      </div>
    );
  }

  const verificationRate = stats.totalNGOs > 0 
    ? ((stats.verifiedNGOs / stats.totalNGOs) * 100).toFixed(1) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar role="admin" />
        
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Building className="w-8 h-8 text-green-600" />
              NGO Verification Center
            </h1>
            <p className="text-gray-600">Review and verify NGO registrations to ensure platform integrity</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total NGOs */}
            <button
              onClick={() => filterNGOs("all")}
              className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200 text-left cursor-pointer ${
                activeFilter === "all" ? "ring-4 ring-blue-300 scale-105" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Building className="w-8 h-8" />
                </div>
                <TrendingUp className="w-6 h-6 opacity-80" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.totalNGOs}</div>
              <div className="text-blue-100 text-sm font-medium">Total NGOs Registered</div>
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs text-blue-100 flex items-center justify-between">
                  <span>Click to view all</span>
                  {activeFilter === "all" && <span>✓ Active</span>}
                </div>
              </div>
            </button>

            {/* Verified NGOs */}
            <button
              onClick={() => filterNGOs("verified")}
              className={`bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200 text-left cursor-pointer ${
                activeFilter === "verified" ? "ring-4 ring-green-300 scale-105" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{verificationRate}%</div>
                  <div className="text-xs text-green-100">Rate</div>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats.verifiedNGOs}</div>
              <div className="text-green-100 text-sm font-medium">Verified & Active</div>
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs text-green-100 flex items-center justify-between">
                  <span>Click to view verified</span>
                  {activeFilter === "verified" && <span>✓ Active</span>}
                </div>
              </div>
            </button>

            {/* Pending Verifications */}
            <button
              onClick={() => filterNGOs("pending")}
              className={`bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200 text-left cursor-pointer ${
                activeFilter === "pending" ? "ring-4 ring-yellow-300 scale-105 animate-pulse" : "animate-pulse"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Clock className="w-8 h-8" />
                </div>
                {stats.pendingNGOs > 0 && (
                  <div className="bg-white/30 px-3 py-1 rounded-full">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold mb-1">{stats.pendingNGOs}</div>
              <div className="text-yellow-100 text-sm font-medium">Pending Review</div>
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs text-yellow-100 flex items-center justify-between">
                  <span>{stats.pendingNGOs > 0 ? "Click to review" : "All caught up!"}</span>
                  {activeFilter === "pending" && <span>✓ Active</span>}
                </div>
              </div>
            </button>

            {/* Rejected NGOs */}
            <button
              onClick={() => filterNGOs("rejected")}
              className={`bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200 text-left cursor-pointer ${
                activeFilter === "rejected" ? "ring-4 ring-red-300 scale-105" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <XCircle className="w-8 h-8" />
                </div>
                <Users className="w-6 h-6 opacity-80" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.rejectedNGOs}</div>
              <div className="text-red-100 text-sm font-medium">Rejected Applications</div>
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs text-red-100 flex items-center justify-between">
                  <span>Click to view rejected</span>
                  {activeFilter === "rejected" && <span>✓ Active</span>}
                </div>
              </div>
            </button>
          </div>

          {/* Info Banner */}
          {activeFilter === "pending" && stats.pendingNGOs > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg p-6 mb-8 shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {stats.pendingNGOs} NGO{stats.pendingNGOs > 1 ? 's' : ''} Awaiting Verification
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Please review the pending applications below. Verify legitimate NGOs to help them start accepting donations and making a difference in the community.
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve to activate</span>
                    </div>
                    <div className="flex items-center gap-2 text-red-700">
                      <XCircle className="w-4 h-4" />
                      <span>Reject with reason</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeFilter === "verified" && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-6 mb-8 shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {stats.verifiedNGOs} Verified NGO{stats.verifiedNGOs !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-gray-700">
                    These NGOs have been verified and are actively accepting donations on the FoodZero platform. They can help distribute food to those in need.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeFilter === "rejected" && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg p-6 mb-8 shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {stats.rejectedNGOs} Rejected Application{stats.rejectedNGOs !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-gray-700">
                    These applications did not meet the verification criteria. Each rejection includes a reason provided to the applicant.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeFilter === "all" && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6 mb-8 shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Building className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    All {stats.totalNGOs} Registered NGOs
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Complete list of all NGOs registered on the FoodZero platform, including verified, pending, and rejected applications.
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span>{stats.verifiedNGOs} Verified</span>
                    </div>
                    <div className="flex items-center gap-2 text-yellow-700">
                      <Clock className="w-4 h-4" />
                      <span>{stats.pendingNGOs} Pending</span>
                    </div>
                    <div className="flex items-center gap-2 text-red-700">
                      <XCircle className="w-4 h-4" />
                      <span>{stats.rejectedNGOs} Rejected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NGOs List */}
          {filteredNGOs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">
                {activeFilter === "pending" && "✅"}
                {activeFilter === "verified" && "🎉"}
                {activeFilter === "rejected" && "📋"}
                {activeFilter === "all" && "🏥"}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {activeFilter === "pending" && "All Caught Up!"}
                {activeFilter === "verified" && "No Verified NGOs Yet"}
                {activeFilter === "rejected" && "No Rejected Applications"}
                {activeFilter === "all" && "No NGOs Registered"}
              </h2>
              <p className="text-gray-600 mb-4">
                {activeFilter === "pending" && "No pending NGO verifications at the moment"}
                {activeFilter === "verified" && "No NGOs have been verified yet"}
                {activeFilter === "rejected" && "No applications have been rejected"}
                {activeFilter === "all" && "No NGOs have registered on the platform yet"}
              </p>
              {activeFilter === "pending" && (
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Great job keeping up with verifications!</span>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {activeFilter === "all" && <Building className="w-6 h-6 text-blue-600" />}
                  {activeFilter === "verified" && <CheckCircle className="w-6 h-6 text-green-600" />}
                  {activeFilter === "pending" && <Clock className="w-6 h-6 text-yellow-600" />}
                  {activeFilter === "rejected" && <XCircle className="w-6 h-6 text-red-600" />}
                  
                  {activeFilter === "all" && `All NGOs (${filteredNGOs.length})`}
                  {activeFilter === "verified" && `Verified NGOs (${filteredNGOs.length})`}
                  {activeFilter === "pending" && `Pending Applications (${filteredNGOs.length})`}
                  {activeFilter === "rejected" && `Rejected Applications (${filteredNGOs.length})`}
                </h2>
                <div className="text-sm text-gray-600">
                  {activeFilter === "pending" && "Review each application carefully"}
                  {activeFilter === "verified" && "Active and accepting donations"}
                  {activeFilter === "rejected" && "Applications that didn't meet criteria"}
                  {activeFilter === "all" && "All registered NGOs on platform"}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredNGOs.map((ngo) => {
                  const status = ngo.ngoDetails?.verificationStatus || "pending";
                  const statusColors = {
                    verified: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
                    pending: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
                    rejected: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" }
                  };
                  const colors = statusColors[status] || statusColors.pending;

                  return (
                    <div key={ngo._id} className={`bg-white rounded-xl shadow-lg p-6 border-2 ${colors.border} hover:shadow-xl transition-shadow duration-200`}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Building className="w-6 h-6 text-green-600" />
                            {ngo.name}
                          </h3>
                          <p className="text-gray-600">{ngo.email}</p>
                        </div>
                        <span className={`${colors.bg} ${colors.text} px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 capitalize`}>
                          {status === "verified" && <CheckCircle className="w-4 h-4" />}
                          {status === "pending" && <Clock className="w-4 h-4" />}
                          {status === "rejected" && <XCircle className="w-4 h-4" />}
                          {status}
                        </span>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Registration Number</p>
                            <p className="font-semibold text-gray-800">{ngo.ngoDetails?.registrationNumber}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Registration Type</p>
                            <p className="font-semibold text-gray-800">{ngo.ngoDetails?.registrationType}</p>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Registered Address</p>
                          <p className="font-semibold text-gray-800">{ngo.ngoDetails?.registeredAddress}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">City</p>
                            <p className="font-semibold text-gray-800">{ngo.ngoDetails?.city}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">State</p>
                            <p className="font-semibold text-gray-800">{ngo.ngoDetails?.state}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Contact Person</p>
                            <p className="font-semibold text-gray-800">{ngo.ngoDetails?.contactPerson}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Contact Phone</p>
                            <p className="font-semibold text-gray-800">{ngo.ngoDetails?.contactPhone}</p>
                          </div>
                        </div>

                        {ngo.ngoDetails?.gstNumber && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">GST Number</p>
                            <p className="font-semibold text-gray-800">{ngo.ngoDetails.gstNumber}</p>
                          </div>
                        )}

                        {ngo.ngoDetails?.panNumber && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">PAN Number</p>
                            <p className="font-semibold text-gray-800">{ngo.ngoDetails.panNumber}</p>
                          </div>
                        )}

                        {ngo.ngoDetails?.website && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Website</p>
                            <a 
                              href={ngo.ngoDetails.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-semibold text-blue-600 hover:underline flex items-center gap-1"
                            >
                              {ngo.ngoDetails.website}
                              <span className="text-xs">↗</span>
                            </a>
                          </div>
                        )}

                        {status === "rejected" && ngo.ngoDetails?.rejectionReason && (
                          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                            <p className="text-xs text-red-600 mb-1">Rejection Reason</p>
                            <p className="font-semibold text-red-800">{ngo.ngoDetails.rejectionReason}</p>
                          </div>
                        )}

                        <div className={`${status === "verified" ? "bg-green-50 border-green-200" : status === "rejected" ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"} p-3 rounded-lg border`}>
                          <p className={`text-xs ${status === "verified" ? "text-green-600" : status === "rejected" ? "text-red-600" : "text-blue-600"} mb-1`}>
                            {status === "verified" ? "Verified On" : status === "rejected" ? "Rejected On" : "Registered On"}
                          </p>
                          <p className={`font-semibold ${status === "verified" ? "text-green-800" : status === "rejected" ? "text-red-800" : "text-blue-800"}`}>
                            {new Date(status === "verified" || status === "rejected" ? ngo.ngoDetails?.verificationDate || ngo.createdAt : ngo.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons - Only show for pending */}
                      {status === "pending" && (
                        selectedNGO === ngo._id ? (
                          <div className="space-y-3 bg-red-50 p-4 rounded-lg border-2 border-red-200">
                            <label className="block text-sm font-semibold text-red-800 mb-2">
                              Rejection Reason (Required)
                            </label>
                            <textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Please provide a clear reason for rejection..."
                              className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              rows="3"
                            />
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleVerify(ngo._id, "rejected")}
                                className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                              >
                                <XCircle className="w-5 h-5" />
                                Confirm Rejection
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedNGO(null);
                                  setRejectionReason("");
                                }}
                                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleVerify(ngo._id, "verified")}
                              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                              <CheckCircle className="w-5 h-5" />
                              <span>Approve NGO</span>
                            </button>
                            <button
                              onClick={() => setSelectedNGO(ngo._id)}
                              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                              <XCircle className="w-5 h-5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        )
                      )}

                      {/* Status Info - Show for verified and rejected */}
                      {status === "verified" && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                          <p className="text-green-800 font-semibold flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            This NGO is verified and active on FoodZero
                          </p>
                        </div>
                      )}

                      {status === "rejected" && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
                          <p className="text-red-800 font-semibold flex items-center justify-center gap-2">
                            <XCircle className="w-5 h-5" />
                            This application was rejected
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
