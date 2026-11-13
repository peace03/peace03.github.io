const main = document.querySelector('#main');
const review = document.querySelector('.review');
const motionToggle = document.querySelector('.motion-toggle');
const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;

if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

let motionOn = !systemMotion.matches;
let entrance;
let updateMotion = () => {};

function setMotion(enabled) {
  motionOn = enabled;
  document.documentElement.classList.toggle('motion-off', !motionOn);
  motionToggle.textContent = motionOn ? '모션 끄기' : '모션 켜기';
  if (!motionOn) entrance?.progress(1);
  updateMotion();
}

motionToggle.addEventListener('click', () => setMotion(!motionOn));
systemMotion.addEventListener('change', event => setMotion(!event.matches));
setMotion(motionOn);

const art = (project, source = project.cover, loading = 'eager') => source
  ? `<img class="art-image" src="../${source}" alt="" loading="${loading}" decoding="async" style="object-position:${project.position || 'center'}">`
  : '<span class="grimoire-art" aria-hidden="true"><span>G</span></span>';

const detailLink = (project, tab = 'overview') => `../index.html#${project.id}/${tab}`;
const videoMarkup = ({ video, crop, range = [0, 0] }) => `
  <div class="video-frame${crop ? ' video-crop' : ''}">
    <video data-src="../${video}" data-start="${range[0]}" data-end="${range[1]}"
      muted loop playsinline preload="none" aria-hidden="true"></video>
  </div>`;

function showVideoFrames(video) {
  const start = Number(video.dataset.start);
  const end = Number(video.dataset.end);
  function showFrame() {
    if (video.seeking) return;
    if (end && (video.currentTime >= end || video.currentTime < start - 0.05)) {
      video.currentTime = start;
    } else {
      video.classList.add('has-frame');
    }
  }
  video.addEventListener('playing', showFrame);
  if (end) video.addEventListener('timeupdate', showFrame);
}

function playVideo(video) {
  if (!video.hasAttribute('src')) {
    const start = Number(video.dataset.start);
    video.src = video.dataset.src + (start ? `#t=${start}` : '');
  }
  return video.play();
}

function enter(selector) {
  if (!gsap || !motionOn) return;
  entrance = gsap.from(selector, {
    y: 26, opacity: 0, duration: 0.76, stagger: 0.065, ease: 'power3.out', clearProps: 'transform,opacity',
  });
}

