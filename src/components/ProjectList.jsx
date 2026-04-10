import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import ProjectFormModal from './ProjectFormModal';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isTeacher } = useContext(AuthContext);
  const { addToast } = useToast();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data);
      } catch (err) {
        addToast(err.response?.data?.message || err.response?.data || "Failed to fetch projects.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [addToast, refreshTrigger]);

  if (loading) {
    return (
      <div className="page-container space-y-8 animate-pulse">
        <div className="h-10 w-48 skeleton mb-6"></div>
        <div className="glass-panel overflow-hidden">
           <div className="h-24 border-b border-white/10 skeleton"></div>
           <div className="h-24 skeleton border-b border-white/10"></div>
           <div className="h-24 skeleton"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-3xl font-extrabold text-white">All Projects</h3>
          <p className="mt-2 text-lg text-gray-400">List of all available assignments.</p>
        </div>
        {isTeacher && (
          <button className="btn-primary" onClick={() => setIsProjectModalOpen(true)}>
            Create New Project
          </button>
        )}
      </div>
      <div className="glass-panel overflow-hidden">
        <ul className="divide-y divide-white/10">
          {projects.length === 0 ? (
            <li className="p-8 text-center text-gray-400">No projects available at the moment.</li>
          ) : (
            projects.map((project) => (
              <li key={project.id}>
                <div className="px-6 py-5 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-indigo-400 truncate">{project.title}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900/50 text-green-400 border border-green-500/30">
                        Active
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 sm:flex sm:justify-between items-center">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-400">
                        <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                           <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                           <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        {project.rubrics?.length || 0} rubrics
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-400 sm:mt-0 space-x-6">
                      <p>Due on <span className="text-white font-medium">{new Date(project.deadline).toLocaleDateString()}</span></p>
                      {!isTeacher && (
                         <Link to={`/projects/${project.id}/submit`} className="btn-secondary py-1.5 px-4 text-sm">Submit</Link>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <ProjectFormModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
        onProjectCreated={() => setRefreshTrigger(prev => prev + 1)} 
      />
    </div>
  );
};

export default ProjectList;
