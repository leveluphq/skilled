CREATE OR REPLACE VIEW "public"."affiliate_sales" AS
SELECT 
    "id",
    "createdAt",
    "updatedAt",
    "affiliateUserId",
    "amountPaid",
    "affiliateAmountEarned",
    "type"
FROM sales WHERE "refundedAt" IS NULL AND status = 'PAID' AND "affiliateUserId" IS NOT NULL;
