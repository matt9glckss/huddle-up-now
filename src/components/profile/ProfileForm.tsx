import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AvatarUpload } from './AvatarUpload';
import { useProfile } from '@/hooks/useProfile';
import { Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export const ProfileForm = () => {
  const { profile, loading, updating, updateProfile, uploadAvatar, checkUsernameAvailability } = useProfile();
  
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    status: '',
    bio: '',
    location: '',
  });
  
  const [usernameStatus, setUsernameStatus] = useState<'checking' | 'available' | 'taken' | 'idle'>('idle');
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        status: profile.status || '',
        bio: profile.bio || '',
        location: profile.location || '',
      });
    }
  }, [profile]);

  const checkUsername = async (username: string) => {
    if (!username || username === profile?.username) {
      setUsernameStatus('idle');
      return;
    }

    // Basic username validation
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    const isAvailable = await checkUsernameAvailability(username);
    setUsernameStatus(isAvailable ? 'available' : 'taken');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'username') {
      const timeoutId = setTimeout(() => checkUsername(value), 500);
      return () => clearTimeout(timeoutId);
    }
  };

  const handleAvatarChange = (file: File) => {
    setPendingAvatar(file);
  };

  const handlePresetSelect = (presetUrl: string) => {
    // This would be handled by the AvatarUpload component
    // The preset is converted to a File object there
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;

    try {
      let avatarUrl = profile.avatar_url;
      
      // Upload avatar if there's a pending one
      if (pendingAvatar) {
        setAvatarUploading(true);
        avatarUrl = await uploadAvatar(pendingAvatar);
        setPendingAvatar(null);
      }

      // Update profile
      await updateProfile({
        ...formData,
        avatar_url: avatarUrl,
      });

      setAvatarUploading(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      setAvatarUploading(false);
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            currentAvatar={profile?.avatar_url}
            displayName={formData.full_name || 'User'}
            onAvatarChange={handleAvatarChange}
            onPresetSelect={handlePresetSelect}
            uploading={avatarUploading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Display Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Enter your display name"
              required
            />
            <p className="text-sm text-muted-foreground">
              This name will be shown in chats and events
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                @
              </div>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Choose a unique username"
                className="pl-8 pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {usernameStatus === 'available' && (
                  <Check className="h-4 w-4 text-success" />
                )}
                {usernameStatus === 'taken' && (
                  <X className="h-4 w-4 text-destructive" />
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Used for invites and searching. 3-20 characters, letters, numbers, - and _ only.
            </p>
            {usernameStatus === 'taken' && (
              <p className="text-sm text-destructive">This username is already taken</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Input
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              placeholder="e.g., Available this weekend, Busy"
              maxLength={100}
            />
            <p className="text-sm text-muted-foreground">
              Let others know your availability
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="City, Country"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell others about yourself..."
              className="min-h-[100px]"
              maxLength={500}
            />
            <p className="text-sm text-muted-foreground">
              {formData.bio.length}/500 characters
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button 
          type="submit" 
          disabled={updating || avatarUploading || usernameStatus === 'taken'}
          className="gap-2"
        >
          {(updating || avatarUploading) && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Profile
        </Button>
      </div>
    </form>
  );
};