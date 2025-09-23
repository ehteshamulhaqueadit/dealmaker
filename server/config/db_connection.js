import sequalize from "sequelize";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

const db_connection = new sequalize.Sequelize(
  process.env.DB_NAME || "my_database",
  process.env.DB_USER || "my_user",
  process.env.DB_PASSWORD || "my_password",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: process.env.DB_DIALECT || "postgres", // Default to PostgreSQL
    port: process.env.DB_PORT || 5432, // Default PostgreSQL port
    logging: false, // Disable logging for cleaner output
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Render uses self-signed certs
      },
    },
  }
);

// Test the database connection
async function testConnection() {
  try {
    await db_connection.authenticate();
    console.log("Database connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
}

export { db_connection, testConnection };
