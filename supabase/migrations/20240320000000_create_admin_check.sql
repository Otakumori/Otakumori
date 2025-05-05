-- Create a function to check if a user is an admin
create or replace function is_admin(user_email text)
returns boolean
language plpgsql
security definer
as $$
begin
  return user_email = 'adi@otaku-mori.com';
end;
$$; 