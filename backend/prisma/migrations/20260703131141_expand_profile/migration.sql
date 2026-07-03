-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "about_me" TEXT,
ADD COLUMN     "career_objective" TEXT,
ADD COLUMN     "degree" TEXT,
ADD COLUMN     "graduation_year" TEXT,
ADD COLUMN     "interested_domains" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "location" TEXT,
ADD COLUMN     "portfolio" TEXT,
ADD COLUMN     "target_role" TEXT,
ADD COLUMN     "username" TEXT;
