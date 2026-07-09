import { HashRouter, Routes, Route } from 'react-router-dom';
import VCardGenerator from './components/vcard-generator';
import LinkGenerator from './components/link-generator';


function App() {
  return (
    <div className="App">
      <HashRouter>
        <Routes>
          <Route path="/" element={<VCardGenerator />} />
          <Route path="/generator" element={<LinkGenerator />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;