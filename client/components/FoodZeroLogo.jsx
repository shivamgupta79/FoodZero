// client/components/FoodZeroLogo.jsx

"use client";
import { Utensils } from "lucide-react";

export default function FoodZeroLogo({ size = "md", showText = true, className = "" }) {
  const sizes = {
    sm: { icon: "w-6 h-6", text: "text-lg", container: "gap-2" },
    md: { icon: "w-8 h-8", text: "text-xl", container: "gap-2" },
    lg: { icon: "w-12 h-12", text: "text-2xl", container: "gap-3" },
    xl: { icon: "w-16 h-16", text: "text-3xl", container: "gap-4" }
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center ${currentSize.container} ${className}`}>
      {/* Logo Icon */}
      <div className={`${currentSize.icon} bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg`}>
        <Utensils className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-7 h-7' : size === 'xl' ? 'w-9 h-9' : 'w-5 h-5'} text-white`} />
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className={`font-bold ${currentSize.text}`}>
          <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
            Food
          </span>
          <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
            Zero
          </span>
        </div>
      )}
    </div>
  );
}