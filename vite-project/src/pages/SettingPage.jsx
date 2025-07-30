import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

const SettingPage = ({
  isLoggedIn,
  onLoginToggle,
  username,
  password,
  setUsername,
  setPassword
}) => {
  const navigate = useNavigate()
  const hasRedirected = useRef(false)
  const [localUsername, setLocalUsername] = useState(username)
  const [localPassword, setLocalPassword] = useState(password)

  useEffect(() => {
    if (!isLoggedIn) {
      hasRedirected.current = true
      navigate('/')
      window.alert('Please log in first')
    }
  }, [isLoggedIn, navigate])

  const handleSave = async () => {
    const confirmed = window.confirm('Are you sure you want to update your account information?')

    if (!confirmed) return

    try {
      const res = await fetch('http://localhost:5000/api/update_account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: localUsername,
          password: localPassword,
        }),
      })

      if (!res.ok) throw new Error('Update failed')

      alert('Account updated. You will be logged out.')

      onLoginToggle()
      localStorage.removeItem('isLoggedIn')
      navigate('/')

    } catch (err) {
      console.error('Update error:', err)
      alert('Update failed. Please try again.')
    }
  }



  return (
    <div className="min-h-screen bg-gray-100">
      <Header isLoggedIn={isLoggedIn} onLoginToggle={onLoginToggle} />

      <main className="flex justify-center items-center min-h-[calc(100vh-64px)] px-4">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-6">
          <h1 className="text-2xl font-bold text-center text-gray-800">Account Settings</h1>

          <div>
            <label className="block text-gray-700 mb-1">Username</label>
            <input
              name="username"
              value={localUsername}
              onChange={(e) => setLocalUsername(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={localPassword}
              onChange={(e) => setLocalPassword(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SettingPage
