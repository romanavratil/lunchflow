import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { MenuItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const { menuId } = await params;
  const format = req.nextUrl.searchParams.get("format") ?? "story"; // "story" | "post"

  const menu = await prisma.dailyMenu.findUnique({
    where: { id: menuId },
    include: { restaurant: true },
  });

  if (!menu) {
    return new Response("Menu not found", { status: 404 });
  }

  const mains = menu.mains as unknown as MenuItem[];
  const brand = menu.restaurant.brandingColor;
  const date = new Date(menu.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const isStory = format === "story";
  const width = 1080;
  const height = isStory ? 1920 : 1080;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(145deg, ${brand} 0%, #0f0f1a 100%)`,
          fontFamily: '"Inter", system-ui, sans-serif',
          color: "#ffffff",
          position: "relative",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            display: "flex",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: isStory ? "120px 100px" : "80px 100px",
            height: "100%",
            zIndex: 10,
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", marginBottom: isStory ? 80 : 50 }}>
            <div
              style={{
                fontSize: isStory ? 32 : 24,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
                marginBottom: 16,
                display: "flex",
              }}
            >
              {date}
            </div>
            <div
              style={{
                fontSize: isStory ? 96 : 72,
                fontWeight: 800,
                lineHeight: 1.0,
                letterSpacing: "-0.03em",
                display: "flex",
              }}
            >
              {menu.restaurant.name}
            </div>
            <div
              style={{
                fontSize: isStory ? 40 : 32,
                fontWeight: 300,
                color: "rgba(255,255,255,0.6)",
                marginTop: 12,
                display: "flex",
              }}
            >
              Today&apos;s Menu
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              width: 80,
              height: 4,
              background: "rgba(255,255,255,0.3)",
              borderRadius: 2,
              marginBottom: isStory ? 80 : 50,
              display: "flex",
            }}
          />

          {/* Soup */}
          {menu.soup && (
            <div style={{ display: "flex", flexDirection: "column", marginBottom: isStory ? 60 : 40 }}>
              <div
                style={{
                  fontSize: isStory ? 24 : 18,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 12,
                  display: "flex",
                }}
              >
                Soup of the Day
              </div>
              <div
                style={{
                  fontSize: isStory ? 52 : 38,
                  fontWeight: 600,
                  fontStyle: "italic",
                  display: "flex",
                }}
              >
                {menu.soup}
              </div>
            </div>
          )}

          {/* Mains */}
          <div style={{ display: "flex", flexDirection: "column", gap: isStory ? 32 : 20 }}>
            <div
              style={{
                fontSize: isStory ? 24 : 18,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
                marginBottom: 8,
                display: "flex",
              }}
            >
              Main Courses
            </div>
            {mains.slice(0, 6).map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: isStory ? "28px 40px" : "18px 30px",
                  background: item.soldOut
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  borderLeft: item.soldOut ? "4px solid rgba(255,255,255,0.1)" : `4px solid ${brand}`,
                  opacity: item.soldOut ? 0.5 : 1,
                }}
              >
                <div
                  style={{
                    fontSize: isStory ? 42 : 30,
                    fontWeight: 600,
                    textDecoration: item.soldOut ? "line-through" : "none",
                    display: "flex",
                  }}
                >
                  {item.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                  }}
                >
                  <div
                    style={{
                      fontSize: isStory ? 42 : 30,
                      fontWeight: 700,
                      color: item.soldOut ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.9)",
                      display: "flex",
                    }}
                  >
                    {item.price}
                  </div>
                  {item.soldOut && (
                    <div
                      style={{
                        fontSize: 18,
                        color: "#ef4444",
                        fontWeight: 600,
                        marginTop: 4,
                        display: "flex",
                      }}
                    >
                      SOLD OUT
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: "auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 40,
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div
              style={{
                fontSize: isStory ? 26 : 20,
                color: "rgba(255,255,255,0.3)",
                display: "flex",
              }}
            >
              Powered by LunchFlow
            </div>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              🍽
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
    }
  );
}
