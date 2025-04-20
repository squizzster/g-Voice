import React from 'react';
import { Bell } from 'lucide-react';

const GOOGLE_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScXtGHQtCPay_qPV1MOCgV-wYCXDw65ExZw9C842EnuPJXBjg/viewform?usp=dialog';

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Minimal Nav */}
      <nav className="flex justify-between items-center p-6">
        <div className="text-2xl font-bold">g-Voice</div>
      </nav>

      <main className="container mx-auto px-4">
        <div className="text-center mt-24 mb-16">
          <div className="inline-block animate-pulse bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            Coming Soon
          </div>

          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            The Future of Voice AI
          </h1>

          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Something revolutionary is coming. Be the first to experience the next generation of voice technology.
          </p>

          {/* Google Form button */}
          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noopener"
            className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-full inline-flex items-center gap-2 transition-all hover:scale-105"
          >
            <Bell className="w-5 h-5" />
            Notify Me
          </a>

          {/* Teaser Stats */}
          {/* ...rest of your content... */}
        </div>
      </main>
    </div>
  );
};

export default App;
