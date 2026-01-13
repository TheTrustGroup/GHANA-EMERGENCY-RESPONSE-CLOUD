'use client';

/**
 * StatusUpdateDialog Component
 * Dialog for changing incident status
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IncidentStatus } from '@prisma/client';
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
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc/client';

const statusUpdateSchema = z.object({
  status: z.nativeEnum(IncidentStatus),
  notes: z.string().min(1, 'Notes are required'),
});

type StatusUpdateForm = z.infer<typeof statusUpdateSchema>;

interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incidentId: string;
  currentStatus: IncidentStatus;
  userRole: string;
  onSuccess?: () => void;
}

// Define valid status transitions
const getValidNextStatuses = (currentStatus: IncidentStatus, userRole: string): IncidentStatus[] => {
  switch (currentStatus) {
    case IncidentStatus.REPORTED:
      // Only dispatchers+ can dispatch
      if (['DISPATCHER', 'AGENCY_ADMIN', 'SYSTEM_ADMIN'].includes(userRole)) {
        return [IncidentStatus.DISPATCHED, IncidentStatus.IN_PROGRESS];
      }
      return [];

    case IncidentStatus.DISPATCHED:
      return [IncidentStatus.IN_PROGRESS, IncidentStatus.RESOLVED];

    case IncidentStatus.IN_PROGRESS:
      // Responders+ or Agency Admins+ can resolve
      if (['RESPONDER', 'AGENCY_ADMIN', 'SYSTEM_ADMIN'].includes(userRole)) {
        return [IncidentStatus.RESOLVED];
      }
      return [];

    case IncidentStatus.RESOLVED:
      // Agency Admins+ can close
      if (['AGENCY_ADMIN', 'SYSTEM_ADMIN'].includes(userRole)) {
        return [IncidentStatus.CLOSED];
      }
      return [];

    case IncidentStatus.CLOSED:
      return []; // Cannot change from closed

    default:
      return [];
  }
};

export function StatusUpdateDialog({
  open,
  onOpenChange,
  incidentId,
  currentStatus,
  userRole,
  onSuccess,
}: StatusUpdateDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<StatusUpdateForm>({
    resolver: zodResolver(statusUpdateSchema) as any,
    defaultValues: {
      status: currentStatus,
      notes: '',
    },
  });

  const utils = trpc.useUtils();
  const updateStatus = trpc.incidents.updateStatus.useMutation({
    onSuccess: () => {
      toast({
        title: 'Status updated',
        description: 'Incident status has been updated successfully.',
      });
      utils.incidents.getById.invalidate({ id: incidentId });
      utils.incidents.getAll.invalidate();
      reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    },
  });

  const validStatuses = getValidNextStatuses(currentStatus, userRole);
  const selectedStatus = watch('status');

  const onSubmit = async (data: StatusUpdateForm) => {
    setIsSubmitting(true);
    updateStatus.mutate({
      id: incidentId,
      status: data.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Incident Status</DialogTitle>
          <DialogDescription>
            Change the status of this incident. Current status: <strong>{currentStatus}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="status">New Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setValue('status', value as IncidentStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {validStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
            {validStatuses.length === 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                No valid status transitions available for your role.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes *</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Explain why the status is being changed..."
              rows={4}
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || validStatuses.length === 0}>
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

