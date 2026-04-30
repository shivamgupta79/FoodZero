// client/app/admin/verify-donors/page.jsx

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { CheckCircle, XCircle, Clock, Users, TrendingUp, AlertCircle, UserCheck } from "lucide-react";

export default function VerifyDonors() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [allDonors, setAllDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [activeFilter, setActiveFilter] = useState("pending");
  const [stats, setStats] = useState({
    totalDonors: 0,
    verifiedDonors: 0,
    pendingDonors: 0,
    rejectedDonors: 0
  });
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [notes, setNotes] = useState("");

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

    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      // Fetch all users to get all donors
      const { data: allUsers } = await axios.get("/admin/users");
      const donors = allUsers.filter(user => user.role === "donor");
      setAllDonors(donors);
      
      const verifiedCount = donors.filter(donor => 
        donor.donorDetails?.verificationStatus === "verified" || 
        donor.donorDetails?.adminApprovalStatus === "approved"
      ).length;
      
      const pendingCount = donors.filter(donor => 
        donor.donorDetails?.verificationStatus === "pending_admin" &&
        donor.donorDetails?.adminApprovalStatus === "pending"
      ).length;
      
      const rejectedCount = donors.filter(donor => 
        donor.donorDetails?.adminApprovalStatus === "rejected"
      ).length;

      setStats({
        totalDonors: donors.length,
        verifiedDonors: verifiedCount,
        pendingDonors: pendingCount,
        rejectedDonors: rejectedCount
      });

      // Set initial filter to pending
      filterDonors("pending", donors);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load donor data. Please try again.");
      setLoading(false);
    }
  };

  const filterDonors = (filter, donorList = allDonors) => {
    setActiveFilter(filter);
    let filtered = [];

    switch(filter) {
      case "all":
        filtered = donorList;
        break;
      case "verified":
        filtered = donorList.filter(donor => 
          donor.donorDetails?.verificationStatus === "verified" || 
          donor.donorDetails?.adminApprovalStatus === "approved"
        );
        break;
      case "pending":
        filtered = donorList.filter(donor => 
          donor.donorDetails?.verificationStatus === "pending_admin" &&
          donor.donorDetails?.adminApprovalStatus === "pending"
        );
        break;
      case "rejected":
        filtered = donorList.filter(donor => 
          donor.donorDetails?.adminApprovalStatus === "rejected"
        );
        break;
      default:
        filtered = donorList;
    }

    setFilteredDonors(filtered);
  };

  const handleApprove = async (donorId) => {
    if (!confirm("Are you sure you want to approve this donor?")) return;

    setActionLoading(true);
    try {
      await axios.post("/donor/admin-approve", {
        donorId,
        approved: true,
        notes
      });

      alert("Donor approved successfully!");
      setSelectedDonor(null);
      setNotes("");
      fetchData();
    } catch (error) {
      console.error("Error approving donor:", error);
      alert(error.response?.data?.message || "Failed to approve donor");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (donorId) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    if (!confirm("Are you sure you want to reject this donor?")) return;

    setActionLoading(true);
    try {
      await axios.post("/donor/admin-approve", {
        donorId,
        approved: false,
        rejectionReason,
        notes
      });

      alert("Donor verification rejected");
      setSelectedDonor(null);
      setRejectionReason("");
      setNotes("");
      fetchData();
    } catch (error) {
      console.error("Error rejecting donor:", error);
      alert(error.response?.data?.message || "Failed to reject donor");
    } finally {
      setActionLoading(false);
    }
  };

  const getDonorTypeIcon = (type) => {
    switch (type) {
      case "household": return "🏠";
      case "restaurant": return "🍽️";
      case "store": return "🏪";
      case "hotel": return "🏨";
      default: return "👤";
    }
  };

  const getIdTypeLabel = (type) => {
    switch (type) {
      case "aadhaar": return "Aadhaar Card";
      case "pan": return "PAN Card";
      case "driving_license": return "Driving License";
      case "passport": return "Passport";
      case "voter_id": return "Voter ID";
      default: return type;
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

  const verificationRate = stats.totalDonors > 0 
    ? ((stats.verifiedDonors / stats.totalDonors) * 100).toFixed(1) 
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
              <UserCheck className="w-8 h-8 text-green-600" />
              Donor Verification Center
            </h1>
            <p className="text-gray-600">Review and verify donor document submissions to ensure platform integrity</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Donors */}
            <button
              onClick={() => filterDonors("all")}
              className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200 text-left cursor-pointer ${
                activeFilter === "all" ? "ring-4 ring-blue-300 scale-105" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Users className="w-8 h-8" />
                </div>
                <TrendingUp className="w-6 h-6 opacity-80" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.totalDonors}</div>
              <div className="text-blue-100 text-sm font-medium">Total Donors Registered</div>
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs text-blue-100 flex items-center justify-between">
                  <span>Click to view all</span>
                  {activeFilter === "all" && <span>✓ Active</span>}
                </div>
              </div>
            </button>

            {/* Verified Donors */}
            <button
              onClick={() => filterDonors("verified")}
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
              <div className="text-3xl font-bold mb-1">{stats.verifiedDonors}</div>
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
              onClick={() => filterDonors("pending")}
              className={`bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200 text-left cursor-pointer ${
                activeFilter === "pending" ? "ring-4 ring-yellow-300 scale-105 animate-pulse" : "animate-pulse"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Clock className="w-8 h-8" />
                </div>
                {stats.pendingDonors > 0 && (
                  <div className="bg-white/30 px-3 py-1 rounded-full">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold mb-1">{stats.pendingDonors}</div>
              <div className="text-yellow-100 text-sm font-medium">Pending Review</div>
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs text-yellow-100 flex items-center justify-between">
                  <span>{stats.pendingDonors > 0 ? "Click to review" : "All caught up!"}</span>
                  {activeFilter === "pending" && <span>✓ Active</span>}
                </div>
              </div>
            </button>

            {/* Rejected Donors */}
            <button
              onClick={() => filterDonors("rejected")}
              className={`bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200 text-left cursor-pointer ${
                activeFilter === "rejected" ? "ring-4 ring-red-300 scale-105" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <XCircle className="w-8 h-8" />
                </div>
                <UserCheck className="w-6 h-6 opacity-80" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.rejectedDonors}</div>
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
          {activeFilter === "pending" && stats.pendingDonors > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg p-6 mb-8 shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {stats.pendingDonors} Donor{stats.pendingDonors > 1 ? 's' : ''} Awaiting Verification
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Please review the pending document submissions below. Verify legitimate donors to help them start making donations on the FoodZero platform.
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
                    {stats.verifiedDonors} Verified Donor{stats.verifiedDonors !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-gray-700">
                    These donors have been verified and are actively making donations on the FoodZero platform. They can help reduce food waste and feed those in need.
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
                    {stats.rejectedDonors} Rejected Application{stats.rejectedDonors !== 1 ? 's' : ''}
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
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    All {stats.totalDonors} Registered Donors
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Complete list of all donors registered on the FoodZero platform, including verified, pending, and rejected applications.
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span>{stats.verifiedDonors} Verified</span>
                    </div>
                    <div className="flex items-center gap-2 text-yellow-700">
                      <Clock className="w-4 h-4" />
                      <span>{stats.pendingDonors} Pending</span>
                    </div>
                    <div className="flex items-center gap-2 text-red-700">
                      <XCircle className="w-4 h-4" />
                      <span>{stats.rejectedDonors} Rejected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Donors List */}
          {filteredDonors.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">
                {activeFilter === "pending" && "✅"}
                {activeFilter === "verified" && "🎉"}
                {activeFilter === "rejected" && "📋"}
                {activeFilter === "all" && "👥"}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {activeFilter === "pending" && "All Caught Up!"}
                {activeFilter === "verified" && "No Verified Donors Yet"}
                {activeFilter === "rejected" && "No Rejected Applications"}
                {activeFilter === "all" && "No Donors Registered"}
              </h2>
              <p className="text-gray-600 mb-4">
                {activeFilter === "pending" && "No pending donor verifications at the moment"}
                {activeFilter === "verified" && "No donors have been verified yet"}
                {activeFilter === "rejected" && "No applications have been rejected"}
                {activeFilter === "all" && "No donors have registered on the platform yet"}
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
                  {activeFilter === "all" && <Users className="w-6 h-6 text-blue-600" />}
                  {activeFilter === "verified" && <CheckCircle className="w-6 h-6 text-green-600" />}
                  {activeFilter === "pending" && <Clock className="w-6 h-6 text-yellow-600" />}
                  {activeFilter === "rejected" && <XCircle className="w-6 h-6 text-red-600" />}
                  
                  {activeFilter === "all" && `All Donors (${filteredDonors.length})`}
                  {activeFilter === "verified" && `Verified Donors (${filteredDonors.length})`}
                  {activeFilter === "pending" && `Pending Applications (${filteredDonors.length})`}
                  {activeFilter === "rejected" && `Rejected Applications (${filteredDonors.length})`}
                </h2>
                <div className="text-sm text-gray-600">
                  {activeFilter === "pending" && "Review each application carefully"}
                  {activeFilter === "verified" && "Active and making donations"}
                  {activeFilter === "rejected" && "Applications that didn't meet criteria"}
                  {activeFilter === "all" && "All registered donors on platform"}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredDonors.map((donor) => {
                  const status = donor.donorDetails?.adminApprovalStatus === "approved" || 
                                 donor.donorDetails?.verificationStatus === "verified" 
                                 ? "verified" 
                                 : donor.donorDetails?.adminApprovalStatus === "rejected" 
                                 ? "rejected" 
                                 : "pending";
                  
                  const statusColors = {
                    verified: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
                    pending: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
                    rejected: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" }
                  };
                  const colors = statusColors[status] || statusColors.pending;

                  return (
                <div key={donor._id} className={`bg-white rounded-xl shadow-lg p-6 border-2 ${colors.border} hover:shadow-xl transition-shadow duration-200`}>
                  {/* Donor Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{getDonorTypeIcon(donor.donorDetails?.donorType)}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{donor.name}</h3>
                        <p className="text-sm text-gray-600">{donor.email}</p>
                        <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {donor.donorDetails?.donorType}
                        </span>
                      </div>
                    </div>
                    <span className={`${colors.bg} ${colors.text} px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 capitalize`}>
                      {status === "verified" && <CheckCircle className="w-4 h-4" />}
                      {status === "pending" && <Clock className="w-4 h-4" />}
                      {status === "rejected" && <XCircle className="w-4 h-4" />}
                      {status}
                    </span>
                  </div>

                  {/* Donor Info */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">📱 Phone:</span>
                      <span className="text-gray-600">{donor.donorDetails?.phoneNumber}</span>
                      {donor.donorDetails?.phoneVerified && <span className="text-green-600">✓</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">📧 Email:</span>
                      <span className="text-gray-600">{donor.email}</span>
                      {donor.donorDetails?.emailVerified && <span className="text-green-600">✓</span>}
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-gray-700">🏠 Address:</span>
                      <span className="text-gray-600">{donor.donorDetails?.address}</span>
                    </div>
                  </div>

                  {/* AI Risk Score */}
                  {donor.donorDetails?.aiRiskScore > 0 && (
                    <div className={`p-3 rounded-lg mb-4 ${
                      donor.donorDetails.aiRiskScore > 50 
                        ? "bg-red-50 border-2 border-red-300" 
                        : "bg-yellow-50 border-2 border-yellow-300"
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">🤖</span>
                        <span className="font-semibold text-gray-800">AI Risk Score: {donor.donorDetails.aiRiskScore}/100</span>
                      </div>
                      {donor.donorDetails.aiRiskFlags?.length > 0 && (
                        <div className="text-sm text-gray-700">
                          Flags: {donor.donorDetails.aiRiskFlags.join(", ")}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Document Info */}
                  {donor.donorDetails?.verificationSubmittedAt && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">📄 Documents Submitted</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700">ID Type:</span>
                          <span className="font-medium">{getIdTypeLabel(donor.donorDetails?.govtIdType)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700">ID Number:</span>
                          <span className="font-medium">{donor.donorDetails?.govtIdNumber}</span>
                        </div>
                        {donor.donorDetails?.fssaiNumber && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700">FSSAI:</span>
                            <span className="font-medium">{donor.donorDetails.fssaiNumber}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                          Submitted: {new Date(donor.donorDetails?.verificationSubmittedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rejection Reason Display */}
                  {status === "rejected" && donor.donorDetails?.adminRejectionReason && (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
                      <p className="text-xs text-red-600 mb-1">Rejection Reason</p>
                      <p className="font-semibold text-red-800">{donor.donorDetails.adminRejectionReason}</p>
                    </div>
                  )}

                  {/* Action Button - Only show for pending */}
                  {status === "pending" ? (
                    <button
                      onClick={() => setSelectedDonor(donor)}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      Review Documents
                    </button>
                  ) : status === "verified" ? (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                      <p className="text-green-800 font-semibold flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        This donor is verified and active on FoodZero
                      </p>
                    </div>
                  ) : (
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

          {/* Document Review Modal */}
          {selectedDonor && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Review Documents - {selectedDonor.name}
                    </h2>
                    <button
                      onClick={() => {
                        setSelectedDonor(null);
                        setRejectionReason("");
                        setNotes("");
                      }}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Donor Info Summary */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">Donor Type:</span>
                        <span className="ml-2">{selectedDonor.donorDetails?.donorType}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Phone:</span>
                        <span className="ml-2">{selectedDonor.donorDetails?.phoneNumber}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Email:</span>
                        <span className="ml-2">{selectedDonor.email}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">AI Risk:</span>
                        <span className="ml-2">{selectedDonor.donorDetails?.aiRiskScore || 0}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Government ID Documents */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">🆔 Government ID</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Front Image */}
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Front Image</h4>
                        <div className="border-2 border-gray-200 rounded-lg p-2">
                          {selectedDonor.donorDetails?.govtIdFrontUrl ? (
                            selectedDonor.donorDetails.govtIdFrontUrl.startsWith("data:application/pdf") ? (
                              <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
                                <div className="text-center">
                                  <div className="text-6xl mb-2">📄</div>
                                  <p className="text-gray-600">PDF Document</p>
                                  <a
                                    href={selectedDonor.donorDetails.govtIdFrontUrl}
                                    download="id-front.pdf"
                                    className="text-blue-600 hover:underline text-sm"
                                  >
                                    Download PDF
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={selectedDonor.donorDetails.govtIdFrontUrl}
                                alt="ID Front"
                                className="w-full h-64 object-contain rounded"
                              />
                            )
                          ) : (
                            <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
                              <p className="text-gray-500">No image</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Back Image */}
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Back Image (Optional)</h4>
                        <div className="border-2 border-gray-200 rounded-lg p-2">
                          {selectedDonor.donorDetails?.govtIdBackUrl ? (
                            selectedDonor.donorDetails.govtIdBackUrl.startsWith("data:application/pdf") ? (
                              <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
                                <div className="text-center">
                                  <div className="text-6xl mb-2">📄</div>
                                  <p className="text-gray-600">PDF Document</p>
                                  <a
                                    href={selectedDonor.donorDetails.govtIdBackUrl}
                                    download="id-back.pdf"
                                    className="text-blue-600 hover:underline text-sm"
                                  >
                                    Download PDF
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={selectedDonor.donorDetails.govtIdBackUrl}
                                alt="ID Back"
                                className="w-full h-64 object-contain rounded"
                              />
                            )
                          ) : (
                            <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
                              <p className="text-gray-500">Not provided</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">ID Type:</span>
                          <span className="ml-2">{getIdTypeLabel(selectedDonor.donorDetails?.govtIdType)}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">ID Number:</span>
                          <span className="ml-2">{selectedDonor.donorDetails?.govtIdNumber}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FSSAI Certificate (if applicable) */}
                  {selectedDonor.donorDetails?.fssaiNumber && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">🏢 FSSAI Certificate</h3>
                      <div className="border-2 border-gray-200 rounded-lg p-2 mb-4">
                        {selectedDonor.donorDetails?.fssaiCertificateUrl ? (
                          selectedDonor.donorDetails.fssaiCertificateUrl.startsWith("data:application/pdf") ? (
                            <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
                              <div className="text-center">
                                <div className="text-6xl mb-2">📄</div>
                                <p className="text-gray-600">PDF Document</p>
                                <a
                                  href={selectedDonor.donorDetails.fssaiCertificateUrl}
                                  download="fssai-certificate.pdf"
                                  className="text-blue-600 hover:underline text-sm"
                                >
                                  Download PDF
                                </a>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={selectedDonor.donorDetails.fssaiCertificateUrl}
                              alt="FSSAI Certificate"
                              className="w-full h-64 object-contain rounded"
                            />
                          )
                        ) : (
                          <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
                            <p className="text-gray-500">No certificate</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">FSSAI Number:</span>
                          <span className="ml-2">{selectedDonor.donorDetails.fssaiNumber}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Admin Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes about this verification..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                  </div>

                  {/* Rejection Reason */}
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Rejection Reason (Required if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide reason for rejection..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows="3"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleApprove(selectedDonor._id)}
                      disabled={actionLoading}
                      className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? "Processing..." : "✓ Approve Donor"}
                    </button>
                    <button
                      onClick={() => handleReject(selectedDonor._id)}
                      disabled={actionLoading}
                      className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? "Processing..." : "✕ Reject"}
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
