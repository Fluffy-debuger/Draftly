import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CpuIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";

function LandingPage() {
  const { user, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && user) {
      navigate("/home", { state: { userID: user.id } });
    }
  }, [isLoaded, user, navigate]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex flex-col items-center justify-center p-6">
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl font-bold mb-4 text-purple-800">Draftly Notebook</h1>
        <p className="text-gray-600 text-lg max-w-xl mx-auto">
          Create, visualize, and execute code with ease. A modern interactive notebook
          platform for developers, analysts, and students.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-center text-xl text-gray-800">
              Welcome to Draftly
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {user ? (
              <p className="text-center text-gray-600">Redirecting...</p>
            ) : (
              <Button
                onClick={() => openSignIn()}
                variant="default"
                className="flex items-center justify-center gap-2 w-full"
              >
                <CpuIcon size={18} />
                Get Started
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="mt-10 text-sm text-gray-500">
        © {new Date().getFullYear()} Draftly Notebook. All rights reserved.
      </div>
    </div>
  );
}

export default LandingPage;