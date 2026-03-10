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
}
