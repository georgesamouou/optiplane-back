-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "date_creation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_souhaite" DATETIME,
    "direction" TEXT NOT NULL,
    "kpl" TEXT NOT NULL,
    "mode_gouvernance" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'INITIATION',
    "type" TEXT NOT NULL,
    "createdById" INTEGER NOT NULL,
    "sessionId" INTEGER,
    CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Project_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "titre" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "lieu" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "agendaId" INTEGER,
    CONSTRAINT "Session_agendaId_fkey" FOREIGN KEY ("agendaId") REFERENCES "Agenda" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Agenda" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
