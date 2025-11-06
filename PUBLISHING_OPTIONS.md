# Publishing Options - Choose Your Site Name

## 🎯 Option 1: Netlify (Easiest - Recommended)

### With Custom Name:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy and choose your name
netlify deploy --prod
```

When prompted:
1. Select "Create & configure a new site"
2. Choose your team
3. **Enter your site name** (e.g., `legacy-power-systems`)
4. For publish directory: Enter `dist`

**Your site will be:** `https://legacy-power-systems.netlify.app`

### Change Name Later:
Go to Netlify Dashboard → Site settings → Change site name

---

## 🎯 Option 2: Vercel

### With Custom Name:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

When prompted:
1. Choose "Link to new project"
2. **Enter project name** (e.g., `legacy-power-systems`)
3. Accept defaults

**Your site will be:** `https://legacy-power-systems.vercel.app`

### Change Name Later:
Go to Vercel Dashboard → Settings → Project name

---

## 🎯 Option 3: Use Your Own Domain

### If you own a domain (e.g., yourcompany.com):

#### With Netlify:
1. Deploy as above first
2. Go to Domain settings
3. Add custom domain: `forms.yourcompany.com`
4. Update your DNS records as instructed
5. Wait 24-48 hours

#### With Vercel:
1. Deploy as above first
2. Go to Domains section
3. Add domain: `forms.yourcompany.com`
4. Update your DNS records as instructed
5. Wait 24-48 hours

---

## 📋 Example Names You Could Use

- `legacy-power-forms`
- `power-systems-service`
- `generator-reports`
- `field-service-app`
- `maintenance-forms`
- `[yourcompany]-service-reports`

---

## 🔐 Don't Forget: Environment Variables

After deploying, you MUST add these in your hosting dashboard:

### Netlify:
1. Site settings → Environment variables
2. Add:
   - `VITE_SUPABASE_URL` = (from your .env file)
   - `VITE_SUPABASE_ANON_KEY` = (from your .env file)

### Vercel:
1. Project Settings → Environment Variables
2. Add the same variables above
3. Select "Production" environment

---

## ✨ What Happens After Deployment?

1. Your app will be live at `https://your-site-name.[netlify/vercel].app`
2. You can access it from any device
3. Print functionality works in the browser
4. All data saves to your Supabase database
5. SSL certificate is automatic (https://)

---

## 🚀 Super Quick Deploy

Just run this script:

```bash
./deploy.sh
```

Then follow the prompts!

---

## 💡 Tips

### Good Site Names:
- Keep it short and memorable
- Use hyphens, not spaces
- Match your company name
- Avoid special characters

### Bad Site Names:
- ❌ `my site with spaces`
- ❌ `Site@123`
- ❌ `temp123test`

### Perfect Examples:
- ✅ `legacy-power-systems`
- ✅ `acme-service-forms`
- ✅ `generator-maintenance`

---

## 🔄 Need to Redeploy?

After making changes:

```bash
npm run build
netlify deploy --prod
```

or

```bash
npm run build
vercel --prod
```

Your site name stays the same!

---

## 🆓 Cost

Both Netlify and Vercel are **FREE** for:
- Unlimited sites
- Automatic SSL
- Global CDN
- Custom domains
- Environment variables

You only pay if you need:
- More than 100GB bandwidth/month
- Advanced features
- Team collaboration tools

---

## 📞 Support Links

- **Netlify Docs:** https://docs.netlify.com
- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs

---

**Ready to publish? Choose your name and deploy! 🚀**
