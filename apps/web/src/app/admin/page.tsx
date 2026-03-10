'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  inProductionOrders: number
  shippedOrders: number
  completedOrders: number
  cancelledOrders: number
  totalProducts: number
  activeProducts: number
  totalRevenue: number
  revenueThisMonth: number
  ordersThisMonth: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [onlineStoreEnabled, setOnlineStoreEnabled] = useState<boolean | null>(null)
  const [toggling, setToggling] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, settingsRes] = await Promise.all([
          fetch('/api/admin/dashboard'),
          fetch('/api/admin/site-settings'),
        ])
        const dashData     = await dashRes.json()
        const settingsData = await settingsRes.json()

        if (dashData.success) {
          const o = dashData.data.orders
          const p = dashData.data.products
          setStats({
            totalOrders:        Number(o.total_orders),
            pendingOrders:      Number(o.pending),
            inProductionOrders: Number(o.in_production),
            shippedOrders:      Number(o.shipped),
            completedOrders:    Number(o.completed),
            cancelledOrders:    Number(o.cancelled),
            totalProducts:      Number(p.total_products),
            activeProducts:     Number(p.active_products),
            totalRevenue:       Number(o.total_revenue),
            revenueThisMonth:   Number(o.revenue_this_month),
            ordersThisMonth:    Number(o.orders_this_month),
          })
        }

        if (settingsData.success) {
          setOnlineStoreEnabled(!!settingsData.data?.online_store_enabled)
        }
      } catch { }
    }
    load()
  }, [])

  const toggleStore = async () => {
    if (toggling || onlineStoreEnabled === null) return
    setToggling(true)
    const next = !onlineStoreEnabled
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'online_store_enabled', value: next }),
      })
      const data = await res.json()
      if (data.success) {
        setOnlineStoreEnabled(next)
        setToastMsg(next ? 'Online Store is now LIVE' : 'Online Store is now hidden')
        setTimeout(() => setToastMsg(null), 3000)
      }
    } catch { }
    setToggling(false)
  }

  return (
    <div className="min-h-screen">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {toastMsg}
        </div>
      )}

      <div className="border-b border-gray-200 bg-white">
        <div className="px-8 py-6">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Overview of your website and store</p>
        </div>
      </div>

      <div className="px-8 py-8">

        {/* ── Site Features ── */}
        <div className="mb-10">
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">Site Features</h2>
          <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">

            {/* Online Store toggle */}
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Online Store</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {onlineStoreEnabled === null
                    ? 'Loading…'
                    : onlineStoreEnabled
                      ? 'Visible to visitors — customers can browse and order'
                      : 'Hidden from visitors — shows "Coming Soon" page'}
                </p>
              </div>
              <button
                onClick={toggleStore}
                disabled={toggling || onlineStoreEnabled === null}
                aria-label="Toggle Online Store"
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                  onlineStoreEnabled ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    onlineStoreEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

          </div>
        </div>

        {stats && (
          <>
            {/* Order Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 mb-8">
              {[
                { label: 'Total Orders',   value: stats.totalOrders,        color: 'text-gray-900' },
                { label: 'Pending',        value: stats.pendingOrders,      color: stats.pendingOrders > 0      ? 'text-amber-600'   : 'text-gray-400' },
                { label: 'In Production',  value: stats.inProductionOrders, color: stats.inProductionOrders > 0 ? 'text-violet-600'  : 'text-gray-400' },
                { label: 'Shipped',        value: stats.shippedOrders,      color: stats.shippedOrders > 0      ? 'text-sky-600'     : 'text-gray-400' },
                { label: 'Completed',      value: stats.completedOrders,    color: stats.completedOrders > 0    ? 'text-emerald-600' : 'text-gray-400' },
                { label: 'Total Revenue',  value: `$${stats.totalRevenue.toLocaleString()}`, color: 'text-gray-900' },
                { label: 'This Month',     value: `$${stats.revenueThisMonth?.toLocaleString() ?? 0}`, color: 'text-emerald-700' },
                { label: 'Orders / Month', value: stats.ordersThisMonth ?? 0, color: 'text-gray-600' },
              ].map(s => (
                <div key={s.label} className="bg-white border border-gray-200 rounded-lg px-4 py-3.5">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{s.label}</p>
                  <p className={`text-2xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Product Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
              {[
                { label: 'Total Products', value: stats.totalProducts,                              color: 'text-gray-900' },
                { label: 'Active',         value: stats.activeProducts,                             color: 'text-emerald-600' },
                { label: 'Inactive',       value: stats.totalProducts - stats.activeProducts,       color: stats.totalProducts - stats.activeProducts > 0 ? 'text-gray-500' : 'text-gray-400' },
              ].map(s => (
                <div key={s.label} className="bg-white border border-gray-200 rounded-lg px-4 py-3.5">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{s.label}</p>
                  <p className={`text-2xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Quick Links */}
        <div className="mb-10">
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { href: '/admin/orders',       label: 'View Orders',   desc: 'Process orders and work orders',  badge: stats?.pendingOrders },
              { href: '/admin/shipments',    label: 'Shipments',     desc: 'Track and manage deliveries' },
              { href: '/admin/products',     label: 'Products',      desc: 'Manage store inventory' },
              { href: '/admin/site-content', label: 'Site Content',  desc: 'Edit homepage and pages' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="group block bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">{item.label}</h3>
                  {item.badge ? (
                    <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">{item.badge}</span>
                  ) : (
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
