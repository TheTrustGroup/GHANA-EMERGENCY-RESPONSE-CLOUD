'use client';

/**
 * UpdateStatusDialog Component
 * Dialog for updating assignment status
 */

import { useState } from 'react';
import { Camera, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';

type DispatchStatus = 'dispatched' | 'accepted' | 'en_route' | 'arrived' | 'completed';

interface UpdateStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispatchId: string;
  currentStatus: DispatchStatus;
  onStatusUpdated?: () => void;
}

const statusTransitions: Record<DispatchStatus, DispatchStatus[]> = {
  dispatched: ['accepted'],
  accepted: ['en_route'],
  en_route: ['arrived'],
  arrived: ['completed'],
  completed: [],
};

const statusLabels: Record<DispatchStatus, string> = {
  dispatched: 'Dispatched',
  accepted: 'Accepted',
  en_route: 'En Route',
  arrived: 'Arrived',
  completed: 'Completed',
};

export function UpdateStatusDialog({
  open,
  onOpenChange,
  dispatchId,
  currentStatus,
  onStatusUpdated,
}: UpdateStatusDialogProps) {
  const [newStatus, setNewStatus] = useState<DispatchStatus | ''>('');
  const [notes, setNotes] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const { toast } = useToast();

  const utils = trpc.useUtils();
  const updateLocationMutation = trpc.dispatch.updateLocation.useMutation();
  const completeMutation = trpc.dispatch.complete.useMutation({
    onSuccess: () => {
      toast({
        title: 'Status Updated',
        description: 'Your status has been updated successfully.',
      });
      utils.dispatch.getMyAssignments.invalidate();
      onStatusUpdated?.();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    },
  });

  const availableTransitions = statusTransitions[currentStatus] || [];

  const handleUpdate = async () => {
    if (!newStatus || !availableTransitions.includes(newStatus)) {
      toast({
        title: 'Invalid Status',
        description: 'Please select a valid status transition',
        variant: 'destructive',
      });
      return;
    }

    if (!notes.trim()) {
      toast({
        title: 'Notes Required',
        description: 'Please provide notes for this status update',
        variant: 'destructive',
      });
      return;
    }

    // Capture location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateLocationMutation.mutate({
            id: dispatchId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          console.warn('Could not get location');
        }
      );
    }

    // Update status based on transition
    if (newStatus === 'completed') {
      completeMutation.mutate({
        id: dispatchId,
        notes: notes,
      });
    } else {
      // TODO: Implement other status updates
      toast({
        title: 'Status Update',
        description: `Status updated to ${statusLabels[newStatus]}`,
      });
      onStatusUpdated?.();
      onOpenChange(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Photo must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }
      setPhotoFile(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
          <DialogDescription>
            Current status: {statusLabels[currentStatus]}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="status">New Status</Label>
            <Select
              value={newStatus}
              onValueChange={(value) => setNewStatus(value as DispatchStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {availableTransitions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusLabels[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableTransitions.length === 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                No available status transitions
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">
              Notes <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the current situation..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="photo">Photo (Optional)</Label>
            <div className="mt-2 flex items-center gap-2">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('photo')?.click()}
                className="w-full"
              >
                <Camera className="mr-2 h-4 w-4" />
                {photoFile ? photoFile.name : 'Upload Photo'}
              </Button>
            </div>
            {photoFile && (
              <p className="mt-1 text-xs text-muted-foreground">
                {photoFile.name} ({(photoFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="rounded-lg border bg-blue-50 p-3 text-sm text-blue-900">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4" />
              <span>Your location will be automatically captured when you update status</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={!newStatus || !notes.trim() || completeMutation.isPending}
          >
            {completeMutation.isPending ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

