-- Give tickets a real foreign key to products.
--
-- The productId column, the API schema and createTicket/updateTicket all
-- already carry a product, but the Prisma relation was never declared, so
-- every ticket query that selected product threw at runtime. This adds the
-- missing constraint. SET NULL mirrors the nullable contactId: deleting a
-- product detaches it from past tickets rather than blocking the delete.

ALTER TABLE "tickets" ADD CONSTRAINT "tickets_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "tickets_productId_idx" ON "tickets"("productId");
