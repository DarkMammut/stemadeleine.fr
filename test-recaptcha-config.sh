#!/bin/bash

# Script de test pour vérifier la configuration reCAPTCHA
echo "🔧 Testing reCAPTCHA configuration..."

echo ""
echo "📍 Checking environment files:"

# Check frontend .env
if [ -f "frontend/frontoffice/.env" ]; then
    echo "✅ Frontend .env found"
    if grep -q "REACT_APP_RECAPTCHA_SITE_KEY" frontend/frontoffice/.env; then
        echo "   ✅ REACT_APP_RECAPTCHA_SITE_KEY is set"
    else
        echo "   ❌ REACT_APP_RECAPTCHA_SITE_KEY is missing"
    fi
else
    echo "❌ Frontend .env not found"
fi

# Check backend .env.local
if [ -f "backend/api/.env.local" ]; then
    echo "✅ Backend .env.local found"
    if grep -q "RECAPTCHA_SECRET_KEY" backend/api/.env.local; then
        echo "   ✅ RECAPTCHA_SECRET_KEY is set"
    else
        echo "   ❌ RECAPTCHA_SECRET_KEY is missing"
    fi
else
    echo "❌ Backend .env.local not found"
fi

echo ""
echo "🚀 Ready to test:"
echo "1. Start API: npm run api"
echo "2. Start frontend: npm run dev"
echo "3. Test contact form with reCAPTCHA"
echo ""
echo "📝 Note: Using Google's test keys that always pass validation"
