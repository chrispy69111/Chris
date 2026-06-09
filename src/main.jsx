import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Metabo from './metabo_2.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Metabo />
  </StrictMode>,
)
