import React from 'react'
import DrawCell from './Draw'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import Graph from './Graph'
function Diagramcell({ containername , cellInfo ,userID }) {

    return (
        <div className='flex flex-col gap-1.5'>
            <div id="EditorCell" className=''>
                <div id="celltabs" className="flex flex-row w-full">
                    <Tabs defaultValue="draw" className="w-full flex-grow">
                        <TabsList className="w-full">
                            <TabsTrigger value="draw">Draw</TabsTrigger>
                            <TabsTrigger value="graph">Graph</TabsTrigger>
                        </TabsList>
                        <TabsContent value="draw" className="w-full">
                            <DrawCell containername={containername} cellInfo={cellInfo} userID={userID} />
                        </TabsContent>
                        <TabsContent value="graph" className="w-full">
                            <Graph />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

export default Diagramcell