function renderStage() {
  main.innerHTML = `
    <section class="stage" aria-label="프로젝트 무대">
      <div class="stage-screen" aria-hidden="true"></div>
      <div class="stage-shade" aria-hidden="true"></div>
      <div class="stage-wipe" aria-hidden="true"></div>
      <div class="stage-top">
        <span class="stage-type"></span>
        <button class="media-button stage-play" type="button" hidden>영상 재생</button>
      </div>
      <div class="stage-body">
        <div class="stage-identity">
          <p class="identity-role">게임 클라이언트 프로그래머</p>
          <h1><span>윤평화</span></h1>
          <p class="identity-copy">플레이어가 반응할 수 있는<br> 전투를 만듭니다.</p>
        </div>
        <div class="stage-caption" aria-live="polite">
          <p class="caption-role"></p>
          <h2></h2>
          <p class="caption-summary"></p>
          <a class="detail-link">프로젝트 보기 <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div class="stage-picker" role="group" aria-label="프로젝트 선택. 좌우 방향키로 이동할 수 있습니다.">
        ${projects.map((project, index) => `
          <button type="button" data-project="${index}" aria-pressed="false">
            <span class="stage-thumb" aria-hidden="true">${art(project)}</span>
            <span class="stage-label">${project.name}</span>
          </button>`).join('')}
      </div>
    </section>`;

  const stage = main.querySelector('.stage');
  const screen = stage.querySelector('.stage-screen');
  const wipe = stage.querySelector('.stage-wipe');
  const caption = stage.querySelector('.stage-caption');
  const picker = stage.querySelector('.stage-picker');
  const buttons = [...picker.querySelectorAll('button')];
  const playButton = stage.querySelector('.stage-play');
  let active = -1;
  let layer;
  let video;
  let transition;
  let playRequested = motionOn;

  function updatePlayButton() {
    playButton.hidden = !video;
    playButton.disabled = Boolean(video?.error);
    playButton.textContent = video?.error ? '영상 재생 불가' : video?.paused ? '영상 재생' : '영상 일시정지';
  }

  function updatePlayback() {
    if (!video) return;
    if (playRequested && !document.hidden) {
      playVideo(video).catch(updatePlayButton);
    } else {
      video.pause();
    }
  }

  function pick(index) {
    if (active === index) return;
    const project = projects[index];
    const previous = layer;
    active = index;
    entrance?.progress(1);
    transition?.kill();
    video?.pause();
    for (const child of [...screen.children]) {
      if (child !== previous) child.remove();
    }
    gsap?.set([caption, wipe], { clearProps: 'transform,opacity' });
    if (previous) gsap?.set(previous, { clearProps: 'clipPath' });

    layer = document.createElement('div');
    layer.className = 'stage-layer';
    layer.innerHTML = art(project, project.poster || project.cover) + (project.video ? videoMarkup(project) : '');
    screen.append(layer);
    video = layer.querySelector('video');
    if (video) {
      showVideoFrames(video);
      video.addEventListener('play', updatePlayButton);
      video.addEventListener('pause', updatePlayButton);
      video.addEventListener('error', updatePlayButton);
    }

    stage.querySelector('.stage-type').textContent = project.type;
    caption.querySelector('.caption-role').textContent = project.role;
    caption.querySelector('h2').textContent = project.name;
    caption.querySelector('.caption-summary').textContent = project.summary;
    caption.querySelector('a').href = detailLink(project);
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === active)));
    updatePlayButton();
    updatePlayback();

    if (gsap && motionOn && previous) {
      transition = gsap.timeline({ onComplete: () => previous.remove() });
      transition
        .fromTo(layer, { clipPath: 'inset(0% 0% 0% 100%)' }, {
          clipPath: 'inset(0% 0% 0% 0%)', duration: 0.69, ease: 'power3.inOut', clearProps: 'clipPath',
        }, 0)
        .fromTo(wipe, { opacity: 0.92, scaleX: 0 }, { opacity: 0, scaleX: 1, duration: 0.58, ease: 'power3.out' }, 0.08)
        .from(caption, { y: 19, opacity: 0, duration: 0.43, ease: 'power2.out', clearProps: 'transform,opacity' }, 0.26);
    } else {
      previous?.remove();
    }
  }

  picker.addEventListener('click', event => {
    const button = event.target.closest('button[data-project]');
    if (button) pick(Number(button.dataset.project));
  });
  picker.addEventListener('keydown', event => {
    const button = event.target.closest('button[data-project]');
    if (!button || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const index = (Number(button.dataset.project) + direction + projects.length) % projects.length;
    buttons[index].focus();
    pick(index);
  });
  playButton.addEventListener('click', () => {
    playRequested = video.paused;
    updatePlayback();
  });
  document.addEventListener('visibilitychange', updatePlayback);
  updateMotion = () => {
    if (!motionOn) transition?.progress(1);
    playRequested = motionOn;
    updatePlayback();
  };
  pick(0);
  if (gsap && motionOn) {
    entrance = gsap.timeline()
      .from('.stage-layer', { scale: 1.055, duration: 1.3, ease: 'power2.out', clearProps: 'transform' }, 0)
      .from('.stage-identity h1 span', { yPercent: 106, duration: 0.92, ease: 'power4.out', clearProps: 'transform' }, 0.06)
      .from('.stage-identity .identity-role, .identity-copy, .stage-caption', {
        y: 24, opacity: 0, duration: 0.68, stagger: 0.075, ease: 'power3.out', clearProps: 'transform,opacity',
      }, 0.22)
      .from('.stage-picker button', { y: 17, opacity: 0, duration: 0.52, stagger: 0.045, clearProps: 'transform,opacity' }, 0.42);
  }
}

