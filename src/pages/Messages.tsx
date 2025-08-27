import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MessageCircle, Users, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { UserAvatar } from '@/components/profile/UserCard';

interface Group {
  id: string;
  name: string;
  description: string;
  latest_message?: {
    content: string;
    created_at: string;
    profiles: {
      full_name: string;
      avatar_url?: string;
    };
  };
  unread_count?: number;
}

const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupsWithMessages();
  }, [user]);

  const fetchGroupsWithMessages = async () => {
    try {
      // Fetch groups user is member of
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select(`
          id, 
          name, 
          description
        `)
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;

      // For each group, fetch the latest message
      const processedGroups = await Promise.all(
        (groupsData || []).map(async (group) => {
          const { data: latestMessageData } = await supabase
            .from('messages')
            .select('content, created_at, user_id')
            .eq('group_id', group.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          let messageWithProfile = null;
          if (latestMessageData) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('user_id', latestMessageData.user_id)
              .single();

            messageWithProfile = {
              content: latestMessageData.content,
              created_at: latestMessageData.created_at,
              profiles: profileData || { full_name: 'Unknown User' }
            };
          }

          return {
            id: group.id,
            name: group.name,
            description: group.description,
            latest_message: messageWithProfile,
            unread_count: 0,
          };
        })
      );

      setGroups(processedGroups);
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      toast({
        title: "Error loading messages",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Card className="border-0 shadow-elegant bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Messages</CardTitle>
                    <p className="text-muted-foreground">Chat with your groups</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {groups.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No conversations yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Join or create a group to start chatting with friends
                  </p>
                  <Button 
                    onClick={() => navigate('/groups/new')}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      onClick={() => navigate(`/groups/${group.id}`)}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-background/30 hover:bg-background/50 cursor-pointer transition-colors"
                    >
                      {group.latest_message?.profiles ? (
                        <UserAvatar 
                          full_name={group.latest_message.profiles.full_name}
                          avatar_url={group.latest_message.profiles.avatar_url}
                          size="lg"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-medium">
                          {group.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-foreground truncate">{group.name}</h3>
                          {group.latest_message && (
                            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                              {formatDistanceToNow(new Date(group.latest_message.created_at), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        
                        {group.latest_message ? (
                          <p className="text-sm text-muted-foreground truncate">
                            <span className="font-medium">{group.latest_message.profiles?.full_name}:</span>{' '}
                            {group.latest_message.content}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">No messages yet</p>
                        )}
                      </div>

                      {group.unread_count && group.unread_count > 0 && (
                        <Badge variant="default" className="bg-primary text-primary-foreground">
                          {group.unread_count}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;