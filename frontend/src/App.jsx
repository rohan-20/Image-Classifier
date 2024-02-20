import React from 'react';
import UploadImage from './components/UploadImage';
import AllImages from './components/AllImages';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<UploadImage />} />
        <Route path='/all-images' element={<AllImages />} />
      </Routes>
    </Router>
  )
}

export default App;