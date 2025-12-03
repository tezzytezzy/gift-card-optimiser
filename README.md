# Gift Card Optimiser

A static web app that helps you calculate the optimal combination of gift cards for your purchases.

## Goal
Find the sweet spot between paying extra cash (**Topup**) and leaving unused value on a card (**Loss**).

## Features
- 📱 **Mobile-First**: Designed for ease of use on small screens.
- ⚡ **Instant Calculation**: Real-time optimisation for multiple items and quantities.
- 📊 **Smart Results**: Compare "Best Cash Topup" vs "Best Card Loss" strategies.

## How to Run
No build process required. Just open `index.html` in any modern web browser.

## Improvements

### 1\. Algorithmic Complexity & Performance

The most critical improvements involve removing expensive operations inside loops and reducing Space Complexity.

#### **A. Permutation Generation**

  * **Version 1.0:** Uses an iterative approach that relies on `JSON.parse(JSON.stringify(temp))` to deep copy arrays at every step of the loop.
      * **Time Complexity:** $O(n \cdot k^n \cdot L)$ — where $L$ is the cost of serialization/deserialization (which grows as the array grows).
      * **Issue:** Serialization is extremely slow and blocks the CPU.
  * **Version 1.1:** Uses a recursive **Backtracking** approach (`helper` function).
      * **Time Complexity:** $O(k^n)$ — Pure generation of states without overhead.
      * **Improvement:** Eliminates the JSON serialization bottleneck entirely. It also calculates the `totalValue` *during* generation, avoiding a second iteration $O(N)$ pass later.

#### **B. Deal Finding (Combinatorics)**

  * **Version 1.0:**
    1.  Generates a full Cartesian product matrix of indices (`giftcardAndItemIdxMatrix`).
    2.  Iterates this matrix to create a `valueDiffCombos` array.
    3.  Finds the min/max value.
    4.  Iterates the array *again* repeatedly using `indexOf` inside a `while` loop to find matches.
    <!-- end list -->
      * **Space Complexity:** $O(G \times I)$ — It physically constructs an array containing every possible combination of gift cards vs. items. If you have 1,000 gift card combos and 1,000 item combos, this creates an array of 1,000,000 elements.
  * **Version 1.1:**
    1.  Uses a nested loop to compare `giftcardPerms` vs `itemPerms` directly.
    2.  Tracks the "best" deal variables (`bestDiff` and `matches`) in place.
    <!-- end list -->
      * **Space Complexity:** $O(1)$ (auxiliary) — It never stores the combination matrix. It only stores the winning matches.
      * **Improvement:** Drastic reduction in memory usage. Prevents heap overflow on large input sets.

### 2\. Code Quality & Maintainability

#### **A. Removal of Magic Numbers**

  * **Version 1.0:** Relies heavily on accessing array indices using numbers or variables like `obj.inputsArrDesc.valueArrIdx`.
    ```typescript
    // Version 1.0
    val * +obj.input[0][obj.inputsArrDesc.valueArrIdx]!
    ```
  * **Version 1.1:** Parses raw inputs into typed objects (`InputConfig`) at the very beginning.
    ```typescript
    // Version 1.1
    currentTotal + (count * item.value)
    ```

#### **B. Type Safety**

  * **Version 1.0:** Uses loose typing like `(number | string | undefined)[][]` and extensive use of the non-null assertion operator (`!`) inside business logic.
  * **Version 1.1:** Defines clear Interfaces (`InputConfig`, `Permutation`, `BestDealResult`). The messy parsing is contained within a single `parseInput` helper, keeping the core logic clean and type-safe.

#### **C. Structural Logic**

  * **Version 1.0:** Monolithic structure. The main function `rescueGiftcard` contains all other functions nested inside it. This makes unit testing the helper logic impossible.
  * **Version 1.1:** Modular structure. Helper functions (`generatePermutations`, `findBestDeal`) are extracted and exported (or effectively independent), making the code easier to read and test.

### 3\. Specific Anti-Pattern Removals

| Improvement Area | Version 1.0 Approach | Version 1.1 Approach |
| :--- | :--- | :--- |
| **Deep Copying** | `JSON.parse(JSON.stringify(arr))` | `[...arr]` (Shallow copy) or recursive immutability. |
| **Lookup** | `while (idx !== -1) { idx = arr.indexOf(...) }` <br> (This is $O(N^2)$ in worst case scan) | Single pass loop $O(N)$. |
| **Floating Point** | Ad-hoc `set2DecimalPlaces` calls scattered throughout. | Centralized logic; comparison logic handles precision using `.toFixed(2)` before comparing. |
| **Data Access** | `prop[obj.inputsArrDesc.minCountArrIdx]` | `item.min` |

### Summary of Big O Comparison

Let $G$ be the number of Giftcard permutations and $I$ be the number of Item permutations.

| Metric | Version 1.0 | Version 1.1 |
| :--- | :--- | :--- |
| **Permutation Generation Time** | $O(N \cdot Cost_{JSON})$ (Very Slow) | $O(N)$ (Fast) |
| **Comparison Time** | $O(G \times I)$ (Multiple passes) | $O(G \times I)$ (Single pass) |
| **Comparison Space** | **$O(G \times I)$** (Quadratic Memory) | **$O(1)$** (Constant Memory) |

