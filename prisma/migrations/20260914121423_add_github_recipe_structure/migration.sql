/*
  Warnings:

  - You are about to drop the column `ingredients` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the column `instructions` on the `Recipe` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[githubId]` on the table `Recipe` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "ingredients",
DROP COLUMN "instructions",
ADD COLUMN     "chefTips" JSONB,
ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "githubId" INTEGER,
ADD COLUMN     "imagePath" TEXT,
ADD COLUMN     "servingSuggestions" JSONB,
ADD COLUMN     "time" TEXT;

-- CreateTable
CREATE TABLE "IngredientSection" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "recipeId" INTEGER NOT NULL,

    CONSTRAINT "IngredientSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientItem" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "sectionId" INTEGER NOT NULL,

    CONSTRAINT "IngredientItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstructionSection" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "recipeId" INTEGER NOT NULL,

    CONSTRAINT "InstructionSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstructionStep" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "sectionId" INTEGER NOT NULL,

    CONSTRAINT "InstructionStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IngredientSection_recipeId_idx" ON "IngredientSection"("recipeId");

-- CreateIndex
CREATE INDEX "IngredientItem_sectionId_idx" ON "IngredientItem"("sectionId");

-- CreateIndex
CREATE INDEX "InstructionSection_recipeId_idx" ON "InstructionSection"("recipeId");

-- CreateIndex
CREATE INDEX "InstructionStep_sectionId_idx" ON "InstructionStep"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_githubId_key" ON "Recipe"("githubId");

-- AddForeignKey
ALTER TABLE "IngredientSection" ADD CONSTRAINT "IngredientSection_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientItem" ADD CONSTRAINT "IngredientItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "IngredientSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructionSection" ADD CONSTRAINT "InstructionSection_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructionStep" ADD CONSTRAINT "InstructionStep_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "InstructionSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
