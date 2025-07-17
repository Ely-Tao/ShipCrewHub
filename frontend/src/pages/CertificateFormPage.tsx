import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  Typography,
  Row,
  Col,
  message,
  Space,
  Divider,
  Upload,
  type UploadProps,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import crewService from '../services/crewService';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CertificateFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [crewList, setCrewList] = useState<any[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const isEdit = !!id;

  useEffect(() => {
    loadCrewList();
    if (isEdit) {
      loadCertificateData();
    }
  }, [id]);

  const loadCrewList = async () => {
    try {
      const response = await crewService.getCrewList();
      if (response && response.data) {
        // 后端返回的结构是 { crews: [], pagination: {} }
        setCrewList(response.data.crews || []);
      }
    } catch (error) {
      console.error('获取船员列表失败', error);
      // 确保在出错时 crewList 仍然是一个数组
      setCrewList([]);
    }
  };

  const loadCertificateData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // 模拟获取证书数据
      const mockData = {
        id: Number(id),
        crew_id: 1,
        certificate_type: 'seamans_book',
        certificate_number: 'SB001',
        issue_date: '2023-01-15',
        expiry_date: '2025-01-15',
        issuing_authority: '海事局',
        status: 'active',
        remarks: '正常有效',
      };
      
      form.setFieldsValue({
        ...mockData,
        issue_date: mockData.issue_date ? dayjs(mockData.issue_date) : null,
        expiry_date: mockData.expiry_date ? dayjs(mockData.expiry_date) : null,
      });
    } catch (error) {
      message.error('获取证书信息失败');
      navigate('/certificates/list');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setSubmitLoading(true);
    try {
      const formData = {
        ...values,
        issue_date: values.issue_date ? values.issue_date.format('YYYY-MM-DD') : null,
        expiry_date: values.expiry_date ? values.expiry_date.format('YYYY-MM-DD') : null,
      };

      if (isEdit) {
        // 模拟更新API
        console.log('更新证书:', formData);
        message.success('更新证书信息成功');
      } else {
        // 模拟创建API
        console.log('创建证书:', formData);
        message.success('创建证书信息成功');
      }
      
      navigate('/certificates/list');
    } catch (error) {
      message.error(isEdit ? '更新失败' : '创建失败');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/certificates/list');
  };

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    fileList,
    onChange(info) {
      setFileList(info.fileList);
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
    beforeUpload: (file) => {
      const isValidType = file.type === 'application/pdf' || file.type.startsWith('image/');
      if (!isValidType) {
        message.error('只能上传PDF或图片文件');
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过10MB');
      }
      return isValidType && isLt10M;
    },
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          加载中...
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={handleCancel}
                >
                  返回
                </Button>
                <Title level={4} style={{ margin: 0 }}>
                  {isEdit ? '编辑证书' : '添加证书'}
                </Title>
              </Space>
            </Col>
          </Row>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'active',
            certificate_type: 'seamans_book',
          }}
        >
          <Divider orientation="left">基本信息</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="持证人"
                name="crew_id"
                rules={[{ required: true, message: '请选择持证人' }]}
              >
                <Select
                  placeholder="请选择持证人"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {crewList.map(crew => (
                    <Option key={crew.id} value={crew.id}>
                      {crew.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="证书类型"
                name="certificate_type"
                rules={[{ required: true, message: '请选择证书类型' }]}
              >
                <Select placeholder="请选择证书类型">
                  <Option value="seamans_book">海员证</Option>
                  <Option value="deck_officer">甲板证书</Option>
                  <Option value="engine_officer">轮机证书</Option>
                  <Option value="medical">体检证书</Option>
                  <Option value="safety">安全证书</Option>
                  <Option value="special">特种证书</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="证书编号"
                name="certificate_number"
                rules={[
                  { required: true, message: '请输入证书编号' },
                  { min: 3, max: 50, message: '证书编号长度在3-50个字符之间' },
                ]}
              >
                <Input placeholder="请输入证书编号" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">证书信息</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="颁发日期"
                name="issue_date"
                rules={[{ required: true, message: '请选择颁发日期' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="请选择颁发日期"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="到期日期"
                name="expiry_date"
                rules={[{ required: true, message: '请选择到期日期' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="请选择到期日期"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="颁发机构"
                name="issuing_authority"
                rules={[{ required: true, message: '请输入颁发机构' }]}
              >
                <Input placeholder="请输入颁发机构" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="证书状态"
                name="status"
                rules={[{ required: true, message: '请选择证书状态' }]}
              >
                <Select placeholder="请选择证书状态">
                  <Option value="active">有效</Option>
                  <Option value="expired">过期</Option>
                  <Option value="revoked">吊销</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="证书等级"
                name="certificate_level"
              >
                <Select placeholder="请选择证书等级" allowClear>
                  <Option value="A">A级</Option>
                  <Option value="B">B级</Option>
                  <Option value="C">C级</Option>
                  <Option value="D">D级</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="适用范围"
                name="scope"
              >
                <Input placeholder="请输入适用范围" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">附加信息</Divider>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="证书文件"
                name="certificate_file"
              >
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>上传证书文件</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="培训机构"
                name="training_institution"
              >
                <Input placeholder="请输入培训机构" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="备注"
                name="remarks"
              >
                <TextArea
                  rows={4}
                  placeholder="请输入备注信息"
                  maxLength={500}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitLoading}
                icon={<SaveOutlined />}
              >
                {isEdit ? '更新' : '创建'}
              </Button>
              <Button onClick={handleCancel}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CertificateFormPage;
