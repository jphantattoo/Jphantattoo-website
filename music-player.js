(() => {
  const panel = document.querySelector('.site-music');
  const audio = panel.querySelector('audio');
  const toggle = panel.querySelector('[data-toggle]');
  const title = panel.querySelector('.music-title');
  const list = panel.querySelector('.music-tracks');
  const tracks = [{"title": "HanScript 01", "url": "/sarkar-track-0b47c923-53aa-5e66-8e0f-b6f2e2edecc2.mp3"}, {"title": "HanScript 02", "url": "/sarkar-track-5e82e7ca-4fd7-506d-a360-81dd9c949e30.mp3"}];
  let active = 0;
  let entered = false;

  function render() {
    title.textContent = tracks[active]?.title || 'No tracks';
    toggle.textContent = audio.paused ? '▶' : 'Ⅱ';
    toggle.setAttribute('aria-label', audio.paused ? 'Play music' : 'Pause music');
    list.querySelectorAll('button').forEach((button, index) => {
      button.setAttribute('aria-current', index === active ? 'true' : 'false');
    });
    panel.querySelectorAll('button').forEach(button => {
      if (button.closest('.music-controls')) button.disabled = !tracks.length;
    });
  }

  function select(index, play) {
    if (!tracks.length) return;
    active = (index + tracks.length) % tracks.length;
    if (audio.getAttribute('src') !== tracks[active].url) audio.src = tracks[active].url;
    if (audio.currentTime) audio.currentTime = 0;
    if (play) audio.play().catch(render);
    render();
  }

  function renderList() {
    list.replaceChildren(...tracks.map(({title}, index) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = title;
      button.addEventListener('click', () => select(index, true));
      item.append(button);
      return item;
    }));
    render();
  }

  panel.querySelector('[data-previous]').addEventListener('click', () => select(active - 1, true));
  panel.querySelector('[data-next]').addEventListener('click', () => select(active + 1, true));
  toggle.addEventListener('click', () => {
    if (audio.paused) audio.play().catch(render);
    else audio.pause();
  });
  audio.addEventListener('play', render);
  audio.addEventListener('pause', render);
  audio.addEventListener('ended', () => select(active + 1, true));
  panel.addEventListener('keydown', event => {
    const details = panel.querySelector('details');
    if (event.key === 'Escape' && details.open) {
      details.open = false;
      details.querySelector('summary').focus();
    }
  });

  function enter() {
    if (entered) return;
    entered = true;
    select(0, true);
  }
  document.addEventListener('jp:enter', enter, {once:true});
  renderList();
  select(0, false);
  if (document.documentElement.dataset.introEntered === 'true') enter();

  fetch('/sarkar-homepage.json', {cache:'no-cache'})
    .then(result => result.ok ? result.json() : null)
    .then(config => {
      if (!Array.isArray(config?.playlist)) return;
      const previousUrl = tracks[active]?.url;
      const replacement = config.playlist.filter(track => typeof track?.title === 'string' &&
        /^\/(?:hanscript-demo\.mp3|sarkar-track-[a-f0-9-]+\.mp3)$/.test(track?.url));
      const wasPlaying = !audio.paused;
      tracks.splice(0, tracks.length, ...replacement);
      active = entered ? Math.max(0, tracks.findIndex(track => track.url === previousUrl)) : 0;
      if (!tracks.length || tracks[active].url !== previousUrl) {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        select(active, entered && wasPlaying);
      }
      renderList();
    }).catch(() => {});
})();
