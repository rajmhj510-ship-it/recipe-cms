import { prisma } from "../../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { slug },
  });

  if (!recipe) {
    return NextResponse.json(
      { error: "Recipe not found" },
      { status: 404 }
    );
  }

  const updatedRecipe = await prisma.recipe.update({
    where: { slug },
    data: {
      favorite: !recipe.favorite,
    },
  });

  return NextResponse.json({
    favorite: updatedRecipe.favorite,
  });
}
