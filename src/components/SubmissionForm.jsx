import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SubmissionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isTeacher } = useContext(AuthContext);
  const { addToast } = useToast();
  const [project, setProject] = useState(null);
  const [content, setContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(true);

  // Redirect teacher since they don't submit projects
  useEffect(() => {
    if (isTeacher) {
      navigate('/dashboard');
      addToast("Teachers cannot submit projects.", "info");
    }
  }, [isTeacher, navigate, addToast]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        addToast("Failed to load project details", "error");
      } finally {
        setLoading(false);
      }
    };
    if (!isTeacher) fetchProject();
  }, [id, isTeacher, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/submissions', {
        project: { id: parseInt(id) },
        student: { id: user.id },
        content,
        fileUrl
      });
      addToast('Submission successful!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || err.response?.data || 'Failed to submit. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="page-container max-w-3xl animate-pulse">
        <div className="glass-panel p-8">
          <div className="skeleton h-10 w-3/4 mb-4"></div>
          <div className="skeleton h-6 w-1/2 mb-8"></div>
          <div className="space-y-6">
            <div className="skeleton h-24 w-full"></div>
            <div className="skeleton h-12 w-full"></div>
            <div className="skeleton h-12 w-32 ml-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-3xl">
      <div className="glass-panel p-8">
        <h2 className="text-3xl font-extrabold text-white mb-2">{project?.title} - Submission Form</h2>
        <p className="text-gray-400 mb-8 text-lg">{project?.description}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Submission Content</label>
            <div className="mt-1">
              <textarea
                rows={4}
                required
                className="glass-input"
                placeholder="Write your explanation or reflection here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">File URL (Github, Drive, etc)</label>
            <input
              type="url"
              required
              className="glass-input"
              placeholder="https://..."
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-6 border-t border-white/10 mt-4">
            <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary mr-4">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Submit Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmissionForm;
