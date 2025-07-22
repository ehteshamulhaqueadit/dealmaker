-- Drop and recreate the database
DROP DATABASE IF EXISTS "dealmaker";

CREATE DATABASE "dealmaker"
WITH
OWNER = postgres
ENCODING = 'UTF8'
LC_COLLATE = 'English_United States.1252'
LC_CTYPE = 'English_United States.1252'
LOCALE_PROVIDER = 'libc'
TABLESPACE = pg_default
CONNECTION LIMIT = -1
IS_TEMPLATE = false;

COMMENT ON DATABASE "dealmaker"
IS 'This is the main database for my project';

-- Create a secure app role
CREATE ROLE "username" WITH
LOGIN
PASSWORD 'your_secure_password' -- Replace with your actual password
NOSUPERUSER
NOCREATEDB
NOCREATEROLE
INHERIT
NOREPLICATION
NOBYPASSRLS;

-- Grant full access to the database
GRANT ALL PRIVILEGES ON DATABASE "dealmaker" TO "username";

-- Connect to the 'dealmaker' database as postgres and run the following:
GRANT USAGE, CREATE ON SCHEMA public TO "username";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "username";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO "username";

-- Ensure future tables are accessible
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO "username";
