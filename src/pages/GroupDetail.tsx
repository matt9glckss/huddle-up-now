import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MessageCircle, Calendar, Users, Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { UserAvatar } from '@/components/profile/UserCard';

interface Group {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  created_at: string;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
  };
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  creator_id: string;
}

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'events'>('chat');

  useEffect(() => {
    if (id) {
      fetchGroupData();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      // Set up realtime subscription for messages
      const channel = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `group_id=eq.${id}`,
          },
          (payload) => {
            const newMessage = payload.new as Message;
            setMessages((prev) => [...prev, newMessage]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [id]);

  const fetchGroupData = async () => {
    try {
      // Fetch group details
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();

      if (groupError) throw groupError;
      setGroup(groupData);

      // Fetch messages with user information separately
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('group_id', id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Fetch user profiles for messages
      const userIds = [...new Set(messagesData?.map(m => m.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Combine messages with profile data
      const messagesWithProfiles = messagesData?.map(message => ({
        ...message,
        profiles: profilesData?.find(p => p.user_id === message.user_id) || { full_name: 'Unknown User' }
      })) || [];

      setMessages(messagesWithProfiles);

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('group_id', id)
        .order('event_date', { ascending: true });

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);

    } catch (error: any) {
      console.error('Error fetching group data:', error);
      toast({
        title: "Error loading group",
        description: error.message,
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            content: newMessage.trim(),
            group_id: id,
            user_id: user?.id,
          }
        ]);

      if (error) throw error;

      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading group...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Group not found</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
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
          
          {/* Group Header */}
          <Card className="mb-6 border-0 shadow-elegant bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{group.name}</CardTitle>
                  <p className="text-muted-foreground">{group.description}</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'chat' ? 'default' : 'outline'}
              onClick={() => setActiveTab('chat')}
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </Button>
            <Button
              variant={activeTab === 'events' ? 'default' : 'outline'}
              onClick={() => setActiveTab('events')}
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </Button>
          </div>

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <Card className="border-0 shadow-elegant bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Group Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Messages */}
                <div className="h-96 overflow-y-auto mb-4 space-y-3 bg-background/30 rounded-lg p-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className="flex gap-3">
                        <UserAvatar 
                          full_name={message.profiles?.full_name || 'Unknown User'}
                          avatar_url={message.profiles?.avatar_url}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{message.profiles?.full_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-foreground break-words">{message.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={sendingMessage}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={sendingMessage || !newMessage.trim()}>
                    {sendingMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <Card className="border-0 shadow-elegant bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Group Events
                </CardTitle>
                <Button 
                  size="sm"
                  onClick={() => navigate(`/events/new?groupId=${group.id}`)}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  Create Event
                </Button>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No events yet</h3>
                    <p className="text-muted-foreground mb-4">Create the first event for this group</p>
                    <Button 
                      onClick={() => navigate(`/events/new?groupId=${group.id}`)}
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      Create Event
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="p-4 rounded-lg border bg-background/30">
                        <h3 className="font-medium text-foreground">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>
                            {new Date(event.event_date).toLocaleDateString()} at{' '}
                            {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {event.location && <span>📍 {event.location}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;