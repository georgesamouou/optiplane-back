-- AlterTable
ALTER TABLE "Project" ADD COLUMN "decisionId" INTEGER;

-- CreateTable
CREATE TABLE "Decision" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "decision" TEXT NOT NULL,
    "comments" TEXT,
    "action" TEXT,
    "projectId" INTEGER NOT NULL,
    CONSTRAINT "Decision_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Decision_projectId_key" ON "Decision"("projectId");
