drop extension if exists "pg_net";
create table "public"."devices" (
    "id" uuid not null default gen_random_uuid(),
    "device_library_identifier" text not null,
    "push_token" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );
alter table "public"."devices" enable row level security;
create table "public"."passes" (
    "id" uuid not null default gen_random_uuid(),
    "pass_type_identifier" text not null default ''::text,
    "serial_number" text not null,
    "last_update_tag" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "pull_requests_count" smallint not null,
    "merged_pull_requests_count" smallint not null,
    "issues_opened_count" smallint not null,
    "total_contributions_count" smallint not null
      );
alter table "public"."passes" enable row level security;
create table "public"."registrations" (
    "device_id" uuid not null,
    "pass_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );
alter table "public"."registrations" enable row level security;
CREATE UNIQUE INDEX devices_device_library_identifier_key ON public.devices USING btree (device_library_identifier);
CREATE UNIQUE INDEX devices_pkey ON public.devices USING btree (id);
CREATE INDEX idx_devices_push_token ON public.devices USING btree (push_token);
CREATE INDEX idx_passes_last_update_tag ON public.passes USING btree (last_update_tag);
CREATE INDEX idx_passes_serial ON public.passes USING btree (serial_number);
CREATE INDEX idx_passes_type ON public.passes USING btree (pass_type_identifier);
CREATE INDEX idx_registrations_pass_id ON public.registrations USING btree (pass_id);
CREATE UNIQUE INDEX passes_pkey ON public.passes USING btree (id);
CREATE UNIQUE INDEX passes_unique_type_serial ON public.passes USING btree (pass_type_identifier, serial_number);
CREATE UNIQUE INDEX passes_user_id_key ON public.passes USING btree (user_id);
CREATE UNIQUE INDEX registrations_pkey ON public.registrations USING btree (device_id, pass_id);
alter table "public"."devices" add constraint "devices_pkey" PRIMARY KEY using index "devices_pkey";
alter table "public"."passes" add constraint "passes_pkey" PRIMARY KEY using index "passes_pkey";
alter table "public"."registrations" add constraint "registrations_pkey" PRIMARY KEY using index "registrations_pkey";
alter table "public"."devices" add constraint "devices_device_library_identifier_key" UNIQUE using index "devices_device_library_identifier_key";
alter table "public"."passes" add constraint "passes_unique_type_serial" UNIQUE using index "passes_unique_type_serial";
alter table "public"."passes" add constraint "passes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;
alter table "public"."passes" validate constraint "passes_user_id_fkey";
alter table "public"."passes" add constraint "passes_user_id_key" UNIQUE using index "passes_user_id_key";
alter table "public"."registrations" add constraint "registrations_device_id_fkey" FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE not valid;
alter table "public"."registrations" validate constraint "registrations_device_id_fkey";
alter table "public"."registrations" add constraint "registrations_pass_id_fkey" FOREIGN KEY (pass_id) REFERENCES passes(id) ON DELETE CASCADE not valid;
alter table "public"."registrations" validate constraint "registrations_pass_id_fkey";
set check_function_bodies = off;
CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;
create policy "passes_delete_own"
  on "public"."passes"
  as permissive
  for delete
  to authenticated
using ((user_id = auth.uid()));
create policy "passes_insert_own"
  on "public"."passes"
  as permissive
  for insert
  to authenticated
with check ((user_id = auth.uid()));
create policy "passes_select_own"
  on "public"."passes"
  as permissive
  for select
  to authenticated
using ((user_id = auth.uid()));
create policy "passes_update_own"
  on "public"."passes"
  as permissive
  for update
  to authenticated
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));
CREATE TRIGGER trg_devices_updated_at BEFORE UPDATE ON public.devices FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_passes_updated_at BEFORE UPDATE ON public.passes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
