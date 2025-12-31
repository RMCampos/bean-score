# Bean Score Backend - Next Steps

## Current Status ✅

**Completed:**
- ✅ Quarkus project initialized with all dependencies
- ✅ JWT RSA key pair generated (`src/main/resources/META-INF/resources/`)
- ✅ Application properties configured (base, dev, prod)
- ✅ CORS enabled for React frontend
- ✅ Project structure ready

**Location:** `/home/ricardo/Projects/beans-score/backend/`

---

## Next Implementation Steps

### Step 1: Set Up PostgreSQL with Docker (15-20 minutes)

Create `docker-compose.dev.yml` in the backend root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: beanscore-postgres
    environment:
      POSTGRES_DB: beanscore
      POSTGRES_USER: beanscore
      POSTGRES_PASSWORD: beanscore123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgresql/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U beanscore"]
      interval: 10s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: beanscore-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@beanscore.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Create `docker/postgresql/init.sql`:

```sql
-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Coffee Places Table
CREATE TABLE IF NOT EXISTS coffee_places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    instagram_handle VARCHAR(100),
    coffee_quality INTEGER CHECK (coffee_quality >= 1 AND coffee_quality <= 5),
    ambient INTEGER CHECK (ambient >= 1 AND ambient <= 5),
    has_gluten_free BOOLEAN DEFAULT FALSE,
    has_veg_milk BOOLEAN DEFAULT FALSE,
    has_vegan_food BOOLEAN DEFAULT FALSE,
    has_sugar_free BOOLEAN DEFAULT FALSE,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coffee_places_user_id ON coffee_places(user_id);
CREATE INDEX idx_coffee_places_created_at ON coffee_places(created_at DESC);
```

**Start PostgreSQL:**
```bash
cd /home/ricardo/Projects/beans-score/backend
docker-compose -f docker-compose.dev.yml up -d
```

---

### Step 2: Create JPA Entities (30-40 minutes)

#### Create User Entity

`src/main/java/com/beanscore/entity/User.java`:

```java
package com.beanscore.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @Column(unique = true, nullable = false)
    public String email;

    @Column(nullable = false)
    public String name;

    @Column(nullable = false)
    public String password; // BCrypt hash

    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

#### Create CoffeePlace Entity

`src/main/java/com/beanscore/entity/CoffeePlace.java`:

```java
package com.beanscore.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "coffee_places")
public class CoffeePlace extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @Column(name = "user_id", nullable = false)
    public UUID userId;

    @Column(nullable = false)
    public String name;

    @Column(nullable = false, length = 500)
    public String address;

    @Column(name = "instagram_handle")
    public String instagramHandle;

    @Min(1) @Max(5)
    @Column(name = "coffee_quality", nullable = false)
    public Integer coffeeQuality;

    @Min(1) @Max(5)
    @Column(nullable = false)
    public Integer ambient;

    @Column(name = "has_gluten_free")
    public Boolean hasGlutenFree = false;

    @Column(name = "has_veg_milk")
    public Boolean hasVegMilk = false;

    @Column(name = "has_vegan_food")
    public Boolean hasVeganFood = false;

    @Column(name = "has_sugar_free")
    public Boolean hasSugarFree = false;

    public Double latitude;
    public Double longitude;

    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

---

### Step 3: Create Panache Repositories (15 minutes)

#### UserRepository

`src/main/java/com/beanscore/repository/UserRepository.java`:

```java
package com.beanscore.repository;

import com.beanscore.entity.User;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class UserRepository implements PanacheRepositoryBase<User, UUID> {

    public Optional<User> findByEmail(String email) {
        return find("email", email).firstResultOptional();
    }

    public boolean existsByEmail(String email) {
        return count("email", email) > 0;
    }
}
```

#### CoffeePlaceRepository

`src/main/java/com/beanscore/repository/CoffeePlaceRepository.java`:

```java
package com.beanscore.repository;

import com.beanscore.entity.CoffeePlace;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class CoffeePlaceRepository implements PanacheRepositoryBase<CoffeePlace, UUID> {

    public List<CoffeePlace> findByUserId(UUID userId) {
        return list("userId", userId);
    }

    public Optional<CoffeePlace> findByIdAndUserId(UUID id, UUID userId) {
        return find("id = ?1 and userId = ?2", id, userId).firstResultOptional();
    }

    public long deleteByIdAndUserId(UUID id, UUID userId) {
        return delete("id = ?1 and userId = ?2", id, userId);
    }
}
```

---

### Step 4: Create DTOs (45-60 minutes)

