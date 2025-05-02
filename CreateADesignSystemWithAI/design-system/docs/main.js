// Basic JavaScript for Design System Documentation

document.addEventListener('DOMContentLoaded', () => {
    console.log('Design System JS Loaded');

    // --- Alert Closing ---
    // Find all alert close buttons
    const alertCloseButtons = document.querySelectorAll('.alert-close');

    alertCloseButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const alertBox = event.target.closest('.alert'); // Find the parent alert
            if (alertBox) {
                alertBox.style.opacity = '0'; // Start fade out
                // Remove after transition (match CSS transition duration if added)
                setTimeout(() => {
                    alertBox.remove();
                }, 300); // Adjust time as needed (e.g., 300ms)
            }
        });
    });

    // --- Modal Opening/Closing ---
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    const modalCloseButtons = document.querySelectorAll('[data-modal-close]');
    const body = document.body;
    let previouslyFocusedElement = null; // To store focus before modal opens

    // Function to open a modal
    function openModal(modal) {
        if (!modal) return;
        previouslyFocusedElement = document.activeElement; // Save current focus
        modal.classList.add('is-open');
        body.classList.add('modal-open'); // Prevent body scroll
        modal.setAttribute('aria-hidden', 'false');

        // Focus management: Move focus into the modal
        // Try focusing the close button first, then the first focusable element
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const closeButton = modal.querySelector('.modal-close');

        if (closeButton) {
            closeButton.focus();
        } else if (firstFocusable) {
            firstFocusable.focus();
        }
    }

    // Function to close a modal
    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('is-open');
        body.classList.remove('modal-open');
        modal.setAttribute('aria-hidden', 'true');

        // Focus management: Return focus to the element that opened the modal
        if (previouslyFocusedElement) {
            previouslyFocusedElement.focus();
            previouslyFocusedElement = null; // Clear stored element
        }
    }

    // Add listeners to trigger buttons
    modalTriggers.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal-target');
            const modal = document.querySelector(modalId);
            openModal(modal);
        });
    });

    // Add listeners to close buttons and backdrops
    modalCloseButtons.forEach(element => {
        element.addEventListener('click', () => {
            const modal = element.closest('.modal');
            closeModal(modal);
        });
    });

    // Close modal on Escape key press
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const openModalElement = document.querySelector('.modal.is-open');
            if (openModalElement) {
                closeModal(openModalElement);
            }
        }
    });

    // --- Focus Trap (Basic Implementation) ---
    // This is a simplified trap. Robust solutions often use libraries.
    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Tab') return; // Only handle Tab key

        const openModalElement = document.querySelector('.modal.is-open');
        if (!openModalElement) return; // Only act if a modal is open

        const focusableElements = Array.from(
            openModalElement.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
        ).filter(el => el.offsetParent !== null); // Filter only visible elements

        if (focusableElements.length === 0) return; // No focusable elements in modal

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        const currentActiveElement = document.activeElement;

        if (event.shiftKey) { // Shift + Tab
            if (currentActiveElement === firstFocusable) {
                lastFocusable.focus(); // Wrap to last element
                event.preventDefault();
            }
        } else { // Tab
            if (currentActiveElement === lastFocusable) {
                firstFocusable.focus(); // Wrap to first element
                event.preventDefault();
            }
        }
        // If focus is somehow outside the modal, force it back in (less common case)
        if (!openModalElement.contains(currentActiveElement)) {
             firstFocusable.focus();
             event.preventDefault();
        }
    });

    // --- Dropdown Initialization ---
    function initializeDropdowns() {
        const dropdowns = document.querySelectorAll('[data-component="dropdown"]');

        dropdowns.forEach(dropdown => {
            const toggleButton = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');
            const items = menu.querySelectorAll('.dropdown-item');

            if (!toggleButton || !menu) return;

            // Toggle menu visibility
            toggleButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent closing immediately if clicking outside listener is on document
                const isOpen = menu.classList.contains('is-open');
                closeAllDropdowns(); // Close others before opening
                if (!isOpen) {
                    openDropdown(dropdown, toggleButton, menu);
                }
            });

            // Select item
            items.forEach(item => {
                item.addEventListener('click', () => {
                    // Example: Update button text (customize as needed)
                    toggleButton.textContent = item.textContent.trim();
                    // You might want to store the selected value (e.g., item.dataset.value)
                    console.log('Selected:', item.dataset.value);
                    closeDropdown(dropdown, toggleButton, menu);
                });
            });

            // Keyboard navigation within the menu
            menu.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    focusNextItem(menu, 1);
                } else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    focusNextItem(menu, -1);
                } else if (event.key === 'Escape') {
                    closeDropdown(dropdown, toggleButton, menu);
                    toggleButton.focus(); // Return focus to toggle
                } else if (event.key === 'Tab') {
                    // Allow tabbing out, which should close the dropdown via the outside click listener
                    closeDropdown(dropdown, toggleButton, menu);
                }
            });
        });

        // Close dropdown if clicking outside
        document.addEventListener('click', (event) => {
            if (!event.target.closest('[data-component="dropdown"]')) {
                closeAllDropdowns();
            }
        });
    }

    function openDropdown(dropdown, toggleButton, menu) {
        menu.classList.add('is-open');
        toggleButton.setAttribute('aria-expanded', 'true');
        // Focus first item or selected item (basic: focus first)
        const firstItem = menu.querySelector('.dropdown-item');
        if (firstItem) {
            // Timeout needed sometimes for focus to take effect after display change
            setTimeout(() => firstItem.focus(), 0);
        }
    }

    function closeDropdown(dropdown, toggleButton, menu) {
        menu.classList.remove('is-open');
        toggleButton.setAttribute('aria-expanded', 'false');
    }

    function closeAllDropdowns() {
        document.querySelectorAll('[data-component="dropdown"]').forEach(d => {
            const btn = d.querySelector('.dropdown-toggle');
            const m = d.querySelector('.dropdown-menu');
            if (btn && m && m.classList.contains('is-open')) {
                closeDropdown(d, btn, m);
            }
        });
    }

    function focusNextItem(menu, direction) {
        const items = Array.from(menu.querySelectorAll('.dropdown-item:not([disabled])'));
        const activeElement = document.activeElement;
        let currentIndex = items.findIndex(item => item === activeElement);

        if (currentIndex === -1 && direction === 1) {
            currentIndex = -1; // Start from top if none focused
        } else if (currentIndex === -1 && direction === -1) {
            currentIndex = 0; // Start from bottom if none focused
        }

        let nextIndex = currentIndex + direction;

        if (nextIndex >= items.length) {
            nextIndex = 0; // Wrap to top
        } else if (nextIndex < 0) {
            nextIndex = items.length - 1; // Wrap to bottom
        }

        items[nextIndex]?.focus();
    }

    // --- Tabs Initialization ---
    function initializeTabs() {
        const tabContainers = document.querySelectorAll('[data-component="tabs"]');

        tabContainers.forEach(container => {
            const tabList = container.querySelector('.tab-list');
            const tabs = Array.from(tabList.querySelectorAll('.tab-item[role="tab"]'));
            const panels = Array.from(container.querySelectorAll('.tab-panel[role="tabpanel"]'));

            if (!tabList || tabs.length === 0 || panels.length === 0) return;

            // Event listener for clicks on tabs
            tabList.addEventListener('click', (event) => {
                const clickedTab = event.target.closest('.tab-item[role="tab"]');
                if (!clickedTab) return;
                activateTab(clickedTab, tabs, panels);
            });

            // Keyboard navigation for tabs
            tabList.addEventListener('keydown', (event) => {
                const currentTab = event.target.closest('.tab-item[role="tab"]');
                if (!currentTab) return;

                let newIndex;
                const currentIndex = tabs.indexOf(currentTab);

                if (event.key === 'ArrowRight') {
                    newIndex = (currentIndex + 1) % tabs.length;
                } else if (event.key === 'ArrowLeft') {
                    newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                } else if (event.key === 'Home') {
                    newIndex = 0;
                } else if (event.key === 'End') {
                    newIndex = tabs.length - 1;
                } else {
                    return; // Ignore other keys
                }

                event.preventDefault(); // Prevent default arrow key scrolling
                tabs[newIndex].focus(); // Move focus
                // Optional: Activate tab on focus change (common pattern)
                // activateTab(tabs[newIndex], tabs, panels);
            });
        });
    }

    function activateTab(selectedTab, allTabs, allPanels) {
        allTabs.forEach(tab => {
            const isSelected = (tab === selectedTab);
            tab.setAttribute('aria-selected', isSelected);
            tab.setAttribute('tabindex', isSelected ? '0' : '-1');
        });

        allPanels.forEach(panel => {
            const panelId = panel.getAttribute('id');
            const controlledBySelected = (selectedTab.getAttribute('aria-controls') === panelId);
            panel.hidden = !controlledBySelected;
        });
    }

    // --- Initialize Components ---
    initializeDropdowns();
    initializeTabs();

    // Add more component-specific JS or general documentation helpers here
});