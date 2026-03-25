import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import {Dialog,DialogClose,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle,DialogTrigger} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import ListNoteBooks from "./ListNoteBooks";

export default function Home() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  const userID = user.id;
  console.log(userID);
  
  const createNoteBook = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Notebook name is required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            notebookId: name.trim(),
            userID:userID
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create notebook");
      }

      navigate("/dashboard", {
        state: {
          name: name.trim(),
          containerName: data.notebook_id,
          hostPort: data.port,
          userID:userID
        },
      });

      setName("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Welcome,{" "}
            {user.firstName || user.emailAddresses[0].emailAddress}
          </h1>
          <p className="text-sm text-gray-500">
            Manage your notebooks
          </p>
        </div>

        <SignOutButton redirectUrl="/">
          <Button variant="destructive">Sign Out</Button>
        </SignOutButton>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Create Notebook</Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Notebook</DialogTitle>
            <DialogDescription>
              Create a new graphical notebook workspace.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={createNoteBook} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Notebook Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Notebook"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <div className="mt-6">
        <ListNoteBooks
          userID={userID}
          onAction={createNoteBook}
        />
      </div>
    </div>
  );
}
