/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Contact` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt";
