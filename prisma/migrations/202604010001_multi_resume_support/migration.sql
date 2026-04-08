ALTER TABLE "Resume"
ADD COLUMN "title" TEXT NOT NULL DEFAULT 'General Resume',
ADD COLUMN "targetRole" TEXT;

DROP INDEX IF EXISTS "Resume_userId_key";

CREATE INDEX "Resume_userId_idx" ON "Resume"("userId");
