const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.PROD ? '' : 'http://localhost:8000');

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getToken() {
    return localStorage.getItem('cyber_auth_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('cyber_auth_token', token);
    } else {
      localStorage.removeItem('cyber_auth_token');
    }
  }

  getImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${this.baseUrl}${url}`;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      ...options.headers,
    };

    // Only set Content-Type to application/json if not FormData
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Unauthorized - session expired or invalid
        this.setToken(null);
        localStorage.removeItem('cyber_auth_user');
        window.dispatchEvent(new CustomEvent('cyber:unauthorized'));
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Authentication required or session expired.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(errorData.detail || `Server returned error status ${response.status}`);
      }

      // 204 No Content
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  }

  // --- AUTH & SUPERADMIN PROFILE ENDPOINTS ---
  async login(username, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setToken(data.access_token);
    localStorage.setItem('cyber_auth_user', JSON.stringify(data.user));
    return data;
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore network errors on logout
    } finally {
      this.setToken(null);
      localStorage.removeItem('cyber_auth_user');
    }
  }

  async getMe() {
    return await this.request('/api/auth/me');
  }

  async updateProfile(data) {
    const res = await this.request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (res.access_token) {
      this.setToken(res.access_token);
      localStorage.setItem('cyber_auth_user', JSON.stringify({
        username: res.username,
        role: res.role || 'superadmin'
      }));
    }
    return res;
  }

  async changePassword(data) {
    return await this.request('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- DATABASE BACKUP & SNAPSHOT ENDPOINTS ---
  async createBackupSnapshot() {
    return await this.request('/api/admin/backup-now?mode=json', {
      method: 'GET',
    });
  }

  triggerFileDownload(downloadPath, filename) {
    const token = this.getToken();
    const separator = downloadPath.includes('?') ? '&' : '?';
    const fullUrl = `${this.baseUrl}${downloadPath}${token ? `${separator}token=${encodeURIComponent(token)}` : ''}`;

    const link = document.createElement('a');
    link.href = fullUrl;
    if (filename) {
      link.setAttribute('download', filename);
    }
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 500);
  }

  async downloadBackup() {
    // 1. Call GET /api/admin/backup-now?mode=json with JWT header.
    // Standard JSON fetch completes cleanly and is never intercepted mid-stream by IDM or download managers.
    const data = await this.createBackupSnapshot();
    const filename = data.filename || `portfolio_snapshot_${new Date().toISOString().replace(/[:.]/g, '')}.db.gz`;
    const size = data.size_bytes || 0;
    const downloadUrl = data.download_url || `/api/admin/backups/${filename}/download`;

    // 2. Trigger the file download cleanly via a hidden anchor tag with token parameter.
    this.triggerFileDownload(downloadUrl, filename);

    return {
      filename,
      size,
      download_url: downloadUrl,
      status: data.status || 'ok'
    };
  }

  async getBackupStats() {
    return await this.request('/api/admin/backup-stats');
  }

  // --- STATS ENDPOINT ---
  async getStats() {
    return await this.request('/api/stats');
  }

  // --- MEDIA UPLOAD ENDPOINT ---
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    return await this.request('/api/upload', {
      method: 'POST',
      body: formData,
    });
  }

  // --- PROJECTS ENDPOINTS ---
  async getProjects(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.published !== undefined && params.published !== null) {
      query.append('published_only', params.published);
    }
    const qStr = query.toString();
    return await this.request(`/api/projects${qStr ? `?${qStr}` : ''}`);
  }

  async getPublishedProjects() {
    return await this.request('/api/projects?published_only=true');
  }

  async getProject(id) {
    return await this.request(`/api/projects/${id}`);
  }

  async createProject(data) {
    return await this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id, data) {
    return await this.request(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async reorderProjects(items) {
    return await this.request('/api/projects/reorder', {
      method: 'POST',
      body: JSON.stringify(items),
    });
  }

  async toggleProjectStatus(id) {
    return await this.request(`/api/projects/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async deleteProject(id) {
    if (!id && id !== 0) {
      throw new Error('Project ID is required for purge operation.');
    }
    return await this.request(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // --- INQUIRIES ENDPOINTS ---
  async getInquiries(params = {}) {
    const query = new URLSearchParams();
    if (params.unreadOnly) query.append('unread_only', 'true');
    const qStr = query.toString();
    return await this.request(`/api/inquiries${qStr ? `?${qStr}` : ''}`);
  }

  async createInquiry(data) {
    return await this.request('/api/inquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitInquiry(data) {
    return await this.request('/api/inquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async toggleInquiryRead(id) {
    return await this.request(`/api/inquiries/${id}/read`, {
      method: 'PATCH',
    });
  }

  async deleteInquiry(id) {
    return await this.request(`/api/inquiries/${id}`, {
      method: 'DELETE',
    });
  }

  async replyToInquiry(id, data) {
    return await this.request(`/api/inquiries/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- TELEMETRY & AUDIENCE INTELLIGENCE ENDPOINTS ---
  async recordVisit(data) {
    try {
      return await this.request('/api/telemetry/visit', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (e) {
      // Telemetry ingestion is silent and non-blocking
      console.warn('Telemetry packet dispatch deferred:', e.message);
      return null;
    }
  }

  async sendHeartbeat(sessionId, durationSeconds) {
    try {
      return await this.request('/api/telemetry/heartbeat', {
        method: 'POST',
        body: JSON.stringify({
          session_id: sessionId,
          duration_seconds: durationSeconds,
        }),
      });
    } catch (e) {
      // Silent non-blocking heartbeat
      return null;
    }
  }

  async getTelemetryOverview() {
    return await this.request('/api/telemetry/overview');
  }

  async getTelemetrySources() {
    return await this.request('/api/telemetry/sources');
  }

  async getTelemetryLocations() {
    return await this.request('/api/telemetry/locations');
  }

  async getTelemetryDevices() {
    return await this.request('/api/telemetry/devices');
  }

  async getTelemetryLive(limit = 20) {
    return await this.request(`/api/telemetry/live?limit=${limit}`);
  }

  async purgeTelemetry() {
    return await this.request('/api/telemetry/purge', {
      method: 'DELETE',
    });
  }

  // --- Dynamic Social & Freelance Links ---
  async getPublicSocialLinks() {
    return await this.request('/api/social-links?active_only=true');
  }

  async getAllSocialLinks() {
    return await this.request('/api/social-links');
  }

  async createSocialLink(data) {
    return await this.request('/api/social-links', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSocialLink(id, data) {
    return await this.request(`/api/social-links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleSocialLinkStatus(id) {
    return await this.request(`/api/social-links/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async reorderSocialLinks(items) {
    return await this.request('/api/social-links/reorder', {
      method: 'PUT',
      body: JSON.stringify(items),
    });
  }

  async deleteSocialLink(id) {
    return await this.request(`/api/social-links/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Dynamic Capabilities & Value Propositions ---
  async getPublicCapabilities() {
    return await this.request('/api/capabilities?active_only=true');
  }

  async getAllCapabilities() {
    return await this.request('/api/capabilities');
  }

  async createCapability(data) {
    return await this.request('/api/capabilities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCapability(id, data) {
    return await this.request(`/api/capabilities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleCapabilityStatus(id) {
    return await this.request(`/api/capabilities/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async reorderCapabilities(items) {
    return await this.request('/api/capabilities/reorder', {
      method: 'PUT',
      body: JSON.stringify(items),
    });
  }

  async deleteCapability(id) {
    return await this.request(`/api/capabilities/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Dynamic Tech Stack & Skills Engine ---
  async getPublicTechStack() {
    return await this.request('/api/tech-stack?active_only=true');
  }

  async getAllTechStack() {
    return await this.request('/api/tech-stack');
  }

  async createStackCategory(data) {
    return await this.request('/api/tech-stack/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStackCategory(id, data) {
    return await this.request(`/api/tech-stack/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleStackCategoryStatus(id) {
    return await this.request(`/api/tech-stack/categories/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async reorderStackCategories(items) {
    return await this.request('/api/tech-stack/categories/reorder', {
      method: 'PUT',
      body: JSON.stringify(items),
    });
  }

  async deleteStackCategory(id) {
    return await this.request(`/api/tech-stack/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async createStackItem(data) {
    return await this.request('/api/tech-stack/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStackItem(id, data) {
    return await this.request(`/api/tech-stack/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleStackItemStatus(id) {
    return await this.request(`/api/tech-stack/items/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async reorderStackItems(items) {
    return await this.request('/api/tech-stack/items/reorder', {
      method: 'PUT',
      body: JSON.stringify(items),
    });
  }

  async deleteStackItem(id) {
    return await this.request(`/api/tech-stack/items/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Dynamic Contact & Availability Matrix ---
  async getPublicContactMatrix() {
    return await this.request('/api/contact-matrix');
  }

  async updateContactMatrix(data) {
    return await this.request('/api/contact-matrix', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- Dynamic Production Metrics & Impact Telemetry ---
  async getPublicMetrics() {
    return await this.request('/api/metrics');
  }

  async getAdminMetrics() {
    return await this.request('/api/admin/metrics');
  }

  async createMetric(data) {
    return await this.request('/api/metrics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMetric(id, data) {
    return await this.request(`/api/metrics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleMetricStatus(id) {
    return await this.request(`/api/metrics/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async reorderMetrics(items) {
    return await this.request('/api/metrics/reorder', {
      method: 'PUT',
      body: JSON.stringify(items),
    });
  }

  async deleteMetric(id) {
    return await this.request(`/api/metrics/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Dynamic Client Testimonials & Verified Reviews ---
  async getPublicTestimonials() {
    return await this.request('/api/testimonials');
  }

  async getAdminTestimonials() {
    return await this.request('/api/admin/testimonials');
  }

  async createTestimonial(data) {
    return await this.request('/api/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTestimonial(id, data) {
    return await this.request(`/api/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleTestimonialStatus(id) {
    return await this.request(`/api/testimonials/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async reorderTestimonials(items) {
    return await this.request('/api/testimonials/reorder', {
      method: 'PUT',
      body: JSON.stringify(items),
    });
  }

  async deleteTestimonial(id) {
    return await this.request(`/api/testimonials/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Dynamic Engagement Models ("How We Work") ---
  async getPublicEngagements() {
    return await this.request('/api/engagements');
  }

  async getAdminEngagements() {
    return await this.request('/api/admin/engagements');
  }

  async createEngagement(data) {
    return await this.request('/api/engagements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEngagement(id, data) {
    return await this.request(`/api/engagements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleEngagementStatus(id) {
    return await this.request(`/api/engagements/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async reorderEngagements(items) {
    return await this.request('/api/engagements/reorder', {
      method: 'PUT',
      body: JSON.stringify(items),
    });
  }

  async deleteEngagement(id) {
    return await this.request(`/api/engagements/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
export default api;
