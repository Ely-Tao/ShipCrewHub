import React, { useState } from "react";
import {
  Modal,
  Steps,
  Button,
  Upload,
  message,
  Table,
  Alert,
  Card,
  Spin,
  Space,
  Typography,
  Divider,
  Progress,
  Tag,
  Tooltip,
} from "antd";
import {
  InboxOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import importService, {
  type ImportValidationResult,
  type ImportResult,
} from "../services/importService";

const { Step } = Steps;
const { Dragger } = Upload;
const { Title, Text, Paragraph } = Typography;

interface DataImportModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  type: "crew" | "certificate";
  title: string;
}

const DataImportModal: React.FC<DataImportModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  type,
  title,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] =
    useState<ImportValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);

  const handleModalClose = () => {
    setCurrentStep(0);
    setUploadedFile(null);
    setValidationResult(null);
    setImportResult(null);
    setPreviewData([]);
    onCancel();
  };

  const handleSuccess = () => {
    setCurrentStep(0);
    setUploadedFile(null);
    setValidationResult(null);
    setImportResult(null);
    setPreviewData([]);
    onSuccess();
  };

  // 下载模板
  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      const blob = await importService.downloadTemplate(type);
      const filename =
        type === "crew" ? "船员导入模板.xlsx" : "证书导入模板.xlsx";
      importService.downloadFile(blob, filename);
      message.success("模板下载成功");
    } catch (error) {
      message.error("模板下载失败");
      console.error("Download template error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 文件上传配置
  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    accept: ".xlsx,.xls,.csv",
    beforeUpload: (file) => {
      // 验证文件类型
      if (!importService.validateFileType(file)) {
        message.error("只允许上传 Excel 文件 (.xlsx, .xls) 或 CSV 文件");
        return false;
      }

      // 验证文件大小
      if (!importService.validateFileSize(file, 10)) {
        message.error("文件大小不能超过 10MB");
        return false;
      }

      setUploadedFile(file);
      return false; // 阻止自动上传
    },
    onRemove: () => {
      setUploadedFile(null);
    },
    fileList: uploadedFile
      ? [
          {
            uid: "1",
            name: uploadedFile.name,
            status: "done" as const,
            url: "",
            originFileObj: uploadedFile as any,
          },
        ]
      : [],
  };

  // 验证文件
  const handleValidateFile = async () => {
    if (!uploadedFile) {
      message.error("请先上传文件");
      return;
    }

    try {
      setLoading(true);
      const response = await importService.validateFile(uploadedFile, type);

      if (response.success && response.validation) {
        setValidationResult(response.validation);
        setPreviewData(response.previewData || []);
        setCurrentStep(1);

        if (response.validation.isValid) {
          message.success(
            `文件验证通过，共 ${response.validation.validCount} 条有效数据`
          );
        } else {
          message.warning(
            `文件验证发现问题，共 ${response.validation.errors.length} 个错误`
          );
        }
      }
    } catch (error) {
      message.error("文件验证失败");
      console.error("Validate file error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 执行导入
  const handleImportData = async () => {
    if (!uploadedFile || !validationResult?.isValid) {
      message.error("请先验证文件");
      return;
    }

    try {
      setLoading(true);
      const response = await importService.importData(uploadedFile, type);

      if (response.success && response.result) {
        setImportResult(response.result);
        setCurrentStep(2);
        message.success(response.message || "数据导入成功");
      }
    } catch (error) {
      message.error("数据导入失败");
      console.error("Import data error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 错误信息表格列
  const errorColumns = [
    {
      title: "行号",
      dataIndex: "row",
      key: "row",
      width: 80,
      render: (row: number) => <Tag color="red">{row}</Tag>,
    },
    {
      title: "字段",
      dataIndex: "field",
      key: "field",
      width: 120,
      render: (field: string) => <Text code>{field}</Text>,
    },
    {
      title: "错误信息",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
    },
    {
      title: "值",
      dataIndex: "value",
      key: "value",
      width: 150,
      ellipsis: true,
      render: (value: unknown) => (
        <Tooltip title={String(value)}>
          <Text type="secondary">{String(value)}</Text>
        </Tooltip>
      ),
    },
  ];

  // 预览数据表格列
  const getPreviewColumns = () => {
    if (previewData.length === 0) return [];

    const fieldMapping = importService.getFieldMapping(type);
    return Object.keys(previewData[0]).map((key) => ({
      title: fieldMapping[key] || key,
      dataIndex: key,
      key,
      ellipsis: true,
      width: 120,
      render: (value: unknown) => (
        <Tooltip title={String(value)}>
          <Text>{String(value)}</Text>
        </Tooltip>
      ),
    }));
  };

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Alert
                message="导入说明"
                description={
                  <div>
                    <Paragraph>
                      1. 请先下载模板文件，按照模板格式填写数据
                    </Paragraph>
                    <Paragraph>
                      2. 支持 Excel (.xlsx, .xls) 和 CSV 格式
                    </Paragraph>
                    <Paragraph>3. 文件大小不能超过 10MB</Paragraph>
                    <Paragraph>
                      4. 必填字段不能为空，请确保数据格式正确
                    </Paragraph>
                  </div>
                }
                type="info"
                showIcon
              />

              <Card>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleDownloadTemplate}
                    loading={loading}
                    size="large"
                  >
                    下载导入模板
                  </Button>

                  <Divider />

                  <Dragger {...uploadProps}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                      点击或拖拽文件到此区域上传
                    </p>
                    <p className="ant-upload-hint">
                      支持单个文件上传，请上传 Excel 或 CSV 格式文件
                    </p>
                  </Dragger>
                </Space>
              </Card>
            </Space>
          </div>
        );

      case 1:
        return (
          <div>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {validationResult && (
                <Card>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Title level={4}>验证结果</Title>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Space>
                        <Text>
                          总行数:{" "}
                          <Text strong>{validationResult.totalRows}</Text>
                        </Text>
                        <Text>
                          有效行数:{" "}
                          <Text strong type="success">
                            {validationResult.validCount}
                          </Text>
                        </Text>
                        <Text>
                          错误行数:{" "}
                          <Text strong type="danger">
                            {validationResult.errors.length}
                          </Text>
                        </Text>
                      </Space>

                      <Progress
                        percent={Math.round(
                          (validationResult.validCount /
                            validationResult.totalRows) *
                            100
                        )}
                        status={
                          validationResult.isValid ? "success" : "exception"
                        }
                        style={{ width: 200 }}
                      />
                    </div>

                    {validationResult.isValid ? (
                      <Alert
                        message="数据验证通过"
                        description="所有数据都符合要求，可以进行导入"
                        type="success"
                        showIcon
                        icon={<CheckCircleOutlined />}
                      />
                    ) : (
                      <Alert
                        message="数据验证失败"
                        description="请修正错误后重新上传文件"
                        type="error"
                        showIcon
                        icon={<CloseCircleOutlined />}
                      />
                    )}

                    {validationResult.errors.length > 0 && (
                      <div>
                        <Title level={5}>错误详情</Title>
                        <Table
                          columns={errorColumns}
                          dataSource={validationResult.errors}
                          rowKey={(record, index) =>
                            `${record.row}-${record.field}-${index}`
                          }
                          pagination={{ pageSize: 10 }}
                          size="small"
                          scroll={{ x: 600 }}
                        />
                      </div>
                    )}

                    {previewData.length > 0 && (
                      <div>
                        <Title level={5}>数据预览 (前5条)</Title>
                        <Table
                          columns={getPreviewColumns()}
                          dataSource={previewData}
                          rowKey={(_, index) => index ?? 0}
                          pagination={false}
                          size="small"
                          scroll={{ x: 800 }}
                        />
                      </div>
                    )}
                  </Space>
                </Card>
              )}
            </Space>
          </div>
        );

      case 2:
        return (
          <div>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {importResult && (
                <Card>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div style={{ textAlign: "center" }}>
                      <CheckCircleOutlined
                        style={{ fontSize: 64, color: "#52c41a" }}
                      />
                      <Title level={3}>导入完成</Title>
                    </div>

                    <Alert
                      message="导入成功"
                      description={importResult.message}
                      type="success"
                      showIcon
                    />

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Space>
                        <Text>
                          总数据: <Text strong>{importResult.totalCount}</Text>
                        </Text>
                        <Text>
                          成功导入:{" "}
                          <Text strong type="success">
                            {importResult.importedCount}
                          </Text>
                        </Text>
                        <Text>
                          失败数量:{" "}
                          <Text strong type="danger">
                            {importResult.errors.length}
                          </Text>
                        </Text>
                      </Space>

                      <Progress
                        percent={Math.round(
                          (importResult.importedCount /
                            importResult.totalCount) *
                            100
                        )}
                        status="success"
                        style={{ width: 200 }}
                      />
                    </div>

                    {importResult.errors.length > 0 && (
                      <div>
                        <Title level={5}>导入错误</Title>
                        <Table
                          columns={errorColumns}
                          dataSource={importResult.errors}
                          rowKey={(record, index) =>
                            `${record.row}-${record.field}-${index}`
                          }
                          pagination={{ pageSize: 10 }}
                          size="small"
                          scroll={{ x: 600 }}
                        />
                      </div>
                    )}
                  </Space>
                </Card>
              )}
            </Space>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      title={
        <Space>
          <FileExcelOutlined />
          {title}
        </Space>
      }
      open={visible}
      onCancel={handleModalClose}
      width={1000}
      footer={
        <Space>
          <Button onClick={handleModalClose}>取消</Button>
          {currentStep === 0 && (
            <Button
              type="primary"
              onClick={handleValidateFile}
              disabled={!uploadedFile}
              loading={loading}
            >
              验证文件
            </Button>
          )}
          {currentStep === 1 && (
            <Space>
              <Button onClick={() => setCurrentStep(0)}>上一步</Button>
              <Button
                type="primary"
                onClick={handleImportData}
                disabled={!validationResult?.isValid}
                loading={loading}
              >
                执行导入
              </Button>
            </Space>
          )}
          {currentStep === 2 && (
            <Button type="primary" onClick={handleSuccess}>
              完成
            </Button>
          )}
        </Space>
      }
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="上传文件" icon={<InboxOutlined />} />
          <Step title="验证数据" icon={<ExclamationCircleOutlined />} />
          <Step title="导入完成" icon={<CheckCircleOutlined />} />
        </Steps>

        {renderStepContent()}
      </Spin>
    </Modal>
  );
};

export default DataImportModal;
