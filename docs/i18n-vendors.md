# Vendor localization reference

## Clerk

Both providers use the shared `clerkLocales` mapping. Clerk UI localization remains experimental. The installed SDK updates its interface after the application language changes. The auth adapter preserves the email identifier through that update.

The local Spanish sign-in screen shows translated form labels and buttons. Some vendor-owned accessible names and development branding remain English. These include the Google sign-in accessible name, example email format, “Secured by”, and the development-mode label. Password and recovery steps need a test-account walkthrough before release. The adapter does not claim to preserve every private internal state of Clerk's multi-step forms.

The UI localization prop does not configure authentication email language. Configure and review those templates in the Clerk dashboard. See [Clerk localization](https://clerk.com/docs/guides/customizing-clerk/localization) and [Clerk email templates](https://clerk.com/docs/guides/customizing-clerk/email-sms-templates).

## Stripe

Checkout receives the captured locale through `@convex-dev/stripe`'s `params` option. Customer portal sessions use the Stripe SDK because the wrapper does not expose locale. Customer ownership and subscription metadata stay in the existing flow. Return URLs must use the configured public origin and an `/app` path.

The app translates subscription and invoice statuses. It formats Stripe charge amounts with the currency's API units. JPY and other supported zero-decimal charge currencies do not divide by 100. ISK and UGX retain Stripe's two-decimal API representation. This formatter handles charges and invoices, not payout-specific currency rules.

Merchant-authored product names and descriptions are catalog content. A proper plan name may remain unchanged. Stripe does not translate custom descriptions from the interface locale. Configure and review merchant copy for both languages before release. Do not duplicate price IDs to translate labels.

Set and verify Stripe customer language preferences for future hosted invoices and receipts in the vendor configuration. Existing invoice PDFs do not change when the app language changes. No live customer, price, subscription, or vendor email configuration is changed by this implementation.

See [Checkout parameters](https://docs.stripe.com/api/checkout/sessions/create), [portal parameters](https://docs.stripe.com/api/customer_portal/sessions/create), and [Stripe currency units](https://docs.stripe.com/currencies).

## Release checks

Automated tests cover locale resolution, proxy rules, account settings, catalog contracts, billing locale parameters, email output, and state preservation. Vendor-hosted Checkout, portal, receipts, authentication email, and complete recovery flows still require a configured test-account walkthrough. Keep the bilingual release unannounced until these checks and a Spanish reviewer sign-off are complete.
