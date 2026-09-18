# Production Checklist

## Application and deployment

- [ ] Set `NODE_ENV=production` for the deployed app.
- [ ] Set a long, random `PAYLOAD_SECRET` and keep it outside source control.
- [ ] Set `NEXT_PUBLIC_SITE_URL` and `metadataBase` to the real HTTPS URL.
- [ ] Configure the production domain and verify Nginx redirects HTTP and `www` to the canonical HTTPS address.
- [ ] Use pinned, tested Docker image versions for Listmonk and Umami.
- [ ] Run `npm run lint` and `npm run build` in CI before deployment.
- [ ] Add health checks and restart policies for every production service.
- [ ] Confirm the app, Payload admin, blog, favicon, and API routes work through the public domain.

## Database and backups

- [ ] Use separate production database credentials, not the local `postgres` defaults.
- [ ] Restrict PostgreSQL access to the internal Docker network; do not expose port `5432` publicly.
- [ ] Back up the Payload, Listmonk, and Umami databases on a tested schedule.
- [ ] Store backups off-host and perform a restore drill before launch.
- [ ] Monitor disk usage for PostgreSQL and uploaded media.
- [ ] Confirm migrations run safely during deployment and never depend on development seed data.

## Newsletter and email

- [ ] Configure Listmonk admin access and a production sender identity.
- [ ] Configure SMTP and verify SPF, DKIM, and DMARC for the sending domain.
- [ ] Confirm unsubscribe links, bounce handling, and list consent requirements.
- [ ] Test new subscriptions, duplicate subscriptions, invalid addresses, service failures, and unsubscribes.
- [ ] Decide whether double opt-in is required for the target audience and enable it when appropriate.
- [ ] Keep subscriber management inside the protected Listmonk admin; do not expose it through a public API route.

## Umami analytics

- [ ] Create the production website in Umami with the real domain and set its website ID in `.env`.
- [ ] Set `NEXT_PUBLIC_UMAMI_URL` to the production Umami script URL.
- [ ] Verify page views on the homepage, blog index, and blog posts.
- [ ] Verify `navigation_click`, `newsletter_submit`, `newsletter_signup`, and `affiliate_click` events.
- [ ] Keep event properties anonymous: never send email addresses, names, tokens, or raw form contents.
- [ ] Document which events are used for decisions and remove events that do not answer a real question.
- [ ] Review cookie, consent, privacy, and retention requirements for the jurisdictions you serve.
- [ ] Restrict Umami admin access and enable backups for its database.

## Security

- [ ] Protect `/admin` with strong unique credentials and verify no default account remains.
- [ ] Add rate limiting or abuse protection to newsletter and public API endpoints.
- [ ] Validate and limit request bodies at every public endpoint.
- [ ] Review CORS, security headers, Content Security Policy, and iframe policies.
- [ ] Keep dependencies patched and review `npm audit` findings before release.
- [ ] Confirm logs do not contain subscriber email addresses, secrets, or authorization headers.
- [ ] Test external-link handling and affiliate disclosure requirements.

## SEO, accessibility, and quality

- [ ] Add production metadata, canonical URLs, Open Graph images, and sitemap/robots configuration.
- [ ] Test the favicon and social previews on the production domain.
- [ ] Test keyboard navigation, focus states, labels, contrast, and responsive layouts.
- [ ] Test 404 pages, missing blog posts, image failures, and database/API outages.
- [ ] Verify analytics does not block page rendering when Umami is unavailable.
- [ ] Test the complete subscription and unsubscribe journey on desktop and mobile.
- [ ] Set up uptime monitoring, error alerting, and a documented rollback procedure.
