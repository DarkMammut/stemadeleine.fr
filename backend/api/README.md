# API Backend - Stemadeleine.fr

API REST Spring Boot 3.2 pour le site stemadeleine.fr.

---

## 🚀 Démarrage

```bash
./mvnw spring-boot:run
```

**URL** : http://localhost:8080  
**Health Check** : http://localhost:8080/api/public/health

---

## 🧪 Tests

```bash
./mvnw test
```

---

## 📚 Documentation Complète

Pour la documentation complète, consultez :

**[../../API.md](../../API.md)** - Documentation complète de l'API

---

## 📦 Build

```bash
# Clean build
./mvnw clean install

# Build sans tests
./mvnw clean package -DskipTests
```

---

## 🚀 Déploiement

Voir **[../../DEPLOYMENT.md](../../DEPLOYMENT.md)** pour le guide de déploiement complet.

Configuration Render :

- **Name** : `stemadeleine-api`
- **Language** : `Docker`
- **Root Directory** : `backend/api`

---

## 📊 Endpoints Principaux

### Publics

- `GET /api/public/health` - Health check
- `GET /api/public/news` - Liste des actualités
- `POST /api/public/contact` - Formulaire de contact
- `GET /api/stats/dashboard` - KPIs dashboard
- `GET /api/stats/donations?year=2026` - Dons mensuels

### Protégés (Authentification JWT)

- `POST /api/auth/login` - Connexion
- `GET /api/users` - Liste des utilisateurs
- `POST /api/news` - Créer une actualité
- `POST /api/media/upload` - Upload de média

---

**✅ Pour plus de détails, consultez [API.md](../../API.md)**

Troubleshooting
---------------

- If tests fail with `Table "..." not found` ensure `application-test.properties` (already present
  in `src/test/resources`) contains `spring.jpa.hibernate.ddl-auto=create-drop` and tests use it
  via `@TestPropertySource`.
- For database function usage in JPQL (function('year', ...), function('month', ...)) H2 supports these in the test
  profile using MODE=PostgreSQL. If your production DB is different, adjust queries or implement native SQL if
  necessary.

Next steps / improvements
------------------------

- Add repository-level native queries for monthly grouping if portability becomes an issue.
- Add unit tests (MockMvc + @MockBean) for controller-level unit tests to run faster.
- Add similar endpoints for other KPIs if needed.


