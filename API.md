# 🔧 API Backend - Guide Complet

API REST Spring Boot pour stemadeleine.fr.

---

## 🚀 Démarrage

### Prérequis

- **Java 17+**
- **Maven 3.8+**
- **PostgreSQL** (ou Supabase)

### Installation

```bash
cd backend/api
./mvnw clean install
```

### Développement

```bash
./mvnw spring-boot:run
```

Accès : http://localhost:8080

### Tests

```bash
./mvnw test
```

---

## 🏗️ Architecture

### Structure du Projet

```
backend/api/
├── src/
│   ├── main/
│   │   ├── java/com/stemadeleine/api/
│   │   │   ├── config/            # Configuration (CORS, S3, etc.)
│   │   │   ├── controller/        # Contrôleurs REST
│   │   │   ├── model/             # Entités JPA
│   │   │   ├── repository/        # Repositories Spring Data
│   │   │   ├── service/           # Services métier
│   │   │   └── dto/               # Data Transfer Objects
│   │   └── resources/
│   │       ├── application.properties
│   │       └── db/migration/      # Migrations Flyway
│   └── test/                       # Tests unitaires et d'intégration
├── Dockerfile
├── pom.xml
└── README.md
```

### Technologies

- **Framework** : Spring Boot 3.2
- **Database** : PostgreSQL (Supabase)
- **Migrations** : Flyway
- **ORM** : Spring Data JPA (Hibernate)
- **Security** : Spring Security + JWT
- **Storage** : S3-compatible (Supabase Storage)
- **Validation** : Google reCAPTCHA

---

## 📦 Endpoints API

### Publics (Sans Authentification)

#### Health Check

```
GET /api/public/health
```

#### Actualités

```
GET /api/public/news              # Liste des actualités publiées
GET /api/public/news/{id}         # Détails d'une actualité
```

#### Contact

```
POST /api/public/contact          # Envoyer un message de contact
Body: {
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "subject": "string",
  "message": "string",
  "recaptchaToken": "string"
}
```

#### Statistiques

```
GET /api/public/stats/dashboard   # KPIs du dashboard
GET /api/public/stats/donations?year=2026  # Dons mensuels par année
```

### Protégés (Authentification Requise)

#### Authentification

```
POST /api/auth/login              # Connexion
Body: {
  "email": "string",
  "password": "string"
}

POST /api/auth/logout             # Déconnexion
```

#### Utilisateurs

```
GET    /api/users                 # Liste des utilisateurs
GET    /api/users/{id}            # Détails d'un utilisateur
POST   /api/users                 # Créer un utilisateur
PUT    /api/users/{id}            # Modifier un utilisateur
DELETE /api/users/{id}            # Supprimer un utilisateur
```

#### Actualités (Gestion)

```
GET    /api/news                  # Liste complète
POST   /api/news                  # Créer une actualité
PUT    /api/news/{id}             # Modifier une actualité
DELETE /api/news/{id}             # Supprimer une actualité
PUT    /api/news/{id}/publish     # Publier une actualité
```

#### Contacts

```
GET    /api/contacts              # Liste des messages de contact
GET    /api/contacts/{id}         # Détails d'un contact
DELETE /api/contacts/{id}         # Supprimer un contact
PUT    /api/contacts/{id}/read    # Marquer comme lu
```

#### Paiements

```
GET    /api/payments              # Liste des paiements
GET    /api/payments/{id}         # Détails d'un paiement
POST   /api/payments              # Créer un paiement
```

#### Médias

```
POST   /api/media/upload          # Upload un fichier
GET    /api/media                 # Liste des médias
DELETE /api/media/{id}            # Supprimer un média
```

---

## 🔐 Authentification

### Système JWT avec Cookie HTTPOnly

L'authentification utilise JWT stocké dans un cookie HTTPOnly sécurisé.

#### Configuration

```properties
# application.properties
jwt.secret.key=${JWT_SECRET_KEY}
jwt.expiration.ms=86400000
jwt.cookie.name=authToken
jwt.cookie.secure=${JWT_COOKIE_SECURE:false}
jwt.cookie.max.age=86400
```

#### Processus de Login

