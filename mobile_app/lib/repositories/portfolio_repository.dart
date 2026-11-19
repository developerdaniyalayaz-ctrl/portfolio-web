import 'dart:convert';
import 'dart:io';
import '../core/network/api_client.dart';
import '../core/storage/token_storage.dart';
import '../models/project_model.dart';
import '../models/impact_metric_model.dart';
import '../models/testimonial_model.dart';
import '../models/engagement_model.dart';
import '../models/inquiry_model.dart';

class PortfolioRepository {
  final ApiClient _apiClient;

  PortfolioRepository(this._apiClient);

  // --- PUBLIC ENDPOINTS ---

  Future<List<ProjectModel>> getPublicProjects({String? category}) async {
    final queryParams = <String, dynamic>{'published_only': true};
    if (category != null && category != 'ALL') {
      queryParams['category'] = category;
    }
    final response = await _apiClient.get('/api/projects', queryParameters: queryParams);
    final list = response.data as List;
    return list.map((e) => ProjectModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<ImpactMetricModel>> getPublicMetrics() async {
    final response = await _apiClient.get('/api/public/metrics');
    final list = response.data as List;
    return list.map((e) => ImpactMetricModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<TestimonialModel>> getPublicTestimonials() async {
    final response = await _apiClient.get('/api/public/testimonials');
    final list = response.data as List;
    return list.map((e) => TestimonialModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<EngagementModel>> getPublicEngagements() async {
    final response = await _apiClient.get('/api/public/engagements');
    final list = response.data as List;
    return list.map((e) => EngagementModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Map<String, dynamic>> getPublicContactMatrix() async {
    final response = await _apiClient.get('/api/public/contact-matrix');
    return response.data as Map<String, dynamic>;
  }

  Future<void> submitInquiry(InquiryModel inquiry) async {
    await _apiClient.post('/api/inquiries', data: inquiry.toJson());
  }

  // --- ADMIN AUTH & STATS ---

  Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await _apiClient.post(
      '/api/auth/login',
      data: {'username': username, 'password': password},
    );
    final data = response.data as Map<String, dynamic>;
    final token = data['access_token'] as String;
    await TokenStorage.saveToken(token);
    if (data.containsKey('user')) {
      await TokenStorage.saveUser(jsonEncode(data['user']));
    }
    return data;
  }

  Future<void> logout() async {
    try {
      await _apiClient.post('/api/auth/logout');
    } catch (_) {}
    await TokenStorage.deleteToken();
  }

  Future<Map<String, dynamic>> getAdminStats() async {
    final response = await _apiClient.get('/api/stats');
    return response.data as Map<String, dynamic>;
  }

  // --- ADMIN PROJECTS CRUD ---

  Future<List<ProjectModel>> getAllProjects({String? search, String? category}) async {
    final queryParams = <String, dynamic>{};
    if (search != null && search.isNotEmpty) queryParams['search'] = search;
    if (category != null && category != 'All') queryParams['category'] = category;

    final response = await _apiClient.get('/api/projects', queryParameters: queryParams);
    final list = response.data as List;
    return list.map((e) => ProjectModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<ProjectModel> createProject(ProjectModel project) async {
    final response = await _apiClient.post('/api/projects', data: project.toJson());
    return ProjectModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<ProjectModel> updateProject(int id, ProjectModel project) async {
    final response = await _apiClient.put('/api/projects/$id', data: project.toJson());
    return ProjectModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> deleteProject(int id) async {
    await _apiClient.delete('/api/projects/$id');
  }

  Future<ProjectModel> toggleProjectStatus(int id) async {
    final response = await _apiClient.patch('/api/projects/$id/toggle-status');
    return ProjectModel.fromJson(response.data as Map<String, dynamic>);
  }

  // --- ADMIN INQUIRIES MANAGEMENT ---

  Future<List<InquiryModel>> getInquiries() async {
    final response = await _apiClient.get('/api/inquiries');
    final list = response.data as List;
    return list.map((e) => InquiryModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> markInquiryRead(int id) async {
    await _apiClient.patch('/api/inquiries/$id/read');
  }

  Future<void> replyInquiry(int id, String subject, String message) async {
    await _apiClient.post(
      '/api/inquiries/$id/reply',
      data: {'subject': subject, 'message': message},
    );
  }

  Future<void> deleteInquiry(int id) async {
    await _apiClient.delete('/api/inquiries/$id');
  }

  // --- ADMIN METRICS CRUD ---

  Future<List<ImpactMetricModel>> getAllMetrics() async {
    final response = await _apiClient.get('/api/metrics');
    final list = response.data as List;
    return list.map((e) => ImpactMetricModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<ImpactMetricModel> createMetric(ImpactMetricModel metric) async {
    final response = await _apiClient.post('/api/metrics', data: metric.toJson());
    return ImpactMetricModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<ImpactMetricModel> updateMetric(int id, ImpactMetricModel metric) async {
    final response = await _apiClient.put('/api/metrics/$id', data: metric.toJson());
    return ImpactMetricModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> deleteMetric(int id) async {
    await _apiClient.delete('/api/metrics/$id');
  }

  // --- ADMIN TESTIMONIALS CRUD ---

  Future<List<TestimonialModel>> getAllTestimonials() async {
    final response = await _apiClient.get('/api/testimonials');
    final list = response.data as List;
    return list.map((e) => TestimonialModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<TestimonialModel> createTestimonial(TestimonialModel testimonial) async {
    final response = await _apiClient.post('/api/testimonials', data: testimonial.toJson());
    return TestimonialModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<TestimonialModel> updateTestimonial(int id, TestimonialModel testimonial) async {
    final response = await _apiClient.put('/api/testimonials/$id', data: testimonial.toJson());
    return TestimonialModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> deleteTestimonial(int id) async {
    await _apiClient.delete('/api/testimonials/$id');
  }

  // --- ADMIN ENGAGEMENTS CRUD ---

  Future<List<EngagementModel>> getAllEngagements() async {
    final response = await _apiClient.get('/api/engagements');
    final list = response.data as List;
    return list.map((e) => EngagementModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<EngagementModel> createEngagement(EngagementModel engagement) async {
    final response = await _apiClient.post('/api/engagements', data: engagement.toJson());
    return EngagementModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<EngagementModel> updateEngagement(int id, EngagementModel engagement) async {
    final response = await _apiClient.put('/api/engagements/$id', data: engagement.toJson());
    return EngagementModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> deleteEngagement(int id) async {
    await _apiClient.delete('/api/engagements/$id');
  }

  // --- ASSET UPLOAD ---

  Future<String> uploadAsset(File file) async {
    return await _apiClient.uploadFile(file);
  }
}
