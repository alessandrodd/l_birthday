const CONFIG = {
  recipientName: "Laura",
  secretPassword: "ECB-CINEMA-23",
  finaleMessage: "Happy birthday. Cinema night unlocked.",
  voucherHint: "Use this password to open the cinema surprise.",
};

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const overlay = document.getElementById("overlay");
const overlayEyebrow = document.getElementById("overlayEyebrow");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const overlayHint = document.getElementById("overlayHint");
const primaryButton = document.getElementById("primaryButton");
const secondaryButton = document.getElementById("secondaryButton");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const HALF_WIDTH = WIDTH / 2;

const palette = {
  cream: "#f7f1e8",
  ink: "#172033",
  gold: "#ffcf4b",
  goldDeep: "#ff9d3b",
  blush: "#efbda5",
  hair: "#6d3f2f",
  hairLight: "#8c5b48",
  slate: "#708198",
  sky: "#8dc6ff",
  teal: "#4dc6be",
  rose: "#f27e7f",
  plum: "#6b5aa6",
  mint: "#9ce2ac",
};

const state = {
  scene: "title",
  previousScene: "",
  time: 0,
  pointer: {
    active: false,
    justPressed: false,
    justReleased: false,
    justTapped: false,
    x: HALF_WIDTH,
    y: HEIGHT * 0.8,
  },
  progress: {
    cinema: false,
    music: false,
    book: false,
  },
  particles: [],
  stars: createStars(50),
  avatarBob: 0,
  lastTimestamp: 0,
};

const cinema = {
  targetTickets: 5,
  timeLimit: 28,
  lives: 3,
  tickets: [],
  beams: [],
  collected: 0,
  timer: 0,
  spawnTicket: 0,
  spawnBeam: 0,
  invincible: 0,
  playerX: HALF_WIDTH,
};

const music = {
  totalNotes: 12,
  targetHits: 8,
  notes: [],
  timer: 0,
  nextSpawn: 0.9,
  spawned: 0,
  hits: 0,
  misses: 0,
  pulse: 0,
};

const book = {
  timeLimit: 35,
  timer: 0,
  cards: [],
  flippedIndices: [],
  matchedPairs: 0,
  mismatchClock: 0,
  mistakes: 0,
  maxMistakes: 5,
};

const flight = {
  gravity: 1100,
  flapVelocity: -390,
  speed: 170,
  playerY: HEIGHT * 0.45,
  playerVelocity: 0,
  obstacles: [],
  coins: [],
  timer: 0,
  spawnObstacle: 1.3,
  score: 0,
  coinsCollected: 0,
  flash: 0,
};

const overlayActions = {
  primary: null,
  secondary: null,
};

const pixelSprite = createHeroSprite();

const sceneConfig = {
  title: {
    eyebrow: "Birthday Quest",
    title: "Three doors. One skyline. One hidden gift for Laura.",
    text:
      "Guide a tiny 8-bit heroine through cinema, music, and book challenges. Clear all three to unlock Frankfurt Flight.",
    hint: "Best played on a smartphone. Touch and drag during movement challenges, tap during rhythm and flight.",
    primary: { label: "Start quest", action: () => showScene("cinema_intro") },
  },
  cinema_intro: {
    eyebrow: "Level 1 · Cinema",
    title: "Catch five tickets. Dodge the projector beams.",
    text:
      "Drag left and right to move. You have three hearts and twenty-eight seconds. The theater only opens for a quick player.",
    hint: "Goal: 5 tickets.",
    primary: { label: "Play cinema", action: () => startCinema() },
  },
  music_intro: {
    eyebrow: "Level 2 · Music",
    title: "Coldplay night: tap in rhythm when the notes cross the spotlight.",
    text:
      "The stage turns into a starry arena with a Coldplay-inspired glow. A note travels toward the hit zone in the center. Tap right on time and keep the set alive.",
    hint: "Goal: 8 hits out of 12 notes. Think stadium lights and stars.",
    primary: { label: "Play music", action: () => startMusic() },
  },
  book_intro: {
    eyebrow: "Level 3 · Books",
    title: "Flip the cards and match the dreamy pairs.",
    text:
      "Find all three pairs before the lantern light fades. You can afford a few mistakes, but not too many.",
    hint: "Goal: match 3 pairs within 35 seconds.",
    primary: { label: "Play books", action: () => startBook() },
  },
  flight_intro: {
    eyebrow: "Finale · Frankfurt Flight",
    title: "The skyline is ready. Beat the ECB run.",
    text:
      "Tap to flap between ECB Main Building, Eurotower, and Japan Center silhouettes. Reach score fifteen and collect euros on the way.",
    hint: "Goal: score 15. Coins are bonus points for style.",
    primary: { label: "Start flight", action: () => startFlight() },
  },
  ending: {
    eyebrow: "Gift unlocked",
    title: `Happy birthday, ${CONFIG.recipientName}.`,
    text: `${CONFIG.finaleMessage} Password: ${CONFIG.secretPassword}`,
    hint: CONFIG.voucherHint,
    primary: {
      label: "Copy password",
      action: async () => {
        try {
          await navigator.clipboard.writeText(CONFIG.secretPassword);
          overlayHint.textContent = "Password copied.";
        } catch (error) {
          overlayHint.textContent = `Copy failed. Password: ${CONFIG.secretPassword}`;
        }
      },
    },
    secondary: { label: "Play again", action: () => resetGame() },
  },
};