function renderExhibit() {
  main.innerHTML = `
    <section class="exhibit-intro">
      <div>
        <p class="identity-role">게임 클라이언트 프로그래머</p>
        <h1>윤평화<span>.</span></h1>
      </div>
      <p class="exhibit-instruction"></p>
    </section>
    <section class="exhibit" aria-label="프로젝트 전시">
      <div class="exhibit-frame">
        <div class="exhibit-heading">
          <h2>프로젝트</h2>
          <nav class="exhibit-nav" aria-label="프로젝트 바로 가기">
            ${projects.map((project, index) => `<button type="button" data-project="${index}">${project.name}</button>`).join('')}
          </nav>
        </div>
        <div class="exhibit-progress" aria-hidden="true"><i></i></div>
        <div class="exhibit-viewport">
          <div class="exhibit-track">
            ${projects.map((project, index) => `
              <article class="exhibit-card">
                <div class="exhibit-art">${art(project, project.exhibit || project.cover, index > 1 ? 'lazy' : 'eager')}</div>
                <div class="exhibit-caption">
                  <div><p>${project.type}</p><h3>${project.name}</h3></div>
                  <div><strong>${project.role}</strong><p>${project.summary}</p></div>
                  <a class="detail-link" href="${detailLink(project)}">프로젝트 보기 <span aria-hidden="true">↗</span></a>
                </div>
              </article>`).join('')}
          </div>
        </div>
      </div>
    </section>`;

  const gallery = main.querySelector('.exhibit');
  const frame = gallery.querySelector('.exhibit-frame');
  const viewport = gallery.querySelector('.exhibit-viewport');
  const track = gallery.querySelector('.exhibit-track');
  const progressBar = gallery.querySelector('.exhibit-progress i');
  const instruction = main.querySelector('.exhibit-instruction');
  const nav = gallery.querySelector('.exhibit-nav');
  const buttons = [...nav.querySelectorAll('button')];
  const cards = [...track.querySelectorAll('.exhibit-card')];
  const wideScreen = matchMedia('(min-width: 900px) and (min-height: 620px)');
  let tween;
  let stops = [];
  let distance = 0;
  let active = 0;

  function measure() {
    distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
    stops = cards.map(card => Math.min(card.offsetLeft, distance));
    return distance;
  }

  function mark(position) {
    let nearest = 0;
    stops.forEach((stop, index) => {
      if (Math.abs(stop - position) <= Math.abs(stops[nearest] - position)) nearest = index;
    });
    active = nearest;
    progressBar.style.transform = `scaleX(${distance ? Math.min(1, position / distance) : 0})`;
    buttons.forEach((button, index) => {
      if (index === active) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
      const link = cards[index].querySelector('a');
      if (tween && index !== active) link.tabIndex = -1;
      else link.removeAttribute('tabindex');
    });
  }

  function configureScroll() {
    const useScrub = gsap && ScrollTrigger && motionOn && wideScreen.matches;
    if (useScrub && !tween) {
      const startAt = active;
      const wasAtGallery = Math.abs(gallery.getBoundingClientRect().top - review.offsetHeight) < 12;
      gallery.classList.add('is-scrubbing');
      viewport.scrollLeft = 0;
      measure();
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate() { mark(this.progress() * distance); },
        scrollTrigger: {
          trigger: gallery,
          pin: frame,
          start: () => `top top+=${review.offsetHeight}`,
          end: () => `+=${Math.max(1, measure())}`,
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });
      timeline
        .to(track, { x: () => -measure(), duration: 1 }, 0)
        .fromTo('.exhibit-art .art-image', { xPercent: -3, scale: 1.12 }, { xPercent: 3, scale: 1.12, duration: 1 }, 0);
      tween = timeline;
      ScrollTrigger.refresh();
      if (wasAtGallery && distance) {
        scrollTo({ top: timeline.scrollTrigger.start + stops[startAt], behavior: 'instant' });
      }
      mark(timeline.progress() * distance);
    } else if (!useScrub && tween) {
      const wasPinned = tween.scrollTrigger.isActive;
      const lastActive = active;
      tween.scrollTrigger.kill(true);
      tween.revert();
      tween = undefined;
      gallery.classList.remove('is-scrubbing');
      measure();
      viewport.scrollLeft = stops[lastActive];
      if (wasPinned) gallery.scrollIntoView({ block: 'start', behavior: 'instant' });
      mark(viewport.scrollLeft);
    } else if (!tween) {
      measure();
      mark(viewport.scrollLeft);
    }
    instruction.textContent = tween ? '아래로 스크롤해 작업을 넘겨보세요 ↓' : '작품을 선택하거나 옆으로 넘겨보세요 →';
  }

  nav.addEventListener('click', event => {
    const button = event.target.closest('button[data-project]');
    if (!button) return;
    const target = stops[Number(button.dataset.project)];
    const behavior = motionOn ? 'smooth' : 'instant';
    if (tween) scrollTo({ top: tween.scrollTrigger.start + target, behavior });
    else viewport.scrollTo({ left: target, behavior });
  });
  viewport.addEventListener('scroll', () => {
    if (!tween) mark(viewport.scrollLeft);
  }, { passive: true });
  window.addEventListener('resize', () => {
    if (!tween) configureScroll();
  });
  wideScreen.addEventListener('change', configureScroll);
  updateMotion = configureScroll;
  configureScroll();
  enter('.exhibit-intro > *');
}

