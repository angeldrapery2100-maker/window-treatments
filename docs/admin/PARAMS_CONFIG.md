# 计算参数配置功能 - 使用指南

## ✅ 已完成功能

### 根据产品系列显示不同参数

**Drapery (窗帘) 参数：**
- 面料幅宽 (Fabric Width) - 默认 55 英寸
- 宽度倍率 (Width Multiplier) - 默认 3，用于计算 Panel Count
- 高度余量 (Height Allowance) - 默认 16 英寸
- 最大高度 (Max Height) - 默认 240 英寸
- **高度倍率参数：**
  - 触发高度 (Height Trigger) - 默认 120 英寸
  - 基础倍率 (Base Multiplier) - 默认 1.5
  - 每12英寸增量 - 默认 0.1

**Sheer (纱帘) 参数：**
- 纱帘幅宽 (Sheer Fabric Width) - 默认 110 英寸
- Labor 基础价格 - 默认 $30
- Fabric 计算公式 - width * 2.5 / fabric_width

**Shade (卷帘) 参数：**
- 高度调整值 (Height Adjustment) - 添加到用户输入高度
- 五金件单价 (Hardware Unit Price) - 美元

**Hardware (窗帘杆) 参数：**
- 基础长度 (Base Length) - 默认 48 英寸
- 长度单位 (Length Unit) - 英寸/英尺

---

## 🎯 使用方法

### 配置产品参数

1. 进入产品编辑页面
2. 点击「计算参数」标签页
3. 根据产品系列，填写相应的参数
4. 点击「保存参数」按钮

### Drapery 参数详解

#### 基础参数
- **面料幅宽**：用于计算需要多少幅面料
- **宽度倍率**：用于 Panel Count 计算公式
  ```
  Panel Count (raw) = width × width_multiplier / fabric_width
  ```
- **高度余量**：加工时需要的额外高度
  ```
  Fabric Yards = panel_count × (height + height_allowance) / 36
  ```

#### 高度倍率（Labor Multiplier）
当窗帘高度超过触发高度时，加工难度增加，需要应用倍率：

```
如果 height < 120" → multiplier = 1.0
如果 height ≥ 120" → multiplier = 1.5 + ⌈(height - 120) / 12⌉ × 0.1
```

**示例：**
- 高度 100" → 倍率 1.0
- 高度 120" → 倍率 1.5
- 高度 130" → 倍率 1.6 (1.5 + 1 × 0.1)
- 高度 145" → 倍率 1.7 (1.5 + 2 × 0.1)

---

## 📋 参数用途

### 前台计算
这些参数会被前台产品页面使用，用于：
1. 计算面料用量
2. 计算 Panel 数量
3. 计算加工费用
4. 计算最终价格

### 后台管理
- 可以根据供应商价格变化调整参数
- 可以根据加工工艺调整倍率
- 所有参数都有默认值，确保系统可用

---

## ⚠️ 注意事项

1. **参数影响价格计算**
   - 修改参数会直接影响前台价格
   - 建议谨慎修改，并在测试环境验证

2. **默认值**
   - 所有参数都有合理的默认值
   - 如果不确定，使用默认值

3. **保存时机**
   - 修改后必须点击「保存参数」
   - 保存成功后会在前台生效

4. **产品系列特定**
   - 每个产品系列的参数不同
   - 切换产品系列后，参数配置也会改变

---

## 🔧 技术实现

### 组件位置
```
/apps/web/src/app/admin/products/edit/[id]/components/ParamsConfig.tsx
```

### API 接口
```
GET  /api/admin/products/:id/params - 获取参数
PUT  /api/admin/products/:id/params - 保存参数
```

### 数据结构
```typescript
interface ProductParams {
  // Drapery
  fabric_width?: number
  width_multiplier?: number
  height_allowance?: number
  max_height?: number
  height_trigger?: number
  base_multiplier?: number
  increment_per_12?: number
  
  // Sheer
  sheer_fabric_width?: number
  sheer_labor_base?: number
  sheer_fabric_formula?: string
  
  // Shade
  height_adjustment?: number
  hardware_unit_price?: number
  
  // Hardware
  base_length?: number
  length_unit?: string
}
```

---

## 🚧 待实现功能

### 优先级 1：数据库集成
- [ ] 将参数保存到真实数据库
- [ ] 从数据库加载参数
- [ ] 参数历史记录

### 优先级 2：参数验证
- [ ] 数值范围验证
- [ ] 必填字段验证
- [ ] 逻辑关系验证

### 优先级 3：高级功能
- [ ] 参数模板
- [ ] 批量修改
- [ ] 参数导入/导出

---

## 📝 开发日志

**2026-02-22**
- ✅ 创建 ParamsConfig 组件
- ✅ 实现 4 个产品系列的参数表单
- ✅ 集成到产品编辑页面
- ✅ 创建参数保存 API
- ✅ 参数说明和计算公式展示

---

## 🔗 相关文档

- [产品编辑页面](/docs/admin/PRODUCT_EDIT_PAGE.md)
- [图片管理功能](/docs/admin/IMAGE_MANAGER.md)
- [API 设计](/docs/admin/API_ROUTES.md)
