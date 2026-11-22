# Admin Dashboard Setup (one-time task, ~15 minutes)

Everything here runs on Firebase's **free (Spark) plan**. No card or payment needed.

## 1. Create a Firebase project
1. Open https://console.firebase.google.com and log in with your Google account.
2. Click **Create a project** and name it `sr-mattress`. You can turn Google Analytics off.

## 2. Add a web app and copy the config
1. On the project home page, click the `</>` (Web) icon, name the app `sr-mattress-web` and click **Register app**. (Do not tick "Firebase Hosting".)
2. From the `firebaseConfig` shown, copy `apiKey`, `authDomain`, `projectId` and `appId`.
3. Open `firebase-config.js` and paste these values in place of `PASTE_...`.

## 3. Turn on login and create the admin user
1. Left menu: **Build -> Authentication -> Get started**.
2. Under **Sign-in method**, enable **Email/Password** and Save.
3. **Users** tab -> **Add user** -> enter your email and a strong password. This is your admin login.

## 4. Create the database
1. **Build -> Firestore Database -> Create database**.
2. Location: `asia-south1 (Mumbai)`. Mode: **Production mode**. Enable.

## 5. Apply the security rules (very important)
1. In Firestore, open the **Rules** tab.
2. Paste the full text of the `firestore.rules` file there.
3. Replace `ADMIN_EMAIL_HERE@gmail.com` with **the same email** you created in step 3.
4. Click **Publish**.

After this, everyone can view the website's products, but only you can change or delete them.

## 6. Upload the files to GitHub
Upload these new/changed files to the repo:
`admin.html`, `admin.css`, `admin.js`, `firebase-config.js`, `products-live.js`, `contact-live.js`,
`products.html`, `products-hi.html`, `contact.html`, `contact-hi.html`, `style.css`

(Uploading `firestore.rules` and this guide is not required.)

## 7. First-time use
1. Open `your-site/admin.html` and log in.
2. Click **Import Old Products** (only once). The website's 3 products will be copied into the database.
3. Now open any product, change prices, wholesale rate or stock, and click **Save**. It shows on the website immediately; nothing needs to be re-uploaded to GitHub.

## What you can do
- Change prices per size, add or remove sizes
- Set the wholesale price and minimum quantity
- Mark a product "Out of Stock" (it appears faded with a red badge)
- Untick "Show on website" to hide a product
- Add a new product or delete an old one
- Photo: enter the path of a photo in the `assets/img/` folder. For a new photo, first upload it to `assets/img` on GitHub, then type `assets/img/photo-name.jpg` in the admin.
- The product and size dropdowns on the Contact page update automatically from the same data.

## Keep in mind
- Do not share the admin page link and do not add it to the website menu. Even so, nobody can change anything without logging in.
- If Firebase is not set up or there is an internet issue, the products page keeps showing the built-in products written in the file, so the site will not break.
- These `.js` files do not work from `file://` (by double-clicking). They only work on GitHub Pages or a local server.
- If login shows an `unauthorized-domain` error: go to Authentication -> Settings -> Authorized domains and add `your-username.github.io`.
