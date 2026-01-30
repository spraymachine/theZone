import React from 'react'
import ReactDOM from 'react-dom/client'
import Router from './Router.jsx'
import GSAPProvider from './components/GSAPProvider.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GSAPProvider>
      <Router />
    </GSAPProvider>
  </React.StrictMode>
)



