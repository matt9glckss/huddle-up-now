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
  Users, 
  Plus, 
  Search,
  MoreHorizontal,
  Calendar,
  MapPin,
  X
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Group {
  id: string;
  name: string;
  description: string;
  created_at: string;
  creator_id: string;
  member_count?: number;
  recent_activity?: string;
}

const Groups = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data: groupsData, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedGroups = groupsData?.map(group => ({
        ...group,
        member_count: group.group_members?.[0]?.count || 0
      })) || [];

      setGroups(processedGroups);
    } catch (error: any) {
      toast({
        title: "Error loading groups",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for your group",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert([{
          name: newGroup.name.trim(),
          description: newGroup.description.trim(),
          creator_id: user?.id
        }])
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{
          group_id: group.id,
          user_id: user?.id,
          role: 'admin'
        }]);

      if (memberError) throw memberError;

      toast({
        title: "Group created successfully!",
        description: `${group.name} has been created.`
      });

      setNewGroup({ name: '', description: '' });
      setShowCreateForm(false);
      fetchGroups();
    } catch (error: any) {
      toast({
        title: "Error creating group",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Groups</h1>
          <Button 
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {/* Create Group Form */}
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
                  <h3 className="font-bold text-lg">Create a new group</h3>
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
                  placeholder="Group name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                  className="text-xl border-none bg-transparent p-0 focus-visible:ring-0 placeholder:text-muted-foreground"
                />
                <Textarea
                  placeholder="What's this group about?"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px] border-none bg-transparent p-0 resize-none focus-visible:ring-0 placeholder:text-muted-foreground"
                />
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
                    onClick={handleCreateGroup}
                    disabled={creating || !newGroup.name.trim()}
                  >
                    {creating ? 'Creating...' : 'Create Group'}
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
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Groups List */}
        <div>
          {filteredGroups.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                {searchQuery ? 'No groups found' : 'No groups yet'}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? `No groups match "${searchQuery}". Try a different search term.`
                  : 'Create your first group to start connecting with friends and planning events.'
                }
              </p>
              {!searchQuery && (
                <Button 
                  className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-3"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Group
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filteredGroups.map((group) => (
                <div 
                  key={group.id} 
                  className="p-4 hover-bg transition-colors cursor-pointer"
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{group.name}</h3>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground text-sm">
                          {format(parseISO(group.created_at), 'MMM d')}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-2">{group.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
                        </span>
                        {group.creator_id === user?.id && (
                          <span className="text-primary text-xs font-medium">Admin</span>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups;
