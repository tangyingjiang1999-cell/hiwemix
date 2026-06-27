<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know
# AGENTS.md

## Project
汽车修补漆配方检索网站（Formula Search），对标 kapcimix.com/FormulaSearch。
技术栈：Next.js 14 App Router + TypeScript + Tailwind CSS。

## 产品定位
帮助汽修喷漆师，通过输入车辆品牌/年份/颜色代码，快速找到对应的调漆配方（各色母克重比例）。
当前阶段：纯前端框架，所有数据使用 Mock Data，不接真实后端。

## 目录结构约定
- src/app/           页面路由
- src/components/    可复用组件
- src/lib/           工具函数、类型定义、Mock 数据
- src/types/         TypeScript 类型

## 代码规范
- 组件用 function 关键字，不用箭头函数
- 所有 interface 放 src/types/index.ts
- Mock 数据放 src/lib/mock-data.ts
- Tailwind 类名不要超过一行，超过时抽成 cn() 变量
- 中文注释说明业务逻辑

## Done when
- 页面在 localhost:3000 无报错渲染
- 所有交互用 Mock Data 正常响应
- TypeScript 无类型错误
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
