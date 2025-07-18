import React, { useState } from "react";
import { Button, Card, Space, message, Typography } from "antd";
import certificateService from "../services/certificateService";
import type { CertificateType } from "../types";

const { Title, Text } = Typography;

const CertificateTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const setTestAuth = () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1Mjg0NDQwOSwiZXhwIjoxNzUyOTMwODA5fQ.mTyTC0FubIEcocGv57jrFkR-lMEMAxTecHcXtE1IdSg";
    const user = {
      id: 1,
      username: "admin",
      email: "admin@shipcrewdb.com",
      role: "admin",
      status: "active",
    };

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    message.success("测试认证已设置 (最新有效token - 2025-07-18 21:13)");
  };

  const testGetCertificates = async () => {
    setLoading(true);
    try {
      const response = await certificateService.getCertificatesByCrewId(2);
      console.log("获取证书响应:", response);
      setResult(response);
      message.success("获取证书成功");
    } catch (error) {
      console.error("获取证书错误:", error);
      setResult({ error: error });
      message.error("获取证书失败");
    } finally {
      setLoading(false);
    }
  };

  const testCreateCertificate = async () => {
    setLoading(true);
    try {
      const certificateData = {
        crew_id: 2,
        certificate_type: "special" as CertificateType,
        certificate_number: "TEST" + Date.now(),
        issue_date: "2025-01-01",
        expiry_date: "2027-01-01",
        issuing_authority: "前端测试机构",
        status: "active" as const,
      };

      console.log("创建证书数据:", certificateData);
      const response = await certificateService.createCertificate(
        certificateData
      );
      console.log("创建证书响应:", response);
      setResult(response);
      message.success("创建证书成功");
    } catch (error) {
      console.error("创建证书错误:", error);
      setResult({ error: error });
      message.error("创建证书失败");
    } finally {
      setLoading(false);
    }
  };

  const testUpdateCertificate = async () => {
    setLoading(true);
    try {
      const updateData = {
        issuing_authority:
          "前端更新测试机构 " + new Date().toLocaleTimeString(),
      };

      console.log("更新证书数据:", updateData);
      const response = await certificateService.updateCertificate(
        12,
        updateData
      );
      console.log("更新证书响应:", response);
      setResult(response);
      message.success("更新证书成功");
    } catch (error) {
      console.error("更新证书错误:", error);
      setResult({ error: error });
      message.error("更新证书失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>证书API测试</Title>

      <Card title="认证设置" style={{ marginBottom: "20px" }}>
        <Button onClick={setTestAuth}>设置测试认证</Button>
        <Text style={{ marginLeft: "10px" }}>
          当前Token: {localStorage.getItem("token") ? "已设置" : "未设置"}
        </Text>
      </Card>

      <Card title="API测试" style={{ marginBottom: "20px" }}>
        <Space>
          <Button
            onClick={testGetCertificates}
            loading={loading}
            type="primary"
          >
            获取证书列表
          </Button>
          <Button onClick={testCreateCertificate} loading={loading}>
            创建证书
          </Button>
          <Button onClick={testUpdateCertificate} loading={loading}>
            更新证书ID 12
          </Button>
        </Space>
      </Card>

      <Card title="测试结果">
        <pre
          style={{
            background: "#f5f5f5",
            padding: "10px",
            borderRadius: "4px",
          }}
        >
          {result ? JSON.stringify(result, null, 2) : "暂无结果"}
        </pre>
      </Card>
    </div>
  );
};

export default CertificateTest;
