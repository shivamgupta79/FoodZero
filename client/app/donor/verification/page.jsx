// client/app/donor/verification/page.jsx

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function DonorVerification() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    govtIdType: "",
    govtIdNumber: "",
    govtIdFrontUrl: "",
    govtIdBackUrl: "",
    fssaiNumber: "",
    fssaiCertificateUrl: ""
  });

  const [previews, setPreviews] = useState({
    govtIdFront: null,
    govtIdBack: null,
    fssaiCertificate: null
  });

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

    // Load existing data if available
    if (parsedUser.donorDetails) {
      setFormData({
        govtIdType: parsedUser.donorDetails.govtIdType || "",
        govtIdNumber: parsedUser.donorDetails.govtIdNumber || "",
        govtIdFrontUrl: parsedUser.donorDetails.govtIdFrontUrl || "",
        govtIdBackUrl: parsedUser.donorDetails.govtIdBackUrl || "",
        fssaiNumber: parsedUser.donorDetails.fssaiNumber || "",
        fssaiCertificateUrl: parsedUser.donorDetails.fssaiCertificateUrl || ""
      });
    }
  }, [router]);

  const requiresFSSAI = () => {
    return ["restaurant", "hotel", "store"].includes(user?.donorDetails?.donorType);
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setError("Only JPEG, PNG, and PDF files are allowed");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      
      // Update form data
      if (field === "govtIdFront") {
        setFormData({ ...formData, govtIdFrontUrl: base64String });
        setPreviews({ ...previews, govtIdFront: base64String });
      } else if (field === "govtIdBack") {
        setFormData({ ...formData, govtIdBackUrl: base64String });
        setPreviews({ ...previews, govtIdBack: base64String });
      } else if (field === "fssaiCertificate") {
        setFormData({ ...formData, fssaiCertificateUrl: base64String });
        setPreviews({ ...previews, fssaiCertificate: base64String });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validation
      if (!formData.govtIdType || !formData.govtIdNumber || !formData.govtIdFrontUrl) {
        setError("Please provide government ID type, number, and front image");
        setLoading(false);
        return;
      }

      if (requiresFSSAI() && (!formData.fssaiNumber || !formData.fssaiCertificateUrl)) {
        setError("FSSAI certificate is required for businesses");
        setLoading(false);
        return;
      }

      const { data } = await axios.post("/donor/upload-documents", formData);

      // Update local storage
      const updatedUser = { ...user, donorDetails: data.donorDetails };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSuccess(data.message);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/donor/dashboard");
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload documents");
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

  // Check if basic verification is complete
  if (!user.donorDetails?.phoneVerified || !user.donorDetails?.emailVerified || !user.donorDetails?.locationVerified) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar role="donor" />
          <main className="flex-1 p-8">
            <div className="max-w-2xl mx-auto">
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Complete Basic Verification First
                </h2>
                <p className="text-gray-600 mb-6">
                  You need to complete Level 1 (Basic) verification before uploading documents.
                </p>
                <button
                  onClick={() => router.push("/donor/dashboard")}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </main>
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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-4xl">📄</span>
                Document Verification - Level 2 (Enhanced)
              </h1>
              <p className="text-gray-600">Upload your documents for enhanced verification</p>
            </div>

            {/* Donor Type Info */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">
                  {user.donorDetails.donorType === "household" && "🏠"}
                  {user.donorDetails.donorType === "restaurant" && "🍽️"}
                  {user.donorDetails.donorType === "store" && "🏪"}
                  {user.donorDetails.donorType === "hotel" && "🏨"}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {user.donorDetails.donorType.charAt(0).toUpperCase() + user.donorDetails.donorType.slice(1)} Donor
                  </h3>
                  <p className="text-gray-600">
                    {requiresFSSAI() 
                      ? "Business verification requires Government ID + FSSAI Certificate"
                      : "Individual verification requires Government ID only"
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            {user.donorDetails.verificationStatus === "pending_admin" && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">⏳</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Verification Pending</h3>
                    <p className="text-gray-600">
                      Your documents have been submitted and are under admin review.
                    </p>
                    {user.donorDetails.aiRiskScore > 0 && (
                      <p className="text-sm text-yellow-700 mt-2">
                        AI Risk Score: {user.donorDetails.aiRiskScore}/100
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {user.donorDetails.verificationStatus === "verified" && (
              <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">✅</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Verified Donor</h3>
                    <p className="text-gray-600">
                      Congratulations! You are now a Level 2 (Enhanced) verified donor.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
                <span>✅</span>
                <span>{success}</span>
              </div>
            )}

            {/* Document Upload Form */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Government ID Section */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span>🆔</span>
                    Government ID Verification
                  </h3>

                  <div className="space-y-6">
                    {/* ID Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Type *
                      </label>
                      <select
                        value={formData.govtIdType}
                        onChange={(e) => setFormData({ ...formData, govtIdType: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        required
                        disabled={user.donorDetails.verificationStatus === "pending_admin" || user.donorDetails.verificationStatus === "verified"}
                      >
                        <option value="">Select ID Type</option>
                        <option value="aadhaar">🇮🇳 Aadhaar Card</option>
                        <option value="pan">💳 PAN Card</option>
                        <option value="driving_license">🚗 Driving License</option>
                        <option value="passport">✈️ Passport</option>
                        <option value="voter_id">🗳️ Voter ID</option>
                      </select>
                    </div>

                    {/* ID Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Number *
                      </label>
                      <input
                        type="text"
                        value={formData.govtIdNumber}
                        onChange={(e) => setFormData({ ...formData, govtIdNumber: e.target.value })}
                        placeholder="Enter your ID number"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={user.donorDetails.verificationStatus === "pending_admin" || user.donorDetails.verificationStatus === "verified"}
                      />
                    </div>

                    {/* ID Front Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Front Image *
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                        {previews.govtIdFront ? (
                          <div className="space-y-3">
                            {previews.govtIdFront.startsWith("data:application/pdf") ? (
                              <div className="text-6xl">📄</div>
                            ) : (
                              <img src={previews.govtIdFront} alt="ID Front" className="max-h-48 mx-auto rounded" />
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, govtIdFrontUrl: "" });
                                setPreviews({ ...previews, govtIdFront: null });
                              }}
                              className="text-red-600 hover:text-red-700 font-medium"
                              disabled={user.donorDetails.verificationStatus === "pending_admin" || user.donorDetails.verificationStatus === "verified"}
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="text-5xl mb-3">📸</div>
                            <p className="text-gray-600 mb-2">Click to upload ID front image</p>
                            <p className="text-sm text-gray-500">JPEG, PNG, or PDF (Max 5MB)</p>
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,application/pdf"
                              onChange={(e) => handleFileChange(e, "govtIdFront")}
                              className="hidden"
                              id="govtIdFront"
                              disabled={user.donorDetails.verificationStatus === "pending_admin" || user.donorDetails.verificationStatus === "verified"}
                            />
                            <label
                              htmlFor="govtIdFront"
                              className="inline-block mt-3 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 cursor-pointer"
                            >
                              Choose File
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ID Back Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Back Image (Optional)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                        {previews.govtIdBack ? (
                          <div className="space-y-3">
                            {previews.govtIdBack.startsWith("data:application/pdf") ? (
                              <div className="text-6xl">📄</div>
                            ) : (
                              <img src={previews.govtIdBack} alt="ID Back" className="max-h-48 mx-auto rounded" />
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, govtIdBackUrl: "" });
                                setPreviews({ ...previews, govtIdBack: null });
                              }}
                              className="text-red-600 hover:text-red-700 font-medium"
                              disabled={user.donorDetails.verificationStatus === "pending_admin" || user.donorDetails.verificationStatus === "verified"}
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="text-5xl mb-3">📸</div>
                            <p className="text-gray-600 mb-2">Click to upload ID back image</p>
                            <p className="text-sm text-gray-500">JPEG, PNG, or PDF (Max 5MB)</p>
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,application/pdf"
                              onChange={(e) => handleFileChange(e, "govtIdBack")}
                              className="hidden"
                              id="govtIdBack"
                              disabled={user.donorDetails.verificationStatus === "pending_admin" || user.donorDetails.verificationStatus === "verified"}
                            />
                            <label
                              htmlFor="govtIdBack"
                              className="inline-block mt-3 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 cursor-pointer"
                            >
                              Choose File
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* FSSAI Section (for businesses only) */}
                {requiresFSSAI() && (
                  <div className="border-t-2 border-gray-200 pt-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <span>🏢</span>
                      FSSAI Certificate (Business Verification)
                    </h3>

                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-6">
                      <p className="text-sm text-yellow-800">
                        <span className="font-semibold">⚠️ Required for Businesses:</span> As a {user.donorDetails.donorType}, you must provide a valid FSSAI certificate to verify your business.
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* FSSAI Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          FSSAI License Number *
                        </label>
                        <input
                          type="text"
                          value={formData.fssaiNumber}
                          onChange={(e) => setFormData({ ...formData, fssaiNumber: e.target.value })}
                          placeholder="Enter 14-digit FSSAI number"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required={requiresFSSAI()}
                          disabled={user.donorDetails.verificationStatus === "pending_admin" || user.donorDetails.verificationStatus === "verified"}
                        />
                      </div>

                      {/* FSSAI Certificate */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          FSSAI Certificate *
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                          {previews.fssaiCertificate ? (
                            <div className="space-y-3">
                              {previews.fssaiCertificate.startsWith("data:application/pdf") ? (
                                <div className="text-6xl">📄</div>
                              ) : (
                                <img src={previews.fssaiCertificate} alt="FSSAI Certificate" className="max-h-48 mx-auto rounded" />
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, fssaiCertificateUrl: "" });
                                  setPreviews({ ...previews, fssaiCertificate: null });
                                }}
                                className="text-red-600 hover:text-red-700 font-medium"
                                disabled={user.donorDetails.verificationStatus === "pending_admin" || user.donorDetails.verificationStatus === "verified"}
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div>
                              <div className="text-5xl mb-3">📄</div>
                              <p className="text-gray-600 mb-2">Click to upload FSSAI certificate</p>
                              <p className="text-sm text-gray-500">JPEG, PNG, or PDF (Max 5MB)</p>
                              <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,application/pdf"
                                onChange={(e) => handleFileChange(e, "fssaiCertificate")}
                                className="hidden"
                                id="fssaiCertificate"
                                disabled={user.donorDetails.verificationStatus === "pending_admin" || user.donorDetails.verificationStatus === "verified"}
                              />
                              <label
                                htmlFor="fssaiCertificate"
                                className="inline-block mt-3 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 cursor-pointer"
                              >
                                Choose File
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">🔒</span>
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">Security & Privacy</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Your documents are encrypted and stored securely</li>
                        <li>• AI-powered risk detection checks for authenticity</li>
                        <li>• Admin review ensures verification quality</li>
                        <li>• Documents are only used for verification purposes</li>
                        <li>• You can update documents anytime before approval</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                {user.donorDetails.verificationStatus !== "pending_admin" && user.donorDetails.verificationStatus !== "verified" && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin">🔄</span>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <span>✓</span>
                        <span>Submit for Verification</span>
                      </>
                    )}
                  </button>
                )}

                {(user.donorDetails.verificationStatus === "pending_admin" || user.donorDetails.verificationStatus === "verified") && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => router.push("/donor/dashboard")}
                      className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition font-semibold"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
