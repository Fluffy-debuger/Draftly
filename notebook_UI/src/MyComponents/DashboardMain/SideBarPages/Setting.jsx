// components/SettingsDialog.tsx
'use client'

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'

const tabs = ["Site", "Editor", "AI Assistance", "Colab Pro", "GitHub", "Miscellaneous"]

export default function Settings() {
  const [activeTab, setActiveTab] = useState("Site")

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Settings</Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl h-[600px]">
        <DialogHeader>
          <DialogTitle>Settings 2</DialogTitle>
        </DialogHeader>

        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-1/4 border-r pr-2">
            {tabs.map((tab) => (
              <div
                key={tab}
                className={`cursor-pointer px-3 py-2 rounded hover:bg-muted ${
                  activeTab === tab ? "bg-muted font-semibold" : ""
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </div>
            ))}
          </div>

          {/* Settings content */}
          <div className="flex-1 pl-6 overflow-y-auto">
            {activeTab === "Site" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Theme</label>
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

                <div>
                  <label className="block text-sm font-medium mb-1">Custom snippet notebook URL</label>
                  <Input disabled placeholder="Custom snippet notebook URL" className="w-[300px]" />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="scratch-notebook" />
                  <label htmlFor="scratch-notebook">Use a temporary scratch notebook as the default landing page.</label>
                </div>
              </div>
            )}

            {activeTab !== "Site" && (
              <p className="text-muted-foreground">Settings for "{activeTab}" not implemented yet.</p>
            )}

            <Separator className="my-6" />

            <div className="flex justify-end space-x-2">
              <Button variant="ghost">Cancel</Button>
              <Button>Save</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
