# Implementation Plan - Gift Card Calculator

This plan outlines the steps to build the Gift Card Calculator web application based on the approved "Single Column v4" wireframe.

## Goal Description
Build a mobile-first static web application that calculates the optimal combination of gift cards to purchase a set of items, minimizing out-of-pocket cash and wasted card value.

## User Review Required
> [!IMPORTANT]
> **Algorithm Complexity**: The "optimal combination" calculation can be computationally intensive if the number of items and quantity ranges are large. I will implement a greedy approach or a simplified knapsack-style algorithm to ensure responsiveness on mobile devices.

## Proposed Changes

### Project Structure
#### [NEW] [index.html](file:///home/tezza/.gemini/antigravity/playground/frozen-juno/index.html)
-   **Structure**:
    -   Header/Summary section.
    -   **Gift Cards Section**: List of inputs (Value, Qty) + Add button.
    -   **Items Section**: List of Item Cards (Name, Price, Steppers for Min/Max Qty) + Add button.
    -   **Action Bar**: Sticky or prominent "Show me deals" button.
    -   **Results Section**: "Best Cash Topup" and "Best Card Loss" summary cards + details.
-   **Dependencies**: FontAwesome (for icons), Google Fonts (Inter/Roboto).

#### [NEW] [style.css](file:///home/tezza/.gemini/antigravity/playground/frozen-juno/style.css)
-   **Theme**: Modern, clean, grayscale/monochrome with accent color for primary actions.
-   **Mobile-First**: Flexbox/Grid layouts optimized for vertical scrolling.
-   **Components**:
    -   `card`: Container for items.
    -   `stepper`: Custom control for quantity inputs.
    -   `input-group`: Styled form inputs.
    -   `btn-primary`: Large, touch-friendly buttons.

#### [NEW] [script.js](file:///home/tezza/.gemini/antigravity/playground/frozen-juno/script.js)
-   **State Management**:
    -   `giftCards`: Array of `{ id, value, qty }`.
    -   `items`: Array of `{ id, name, price, minQty, maxQty }`.
-   **DOM Manipulation**:
    -   Functions to render Gift Card rows and Item Cards.
    -   Event listeners for Add/Delete/Update.
    -   Stepper logic (+/-).
-   **Calculation Logic**:
    -   `calculateOptimalCombination()`:
        1.  **Validation**: Check inputs. If invalid, apply `.input-error` class, show alert, and focus first invalid element.
        2.  Determine total cost range (Min Total to Max Total).
        3.  Find combination of gift cards that covers the cost with minimal remainder (Card Loss) or minimal extra cash needed (Cash Topup).
    -   Display results dynamically.

### [MODIFY] [index.html](file:///home/tezza/.gemini/antigravity/playground/frozen-juno/index.html)
-   **Gift Card Template**: Replace simple quantity input with `stepper` component (same as Items).

### [MODIFY] [style.css](file:///home/tezza/.gemini/antigravity/playground/frozen-juno/style.css)
-   **Validation Styles**: Add `.input-error` class (red border, shake animation).

### [MODIFY] [script.js](file:///home/tezza/.gemini/antigravity/playground/frozen-juno/script.js)
-   **Gift Card Logic**: Add stepper event listeners to Gift Card rows.
-   **Validation**: Implement custom validation logic in `calculateResults`.

## Verification Plan

### Automated Tests
-   None planned for this static site (unless requested).

### Manual Verification
1.  **UI Responsiveness**: Open `index.html` in mobile view (Chrome DevTools). Verify layout of Item Cards and Steppers.
2.  **Input Handling**:
    -   Add/Remove Gift Cards.
    -   Add/Remove Items.
    -   Test Steppers (ensure they don't go below 0).
3.  **Calculation Accuracy**:
    -   Scenario A: Item cost $45. Cards: $20 (x3). Expect: Use 2 cards ($40) + $5 Cash Topup OR Use 3 cards ($60) + $15 Card Loss (depending on preference, usually Topup is preferred if Loss is high). *Correction: The tool should show both options.*
    -   Scenario B: Item cost $100. Cards: $50 (x2). Expect: Exact match.
