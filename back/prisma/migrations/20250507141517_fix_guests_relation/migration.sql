/*
  Warnings:

  - You are about to drop the column `guests` on the `Project` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "ProjectGuest" (
    "projectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    PRIMARY KEY ("projectId", "userId"),
    CONSTRAINT "ProjectGuest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProjectGuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_GuestProjects" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_GuestProjects_A_fkey" FOREIGN KEY ("A") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GuestProjects_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "title" TEXT NOT NULL,
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
    "createdById" INTEGER NOT NULL,
    "sessionId" INTEGER,
    "decisionId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sharepoint" TEXT,
    "modeTraitement" TEXT NOT NULL,
    "natureProjet" TEXT NOT NULL,
    "optionTTM" TEXT NOT NULL,
    "jalonTTM" TEXT NOT NULL,
    "prioriteStrategique" TEXT NOT NULL,
    "objectifStrategique" TEXT NOT NULL,
    CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Project_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("code", "createdAt", "createdById", "dateSouhaite", "decisionId", "description", "direction", "endDate", "id", "jalonTTM", "kpi", "modeGouvernance", "modeTraitement", "natureProjet", "nom", "objectifStrategique", "optionTTM", "prioriteStrategique", "sessionId", "sharepoint", "startDate", "state", "title", "type") SELECT "code", "createdAt", "createdById", "dateSouhaite", "decisionId", "description", "direction", "endDate", "id", "jalonTTM", "kpi", "modeGouvernance", "modeTraitement", "natureProjet", "nom", "objectifStrategique", "optionTTM", "prioriteStrategique", "sessionId", "sharepoint", "startDate", "state", "title", "type" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_GuestProjects_AB_unique" ON "_GuestProjects"("A", "B");

-- CreateIndex
CREATE INDEX "_GuestProjects_B_index" ON "_GuestProjects"("B");
