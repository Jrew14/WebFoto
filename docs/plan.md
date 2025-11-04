# Piksel Jual Delivery Plan

## Objective
- Deliver a two-sided marketplace that lets event photographers sell high-resolution photos directly to subjects while automating previews, sales, and fulfillment.

## Guiding Principles
- Build with Next.js 14+, TypeScript, and Bun for all scripts and dev tooling.
- Keep admin workflows fast for bulk operations and transparent revenue tracking.
- Optimize the buyer journey for frictionless discovery, secure checkout, and instant access to purchased media.
- Enforce SOLID-aligned architecture with clear domain boundaries (auth, media, commerce, notifications).

## Delivery Phases
### Phase 1 – Admin Platform
- Authentication and role-based access for seller accounts.
- Bulk upload pipeline with automatic preview generation (low-res + watermark) and secure original storage.
- Pricing and catalog management to update titles, descriptions, and availability.
- Sales dashboards that expose transaction history, payout status, and actionable notifications.

### Phase 2 – User Experience
- Seller discovery driven by account-name search as the primary entry point.
- Watermarked gallery browsing with responsive filtering and photo detail modals.
- Cart and checkout covering multi-photo purchases with transparent fees.
- Post-purchase library that unlocks full-resolution downloads via signed URLs.

### Phase 3 – Shared Services & Growth
- Payment gateway integration (e.g., Midtrans) with webhook reconciliation and revenue share ledger.
- Notification system for order confirmations and sale alerts.
- Observability stack (structured logging, metrics on upload throughput, conversion rates).
- Testing and CI automation to keep regressions out of main.

## Technical Notes
- File storage requires dual-asset handling (preview vs original) with background jobs triggered via Bun-compatible workers.
- Signed URL service must enforce TTL and one-time access semantics to protect originals.
- Capture legal acceptance of full copyright transfer during seller onboarding.
- Plan for future multi-language support by isolating copy in i18n resources from day one.

## Todo Backlog
| ID | Branch | Area | Task | Dependencies | Status |
| --- | --- | --- | --- | --- | --- |
| ADM-001 | feature/admin-auth | Admin | Implement admin authentication with role guard protecting dashboard routes. | - | Pending |
| ADM-002 | feature/admin-onboarding | Admin | Create seller onboarding to capture profile, payout preferences, and copyright acceptance. | ADM-001 | Pending |
| ADM-003 | feature/admin-upload-pipeline | Admin | Build bulk photo upload with metadata forms, background processing, watermark/preview generation, and storage. | ADM-001 | Pending |
| ADM-004 | feature/admin-media-management | Admin | Deliver media management dashboard for editing titles, prices, availability, and deleting assets. | ADM-003 | Pending |
| ADM-005 | feature/admin-sales-dashboard | Admin | Implement sales analytics view covering transactions, revenue splits, and payout status. | ADM-001 | Pending |
| ADM-006 | feature/admin-notifications | Admin | Add notifications for new sales and payout reminders via email/in-app. | ADM-005 | Pending |
| USR-001 | feature/user-discovery | User | Implement seller search by account name with result ranking and empty-state guidance. | ADM-003 | Pending |
| USR-002 | feature/user-gallery | User | Build buyer gallery experience with watermarked previews and responsive layout. | USR-001 | Pending |
| USR-003 | feature/user-cart | User | Implement cart supporting multi-photo selections, pricing summary, and validation. | USR-002 | **Complete** |
| USR-004 | feature/user-checkout | User | Integrate payment gateway checkout flow with order creation and error handling. | USR-003 | Pending |
| USR-005 | feature/user-library | User | Create "My Gallery" with secure signed URL downloads and purchase history. | USR-004, CORE-001 | Pending |
| USR-006 | feature/user-notifications | User | Send purchase confirmation and download instructions to buyers. | USR-004 | Pending |
| CORE-001 | feature/core-storage | Shared | Stand up storage bucket strategy, signed URL service, and retention policies. | ADM-003 | Pending |
| CORE-002 | feature/core-payments | Shared | Implement payment webhooks, commission calculation, and payout schedule service. | USR-004 | Pending |
| CORE-003 | feature/core-quality | Shared | Establish automated testing suites (unit, integration, E2E) and CI via Bun scripts. | ADM-001 | Pending |
