import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_app/main.dart';

void main() {
  testWidgets('CyberPortfolioApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: CyberPortfolioApp(),
      ),
    );
    expect(find.byType(CyberPortfolioApp), findsOneWidget);
  });
}
