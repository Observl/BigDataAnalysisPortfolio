import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const root = document.documentElement;
const toggle = document.querySelector('.motion-toggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const hero = document.querySelector('.hero');
const projects = [...document.querySelectorAll('.work-item')];
const skillGroups = [...document.querySelectorAll('.method-grid .method')];
const snapTargets = [
  document.querySelector('#top'),
  document.querySelector('#work .section-topline'),
  ...projects.map(project => project.querySelector('.work-meta')),
  document.querySelector('#approach'),
  document.querySelector('#contact')
].filter(Boolean);

let userEnabled = true;
let cleanupMotion = () => {};

function buildMotion() {
  cleanupMotion();
  gsap.killTweensOf('.skill-list li');
  gsap.set('.skill-list li', { clearProps: 'all' });
  const active = userEnabled && !reducedMotion.matches;
  root.classList.toggle('motion-off', !active);
  toggle.hidden = false;
  toggle.disabled = reducedMotion.matches;
  toggle.setAttribute('aria-pressed', String(active));
  toggle.textContent = reducedMotion.matches ? '系统已减少动效' : active ? '关闭动效' : '启用动效';
  if (!active) return;

  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    if (window.scrollY < hero.offsetHeight * .55) {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.nav', { autoAlpha: 0, y: -12, duration: .46 })
        .from('.hero-head > *', { autoAlpha: 0, y: 16, duration: .48, stagger: .1 }, '-=.25')
        .from('.hero h1', { autoAlpha: 0, y: 28, duration: .8 }, '-=.22')
        .from('.hero-under > *', { autoAlpha: 0, y: 18, duration: .55, stagger: .12 }, '-=.35')
        .from('.hero-caption', { autoAlpha: 0, duration: .4 }, '-=.2');
    }

    gsap.fromTo('.reading-line', { scaleX: 0 }, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'max', scrub: true }
    });
    gsap.fromTo('.hero-backdrop', { yPercent: -3, scale: 1.025 }, {
      yPercent: 7, scale: 1.025, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .35 }
    });
    gsap.fromTo('.hero h1', { yPercent: 0 }, {
      yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .35 }
    });

    gsap.from('.work-intro > *', {
      autoAlpha: 0, y: 26, duration: .7, stagger: .15, ease: 'power3.out',
      scrollTrigger: { trigger: '.work-intro', start: 'top 82%', once: true }
    });

    projects.forEach(project => {
      const image = project.querySelector('.work-image img');
      const curtain = project.querySelector('.image-curtain');
      const copy = project.querySelector('.work-copy');
      gsap.fromTo(project, { '--section-progress': 0 }, {
        '--section-progress': 1, ease: 'none',
        scrollTrigger: { trigger: project, start: 'top 90%', end: 'top 24%', scrub: true }
      });
      gsap.timeline({ scrollTrigger: { trigger: project, start: 'top 76%', once: true } })
        .fromTo(curtain, { scaleX: 1 }, { scaleX: 0, duration: .78, ease: 'power3.inOut' })
        .fromTo(image, { scale: 1.075 }, { scale: 1, duration: 1.05, ease: 'power2.out' }, '<')
        .fromTo(copy, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .65, ease: 'power3.out' }, '-=.48');
    });

    gsap.timeline({ scrollTrigger: { trigger: '.approach-heading', start: 'top 80%', once: true } })
      .from('.approach-heading > *', { autoAlpha: 0, y: 23, duration: .65, stagger: .14, ease: 'power3.out' })
      .fromTo('.approach-heading', { '--approach-progress': 0 },
        { '--approach-progress': 1, duration: .9, ease: 'power2.out' }, '-=.4');
    gsap.from('.method-grid .method', {
      autoAlpha: 0, y: 24, duration: .58, stagger: .17, ease: 'power3.out',
      scrollTrigger: { trigger: '.method-grid', start: 'top 84%', once: true }
    });
    gsap.timeline({ scrollTrigger: { trigger: '.footer-content', start: 'top 82%', once: true } })
      .from('.footer-content p', { autoAlpha: 0, y: 20, duration: .62, ease: 'power3.out' })
      .from('.footer-link', { autoAlpha: 0, y: 16, duration: .48, ease: 'power2.out' }, '-=.28');
    gsap.timeline({ scrollTrigger: { trigger: '.footer-signature', start: 'top 88%', once: true } })
      .from('.signature-word', { autoAlpha: 0, y: 20, duration: .65, ease: 'power3.out' })
      .from('.footer-signature img', { autoAlpha: 0, y: 16, duration: .5, ease: 'power2.out' }, '-=.22');

    // Only downward wheel input near the explicitly selected points is damped.
    // Upward wheel, keyboard and touch scrolling remain native.
    let scrollTween;
    let pendingTarget = null;
    let resistedInput = 0;
    let projectedY = window.scrollY;
    const onWheel = event => {
      if (event.deltaY <= 0) {
        scrollTween?.kill();
        pendingTarget = null;
        resistedInput = 0;
        return;
      }
      if (event.ctrlKey || event.metaKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const input = event.deltaY * unit;
      const currentY = window.scrollY;
      const points = snapTargets.map(target => Math.round(target.getBoundingClientRect().top + currentY)).sort((a, b) => a - b);
      const next = points.find(point => point > currentY + 6);
      const zone = Math.min(380, Math.max(240, window.innerHeight * .46));
      if (next === undefined || next - currentY > zone + Math.min(input, zone)) {
        scrollTween?.kill();
        pendingTarget = null;
        resistedInput = 0;
        return;
      }
      event.preventDefault();
      if (pendingTarget !== next) {
        pendingTarget = next;
        resistedInput = 0;
        projectedY = currentY;
      }
      resistedInput += input;
      const distance = next - currentY;
      const releaseThreshold = Math.min(260, Math.max(95, distance * .8));
      const release = resistedInput >= releaseThreshold || distance < 12;
      projectedY = release ? next : Math.min(next - 4, Math.max(currentY, projectedY) + input * .22);
      scrollTween?.kill();
      scrollTween = gsap.to(window, {
        scrollTo: { y: projectedY, autoKill: true },
        duration: release ? .38 : .24,
        ease: release ? 'power2.out' : 'power1.out',
        overwrite: true,
        onComplete: () => {
          if (release) { pendingTarget = null; resistedInput = 0; }
          scrollTween = null;
        }
      });
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => { window.removeEventListener('wheel', onWheel); scrollTween?.kill(); };
  });

  cleanupMotion = () => { mm.revert(); cleanupMotion = () => {}; };
  ScrollTrigger.refresh();
}

skillGroups.forEach(group => {
  group.addEventListener('toggle', () => {
    const items = group.querySelectorAll('.skill-list li');
    gsap.killTweensOf(items);
    gsap.set(items, { clearProps: 'all' });
    if (group.open && !root.classList.contains('motion-off')) {
      gsap.fromTo(items, { autoAlpha: 0, y: 12 }, {
        autoAlpha: 1, y: 0, duration: .42, stagger: .075,
        ease: 'power2.out', clearProps: 'all'
      });
    }
  });
});

toggle.addEventListener('click', () => { userEnabled = !userEnabled; buildMotion(); });
reducedMotion.addEventListener('change', buildMotion);
window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
document.fonts?.ready.then(() => ScrollTrigger.refresh());
window.addEventListener('pageshow', event => { if (event.persisted) buildMotion(); });
window.addEventListener('pagehide', () => cleanupMotion());

buildMotion();
