import { useState } from "react";
import { useGet, usePost } from "@/hooks/useApi";
import { useRealtime } from "@/hooks/useRealtime";
import { 
  Play, 
  Square, 
  Settings2, 
  Users, 
  Trophy, 
  Activity,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function AdminEventControl() {
  // Get active event status
  const { data: eventStatus, refetch } = useGet<any>(['event-status'], '/event-control/status');
  const controlMutation = usePost('/event-control/update', [['event-status']]);

  // Realtime updates
  const { lastData: realtimeStatus } = useRealtime('event-status-update', (data) => {
    console.log('Realtime update:', data);
  });

  const currentStatus = realtimeStatus || eventStatus;

  const handleToggleEvent = async (action: 'start' | 'stop') => {
    try {
      await controlMutation.mutateAsync({ action });
      toast.success(`Event ${action === 'start' ? 'started' : 'stopped'} successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} event`);
    }
  };

  if (!currentStatus) {
    return <div className="p-8 text-center text-muted-foreground">Loading event control...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Event Control Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage real-time operations for the current exhibition</p>
        </div>
        <Badge variant={currentStatus.isActive ? "default" : "secondary"} className="h-6">
          {currentStatus.isActive ? "● Live Now" : "Inactive"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Main Controls */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              Operations
            </CardTitle>
            <CardDescription>Control the event lifecycle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              {!currentStatus.isActive ? (
                <Button 
                  size="lg" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleToggleEvent('start')}
                >
                  <Play className="mr-2 h-4 w-4" /> Start Event
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => handleToggleEvent('stop')}
                >
                  <Square className="mr-2 h-4 w-4" /> Stop Event
                </Button>
              )}
              <Button variant="outline" className="w-full">
                <Activity className="mr-2 h-4 w-4" /> Reset Real-time Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Judging Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Judging Progress
            </CardTitle>
            <CardDescription>{currentStatus.judgedCount || 0} of {currentStatus.totalCount || 0} entries judged</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">{Math.round((currentStatus.judgedCount / currentStatus.totalCount) * 100 || 0)}%</span>
              </div>
              <Progress value={(currentStatus.judgedCount / currentStatus.totalCount) * 100 || 0} className="h-2" />
            </div>
            <div className="flex gap-4 pt-2">
              <div className="text-center flex-1">
                <div className="text-2xl font-bold">{currentStatus.inQueue || 0}</div>
                <div className="text-[10px] uppercase text-muted-foreground">In Queue</div>
              </div>
              <div className="text-center flex-1 border-x">
                <div className="text-2xl font-bold text-emerald-600">{currentStatus.judgedCount || 0}</div>
                <div className="text-[10px] uppercase text-muted-foreground">Done</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-2xl font-bold text-amber-600">{currentStatus.pendingCount || 0}</div>
                <div className="text-[10px] uppercase text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              System Status
            </CardTitle>
            <CardDescription>Real-time system health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">WebSocket Server</span>
                <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Judges</span>
                <span className="text-sm font-medium">{currentStatus.activeJudges || 0} Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Public Viewers</span>
                <span className="text-sm font-medium">{currentStatus.publicViewers || 0} Live</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts/Activity */}
      <Card>
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: "2 mins ago", msg: "Judging completed for entry #104", type: "success" },
              { time: "5 mins ago", msg: "Judge 'Budi' logged in", type: "info" },
              { time: "12 mins ago", msg: "New participant checked in", type: "info" },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 border-b last:border-0 pb-3 last:pb-0">
                {log.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-medium">{log.msg}</p>
                  <p className="text-xs text-muted-foreground">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
