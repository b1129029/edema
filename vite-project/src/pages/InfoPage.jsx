import React, { useEffect, useState, useRef  } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'


const fallbackData = [
  {
    id: 0,
    name: 'No data available',
    gender: '-',
    height: '-',
    weight: '-',
    lastCheckDate: '-',
  },
]

const InfoPage = ({ isLoggedIn, onLoginToggle }) => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [patients, setPatients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const hasRedirected = useRef(false)

  const API_URL = 'https://edema.ngrok.app/api/patients'

  useEffect(() => {
    if (!isLoggedIn) {
        hasRedirected.value = true
      alert('Please Log in first')
      navigate('/')
    }
  }, [isLoggedIn, navigate])

  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then((data) => {
        setPatients(data)
      })
      .catch((err) => {
        console.error('API error, using fallback data:', err)
        setPatients(fallbackData)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleRowClick = (id) => {
    console.log(id)
    navigate(`/patient/${id}`)
    }

  const filteredData = patients.filter((item) =>
    (item.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (item.gender?.toLowerCase() || '').includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <Header isLoggedIn={isLoggedIn} onLoginToggle={onLoginToggle} />

      <main className="p-6 max-w-5xl mx-auto">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name or gender..."
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center text-gray-600">Loading data...</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-200 text-gray-700">
                <tr className="text-center">
                  <th className="p-3">Name</th>
                  <th className="p-3">Gender</th>
                  <th className="p-3">Height (cm)</th>
                  <th className="p-3">Weight (kg)</th>
                  <th className="p-3">Last Check</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (

                  <tr
                    key={item.id}
                    className="cursor-pointer hover:bg-blue-100 transition text-center"
                    onClick={() => handleRowClick(item.id)}
                  >
                    <td className="p-3">{item.name ?? '-'}</td>
                    <td className="p-3">{item.gender ?? '-'}</td>
                    <td className="p-3">{item.height ?? '-'}</td>
                    <td className="p-3">{item.weight ?? '-'}</td>
                    <td className="p-3">{item.lastCheckDate ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}

export default InfoPage
