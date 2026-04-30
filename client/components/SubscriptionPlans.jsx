// client/components/SubscriptionPlans.jsx

"use client";
import { useState } from "react";
import { CheckCircle, X, Star, Sparkles, Building, Sprout, Rocket, Trophy, CreditCard, HelpCircle } from "lucide-react";

export default function SubscriptionPlans({ userRole, currentPlan = "free" }) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);

  // Donor Plans
  const donorPlans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      period: "forever",
      Icon: Sprout,
      color: "from-gray-400 to-gray-600",
      features: [
        "Up to 5 donations per month",
        "8 free food deliveries per month",
        "Basic tracking",
        "Email notifications",
        "Standard support"
      ],
      limitations: [
        "Limited donation history",
        "No priority pickup",
        "No analytics"
      ]
    },
    {
      id: "basic",
      name: "Basic",
      price: 299,
      period: "month",
      Icon: Star,
      color: "from-blue-400 to-blue-600",
      popular: false,
      features: [
        "Up to 20 donations per month",
        "8 free food deliveries per month",
        "Real-time tracking",
        "SMS + Email notifications",
        "Priority support",
        "Donation history (6 months)",
        "Impact analytics"
      ],
      limitations: []
    },
    {
      id: "premium",
      name: "Premium",
      price: 599,
      period: "month",
      Icon: Sparkles,
      color: "from-purple-400 to-purple-600",
      popular: true,
      features: [
        "Unlimited donations",
        "8 free food deliveries per month",
        "Advanced real-time tracking",
        "SMS + Email + WhatsApp notifications",
        "24/7 Priority support",
        "Lifetime donation history",
        "Advanced impact analytics",
        "Tax benefit certificates",
        "Scheduled donations",
        "Multiple pickup locations"
      ],
      limitations: []
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 1499,
      period: "month",
      Icon: Building,
      color: "from-orange-400 to-red-600",
      popular: false,
      features: [
        "Everything in Premium",
        "8 free food deliveries per month",
        "Dedicated account manager",
        "Custom integrations",
        "API access",
        "Bulk donation management",
        "Team collaboration (up to 10 users)",
        "Custom reporting",
        "White-label option",
        "CSR compliance reports"
      ],
      limitations: []
    }
  ];

  // NGO Plans
  const ngoPlans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      period: "forever",
      Icon: Sprout,
      color: "from-gray-400 to-gray-600",
      features: [
        "Accept up to 10 donations per month",
        "Basic tracking",
        "Email notifications",
        "Standard support",
        "Basic dashboard"
      ],
      limitations: [
        "Limited service area",
        "No priority alerts",
        "No analytics"
      ]
    },
    {
      id: "starter",
      name: "Starter",
      price: 499,
      period: "month",
      Icon: Sprout,
      color: "from-green-400 to-green-600",
      popular: false,
      features: [
        "Accept up to 50 donations per month",
        "Real-time tracking",
        "SMS + Email notifications",
        "Priority support",
        "Extended service area (10km radius)",
        "Basic analytics",
        "Volunteer management (up to 5)"
      ],
      limitations: []
    },
    {
      id: "professional",
      name: "Professional",
      price: 999,
      period: "month",
      Icon: Rocket,
      color: "from-blue-400 to-indigo-600",
      popular: true,
      features: [
        "Accept up to 200 donations per month",
        "Advanced real-time tracking",
        "SMS + Email + WhatsApp notifications",
        "24/7 Priority support",
        "Unlimited service area",
        "Advanced analytics & reports",
        "Volunteer management (up to 20)",
        "Route optimization",
        "Impact reports for donors",
        "Beneficiary management"
      ],
      limitations: []
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 2499,
      period: "month",
      Icon: Trophy,
      color: "from-purple-400 to-pink-600",
      popular: false,
      features: [
        "Unlimited donations",
        "Everything in Professional",
        "Dedicated account manager",
        "Custom integrations",
        "API access",
        "Multi-location management",
        "Team collaboration (unlimited)",
        "Custom branding",
        "Advanced reporting & BI",
        "Government compliance reports",
        "Fundraising tools"
      ],
      limitations: []
    }
  ];

  const plans = userRole === "donor" ? donorPlans : ngoPlans;

  const handleUpgrade = (plan) => {
    if (plan.id === "free") {
      alert("You're already on the free plan!");
      return;
    }
    setSelectedPlanForPayment(plan);
    setShowPaymentModal(true);
  };

  const handlePayment = () => {
    // Simulate payment processing
    alert(`Payment processing for ${selectedPlanForPayment.name} plan - ₹${selectedPlanForPayment.price}/${selectedPlanForPayment.period}\n\nThis is a demo. In production, integrate with payment gateway like Razorpay or Stripe.`);
    setShowPaymentModal(false);
    setSelectedPlan(selectedPlanForPayment.id);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8 animate-in fade-in duration-500">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <CreditCard className="w-8 h-8 text-orange-600" />
          Subscription Plans
        </h2>
        <p className="text-gray-600">
          Choose the perfect plan for your {userRole === "donor" ? "donation" : "organization"} needs
        </p>
      </div>

      {/* Current Plan Badge */}
      {currentPlan !== "free" && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-6 text-center animate-in slide-in-from-top duration-300">
          <p className="text-green-800 font-semibold flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            You're currently on the <span className="capitalize">{currentPlan}</span> plan
          </p>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, index) => {
          const Icon = plan.Icon;
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl shadow-lg border-2 ${
                plan.popular ? "border-yellow-400 scale-105" : "border-gray-200"
              } hover:shadow-2xl transition-all duration-300 hover:scale-105 ${
                selectedPlan === plan.id ? "ring-4 ring-blue-300" : ""
              } animate-in fade-in slide-in-from-bottom duration-500`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1 animate-pulse">
                    <Star className="w-4 h-4 fill-current" />
                    POPULAR
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className={`bg-gradient-to-br ${plan.color} text-white p-6 rounded-t-xl`}>
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <Icon className="w-10 h-10" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-center mb-2">{plan.name}</h3>
                <div className="text-center">
                  <span className="text-4xl font-bold">₹{plan.price}</span>
                  {plan.price > 0 && (
                    <span className="text-sm opacity-90">/{plan.period}</span>
                  )}
                </div>
              </div>

              {/* Plan Body */}
              <div className="p-6">
                {/* Features */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Features:
                  </p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      Limitations:
                    </p>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-500">
                          <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span>{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={selectedPlan === plan.id}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                    selectedPlan === plan.id
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : plan.popular
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-lg hover:shadow-xl hover:scale-105"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 hover:scale-105"
                  }`}
                >
                  {selectedPlan === plan.id ? "Current Plan" : plan.price === 0 ? "Current Plan" : "Upgrade Now"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlanForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Complete Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl hover:scale-110 transition-transform"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Plan Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Plan:</span>
                <span className="text-xl font-bold text-gray-800">{selectedPlanForPayment.name}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Amount:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{selectedPlanForPayment.price}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Billing:</span>
                <span className="text-gray-600 capitalize">{selectedPlanForPayment.period}ly</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-6">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">💡 Demo Mode:</span> This is a demonstration. In production, you would be redirected to a secure payment gateway (Razorpay, Stripe, etc.)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handlePayment}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition font-semibold hover:scale-105"
              >
                Proceed to Payment
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-6 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 animate-in slide-in-from-bottom duration-500">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-blue-600" />
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-gray-700 mb-1">Can I change my plan anytime?</p>
            <p className="text-sm text-gray-600">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">What payment methods do you accept?</p>
            <p className="text-sm text-gray-600">
              We accept all major credit/debit cards, UPI, net banking, and digital wallets through our secure payment gateway.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">Is there a refund policy?</p>
            <p className="text-sm text-gray-600">
              Yes, we offer a 7-day money-back guarantee if you're not satisfied with your subscription.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">Do you offer discounts for annual plans?</p>
            <p className="text-sm text-gray-600">
              Yes! Save 20% when you choose annual billing. Contact our support team for more details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


