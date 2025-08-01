import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Header = ({ isLoggedIn, onLoginToggle }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (isLoggedIn) {
      const confirmed = window.confirm("Are you sure you want to log out?")
      if (confirmed) {
        onLoginToggle()
        navigate('/') // ✅ 登出後導回首頁
        isLoggedIn = false
      }
    } else {
      onLoginToggle()
    }
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-blue-700 text-white shadow-md">
      <Link to="/" className="text-xl font-bold hover:underline">
        Main Page
      </Link>

      {isLoggedIn ? (
        <div className="flex items-center gap-4">
          <Link to="/info" className="hover:underline">
            Info
          </Link>
          <Link to="/settings" className="hover:underline">
            Settings
          </Link>

          <button
            onClick={handleClick}
            className="bg-white text-blue-700 font-semibold px-4 py-2 rounded hover:bg-gray-100 transition"
          >
            Log Out
          </button>
        </div>
      ) : (
        <span></span>
      )}
    </header>
  )
}

export default Header
