'use client';

/**
 * MediaUploader Component
 * Drag-and-drop file upload with preview and progress
 */

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { validateFile, compressImage, FileUploadProgress } from '@/lib/upload';
import { trpc } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@supabase/supabase-js';

interface MediaUploaderProps {
  maxFiles?: number;
  maxSizeMB?: number;
  value: string[];
  onChange: (urls: string[]) => void;
}

export function MediaUploader({ maxFiles = 5, maxSizeMB = 10, value, onChange }: MediaUploaderProps) {
  const [uploads, setUploads] = useState<FileUploadProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getPresignedUrl = trpc.upload.getPresignedUrl.useMutation();

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const remainingSlots = maxFiles - value.length;

      if (fileArray.length > remainingSlots) {
        toast({
          title: 'Too many files',
          description: `You can only upload ${remainingSlots} more file(s)`,
          variant: 'destructive',
        });
        return;
      }

      const newUploads: FileUploadProgress[] = [];

      for (const file of fileArray) {
        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
          toast({
            title: 'Invalid file',
            description: validation.error,
            variant: 'destructive',
          });
          continue;
        }

        // Compress if image
        let processedFile = file;
        if (file.type.startsWith('image/')) {
          try {
            processedFile = await compressImage(file);
          } catch (error) {
            console.error('Compression error:', error);
          }
        }

        const upload: FileUploadProgress = {
          file: processedFile,
          progress: 0,
          status: 'pending',
        };

        newUploads.push(upload);
        setUploads((prev) => [...prev, upload]);

        // Upload file
        uploadFile(processedFile);
      }
    },
    [maxFiles, value.length, toast]
  );

  const uploadFile = async (file: File) => {
    try {
      // Get upload path from backend
      const { filePath, fileUrl, supabaseUrl, bucketName } = await getPresignedUrl.mutateAsync({
        filename: file.name,
        contentType: file.type,
      });

      // Initialize Supabase client
      const supabase = createClient(
        supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      // Update progress to uploading
      setUploads((prev) =>
        prev.map((u) =>
          u.file === file ? { ...u, progress: 10, status: 'uploading' } : u
        )
      );

      // Upload to Supabase Storage
      // Note: Supabase doesn't support progress callbacks, so we simulate progress
      setUploads((prev) =>
        prev.map((u) =>
          u.file === file ? { ...u, progress: 50, status: 'uploading' } : u
        )
      );

      const { error } = await supabase.storage
        .from(bucketName || 'incident-reports')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        throw new Error(error.message);
      }

      // Upload successful
      const finalUrl = fileUrl || `${supabaseUrl}/storage/v1/object/public/${bucketName || 'incident-reports'}/${filePath}`;
      setUploads((prev) =>
        prev.map((u) =>
          u.file === file
            ? { ...u, progress: 100, status: 'success', url: finalUrl }
            : u
        )
      );
      onChange([...value, finalUrl]);
    } catch (error) {
      console.error('Upload error:', error);
      setUploads((prev) =>
        prev.map((u) =>
          u.file === file ? { ...u, status: 'error', error: 'Upload failed' } : u
        )
      );
      toast({
        title: 'Upload failed',
        description: 'Failed to get upload URL. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemove = (url: string) => {
    onChange(value.filter((u) => u !== url));
    setUploads((prev) => prev.filter((u) => u.url !== url));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {value.length < maxFiles && (
        <Card
          className={cn(
            'border-2 border-dashed p-8 text-center transition-colors',
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-sm font-medium">
            Drag and drop files here, or click to browse
          </p>
          <p className="mb-4 text-xs text-muted-foreground">
            Max {maxFiles} files, {maxSizeMB}MB each. Images and videos only.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            Select Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </Card>
      )}

      {/* Upload Progress */}
      {uploads.map((upload) => (
        <Card key={upload.file.name} className="p-4">
          <div className="flex items-center gap-4">
            {upload.file.type.startsWith('image/') ? (
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
            ) : (
              <Video className="h-10 w-10 text-muted-foreground" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">{upload.file.name}</p>
              {upload.status === 'uploading' && (
                <Progress value={upload.progress} className="mt-2" />
              )}
              {upload.status === 'error' && (
                <p className="mt-1 text-xs text-red-600">{upload.error}</p>
              )}
            </div>
            {upload.status === 'uploading' && (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            )}
            {upload.status === 'success' && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => upload.url && handleRemove(upload.url)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      ))}

      {/* Uploaded Files Preview */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {value.map((url) => (
            <Card key={url} className="group relative overflow-hidden">
              {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img src={url} alt="Upload" className="h-32 w-full object-cover" />
              ) : (
                <div className="flex h-32 items-center justify-center bg-gray-100">
                  <Video className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleRemove(url)}
              >
                <X className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

