import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Users, UserPlus, X, Loader2 } from "lucide-react";

interface InvitedUser {
  id: string;
  full_name: string;
  avatar_url?: string;
}

const GroupsNew = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([]);
  const [searchResults, setSearchResults] = useState<InvitedUser[]>([]);

  const searchUsers = async (email: string) => {
    if (!email.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, user_id')
        .ilike('full_name', `%${email}%`)
        .limit(5);

      if (error) throw error;

      const results = data?.map(profile => ({
        id: profile.user_id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url
      })) || [];

      // Filter out already invited users and current user
      const filteredResults = results.filter(result => 
        result.id !== user?.id && 
        !invitedUsers.some(invited => invited.id === result.id)
      );

      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Error searching users",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const addUserToInvites = (userToAdd: InvitedUser) => {
    setInvitedUsers(prev => [...prev, userToAdd]);
    setSearchResults(prev => prev.filter(user => user.id !== userToAdd.id));
    setSearchEmail("");
  };

  const removeUserFromInvites = (userId: string) => {
    setInvitedUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for your group.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create the group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert([
          {
            name: name.trim(),
            description: description.trim() || null,
            creator_id: user?.id,
          }
        ])
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as first member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([
          {
            group_id: group.id,
            user_id: user?.id,
          }
        ]);

      if (memberError) throw memberError;

      // Add invited users as members
      if (invitedUsers.length > 0) {
        const memberInserts = invitedUsers.map(invitedUser => ({
          group_id: group.id,
          user_id: invitedUser.id,
        }));

        const { error: inviteError } = await supabase
          .from('group_members')
          .insert(memberInserts);

        if (inviteError) throw inviteError;
      }

      toast({
        title: "Group created successfully!",
        description: `"${group.name}" has been created with ${invitedUsers.length + 1} member${invitedUsers.length === 0 ? '' : 's'}.`,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error creating group",
        description: "Please try again later.",
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
            onClick={() => navigate('/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Card className="border-0 shadow-elegant bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Create New Group</CardTitle>
              <CardDescription>
                Create a group to organize events and chat with your friends
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Group Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Weekend Warriors, Book Club, etc."
                    required
                  />
                </div>

                {/* Group Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this group about?"
                    rows={3}
                  />
                </div>

                {/* Invite Users */}
                <div className="space-y-4">
                  <Label>Invite Friends</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        value={searchEmail}
                        onChange={(e) => {
                          setSearchEmail(e.target.value);
                          searchUsers(e.target.value);
                        }}
                        placeholder="Search by name..."
                        className="pr-10"
                      />
                      {searchLoading && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className="border rounded-md bg-background/50 backdrop-blur-sm">
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="p-3 flex items-center justify-between hover:bg-accent/50 cursor-pointer border-b last:border-b-0"
                            onClick={() => addUserToInvites(user)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {user.full_name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium">{user.full_name}</span>
                            </div>
                            <UserPlus className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Invited Users */}
                    {invitedUsers.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Invited ({invitedUsers.length})</Label>
                        <div className="flex flex-wrap gap-2">
                          {invitedUsers.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                            >
                              <span>{user.full_name}</span>
                              <button
                                type="button"
                                onClick={() => removeUserFromInvites(user.id)}
                                className="hover:bg-primary/20 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !name.trim()}
                    className="flex-1 bg-gradient-primary hover:opacity-90"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4 mr-2" />
                        Create Group
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

export default GroupsNew;