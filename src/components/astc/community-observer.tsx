'use client';

import { useState } from 'react';
import { CommunityReport, BusRoute, TrafficZone } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  AlertTriangle, 
  Clock, 
  Car, 
  Wrench, 
  CloudRain, 
  AlertCircle,
  Plus,
  ThumbsUp,
  MapPin,
  Bus,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CommunityObserverProps {
  reports: CommunityReport[];
  routes: BusRoute[];
  trafficZones: TrafficZone[];
  onReportSubmit: (report: {
    busId: string | null;
    reportType: string;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    delayMinutes: number;
    trafficZoneId: string | null;
  }) => Promise<void>;
}

const reportTypes = [
  { value: 'DELAY', label: 'Delay', icon: Clock, color: 'text-amber-600' },
  { value: 'TRAFFIC_JAM', label: 'Traffic Jam', icon: Car, color: 'text-red-600' },
  { value: 'BREAKDOWN', label: 'Breakdown', icon: Wrench, color: 'text-gray-600' },
  { value: 'ACCIDENT', label: 'Accident', icon: AlertTriangle, color: 'text-red-700' },
  { value: 'ROAD_BLOCK', label: 'Road Block', icon: AlertCircle, color: 'text-orange-600' },
  { value: 'WEATHER', label: 'Weather', icon: CloudRain, color: 'text-blue-600' },
  { value: 'OTHER', label: 'Other', icon: AlertCircle, color: 'text-gray-500' },
];

const reportTypeIcons: Record<string, React.ElementType> = {
  DELAY: Clock,
  TRAFFIC_JAM: Car,
  BREAKDOWN: Wrench,
  ACCIDENT: AlertTriangle,
  ROAD_BLOCK: AlertCircle,
  WEATHER: CloudRain,
  OTHER: AlertCircle,
};

export function CommunityObserver({ reports, routes, trafficZones, onReportSubmit }: CommunityObserverProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    busId: '',
    reportType: 'DELAY',
    title: '',
    description: '',
    delayMinutes: 0,
    trafficZoneId: '',
    latitude: 26.1750,
    longitude: 91.7400,
  });

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onReportSubmit({
        ...formData,
        busId: formData.busId || null,
        trafficZoneId: formData.trafficZoneId || null,
      });
      setIsDialogOpen(false);
      setFormData({
        busId: '',
        reportType: 'DELAY',
        title: '',
        description: '',
        delayMinutes: 0,
        trafficZoneId: '',
        latitude: 26.1750,
        longitude: 91.7400,
      });
      toast.success('Report submitted!', {
        description: 'Thank you for helping fellow commuters. Your report has been recorded.',
      });
    } catch (error) {
      toast.error('Failed to submit report', {
        description: 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Community Observer
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-1" />
                Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Report an Issue</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Report Type</Label>
                  <Select
                    value={formData.reportType}
                    onValueChange={(v) => setFormData({ ...formData, reportType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className={cn("w-4 h-4", type.color)} />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Bus (Optional)</Label>
                  <Select
                    value={formData.busId}
                    onValueChange={(v) => setFormData({ ...formData, busId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a bus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No specific bus</SelectItem>
                      {routes.flatMap(r => r.buses).map((bus) => (
                        <SelectItem key={bus.id} value={bus.id}>
                          {bus.busNumber} ({routes.find(r => r.id === bus.routeId)?.routeNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Location / Traffic Zone</Label>
                  <Select
                    value={formData.trafficZoneId}
                    onValueChange={(v) => setFormData({ ...formData, trafficZoneId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone or skip" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not in a known zone</SelectItem>
                      {trafficZones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Brief description of the issue"
                  />
                </div>

                <div>
                  <Label>Details (Optional)</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="More details about the situation..."
                    rows={3}
                  />
                </div>

                {formData.reportType === 'DELAY' && (
                  <div>
                    <Label>Estimated Delay (minutes)</Label>
                    <Input
                      type="number"
                      value={formData.delayMinutes}
                      onChange={(e) => setFormData({ ...formData, delayMinutes: parseInt(e.target.value) || 0 })}
                      min={0}
                      max={120}
                    />
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={!formData.title.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full overflow-y-auto">
          {reports.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent reports</p>
              <p className="text-xs mt-1">Be the first to report an issue!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {reports.map((report) => {
                const Icon = reportTypeIcons[report.reportType] || AlertCircle;
                return (
                  <div key={report.id} className="p-3 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900 truncate">
                            {report.title}
                          </span>
                          <Badge variant="outline" className="text-[10px] flex-shrink-0">
                            {report.reportType.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        {report.description && (
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                            {report.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            {report.bus && (
                              <span className="flex items-center gap-1">
                                <Bus className="w-3 h-3" />
                                {report.bus.busNumber}
                              </span>
                            )}
                            <span>{formatTimeAgo(report.createdAt)}</span>
                          </div>
                          
                          {report.delayMinutes > 0 && (
                            <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700">
                              +{report.delayMinutes} min
                            </Badge>
                          )}
                        </div>

                        {report.trafficZone && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {report.trafficZone.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
