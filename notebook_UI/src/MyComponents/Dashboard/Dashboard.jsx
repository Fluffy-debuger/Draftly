import React, {useState,useRef } from 'react'
import MainLayout from '../DashboardMain/MainLayout'
import CellWrap from '../CellWrap/CellWrap'
import { data, useLocation} from 'react-router-dom'
import { createContext } from 'react'
import { useUser} from "@clerk/clerk-react";
export const NoteBookContext=createContext()

function Dashboards() {
  const loc=useLocation()
  const {name,containerName,hostPort,userID,allNoteBooks}=loc.state ||{}
  console.log(`Name :${name} | ContainerName :${containerName} | HostPort : ${hostPort}`)
  const { isLoaded, isSignedIn, user } = useUser();
  const cellWrapRef = useRef(null);
  console.log(isLoaded);
  console.log(allNoteBooks);
  
  return (
    <NoteBookContext.Provider value={{name,containerName,hostPort,userID,allNoteBooks}}>
    <div>
      <MainLayout name={name} cellWrapRef={cellWrapRef} childrenCell={<CellWrap container={containerName} hostPort={hostPort} userID={userID} ref={cellWrapRef}/>} />
    </div>
    </NoteBookContext.Provider>
  )
}

export default Dashboards