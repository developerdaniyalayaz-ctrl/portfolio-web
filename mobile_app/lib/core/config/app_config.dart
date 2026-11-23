import 'dart:io';
import 'package:flutter/foundation.dart';

class AppConfig {
  /// Compile-time override passed via: --dart-define=API_BASE_URL=...
  static const String compileTimeBaseUrl = String.fromEnvironment('API_BASE_URL', defaultValue: '');

  /// Production cloud server endpoint (AWS EC2 Sydney instance)
  static const String productionBaseUrl = 'http://16.179.209.88:8001';

  /// Default host address based on environment and platform:
  /// 1. If --dart-define=API_BASE_URL=... is provided, use it.
  /// 2. In release mode (non-debug), default to productionBaseUrl (http://16.179.209.88:8001).
  /// 3. In debug mode:
  ///    - Android emulator: http://10.0.2.2:8001 (or pass --dart-define=API_BASE_URL=http://16.179.209.88:8001)
  ///    - iOS / Web / Desktop: http://localhost:8001
  static String get defaultBaseUrl {
    if (compileTimeBaseUrl.trim().isNotEmpty) {
      return compileTimeBaseUrl.trim();
    }

    if (kReleaseMode) {
      return productionBaseUrl;
    }

    if (kIsWeb) return 'http://localhost:8001';

    try {
      if (Platform.isAndroid) return 'http://10.0.2.2:8001';
      if (Platform.isIOS) return 'http://localhost:8001';
    } catch (_) {}

    return 'http://10.0.2.2:8001';
  }

  static String currentBaseUrl = defaultBaseUrl;

  /// Resolves relative media URLs like "/uploads/xyz.png" to fully qualified URLs
  static String resolveUrl(String? path) {
    if (path == null || path.trim().isEmpty) return '';
    final trimmed = path.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    final base = currentBaseUrl.endsWith('/')
        ? currentBaseUrl.substring(0, currentBaseUrl.length - 1)
        : currentBaseUrl;
    final cleanPath = trimmed.startsWith('/') ? trimmed : '/$trimmed';
    return '$base$cleanPath';
  }
}
