import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CpuIcon, LayoutDashboard, Database, Activity, Share2, Terminal , BookText, BookDashed } from "lucide-react";
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

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col items-center overflow-x-hidden">
      <div className="relative w-full max-w-7xl px-6 pt-20  text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto w-fit mb-6 bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200"
        >
          <LayoutDashboard className="text-white w-8 h-8" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6"
        >
          Draftly <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Notebook</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          The multimodal workspace where code meets design. Run isolated Python kernels, 
          draw system architectures, and visualize neural networks in one unified flow.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            onClick={() => openSignIn()}
            size="lg"
            className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-lg rounded-full shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1"
          >
            <CpuIcon className="mr-2 w-5 h-5" /> Get Started
          </Button>
          <Button variant="ghost" size="lg" className="text-slate-600 h-14 px-8 rounded-full">
             <BookText className="mr-2 w-5 h-5" /> View Documentation
          </Button>
        </motion.div>
      </div>

      <div className="max-w-7xl px-6 w-full py-15 grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureItem 
          icon={<Terminal className="text-indigo-600" />}
          title="Isolated Runtimes"
          desc="Every cell runs in a secure Docker container, keeping your host system protected."
        />
        <FeatureItem 
          icon={<Activity className="text-emerald-500" />}
          title="Live Visualization"
          desc="Instantly 'draw' your code logic into interactive React Flow diagrams."
        />
        <FeatureItem 
          icon={<Database className="text-amber-500" />}
          title="Atomic Storage"
          desc="Cell-level persistence ensures you never lose work, even if the connection drops."
        />
      </div>

      <footer className="mt-auto py-10 w-full border-t border-slate-100 text-center">
        <div className="text-slate-400 text-sm font-medium flex items-center justify-center gap-2">
           <BookDashed className="w-4 h-4" /> Draftly NoteBook • © {new Date().getFullYear()}
        </div>
      </footer>
    
      <div className="absolute top-0 left-0 w-full h-full -z-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100 blur-[120px]" />
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all"
    >
      <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
    </motion.div>
  );
}

export default LandingPage;