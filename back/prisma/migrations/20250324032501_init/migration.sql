/*
  Warnings:

  - You are about to drop the column `dateCreation` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `dateFin` on the `Project` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "dateSouhaite" DATETIME,
    "endDate" DATETIME,
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
INSERT INTO "new_Project" ("autre", "code", "createdAt", "createdById", "dateSouhaite", "description", "direction", "guests", "id", "jalonTTM", "kpi", "modeGouvernance", "modeTraitement", "natureProjet", "nom", "objectifStrategique", "optionTTM", "prioriteStrategique", "sessionId", "sharepoint", "state", "type") SELECT "autre", "code", "createdAt", "createdById", "dateSouhaite", "description", "direction", "guests", "id", "jalonTTM", "kpi", "modeGouvernance", "modeTraitement", "natureProjet", "nom", "objectifStrategique", "optionTTM", "prioriteStrategique", "sessionId", "sharepoint", "state", "type" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
