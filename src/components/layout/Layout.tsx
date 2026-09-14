import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ToastContainer from '../ui/ToastContainer';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}
