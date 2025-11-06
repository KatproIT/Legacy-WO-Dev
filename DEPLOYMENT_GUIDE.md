# Deployment Guide

## Print Functionality

Your form now has a **Print** button that will:
- Print all three tabs in one go (Service Report, Additional ATS, Load Bank Report)
- Format everything nicely for paper/PDF
- Hide navigation buttons and UI elements
- Optimize layout for printing

### How to Use Print:
1. Fill out your form
2. Click the **Print** button in the header
3. Choose "Save as PDF" or print to paper
4. All tabs will be included automatically!

---

## Publishing Your Application

### Option 1: Deploy to Netlify (Recommended - Free & Easy)

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Deploy Your Site**
   ```bash
   netlify deploy --prod
   ```

4. **Choose Your Custom Name**
   When prompted:
   - Choose "Create & configure a new site"
   - Enter your site name (e.g., `legacy-power-systems` or `my-custom-name`)
   - Your site will be at: `https://my-custom-name.netlify.app`

5. **Set Build Directory**
   When asked for the publish directory, enter: `dist`

6. **Environment Variables**
   After deployment, go to Netlify Dashboard:
   - Site settings → Environment variables
   - Add your Supabase variables from `.env` file

### Option 2: Deploy to Vercel (Also Free & Easy)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Choose Your Custom Name**
   - When prompted, choose a project name
   - Your site will be at: `https://my-custom-name.vercel.app`

5. **Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

### Option 3: Custom Domain

If you want your own domain (e.g., `www.yourcompany.com`):

**With Netlify:**
1. Go to Netlify Dashboard → Domain settings
2. Click "Add custom domain"
3. Follow DNS configuration instructions

**With Vercel:**
1. Go to Vercel Dashboard → Domains
2. Add your custom domain
3. Update DNS records as instructed

---

## Quick Start (Local Development)

```bash
npm run dev
```

Your app will run at `http://localhost:5173`

---

## Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist` folder.

---

## Environment Variables Required

Make sure these are set in your hosting platform:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Troubleshooting

### Print Shows Blank Pages
- Make sure you've saved the form first
- Try clicking Print again
- Check browser print preview

### Custom Domain Not Working
- Allow 24-48 hours for DNS propagation
- Verify DNS records are correct
- Clear browser cache

### Build Fails
- Run `npm install` first
- Make sure all environment variables are set
- Check for any TypeScript errors

---

## Support

For issues with:
- **Netlify**: https://docs.netlify.com
- **Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs

---

## Features Included

✅ Three-tab form system
✅ Auto-save functionality
✅ Print all tabs at once
✅ Power Automate integration
✅ Admin dashboard
✅ Responsive design
✅ Professional UI
✅ Database persistence
