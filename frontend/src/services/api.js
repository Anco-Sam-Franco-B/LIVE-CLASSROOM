import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          localStorage.setItem('accessToken', data.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  verifyTwoFactor: (data) => api.post('/auth/verify-2fa', data),
  enableTwoFactor: () => api.post('/auth/enable-2fa'),
  disableTwoFactor: () => api.post('/auth/disable-2fa'),
  sendTwoFactorCode: () => api.post('/auth/send-2fa-code'),
  getSessions: () => api.get('/auth/sessions'),
  revokeSession: (id) => api.delete(`/auth/sessions/${id}`),
  getLoginHistory: () => api.get('/auth/login-history'),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updateAvatar: (data) => api.put('/users/avatar', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  lockUser: (id, data) => api.post(`/users/${id}/lock`, data),
  unlockUser: (id) => api.post(`/users/${id}/unlock`),
  getTeachers: () => api.get('/users/teachers'),
  createUser: (data) => api.post('/users', data),
  getLinkedStudents: () => api.get('/users/parent/students'),
  linkStudent: (data) => api.post('/users/parent/link-student', data),
};

// Courses API
export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  getBySlug: (slug) => api.get(`/courses/${slug}/slug`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  publish: (id) => api.post(`/courses/${id}/publish`),
  uploadThumbnail: (id, data) => api.post(`/courses/${id}/thumbnail`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  enroll: (courseId) => api.post('/courses/enroll', { courseId }),
  getMyCourses: (params) => api.get('/courses/my', { params }),
  getTeacherCourses: () => api.get('/courses/teacher'),
  getCourseLessons: (courseId) => api.get(`/courses/${courseId}/lessons`),
  getCourseStudents: (courseId) => api.get(`/courses/${courseId}/students`),
  getCourseProgress: (courseId) => api.get(`/courses/${courseId}/progress`),
  updateProgress: (data) => api.post('/courses/progress', data),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Modules API
export const modulesAPI = {
  getAll: (params) => api.get('/modules', { params }),
  getById: (id) => api.get(`/modules/${id}`),
  create: (data) => api.post('/modules', data),
  update: (id, data) => api.put(`/modules/${id}`, data),
  delete: (id) => api.delete(`/modules/${id}`),
  reorder: (moduleIds) => api.post('/modules/reorder', { moduleIds }),
};

// Lessons API
export const lessonsAPI = {
  getById: (id) => api.get(`/lessons/${id}`),
  create: (data) => api.post('/lessons', data),
  update: (id, data) => api.put(`/lessons/${id}`, data),
  delete: (id) => api.delete(`/lessons/${id}`),
  reorder: (lessonIds) => api.post('/lessons/reorder', { lessonIds }),
  uploadVideo: (id, data) => api.post(`/lessons/${id}/video`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadPdf: (id, data) => api.post(`/lessons/${id}/pdf`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Assignments API
export const assignmentsAPI = {
  getAll: (params) => api.get('/assignments', { params }),
  getById: (id) => api.get(`/assignments/${id}`),
  create: (data) => api.post('/assignments', data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
  submit: (data) => api.post('/submissions', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getSubmissions: (assignmentId) => api.get(`/submissions/assignment/${assignmentId}`),
  getSubmissionById: (id) => api.get(`/submissions/${id}`),
  updateSubmission: (id, data) => api.put(`/submissions/${id}`, data),
  deleteSubmission: (id) => api.delete(`/submissions/${id}`),
  gradeSubmission: (submissionId, data) => api.put(`/submissions/${submissionId}/grade`, data),
};

// Quizzes API
export const quizzesAPI = {
  getAll: (params) => api.get('/quizzes', { params }),
  getById: (id) => api.get(`/quizzes/${id}`),
  create: (data) => api.post('/quizzes', data),
  update: (id, data) => api.put(`/quizzes/${id}`, data),
  delete: (id) => api.delete(`/quizzes/${id}`),
  getQuestions: (params) => api.get('/quizzes/questions', { params }),
  getQuestionById: (id) => api.get(`/quizzes/questions/${id}`),
  addQuestion: (data) => api.post('/quizzes/questions', data),
  updateQuestion: (id, data) => api.put(`/quizzes/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/quizzes/questions/${id}`),
  getAttempts: (params) => api.get('/quizzes/attempts', { params }),
  startAttempt: (quizId) => api.post('/quizzes/start', { quizId }),
  submitAttempt: (data) => api.post('/quizzes/submit', data),
  getResults: (attemptId) => api.get(`/quizzes/results/${attemptId}`),
};

// Meetings API
export const meetingsAPI = {
  getAll: (params) => api.get('/meetings', { params }),
  getById: (id) => api.get(`/meetings/${id}`),
  create: (data) => api.post('/meetings', data),
  update: (id, data) => api.put(`/meetings/${id}`, data),
  delete: (id) => api.delete(`/meetings/${id}`),
  join: (meetingId) => api.post(`/meetings/${meetingId}/join`),
  leave: (meetingId) => api.post(`/meetings/${meetingId}/leave`),
  getLiveKitToken: (id) => api.get(`/livekit/token/${id}`),
  getAttendance: (meetingId) => api.get(`/meetings/${meetingId}/attendance`),
  markAttendance: (meetingId, data) => api.post(`/meetings/${meetingId}/attendance`, data),
};

// Payments API
export const paymentsAPI = {
  mtn: (data) => api.post('/payments/mtn', data),
  airtel: (data) => api.post('/payments/airtel', data),
  getStatus: (id) => api.get(`/payments/status/${id}`),
  getHistory: (params) => api.get('/payments/history', { params }),
  getAll: (params) => api.get('/payments', { params }),
  verify: (id) => api.post(`/payments/${id}/verify`),
  manualVerify: (id) => api.post(`/payments/${id}/manual-verify`),
  refund: (id, data) => api.post(`/payments/${id}/refund`, data),
  delete: (id) => api.delete(`/payments/${id}`),
  retry: (id) => api.post(`/payments/${id}/retry`),
  getMtnBalance: () => api.get('/payments/mtn/balance'),
  getReceipt: (id) => api.get(`/payments/receipt/${id}`),
  getInvoice: (id) => api.get(`/payments/invoice/${id}`),
  sendReceiptEmail: (id) => api.post(`/payments/receipt/${id}/send`),
  getStats: () => api.get('/payments/stats'),
};

// Messages API
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  createConversation: (data) => api.post('/messages/conversations', data),
  getMessages: (conversationId, params) => api.get(`/messages/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, data) => api.post(`/messages/conversations/${conversationId}/messages`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  markRead: (conversationId) => api.post(`/messages/conversations/${conversationId}/read`),
  deleteConversation: (conversationId) => api.delete(`/messages/conversations/${conversationId}`),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Certificates API
export const certificatesAPI = {
  getAll: (params) => api.get('/certificates', { params }),
  getMy: () => api.get('/certificates/my'),
  getByNumber: (number) => api.get(`/certificates/${number}`),
  verify: (number) => api.get(`/certificates/verify/${number}`),
  issue: (data) => api.post('/certificates/issue', data),
  revoke: (id) => api.delete(`/certificates/${id}`),
};

// Reports API
export const reportsAPI = {
  dashboard: () => api.get('/reports/dashboard'),
  student: (studentId) => api.get(`/reports/student/${studentId || ''}`),
  teacher: (teacherId) => api.get(`/reports/teacher/${teacherId || ''}`),
  revenue: (params) => api.get('/reports/revenue', { params }),
  attendance: (params) => api.get('/reports/attendance', { params }),
  enrollments: (params) => api.get('/reports/enrollments', { params }),
};

// Admin API
export const adminAPI = {
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getRoles: () => api.get('/admin/roles'),
  getRoleById: (id) => api.get(`/admin/roles/${id}`),
  createRole: (data) => api.post('/admin/roles', data),
  updateRole: (id, data) => api.put(`/admin/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/admin/roles/${id}`),
  updateRolePermissions: (id, permissionIds) => api.put(`/admin/roles/${id}/permissions`, { permissionIds }),
  getPermissions: () => api.get('/admin/permissions'),
  createPermission: (data) => api.post('/admin/permissions', data),
  updatePermission: (id, data) => api.put(`/admin/permissions/${id}`, data),
  deletePermission: (id) => api.delete(`/admin/permissions/${id}`),
  assignUserRole: (userId, roleId) => api.put(`/users/${userId}`, { roleId }),
};

// Grades API
export const gradesAPI = {
  getAll: (params) => api.get('/grades', { params }),
  getByStudent: (studentId) => api.get(`/grades/student/${studentId || ''}`),
  getById: (id) => api.get(`/grades/${id}`),
  create: (data) => api.post('/grades', data),
  update: (id, data) => api.put(`/grades/${id}`, data),
  delete: (id) => api.delete(`/grades/${id}`),
};

// Attendance API
export const attendanceAPI = {
  mark: (data) => api.post('/attendance', data),
  getAll: (params) => api.get('/attendance', { params }),
  getMy: () => api.get('/attendance/my'),
  getById: (id) => api.get(`/attendance/${id}`),
  delete: (id) => api.delete(`/attendance/${id}`),
};

// Certificate Templates API
export const certificateTemplatesAPI = {
  getAll: (params) => api.get('/certificate-templates', { params }),
  getById: (id) => api.get(`/certificate-templates/${id}`),
  create: (data) => api.post('/certificate-templates', data),
  update: (id, data) => api.put(`/certificate-templates/${id}`, data),
  delete: (id) => api.delete(`/certificate-templates/${id}`),
};

// Announcements API
export const announcementsAPI = {
  getAll: (params) => api.get('/announcements', { params }),
  getById: (id) => api.get(`/announcements/${id}`),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
  markRead: (id) => api.post(`/announcements/${id}/read`),
};

// Enrollments API
export const enrollmentsAPI = {
  getAll: (params) => api.get('/enrollments', { params }),
  getById: (id) => api.get(`/enrollments/${id}`),
  update: (id, data) => api.put(`/enrollments/${id}`, data),
  delete: (id) => api.delete(`/enrollments/${id}`),
};

// Progress API
export const progressAPI = {
  create: (data) => api.post('/progress', data),
  getById: (id) => api.get(`/progress/${id}`),
  update: (id, data) => api.put(`/progress/${id}`, data),
  delete: (id) => api.delete(`/progress/${id}`),
};

// Reviews API
export const reviewsAPI = {
  getByCourse: (courseId) => api.get(`/reviews/course/${courseId}`),
  getById: (id) => api.get(`/reviews/${id}`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// Transactions API
export const transactionsAPI = {
  getMy: () => api.get('/transactions'),
  getAll: () => api.get('/transactions/all'),
  getById: (id) => api.get(`/transactions/${id}`),
};

// Subscriptions API
export const subscriptionsAPI = {
  getMy: () => api.get('/subscriptions'),
  getById: (id) => api.get(`/subscriptions/${id}`),
  create: (data) => api.post('/subscriptions', data),
  update: (id, data) => api.put(`/subscriptions/${id}`, data),
  cancel: (id) => api.delete(`/subscriptions/${id}`),
};

// CMS API
export const cmsAPI = {
  getAll: () => api.get('/cms'),
  getPage: (page) => api.get(`/cms/${page}`),
  updateSection: (page, section, content) => api.put(`/cms/${page}/${section}`, { content }),
  toggleSection: (page, section) => api.patch(`/cms/${page}/${section}/toggle`),
  resetSection: (page, section) => api.delete(`/cms/${page}/${section}`),
  getPublic: (page) => api.get(`/cms/public/${page}`),
};

// Invoices API
export const invoicesAPI = {
  getMy: () => api.get('/invoices'),
  getAll: () => api.get('/invoices/all'),
  getById: (id) => api.get(`/invoices/${id}`),
};

export default api;
