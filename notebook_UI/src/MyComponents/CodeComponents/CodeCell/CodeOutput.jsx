import React from 'react';

function CodeOutput({ output }) {
  const renderItem = (item, index) => {
    if (item.type === 'image' && item.base64) {
      return (
        <div key={index}>
          <img
            src={`data:image/png;base64,${item.base64}`}
            alt="Python Plot"
            className="h-auto rounded"
          />
        </div>
      );
    }

    if (item.type === 'execute_result' || item.type === 'display_data') {
      const data = item.data || {};

      if (data['text/html']) {
        return (
          <div 
            key={index} 
            className="my-2 overflow-x-auto bg-white text-black p-3 rounded border border-gray-600 shadow-inner"
            dangerouslySetInnerHTML={{ __html: data['text/html'] }} 
          />
        );
      }

      if (data['text/plain']) {
        return (
          <pre key={index} className="text-gray-300 whitespace-pre-wrap text-xs font-mono">
            {data['text/plain']}
          </pre>
        );
      }
    }

    if (item.type === 'stream') {
      return (
        <pre key={index} className="whitespace-pre-wrap text-gray-200 opacity-90 font-mono text-sm">
          {item.text}
        </pre>
      );
    }

        if (item.type === 'execute_result' || item.type === 'display_data') {
          const data = item.data || {};

          if (data['text/html']) {
            return (
              <div 
                key={index} 
                className="bg-white text-black p-2 rounded overflow-x-auto my-2"
                dangerouslySetInnerHTML={{ __html: data['text/html'] }} 
              />
            );
          }

          return <pre key={index}>{data['text/plain'] || JSON.stringify(data)}</pre>;
        }

    if (item.type === 'error') {
      return (
        <div key={index} className="p-3 bg-red-950/30 border-l-4 border-red-500 rounded my-2">
          <pre className="text-red-400 whitespace-pre-wrap text-xs overflow-x-auto font-mono">
            {Array.isArray(item.traceback) ? item.traceback.join('\n') : item.traceback}
          </pre>
        </div>
      );
    }


    if (item.type === 'image' && item.path) {
      return (
        <div key={index} className="my-4 bg-white p-2 rounded-lg flex justify-center">
          <img
            src={`http://localhost:8000/${item.path}`}
            alt="Stored Plot"
            className="max-w-full rounded"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="p-2 space-y-3">
      {output && output.length > 0 ? (
        output.map((item, index) => renderItem(item, index))
      ) : (
        <span className="text-gray-500 text-xs italic">No output to display</span>
      )}
    </div>
  );
}

export default CodeOutput;