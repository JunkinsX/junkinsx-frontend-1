import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreatePipeline from './pages/CreatePipeline';
import PipelineDetails from './pages/PipelineDetails';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreatePipeline />} />
            <Route path="/pipeline/:id" element={<PipelineDetails />} />
          </Routes>
        </main>
        
        {/* Simple Footer */}
        <footer className="py-12 px-4 border-t border-zinc-200 dark:border-zinc-800 mt-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-md" />
              <span className="font-bold text-zinc-400">JunkinsX CI/CD</span>
            </div>
            <p className="text-sm text-zinc-500">
              Built with React, Tailwind CSS, and passion for automation.
            </p>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <a href="#" className="hover:text-blue-500 transition-colors">Documentation</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Support</a>
              <a href="#" className="hover:text-blue-500 transition-colors">API</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
