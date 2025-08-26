import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, Loader2, MapPin, Clock } from 'lucide-react';

interface Group {
  id: string;
  name: string;
}

const EventsNew = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(searchParams.get('groupId') || '');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchUserGroups();
  }, []);

  const fetchUserGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setGroups(data || []);
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      toast({
        title: "Error loading groups",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !selectedGroupId || !eventDate || !eventTime) {
      toast({
        title: "Please fill in required fields",
        description: "Title, group, date, and time are required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Combine date and time
      const eventDateTime = new Date(`${eventDate}T${eventTime}`).toISOString();

      const { data: event, error } = await supabase
        .from('events')
        .insert([
          {
            title: title.trim(),
            description: description.trim() || null,
            event_date: eventDateTime,
            location: location.trim() || null,
            group_id: selectedGroupId,
            creator_id: user?.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Event created successfully!",
        description: `"${event.title}" has been created.`,
      });

      // Navigate back to group or dashboard
      if (searchParams.get('groupId')) {
        navigate(`/groups/${selectedGroupId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        title: "Error creating event",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate(searchParams.get('groupId') ? `/groups/${searchParams.get('groupId')}` : '/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Card className="border-0 shadow-elegant bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Create New Event</CardTitle>
              <CardDescription>
                Plan an event for your group
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Weekend hike, Movie night, etc."
                    required
                  />
                </div>

                {/* Group Selection */}
                <div className="space-y-2">
                  <Label htmlFor="group">Select Group *</Label>
                  {loadingGroups ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading groups...
                    </div>
                  ) : groups.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-2">No groups found</p>
                      <Button 
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/groups/new')}
                      >
                        Create a Group First
                      </Button>
                    </div>
                  ) : (
                    <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Event Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this event about?"
                    rows={3}
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <div className="relative">
                      <Input
                        id="date"
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <div className="relative">
                      <Input
                        id="time"
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location (optional)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Where will this event take place?"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(searchParams.get('groupId') ? `/groups/${searchParams.get('groupId')}` : '/dashboard')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !title.trim() || !selectedGroupId || !eventDate || !eventTime || groups.length === 0}
                    className="flex-1 bg-gradient-primary hover:opacity-90"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Create Event
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventsNew;