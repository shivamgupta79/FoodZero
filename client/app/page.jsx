// client/app/page.jsx

"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Heart, Users, TrendingUp, ArrowRight, CheckCircle, Truck, Building,
  MapPin, Clock, Shield, Award, Leaf, Droplet, TreePine, Car,
  Phone, Mail, Globe, ChevronRight, Star, Target, Zap
} from "lucide-react";
import FoodZeroLogo from "@/components/FoodZeroLogo";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showHomePage, setShowHomePage] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(userData);
      
      // Check if user explicitly wants to see home page
      const urlParams = new URLSearchParams(window.location.search);
      const showHome = urlParams.get('home') === 'true';
      
      if (userData.role && !showHome) {
        // Auto-redirect to dashboard only if not explicitly requesting home page
        router.push(`/${userData.role}/dashboard`);
        return;
      } else {
        setShowHomePage(true);
      }
    } else {
      setShowHomePage(true);
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center animate-in fade-in duration-500">
          <div className="mb-6 animate-pulse">
            <FoodZeroLogo size="xl" showText={true} />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!showHomePage) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center animate-in fade-in slide-in-from-bottom duration-700">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white rounded-full shadow-xl animate-bounce">
                <FoodZeroLogo size="lg" showText={false} />
              </div>
            </div>
            
            {/* Problem Statement Badge */}
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full mb-6 animate-pulse">
              <Target className="w-4 h-4" />
              <span className="text-sm font-semibold">40% food wasted • 820M people hungry</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Share Food,
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Waste Zero
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 mb-4 max-w-3xl mx-auto">
              India's First <span className="font-bold text-green-600">Smart Food Donation Platform</span>
            </p>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect surplus food with hungry people using AI-powered matching, real-time tracking, and verified networks
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button
                onClick={() => router.push("/register")}
                className="group flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Heart className="w-5 h-5" />
                <span>I Want to Donate</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push("/register")}
                className="group flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Building className="w-5 h-5" />
                <span>I'm an NGO/Receiver</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/login")}
                className="text-green-600 hover:text-green-700 font-semibold underline"
              >
                Login here
              </button>
            </p>

            {/* Show dashboard link for authenticated users */}
            {user && user.role && (
              <div className="bg-white/80 backdrop-blur-sm border border-green-200 rounded-xl p-4 mb-4 animate-in fade-in duration-500">
                <p className="text-gray-700 mb-2">
                  Welcome back, <span className="font-semibold text-green-600">{user.name}</span>!
                </p>
                <button
                  onClick={() => router.push(`/${user.role}/dashboard`)}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm">Verified NGOs</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Zap className="w-5 h-5 text-orange-600" />
                <span className="text-sm">Real-time Tracking</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Award className="w-5 h-5 text-blue-600" />
                <span className="text-sm">Impact Analytics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 opacity-20 animate-pulse">
          <FoodZeroLogo size="lg" showText={false} />
        </div>
        <div className="absolute bottom-20 right-10 opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>
          <Heart className="w-32 h-32 text-green-400" />
        </div>
      </section>

      {/* Who Can Use Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
            Who Can Use FoodZero?
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Whether you have surplus food or serve communities in need, FoodZero connects you
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Donors Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Food Donors</h3>
              </div>
              <p className="text-gray-700 mb-6">
                Have surplus food? Share it with those who need it most
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "🏨 Restaurants & Hotels",
                  "🏪 Grocery Stores & Supermarkets",
                  "🎉 Event Organizers & Caterers",
                  "🏠 Households with Excess Food",
                  "🏢 Corporate Cafeterias",
                  "🍰 Bakeries & Food Businesses"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-700">
                    <ChevronRight className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => router.push("/register")}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Register as Donor
              </button>
            </div>

            {/* Receivers Card */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Food Receivers</h3>
              </div>
              <p className="text-gray-700 mb-6">
                Serve communities? Get verified and receive food donations
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "🏥 Registered NGOs & Charities",
                  "🏘️ Community Kitchens",
                  "🛏️ Homeless Shelters",
                  "🏫 Orphanages & Old Age Homes",
                  "🍲 Food Banks",
                  "👥 Verified Individual Volunteers"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-700">
                    <ChevronRight className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => router.push("/register")}
                className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors font-semibold"
              >
                Register as Receiver
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
            How FoodZero Works
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Our platform makes it easy to donate surplus food and help those in need
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom duration-500">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Truck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Donate Food</h3>
              <p className="text-gray-600">
                Donors can easily list surplus food with details like quantity, type, and pickup location
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom duration-500" style={{ animationDelay: '100ms' }}>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Building className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">NGO Pickup</h3>
              <p className="text-gray-600">
                Verified NGOs receive notifications and can accept donations in their service area
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom duration-500" style={{ animationDelay: '200ms' }}>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Heart className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Help People</h3>
              <p className="text-gray-600">
                Food reaches those who need it most, reducing waste and fighting hunger
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-teal-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Impact So Far</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-center mb-3">
                <Users className="w-12 h-12" />
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2">1,000+</div>
              <div className="text-lg md:text-xl opacity-90">Active Users</div>
            </div>
            <div className="animate-in fade-in duration-500" style={{ animationDelay: '100ms' }}>
              <div className="flex justify-center mb-3">
                <FoodZeroLogo size="md" showText={false} />
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50,000+</div>
              <div className="text-lg md:text-xl opacity-90">Meals Served</div>
            </div>
            <div className="animate-in fade-in duration-500" style={{ animationDelay: '200ms' }}>
              <div className="flex justify-center mb-3">
                <Building className="w-12 h-12" />
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2">200+</div>
              <div className="text-lg md:text-xl opacity-90">NGO Partners</div>
            </div>
            <div className="animate-in fade-in duration-500" style={{ animationDelay: '300ms' }}>
              <div className="flex justify-center mb-3">
                <TreePine className="w-12 h-12" />
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2">125 tons</div>
              <div className="text-lg md:text-xl opacity-90">CO₂ Saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* Environmental Impact Section */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
            Environmental Impact
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Every donation makes a difference for our planet
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TreePine className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">2,857 Trees</h3>
              <p className="text-gray-600">Equivalent CO₂ absorption per year</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Droplet className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">48M Liters</h3>
              <p className="text-gray-600">Water saved from food production</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">500,000 km</h3>
              <p className="text-gray-600">Car emissions prevented</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-in fade-in slide-in-from-left duration-700">
              <h2 className="text-4xl font-bold mb-6 text-gray-800">
                Why Choose FoodZero?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                India's most advanced food donation platform with cutting-edge technology
              </p>
              <div className="space-y-4">
                {[
                  { icon: Zap, text: "Smart AI-powered matching algorithm", color: "text-yellow-600" },
                  { icon: MapPin, text: "Real-time GPS tracking & notifications", color: "text-blue-600" },
                  { icon: Shield, text: "2-level verification for donors & NGOs", color: "text-green-600" },
                  { icon: Clock, text: "Urgency-based prioritization system", color: "text-orange-600" },
                  { icon: Award, text: "Comprehensive impact analytics", color: "text-purple-600" },
                  { icon: Star, text: "95% successful pickup rate", color: "text-pink-600" }
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="flex-shrink-0">
                      <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                    </div>
                    <span className="text-lg text-gray-700">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center animate-in fade-in slide-in-from-right duration-700">
              <div className="relative">
                <div className="w-64 h-64 bg-gradient-to-br from-green-400 to-teal-400 rounded-full opacity-20 absolute -top-8 -left-8 animate-pulse"></div>
                <div className="w-80 h-80 bg-white rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 opacity-50"></div>
                  <div className="relative z-10">
                    <FoodZeroLogo size="xl" showText={true} />
                    <div className="mt-6 text-center">
                      <div className="text-3xl font-bold text-green-600">100%</div>
                      <div className="text-gray-600">Transparent</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Rajesh Kumar",
                role: "Restaurant Owner, Mumbai",
                text: "FoodZero made it so easy to donate our surplus food. We've helped feed 500+ people in just 2 months!",
                rating: 5
              },
              {
                name: "Priya Sharma",
                role: "NGO Director, Delhi",
                text: "The real-time notifications and tracking feature is amazing. We can now serve more people efficiently.",
                rating: 5
              },
              {
                name: "Amit Patel",
                role: "Hotel Manager, Bangalore",
                text: "Great platform! The verification process ensures our food reaches genuine NGOs. Highly recommended!",
                rating: 5
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="border-t pt-4">
                  <div className="font-semibold text-gray-800">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-teal-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of donors and NGOs working together to fight hunger with FoodZero
          </p>
          <button
            onClick={() => router.push("/register")}
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-10 py-5 rounded-xl hover:from-green-600 hover:to-teal-600 transition-all duration-200 font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <span>Get Started Now</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FoodZeroLogo size="sm" showText={true} className="text-white" />
              </div>
              <p className="text-gray-400 text-sm">
                India's first smart food donation platform connecting surplus food with hungry people.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => router.push("/register")} className="hover:text-white transition-colors">Register</button></li>
                <li><button onClick={() => router.push("/login")} className="hover:text-white transition-colors">Login</button></li>
                <li><button onClick={() => router.push("/directory")} className="hover:text-white transition-colors">NGO Directory</button></li>
              </ul>
            </div>

            {/* For Donors */}
            <div>
              <h3 className="font-semibold mb-4">For Donors</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>How to Donate</li>
                <li>Verification Process</li>
                <li>Track Donations</li>
                <li>Impact Reports</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>support@foodzero.in</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+91 1800-FOOD-ZERO</span>
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>www.foodzero.in</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 FoodZero. All rights reserved. | Fighting hunger, reducing waste, saving the planet.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
