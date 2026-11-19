class EngagementModel {
  final int? id;
  final String tierBadge;
  final String title;
  final String timeline;
  final String idealFor;
  final List<String> deliverables;
  final String pricingAnchor;
  final String inquirySubject;
  final int orderIndex;
  final bool isActive;

  EngagementModel({
    this.id,
    required this.tierBadge,
    required this.title,
    required this.timeline,
    this.idealFor = '',
    required this.deliverables,
    this.pricingAnchor = '',
    this.inquirySubject = '',
    this.orderIndex = 0,
    this.isActive = true,
  });

  factory EngagementModel.fromJson(Map<String, dynamic> json) {
    List<String> parsedDeliverables = [];
    final rawDeliv = json['deliverables'];
    if (rawDeliv is List) {
      parsedDeliverables = rawDeliv.map((e) => e.toString()).toList();
    } else if (rawDeliv is String) {
      parsedDeliverables = rawDeliv.split('\n').where((e) => e.trim().isNotEmpty).toList();
    }

    return EngagementModel(
      id: json['id'] as int?,
      tierBadge: json['tier_badge'] ?? '',
      title: json['title'] ?? '',
      timeline: json['timeline'] ?? '',
      idealFor: json['ideal_for'] ?? '',
      deliverables: parsedDeliverables,
      pricingAnchor: json['pricing_anchor'] ?? '',
      inquirySubject: json['inquiry_subject'] ?? '',
      orderIndex: json['order_index'] ?? 0,
      isActive: json['is_active'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'tier_badge': tierBadge,
      'title': title,
      'timeline': timeline,
      'ideal_for': idealFor,
      'deliverables': deliverables,
      'pricing_anchor': pricingAnchor,
      'inquiry_subject': inquirySubject,
      'order_index': orderIndex,
      'is_active': isActive,
    };
  }
}
