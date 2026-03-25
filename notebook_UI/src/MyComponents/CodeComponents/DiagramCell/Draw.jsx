import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Tldraw, getSnapshot, loadSnapshot } from 'tldraw';
import 'tldraw/tldraw.css';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Copy, Trash2, Share2, EllipsisVertical, Hand, WandSparkles, PencilIcon,Eye } from 'lucide-react';
import debounce from 'lodash.debounce';

const VIEW_MODE_COMPONENTS = {
  Toolbar: null,
  PageMenu: null,
  ActionsMenu: null,
  ZoomMenu: null,
  MainMenu: null,
  HelpMenu: null,
  DebugPanel: null,
  DebugMenu: null,
  KeyboardShortcutsDialog: null,
  SharePanel: null,
};

export default function TldrawCell({ containername, cellInfo, userID }) {
  const [isEditing, setIsEditing] = useState(true);
  const [editor, setEditor] = useState(null);
  const isDirty = useRef(false);


  const capturePreview = useCallback(async (editorInstance) => {
    const shapeIds = Array.from(editorInstance.getCurrentPageShapeIds());
    if (shapeIds.length === 0) return null;

    try {
      const canvas = await exportToCanvas(editorInstance, shapeIds, {
        format: 'png',
        padding: 10,
        background: true,
      });
      return canvas.toDataURL('image/png').split(',')[1];
    } catch (e) {
      console.error("Preview capture failed", e);
      return null;
    }
  }, []);

  const saveToBackend = useCallback(async (snapshot, isFinal = false) => {
    if (!isDirty.current && !isFinal) return;

    const previewBase64 = editor ? await capturePreview(editor) : null;

    try {
      await fetch("http://127.0.0.1:8082/saveCellData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          userID: userID,
          notebookID: containername,
          cellID: cellInfo.cellID,
          code: JSON.stringify(snapshot), 
          output: previewBase64 || ""
        })
      });
      isDirty.current = false;
    } catch (error) {
      console.error("Canvas save failed:", error);
    }
  }, [userID, containername, cellInfo, editor, capturePreview]);

  const debouncedSave = useCallback(
    debounce((snapshot) => saveToBackend(snapshot), 2000),
    [saveToBackend]
  );

  const handleMount = useCallback((editorInstance) => {
    setEditor(editorInstance);

    if (cellInfo.CellData?.Data) {
      try {
        const snapshot = JSON.parse(cellInfo.CellData.Data);
        loadSnapshot(editorInstance.store, snapshot);
      } catch (e) {
        console.error("Failed to load canvas snapshot", e);
      }
    }

    const cleanup = editorInstance.store.listen(() => {
      isDirty.current = true;
      debouncedSave(getSnapshot(editorInstance.store));
    });

    return cleanup;
  }, [cellInfo.CellData.Data, debouncedSave]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && editor && isDirty.current) {
        saveToBackend(getSnapshot(editor.store), true);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      debouncedSave.cancel();
    };
  }, [editor, saveToBackend, debouncedSave]);

  useEffect(() => {
    if (!editor) return;
    if (!isEditing) {
      editor.updateInstanceState({ isReadonly: true });
      editor.setCurrentTool('laser');
    } else {
      editor.updateInstanceState({ isReadonly: false });
      editor.setCurrentTool('select');
    }
  }, [isEditing, editor]);

  const deleteNode = async () => {
    try {
      await fetch("http://127.0.0.1:8082/deleteCodeCell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID, notebookID: containername, cellID: cellInfo.cellID })
      });
    } catch (error) { console.log(error); }
  }

  return (
    <div className="flex flex-col w-full h-[600px] bg-white overflow-hidden border border-slate-200 rounded-xl shadow-sm mb-10">
      <div className="flex items-center justify-between px-5 py-3 bg-gray-900 border-b border-slate-200 z-10">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
            isEditing ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-indigo-600 text-white border-indigo-700'
          }`}
        >
          {isEditing ? <Eye/> : <PencilIcon/>}
        </button>

        <div className="flex items-center gap-2">
            {isDirty.current && <span className="text-[10px] text-gray-400 animate-pulse">Saving...</span>}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="p-2.5 rounded-full hover:bg-gray-700/70 transition-colors">
                        <EllipsisVertical className="text-gray-300" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={deleteNode} className="text-red-400"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      <div className="tldraw-container relative flex-1 w-full overflow-hidden">
        <Tldraw
          onMount={handleMount}
          hideUi={!isEditing}
          components={!isEditing ? VIEW_MODE_COMPONENTS : undefined}
        />

        {!isEditing && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl border border-slate-200 z-[50]">
            <ViewTool icon={<Hand size={18}/>} active={editor?.getCurrentToolId() === 'hand'} onClick={() => editor?.setCurrentTool('hand')} />
            <ViewTool icon={<WandSparkles size={18} />} active={editor?.getCurrentToolId() === 'laser'} onClick={() => editor?.setCurrentTool('laser')} />
          </div>
        )}
      </div>
      
      <style jsx global>{`
        .tldraw-container { isolation: isolate !important; z-index: 1 !important; }
        .tl-container { touch-action: none !important; }
      `}</style>
    </div>
  );
}

function ViewTool({ icon, active, onClick }) {
  return (
    <button onClick={onClick} className={`p-2 rounded-xl transition-all ${active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}`}>
      {icon}
    </button>
  );
}