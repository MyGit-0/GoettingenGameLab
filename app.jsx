const { useState, useEffect, useRef, useCallback } = React;

// ============= DATA =============
const WORKSHOPS = [
  {
    num: "01",
    title: "Careers, Roles & Entry Paths",
    desc: "What studios actually look for. Roles, entry paths, portfolio types — straight from people who hire.",
    output: "Clearer next steps for your portfolio",
  },
  {
    num: "02",
    title: "Rapid Prototyping with Accessible Tools",
    desc: "Idea → playable thing, fast. Beginner-friendly tools, templates and AI-assisted workflows.",
    output: "Your first prototype",
  },
  {
    num: "03",
    title: "Building & Managing a Game Team",
    desc: "Coordination, communication, scope. Lightweight Kanban / Agile / Scrum for tiny indie teams.",
    output: "A team plan you can actually run",
  },
];

const SPEAKERS = [
  { initials: "TBD", role: "Senior Producer · careers, teams & production", w: "01" },
  { initials: "TBD", role: "HR Generalist · hiring & application flow", w: "01" },
  { initials: "TBD", role: "Senior Game Designer · rapid prototyping", w: "02" },
  { initials: "TBD", role: "Gameplay & Game-AI Programmer", w: "02" },
  { initials: "TBD", role: "Indie writer / dev · leading small teams", w: "03" },
  { initials: "TBD", role: "Producer · production, design, music", w: "03" },
];

