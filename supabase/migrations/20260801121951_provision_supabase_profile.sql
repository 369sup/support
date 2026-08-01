-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

CREATE OR REPLACE FUNCTION support_private.provision_supabase_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
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
      $function$;