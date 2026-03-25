import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
function StorageSetting(params) {
    return(
       <div className=" ">
            <div>
                <label className="block text-sm font-medium mb-1">Mount storage</label>
                <Select defaultValue="light">
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">gdrive</SelectItem>
                        <SelectItem value="dark">onedrive</SelectItem>
                        <SelectItem value="system">custom</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <Separator className="my-6" />

              <div className="flex justify-end space-x-2">
               
                <Button>Save</Button>
              </div>
        </div>
    )
    
}

export default StorageSetting;