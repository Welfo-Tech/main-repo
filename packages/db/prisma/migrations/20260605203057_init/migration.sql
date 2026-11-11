-- CreateTable
CREATE TABLE "setup_test" (
    "id" UUID NOT NULL,
    "note" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "setup_test_pkey" PRIMARY KEY ("id")
);
