-- Combined initialization script for Docker
-- This runs both schema creation and seeding

SOURCE /docker-entrypoint-initdb.d/schema.sql;
SOURCE /docker-entrypoint-initdb.d/seed.sql;
