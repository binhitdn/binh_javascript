"use client"

import { useState, useEffect } from 'react'

export default function Home() {
  const [tenants, setTenants] = useState([])
  const [search, setSearch] = useState('')
  const [paymentTypes, setPaymentTypes] = useState([])
  const [form, setForm] = useState({ name: '', phone: '', startDate: '', paymentTypeId: '', note: '' })
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState([])
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchPaymentTypes()
    fetchTenants()
  }, [])

  async function fetchPaymentTypes() {
    const res = await fetch('/api/payment-types')
    const data = await res.json()
    setPaymentTypes(data)
  }

  async function fetchTenants(q = '') {
    const res = await fetch(`/api/tenants?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    setTenants(data)
  }

  function validate() {
    const errs = {}
    if (!form.name || form.name.length < 5 || form.name.length > 50) errs.name = 'Tên từ 5 đến 50 ký tự'
    if (!/^[\p{L} ]+$/u.test(form.name)) {
      errs.name = 'Tên không chứa ký tự đặc biệt';
    }
    if (!/^[0-9]{10}$/.test(form.phone)) errs.phone = 'SĐT phải là 10 chữ số'
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.startDate)) errs.startDate = 'dd/mm/yyyy'
    if (!form.paymentTypeId) errs.paymentTypeId = 'Chọn hình thức'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const [d, m, y] = form.startDate.split('/')
    const iso = new Date(`${y}-${m}-${d}`).toISOString()
    await fetch('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, startDate: iso })
    })
    setShowModal(false)
    setForm({ name: '', phone: '', startDate: '', paymentTypeId: '', note: '' })
    fetchTenants(search)
  }

  const toggleSelect = (id) => {
    setSelected((sel) =>
      sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
    )
  }

  const handleDelete = async () => {
    if (!selected.length) return
    if (!confirm(`Bạn có chắc muốn xóa các bản ghi có ID: ${selected.join(', ')}?`)) return
    await fetch('/api/tenants', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selected })
    })
    setSelected([])
    fetchTenants(search)
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Quản lý thuê trọ</h1>
      <div className="flex justify-between mb-4">
        <button onClick={() => setShowModal(true)} className="bg-green-600 text-white px-4 py-2 rounded">
          Tạo mới
        </button>
        <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">
          Xóa chọn
        </button>
      </div>

      <input
        type="text"
        placeholder="Tìm ID, tên hoặc SĐT"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          fetchTenants(e.target.value)
        }}
        className="w-full mb-4 border rounded p-2"
      />

      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2"><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? tenants.map((t) => t.id) : [])} /></th>
            <th className="border p-2">ID</th>
            <th className="border p-2">Họ tên</th>
            <th className="border p-2">SĐT</th>
            <th className="border p-2">Ngày bắt đầu</th>
            <th className="border p-2">Hình thức</th>
            <th className="border p-2">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((t) => (
            <tr key={t.id} className="hover:bg-gray-50">
              <td className="border p-2 text-center">
                <input
                  type="checkbox"
                  checked={selected.includes(t.id)}
                  onChange={() => toggleSelect(t.id)}
                />
              </td>
              <td className="border p-2">{t.id}</td>
              <td className="border p-2">{t.name}</td>
              <td className="border p-2">{t.phone}</td>
              <td className="border p-2">{new Date(t.startDate).toLocaleDateString('en-GB')}</td>
              <td className="border p-2">{t.paymentType.name}</td>
              <td className="border p-2">{t.note || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        // bg black nhưng làm mờ nhiều hơn
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl mb-4">Tạo thuê trọ</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Họ tên"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded p-2"
              />
              <p className="text-red-500 text-sm">{errors.name}</p>

              <input
                type="text"
                placeholder="Số điện thoại"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border rounded p-2"
              />
              <p className="text-red-500 text-sm">{errors.phone}</p>

              <input
                type="text"
                placeholder="dd/mm/yyyy"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full border rounded p-2"
              />
              <p className="text-red-500 text-sm">{errors.startDate}</p>

              <select
                value={form.paymentTypeId}
                onChange={(e) => setForm({ ...form, paymentTypeId: e.target.value })}
                className="w-full border rounded p-2"
              >
                <option value="">-- Hình thức --</option>
                {paymentTypes.map((pt) => (
                  <option key={pt.id} value={pt.id}>{pt.name}</option>
                ))}
              </select>
              <p className="text-red-500 text-sm">{errors.paymentTypeId}</p>

              <textarea
                placeholder="Ghi chú"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full border rounded p-2"
              />

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded"
                >Hủy</button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
