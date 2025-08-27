import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Upload, User } from 'lucide-react';
import { toast } from 'sonner';

interface AvatarUploadProps {
  currentAvatar?: string;
  displayName: string;
  onAvatarChange: (file: File) => void;
  onPresetSelect: (presetUrl: string) => void;
  uploading?: boolean;
}

const PRESET_AVATARS = [
  '👤', '🧑‍💼', '👩‍💻', '🧑‍🎓', '👨‍🎨', '👩‍🔬',
  '🧑‍🍳', '👨‍⚕️', '👩‍🏫', '🧑‍🌾', '👨‍🚀', '👩‍🎤',
  '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️', '🧚‍♂️', '🧚‍♀️',
  '🐶', '🐱', '🐼', '🦊', '🐸', '🦄'
];

export const AvatarUpload = ({ 
  currentAvatar, 
  displayName, 
  onAvatarChange, 
  onPresetSelect,
  uploading = false 
}: AvatarUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onAvatarChange(file);
  };

  const handlePresetSelect = (emoji: string) => {
    // Create a simple emoji avatar URL (you could use a service to generate these)
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, 200, 200);
      ctx.font = '120px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 100, 100);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'avatar.png', { type: 'image/png' });
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
          onAvatarChange(file);
        }
      });
    }
  };

  const displayAvatar = previewUrl || currentAvatar;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-primary/20">
            <AvatarImage 
              src={displayAvatar} 
              alt={displayName}
              className="object-cover"
            />
            <AvatarFallback className="text-xl font-medium bg-gradient-primary text-primary-foreground">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <Button
            size="icon"
            variant="secondary"
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-md"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Photo
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <Card className="p-4">
        <h3 className="text-sm font-medium mb-3">Choose a preset avatar:</h3>
        <div className="grid grid-cols-6 gap-2">
          {PRESET_AVATARS.map((emoji, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="h-12 w-12 text-2xl hover:bg-accent"
              onClick={() => handlePresetSelect(emoji)}
              disabled={uploading}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};