import 'dart:io';
import 'package:dio/dio.dart';
import '../config/app_config.dart';
import '../storage/token_storage.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, [this.statusCode]);

  @override
  String toString() => message;
}

class ApiClient {
  late final Dio _dio;

  ApiClient() {
    _dio = Dio(
      BaseOptions(
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 12),
        sendTimeout: const Duration(seconds: 10),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Always ensure the base URL reflects current configured host
          options.baseUrl = AppConfig.currentBaseUrl;

          // Attach JWT token if present
          final token = await TokenStorage.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) {
          String message = 'Network connection failed.';
          if (error.response?.data != null) {
            final data = error.response!.data;
            if (data is Map && data.containsKey('detail')) {
              message = data['detail'].toString();
            } else if (data is String) {
              message = data;
            }
          } else if (error.type == DioExceptionType.connectionTimeout) {
            message = 'Connection timed out. Check server connectivity at ${AppConfig.currentBaseUrl}';
          } else if (error.type == DioExceptionType.receiveTimeout) {
            message = 'Server response timed out. High network latency from Sydney node.';
          } else if (error.type == DioExceptionType.sendTimeout) {
            message = 'Request transmission timed out. Check network connection.';
          } else if (error.type == DioExceptionType.connectionError) {
            message = 'Could not reach server at ${AppConfig.currentBaseUrl}. Check network connectivity.';
          }
          return handler.reject(
            DioException(
              requestOptions: error.requestOptions,
              response: error.response,
              type: error.type,
              error: ApiException(message, error.response?.statusCode),
            ),
          );
        },
      ),
    );
  }

  Dio get dio => _dio;

  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
    try {
      return await _dio.get(path, queryParameters: queryParameters);
    } on DioException catch (e) {
      if (e.error is ApiException) throw e.error as ApiException;
      throw ApiException(e.message ?? 'GET request failed');
    }
  }

  Future<Response> post(String path, {dynamic data, Map<String, dynamic>? queryParameters}) async {
    try {
      return await _dio.post(path, data: data, queryParameters: queryParameters);
    } on DioException catch (e) {
      if (e.error is ApiException) throw e.error as ApiException;
      throw ApiException(e.message ?? 'POST request failed');
    }
  }

  Future<Response> put(String path, {dynamic data}) async {
    try {
      return await _dio.put(path, data: data);
    } on DioException catch (e) {
      if (e.error is ApiException) throw e.error as ApiException;
      throw ApiException(e.message ?? 'PUT request failed');
    }
  }

  Future<Response> patch(String path, {dynamic data}) async {
    try {
      return await _dio.patch(path, data: data);
    } on DioException catch (e) {
      if (e.error is ApiException) throw e.error as ApiException;
      throw ApiException(e.message ?? 'PATCH request failed');
    }
  }

  Future<Response> delete(String path) async {
    try {
      return await _dio.delete(path);
    } on DioException catch (e) {
      if (e.error is ApiException) throw e.error as ApiException;
      throw ApiException(e.message ?? 'DELETE request failed');
    }
  }

  /// Uploads an image file to /api/upload and returns the relative URL string
  Future<String> uploadFile(File file) async {
    try {
      final fileName = file.path.split(Platform.pathSeparator).last;
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(file.path, filename: fileName),
      });

      final response = await _dio.post('/api/upload', data: formData);
      if (response.statusCode == 200 && response.data != null) {
        return response.data['url'] as String;
      }
      throw ApiException('Failed to upload image asset');
    } on DioException catch (e) {
      if (e.error is ApiException) throw e.error as ApiException;
      throw ApiException(e.message ?? 'Upload failed');
    }
  }
}
