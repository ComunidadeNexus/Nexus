-- Admin can read member login emails (never passwords; Auth stores only hashes).
create or replace function public.admin_list_member_logins(_user_ids uuid[])
returns table (
  user_id uuid,
  email text,
  last_sign_in_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not authorized';
  end if;

  if not public.has_role((select auth.uid()), 'admin'::public.app_role) then
    raise exception 'not authorized';
  end if;

  if _user_ids is null or cardinality(_user_ids) = 0 then
    return;
  end if;

  return query
  select
    u.id,
    u.email::text,
    u.last_sign_in_at
  from auth.users as u
  where u.id = any (_user_ids);
end;
$$;

revoke all on function public.admin_list_member_logins(uuid[]) from public;
revoke all on function public.admin_list_member_logins(uuid[]) from anon;
grant execute on function public.admin_list_member_logins(uuid[]) to authenticated;
