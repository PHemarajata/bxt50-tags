// Section picker, print button and fit-to-screen for the A4 guide.
// #office, #committee or #guard in the address shows (and prints) only that section.
(function () {
  const parts = ['office', 'committee', 'guard'];
  function apply() {
    const h = location.hash.replace('#', '');
    const show = parts.includes(h) ? h : 'all';
    document.body.dataset.show = show;
    document.querySelectorAll('.toolbar a[data-show]').forEach(a => a.setAttribute('aria-current', String(a.dataset.show === show)));
    fit();
  }
  function fit() {
    const desk = document.querySelector('.desk');
    const pageW = 210 * 96 / 25.4;           // A4 width in CSS pixels
    const z = Math.min(1, (window.innerWidth - 16) / pageW);
    desk.style.zoom = z < 1 ? String(z) : '';
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('print').addEventListener('click', () => window.print());
    apply();
  });
  window.addEventListener('hashchange', apply);
  window.addEventListener('resize', fit);
})();
