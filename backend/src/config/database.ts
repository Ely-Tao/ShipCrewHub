import mysql from "mysql2/promise";
import Redis from "redis";
import dotenv from "dotenv";

dotenv.config();

// 解析数据库连接 URL
const parseDbUrl = (url: string) => {
  try {
    const dbUrl = new URL(url);
    return {
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port) || 3306,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1), // 移除开头的 '/'
    };
  } catch (error) {
    console.error("❌ 数据库 URL 解析失败:", error);
    return null;
  }
};

// MySQL 连接配置
export const mysqlConfig = (() => {
  // 打印环境变量调试信息
  console.log("🔍 环境变量调试信息:");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("DATABASE_URL 存在:", !!process.env.DATABASE_URL);
  console.log("MYSQL_URL 存在:", !!process.env.MYSQL_URL);
  console.log("POSTGRESQL_URL 存在:", !!process.env.POSTGRESQL_URL);

  // 优先使用 Railway 的数据库连接 URL
  const databaseUrl =
    process.env.DATABASE_URL ||
    process.env.MYSQL_URL ||
    process.env.POSTGRESQL_URL;

  if (databaseUrl) {
    console.log("🚀 使用 Railway 数据库连接");
    console.log("🔗 数据库 URL 前缀:", databaseUrl.substring(0, 20) + "...");
    const parsed = parseDbUrl(databaseUrl);
    if (parsed) {
      console.log("✅ 数据库 URL 解析成功:");
      console.log("  - Host:", parsed.host);
      console.log("  - Port:", parsed.port);
      console.log("  - Database:", parsed.database);
      console.log("  - User:", parsed.user);
      return {
        ...parsed,
        connectionLimit: 10,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        charset: "utf8mb4",
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : undefined,
      };
    }
  }

  // 回退到传统的环境变量配置（本地开发）
  console.log("🏠 使用本地数据库配置");
  return {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "shipcrewdb_dev",
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    charset: "utf8mb4",
  };
})();

// Redis 连接配置
export const redisConfig = (() => {
  // 优先使用 Railway 的 Redis 连接 URL
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    console.log("🚀 使用 Railway Redis 连接");
    return {
      url: redisUrl,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    };
  }

  // 回退到传统的环境变量配置（本地开发）
  console.log("🏠 使用本地 Redis 配置");
  return {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || undefined,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
  };
})();

// 创建 MySQL 连接池
export const createMySQLPool = () => {
  try {
    console.log("🔄 正在创建 MySQL 连接池...");
    console.log("📋 连接配置:", {
      host: mysqlConfig.host,
      port: mysqlConfig.port,
      database: mysqlConfig.database,
      user: mysqlConfig.user,
      ssl: (mysqlConfig as any).ssl,
      hasPassword: !!mysqlConfig.password,
    });

    const pool = mysql.createPool(mysqlConfig);
    console.log("✅ MySQL 连接池创建成功");
    return pool;
  } catch (error) {
    console.error("❌ MySQL 连接池创建失败:", error);
    throw error;
  }
};

// 创建 Redis 连接
export const createRedisClient = () => {
  try {
    const client = Redis.createClient(redisConfig);

    client.on("connect", () => {
      console.log("✅ Redis 连接成功");
    });

    client.on("error", (error) => {
      console.error("❌ Redis 连接错误:", error);
    });

    client.on("ready", () => {
      console.log("✅ Redis 客户端准备就绪");
    });

    return client;
  } catch (error) {
    console.error("❌ Redis 客户端创建失败:", error);
    throw error;
  }
};

// 测试数据库连接
export const testConnections = async () => {
  try {
    // 测试 MySQL 连接
    const pool = createMySQLPool();
    const connection = await pool.getConnection();
    await connection.execute("SELECT 1 as test");
    connection.release();
    console.log("✅ MySQL 连接测试成功");

    // 测试 Redis 连接
    const redisClient = createRedisClient();
    await redisClient.connect();
    await redisClient.ping();
    console.log("✅ Redis 连接测试成功");
    await redisClient.disconnect();

    return true;
  } catch (error) {
    console.error("❌ 数据库连接测试失败:", error);
    return false;
  }
};
