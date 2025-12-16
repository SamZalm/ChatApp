import React, { useState, useEffect } from 'react'
import { Routes, Route } from "react-router-dom"
import { LoginComp } from './components/LoginComp'
import { RegisterComp } from './components/RegisterComp'
//import { ForgotPassComp } from './components/ForgotPassComp'
import { ChatComp } from "./components/ChatComp"
import { NotFoundComp } from "./components/NotFoundComp"
import './App.css'

function App() {
  return (
    <div>
        <Routes>
          <Route path='/' element={< LoginComp />} />
          <Route path='/login' element={< LoginComp />} />
          <Route path='/register' element={< RegisterComp />} />
          {/*<Route path='/forgot-password' element={<ForgotPassComp />} />*/}
          <Route path='/chat' element={< ChatComp />} />
          <Route path='*' element={< NotFoundComp />} />
        </Routes>
    </div>
  )
}

export default App
