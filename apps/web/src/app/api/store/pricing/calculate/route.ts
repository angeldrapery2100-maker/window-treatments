import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { UnifiedPricingEngine } from '@window-treatments/shared/pricing/engines'
import { explainDrapery, explainSheer, explainShade } from '@window-treatments/shared/pricing/explainers'

type ProductType = 'drapery' | 'sheer' | 'shade'

// optionKey → selectedValue → { paramName: number }
type OptionValues = Record<string, Record<string, Record<string, number>>>

interface CalcRequestBody {
  productType: ProductType
  input: { width: number; height: number }
  baseParams?: Record<string, number>
  options?: Record<string, string>
  optionValues?: OptionValues
}

// 确保 pricing_configs 表存在，并初始化默认配置
async function ensurePricingConfigs() {
  // 建表
  await query(`
    CREATE TABLE IF NOT EXISTS pricing_configs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_type_id UUID NOT NULL REFERENCES product_types(id),
      version INTEGER NOT NULL,
      formula JSONB NOT NULL DEFAULT '{}',
      variables JSONB NOT NULL DEFAULT '{}',
      is_active BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (product_type_id, version)
    )
  `)

  // 检查是否已有数据
  const count = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM pricing_configs')
  if (parseInt(count?.count || '0') > 0) return

  // 插入 drapery 默认配置
  await query(`
    INSERT INTO pricing_configs (product_type_id, version, formula, variables, is_active)
    SELECT id, 1,
      '{"steps":["panel_count_raw = window_width * fullness_multiplier / fabric_standard_width","fabric_yard_raw = panel_count_raw * (window_height + extra_height_allowance) / 36","fabric_cost_raw = fabric_yard_raw * (fabric_unit_price + lining_price_per_yard)","base_labor_raw = panel_count_raw * labor_per_panel","total_raw = fabric_cost_raw + base_labor_raw"]}'::jsonb,
      '{"fullness_multiplier":3.0,"fabric_standard_width":55,"extra_height_allowance":30}'::jsonb,
      true
    FROM product_types WHERE slug = 'drapery'
    ON CONFLICT DO NOTHING
  `)

  // 插入 sheer 默认配置（engine 内部处理，formula 为空）
  await query(`
    INSERT INTO pricing_configs (product_type_id, version, formula, variables, is_active)
    SELECT id, 1,
      '{"steps":[]}'::jsonb,
      '{"fullness_multiplier":3.5}'::jsonb,
      true
    FROM product_types WHERE slug = 'sheer'
    ON CONFLICT DO NOTHING
  `)

  // 插入 shade 默认配置
  await query(`
    INSERT INTO pricing_configs (product_type_id, version, formula, variables, is_active)
    SELECT id, 1,
      '{"steps":["area_sqm_raw = (window_width * (window_height + 12)) / 1550","window_width_m = (window_width * 2.54) / 100","hardware_cost = window_width_m * hardware_unit_price","control_cost = control_price","total_raw = area_sqm_raw * fabric_unit_price + hardware_cost + control_cost"]}'::jsonb,
      '{}'::jsonb,
      true
    FROM product_types WHERE slug = 'shade'
    ON CONFLICT DO NOTHING
  `)
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as CalcRequestBody
    const { productType, input, baseParams = {}, options = {}, optionValues = {} } = body

    if (!productType || input?.width == null || input?.height == null) {
      return NextResponse.json({ ok: false, error: 'Missing productType or input' }, { status: 400 })
    }

    // 确保表和初始数据存在
    await ensurePricingConfigs()

    // 从数据库读 pricing config
    const pricingConfig = await queryOne<{ formula: any; variables: any }>(
      `SELECT pc.formula, pc.variables
       FROM pricing_configs pc
       JOIN product_types pt ON pt.id = pc.product_type_id
       WHERE pt.slug = $1 AND pc.is_active = true
       LIMIT 1`,
      [productType]
    )

    // 解析 optionValues，注入选项数值参数
    const resolvedOptionValues: Record<string, number> = {}
    for (const [optionKey, selectedValue] of Object.entries(options)) {
      const optionConfig = optionValues[optionKey]
      if (!optionConfig) continue
      const selectedConfig = optionConfig[selectedValue]
      if (selectedConfig) Object.assign(resolvedOptionValues, selectedConfig)
    }

    // 后台选项存的 key 名 → engine 公式需要的 key 名映射
    const KEY_MAP: Record<string, string> = {
      fabric_price:     'fabric_unit_price',     // drapery fabric_color, shade fabric_code
      lining_price:     'lining_price_per_yard', // drapery lining
      labor_price:      'labor_per_panel',        // drapery lining
      controller_price: 'control_price',          // shade operation
      stack_divisor:       'stacking_divisor',    // drapery stacking divisor (e.g. one_way=1, center_open=2)
      // sheer: fabric_color.fabric_price → sheer_unit_price（前台单独处理，因为 key 目标不同）
    }
    const mappedOptionValues: Record<string, number> = {}
    for (const [k, v] of Object.entries(resolvedOptionValues)) {
      const mapped = KEY_MAP[k] ?? k
      mappedOptionValues[mapped] = v
    }

    // optionValues 里的每个 value 也要做 key 映射，保证 engine 注入 scope 时 key 名正确
    const mappedOptionValues2: OptionValues = {}
    for (const [optKey, valMap] of Object.entries(optionValues)) {
      const newValMap: Record<string, Record<string, number>> = {}
      for (const [val, paramObj] of Object.entries(valMap)) {
        const newParams: Record<string, number> = {}
        for (const [k, v] of Object.entries(paramObj)) {
          newParams[KEY_MAP[k] ?? k] = v
        }
        newValMap[val] = newParams
      }
      mappedOptionValues2[optKey] = newValMap
    }

    // 各产品类型的公式变量默认安全居（防止 scope 里没有导致 not defined）
    const FORMULA_DEFAULTS: Record<string, Record<string, number>> = {
      shade: { control_price: 0, hardware_unit_price: 0, fabric_unit_price: 0 },
      drapery: { lining_price_per_yard: 0, labor_per_panel: 0, fabric_unit_price: 0 },
    }

    // 合并 baseParams：公式默认值 < db variables < 产品 params
    const mergedBaseParams = {
      ...(FORMULA_DEFAULTS[productType] ?? {}),
      ...(pricingConfig?.variables ?? {}),
      ...baseParams,
    }

    // 调用 engine
    const result = UnifiedPricingEngine.calculate(input, {
      productType: productType as ProductType,
      baseParams: mergedBaseParams,
      options,
      optionValues: mappedOptionValues2,
      formula: pricingConfig?.formula ?? { steps: [] },
    })

    // 生成 explain
    let explain: any[] = []
    if (productType === 'drapery') explain = explainDrapery(result.breakdown as any)
    else if (productType === 'sheer') explain = explainSheer(result.breakdown as any)
    else if (productType === 'shade') explain = explainShade(result.breakdown as any)

    return NextResponse.json({ ok: true, result, explain })
  } catch (e) {
    console.error('[pricing/calculate]', e)
    return NextResponse.json({ ok: false, error: 'Could not calculate price. Please try again.' }, { status: 400 })
  }
}

export const dynamic = 'force-dynamic'
