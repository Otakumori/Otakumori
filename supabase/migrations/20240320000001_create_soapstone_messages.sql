-- Create soapstone messages table
create table if not exists public.soapstone_messages (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  author text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  rating integer default 0 not null,
  constraint content_length check (char_length(content) <= 200)
);

-- Enable RLS
alter table public.soapstone_messages enable row level security;

-- Create policies
create policy "Anyone can view messages"
  on public.soapstone_messages
  for select
  using (true);

create policy "Authenticated users can insert messages"
  on public.soapstone_messages
  for insert
  with check (auth.role() = 'authenticated');

create policy "Users can update their own messages"
  on public.soapstone_messages
  for update
  using (auth.uid()::text = author);

-- Create indexes
create index soapstone_messages_created_at_idx on public.soapstone_messages(created_at desc);
create index soapstone_messages_rating_idx on public.soapstone_messages(rating desc); 