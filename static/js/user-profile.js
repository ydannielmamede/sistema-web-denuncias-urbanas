// ═══════════════════════════════════════════════════
// USER PROFILE DROPDOWN FUNCTIONALITY
// ═══════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function () {
  const profileBtn = document.querySelector('.user-profile-btn');
  const dropdown = document.querySelector('.user-dropdown');

  if (!profileBtn || !dropdown) return;

  function setProfileMenuOpen(isOpen) {
    profileBtn.classList.toggle('active', isOpen);
    dropdown.classList.toggle('active', isOpen);
    profileBtn.setAttribute('aria-expanded', String(isOpen));
  }

  profileBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    setProfileMenuOpen(!dropdown.classList.contains('active'));
  });

  const dropdownLinks = dropdown.querySelectorAll('.dropdown-item');
  dropdownLinks.forEach(link => {
    link.addEventListener('click', function () {
      setProfileMenuOpen(false);
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.user-profile')) {
      setProfileMenuOpen(false);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      setProfileMenuOpen(false);
      profileBtn.focus();
    }
  });
});
