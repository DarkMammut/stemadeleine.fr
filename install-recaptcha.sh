#!/bin/bash

# Installation script for reCAPTCHA implementation
# This script installs the required dependencies for the reCAPTCHA protection

echo "🔧 Installing reCAPTCHA dependencies..."

# Navigate to frontend directory
cd "$(dirname "$0")/frontend/frontoffice"

# Install react-google-recaptcha
echo "📦 Installing react-google-recaptcha..."
npm install react-google-recaptcha

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Successfully installed react-google-recaptcha"
else
    echo "❌ Failed to install react-google-recaptcha"
    exit 1
fi

echo ""
echo "🔑 Next steps:"
echo "1. Get your reCAPTCHA keys from https://www.google.com/recaptcha/admin"
echo "2. Update your .env file with:"
echo "   REACT_APP_RECAPTCHA_SITE_KEY=your_site_key_here"
echo "3. Set backend environment variable:"
echo "   RECAPTCHA_SECRET_KEY=your_secret_key_here"
echo ""
echo "📚 See RECAPTCHA_SETUP_GUIDE.md for complete setup instructions"
echo ""
echo "🎉 reCAPTCHA setup is ready!"
