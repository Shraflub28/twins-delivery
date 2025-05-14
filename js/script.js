// Scroll Progress Bar
const scrollProgress = document.querySelector('.scroll-progress');

window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    scrollProgress.style.width = `${progress}%`;
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active Navigation Link Highlight
const pageSections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    pageSections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Location Input Enhancement
const addressInput = document.getElementById('location-input');
const findFoodBtn = document.querySelector('.search-btn');

if (addressInput && findFoodBtn) {
    addressInput.addEventListener('focus', () => {
        addressInput.parentElement.classList.add('focused');
    });

    addressInput.addEventListener('blur', () => {
        addressInput.parentElement.classList.remove('focused');
    });

    findFoodBtn.addEventListener('click', () => {
        if (addressInput.value.trim() !== '') {
            findFoodBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
            setTimeout(() => {
                findFoodBtn.innerHTML = '<i class="fas fa-search"></i> Find Food';
                // Add your search functionality here
            }, 1500);
        }
    });
}

// Intersection Observer for Animations
const animationObserverOptions = {
    threshold: 0.2,
    rootMargin: '0px'
};

const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            // Also add visible class to support both animation systems
            entry.target.classList.add('visible');
        } else {
            // Don't remove the classes on exit - this prevents fade-out
            // entry.target.classList.remove('animate-in');
            // entry.target.classList.remove('visible');
        }
    });
}, animationObserverOptions);

// Observe elements for animation
document.querySelectorAll('.category-item, .restaurant-card, .feature, .app-content, .app-image').forEach(el => {
    // Add fade-in class if needed for compatibility with inline script
    if (!el.classList.contains('fade-in')) {
        el.classList.add('fade-in');
    }
    animationObserver.observe(el);
});

// Restaurant Cards Hover Effect
document.querySelectorAll('.restaurant-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) rotateY(5deg)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) rotateY(0)';
    });
});

// Initialize AOS (Animate on Scroll) - focus on the download app section
document.addEventListener('DOMContentLoaded', () => {
    // Fix the app download section animation
    const appDownloadSection = document.getElementById('download');
    if (appDownloadSection) {
        const appContent = appDownloadSection.querySelector('.app-content');
        const appImage = appDownloadSection.querySelector('.app-image');
        
        if (appContent && !appContent.classList.contains('fade-in')) {
            appContent.classList.add('fade-in');
            animationObserver.observe(appContent);
        }
        
        if (appImage && !appImage.classList.contains('fade-in')) {
            appImage.classList.add('fade-in');
            animationObserver.observe(appImage);
        }
    }

    // Add animation classes to elements
    document.querySelectorAll('.feature').forEach((feature, index) => {
        feature.style.animationDelay = `${index * 0.2}s`;
        feature.classList.add('fade-up');
    });

    // Add parallax effect to floating elements
    document.addEventListener('mousemove', (e) => {
        const floatingElements = document.querySelectorAll('.floating-element');
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        floatingElements.forEach(element => {
            const speed = element.getAttribute('data-speed') || 2;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;
            element.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
});