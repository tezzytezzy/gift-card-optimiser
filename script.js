document.addEventListener('DOMContentLoaded', () => {
    // State
    let giftCards = [];
    let items = [];

    // DOM Elements
    const giftCardsList = document.getElementById('gift-cards-list');
    const itemsList = document.getElementById('items-list');
    const addCardBtn = document.getElementById('add-card-btn');
    const addItemBtn = document.getElementById('add-item-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultsSection = document.getElementById('results-section');

    // Templates
    const giftCardTemplate = document.getElementById('template-gift-card');
    const itemCardTemplate = document.getElementById('template-item-card');

    // --- Initialization ---
    // Add one empty card and one empty item by default
    addGiftCard();
    addItem();

    // Global state for results
    let currentResults = {
        topup: null,
        loss: null
    };
    let currentSelection = 'topup'; // 'topup' or 'loss'

    // --- Event Listeners ---
    addCardBtn.addEventListener('click', addGiftCard);
    addItemBtn.addEventListener('click', addItem);
    calculateBtn.addEventListener('click', calculateResults);

    document.getElementById('card-topup').addEventListener('click', () => selectResult('topup'));
    document.getElementById('card-loss').addEventListener('click', () => selectResult('loss'));

    // --- Functions ---

    function selectResult(type) {
        currentSelection = type;

        // Update UI classes
        document.getElementById('card-topup').classList.toggle('selected', type === 'topup');
        document.getElementById('card-loss').classList.toggle('selected', type === 'loss');

        // Render details
        if (currentResults[type]) {
            renderDetailedResults(currentResults[type]);
        }
    }

    function addGiftCard() {
        const clone = giftCardTemplate.content.cloneNode(true);
        const row = clone.querySelector('.gift-card-row');

        // Delete button logic
        row.querySelector('.delete-card').addEventListener('click', () => {
            row.remove();
        });

        // Stepper Logic
        setupStepper(row.querySelector('.card-qty').parentElement.parentElement);

        giftCardsList.appendChild(row);
    }

    function addItem() {
        const clone = itemCardTemplate.content.cloneNode(true);
        const card = clone.querySelector('.item-card');

        // Delete button logic
        card.querySelector('.delete-item').addEventListener('click', () => {
            card.remove();
        });

        // Stepper Logic
        setupStepper(card.querySelector('.item-min-qty').parentElement);
        setupStepper(card.querySelector('.item-max-qty').parentElement);

        itemsList.appendChild(card);
    }

    function setupStepper(stepperElement) {
        // Handle both structure types (div.stepper or div.stepper-group > div.stepper)
        const stepper = stepperElement.classList.contains('stepper') ? stepperElement : stepperElement.querySelector('.stepper');
        if (!stepper) return;

        const input = stepper.querySelector('input');
        const minusBtn = stepper.querySelector('.minus');
        const plusBtn = stepper.querySelector('.plus');

        minusBtn.addEventListener('click', () => {
            let val = parseInt(input.value) || 0;
            if (val > 0) input.value = val - 1;
        });

        plusBtn.addEventListener('click', () => {
            let val = parseInt(input.value) || 0;
            input.value = val + 1;
        });
    }

    function calculateResults() {
        // Clear previous errors
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

        let hasError = false;
        let firstErrorEl = null;

        // 1. Parse Inputs
        const cards = [];
        document.querySelectorAll('.gift-card-row').forEach(row => {
            const valInput = row.querySelector('.card-value');
            const qtyInput = row.querySelector('.card-qty');

            const val = parseFloat(valInput.value);
            const qty = parseInt(qtyInput.value);

            let rowError = false;

            if (isNaN(val) || val <= 0) {
                valInput.classList.add('input-error');
                rowError = true;
                if (!firstErrorEl) firstErrorEl = valInput;
            }
            // Qty is readonly/stepper, usually safe, but check anyway
            if (isNaN(qty) || qty < 0) {
                // Note: qty 0 is technically allowed if they just don't want to use that card? 
                // But usually we want > 0 for active cards. 
                // However, the original logic filtered out qty > 0. 
                // Let's just validate value for now as critical.
            }

            if (!rowError && !isNaN(val) && !isNaN(qty) && qty > 0) {
                cards.push({ value: val, qty: qty });
            } else if (rowError) {
                hasError = true;
            }
        });

        const items = [];
        document.querySelectorAll('.item-card').forEach(card => {
            const nameInput = card.querySelector('.item-name');
            const priceInput = card.querySelector('.item-price');
            const minQtyInput = card.querySelector('.item-min-qty');
            const maxQtyInput = card.querySelector('.item-max-qty');

            const name = nameInput.value.trim();
            const price = parseFloat(priceInput.value);
            const minQty = parseInt(minQtyInput.value);
            const maxQty = parseInt(maxQtyInput.value);

            let cardError = false;

            if (!name) {
                nameInput.classList.add('input-error');
                cardError = true;
                if (!firstErrorEl) firstErrorEl = nameInput;
            }
            if (isNaN(price) || price <= 0) {
                priceInput.classList.add('input-error');
                cardError = true;
                if (!firstErrorEl) firstErrorEl = priceInput;
            }
            if (minQty > maxQty) {
                minQtyInput.parentElement.classList.add('input-error');
                maxQtyInput.parentElement.classList.add('input-error');
                cardError = true;
                if (!firstErrorEl) firstErrorEl = minQtyInput;
            }

            if (cardError) {
                hasError = true;
            } else {
                items.push({ name, price, minQty, maxQty });
            }
        });

        if (hasError) {
            alert("Please check the highlighted fields.");
            if (firstErrorEl) {
                firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstErrorEl.focus();
            }
            return;
        }

        if (items.length === 0) {
            alert("Please add at least one valid item.");
            return;
        }

        // 2. Generate Item Combinations
        const validConfigs = generateValidConfigs(items);
        if (validConfigs.length === 0) {
            alert("Invalid item quantities.");
            return;
        }

        // Sort by total cost
        validConfigs.sort((a, b) => a.totalCost - b.totalCost);

        // Optimization
        let globalBestTopup = { topup: Infinity, loss: Infinity, totalCost: 0, cardsUsed: [], itemConfig: null };
        let globalBestLoss = { topup: Infinity, loss: Infinity, totalCost: 0, cardsUsed: [], itemConfig: null };

        const configsToCheck = validConfigs.length > 100 ?
            [validConfigs[0], validConfigs[Math.floor(validConfigs.length / 2)], validConfigs[validConfigs.length - 1]] :
            validConfigs;

        configsToCheck.forEach(config => {
            const result = solveForTarget(config.totalCost, cards);

            // Best Cash Topup
            if (result.topup < globalBestTopup.topup || (result.topup === globalBestTopup.topup && result.loss < globalBestTopup.loss)) {
                globalBestTopup = {
                    ...result,
                    totalCost: config.totalCost,
                    itemConfig: config.items,
                    cardsUsed: result.cardsUsedTopup
                };
            }

            // Best Card Loss
            if (result.loss < globalBestLoss.loss || (result.loss === globalBestLoss.loss && result.topup < globalBestLoss.topup)) {
                globalBestLoss = {
                    topup: result.topup,
                    loss: result.loss,
                    totalCost: config.totalCost,
                    cardsUsed: result.cardsUsedLoss,
                    itemConfig: config.items
                };
            }
        });

        // Store results
        currentResults.topup = globalBestTopup;
        currentResults.loss = globalBestLoss;

        // 3. Render Results
        resultsSection.classList.remove('hidden');

        document.getElementById('best-topup-value').textContent = formatMoney(globalBestTopup.topup);
        document.getElementById('best-loss-value').textContent = formatMoney(globalBestLoss.loss);

        // Default selection
        selectResult('topup');

        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    function generateValidConfigs(items) {
        // Returns array of { totalCost: number, items: [{name, qty, price}, ...] }
        let configs = [{ totalCost: 0, items: [] }];

        items.forEach(item => {
            let newConfigs = [];
            for (let q = item.minQty; q <= item.maxQty; q++) {
                const cost = q * item.price;
                const itemEntry = { name: item.name, qty: q, price: item.price };

                configs.forEach(config => {
                    newConfigs.push({
                        totalCost: config.totalCost + cost,
                        items: [...config.items, itemEntry]
                    });
                });
            }
            configs = newConfigs;
        });

        return configs;
    }

    function solveForTarget(target, cards) {
        // Flatten cards
        let availableValues = [];
        cards.forEach(c => {
            for (let i = 0; i < c.qty; i++) availableValues.push(c.value);
        });
        availableValues.sort((a, b) => b - a);

        let bestUnder = { sum: 0, used: [] };
        let bestOver = { sum: Infinity, used: [] };

        function dfs(index, currentSum, currentUsed) {
            if (currentSum === target) {
                bestUnder = { sum: currentSum, used: [...currentUsed] };
                bestOver = { sum: currentSum, used: [...currentUsed] };
                return;
            }

            if (currentSum > target) {
                if (currentSum < bestOver.sum) {
                    bestOver = { sum: currentSum, used: [...currentUsed] };
                }
                return;
            }

            if (currentSum < target) {
                if (currentSum > bestUnder.sum) {
                    bestUnder = { sum: currentSum, used: [...currentUsed] };
                }
            }

            if (index >= availableValues.length) return;

            // Pruning
            if (bestOver.sum === target && bestUnder.sum === target) return;

            // Include
            currentUsed.push(availableValues[index]);
            dfs(index + 1, currentSum + availableValues[index], currentUsed);
            currentUsed.pop();

            // Exclude
            dfs(index + 1, currentSum, currentUsed);
        }

        if (availableValues.length > 15) {
            // Greedy Fallback
            let sum = 0;
            let used = [];
            for (let v of availableValues) {
                if (sum + v <= target) {
                    sum += v;
                    used.push(v);
                }
            }
            bestUnder = { sum, used };

            // Simple Over fallback: All cards
            let totalSum = availableValues.reduce((a, b) => a + b, 0);
            if (totalSum >= target) bestOver = { sum: totalSum, used: [...availableValues] };
        } else {
            dfs(0, 0, []);
        }

        const topup = target - bestUnder.sum;
        const loss = (bestOver.sum === Infinity) ? 0 : (bestOver.sum - target);

        return {
            topup: topup,
            loss: (bestOver.sum === Infinity) ? 0 : loss,
            cardsUsedTopup: bestUnder.used,
            cardsUsedLoss: (bestOver.sum === Infinity) ? bestUnder.used : bestOver.used
        };
    }

    function formatMoney(amount) {
        return '$' + amount.toFixed(2);
    }

    function renderDetailedResults(result) {
        console.log("Rendering details for:", result);
        const container = document.getElementById('detailed-results');

        if (!result || !result.itemConfig || !result.cardsUsed) {
            console.error("Invalid result data passed to renderDetailedResults", result);
            container.innerHTML = '<p class="error">Error loading details.</p>';
            return;
        }

        // Helper to group cards
        const cardCounts = {};
        (result.cardsUsed || []).forEach(val => {
            cardCounts[val] = (cardCounts[val] || 0) + 1;
        });

        let cardsHtml = '';
        if (Object.keys(cardCounts).length === 0) {
            cardsHtml = '<p class="empty-state">No gift cards used.</p>';
        } else {
            cardsHtml = '<ul class="detail-list">';
            for (const [val, count] of Object.entries(cardCounts)) {
                cardsHtml += `<li>${count}x <strong>$${val}</strong> Card</li>`;
            }
            cardsHtml += '</ul>';
        }

        let itemsHtml = '<ul class="detail-list">';
        result.itemConfig.forEach(item => {
            if (item.qty > 0) {
                itemsHtml += `<li>${item.qty}x ${item.name} ($${item.price})</li>`;
            }
        });
        itemsHtml += '</ul>';

        container.innerHTML = `
            <div class="result-details">
                <div class="detail-column">
                    <h4>Items Purchased</h4>
                    ${itemsHtml}
                    <p class="total-line">Total Cost: <strong>${formatMoney(result.totalCost)}</strong></p>
                </div>
                <div class="detail-column">
                    <h4>Gift Cards Used</h4>
                    ${cardsHtml}
                    <p class="total-line">Total Value: <strong>${formatMoney(result.cardsUsed.reduce((a, b) => a + b, 0))}</strong></p>
                </div>
            </div>
            <div class="final-summary">
                ${currentSelection === 'topup' ?
                `<p>You pay <strong>${formatMoney(result.topup)}</strong> in cash.</p>` :
                `<p>You lose <strong>${formatMoney(result.loss)}</strong> in card value.</p>`
            }
            </div>
        `;
    }

});
