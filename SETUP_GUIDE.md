# D-Swift Setup Guide
## Getting Paystack & Firebase Working

---

## ✅ WHAT'S ALREADY DONE (No changes needed)

| File | Status | What it does |
|------|--------|-------------|
| `login.html` | ✅ Ready | Buyer/Seller registration with role selector |
| `loginscript.js` | ✅ Ready | Registers users, redirects to correct dashboard |
| `seller.html` | ✅ Ready | Full seller dashboard: post products, view sales, 5% fee |
| `profile.html` | ✅ Ready | Buyer orders, edit profile, seller shortcut |
| `kscript.js` | ⚠️ Updated | Now includes real Paystack payment — needs your key |

---

## STEP 1 — Get Your Paystack Key (Free, 10 minutes)

1. Go to **https://paystack.com** → Click **Get Started**
2. Create a free account and verify your email
3. In your dashboard, go to **Settings → API Keys & Webhooks**
4. Copy your **Public Key** — it looks like: `pk_test_xxxxxxxxxxxxxxxx`
5. Open `kscript.js` and find this line near the top:
   ```
   const PAYSTACK_PUB_KEY = 'pk_test_REPLACE_WITH_YOUR_PAYSTACK_PUBLIC_KEY';
   ```
6. Replace the placeholder with your real key:
   ```
   const PAYSTACK_PUB_KEY = 'pk_test_abc123yourrealkeyhere';
   ```

**That's it for payments!** Buyers will now see a real Paystack popup when they checkout.

---

## STEP 2 — Test a Payment

Use these Paystack test card details:
- **Card:** 4084 0840 8408 4081
- **Expiry:** Any future date (e.g. 12/26)
- **CVV:** 408
- **PIN:** 0000
- **OTP:** 123456

---

## HOW THE 5% FEE WORKS

- Buyer pays full price (e.g. GH₵ 100)
- D-Swift keeps 5% = GH₵ 5
- Seller earns 95% = GH₵ 95
- This is **automatically calculated** and shown in the seller dashboard

---

## FIREBASE (Optional — for now it uses localStorage)

Right now all data (users, products, orders) is saved in the browser's localStorage.
This means:
- ✅ Works perfectly on one device/browser
- ❌ Data doesn't sync across different devices or browsers

To upgrade to Firebase (real database across all devices):

### Firebase Setup Steps:
1. Go to **https://firebase.google.com** → Get Started
2. Create project → Name it "dswift"
3. Go to **Firestore Database** → Create database → Test mode
4. Go to **Project Settings** → Your apps → Click **</>** (web icon)
5. Register app, copy the `firebaseConfig` object
6. Go to **Authentication** → Enable **Email/Password**

Then share the `firebaseConfig` and I'll integrate it into all files.

---

## FILE SUMMARY — What to upload to your website

```
index.html       ← main shop page
kscript.js       ← ⚠️ UPDATED (replace old one with new one)
kstyle.css       ← no change needed
login.html       ← buyer/seller registration
loginscript.js   ← no change needed
loginstyle.css   ← no change needed
seller.html      ← seller dashboard
profile.html     ← buyer profile
about.html       ← about page
contact.html     ← contact page
service.html     ← services page
style.css        ← contact page styles
service.css      ← service page styles
about.css        ← about page styles
m_style.css      ← profile page styles
789.png          ← Swift logo
456.jpeg         ← hero image
[product images] ← 10.jpg, 16.jpg, 19.jpg, etc.
```

---

## HOW THE BUYER/SELLER FLOW WORKS

```
New user visits login.html
        ↓
Clicks "Sign Up"
        ↓
Fills name, email, password
        ↓
Chooses: [🛍️ Buyer] or [🏪 Seller]
        ↓
BUYER → profile.html     SELLER → seller.html
  - View orders            - Post products
  - Edit profile           - View sales & earnings
  - Shop for items         - See 5% fee deducted
```

---

## QUESTIONS?
Contact: dswift.ltd@gmail.com | +233 53 820 7600
