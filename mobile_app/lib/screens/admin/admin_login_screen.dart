import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/config/app_config.dart';
import '../../core/storage/token_storage.dart';
import '../../core/theme/cyber_neon_theme.dart';
import '../../providers/portfolio_providers.dart';
import '../../widgets/cyber_card.dart';
import 'admin_dashboard_screen.dart';

class AdminLoginScreen extends ConsumerStatefulWidget {
  const AdminLoginScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<AdminLoginScreen> createState() => _AdminLoginScreenState();
}

class _AdminLoginScreenState extends ConsumerState<AdminLoginScreen> {
  final _usernameController = TextEditingController(text: 'admin');
  final _passwordController = TextEditingController();
  final _serverController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void initState() {
    super.initState();
    _serverController.text = AppConfig.currentBaseUrl;
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    _serverController.dispose();
    super.dispose();
  }

  void _showServerConfigDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: CyberNeonTheme.surfaceElevated,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: CyberNeonTheme.borderCyan),
        ),
        title: Text(
          'SERVER CONFIGURATION',
          style: GoogleFonts.jetBrainsMono(
            color: CyberNeonTheme.cyanBright,
            fontSize: 13,
            fontWeight: FontWeight.bold,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Specify backend host URL (e.g. Android Emulator: http://10.0.2.2:8000, Localhost: http://localhost:8000, or LAN IP: http://192.168.1.X:8000)',
              style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textSecondary, fontSize: 11),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _serverController,
              style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 12),
              decoration: const InputDecoration(hintText: 'http://10.0.2.2:8000'),
            ),
          ],
        ),
        actions: [
          TextButton(
            child: Text('RESET DEFAULT', style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textMuted)),
            onPressed: () {
              _serverController.text = AppConfig.defaultBaseUrl;
            },
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: CyberNeonTheme.cyan, foregroundColor: Colors.black),
            child: Text('SAVE', style: GoogleFonts.jetBrainsMono(fontWeight: FontWeight.bold)),
            onPressed: () async {
              final newUrl = _serverController.text.trim();
              if (newUrl.isNotEmpty) {
                await TokenStorage.saveServerUrl(newUrl);
                if (mounted) Navigator.pop(ctx);
                setState(() {});
              }
            },
          ),
        ],
      ),
    );
  }

  Future<void> _handleLogin() async {
    final username = _usernameController.text.trim();
    final password = _passwordController.text.trim();

    if (username.isEmpty || password.isEmpty) return;

    final success = await ref.read(authStateProvider.notifier).login(username, password);

    if (success && mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const AdminDashboardScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);

    return Scaffold(
      backgroundColor: CyberNeonTheme.background,
      appBar: AppBar(
        title: Text(
          'ADMIN AUTHENTICATION CORE',
          style: GoogleFonts.jetBrainsMono(fontSize: 13, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined, color: CyberNeonTheme.cyan),
            tooltip: 'Server Address Config',
            onPressed: _showServerConfigDialog,
          ),
        ],
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: CyberCard(
            borderColor: CyberNeonTheme.borderCyanHighlight,
            glowColor: CyberNeonTheme.cyan,
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.min,
              children: [
                Center(
                  child: Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: CyberNeonTheme.cyan.withOpacity(0.12),
                      shape: BoxShape.circle,
                      border: Border.all(color: CyberNeonTheme.cyanBright),
                    ),
                    child: const Icon(Icons.shield_outlined, color: CyberNeonTheme.cyanBright, size: 26),
                  ),
                ),
                const SizedBox(height: 16),
                Center(
                  child: Text(
                    'OPERATOR LOGIN',
                    style: GoogleFonts.spaceGrotesk(
                      color: CyberNeonTheme.textPrimary,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                Center(
                  child: Text(
                    'JWT Protected Management Cluster',
                    style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textMuted, fontSize: 11),
                  ),
                ),
                const SizedBox(height: 20),

                if (authState.errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: CyberNeonTheme.crimson.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: CyberNeonTheme.crimson),
                    ),
                    child: Text(
                      authState.errorMessage!,
                      style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.crimson, fontSize: 11),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                Text(
                  'USERNAME',
                  style: GoogleFonts.jetBrainsMono(fontSize: 10.5, color: CyberNeonTheme.textSecondary),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: _usernameController,
                  style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 13),
                  decoration: const InputDecoration(hintText: 'admin'),
                ),
                const SizedBox(height: 14),

                Text(
                  'PASSWORD',
                  style: GoogleFonts.jetBrainsMono(fontSize: 10.5, color: CyberNeonTheme.textSecondary),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 13),
                  decoration: InputDecoration(
                    hintText: '••••••••',
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword ? Icons.visibility_off : Icons.visibility,
                        color: CyberNeonTheme.textMuted,
                        size: 18,
                      ),
                      onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                    ),
                  ),
                  onSubmitted: (_) => _handleLogin(),
                ),
                const SizedBox(height: 20),

                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: CyberNeonTheme.cyan,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: authState.isLoading ? null : _handleLogin,
                  child: authState.isLoading
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                        )
                      : Text(
                          'AUTHENTICATE & ENTER',
                          style: GoogleFonts.jetBrainsMono(fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                ),
                const SizedBox(height: 14),

                Center(
                  child: TextButton.icon(
                    style: TextButton.styleFrom(foregroundColor: CyberNeonTheme.textMuted),
                    icon: const Icon(Icons.link, size: 14),
                    label: Text(
                      'Host: ${AppConfig.currentBaseUrl}',
                      style: GoogleFonts.jetBrainsMono(fontSize: 10),
                      overflow: TextOverflow.ellipsis,
                    ),
                    onPressed: _showServerConfigDialog,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
