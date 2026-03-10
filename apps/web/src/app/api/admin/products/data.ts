// 模拟数据存储 - 所有 API 共享
export let products = [
  {
    id: 1,
    name: 'Premium Linen Drapery',
    type: 'drapery' as const,
    status: 'active' as const,
    sort_order: 1,
    main_image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Elegant Sheer Curtain',
    type: 'sheer' as const,
    status: 'active' as const,
    sort_order: 2,
    main_image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Modern Roller Shade',
    type: 'shade' as const,
    status: 'inactive' as const,
    sort_order: 3,
    main_image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Deluxe Curtain Rod Set',
    type: 'hardware' as const,
    status: 'active' as const,
    sort_order: 4,
    main_image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export function updateProductStatus(id: number, status: 'active' | 'inactive') {
  const product = products.find(p => p.id === id)
  if (product) {
    product.status = status
    product.updated_at = new Date().toISOString()
  }
  return product
}

export function deleteProduct(id: number) {
  const index = products.findIndex(p => p.id === id)
  if (index !== -1) {
    products.splice(index, 1)
    return true
  }
  return false
}

export function getProducts() {
  return products
}
