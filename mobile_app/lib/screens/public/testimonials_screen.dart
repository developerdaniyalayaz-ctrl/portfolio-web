import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/cyber_neon_theme.dart';
import '../../providers/portfolio_providers.dart';
import '../../widgets/cyber_card.dart';
import '../../widgets/neon_badge.dart';

class TestimonialsScreen extends ConsumerWidget {
  const TestimonialsScreen({Key? key}) : super(key: key);

  Color _resolveBadgeColor(String badge, [String? color]) {
    if (color != null && color.isNotEmpty) {
      final c = color.toLowerCase();
      if (c == 'emerald' || c == 'green') return CyberNeonTheme.emerald;
      if (c == 'cyan' || c == 'blue') return CyberNeonTheme.cyanBright;
      if (c == 'violet' || c == 'purple') return CyberNeonTheme.violet;
      if (c == 'amber' || c == 'orange') return CyberNeonTheme.amber;
    }
    final b = badge.toLowerCase();
    if (b.contains('upwork')) return CyberNeonTheme.emerald;
    if (b.contains('fiverr')) return CyberNeonTheme.emeraldBright;
    if (b.contains('enterprise')) return CyberNeonTheme.cyanBright;
    return CyberNeonTheme.amber;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final testimonialsAsync = ref.watch(publicTestimonialsProvider);

    return Scaffold(
      backgroundColor: CyberNeonTheme.background,
      appBar: AppBar(
        title: Text(
          'CLIENT ENDORSEMENTS & PROOF',
          style: GoogleFonts.jetBrainsMono(
            fontSize: 13,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: RefreshIndicator(
        color: CyberNeonTheme.cyan,
        backgroundColor: CyberNeonTheme.surfaceElevated,
        onRefresh: () async {
          ref.invalidate(publicTestimonialsProvider);
        },
        child: testimonialsAsync.when(
          data: (reviews) {
            if (reviews.isEmpty) {
              return Center(
                child: Text(
                  'No reviews filed currently.',
                  style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textMuted),
                ),
              );
            }
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: reviews.length,
              itemBuilder: (context, index) {
                final r = reviews[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: CyberCard(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            NeonBadge(
                              text: r.platformBadge,
                              color: _resolveBadgeColor(r.platformBadge, r.badgeColor),
                            ),
                            Row(
                              children: List.generate(5, (starIdx) {
                                return Icon(
                                  starIdx < r.rating ? Icons.star : Icons.star_border,
                                  size: 14,
                                  color: starIdx < r.rating ? CyberNeonTheme.amber : CyberNeonTheme.textMuted,
                                );
                              }),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        Text(
                          '"${r.reviewText}"',
                          style: GoogleFonts.jetBrainsMono(
                            color: CyberNeonTheme.textPrimary,
                            fontSize: 12.5,
                            fontStyle: FontStyle.italic,
                            height: 1.45,
                          ),
                        ),
                        const SizedBox(height: 14),

                        Row(
                          children: [
                            Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: CyberNeonTheme.surfaceElevated,
                                border: Border.all(color: CyberNeonTheme.borderCyan),
                              ),
                              child: const Icon(Icons.person_outline, size: 18, color: CyberNeonTheme.cyan),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Flexible(
                                        child: Text(
                                          r.clientName,
                                          style: GoogleFonts.jetBrainsMono(
                                            color: CyberNeonTheme.textPrimary,
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      if (r.verified) ...[
                                        const SizedBox(width: 4),
                                        const Icon(Icons.verified, size: 13, color: CyberNeonTheme.emerald),
                                      ],
                                    ],
                                  ),
                                  if (r.clientRole.isNotEmpty)
                                    Text(
                                      r.clientRole,
                                      style: GoogleFonts.jetBrainsMono(
                                        color: CyberNeonTheme.textMuted,
                                        fontSize: 10.5,
                                      ),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            );
          },
          loading: () => const Center(child: CircularProgressIndicator(color: CyberNeonTheme.cyan)),
          error: (err, _) => Center(
            child: Text(
              'Error loading endorsements: $err',
              style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.crimson),
            ),
          ),
        ),
      ),
    );
  }
}
