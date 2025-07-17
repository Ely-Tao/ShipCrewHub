import mysql from 'mysql2/promise';
import Redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// MySQL 连接配置
export const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shipcrewdb_dev',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4'
};

// Redis 连接配置
export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
};

// 创建 MySQL 连接池
export const createMySQLPool = () => {
  try {
    const pool = mysql.createPool(mysqlConfig);
    console.log('✅ MySQL 连接池创建成功');
    return pool;
  } catch (error) {
    console.error('❌ MySQL 连接池创建失败:', error);
    throw error;
  }
};

// 创建 Redis 连接
export const createRedisClient = () => {
  try {
    const client = Redis.createClient(redisConfig);
    
    client.on('connect', () => {
      console.log('✅ Redis 连接成功');
    });
    
    client.on('error', (error) => {
      console.error('❌ Redis 连接错误:', error);
    });
    
    client.on('ready', () => {
      console.log('✅ Redis 客户端准备就绪');
    });
    
    return client;
  } catch (error) {
    console.error('❌ Redis 客户端创建失败:', error);
    throw error;
  }
};

// 测试数据库连接
export const testConnections = async () => {
  try {
    // 测试 MySQL 连接
    const pool = createMySQLPool();
    const connection = await pool.getConnection();
    await connection.execute('SELECT 1 as test');
    connection.release();
    console.log('✅ MySQL 连接测试成功');
    
    // 测试 Redis 连接
    const redisClient = createRedisClient();
    await redisClient.connect();
    await redisClient.ping();
    console.log('✅ Redis 连接测试成功');
    await redisClient.disconnect();
    
    return true;
  } catch (error) {
    console.error('❌ 数据库连接测试失败:', error);
    return false;
  }
};
