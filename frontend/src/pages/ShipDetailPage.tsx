import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Descriptions,
  Button,
  Space,
  Tag,
  Divider,
  Modal,
  message,
  Spin,
  Avatar,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  ShopOutlined,
  UserOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { type Ship, type ShipStatus } from '../types';
import shipService from '../services/shipService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ShipDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [ship, setShip] = useState<Ship | null>(null);

  useEffect(() => {
    if (id) {
      loadShipData();
    }
  }, [id]);

  const loadShipData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await shipService.getShipById(Number(id));
      if (response && response.data) {
        setShip(response.data);
      }
    } catch (error) {
      message.error('获取船舶信息失败');
      navigate('/ships/list');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/ships/edit/${id}`);
  };

  const handleDelete = () => {
    if (!ship) return;
    
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除船舶 "${ship.name}" 吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          await shipService.deleteShip(ship.id);
          message.success('删除成功');
          navigate('/ships/list');
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleBack = () => {
    navigate('/ships/list');
  };

  const getStatusColor = (status: ShipStatus) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      case 'maintenance':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: ShipStatus) => {
    switch (status) {
      case 'active':
        return '在运行';
      case 'inactive':
        return '停运';
      case 'maintenance':
        return '维护中';
      default:
        return '未知';
    }
  };

  const getShipTypeText = (type: string) => {
    switch (type) {
      case 'cargo':
        return '货船';
      case 'passenger':
        return '客船';
      case 'tanker':
        return '油轮';
      case 'container':
        return '集装箱船';
      case 'other':
        return '其他';
      default:
        return '未知';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!ship) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Text>船舶信息不存在</Text>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
                  返回列表
                </Button>
                <Title level={4} style={{ margin: 0 }}>
                  船舶详情
                </Title>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button 
                  type="primary" 
                  icon={<EditOutlined />} 
                  onClick={handleEdit}
                >
                  编辑
                </Button>
                <Button 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={handleDelete}
                >
                  删除
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Row gutter={24}>
          <Col span={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <Avatar size={100} icon={<ShopOutlined />} />
                <Title level={3} style={{ marginTop: 16 }}>
                  {ship.name}
                </Title>
                <Tag color={getStatusColor(ship.status)}>
                  {getStatusText(ship.status)}
                </Tag>
                <Divider />
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <InfoCircleOutlined /> {ship.ship_number}
                  </div>
                  <div>
                    <ShopOutlined /> {getShipTypeText(ship.ship_type)}
                  </div>
                  <div>
                    <UserOutlined /> {ship.crew_count || 0} 名船员
                  </div>
                  <div>
                    <CalendarOutlined /> 注册于{dayjs(ship.created_at).format('YYYY年MM月')}
                  </div>
                </Space>
              </div>
            </Card>
          </Col>
          
          <Col span={16}>
            <Card title="基本信息">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="船舶名称">
                  {ship.name}
                </Descriptions.Item>
                <Descriptions.Item label="船舶编号">
                  <Text code>{ship.ship_number}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="船舶类型">
                  {getShipTypeText(ship.ship_type)}
                </Descriptions.Item>
                <Descriptions.Item label="载重量">
                  {ship.capacity} 吨
                </Descriptions.Item>
                <Descriptions.Item label="船员数量">
                  {ship.crew_count || 0} 名
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={getStatusColor(ship.status)}>
                    {getStatusText(ship.status)}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="船舶信息" style={{ marginTop: 16 }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="创建时间">
                  {ship.created_at ? dayjs(ship.created_at).format('YYYY-MM-DD HH:mm') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {ship.updated_at ? dayjs(ship.updated_at).format('YYYY-MM-DD HH:mm') : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ShipDetailPage;
