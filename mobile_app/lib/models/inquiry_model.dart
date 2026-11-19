class InquiryModel {
  final int? id;
  final String name;
  final String email;
  final String subject;
  final String message;
  final bool isRead;
  final String status;
  final String? replySubject;
  final String? replyBody;
  final DateTime? repliedAt;
  final DateTime? createdAt;

  InquiryModel({
    this.id,
    required this.name,
    required this.email,
    this.subject = 'Portfolio Contact',
    required this.message,
    this.isRead = false,
    this.status = 'NEW',
    this.replySubject,
    this.replyBody,
    this.repliedAt,
    this.createdAt,
  });

  factory InquiryModel.fromJson(Map<String, dynamic> json) {
    return InquiryModel(
      id: json['id'] as int?,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      subject: json['subject'] ?? 'Portfolio Contact',
      message: json['message'] ?? '',
      isRead: json['is_read'] ?? false,
      status: json['status'] ?? 'NEW',
      replySubject: json['reply_subject'] as String?,
      replyBody: json['reply_body'] as String?,
      repliedAt: json['replied_at'] != null ? DateTime.tryParse(json['replied_at']) : null,
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'name': name,
      'email': email,
      'subject': subject,
      'message': message,
      'is_read': isRead,
      'status': status,
      if (replySubject != null) 'reply_subject': replySubject,
      if (replyBody != null) 'reply_body': replyBody,
    };
  }
}
