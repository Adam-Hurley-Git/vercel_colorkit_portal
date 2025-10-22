-- Create user_agreements table to store user agreement acceptances with timestamps
create table
  public.user_agreements (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null,
    email text not null,
    terms_accepted boolean not null default false,
    terms_accepted_at timestamp with time zone null,
    refund_accepted boolean not null default false,
    refund_accepted_at timestamp with time zone null,
    privacy_accepted boolean not null default false,
    privacy_accepted_at timestamp with time zone null,
    recurring_accepted boolean not null default false,
    recurring_accepted_at timestamp with time zone null,
    withdrawal_accepted boolean not null default false,
    withdrawal_accepted_at timestamp with time zone null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint user_agreements_pkey primary key (id),
    constraint user_agreements_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  ) tablespace pg_default;

-- Create index on user_id for faster lookups
create index user_agreements_user_id_idx on public.user_agreements (user_id);

-- Create index on email for lookups by email
create index user_agreements_email_idx on public.user_agreements (email);

-- Enable RLS
alter table public.user_agreements enable row level security;

-- Grant access to authenticated users to read their own agreements
create policy "Users can view their own agreements"
  on "public"."user_agreements"
  as permissive
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Grant access to authenticated users to insert their own agreements
create policy "Users can insert their own agreements"
  on "public"."user_agreements"
  as permissive
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Grant access to authenticated users to update their own agreements
create policy "Users can update their own agreements"
  on "public"."user_agreements"
  as permissive
  for update
  to authenticated
  using (auth.uid() = user_id);
