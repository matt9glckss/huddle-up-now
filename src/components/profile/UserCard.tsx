import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, AtSign } from 'lucide-react';

interface UserCardProps {
  full_name: string;
  username?: string;
  avatar_url?: string;
  status?: string;
  location?: string;
  bio?: string;
  size?: 'sm' | 'md' | 'lg';
  showBio?: boolean;
  className?: string;
}

export const UserCard = ({
  full_name,
  username,
  avatar_url,
  status,
  location,
  bio,
  size = 'md',
  showBio = false,
  className = '',
}: UserCardProps) => {
  const avatarSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className={avatarSizes[size]}>
            <AvatarImage src={avatar_url} alt={full_name} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground font-medium">
              {full_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold truncate ${textSizes[size]}`}>
                {full_name}
              </h3>
              {status && (
                <Badge variant="secondary" className="text-xs">
                  {status}
                </Badge>
              )}
            </div>
            
            {username && (
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <AtSign className="h-3 w-3" />
                <span className="text-sm">{username}</span>
              </div>
            )}
            
            {location && (
              <div className="flex items-center gap-1 text-muted-foreground mb-2">
                <MapPin className="h-3 w-3" />
                <span className="text-sm">{location}</span>
              </div>
            )}
            
            {showBio && bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {bio}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface UserAvatarProps {
  full_name: string;
  avatar_url?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserAvatar = ({
  full_name,
  avatar_url,
  size = 'md',
  className = '',
}: UserAvatarProps) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  return (
    <Avatar className={`${sizes[size]} ${className}`}>
      <AvatarImage src={avatar_url} alt={full_name} />
      <AvatarFallback className="bg-gradient-primary text-primary-foreground font-medium text-xs">
        {full_name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};