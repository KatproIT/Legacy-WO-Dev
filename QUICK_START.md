# Quick Start Guide

## 🖨️ Print Functionality (NEW!)

A **Print** button has been added to the form header. When clicked, it will:
- Print ALL three tabs in one PDF/document
- Hide navigation buttons and UI elements
- Format everything professionally for printing
- Perfect for creating PDF reports

**To use:**
1. Fill out your form
2. Click the gray **Print** button (next to Admin Panel)
3. In the print dialog, choose "Save as PDF" or send to printer
4. All sections will be included automatically!

---

## 🚀 Deploy Your Application in 3 Steps

### Step 1: Choose Your Site Name
Think of a name for your site, for example:
- `legacy-power-reports`
- `mycompany-service-forms`
- `power-systems-app`

### Step 2: Run the Deploy Script

Open your terminal in this project folder and run:

```bash
./deploy.sh
```

Or manually:

**For Netlify:**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

**For Vercel:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Step 3: Add Environment Variables

After deployment, add these to your hosting dashboard:

**Netlify:** Site settings → Environment variables
**Vercel:** Settings → Environment Variables

Required variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

(Copy these from your `.env` file)

---

## 🌐 Your Live URLs

After deployment, your site will be available at:

**Netlify:** `https://your-site-name.netlify.app`
**Vercel:** `https://your-site-name.vercel.app`

---

## 📝 Custom Domain (Optional)

Want to use your own domain like `forms.yourcompany.com`?

1. Go to your hosting dashboard (Netlify or Vercel)
2. Navigate to Domain Settings
3. Click "Add custom domain"
4. Follow the DNS configuration steps
5. Wait 24-48 hours for DNS propagation

---

## ✅ What You Have Now

- ✨ Professional, modern UI
- 📋 Three-tab form system
- 🖨️ **Print all tabs at once**
- 💾 Auto-save functionality
- 🔄 Power Automate integration
- 👨‍💼 Admin dashboard
- 📱 Mobile-responsive design
- 🗄️ Database persistence with Supabase

---

## 🆘 Need Help?

### Print not working?
- Save your form first before printing
- Try a different browser (Chrome/Edge recommended)
- Check print preview before printing

### Deployment issues?
- Make sure you've run `npm install`
- Check that `.env` file has correct values
- Ensure you're logged into Netlify/Vercel

### App not loading after deployment?
- Verify environment variables are set correctly
- Check browser console for errors
- Wait 2-3 minutes after first deployment

---

## 📞 Quick Commands

```bash
# Run locally
npm run dev

# Build for production
npm run build

# Deploy (using script)
./deploy.sh

# Deploy to Netlify
netlify deploy --prod

# Deploy to Vercel
vercel --prod
```

---

**You're all set! 🎉**

Your application is ready to deploy with a professional print feature that outputs all three tabs in one beautiful document.
