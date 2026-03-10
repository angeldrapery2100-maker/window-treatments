# Hunter Douglas 产品页面布局描述规范

## 概述

本规范定义了如何从 PDF 产品手册中提取结构化布局数据，使 Claude 能够根据描述还原出完整的产品详情页面。

每个产品文件夹中的 `layout-description.json` 包含两层信息：
1. **pages** — PDF 逐页布局（每个元素的位置、尺寸、内容）
2. **webPageMapping** — PDF 页面如何映射为网页板块（可直接用于生成 layout.ts）

## 目录结构

```
public/hunter-douglas/
├── {slug}/
│   ├── layout-description.json    ← 本规范定义的布局描述文件
│   ├── page002_img01_2105x1505.jpeg
│   └── ...
```

---

## 一、JSON 总体结构

```json
{
  "product": { "slug", "name", "description", "brand" },
  "pdf": { "totalPages", "pageSize", "unit" },
  "pages": [ { "pageNumber", "role", "title", "description", "layout", "elements" } ],
  "webPageMapping": { "hero", "scenePairs", "sections", "gallery", "cellSize", "hardwareColors", "swatchCollections" }
}
```

---

## 二、页面角色 (role) 枚举

| role | 说明 | 网页板块 |
|------|------|---------|
| `cover` | PDF 封面 | 列表页缩略图 |
| `hero` | 产品主图 | Hero 全宽大图 |
| `scene` | 生活场景图 | scene-pair 交替布局 |
| `benefits` | 功能优势卡片 | card-grid |
| `comparison` | 对比展示 | comparison-grid |
| `control-systems` | 操控系统 | control-systems |
| `design-options` | 设计选项 | card-grid |
| `mounting` | 安装方式 | mounting-grid |
| `details` | 附加细节 | comparison-grid |
| `cell-size` | 尺寸结构 | cell-size |
| `hardware-colors` | 硬件配色 | hardware-colors |
| `swatch` | 面料色卡 | SwatchCollection |
| `gallery-extra` | 补充场景图 | gallery |
| `powerview-schedule` | PowerView日程 | comparison-grid |
| `skip` | 无用页 | 不使用 |

---

## 三、元素类型 (type) 枚举

| type | 说明 |
|------|------|
| `image` | 图片 (含 filename, imageSize, position, bounds, role) |
| `heading` | 标题文字 |
| `body-text` | 正文描述 |
| `label` | 面料标注 (含 placement) |
| `caption` | 图片说明 |

---

## 四、图片自动分类规则

| 尺寸模式 | 分类 | 用途 |
|---------|------|------|
| W>2500, 宽高比~2:1 | `scene-wide` | 场景大图 / Hero |
| W~750, H~450 | `card-thumb` | 卡片缩略图 |
| W~306, H~306 | `color-chip` | 硬件色块 |
| W~475, H~825 (竖) | `swatch-card` | 面料色卡 |
| W~631, H~1091 (竖) | `swatch-card-large` | 大面料色卡 |
| W~320, H~900 | `system-diagram` | 操控系统图 |
| W~480, H~830 | `product-shot` | 产品实物图 |
| W>2800, H>2400 | `detail-spread` | 结构细节大图 |

---

## 五、网页渲染规则（从5个满意页面总结）

### Hero
- 全宽不裁切，渐变蒙层 from-black/50 via-transparent to-black/20
- 左上品牌名，右上导航，左下面包屑+产品名+描述，右下面料标注

### Scene Pairs
- 奇数行 [图3:文1]，偶数行反转
- 图片叠加面料标注

### Card Grid
- 3xl font-light 标题，3~4列，图+粗体标题+描述

### Comparison Grid
- 2~4列，图+标签+副标签

### Control Systems
- PowerView：产品图+功能列表两列
- Operating Systems：横排图+标题+描述

### Swatch Collections
- 可折叠，按面料分组，badge显示数量

### 背景色
- sections 交替 bg-white / bg-[#fafaf8]
- 可折叠区 bg-[#f5f4f0]

---

完整示例见 `applause/layout-description.json`
