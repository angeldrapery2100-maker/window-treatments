'use client'

import { redirect } from 'next/navigation'

export default function CreateProductPage() {
  redirect('/admin/products/edit/create')
}
