-- Auth trigger functions are private, schema-qualified, and deny PUBLIC execution.
-- Historical origin: identity-authentication-supabase-0002
create or replace function support_private.provision_supabase_user()
      returns trigger
      language plpgsql
      security definer
      set search_path = ''
      as $$
      declare
        support_account_id uuid := gen_random_uuid();
        support_email_id uuid := gen_random_uuid();
        support_username text := btrim(
          coalesce(new.raw_user_meta_data ->> 'username', '')
        );
        support_email text := btrim(coalesce(new.email, ''));
      begin
        if support_username !~ '^[A-Za-z0-9]([A-Za-z0-9-]{0,37}[A-Za-z0-9])?$' then
          return new;
        end if;

        if exists (
          select 1
          from support_identity_authentication.support_auth_identities
          where provider = 'supabase'
            and subject = new.id::text
        ) then
          return new;
        end if;

        if support_email = '' then
          raise exception using
            errcode = 'not_null_violation',
            message = 'Supabase account email is required.';
        end if;

        insert into support_identity_accounts.support_accounts (
          account_id,
          username,
          normalized_username,
          display_name,
          account_type,
          usage,
          lifecycle_state
        ) values (
          support_account_id,
          support_username,
          lower(support_username),
          support_username,
          'personal',
          'human',
          'active'
        );

        insert into support_identity_authentication.support_auth_identities (
          provider,
          subject,
          account_id,
          email,
          normalized_email,
          email_verified_at
        ) values (
          'supabase',
          new.id::text,
          support_account_id,
          support_email,
          lower(support_email),
          new.email_confirmed_at
        );

        insert into support_identity_account_emails.support_account_emails (
          email_id,
          account_id,
          address,
          ownership,
          is_primary,
          is_public,
          is_verified,
          created_at
        ) values (
          support_email_id,
          support_account_id,
          support_email,
          'personal',
          true,
          false,
          new.email_confirmed_at is not null,
          now()
        );

        insert into support_identity_profiles.support_profiles (
          account_id,
          display_name,
          visibility
        ) values (
          support_account_id,
          support_username,
          'public'
        );

        return new;
      end;
      $$;

      revoke all on function
        support_private.provision_supabase_user()
        from public;
      revoke all on function
        support_private.provision_supabase_user()
        from anon;
      revoke all on function
        support_private.provision_supabase_user()
        from authenticated;

      create or replace function support_private.sync_supabase_user_email()
      returns trigger
      language plpgsql
      security definer
      set search_path = ''
      as $$
      declare
        support_email text := btrim(coalesce(new.email, ''));
        support_account_id uuid;
      begin
        if support_email = '' then
          raise exception using
            errcode = 'not_null_violation',
            message = 'Supabase account email is required.';
        end if;

        update support_identity_authentication.support_auth_identities
        set
          email = support_email,
          normalized_email = lower(support_email),
          email_verified_at = new.email_confirmed_at,
          updated_at = now()
        where provider = 'supabase'
          and subject = new.id::text
        returning account_id into support_account_id;

        if support_account_id is null then
          return new;
        end if;

        update support_identity_account_emails.support_account_emails
        set
          address = support_email,
          is_verified = new.email_confirmed_at is not null
        where account_id = support_account_id
          and is_primary;

        return new;
      end;
      $$;

      revoke all on function
        support_private.sync_supabase_user_email()
        from public;
      revoke all on function
        support_private.sync_supabase_user_email()
        from anon;
      revoke all on function
        support_private.sync_supabase_user_email()
        from authenticated;

      drop trigger if exists
        support_on_auth_user_profile_completed
        on auth.users;
      create trigger support_on_auth_user_profile_completed
        after update of raw_user_meta_data on auth.users
        for each row
        when (
          old.raw_user_meta_data ->> 'username'
          is distinct from
          new.raw_user_meta_data ->> 'username'
        )
        execute function support_private.provision_supabase_user();

create or replace function support_private.protect_last_organization_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'owner' and old.state = 'active'
     and (new.role <> 'owner' or new.state <> 'active') then
    perform pg_advisory_xact_lock(
      hashtext('support-org-owner:' || old.organization_id)
    );
    if not exists (
      select 1
      from support_organizations_organization_memberships.support_organization_memberships
      where organization_id = old.organization_id
        and membership_id <> old.membership_id
        and role = 'owner'
        and state = 'active'
    ) then
      raise exception
        'An organization must retain at least one active owner.';
    end if;
  end if;
  return new;
end
$$;

revoke all on function
  support_private.protect_last_organization_owner()
  from public, anon, authenticated, service_role;
