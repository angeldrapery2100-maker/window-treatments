--
-- PostgreSQL database dump
--

\restrict H6dRAvXP4wg0woBztJZKw6vBpL6VdRaOLg8DShpHKbEmLGx5hsUbRgZTyrwLcgD

-- Dumped from database version 14.20 (Homebrew)
-- Dumped by pg_dump version 14.20 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    action character varying(64) NOT NULL,
    actor_id uuid,
    actor_email character varying(256),
    target_type character varying(64),
    target_id character varying(256),
    before jsonb,
    after jsonb,
    ip character varying(64),
    note text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: discount_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.discount_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(64) NOT NULL,
    description character varying(256) DEFAULT ''::character varying,
    discount_type character varying(16) DEFAULT 'percent'::character varying NOT NULL,
    discount_value numeric(10,2) DEFAULT 0 NOT NULL,
    min_order numeric(10,2) DEFAULT 0,
    max_uses integer,
    used_count integer DEFAULT 0,
    starts_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: gallery_video_meta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gallery_video_meta (
    id integer NOT NULL,
    video_id integer NOT NULL,
    title text,
    location text,
    tag text,
    description text,
    updated_at timestamp with time zone DEFAULT now(),
    is_published boolean DEFAULT true
);


--
-- Name: gallery_video_meta_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gallery_video_meta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gallery_video_meta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gallery_video_meta_id_seq OWNED BY public.gallery_video_meta.id;


--
-- Name: login_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.login_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    identifier character varying(256) NOT NULL,
    ip character varying(64),
    success boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: order_shipments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_shipments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    item_indices integer[] DEFAULT '{}'::integer[] NOT NULL,
    parcel_length numeric,
    parcel_width numeric,
    parcel_height numeric,
    parcel_weight numeric,
    tracking_number character varying(128),
    tracking_url text,
    label_url text,
    carrier character varying(64),
    service character varying(128),
    shippo_transaction_id character varying(256),
    status character varying(32) DEFAULT 'pending'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    item_quantities jsonb DEFAULT '{}'::jsonb
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_number character varying(32) NOT NULL,
    status character varying(32) DEFAULT 'pending'::character varying NOT NULL,
    customer_name character varying(256) NOT NULL,
    customer_email character varying(256) NOT NULL,
    customer_phone character varying(64) DEFAULT ''::character varying,
    shipping_address jsonb DEFAULT '{}'::jsonb,
    items jsonb DEFAULT '[]'::jsonb NOT NULL,
    subtotal numeric(10,2) DEFAULT 0 NOT NULL,
    discount_code character varying(64) DEFAULT NULL::character varying,
    discount_type character varying(16) DEFAULT NULL::character varying,
    discount_value numeric(10,2) DEFAULT 0,
    discount_amount numeric(10,2) DEFAULT 0,
    total numeric(10,2) DEFAULT 0 NOT NULL,
    notes text DEFAULT ''::text,
    admin_notes text DEFAULT ''::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    user_id uuid,
    payment_intent_id character varying(256) DEFAULT NULL::character varying,
    payment_status character varying(32) DEFAULT 'unpaid'::character varying,
    shipping_cost numeric(10,2) DEFAULT 0,
    shipping_method character varying(256) DEFAULT NULL::character varying,
    shipping_rate_id character varying(256) DEFAULT NULL::character varying,
    shipping_label_url text,
    tracking_number character varying(128) DEFAULT NULL::character varying,
    tracking_url text,
    shipping_carrier character varying(64) DEFAULT NULL::character varying,
    shippo_transaction_id character varying(256) DEFAULT NULL::character varying,
    tax_rate numeric(6,4) DEFAULT 0,
    tax_amount numeric(10,2) DEFAULT 0,
    tax_source character varying(16) DEFAULT 'local'::character varying
);


--
-- Name: pricing_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pricing_configs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_type_id uuid NOT NULL,
    version integer NOT NULL,
    formula jsonb DEFAULT '{}'::jsonb NOT NULL,
    variables jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: product_parcel_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_parcel_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    rule_name character varying(128) DEFAULT ''::character varying,
    min_width numeric(10,2) DEFAULT 0,
    max_width numeric(10,2) DEFAULT 999,
    min_height numeric(10,2) DEFAULT 0,
    max_height numeric(10,2) DEFAULT 999,
    parcel_length numeric(10,2) DEFAULT 20 NOT NULL,
    parcel_width numeric(10,2) DEFAULT 15 NOT NULL,
    parcel_height numeric(10,2) DEFAULT 5 NOT NULL,
    parcel_weight numeric(10,2) DEFAULT 3 NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: product_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug character varying(128) NOT NULL,
    name character varying(256) NOT NULL,
    description text,
    field_schema jsonb DEFAULT '{}'::jsonb NOT NULL,
    production_schema jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_type_id uuid NOT NULL,
    sku character varying(64) NOT NULL,
    name character varying(256) NOT NULL,
    base_price numeric(10,2) DEFAULT 0 NOT NULL,
    images jsonb DEFAULT '[]'::jsonb,
    default_config jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    store_category_id uuid
);


--
-- Name: settings_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    setting_key character varying(256) NOT NULL,
    old_value text,
    new_value text,
    actor_email character varying(256),
    changed_at timestamp with time zone DEFAULT now()
);


--
-- Name: showcase_product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.showcase_product_images (
    id integer NOT NULL,
    product_id integer NOT NULL,
    image_url text NOT NULL,
    image_width integer DEFAULT 0,
    image_height integer DEFAULT 0,
    image_fit character varying(32) DEFAULT 'cover'::character varying,
    caption text DEFAULT ''::text,
    image_type character varying(32) DEFAULT 'thumb'::character varying,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: showcase_product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.showcase_product_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: showcase_product_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.showcase_product_images_id_seq OWNED BY public.showcase_product_images.id;


--
-- Name: showcase_product_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.showcase_product_sections (
    id integer NOT NULL,
    product_id integer NOT NULL,
    title character varying(256) DEFAULT ''::character varying,
    description text DEFAULT ''::text,
    image_url text DEFAULT ''::text,
    image_width integer DEFAULT 0,
    image_height integer DEFAULT 0,
    image_fit character varying(32) DEFAULT 'cover'::character varying,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: showcase_product_sections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.showcase_product_sections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: showcase_product_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.showcase_product_sections_id_seq OWNED BY public.showcase_product_sections.id;


--
-- Name: showcase_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.showcase_products (
    id integer NOT NULL,
    name character varying(256) NOT NULL,
    slug character varying(256),
    description text DEFAULT ''::text,
    long_description text DEFAULT ''::text,
    features jsonb DEFAULT '[]'::jsonb,
    cover_image text DEFAULT ''::text,
    cover_width integer DEFAULT 0,
    cover_height integer DEFAULT 0,
    cover_fit character varying(32) DEFAULT 'cover'::character varying,
    status character varying(32) DEFAULT 'active'::character varying,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    source character varying(32) DEFAULT 'cms'::character varying,
    href text DEFAULT ''::text,
    category character varying(64) DEFAULT ''::character varying
);


--
-- Name: showcase_products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.showcase_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: showcase_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.showcase_products_id_seq OWNED BY public.showcase_products.id;


--
-- Name: site_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page character varying(64) NOT NULL,
    section character varying(128) NOT NULL,
    field_key character varying(128) NOT NULL,
    field_type character varying(32) DEFAULT 'text'::character varying NOT NULL,
    content text DEFAULT ''::text,
    image_url text DEFAULT ''::text,
    image_width integer DEFAULT 0,
    image_height integer DEFAULT 0,
    image_fit character varying(32) DEFAULT 'cover'::character varying,
    sort_order integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_published boolean DEFAULT true
);


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    key text NOT NULL,
    value text NOT NULL
);


--
-- Name: store_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.store_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(256) NOT NULL,
    slug character varying(128) NOT NULL,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(256) NOT NULL,
    password_hash character varying(256) NOT NULL,
    name character varying(256) DEFAULT ''::character varying NOT NULL,
    phone character varying(64) DEFAULT ''::character varying,
    shipping_address jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    role character varying(32) DEFAULT 'customer'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: work_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    version integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by character varying(128) DEFAULT 'admin'::character varying,
    notes text DEFAULT ''::text
);


--
-- Name: gallery_video_meta id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_video_meta ALTER COLUMN id SET DEFAULT nextval('public.gallery_video_meta_id_seq'::regclass);


--
-- Name: showcase_product_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.showcase_product_images ALTER COLUMN id SET DEFAULT nextval('public.showcase_product_images_id_seq'::regclass);


--
-- Name: showcase_product_sections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.showcase_product_sections ALTER COLUMN id SET DEFAULT nextval('public.showcase_product_sections_id_seq'::regclass);


--
-- Name: showcase_products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.showcase_products ALTER COLUMN id SET DEFAULT nextval('public.showcase_products_id_seq'::regclass);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, action, actor_id, actor_email, target_type, target_id, before, after, ip, note, created_at) FROM stdin;
569347b8-83e0-4e41-8e42-2eaa435131e6	auth.login_failed	\N	ghsot5566ac@gmail.com	\N	\N	\N	\N	::1	Invalid email or password	2026-03-09 18:15:53.617606-07
438c07ab-1cd8-4854-9846-2f4b1a13df3b	auth.login	d7188e9a-f07c-4b83-aac2-f98e09a8d3b1	ghost5566ac@gmail.com	\N	\N	\N	\N	::1	\N	2026-03-09 18:16:18.657018-07
93359a35-348d-42ae-8d5b-5d369525bd1b	settings.updated	d7188e9a-f07c-4b83-aac2-f98e09a8d3b1	ghost5566ac@gmail.com	site_settings	online_store_enabled	{"value": "false"}	{"value": "true"}	\N	\N	2026-03-09 18:28:45.658862-07
3ffdddb6-9b9b-40bd-9d82-e0fdb17409da	settings.updated	d7188e9a-f07c-4b83-aac2-f98e09a8d3b1	ghost5566ac@gmail.com	site_settings	online_store_enabled	{"value": "true"}	{"value": "false"}	\N	\N	2026-03-09 18:28:50.41835-07
735b57bb-1b64-4bf7-a96c-70a25690369a	settings.updated	d7188e9a-f07c-4b83-aac2-f98e09a8d3b1	ghost5566ac@gmail.com	site_settings	online_store_enabled	{"value": "false"}	{"value": "true"}	\N	\N	2026-03-09 18:28:52.355229-07
aec14c00-234f-4993-b6f5-0419b28ef028	settings.updated	d7188e9a-f07c-4b83-aac2-f98e09a8d3b1	ghost5566ac@gmail.com	site_settings	online_store_enabled	{"value": "true"}	{"value": "false"}	\N	\N	2026-03-09 18:29:57.64735-07
ea33bf3d-987d-4e45-a660-89ec190ea7b3	settings.updated	d7188e9a-f07c-4b83-aac2-f98e09a8d3b1	ghost5566ac@gmail.com	site_settings	online_store_enabled	{"value": "false"}	{"value": "true"}	\N	\N	2026-03-09 18:30:31.412441-07
080c7b40-594d-40c3-8aaa-ec2e28644683	settings.updated	d7188e9a-f07c-4b83-aac2-f98e09a8d3b1	ghost5566ac@gmail.com	site_settings	online_store_enabled	{"value": "true"}	{"value": "false"}	\N	\N	2026-03-09 18:33:58.340272-07
812f2d7c-4eae-4af9-911c-20c77e48edf6	settings.updated	d7188e9a-f07c-4b83-aac2-f98e09a8d3b1	ghost5566ac@gmail.com	site_settings	online_store_enabled	{"value": "false"}	{"value": "true"}	\N	\N	2026-03-09 23:51:58.416084-07
df573766-8e09-4fae-ad41-9e6803ed0f9b	auth.logout	d7188e9a-f07c-4b83-aac2-f98e09a8d3b1	ghost5566ac@gmail.com	\N	\N	\N	\N	::1	\N	2026-03-09 23:58:29.644029-07
fbff99ff-6aa6-44b7-9509-81fd61ef724b	auth.login	d7188e9a-f07c-4b83-aac2-f98e09a8d3b1	ghost5566ac@gmail.com	\N	\N	\N	\N	::1	\N	2026-03-09 23:58:34.404472-07
e48af50a-5b19-426b-8cab-f58f9c4d0558	auth.logout	d7188e9a-f07c-4b83-aac2-f98e09a8d3b1	ghost5566ac@gmail.com	\N	\N	\N	\N	::1	\N	2026-03-10 00:00:12.533733-07
5cc57e90-8e3a-475c-9c19-68c761d454f9	auth.login	d7188e9a-f07c-4b83-aac2-f98e09a8d3b1	ghost5566ac@gmail.com	\N	\N	\N	\N	::1	\N	2026-03-10 00:02:29.657422-07
\.


