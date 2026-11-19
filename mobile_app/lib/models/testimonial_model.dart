class TestimonialModel {
  final int? id;
  final String clientName;
  final String clientRole;
  final String platformBadge;
  final String reviewText;
  final int rating;
  final bool verified;
  final int orderIndex;
  final bool isActive;

  TestimonialModel({
    this.id,
    required this.clientName,
    this.clientRole = '',
    this.platformBadge = 'Enterprise Client',
    required this.reviewText,
    this.rating = 5,
    this.verified = true,
    this.orderIndex = 0,
    this.isActive = true,
  });

  factory TestimonialModel.fromJson(Map<String, dynamic> json) {
    return TestimonialModel(
      id: json['id'] as int?,
      clientName: json['client_name'] ?? '',
      clientRole: json['client_role'] ?? '',
      platformBadge: json['platform_badge'] ?? 'Enterprise Client',
      reviewText: json['review_text'] ?? '',
      rating: json['rating'] ?? 5,
      verified: json['verified'] ?? true,
      orderIndex: json['order_index'] ?? 0,
      isActive: json['is_active'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'client_name': clientName,
      'client_role': clientRole,
      'platform_badge': platformBadge,
      'review_text': reviewText,
      'rating': rating,
      'verified': verified,
      'order_index': orderIndex,
      'is_active': isActive,
    };
  }
}
