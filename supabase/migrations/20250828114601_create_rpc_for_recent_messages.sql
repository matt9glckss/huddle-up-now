CREATE OR REPLACE FUNCTION get_recent_group_activity(user_id_param uuid)
RETURNS TABLE (
  id uuid,
  content text,
  created_at timestamptz,
  group_id uuid,
  user_id uuid,
  group_name text,
  sender_name text,
  sender_avatar_url text
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_messages AS (
    SELECT
      m.*,
      ROW_NUMBER() OVER(PARTITION BY m.group_id ORDER BY m.created_at DESC) as rn
    FROM messages_with_sender m
    WHERE m.group_id IN (SELECT gm.group_id FROM group_members gm WHERE gm.user_id = user_id_param)
  )
  SELECT
    r.id,
    r.content,
    r.created_at,
    r.group_id,
    r.user_id,
    r.group_name,
    r.sender_name,
    r.sender_avatar_url
  FROM ranked_messages r
  WHERE r.rn = 1
  ORDER BY r.created_at DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION get_recent_group_activity(user_id_param uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_recent_group_activity(user_id_param uuid) TO authenticated;
