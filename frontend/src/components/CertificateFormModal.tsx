import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  message,
  Row,
  Col,
} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { Certificate } from '../types';
import certificateService from '../services/certificateService';
import dayjs from 'dayjs';

const { Option } = Select;
const { Dragger } = Upload;

interface CertificateFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  crewId: number;
  certificate?: Certificate | null;
  mode: 'create' | 'edit';
}

const CertificateFormModal: React.FC<CertificateFormModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  crewId,
  certificate,
  mode,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);

  const certificateTypes = [
    { value: 'seamans_book', label: '海员证' },
    { value: 'deck_officer', label: '甲板部船员证书' },
    { value: 'engine_officer', label: '轮机部船员证书' },
    { value: 'medical', label: '体检证明' },
    { value: 'safety', label: '安全培训证书' },
    { value: 'special', label: '特殊技能证书' },
  ];

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && certificate) {
        form.setFieldsValue({
          ...certificate,
          issue_date: certificate.issue_date ? dayjs(certificate.issue_date) : null,
          expiry_date: certificate.expiry_date ? dayjs(certificate.expiry_date) : null,
        });
      } else {
        form.resetFields();
        setFileList([]);
      }
    }
  }, [visible, mode, certificate, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formattedValues = {
        ...values,
        crew_id: crewId,
        issue_date: values.issue_date ? values.issue_date.format('YYYY-MM-DD') : null,
        expiry_date: values.expiry_date ? values.expiry_date.format('YYYY-MM-DD') : null,
      };

      if (mode === 'create') {
        await certificateService.createCertificate(formattedValues);
        message.success('证书添加成功');
      } else if (certificate) {
        await certificateService.updateCertificate(certificate.id, formattedValues);
        message.success('证书更新成功');
      }

      onSuccess();
      onCancel();
    } catch (error) {
      console.error('Certificate form error:', error);
      message.error(mode === 'create' ? '添加证书失败' : '更新证书失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = {
    name: 'file',
    multiple: false,
    beforeUpload: () => false, // 阻止自动上传
    onChange(info: any) {
      setFileList(info.fileList);
    },
  };

  return (
    <Modal
      title={mode === 'create' ? '添加证书' : '编辑证书'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: 'active' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="certificate_type"
              label="证书类型"
              rules={[{ required: true, message: '请选择证书类型' }]}
            >
              <Select placeholder="选择证书类型">
                {certificateTypes.map(type => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="certificate_number"
              label="证书编号"
              rules={[{ required: true, message: '请输入证书编号' }]}
            >
              <Input placeholder="输入证书编号" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="issue_date"
              label="签发日期"
              rules={[{ required: true, message: '请选择签发日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="expiry_date"
              label="到期日期"
              rules={[{ required: true, message: '请选择到期日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="issuing_authority"
          label="签发机构"
          rules={[{ required: true, message: '请输入签发机构' }]}
        >
          <Input placeholder="输入签发机构名称" />
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select>
            <Option value="active">有效</Option>
            <Option value="expired">已过期</Option>
            <Option value="revoked">已撤销</Option>
          </Select>
        </Form.Item>

        <Form.Item label="证书文件">
          <Dragger {...handleUpload} fileList={fileList}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持单个文件上传，建议上传PDF格式的证书扫描件
            </p>
          </Dragger>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CertificateFormModal;
