import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Logo } from '../components/ui/Misc';

export default function PublicLayout() {
  return (
    <div className="public">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Outlet />
      </main>
      <footer className="public-footer">
        <div className="public-footer-inner">
          <Logo />
          <p>Plan projects, organize tasks and keep every deadline within reach.</p>
        </div>
      </footer>
    </div>
  );
}
