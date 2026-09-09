-- Correção de incidente: essas colunas estavam no schema.prisma mas nunca
-- tiveram migration criada — causava 500 em toda visualização de cartão
-- em produção (Prisma tentava selecionar Lojista.instagram, inexistente).
ALTER TABLE "Lojista" ADD COLUMN IF NOT EXISTS "instagram" TEXT;
ALTER TABLE "Lojista" ADD COLUMN IF NOT EXISTS "site" TEXT;
ALTER TABLE "Lojista" ADD COLUMN IF NOT EXISTS "linksExtra" JSONB;
