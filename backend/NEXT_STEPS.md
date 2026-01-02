# Bean Score Backend - Next Steps

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
