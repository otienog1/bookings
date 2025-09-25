Goal: Add a **Documents** section to the Bookings view where staff can upload vouchers, airline tickets and other documents, add a client safari-itinerary link, and generate a secure client download link. Use **Copyparty** as the file store/transfer server for uploads and downloads (legitimate integration). Produce code (React + TypeScript frontend; Node/Express or equivalent backend) and describe required Copyparty config and endpoints.

Requirements & features

1. UI (Bookings view)

   - New **Documents** section on the booking page with:

     - Multi-file upload control (drag & drop + file browser).
     - Category selector per file (e.g., Voucher, Air Ticket, Invoice, Other).
     - Inline upload progress & thumbnails for images/PDFs.
     - List of uploaded files with filename, category, upload date, size, and download button.
     - Field: **Client itinerary URL** (text input).
     - Button: **Generate client link** → creates a secure, time-limited URL that lets the client view/download **only** the categorized documents for that booking.
     - Button: **Copy link** and **Send link** (optional: triggers email with link).

   - Accessibility: keyboard navigable, proper labels, ARIA where needed.
   - Validation: file size limit, allowed types (pdf, jpg, jpeg, png, docx), max number of files configurable.

2. Backend & Copyparty integration

   - Use Copyparty as the file server for storage/transfer. Explain required Copyparty flags/config for:

     - Accessible HTTP(S) endpoints for uploads/downloads.
     - Authentication mode recommended (API token or reverse-proxied behind app auth).
     - How to store files in per-booking folders or with metadata to map category and booking ID.

   - Implement secure server-side endpoints (example signatures below) that:

     - Accept upload metadata (bookingId, category, filename, content-type) and return an upload URL or proxy the upload through the backend to Copyparty.
     - List files for a booking (with categories and metadata).
     - Create a **signed, time-limited share token** that maps to a booking and allowed categories; the token is validated by the backend which proxies the download requests to Copyparty or returns pre-signed Copyparty URLs.
     - Revoke or expire share links.

3. Security & privacy

   - Share links must be single-use or time-limited (configurable expiry, e.g., 7 days).
   - Auth on backend (JWT/session) required to create/manage documents.
   - Do **not** expose Copyparty admin UI or credentials to clients.
   - Rate limit and validation for uploads; virus-scan or quarantine step is recommended for user-provided files.

4. API examples (suggested)

   - `POST /api/bookings/:id/documents`
     Payload: `multipart/form-data` or `application/json` with upload URL flow. Returns metadata for file.
   - `GET /api/bookings/:id/documents`
     Returns list: `{ id, filename, category, url, size, uploadedAt }`
   - `POST /api/bookings/:id/share`
     Payload: `{ categories: ['Voucher','Air Ticket','Invoice','Other'], expiresInSeconds: 604800 }`
     Returns: `{ shareUrl, token, expiresAt }`
   - `POST /api/share/validate`
     Validates token and returns documents allowed for download.

5. UX & edge cases

   - Show user-friendly messages for failed uploads, expired links, empty categories.
   - Allow re-generating or revoking links.
   - Provide download-all (zipped) and per-file download options.
   - Provide file-size progress and retry on transient errors.

6. Tests & docs

   - Unit tests for backend token generation/validation and file listing.
   - Integration test to confirm share URL only returns allowed files and expires properly.
   - README section with Copyparty setup steps (flags, recommended reverse-proxy config, how to restrict access).

7. Deliverable format

   - Single-file project skeleton or patch (React + TypeScript frontend component + backend endpoints) with comments where Copyparty configuration is required.
   - Clear instructions to run locally (including a sample Copyparty command and how to run it behind a reverse proxy).
   - Example environment variables: `COPYPARTY_BASE_URL`, `COPYPARTY_API_TOKEN`, `SHARE_TOKEN_SECRET`, `SHARE_EXPIRES_DEFAULT`.

Acceptance criteria

- Staff can upload categorized files in the booking page and see them listed.
- System can generate a secure client link that allows downloading only those categorized documents and expires after the configured time.
- Copyparty runs as the file store; backend does not leak Copyparty admin controls to clients.
- Tests cover token expiry and file listing authorization.

Implementation hints (for the developer/AI)

- Prefer server-side signed tokens (HMAC with `SHARE_TOKEN_SECRET`) rather than exposing Copyparty direct write credentials to the browser.
- If using direct browser → Copyparty uploads, return short-lived pre-signed upload URLs from the backend and require a follow-up webhook/confirmation to register uploaded metadata.
- For “download-all”, generate a server-side zip stream that streams files from Copyparty to the client (safer than giving bulk direct links).
- backend is made of flask python and React with `react-dropzone` and a small progress component.

copyparty docs: https://github.com/9001/copyparty/blob/hovudstraum/README.md
