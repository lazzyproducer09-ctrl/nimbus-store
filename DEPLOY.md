# 🚀 Going Live — NIMBUS deploy guide

The store is **build-tested** and **committed to git**. Everything below needs YOUR
logins (GitHub + Vercel) — that's the only part I can't do for you. Follow step by step.

## ✅ Already done (by Claude)
- Production build passes (`npm run build`) — all 23 pages/routes compile.
- Code committed to git. **Your secrets (`.env.local`) are NOT in git — safe.**

---

## Step 1 — Put the code on GitHub
1. Go to **https://github.com/new** → create a new **empty** repo named `nimbus-store`
   (do NOT add a README, .gitignore or licence — leave it empty).
2. In a terminal **inside the `store` folder**, run (replace `<your-username>`):
   ```
   git remote add origin https://github.com/<your-username>/nimbus-store.git
   git push -u origin main
   ```
   Sign in to GitHub when asked.

## Step 2 — Deploy on Vercel
1. Go to **https://vercel.com/new** → **Import** your `nimbus-store` repo (sign in with GitHub).
2. Vercel auto-detects Next.js. Before deploying, open **Environment Variables** and add
   these four (copy the values from your `.env.local` file):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
3. Click **Deploy**. In ~2 minutes you get a live URL like `https://nimbus-store.vercel.app`.

## Step 3 — Make logins work on the live URL (IMPORTANT)
Google login and email links need your live domain whitelisted:
1. **Supabase** → Authentication → **URL Configuration**:
   - Set **Site URL** to your Vercel URL.
   - Add it under **Redirect URLs**, e.g. `https://nimbus-store.vercel.app/**`.
2. Open the live URL and test **Continue with Google** — it should work.

---

## 🔒 Before REAL money (do these later, with Claude)
- Razorpay is in **TEST mode** (fake money). For real payments: finish Razorpay
  **KYC/activation** → switch to **live** keys on Vercel → enable **UPI**.
- **Security hardening:** stop customers from changing their own order status — this
  needs the Supabase **service_role** key (ask Claude to wire it in).
- Replace the placeholder email `support@nimbus.store` in the policy pages with your
  real support email.
