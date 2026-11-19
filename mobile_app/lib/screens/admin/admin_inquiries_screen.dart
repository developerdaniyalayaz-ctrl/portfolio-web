import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/theme/cyber_neon_theme.dart';
import '../../models/inquiry_model.dart';
import '../../providers/portfolio_providers.dart';
import '../../widgets/cyber_card.dart';
import '../../widgets/neon_badge.dart';

class AdminInquiriesScreen extends ConsumerStatefulWidget {
  const AdminInquiriesScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<AdminInquiriesScreen> createState() => _AdminInquiriesScreenState();
}

class _AdminInquiriesScreenState extends ConsumerState<AdminInquiriesScreen> {
  String _statusFilter = 'ALL';

  Color _statusColor(String status) {
    switch (status.toUpperCase()) {
      case 'NEW':
        return CyberNeonTheme.amber;
      case 'REPLIED':
        return CyberNeonTheme.emerald;
      default:
        return CyberNeonTheme.cyan;
    }
  }

  void _openReplyDialog(InquiryModel inq) {
    final subjectController = TextEditingController(text: 'Re: ${inq.subject}');
    final messageController = TextEditingController(text: 'Hi ${inq.name},\n\nThank you for reaching out regarding your project.\n\n');
    bool sending = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: CyberNeonTheme.surfaceElevated,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: const BorderSide(color: CyberNeonTheme.borderCyan),
          ),
          title: Row(
            children: [
              const Icon(Icons.send_outlined, size: 16, color: CyberNeonTheme.cyanBright),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'DIRECT SMTP REPLY',
                  style: GoogleFonts.jetBrainsMono(
                    color: CyberNeonTheme.textPrimary,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'TO: ${inq.name} <${inq.email}>',
                  style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.cyan, fontSize: 11),
                ),
                const SizedBox(height: 12),
                Text(
                  'SUBJECT',
                  style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textSecondary, fontSize: 10),
                ),
                const SizedBox(height: 4),
                TextField(
                  controller: subjectController,
                  style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 12),
                ),
                const SizedBox(height: 12),
                Text(
                  'MESSAGE BODY',
                  style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textSecondary, fontSize: 10),
                ),
                const SizedBox(height: 4),
                TextField(
                  controller: messageController,
                  maxLines: 5,
                  style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 12),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              child: Text('CANCEL', style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textMuted)),
              onPressed: () => Navigator.pop(ctx),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: CyberNeonTheme.cyan, foregroundColor: Colors.black),
              onPressed: sending
                  ? null
                  : () async {
                      setDialogState(() => sending = true);
                      try {
                        final repo = ref.read(portfolioRepositoryProvider);
                        await repo.replyInquiry(inq.id!, subjectController.text.trim(), messageController.text.trim());
                        ref.invalidate(adminInquiriesProvider);
                        ref.invalidate(adminStatsProvider);
                        if (mounted) Navigator.pop(ctx);
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Email reply dispatched directly to ${inq.email}.'),
                              backgroundColor: CyberNeonTheme.emerald,
                            ),
                          );
                        }
                      } catch (e) {
                        setDialogState(() => sending = false);
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('SMTP Error: $e'), backgroundColor: CyberNeonTheme.crimson),
                          );
                        }
                      }
                    },
              child: sending
                  ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                  : Text('SEND DIRECT EMAIL', style: GoogleFonts.jetBrainsMono(fontWeight: FontWeight.bold, fontSize: 11)),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _deleteInquiry(InquiryModel inq) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: CyberNeonTheme.surface,
        title: Text('PURGE LEAD?', style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.crimson, fontSize: 13, fontWeight: FontWeight.bold)),
        content: Text('Delete inquiry from ${inq.name}?', style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textSecondary, fontSize: 12)),
        actions: [
          TextButton(
            child: Text('CANCEL', style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textMuted)),
            onPressed: () => Navigator.pop(ctx, false),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: CyberNeonTheme.crimson, foregroundColor: Colors.white),
            child: Text('DELETE', style: GoogleFonts.jetBrainsMono(fontWeight: FontWeight.bold)),
            onPressed: () => Navigator.pop(ctx, true),
          ),
        ],
      ),
    );

    if (confirm == true && inq.id != null) {
      await ref.read(portfolioRepositoryProvider).deleteInquiry(inq.id!);
      ref.invalidate(adminInquiriesProvider);
      ref.invalidate(adminStatsProvider);
    }
  }

  @override
  Widget build(BuildContext context) {
    final inquiriesAsync = ref.watch(adminInquiriesProvider);

    return Scaffold(
      backgroundColor: CyberNeonTheme.background,
      body: Column(
        children: [
          // Filter Tabs
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: ['ALL', 'NEW', 'REPLIED'].map((status) {
                final selected = _statusFilter == status;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(
                      status,
                      style: GoogleFonts.jetBrainsMono(
                        color: selected ? Colors.black : CyberNeonTheme.textSecondary,
                        fontSize: 10.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    selected: selected,
                    selectedColor: CyberNeonTheme.cyanBright,
                    backgroundColor: CyberNeonTheme.surfaceElevated,
                    onSelected: (val) {
                      if (val) setState(() => _statusFilter = status);
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          // Inquiries List
          Expanded(
            child: inquiriesAsync.when(
              data: (allInquiries) {
                final filtered = allInquiries.where((inq) {
                  if (_statusFilter == 'ALL') return true;
                  return inq.status.toUpperCase() == _statusFilter;
                }).toList();

                if (filtered.isEmpty) {
                  return Center(
                    child: Text('No inquiries in this category.', style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textMuted)),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final inq = filtered[index];
                    final dateStr = inq.createdAt != null ? DateFormat('MMM dd, yyyy · HH:mm').format(inq.createdAt!) : '';

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: CyberCard(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    NeonBadge(text: inq.status, color: _statusColor(inq.status)),
                                    const SizedBox(width: 8),
                                    Text(
                                      inq.name,
                                      style: GoogleFonts.jetBrainsMono(
                                        color: CyberNeonTheme.textPrimary,
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                                Text(
                                  dateStr,
                                  style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textMuted, fontSize: 9.5),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),

                            Text(
                              inq.email,
                              style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.cyan, fontSize: 11),
                            ),
                            const SizedBox(height: 6),

                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: CyberNeonTheme.backgroundDeep,
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: CyberNeonTheme.borderSubtle),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'SUBJECT: ${inq.subject}',
                                    style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    inq.message,
                                    style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 11.5, height: 1.4),
                                  ),
                                ],
                              ),
                            ),

                            if (inq.replyBody != null && inq.replyBody!.isNotEmpty) ...[
                              const SizedBox(height: 8),
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: CyberNeonTheme.emerald.withOpacity(0.08),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: CyberNeonTheme.borderEmerald),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'SENT DIRECT REPLY: ${inq.replySubject ?? ''}',
                                      style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.emerald, fontSize: 10, fontWeight: FontWeight.bold),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      inq.replyBody!,
                                      style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textSecondary, fontSize: 10.5),
                                      maxLines: 3,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                            const SizedBox(height: 10),

                            // Actions: Mark read, Reply, Delete
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                if (!inq.isRead && inq.id != null)
                                  TextButton.icon(
                                    style: TextButton.styleFrom(foregroundColor: CyberNeonTheme.cyan),
                                    icon: const Icon(Icons.check, size: 14),
                                    label: Text('MARK READ', style: GoogleFonts.jetBrainsMono(fontSize: 10)),
                                    onPressed: () async {
                                      await ref.read(portfolioRepositoryProvider).markInquiryRead(inq.id!);
                                      ref.invalidate(adminInquiriesProvider);
                                      ref.invalidate(adminStatsProvider);
                                    },
                                  ),
                                const SizedBox(width: 8),
                                ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: CyberNeonTheme.cyan,
                                    foregroundColor: Colors.black,
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  ),
                                  icon: const Icon(Icons.reply, size: 14),
                                  label: Text('REPLY EMAIL', style: GoogleFonts.jetBrainsMono(fontSize: 10, fontWeight: FontWeight.bold)),
                                  onPressed: () => _openReplyDialog(inq),
                                ),
                                const SizedBox(width: 8),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, size: 18, color: CyberNeonTheme.crimson),
                                  tooltip: 'Delete Lead',
                                  onPressed: () => _deleteInquiry(inq),
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
              error: (err, _) => Center(child: Text('Error: $err', style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.crimson))),
            ),
          ),
        ],
      ),
    );
  }
}
