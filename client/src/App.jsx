import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96">
            <p className="text-center mt-40 text-gray-500">main content area</p>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <AnimatePresence>
        {authModal.open && (
          <div className="fixed inset-0 z-50">
            {/* Background overlay with shadow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm"
              onClick={closeModal}
            />

            {/* Modal content - no shadow */}
            <div className="flex items-center justify-center min-h-screen p-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="relative w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white rounded-lg overflow-hidden">
                  {/* Tab Selector */}
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
                          setAuthModal({ ...authModal, activeTab: "register" })
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

                  {/* Form Content */}
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