1. Client envoie `email` et `password` à `/api/auth/login`
2. Backend valide les credentials
3. Backend génère un JWT
4. Backend créé un cookie HTTPOnly avec le JWT
5. Client reçoit le cookie automatiquement

#### Vérification d'Authentification

Le filtre `JwtAuthenticationFilter` intercepte toutes les requêtes et :

1. Extrait le JWT du cookie `authToken`
2. Valide le token
3. Charge l'utilisateur en contexte
4. Autorise ou rejette la requête

---

## 🗄️ Base de Données

### Configuration Supabase

```properties
spring.datasource.url=${SUPABASE_DB_URL}
spring.datasource.username=${SUPABASE_DB_USER}
spring.datasource.password=${SUPABASE_DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver
```

**Important** : Utilisez le **Session Pooler**, pas le Transaction Pooler.

### Migrations Flyway

Les migrations sont dans `src/main/resources/db/migration/`.

**Nommage** : `V{version}__{description}.sql`

Exemples :

- `V1__initial_schema.sql`
- `V2__add_news_table.sql`

#### Exécuter les Migrations

Les migrations s'exécutent automatiquement au démarrage de l'application.

#### Forcer une Migration

En cas d'erreur, vous pouvez forcer :

```sql
-- Supprimer l'historique Flyway
DELETE
FROM flyway_schema_history
WHERE version = '2';

-- Marquer une migration comme appliquée
INSERT INTO flyway_schema_history (version, description, type, script, checksum, installed_by, installed_on,
                                   execution_time, success)
VALUES ('2', 'add news table', 'SQL', 'V2__add_news_table.sql', 0, 'postgres', NOW(), 0, TRUE);
```

### Entités Principales

#### User

```java

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String email;
    private String password; // Hashé avec BCrypt
    private String firstName;
    private String lastName;
    private String role; // ADMIN, USER
    private LocalDateTime createdAt;
}
```

#### News

```java

@Entity
@Table(name = "news")
public class News {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String content;
    private String summary;
    private String imageUrl;
    private Boolean isPublished;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
}
```

#### Contact

```java

@Entity
@Table(name = "contacts")
public class Contact {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String subject;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
```

#### Payment

```java

@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Double amount;
    private String type; // DONATION, MEMBERSHIP
    private String status; // PENDING, COMPLETED, FAILED
    private String helloAssoId;
    private LocalDateTime createdAt;

    @ManyToOne
    private User user;
}
```

---

## 📁 Stockage S3 (Supabase Storage)

### Configuration

```properties
s3.access.key.id=${S3_ACCESS_KEY_ID}
s3.secret.access.key=${S3_SECRET_ACCESS_KEY}
s3.bucket=${S3_BUCKET:medias-prod}
s3.region=${S3_REGION:eu-west-1}
s3.endpoint=${S3_ENDPOINT}
```

### Service S3

```java

@Service
public class S3Service {

    public String uploadFile(MultipartFile file) {
        String fileName = generateUniqueFileName(file.getOriginalFilename());

        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(fileName)
                        .build(),
                RequestBody.fromInputStream(file.getInputStream(), file.getSize())
        );

        return getPublicUrl(fileName);
    }

    public void deleteFile(String fileKey) {
        s3Client.deleteObject(
                DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(fileKey)
                        .build()
        );
    }
}
```

---

## 🔒 Configuration CORS

### CorsConfig.java

```java

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${cors.allowed.origins}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins.split(","))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### Configuration

```properties
cors.allowed.origins=http://localhost:3000,http://localhost:3001,https://stemadeleine.fr,https://dashboard.stemadeleine.fr
```

---

## 🛡️ Validation reCAPTCHA

### Service de Validation

```java

@Service
public class RecaptchaService {

    @Value("${recaptcha.secret.key}")
    private String secretKey;

    private static final String RECAPTCHA_VERIFY_URL =
            "https://www.google.com/recaptcha/api/siteverify";

    public boolean verify(String token) {
        try {
            String params = "secret=" + secretKey + "&response=" + token;

            RestTemplate restTemplate = new RestTemplate();
            RecaptchaResponse response = restTemplate.postForObject(
                    RECAPTCHA_VERIFY_URL + "?" + params,
                    null,
                    RecaptchaResponse.class
            );

            return response != null && response.isSuccess();
        } catch (Exception e) {
            return false;
        }
    }
}
```

### Utilisation

```java

