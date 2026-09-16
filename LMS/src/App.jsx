import { useEffect, useState, useCallback } from 'react'
import './App.css'
import { Context } from './components/context'
import { Header } from './components/header'
import { Routee } from './components/routes'
import { ToastProvider } from './components/ToastContext'
import { CommandPalette } from './components/CommandPalette'

function App() {
  const [usertype, setusertype] = useState(" ")
  const [theme, setTheme] = useState(localStorage.getItem("lms_theme") || "light")
  const [isCmdOpen, setIsCmdOpen] = useState(false)

  useEffect(() => {
    const ut = localStorage.getItem("Utype");
    if (ut === "Admin") {
      setusertype("Admin")
    } else if (ut === "User") {
      setusertype("User")
    } else {
      setusertype("Guest")
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("lms_theme", theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }, [])

  const openCmdPalette = useCallback(() => {
    setIsCmdOpen(true)
  }, [])

  const closeCmdPalette = useCallback(() => {
    setIsCmdOpen(false)
  }, [])

  // Global keyboard listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsCmdOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <ToastProvider>
      <Context.Provider value={{ usertype, setusertype, theme, toggleTheme, openCmdPalette }}>
        <Header></Header>
        <Routee></Routee>
        <CommandPalette isOpen={isCmdOpen} onClose={closeCmdPalette} />
      </Context.Provider>
    </ToastProvider>
  )
}

export default App
