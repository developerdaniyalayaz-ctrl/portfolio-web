import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/cyber_neon_theme.dart';
import '../../providers/portfolio_providers.dart';
import '../admin/admin_dashboard_screen.dart';
import '../admin/admin_login_screen.dart';
import 'contact_screen.dart';
import 'engagements_screen.dart';
import 'showcase_home_screen.dart';
import 'testimonials_screen.dart';

class PublicShellScreen extends ConsumerStatefulWidget {
  const PublicShellScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<PublicShellScreen> createState() => _PublicShellScreenState();
}

class _PublicShellScreenState extends ConsumerState<PublicShellScreen> {
  int _currentIndex = 0;

  void _switchToTab(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);

    final pages = [
      ShowcaseHomeScreen(onNavigateContact: () => _switchToTab(3)),
      EngagementsScreen(onNavigateContact: () => _switchToTab(3)),
      const TestimonialsScreen(),
      const ContactScreen(),
    ];

    return Scaffold(
      backgroundColor: CyberNeonTheme.background,
      body: IndexedStack(
        index: _currentIndex,
        children: pages,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: CyberNeonTheme.borderCyan, width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: _switchToTab,
          selectedItemColor: CyberNeonTheme.cyanBright,
          unselectedItemColor: CyberNeonTheme.textMuted,
          backgroundColor: CyberNeonTheme.surfaceElevated,
          selectedLabelStyle: GoogleFonts.jetBrainsMono(fontSize: 10, fontWeight: FontWeight.bold),
          unselectedLabelStyle: GoogleFonts.jetBrainsMono(fontSize: 9.5),
          type: BottomNavigationBarType.fixed,
          items: [
            const BottomNavigationBarItem(
              icon: Icon(Icons.folder_copy_outlined, size: 20),
              activeIcon: Icon(Icons.folder_copy, size: 20),
              label: 'SHOWCASE',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.work_outline, size: 20),
              activeIcon: Icon(Icons.work, size: 20),
              label: 'SOLUTIONS',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.star_outline, size: 20),
              activeIcon: Icon(Icons.star, size: 20),
              label: 'REVIEWS',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.send_outlined, size: 20),
              activeIcon: Icon(Icons.send, size: 20),
              label: 'COMMISSION',
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.small(
        heroTag: 'admin_portal_btn',
        backgroundColor: CyberNeonTheme.surfaceElevated,
        foregroundColor: authState.isAuthenticated ? CyberNeonTheme.emeraldBright : CyberNeonTheme.cyan,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
          side: BorderSide(
            color: authState.isAuthenticated ? CyberNeonTheme.borderEmerald : CyberNeonTheme.borderCyan,
          ),
        ),
        tooltip: authState.isAuthenticated ? 'Open Admin Studio' : 'Admin Login',
        onPressed: () {
          if (authState.isAuthenticated) {
            Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const AdminDashboardScreen()),
            );
          } else {
            Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const AdminLoginScreen()),
            );
          }
        },
        child: Icon(
          authState.isAuthenticated ? Icons.admin_panel_settings : Icons.lock_outline,
          size: 18,
        ),
      ),
    );
  }
}
