import React, { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import "react-datepicker/dist/react-datepicker.css";
import Header from './components/Header'
import InfoPage from './pages/InfoPage'
import SettingPage from './pages/SettingPage'
import PatientDetail from './pages/PatientDetail'

function App() {
  const navigate = useNavigate()

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
  const handleFormSubmit = (e) => {
    e.preventDefault()
    setIsLoggedIn(true)
    localStorage.setItem('isLoggedIn', 'true')
    navigate('/info')
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
                    <input type="text" className="w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Password</label>
                    <input type="password" className="w-full border p-2 rounded" />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                  >
                    Log In
                  </button>
                </form>
              ) : (
                <h1 className="text-3xl font-bold text-gray-800">Hello World</h1>
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
          <SettingPage isLoggedIn={isLoggedIn} onLoginToggle={toggleLogin} />
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
