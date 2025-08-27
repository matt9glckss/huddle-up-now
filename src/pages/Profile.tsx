import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { useAuth } from '@/contexts/AuthContext';

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // For now, only allow users to view/edit their own profile
  // In the future, this could be extended to view other users' profiles
  const isOwnProfile = !userId || userId === user?.id;

  if (!isOwnProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="space-y-4">
              <User className="h-16 w-16 text-muted-foreground mx-auto" />
              <h1 className="text-2xl font-bold">Profile Not Available</h1>
              <p className="text-muted-foreground">
                User profiles are coming soon!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
              <p className="text-muted-foreground">
                Manage your profile information and preferences
              </p>
            </div>
          </div>

          <ProfileForm />
        </div>
      </div>
    </div>
  );
};

export default Profile;