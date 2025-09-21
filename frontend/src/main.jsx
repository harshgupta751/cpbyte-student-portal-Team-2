import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {Provider} from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import store from './redux/store.js'
import {Toaster} from "react-hot-toast"
import ScrollToTop from './componenets/ScrollToTop.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
    <BrowserRouter>
      <ScrollToTop/>
      <App />
      <Toaster toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
          error: {
            style: {
              background: 'red',
            },
          },
        }}/>
    </BrowserRouter>
    </Provider>
  </StrictMode>,
)
