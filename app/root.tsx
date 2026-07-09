import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Estilos globales de Tailwind
import './styles/tailwind.css';

// Componentes
import VCardGenerator from './components/vcard-generator';
import LinkGenerator from './components/link-generator';
function Root() {
  return (
    <div className="Root">
      <HashRouter>
        <Routes>
          <Route path="/" element={<VCardGenerator />} />
          <Route path="/generator" element={<LinkGenerator />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