function createStars(count) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * WIDTH,
    y: Math.random() * HEIGHT,
    size: 1 + Math.random() * 2.6,
    speed: 4 + Math.random() * 14,
    alpha: 0.2 + Math.random() * 0.65,
  }));
}

function createHeroSprite() {
  const sprite = document.createElement("canvas");
  sprite.width = 16;
  sprite.height = 24;
  const sctx = sprite.getContext("2d");
  sctx.imageSmoothingEnabled = false;

  const pixels = [
    "................",
    "...hhhhhhhhh....",
    "..hhhhhhhhhhh...",
    "..hhssssssshh...",
    ".hhssseeeesshh..",
    ".hhssseeeesshh..",
    ".hhssseeeesshh..",
    ".hhsspppppsshh..",
    ".hhsssmmmssshh..",
    "..hggsssssggh...",
    "..gggsssssggg...",
    "..gggsssssggg...",
    "...ggggggggg....",
    "...bbbssbbbb....",
    "..bbbbssbbbbb...",
    "..bbbbssbbbbb...",
    "...bb....bbb....",
    "...ll....lll....",
    "..lll....llll...",
    "..lll....llll...",
    "...ll....lll....",
    "...ll....lll....",
    "..mmm....mmmm...",
    "................",
  ];

  const colorMap = {
    h: palette.hair,
    s: palette.blush,
    e: palette.cream,
    p: palette.hairLight,
    m: "#754d3a",
    g: "#c0cbd8",
    b: "#7188a7",
    l: "#3a4561",
  };

  pixels.forEach((row, y) => {
    row.split("").forEach((symbol, x) => {
      const color = colorMap[symbol];
      if (!color) {
        return;
      }
      sctx.fillStyle = color;
      sctx.fillRect(x, y, 1, 1);
    });
  });

  sctx.fillStyle = palette.ink;
  sctx.fillRect(5, 5, 1, 1);
  sctx.fillRect(10, 5, 1, 1);
  sctx.fillRect(6, 8, 4, 1);
  sctx.fillStyle = palette.gold;
  sctx.fillRect(1, 7, 1, 1);
  sctx.fillRect(13, 7, 1, 1);

  return sprite;
}

function showOverlay(configKey, overrides = {}) {
  const config = { ...sceneConfig[configKey], ...overrides };
  overlay.hidden = false;
  overlayEyebrow.textContent = config.eyebrow ?? "";
  overlayTitle.textContent = config.title ?? "";
  overlayText.textContent = config.text ?? "";
  overlayHint.textContent = config.hint ?? "";

  if (config.primary) {
    primaryButton.hidden = false;
    primaryButton.textContent = config.primary.label;
    overlayActions.primary = config.primary.action;
  } else {
    primaryButton.hidden = true;
    overlayActions.primary = null;
  }

  if (config.secondary) {
    secondaryButton.hidden = false;
    secondaryButton.textContent = config.secondary.label;
    overlayActions.secondary = config.secondary.action;
  } else {
    secondaryButton.hidden = true;
    overlayActions.secondary = null;
  }
}

function hideOverlay() {
  overlay.hidden = true;
}

primaryButton.addEventListener("click", () => {
  overlayActions.primary?.();
});

secondaryButton.addEventListener("click", () => {
  overlayActions.secondary?.();
});

function showScene(sceneName) {
  state.previousScene = state.scene;
  state.scene = sceneName;
  if (sceneConfig[sceneName]) {
    showOverlay(sceneName);
  }
}

function resetGame() {
  state.progress.cinema = false;
  state.progress.music = false;
  state.progress.book = false;
  state.particles.length = 0;
  flight.score = 0;
  flight.coinsCollected = 0;
  showScene("title");
}

function startCinema() {
  cinema.lives = 3;
  cinema.timer = cinema.timeLimit;
  cinema.tickets = [];
  cinema.beams = [];
  cinema.collected = 0;
  cinema.spawnTicket = 0.5;
  cinema.spawnBeam = 0.65;
  cinema.invincible = 0;
  cinema.playerX = HALF_WIDTH;
  state.scene = "cinema_play";
  hideOverlay();
}

function startMusic() {
  music.notes = [];
  music.timer = 0;
  music.nextSpawn = 0.9;
  music.spawned = 0;
  music.hits = 0;
  music.misses = 0;
  music.pulse = 0;
  state.scene = "music_play";
  hideOverlay();
}

function startBook() {
  const ids = ["moon", "moon", "leaf", "leaf", "lantern", "lantern"];
  shuffle(ids);
  book.cards = ids.map((id, index) => ({
    id,
    revealed: false,
    matched: false,
    x: 42 + (index % 2) * 154,
    y: 240 + Math.floor(index / 2) * 142,
    width: 152,
    height: 120,
  }));
  book.flippedIndices = [];
  book.matchedPairs = 0;
  book.mismatchClock = 0;
  book.mistakes = 0;
  book.timer = book.timeLimit;
  state.scene = "book_play";
  hideOverlay();
}

function startFlight() {
  flight.playerY = HEIGHT * 0.45;
  flight.playerVelocity = 0;
  flight.obstacles = [];
  flight.coins = [];
  flight.timer = 0;
  flight.spawnObstacle = 1.15;
  flight.score = 0;
  flight.coinsCollected = 0;
  flight.flash = 0;
  state.scene = "flight_play";
  hideOverlay();
}

