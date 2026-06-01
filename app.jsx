const { useState, useEffect, useRef, useCallback } = React;

// ============= DATA =============
const WORKSHOPS = [
  {
    num: "01",
    title: "Intro to Game Industry",
    desc: "Meet the Göttingen Game Studio team, hear from industry professionals, explore career paths and roles in games, and get motivated to build your own project.",
    output: "Industry overview, career roadmap & guest speaker insights",
    goals: [
      "Introduce Göttingen Game Studio and our mission",
      "Explore the game industry and career paths",
      "Hear from guest speakers with real studio experience",
      "Motivate students to join Workshop 2 and the Game Jam"
    ],
    todo: [
      "Game Studio intro and what we offer",
      "Game industry roles (design, code, art, sound, PM)",
      "Guest speaker talks & Q\u0026A sessions",
      "Career paths, funding \u0026 opportunities",
      "Next steps: Workshop 2 and the Game Jam"
    ]
  },
  {
    num: "02",
    title: "Rapid Prototyping with Accessible Tools",
    desc: "Turn a small idea into a simple playable prototype using accessible tools, placeholders, templates, and optional AI-assisted workflows. Fast iteration and beginner-friendly experimentation.",
    output: "A first prototype or prototype concept + a simple workflow for testing \u0026 iteration",
    goals: [
      "Turn ideas into simple playable prototypes quickly",
      "Use accessible tools, placeholders \u0026 templates",
      "Learn realistic scoping \u0026 fast iteration",
      "Make prototyping beginner-friendly for all backgrounds"
    ],
    todo: [
      "Hands-on prototyping with accessible game tools",
      "Using placeholders, templates \u0026 AI-assisted workflows",
      "Scope management: keep it small, ship it fast",
      "Testing \u0026 iteration workflow",
      "Guest speaker on rapid feature development"
    ]
  },
  {
    num: "03",
    title: "Game Jam and Award",
    desc: "The final 48-hour challenge. Teams pitch, build, and present a small game. A mentor team will support you throughout, culminating in a showcase and awards.",
    output: "A playable game prototype \u0026 Gamescom ticket award entry",
    goals: [
      "Teams build a small game/prototype in 48 hours",
      "Teams present their work in a public showcase",
      "Award winning team (Gamescom tickets!)"
    ],
    todo: [
      "Define Game Jam format, duration \u0026 rules",
      "Set submission requirements \u0026 judging criteria",
      "Schedule mentor checkpoints \u0026 award ceremony"
    ]
  }
];

const SPEAKERS = [
  {
    name: "Filip Cholewczyński",
    role: "Senior Game Producer",
    company: "CD Projekt RED · 11 bit studios · Ubisoft · Wooga",
    bio: "15+ years across Europe's top studios. Credits include GWENT, Thronebreaker, Frostpunk, Skull & Bones, and June's Journey. Now building a coaching & consulting practice for the games industry.",
    photo: "speakers/Filip Cholewczynski_Gottingen Game Studio.png",
    linkedin: "https://www.linkedin.com/in/cholewczynski/",
    w: "01",
    confirmed: true
  },
  {
    name: "Cyrus Nemati",
    role: "Writer, Voice Actor & Indie Dev",
    company: "Little Bat Games · Supergiant Games",
    bio: "BAFTA-nominated writer and voice actor. Known for Vampire Therapist, and voicing Ares, Dionysus & Theseus in the Hades games. Founder of Little Bat Games.",
    photo: "speakers/cyrus.jpeg",
    linkedin: "https://www.linkedin.com/in/cyrus-nemati/",
    w: "02",
    confirmed: true
  },
  { name: "TBD", role: "HR Generalist · hiring & application flow", w: "01", confirmed: false },
  { name: "TBD", role: "Gameplay & Game-AI Programmer", w: "02", confirmed: false },
  { name: "TBD", role: "Indie writer / dev · leading small teams", w: "03", confirmed: false },
  { name: "TBD", role: "Producer · production, design, music", w: "03", confirmed: false },
];

const TEAM_MEMBERS = [
  {
    name: "Minh Tran",
    role: "Founder & Project Lead",
    desc: "M.A. English Philology · Ex-Product Manager at Wooga (June's Journey) · Marketing at Beyondthosehills",
    area: "Coordination"
  },
  {
    name: "Amirreza Aleyasin",
    role: "Co-Founder & Developer",
    desc: "M.Sc. Computational Biology · Certificate in Serious Game Design (Uppsala) · Python, ML, Docker, Git",
    area: "Program"
  },
  {
    name: "Simon Drexler",
    role: "Project Coordination & Operations",
    desc: "B.Sc. Psychology · Supports planning, coordination, communication, logistics and organizational tasks",
    area: "Operations"
  },
  {
    name: "Maxim",
    role: "Event Operations",
    desc: "Coordinating logistics, room setups, and participant registration.",
    area: "Logistics"
  },
  {
    name: "Alp",
    role: "Community & Outreach",
    desc: "Building student engagement, social channels, and campus publicity.",
    area: "Outreach"
  },
  {
    name: "Udari Wasana",
    role: "Marketing & Outreach",
    desc: "M.Sc. Crop Protection · VP of Marketing at DEGIS Göttingen · Digital communication & community engagement",
    area: "Marketing"
  },
  {
    name: "Hassan",
    role: "Technical Operations",
    desc: "Assisting with developer environment setup, git help, and tech checkpoints.",
    area: "Tech"
  },
];

const FAQS = [
  { q: "Do I need any coding experience?", a: "No. Göttingen Game Studio is beginner-friendly. Contribute through writing, art, sound, design, production, communication, or programming." },
  { q: "Who is this for?", a: "Any student at the University of Göttingen — any degree, any year, any background." },
  { q: "Do I have to attend everything?", a: "No. Pick the parts that interest you. Materials will be on Stud.IP / eCampus afterwards." },
  { q: "What is the 48-hour challenge?", a: "A short collaborative game-jam at the end. Teams ship a small playable game, with mentor checkpoints and a public showcase." },
  { q: "When does it run?", a: "Coming June 2026. Sign up for the early-interest list to get the schedule first." },
];

// ============= REVEAL HOOK =============
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

// ============= GLOBAL INPUT (shared between gamepad + minigame) =============
const gameInput = { left: false, right: false, up: false, down: false, jump: false, action: false };
const inputListeners = new Set();
function setInput(key, val) {
  if (gameInput[key] === val) return;
  gameInput[key] = val;
  inputListeners.forEach((cb) => cb(key, val));
}

