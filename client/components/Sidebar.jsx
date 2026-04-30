// client/components/Sidebar.jsx

"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Utensils,
  MapPin,
  CheckCircle,
  CreditCard,
  Package,
  Building,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function Sidebar({ role, impactMetrics }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const links = {
    donor: [
      { href: "/donor/dashboard", label: "Dashboard", Icon: LayoutDashboard },
      { href: "/donor/donate", label: "Donate Food", Icon: Utensils },
      { href: "/donor/tracking", label: "Track Donations", Icon: MapPin },
      { href: "/donor/verification", label: "Verification", Icon: CheckCircle },
      { href: "/donor/subscription", label: "Subscription Plans", Icon: CreditCard }
    ],
    ngo: [
      { href: "/ngo/dashboard", label: "Dashboard", Icon: LayoutDashboard },
      { href: "/ngo/requests", label: "Available Donations", Icon: Package },
      { href: "/ngo/subscription", label: "Subscription Plans", Icon: CreditCard }
    ],
    admin: [
      { href: "/admin/dashboard", label: "Dashboard", Icon: LayoutDashboard },
      { href: "/admin/verify-ngos", label: "Verify NGOs", Icon: Building },
      { href: "/admin/verify-donors", label: "Verify Donors", Icon: CheckCircle },
      { href: "/admin/users", label: "Manage Users", Icon: Users },
      { href: "/admin/donations", label: "All Donations", Icon: FileText }
    ]
  };

  const menuLinks = links[role] || [];

  return (
    <aside 
      className={`bg-white shadow-lg h-screen sticky top-0 border-r border-gray-200 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse Toggle */}
      <div className="flex justify-end p-4 border-b border-gray-100">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-orange-50 rounded-lg transition-colors text-gray-600 hover:text-orange-600"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Menu Links */}
      <div className="p-4 space-y-2">
        {menuLinks.map((link) => {
          const Icon = link.Icon;
          const isActive = pathname === link.href;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium group ${
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md scale-105"
                  : "text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:scale-105"
              }`}
              title={collapsed ? link.label : ''}
            >
              <Icon className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0 transition-transform group-hover:scale-110`} />
              {!collapsed && <span className="truncate">{link.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Impact Metrics Section - Only for donor and ngo roles */}
      {!collapsed && impactMetrics && (role === 'donor' || role === 'ngo') && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Your Impact</h3>
            
            {/* Meals Saved */}
            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg p-3 text-white shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🍽️</span>
                <span className="text-xs font-medium text-teal-100">Meals Saved</span>
              </div>
              <div className="text-2xl font-bold">
                {impactMetrics.totalMeals?.toLocaleString() || 0}
              </div>
            </div>

            {/* Waste Diverted */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg p-3 text-white shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">♻️</span>
                <span className="text-xs font-medium text-emerald-100">Waste Diverted</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">
                  {impactMetrics.totalWaste?.toLocaleString(undefined, { maximumFractionDigits: 1 }) || 0}
                </span>
                <span className="text-sm font-semibold">kg</span>
              </div>
              <div className="text-xs text-emerald-100 mt-1">
                {((impactMetrics.totalWaste || 0) * 0.342).toFixed(1)} kg CO₂ saved
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
