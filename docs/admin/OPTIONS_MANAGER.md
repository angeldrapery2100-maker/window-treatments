# 选项动态管理功能 - 使用指南

## ✅ 已完成功能

### 核心功能
- ✅ 根据产品系列自动显示对应选项
- ✅ 动态添加/编辑/删除选项值
- ✅ 为每个选项值配置价格参数
- ✅ 选项值排序（上移/下移）
- ✅ 实时保存到后端

---

## 🎯 各产品系列的选项配置

### Drapery (窗帘)
| 选项 | 参数 |
|------|------|
| **Pleat Style** | 无参数 |
| **Fabric Color** | • fabric_price (面料单价 $/yard) |
| **Lining** | • lining_price (里衬单价 $/yard)<br>• labor_price (加工价 $/panel) |
| **Operation** | • stack_divisor (堆叠除数) |

### Sheer (纱帘)
| 选项 | 参数 |
|------|------|
| **Pleat Style** | 无参数 |
| **Fabric Color** | • fabric_price (面料单价 $/yard) |
| **Operation** | 无参数 |

### Shade (卷帘)
| 选项 | 参数 |
|------|------|
| **Mounting** | 无参数 |
| **Fabric Code** | • fabric_price (面料单价 $/sq ft) |
| **Operation** | • controller_price (控制器价格 $) |
| **Control Side** | 无参数 |

### Hardware (窗帘杆)
| 选项 | 参数 |
|------|------|
| **Rod** | • fixed_price (固定价格 $)<br>• price_per_inch (长度单价 $/inch) |
| **Finial** | • finial_price (端头价格 $)<br>• finial_length (端头长度 inch) |
| **Color** | • color_price (颜色附加价 $) |

---

## 📋 使用方法

### 添加选项值

1. 点击「选项配置」标签页
2. 找到要配置的选项（如 Pleat Style）
3. 点击「+ 添加选项值」按钮
4. 填写：
   - **Value**: 代码值（如 `2-fold`）
   - **Label**: 显示名称（如 `2 Fold Pinch Pleated`）
5. 点击「添加」

### 配置价格参数

添加选项值后，系统会自动显示该选项需要的价格参数：

**示例 - Fabric Color：**
```
Value: natural
Label: Natural
价格参数:
  └─ 面料单价: $20
```

**示例 - Lining：**
```
Value: BO
Label: Blackout Lining
价格参数:
  ├─ 里衬单价: $8
  └─ 加工价: $38
```

### 编辑选项值

直接在输入框中修改：
- Value 和 Label 可以直接编辑
- 价格参数可以直接输入新值
- 修改后点击「保存所有选项」

### 调整顺序

使用 ↑↓ 按钮调整选项值的显示顺序：
- 顺序会影响前台下拉菜单的显示
- 第一个选项值通常作为默认值

### 删除选项值

点击「删除」按钮，确认后删除。

---

## 💡 重要概念

### Value vs Label

- **Value (代码值)**：
  - 用于系统内部识别
  - 参与图片命名（如 `{pleat_style}-{fabric_color}.jpg`）
  - 例：`2-fold`, `natural`, `BO`
  
- **Label (显示名称)**：
  - 用户在前台看到的文字
  - 例：`2 Fold Pinch Pleated`, `Natural`, `Blackout Lining`

### 图片命名匹配

以 Drapery 为例，图片命名规则：
```
{pleat_style_label}-{fabric_color_label}.jpg
```

如果配置了：
- Pleat Style: value=`2-fold`, label=`2 Fold Pinch Pleated`
- Fabric Color: value=`natural`, label=`Natural`

则匹配的图片名为：
```
2 Fold Pinch Pleated-Natural.jpg
```

---

## 📐 价格参数详解

### Drapery - Fabric Color

**fabric_price** - 每码面料的单价

用于计算：
```
Fabric Cost = fabric_yards × fabric_price
```

### Drapery - Lining

**lining_price** - 每码里衬的单价
**labor_price** - 每个 panel 的加工费

用于计算：
```
Fabric Cost = fabric_yards × (fabric_price + lining_price)
Labor Cost = panel_count × labor_price × labor_multiplier
```

### Drapery - Operation

**stack_divisor** - 堆叠除数

用于计算堆叠倍率：
```
split (Center Open) → stack_divisor = 2
one_way_left/right → stack_divisor = 1

panels_per_section = panel_count / stack_divisor
stacking_multiplier = panels_per_section > 5 ? 1.5 : 1.0
```

### Hardware - Rod

