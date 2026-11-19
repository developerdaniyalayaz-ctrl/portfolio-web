import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/theme/cyber_neon_theme.dart';

class NeonBadge extends StatelessWidget {
  final String text;
  final Color color;
  final IconData? icon;
  final double fontSize;
  final EdgeInsetsGeometry padding;

  const NeonBadge({
    Key? key,
    required this.text,
    this.color = CyberNeonTheme.cyan,
    this.icon,
    this.fontSize = 10,
    this.padding = const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withOpacity(0.4), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: fontSize + 2, color: color),
            const SizedBox(width: 4),
          ],
          Text(
            text.toUpperCase(),
            style: GoogleFonts.jetBrainsMono(
              color: color,
              fontSize: fontSize,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }
}
