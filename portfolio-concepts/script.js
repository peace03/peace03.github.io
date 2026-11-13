const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const video = document.querySelector('[data-motion-video]');
const videoToggle = document.querySelector('.video-toggle');

if (video && videoToggle) {
  const updateVideoButton = () => {
    videoToggle.textContent = video.paused ? '영상 재생' : '영상 일시정지';
    videoToggle.setAttribute('aria-pressed', String(!video.paused));
  };
  video.addEventListener('play', updateVideoButton);
  video.addEventListener('pause', updateVideoButton);
  video.addEventListener('timeupdate', () => {
    if (video.currentTime < 1.5) video.currentTime = 1.5;
  });
  videoToggle.addEventListener('click', () => {
    if (video.paused) video.play().catch(updateVideoButton);
    else video.pause();
  });
  motionPreference.addEventListener('change', event => {
    if (event.matches) video.pause();
  });
  if (!motionPreference.matches) video.play().catch(updateVideoButton);
}

document.querySelectorAll('[data-feature-switcher]').forEach(switcher => {
  const buttons = switcher.querySelectorAll('[data-feature]');
  const panels = switcher.querySelectorAll('[data-feature-panel]');
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    panels.forEach(panel => { panel.hidden = panel.dataset.featurePanel !== button.dataset.feature; });
  }));
});
