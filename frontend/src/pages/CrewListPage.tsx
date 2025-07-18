import React, { useState, useEffect } from "react";
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
  Collapse,
  InputNumber,
  Divider,
  Statistic,
  type MenuProps,
} from "antd";
import {
  PlusOutlined,
  ExportOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  TeamOutlined,
  UserAddOutlined,
  CalendarOutlined,
  UserDeleteOutlined,
  ImportOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { type CrewMember, type PersonStatus, type Ship } from "../types";
import crewService from "../services/crewService";
import shipService from "../services/shipService";
import dayjs from "dayjs";
import DataImportModal from "../components/DataImportModal";

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

const CrewListPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [crewList, setCrewList] = useState<CrewMember[]>([]);
  const [filteredList, setFilteredList] = useState<CrewMember[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [importModalVisible, setImportModalVisible] = useState(false);

  // 筛选状态
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    shipId: "",
    dateRange: null as [dayjs.Dayjs, dayjs.Dayjs] | null,
    // 高级搜索字段
    gender: "",
    department: "",
    maritalStatus: "",
    education: "",
    salaryGrade: "",
    phoneNumber: "",
    hometown: "",
    ageRange: null as [number, number] | null,
  });

  // 高级搜索面板展开状态
  const [advancedSearchVisible, setAdvancedSearchVisible] = useState(false);

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
        // 后端返回的结构是 { crews: [], pagination: {} }
        setCrewList(response.data.crews || []);
      }
    } catch (error) {
      message.error("获取船员列表失败");
      // 确保在出错时 crewList 仍然是一个数组
      setCrewList([]);
    } finally {
      setLoading(false);
    }
  };

  const loadShips = async () => {
    try {
      const response = await shipService.getShipList();
      if (response && response.data) {
        // 后端返回的结构是 { ships: [], pagination: {} }
        setShips(response.data.ships || []);
      }
    } catch (error) {
      console.error("获取船舶列表失败", error);
      // 确保在出错时 ships 仍然是一个数组
      setShips([]);
    }
  };

  const applyFilters = () => {
    let filtered = [...crewList];

    // 基础搜索过滤（姓名、身份证号）
    if (filters.search) {
      filtered = filtered.filter(
        (crew) =>
          crew.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          crew.id_card.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // 状态过滤
    if (filters.status) {
      filtered = filtered.filter((crew) => crew.status === filters.status);
    }

    // 船舶过滤
    if (filters.shipId) {
      filtered = filtered.filter(
        (crew) => crew.ship_id?.toString() === filters.shipId
      );
    }

    // 日期范围过滤（入职日期）
    if (filters.dateRange) {
      const [start, end] = filters.dateRange;
      filtered = filtered.filter((crew) => {
        const hireDate = dayjs(crew.join_date);
        return hireDate.isAfter(start) && hireDate.isBefore(end);
      });
    }

    // 高级搜索过滤
    // 性别过滤
    if (filters.gender) {
      filtered = filtered.filter((crew) => crew.gender === filters.gender);
    }

    // 部门过滤
    if (filters.department) {
      filtered = filtered.filter(
        (crew) => crew.department === filters.department
      );
    }

    // 婚姻状况过滤
    if (filters.maritalStatus) {
      filtered = filtered.filter(
        (crew) => crew.marital_status === filters.maritalStatus
      );
    }

    // 教育程度过滤
    if (filters.education) {
      filtered = filtered.filter(
        (crew) => crew.education === filters.education
      );
    }

    // 薪资等级过滤
    if (filters.salaryGrade) {
      filtered = filtered.filter(
        (crew) => crew.salary_grade === filters.salaryGrade
      );
    }

    // 手机号码过滤
    if (filters.phoneNumber) {
      filtered = filtered.filter((crew) =>
        crew.phone.includes(filters.phoneNumber)
      );
    }

    // 籍贯过滤
    if (filters.hometown) {
      filtered = filtered.filter((crew) =>
        crew.hometown.toLowerCase().includes(filters.hometown.toLowerCase())
      );
    }

    // 年龄范围过滤
    if (filters.ageRange) {
      const [minAge, maxAge] = filters.ageRange;
      filtered = filtered.filter((crew) => {
        const age = dayjs().diff(dayjs(crew.birth_date), "year");
        return age >= minAge && age <= maxAge;
      });
    }

    setFilteredList(filtered);
  };

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value }));
  };

  const handleShipChange = (value: string) => {
    setFilters((prev) => ({ ...prev, shipId: value }));
  };

  const handleDateRangeChange = (dates: any) => {
    setFilters((prev) => ({ ...prev, dateRange: dates }));
  };

  // 高级搜索处理函数
  const handleGenderChange = (value: string) => {
    setFilters((prev) => ({ ...prev, gender: value }));
  };

  const handleDepartmentChange = (value: string) => {
    setFilters((prev) => ({ ...prev, department: value }));
  };

  const handleMaritalStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, maritalStatus: value }));
  };

  const handleEducationChange = (value: string) => {
    setFilters((prev) => ({ ...prev, education: value }));
  };

  const handleSalaryGradeChange = (value: string) => {
    setFilters((prev) => ({ ...prev, salaryGrade: value }));
  };

  const handlePhoneNumberChange = (value: string) => {
    setFilters((prev) => ({ ...prev, phoneNumber: value }));
  };

  const handleHometownChange = (value: string) => {
    setFilters((prev) => ({ ...prev, hometown: value }));
  };

  const handleAgeRangeChange = (values: [number, number] | null) => {
    setFilters((prev) => ({ ...prev, ageRange: values }));
  };

  // 重置搜索条件
  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "",
      shipId: "",
      dateRange: null,
      gender: "",
      department: "",
      maritalStatus: "",
      education: "",
      salaryGrade: "",
      phoneNumber: "",
      hometown: "",
      ageRange: null,
    });
  };

  const handleDelete = async (crewId: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这条船员记录吗？此操作不可恢复。",
      onOk: async () => {
        try {
          await crewService.deleteCrew(Number(crewId));
          message.success("删除成功");
          loadCrewList();
        } catch (error) {
          message.error("删除失败");
        }
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请先选择要删除的记录");
      return;
    }

    Modal.confirm({
      title: "批量删除",
      content: `确定要删除选中的 ${selectedRowKeys.length} 条记录吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          await Promise.all(
            selectedRowKeys.map((id) => crewService.deleteCrew(Number(id)))
          );
          message.success("批量删除成功");
          setSelectedRowKeys([]);
          loadCrewList();
        } catch (error) {
          message.error("批量删除失败");
        }
      },
    });
  };

  const getStatusColor = (status: PersonStatus) => {
    switch (status) {
      case "active":
        return "green";
      case "inactive":
        return "red";
      case "on_leave":
        return "orange";
      default:
        return "default";
    }
  };

  const getStatusText = (status: PersonStatus) => {
    switch (status) {
      case "active":
        return "在职";
      case "inactive":
        return "离职";
      case "on_leave":
        return "休假";
      default:
        return "未知";
    }
  };

  const getActionsMenu = (record: CrewMember): MenuProps => ({
    items: [
      {
        key: "view",
        icon: <EyeOutlined />,
        label: "查看详情",
        onClick: () => navigate(`/crew/detail/${record.id}`),
      },
      {
        key: "edit",
        icon: <EditOutlined />,
        label: "编辑",
        onClick: () => navigate(`/crew/edit/${record.id}`),
      },
      {
        type: "divider",
      },
      {
        key: "delete",
        icon: <DeleteOutlined />,
        label: "删除",
        danger: true,
        onClick: () => handleDelete(record.id.toString()),
      },
    ],
  });

  const columns = [
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
      width: 100,
      fixed: "left" as const,
      sorter: (a: CrewMember, b: CrewMember) => a.name.localeCompare(b.name),
    },
    {
      title: "性别",
      dataIndex: "gender",
      key: "gender",
      width: 80,
      filters: [
        { text: "男", value: "男" },
        { text: "女", value: "女" },
      ],
      onFilter: (value: any, record: CrewMember) => record.gender === value,
      render: (gender: string) => gender || "-",
    },
    {
      title: "年龄",
      dataIndex: "birth_date",
      key: "age",
      width: 80,
      sorter: (a: CrewMember, b: CrewMember) => {
        const ageA = a.birth_date
          ? dayjs().diff(dayjs(a.birth_date), "year")
          : 0;
        const ageB = b.birth_date
          ? dayjs().diff(dayjs(b.birth_date), "year")
          : 0;
        return ageA - ageB;
      },
      render: (birthDate: string) => {
        if (!birthDate) return "-";
        return dayjs().diff(dayjs(birthDate), "year");
      },
    },
    {
      title: "部门",
      dataIndex: "department",
      key: "department",
      width: 120,
      filters: [
        { text: "甲板部", value: "甲板部" },
        { text: "机舱部", value: "机舱部" },
        { text: "餐饮部", value: "餐饮部" },
        { text: "综合部", value: "综合部" },
      ],
      onFilter: (value: any, record: CrewMember) => record.department === value,
    },
    {
      title: "当前船舶",
      dataIndex: "ship_id",
      key: "ship_id",
      width: 120,
      filters: ships.map((ship) => ({ text: ship.name, value: ship.id })),
      onFilter: (value: any, record: CrewMember) => record.ship_id === value,
      render: (shipId: number) => {
        const ship = ships.find((s) => s.id === shipId);
        return ship ? ship.name : "-";
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      filters: [
        { text: "在职", value: "active" },
        { text: "离职", value: "inactive" },
        { text: "休假", value: "on_leave" },
      ],
      onFilter: (value: any, record: CrewMember) => record.status === value,
      render: (status: PersonStatus) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "入职日期",
      dataIndex: "join_date",
      key: "join_date",
      width: 120,
      sorter: (a: CrewMember, b: CrewMember) => {
        if (!a.join_date) return 1;
        if (!b.join_date) return -1;
        return dayjs(a.join_date).valueOf() - dayjs(b.join_date).valueOf();
      },
      render: (date: string) => (date ? dayjs(date).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "联系电话",
      dataIndex: "phone",
      key: "phone",
      width: 130,
    },
    {
      title: "操作",
      key: "actions",
      width: 80,
      fixed: "right" as const,
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
              <Title level={4} style={{ margin: 0 }}>
                船员管理
              </Title>
            </Col>
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/crew/add")}
                >
                  添加船员
                </Button>
                <Button
                  icon={<ImportOutlined />}
                  onClick={() => setImportModalVisible(true)}
                >
                  批量导入
                </Button>
                <Button
                  icon={<ExportOutlined />}
                  onClick={() => message.info("导出功能开发中")}
                >
                  导出
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* 基础搜索栏 */}
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={8}>
              <Search
                placeholder="搜索姓名、身份证号"
                onSearch={handleSearch}
                style={{ width: "100%" }}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="状态"
                allowClear
                style={{ width: "100%" }}
                onChange={handleStatusChange}
                value={filters.status || undefined}
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
                style={{ width: "100%" }}
                onChange={handleShipChange}
                value={filters.shipId || undefined}
              >
                {ships.map((ship) => (
                  <Option key={ship.id} value={ship.id}>
                    {ship.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <RangePicker
                placeholder={["开始日期", "结束日期"]}
                style={{ width: "100%" }}
                onChange={handleDateRangeChange}
                value={filters.dateRange}
              />
            </Col>
            <Col span={2}>
              <Space>
                <Button
                  icon={<FilterOutlined />}
                  onClick={() =>
                    setAdvancedSearchVisible(!advancedSearchVisible)
                  }
                >
                  高级
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleResetFilters}
                  title="重置搜索条件"
                />
              </Space>
            </Col>
          </Row>
        </div>

        {/* 高级搜索面板 */}
        <Collapse
          activeKey={advancedSearchVisible ? ["advanced"] : []}
          onChange={() => setAdvancedSearchVisible(!advancedSearchVisible)}
          style={{ marginBottom: 16 }}
        >
          <Panel header="高级搜索" key="advanced">
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Select
                  placeholder="性别"
                  allowClear
                  style={{ width: "100%" }}
                  onChange={handleGenderChange}
                  value={filters.gender || undefined}
                >
                  <Option value="男">男</Option>
                  <Option value="女">女</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Select
                  placeholder="部门"
                  allowClear
                  style={{ width: "100%" }}
                  onChange={handleDepartmentChange}
                  value={filters.department || undefined}
                >
                  <Option value="甲板部">甲板部</Option>
                  <Option value="机舱部">机舱部</Option>
                  <Option value="餐饮部">餐饮部</Option>
                  <Option value="综合部">综合部</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Select
                  placeholder="婚姻状况"
                  allowClear
                  style={{ width: "100%" }}
                  onChange={handleMaritalStatusChange}
                  value={filters.maritalStatus || undefined}
                >
                  <Option value="未婚">未婚</Option>
                  <Option value="已婚">已婚</Option>
                  <Option value="离异">离异</Option>
                  <Option value="丧偶">丧偶</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Select
                  placeholder="教育程度"
                  allowClear
                  style={{ width: "100%" }}
                  onChange={handleEducationChange}
                  value={filters.education || undefined}
                >
                  <Option value="小学">小学</Option>
                  <Option value="初中">初中</Option>
                  <Option value="高中">高中</Option>
                  <Option value="中专">中专</Option>
                  <Option value="大专">大专</Option>
                  <Option value="本科">本科</Option>
                  <Option value="硕士">硕士</Option>
                  <Option value="博士">博士</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Select
                  placeholder="薪资等级"
                  allowClear
                  style={{ width: "100%" }}
                  onChange={handleSalaryGradeChange}
                  value={filters.salaryGrade || undefined}
                >
                  <Option value="1">一级船员</Option>
                  <Option value="2">二级船员</Option>
                  <Option value="3">三级船员</Option>
                  <Option value="4">四级船员</Option>
                  <Option value="5">五级船员</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Input
                  placeholder="手机号码"
                  onChange={(e) => handlePhoneNumberChange(e.target.value)}
                  value={filters.phoneNumber}
                  allowClear
                />
              </Col>
              <Col span={6}>
                <Input
                  placeholder="籍贯"
                  onChange={(e) => handleHometownChange(e.target.value)}
                  value={filters.hometown}
                  allowClear
                />
              </Col>
              <Col span={6}>
                <Input.Group compact>
                  <InputNumber
                    placeholder="最小年龄"
                    min={18}
                    max={65}
                    style={{ width: "48%" }}
                    onChange={(value) => {
                      const min = value || 18;
                      const max = filters.ageRange?.[1] || 65;
                      handleAgeRangeChange([min, max]);
                    }}
                    value={filters.ageRange?.[0]}
                  />
                  <span
                    style={{
                      width: "4%",
                      textAlign: "center",
                      display: "inline-block",
                    }}
                  >
                    -
                  </span>
                  <InputNumber
                    placeholder="最大年龄"
                    min={18}
                    max={65}
                    style={{ width: "48%" }}
                    onChange={(value) => {
                      const min = filters.ageRange?.[0] || 18;
                      const max = value || 65;
                      handleAgeRangeChange([min, max]);
                    }}
                    value={filters.ageRange?.[1]}
                  />
                </Input.Group>
              </Col>
            </Row>
            <Divider />
            <Row justify="end">
              <Col>
                <Space>
                  <Button onClick={handleResetFilters}>重置</Button>
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={() => setAdvancedSearchVisible(false)}
                  >
                    搜索
                  </Button>
                </Space>
              </Col>
            </Row>
          </Panel>
        </Collapse>

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

        {/* 统计信息 */}
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="总人数"
                  value={filteredList.length}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="在职人员"
                  value={
                    filteredList.filter((crew) => crew.status === "active")
                      .length
                  }
                  prefix={<UserAddOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="休假人员"
                  value={
                    filteredList.filter((crew) => crew.status === "on_leave")
                      .length
                  }
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="已离职"
                  value={
                    filteredList.filter((crew) => crew.status === "inactive")
                      .length
                  }
                  prefix={<UserDeleteOutlined />}
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Card>
            </Col>
          </Row>
        </div>

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

      {/* 数据导入模态框 */}
      <DataImportModal
        visible={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        onSuccess={() => {
          setImportModalVisible(false);
          loadCrewList();
        }}
        type="crew"
        title="批量导入船员"
      />
    </div>
  );
};

export default CrewListPage;
