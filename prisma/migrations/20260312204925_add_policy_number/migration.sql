/*
  Warnings:

  - A unique constraint covering the columns `[policyNumber]` on the table `Sale` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accidentLimit` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `breakdownLimit` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `compatibleVehicles` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalLimit` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `towingLimit` to the `Package` table without a default value. This is not possible if the table is not empty.
  - The required column `policyNumber` was added to the `Sale` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "accidentLimit" TEXT NOT NULL,
ADD COLUMN     "ageLimit" TEXT NOT NULL DEFAULT 'Yaş sınırı yoktur',
ADD COLUMN     "breakdownLimit" TEXT NOT NULL,
ADD COLUMN     "compatibleVehicles" TEXT NOT NULL,
ADD COLUMN     "replacementCar" TEXT,
ADD COLUMN     "serviceType" TEXT NOT NULL DEFAULT 'EN YAKIN TAMİRHANE',
ADD COLUMN     "totalLimit" TEXT NOT NULL,
ADD COLUMN     "towingLimit" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "policyNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Sale_policyNumber_key" ON "Sale"("policyNumber");
