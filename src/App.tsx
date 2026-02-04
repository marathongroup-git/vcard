import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VCardGenerator from './components/VCardGenerator';
import LinkGenerator from './components/LinkGenerator';

import './App.css';

function App() {
  const basename = process.env.NODE_ENV === 'production' ? process.env.PUBLIC_URL : '';

  return (
    <div className="App">
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<VCardGenerator />} />
          <Route path="/vcard" element={<VCardGenerator />} />
          <Route path="/generator" element={<LinkGenerator />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
