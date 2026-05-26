import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import ManagerHomePage from "./pages/ManagerHomePage.tsx";

const App = () => (
  <>
    <Toaster />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ManagerHomePage />} />
        <Route path="*" element={<ManagerHomePage />} />
      </Routes>
    </BrowserRouter>
  </>
);

export default App;
