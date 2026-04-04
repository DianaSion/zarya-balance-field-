// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Balance slider functionality
    const balanceSlider = document.getElementById('balance-slider');
    const balanceValue = document.getElementById('balance-value');
    const resetButton = document.getElementById('reset-button');

    if (balanceSlider && balanceValue) {
        // Update the displayed value when slider changes
        balanceSlider.addEventListener('input', function() {
            const value = this.value;
            balanceValue.textContent = value;
            // Update ARIA attribute for screen readers
            this.setAttribute('aria-valuenow', value);
        });

        // Keyboard support for fine control
        balanceSlider.addEventListener('keydown', function(e) {
            // Allow Shift + Arrow keys for finer control
            if (e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                e.preventDefault();
                const currentValue = parseInt(this.value);
                const step = e.key === 'ArrowLeft' ? -1 : 1;
                const newValue = Math.max(0, Math.min(100, currentValue + step));
                this.value = newValue;
                balanceValue.textContent = newValue;
                this.setAttribute('aria-valuenow', newValue);
            }
        });
    }

    // Reset button functionality
    if (resetButton && balanceSlider && balanceValue) {
        resetButton.addEventListener('click', function() {
            balanceSlider.value = 50;
            balanceValue.textContent = '50';
            balanceSlider.setAttribute('aria-valuenow', '50');
            // Announce the reset to screen readers
            announceToScreenReader('Balance reset to center at 50%');
        });
    }

    // Form submission handling
    const contactForm = document.querySelector('#contact form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            // Basic validation (browser will handle required fields)
            if (name && email && message) {
                // Announce success to screen readers
                announceToScreenReader('Form submitted successfully. Thank you for your message!');
                
                // Display success message
                showFormMessage('Thank you! Your message has been received.', 'success');
                
                // Reset form
                contactForm.reset();
            }
        });

        // Real-time email validation
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                if (this.value && !isValidEmail(this.value)) {
                    this.setCustomValidity('Please enter a valid email address');
                    this.reportValidity();
                } else {
                    this.setCustomValidity('');
                }
            });
        }
    }

    // Smooth scroll enhancement for keyboard users
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#' && targetId !== '#main-content') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    // Set focus to the target element for keyboard users
                    try {
                        targetElement.focus();
                    } catch (e) {
                        // Focus may fail if element is not focusable
                        console.warn('Could not focus element:', e);
                    }
                }
            }
        });
    });
});

// Helper function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Helper function to announce messages to screen readers
function announceToScreenReader(message) {
    // Create or get the live region
    let liveRegion = document.getElementById('sr-live-region');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'sr-live-region';
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        document.body.appendChild(liveRegion);
    }
    
    // Clear and set the message
    liveRegion.textContent = '';
    setTimeout(() => {
        liveRegion.textContent = message;
    }, 100);
}

// Helper function to show form messages
function showFormMessage(message, type) {
    // Remove any existing message
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create new message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message form-message-${type}`;
    messageDiv.setAttribute('role', type === 'success' ? 'status' : 'alert');
    messageDiv.textContent = message;
    
    // Style the message
    messageDiv.style.padding = '1rem';
    messageDiv.style.marginTop = '1rem';
    messageDiv.style.borderRadius = '4px';
    messageDiv.style.fontWeight = '500';
    
    if (type === 'success') {
        messageDiv.style.backgroundColor = '#d4edda';
        messageDiv.style.color = '#155724';
        messageDiv.style.border = '1px solid #c3e6cb';
    } else {
        messageDiv.style.backgroundColor = '#f8d7da';
        messageDiv.style.color = '#721c24';
        messageDiv.style.border = '1px solid #f5c6cb';
    }

    // Insert the message after the form
    const form = document.querySelector('#contact form');
    form.parentNode.insertBefore(messageDiv, form.nextSibling);

    // Remove message after 5 seconds
    setTimeout(() => {
        messageDiv.style.transition = 'opacity 0.5s';
        messageDiv.style.opacity = '0';
        setTimeout(() => messageDiv.remove(), 500);
    }, 5000);
}

// Add keyboard shortcut information for screen reader users
document.addEventListener('keydown', function(e) {
    // Alt + 1: Skip to main content
    if (e.altKey && e.key === '1') {
        e.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            try {
                mainContent.focus();
            } catch (e) {
                console.warn('Could not focus main content:', e);
            }
        }
    }
    // Alt + 0: Focus on first navigation link
    if (e.altKey && e.key === '0') {
        e.preventDefault();
        const firstNavLink = document.querySelector('nav a');
        if (firstNavLink) {
            firstNavLink.focus();
        }
    }
});
