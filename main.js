const mainContent = document.querySelector('.main-content');

let scrollTimeout;
let isScrolling = false;
let wheelAccumulator = 0;
let ignoreUntil = 0;
let lastWheelEventTime = 0;

function getSectionAnimMs() {
    const rootStyles = getComputedStyle(document.documentElement);
    const animMsRaw = rootStyles.getPropertyValue('--section-anim-ms').trim();
    const animMs = Number.parseFloat(animMsRaw);
    return Number.isFinite(animMs) ? animMs : 600;
}

mainContent.addEventListener('wheel', function(event) {
    event.preventDefault();
    const now = Date.now();
    if (now < ignoreUntil) {
        wheelAccumulator = 0;
        return;
    }

    const dt = lastWheelEventTime ? now - lastWheelEventTime : 16;
    const decay = Math.exp(-dt / 120);
    wheelAccumulator = wheelAccumulator * decay + event.deltaY;
    lastWheelEventTime = now;

    if (isScrolling) {
        return;
    }

    const triggerThreshold = 140;
    if (Math.abs(wheelAccumulator) < triggerThreshold) {
        return;
    }

    isScrolling = true;

    const scrollDirection = wheelAccumulator > 0 ? 'down' : 'up';
    wheelAccumulator = 0;
    const currentSection = Math.round(mainContent.scrollTop / window.innerHeight);
    
    let nextSection;
    if (scrollDirection === 'down') {
        nextSection = currentSection + 1;
    } else {
        nextSection = currentSection - 1;
    }

    const sections = document.querySelectorAll('.frame');
    if (nextSection >= 0 && nextSection < sections.length) {
        scrollToSection(nextSection);
    }

    const cooldownMs = Math.max(300, getSectionAnimMs());
    ignoreUntil = now + cooldownMs;
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
    }, cooldownMs); // Debounce time
}, { passive: false });

const sidebarLinks = document.querySelectorAll('.sidebar a');
sidebarLinks.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        const sections = document.querySelectorAll('.frame');
        const targetIndex = Array.from(sections).indexOf(targetSection);
        
        scrollToSection(targetIndex);
    });
});

function scrollToSection(sectionIndex) {
    const sections = document.querySelectorAll('.frame');
    if (sectionIndex >= 0 && sectionIndex < sections.length) {
        mainContent.scrollTo({
            top: sectionIndex * window.innerHeight,
            behavior: 'smooth'
        });

        updateSectionGradient(sectionIndex);

        sections.forEach((section, index) => {
            if (index === sectionIndex) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        sidebarLinks.forEach((link, index) => {
            if (index === sectionIndex) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

function updateSectionGradient(sectionIndex) {
    const sections = document.querySelectorAll('.frame');
    if (!sections.length) {
        return;
    }

    const current = sections[sectionIndex];
    const currentColor = getComputedStyle(current).getPropertyValue('--section-color').trim();

    if (currentColor) {
        document.documentElement.style.setProperty('--section-current', currentColor);
    }
}

// Set the initial active section
const initialSection = Math.round(mainContent.scrollTop / window.innerHeight);
scrollToSection(initialSection);

// Fake Scrollbar
const scrollbar = document.querySelector('.fake-scrollbar');
const scrollbarThumb = document.querySelector('.fake-scrollbar-thumb');
const scrollbarMessage = document.querySelector('#scrollbar-message');
const totalHeight = mainContent.scrollHeight;
const viewportHeight = window.innerHeight;

function updateScrollbar() {
    const scrollPercentage = mainContent.scrollTop / (totalHeight - viewportHeight);
    const thumbHeight = (viewportHeight / totalHeight) * viewportHeight;
    const thumbPosition = scrollPercentage * (viewportHeight - thumbHeight);

    scrollbarThumb.style.height = `${thumbHeight}px`;
    scrollbarThumb.style.top = `${thumbPosition}px`;

    // Update scrollbar message position
    const messageHeight = scrollbarMessage.offsetHeight;
    scrollbarMessage.style.top = `${thumbPosition + (thumbHeight / 2) - (messageHeight / 2)}px`;
}

mainContent.addEventListener('scroll', updateScrollbar);
window.addEventListener('resize', updateScrollbar);
updateScrollbar();

// Scrollbar message
scrollbar.addEventListener('mousedown', () => {
    scrollbarMessage.classList.add('show');
});

scrollbar.addEventListener('mouseup', () => {
    setTimeout(() => {
        scrollbarMessage.classList.remove('show');
    }, 1500);
});

scrollbar.addEventListener('mouseleave', () => {
    setTimeout(() => {
        scrollbarMessage.classList.remove('show');
    }, 1500);
});

// Projects carousel
const projectsTrack = document.querySelector('.projects-track');
const prevProjectsBtn = document.querySelector('.carousel-btn.prev');
const nextProjectsBtn = document.querySelector('.carousel-btn.next');

function updateProjectButtons() {
    if (!projectsTrack || !prevProjectsBtn || !nextProjectsBtn) {
        return;
    }

    const maxScrollLeft = projectsTrack.scrollWidth - projectsTrack.clientWidth;
    prevProjectsBtn.disabled = projectsTrack.scrollLeft <= 0;
    nextProjectsBtn.disabled = projectsTrack.scrollLeft >= maxScrollLeft - 1;
}

function scrollProjects(direction) {
    if (!projectsTrack) {
        return;
    }

    const scrollAmount = projectsTrack.clientWidth;
    projectsTrack.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}

if (prevProjectsBtn && nextProjectsBtn) {
    prevProjectsBtn.addEventListener('click', () => scrollProjects(-1));
    nextProjectsBtn.addEventListener('click', () => scrollProjects(1));
    projectsTrack.addEventListener('scroll', updateProjectButtons);
    window.addEventListener('resize', updateProjectButtons);
    updateProjectButtons();
}
