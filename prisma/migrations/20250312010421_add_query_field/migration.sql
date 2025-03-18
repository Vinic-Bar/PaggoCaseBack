-- CreateTable
CREATE TABLE "Query" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "query" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    CONSTRAINT "Query_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
