import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

import ReportPage from "./pages/ReportPage/ReportPage";
import ChatBotPage from "./pages/ChatBotPage/ChatBotPage";
import DashboardWrapper from "./pages/DashboardPage/DashboardWrapper";
import FirefighterPage from "./pages/FirefighterPage/FirefighterPage";
import WindMap from "./pages/WindMap";
import AllReportsPage from "./pages/AllReportsPage";
import ActiveDispatchPage from "./pages/ActiveDispatchPage.jsx"
import CompletedReportsPage from "./pages/CompletedReportsPage.jsx";
import EmergencyInfoPage from "./pages/EmergencyInfoPage.jsx";
import StationPage from "./pages/StationPage";


// 페이지
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/chatbot" element={<ChatBotPage />} />
        <Route path="/dashboard" element={<DashboardWrapper />} />
        <Route path="/firefighter" element={<FirefighterPage />} />
        <Route path="/fire-risk" element={<WindMap />} />
        <Route path="/reports/all" element={<AllReportsPage />} />
        <Route path="/reports/dispatched" element={<ActiveDispatchPage />} />
        <Route path="/reports/completed" element={<CompletedReportsPage />} />
        <Route path="/settings/hospitals" element={<EmergencyInfoPage />} />
        <Route path="/settings/stations" element={<StationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
