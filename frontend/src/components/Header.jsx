import React from 'react'

import { useNavigate, NavLink, Link } from 'react-router-dom'
import "./style/Header.scss"
const Header = ({
    isAuthed,
    user,
    onLogout
}) => {

    const navigate = useNavigate()
    const handleLogout = async () => {
        if (!window.confirm('정말 로그아웃 하시겠어요?')) return

        try {
            await onLogout()
        } catch (error) {

        }
    }

    return (
        <header className='site-header'>
            <div className="inner">
                <h1 className='logo'>
                    ⚽️Photomemo
                </h1>
                <div className="auth-area">
                    {isAuthed && (
                        <div>
                            <span className='welcome'>
                                {user?.displayName || user?.email || "user"}
                            </span>
                            <button className='btn logout' onClick={handleLogout}>로그아웃</button>
                        </div>
                    ) }
                </div>
            </div>
        </header>
    )
}

export default Header