function finishScene(kind, won) {
  if (kind === "cinema") {
    if (won) {
      state.progress.cinema = true;
      showOverlay("music_intro");
      state.scene = "music_intro";
    } else {
      showOverlay("cinema_intro", {
        title: "Cinema room failed.",
        text: "Projector beams won that round. Try again and keep your movement tighter near the ticket line.",
        primary: { label: "Retry cinema", action: () => startCinema() },
      });
      state.scene = "cinema_intro";
    }
  }

  if (kind === "music") {
    if (won) {
      state.progress.music = true;
      showOverlay("book_intro");
      state.scene = "book_intro";
    } else {
      showOverlay("music_intro", {
        title: "Music room failed.",
        text: "The timing slipped. Wait for the note to meet the spotlight, then tap cleanly.",
        primary: { label: "Retry music", action: () => startMusic() },
      });
      state.scene = "music_intro";
    }
  }

  if (kind === "book") {
    if (won) {
      state.progress.book = true;
      showOverlay("flight_intro");
      state.scene = "flight_intro";
    } else {
      showOverlay("book_intro", {
        title: "Book room failed.",
        text: "Too many mismatches or not enough time. Slow down and remember the card positions.",
        primary: { label: "Retry books", action: () => startBook() },
      });
      state.scene = "book_intro";
    }
  }

  if (kind === "flight") {
    if (won) {
      releaseConfetti(85);
      showScene("ending");
    } else {
      showOverlay("flight_intro", {
        title: "Skyline collision.",
        text: "Frankfurt pushed back. Tap a little earlier and ride the middle of each gap.",
        primary: { label: "Retry flight", action: () => startFlight() },
      });
      state.scene = "flight_intro";
    }
  }
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function distance(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

function spawnCinemaTicket() {
  cinema.tickets.push({
    x: 48 + Math.random() * (WIDTH - 96),
    y: -20,
    speed: 120 + Math.random() * 50,
    wobble: Math.random() * Math.PI * 2,
    size: 17,
  });
}

function spawnCinemaBeam() {
  cinema.beams.push({
    x: 36 + Math.random() * (WIDTH - 72),
    y: -120,
    width: 38 + Math.random() * 24,
    height: 150 + Math.random() * 80,
    speed: 170 + Math.random() * 90,
    drift: -18 + Math.random() * 36,
  });
}

function updateCinema(delta) {
  cinema.timer -= delta;
  cinema.spawnTicket -= delta;
  cinema.spawnBeam -= delta;
  cinema.invincible = Math.max(0, cinema.invincible - delta);

  const targetX = state.pointer.active ? state.pointer.x : cinema.playerX;
  cinema.playerX += (targetX - cinema.playerX) * Math.min(1, delta * 8);
  cinema.playerX = clamp(cinema.playerX, 32, WIDTH - 32);

  if (cinema.spawnTicket <= 0) {
    spawnCinemaTicket();
    cinema.spawnTicket = 0.65 + Math.random() * 0.45;
  }

  if (cinema.spawnBeam <= 0) {
    spawnCinemaBeam();
    cinema.spawnBeam = 0.72 + Math.random() * 0.3;
  }

  cinema.tickets.forEach((ticket) => {
    ticket.y += ticket.speed * delta;
    ticket.x += Math.sin(state.time * 4 + ticket.wobble) * 18 * delta;
  });

  cinema.beams.forEach((beam) => {
    beam.y += beam.speed * delta;
    beam.x += beam.drift * delta;
  });

  cinema.tickets = cinema.tickets.filter((ticket) => {
    if (distance(ticket.x, ticket.y, cinema.playerX, HEIGHT - 124) < 34) {
      cinema.collected += 1;
      releaseBurst(ticket.x, ticket.y, palette.gold, 12);
      return false;
    }
    return ticket.y < HEIGHT + 30;
  });

  cinema.beams = cinema.beams.filter((beam) => {
    const hit =
      cinema.invincible <= 0 &&
      cinema.playerX > beam.x - beam.width * 0.5 &&
      cinema.playerX < beam.x + beam.width * 0.5 &&
      HEIGHT - 124 > beam.y &&
      HEIGHT - 172 < beam.y + beam.height;
    if (hit) {
      cinema.lives -= 1;
      cinema.invincible = 1.1;
      releaseBurst(cinema.playerX, HEIGHT - 136, palette.rose, 18);
    }
    return beam.y < HEIGHT + beam.height;
  });

  if (cinema.collected >= cinema.targetTickets) {
    finishScene("cinema", true);
  } else if (cinema.lives <= 0 || cinema.timer <= 0) {
    finishScene("cinema", false);
  }
}

function spawnMusicNote() {
  music.notes.push({
    x: -28,
    y: 428,
    speed: 235,
    hit: false,
  });
}

function updateMusic(delta) {
  music.timer += delta;
  music.nextSpawn -= delta;
  music.pulse = Math.max(0, music.pulse - delta * 3.4);

  if (music.spawned < music.totalNotes && music.nextSpawn <= 0) {
    spawnMusicNote();
    music.spawned += 1;
    music.nextSpawn = 1.02 + Math.random() * 0.35;
  }

  music.notes.forEach((note) => {
    note.x += note.speed * delta;
  });

  if (state.pointer.justTapped) {
    const hitZoneX = HALF_WIDTH;
    let bestNote = null;
    let bestDistance = Infinity;
    music.notes.forEach((note) => {
      const gap = Math.abs(note.x - hitZoneX);
      if (!note.hit && gap < bestDistance) {
        bestDistance = gap;
        bestNote = note;
      }
    });

    if (bestNote && bestDistance < 30) {
      bestNote.hit = true;
      music.hits += 1;
      music.pulse = 1;
      releaseBurst(HALF_WIDTH, 428, palette.teal, 14);
    } else {
      music.misses += 1;
      releaseBurst(HALF_WIDTH, 428, palette.rose, 8);
    }
  }

  music.notes = music.notes.filter((note) => {
    if (!note.hit && note.x > HALF_WIDTH + 38) {
      note.hit = true;
      music.misses += 1;
    }
    return note.x < WIDTH + 40 && !note.hit;
  });

  const notesResolved = music.hits + music.misses;
  const remaining = music.totalNotes - notesResolved;

  if (music.hits >= music.targetHits) {
    finishScene("music", true);
  } else if (remaining + music.hits < music.targetHits) {
    finishScene("music", false);
  }
}

function updateBook(delta) {
  book.timer -= delta;

  if (book.mismatchClock > 0) {
    book.mismatchClock -= delta;
    if (book.mismatchClock <= 0 && book.flippedIndices.length === 2) {
      const [firstIndex, secondIndex] = book.flippedIndices;
      book.cards[firstIndex].revealed = false;
      book.cards[secondIndex].revealed = false;
      book.flippedIndices.length = 0;
    }
  }

  if (state.pointer.justTapped && book.mismatchClock <= 0) {
    const tappedIndex = book.cards.findIndex((card) =>
      pointInRect(state.pointer.x, state.pointer.y, card),
    );

    if (tappedIndex >= 0) {
      const card = book.cards[tappedIndex];
      if (!card.matched && !card.revealed) {
        card.revealed = true;
        book.flippedIndices.push(tappedIndex);
        releaseBurst(card.x + card.width / 2, card.y + card.height / 2, palette.sky, 7);
      }
    }
  }

  if (book.flippedIndices.length === 2 && book.mismatchClock <= 0) {
    const [firstIndex, secondIndex] = book.flippedIndices;
    const first = book.cards[firstIndex];
    const second = book.cards[secondIndex];
    if (first.id === second.id) {
      first.matched = true;
      second.matched = true;
      book.flippedIndices.length = 0;
      book.matchedPairs += 1;
      releaseBurst(first.x + 40, first.y + 40, palette.gold, 12);
      releaseBurst(second.x + 90, second.y + 40, palette.gold, 12);
    } else {
      book.mismatchClock = 0.75;
      book.mistakes += 1;
    }
  }

  if (book.matchedPairs >= 3) {
    finishScene("book", true);
  } else if (book.timer <= 0 || book.mistakes > book.maxMistakes) {
    finishScene("book", false);
  }
}

function spawnFlightObstacle() {
  const gapHeight = 210;
  const minY = 150;
  const maxY = HEIGHT - 220 - gapHeight;
  const gapY = minY + Math.random() * (maxY - minY);
  const type = ["ecb", "eurotower", "japan"][Math.floor(Math.random() * 3)];
  const width = 86;
  flight.obstacles.push({
    x: WIDTH + width,
    width,
    gapY,
    gapHeight,
    type,
    passed: false,
  });

  if (Math.random() > 0.2) {
    flight.coins.push({
      x: WIDTH + width + 8,
      y: gapY + gapHeight * (0.25 + Math.random() * 0.5),
      radius: 14,
      collected: false,
    });
  }
}

function updateFlight(delta) {
  flight.timer += delta;
  flight.spawnObstacle -= delta;
  flight.flash = Math.max(0, flight.flash - delta * 3);

  if (state.pointer.justTapped) {
    flight.playerVelocity = flight.flapVelocity;
  }

  flight.playerVelocity += flight.gravity * delta;
  flight.playerY += flight.playerVelocity * delta;

  if (flight.spawnObstacle <= 0) {
    spawnFlightObstacle();
    flight.spawnObstacle = 1.3;
  }

  flight.obstacles.forEach((obstacle) => {
    obstacle.x -= flight.speed * delta;
    if (!obstacle.passed && obstacle.x + obstacle.width < 86) {
      obstacle.passed = true;
      flight.score += 1;
      flight.flash = 1;
      releaseBurst(88, flight.playerY, palette.gold, 10);
    }
  });

  flight.coins.forEach((coin) => {
    coin.x -= flight.speed * delta;
    if (!coin.collected && distance(coin.x, coin.y, 92, flight.playerY) < 28) {
      coin.collected = true;
      flight.coinsCollected += 1;
      releaseBurst(coin.x, coin.y, palette.goldDeep, 14);
    }
  });

  flight.obstacles = flight.obstacles.filter((obstacle) => obstacle.x + obstacle.width > -20);
  flight.coins = flight.coins.filter((coin) => coin.x > -40 && !coin.collected);

  const hitObstacle = flight.obstacles.some((obstacle) => {
    const playerRect = { x: 70, y: flight.playerY - 22, width: 34, height: 46 };
    const bottomRect = {
      x: obstacle.x,
      y: obstacle.gapY + obstacle.gapHeight,
      width: obstacle.width,
      height: HEIGHT - (obstacle.gapY + obstacle.gapHeight),
    };
    const topRect = {
      x: obstacle.x,
      y: 0,
      width: obstacle.width,
      height: obstacle.gapY,
    };
    return rectOverlap(playerRect, bottomRect) || rectOverlap(playerRect, topRect);
  });

  if (flight.playerY < 24 || flight.playerY > HEIGHT - 52 || hitObstacle) {
    finishScene("flight", false);
  } else if (flight.score >= 15) {
    finishScene("flight", true);
  }
}

function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

function rectOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function releaseBurst(x, y, color, amount) {
  for (let i = 0; i < amount; i += 1) {
    state.particles.push({
      x,
      y,
      vx: -90 + Math.random() * 180,
      vy: -90 + Math.random() * 180,
      life: 0.7 + Math.random() * 0.5,
      size: 3 + Math.random() * 4,
      color,
    });
  }
}

function releaseConfetti(amount) {
  for (let i = 0; i < amount; i += 1) {
    state.particles.push({
      x: Math.random() * WIDTH,
      y: -20 - Math.random() * 80,
      vx: -50 + Math.random() * 100,
      vy: 40 + Math.random() * 80,
      life: 2.4 + Math.random() * 1.2,
      size: 4 + Math.random() * 5,
      color: [palette.gold, palette.sky, palette.rose, palette.teal][Math.floor(Math.random() * 4)],
    });
  }
}

function updateParticles(delta) {
  state.particles = state.particles.filter((particle) => {
    particle.life -= delta;
    particle.x += particle.vx * delta;
    particle.y += particle.vy * delta;
    particle.vy += 90 * delta;
    return particle.life > 0;
  });
}

function updateBackgroundStars(delta) {
  state.stars.forEach((star) => {
    star.y += star.speed * delta;
    if (star.y > HEIGHT + 6) {
      star.y = -6;
      star.x = Math.random() * WIDTH;
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  switch (state.scene) {
    case "cinema_play":
      drawCinema();
      break;
    case "music_play":
      drawMusic();
      break;
    case "book_play":
      drawBook();
      break;
    case "flight_play":
      drawFlight();
      break;
    case "ending":
      drawEnding();
      break;
    default:
      drawTitleBackdrop();
  }

  drawParticles();
}

function drawTitleBackdrop() {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, "#132244");
  gradient.addColorStop(0.5, "#213762");
  gradient.addColorStop(1, "#10182e");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawStars();
  drawCurtains();
  drawGlow(HALF_WIDTH, 316, 130, "rgba(255, 208, 90, 0.12)");
  drawHero(HALF_WIDTH - 42, HEIGHT - 220, 5);
  drawDoorIcons();
}

function drawCinema() {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, "#120d22");
  gradient.addColorStop(0.6, "#24153c");
  gradient.addColorStop(1, "#070a14");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawCurtains();
  drawStars();

  ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
  for (let row = 0; row < 6; row += 1) {
    for (let seat = 0; seat < 6; seat += 1) {
      ctx.fillRect(28 + seat * 58, 612 + row * 32, 36, 12);
    }
  }

  cinema.beams.forEach((beam) => {
    const beamGradient = ctx.createLinearGradient(beam.x, beam.y, beam.x, beam.y + beam.height);
    beamGradient.addColorStop(0, "rgba(255, 252, 186, 0.45)");
    beamGradient.addColorStop(1, "rgba(255, 252, 186, 0)");
    ctx.fillStyle = beamGradient;
    ctx.beginPath();
    ctx.moveTo(beam.x - beam.width * 0.18, beam.y);
    ctx.lineTo(beam.x + beam.width * 0.18, beam.y);
    ctx.lineTo(beam.x + beam.width * 0.5, beam.y + beam.height);
    ctx.lineTo(beam.x - beam.width * 0.5, beam.y + beam.height);
    ctx.closePath();
    ctx.fill();
  });

  cinema.tickets.forEach((ticket) => {
    drawTicket(ticket.x, ticket.y, ticket.size);
  });

  if (cinema.invincible > 0 && Math.floor(cinema.invincible * 8) % 2 === 0) {
    ctx.globalAlpha = 0.45;
  }
  drawHero(cinema.playerX - 24, HEIGHT - 172, 3.3);
  ctx.globalAlpha = 1;

  drawHud({
    title: "Cinema",
    left: `Tickets ${cinema.collected}/${cinema.targetTickets}`,
    right: `Time ${Math.ceil(cinema.timer)}`,
    hearts: cinema.lives,
  });
}

function drawMusic() {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, "#1b1741");
  gradient.addColorStop(0.5, "#261758");
  gradient.addColorStop(1, "#10152e");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawStars();
  drawColdplayBands();
  drawGlow(HALF_WIDTH, 428, 100 + music.pulse * 20, `rgba(141, 198, 255, ${0.16 + music.pulse * 0.12})`);

  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fillRect(48, 422, WIDTH - 96, 12);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(HALF_WIDTH, 390);
  ctx.lineTo(HALF_WIDTH, 466);
  ctx.stroke();

  music.notes.forEach((note) => {
    drawMusicNote(note.x, note.y);
  });

  drawHero(HALF_WIDTH - 34, 190, 4.2);
  drawHud({
    title: "Music",
    left: `Hits ${music.hits}/${music.targetHits}`,
    right: `Misses ${music.misses}`,
    hearts: Math.max(0, 3 - Math.min(3, music.misses)),
  });

  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = '600 18px "Space Grotesk", sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("Coldplay-inspired stage: tap as the note crosses the spotlight", HALF_WIDTH, 548);
}

function drawBook() {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, "#14283e");
  gradient.addColorStop(0.48, "#2b3f55");
  gradient.addColorStop(1, "#1c241d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  for (let i = 0; i < 6; i += 1) {
    drawPaperPage(30 + i * 58, 96 + (i % 2) * 16, 44, 64, i);
  }

  drawGlow(HALF_WIDTH, 136, 120, "rgba(255, 207, 75, 0.15)");

  book.cards.forEach((card) => {
    ctx.fillStyle = card.revealed || card.matched ? "rgba(250, 242, 231, 0.95)" : "rgba(18, 32, 51, 0.85)";
    ctx.strokeStyle = card.matched ? palette.gold : "rgba(255, 255, 255, 0.16)";
    ctx.lineWidth = 3;
    roundRect(card.x, card.y, card.width, card.height, 18, true, true);

    if (card.revealed || card.matched) {
      drawCardSymbol(card);
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.font = '700 18px "Space Grotesk", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText("?", card.x + card.width / 2, card.y + card.height / 2 + 6);
    }
  });

  drawHud({
    title: "Books",
    left: `Pairs ${book.matchedPairs}/3`,
    right: `Time ${Math.ceil(book.timer)}`,
    hearts: Math.max(0, 5 - book.mistakes),
  });
}

function drawFlight() {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, "#f3cf99");
  gradient.addColorStop(0.36, "#c4877a");
  gradient.addColorStop(0.65, "#6e5e86");
  gradient.addColorStop(1, "#1b2e48");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawSun();
  drawDistantSkyline();

  flight.obstacles.forEach((obstacle) => {
    drawBuildingObstacle(obstacle, false);
    drawBuildingObstacle(obstacle, true);
  });

  flight.coins.forEach((coin) => drawCoin(coin.x, coin.y, coin.radius));
  drawHero(68, flight.playerY - 28, 3.4);
  drawFlightTrail();
  drawHud({
    title: "Frankfurt Flight",
    left: `Score ${flight.score}/15`,
    right: `Euros ${flight.coinsCollected}`,
    hearts: 1,
  });

  if (flight.flash > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${flight.flash * 0.15})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
}

