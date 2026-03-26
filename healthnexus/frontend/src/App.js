import React, { useEffect } from 'react';
import { BrowserRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import About from './pages/About';
import BookAppointment from './pages/BookAppointment';
import CareDesk from './pages/CareDesk';
import Contact from './pages/Contact';
import Departments from './pages/Departments';
import FindDoctors from './pages/FindDoctors';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const SiteLayout = () => {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ToastContainer autoClose={3200} position="top-right" />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route element={<Home />} path="/" />
          <Route element={<Departments />} path="/departments" />
          <Route element={<FindDoctors />} path="/doctors" />
          <Route element={<BookAppointment />} path="/appointments" />
          <Route element={<CareDesk />} path="/care-desk" />
          <Route element={<About />} path="/about" />
          <Route element={<Contact />} path="/contact" />
          <Route element={<NotFound />} path="*" />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