--
-- Data for Name: discount_codes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.discount_codes (id, code, description, discount_type, discount_value, min_order, max_uses, used_count, starts_at, expires_at, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: gallery_video_meta; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gallery_video_meta (id, video_id, title, location, tag, description, updated_at, is_published) FROM stdin;
1	1	Hunter Douglas Luminette 	Beveryly Hills, CA	Luminette,PowerView,Motorized,Smart Shades,HomeKit,Integration	The Hunter Douglas Luminette Privacy Sheer is a motorized vertical shading system that combines the softness of sheer drapery with the precise light control of a blind. Fabric vanes — suspended from a sheer backing — rotate 180° to transition seamlessly from full transparency to complete privacy, filtering harsh sunlight into a warm, diffused glow.\nWhen paired with Hunter Douglas's PowerView Automation, the shade is controlled entirely from your phone via the PowerView app. You can swivel the vanes to any angle, open or close the entire panel, and set schedules so the shades adjust automatically throughout the day — morning light filtering in gently, full privacy at night, without you touching anything.\nThe system is also compatible with Apple HomeKit, Google Home, Amazon Alexa, and Samsung SmartThings, so a single voice command or a tap in your home app moves every shade in the room in unison.\nThe fabric itself has a layered, luminous quality — almost like frosted glass — that softens the view to the outside while maintaining an elegant, floor-length silhouette from within. It reads as pure drapery to the eye, but behaves like precision engineering under the surface.	2026-03-06 18:30:24.165777-08	t
2	2	Handcrafted Drapery Motorized Work with Homekit Siri	Irvine, CA	Homekit,Motorized,Linen Drapery,Blackout Drapery,Handcrafted Drapery,Work With SIri	A set of custom dual-layer motorized drapery where a hand-sewn sheer panel and a heavyweight fabric panel hang together from a single decorative wooden rod — but the wood is purely aesthetic. Concealed inside the rod is a precision motorized track that drives both layers independently on separate carriers, completely invisible from the room.\nThe system is integrated with Apple HomeKit, so you control it entirely through Siri. You can say "Hey Siri, open the sheers to 60%" and only the sheer layer glides to exactly that position — diffusing daylight while keeping the view. Then "Hey Siri, close the drapes" and the fabric layer follows, drawing the room into complete privacy. You can position each layer anywhere between 0 and 100% independently, or move both simultaneously with a single command.\nThe wooden rod itself is custom-milled — finished in a brushed walnut, ebonized oak, or painted lacquer to match the interior — with decorative rings and finials that look exactly like a traditional hand-drawn drapery pole. Nothing about the exterior suggests there is a motor inside. The fabric panels are hand-pleated and floor-length, with enough fullness that when fully closed, the room reads as pure, tailored softness.\nSchedules run automatically through the Home app: sheers open at sunrise, both layers close at sunset. No remote, no switch — just your voice, your phone, or the passage of time.	2026-03-06 18:33:49.060774-08	t
3	3	Motorized Black Roller Shade,Screen Shade	Ontario, CA	Roller Shade ,Screen Shade,Motorized ,5% openess	A set of custom black motorized roller shades fabricated in a semi-sheer solar screen fabric — dark enough to eliminate glare and dramatically deepen the mood of a room, yet open-weave enough that the landscape outside remains softly visible, like looking through a smoked lens. The view doesn't disappear; it becomes a muted, cinematic backdrop.\nThe fabric blocks harsh UV and reduces solar heat gain while preserving an outward sightline during daylight hours. From outside, the windows read as a uniform, opaque matte black — clean, architectural, completely private. From inside, you see the world filtered through a quiet dark veil.\nEvery shade in the room is wired to a single RF remote. One button raises them all in unison, another lowers them, and a third stops them at any position mid-travel. No pairing each shade individually, no multiple remotes cluttering a side table — one slim remote handles the entire wall of windows with a single press. The shades move together at the same speed and stop at exactly the same height, so the hem line is perfectly level across the room.\nThe hardware is minimal: slim black aluminum headrails, side channels that guide the fabric flush to the window frame, and a fascia cover that hides the motor and roller entirely. When fully raised, the shade disappears into the headrail. When lowered, it's a seamless black plane — no visible cords, no chains, no mechanism. Just fabric and silence.	2026-03-06 18:36:06.807797-08	t
5	4	Blackout Drapery  H-Rail Control by wand	Arcadia, CA	Blackout Drapery ,Linen Drapery,100% Blackout 	A pair of custom 100% blackout drapery panels mounted on a heavy-duty H-Rail traverse rod system, operated by a smooth-gliding wand. A single reach of the hand pulls the wand, and the panels travel silently along the internal carrier track — opening or closing in one fluid, controlled motion with no cords, no chains, and no effort.\nThe fabric is a premium blackout cloth with a triple-weave or foam-back construction that achieves true total light block — not 99%, not "room darkening," but complete darkness at midday. When the panels are drawn, the room goes black. There is no light bleed through the weave, no pinhole glow, no color shift. It performs equally in a home theater, a nursery, or a master bedroom where sleep matters.\nThe hand of the fabric is substantial — weighted enough that each panel falls in a long, uninterrupted vertical line from rod to floor, with almost no lateral drift or billowing. The drape is architectural: clean, taut, and precise.\nThe pleats are hand-spaced and stitched at the header — whether pinch pleat, goblet, or inverted box — so every fold stands upright and holds its form independently. From across the room, the pleat distribution is perfectly even: each column of fabric identical in width, each pleat identical in depth, the leading edges hanging in a straight vertical plane. Freshly installed, it looks like a panel from a luxury hotel suite. Over time, because the pleats are sewn rather than just folded, they return to that same crisp geometry after every opening and closing.\nThe H-Rail itself is concealed behind the pleats, giving the installation a clean, built-in look — no exposed hardware, no visible mechanics. Just a wall of perfectly structured fabric.	2026-03-06 18:39:22.194361-08	t
6	5	Hunter Douglas Silhouette  by PowerView	Monrovia, CA	Silhouette,Duolite,PowerView,Motorized 	The Hunter Douglas Silhouette is unlike any other window covering. Suspended between two layers of sheer fabric are soft horizontal vanes — fabric fins that float in mid-air, catching light the way the louvers of a shutter would, but with the delicacy of cloth. The result is a shade that doesn't simply block or pass light, but actively sculpts it.\nPaired with PowerView Automation, the entire experience lives in your phone. Open the app, and two gestures control everything. A swipe raises or lowers the shade to any height — fully open, fully closed, or hovering at any point between, pooling just above the windowsill or suspended at eye level like a band of diffused light across the wall. A second gesture rotates the vanes: tilt them open and the room fills with soft, filtered daylight — never harsh, never direct, the sun broken into long horizontal ribbons across the floor. Tilt them closed and the sheer backing takes over, maintaining a gentle luminosity while blocking the view entirely. Tilt them fully closed with the shade lowered, and the room falls into near-complete privacy.\nThe quality of light that passes through is the defining characteristic. It doesn't pour in — it arrives. Warm, even, shadowless in the way that overcast sky is shadowless, but golden in the way that afternoon California sun is golden. The vanes interrupt the raw glare and redistribute it as something ambient and livable.\nYou can set schedules — vanes angling open with the morning, rotating closed as the afternoon sun moves west, the shade lowering automatically at dusk. Or ask Siri, Google, or Alexa to do it by voice. The shade responds in seconds, moving with a quiet, precise motor that is completely inaudible from across the room.\nFrom the street, the window is a clean, continuous sheer surface. From inside, it is the most refined relationship between a room and its light that a window covering can offer. Sonnet 4.6	2026-03-06 18:41:42.943757-08	t
7	7	Pure White Drapery Blackout 	Irvine, CA	Pure White,2 Fold Pinch,Blackout	The fabric is an opaque white — not cream, not ivory, but a clean, bright white that holds its tone evenly across the full width of the panel, with no variation, no shadowing through the weave. Behind it, a blackout lining is sewn flush to the face fabric, adding just enough weight and body that the panel behaves less like cloth and more like a soft architectural surface. Light does not pass through. The wall behind the window simply ceases to exist when the panels are drawn.\nThe two-finger pinch pleat is worked at regular, precisely measured intervals across the header. Each pleat is a small bundle of fabric pinched and stitched at its base, releasing into three distinct folds that fan upward and outward before falling into the body of the panel. Because there are two fingers rather than three, the pleat is slightly more relaxed than a traditional French pleat — fuller, with a quiet generosity to the fold — but still structured and deliberate. The spacing between pleats is uniform to the centimeter, so the rhythm across the rod is perfectly even.\nFrom the base of the pleat to the floor, the fabric descends in long, unbroken vertical columns. There is no lateral ripple, no twist, no irregular bunching at the hem. The leading edge hangs in a straight line. The hem breaks cleanly at the floor — or just grazes it, depending on the installation — with enough weight that it stays exactly where it was set.\nIn a sunlit room, the panels glow softly. In a darkened room, they are a white wall. Either way, the shape is impeccable.	2026-03-06 18:43:50.093981-08	t
8	13	Living Room Lumar Sheer Linen Sheer	Pasadena, CA	Linen Sheer,Natural Color,2 Fold Tailored,	This project features custom-made sheer drapery designed to enhance both the architectural height of the space and the natural light within the room.\n\nThe installation spans a wall of tall windows, including upper clerestory windows, creating a continuous and elegant window treatment. Soft ivory sheer fabric gently filters sunlight, producing a warm, diffused glow that brightens the entire living area while maintaining privacy.\n\nThe drapery is installed on a long, slim black decorative rod and crafted with tailored pleats, giving the panels a structured yet relaxed appearance. The subtle linen-like texture of the fabric adds depth and softness, allowing natural light to pass through while creating delicate vertical folds.\n\nBehind the sheer layer, white plantation shutters remain visible, forming a layered window treatment system. This combination provides flexible light control—shutters offer privacy and shading, while the sheer drapery softens daylight and adds visual elegance.\n\nA closer view reveals the refined detailing of the drapery construction. The panels are evenly spaced along the rod using ring hardware, allowing smooth movement while maintaining consistent pleat formation. The textured fabric enhances the organic, natural aesthetic of the space and complements the room’s neutral palette.\n\nOverall, this installation creates a light, airy, and sophisticated atmosphere, balancing functionality with timeless design while highlighting the height and openness of the room.	2026-03-06 19:06:06.561825-08	t
9	14	Motorized H-Rail Pinch Pleat Drapery	Temple City, CA	Pinch Pleat Drapery,Motorized,Blackout Drapery	Inside our Temple City workshop — where every panel is cut, sewn and finished by hand.	2026-03-06 19:07:10.156867-08	t
10	9	Linen Look Sheer PInch Pleat	Irvine, CA	Linen Sheer ,Pinch Pleat Drapery	European linen, pre-washed for a relaxed, lived-in elegance.	2026-03-09 01:03:47.752284-07	t
11	10	Hunter Douglas Zebra Shade	Diamond Bar, CA	Hunter Douglas,Motorized		2026-03-09 01:04:40.815268-07	t
12	12	Recessed Track Linen Drapery 100% Linen Sheer	Pasadena, CA	Linen sheer	Brushed-brass grommets on slate linen — modern restraint with enduring appeal.	2026-03-09 01:05:26.012719-07	t
13	15	Hunter Douglas Pirouette Powerview 	Irvine, CA	Hunter Douglas,Pirouette,Motorized,Smart Home	Hunter Douglas powerview,Control by Phone.	2026-03-09 01:06:45.243566-07	t
14	16	Linen drapery with roller shade	San Gabriel, CA	Pinch pleat drapery,Linen Fabric 	The difference a day makes. Full room transformation completed in a single visit.	2026-03-09 01:07:24.625077-07	t
\.


--
-- Data for Name: login_attempts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.login_attempts (id, identifier, ip, success, created_at) FROM stdin;
0253e6f8-6007-466b-968a-974b15cf8264	ghsot5566ac@gmail.com	::1	f	2026-03-09 18:15:53.246865-07
7011f7c7-8f96-4a87-b6aa-8d53f51d2a91	ghost5566ac@gmail.com	::1	t	2026-03-09 18:16:18.656203-07
1632ad68-70d3-4f74-ba2a-ba319cce266d	ghost5566ac@gmail.com	::1	t	2026-03-09 23:58:34.358648-07
702ae3bf-cc8e-4f65-9e07-24ed655edae3	ghost5566ac@gmail.com	::1	t	2026-03-10 00:02:29.626224-07
\.


--
-- Data for Name: order_shipments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_shipments (id, order_id, item_indices, parcel_length, parcel_width, parcel_height, parcel_weight, tracking_number, tracking_url, label_url, carrier, service, shippo_transaction_id, status, created_at, item_quantities) FROM stdin;
ae98cba4-12ec-4906-952d-45b4613349e7	c69caf36-b8eb-4a58-8062-221633034540	{0}	\N	\N	\N	\N	234523462456	\N	\N		\N	\N	shipped	2026-02-24 22:01:23.378559-08	{"0": 1}
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, order_number, status, customer_name, customer_email, customer_phone, shipping_address, items, subtotal, discount_code, discount_type, discount_value, discount_amount, total, notes, admin_notes, created_at, updated_at, user_id, payment_intent_id, payment_status, shipping_cost, shipping_method, shipping_rate_id, shipping_label_url, tracking_number, tracking_url, shipping_carrier, shippo_transaction_id, tax_rate, tax_amount, tax_source) FROM stdin;
3266ccde-981a-4033-af0b-caa6b645658a	AD260223-BPEW	pending	Eddie	angeldrapery2100@gmail.com	6267032929	{"zip": "91780", "city": "TEMPLE CITY", "state": "CA", "street": "8827 LAS TUNAS DR"}	[{"width": 100, "height": 90, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "NO", "valueLabel": "No Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "C/O", "valueLabel": "Center Split", "displayLabel": "Operation"}], "quantity": 2, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 544, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}, {"width": 48, "height": 80, "options": [{"name": "mounting", "value": "IM", "valueLabel": "Inside Mount", "displayLabel": "Mounting"}, {"name": "fabric_code", "value": "FC605-01", "valueLabel": "White", "displayLabel": "Fabric Code"}, {"name": "operation", "value": "Chain Match Color", "valueLabel": "Manul Chain", "displayLabel": "Operation"}, {"name": "control_side", "value": "L", "valueLabel": "Left", "displayLabel": "Control Side"}], "quantity": 1, "productId": "104c89ef-e4b7-479d-9a96-f515f9fb08cf", "unitPrice": 262, "productName": "LF Roller Shade (副本)", "productType": "shade", "mainImageUrl": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871006807-3q8wesnv615.jpg", "heightFraction": "0"}, {"width": 80, "options": [{"name": "rod", "value": "Single", "valueLabel": "Single Rod", "displayLabel": "Rod"}, {"name": "finial", "value": "End Cap", "valueLabel": "End Cap", "displayLabel": "Finial"}, {"name": "color", "value": "Stain Gold", "valueLabel": "Stain Gold", "displayLabel": "Color"}], "quantity": 1, "productId": "e1a8aa80-f990-4092-9414-755512c50797", "unitPrice": 296, "productName": "Traverse H-Rail (副本)", "productType": "hardware", "mainImageUrl": "/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771872884835-c4l6l9s45b.jpg", "widthFraction": "0"}]	1646.00	\N	\N	0.00	0.00	1646.00			2026-02-23 19:45:24.261157-08	2026-02-23 20:36:08.859253-08	\N	\N	unpaid	0.00	\N	\N	\N	\N	\N	\N	\N	0.0000	0.00	local
a9959713-adbf-428d-9f99-3737d5ad4cac	AD260223-1OAW	in_production	Angel Drapery Inc	Eddieinus2016@yahoo.com	6267032929	{"zip": "91780", "city": "TEMPLE CITY", "state": "CA", "street": "8827 LAS TUNAS DR"}	[{"width": 89, "height": 90, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "NO", "valueLabel": "No Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "C/O", "valueLabel": "Center Split", "displayLabel": "Operation"}], "quantity": 1, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 474, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}, {"width": 89, "height": 90, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "NO", "valueLabel": "No Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "C/O", "valueLabel": "Center Split", "displayLabel": "Operation"}], "quantity": 7, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 474, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}, {"width": 70, "height": 90, "options": [{"name": "mounting", "value": "IM", "valueLabel": "Inside Mount", "displayLabel": "Mounting"}, {"name": "fabric_code", "value": "FC605-01", "valueLabel": "White", "displayLabel": "Fabric Code"}, {"name": "operation", "value": "Chain Match Color", "valueLabel": "Manul Chain", "displayLabel": "Operation"}, {"name": "control_side", "value": "L", "valueLabel": "Left", "displayLabel": "Control Side"}], "quantity": 1, "productId": "104c89ef-e4b7-479d-9a96-f515f9fb08cf", "unitPrice": 414, "productName": "LF Roller Shade (副本)", "productType": "shade", "mainImageUrl": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871006807-3q8wesnv615.jpg", "heightFraction": "0"}, {"width": 144, "options": [{"name": "rod", "value": "Single", "valueLabel": "Single Rod", "displayLabel": "Rod"}, {"name": "finial", "value": "End Cap", "valueLabel": "End Cap", "displayLabel": "Finial"}, {"name": "color", "value": "Stain Gold", "valueLabel": "Stain Gold", "displayLabel": "Color"}], "quantity": 1, "productId": "01d7902c-d402-4da3-99e4-700c5fb9f6cc", "unitPrice": 446, "productName": "Traverse H-Rail", "productType": "hardware", "mainImageUrl": "/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771872884835-c4l6l9s45b.jpg", "widthFraction": "0"}]	4652.00	\N	\N	0.00	0.00	4652.00			2026-02-23 20:10:32.38314-08	2026-02-23 20:35:01.263034-08	cfe71d4a-21e6-4c9c-9c47-d90e4f4f128f	pi_3T4CuCRxH3yxlnSg0vDCAUGY	paid	0.00	\N	\N	\N	\N	\N	\N	\N	0.0000	0.00	local
7dd9c38f-b5df-4363-bfc0-e1fd29edff2a	AD260223-HDO3	pending	Haitong Cao	angeldrapery2100@gmail.com	6263426784	{"zip": "07070", "city": "Rutherford", "state": "NJ", "street": "116 Irving Pl"}	[{"width": 96, "options": [{"name": "rod", "value": "Single", "valueLabel": "Single Rod", "displayLabel": "Rod"}, {"name": "finial", "value": "End Cap", "valueLabel": "End Cap", "displayLabel": "Finial"}, {"name": "color", "value": "Stain Gold", "valueLabel": "Stain Gold", "displayLabel": "Color"}], "quantity": 1, "productId": "e8a84e10-de8e-45aa-bfd8-3cbf4502cc8c", "unitPrice": 326, "productName": "Traverse H-Rail (副本) (副本)", "productType": "hardware", "mainImageUrl": "/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771872884835-c4l6l9s45b.jpg", "widthFraction": "0"}]	326.00	\N	\N	0.00	0.00	399.21			2026-02-23 20:56:22.60214-08	2026-02-23 20:56:22.60214-08	53a3e686-94c8-4590-972b-11147b131a16	pi_3T4DeeRxH3yxlnSg0PFOSYGT	paid	73.21	UPS - Ground	35d020c048b645208d03771c49648b17	\N	\N	\N	\N	\N	0.0000	0.00	local
726f1bf3-806c-4617-aa17-0b961e3840d8	AD260223-WF62	pending	haitong cao	angeldrapery2100@gmail.com	6263426784	{"zip": "07070", "city": "Rutherford", "state": "NJ", "street": "116 Irving Pl"}	[{"width": 120, "height": 100, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Winter", "valueLabel": "Winter", "displayLabel": "Fabric Color"}, {"name": "operation", "value": "C/O", "valueLabel": "Center Split", "displayLabel": "Operation"}], "quantity": 1, "productId": "36c33172-62ac-47d5-aebc-fa3de1e52d41", "unitPrice": 630, "productName": "Linen Look Sheer", "productType": "sheer", "mainImageUrl": "/uploads/products/d38ee4cb-acb7-4da8-b8cb-9c59ffe5c7a0/1771793116576-6d8nihzpk4x.jpg", "heightFraction": "0"}, {"width": 160, "height": 122, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Winter", "valueLabel": "Winter", "displayLabel": "Fabric Color"}, {"name": "operation", "value": "C/O", "valueLabel": "Center Split", "displayLabel": "Operation"}], "quantity": 1, "productId": "36c33172-62ac-47d5-aebc-fa3de1e52d41", "unitPrice": 1056, "productName": "Linen Look Sheer", "productType": "sheer", "mainImageUrl": "/uploads/products/d38ee4cb-acb7-4da8-b8cb-9c59ffe5c7a0/1771793116576-6d8nihzpk4x.jpg", "heightFraction": "0"}, {"width": 160, "height": 122, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Winter", "valueLabel": "Winter", "displayLabel": "Fabric Color"}, {"name": "operation", "value": "O/L", "valueLabel": "One Way Stack Left", "displayLabel": "Operation"}], "quantity": 1, "productId": "36c33172-62ac-47d5-aebc-fa3de1e52d41", "unitPrice": 1056, "productName": "Linen Look Sheer", "productType": "sheer", "mainImageUrl": "/uploads/products/d38ee4cb-acb7-4da8-b8cb-9c59ffe5c7a0/1771793116576-6d8nihzpk4x.jpg", "heightFraction": "0"}, {"width": 60, "height": 122, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Winter", "valueLabel": "Winter", "displayLabel": "Fabric Color"}, {"name": "operation", "value": "O/L", "valueLabel": "One Way Stack Left", "displayLabel": "Operation"}], "quantity": 1, "productId": "36c33172-62ac-47d5-aebc-fa3de1e52d41", "unitPrice": 420, "productName": "Linen Look Sheer", "productType": "sheer", "mainImageUrl": "/uploads/products/d38ee4cb-acb7-4da8-b8cb-9c59ffe5c7a0/1771793116576-6d8nihzpk4x.jpg", "heightFraction": "0"}, {"width": 120, "height": 100, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "NO", "valueLabel": "No Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "C/O", "valueLabel": "Center Split", "displayLabel": "Operation"}], "quantity": 1, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 683, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}, {"width": 120, "height": 100, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "NO", "valueLabel": "No Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "O/R", "valueLabel": "One Way Stack Right", "displayLabel": "Operation"}], "quantity": 1, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 788, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}, {"width": 120, "height": 100, "options": [{"name": "pleat_style", "value": "3 Fold Tailored", "valueLabel": "3 Fold Tailored Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "BO", "valueLabel": "Blackout Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "O/R", "valueLabel": "One Way Stack Right", "displayLabel": "Operation"}], "quantity": 1, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 1082, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}, {"width": 120, "height": 144, "options": [{"name": "pleat_style", "value": "3 Fold Tailored", "valueLabel": "3 Fold Tailored Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "BO", "valueLabel": "Blackout Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "O/R", "valueLabel": "One Way Stack Right", "displayLabel": "Operation"}], "quantity": 1, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 1600, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}, {"width": 120, "height": 144, "options": [{"name": "pleat_style", "value": "3 Fold Tailored", "valueLabel": "3 Fold Tailored Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "BO", "valueLabel": "Blackout Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "C/O", "valueLabel": "Center Split", "displayLabel": "Operation"}], "quantity": 1, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 1362, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}, {"width": 36, "height": 90, "options": [{"name": "mounting", "value": "IM", "valueLabel": "Inside Mount", "displayLabel": "Mounting"}, {"name": "fabric_code", "value": "FC605-01", "valueLabel": "White", "displayLabel": "Fabric Code"}, {"name": "operation", "value": "Chain Match Color", "valueLabel": "Manul Chain", "displayLabel": "Operation"}, {"name": "control_side", "value": "L", "valueLabel": "Left", "displayLabel": "Control Side"}], "quantity": 1, "productId": "104c89ef-e4b7-479d-9a96-f515f9fb08cf", "unitPrice": 218, "productName": "LF Roller Shade (副本)", "productType": "shade", "mainImageUrl": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871006807-3q8wesnv615.jpg", "heightFraction": "0"}, {"width": 36, "height": 90, "options": [{"name": "mounting", "value": "IM", "valueLabel": "Inside Mount", "displayLabel": "Mounting"}, {"name": "fabric_code", "value": "FC605-01", "valueLabel": "White", "displayLabel": "Fabric Code"}, {"name": "operation", "value": "Cordless", "valueLabel": "Cordless", "displayLabel": "Operation"}, {"name": "control_side", "value": "L", "valueLabel": "Left", "displayLabel": "Control Side"}], "quantity": 1, "productId": "104c89ef-e4b7-479d-9a96-f515f9fb08cf", "unitPrice": 248, "productName": "LF Roller Shade (副本)", "productType": "shade", "mainImageUrl": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871006807-3q8wesnv615.jpg", "heightFraction": "0"}, {"width": 36, "height": 90, "options": [{"name": "mounting", "value": "IM", "valueLabel": "Inside Mount", "displayLabel": "Mounting"}, {"name": "fabric_code", "value": "FC605-01", "valueLabel": "White", "displayLabel": "Fabric Code"}, {"name": "operation", "value": "25 Matter Motor", "valueLabel": "Motorized Matter", "displayLabel": "Operation"}, {"name": "control_side", "value": "L", "valueLabel": "Left", "displayLabel": "Control Side"}], "quantity": 1, "productId": "104c89ef-e4b7-479d-9a96-f515f9fb08cf", "unitPrice": 368, "productName": "LF Roller Shade (副本)", "productType": "shade", "mainImageUrl": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871006807-3q8wesnv615.jpg", "heightFraction": "0"}, {"width": 120, "options": [{"name": "rod", "value": "Single", "valueLabel": "Single Rod", "displayLabel": "Rod"}, {"name": "finial", "value": "End Cap", "valueLabel": "End Cap", "displayLabel": "Finial"}, {"name": "color", "value": "Stain Gold", "valueLabel": "Stain Gold", "displayLabel": "Color"}], "quantity": 1, "productId": "01d7902c-d402-4da3-99e4-700c5fb9f6cc", "unitPrice": 386, "productName": "Traverse H-Rail", "productType": "hardware", "mainImageUrl": "/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771872884835-c4l6l9s45b.jpg", "widthFraction": "0"}, {"width": 144, "options": [{"name": "rod", "value": "Single", "valueLabel": "Single Rod", "displayLabel": "Rod"}, {"name": "finial", "value": "Ball Finial", "valueLabel": "Ball Finial", "displayLabel": "Finial"}, {"name": "color", "value": "Stain Gold", "valueLabel": "Stain Gold", "displayLabel": "Color"}], "quantity": 1, "productId": "01d7902c-d402-4da3-99e4-700c5fb9f6cc", "unitPrice": 460, "productName": "Traverse H-Rail", "productType": "hardware", "mainImageUrl": "/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771872884835-c4l6l9s45b.jpg", "widthFraction": "0"}]	10357.00	\N	\N	0.00	0.00	10562.80			2026-02-23 22:18:18.554797-08	2026-02-23 22:18:18.554797-08	53a3e686-94c8-4590-972b-11147b131a16	pi_3T4EwBRxH3yxlnSg17CiH3yW	paid	205.80	UPS - Ground	1b5c386e787348f4b31562e4aae53f94	\N	\N	\N	\N	\N	0.0000	0.00	local
9aa889c4-5d88-420a-84aa-ed34e1db7277	AD260224-0QTP	in_production	haitong cao	angeldrapery2100@gmail.com	6263426784	{"zip": "07070", "city": "Rutherford", "state": "NJ", "street": "116 Irving Pl"}	[{"width": 46, "height": 90, "options": [{"name": "mounting", "value": "IM", "valueLabel": "Inside Mount", "displayLabel": "Mounting"}, {"name": "fabric_code", "value": "FC605-01", "valueLabel": "White", "displayLabel": "Fabric Code"}, {"name": "operation", "value": "304", "valueLabel": "Stainless Chain", "displayLabel": "Operation"}, {"name": "control_side", "value": "L", "valueLabel": "Left", "displayLabel": "Control Side"}], "quantity": 1, "productId": "104c89ef-e4b7-479d-9a96-f515f9fb08cf", "unitPrice": 286, "productName": "LF Roller Shade (副本)", "productType": "shade", "mainImageUrl": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871006807-3q8wesnv615.jpg", "heightFraction": "0"}]	286.00	\N	\N	0.00	0.00	305.21		豆腐干豆腐	2026-02-24 18:33:18.228455-08	2026-02-24 22:03:34.544588-08	53a3e686-94c8-4590-972b-11147b131a16	pi_3T4XuQRxH3yxlnSg0kFfWpfo	paid	19.21	USPS - Ground Advantage	07185fc6c85a49afbc2384ea4bd17b14	\N	\N	\N	\N	\N	0.0000	0.00	local
761e80cb-693d-459b-8a6b-3cdda7a77d05	AD260223-JK1J	cancelled	haitong cao	angeldrapery2100@gmail.com	6263426784	{"zip": "07070", "city": "Rutherford", "state": "NJ", "street": "116 Irving Pl"}	[{"width": 36, "height": 58, "options": [{"name": "mounting", "value": "IM", "valueLabel": "Inside Mount", "displayLabel": "Mounting"}, {"name": "fabric_code", "value": "FC605-01", "valueLabel": "White", "displayLabel": "Fabric Code"}, {"name": "operation", "value": "Cordless", "valueLabel": "Cordless", "displayLabel": "Operation"}], "quantity": 1, "productId": "104c89ef-e4b7-479d-9a96-f515f9fb08cf", "unitPrice": 188, "productName": "LF Roller Shade (副本)", "productType": "shade", "mainImageUrl": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871006807-3q8wesnv615.jpg", "heightFraction": "0"}, {"width": 36, "height": 58, "options": [{"name": "mounting", "value": "IM", "valueLabel": "Inside Mount", "displayLabel": "Mounting"}, {"name": "fabric_code", "value": "FC605-01", "valueLabel": "White", "displayLabel": "Fabric Code"}, {"name": "operation", "value": "Cordless", "valueLabel": "Cordless", "displayLabel": "Operation"}], "quantity": 5, "productId": "104c89ef-e4b7-479d-9a96-f515f9fb08cf", "unitPrice": 188, "productName": "LF Roller Shade (副本)", "productType": "shade", "mainImageUrl": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871006807-3q8wesnv615.jpg", "heightFraction": "0"}, {"width": 36, "height": 58, "options": [{"name": "mounting", "value": "IM", "valueLabel": "Inside Mount", "displayLabel": "Mounting"}, {"name": "fabric_code", "value": "FC605-01", "valueLabel": "White", "displayLabel": "Fabric Code"}, {"name": "operation", "value": "25 Matter Motor", "valueLabel": "Motorized Matter", "displayLabel": "Operation"}, {"name": "control_side", "value": "R", "valueLabel": "Right", "displayLabel": "Control Side"}], "quantity": 5, "productId": "104c89ef-e4b7-479d-9a96-f515f9fb08cf", "unitPrice": 308, "productName": "LF Roller Shade (副本)", "productType": "shade", "mainImageUrl": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871006807-3q8wesnv615.jpg", "heightFraction": "0"}, {"width": 36, "height": 58, "options": [{"name": "mounting", "value": "IM", "valueLabel": "Inside Mount", "displayLabel": "Mounting"}, {"name": "fabric_code", "value": "FC605-01", "valueLabel": "White", "displayLabel": "Fabric Code"}, {"name": "operation", "value": "25 Matter Motor", "valueLabel": "Motorized Matter", "displayLabel": "Operation"}, {"name": "control_side", "value": "R", "valueLabel": "Right", "displayLabel": "Control Side"}], "quantity": 1, "productId": "104c89ef-e4b7-479d-9a96-f515f9fb08cf", "unitPrice": 308, "productName": "LF Roller Shade (副本)", "productType": "shade", "mainImageUrl": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871006807-3q8wesnv615.jpg", "heightFraction": "0"}, {"width": 96, "height": 100, "options": [{"name": "mounting", "value": "IM", "valueLabel": "Inside Mount", "displayLabel": "Mounting"}, {"name": "fabric_code", "value": "FC605-01", "valueLabel": "White", "displayLabel": "Fabric Code"}, {"name": "operation", "value": "25 Matter Motor", "valueLabel": "Motorized Matter", "displayLabel": "Operation"}, {"name": "control_side", "value": "R", "valueLabel": "Right", "displayLabel": "Control Side"}], "quantity": 1, "productId": "104c89ef-e4b7-479d-9a96-f515f9fb08cf", "unitPrice": 764, "productName": "LF Roller Shade (副本)", "productType": "shade", "mainImageUrl": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871006807-3q8wesnv615.jpg", "heightFraction": "0"}, {"width": 58, "height": 72, "options": [{"name": "mounting", "value": "IM", "valueLabel": "Inside Mount", "displayLabel": "Mounting"}, {"name": "fabric_code", "value": "FC605-01", "valueLabel": "White", "displayLabel": "Fabric Code"}, {"name": "operation", "value": "Chain Match Color", "valueLabel": "Manul Chain", "displayLabel": "Operation"}, {"name": "control_side", "value": "L", "valueLabel": "Left", "displayLabel": "Control Side"}], "quantity": 1, "productId": "104c89ef-e4b7-479d-9a96-f515f9fb08cf", "unitPrice": 291, "productName": "LF Roller Shade (副本)", "productType": "shade", "mainImageUrl": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871006807-3q8wesnv615.jpg", "heightFraction": "0"}, {"width": 58, "height": 72, "options": [{"name": "mounting", "value": "IM", "valueLabel": "Inside Mount", "displayLabel": "Mounting"}, {"name": "fabric_code", "value": "FC605-01", "valueLabel": "White", "displayLabel": "Fabric Code"}, {"name": "operation", "value": "25 RF Motor", "valueLabel": "Motorized RF", "displayLabel": "Operation"}, {"name": "control_side", "value": "L", "valueLabel": "Left", "displayLabel": "Control Side"}], "quantity": 1, "productId": "104c89ef-e4b7-479d-9a96-f515f9fb08cf", "unitPrice": 401, "productName": "LF Roller Shade (副本)", "productType": "shade", "mainImageUrl": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871006807-3q8wesnv615.jpg", "heightFraction": "0"}, {"width": 58, "height": 72, "options": [{"name": "mounting", "value": "IM", "valueLabel": "Inside Mount", "displayLabel": "Mounting"}, {"name": "fabric_code", "value": "FC605-01", "valueLabel": "White", "displayLabel": "Fabric Code"}, {"name": "operation", "value": "25 Matter Motor", "valueLabel": "Motorized Matter", "displayLabel": "Operation"}, {"name": "control_side", "value": "L", "valueLabel": "Left", "displayLabel": "Control Side"}], "quantity": 1, "productId": "104c89ef-e4b7-479d-9a96-f515f9fb08cf", "unitPrice": 441, "productName": "LF Roller Shade (副本)", "productType": "shade", "mainImageUrl": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871006807-3q8wesnv615.jpg", "heightFraction": "0"}, {"width": 58, "height": 72, "options": [{"name": "mounting", "value": "IM", "valueLabel": "Inside Mount", "displayLabel": "Mounting"}, {"name": "fabric_code", "value": "FC605-03", "valueLabel": "Grey", "displayLabel": "Fabric Code"}, {"name": "operation", "value": "25 Matter Motor", "valueLabel": "Motorized Matter", "displayLabel": "Operation"}, {"name": "control_side", "value": "L", "valueLabel": "Left", "displayLabel": "Control Side"}], "quantity": 1, "productId": "104c89ef-e4b7-479d-9a96-f515f9fb08cf", "unitPrice": 441, "productName": "LF Roller Shade (副本)", "productType": "shade", "mainImageUrl": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871006807-3q8wesnv615.jpg", "heightFraction": "0"}, {"width": 58, "height": 72, "options": [{"name": "mounting", "value": "OM", "valueLabel": "Outside Mount", "displayLabel": "Mounting"}, {"name": "fabric_code", "value": "FC605-03", "valueLabel": "Grey", "displayLabel": "Fabric Code"}, {"name": "operation", "value": "25 Matter Motor", "valueLabel": "Motorized Matter", "displayLabel": "Operation"}, {"name": "control_side", "value": "L", "valueLabel": "Left", "displayLabel": "Control Side"}], "quantity": 1, "productId": "104c89ef-e4b7-479d-9a96-f515f9fb08cf", "unitPrice": 441, "productName": "LF Roller Shade (副本)", "productType": "shade", "mainImageUrl": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871006807-3q8wesnv615.jpg", "heightFraction": "0"}, {"width": 96, "height": 100, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Winter", "valueLabel": "Winter", "displayLabel": "Fabric Color"}, {"name": "operation", "value": "C/O", "valueLabel": "Center Split", "displayLabel": "Operation"}], "quantity": 1, "productId": "36c33172-62ac-47d5-aebc-fa3de1e52d41", "unitPrice": 510, "productName": "Linen Look Sheer", "productType": "sheer", "mainImageUrl": "/uploads/products/d38ee4cb-acb7-4da8-b8cb-9c59ffe5c7a0/1771793116576-6d8nihzpk4x.jpg", "heightFraction": "0"}, {"width": 96, "height": 100, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Winter", "valueLabel": "Winter", "displayLabel": "Fabric Color"}, {"name": "operation", "value": "O/R", "valueLabel": "One Way Stack Right", "displayLabel": "Operation"}], "quantity": 3, "productId": "36c33172-62ac-47d5-aebc-fa3de1e52d41", "unitPrice": 510, "productName": "Linen Look Sheer", "productType": "sheer", "mainImageUrl": "/uploads/products/d38ee4cb-acb7-4da8-b8cb-9c59ffe5c7a0/1771793116576-6d8nihzpk4x.jpg", "heightFraction": "0"}, {"width": 160, "height": 130, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Winter", "valueLabel": "Winter", "displayLabel": "Fabric Color"}, {"name": "operation", "value": "O/R", "valueLabel": "One Way Stack Right", "displayLabel": "Operation"}], "quantity": 3, "productId": "36c33172-62ac-47d5-aebc-fa3de1e52d41", "unitPrice": 1086, "productName": "Linen Look Sheer", "productType": "sheer", "mainImageUrl": "/uploads/products/d38ee4cb-acb7-4da8-b8cb-9c59ffe5c7a0/1771793116576-6d8nihzpk4x.jpg", "heightFraction": "0"}, {"width": 160, "height": 179, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Winter", "valueLabel": "Winter", "displayLabel": "Fabric Color"}, {"name": "operation", "value": "C/O", "valueLabel": "Center Split", "displayLabel": "Operation"}], "quantity": 1, "productId": "36c33172-62ac-47d5-aebc-fa3de1e52d41", "unitPrice": 1410, "productName": "Linen Look Sheer", "productType": "sheer", "mainImageUrl": "/uploads/products/d38ee4cb-acb7-4da8-b8cb-9c59ffe5c7a0/1771793116576-6d8nihzpk4x.jpg", "heightFraction": "1/2"}, {"width": 120, "height": 179, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Pearl", "valueLabel": "Pearl", "displayLabel": "Fabric Color"}, {"name": "operation", "value": "O/R", "valueLabel": "One Way Stack Right", "displayLabel": "Operation"}], "quantity": 1, "productId": "36c33172-62ac-47d5-aebc-fa3de1e52d41", "unitPrice": 1050, "productName": "Linen Look Sheer", "productType": "sheer", "mainImageUrl": "/uploads/products/d38ee4cb-acb7-4da8-b8cb-9c59ffe5c7a0/1771793116576-6d8nihzpk4x.jpg", "heightFraction": "1/2"}, {"width": 192, "options": [{"name": "rod", "value": "Single", "valueLabel": "Single Rod", "displayLabel": "Rod"}, {"name": "finial", "value": "End Cap", "valueLabel": "End Cap", "displayLabel": "Finial"}, {"name": "color", "value": "Stain Gold", "valueLabel": "Stain Gold", "displayLabel": "Color"}], "quantity": 1, "productId": "01d7902c-d402-4da3-99e4-700c5fb9f6cc", "unitPrice": 566, "productName": "Traverse H-Rail", "productType": "hardware", "mainImageUrl": "/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771872884835-c4l6l9s45b.jpg", "widthFraction": "0"}, {"width": 192, "options": [{"name": "rod", "value": "Double", "valueLabel": "Double Rod", "displayLabel": "Rod"}, {"name": "finial", "value": "End Cap", "valueLabel": "End Cap", "displayLabel": "Finial"}, {"name": "color", "value": "Stain Gold", "valueLabel": "Stain Gold", "displayLabel": "Color"}], "quantity": 1, "productId": "01d7902c-d402-4da3-99e4-700c5fb9f6cc", "unitPrice": 806, "productName": "Traverse H-Rail", "productType": "hardware", "mainImageUrl": "/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771872884835-c4l6l9s45b.jpg", "widthFraction": "0"}, {"width": 120, "options": [{"name": "rod", "value": "Double", "valueLabel": "Double Rod", "displayLabel": "Rod"}, {"name": "finial", "value": "End Cap", "valueLabel": "End Cap", "displayLabel": "Finial"}, {"name": "color", "value": "Stain Gold", "valueLabel": "Stain Gold", "displayLabel": "Color"}], "quantity": 1, "productId": "01d7902c-d402-4da3-99e4-700c5fb9f6cc", "unitPrice": 506, "productName": "Traverse H-Rail", "productType": "hardware", "mainImageUrl": "/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771872884835-c4l6l9s45b.jpg", "widthFraction": "0"}, {"width": 120, "options": [{"name": "rod", "value": "Single", "valueLabel": "Single Rod", "displayLabel": "Rod"}, {"name": "finial", "value": "End Cap", "valueLabel": "End Cap", "displayLabel": "Finial"}, {"name": "color", "value": "Stain Gold", "valueLabel": "Stain Gold", "displayLabel": "Color"}], "quantity": 1, "productId": "01d7902c-d402-4da3-99e4-700c5fb9f6cc", "unitPrice": 386, "productName": "Traverse H-Rail", "productType": "hardware", "mainImageUrl": "/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771872884835-c4l6l9s45b.jpg", "widthFraction": "0"}, {"width": 120, "options": [{"name": "rod", "value": "Single", "valueLabel": "Single Rod", "displayLabel": "Rod"}, {"name": "finial", "value": "Ball Finial", "valueLabel": "Ball Finial", "displayLabel": "Finial"}, {"name": "color", "value": "Stain Gold", "valueLabel": "Stain Gold", "displayLabel": "Color"}], "quantity": 1, "productId": "01d7902c-d402-4da3-99e4-700c5fb9f6cc", "unitPrice": 400, "productName": "Traverse H-Rail", "productType": "hardware", "mainImageUrl": "/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771872884835-c4l6l9s45b.jpg", "widthFraction": "0"}, {"width": 120, "options": [{"name": "rod", "value": "Single", "valueLabel": "Single Rod", "displayLabel": "Rod"}, {"name": "finial", "value": "Ball Finial", "valueLabel": "Ball Finial", "displayLabel": "Finial"}, {"name": "color", "value": "Brushed Nickel", "valueLabel": "Brushed Nickel", "displayLabel": "Color"}], "quantity": 1, "productId": "01d7902c-d402-4da3-99e4-700c5fb9f6cc", "unitPrice": 400, "productName": "Traverse H-Rail", "productType": "hardware", "mainImageUrl": "/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771872884835-c4l6l9s45b.jpg", "widthFraction": "0"}, {"width": 120, "options": [{"name": "rod", "value": "Single", "valueLabel": "Single Rod", "displayLabel": "Rod"}, {"name": "finial", "value": "Ball Finial", "valueLabel": "Ball Finial", "displayLabel": "Finial"}, {"name": "color", "value": "Satin Nickel", "valueLabel": "Satin Nickel", "displayLabel": "Color"}], "quantity": 4, "productId": "01d7902c-d402-4da3-99e4-700c5fb9f6cc", "unitPrice": 400, "productName": "Traverse H-Rail", "productType": "hardware", "mainImageUrl": "/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771872884835-c4l6l9s45b.jpg", "widthFraction": "0"}, {"width": 144, "height": 100, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "NO", "valueLabel": "No Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "C/O", "valueLabel": "Center Split", "displayLabel": "Operation"}], "quantity": 1, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 807, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}, {"width": 144, "height": 100, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "BO", "valueLabel": "Blackout Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "C/O", "valueLabel": "Center Split", "displayLabel": "Operation"}], "quantity": 4, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 1114, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}, {"width": 144, "height": 100, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "BO", "valueLabel": "Blackout Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "O/R", "valueLabel": "One Way Stack Right", "displayLabel": "Operation"}], "quantity": 4, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 1274, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}, {"width": 96, "height": 100, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "BO", "valueLabel": "Blackout Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "O/R", "valueLabel": "One Way Stack Right", "displayLabel": "Operation"}], "quantity": 4, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 889, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}, {"width": 96, "height": 144, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "BO", "valueLabel": "Blackout Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "O/R", "valueLabel": "One Way Stack Right", "displayLabel": "Operation"}], "quantity": 1, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 1321, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}, {"width": 96, "height": 180, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "BO", "valueLabel": "Blackout Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "O/R", "valueLabel": "One Way Stack Right", "displayLabel": "Operation"}], "quantity": 1, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 1575, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}, {"width": 160, "height": 180, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "BO", "valueLabel": "Blackout Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "O/R", "valueLabel": "One Way Stack Right", "displayLabel": "Operation"}], "quantity": 1, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 2505, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}, {"width": 160, "height": 180, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "BO", "valueLabel": "Blackout Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "C/O", "valueLabel": "Center Split", "displayLabel": "Operation"}], "quantity": 1, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 2145, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}, {"width": 160, "height": 180, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "LF", "valueLabel": "Light Filtering Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "C/O", "valueLabel": "Center Split", "displayLabel": "Operation"}], "quantity": 4, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 1972, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}]	47526.00	\N	\N	0.00	0.00	48170.35			2026-02-23 23:04:14.999016-08	2026-02-24 22:08:29.668501-08	53a3e686-94c8-4590-972b-11147b131a16	pi_3T4Ff3RxH3yxlnSg1kNCugoT	refunded	644.35	UPS - Ground	3c63f0213d6840e19b31214c58034f83	\N	\N	\N	\N	\N	0.0000	0.00	local
c69caf36-b8eb-4a58-8062-221633034540	AD260224-BQL7	shipped	haitong cao	angeldrapery2100@gmail.com	6263426784	{"zip": "07070", "city": "Rutherford", "state": "NJ", "street": "116 Irving Pl"}	[{"width": 35, "height": 70, "options": [{"name": "mounting", "value": "IM", "valueLabel": "Inside Mount", "displayLabel": "Mounting"}, {"name": "fabric_code", "value": "FC605-02", "valueLabel": "Beidge", "displayLabel": "Fabric Code"}, {"name": "operation", "value": "Cordless", "valueLabel": "Cordless", "displayLabel": "Operation"}], "quantity": 1, "productId": "104c89ef-e4b7-479d-9a96-f515f9fb08cf", "unitPrice": 206, "productName": "LF Roller Shade (副本)", "productType": "shade", "mainImageUrl": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871006807-3q8wesnv615.jpg", "heightFraction": "0"}]	206.00	\N	\N	0.00	0.00	220.70			2026-02-24 18:28:00.895386-08	2026-02-24 22:01:23.382332-08	53a3e686-94c8-4590-972b-11147b131a16	pi_3T4XpMRxH3yxlnSg1D5ItduH	paid	14.70	UPS - Ground	85c298e4a96843d6aeda53b485692b3c	\N	234523462456	\N		\N	0.0000	0.00	local
9c8b9752-7eca-48ad-8ed9-6970ab8c84d7	AD260224-NE3T	pending	haitong cao	angeldrapery2100@gmail.com	6263426784	{"zip": "07070", "city": "Rutherford", "state": "NJ", "street": "116 Irving Pl"}	[{"width": 120, "height": 90, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "NO", "valueLabel": "No Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "C/O", "valueLabel": "Center Split", "displayLabel": "Operation"}, {"name": "return", "value": "6", "valueLabel": "6 inches", "displayLabel": "Return"}], "quantity": 1, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 646, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}]	646.00	\N	\N	0.00	0.00	660.70			2026-02-24 18:13:49.39539-08	2026-02-24 18:13:49.39539-08	53a3e686-94c8-4590-972b-11147b131a16	pi_3T4XbTRxH3yxlnSg0RC1xhdH	paid	14.70	UPS - Ground	6a974e4889f94264a7742df5d46d744f	\N	\N	\N	\N	\N	0.0000	0.00	local
535f8345-b3d9-48ea-9765-704c2403e580	AD260224-HJ1U	in_production	haitong cao	angeldrapery2100@gmail.com	6263426784	{"zip": "07070", "city": "Rutherford", "state": "NJ", "street": "116 Irving Pl"}	[{"width": 90, "options": [{"name": "rod", "value": "Single", "valueLabel": "Single Rod", "displayLabel": "Rod"}, {"name": "finial", "value": "End Cap", "valueLabel": "End Cap", "displayLabel": "Finial"}, {"name": "color", "value": "Stain Gold", "valueLabel": "Stain Gold", "displayLabel": "Color"}], "quantity": 1, "productId": "01d7902c-d402-4da3-99e4-700c5fb9f6cc", "unitPrice": 326, "productName": "Traverse H-Rail", "productType": "hardware", "mainImageUrl": "/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771872884835-c4l6l9s45b.jpg", "widthFraction": "0"}, {"width": 123, "options": [{"name": "rod", "value": "Single", "valueLabel": "Single Rod", "displayLabel": "Rod"}, {"name": "finial", "value": "End Cap", "valueLabel": "End Cap", "displayLabel": "Finial"}, {"name": "color", "value": "Stain Gold", "valueLabel": "Stain Gold", "displayLabel": "Color"}], "quantity": 1, "productId": "01d7902c-d402-4da3-99e4-700c5fb9f6cc", "unitPrice": 416, "productName": "Traverse H-Rail", "productType": "hardware", "mainImageUrl": "/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771872884835-c4l6l9s45b.jpg", "widthFraction": "0"}, {"width": 123, "height": 56, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "NO", "valueLabel": "No Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "C/O", "valueLabel": "Center Split", "displayLabel": "Operation"}, {"name": "return", "value": "3 1/2", "valueLabel": "3 1/2 inches", "displayLabel": "Return"}], "quantity": 1, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 531, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}, {"width": 123, "height": 56, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "NO", "valueLabel": "No Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "O/L", "valueLabel": "One Way Stack Left", "displayLabel": "Operation"}, {"name": "return", "value": "3 1/2", "valueLabel": "3 1/2 inches", "displayLabel": "Return"}], "quantity": 1, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 636, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}, {"width": 224, "height": 56, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "NO", "valueLabel": "No Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "O/L", "valueLabel": "One Way Stack Left", "displayLabel": "Operation"}, {"name": "return", "value": "3 1/2", "valueLabel": "3 1/2 inches", "displayLabel": "Return"}], "quantity": 1, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 1169, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}, {"width": 224, "height": 56, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "NO", "valueLabel": "No Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "C/O", "valueLabel": "Center Split", "displayLabel": "Operation"}, {"name": "return", "value": "3 1/2", "valueLabel": "3 1/2 inches", "displayLabel": "Return"}], "quantity": 1, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 1169, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}, {"width": 224, "height": 56, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "BO", "valueLabel": "Blackout Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "C/O", "valueLabel": "Center Split", "displayLabel": "Operation"}, {"name": "return", "value": "3 1/2", "valueLabel": "3 1/2 inches", "displayLabel": "Return"}], "quantity": 1, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 1597, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}, {"width": 224, "height": 56, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "LF", "valueLabel": "Light Filtering Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "C/O", "valueLabel": "Center Split", "displayLabel": "Operation"}, {"name": "return", "value": "3 1/2", "valueLabel": "3 1/2 inches", "displayLabel": "Return"}], "quantity": 1, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 1461, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}, {"width": 224, "height": 56, "options": [{"name": "pleat_style", "value": "3 Fold Tailored", "valueLabel": "3 Fold Tailored Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "LF", "valueLabel": "Light Filtering Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "C/O", "valueLabel": "Center Split", "displayLabel": "Operation"}, {"name": "return", "value": "3 1/2", "valueLabel": "3 1/2 inches", "displayLabel": "Return"}], "quantity": 1, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 1461, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}]	8766.00	\N	\N	0.00	0.00	9479.49			2026-02-24 19:48:04.432198-08	2026-02-24 23:02:47.355915-08	53a3e686-94c8-4590-972b-11147b131a16	pi_3T4Z2iRxH3yxlnSg1XXq8Amo	paid	132.30	UPS - Ground	3e863cd7d8ce430aaa7cf31ec4182a05	\N	\N	\N	\N	\N	0.0663	581.19	local
9931b9f3-5007-42a4-b678-b79fd8090d2f	AD260309-QJOL	pending	Angel2100	ghost5566ac@gmail.com	6263426784	{"zip": "91724", "city": "Covina", "state": "CA", "street": "335 N Dodsworth Ave "}	[{"width": 123, "height": 100, "options": [{"name": "pleat_style", "value": "2 Fold Tailored", "valueLabel": "2 Fold Tailored Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "LF", "valueLabel": "Light Filtering Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "C/O", "valueLabel": "Center Split", "displayLabel": "Operation"}, {"name": "return", "value": "3 1/2", "valueLabel": "3 1/2 inches", "displayLabel": "Return"}], "quantity": 1, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 882, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}]	882.00	\N	\N	0.00	0.00	968.38			2026-03-09 23:54:44.021503-07	2026-03-09 23:54:44.021503-07	d7188e9a-f07c-4b83-aac2-f98e09a8d3b1	pi_3T9KAaRxH3yxlnSg14W1Mtbc	paid	8.59	UPS - Ground	a85be4b0145e46448c291e851a8d0887	\N	\N	\N	\N	\N	0.0882	77.79	local
960da791-0722-4d8d-b032-36d61a1950d4	AD260310-1R2B	pending	haitong cao	angeldrapery2100@gmail.com	6263426784	{"zip": "07070", "city": "Rutherford", "state": "NJ", "street": "116 Irving Pl"}	[{"width": 120, "height": 100, "options": [{"name": "pleat_style", "value": "2 Fold Pinch", "valueLabel": "2 Fold Pinch Pleat", "displayLabel": "Pleat Style"}, {"name": "fabric_color", "value": "Natural", "valueLabel": "Natural", "displayLabel": "Fabric Color"}, {"name": "lining", "value": "NO", "valueLabel": "No Lining", "displayLabel": "Lining"}, {"name": "operation", "value": "C/O", "valueLabel": "Center Split", "displayLabel": "Operation"}, {"name": "return", "value": "3 1/2", "valueLabel": "3 1/2 inches", "displayLabel": "Return"}], "quantity": 1, "productId": "c0945fab-d9a5-46ca-a40e-63d35ab38d75", "unitPrice": 683, "productName": "Designer Spot Linen Drapery", "productType": "drapery", "mainImageUrl": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "heightFraction": "0"}]	683.00	\N	\N	0.00	0.00	765.81			2026-03-10 00:07:54.293643-07	2026-03-10 00:07:54.293643-07	53a3e686-94c8-4590-972b-11147b131a16	pi_3T9KOHRxH3yxlnSg070mRG87	paid	37.53	UPS - Ground	15eb0393854743dcaa59dc44b35b7372	\N	\N	\N	\N	\N	0.0663	45.28	local
\.


