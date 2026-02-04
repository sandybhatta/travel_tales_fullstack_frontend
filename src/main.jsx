import React from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from "react-router-dom"
import "./main.css"
import store from './slices/store'
import { Provider } from 'react-redux'
import { SocketContextProvider } from './context/SocketContext.jsx'



import App from './App.jsx'

createRoot(document.getElementById('root')).render(
<Provider store={store}>
    <SocketContextProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SocketContextProvider>
  </Provider>
    
  ,
)
