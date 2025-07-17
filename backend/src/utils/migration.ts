import fs from 'fs';
import path from 'path';
import { pool } from '../config/database.pool';

export class DatabaseMigration {
  private schemaPath = path.join(__dirname, '../../../database/schemas/create_tables.sql');
  private seedPath = path.join(__dirname, '../../../database/seeds/');
  
  async runMigrations() {
    try {
      console.log('Starting database migrations...');
      
      // 读取并执行建表SQL
      const createTableSQL = fs.readFileSync(this.schemaPath, 'utf8');
      
      // 分割SQL语句（通过分号分割）
      const statements = createTableSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      const connection = await pool.getConnection();
      
      try {
        // 执行每个SQL语句
        for (const statement of statements) {
          console.log(`Executing: ${statement.substring(0, 50)}...`);
          await connection.execute(statement);
        }
        
        console.log('Database migrations completed successfully');
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Database migration failed:', error);
      throw error;
    }
  }
  
  async seedDatabase() {
    try {
      console.log('Starting database seeding...');
      
      // 检查seed目录是否存在
      if (!fs.existsSync(this.seedPath)) {
        console.log('No seed directory found, skipping seeding');
        return;
      }
      
      const seedFiles = fs.readdirSync(this.seedPath)
        .filter(file => file.endsWith('.sql'))
        .sort();
      
      const connection = await pool.getConnection();
      
      try {
        for (const file of seedFiles) {
          console.log(`Seeding from: ${file}`);
          const seedSQL = fs.readFileSync(path.join(this.seedPath, file), 'utf8');
          
          const statements = seedSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);
          
          for (const statement of statements) {
            await connection.execute(statement);
          }
        }
        
        console.log('Database seeding completed successfully');
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Database seeding failed:', error);
      throw error;
    }
  }
  
  async dropTables() {
    try {
      console.log('Dropping all tables...');
      
      const connection = await pool.getConnection();
      
      try {
        // 获取所有表名
        const [tables] = await connection.execute<any[]>(`
          SELECT TABLE_NAME 
          FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_SCHEMA = DATABASE()
        `);
        
        // 禁用外键检查
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        // 删除所有表
        for (const table of tables) {
          await connection.execute(`DROP TABLE IF EXISTS ${table.TABLE_NAME}`);
        }
        
        // 重新启用外键检查
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        
        console.log('All tables dropped successfully');
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Failed to drop tables:', error);
      throw error;
    }
  }
  
  async resetDatabase() {
    await this.dropTables();
    await this.runMigrations();
    await this.seedDatabase();
  }
}

// CLI 入口
if (require.main === module) {
  const migration = new DatabaseMigration();
  const command = process.argv[2];
  
  (async () => {
    try {
      switch (command) {
        case 'migrate':
          await migration.runMigrations();
          break;
        case 'seed':
          await migration.seedDatabase();
          break;
        case 'drop':
          await migration.dropTables();
          break;
        case 'reset':
          await migration.resetDatabase();
          break;
        default:
          console.log('Usage: npm run migrate [migrate|seed|drop|reset]');
      }
    } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    } finally {
      process.exit(0);
    }
  })();
}