function drawEnding() {
  drawFlight();
  ctx.fillStyle = "rgba(9, 13, 24, 0.32)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawHud({ title, left, right, hearts }) {
  ctx.fillStyle = "rgba(7, 12, 23, 0.52)";
  roundRect(18, 18, WIDTH - 36, 86, 22, true, false);
  ctx.fillStyle = palette.cream;
  ctx.font = '700 16px "Space Grotesk", sans-serif';
  ctx.textAlign = "left";
  ctx.fillText(title, 34, 48);
  ctx.font = '600 18px "Space Grotesk", sans-serif';
  ctx.fillText(left, 34, 76);
  ctx.textAlign = "right";
  ctx.fillText(right, WIDTH - 34, 76);
  drawHearts(34, 54, hearts);
}

function drawHearts(x, y, count) {
  for (let i = 0; i < count; i += 1) {
    ctx.fillStyle = palette.rose;
    drawHeart(x + i * 18, y, 7);
  }
}

function drawHeart(x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x, y + size);
  ctx.arc(x - size * 0.5, y + size * 0.4, size * 0.5, 0, Math.PI, true);
  ctx.arc(x + size * 0.5, y + size * 0.4, size * 0.5, 0, Math.PI, true);
  ctx.lineTo(x, y + size * 2);
  ctx.closePath();
  ctx.fill();
}

