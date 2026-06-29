const form = document.querySelector('#leadForm');
const statusEl = document.querySelector('#formStatus');
const yearEl = document.querySelector('#year');
const langButtons = document.querySelectorAll('.lang-btn');
const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightboxImage');
const lightboxTitle = document.querySelector('#lightboxTitle');
const backToTop = document.querySelector('#backToTop');

yearEl.textContent = new Date().getFullYear();

function setLanguage(lang) {
  const key = lang === 'cyrillic' ? 'cyrillic' : 'latin';

  document.documentElement.lang = key === 'cyrillic' ? 'uz-Cyrl' : 'uz-Latn';
  document.querySelectorAll('[data-latin][data-cyrillic]').forEach((element) => {
    element.textContent = element.dataset[key];
  });
  document.querySelectorAll('[data-placeholder-latin][data-placeholder-cyrillic]').forEach((element) => {
    element.placeholder = element.dataset[`placeholder${key[0].toUpperCase()}${key.slice(1)}`];
  });
  langButtons.forEach((button) => button.classList.toggle('active', button.dataset.lang === key));
  localStorage.setItem('siteLanguage', key);
}

langButtons.forEach((button) => {
  button.addEventListener('click', () => setLanguage(button.dataset.lang));
});

setLanguage(localStorage.getItem('siteLanguage') || 'latin');

document.querySelectorAll('.js-lightbox').forEach((button) => {
  button.addEventListener('click', () => {
    const visibleTitle = button.querySelector('span')?.innerText.trim();

    lightboxImage.src = button.dataset.src;
    lightboxImage.alt = visibleTitle || button.dataset.title || '';
    lightboxTitle.textContent = visibleTitle || button.dataset.title || '';
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
  });
});

function closeLightbox() {
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
  lightboxImage.src = '';
}

lightbox.addEventListener('click', closeLightbox);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && lightbox.classList.contains('active')) {
    closeLightbox();
  }
});

function updateBackToTop() {
  backToTop.classList.toggle('visible', window.scrollY > 420);
}

window.addEventListener('scroll', updateBackToTop, { passive: true });
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
updateBackToTop();

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const submitButton = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);

  statusEl.className = 'form-status';
  statusEl.textContent = 'Yuborilmoqda...';
  submitButton.disabled = true;

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    });

    const result = await response.json().catch(() => {
      throw new Error('Server JSON javob qaytarmadi. Hosting sozlamasini tekshiring.');
    });

    if (!response.ok || !result.ok) {
      throw new Error(result.message || 'Ariza yuborilmadi.');
    }

    form.reset();
    statusEl.className = 'form-status success';
    statusEl.textContent = 'Rahmat! Ma\'lumotlaringiz yuborildi, tez orada bog\'lanamiz.';
  } catch (error) {
    statusEl.className = 'form-status error';
    statusEl.textContent = error.message || 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.';
  } finally {
    submitButton.disabled = false;
  }
});
