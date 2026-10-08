import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

// Apply the saved theme before first paint so dark mode does not flash light
const savedTheme = localStorage.getItem("lms_theme") === "dark" ? "dark" : "light"
document.documentElement.setAttribute("data-theme", savedTheme)
document.documentElement.setAttribute("data-bs-theme", savedTheme)

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <StrictMode>
    <App />
  </StrictMode>
  </BrowserRouter>,
)
