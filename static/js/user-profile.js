// ═══════════════════════════════════════════════════
// USER PROFILE DROPDOWN FUNCTIONALITY
// ═══════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function () {
  const profileBtn = document.querySelector('.user-profile-btn');
  const dropdown = document.querySelector('.user-dropdown');

  if (!profileBtn || !dropdown) return;

  // Toggle dropdown on button click
  profileBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    profileBtn.classList.toggle('active');
    dropdown.classList.toggle('active');
  });

  // Close dropdown when clicking a link
  const dropdownLinks = dropdown.querySelectorAll('.dropdown-item');
  dropdownLinks.forEach(link => {
    link.addEventListener('click', function () {
      profileBtn.classList.remove('active');
      dropdown.classList.remove('active');
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.user-profile')) {
      profileBtn.classList.remove('active');
      dropdown.classList.remove('active');
    }
  });

  // Close dropdown on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      profileBtn.classList.remove('active');
      dropdown.classList.remove('active');
    }
  });
});
