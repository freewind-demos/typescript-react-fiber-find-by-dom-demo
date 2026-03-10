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

  /**
   * 通过 DOM 元素查找对应的 React 组件
   *
   * 核心原理：
   * 1. 用户点击页面元素时，我们获取被点击的 DOM 元素
   * 2. 使用 findFiberByDomElement 从 DOM 元素获取其关联的 Fiber 节点
   * 3. 但此时找到的可能是 DOM 元素对应的内部 Fiber（如 div, span），不是组件
   * 4. 因此需要沿着 Fiber 树的 return 指针向上查找，直到找到有 type 属性的组件 Fiber
   *
   * 为什么要向上查找？
   * React 的 Fiber 树结构：组件Fiber -> DOM Fiber -> 子元素Fiber
   * 例如：Counter 组件 -> div.card -> h2 -> button
   * 我们点击 button 时，先找到 button 的 Fiber，需要向上找到 Counter 组件
   */
  const handleFindByDom = () => {
    setStatus('请在左侧目标应用中点击一个元素...');

    // 创建点击事件处理函数
    const clickHandler = (e: MouseEvent) => {
      // 阻止默认行为和事件冒泡，避免影响目标应用
      e.preventDefault();
      e.stopPropagation();

      // 从被点击的 DOM 元素获取对应的 Fiber
      // 注意：这里找到的可能是 DOM 元素（如 button, div）的 Fiber，不一定是组件
      const fiber = findFiberByDomElement(e.target as Element);

      if (fiber) {
        // 向上遍历 Fiber 树，寻找组件类型的 Fiber
        // 组件的 Fiber 有 type 属性（指向组件函数/类）
        // DOM 元素的 Fiber 的 type 是字符串（如 'button', 'div'）
        let current: Fiber | undefined = fiber;
        while (current && !current.type) {
          // 沿着 return 指针（指向父节点）向上查找
          current = current.return;
        }

        // 找到有 type 属性的 Fiber
        if (current && current.type) {
          // 获取组件名称
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

      // 移除事件监听器，避免内存泄漏
      document.removeEventListener('click', clickHandler, true);
    };

    // 延迟添加事件监听器，确保 UI 渲染完成
    setTimeout(() => {
      // 使用捕获阶段（true）确保能捕获到点击事件
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
