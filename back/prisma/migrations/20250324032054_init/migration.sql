/*
  Warnings:

  - You are about to drop the column `date_creation` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `date_fin` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `date_souhaite` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `jalon_ttm` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `kpl` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `mode_gouvernance` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `mode_traitement` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `nature_projet` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `objectif_strategique` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `option_ttm` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `priorite_strategique` on the `Project` table. All the data in the column will be lost.
  - Added the required column `jalonTTM` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modeGouvernance` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modeTraitement` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `natureProjet` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `objectifStrategique` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `optionTTM` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prioriteStrategique` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "dateCreation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateSouhaite" DATETIME,
    "dateFin" DATETIME,
    "direction" TEXT NOT NULL,
    "kpi" TEXT NOT NULL DEFAULT '[]',
    "modeGouvernance" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'INITIATION',
    "type" TEXT NOT NULL,
    "autre" TEXT,
    "guests" TEXT NOT NULL DEFAULT '[]',
    "sharepoint" TEXT,
    "modeTraitement" TEXT NOT NULL,
    "natureProjet" TEXT NOT NULL,
    "optionTTM" TEXT NOT NULL,
    "jalonTTM" TEXT NOT NULL,
    "prioriteStrategique" TEXT NOT NULL,
    "objectifStrategique" TEXT NOT NULL,
    "createdById" INTEGER NOT NULL,
    "sessionId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Project_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("autre", "code", "createdAt", "createdById", "description", "direction", "guests", "id", "nom", "sessionId", "sharepoint", "state", "type") SELECT "autre", "code", "createdAt", "createdById", "description", "direction", "guests", "id", "nom", "sessionId", "sharepoint", "state", "type" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