function drawHero(x, y, scale) {
  const bob = Math.sin(state.time * 4.2) * 2.2;
  ctx.drawImage(pixelSprite, x, y + bob, pixelSprite.width * scale, pixelSprite.height * scale);
}

function drawStars() {
  state.stars.forEach((star) => {
    ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });
}

function drawCurtains() {
  ctx.fillStyle = "rgba(78, 17, 40, 0.9)";
  ctx.fillRect(0, 0, 48, HEIGHT);
  ctx.fillRect(WIDTH - 48, 0, 48, HEIGHT);
  for (let i = 0; i < 8; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? "rgba(122, 20, 54, 0.54)" : "rgba(90, 16, 43, 0.52)";
    ctx.fillRect(i * 6, 0, 6, HEIGHT);
    ctx.fillRect(WIDTH - 48 + i * 6, 0, 6, HEIGHT);
  }
}

function drawDoorIcons() {
  const labels = ["Cinema", "Music", "Books"];
  const colors = [palette.gold, palette.sky, palette.mint];
  for (let i = 0; i < 3; i += 1) {
    const x = 44 + i * 116;
    const y = 410;
    ctx.fillStyle = "rgba(10, 19, 34, 0.66)";
    roundRect(x, y, 90, 124, 16, true, false);
    ctx.strokeStyle = colors[i];
    ctx.lineWidth = 3;
    roundRect(x, y, 90, 124, 16, false, true);
    ctx.fillStyle = colors[i];
    ctx.font = '700 15px "Space Grotesk", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText(labels[i], x + 45, y + 88);
  }
}

