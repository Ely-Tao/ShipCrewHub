import React, { useState } from 'react';
import {
  Modal,
  Form,
  DatePicker,
  Input,
  message,
  Row,
  Col,
} from 'antd';
import type { Certificate } from '../types';
import certificateService from '../services/certificateService';
import dayjs from 'dayjs';

interface CertificateRenewModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  certificate: Certificate | null;
}

const CertificateRenewModal: React.FC<CertificateRenewModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  certificate,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (visible && certificate) {
      form.setFieldsValue({
        current_expiry_date: dayjs(certificate.expiry_date),
        new_issue_date: dayjs(),
        new_expiry_date: null,
      });
    }
  }, [visible, certificate, form]);

  const handleSubmit = async () => {
    if (!certificate) return;

    try {
      const values = await form.validateFields();
      setLoading(true);

      const renewData = {
        new_expiry_date: values.new_expiry_date.format('YYYY-MM-DD'),
        new_issue_date: values.new_issue_date ? values.new_issue_date.format('YYYY-MM-DD') : undefined,
      };

      await certificateService.renewCertificate(certificate.id, renewData);
      message.success('证书续期成功');
      onSuccess();
      onCancel();
    } catch (error) {
      console.error('Certificate renew error:', error);
      message.error('证书续期失败');
    } finally {
      setLoading(false);
    }
  };

  const getCertificateTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      seamans_book: '海员证',
      deck_officer: '甲板部船员证书',
      engine_officer: '轮机部船员证书',
      medical: '体检证明',
      safety: '安全培训证书',
      special: '特殊技能证书',
    };
    return typeMap[type] || type;
  };

  return (
    <Modal
      title="证书续期"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      {certificate && (
        <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
          <h4>证书信息</h4>
          <Row gutter={16}>
            <Col span={12}>
              <strong>证书类型：</strong>{getCertificateTypeName(certificate.certificate_type)}
            </Col>
            <Col span={12}>
              <strong>证书编号：</strong>{certificate.certificate_number}
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col span={12}>
              <strong>签发机构：</strong>{certificate.issuing_authority}
            </Col>
            <Col span={12}>
              <strong>当前到期日：</strong>{dayjs(certificate.expiry_date).format('YYYY-MM-DD')}
            </Col>
          </Row>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="current_expiry_date"
              label="当前到期日期"
            >
              <DatePicker disabled style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="new_issue_date"
              label="新签发日期"
              rules={[{ required: true, message: '请选择新签发日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="new_expiry_date"
          label="新到期日期"
          rules={[{ required: true, message: '请选择新到期日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="remarks"
          label="备注"
        >
          <Input.TextArea
            rows={3}
            placeholder="输入续期备注信息（可选）"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CertificateRenewModal;
