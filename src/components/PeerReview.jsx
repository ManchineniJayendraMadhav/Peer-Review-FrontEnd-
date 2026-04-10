import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PeerReview = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { user, isTeacher } = useContext(AuthContext);
  const { addToast } = useToast();
  const [submission, setSubmission] = useState(null);
  const [comments, setComments] = useState('');
  const [rubricScores, setRubricScores] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await api.get(`/submissions/${submissionId}`);
        setSubmission(res.data);
      } catch (err) {
        addToast("Failed to load submission details", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [submissionId, addToast]);

  const handleScoreChange = (rubricId, value, maxScore) => {
    let score = parseInt(value);
    if (isNaN(score)) score = 0;
    if (score > maxScore) score = maxScore;
    if (score < 0) score = 0;
    setRubricScores(prev => ({ ...prev, [rubricId]: score }));
  };

  const calculatedTotal = submission?.project?.rubrics?.reduce((sum, r) => sum + (rubricScores[r.id] || 0), 0) || 0;
  const maxPossible = submission?.project?.rubrics?.reduce((sum, r) => sum + r.maxScore, 0) || 0;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const payloadScores = Object.entries(rubricScores).map(([rubricId, score]) => ({
        rubric: { id: parseInt(rubricId) },
        score: parseInt(score)
      }));

      // Validate all rubrics are scored
      if (isTeacher && payloadScores.length !== submission.project.rubrics.length) {
         addToast('Please provide a score for all rubric criteria.', 'error');
         return;
      }

      await api.post('/feedbacks', {
        submission: { id: parseInt(submissionId) },
        reviewer: { id: user.id },
        comments,
        rubricScores: isTeacher ? payloadScores : []
      });
      addToast('Review submitted successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || err.response?.data || 'Failed to submit feedback. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="page-container grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
        <div className="glass-panel p-8 h-[300px] skeleton"></div>
        <div className="glass-panel p-8 h-[500px] skeleton"></div>
      </div>
    );
  }

  if (!submission) return <div className="page-container text-center text-gray-400">Submission not found.</div>;

  return (
    <div className="page-container grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Submission Details */}
      <div className="glass-panel p-8 h-fit">
        <h2 className="text-2xl font-bold text-white mb-4">Submission Details</h2>
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Profile</p>
          <p className="text-indigo-400 font-medium text-lg mt-1">{submission.student?.fullName || submission.student?.username}</p>
        </div>
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Content Reflection</p>
          <div className="bg-black/30 p-4 rounded-xl mt-2 border border-white/5 text-sm text-gray-300 whitespace-pre-wrap">
            {submission.content}
          </div>
        </div>
        <div className="mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Project Asset Url</p>
          <a href={submission.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 underline break-all">
            {submission.fileUrl}
          </a>
        </div>
      </div>

      {/* Review Form */}
      <div className="glass-panel p-8">
        <h2 className="text-2xl font-bold text-white mb-6 transform -rotate-1 origin-bottom-left inline-block pb-1 border-b-2 border-purple-500">Provide Evaluation</h2>
        <form onSubmit={handleSubmitReview} className="space-y-6">
          
          {isTeacher && (
            <>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-300 border-b border-white/10 pb-2">Grading Rubric</h4>
                {submission.project?.rubrics?.map((rubric) => (
                  <div key={rubric.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
                    <span className="text-sm font-medium text-gray-200 mb-2 sm:mb-0">{rubric.criteria} <span className="text-xs text-gray-500 ml-1">(Max {rubric.maxScore})</span></span>
                    <input
                      type="number"
                      min="0"
                      max={rubric.maxScore}
                      required
                      placeholder="Score"
                      className="glass-input !py-1 !px-3 !w-24 text-center text-lg"
                      value={rubricScores[rubric.id] || ''}
                      onChange={(e) => handleScoreChange(rubric.id, e.target.value, rubric.maxScore)}
                    />
                  </div>
                ))}
              </div>

              <div className="py-2 flex items-center justify-between px-2">
                <span className="text-lg font-bold text-gray-300">Calculated Total</span>
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">{calculatedTotal} <span className="text-lg text-gray-500">/ {maxPossible}</span></span>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Constructive Feedback</label>
            <textarea
              rows={4}
              required
              className="glass-input"
              placeholder="Provide constructive feedback explaining the rationale for the scores..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>

          <div className="pt-6 mt-4">
            <button type="submit" className="w-full btn-primary py-4 text-lg">
              Submit Final Evaluation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PeerReview;
