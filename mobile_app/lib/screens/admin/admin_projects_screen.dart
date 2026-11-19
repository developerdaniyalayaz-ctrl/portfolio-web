import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/theme/cyber_neon_theme.dart';
import '../../models/project_model.dart';
import '../../providers/portfolio_providers.dart';
import '../../widgets/cyber_card.dart';
import '../../widgets/neon_badge.dart';

class AdminProjectsScreen extends ConsumerStatefulWidget {
  const AdminProjectsScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<AdminProjectsScreen> createState() => _AdminProjectsScreenState();
}

class _AdminProjectsScreenState extends ConsumerState<AdminProjectsScreen> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _openProjectModal([ProjectModel? existing]) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: CyberNeonTheme.surfaceElevated,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        side: BorderSide(color: CyberNeonTheme.borderCyan),
      ),
      builder: (ctx) => _ProjectFormSheet(project: existing),
    );
  }

  Future<void> _deleteProject(ProjectModel project) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: CyberNeonTheme.surface,
        title: Text('PURGE PROJECT?', style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.crimson, fontSize: 13, fontWeight: FontWeight.bold)),
        content: Text('Are you sure you want to delete "${project.title}"?', style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textSecondary, fontSize: 12)),
        actions: [
          TextButton(
            child: Text('CANCEL', style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textMuted)),
            onPressed: () => Navigator.pop(ctx, false),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: CyberNeonTheme.crimson, foregroundColor: Colors.white),
            child: Text('PURGE', style: GoogleFonts.jetBrainsMono(fontWeight: FontWeight.bold)),
            onPressed: () => Navigator.pop(ctx, true),
          ),
        ],
      ),
    );

    if (confirm == true && project.id != null) {
      final repo = ref.read(portfolioRepositoryProvider);
      await repo.deleteProject(project.id!);
      ref.invalidate(adminProjectsProvider);
      ref.invalidate(publicProjectsProvider);
      ref.invalidate(adminStatsProvider);
    }
  }

  @override
  Widget build(BuildContext context) {
    final projectsAsync = ref.watch(adminProjectsProvider);

    return Scaffold(
      backgroundColor: CyberNeonTheme.background,
      floatingActionButton: FloatingActionButton(
        backgroundColor: CyberNeonTheme.cyan,
        foregroundColor: Colors.black,
        tooltip: 'Add Project',
        onPressed: () => _openProjectModal(),
        child: const Icon(Icons.add),
      ),
      body: Column(
        children: [
          // Search & Filter
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              controller: _searchController,
              style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 12),
              decoration: InputDecoration(
                hintText: 'Search title, tech stack...',
                prefixIcon: const Icon(Icons.search, size: 18, color: CyberNeonTheme.cyan),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 16),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {});
                        },
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              ),
              onChanged: (_) => setState(() {}),
            ),
          ),

          // Project List
          Expanded(
            child: projectsAsync.when(
              data: (allProjects) {
                final query = _searchController.text.trim().toLowerCase();
                final filtered = allProjects.where((p) {
                  if (query.isEmpty) return true;
                  return p.title.toLowerCase().contains(query) ||
                      p.techStack.toLowerCase().contains(query) ||
                      p.category.toLowerCase().contains(query);
                }).toList();

                if (filtered.isEmpty) {
                  return Center(
                    child: Text('No projects found.', style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textMuted)),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.fromLTRB(12, 0, 12, 80),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final p = filtered[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: CyberCard(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Project status badge
                            Column(
                              children: [
                                Switch(
                                  value: p.isPublished,
                                  activeColor: CyberNeonTheme.emerald,
                                  onChanged: (val) async {
                                    if (p.id != null) {
                                      await ref.read(portfolioRepositoryProvider).toggleProjectStatus(p.id!);
                                      ref.invalidate(adminProjectsProvider);
                                      ref.invalidate(publicProjectsProvider);
                                      ref.invalidate(adminStatsProvider);
                                    }
                                  },
                                ),
                                Text(
                                  p.isPublished ? 'LIVE' : 'DRAFT',
                                  style: GoogleFonts.jetBrainsMono(
                                    color: p.isPublished ? CyberNeonTheme.emerald : CyberNeonTheme.amber,
                                    fontSize: 8.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(width: 8),

                            // Main Details
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      NeonBadge(text: p.category, color: CyberNeonTheme.cyan),
                                      if (p.purchasePrice != null && p.purchasePrice!.isNotEmpty) ...[
                                        const SizedBox(width: 6),
                                        NeonBadge(text: p.purchasePrice!, color: CyberNeonTheme.amber),
                                      ],
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    p.title,
                                    style: GoogleFonts.jetBrainsMono(
                                      color: CyberNeonTheme.textPrimary,
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    p.techStack,
                                    style: GoogleFonts.jetBrainsMono(
                                      color: CyberNeonTheme.textMuted,
                                      fontSize: 10.5,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),

                            // Actions
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.edit_outlined, size: 18, color: CyberNeonTheme.cyan),
                                  onPressed: () => _openProjectModal(p),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, size: 18, color: CyberNeonTheme.crimson),
                                  onPressed: () => _deleteProject(p),
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

class _ProjectFormSheet extends ConsumerStatefulWidget {
  final ProjectModel? project;

  const _ProjectFormSheet({Key? key, this.project}) : super(key: key);

  @override
  ConsumerState<_ProjectFormSheet> createState() => _ProjectFormSheetState();
}

class _ProjectFormSheetState extends ConsumerState<_ProjectFormSheet> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _categoryController = TextEditingController();
  final _techStackController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _imageUrlController = TextEditingController();
  final _archUrlController = TextEditingController();
  final _liveUrlController = TextEditingController();
  final _githubUrlController = TextEditingController();
  final _youtubeUrlController = TextEditingController();
  final _purchaseUrlController = TextEditingController();
  final _purchasePriceController = TextEditingController();
  final _hireSubjectController = TextEditingController();

  bool _allowCustomHire = true;
  bool _isPublished = true;
  bool _saving = false;
  bool _uploadingImage = false;
  bool _uploadingArch = false;

  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    if (widget.project != null) {
      final p = widget.project!;
      _titleController.text = p.title;
      _categoryController.text = p.category;
      _techStackController.text = p.techStack;
      _descriptionController.text = p.description;
      _imageUrlController.text = p.imageUrl ?? '';
      _archUrlController.text = p.architectureImageUrl ?? '';
      _liveUrlController.text = p.effectiveLiveUrl;
      _githubUrlController.text = p.githubUrl ?? '';
      _youtubeUrlController.text = p.youtubeUrl ?? '';
      _purchaseUrlController.text = p.purchaseUrl ?? '';
      _purchasePriceController.text = p.purchasePrice ?? '';
      _hireSubjectController.text = p.hireCustomSubject ?? '';
      _allowCustomHire = p.allowCustomHire;
      _isPublished = p.isPublished;
    } else {
      _categoryController.text = 'Web App';
      _techStackController.text = 'React, FastAPI, Docker';
      _descriptionController.text = '### Case Study\nFull-stack system specification...';
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _categoryController.dispose();
    _techStackController.dispose();
    _descriptionController.dispose();
    _imageUrlController.dispose();
    _archUrlController.dispose();
    _liveUrlController.dispose();
    _githubUrlController.dispose();
    _youtubeUrlController.dispose();
    _purchaseUrlController.dispose();
    _purchasePriceController.dispose();
    _hireSubjectController.dispose();
    super.dispose();
  }

  Future<void> _pickAndUploadImage({required bool isArchitecture}) async {
    final picked = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (picked == null) return;

    setState(() {
      if (isArchitecture) _uploadingArch = true;
      else _uploadingImage = true;
    });

    try {
      final repo = ref.read(portfolioRepositoryProvider);
      final url = await repo.uploadAsset(File(picked.path));
      setState(() {
        if (isArchitecture) _archUrlController.text = url;
        else _imageUrlController.text = url;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Upload failed: $e'), backgroundColor: CyberNeonTheme.crimson),
        );
      }
    } finally {
      setState(() {
        if (isArchitecture) _uploadingArch = false;
        else _uploadingImage = false;
      });
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _saving = true);
    try {
      final repo = ref.read(portfolioRepositoryProvider);
      final model = ProjectModel(
        id: widget.project?.id,
        title: _titleController.text.trim(),
        category: _categoryController.text.trim(),
        techStack: _techStackController.text.trim(),
        description: _descriptionController.text.trim(),
        imageUrl: _imageUrlController.text.trim(),
        architectureImageUrl: _archUrlController.text.trim(),
        liveUrl: _liveUrlController.text.trim(),
        liveDemoUrl: _liveUrlController.text.trim(),
        githubUrl: _githubUrlController.text.trim().isNotEmpty ? _githubUrlController.text.trim() : null,
        youtubeUrl: _youtubeUrlController.text.trim(),
        purchaseUrl: _purchaseUrlController.text.trim(),
        purchasePrice: _purchasePriceController.text.trim(),
        allowCustomHire: _allowCustomHire,
        hireCustomSubject: _hireSubjectController.text.trim(),
        isPublished: _isPublished,
      );

      if (widget.project?.id != null) {
        await repo.updateProject(widget.project!.id!, model);
      } else {
        await repo.createProject(model);
      }

      ref.invalidate(adminProjectsProvider);
      ref.invalidate(publicProjectsProvider);
      ref.invalidate(adminStatsProvider);
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Save error: $e'), backgroundColor: CyberNeonTheme.crimson),
        );
      }
    } finally {
      setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        top: 16,
        left: 16,
        right: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    widget.project == null ? 'REGISTER NEW PROJECT' : 'EDIT PROJECT SPEC',
                    style: GoogleFonts.jetBrainsMono(
                      color: CyberNeonTheme.cyanBright,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const Divider(color: CyberNeonTheme.borderCyan),

              // Title
              _buildFieldLabel('PROJECT TITLE *'),
              TextFormField(
                controller: _titleController,
                style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 13),
                decoration: const InputDecoration(hintText: 'e.g. Aegis AI Autonomous Threat Detector'),
                validator: (val) => val == null || val.trim().isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 12),

              // Category & Tech Stack
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFieldLabel('CATEGORY *'),
                        TextFormField(
                          controller: _categoryController,
                          style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 13),
                          decoration: const InputDecoration(hintText: 'AI/ML, Web App...'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFieldLabel('TECH STACK *'),
                        TextFormField(
                          controller: _techStackController,
                          style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 13),
                          decoration: const InputDecoration(hintText: 'React, FastAPI, PyTorch'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Media Upload: Cover Image
              _buildFieldLabel('COVER IMAGE URL'),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _imageUrlController,
                      style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 12),
                      decoration: const InputDecoration(hintText: '/uploads/cover.jpg or https://...'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: CyberNeonTheme.surfaceElevated,
                      foregroundColor: CyberNeonTheme.cyan,
                      side: const BorderSide(color: CyberNeonTheme.borderCyan),
                    ),
                    icon: _uploadingImage
                        ? const SizedBox(width: 12, height: 12, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.upload, size: 14),
                    label: const Text('UPLOAD'),
                    onPressed: () => _pickAndUploadImage(isArchitecture: false),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Media Upload: 16:9 Architecture Blueprint
              _buildFieldLabel('16:9 ARCHITECTURE BLUEPRINT URL'),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _archUrlController,
                      style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 12),
                      decoration: const InputDecoration(hintText: '/uploads/blueprint.png or https://...'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: CyberNeonTheme.surfaceElevated,
                      foregroundColor: CyberNeonTheme.cyan,
                      side: const BorderSide(color: CyberNeonTheme.borderCyan),
                    ),
                    icon: _uploadingArch
                        ? const SizedBox(width: 12, height: 12, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.upload, size: 14),
                    label: const Text('16:9 BLUEPRINT'),
                    onPressed: () => _pickAndUploadImage(isArchitecture: true),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Live, GitHub, YouTube
              _buildFieldLabel('LIVE PREVIEW URL'),
              TextFormField(
                controller: _liveUrlController,
                style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 12),
                decoration: const InputDecoration(hintText: 'https://demo.example.com'),
              ),
              const SizedBox(height: 10),

              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFieldLabel('GITHUB URL'),
                        TextFormField(
                          controller: _githubUrlController,
                          style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 12),
                          decoration: const InputDecoration(hintText: 'https://github.com/...'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFieldLabel('YOUTUBE DEMO URL'),
                        TextFormField(
                          controller: _youtubeUrlController,
                          style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 12),
                          decoration: const InputDecoration(hintText: 'https://youtu.be/...'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Commercial Monetization Section
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: CyberNeonTheme.backgroundDeep,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: CyberNeonTheme.borderAmber),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'COMMERCIAL MONETIZATION & ROUTING',
                      style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.amber, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 10),

                    Row(
                      children: [
                        Expanded(
                          flex: 2,
                          child: TextFormField(
                            controller: _purchaseUrlController,
                            style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 12),
                            decoration: const InputDecoration(hintText: 'Stripe / Gumroad checkout link'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          flex: 1,
                          child: TextFormField(
                            controller: _purchasePriceController,
                            style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 12),
                            decoration: const InputDecoration(hintText: r'Price ($49)'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),

                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text(
                        'Allow Custom Integration Routing',
                        style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 11),
                      ),
                      value: _allowCustomHire,
                      activeColor: CyberNeonTheme.cyan,
                      onChanged: (val) => setState(() => _allowCustomHire = val),
                    ),

                    if (_allowCustomHire) ...[
                      TextFormField(
                        controller: _hireSubjectController,
                        style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 12),
                        decoration: const InputDecoration(hintText: 'Prefilled Subject (Custom Integration: ...)'),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // Markdown Description
              _buildFieldLabel('CASE STUDY SPECIFICATION (MARKDOWN) *'),
              TextFormField(
                controller: _descriptionController,
                maxLines: 6,
                style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textPrimary, fontSize: 12),
                decoration: const InputDecoration(hintText: 'Full case study specification in Markdown...'),
              ),
              const SizedBox(height: 18),

              // Save Button
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: CyberNeonTheme.cyan,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: _saving ? null : _save,
                child: _saving
                    ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                    : Text(
                        widget.project == null ? 'CREATE PROJECT RECORD' : 'SAVE CHANGES',
                        style: GoogleFonts.jetBrainsMono(fontSize: 12, fontWeight: FontWeight.bold),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFieldLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 5),
      child: Text(
        text,
        style: GoogleFonts.jetBrainsMono(color: CyberNeonTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }
}
