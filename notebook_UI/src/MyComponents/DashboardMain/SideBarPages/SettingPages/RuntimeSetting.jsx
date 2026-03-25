import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
function RuntimeSetting(params) {
    return(
          <div className=" ">
            <div>
                <label className="block text-sm font-medium mb-1">Runtime</label>
                <Select defaultValue="light">
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">Local runtime</SelectItem>
                        <SelectItem value="dark">Remote runtime</SelectItem>
                        <SelectItem value="system">Container runtime</SelectItem>
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

export default RuntimeSetting;