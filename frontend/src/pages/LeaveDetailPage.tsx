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
  Timeline,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { type LeaveRecord, type LeaveType, type LeaveStatus } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const LeaveDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [leave, setLeave] = useState<LeaveRecord | null>(null);

  useEffect(() => {
    if (id) {
      loadLeaveData();
    }
  }, [id]);

  const loadLeaveData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // 这里应该调用请假服务的API
      // const response = await leaveService.getLeaveById(Number(id));
      // 临时模拟数据
      const mockLeave: LeaveRecord = {
        id: Number(id),
        crew_id: 1,
        crew_name: '张三',
        start_date: '2024-07-20',
        end_date: '2024-07-25',
        leave_type: 'annual',
        reason: '回家探亲',
        status: 'approved',
        approver_id: 2,
        approver_name: '李经理',
        approve_date: '2024-07-18T14:30:00Z',
        comments: '同意请假申请',
        created_at: '2024-07-17T10:00:00Z',
        updated_at: '2024-07-18T14:30:00Z',
      };
      setLeave(mockLeave);
    } catch (error) {
      message.error('获取请假信息失败');
      navigate('/leave/list');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/leave/edit/${id}`);
  };

  const handleDelete = () => {
    if (!leave) return;
    
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条请假记录吗？此操作不可恢复。',
      onOk: async () => {
        try {
          // await leaveService.deleteLeave(leave.id);
          message.success('删除成功');
          navigate('/leave/list');
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleApprove = async () => {
    if (!leave) return;
    
    try {
      // await leaveService.approveLeave(leave.id);
      message.success('审批通过');
      loadLeaveData();
    } catch (error) {
      message.error('审批失败');
    }
  };

  const handleReject = async () => {
    if (!leave) return;
    
    Modal.confirm({
      title: '确认拒绝',
      content: '确定要拒绝这条请假申请吗？',
      onOk: async () => {
        try {
          // await leaveService.rejectLeave(leave.id);
          message.success('已拒绝申请');
          loadLeaveData();
        } catch (error) {
          message.error('操作失败');
        }
      },
    });
  };

  const handleBack = () => {
    navigate('/leave/list');
  };

  const getStatusColor = (status: LeaveStatus) => {
    switch (status) {
      case 'pending':
        return 'processing';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: LeaveStatus) => {
    switch (status) {
      case 'pending':
        return '待审批';
      case 'approved':
        return '已批准';
      case 'rejected':
        return '已拒绝';
      case 'cancelled':
        return '已取消';
      default:
        return '未知';
    }
  };

  const getStatusIcon = (status: LeaveStatus) => {
    switch (status) {
      case 'pending':
        return <ClockCircleOutlined />;
      case 'approved':
        return <CheckCircleOutlined />;
      case 'rejected':
        return <CloseCircleOutlined />;
      case 'cancelled':
        return <ExclamationCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getLeaveTypeText = (type: LeaveType) => {
    switch (type) {
      case 'annual':
        return '年假';
      case 'sick':
        return '病假';
      case 'personal':
        return '事假';
      case 'maternity':
        return '产假';
      case 'emergency':
        return '紧急假';
      default:
        return '未知';
    }
  };

  const getLeaveTypeColor = (type: LeaveType) => {
    switch (type) {
      case 'annual':
        return 'blue';
      case 'sick':
        return 'orange';
      case 'personal':
        return 'purple';
      case 'maternity':
        return 'pink';
      case 'emergency':
        return 'red';
      default:
        return 'default';
    }
  };

  const calculateDays = (startDate: string, endDate: string) => {
    return dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
  };

  const getApprovalSteps = () => {
    if (!leave) return [];
    
    const steps = [
      {
        title: '申请提交',
        status: 'finish',
        icon: <UserOutlined />,
        description: `${leave.crew_name} 提交申请`,
        time: dayjs(leave.created_at).format('YYYY-MM-DD HH:mm'),
      },
    ];

    if (leave.status === 'approved') {
      steps.push({
        title: '审批通过',
        status: 'finish',
        icon: <CheckCircleOutlined />,
        description: `${leave.approver_name} 审批通过`,
        time: leave.approve_date ? dayjs(leave.approve_date).format('YYYY-MM-DD HH:mm') : '',
      });
    } else if (leave.status === 'rejected') {
      steps.push({
        title: '审批拒绝',
        status: 'error',
        icon: <CloseCircleOutlined />,
        description: `${leave.approver_name} 审批拒绝`,
        time: leave.approve_date ? dayjs(leave.approve_date).format('YYYY-MM-DD HH:mm') : '',
      });
    } else if (leave.status === 'pending') {
      steps.push({
        title: '待审批',
        status: 'process',
        icon: <ClockCircleOutlined />,
        description: '等待审批',
        time: '',
      });
    }

    return steps;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!leave) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Text>请假记录不存在</Text>
      </div>
    );
  }

  const leaveDays = calculateDays(leave.start_date, leave.end_date);
  const steps = getApprovalSteps();

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
                  请假详情
                </Title>
              </Space>
            </Col>
            <Col>
              <Space>
                {leave.status === 'pending' && (
                  <>
                    <Button type="primary" onClick={handleApprove}>
                      批准
                    </Button>
                    <Button danger onClick={handleReject}>
                      拒绝
                    </Button>
                  </>
                )}
                <Button icon={<EditOutlined />} onClick={handleEdit}>
                  编辑
                </Button>
                <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
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
                <Avatar size={100} icon={<CalendarOutlined />} />
                <Title level={3} style={{ marginTop: 16 }}>
                  {getLeaveTypeText(leave.leave_type)}
                </Title>
                <Tag color={getStatusColor(leave.status)} icon={getStatusIcon(leave.status)}>
                  {getStatusText(leave.status)}
                </Tag>
                <Divider />
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <UserOutlined /> {leave.crew_name}
                  </div>
                  <div>
                    <CalendarOutlined /> {leaveDays} 天
                  </div>
                  <div>
                    <ClockCircleOutlined /> 
                    {dayjs(leave.start_date).format('MM-DD')} 至 
                    {dayjs(leave.end_date).format('MM-DD')}
                  </div>
                </Space>
              </div>
            </Card>
          </Col>
          
          <Col span={16}>
            <Card title="请假信息">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="申请人">
                  {leave.crew_name}
                </Descriptions.Item>
                <Descriptions.Item label="请假类型">
                  <Tag color={getLeaveTypeColor(leave.leave_type)}>
                    {getLeaveTypeText(leave.leave_type)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="开始日期">
                  {dayjs(leave.start_date).format('YYYY-MM-DD')}
                </Descriptions.Item>
                <Descriptions.Item label="结束日期">
                  {dayjs(leave.end_date).format('YYYY-MM-DD')}
                </Descriptions.Item>
                <Descriptions.Item label="请假天数">
                  {leaveDays} 天
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={getStatusColor(leave.status)} icon={getStatusIcon(leave.status)}>
                    {getStatusText(leave.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="请假原因" span={2}>
                  {leave.reason}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="审批信息" style={{ marginTop: 16 }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="审批人">
                  {leave.approver_name || '未指定'}
                </Descriptions.Item>
                <Descriptions.Item label="审批时间">
                  {leave.approve_date ? dayjs(leave.approve_date).format('YYYY-MM-DD HH:mm') : '未审批'}
                </Descriptions.Item>
                <Descriptions.Item label="审批意见" span={2}>
                  {leave.comments || '无'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="审批流程" style={{ marginTop: 16 }}>
              <Timeline>
                {steps.map((step, index) => (
                  <Timeline.Item
                    key={index}
                    dot={step.icon}
                    color={step.status === 'finish' ? 'green' : step.status === 'error' ? 'red' : 'blue'}
                  >
                    <div>
                      <Text strong>{step.title}</Text>
                      <br />
                      <Text type="secondary">{step.description}</Text>
                      <br />
                      <Text type="secondary">{step.time}</Text>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>

            <Card title="系统信息" style={{ marginTop: 16 }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="创建时间">
                  {leave.created_at ? dayjs(leave.created_at).format('YYYY-MM-DD HH:mm') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {leave.updated_at ? dayjs(leave.updated_at).format('YYYY-MM-DD HH:mm') : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default LeaveDetailPage;
