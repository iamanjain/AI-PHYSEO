import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Header />
      <main className="flex-grow bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        {children}
      </main>
      <Footer />
    </div>
  );
}