--
-- Data for Name: pricing_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pricing_configs (id, product_type_id, version, formula, variables, is_active, created_at) FROM stdin;
a77ec47b-d5bb-43ff-b7ef-f3b74513037e	e060321a-f042-4412-98ce-1964718c0c32	1	{"steps": ["panel_count_raw = window_width * fullness_multiplier / fabric_standard_width", "fabric_yard_raw = panel_count_raw * (window_height + extra_height_allowance) / 36", "fabric_cost_raw = fabric_yard_raw * (fabric_unit_price + lining_price_per_yard)", "base_labor_raw = panel_count_raw * labor_per_panel", "total_raw = fabric_cost_raw + base_labor_raw"]}	{"fullness_multiplier": 3.0, "fabric_standard_width": 55, "extra_height_allowance": 30}	t	2026-02-23 10:08:15.664639-08
3da64418-e35a-42d8-9ab4-1ae2927c5b60	6e870bef-cbc0-49e2-97b4-9a20c5632003	1	{"steps": []}	{"fullness_multiplier": 3.5}	t	2026-02-23 10:08:15.66674-08
3929e1db-333d-42a2-9edf-bb7b24a941f7	49f1e37c-116f-4e74-8a4f-d0e2376a99ca	1	{"steps": ["area_sqm_raw = (window_width * (window_height + 12)) / 1550", "window_width_m = (window_width * 2.54) / 100", "hardware_cost = window_width_m * hardware_unit_price", "control_cost = control_price", "total_raw = area_sqm_raw * fabric_unit_price + hardware_cost + control_cost"]}	{}	t	2026-02-23 10:08:15.667127-08
\.


