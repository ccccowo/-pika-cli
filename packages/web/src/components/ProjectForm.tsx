import React from 'react';
import { Form, Input, Select, Radio, Switch, Button, message } from 'antd';
import type { ProjectOptions } from '../types';
import { createProject } from '../services/project';

interface ProjectFormProps {
  onSuccess?: (result: { repoUrl?: string; localPath?: string }) => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values: ProjectOptions) => {
    setLoading(true);
    try {
      const result = await createProject(values);
      if (result.success) {
        message.success('项目创建成功！');
        onSuccess?.({
          repoUrl: result.repoUrl,
          localPath: result.localPath
        });
      } else {
        message.error(result.error || '创建失败');
      }
    } catch (error) {
      message.error('创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        template: 'react',
        createType: 'both',
        isPrivate: false
      }}
    >
      <Form.Item
        label="项目名称"
        name="name"
        rules={[{ required: true, message: '请输入项目名称' }]}
      >
        <Input placeholder="请输入项目名称" />
      </Form.Item>

      <Form.Item
        label="项目模板"
        name="template"
        rules={[{ required: true, message: '请选择项目模板' }]}
      >
        <Select>
          <Select.Option value="react">React 项目</Select.Option>
          <Select.Option value="vue">Vue 项目</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="创建类型"
        name="createType"
        rules={[{ required: true, message: '请选择创建类型' }]}
      >
        <Radio.Group>
          <Radio.Button value="local">仅本地项目</Radio.Button>
          <Radio.Button value="github">仅 GitHub 仓库</Radio.Button>
          <Radio.Button value="both">本地 + GitHub</Radio.Button>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) => prev.createType !== curr.createType}
      >
        {({ getFieldValue }) => {
          const createType = getFieldValue('createType');
          const showGithubOptions = createType === 'github' || createType === 'both';

          return showGithubOptions ? (
            <>
              <Form.Item label="仓库描述" name="description">
                <Input.TextArea placeholder="请输入仓库描述" />
              </Form.Item>

              <Form.Item label="私有仓库" name="isPrivate" valuePropName="checked">
                <Switch />
              </Form.Item>
            </>
          ) : null;
        }}
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          创建项目
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProjectForm; 