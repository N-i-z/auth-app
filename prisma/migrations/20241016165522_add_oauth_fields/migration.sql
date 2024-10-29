/*
  Warnings:

  - A unique constraint covering the columns `[oauthId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_oauthId_key" ON "User"("oauthId");
