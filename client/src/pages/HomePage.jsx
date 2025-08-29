import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const HomePage = ({ onAuthButtonClick }) => {
  const { isAuthenticated, loading } = useAuth();

  // Handler for authenticated navigation
  const handleAuthenticatedAction = (path) => {
    if (isAuthenticated) {
      window.location.href = path;
    } else {
      onAuthButtonClick?.();
    }
  };
  const features = [
    {
      title: "Create Deals",
      description:
        "Post your business deals and connect with potential partners",
      icon: "📋",
      step: "1",
    },
    {
      title: "Find Dealmakers",
      description:
        "Browse and request experienced dealmakers to facilitate your transactions",
      icon: "🤝",
      step: "2",
    },
    {
      title: "Real-time Communication",
      description:
        "Chat with deal participants and get instant updates on deal progress",
      icon: "💬",
      step: "3",
    },
    {
      title: "Secure Transactions",
      description:
        "Manage escrow, track payments, and ensure secure deal completion",
      icon: "🔒",
      step: "4",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Sign Up & Create Profile",
      description:
        "Register for an account and set up your profile with business information",
    },
    {
      step: "2",
      title: "Post or Browse Deals",
      description:
        "Create new deals or browse existing ones. Add details like budget, timeline, and requirements",
    },
    {
      step: "3",
      title: "Connect with Dealmakers",
      description:
        "Request experienced dealmakers to join your deal or respond to dealmaker requests",
    },
    {
      step: "4",
      title: "Communicate & Execute",
      description:
        "Use real-time messaging to coordinate, track progress, and complete your deals securely",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Welcome to <span className="text-indigo-600">Dealmaker</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            The ultimate platform for connecting dealers and facilitating secure
            business transactions with expert dealmakers
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {loading ? (
              <div className="flex gap-4">
                <div className="bg-gray-300 animate-pulse px-8 py-4 rounded-lg w-32 h-12"></div>
                <div className="bg-gray-300 animate-pulse px-8 py-4 rounded-lg w-40 h-12"></div>
              </div>
            ) : isAuthenticated ? (
              <>
                <Link
                  to="/deals"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                >
                  Browse Deals
                </Link>
                <Link
                  to="/dealmaker-panel"
                  className="bg-white hover:bg-gray-50 text-indigo-600 border-2 border-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                >
                  Become a Dealmaker
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleAuthenticatedAction("/deals")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                >
                  Browse Deals
                </button>
                <button
                  onClick={() => handleAuthenticatedAction("/dealmaker-panel")}
                  className="bg-white hover:bg-gray-50 text-indigo-600 border-2 border-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                >
                  Become a Dealmaker
                </button>
              </>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Dealmaker?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides everything you need for successful business
              deal facilitation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-lg hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started with Dealmaker in four simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full text-xl font-bold mb-4 mx-auto">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Connector Arrow (hidden on mobile and last item) */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <svg
                      className="w-8 h-8 text-indigo-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Start Making Deals?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of successful dealers and dealmakers who trust our
              platform for their business transactions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {loading ? (
                <div className="flex gap-4">
                  <div className="bg-white/20 animate-pulse px-8 py-4 rounded-lg w-40 h-12"></div>
                  <div className="bg-white/20 animate-pulse px-8 py-4 rounded-lg w-32 h-12"></div>
                </div>
              ) : isAuthenticated ? (
                <>
                  <Link
                    to="/deals"
                    className="bg-white hover:bg-gray-100 text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    View Your Deals
                  </Link>
                  <Link
                    to="/about"
                    className="border-2 border-white hover:bg-white hover:text-indigo-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Learn More
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onAuthButtonClick?.("register")}
                    className="bg-white hover:bg-gray-100 text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Get Started Today
                  </button>
                  <Link
                    to="/about"
                    className="border-2 border-white hover:bg-white hover:text-indigo-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Learn More
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* App Features Detail Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              App Features & Navigation
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about using the Dealmaker platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Main Navigation
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-indigo-600 pl-4">
                  <h4 className="font-semibold text-gray-900">🏠 Home</h4>
                  <p className="text-gray-600">
                    Overview and getting started guide
                  </p>
                </div>
                <div className="border-l-4 border-indigo-600 pl-4">
                  <h4 className="font-semibold text-gray-900">📋 Deals</h4>
                  <p className="text-gray-600">
                    Browse, create, and manage business deals
                  </p>
                </div>
                <div className="border-l-4 border-indigo-600 pl-4">
                  <h4 className="font-semibold text-gray-900">
                    🤝 Dealmaker Panel
                  </h4>
                  <p className="text-gray-600">
                    Manage dealmaker requests and active deals
                  </p>
                </div>
                <div className="border-l-4 border-indigo-600 pl-4">
                  <h4 className="font-semibold text-gray-900">💰 Deposit</h4>
                  <p className="text-gray-600">
                    Handle escrow and payment management
                  </p>
                </div>
                <div className="border-l-4 border-indigo-600 pl-4">
                  <h4 className="font-semibold text-gray-900">👥 Users</h4>
                  <p className="text-gray-600">
                    Browse user profiles and dealmaker ratings
                  </p>
                </div>
                <div className="border-l-4 border-indigo-600 pl-4">
                  <h4 className="font-semibold text-gray-900">👤 Profile</h4>
                  <p className="text-gray-600">
                    Manage your account and preferences
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Key Features
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    💬 Real-time Messaging
                  </h4>
                  <p className="text-gray-600">
                    Instant communication with all deal participants. Messages
                    update live without page refreshes.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    🔄 Live Updates
                  </h4>
                  <p className="text-gray-600">
                    See deal status changes, new bids, and user activities in
                    real-time across all connected users.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    🎯 Bid Management
                  </h4>
                  <p className="text-gray-600">
                    Place bids on deals, track competing offers, and get
                    notified when bids are selected.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    🛡️ Secure Escrow
                  </h4>
                  <p className="text-gray-600">
                    Built-in escrow system to ensure safe and secure transaction
                    completion.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    📊 Progress Tracking
                  </h4>
                  <p className="text-gray-600">
                    Monitor deal progress from initiation to completion with
                    detailed status updates.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
