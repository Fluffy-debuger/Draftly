import React from 'react'
import LandingPage from './MyComponents/LandingPage/LandingPage'
import { Route, Routes } from 'react-router-dom'
import Dashboards from './MyComponents/Dashboard/Dashboard'
import Draw from './MyComponents/CodeComponents/DiagramCell/Draw'
import Graph from './MyComponents/CodeComponents/DiagramCell/Graph/GraphCell'
import Home from './MyComponents/Home/Home'
import Setting from './MyComponents/Setting/Setting'
import Packages from './MyComponents/DashboardMain/SideBarPages/Packages'

function App() {
  return (
    <>
    <Routes>
      <Route index path='/' element={<LandingPage/>}/>
      <Route path='dashboard' element={<Dashboards/>} />
      <Route path='draw' element={<Draw/>}/>
      <Route path='graph' element={<Graph/>}/>
      <Route path='home' element={<Home/>}/>
      <Route path='setting' element={<Setting/>}/>
      {/* <Route path='packages' element={<Packages/>}/> */}
    </Routes>
    
    </>
  )
}

export default App