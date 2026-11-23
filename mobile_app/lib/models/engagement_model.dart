import 'dart:convert';

class EngagementModel {
  final int? id;
  final String tierBadge;
  final String title;
  final String timeline;
  final String summary;
  final String idealFor; // Alias for summary for UI backward compatibility
  final List<String> deliverables;
  final String accentColor;
  final bool isFeatured;
  final String pricingAnchor;
  final String inquirySubject;
  final int orderIndex;
  final bool isActive;

  EngagementModel({
    this.id,
    required this.tierBadge,
    required this.title,
    required this.timeline,
    this.summary = '',
    this.idealFor = '',
    required this.deliverables,
    this.accentColor = 'cyan',
    this.isFeatured = false,
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
      try {
        final decoded = jsonDecode(rawDeliv);
        if (decoded is List) {
          parsedDeliverables = decoded.map((e) => e.toString()).toList();
        } else {
          parsedDeliverables = rawDeliv.split('\n').where((e) => e.trim().isNotEmpty).toList();
        }
      } catch (_) {
        parsedDeliverables = rawDeliv.split('\n').where((e) => e.trim().isNotEmpty).toList();
      }
    }

    final summaryText = json['summary']?.toString() ?? json['ideal_for']?.toString() ?? '';

    return EngagementModel(
      id: json['id'] as int?,
      tierBadge: json['tier_badge']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      timeline: json['timeline']?.toString() ?? '',
      summary: summaryText,
      idealFor: summaryText,
      deliverables: parsedDeliverables,
      accentColor: json['accent_color']?.toString() ?? 'cyan',
      isFeatured: json['is_featured'] == true,
      pricingAnchor: json['pricing_anchor']?.toString() ?? '',
      inquirySubject: json['inquiry_subject']?.toString() ?? '',
      orderIndex: (json['order_index'] as num?)?.toInt() ?? 0,
      isActive: json['is_active'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'tier_badge': tierBadge,
      'title': title,
      'timeline': timeline,
      'summary': summary,
      'ideal_for': idealFor,
      'deliverables': deliverables,
      'accent_color': accentColor,
      'is_featured': isFeatured,
      'pricing_anchor': pricingAnchor,
      'inquiry_subject': inquirySubject,
      'order_index': orderIndex,
      'is_active': isActive,
    };
  }
}
