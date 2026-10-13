(function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion) {
    document.querySelectorAll('.project-link').forEach(function (link) {
      link.addEventListener('click', function (event) {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
            event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        document.body.classList.add('page-leaving');
        window.setTimeout(function () { location.assign(link.href); }, 260);
      });
    });
    window.addEventListener('pageshow', function () {
      document.body.classList.remove('page-leaving');
    });
  }
  if (!('IntersectionObserver' in window) || reducedMotion) return;

  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

  document.documentElement.classList.add('motion-ready');
  items.forEach(function (item) { observer.observe(item); });
}());
