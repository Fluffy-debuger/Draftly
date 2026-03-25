import React from 'react'
import SystemStatusInfo from './containerStatusinfo'
import ResourceIndicator from '../utlities/usagemonitor'

function StatusBar() {
  return (
    <footer className="statusfoot w-full h-8 bg-muted text-xs text-muted-foreground px-4 flex justify-between items-center border-t">
      <div>
        Python 3.11 | Docker Kernel
      </div>
      <div className="flex items-center gap-3">
        <button>📄 Logs</button>
        <button>💻 Terminal</button>
      </div>
    </footer>
  )
}

export default StatusBar
