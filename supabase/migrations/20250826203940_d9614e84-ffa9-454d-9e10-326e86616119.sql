-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view group members for groups they belong to" ON public.group_members;

-- Create a security definer function to check group membership without recursion
CREATE OR REPLACE FUNCTION public.is_group_member(group_uuid uuid, user_uuid uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = group_uuid AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a security definer function to get user's group IDs
CREATE OR REPLACE FUNCTION public.get_user_group_ids(user_uuid uuid)
RETURNS uuid[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT group_id FROM public.group_members 
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new policy that uses the security definer function
CREATE POLICY "Users can view group members for groups they belong to" 
ON public.group_members 
FOR SELECT 
USING (group_id = ANY(public.get_user_group_ids(auth.uid())));

-- Also update the messages policy to avoid potential recursion
DROP POLICY IF EXISTS "Users can view messages for groups they belong to" ON public.messages;

CREATE POLICY "Users can view messages for groups they belong to" 
ON public.messages 
FOR SELECT 
USING (group_id = ANY(public.get_user_group_ids(auth.uid())));

-- Update events policy to avoid potential recursion  
DROP POLICY IF EXISTS "Users can view events for groups they belong to" ON public.events;

CREATE POLICY "Users can view events for groups they belong to" 
ON public.events 
FOR SELECT 
USING (group_id = ANY(public.get_user_group_ids(auth.uid())));

-- Update RSVPs policy to avoid potential recursion
DROP POLICY IF EXISTS "Users can view RSVPs for events in their groups" ON public.rsvps;

CREATE POLICY "Users can view RSVPs for events in their groups" 
ON public.rsvps 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.events e 
  WHERE e.id = rsvps.event_id 
  AND e.group_id = ANY(public.get_user_group_ids(auth.uid()))
));