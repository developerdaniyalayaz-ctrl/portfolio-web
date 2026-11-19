import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/network/api_client.dart';
import '../core/storage/token_storage.dart';
import '../repositories/portfolio_repository.dart';
import '../models/project_model.dart';
import '../models/impact_metric_model.dart';
import '../models/testimonial_model.dart';
import '../models/engagement_model.dart';
import '../models/inquiry_model.dart';

// --- CORE PROVIDERS ---

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient();
});

final portfolioRepositoryProvider = Provider<PortfolioRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return PortfolioRepository(client);
});

// --- PUBLIC DATA PROVIDERS ---

final selectedCategoryProvider = StateProvider<String>((ref) => 'ALL');

final publicProjectsProvider = FutureProvider.autoDispose<List<ProjectModel>>((ref) async {
  final repo = ref.watch(portfolioRepositoryProvider);
  final category = ref.watch(selectedCategoryProvider);
  return await repo.getPublicProjects(category: category);
});

final publicMetricsProvider = FutureProvider.autoDispose<List<ImpactMetricModel>>((ref) async {
  final repo = ref.watch(portfolioRepositoryProvider);
  return await repo.getPublicMetrics();
});

final publicTestimonialsProvider = FutureProvider.autoDispose<List<TestimonialModel>>((ref) async {
  final repo = ref.watch(portfolioRepositoryProvider);
  return await repo.getPublicTestimonials();
});

final publicEngagementsProvider = FutureProvider.autoDispose<List<EngagementModel>>((ref) async {
  final repo = ref.watch(portfolioRepositoryProvider);
  return await repo.getPublicEngagements();
});

final publicContactMatrixProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final repo = ref.watch(portfolioRepositoryProvider);
  return await repo.getPublicContactMatrix();
});

/// Shared inquiry prefill state (e.g. from Engagement tier tap or Project Custom Hire tap)
final inquiryPrefillSubjectProvider = StateProvider<String?>((ref) => null);

// --- AUTH STATE & ADMIN NOTIFIERS ---

class AuthState {
  final bool isAuthenticated;
  final Map<String, dynamic>? user;
  final bool isLoading;
  final String? errorMessage;

  AuthState({
    required this.isAuthenticated,
    this.user,
    this.isLoading = false,
    this.errorMessage,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    Map<String, dynamic>? user,
    bool? isLoading,
    String? errorMessage,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final PortfolioRepository _repository;

  AuthNotifier(this._repository) : super(AuthState(isAuthenticated: false, isLoading: true)) {
    checkInitialAuth();
  }

  Future<void> checkInitialAuth() async {
    final token = await TokenStorage.getToken();
    if (token != null && token.isNotEmpty) {
      final userStr = await TokenStorage.getUser();
      Map<String, dynamic>? userObj;
      if (userStr != null) {
        try {
          userObj = jsonDecode(userStr);
        } catch (_) {}
      }
      state = AuthState(isAuthenticated: true, user: userObj, isLoading: false);
    } else {
      state = AuthState(isAuthenticated: false, isLoading: false);
    }
  }

  Future<bool> login(String username, String password) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final data = await _repository.login(username, password);
      state = AuthState(
        isAuthenticated: true,
        user: data['user'] as Map<String, dynamic>?,
        isLoading: false,
      );
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
      return false;
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    state = AuthState(isAuthenticated: false, user: null, isLoading: false);
  }
}

final authStateProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final repo = ref.watch(portfolioRepositoryProvider);
  return AuthNotifier(repo);
});

// --- ADMIN DATA PROVIDERS ---

final adminStatsProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final repo = ref.watch(portfolioRepositoryProvider);
  return await repo.getAdminStats();
});

final adminProjectsProvider = FutureProvider.autoDispose<List<ProjectModel>>((ref) async {
  final repo = ref.watch(portfolioRepositoryProvider);
  return await repo.getAllProjects();
});

final adminInquiriesProvider = FutureProvider.autoDispose<List<InquiryModel>>((ref) async {
  final repo = ref.watch(portfolioRepositoryProvider);
  return await repo.getInquiries();
});

final adminMetricsProvider = FutureProvider.autoDispose<List<ImpactMetricModel>>((ref) async {
  final repo = ref.watch(portfolioRepositoryProvider);
  return await repo.getAllMetrics();
});

final adminTestimonialsProvider = FutureProvider.autoDispose<List<TestimonialModel>>((ref) async {
  final repo = ref.watch(portfolioRepositoryProvider);
  return await repo.getAllTestimonials();
});

final adminEngagementsProvider = FutureProvider.autoDispose<List<EngagementModel>>((ref) async {
  final repo = ref.watch(portfolioRepositoryProvider);
  return await repo.getAllEngagements();
});
