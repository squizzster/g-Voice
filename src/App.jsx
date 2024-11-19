import React from 'react';
import { Bell } from 'lucide-react';

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

          {/* Email Signup Form - Netlify Forms Compatible */}
          <form 
            name="signup"
            method="POST"
            className="max-w-md mx-auto mb-16"
			netlify
          >
            <input type="hidden" name="form-name" value="signup" />
            
            <div className="flex gap-2">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-full bg-slate-800/50 border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button 
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-full font-semibold inline-flex items-center gap-2 transition-all hover:scale-105"
              >
                Notify Me <Bell className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Teaser Stats */}
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto my-16">
            <div className="bg-slate-800/50 p-8 rounded-xl backdrop-blur-sm">
              <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                2024
              </div>
              <div className="text-slate-400">Launch Date</div>
            </div>
            
            <div className="bg-slate-800/50 p-8 rounded-xl backdrop-blur-sm">
              <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Global
              </div>
              <div className="text-slate-400">Availability</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 w-full border-t border-slate-700 py-8 text-slate-400 text-center">
        <p>© 2024 g-Voice. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
