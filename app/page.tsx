import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DEFAULT_WIDGET_CONFIG, WidgetConfig, MenuItem } from "@/lib/types";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "LunchFlow — Today's Lunch Menus",
  description: "Browse today's daily menus from local restaurants. Updated live every day.",
};

async function getRestaurantsWithMenus() {
  const todayStart = new Date(); todayStart.setUTCHours(0,0,0,0);
  const todayEnd   = new Date(); todayEnd.setUTCHours(23,59,59,999);
  return prisma.restaurant.findMany({
    where: { menus: { some: { date: { gte: todayStart, lte: todayEnd }, isPublished: true } } },
    include: { menus: { where: { date: { gte: todayStart, lte: todayEnd }, isPublished: true }, take: 1 } },
    orderBy: { name: "asc" },
  });
}

function luminance(hex: string) {
  const h = hex.replace("#","");
  if (h.length !== 6) return 1;
  const r=parseInt(h.slice(0,2),16)/255, g=parseInt(h.slice(2,4),16)/255, b=parseInt(h.slice(4,6),16)/255;
  const l=(c:number)=>c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4);
  return 0.2126*l(r)+0.7152*l(g)+0.0722*l(b);
}

export default async function LandingPage() {
  const restaurants = await getRestaurantsWithMenus();
  const today = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;color:#111}
        a{text-decoration:none;color:inherit}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-10px)}}
        .dot-pulse{animation:pulse 2s cubic-bezier(.4,0,.6,1) infinite}
        .fade1{animation:fadeUp .7s .05s both}
        .fade2{animation:fadeUp .7s .18s both}
        .fade3{animation:fadeUp .7s .32s both}
        .fade4{animation:fadeUp .7s .46s both}
        .float1{animation:float 6s ease-in-out infinite}
        .float2{animation:float 6s 1.8s ease-in-out infinite}
        .card{transition:transform .2s ease,box-shadow .2s ease}
        .card:hover{transform:translateY(-4px);box-shadow:0 24px 64px rgba(0,0,0,.12)}
        .btn-primary{transition:transform .15s ease,box-shadow .15s ease,background .15s ease}
        .btn-primary:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(79,70,229,.4)}
        .nav-link{transition:color .15s ease}
        .nav-link:hover{color:#fff}
        .step-card{transition:transform .2s ease,box-shadow .2s ease}
        .step-card:hover{transform:translateY(-3px);box-shadow:0 16px 48px rgba(0,0,0,.08)}
      `}</style>

      {/* ─── NAV ─────────────────────────────────────────────────────────────── */}
      <nav style={{
        position:"fixed",top:0,left:0,right:0,zIndex:100,
        background:"rgba(8,8,20,0.85)",backdropFilter:"blur(20px)",
        borderBottom:"1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{maxWidth:1120,margin:"0 auto",padding:"0 28px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          {/* Logo */}
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{
              width:32,height:32,borderRadius:10,
              background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:"0 4px 14px rgba(99,102,241,.4)",
              fontSize:16,
            }}>🍽</div>
            <span style={{fontWeight:800,fontSize:16,color:"#fff",letterSpacing:"-.03em"}}>LunchFlow</span>
          </div>
          {/* Nav links */}
          <div style={{display:"flex",alignItems:"center",gap:28}}>
            <a href="#menus" className="nav-link" style={{fontSize:13,fontWeight:500,color:"rgba(255,255,255,.5)"}}>Browse menus</a>
            <a href="#features" className="nav-link" style={{fontSize:13,fontWeight:500,color:"rgba(255,255,255,.5)"}}>Features</a>
            <Link href="/auth/signin" className="nav-link" style={{fontSize:13,fontWeight:500,color:"rgba(255,255,255,.5)"}}>Sign in</Link>
            <Link href="/auth/signup" style={{
              fontSize:13,fontWeight:700,color:"#fff",
              background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
              padding:"8px 18px",borderRadius:10,
              boxShadow:"0 4px 12px rgba(99,102,241,.35)",
            }} className="btn-primary">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────────────────────────────────── */}
      <section style={{
        background:"linear-gradient(160deg,#0a0a1a 0%,#0f0f2e 50%,#0a0a1a 100%)",
        paddingTop:140,paddingBottom:100,
        position:"relative",overflow:"hidden",
      }}>
        {/* Grid overlay */}
        <div style={{
          position:"absolute",inset:0,
          backgroundImage:"linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px)",
          backgroundSize:"64px 64px",
          maskImage:"radial-gradient(ellipse 80% 60% at 50% 40%,black 40%,transparent 100%)",
          WebkitMaskImage:"radial-gradient(ellipse 80% 60% at 50% 40%,black 40%,transparent 100%)",
        }}/>
        {/* Glow orbs */}
        <div style={{position:"absolute",top:"-20%",left:"20%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,.15) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:"10%",right:"15%",width:350,height:350,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,.12) 0%,transparent 70%)",pointerEvents:"none"}}/>

        <div style={{maxWidth:1120,margin:"0 auto",padding:"0 28px",position:"relative"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 460px",gap:64,alignItems:"center"}}>

            {/* Left */}
            <div>
              {/* Live pill */}
              <div className="fade1" style={{
                display:"inline-flex",alignItems:"center",gap:8,
                background:"rgba(99,102,241,.12)",border:"1px solid rgba(99,102,241,.25)",
                color:"rgba(255,255,255,.7)",fontSize:12,fontWeight:600,
                padding:"6px 14px",borderRadius:100,marginBottom:28,
              }}>
                <span className="dot-pulse" style={{width:7,height:7,borderRadius:"50%",background:"#22c55e",display:"inline-block"}}/>
                {today}
              </div>

              {/* Headline */}
              <h1 className="fade2" style={{
                fontSize:62,fontWeight:900,lineHeight:1.04,
                letterSpacing:"-.04em",color:"#fff",marginBottom:22,
              }}>
                Today&apos;s lunch,<br/>
                <span style={{
                  background:"linear-gradient(90deg,#818cf8,#c084fc,#f472b6)",
                  WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                  backgroundClip:"text",
                }}>at a glance.</span>
              </h1>

              {/* Subtitle */}
              <p className="fade3" style={{
                fontSize:17,color:"rgba(255,255,255,.5)",lineHeight:1.7,
                maxWidth:460,marginBottom:36,
              }}>
                Post your daily specials in 30 seconds. Your website widget,
                social cards, and this menu directory all update instantly — no tech required.
              </p>

              {/* CTA buttons */}
              <div className="fade4" style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:36}}>
                <Link href="/auth/signup" className="btn-primary" style={{
                  display:"inline-flex",alignItems:"center",gap:8,
                  background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
                  color:"#fff",fontWeight:700,fontSize:15,
                  padding:"14px 26px",borderRadius:14,
                  boxShadow:"0 8px 28px rgba(99,102,241,.4)",
                }}>
                  Add your restaurant — it&apos;s free
                  <span style={{fontSize:18}}>→</span>
                </Link>
                <a href="#menus" style={{
                  display:"inline-flex",alignItems:"center",gap:8,
                  background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",
                  color:"rgba(255,255,255,.8)",fontWeight:600,fontSize:15,
                  padding:"14px 26px",borderRadius:14,
                  backdropFilter:"blur(8px)",
                }}>
                  Browse today&apos;s menus
                </a>
              </div>

              {/* Trust strip */}
              <div className="fade4" style={{display:"flex",gap:20,flexWrap:"wrap"}}>
                {["No credit card","2-minute setup","Works on any website"].map(t=>(
                  <div key={t} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:500,color:"rgba(255,255,255,.35)"}}>
                    <span style={{color:"#22c55e",fontSize:14}}>✓</span>{t}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating preview cards */}
            <div style={{position:"relative",height:420}}>
              {/* Card 1 */}
              <div className="float1" style={{
                position:"absolute",top:0,right:0,width:280,
                background:"#fff",borderRadius:20,
                boxShadow:"0 32px 80px rgba(0,0,0,.35)",overflow:"hidden",
              }}>
                <div style={{padding:"14px 18px",background:"linear-gradient(135deg,#1e1b4b,#312e81)"}}>
                  <div style={{fontSize:15,fontWeight:800,color:"#fff",letterSpacing:"-.02em"}}>Café Bohemia</div>
                  <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.45)",letterSpacing:".15em",textTransform:"uppercase",marginTop:2}}>Today&apos;s Menu</div>
                </div>
                <div style={{padding:"14px 18px",fontSize:12}}>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"#9ca3af",marginBottom:8}}>Soup of the Day</div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                    <span style={{fontStyle:"italic",color:"#4b5563"}}>French Onion Soup</span>
                    <span style={{fontWeight:700,color:"#4f46e5"}}>59 Kč</span>
                  </div>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"#9ca3af",marginBottom:8}}>Main Courses</div>
                  {[["Svíčková na smetaně","189 Kč"],["Smažený řízek","165 Kč"],["Vegetable Risotto","149 Kč"]].map(([n,p])=>(
                    <div key={n} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontWeight:500,color:"#374151"}}>{n}</span>
                      <span style={{fontWeight:700,color:"#4f46e5"}}>{p}</span>
                    </div>
                  ))}
                </div>
                <div style={{padding:"10px 18px",background:"#f9fafb",borderTop:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:10,color:"#9ca3af"}}>3 dishes + soup</span>
                  <span style={{fontSize:11,fontWeight:700,color:"#4f46e5"}}>View full menu →</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="float2" style={{
                position:"absolute",bottom:0,left:0,width:250,
                background:"#fff",borderRadius:20,
                boxShadow:"0 32px 80px rgba(0,0,0,.3)",overflow:"hidden",
              }}>
                <div style={{padding:"14px 18px",background:"linear-gradient(135deg,#92400e,#d97706)"}}>
                  <div style={{fontSize:15,fontWeight:800,color:"#fff",letterSpacing:"-.02em"}}>Bistro Verde</div>
                  <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.5)",letterSpacing:".15em",textTransform:"uppercase",marginTop:2}}>Today&apos;s Menu</div>
                </div>
                <div style={{padding:"14px 18px",fontSize:12}}>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"#9ca3af",marginBottom:8}}>Main Courses</div>
                  {[["Grilled Salmon","220 Kč"],["Chicken Piccata","185 Kč"],["Mushroom Pasta","165 Kč"]].map(([n,p])=>(
                    <div key={n} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontWeight:500,color:"#374151"}}>{n}</span>
                      <span style={{fontWeight:700,color:"#d97706"}}>{p}</span>
                    </div>
                  ))}
                </div>
                <div style={{padding:"10px 18px",background:"#fffbeb",borderTop:"1px solid #fef3c7",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:10,color:"#9ca3af"}}>3 dishes</span>
                  <span style={{fontSize:11,fontWeight:700,color:"#d97706"}}>View full menu →</span>
                </div>
              </div>

              {/* Widget FAB mock */}
              <div className="float1" style={{
                position:"absolute",bottom:90,right:10,
                background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
                color:"#fff",fontWeight:700,fontSize:13,
                padding:"11px 20px",borderRadius:100,
                display:"flex",alignItems:"center",gap:8,
                boxShadow:"0 8px 32px rgba(99,102,241,.5)",
              }}>
                🍴 Today&apos;s Menu
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:80,background:"linear-gradient(to bottom,transparent,#fff)",pointerEvents:"none"}}/>
      </section>

      {/* ─── STATS ───────────────────────────────────────────────────────────── */}
      <section style={{background:"#fff",padding:"40px 0",borderBottom:"1px solid #f0f0f0"}}>
        <div style={{maxWidth:1120,margin:"0 auto",padding:"0 28px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:0,textAlign:"center"}}>
            {[
              {n:"30s",l:"To update your menu"},
              {n:"100%",l:"Free to get started"},
              {n:"Any",l:"Website platform"},
            ].map(({n,l},i)=>(
              <div key={l} style={{padding:"16px 0",borderRight:i<2?"1px solid #f0f0f0":"none"}}>
                <div style={{fontSize:36,fontWeight:900,color:"#111",letterSpacing:"-.04em",lineHeight:1}}>{n}</div>
                <div style={{fontSize:12,fontWeight:500,color:"#9ca3af",marginTop:6}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LIVE MENUS ──────────────────────────────────────────────────────── */}
      <section id="menus" style={{background:"#f8f8fc",padding:"80px 0"}}>
        <div style={{maxWidth:1120,margin:"0 auto",padding:"0 28px"}}>
          {/* Header */}
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:40}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <span className="dot-pulse" style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",display:"inline-block"}}/>
                <span style={{fontSize:11,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:"#9ca3af"}}>Live today</span>
              </div>
              <h2 style={{fontSize:34,fontWeight:900,letterSpacing:"-.03em",color:"#111",lineHeight:1.1}}>
                Today&apos;s lunch menus
              </h2>
              <p style={{fontSize:14,color:"#9ca3af",marginTop:6}}>{today}</p>
            </div>
            {restaurants.length > 0 && (
              <div style={{
                background:"#eff0ff",border:"1px solid #ddd6fe",
                color:"#4f46e5",fontSize:13,fontWeight:700,
                padding:"8px 16px",borderRadius:12,flexShrink:0,
              }}>
                {restaurants.length} restaurant{restaurants.length!==1?"s":""} open today
              </div>
            )}
          </div>

          {/* Grid */}
          {restaurants.length === 0 ? (
            <div style={{
              background:"#fff",borderRadius:24,border:"1px solid #e5e7eb",
              padding:"80px 0",textAlign:"center",
            }}>
              <div style={{fontSize:48,marginBottom:12}}>🍽</div>
              <p style={{fontSize:16,fontWeight:700,color:"#d1d5db"}}>No menus posted yet today</p>
              <p style={{fontSize:13,color:"#d1d5db",marginTop:4}}>Come back at lunch time</p>
            </div>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:16}}>
              {restaurants.map((r) => {
                const menu = r.menus[0];
                const cfg: WidgetConfig = {...DEFAULT_WIDGET_CONFIG,...(r.widgetConfig as Partial<WidgetConfig>)};
                const accent = cfg.modalAccent || r.brandingColor || "#6366f1";
                const currency = cfg.currency || "";
                const mains = (menu?.mains ?? []) as MenuItem[];
                const dark = luminance(accent) < 0.35;
                const onAcc = dark ? "#fff" : "#111";

                return (
                  <Link key={r.id} href={`/menu/${r.id}`} className="card" style={{
                    background:"#fff",borderRadius:20,
                    border:"1px solid #e5e7eb",overflow:"hidden",
                    display:"flex",flexDirection:"column",
                    boxShadow:"0 2px 16px rgba(0,0,0,.05)",
                  }}>
                    {/* Accent header */}
                    <div style={{background:accent,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <div style={{fontSize:17,fontWeight:800,color:onAcc,letterSpacing:"-.025em",lineHeight:1.2}}>{r.name}</div>
                        <div style={{fontSize:10,fontWeight:700,color:onAcc,opacity:.55,letterSpacing:".18em",textTransform:"uppercase",marginTop:3}}>Today&apos;s Menu</div>
                      </div>
                      <div style={{
                        width:30,height:30,borderRadius:"50%",
                        background:"rgba(255,255,255,.18)",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:14,marginTop:2,flexShrink:0,
                      }}>→</div>
                    </div>

                    {/* Body */}
                    <div style={{flex:1,padding:"16px 20px",display:"flex",flexDirection:"column",gap:14}}>
                      {menu?.soup && (
                        <div>
                          <div style={{fontSize:9,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"#9ca3af",marginBottom:6}}>Soup of the Day</div>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                            <span style={{fontSize:13,fontStyle:"italic",color:"#4b5563",fontWeight:500}}>{menu.soup}</span>
                            {menu.soupPrice && <span style={{fontSize:12,fontWeight:700,color:accent,flexShrink:0}}>{menu.soupPrice}{currency?` ${currency}`:""}</span>}
                          </div>
                        </div>
                      )}

                      {mains.length > 0 && (
                        <div>
                          <div style={{fontSize:9,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"#9ca3af",marginBottom:8}}>Main Courses</div>
                          <div style={{display:"flex",flexDirection:"column",gap:8}}>
                            {mains.slice(0,4).map((item,i)=>(
                              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,opacity:item.soldOut?.5:1}}>
                                <div style={{minWidth:0,flex:1}}>
                                  <div style={{fontSize:13,fontWeight:600,color:"#1f2937",lineHeight:1.3,textDecoration:item.soldOut?"line-through":"none"}}>{item.name}</div>
                                  {item.description && <div style={{fontSize:11,color:"#9ca3af",marginTop:2,lineHeight:1.35,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.description}</div>}
                                  {item.soldOut && <div style={{fontSize:9,fontWeight:700,color:"#ef4444",background:"#fee2e2",padding:"1px 6px",borderRadius:20,marginTop:3,display:"inline-block",letterSpacing:".05em"}}>SOLD OUT</div>}
                                </div>
                                {item.price && <span style={{fontSize:12,fontWeight:700,color:accent,flexShrink:0,marginTop:1}}>{item.price}{currency?` ${currency}`:""}</span>}
                              </div>
                            ))}
                            {mains.length > 4 && <div style={{fontSize:11,fontWeight:500,color:"#9ca3af"}}>+{mains.length-4} more items</div>}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div style={{padding:"11px 20px",background:"#fafafa",borderTop:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:11,color:"#9ca3af",fontWeight:500}}>{mains.length} dish{mains.length!==1?"es":"es"}{menu?.soup?" + soup":""}</span>
                      <span style={{fontSize:11,fontWeight:700,color:accent}}>Full menu →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section style={{background:"#fff",padding:"80px 0"}}>
        <div style={{maxWidth:1120,margin:"0 auto",padding:"0 28px"}}>
          <div style={{textAlign:"center",marginBottom:56}}>
            <div style={{
              display:"inline-block",fontSize:11,fontWeight:700,letterSpacing:".18em",
              textTransform:"uppercase",color:"#6366f1",
              background:"#eff0ff",border:"1px solid #e0e7ff",
              padding:"6px 14px",borderRadius:100,marginBottom:16,
            }}>How it works</div>
            <h2 style={{fontSize:36,fontWeight:900,letterSpacing:"-.03em",color:"#111",lineHeight:1.1}}>
              From photo to live menu<br/>in under a minute
            </h2>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,position:"relative"}}>
            {/* Connector */}
            <div style={{
              position:"absolute",top:36,left:"calc(16.67% + 20px)",right:"calc(16.67% + 20px)",
              height:1,background:"linear-gradient(90deg,#e0e7ff,#ddd6fe,#e0e7ff)",
              zIndex:0,
            }}/>

            {[
              {n:"01",e:"📸",t:"Upload or type",d:"Snap a photo of your daily menu board or type items manually. AI parses everything — names, prices, all of it."},
              {n:"02",e:"✏️",t:"Review & publish",d:"Edit any item, mark sold-out dishes, add descriptions. Hit Publish and it goes live in seconds."},
              {n:"03",e:"🚀",t:"Updates everywhere",d:"Your website widget, this public directory, and your social card generator all reflect the new menu instantly."},
            ].map(({n,e,t,d})=>(
              <div key={n} className="step-card" style={{
                background:"#fff",border:"1px solid #e5e7eb",borderRadius:20,
                padding:"28px 24px",position:"relative",zIndex:1,
              }}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
                  <div style={{
                    width:44,height:44,borderRadius:14,
                    background:"#f8f8fc",border:"1px solid #e5e7eb",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:22,boxShadow:"0 2px 8px rgba(0,0,0,.06)",
                  }}>{e}</div>
                  <span style={{fontSize:11,fontWeight:700,letterSpacing:".2em",color:"#d1d5db"}}>{n}</span>
                </div>
                <h3 style={{fontSize:17,fontWeight:800,color:"#111",letterSpacing:"-.02em",marginBottom:8}}>{t}</h3>
                <p style={{fontSize:13,color:"#6b7280",lineHeight:1.65}}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────────────────────────── */}
      <section id="features" style={{background:"#f8f8fc",padding:"80px 0"}}>
        <div style={{maxWidth:1120,margin:"0 auto",padding:"0 28px"}}>
          <div style={{textAlign:"center",marginBottom:48}}>
            <h2 style={{fontSize:34,fontWeight:900,letterSpacing:"-.03em",color:"#111"}}>Everything you need</h2>
            <p style={{fontSize:15,color:"#6b7280",marginTop:8}}>Built specifically for restaurants that change their menu daily</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {[
              {e:"🤖",t:"AI photo import",d:"Photograph your menu board — AI extracts every item and price automatically. Supports full-week import too.",tag:"Smart"},
              {e:"🎨",t:"Branded widget",d:"A floating button on your site, fully customizable — colors, position, style. Shadow DOM so it never breaks your design.",tag:"Branded"},
              {e:"📱",t:"Social cards",d:"One-click social media graphics with your branding. Download and post to Instagram in seconds.",tag:"Marketing"},
              {e:"📢",t:"Announcements",d:"Time-scheduled banners at the top of your site. Perfect for happy hour, specials, or holiday closings.",tag:"Promos"},
              {e:"📊",t:"Analytics",d:"Track how many visitors open your menu widget. See which days get the most lunch traffic.",tag:"Insights"},
              {e:"⚡",t:"Any platform",d:"One script tag. Works on Shoptet, Wix, Squarespace, WordPress, or any custom HTML page.",tag:"Universal"},
            ].map(({e,t,d,tag})=>(
              <div key={t} className="card" style={{
                background:"#fff",border:"1px solid #e5e7eb",borderRadius:18,
                padding:"22px",boxShadow:"0 2px 12px rgba(0,0,0,.04)",
              }}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <span style={{fontSize:30,lineHeight:1}}>{e}</span>
                  <span style={{fontSize:9,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#6366f1",background:"#eff0ff",border:"1px solid #e0e7ff",padding:"3px 8px",borderRadius:20}}>{tag}</span>
                </div>
                <h3 style={{fontSize:15,fontWeight:800,color:"#111",letterSpacing:"-.02em",marginBottom:6}}>{t}</h3>
                <p style={{fontSize:13,color:"#6b7280",lineHeight:1.6}}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────────────── */}
      <section style={{background:"#fff",padding:"80px 28px"}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{
            background:"linear-gradient(140deg,#0f0f2e 0%,#1e1b4b 60%,#2d1b69 100%)",
            borderRadius:28,padding:"60px 48px",textAlign:"center",
            position:"relative",overflow:"hidden",
            boxShadow:"0 40px 100px rgba(79,70,229,.25)",
          }}>
            {/* Glow */}
            <div style={{position:"absolute",top:"-30%",left:"50%",transform:"translateX(-50%)",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,.2) 0%,transparent 70%)",pointerEvents:"none"}}/>

            <div style={{position:"relative"}}>
              <div style={{fontSize:14,marginBottom:20}}>⭐️⭐️⭐️⭐️⭐️</div>
              <h2 style={{fontSize:38,fontWeight:900,color:"#fff",letterSpacing:"-.04em",lineHeight:1.1,marginBottom:14}}>
                Start posting your menu<br/>today. It&apos;s free.
              </h2>
              <p style={{fontSize:16,color:"rgba(255,255,255,.55)",lineHeight:1.7,marginBottom:36,maxWidth:440,margin:"0 auto 36px"}}>
                No credit card. No contract. Just a better way to keep your customers updated every single day.
              </p>
              <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
                <Link href="/auth/signup" className="btn-primary" style={{
                  display:"inline-flex",alignItems:"center",gap:10,
                  background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
                  color:"#fff",fontWeight:700,fontSize:15,
                  padding:"15px 30px",borderRadius:14,
                  boxShadow:"0 8px 28px rgba(99,102,241,.45)",
                }}>
                  Create free account →
                </Link>
                <Link href="/auth/signin" style={{
                  display:"inline-flex",alignItems:"center",gap:10,
                  background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.15)",
                  color:"rgba(255,255,255,.75)",fontWeight:600,fontSize:15,
                  padding:"15px 30px",borderRadius:14,
                }}>
                  Sign in
                </Link>
              </div>
              <p style={{fontSize:12,color:"rgba(255,255,255,.25)",marginTop:20}}>
                Free forever · No setup fee · Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{background:"#0a0a14",padding:"32px 28px"}}>
        <div style={{maxWidth:1120,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{
              width:28,height:28,borderRadius:9,fontSize:14,
              background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
              display:"flex",alignItems:"center",justifyContent:"center",
            }}>🍽</div>
            <span style={{fontWeight:800,fontSize:14,color:"rgba(255,255,255,.7)",letterSpacing:"-.02em"}}>LunchFlow</span>
          </div>
          <div style={{display:"flex",gap:24}}>
            {[["Browse menus","#menus"],["Sign in","/auth/signin"],["Get started","/auth/signup"]].map(([l,h])=>(
              <Link key={l} href={h} style={{fontSize:13,fontWeight:500,color:"rgba(255,255,255,.35)",transition:"color .15s"}} className="nav-link">{l}</Link>
            ))}
          </div>
          <p style={{fontSize:12,color:"rgba(255,255,255,.2)"}}>
            © {new Date().getFullYear()} LunchFlow
          </p>
        </div>
      </footer>
    </>
  );
}
