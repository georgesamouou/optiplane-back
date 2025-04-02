/*
  Warnings:

  - Added the required column `code` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jalon_ttm` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mode_traitement` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nature_projet` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `objectif_strategique` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `option_ttm` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priorite_strategique` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "date_creation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_souhaite" DATETIME,
    "date_fin" DATETIME,
    "direction" TEXT NOT NULL,
    "kpl" TEXT NOT NULL DEFAULT '[]',
    "mode_gouvernance" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'INITIATION',
    "type" TEXT NOT NULL,
    "autre" TEXT,
    "guests" TEXT NOT NULL DEFAULT '[]',
    "sharepoint" TEXT,
    "mode_traitement" TEXT NOT NULL,
    "nature_projet" TEXT NOT NULL,
    "option_ttm" TEXT NOT NULL,
    "jalon_ttm" TEXT NOT NULL,
    "priorite_strategique" TEXT NOT NULL,
    "objectif_strategique" TEXT NOT NULL,
    "createdById" INTEGER NOT NULL,
    "sessionId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Project_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("createdById", "date_creation", "date_souhaite", "direction", "id", "kpl", "mode_gouvernance", "nom", "sessionId", "state", "type") SELECT "createdById", "date_creation", "date_souhaite", "direction", "id", "kpl", "mode_gouvernance", "nom", "sessionId", "state", "type" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
