import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, message, Typography } from 'antd';
import {
  UserOutlined,
  ShopOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  DashboardOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import type { User } from '../types';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentUser = authService.getUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    message.success('已退出登录');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        个人资料
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        设置
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  const sidebarMenu = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: '/crew',
      icon: <TeamOutlined />,
      label: '船员管理',
      children: [
        { key: '/crew/list', label: '船员列表' },
        { key: '/crew/add', label: '添加船员' },
      ],
    },
    {
      key: '/ships',
      icon: <ShopOutlined />,
      label: '船舶管理',
      children: [
        { key: '/ships/list', label: '船舶列表' },
        { key: '/ships/add', label: '添加船舶' },
      ],
    },
    {
      key: '/certificates',
      icon: <SafetyCertificateOutlined />,
      label: '证书管理',
      children: [
        { key: '/certificates/list', label: '证书列表' },
        { key: '/certificates/expiring', label: '到期提醒' },
      ],
    },
    {
      key: '/leave',
      icon: <CalendarOutlined />,
      label: '请假管理',
      children: [
        { key: '/leave/list', label: '请假列表' },
        { key: '/leave/apply', label: '申请请假' },
      ],
    },
    {
      key: '/reports',
      icon: <FileTextOutlined />,
      label: '报表统计',
      children: [
        { key: '/reports/crew', label: '船员报表' },
        { key: '/reports/ship', label: '船舶报表' },
      ],
    },
  ];

  // 根据用户权限过滤菜单
  const getFilteredMenu = () => {
    if (!user) return [];
    
    return sidebarMenu.filter(item => {
      // 这里可以根据用户角色过滤菜单项
      if (item.key === '/reports' && !authService.isAdmin()) {
        return false;
      }
      return true;
    });
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="light"
        style={{ 
          boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)',
        }}
      >
        <div style={{ 
          padding: '16px', 
          textAlign: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            {collapsed ? 'SCH' : 'ShipCrewHub'}
          </Title>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ borderRight: 0 }}
          items={getFilteredMenu()}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout>
        <Header style={{ 
          padding: '0 16px', 
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
            <Title level={4} style={{ margin: 0, marginLeft: 16 }}>
              船员管理系统
            </Title>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: 16 }}>欢迎，{user.username}</span>
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Avatar
                style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
                icon={<UserOutlined />}
              />
            </Dropdown>
          </div>
        </Header>

        <Content style={{ 
          margin: '24px 16px',
          padding: '24px',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
