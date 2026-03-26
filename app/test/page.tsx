import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TestPage() {
  const restaurant = await prisma.restaurant.findFirst({
    orderBy: { createdAt: "asc" },
  });

  const restaurantId = restaurant?.id ?? "";
  const restaurantName = restaurant?.name ?? "The Garden Bistro";
  const ts = Date.now();

  return (
    <>
      {/* Scoped styles — override root layout inside #lf-test */}
      <style>{`
        #lf-test, #lf-test * { box-sizing: border-box; }
        #lf-test { position:fixed; inset:0; overflow-y:auto; overflow-x:hidden;
          font-family:Georgia,'Times New Roman',serif; background:#faf7f2;
          color:#2a1f17; line-height:1.6; z-index:0; }

        #lf-test button { all:unset; cursor:pointer; }
        #lf-test a { color:inherit; text-decoration:none; }

        /* nav */
        #lf-test nav { position:sticky; top:0; z-index:100; background:#3d2b1f;
          color:#fff; display:flex; align-items:center; justify-content:space-between;
          padding:0 5%; height:64px; }
        #lf-test .nav-logo { font-size:1.4rem; font-style:italic; letter-spacing:.05em; color:#c9a84c; }
        #lf-test .nav-links { display:flex; gap:2rem; font-size:.85rem; letter-spacing:.1em; text-transform:uppercase; }
        #lf-test .nav-links a { color:rgba(255,255,255,.8); }
        #lf-test .nav-links a:hover { color:#c9a84c; }

        /* hero */
        #lf-test .hero { position:relative; height:92vh; min-height:500px; overflow:hidden;
          display:flex; align-items:center; justify-content:center; text-align:center; }
        #lf-test .hero-bg { position:absolute; inset:0;
          background:radial-gradient(ellipse at 60% 40%,rgba(122,158,126,.25) 0%,transparent 60%),
          linear-gradient(160deg,#1a1208 0%,#3d2b1f 50%,#2a3d2e 100%); }
        #lf-test .hero-content { position:relative; z-index:2; padding:0 1.5rem; }
        #lf-test .hero-eyebrow { font-size:.75rem; letter-spacing:.35em; text-transform:uppercase; color:#c9a84c; margin-bottom:1.2rem; }
        #lf-test .hero h1 { font-size:clamp(2.8rem,7vw,5.5rem); font-style:italic; color:#fff; line-height:1.05; margin-bottom:1.2rem; }
        #lf-test .hero h1 span { color:#c9a84c; }
        #lf-test .hero-sub { font-size:1rem; color:rgba(255,255,255,.6); max-width:480px; margin:0 auto 2.5rem; }
        #lf-test .hero-cta { display:inline-flex; align-items:center; gap:10px; background:#c9a84c;
          color:#3d2b1f; font-family:sans-serif; font-size:.85rem; font-weight:700;
          letter-spacing:.1em; text-transform:uppercase; padding:14px 32px; border-radius:2px; }
        #lf-test .hero-scroll { position:absolute; bottom:2rem; left:50%; transform:translateX(-50%);
          display:flex; flex-direction:column; align-items:center; gap:8px;
          color:rgba(255,255,255,.3); font-family:sans-serif; font-size:.7rem; letter-spacing:.15em; text-transform:uppercase; }
        #lf-test .scroll-line { width:1px; height:48px;
          background:linear-gradient(to bottom,rgba(255,255,255,.3),transparent);
          animation:lfScroll 2s ease-in-out infinite; }
        @keyframes lfScroll { 0%,100%{opacity:.3;transform:scaleY(1)} 50%{opacity:1;transform:scaleY(.6)} }

        /* sections */
        #lf-test section { padding:100px 5%; }
        #lf-test .section-label { font-family:sans-serif; font-size:.7rem; letter-spacing:.3em; text-transform:uppercase; color:#7a9e7e; margin-bottom:1rem; }
        #lf-test h2 { font-size:clamp(2rem,4vw,3rem); font-style:italic; color:#3d2b1f; line-height:1.1; margin-bottom:1.5rem; }

        /* about */
        #lf-test .about { background:#fff; }
        #lf-test .about-grid { display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center; max-width:1100px; margin:0 auto; }
        @media(max-width:768px){ #lf-test .about-grid { grid-template-columns:1fr; gap:40px; } }
        #lf-test .about-image { aspect-ratio:4/5; border-radius:2px; background:linear-gradient(135deg,#c5b99a,#7a9e7e,#3d2b1f); position:relative; overflow:hidden; }
        #lf-test .about-image::after { content:'🌿'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:6rem; opacity:.25; }
        #lf-test .about-text p { color:#5a4a3f; margin-bottom:1rem; font-size:1.05rem; }
        #lf-test .divider { width:48px; height:2px; background:#c9a84c; margin:1.5rem 0; }

        /* menu */
        #lf-test .menu-section { max-width:900px; margin:0 auto; }
        #lf-test .menu-item { display:flex; justify-content:space-between; align-items:baseline; padding:1.4rem 0; border-bottom:1px solid #e8e0d5; }
        #lf-test .menu-item:first-of-type { border-top:1px solid #e8e0d5; }
        #lf-test .menu-item-name { font-size:1.1rem; color:#3d2b1f; }
        #lf-test .menu-item-desc { font-size:.85rem; color:#8a7060; margin-top:2px; }
        #lf-test .menu-item-price { font-family:sans-serif; font-weight:700; color:#c9a84c; white-space:nowrap; margin-left:2rem; }

        /* gallery */
        #lf-test .gallery { background:#3d2b1f; }
        #lf-test .gallery h2 { color:#fff; }
        #lf-test .gallery .section-label { color:#c9a84c; }
        #lf-test .gallery-grid { display:grid; grid-template-columns:repeat(3,1fr); grid-template-rows:240px 240px; gap:12px; margin-top:3rem; }
        #lf-test .gallery-item { border-radius:2px; overflow:hidden; position:relative; }
        #lf-test .gallery-item:first-child { grid-row:1/3; }
        #lf-test .gallery-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:3rem; opacity:.4; }
        #lf-test .g1{background:linear-gradient(135deg,#4a3828,#2d4a32)} #lf-test .g2{background:linear-gradient(135deg,#3d5a42,#2a2a1e)}
        #lf-test .g3{background:linear-gradient(135deg,#5a3a2a,#7a5a3a)} #lf-test .g4{background:linear-gradient(135deg,#2a3d2e,#1a2a1e)}
        #lf-test .g5{background:linear-gradient(135deg,#4a3020,#3a4a2a)}

        /* contact */
        #lf-test .contact { background:#fff; }
        #lf-test .contact-grid { display:grid; grid-template-columns:1fr 1fr; gap:80px; max-width:1100px; margin:0 auto; }
        @media(max-width:768px){ #lf-test .contact-grid { grid-template-columns:1fr; gap:40px; } }
        #lf-test .info-label { font-family:sans-serif; font-size:.7rem; letter-spacing:.2em; text-transform:uppercase; color:#7a9e7e; margin-bottom:.5rem; }
        #lf-test .info-value { font-size:1rem; color:#3d2b1f; margin-bottom:2rem; }
        #lf-test .map-placeholder { background:linear-gradient(135deg,#d4cec6,#b8b0a4); border-radius:2px; height:280px; display:flex; align-items:center; justify-content:center; font-size:4rem; }

        /* footer */
        #lf-test footer { background:#1a120a; color:rgba(255,255,255,.4); text-align:center; padding:2.5rem 5%; font-family:sans-serif; font-size:.8rem; }
        #lf-test footer strong { color:#c9a84c; }
      `}</style>

      <div id="lf-test">
        <nav>
          <div className="nav-logo">{restaurantName}</div>
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#menu">Menu</a>
            <a href="#gallery">Gallery</a>
            <a href="#contact">Reservations</a>
          </div>
        </nav>

        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-content">
            <p className="hero-eyebrow">Farm to Table · Est. 2019</p>
            <h1>Where Every<br /><span>Meal Tells</span><br />a Story</h1>
            <p className="hero-sub">Seasonal ingredients from local farms, crafted into dishes that celebrate the garden.</p>
            <a href="#menu" className="hero-cta">View Today&apos;s Menu →</a>
          </div>
          <div className="hero-scroll">
            <div className="scroll-line" />
            Scroll
          </div>
        </section>

        <section className="about" id="about">
          <div className="about-grid">
            <div className="about-image" />
            <div className="about-text">
              <p className="section-label">Our Story</p>
              <h2>A Passion for<br />Honest Food</h2>
              <div className="divider" />
              <p>Nestled in the heart of the city, {restaurantName} was born from a simple belief: the best meals start with the best ingredients.</p>
              <p>Every dish changes with the seasons. Our chefs work directly with farmers each morning.</p>
              <p>No shortcuts. No freezers. Just beautiful, honest food.</p>
            </div>
          </div>
        </section>

        <section id="menu" style={{ background: "#faf7f2" }}>
          <div className="menu-section">
            <p className="section-label">What We&apos;re Serving</p>
            <h2>A Taste of<br />the Season</h2>
            <div className="menu-item"><div><div className="menu-item-name">Burrata &amp; Heirloom Tomato</div><div className="menu-item-desc">cold-pressed olive oil, basil, Maldon salt</div></div><div className="menu-item-price">$17</div></div>
            <div className="menu-item"><div><div className="menu-item-name">Mushroom Crostini</div><div className="menu-item-desc">wild foraged mix, truffle oil</div></div><div className="menu-item-price">$14</div></div>
            <div className="menu-item"><div><div className="menu-item-name">Garden Soup</div><div className="menu-item-desc">ask your server for today&apos;s selection</div></div><div className="menu-item-price">$11</div></div>
          </div>
        </section>

        <section className="gallery" id="gallery">
          <p className="section-label">The Atmosphere</p>
          <h2>Come As You Are</h2>
          <div className="gallery-grid">
            <div className="gallery-item g1"><div className="gallery-placeholder">🌿</div></div>
            <div className="gallery-item g2"><div className="gallery-placeholder">🍋</div></div>
            <div className="gallery-item g3"><div className="gallery-placeholder">🫙</div></div>
            <div className="gallery-item g4"><div className="gallery-placeholder">🍷</div></div>
            <div className="gallery-item g5"><div className="gallery-placeholder">🌸</div></div>
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="contact-grid">
            <div>
              <p className="section-label">Find Us</p>
              <h2>Come Visit<br />the Garden</h2>
              <div className="divider" />
              <p className="info-label">Address</p><p className="info-value">24 Bloom Lane, West Village<br />New York, NY 10014</p>
              <p className="info-label">Hours</p><p className="info-value">Mon–Fri 11:30am–10pm<br />Sat–Sun 10am–11pm</p>
              <p className="info-label">Reservations</p><p className="info-value">+1 (212) 555-0182</p>
            </div>
            <div><div className="map-placeholder">📍</div></div>
          </div>
        </section>

        <footer>
          <p>&copy; 2026 <strong>{restaurantName}</strong> · All rights reserved.</p>
          <p style={{ marginTop: 6 }}>Menu powered by <strong>LunchFlow</strong></p>
        </footer>
      </div>

      {/* Widget injected server-side with fresh restaurantId and cache-busted ts */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var s=document.createElement('script');s.src='/widget.js?v=${ts}';s.dataset.restaurantId='${restaurantId}';document.head.appendChild(s);})();`,
        }}
      />
    </>
  );
}
