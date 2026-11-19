import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/cyber_neon_theme.dart';
import '../../providers/portfolio_providers.dart';
import '../../widgets/cyber_card.dart';
import '../../widgets/neon_badge.dart';
import '../../widgets/project_card_widget.dart';

const List<String> categories = ['ALL', 'AI/ML', 'AUTOMATION', 'MOBILE', 'WEB APP'];

class ShowcaseHomeScreen extends ConsumerWidget {
  final VoidCallback onNavigateContact;

  const ShowcaseHomeScreen({Key? key, required this.onNavigateContact}) : super(key: key);

  Color _resolveAccentColor(String colorName) {
    switch (colorName.toLowerCase()) {
      case 'emerald':
        return CyberNeonTheme.emerald;
      case 'amber':
        return CyberNeonTheme.amber;
      case 'violet':
        return CyberNeonTheme.violet;
      case 'sky':
        return CyberNeonTheme.sky;
      case 'cyan':
      default:
        return CyberNeonTheme.cyan;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activeCategory = ref.watch(selectedCategoryProvider);
    final projectsAsync = ref.watch(publicProjectsProvider);
    final metricsAsync = ref.watch(publicMetricsProvider);

    return Scaffold(
      backgroundColor: CyberNeonTheme.background,
      body: RefreshIndicator(
        color: CyberNeonTheme.cyan,
        backgroundColor: CyberNeonTheme.surfaceElevated,
        onRefresh: () async {
          ref.invalidate(publicProjectsProvider);
          ref.invalidate(publicMetricsProvider);
        },
        child: CustomScrollView(
          slivers: [
            // Sliver App Bar
            SliverAppBar(
              floating: true,
              pinned: true,
              backgroundColor: CyberNeonTheme.surface.withOpacity(0.95),
              title: Row(
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: CyberNeonTheme.cyanBright,
                      boxShadow: [
                        BoxShadow(
                          color: CyberNeonTheme.cyanBright,
                          blurRadius: 8,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'PORTFOLIO // NODE 01',
                    style: GoogleFonts.jetBrainsMono(
                      color: CyberNeonTheme.textPrimary,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.send_outlined, color: CyberNeonTheme.cyan, size: 20),
                  tooltip: 'Commission / Inquire',
                  onPressed: onNavigateContact,
                ),
              ],
            ),

            // Hero Banner & Headline
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 20, 16, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const NeonBadge(
                          text: 'FULL-STACK & AI ARCHITECT',
                          color: CyberNeonTheme.cyanBright,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '● LIVE MATRIX',
                          style: GoogleFonts.jetBrainsMono(
                            color: CyberNeonTheme.emerald,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Engineering Autonomous Agents & Scalable Systems',
                      style: GoogleFonts.spaceGrotesk(
                        color: CyberNeonTheme.textPrimary,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        height: 1.25,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Cross-platform applications, machine learning workflows, and resilient enterprise backends.',
                      style: GoogleFonts.jetBrainsMono(
                        color: CyberNeonTheme.textSecondary,
                        fontSize: 12.5,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // 2x2 Impact Telemetry Grid
            SliverToBoxAdapter(
              child: metricsAsync.when(
                data: (metrics) {
                  if (metrics.isEmpty) return const SizedBox.shrink();
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 10,
                        mainAxisSpacing: 10,
                        childAspectRatio: 1.8,
                      ),
                      itemCount: metrics.length.clamp(0, 4),
                      itemBuilder: (context, i) {
                        final m = metrics[i];
                        final accent = _resolveAccentColor(m.accentColor);
                        return CyberCard(
                          borderColor: accent.withOpacity(0.35),
                          glowColor: accent,
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                m.metricValue,
                                style: GoogleFonts.spaceGrotesk(
                                  color: accent,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                m.metricLabel,
                                style: GoogleFonts.jetBrainsMono(
                                  color: CyberNeonTheme.textPrimary,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              if (m.subContext.isNotEmpty)
                                Text(
                                  m.subContext,
                                  style: GoogleFonts.jetBrainsMono(
                                    color: CyberNeonTheme.textMuted,
                                    fontSize: 9.5,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                            ],
                          ),
                        );
                      },
                    ),
                  );
                },
                loading: () => const Padding(
                  padding: EdgeInsets.all(16),
                  child: Center(
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: CyberNeonTheme.cyan),
                    ),
                  ),
                ),
                error: (_, __) => const SizedBox.shrink(),
              ),
            ),

            // Category Filter Bar
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
                child: SizedBox(
                  height: 38,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: categories.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, idx) {
                      final cat = categories[idx];
                      final isSelected = cat == activeCategory;
                      return ChoiceChip(
                        label: Text(
                          cat,
                          style: GoogleFonts.jetBrainsMono(
                            fontSize: 11,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            color: isSelected ? Colors.black : CyberNeonTheme.textSecondary,
                          ),
                        ),
                        selected: isSelected,
                        selectedColor: CyberNeonTheme.cyanBright,
                        backgroundColor: CyberNeonTheme.surfaceElevated,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                          side: BorderSide(
                            color: isSelected
                                ? CyberNeonTheme.cyanBright
                                : CyberNeonTheme.borderCyan,
                          ),
                        ),
                        onSelected: (val) {
                          if (val) {
                            ref.read(selectedCategoryProvider.notifier).state = cat;
                          }
                        },
                      );
                    },
                  ),
                ),
              ),
            ),

            // Project Cards List
            projectsAsync.when(
              data: (projects) {
                if (projects.isEmpty) {
                  return SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Center(
                        child: Text(
                          'No projects found in this domain.',
                          style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textMuted),
                        ),
                      ),
                    ),
                  );
                }
                return SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final project = projects[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: ProjectCardWidget(
                            project: project,
                            index: index,
                            onCustomHireTap: onNavigateContact,
                          ),
                        );
                      },
                      childCount: projects.length,
                    ),
                  ),
                );
              },
              loading: () => const SliverFillRemaining(
                child: Center(
                  child: CircularProgressIndicator(color: CyberNeonTheme.cyan),
                ),
              ),
              error: (err, _) => SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: CyberCard(
                    borderColor: CyberNeonTheme.crimson,
                    child: Text(
                      'Failed to load projects: $err',
                      style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.crimson),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
