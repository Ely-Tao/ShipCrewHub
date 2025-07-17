import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Tag, Alert, Spin } from 'antd';
import { 
  UserOutlined, 
  ShopOutlined, 
  TeamOutlined, 
  CalendarOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import shipService from '../services/shipService';
import type { StatsData } from '../types';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await shipService.getShipStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || '加载数据失败');
      }
    } catch (err) {
      setError('加载数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 模拟数据，实际应该从API获取
  const mockStats: StatsData = {
    totalShips: 12,
    totalCrew: 156,
    totalShorePersonnel: 45,
    pendingLeaves: 8,
    expiringCertificates: 5,
  };

  const recentActivities = [
    { id: 1, type: 'crew', action: '新增船员', name: '张三', time: '2小时前' },
    { id: 2, type: 'leave', action: '请假申请', name: '李四', time: '3小时前' },
    { id: 3, type: 'certificate', action: '证书即将到期', name: '王五', time: '1天前' },
    { id: 4, type: 'ship', action: '船舶状态更新', name: '海洋之星', time: '2天前' },
  ];

  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap = {
          crew: { text: '船员', color: 'blue' },
          leave: { text: '请假', color: 'orange' },
          certificate: { text: '证书', color: 'red' },
          ship: { text: '船舶', color: 'green' },
        };
        const config = typeMap[type as keyof typeof typeMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: '对象',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="加载失败"
        description={error}
        type="error"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  }

  const currentStats = stats || mockStats;

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        系统概览
      </Title>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总船舶数"
              value={currentStats.totalShips}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总船员数"
              value={currentStats.totalCrew}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="岸基人员"
              value={currentStats.totalShorePersonnel}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="待审请假"
              value={currentStats.pendingLeaves}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 证书到期提醒 */}
        <Col xs={24} md={12}>
          <Card title="证书到期提醒" extra={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Statistic
                title="即将到期证书"
                value={currentStats.expiringCertificates}
                suffix="个"
                valueStyle={{ color: '#ff4d4f' }}
              />
              <p style={{ marginTop: 8, color: '#666' }}>
                需要及时更新证书以确保合规性
              </p>
            </div>
          </Card>
        </Col>

        {/* 最近活动 */}
        <Col xs={24} md={12}>
          <Card title="最近活动" extra={<a href="#">查看更多</a>}>
            <Table
              columns={columns}
              dataSource={recentActivities}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>

      {/* 快速操作 */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="快速操作">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8} md={6}>
                <Card 
                  hoverable 
                  style={{ textAlign: 'center' }}
                  onClick={() => console.log('添加船员')}
                >
                  <TeamOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <p style={{ marginTop: 8 }}>添加船员</p>
                </Card>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Card 
                  hoverable 
                  style={{ textAlign: 'center' }}
                  onClick={() => console.log('添加船舶')}
                >
                  <ShopOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  <p style={{ marginTop: 8 }}>添加船舶</p>
                </Card>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Card 
                  hoverable 
                  style={{ textAlign: 'center' }}
                  onClick={() => console.log('申请请假')}
                >
                  <CalendarOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
                  <p style={{ marginTop: 8 }}>申请请假</p>
                </Card>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Card 
                  hoverable 
                  style={{ textAlign: 'center' }}
                  onClick={() => console.log('查看报表')}
                >
                  <ExclamationCircleOutlined style={{ fontSize: 24, color: '#722ed1' }} />
                  <p style={{ marginTop: 8 }}>查看报表</p>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
