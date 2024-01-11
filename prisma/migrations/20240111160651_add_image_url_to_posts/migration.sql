-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "profession" TEXT;
