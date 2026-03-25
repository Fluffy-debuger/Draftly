import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Cpu, MemoryStick} from 'lucide-react';

const ResourceIndicator = () => {
  const [data] = useState({
    container_id: "fc1ad713eb33",
    started_at: "2026-02-06T09:27:14.438883",
    cpu_usage: 13.3,
    memory_usage: {
      total: 16447311872,
      available: 9238003712,
      percent: 43.8,
      used: 5402062848,
      free: 1890811904
    }
  });
  const formatBytes = (bytes) => {
    const gb = bytes / (1024 ** 3);
    return gb.toFixed(1) + ' GB';
  };

  const [uptime, setUptime] = useState('');

  useEffect(() => {
    const updateUptime = () => {
      const started = new Date(data.started_at);
      const now = new Date();
      const diffMs = now.getTime() - started.getTime();
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      setUptime(`${hours}h ${minutes}m`);
    };

    updateUptime();
    const interval = setInterval(updateUptime, 60000);
    return () => clearInterval(interval);
  }, [data.started_at]);

  return (
    <TooltipProvider>
      <Card className="shadow-lg border-0 bg-white">
        <CardContent className="p-3">
          <div className="flex flex-col  justify-between gap-4 m-0.5 text-sm">

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MemoryStick className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-800">RAM</span>
                    <Badge variant="secondary" className="text-xs">
                      {data.memory_usage.percent}%
                    </Badge>
                  </div>
                  <Progress value={data.memory_usage.percent} className="h-2" />
                  
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Used: {formatBytes(data.memory_usage.used)}<br />
                   Free: {formatBytes(data.memory_usage.free)}<br />
                   Available: {formatBytes(data.memory_usage.available)}</p>
              </TooltipContent>
            </Tooltip>
            

         
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Cpu className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-800">CPU</span>
                    <Badge variant="secondary" className="text-xs">
                      {data.cpu_usage}%
                    </Badge>
                  </div>
                  <Progress value={data.cpu_usage} className="h-2" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>CPU Usage: {data.cpu_usage}%</p>
              </TooltipContent>
            </Tooltip>

            
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default ResourceIndicator;