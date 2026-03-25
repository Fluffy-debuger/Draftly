import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NoteBookContext } from "@/MyComponents/Dashboard/Dashboard"
import { useContext, useEffect, useState } from "react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ArchiveX, Copy, Delete, Edit, Eye, EyeClosed } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"



export function Secrets() {
  const { name, containerName, userID } = useContext(NoteBookContext)
  const [key, setkey] = useState("")
  const [value, setvalue] = useState("")
  const [flags, setflags] = useState(false)
  const [sdata, setsdata] = useState([])

  async function sendSecreats() {

    try {
      const req = await fetch("http://127.0.0.1:8000/api/addSecretes", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 'key': key, 'value': value, 'ContainerID': name, "userID": userID })

      })

      const data = await req.json()
      //console.log(data["data"]);


    } catch (error) {

    }



  }

  const fetchkeys = async () => {
    try {
      const req = await fetch("http://127.0.0.1:8000/api/fetchallsecretes", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "userID": userID, "notebookID": containerName })
      })
      const data = await req.json()
      setsdata(data["data"])
      console.log(sdata);

    } catch (error) {

    }
  }

  useEffect((() => { fetchkeys() }), [key])


  return (
    <div className="flex w-full  flex-col gap-6">
      <Tabs defaultValue="Uploadfiles">
        <TabsList className="w-full">
          <TabsTrigger value="Files">All File</TabsTrigger>
          <TabsTrigger value="Uploadfiles">Uploadfiles</TabsTrigger>
        </TabsList>
        <TabsContent className="w-full flex-grow" value="Uploadfiles">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>
                <div className="flex flex-row justify-between">
                  {containerName}'s Secrets
                  <Button className="w-0.5 h-0.5" onClick={() => { setflags(!flags) }}> {flags ? <Eye /> : <EyeClosed />} </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-3 p-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span className="pl-2">key</span>
                  <span>value</span>
                </div>
                <ScrollArea className="h-[300px] w-full">
                  {sdata.map((file, idx) => (
                    <div key={idx} className="grid grid-cols-3 p-1 border-t transition-colors items-center">
                      <span className="font-mono  text-xs p-1">{file.key}</span>
                      <input type="password" value={file.value} className="font-mono  text-xs p-1" />
                      <div className="flex flex-row gap-1.5 p-1">
                        <Copy onClick={navigator.clipboard.writeText(file.value)} />
                        <ArchiveX />
                      </div>

                    </div>
                  ))}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="Files">
          <Card>
            <CardHeader>
              <CardTitle>Secrets </CardTitle>
              <CardDescription>
                Configure your code by storing environment variables, file paths, or keys. Values stored here and,
                visible only to you and the notebooks that you select.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid row-end-2 gap-6  grid-cols-2">
              <div className="grid  gap-3">
                <Label htmlFor="tabs-demo-key">key</Label>
                <Input id="tabs-demo-key" onChange={(e) => (setkey(e.target.value))} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-value">Value</Label>
                <Input id="tabs-demo-value" onChange={(e) => (setvalue(e.target.value))} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-105" onClick={sendSecreats} >Save</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  )
}
