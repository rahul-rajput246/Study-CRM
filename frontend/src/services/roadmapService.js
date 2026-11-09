import api from './api';

export const roadmapService = {
  // Roadmaps
  getRoadmaps: () => api.get('/roadmaps'),
  getRoadmap: (id) => api.get(`/roadmaps/${id}`),
  createRoadmap: (data) => api.post('/roadmaps', data),
  updateRoadmap: (id, data) => api.put(`/roadmaps/${id}`, data),
  deleteRoadmap: (id) => api.delete(`/roadmaps/${id}`),

  // Phases & Subjects
  createPhase: (roadmapId, data) => api.post(`/roadmaps/${roadmapId}/phases`, data),
  createSubject: (phaseId, data) => api.post(`/phases/${phaseId}/subjects`, data),

  // Topics
  createTopic: (data) => api.post('/topics', data),
  getTopic: (id) => api.get(`/topics/${id}`),
  updateTopic: (id, data) => api.put(`/topics/${id}`, data),
  updateTopicStatus: (id, status) => api.patch(`/topics/${id}/status`, { status }),
  deleteTopic: (id) => api.delete(`/topics/${id}`),

  // Subtopics
  createSubtopic: (topicId, title) => api.post('/subtopics', { topic_id: topicId, title }),
  toggleSubtopic: (id) => api.patch(`/subtopics/${id}/toggle`),
  deleteSubtopic: (id) => api.delete(`/subtopics/${id}`),
};

