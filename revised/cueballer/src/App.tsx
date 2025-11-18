import './App.css'
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppContent from './components/AppContent';
import PreloadedText from './components/PreloadedText';
import { MyState, INIT_STATE } from './stateTypes';

const App: React.FC = () => {
  const [state, setState] = useState<MyState>(INIT_STATE);
  return (
    <Routes>
      <Route path="/text/:textName" element={<PreloadedText />} />
      <Route path="/cueballer" element={<AppContent state={state} setState={setState} />} />
    </Routes>
  );
};

export default App;
