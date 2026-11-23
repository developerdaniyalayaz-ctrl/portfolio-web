import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/config/app_config.dart';
import '../../core/theme/cyber_neon_theme.dart';
import '../../models/project_model.dart';
import '../../providers/portfolio_providers.dart';
import '../../widgets/cyber_card.dart';
import '../../widgets/neon_badge.dart';
import 'blueprint_viewer_screen.dart';

class CaseStudyScreen extends ConsumerWidget {
  final ProjectModel project;

  const CaseStudyScreen({Key? key, required this.project}) : super(key: key);

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
    final hasArch = project.architectureImageUrl != null &&
        project.architectureImageUrl!.trim().isNotEmpty;
    final archUrl = hasArch ? AppConfig.resolveUrl(project.architectureImageUrl) : '';

    final hasDirectPurchase =
        project.purchaseUrl != null && project.purchaseUrl!.trim().isNotEmpty;
    final hasPrice =
        project.purchasePrice != null && project.purchasePrice!.trim().isNotEmpty;
    final allowCustomHire = project.allowCustomHire;

    return Scaffold(
      backgroundColor: CyberNeonTheme.background,
      appBar: AppBar(
        title: Text(
          project.title,
          style: GoogleFonts.jetBrainsMono(
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
          overflow: TextOverflow.ellipsis,
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Category and Spec Header
            Row(
              children: [
                NeonBadge(
                  text: project.category,
                  color: CyberNeonTheme.cyanBright,
                ),
                const SizedBox(width: 8),
                Text(
                  '// SYSTEM SPECIFICATION',
                  style: GoogleFonts.jetBrainsMono(
                    color: CyberNeonTheme.textMuted,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Project Title
            Text(
              project.title,
              style: GoogleFonts.spaceGrotesk(
                color: CyberNeonTheme.textPrimary,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 14),

            // Action Bar: Live Demo, Video, GitHub
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                if (project.effectiveLiveUrl.isNotEmpty)
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: CyberNeonTheme.emerald.withOpacity(0.2),
                      foregroundColor: CyberNeonTheme.emeraldBright,
                      side: const BorderSide(color: CyberNeonTheme.borderEmerald),
                    ),
                    icon: const Icon(Icons.rocket_launch_outlined, size: 14),
                    label: Text(
                      'LAUNCH DEMO',
                      style: GoogleFonts.jetBrainsMono(fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                    onPressed: () => _launchUrl(context, project.effectiveLiveUrl),
                  ),
                if (project.youtubeUrl != null && project.youtubeUrl!.trim().isNotEmpty)
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: CyberNeonTheme.sky,
                      side: BorderSide(color: CyberNeonTheme.sky.withOpacity(0.4)),
                    ),
                    icon: const Icon(Icons.play_arrow, size: 15),
                    label: Text(
                      'WATCH VIDEO',
                      style: GoogleFonts.jetBrainsMono(fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                    onPressed: () => _launchUrl(context, project.youtubeUrl!.trim()),
                  ),
                if (project.githubUrl != null && project.githubUrl!.trim().isNotEmpty)
                  IconButton(
                    icon: const Icon(Icons.code, color: CyberNeonTheme.cyan),
                    tooltip: 'Repository',
                    onPressed: () => _launchUrl(context, project.githubUrl!.trim()),
                  ),
              ],
            ),
            const SizedBox(height: 16),

            // Commercial Pathways Card (Buy Codebase / Custom Hire)
            CyberCard(
              borderColor: CyberNeonTheme.borderCyanHighlight,
              glowColor: CyberNeonTheme.cyan,
              backgroundColor: CyberNeonTheme.surfaceElevated,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.shopping_bag_outlined, color: CyberNeonTheme.amber, size: 16),
                      const SizedBox(width: 6),
                      Text(
                        'COMMERCIAL ACQUISITION & INTEGRATION',
                        style: GoogleFonts.jetBrainsMono(
                          color: CyberNeonTheme.textPrimary,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Acquire this complete codebase license or hire lead development for custom integration.',
                    style: GoogleFonts.jetBrainsMono(
                      color: CyberNeonTheme.textSecondary,
                      fontSize: 11,
                    ),
                  ),
                  const SizedBox(height: 14),

                  Row(
                    children: [
                      // Buy Codebase Button
                      Expanded(
                        child: OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            foregroundColor: CyberNeonTheme.amber,
                            side: const BorderSide(color: CyberNeonTheme.borderAmber),
                            backgroundColor: CyberNeonTheme.amber.withOpacity(0.1),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                          ),
                          icon: const Icon(Icons.file_download_outlined, size: 14),
                          label: Text(
                            hasPrice ? 'BUY (${project.purchasePrice!.trim()})' : 'GET CODEBASE',
                            style: GoogleFonts.jetBrainsMono(fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                          onPressed: () {
                            if (hasDirectPurchase) {
                              _launchUrl(context, project.purchaseUrl!.trim());
                            } else {
                              final subject =
                                  'Purchase Codebase Inquiry: ${project.title}${hasPrice ? ' (${project.purchasePrice!.trim()})' : ''}';
                              ref.read(inquiryPrefillSubjectProvider.notifier).state = subject;
                              Navigator.pop(context);
                            }
                          },
                        ),
                      ),
                      if (allowCustomHire) ...[
                        const SizedBox(width: 8),
                        // Custom Hire Button
                        Expanded(
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: CyberNeonTheme.cyan,
                              foregroundColor: Colors.black,
                              padding: const EdgeInsets.symmetric(vertical: 10),
                            ),
                            icon: const Icon(Icons.handyman_outlined, size: 14),
                            label: Text(
                              'CUSTOM HIRE',
                              style: GoogleFonts.jetBrainsMono(fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                            onPressed: () {
                              final subject = project.hireCustomSubject?.trim().isNotEmpty == true
                                  ? project.hireCustomSubject!.trim()
                                  : 'Custom Integration: ${project.title}';
                              ref.read(inquiryPrefillSubjectProvider.notifier).state = subject;
                              Navigator.pop(context);
                            },
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Zoomable 16:9 Architecture Blueprint Section
            if (hasArch) ...[
              CyberCard(
                borderColor: CyberNeonTheme.borderCyan,
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.layers_outlined, color: CyberNeonTheme.cyan, size: 16),
                            const SizedBox(width: 6),
                            Text(
                              'ARCHITECTURE & WORKFLOW BLUEPRINT',
                              style: GoogleFonts.jetBrainsMono(
                                color: CyberNeonTheme.cyanBright,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(Icons.fullscreen, color: CyberNeonTheme.cyanBright, size: 20),
                          tooltip: 'Open Fullscreen Pinch-Zoom',
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => BlueprintViewerScreen(
                                  imageUrl: project.architectureImageUrl!,
                                  projectTitle: project.title,
                                ),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    GestureDetector(
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => BlueprintViewerScreen(
                              imageUrl: project.architectureImageUrl!,
                              projectTitle: project.title,
                            ),
                          ),
                        );
                      },
                      child: Container(
                        height: 200,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: CyberNeonTheme.backgroundDeep,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: CyberNeonTheme.borderCyan),
                        ),
                        child: Stack(
                          children: [
                            Center(
                              child: CachedNetworkImage(
                                imageUrl: archUrl,
                                fit: BoxFit.contain,
                                placeholder: (context, url) => Container(
                                  color: CyberNeonTheme.backgroundDeep,
                                  child: Center(
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const SizedBox(
                                          width: 24,
                                          height: 24,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            color: CyberNeonTheme.cyan,
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          'CACHING BLUEPRINT...',
                                          style: GoogleFonts.jetBrainsMono(
                                            color: CyberNeonTheme.textMuted,
                                            fontSize: 9,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                errorWidget: (_, __, ___) => const Center(
                                  child: Icon(Icons.broken_image, color: CyberNeonTheme.crimson),
                                ),
                              ),
                            ),
                            Positioned(
                              bottom: 8,
                              right: 8,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                                decoration: BoxDecoration(
                                  color: Colors.black.withOpacity(0.7),
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(color: CyberNeonTheme.borderCyan),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.zoom_in, color: CyberNeonTheme.cyan, size: 12),
                                    const SizedBox(width: 4),
                                    Text(
                                      'TAP TO ZOOM',
                                      style: GoogleFonts.jetBrainsMono(
                                        color: CyberNeonTheme.cyan,
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Markdown Specification Body
            Text(
              '// TECHNICAL SPECIFICATION & BENCHMARKS',
              style: GoogleFonts.jetBrainsMono(
                color: CyberNeonTheme.cyan,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),

            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: CyberNeonTheme.surfaceElevated,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: CyberNeonTheme.borderSubtle),
              ),
              child: MarkdownBody(
                data: project.description,
                selectable: true,
                styleSheet: MarkdownStyleSheet(
                  h1: GoogleFonts.spaceGrotesk(
                    color: CyberNeonTheme.cyanBright,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                  h2: GoogleFonts.spaceGrotesk(
                    color: CyberNeonTheme.cyan,
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                  ),
                  h3: GoogleFonts.jetBrainsMono(
                    color: CyberNeonTheme.sky,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                  p: GoogleFonts.jetBrainsMono(
                    color: CyberNeonTheme.textSecondary,
                    fontSize: 13,
                    height: 1.5,
                  ),
                  code: GoogleFonts.jetBrainsMono(
                    color: CyberNeonTheme.cyanBright,
                    backgroundColor: CyberNeonTheme.backgroundDeep,
                    fontSize: 12,
                  ),
                  codeblockDecoration: BoxDecoration(
                    color: CyberNeonTheme.backgroundDeep,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: CyberNeonTheme.borderCyan),
                  ),
                  blockquoteDecoration: BoxDecoration(
                    color: CyberNeonTheme.cyan.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(4),
                    border: const Border(
                      left: BorderSide(color: CyberNeonTheme.cyan, width: 3),
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
