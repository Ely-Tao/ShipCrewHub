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
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  BankOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { type CrewMember } from '../types';
import crewService from '../services/crewService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const CrewDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [crew, setCrew] = useState<CrewMember | null>(null);

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

        <Row gutter={24}>
          <Col span={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <Avatar size={100} icon={<UserOutlined />} />
                <Title level={3} style={{ marginTop: 16 }}>
                  {crew.name}
                </Title>
                <Tag color={getStatusColor(crew.status)}>
                  {getStatusText(crew.status)}
                </Tag>
                <Divider />
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <PhoneOutlined /> {crew.phone}
                  </div>
                  <div>
                    <BankOutlined /> {getDepartmentText(crew.department)}
                  </div>
                  <div>
                    <CalendarOutlined /> 入职{dayjs(crew.join_date).format('YYYY年MM月')}
                  </div>
                </Space>
              </div>
            </Card>
          </Col>
          
          <Col span={18}>
            <Card title="基本信息">
              <Descriptions column={2} bordered>
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
                  {crew.nationality || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="籍贯">
                  {crew.hometown || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="联系电话">
                  {crew.phone}
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={getStatusColor(crew.status)}>
                    {getStatusText(crew.status)}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="紧急联系人" style={{ marginTop: 16 }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="姓名">
                  {crew.emergency_contact_name || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="电话">
                  {crew.emergency_contact_phone || '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="教育背景" style={{ marginTop: 16 }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="学历">
                  {getEducationText(crew.education)}
                </Descriptions.Item>
                <Descriptions.Item label="学校">
                  {crew.school || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="专业" span={2}>
                  {crew.major || '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="工作信息" style={{ marginTop: 16 }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="入职日期">
                  {crew.join_date ? dayjs(crew.join_date).format('YYYY-MM-DD') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="所属船舶">
                  {crew.ship_name || '未分配'}
                </Descriptions.Item>
                <Descriptions.Item label="部门">
                  {getDepartmentText(crew.department)}
                </Descriptions.Item>
                <Descriptions.Item label="薪资等级">
                  {crew.salary_grade || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {crew.created_at ? dayjs(crew.created_at).format('YYYY-MM-DD HH:mm') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {crew.updated_at ? dayjs(crew.updated_at).format('YYYY-MM-DD HH:mm') : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default CrewDetailPage;
