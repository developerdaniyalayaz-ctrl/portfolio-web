import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/config/app_config.dart';
import '../core/theme/cyber_neon_theme.dart';
import '../models/project_model.dart';
import '../providers/portfolio_providers.dart';
import '../screens/public/case_study_screen.dart';
import 'cyber_card.dart';
import 'neon_badge.dart';

class ProjectCardWidget extends ConsumerWidget {
  final ProjectModel project;
  final int index;
  final VoidCallback? onCustomHireTap;

  const ProjectCardWidget({
    Key? key,
    required this.project,
    required this.index,
    this.onCustomHireTap,
  }) : super(key: key);

  Future<void> _launchUrl(BuildContext context, String urlString) async {
    final uri = Uri.tryParse(urlString);
    if (uri != null && await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not open link: $urlString'),
            backgroundColor: CyberNeonTheme.crimson,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final imageUrl = AppConfig.resolveUrl(project.imageUrl);
    final hasLive = project.effectiveLiveUrl.isNotEmpty;
    final hasVideo = project.youtubeUrl != null && project.youtubeUrl!.trim().isNotEmpty;
    final hasDirectPurchase = project.purchaseUrl != null && project.purchaseUrl!.trim().isNotEmpty;
    final hasPrice = project.purchasePrice != null && project.purchasePrice!.trim().isNotEmpty;
    final allowCustomHire = project.allowCustomHire;

    return CyberCard(
      padding: EdgeInsets.zero,
      hasTopAccent: true,
      topAccentColor: CyberNeonTheme.cyanBright,
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => CaseStudyScreen(project: project),
          ),
        );
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Project Media Thumbnail
          Container(
            height: 180,
            decoration: const BoxDecoration(
              color: CyberNeonTheme.backgroundDeep,
            ),
            child: Stack(
              fit: StackFit.expand,
              children: [
                if (imageUrl.isNotEmpty)
                  Image.network(
                    imageUrl,
                    fit: BoxFit.cover,
                    alignment: Alignment.topCenter,
                    errorBuilder: (_, __, ___) => _buildPlaceholderGraphic(),
                  )
                else
                  _buildPlaceholderGraphic(),

                // Gradient Overlay
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        CyberNeonTheme.surface.withOpacity(0.9),
                      ],
                    ),
                  ),
                ),

