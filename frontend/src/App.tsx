import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import Dashboard from './pages/Dashboard';
import CrewListPage from './pages/CrewListPage';
import ShipListPage from './pages/ShipListPage';
import CertificateListPage from './pages/CertificateListPage';
import LeaveListPage from './pages/LeaveListPage';
import authService from './services/authService';
import 'antd/dist/reset.css';
import './App.css';

// 私有路由组件
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return authService.isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

// 公共路由组件
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return authService.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          {/* 公共路由 */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          
          {/* 私有路由 */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="crew/list" element={<CrewListPage />} />
            <Route path="crew/add" element={<div>添加船员页面</div>} />
            <Route path="ships/list" element={<ShipListPage />} />
            <Route path="ships/add" element={<div>添加船舶页面</div>} />
            <Route path="certificates/list" element={<CertificateListPage />} />
            <Route path="certificates/expiring" element={<div>到期证书页面</div>} />
            <Route path="leave/list" element={<LeaveListPage />} />
            <Route path="leave/apply" element={<div>申请请假页面</div>} />
            <Route path="reports/crew" element={<div>船员报表页面</div>} />
            <Route path="reports/ship" element={<div>船舶报表页面</div>} />
            <Route index element={<Navigate to="/dashboard" replace />} />
          </Route>
          
          {/* 默认重定向 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
