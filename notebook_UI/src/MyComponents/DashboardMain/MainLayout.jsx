import { SidebarProvider, SidebarTrigger,SidebarInset } from '@/components/ui/sidebar'
import React from 'react'
import AppSidebar from './AppSidebar'
import StatusBar from './Statusbar'
import Header from './Header'

function MainLayout({ childrenCell, name ,cellWrapRef }) {
  return (
    <div className="flex min-h-screen">
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset className="flex flex-col flex-1">
          <Header names={name} cellWrapRef={cellWrapRef} />
          <main className="flex-1 flex flex-col overflow-auto m-2 gap-2">
            {childrenCell}
          </main>
          <StatusBar />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default MainLayout
