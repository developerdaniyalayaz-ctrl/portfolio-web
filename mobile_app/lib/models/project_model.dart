class ProjectModel {
  final int? id;
  final String title;
  final String category;
  final String techStack;
  final String description;
  final String? imageUrl;
  final String? liveUrl;
  final String? liveDemoUrl;
  final String? githubUrl;
  final String? youtubeUrl;
  final String? architectureImageUrl;
  final String? purchaseUrl;
  final String? purchasePrice;
  final bool allowCustomHire;
  final String? hireCustomSubject;
  final bool isPublished;
  final int? orderIndex;

  ProjectModel({
    this.id,
    required this.title,
    required this.category,
    required this.techStack,
    required this.description,
    this.imageUrl,
    this.liveUrl,
    this.liveDemoUrl,
    this.githubUrl,
    this.youtubeUrl,
    this.architectureImageUrl,
    this.purchaseUrl,
    this.purchasePrice,
    this.allowCustomHire = true,
    this.hireCustomSubject,
    this.isPublished = true,
    this.orderIndex,
  });

  List<String> get techStackList {
    return techStack
        .split(',')
        .map((e) => e.trim())
        .where((e) => e.isNotEmpty)
        .toList();
  }

  String get effectiveLiveUrl {
    if (liveUrl != null && liveUrl!.trim().isNotEmpty) return liveUrl!.trim();
    if (liveDemoUrl != null && liveDemoUrl!.trim().isNotEmpty) return liveDemoUrl!.trim();
    return '';
  }

  factory ProjectModel.fromJson(Map<String, dynamic> json) {
    return ProjectModel(
      id: json['id'] as int?,
      title: json['title'] ?? '',
      category: json['category'] ?? 'Web App',
      techStack: json['tech_stack'] ?? '',
      description: json['description'] ?? '',
      imageUrl: json['image_url'] as String?,
      liveUrl: json['live_url'] as String?,
      liveDemoUrl: json['live_demo_url'] as String?,
      githubUrl: json['github_url'] as String?,
      youtubeUrl: json['youtube_url'] as String?,
      architectureImageUrl: json['architecture_image_url'] as String?,
      purchaseUrl: json['purchase_url'] as String?,
      purchasePrice: json['purchase_price'] as String?,
      allowCustomHire: json['allow_custom_hire'] ?? true,
      hireCustomSubject: json['hire_custom_subject'] as String?,
      isPublished: json['is_published'] ?? true,
      orderIndex: json['order_index'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'title': title,
      'category': category,
      'tech_stack': techStack,
      'description': description,
      'image_url': imageUrl ?? '',
      'live_url': effectiveLiveUrl,
      'live_demo_url': effectiveLiveUrl,
      'github_url': githubUrl,
      'youtube_url': youtubeUrl ?? '',
      'architecture_image_url': architectureImageUrl ?? '',
      'purchase_url': purchaseUrl ?? '',
      'purchase_price': purchasePrice ?? '',
      'allow_custom_hire': allowCustomHire,
      'hire_custom_subject': hireCustomSubject ?? '',
      'is_published': isPublished,
      if (orderIndex != null) 'order_index': orderIndex,
    };
  }

  ProjectModel copyWith({
    int? id,
    String? title,
    String? category,
    String? techStack,
    String? description,
    String? imageUrl,
    String? liveUrl,
    String? liveDemoUrl,
    String? githubUrl,
    String? youtubeUrl,
    String? architectureImageUrl,
    String? purchaseUrl,
    String? purchasePrice,
    bool? allowCustomHire,
    String? hireCustomSubject,
    bool? isPublished,
    int? orderIndex,
  }) {
    return ProjectModel(
      id: id ?? this.id,
      title: title ?? this.title,
      category: category ?? this.category,
      techStack: techStack ?? this.techStack,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      liveUrl: liveUrl ?? this.liveUrl,
      liveDemoUrl: liveDemoUrl ?? this.liveDemoUrl,
      githubUrl: githubUrl ?? this.githubUrl,
      youtubeUrl: youtubeUrl ?? this.youtubeUrl,
      architectureImageUrl: architectureImageUrl ?? this.architectureImageUrl,
      purchaseUrl: purchaseUrl ?? this.purchaseUrl,
      purchasePrice: purchasePrice ?? this.purchasePrice,
      allowCustomHire: allowCustomHire ?? this.allowCustomHire,
      hireCustomSubject: hireCustomSubject ?? this.hireCustomSubject,
      isPublished: isPublished ?? this.isPublished,
      orderIndex: orderIndex ?? this.orderIndex,
    );
  }
}
