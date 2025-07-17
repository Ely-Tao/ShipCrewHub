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
import { type Ship, type ShipStatus } from '../types';
import shipService from '../services/shipService';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const ShipListPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shipList, setShipList] = useState<Ship[]>([]);
  const [filteredList, setFilteredList] = useState<Ship[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // 筛选状态
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    shipType: '',
  });

  useEffect(() => {
    loadShipList();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [shipList, filters]);

  const loadShipList = async () => {
    setLoading(true);
    try {
      const response = await shipService.getShipList();
      if (response && response.data) {
        // 后端返回的结构是 { ships: [], pagination: {} }
        setShipList(response.data.ships || []);
      }
    } catch (error) {
      message.error('获取船舶列表失败');
      // 确保在出错时 shipList 仍然是一个数组
      setShipList([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...shipList];

    // 搜索过滤
    if (filters.search) {
      filtered = filtered.filter(ship => 
        ship.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        ship.ship_number.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // 状态过滤
    if (filters.status) {
      filtered = filtered.filter(ship => ship.status === filters.status);
    }

    // 船舶类型过滤
    if (filters.shipType) {
      filtered = filtered.filter(ship => ship.ship_type === filters.shipType);
    }

    setFilteredList(filtered);
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleStatusChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value }));
  };

  const handleShipTypeChange = (value: string) => {
    setFilters(prev => ({ ...prev, shipType: value }));
  };

  const handleDelete = async (shipId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条船舶记录吗？此操作不可恢复。',
      onOk: async () => {
        try {
          await shipService.deleteShip(Number(shipId));
          message.success('删除成功');
          loadShipList();
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
          await Promise.all(selectedRowKeys.map(id => shipService.deleteShip(Number(id))));
          message.success('批量删除成功');
          setSelectedRowKeys([]);
          loadShipList();
        } catch (error) {
          message.error('批量删除失败');
        }
      },
    });
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

  const getActionsMenu = (record: Ship): MenuProps => ({
    items: [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: '查看详情',
        onClick: () => navigate(`/ships/detail/${record.id}`),
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: '编辑',
        onClick: () => navigate(`/ships/edit/${record.id}`),
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
      title: '船舶名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      fixed: 'left' as const,
    },
    {
      title: '船舶编号',
      dataIndex: 'ship_number',
      key: 'ship_number',
      width: 120,
    },
    {
      title: '船舶类型',
      dataIndex: 'ship_type',
      key: 'ship_type',
      width: 120,
    },
    {
      title: '载重量',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 120,
      render: (capacity: number) => `${capacity} 吨`,
    },
    {
      title: '船员数量',
      dataIndex: 'crew_count',
      key: 'crew_count',
      width: 100,
      render: (count: number) => count || 0,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ShipStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_: any, record: Ship) => (
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
              <Title level={4} style={{ margin: 0 }}>船舶管理</Title>
            </Col>
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/ships/add')}
                >
                  添加船舶
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
                placeholder="搜索船舶名称、编号"
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
                <Option value="active">在运行</Option>
                <Option value="inactive">停运</Option>
                <Option value="maintenance">维护中</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="船舶类型"
                allowClear
                style={{ width: '100%' }}
                onChange={handleShipTypeChange}
              >
                <Option value="cargo">货船</Option>
                <Option value="passenger">客船</Option>
                <Option value="tanker">油轮</Option>
                <Option value="container">集装箱船</Option>
                <Option value="other">其他</Option>
              </Select>
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
          scroll={{ x: 1000 }}
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

export default ShipListPage;
