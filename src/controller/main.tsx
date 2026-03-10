import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Button, Typography, message } from 'antd';
import { findFiberByDomElement, getFiberInfo, getComponentName } from '../shared/fiber-utils';
import type { Fiber } from '../shared/fiber-utils';

const { Title, Text } = Typography;

function ControllerApp() {
  const [foundName, setFoundName] = useState('');
  const [fiberInfo, setFiberInfo] = useState('');
  const [status, setStatus] = useState('点击下方按钮，然后在左侧点击任意元素');

  const handleFindByDom = () => {
    setStatus('请在左侧目标应用中点击一个元素...');

    const clickHandler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const fiber = findFiberByDomElement(e.target as Element);

      if (fiber) {
        // 向上查找直到找到组件类型的 fiber
        let current: Fiber | undefined = fiber;
        while (current && !current.type) {
          current = current.return;
        }

        if (current && current.type) {
          const name = getComponentName(current.type);
          setFoundName(name || 'unknown');
          setFiberInfo(JSON.stringify(getFiberInfo(current), null, 2));
          message.success(`找到组件: ${name}`);
          setStatus(`已找到: ${name}`);
        } else {
          message.error('找到 DOM fiber 但未找到组件');
          setStatus('未找到组件');
        }
      } else {
        message.error('未找到 fiber');
        setStatus('未找到 fiber');
      }

      document.removeEventListener('click', clickHandler, true);
    };

    setTimeout(() => {
      document.addEventListener('click', clickHandler, true);
    }, 100);
  };

  return (
    <div>
      <Title level={2}>控制面板</Title>
      <Text type="secondary">点击页面元素来查找对应的 React 组件</Text>

      <Card title="操作说明" style={{ marginTop: 16 }}>
        <Text>{status}</Text>
        <div style={{ marginTop: 16 }}>
          <Button type="primary" onClick={handleFindByDom}>
            开始点击选择
          </Button>
        </div>
      </Card>

      {foundName && (
        <Card title="组件信息" style={{ marginTop: 16 }}>
          <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 12, borderRadius: 4, fontSize: 12 }}>
            {fiberInfo}
          </pre>
        </Card>
      )}
    </div>
  );
}

const controllerRootElement = document.getElementById('controller-root');
if (controllerRootElement) {
  const root = createRoot(controllerRootElement);
  root.render(<ControllerApp />);
}
