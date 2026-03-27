import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DEFAULT_WIDGET_CONFIG, WidgetConfig, MenuItem } from "@/lib/types";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: Promise<{ restaurantId: string }> }
): Promise<Metadata> {
  const { restaurantId } = await params;
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { name: true },
  });
  return {
    title: restaurant ? `${restaurant.name} — Today's Menu` : "Today's Menu",
  };
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;

  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  if (!restaurant) notFound();

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setUTCHours(23, 59, 59, 999);

  const menu = await prisma.dailyMenu.findFirst({
    where: { restaurantId, date: { gte: todayStart, lte: todayEnd }, isPublished: true },
    orderBy: { date: "desc" },
  });

  const cfg: WidgetConfig = { ...DEFAULT_WIDGET_CONFIG, ...(restaurant.widgetConfig as Partial<WidgetConfig>) };
  const accent = cfg.modalAccent || restaurant.brandingColor || "#6366f1";
  const currency = cfg.currency || "";
  const mains = (menu?.mains ?? []) as unknown as MenuItem[];

  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <>
      <style>{`
        body { background: #f5f5f7 !important; }
        .lf-page { min-height: 100vh; display: flex; align-items: flex-start; justify-content: center; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .lf-card { background: #fff; border-radius: 20px; box-shadow: 0 8px 40px rgba(0,0,0,.12); width: 100%; max-width: 420px; overflow: hidden; }
        .lf-head { padding: 20px 24px 16px; border-bottom: 1px solid #f0f0f0; }
        .lf-name { font-size: 22px; font-weight: 800; letter-spacing: -.03em; color: #111; }
        .lf-date { font-size: 11px; font-weight: 600; letter-spacing: .07em; text-transform: uppercase; color: ${accent}; opacity: .8; margin-top: 3px; }
        .lf-body { padding: 16px 24px 24px; }
        .lf-sec { font-size: 9px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: rgba(0,0,0,.35); margin: 14px 0 7px; }
        .lf-soup { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(0,0,0,.03); border-radius: 10px; border-left: 3px solid ${accent}; }
        .lf-soup-name { font-size: 14px; font-style: italic; font-weight: 500; color: #111; }
        .lf-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(0,0,0,.03); border-radius: 10px; margin-bottom: 6px; }
        .lf-row.out { opacity: .42; }
        .lf-item-name { font-size: 14px; font-weight: 500; color: #111; }
        .lf-item-name.out { text-decoration: line-through; }
        .lf-item-desc { font-size: 12px; color: rgba(0,0,0,.45); margin-top: 2px; line-height: 1.4; }
        .lf-sold { font-size: 9px; font-weight: 700; color: #dc2626; background: #fee2e2; padding: 2px 6px; border-radius: 20px; margin-top: 2px; display: inline-block; }
        .lf-price { font-size: 14px; font-weight: 700; color: ${accent}; white-space: nowrap; margin-left: 12px; }
        .lf-empty { text-align: center; padding: 32px 16px; font-size: 14px; color: rgba(0,0,0,.35); }
        .lf-foot { text-align: center; padding: 12px 24px 16px; border-top: 1px solid #f0f0f0; font-size: 11px; color: rgba(0,0,0,.3); }
        .lf-foot a { color: ${accent}; text-decoration: none; font-weight: 600; }
      `}</style>

      <div className="lf-page">
        <div className="lf-card">
          <div className="lf-head">
            <div className="lf-name">{restaurant.name}</div>
            <div className="lf-date">{date}</div>
          </div>

          <div className="lf-body">
            {!menu || (!menu.soup && mains.length === 0) ? (
              <div className="lf-empty">No menu posted for today yet</div>
            ) : (
              <>
                {menu.soup && (
                  <>
                    <div className="lf-sec">Soup of the Day</div>
                    <div className="lf-soup">
                      <span className="lf-soup-name">{menu.soup}</span>
                      {menu.soupPrice && (
                        <span className="lf-price">{menu.soupPrice}{currency ? `\u00a0${currency}` : ""}</span>
                      )}
                    </div>
                  </>
                )}
                {mains.length > 0 && (
                  <>
                    <div className="lf-sec">Main Courses</div>
                    {mains.map((item, i) => (
                      <div key={i} className={`lf-row${item.soldOut ? " out" : ""}`}>
                        <div>
                          <div className={`lf-item-name${item.soldOut ? " out" : ""}`}>{item.name}</div>
                          {item.description && <div className="lf-item-desc">{item.description}</div>}
                          {item.soldOut && <span className="lf-sold">SOLD OUT</span>}
                        </div>
                        <span className="lf-price">{item.price}{currency ? `\u00a0${currency}` : ""}</span>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>

          <div className="lf-foot">
            Powered by{" "}
            <a href="https://lunchflow.app" target="_blank" rel="noopener">LunchFlow</a>
          </div>
        </div>
      </div>
    </>
  );
}
