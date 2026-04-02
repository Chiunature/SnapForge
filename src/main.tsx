import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './app/App'
import './styles/base.css'
import './styles/app.css'
import './styles/editor-layout.css'
import './styles/blockly-workspace.css'
import './styles/blockly-toolbox.css'
import './styles/category-toolbar.css'

const el = document.getElementById('root')
if (!el) throw new Error('Missing #root element')

createRoot(el).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)

