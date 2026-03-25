import React from 'react'
import GraphCell from './Graph/GraphCell'
import Sidebar from './Graph/SideBar'

function Graph() {
  return (
    <div className='flex flex-row gap-2'>
        <Sidebar/>
        <GraphCell/>
    </div>
  )
}

export default Graph