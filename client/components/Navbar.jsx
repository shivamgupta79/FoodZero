// client/components/Navbar.jsx

"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import NotificationCenter from "./NotificationCenter";
import FoodZeroLogo from "./FoodZeroLogo";

export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-green-500 to-green-600 shadow-lg backdrop-blur-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/?home=true" 
            className="text-white hover:scale-105 transition-transform duration-200"
          >
            <FoodZeroLogo size="md" showText={true} className="text-white" />
          </Link>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <NotificationCenter />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <NotificationCenter />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20 animate-in slide-in-from-top duration-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
