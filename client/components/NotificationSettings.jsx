// client/components/NotificationSettings.jsx

"use client";
import { useState, useEffect } from "react";
import { Bell, Smartphone, Mail, MessageSquare, MessageCircle, Clock, Save, TestTube } from "lucide-react";

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState({
    push: true,
    sms: false,
    email: true,
    whatsapp: true,
    quietHours: null,
    "donation-accepted": true,
    "donation-delivered": true,
    "new-donation": true,
    "geofence-alert": true,
    "feedback-received": true,
    "verification-approved": true,
    "system-alert": true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/notifications/preferences", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          push: preferences.push,
          sms: preferences.sms,
          email: preferences.email,
          whatsapp: preferences.whatsapp,
          quietHours: preferences.quietHours,
          types: {
            "donation-accepted": preferences["donation-accepted"],
            "donation-delivered": preferences["donation-delivered"],
            "new-donation": preferences["new-donation"],
            "geofence-alert": preferences["geofence-alert"],
            "feedback-received": preferences["feedback-received"],
            "verification-approved": preferences["verification-approved"],
            "system-alert": preferences["system-alert"]
          }
        })
      });

      if (response.ok) {
        setMessage("Preferences saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        throw new Error("Failed to save preferences");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      setMessage("Error saving preferences. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/notifications/test", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: "general",
          channels: ["socket", "push", "sms", "email", "whatsapp"]
        })
      });

      if (response.ok) {
        setMessage("Test notification sent!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
      setMessage("Error sending test notification.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateQuietHours = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Bell className="w-6 h-6 text-orange-500" />
          Notification Settings
        </h2>
        <button
          onClick={sendTestNotification}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <TestTube className="w-4 h-4" />
          Test
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes("Error") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Delivery Channels */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Delivery Channels</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-600">Real-time notifications in your browser</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.push}
                  onChange={(e) => updatePreference("push", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-gray-600">Text messages for important updates</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.sms}
                  onChange={(e) => updatePreference("sms", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-600">Detailed updates and summaries</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.email}
                  onChange={(e) => updatePreference("email", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">WhatsApp Notifications</p>
                  <p className="text-sm text-gray-600">Rich messages for delivery updates</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.whatsapp}
                  onChange={(e) => updatePreference("whatsapp", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Quiet Hours
          </h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Set quiet hours to reduce non-critical notifications during specific times
            </p>
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input
                  type="time"
                  value={preferences.quietHours?.start || ""}
                  onChange={(e) => updateQuietHours("start", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="time"
                  value={preferences.quietHours?.end || ""}
                  onChange={(e) => updateQuietHours("end", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => updatePreference("quietHours", null)}
                className="mt-6 px-3 py-2 text-sm text-red-600 hover:text-red-800"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Notification Types</h3>
          <div className="space-y-3">
            {[
              { key: "donation-accepted", label: "Donation Accepted", desc: "When an NGO accepts your donation" },
              { key: "donation-delivered", label: "Donation Delivered", desc: "When your donation is successfully delivered" },
              { key: "new-donation", label: "New Donations", desc: "When new food donations are available nearby" },
              { key: "geofence-alert", label: "Location Updates", desc: "When pickup/delivery locations are reached" },
              { key: "feedback-received", label: "Feedback Received", desc: "When NGOs share feedback on your donations" },
              { key: "verification-approved", label: "Verification Updates", desc: "When your verification status changes" },
              { key: "system-alert", label: "System Alerts", desc: "Important system announcements and updates" }
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{label}</p>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences[key]}
                    onChange={(e) => updatePreference(key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={updatePreferences}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}