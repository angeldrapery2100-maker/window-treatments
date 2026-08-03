'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Address = {
  name: string
  company: string
  street1: string
  street2: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
  email: string
}

type Parcel = {
  length: string
  width: string
  height: string
  weight: string
  massUnit: 'lb' | 'oz'
  template: string
}

type Rate = {
  rateId: string
  carrier: string
  service: string
  price: string
  currency: string
  estimatedDays: number | string
  carrierImage?: string
}

type AddressSuggestion = {
  place: string
  placeId: string
  description: string
}

type PackageOption = {
  id: string
  label: string
  group: string
  template?: string
  length?: string
  width?: string
  height?: string
  weight?: string
  massUnit?: 'lb' | 'oz'
}

const PACKAGE_OPTIONS: PackageOption[] = [
  { id: 'custom', group: 'Custom', label: 'Customize Box' },
  { id: 'small-box', group: 'Custom', label: 'Small Box (12 x 9 x 4 in)', length: '12', width: '9', height: '4', weight: '2', massUnit: 'lb' },
  { id: 'medium-box', group: 'Custom', label: 'Medium Box (18 x 14 x 8 in)', length: '18', width: '14', height: '8', weight: '5', massUnit: 'lb' },
  { id: 'drapery-box', group: 'Custom', label: 'Drapery Box (36 x 12 x 8 in)', length: '36', width: '12', height: '8', weight: '8', massUnit: 'lb' },
  { id: 'long-hardware', group: 'Custom', label: 'Long Hardware (72 x 6 x 6 in)', length: '72', width: '6', height: '6', weight: '10', massUnit: 'lb' },
  { id: 'usps-flat-envelope', group: 'USPS', label: 'USPS Priority Mail Flat Rate Envelope', template: 'USPS_FlatRateEnvelope', weight: '8', massUnit: 'oz' },
  { id: 'usps-padded-envelope', group: 'USPS', label: 'USPS Priority Mail Padded Flat Rate Envelope', template: 'USPS_FlatRatePaddedEnvelope', weight: '12', massUnit: 'oz' },
  { id: 'usps-legal-envelope', group: 'USPS', label: 'USPS Priority Mail Legal Flat Rate Envelope', template: 'USPS_FlatRateLegalEnvelope', weight: '12', massUnit: 'oz' },
  { id: 'usps-window-envelope', group: 'USPS', label: 'USPS Priority Mail Window Flat Rate Envelope', template: 'USPS_FlatRateWindowEnvelope', weight: '8', massUnit: 'oz' },
  { id: 'usps-small-box', group: 'USPS', label: 'USPS Priority Mail Small Flat Rate Box', template: 'USPS_SmallFlatRateBox', weight: '1', massUnit: 'lb' },
  { id: 'usps-medium-box-1', group: 'USPS', label: 'USPS Priority Mail Medium Flat Rate Box 1', template: 'USPS_MediumFlatRateBox1', weight: '3', massUnit: 'lb' },
  { id: 'ups-letter', group: 'UPS', label: 'UPS Letter (12.5 x 9.5 in)', template: 'UPS_Express_Envelope', weight: '8', massUnit: 'oz' },
  { id: 'ups-legal-envelope', group: 'UPS', label: 'UPS Express Legal Envelope', template: 'UPS_Express_Legal_Envelope', weight: '8', massUnit: 'oz' },
  { id: 'ups-express-pak', group: 'UPS', label: 'UPS Express Pak', template: 'UPS_Express_Pak', weight: '1', massUnit: 'lb' },
  { id: 'ups-express-box-small', group: 'UPS', label: 'UPS Express Box Small', template: 'UPS_Express_Box_Small', weight: '3', massUnit: 'lb' },
  { id: 'ups-express-box-medium', group: 'UPS', label: 'UPS Express Box Medium', template: 'UPS_Express_Box_Medium', weight: '5', massUnit: 'lb' },
  { id: 'ups-express-tube', group: 'UPS', label: 'UPS Express Tube', template: 'UPS_Express_Tube', weight: '3', massUnit: 'lb' },
  { id: 'fedex-envelope', group: 'FedEx', label: 'FedEx Envelope', template: 'FedEx_Envelope', weight: '8', massUnit: 'oz' },
  { id: 'fedex-padded-pak', group: 'FedEx', label: 'FedEx Padded Pak', template: 'FedEx_Padded_Pak', weight: '1', massUnit: 'lb' },
  { id: 'fedex-pak-1', group: 'FedEx', label: 'FedEx Pak 1', template: 'FedEx_Pak_1', weight: '1', massUnit: 'lb' },
  { id: 'fedex-tube', group: 'FedEx', label: 'FedEx Tube', template: 'FedEx_Tube', weight: '3', massUnit: 'lb' },
]

