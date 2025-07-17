import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import type { LoginRequest } from '../types';

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values: LoginRequest) => {
    setLoading(true);
    console.log('🔍 Login attempt:', values);
    try {
      const response = await authService.login(values);
      console.log('📡 Login response:', response);
      
      if (response.success) {
        console.log('✅ Login successful, checking auth status...');
        console.log('🔑 Token stored:', authService.getToken());
        console.log('👤 User stored:', authService.getUser());
        console.log('🔒 Is authenticated:', authService.isAuthenticated());
        
        message.success('登录成功！');
        navigate('/dashboard');
      } else {
        message.error(response.error || '登录失败');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      message.error('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card
        style={{
          width: 400,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            船员管理系统
          </Title>
          <p style={{ color: '#666', fontSize: '14px' }}>
            ShipCrewHub - 专业的船员管理平台
          </p>
        </div>

        <Form
          name="login"
          size="large"
          onFinish={handleLogin}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 3, message: '密码至少3个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '8px',
                fontWeight: 'bold',
              }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <p style={{ color: '#666', fontSize: '12px' }}>
            测试账号: admin / admin
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
