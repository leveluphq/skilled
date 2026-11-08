CREATE FUNCTION public."set_current_timestamp_updatedAt"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updatedAt" = NOW();
  RETURN _new;
END;
$$;
CREATE FUNCTION public.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;
CREATE TABLE public.affiliate_link_clicks (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "affiliateUserId" text,
    ip text NOT NULL,
    "referralUrl" text NOT NULL,
    "affiliateIdUsed" text NOT NULL,
    "destinationPagePath" text NOT NULL
);
CREATE TABLE public.affiliate_payouts (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "affiliateUserId" text NOT NULL,
    amount numeric NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL
);
CREATE TABLE public.alternate_emails (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    email text NOT NULL,
    "userId" text NOT NULL,
    source text NOT NULL
);
CREATE TABLE public.categories (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "position" integer NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    video text NOT NULL,
    "previewVideo" text NOT NULL
);
CREATE TABLE public.checkout_event_log (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "userId" text NOT NULL
);
CREATE TABLE public.lessons (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "position" integer,
    title text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    "accessLevel" text DEFAULT 'SUBSCRIPTION'::text NOT NULL,
    "categoryId" uuid NOT NULL,
    difficulty text,
    "introductionVideoUrl" text,
    "solutionVideoUrl" text,
    type text DEFAULT 'QUESTION'::text NOT NULL,
    "metaTitle" text,
    "metaDescription" text
);
COMMENT ON COLUMN public.lessons."position" IS 'The position (asc) that the item should appear in the course. If null, it should not be listed in the course table of contents.';
CREATE TABLE public.related_lessons (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "categoryId" uuid NOT NULL,
    "lessonId" uuid NOT NULL
);
CREATE TABLE public.sales (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "refundedAt" timestamp with time zone,
    "payingUserId" text NOT NULL,
    "affiliateUserId" text,
    status text NOT NULL,
    amount numeric NOT NULL,
    "affiliateAmountEarned" numeric,
    "affiliateLinkClickId" uuid,
    "affiliatePayoutId" uuid,
    "affiliatePayoutStatus" text,
    coupon text,
    "discountAmount" text,
    "discountType" text,
    "originalPrice" numeric NOT NULL,
    "paymentProcessor" text NOT NULL,
    "amountRefunded" numeric,
    "transactionObject" jsonb NOT NULL,
    "stripeSessionId" text
);
CREATE TABLE public.subscriptions (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "endsAt" timestamp with time zone NOT NULL,
    "originalEndsAt" timestamp with time zone NOT NULL,
    "saleId" uuid NOT NULL,
    "userId" text NOT NULL,
    status text NOT NULL,
    "planDays" integer NOT NULL,
    "planTier" text NOT NULL,
    "planTerms" text NOT NULL
);
CREATE TABLE public.user_feedback (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    feedback text NOT NULL,
    ip text NOT NULL,
    url text NOT NULL,
    name text,
    email text,
    "userId" text
);
CREATE TABLE public.users (
    id text DEFAULT public.gen_random_uuid() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp with time zone,
    email text NOT NULL,
    name text,
    username text,
    location text,
    company text,
    image text,
    bio text,
    website text,
    "preferredCodingLanguage" text DEFAULT 'JAVASCRIPT'::text NOT NULL,
    "registrationSource" text NOT NULL,
    "githubAccessToken" text,
    "githubId" integer,
    "githubNodeId" text,
    "githubUsername" text,
    "affiliateId" text,
    "affiliateRevenueShare" numeric,
    "githubProfile" jsonb,
    role text DEFAULT 'user'::text NOT NULL,
    theme text DEFAULT 'DARK'::text NOT NULL,
    "stripeCustomerId" text,
    "activeLessonId" uuid,
    "gitconnectedUsername" text,
    "firstName" text,
    "middleName" text,
    "lastName" text,
    "nameFormat" text,
    "shortName" text,
    "facebookId" text,
    "facebookProfile" jsonb,
    "facebookAccessToken" text,
    "googleRefreshToken" text,
    "googleAccessToken" text,
    "googleTokenType" text,
    "googleIdToken" text,
    "googleProfile" jsonb,
    "googleEmailVerified" boolean,
    locale text,
    "googleId" text,
    "googleTokenExpiryDate" text
);
CREATE TABLE public.users_lessons_status (
    "userId" text NOT NULL,
    "lessonId" uuid NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    status text NOT NULL,
    "validationStepsViewed" integer DEFAULT 0 NOT NULL,
    "explanationStepsViewed" integer DEFAULT 0 NOT NULL,
    confidence integer DEFAULT 0
);
ALTER TABLE ONLY public.affiliate_link_clicks
    ADD CONSTRAINT affiliate_link_clicks_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.affiliate_payouts
    ADD CONSTRAINT affiliate_payouts_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.alternate_emails
    ADD CONSTRAINT alternate_emails_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.alternate_emails
    ADD CONSTRAINT "alternate_emails_userId_email_key" UNIQUE ("userId", email);
ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_position_key UNIQUE ("position");
ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.checkout_event_log
    ADD CONSTRAINT checkout_event_log_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_position_key UNIQUE ("position");
ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.related_lessons
    ADD CONSTRAINT related_lessons_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_affiliateId_key" UNIQUE ("affiliateId");
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_facebookId_key" UNIQUE ("facebookId");
ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_githubNodeId_key" UNIQUE ("githubNodeId");
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_id_key UNIQUE (id);
ALTER TABLE ONLY public.users_lessons_status
    ADD CONSTRAINT users_lessons_status_pkey PRIMARY KEY ("userId", "lessonId");
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_stripeCustomerId_key" UNIQUE ("stripeCustomerId");
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);
CREATE TRIGGER "set_public_affiliate_link_clicks_updatedAt" BEFORE UPDATE ON public.affiliate_link_clicks FOR EACH ROW EXECUTE PROCEDURE public."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_affiliate_link_clicks_updatedAt" ON public.affiliate_link_clicks IS 'trigger to set value of column "updatedAt" to current timestamp on row update';
CREATE TRIGGER "set_public_affiliate_payouts_updatedAt" BEFORE UPDATE ON public.affiliate_payouts FOR EACH ROW EXECUTE PROCEDURE public."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_affiliate_payouts_updatedAt" ON public.affiliate_payouts IS 'trigger to set value of column "updatedAt" to current timestamp on row update';
CREATE TRIGGER "set_public_alternate_emails_updatedAt" BEFORE UPDATE ON public.alternate_emails FOR EACH ROW EXECUTE PROCEDURE public."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_alternate_emails_updatedAt" ON public.alternate_emails IS 'trigger to set value of column "updatedAt" to current timestamp on row update';
CREATE TRIGGER "set_public_categories_updatedAt" BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE PROCEDURE public."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_categories_updatedAt" ON public.categories IS 'trigger to set value of column "updatedAt" to current timestamp on row update';
CREATE TRIGGER "set_public_checkout_event_log_updatedAt" BEFORE UPDATE ON public.checkout_event_log FOR EACH ROW EXECUTE PROCEDURE public."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_checkout_event_log_updatedAt" ON public.checkout_event_log IS 'trigger to set value of column "updatedAt" to current timestamp on row update';
CREATE TRIGGER "set_public_lessons_updatedAt" BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE PROCEDURE public."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_lessons_updatedAt" ON public.lessons IS 'trigger to set value of column "updatedAt" to current timestamp on row update';
CREATE TRIGGER "set_public_payments_updatedAt" BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE PROCEDURE public."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_payments_updatedAt" ON public.sales IS 'trigger to set value of column "updatedAt" to current timestamp on row update';
CREATE TRIGGER "set_public_related_lessons_updatedAt" BEFORE UPDATE ON public.related_lessons FOR EACH ROW EXECUTE PROCEDURE public."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_related_lessons_updatedAt" ON public.related_lessons IS 'trigger to set value of column "updatedAt" to current timestamp on row update';
CREATE TRIGGER "set_public_subscriptions_updatedAt" BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE PROCEDURE public."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_subscriptions_updatedAt" ON public.subscriptions IS 'trigger to set value of column "updatedAt" to current timestamp on row update';
CREATE TRIGGER "set_public_user_feedback_updatedAt" BEFORE UPDATE ON public.user_feedback FOR EACH ROW EXECUTE PROCEDURE public."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_user_feedback_updatedAt" ON public.user_feedback IS 'trigger to set value of column "updatedAt" to current timestamp on row update';
CREATE TRIGGER "set_public_users_lessons_status_updatedAt" BEFORE UPDATE ON public.users_lessons_status FOR EACH ROW EXECUTE PROCEDURE public."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_users_lessons_status_updatedAt" ON public.users_lessons_status IS 'trigger to set value of column "updatedAt" to current timestamp on row update';
CREATE TRIGGER "set_public_users_updatedAt" BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE public."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_users_updatedAt" ON public.users IS 'trigger to set value of column "updatedAt" to current timestamp on row update';
ALTER TABLE ONLY public.affiliate_link_clicks
    ADD CONSTRAINT "affiliate_link_clicks_affiliateUserId_fkey" FOREIGN KEY ("affiliateUserId") REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.affiliate_payouts
    ADD CONSTRAINT "affiliate_payouts_affiliateUserId_fkey" FOREIGN KEY ("affiliateUserId") REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.alternate_emails
    ADD CONSTRAINT "alternate_emails_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT "lessons_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.related_lessons
    ADD CONSTRAINT "related_lessons_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.related_lessons
    ADD CONSTRAINT "related_lessons_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public.lessons(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.sales
    ADD CONSTRAINT "sales_affiliateLinkClickId_fkey" FOREIGN KEY ("affiliateLinkClickId") REFERENCES public.affiliate_link_clicks(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.sales
    ADD CONSTRAINT "sales_affiliatePayoutId_fkey" FOREIGN KEY ("affiliatePayoutId") REFERENCES public.affiliate_payouts(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.sales
    ADD CONSTRAINT "sales_affiliateUserId_fkey" FOREIGN KEY ("affiliateUserId") REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.sales
    ADD CONSTRAINT "sales_payingUserId_fkey" FOREIGN KEY ("payingUserId") REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public.sales(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT "user_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_activeLessonId_fkey" FOREIGN KEY ("activeLessonId") REFERENCES public.lessons(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.users_lessons_status
    ADD CONSTRAINT "users_lessons_status_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public.lessons(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.users_lessons_status
    ADD CONSTRAINT "users_lessons_status_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
