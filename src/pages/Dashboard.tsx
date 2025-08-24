import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Calendar, 
  Plus, 
  MessageCircle, 
  MapPin, 
  Clock,
  LogOut,
  Settings
} from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

interface Group {
  id: string;
  name: string;
  description: string;
  created_at: string;
  member_count?: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  group_name: string;
  rsvp_count?: number;
  user_rsvp?: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
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

      // Process groups data to include member count
      const processedGroups = groupsData?.map(group => ({
        ...group,
        member_count: group.group_members?.[0]?.count || 0
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
        .limit(5);

      if (eventsError) throw eventsError;

      // Process events data
      const processedEvents = eventsData?.map(event => ({
        ...event,
        group_name: event.groups?.name || 'Unknown Group',
        rsvp_count: event.rsvps?.length || 0,
        user_rsvp: event.rsvps?.find((rsvp: any) => rsvp.user_id === user?.id)?.status
      })) || [];

      setUpcomingEvents(processedEvents);
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
      return format(date, 'MMM d, yyyy \'at\' h:mm a');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out successfully",
      description: "See you next time!"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Huddle Up</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.user_metadata?.full_name || 'Friend'}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Button className="h-20 bg-gradient-primary hover:opacity-90 shadow-glow flex-col gap-2">
                <Plus className="w-6 h-6" />
                Create Group
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Calendar className="w-6 h-6" />
                New Event
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <MessageCircle className="w-6 h-6" />
                Messages
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Users className="w-6 h-6" />
                Find Friends
              </Button>
            </div>
          </div>

          {/* My Groups */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  My Groups
                </CardTitle>
                <CardDescription>
                  Groups you're part of
                </CardDescription>
              </CardHeader>
              <CardContent>
                {groups.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No groups yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first group to start planning events with friends</p>
                    <Button className="bg-gradient-primary hover:opacity-90">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Group
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groups.map((group) => (
                      <div key={group.id} className="flex items-center justify-between p-4 rounded-lg border bg-white/50">
                        <div>
                          <h3 className="font-medium text-foreground">{group.name}</h3>
                          <p className="text-sm text-muted-foreground">{group.description}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {group.member_count} members
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Created {format(parseISO(group.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">View</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div>
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>
                  Events you're invited to
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No events yet</h3>
                    <p className="text-muted-foreground mb-4">Create or join a group to start planning events</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="p-4 rounded-lg border bg-white/50">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-foreground">{event.title}</h3>
                          {event.user_rsvp && (
                            <Badge variant={
                              event.user_rsvp === 'yes' ? 'default' : 
                              event.user_rsvp === 'maybe' ? 'secondary' : 'outline'
                            }>
                              {event.user_rsvp}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{event.group_name}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatEventDate(event.event_date)}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </span>
                          )}
                        </div>
                        {event.rsvp_count > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {event.rsvp_count} people responded
                          </p>
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
    </div>
  );
};

export default Dashboard;