#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'shipcrewdb_dev'
    });
    
    console.log('✅ Database connection successful');
    
    // 测试查询
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test successful:', rows);
    
    // 检查表是否存在
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tables in database:', tables);
    
    // 如果有用户表，检查数据
    if (tables.some(table => Object.values(table)[0] === 'users')) {
      const [users] = await connection.execute('SELECT username FROM users LIMIT 5');
      console.log('👥 Users in database:', users);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 MySQL server is not running. Please start MySQL server first.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 Database does not exist. Creating database...');
      await createDatabase();
    }
  }
}

async function createDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: ''
    });
    
    await connection.execute('CREATE DATABASE IF NOT EXISTS shipcrewdb_dev');
    console.log('✅ Database created successfully');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Failed to create database:', error.message);
  }
}

testConnection();
