# Ainek Pilot Setup

## Required environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PRICE_ID_STARTER`
- `STRIPE_PRICE_ID_BUSINESS`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_DOMAIN`
- `GEMINI_API_KEY` or one of `GEMINI_API_KEY_1..5`

## Supabase prerequisites
- Create public tables represented in `drizzle/schema/*.ts`, including the new `tenants.owner_user_id`, `tenants.stripe_customer_id`, `tenants.onboarding_status`, and `tenants.onboarding_error` columns.
- Apply [0001_pilot_onboarding.sql](/C:/Users/cpu/Desktop/ainek_mvp_claude/ainek/drizzle/migrations/0001_pilot_onboarding.sql) or generate/apply the equivalent migration through Drizzle.
- Enable the `product-images` storage bucket for store catalog media.
- Create the `exec_sql` RPC used by tenant provisioning.
- Create the `increment_tenant_try_on_used` RPC used by try-on quota accounting.
- Confirm service-role credentials are available only server-side.

## Runtime assumptions
- Wildcard DNS is configured for `*.ainek.kg` or the domain set in `NEXT_PUBLIC_APP_DOMAIN`.
- The dashboard owner account is the same Supabase auth user stored in `tenants.owner_user_id`.
- Redis failures are tolerated for cache misses, but Redis should be available in production to control Gemini costs.
- Stripe webhooks must point to `/api/webhooks/stripe`.

## Pilot smoke checklist
1. Register a new store through `POST /api/tenant/register`.
2. Confirm the tenant reaches `onboarding_status = ready`.
3. Upload at least one product image and create/import catalog items.
4. Open the storefront by slug and verify products render.
5. Run a try-on and verify `try_on_sessions` plus tenant quota counters update.
6. Open the dashboard and confirm the onboarding checklist shows all required steps as complete.
