// Site-setting group definitions.
// Exported from a plain lib file so route handlers can import without
// triggering Next.js's "only valid Route export fields" lint error.

export const SETTING_GROUPS: Record<string, {
  label: string
  description: string
  settings: Record<string, { label: string; description: string; type: 'boolean' | 'string' | 'number'; defaultValue: string }>
}> = {
  store: {
    label: '在线商店',
    description: '控制在线商店的显示与功能',
    settings: {
      online_store_enabled: {
        label: '开启在线商店',
        description: '开启后访客可以浏览产品并下单',
        type: 'boolean',
        defaultValue: 'false',
      },
    },
  },
  contact: {
    label: '联系方式',
    description: '网站联系信息配置',
    settings: {
      contact_email: {
        label: '联系邮箱',
        description: '显示在网站联系页面的邮箱地址',
        type: 'string',
        defaultValue: '',
      },
      contact_phone: {
        label: '联系电话',
        description: '客服电话号码',
        type: 'string',
        defaultValue: '',
      },
    },
  },
  seo: {
    label: 'SEO 设置',
    description: '搜索引擎优化相关配置',
    settings: {
      site_title: {
        label: '网站标题',
        description: '浏览器标签页和搜索结果中显示的标题',
        type: 'string',
        defaultValue: 'Angel Drapery',
      },
      meta_description: {
        label: 'Meta 描述',
        description: '搜索引擎摘要描述，建议 120-160 字符',
        type: 'string',
        defaultValue: '',
      },
    },
  },
  // Global drapery pricing (公用系统) — shared by ALL drapery products with
  // the AAPP engine. Merged UNDER any product-level params.aapp_config
  // (product-level wins). Defaults = AAPP factory values
  // (packages/shared/src/pricing/aapp/constants.ts DRAPERY_DEFAULTS); must
  // stay in sync with AAPP's library.draperyPricingCatalog when prices change.
  drapery_pricing: {
    label: '布帘全局定价',
    description: '所有 drapery 商品共用的衬布/手工/镶边价格（与 AAPP 内部软件对应，两边改价需同步）',
    settings: {
      lining_no_price_per_yard: {
        label: '无衬 衬布价 ($/yd)',
        description: 'NO 档衬布每码价格',
        type: 'number',
        defaultValue: '0',
      },
      lining_no_labor_per_panel: {
        label: '无衬 手工费 ($/幅)',
        description: 'NO 档每幅手工费',
        type: 'number',
        defaultValue: '30',
      },
      lining_lf_price_per_yard: {
        label: '遮光衬 衬布价 ($/yd)',
        description: 'LF 档衬布每码价格',
        type: 'number',
        defaultValue: '6',
      },
      lining_lf_labor_per_panel: {
        label: '遮光衬 手工费 ($/幅)',
        description: 'LF 档每幅手工费',
        type: 'number',
        defaultValue: '36',
      },
      lining_bo_price_per_yard: {
        label: '全遮光衬 衬布价 ($/yd)',
        description: 'BO 档衬布每码价格',
        type: 'number',
        defaultValue: '8',
      },
      lining_bo_labor_per_panel: {
        label: '全遮光衬 手工费 ($/幅)',
        description: 'BO 档每幅手工费',
        type: 'number',
        defaultValue: '38',
      },
      sheer_labor_per_panel: {
        label: '纱层手工费 ($/幅)',
        description: '纱层每幅手工费',
        type: 'number',
        defaultValue: '26',
      },
      banding_std_price_per_yard: {
        label: '标准镶边 ($/yd)',
        description: 'banding_std 每码价格',
        type: 'number',
        defaultValue: '15',
      },
      banding_prem_price_per_yard: {
        label: '高级镶边 ($/yd)',
        description: 'banding_prem 每码价格',
        type: 'number',
        defaultValue: '25',
      },
      banding_labor_per_foot: {
        label: '镶边手工费 ($/ft)',
        description: '镶边每英尺手工费',
        type: 'number',
        defaultValue: '10',
      },
      // 手工费倍数因子（只乘手工费，不乘面料/衬布 — 与 AAPP 报价 v782 及
      // 工厂制作单 buildLabor 同一公式；对应 AAPP
      // library.draperyPricingCatalog.main.heightSurcharge / largePanelSurcharge）
      height_surcharge_start_height_in: {
        label: '超高加价 起算高度 (in)',
        description: '成品高 ≤ 此值不加价；超过后手工费乘超高倍数',
        type: 'number',
        defaultValue: '120',
      },
      height_surcharge_base_multiplier: {
        label: '超高加价 基础倍数',
        description: '成品高超过起算高度时的基础手工费倍数',
        type: 'number',
        defaultValue: '1.5',
      },
      height_surcharge_increment_per_12in: {
        label: '超高加价 每+12" 增量',
        description: '超出起算高度的部分，每 12 英寸在基础倍数上再加的增量',
        type: 'number',
        defaultValue: '0.1',
      },
      large_panel_threshold_panels: {
        label: '大幅数加价 起算幅数 (单侧)',
        description: '单侧手工计费幅数达到此值时手工费乘大幅数倍数',
        type: 'number',
        defaultValue: '5',
      },
      large_panel_multiplier: {
        label: '大幅数加价 倍数',
        description: '单侧幅数达到起算幅数时的手工费倍数',
        type: 'number',
        defaultValue: '1.5',
      },
    },
  },
}
