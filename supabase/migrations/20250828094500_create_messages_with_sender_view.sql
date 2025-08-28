CREATE VIEW public.messages_with_sender AS
SELECT
  m.id,
  m.content,
  m.created_at,
  m.group_id,
  m.user_id,
  g.name as group_name,
  p.full_name as sender_name,
  p.avatar_url as sender_avatar_url
FROM
  public.messages m
  LEFT JOIN public.groups g ON m.group_id = g.id
  LEFT JOIN public.profiles p ON m.user_id = p.user_id;