import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

const RECIPES_DIR = "/tmp/recipe-cookbook/data";

const IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/rajmhj510-ship-it/recipe-cookbook/main/";

function makeSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function imageUrl(imagePath: string | undefined) {
  if (!imagePath) return undefined;

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  return IMAGE_BASE_URL + imagePath.replace(/^\/+/, "");
}

function findJsonFiles(dir: string): string[] {
  const results: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...findJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      results.push(fullPath);
    }
  }

  return results;
}

async function main() {
  console.log("Starting recipe import...");

  const files = findJsonFiles(RECIPES_DIR);

  console.log(`Found ${files.length} JSON files.`);

  let imported = 0;
  let skipped = 0;

  for (const file of files) {
    try {
      const raw = fs.readFileSync(file, "utf8");
      const recipe = JSON.parse(raw);

      // Category JSON files contain arrays, not individual recipes.
      if (!recipe || Array.isArray(recipe) || typeof recipe !== "object") {
        skipped++;
        continue;
      }

      if (typeof recipe.title !== "string" || !recipe.title.trim()) {
        skipped++;
        continue;
      }

      const title = recipe.title.trim();
      const baseSlug = makeSlug(title);

      if (!baseSlug) {
        skipped++;
        continue;
      }

      const sourceId =
        typeof recipe.id === "number" ? recipe.id : undefined;

      // First check by source GitHub ID.
      let existing = null;

      if (sourceId !== undefined) {
        existing = await prisma.recipe.findUnique({
          where: {
            githubId: sourceId,
          },
        });

        // If the same source ID belongs to a different recipe,
        // we allow this recipe to be imported without githubId.
        if (existing && existing.slug !== baseSlug) {
          existing = null;
        }
      }

      // Always check the slug as well.
      if (!existing) {
        existing = await prisma.recipe.findUnique({
          where: {
            slug: baseSlug,
          },
        });
      }

      if (existing) {
        skipped++;
        continue;
      }

      // Make sure the slug is unique.
      let slug = baseSlug;

      const slugExists = await prisma.recipe.findUnique({
        where: {
          slug,
        },
      });

      if (slugExists) {
        let counter = 2;

        while (
          await prisma.recipe.findUnique({
            where: {
              slug,
            },
          })
        ) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
      }

      // Find or create the cuisine category.
      let categoryId: number | undefined;

      if (typeof recipe.category === "string" && recipe.category.trim()) {
        const categoryName = recipe.category.trim();
        const categorySlug = makeSlug(categoryName);

        const category = await prisma.category.upsert({
          where: {
            slug: categorySlug,
          },
          update: {
            name: categoryName,
          },
          create: {
            name: categoryName,
            slug: categorySlug,
          },
        });

        categoryId = category.id;
      }

      const created = await prisma.recipe.create({
        data: {
          ...(sourceId !== undefined &&
          !(await prisma.recipe.findUnique({
            where: { githubId: sourceId },
          }))
            ? { githubId: sourceId }
            : {}),

          title,
          slug,
          description:
            typeof recipe.description === "string"
              ? recipe.description
              : undefined,

          image: imageUrl(recipe.image),
          imagePath:
            typeof recipe.image === "string"
              ? recipe.image
              : undefined,

          time:
            typeof recipe.time === "string"
              ? recipe.time
              : undefined,

          difficulty:
            typeof recipe.difficulty === "string"
              ? recipe.difficulty
              : undefined,

          categoryId,

          servingSuggestions:
            recipe.servingSuggestions ?? undefined,

          chefTips:
            recipe.chefTips ?? undefined,
        },
      });

      // Import ingredients.
      if (Array.isArray(recipe.ingredients)) {
        for (let sectionIndex = 0; sectionIndex < recipe.ingredients.length; sectionIndex++) {
          const section = recipe.ingredients[sectionIndex];

          if (!section || typeof section !== "object") {
            continue;
          }

          const sectionTitle =
            typeof section.title === "string"
              ? section.title
              : `Ingredients ${sectionIndex + 1}`;

          const ingredientSection =
            await prisma.ingredientSection.create({
              data: {
                title: sectionTitle,
                position: sectionIndex,
                recipeId: created.id,
              },
            });

          if (Array.isArray(section.items)) {
            for (
              let itemIndex = 0;
              itemIndex < section.items.length;
              itemIndex++
            ) {
              const item = section.items[itemIndex];

              if (typeof item !== "string") {
                continue;
              }

              await prisma.ingredientItem.create({
                data: {
                  text: item,
                  position: itemIndex,
                  sectionId: ingredientSection.id,
                },
              });
            }
          }
        }
      }

      // Import instructions.
      if (Array.isArray(recipe.instruction)) {
        for (
          let sectionIndex = 0;
          sectionIndex < recipe.instruction.length;
          sectionIndex++
        ) {
          const section = recipe.instruction[sectionIndex];

          if (!section || typeof section !== "object") {
            continue;
          }

          const sectionTitle =
            typeof section.title === "string"
              ? section.title
              : `Instructions ${sectionIndex + 1}`;

          const instructionSection =
            await prisma.instructionSection.create({
              data: {
                title: sectionTitle,
                position: sectionIndex,
                recipeId: created.id,
              },
            });

          if (Array.isArray(section.steps)) {
            for (
              let stepIndex = 0;
              stepIndex < section.steps.length;
              stepIndex++
            ) {
              const step = section.steps[stepIndex];

              if (typeof step !== "string") {
                continue;
              }

              await prisma.instructionStep.create({
                data: {
                  text: step,
                  position: stepIndex,
                  sectionId: instructionSection.id,
                },
              });
            }
          }
        }
      }

      imported++;

      console.log(`Imported: ${title}`);
    } catch (error) {
      console.error(`Failed: ${file}`);
      console.error(error);
      skipped++;
    }
  }

  console.log("");
  console.log("Import complete!");
  console.log(`Imported: ${imported}`);
  console.log(`Skipped: ${skipped}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