**fixed_price** - 固定价格（基础套件）
**price_per_inch** - 每英寸长度的价格

用于计算：
```
Rod Cost = fixed_price + (length × price_per_inch)
```

### Hardware - Finial

**finial_price** - 端头单价
**finial_length** - 端头长度（占用杆的长度）

用于计算：
```
Actual Rod Length = requested_length - (2 × finial_length)
Finial Cost = 2 × finial_price
```

---

## ⚠️ 注意事项

1. **必填字段**
   - Value 和 Label 都是必填的
   - 价格参数可以为 0，但不能为空

2. **Value 命名规范**
   - 建议使用小写字母和连字符
   - 避免空格和特殊字符
   - 保持简洁（如 `2-fold` 而非 `2_fold_pinch_pleated`）

3. **价格单位**
   - Drapery/Sheer: $/yard
   - Shade: $/sq ft
   - Hardware: $/piece 或 $/inch

4. **保存时机**
   - 添加/修改后必须点击「保存所有选项」
   - 保存成功后才会在前台生效

5. **图片命名**
   - 图片文件名必须与选项 Label 完全匹配
   - 大小写敏感
   - 包括空格和连字符

---

## 🔧 技术实现

### 组件位置
```
/apps/web/src/app/admin/products/edit/[id]/components/OptionsManager.tsx
```

### API 接口
```
GET  /api/admin/products/:id/options - 获取选项
PUT  /api/admin/products/:id/options - 保存选项
```

### 数据结构
```typescript
interface OptionValue {
  id: string
  value: string              // 代码值
  label: string              // 显示名称
  params: Record<string, any> // 价格参数
  sort_order: number         // 排序
}

interface ProductOption {
  id: string
  name: string              // 选项名称 (pleat_style, fabric_color, etc.)
  type: string              // 类型 (select)
  display_label: string     // 显示标签
  values: OptionValue[]     // 选项值列表
}
```

---

## 🎯 完整示例

### Drapery 产品配置示例

**Pleat Style：**
```json
{
  "values": [
    { "value": "2-fold", "label": "2 Fold Pinch Pleated", "params": {} },
    { "value": "3-fold", "label": "3 Fold Pinch Pleated", "params": {} },
    { "value": "euro", "label": "Euro Pleated", "params": {} }
  ]
}
```

**Fabric Color：**
```json
{
  "values": [
    { "value": "natural", "label": "Natural", "params": { "fabric_price": 20 } },
    { "value": "ivory", "label": "Ivory", "params": { "fabric_price": 22 } },
    { "value": "gray", "label": "Gray", "params": { "fabric_price": 25 } }
  ]
}
```

**Lining：**
```json
{
  "values": [
    { 
      "value": "NO", 
      "label": "No Lining", 
      "params": { "lining_price": 0, "labor_price": 30 } 
    },
    { 
      "value": "LF", 
      "label": "Light Filtering Lining", 
      "params": { "lining_price": 6, "labor_price": 36 } 
    },
    { 
      "value": "BO", 
      "label": "Blackout Lining", 
      "params": { "lining_price": 8, "labor_price": 38 } 
    }
  ]
}
```

**Operation：**
```json
{
  "values": [
    { 
      "value": "split", 
      "label": "Center Open (Split)", 
      "params": { "stack_divisor": 2 } 
    },
    { 
      "value": "one_way_left", 
      "label": "One Way Left", 
      "params": { "stack_divisor": 1 } 
    },
    { 
      "value": "one_way_right", 
      "label": "One Way Right", 
      "params": { "stack_divisor": 1 } 
    }
  ]
}
```

---

## 🚧 待实现功能

### 优先级 1：数据库集成
- [ ] 将选项保存到真实数据库
- [ ] 关联到产品表

### 优先级 2：高级功能
- [ ] 批量导入选项
- [ ] 选项模板
- [ ] 选项复制（从其他产品）

### 优先级 3：验证
- [ ] 重复 value 检测
- [ ] 必填参数验证
- [ ] 价格范围验证

---

## 📝 开发日志

**2026-02-22**
- ✅ 创建 OptionsManager 组件
- ✅ 实现 4 个产品系列的选项配置
- ✅ 动态参数表单生成
- ✅ 选项值排序功能
- ✅ 集成到产品编辑页面
- ✅ 创建选项保存 API

---

## 🔗 相关文档

- [计算参数配置](/docs/admin/PARAMS_CONFIG.md)
- [图片管理功能](/docs/admin/IMAGE_MANAGER.md)
- [产品编辑页面](/docs/admin/PRODUCT_EDIT_PAGE.md)
