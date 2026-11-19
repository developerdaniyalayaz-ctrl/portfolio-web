import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/storage/token_storage.dart';
import 'core/theme/cyber_neon_theme.dart';
import 'screens/public/public_shell_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await TokenStorage.initServerUrl();

  runApp(
    const ProviderScope(
      child: CyberPortfolioApp(),
    ),
  );
}

class CyberPortfolioApp extends StatelessWidget {
  const CyberPortfolioApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cyber//Portfolio & Admin Studio',
      debugShowCheckedModeBanner: false,
      theme: CyberNeonTheme.darkTheme,
      home: const PublicShellScreen(),
    );
  }
}
