import { ImageResponse } from "next/og";
import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";
export const alt = "Recipe social post";
export const contentType = "image/png";
export const size = { width: 1080, height: 1080 };

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { slug },
    select: { title: true, description: true, image: true, prepTime: true, cookTime: true, category: { select: { name: true } } },
  });

  if (!recipe) {
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff7ed", color: "#111827", fontSize: 56, fontWeight: 700 }}>
        Recipe not found
      </div>,
      size,
    );
  }

  const totalTime =
    recipe.prepTime !== null && recipe.cookTime !== null
      ? recipe.prepTime + recipe.cookTime
      : recipe.prepTime ?? recipe.cookTime;

  const logoResponse = await fetch(new URL("/logo.png", request.url));
  const logoBuffer = await logoResponse.arrayBuffer();
  const logoData = `data:image/png;base64,${Buffer.from(logoBuffer).toString("base64")}`;

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#fff7ed", color: "#111827", fontFamily: "Arial" }}>
      {recipe.image ? (
        <img src={recipe.image} width="1080" height="1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : null}
      <div style={{ position: "absolute", inset: 0, display: "flex", background: "rgba(0,0,0,0.42)" }} />
      <div style={{ position: "absolute", left: 72, right: 72, bottom: 72, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
          <img src={logoData} width="72" height="72" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 18 }} />
          {recipe.category ? <div style={{ color: "white", fontSize: 26, fontWeight: 600 }}>{recipe.category.name}</div> : null}
        </div>
        <div style={{ color: "white", fontSize: 66, lineHeight: 1.05, fontWeight: 800, maxWidth: 900 }}>{recipe.title}</div>
        {recipe.description ? <div style={{ marginTop: 20, color: "rgba(255,255,255,0.9)", fontSize: 28, lineHeight: 1.2, maxWidth: 850 }}>{recipe.description}</div> : null}
        {totalTime !== null ? <div style={{ marginTop: 22, color: "white", fontSize: 26, fontWeight: 600 }}>⏱ {totalTime} min</div> : null}
      </div>
    </div>,
    size,
  );
}
