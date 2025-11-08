import { Header } from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden" style={{ width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
      <div className="flex-1 w-full" style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        <Header />
        <Dashboard />
      </div>
      <Footer />
    </div>
  );
}
