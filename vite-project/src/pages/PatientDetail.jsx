import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'

const PatientDetail = ({ isLoggedIn, onLoginToggle }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const hasRedirected = useRef(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
        try {
        const res = await fetch(`http://localhost:5000/api/patients/${patient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        })
        if (!res.ok) throw new Error('Update failed')

        alert('Patient updated successfully')
        setShowModal(false)
    } catch (err) {
        alert('Error updating patient')
        console.error(err)
    }
    }

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        gender: patient.gender || '',
        height: patient.height || '',
        weight: patient.weight || '',
      })
    }
  }, [patient])

  useEffect(() => {
    if (!isLoggedIn) {
      hasRedirected.value = true
      alert('Please Log in first')
      navigate('/')
      return
    }

    fetch(`http://localhost:5000/api/patients/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => setPatient(data))
      .catch((err) => {
        console.error(err)
        alert('Patient not found')
        navigate('/info')
      })
  }, [id, isLoggedIn, navigate])

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header isLoggedIn={isLoggedIn} onLoginToggle={onLoginToggle} />
        <div className="p-6 text-center text-gray-600">Loading patient data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header isLoggedIn={isLoggedIn} onLoginToggle={onLoginToggle} />

      <main className="p-6 max-w-5xl mx-auto space-y-6">
        {/* 上方兩塊 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 左上：用戶資訊 */}
          <div className="bg-white p-6 rounded shadow relative">
  {/* 上方標題列 + 選單按鈕 */}
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-semibold">Patient Info</h2>
    
    <div className="relative">
      <button
        onClick={() => setMenuOpen(prev => !prev)}
        className="text-gray-500 hover:text-gray-700 text-xl px-2"
      >
        ⋯
      </button>

      {/* 下拉選單 */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10">
          <button
            onClick={() => {
              setMenuOpen(false)
              setShowModal(true)  // 你可以在這裡做 navigate 或打開 modal
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            修改
          </button>
        </div>
        )}
        </div>
    </div>

    {/* 病患資訊內容 */}
    <p><strong>ID:</strong> {patient.id}</p>
    <p><strong>Name:</strong> {patient.name}</p>
    <p><strong>Gender:</strong> {patient.gender ?? '-'}</p>
    <p><strong>Height:</strong> {patient.height ?? '-'} cm</p>
    <p><strong>Weight:</strong> {patient.weight ?? '-'} kg</p>
    </div>
    {/* Modal */}
    {showModal && (
      <div
        className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      >
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h3 className="text-lg font-bold mb-4">編輯病患資訊</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="">-</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Height (cm)</label>
              <input
                name="height"
                type="number"
                value={formData.height}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Weight (kg)</label>
              <input
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

          {/* 右上：預留空間 */}
          <div className="bg-white p-6 rounded shadow flex items-center justify-center text-gray-400">
            Right Top Block (Reserved)
          </div>
        </div>

        {/* 下方區塊：預留空間 */}
        <div className="bg-white p-6 rounded shadow min-h-[360px] flex items-center justify-center text-gray-400">
          Bottom Block (Reserved)
        </div>
      </main>
    </div>
  )
}

export default PatientDetail
