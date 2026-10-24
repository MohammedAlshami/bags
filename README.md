This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Local development (safe — never touches production)

`npm run dev` talks to the **production** D1 database and R2 bucket (tokens in `.env.local`).
For testing use the isolated local stack instead:

```bash
npx wrangler d1 execute goldqueen-local --local --config wrangler.local.jsonc --persist-to .wrangler/local-state --file migrations/<each migration>.sql
node scripts/seed-local-users.mjs      # local admin + customer test accounts (see the script header)
npm run dev:local -- -p 3200            # local D1/R2, email + R2 secrets blanked
```

## Images

- **Uploads** (admin forms and customer payment slips) go through `lib/upload-client.ts`: the browser converts to WebP
  (JPEG fallback), downsizes to 1600px and builds 320/640/1280px variants. `lib/r2.ts` stores them under `optimized/`
  with immutable cache headers and **rejects** anything oversized or not WebP/JPEG.
- `lib/image-loader.ts` serves the right pre-built variant per requested width; other URLs fall back to `/_next/image`
  (backed by the `IMAGES` binding in `wrangler.jsonc`).
- Bulk-fix legacy R2 images: `node scripts/optimize-r2-images.mjs` (dry run) / `--apply` / `--rollback <map.json>`.
- Oversized files in `public/`: `node scripts/optimize-static-images.mjs`.

## Deploy checklist

1. Apply new migrations to production D1 first: `npx wrangler d1 migrations apply goldqueen --remote`
   (`0014_add_confirmed_order_status`, `0015_create_discount_codes`).
2. `npm run deploy`.
3. **After** the deploy is live, move image URLs in the database to the CDN host (`cdn.goldqueen.store`, an R2 custom domain
   on the `makeup` bucket): `node scripts/switch-r2-host.mjs` (dry run) then `--apply`. `--rollback` points back at r2.dev.
   Running it before the deploy would break images, because the old build only allows the r2.dev host.
