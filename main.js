const mainContent = document.querySelector('.main-content');

mainContent.addEventListener('wheel', function(event) {
    event.preventDefault();
}, { passive: false });

let scrollTimeout;
let isScrolling = false;

mainContent.addEventListener('wheel', function(event) {
    if (isScrolling) {
        return;
    }

    isScrolling = true;

    const scrollDirection = event.deltaY > 0 ? 'down' : 'up';
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

    scrollTimeout = setTimeout(() => {
        isScrolling = false;
    }, 500); // Debounce time
});

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