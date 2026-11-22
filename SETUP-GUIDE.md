# Admin Dashboard Setup (ek baar ka kaam, ~15 minute)

Ye sab Firebase ke **free (Spark) plan** pe chalta hai. Card ya paise ki zaroorat nahi.

## 1. Firebase project banayein
1. https://console.firebase.google.com kholein, Google account se login karein.
2. **Create a project** dabayein, naam rakhein `sr-mattress`. Google Analytics band kar sakte hain.

## 2. Web app jodein aur config copy karein
1. Project ke home pe `</>` (Web) icon dabayein, app ka naam `sr-mattress-web` rakhein, **Register app** dabayein. ("Firebase Hosting" ka tick mat lagayein.)
2. Jo `firebaseConfig` dikhe, usme se `apiKey`, `authDomain`, `projectId`, `appId` copy karein.
3. `firebase-config.js` kholkar `PASTE_...` ki jagah ye values daal dein.

## 3. Login ON karein aur admin user banayein
1. Left menu: **Build -> Authentication -> Get started**.
2. **Sign-in method** mein **Email/Password** chalu (Enable) karein, Save.
3. **Users** tab -> **Add user** -> apna email aur ek mazboot password daalein. Yahi aapka admin login hai.

## 4. Database banayein
1. **Build -> Firestore Database -> Create database**.
2. Location: `asia-south1 (Mumbai)`. Mode: **Production mode**. Enable.

## 5. Security rules lagayein (bahut zaroori)
1. Firestore mein **Rules** tab kholein.
2. `firestore.rules` file ka poora text wahan paste karein.
3. Usme `ADMIN_EMAIL_YAHAN_LIKHEIN@gmail.com` ki jagah **wahi email** likhein jo step 3 mein banaya.
4. **Publish** dabayein.

Iske baad website ke products sab dekh sakte hain, lekin badal/hata sirf aap hi sakte hain.

## 6. Files GitHub pe daalein
Ye nayi/badli files repo mein upload karein:
`admin.html`, `admin.css`, `admin.js`, `firebase-config.js`, `products-live.js`,
`products.html`, `products-hi.html`, `style.css`

(`firestore.rules` aur ye guide upload karna zaroori nahi.)

## 7. Pehli baar use
1. `aapki-site/admin.html` kholein, login karein.
2. **Purane Products Import Karein** dabayein (sirf ek baar). Website ke 3 products database mein aa jayenge.
3. Ab kisi bhi product ko kholkar daam, wholesale rate, stock badlein aur **Save** dabayein. Website pe turant dikhega, GitHub pe kuch dobara upload nahi karna.

## Kya kya kar sakte hain
- Size ke hisaab se daam badalna, size jodna ya hatana
- Wholesale daam aur minimum quantity
- "Out of Stock" kar dena (product dhundhla dikhega, laal badge ke saath)
- "Website pe dikhayein" band karke product chhupa dena
- Naya product jodna, purana hatana
- Photo: `assets/img/` folder mein jo photo hai uska path likhna hota hai. Nayi photo ke liye pehle use GitHub ke `assets/img` mein upload karein, phir admin mein `assets/img/photo-name.jpg` likhein.

## Dhyan rakhein
- Admin page ka link kisi ko na dein aur website ke menu mein na lagayein. Phir bhi login ke bina koi kuch badal nahi sakta.
- Agar Firebase set nahi hai ya internet issue ho, to products page purane (file mein likhe) products dikhata rehta hai, site toot nahi hogi.
- Ye `.js` files `file://` se (double-click karke) nahi chalti. GitHub Pages pe ya local server pe hi chalengi.
- Agar login par `unauthorized-domain` error aaye: Authentication -> Settings -> Authorized domains mein `aapka-username.github.io` jod dein.
