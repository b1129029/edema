import React, { useEffect, useRef} from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

const InfoPage = ({ isLoggedIn, onLoginToggle }) => {
  const navigate = useNavigate()
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (!isLoggedIn) {
      hasRedirected.value = true
      navigate('/')
      window.alert('Please Log in frist')
    }
  }, [isLoggedIn, navigate])

  return (
    <div className="min-h-screen bg-gray-100">
      <Header isLoggedIn={isLoggedIn} onLoginToggle={onLoginToggle} />

      <main className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">This is the Setting Page</h1>
      </main>
    </div>
  )
}

export default InfoPage
