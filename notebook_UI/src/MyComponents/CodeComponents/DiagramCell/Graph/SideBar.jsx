import React from 'react'

function Sidebar() {
    return (

        <aside>
            <div className='flex flex-col border-2 border-black gap-1'>
                <div id="General" className='flex flex-col m-2'>
                    <div className="title"><span>General :</span></div>
                    <div id="GeneralShapes" className='grid grid-cols-4'>

                        <div draggable id="RectangleNode" onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'Rectangle')}>
                            <img width="48" height="48" src="https://img.icons8.com/material-rounded/48/rectangle-stroked.png" alt="rectangle-stroked" />
                        </div>

                        <div draggable="true" id="RoundedRectangleNode">
                            <img width="48" height="48" src="https://img.icons8.com/material-rounded/48/rectangle-stroked.png" alt="rectangle-stroked" />
                        </div>

                        <div draggable="true" id="TextNode">
                            <img width="48" height="48" src="https://img.icons8.com/material-outlined/48/text.png" alt="text" />
                        </div>

                        <div draggable="true" id="SquareNode">
                            <img width="48" height="48" src="https://img.icons8.com/fluency-systems-regular/48/rounded-square.png" alt="rounded-square" />
                        </div>

                        <div draggable id="CircleNode" onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'Circle')}>
                            <img width="48" height="48" src="https://img.icons8.com/material-outlined/48/circled.png" alt="circled" />
                        </div>

                        <div draggable="true" id="RhombusNode">
                            <img width="48" height="48" src="https://img.icons8.com/windows/48/rhombus.png" alt="rhombus" />
                        </div>

                        <div draggable="true" id="TriangleNode">
                            <img width="48" height="48" src="https://img.icons8.com/ios/48/triangle-stroked.png" alt="triangle-stroked" />
                        </div>

                    </div>
                </div>

                <div id="Connectors" className='flex flex-col m-2'>
                    <div className="title"><span>Connectors :</span></div>
                    <div id="ConnectorsLinks" className='grid grid-cols-4'>

                        <div draggable="true" id="Curve-egde">
                            <img width="48" height="48" src="https://img.icons8.com/color/48/curve-edit.png" alt="curve-edit" />
                        </div>

                        <div draggable="true" id="Line-edge">
                            <img width="48" height="48" src="https://img.icons8.com/ios/48/line--v1.png" alt="line--v1" />
                        </div>



                        <div draggable="true" id="Dash-Line-edge">
                            <img width="48" height="48" src="https://img.icons8.com/ios/48/dashed-line.png" alt="dashed-line" />
                        </div>

                        <div draggable="true" id="Uni-directional-Line-edge">
                            <img width="48" height="48" src="https://img.icons8.com/ios/48/long-arrow-right--v1.png" alt="long-arrow-right--v1" />
                        </div>

                        <div draggable="true" id="Bi-directional-Line-edge">
                            <img width="48" height="48" src="https://img.icons8.com/dotty/48/arrow--v2.png" alt="arrow--v2" />
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar