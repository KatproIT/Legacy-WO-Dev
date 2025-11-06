#!/bin/bash

echo "🚀 Legacy Power Systems - Deployment Script"
echo "============================================"
echo ""

# Check if build exists
if [ ! -d "dist" ]; then
    echo "📦 Building application..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed. Please fix errors and try again."
        exit 1
    fi
    echo "✅ Build completed successfully!"
    echo ""
fi

echo "Choose your deployment platform:"
echo "1) Netlify (Recommended)"
echo "2) Vercel"
echo "3) Both"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🌐 Deploying to Netlify..."
        if ! command -v netlify &> /dev/null; then
            echo "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        netlify deploy --prod --dir=dist
        ;;
    2)
        echo ""
        echo "🌐 Deploying to Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        vercel --prod
        ;;
    3)
        echo ""
        echo "🌐 Deploying to both platforms..."

        if ! command -v netlify &> /dev/null; then
            echo "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        netlify deploy --prod --dir=dist

        echo ""

        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        vercel --prod
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📝 Don't forget to:"
echo "   1. Set environment variables in your hosting dashboard"
echo "   2. Add your custom domain (optional)"
echo "   3. Test the deployed application"
echo ""
