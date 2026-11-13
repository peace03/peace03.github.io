(() => {
  const dialog = document.querySelector("#explore");
  if (typeof dialog?.showModal !== "function") return;

  const world = dialog.querySelector(".map-world");
  const canvas = world.querySelector("canvas");
  const marker = world.querySelector(".map-marker");
  const progress = world.querySelector(".map-progress");
  const picture = dialog.querySelector(".map-picture");
  const caption = dialog.querySelector("figcaption");
  const title = dialog.querySelector("#map-project");
  const story = dialog.querySelector(".map-story");
  const credit = dialog.querySelector(".map-credit");
  const record = dialog.querySelector(".map-record");
  const play = dialog.querySelector(".map-play");
  const storageKey = "yph-project-map";

  function visual(place, decorative) {
    if (place.cover) {
      const image = new Image();
      image.alt = decorative ? "" : place.alt;
      image.decoding = "async";
      if (decorative) image.loading = "lazy";
      image.src = place.cover;
      return image;
    }
    const diagram = document.createElement("span");
    diagram.className = "map-diagram";
    diagram.setAttribute("aria-hidden", "true");
    return diagram;
  }

  const places = Array.from(document.querySelectorAll("[data-map-point]"), chapter => {
    const [x, y] = chapter.dataset.mapPoint.split(" ").map(Number);
    const name = chapter.dataset.mapName ?? chapter.querySelector("h2").textContent.trim();
    const evidence = chapter.querySelector(".evidence");
    const image = evidence.querySelector("img");
    const cover = chapter.dataset.mapCover;
    const place = {
      chapter, name, x, y,
      cover: cover ?? image?.getAttribute("src"),
      alt: cover ? `${name} 타이틀 이미지` : image?.alt,
      caption: cover ? "프로젝트 타이틀 이미지" : evidence.querySelector("figcaption").textContent.trim(),
      statement: chapter.querySelector(".build h3").textContent.trim(),
      credit: chapter.querySelector(".credit"),
      playId: chapter.dataset.play ?? chapter.id
    };
    const button = document.createElement("button");
    button.type = "button";
    button.className = "map-pin";
    button.style.setProperty("--x", `${x}%`);
    button.style.setProperty("--y", `${y}%`);
    const label = document.createElement("span");
    label.className = "map-label";
    label.textContent = name;
    button.append(visual(place, true), label);
    world.append(button);
    return { ...place, button };
  });
  if (!places.length) return;

  let saved;
  try {
    saved = JSON.parse(sessionStorage.getItem(storageKey));
  } catch {
    // Storage can be disabled; the map remains usable for this visit.
  }
  const visited = new Set(places.filter(place =>
    Array.isArray(saved?.visited) && saved.visited.includes(place.chapter.id)
  ).map(place => place.chapter.id));
  let current = Math.max(0, places.findIndex(place => place.chapter.id === saved?.current));
  let previous = current;
  let returnFocus;

  function drawMap() {
    if (!dialog.open) return;
    const width = world.clientWidth;
    const height = world.clientHeight;
    const ctx = canvas.getContext("2d");
    if (!width || !height || !ctx) return;
    const density = Math.min(devicePixelRatio, 2);
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    ctx.scale(density, density);

    ctx.strokeStyle = "#4261736d";
    for (const [cx, cy, rx, ry] of [[.17, .14, .33, .54], [.91, .14, .30, .55], [.42, 1.03, .49, .46]]) {
      for (let ring = 1; ring <= 9; ring++) {
        ctx.beginPath();
        for (let step = 0; step <= 64; step++) {
          const angle = step / 64 * Math.PI * 2;
          const edge = ring / 9 * (1 + .12 * Math.sin(angle * 3 + cx) + .07 * Math.cos(angle * 5 - cy));
          const x = (cx + rx * edge * Math.cos(angle)) * width;
          const y = (cy + ry * edge * Math.sin(angle)) * height;
          if (step === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }

    function route(a, b, active) {
      if (!a || !b) return;
      const ax = a.x / 100 * width;
      const ay = a.y / 100 * height;
      const bx = b.x / 100 * width;
      const by = b.y / 100 * height;
      ctx.strokeStyle = active ? "#acecfc" : "#6b97a7";
      ctx.lineWidth = active ? 2 : 1.2;
      ctx.setLineDash(active ? [] : [3, 6]);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo((ax + bx) / 2 + (by - ay) * .12, (ay + by) / 2 + (ax - bx) * .12, bx, by);
      ctx.stroke();
    }
    for (const [from, to] of [[0, 1], [1, 2], [3, 4], [4, 5], [0, 3], [1, 4], [2, 5]]) {
      route(places[from], places[to], false);
    }
    if (previous !== current) route(places[previous], places[current], true);
  }

  function showProgress() {
    progress.textContent = `방문한 프로젝트 ${visited.size} / ${places.length}`;
    for (const { chapter, name, button } of places) {
      const seen = visited.has(chapter.id);
      button.toggleAttribute("data-visited", seen);
      button.setAttribute("aria-label", seen ? `${name}, 방문함` : name);
    }
  }

  function select(index) {
    if (current !== index) previous = current;
    current = index;
    const place = places[current];
    marker.style.setProperty("--x", `${place.x}%`);
    marker.style.setProperty("--y", `${place.y}%`);
    for (const { button } of places) button.setAttribute("aria-pressed", String(button === place.button));
    title.textContent = place.name;
    story.textContent = place.statement;
    credit.replaceChildren(...Array.from(place.credit.childNodes, node => node.cloneNode(true)));
    picture.replaceChildren(visual(place, false));
    caption.textContent = place.cover ? place.caption : place.chapter.querySelector(".state-figure").textContent.trim();
    record.href = `#${place.chapter.id}`;
    play.href = `play.html#${place.playId}`;
    drawMap();
  }

  const directions = new Map([
    ["ArrowLeft", [-1, 0]], ["a", [-1, 0]],
    ["ArrowRight", [1, 0]], ["d", [1, 0]],
    ["ArrowUp", [0, -1]], ["w", [0, -1]],
    ["ArrowDown", [0, 1]], ["s", [0, 1]]
  ]);
  world.addEventListener("keydown", event => {
    const from = places.find(place => place.button === event.target);
    const direction = directions.get(event.key) ?? directions.get(event.key.toLowerCase());
    if (!from || !direction || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    const [dx, dy] = direction;
    let nearest = -1;
    let distance = Infinity;
    places.forEach((place, index) => {
      const x = place.x - from.x;
      const y = place.y - from.y;
      const ahead = x * dx + y * dy;
      const across = Math.abs(x * dy - y * dx);
      const score = ahead + 2 * across;
      if (ahead > 0 && across <= ahead && score < distance) {
        nearest = index;
        distance = score;
      }
    });
    if (nearest < 0) return;
    select(nearest);
    places[nearest].button.focus();
  });
  places.forEach(({ button }, index) => button.addEventListener("click", () => select(index)));

  function openMap(trigger) {
    if (dialog.open) return;
    const menu = trigger.closest("details");
    returnFocus = menu?.querySelector("summary") ?? trigger;
    if (menu) menu.open = false;
    dialog.showModal();
    places[current].button.focus({ preventScroll: true });
    drawMap();
  }

  const triggers = document.querySelectorAll("[data-open-map]");
  for (const trigger of triggers) {
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.addEventListener("click", event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openMap(trigger);
    });
  }

  function visit() {
    const id = places[current].chapter.id;
    visited.add(id);
    showProgress();
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ current: id, visited: [...visited] }));
    } catch {
      // Progress is still reflected in the current document.
    }
  }
  record.addEventListener("click", event => {
    visit();
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    dialog.close("record");
    places[current].chapter.focus({ preventScroll: true });
  });
  play.addEventListener("click", visit);
  dialog.querySelector(".map-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    if (dialog.returnValue !== "record") {
      returnFocus?.focus({ preventScroll: true });
      if (location.hash === "#explore") history.replaceState(history.state, "", location.pathname + location.search);
    }
    dialog.returnValue = "";
  });

  new ResizeObserver(drawMap).observe(world);
  showProgress();
  select(current);
  if (location.hash === "#explore") openMap(document.querySelector(".enter"));
})();
