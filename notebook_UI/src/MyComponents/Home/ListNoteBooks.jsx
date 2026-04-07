import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Play, 
  Trash2, 
  Clock, 
  FileCode, 
  Search, 
  ArrowUpDown,
  Loader2 
} from "lucide-react";

export default function ListNoteBooks({ userID }) {
  const nav = useNavigate();
  const [allNoteBooks, setNoteBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");

  const fetchAllNoteBooks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const req = await fetch("http://127.0.0.1:8000/api/listAllnotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID }),
      });
      if (!req.ok) throw new Error(`Server error: ${req.status}`);
      const data = await req.json();
      setNoteBooks(data["allNotes"] || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load notebooks.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userID) fetchAllNoteBooks();
  }, [userID]);

  const resumeNoteBook = async (notebookName) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notebookId: notebookName, userID }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Resumption failed");

      nav("/dashboard", {
        state: {
          name: notebookName,
          containerName: data.notebook_id,
          hostPort: data.port,
          userID
        },
      });
    } catch (err) {
      console.error("Resume error:", err);
    }
  };

  const deleteNoteBook = async (notebookName) => {
    setNoteBooks((prev) => prev.filter((nb) => nb.name !== notebookName));
    try {
      const req = await fetch("http://127.0.0.1:8000/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID, notebookID: notebookName }),
      });
      if (!req.ok) fetchAllNoteBooks(); 
    } catch (err) {
      console.error("Delete error:", err);
      fetchAllNoteBooks();
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 font-semibold"
        >
          Notebook Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-medium text-slate-700">
          <FileCode className="w-4 h-4 text-indigo-500" />
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "createdTime",
      header: "Created At",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Clock className="w-3.5 h-3.5" />
          {row.getValue("createdTime")}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => resumeNoteBook(row.original.name)}
            className="border-indigo-100 text-indigo-600 hover:bg-indigo-50"
          >
            <Play className="w-3.5 h-3.5 mr-1.5 fill-current" /> Resume
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => deleteNoteBook(row.original.name)}
            className="text-slate-400 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ], [userID]);

  const table = useReactTable({
    data: allNoteBooks,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center p-10 text-slate-400">
      <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading Workspace...
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search notebooks..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-10 bg-white border-slate-200 focus-visible:ring-indigo-500"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/50 border-b border-slate-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-4 text-left font-semibold text-slate-600">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center text-slate-400">
                  No notebooks found matching "{globalFilter}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}