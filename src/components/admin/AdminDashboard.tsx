import React, { useState, useEffect } from 'react';
import { Video } from '../../types';
import { videoService } from '../../services/video.service';
import VideoUploadForm from './VideoUploadForm';
import VideoLinkForm from './VideoLinkForm';
import VideoList from './VideoList';
import Loader from '../common/Loader';

export const AdminDashboard: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');

  const fetchVideos = async () => {
    try {
      const data = await videoService.getAll();
      setVideos(data);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleUploadSuccess = () => {
    fetchVideos();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <div className="flex border-b border-gray-200 mb-4">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'upload'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('upload')}
              >
                Upload File
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'link'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('link')}
              >
                Upload from URL
              </button>
            </div>

            {activeTab === 'upload' ? (
              <VideoUploadForm onSuccess={handleUploadSuccess} />
            ) : (
              <VideoLinkForm onSuccess={handleUploadSuccess} />
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Platform Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Videos:</span>
                <span className="text-2xl font-bold text-primary-600">{videos.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Processed:</span>
                <span className="text-2xl font-bold text-green-600">
                  {videos.filter((v) => v.transcription_status === 'completed').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Processing:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {videos.filter((v) => v.transcription_status === 'processing').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Manage Videos</h3>
        {loading ? (
          <Loader text="Loading videos..." />
        ) : (
          <VideoList videos={videos} onVideoDeleted={fetchVideos} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
