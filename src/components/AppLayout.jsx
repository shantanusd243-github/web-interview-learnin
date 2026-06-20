import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Mirrors original showPage()'s window.scrollTo(0,0) and auto-closing the
  // mobile sidebar after navigating.
  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <>
      <Sidebar open={sidebarOpen} />
      <div className="main">
        <Topbar onToggleSidebar={() => setSidebarOpen((o) => !o)} />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </>
  );
}
