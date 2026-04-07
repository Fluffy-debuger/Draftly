import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useUser, UserButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Dialog,DialogClose,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle,DialogTrigger} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, LayoutDashboard, Database, Activity, Layers } from "lucide-react";
import ListNoteBooks from "./ListNoteBooks";

export default function Home() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/" replace />;

  const userID = user.id;

  const createNoteBook = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Notebook name is required");

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notebookId: name.trim(), userID }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create notebook");

      navigate("/dashboard", {
        state: {
          name: name.trim(),
          containerName: data.notebook_id,
          hostPort: data.port,
          userID
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <LayoutDashboard className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">Draftly</span>
        </div>
        <div className="flex items-center gap-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Welcome, {user.firstName || "Explorer"}
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Manage your multimodal notebook workspaces.
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md gap-2 px-6 h-11 transition-all">
                <Plus className="w-4 h-4" /> Create Notebook
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>New Notebook</DialogTitle>
                <DialogDescription>
                  Start a new project with Dockerized Python runtimes.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={createNoteBook} className="grid gap-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Notebook Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Neural-Net-Project"
                    className="focus-visible:ring-indigo-500"
                  />
                </div>
                {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button variant="outline" type="button">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={loading} className="bg-indigo-600">
                    {loading ? "Initializing..." : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Active Runtimes" 
            value="Dockerized" 
            icon={<Activity className="text-emerald-500" />} 
            subtitle="Secure Container Isolation"
          />
          <StatCard 
            title="Storage Engine" 
            value="Atomic" 
            icon={<Layers className="text-amber-500" />} 
            subtitle="Cell-Level Persistence"
          />
          <StatCard 
            title="API Status" 
            value="Healthy" 
            icon={<Database className="text-indigo-600" />} 
            subtitle="WebSocket Sync Active"
          />
        </div>

        <div className="pt-4">
          <ListNoteBooks userID={userID} />
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, subtitle }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between hover:border-indigo-100 transition-colors">
      <div>
        <p className="text-sm font-semibold text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>
      </div>
      <div className="bg-slate-50 p-3 rounded-xl">{icon}</div>
    </div>
  );
}