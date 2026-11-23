class TestimonialModel {
  final int? id;
  final String clientName;
  final String clientRole;
  final String platformBadge;
  final String badgeColor;
  final String reviewText;
  final String projectRef;
  final int rating;
  final bool verified;
  final int orderIndex;
  final bool isActive;

  TestimonialModel({
    this.id,
    required this.clientName,
    this.clientRole = '',
    this.platformBadge = 'Enterprise Client',
    this.badgeColor = 'emerald',
    required this.reviewText,
    this.projectRef = '',
    this.rating = 5,
    this.verified = true,
    this.orderIndex = 0,
    this.isActive = true,
  });

  factory TestimonialModel.fromJson(Map<String, dynamic> json) {
    return TestimonialModel(
      id: json['id'] as int?,
      clientName: json['client_name']?.toString() ?? '',
      clientRole: json['client_role']?.toString() ?? '',
      platformBadge: json['platform_badge']?.toString() ?? 'Enterprise Client',
      badgeColor: json['badge_color']?.toString() ?? 'emerald',
      reviewText: json['review_text']?.toString() ?? '',
      projectRef: json['project_ref']?.toString() ?? '',
      rating: (json['rating'] as num?)?.toInt() ?? 5,
      verified: json['verified'] ?? true,
      orderIndex: (json['order_index'] as num?)?.toInt() ?? 0,
      isActive: json['is_active'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'client_name': clientName,
      'client_role': clientRole,
      'platform_badge': platformBadge,
      'badge_color': badgeColor,
      'review_text': reviewText,
      'project_ref': projectRef,
      'rating': rating,
      'verified': verified,
      'order_index': orderIndex,
      'is_active': isActive,
    };
  }
}
