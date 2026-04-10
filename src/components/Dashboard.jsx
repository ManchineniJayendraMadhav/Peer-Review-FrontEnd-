import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProjectFormModal from './ProjectFormModal';

const Dashboard = () => {
  const { user, isTeacher } = useContext(AuthContext);
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projRes, subRes] = await Promise.all([
          api.get('/projects'),
          api.get('/submissions')
        ]);
        setProjects(projRes.data);
        
        if (isTeacher) {
          setSubmissions(subRes.data);
        } else {
          const peerSubs = subRes.data.filter(s => s.student?.id !== user?.id);
          setSubmissions(peerSubs);
        }
      } catch (err) {
        let msg = err.response?.data?.message || err.response?.data || "Failed to load dashboard data";
        if (typeof msg !== 'string') msg = "Failed to load dashboard data";
        addToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user, isTeacher, addToast, refreshTrigger]);

  if (loading) {
    return (
      <div className="page-container space-y-12 animate-pulse">
         <div className="skeleton h-32 w-full"></div>
         <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(i => <div key={i} className="skeleton h-48 w-full"></div>)}
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 page-container animate-fade-in-up">
      <div className="glass-panel p-8">
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Welcome back, <span className="text-gradient">{user.username}</span>!</h2>
        <p className="text-gray-400 text-lg">
           {isTeacher ? "Monitor all projects and platform submissions." : "Track your upcoming projects and pending peer reviews."}
        </p>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-2 flex-grow">
          Projects
        </h3>
        {isTeacher && (
          <button 
            className="btn-primary ml-4 mb-6" 
            onClick={() => setIsProjectModalOpen(true)}
          >
            + Create New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-400 glass-panel">No projects available.</div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="glass-panel overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3">{project.title}</h3>
                <div className="mt-2 text-sm text-gray-400 line-clamp-3 leading-relaxed">
                  <p>{project.description}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                   <span className="text-xs font-medium text-indigo-300 bg-indigo-900/50 px-3 py-1 rounded-full">Due: {new Date(project.deadline).toLocaleDateString()}</span>
                   <Link to={`/projects/${project.id}/submit`} className="text-sm font-semibold text-white hover:text-indigo-400 transition-colors">
                    View Details &rarr;
                   </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div>
        <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-2">
          {isTeacher ? "All Submissions" : "Pending Peer Reviews"}
        </h3>
        {submissions.length === 0 ? (
          <p className="text-gray-400 glass-panel p-4 text-center">No submissions available right now.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {submissions.map(sub => (
              <div key={sub.id} className="glass-panel p-6 flex flex-col justify-between">
                 <div>
                   <div className="flex justify-between items-start mb-2">
                     <h4 className="font-bold text-indigo-400 text-lg line-clamp-1">{sub.project?.title}</h4>
                     <span className="text-xs font-semibold px-2 py-1 bg-white/10 rounded-full text-gray-300 shrink-0">
                       Sub #{sub.id}
                     </span>
                   </div>
                   <p className="text-sm text-gray-400 mb-4">By: <span className="text-white">{sub.student?.username}</span></p>
                   <p className="text-sm text-gray-300 line-clamp-2 mb-6">"{sub.content}"</p>
                 </div>
                 
                 <Link to={`/projects/${sub.project?.id}/review/${sub.id}`} className="btn-primary w-full text-sm py-2 text-center">
                   {isTeacher ? "Grade Submission" : "Provide Feedback"}
                 </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProjectFormModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
        onProjectCreated={() => setRefreshTrigger(prev => prev + 1)} 
      />
    </div>
  );
};

export default Dashboard;
