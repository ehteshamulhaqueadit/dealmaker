import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import Profile from "./pages/Profile"; // Updated import for Profile
import DealsPage from "./pages/DealsPage";
import DealmakerPanelPage from "./pages/DealmakerPanelPage";
import ResetPassword from "./pages/ResetPassword"; // Import ResetPassword page

export default function App() {
  const [authModal, setAuthModal] = useState({
    open: false,
    activeTab: "login",
  });

  const toggleAuthModal = (tab = "login") => {
    setAuthModal({
      open: !authModal.open,
      activeTab: tab,
    });
  };

  const closeModal = () => {
    setAuthModal({ ...authModal, open: false });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onAuthButtonClick={() => toggleAuthModal("login")} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<h1>Home Page</h1>} />
          <Route path="/api/auth/register/:key" element={<VerifyEmailPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/profile" element={<Profile />} />{" "}
          {/* Updated route for Profile */}
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/dealmaker-panel" element={<DealmakerPanelPage />} />
          <Route
            path="/api/auth/reset_password/:username/:token"
            element={<ResetPassword />}
          />
        </Routes>
      </main>
      <AnimatePresence>
        {authModal.open && (
          <div className="fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm"
              onClick={closeModal}
            />
            <div className="flex items-center justify-center min-h-screen p-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="relative w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white rounded-lg overflow-hidden">
                  <div className="relative">
                    <div className="flex">
                      <button
                        onClick={() =>
                          setAuthModal({ ...authModal, activeTab: "login" })
                        }
                        className={`flex-1 py-4 px-6 text-center font-medium text-sm uppercase tracking-wider transition-colors ${
                          authModal.activeTab === "login"
                            ? "text-indigo-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Login
                      </button>
                      <button
                        onClick={() =>
                          setAuthModal({
                            ...authModal,
                            activeTab: "register",
                          })
                        }
                        className={`flex-1 py-4 px-6 text-center font-medium text-sm uppercase tracking-wider transition-colors ${
                          authModal.activeTab === "register"
                            ? "text-indigo-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Register
                      </button>
                    </div>
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 bg-indigo-600"
                      initial={false}
                      animate={{
                        x: authModal.activeTab === "login" ? 0 : "100%",
                        width: "50%",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  </div>
                  <div className="p-6">
                    {authModal.activeTab === "login" ? (
                      <LoginForm onSuccess={closeModal} />
                    ) : (
                      <RegisterForm
                        onSuccess={() =>
                          setAuthModal({ ...authModal, activeTab: "login" })
                        }
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
