import React, { useContext } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import SubmissionForm from './components/SubmissionForm';
import PeerReview from './components/PeerReview';
import { ToastProvider } from './context/ToastContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen">
        {user && (
        <nav className="bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">PeerCollab</h1>
                </div>
                <div className="hidden md:ml-6 md:flex md:space-x-8">
                  <Link to="/dashboard" className="text-gray-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-md text-sm font-medium transition-colors">Dashboard</Link>
                  <Link to="/projects" className="text-gray-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-md text-sm font-medium transition-colors">Projects</Link>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-gray-300 mr-4 text-sm">Hello, <span className="font-semibold text-white">{user.username}</span></span>
                <button onClick={logout} className="text-red-400 hover:text-red-300 hover:bg-red-900/30 px-3 py-2 rounded-md font-medium text-sm transition-colors">Logout</button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className="flex-1 w-full block">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><ProjectList /></ProtectedRoute>} />
          <Route path="/projects/:id/submit" element={<ProtectedRoute><SubmissionForm /></ProtectedRoute>} />
          <Route path="/projects/:id/review/:submissionId" element={<ProtectedRoute><PeerReview /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
    </ToastProvider>
  );
};

export default App;
