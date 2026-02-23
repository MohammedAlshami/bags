# MongoDB setup (Carol Bouwer)

This project uses **Mongoose** with the MongoDB Node driver. Connection string is in `.env.local` as `MONGODB_URI`.

---

## Mongoose (current)

- **Database:** `carol_Bouwer` (from the connection string path)
- **Collections:** `products`, `landing`
- **Connect:** `import dbConnect from '@/lib/mongodb'; await dbConnect();`
- **Models:** `@/models/Product`, `@/models/Landing`
- **Seed:** `npm run seed` or `POST /api/seed`

If seed fails with "bad auth", check in Atlas: Database Access → your user has read/write to the cluster (or use a user with password that has no special characters, or URL-encode the password in `MONGODB_URI`).

---

## Data API (legacy / optional)

The **MongoDB Atlas Data API** (REST) is no longer used by default. Your cluster connection string is used by Mongoose.

## 1. Create an App and get App ID + API Key

1. In [MongoDB Atlas](https://cloud.mongodb.com), open your project and go to **App Services** (in the left sidebar; may be under "Build" or "Services").
2. Click **Create a New App** (or use an existing app).
3. Name it (e.g. `carol-bouwer-api`) and **Link** it to your cluster (`Cluster0`). Save.
4. In the app, go to **Data API** (under "Connect") and **Enable** the Data API.
5. Copy the **App ID** (e.g. `myapp-abcde`).
6. Go to **Authentication** → **API Keys** → **Create API Key**. Name it (e.g. `seed-key`), copy the key and store it safely (it’s shown only once).

Your cluster user/password (e.g. `alshamicourses_db_user` / `5G02...`) is for the connection string (driver). The Data API uses the **App ID** and **API Key** from the app, not the cluster password.

## 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:

- `MONGODB_DATA_API_APP_ID` = your App ID (from step 5).
- `MONGODB_DATA_API_KEY` = your API Key (from step 6).
- `MONGODB_DATA_SOURCE` = the data source name in the app (usually `Cluster0`).

## 3. Seed the database

The database **carol_Bouwer** and collections **products** and **landing** are created when you run the seed.

With the dev server running (`npm run dev`):

```bash
curl -X POST http://localhost:3000/api/seed
```

Or from the browser console on your site:

```js
fetch('/api/seed', { method: 'POST' }).then(r => r.json()).then(console.log);
```

You should see something like:

```json
{ "ok": true, "message": "Seeded carol_Bouwer database", "productsInserted": 12, "landingInserted": 1 }
```

## 4. What gets uploaded

- **products** (12 items): name, price, category, image URL, slug (from your current shop).
- **landing** (1 document): hero (title, subtitle, video path, CTA), carousel (Fall colors items + image paths), banner (image path, headline), nav images paths.

Image and video **paths/URLs** are stored in MongoDB; the actual files stay in your app (e.g. `public/`). To serve images from MongoDB you’d need a separate storage (e.g. S3) and store those URLs instead.

## Optional: use data from MongoDB in the app

You can later switch the shop and landing page to read from MongoDB by calling `findProducts()` and `findLanding()` from `lib/mongodb-data-api.ts` in server components or API routes, and keep using the same REST Data API (no driver).
