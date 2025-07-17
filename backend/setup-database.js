#!/usr/bin/env node

const { pool } = require('./dist/config/database.pool');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');
    
    // 读取建表SQL
    const schemaPath = path.join(__dirname, '../database/schemas/create_tables.sql');
    const createTableSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // 分割SQL语句
    const statements = createTableSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    const connection = await pool.getConnection();
    
    try {
      // 执行每个SQL语句
      for (const statement of statements) {
        console.log(`📋 Executing: ${statement.substring(0, 50)}...`);
        await connection.execute(statement);
      }
      
      console.log('✅ Database migrations completed successfully');
      
      // 运行种子数据
      await seedDatabase(connection);
      
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    throw error;
  }
}

async function seedDatabase(connection) {
  try {
    console.log('🌱 Starting database seeding...');
    
    // 读取种子数据
    const seedsPath = path.join(__dirname, '../database/seeds');
    const seedFile = path.join(seedsPath, '001_initial_data.sql');
    if (!fs.existsSync(seedFile)) {
      console.log('⚠️  No seed file found, skipping seeding');
      return;
    }
    
    const seedSQL = fs.readFileSync(seedFile, 'utf8');
    
    // 分割SQL语句
    const statements = seedSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // 执行每个SQL语句
    for (const statement of statements) {
      console.log(`🌱 Executing: ${statement.substring(0, 50)}...`);
      await connection.execute(statement);
    }
    
    console.log('✅ Database seeding completed successfully');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// 运行迁移
runMigrations()
  .then(() => {
    console.log('🎉 Database setup completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Database setup failed:', error);
    process.exit(1);
  });
