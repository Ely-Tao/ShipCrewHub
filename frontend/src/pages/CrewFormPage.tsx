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
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import crewService from '../services/crewService';
import shipService from '../services/shipService';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const CrewFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [ships, setShips] = useState<any[]>([]);
  const isEdit = !!id;

  useEffect(() => {
    loadShips();
    if (isEdit) {
      loadCrewData();
    }
  }, [id]);

  const loadShips = async () => {
    try {
      const response = await shipService.getShipList();
      if (response && response.data) {
        // 后端返回的结构是 { ships: [], pagination: {} }
        setShips(response.data.ships || []);
      }
    } catch (error) {
      console.error('获取船舶列表失败', error);
      // 确保在出错时 ships 仍然是一个数组
      setShips([]);
    }
  };

  const loadCrewData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await crewService.getCrewById(Number(id));
      if (response && response.data) {
        const crew = response.data;
        form.setFieldsValue({
          ...crew,
          birth_date: crew.birth_date ? dayjs(crew.birth_date) : null,
          join_date: crew.join_date ? dayjs(crew.join_date) : null,
        });
      }
    } catch (error) {
      message.error('获取船员信息失败');
      navigate('/crew/list');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setSubmitLoading(true);
    try {
      const formData = {
        ...values,
        birth_date: values.birth_date ? values.birth_date.format('YYYY-MM-DD') : null,
        join_date: values.join_date ? values.join_date.format('YYYY-MM-DD') : null,
      };

      if (isEdit) {
        await crewService.updateCrew(Number(id), formData);
        message.success('更新船员信息成功');
      } else {
        await crewService.createCrew(formData);
        message.success('创建船员信息成功');
      }
      
      navigate('/crew/list');
    } catch (error) {
      message.error(isEdit ? '更新失败' : '创建失败');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/crew/list');
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
                  {isEdit ? '编辑船员' : '添加船员'}
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
            gender: 'male',
            marital_status: 'single',
            education: 'senior',
            department: 'deck',
            nationality: '中国',
          }}
        >
          <Divider orientation="left">基本信息</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="姓名"
                name="name"
                rules={[
                  { required: true, message: '请输入姓名' },
                  { min: 2, max: 20, message: '姓名长度在2-20个字符之间' },
                ]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="性别"
                name="gender"
                rules={[{ required: true, message: '请选择性别' }]}
              >
                <Select placeholder="请选择性别">
                  <Option value="male">男</Option>
                  <Option value="female">女</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="出生日期"
                name="birth_date"
                rules={[{ required: true, message: '请选择出生日期' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="请选择出生日期"
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="身份证号"
                name="id_card"
                rules={[
                  { required: true, message: '请输入身份证号' },
                  { pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/, message: '身份证号格式不正确' },
                ]}
              >
                <Input placeholder="请输入身份证号" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="婚姻状况"
                name="marital_status"
                rules={[{ required: true, message: '请选择婚姻状况' }]}
              >
                <Select placeholder="请选择婚姻状况">
                  <Option value="single">未婚</Option>
                  <Option value="married">已婚</Option>
                  <Option value="divorced">离异</Option>
                  <Option value="widowed">丧偶</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="国籍"
                name="nationality"
                rules={[{ required: true, message: '请输入国籍' }]}
              >
                <Input placeholder="请输入国籍" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="籍贯"
                name="hometown"
                rules={[{ required: true, message: '请输入籍贯' }]}
              >
                <Input placeholder="请输入籍贯" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="联系电话"
                name="phone"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
                ]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">紧急联系人</Divider>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="紧急联系人姓名"
                name="emergency_contact_name"
                rules={[{ required: true, message: '请输入紧急联系人姓名' }]}
              >
                <Input placeholder="请输入紧急联系人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="紧急联系人电话"
                name="emergency_contact_phone"
                rules={[
                  { required: true, message: '请输入紧急联系人电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
                ]}
              >
                <Input placeholder="请输入紧急联系人电话" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">教育背景</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="学历"
                name="education"
                rules={[{ required: true, message: '请选择学历' }]}
              >
                <Select placeholder="请选择学历">
                  <Option value="primary">小学</Option>
                  <Option value="junior">初中</Option>
                  <Option value="senior">高中</Option>
                  <Option value="college">专科</Option>
                  <Option value="bachelor">本科</Option>
                  <Option value="master">硕士</Option>
                  <Option value="doctor">博士</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="学校"
                name="school"
              >
                <Input placeholder="请输入学校名称" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="专业"
                name="major"
              >
                <Input placeholder="请输入专业名称" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">工作信息</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="入职日期"
                name="join_date"
                rules={[{ required: true, message: '请选择入职日期' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="请选择入职日期"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="所属船舶"
                name="ship_id"
              >
                <Select placeholder="请选择所属船舶" allowClear>
                  {ships.map(ship => (
                    <Option key={ship.id} value={ship.id}>
                      {ship.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="部门"
                name="department"
                rules={[{ required: true, message: '请选择部门' }]}
              >
                <Select placeholder="请选择部门">
                  <Option value="deck">甲板部</Option>
                  <Option value="engine">机舱部</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="薪资等级"
                name="salary_grade"
                rules={[{ required: true, message: '请选择薪资等级' }]}
              >
                <Select placeholder="请选择薪资等级">
                  <Option value="1">一级船员 (8K-12K)</Option>
                  <Option value="2">二级船员 (12K-18K)</Option>
                  <Option value="3">三级船员 (18K-25K)</Option>
                  <Option value="4">四级船员 (25K-35K)</Option>
                  <Option value="5">五级船员 (35K-50K)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="状态"
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="active">在职</Option>
                  <Option value="inactive">离职</Option>
                  <Option value="on_leave">休假</Option>
                </Select>
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

export default CrewFormPage;
