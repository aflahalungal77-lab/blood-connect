-- Blood Connect Meenarkuzhi - Supabase PostgreSQL schema
-- Run this whole file in Supabase Dashboard -> SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.donors (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 80),
  blood_group text not null check (blood_group in ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  location text not null check (char_length(trim(location)) between 2 and 80),
  phone text not null check (phone ~ '^[6-9][0-9]{9}$'),
  consent boolean not null default false check (consent = true),
  available_for_contact boolean not null default true,
  status text not null default 'pending' check (status in ('pending','verified','rejected','hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  patient_label text not null default 'Patient' check (char_length(trim(patient_label)) between 1 and 60),
  blood_group text not null check (blood_group in ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  hospital text not null check (char_length(trim(hospital)) between 2 and 120),
  location text not null check (char_length(trim(location)) between 2 and 80),
  phone text not null check (phone ~ '^[6-9][0-9]{9}$'),
  urgency text not null check (urgency in ('Critical','High','Normal')),
  units integer not null check (units between 1 and 10),
  consent boolean not null default false check (consent = true),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  request_status text not null default 'open' check (request_status in ('open','fulfilled','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists donors_search_idx on public.donors (blood_group, status, location);
create index if not exists donors_phone_idx on public.donors (phone);
create index if not exists requests_public_idx on public.requests (status, request_status, created_at desc);
create index if not exists requests_created_idx on public.requests (created_at desc);

-- Public browser clients have no direct table access. Server routes use the
-- service key only after validating inputs / admin secret.
alter table public.donors enable row level security;
alter table public.requests enable row level security;

revoke all on table public.donors from anon, authenticated;
revoke all on table public.requests from anon, authenticated;
-- Intentionally do not create anon/authenticated policies.
