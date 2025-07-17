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
  Avatar,
  Divider,
  Modal,
  message,
  Spin,
  Tabs,
  Table,
  Timeline,
  Badge,
  Statistic,
  Progress,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  BankOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { type CrewMember } from '../types';
import crewService from '../services/crewService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const CrewDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [crew, setCrew] = useState<CrewMember | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  // 模拟数据 - 实际项目中这些数据应该从后端获取
  const [certificates] = useState([
    {
      id: 1,
      type: '海员证',
      number: 'SM2023001',
      issueDate: '2023-01-15',
      expiryDate: '2028-01-15',
      status: 'active',
      authority: '中华人民共和国海事局'
    },
    {
      id: 2,
      type: '基本安全培训证书',
      number: 'BST2023002',
      issueDate: '2023-02-10',
      expiryDate: '2025-02-10',
      status: 'expiring',
      authority: '海事培训中心'
    }
  ]);

  const [transferHistory] = useState([
    {
      id: 1,
      fromShip: '海运1号',
      toShip: '海运2号',
      transferDate: '2024-06-15',
      reason: '业务调整',
      status: 'completed'
    },
    {
      id: 2,
      fromShip: '海运2号',
      toShip: '海运3号',
      transferDate: '2024-12-01',
      reason: '职位晋升',
      status: 'completed'
    }
  ]);

  useEffect(() => {
    if (id) {
      loadCrewData();
    }
  }, [id]);

  const loadCrewData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await crewService.getCrewById(Number(id));
      if (response && response.data) {
        setCrew(response.data);
      }
    } catch (error) {
      message.error('获取船员信息失败');
      navigate('/crew/list');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/crew/edit/${id}`);
  };

  const handleDelete = () => {
    if (!crew) return;
    
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除船员 "${crew.name}" 吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          await crewService.deleteCrew(crew.id);
          message.success('删除成功');
          navigate('/crew/list');
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleBack = () => {
    navigate('/crew/list');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      case 'on_leave':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '在职';
      case 'inactive':
        return '离职';
      case 'on_leave':
        return '休假';
      default:
        return '未知';
    }
  };

  const getGenderText = (gender: string) => {
    return gender === 'male' ? '男' : '女';
  };

  const getMaritalStatusText = (status: string) => {
    switch (status) {
      case 'single':
        return '未婚';
      case 'married':
        return '已婚';
      case 'divorced':
        return '离异';
      case 'widowed':
        return '丧偶';
      default:
        return '未知';
    }
  };

  const getEducationText = (education: string) => {
    switch (education) {
      case 'primary':
        return '小学';
      case 'junior':
        return '初中';
      case 'senior':
        return '高中';
      case 'college':
        return '专科';
      case 'bachelor':
        return '本科';
      case 'master':
        return '硕士';
      case 'doctor':
        return '博士';
      default:
        return '未知';
    }
  };

  const getDepartmentText = (department: string) => {
    switch (department) {
      case 'deck':
        return '甲板部';
      case 'engine':
        return '轮机部';
      case 'catering':
        return '餐饮部';
      case 'general':
        return '综合部';
      default:
        return '未知';
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '-';
    return dayjs().diff(dayjs(birthDate), 'year');
  };

  const getCertificateStatus = (expiryDate: string) => {
    const today = dayjs();
    const expiry = dayjs(expiryDate);
    const daysUntilExpiry = expiry.diff(today, 'day');
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'red', text: '已过期' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', color: 'orange', text: '即将过期' };
    } else {
      return { status: 'active', color: 'green', text: '有效' };
    }
  };

  const certificateColumns = [
    {
      title: '证书类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '证书编号',
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: '签发日期',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '到期日期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '状态',
      dataIndex: 'expiryDate',
      key: 'status',
      render: (expiryDate: string) => {
        const { color, text } = getCertificateStatus(expiryDate);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '签发机构',
      dataIndex: 'authority',
      key: 'authority',
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!crew) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Text>船员信息不存在</Text>
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
                  船员详情
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

        {/* 船员基本信息卡片 */}
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <Avatar size={100} icon={<UserOutlined />} />
                <Title level={3} style={{ marginTop: 16, marginBottom: 8 }}>
                  {crew.name}
                </Title>
                <Tag color={getStatusColor(crew.status)} style={{ marginBottom: 16 }}>
                  {getStatusText(crew.status)}
                </Tag>
                <Divider />
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div>
                    <PhoneOutlined style={{ marginRight: 8 }} />
                    {crew.phone}
                  </div>
                  <div>
                    <BankOutlined style={{ marginRight: 8 }} />
                    {getDepartmentText(crew.department)}
                  </div>
                  <div>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    入职 {dayjs(crew.join_date).format('YYYY年MM月')}
                  </div>
                </Space>
              </div>
            </Card>
          </Col>
          
          <Col span={16}>
            <Row gutter={16}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="工作年限"
                    value={dayjs().diff(dayjs(crew.join_date), 'year')}
                    suffix="年"
                    prefix={<CalendarOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="年龄"
                    value={calculateAge(crew.birth_date)}
                    suffix="岁"
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="证书状态"
                    value={certificates.filter(cert => getCertificateStatus(cert.expiryDate).status === 'active').length}
                    suffix={`/ ${certificates.length}`}
                    prefix={<SafetyCertificateOutlined />}
                    valueStyle={{ 
                      color: certificates.some(cert => getCertificateStatus(cert.expiryDate).status === 'expiring') ? '#faad14' : '#3f8600' 
                    }}
                  />
                  <Progress 
                    percent={Math.round((certificates.filter(cert => getCertificateStatus(cert.expiryDate).status === 'active').length / certificates.length) * 100)}
                    size="small"
                    status={certificates.some(cert => getCertificateStatus(cert.expiryDate).status === 'expiring') ? 'exception' : 'success'}
                    style={{ marginTop: 8 }}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* 详细信息标签页 */}
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="基本信息" key="basic">
            <Row gutter={24}>
              <Col span={12}>
                <Card title="个人信息" style={{ height: '100%' }}>
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="姓名">
                      {crew.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="性别">
                      {getGenderText(crew.gender)}
                    </Descriptions.Item>
                    <Descriptions.Item label="出生日期">
                      {crew.birth_date ? dayjs(crew.birth_date).format('YYYY-MM-DD') : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="年龄">
                      {calculateAge(crew.birth_date)} 岁
                    </Descriptions.Item>
                    <Descriptions.Item label="身份证号">
                      <Text code>{crew.id_card}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="婚姻状况">
                      {getMaritalStatusText(crew.marital_status)}
                    </Descriptions.Item>
                    <Descriptions.Item label="国籍">
                      {crew.nationality || '中国'}
                    </Descriptions.Item>
                    <Descriptions.Item label="籍贯">
                      {crew.hometown || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card title="联系信息" style={{ marginBottom: 16 }}>
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="联系电话">
                      {crew.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="紧急联系人">
                      {crew.emergency_contact_name || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="紧急联系电话">
                      {crew.emergency_contact_phone || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
                
                <Card title="教育背景">
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="学历">
                      {getEducationText(crew.education)}
                    </Descriptions.Item>
                    <Descriptions.Item label="学校">
                      {crew.school || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="专业">
                      {crew.major || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="工作信息" key="work">
            <Card title="当前工作信息">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="入职日期">
                  {crew.join_date ? dayjs(crew.join_date).format('YYYY-MM-DD') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="工作年限">
                  {dayjs().diff(dayjs(crew.join_date), 'year')} 年
                </Descriptions.Item>
                <Descriptions.Item label="所属船舶">
                  <Badge status="processing" />
                  {crew.ship_name || '未分配'}
                </Descriptions.Item>
                <Descriptions.Item label="船舶编号">
                  {crew.ship_number || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="部门">
                  {getDepartmentText(crew.department)}
                </Descriptions.Item>
                <Descriptions.Item label="薪资等级">
                  {crew.salary_grade || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={getStatusColor(crew.status)}>
                    {getStatusText(crew.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {crew.created_at ? dayjs(crew.created_at).format('YYYY-MM-DD HH:mm') : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </TabPane>

          <TabPane tab={
            <Badge count={certificates.filter(cert => getCertificateStatus(cert.expiryDate).status === 'expiring').length}>
              <SafetyCertificateOutlined /> 证书管理
            </Badge>
          } key="certificates">
            <Card 
              title="证书列表"
              extra={
                <Space>
                  <Button type="primary">添加证书</Button>
                  <Button>批量导入</Button>
                </Space>
              }
            >
              <Table
                columns={certificateColumns}
                dataSource={certificates}
                rowKey="id"
                pagination={false}
                size="middle"
              />
            </Card>
          </TabPane>

          <TabPane tab={
            <span>
              <HistoryOutlined /> 调动记录
            </span>
          } key="transfers">
            <Card title="船员调动历史">
              <Timeline>
                {transferHistory.map((transfer, index) => (
                  <Timeline.Item
                    key={transfer.id}
                    color={index === 0 ? 'green' : 'blue'}
                    dot={index === 0 ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                  >
                    <div>
                      <Text strong>{dayjs(transfer.transferDate).format('YYYY年MM月DD日')}</Text>
                      <br />
                      <Text>从 {transfer.fromShip} 调动至 {transfer.toShip}</Text>
                      <br />
                      <Text type="secondary">调动原因：{transfer.reason}</Text>
                    </div>
                  </Timeline.Item>
                ))}
                <Timeline.Item color="gray" dot={<UserOutlined />}>
                  <Text type="secondary">
                    {dayjs(crew.join_date).format('YYYY年MM月DD日')} 入职
                  </Text>
                </Timeline.Item>
              </Timeline>
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default CrewDetailPage;
