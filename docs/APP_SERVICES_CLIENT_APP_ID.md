# Get Client App ID via CLI (or create an app)

## What we did

1. **Installed the App Services CLI**
   ```bash
   npm install -g atlas-app-services-cli
   ```

2. **Logged in with your Atlas Project API keys**
   - Public key: `xiczrnxd`
   - Private key: `0e55b0f0-4131-4ce9-a00a-2929986ecc20`
   ```bash
   appservices login --api-key="xiczrnxd" --private-api-key="0e55b0f0-4131-4ce9-a00a-2929986ecc20"
   ```

3. **Listed apps** → **No apps** in your project yet.
   ```bash
   appservices apps list
   ```

4. **Tried to create an app** → Failed with `invalid session`. This often means the API key does not have **Project Owner** (or similar write) permission, so the CLI cannot create apps.

---

## Option A: Create an app in the UI, then get Client App ID via CLI

1. **Open your project’s App Services apps** (replace with your **project ID** if different):
   ```
   https://cloud.mongodb.com/v2/68d90a00f2865f0d42438b98#/apps
   ```
   Or: Atlas → left sidebar → **Services** → look for **“App Services”** or **“Build”** or **“Realm”** → open the app list.

2. **Create a new app**
   - Name it e.g. `carol-bouwer-api`
   - Link it to your cluster (e.g. **Cluster0**)
   - Enable **Data API** for the app
   - Create an **API Key** (Authentication → API Keys) and save it for the Data API

3. **Get the Client App ID**
   - In the app’s left sidebar or **App Settings**, copy the **Client App ID** (or “App ID”).
   - Put it in `.env.local` as:
     ```env
     MONGODB_DATA_API_APP_ID=<the_client_app_id_you_copied>
     MONGODB_DATA_API_KEY=<the_api_key_you_created_in_the_app>
     ```

4. **List apps from CLI (to confirm)**  
   After the app exists:
   ```bash
   appservices login --api-key="xiczrnxd" --private-api-key="0e55b0f0-4131-4ce9-a00a-2929986ecc20"
   appservices apps list
   ```
   You should see your app and its **Client App ID** in the output.

---

## Option B: Create an app via CLI (needs Project Owner key)

If you create a **new** Atlas Project API Key with **Project Owner** (or equivalent write) permission:

1. **Atlas** → **Project** → **Project Settings** (gear) or **Access** → **Project Access** → **API Keys** → **Create API Key**
2. Set description, choose **Project Owner**, add your IP to the access list, then create.
3. Copy the **public** and **private** key (private is shown only once).

4. **Log in with the new key and create the app**
   ```bash
   appservices login --api-key="<new_public_key>" --private-api-key="<new_private_key>"
   cd path\to\bags\appservices-temp
   appservices apps create -n carol_bouwer_api -d LOCAL --cluster Cluster0 --project 68d90a00f2865f0d42438b98 -y
   ```
5. After create, run `appservices apps list` and copy the **Client App ID** for the new app.
6. In the Atlas UI, open that app → enable **Data API** → create an **API Key** for the app, then set both in `.env.local` as above.

---

## Summary

- **Client App ID** = from an **App** in **App Services**, not from Project ID or Service Accounts.
- Your current API key is valid for **login** and **list** but not for **create**; use **Option A** (create app in UI) or **Option B** (new Project Owner key + CLI create).
- After you have **Client App ID** and the app’s **API Key** in `.env.local`, run:
  ```bash
  npm run seed
  ```
