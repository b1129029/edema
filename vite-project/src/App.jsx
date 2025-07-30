import React, { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import "react-datepicker/dist/react-datepicker.css";
import Header from './components/Header'
import InfoPage from './pages/InfoPage'
import SettingPage from './pages/SettingPage'
import PatientDetail from './pages/PatientDetail'

function App() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  
  // ➤ 初始化時從 localStorage 讀取登入狀態
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true'
  })

  // ➤ 切換登入狀態並同步到 localStorage
  const toggleLogin = () => {
    const newState = !isLoggedIn
    setIsLoggedIn(newState)
    if (newState) {
      localStorage.setItem('isLoggedIn', 'true')
    } else {
      localStorage.removeItem('isLoggedIn')
    }
  }

  // ➤ 表單送出（登入成功）
  const handleFormSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) throw new Error('Login failed')

      const data = await res.json()
      if (data.success) {
        setIsLoggedIn(true)
        localStorage.setItem('isLoggedIn', 'true')
        navigate('/info')
      } else {
        alert('Invalid username or password')
      }
    } catch (err) {
      console.error('Login error:', err)
      alert('Login error. Please try again.')
    }
  }


  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-gray-100">
            <Header isLoggedIn={isLoggedIn} onLoginToggle={toggleLogin} />
            <main className="flex justify-center items-center min-h-[calc(100vh-64px)] px-4">
              {!isLoggedIn ? (
                <form
                  onSubmit={handleFormSubmit}
                  className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4"
                >
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Username</label>
                    <input
                      type="text"
                      className="w-full border p-2 rounded"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Password</label>
                    <input
                      type="password"
                      className="w-full border p-2 rounded"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                  >
                    Log In
                  </button>
                </form>
              ) : (
                <div className="bg-white p-6 rounded shadow-md w-full max-w-3xl space-y-4 text-gray-800 text-sm leading-relaxed">
                  <h1 className="text-2xl font-bold mb-4">🔍 How to Use This Web App</h1>

                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Login Page</strong> – Input your <em>username</em> and <em>password</em>, then click <strong>Log In</strong>.</li>
                    <li><strong>Info Page</strong> – Displays patient cards. Click a card to view detailed records.</li>
                    <li>
                      <strong>Patient Detail</strong>:
                      <ul className="list-disc list-inside ml-6">
                        <li>Top-left: view/edit basic patient info (click ⋯ &gt; Edit).</li>
                        <li>Top-right Chart:
                          <ul className="list-disc list-inside ml-6">
                            <li>Shows last 5 records (Manual, Circumference, Area, Survey).</li>
                            <li>Click legend items to toggle line visibility (gray means hidden).</li>
                          </ul>
                        </li>
                        <li>Bottom Table:
                          <ul className="list-disc list-inside ml-6">
                            <li>Filter by date range (default: past 6 months).</li>
                            <li>Click row to open modal: edit Manual and Remark, view photo.</li>
                            <li>Red dot = remark exists.</li>
                            <li>Click ✕ to delete (will confirm before deleting).</li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>Settings</strong>:
                      <ul className="list-disc list-inside ml-6">
                        <li>Edit your username/password.</li>
                        <li>On Save, a confirmation prompt appears.</li>
                        <li>Changes take effect only after confirmation.</li>
                        <li>You will be logged out after successful update.</li>
                      </ul>
                    </li>
                    <li><strong>Authentication</strong> – State is stored in <code>localStorage</code>. Logout clears it and redirects.</li>
                  </ul>
                </div>
              )}
            </main>
          </div>
        }
      />
      <Route
        path="/info"
        element={
          <InfoPage isLoggedIn={isLoggedIn} onLoginToggle={toggleLogin} />
        }
      />
      <Route
        path="/settings"
        element={
          <SettingPage
            isLoggedIn={isLoggedIn}
            onLoginToggle={toggleLogin}
            username={username}
            password={password}
            setUsername={setUsername}
            setPassword={setPassword}
          />
        }
      />

      <Route
        path="/patient/:id"
        element={
          <PatientDetail
            isLoggedIn={isLoggedIn}
            onLoginToggle={toggleLogin}
          />
        }
      />
    </Routes>
  )
  
}

export default App