const FAQS = [
  { q: "Do I need any coding experience?", a: "No. Game Lab is beginner-friendly. Contribute through writing, art, sound, design, production, communication, or programming." },
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
          <span>GAME LAB</span>
        </a>
        <div className="nav-links">
          <a href="#about">about</a>
          <a href="#workshops">workshops</a>
          <a href="#jam">game jam</a>
          <a href="#speakers">speakers</a>
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
function Gamepad() {
  const wrapRef = useRef(null);
  const [pressed, setPressed] = useState({});
  const [stick, setStick] = useState({ x: 0, y: 0 });
  const [dpad, setDpad] = useState({ up: false, down: false, left: false, right: false });

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

  return (
    <div className="gamepad-wrap" ref={wrapRef}>
      <div className="gamepad">
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
          <div className={`gp-btn b1 ${pressed.b1 ? 'pressed' : ''}`} {...btnHandlers('b1')}><span>A</span></div>
          <div className={`gp-btn b2 ${pressed.b2 ? 'pressed' : ''}`} {...btnHandlers('b2')}><span>B</span></div>
          <div className={`gp-btn b3 ${pressed.b3 ? 'pressed' : ''}`} {...btnHandlers('b3')}><span>X</span></div>
          <div className={`gp-btn b4 ${pressed.b4 ? 'pressed' : ''}`} {...btnHandlers('b4')}><span>Y</span></div>
        </div>

        <div className="gp-stick l">
          <div className="gp-stick-knob" style={knobStyle()} />
        </div>
        <div className="gp-stick r">
          <div className="gp-stick-knob" style={knobStyle()} />
        </div>
      </div>
    </div>
  );
}

// ============= MINIGAME (platformer overlay) =============
function MiniGame() {
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState({ x: 200, y: 0, facing: 1 });
  const ref = useRef({ x: 200, y: 100, vx: 0, vy: 0, onGround: false, facing: 1 });
  const platformsRef = useRef([]);
  const tickerRef = useRef(null);

  // listen for the secret key / button
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'KeyP' || e.code === 'KeyG') setPlaying((p) => !p);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // gather platforms once playing starts; refresh on resize/scroll occasionally
  useEffect(() => {
    if (!playing) return;
    const collect = () => {
      const sel = '[data-platform], .tape, .btn, .tag, .stat, .workshop-num, .cd-cell, .sp-card, .nav-cta, .cta-big, .jam-prize, .section-title, .gp-hint, .footer-bot, .partner-logo';
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
    const reCollect = setInterval(collect, 600);
    return () => {
      window.removeEventListener('resize', onResize);
      clearInterval(reCollect);
    };
  }, [playing]);

  // physics loop
  useEffect(() => {
    if (!playing) return;
    // initial spawn near center top of viewport
    ref.current = {
      x: window.scrollX + window.innerWidth / 2 - 12,
      y: window.scrollY + 80,
      vx: 0, vy: 0, onGround: false, facing: 1,
    };
    let last = performance.now();
    const W = 26, H = 28;
    const GRAVITY = 1800;
    const MOVE = 320;
    const JUMP = 640;
    const FRICTION = 1500;

    const step = (t) => {
      const dt = Math.min(0.033, (t - last) / 1000);
      last = t;
      const s = ref.current;

      // input
      let ax = 0;
      if (gameInput.left) ax -= MOVE;
      if (gameInput.right) ax += MOVE;
      s.vx = ax;
      if (ax > 0) s.facing = 1;
      if (ax < 0) s.facing = -1;
      if (ax === 0) {
        const sign = Math.sign(s.vx);
        s.vx -= sign * FRICTION * dt;
        if (Math.sign(s.vx) !== sign) s.vx = 0;
      }
      if (gameInput.jump && s.onGround) {
        s.vy = -JUMP;
        s.onGround = false;
      }
      // gravity
      s.vy += GRAVITY * dt;
      if (s.vy > 1200) s.vy = 1200;

      // candidate move
      const nextX = s.x + s.vx * dt;
      let nextY = s.y + s.vy * dt;

      // simple ground collision: snap when feet enter platform top from above
      let onGround = false;
      const feetPrev = s.y + H;
      const feetNext = nextY + H;
      const cx1 = nextX + 4;
      const cx2 = nextX + W - 4;
      for (const p of platformsRef.current) {
        if (cx2 < p.x || cx1 > p.x + p.w) continue;
        const top = p.y;
        if (s.vy >= 0 && feetPrev <= top + 4 && feetNext >= top) {
          nextY = top - H;
          s.vy = 0;
          onGround = true;
          break;
        }
      }
      s.onGround = onGround;
      s.x = nextX;
      s.y = nextY;

      // wrap horizontally if off-page
      const docW = document.documentElement.scrollWidth;
      if (s.x < -W) s.x = docW;
      if (s.x > docW) s.x = -W;

      // fall off → respawn
      if (s.y > document.documentElement.scrollHeight + 200) {
        s.x = window.scrollX + window.innerWidth / 2 - 12;
        s.y = window.scrollY + 80;
        s.vy = 0;
      }

      setPos({ x: s.x, y: s.y, facing: s.facing });
      tickerRef.current = requestAnimationFrame(step);
    };
    tickerRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(tickerRef.current);
  }, [playing]);

  return (
    <>
      <button
        className="play-toggle"
        onClick={() => setPlaying((p) => !p)}
        title="Toggle minigame (P)"
      >
        {playing ? '■ STOP' : '▶ PLAY'}
      </button>
      {playing && (
        <>
          <div
            className="player"
            style={{
              left: pos.x + 'px',
              top: pos.y + 'px',
              transform: `scaleX(${pos.facing})`,
            }}
          >
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
            <span aria-hidden="true" className="echo echo-2">GAME LAB</span>
            <span aria-hidden="true" className="echo">GAME LAB</span>
            GAME LAB
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
            <span className="tape">★ JUNE 2026</span>
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
          <div className="reveal" key={'l' + tab}>
            <div className="workshop-num">W{w.num}</div>
            <h3 className="workshop-title">{w.title}</h3>
            <p className="workshop-desc">{w.desc}</p>
            <span className="workshop-output">↳ {w.output}</span>
          </div>
          <div className="reveal" key={'r' + tab}>
            <span className="tentative">// GUEST SPEAKERS · TBD</span>
            <div className="speakers-mini">
              <div className="speaker-mini">
                <div className="speaker-avatar">?</div>
                <div>
                  <div className="speaker-name">TBD</div>
                  <div className="speaker-role">Industry guest · to be announced</div>
                </div>
              </div>
              <div className="speaker-mini">
                <div className="speaker-avatar">?</div>
                <div>
                  <div className="speaker-name">TBD</div>
                  <div className="speaker-role">Industry guest · to be announced</div>
                </div>
              </div>
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
    const target = new Date('2026-06-01T09:00:00').getTime();
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
            // T-MINUS UNTIL JUNE 2026
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

// ============= SPEAKERS GRID =============
function Speakers() {
  return (
    <section className="section dark" id="speakers">
      <div className="shell">
        <div className="reveal">
          <span className="eyebrow"><span className="bar"/> GUEST SPEAKERS</span>
          <h2 className="section-title">Lineup dropping soon.</h2>
          <span className="tentative">// LINEUP IN PROGRESS · ALL SPEAKERS TBD</span>
        </div>
        <div className="speakers reveal">
          {SPEAKERS.map((s, i) => (
            <div className="sp-card" key={i}>
              <div className="sp-portrait">?</div>
              <div className="sp-name">TBD</div>
              <div className="sp-title">{s.role}</div>
              <span className="sp-pill">W{s.w}</span>
            </div>
          ))}
        </div>
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
              title="Game Lab registration form"
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
function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#top" className="logo">
              <span className="logo-mark">G</span>
              <span>GAME LAB</span>
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
            <a href="#speakers">Speakers</a>
            <a href="#faq">FAQ</a>
            <a href="#apply">Apply</a>
          </div>
          <div className="footer-col">
            <h5>CONNECT</h5>
            <a href="#">Discord</a>
            <a href="#">Stud.IP</a>
            <a href="#">Email</a>
          </div>
        </div>
        <div className="footer-bot">
          <div>© 2026 Student Game Lab · Uni Göttingen</div>
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
      <Speakers />
      <FAQ />
      <Apply formUrl={FORM_URL} />
      <Footer />
      <MiniGame />
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
