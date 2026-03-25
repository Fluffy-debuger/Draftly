import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'

function EditorSetting(params) {
    return (
        <div className="space-y-4 ">
            <div>
                <label className="block text-sm font-medium mb-1">Font-Size (px) </label>
                <Select defaultValue="light">
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Font Family</label>
                <Select defaultValue="light">
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">  </label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="notifications" />
                <label htmlFor="notifications">Show desktop notifications for completed executions</label>
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox id="private-outputs" />
                <label htmlFor="private-outputs">New notebooks use private outputs</label>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Default page layout</label>
                <Select defaultValue="vertical">
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select layout" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="vertical">Vertical</SelectItem>
                        <SelectItem value="horizontal">Horizontal</SelectItem>
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

export default EditorSetting;