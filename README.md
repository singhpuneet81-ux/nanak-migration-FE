# Nanak Migration Admin (Runway Lead Desk)

React admin panel for the Migration CRM — themed with Nanak Migration navy/gold, matching the Runway prototype layout.

## Setup

1. Copy env:
   ```bash
   cp .env.example .env
   ```

2. Point at backend:
   ```
   VITE_API_BASE_URL=http://localhost:5001/api
   ```

3. Install and run:
   ```bash
   npm install
   npm run dev
   ```

Open http://localhost:5174 and sign in with your seeded admin credentials.

## Modules

**Leads (live)**
- Expiry Radar — visa runway visualization + SLA queues
- Capture net — widget ladder + intake API docs
- All leads — search, filters, CSV export, lead drawer
- Pathways — lifetime value + nurture triggers
- Sources — attribution by source and article
- Allocation — team capacity + unallocated queue
- Export centre — consent-gated marketing segments

**Bookings (live)**
- Schedule — upcoming/past consults
- Comms queue — automated message chain
- Booking page — client booking preview (creates real bookings)
- Assessment form — pre-consult OAF merged into lead

**Coming soon:** Matters, Clients, Documents, AML, Reports (shown as locked in sidebar)

## Responsive

- Desktop: fixed sidebar + main content
- Mobile (&lt;760px): horizontal module nav, full-width drawer

## Production build

```bash
npm run build
npm run preview
```

Set `VITE_API_BASE_URL` to your deployed backend URL before building.
