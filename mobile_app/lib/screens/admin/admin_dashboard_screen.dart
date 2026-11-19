import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/cyber_neon_theme.dart';
import '../../providers/portfolio_providers.dart';
import 'admin_inquiries_screen.dart';
import 'admin_projects_screen.dart';

class AdminDashboardScreen extends ConsumerStatefulWidget {
  const AdminDashboardScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends ConsumerState<AdminDashboardScreen> {
  int _tabIndex = 0;

  @override
  Widget build(BuildContext context) {
    final statsAsync = ref.watch(adminStatsProvider);

    final tabs = [
      const AdminProjectsScreen(),
      const AdminInquiriesScreen(),
    ];

    return Scaffold(
      backgroundColor: CyberNeonTheme.background,
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.security, size: 16, color: CyberNeonTheme.cyanBright),
            const SizedBox(width: 8),
            Text(
              'OPERATOR STUDIO',
              style: GoogleFonts.jetBrainsMono(fontSize: 13, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, size: 20, color: CyberNeonTheme.cyan),
            tooltip: 'Refresh Telemetry',
            onPressed: () {
              ref.invalidate(adminStatsProvider);
              ref.invalidate(adminProjectsProvider);
              ref.invalidate(adminInquiriesProvider);
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout, size: 20, color: CyberNeonTheme.crimson),
            tooltip: 'Logout',
            onPressed: () async {
              await ref.read(authStateProvider.notifier).logout();
              if (mounted) Navigator.pop(context);
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Quick Telemetry Strip
          statsAsync.when(
            data: (stats) {
              final totalP = stats['total_projects'] ?? 0;
              final pubP = stats['published_projects'] ?? 0;
              final totalInq = stats['total_inquiries'] ?? 0;
              final unreadInq = stats['unread_inquiries'] ?? 0;

              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: const BoxDecoration(
                  color: CyberNeonTheme.surfaceElevated,
                  border: Border(bottom: BorderSide(color: CyberNeonTheme.borderCyan)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildMetricPill('PROJECTS', '$pubP / $totalP', CyberNeonTheme.cyan),
                    _buildMetricPill(
                      'INQUIRIES',
                      '$totalInq',
                      unreadInq > 0 ? CyberNeonTheme.amber : CyberNeonTheme.emerald,
                      badge: unreadInq > 0 ? '$unreadInq NEW' : null,
                    ),
                  ],
                ),
              );
            },
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
          ),

          // Main Tab Body
          Expanded(child: tabs[_tabIndex]),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: CyberNeonTheme.borderCyan, width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: _tabIndex,
          onTap: (idx) => setState(() => _tabIndex = idx),
          selectedItemColor: CyberNeonTheme.cyanBright,
          unselectedItemColor: CyberNeonTheme.textMuted,
          backgroundColor: CyberNeonTheme.surfaceElevated,
          selectedLabelStyle: GoogleFonts.jetBrainsMono(fontSize: 10.5, fontWeight: FontWeight.bold),
          unselectedLabelStyle: GoogleFonts.jetBrainsMono(fontSize: 10),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.folder_shared_outlined),
              activeIcon: Icon(Icons.folder_shared),
              label: 'PROJECTS REPO',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.mark_email_unread_outlined),
              activeIcon: Icon(Icons.mark_email_unread),
              label: 'INQUIRIES & LEADS',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricPill(String label, String value, Color color, {String? badge}) {
    return Row(
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textMuted, fontSize: 9.5),
            ),
            Text(
              value,
              style: GoogleFonts.spaceGrotesk(
                color: color,
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        if (badge != null) ...[
          const SizedBox(width: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
            decoration: BoxDecoration(
              color: color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: color),
            ),
            child: Text(
              badge,
              style: GoogleFonts.jetBrainsMono(
                color: color,
                fontSize: 9,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ],
    );
  }
}
