import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, Transcription, Summary } from '../types';
import { videoService } from '../services/video.service';
import VideoPlayer from '../components/video/VideoPlayer';
import TranscriptDisplay from '../components/video/TranscriptDisplay';
import SummaryPanel from '../components/video/SummaryPanel';
import QuizModal from '../components/quiz/QuizModal';
import VideoEditModal from '../components/video/VideoEditModal';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { ArrowLeft, AlertCircle, Edit } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';

export const VideoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchVideoData = async () => {
      if (!id) return;

      try {
        const videoData = await videoService.getById(parseInt(id));
        setVideo(videoData);

        if (videoData.transcription_status === 'completed') {
          try {
            const transcriptData = await videoService.getTranscript(parseInt(id));
            setTranscription(transcriptData);
          } catch (err) {
            console.error('Failed to fetch transcript:', err);
          }
        }

        if (videoData.summary_status === 'completed') {
          try {
            const summaryData = await videoService.getSummary(parseInt(id));
            setSummary(summaryData);
          } catch (err) {
            console.error('Failed to fetch summary:', err);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [id]);

  const handleVideoEnded = () => {
    // Only show quiz if transcript and summary are completed
    if (video?.transcription_status === 'completed' &&
        video?.summary_status === 'completed') {
      setShowQuiz(true);
    }
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
  };

  const handleEditSuccess = async () => {
    // Refresh video data after edit
    if (!id) return;
    try {
      const videoData = await videoService.getById(parseInt(id));
      setVideo(videoData);
    } catch (err) {
      console.error('Failed to refresh video:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loader text="Loading video..." />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Video Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The video you are looking for does not exist.'}</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="secondary"
        onClick={() => navigate('/')}
        className="mb-6 flex items-center"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Videos
      </Button>

      <div className="space-y-6">
        <div>
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{video.title}</h1>
            {user?.is_admin && (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
          {video.description && (
            <p className="text-gray-600 mb-4">{video.description}</p>
          )}
          <p className="text-sm text-gray-500">Uploaded on {formatDate(video.created_at)}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <VideoPlayer
              url={video.s3_url}
              onProgress={setCurrentTime}
              onEnded={handleVideoEnded}
            />

            {transcription && transcription.segments && transcription.segments.length > 0 && (
              <TranscriptDisplay
                segments={transcription.segments}
                currentTime={currentTime}
              />
            )}

            {video.transcription_status === 'processing' && (
              <div className="card">
                <div className="flex items-center text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                  <p>Transcription in progress...</p>
                </div>
              </div>
            )}

            {video.transcription_status === 'failed' && (
              <div className="card bg-red-50 border-red-200">
                <div className="flex items-center text-red-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <p>Transcription failed. Please contact support.</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {summary && (
              <SummaryPanel
                summaryText={summary.summary_text}
                keyPoints={summary.key_points}
              />
            )}

            {video.summary_status === 'processing' && (
              <div className="card">
                <div className="flex items-center text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                  <p>Summarization in progress...</p>
                </div>
              </div>
            )}

            {video.summary_status === 'failed' && (
              <div className="card bg-red-50 border-red-200">
                <div className="flex items-center text-red-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <p>Summarization failed. Please contact support.</p>
                </div>
              </div>
            )}

            <div className="card">
              <h3 className="font-semibold mb-3">Video Information</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Upload Type:</dt>
                  <dd className="font-medium capitalize">{video.upload_type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Compression:</dt>
                  <dd className="font-medium capitalize">{video.compression_status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Transcription:</dt>
                  <dd className="font-medium capitalize">{video.transcription_status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Summary:</dt>
                  <dd className="font-medium capitalize">{video.summary_status}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {showQuiz && video && (
        <QuizModal
          videoId={video.id}
          isOpen={showQuiz}
          onClose={handleCloseQuiz}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && video && (
        <VideoEditModal
          video={video}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default VideoDetailPage;
