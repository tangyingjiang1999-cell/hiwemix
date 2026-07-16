# 产地管理功能 - 测试和设置指南

## 🎯 快速开始

### 第 1 步：检查数据库是否正常

✅ **已验证**：regions 公开 API 正常工作
- `GET /api/regions` 返回 `[]`（空列表，需要新增产地）

### 第 2 步：新增默认产地（可选）

由于迁移脚本可能没有自动插入默认产地，你可以通过以下方式新增：

**方法 1：通过管理员后台（推荐）**
1. 登录管理员账号
2. 访问 http://localhost:3000/admin/data
3. 点击"品牌管理"标签
4. 点击右上角的 "+ 新增产地" 按钮
5. 依次新增以下产地：
   - JPN（日本）
   - EUR（欧洲）
   - USA（美国）
   - CHN（中国）
   - KOR（韩国）
   - SEA（东南亚）- 如果需要的话

**方法 2：通过 Supabase Dashboard**
1. 登录 Supabase Dashboard
2. 进入 Table Editor → regions
3. 手动插入记录：
   ```sql
   INSERT INTO public.regions (code) VALUES
     ('JPN'), ('EUR'), ('USA'), ('CHN'), ('KOR');
   ```

---

## 🧪 测试清单

### 测试 1：管理员后台 - 产地管理

- [ ] 登录管理员账号
- [ ] 访问 http://localhost:3000/admin/data
- [ ] 点击"品牌管理"标签
- [ ] 验证看到 "+ 新增产地" 和 "+ 新增品牌" 按钮
- [ ] 点击"+ 新增产地"
- [ ] 输入"SEA"（或其他新的产地代码）
- [ ] 点击保存
- [ ] 验证新产地出现在底部的"已有产地"区域
- [ ] 验证新产地出现在新增品牌对话框的"产地"下拉框中

### 测试 2：管理员后台 - 品牌管理

- [ ] 点击"+ 新增品牌"
- [ ] 验证产地下拉框显示所有已新增的产地
- [ ] 选择一个产地（如 JPN）
- [ ] 填写品牌名称（如 Toyota）
- [ ] 点击保存
- [ ] 验证品牌成功创建，产地列显示 JPN

### 测试 3：搜索面板 - 产地筛选

- [ ] 访问首页 http://localhost:3000
- [ ] 验证搜索面板中显示"产地"选择框（第一行第一列）
- [ ] 选择一个产地（如 JPN）
- [ ] 点击"搜索"
- [ ] 验证结果只显示该产地的品牌的颜色
- [ ] 清空产地（选择"全部产地"）
- [ ] 再次搜索，验证所有颜色都显示

### 测试 4：组合筛选

- [ ] 选择产地（JPN）
- [ ] 选择品牌（Toyota）
- [ ] 输入颜色代码（如 040）
- [ ] 点击"搜索"
- [ ] 验证结果只显示 Toyota 的代码包含"040"的颜色

### 测试 5：重置功能

- [ ] 设置多个筛选条件（产地、品牌、颜色代码等）
- [ ] 点击"重置"按钮
- [ ] 验证所有筛选条件都被清除
- [ ] 验证产地下拉框显示"全部产地"

### 测试 6：删除产地

- [ ] 在管理员后台 → 品牌管理 → 底部的"已有产地"区域
- [ ] 找到一个没有关联品牌的产地
- [ ] 点击该产地旁边的红色删除按钮
- [ ] 确认删除
- [ ] 验证产地被成功删除
- [ ] 尝试删除一个有品牌关联的产地
- [ ] 验证系统提示错误信息

---

## 🔧 常见问题

### 问题 1：搜索面板中不显示产地下拉框

**可能原因**：
- API 调用失败
- regions 表中没有数据

**解决方法**：
1. 打开浏览器控制台（F12）
2. 查看是否有错误信息
3. 确保 regions 表中有数据（通过管理员后台新增产地）

### 问题 2：新增产地时提示"产地代码已存在"

**原因**：
- 该产地代码已经在数据库中存在

**解决方法**：
- 检查"已有产地"区域，确认该代码是否已存在
- 如果需要修改，可以删除后重新创建

### 问题 3：删除产地时提示"该产地下还有关联的品牌，无法删除"

**原因**：
- 该产地下有品牌在使用

**解决方法**：
1. 先删除或修改使用该产地的所有品牌
2. 然后再删除产地

### 问题 4：搜索时产地筛选不起作用

**可能原因**：
- 没有正确选择产地
- brands 表中没有该产地的品牌
- 前端状态更新问题

**解决方法**：
1. 确保在产地下拉框中选择了一个产地（不是"全部产地"）
2. 点击"搜索"按钮
3. 检查品牌管理页面，确认是否有该产地的品牌
4. 清空浏览器缓存，重新加载页面

---

## 📊 验证数据库

### 验证 regions 表已创建

在 Supabase Dashboard → SQL Editor 中执行：
```sql
SELECT * FROM public.regions;
```

应该看到已插入的产地列表。

### 验证 brands 表的外键

```sql
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM
  information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE
  tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'brands';
```

应该看到一个外键关联到 regions 表。

### 验证品牌数据

```sql
SELECT b.id, b.name, b.region
FROM public.brands b
LIMIT 10;
```

应该看到品牌列表，每个品牌都有对应的 region 值。

---

## 🚀 完成测试后

如果所有测试都通过，恭喜！🎉 产地管理功能已完全正常工作。

**下一步可以做的优化**：
1. 新增更多产地代码
2. 按产地统计品牌数量
3. 在前端显示产地全称（中文/英文）
4. 在产地选择器中分组显示（如亚洲、欧洲、北美）

如有任何问题，请查看浏览器控制台或 Supabase Dashboard 的日志。

---

**版本**：v1.0
**最后更新**：2026-07-16
