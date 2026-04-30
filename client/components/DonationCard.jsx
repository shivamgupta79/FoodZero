// client/components/DonationCard.jsx

"use client";
import { User, Clock, Thermometer, MapPin, ArrowRight } from "lucide-react";
import { getFoodIcon, getStatusIcon, getStatusColors } from "@/lib/iconMaps";

export default function DonationCard({ donation, onAccept }) {
  if (!donation) {
    return (
      <div className="bg-gray-100 p-6 rounded-xl shadow-md">
        <p className="text-gray-500 text-center">No donation data available</p>
      </div>
    );
  }

  const FoodIcon = getFoodIcon(donation.foodType);
  const StatusIcon = getStatusIcon(donation.status);
  const statusColors = getStatusColors(donation.status);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-gray-100 group">
      {/* Header with Food Icon and Status */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
            <FoodIcon className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{donation.foodType || 'Food Item'}</h3>
            <p className="text-gray-600 text-sm">Quantity: {donation.quantity || 'N/A'}</p>
          </div>
        </div>
        
        {/* Animated Status Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusColors.bg} ${statusColors.text} animate-in fade-in duration-300`}>
          <StatusIcon className="w-4 h-4" />
          <span className="capitalize">{donation.status || 'pending'}</span>
        </div>
      </div>

      {/* Details with Icons */}
      <div className="space-y-3 text-sm text-gray-600 mb-4">
        {donation.donor && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span>Donor: <span className="font-medium text-gray-700">{donation.donor.name}</span></span>
          </div>
        )}
        
        {donation.expiryTime && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>Expires: <span className="font-medium text-gray-700">{new Date(donation.expiryTime).toLocaleString()}</span></span>
          </div>
        )}
        
        {donation.temperature && (
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-gray-400" />
            <span>Temperature: <span className="font-medium text-gray-700">{donation.temperature}°C</span></span>
          </div>
        )}
        
        {donation.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>Location: <span className="font-medium text-gray-700">{donation.location.lat.toFixed(4)}, {donation.location.lng.toFixed(4)}</span></span>
          </div>
        )}
      </div>

      {/* Accept Button */}
      {onAccept && donation.status === "pending" && (
        <button
          onClick={() => onAccept(donation._id)}
          className="mt-4 w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 group/btn shadow-md hover:shadow-lg"
        >
          <span>Accept Donation</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );
}