const GROUPS = ['Custom', 'USPS', 'UPS', 'FedEx']

const emptyAddress: Address = {
  name: '',
  company: '',
  street1: '',
  street2: '',
  city: '',
  state: 'CA',
  zip: '',
  country: 'US',
  phone: '',
  email: '',
}

const defaultParcel: Parcel = { length: '18', width: '14', height: '8', weight: '5', massUnit: 'lb', template: '' }

function money(rate: Rate) {
  const value = Number(rate.price)
  return Number.isFinite(value) ? `$${value.toFixed(2)}` : `${rate.price} ${rate.currency}`
}

function compactAddress(a: Address) {
  return [a.street1, a.street2, `${a.city}, ${a.state} ${a.zip}`, a.country].filter(Boolean).join(' · ')
}

export default function CreateCustomShipmentPage() {
  const [address, setAddress] = useState<Address>(emptyAddress)
  const [parcel, setParcel] = useState<Parcel>(defaultParcel)
  const [packageId, setPackageId] = useState('medium-box')
  const [contents, setContents] = useState('Custom package')
  const [rates, setRates] = useState<Rate[]>([])
  const [selectedRateId, setSelectedRateId] = useState('')
  const [loadingRates, setLoadingRates] = useState(false)
  const [validating, setValidating] = useState(false)
  const [buying, setBuying] = useState(false)
  const [message, setMessage] = useState('')
  const [validatedAddress, setValidatedAddress] = useState<Address | null>(null)
  const [addressQuery, setAddressQuery] = useState('')
  const [addressSessionToken] = useState(() => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
  })
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([])
  const [suggesting, setSuggesting] = useState(false)
  const [loadingPlace, setLoadingPlace] = useState(false)
  const [purchased, setPurchased] = useState<{ trackingNumber: string; trackingUrl: string; labelUrl: string } | null>(null)

  const selectedPackage = PACKAGE_OPTIONS.find(p => p.id === packageId) || PACKAGE_OPTIONS[0]
  const isCarrierTemplate = Boolean(parcel.template)

  const setAddressField = (key: keyof Address, value: string) => {
    setAddress(prev => ({ ...prev, [key]: value }))
    setValidatedAddress(null)
    if (key === 'street1') setAddressQuery(value)
  }

  useEffect(() => {
    const q = addressQuery.trim()
    if (q.length < 3) {
      setAddressSuggestions([])
      setSuggesting(false)
      return
    }
    const timer = window.setTimeout(async () => {
      setSuggesting(true)
      try {
        const res = await fetch('/api/admin/custom-shipping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'address_autocomplete', query: q, sessionToken: addressSessionToken }),
        })
        const data = await res.json()
        if (data.success) {
          setAddressSuggestions(data.data.suggestions || [])
        } else {
          setAddressSuggestions([])
          setMessage(data.error || 'Address autocomplete is not available.')
        }
      } catch {
        setAddressSuggestions([])
      } finally {
        setSuggesting(false)
      }
    }, 250)
    return () => window.clearTimeout(timer)
  }, [addressQuery])

  const applyAddressSuggestion = async (suggestion: AddressSuggestion) => {
    setLoadingPlace(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/custom-shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'address_place_details', place: suggestion.place, sessionToken: addressSessionToken }),
      })
      const data = await res.json()
      if (!data.success) {
        setMessage(data.error || 'Could not load address details.')
        return
      }
      const picked = data.data.address || {}
      setAddress(prev => ({
        ...prev,
        street1: picked.street1 || prev.street1,
        street2: picked.street2 || prev.street2,
        city: picked.city || prev.city,
        state: picked.state || prev.state,
        zip: picked.zip || prev.zip,
        country: picked.country || prev.country || 'US',
      }))
      setAddressSuggestions([])
      setAddressQuery('')
      setValidatedAddress(null)
      setMessage('Address selected. Add name, phone, and email if needed.')
    } catch {
      setMessage('Could not load address details.')
    } finally {
      setLoadingPlace(false)
    }
  }

  const setParcelField = (key: keyof Parcel, value: string) => {
    setParcel(prev => ({ ...prev, [key]: value }))
    if (key !== 'weight' && key !== 'massUnit') setPackageId('custom')
  }

  const choosePackage = (id: string) => {
    const next = PACKAGE_OPTIONS.find(p => p.id === id)
    if (!next) return
    setPackageId(id)
    setRates([])
    setSelectedRateId('')
    setParcel({
      length: next.template ? '' : (next.length || ''),
      width: next.template ? '' : (next.width || ''),
      height: next.template ? '' : (next.height || ''),
      weight: next.weight || parcel.weight || '1',
      massUnit: next.massUnit || parcel.massUnit || 'lb',
      template: next.template || '',
    })
  }

  const validateAddress = async () => {
    setMessage('')
    setValidatedAddress(null)
    setValidating(true)
    try {
      const res = await fetch('/api/admin/custom-shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate_address', address }),
      })
      const data = await res.json()
      if (data.success) {
        if (data.data.recommended) {
          setValidatedAddress(data.data.recommended)
          setMessage('Address checked. Review the suggested format before buying.')
        } else {
          setMessage('Address checked. No replacement address was returned.')
        }
      } else {
        setMessage(data.error || 'Could not validate address.')
      }
    } catch {
      setMessage('Could not validate address. Please check Shippo settings.')
    } finally {
      setValidating(false)
    }
  }

  const getRates = async () => {
    setMessage('')
    setPurchased(null)
    setLoadingRates(true)
    setRates([])
    setSelectedRateId('')
    try {
      const res = await fetch('/api/admin/custom-shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_rates', address, parcel }),
      })
      const data = await res.json()
      if (data.success) {
        setRates(data.data.rates || [])
        setSelectedRateId(data.data.rates?.[0]?.rateId || '')
        if (!data.data.rates?.length) setMessage('No rates returned for this package.')
      } else {
        setMessage(data.error || 'Could not get rates.')
      }
    } catch {
      setMessage('Could not get rates. Please check the network and Shippo settings.')
    } finally {
      setLoadingRates(false)
    }
  }

  const purchaseLabel = async () => {
    if (!selectedRateId) {
      setMessage('Please select a shipping service.')
      return
    }
    setBuying(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/custom-shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'purchase_label',
          address,
          parcel,
          packagePreset: packageId,
          contents,
          rateId: selectedRateId,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setPurchased({
          trackingNumber: data.data.trackingNumber || '',
          trackingUrl: data.data.trackingUrl || '',
          labelUrl: data.data.labelUrl || '',
        })
        setMessage('Label purchased.')
      } else {
        setMessage(data.error || 'Could not purchase label.')
      }
    } catch {
      setMessage('Could not purchase label. Please check the network and Shippo settings.')
    } finally {
      setBuying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Custom Label</h1>
              <p className="text-sm text-gray-500 mt-1">No order required. Use a carrier package or enter custom dimensions.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/shipments" className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">Back to Shipments</Link>
              <Link href="/admin" className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">Admin</Link>
            </div>
          </div>
          {message && (
            <div className={`mt-4 rounded-lg px-4 py-3 text-sm ${purchased ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-800'}`}>
              {message}
            </div>
          )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-6">
          <section className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-semibold text-gray-900">Recipient</h2>
              <button type="button" onClick={validateAddress} disabled={validating}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                {validating ? 'Checking...' : 'Validate Address'}
              </button>
            </div>
            {(suggesting || loadingPlace || addressSuggestions.length > 0) && (
              <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase text-gray-500">Address suggestions</p>
                  {suggesting && <p className="text-xs text-gray-400">Searching...</p>}
                  {loadingPlace && <p className="text-xs text-gray-400">Filling address...</p>}
                </div>
                {addressSuggestions.length > 0 && (
                  <div className="mt-2 grid gap-2">
                    {addressSuggestions.map((suggestion, i) => (
                      <button key={`${suggestion.place}-${i}`} type="button"
                        onClick={() => applyAddressSuggestion(suggestion)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-left hover:border-gray-900 hover:bg-white">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">{suggestion.description}</p>
                          </div>
                          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                            Google
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="text-sm text-gray-600">Name
                <input value={address.name} onChange={e => setAddressField('name', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </label>
              <label className="text-sm text-gray-600">Company
                <input value={address.company} onChange={e => setAddressField('company', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </label>
              <label className="sm:col-span-2 text-sm text-gray-600">Street
                <input value={address.street1} onChange={e => setAddressField('street1', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </label>
              <label className="sm:col-span-2 text-sm text-gray-600">Apt, suite, unit
                <input value={address.street2} onChange={e => setAddressField('street2', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </label>
              <label className="text-sm text-gray-600">City
                <input value={address.city} onChange={e => setAddressField('city', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label className="text-sm text-gray-600">State
                  <input value={address.state} onChange={e => setAddressField('state', e.target.value.toUpperCase())} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 uppercase text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </label>
                <label className="col-span-2 text-sm text-gray-600">ZIP
                  <input value={address.zip} onChange={e => setAddressField('zip', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </label>
              </div>
              <label className="text-sm text-gray-600">Phone
                <input value={address.phone} onChange={e => setAddressField('phone', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </label>
              <label className="text-sm text-gray-600">Email
                <input value={address.email} onChange={e => setAddressField('email', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </label>
            </div>
            {validatedAddress && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-xs font-semibold uppercase text-green-700">Suggested address</p>
                <p className="mt-1 text-sm text-green-950">{compactAddress(validatedAddress)}</p>
                <button onClick={() => { setAddress(validatedAddress); setValidatedAddress(null); setMessage('Suggested address applied.') }}
                  className="mt-3 rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-800">
                  Use Suggested Address
                </button>
              </div>
            )}
          </section>

          <section className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Package</h2>
            <label className="block text-sm text-gray-600">Package type
              <select value={packageId} onChange={e => choosePackage(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent">
                {GROUPS.map(group => (
                  <optgroup key={group} label={group}>
                    {PACKAGE_OPTIONS.filter(o => o.group === group).map(option => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{selectedPackage.label}</p>
              <p className="mt-1 text-xs text-gray-500">
                {isCarrierTemplate ? `Shippo template: ${parcel.template}` : 'Custom dimensions'}
              </p>
            </div>

            {!isCarrierTemplate && (
              <div className="grid sm:grid-cols-4 gap-4 mt-4">
                <label className="text-sm text-gray-600">Length in
                  <input type="number" min="0" step="0.1" value={parcel.length} onChange={e => setParcelField('length', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </label>
                <label className="text-sm text-gray-600">Width in
                  <input type="number" min="0" step="0.1" value={parcel.width} onChange={e => setParcelField('width', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </label>
                <label className="text-sm text-gray-600">Height in
                  <input type="number" min="0" step="0.1" value={parcel.height} onChange={e => setParcelField('height', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </label>
                <div />
              </div>
            )}

            <div className="grid sm:grid-cols-[1fr_120px] gap-4 mt-4">
              <label className="text-sm text-gray-600">Weight
                <input type="number" min="0" step="0.1" value={parcel.weight} onChange={e => setParcel(prev => ({ ...prev, weight: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </label>
              <label className="text-sm text-gray-600">Unit
                <select value={parcel.massUnit} onChange={e => setParcel(prev => ({ ...prev, massUnit: e.target.value as 'lb' | 'oz' }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent">
                  <option value="lb">lb</option>
                  <option value="oz">oz</option>
                </select>
              </label>
            </div>

            <label className="block text-sm text-gray-600 mt-4">Contents
              <input value={contents} onChange={e => setContents(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
            </label>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="bg-white rounded-lg border border-gray-200 p-5">
            <button onClick={getRates} disabled={loadingRates || buying}
              className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-50">
              {loadingRates ? 'Getting rates...' : 'Get Rates'}
            </button>

            <div className="mt-4 space-y-3">
              {rates.map(rate => (
                <label key={rate.rateId}
                  className={`block rounded-lg border p-3 cursor-pointer ${selectedRateId === rate.rateId ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <div className="flex items-start gap-3">
                    <input type="radio" className="mt-1" checked={selectedRateId === rate.rateId} onChange={() => setSelectedRateId(rate.rateId)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{rate.carrier}</p>
                          <p className="text-xs text-gray-500">{rate.service}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{money(rate)}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">ETA: {rate.estimatedDays || 'N/A'}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {rates.length > 0 && (
              <button onClick={purchaseLabel} disabled={buying || !selectedRateId}
                className="mt-4 w-full rounded-lg bg-[#3d3d3d] px-4 py-3 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50">
                {buying ? 'Purchasing...' : 'Purchase Label'}
              </button>
            )}
          </section>

          {purchased && (
            <section className="bg-green-50 rounded-lg border border-green-200 p-5">
              <p className="text-sm font-semibold text-green-900">Label ready</p>
              <p className="mt-1 text-xs text-green-700 font-mono">{purchased.trackingNumber}</p>
              <div className="mt-4 flex flex-col gap-2">
                {purchased.labelUrl && <a href={purchased.labelUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-green-700 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-green-800">Open Label PDF</a>}
                {purchased.trackingUrl && <a href={purchased.trackingUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-white border border-green-200 px-4 py-2 text-center text-sm font-semibold text-green-800 hover:bg-green-100">Track Package</a>}
                <Link href="/admin/shipments" className="rounded-lg bg-white border border-green-200 px-4 py-2 text-center text-sm font-semibold text-green-800 hover:bg-green-100">View in Shipments</Link>
              </div>
            </section>
          )}
        </aside>
      </main>
    </div>
  )
}
