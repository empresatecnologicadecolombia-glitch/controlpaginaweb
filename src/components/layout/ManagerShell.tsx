import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";

const ManagerShell = () => {
  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      <Navbar />
      <div className="min-h-0 flex-1 overflow-hidden pt-12">
        <Outlet />
      </div>
    </div>
  );
};

export default ManagerShell;
