import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CartesianGrid } from 'recharts'
import DatePicker from "react-datepicker"
import { subMonths } from 'date-fns'  // 輔助函式可選
import Header from '../components/Header'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts'


const PatientDetail = ({ isLoggedIn, onLoginToggle }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const hasRedirected = useRef(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState(null)
  const [footData, setFootData] = useState([])
  const [isLoadingFootData, setIsLoadingFootData] = useState(true)
  const [startDate, setStartDate] = useState(subMonths(new Date(), 6)) 
  const [endDate, setEndDate] = useState(new Date())
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
  if (selectedEntry?.photo_path) {
    console.log("Image Source:", `http://localhost:5000${selectedEntry.photo_path.trim()}`);
  }
}, [selectedEntry]);

  useEffect(() => {
  const fetchData = async () => {
    if (!isLoggedIn) return

    try {
      // 1. 先取得病患基本資料
      const patientRes = await fetch(`http://localhost:5000/api/patients/${id}`)
      if (!patientRes.ok) throw new Error('Failed to fetch patient')
      const patientData = await patientRes.json()
      setPatient(patientData)

      // 2. 接著取得 foot_data
      const footRes = await fetch(`http://localhost:5000/api/patients/${id}/foot_data`)
      if (!footRes.ok) throw new Error('Failed to fetch foot data')
      const footData = await footRes.json()
      console.log(footData)
      setFootData(footData)
    } catch (err) {
      console.error('Error fetching data:', err)
      alert('Error loading data, redirecting...')
      navigate('/info')
    } finally {
      setIsLoadingFootData(false)
    }
  }

  fetchData()
}, [id, isLoggedIn, navigate])
  
  const filteredFootData = footData.filter(item => {
    const time = new Date(item.time)
    return time >= startDate && time <= endDate
  })


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
        window.location.reload()
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

        {/* Chart */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Chart</h2>
          {footData.length === 0 ? (
            <p className="text-gray-400">No chart data</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={[...footData].slice(0, 5).reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  tickFormatter={t => new Date(t).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={l => `Date: ${new Date(l).toLocaleString()}`}
                />
                {/* 普通图例，四条线都会展示 */}
                <Legend />

                {/* 四条折线都保持渲染 */}
                <Line type="monotone" dataKey="manual"       name="Manual"       stroke="#8884d8" />
                <Line type="monotone" dataKey="circumference" name="Circumference" stroke="#82ca9d" />
                <Line type="monotone" dataKey="area"         name="Area"         stroke="#ffc658" />
                <Line type="monotone" dataKey="survey"       name="Survey"       stroke="#ff7f7f" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>


  </div>

        {/* 下方區塊：預留空間 */}
        <div className="bg-white p-6 rounded shadow min-h-[360px]">
          <div  className="flex justify-between">
            <h2 className="text-xl font-semibold mb-4">Measurement Records</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mr-2">From:</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="border p-2 rounded"
                />
              </div>
              <div>
                <label className="text-sm font-medium mr-2">To:</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  maxDate={new Date()}
                  className="border p-2 rounded"
                />
              </div>
            </div>
          </div>
          
          
          {isLoadingFootData ? (
            <p className="text-gray-500 text-center">Loading...</p>
          ) : footData.length === 0 ? (
            <p className="text-gray-500 text-center">No data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-200 text-gray-700">
                  <tr className="text-center">
                    <th className="p-3">Time</th>
                    <th className="p-3">Manual</th>
                    <th className="p-3">Circumference</th>
                    <th className="p-3">Area</th>
                    <th className="p-3">Survey</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFootData.map((item, index) => (
                    <tr
                      key={index}
                      className="text-center hover:bg-blue-50 transition"
                      onClick={() => {
                        setSelectedEntry(item)
                        setEditModalOpen(true)
                      }}
                    >
                      <td className="p-3 flex items-center justify-center">
                        {item.remark && (
                          <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2" />
                        )}
                        {new Date(item.time).toLocaleString()}
                      </td>
                      <td className="p-3">
                        {item.manual}
                      </td>
                      <td className="p-3">{item.circumference ?? '-'}</td>
                      <td className="p-3">{item.area ?? '-'}</td>
                      <td className="p-3">{item.survey ?? '-'}</td>
                      <td className="p-3 text-red-500 cursor-pointer hover:underline">
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this record?')) {
                              console.log(item.id)
                              fetch(`http://localhost:5000/api/patients/${id}/foot_data/${item.id}`, {
                                method: 'DELETE',
                              })
                                .then((res) => {
                                  if (!res.ok) throw new Error('Delete failed')
                                  // 刪除成功後刷新資料
                                  setFootData((prev) => prev.filter((f) => f.time !== item.time))
                                  alert('Delete Success')

                                })
                                .catch((err) => {
                                  //console.error(err)
                                  alert('Delete failed')
                                })
                            }
                            window.location.reload()
                          }}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {editModalOpen && selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl space-y-4">
            <h3 className="text-xl font-semibold mb-2">Edit Foot Data</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 左側資訊欄 */}
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium">Time</label>
                  <div className="border p-2 rounded bg-gray-100">
                    {new Date(selectedEntry.time).toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Manual</label>
                  <input
                    type="number"
                    className="w-full border p-2 rounded"
                    value={selectedEntry.manual}
                    onChange={(e) =>
                      setSelectedEntry({ ...selectedEntry, manual: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Circumference</label>
                  <div className="border p-2 rounded bg-gray-100">
                    {selectedEntry.circumference ?? '-'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Area</label>
                  <div className="border p-2 rounded bg-gray-100">
                    {selectedEntry.area ?? '-'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Survey</label>
                  <div className="border p-2 rounded bg-gray-100">
                    {selectedEntry.survey ?? '-'}
                  </div>
                </div>
              </div>

              {/* 右側圖片 */}
              <div className="border rounded overflow-hidden flex items-center justify-center bg-gray-50 h-full min-h-[200px]">
                {selectedEntry.photo_path ? (
                  <img 
                    src={`http://localhost:5000${selectedEntry.photo_path.trim()}`}
                    alt="Foot photo"
                    className="w-full h-auto rounded"
                  />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
              </div>
            </div>

            {/* remark 區塊 */}
            <div>
              <label className="block text-sm font-medium mb-1">Remark</label>
              <textarea
                className="w-full border p-2 rounded min-h-[80px]"
                value={selectedEntry.remark ?? ''}
                onChange={(e) =>
                  setSelectedEntry({ ...selectedEntry, remark: e.target.value })
                }
              />
            </div>

            {/* 按鈕區塊 */}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={async () => {
                  try {
                    const res = await fetch(`http://localhost:5000/api/foot_data/${selectedEntry.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        manual: selectedEntry.manual,
                        remark: selectedEntry.remark,
                      }),
                    })

                    if (!res.ok) throw new Error('Update failed')

                    alert('Saved successfully')
                    setEditModalOpen(false)
                    window.location.reload()  // 你也可以用 refetch 替代
                  } catch (err) {
                    console.error(err)
                    alert('Error saving data')
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      </main>
    </div>
  )
}

export default PatientDetail
