import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/config/app_config.dart';
import '../../core/theme/cyber_neon_theme.dart';

class BlueprintViewerScreen extends StatefulWidget {
  final String imageUrl;
  final String projectTitle;

  const BlueprintViewerScreen({
    Key? key,
    required this.imageUrl,
    required this.projectTitle,
  }) : super(key: key);

  @override
  State<BlueprintViewerScreen> createState() => _BlueprintViewerScreenState();
}

class _BlueprintViewerScreenState extends State<BlueprintViewerScreen> {
  final TransformationController _controller = TransformationController();
  double _scale = 1.0;

  @override
  void initState() {
    super.initState();
    _controller.addListener(() {
      setState(() {
        _scale = _controller.value.getMaxScaleOnAxis();
      });
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _zoomIn() {
    final nextScale = (_scale + 0.5).clamp(1.0, 4.0);
    _controller.value = Matrix4.identity()..scale(nextScale);
  }

  void _zoomOut() {
    final nextScale = (_scale - 0.5).clamp(1.0, 4.0);
    _controller.value = Matrix4.identity()..scale(nextScale);
  }

  void _resetZoom() {
    _controller.value = Matrix4.identity();
  }

  @override
  Widget build(BuildContext context) {
    final fullUrl = AppConfig.resolveUrl(widget.imageUrl);

    return Scaffold(
      backgroundColor: CyberNeonTheme.backgroundDeep,
      appBar: AppBar(
        backgroundColor: CyberNeonTheme.surface.withOpacity(0.95),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'ARCHITECTURE BLUEPRINT',
              style: GoogleFonts.jetBrainsMono(
                color: CyberNeonTheme.cyanBright,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              widget.projectTitle,
              style: GoogleFonts.jetBrainsMono(
                color: CyberNeonTheme.textSecondary,
                fontSize: 10,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
        actions: [
          Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              margin: const EdgeInsets.only(right: 8),
              decoration: BoxDecoration(
                color: CyberNeonTheme.backgroundDeep,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: CyberNeonTheme.borderCyan),
              ),
              child: Text(
                '${(_scale * 100).toInt()}%',
                style: GoogleFonts.jetBrainsMono(
                  color: CyberNeonTheme.cyan,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.zoom_out, size: 20),
            onPressed: _zoomOut,
            tooltip: 'Zoom Out',
          ),
          IconButton(
            icon: const Icon(Icons.zoom_in, size: 20),
            onPressed: _zoomIn,
            tooltip: 'Zoom In',
          ),
          IconButton(
            icon: const Icon(Icons.refresh, size: 18),
            onPressed: _resetZoom,
            tooltip: 'Reset 1:1',
          ),
        ],
      ),
      body: SafeArea(
        child: Center(
          child: InteractiveViewer(
            transformationController: _controller,
            minScale: 1.0,
            maxScale: 4.0,
            panEnabled: true,
            boundaryMargin: const EdgeInsets.all(32),
            child: Image.network(
              fullUrl,
              fit: BoxFit.contain,
              errorBuilder: (_, __, ___) => Center(
                child: Text(
                  'Failed to load architecture diagram.',
                  style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.crimson),
                ),
              ),
              loadingBuilder: (_, child, progress) {
                if (progress == null) return child;
                return Center(
                  child: CircularProgressIndicator(
                    value: progress.expectedTotalBytes != null
                        ? progress.cumulativeBytesLoaded / progress.expectedTotalBytes!
                        : null,
                    color: CyberNeonTheme.cyan,
                  ),
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}
