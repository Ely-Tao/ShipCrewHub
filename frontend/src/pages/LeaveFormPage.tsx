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
  Alert,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import crewService from '../services/crewService';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const LeaveFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [crewList, setCrewList] = useState<any[]>([]);
  const [leaveDays, setLeaveDays] = useState(0);
  const isEdit = !!id;

  useEffect(() => {
    loadCrewList();
    if (isEdit) {
      loadLeaveData();
    }
  }, [id]);

  const loadCrewList = async () => {
    try {
      const response = await crewService.getCrewList();
      if (response && response.data) {
        setCrewList(response.data.data);
      }
    } catch (error) {
      console.error('获取船员列表失败', error);
    }
  };

  const loadLeaveData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // 模拟获取请假数据
      const mockData = {
        id: Number(id),
        crew_id: 1,
        start_date: '2024-01-15',
        end_date: '2024-01-20',
        leave_type: 'annual',
        reason: '年假',
        status: 'pending',
        comments: '',
      };
      
      form.setFieldsValue({
        ...mockData,
        date_range: [dayjs(mockData.start_date), dayjs(mockData.end_date)],
      });
      
      // 计算请假天数
      const days = dayjs(mockData.end_date).diff(dayjs(mockData.start_date), 'day') + 1;
      setLeaveDays(days);
    } catch (error) {
      message.error('获取请假信息失败');
      navigate('/leave/list');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setSubmitLoading(true);
    try {
      const [startDate, endDate] = values.date_range;
      const formData = {
        ...values,
        start_date: startDate.format('YYYY-MM-DD'),
        end_date: endDate.format('YYYY-MM-DD'),
        status: 'pending',
      };
      
      delete formData.date_range;

      if (isEdit) {
        // 模拟更新API
        console.log('更新请假:', formData);
        message.success('更新请假申请成功');
      } else {
        // 模拟创建API
        console.log('创建请假:', formData);
        message.success('提交请假申请成功');
      }
      
      navigate('/leave/list');
    } catch (error) {
      message.error(isEdit ? '更新失败' : '提交失败');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/leave/list');
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      const [start, end] = dates;
      const days = end.diff(start, 'day') + 1;
      setLeaveDays(days);
    } else {
      setLeaveDays(0);
    }
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
                  {isEdit ? '编辑请假' : '申请请假'}
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
            leave_type: 'annual',
          }}
        >
          <Divider orientation="left">基本信息</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="申请人"
                name="crew_id"
                rules={[{ required: true, message: '请选择申请人' }]}
              >
                <Select
                  placeholder="请选择申请人"
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
                label="请假类型"
                name="leave_type"
                rules={[{ required: true, message: '请选择请假类型' }]}
              >
                <Select placeholder="请选择请假类型">
                  <Option value="annual">年假</Option>
                  <Option value="sick">病假</Option>
                  <Option value="personal">事假</Option>
                  <Option value="maternity">产假</Option>
                  <Option value="emergency">紧急假</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="请假天数"
                name="leave_days"
              >
                <Input
                  value={leaveDays}
                  readOnly
                  suffix="天"
                  placeholder="请选择日期后自动计算"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">请假时间</Divider>
          
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                label="请假日期"
                name="date_range"
                rules={[{ required: true, message: '请选择请假日期' }]}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={['开始日期', '结束日期']}
                  onChange={handleDateRangeChange}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              {leaveDays > 0 && (
                <Alert
                  message={`请假天数: ${leaveDays} 天`}
                  type="info"
                  icon={<CalendarOutlined />}
                  style={{ marginTop: 30 }}
                />
              )}
            </Col>
          </Row>

          <Divider orientation="left">请假详情</Divider>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="请假原因"
                name="reason"
                rules={[
                  { required: true, message: '请输入请假原因' },
                  { min: 5, max: 200, message: '请假原因长度在5-200个字符之间' },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="请详细说明请假原因"
                  maxLength={200}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="紧急联系人"
                name="emergency_contact"
              >
                <Input placeholder="请输入紧急联系人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="紧急联系电话"
                name="emergency_phone"
                rules={[
                  { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
                ]}
              >
                <Input placeholder="请输入紧急联系电话" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="工作交接说明"
                name="work_handover"
              >
                <TextArea
                  rows={3}
                  placeholder="请说明工作交接情况"
                  maxLength={300}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">附加信息</Divider>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="代理人"
                name="substitute_person"
              >
                <Select placeholder="请选择代理人" allowClear>
                  {crewList.map(crew => (
                    <Option key={crew.id} value={crew.id}>
                      {crew.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="预计返回时间"
                name="expected_return_date"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="请选择预计返回时间"
                />
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
                  rows={3}
                  placeholder="请输入其他备注信息"
                  maxLength={200}
                />
              </Form.Item>
            </Col>
          </Row>

          {!isEdit && (
            <Alert
              message="请假申请提交后将进入审批流程，请耐心等待审批结果。"
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Divider />
          
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitLoading}
                icon={<SaveOutlined />}
              >
                {isEdit ? '更新' : '提交申请'}
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

export default LeaveFormPage;
