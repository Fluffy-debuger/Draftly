import React, { useContext, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader } from "@/components/ui/dialog";
import { Sidebar, SidebarContent, SidebarHeader, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarMenuAction } from '@/components/ui/sidebar'
import { FileBox, Code, Settings, Blocks, EyeClosed, Lock, ChevronDown, ChevronUp, MoreHorizontal, Copy, DraftingCompass, NotebookIcon } from "lucide-react";
import { Description, DialogTitle } from "@radix-ui/react-dialog";
import { Secrets } from "./SideBarPages/Secrets";
import FileManger from "./SideBarPages/FileManger";
import { NoteBookContext } from "../Dashboard/Dashboard";
import DashboardSetting from "./SideBarPages/SettingPages/DashboardSetting";
import EditorSetting from "./SideBarPages/SettingPages/EditorSetting";
import Snippets from "./SideBarPages/Snippit";
import ResourceIndicator from "../utlities/usagemonitor";
import RuntimeSetting from "./SideBarPages/SettingPages/RuntimeSetting";
import StorageSetting from "./SideBarPages/SettingPages/StorageSetting";
import UserSetting from "./SideBarPages/SettingPages/UserSetting";

const tabs = ["Dashboard", "Editor", "Runtime", "Storage", "Users"]

function AppSidebar({ }) {
  const { name, containerName, userID, allNoteBooks } = useContext(NoteBookContext)
  const [activeTab, setActiveTab] = useState("Dashboard")
  const [allfiles, setallfiles] = useState([])
  const [dialogOpen, setDialogOpen] = useState({
    project: false,
    snippets: false,
    settings: false,
    secrets: false,
    packages: false
  });

  const menuItems = [
    { title: "Project", Icon: FileBox, key: "project" },
    { title: "Snippets", Icon: Code, key: "snippets" },
    { title: "Settings", Icon: Settings, key: "settings" },
    { title: "Secrets", Icon: Lock, key: "secrets" },
    //{ title: "Packages", Icon: Blocks, key: "packages" },
  ];

  const fetchAllfiles = async () => {
    try {
      const req = await fetch("http://127.0.0.1:8000/api/listFiles", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "notebookID": containerName, "userID": userID })
      })

      const data = await req.json()
      console.log(data);
      setallfiles(data["res"])

    } catch (error) {

    }
  }


  useEffect(() => {
    fetchAllfiles()
  }, [userID])


  const LoadNoteBook = (n) => {
    console.log(n);

  }
  console.log("ALL notes", allNoteBooks);


  return (

    <div>

      <Sidebar>

        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    {containerName}
                    <ChevronDown className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent >
                  <DropdownMenuItem>
                    <span>Acme Inc</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> */}


              {/* <NativeSelect defaultValue="" onChange={(e) => LoadNoteBook(e.target.value)}>
            <NativeSelectOption value="" disabled hidden>  <FaFirstdraft className="w-50 h=50"/> {containerName}</NativeSelectOption>
            {allnotes.map((i,idx)=>{
              return <NativeSelectOption key={idx}>{i}</NativeSelectOption>
            })}
            </NativeSelect> */}
              <div className="flex flex-row items-center p-1 m-1 text-1xl gap-1">
                <NotebookIcon />
                <b>{containerName}</b>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {/* 
           <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex-row gap-2">
                  <FileBox/>
                  <span className="font-extrabold">Projects</span>
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  
              <SidebarMenu>
                {allfiles.map((files, idx) => (

                  <SidebarMenuItem key={idx} className="p-2.5">
                    {files.filename}
                    <Copy onClick={() => navigator.clipboard.writeText(files.path)} />

                  </SidebarMenuItem>

                ))}
              </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible> */}

          <SidebarGroup>

            <SidebarGroupContent>



              <SidebarMenu>
                {menuItems.map((item, idx) => (
                  <SidebarMenuItem key={idx}>
                    <SidebarMenuButton
                      onClick={() =>
                        setDialogOpen((prev) => ({
                          ...prev,
                          [item.key]: true,
                        }))
                      }
                    >
                      <item.Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>

                  </SidebarMenuItem>
                ))}
              </SidebarMenu>

            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <ResourceIndicator />
        </SidebarFooter>

      </Sidebar>


      <Dialog className="flex w-full" open={dialogOpen.project} onOpenChange={(o) => setDialogOpen(prev => ({ ...prev, project: o }))}>
        <DialogContent>
          <h2 className="text-xl font-bold">Project</h2>
          <p className="mb-4">This is content for the Snippets dialog.</p>
          <FileManger />
        </DialogContent>
      </Dialog>


      <Dialog open={dialogOpen.snippets} onOpenChange={(o) => setDialogOpen(prev => ({ ...prev, snippets: o }))}>
        <DialogTitle></DialogTitle>
        <DialogContent>
          <h2 className="text-xl font-bold">Snippets</h2>
          <p>This is content for the Snippets dialog.</p>
          <Snippets />
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen.settings} onOpenChange={(o) => setDialogOpen(prev => ({ ...prev, settings: o }))}>
        {/* <DialogTrigger asChild>
          <Button variant="outline">Settings</Button>
        </DialogTrigger> */}

        <DialogContent className="max-w-5xl h-[600px] ">
          <DialogHeader>
            <DialogTitle><h2 className="text-xl font-bold">Setting</h2></DialogTitle>
          </DialogHeader>

          <div className="flex h-full">
            <div className="w-1/4 border-r pr-2">
              {tabs.map((tab) => (
                <div
                  key={tab}
                  className={`cursor-pointer px-3 py-2 rounded hover:bg-muted ${activeTab === tab ? "bg-muted font-semibold" : ""
                    }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </div>
              ))}
            </div>

            <div className="flex-1 pl-6 overflow-y-auto">
              {activeTab === "Dashboard" && (
                <DashboardSetting />
              )}

              {activeTab === "Editor" && (
                <EditorSetting />
              )}

              {activeTab === "Runtime" && (
                <RuntimeSetting />
              )}

              {activeTab === "Storage" && (
                <StorageSetting/>
              )}

              {activeTab === "Users" && (
                <UserSetting/>
              )}

              {/* {activeTab !== "Dashboard" && (
                <p className="text-muted-foreground">Settings for "{activeTab}" not implemented yet.</p>
              )} */}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen.secrets} onOpenChange={(o) => setDialogOpen(prev => ({ ...prev, secrets: o }))}>
        <DialogTitle></DialogTitle>
        <DialogContent>
          <h2 className="text-xl font-bold">Secrets</h2>
          <p>To use secrets "secrets({`<key>`})".</p>
          <Secrets />
        </DialogContent>
      </Dialog>

      {/* <Dialog open={dialogOpen.packages} onOpenChange={(o) => setDialogOpen(prev => ({ ...prev, packages: o }))}>
        <DialogTitle></DialogTitle>
        <DialogContent>
          <Description><span className="text-xl font-bold">Packages Modal</span></Description>
          <Packages />
        </DialogContent>
      </Dialog> */}

    </div>
  );
}

export default AppSidebar;
