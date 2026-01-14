/**
 * Webflow Brand Filter
 * Filters CMS collection items by Industry and Investment using checkbox groups
 *
 * SUPPORTS BOTH:
 * - Simple fields (Option/Plain Text) via data attributes
 * - Multi-reference fields via nested collection elements
 *
 * SETUP INSTRUCTIONS:
 *
 * Option A: Simple Fields (Option or Plain Text)
 * 1. On each CMS collection item, add custom attributes:
 *    - data-industry="Food & Beverage" (bind to Industry field)
 *    - data-investment="Under $250k" (bind to Investment field)
 * 2. Add data-brand-item attribute to each collection item wrapper
 *
 * Option B: Multi-Reference Fields
 * 1. Add data-brand-item attribute to each collection item wrapper
 * 2. Inside each brand item, add nested Collection Lists for Industries and Investments
 * 3. On each nested industry item, add: data-category-industry (bind text to category name)
 * 4. On each nested investment item, add: data-category-investment (bind text to category name)
 * 5. You can hide these nested lists with CSS if you don't want them visible
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    // Selectors
    itemSelector: '[data-brand-item]',
    filterContainerSelector: '[data-brand-filters]',
    industryFilterSelector: '[data-filter="industry"]',
    investmentFilterSelector: '[data-filter="investment"]',
    resultsCountSelector: '[data-results-count]',
    noResultsSelector: '[data-no-results]',

    // Multi-reference selectors (nested elements inside each brand item)
    multiRefIndustrySelector: '[data-category-industry]',
    multiRefInvestmentSelector: '[data-category-investment]',

    // Animation
    animationDuration: 300,

    // Filter options
    industries: [
      "Children's",
      "Home Services",
      "Entertainment",
      "Food & Beverage",
      "Employment & Staffing",
      "Pet Services",
      "Beauty",
      "Health & Wellness",
      "Automotive"
    ],
    investments: [
      "Over $500k",
      "Under $500k",
      "Under $250k",
      "Under $150k"
    ]
  };

  // State
  let activeFilters = {
    industry: [],
    investment: []
  };

  /**
   * Initialize the filter system
   */
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }
  }

  function setup() {
    const filterContainer = document.querySelector(CONFIG.filterContainerSelector);

    // Auto-generate filter UI if container exists but is empty
    if (filterContainer && filterContainer.children.length === 0) {
      generateFilterUI(filterContainer);
    }

    // Attach event listeners to checkboxes
    attachFilterListeners();

    // Initial filter application (show all)
    applyFilters();

    console.log('Brand filter initialized');
  }

  /**
   * Generate the filter UI HTML
   */
  function generateFilterUI(container) {
    const html = `
      <div class="brand-filter-group" data-filter-group="industry">
        <h4 class="brand-filter-title">Industry</h4>
        <div class="brand-filter-options">
          ${CONFIG.industries.map(industry => `
            <label class="brand-filter-checkbox">
              <input type="checkbox" data-filter="industry" value="${industry}">
              <span class="brand-filter-checkmark"></span>
              <span class="brand-filter-label">${industry}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <div class="brand-filter-group" data-filter-group="investment">
        <h4 class="brand-filter-title">Investment</h4>
        <div class="brand-filter-options">
          ${CONFIG.investments.map(investment => `
            <label class="brand-filter-checkbox">
              <input type="checkbox" data-filter="investment" value="${investment}">
              <span class="brand-filter-checkmark"></span>
              <span class="brand-filter-label">${investment}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <button class="brand-filter-clear" data-clear-filters>Clear All Filters</button>
      <div class="brand-filter-results">
        <span data-results-count>0</span> brands found
      </div>
      <div class="brand-filter-no-results" data-no-results style="display: none;">
        No brands match your selected filters. Try adjusting your criteria.
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * Attach event listeners to filter checkboxes
   */
  function attachFilterListeners() {
    // Industry checkboxes
    document.querySelectorAll('[data-filter="industry"]').forEach(checkbox => {
      checkbox.addEventListener('change', handleFilterChange);
    });

    // Investment checkboxes
    document.querySelectorAll('[data-filter="investment"]').forEach(checkbox => {
      checkbox.addEventListener('change', handleFilterChange);
    });

    // Clear button
    const clearBtn = document.querySelector('[data-clear-filters]');
    if (clearBtn) {
      clearBtn.addEventListener('click', clearAllFilters);
    }
  }

  /**
   * Handle checkbox change event
   */
  function handleFilterChange(e) {
    const checkbox = e.target;
    const filterType = checkbox.getAttribute('data-filter');
    const value = checkbox.value;

    if (checkbox.checked) {
      // Add to active filters
      if (!activeFilters[filterType].includes(value)) {
        activeFilters[filterType].push(value);
      }
    } else {
      // Remove from active filters
      activeFilters[filterType] = activeFilters[filterType].filter(v => v !== value);
    }

    applyFilters();
  }

  /**
   * Get industries for a brand item
   * Supports both data-attribute and multi-reference approaches
   */
  function getItemIndustries(item) {
    // First, check for simple data attribute
    const dataAttr = item.getAttribute('data-industry');
    if (dataAttr) {
      return [dataAttr.trim()];
    }

    // Otherwise, look for multi-reference nested elements
    const multiRefElements = item.querySelectorAll(CONFIG.multiRefIndustrySelector);
    if (multiRefElements.length > 0) {
      return Array.from(multiRefElements).map(el => el.textContent.trim());
    }

    return [];
  }

  /**
   * Get investments for a brand item
   * Supports both data-attribute and multi-reference approaches
   */
  function getItemInvestments(item) {
    // First, check for simple data attribute
    const dataAttr = item.getAttribute('data-investment');
    if (dataAttr) {
      return [dataAttr.trim()];
    }

    // Otherwise, look for multi-reference nested elements
    const multiRefElements = item.querySelectorAll(CONFIG.multiRefInvestmentSelector);
    if (multiRefElements.length > 0) {
      return Array.from(multiRefElements).map(el => el.textContent.trim());
    }

    return [];
  }

  /**
   * Apply current filters to collection items
   */
  function applyFilters() {
    const items = document.querySelectorAll(CONFIG.itemSelector);
    let visibleCount = 0;

    items.forEach(item => {
      // Get all industries and investments for this item (supports multiple)
      const itemIndustries = getItemIndustries(item);
      const itemInvestments = getItemInvestments(item);

      // Check if item matches active filters (AND logic between categories)
      // Within each category, use OR logic (item matches if ANY of its values match ANY selected filter)
      const matchesIndustry = activeFilters.industry.length === 0 ||
                              itemIndustries.some(ind => activeFilters.industry.includes(ind));
      const matchesInvestment = activeFilters.investment.length === 0 ||
                                itemInvestments.some(inv => activeFilters.investment.includes(inv));

      const isVisible = matchesIndustry && matchesInvestment;

      // Show/hide with animation
      if (isVisible) {
        showItem(item);
        visibleCount++;
      } else {
        hideItem(item);
      }
    });

    // Update results count
    updateResultsCount(visibleCount);

    // Show/hide no results message
    toggleNoResults(visibleCount === 0 && (activeFilters.industry.length > 0 || activeFilters.investment.length > 0));
  }

  /**
   * Show a collection item
   */
  function showItem(item) {
    item.style.display = '';
    item.classList.remove('brand-filter-hidden');
    item.classList.add('brand-filter-visible');
  }

  /**
   * Hide a collection item
   */
  function hideItem(item) {
    item.classList.remove('brand-filter-visible');
    item.classList.add('brand-filter-hidden');
    // Use a short delay for CSS transition, then hide
    setTimeout(() => {
      if (item.classList.contains('brand-filter-hidden')) {
        item.style.display = 'none';
      }
    }, CONFIG.animationDuration);
  }

  /**
   * Update the visible results count
   */
  function updateResultsCount(count) {
    const countEl = document.querySelector(CONFIG.resultsCountSelector);
    if (countEl) {
      countEl.textContent = count;
    }
  }

  /**
   * Toggle the no results message
   */
  function toggleNoResults(show) {
    const noResultsEl = document.querySelector(CONFIG.noResultsSelector);
    if (noResultsEl) {
      noResultsEl.style.display = show ? 'block' : 'none';
    }
  }

  /**
   * Clear all filters
   */
  function clearAllFilters() {
    // Reset state
    activeFilters = {
      industry: [],
      investment: []
    };

    // Uncheck all checkboxes
    document.querySelectorAll('[data-filter="industry"], [data-filter="investment"]').forEach(checkbox => {
      checkbox.checked = false;
    });

    // Reapply filters (show all)
    applyFilters();
  }

  /**
   * Programmatically set filters (useful for URL params or external control)
   */
  function setFilters(filters) {
    if (filters.industry) {
      activeFilters.industry = Array.isArray(filters.industry) ? filters.industry : [filters.industry];
    }
    if (filters.investment) {
      activeFilters.investment = Array.isArray(filters.investment) ? filters.investment : [filters.investment];
    }

    // Update checkbox states
    document.querySelectorAll('[data-filter="industry"]').forEach(checkbox => {
      checkbox.checked = activeFilters.industry.includes(checkbox.value);
    });
    document.querySelectorAll('[data-filter="investment"]').forEach(checkbox => {
      checkbox.checked = activeFilters.investment.includes(checkbox.value);
    });

    applyFilters();
  }

  /**
   * Get current active filters
   */
  function getActiveFilters() {
    return { ...activeFilters };
  }

  // Initialize
  init();

  // Expose public API
  window.BrandFilter = {
    setFilters,
    getActiveFilters,
    clearAllFilters,
    applyFilters
  };

})();
