import React from 'react'
import { useNavigate } from 'react-router-dom'
import "./style/Header.scss"

const Header = ({ isAuthed, user, onLogout }) => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (!window.confirm('정말 로그아웃 하시겠어요?')) return
    try {
      await onLogout()
    } catch (error) {}
  }

  return (
    <header className='site-header'>
      <div className="inner">
        <h1 className='logo' onClick={() => navigate('/user/dashboard')}>
          ⚽️ Photomemo
        </h1>

        <div className="auth-area">
          {isAuthed && (
            <>
              <span className='welcome'>
                {user?.displayName || user?.email || "user"}
              </span>
              <button className='btn logout' onClick={handleLogout}>로그아웃</button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
