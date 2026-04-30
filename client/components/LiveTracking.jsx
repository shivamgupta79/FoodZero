// client/components/LiveTracking.jsx

"use client";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { MapPin, Navigation, Clock, Truck, Package, CheckCircle, AlertCircle } from "lucide-react";

export default function LiveTracking({ donationId, userRole = "donor" }) {
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [eta, setEta] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const pathRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!donationId) return;

    // Initialize socket connection
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");
    socketRef.current = socket;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    // Join user room
    if (user._id) {
      socket.emit("join", { userId: user._id, role: user.role });
    }

    // Listen for GPS updates
    socket.on("gps-update", (data) => {
      if (data.donationId === donationId) {
        setTrackingData(prev => ({
          ...prev,
          currentLocation: data.location,
          speed: data.speed,
          isMoving: data.isMoving,
          lastUpdate: new Date(data.timestamp),
          geofenceStatus: data.geofenceStatus
        }));
        
        // Update map if available
        updateMapLocation(data.location);
        setIsLive(true);
      }
    });

    // Listen for geofence alerts
    socket.on("geofence-alert", (data) => {
      if (data.donationId === donationId) {
        setTrackingData(prev => ({
          ...prev,
          status: data.status,
          lastStatusUpdate: new Date(data.timestamp)
        }));
        
        // Show alert notification
        showGeofenceAlert(data.message, data.type);
      }
    });

    // Fetch initial tracking data
    fetchTrackingData();

    return () => {
      socket.disconnect();
    };
  }, [donationId]);

  const fetchTrackingData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch(`/api/gps/details/${donationId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tracking data");
      }

      const data = await response.json();
      setTrackingData(data);
      setIsLive(data.isActive);
      setEta(data.eta);

      // Initialize map if location available
      if (data.session?.currentLocation || data.donation?.location) {
        initializeMap(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeMap = (data) => {
    if (!window.google || !mapRef.current) return;

    const location = data.session?.currentLocation || data.donation?.location;
    if (!location) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: location.lat, lng: location.lng },
      zoom: 15,
      mapTypeId: "roadmap"
    });

    // Add current location marker
    markerRef.current = new window.google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: map,
      title: "Current Location",
      icon: {
        url: "/truck-icon.png",
        scaledSize: new window.google.maps.Size(40, 40)
      }
    });

    // Add pickup and delivery markers if available
    if (data.donation?.location) {
      new window.google.maps.Marker({
        position: data.donation.location,
        map: map,
        title: "Pickup Location",
        icon: {
          url: "/pickup-icon.png",
          scaledSize: new window.google.maps.Size(30, 30)
        }
      });
    }

    if (data.session?.geofenceZones) {
      data.session.geofenceZones.forEach(zone => {
        if (zone.type === "delivery") {
          new window.google.maps.Marker({
            position: zone.center,
            map: map,
            title: "Delivery Location",
            icon: {
              url: "/delivery-icon.png",
              scaledSize: new window.google.maps.Size(30, 30)
            }
          });
        }
      });
    }

    // Initialize path for route tracking
    pathRef.current = new window.google.maps.Polyline({
      path: [],
      geodesic: true,
      strokeColor: "#FF6B35",
      strokeOpacity: 1.0,
      strokeWeight: 3,
      map: map
    });
  };

  const updateMapLocation = (location) => {
    if (!markerRef.current || !pathRef.current) return;

    // Update marker position
    markerRef.current.setPosition({ lat: location.lat, lng: location.lng });

    // Add to path
    const path = pathRef.current.getPath();
    path.push(new window.google.maps.LatLng(location.lat, location.lng));
  };

  const showGeofenceAlert = (message, type) => {
    // Create toast notification
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
      type === "pickup" ? "bg-blue-500" : "bg-green-500"
    } text-white max-w-sm`;
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="w-6 h-6">
          ${type === "pickup" ? "📦" : "✅"}
        </div>
        <div>
          <div class="font-semibold">Location Alert</div>
          <div class="text-sm">${message}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 5000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted": return <Package className="w-5 h-5 text-blue-500" />;
      case "picked_up": return <Truck className="w-5 h-5 text-orange-500" />;
      case "in_transit": return <Navigation className="w-5 h-5 text-purple-500" />;
      case "delivered": return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "accepted": return "Accepted - Preparing for pickup";
      case "picked_up": return "Picked up - Starting journey";
      case "in_transit": return "In transit - On the way";
      case "delivered": return "Delivered successfully!";
      default: return "Status unknown";
    }
  };

  const formatTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-2" />
          <p>Error loading tracking data: {error}</p>
          <button 
            onClick={fetchTrackingData}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Live Tracking
          </h3>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm">{isLive ? 'Live' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(trackingData?.donation?.status)}
            <span className="font-medium">{getStatusText(trackingData?.donation?.status)}</span>
          </div>
          {trackingData?.session?.isMoving && (
            <div className="flex items-center gap-1 text-green-600">
              <Navigation className="w-4 h-4" />
              <span className="text-sm">Moving</span>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="h-64 bg-gray-200">
        <div ref={mapRef} className="w-full h-full"></div>
      </div>

      {/* Tracking Info */}
      <div className="p-4 space-y-4">
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Current Speed</label>
            <p className="font-semibold">
              {trackingData?.session?.averageSpeed ? 
                `${trackingData.session.averageSpeed.toFixed(1)} km/h` : 
                'N/A'
              }
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Last Update</label>
            <p className="font-semibold">
              {formatTime(trackingData?.session?.lastUpdate)}
            </p>
          </div>
        </div>

        {/* ETA */}
        {eta && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <Clock className="w-4 h-4" />
              <span className="font-semibold">Estimated Arrival</span>
            </div>
            <p className="text-blue-700 mt-1">
              {eta.etaFormatted} ({eta.distance} km remaining)
            </p>
          </div>
        )}

        {/* Distance Traveled */}
        {trackingData?.session?.totalDistance && (
          <div>
            <label className="text-sm text-gray-600">Distance Traveled</label>
            <p className="font-semibold">
              {trackingData.session.totalDistance.toFixed(2)} km
            </p>
          </div>
        )}

        {/* Geofence Status */}
        {trackingData?.session?.geofenceStatus && trackingData.session.geofenceStatus !== "outside" && (
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <MapPin className="w-4 h-4" />
              <span className="font-semibold">Location Status</span>
            </div>
            <p className="text-yellow-700 mt-1 capitalize">
              At {trackingData.session.geofenceStatus} location
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons for NGO */}
      {userRole === "ngo" && trackingData?.donation?.status === "accepted" && (
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={() => startGPSTracking()}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
          >
            Start GPS Tracking
          </button>
        </div>
      )}
    </div>
  );

  async function startGPSTracking() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/gps/start/${donationId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        setIsLive(true);
        // Start location updates if geolocation is available
        if (navigator.geolocation) {
          startLocationUpdates();
        }
      }
    } catch (error) {
      console.error("Error starting GPS tracking:", error);
    }
  }

  function startLocationUpdates() {
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const locationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || 0,
          heading: position.coords.heading || 0,
          timestamp: new Date().toISOString()
        };

        try {
          const token = localStorage.getItem("token");
          await fetch(`/api/gps/update/${donationId}?includeETA=true`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(locationData)
          });
        } catch (error) {
          console.error("Error updating GPS location:", error);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );

    // Store watch ID to clear later
    return watchId;
  }
}