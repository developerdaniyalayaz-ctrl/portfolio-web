import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/cyber_neon_theme.dart';
import '../../models/inquiry_model.dart';
import '../../providers/portfolio_providers.dart';
import '../../widgets/cyber_card.dart';

class ContactScreen extends ConsumerStatefulWidget {
  const ContactScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<ContactScreen> createState() => _ContactScreenState();
}

class _ContactScreenState extends ConsumerState<ContactScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _subjectController = TextEditingController();
  final _messageController = TextEditingController();

  bool _submitting = false;
  String? _successMessage;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    // Pre-fill subject if directed from an Engagement tier or Project Custom Hire
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final prefilled = ref.read(inquiryPrefillSubjectProvider);
      if (prefilled != null && prefilled.isNotEmpty) {
        _subjectController.text = prefilled;
        // Reset the provider after consumption
        ref.read(inquiryPrefillSubjectProvider.notifier).state = null;
      }
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _subjectController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _submitInquiry() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _submitting = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      final repo = ref.read(portfolioRepositoryProvider);
      final inquiry = InquiryModel(
        name: _nameController.text.trim(),
        email: _emailController.text.trim(),
        subject: _subjectController.text.trim().isNotEmpty
            ? _subjectController.text.trim()
            : 'Portfolio Mobile Lead',
        message: _messageController.text.trim(),
      );

      await repo.submitInquiry(inquiry);

      setState(() {
        _successMessage = 'Transmission secured. Your message has reached the engineer lead.';
        _nameController.clear();
        _emailController.clear();
        _subjectController.clear();
        _messageController.clear();
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
      });
    } finally {
      setState(() {
        _submitting = false;
      });
    }
  }

  Future<void> _launchExternal(String urlString) async {
    final uri = Uri.tryParse(urlString);
    if (uri != null && await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Listen for prefill updates while screen is active
    ref.listen<String?>(inquiryPrefillSubjectProvider, (previous, next) {
      if (next != null && next.isNotEmpty) {
        _subjectController.text = next;
        ref.read(inquiryPrefillSubjectProvider.notifier).state = null;
      }
    });

    final matrixAsync = ref.watch(publicContactMatrixProvider);

    return Scaffold(
      backgroundColor: CyberNeonTheme.background,
      appBar: AppBar(
        title: Text(
          'COMMISSION // DIRECT CONTACT INTAKE',
          style: GoogleFonts.jetBrainsMono(
            fontSize: 13,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Quick Channel Launchers (WhatsApp & Email)
            matrixAsync.when(
              data: (matrix) {
                final whatsappUrl = matrix['whatsapp_url'] as String? ?? '';
                final email = matrix['email'] as String? ?? 'daniyal.ayaz.ahmed@gmail.com';
                final showWhatsapp = matrix['show_whatsapp'] ?? true;

                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Row(
                    children: [
                      if (showWhatsapp && whatsappUrl.isNotEmpty) ...[
                        Expanded(
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: CyberNeonTheme.emerald.withOpacity(0.18),
                              foregroundColor: CyberNeonTheme.emeraldBright,
                              side: const BorderSide(color: CyberNeonTheme.borderEmerald),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            icon: const Icon(Icons.chat_bubble_outline, size: 16),
                            label: Text(
                              'WHATSAPP',
                              style: GoogleFonts.jetBrainsMono(fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                            onPressed: () => _launchExternal(whatsappUrl),
                          ),
                        ),
                        const SizedBox(width: 10),
                      ],
                      Expanded(
                        child: OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            foregroundColor: CyberNeonTheme.cyanBright,
                            side: const BorderSide(color: CyberNeonTheme.borderCyan),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          icon: const Icon(Icons.email_outlined, size: 16),
                          label: Text(
                            'DIRECT EMAIL',
                            style: GoogleFonts.jetBrainsMono(fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                          onPressed: () => _launchExternal('mailto:$email?subject=Client%20Project%20Inquiry'),
                        ),
                      ),
                    ],
                  ),
                );
              },
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),

            // Form Card
            CyberCard(
              padding: const EdgeInsets.all(18),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.satellite_alt_outlined, color: CyberNeonTheme.cyan, size: 16),
                        const SizedBox(width: 8),
                        Text(
                          'ENTERPRISE & FREELANCE INTAKE MATRIX',
                          style: GoogleFonts.jetBrainsMono(
                            color: CyberNeonTheme.textPrimary,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    if (_successMessage != null) ...[
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: CyberNeonTheme.emerald.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: CyberNeonTheme.emerald),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.check_circle, color: CyberNeonTheme.emerald, size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _successMessage!,
                                style: GoogleFonts.jetBrainsMono(
                                  color: CyberNeonTheme.emeraldBright,
                                  fontSize: 11.5,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    if (_errorMessage != null) ...[
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: CyberNeonTheme.crimson.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: CyberNeonTheme.crimson),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline, color: CyberNeonTheme.crimson, size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: GoogleFonts.jetBrainsMono(
                                  color: CyberNeonTheme.crimson,
                                  fontSize: 11.5,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Client Name
                    Text(
                      'YOUR NAME / ORGANIZATION *',
                      style: GoogleFonts.jetBrainsMono(fontSize: 10.5, color: CyberNeonTheme.textSecondary),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _nameController,
                      style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 13),
                      decoration: const InputDecoration(hintText: 'e.g. Alex Vance (Apex Systems)'),
                      validator: (val) => val == null || val.trim().isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 14),

                    // Client Email
                    Text(
                      'EMAIL ADDRESS *',
                      style: GoogleFonts.jetBrainsMono(fontSize: 10.5, color: CyberNeonTheme.textSecondary),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 13),
                      decoration: const InputDecoration(hintText: 'client@company.com'),
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) return 'Required';
                        if (!val.contains('@') || !val.contains('.')) return 'Invalid email';
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),

                    // Inquiry Subject
                    Text(
                      'SUBJECT / PROJECT TARGET *',
                      style: GoogleFonts.jetBrainsMono(fontSize: 10.5, color: CyberNeonTheme.textSecondary),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _subjectController,
                      style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 13),
                      decoration: const InputDecoration(hintText: 'Custom Integration / MVP Commission'),
                    ),
                    const SizedBox(height: 14),

                    // Message Body
                    Text(
                      'PROJECT BRIEF & REQUIREMENTS *',
                      style: GoogleFonts.jetBrainsMono(fontSize: 10.5, color: CyberNeonTheme.textSecondary),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _messageController,
                      maxLines: 4,
                      style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 13),
                      decoration: const InputDecoration(hintText: 'Describe goals, timeline, and tech specs...'),
                      validator: (val) => val == null || val.trim().isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 18),

                    // Submit CTA
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: CyberNeonTheme.cyan,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: _submitting ? null : _submitInquiry,
                        child: _submitting
                            ? const SizedBox(
                                height: 18,
                                width: 18,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                              )
                            : Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.send_rounded, size: 16),
                                  const SizedBox(width: 8),
                                  Text(
                                    'TRANSMIT INQUIRY',
                                    style: GoogleFonts.jetBrainsMono(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 0.8,
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
    );
  }
}
