import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Plus, 
  Search,
  MoreHorizontal,
  Clock,
  MapPin,
  Users,
  X
} from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  created_at: string;
  creator_id: string;
  group_id: string;
  groups?: {
    name: string;
  };
  rsvp_count?: number;
  user_rsvp?: string;
}

interface Group {
  id: string;
  name: string;
}

const Events = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    group_id: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
    fetchGroups();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data: eventsData, error } = await supabase
        .from('events')
        .select(`
          *,
          groups(name),
          rsvps(status, user_id)
        `)
        .order('event_date', { ascending: true });

      if (error) throw error;

      const processedEvents = eventsData?.map(event => ({
        ...event,
        rsvp_count: event.rsvps?.length || 0,
        user_rsvp: event.rsvps?.find((rsvp: any) => rsvp.user_id === user?.id)?.status
      })) || [];

      setEvents(processedEvents);
    } catch (error: any) {
      toast({
        title: "Error loading events",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const { data: groupsData, error } = await supabase
        .from('groups')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setGroups(groupsData || []);
    } catch (error: any) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title.trim()) {
      toast({
        title: "Event title required",
        description: "Please enter a title for your event",
        variant: "destructive"
      });
      return;
    }

    if (!newEvent.event_date) {
      toast({
        title: "Event date required",
        description: "Please select a date for your event",
        variant: "destructive"
      });
      return;
    }

    if (!newEvent.group_id) {
      toast({
        title: "Group required",
        description: "Please select a group for your event",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert([{
          title: newEvent.title.trim(),
          description: newEvent.description.trim(),
          event_date: newEvent.event_date,
          location: newEvent.location.trim(),
          group_id: newEvent.group_id,
          creator_id: user?.id
        }])
        .select()
        .single();

      if (eventError) throw eventError;

      toast({
        title: "Event created successfully!",
        description: `${event.title} has been created.`
      });

      setNewEvent({ title: '', description: '', event_date: '', location: '', group_id: '' });
      setShowCreateForm(false);
      fetchEvents();
    } catch (error: any) {
      toast({
        title: "Error creating event",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setCreating(false);
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

  const getEventStatus = (dateString: string) => {
    const date = parseISO(dateString);
    if (isPast(date)) return 'past';
    if (isToday(date)) return 'today';
    if (isTomorrow(date)) return 'tomorrow';
    return 'upcoming';
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.groups?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingEvents = filteredEvents.filter(event => !isPast(parseISO(event.event_date)));
  const pastEvents = filteredEvents.filter(event => isPast(parseISO(event.event_date)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Events</h1>
          <Button 
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {/* Create Event Form */}
        {showCreateForm && (
          <div className="border-b border-border/50 p-4">
            <div className="flex gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt="You" />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {user?.user_metadata?.full_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Create a new event</h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover-bg rounded-full"
                    onClick={() => setShowCreateForm(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <Input
                  placeholder="Event title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="text-xl border-none bg-transparent p-0 focus-visible:ring-0 placeholder:text-muted-foreground"
                />
                <Textarea
                  placeholder="What's this event about?"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px] border-none bg-transparent p-0 resize-none focus-visible:ring-0 placeholder:text-muted-foreground"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    type="datetime-local"
                    value={newEvent.event_date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, event_date: e.target.value }))}
                    className="rounded-full border border-border/50 focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <Input
                    placeholder="Location (optional)"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    className="rounded-full border border-border/50 focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <select
                  value={newEvent.group_id}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, group_id: e.target.value }))}
                  className="w-full rounded-full border border-border/50 bg-background px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="">Select a group</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
                <div className="flex items-center justify-between pt-3">
                  <div className="flex gap-4">
                    <Button variant="ghost" size="sm" className="text-primary hover-bg rounded-full p-2">
                      <Calendar className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-primary hover-bg rounded-full p-2">
                      <MapPin className="h-5 w-5" />
                    </Button>
                  </div>
                  <Button 
                    className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6"
                    onClick={handleCreateEvent}
                    disabled={creating || !newEvent.title.trim() || !newEvent.event_date || !newEvent.group_id}
                  >
                    {creating ? 'Creating...' : 'Create Event'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="border-b border-border/50 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Events List */}
        <div>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                {searchQuery ? 'No events found' : 'No events yet'}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? `No events match "${searchQuery}". Try a different search term.`
                  : 'Create your first event to start planning activities with your groups.'
                }
              </p>
              {!searchQuery && (
                <Button 
                  className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-3"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Event
                </Button>
              )}
            </div>
          ) : (
            <div>
              {/* Upcoming Events */}
              {upcomingEvents.length > 0 && (
                <div>
                  <div className="p-4 border-b border-border/50">
                    <h2 className="text-lg font-bold">Upcoming Events</h2>
                  </div>
                  <div className="divide-y divide-border/50">
                    {upcomingEvents.map((event) => (
                      <div 
                        key={event.id} 
                        className="p-4 hover-bg transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                            getEventStatus(event.event_date) === 'today' ? 'bg-green-500/10' :
                            getEventStatus(event.event_date) === 'tomorrow' ? 'bg-yellow-500/10' :
                            'bg-primary/10'
                          }`}>
                            <Calendar className={`h-6 w-6 ${
                              getEventStatus(event.event_date) === 'today' ? 'text-green-500' :
                              getEventStatus(event.event_date) === 'tomorrow' ? 'text-yellow-500' :
                              'text-primary'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg">{event.title}</h3>
                              <span className="text-muted-foreground">·</span>
                              <span className="text-muted-foreground text-sm">{event.groups?.name}</span>
                            </div>
                            <p className="text-muted-foreground mb-2">{event.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatEventDate(event.event_date)}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {event.location}
                                </span>
                              )}
                              {event.rsvp_count > 0 && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {event.rsvp_count} attending
                                </span>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="hover-bg rounded-full">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past Events */}
              {pastEvents.length > 0 && (
                <div>
                  <div className="p-4 border-b border-border/50">
                    <h2 className="text-lg font-bold">Past Events</h2>
                  </div>
                  <div className="divide-y divide-border/50">
                    {pastEvents.map((event) => (
                      <div 
                        key={event.id} 
                        className="p-4 hover-bg transition-colors cursor-pointer opacity-60"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                            <Calendar className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg">{event.title}</h3>
                              <span className="text-muted-foreground">·</span>
                              <span className="text-muted-foreground text-sm">{event.groups?.name}</span>
                            </div>
                            <p className="text-muted-foreground mb-2">{event.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatEventDate(event.event_date)}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {event.location}
                                </span>
                              )}
                              {event.rsvp_count > 0 && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {event.rsvp_count} attended
                                </span>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="hover-bg rounded-full">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
