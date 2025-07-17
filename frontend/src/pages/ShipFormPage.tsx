import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Card,
  Typography,
  Row,
  Col,
  message,
  Space,
  Divider,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import shipService from '../services/shipService';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ShipFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      loadShipData();
    }
  }, [id]);

  const loadShipData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await shipService.getShipById(Number(id));
      if (response && response.data) {
        form.setFieldsValue(response.data);
      }
    } catch (error) {
      message.error('获取船舶信息失败');
      navigate('/ships/list');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setSubmitLoading(true);
    try {
      if (isEdit) {
        await shipService.updateShip(Number(id), values);
        message.success('更新船舶信息成功');
      } else {
        await shipService.createShip(values);
        message.success('创建船舶信息成功');
      }
      
      navigate('/ships/list');
    } catch (error) {
      message.error(isEdit ? '更新失败' : '创建失败');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/ships/list');
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
                  {isEdit ? '编辑船舶' : '添加船舶'}
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
            ship_type: 'cargo',
          }}
        >
          <Divider orientation="left">基本信息</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="船舶名称"
                name="name"
                rules={[
                  { required: true, message: '请输入船舶名称' },
                  { min: 2, max: 50, message: '船舶名称长度在2-50个字符之间' },
                ]}
              >
                <Input placeholder="请输入船舶名称" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="船舶编号"
                name="ship_number"
                rules={[
                  { required: true, message: '请输入船舶编号' },
                  { pattern: /^[A-Z0-9]{6,20}$/, message: '船舶编号格式不正确（6-20位字母数字）' },
                ]}
              >
                <Input placeholder="请输入船舶编号" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="船舶类型"
                name="ship_type"
                rules={[{ required: true, message: '请选择船舶类型' }]}
              >
                <Select placeholder="请选择船舶类型">
                  <Option value="cargo">货船</Option>
                  <Option value="passenger">客船</Option>
                  <Option value="tanker">油轮</Option>
                  <Option value="container">集装箱船</Option>
                  <Option value="bulk">散货船</Option>
                  <Option value="fishing">渔船</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">技术参数</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="载重量（吨）"
                name="capacity"
                rules={[
                  { required: true, message: '请输入载重量' },
                  { type: 'number', min: 1, message: '载重量必须大于0' },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入载重量"
                  min={1}
                  max={999999}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="船员配置（人）"
                name="crew_count"
                rules={[
                  { type: 'number', min: 0, message: '船员数量不能为负数' },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入船员配置"
                  min={0}
                  max={999}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="状态"
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="active">在运行</Option>
                  <Option value="inactive">停运</Option>
                  <Option value="maintenance">维护中</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">详细信息</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="船长（米）"
                name="length"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入船长"
                  min={1}
                  max={999}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="船宽（米）"
                name="width"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入船宽"
                  min={1}
                  max={999}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="吃水深度（米）"
                name="draft"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入吃水深度"
                  min={0.1}
                  max={99}
                  precision={2}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="建造年份"
                name="build_year"
                rules={[
                  { type: 'number', min: 1900, max: new Date().getFullYear(), message: '建造年份不正确' },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入建造年份"
                  min={1900}
                  max={new Date().getFullYear()}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="建造船厂"
                name="shipyard"
              >
                <Input placeholder="请输入建造船厂" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="船级社"
                name="classification_society"
              >
                <Input placeholder="请输入船级社" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="IMO号"
                name="imo_number"
              >
                <Input placeholder="请输入IMO号" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="MMSI号"
                name="mmsi_number"
              >
                <Input placeholder="请输入MMSI号" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="呼号"
                name="call_sign"
              >
                <Input placeholder="请输入呼号" />
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

export default ShipFormPage;
