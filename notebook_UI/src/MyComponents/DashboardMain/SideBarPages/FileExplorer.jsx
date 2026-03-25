import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function FileNode({ item, onPreview }) {
  return (
    <div className="pl-2">
      {item.type === "folder" ? (
        <details>
          <summary className="cursor-pointer font-medium">{item.name}</summary>
          {item.children.map((child, index) => (
            <FileNode key={index} item={child} onPreview={onPreview} />
          ))}
        </details>
      ) : (
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className="cursor-pointer px-2 py-1 hover:bg-muted rounded"
              onClick={() => onPreview(item)}
            >
              {item.name}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              onClick={() => window.open(`/preview-file?path=${encodeURIComponent(item.path)}`, "_blank")}
            >
              Download
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => alert("Rename coming soon")}
            >
              Rename
            </ContextMenuItem>
            <ContextMenuItem
              onClick={async () => {
                await fetch(`/delete-file?path=${encodeURIComponent(item.path)}`, { method: "DELETE" });
                window.location.reload();
              }}
            >
              Delete
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => navigator.clipboard.writeText(item.path)}
            >
              Copy path
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )}
    </div>
  );
}

function FilePreview({ file }) {
  const [content, setContent] = useState(null);
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!file) return;
    const fetchPreview = async () => {
      const res = await fetch(`/preview-file?path=${encodeURIComponent(file.path)}`);
      const contentType = res.headers.get("content-type");

      if (contentType.includes("text")) {
        const text = await res.text();
        setContent(text);
        setUrl(null);
      } else if (contentType.includes("image")) {
        setUrl(`/preview-file?path=${encodeURIComponent(file.path)}`);
        setContent(null);
      } else {
        setContent("Unsupported preview format");
        setUrl(null);
      }
    };
    fetchPreview();
  }, [file]);

  if (!file) return <div className="text-muted-foreground">Select a file to preview</div>;

  return (
    <div className="text-sm">
      <div className="font-semibold mb-2">📄 {file.name}</div>
      {url ? (
        <img src={url} alt={file.name} className="max-w-full max-h-96" />
      ) : (
        <pre className="whitespace-pre-wrap max-h-96 overflow-auto bg-muted p-2 rounded">
          {content}
        </pre>
      )}
    </div>
  );
}

export default function FileExplore({ item }) {
  const [previewFile, setPreviewFile] = useState(null);
  const [fileTree, setFileTree] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const res = await fetch(`http://localhost:8000/listFiles`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({"notebookID":item.name,"userID":item.userID})

      });
      const data = await res.json();
      setFileTree(data);
      console.log(data);
      
    };
    fetchFiles();
  }, [item.name]);

  return (
    <div className="grid grid-cols-4 h-screen">
      <Card className="col-span-1 border-r">
        <div className="p-2 font-semibold">Files</div>
        <ScrollArea className="h-full p-2">
          {fileTree.map((item, i) => (
            <FileNode key={i} item={item} onPreview={setPreviewFile} />
          ))}
        </ScrollArea>
      </Card>

      <div className="col-span-3 p-4">
        <h2 className="text-xl mb-4">Preview</h2>
        <FilePreview file={previewFile} />
      </div>
    </div>
  );
}

