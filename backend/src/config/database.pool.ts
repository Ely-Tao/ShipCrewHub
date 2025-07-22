import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// 解析数据库连接 URL
const parseDbUrl = (url: string) => {
  try {
    console.log("🔍 [database.pool] 解析数据库 URL...");
    const dbUrl = new URL(url);
    const result = {
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port) || 3306,
      user: decodeURIComponent(dbUrl.username),
      password: decodeURIComponent(dbUrl.password),
      database: dbUrl.pathname.slice(1), // 移除开头的 '/'
    };
    console.log("✅ [database.pool] URL 解析成功:", {
      host: result.host,
      port: result.port,
      database: result.database,
      user: result.user,
    });
    return result;
  } catch (error) {
    console.error("❌ [database.pool] URL 解析失败:", error);
    return null;
  }
};

const createConfig = () => {
  // 优先使用 Railway 的数据库连接 URL
  const databaseUrl =
    process.env.DATABASE_URL ||
    process.env.MYSQL_URL ||
    process.env.POSTGRESQL_URL;

  if (databaseUrl) {
    console.log("🚀 [database.pool] 使用 Railway 数据库连接");
    const parsed = parseDbUrl(databaseUrl);
    if (parsed) {
      return {
        ...parsed,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: "utf8mb4",
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : undefined,
        connectTimeout: 60000,
        acquireTimeout: 60000,
        timeout: 60000,
      };
    }
  }

  // 回退到传统配置（本地开发）
  console.log("🏠 [database.pool] 使用本地数据库配置");
  return {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "shipcrewdb_dev",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: "utf8mb4",
  };
};

const config = createConfig();

export const pool = mysql.createPool(config);

// 测试数据库连接
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully");
    connection.release();
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
};

// 关闭数据库连接池
export const closePool = async () => {
  try {
    await pool.end();
    console.log("Database connection pool closed");
  } catch (error) {
    console.error("Error closing database connection pool:", error);
  }
};
