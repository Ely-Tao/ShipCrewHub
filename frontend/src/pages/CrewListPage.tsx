import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Card,
  Typography,
  Input,
  Select,
  DatePicker,
  Tag,
  message,
  Modal,
  Row,
  Col,
  Dropdown,
  type MenuProps,
} from 'antd';
import {
  PlusOutlined,
  ExportOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { type CrewMember, type PersonStatus, type Ship } from '../types';
import crewService from '../services/crewService';
import shipService from '../services/shipService';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const CrewListPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [crewList, setCrewList] = useState<CrewMember[]>([]);
  const [filteredList, setFilteredList] = useState<CrewMember[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // 筛选状态
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    shipId: '',
    dateRange: null as [dayjs.Dayjs, dayjs.Dayjs] | null,
  });

  useEffect(() => {
    loadCrewList();
    loadShips();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [crewList, filters]);

  const loadCrewList = async () => {
    setLoading(true);
    try {
      const response = await crewService.getCrewList();
      if (response && response.data) {
        setCrewList(response.data.data);
      }
    } catch (error) {
      message.error('获取船员列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadShips = async () => {
    try {
      const response = await shipService.getShipList();
      if (response && response.data) {
        setShips(response.data.data);
      }
    } catch (error) {
      console.error('获取船舶列表失败', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...crewList];

    // 搜索过滤
    if (filters.search) {
      filtered = filtered.filter(crew => 
        crew.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        crew.id_card.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // 状态过滤
    if (filters.status) {
      filtered = filtered.filter(crew => crew.status === filters.status);
    }

    // 船舶过滤
    if (filters.shipId) {
      filtered = filtered.filter(crew => crew.ship_id?.toString() === filters.shipId);
    }

    // 日期范围过滤（入职日期）
    if (filters.dateRange) {
      const [start, end] = filters.dateRange;
      filtered = filtered.filter(crew => {
        const hireDate = dayjs(crew.join_date);
        return hireDate.isAfter(start) && hireDate.isBefore(end);
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

  const handleShipChange = (value: string) => {
    setFilters(prev => ({ ...prev, shipId: value }));
  };

  const handleDateRangeChange = (dates: any) => {
    setFilters(prev => ({ ...prev, dateRange: dates }));
  };

  const handleDelete = async (crewId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条船员记录吗？此操作不可恢复。',
      onOk: async () => {
        try {
          await crewService.deleteCrew(Number(crewId));
          message.success('删除成功');
          loadCrewList();
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
          await Promise.all(selectedRowKeys.map(id => crewService.deleteCrew(Number(id))));
          message.success('批量删除成功');
          setSelectedRowKeys([]);
          loadCrewList();
        } catch (error) {
          message.error('批量删除失败');
        }
      },
    });
  };

  const getStatusColor = (status: PersonStatus) => {
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

  const getStatusText = (status: PersonStatus) => {
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

  const getActionsMenu = (record: CrewMember): MenuProps => ({
    items: [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: '查看详情',
        onClick: () => navigate(`/crew/detail/${record.id}`),
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: '编辑',
        onClick: () => navigate(`/crew/edit/${record.id}`),
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: '删除',
        danger: true,
        onClick: () => handleDelete(record.id.toString()),
      },
    ],
  });

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      fixed: 'left' as const,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender: string) => gender === 'male' ? '男' : '女',
    },
    {
      title: '年龄',
      dataIndex: 'birth_date',
      key: 'age',
      width: 80,
      render: (birthDate: string) => {
        if (!birthDate) return '-';
        return dayjs().diff(dayjs(birthDate), 'year');
      },
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 120,
    },
    {
      title: '当前船舶',
      dataIndex: 'ship_id',
      key: 'ship_id',
      width: 120,
      render: (shipId: number) => {
        const ship = ships.find(s => s.id === shipId);
        return ship ? ship.name : '-';
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: PersonStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '入职日期',
      dataIndex: 'join_date',
      key: 'join_date',
      width: 120,
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_: any, record: CrewMember) => (
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
              <Title level={4} style={{ margin: 0 }}>船员管理</Title>
            </Col>
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/crew/add')}
                >
                  添加船员
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
            <Col span={8}>
              <Search
                placeholder="搜索姓名、身份证号"
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
                <Option value="active">在职</Option>
                <Option value="inactive">离职</Option>
                <Option value="on_leave">休假</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="船舶"
                allowClear
                style={{ width: '100%' }}
                onChange={handleShipChange}
              >
                {ships.map(ship => (
                  <Option key={ship.id} value={ship.id}>
                    {ship.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={8}>
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

export default CrewListPage;