@PostMapping("/contact")
public ResponseEntity<?> createContact(@RequestBody CreateContactRequest request) {

    // Valider reCAPTCHA
    if (!recaptchaService.verify(request.getRecaptchaToken())) {
        return ResponseEntity.badRequest()
                .body("Invalid reCAPTCHA verification");
    }

    // Créer le contact
    Contact contact = contactService.create(request);
    return ResponseEntity.ok(contact);
}
```

---

## 📊 Statistiques (Endpoints Dashboard)

### Dashboard KPIs

```java

@GetMapping("/stats/dashboard")
public DashboardStatsDTO getDashboardStats(@RequestParam(required = false) Integer year) {
    return DashboardStatsDTO.builder()
            .activeMembers(membershipRepository.countActiveForYear(year))
            .membershipAmount(paymentRepository.sumAmountByType(PaymentType.MEMBERSHIP))
            .donorsCount(paymentRepository.countDistinctUsersByType(PaymentType.DONATION))
            .donationsAmount(paymentRepository.sumAmountByType(PaymentType.DONATION))
            .build();
}
```

### Dons Mensuels

```java

@GetMapping("/stats/donations")
public DonationStatsDTO getDonationStats(@RequestParam(defaultValue = "2026") int year) {
    List<Object[]> monthlyData = paymentRepository.sumMonthlyByTypeAndYear(
            PaymentType.DONATION,
            year
    );

    double[] monthlyTotals = new double[12];
    for (Object[] row : monthlyData) {
        int month = (int) row[0] - 1; // 0-indexed
        double amount = (double) row[1];
        monthlyTotals[month] = amount;
    }

    return new DonationStatsDTO(year, monthlyTotals);
}
```

---

## 🧪 Tests

### Tests d'Intégration

```java

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
public class StatsControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testGetDashboardStats() throws Exception {
        mockMvc.perform(get("/api/stats/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeMembers").exists())
                .andExpect(jsonPath("$.donationsAmount").exists());
    }
}
```

### Configuration Test

```properties
# application-test.properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=create-drop
```

---

## 🚀 Déploiement sur Render

### Configuration

**Name** : `stemadeleine-api`  
**Language** : `Docker`  
**Root Directory** : `backend/api`  
**Dockerfile** : `Dockerfile`

### Variables d'Environnement

Voir **[DEPLOYMENT.md](../../DEPLOYMENT.md)** pour la liste complète.

### Dockerfile

```dockerfile
FROM eclipse-temurin:17-jdk-alpine as build
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 🐛 Débogage

### Logs Backend

```bash
# Logs locaux
tail -f logs/spring.log

# Logs Render
# Voir dans Render Dashboard > Logs
```

### Vérifier la Connexion DB

```java

@GetMapping("/test-db")
public String testDb() {
    try {
        dataSource.getConnection();
        return "DB Connection OK";
    } catch (Exception e) {
        return "DB Connection Failed: " + e.getMessage();
    }
}
```

### Vérifier S3

```java

@GetMapping("/test-s3")
public String testS3() {
    try {
        s3Client.listObjects(bucketName);
        return "S3 Connection OK";
    } catch (Exception e) {
        return "S3 Connection Failed: " + e.getMessage();
    }
}
```

---

## 📚 Documentation Complémentaire

- **[DEPLOYMENT.md](../../DEPLOYMENT.md)** - Guide de déploiement complet
- **[BACKOFFICE.md](../../BACKOFFICE.md)** - Guide du backoffice
- **[STEMADELEINE.md](../../STEMADELEINE.md)** - Guide du site principal

---

## 🔧 Maintenance

### Mise à Jour des Dépendances

```bash
./mvnw versions:display-dependency-updates
./mvnw versions:use-latest-releases
```

### Nettoyer le Build

```bash
./mvnw clean
```

### Rebuild Complet

```bash
./mvnw clean install -DskipTests
```

---

**✅ API backend prête pour la production !**
