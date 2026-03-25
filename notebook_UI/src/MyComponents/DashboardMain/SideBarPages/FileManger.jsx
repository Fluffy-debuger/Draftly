import { useContext,useState,useEffect,useMemo } from "react"
import { FilePond, registerPlugin } from 'react-filepond'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import { Input } from "@/components/ui/input";
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { NoteBookContext } from "@/MyComponents/Dashboard/Dashboard"
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search,Copy, ArchiveX, FileIcon } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview)

function FileManager() {
  const { name, containerName, userID } = useContext(NoteBookContext)
  const [packages, setPackages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const serverConfig = {
    process: {
      url: 'http://localhost:8000/api/upload',
      method: 'POST',
      withCredentials: false,
      ondata: (formData) => {
        formData.append('notebookID', name)
        formData.append('containerName', containerName)
        formData.append('userID', userID)
        return formData
      },
    },
  }

  const notebookdetails = { name: name, containerName: containerName, userID: userID }


    const fetchPackages = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/listFiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ "notebookID":containerName,"userID": userID }),
        });
        const data = await res.json();
        setPackages(Array.isArray(data.res) ? data.res : []);
        console.log(packages);
        
      } catch (error) {
        console.error("Failed to fetch packages", error);
      }
    };
  
    useEffect(() => { fetchPackages(); }, [name]);

    const filteredPackages = useMemo(() => {
      return packages.filter(pkg =>
        pkg.filename.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [packages, searchQuery]);

  return (
    <div className="flex w-full  flex-col">

      <Tabs defaultValue="Uploadfiles">
        
        <TabsList className="w-full">
          <TabsTrigger value="Files">All File</TabsTrigger>
          <TabsTrigger value="Uploadfiles">Uploadfiles</TabsTrigger>
        </TabsList>

        <TabsContent className="w-full flex-grow" value="Uploadfiles">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
            </CardHeader>
            <CardContent>
              <FilePond
                allowMultiple={false}
                name="file"
                server={serverConfig}
                labelIdle='Drag & Drop your file or <span class="filepond--label-action">Browse</span>'
              />
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="Files">
          <Card >
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4" />
                <Input
                  placeholder="Search files..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4" >
                {/* <div className="grid grid-cols-2 p-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span className="pl-2">Package</span>
                  <span>Version</span>
                </div> */}
                <ScrollArea className="w-full">
                  {filteredPackages.map((pkg, idx) => (
                    <div key={idx} className="flex p-0.5flex-row gap-2 justify-between items-center">
                      <div className="flex flex-row gap-1 items-center">
                        <FileIcon/>
                        <span className="font-mono text-xs">{pkg.filename}</span>
                      </div>
                      <div className="flex flex-row gap-2 items-center">
                         <Copy onClick={() => navigator.clipboard.writeText(pkg.path)} />
                      <ArchiveX/>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FileManager

