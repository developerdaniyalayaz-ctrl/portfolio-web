import 'package:flutter/material.dart';
import '../core/theme/cyber_neon_theme.dart';

class CyberCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;
  final Color borderColor;
  final Color? glowColor;
  final Color backgroundColor;
  final double borderRadius;
  final bool hasTopAccent;
  final Color? topAccentColor;

  const CyberCard({
    Key? key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.onTap,
    this.borderColor = CyberNeonTheme.borderCyan,
    this.glowColor,
    this.backgroundColor = CyberNeonTheme.surface,
    this.borderRadius = 14,
    this.hasTopAccent = false,
    this.topAccentColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(borderRadius),
        border: Border.all(color: borderColor, width: 1),
        boxShadow: glowColor != null
            ? CyberNeonTheme.neonGlow(color: glowColor!, blur: 16, opacity: 0.2)
            : null,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius - 1),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            splashColor: CyberNeonTheme.cyan.withOpacity(0.1),
            highlightColor: CyberNeonTheme.cyan.withOpacity(0.05),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.min,
              children: [
                if (hasTopAccent)
                  Container(
                    height: 2,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          topAccentColor ?? CyberNeonTheme.cyanBright,
                          CyberNeonTheme.emerald,
                        ],
                      ),
                    ),
                  ),
                Padding(
                  padding: padding ?? EdgeInsets.zero,
                  child: child,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
