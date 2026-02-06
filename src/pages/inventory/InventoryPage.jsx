import { useState, useEffect } from 'react'
import { Card, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import * as inventoryApi from '../../lib/api/inventory'

const CLASSIFICATIONS = ['transfer', 'reassignment', 'disposal']
const DEPARTMENTS = ['IT', 'Admin', 'Accounting', 'HR', 'Library', 'Other']

export function InventoryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null) // 'add' | { id } | null
  const [form, setForm] = useState({
    name: '',
    description: '',
    quantity: 0,
    department: '',
    classification: '',
    is_defective: false,
  })
  const [filterDept, setFilterDept] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterDefective, setFilterDefective] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await inventoryApi.fetchInventoryItems({
        department: filterDept || undefined,
        classification: filterClass || undefined,
        defective_only: filterDefective || undefined,
      })
      setItems(data)
    } catch (e) {
      setError(e.message)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [filterDept, filterClass, filterDefective])

  function openAdd() {
    setModal('add')
    setForm({
      name: '',
      description: '',
      quantity: 0,
      department: '',
      classification: '',
      is_defective: false,
    })
  }

  function openEdit(item) {
    setModal({ id: item.id })
    setForm({
      name: item.name ?? '',
      description: item.description ?? '',
      quantity: item.quantity ?? 0,
      department: item.department ?? '',
      classification: item.classification ?? '',
      is_defective: item.is_defective ?? false,
    })
  }

  async function handleSave() {
    setError('')
    try {
      const payload = {
        name: form.name,
        description: form.description,
        quantity: Number(form.quantity) || 0,
        department: form.department || null,
        classification: form.classification || null,
        is_defective: !!form.is_defective,
      }
      if (modal === 'add') {
        await inventoryApi.createInventoryItem(payload)
      } else if (modal?.id) {
        await inventoryApi.updateInventoryItem(modal.id, payload)
      }
      setModal(null)
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this item?')) return
    setError('')
    try {
      await inventoryApi.deleteInventoryItem(id)
      setModal(null)
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-neutral-800">Inventory</h1>
        <Button onClick={openAdd}>Add item</Button>
      </div>

      <Card>
        <CardTitle>Filters</CardTitle>
        <div className="flex flex-wrap gap-4">
          <Select
            label="Department"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            options={[{ value: '', label: 'All' }, ...DEPARTMENTS.map((d) => ({ value: d, label: d }))]}
            className="w-40"
          />
          <Select
            label="Classification"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            options={[
              { value: '', label: 'All' },
              ...CLASSIFICATIONS.map((c) => ({ value: c, label: c })),
            ]}
            className="w-40"
          />
          <label className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              checked={filterDefective}
              onChange={(e) => setFilterDefective(e.target.checked)}
              className="rounded border-neutral-300 text-olive-600 focus:ring-olive-500"
            />
            <span className="text-sm text-neutral-700">Defective only</span>
          </label>
        </div>
      </Card>

      {error && (
        <div className="rounded-xl bg-red-50 text-red-600 p-4 text-sm">{error}</div>
      )}

      <Card>
        <CardTitle>Items</CardTitle>
        {loading ? (
          <p className="text-neutral-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-neutral-500">No items. Add one to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-600">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Department</th>
                  <th className="pb-3 pr-4">Classification</th>
                  <th className="pb-3 pr-4">Quantity</th>
                  <th className="pb-3 pr-4">Defective</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-100">
                    <td className="py-3 pr-4 font-medium">{item.name}</td>
                    <td className="py-3 pr-4">{item.department ?? '—'}</td>
                    <td className="py-3 pr-4">{item.classification ?? '—'}</td>
                    <td className="py-3 pr-4">{item.quantity}</td>
                    <td className="py-3 pr-4">{item.is_defective ? 'Yes' : 'No'}</td>
                    <td className="py-3 pl-4 text-right">
                      <Button variant="ghost" className="mr-2" onClick={() => openEdit(item)}>
                        Edit
                      </Button>
                      <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" role="dialog" aria-modal="true">
          <div className="rounded-2xl bg-white shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h2 className="text-lg font-semibold mb-4">
              {modal === 'add' ? 'Add item' : 'Edit item'}
            </h2>
            <div className="space-y-4">
              <Input
                label="Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Item name"
              />
              <Input
                label="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional"
              />
              <Input
                label="Quantity"
                type="number"
                min={0}
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              />
              <Select
                label="Department"
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                options={[{ value: '', label: 'Select' }, ...DEPARTMENTS.map((d) => ({ value: d, label: d }))]}
              />
              <Select
                label="Classification"
                value={form.classification}
                onChange={(e) => setForm((f) => ({ ...f, classification: e.target.value }))}
                options={[
                  { value: '', label: 'Select' },
                  ...CLASSIFICATIONS.map((c) => ({ value: c, label: c })),
                ]}
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_defective}
                  onChange={(e) => setForm((f) => ({ ...f, is_defective: e.target.checked }))}
                  className="rounded border-neutral-300 text-olive-600 focus:ring-olive-500"
                />
                <span className="text-sm text-neutral-700">Defective</span>
              </label>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
