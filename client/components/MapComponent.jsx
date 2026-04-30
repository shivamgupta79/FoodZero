// client/components/MapComponent.jsx

"use client";
import { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { MapPin, Truck, Building, ExternalLink, Loader2 } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "400px"
};

export default function MapComponent({ center, markers = [], markerType = "default" }) {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const defaultCenter = center || { lat: 28.6139, lng: 77.2090 }; // Delhi
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    // Check if API key is valid (not placeholder)
    if (apiKey && apiKey !== "your_google_maps_api_key_here" && apiKey.length > 20) {
      setHasApiKey(true);
    }
  }, [apiKey]);

  // Get icon based on marker type
  const getMarkerIcon = (type) => {
    switch (type) {
      case "donor": return Truck;
      case "ngo": return Building;
      default: return MapPin;
    }
  };

  const MarkerIcon = getMarkerIcon(markerType);

  // Fallback UI when no API key or error
  if (!hasApiKey || loadError) {
    return (
      <div 
        className="w-full h-full bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 rounded-xl border-2 border-orange-200 flex flex-col items-center justify-center p-6 shadow-lg animate-in fade-in duration-500"
        style={containerStyle}
      >
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <MapPin className="w-10 h-10 text-orange-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Map View</h3>
          <div className="bg-white rounded-lg p-4 shadow-md mb-4 border border-gray-200">
            <p className="text-sm text-gray-700 mb-3 font-semibold flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              Location Details
            </p>
            <div className="space-y-1 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">Latitude:</span> {defaultCenter.lat.toFixed(6)}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Longitude:</span> {defaultCenter.lng.toFixed(6)}
              </p>
            </div>
          </div>
          
          {markers.length > 0 && (
            <div className="bg-white rounded-lg p-4 shadow-md mb-4 border border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-center gap-2">
                <MarkerIcon className="w-4 h-4 text-green-600" />
                Markers ({markers.length})
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {markers.map((marker, idx) => (
                  <div key={idx} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <p className="font-medium">{marker.title || `Location ${idx + 1}`}</p>
                    <p className="text-xs text-gray-500">
                      {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <a
            href={`https://www.google.com/maps?q=${defaultCenter.lat},${defaultCenter.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg hover:scale-105"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open in Google Maps</span>
          </a>
          
          {!hasApiKey && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800 flex items-center gap-2">
                <span>💡</span>
                <span>To enable interactive maps, add a Google Maps API key to your .env.local file</span>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
      <LoadScript 
        googleMapsApiKey={apiKey}
        onError={() => setLoadError(true)}
        loadingElement={
          <div 
            className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center"
            style={containerStyle}
          >
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Loading map...</p>
              <p className="text-gray-500 text-sm mt-1">Please wait</p>
            </div>
          </div>
        }
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={12}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          }}
        >
          {markers.map((marker, idx) => (
            <Marker
              key={idx}
              position={{ lat: marker.lat, lng: marker.lng }}
              title={marker.title}
              animation={window.google?.maps?.Animation?.DROP}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
