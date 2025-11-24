# Walkthrough - Gift Card Calculator

I have successfully built the Gift Card Calculator with a mobile-first design and optimization logic.

## Features Implemented
1.  **Mobile-First UI**: Single column layout with large touch targets.
2.  **Gift Card Management**: Add multiple cards with Value and Quantity.
3.  **Item Management**:
    *   Card-based layout.
    *   **Stepper Controls** for Min/Max Quantity.
    *   Add/Delete functionality.
4.  **Optimisation Logic**:
    *   Calculates **Best Cash Topup** (minimising cash out-of-pocket).
    *   Calculates **Best Card Loss** (minimising wasted card value).
    *   Handles multiple items and quantities.
5.  **Interactive Results**:
    *   Click on result cards to toggle detailed breakdown.
    *   Shows specific items purchased and gift cards used for each strategy.

## Verification Results

### Scenario 1: Single Item ($45) vs $50 Card
*   **Input**: Item $45. Card $50.
*   **Result**:
    *   **Best Cash Topup**: $45.00 (Pay cash, save card).
    *   **Best Card Loss**: $5.00 (Use card, lose $5 value).

### Scenario 2: Multiple Items ($105) vs 2x $50 Cards
*   **Input**: Items $45 + $60 = $105. Cards 2x $50 = $100.
*   **Result**:
    *   **Best Cash Topup**: $5.00 (Use both cards, pay $5 diff).
    *   **Best Card Loss**: $0.00 (Fully utilised cards).

## Visuals
The application is live at `index.html`.

### Interactive Results Test (v1.1)
![Interactive Results](/home/tezza/.gemini/antigravity/brain/ed4ed5f5-5243-4c7a-a573-e3b53b85fd30/verify_ids_sed_fix_1763957826580.webp)
