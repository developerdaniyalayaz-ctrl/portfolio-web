import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class CyberNeonTheme {
  // Core Obsidian Palettes
  static const Color background = Color(0xFF050811);
  static const Color backgroundDeep = Color(0xFF03060F);
  static const Color surface = Color(0xFF080D1E);
  static const Color surfaceElevated = Color(0xFF0A1024);
  static const Color surfaceHighlight = Color(0xFF0D1530);

  // Neon Accent Spectrum
  static const Color cyan = Color(0xFF06B6D4);
  static const Color cyanBright = Color(0xFF00F0FF);
  static const Color emerald = Color(0xFF10B981);
  static const Color emeraldBright = Color(0xFF34D399);
  static const Color amber = Color(0xFFF59E0B);
  static const Color sky = Color(0xFF38BDF8);
  static const Color violet = Color(0xFF8B5CF6);
  static const Color crimson = Color(0xFFF43F5E);

  // Border & Glow Colors
  static const Color borderCyan = Color(0x3306B6D4);
  static const Color borderCyanHighlight = Color(0x6606B6D4);
  static const Color borderEmerald = Color(0x3310B981);
  static const Color borderAmber = Color(0x33F59E0B);
  static const Color borderSubtle = Color(0x1A94A3B8);

  // Text Colors
  static const Color textPrimary = Color(0xFFF8FAFC);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF64748B);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      primaryColor: cyan,
      colorScheme: const ColorScheme.dark(
        primary: cyan,
        secondary: emerald,
        surface: surface,
        background: background,
        error: crimson,
        onPrimary: Colors.black,
        onSecondary: Colors.black,
        onSurface: textPrimary,
        onBackground: textPrimary,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: background.withOpacity(0.9),
        elevation: 0,
        centerTitle: false,
        iconTheme: const IconThemeData(color: cyan),
        titleTextStyle: GoogleFonts.jetBrainsMono(
          color: textPrimary,
          fontSize: 16,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: surfaceElevated,
        selectedItemColor: cyanBright,
        unselectedItemColor: textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      cardTheme: CardThemeData(
        color: surface,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: const BorderSide(color: borderCyan, width: 1),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: backgroundDeep,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        hintStyle: GoogleFonts.jetBrainsMono(color: textMuted, fontSize: 13),
        labelStyle: GoogleFonts.jetBrainsMono(color: textSecondary, fontSize: 13),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: borderSubtle),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: borderCyan),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: cyanBright, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: crimson),
        ),
      ),
      textTheme: TextTheme(
        headlineLarge: GoogleFonts.spaceGrotesk(
          color: textPrimary,
          fontSize: 28,
          fontWeight: FontWeight.bold,
          letterSpacing: -0.5,
        ),
        headlineMedium: GoogleFonts.spaceGrotesk(
          color: textPrimary,
          fontSize: 22,
          fontWeight: FontWeight.bold,
        ),
        titleLarge: GoogleFonts.jetBrainsMono(
          color: textPrimary,
          fontSize: 17,
          fontWeight: FontWeight.w700,
        ),
        titleMedium: GoogleFonts.jetBrainsMono(
          color: textPrimary,
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
        bodyLarge: GoogleFonts.jetBrainsMono(
          color: textPrimary,
          fontSize: 14,
          height: 1.5,
        ),
        bodyMedium: GoogleFonts.jetBrainsMono(
          color: textSecondary,
          fontSize: 12.5,
          height: 1.4,
        ),
        bodySmall: GoogleFonts.jetBrainsMono(
          color: textMuted,
          fontSize: 11,
        ),
        labelLarge: GoogleFonts.jetBrainsMono(
          color: textPrimary,
          fontSize: 12.5,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  // Neon Box Shadow Decoration Helper
  static List<BoxShadow> neonGlow({Color color = cyan, double spread = 0, double blur = 14, double opacity = 0.25}) {
    return [
      BoxShadow(
        color: color.withOpacity(opacity),
        spreadRadius: spread,
        blurRadius: blur,
      ),
    ];
  }
}
