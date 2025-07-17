import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Card,
  Typography,
  Input,
  Select,
  Tag,
  message,
  Modal,
  Row,
  Col,
  Dropdown,
  DatePicker,
  type MenuProps,
} from 'antd';
import {
  PlusOutlined,
  ExportOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { type LeaveRecord, type LeaveStatus, type LeaveType } from '../types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const LeaveListPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [leaveList, setLeaveList] = useState<LeaveRecord[]>([]);
  const [filteredList, setFilteredList] = useState<LeaveRecord[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // 筛选状态
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    leaveType: '',
    dateRange: null as [dayjs.Dayjs, dayjs.Dayjs] | null,
  });

  useEffect(() => {
    loadLeaveList();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [leaveList, filters]);

  const loadLeaveList = async () => {
    setLoading(true);
    try {
      // 模拟 API 调用
      const mockData: LeaveRecord[] = [
        {
          id: 1,
          crew_id: 1,
          crew_name: '张三',
          start_date: '2024-01-15',
          end_date: '2024-01-20',
          leave_type: 'annual',
          reason: '年假',
          status: 'approved',
          approver_id: 1,
          approver_name: '李经理',
          approve_date: '2024-01-10',
          comments: '同意请假',
          created_at: '2024-01-05T10:00:00Z',
        },
        {
          id: 2,
          crew_id: 2,
          crew_name: '李四',
          start_date: '2024-02-01',
          end_date: '2024-02-03',
          leave_type: 'sick',
          reason: '感冒发烧',
          status: 'pending',
          created_at: '2024-01-25T10:00:00Z',
        },
        {
          id: 3,
          crew_id: 3,
          crew_name: '王五',
          start_date: '2024-03-10',
          end_date: '2024-03-15',
          leave_type: 'personal',
          reason: '个人事务',
          status: 'rejected',
          approver_id: 1,
          approver_name: '李经理',
          approve_date: '2024-03-05',
          comments: '工作繁忙，不予批准',
          created_at: '2024-03-01T10:00:00Z',
        },
      ];
      setLeaveList(mockData);
    } catch (error) {
      message.error('获取请假记录失败');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...leaveList];

    // 搜索过滤
    if (filters.search) {
      filtered = filtered.filter(leave => 
        leave.crew_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        leave.reason.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // 状态过滤
    if (filters.status) {
      filtered = filtered.filter(leave => leave.status === filters.status);
    }

    // 请假类型过滤
    if (filters.leaveType) {
      filtered = filtered.filter(leave => leave.leave_type === filters.leaveType);
    }

    // 日期范围过滤
    if (filters.dateRange) {
      const [start, end] = filters.dateRange;
      filtered = filtered.filter(leave => {
        const leaveStart = dayjs(leave.start_date);
        const leaveEnd = dayjs(leave.end_date);
        return (leaveStart.isAfter(start) && leaveStart.isBefore(end)) ||
               (leaveEnd.isAfter(start) && leaveEnd.isBefore(end));
      });
    }

    setFilteredList(filtered);
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleStatusChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value }));
  };

  const handleLeaveTypeChange = (value: string) => {
    setFilters(prev => ({ ...prev, leaveType: value }));
  };

  const handleDateRangeChange = (dates: any) => {
    setFilters(prev => ({ ...prev, dateRange: dates }));
  };

  const handleApprove = async (leaveId: number) => {
    try {
      // 模拟审批 API
      console.log('Approving leave:', leaveId);
      message.success('审批成功');
      loadLeaveList();
    } catch (error) {
      message.error('审批失败');
    }
  };

  const handleReject = async (leaveId: number) => {
    try {
      // 模拟拒绝 API
      console.log('Rejecting leave:', leaveId);
      message.success('已拒绝');
      loadLeaveList();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (leaveId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条请假记录吗？此操作不可恢复。',
      onOk: async () => {
        try {
          // 模拟删除 API
          console.log('Deleting leave record:', leaveId);
          message.success('删除成功');
          loadLeaveList();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的记录');
      return;
    }

    Modal.confirm({
      title: '批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条记录吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          message.success('批量删除成功');
          setSelectedRowKeys([]);
          loadLeaveList();
        } catch (error) {
          message.error('批量删除失败');
        }
      },
    });
  };

  const getStatusColor = (status: LeaveStatus) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      case 'pending':
        return 'orange';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: LeaveStatus) => {
    switch (status) {
      case 'approved':
        return '已批准';
      case 'rejected':
        return '已拒绝';
      case 'pending':
        return '待审批';
      case 'cancelled':
        return '已取消';
      default:
        return '未知';
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

  const getActionsMenu = (record: LeaveRecord): MenuProps => {
    const items = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: '查看详情',
        onClick: () => navigate(`/leave/detail/${record.id}`),
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: '编辑',
        onClick: () => navigate(`/leave/edit/${record.id}`),
      },
    ];

    if (record.status === 'pending') {
      items.push(
        {
          type: 'divider',
        } as any,
        {
          key: 'approve',
          icon: <CheckOutlined />,
          label: '批准',
          onClick: () => handleApprove(record.id),
        },
        {
          key: 'reject',
          icon: <CloseOutlined />,
          label: '拒绝',
          onClick: () => handleReject(record.id),
        }
      );
    }

    items.push(
      {
        type: 'divider',
      } as any,
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: '删除',
        onClick: () => handleDelete(record.id.toString()),
      } as any
    );

    return { items };
  };

  const columns = [
    {
      title: '申请人',
      dataIndex: 'crew_name',
      key: 'crew_name',
      width: 100,
      fixed: 'left' as const,
    },
    {
      title: '请假类型',
      dataIndex: 'leave_type',
      key: 'leave_type',
      width: 100,
      render: (type: LeaveType) => getLeaveTypeText(type),
    },
    {
      title: '开始日期',
      dataIndex: 'start_date',
      key: 'start_date',
      width: 120,
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: '结束日期',
      dataIndex: 'end_date',
      key: 'end_date',
      width: 120,
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: '请假天数',
      key: 'duration',
      width: 100,
      render: (_: any, record: LeaveRecord) => {
        const start = dayjs(record.start_date);
        const end = dayjs(record.end_date);
        return end.diff(start, 'day') + 1;
      },
    },
    {
      title: '请假原因',
      dataIndex: 'reason',
      key: 'reason',
      width: 150,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: LeaveStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '审批人',
      dataIndex: 'approver_name',
      key: 'approver_name',
      width: 100,
      render: (name: string) => name || '-',
    },
    {
      title: '审批时间',
      dataIndex: 'approve_date',
      key: 'approve_date',
      width: 120,
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_: any, record: LeaveRecord) => (
        <Dropdown menu={getActionsMenu(record)} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4} style={{ margin: 0 }}>请假管理</Title>
            </Col>
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/leave/apply')}
                >
                  申请请假
                </Button>
                <Button
                  icon={<ExportOutlined />}
                  onClick={() => message.info('导出功能开发中')}
                >
                  导出
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Search
                placeholder="搜索申请人、请假原因"
                onSearch={handleSearch}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="状态"
                allowClear
                style={{ width: '100%' }}
                onChange={handleStatusChange}
              >
                <Option value="pending">待审批</Option>
                <Option value="approved">已批准</Option>
                <Option value="rejected">已拒绝</Option>
                <Option value="cancelled">已取消</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="请假类型"
                allowClear
                style={{ width: '100%' }}
                onChange={handleLeaveTypeChange}
              >
                <Option value="annual">年假</Option>
                <Option value="sick">病假</Option>
                <Option value="personal">事假</Option>
                <Option value="maternity">产假</Option>
                <Option value="emergency">紧急假</Option>
              </Select>
            </Col>
            <Col span={6}>
              <RangePicker
                placeholder={['开始日期', '结束日期']}
                style={{ width: '100%' }}
                onChange={handleDateRangeChange}
              />
            </Col>
          </Row>
        </div>

        {selectedRowKeys.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Space>
              <span>已选择 {selectedRowKeys.length} 项</span>
              <Button
                type="primary"
                danger
                size="small"
                onClick={handleBatchDelete}
              >
                批量删除
              </Button>
            </Space>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={filteredList}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          rowSelection={rowSelection}
          pagination={{
            total: filteredList.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  );
};

export default LeaveListPage;
