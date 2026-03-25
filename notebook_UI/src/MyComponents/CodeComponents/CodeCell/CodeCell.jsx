import React, { useState, useRef, Suspense, lazy ,useEffect,useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import CodeOutput from './CodeOutput';
import { Copy, Trash2, Share2, ChevronDown, ChevronUp, Play, EllipsisVertical } from 'lucide-react';
import debounce from 'lodash.debounce';

const Editor = lazy(() => import('@monaco-editor/react'));

function CodeCell({ containername, hostPort = 8000, cellInfo, userID }) {
  const [code, setCode] = useState(
    cellInfo["CellData"]["Data"]
  );
  const [output, setOutput] = useState([]);
  const [showOutput, setShowOutput] = useState(false);
  const [isOutputCollapsed, setIsOutputCollapsed] = useState(false);
  const [running, setRunning] = useState(false);

  const editorRef = useRef(null);


  const showCellInfo = () => {
    console.log(cellInfo);
  }
  const MIN_HEIGHT = 100;
  const MAX_HEIGHT = 580;
  const [editorHeight, setEditorHeight] = useState(MIN_HEIGHT);

  const updateEditorHeight = () => {
    if (!editorRef.current) return;

    const contentHeight = editorRef.current.getContentHeight();
    const paddedHeight = contentHeight + 24;
    const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, paddedHeight));

    setEditorHeight(newHeight);
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    updateEditorHeight();

    editor.onDidChangeModelContent(updateEditorHeight);
    editor.onDidContentSizeChange(updateEditorHeight);
  };

  const runCode = async () => {
    if (running) return;

    setRunning(true);
    setShowOutput(true);
    setIsOutputCollapsed(false);
    setOutput([]); 

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          nId: containername,
          userID: userID,
          cellID: cellInfo.cellID
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      // let normalizedOutput = [];

      // if (Array.isArray(data.output)) {
      //   normalizedOutput = data.output;
      // } else if (data.output) {
      //   normalizedOutput = [data.output];
      // } else if (data.result || data.error) {
      //   normalizedOutput = [
      //     data.error
      //       ? { type: 'error', traceback: [data.error] }
      //       : { type: 'stream', text: String(data.result || 'No output') },
      //   ];
      // } else {
      //   normalizedOutput = [{ type: 'stream', text: 'Execution completed (no output captured)' }];
      // }

      // setOutput(normalizedOutput);
      const normalizedOutput = Array.isArray(data.output) ? data.output : [data.output];
      setOutput(normalizedOutput);
    } catch (err) {
      console.error('Execution failed:', err);
      setOutput([
        {
          type: 'error',
          traceback: [err.message || 'Unknown execution error'],
        },
      ]);
    } finally {
      setRunning(false);
    }
  };
  console.log(output);

  const showcellData = () => {
    console.log(` cellID :${cellInfo.cellID}  code : ${code} \n output : ${output[0]['text']}`);

  }

  const deleteNode = async () => {
    try {
      const req = await fetch("http://127.0.0.1:8082/deleteCodeCell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "userID": userID, "notebookID": containername, "cellID": cellInfo.cellID })
      })

      const data = await req.json()
      console.log(data);

    } catch (error) {
      console.log(error, "ERROR!");

    }
  }


  const saveNodedata1 = async () => {
    console.log(`Saving the cell data for ${cellInfo.cellID}`);
    
    try {
      const req = await fetch("http://127.0.0.1:8082/saveCellData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "notebookID": containername,
          "userID": userID,
          "cellID": cellInfo.cellID, 
          "code": code, 
          "output": output[0]['text']
        })
      })
    } catch (error) {

    }
  }


 
    const isDirty = useRef(false);
    const saveNodedata = useCallback(async (currentCode, currentOutput, isFinal = false) => {
      if (!isDirty.current && !isFinal) return;
  
      try {
        await fetch("http://127.0.0.1:8082/saveCellData", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({
            "notebookID": containername,
            "userID": userID,
            "cellID": cellInfo.cellID,
            "code": currentCode,
            "output": currentOutput 
          })
        });
        isDirty.current = false;
        console.log(`Saved cell: ${cellInfo.cellID}`);
      } catch (error) {
        console.error("Save Error:", error);
      }
    }, [containername, userID, cellInfo.cellID]);
    const debouncedSave = useCallback(
      debounce((c, o) => saveNodedata(c, o), 1500),
      [saveNodedata]
    );
  
    useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden' && isDirty.current) {
          saveNodedata(code, output, true);
        }
      };
  
      window.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        window.removeEventListener('visibilitychange', handleVisibilityChange);
        debouncedSave.cancel();
      };
    }, [code, output, saveNodedata, debouncedSave]);
  
    const handleCodeChange = (newValue) => {
      const val = newValue || '';
      setCode(val);
      isDirty.current = true;
      debouncedSave(val, output);
    };


  return (
    <div className="flex flex-col gap-2 my-3 border border-gray-700 rounded-lg overflow-hidden bg-[#1e1e1e]">
    

      {/* Main */}
      <div className="flex">
        {/* Left sidebar */}
        <div className="w-12 flex flex-col items-center pt-3 bg-gray-900/50">
          <button
            onClick={runCode}
            disabled={running}
            className="p-2.5 rounded-full hover:bg-gray-700/70 transition-colors disabled:opacity-40"
            title="Run cell"
          >
            <Play
              size={22}
              className={running ? 'text-green-400 animate-pulse' : 'text-blue-500'}
            />
          </button>
        </div>

        {/* Editor area */}
        <div className="flex-1 min-w-0">
          <Suspense fallback={
            <div className="h-40 bg-gray-950 flex items-center justify-center text-gray-500">
              Loading editor...
            </div>
          }>
            <Editor
             height={editorHeight}
              width="100%"
              language="python"
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                fontSize: 15,
                lineHeight: 20,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </Suspense>
        </div>

        {/* Right sidebar , menu */}
        <div className="w-12 flex flex-col items-center pt-3 bg-gray-900/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2.5 rounded-full hover:bg-gray-700/70 transition-colors">
                <EllipsisVertical className=" text-gray-300" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="start">
              <DropdownMenuGroup>

                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(code)}>
                  <Copy className="mr-2 h-4 w-4 text-gray-300" />
                  Copy code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={deleteNode}>
                  <Trash2 className="mr-2 h-4 w-4 text-red-400" />
                  Delete cell
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4 text-blue-400" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* output section */}
      {showOutput && (
        <div className="border-t border-gray-700 bg-black/40">
          <button
            onClick={() => setIsOutputCollapsed(!isOutputCollapsed)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-sm text-gray-300 hover:bg-gray-900/50 transition-colors"
          >
            <span className="font-medium">
              Output {running ? ' • Running...' : ''}
            </span>
            {isOutputCollapsed ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {!isOutputCollapsed && (
            <div className="px-4 pb-4 pt-1 text-amber-50">
              <CodeOutput output={output} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CodeCell;