import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/cyber_neon_theme.dart';
import '../../providers/portfolio_providers.dart';
import '../../widgets/cyber_card.dart';
import '../../widgets/neon_badge.dart';

class EngagementsScreen extends ConsumerWidget {
  final VoidCallback onNavigateContact;

  const EngagementsScreen({Key? key, required this.onNavigateContact}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final engagementsAsync = ref.watch(publicEngagementsProvider);

    return Scaffold(
      backgroundColor: CyberNeonTheme.background,
      appBar: AppBar(
        title: Text(
          'ENGAGEMENT MODELS // HOW WE WORK',
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
          ref.invalidate(publicEngagementsProvider);
        },
        child: engagementsAsync.when(
          data: (tiers) {
            if (tiers.isEmpty) {
              return Center(
                child: Text(
                  'No engagement tiers listed currently.',
                  style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textMuted),
                ),
              );
            }
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: tiers.length,
              itemBuilder: (context, index) {
                final tier = tiers[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: CyberCard(
                    hasTopAccent: true,
                    topAccentColor: index == 1
                        ? CyberNeonTheme.cyanBright
                        : index == 2
                            ? CyberNeonTheme.violet
                            : CyberNeonTheme.emerald,
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            NeonBadge(
                              text: tier.tierBadge,
                              color: index == 1
                                  ? CyberNeonTheme.cyanBright
                                  : index == 2
                                      ? CyberNeonTheme.violet
                                      : CyberNeonTheme.emerald,
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: CyberNeonTheme.backgroundDeep,
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(color: CyberNeonTheme.borderSubtle),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.schedule, size: 11, color: CyberNeonTheme.cyan),
                                  const SizedBox(width: 4),
                                  Text(
                                    tier.timeline,
                                    style: GoogleFonts.jetBrainsMono(
                                      color: CyberNeonTheme.cyan,
                                      fontSize: 10.5,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        Text(
                          tier.title,
                          style: GoogleFonts.spaceGrotesk(
                            color: CyberNeonTheme.textPrimary,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (tier.idealFor.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text(
                            tier.idealFor,
                            style: GoogleFonts.jetBrainsMono(
                              color: CyberNeonTheme.textSecondary,
                              fontSize: 11.5,
                            ),
                          ),
                        ],
                        const SizedBox(height: 14),

                        // Deliverables list
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: tier.deliverables.map((deliv) {
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 6),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Padding(
                                    padding: EdgeInsets.only(top: 2, right: 6),
                                    child: Icon(
                                      Icons.check_circle_outline,
                                      size: 13,
                                      color: CyberNeonTheme.emerald,
                                    ),
                                  ),
                                  Expanded(
                                    child: Text(
                                      deliv,
                                      style: GoogleFonts.jetBrainsMono(
                                        color: CyberNeonTheme.textPrimary,
                                        fontSize: 11.5,
                                        height: 1.35,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 16),

                        // Pricing and Select CTA
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            if (tier.pricingAnchor.isNotEmpty)
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'TYPICAL SCOPE',
                                    style: GoogleFonts.jetBrainsMono(
                                      color: CyberNeonTheme.textMuted,
                                      fontSize: 9.5,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    tier.pricingAnchor,
                                    style: GoogleFonts.spaceGrotesk(
                                      color: CyberNeonTheme.cyanBright,
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              )
                            else
                              const SizedBox.shrink(),

                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: CyberNeonTheme.cyan,
                                foregroundColor: Colors.black,
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                              icon: const Icon(Icons.arrow_forward, size: 14),
                              label: Text(
                                'SELECT & INQUIRE',
                                style: GoogleFonts.jetBrainsMono(fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                              onPressed: () {
                                final subject = tier.inquirySubject.isNotEmpty
                                    ? tier.inquirySubject
                                    : 'Scope Inquiry: ${tier.title} (${tier.timeline})';
                                ref.read(inquiryPrefillSubjectProvider.notifier).state = subject;
                                onNavigateContact();
                              },
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
              'Error loading tiers: $err',
              style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.crimson),
            ),
          ),
        ),
      ),
    );
  }
}
