# 部署配置文件

# Vercel 配置 (前端)
echo '{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}' > frontend/vercel.json

# Railway 配置 (后端)
echo 'web: npm start' > backend/Procfile

# 环境变量模板
echo '# Production Environment Variables
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=https://your-frontend-domain.vercel.app
' > backend/.env.production
