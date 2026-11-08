CREATE OR REPLACE VIEW "public"."affiliate_referral_click_counts" AS
SELECT "affiliateUserId", "referralUrl", COUNT(*), MAX("createdAt") as "mostRecentDate" FROM affiliate_link_clicks GROUP BY "affiliateUserId", "referralUrl";
