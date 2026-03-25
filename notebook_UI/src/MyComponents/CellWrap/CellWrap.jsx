import React, { useState, useEffect, useCallback, memo, useImperativeHandle, forwardRef } from 'react';
import CodeCell from '../CodeComponents/CodeCell/CodeCell';
import Markdown from '../CodeComponents/MarkDownCell/Markdown';
import Diagramcell from '../CodeComponents/DiagramCell/Diagramcell';

const MemoizedCell = memo(({ cell, CellComponent, container, hostPort, userID }) => (
  <div
    key={cell.cellID}
    className="relative z-0 animate-in fade-in duration-500"
    style={{ isolation: 'isolate' }}
  >
    <CellComponent
      containername={container}
      hostPort={hostPort}
      cellInfo={cell}
      userID={userID}
    />
  </div>
));

const CellWrap = forwardRef(({ container, hostPort, userID }, ref) => {
  const [cells, setCells] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const cellMap = { CodeCell, Markdown, Diagramcell };

  useImperativeHandle(ref, () => ({
    exportIPYNB: async () => {
      const ipynbCells = cells.map((cell) => {
        if (cell.cell === 'Markdown') {
          return {
            cell_type: 'markdown',
            metadata: {},
            source: [cell.CellData?.Data || ""]
          };
        }

        if (cell.cell === 'CodeCell') {
          return {
            cell_type: 'code',
            execution_count: 1,
            metadata: {},
            source: [cell.CellData?.Data || ""],
            outputs: Array.isArray(cell.CellData?.result)
              ? cell.CellData.result
              : (cell.CellData?.result ? [cell.CellData.result] : [])
          };
        }

        if (cell.cell === 'Diagramcell') {
          const imageBase64 = cell.CellData?.result;

          return {
            cell_type: 'markdown',
            metadata: {},
            source: [
              `### Diagram: ${cell.cellID}\n`,
              imageBase64
                ? `![Canvas Drawing](data:image/png;base64,${imageBase64})`
                : `*No visual data found for this canvas.*`
            ]
          };
        }

        return null;
      }).filter(Boolean);

      const notebookData = {
        cells: ipynbCells,
        metadata: {
          kernelspec: {
            display_name: "Python 3 (ipykernel)",
            language: "python",
            name: "python3"
          },
          language_info: {
            codemirror_mode: { name: "ipython", version: 3 },
            file_extension: ".py",
            mimetype: "text/x-python",
            name: "python",
            nbconvert_exporter: "python",
            pygments_lexer: "ipython",
            version: "3.10.0"
          }
        },
        nbformat: 4,
        nbformat_minor: 5
      };

      try {
        const jsonString = JSON.stringify(notebookData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/x-ipynb+json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${container || 'notebook'}.ipynb`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log("Notebook exported as .ipynb successfully");
      } catch (error) {
        console.error("Export failed:", error);
      }
    },

    exportPDF: async () => {
      window.print();
    }
  }));

  const loadCells = useCallback(async () => {
    if (!userID || !container) return;
    //setError("Missing userID or container context.");

    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8082/notebooks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UserID: userID, NotebookID: container }),
      });
      const data = await response.json();
      setCells(data?.cells || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userID, container]);

  useEffect(() => {
    loadCells();
    let socket;
    if (container) {
      socket = new WebSocket(`ws://127.0.0.1:8082/ws/notebook/${container}`);
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "CELLS_UPDATED") setCells(message.cells);
      };
    }
    return () => socket?.close();
  }, [container, loadCells]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} retry={loadCells} />;

  return (
    <div className="space-y-6 pb-20" id='notebook-content'>
      {cells.length === 0 ? (
        <EmptyState />
      ) : (
        cells.map((cell) => {
          const CellComponent = cellMap[cell.cell];
          if (!CellComponent) return null;

          return (
            <MemoizedCell
              key={cell.cellID}
              cell={cell}
              CellComponent={CellComponent}
              container={container}
              hostPort={hostPort}
              userID={userID}
            />
          );
        })
      )}
    </div>
  );

  // return (
  //   <div id="notebook-content" className="space-y-6 pb-20">
  //     {!isLoading && cells.map((cell) => {
  //       const CellComponent = cellMap[cell.cell];
  //       return CellComponent ? (
  //         <MemoizedCell 
  //           key={cell.cellID}
  //           cell={cell}
  //           CellComponent={CellComponent}
  //           container={container}
  //           hostPort={hostPort}
  //           userID={userID}
  //         />
  //       ) : null;
  //     })}
  //   </div>
  // );
});

// --- helper func ---
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20 animate-pulse text-slate-400 font-medium italic">
    Assembling Draftly...
  </div>
);

const ErrorDisplay = ({ error, retry }) => (
  <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
    <p className="text-red-600 font-semibold">{error}</p>
    <button onClick={retry} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md">
      Reconnect
    </button>
  </div>
);

const EmptyState = () => (
  <div className="py-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
    <p className="text-slate-400 font-medium">No cells found. Use the "+" menu to add code or diagrams.</p>
  </div>
);

export default CellWrap;