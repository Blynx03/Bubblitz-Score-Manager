/*
  Warnings:

  - The values [ONE_TIME,INACTIVE] on the enum `PlayStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Score` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PlayStatus_new" AS ENUM ('NEW', 'ACTIVE');
ALTER TABLE "User" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "status" TYPE "PlayStatus_new" USING ("status"::text::"PlayStatus_new");
ALTER TYPE "PlayStatus" RENAME TO "PlayStatus_old";
ALTER TYPE "PlayStatus_new" RENAME TO "PlayStatus";
DROP TYPE "PlayStatus_old";
ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'NEW';

-- DropTable
DROP TABLE "Score";

-- CreateTable
CREATE TABLE "Scores" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "time" INTEGER NOT NULL,
    "qualified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scores_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Scores" ADD CONSTRAINT "Scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
