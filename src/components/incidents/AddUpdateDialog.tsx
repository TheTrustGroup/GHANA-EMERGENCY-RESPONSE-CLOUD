'use client';

/**
 * AddUpdateDialog Component
 * Dialog for adding updates to incident
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { MediaUploader } from './MediaUploader';
import { trpc } from '@/lib/trpc/client';

const addUpdateSchema = z.object({
  updateType: z.enum(['general', 'responder', 'media']),
  content: z.string().min(1, 'Content is required'),
  mediaUrls: z.array(z.string().url()).optional().default([]),
});

type AddUpdateForm = z.infer<typeof addUpdateSchema>;

interface AddUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incidentId: string;
  onSuccess?: () => void;
}

export function AddUpdateDialog({
  open,
  onOpenChange,
  incidentId,
  onSuccess,
}: AddUpdateDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(addUpdateSchema) as any,
    defaultValues: {
      updateType: 'general' as 'general' | 'responder' | 'media',
      content: '',
      mediaUrls: [],
    },
  });

  const utils = trpc.useUtils();
  const addUpdate = trpc.incidents.addUpdate.useMutation({
    onSuccess: () => {
      toast({
        title: 'Update added',
        description: 'Your update has been added to the incident.',
      });
      utils.incidents.getUpdates.invalidate({ id: incidentId });
      utils.incidents.getById.invalidate({ id: incidentId });
      reset();
      onOpenChange(false);
      onSuccess?.();
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add update',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: AddUpdateForm) => {
    setIsSubmitting(true);
    addUpdate.mutate({
      incidentId,
      updateType: data.updateType,
      content: data.content,
      mediaUrls: data.mediaUrls,
    });
  };

  const updateType = watch('updateType');
  const mediaUrls = watch('mediaUrls');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Update</DialogTitle>
          <DialogDescription>
            Add an update to this incident timeline.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="updateType">Update Type</Label>
            <Select
              value={updateType}
              onValueChange={(value) => setValue('updateType', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Update</SelectItem>
                <SelectItem value="responder">Responder Update</SelectItem>
                <SelectItem value="media">Media Upload</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder="Describe the update..."
              rows={6}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          {updateType === 'media' && (
            <div>
              <Label>Media (Optional)</Label>
              <MediaUploader
                value={mediaUrls}
                onChange={(urls) => setValue('mediaUrls', urls as any)}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

