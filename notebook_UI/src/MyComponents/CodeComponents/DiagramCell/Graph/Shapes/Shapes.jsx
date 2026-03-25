import { Handle, Position, NodeResizer } from 'reactflow';


export const RectangleNode0 = ({ data , selected , width=100,height=60}) => (
  <>
    <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={100}
        minHeight={30}
      />

    <div style={{
      width,height,background: '#fff', border: '2px solid #000',
      display: 'flex', justifyContent: 'center', alignItems: 'center' , boxSizing:'border-box'
    }}>
      {data.label}
    </div>

    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />

  </>

);




export const RectangleNode = ({ data, selected, width, height}) => {
  return (
    <>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={100}
        minHeight={60}
      />

      <div
        style={{
          position:'relative',
          width: `${width}px`,
          height: `${height}px`,
          background: '#fff',
          border: '2px solid #000',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxSizing: 'border-box',
          fontSize: '16px',
          overflow: 'hidden',
        }}
      >
        {data.label}
      </div>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </>
  );
};


export const CircleNode = ({ data }) => (
  <>
  <div style={{
    width: 80, height: 80, background: '#fff', border: '2px solid #000',
    borderRadius: '50%',
    display: 'flex', justifyContent: 'center', alignItems: 'center'
  }}>
    {data.label}
  </div>

  <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

  </>
);