--
-- Data for Name: product_parcel_rules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_parcel_rules (id, product_id, rule_name, min_width, max_width, min_height, max_height, parcel_length, parcel_width, parcel_height, parcel_weight, sort_order, created_at) FROM stdin;
93574d66-cfe8-4d91-a289-3bff7e593849	e8a84e10-de8e-45aa-bfd8-3cbf4502cc8c		0.00	96.00	0.00	999.00	96.00	4.00	4.00	6.00	0	2026-02-23 20:51:35.641583-08
80b8aa5b-43db-4a07-b90a-10dcd37eeb1d	c4283b0a-4251-41cd-a6bf-a637009cd778		0.00	360.00	0.00	240.00	30.00	10.00	10.00	18.00	0	2026-02-23 22:58:01.641093-08
a52a1e31-3507-4cef-ac1a-0a1be1ee8819	c0945fab-d9a5-46ca-a40e-63d35ab38d75		0.00	1000.00	0.00	1000.00	36.00	10.00	10.00	18.00	0	2026-03-09 23:57:53.972533-07
\.


--
-- Data for Name: product_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_types (id, slug, name, description, field_schema, production_schema, is_active, created_at, updated_at) FROM stdin;
e060321a-f042-4412-98ce-1964718c0c32	drapery	Drapery	窗帘	{}	\N	t	2026-02-21 23:45:50.045688-08	2026-02-21 23:45:50.045688-08
6e870bef-cbc0-49e2-97b4-9a20c5632003	sheer	Sheer	纱帘	{}	\N	t	2026-02-21 23:45:50.045688-08	2026-02-21 23:45:50.045688-08
49f1e37c-116f-4e74-8a4f-d0e2376a99ca	shade	Shade	卷帘	{}	\N	t	2026-02-21 23:45:50.045688-08	2026-02-21 23:45:50.045688-08
9f54ce2a-dc7e-4382-85a2-96c50222bac6	hardware	Hardware	窗帘杆	{}	\N	t	2026-02-21 23:45:50.045688-08	2026-02-21 23:45:50.045688-08
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, product_type_id, sku, name, base_price, images, default_config, is_active, created_at, updated_at, store_category_id) FROM stdin;
36c33172-62ac-47d5-aebc-fa3de1e52d41	6e870bef-cbc0-49e2-97b4-9a20c5632003	SHEER-1771747152286-COPY-7502	Linen Look Sheer	0.00	["/uploads/products/d38ee4cb-acb7-4da8-b8cb-9c59ffe5c7a0/1771793116576-6d8nihzpk4x.jpg"]	{"images": {"main": [{"id": "main-1771793116582-0", "url": "/uploads/products/d38ee4cb-acb7-4da8-b8cb-9c59ffe5c7a0/1771793116576-6d8nihzpk4x.jpg", "name": "20230408_004538519_iOS", "sort_order": 0}], "gallery": [{"id": "gallery-1771792959378-0", "url": "/uploads/products/d38ee4cb-acb7-4da8-b8cb-9c59ffe5c7a0/1771792959373-r3chbia3mep.jpg", "title": "", "sort_order": 0, "description": ""}]}, "params": {"max_height": 240, "labor_per_panel": 30, "sheer_fabric_width": 140, "sheer_fabric_formula": "width * 3.5 / fabric_width"}, "options": [{"id": "pleat_style", "name": "pleat_style", "type": "select", "values": [{"id": "value-1771793002937", "label": "2 Fold Pinch Pleat", "value": "2 Fold Pinch", "params": {}, "sort_order": 0}, {"id": "value-1771793017696", "label": "3 Fold Pinch Pleat", "value": "3 Fold Pinch ", "params": {}, "sort_order": 1}, {"id": "value-1771793046437", "label": "2 Fold Tailored Pleat", "value": "2 Fold Tailored ", "params": {}, "sort_order": 2}, {"id": "value-1771793058243", "label": "3 Fold Tailored Pleat", "value": "3 Fold Tailored", "params": {}, "sort_order": 3}], "display_label": "Pleat Style"}, {"id": "fabric_color", "name": "fabric_color", "type": "select", "values": [{"id": "value-1771868221650", "label": "Winter", "value": "Winter", "params": {"fabric_price": 30}, "sort_order": 0}, {"id": "value-1771868237559", "label": "Pearl", "value": "Pearl", "params": {"fabric_price": 30}, "sort_order": 1}], "display_label": "Fabric Color"}, {"id": "operation", "name": "operation", "type": "select", "values": [{"id": "value-1771868296255", "label": "Center Split", "value": "C/O", "params": {}, "sort_order": 0}, {"id": "value-1771868313648", "label": "One Way Stack Left", "value": "O/L", "params": {}, "sort_order": 1}, {"id": "value-1771868328085", "label": "One Way Stack Right", "value": "O/R", "params": {}, "sort_order": 2}], "display_label": "Operation"}], "sort_order": 1, "description": "Sheer", "is_featured": true}	t	2026-02-22 13:43:07.502927-08	2026-02-23 22:37:55.990677-08	a0468e2c-b43f-4ed2-91c4-6a6a68720f2d
c0945fab-d9a5-46ca-a40e-63d35ab38d75	e060321a-f042-4412-98ce-1964718c0c32	DRAPERY-1771820588063-COPY-8288	Designer Spot Linen Drapery	0.00	["/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg"]	{"images": {"main": [{"id": "main-1771867265739-0", "url": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867265732-jth8hjr8hyl.jpg", "name": "20230408_004600789_iOS", "sort_order": 0}, {"id": "main-1771868070635", "url": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771868070632-eelcb488wza.jpg", "name": "20230408_004602481_iOS", "sort_order": 1}], "gallery": [{"id": "gallery-1771867273210-0", "url": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771867273198-88hmbp0ttxc.jpg", "title": "234234", "sort_order": 0, "description": "We offer two style options - two-finger pinch pleated or three-finger pinch pleated - and two operate options: center open or one-way open (stack left or right). In addition, we have three sunblock options - no liner, light filtering liner, or 100% blackout liner.\\n"}, {"id": "gallery-1771868086922", "url": "/uploads/products/c0945fab-d9a5-46ca-a40e-63d35ab38d75/1771868086919-obq83u48tr.jpg", "title": "", "sort_order": 1, "description": ""}]}, "params": {"max_height": 240, "fabric_width": 55, "height_trigger": 120, "base_multiplier": 1.5, "height_allowance": 16, "increment_per_12": 0.1, "width_multiplier": 3}, "options": [{"id": "pleat_style", "name": "pleat_style", "type": "select", "values": [{"id": "value-1771820888559", "label": "2 Fold Pinch Pleat", "value": "2 Fold Pinch", "params": {}, "sort_order": 0}, {"id": "value-1771867637355", "label": "3 Fold Pinch Pleat", "value": "3 Fold Pinch", "params": {}, "sort_order": 1}, {"id": "value-1771867692793", "label": "2 Fold Tailored Pleat", "value": "2 Fold Tailored", "params": {}, "sort_order": 2}, {"id": "value-1771867714737", "label": "3 Fold Tailored Pleat", "value": "3 Fold Tailored", "params": {}, "sort_order": 3}], "display_label": "Pleat Style"}, {"id": "fabric_color", "name": "fabric_color", "type": "select", "values": [{"id": "value-1771867732004", "label": "Natural", "value": "Natural", "params": {"fabric_price": 20}, "sort_order": 0}, {"id": "value-1771867744199", "label": "Taupe", "value": "Taupe", "params": {"fabric_price": 20}, "sort_order": 1}], "display_label": "Fabric Color"}, {"id": "lining", "name": "lining", "type": "select", "values": [{"id": "value-1771867760879", "label": "No Lining", "value": "NO", "params": {"labor_price": 30, "lining_price": 0}, "sort_order": 0}, {"id": "value-1771867781310", "label": "Light Filtering Lining", "value": "LF", "params": {"labor_price": 36, "lining_price": 6}, "sort_order": 1}, {"id": "value-1771867807186", "label": "Blackout Lining", "value": "BO", "params": {"labor_price": 40, "lining_price": 8}, "sort_order": 2}], "display_label": "Lining"}, {"id": "operation", "name": "operation", "type": "select", "values": [{"id": "value-1771867973974", "label": "Center Split", "value": "C/O", "params": {"stack_divisor": 2}, "sort_order": 0}, {"id": "value-1771867996939", "label": "One Way Stack Left", "value": "O/L", "params": {"stack_divisor": 1}, "sort_order": 1}, {"id": "value-1771868013979", "label": "One Way Stack Right", "value": "O/R", "params": {"stack_divisor": 1}, "sort_order": 2}], "display_label": "Operation"}, {"id": "return", "name": "return", "type": "select", "values": [{"id": "value-1771985504128", "label": "3 1/2 inches", "value": "3 1/2", "params": {}, "sort_order": 0}, {"id": "value-1771985520042", "label": "6 inches", "value": "6", "params": {}, "sort_order": 1}, {"id": "value-1771985537247", "label": "6 3/4 inches", "value": "6.75", "params": {}, "sort_order": 2}], "display_label": "Return"}], "sort_order": 1, "description": "Designer Spot Linen Pinch Pleated Drapery.Custom Made Fabric Window Treatment Light Filtering Lining Blackout Lining Any Size Drapery", "is_featured": true, "content_blocks": [{"id": "how_to_measure", "icon": "📏", "title": "How to Measure", "content": "**Width:**\\n- Measure the width of your window or the area you want to cover\\n- For a fuller look, we recommend ordering 2.5–3× the actual width\\n- Our calculator automatically accounts for fullness\\n\\n**Height:**\\n- Measure from the top of the rod to where you want the drapery to end\\n- Floor length: deduct 1/2\\" to 1\\" from floor; sill or apron length also available\\n- Add extra length if you want pooling at the bottom for a luxurious look", "enabled": true, "sort_order": 0}, {"id": "fabric_lining", "icon": "✨", "title": "Fabric & Lining", "content": "Our pinch pleat draperies are meticulously handcrafted from premium fabrics. Each pleat is sewn with precision to create elegant, consistent folds.\\n\\n**Lining Options:**\\n- **No Lining** – Lighter, casual look with natural light flow\\n- **Light Filtering** – Reduces light while maintaining some glow\\n- **Blackout** – Maximum light blocking and privacy, ideal for bedrooms", "enabled": true, "sort_order": 1}, {"id": "custom_made", "icon": "✂️", "title": "Custom Made Product", "content": "Each drapery panel is custom-made to your exact specifications. Our skilled craftspeople hand-sew every pleat and hem to ensure premium quality and a perfect fit for your windows.", "enabled": true, "sort_order": 2}, {"id": "care", "icon": "🧺", "title": "Care Instructions", "content": "- **Professional Cleaning Recommended:** Dry clean for best results\\n- **Home Care:** Gentle machine wash on delicate cycle (remove hooks first)\\n- **Drying:** Hang to dry or tumble dry on low heat\\n- **Ironing:** Steam or iron on low heat on reverse side\\n- **Regular Maintenance:** Vacuum with upholstery attachment to remove dust", "enabled": true, "sort_order": 3}, {"id": "returns", "icon": "🔄", "title": "Return & Exchange Policy", "content": "⚠️ As these draperies are **custom-made**, we cannot accept returns for \\"changed my mind\\" or \\"wrong fabric choice\\" if made according to your order.\\n\\n- ✓ **Manufacturing Defects:** Free replacement within 30 days\\n- ✓ **Measurement Errors:** We'll remake if our error; customer pays shipping for their mistakes\\n- ✓ **Quality Guarantee:** We stand behind our craftsmanship", "enabled": true, "sort_order": 4}, {"id": "questions", "icon": "💬", "title": "Questions?", "content": "Need help choosing the right pleat style, measuring your windows, or selecting a lining? Contact us before ordering to ensure you get exactly what you need.", "enabled": true, "sort_order": 5}]}	t	2026-02-22 20:29:18.288591-08	2026-03-09 23:57:53.95516-07	5a3fead7-feed-4309-88b2-679feb75eaba
01d7902c-d402-4da3-99e4-700c5fb9f6cc	9f54ce2a-dc7e-4382-85a2-96c50222bac6	DRAPERY-1771872837088	Traverse H-Rail	0.00	["/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771872884835-c4l6l9s45b.jpg"]	{"images": {"main": [{"id": "main-1771872884838", "url": "/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771872884835-c4l6l9s45b.jpg", "name": "20230408_004543033_iOS", "sort_order": 0}, {"id": "main-1771874585650", "url": "/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771874585645-865ovsd7kir.jpg", "name": "20230408_004541727_iOS", "sort_order": 1}, {"id": "main-1771874586841", "url": "/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771874586778-p0g1n2jyc7.jpg", "name": "20230408_004600789_iOS", "sort_order": 2}, {"id": "main-1771874587665", "url": "/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771874587610-k5kmtajcap.jpg", "name": "20230408_004603316_iOS", "sort_order": 3}, {"id": "main-1771874588594", "url": "/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771874588517-lq1wvm3ps7o.jpg", "name": "20230408_004558472_iOS", "sort_order": 4}, {"id": "main-1771874589678", "url": "/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771874589609-xwk5i6qim2.jpg", "name": "20230408_004540131_iOS", "sort_order": 5}, {"id": "main-1771874590744", "url": "/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771874590741-2gm0tlppxrk.jpg", "name": "20230408_004601595_iOS", "sort_order": 6}], "gallery": [{"id": "gallery-1771872905687", "url": "/uploads/products/01d7902c-d402-4da3-99e4-700c5fb9f6cc/1771872905684-gxvjns6fso6.jpg", "title": "", "sort_order": 0, "description": ""}]}, "options": [{"id": "rod", "name": "rod", "type": "select", "values": [{"id": "value-1771873312494", "label": "Single Rod", "value": "Single", "params": {"fixed_price": 200, "price_per_foot": 30}, "sort_order": 0}, {"id": "value-1771873328634", "label": "Double Rod", "value": "Double", "params": {"fixed_price": 200, "price_per_foot": 50}, "sort_order": 1}], "display_label": "Rod"}, {"id": "finial", "name": "finial", "type": "select", "values": [{"id": "value-1771873363641", "label": "End Cap", "value": "End Cap", "params": {"finial_price": 6, "finial_length": 0.125}, "sort_order": 0}, {"id": "value-1771873407879", "label": "Flat Round Finial", "value": "Flat Round Finial", "params": {"finial_price": 10, "finial_length": 0.125}, "sort_order": 1}, {"id": "value-1771873426181", "label": "Ball Finial", "value": "Ball Finial", "params": {"finial_price": 20, "finial_length": 3}, "sort_order": 2}], "display_label": "Finial"}, {"id": "color", "name": "color", "type": "select", "values": [{"id": "value-1771873452107", "label": "Stain Gold", "value": "Stain Gold", "params": {}, "sort_order": 0}, {"id": "value-1771873470121", "label": "Matte Black", "value": "Black", "params": {}, "sort_order": 1}, {"id": "value-1771873504685", "label": "Satin Nickel", "value": "Satin Nickel", "params": {}, "sort_order": 2}, {"id": "value-1771873520351", "label": "Brushed Nickel", "value": "Brushed Nickel", "params": {}, "sort_order": 3}, {"id": "value-1771873534452", "label": "Antique Pewter", "value": "Antique Pewter", "params": {}, "sort_order": 4}], "display_label": "Color"}], "sort_order": 0, "description": "123", "is_featured": true}	t	2026-02-23 10:53:57.088289-08	2026-03-09 18:29:23.146201-07	d2dd1cfc-e2a2-4c54-b8a3-c24879812570
104c89ef-e4b7-479d-9a96-f515f9fb08cf	49f1e37c-116f-4e74-8a4f-d0e2376a99ca	DRAPERY-1771870912987-copy-727516	LF Roller Shade (副本)	0.00	["/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871006807-3q8wesnv615.jpg"]	{"images": {"main": [{"id": "main-1771871006812", "url": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871006807-3q8wesnv615.jpg", "name": "FC605 (4)", "sort_order": 0}, {"id": "main-1771871002417", "url": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871002390-y985n8zdw9.jpg", "name": "FC605-01", "sort_order": 1}, {"id": "main-1771871003384", "url": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871003338-uq79unww18.jpg", "name": "FC605-02", "sort_order": 2}, {"id": "main-1771871004302", "url": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871004247-tszi1468gxc.jpg", "name": "FC605-05", "sort_order": 3}, {"id": "main-1771871005159", "url": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871005107-qzny94hkcg8.jpg", "name": "FC605-03", "sort_order": 4}, {"id": "main-1771871006030", "url": "/uploads/products/f8d160c9-e844-4b23-a3ba-5de4f6c1e919/1771871005967-9y08xx2hecl.jpg", "name": "FC605-04", "sort_order": 5}], "gallery": []}, "params": {"height_adjustment": 20, "hardware_unit_price": 20}, "options": [{"id": "mounting", "name": "mounting", "type": "select", "values": [{"id": "value-1771871127110", "label": "Inside Mount", "value": "IM", "params": {}, "sort_order": 0}, {"id": "value-1771871139587", "label": "Outside Mount", "value": "OM", "params": {}, "sort_order": 1}], "display_label": "Mounting"}, {"id": "fabric_code", "name": "fabric_code", "type": "select", "values": [{"id": "value-1771871160857", "label": "White", "value": "FC605-01", "params": {"fabric_price": 80}, "sort_order": 0}, {"id": "value-1771871188369", "label": "Beidge", "value": "FC605-02", "params": {"fabric_price": 80}, "sort_order": 1}, {"id": "value-1771871241908", "label": "Grey", "value": "FC605-03", "params": {"fabric_price": 80}, "sort_order": 2}], "display_label": "Fabric Code"}, {"id": "operation", "name": "operation", "type": "select", "values": [{"id": "value-1771871300630", "label": "Manul Chain", "value": "Chain Match Color", "params": {"controller_price": 10}, "sort_order": 0}, {"id": "value-1771871322607", "label": "Stainless Chain", "value": "304", "params": {"controller_price": 20}, "sort_order": 1}, {"id": "value-1771871336754", "label": "Cordless", "value": "Cordless", "params": {"controller_price": 40}, "sort_order": 2}, {"id": "value-1771871375377", "label": "Motorized RF", "value": "25 RF Motor", "params": {"controller_price": 120}, "sort_order": 3}, {"id": "value-1771871408378", "label": "Motorized Matter", "value": "25 Matter Motor", "params": {"controller_price": 160}, "sort_order": 4}], "display_label": "Operation"}, {"id": "control_side", "name": "control_side", "type": "select", "values": [{"id": "value-1771871432398", "label": "Left", "value": "L", "params": {}, "sort_order": 0}, {"id": "value-1771871441801", "label": "Right", "value": "R", "params": {}, "sort_order": 1}], "display_label": "Control Side"}], "sort_order": 1, "description": "Roller Shade", "is_featured": true, "starting_price": 104}	t	2026-02-23 10:52:07.516659-08	2026-02-24 18:32:36.623774-08	bbb9e912-8161-4320-b86a-d302cacbdfd5
\.


--
-- Data for Name: settings_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings_history (id, setting_key, old_value, new_value, actor_email, changed_at) FROM stdin;
0c0b9d81-dd47-44b0-8178-b3d068408775	online_store_enabled	false	true	ghost5566ac@gmail.com	2026-03-09 18:28:45.633435-07
2e4cc206-aaf1-4437-ac09-76ec0e2238df	online_store_enabled	true	false	ghost5566ac@gmail.com	2026-03-09 18:28:50.418084-07
252a3d1c-3832-4884-8b84-388ccde519cb	online_store_enabled	false	true	ghost5566ac@gmail.com	2026-03-09 18:28:52.354888-07
b67ca071-7b29-4b4e-b794-4649b3100d01	online_store_enabled	true	false	ghost5566ac@gmail.com	2026-03-09 18:29:57.645605-07
662c576d-d073-400a-bda7-f7fbb0827345	online_store_enabled	false	true	ghost5566ac@gmail.com	2026-03-09 18:30:31.410419-07
a90e847e-4aac-4613-b6f4-3c14ab2fec6a	online_store_enabled	true	false	ghost5566ac@gmail.com	2026-03-09 18:33:58.330796-07
14d8777b-5c2e-42ff-a054-f1314b8d2f8c	online_store_enabled	false	true	ghost5566ac@gmail.com	2026-03-09 23:51:58.333985-07
\.


--
-- Data for Name: showcase_product_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.showcase_product_images (id, product_id, image_url, image_width, image_height, image_fit, caption, image_type, sort_order, created_at) FROM stdin;
\.


--
-- Data for Name: showcase_product_sections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.showcase_product_sections (id, product_id, title, description, image_url, image_width, image_height, image_fit, sort_order, created_at) FROM stdin;
\.


--
-- Data for Name: showcase_products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.showcase_products (id, name, slug, description, long_description, features, cover_image, cover_width, cover_height, cover_fit, status, sort_order, created_at, updated_at, source, href, category) FROM stdin;
2	Alustra® Architectural Roller Shades	alustra-architectural	The innovative form of Alustra® Architectural Shades infuses a soft yet structural beauty at the window. Sophisticated fabrics combined with a unique linear design.		[]	/hunter-douglas/alustra-architectural/page006_img01_2903x1956.jpeg	0	0	cover	active	0	2026-03-09 18:44:29.273891-07	2026-03-09 18:44:29.273891-07	hardcoded	/products/alustra-architectural	sheers
3	Alustra® Woven Textures®	alustra-woven-textures	Alustra® Woven Textures® offer an exclusive collection of richly woven fabrics with intricate patterns and refined colorways for Hunter Douglas window treatments.		[]	/hunter-douglas/alustra-woven-textures/page002_img01_2028x1953.jpeg	0	0	cover	active	1	2026-03-09 18:44:29.680164-07	2026-03-09 18:44:29.680164-07	hardcoded	/products/alustra-woven-textures	sheers
4	Applause® Honeycomb Shades	applause	Applause® Honeycomb Shades feature a unique two-cell construction that provides extra insulation and a sophisticated look with an extensive palette of colors.		[]	/hunter-douglas/applause/page002_img01_2105x1505.jpeg	0	0	cover	active	2	2026-03-09 18:44:29.680815-07	2026-03-09 18:44:29.680815-07	hardcoded	/products/applause	shades
5	Aria™ On & Off Track Blinds	aria	Aria™ On & Off Track Blinds offer a versatile, modern solution with curved vanes that rotate to adjust light and slide effortlessly along a track.		[]	/hunter-douglas/aria/page002_img01_2105x1505.jpeg	0	0	cover	active	3	2026-03-09 18:44:29.681518-07	2026-03-09 18:44:29.681518-07	hardcoded	/products/aria	sheers
6	Duette® Honeycomb Shades	duette	Duette® Honeycomb Shades set the standard for energy-efficient window fashions with their patented honeycomb construction that traps air to insulate your home.		[]	/hunter-douglas/duette/page002_img01_2105x1505.jpeg	0	0	cover	active	4	2026-03-09 18:44:29.681939-07	2026-03-09 18:44:29.681939-07	hardcoded	/products/duette	shades
7	EverWood® & Parkland® Blinds	everwood-parkland	EverWood® and Parkland® alternative wood and real wood blinds deliver the beauty of genuine wood with options designed to resist fading, warping, and bowing.		[]	/hunter-douglas/everwood-parkland/page002_img01_1391x1003.jpeg	0	0	cover	active	5	2026-03-09 18:44:29.682226-07	2026-03-09 18:44:29.682226-07	hardcoded	/products/everwood-parkland	blinds
8	Heritance® & NewStyle® Shutters	heritance-newstyle	Heritance® hardwood and NewStyle® hybrid shutters combine timeless beauty with modern innovation for enduring quality and charm.		[]	/hunter-douglas/heritance-newstyle/page002_img01_2105x1505.jpeg	0	0	cover	active	6	2026-03-09 18:44:29.682519-07	2026-03-09 18:44:29.682519-07	hardcoded	/products/heritance-newstyle	shutters
9	Luminette® Privacy Sheers	luminette	Luminette® Privacy Sheers combine the beauty of sheer draperies with the light control and privacy of a blind, perfect for wide windows and sliding glass doors.		[]	/hunter-douglas/luminette/page002_img01_2105x1505.jpeg	0	0	cover	active	7	2026-03-09 18:44:29.682789-07	2026-03-09 18:44:29.682789-07	hardcoded	/products/luminette	sheers
10	Modern Precious Metals®	modern-precious-metals	Modern Precious Metals® aluminum blinds feature sleek profiles with a curated collection of metallic finishes for a contemporary, refined look.		[]	/hunter-douglas/modern-precious-metals/page002_img01_2105x1505.jpeg	0	0	cover	active	8	2026-03-09 18:44:29.683052-07	2026-03-09 18:44:29.683052-07	hardcoded	/products/modern-precious-metals	blinds
11	Nantucket™ Window Shadings	nantucket	Nantucket™ Window Shadings blend the softness of a sheer with the precise light control of a blind, creating a relaxed coastal-inspired elegance.		[]	/hunter-douglas/nantucket/page002_img01_2105x1505.jpeg	0	0	cover	active	9	2026-03-09 18:44:29.683263-07	2026-03-09 18:44:29.683263-07	hardcoded	/products/nantucket	sheers
12	Palm Beach™ Shutters	palm-beach	Palm Beach™ Polysatin™ shutters are built to last with a UV-resistant compound that resists warping, cracking, fading, and discoloring—guaranteed for life.		[]	/hunter-douglas/palm-beach/page002_img01_2106x1506.jpeg	0	0	cover	active	10	2026-03-09 18:44:29.704-07	2026-03-09 18:44:29.704-07	hardcoded	/products/palm-beach	shutters
13	Pirouette® Window Shadings	pirouette	Pirouette® Window Shadings feature soft horizontal fabric vanes attached to a single sheer backing that gently diffuses incoming light.		[]	/hunter-douglas/pirouette/page002_img01_4209x3009.jpeg	0	0	cover	active	11	2026-03-09 18:44:29.704408-07	2026-03-09 18:44:29.704408-07	hardcoded	/products/pirouette	sheers
14	Provenance® Woven Wood Shades	provenance	Provenance® Woven Wood Shades are hand-woven from natural materials like reeds, grasses, and woods, bringing organic texture and warmth to your home.		[]	/hunter-douglas/provenance/page002_img01_2363x1768.jpeg	0	0	cover	active	12	2026-03-09 18:44:29.704812-07	2026-03-09 18:44:29.704812-07	hardcoded	/products/provenance	shades
15	Roller & Skyline® Shades	roller-skyline	Roller and Skyline® Gliding Window Panels offer clean lines and modern styling, available in an extensive range of on-trend fabrics and colors.		[]	/hunter-douglas/roller-skyline/page003_img01_2930x1541.jpeg	0	0	cover	active	13	2026-03-09 18:44:29.758371-07	2026-03-09 18:44:29.758371-07	hardcoded	/products/roller-skyline	shades
16	Screen & Skyline® Shades	screen-skyline	Screen and Skyline® shades provide solar protection while maintaining your view, available in a range of openness factors and contemporary fabrics.		[]	/hunter-douglas/screen-skyline/page002_img01_4328x3009.jpeg	0	0	cover	active	14	2026-03-09 18:44:29.75889-07	2026-03-09 18:44:29.75889-07	hardcoded	/products/screen-skyline	shades
17	Silhouette® Window Shadings	silhouette	Silhouette® Window Shadings transform harsh sunlight into beautiful ambient glow with signature S-shaped vanes suspended between two sheers.		[]	/hunter-douglas/silhouette/page002_img01_2105x1505.jpeg	0	0	cover	active	15	2026-03-09 18:44:29.759185-07	2026-03-09 18:44:29.759185-07	hardcoded	/products/silhouette	sheers
18	Sonnette™ Cellular Roller Shades	sonnette	Sonnette™ Cellular Roller Shades combine the clean look of a roller shade with the energy efficiency of a cellular shade in a curved modern design.		[]	/hunter-douglas/sonnette/page002_img01_2105x1505.jpeg	0	0	cover	active	16	2026-03-09 18:44:29.759651-07	2026-03-09 18:44:29.759651-07	hardcoded	/products/sonnette	shades
19	Design Studio™ Banded Shades	us-banded	Design Studio™ Banded Shades create striking visual effects with alternating sheer and solid fabric bands that shift to control light and privacy.		[]	/hunter-douglas/us-banded/page002_img01_2059x1715.jpeg	0	0	cover	active	17	2026-03-09 18:44:29.759857-07	2026-03-09 18:44:29.759857-07	hardcoded	/products/us-banded	shades
20	Vertical Blinds Collection	verticals	Vertical Blinds offer a versatile and practical solution for large windows and sliding doors, with a wide selection of materials, textures, and colors.		[]	/hunter-douglas/verticals/page002_img01_1935x1505.jpeg	0	0	cover	active	18	2026-03-09 18:44:29.760114-07	2026-03-09 18:44:29.760114-07	hardcoded	/products/verticals	blinds
21	Vignette® Modern Roman Shades	vignette	Vignette® Modern Roman Shades feature consistent folds with no exposed rear cords, creating a clean, tailored look in both raised and lowered positions.		[]	/hunter-douglas/vignette/page002_img01_4210x3010.jpeg	0	0	cover	active	19	2026-03-09 18:44:29.760287-07	2026-03-09 18:44:29.760287-07	hardcoded	/products/vignette	shades
22	Luma Collection — Zebra Shades	luma-collection	Premium zebra shades with dual-layer light control. Available in cordless, motorized, and smart home options. 46 fabric patterns, 220+ colors.		[]	/luma-collection/lifestyle-dark-livingroom.png	0	0	cover	active	100	2026-03-09 18:44:29.76046-07	2026-03-09 18:44:29.76046-07	hardcoded	/products/luma-collection	shades
23	Luma Roller Shades	roller-collection	Precision-crafted roller shades in blackout, light-filtering, and solar screen fabrics. 82 patterns, 354+ colors, smart home ready.		[]	/roller-collection/detail-square-cassette.png	0	0	cover	active	101	2026-03-09 18:44:29.760628-07	2026-03-09 18:44:29.760628-07	hardcoded	/products/roller-collection	shades
24	Sheer Collection	sheer-collection	Elegant sheer shades with soft diffused light. Multiple mounting options and motorization available.		[]	/sheer-collection/lifestyle-sheer-living-room.png	0	0	cover	active	102	2026-03-09 18:44:29.760926-07	2026-03-09 18:44:29.760926-07	hardcoded	/products/sheer-collection	sheers
25	Handcrafted Drapery	handcrafted-drapery	Premium made-to-measure drapery with refined hand-finished construction, rich fabric options, and experienced design guidance.		[]	/drapery/handcrafted-drapery/IMG_0547.JPG	0	0	cover	active	103	2026-03-09 18:44:29.761319-07	2026-03-09 18:44:29.761319-07	hardcoded	/products/handcrafted-drapery	custom
26	Handcrafted Roman Shades	handcrafted-roman-shade	Custom-crafted roman shades with clean fold lines, premium fabrics, and optional lining. Made to your exact window dimensions.		[]	/drapery/handcrafted-drapery/IMG_0993.jpg	0	0	cover	active	104	2026-03-09 18:44:29.761576-07	2026-03-09 18:44:29.761576-07	hardcoded	/products/handcrafted-roman-shade	custom
27	Handcrafted Top Treatments	handcrafted-top-treatment	Valances, cornices, and swags crafted to complement your window treatments and interior design.		[]	/drapery/handcrafted-drapery/IMG_1304.jpg	0	0	cover	active	105	2026-03-09 18:44:29.76178-07	2026-03-09 18:44:29.76178-07	hardcoded	/products/handcrafted-top-treatment	custom
28	Lutron Palladiom Shading	lutron-palladiom	Premium motorized shading system with precision engineering, whisper-quiet operation, and full smart home integration.		[]	/lutron/palladiom/p4-living-room.jpg	0	0	cover	active	106	2026-03-09 18:44:29.761968-07	2026-03-09 18:44:29.761968-07	hardcoded	/products/lutron-palladiom	motorized
\.


--
-- Data for Name: site_content; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_content (id, page, section, field_key, field_type, content, image_url, image_width, image_height, image_fit, sort_order, metadata, created_at, updated_at, is_published) FROM stdin;
8dd299a1-ee65-4ded-8ffa-d392014ddbed	home	about	title	text	We Make Handcrafted Drapery		0	0	cover	0	{}	2026-02-23 12:33:51.685941-08	2026-02-23 12:33:51.685941-08	t
299f9657-c745-4107-94bd-5744627e281c	home	about	highlight	text	40 years experience		0	0	cover	1	{}	2026-02-23 12:33:51.686275-08	2026-02-23 12:33:51.686275-08	t
a283cf90-6f40-403e-a6f5-cd4a52368b88	home	about	subtitle	text	focus on handcrafted drapery		0	0	cover	2	{}	2026-02-23 12:33:51.686542-08	2026-02-23 12:33:51.686542-08	t
c822bbd7-380d-47ce-9ca9-c852d6380239	home	about	description	richtext	Designing, measuring, and installing custom window treatments has never been easier with our team of experienced professionals.		0	0	cover	3	{}	2026-02-23 12:33:51.686798-08	2026-02-23 12:33:51.686798-08	t
4772fb9f-6024-43f6-9ffe-be089226f961	home	process	title	text	THE PROCESS		0	0	cover	0	{}	2026-02-23 12:33:51.687224-08	2026-02-23 12:33:51.687224-08	t
b9325895-9efe-4d75-910a-657f9ace9502	home	process	subtitle	text	Designing, measuring, and installing custom window treatments has never been easier with our team of experienced professionals.		0	0	cover	1	{}	2026-02-23 12:33:51.687388-08	2026-02-23 12:33:51.687388-08	t
02ff6bcc-e918-4d46-8b9d-f9794e620b71	home	process	step_1_title	text	DESIGN CONSULTATION		0	0	cover	2	{}	2026-02-23 12:33:51.687541-08	2026-02-23 12:33:51.687541-08	t
47e33152-283e-46ae-a433-2ca3d22a4cbf	home	process	step_1_desc	richtext	Our design consultants work directly with you to select the perfect curtains, custom window coverings, that will suit your style and functional needs.		0	0	cover	3	{}	2026-02-23 12:33:51.68769-08	2026-02-23 12:33:51.68769-08	t
49e9a7f6-a6e1-4029-8319-1913bb77ce5f	home	process	step_2_title	text	IN-HOME MEASUREMENT		0	0	cover	5	{}	2026-02-23 12:33:51.688003-08	2026-02-23 12:33:51.688003-08	t
dc4ed93e-abb2-4d24-9d2b-db5cd47aa9bc	home	process	step_2_desc	richtext	After you have chosen the perfect window treatments for your home, we will schedule an in-home measurement appointment to ensure your drapes fit perfectly.		0	0	cover	6	{}	2026-02-23 12:33:51.688156-08	2026-02-23 12:33:51.688156-08	t
f7b7e2e9-e617-44ae-815b-7c78110271db	home	process	step_3_title	text	PROFESSIONAL INSTALLATION		0	0	cover	8	{}	2026-02-23 12:33:51.688493-08	2026-02-23 12:33:51.688493-08	t
52c501ad-4427-4831-9eda-3ec83183b4f1	home	process	step_3_desc	richtext	Once you have placed your order, simply schedule a time that works for you, and our experts will come to your home or office and meticulously install your new shades.		0	0	cover	9	{}	2026-02-23 12:33:51.68874-08	2026-02-23 12:33:51.68874-08	t
df491318-b21e-436c-b5c6-2602b8b839e4	home	contact	title	text	Contact		0	0	cover	0	{}	2026-02-23 12:33:51.689065-08	2026-02-23 12:33:51.689065-08	t
070cbd43-f353-47fe-a0e7-a37e29c0f5d9	home	contact	subtitle	text	Thank you for visiting our website. For more information and special requests, please contact us today.		0	0	cover	1	{}	2026-02-23 12:33:51.689245-08	2026-02-23 12:33:51.689245-08	t
8cc98078-c7dd-4d80-b463-52b0014f8c8d	home	contact	address	text	8831 E Las Tunas Dr, Temple City, CA, 91780		0	0	cover	2	{}	2026-02-23 12:33:51.689417-08	2026-02-23 12:33:51.689417-08	t
921e4ffb-604f-47ef-b7d5-7bbb2cd500d8	home	contact	email	text	angeldrapery2100@yahoo.com		0	0	cover	3	{}	2026-02-23 12:33:51.689573-08	2026-02-23 12:33:51.689573-08	t
7431249f-3ea1-402f-9f62-4710584ebe63	home	contact	phone_1	text	626-451-9841		0	0	cover	4	{}	2026-02-23 12:33:51.689743-08	2026-02-23 12:33:51.689743-08	t
d6bc88b9-7da5-4d57-903a-8dc37298b8ab	home	contact	phone_2	text	626-451-9840		0	0	cover	5	{}	2026-02-23 12:33:51.690103-08	2026-02-23 12:33:51.690103-08	t
c1e4a64c-666c-4837-83cd-591f52b98345	home	contact	phone_3	text	626-703-2929		0	0	cover	6	{}	2026-02-23 12:33:51.690274-08	2026-02-23 12:33:51.690274-08	t
5ae68240-daca-4eeb-bd7b-2016627d21ef	about	hero	title	text	About Us		0	0	cover	0	{}	2026-02-23 12:33:51.690753-08	2026-02-23 12:33:51.690753-08	t
30828d51-fb4e-4208-bd76-5dedb7cb4eab	about	hero	subtitle	text	40 Years of Excellence in Custom Window Treatments		0	0	cover	1	{}	2026-02-23 12:33:51.690914-08	2026-02-23 12:33:51.690914-08	t
6f9addc0-00a9-4dd4-bdb6-02a3ee18f741	about	hero	bg_image	image	About Hero Background		1920	800	cover	2	{}	2026-02-23 12:33:51.691062-08	2026-02-23 12:33:51.691062-08	t
fdab616f-27fc-43ba-b83a-e1f1a15f5a0e	about	story	title	text	Our Story		0	0	cover	0	{}	2026-02-23 12:33:51.691219-08	2026-02-23 12:33:51.691219-08	t
6622f9ec-2aef-42af-9934-df66830be948	about	story	paragraph_1	richtext	Founded in 1984, Angel Drapery has been serving the greater Los Angeles area for over 40 years. What started as a small family business has grown into one of the most trusted names in custom window treatments.		0	0	cover	1	{}	2026-02-23 12:33:51.691376-08	2026-02-23 12:33:51.691376-08	t
20813806-af07-4b3f-b75f-4384f37381cd	about	story	paragraph_2	richtext	Our commitment to quality craftsmanship and exceptional customer service has remained unchanged throughout the years. Every piece we create is handcrafted with meticulous attention to detail.		0	0	cover	2	{}	2026-02-23 12:33:51.691528-08	2026-02-23 12:33:51.691528-08	t
b019a53b-b496-4565-ba52-1f0c48d8312c	about	story	paragraph_3	richtext	Today, we continue to combine traditional techniques with modern technology, working with the finest brands in the industry to deliver stunning results for our clients.		0	0	cover	3	{}	2026-02-23 12:33:51.691678-08	2026-02-23 12:33:51.691678-08	t
4563262e-ec1d-4c1d-b9f6-724e6252f9d0	home	gallery	project_1	image	Langston 2 Fold Pinch Pleat Sheer	/uploads/site/home/1772686509902-moihlt1541f.jpg	400	533	cover	0	{}	2026-02-23 12:33:51.6829-08	2026-03-04 20:55:53.559166-08	t
d47ae4e5-8257-4b43-927a-5309deb0896c	home	gallery	project_7	image	Sheer Roman Shade	/uploads/site/home/1772686665029-viseidom8vf.jpg	400	533	cover	6	{}	2026-02-23 12:33:51.68459-08	2026-03-04 20:59:05.138499-08	t
1a178208-ef96-4e22-87f0-ffd32ae63a7b	home	gallery	project_3	image	Ripple Fold Linen Fabric Natural	/uploads/site/home/1772686580437-7z36taec7n3.jpg	400	533	cover	2	{}	2026-02-23 12:33:51.683674-08	2026-03-04 20:56:37.987306-08	t
af30be58-819f-432b-810c-75b1424f0375	home	gallery	project_5	image	Woven Shade + Drapery	/uploads/site/home/1772686626806-8dl59wyp60k.jpg	400	533	cover	4	{}	2026-02-23 12:33:51.684135-08	2026-03-04 20:57:19.581434-08	t
db6f79db-3496-4b98-824e-d66adb1e9d02	home	gallery	project_9	image	Drapery	/uploads/site/home/1772686696568-as7khz8fo8l.jpg	400	533	cover	8	{}	2026-02-23 12:33:51.684989-08	2026-03-04 20:59:05.167867-08	t
445d61aa-b52c-48a4-9211-6a85db447965	home	gallery	project_10	image	Decor Drapery	/uploads/site/home/1772686711874-u23lc41lvvq.jpg	400	533	cover	9	{}	2026-02-23 12:33:51.685198-08	2026-03-04 20:59:05.178957-08	t
8ee6dea0-15c1-4129-91ce-bb4ff7918356	home	gallery	project_11	image	Drapery With Roman	/uploads/site/home/1772686730975-lvg8n3mi8pp.jpg	400	533	cover	10	{}	2026-02-23 12:33:51.685508-08	2026-03-04 20:59:05.189248-08	t
951b1358-f1c9-4f4b-a76a-fbf538cb66bb	home	hero	subtitle	text	  		0	0	cover	2	{}	2026-02-23 12:33:51.681802-08	2026-03-06 19:36:04.142627-08	t
46325e9a-416d-4053-bde0-7bcc0dc7b7f0	home	process	step_3_image	image	Professional Installation	/uploads/site/home/1772836244007-1v30yxhk699.png	480	270	cover	10	{}	2026-02-23 12:33:51.68891-08	2026-03-06 14:30:48.459331-08	t
6bd4d7d0-0008-4a29-ba85-ffaec919576d	home	process	step_1_image	image	Design Consultation	/uploads/site/home/1772836079902-izuxmm0jp8.png	480	270	cover	4	{}	2026-02-23 12:33:51.687842-08	2026-03-06 14:29:54.60011-08	t
76e7e6a5-f9ce-46a8-a03f-4c3cc4f27d68	about	story	image	image	Company History Image	/uploads/site/about/1772838587585-n2c8j2pcqol.jpg	600	800	cover	4	{}	2026-02-23 12:33:51.691851-08	2026-03-06 15:09:48.921519-08	t
2905e5d5-c973-4a02-ac08-d781572be15d	home	hero	video	video		/uploads/site/home/1772854361554-fu3n5hgz3qq.mp4	0	0	cover	0	{}	2026-02-23 12:33:51.675686-08	2026-03-06 19:32:43.61644-08	t
b7e4da94-eed5-4d61-b720-71cb65cd3d80	home	hero	tagline	text	Angel Drapery Since 1984 • 40 Years Experience  		0	0	cover	3	{}	2026-02-23 12:33:51.682244-08	2026-03-06 19:35:49.179004-08	t
66f3be83-52a8-42ba-afac-80c5b89a892a	home	hero	title_cn	text	  		0	0	cover	1	{}	2026-02-23 12:33:51.681315-08	2026-03-06 19:36:04.109158-08	t
5e621c46-1c9f-471a-9837-7814b1862f42	home	contact	qr_line	image	LINE QR Code	/uploads/site/home/1772858352826-szddprj9z7p.avif	128	128	contain	7	{}	2026-02-23 12:33:51.690433-08	2026-03-06 20:39:12.844875-08	t
84298661-5461-4d46-9d48-d44bc27504bb	home	contact	qr_wechat	image	WeChat QR Code	/uploads/site/home/1772858358832-0ys1use7wbw.avif	128	128	contain	8	{}	2026-02-23 12:33:51.690592-08	2026-03-06 20:39:18.849598-08	t
af1d1df7-7ffc-4d6b-adc2-eb760dc0ea7f	about	values	title	text	Our Values		0	0	cover	0	{}	2026-02-23 12:33:51.691998-08	2026-02-23 12:33:51.691998-08	t
10ad46d2-01b2-4714-a12f-e037302767b6	about	values	item_1_icon	text	🎨		0	0	cover	1	{}	2026-02-23 12:33:51.692645-08	2026-02-23 12:33:51.692645-08	t
caf97291-0488-446a-b377-d9f4b3505d1d	about	values	item_1_title	text	Quality Craftsmanship		0	0	cover	2	{}	2026-02-23 12:33:51.692855-08	2026-02-23 12:33:51.692855-08	t
ae41851b-afd7-4ac2-b926-9ca6332c0222	about	values	item_1_desc	richtext	Every piece is handcrafted with meticulous attention to detail, ensuring the highest quality standards.		0	0	cover	3	{}	2026-02-23 12:33:51.69302-08	2026-02-23 12:33:51.69302-08	t
ce04e70d-345e-4409-8cbb-b8ce691eec96	about	values	item_2_icon	text	👥		0	0	cover	4	{}	2026-02-23 12:33:51.693194-08	2026-02-23 12:33:51.693194-08	t
375128c9-2b65-405c-9915-e9c2a02bb40a	about	values	item_2_title	text	Customer First		0	0	cover	5	{}	2026-02-23 12:33:51.693342-08	2026-02-23 12:33:51.693342-08	t
0aceb493-3331-47ee-ad2f-6149cf155098	about	values	item_2_desc	richtext	Your satisfaction is our priority. We work closely with you from consultation to installation.		0	0	cover	6	{}	2026-02-23 12:33:51.693534-08	2026-02-23 12:33:51.693534-08	t
6e50b97b-2b87-432b-8736-c2b7d41a3eeb	about	values	item_3_icon	text	⭐		0	0	cover	7	{}	2026-02-23 12:33:51.693702-08	2026-02-23 12:33:51.693702-08	t
a6ce2c37-d51e-4d57-b044-ff65e3835e40	about	values	item_3_title	text	Expert Team		0	0	cover	8	{}	2026-02-23 12:33:51.693854-08	2026-02-23 12:33:51.693854-08	t
ba319083-6ea9-453b-99cb-b9b58dad1aa6	about	values	item_3_desc	richtext	40 years of combined experience in custom window treatments and interior design.		0	0	cover	9	{}	2026-02-23 12:33:51.694006-08	2026-02-23 12:33:51.694006-08	t
a8ab746c-69fd-4186-bca0-d3d93d535f2d	about	values	item_4_icon	text	💎		0	0	cover	10	{}	2026-02-23 12:33:51.694157-08	2026-02-23 12:33:51.694157-08	t
c348fc30-5e9c-4cb7-9830-13b69523bac8	about	values	item_4_title	text	Premium Materials		0	0	cover	11	{}	2026-02-23 12:33:51.694316-08	2026-02-23 12:33:51.694316-08	t
bb203bce-8862-4d18-986d-801bc6d002c4	about	values	item_4_desc	richtext	We use only the finest fabrics and hardware from trusted brands like Hunter Douglas and Somfy.		0	0	cover	12	{}	2026-02-23 12:33:51.694517-08	2026-02-23 12:33:51.694517-08	t
cf91d309-f449-4fc5-88cf-70557a5122f6	about	services	title	text	Our Services		0	0	cover	0	{}	2026-02-23 12:33:51.694668-08	2026-02-23 12:33:51.694668-08	t
bac1aedf-e3d0-4da1-bbac-9fc2ad2f2705	about	services	item_1_title	text	Design Consultation		0	0	cover	1	{}	2026-02-23 12:33:51.694814-08	2026-02-23 12:33:51.694814-08	t
0c9c1ce9-3675-42a0-9a88-06effa6ea064	about	services	item_1_desc	richtext	Expert advice on fabrics, styles, and perfect solutions for your space		0	0	cover	2	{}	2026-02-23 12:33:51.694957-08	2026-02-23 12:33:51.694957-08	t
67bf5d2d-f07f-451e-b799-28fc9c87820b	about	services	item_1_image	image	Design		400	400	cover	3	{}	2026-02-23 12:33:51.69511-08	2026-02-23 12:33:51.69511-08	t
f3cc57aa-aa52-424b-a180-a03a7c043cf6	about	services	item_2_title	text	In-Home Measurement		0	0	cover	4	{}	2026-02-23 12:33:51.695278-08	2026-02-23 12:33:51.695278-08	t
c49b1d46-2ebc-48f2-929b-219a4c505c64	about	services	item_2_desc	richtext	Precise measurements to ensure perfect fit and function		0	0	cover	5	{}	2026-02-23 12:33:51.695446-08	2026-02-23 12:33:51.695446-08	t
60d5590c-5406-4c01-9764-34fb43f09fb2	about	services	item_2_image	image	Measurement		400	400	cover	6	{}	2026-02-23 12:33:51.695594-08	2026-02-23 12:33:51.695594-08	t
b38e455c-b129-4a90-9449-779888aa977b	about	services	item_3_title	text	Professional Installation		0	0	cover	7	{}	2026-02-23 12:33:51.695747-08	2026-02-23 12:33:51.695747-08	t
003a1dc1-af4f-4c5c-b672-e378e23ef139	about	services	item_3_desc	richtext	Expert installation by our trained professionals		0	0	cover	8	{}	2026-02-23 12:33:51.695899-08	2026-02-23 12:33:51.695899-08	t
6a743143-d6fd-497c-8f13-402822b86ade	about	services	item_3_image	image	Installation		400	400	cover	9	{}	2026-02-23 12:33:51.696104-08	2026-02-23 12:33:51.696104-08	t
d71d9201-9898-4045-b8e7-d6e7eaed7b1d	about	brands	title	text	Our Brand Partners		0	0	cover	0	{}	2026-02-23 12:33:51.6963-08	2026-02-23 12:33:51.6963-08	t
262edb5c-8998-4510-87d5-b68ba9fb9f30	about	brands	brand_1_name	text	Hunter Douglas		0	0	cover	1	{}	2026-02-23 12:33:51.696532-08	2026-02-23 12:33:51.696532-08	t
0f501586-346f-44f5-a9a7-90b90a3396c3	about	brands	brand_1_logo	image	Hunter Douglas		200	200	contain	2	{}	2026-02-23 12:33:51.696951-08	2026-02-23 12:33:51.696951-08	t
c2a20f5c-e4bc-48c9-89b0-058edcb08a31	about	brands	brand_2_name	text	Somfy		0	0	cover	3	{}	2026-02-23 12:33:51.697181-08	2026-02-23 12:33:51.697181-08	t
0f22c5eb-2210-4fda-aece-d303f3cc1a08	about	brands	brand_2_logo	image	Somfy		200	200	contain	4	{}	2026-02-23 12:33:51.697412-08	2026-02-23 12:33:51.697412-08	t
e3d48558-6bba-4f23-b553-3885269b0a9a	about	brands	brand_3_name	text	Lutron		0	0	cover	5	{}	2026-02-23 12:33:51.697645-08	2026-02-23 12:33:51.697645-08	t
43780304-7eb5-42e4-a160-f66504ca5f55	about	brands	brand_3_logo	image	Lutron		200	200	contain	6	{}	2026-02-23 12:33:51.697846-08	2026-02-23 12:33:51.697846-08	t
384416ef-378d-49d1-afa7-6a491783e1cd	about	brands	brand_4_name	text	R-TEC		0	0	cover	7	{}	2026-02-23 12:33:51.698041-08	2026-02-23 12:33:51.698041-08	t
b37edb84-2ec6-42cf-9aab-01171dcc676b	about	brands	brand_4_logo	image	R-TEC		200	200	contain	8	{}	2026-02-23 12:33:51.698245-08	2026-02-23 12:33:51.698245-08	t
b2d45a33-a327-4664-924d-f2d96d24bdeb	gallery	hero	title	text	Our Gallery		0	0	cover	0	{}	2026-02-23 12:33:51.698414-08	2026-02-23 12:33:51.698414-08	t
795dd399-b042-41d2-b32e-aa4482b4c3c5	gallery	hero	subtitle	text	Explore Our Portfolio of Stunning Projects		0	0	cover	1	{}	2026-02-23 12:33:51.698564-08	2026-02-23 12:33:51.698564-08	t
1596b738-f171-49f3-9b00-13b3d3ecd7a1	gallery	hero	bg_image	image	Gallery Hero Background		1920	800	cover	2	{}	2026-02-23 12:33:51.698711-08	2026-02-23 12:33:51.698711-08	t
3316dee3-8865-4dbe-969f-cf8a1abf0eff	gallery	projects	project_1_title	text	Luxury Living Room		0	0	cover	0	{}	2026-02-23 12:33:51.698861-08	2026-02-23 12:33:51.698861-08	t
8095357b-2fcb-4d3f-950a-689a4707def7	gallery	projects	project_1_location	text	Beverly Hills, CA		0	0	cover	1	{}	2026-02-23 12:33:51.699012-08	2026-02-23 12:33:51.699012-08	t
a25909b0-b59d-4ce5-acf8-4cd3f20e1bd5	gallery	projects	project_1_image	image	Project 1		600	450	cover	2	{}	2026-02-23 12:33:51.699173-08	2026-02-23 12:33:51.699173-08	t
01feb24b-3ab8-4cc1-af9f-38915309b75d	gallery	projects	project_3_title	text	Elegant Bedroom		0	0	cover	6	{}	2026-02-23 12:33:51.699826-08	2026-02-23 12:33:51.699826-08	t
74ed9c00-72f0-4fd8-8fc6-81ef29bac6e9	gallery	projects	project_3_location	text	Pasadena, CA		0	0	cover	7	{}	2026-02-23 12:33:51.69997-08	2026-02-23 12:33:51.69997-08	t
3a3a9ad1-4ed6-4a39-8007-2aeb731ab15e	gallery	projects	project_3_image	image	Project 3		600	450	cover	8	{}	2026-02-23 12:33:51.70013-08	2026-02-23 12:33:51.70013-08	t
5df3eb4b-5a6d-4142-8a62-c76c1e2ab592	gallery	projects	project_4_title	text	Hotel Lobby		0	0	cover	9	{}	2026-02-23 12:33:51.700302-08	2026-02-23 12:33:51.700302-08	t
e989f9e0-7869-4de4-b226-64d04b8e7a9c	gallery	projects	project_4_location	text	Hollywood, CA		0	0	cover	10	{}	2026-02-23 12:33:51.700468-08	2026-02-23 12:33:51.700468-08	t
881f85ef-5bf4-4764-b07a-b247d9947c24	gallery	projects	project_4_image	image	Project 4		600	450	cover	11	{}	2026-02-23 12:33:51.70065-08	2026-02-23 12:33:51.70065-08	t
d5167ad5-40e8-4532-9981-3329811b534f	gallery	projects	project_6_title	text	Conference Room		0	0	cover	15	{}	2026-02-23 12:33:51.701271-08	2026-02-23 12:33:51.701271-08	t
92d8fc7d-3d95-474a-8630-704c91c4e159	gallery	projects	project_6_location	text	Century City		0	0	cover	16	{}	2026-02-23 12:33:51.701425-08	2026-02-23 12:33:51.701425-08	t
5f1ced88-6075-40ab-8e06-9a4eba4ea0a2	gallery	projects	project_6_image	image	Project 6		600	450	cover	17	{}	2026-02-23 12:33:51.701573-08	2026-02-23 12:33:51.701573-08	t
9037f075-f793-4617-aa8e-2cb82b56ae5b	gallery	projects	project_7_title	text	Master Suite		0	0	cover	18	{}	2026-02-23 12:33:51.701718-08	2026-02-23 12:33:51.701718-08	t
8e5cd698-3d50-4245-8a7b-b6723ab44972	gallery	projects	project_7_location	text	Arcadia, CA		0	0	cover	19	{}	2026-02-23 12:33:51.701866-08	2026-02-23 12:33:51.701866-08	t
0b1b447a-27e1-41b2-bd2a-87303b5190df	gallery	projects	project_7_image	image	Project 7		600	450	cover	20	{}	2026-02-23 12:33:51.702023-08	2026-02-23 12:33:51.702023-08	t
53f9d0a1-3d3f-477e-bed5-89e22f095b56	gallery	projects	project_8_title	text	Restaurant		0	0	cover	21	{}	2026-02-23 12:33:51.702265-08	2026-02-23 12:33:51.702265-08	t
3bab75e9-ee74-4ca1-9792-346d9dfe49f5	gallery	projects	project_8_location	text	Santa Monica		0	0	cover	22	{}	2026-02-23 12:33:51.702421-08	2026-02-23 12:33:51.702421-08	t
a95c9c44-acfd-4b87-85ec-31c7850eb297	gallery	projects	project_8_image	image	Project 8		600	450	cover	23	{}	2026-02-23 12:33:51.702589-08	2026-02-23 12:33:51.702589-08	t
8df0f066-cae3-43a2-a5c8-249e9d84e495	gallery	projects	project_9_title	text	Home Theater		0	0	cover	24	{}	2026-02-23 12:33:51.702758-08	2026-02-23 12:33:51.702758-08	t
c0771b56-1d98-458a-9847-92454970bc5f	gallery	projects	project_9_location	text	Temple City, CA		0	0	cover	25	{}	2026-02-23 12:33:51.702935-08	2026-02-23 12:33:51.702935-08	t
58dc1205-0eb4-423f-9fd2-6f3572fa29a0	gallery	projects	project_9_image	image	Project 9		600	450	cover	26	{}	2026-02-23 12:33:51.703105-08	2026-02-23 12:33:51.703105-08	t
f0e6d6ed-b944-4db6-907d-ba1b757ca095	gallery	projects	project_10_title	text	Penthouse		0	0	cover	27	{}	2026-02-23 12:33:51.703286-08	2026-02-23 12:33:51.703286-08	t
ea86de4a-e9dd-43cf-80ed-6a25df184524	gallery	projects	project_10_location	text	West Hollywood		0	0	cover	28	{}	2026-02-23 12:33:51.70345-08	2026-02-23 12:33:51.70345-08	t
44b7216f-e810-41df-b70b-b1d7967aea17	gallery	projects	project_10_image	image	Project 10		600	450	cover	29	{}	2026-02-23 12:33:51.703796-08	2026-02-23 12:33:51.703796-08	t
f2a94e21-6b07-4017-8f58-0e5d85fe3dbe	gallery	projects	project_11_title	text	Boutique Store		0	0	cover	30	{}	2026-02-23 12:33:51.703944-08	2026-02-23 12:33:51.703944-08	t
260ff376-791f-439c-b0c5-60f6d9c959b8	gallery	projects	project_11_location	text	Beverly Hills		0	0	cover	31	{}	2026-02-23 12:33:51.70409-08	2026-02-23 12:33:51.70409-08	t
acc2ce23-b7f5-47cb-815e-d276983a024e	gallery	projects	project_11_image	image	Project 11		600	450	cover	32	{}	2026-02-23 12:33:51.70424-08	2026-02-23 12:33:51.70424-08	t
09143892-13fb-4089-a494-0fe7281b0a54	gallery	projects	project_12_title	text	Living Room		0	0	cover	33	{}	2026-02-23 12:33:51.704389-08	2026-02-23 12:33:51.704389-08	t
df6c2961-beae-4be3-835a-4f1a1d091094	gallery	projects	project_12_location	text	Alhambra, CA		0	0	cover	34	{}	2026-02-23 12:33:51.704534-08	2026-02-23 12:33:51.704534-08	t
0810faf1-1ccf-4bcc-901d-3b90bb57c4f2	gallery	projects	project_12_image	image	Project 12		600	450	cover	35	{}	2026-02-23 12:33:51.704685-08	2026-02-23 12:33:51.704685-08	t
34fd0d0a-e3a1-4694-958f-93a7e8464e77	products	hero	title	text	Our Products		0	0	cover	0	{}	2026-02-23 12:33:51.704834-08	2026-02-23 12:33:51.704834-08	t
78d8d6ff-382a-4e9d-95e3-69a772cf29ba	products	hero	subtitle	text	Premium Window Treatments & Solutions		0	0	cover	1	{}	2026-02-23 12:33:51.704973-08	2026-02-23 12:33:51.704973-08	t
2bb4cedd-0385-4ae6-987c-e53ca8b2ac51	products	items	product_1_name	text	Custom Drapery		0	0	cover	0	{}	2026-02-23 12:33:51.705277-08	2026-02-23 12:33:51.705277-08	t
5745596f-b083-40bc-a9a1-1b5043b2ae5c	products	items	product_1_image	image	Custom Drapery		400	400	cover	1	{}	2026-02-23 12:33:51.705422-08	2026-02-23 12:33:51.705422-08	t
2cbc1a33-a28d-41c9-bd1c-1adc68e76aa2	products	items	product_2_name	text	Sheer Curtains		0	0	cover	2	{}	2026-02-23 12:33:51.705568-08	2026-02-23 12:33:51.705568-08	t
e997a5e8-c6b6-4cc7-891a-34239b104303	products	items	product_2_image	image	Sheer Curtains		400	400	cover	3	{}	2026-02-23 12:33:51.70571-08	2026-02-23 12:33:51.70571-08	t
93d740f5-9c0d-43f2-ae77-3ddfc93497c6	products	items	product_3_name	text	Roller Shades		0	0	cover	4	{}	2026-02-23 12:33:51.705856-08	2026-02-23 12:33:51.705856-08	t
1e5028f6-4eb7-4651-a2cc-751a7c274cac	products	items	product_3_image	image	Roller Shades		400	400	cover	5	{}	2026-02-23 12:33:51.706008-08	2026-02-23 12:33:51.706008-08	t
87ec4ed7-cee2-4bcc-b8fa-c40c462ad97c	products	items	product_4_name	text	Roman Shades		0	0	cover	6	{}	2026-02-23 12:33:51.706186-08	2026-02-23 12:33:51.706186-08	t
3b5fca64-e419-4f87-81da-1425c3834c65	products	items	product_4_image	image	Roman Shades		400	400	cover	7	{}	2026-02-23 12:33:51.706376-08	2026-02-23 12:33:51.706376-08	t
3fbb43a0-caf5-492b-9114-609e4f4069e1	products	items	product_5_name	text	Cellular Shades		0	0	cover	8	{}	2026-02-23 12:33:51.706581-08	2026-02-23 12:33:51.706581-08	t
b26fd088-7977-4f69-bbd0-114368ee5a85	products	items	product_5_image	image	Cellular Shades		400	400	cover	9	{}	2026-02-23 12:33:51.706785-08	2026-02-23 12:33:51.706785-08	t
d0de0430-8206-4533-a6b6-91965098df49	products	items	product_6_name	text	Valances & Cornices		0	0	cover	10	{}	2026-02-23 12:33:51.706967-08	2026-02-23 12:33:51.706967-08	t
6c494927-dce6-486a-aaf5-7977a06f39ef	products	items	product_6_image	image	Valances & Cornices		400	400	cover	11	{}	2026-02-23 12:33:51.707127-08	2026-02-23 12:33:51.707127-08	t
57251d58-a616-49c9-a949-5f690ffdd01b	products	items	product_7_name	text	Drapery Hardware		0	0	cover	12	{}	2026-02-23 12:33:51.707263-08	2026-02-23 12:33:51.707263-08	t
6dc38cd9-952c-4d9f-ab31-dd7489b503e8	products	items	product_7_image	image	Drapery Hardware		400	400	cover	13	{}	2026-02-23 12:33:51.707403-08	2026-02-23 12:33:51.707403-08	t
eb6f7624-3c58-4cad-8c0b-134d3be68107	products	items	product_8_name	text	Motorization Systems		0	0	cover	14	{}	2026-02-23 12:33:51.707532-08	2026-02-23 12:33:51.707532-08	t
c4c1e84a-19da-4cfe-817a-1bbb4215f441	products	items	product_8_image	image	Motorization Systems		400	400	cover	15	{}	2026-02-23 12:33:51.707658-08	2026-02-23 12:33:51.707658-08	t
00a1a5bf-668a-4340-8720-abfcd9f776a9	products	items	product_9_name	text	Vertical Blinds		0	0	cover	16	{}	2026-02-23 12:33:51.707781-08	2026-02-23 12:33:51.707781-08	t
a0a2d902-2df6-4a6b-8a89-c824d42aed26	products	items	product_9_image	image	Vertical Blinds		400	400	cover	17	{}	2026-02-23 12:33:51.707914-08	2026-02-23 12:33:51.707914-08	t
8d519b1b-0929-47c1-9fb6-c17196a5872e	global	footer	copyright	text	©2022 by Angel Drapery		0	0	cover	0	{}	2026-02-23 12:33:51.708068-08	2026-02-23 12:33:51.708068-08	t
6b8dbcd4-3aa0-411e-ae51-514082cd5ba0	global	footer	youtube_url	text	#		0	0	cover	1	{}	2026-02-23 12:33:51.708194-08	2026-02-23 12:33:51.708194-08	t
8ca6591c-3667-4259-8bbb-670b7a831f65	global	footer	etsy_url	text	#		0	0	cover	2	{}	2026-02-23 12:33:51.708317-08	2026-02-23 12:33:51.708317-08	t
01ebaaeb-c0d4-4022-80a2-3c3367b89122	global	footer	tiktok_url	text	#		0	0	cover	3	{}	2026-02-23 12:33:51.708442-08	2026-02-23 12:33:51.708442-08	t
bfda58d7-daf8-43fe-a580-a1ffc58939d5	global	footer	linkedin_url	text	#		0	0	cover	4	{}	2026-02-23 12:33:51.708561-08	2026-02-23 12:33:51.708561-08	t
532edb81-dae7-4e5c-a520-46c97eff877d	home	process	step_2_image	image	In-Home Measurement	/uploads/site/home/1772836172408-hj08c8evgqw.png	480	270	cover	7	{}	2026-02-23 12:33:51.688309-08	2026-03-06 14:29:58.603581-08	t
8d8e7f01-f91d-492d-9223-dc532826934e	home	gallery	project_2	image	Lamar Linen Sheer	/uploads/site/home/1772686560506-b3hdl6rdzak.jpg	400	533	cover	1	{}	2026-02-23 12:33:51.6834-08	2026-03-04 20:56:12.28994-08	t
0ed48e3f-7fe5-4d42-8a05-e9a7afd0e2a2	home	gallery	project_4	image	Modern Roman Shade	/uploads/site/home/1772686605909-6ggf24tsxij.jpg	400	533	cover	3	{}	2026-02-23 12:33:51.683924-08	2026-03-04 20:56:55.378828-08	t
6f4a5542-31ab-4eb4-97a7-87c48afa846c	home	gallery	project_6	image	Plantation Shutter	/uploads/site/home/1772686646228-2nkiwfxd6vj.jpg	400	533	cover	5	{}	2026-02-23 12:33:51.684321-08	2026-03-04 20:59:05.10869-08	t
22555210-f5dc-4b74-891b-35c2e03de00a	home	about	image	image	Workshop Image	/uploads/site/home/1772686018649-9i3iv347drf.jpg	1200	750	fill	4	{}	2026-02-23 12:33:51.687048-08	2026-03-04 20:49:34.307086-08	t
a5075104-75fd-4d27-9e3c-4355bbffd35a	home	gallery	project_8	image	Blackout Taupe Linen Drapery	/uploads/site/home/1772686676661-ll6d3sakhu7.jpg	400	533	cover	7	{}	2026-02-23 12:33:51.684802-08	2026-03-04 20:59:05.154319-08	t
0e672ff5-9623-4cbf-9571-e8462b195e07	products	hero	bg_image	image	Products Hero Background	/uploads/site/products/1772856279810-p4vtwtciaya.jpeg	1920	800	cover	2	{}	2026-02-23 12:33:51.705118-08	2026-03-06 20:04:41.320694-08	t
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_settings (key, value) FROM stdin;
contact_email	
contact_phone	
site_title	Angel Drapery
meta_description	
online_store_enabled	true
\.


--
-- Data for Name: store_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.store_categories (id, name, slug, sort_order, is_active, created_at, updated_at) FROM stdin;
5a3fead7-feed-4309-88b2-679feb75eaba	Drapery	drapery	0	t	2026-02-23 14:21:47.097832-08	2026-02-23 14:30:12.63168-08
d2dd1cfc-e2a2-4c54-b8a3-c24879812570	Hardware	hardware	1	t	2026-02-23 14:22:22.670505-08	2026-02-23 14:30:12.657877-08
bbb9e912-8161-4320-b86a-d302cacbdfd5	Roller Shade	roller	2	t	2026-02-23 14:22:25.954997-08	2026-02-23 14:30:12.674605-08
a0468e2c-b43f-4ed2-91c4-6a6a68720f2d	Sheer	sheer	3	t	2026-02-23 14:22:46.373943-08	2026-02-23 14:30:12.688265-08
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, name, phone, shipping_address, created_at, updated_at, role, is_active) FROM stdin;
cfe71d4a-21e6-4c9c-9c47-d90e4f4f128f	eddieinus2016@yahoo.com	$2b$12$G1yOKDOI9/bb8sgzvIeALex8DyopNxs0gWrOPAVAfaQO2tcLSM5qG	Angel Drapery Inc	6267032929	{"zip": "91780", "city": "TEMPLE CITY", "state": "CA", "street": "8827 LAS TUNAS DR"}	2026-02-23 20:10:32.219238-08	2026-02-23 20:10:32.279783-08	customer	t
d7188e9a-f07c-4b83-aac2-f98e09a8d3b1	ghost5566ac@gmail.com	$2b$12$6oGJvUGGekwCjFNY1s7cEexSaRP2oZWhWpwCs7hfAnZuLoNqdWLsq	Angel2100	6263426784	[{"zip": "91724", "city": "Covina", "name": "Angel2100", "phone": "6263426784", "state": "CA", "country": "US", "street1": "335 N Dodsworth Ave", "street2": ""}]	2026-02-24 23:13:33.241912-08	2026-03-09 23:54:43.073062-07	admin	t
53a3e686-94c8-4590-972b-11147b131a16	angeldrapery2100@gmail.com	$2b$12$k8/4Zq6eEgPmjQJLWB5.I.Ma3WyoCASx7XmYvgXLKN1k.FFmOZQtO	haitong cao	6263426784	[{"zip": "07070", "city": "Rutherford", "name": "haitong cao", "phone": "6263426784", "state": "NJ", "country": "US", "street1": "116 Irving Pl", "street2": ""}]	2026-02-23 20:15:14.696091-08	2026-03-10 00:07:53.037624-07	customer	t
\.


--
-- Data for Name: work_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.work_orders (id, order_id, version, created_at, updated_at, created_by, notes) FROM stdin;
5a4db0f3-dcd7-42f7-95de-0c6dc4e5ded6	535f8345-b3d9-48ea-9765-704c2403e580	1	2026-02-24 21:52:57.862611-08	2026-02-24 21:52:57.862611-08	admin	
b343f549-bc3c-4095-b878-76516b092be8	9aa889c4-5d88-420a-84aa-ed34e1db7277	1	2026-02-24 21:53:19.156277-08	2026-02-24 21:53:19.156277-08	admin	
43aa4447-f988-4bcc-a724-05e9677f09b5	9aa889c4-5d88-420a-84aa-ed34e1db7277	2	2026-02-24 21:54:11.694292-08	2026-02-24 21:54:11.694292-08	admin	
e9e4171f-c3ab-4dea-89e0-cf1b4aa14861	c69caf36-b8eb-4a58-8062-221633034540	1	2026-02-24 21:56:38.511354-08	2026-02-24 21:56:38.511354-08	admin	
\.


--
-- Name: gallery_video_meta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.gallery_video_meta_id_seq', 14, true);


--
-- Name: showcase_product_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.showcase_product_images_id_seq', 8, true);


--
-- Name: showcase_product_sections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.showcase_product_sections_id_seq', 2, true);


--
-- Name: showcase_products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.showcase_products_id_seq', 28, true);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: discount_codes discount_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discount_codes
    ADD CONSTRAINT discount_codes_code_key UNIQUE (code);


--
-- Name: discount_codes discount_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discount_codes
    ADD CONSTRAINT discount_codes_pkey PRIMARY KEY (id);


--
-- Name: gallery_video_meta gallery_video_meta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_video_meta
    ADD CONSTRAINT gallery_video_meta_pkey PRIMARY KEY (id);


--
-- Name: gallery_video_meta gallery_video_meta_video_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_video_meta
    ADD CONSTRAINT gallery_video_meta_video_id_key UNIQUE (video_id);


--
-- Name: login_attempts login_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.login_attempts
    ADD CONSTRAINT login_attempts_pkey PRIMARY KEY (id);


--
-- Name: order_shipments order_shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_shipments
    ADD CONSTRAINT order_shipments_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: pricing_configs pricing_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_configs
    ADD CONSTRAINT pricing_configs_pkey PRIMARY KEY (id);


--
-- Name: pricing_configs pricing_configs_product_type_id_version_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_configs
    ADD CONSTRAINT pricing_configs_product_type_id_version_key UNIQUE (product_type_id, version);


--
-- Name: product_parcel_rules product_parcel_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_parcel_rules
    ADD CONSTRAINT product_parcel_rules_pkey PRIMARY KEY (id);


--
-- Name: product_types product_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_types
    ADD CONSTRAINT product_types_pkey PRIMARY KEY (id);


--
-- Name: product_types product_types_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_types
    ADD CONSTRAINT product_types_slug_key UNIQUE (slug);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- Name: settings_history settings_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings_history
    ADD CONSTRAINT settings_history_pkey PRIMARY KEY (id);


--
-- Name: showcase_product_images showcase_product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.showcase_product_images
    ADD CONSTRAINT showcase_product_images_pkey PRIMARY KEY (id);


--
-- Name: showcase_product_sections showcase_product_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.showcase_product_sections
    ADD CONSTRAINT showcase_product_sections_pkey PRIMARY KEY (id);


--
-- Name: showcase_products showcase_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.showcase_products
    ADD CONSTRAINT showcase_products_pkey PRIMARY KEY (id);


--
-- Name: showcase_products showcase_products_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.showcase_products
    ADD CONSTRAINT showcase_products_slug_key UNIQUE (slug);


--
-- Name: site_content site_content_page_section_field_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_content
    ADD CONSTRAINT site_content_page_section_field_key_key UNIQUE (page, section, field_key);


--
-- Name: site_content site_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_content
    ADD CONSTRAINT site_content_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (key);


--
-- Name: store_categories store_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_categories
    ADD CONSTRAINT store_categories_pkey PRIMARY KEY (id);


--
-- Name: store_categories store_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_categories
    ADD CONSTRAINT store_categories_slug_key UNIQUE (slug);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: work_orders work_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_pkey PRIMARY KEY (id);


--
-- Name: idx_audit_logs_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);


--
-- Name: idx_audit_logs_actor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_actor ON public.audit_logs USING btree (actor_id);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC);


--
-- Name: idx_audit_logs_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_target ON public.audit_logs USING btree (target_type, target_id);


--
-- Name: idx_login_attempts_identifier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_login_attempts_identifier ON public.login_attempts USING btree (identifier, created_at DESC);


--
-- Name: idx_settings_history_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_settings_history_key ON public.settings_history USING btree (setting_key, changed_at DESC);


--
-- Name: idx_work_orders_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_order_id ON public.work_orders USING btree (order_id);


--
-- Name: order_shipments order_shipments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_shipments
    ADD CONSTRAINT order_shipments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: pricing_configs pricing_configs_product_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_configs
    ADD CONSTRAINT pricing_configs_product_type_id_fkey FOREIGN KEY (product_type_id) REFERENCES public.product_types(id);


--
-- Name: products products_product_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_product_type_id_fkey FOREIGN KEY (product_type_id) REFERENCES public.product_types(id);


--
-- Name: products products_store_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_store_category_id_fkey FOREIGN KEY (store_category_id) REFERENCES public.store_categories(id) ON DELETE SET NULL;


--
-- Name: showcase_product_images showcase_product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.showcase_product_images
    ADD CONSTRAINT showcase_product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.showcase_products(id) ON DELETE CASCADE;


--
-- Name: showcase_product_sections showcase_product_sections_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.showcase_product_sections
    ADD CONSTRAINT showcase_product_sections_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.showcase_products(id) ON DELETE CASCADE;


--
-- Name: work_orders work_orders_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- PostgreSQL database dump complete
--

\unrestrict H6dRAvXP4wg0woBztJZKw6vBpL6VdRaOLg8DShpHKbEmLGx5hsUbRgZTyrwLcgD

