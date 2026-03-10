# React Fiber DOM 元素查找 Demo

## 概述

本 Demo 展示如何通过**点击页面元素**来找到对应的 React 组件。

## 场景

- **左侧**：目标应用
- **右侧**：控制面板

## 核心原理

每个 DOM 元素都关联着其对应的 Fiber 节点。通过以下方式获取：

```typescript
function findFiberByDomElement(domElement: Element): Fiber | null {
  // React 17: __reactFiber${random}
  const key = Object.keys(domElement).find(k => k.startsWith('__reactFiber'));
  if (key) return domElement[key];

  // React 18+: __reactContainer${random}
  // ...
}
```

## 运行

```bash
pnpm install
pnpm start
```

## 功能

1. 点击"开始点击选择"按钮
2. 在左侧目标应用任意位置点击
3. 右侧显示点击到的 React 组件信息
