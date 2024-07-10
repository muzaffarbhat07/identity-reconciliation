/*
  Warnings:

  - Added the required column `linkPrecedence` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LinkPrecedence" AS ENUM ('primary', 'secondary');

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "linkPrecedence",
ADD COLUMN     "linkPrecedence" "LinkPrecedence" NOT NULL;