// ============= NAV =============
function Nav() {
  return (
    <nav className="nav">
      <div className="shell nav-inner">
        <a href="#top" className="logo">
          <span className="logo-mark">G</span>
          <span>GAME STUDIO</span>
        </a>
        <div className="nav-links">
          <a href="#about">about</a>
          <a href="#workshops">workshops</a>
          <a href="#jam">game jam</a>
          <a href="#people">people</a>
          <a href="#apply">apply</a>
        </div>
        <a className="nav-cta" href="#apply">
          APPLY <span>→</span>
        </a>
      </div>
    </nav>
  );
}

// ============= GAMEPAD =============
function Gamepad({ variant = "inline" }) {
  const wrapRef = useRef(null);
  const [pressed, setPressed] = useState({});
  const [stick, setStick] = useState({ x: 0, y: 0 });
  const [dpad, setDpad] = useState({ up: false, down: false, left: false, right: false });
  const [isFloating, setIsFloating] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Resize listener to activate gamepad overlay on mobile for the floating variant
  useEffect(() => {
    const handleCheck = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      if (variant === 'floating') {
        setIsFloating(mobile);
      } else {
        setIsFloating(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleCheck);
    handleCheck();
    return () => {
      window.removeEventListener('resize', handleCheck);
    };
  }, [variant]);

  // mouse-tracked sticks
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / r.width;
      const dy = (e.clientY - cy) / r.height;
      const max = 0.18;
      setStick({
        x: Math.max(-max, Math.min(max, dx)) / max,
        y: Math.max(-max, Math.min(max, dy)) / max,
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // keyboard → both visual press + game input
  useEffect(() => {
    const visual = {
      'KeyW': 'b1', 'KeyS': 'b3', 'KeyA': 'b4', 'KeyD': 'b2',
      'Space': 'b1', 'Enter': 'b2',
    };
    const onDown = (e) => {
      // game input
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') setInput('left', true);
      if (e.code === 'ArrowRight' || e.code === 'KeyD') setInput('right', true);
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') setInput('jump', true);
      if (e.code === 'ArrowDown' || e.code === 'KeyS') setInput('down', true);
      // visual feedback
      if (e.code === 'ArrowUp') setDpad((d) => ({ ...d, up: true }));
      if (e.code === 'ArrowDown') setDpad((d) => ({ ...d, down: true }));
      if (e.code === 'ArrowLeft') setDpad((d) => ({ ...d, left: true }));
      if (e.code === 'ArrowRight') setDpad((d) => ({ ...d, right: true }));
      const id = visual[e.code];
      if (id) setPressed((p) => ({ ...p, [id]: true }));
    };
    const onUp = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') setInput('left', false);
      if (e.code === 'ArrowRight' || e.code === 'KeyD') setInput('right', false);
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') setInput('jump', false);
      if (e.code === 'ArrowDown' || e.code === 'KeyS') setInput('down', false);
      if (e.code === 'ArrowUp') setDpad((d) => ({ ...d, up: false }));
      if (e.code === 'ArrowDown') setDpad((d) => ({ ...d, down: false }));
      if (e.code === 'ArrowLeft') setDpad((d) => ({ ...d, left: false }));
      if (e.code === 'ArrowRight') setDpad((d) => ({ ...d, right: false }));
      const id = visual[e.code];
      if (id) setPressed((p) => ({ ...p, [id]: false }));
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  // controller button press handlers (also drive game input)
  const press = (id, on) => {
    setPressed((p) => ({ ...p, [id]: on }));
    if (id === 'b1') setInput('jump', on);
    if (id === 'b2') setInput('right', on);
    if (id === 'b3') setInput('down', on);
    if (id === 'b4') setInput('left', on);
  };
  const dpadPress = (dir, on) => {
    setDpad((d) => ({ ...d, [dir]: on }));
    if (dir === 'up') setInput('jump', on);
    if (dir === 'down') setInput('down', on);
    if (dir === 'left') setInput('left', on);
    if (dir === 'right') setInput('right', on);
  };

  const knobStyle = () => ({
    transform: `translate(${stick.x * 22}%, ${stick.y * 22}%)`,
  });

  const btnHandlers = (id) => ({
    onMouseDown: () => press(id, true),
    onMouseUp: () => press(id, false),
    onMouseLeave: () => press(id, false),
    onTouchStart: (e) => { e.preventDefault(); press(id, true); },
    onTouchEnd: (e) => { e.preventDefault(); press(id, false); },
  });
  const dpadHandlers = (dir) => ({
    onMouseDown: () => dpadPress(dir, true),
    onMouseUp: () => dpadPress(dir, false),
    onMouseLeave: () => dpadPress(dir, false),
    onTouchStart: (e) => { e.preventDefault(); dpadPress(dir, true); },
    onTouchEnd: (e) => { e.preventDefault(); dpadPress(dir, false); },
  });

  const dpadAny = dpad.up || dpad.down || dpad.left || dpad.right;

  const wrapClass = [
    "gamepad-wrap",
    isFloating ? "floating-mobile" : "",
    mobileOpen ? "mobile-open" : ""
  ].filter(Boolean).join(" ");

  if (variant === 'floating' && !isMobile) return null;

  return (
    <>
      <div className={wrapClass} ref={wrapRef}>
        <div className="gamepad">
          {isFloating && (
            <button 
              className="gp-mobile-close" 
              onClick={() => setMobileOpen(false)}
              aria-label="Close controls"
            >
              ✕
            </button>
          )}
          <div className="gp-shoulder l"><span>LB</span></div>
          <div className="gp-shoulder r"><span>RB</span></div>
          <div className="gp-trigger l" />
          <div className="gp-trigger r" />
          <div className="gp-grip l" />
          <div className="gp-grip r" />
          <div className="gp-body">
            <div className="gp-gloss" />
            <div className="gp-screen">
              <div className="gp-screen-inner">
                <span className="gp-screen-pixel" />
                <span className="gp-screen-pixel" />
                <span className="gp-screen-pixel" />
              </div>
            </div>
          </div>

          <div className={`gp-dpad ${dpadAny ? 'active' : ''}`}>
            <div className={`gp-dpad-arm v ${dpad.up ? 'pressed' : ''}`} {...dpadHandlers('up')} />
            <div className={`gp-dpad-arm v down ${dpad.down ? 'pressed' : ''}`} {...dpadHandlers('down')} />
            <div className={`gp-dpad-arm h ${dpad.left ? 'pressed' : ''}`} {...dpadHandlers('left')} />
            <div className={`gp-dpad-arm h right ${dpad.right ? 'pressed' : ''}`} {...dpadHandlers('right')} />
            <div className="gp-dpad-center" />
          </div>

          <div className="gp-center" />

          <div className="gp-face">
            <div className={`gp-btn b1 ${pressed.b1 ? 'pressed' : ''}`} {...btnHandlers('b1')}><span>W</span></div>
            <div className={`gp-btn b2 ${pressed.b2 ? 'pressed' : ''}`} {...btnHandlers('b2')}><span>D</span></div>
            <div className={`gp-btn b3 ${pressed.b3 ? 'pressed' : ''}`} {...btnHandlers('b3')}><span>S</span></div>
            <div className={`gp-btn b4 ${pressed.b4 ? 'pressed' : ''}`} {...btnHandlers('b4')}><span>A</span></div>
          </div>

          <div className="gp-stick l">
            <div className="gp-stick-knob" style={knobStyle()} />
          </div>
          <div className="gp-stick r">
            <div className="gp-stick-knob" style={knobStyle()} />
          </div>
        </div>
      </div>

      {isFloating && (
        <button 
          className={`gp-mobile-fab ${mobileOpen ? 'active' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle gamepad controls"
        >
          <span className="fab-icon">🎮</span>
          <span className="fab-text">{mobileOpen ? "HIDE CONTROLS" : "CONTROLS"}</span>
        </button>
      )}
    </>
  );
}

// ============= MINIGAME (platformer overlay) =============
function MiniGame() {
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState({ x: 200, y: 0, facing: 1, moving: false, onGround: false });
  const ref = useRef({
    x: 200, y: 100, vx: 0, vy: 0,
    onGround: false, facing: 1,
    // jump state
    jumpConsumed: true,       // true = jump key was already handled, prevents hold-repeat
    coyoteTimer: 0,           // frames left where jump is still allowed after walking off edge
    jumpBuffer: 0,            // frames left where a pre-landing jump press is remembered
  });
  const platformsRef = useRef([]);
  const tickerRef = useRef(null);
  const playingRef = useRef(false);

  // keep ref in sync so the keydown handler can check it
  useEffect(() => { playingRef.current = playing; }, [playing]);

  // listen for the secret key / button
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'KeyP' || e.code === 'KeyG') setPlaying((p) => !p);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // prevent page scroll for game keys while playing
  useEffect(() => {
    if (!playing) return;
    const GAME_KEYS = new Set([
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD',
    ]);
    const prevent = (e) => {
      if (playingRef.current && GAME_KEYS.has(e.code)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', prevent, { passive: false });
    return () => window.removeEventListener('keydown', prevent);
  }, [playing]);

  // track jump-press edge (consumed flag resets when key is released)
  useEffect(() => {
    const onInput = (key, val) => {
      if (key === 'jump') {
        if (val) {
          // key just pressed — allow a new jump
          ref.current.jumpConsumed = false;
          ref.current.jumpBuffer = 8; // buffer for ~8 frames
        } else {
          ref.current.jumpConsumed = true;
        }
      }
    };
    inputListeners.add(onInput);
    return () => inputListeners.delete(onInput);
  }, []);

  // gather platforms once playing starts; refresh on resize/scroll occasionally
  useEffect(() => {
    if (!playing) return;
    const collect = () => {
      const sel = '[data-platform], .play-toggle, .tape, .btn, .tag, .stat, .workshop-num, .cd-cell, .sp-card, .nav-cta, .cta-big, .jam-prize, .section-title, .gp-hint, .footer-bot, .partner-logo, .nav, .eyebrow, .hero-title, .hero-sub, .hero-tags, .kicker, .workshop-title, .workshop-output, .faq-q, .prize-stamp, .prize-kicker, .ticket, .countdown, .jam-eyebrow, .jam-title, .apply-title, .apply-frame-bar, .apply-meta-row, .footer-col h5, .logo, .float-badge, .tab, .speaker-avatar, .play-banner';
      const nodes = document.querySelectorAll(sel);
      const list = [];
      nodes.forEach((n) => {
        const r = n.getBoundingClientRect();
        if (r.width < 24 || r.height < 6) return;
        list.push({
          x: r.left + window.scrollX,
          y: r.top + window.scrollY,
          w: r.width,
          h: r.height,
        });
      });
      // ground = bottom of document
      list.push({
        x: 0,
        y: document.documentElement.scrollHeight - 4,
        w: document.documentElement.scrollWidth,
        h: 4,
      });
      platformsRef.current = list;
    };
    collect();
    const onResize = () => collect();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', collect, { passive: true });
    const reCollect = setInterval(collect, 600);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', collect);
      clearInterval(reCollect);
    };
  }, [playing]);

  // physics loop
  useEffect(() => {
    if (!playing) return;
    // spawn on top of the PLAY button
    const playBtn = document.querySelector('.play-toggle');
    let spawnX = window.scrollX + window.innerWidth / 2 - 12;
    let spawnY = window.scrollY + 80;
    if (playBtn) {
      const r = playBtn.getBoundingClientRect();
      spawnX = r.left + window.scrollX + r.width / 2 - 13;
      spawnY = r.top + window.scrollY - 32;
    }
    ref.current = {
      ...ref.current,
      x: spawnX,
      y: spawnY,
      vx: 0, vy: 0, onGround: false, facing: 1,
      jumpConsumed: true, coyoteTimer: 0, jumpBuffer: 0,
    };
    let last = performance.now();
    const W = 26, H = 28;
    const GRAVITY = 1800;
    const ACCEL = 2400;       // how fast the player accelerates
    const MAX_SPEED = 340;    // top run speed
    const FRICTION = 1800;    // deceleration when no input
    const JUMP = 1050;
    const COYOTE_FRAMES = 6;  // forgiveness frames after leaving edge

    const step = (t) => {
      const dt = Math.min(0.033, (t - last) / 1000);
      last = t;
      const s = ref.current;

      // ─── horizontal movement (acceleration-based) ───
      let inputDir = 0;
      if (gameInput.left) inputDir -= 1;
      if (gameInput.right) inputDir += 1;

      if (inputDir !== 0) {
        // accelerate towards input direction
        s.vx += inputDir * ACCEL * dt;
        // clamp to max speed
        if (s.vx > MAX_SPEED) s.vx = MAX_SPEED;
        if (s.vx < -MAX_SPEED) s.vx = -MAX_SPEED;
        s.facing = inputDir;
      } else {
        // decelerate via friction
        const sign = Math.sign(s.vx);
        if (sign !== 0) {
          s.vx -= sign * FRICTION * dt;
          // stop if we cross zero
          if (Math.sign(s.vx) !== sign) s.vx = 0;
        }
      }

      // ─── coyote time & jump buffer ───
      if (s.onGround) {
        s.coyoteTimer = COYOTE_FRAMES;
      } else {
        if (s.coyoteTimer > 0) s.coyoteTimer--;
      }
      if (s.jumpBuffer > 0) s.jumpBuffer--;

      // ─── jump ───
      const canJump = s.coyoteTimer > 0;
      const wantsJump = (gameInput.jump && !s.jumpConsumed) || s.jumpBuffer > 0;
      if (wantsJump && canJump) {
        s.vy = -JUMP;
        s.onGround = false;
        s.jumpConsumed = true;
        s.coyoteTimer = 0;
        s.jumpBuffer = 0;
      }

      // variable jump height: cut velocity when key released mid-jump
      if (!gameInput.jump && s.vy < -JUMP * 0.4) {
        s.vy = -JUMP * 0.4;
      }

      // ─── gravity ───
      s.vy += GRAVITY * dt;
      if (s.vy > 1200) s.vy = 1200;

      // ─── candidate move ───
      const nextX = s.x + s.vx * dt;
      let nextY = s.y + s.vy * dt;

      // ─── platform collision (top only, one-way) ───
      let onGround = false;
      const feetPrev = s.y + H;
      const feetNext = nextY + H;
      const cx1 = nextX + 4;
      const cx2 = nextX + W - 4;
      for (const p of platformsRef.current) {
        if (cx2 < p.x || cx1 > p.x + p.w) continue;
        const top = p.y;
        // increased tolerance (8px) so fast falls don't tunnel through
        if (s.vy >= 0 && feetPrev <= top + 8 && feetNext >= top) {
          nextY = top - H;
          s.vy = 0;
          onGround = true;
          break;
        }
      }
      s.onGround = onGround;
      s.x = nextX;
      s.y = nextY;

      // wrap horizontally across viewport (exit one side, enter the other)
      const vpLeft = window.scrollX;
      const vpRight = window.scrollX + window.innerWidth;
      if (s.x + W < vpLeft) s.x = vpRight;
      if (s.x > vpRight) s.x = vpLeft - W + 2;

      // invisible ceiling at top of page
      if (s.y < 0) {
        s.y = 0;
        if (s.vy < 0) s.vy = 0;
      }

      // invisible floor at bottom of page
      const docBottom = document.documentElement.scrollHeight - H;
      if (s.y > docBottom) {
        s.y = docBottom;
        s.vy = 0;
        s.onGround = true;
      }

      setPos({
        x: s.x, y: s.y, facing: s.facing,
        moving: Math.abs(s.vx) > 20,
        onGround: s.onGround,
      });
      tickerRef.current = requestAnimationFrame(step);
    };
    tickerRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(tickerRef.current);
  }, [playing]);

  const isRunning = pos.moving && pos.onGround;
  const [stars, setStars] = useState([]);
  const [showBubble, setShowBubble] = useState(false);

  // dismiss bubble on first movement input
  useEffect(() => {
    if (!showBubble) return;
    const dismiss = (key) => {
      if (key === 'left' || key === 'right' || key === 'jump') {
        setShowBubble(false);
      }
    };
    inputListeners.add(dismiss);
    return () => inputListeners.delete(dismiss);
  }, [showBubble]);

  // spawn star particles when play starts
  const spawnStars = useCallback(() => {
    const playBtn = document.querySelector('.play-toggle');
    if (!playBtn) return;
    const r = playBtn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const newStars = Array.from({ length: 12 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.5;
      const speed = 60 + Math.random() * 100;
      const size = 6 + Math.random() * 10;
      return {
        id: Date.now() + i,
        x: cx, y: cy,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed - 40,
        size,
        hue: [340, 50, 180, 280][i % 4],
      };
    });
    setStars(newStars);
    setTimeout(() => setStars([]), 800);
  }, []);

  return (
    <>
      <button
        className="play-toggle"
        onClick={() => {
          setPlaying((p) => {
            if (!p) {
              setTimeout(spawnStars, 10);
              setShowBubble(true);
            } else {
              setShowBubble(false);
            }
            return !p;
          });
        }}
        title="Toggle minigame (P)"
      >
        {playing ? '■ STOP' : '▶ PLAY'}
      </button>
      {stars.map((s) => (
        <span
          key={s.id}
          className="play-star-particle"
          style={{
            left: s.x + 'px',
            top: s.y + 'px',
            '--dx': s.dx + 'px',
            '--dy': s.dy + 'px',
            '--size': s.size + 'px',
            '--hue': s.hue,
          }}
        >★</span>
      ))}
      {playing && (
        <>
          <div
            className={`player${isRunning ? ' running' : ''}${!pos.onGround ? ' airborne' : ''}`}
            style={{
              left: pos.x + 'px',
              top: pos.y + 'px',
              transform: `scaleX(${pos.facing})`,
            }}
          >
            {showBubble && (
              <div className="player-bubble">Hi, I'm Bibidy!</div>
            )}
            <div className="player-body">
              <div className="player-eye l" />
              <div className="player-eye r" />
              <div className="player-mouth" />
            </div>
            <div className="player-legs">
              <div /><div />
            </div>
          </div>
          <div className="play-banner">
            ♛ PLAY MODE · ←/→ to move · ↑/SPACE to jump · jump on the buttons!
          </div>
        </>
      )}
    </>
  );
}

// ============= HERO =============
function Hero({ layout }) {
  return (
    <section className="hero" id="top">
      <div className="hero-bg" />
      <div className="shell hero-grid">
        <div className="hero-copy reveal">
          <span className="kicker"><span className="dot" /> JUNE 2026 · GÖTTINGEN</span>
          <h1 className="hero-title">
            <span aria-hidden="true" className="echo echo-2"><span className="hero-title-top">GÖTTINGEN</span>GAME STUDIO</span>
            <span aria-hidden="true" className="echo"><span className="hero-title-top">GÖTTINGEN</span>GAME STUDIO</span>
            <span className="hero-title-top">GÖTTINGEN</span>
            GAME STUDIO
          </h1>
          <p className="hero-sub">
            Workshops. Industry talks. A 48-hour game jam.<br/>
            Open to <em>every</em> Göttingen student — no experience required.
          </p>
          <div className="hero-tags">
            <span className="tag pink">WORKSHOPS</span>
            <span className="tag cyan">GUEST SPEAKERS</span>
            <span className="tag purple">GAME JAMS</span>
            <span className="tag outline">BEGINNER-FRIENDLY</span>
          </div>
          <div className="hero-meta">
            <span className="tape">★ JUNE 27, 2026</span>
            <div className="cta-row">
              <a href="#apply" className="btn btn-primary" data-platform="1">APPLY NOW <span>→</span></a>
              <a href="#workshops" className="btn btn-ghost">WHAT'S INSIDE</a>
            </div>
          </div>
        </div>
        {layout !== 'stack' && (
          <div className="hero-art reveal">
            <span className="float-badge fb-1">Workshops · Speakers</span>
            <span className="float-badge fb-2">Game Jams</span>
            <Gamepad />
            <div className="cube c1" />
            <div className="cube c2" />
            <div className="cube c3" />
            <div className="cube c4" />
            <div className="cube c5" />
            <div className="cube c6" />
            <div className="gp-hint">
              <kbd>WASD</kbd> · <kbd>↑↓←→</kbd> · click buttons
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ============= ABOUT =============
function About() {
  return (
    <section className="section dark" id="about">
      <div className="shell about-grid">
        <div className="about-copy reveal">
          <span className="eyebrow"><span className="bar"/> ABOUT</span>
          <h2 className="section-title">Your launchpad into the games industry.</h2>
          <p style={{ fontSize: '17px', lineHeight: 1.6, color: 'var(--ink)', maxWidth: '50ch' }}>
            An open, interdisciplinary space at Uni Göttingen where students learn, connect, and ship a game together.
          </p>
        </div>
        <div className="stats reveal">
          <div className="stat">
            <div className="stat-num">★</div>
            <div>
              <div className="stat-label">Open to all</div>
              <div className="stat-sub">Any degree. Any year.</div>
            </div>
          </div>
          <div className="stat">
            <div className="stat-num">01</div>
            <div>
              <div className="stat-label">Beginner-friendly</div>
              <div className="stat-sub">Zero coding required.</div>
            </div>
          </div>
          <div className="stat">
            <div className="stat-num">48</div>
            <div>
              <div className="stat-label">Game jam</div>
              <div className="stat-sub">Idea → playable build.</div>
            </div>
          </div>
          <div className="stat highlight">
            <div className="stat-num">★</div>
            <div>
              <div className="stat-label">Win Gamescom tickets</div>
              <div className="stat-sub">Top team scores the prize.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============= WORKSHOPS =============
function Workshops() {
  const [tab, setTab] = useState(0);
  const w = WORKSHOPS[tab];
  return (
    <section className="section tinted" id="workshops">
      <div className="shell">
        <div className="reveal">
          <span className="eyebrow"><span className="bar"/> WORKSHOPS</span>
          <h2 className="section-title">Three workshops. Real industry input.</h2>
        </div>
        <div className="workshops-tabs reveal">
          {WORKSHOPS.map((ws, i) => (
            <button
              key={ws.num}
              className={`tab ${tab === i ? 'active' : ''}`}
              onClick={() => setTab(i)}
            >
              W{ws.num}
            </button>
          ))}
        </div>
        <div className="workshop-body">
          <div className="workshop-pane" key={'l' + tab}>
            <div className="workshop-num">W{w.num}</div>
            <h3 className="workshop-title">{w.title}</h3>
            <p className="workshop-desc">{w.desc}</p>
            <span className="workshop-output">↳ {w.output}</span>
          </div>
          <div className="workshop-pane-right" key={'r' + tab}>
            <div className="ws-section-meta">
              <h4>🎯 MAIN GOALS</h4>
              <ul className="ws-goals-list">
                {w.goals.map((g, i) => (
                  <li key={i}><span className="ws-bullet">✦</span> {g}</li>
                ))}
              </ul>
            </div>
            <div className="ws-section-meta" style={{ marginTop: '20px' }}>
              <h4>📋 CONTENT & TODO</h4>
              <ul className="ws-todo-list">
                {w.todo.map((t, i) => (
                  <li key={i}><span className="ws-checkbox">☐</span> {t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============= JAM =============
function Jam() {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const target = new Date('2026-06-27T09:00:00').getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime({ d, h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="jam" id="jam">
      <div className="shell jam-inner">
        <div className="reveal">
          <span className="jam-eyebrow">⚡ FINAL CHALLENGE</span>
          <h2 className="jam-title">48H.<br/>ONE GAME.<br/>ANY ROLE.</h2>
          <p className="jam-desc">
            Pitch. Build. Showcase. Mentors on standby.
          </p>
        </div>
        <div className="reveal">
          <div style={{ fontFamily: 'var(--pixel)', fontSize: '10px', color: '#0b0210', marginBottom: '14px', letterSpacing: '1px' }}>
            // T-MINUS UNTIL JUNE 27, 2026
          </div>
          <div className="countdown">
            <div className="cd-cell"><div className="cd-num">{String(time.d).padStart(3, '0')}</div><div className="cd-label">days</div></div>
            <div className="cd-cell"><div className="cd-num">{String(time.h).padStart(2, '0')}</div><div className="cd-label">hours</div></div>
            <div className="cd-cell"><div className="cd-num">{String(time.m).padStart(2, '0')}</div><div className="cd-label">min</div></div>
            <div className="cd-cell"><div className="cd-num">{String(time.s).padStart(2, '0')}</div><div className="cd-label">sec</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============= PRIZE BLOCK (souped-up) =============
function Prize() {
  return (
    <section className="prize-section" id="prize">
      <div className="prize-stars">
        {Array.from({ length: 28 }).map((_, i) => (
          <span key={i} className={`prize-star s${i % 5}`} style={{
            left: ((i * 137) % 100) + '%',
            top: ((i * 89) % 100) + '%',
            animationDelay: (i * 0.13) + 's',
          }}>★</span>
        ))}
      </div>
      <div className="shell prize-inner">
        <div className="prize-copy reveal">
          <span className="prize-kicker">★ GRAND PRIZE</span>
          <h2 className="prize-title">
            WIN<br/>
            <span className="prize-title-big">GAMESCOM</span><br/>
            TICKETS
          </h2>
          <p className="prize-sub">
            The winning team of the 48h Game Jam takes home day tickets to <strong>Gamescom</strong> — Europe's biggest games festival.
          </p>
          <div className="prize-stamps">
            <span className="prize-stamp">★ COLOGNE</span>
            <span className="prize-stamp">★ THOUSANDS OF DEVS</span>
            <span className="prize-stamp">★ ONE WEEKEND</span>
          </div>
        </div>

        <div className="ticket-stack reveal">
          <div className="ticket t1">
            <div className="ticket-stub">
              <div className="ticket-stub-text">ADMIT<br/>ONE</div>
            </div>
            <div className="ticket-body">
              <div className="ticket-row">
                <span className="ticket-label">EVENT</span>
                <span className="ticket-val">GAMESCOM</span>
              </div>
              <div className="ticket-row">
                <span className="ticket-label">CITY</span>
                <span className="ticket-val">COLOGNE · DE</span>
              </div>
              <div className="ticket-row">
                <span className="ticket-label">TYPE</span>
                <span className="ticket-val">DAY PASS</span>
              </div>
              <div className="ticket-foot">
                <div className="ticket-barcode">
                  {Array.from({ length: 22 }).map((_, i) => <span key={i} style={{ width: (i % 3 === 0 ? 3 : 1) + 'px' }} />)}
                </div>
                <div className="ticket-no">#GG-2026</div>
              </div>
            </div>
          </div>
          <div className="ticket t2" />
          <div className="ticket t3" />
          <div className="prize-burst">★</div>
        </div>
      </div>
    </section>
  );
}

// ============= PEOPLE (TEAM + SPEAKERS) =============
function People() {
  const confirmed = SPEAKERS.filter(s => s.confirmed);
  const tbd = SPEAKERS.filter(s => !s.confirmed);

  // Generate initials from name for avatar
  const getInitials = (name) => {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  // Accent colors for team member avatars
  const teamColors = [
    'linear-gradient(135deg, var(--magenta), var(--purple))',
    'linear-gradient(135deg, var(--purple), var(--cyan))',
    'linear-gradient(135deg, var(--cyan), #4ade80)',
    'linear-gradient(135deg, #4ade80, var(--yellow))',
    'linear-gradient(135deg, var(--yellow), var(--magenta))',
    'linear-gradient(135deg, var(--magenta-2), var(--purple))',
    'linear-gradient(135deg, var(--cyan), var(--magenta))',
  ];

  return (
    <section className="section dark" id="people">
      <div className="shell">

        {/* ── THE TEAM ── */}
        <div className="reveal">
          <span className="eyebrow"><span className="bar"/> OUR TEAM</span>
          <h2 className="section-title">The people behind the studio.</h2>
        </div>

        <div className="team-photo-wrap reveal">
          <img src="speakers/team.jpeg" alt="Göttingen Game Studio team" className="team-photo" loading="lazy" />
          <div className="team-photo-caption">
            <span className="tape" style={{ transform: 'rotate(-1.5deg)', fontSize: '10px', padding: '10px 14px' }}>★ TEAM GÖTTINGEN</span>
          </div>
        </div>

        <div className="team-grid reveal">
          {TEAM_MEMBERS.map((m, i) => (
            <div className="team-card" key={i}>
              <div className="team-avatar" style={{ background: teamColors[i % teamColors.length] }}>
                {getInitials(m.name)}
              </div>
              <div className="team-info">
                <div className="team-name">{m.name}</div>
                <div className="team-role">{m.role}</div>
                {m.desc && <div className="team-desc">{m.desc}</div>}
              </div>
              <span className="team-area-pill">{m.area}</span>
            </div>
          ))}
        </div>

        {/* ── GUEST SPEAKERS ── */}
        <div className="reveal" style={{ marginTop: '80px' }}>
          <span className="eyebrow"><span className="bar"/> GUEST SPEAKERS</span>
          <h2 className="section-title">Industry voices. Real experience.</h2>
        </div>

        <div className="speakers-featured reveal">
          {confirmed.map((s, i) => (
            <div className="sp-featured-card" key={i}>
              <div className="sp-featured-photo">
                <img src={s.photo} alt={s.name} loading="lazy" />
              </div>
              <div className="sp-featured-info">
                <div className="sp-featured-header">
                  <h3 className="sp-featured-name">{s.name}</h3>
                  <span className="sp-pill">W{s.w}</span>
                </div>
                <div className="sp-featured-role">{s.role}</div>
                <div className="sp-featured-company">{s.company}</div>
                <p className="sp-featured-bio">{s.bio}</p>
                {s.linkedin && (
                  <a href={s.linkedin} target="_blank" rel="noopener" className="sp-linkedin">
                    LinkedIn →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {tbd.length > 0 && (
          <div className="reveal" style={{ marginTop: '40px' }}>
            <span className="tentative">// MORE SPEAKERS DROPPING SOON</span>
            <div className="speakers" style={{ marginTop: '20px' }}>
              {tbd.map((s, i) => (
                <div className="sp-card" key={i}>
                  <div className="sp-portrait">?</div>
                  <div className="sp-name">TBD</div>
                  <div className="sp-title">{s.role}</div>
                  <span className="sp-pill">W{s.w}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ============= FAQ =============
function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section tinted" id="faq">
      <div className="shell faq-wrap">
        <div className="reveal">
          <span className="eyebrow"><span className="bar"/> FAQ</span>
          <h2 className="section-title">Quick answers.</h2>
        </div>
        <div className="faq-list reveal">
          {FAQS.map((f, i) => (
            <div className={`faq-item ${open === i ? 'open' : ''}`} key={f.q}>
              <button
                className="faq-q"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? -1 : i)}
              >
                <span>{f.q}</span>
                <span className="faq-icon">+</span>
              </button>
              <div className="faq-a"><div><p>{f.a}</p></div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============= APPLY (embedded form) =============
const FORM_EMBED = "https://docs.google.com/forms/d/e/1FAIpQLSc__placeholder/viewform?embedded=true";
const FORM_FALLBACK = "https://docs.google.com/forms/d/1pg0hfMb_7El4XgUT0VIyz4cAkuwMSN0mdFADnkpSD-Y/viewform";

function Apply({ formUrl }) {
  return (
    <section className="apply-section" id="apply">
      <div className="apply-glow" />
      <div className="shell apply-grid">
        <div className="reveal">
          <span className="eyebrow"><span className="bar"/> SIGN UP</span>
          <h2 className="apply-title">
            READY <span className="blink">PLAYER</span>?
          </h2>
          <p className="apply-sub">
            Drop your details. We'll send dates, venues and the schedule first.
          </p>
          <div className="apply-meta">
            <div className="apply-meta-row">
              <span className="apply-meta-label">★</span>
              <span>Free for all Uni Göttingen students</span>
            </div>
            <div className="apply-meta-row">
              <span className="apply-meta-label">⌘</span>
              <span>30 seconds to fill</span>
            </div>
            <div className="apply-meta-row">
              <span className="apply-meta-label">▶</span>
              <span>You'll be the first to know</span>
            </div>
          </div>
          <a href={formUrl} target="_blank" rel="noopener" className="apply-fallback">
            ↗ open form in a new tab
          </a>
        </div>

        <div className="apply-frame reveal">
          <div className="apply-frame-bar">
            <span className="apply-frame-dot d1" />
            <span className="apply-frame-dot d2" />
            <span className="apply-frame-dot d3" />
            <span className="apply-frame-title">REGISTRATION.exe</span>
          </div>
          <div className="apply-frame-screen">
            <iframe
              src={formUrl + (formUrl.includes('?') ? '&' : '?') + 'embedded=true'}
              title="Göttingen Game Studio registration form"
              className="apply-iframe"
              loading="lazy"
            >
              Loading…
            </iframe>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============= FOOTER =============
function Imprint() {
  return (
    <section className="imprint-section" id="imprint">
      <div className="shell imprint-grid">
        <div>
          <span className="eyebrow"><span className="bar"/> IMPRINT</span>
          <h2 className="section-title">Provider information.</h2>
        </div>
        <div className="imprint-panel">
          <h3>Information pursuant to Section 5 DDG</h3>
          <p>
            Nhu Trieu Minh Tran<br/>
            Geismar Landstraße 11<br/>
            37083 Göttingen<br/>
            Germany
          </p>
          <h3>Contact</h3>
          <p>
            Email: <a href="mailto:admin@goegame.de">admin@goegame.de</a>
          </p>
          <h3>Responsible for content</h3>
          <p>Nhu Trieu Minh Tran</p>
        </div>
      </div>
    </section>
  );
}

// ============= PRIVACY POLICY CONTENT (shared) =============
function PrivacyContent() {
  return (
    <>
      <h3>1. Verantwortlicher</h3>
      <p>
        Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br/>
        Nhu Trieu Minh Tran<br/>
        Geismar Landstraße 11<br/>
        37083 Göttingen<br/>
        Deutschland<br/>
        E-Mail: <a href="mailto:admin@goegame.de">admin@goegame.de</a>
      </p>

      <h3>2. Allgemeine Hinweise</h3>
      <p>
        Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung dieser Website,
        zur Bearbeitung von Anfragen oder zur Organisation des Göttingen Game Studio erforderlich ist. Personenbezogene
        Daten sind alle Informationen, mit denen eine Person direkt oder indirekt identifiziert werden kann.
      </p>

      <h3>3. Hosting und Server-Logfiles</h3>
      <p>
        Diese Website wird bei Netlify gehostet. Beim Aufruf der Website können technisch notwendige
        Zugriffsdaten verarbeitet werden, insbesondere IP-Adresse, Datum und Uhrzeit des Zugriffs,
        aufgerufene Dateien, Referrer-URL, Browsertyp, Betriebssystem und ähnliche technische Daten.
        Die Verarbeitung erfolgt zur sicheren und stabilen Bereitstellung der Website auf Grundlage von
        Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt im sicheren Betrieb und in der
        Fehleranalyse dieser Website.
      </p>
      <p>
        Anbieter ist Netlify, Inc., 44 Montgomery Street, Suite 300, San Francisco, CA 94104, USA.
        Es kann zu einer Verarbeitung von Daten außerhalb der EU kommen. Netlify gibt an, geeignete
        Schutzmechanismen, insbesondere Standardvertragsklauseln, einzusetzen.
      </p>

      <h3>4. Anmeldung über Google Forms</h3>
      <p>
        Für die Anmeldung oder Interessensbekundung nutzen wir ein eingebettetes Google Formular.
        Wenn Sie das Formular öffnen oder absenden, werden die im Formular abgefragten Angaben sowie
        technische Zugriffsdaten an Google übermittelt und dort verarbeitet. Je nach Formular können
        dies insbesondere Name, E-Mail-Adresse, Studienbezug, organisatorische Angaben und freie
        Nachrichtentexte sein.
      </p>
      <p>
        Die Verarbeitung erfolgt zur Organisation, Planung und Durchführung des Göttingen Game Studio. Rechtsgrundlage
        ist Art. 6 Abs. 1 lit. b DSGVO, soweit die Verarbeitung zur Anmeldung oder Teilnahme erforderlich
        ist, sowie Art. 6 Abs. 1 lit. f DSGVO für die organisatorische Planung. Optional angegebene Daten
        verarbeiten wir auf Grundlage Ihrer Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO.
      </p>
      <p>
        Anbieter ist Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Google kann
        Daten auch in die USA und andere Drittländer übermitteln. Weitere Informationen finden Sie in
        der Datenschutzerklärung von Google: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">https://policies.google.com/privacy</a>.
      </p>

      <h3>5. Kontakt per E-Mail</h3>
      <p>
        Wenn Sie uns per E-Mail kontaktieren, verarbeiten wir Ihre E-Mail-Adresse, Ihre Nachricht und
        die damit verbundenen technischen Metadaten, um Ihre Anfrage zu beantworten. Rechtsgrundlage ist
        Art. 6 Abs. 1 lit. f DSGVO. Wenn Ihre Anfrage auf eine Anmeldung oder Teilnahme gerichtet ist,
        kann zusätzlich Art. 6 Abs. 1 lit. b DSGVO einschlägig sein.
      </p>

      <h3>6. Externe Schriftarten und Skripte</h3>
      <p>
        Diese Website lädt Schriftarten von Google Fonts sowie JavaScript-Bibliotheken über unpkg.com.
        Beim Laden dieser Ressourcen können technische Daten, insbesondere Ihre IP-Adresse und Browserdaten,
        an die jeweiligen Anbieter übermittelt werden. Die Einbindung erfolgt auf Grundlage von Art. 6
        Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt in einer stabilen, lesbaren und funktionsfähigen
        Darstellung der Website.
      </p>

      <h3>7. Cookies und Tracking</h3>
      <p>
        Wir setzen keine eigenen Analyse- oder Marketing-Cookies ein. Durch eingebettete Drittanbieter,
        insbesondere Google Forms, können jedoch Cookies oder ähnliche Technologien von Google gesetzt
        werden, sobald diese Inhalte geladen oder genutzt werden.
      </p>

      <h3>8. Speicherdauer</h3>
      <p>
        Wir speichern personenbezogene Daten nur so lange, wie dies für die genannten Zwecke erforderlich
        ist. Anmeldedaten werden grundsätzlich nach Abschluss der Veranstaltung und der notwendigen
        Nachbereitung gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten oder berechtigten Gründe
        für eine längere Speicherung bestehen.
      </p>

      <h3>9. Ihre Rechte</h3>
      <p>
        Sie haben nach Maßgabe der DSGVO das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung
        der Verarbeitung, Datenübertragbarkeit sowie Widerspruch gegen bestimmte Verarbeitungen. Soweit
        eine Verarbeitung auf Einwilligung beruht, können Sie diese Einwilligung jederzeit mit Wirkung
        für die Zukunft widerrufen.
      </p>
      <p>
        Sie haben außerdem das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren. Zuständig
        kann insbesondere die Landesbeauftragte für den Datenschutz Niedersachsen sein.
      </p>

      <h3>10. Änderungen</h3>
      <p>
        Wir können diese Datenschutzerklärung anpassen, wenn sich technische, organisatorische oder
        rechtliche Anforderungen ändern.
      </p>
    </>
  );
}

// ============= PRIVACY MODAL =============
function PrivacyModal({ open, onClose }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="privacy-overlay" onClick={onClose}>
      <div className="privacy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="privacy-modal-bar">
          <span className="privacy-modal-dot d1" />
          <span className="privacy-modal-dot d2" />
          <span className="privacy-modal-dot d3" />
          <span className="privacy-modal-title">DATENSCHUTZ.exe</span>
          <button className="privacy-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="privacy-modal-body">
          <div className="privacy-modal-header">
            <span className="eyebrow"><span className="bar"/> DATENSCHUTZ</span>
            <h2 className="privacy-modal-heading">Datenschutzerklärung</h2>
            <span className="privacy-modal-date">Stand: Mai 2026</span>
          </div>
          <div className="privacy-panel">
            <PrivacyContent />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============= COOKIE CONSENT BANNER =============
function CookieConsent({ onOpenPrivacy }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('gg_cookie_consent');
      if (consent === 'accepted' || consent === 'rejected') {
        setDismissed(true);
        return;
      }
    } catch (_) { /* localStorage unavailable */ }
    // slight delay so it slides in after page load
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    setVisible(false);
    try { localStorage.setItem('gg_cookie_consent', 'accepted'); } catch (_) {}
    setTimeout(() => setDismissed(true), 500);
  };

  const handleReject = () => {
    setVisible(false);
    try { localStorage.setItem('gg_cookie_consent', 'rejected'); } catch (_) {}
    setTimeout(() => setDismissed(true), 500);
  };

  if (dismissed) return null;

  return (
    <div className={`consent-banner ${visible ? 'consent-visible' : ''}`}>
      <div className="consent-inner">
        <div className="consent-icon">🛡️</div>
        <div className="consent-text">
          <strong>Datenschutz & Cookies</strong>
          <p>
            Diese Website verwendet keine eigenen Tracking-Cookies. Eingebettete Drittanbieter
            (Google Forms) können Cookies setzen.{' '}
            <button className="consent-link" onClick={onOpenPrivacy}>Datenschutzerklärung lesen →</button>
          </p>
        </div>
        <div className="consent-buttons">
          <button className="consent-reject" onClick={handleReject}>NUR NOTWENDIGE</button>
          <button className="consent-accept" onClick={handleAccept}>ALLE AKZEPTIEREN</button>
        </div>
      </div>
    </div>
  );
}

function Footer({ onOpenPrivacy }) {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#top" className="logo">
              <span className="logo-mark">G</span>
              <span>GAME STUDIO</span>
            </a>
            <p>
              A program by the University of Göttingen, supported by IMPACT! Studieren mit Wirkung.
            </p>
          </div>
          <div className="footer-col">
            <h5>EXPLORE</h5>
            <a href="#about">About</a>
            <a href="#workshops">Workshops</a>
            <a href="#jam">Game jam</a>
            <a href="#prize">Prize</a>
          </div>
          <div className="footer-col">
            <h5>PEOPLE</h5>
            <a href="#people">Team</a>
            <a href="#people">Speakers</a>
            <a href="#faq">FAQ</a>
            <a href="#apply">Apply</a>
          </div>
          <div className="footer-col">
            <h5>CONNECT</h5>
            <a href="#">Discord</a>
            <a href="#">Stud.IP</a>
            <a href="mailto:admin@goegame.de">Email</a>
          </div>
          <div className="footer-col">
            <h5>LEGAL</h5>
            <a href="#imprint">Imprint</a>
            <button className="footer-privacy-btn" onClick={onOpenPrivacy}>Datenschutz</button>
          </div>
        </div>
        <div className="footer-bot">
          <div>© 2026 Student Game Studio · Uni Göttingen</div>
          <div className="partners">
            <span className="partner-logo">[ Georg-August-Universität ]</span>
            <span className="partner-logo">[ IMPACT! ]</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============= APP =============
const FORM_URL = "https://docs.google.com/forms/d/1pg0hfMb_7El4XgUT0VIyz4cAkuwMSN0mdFADnkpSD-Y/viewform";

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "magenta",
  "scanlines": true,
  "heroLayout": "split"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const openPrivacy = useCallback(() => setPrivacyOpen(true), []);
  const closePrivacy = useCallback(() => setPrivacyOpen(false), []);
  useReveal();

  useEffect(() => {
    const cls = ['noise'];
    if (t.scanlines) cls.push('scanlines');
    document.body.className = cls.join(' ');
    if (t.theme === 'magenta') document.documentElement.className = '';
    if (t.theme === 'cyan') document.documentElement.className = 'theme-cyan';
    if (t.theme === 'retro') document.documentElement.className = 'theme-retro';
  }, [t]);

  return (
    <>
      <Nav />
      <Hero layout={t.heroLayout} />
      <About />
      <Workshops />
      <Jam />
      <Prize />
      <People />
      <FAQ />
      <Apply formUrl={FORM_URL} />
      <Imprint />
      <Footer onOpenPrivacy={openPrivacy} />
      <MiniGame />
      <Gamepad variant="floating" />
      <CookieConsent onOpenPrivacy={openPrivacy} />
      <PrivacyModal open={privacyOpen} onClose={closePrivacy} />
      <TweaksPanel title="Tweaks">
        <TweakSection title="Color theme">
          <TweakRadio
            value={t.theme}
            onChange={(v) => setTweak('theme', v)}
            options={[
              { value: 'magenta', label: 'Magenta' },
              { value: 'cyan', label: 'Cyber' },
              { value: 'retro', label: 'Retro' },
            ]}
          />
        </TweakSection>
        <TweakSection title="Hero layout">
          <TweakRadio
            value={t.heroLayout}
            onChange={(v) => setTweak('heroLayout', v)}
            options={[
              { value: 'split', label: 'Split' },
              { value: 'stack', label: 'Type only' },
            ]}
          />
        </TweakSection>
        <TweakSection title="Scanline overlay">
          <TweakToggle
            value={t.scanlines}
            onChange={(v) => setTweak('scanlines', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
