/**
 * DANA Aerodynamics Laboratory - Main Script
 * Manages UI interactions, theme, tabs, modals, and filters
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Management (Dark / Light)
  const themeToggle = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('dana-theme') || 'dark';

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dana-theme', theme);
    updateThemeIcon(theme);
  }

  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');
    if (sunIcon && moonIcon) {
      if (theme === 'light') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      }
    }
  }

  setTheme(storedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
  }

  // 2. Mobile Navigation Menu Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    // Close when clicking nav link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  // 3. Navigation Active Spy
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });

  // 4. OpenDynamo Media Switcher (Video vs GIF vs Plot)
  const odTabs = document.querySelectorAll('.od-tab-btn');
  const odMediaItems = document.querySelectorAll('.od-media-item');
  const odBadge = document.getElementById('od-media-badge');

  if (odTabs.length > 0) {
    odTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-target');
        
        odTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        odMediaItems.forEach(item => {
          item.classList.remove('active');
          if (item.id === target) {
            item.classList.add('active');
            if (item.tagName === 'VIDEO') {
              item.play().catch(() => {});
            }
          }
        });

        if (odBadge) {
          if (target === 'od-video') odBadge.textContent = '3D Coherent Vortices (MP4 @ 60fps)';
          else if (target === 'od-gif') odBadge.textContent = 'Turbulent Channel Flow (Animated GIF)';
          else if (target === 'od-plot') odBadge.textContent = 'DNS Validation & Streaks at y⁺ ≈ 15';
        }
      });
    });
  }

  // 5. Project Filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');

        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        projectCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter || (category && category.includes(filter))) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 6. Lightbox Modal
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalClose = document.getElementById('modal-close');

  function openModal(imgSrc, title, desc) {
    if (!modal) return;
    if (modalImg) modalImg.src = imgSrc;
    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.textContent = desc;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Attach modal trigger to instruments & viewable images
  document.querySelectorAll('.open-modal-trigger').forEach(el => {
    el.addEventListener('click', () => {
      const src = el.getAttribute('data-img');
      const title = el.getAttribute('data-title');
      const desc = el.getAttribute('data-desc');
      openModal(src, title, desc);
    });
  });

  // 7. BibTeX Copy to Clipboard
  window.copyBibtex = function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    navigator.clipboard.writeText(el.innerText).then(() => {
      const btn = document.querySelector(`[data-copy-for="${id}"]`);
      if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
        btn.style.color = '#10b981';
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.color = '';
        }, 2200);
      }
    });
  };
});