function drawGlow(x, y, radius, color) {
  const glow = ctx.createRadialGradient(x, y, 12, x, y, radius);
  glow.addColorStop(0, color);
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawTicket(x, y, size) {
  ctx.fillStyle = palette.gold;
  roundRect(x - size, y - size * 0.62, size * 2, size * 1.2, 8, true, false);
  ctx.fillStyle = "rgba(255,255,255,0.58)";
  ctx.fillRect(x - size * 0.58, y - 3, size * 1.16, 6);
}

function drawMusicNote(x, y) {
  ctx.fillStyle = palette.sky;
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x + 8, y - 34, 8, 34);
  ctx.beginPath();
  ctx.moveTo(x + 16, y - 34);
  ctx.lineTo(x + 36, y - 26);
  ctx.lineTo(x + 16, y - 18);
  ctx.closePath();
  ctx.fill();
}

function drawColdplayBands() {
  const colors = [
    "rgba(255, 99, 132, 0.14)",
    "rgba(255, 207, 75, 0.12)",
    "rgba(77, 198, 190, 0.12)",
    "rgba(141, 198, 255, 0.14)",
  ];

  colors.forEach((color, index) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(24, 170 + index * 22);
    ctx.bezierCurveTo(
      110,
      130 + index * 26 + Math.sin(state.time * 1.8 + index) * 12,
      270,
      220 + index * 12,
      WIDTH - 24,
      165 + index * 28,
    );
    ctx.stroke();
  });

  for (let i = 0; i < 9; i += 1) {
    const x = 36 + i * 40;
    const y = 138 + Math.sin(state.time * 2.6 + i * 0.7) * 12;
    drawTinyStar(x, y, 6 + (i % 3));
  }
}

