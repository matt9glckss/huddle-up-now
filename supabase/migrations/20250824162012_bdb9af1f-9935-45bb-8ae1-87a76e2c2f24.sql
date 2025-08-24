-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group members table
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create RSVPs table
CREATE TABLE public.rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('yes', 'maybe', 'no')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create messages table for group chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for groups
CREATE POLICY "Users can view groups they are members of" ON public.groups FOR SELECT 
USING (
  auth.uid() = creator_id OR 
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = groups.id AND user_id = auth.uid())
);
CREATE POLICY "Users can create groups" ON public.groups FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Group creators can update their groups" ON public.groups FOR UPDATE USING (auth.uid() = creator_id);

-- Create RLS policies for group members
CREATE POLICY "Users can view group members for groups they belong to" ON public.group_members FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid())
);
CREATE POLICY "Group creators can add members" ON public.group_members FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND creator_id = auth.uid())
);
CREATE POLICY "Users can leave groups" ON public.group_members FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for events
CREATE POLICY "Users can view events for groups they belong to" ON public.events FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = events.group_id AND user_id = auth.uid())
);
CREATE POLICY "Group members can create events" ON public.events FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = events.group_id AND user_id = auth.uid())
);
CREATE POLICY "Event creators can update their events" ON public.events FOR UPDATE USING (auth.uid() = creator_id);

-- Create RLS policies for RSVPs
CREATE POLICY "Users can view RSVPs for events in their groups" ON public.rsvps FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events e 
    JOIN public.group_members gm ON e.group_id = gm.group_id 
    WHERE e.id = rsvps.event_id AND gm.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create/update their own RSVPs" ON public.rsvps FOR INSERT
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own RSVPs" ON public.rsvps FOR UPDATE
USING (auth.uid() = user_id);

-- Create RLS policies for messages
CREATE POLICY "Users can view messages for groups they belong to" ON public.messages FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = messages.group_id AND user_id = auth.uid())
);
CREATE POLICY "Group members can send messages" ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = messages.group_id AND user_id = auth.uid())
);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', 'New User'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN new;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rsvps_updated_at
  BEFORE UPDATE ON public.rsvps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;