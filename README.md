# ProcessServe Project

This project is a microservices-based application using Spring Boot (Backend) and Next.js (Frontend).

## Prerequisites

- **Java 17+**
- **Maven**
- **Node.js 18+**
- **MySQL 8.0+**

## Database Setup

1.  Create a MySQL database named `processserve_db`.
2.  Import the schema and seed data:
    ```bash
    mysql -u dbuser -p processserve_db < database/schema.sql
    ```
    *(Adjust username/password as needed. Default configured user is `dbuser` with password `dbuser!!`)*
    *Note: `schema.sql` contains both the structure and the initial data.*

## Configuration

The backend services are configured to connect to MySQL at `localhost:3306`.
If your database is on a different host (e.g., `ezutil`), you can update the `application.yml` files in each service or set the `SPRING_DATASOURCE_URL` environment variable.

**Services:**
- Auth Service: `backend/auth-service/src/main/resources/application.yml`
- Tenant Service: `backend/tenant-service/src/main/resources/application.yml`
- Order Service: `backend/order-service/src/main/resources/application.yml`
- Notification Service: `backend/notification-service/src/main/resources/application.yml`
- User Service: `backend/user-service/src/main/resources/application.yml`

## Running the Application

### Backend

To start all backend services:

```bash
./start_backend.sh
```

This will start:
- Discovery Server (Eureka): http://localhost:8761
- API Gateway: http://localhost:8080
- Auth, Tenant, Order, Notification, User Services

### Frontend

To start all frontend portals:

```bash
./start_frontend.sh
```

This will start:
- Home Page: http://localhost:3000
- Delivery Portal: http://localhost:3001
- Admin Panel: http://localhost:3002
- Super Admin: http://localhost:3003
- Customer Portal: http://localhost:3004

## Stopping

The start scripts automatically try to kill processes on the relevant ports before starting.
To manually stop, you can use `kill` on the ports or `pkill -f java` / `pkill -f node` (be careful with these commands).
