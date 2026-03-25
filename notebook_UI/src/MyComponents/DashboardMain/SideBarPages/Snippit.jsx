import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CopyIcon, DeleteIcon, ShareIcon } from "lucide-react";

function Snippets(params) {
    return (
        <div className="flex flex-col" >
            <div className="search flex flex-row gap-1">
                <Input /> <Button >Search</Button>
            </div>
            <Separator className="my-4" />

            <div className="snippets flex  flex-col gap-2.5">
                <div className="snippets1 flex flex-row  justify-between"> <div>import numpy ....</div> <div className="actions flex flex-row gap-1"> <Button><CopyIcon/></Button> <Button><DeleteIcon/></Button> <Button><ShareIcon/></Button> </div> </div>
                <div className="snippets1 flex flex-row justify-between  "> <div>#include  ....</div> <div className="actions flex flex-row gap-1"> <Button><CopyIcon/></Button> <Button><DeleteIcon/></Button> <Button><ShareIcon/></Button></div> </div>
                <div className="snippets1 flex flex-row justify-between "> <div>import numpy ....</div> <div className="actions flex flex-row gap-1"> <Button><CopyIcon/></Button> <Button><DeleteIcon/></Button> <Button><ShareIcon/></Button></div> </div>
            </div>

        </div>
    )
}

export default Snippets;