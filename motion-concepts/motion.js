const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const videos = [...document.querySelectorAll('video[data-loop]')];
const motionButtons = [...document.querySelectorAll('.motion-toggle')];
let motionPaused = reduceMotion.matches;

function updateMotionButtons() {
  motionButtons.forEach(button => {
    button.textContent = motionPaused ? '모션 재생' : '모션 일시정지';
    button.setAttribute('aria-pressed', String(!motionPaused));
  });
}
videos.forEach(video => {
  video.addEventListener('play', updateMotionButtons);
  video.addEventListener('pause', updateMotionButtons);
  if (video.querySelector('source')?.src.includes('/boss.mp4')) {
    if (!motionPaused) video.currentTime = 1.5;
    video.addEventListener('timeupdate', () => {
      if (video.currentTime < 1.5) video.currentTime = 1.5;
    });
  }
  if (!reduceMotion.matches) video.play().catch(updateMotionButtons);
});
motionButtons.forEach(button => button.addEventListener('click', () => {
  motionPaused = !motionPaused;
  document.documentElement.classList.toggle('motion-paused', motionPaused);
  if (motionPaused) videos.forEach(video => video.pause());
  else videos.forEach(video => video.play().catch(updateMotionButtons));
  updateMotionButtons();
}));
reduceMotion.addEventListener('change', event => {
  if (event.matches) {
    motionPaused = true;
    document.documentElement.classList.add('motion-paused');
    videos.forEach(video => video.pause());
    document.querySelectorAll('.reveal.pending').forEach(element => element.classList.remove('pending'));
    updateMotionButtons();
  }
});
document.documentElement.classList.toggle('motion-paused', motionPaused);
updateMotionButtons();

const selector = document.querySelector('[data-project-selector]');
if (selector) {
  const options = [...selector.querySelectorAll('.project-option')];
  const image = selector.querySelector('[data-stage-image]');
  const graphic = selector.querySelector('.stage-g');
  const visual = selector.querySelector('.stage-visual');
  const text = selector.querySelector('.stage-text');
  let selected = 0;
  function selectProject(index) {
    selected = (index + options.length) % options.length;
    const option = options[selected];
    const data = option.dataset;
    options.forEach(item => item.setAttribute('aria-pressed', String(item === option)));
    for (const key of ['title', 'type', 'subtitle', 'period', 'role', 'desc', 'tags', 'credit']) {
      selector.querySelector('[data-stage-' + key + ']').textContent = data[key];
    }
    selector.querySelector('[data-stage-number]').textContent = String(selected + 1).padStart(2, '0');
    selector.querySelector('[data-stage-link]').href = data.link;
    image.hidden = !data.img;
    graphic.hidden = Boolean(data.img);
    if (data.img) { image.src = data.img; image.alt = data.alt; }
    if (!motionPaused && !reduceMotion.matches && visual.animate) {
      visual.animate([{opacity:.3,transform:'scale(1.04)'},{opacity:1,transform:'scale(1)'}],{duration:550,easing:'cubic-bezier(.16,1,.3,1)'});
      text.animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,easing:'cubic-bezier(.16,1,.3,1)'});
    }
  }
  options.forEach((option,index) => option.addEventListener('click', () => selectProject(index)));
  selector.querySelector('[data-prev]').addEventListener('click', () => selectProject(selected - 1));
  selector.querySelector('[data-next]').addEventListener('click', () => selectProject(selected + 1));
  selector.querySelector('.project-list').addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    selectProject(selected + (event.key === 'ArrowRight' ? 1 : -1));
    options[selected].focus();
  });
}

if ('IntersectionObserver' in window && !reduceMotion.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.remove('pending'); observer.unobserve(entry.target); }
  }), {threshold:.12});
  document.querySelectorAll('.reveal').forEach(element => { element.classList.add('pending'); observer.observe(element); });
}
const progress = document.querySelector('.reading-progress i');
if (progress) {
  let queued = false;
  const updateProgress = () => {
    const distance = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = 'scaleX(' + (distance > 0 ? Math.min(1, scrollY / distance) : 0) + ')';
    queued = false;
  };
  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(updateProgress); }
  }, {passive:true});
  updateProgress();
}
