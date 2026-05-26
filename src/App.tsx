import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import ManagerShell from "@/components/layout/ManagerShell";
import DashboardPage from "./pages/DashboardPage.tsx";
import ManagerHomePage from "./pages/ManagerHomePage.tsx";
import UsuariosPage from "./pages/UsuariosPage.tsx";
import ConciertosPage from "./pages/ConciertosPage.tsx";
import ChatPage from "./pages/ChatPage.tsx";
import StreamingPage from "./pages/StreamingPage.tsx";
import ModeracionPage from "./pages/ModeracionPage.tsx";
import LogsPage from "./pages/LogsPage.tsx";
import ConfigPage from "./pages/ConfigPage.tsx";
import AnalyticsPage from "./pages/AnalyticsPage.tsx";

const App = () => (
  <>
    <Toaster />
    <BrowserRouter>
      <Routes>
        <Route element={<ManagerShell />}>
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="/inicio" element={<ManagerHomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/conciertos" element={<ConciertosPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/streaming" element={<StreamingPage />} />
          <Route path="/moderacion" element={<ModeracionPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/login" element={<Navigate to="/inicio" replace />} />
          <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </>
);

export default App;