                // Top Badges
                Positioned(
                  top: 10,
                  left: 10,
                  child: NeonBadge(
                    text: project.category,
                    color: CyberNeonTheme.cyanBright,
                  ),
                ),
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.6),
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: Colors.white24),
                    ),
                    child: Text(
                      '#${(index + 1).toString().padLeft(2, '0')}',
                      style: GoogleFonts.jetBrainsMono(
                        color: CyberNeonTheme.textSecondary,
                        fontSize: 10,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Project Details
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  project.title,
                  style: GoogleFonts.jetBrainsMono(
                    color: CyberNeonTheme.textPrimary,
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 6),
                Text(
                  project.description,
                  style: GoogleFonts.jetBrainsMono(
                    color: CyberNeonTheme.textSecondary,
                    fontSize: 12,
                    height: 1.4,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 12),

                // Tech Stack Tags
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: project.techStackList.take(4).map((tech) {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                      decoration: BoxDecoration(
                        color: CyberNeonTheme.backgroundDeep,
                        borderRadius: BorderRadius.circular(5),
                        border: Border.all(color: CyberNeonTheme.borderCyan),
                      ),
                      child: Text(
                        tech,
                        style: GoogleFonts.jetBrainsMono(
                          color: CyberNeonTheme.cyan,
                          fontSize: 10.5,
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 16),

                // Action Row 1: Live Demo & Watch Video
                if (hasLive || hasVideo) ...[
                  Row(
                    children: [
                      if (hasLive) ...[
                        Expanded(
                          child: OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: CyberNeonTheme.emerald,
                              side: const BorderSide(color: CyberNeonTheme.borderEmerald),
                              backgroundColor: CyberNeonTheme.emerald.withOpacity(0.08),
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            icon: const Icon(Icons.open_in_new, size: 13),
                            label: Text(
                              'LIVE DEMO',
                              style: GoogleFonts.jetBrainsMono(fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                            onPressed: () => _launchUrl(context, project.effectiveLiveUrl),
                          ),
                        ),
                        if (hasVideo) const SizedBox(width: 8),
                      ],
                      if (hasVideo) ...[
                        Expanded(
                          child: OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: CyberNeonTheme.sky,
                              side: BorderSide(color: CyberNeonTheme.sky.withOpacity(0.35)),
                              backgroundColor: CyberNeonTheme.sky.withOpacity(0.08),
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            icon: const Icon(Icons.play_circle_outline, size: 14),
                            label: Text(
                              'WATCH VIDEO',
                              style: GoogleFonts.jetBrainsMono(fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                            onPressed: () => _launchUrl(context, project.youtubeUrl!.trim()),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 8),
                ],

                // Action Row 2: Commercial Pathways (Buy Codebase / Custom Hire)
                Row(
                  children: [
                    // Pathway 1: Buy Ready Codebase
                    Expanded(
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: CyberNeonTheme.amber,
                          side: const BorderSide(color: CyberNeonTheme.borderAmber),
                          backgroundColor: CyberNeonTheme.amber.withOpacity(0.08),
                          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        onPressed: () {
                          if (hasDirectPurchase) {
                            _launchUrl(context, project.purchaseUrl!.trim());
                          } else {
                            // Fallback inquiry prefill
                            final subject = 'Purchase Codebase Inquiry: ${project.title}${hasPrice ? ' (${project.purchasePrice!.trim()})' : ''}';
                            ref.read(inquiryPrefillSubjectProvider.notifier).state = subject;
                            if (onCustomHireTap != null) onCustomHireTap!();
                          }
                        },
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.shopping_bag_outlined, size: 13),
                            const SizedBox(width: 4),
                            Flexible(
                              child: Text(
                                hasPrice ? project.purchasePrice!.trim() : 'GET CODE',
                                style: GoogleFonts.jetBrainsMono(fontSize: 11, fontWeight: FontWeight.bold),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    if (allowCustomHire) ...[
                      const SizedBox(width: 8),
                      // Pathway 2: Custom Hire
                      Expanded(
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: CyberNeonTheme.cyan.withOpacity(0.18),
                            foregroundColor: CyberNeonTheme.cyanBright,
                            side: const BorderSide(color: CyberNeonTheme.borderCyanHighlight),
                            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          icon: const Icon(Icons.handyman_outlined, size: 13),
                          label: Text(
                            'CUSTOM HIRE',
                            style: GoogleFonts.jetBrainsMono(fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                          onPressed: () {
                            final subject = project.hireCustomSubject?.trim().isNotEmpty == true
                                ? project.hireCustomSubject!.trim()
                                : 'Custom Integration: ${project.title}';
                            ref.read(inquiryPrefillSubjectProvider.notifier).state = subject;
                            if (onCustomHireTap != null) onCustomHireTap!();
                          },
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 12),

                // Bottom Row: Case Study Link & GitHub
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    InkWell(
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => CaseStudyScreen(project: project),
                          ),
                        );
                      },
                      child: Row(
                        children: [
                          Text(
                            'CASE STUDY',
                            style: GoogleFonts.jetBrainsMono(
                              color: CyberNeonTheme.cyanBright,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(Icons.arrow_forward, color: CyberNeonTheme.cyanBright, size: 14),
                        ],
                      ),
                    ),
                    if (project.githubUrl != null && project.githubUrl!.trim().isNotEmpty)
                      IconButton(
                        icon: const Icon(Icons.code, color: CyberNeonTheme.textSecondary, size: 20),
                        tooltip: 'Source Code',
                        onPressed: () => _launchUrl(context, project.githubUrl!.trim()),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlaceholderGraphic() {
    return Container(
      color: CyberNeonTheme.backgroundDeep,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.memory, size: 44, color: CyberNeonTheme.cyan.withOpacity(0.3)),
            const SizedBox(height: 6),
            Text(
              'CYBER GRAPHIC NOT STAGED',
              style: GoogleFonts.jetBrainsMono(
                color: CyberNeonTheme.textMuted,
                fontSize: 10,
                letterSpacing: 1.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
