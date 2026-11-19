class ImpactMetricModel {
  final int? id;
  final String metricValue;
  final String metricLabel;
  final String subContext;
  final String accentColor;
  final int orderIndex;
  final bool isActive;

  ImpactMetricModel({
    this.id,
    required this.metricValue,
    required this.metricLabel,
    this.subContext = '',
    this.accentColor = 'cyan',
    this.orderIndex = 0,
    this.isActive = true,
  });

  factory ImpactMetricModel.fromJson(Map<String, dynamic> json) {
    return ImpactMetricModel(
      id: json['id'] as int?,
      metricValue: json['metric_value'] ?? '',
      metricLabel: json['metric_label'] ?? '',
      subContext: json['sub_context'] ?? '',
      accentColor: json['accent_color'] ?? 'cyan',
      orderIndex: json['order_index'] ?? 0,
      isActive: json['is_active'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'metric_value': metricValue,
      'metric_label': metricLabel,
      'sub_context': subContext,
      'accent_color': accentColor,
      'order_index': orderIndex,
      'is_active': isActive,
    };
  }
}
