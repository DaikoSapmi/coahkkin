import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MeetingProvider } from './context/MeetingContext';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { PodiumDisplayPage } from './pages/PodiumDisplayPage';
import { LowerThirdOverlayPage } from './pages/LowerThirdOverlayPage';
import { AgendaOverlayPage } from './pages/AgendaOverlayPage';

export function App() {
  return (
    <MeetingProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/display/podium" element={<PodiumDisplayPage />} />
          <Route path="/overlay/lower-third" element={<LowerThirdOverlayPage />} />
          <Route path="/overlay/agenda" element={<AgendaOverlayPage />} />
        </Routes>
      </BrowserRouter>
    </MeetingProvider>
  );
}

export default App;