Create the following DTO files in their respective packages:

**Request DTOs** (`src/main/java/com/beanscore/dto/request/`):
- `LoginRequest.java`
- `RegisterRequest.java`
- `CreateCoffeePlaceRequest.java`
- `UpdateCoffeePlaceRequest.java`

**Response DTOs** (`src/main/java/com/beanscore/dto/response/`):
- `AuthResponse.java`
- `UserResponse.java`
- `CoffeePlaceResponse.java`
- `ErrorResponse.java`

**Example - LoginRequest:**
```java
package com.beanscore.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class LoginRequest {

    @NotNull
    @Email
    public String email;

    @NotNull
    @Size(min = 6)
    public String password;
}
```

---

### Step 5: Implement Security Layer (30-45 minutes)

#### PasswordEncoder

`src/main/java/com/beanscore/security/PasswordEncoder.java`:

```java
package com.beanscore.security;

import io.quarkus.elytron.security.common.BcryptUtil;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class PasswordEncoder {

    public String encode(String rawPassword) {
        return BcryptUtil.bcryptHash(rawPassword);
    }

    public boolean matches(String rawPassword, String encodedPassword) {
        return BcryptUtil.matches(rawPassword, encodedPassword);
    }
}
```

#### JwtService

`src/main/java/com/beanscore/service/JwtService.java`:

```java
package com.beanscore.service;

import com.beanscore.entity.User;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.jwt.JsonWebToken;
import jakarta.inject.Inject;
import java.util.UUID;

@ApplicationScoped
public class JwtService {

    @Inject
    JsonWebToken jwt;

    public String generateToken(User user) {
        return Jwt.issuer("https://beanscore.com")
                .subject(user.id.toString())
                .claim("email", user.email)
                .claim("name", user.name)
                .expiresIn(604800) // 7 days
                .sign();
    }

    public UUID getCurrentUserId() {
        return UUID.fromString(jwt.getSubject());
    }
}
```

---

### Step 6: Implement Service Layer (60-90 minutes)

Create these service classes:
- `AuthService.java` - Registration, login, getCurrentUser
- `UserService.java` - Delete user
- `CoffeePlaceService.java` - CRUD operations

Add `@Transactional` to write operations.

---

### Step 7: Create Exception Handling (30 minutes)

Create custom exceptions and `GlobalExceptionMapper` to return consistent JSON error responses.

---

### Step 8: Implement REST Resources (60-90 minutes)

Create these resource classes:
- `AuthResource.java` - /auth/register, /auth/login, /auth/me
- `UserResource.java` - DELETE /users/{userId}
- `CoffeePlaceResource.java` - Full CRUD for /places
- `HealthResource.java` - GET /health (already exists)

Add `@RolesAllowed("user")` to protected endpoints.

---

### Step 9: Test the API (30 minutes)

**Start the dev server:**
```bash
cd /home/ricardo/Projects/beans-score/backend
./mvnw quarkus:dev
```

**Test endpoints:**
- Access Swagger UI: http://localhost:8080/q/swagger-ui
- Health check: http://localhost:8080/health
- Register user via API

---

### Step 10: Write Tests (Optional - 2-3 hours)

Create test classes in `src/test/java/com/beanscore/resource/`:
- `AuthResourceTest.java`
- `CoffeePlaceResourceTest.java`
- `UserResourceTest.java`

---

### Step 11: Native Build & Docker (60 minutes)

1. Add `@RegisterForReflection` to entities and DTOs
2. Test native build: `./mvnw package -Pnative`
3. Create `Dockerfile.native` and `docker-compose.yml`

---

## Quick Reference

**Start PostgreSQL:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Run Quarkus Dev Mode:**
```bash
./mvnw quarkus:dev
```

**Build JVM:**
```bash
./mvnw package
```

**Build Native:**
```bash
./mvnw package -Pnative
```

**Run Tests:**
```bash
./mvnw test
```

---

## Resources

- **Quarkus Guides:** https://quarkus.io/guides/
- **Panache Guide:** https://quarkus.io/guides/hibernate-orm-panache
- **JWT Guide:** https://quarkus.io/guides/security-jwt
- **Plan File:** `/home/ricardo/.claude/plans/melodic-puzzling-wigderson.md`

---

## Estimated Time to Complete

- **Minimal (Auth + CRUD):** 4-5 hours
- **Complete (with tests):** 7-10 hours
- **Production-ready (with Docker):** 10-12 hours

Ready to continue? Just ask Claude to resume from this file!