function drawTinyStar(x, y, radius) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const outerAngle = -Math.PI / 2 + i * ((Math.PI * 2) / 5);
    const innerAngle = outerAngle + Math.PI / 5;
    const outerX = x + Math.cos(outerAngle) * radius;
    const outerY = y + Math.sin(outerAngle) * radius;
    const innerX = x + Math.cos(innerAngle) * radius * 0.45;
    const innerY = y + Math.sin(innerAngle) * radius * 0.45;
    if (i === 0) {
      ctx.moveTo(outerX, outerY);
    } else {
      ctx.lineTo(outerX, outerY);
    }
    ctx.lineTo(innerX, innerY);
  }
  ctx.closePath();
  ctx.fill();
}

function drawPaperPage(x, y, width, height, index) {
  ctx.fillStyle = "rgba(247, 241, 232, 0.12)";
  roundRect(x, y, width, height, 10, true, false);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  for (let row = 0; row < 4; row += 1) {
    ctx.fillRect(x + 8, y + 10 + row * 12 + (index % 2) * 2, width - 16, 2);
  }
}

function drawCardSymbol(card) {
  const cx = card.x + card.width / 2;
  const cy = card.y + card.height / 2;
  ctx.strokeStyle = palette.ink;
  ctx.fillStyle = palette.ink;
  ctx.lineWidth = 4;

  if (card.id === "moon") {
    ctx.beginPath();
    ctx.arc(cx - 8, cy, 26, 0.3, Math.PI * 1.7);
    ctx.stroke();
    ctx.fillStyle = palette.gold;
    ctx.beginPath();
    ctx.arc(cx + 8, cy - 8, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  if (card.id === "leaf") {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 30);
    ctx.quadraticCurveTo(cx + 30, cy - 10, cx, cy + 28);
    ctx.quadraticCurveTo(cx - 30, cy - 10, cx, cy - 30);
    ctx.fillStyle = "#3b8f63";
    ctx.fill();
    ctx.strokeStyle = palette.cream;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 24);
    ctx.lineTo(cx, cy + 24);
    ctx.stroke();
  }

  if (card.id === "lantern") {
    ctx.fillStyle = palette.goldDeep;
    roundRect(cx - 28, cy - 18, 56, 52, 12, true, false);
    ctx.strokeStyle = palette.ink;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 36);
    ctx.lineTo(cx, cy - 18);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy - 38, 10, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.58)";
    ctx.fillRect(cx - 8, cy - 2, 16, 22);
  }
}

function drawSun() {
  ctx.fillStyle = "rgba(255, 210, 146, 0.94)";
  ctx.beginPath();
  ctx.arc(308, 150, 54, 0, Math.PI * 2);
  ctx.fill();
  drawGlow(308, 150, 128, "rgba(255, 210, 146, 0.2)");
}

function drawDistantSkyline() {
  ctx.fillStyle = "rgba(20, 31, 53, 0.36)";
  const blocks = [
    [0, 566, 70, 278],
    [58, 620, 40, 224],
    [102, 590, 66, 254],
    [166, 540, 56, 304],
    [222, 584, 50, 260],
    [270, 616, 36, 228],
    [312, 558, 78, 286],
  ];
  blocks.forEach(([x, y, width, height]) => ctx.fillRect(x, y, width, height));
}