function renderCases() {
  main.innerHTML = `
    <section class="cases">
      <div class="cases-intro">
        <div><p class="identity-role">게임 클라이언트 프로그래머</p><h1>윤평화</h1></div>
        <p>프로젝트를 열어<br>어떤 문제를 어떻게 풀었는지 살펴보세요.</p>
      </div>
      <div class="case-grid">
        ${projects.map((project, index) => `
          <button class="case-tile" type="button" data-project="${index}" aria-haspopup="dialog">
            <span class="tile-art" aria-hidden="true">${art(project)}</span>
            <span class="tile-title"><strong>${project.name}</strong><span>${project.role}</span></span>
            <span class="tile-open" aria-hidden="true">↗</span>
          </button>`).join('')}
      </div>
    </section>
    <dialog class="case-dialog" aria-labelledby="case-heading"></dialog>`;

  const grid = main.querySelector('.case-grid');
  const dialog = main.querySelector('.case-dialog');
  let opener;
  let dialogMotion;
  let stepMotion;
  let closing = false;

  function evidenceMarkup(project) {
    if (!project.evidence) return `<div class="case-art">${art(project)}</div>`;
    return project.evidence.map(item => `
      <figure>
        <div class="case-art">
          ${art({ position: 'center' }, item.image)}
          ${item.video ? videoMarkup(item) : ''}
          ${item.video ? `<button class="media-button evidence-play" type="button" data-play aria-label="${item.caption} 재생">▶ 재생</button>` : ''}
        </div>
        <figcaption>${item.caption}</figcaption>
      </figure>`).join('');
  }

  function showCase(project, button) {
    if (dialog.open) return;
    clearCase();
    opener = button;
    const origin = button.getBoundingClientRect();
    dialog.innerHTML = `
      <article class="case-panel">
        <header class="case-head">
          <div><p>${project.name} <span>·</span> ${project.role}</p><h2 id="case-heading">${project.caseTitle}</h2></div>
          <button class="case-close" type="button" data-close aria-label="구현 기록 닫기" autofocus>×</button>
        </header>
        <div class="case-evidence${project.evidence?.length === 2 ? ' two-views' : ''}">
          ${evidenceMarkup(project)}
        </div>
        <div class="case-process">
          <div class="case-steps" role="group" aria-label="구현 과정">
            ${project.steps.map(([label], index) => `
              <button type="button" data-step="${index}" aria-pressed="${index === 0}">${label}</button>`).join('')}
          </div>
          <p class="step-copy" aria-live="polite">${project.steps[0][1]}</p>
          <a class="detail-link" href="${detailLink(project, project.detail)}">전체 구현 기록 <span aria-hidden="true">↗</span></a>
        </div>
      </article>`;
    button.focus({ preventScroll: true });
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('case-open');
    dialog.querySelectorAll('video').forEach(showVideoFrames);
    const panel = dialog.querySelector('.case-panel');
    if (gsap && motionOn) {
      const destination = panel.getBoundingClientRect();
      dialogMotion = gsap.timeline()
        .fromTo(panel, {
          x: origin.left - destination.left, y: origin.top - destination.top,
          scaleX: origin.width / destination.width, scaleY: origin.height / destination.height,
          transformOrigin: '0 0', opacity: 0.55,
        }, {
          x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1,
          duration: 0.59, ease: 'power3.inOut', clearProps: 'transform,transformOrigin,opacity',
        })
        .from('.case-head > div, .case-process', {
          y: 20, opacity: 0, duration: 0.36, stagger: 0.08, ease: 'power2.out', clearProps: 'transform,opacity',
        }, 0.35);
    }

    const stepCopy = dialog.querySelector('.step-copy');
    dialog.querySelector('.case-steps').addEventListener('click', event => {
      const step = event.target.closest('button[data-step]');
      if (!step || step.getAttribute('aria-pressed') === 'true') return;
      dialog.querySelectorAll('[data-step]').forEach(item => item.setAttribute('aria-pressed', String(item === step)));
      stepCopy.textContent = project.steps[Number(step.dataset.step)][1];
      if (gsap && motionOn) {
        stepMotion?.progress(1);
        stepMotion = gsap.from(stepCopy, {
          y: 9, opacity: 0, duration: 0.31, ease: 'power2.out', clearProps: 'transform,opacity',
        });
      }
    });
  }

  function clearCase() {
    if (dialog.open || !opener) return;
    dialogMotion?.kill();
    stepMotion?.kill();
    dialogMotion = undefined;
    stepMotion = undefined;
    dialog.querySelectorAll('video').forEach(video => video.pause());
    dialog.replaceChildren();
    document.body.classList.remove('case-open');
    closing = false;
    opener.focus({ preventScroll: true });
    opener = undefined;
  }

  function finishClose() {
    dialog.close();
    clearCase();
  }

  function closeCase() {
    if (closing || !dialog.open) return;
    closing = true;
    dialog.querySelectorAll('video').forEach(video => video.pause());
    dialogMotion?.progress(1);
    if (gsap && motionOn) {
      dialogMotion = gsap.to(dialog.querySelector('.case-panel'), {
        y: 15, opacity: 0, duration: 0.21, ease: 'power2.in', onComplete: finishClose,
      });
    } else {
      finishClose();
    }
  }

  grid.addEventListener('click', event => {
    const button = event.target.closest('button[data-project]');
    if (button) showCase(projects[Number(button.dataset.project)], button);
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target.closest('[data-close]')) {
      closeCase();
      return;
    }
    const button = event.target.closest('[data-play]');
    if (!button) return;
    const video = button.closest('.case-art').querySelector('video');
    const caption = button.closest('figure').querySelector('figcaption').textContent;
    const updateButton = () => {
      button.textContent = video.paused ? '▶ 재생' : 'Ⅱ 일시정지';
      button.setAttribute('aria-label', `${caption} ${video.paused ? '재생' : '일시정지'}`);
    };
    video.onplaying = updateButton;
    video.onpause = updateButton;
    if (video.paused) playVideo(video).catch(updateButton);
    else video.pause();
  });
  dialog.addEventListener('cancel', event => {
    if (!event.cancelable) return;
    event.preventDefault();
    closeCase();
  });
  dialog.addEventListener('close', clearCase);
  updateMotion = () => {
    if (!motionOn) {
      dialogMotion?.progress(1);
      stepMotion?.progress(1);
    }
  };
  enter('.cases-intro > *, .case-tile');
}

const views = { stage: renderStage, exhibit: renderExhibit, cases: renderCases };
const requestedView = new URLSearchParams(location.search).get('view');
const view = Object.hasOwn(views, requestedView) ? requestedView : 'stage';
document.body.dataset.view = view;
document.querySelector(`.review-options [data-view="${view}"]`).setAttribute('aria-current', 'page');
views[view]();
