import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/app_config.dart';

class TokenStorage {
  static const _storage = FlutterSecureStorage();
  static const _tokenKey = 'cyber_auth_jwt_token';
  static const _userKey = 'cyber_auth_user_json';
  static const _serverUrlKey = 'cyber_custom_server_url';

  static Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  static Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  static Future<void> deleteToken() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _userKey);
  }

  static Future<void> saveUser(String userJson) async {
    await _storage.write(key: _userKey, value: userJson);
  }

  static Future<String?> getUser() async {
    return await _storage.read(key: _userKey);
  }

  static Future<void> saveServerUrl(String url) async {
    await _storage.write(key: _serverUrlKey, value: url);
    AppConfig.currentBaseUrl = url.trim();
  }

  static Future<String> getServerUrl() async {
    final custom = await _storage.read(key: _serverUrlKey);
    if (custom != null && custom.trim().isNotEmpty) {
      AppConfig.currentBaseUrl = custom.trim();
      return custom.trim();
    }
    return AppConfig.defaultBaseUrl;
  }

  static Future<void> initServerUrl() async {
    final url = await getServerUrl();
    AppConfig.currentBaseUrl = url;
  }
}