function drawBuildingObstacle(obstacle, top) {
  const y = top ? 0 : obstacle.gapY + obstacle.gapHeight;
  const height = top ? obstacle.gapY : HEIGHT - (obstacle.gapY + obstacle.gapHeight);
  ctx.save();
  ctx.translate(obstacle.x, y);
  if (top) {
    ctx.scale(1, -1);
    ctx.translate(0, -height);
  }

  ctx.fillStyle = "rgba(16, 24, 42, 0.94)";
  if (obstacle.type === "ecb") {
    const towerWidth = obstacle.width * 0.36;
    ctx.fillRect(0, 0, towerWidth, height);
    ctx.fillRect(obstacle.width - towerWidth, 0, towerWidth, height);
    ctx.fillRect(towerWidth, height * 0.4, obstacle.width - towerWidth * 2, 18);
    drawWindows(6, 18, towerWidth - 12, height - 32, 3, 12);
    drawWindows(obstacle.width - towerWidth + 6, 18, towerWidth - 12, height - 32, 3, 12);
  }

  if (obstacle.type === "eurotower") {
    ctx.fillRect(obstacle.width * 0.22, 0, obstacle.width * 0.56, height);
    ctx.fillStyle = "rgba(16, 24, 42, 0.94)";
    ctx.beginPath();
    ctx.ellipse(obstacle.width * 0.5, 22, obstacle.width * 0.34, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 207, 75, 0.68)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(obstacle.width * 0.5, 54, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 207, 75, 0.68)";
    ctx.fillRect(obstacle.width * 0.46, 36, 8, 36);
    ctx.fillRect(obstacle.width * 0.38, 50, 24, 8);
    drawWindows(obstacle.width * 0.28, 92, obstacle.width * 0.44, height - 104, 2, 11);
  }

  if (obstacle.type === "japan") {
    ctx.fillRect(obstacle.width * 0.16, 24, obstacle.width * 0.68, height - 24);
    ctx.beginPath();
    ctx.moveTo(obstacle.width * 0.16, 24);
    ctx.lineTo(obstacle.width * 0.5, 0);
    ctx.lineTo(obstacle.width * 0.84, 24);
    ctx.closePath();
    ctx.fill();
    drawWindows(obstacle.width * 0.24, 42, obstacle.width * 0.52, height - 56, 2, 10);
  }

  ctx.restore();
}

function drawWindows(x, y, width, height, cols, gapY) {
  ctx.fillStyle = "rgba(141, 198, 255, 0.22)";
  const spacingX = width / cols;
  for (let col = 0; col < cols; col += 1) {
    for (let row = 0; row < height / gapY; row += 1) {
      ctx.fillRect(x + col * spacingX, y + row * gapY, 6, 5);
    }
  }
}

function drawCoin(x, y, radius) {
  ctx.fillStyle = palette.gold;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius - 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = palette.ink;
  ctx.font = '700 18px "Space Grotesk", sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("€", x, y + 6);
}

function drawFlightTrail() {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(58, flight.playerY);
  for (let i = 0; i < 5; i += 1) {
    ctx.lineTo(34 - i * 12, flight.playerY + Math.sin(state.time * 8 + i) * 8);
  }
  ctx.stroke();
}

function drawParticles() {
  state.particles.forEach((particle) => {
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = clamp(particle.life, 0, 1);
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  });
  ctx.globalAlpha = 1;
}

function roundRect(x, y, width, height, radius, fill, stroke) {
  const r = Math.min(radius, width * 0.5, height * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}

function update(delta) {
  state.time += delta;
  updateBackgroundStars(delta);
  updateParticles(delta);

  if (state.scene === "cinema_play") {
    updateCinema(delta);
  } else if (state.scene === "music_play") {
    updateMusic(delta);
  } else if (state.scene === "book_play") {
    updateBook(delta);
  } else if (state.scene === "flight_play") {
    updateFlight(delta);
  } else if (state.scene === "ending" && state.particles.length < 40) {
    releaseConfetti(4);
  }

  state.pointer.justPressed = false;
  state.pointer.justReleased = false;
  state.pointer.justTapped = false;
}

function loop(timestamp) {
  if (!state.lastTimestamp) {
    state.lastTimestamp = timestamp;
  }
  const delta = Math.min(0.033, (timestamp - state.lastTimestamp) / 1000);
  state.lastTimestamp = timestamp;
  update(delta);
  draw();
  requestAnimationFrame(loop);
}

function toCanvasCoords(event) {
  const rect = canvas.getBoundingClientRect();
  const clientX = event.clientX ?? event.touches?.[0]?.clientX ?? event.changedTouches?.[0]?.clientX;
  const clientY = event.clientY ?? event.touches?.[0]?.clientY ?? event.changedTouches?.[0]?.clientY;
  return {
    x: ((clientX - rect.left) / rect.width) * WIDTH,
    y: ((clientY - rect.top) / rect.height) * HEIGHT,
  };
}

function onPointerDown(event) {
  const coords = toCanvasCoords(event);
  state.pointer.active = true;
  state.pointer.justPressed = true;
  state.pointer.justTapped = true;
  state.pointer.x = coords.x;
  state.pointer.y = coords.y;
}

function onPointerMove(event) {
  if (!state.pointer.active) {
    return;
  }
  const coords = toCanvasCoords(event);
  state.pointer.x = coords.x;
  state.pointer.y = coords.y;
}

function onPointerUp(event) {
  const coords = toCanvasCoords(event);
  state.pointer.active = false;
  state.pointer.justReleased = true;
  state.pointer.x = coords.x;
  state.pointer.y = coords.y;
}

canvas.addEventListener("pointerdown", onPointerDown);
canvas.addEventListener("pointermove", onPointerMove);
canvas.addEventListener("pointerup", onPointerUp);
canvas.addEventListener("pointerleave", () => {
  state.pointer.active = false;
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.code === "ArrowUp") {
    state.pointer.justTapped = true;
  }
});

showScene("title");
requestAnimationFrame(loop);
