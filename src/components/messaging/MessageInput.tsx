'use client';

/**
 * MessageInput Component
 * Input area for sending messages
 */

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface MessageInputProps {
  onSend: (content: string, mediaUrls?: string[]) => void;
  onTyping?: () => void;
  maxLength?: number;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  onTyping,
  maxLength = 1000,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSend = () => {
    if (!content.trim() && mediaFiles.length === 0) return;

    // TODO: Upload media files to S3 and get URLs
    const mediaUrls: string[] = [];

    onSend(content.trim(), mediaUrls.length > 0 ? mediaUrls : undefined);
    setContent('');
    setMediaFiles([]);
    setMediaPreviews([]);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast({
        title: 'Invalid file type',
        description: 'Only image files are supported',
        variant: 'destructive',
      });
      return;
    }

    if (imageFiles.length + mediaFiles.length > 5) {
      toast({
        title: 'Too many files',
        description: 'Maximum 5 images allowed',
        variant: 'destructive',
      });
      return;
    }

    const newFiles = [...mediaFiles, ...imageFiles];
    setMediaFiles(newFiles);

    // Create previews
    const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));
    setMediaPreviews([...mediaPreviews, ...newPreviews]);
  };

  const removeMedia = (index: number) => {
    const newFiles = [...mediaFiles];
    const newPreviews = [...mediaPreviews];
    
    URL.revokeObjectURL(newPreviews[index]);
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setMediaFiles(newFiles);
    setMediaPreviews(newPreviews);
  };

  const handleTyping = () => {
    if (onTyping) {
      onTyping();
    }
  };

  const remainingChars = maxLength - content.length;

  return (
    <div className="border-t bg-white p-4">
      {/* Media Previews */}
      {mediaPreviews.length > 0 && (
        <div className="mb-3 flex gap-2 overflow-x-auto">
          {mediaPreviews.map((preview, index) => (
            <div key={index} className="relative flex-shrink-0">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="h-20 w-20 rounded-lg object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                onClick={() => removeMedia(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2 items-end">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              if (e.target.value.length <= maxLength) {
                setContent(e.target.value);
                handleTyping();
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="min-h-[44px] max-h-32 resize-none pr-12"
          />
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {remainingChars}
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={disabled || (!content.trim() && mediaFiles.length === 0)}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-2 text-xs text-muted-foreground text-center">
        Press Ctrl+Enter to send
      </div>
    </div>
  );
}

