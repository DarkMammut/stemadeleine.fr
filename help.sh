#!/usr/bin/env bash
# Script d'aide rapide pour le déploiement

cat << 'EOF'

╔════════════════════════════════════════════════════════════════╗
║                 🚀 AIDE-MÉMOIRE DÉPLOIEMENT                    ║
╚════════════════════════════════════════════════════════════════╝

📋 COMMANDES UTILES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  Nettoyer les .env de Git :
    ./clean-env-files.sh
    git commit -m "chore: remove .env files"
    git push origin main

2️⃣  Générer une clé JWT sécurisée :
    ./generate-jwt-secret.sh

3️⃣  Tester l'API en local :
    cd backend/api
    ./mvnw spring-boot:run

4️⃣  Tester l'API déployée :
    curl https://stemadeleine-api.onrender.com/api/public/health

5️⃣  Voir les logs Render :
    https://dashboard.render.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 FICHIERS DE DOCUMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📘 DEPLOYMENT_CHECKLIST.md     → Guide complet étape par étape
📘 RENDER_FORM_VALUES.md        → Valeurs pour le formulaire Render
📘 RENDER_DEPLOYMENT_GUIDE.md   → Guide détaillé Render
📘 backend/api/.env.example     → Variables d'environnement requises

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 LIENS UTILES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Render Dashboard :       https://dashboard.render.com
Vercel Dashboard :       https://vercel.com/dashboard
Supabase Dashboard :     https://supabase.com/dashboard
HelloAsso API :          https://api.helloasso.com
Google reCAPTCHA :       https://www.google.com/recaptcha/admin

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 FORMULAIRE RENDER - CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name:            stemadeleine-api
Language:        Java
Branch:          main
Region:          Frankfurt (EU Central)
Root Directory:  backend/api
Build Command:   ./render-build.sh
Start Command:   ./render-start.sh

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ CHECKLIST RAPIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ 1. Nettoyer les .env de Git
□ 2. Générer une clé JWT
□ 3. Récupérer identifiants Supabase
□ 4. Récupérer identifiants HelloAsso
□ 5. Récupérer clé reCAPTCHA
□ 6. Créer le service sur Render
□ 7. Configurer les variables d'environnement
□ 8. Tester l'API
□ 9. Déployer le frontend sur Vercel
□ 10. Déployer le backoffice sur Vercel

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 Tout est prêt pour le déploiement !

Pour commencer, lancez : ./clean-env-files.sh

╚════════════════════════════════════════════════════════════════╝

EOF

