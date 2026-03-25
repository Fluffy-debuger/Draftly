import { Button } from "@/components/ui/button";
import { CirclePause, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ListNoteBooks({ userID }) {
  const nav = useNavigate();
  const [allNoteBooks, setNoteBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

const fetchAllNoteBooks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const req = await fetch("http://127.0.0.1:8000/api/listAllnotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID }),
      });
      if (!req.ok) {
        throw new Error(`HTTP error! Status: ${req.status}`);
      }
      const data = await req.json();
      setNoteBooks(data["allNotes"] || []);
      // console.log("All notes fetched:", data["allNotes"]);
       
    } catch (error) {
      console.error("Error fetching notes:", error);
      setError("Failed to load notebooks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userID) {
      fetchAllNoteBooks();
    }
  }, [userID]);

  const resumeNoteBook = async (notebook) => {
    console.log(`Resuming notebook: ${notebook}`);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notebookId: notebook, userID }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Notebook resumption failed");
      }
      console.log(
        `DATA FROM SERVER IS ${notebook} - ${data.notebook_id} PORT: ${data.port}`
      );
      nav("/dashboard", {
        state: {
          name: notebook,
          containerName: data.notebook_id,
          hostPort: data.port,
          userID
        },
      });
    } catch (error) {
      console.error("Unable to resume the notebook:", error);
      
    }
  };

  const deleteNoteBook = async (notebook) => {
    console.log(`Deleting notebook: ${notebook}`);
    setNoteBooks((prev) => prev.filter((nb) => nb !== notebook));
    try {
      const req = await fetch("http://127.0.0.1:8000/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID, notebookID: notebook }),
      });
      if (!req.ok) {
        const data = await req.json();
        throw new Error(data.message || "Deletion failed");
      }
      const data = await req.json();
      console.log("Deletion response:", data);
      fetchAllNoteBooks();
    } catch (error) {
      console.error("Error deleting notebook:", error);
      setError("Failed to delete notebook. Refreshing list...");
      fetchAllNoteBooks();
    }
  };

  if (isLoading) {
    return <div>Loading notebooks...</div>;
  }

  if (error) {
    return (
      <div>
        {error} <Button onClick={fetchAllNoteBooks}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3>All Notes</h3>
      {allNoteBooks.length === 0 ? (
        <p>No notebooks found.</p>
      ) : (
        allNoteBooks.map((notebook) => (
          <div
            className="flex flex-row items-center justify-between gap-3"
            key={notebook.name}
          >
            <div className="flex flex-row items-center justify-between gap-3"> 
              <div> {notebook.name} </div> |
              <div> {notebook.createdTime} </div> |
              <div> {notebook.innerContent.map((file,i)=>(<span key={file.name}>{file.lastEditedTime}</span>))}</div> 
            </div>
            <div className="flex flex-row items-center gap-3">
              <Button onClick={() => resumeNoteBook(notebook.name)}>
                <CirclePause className="mr-2" /> Resume{" "}
              </Button>
              <Button onClick={() => deleteNoteBook(notebook.name)}>
                <Trash className="mr-2" /> Delete
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ListNoteBooks;