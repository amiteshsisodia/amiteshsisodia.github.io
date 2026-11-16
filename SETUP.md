# The UPSC Knowledge Archive — no-code deployment guide

This is a starter website for GitHub Pages + Supabase. GitHub Pages hosts the public front end; Supabase provides login, database and private file storage.

## What you need
- A GitHub account
- A Supabase account
- About 25–40 minutes for the first setup
- No local coding software is required. You will copy one URL and one public key into `config.js`.

## Part A — Create the Supabase backend
1. Go to https://supabase.com and create a free project.
2. In Project Settings → API, copy the **Project URL** and the **anon/public key**.
3. Open `config.js` in the GitHub file editor after uploading this project. Replace the two placeholder values. Never paste a `service_role` or secret key into this website.
4. In Supabase, open SQL Editor → New query. Paste all of `schema.sql` and run it.
5. Go to Authentication → Users and add your own user. Use a strong password. Turn off public sign-ups in Authentication settings if you want only yourself to administer the site.
6. Go to Storage and create a bucket named `archive-documents`. Keep it **Private**.
7. The storage policies in `schema.sql` restrict uploads and reads to the signed-in owner's folder. Run the SQL after creating the bucket; if the storage policy statements fail because the bucket does not exist, create the bucket and run those final policy statements again.

## Part B — Put the website on GitHub Pages
1. Sign in at https://github.com and click **New repository**.
2. Name it exactly `YOUR-USERNAME.github.io` (replace YOUR-USERNAME with your GitHub username). Set visibility to **Public** and create it.
3. Open the new repository → Add file → Upload files. Upload the contents of this ZIP (the files inside the folder, not the ZIP itself). Keep `index.html` at the repository root.
4. Open `config.js` in GitHub, click the pencil/edit icon, paste your Supabase Project URL and anon/public key, then commit the change.
5. Open repository Settings → Pages. Under Build and deployment choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
6. Wait a few minutes. Your site will be at `https://YOUR-USERNAME.github.io`.

## Part C — Use your site
1. Open `https://YOUR-USERNAME.github.io/admin.html`.
2. Sign in with the Supabase user you created.
3. Write an article or upload a document.
4. Leave the public checkbox off to keep it private. Tick it to publish.
5. Use the admin dashboard's Publish / Make private control to change an item's visibility later.

## Important security notes
- Do not upload private files to the GitHub repository. Upload them only through the admin dashboard into the private Supabase bucket.
- Never put a Supabase service-role key, database password or other secret in `config.js`.
- The site currently provides a basic public email-follow form. It stores subscriber email addresses; it does **not** yet send newsletter emails. Add an email provider and a server-side function before sending updates.
- The admin page is not secret because its URL is hidden; security comes from Supabase authentication and database/storage row-level security.
- Published document links are signed for five minutes when a visitor opens them. A visitor who has already opened/downloaded a public document may retain a copy even after you make it private.
- This is a starter implementation. Before using it for sensitive or high-value documents, have the Supabase policies and deployment reviewed. Test with a second browser/account to verify private content cannot be accessed.
- Public GitHub Pages means the website code is public. Only the data protected by Supabase policies and private storage remains private.

## Current features and limitations
- Responsive public homepage and article listing
- Admin login, article publishing and public/private toggle
- Private document uploads and public/private toggle
- Public follow/subscription email collection
- No comments, user profiles, reader accounts, search, newsletter delivery, custom domain or rich-text editor yet. These can be added in a next version.
