# THREADZ

Custom apparel ecommerce app — upload designs or create with AI Studio, printed on premium fabrics.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** components

## Getting started

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

## Routes

| Path | Page |
|------|------|
| `/` | Home |
| `/shop` | Product catalog |
| `/product/[id]` | Product detail |
| `/ai-studio` | AI design studio |
| `/cart` | Shopping cart |
| `/inventory` | Admin inventory |

## Project structure

```
src/
  app/           # Next.js App Router pages
  components/    # UI components & layout
  context/       # React context providers
  data/          # Static product & inventory data
  types/         # TypeScript types
public/          # Static assets (favicon, OG image)
```
