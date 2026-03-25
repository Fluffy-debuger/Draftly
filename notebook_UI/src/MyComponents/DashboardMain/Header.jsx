import React, { useContext, useCallback } from 'react';
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from '@/components/tiptap-ui-primitive/button';
import { useNavigate } from 'react-router-dom';
import { NoteBookContext } from '../Dashboard/Dashboard';
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TiExport } from "react-icons/ti";
import { FaFilePdf } from "react-icons/fa6";
import { PiNotebookFill } from "react-icons/pi";
import { IoMdCloseCircle } from "react-icons/io";

function Header({ cellWrapRef }) {
  const { name, containerName, userID } = useContext(NoteBookContext);
  const navigate = useNavigate();

  const closeNoteBook = useCallback(async () => {
    try {
      await fetch("http://127.0.0.1:8000/api/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notebook_id: name }),
      });
      navigate('/home', { state: { userID } });
    } catch (err) {
      console.error("Failed to close notebook:", err);
    }
  }, [name, userID, navigate]);

  const addCell = useCallback(async (cellType) => {
    try {
      await fetch("http://127.0.0.1:8082/addCell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID, notebookID: containerName, cellType }),
      });
    } catch (err) {
      console.error(`Failed to add ${cellType}:`, err);
    }
  }, [userID, containerName]);

  return (
    <header className="flex h-[--header-height] shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur">
      <div className="flex w-full flex-row items-center gap-1.5 px-3 py-1">
        <div className="flex flex-row items-center gap-2">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-base font-medium text-amber-950 truncate max-w-[240px]">{name}</h1>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <NativeSelect defaultValue="" onChange={(e) => addCell(e.target.value)} className="w-36">
            <NativeSelectOption value="" disabled hidden>+ Add Cell</NativeSelectOption>
            <NativeSelectOption value="CodeCell">+ Code</NativeSelectOption>
            <NativeSelectOption value="Markdown">+ Text</NativeSelectOption>
            <NativeSelectOption value="Diagramcell">+ Canvas</NativeSelectOption>
          </NativeSelect>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"><TiExport className='h-5 w-5 mr-1' />Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="start">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => cellWrapRef.current?.exportIPYNB()}>
                  <PiNotebookFill className='h-5 w-5 mr-2'/>.ipynb
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => cellWrapRef.current?.exportPDF()}>
                  <FaFilePdf className='h-5 w-5 mr-2'/>.pdf
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="destructive" onClick={closeNoteBook}>
            <IoMdCloseCircle className='h-5 w-5 mr-1'/> Close
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;