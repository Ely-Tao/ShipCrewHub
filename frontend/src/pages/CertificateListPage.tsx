import React, { useState, useEffect } from "react";
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
} from "antd";
import {
  PlusOutlined,
  ExportOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
  ImportOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  type Certificate,
  type CertificateStatus,
  type CertificateType,
} from "../types";
import dayjs from "dayjs";
import DataImportModal from "../components/DataImportModal";

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const CertificateListPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [certificateList, setCertificateList] = useState<Certificate[]>([]);
  const [filteredList, setFilteredList] = useState<Certificate[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [importModalVisible, setImportModalVisible] = useState(false);

  // 筛选状态
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    certificateType: "",
    expiryDateRange: null as [dayjs.Dayjs, dayjs.Dayjs] | null,
  });

  useEffect(() => {
    loadCertificateList();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [certificateList, filters]);

  const loadCertificateList = async () => {
    setLoading(true);
    try {
      // 模拟 API 调用
      const mockData: Certificate[] = [
        {
          id: 1,
          crew_id: 1,
          certificate_type: "seamans_book",
          certificate_number: "SB001",
          issue_date: "2023-01-15",
          expiry_date: "2025-01-15",
          issuing_authority: "海事局",
          status: "active",
          created_at: "2023-01-15T10:00:00Z",
        },
        {
          id: 2,
          crew_id: 2,
          certificate_type: "deck_officer",
          certificate_number: "DO002",
          issue_date: "2023-02-20",
          expiry_date: "2024-02-20",
          issuing_authority: "海事局",
          status: "active",
          created_at: "2023-02-20T10:00:00Z",
        },
        {
          id: 3,
          crew_id: 3,
          certificate_type: "medical",
          certificate_number: "MD003",
          issue_date: "2023-03-10",
          expiry_date: "2024-03-10",
          issuing_authority: "卫生部",
          status: "expired",
          created_at: "2023-03-10T10:00:00Z",
        },
      ];
      setCertificateList(mockData);
    } catch (error) {
      message.error("获取证书列表失败");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...certificateList];

    // 搜索过滤
    if (filters.search) {
      filtered = filtered.filter(
        (cert) =>
          cert.certificate_number
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          cert.issuing_authority
            .toLowerCase()
            .includes(filters.search.toLowerCase())
      );
    }

    // 状态过滤
    if (filters.status) {
      filtered = filtered.filter((cert) => cert.status === filters.status);
    }

    // 证书类型过滤
    if (filters.certificateType) {
      filtered = filtered.filter(
        (cert) => cert.certificate_type === filters.certificateType
      );
    }

    // 到期日期范围过滤
    if (filters.expiryDateRange) {
      const [start, end] = filters.expiryDateRange;
      filtered = filtered.filter((cert) => {
        const expiryDate = dayjs(cert.expiry_date);
        return expiryDate.isAfter(start) && expiryDate.isBefore(end);
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

  const handleCertificateTypeChange = (value: string) => {
    setFilters((prev) => ({ ...prev, certificateType: value }));
  };

  const handleExpiryDateRangeChange = (dates: any) => {
    setFilters((prev) => ({ ...prev, expiryDateRange: dates }));
  };

  const handleDelete = async (certificateId: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这条证书记录吗？此操作不可恢复。",
      onOk: async () => {
        try {
          // 模拟删除 API
          console.log("Deleting certificate:", certificateId);
          message.success("删除成功");
          loadCertificateList();
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
          message.success("批量删除成功");
          setSelectedRowKeys([]);
          loadCertificateList();
        } catch (error) {
          message.error("批量删除失败");
        }
      },
    });
  };

  const getStatusColor = (status: CertificateStatus) => {
    switch (status) {
      case "active":
        return "green";
      case "expired":
        return "red";
      case "revoked":
        return "orange";
      default:
        return "default";
    }
  };

  const getStatusText = (status: CertificateStatus) => {
    switch (status) {
      case "active":
        return "有效";
      case "expired":
        return "过期";
      case "revoked":
        return "吊销";
      default:
        return "未知";
    }
  };

  const getCertificateTypeText = (type: CertificateType) => {
    switch (type) {
      case "seamans_book":
        return "海员证";
      case "deck_officer":
        return "甲板证书";
      case "engine_officer":
        return "轮机证书";
      case "medical":
        return "体检证书";
      case "safety":
        return "安全证书";
      case "special":
        return "特种证书";
      default:
        return "未知";
    }
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = dayjs(expiryDate);
    const today = dayjs();
    return expiry.diff(today, "day") <= 30;
  };

  const getActionsMenu = (record: Certificate): MenuProps => ({
    items: [
      {
        key: "view",
        icon: <EyeOutlined />,
        label: "查看详情",
        onClick: () => navigate(`/certificates/detail/${record.id}`),
      },
      {
        key: "edit",
        icon: <EditOutlined />,
        label: "编辑",
        onClick: () => navigate(`/certificates/edit/${record.id}`),
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
      title: "证书编号",
      dataIndex: "certificate_number",
      key: "certificate_number",
      width: 120,
      fixed: "left" as const,
    },
    {
      title: "证书类型",
      dataIndex: "certificate_type",
      key: "certificate_type",
      width: 120,
      render: (type: CertificateType) => getCertificateTypeText(type),
    },
    {
      title: "颁发机构",
      dataIndex: "issuing_authority",
      key: "issuing_authority",
      width: 120,
    },
    {
      title: "颁发日期",
      dataIndex: "issue_date",
      key: "issue_date",
      width: 120,
      render: (date: string) => (date ? dayjs(date).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "到期日期",
      dataIndex: "expiry_date",
      key: "expiry_date",
      width: 120,
      render: (date: string, record: Certificate) => {
        if (!date) return "-";
        const formattedDate = dayjs(date).format("YYYY-MM-DD");
        const isExpiring = isExpiringSoon(date);
        const isExpired = record.status === "expired";

        return (
          <span
            style={{
              color: isExpired ? "#ff4d4f" : isExpiring ? "#faad14" : "inherit",
              fontWeight: isExpired || isExpiring ? "bold" : "normal",
            }}
          >
            {formattedDate}
            {isExpiring && !isExpired && (
              <ExclamationCircleOutlined
                style={{ marginLeft: 4, color: "#faad14" }}
              />
            )}
          </span>
        );
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: CertificateStatus) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 80,
      fixed: "right" as const,
      render: (_: any, record: Certificate) => (
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
                证书管理
              </Title>
            </Col>
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/certificates/add")}
                >
                  添加证书
                </Button>
                <Button
                  icon={<ImportOutlined />}
                  onClick={() => setImportModalVisible(true)}
                >
                  导入
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

        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Search
                placeholder="搜索证书编号、颁发机构"
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
              >
                <Option value="active">有效</Option>
                <Option value="expired">过期</Option>
                <Option value="revoked">吊销</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="证书类型"
                allowClear
                style={{ width: "100%" }}
                onChange={handleCertificateTypeChange}
              >
                <Option value="seamans_book">海员证</Option>
                <Option value="deck_officer">甲板证书</Option>
                <Option value="engine_officer">轮机证书</Option>
                <Option value="medical">体检证书</Option>
                <Option value="safety">安全证书</Option>
                <Option value="special">特种证书</Option>
              </Select>
            </Col>
            <Col span={6}>
              <RangePicker
                placeholder={["开始日期", "结束日期"]}
                style={{ width: "100%" }}
                onChange={handleExpiryDateRangeChange}
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

      <DataImportModal
        visible={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        type="certificate"
        title="证书导入"
        onSuccess={() => {
          setImportModalVisible(false);
          loadCertificateList();
          message.success("证书导入成功");
        }}
      />
    </div>
  );
};

export default CertificateListPage;
