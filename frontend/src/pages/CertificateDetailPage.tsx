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
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  UserOutlined,
  BankOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { type Certificate, type CertificateType } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const CertificateDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    if (id) {
      loadCertificateData();
    }
  }, [id]);

  const loadCertificateData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // 这里应该调用证书服务的API
      // const response = await certificateService.getCertificateById(Number(id));
      // 临时模拟数据
      const mockCertificate: Certificate = {
        id: Number(id),
        crew_id: 1,
        certificate_type: 'seamans_book',
        certificate_number: 'SC20240001',
        issuing_authority: '中华人民共和国海事局',
        issue_date: '2024-01-15',
        expiry_date: '2029-01-15',
        status: 'active',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };
      setCertificate(mockCertificate);
    } catch (error) {
      message.error('获取证书信息失败');
      navigate('/certificates/list');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/certificates/edit/${id}`);
  };

  const handleDelete = () => {
    if (!certificate) return;
    
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除证书 "${certificate.certificate_number}" 吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          // await certificateService.deleteCertificate(certificate.id);
          message.success('删除成功');
          navigate('/certificates/list');
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleBack = () => {
    navigate('/certificates/list');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'expired':
        return 'red';
      case 'revoked':
        return 'volcano';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '有效';
      case 'expired':
        return '过期';
      case 'revoked':
        return '吊销';
      default:
        return '未知';
    }
  };

  const getCertificateTypeText = (type: CertificateType) => {
    switch (type) {
      case 'seamans_book':
        return '海员证';
      case 'deck_officer':
        return '甲板证书';
      case 'engine_officer':
        return '轮机证书';
      case 'medical':
        return '体检证书';
      case 'safety':
        return '安全证书';
      case 'special':
        return '特殊证书';
      default:
        return '未知';
    }
  };

  const isExpiringSoon = (expiryDate: string) => {
    const daysToExpiry = dayjs(expiryDate).diff(dayjs(), 'day');
    return daysToExpiry <= 30 && daysToExpiry > 0;
  };

  const isExpired = (expiryDate: string) => {
    return dayjs(expiryDate).isBefore(dayjs());
  };

  const getDaysToExpiry = (expiryDate: string) => {
    return dayjs(expiryDate).diff(dayjs(), 'day');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!certificate) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Text>证书信息不存在</Text>
      </div>
    );
  }

  const daysToExpiry = getDaysToExpiry(certificate.expiry_date);
  const isExpiringSoonFlag = isExpiringSoon(certificate.expiry_date);
  const isExpiredFlag = isExpired(certificate.expiry_date);

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
                  证书详情
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

        {/* 到期提醒 */}
        {isExpiredFlag && (
          <Alert
            message="证书已过期"
            description={`此证书已于 ${dayjs(certificate.expiry_date).format('YYYY-MM-DD')} 过期`}
            type="error"
            showIcon
            icon={<ExclamationCircleOutlined />}
            style={{ marginBottom: 24 }}
          />
        )}
        
        {isExpiringSoonFlag && (
          <Alert
            message="证书即将过期"
            description={`此证书将在 ${daysToExpiry} 天后过期，请及时续期`}
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
            style={{ marginBottom: 24 }}
          />
        )}

        <Row gutter={24}>
          <Col span={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <Avatar size={100} icon={<SafetyCertificateOutlined />} />
                <Title level={3} style={{ marginTop: 16 }}>
                  {getCertificateTypeText(certificate.certificate_type)}
                </Title>
                <Tag color={getStatusColor(certificate.status)}>
                  {getStatusText(certificate.status)}
                </Tag>
                <Divider />
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>证书编号:</Text>
                    <br />
                    <Text code>{certificate.certificate_number}</Text>
                  </div>
                  <div>
                    <UserOutlined /> 船员ID: {certificate.crew_id}
                  </div>
                  <div>
                    <BankOutlined /> {certificate.issuing_authority}
                  </div>
                  <div>
                    <CalendarOutlined /> 
                    {dayjs(certificate.issue_date).format('YYYY-MM-DD')} 颁发
                  </div>
                </Space>
              </div>
            </Card>
          </Col>
          
          <Col span={16}>
            <Card title="证书信息">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="证书类型">
                  {getCertificateTypeText(certificate.certificate_type)}
                </Descriptions.Item>
                <Descriptions.Item label="证书编号">
                  <Text code>{certificate.certificate_number}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="持有人">
                  船员ID: {certificate.crew_id}
                </Descriptions.Item>
                <Descriptions.Item label="颁发机构">
                  {certificate.issuing_authority}
                </Descriptions.Item>
                <Descriptions.Item label="颁发日期">
                  {dayjs(certificate.issue_date).format('YYYY-MM-DD')}
                </Descriptions.Item>
                <Descriptions.Item label="到期日期">
                  <span style={{ 
                    color: isExpiredFlag ? '#ff4d4f' : isExpiringSoonFlag ? '#fa8c16' : 'inherit' 
                  }}>
                    {dayjs(certificate.expiry_date).format('YYYY-MM-DD')}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="有效期">
                  {isExpiredFlag ? (
                    <Text type="danger">已过期 {Math.abs(daysToExpiry)} 天</Text>
                  ) : (
                    <Text type={isExpiringSoonFlag ? 'warning' : 'success'}>
                      还有 {daysToExpiry} 天到期
                    </Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={getStatusColor(certificate.status)}>
                    {getStatusText(certificate.status)}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="系统信息" style={{ marginTop: 16 }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="创建时间">
                  {certificate.created_at ? dayjs(certificate.created_at).format('YYYY-MM-DD HH:mm') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {certificate.updated_at ? dayjs(certificate.updated_at).format('YYYY-MM-DD HH:mm') : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default CertificateDetailPage;
