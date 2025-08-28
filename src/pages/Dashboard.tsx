import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Calendar, 
  Plus, 
  MessageCircle, 
  MapPin, 
  Clock,
  MoreHorizontal,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { format, isToday, isTomorrow, parseISO, formatDistanceToNow } from 'date-fns';

interface Group {
  id: string;
  name: string;
  description: string;
  created_at: string;
  member_count?: number;
  // Placeholder for future implementation
  unread_messages?: number;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  group_id: string;
  group_name: string;
  user_id: string;
  sender_name: string;
  sender_avatar_url?: string;
}

interface Event {
  id:string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  group_name: string;
  rsvp_count?: number;
  user_rsvp?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [todaysEvents, setTodaysEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch user's groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select(`
          *,
          group_members(count)
        `)
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;

      // Process groups data to include member count and placeholder unread messages
      const processedGroups = groupsData?.map(group => ({
        ...group,
        member_count: group.group_members?.[0]?.count || 0,
        // Placeholder data for unread messages badge
        unread_messages: Math.floor(Math.random() * 5) // Random number between 0 and 4
      })) || [];

      setGroups(processedGroups);

      // Fetch upcoming events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          groups(name),
          rsvps(status, user_id)
        `)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(10);

      if (eventsError) throw eventsError;

      // Process events data
      const processedEvents = eventsData?.map(event => ({
        ...event,
        group_name: event.groups?.name || 'Unknown Group',
        rsvp_count: event.rsvps?.length || 0,
        user_rsvp: event.rsvps?.find((rsvp: any) => rsvp.user_id === user?.id)?.status
      })) || [];

      // Separate today's events from other upcoming events
      const todays = processedEvents.filter(e => isToday(parseISO(e.event_date)));
      const upcoming = processedEvents.filter(e => !isToday(parseISO(e.event_date)));

      setTodaysEvents(todays);
      setUpcomingEvents(upcoming);

      // Temporarily set empty array - we'll implement proper messaging later
      setRecentMessages([]);

    } catch (error: any) {
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'E, MMM d, yyyy \'at\' h:mm a');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Home</h1>
          <div className="flex items-center gap-2">
            <Button size="sm" className="rounded-full" onClick={() => navigate('/events')}>
              <Plus className="h-4 w-4 mr-1" />
              Create Event
            </Button>
            <Button size="sm" variant="outline" className="rounded-full">
              <UserPlus className="h-4 w-4 mr-1" />
              Invite Friends
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        {/* Greeting */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hi {user?.user_metadata?.full_name?.split(' ')[0] || 'there'} 👋</h2>
          <p className="text-muted-foreground">Here’s what’s coming up for you.</p>
        </div>

        {/* Today's Events */}
        {todaysEvents.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Today's Events</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {todaysEvents.map(event => (
                <div key={event.id} className="bg-card border border-border/50 rounded-lg p-4 flex items-start gap-4 hover-bg cursor-pointer" onClick={() => navigate(`/events`)}>
                  <div className="bg-primary/10 text-primary h-12 w-12 flex-shrink-0 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.group_name}</p>
                    <div className="flex items-center gap-2 text-sm text-primary font-semibold mt-1">
                      <Clock className="h-4 w-4" />
                      <span>{format(parseISO(event.event_date), 'h:mm a')}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground self-center" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Upcoming Events Column */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xl font-bold">Upcoming Events</h3>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <div key={event.id} className="bg-card border border-border/50 rounded-lg p-4 flex items-center gap-4 hover-bg cursor-pointer" onClick={() => navigate(`/events`)}>
                  <div className="flex-shrink-0 text-center w-16">
                    <p className="font-bold text-lg">{format(parseISO(event.event_date), 'd')}</p>
                    <p className="text-sm text-muted-foreground uppercase">{format(parseISO(event.event_date), 'MMM')}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.group_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{format(parseISO(event.event_date), 'h:mm a')}</span>
                      {event.location && <span className='mx-1'>•</span>}
                      {event.location && <MapPin className="h-3 w-3" />}
                      {event.location && <span>{event.location}</span>}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-card border border-border/50 rounded-lg">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h4 className="mt-4 text-lg font-semibold">No upcoming events</h4>
                <p className="mt-1 text-sm text-muted-foreground">Check back later or create a new event.</p>
              </div>
            )}
          </div>

          {/* Active Groups Column */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-bold">Active Groups</h3>
            {groups.length > 0 ? (
              groups.slice(0, 5).map(group => (
                <div key={group.id} className="bg-card border border-border/50 rounded-lg p-4 flex items-center gap-4 hover-bg cursor-pointer" onClick={() => navigate(`/groups/${group.id}`)}>
                  <div className="bg-primary/10 text-primary h-10 w-10 flex-shrink-0 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{group.name}</p>
                    <p className="text-sm text-muted-foreground">{group.member_count} members</p>
                  </div>
                  {group.unread_messages && group.unread_messages > 0 && (
                    <div className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {group.unread_messages}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-card border border-border/50 rounded-lg">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h4 className="mt-4 text-lg font-semibold">No groups yet</h4>
                <p className="mt-1 text-sm text-muted-foreground">Create a group to get started.</p>
                <Button size="sm" className="mt-4 rounded-full" onClick={() => navigate('/groups')}>Create Group</Button>
              </div>
            )}
          </div>

          {/* Recent Messages Column */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xl font-bold">Recent Messages</h3>
            {recentMessages.length > 0 ? (
              recentMessages.map(message => (
                <div key={message.id} className="bg-card border border-border/50 rounded-lg p-4 flex items-start gap-4 hover-bg cursor-pointer" onClick={() => navigate(`/groups/${message.group_id}`)}>
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={message.sender_avatar_url} alt={message.sender_name} />
                    <AvatarFallback>{message.sender_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{message.sender_name}</p>
                        <p className="text-sm text-muted-foreground">in <span className="font-medium text-foreground">{message.group_name}</span></p>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDistanceToNow(parseISO(message.created_at), { addSuffix: true })}</p>
                    </div>
                    <p className="mt-2 text-foreground/80">{message.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-card border border-border/50 rounded-lg">
                <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h4 className="mt-4 text-lg font-semibold">No recent messages</h4>
                <p className="mt-1 text-sm text-muted-foreground">Messages from your groups will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;