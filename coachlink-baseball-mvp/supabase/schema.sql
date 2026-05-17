create type public.app_role as enum ('guardian', 'coach', 'admin');
create type public.coach_status as enum ('draft', 'pending_review', 'approved', 'rejected');
create type public.booking_status as enum ('pending_payment', 'paid', 'room_ready', 'completed', 'cancelled');
create type public.payment_status as enum ('requires_payment', 'paid', 'failed', 'refunded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null,
  full_name text not null,
  email text not null unique,
  stripe_connect_account_id text,
  created_at timestamptz not null default now()
);

create table public.player_profiles (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references public.profiles(id) on delete cascade,
  first_name text not null,
  age_band text not null check (age_band in ('8-10', '11-13', '14-16', '17+')),
  focus_areas text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now()
);

create table public.coach_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.coach_status not null default 'pending_review',
  title text not null,
  bio text not null,
  specialties text[] not null default '{}',
  credentials text[] not null default '{}',
  years_experience integer not null check (years_experience >= 0),
  hourly_rate_cents integer not null check (hourly_rate_cents >= 0),
  session_length_minutes integer not null default 45,
  payout_ready boolean not null default false,
  image_url text,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now()
);

create table public.availability_windows (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coach_profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  booked_booking_id uuid,
  check (ends_at > starts_at)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references public.profiles(id),
  coach_id uuid not null references public.coach_profiles(id),
  player_profile_id uuid not null references public.player_profiles(id),
  availability_window_id uuid not null references public.availability_windows(id),
  status public.booking_status not null default 'pending_payment',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  price_cents integer not null,
  platform_fee_cents integer not null,
  stripe_checkout_session_id text unique,
  daily_room_name text,
  daily_room_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.availability_windows
  add constraint availability_booked_booking_fk
  foreign key (booked_booking_id) references public.bookings(id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  stripe_checkout_session_id text not null unique,
  amount_cents integer not null,
  platform_fee_cents integer not null,
  status public.payment_status not null default 'requires_payment',
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  coach_id uuid not null references public.coach_profiles(id),
  guardian_id uuid not null references public.profiles(id),
  rating integer not null check (rating between 1 and 5),
  body text not null,
  created_at timestamptz not null default now()
);

create table public.admin_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id),
  action text not null,
  target_type text not null,
  target_id uuid not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.player_profiles enable row level security;
alter table public.coach_profiles enable row level security;
alter table public.availability_windows enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.admin_audit_events enable row level security;

create policy "approved coach profiles are public"
  on public.coach_profiles for select
  using (status = 'approved');

create policy "guardians manage their player profiles"
  on public.player_profiles for all
  using (guardian_id = auth.uid())
  with check (guardian_id = auth.uid());

create policy "booking participants can read bookings"
  on public.bookings for select
  using (
    guardian_id = auth.uid()
    or exists (
      select 1
      from public.coach_profiles c
      where c.id = bookings.coach_id and c.user_id = auth.uid()
    )
  );
