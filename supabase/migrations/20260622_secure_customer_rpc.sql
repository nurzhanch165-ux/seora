-- Close direct anon access to customer RPC — all auth goes through /api/auth/* with service role.
revoke execute on function public.register_customer(text,text,text,text,text,text,text,text,text,text,text,boolean,boolean) from anon, authenticated;
revoke execute on function public.authenticate_customer(text,text) from anon, authenticated;
revoke execute on function public.change_password(uuid,text,text) from anon, authenticated;
revoke execute on function public.update_customer_profile(uuid,text,text,text,text,text,text,text,text,text,text) from anon, authenticated;
revoke execute on function public.reset_password(text,text,text) from anon, authenticated;
