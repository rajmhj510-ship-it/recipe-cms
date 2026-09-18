import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../../lib/prisma";
import { COOKIE_NAME, verifyAdminSession } from "@/lib/admin-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;

  if (!(await verifyAdminSession(session))) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { slug } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { slug },
    select: { favorite: true },
  });

  if (!recipe) {
    return NextResponse.json(
      { error: "Recipe not found" },
      { status: 404 },
    );
  }

  const updatedRecipe = await prisma.recipe.update({
    where: { slug },
    data: {
      favorite: !recipe.favorite,
    },
    select: { favorite: true },
  });

  return NextResponse.json({
    favorite: updatedRecipe.favorite,
  });
}
