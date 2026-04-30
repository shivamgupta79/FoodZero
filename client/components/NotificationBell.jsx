// client/components/NotificationBell.jsx

"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Bell, Package, Heart, AlertCircle, X, Trash2 } from "lucide-react";

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1); // Distance in km
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");
    
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default location (Delhi)
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
    }

    // Join user-specific room and role-based room
    if (user._id && user.role) {
      socket.emit("join", {
        userId: user._id,
        role: user.role
      });
    }

    // For NGOs: Listen for new donations
    if (user.role === "ngo") {
      socket.on("donation-available", (data) => {
        const distance = userLocation && data.donation?.location
          ? calculateDistance(
              userLocation.lat,
              userLocation.lng,
              data.donation.location.lat,
              data.donation.location.lng
            )
          : "N/A";

        setNotifications((prev) => [
          {
            message: `${data.message} - ${distance} km away`,
            type: "donation",
            time: new Date(),
            data: data.donation
          },
          ...prev
        ]);

        // Play notification sound
        if (typeof Audio !== "undefined") {
          const audio = new Audio("/notification.mp3");
          audio.play().catch(() => {});
        }
      });
    }

    // For Donors: Listen for NGO requests
    if (user.role === "donor") {
      socket.on("ngo-needs-food", (data) => {
        const distance = userLocation && data.request?.location
          ? calculateDistance(
              userLocation.lat,
              userLocation.lng,
              data.request.location.lat,
              data.request.location.lng
            )
          : "N/A";

        setNotifications((prev) => [
          {
            message: `${data.message} - ${distance} km away`,
            type: "request",
            time: new Date(),
            data: data.request
          },
          ...prev
        ]);
      });
    }

    // For Donors: Listen for donation updates
    if (user.role === "donor") {
      socket.on("donation-update", (data) => {
        setNotifications((prev) => [
          {
            message: data.message,
            type: "update",
            time: new Date(),
            data: data.donation
          },
          ...prev
        ]);
      });
    }

    // General notifications
    socket.on("notification", (data) => {
      setNotifications((prev) => [
        {
          message: typeof data === "string" ? data : data.message,
          type: data.type || "info",
          time: new Date()
        },
        ...prev
      ]);
    });

    return () => socket.disconnect();
  }, [userLocation]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "donation": return Package;
      case "request": return Heart;
      case "update": return Package;
      default: return AlertCircle;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "donation": return "bg-green-50 border-green-200 text-green-800";
      case "request": return "bg-blue-50 border-blue-200 text-blue-800";
      case "update": return "bg-purple-50 border-purple-200 text-purple-800";
      default: return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-110"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse shadow-lg">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl z-50 max-h-[32rem] overflow-hidden border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  Notifications
                </h3>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1 hover:scale-105 transition-transform"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[28rem]">
              {notifications.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No new notifications</p>
                  <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {notifications.map((notif, idx) => {
                    const Icon = getNotificationIcon(notif.type);
                    return (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-lg border-2 ${getNotificationColor(notif.type)} hover:shadow-md transition-all duration-200 hover:scale-[1.02] animate-in slide-in-from-right duration-300`}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium break-words">{notif.message}</p>
                            <p className="text-xs opacity-75 mt-1">
                              {notif.time.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
