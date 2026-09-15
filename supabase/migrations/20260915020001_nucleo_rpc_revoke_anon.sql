REVOKE ALL ON FUNCTION public.delete_own_nucleo(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.leave_nucleo(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.add_nucleo_owner_as_member() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_nucleo_members_count() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_own_nucleo(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_nucleo(uuid) TO authenticated;
