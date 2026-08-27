--
-- PostgreSQL database dump
--

\restrict Nt36VnZdR5ozOHOiyeJWhbuIytTVTDmjQPsWTmXoyRBd3mO4kunwCgv3tO1YInY

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

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

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_audit_logs (
    id integer NOT NULL,
    admin_id integer NOT NULL,
    action text NOT NULL,
    target_type text NOT NULL,
    target_id text,
    details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_audit_logs_id_seq OWNED BY public.admin_audit_logs.id;


--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id integer NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_users_id_seq OWNED BY public.admin_users.id;


--
-- Name: catalogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.catalogs (
    id integer NOT NULL,
    title text NOT NULL,
    language text DEFAULT 'TR'::text NOT NULL,
    category text,
    pdf_url text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    cover_url text
);


--
-- Name: catalogs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.catalogs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: catalogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.catalogs_id_seq OWNED BY public.catalogs.id;


--
-- Name: certificates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.certificates (
    id integer NOT NULL,
    title text NOT NULL,
    file_url text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    locales jsonb DEFAULT '{}'::jsonb
);


--
-- Name: certificates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.certificates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: certificates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.certificates_id_seq OWNED BY public.certificates.id;


--
-- Name: corporate_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.corporate_sections (
    id integer NOT NULL,
    section_key text NOT NULL,
    title text,
    subtitle text,
    content text,
    image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    locales jsonb DEFAULT '{}'::jsonb
);


--
-- Name: corporate_sections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.corporate_sections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: corporate_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.corporate_sections_id_seq OWNED BY public.corporate_sections.id;


--
-- Name: email_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_logs (
    id integer NOT NULL,
    email_type text NOT NULL,
    recipient_email text NOT NULL,
    subject text,
    related_id integer,
    related_ref text,
    status text DEFAULT 'success'::text NOT NULL,
    error_message text,
    sent_by text,
    sent_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: email_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.email_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: email_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.email_logs_id_seq OWNED BY public.email_logs.id;


--
-- Name: maintenance_kits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maintenance_kits (
    id integer NOT NULL,
    service_record_id integer NOT NULL,
    kit_name text NOT NULL,
    kit_code text,
    quantity text,
    unit text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: maintenance_kits_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.maintenance_kits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: maintenance_kits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.maintenance_kits_id_seq OWNED BY public.maintenance_kits.id;


--
-- Name: material_reservations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.material_reservations (
    id integer NOT NULL,
    order_id integer NOT NULL,
    material_id integer NOT NULL,
    reserved_qty integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: material_reservations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.material_reservations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: material_reservations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.material_reservations_id_seq OWNED BY public.material_reservations.id;


--
-- Name: material_stock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.material_stock (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    supplier text,
    price numeric(12,2),
    quantity integer DEFAULT 0 NOT NULL,
    unit text DEFAULT 'adet'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    category text,
    product_code text,
    min_stock integer DEFAULT 0 NOT NULL
);


--
-- Name: material_stock_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.material_stock_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: material_stock_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.material_stock_id_seq OWNED BY public.material_stock.id;


--
-- Name: media_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media_files (
    id integer NOT NULL,
    filename text NOT NULL,
    object_path text NOT NULL,
    mime_type text,
    size integer,
    alt text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: media_files_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.media_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: media_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.media_files_id_seq OWNED BY public.media_files.id;


--
-- Name: news; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news (
    id integer NOT NULL,
    title text NOT NULL,
    excerpt text,
    content text,
    category text DEFAULT 'GENEL'::text NOT NULL,
    image_url text,
    slug text NOT NULL,
    published boolean DEFAULT true NOT NULL,
    published_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    seo_title text,
    seo_description text
);


--
-- Name: news_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.news_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: news_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.news_id_seq OWNED BY public.news.id;


--
-- Name: news_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news_translations (
    id integer NOT NULL,
    news_id integer NOT NULL,
    locale text NOT NULL,
    title text NOT NULL,
    excerpt text,
    content text,
    category text,
    slug text NOT NULL,
    published boolean DEFAULT false NOT NULL,
    published_at timestamp with time zone,
    seo_title text,
    seo_description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: news_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.news_translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: news_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.news_translations_id_seq OWNED BY public.news_translations.id;


--
-- Name: product_bom_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_bom_items (
    id integer NOT NULL,
    product_id integer NOT NULL,
    material_id integer NOT NULL,
    required_qty integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: product_bom_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_bom_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_bom_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_bom_items_id_seq OWNED BY public.product_bom_items.id;


--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_categories (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    name_en text,
    name_de text,
    name_fr text,
    name_it text,
    name_ar text,
    name_ru text,
    name_fa text,
    name_ka text,
    name_bg text,
    name_az text,
    image_url text,
    visible boolean DEFAULT true NOT NULL,
    show_on_home boolean DEFAULT true NOT NULL,
    description_en text,
    description_de text,
    description_fr text,
    description_it text,
    description_ar text,
    description_ru text,
    description_fa text,
    description_ka text,
    description_bg text,
    description_az text,
    name_es text,
    description_es text
);


--
-- Name: product_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_categories_id_seq OWNED BY public.product_categories.id;


--
-- Name: product_stock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_stock (
    id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    location text,
    notes text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: product_stock_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_stock_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_stock_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_stock_id_seq OWNED BY public.product_stock.id;


--
-- Name: production_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.production_order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    serial_number text,
    qr_token text,
    warranty_device_id integer,
    status text DEFAULT 'bekliyor'::text NOT NULL,
    quality_checklist jsonb DEFAULT '{}'::jsonb,
    production_date text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: production_order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.production_order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: production_order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.production_order_items_id_seq OWNED BY public.production_order_items.id;


--
-- Name: production_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.production_orders (
    id integer NOT NULL,
    order_no text NOT NULL,
    product_id integer,
    product_title text NOT NULL,
    product_code text,
    quantity integer DEFAULT 1 NOT NULL,
    status text DEFAULT 'bekliyor'::text NOT NULL,
    quote_form_id integer,
    customer_name text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: production_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.production_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: production_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.production_orders_id_seq OWNED BY public.production_orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    category_id integer,
    title text NOT NULL,
    description text,
    image_url text,
    specs jsonb DEFAULT '[]'::jsonb,
    sort_order integer DEFAULT 0 NOT NULL,
    published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    page_slug text,
    page_data jsonb DEFAULT '{}'::jsonb,
    private_data jsonb DEFAULT '{}'::jsonb,
    quote_title text,
    quote_bullets jsonb DEFAULT '[]'::jsonb,
    quote_model_code text,
    quote_image_url text,
    quote_unit text,
    quote_unit_price text,
    title_en text,
    title_de text,
    title_fr text,
    title_it text,
    title_ar text,
    title_ru text,
    title_fa text,
    title_ka text,
    title_bg text,
    title_az text,
    show_on_home boolean DEFAULT false NOT NULL,
    home_sort_order integer DEFAULT 0 NOT NULL,
    title_es text
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: quote_form_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_form_items (
    id integer NOT NULL,
    form_id integer NOT NULL,
    product_id integer,
    title text NOT NULL,
    bullets jsonb DEFAULT '[]'::jsonb,
    model_code text,
    image_url text,
    quantity integer DEFAULT 1 NOT NULL,
    unit text DEFAULT 'ADET'::text NOT NULL,
    unit_price numeric(12,2) DEFAULT '0'::numeric,
    sort_order integer DEFAULT 0 NOT NULL,
    item_type text DEFAULT 'single'::text NOT NULL,
    parent_item_id integer,
    show_in_pdf boolean DEFAULT true NOT NULL,
    page_break_before boolean DEFAULT false NOT NULL,
    keep_with_previous boolean DEFAULT false NOT NULL,
    keep_with_next boolean DEFAULT false NOT NULL
);


--
-- Name: quote_form_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.quote_form_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quote_form_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.quote_form_items_id_seq OWNED BY public.quote_form_items.id;


--
-- Name: quote_forms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_forms (
    id integer NOT NULL,
    quote_no text NOT NULL,
    firma_adi text,
    firma_adres text,
    firma_telefon text,
    firma_email text,
    firma_vergi_dairesi text,
    firma_vergi_no text,
    teslimat_adresi text,
    teslimat_suresi text,
    odeme_sekli text,
    para_birimi text DEFAULT 'EUR'::text NOT NULL,
    hizmetler jsonb DEFAULT '[]'::jsonb,
    sartlar jsonb DEFAULT '[]'::jsonb,
    notlar text,
    iskonto text DEFAULT '0'::text,
    kdv text DEFAULT '20'::text,
    hazirlayan text,
    hazirlayan_telefon text,
    hazirlayan_email text,
    onaylayan text,
    onaylayan_gorev text,
    onay_tarihi text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    iskonto_tipi text DEFAULT 'yuzde'::text NOT NULL,
    hazirlayan_imza_url text,
    show_kdv boolean DEFAULT true NOT NULL,
    show_genel_toplam boolean DEFAULT true NOT NULL,
    language text DEFAULT 'tr'::text NOT NULL,
    karsi_firma_logo_url text
);


--
-- Name: quote_forms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.quote_forms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quote_forms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.quote_forms_id_seq OWNED BY public.quote_forms.id;


--
-- Name: quote_group_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_group_templates (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    image_url text,
    children jsonb DEFAULT '[]'::jsonb,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    model_code text,
    name_en text,
    description_en text,
    admin_notes text
);


--
-- Name: quote_group_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.quote_group_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quote_group_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.quote_group_templates_id_seq OWNED BY public.quote_group_templates.id;


--
-- Name: quote_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_requests (
    id integer NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    company text,
    job_title text,
    project_type text,
    city text,
    application_area text,
    notes text,
    status text DEFAULT 'new'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: quote_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.quote_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quote_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.quote_requests_id_seq OWNED BY public.quote_requests.id;


--
-- Name: references; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."references" (
    id integer NOT NULL,
    title text NOT NULL,
    project_type text NOT NULL,
    capacity text,
    city text,
    image_url text,
    category text DEFAULT 'ŞEHİR HASTANELERİ'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    logo_url text,
    show_in_marquee boolean DEFAULT false NOT NULL,
    locales jsonb DEFAULT '{}'::jsonb
);


--
-- Name: references_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.references_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: references_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.references_id_seq OWNED BY public."references".id;


--
-- Name: serial_sequences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.serial_sequences (
    id integer NOT NULL,
    product_code text NOT NULL,
    date_key text NOT NULL,
    last_seq integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: serial_sequences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.serial_sequences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: serial_sequences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.serial_sequences_id_seq OWNED BY public.serial_sequences.id;


--
-- Name: service_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_records (
    id integer NOT NULL,
    device_id integer NOT NULL,
    service_date text NOT NULL,
    service_type text DEFAULT 'periyodik_bakim'::text NOT NULL,
    service_personnel text,
    description text,
    work_hours text,
    notes text,
    photo_urls jsonb DEFAULT '[]'::jsonb,
    report_no text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: service_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_records_id_seq OWNED BY public.service_records.id;


--
-- Name: service_report_email_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_report_email_logs (
    id integer NOT NULL,
    report_id integer NOT NULL,
    sent_to text NOT NULL,
    sent_by text,
    status text DEFAULT 'success'::text NOT NULL,
    error_message text,
    sent_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: service_report_email_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_report_email_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_report_email_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_report_email_logs_id_seq OWNED BY public.service_report_email_logs.id;


--
-- Name: service_report_parts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_report_parts (
    id integer NOT NULL,
    report_id integer NOT NULL,
    part_name text NOT NULL,
    part_code text,
    quantity text DEFAULT '1'::text NOT NULL,
    condition text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: service_report_parts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_report_parts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_report_parts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_report_parts_id_seq OWNED BY public.service_report_parts.id;


--
-- Name: service_report_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_report_photos (
    id integer NOT NULL,
    report_id integer NOT NULL,
    url text NOT NULL,
    caption text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: service_report_photos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_report_photos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_report_photos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_report_photos_id_seq OWNED BY public.service_report_photos.id;


--
-- Name: service_report_signatures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_report_signatures (
    id integer NOT NULL,
    report_id integer NOT NULL,
    role text NOT NULL,
    signer_name text,
    image_data_url text NOT NULL,
    signed_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: service_report_signatures_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_report_signatures_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_report_signatures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_report_signatures_id_seq OWNED BY public.service_report_signatures.id;


--
-- Name: service_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_reports (
    id integer NOT NULL,
    report_no text NOT NULL,
    device_id integer NOT NULL,
    service_date text NOT NULL,
    service_time text,
    service_type text DEFAULT 'periyodik_bakim'::text NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    status text DEFAULT 'taslak'::text NOT NULL,
    service_code text,
    report_data_json jsonb DEFAULT '{}'::jsonb,
    pdf_url text,
    verification_token text NOT NULL,
    created_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: service_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_reports_id_seq OWNED BY public.service_reports.id;


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id integer NOT NULL,
    setting_key text NOT NULL,
    setting_value text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: site_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.site_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: site_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;


--
-- Name: sliders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sliders (
    id integer NOT NULL,
    title text NOT NULL,
    subtitle text,
    description text,
    image_url text,
    cta_primary_text text,
    cta_primary_href text,
    cta_secondary_text text,
    cta_secondary_href text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    show_catalog_button boolean DEFAULT false NOT NULL,
    overlay_enabled boolean DEFAULT true NOT NULL,
    overlay_color text DEFAULT '#021423'::text,
    overlay_from_opacity integer DEFAULT 92 NOT NULL,
    overlay_to_opacity integer DEFAULT 12 NOT NULL,
    text_color text DEFAULT '#ffffff'::text,
    cta_primary_bg text DEFAULT '#021423'::text,
    cta_secondary_bg text DEFAULT 'rgba(255,255,255,0.06)'::text,
    title_en text,
    title_de text,
    title_fr text,
    title_it text,
    title_ar text,
    title_ru text,
    title_fa text,
    title_ka text,
    title_bg text,
    title_az text,
    subtitle_en text,
    subtitle_de text,
    subtitle_fr text,
    subtitle_it text,
    subtitle_ar text,
    subtitle_ru text,
    subtitle_fa text,
    subtitle_ka text,
    subtitle_bg text,
    subtitle_az text,
    description_en text,
    description_de text,
    description_fr text,
    description_it text,
    description_ar text,
    description_ru text,
    description_fa text,
    description_ka text,
    description_bg text,
    description_az text,
    cta_primary_text_en text,
    cta_primary_text_de text,
    cta_primary_text_fr text,
    cta_primary_text_it text,
    cta_primary_text_ar text,
    cta_primary_text_ru text,
    cta_primary_text_fa text,
    cta_primary_text_ka text,
    cta_primary_text_bg text,
    cta_primary_text_az text,
    cta_secondary_text_en text,
    cta_secondary_text_de text,
    cta_secondary_text_fr text,
    cta_secondary_text_it text,
    cta_secondary_text_ar text,
    cta_secondary_text_ru text,
    cta_secondary_text_fa text,
    cta_secondary_text_ka text,
    cta_secondary_text_bg text,
    cta_secondary_text_az text,
    mobile_image_url text,
    title_es text,
    subtitle_es text,
    description_es text,
    cta_primary_text_es text,
    cta_secondary_text_es text
);


--
-- Name: sliders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sliders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sliders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sliders_id_seq OWNED BY public.sliders.id;


--
-- Name: template_bom_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.template_bom_items (
    id integer NOT NULL,
    template_id integer NOT NULL,
    material_id integer NOT NULL,
    required_qty numeric(10,3) DEFAULT '1'::numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: template_bom_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.template_bom_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: template_bom_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.template_bom_items_id_seq OWNED BY public.template_bom_items.id;


--
-- Name: visitor_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.visitor_events (
    id integer NOT NULL,
    visitor_id text NOT NULL,
    session_id text NOT NULL,
    path text NOT NULL,
    referrer_source text DEFAULT 'direct'::text NOT NULL,
    device_type text DEFAULT 'desktop'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    event_type text DEFAULT 'pageview'::text NOT NULL,
    label text
);


--
-- Name: visitor_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.visitor_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: visitor_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.visitor_events_id_seq OWNED BY public.visitor_events.id;


--
-- Name: warranty_claims; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.warranty_claims (
    id integer NOT NULL,
    device_id integer NOT NULL,
    fault_type text NOT NULL,
    fault_description text NOT NULL,
    photo_urls jsonb DEFAULT '[]'::jsonb,
    work_hours text,
    personnel_note text,
    decision_status text DEFAULT 'incelemede'::text NOT NULL,
    out_of_warranty_reason text,
    admin_approval boolean,
    admin_note text,
    claimant_name text,
    claimant_phone text,
    claimant_email text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: warranty_claims_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.warranty_claims_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: warranty_claims_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.warranty_claims_id_seq OWNED BY public.warranty_claims.id;


--
-- Name: warranty_devices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.warranty_devices (
    id integer NOT NULL,
    product_name text NOT NULL,
    model text NOT NULL,
    serial_number text NOT NULL,
    qr_token text NOT NULL,
    customer_firm text DEFAULT 'Taslak'::text NOT NULL,
    customer_contact text,
    customer_phone text,
    customer_email text,
    install_date text,
    warranty_start_date text,
    warranty_end_date text,
    warranty_type text,
    maintenance_contract_status text,
    last_maintenance_date text,
    next_maintenance_date text,
    status text DEFAULT 'taslak'::text NOT NULL,
    notes text,
    image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    production_order_item_id integer,
    device_type text,
    plc_system text,
    hmi_model text,
    production_date text,
    customer_department text,
    customer_location text
);


--
-- Name: warranty_devices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.warranty_devices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: warranty_devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.warranty_devices_id_seq OWNED BY public.warranty_devices.id;


--
-- Name: admin_audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_audit_logs ALTER COLUMN id SET DEFAULT nextval('public.admin_audit_logs_id_seq'::regclass);


--
-- Name: admin_users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users ALTER COLUMN id SET DEFAULT nextval('public.admin_users_id_seq'::regclass);


--
-- Name: catalogs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalogs ALTER COLUMN id SET DEFAULT nextval('public.catalogs_id_seq'::regclass);


--
-- Name: certificates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates ALTER COLUMN id SET DEFAULT nextval('public.certificates_id_seq'::regclass);


--
-- Name: corporate_sections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corporate_sections ALTER COLUMN id SET DEFAULT nextval('public.corporate_sections_id_seq'::regclass);


--
-- Name: email_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_logs ALTER COLUMN id SET DEFAULT nextval('public.email_logs_id_seq'::regclass);


--
-- Name: maintenance_kits id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_kits ALTER COLUMN id SET DEFAULT nextval('public.maintenance_kits_id_seq'::regclass);


--
-- Name: material_reservations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_reservations ALTER COLUMN id SET DEFAULT nextval('public.material_reservations_id_seq'::regclass);


--
-- Name: material_stock id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_stock ALTER COLUMN id SET DEFAULT nextval('public.material_stock_id_seq'::regclass);


--
-- Name: media_files id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_files ALTER COLUMN id SET DEFAULT nextval('public.media_files_id_seq'::regclass);


--
-- Name: news id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news ALTER COLUMN id SET DEFAULT nextval('public.news_id_seq'::regclass);


--
-- Name: news_translations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_translations ALTER COLUMN id SET DEFAULT nextval('public.news_translations_id_seq'::regclass);


--
-- Name: product_bom_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_bom_items ALTER COLUMN id SET DEFAULT nextval('public.product_bom_items_id_seq'::regclass);


--
-- Name: product_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories ALTER COLUMN id SET DEFAULT nextval('public.product_categories_id_seq'::regclass);


--
-- Name: product_stock id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_stock ALTER COLUMN id SET DEFAULT nextval('public.product_stock_id_seq'::regclass);


--
-- Name: production_order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_order_items ALTER COLUMN id SET DEFAULT nextval('public.production_order_items_id_seq'::regclass);


--
-- Name: production_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_orders ALTER COLUMN id SET DEFAULT nextval('public.production_orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: quote_form_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_form_items ALTER COLUMN id SET DEFAULT nextval('public.quote_form_items_id_seq'::regclass);


--
-- Name: quote_forms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_forms ALTER COLUMN id SET DEFAULT nextval('public.quote_forms_id_seq'::regclass);


--
-- Name: quote_group_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_group_templates ALTER COLUMN id SET DEFAULT nextval('public.quote_group_templates_id_seq'::regclass);


--
-- Name: quote_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_requests ALTER COLUMN id SET DEFAULT nextval('public.quote_requests_id_seq'::regclass);


--
-- Name: references id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."references" ALTER COLUMN id SET DEFAULT nextval('public.references_id_seq'::regclass);


--
-- Name: serial_sequences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.serial_sequences ALTER COLUMN id SET DEFAULT nextval('public.serial_sequences_id_seq'::regclass);


--
-- Name: service_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_records ALTER COLUMN id SET DEFAULT nextval('public.service_records_id_seq'::regclass);


--
-- Name: service_report_email_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_report_email_logs ALTER COLUMN id SET DEFAULT nextval('public.service_report_email_logs_id_seq'::regclass);


--
-- Name: service_report_parts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_report_parts ALTER COLUMN id SET DEFAULT nextval('public.service_report_parts_id_seq'::regclass);


--
-- Name: service_report_photos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_report_photos ALTER COLUMN id SET DEFAULT nextval('public.service_report_photos_id_seq'::regclass);


--
-- Name: service_report_signatures id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_report_signatures ALTER COLUMN id SET DEFAULT nextval('public.service_report_signatures_id_seq'::regclass);


--
-- Name: service_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_reports ALTER COLUMN id SET DEFAULT nextval('public.service_reports_id_seq'::regclass);


--
-- Name: site_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);


--
-- Name: sliders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sliders ALTER COLUMN id SET DEFAULT nextval('public.sliders_id_seq'::regclass);


--
-- Name: template_bom_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_bom_items ALTER COLUMN id SET DEFAULT nextval('public.template_bom_items_id_seq'::regclass);


--
-- Name: visitor_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visitor_events ALTER COLUMN id SET DEFAULT nextval('public.visitor_events_id_seq'::regclass);


--
-- Name: warranty_claims id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warranty_claims ALTER COLUMN id SET DEFAULT nextval('public.warranty_claims_id_seq'::regclass);


--
-- Name: warranty_devices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warranty_devices ALTER COLUMN id SET DEFAULT nextval('public.warranty_devices_id_seq'::regclass);


--
-- Data for Name: admin_audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_audit_logs (id, admin_id, action, target_type, target_id, details, created_at) FROM stdin;
1	1	auth.login.failed	admin_user	1	{"email": "admin@oxymed.com.tr"}	2026-08-17 23:02:27.486778+00
2	1	auth.login.success	admin_user	1	{"email": "admin@oxymed.com.tr"}	2026-08-18 08:01:50.706693+00
3	2	auth.login.failed	admin_user	2	{"email": "ercandeliceoglu@hotmail.com"}	2026-08-25 12:08:12.776848+00
4	2	auth.login.failed	admin_user	2	{"email": "ercandeliceoglu@hotmail.com"}	2026-08-25 12:08:28.030356+00
5	2	auth.login.success	admin_user	2	{"email": "ercandeliceoglu@hotmail.com"}	2026-08-25 12:08:29.591961+00
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_users (id, email, password_hash, name, created_at, updated_at) FROM stdin;
2	ercandeliceoglu@hotmail.com	$2b$12$lV3gGKpOxMnpmAJNyprr7e0MfEaiD0e0N.cvIFrGKoepvazSjWEFC	Ercan Deliceoğlu	2026-06-18 06:51:59.657885+00	2026-08-17 11:58:42.097+00
1	admin@oxymed.com.tr	$2b$12$lV3gGKpOxMnpmAJNyprr7e0MfEaiD0e0N.cvIFrGKoepvazSjWEFC	Oxymed Admin	2026-05-16 20:08:37.501395+00	2026-08-17 11:58:42.097+00
\.


--
-- Data for Name: catalogs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.catalogs (id, title, language, category, pdf_url, sort_order, is_active, created_at, updated_at, cover_url) FROM stdin;
1	Basınçlı Hava Santralleri 2026 Katalog	TR	\N	/assets/BASINÇLI HAVA SANTRALLERİ 2026 KATALOG.pdf	0	t	2026-08-04 06:16:06.080528+00	2026-08-04 06:16:06.080528+00	\N
\.


--
-- Data for Name: certificates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.certificates (id, title, file_url, sort_order, is_active, created_at, updated_at, locales) FROM stdin;
\.


--
-- Data for Name: corporate_sections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.corporate_sections (id, section_key, title, subtitle, content, image_url, created_at, updated_at, locales) FROM stdin;
1	about	Sağlık İçin Güvenilir Sistemler	2009'dan Bu Yana	1999 yılında kurulan firmamız, medikal gaz sistemleri ve tıbbi cihazların üretimi, satışı, projelendirilmesi ve uygulaması alanlarında faaliyet göstermektedir. Kurulduğumuz günden bu yana sağlık sektörünün ihtiyaçlarını doğru analiz eden, güvenilir ve sürdürülebilir çözümler geliştiren bir anlayışla çalışmalarımızı sürdürmekteyiz.\n\nFaaliyetlerimizin ilk yıllarından itibaren üretimini gerçekleştirdiğimiz medikal gaz sistemi ekipmanları ve hayata geçirdiğimiz sağlık tesisi projeleriyle kalite, güvenilirlik ve teknik yeterlilik konularında sektörde güçlü bir konum elde ettik. Hastaneler, klinikler ve çeşitli sağlık kuruluşlarında tamamladığımız uygulamalar sayesinde markamız, yüksek ürün kalitesi ve mühendislik yaklaşımıyla anılan bir yapıya kavuşmuştur.\n\nYıllar içerisinde üretim ve proje faaliyetlerimizin yanı sıra ithalat ve ihracat alanlarında da faaliyet göstererek hizmet ağımızı genişlettik. Ulusal ve uluslararası pazarlarda geliştirdiğimiz iş birlikleriyle ürün ve çözümlerimizi farklı coğrafyalardaki sağlık projelerine ulaştırmaya devam ediyoruz.\n\nTeknik bilgi birikimimiz, deneyimli ekibimiz ve yıllar içerisinde başarıyla tamamladığımız projeler, bugün sahip olduğumuz mühendislik gücünün temelini oluşturmaktadır. Üretimden projelendirmeye, montajdan devreye almaya, satış sonrası teknik destekten periyodik bakım hizmetlerine kadar tüm süreçlerde kalite ve sürekliliği ön planda tutuyoruz.\n\nAmacımız; geçmişten gelen tecrübemizi günümüz teknolojileriyle birleştirerek sağlık sektörüne güvenilir, verimli ve uzun ömürlü çözümler sunmaktır. Sürekli gelişimi esas alan yaklaşımımızla ürün kalitemizi, mühendislik kabiliyetimizi ve hizmet standartlarımızı her geçen gün daha ileriye taşımayı hedefliyoruz.\n\n25 yılı aşkın tecrübemizle, sağlık tesisleri için güvenilir sistemler geliştiriyor; iş ortaklarımıza yalnızca ürün değil, uzun vadeli çözüm ortaklığı sunuyoruz.	/assets/images/corporate-production-floor.png	2026-05-16 20:08:37.573646+00	2026-08-27 07:22:14.363+00	{"ar": {"title": "أنظمة موثوقة من أجل الصحة", "content": "تأسست شركتنا في عام 1999، وتعمل في مجالات إنتاج وبيع وتصميم وتطبيق أنظمة الغازات الطبية والأجهزة الطبية. ومنذ يوم تأسيسنا، نواصل أعمالنا بعقليةٍ تحلل احتياجات قطاع الصحة بدقة، وتطوّر حلولًا موثوقة ومستدامة.\\n\\nمنذ السنوات الأولى لأنشطتنا، اكتسبنا مكانة قوية في القطاع من حيث الجودة والموثوقية والكفاءة التقنية من خلال معدات أنظمة الغازات الطبية التي قمنا بإنتاجها ومشاريع المنشآت الصحية التي نفذناها. وبفضل التطبيقات التي أنجزناها في المستشفيات والعيادات ومختلف المؤسسات الصحية، أصبحت علامتنا التجارية ذات بنية تُعرف بجودة المنتج العالية ونهجها الهندسي.\\n\\nعلى مرّ السنين، وإلى جانب أنشطة الإنتاج والمشاريع، وسّعنا شبكة خدماتنا من خلال العمل أيضًا في مجالي الاستيراد والتصدير. ونواصل إيصال منتجاتنا وحلولنا إلى المشاريع الصحية في جغرافيات مختلفة من خلال الشراكات التي طورناها في الأسواق المحلية والدولية.\\n\\nإن مخزوننا من المعرفة التقنية، وفريقنا ذو الخبرة، والمشاريع التي أنجزناها بنجاح على مدار السنوات، تشكل اليوم الأساس لقوتنا الهندسية التي نمتلكها. نحن نضع الجودة والاستمرارية في المقدمة في جميع العمليات، من الإنتاج إلى التصميم، ومن التركيب إلى التشغيل، ومن الدعم الفني بعد البيع إلى خدمات الصيانة الدورية.\\n\\nهدفنا هو تقديم حلول موثوقة وفعالة وطويلة الأمد لقطاع الصحة من خلال الجمع بين خبرتنا المتوارثة وتقنيات اليوم. وبنهجنا القائم على التطور المستمر، نسعى إلى الارتقاء بجودة منتجاتنا وقدراتنا الهندسية ومعايير خدماتنا إلى مستويات أعلى يومًا بعد يوم.\\n\\nوبخبرة تزيد عن 25 عامًا، نطوّر أنظمة موثوقة للمنشآت الصحية؛ ونقدم لشركائنا ليس فقط منتجًا، بل شراكة حلول طويلة الأمد.", "subtitle": "منذ 2009"}, "az": {"title": "Sağlamlıq üçün Etibarlı Sistemlər", "content": "1999-cu ildə qurulan firmamız, tibbi qaz sistemləri və tibbi cihazların istehsalı, satışı, layihələndirilməsi və tətbiqi sahələrində fəaliyyət göstərir. Qurulduğumuz gündən bəri sağlamlıq sektorunun ehtiyaclarını düzgün təhlil edən, etibarlı və davamlı həllər hazırlayan bir yanaşma ilə çalışmalarımızı davam etdiririk.\\n\\nFəaliyyətimizin ilk illərindən etibarən istehsalını həyata keçirdiyimiz tibbi qaz sistemi avadanlıqları və həyata keçirdiyimiz səhiyyə müəssisəsi layihələri ilə keyfiyyət, etibarlılıq və texniki yetərlilik mövzularında sektorda güclü mövqe əldə etdik. Xəstəxanalar, klinikalar və müxtəlif sağlamlıq müəssisələrində tamamladığımız tətbiqlər sayəsində markamız, yüksək məhsul keyfiyyəti və mühəndislik yanaşması ilə anılan bir struktura qovuşmuşdur.\\n\\nİllər ərzində istehsal və layihə fəaliyyətlərimizin yanaşı, idxal və ixrac sahələrində də fəaliyyət göstərərək xidmət şəbəkəmizi genişləndirdik. Milli və beynəlxalq bazarlarda inkişaf etdirdiyimiz iş birlikləri ilə məhsul və həllərimizi fərqli coğrafiyalardakı sağlamlıq layihələrinə çatdırmağa davam edirik.\\n\\nTexniki bilik və təcrübəmiz, təcrübəli komandamız və illər ərzində uğurla tamamladığımız layihələr, bu gün sahib olduğumuz mühəndislik gücünün əsasını təşkil edir. İstehsaldan layihələndirməyə, montajdan işə salmağa, satış sonrası texniki dəstəkdən dövri xidmətlərə qədər bütün proseslərdə keyfiyyət və davamlılığı ön planda tuturuq.\\n\\nMəqsədimiz; keçmişdən gələn təcrübəmizi müasir texnologiyalarla birləşdirərək sağlamlıq sektoruna etibarlı, səmərəli və uzunömürlü həllər təqdim etməkdir. Davamlı inkişafı əsas götürən yanaşmamızla məhsul keyfiyyətimizi, mühəndislik qabiliyyətimizi və xidmət standartlarımızı hər keçən gün daha da irəli aparmağı hədəfləyirik.\\n\\n25 ildən artıq təcrübəmizlə, sağlamlıq müəssisələri üçün etibarlı sistemlər inkişaf etdirir; iş ortaqlarımıza yalnız məhsul deyil, uzunmüddətli həll ortaqlığı təqdim edirik.", "subtitle": "2009-cu ildən bəri"}, "bg": {"title": "Надеждни системи за здравето", "content": "Нашата компания, основана през 1999 г., развива дейност в областта на производството, продажбата, проектирането и изпълнението на системи за медицински газове и медицински изделия. От деня на основаването си продължаваме да работим с разбиране, което правилно анализира нуждите на здравния сектор и разработва надеждни и устойчиви решения.\\n\\nОт първите години на нашата дейност, с оборудването за системи за медицински газове, което произвеждаме, и с реализираните проекти за здравни заведения, заехме силна позиция в сектора по отношение на качество, надеждност и техническа компетентност. Благодарение на изпълнените от нас приложения в болници, клиники и различни здравни организации, нашата марка придоби структура, свързвана с високо качество на продуктите и инженерния подход.\\n\\nПрез годините разширихме нашата мрежа от услуги, като освен производствените и проектните дейности развихме и дейност в областта на вноса и износа. Продължаваме да предоставяме нашите продукти и решения на здравни проекти в различни географски региони чрез партньорства, които развиваме на националните и международните пазари.\\n\\nНашите технически знания, опитният ни екип и успешно завършените през годините проекти формират основата на инженерната сила, с която разполагаме днес. Поставяме качеството и непрекъснатостта на първо място във всички процеси — от производството и проектирането до монтажа и пускането в експлоатация, както и от следпродажбената техническа поддръжка до периодичните услуги по поддръжка.\\n\\nНашата цел е, като съчетаем натрупания от миналото опит със съвременните технологии, да предлагаме на здравния сектор надеждни, ефективни и дълготрайни решения. С подход, основан на непрекъснато развитие, се стремим да издигаме качеството на продуктите си, инженерните си възможности и стандартите си на обслужване все по-високо с всеки изминал ден.\\n\\nС над 25 години опит разработваме надеждни системи за здравни заведения; на нашите партньори предлагаме не просто продукт, а дългосрочно партньорство за решения.", "subtitle": "От 2009 г. насам"}, "de": {"title": "Verlässliche Systeme für die Gesundheit", "content": "Unser 1999 gegründetes Unternehmen ist in den Bereichen Produktion, Vertrieb, Planung und Umsetzung von medizinischen Gassystemen und medizinischen Geräten tätig. Seit unserer Gründung arbeiten wir mit einem Verständnis, das die Bedürfnisse des Gesundheitssektors richtig analysiert und zuverlässige sowie nachhaltige Lösungen entwickelt.\\n\\nSeit den ersten Jahren unserer Tätigkeit haben wir mit den von uns produzierten Komponenten für medizinische Gassysteme und den realisierten Gesundheitsbauprojekten eine starke Position in der Branche in Bezug auf Qualität, Zuverlässigkeit und technische Kompetenz erreicht. Dank der von uns in Krankenhäusern, Kliniken und verschiedenen Gesundheitseinrichtungen abgeschlossenen Anwendungen hat unsere Marke eine Struktur erlangt, die mit hoher Produktqualität und ingenieurtechnischem Ansatz verbunden wird.\\n\\nIm Laufe der Jahre haben wir unser Leistungsnetzwerk erweitert, indem wir neben unseren Produktions- und Projektaktivitäten auch im Bereich Import und Export tätig waren. Mit den von uns auf nationalen und internationalen Märkten entwickelten Kooperationen setzen wir fort, unsere Produkte und Lösungen Gesundheitsprojekten in verschiedenen Regionen zugänglich zu machen.\\n\\nUnser technisches Know-how, unser erfahrenes Team und die im Laufe der Jahre erfolgreich abgeschlossenen Projekte bilden die Grundlage der Ingenieurskraft, die wir heute besitzen. In allen Prozessen von der Produktion über die Planung und Montage bis zur Inbetriebnahme, vom technischen After-Sales-Support bis zu regelmäßigen Wartungsdiensten stellen wir Qualität und Kontinuität in den Vordergrund.\\n\\nUnser Ziel ist es, unsere aus der Vergangenheit stammende Erfahrung mit heutigen Technologien zu verbinden, um der Gesundheitsbranche zuverlässige, effiziente und langlebige Lösungen zu bieten. Mit unserem auf kontinuierliche Entwicklung ausgerichteten Ansatz streben wir an, unsere Produktqualität, unsere ingenieurtechnischen Fähigkeiten und unsere Servicestandards jeden Tag weiter voranzubringen.\\n\\nMit unserer mehr als 25-jährigen Erfahrung entwickeln wir verlässliche Systeme für Gesundheitseinrichtungen; wir bieten unseren Geschäftspartnern nicht nur Produkte, sondern eine langfristige Lösungspartnerschaft.", "subtitle": "Seit 2009"}, "en": {"title": "Reliable Systems for Health", "content": "Founded in 1999, our company operates in the manufacturing, sales, design, and implementation of medical gas systems and medical devices. Since the day we were established, we have continued our work with an approach that accurately analyzes the needs of the healthcare sector and develops reliable and sustainable solutions.\\n\\nSince the early years of our operations, with the medical gas system equipment we have produced and the healthcare facility projects we have realized, we have gained a strong position in the sector in terms of quality, reliability, and technical competence. Thanks to the implementations we have completed in hospitals, clinics, and various healthcare institutions, our brand has acquired a structure associated with high product quality and an engineering approach.\\n\\nOver the years, in addition to our production and project activities, we have expanded our service network by operating in import and export as well. Through the collaborations we have developed in national and international markets, we continue to deliver our products and solutions to healthcare projects in different geographies.\\n\\nOur technical know-how, experienced team, and the projects we have successfully completed over the years form the foundation of the engineering strength we have today. From production to design, from installation to commissioning, from after-sales technical support to periodic maintenance services, we prioritize quality and continuity in all processes.\\n\\nOur aim is to combine our experience from the past with today's technologies to provide the healthcare sector with reliable, efficient, and long-lasting solutions. With our approach based on continuous development, we aim to take our product quality, engineering capabilities, and service standards even further every day.\\n\\nWith more than 25 years of experience, we develop reliable systems for healthcare facilities; we offer our business partners not only products but also a long-term solution partnership.", "subtitle": "Since 2009"}, "es": {"title": "Sistemas confiables para la salud", "content": "Fundada en 1999, nuestra empresa opera en las áreas de producción, venta, diseño de proyectos y aplicación de sistemas de gases medicinales y dispositivos médicos. Desde el día en que fuimos fundados, continuamos nuestras actividades con una comprensión que analiza correctamente las necesidades del sector de la salud y desarrolla soluciones confiables y sostenibles.\\n\\nDesde los primeros años de nuestras actividades, con los equipos de sistemas de gases medicinales que producimos y los proyectos de instalaciones sanitarias que hemos llevado a cabo, hemos alcanzado una posición sólida en el sector en cuanto a calidad, confiabilidad y competencia técnica. Gracias a las implementaciones que hemos completado en hospitales, clínicas y diversas instituciones de salud, nuestra marca ha adquirido una estructura asociada con alta calidad de producto y un enfoque de ingeniería.\\n\\nA lo largo de los años, además de nuestras actividades de producción y proyectos, también hemos ampliado nuestra red de servicios operando en los ámbitos de importación y exportación. Con las colaboraciones que hemos desarrollado en los mercados nacionales e internacionales, seguimos llevando nuestros productos y soluciones a proyectos de salud en diferentes geografías.\\n\\nNuestro conocimiento técnico, nuestro equipo experimentado y los proyectos que hemos completado con éxito a lo largo de los años constituyen la base de la fortaleza de ingeniería que poseemos hoy. En todos los procesos, desde la producción hasta el diseño de proyectos, desde el montaje hasta la puesta en marcha, y desde el soporte técnico posventa hasta los servicios de mantenimiento periódico, priorizamos la calidad y la continuidad.\\n\\nNuestro objetivo es combinar nuestra experiencia acumulada con las tecnologías actuales para ofrecer al sector de la salud soluciones confiables, eficientes y duraderas. Con nuestro enfoque basado en la mejora continua, aspiramos a llevar cada día más lejos la calidad de nuestros productos, nuestra capacidad de ingeniería y nuestros estándares de servicio.\\n\\nCon más de 25 años de experiencia, desarrollamos sistemas confiables para instalaciones sanitarias; ofrecemos a nuestros socios comerciales no solo productos, sino también una colaboración de soluciones a largo plazo.", "subtitle": "Desde 2009"}, "fa": {"title": "سیستم‌های قابل اعتماد برای سلامت", "content": "شرکت ما که در سال 1999 تأسیس شده است، در زمینه تولید، فروش، طراحی پروژه و اجرای سیستم‌های گاز پزشکی و تجهیزات پزشکی فعالیت می‌کند. از روز تأسیس تاکنون، فعالیت‌های خود را با رویکردی ادامه داده‌ایم که نیازهای بخش سلامت را به‌درستی تحلیل کرده و راه‌حل‌های قابل اعتماد و پایدار توسعه می‌دهد.\\n\\nاز سال‌های نخست فعالیت‌مان، با تجهیزات سیستم گاز پزشکی که تولید کرده‌ایم و پروژه‌های تأسیسات درمانی که به اجرا رسانده‌ایم، در زمینه‌های کیفیت، قابلیت اطمینان و صلاحیت فنی جایگاه قدرتمندی در این بخش به دست آوردیم. با اجراهایی که در بیمارستان‌ها، کلینیک‌ها و انواع مراکز درمانی به انجام رسانده‌ایم، برند ما ساختاری یافته است که با کیفیت بالای محصولات و رویکرد مهندسی شناخته می‌شود.\\n\\nدر طول سال‌ها، علاوه بر فعالیت‌های تولید و پروژه، با فعالیت در حوزه‌های واردات و صادرات نیز شبکه خدمات خود را گسترش دادیم. با همکاری‌هایی که در بازارهای ملی و بین‌المللی توسعه داده‌ایم، همچنان محصولات و راه‌حل‌های خود را به پروژه‌های سلامت در جغرافیاهای مختلف می‌رسانیم.\\n\\nدانش فنی ما، تیم باتجربه‌مان و پروژه‌هایی که در طول سال‌ها با موفقیت به پایان رسانده‌ایم، پایه و اساس توان مهندسی امروز ما را تشکیل می‌دهند. از تولید تا طراحی پروژه، از نصب تا راه‌اندازی، از پشتیبانی فنی پس از فروش تا خدمات نگهداری دوره‌ای، در تمامی فرآیندها کیفیت و تداوم را در اولویت قرار می‌دهیم.\\n\\nهدف ما این است که با ترکیب تجربه‌ای که از گذشته به‌دست آورده‌ایم با فناوری‌های امروز، برای بخش سلامت راه‌حل‌هایی قابل اعتماد، کارآمد و بادوام ارائه دهیم. با رویکردی که توسعه مستمر را مبنا قرار می‌دهد، هدف داریم کیفیت محصولات، توان مهندسی و استانداردهای خدمات خود را روزبه‌روز ارتقا دهیم.\\n\\nبا بیش از 25 سال تجربه، برای مراکز درمانی سیستم‌های قابل اعتماد توسعه می‌دهیم؛ و به شرکای تجاری خود نه‌تنها محصول، بلکه همکاری راه‌حل‌محور بلندمدت ارائه می‌کنیم.", "subtitle": "از سال 2009 تاکنون"}, "fr": {"title": "Systèmes fiables pour la santé", "content": "Fondée en 1999, notre entreprise exerce ses activités dans les domaines de la production, de la vente, de la conception de projets et de la mise en œuvre de systèmes de gaz médicaux et de dispositifs médicaux. Depuis notre création, nous poursuivons nos activités avec une approche qui analyse correctement les besoins du secteur de la santé et développe des solutions fiables et durables.\\n\\nDès les premières années de nos activités, grâce aux équipements de systèmes de gaz médicaux que nous avons produits et aux projets d’établissements de santé que nous avons réalisés, nous avons acquis une position solide dans le secteur en matière de qualité, de fiabilité et de compétence technique. Grâce aux réalisations menées à bien dans des hôpitaux, des cliniques et diverses institutions de santé, notre marque a acquis une structure associée à une qualité de produit élevée et à une approche d’ingénierie.\\n\\nAu fil des années, en plus de nos activités de production et de projets, nous avons également élargi notre réseau de services en exerçant des activités dans les domaines de l’importation et de l’exportation. Grâce aux partenariats que nous avons développés sur les marchés nationaux et internationaux, nous continuons à acheminer nos produits et solutions vers des projets de santé dans différentes zones géographiques.\\n\\nNotre savoir-faire technique, notre équipe expérimentée et les projets que nous avons menés à bien au fil des années constituent la base de la القوة d’ingénierie que nous possédons aujourd’hui. De la production à la conception de projets, du montage à la mise en service, du support technique après-vente aux services de maintenance périodique, nous plaçons la qualité et la continuité au premier plan dans tous les processus.\\n\\nNotre objectif est d’associer l’expérience acquise au fil du temps aux technologies d’aujourd’hui afin d’offrir au secteur de la santé des solutions fiables, efficaces et durables. Avec notre approche fondée sur le développement continu, nous visons à faire progresser chaque jour davantage la qualité de nos produits, nos capacités d’ingénierie et nos standards de service.\\n\\nAvec plus de 25 ans d’expérience, nous développons des systèmes fiables pour les établissements de santé ; nous offrons à nos partenaires non seulement des produits, mais aussi un partenariat de solution à long terme.", "subtitle": "Depuis 2009"}, "it": {"title": "Sistemi affidabili per la salute", "content": "Fondata nel 1999, la nostra azienda opera nei settori della produzione, vendita, progettazione e applicazione di sistemi per gas medicali e dispositivi medici. Fin dal giorno della nostra fondazione, proseguiamo il nostro lavoro con un approccio che analizza correttamente le esigenze del settore sanitario e sviluppa soluzioni affidabili e sostenibili.\\n\\nSin dai primi anni della nostra attività, grazie alle apparecchiature per sistemi di gas medicali che abbiamo prodotto e ai progetti di strutture sanitarie che abbiamo realizzato, abbiamo हासिलato una solida posizione nel settore in termini di qualità, affidabilità e competenza tecnica. Grazie alle applicazioni completate in ospedali, cliniche e varie strutture sanitarie, il nostro marchio ha acquisito una struttura associata ad alta qualità dei prodotti e a un approccio ingegneristico.\\n\\nNel corso degli anni, oltre alle nostre attività di produzione e progettazione di progetti, abbiamo ampliato la nostra rete di servizi operando anche nei campi dell'importazione e dell'esportazione. Continuiamo a portare i nostri prodotti e le nostre soluzioni a progetti sanitari in diverse aree geografiche grazie alle collaborazioni sviluppate nei mercati nazionali e internazionali.\\n\\nIl nostro know-how tecnico, il nostro team esperto e i progetti completati con successo nel corso degli anni costituiscono la base della forza ingegneristica di cui disponiamo oggi. Dalla produzione alla progettazione, dal montaggio alla messa in servizio, dall'assistenza tecnica post-vendita ai servizi di manutenzione periodica, poniamo sempre in primo piano la qualità e la continuità in tutte le fasi.\\n\\nIl nostro obiettivo è offrire al settore sanitario soluzioni affidabili, efficienti e durature, combinando la nostra esperienza maturata nel tempo con le tecnologie odierne. Con il nostro approccio basato sul miglioramento continuo, miriamo a portare ogni giorno più avanti la qualità dei nostri prodotti, le nostre capacità ingegneristiche e i nostri standard di servizio.\\n\\nCon oltre 25 anni di esperienza, sviluppiamo sistemi affidabili per le strutture sanitarie; ai nostri partner offriamo non solo prodotti, ma una partnership di soluzione a lungo termine.", "subtitle": "Dal 2009"}, "ka": {"title": "ჯანმრთელობისთვის სანდო სისტემები", "content": "1999 წელს დაარსებული ჩვენი კომპანია საქმიანობს სამედიცინო გაზის სისტემებისა და სამედიცინო მოწყობილობების წარმოების, გაყიდვის, პროექტირების და დანერგვის მიმართულებებით. დაარსების დღიდან ვაგრძელებთ მუშაობას იმ მიდგომით, რომელიც სწორად აანალიზებს ჯანდაცვის სექტორის საჭიროებებს და ავითარებს სანდო და მდგრად გადაწყვეტილებებს.\\n\\nსაქმიანობის პირველივე წლებიდან, ჩვენ მიერ წარმოებული სამედიცინო გაზის სისტემის აღჭურვილობითა და განხორციელებული ჯანდაცვის დაწესებულებების პროექტებით, სექტორში მივაღწიეთ ძლიერ პოზიციას ხარისხის, სანდოობისა და ტექნიკური კომპეტენციის მიმართულებით. საავადმყოფოებში, კლინიკებსა და სხვადასხვა სამედიცინო დაწესებულებაში შესრულებული დანერგვებით, ჩვენი ბრენდი ჩამოყალიბდა სტრუქტურად, რომელიც ასოცირდება პროდუქტის მაღალ ხარისხთან და საინჟინრო მიდგომასთან.\\n\\nწლების განმავლობაში, წარმოებისა და პროექტირების საქმიანობის გარდა, იმპორტისა და ექსპორტის მიმართულებებითაც ვსაქმიანობდით და გავაფართოვეთ ჩვენი მომსახურების ქსელი. ეროვნულ და საერთაშორისო ბაზრებზე განვითარებული თანამშრომლობებით ვაგრძელებთ ჩვენი პროდუქტებისა და გადაწყვეტილებების მიწოდებას სხვადასხვა გეოგრაფიული არეალის ჯანდაცვის პროექტებისთვის.\\n\\nჩვენი ტექნიკური ცოდნა, გამოცდილი გუნდი და წლების განმავლობაში წარმატებით დასრულებული პროექტები ქმნის დღეს ჩვენს საინჟინრო ძალის საფუძველს. წარმოებიდან პროექტირებამდე, მონტაჟიდან ექსპლუატაციაში გაშვებამდე, გაყიდვის შემდგომი ტექნიკური მხარდაჭერიდან პერიოდულ მომსახურებამდე, ყველა პროცესში წინა პლანზე ვაყენებთ ხარისხსა და უწყვეტობას.\\n\\nჩვენი მიზანია; წარსულიდან მიღებული გამოცდილება თანამედროვე ტექნოლოგიებთან გავაერთიანოთ და ჯანდაცვის სექტორს შევთავაზოთ სანდო, ეფექტიანი და ხანგრძლივი გადაწყვეტილებები. უწყვეტი განვითარების პრინციპზე დაფუძნებული ჩვენი მიდგომით ვისწრაფვით, რომ ყოველდღიურად უფრო მაღალ დონეზე ავიყვანოთ ჩვენი პროდუქტის ხარისხი, საინჟინრო შესაძლებლობები და მომსახურების სტანდარტები.\\n\\n25 წელზე მეტი გამოცდილებით, ჯანდაცვის დაწესებულებებისთვის ვქმნით სანდო სისტემებს; ჩვენს პარტნიორებს ვთავაზობთ არა მხოლოდ პროდუქტს, არამედ გრძელვადიან გადაწყვეტილებით პარტნიორობას.", "subtitle": "2009 წლიდან"}, "ru": {"title": "Надежные системы для здоровья", "content": "Основанная в 1999 году наша компания осуществляет деятельность в областях производства, продажи, проектирования и внедрения систем медицинских газов и медицинского оборудования. С момента основания мы продолжаем свою работу, руководствуясь подходом, который правильно анализирует потребности сектора здравоохранения и разрабатывает надежные и устойчивые решения.\\n\\nС первых лет нашей деятельности благодаря производимому нами оборудованию для систем медицинских газов и реализованным проектам объектов здравоохранения мы заняли прочное место в отрасли по вопросам качества, надежности и технической компетентности. Благодаря проектам, которые мы завершили в больницах, клиниках и различных учреждениях здравоохранения, наш бренд стал ассоциироваться с высоким качеством продукции и инженерным подходом.\\n\\nНа протяжении многих лет, помимо производственной и проектной деятельности, мы также расширяли сеть наших услуг, занимаясь импортом и экспортом. Благодаря деловым партнерствам, которые мы развивали на национальных и международных рынках, мы продолжаем поставлять наши продукты и решения в проекты здравоохранения в разных регионах.\\n\\nНаши технические знания, опытная команда и успешно завершенные за годы проекты составляют основу нашей инженерной силы, которой мы обладаем сегодня. Во всех процессах — от производства до проектирования, от монтажа до ввода в эксплуатацию, от послепродажной технической поддержки до периодического обслуживания — мы ставим качество и непрерывность на первый план.\\n\\nНаша цель — объединяя наш накопленный опыт с современными технологиями, предлагать сектору здравоохранения надежные, эффективные и долговечные решения. Благодаря нашему подходу, основанному на постоянном развитии, мы стремимся с каждым днем повышать качество нашей продукции, инженерные возможности и стандарты обслуживания.\\n\\nС более чем 25-летним опытом мы разрабатываем надежные системы для объектов здравоохранения; нашим партнерам мы предлагаем не только продукт, но и долгосрочное партнерство по решениям.", "subtitle": "С 2009 года"}}
\.


--
-- Data for Name: email_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_logs (id, email_type, recipient_email, subject, related_id, related_ref, status, error_message, sent_by, sent_at) FROM stdin;
1	quote_form	yusufdeliceoglu@gmail.com	Teklif - OXM-TFL-2026-270501	7	OXM-TFL-2026-270501	success	\N	admin@oxymed.com.tr	2026-05-27 09:03:38.640282+00
2	quote_form	yusufdeliceoglu@Gmail.com	Teklif - OXM-TFL-2026-240503	4	OXM-TFL-2026-240503	success	\N	admin@oxymed.com.tr	2026-05-27 09:07:32.450441+00
3	quote_form	yusufdeliceoglu@gmail.com	Teklif - OXM-TFL-2026-240503	4	OXM-TFL-2026-240503	success	\N	admin@oxymed.com.tr	2026-05-27 09:21:41.519416+00
4	service_report	ercandeliceoglu@hotmail.com	Servis Raporu - OXM-SRV-2026-000006 | Ege Hastanesi	6	OXM-SRV-2026-000006	success	\N	admin@oxymed.com.tr	2026-05-28 19:21:05.974153+00
5	quote_form	ercandeliceoglu@hotmail.com	Teklif - OXM-TFL-2026-240503	4	OXM-TFL-2026-240503	success	\N	admin@oxymed.com.tr	2026-05-28 19:29:32.494607+00
6	quote_form	ercandeliceoglu@hotmail.com	Teklif - OXM-TFL-2026-240503	4	OXM-TFL-2026-240503	success	\N	admin@oxymed.com.tr	2026-05-28 19:31:51.157594+00
7	quote_form	yusufdeliceoglu@gmail.com	Teklif - OXM-TFL-2026-240503	4	OXM-TFL-2026-240503	success	\N	admin@oxymed.com.tr	2026-05-28 19:32:24.55994+00
8	quote_form	yusufdeliceoglu@gmail.com	Teklif - OXM-TFL-2026-240503	4	OXM-TFL-2026-240503	success	\N	admin@oxymed.com.tr	2026-06-18 08:27:55.911092+00
9	quote_form	yusufdeliceoglu@hotmail.com	Teklif - OXM-TFL-2026-180601	10	OXM-TFL-2026-180601	success	\N	admin@oxymed.com.tr	2026-06-18 08:32:14.980596+00
10	quote_form	yusufdeliceoglu@hotmail.com	Teklif - OXM-TFL-2026-180601	10	OXM-TFL-2026-180601	success	\N	admin@oxymed.com.tr	2026-06-18 08:34:31.09163+00
11	quote_form	yusufdeliceoglu@gmail.com	Teklif - OXM-TFL-2026-180601	10	OXM-TFL-2026-180601	success	\N	admin@oxymed.com.tr	2026-06-18 08:35:53.962625+00
12	quote_form	info@batesmedical.com	Teklif - OXM-TFL-2026-180601	10	OXM-TFL-2026-180601	success	\N	admin@oxymed.com.tr	2026-06-18 08:38:25.449588+00
13	quote_form	yusufdeliceoglu@hotmail.com	Teklif - OXM-TFL-2026-180601	10	OXM-TFL-2026-180601	success	\N	admin@oxymed.com.tr	2026-06-18 08:47:34.175095+00
14	quote_form	ilkersadi@dokuinsaat.com.tr	Teklif - OXM-TFL-2026-180601	10	OXM-TFL-2026-180601	success	\N	admin@oxymed.com.tr	2026-06-18 08:49:05.041218+00
15	quote_form	ilkersadi@dokuinsaat.com.tr	Teklif - OXM-TFL-2026-180601	10	OXM-TFL-2026-180601	success	\N	ercandeliceoglu@hotmail.com	2026-06-19 11:28:51.588997+00
16	quote_form	seval.oz@atonet.org.tr	Teklif - OXM-TFL-2026-280701	27	OXM-TFL-2026-280701	success	\N	admin@oxymed.com.tr	2026-07-28 11:52:19.470464+00
17	quote_form	medecom.dhaka@gmail.com	Teklif - OXM-TFL-2026-010801	37	OXM-TFL-2026-010801	success	\N	admin@oxymed.com.tr	2026-08-04 07:59:27.47707+00
\.


--
-- Data for Name: maintenance_kits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.maintenance_kits (id, service_record_id, kit_name, kit_code, quantity, unit, created_at) FROM stdin;
\.


--
-- Data for Name: material_reservations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.material_reservations (id, order_id, material_id, reserved_qty, created_at) FROM stdin;
\.


--
-- Data for Name: material_stock; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.material_stock (id, name, description, supplier, price, quantity, unit, notes, created_at, updated_at, category, product_code, min_stock) FROM stdin;
\.


--
-- Data for Name: media_files; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.media_files (id, filename, object_path, mime_type, size, alt, created_at) FROM stdin;
4	ChatGPT Image May 20, 2026, 10_10_36 PM (4).png	/objects/uploads/eb262843-8a54-4408-ad83-9f69df78c083	image/png	978401	\N	2026-05-27 05:39:25.163192+00
5	ChatGPT Image May 20, 2026, 10_10_36 PM (4).png	/objects/uploads/f6421e85-ceb2-4965-9deb-737063440a92	image/png	978401	\N	2026-05-27 07:18:43.532496+00
6	ChatGPT Image May 20, 2026, 10_10_36 PM (4).png	/objects/uploads/61210573-61a4-4fcd-a01a-074507ef9358	image/png	978401	\N	2026-05-27 07:46:42.176063+00
7	ChatGPT Image May 20, 2026, 10_10_36 PM (4).png	/objects/uploads/24ad910e-752d-4e13-b2b5-4feec11cfada	image/png	978401	\N	2026-05-27 08:09:31.114317+00
8	ChatGPT Image May 25, 2026, 09_30_44 PM.png	/objects/uploads/c7b3879c-db63-464d-b011-040c33b8e687	image/png	1918242	\N	2026-05-27 08:09:39.106256+00
9	masa taslak.png	/objects/uploads/db2ecba4-30f7-491f-9344-8211a15ad33f	image/png	943422	\N	2026-05-27 08:09:47.121148+00
12	ChatGPT Image Jun 2, 2026, 07_22_13 PM.png	/objects/uploads/a60fdfb3-ca96-4175-99f0-b3e65b23e32a	image/png	1497345	\N	2026-06-02 17:05:32.552218+00
13	gazprizi.png	/objects/uploads/dfc343ac-0192-49d2-95ea-fd38fd4b014f	image/png	1259876	\N	2026-06-02 18:25:35.289718+00
14	gazalarmpaneli.png	/objects/uploads/982f12e6-c91d-433e-b431-2645691f38eb	image/png	409039	\N	2026-06-02 18:26:08.464765+00
15	bakirboru.png	/objects/uploads/4795266d-90dc-4396-87ca-a020f6ca9255	image/png	1811262	\N	2026-06-02 18:27:05.577911+00
16	ChatGPT Image Jun 2, 2026, 09_29_00 PM.png	/objects/uploads/b8daca1b-e15d-413d-9c1d-194152466f8a	image/png	1465428	\N	2026-06-02 18:29:08.109174+00
17	YBUnitesi.png	/objects/uploads/206cf3a1-19d8-4108-bc72-5cfb20c00fd4	image/png	1556175	\N	2026-06-02 18:31:51.514404+00
18	yatakbasunit.png	/objects/uploads/f5780e62-9914-41b3-b36c-b57922244bd6	image/png	1122940	\N	2026-06-02 18:35:05.455151+00
19	ChatGPT Image Jun 2, 2026, 07_30_15 PM.png	/objects/uploads/a68c10d6-fb3b-4f69-8cc2-d5f35618e0bd	image/png	1791127	\N	2026-06-02 18:35:22.963024+00
20	gazalarmpanelinew.png	/objects/uploads/66921ec0-369a-415e-802a-d7b28b40def6	image/png	233356	\N	2026-06-02 21:19:41.663484+00
21	tekkolpendant.webp	/objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	image/webp	23850	\N	2026-06-17 19:16:34.998552+00
22	ciftkollupendant.webp	/objects/uploads/ce791833-7a7a-44f1-861d-4a8f8ca7a8b6	image/webp	25738	\N	2026-06-17 19:16:37.322163+00
23	duvarmodulu.webp	/objects/uploads/004f0e70-81bb-4493-8d38-3e38a38b7ecb	image/webp	20366	\N	2026-06-17 19:16:39.292964+00
24	gazsantralmerkezi.webp	/objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	image/webp	25686	\N	2026-06-17 19:16:41.425739+00
25	basinclihavasantralmerkezi.webp	/objects/uploads/4297778e-7ab1-470e-9394-96efde66a49b	image/webp	23992	\N	2026-06-17 19:16:43.499463+00
26	vakumsantralmerkezi.webp	/objects/uploads/4d17142e-41af-4130-a3cb-c638f41f1cf4	image/webp	27426	\N	2026-06-17 19:16:45.548127+00
27	bolmekesmevana.webp	/objects/uploads/46d5478b-0f9b-4ab0-9c97-ed1a8abab053	image/webp	37540	\N	2026-06-17 19:23:00.465521+00
28	tavantipi.webp	/objects/uploads/19b92874-7977-492d-8243-c4bdf7040dce	image/webp	68518	\N	2026-06-17 19:29:35.368061+00
29	ERCAN KAŞE İMZA.PNG	/objects/uploads/1dc87887-7f7d-401e-a2a7-9dd2e5e09d35	image/png	105166	\N	2026-06-18 07:22:03.048645+00
30	WhatsApp Image 2026-06-18 at 10.54.12 AM.jpeg	/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	image/jpeg	107238	\N	2026-06-18 07:58:46.316121+00
31	calismamasasıno1.jpeg	/objects/uploads/06169fd7-f7d8-437f-bf68-08e9a3df3384	image/jpeg	51165	\N	2026-06-18 11:29:45.885254+00
32	ikikisilikdentaltek.png	/objects/uploads/b5e26088-f194-4ae9-9db1-75509c24436b	image/png	148402	\N	2026-06-18 11:35:47.225268+00
33	DTM02.png	/objects/uploads/f57c827c-e066-4a85-8b52-8be63fd03f57	image/png	107435	\N	2026-06-18 11:43:52.243418+00
35	oxytoztopla.png	/objects/uploads/2aa47b3f-8367-4955-9721-f7c7ab8d88d9	image/png	133993	\N	2026-06-19 11:54:20.895253+00
36	ChatGPT Image Jun 19, 2026, 11_18_43 PM.png	/objects/uploads/94c4acc2-f170-47b6-a8cd-b3a9463e71b3	image/png	1346130	\N	2026-06-19 20:20:24.498542+00
37	amalgamseparetor.png	/objects/uploads/d49d51b5-2d43-472c-ae6e-47bf439be942	image/png	1311141	\N	2026-06-21 09:55:34.666448+00
39	dalgakirantidy5.png	/objects/uploads/3bd47d49-c714-4045-9e42-910e67d70d13	image/png	234818	\N	2026-06-22 08:11:58.241539+00
41	kafatip100lt4hp.png	/objects/uploads/3ecf839e-435d-4fa4-9f02-1cffa4a41611	image/png	313914	\N	2026-06-22 08:30:11.461397+00
42	IMG_1068.webp	/objects/uploads/33298f56-0711-44d5-9112-c22e33f7b287	image/webp	27588	\N	2026-06-24 14:24:18.766836+00
44	dentalvakumsantrali.webp	/objects/uploads/c94d2111-08d7-4fff-813a-b868f2ec4136	image/webp	37142	\N	2026-06-24 15:03:31.622227+00
45	lfseriesengine.webp	/objects/uploads/bbde7d79-2e27-47de-9def-169753bde2df	image/webp	40860	\N	2026-06-24 15:05:01.704706+00
46	ChatGPT Image 15 Tem 2026 22_08_24.png	/objects/uploads/0b677feb-5150-486b-b6f5-785735d7cf0c	image/png	1705071	\N	2026-07-15 19:08:40.354611+00
47	2599ce5b-5ca2-4130-aa53-123.jpg	/objects/uploads/04bd46e2-6a1f-44fa-b252-6da220b3bdf8	image/jpeg	428986	\N	2026-07-17 13:09:19.795951+00
48	2599ce5b-5ca2-4130-aa53-123.jpg	/objects/uploads/661f6c5a-c8c0-4942-9449-33d072d51dd1	image/jpeg	428986	\N	2026-07-17 13:09:45.799594+00
49	2599ce5b-5ca2-4130-aa53-123.jpg	/objects/uploads/03813859-b562-4581-8db7-7cf055fea45e	image/jpeg	428986	\N	2026-07-17 13:10:09.569804+00
50	2599ce5b-5ca2-4130-aa53-123.jpg	/objects/uploads/fb372d51-9fbd-4556-bb93-dc55089f87e7	image/jpeg	428986	\N	2026-07-17 13:14:07.594284+00
51	Cadsadw2133aaa223111.png	/objects/uploads/77800ed7-affc-4569-84d6-5fe82653c2fd	image/png	1420345	\N	2026-07-17 13:26:10.699055+00
52	görsel_2026-08-03_103155127.png	/objects/uploads/105d6c23-3c58-4343-b883-7bdee0c43154	image/png	775452	\N	2026-08-03 07:32:00.614404+00
53	kart1dvs.webp	/objects/uploads/5fdfeba8-d420-4de0-8b9e-9dd8f034f7c3	image/webp	26578	\N	2026-08-03 07:48:20.334367+00
54	kart2dvs.webp	/objects/uploads/c55724f8-7812-427a-9f42-6be68603ceff	image/webp	21598	\N	2026-08-03 07:48:23.820928+00
55	kart3dvs.webp	/objects/uploads/9c8a1b07-f565-48f0-af13-c2f383b370fb	image/webp	53818	\N	2026-08-03 07:48:29.372007+00
56	heroimagedvs.webp	/objects/uploads/6ce056bc-0048-4006-bed3-515467f3e3aa	image/webp	172522	\N	2026-08-03 07:53:42.206792+00
57	heroimagedvs.webp	/objects/uploads/09ea572e-0036-4787-a4a6-41cfb79a85ec	image/webp	172522	\N	2026-08-03 07:59:03.451485+00
58	heroimagedvs.webp	/objects/uploads/2276bbeb-5346-48b0-93d9-49b3e095fdce	image/webp	172522	\N	2026-08-03 08:02:00.272943+00
59	800x800dvs.webp	/objects/uploads/ddb09734-ffcb-49af-9154-2c1284d63561	image/webp	467232	\N	2026-08-03 08:52:42.211304+00
60	ChatGPT Image 3 Ağu 2026 12_00_16.png	/objects/uploads/8d91bac0-0df8-472b-9e9b-d978a831a71d	image/png	1533727	\N	2026-08-03 09:04:51.945216+00
61	Başlıksız-6.webp	/objects/uploads/e9428f10-827f-41e1-a878-f195e82e53ae	image/webp	63388	\N	2026-08-03 09:05:01.242728+00
62	Başlıksız-7.webp	/objects/uploads/a1fb9457-0860-4b65-a5b6-69fdd2154def	image/webp	23734	\N	2026-08-03 09:07:21.690103+00
63	urunkartidvp.webp	/objects/uploads/283fd90b-7501-4087-a217-2685b27ec45d	image/webp	23104	\N	2026-08-03 09:15:53.716535+00
64	dvp_urungorseli.webp	/objects/uploads/d12d7faa-8ee5-4c3b-b4c8-b174e44453ef	image/webp	124598	\N	2026-08-03 09:20:01.131202+00
65	dvp_urungorseli2.webp	/objects/uploads/61212a88-b7b3-425f-acd3-7233d101ff32	image/webp	89028	\N	2026-08-03 09:20:54.847823+00
66	dvp_urungorseli2.webp	/objects/uploads/1aed5fd6-fc8d-4ee5-a432-b8a5a8858d4b	image/webp	89028	\N	2026-08-03 09:20:58.4828+00
67	ChatGPT Image 3 Ağu 2026 12_28_58.png	/objects/uploads/19995dc7-2e99-4495-bb31-c336da9e04ac	image/png	1127140	\N	2026-08-03 09:30:54.985037+00
68	Başlıksız-5.webp	/objects/uploads/9bde5608-c1e9-41b2-8509-3bdce3df5857	image/webp	33722	\N	2026-08-03 09:35:32.403428+00
69	dvpteknikcizim.webp	/objects/uploads/4e9fc889-2278-4882-bc3c-c40f515916df	image/webp	41500	\N	2026-08-03 10:19:40.958507+00
70	kutu1dvp.webp	/objects/uploads/2a66cd7d-eaa8-4439-b210-511122d25c4c	image/webp	36874	\N	2026-08-03 10:24:29.190731+00
71	kutu2dvp.webp	/objects/uploads/196cad09-f6bc-4ebb-8223-7cbe919dd576	image/webp	17018	\N	2026-08-03 10:24:31.895643+00
72	Başlıksız-8.webp	/objects/uploads/0819d6f6-efc4-4bb0-9ef4-31e499e31260	image/webp	42426	\N	2026-08-03 10:24:55.123845+00
73	urunkartgorselas1.webp	/objects/uploads/7ef6ef45-bf59-4340-8cb4-8029af04d787	image/webp	13538	\N	2026-08-03 10:30:43.123164+00
74	urunkartgorsel1.webp	/objects/uploads/2b3b2faf-5367-48cd-a183-fff599b67eb4	image/webp	14910	\N	2026-08-03 10:40:45.367861+00
75	urunkartgorsel2.webp	/objects/uploads/90504a0e-5b68-477d-b2da-b7bae5fd5dd9	image/webp	17816	\N	2026-08-03 10:40:49.658845+00
76	urunkartgorsel3.webp	/objects/uploads/6496d287-3a3d-4c43-88a5-15a69b662774	image/webp	9784	\N	2026-08-03 10:40:53.621258+00
77	urunkartgorsel4.webp	/objects/uploads/0ef775d6-95ba-4d46-9d86-46158025bddd	image/webp	8756	\N	2026-08-03 10:40:57.637649+00
78	teknik-cizim-net-1600x950.png	/objects/uploads/92fdc9eb-380c-402e-9706-f0b5d565097f	image/png	87516	\N	2026-08-03 10:47:14.43581+00
79	urunkartgorselas1.webp	/objects/uploads/a37eb21e-1ee8-4910-817b-66433dedb5fc	image/webp	13538	\N	2026-08-03 10:49:45.317772+00
80	urunkartgorselas1.webp	/objects/uploads/dcb72de2-7a43-46f9-b2c0-ae2e5e01acd6	image/webp	13538	\N	2026-08-03 10:50:04.966404+00
81	amalgamseperator teknik çizim.webp	/objects/uploads/9f6ea014-0797-42e8-b594-a7f2557054a1	image/webp	16802	\N	2026-08-03 10:50:11.74803+00
82	urunkartgorselas2.webp	/objects/uploads/64a70581-27d4-4551-9e65-d5d95e14c22d	image/webp	11000	\N	2026-08-03 10:52:41.948667+00
83	katkontrolkartgorsel.webp	/objects/uploads/da197172-f8d5-4e5d-9ece-cc689645f5a2	image/webp	65898	\N	2026-08-03 10:56:44.449721+00
84	katkontrolkartgorsel.webp	/objects/uploads/43f837ee-e78a-4da5-8b02-e839e00e72a1	image/webp	65898	\N	2026-08-03 10:57:58.338713+00
85	katkontrolkartgorsel.webp	/objects/uploads/d3ce89b5-5c4f-4088-a23b-58542dba72ca	image/webp	65898	\N	2026-08-03 11:16:21.746774+00
86	kartgorsel2.webp	/objects/uploads/82219002-aa11-4a43-a04c-a44bb0a5dda2	image/webp	91234	\N	2026-08-03 11:28:54.465867+00
87	ChatGPT Image 3 Ağu 2026 14_23_26.png	/objects/uploads/5a1d4524-0c8b-4a2f-9260-87d4b4b6dfa9	image/png	2001915	\N	2026-08-03 11:29:32.541857+00
88	ChatGPT Image 3 Ağu 2026 14_32_17.png	/objects/uploads/79672b1f-4a6a-4bd6-a8fe-62aea3fb8c04	image/png	1151388	\N	2026-08-03 11:33:13.445676+00
89	katkontrolteknikcizim.webp	/objects/uploads/ecb210c3-06c7-4241-855c-8e4a972f7b87	image/webp	5840	\N	2026-08-03 11:33:23.581717+00
90	kartgorsel1.webp	/objects/uploads/637cbeb8-aa50-41cb-bba9-cfb4f8ab594d	image/webp	40730	\N	2026-08-03 12:01:36.018798+00
91	kartgorsel4.webp	/objects/uploads/2927e828-9953-45bb-9c62-1d1fa0cd568e	image/webp	35220	\N	2026-08-03 12:06:02.87517+00
92	kartgorsel3.webp	/objects/uploads/f7fc933e-af6d-4516-a47e-61a1776e8f54	image/webp	20204	\N	2026-08-03 12:06:06.986639+00
93	images.jpg	/objects/uploads/568ce401-cb21-41d3-a34d-81ae383af3a7	image/jpeg	37347	\N	2026-08-03 12:21:56.358867+00
94	19-03-2024_113252782_S1.png	/objects/uploads/a382a7cd-1a27-43e3-b815-3ec91e559c94	image/png	84097	\N	2026-08-03 12:22:52.697794+00
95	channels4_profile.jpg	/objects/uploads/625d8f39-9404-4cb1-96e3-9b270006c59d	image/jpeg	112592	\N	2026-08-03 12:25:04.676738+00
96	images (1).jpg	/objects/uploads/d92fa03d-3787-4138-8b59-fd1efa67979c	image/jpeg	29748	\N	2026-08-03 12:25:07.159514+00
97	images (2).jpg	/objects/uploads/a569a4d5-d8d8-4450-9102-61b3ba39ab70	image/jpeg	25837	\N	2026-08-03 12:26:08.629689+00
98	izmir-demokrasi-universit-519_2.jpg	/objects/uploads/312079ee-ceb1-4ee3-8353-ca243acf5983	image/jpeg	47135	\N	2026-08-03 12:26:10.876854+00
99	493519264_9732671093445859_303126830898233713_n-1000x600.jpg	/objects/uploads/c5cb738a-bb70-4c7a-8e6a-32263aadb8c0	image/jpeg	71966	\N	2026-08-03 12:28:01.734587+00
100	biga-da-agiz-ve-dis-sagligi-merkezi-hizmette-1068.jpg	/objects/uploads/a72600a9-227d-4e75-8c93-28b92ed2c0cb	image/jpeg	220388	\N	2026-08-03 12:29:28.005336+00
101	karaman-agiz-ve-dis-sagligi-merkezi-11400.jpg	/objects/uploads/89b1357a-f5f6-4fdc-b111-e93740afc850	image/jpeg	215231	\N	2026-08-03 12:31:06.997253+00
102	orig.jpg	/objects/uploads/2ce89207-61a0-4049-8f10-49febb076bb0	image/jpeg	53024	\N	2026-08-03 12:32:25.146472+00
103	salihli-agiz-ve-dis-sagligi-hastanesi.webp	/objects/uploads/6b339b20-3b1b-4d7f-b6d6-48d01f1882b2	image/webp	25358	\N	2026-08-03 12:33:21.101929+00
104	turgutlu-agiz-ve-dis-sagligi-merkezi.webp	/objects/uploads/4f759020-1147-47fc-86ca-08523543fdeb	image/webp	40694	\N	2026-08-03 12:34:01.745228+00
105	orig (1).jpg	/objects/uploads/ad76902f-0b2c-4f98-b3d7-0c48987d98bf	image/jpeg	2143100	\N	2026-08-03 12:35:23.732374+00
106	yozgat-agiz-ve-dis-sagligi-merkezi.webp	/objects/uploads/00e36fd6-08a5-459d-9573-56426d357379	image/webp	43982	\N	2026-08-03 12:36:25.423144+00
137	Screenshot_2.png	/objects/uploads/f98b5f63-e527-4fca-8f07-ab045c0d476c	image/png	940158	\N	2026-08-03 12:44:58.177552+00
138	kulu-devlet-hastanesi.webp	/objects/uploads/a78d91c7-4b1e-47f5-8fd1-eecd19720af7	image/webp	37632	\N	2026-08-03 12:46:12.921498+00
139	orig (2).jpg	/objects/uploads/3d334ba4-2787-4442-923c-1a260b471ba6	image/jpeg	1493960	\N	2026-08-03 12:47:35.668483+00
140	DSC_0011.jpg	/objects/uploads/a9886011-23cc-488e-97b4-1f2e4282fcd2	image/jpeg	457338	\N	2026-08-03 12:48:46.061357+00
141	DSC_0011.jpg	/objects/uploads/45d40177-e7f4-4d9e-a4fd-69d64eb2a981	image/jpeg	457338	\N	2026-08-03 12:48:54.435595+00
142	3169.jpg	/objects/uploads/da4aa253-0eb4-47fd-8bb1-e90e229e43fb	image/jpeg	111420	\N	2026-08-03 12:50:22.75951+00
143	Bolu-Gerede-Devlet-Hastanesi-_yeni.webp	/objects/uploads/ba06306a-7811-4c69-8160-9ac5d60bf438	image/webp	122212	\N	2026-08-03 12:52:18.549763+00
144	Bolu-Gerede-Devlet-Hastanesi-_yeni.webp	/objects/uploads/8c21f12a-bac6-413b-9bc1-152eb8b73086	image/webp	122212	\N	2026-08-03 12:53:52.755487+00
145	Screenshot_3.png	/objects/uploads/49857c05-30c7-4471-9860-35c4a6ad722c	image/png	1898671	\N	2026-08-03 12:54:27.564792+00
146	Screenshot_4.png	/objects/uploads/e6505099-86f2-4962-978b-8e7e1167ae0d	image/png	2988937	\N	2026-08-03 12:56:26.609076+00
147	Screenshot_4.png	/objects/uploads/5f623b9b-4986-437c-8f2e-94ad392cfee0	image/png	2988937	\N	2026-08-03 12:56:35.480109+00
148	terme-devlet-hastanesi-acil-se_1775571107_IUsiL8.webp	/objects/uploads/a54d003c-3baa-4812-a740-cc10be3bc076	image/webp	108342	\N	2026-08-03 12:58:12.266501+00
149	1691672782.jpg	/objects/uploads/9152a559-881b-41e0-b9f6-a0a8d1532599	image/jpeg	106436	\N	2026-08-03 12:59:12.03908+00
150	bolu-izzet-baysal-devlet-hastanesi.webp	/objects/uploads/63216777-4d74-4cde-b9d7-e6bb6d41f3af	image/webp	90436	\N	2026-08-03 13:00:56.198601+00
151	Bolu-Gerede-Devlet-Hastanesi-_yeni.webp	/objects/uploads/858c63d5-dddd-4edf-8a40-9b9ddf16be99	image/webp	122212	\N	2026-08-03 13:03:30.84987+00
152	t-c-saglik-bakanligi-bolu-izzet-baysal-devlet-hastanesi.jpg	/objects/uploads/c9d90b56-a296-4837-b004-cb615ed37170	image/jpeg	60259	\N	2026-08-03 13:05:16.591383+00
153	bolu-izzet-baysal-devlet-hastanesi.webp	/objects/uploads/9231d873-11c5-434c-95e6-de917442d051	image/webp	90436	\N	2026-08-03 13:05:21.39332+00
154	Screenshot_1.png	/objects/uploads/14b8fe9a-15ed-4330-a630-c1583ac8950c	image/png	747081	\N	2026-08-03 13:05:29.525284+00
155	SAMSUNTERME.webp	/objects/uploads/fbdb3787-eed7-47bb-a4e8-60f924ddf675	image/webp	46788	\N	2026-08-03 13:21:19.313316+00
156	24617Mardin-Devlet-Hastanesi-Dogu-Iklimlendirme-ile-Nefes-Aliyor.jpg	/objects/uploads/01a4e98b-39a8-4724-92df-bde8df23a28b	image/jpeg	82221	\N	2026-08-03 13:24:19.04625+00
157	MARDİNDEVLET.webp	/objects/uploads/5e85f80f-b47b-457c-b56b-19c49c8d32d9	image/webp	44472	\N	2026-08-03 13:25:03.592968+00
158	images (3).jpg	/objects/uploads/2031606a-837a-4b1b-99bf-ab070bd6f473	image/jpeg	32998	\N	2026-08-03 13:25:51.338357+00
159	images (4).jpg	/objects/uploads/e4f0f744-c9e9-456a-b518-f5fff3c10837	image/jpeg	25467	\N	2026-08-03 13:26:41.290294+00
160	Ortaköy-Devlet-Hastanesi-1.jpg	/objects/uploads/d6c27633-c10f-449e-8413-577ceaec0263	image/jpeg	63979	\N	2026-08-03 13:27:37.895293+00
161	images (5).jpg	/objects/uploads/1da597c6-b7aa-40c1-847b-2e758aa97bc8	image/jpeg	30105	\N	2026-08-03 13:28:06.867212+00
162	o-hastane-aydinlandi-hm.webp	/objects/uploads/6dc0611b-5441-4cad-8b1d-f37cc5100c73	image/webp	94716	\N	2026-08-03 13:29:52.180155+00
163	images (6).jpg	/objects/uploads/02c69ba1-7ca0-45de-a5df-6517dedd92b5	image/jpeg	25960	\N	2026-08-03 13:30:58.668185+00
164	images (7).jpg	/objects/uploads/ab8f5dd2-1932-485a-b2aa-15681641b705	image/jpeg	35273	\N	2026-08-03 13:31:49.456069+00
165	sahte-doktor-sorusturmasinin-ardindan-cerkezkoy-devlet-hastanesi-bashekimlig-ine-yeni-atama-1103014-5.webp	/objects/uploads/e4466dd0-bee8-4806-a29e-c42394195924	image/webp	59088	\N	2026-08-03 13:32:58.291106+00
166	3561.jpg	/objects/uploads/2e77700e-557a-41b5-9792-ad1126cbb026	image/jpeg	121038	\N	2026-08-03 14:41:37.208243+00
167	aksaray-egitim-ve-arastirma-hastanesi-291.jpg	/objects/uploads/ca06881d-b94f-4b19-9f5c-041a125d7ca6	image/jpeg	116554	\N	2026-08-03 14:42:42.513096+00
168	cocuk-acil-girisi-gecici-sureyle-kapali336.webp	/objects/uploads/8fb6335c-db2a-495c-808c-6db290c1c523	image/webp	340166	\N	2026-08-03 14:43:27.251206+00
169	yumurtalik-devlet-hastanesi-yumurtalik-07eb0.jpg	/objects/uploads/f3efc44b-249c-4364-93ff-308a2377af7d	image/jpeg	99860	\N	2026-08-03 14:43:57.060921+00
170	352.jpg	/objects/uploads/2abca883-5bd1-45f9-a9f3-5b8c611f0f3c	image/jpeg	68663	\N	2026-08-03 14:44:29.219026+00
171	images (8).jpg	/objects/uploads/e53fd76e-e102-434d-9730-f8a564e2959d	image/jpeg	44328	\N	2026-08-03 14:45:16.847696+00
172	images (9).jpg	/objects/uploads/940a4000-2b42-4159-b691-0d834cfda4bd	image/jpeg	43144	\N	2026-08-03 14:45:58.468397+00
173	akdeniz-universitesi-hastanesi.webp	/objects/uploads/9f065308-4863-4ac7-bef9-2014e53e631c	image/webp	133272	\N	2026-08-03 14:47:03.584548+00
174	images (10).jpg	/objects/uploads/57554b5c-48e2-4496-83e9-bf1172de0d89	image/jpeg	17385	\N	2026-08-03 14:47:15.960134+00
175	DJI_0020.jpg	/objects/uploads/644689f3-4e42-44bd-b6ac-affbad2c5d7b	image/jpeg	361526	\N	2026-08-03 14:48:06.952072+00
176	images (11).jpg	/objects/uploads/729f0901-0e16-4d8b-81a9-f35784ce0fc3	image/jpeg	33282	\N	2026-08-03 14:49:01.384718+00
177	dort2-720x700.jpg	/objects/uploads/36c2d04b-0389-4a8a-9725-385dcfbe2088	image/jpeg	94955	\N	2026-08-03 14:49:56.964996+00
178	1950.jpg	/objects/uploads/9095e42f-8777-4ae5-b5e9-f954c0c44151	image/jpeg	179128	\N	2026-08-03 14:50:58.236141+00
179	aydin-ataturk-devlet-hastanesi-742.jpg	/objects/uploads/8efa9299-3925-463a-8ede-e2806c161c80	image/jpeg	206666	\N	2026-08-03 14:51:47.949613+00
180	sakarya-karasu-hastane-6.jpg	/objects/uploads/965c959b-0178-4c5e-8960-709bd3aae0f3	image/jpeg	74842	\N	2026-08-03 14:53:00.098551+00
181	L_height.webp	/objects/uploads/457c6ae4-b3c4-42a4-81ca-4eea04286b07	image/webp	42490	\N	2026-08-03 14:53:42.951798+00
182	ankara-gulhane-egitim-ve-arastirma-hastanesi-783.jpg	/objects/uploads/34bf0b0d-3382-4602-8e80-589277b4e7e1	image/jpeg	69867	\N	2026-08-03 14:55:04.720957+00
183	t-c-saglik-bakanligi-gulhane-egitim-ve-arastirma-hastanesi.jpg	/objects/uploads/ac4c8176-6b94-4bb1-a912-e4c1c8fefb43	image/jpeg	58398	\N	2026-08-03 14:55:32.402651+00
184	Başlıksız-12.png	/objects/uploads/22ec7417-4d83-452d-aa11-7b9bcf1bcdbd	image/png	497055	\N	2026-08-03 14:56:01.498823+00
185	hygieneinstitut_gr.jpg	/objects/uploads/2774963e-1558-4180-b0fa-2a0376067671	image/jpeg	86144	\N	2026-08-03 14:57:36.591418+00
186	images (13).jpg	/objects/uploads/916feb01-886c-45bc-bc2d-d9202763d156	image/jpeg	33339	\N	2026-08-03 14:58:23.384015+00
187	OZEL-İNCEK-FİZİK-TEDAVİ-VE-REHABİLİTASYON-HASTANESİ.jpeg	/objects/uploads/950a332e-29e4-485d-b3fd-679a2bca3fa8	image/jpeg	302577	\N	2026-08-03 14:59:42.234457+00
188	OZEL-İNCEK-FİZİK-TEDAVİ-VE-REHABİLİTASYON-HASTANESİ.jpeg	/objects/uploads/3b6ed1e5-5db4-45f4-bacd-15dba67e8573	image/jpeg	302577	\N	2026-08-03 15:00:39.163699+00
189	ozel-oldcitydent-agiz-dis-sagligi-hastanesi-eskisehir-3.jpg	/objects/uploads/28534963-4941-471c-9425-d00dc6c25556	image/jpeg	52205	\N	2026-08-03 15:00:52.658756+00
190	images (14).jpg	/objects/uploads/9c39a107-1e4e-4b5b-ba58-5d6a0fde95aa	image/jpeg	40158	\N	2026-08-03 15:02:10.990755+00
191	vkV27_130.png	/objects/uploads/79222235-66c6-4c27-b3ab-b4d88d8b9773	image/png	267382	\N	2026-08-03 15:03:01.350376+00
192	images (15).jpg	/objects/uploads/e564741b-7b27-4e9f-9e23-e82124e95f83	image/jpeg	48410	\N	2026-08-03 15:03:32.159842+00
193	ozel_doruk_yildirim_hastanesi.jpg	/objects/uploads/f1dd2ee8-7cd9-4016-b5d6-88b4db636386	image/jpeg	63189	\N	2026-08-03 15:04:31.351107+00
194	orig (3).jpg	/objects/uploads/0fcf28c3-cdcf-4cf0-9dc7-535c9e15de03	image/jpeg	177758	\N	2026-08-03 15:06:30.186256+00
195	Deu_logo.png	/objects/uploads/0fed1b20-b19e-4620-9d3f-29f54a1f805b	image/png	25072	\N	2026-08-03 15:06:33.748119+00
196	images (16).jpg	/objects/uploads/9dbc6719-f801-4a17-9715-9b1951da7e29	image/jpeg	63825	\N	2026-08-03 15:07:25.213919+00
197	G9a_icWXEAAOi0m.jpg	/objects/uploads/8910af2a-e93d-4f07-a224-fda20b3d7474	image/jpeg	165617	\N	2026-08-03 15:09:02.542744+00
198	dsc09020.jpg	/objects/uploads/93f47b7a-2480-40ae-bfe7-f1087812f408	image/jpeg	170894	\N	2026-08-03 15:09:42.74411+00
199	images (17).jpg	/objects/uploads/e2eb0acf-8276-4b76-b497-1ecba36ca6b3	image/jpeg	12784	\N	2026-08-03 15:11:23.17137+00
200	orig (4).jpg	/objects/uploads/329a38cd-6881-4ca2-9bfc-8ce540117a24	image/jpeg	314532	\N	2026-08-03 15:11:24.993761+00
201	images (17).jpg	/objects/uploads/7aeff632-d98e-40f8-8436-bdbf64db5b48	image/jpeg	12784	\N	2026-08-03 15:11:31.042039+00
202	portfolio-11.jpg	/objects/uploads/d8090d6f-107e-4a28-bac9-090bc317517d	image/jpeg	47856	\N	2026-08-03 15:12:24.577361+00
203	03f6167f66cfefe8e577b1c69ba69dd9.webp	/objects/uploads/6e00025c-32c4-497f-b745-f8e58bdb2afd	image/webp	28986	\N	2026-08-03 15:15:20.428198+00
204	03f6167f66cfefe8e577b1c69ba69dd9.webp	/objects/uploads/816c7ff5-d29c-4d90-a935-9bb31fc309a1	image/webp	28986	\N	2026-08-03 15:15:48.927699+00
205	anadoluimages_20331909.jpg	/objects/uploads/8a4cbdad-1096-4e7a-838a-24d182338f32	image/jpeg	190263	\N	2026-08-03 15:16:13.53497+00
206	izmir-adsm-5.jpg	/objects/uploads/84599783-c7c2-46ac-b7ac-caea5b3e70b6	image/jpeg	524711	\N	2026-08-04 08:00:40.017333+00
207	348901.jpg	/objects/uploads/e748e7b4-0ce6-4abf-8cff-61a7a9464500	image/jpeg	132638	\N	2026-08-04 08:05:00.676357+00
208	348901.jpg	/objects/uploads/7b05593a-546a-483d-9fd1-4d2ffa109501	image/jpeg	132638	\N	2026-08-04 08:05:06.154816+00
209	i-m-g-3555-1.webp	/objects/uploads/e2a5f672-89bd-4b25-89ab-3ab8c8accf97	image/webp	131296	\N	2026-08-04 08:12:52.60091+00
210	1708762835_2.png	/objects/uploads/b4219b6e-209d-40c4-9736-2bac65e90663	image/png	334036	\N	2026-08-04 08:25:04.38582+00
211	whatsapp-image-2023-09-08-at-12-xO4l_cover.webp	/objects/uploads/fb8fb4a7-027b-47bf-91e4-e93b886119a5	image/webp	81720	\N	2026-08-04 08:27:00.035332+00
213	oxyozon.png	/objects/uploads/882044ea-a883-4887-b344-b09647a644cb	image/png	267722	\N	2026-08-11 08:05:32.201535+00
214	ERCAN KAŞE İMZA.PNG	/objects/uploads/bf8be97c-e14c-410d-b748-c42ae7e021c7	image/png	105166	\N	2026-08-12 21:39:09.686628+00
215	2599ce5b-5ca2-4130-aa53-e8cc75bfff6c.jpg	/objects/uploads/a8e88cc6-f587-46d7-80cf-0aac1e302b88	image/jpeg	107238	\N	2026-08-13 08:22:42.899285+00
216	oxymed-dental-vacuum-system.png	/objects/uploads/3d17b70d-8e44-4183-9c6b-a8027ef68e99	image/png	1238801	\N	2026-08-17 11:06:31.816055+00
217	G00389.webp	/objects/uploads/d69186e5-a4bb-4442-bdde-152b4626f8b6	image/webp	13460	\N	2026-08-17 11:21:37.77136+00
218	görsel_2026-08-17_181340699.png	/objects/uploads/457bc890-3ab2-4dcc-ba66-bbd37c7d1014	image/png	15878	\N	2026-08-17 15:13:45.356966+00
219	rulogo.webp	/objects/uploads/fdaec690-13ff-4bf0-b880-72e591d71ff3	image/webp	21160	\N	2026-08-17 15:13:53.167552+00
220	rulogo.webp	/objects/uploads/f8de8bf9-8327-4063-9ff1-1b8516f5045a	image/webp	21218	\N	2026-08-17 15:14:35.692557+00
221	ChatGPT Image 17 Ağu 2026 18_28_17.png	/objects/uploads/fc0d410d-b197-47a1-902b-a3b34427731d	image/png	1262920	\N	2026-08-17 15:33:39.808619+00
222	ChatGPT Image 17 Ağu 2026 18_38_41.png	/objects/uploads/144ec908-1203-4605-9036-ddc0963750c9	image/png	1342161	\N	2026-08-17 15:39:11.48322+00
223	ChatGPT Image 17 Ağu 2026 22_43_17.png	/objects/uploads/e5d91809-d68a-42d7-9b24-4dd5e4f32202	image/png	1264143	\N	2026-08-17 19:43:34.575964+00
225	310c68b7.jpg	/objects/uploads/3b7a1a79-f4b1-462b-913d-8b4dd0a04e68	image/jpeg	255694	\N	2026-08-17 20:05:52.051138+00
226	pendantheromain.jpg	/objects/uploads/c34a0a11-63ab-4230-a833-226720ea32db	image/jpeg	191451	\N	2026-08-17 20:08:29.225467+00
227	Logo_of_Ministry_of_Health_(Turkey).png	/objects/uploads/3f14a1e9-e5a8-4e5e-a50b-ed98282eda52	image/png	1064851	\N	2026-08-27 07:35:40.441173+00
\.


--
-- Data for Name: news; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.news (id, title, excerpt, content, category, image_url, slug, published, published_at, created_at, updated_at, seo_title, seo_description) FROM stdin;
6	CNC Üretim Hatlarımızda Kalite ve Hassasiyet	Yüksek hassasiyetli CNC makinelerimiz ile medikal parçaların üretim süreçleri.	\N	ÜRETİM	/assets/images/corporate-quality-macro.png	cnc-uretim-hatlarinda-kalite-hassasiyet	f	2024-04-18 00:00:00+00	2026-05-16 20:08:37.562635+00	2026-08-13 07:56:49.266+00	\N	\N
1	Medikal Gaz Sistemleri Nedir?	Hastanelerde oksijen, medikal hava, vakum ve diğer gazların güvenli dağıtımını sağlayan medikal gaz sistemlerinin bileşenlerini, standartlarını ve bakım gerekliliklerini keşfedin.	Medikal gaz sistemi; hastaneler, ameliyathaneler, yoğun bakım üniteleri, klinikler ve diğer sağlık kuruluşlarında ihtiyaç duyulan gazların merkezi bir kaynaktan güvenli, sürekli ve kontrollü biçimde kullanım noktalarına ulaştırılmasını sağlayan mühendislik altyapısıdır. Oksijen, medikal hava, vakum, azot protoksit, karbondioksit ve anestezik gaz tahliye sistemleri bu altyapının en yaygın uygulamaları arasında yer alır.\n\nMedikal gaz sisteminin temel bileşenleri\n\n1. Merkezi gaz kaynağı: Oksijen tankı veya manifold sistemi, medikal hava kompresörleri, vakum pompaları ve ihtiyaç duyulan diğer gaz kaynakları sistemin başlangıç noktasını oluşturur. Kaynak kapasitesi, yedeklilik ve otomatik devreye girme senaryoları sağlık tesisinin kritik ihtiyaçlarına göre tasarlanır.\n\n2. Boru dağıtım ağı: Gazlar, uygun kalite ve ölçülerde seçilmiş bakır boru hatlarıyla ilgili katlara ve bölümlere taşınır. Boru güzergâhları; çap, basınç kaybı, zonlama, erişilebilirlik ve gelecekteki kapasite ihtiyacı dikkate alınarak projelendirilir.\n\n3. Terminal üniteleri: Duvar, tavan veya pendant ünitelerinde bulunan gaz prizleri ve vakum bağlantıları, sağlık personelinin gazı güvenli şekilde kullanmasını sağlar. Her gaz türü, yanlış bağlantıyı önleyecek biçimde ayrı bağlantı standardına sahip olmalıdır.\n\n4. Alarm ve izleme sistemleri: Kaynak basıncı, hat basıncı ve vakum seviyeleri sürekli izlenir. Bölgesel ve ana hat alarmları, kritik seviyelerde sağlık personelini uyararak kesintisiz hasta bakımına destek olur.\n\nEn yaygın medikal gazlar\n\nOksijen, solunum desteği ve anestezi uygulamalarında kullanılır. Medikal hava; ventilatörler, anestezi cihazları ve pnömatik tıbbi ekipman için temiz ve kontrollü hava sağlar. Merkezi vakum; aspirasyon, cerrahi uygulamalar ve hasta bakım süreçlerinde kullanılır. Azot protoksit ve karbondioksit gibi gazlar ise kullanım alanına göre özel altyapı, depolama ve güvenlik gereklilikleriyle sisteme dahil edilir.\n\nStandartlara uygun tasarım ve güvenli kurulum\n\nBir medikal gaz tesisatının güvenilirliği yalnızca boru döşemekle sınırlı değildir. Proje; gaz türlerini, debi ve basınç ihtiyaçlarını, kritik alanları, yedek kaynakları, alarm senaryolarını ve bakım erişimini birlikte ele almalıdır. Tasarım ve uygulamada TS EN ISO 7396-1 gibi medikal gaz boru hattı sistemlerine ilişkin standartlar ile ilgili ulusal mevzuat ve tesis gereklilikleri dikkate alınır. Boru temizliği, uygun birleştirme yöntemi, hat etiketleme, kaçak testi, basınç testi, gaz kimliklendirme ve devreye alma kontrolleri teslim öncesi kritik adımlardır.\n\nBakım neden önemlidir?\n\nDüzenli bakım; basınç dalgalanmalarının, kaçakların, alarm arızalarının ve ekipman performans kayıplarının erken tespit edilmesine yardımcı olur. Kaynak ekipmanları, vakum pompaları, kompresörler, alarm panoları, kesme vanaları ve terminal üniteleri planlı bakım programında kontrol edilmelidir. Yapılan testler ve müdahaleler kayıt altına alınmalı, kritik bölümlerde bakım planı sağlık hizmetinin sürekliliğini gözetmelidir.\n\nOxymed Medikal olarak hastaneler ve sağlık kuruluşları için proje ihtiyaçlarına göre merkezi medikal gaz sistemleri, vakum altyapıları, alarm çözümleri ve ekipman entegrasyonu sunuyoruz. Doğru kapasite hesabı, güvenli uygulama ve sürdürülebilir servis yaklaşımıyla sağlık tesisiniz için güvenilir bir medikal gaz altyapısı oluşturabilirsiniz.	Ürün Haberleri	/assets/images/product-medical-gas.png	medikal-gaz-sistemleri-nedir	t	2024-05-28 00:00:00+00	2026-05-16 20:08:37.562635+00	2026-08-18 11:12:26.182495+00	Medikal Gaz Sistemleri Nedir? | Oxymed Medikal	Medikal gaz sistemleri; oksijen, medikal hava ve vakumu güvenle dağıtır. Hastane gaz tesisatı, bileşenleri, standartları ve bakımı hakkında rehber.
8	Hastane Medikal Gaz Sistemi Nasıl Çalışır?	Hastane medikal gaz sistemi; merkezi kaynak, boru hattı, bölge vanaları, terminal üniteler ve alarm panoları üzerinden gazları güvenli biçimde kullanım noktalarına ulaştırır.	Hastane medikal gaz sistemi nasıl çalışır? Bu sorunun cevabı; merkezi gaz kaynağından hasta başı ve klinik kullanım noktalarına kadar uzanan, birbiriyle bağlantılı ve güvenlik odaklı mühendislik bileşenlerinde saklıdır. Sistem; oksijen, medikal hava, merkezi vakum, azot protoksit ve ihtiyaca göre diğer medikal gazları kesintisiz biçimde dağıtmak için tasarlanır.\n\nMedikal gaz sistemi hangi aşamalardan oluşur?\n\n1. Merkezi gaz kaynağı: Oksijen tankı, manifold sistemi, medikal hava kompresörü veya merkezi vakum pompa grubu sistemin kaynağını oluşturur. Kritik sağlık alanlarında ana kaynağın yanında ikincil ve yedek kaynak bulunması, bakım veya arıza sırasında sürekliliği destekler.\n\n2. Kontrol ve regülasyon: Kaynaktan gelen gaz, uygun basınç seviyesine düşürülür ve kontrol panoları üzerinden izlenir. Regülatörler, çek valfler, filtreler ve kontrol ekipmanları gazın güvenli ve kararlı biçimde hatta verilmesine yardımcı olur.\n\n3. Boru dağıtım hattı: Gazlar, projeye uygun çapta ve medikal gaz kullanımına elverişli bakır boru hatlarıyla katlara ve bölümlere taşınır. Hatlar; ameliyathane, yoğun bakım, acil servis ve hasta odaları gibi kritik alanlara göre zonlanabilir.\n\n4. Bölge vanaları: Zon vana kutuları, belirli bir alanın gaz akışını gerektiğinde güvenli şekilde izole etmeye yarar. Vana kutularının erişilebilir ve açıkça etiketlenmiş olması gerekir.\n\n5. Terminal üniteler: Duvar, tavan veya pendant sistemlerde bulunan gaz prizleri ve vakum bağlantıları, cihazların ve klinik ekipmanların sisteme bağlandığı son noktadır. Her gaz türünün bağlantısı karışıklığı önleyecek şekilde ayrı tanımlanır.\n\n6. Alarm ve izleme: Ana hat, kaynak ve bölge alarmları; basınç düşüşü, vakum kaybı veya kaynak seviyesindeki kritik değişiklikleri sağlık personeline bildirir. Alarm sistemi, medikal gaz altyapısının güvenli işletilmesinin temel unsurlarındandır.\n\nSistem devreye alınmadan önce boru hatlarının temizliği, hat etiketleri, gaz kimliklendirmesi, kaçak ve basınç testleri, debi kontrolleri, alarm senaryoları ve terminal ünite kontrolleri gerçekleştirilir. TS EN ISO 7396-1 gibi medikal gaz boru hattı standartları ile yürürlükteki yerel mevzuat tasarım ve doğrulama sürecinde dikkate alınır.\n\nSonuç olarak hastane medikal gaz sistemi; kaynak, dağıtım, kontrol, terminal ve alarm katmanlarının birlikte çalıştığı kritik bir altyapıdır. Oxymed Medikal, sağlık tesislerinin kapasite ve kullanım senaryolarına göre merkezi medikal gaz ve vakum çözümleri sunar.	Ürün Haberleri	/assets/images/product-medical-gas.png	hastane-medikal-gaz-sistemi-nasil-calisir	t	2026-08-18 11:19:38.914748+00	2026-08-18 11:19:38.914748+00	2026-08-18 11:19:38.914748+00	Hastane Medikal Gaz Sistemi Nasıl Çalışır?	Hastane medikal gaz sistemi nasıl çalışır? Merkezi kaynak, boru hattı, terminal üniteler, zon vanaları ve alarm sistemini öğrenin.
9	Medikal Gaz Tesisatı Projelendirme ve Kurulum Rehberi	Medikal gaz tesisatı nasıl projelendirilir? Kaynak kapasitesi, boru çapı, zonalama, malzeme seçimi, testler ve devreye alma adımlarını inceleyin.	Medikal gaz tesisatı projelendirme; hastane, klinik, ameliyathane ve diğer sağlık tesislerinde gazların güvenli ve kesintisiz kullanılabilmesi için yapılan kapsamlı mühendislik çalışmasıdır. Başarılı bir proje yalnızca boru güzergâhını değil, gaz kaynağını, kapasiteyi, yedekliliği, alarm senaryolarını ve bakım erişimini birlikte ele alır.\n\nMedikal gaz projesinde hangi bilgiler gerekir?\n\nİlk aşamada tesisin mimari planları, yatak ve terminal ünite sayıları, ameliyathane ve yoğun bakım gibi kritik alanlar, cihaz listeleri, beklenen debiler, çalışma basınçları ve gelecekteki büyüme ihtiyacı belirlenir. Oksijen, medikal hava, merkezi vakum, azot protoksit ve diğer gazların her biri için kullanım senaryosu ayrı değerlendirilir.\n\nKaynak kapasitesi, eş zamanlı kullanım, pik tüketim, yedekleme ve genişleme payı dikkate alınarak hesaplanır. Boru çapları ise gerekli debi, hat uzunluğu, basınç kaybı ve terminal ünite sayısına göre seçilir. Gereğinden küçük hatlar basınç düşüşüne, gereğinden büyük hatlar ise gereksiz maliyete yol açabilir.\n\nHastane medikal gaz tesisatında katlar ve kritik bölümler zonlara ayrılır. Bölge vana kutuları, ilgili alanın gerektiğinde güvenli şekilde izole edilmesini sağlar. Hatlar ve vanalar gaz türü, akış yönü ve bölüm bilgisiyle açık biçimde etiketlenir. Terminal üniteleri ve bağlantılar yanlış gaz kullanımını önleyecek şekilde farklılaştırılır.\n\nKurulum sonrası kaçak, basınç, debi, alarm ve gaz kimliklendirme testleri gerçekleştirilir. Sonuçlar kayıt altına alınır; as-built proje, vana listesi, test raporları ve bakım bilgileri tesis yetkililerine teslim edilir. Tasarım ve uygulamada TS EN ISO 7396-1 gibi ilgili standartlar, ulusal mevzuat ve sağlık tesisinin teknik şartnamesi dikkate alınır.\n\nOxymed Medikal, medikal gaz tesisatı için proje ihtiyaçlarına göre kaynak, boru hattı, alarm, terminal ve merkezi vakum çözümleri sunar.	Ürün Haberleri	/assets/images/product-medical-gas.png	medikal-gaz-tesisati-projelendirme-kurulum-rehberi	t	2026-08-18 11:19:39.098604+00	2026-08-18 11:19:39.098604+00	2026-08-18 11:19:39.098604+00	Medikal Gaz Tesisatı Projelendirme Rehberi	Medikal gaz tesisatı projelendirme ve kurulum rehberi: kapasite hesabı, boru seçimi, zonalama, testler, alarm ve devreye alma.
10	Merkezi Medikal Vakum Sistemi Nedir?	Merkezi medikal vakum sisteminin çalışma prensibini, hastanelerdeki kullanım alanlarını, pompa seçimini, filtrelemeyi ve bakım gerekliliklerini öğrenin.	Merkezi medikal vakum sistemi; hastanelerde, ameliyathanelerde, yoğun bakım ünitelerinde, acil servislerde ve kliniklerde aspirasyon ihtiyacını karşılayan merkezi bir vakum altyapısıdır. Tek tek cihazlar yerine vakum pompaları, kontrol sistemi, tank, filtreler ve boru hattı birlikte çalışır; kullanım noktalarındaki vakum terminal ünitelerinden alınır.\n\nMerkezi medikal vakum sistemi nasıl çalışır?\n\nVakum pompa grubu, boru hattındaki havayı çekerek negatif basınç oluşturur. Kontrol panosu, kullanım ihtiyacına göre pompaları sırayla devreye alır ve sistem seviyesini dengeler. Vakum tankı ani tüketim değişikliklerinde tampon görevi görür. Bakteri filtreleri ve uygun hijyen ekipmanları, emiş hattının güvenli işletilmesine destek olur.\n\nCerrahi aspirasyon, hasta yatağı aspirasyonu, yoğun bakım, acil servis, doğumhane, endoskopi ve bazı laboratuvar uygulamaları merkezi vakumun yaygın kullanım alanlarıdır. Tasarım yapılırken yalnızca terminal sayısı değil; aynı anda kullanım, aspirasyon debisi, vakum seviyesi, hat uzunluğu ve kritik alanların süreklilik ihtiyacı da hesaplanır.\n\nMedikal vakum sistemi, sağlık hizmetinde kullanılacağı için hijyen, yağsız çalışma, yedeklilik, filtreleme, alarm ve izlenebilir bakım kriterleriyle ele alınır. Endüstriyel bir vakum pompasının sağlık tesisine doğrudan uygulanması, projenin klinik ve teknik gerekliliklerini karşılamayabilir.\n\nPompa kapasitesi, yedekleme senaryosu, tank hacmi, filtre yerleşimi, boru çapı ve terminal üniteler proje verilerine göre belirlenir. Devreye alma öncesinde kaçak, vakum seviyesi, debi, alarm, otomatik devreye girme ve yedek pompa testleri yapılır. Oxymed Medikal, sağlık tesisleri için merkezi medikal vakum pompaları, kontrol ve alarm çözümleri, filtreleme ekipmanları ve terminal altyapıları sunar.	Ürün Haberleri	/assets/images/product-medical-gas.png	merkezi-medikal-vakum-sistemi-nedir	t	2026-08-18 11:19:39.269615+00	2026-08-18 11:19:39.269615+00	2026-08-18 11:19:39.269615+00	Merkezi Medikal Vakum Sistemi Nedir?	Merkezi medikal vakum sistemi nedir, nasıl çalışır ve nerede kullanılır? Hastane vakum pompaları, filtreler, tank ve bakım rehberi.
11	Medikal Gaz Sistemlerinde Bakım, Test ve Alarm Yönetimi	Medikal gaz sistemlerinde güvenli işletme için bakım planı, kaçak ve basınç testleri, alarm kontrolü, filtre değişimi ve kayıt yönetimini öğrenin.	Medikal gaz sistemlerinde bakım ve test yönetimi, sağlık hizmetinin sürekliliği ve hasta güvenliği için kurulum kadar önemlidir. Oksijen, medikal hava, merkezi vakum ve diğer gaz hatları; kaynak ekipmanları, boru tesisatı, vanalar, terminal üniteler ve alarm sistemleriyle birlikte düzenli olarak kontrol edilmelidir.\n\nBakım planında kaynak ünitelerinin genel durumu, kompresör ve vakum pompası performansı, basınç göstergeleri, alarm panoları, bölge vana kutuları, terminal bağlantıları ve hat etiketleri incelenir. Kritik alanlar için kontrol sıklığı tesisin kullanım senaryosuna ve üretici önerilerine göre belirlenir.\n\nKaçaklar yalnızca gaz kaybına değil, basınç düşüşüne ve klinik ekipmanların beklenen performansı gösterememesine neden olabilir. Test prosedürleri proje ve ilgili standartlara göre hazırlanmalı; sonuçlar ölçüm tarihi, test noktası, kullanılan cihaz ve yetkili personel bilgisiyle kayıt altına alınmalıdır.\n\nAna hat, kaynak ve bölge alarm panoları; basınç veya vakum seviyesindeki kritik değişiklikleri erken bildirir. Alarm noktaları, eşik değerler, güç yedekliliği, haberleşme ve yetkili personele bildirim senaryoları düzenli olarak test edilmelidir.\n\nMerkezi vakumda bakteri filtreleri ve emiş ekipmanları üretici tavsiyesine göre kontrol edilmelidir. Terminal ünitelerde fiziksel hasar, sızdırmazlık, gaz kimliği ve bağlantı uygunluğu incelenir. Her bakım, test, arıza ve müdahale izlenebilir biçimde kaydedilmeli; sistem devreye alındıktan sonra basınç ve alarm değerleri yeniden doğrulanmalıdır.\n\nOxymed Medikal, merkezi medikal gaz ve vakum sistemleri için proje sonrası teknik servis ve bakım yaklaşımı sunar.	Ürün Haberleri	/assets/images/product-medical-gas.png	medikal-gaz-sistemlerinde-bakim-test-alarm-yonetimi	t	2026-08-18 11:19:39.421734+00	2026-08-18 11:19:39.421734+00	2026-08-18 11:19:39.421734+00	Medikal Gaz Sistemlerinde Bakım ve Test Rehberi	Medikal gaz sistemi bakım ve test rehberi: kaçak, basınç, alarm, filtre, pompa, vana ve terminal kontrolleri nasıl yapılır?
\.


--
-- Data for Name: news_translations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.news_translations (id, news_id, locale, title, excerpt, content, category, slug, published, published_at, seo_title, seo_description, created_at, updated_at) FROM stdin;
1	1	en	What Are Medical Gas Systems?	Discover how medical gas systems safely deliver oxygen, medical air, vacuum and other gases in hospitals, and learn about their components, standards and maintenance needs.	A medical gas system is the engineering infrastructure that delivers the gases required by hospitals, operating rooms, intensive care units, clinics and other healthcare facilities from a central source to points of use in a safe, continuous and controlled way. Oxygen, medical air, medical vacuum, nitrous oxide, carbon dioxide and anaesthetic gas scavenging systems are among the most common applications.\n\nKey components of a medical gas system\n\n1. Central supply: An oxygen tank or manifold, medical air compressors, vacuum pumps and other gas sources form the starting point of the system. Capacity, redundancy and automatic changeover scenarios are designed around the healthcare facility's critical needs.\n\n2. Pipeline distribution: Gases are transported to floors and departments through copper pipelines selected for the required quality and dimensions. Pipe sizes, pressure loss, zoning, accessibility and future capacity requirements should all be considered during design.\n\n3. Terminal units: Gas outlets and vacuum connections installed in wall, ceiling or pendant units allow clinical staff to use the services safely. Each gas type must have its own identification and connection standard to prevent cross-connection.\n\n4. Alarm and monitoring: Source pressure, line pressure and vacuum levels are continuously monitored. Master and area alarms alert staff when critical values are reached and support uninterrupted patient care.\n\nCommon medical gases\n\nOxygen is used for respiratory support and anaesthesia. Medical air provides clean, controlled air for ventilators, anaesthesia machines and pneumatic medical equipment. Central vacuum supports suction, surgery and patient care. Nitrous oxide and carbon dioxide require application-specific infrastructure, storage and safety controls.\n\nStandards, design and safe installation\n\nA reliable medical gas installation involves much more than laying pipes. The design should address gas types, flow and pressure requirements, critical areas, reserve supplies, alarm scenarios and maintenance access together. ISO 7396-1 and applicable local regulations are commonly considered for medical gas pipeline systems. Pipeline cleanliness, approved joining methods, identification, leak testing, pressure testing, gas verification and commissioning are essential before handover.\n\nWhy is maintenance important?\n\nPlanned maintenance helps detect pressure fluctuations, leaks, alarm faults and equipment performance losses at an early stage. Supply equipment, vacuum pumps, compressors, alarm panels, isolation valves and terminal units should be included in a documented maintenance programme. Test results and interventions should be recorded, with special attention to service continuity in critical areas.\n\nOxymed Medikal provides project-based medical gas systems, vacuum infrastructure, alarm solutions and equipment integration for hospitals and healthcare facilities. With correct capacity planning, safe installation and a sustainable service approach, you can create a reliable medical gas infrastructure for your facility.	Product News	what-are-medical-gas-systems	t	\N	What Are Medical Gas Systems? | Oxymed	Learn how hospital medical gas systems distribute oxygen, medical air and vacuum safely, including key components, standards, installation and maintenance.	2026-08-13 07:46:21.487418+00	2026-08-18 11:12:26.40245+00
8	1	de	Was sind medizinische Gasversorgungssysteme?	Erfahren Sie, wie medizinische Gassysteme Sauerstoff, medizinische Druckluft, Vakuum und weitere Gase sicher im Krankenhaus verteilen – einschließlich Komponenten, Normen und Wartung.	Ein medizinisches Gasversorgungssystem ist die technische Infrastruktur, mit der die in Krankenhäusern, Operationssälen, Intensivstationen, Kliniken und anderen Gesundheitseinrichtungen benötigten Gase sicher, kontinuierlich und kontrolliert von einer zentralen Quelle zu den Entnahmestellen geleitet werden. Sauerstoff, medizinische Druckluft, Vakuum, Lachgas, Kohlendioxid und Systeme zur Absaugung von Anästhesiegasen gehören zu den häufigsten Anwendungen.\n\nDie wichtigsten Bestandteile\n\n1. Zentrale Versorgung: Sauerstofftank oder Flaschenbatterie, Kompressoren für medizinische Druckluft, Vakuumpumpen und weitere Gasquellen bilden den Ausgangspunkt. Kapazität, Redundanz und automatische Umschaltung werden nach den kritischen Anforderungen der Einrichtung ausgelegt.\n\n2. Rohrleitungsnetz: Die Gase werden über geeignete Kupferrohrleitungen in die jeweiligen Etagen und Bereiche transportiert. Rohrdurchmesser, Druckverlust, Zonierung, Zugänglichkeit und zukünftige Kapazitätsreserven müssen bereits in der Planung berücksichtigt werden.\n\n3. Entnahmestellen: Gasentnahmestellen und Vakuumanschlüsse in Wand-, Decken- oder Versorgungseinheiten ermöglichen eine sichere Nutzung durch das medizinische Personal. Jede Gasart benötigt eine eindeutige Kennzeichnung und einen passenden Anschlussstandard, damit Verwechslungen vermieden werden.\n\n4. Alarmierung und Überwachung: Quellendruck, Leitungsdruck und Vakuumniveau werden überwacht. Haupt- und Bereichsalarmtafeln informieren das Personal bei kritischen Werten und unterstützen die Versorgungssicherheit.\n\nPlanung nach Normen und sichere Inbetriebnahme\n\nEine zuverlässige medizinische Gasinstallation besteht nicht nur aus verlegten Rohren. Gasarten, Durchfluss- und Druckbedarf, kritische Bereiche, Reserveversorgung, Alarmszenarien und Wartungszugänge müssen gemeinsam betrachtet werden. Für medizinische Rohrleitungssysteme werden unter anderem ISO 7396-1 sowie die jeweils geltenden nationalen Vorschriften und Betreiberanforderungen berücksichtigt. Rohrreinigung, geeignete Fügeverfahren, Kennzeichnung, Dichtheits- und Druckprüfungen, Gasidentifikation und Inbetriebnahme sind vor der Übergabe unverzichtbar.\n\nWarum ist Wartung wichtig?\n\nEine planmäßige Wartung hilft, Druckschwankungen, Leckagen, Alarmfehler und Leistungsabfälle frühzeitig zu erkennen. Versorgungsanlagen, Vakuumpumpen, Kompressoren, Alarmtafeln, Absperrventile und Entnahmestellen sollten in einem dokumentierten Wartungsplan enthalten sein. Prüfergebnisse und Eingriffe müssen nachvollziehbar aufgezeichnet werden.\n\nOxymed Medikal entwickelt und integriert medizinische Gasversorgungssysteme, Vakuuminfrastrukturen und Alarmlösungen für Krankenhäuser und Gesundheitseinrichtungen – bedarfsgerecht geplant, sicher installiert und auf einen nachhaltigen Service ausgelegt.	Produktneuheiten	was-sind-medizinische-gasversorgungssysteme	t	\N	Medizinische Gassysteme erklärt | Oxymed Medikal	Medizinische Gassysteme im Krankenhaus: Verteilung von Sauerstoff, Druckluft und Vakuum, wichtige Komponenten, Planung, Normen und Wartung.	2026-08-18 11:12:26.580118+00	2026-08-18 11:12:26.580118+00
9	1	fr	Qu’est-ce qu’un système de gaz médicaux ?	Découvrez comment les réseaux de gaz médicaux distribuent en toute sécurité l’oxygène, l’air médical, le vide et d’autres gaz dans les établissements de santé.	Un système de gaz médicaux est l’infrastructure technique qui distribue, depuis une source centrale vers les points d’utilisation, les gaz nécessaires aux hôpitaux, blocs opératoires, services de soins intensifs, cliniques et autres établissements de santé. Il assure une distribution sûre, continue et maîtrisée de l’oxygène, de l’air médical, du vide médical, du protoxyde d’azote, du dioxyde de carbone et des gaz anesthésiques à évacuer.\n\nLes principaux composants\n\n1. La source centrale : réservoir ou centrale d’oxygène, cadres de bouteilles, compresseurs d’air médical, pompes à vide et autres sources de gaz. La capacité, la redondance et les scénarios de basculement automatique sont définis selon les besoins critiques de l’établissement.\n\n2. Le réseau de canalisations : les gaz sont transportés vers les étages et les services par des canalisations en cuivre adaptées. Le diamètre, les pertes de charge, le zonage, l’accessibilité et les besoins futurs doivent être pris en compte dès la conception.\n\n3. Les prises terminales : installées au mur, au plafond ou sur des bras plafonniers, elles permettent au personnel soignant d’utiliser chaque gaz en toute sécurité. Chaque gaz doit disposer d’une identification et d’un raccordement propres afin d’éviter les erreurs de connexion.\n\n4. Les alarmes et la supervision : la pression à la source, la pression du réseau et le niveau de vide sont surveillés. Les alarmes générales et locales avertissent le personnel lorsque les valeurs deviennent critiques.\n\nConception, normes et mise en service\n\nLa fiabilité d’un réseau de gaz médicaux ne dépend pas uniquement de la pose des tubes. Le projet doit associer les types de gaz, les débits et pressions nécessaires, les zones critiques, les réserves, les scénarios d’alarme et l’accès pour la maintenance. La norme ISO 7396-1, ainsi que les réglementations locales applicables, sont généralement prises en compte. La propreté des canalisations, les méthodes d’assemblage, le repérage, les essais d’étanchéité et de pression, la vérification des gaz et la mise en service sont des étapes essentielles.\n\nPourquoi la maintenance est-elle indispensable ?\n\nLa maintenance préventive permet de détecter rapidement les fuites, les variations de pression, les défauts d’alarme et les baisses de performance. Les centrales, pompes à vide, compresseurs, tableaux d’alarme, vannes d’isolement et prises terminales doivent faire partie d’un programme documenté.\n\nOxymed Medikal accompagne les hôpitaux et établissements de santé avec des solutions de gaz médicaux, de vide centralisé, d’alarme et d’intégration d’équipements conçues selon les besoins du projet.	Actualités produits	quest-ce-quun-systeme-de-gaz-medicaux	t	\N	Systèmes de gaz médicaux : guide complet | Oxymed	Guide des réseaux de gaz médicaux à l’hôpital : oxygène, air médical, vide, composants, normes, installation, alarmes et maintenance.	2026-08-18 11:12:26.775696+00	2026-08-18 11:12:26.775696+00
10	1	it	Cosa sono i sistemi di gas medicali?	Scopri come i sistemi di gas medicali distribuiscono in sicurezza ossigeno, aria medicale, vuoto e altri gas negli ospedali e nelle strutture sanitarie.	Un sistema di gas medicali è l’infrastruttura tecnica che porta in modo sicuro, continuo e controllato i gas necessari dagli impianti centralizzati ai punti di utilizzo di ospedali, sale operatorie, terapie intensive, cliniche e altre strutture sanitarie. Ossigeno, aria medicale, vuoto medicale, protossido di azoto, anidride carbonica e sistemi di evacuazione dei gas anestetici sono tra le applicazioni più comuni.\n\nI componenti principali\n\n1. Centrale di alimentazione: serbatoi o gruppi di ossigeno, rampe di bombole, compressori per aria medicale, pompe per vuoto e altre sorgenti costituiscono il punto di partenza. Capacità, ridondanza e commutazione automatica vengono definite in base alle esigenze critiche della struttura.\n\n2. Rete di distribuzione: i gas raggiungono piani e reparti attraverso tubazioni in rame idonee. Diametri, perdite di carico, suddivisione in zone, accessibilità e riserve per future espansioni devono essere valutati già in fase di progetto.\n\n3. Unità terminali: prese gas e connessioni per il vuoto, installate a parete, a soffitto o su pensili, permettono al personale sanitario di utilizzare i servizi in sicurezza. Ogni gas deve avere identificazione e connessione dedicate per prevenire collegamenti errati.\n\n4. Allarmi e monitoraggio: pressione della centrale, pressione di linea e livello del vuoto vengono controllati. Gli allarmi principali e di area avvisano il personale quando i valori raggiungono livelli critici.\n\nProgettazione, norme e collaudo\n\nUn impianto affidabile non consiste soltanto nella posa delle tubazioni. Il progetto deve integrare tipologie di gas, portate e pressioni, aree critiche, riserve, scenari di allarme e accesso per la manutenzione. Per le reti di tubazioni dei gas medicali si considerano normalmente la ISO 7396-1 e le disposizioni locali applicabili. Pulizia delle tubazioni, metodi di giunzione, identificazione, prove di tenuta e pressione, verifica del gas e messa in servizio sono passaggi fondamentali.\n\nPerché la manutenzione è importante?\n\nLa manutenzione programmata aiuta a rilevare tempestivamente perdite, oscillazioni di pressione, guasti agli allarmi e cali di prestazione. Centrali, pompe per vuoto, compressori, pannelli di allarme, valvole di intercettazione e unità terminali devono essere inclusi in un programma documentato.\n\nOxymed Medikal offre sistemi di gas medicali, infrastrutture per il vuoto, soluzioni di allarme e integrazione di apparecchiature per ospedali e strutture sanitarie, progettati in base alle esigenze del progetto.	Novità prodotto	cosa-sono-i-sistemi-di-gas-medicali	t	\N	Sistemi di gas medicali: guida | Oxymed Medikal	Guida ai sistemi di gas medicali ospedalieri: ossigeno, aria medicale, vuoto, componenti, norme, installazione, allarmi e manutenzione.	2026-08-18 11:12:26.95342+00	2026-08-18 11:12:26.95342+00
11	1	ar	ما هي أنظمة الغازات الطبية؟	تعرّف على كيفية توزيع الأكسجين والهواء الطبي والفراغ والغازات الأخرى بأمان داخل المستشفيات والمنشآت الصحية، وأهم المكونات والمعايير ومتطلبات الصيانة.	نظام الغازات الطبية هو البنية الهندسية التي تنقل الغازات اللازمة من مصدر مركزي إلى نقاط الاستخدام في المستشفيات وغرف العمليات ووحدات العناية المركزة والعيادات والمنشآت الصحية بطريقة آمنة ومستمرّة ومنضبطة. وتشمل التطبيقات الأكثر شيوعاً الأكسجين والهواء الطبي والفراغ الطبي وأكسيد النيتروز وثاني أكسيد الكربون وأنظمة شفط غازات التخدير.\n\nالمكونات الأساسية لنظام الغازات الطبية\n\n1. مصدر التغذية المركزي: يضم خزان الأكسجين أو منظومة مجمع الأسطوانات، وضواغط الهواء الطبي، ومضخات الفراغ ومصادر الغازات الأخرى. ويتم تحديد السعة والاحتياط والتبديل التلقائي وفق الاحتياجات الحرجة للمنشأة الصحية.\n\n2. شبكة الأنابيب: تُنقل الغازات إلى الطوابق والأقسام عبر أنابيب نحاسية مناسبة. ويجب دراسة الأقطار وفقد الضغط وتقسيم المناطق وإمكانية الوصول واحتياجات التوسعة المستقبلية أثناء التصميم.\n\n3. وحدات الاستخدام النهائية: تتيح مخارج الغازات ووصلات الفراغ المثبتة على الجدران أو الأسقف أو وحدات التعليق استخدام الخدمات بأمان. ويجب أن تكون لكل غاز هوية ووصلة مخصصة لمنع التوصيل الخاطئ.\n\n4. الإنذار والمراقبة: تتم مراقبة ضغط المصدر وضغط الخط ومستوى الفراغ بشكل مستمر. وتعمل لوحات الإنذار الرئيسية والمحلية على تنبيه الطاقم عند الوصول إلى مستويات حرجة.\n\nالتصميم والتركيب وفق المعايير\n\nلا تقتصر موثوقية شبكة الغازات الطبية على تمديد الأنابيب. يجب أن يجمع التصميم بين أنواع الغازات ومعدلات التدفق والضغط والمناطق الحرجة ومصادر الاحتياط وسيناريوهات الإنذار وسهولة الصيانة. ويُراعى معيار ISO 7396-1 والمعايير واللوائح المحلية المعمول بها في أنظمة أنابيب الغازات الطبية. كما تُعد نظافة الأنابيب وطرق الوصل المناسبة ووضع الملصقات واختبارات التسرب والضغط والتحقق من هوية الغاز والتشغيل التجريبي خطوات أساسية قبل التسليم.\n\nأهمية الصيانة الدورية\n\nتساعد الصيانة المخططة على اكتشاف تسربات الغاز وتذبذب الضغط وأعطال الإنذار وانخفاض أداء المعدات في وقت مبكر. ويجب إدراج مصادر التغذية ومضخات الفراغ والضواغط ولوحات الإنذار وصمامات العزل ووحدات الاستخدام في برنامج صيانة موثق، مع تسجيل نتائج الاختبارات والإجراءات المنفذة.\n\nتقدم Oxymed Medikal حلول أنظمة الغازات الطبية والفراغ المركزي والإنذار ودمج المعدات للمستشفيات والمنشآت الصحية وفق احتياجات كل مشروع، مع التركيز على التخطيط الآمن وسهولة الخدمة واستمرارية التشغيل.	أخبار المنتجات	ما-هي-أنظمة-الغازات-الطبية	t	\N	أنظمة الغازات الطبية في المستشفيات | Oxymed	دليل أنظمة الغازات الطبية: توزيع الأكسجين والهواء الطبي والفراغ، المكونات الأساسية، المعايير، التركيب، الإنذارات والصيانة.	2026-08-18 11:12:27.163006+00	2026-08-18 11:12:27.163006+00
12	1	ru	Что такое системы медицинских газов?	Узнайте, как системы медицинских газов безопасно распределяют кислород, медицинский воздух, вакуум и другие газы в больницах и медицинских учреждениях.	Система медицинских газов — это инженерная инфраструктура, которая безопасно, непрерывно и контролируемо подаёт газы от центрального источника к точкам потребления в больницах, операционных, отделениях интенсивной терапии, клиниках и других медицинских учреждениях. Наиболее распространённые системы предназначены для кислорода, медицинского воздуха, медицинского вакуума, закиси азота, углекислого газа и удаления анестезиологических газов.\n\nОсновные компоненты системы\n\n1. Центральный источник: кислородный резервуар или рампа баллонов, компрессоры медицинского воздуха, вакуумные насосы и другие источники газа. Производительность, резервирование и автоматическое переключение рассчитываются с учётом критических потребностей учреждения.\n\n2. Трубопроводная сеть: газы подаются на этажи и в отделения по подходящим медным трубопроводам. При проектировании учитываются диаметр труб, потери давления, зонирование, доступ для обслуживания и будущая потребность в мощности.\n\n3. Терминальные устройства: газовые розетки и вакуумные соединения в настенных, потолочных или подвесных блоках позволяют медицинскому персоналу безопасно пользоваться системой. Для каждого газа необходимы отдельная идентификация и соответствующий тип соединения, исключающие ошибочное подключение.\n\n4. Сигнализация и мониторинг: давление источника, давление в линии и уровень вакуума контролируются постоянно. Главные и зональные панели сигнализации предупреждают персонал при достижении критических значений.\n\nПроектирование и безопасный ввод в эксплуатацию\n\nНадёжность медицинской газовой сети определяется не только монтажом труб. В проекте совместно рассматриваются виды газов, расход и давление, критические зоны, резервные источники, сценарии аварийной сигнализации и доступ для технического обслуживания. Для трубопроводных систем медицинских газов учитываются ISO 7396-1 и применимые национальные требования. Очистка труб, правильные методы соединения, маркировка, испытания на герметичность и давление, проверка газа и пусконаладка являются обязательными этапами.\n\nЗачем нужно регулярное обслуживание?\n\nПлановое обслуживание помогает заранее выявлять утечки, колебания давления, неисправности сигнализации и снижение эффективности оборудования. Источники питания, вакуумные насосы, компрессоры, панели сигнализации, запорные клапаны и терминальные устройства должны входить в документированную программу обслуживания.\n\nOxymed Medikal предлагает больницам и медицинским учреждениям системы медицинских газов, центрального вакуума, сигнализации и интеграции оборудования с учётом особенностей каждого проекта.	Новости продукции	chto-takoe-sistemy-medicinskih-gazov	t	\N	Системы медицинских газов в больницах | Oxymed	Системы медицинских газов: распределение кислорода, воздуха и вакуума, основные компоненты, стандарты, монтаж, сигнализация и обслуживание.	2026-08-18 11:12:27.417371+00	2026-08-18 11:12:27.417371+00
13	1	fa	سیستم‌های گازهای پزشکی چیستند؟	با نحوه توزیع ایمن اکسیژن، هوای پزشکی، خلأ و سایر گازها در بیمارستان‌ها و مراکز درمانی و همچنین اجزا، استانداردها و نیازهای نگهداری آن‌ها آشنا شوید.	سیستم گازهای پزشکی زیرساخت مهندسی است که گازهای موردنیاز بیمارستان‌ها، اتاق‌های عمل، بخش‌های مراقبت ویژه، کلینیک‌ها و سایر مراکز درمانی را از یک منبع مرکزی به نقاط مصرف، به‌صورت ایمن، پیوسته و کنترل‌شده منتقل می‌کند. اکسیژن، هوای پزشکی، خلأ پزشکی، نیتروس اکساید، دی‌اکسیدکربن و سیستم تخلیه گازهای بیهوشی از رایج‌ترین کاربردهای این زیرساخت هستند.\n\nاجزای اصلی سیستم گاز پزشکی\n\n1. منبع مرکزی: مخزن اکسیژن یا منیفولد کپسول‌ها، کمپرسورهای هوای پزشکی، پمپ‌های خلأ و سایر منابع گاز، نقطه شروع سیستم را تشکیل می‌دهند. ظرفیت، پشتیبان‌پذیری و سناریوی تعویض خودکار بر اساس نیازهای حیاتی مرکز درمانی طراحی می‌شود.\n\n2. شبکه لوله‌کشی: گازها از طریق لوله‌های مسی مناسب به طبقات و بخش‌های مختلف منتقل می‌شوند. قطر لوله، افت فشار، تقسیم‌بندی مناطق، دسترسی برای سرویس و ظرفیت توسعه آینده باید در مرحله طراحی بررسی شود.\n\n3. واحدهای ترمینال: خروجی‌های گاز و اتصالات خلأ که روی دیوار، سقف یا یونیت‌های سقفی نصب می‌شوند، امکان استفاده ایمن کارکنان درمانی را فراهم می‌کنند. هر گاز باید شناسایی و اتصال اختصاصی داشته باشد تا از اتصال اشتباه جلوگیری شود.\n\n4. سیستم هشدار و پایش: فشار منبع، فشار خط و سطح خلأ به‌طور مداوم پایش می‌شود. تابلوهای هشدار اصلی و منطقه‌ای در صورت رسیدن مقادیر به محدوده بحرانی، کارکنان را مطلع می‌کنند.\n\nطراحی، استانداردها و راه‌اندازی ایمن\n\nقابلیت اطمینان شبکه گازهای پزشکی فقط به اجرای لوله‌کشی محدود نمی‌شود. نوع گاز، دبی و فشار موردنیاز، مناطق حیاتی، منابع پشتیبان، سناریوهای هشدار و دسترسی برای نگهداری باید در کنار هم طراحی شوند. در سیستم‌های لوله‌کشی گاز پزشکی، استاندارد ISO 7396-1 و الزامات محلی قابل اجرا مورد توجه قرار می‌گیرد. تمیزی لوله‌ها، روش اتصال مناسب، نشانه‌گذاری، آزمون نشتی و فشار، تأیید نوع گاز و راه‌اندازی آزمایشی از مراحل مهم پیش از تحویل هستند.\n\nچرا نگهداری منظم اهمیت دارد؟\n\nنگهداری برنامه‌ریزی‌شده به شناسایی زودهنگام نشتی، نوسان فشار، خرابی هشدار و کاهش عملکرد تجهیزات کمک می‌کند. منابع تغذیه، پمپ‌های خلأ، کمپرسورها، تابلوهای هشدار، شیرهای قطع و واحدهای ترمینال باید در برنامه نگهداری مستند قرار گیرند.\n\nOxymed Medikal برای بیمارستان‌ها و مراکز درمانی، سیستم‌های گاز پزشکی، زیرساخت خلأ مرکزی، راهکارهای هشدار و یکپارچه‌سازی تجهیزات را بر اساس نیاز هر پروژه ارائه می‌کند.	اخبار محصولات	سیستم-های-گازهای-پزشکی-چیستند	t	\N	سیستم‌های گاز پزشکی در بیمارستان | Oxymed	راهنمای سیستم گاز پزشکی بیمارستان: توزیع اکسیژن، هوای پزشکی و خلأ، اجزای اصلی، استانداردها، نصب، هشدار و نگهداری.	2026-08-18 11:12:27.639878+00	2026-08-18 11:12:27.639878+00
14	1	ka	რა არის სამედიცინო აირების სისტემები?	გაიგეთ, როგორ ანაწილებს სამედიცინო აირების სისტემა ჟანგბადს, სამედიცინო ჰაერს, ვაკუუმსა და სხვა აირებს საავადმყოფოებში უსაფრთხოდ.	სამედიცინო აირების სისტემა არის საინჟინრო ინფრასტრუქტურა, რომელიც საავადმყოფოებში, საოპერაციოებში, ინტენსიური თერაპიის განყოფილებებში, კლინიკებსა და სხვა სამედიცინო დაწესებულებებში საჭირო აირებს ცენტრალური წყაროდან გამოყენების წერტილებამდე უსაფრთხოდ, უწყვეტად და კონტროლირებულად აწვდის. ყველაზე გავრცელებული სისტემებია ჟანგბადის, სამედიცინო ჰაერის, სამედიცინო ვაკუუმის, აზოტის ქვეჟანგის, ნახშირორჟანგისა და ანესთეზიური აირების გამწოვი სისტემები.\n\nსისტემის ძირითადი კომპონენტები\n\n1. ცენტრალური წყარო: ჟანგბადის რეზერვუარი ან ბალონების მანიფოლდი, სამედიცინო ჰაერის კომპრესორები, ვაკუუმის ტუმბოები და სხვა წყაროები სისტემის საწყის ნაწილს ქმნის. სიმძლავრე, რეზერვირება და ავტომატური გადართვა დაწესებულების კრიტიკული საჭიროებების მიხედვით იგეგმება.\n\n2. მილსადენის ქსელი: აირები შესაბამისი ხარისხისა და ზომის სპილენძის მილებით მიეწოდება სართულებსა და განყოფილებებს. პროექტირებისას გათვალისწინებული უნდა იყოს მილის დიამეტრი, წნევის დანაკარგი, ზონირება, მომსახურებაზე წვდომა და მომავალი გაფართოების საჭიროება.\n\n3. ტერმინალური ერთეულები: კედლის, ჭერის ან საკიდი ერთეულების აირის გამოსასვლელები და ვაკუუმის შეერთებები სამედიცინო პერსონალს სისტემის უსაფრთხოდ გამოყენების საშუალებას აძლევს. თითოეულ აირს უნდა ჰქონდეს ცალკე იდენტიფიკაცია და შეერთების სტანდარტი, რათა არასწორი მიერთება გამოირიცხოს.\n\n4. განგაში და მონიტორინგი: წყაროს წნევა, ხაზის წნევა და ვაკუუმის დონე მუდმივად კონტროლდება. მთავარი და ზონური განგაშის პანელები პერსონალს კრიტიკული მნიშვნელობების მიღწევისას აფრთხილებს.\n\nსტანდარტების შესაბამისი პროექტირება და გაშვება\n\nსანდო სამედიცინო აირების ქსელი მხოლოდ მილების გაყვანას არ ნიშნავს. პროექტმა ერთად უნდა გაითვალისწინოს აირების ტიპები, დებიტი და წნევა, კრიტიკული ზონები, სარეზერვო წყაროები, განგაშის სცენარები და ტექნიკური მომსახურების წვდომა. სამედიცინო აირების მილსადენებისთვის ჩვეულებრივ განიხილება ISO 7396-1 და შესაბამისი ადგილობრივი მოთხოვნები. მილების სისუფთავე, სწორი შეერთების მეთოდები, მარკირება, გაჟონვისა და წნევის ტესტები, აირის იდენტიფიკაცია და გაშვება გადაცემამდე აუცილებელი ეტაპებია.\n\nრატომ არის მოვლა მნიშვნელოვანი?\n\nგეგმური მოვლა ხელს უწყობს გაჟონვის, წნევის ცვალებადობის, განგაშის გაუმართაობისა და მოწყობილობის ეფექტურობის შემცირების ადრეულ გამოვლენას. წყაროები, ვაკუუმის ტუმბოები, კომპრესორები, განგაშის პანელები, ჩამკეტი სარქველები და ტერმინალური ერთეულები დოკუმენტირებულ მოვლის პროგრამაში უნდა შედიოდეს.\n\nOxymed Medikal საავადმყოფოებსა და სამედიცინო დაწესებულებებს სთავაზობს სამედიცინო აირების, ცენტრალური ვაკუუმის, განგაშისა და მოწყობილობების ინტეგრაციის გადაწყვეტილებებს, რომლებიც თითოეული პროექტის საჭიროებებზეა მორგებული.	პროდუქტის სიახლეები	ra-aris-samedicino-airebis-sistemebi	t	\N	სამედიცინო აირების სისტემები საავადმყოფოებში | Oxymed	სამედიცინო აირების სისტემების გზამკვლევი: ჟანგბადი, სამედიცინო ჰაერი და ვაკუუმი, კომპონენტები, სტანდარტები, მონტაჟი და მოვლა.	2026-08-18 11:12:27.83008+00	2026-08-18 11:12:27.83008+00
15	1	bg	Какво представляват системите за медицински газове?	Научете как системите за медицински газове безопасно разпределят кислород, медицински въздух, вакуум и други газове в болници и лечебни заведения.	Системата за медицински газове е инженерна инфраструктура, която доставя необходимите газове от централен източник до точките на потребление в болници, операционни зали, интензивни отделения, клиники и други лечебни заведения по безопасен, непрекъснат и контролиран начин. Най-често се използват системи за кислород, медицински въздух, медицински вакуум, диазотен оксид, въглероден диоксид и отвеждане на анестезиологични газове.\n\nОсновни компоненти\n\n1. Централно захранване: кислороден резервоар или рампа от бутилки, компресори за медицински въздух, вакуумни помпи и други източници. Капацитетът, резервирането и автоматичното превключване се проектират според критичните нужди на лечебното заведение.\n\n2. Тръбопроводна мрежа: газовете се пренасят към етажите и отделенията чрез подходящи медни тръби. В проекта се отчитат диаметърът, загубите на налягане, зонирането, достъпът за обслужване и бъдещият капацитет.\n\n3. Терминални устройства: газовите изводи и вакуумните връзки в стенни, таванни или висящи модули позволяват безопасна употреба от медицинския персонал. Всеки газ трябва да има собствена идентификация и съвместим тип връзка, за да се предотвратят грешни свързвания.\n\n4. Аларми и мониторинг: налягането при източника, налягането в тръбопровода и нивото на вакуума се наблюдават постоянно. Главните и зоналните аларми предупреждават персонала при достигане на критични стойности.\n\nПроектиране по стандарти и безопасно въвеждане\n\nНадеждността на медицинската газова инсталация не се определя само от полагането на тръби. Заедно трябва да се разгледат видовете газове, необходимият дебит и налягане, критичните зони, резервните източници, алармените сценарии и достъпът за поддръжка. За тръбопроводните системи за медицински газове се вземат предвид ISO 7396-1 и приложимите местни изисквания. Почистването на тръбите, подходящите методи за съединяване, маркировката, изпитванията за течове и налягане, проверката на газа и пускането в експлоатация са задължителни стъпки.\n\nЗащо е важна поддръжката?\n\nПланираната поддръжка помага за ранното откриване на течове, колебания в налягането, повреди в алармите и спад в ефективността. Източниците, вакуумните помпи, компресорите, алармените табла, спирателните вентили и терминалните устройства трябва да бъдат включени в документирана програма за поддръжка.\n\nOxymed Medikal предлага системи за медицински газове, централен вакуум, аларми и интеграция на оборудване за болници и лечебни заведения според потребностите на всеки проект.	Продуктови новини	kakvo-predstavlyavat-sistemite-za-medicinski-gazove	t	\N	Системи за медицински газове в болници | Oxymed	Ръководство за системите за медицински газове: кислород, медицински въздух и вакуум, компоненти, стандарти, монтаж, аларми и поддръжка.	2026-08-18 11:12:28.028788+00	2026-08-18 11:12:28.028788+00
16	1	az	Tibbi qaz sistemləri nədir?	Tibbi qaz sistemlərinin xəstəxanalarda oksigeni, tibbi havanı, vakuumu və digər qazları necə təhlükəsiz payladığını, əsas komponentləri və texniki xidmət tələblərini öyrənin.	Tibbi qaz sistemi xəstəxanalarda, əməliyyat otaqlarında, reanimasiya şöbələrində, klinikalarda və digər səhiyyə müəssisələrində lazım olan qazları mərkəzi mənbədən istifadə nöqtələrinə təhlükəsiz, fasiləsiz və idarə olunan şəkildə çatdıran mühəndislik infrastrukturudur. Oksigen, tibbi hava, tibbi vakuum, azot protoksid, karbon qazı və anesteziya qazlarının xaric edilməsi sistemləri ən geniş yayılmış tətbiqlər sırasındadır.\n\nTibbi qaz sisteminin əsas komponentləri\n\n1. Mərkəzi mənbə: oksigen çəni və ya balon manifoldu, tibbi hava kompressorları, vakuum nasosları və digər qaz mənbələri sistemin başlanğıcını təşkil edir. Tutum, ehtiyatlılıq və avtomatik keçid ssenariləri müəssisənin kritik ehtiyaclarına uyğun hesablanır.\n\n2. Boru paylama şəbəkəsi: qazlar uyğun keyfiyyət və ölçüdə seçilmiş mis borular vasitəsilə mərtəbələrə və şöbələrə ötürülür. Boru diametri, təzyiq itkisi, zonalaşdırma, texniki xidmətə çıxış və gələcək tutum ehtiyacı layihələndirmə zamanı nəzərə alınmalıdır.\n\n3. Terminal qurğuları: divar, tavan və ya asma qurğularda yerləşən qaz çıxışları və vakuum bağlantıları tibb işçilərinin sistemdən təhlükəsiz istifadəsini təmin edir. Səhv qoşulmanın qarşısını almaq üçün hər qazın ayrıca identifikasiyası və bağlantı standartı olmalıdır.\n\n4. Siqnalizasiya və monitorinq: mənbə təzyiqi, xətt təzyiqi və vakuum səviyyəsi davamlı izlənilir. Əsas və zonal siqnal panelləri kritik göstəricilər yarandıqda personalı xəbərdar edir.\n\nStandartlara uyğun layihələndirmə və təhlükəsiz istismara vermə\n\nEtibarlı tibbi qaz qurğusu yalnız boruların çəkilməsindən ibarət deyil. Qaz növləri, sərf və təzyiq tələbləri, kritik sahələr, ehtiyat mənbələr, siqnal ssenariləri və texniki xidmətə çıxış birlikdə qiymətləndirilməlidir. Tibbi qaz boru sistemlərində ISO 7396-1 və tətbiq olunan yerli tələblər nəzərə alınır. Boruların təmizliyi, düzgün birləşdirmə üsulları, nişanlama, sızma və təzyiq sınaqları, qazın yoxlanılması və istismara vermə təhvil öncəsi vacib mərhələlərdir.\n\nTexniki xidmət niyə vacibdir?\n\nPlanlı texniki xidmət sızmaların, təzyiq dəyişikliklərinin, siqnalizasiya nasazlıqlarının və avadanlıq məhsuldarlığının azalmasının erkən aşkarlanmasına kömək edir. Mənbə avadanlıqları, vakuum nasosları, kompressorlar, siqnal panelləri, kəsici klapanlar və terminal qurğuları sənədləşdirilmiş xidmət proqramına daxil edilməlidir.\n\nOxymed Medikal xəstəxanalar və səhiyyə müəssisələri üçün layihəyə uyğun tibbi qaz sistemləri, mərkəzi vakuum, siqnalizasiya həlləri və avadanlıq inteqrasiyası təqdim edir.	Məhsul xəbərləri	tibbi-qaz-sistemleri-nedir	t	\N	Xəstəxanalarda tibbi qaz sistemləri | Oxymed	Tibbi qaz sistemləri üzrə bələdçi: oksigen, tibbi hava və vakuumun paylanması, komponentlər, standartlar, quraşdırma, siqnalizasiya və xidmət.	2026-08-18 11:12:28.221678+00	2026-08-18 11:12:28.221678+00
\.


--
-- Data for Name: product_bom_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_bom_items (id, product_id, material_id, required_qty, created_at) FROM stdin;
\.


--
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_categories (id, name, slug, description, sort_order, created_at, updated_at, name_en, name_de, name_fr, name_it, name_ar, name_ru, name_fa, name_ka, name_bg, name_az, image_url, visible, show_on_home, description_en, description_de, description_fr, description_it, description_ar, description_ru, description_fa, description_ka, description_bg, description_az, name_es, description_es) FROM stdin;
1	Yatak Başı Üniteleri	yatak-basi-uniteleri	Elektrik, medikal gaz ve data üniteleri ile güvenli ve konforlu çözümler.	1	2026-05-16 20:08:37.552763+00	2026-08-17 13:15:37.783509+00	Bed Head Units	Bettkopfeinheiten	Unités de tête de lit	Unità testaletto	وحدات رأس السرير	Прикроватные консоли	یونیت‌های بالای تخت	საწოლისთავის იუნიტები	Модули за глава на легло	Çarpayı başı ünitələri	/assets/images/product-bed-head-unit.png	t	t	Safe and comfortable solutions with electrical, medical gas and data units.	Sichere und komfortable Lösungen mit Strom-, Medizin-, Gas- und Dateneinheiten.	Des solutions sûres et confortables avec unités électriques, de gaz médicaux et de données.	Soluzioni sicure e confortevoli con unità elettriche, di gas medicali e dati.	حلول آمنة ومريحة مزودة بوحدات الكهرباء والغازات الطبية والبيانات.	Безопасные и комфортные решения с электрическими, медицинскими газовыми и информационными модулями.	راهکارهای ایمن و راحت با یونیت‌های برق، گازهای طبی و دیتا.	უსაფრთხო და კომფორტული გადაწყვეტილებები ელექტროენერგიის, სამედიცინო გაზისა და მონაცემთა ბლოკებით.	Безопасни и комфортни решения с електрически, медицински газови и информационни модули.	Elektrik, tibbi qaz və data blokları ilə təhlükəsiz və komfortlu həllər.	\N	\N
2	Pendant Sistemleri	pendant-sistemleri	Ameliyathane, yoğun bakım ve acil üniteler için esnek pendant çözümleri.	2	2026-05-16 20:08:37.552763+00	2026-08-17 13:15:37.783509+00	Pendant Systems	Pendantsysteme	Systèmes plafonniers	Sistemi pensili	أنظمة البندنت	Потолочные консоли	سیستم‌های پندانت	პენდანტის სისტემები	Пендантни системи	Pendant sistemləri	/assets/images/product-pendant-system.png	t	t	Flexible pendant solutions for operating rooms, intensive care and emergency units.	Flexible Pendantsysteme für OP, Intensivstation und Notaufnahme.	Des solutions de bras plafonniers flexibles pour les salles d’opération, les soins intensifs et les urgences.	Soluzioni pensili flessibili per sale operatorie, terapie intensive e pronto soccorso.	حلول بندانت مرنة لغرف العمليات ووحدات العناية المركزة والطوارئ.	Гибкие решения с медицинскими консолями для операционных, отделений интенсивной терапии и неотложной помощи.	راهکارهای پندانت انعطاف‌پذیر برای اتاق عمل، مراقبت‌های ویژه و اورژانس.	მოქნილი პენდანტ გადაწყვეტილებები საოპერაციო, ინტენსიური თერაპიისა და გადაუდებელი დახმარების განყოფილებებისთვის.	Гъвкави конзолни решения за операционни, интензивни отделения и спешни звена.	Əməliyyatxana, intensiv terapiya və təcili yardım bölmələri üçün çevik pendant həlləri.	\N	\N
3	Medikal Gaz Sistemleri	medikal-gaz-sistemleri	Oksijen, vakum, hava, AGS ve azot gaz sistemleri.	3	2026-05-16 20:08:37.552763+00	2026-08-17 13:15:37.783509+00	Medical Gas Systems	Medizingassysteme	Systèmes de gaz médicaux	Sistemi di gas medicali	أنظمة الغازات الطبية	Системы медицинских газов	سیستم‌های گازهای پزشکی	სამედიცინო გაზის სისტემები	Медицински газови системи	Tibbi qaz sistemləri	/assets/images/product-medical-gas.png	t	t	Oxygen, vacuum, air, AGS and nitrogen gas systems.	Sauerstoff-, Vakuum-, Druckluft-, AGS- und Stickstoffgassysteme.	Systèmes de distribution d’oxygène, de vide, d’air, d’AGS et d’azote.	Sistemi di ossigeno, vuoto, aria, AGS e azoto.	أنظمة غازات الأكسجين والشفط والهواء وAGS والنيتروجين.	Системы подачи кислорода, вакуума, сжатого воздуха, AGS и азота.	سیستم‌های گاز اکسیژن، وکیوم، هوا، AGS و نیتروژن.	ჟანგბადის, ვაკუუმის, ჰაერის, AGS-ისა და აზოტის გაზის სისტემები.	Системи за кислород, вакуум, въздух, AGS и азот.	Oksigen, vakuum, hava, AGS və azot qaz sistemləri.	\N	\N
5	Alarm & İzleme Sistemleri	alarm-izleme-sistemleri	Elektrik, zayıf akım ve data sistemleri ile kesintisiz iletişim.	5	2026-05-16 20:08:37.552763+00	2026-08-17 13:15:37.783509+00	Alarm & Monitoring Systems	Alarm- und Überwachungssysteme	Systèmes d’alarme et de surveillance	Sistemi di allarme e monitoraggio	أنظمة الإنذار والمراقبة	Системы сигнализации и мониторинга	سیستم‌های هشدار و پایش	სიგნალიზაციისა და მონიტორინგის სისტემები	Алармени и мониторингови системи	Siqnalizasiya və monitorinq sistemləri	/assets/images/product-electrical-data.png	t	t	Uninterrupted communication with electrical, low-current and data systems.	Unterbrechungsfreie Kommunikation mit Strom-, Schwachstrom- und Datensystemen.	Communication ininterrompue grâce aux systèmes électriques, de courants faibles et de données.	Comunicazione ininterrotta con sistemi elettrici, a corrente debole e dati.	اتصال مستمر عبر أنظمة الكهرباء والتيار الضعيف والبيانات.	Бесперебойная связь с системами электроснабжения, слаботочными и информационными системами.	ارتباط بدون وقفه با سیستم‌های برق، جریان ضعیف و دیتا.	უწყვეტი კომუნიკაცია ელექტროენერგიის, სუსტი დენისა და მონაცემთა სისტემებით.	Непрекъсната комуникация чрез електрически, слаботокови и информационни системи.	Elektrik, zəif cərəyan və data sistemləri ilə fasiləsiz rabitə.	\N	\N
6	Dental Sistemler	dental-sistemler	Diş klinikleri için amalgam separatörü ve dental vakum çözümleri.	0	2026-08-04 07:53:23.156465+00	2026-08-17 13:15:37.783509+00	Dental Systems	Dentalsysteme	Systèmes dentaires	Sistemi dentali	أنظمة طب الأسنان	Стоматологические системы	سیستم‌های دندان‌پزشکی	დენტალური სისტემები	Дентални системи	Dental sistemlər	/api/storage/public-objects/objects/uploads/64a70581-27d4-4551-9e65-d5d95e14c22d	t	t	Amalgam separator and dental vacuum solutions for dental clinics.	Amalgamabscheider- und Dentalvakuumlösungen für Zahnkliniken.	Solutions de séparateur d’amalgame et d’aspiration dentaire pour cliniques dentaires.	Soluzioni di separatore di amalgama e aspirazione dentale per cliniche odontoiatriche.	حلول فاصل الأملغم وأنظمة التفريغ لعيادات الأسنان.	Сепараторы амальгамы и стоматологические вакуумные решения для клиник.	راهکارهای جداکننده آمالگام و وکیوم دندان‌پزشکی برای کلینیک‌ها.	ამალგამის სეპარატორი და დენტალური ვაკუუმ-გადაწყვეტილებები კლინიკებისთვის.	Сепаратори за амалгама и дентални вакуумни решения за клиники.	Diş klinikaları üçün amalqam separatoru və dental vakuum həlləri.	\N	\N
\.


--
-- Data for Name: product_stock; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_stock (id, product_id, quantity, location, notes, updated_at) FROM stdin;
\.


--
-- Data for Name: production_order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.production_order_items (id, order_id, serial_number, qr_token, warranty_device_id, status, quality_checklist, production_date, notes, created_at, updated_at) FROM stdin;
10	30	DTM-0226230608	cecf46ec-deaf-4f1f-8d86-3b80fc61bd64	10	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:05.978092+00	2026-06-23 12:32:05.985+00
11	30	DTM-0226230609	498cb5ad-6c80-4dcd-9a86-a65fef9632b5	11	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:05.991264+00	2026-06-23 12:32:05.996+00
1	1	OXY-GP-200026260501	0a00a62f-1555-4bf1-988f-251a7aef320b	1	uretimde	{"qr_test": true, "filtreler": true, "pano_testi": true, "hmi_kontrol": true, "kacak_testi": true, "vakum_testi": true, "final_kontrol": true, "urun_fotografi": true, "seri_no_etiketi": true, "elektrik_baglantilari": true}	26.05.2026	\N	2026-05-26 22:16:41.239688+00	2026-05-26 22:24:00.561+00
2	1	OXY-GP-200026260502	27d6c521-0576-429d-a830-e9d04435a00c	2	uretimde	{"qr_test": true, "filtreler": true, "pano_testi": true, "hmi_kontrol": true, "kacak_testi": true, "vakum_testi": true, "final_kontrol": true, "urun_fotografi": true, "seri_no_etiketi": true, "elektrik_baglantilari": true}	26.05.2026	\N	2026-05-26 22:16:41.258889+00	2026-05-26 22:24:00.843+00
3	30	DTM-0226230601	cc992c6f-de47-4221-896b-367d3a1ee13c	3	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:05.891027+00	2026-06-23 12:32:05.904+00
4	30	DTM-0226230602	fa172612-094b-4a2b-b361-267d08e696f2	4	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:05.910149+00	2026-06-23 12:32:05.916+00
5	30	DTM-0226230603	0792c5ee-3923-4f32-bf43-055e3149399b	5	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:05.922596+00	2026-06-23 12:32:05.927+00
6	30	DTM-0226230604	42e05f3c-c3ac-42e3-b1f7-2daf1441eeb4	6	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:05.933546+00	2026-06-23 12:32:05.939+00
7	30	DTM-0226230605	76d4c8b6-b2fc-4e97-8d3d-4b4d0ffbb9a1	7	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:05.944607+00	2026-06-23 12:32:05.95+00
8	30	DTM-0226230606	e4de82fa-81c5-4e41-bb4d-44261e111644	8	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:05.95657+00	2026-06-23 12:32:05.961+00
9	30	DTM-0226230607	749d1b37-9c0d-4214-b43d-01af8d56c311	9	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:05.967126+00	2026-06-23 12:32:05.972+00
12	30	DTM-0226230610	77381fe5-1ed8-4543-8531-c3091e690bce	12	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:06.001464+00	2026-06-23 12:32:06.007+00
13	30	DTM-0226230611	68a4171d-af4d-4356-a73e-1c35fb65a887	13	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:06.012888+00	2026-06-23 12:32:06.016+00
14	30	DTM-0226230612	4c6bc121-c96b-4df8-9c65-64bdec03dd5e	14	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:06.023168+00	2026-06-23 12:32:06.028+00
15	30	DTM-0226230613	3868510d-39b8-4628-8b1b-2d690745df2b	15	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:06.034381+00	2026-06-23 12:32:06.039+00
16	30	DTM-0226230614	4d7734c2-d5ef-4bf2-bab5-605e36ad807e	16	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:06.045398+00	2026-06-23 12:32:06.052+00
17	30	DTM-0226230615	d4fcb8a6-4b2d-4e9d-8636-6ae5bf3cea59	17	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:06.058103+00	2026-06-23 12:32:06.063+00
18	30	DTM-0226230616	f03d6386-d7d0-4cb1-be98-dcf44fe5754b	18	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:06.070307+00	2026-06-23 12:32:06.075+00
19	30	DTM-0226230617	cfa95fc7-5589-4f6f-8473-9e77193e2417	19	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:06.081299+00	2026-06-23 12:32:06.086+00
20	30	DTM-0226230618	ea84f500-8609-4d11-9633-7673f48250a1	20	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:06.091699+00	2026-06-23 12:32:06.096+00
21	30	DTM-0226230619	4acc6672-baef-4fb3-ad1f-26d983e26a64	21	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:06.101626+00	2026-06-23 12:32:06.106+00
22	30	DTM-0226230620	d4dedee1-a8b4-4a0e-990a-456817446b96	22	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:06.112829+00	2026-06-23 12:32:06.118+00
23	30	DTM-0226230621	d9e4e75f-0253-4ef6-b4be-ea22e197f147	23	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:06.124694+00	2026-06-23 12:32:06.129+00
24	30	DTM-0226230622	13432bfe-69eb-4fc1-b7d7-1677d462a453	24	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:06.135331+00	2026-06-23 12:32:06.139+00
25	30	DTM-0226230623	07a73835-8e93-4f4f-9734-671f94ef9862	25	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:06.145725+00	2026-06-23 12:32:06.15+00
26	30	DTM-0226230624	841ec94f-8ea5-4d39-9ded-2b22f951bf75	26	uretimde	{"qr_test": false, "filtreler": false, "pano_testi": false, "hmi_kontrol": false, "kacak_testi": false, "vakum_testi": false, "final_kontrol": false, "urun_fotografi": false, "seri_no_etiketi": false, "elektrik_baglantilari": false}	23.06.2026	\N	2026-06-23 12:32:06.155624+00	2026-06-23 12:32:06.16+00
\.


--
-- Data for Name: production_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.production_orders (id, order_no, product_id, product_title, product_code, quantity, status, quote_form_id, customer_name, notes, created_at, updated_at) FROM stdin;
1	OXM-URT-2026-260501	\N	Gaz Merkezi Paneli	OXY-GP-2000	2	uretime_hazir	\N	Ege Hastanesi	\N	2026-05-26 22:16:26.723773+00	2026-05-27 09:35:52.587+00
16	OXM-URT-2026-280501	4	Medikal Gaz Alarmı	\N	1	bekliyor	4	ZONE DIGITAL LLC	Otomatik oluşturuldu. Teklif No: 4	2026-05-28 19:28:19.151126+00	2026-05-28 19:28:19.151126+00
17	OXM-URT-2026-230601	\N	—	1 Gaz İçin	2	bekliyor	10	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	Otomatik oluşturuldu. Teklif No: 10	2026-06-23 12:29:44.768792+00	2026-06-23 12:29:44.768792+00
18	OXM-URT-2026-230602	\N	—	12mm Çap	24	bekliyor	10	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	Otomatik oluşturuldu. Teklif No: 10	2026-06-23 12:29:44.795245+00	2026-06-23 12:29:44.795245+00
19	OXM-URT-2026-230603	\N	—	1/4 0-10 BAR REGÜLATÖR	24	bekliyor	10	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	Otomatik oluşturuldu. Teklif No: 10	2026-06-23 12:29:44.807349+00	2026-06-23 12:29:44.807349+00
20	OXM-URT-2026-230604	\N	—	5/2 ADAVALF	24	bekliyor	10	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	Otomatik oluşturuldu. Teklif No: 10	2026-06-23 12:29:44.810936+00	2026-06-23 12:29:44.810936+00
21	OXM-URT-2026-230605	\N	—	Q 1"1/2  PİNÇ VANA	24	bekliyor	10	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	Otomatik oluşturuldu. Teklif No: 10	2026-06-23 12:29:44.814486+00	2026-06-23 12:29:44.814486+00
22	OXM-URT-2026-230606	\N	—	\N	2	bekliyor	10	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	Otomatik oluşturuldu. Teklif No: 10	2026-06-23 12:29:44.818325+00	2026-06-23 12:29:44.818325+00
23	OXM-URT-2026-230607	\N	—	Ø12X1 mm.	50	bekliyor	10	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	Otomatik oluşturuldu. Teklif No: 10	2026-06-23 12:29:44.821612+00	2026-06-23 12:29:44.821612+00
24	OXM-URT-2026-230608	\N	—	Ø15X1 mm.	25	bekliyor	10	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	Otomatik oluşturuldu. Teklif No: 10	2026-06-23 12:29:44.82457+00	2026-06-23 12:29:44.82457+00
25	OXM-URT-2026-230609	\N	—	Ø22X1 mm.	120	bekliyor	10	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	Otomatik oluşturuldu. Teklif No: 10	2026-06-23 12:29:44.827555+00	2026-06-23 12:29:44.827555+00
26	OXM-URT-2026-230610	\N	—	Q 110 MM UPVC BORU VE MONTAJ MALZEMESİ	30	bekliyor	10	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	Otomatik oluşturuldu. Teklif No: 10	2026-06-23 12:29:44.831437+00	2026-06-23 12:29:44.831437+00
27	OXM-URT-2026-230611	\N	—	Q 75 MM UPVC BORU VE MONTAJ MALZEMESİ	36	bekliyor	10	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	Otomatik oluşturuldu. Teklif No: 10	2026-06-23 12:29:44.834914+00	2026-06-23 12:29:44.834914+00
28	OXM-URT-2026-230612	\N	—	Q 50 MM UPVC BORU VE MONTAJ MALZEMESİ	24	bekliyor	10	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	Otomatik oluşturuldu. Teklif No: 10	2026-06-23 12:29:44.838488+00	2026-06-23 12:29:44.838488+00
29	OXM-URT-2026-230613	\N	DENTAL TOZ ASPRATÖRÜ -  ( 1500 m³/h)	OXY-DTA-1500	1	bekliyor	10	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	Otomatik oluşturuldu. Teklif No: 10	2026-06-23 12:29:44.841672+00	2026-06-23 12:29:44.841672+00
30	OXM-URT-2026-230614	\N	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	24	uretimde	10	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	Otomatik oluşturuldu. Teklif No: 10	2026-06-23 12:29:44.845149+00	2026-06-23 12:32:06.162+00
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, category_id, title, description, image_url, specs, sort_order, published, created_at, updated_at, page_slug, page_data, private_data, quote_title, quote_bullets, quote_model_code, quote_image_url, quote_unit, quote_unit_price, title_en, title_de, title_fr, title_it, title_ar, title_ru, title_fa, title_ka, title_bg, title_az, show_on_home, home_sort_order, title_es) FROM stdin;
8	2	Cerrahi Pendant Ünitesi	Ameliyat masası çevresinde cerrahi ekip için gaz, elektrik, monitör ve aydınlatma taşıma noktalarını birleştiren tavan tipi pendant sistemi.	/assets/images/products/cerrahi-pendant-hero.jpg	[{"label": "Ürün Adı", "value": "Cerrahi Pendant Ünitesi"}, {"label": "Kullanım Alanı", "value": "Ameliyathane / Cerrahi Alan"}, {"label": "Gaz Çıkışları", "value": "O2, Medikal Hava, Vakum, CO2 (opsiyonel)"}, {"label": "Elektrik Çıkışı", "value": "6-10 adet topraklı priz"}, {"label": "Kol Tipi", "value": "Tek / Çift kollu, 320° dönüş"}, {"label": "Yük Kapasitesi", "value": "100 - 180 kg"}, {"label": "Taşıma Donanımı", "value": "Monitör kolu, cerrahi lamba braketi (opsiyonel)"}, {"label": "Gövde Malzemesi", "value": "Elektrostatik boyalı alüminyum / paslanmaz çelik"}, {"label": "Uygunluk", "value": "CE, ISO 13485 üretim standartlarına uygun"}]	8	f	2026-08-03 07:21:53.385923+00	2026-08-17 20:22:32.236+00	cerrahi-pendant-unitesi	{"faq": [{"answer": "Genel cerrahi, ortopedi, beyin cerrahisi ve hibrit ameliyat odaları başta olmak üzere tüm ameliyathane tiplerinde kullanılabilir.", "question": "Cerrahi pendant ünitesi hangi ameliyathanelerde kullanılır?"}, {"answer": "Monitör kolu standarttır; cerrahi lamba braketi talebe göre opsiyonel olarak eklenebilir.", "question": "Monitör ve aydınlatma braketi standart mı gelir?"}, {"answer": "Standart olarak O2, Medikal Hava ve Vakum desteklenir; ihtiyaca göre CO2 hattı da eklenebilir.", "question": "Hangi gazlar desteklenir?"}, {"answer": "Konfigürasyona bağlı olarak 100 kg ile 180 kg arasında taşıma kapasitesi sunar.", "question": "Yük kapasitesi nedir?"}, {"answer": "CE belgeli olup ISO 13485 medikal cihaz üretim standartlarına uygundur.", "question": "Sertifikasyonu nedir?"}], "specs": [{"label": "Ürün Adı", "value": "Cerrahi Pendant Ünitesi"}, {"label": "Kullanım Alanı", "value": "Ameliyathane / Cerrahi Alan"}, {"label": "Gaz Çıkışları", "value": "O2, Medikal Hava, Vakum, CO2 (opsiyonel)"}, {"label": "Elektrik Çıkışı", "value": "6-10 adet topraklı priz"}, {"label": "Kol Tipi", "value": "Tek / Çift kollu, 320° dönüş"}, {"label": "Yük Kapasitesi", "value": "100 - 180 kg"}, {"label": "Taşıma Donanımı", "value": "Monitör kolu, cerrahi lamba braketi (opsiyonel)"}, {"label": "Gövde Malzemesi", "value": "Elektrostatik boyalı alüminyum / paslanmaz çelik"}, {"label": "Uygunluk", "value": "CE, ISO 13485 üretim standartlarına uygun"}], "locales": {"ar": {"faq": [{"answer": "يمكن استخدامه في جميع أنواع غرف العمليات، وعلى رأسها غرف الجراحة العامة وجراحة العظام وجراحة الأعصاب وغرف العمليات الهجينة.", "question": "في أي غرف عمليات تُستخدم وحدة البندنت الجراحي؟"}, {"answer": "ذراع شاشة المراقبة قياسي؛ ويمكن إضافة حامل المصباح الجراحي كخيار حسب الطلب.", "question": "هل يأتي حامل الشاشة وحامل الإضاءة بشكل قياسي؟"}, {"answer": "يتم دعم O2 والهواء الطبي والشفط كمعيار قياسي؛ ويمكن إضافة خط CO2 حسب الحاجة.", "question": "ما الغازات المدعومة؟"}, {"answer": "تقدم سعة تحميل تتراوح بين 100 kg و180 kg حسب التكوين.", "question": "ما سعة التحميل؟"}, {"answer": "حاصلة على شهادة CE ومتوافقة مع معايير تصنيع الأجهزة الطبية ISO 13485.", "question": "ما هي شهاداتها؟"}], "specs": [], "features": [{"icon": "sparkles", "text": "دعم خطوط O2 والهواء الطبي والشفط، وخط CO2 حسب الطلب.", "title": "دعم متعدد الغازات"}, {"icon": "sparkles", "text": "حامل شاشة قابل للضبط بزاوية مريحة للفريق الجراحي.", "title": "ذراع حمل الشاشة"}, {"icon": "sparkles", "text": "عدد كافٍ من المقابس الكهربائية المؤرضة لعدة أجهزة جراحية.", "title": "سعة كبيرة للمقابس"}, {"icon": "sparkles", "text": "آلية ذراع دوارة عالية السعة وخالية من الاهتزازات.", "title": "هيكل ذراع متين"}], "useCases": [{"icon": "layers", "text": "غرف عمليات الجراحة العامة"}, {"icon": "layers", "text": "غرف عمليات جراحة العظام"}, {"icon": "layers", "text": "وحدات جراحة الأعصاب"}, {"icon": "layers", "text": "غرف العمليات الهجينة"}, {"icon": "layers", "text": "المستشفيات الجامعية"}], "advantages": ["مساحة عمل واسعة وخالية من العوائق حول طاولة العمليات", "إدارة جميع احتياجات الغاز والكهرباء من نقطة واحدة", "خيارات مريحة لحمل الشاشة والإضاءة", "آلية ذراع طويلة العمر وعالية سعة التحميل", "هيكل معياري قابل للتخصيص حسب الحاجة"], "detailCards": [{"text": "ذراع لحمل الشاشة يمكن ضبطه بسهولة وفقاً لزاوية رؤية الفريق الجراحي.", "title": "ذراع شاشة مريح", "imageUrl": "/assets/images/products/cerrahi-pendant-detail-1.jpg"}, {"text": "لوحة تحكم مضاءة تتيح رؤية مخارج الغاز والكهرباء بسهولة.", "title": "لوحة تحكم مضاءة", "imageUrl": "/assets/images/products/cerrahi-pendant-detail-2.jpg"}, {"text": "حامل لحمل الإضاءة الجراحية يمكن دمجه حسب الطلب.", "title": "حامل المصباح الجراحي", "imageUrl": ""}, {"text": "طلاء خارجي أملس يسهل تطهيره.", "title": "سطح صحي", "imageUrl": ""}], "featureTiles": [{"text": "يمكن إضافة وحدات الغاز والمقابس ووحدات الحمل حسب الحاجة.", "title": "هيكل معياري"}, {"text": "حركة ذراع سلسة بفضل نظام محامل خالٍ من الاهتزازات.", "title": "حركة صامتة"}, {"text": "إمكانية صيانة سريعة بفضل الهيكل الداخلي سهل الوصول إليه.", "title": "خدمة سريعة"}], "heroSubtitle": "نظام حمل متكامل لمحيط طاولة العمليات", "heroDescription": "تجمع وحدة البندنت الجراحي من Oxymed مخارج الغازات الطبية والمقابس الكهربائية ونقاط حمل الشاشات والإضاءة الجراحية في ذراع دوارة واحدة، لتوفر مساحة عمل واسعة وخالية من العوائق حول طاولة العمليات."}, "az": {"faq": [{"answer": "Ümumi cərrahiyyə, ortopediya, neyrocərrahiyyə və hibrid əməliyyat otaqları başda olmaqla bütün əməliyyatxana növlərində istifadə edilə bilər.", "question": "Cərrahi pendant qurğusu hansı əməliyyatxanalarda istifadə olunur?"}, {"answer": "Monitor qolu standartdır; cərrahi lampa braketi tələbə uyğun olaraq opsional şəkildə əlavə edilə bilər.", "question": "Monitor və işıqlandırma braketi standart olaraq təqdim olunurmu?"}, {"answer": "Standart olaraq O2, Tibbi Hava və Vakuum dəstəklənir; ehtiyaca uyğun olaraq CO2 xətti də əlavə edilə bilər.", "question": "Hansı qazlar dəstəklənir?"}, {"answer": "Konfiqurasiyadan asılı olaraq 100 kg ilə 180 kg arasında yükdaşıma qabiliyyəti təqdim edir.", "question": "Yükdaşıma qabiliyyəti nədir?"}, {"answer": "CE sertifikatlıdır və ISO 13485 tibbi cihaz istehsalı standartlarına uyğundur.", "question": "Sertifikatlaşdırılması nədir?"}], "specs": [], "features": [{"icon": "sparkles", "text": "O2, Tibbi Hava, Vakuum və tələbə uyğun CO2 xətti dəstəyi.", "title": "Çoxsaylı Qaz Dəstəyi"}, {"icon": "sparkles", "text": "Cərrahi heyət üçün erqonomik bucaq altında tənzimlənə bilən monitor braketi.", "title": "Monitor Daşıyıcı Qolu"}, {"icon": "sparkles", "text": "Çoxsaylı cərrahi cihazlar üçün kifayət sayda torpaqlamalı elektrik rozetkası.", "title": "Geniş Rozetka Tutumu"}, {"icon": "sparkles", "text": "Yüksək yükdaşıma qabiliyyətli, vibrasiyasız fırlanan qol mexanizmi.", "title": "Möhkəm Qol Quruluşu"}], "useCases": [{"icon": "layers", "text": "Ümumi Cərrahiyyə Əməliyyatxanaları"}, {"icon": "layers", "text": "Ortopediya Əməliyyatxanaları"}, {"icon": "layers", "text": "Neyrocərrahiyyə Bölmələri"}, {"icon": "layers", "text": "Hibrid Əməliyyat Otaqları"}, {"icon": "layers", "text": "Universitet Xəstəxanaları"}], "advantages": ["Əməliyyat masası ətrafında maneəsiz, geniş iş sahəsi", "Bütün qaz və elektrik ehtiyaclarının vahid nöqtədən idarə olunması", "Erqonomik monitor və işıqlandırma daşıma seçimləri", "Yüksək yükdaşıma qabiliyyətli, uzunömürlü qol mexanizmi", "Ehtiyaca uyğun fərdiləşdirilə bilən modul quruluş"], "detailCards": [{"text": "Cərrahi heyətin baxış bucağına uyğun asanlıqla tənzimlənən monitor daşıyıcı qolu.", "title": "Erqonomik Monitor Qolu", "imageUrl": "/assets/images/products/cerrahi-pendant-detail-1.jpg"}, {"text": "Qaz və elektrik çıxışlarının rahat görünə bildiyi işıqlandırılmış idarəetmə paneli.", "title": "İşıqlandırılmış İdarəetmə Paneli", "imageUrl": "/assets/images/products/cerrahi-pendant-detail-2.jpg"}, {"text": "Tələbə uyğun olaraq inteqrasiya edilə bilən cərrahi işıqlandırma daşıyıcı braketi.", "title": "Cərrahi Lampa Braketi", "imageUrl": ""}, {"text": "Asan dezinfeksiya edilə bilən, hamar xarici səth örtüyü.", "title": "Gigiyenik Səth", "imageUrl": ""}], "featureTiles": [{"text": "Qaz, rozetka və daşıma modulları ehtiyaca uyğun əlavə edilə bilər.", "title": "Modul Quruluş"}, {"text": "Vibrasiyasız podşipnik sistemi ilə yumşaq qol hərəkəti.", "title": "Səssiz Hərəkət"}, {"text": "Asan əlçatan daxili quruluş sayəsində sürətli texniki xidmət imkanı.", "title": "Sürətli Servis"}], "heroSubtitle": "Əməliyyat Masası Ətrafı üçün İnteqrə Edilmiş Daşıma Sistemi", "heroDescription": "Oxymed Cərrahi Pendant Qurğusu; tibbi qaz çıxışlarını, elektrik rozetkalarını, cərrahi monitor və işıqlandırma daşıma nöqtələrini vahid fırlanan qolda birləşdirərək əməliyyat masası ətrafında geniş və maneəsiz iş sahəsi təmin edir."}, "bg": {"faq": [{"answer": "Може да се използва във всички типове операционни зали, включително за обща хирургия, ортопедия, неврохирургия и хибридни операционни зали.", "question": "В кои операционни зали се използва хирургичният pendant модул?"}, {"answer": "Рамото за монитор е стандартно; скобата за хирургична лампа може да бъде добавена като опция при поискване.", "question": "Стандартни ли са скобите за монитор и осветление?"}, {"answer": "Стандартно се поддържат O2, Медицински въздух и Вакуум; при необходимост може да се добави и линия за CO2.", "question": "Кои газове се поддържат?"}, {"answer": "В зависимост от конфигурацията предлага товароносимост между 100 kg и 180 kg.", "question": "Каква е товароносимостта?"}, {"answer": "Притежава CE сертификат и отговаря на стандартите за производство на медицински изделия ISO 13485.", "question": "Каква е сертификацията?"}], "specs": [], "features": [{"icon": "sparkles", "text": "Поддръжка на линии за O2, Медицински въздух, Вакуум и CO2 при поискване.", "title": "Поддръжка на множество газове"}, {"icon": "sparkles", "text": "Регулируема скоба за монитор под ергономичен ъгъл за хирургичния екип.", "title": "Рамо за монитор"}, {"icon": "sparkles", "text": "Достатъчен брой заземени електрически контакти за множество хирургични устройства.", "title": "Голям капацитет на контактите"}, {"icon": "sparkles", "text": "Механизъм с въртящо се рамо с висока товароносимост и без вибрации.", "title": "Здрава конструкция на рамото"}], "useCases": [{"icon": "layers", "text": "Операционни зали за обща хирургия"}, {"icon": "layers", "text": "Операционни зали за ортопедия"}, {"icon": "layers", "text": "Отделения по неврохирургия"}, {"icon": "layers", "text": "Хибридни операционни зали"}, {"icon": "layers", "text": "Университетски болници"}], "advantages": ["Свободна и просторна работна зона около операционната маса", "Управление на всички нужди от газове и електрозахранване от една точка", "Ергономични възможности за окачване на монитор и осветление", "Дълготраен механизъм на рамото с висока товароносимост", "Модулна конструкция, персонализируема според нуждите"], "detailCards": [{"text": "Рамо за монитор, което лесно се регулира според зрителния ъгъл на хирургичния екип.", "title": "Ергономично рамо за монитор", "imageUrl": "/assets/images/products/cerrahi-pendant-detail-1.jpg"}, {"text": "Осветен контролен панел, осигуряващ добра видимост на газовите и електрическите изводи.", "title": "Осветен контролен панел", "imageUrl": "/assets/images/products/cerrahi-pendant-detail-2.jpg"}, {"text": "Скоба за окачване на хирургично осветление, която може да бъде интегрирана при поискване.", "title": "Скоба за хирургична лампа", "imageUrl": ""}, {"text": "Гладко външно повърхностно покритие, което се дезинфекцира лесно.", "title": "Хигиенична повърхност", "imageUrl": ""}], "featureTiles": [{"text": "Газови, електрически и носещи модули могат да се добавят според нуждите.", "title": "Модулна конструкция"}, {"text": "Плавно движение на рамото чрез антивибрационна лагерна система.", "title": "Безшумно движение"}, {"text": "Бърза поддръжка благодарение на леснодостъпната вътрешна конструкция.", "title": "Бърз сервиз"}], "heroSubtitle": "Интегрирана носеща система за зоната около операционната маса", "heroDescription": "Хирургичният pendant модул Oxymed обединява изводите за медицински газове, електрическите контакти, точките за окачване на хирургичен монитор и осветление в едно въртящо се рамо, осигурявайки просторна и свободна работна зона около операционната маса."}, "de": {"faq": [{"answer": "Kann in allen OP-Typen eingesetzt werden, insbesondere in der Allgemeinchirurgie, Orthopädie, Neurochirurgie und in Hybrid-Operationssälen.", "question": "In welchen Operationssälen kann die chirurgische Pendanteinheit eingesetzt werden?"}, {"answer": "Der Monitorarm ist standardmäßig enthalten; eine Halterung für OP-Leuchten kann auf Wunsch optional ergänzt werden.", "question": "Sind Monitor- und Beleuchtungshalterung standardmäßig enthalten?"}, {"answer": "Standardmäßig werden O2, medizinische Luft und Vakuum unterstützt; bei Bedarf kann auch eine CO2-Leitung ergänzt werden.", "question": "Welche Gase werden unterstützt?"}, {"answer": "Je nach Konfiguration bietet sie eine Tragfähigkeit zwischen 100 kg und 180 kg.", "question": "Wie hoch ist die Tragfähigkeit?"}, {"answer": "CE-zertifiziert und konform mit den Produktionsstandards für Medizinprodukte nach ISO 13485.", "question": "Welche Zertifizierung liegt vor?"}], "specs": [], "features": [{"icon": "sparkles", "text": "Unterstützung für O2, medizinische Luft, Vakuum und bei Bedarf CO2-Leitung.", "title": "Mehrgasversorgung"}, {"icon": "sparkles", "text": "Ergonomisch einstellbare Monitorhalterung für das OP-Team.", "title": "Monitortragarm"}, {"icon": "sparkles", "text": "Ausreichende Anzahl geerdeter Steckdosen für mehrere chirurgische Geräte.", "title": "Hohe Steckdosenkapazität"}, {"icon": "sparkles", "text": "Dreharmmechanismus mit hoher Tragfähigkeit und vibrationsfreier Bewegung.", "title": "Robuste Armkonstruktion"}], "useCases": [{"icon": "layers", "text": "Operationssäle für Allgemeinchirurgie"}, {"icon": "layers", "text": "Orthopädische Operationssäle"}, {"icon": "layers", "text": "Neurochirurgische Einheiten"}, {"icon": "layers", "text": "Hybrid-Operationssäle"}, {"icon": "layers", "text": "Universitätskliniken"}], "advantages": ["Freier, großzügiger Arbeitsbereich rund um den OP-Tisch", "Zentrale Bereitstellung aller Gas- und Stromanschlüsse", "Ergonomische Optionen zur Aufnahme von Monitoren und Beleuchtung", "Langlebiger Armmechanismus mit hoher Tragfähigkeit", "Bedarfsgerecht konfigurierbare modulare Bauweise"], "detailCards": [{"text": "Leicht an den Blickwinkel des OP-Teams anpassbarer Monitortragarm.", "title": "Ergonomischer Monitorarm", "imageUrl": "/assets/images/products/cerrahi-pendant-detail-1.jpg"}, {"text": "Beleuchtetes Bedienfeld, auf dem Gas- und Stromanschlüsse gut sichtbar sind.", "title": "Beleuchtetes Bedienfeld", "imageUrl": "/assets/images/products/cerrahi-pendant-detail-2.jpg"}, {"text": "Auf Wunsch integrierbare Halterung zur Aufnahme chirurgischer Beleuchtung.", "title": "OP-Leuchtenhalterung", "imageUrl": ""}, {"text": "Glatte Außenflächenbeschichtung zur einfachen Desinfektion.", "title": "Hygienische Oberfläche", "imageUrl": ""}], "featureTiles": [{"text": "Gas-, Steckdosen- und Trägermodule können bedarfsgerecht ergänzt werden.", "title": "Modulare Bauweise"}, {"text": "Sanfte Armbewegung durch vibrationsfreies Lagersystem.", "title": "Geräuscharme Bewegung"}, {"text": "Schnelle Wartung durch leicht zugängliche Innenkonstruktion.", "title": "Schneller Service"}], "heroSubtitle": "Integriertes Trägersystem für den Bereich rund um den OP-Tisch", "heroDescription": "Die Oxymed Chirurgische Pendanteinheit vereint medizinische Gasauslässe, elektrische Steckdosen sowie Aufnahmepunkte für chirurgische Monitore und Beleuchtung in einem einzigen Schwenkarm und schafft dadurch einen großzügigen, hindernisfreien Arbeitsbereich rund um den OP-Tisch."}, "en": {"faq": [{"answer": "It can be used in all types of operating rooms, particularly general surgery, orthopedics, neurosurgery, and hybrid operating rooms.", "question": "In which operating rooms can the surgical pendant unit be used?"}, {"answer": "The monitor arm is standard; a surgical light bracket can be added as an optional feature upon request.", "question": "Are the monitor and lighting brackets supplied as standard?"}, {"answer": "O2, Medical Air, and Vacuum are supported as standard; a CO2 line can also be added as required.", "question": "Which gases are supported?"}, {"answer": "Depending on the configuration, it offers a load capacity between 100 kg and 180 kg.", "question": "What is the load capacity?"}, {"answer": "It is CE-certified and complies with ISO 13485 medical device manufacturing standards.", "question": "What certification does it have?"}], "specs": [], "features": [{"icon": "sparkles", "text": "Support for O2, Medical Air, Vacuum, and an optional CO2 line.", "title": "Multiple Gas Support"}, {"icon": "sparkles", "text": "Monitor bracket adjustable to an ergonomic angle for the surgical team.", "title": "Monitor Support Arm"}, {"icon": "sparkles", "text": "Sufficient number of grounded electrical outlets for multiple surgical devices.", "title": "High Outlet Capacity"}, {"icon": "sparkles", "text": "High-load-capacity, vibration-free rotating arm mechanism.", "title": "Robust Arm Structure"}], "useCases": [{"icon": "layers", "text": "General Surgery Operating Rooms"}, {"icon": "layers", "text": "Orthopedic Operating Rooms"}, {"icon": "layers", "text": "Neurosurgery Units"}, {"icon": "layers", "text": "Hybrid Operating Rooms"}, {"icon": "layers", "text": "University Hospitals"}], "advantages": ["Unobstructed, spacious working area around the operating table", "Centralized management of all gas and electrical requirements", "Ergonomic monitor and lighting support options", "High-load-capacity, long-lasting arm mechanism", "Customizable modular structure according to requirements"], "detailCards": [{"text": "Monitor support arm that can be easily adjusted according to the surgical team's viewing angle.", "title": "Ergonomic Monitor Arm", "imageUrl": "/assets/images/products/cerrahi-pendant-detail-1.jpg"}, {"text": "Illuminated control panel providing clear visibility of gas and electrical outlets.", "title": "Illuminated Control Panel", "imageUrl": "/assets/images/products/cerrahi-pendant-detail-2.jpg"}, {"text": "Surgical lighting support bracket that can be integrated upon request.", "title": "Surgical Light Bracket", "imageUrl": ""}, {"text": "Smooth outer surface finish that can be easily disinfected.", "title": "Hygienic Surface", "imageUrl": ""}], "featureTiles": [{"text": "Gas, outlet, and support modules can be added as required.", "title": "Modular Structure"}, {"text": "Smooth arm movement with a vibration-free bearing system.", "title": "Silent Movement"}, {"text": "Fast maintenance enabled by an easily accessible internal structure.", "title": "Quick Service"}], "heroSubtitle": "Integrated Support System for the Operating Table Area", "heroDescription": "The Oxymed Surgical Pendant Unit combines medical gas outlets, electrical outlets, surgical monitor support points, and lighting support points on a single rotating arm, providing a spacious and unobstructed working area around the operating table."}, "fa": {"faq": [{"answer": "در تمامی انواع اتاق‌های عمل، به‌ویژه جراحی عمومی، ارتوپدی، جراحی مغز و اعصاب و اتاق‌های عمل هیبرید قابل استفاده است.", "question": "یونیت پندانت جراحی در کدام اتاق‌های عمل استفاده می‌شود؟"}, {"answer": "بازوی مانیتور استاندارد است؛ براکت چراغ جراحی بنا به درخواست به‌صورت آپشنال قابل افزودن است.", "question": "آیا براکت مانیتور و روشنایی به‌صورت استاندارد ارائه می‌شود؟"}, {"answer": "به‌صورت استاندارد از O2، هوای مدیکال و وکیوم پشتیبانی می‌شود؛ خط CO2 نیز بر اساس نیاز قابل افزودن است.", "question": "کدام گازها پشتیبانی می‌شوند؟"}, {"answer": "بسته به پیکربندی، ظرفیت تحمل بار بین 100 kg تا 180 kg ارائه می‌دهد.", "question": "ظرفیت بار چقدر است؟"}, {"answer": "دارای گواهی CE بوده و مطابق با استانداردهای تولید تجهیزات پزشکی ISO 13485 است.", "question": "گواهی‌نامه آن چیست؟"}], "specs": [], "features": [{"icon": "sparkles", "text": "پشتیبانی از خطوط O2، هوای مدیکال، وکیوم و CO2 بنا به درخواست.", "title": "پشتیبانی چندگانه گاز"}, {"icon": "sparkles", "text": "براکت مانیتور قابل تنظیم با زاویه ارگونومیک برای تیم جراحی.", "title": "بازوی نگهدارنده مانیتور"}, {"icon": "sparkles", "text": "تعداد کافی پریز برق ارت‌دار برای تجهیزات متعدد جراحی.", "title": "ظرفیت بالای پریز"}, {"icon": "sparkles", "text": "مکانیزم بازوی چرخان بدون لرزش با ظرفیت بار بالا.", "title": "ساختار بازوی مستحکم"}], "useCases": [{"icon": "layers", "text": "اتاق‌های عمل جراحی عمومی"}, {"icon": "layers", "text": "اتاق‌های عمل ارتوپدی"}, {"icon": "layers", "text": "واحدهای جراحی مغز و اعصاب"}, {"icon": "layers", "text": "اتاق‌های عمل هیبرید"}, {"icon": "layers", "text": "بیمارستان‌های دانشگاهی"}], "advantages": ["فضای کاری وسیع و بدون مانع در اطراف میز عمل", "مدیریت تمامی نیازهای گاز و برق از یک نقطه", "گزینه‌های ارگونومیک نگهداری مانیتور و روشنایی", "مکانیزم بازوی بادوام با ظرفیت بار بالا", "ساختار ماژولار قابل سفارشی‌سازی بر اساس نیاز"], "detailCards": [{"text": "بازوی نگهدارنده مانیتور که به‌راحتی بر اساس زاویه دید تیم جراحی قابل تنظیم است.", "title": "بازوی ارگونومیک مانیتور", "imageUrl": "/assets/images/products/cerrahi-pendant-detail-1.jpg"}, {"text": "پنل کنترل روشن‌دار که خروجی‌های گاز و برق در آن به‌وضوح قابل مشاهده هستند.", "title": "پنل کنترل روشن‌دار", "imageUrl": "/assets/images/products/cerrahi-pendant-detail-2.jpg"}, {"text": "براکت نگهدارنده روشنایی جراحی که بنا به درخواست قابل یکپارچه‌سازی است.", "title": "براکت چراغ جراحی", "imageUrl": ""}, {"text": "پوشش سطح خارجی صاف و قابل ضدعفونی آسان.", "title": "سطح بهداشتی", "imageUrl": ""}], "featureTiles": [{"text": "ماژول‌های گاز، پریز و نگهدارنده بر اساس نیاز قابل افزودن هستند.", "title": "ساختار ماژولار"}, {"text": "حرکت نرم بازو با سیستم بلبرینگ بدون لرزش.", "title": "حرکت بی‌صدا"}, {"text": "امکان سرویس سریع با ساختار داخلی با دسترسی آسان.", "title": "سرویس سریع"}], "heroSubtitle": "سیستم نگهدارنده یکپارچه برای اطراف میز عمل", "heroDescription": "یونیت پندانت جراحی Oxymed با یکپارچه‌سازی خروجی‌های گاز مدیکال، پریزهای برق و نقاط نگهداری مانیتور و روشنایی جراحی در یک بازوی چرخان، فضای کاری وسیع و بدون مانعی را در اطراف میز عمل فراهم می‌کند."}, "fr": {"faq": [{"answer": "Utilisable dans tous les types de blocs opératoires, notamment en chirurgie générale, orthopédie, neurochirurgie et salles d'opération hybrides.", "question": "Dans quels blocs opératoires l'unité de bras plafonnier chirurgical peut-elle être utilisée ?"}, {"answer": "Le bras pour moniteur est standard ; un support pour lampe chirurgicale peut être ajouté en option sur demande.", "question": "Le support de moniteur et le support d'éclairage sont-ils fournis en standard ?"}, {"answer": "O2, Air médical et Vide sont pris en charge en standard ; une ligne CO2 peut également être ajoutée selon les besoins.", "question": "Quels gaz sont pris en charge ?"}, {"answer": "Selon la configuration, il offre une capacité de charge comprise entre 100 kg et 180 kg.", "question": "Quelle est la capacité de charge ?"}, {"answer": "Certifié CE et conforme aux normes de fabrication des dispositifs médicaux ISO 13485.", "question": "Quelle est sa certification ?"}], "specs": [], "features": [{"icon": "sparkles", "text": "Prise en charge des lignes O2, Air médical, Vide et, sur demande, CO2.", "title": "Prise en charge multigaz"}, {"icon": "sparkles", "text": "Support de moniteur réglable à un angle ergonomique pour l'équipe chirurgicale.", "title": "Bras porte-moniteur"}, {"icon": "sparkles", "text": "Nombre suffisant de prises électriques avec terre pour plusieurs équipements chirurgicaux.", "title": "Grande capacité de prises"}, {"icon": "sparkles", "text": "Mécanisme de bras rotatif à haute capacité de charge et sans vibrations.", "title": "Structure de bras robuste"}], "useCases": [{"icon": "layers", "text": "Blocs opératoires de chirurgie générale"}, {"icon": "layers", "text": "Blocs opératoires d'orthopédie"}, {"icon": "layers", "text": "Unités de neurochirurgie"}, {"icon": "layers", "text": "Salles d'opération hybrides"}, {"icon": "layers", "text": "Hôpitaux universitaires"}], "advantages": ["Espace de travail dégagé et étendu autour de la table d'opération", "Gestion centralisée de tous les besoins en gaz et en électricité", "Options ergonomiques de support pour moniteur et éclairage", "Mécanisme de bras à haute capacité de charge et longue durée de vie", "Structure modulaire personnalisable selon les besoins"], "detailCards": [{"text": "Bras porte-moniteur facilement réglable selon le champ de vision de l'équipe chirurgicale.", "title": "Bras de moniteur ergonomique", "imageUrl": "/assets/images/products/cerrahi-pendant-detail-1.jpg"}, {"text": "Panneau de commande éclairé permettant une visualisation aisée des sorties de gaz et électriques.", "title": "Panneau de commande éclairé", "imageUrl": "/assets/images/products/cerrahi-pendant-detail-2.jpg"}, {"text": "Support de fixation pour éclairage chirurgical intégrable sur demande.", "title": "Support pour lampe chirurgicale", "imageUrl": ""}, {"text": "Revêtement extérieur lisse, facile à désinfecter.", "title": "Surface hygiénique", "imageUrl": ""}], "featureTiles": [{"text": "Les modules de gaz, de prises et de support peuvent être ajoutés selon les besoins.", "title": "Structure modulaire"}, {"text": "Mouvement fluide du bras grâce à un système de roulements sans vibrations.", "title": "Mouvement silencieux"}, {"text": "Maintenance rapide grâce à une structure interne facilement accessible.", "title": "Maintenance rapide"}], "heroSubtitle": "Système de support intégré pour l'environnement de la table d'opération", "heroDescription": "L'unité de bras plafonnier chirurgical Oxymed regroupe les sorties de gaz médicaux, les prises électriques ainsi que les points de support pour moniteur chirurgical et éclairage sur un seul bras rotatif, offrant un espace de travail dégagé et étendu autour de la table d'opération."}, "it": {"faq": [{"answer": "Può essere utilizzata in tutti i tipi di sale operatorie, in particolare per chirurgia generale, ortopedia, neurochirurgia e sale operatorie ibride.", "question": "In quali sale operatorie viene utilizzata l'unità pensile chirurgica?"}, {"answer": "Il braccio portamonitor è standard; la staffa per lampada chirurgica può essere aggiunta come optional su richiesta.", "question": "La staffa per monitor e illuminazione è fornita di serie?"}, {"answer": "Sono supportati di serie O2, Aria Medicale e Vuoto; in base alle necessità può essere aggiunta anche una linea CO2.", "question": "Quali gas sono supportati?"}, {"answer": "A seconda della configurazione, offre una capacità di carico compresa tra 100 kg e 180 kg.", "question": "Qual è la capacità di carico?"}, {"answer": "È certificata CE e conforme agli standard di produzione per dispositivi medici ISO 13485.", "question": "Qual è la certificazione?"}], "specs": [], "features": [{"icon": "sparkles", "text": "Supporto per linee O2, Aria Medicale, Vuoto e, su richiesta, CO2.", "title": "Supporto Multi-Gas"}, {"icon": "sparkles", "text": "Staffa portamonitor regolabile con angolazione ergonomica per l'équipe chirurgica.", "title": "Braccio Portamonitor"}, {"icon": "sparkles", "text": "Numero sufficiente di prese elettriche con messa a terra per molteplici dispositivi chirurgici.", "title": "Elevata Capacità di Prese"}, {"icon": "sparkles", "text": "Meccanismo a braccio rotante ad alta capacità di carico e privo di vibrazioni.", "title": "Struttura Robusta del Braccio"}], "useCases": [{"icon": "layers", "text": "Sale Operatorie di Chirurgia Generale"}, {"icon": "layers", "text": "Sale Operatorie di Ortopedia"}, {"icon": "layers", "text": "Unità di Neurochirurgia"}, {"icon": "layers", "text": "Sale Operatorie Ibride"}, {"icon": "layers", "text": "Ospedali Universitari"}], "advantages": ["Area di lavoro ampia e libera da ostacoli attorno al tavolo operatorio", "Gestione centralizzata di tutte le esigenze di gas ed elettricità", "Opzioni ergonomiche per il supporto di monitor e illuminazione", "Meccanismo del braccio ad alta capacità di carico e lunga durata", "Struttura modulare personalizzabile in base alle esigenze"], "detailCards": [{"text": "Braccio portamonitor facilmente regolabile in base al campo visivo dell'équipe chirurgica.", "title": "Braccio Portamonitor Ergonomico", "imageUrl": "/assets/images/products/cerrahi-pendant-detail-1.jpg"}, {"text": "Pannello di controllo illuminato che consente una chiara visualizzazione delle uscite gas ed elettriche.", "title": "Pannello di Controllo Illuminato", "imageUrl": "/assets/images/products/cerrahi-pendant-detail-2.jpg"}, {"text": "Staffa portante per illuminazione chirurgica integrabile su richiesta.", "title": "Staffa per Lampada Chirurgica", "imageUrl": ""}, {"text": "Rivestimento esterno liscio, facilmente disinfettabile.", "title": "Superficie Igienica", "imageUrl": ""}], "featureTiles": [{"text": "I moduli per gas, prese e supporti possono essere aggiunti in base alle esigenze.", "title": "Struttura Modulare"}, {"text": "Movimento fluido del braccio grazie al sistema di cuscinetti privo di vibrazioni.", "title": "Movimento Silenzioso"}, {"text": "Manutenzione rapida grazie alla struttura interna facilmente accessibile.", "title": "Assistenza Rapida"}], "heroSubtitle": "Sistema di Supporto Integrato per l'Area Attorno al Tavolo Operatorio", "heroDescription": "L'Unità Pensile Chirurgica Oxymed riunisce in un unico braccio rotante le uscite di gas medicali, le prese elettriche e i punti di supporto per monitor chirurgici e illuminazione, offrendo un'area di lavoro ampia e libera da ostacoli attorno al tavolo operatorio."}, "ka": {"faq": [{"answer": "გამოიყენება ყველა ტიპის საოპერაციოში, მათ შორის ზოგადი ქირურგიის, ორთოპედიის, ნეიროქირურგიისა და ჰიბრიდულ საოპერაციოებში.", "question": "რომელ საოპერაციოებში გამოიყენება ქირურგიული პენდანტის ბლოკი?"}, {"answer": "მონიტორის მკლავი სტანდარტულია; ქირურგიული სანათის სამაგრი მოთხოვნის შესაბამისად შეიძლება დაემატოს როგორც ოფცია.", "question": "მონიტორისა და განათების სამაგრები სტანდარტულად მოყვება?"}, {"answer": "სტანდარტულად მხარდაჭერილია O2, სამედიცინო ჰაერი და ვაკუუმი; საჭიროებისამებრ შეიძლება დაემატოს CO2 ხაზიც.", "question": "რომელი გაზებია მხარდაჭერილი?"}, {"answer": "კონფიგურაციის მიხედვით, ტვირთამწეობა 100 kg-დან 180 kg-მდეა.", "question": "რა არის ტვირთამწეობა?"}, {"answer": "აქვს CE სერტიფიკატი და შეესაბამება ISO 13485 სამედიცინო მოწყობილობების წარმოების სტანდარტებს.", "question": "რა სერტიფიკაცია აქვს?"}], "specs": [], "features": [{"icon": "sparkles", "text": "O2, სამედიცინო ჰაერის, ვაკუუმისა და მოთხოვნის შესაბამისად CO2 ხაზის მხარდაჭერა.", "title": "მრავალგაზიანი მხარდაჭერა"}, {"icon": "sparkles", "text": "ქირურგიული გუნდისთვის ერგონომიულ კუთხეზე რეგულირებადი მონიტორის სამაგრი.", "title": "მონიტორის საყრდენი მკლავი"}, {"icon": "sparkles", "text": "მრავალი ქირურგიული მოწყობილობისთვის საკმარისი რაოდენობის დამიწებული ელექტრო როზეტი.", "title": "როზეტების დიდი ტევადობა"}, {"icon": "sparkles", "text": "მაღალი ტვირთამწეობის, ვიბრაციის გარეშე მბრუნავი მკლავის მექანიზმი.", "title": "მტკიცე მკლავის კონსტრუქცია"}], "useCases": [{"icon": "layers", "text": "ზოგადი ქირურგიის საოპერაციოები"}, {"icon": "layers", "text": "ორთოპედიული საოპერაციოები"}, {"icon": "layers", "text": "ნეიროქირურგიის განყოფილებები"}, {"icon": "layers", "text": "ჰიბრიდული საოპერაციოები"}, {"icon": "layers", "text": "საუნივერსიტეტო საავადმყოფოები"}], "advantages": ["დაუბრკოლებელი, ფართო სამუშაო სივრცე საოპერაციო მაგიდის გარშემო", "გაზისა და ელექტროენერგიის ყველა საჭიროების ერთ წერტილში მართვა", "მონიტორისა და განათების ერგონომიული ტარების ვარიანტები", "მაღალი ტვირთამწეობის, ხანგრძლივი ექსპლუატაციის მკლავის მექანიზმი", "საჭიროების შესაბამისად მორგებადი მოდულური კონსტრუქცია"], "detailCards": [{"text": "მონიტორის საყრდენი მკლავი, რომელიც ადვილად რეგულირდება ქირურგიული გუნდის ხედვის კუთხის შესაბამისად.", "title": "ერგონომიული მონიტორის მკლავი", "imageUrl": "/assets/images/products/cerrahi-pendant-detail-1.jpg"}, {"text": "განათებული მართვის პანელი, რომელზეც გაზისა და ელექტრო გამოსასვლელები ადვილად ჩანს.", "title": "განათებული მართვის პანელი", "imageUrl": "/assets/images/products/cerrahi-pendant-detail-2.jpg"}, {"text": "მოთხოვნის შესაბამისად ინტეგრირებადი ქირურგიული განათების საყრდენი სამაგრი.", "title": "ქირურგიული სანათის სამაგრი", "imageUrl": ""}, {"text": "გლუვი გარე ზედაპირის საფარი, რომელიც ადვილად დეზინფიცირდება.", "title": "ჰიგიენური ზედაპირი", "imageUrl": ""}], "featureTiles": [{"text": "გაზის, როზეტისა და ტარების მოდულები შეიძლება დაემატოს საჭიროებისამებრ.", "title": "მოდულური კონსტრუქცია"}, {"text": "ვიბრაციის გარეშე საკისრების სისტემით მკლავის რბილი მოძრაობა.", "title": "უხმო მოძრაობა"}, {"text": "ადვილად მისაწვდომი შიდა კონსტრუქცია სწრაფი ტექნიკური მომსახურებისთვის.", "title": "სწრაფი სერვისი"}], "heroSubtitle": "ინტეგრირებული ტარების სისტემა საოპერაციო მაგიდის გარშემო", "heroDescription": "Oxymed ქირურგიული პენდანტის ბლოკი აერთიანებს სამედიცინო გაზის გამოსასვლელებს, ელექტრო როზეტებს, ქირურგიული მონიტორისა და განათების სამაგრ წერტილებს ერთ მბრუნავ მკლავში და უზრუნველყოფს ფართო, დაუბრკოლებელ სამუშაო სივრცეს საოპერაციო მაგიდის გარშემო."}, "ru": {"faq": [{"answer": "Может использоваться во всех типах операционных, прежде всего в операционных общей хирургии, ортопедии, нейрохирургии и гибридных операционных.", "question": "В каких операционных используется хирургическая консольная система?"}, {"answer": "Кронштейн для монитора входит в стандартную комплектацию; кронштейн для хирургического светильника может быть добавлен опционально по запросу.", "question": "Кронштейны для монитора и освещения входят в стандартную комплектацию?"}, {"answer": "Стандартно поддерживаются O2, медицинский воздух и вакуум; при необходимости также может быть добавлена линия CO2.", "question": "Какие газы поддерживаются?"}, {"answer": "В зависимости от конфигурации обеспечивает грузоподъемность от 100 kg до 180 kg.", "question": "Какова грузоподъемность?"}, {"answer": "Имеет сертификат CE и соответствует стандартам производства медицинских изделий ISO 13485.", "question": "Какова сертификация?"}], "specs": [], "features": [{"icon": "sparkles", "text": "Поддержка линий O2, медицинского воздуха, вакуума и, по запросу, CO2.", "title": "Поддержка нескольких газов"}, {"icon": "sparkles", "text": "Кронштейн для монитора с регулировкой под эргономичным углом для хирургической бригады.", "title": "Кронштейн для монитора"}, {"icon": "sparkles", "text": "Достаточное количество электрических розеток с заземлением для нескольких хирургических устройств.", "title": "Большое количество розеток"}, {"icon": "sparkles", "text": "Поворотный механизм консоли с высокой грузоподъемностью и без вибрации.", "title": "Прочная конструкция консоли"}], "useCases": [{"icon": "layers", "text": "Операционные общей хирургии"}, {"icon": "layers", "text": "Операционные ортопедии"}, {"icon": "layers", "text": "Нейрохирургические отделения"}, {"icon": "layers", "text": "Гибридные операционные"}, {"icon": "layers", "text": "Университетские больницы"}], "advantages": ["Свободное и просторное рабочее пространство вокруг операционного стола", "Управление всеми потребностями в газоснабжении и электропитании из одной точки", "Эргономичные варианты крепления монитора и освещения", "Долговечный консольный механизм с высокой грузоподъемностью", "Модульная конструкция с возможностью индивидуальной конфигурации"], "detailCards": [{"text": "Кронштейн для монитора, легко регулируемый в соответствии с углом обзора хирургической бригады.", "title": "Эргономичный кронштейн для монитора", "imageUrl": "/assets/images/products/cerrahi-pendant-detail-1.jpg"}, {"text": "Панель управления с подсветкой, обеспечивающая удобную видимость газовых и электрических выходов.", "title": "Панель управления с подсветкой", "imageUrl": "/assets/images/products/cerrahi-pendant-detail-2.jpg"}, {"text": "Кронштейн для хирургического светильника, который может быть интегрирован по запросу.", "title": "Кронштейн для хирургического светильника", "imageUrl": ""}, {"text": "Гладкое наружное покрытие, легко поддающееся дезинфекции.", "title": "Гигиеничная поверхность", "imageUrl": ""}], "featureTiles": [{"text": "Газовые, электрические и несущие модули могут добавляться в соответствии с потребностями.", "title": "Модульная конструкция"}, {"text": "Плавное перемещение консоли благодаря безвибрационной подшипниковой системе.", "title": "Бесшумное движение"}, {"text": "Быстрое техническое обслуживание благодаря легкодоступной внутренней конструкции.", "title": "Быстрый сервис"}], "heroSubtitle": "Интегрированная несущая система для зоны вокруг операционного стола", "heroDescription": "Хирургическая консольная система Oxymed объединяет выходы медицинских газов, электрические розетки, точки крепления хирургического монитора и освещения на одной поворотной консоли, обеспечивая просторную и свободную рабочую зону вокруг операционного стола."}}, "features": [{"icon": "sparkles", "text": "O2, Medikal Hava, Vakum ve talebe göre CO2 hattı desteği.", "title": "Çoklu Gaz Desteği"}, {"icon": "sparkles", "text": "Cerrahi ekip için ergonomik açıda ayarlanabilir monitör braketi.", "title": "Monitör Taşıma Kolu"}, {"icon": "sparkles", "text": "Çoklu cerrahi cihaz için yeterli sayıda topraklı elektrik prizi.", "title": "Geniş Priz Kapasitesi"}, {"icon": "sparkles", "text": "Yüksek yük kapasiteli, titreşimsiz döner kol mekanizması.", "title": "Sağlam Kol Yapısı"}], "useCases": [{"icon": "layers", "text": "Genel Cerrahi Ameliyathaneleri"}, {"icon": "layers", "text": "Ortopedi Ameliyathaneleri"}, {"icon": "layers", "text": "Beyin Cerrahisi Üniteleri"}, {"icon": "layers", "text": "Hibrit Ameliyat Odaları"}, {"icon": "layers", "text": "Üniversite Hastaneleri"}], "advantages": ["Ameliyat masası çevresinde engelsiz, geniş çalışma alanı", "Tüm gaz ve elektrik ihtiyaçlarının tek noktadan yönetimi", "Ergonomik monitör ve aydınlatma taşıma seçenekleri", "Yüksek yük kapasiteli, uzun ömürlü kol mekanizması", "İhtiyaca göre özelleştirilebilir modüler yapı"], "detailCards": [{"text": "Cerrahi ekibin görüş açısına göre kolayca ayarlanabilen monitör taşıma kolu.", "title": "Ergonomik Monitör Kolu", "imageUrl": "/assets/images/products/cerrahi-pendant-detail-1.jpg"}, {"text": "Gaz ve elektrik çıkışlarının kolay görülebildiği aydınlatmalı kontrol paneli.", "title": "Aydınlatmalı Kontrol Paneli", "imageUrl": "/assets/images/products/cerrahi-pendant-detail-2.jpg"}, {"text": "Talebe göre entegre edilebilen cerrahi aydınlatma taşıma braketi.", "title": "Cerrahi Lamba Braketi", "imageUrl": ""}, {"text": "Kolay dezenfekte edilebilen, pürüzsüz dış yüzey kaplaması.", "title": "Hijyenik Yüzey", "imageUrl": ""}], "featureTiles": [{"text": "Gaz, priz ve taşıma modülleri ihtiyaca göre eklenebilir.", "title": "Modüler Yapı"}, {"text": "Titreşimsiz rulman sistemi ile yumuşak kol hareketi.", "title": "Sessiz Hareket"}, {"text": "Kolay erişilebilir iç yapı ile hızlı bakım imkanı.", "title": "Hızlı Servis"}], "heroSubtitle": "Ameliyat Masası Çevresi İçin Entegre Taşıma Sistemi", "sectionOrder": ["detailCards", "technical", "useCases", "featureTiles", "faq"], "hiddenSections": [], "heroDescription": "Oxymed Cerrahi Pendant Ünitesi; medikal gaz çıkışlarını, elektrik prizlerini, cerrahi monitör ve aydınlatma taşıma noktalarını tek bir döner kolda birleştirerek ameliyat masası çevresinde geniş ve engelsiz bir çalışma alanı sunar.", "templateVersion": 1}	{"materials": []}	Cerrahi Pendant Ünitesi	["O2 / Hava / Vakum çıkışları", "Monitör taşıma kolu", "Geniş priz kapasitesi"]	OXM-CPU-100	/assets/images/products/cerrahi-pendant-hero.jpg	ADET	\N	Surgical Pendant Unit	Chirurgie-Pendantsystem	Système de pendant chirurgical	Sistema pensile chirurgico	وحدة بندانت جراحية	Хирургическая консоль	پندانت جراحی	ქირურგიული პენდანტი	Хирургична конзола	Cərrahi pendant sistemi	f	3	\N
6	5	Kat Kontrol Panosu	Hastane ve klinikler için EN ISO 7396-1 standartlarında üretilmiş, modüler yapıda tıbbi gaz dağıtım kontrol panelleri.	/api/storage/public-objects/objects/uploads/d3ce89b5-5c4f-4088-a23b-58542dba72ca	[{"label": "Standart", "value": "EN ISO 7396-1"}, {"label": "Gaz Türleri", "value": "O₂, N₂O, Med. Hava, Vakum, CO₂"}, {"label": "Çalışma Basıncı", "value": "0 – 16 bar"}, {"label": "Alarm Çıkışı", "value": "Kuru kontak röle (NO/NC)"}, {"label": "Gövde Malzemesi", "value": "316L Paslanmaz Çelik"}, {"label": "Bağlantı", "value": "DISS / NIST"}, {"label": "Boyutlar", "value": "600 × 400 × 150 mm (standart)"}, {"label": "Ağırlık", "value": "Yaklaşık 18 kg"}, {"label": "Sertifikasyon", "value": "CE, TSE"}]	10	t	2026-05-24 13:28:49.761391+00	2026-08-17 20:20:45.952+00	kat-kontrol-panosu	{"faq": [{"answer": "Standart modeller 3 ve 5 gazlı konfigürasyonlarda sunulmaktadır.", "question": "Kaç farklı gaz türü için kurulum yapılabilir?"}, {"answer": "Evet. Farklı boru çapı adaptörlerimiz ile mevcut altyapıya kolayca entegre edilmektedir.", "question": "Mevcut tesisat altyapısına uyumlu mu?"}, {"answer": "Standart kurulum ortalama 4–8 saat içinde tamamlanmaktadır.", "question": "Kurulum süresi ne kadar?"}, {"answer": "2 yıl resmi garanti, yıllık bakım sözleşmeleri mevcuttur.", "question": "Bakım süresi ve garantisi nedir?"}, {"answer": "EN ISO 7396-1, HTM 02-01 ve TSE standartlarına uygundur. CE işaretlidir.", "question": "Ürünler hangi standartlara uygundur?"}], "features": [{"text": "EN ISO 7396-1 standardına uygun güvenli gaz dağıtımı", "title": "Yüksek Güvenlik"}, {"text": "Dijital manometreler ile anlık basınç izleme", "title": "Akıllı Kontrol"}, {"text": "Sesli ve görsel alarm bildirimleri", "title": "Alarm Sistemi"}, {"text": "Modüler yapı, hızlı kurulum ve servis", "title": "Kolay Montaj"}], "useCases": ["Hastane klinikleri ve servis odaları", "Ameliyathaneler", "Yoğun bakım üniteleri", "Acil servisler", "Endoskopi ve DSA üniteleri"], "advantages": ["EN ISO 7396-1 ve HTM 02-01 standartlarına tam uyum", "Modüler tasarım sayesinde esnek konfigürasyon", "7/24 teknik destek ve yedek parça garantisi", "10 yıl yedek parça stok taahhüdü", "CE işaretli bileşenler"], "detailCards": [{"text": "Oksijen, hava ve vakum hatları için DISS/NIST standart hızlı bağlantı sistemleri.", "title": "Gaz Bağlantı Ünitesi", "imageUrl": ""}, {"text": "Dijital manometreler, alarm röleleri ve zon izolasyon valfleri entegre edilmiştir.", "title": "Akıllı Kontrol Paneli", "imageUrl": ""}, {"text": "316L paslanmaz çelik gövde, hastane sterilizasyon prosedürlerine uyumlu.", "title": "Dayanıklı Yapı", "imageUrl": ""}], "featureTiles": [{"text": "O₂, N₂O, Hava, Vakum, CO₂ hatları tek panelde yönetilir.", "title": "Çoklu Gaz Desteği"}, {"text": "Gerçek zamanlı basınç görüntüleme ve kayıt.", "title": "Dijital İzleme"}, {"text": "Zon bazlı sesli/görsel alarmlar, merkezi alarm sistemine entegre.", "title": "Alarm Yönetimi"}, {"text": "Çıkarılabilir modüller sayesinde sahada hızlı servis.", "title": "Kolay Bakım"}], "heroSubtitle": "3 Gazlı", "heroDescription": "Hastane ve klinikler için EN ISO 7396-1 standartlarında üretilmiş, modüler yapıda tıbbi gaz dağıtım kontrol panelleri. Güvenli, izlenebilir ve alarm özellikli çözümler."}	{"materials": []}	Kat Kontrol Panosu - 3 Gazlı Tıbbi Gaz Dağıtım Sistemi	["EN ISO 7396-1 uyumlu", "3 gaz hattı (O₂, Med. Hava, Vakum)", "Dijital manometre + alarm sistemi", "Paslanmaz çelik gövde", "CE sertifikalı"]	KKP-3G-001	\N	ADET		Gas Control Panel	Gassteuerungspanel	Panneau de contrôle des gaz	Pannello di controllo dei gas	لوحة التحكم بالغاز	Панель управления медицинскими газами	پنل کنترل گاز	გაზის კონტროლის პანელი	Панел за управление на газа	Qaz idarəetmə paneli	t	4	\N
12	6	Dental Vakum Sistemi	\N	/api/storage/public-objects/objects/uploads/a1fb9457-0860-4b65-a5b6-69fdd2154def	[]	22	t	2026-08-13 08:34:28.975701+00	2026-08-17 20:21:54.34+00	dental-vakum-sistemi	{}	{}	\N	[]	\N	\N	\N	\N	Dental Vacuum System	Dental-Vakuumsystem	Système d’aspiration dentaire	Sistema di aspirazione dentale	نظام تفريغ للأسنان	Стоматологическая вакуумная система	سیستم وکیوم دندان‌پزشکی	დენტალური ვაკუუმ-სისტემა	Дентална вакуумна система	Dental Vakuum Sistemi	t	3	\N
10	6	Amalgam Separatörü	\N	/api/storage/public-objects/objects/uploads/64a70581-27d4-4551-9e65-d5d95e14c22d	[]	20	t	2026-08-13 08:34:28.883212+00	2026-08-13 09:09:50.487+00	amalgam-separator	{}	{}	\N	[]	\N	\N	\N	\N	Amalgam Separator	Amalgamabscheider	Séparateur d’amalgame	Separatore di amalgama	فاصل الأملغم	Сепаратор амальгамы	جداکننده آمالگام	ამალგამის სეპარატორი	Сепаратор за амалгама	Amalqam Separatoru	f	1	\N
11	6	Medikal Vakum Santrali	\N	/api/storage/public-objects/objects/uploads/283fd90b-7501-4087-a217-2685b27ec45d	[]	21	t	2026-08-13 08:34:28.970386+00	2026-08-17 20:21:50.761+00	dental-vakum-pompasi	{}	{}	\N	[]	\N	\N	\N	\N	Medical Vacuum Plant	Medizinische Vakuumzentrale	Centrale de vide médical	Centrale del vuoto medicale	محطة التفريغ الطبي	Медицинская вакуумная станция	ایستگاه وکیوم پزشکی	სამედიცინო ვაკუუმის სადგური	Медицинска вакуумна станция	Tibbi vakuum stansiyası	t	2	\N
9	2	Yoğun Bakım Pendant Ünitesi	Yoğun bakım yatak başında medikal gaz, elektrik, monitör ve infüzyon pompası taşıma ihtiyaçlarını tek kolonda toplayan pendant sistemi.	/assets/images/products/icu-pendant-hero.jpg	[{"label": "Ürün Adı", "value": "Yoğun Bakım Pendant Ünitesi"}, {"label": "Kullanım Alanı", "value": "Yoğun Bakım Ünitesi (YBÜ)"}, {"label": "Gaz Çıkışları", "value": "O2, Medikal Hava, Vakum"}, {"label": "Elektrik Çıkışı", "value": "8-12 adet topraklı priz"}, {"label": "Kol Tipi", "value": "Dikey kolon / Tek kollu, 300° dönüş"}, {"label": "Yük Kapasitesi", "value": "60 - 120 kg"}, {"label": "Ekipman Rafı", "value": "İnfüzyon pompası rayı, monitör rafı"}, {"label": "Gövde Malzemesi", "value": "Elektrostatik boyalı alüminyum / paslanmaz çelik"}, {"label": "Uygunluk", "value": "CE, ISO 13485 üretim standartlarına uygun"}]	9	f	2026-08-03 07:21:53.451859+00	2026-08-17 20:22:45.983+00	yogun-bakim-pendant-unitesi	{"faq": [{"answer": "İnfüzyon pompaları, enjektör pompaları, hasta başı monitörü ve benzeri yoğun bakım cihazlarını standart raylar üzerinde taşıyabilir.", "question": "Yoğun bakım pendant ünitesi hangi cihazları taşıyabilir?"}, {"answer": "Standart konfigürasyonda O2, Medikal Hava ve Vakum çıkışları bulunur; ihtiyaca göre çıkış sayısı artırılabilir.", "question": "Kaç adet gaz çıkışı bulunur?"}, {"answer": "Yatak başına dikey kolon veya tavan tipi hareketli kol olarak monte edilebilir.", "question": "Montaj tipi nedir?"}, {"answer": "Standart DIN ray sistemi sayesinde çoğu marka infüzyon pompası ve monitör braketi ile uyumludur.", "question": "Farklı marka pompa ve monitörlerle uyumlu mudur?"}, {"answer": "CE belgeli olup ISO 13485 medikal cihaz üretim standartlarına uygun olarak üretilmektedir.", "question": "Hangi standartlara uygundur?"}], "specs": [{"label": "Ürün Adı", "value": "Yoğun Bakım Pendant Ünitesi"}, {"label": "Kullanım Alanı", "value": "Yoğun Bakım Ünitesi (YBÜ)"}, {"label": "Gaz Çıkışları", "value": "O2, Medikal Hava, Vakum"}, {"label": "Elektrik Çıkışı", "value": "8-12 adet topraklı priz"}, {"label": "Kol Tipi", "value": "Dikey kolon / Tek kollu, 300° dönüş"}, {"label": "Yük Kapasitesi", "value": "60 - 120 kg"}, {"label": "Ekipman Rafı", "value": "İnfüzyon pompası rayı, monitör rafı"}, {"label": "Gövde Malzemesi", "value": "Elektrostatik boyalı alüminyum / paslanmaz çelik"}, {"label": "Uygunluk", "value": "CE, ISO 13485 üretim standartlarına uygun"}], "locales": {"ar": {"faq": [{"answer": "يمكنها حمل مضخات التسريب، ومضخات الحقن، وشاشة مراقبة المريض وغيرها من أجهزة العناية المركزة على القضبان القياسية.", "question": "ما الأجهزة التي يمكن لوحدة البندانت للعناية المركزة حملها؟"}, {"answer": "تتضمن التهيئة القياسية مخارج O2 والهواء الطبي والشفط؛ ويمكن زيادة عدد المخارج حسب الحاجة.", "question": "كم عدد مخارج الغازات المتوفرة؟"}, {"answer": "يمكن تركيبها كعمود رأسي بجانب السرير أو كذراع متحرك مثبت في السقف.", "question": "ما نوع التركيب؟"}, {"answer": "بفضل نظام قضبان DIN القياسي، فهي متوافقة مع معظم ماركات مضخات التسريب وحوامل الشاشات.", "question": "هل هي متوافقة مع المضخات والشاشات من ماركات مختلفة؟"}, {"answer": "حاصلة على شهادة CE ومصنّعة وفقًا لمعايير تصنيع الأجهزة الطبية ISO 13485.", "question": "ما المعايير التي تتوافق معها؟"}], "specs": [], "features": [{"icon": "sparkles", "text": "عدد كافٍ من نقاط الخروج لـ O2 والهواء الطبي والشفط.", "title": "مخارج غازات متعددة"}, {"icon": "sparkles", "text": "نظام قضبان قياسي يحمل بأمان عدة مضخات تسريب وحقن.", "title": "قضيب مضخة التسريب"}, {"icon": "sparkles", "text": "منصة حمل متينة وقابلة للضبط لشاشة مراقبة المريض.", "title": "رف الشاشة"}, {"icon": "sparkles", "text": "عدد كافٍ من مقابس الكهرباء المؤرضة لأجهزة العناية المركزة.", "title": "مجموعة مقابس واسعة"}], "useCases": [{"icon": "layers", "text": "وحدات العناية المركزة"}, {"icon": "layers", "text": "العناية المركزة القلبية"}, {"icon": "layers", "text": "العناية المركزة لحديثي الولادة"}, {"icon": "layers", "text": "مناطق الرعاية الحرجة في قسم الطوارئ"}, {"icon": "layers", "text": "غرف العزل"}], "advantages": ["ترتيب منظم وسهل الوصول إليه للمعدات بجانب السرير", "حل احتياجات الغاز والكهرباء وحمل الأجهزة ضمن عمود واحد", "التوافق مع المضخات والشاشات من ماركات مختلفة عبر القضبان القياسية", "طلاء سطحي متين وصحي", "عدد المخارج والرفوف قابل للتخصيص حسب الحاجة"], "detailCards": [{"text": "نظام حمل مزود بقضيب DIN قياسي ومناسب لتركيب عدة مضخات.", "title": "قضيب مضخة التسريب", "imageUrl": "/assets/images/products/icu-pendant-detail-1.jpg"}, {"text": "مخارج غازات سهلة الوصول ورف للمعدات في وحدة واحدة.", "title": "لوحة مخارج الغازات والرف", "imageUrl": "/assets/images/products/icu-pendant-detail-2.jpg"}, {"text": "هيكل عمود رأسي متين يستخدم مساحة جانب السرير بكفاءة.", "title": "تصميم العمود الرأسي", "imageUrl": ""}, {"text": "طلاء خارجي أملس يمكن تطهيره بسهولة.", "title": "سطح صحي", "imageUrl": ""}], "featureTiles": [{"text": "يمكن إضافة وحدات الغاز والمقابس والرفوف حسب الحاجة.", "title": "هيكل معياري"}, {"text": "مكونات متينة للاستخدام المكثف على مدار 7/24.", "title": "هيكل طويل العمر"}, {"text": "إمكانية تحقيق النظافة بسرعة بفضل الأسطح الملساء.", "title": "سهولة التنظيف"}], "heroSubtitle": "عمود متكامل للغازات والكهرباء والمعدات بجانب السرير", "heroDescription": "توفر وحدة البندانت للعناية المركزة من Oxymed لفريق تمريض العناية المركزة إمكانية وصول منظمة وسريعة، من خلال دمج مخارج الغازات الطبية ومقابس الكهرباء ورف الشاشة وقضيب حمل مضخة التسريب ضمن عمود رأسي واحد."}, "az": {"faq": [{"answer": "İnfuziya pompalarını, şpris pompalarını, xəstəbaşı monitorunu və oxşar reanimasiya cihazlarını standart relslər üzərində daşıya bilər.", "question": "Reanimasiya pendant qurğusu hansı cihazları daşıya bilər?"}, {"answer": "Standart konfiqurasiyada O2, Tibbi Hava və Vakuum çıxışları mövcuddur; ehtiyaca uyğun olaraq çıxışların sayı artırıla bilər.", "question": "Neçə ədəd qaz çıxışı mövcuddur?"}, {"answer": "Hər çarpayının yanında şaquli kolon və ya tavana quraşdırılan hərəkətli qol görnüşündə montaj edilə bilər.", "question": "Montaj növü nədir?"}, {"answer": "Standart DIN rels sistemi sayəsində əksər markaların infuziya pompaları və monitor kronşteynləri ilə uyğundur.", "question": "Müxtəlif marka pompa və monitorlarla uyğundurmu?"}, {"answer": "CE sertifikatlıdır və ISO 13485 tibbi cihaz istehsalı standartlarına uyğun istehsal olunur.", "question": "Hansı standartlara uyğundur?"}], "specs": [], "features": [{"icon": "sparkles", "text": "O2, Tibbi Hava və Vakuum üçün kifayət sayda çıxış nöqtəsi.", "title": "Çoxsaylı Qaz Çıxışı"}, {"icon": "sparkles", "text": "Bir neçə infuziya və şpris pompasını təhlükəsiz daşıyan standart rels sistemi.", "title": "İnfuziya Pompası Relsi"}, {"icon": "sparkles", "text": "Xəstəbaşı monitoru üçün möhkəm və tənzimlənə bilən daşıyıcı platforma.", "title": "Monitor Rəfi"}, {"icon": "sparkles", "text": "Reanimasiya cihazları üçün kifayət sayda torpaqlamalı elektrik rozetkası.", "title": "Geniş Rozetka Qrupu"}], "useCases": [{"icon": "layers", "text": "Reanimasiya Bölmələri"}, {"icon": "layers", "text": "Koronar Reanimasiya"}, {"icon": "layers", "text": "Yenidoğulmuşların Reanimasiyası"}, {"icon": "layers", "text": "Təcili Yardım Xidmətinin Kritik Baxım Sahələri"}, {"icon": "layers", "text": "İzolyasiya Otaqları"}], "advantages": ["Çarpayı yanında nizamlı və sürətli əlçatan avadanlıq yerləşdirilməsi", "Qaz, elektrik və cihaz daşıma ehtiyacının bir kolonda həlli", "Standart relslər vasitəsilə müxtəlif marka pompa və monitorlarla uyğunluq", "Davamlı və gigiyenik səth örtüyü", "Ehtiyaca uyğun fərdiləşdirilə bilən çıxış və rəf sayı"], "detailCards": [{"text": "Standart DIN relsli, çoxsaylı pompa montajı üçün uyğun daşıma sistemi.", "title": "İnfuziya Pompası Relsi", "imageUrl": "/assets/images/products/icu-pendant-detail-1.jpg"}, {"text": "Asan əlçatan qaz çıxışları və avadanlıq rəfi bir yerdə.", "title": "Qaz Çıxış Paneli və Rəf", "imageUrl": "/assets/images/products/icu-pendant-detail-2.jpg"}, {"text": "Çarpayıbaşı sahədən səmərəli istifadə edən möhkəm şaquli kolon quruluşu.", "title": "Şaquli Kolon Dizaynı", "imageUrl": ""}, {"text": "Asan dezinfeksiya edilə bilən, hamar xarici səth örtüyü.", "title": "Gigiyenik Səth", "imageUrl": ""}], "featureTiles": [{"text": "Qaz, rozetka və rəf modulları ehtiyaca uyğun əlavə edilə bilər.", "title": "Modul Quruluş"}, {"text": "24/7 intensiv istifadəyə davamlı komponentlər.", "title": "Uzunömürlü Quruluş"}, {"text": "Hamar səthlər sayəsində sürətli gigiyena təmin etmə imkanı.", "title": "Asan Təmizləmə"}], "heroSubtitle": "Çarpayıbaşı üçün İnteqrə Edilmiş Qaz, Elektrik və Avadanlıq Kolonu", "heroDescription": "Oxymed Reanimasiya Pendant Qurğusu; tibbi qaz çıxışlarını, elektrik rozetkalarını, monitor rəfini və infuziya pompası daşıma relsini vahid şaquli kolonda birləşdirərək reanimasiya tibb bacısı heyətinə nizamlı və sürətli əlçatanlıq imkanı yaradır."}, "bg": {"faq": [{"answer": "Може да носи инфузионни помпи, спринцовкови помпи, пациентски монитори и подобна апаратура за интензивно лечение върху стандартни релси.", "question": "Какви устройства може да носи пендантният модул за интензивно лечение?"}, {"answer": "Стандартната конфигурация включва изводи за O2, медицински въздух и вакуум; броят на изводите може да се увеличи според нуждите.", "question": "Колко газови извода има?"}, {"answer": "Може да се монтира като вертикална колона до леглото или като таванна подвижна конзола.", "question": "Какъв е типът монтаж?"}, {"answer": "Благодарение на стандартната DIN релсова система е съвместим с инфузионни помпи и конзоли за монитори на повечето марки.", "question": "Съвместим ли е с помпи и монитори от различни марки?"}, {"answer": "Притежава CE сертификат и се произвежда в съответствие със стандартите за производство на медицински изделия ISO 13485.", "question": "На кои стандарти отговаря?"}], "specs": [], "features": [{"icon": "sparkles", "text": "Достатъчен брой изводи за O2, медицински въздух и вакуум.", "title": "Множество газови изводи"}, {"icon": "sparkles", "text": "Стандартна релсова система за безопасно носене на множество инфузионни и спринцовкови помпи.", "title": "Релса за инфузионни помпи"}, {"icon": "sparkles", "text": "Здрава и регулируема платформа за монтиране на пациентски монитор.", "title": "Рафт за монитор"}, {"icon": "sparkles", "text": "Достатъчен брой заземени електрически контакти за оборудване за интензивно лечение.", "title": "Разширен контактен блок"}], "useCases": [{"icon": "layers", "text": "Отделения за интензивно лечение"}, {"icon": "layers", "text": "Коронарни интензивни отделения"}, {"icon": "layers", "text": "Неонатални интензивни отделения"}, {"icon": "layers", "text": "Зони за критични грижи в спешното отделение"}, {"icon": "layers", "text": "Изолационни стаи"}], "advantages": ["Организирано и бързо достъпно разположение на оборудването до леглото", "Решение за нуждите от газ, електричество и носеща система за апаратура в една колона", "Съвместимост с помпи и монитори от различни марки чрез стандартни релси", "Издръжливо и хигиенично повърхностно покритие", "Персонализируем брой изводи и рафтове според нуждите"], "detailCards": [{"text": "Носеща система със стандартна DIN релса, подходяща за монтаж на множество помпи.", "title": "Релса за инфузионни помпи", "imageUrl": "/assets/images/products/icu-pendant-detail-1.jpg"}, {"text": "Леснодостъпни газови изводи и рафт за оборудване в едно.", "title": "Панел с газови изводи и рафт", "imageUrl": "/assets/images/products/icu-pendant-detail-2.jpg"}, {"text": "Здрава конструкция с вертикална колона, която използва ефективно пространството до леглото.", "title": "Дизайн с вертикална колона", "imageUrl": ""}, {"text": "Гладко външно повърхностно покритие, което се дезинфекцира лесно.", "title": "Хигиенична повърхност", "imageUrl": ""}], "featureTiles": [{"text": "Модули за газове, контакти и рафтове могат да се добавят според нуждите.", "title": "Модулна конструкция"}, {"text": "Компоненти, устойчиви на интензивна употреба 7/24.", "title": "Дълготрайна конструкция"}, {"text": "Възможност за бързо поддържане на хигиена чрез гладки повърхности.", "title": "Лесно почистване"}], "heroSubtitle": "Интегрирана колона за газове, електричество и оборудване до леглото", "heroDescription": "Пендaнтният модул за интензивно лечение Oxymed обединява изводи за медицински газове, електрически контакти, рафт за монитор и релса за носене на инфузионни помпи в една вертикална колона, осигурявайки на сестринския екип в интензивното отделение организиран и бърз достъп."}, "de": {"faq": [{"answer": "Kann Infusionspumpen, Spritzenpumpen, Patientenmonitore und ähnliche Intensivpflegegeräte auf Standardschienen aufnehmen.", "question": "Welche Geräte kann die Intensivpflege-Pendanteinheit aufnehmen?"}, {"answer": "In der Standardkonfiguration sind O2-, medizinische Luft- und Vakuumanschlüsse vorhanden; die Anzahl der Anschlüsse kann bedarfsgerecht erhöht werden.", "question": "Wie viele Gasauslässe sind vorhanden?"}, {"answer": "Kann als vertikale Säule am Bettplatz oder als deckenmontierter Schwenkarm installiert werden.", "question": "Welche Montageart ist möglich?"}, {"answer": "Dank des Standard-DIN-Schienensystems mit Infusionspumpen und Monitorhalterungen der meisten Marken kompatibel.", "question": "Ist die Einheit mit Pumpen und Monitoren verschiedener Marken kompatibel?"}, {"answer": "CE-zertifiziert und gemäß den ISO 13485-Produktionsstandards für Medizinprodukte gefertigt.", "question": "Welchen Standards entspricht die Einheit?"}], "specs": [], "features": [{"icon": "sparkles", "text": "Ausreichende Anzahl an Entnahmestellen für O2, medizinische Luft und Vakuum.", "title": "Mehrfach-Gasauslässe"}, {"icon": "sparkles", "text": "Standard-Schienensystem zur sicheren Aufnahme mehrerer Infusions- und Spritzenpumpen.", "title": "Infusionspumpenschiene"}, {"icon": "sparkles", "text": "Stabile und verstellbare Trägerplattform für Patientenmonitore.", "title": "Monitorablage"}, {"icon": "sparkles", "text": "Ausreichende Anzahl an Schutzkontaktsteckdosen für Intensivpflegegeräte.", "title": "Umfangreiche Steckdosengruppe"}], "useCases": [{"icon": "layers", "text": "Intensivstationen"}, {"icon": "layers", "text": "Kardiologische Intensivstationen"}, {"icon": "layers", "text": "Neonatologische Intensivstationen"}, {"icon": "layers", "text": "Kritische Versorgungsbereiche der Notaufnahme"}, {"icon": "layers", "text": "Isolierzimmer"}], "advantages": ["Übersichtliche und schnell zugängliche Geräteanordnung am Bettplatz", "Integration von Gas-, Strom- und Geräteaufnahmeanforderungen in einer Säule", "Kompatibilität mit Pumpen und Monitoren verschiedener Marken durch Standardschienen", "Robuste und hygienische Oberflächenbeschichtung", "Bedarfsgerecht anpassbare Anzahl von Anschlüssen und Ablagen"], "detailCards": [{"text": "Trägersystem mit Standard-DIN-Schiene, geeignet für die Montage mehrerer Pumpen.", "title": "Infusionspumpenschiene", "imageUrl": "/assets/images/products/icu-pendant-detail-1.jpg"}, {"text": "Leicht zugängliche Gasauslässe und Geräteablage in einer Einheit.", "title": "Gasauslasspanel und Ablage", "imageUrl": "/assets/images/products/icu-pendant-detail-2.jpg"}, {"text": "Robuste vertikale Säulenkonstruktion für eine effiziente Nutzung des Bettplatzbereichs.", "title": "Vertikales Säulendesign", "imageUrl": ""}, {"text": "Glatte Außenflächenbeschichtung zur einfachen Desinfektion.", "title": "Hygienische Oberfläche", "imageUrl": ""}], "featureTiles": [{"text": "Gas-, Steckdosen- und Ablagemodule können bedarfsgerecht ergänzt werden.", "title": "Modulare Bauweise"}, {"text": "Komponenten für den dauerhaften 24/7-Intensiveinsatz.", "title": "Langlebige Konstruktion"}, {"text": "Glatte Oberflächen ermöglichen eine schnelle hygienische Reinigung.", "title": "Einfache Reinigung"}], "heroSubtitle": "Integrierte Gas-, Strom- und Gerätesäule für den Bettplatz", "heroDescription": "Die Oxymed Intensivpflege-Pendanteinheit vereint medizinische Gasauslässe, Steckdosen, Monitorablage und Trägerschiene für Infusionspumpen in einer einzigen vertikalen Säule und ermöglicht dem Intensivpflegepersonal einen übersichtlichen und schnellen Zugriff."}, "en": {"faq": [{"answer": "It can support infusion pumps, syringe pumps, bedside monitors, and similar intensive care devices on standard rails.", "question": "Which devices can the intensive care pendant unit support?"}, {"answer": "The standard configuration includes O2, Medical Air, and Vacuum outlets; the number of outlets can be increased as required.", "question": "How many gas outlets are available?"}, {"answer": "It can be installed as a bedhead vertical column or as a ceiling-mounted articulated arm.", "question": "What is the installation type?"}, {"answer": "Thanks to the standard DIN rail system, it is compatible with most brands of infusion pumps and monitor brackets.", "question": "Is it compatible with different brands of pumps and monitors?"}, {"answer": "It is CE certified and manufactured in compliance with ISO 13485 medical device manufacturing standards.", "question": "Which standards does it comply with?"}], "specs": [], "features": [{"icon": "sparkles", "text": "Sufficient number of outlet points for O2, Medical Air, and Vacuum.", "title": "Multiple Gas Outlets"}, {"icon": "sparkles", "text": "Standard rail system that securely supports multiple infusion and syringe pumps.", "title": "Infusion Pump Rail"}, {"icon": "sparkles", "text": "Robust and adjustable support platform for bedside monitors.", "title": "Monitor Shelf"}, {"icon": "sparkles", "text": "Sufficient number of grounded electrical sockets for intensive care equipment.", "title": "Extensive Socket Group"}], "useCases": [{"icon": "layers", "text": "Intensive Care Units"}, {"icon": "layers", "text": "Coronary Intensive Care"}, {"icon": "layers", "text": "Neonatal Intensive Care"}, {"icon": "layers", "text": "Emergency Department Critical Care Areas"}, {"icon": "layers", "text": "Isolation Rooms"}], "advantages": ["Organized and easily accessible equipment arrangement at the bedside", "Single-column solution for gas, electrical power, and equipment support requirements", "Compatibility with different brands of pumps and monitors via standard rails", "Durable and hygienic surface finish", "Customizable number of outlets and shelves according to requirements"], "detailCards": [{"text": "Support system with a standard DIN rail, suitable for mounting multiple pumps.", "title": "Infusion Pump Rail", "imageUrl": "/assets/images/products/icu-pendant-detail-1.jpg"}, {"text": "Easily accessible gas outlets and equipment shelf combined in one unit.", "title": "Gas Outlet Panel and Shelf", "imageUrl": "/assets/images/products/icu-pendant-detail-2.jpg"}, {"text": "Robust vertical column structure that uses the bedside area efficiently.", "title": "Vertical Column Design", "imageUrl": ""}, {"text": "Smooth external surface finish that can be easily disinfected.", "title": "Hygienic Surface", "imageUrl": ""}], "featureTiles": [{"text": "Gas, socket, and shelf modules can be added according to requirements.", "title": "Modular Structure"}, {"text": "Components designed to withstand intensive 24/7 use.", "title": "Long-Lasting Construction"}, {"text": "Smooth surfaces enable rapid hygiene maintenance.", "title": "Easy Cleaning"}], "heroSubtitle": "Integrated Gas, Electrical, and Equipment Column for the Bedside", "heroDescription": "The Oxymed Intensive Care Pendant Unit combines medical gas outlets, electrical sockets, a monitor shelf, and an infusion pump support rail in a single vertical column, providing intensive care nursing staff with organized and rapid access."}, "fa": {"faq": [{"answer": "می‌تواند پمپ‌های انفوزیون، پمپ‌های سرنگ، مانیتور کنار تخت بیمار و تجهیزات مشابه مراقبت‌های ویژه را روی ریل‌های استاندارد نگهداری کند.", "question": "یونیت پندانت مراقبت‌های ویژه چه تجهیزاتی را می‌تواند نگهداری کند؟"}, {"answer": "در پیکربندی استاندارد، خروجی‌های O2، هوای مدیکال و وکیوم موجود است؛ تعداد خروجی‌ها بر اساس نیاز قابل افزایش است.", "question": "چند خروجی گاز دارد؟"}, {"answer": "قابل نصب به‌صورت ستون عمودی کنار تخت یا بازوی متحرک سقفی است.", "question": "نوع نصب چیست؟"}, {"answer": "به‌لطف سیستم ریل استاندارد DIN، با براکت‌های پمپ انفوزیون و مانیتورِ اغلب برندها سازگار است.", "question": "آیا با پمپ‌ها و مانیتورهای برندهای مختلف سازگار است؟"}, {"answer": "دارای گواهی CE بوده و مطابق با استانداردهای تولید تجهیزات پزشکی ISO 13485 تولید می‌شود.", "question": "با چه استانداردهایی مطابقت دارد؟"}], "specs": [], "features": [{"icon": "sparkles", "text": "تعداد کافی نقاط خروجی برای O2، هوای مدیکال و وکیوم.", "title": "خروجی‌های متعدد گاز"}, {"icon": "sparkles", "text": "سیستم ریل استاندارد برای نگهداری ایمن چندین پمپ انفوزیون و سرنگ.", "title": "ریل پمپ انفوزیون"}, {"icon": "sparkles", "text": "پلتفرم نگهدارنده مستحکم و قابل تنظیم برای مانیتور کنار تخت بیمار.", "title": "قفسه مانیتور"}, {"icon": "sparkles", "text": "تعداد کافی پریز برق ارت‌دار برای تجهیزات مراقبت‌های ویژه.", "title": "مجموعه پریز گسترده"}], "useCases": [{"icon": "layers", "text": "واحدهای مراقبت‌های ویژه"}, {"icon": "layers", "text": "مراقبت‌های ویژه کرونری"}, {"icon": "layers", "text": "مراقبت‌های ویژه نوزادان"}, {"icon": "layers", "text": "مناطق مراقبت بحرانی اورژانس"}, {"icon": "layers", "text": "اتاق‌های ایزولاسیون"}], "advantages": ["چیدمان منظم و دسترسی سریع به تجهیزات در کنار تخت", "تأمین نیازهای گاز، برق و نگهداری تجهیزات در یک ستون واحد", "سازگاری با پمپ‌ها و مانیتورهای برندهای مختلف از طریق ریل‌های استاندارد", "پوشش سطحی بادوام و بهداشتی", "تعداد خروجی‌ها و قفسه‌ها قابل سفارشی‌سازی بر اساس نیاز"], "detailCards": [{"text": "سیستم نگهدارنده مجهز به ریل استاندارد DIN و مناسب برای نصب چندین پمپ.", "title": "ریل پمپ انفوزیون", "imageUrl": "/assets/images/products/icu-pendant-detail-1.jpg"}, {"text": "خروجی‌های گاز با دسترسی آسان و قفسه تجهیزات در یک مجموعه.", "title": "پنل خروجی گاز و قفسه", "imageUrl": "/assets/images/products/icu-pendant-detail-2.jpg"}, {"text": "ساختار ستون عمودی مستحکم برای استفاده بهینه از فضای کنار تخت.", "title": "طراحی ستون عمودی", "imageUrl": ""}, {"text": "پوشش بیرونی صاف که به‌راحتی قابل ضدعفونی است.", "title": "سطح بهداشتی", "imageUrl": ""}], "featureTiles": [{"text": "ماژول‌های گاز، پریز و قفسه بر اساس نیاز قابل افزودن هستند.", "title": "ساختار ماژولار"}, {"text": "اجزای مقاوم برای استفاده مداوم 7/24.", "title": "ساختار بادوام"}, {"text": "امکان حفظ سریع بهداشت با سطوح صاف.", "title": "تمیزکاری آسان"}], "heroSubtitle": "ستون یکپارچه گاز، برق و تجهیزات برای کنار تخت", "heroDescription": "یونیت پندانت مراقبت‌های ویژه Oxymed با یکپارچه‌سازی خروجی‌های گاز مدیکال، پریزهای برق، قفسه مانیتور و ریل نگهدارنده پمپ انفوزیون در یک ستون عمودی، دسترسی منظم و سریع را برای تیم پرستاری مراقبت‌های ویژه فراهم می‌کند."}, "fr": {"faq": [{"answer": "Elle peut supporter des pompes à perfusion, des pousse-seringues électriques, des moniteurs patient et des équipements de soins intensifs similaires sur des rails standard.", "question": "Quels équipements l’unité de suspension de soins intensifs peut-elle supporter ?"}, {"answer": "La configuration standard comprend des sorties O2, Air médical et Vide ; le nombre de sorties peut être augmenté selon les besoins.", "question": "Combien de sorties de gaz sont disponibles ?"}, {"answer": "Elle peut être installée en colonne verticale au chevet ou sous forme de bras mobile fixé au plafond.", "question": "Quel est le type de montage ?"}, {"answer": "Grâce au système de rail DIN standard, elle est compatible avec les pompes à perfusion et les supports de moniteurs de la plupart des marques.", "question": "Est-elle compatible avec les pompes et moniteurs de différentes marques ?"}, {"answer": "Certifiée CE, elle est fabriquée conformément aux normes de production des dispositifs médicaux ISO 13485.", "question": "À quelles normes est-elle conforme ?"}], "specs": [], "features": [{"icon": "sparkles", "text": "Nombre suffisant de points de sortie pour O2, Air médical et Vide.", "title": "Sorties de gaz multiples"}, {"icon": "sparkles", "text": "Système de rails standard supportant en toute sécurité plusieurs pompes à perfusion et pousse-seringues électriques.", "title": "Rail pour pompes à perfusion"}, {"icon": "sparkles", "text": "Plateforme de support robuste et réglable pour moniteur patient.", "title": "Étagère pour moniteur"}, {"icon": "sparkles", "text": "Nombre suffisant de prises électriques avec mise à la terre pour les équipements de soins intensifs.", "title": "Groupe de prises étendu"}], "useCases": [{"icon": "layers", "text": "Unités de soins intensifs"}, {"icon": "layers", "text": "Soins intensifs coronariens"}, {"icon": "layers", "text": "Soins intensifs néonatals"}, {"icon": "layers", "text": "Zones de soins critiques des services d’urgence"}, {"icon": "layers", "text": "Chambres d’isolement"}], "advantages": ["Disposition ordonnée et facilement accessible des équipements au chevet", "Solution intégrée en une seule colonne pour les besoins en gaz, électricité et support d’équipements", "Compatibilité avec les pompes et moniteurs de différentes marques grâce aux rails standard", "Revêtement de surface durable et hygiénique", "Nombre de sorties et d’étagères personnalisable selon les besoins"], "detailCards": [{"text": "Système de support doté d’un rail DIN standard, adapté au montage de plusieurs pompes.", "title": "Rail pour pompes à perfusion", "imageUrl": "/assets/images/products/icu-pendant-detail-1.jpg"}, {"text": "Sorties de gaz facilement accessibles et étagère d’équipement réunies en un seul ensemble.", "title": "Panneau de sorties de gaz et étagère", "imageUrl": "/assets/images/products/icu-pendant-detail-2.jpg"}, {"text": "Structure robuste à colonne verticale optimisant l’utilisation de l’espace au chevet.", "title": "Conception à colonne verticale", "imageUrl": ""}, {"text": "Revêtement extérieur lisse, facilement désinfectable.", "title": "Surface hygiénique", "imageUrl": ""}], "featureTiles": [{"text": "Les modules de gaz, de prises et d’étagères peuvent être ajoutés selon les besoins.", "title": "Structure modulaire"}, {"text": "Composants résistants à une utilisation intensive 24 h/24, 7 j/7.", "title": "Structure durable"}, {"text": "Les surfaces lisses permettent une hygiène rapide.", "title": "Nettoyage facile"}], "heroSubtitle": "Colonne intégrée de gaz, d’électricité et d’équipements pour le chevet", "heroDescription": "L’unité de suspension de soins intensifs Oxymed réunit dans une seule colonne verticale les sorties de gaz médicaux, les prises électriques, une étagère pour moniteur et un rail de support pour pompes à perfusion, offrant à l’équipe soignante de soins intensifs un accès ordonné et rapide."}, "it": {"faq": [{"answer": "Può supportare pompe per infusione, pompe a siringa, monitor paziente al posto letto e dispositivi analoghi per terapia intensiva su guide standard.", "question": "Quali dispositivi può supportare l'unità pensile per terapia intensiva?"}, {"answer": "La configurazione standard include uscite O2, Aria Medicale e Vuoto; il numero di uscite può essere aumentato in base alle esigenze.", "question": "Quante uscite gas sono disponibili?"}, {"answer": "Può essere installata come colonna verticale al posto letto o come braccio mobile a soffitto.", "question": "Qual è il tipo di installazione?"}, {"answer": "Grazie al sistema standard di guide DIN, è compatibile con la maggior parte delle marche di pompe per infusione e staffe per monitor.", "question": "È compatibile con pompe e monitor di marche diverse?"}, {"answer": "È certificata CE e prodotta in conformità agli standard di fabbricazione dei dispositivi medici ISO 13485.", "question": "A quali standard è conforme?"}], "specs": [], "features": [{"icon": "sparkles", "text": "Un numero adeguato di punti di uscita per O2, Aria Medicale e Vuoto.", "title": "Uscite Gas Multiple"}, {"icon": "sparkles", "text": "Sistema di guide standard che supporta in sicurezza più pompe per infusione e pompe a siringa.", "title": "Guida per Pompe di Infusione"}, {"icon": "sparkles", "text": "Piattaforma di supporto robusta e regolabile per monitor paziente al posto letto.", "title": "Ripiano per Monitor"}, {"icon": "sparkles", "text": "Numero adeguato di prese elettriche con messa a terra per dispositivi di terapia intensiva.", "title": "Gruppo Prese Ampio"}], "useCases": [{"icon": "layers", "text": "Unità di Terapia Intensiva"}, {"icon": "layers", "text": "Terapia Intensiva Coronarica"}, {"icon": "layers", "text": "Terapia Intensiva Neonatale"}, {"icon": "layers", "text": "Aree di Terapia Critica del Pronto Soccorso"}, {"icon": "layers", "text": "Camere di Isolamento"}], "advantages": ["Disposizione ordinata e rapidamente accessibile delle apparecchiature al posto letto", "Soluzione integrata in un'unica colonna per gas, elettricità e supporto delle apparecchiature", "Compatibilità con pompe e monitor di marche diverse grazie alle guide standard", "Rivestimento superficiale resistente e igienico", "Numero di uscite e ripiani personalizzabile in base alle esigenze"], "detailCards": [{"text": "Sistema di supporto con guida DIN standard, idoneo al montaggio di più pompe.", "title": "Guida per Pompe di Infusione", "imageUrl": "/assets/images/products/icu-pendant-detail-1.jpg"}, {"text": "Uscite gas facilmente accessibili e ripiano per apparecchiature in un'unica soluzione.", "title": "Pannello Uscite Gas e Ripiano", "imageUrl": "/assets/images/products/icu-pendant-detail-2.jpg"}, {"text": "Robusta struttura a colonna verticale che ottimizza l'utilizzo dello spazio al posto letto.", "title": "Design a Colonna Verticale", "imageUrl": ""}, {"text": "Rivestimento esterno liscio, facilmente disinfettabile.", "title": "Superficie Igienica", "imageUrl": ""}], "featureTiles": [{"text": "I moduli per gas, prese e ripiani possono essere aggiunti in base alle esigenze.", "title": "Struttura Modulare"}, {"text": "Componenti resistenti all'uso intensivo 24/7.", "title": "Struttura Durevole"}, {"text": "Le superfici lisce consentono una rapida igienizzazione.", "title": "Facile Pulizia"}], "heroSubtitle": "Colonna Integrata per Gas, Elettricità e Apparecchiature al Posto Letto", "heroDescription": "L'Unità Pensile per Terapia Intensiva Oxymed integra in un'unica colonna verticale uscite per gas medicali, prese elettriche, ripiano per monitor e guida di supporto per pompe di infusione, offrendo al personale infermieristico di terapia intensiva un accesso ordinato e rapido."}, "ka": {"faq": [{"answer": "შეუძლია საინფუზიო ტუმბოების, შპრიცის ტუმბოების, პაციენტის მონიტორისა და მსგავსი ინტენსიური თერაპიის მოწყობილობების სტანდარტულ რელსებზე განთავსება.", "question": "ინტენსიური თერაპიის პენდანტის ერთეულს რა მოწყობილობების განთავსება შეუძლია?"}, {"answer": "სტანდარტულ კონფიგურაციაში შედის O2, სამედიცინო ჰაერისა და ვაკუუმის გამოსასვლელები; საჭიროებისამებრ შესაძლებელია გამოსასვლელების რაოდენობის გაზრდა.", "question": "რამდენი გაზის გამოსასვლელია?"}, {"answer": "შეიძლება დამონტაჟდეს საწოლთან ვერტიკალური სვეტის ან ჭერზე დამაგრებული მოძრავი მკლავის სახით.", "question": "რა ტიპის მონტაჟია?"}, {"answer": "სტანდარტული DIN რელსის სისტემის წყალობით თავსებადია უმეტესი ბრენდის საინფუზიო ტუმბოსა და მონიტორის სამაგრთან.", "question": "თავსებადია თუ არა სხვადასხვა ბრენდის ტუმბოებთან და მონიტორებთან?"}, {"answer": "აქვს CE სერტიფიკატი და წარმოებულია ISO 13485 სამედიცინო მოწყობილობების წარმოების სტანდარტების შესაბამისად.", "question": "რომელ სტანდარტებს შეესაბამება?"}], "specs": [], "features": [{"icon": "sparkles", "text": "O2, სამედიცინო ჰაერისა და ვაკუუმისთვის საკმარისი რაოდენობის გამოსასვლელი წერტილები.", "title": "მრავალი გაზის გამოსასვლელი"}, {"icon": "sparkles", "text": "სტანდარტული რელსის სისტემა, რომელიც უსაფრთხოდ იტევს მრავალ საინფუზიო და შპრიცის ტუმბოს.", "title": "საინფუზიო ტუმბოს რელსი"}, {"icon": "sparkles", "text": "მყარი და რეგულირებადი საყრდენი პლატფორმა პაციენტის მონიტორისთვის.", "title": "მონიტორის თარო"}, {"icon": "sparkles", "text": "ინტენსიური თერაპიის მოწყობილობებისთვის საკმარისი რაოდენობის დამიწებული ელექტრო როზეტები.", "title": "გაფართოებული როზეტების ჯგუფი"}], "useCases": [{"icon": "layers", "text": "ინტენსიური თერაპიის განყოფილებები"}, {"icon": "layers", "text": "კორონარული ინტენსიური თერაპია"}, {"icon": "layers", "text": "ახალშობილთა ინტენსიური თერაპია"}, {"icon": "layers", "text": "გადაუდებელი დახმარების განყოფილების კრიტიკული მოვლის ზონები"}, {"icon": "layers", "text": "იზოლაციის ოთახები"}], "advantages": ["საწოლთან აღჭურვილობის მოწესრიგებული და სწრაფად ხელმისაწვდომი განლაგება", "გაზის, ელექტროენერგიისა და მოწყობილობების განთავსების საჭიროების გადაწყვეტა ერთ სვეტში", "სტანდარტული რელსებით თავსებადობა სხვადასხვა ბრენდის ტუმბოებთან და მონიტორებთან", "გამძლე და ჰიგიენური ზედაპირის საფარი", "საჭიროებისამებრ გამოსასვლელებისა და თაროების რაოდენობის მორგება"], "detailCards": [{"text": "სტანდარტული DIN რელსით აღჭურვილი, მრავალტუმბოიანი მონტაჟისთვის განკუთვნილი საყრდენი სისტემა.", "title": "საინფუზიო ტუმბოს რელსი", "imageUrl": "/assets/images/products/icu-pendant-detail-1.jpg"}, {"text": "მარტივად ხელმისაწვდომი გაზის გამოსასვლელები და აღჭურვილობის თარო ერთ სისტემაში.", "title": "გაზის გამოსასვლელების პანელი და თარო", "imageUrl": "/assets/images/products/icu-pendant-detail-2.jpg"}, {"text": "მყარი ვერტიკალური სვეტის კონსტრუქცია, რომელიც ეფექტიანად იყენებს საწოლთან არსებულ სივრცეს.", "title": "ვერტიკალური სვეტის დიზაინი", "imageUrl": ""}, {"text": "გლუვი გარე ზედაპირის საფარი, რომელიც ადვილად ექვემდებარება დეზინფექციას.", "title": "ჰიგიენური ზედაპირი", "imageUrl": ""}], "featureTiles": [{"text": "გაზის, როზეტისა და თაროს მოდულები შეიძლება დაემატოს საჭიროებისამებრ.", "title": "მოდულური კონსტრუქცია"}, {"text": "კომპონენტები გამძლეა 24/7 ინტენსიური გამოყენებისთვის.", "title": "ხანგრძლივი ექსპლუატაცია"}, {"text": "გლუვი ზედაპირები უზრუნველყოფს სწრაფ ჰიგიენურ დამუშავებას.", "title": "მარტივი წმენდა"}], "heroSubtitle": "საწოლთან ინტეგრირებული გაზის, ელექტროენერგიისა და აღჭურვილობის სვეტი", "heroDescription": "Oxymed ინტენსიური თერაპიის პენდანტის ერთეული აერთიანებს სამედიცინო გაზის გამოსასვლელებს, ელექტრო როზეტებს, მონიტორის თაროსა და საინფუზიო ტუმბოს საყრდენ რელსს ერთ ვერტიკალურ სვეტში, რაც ინტენსიური თერაპიის საექთნო გუნდს უზრუნველყოფს მოწესრიგებული და სწრაფი წვდომით."}, "ru": {"faq": [{"answer": "Может размещать инфузионные насосы, шприцевые насосы, прикроватный монитор пациента и аналогичное оборудование для интенсивной терапии на стандартных рельсах.", "question": "Какое оборудование может размещать блок-консоль для интенсивной терапии?"}, {"answer": "В стандартной конфигурации предусмотрены выходы O2, медицинского воздуха и вакуума; при необходимости количество выходов может быть увеличено.", "question": "Сколько газовых выходов предусмотрено?"}, {"answer": "Может устанавливаться в виде вертикальной колонны у изголовья кровати или потолочной системы с подвижным кронштейном.", "question": "Какой тип монтажа?"}, {"answer": "Благодаря стандартной системе DIN-рейки совместим с инфузионными насосами и кронштейнами для мониторов большинства марок.", "question": "Совместим ли он с насосами и мониторами разных марок?"}, {"answer": "Имеет сертификацию CE и производится в соответствии со стандартами изготовления медицинских изделий ISO 13485.", "question": "Каким стандартам соответствует?"}], "specs": [], "features": [{"icon": "sparkles", "text": "Достаточное количество точек подключения для O2, медицинского воздуха и вакуума.", "title": "Множественные газовые выходы"}, {"icon": "sparkles", "text": "Стандартная рельсовая система для безопасного размещения нескольких инфузионных и шприцевых насосов.", "title": "Рельс для инфузионных насосов"}, {"icon": "sparkles", "text": "Прочная и регулируемая платформа для размещения прикроватного монитора пациента.", "title": "Полка для монитора"}, {"icon": "sparkles", "text": "Достаточное количество заземленных электрических розеток для оборудования интенсивной терапии.", "title": "Расширенная группа розеток"}], "useCases": [{"icon": "layers", "text": "Отделения интенсивной терапии"}, {"icon": "layers", "text": "Кардиологическая интенсивная терапия"}, {"icon": "layers", "text": "Неонатальная интенсивная терапия"}, {"icon": "layers", "text": "Зоны критической помощи отделений неотложной помощи"}, {"icon": "layers", "text": "Изоляционные палаты"}], "advantages": ["Организованное и быстро доступное размещение оборудования у изголовья кровати", "Решение потребностей в подаче газов, электропитании и размещении оборудования в одной колонне", "Совместимость с насосами и мониторами различных марок благодаря стандартным рельсам", "Прочное и гигиеничное покрытие поверхности", "Настраиваемое количество выходов и полок в соответствии с потребностями"], "detailCards": [{"text": "Система размещения со стандартной DIN-рейкой, предназначенная для установки нескольких насосов.", "title": "Рельс для инфузионных насосов", "imageUrl": "/assets/images/products/icu-pendant-detail-1.jpg"}, {"text": "Легкодоступные газовые выходы и полка для оборудования в едином исполнении.", "title": "Панель газовых выходов и полка", "imageUrl": "/assets/images/products/icu-pendant-detail-2.jpg"}, {"text": "Прочная вертикальная конструкция колонны, эффективно использующая пространство у изголовья кровати.", "title": "Конструкция вертикальной колонны", "imageUrl": ""}, {"text": "Гладкое наружное покрытие, легко поддающееся дезинфекции.", "title": "Гигиеничная поверхность", "imageUrl": ""}], "featureTiles": [{"text": "Модули газовых выходов, розеток и полок могут добавляться по необходимости.", "title": "Модульная конструкция"}, {"text": "Компоненты, устойчивые к интенсивной эксплуатации 7/24.", "title": "Долговечная конструкция"}, {"text": "Возможность быстрого обеспечения гигиены благодаря гладким поверхностям.", "title": "Простая очистка"}], "heroSubtitle": "Интегрированная колонна газоснабжения, электропитания и оборудования у изголовья кровати", "heroDescription": "Блок-консоль для интенсивной терапии Oxymed объединяет выходы медицинских газов, электрические розетки, полку для монитора и рельс для размещения инфузионных насосов в одной вертикальной колонне, обеспечивая персоналу интенсивной терапии организованный и быстрый доступ."}}, "features": [{"icon": "sparkles", "text": "O2, Medikal Hava ve Vakum için yeterli sayıda çıkış noktası.", "title": "Çoklu Gaz Çıkışı"}, {"icon": "sparkles", "text": "Birden fazla infüzyon ve enjektör pompasını güvenle taşıyan standart ray sistemi.", "title": "İnfüzyon Pompası Rayı"}, {"icon": "sparkles", "text": "Hasta başı monitörü için sağlam ve ayarlanabilir taşıma platformu.", "title": "Monitör Rafı"}, {"icon": "sparkles", "text": "Yoğun bakım cihazları için yeterli sayıda topraklı elektrik prizi.", "title": "Geniş Priz Grubu"}], "useCases": [{"icon": "layers", "text": "Yoğun Bakım Üniteleri"}, {"icon": "layers", "text": "Koroner Yoğun Bakım"}, {"icon": "layers", "text": "Yenidoğan Yoğun Bakım"}, {"icon": "layers", "text": "Acil Servis Kritik Bakım Alanları"}, {"icon": "layers", "text": "İzolasyon Odaları"}], "advantages": ["Yatak başında düzenli ve hızlı erişilebilir ekipman yerleşimi", "Gaz, elektrik ve cihaz taşıma ihtiyacının tek kolonda çözümü", "Standart raylarla farklı marka pompa ve monitörlerle uyumluluk", "Dayanıklı ve hijyenik yüzey kaplaması", "İhtiyaca göre özelleştirilebilir çıkış ve raf sayısı"], "detailCards": [{"text": "Standart DIN raya sahip, çoklu pompa montajına uygun taşıma sistemi.", "title": "İnfüzyon Pompası Rayı", "imageUrl": "/assets/images/products/icu-pendant-detail-1.jpg"}, {"text": "Kolay erişilebilir gaz çıkışları ve ekipman rafı bir arada.", "title": "Gaz Çıkış Paneli ve Raf", "imageUrl": "/assets/images/products/icu-pendant-detail-2.jpg"}, {"text": "Yatak başı alanını verimli kullanan sağlam dikey kolon yapısı.", "title": "Dikey Kolon Tasarımı", "imageUrl": ""}, {"text": "Kolay dezenfekte edilebilen, pürüzsüz dış yüzey kaplaması.", "title": "Hijyenik Yüzey", "imageUrl": ""}], "featureTiles": [{"text": "Gaz, priz ve raf modülleri ihtiyaca göre eklenebilir.", "title": "Modüler Yapı"}, {"text": "7/24 yoğun kullanıma dayanıklı bileşenler.", "title": "Uzun Ömürlü Yapı"}, {"text": "Pürüzsüz yüzeyler ile hızlı hijyen sağlama imkanı.", "title": "Kolay Temizlik"}], "heroSubtitle": "Yatak Başı İçin Entegre Gaz, Elektrik ve Ekipman Kolonu", "sectionOrder": ["detailCards", "technical", "useCases", "featureTiles", "faq"], "hiddenSections": [], "heroDescription": "Oxymed Yoğun Bakım Pendant Ünitesi; medikal gaz çıkışları, elektrik prizleri, monitör rafı ve infüzyon pompası taşıma rayını tek bir dikey kolonda birleştirerek yoğun bakım hemşirelik ekibine düzenli ve hızlı erişim imkanı sunar.", "templateVersion": 1}	{"materials": []}	Yoğun Bakım Pendant Ünitesi	["O2 / Hava / Vakum çıkışları", "İnfüzyon pompası rayı", "Monitör rafı"]	OXM-YBP-100	/assets/images/products/icu-pendant-hero.jpg	ADET	\N	ICU Pendant Unit	Intensivpflege-Pendantsystem	Système de pendant de réanimation	Sistema pensile per terapia intensiva	وحدة بندانت العناية المركزة	Консоль для реанимации	پندانت بخش مراقبت ویژه	ინტენსიური თერაპიის პენდანტი	Конзола за интензивно отделение	Reanimasiya pendant sistemi	f	4	\N
13	1	Yatak Başı Ünitesi	Hastanın bulunduğu noktada medikal gaz, elektrik, data ve aydınlatma ihtiyaçlarını düzenli ve güvenli biçimde karşılayan modüler yatak başı çözümü.	/api/storage/public-objects/objects/uploads/3b7a1a79-f4b1-462b-913d-8b4dd0a04e68	[{"label": "Gaz Prizi", "value": "2 - 4 adet; O2, vakum ve basınçlı hava seçenekleri"}, {"label": "Elektrik Prizi", "value": "4 - 8 adet"}, {"label": "Data / Çağrı Sistemi", "value": "Opsiyonel"}, {"label": "LED Aydınlatma", "value": "Genel ve okuma aydınlatması seçenekleri"}, {"label": "Gövde", "value": "Alüminyum profil"}, {"label": "Uzunluk", "value": "1000 - 2000 mm"}, {"label": "Montaj Tipi", "value": "Duvar tipi"}]	1	t	2026-08-14 14:37:14.618206+00	2026-08-17 20:06:27.253+00	yatak-basi-unitesi	{"faq": [{"answer": "Konfigürasyona bağlı olarak oksijen, vakum ve basınçlı hava çıkışları sunulabilir. Gaz tipi ve çıkış adedi proje gereksinimine göre belirlenir.", "question": "Yatak Başı Ünitesi hangi gaz bağlantılarını destekler?"}, {"answer": "Evet. Standart çözüm 1000 - 2000 mm aralığında farklı uzunluk seçenekleriyle hazırlanabilir. Proje ölçülerine göre özel değerlendirme yapılır.", "question": "Ünitenin uzunluğu değiştirilebilir mi?"}, {"answer": "Evet. Elektrik prizleri, data bağlantıları, USB çıkışları ve çağrı sistemi bileşenleri ihtiyaç duyulan konfigürasyona göre eklenebilir.", "question": "Elektrik ve data bağlantıları eklenebilir mi?"}, {"answer": "Evet. Genel aydınlatma ve hasta başı okuma aydınlatması için LED seçenekleri sunulabilir.", "question": "LED aydınlatma bulunur mu?"}, {"answer": "Evet. Oda planı, yatak yerleşimi, gaz altyapısı ve elektrik ihtiyaçları değerlendirilerek uygun yerleşim ve konfigürasyon belirlenir.", "question": "Montaj öncesi proje çalışması yapılıyor mu?"}, {"answer": "Temizlik ve bakım işlemleri, ürünün kullanım ve bakım talimatlarına uygun şekilde, uygun yüzey temizleyiciler kullanılarak yapılmalıdır. Teknik servis gerektiren işlemler yetkili ekiplerce gerçekleştirilmelidir.", "question": "Ürünün temizliği ve bakımı nasıl yapılmalıdır?"}], "specs": [{"label": "Gaz Prizi", "value": "2 - 4 adet; O2, vakum ve basınçlı hava seçenekleri"}, {"label": "Elektrik Prizi", "value": "4 - 8 adet"}, {"label": "Data / Çağrı Sistemi", "value": "Opsiyonel"}, {"label": "LED Aydınlatma", "value": "Genel ve okuma aydınlatması seçenekleri"}, {"label": "Gövde", "value": "Alüminyum profil"}, {"label": "Uzunluk", "value": "1000 - 2000 mm"}, {"label": "Montaj Tipi", "value": "Duvar tipi"}], "locales": {}, "features": [{"icon": "sparkles", "text": "O2, vakum ve basınçlı hava hatları için düzenli çıkış altyapısı sunar.", "title": "Medikal gaz erişimi"}, {"icon": "sparkles", "text": "İhtiyaca göre farklı uzunluk, priz, gaz çıkışı ve aksesuar yerleşimleriyle yapılandırılır.", "title": "Modüler tasarım"}, {"icon": "sparkles", "text": "Genel aydınlatma ve hasta başı okuma konforu için LED seçenekleri sunar.", "title": "Entegre aydınlatma"}, {"icon": "sparkles", "text": "Kablo ve bağlantılara kontrollü erişim sağlayan servis dostu gövde yapısına sahiptir.", "title": "Kolay bakım"}], "useCases": [{"icon": "layers", "text": "Yoğun bakım üniteleri"}, {"icon": "layers", "text": "Yenidoğan ve çocuk yoğun bakım üniteleri"}, {"icon": "layers", "text": "Ameliyathane sonrası bakım alanları"}, {"icon": "layers", "text": "Servis ve hasta odaları"}, {"icon": "layers", "text": "Poliklinik ve gözlem odaları"}, {"icon": "layers", "text": "Özel bakım ve klinik alanlar"}], "advantages": ["Gaz ve elektrik bağlantılarını yatak başında düzenli tutar.", "Modüler yapısı sayesinde farklı klinik ihtiyaçlara uyarlanabilir.", "LED aydınlatma seçenekleri hasta ve sağlık personeli konforunu artırır.", "Kolay temizlenebilir yüzeyleri hijyen süreçlerini destekler.", "Servis ve bakım işlemleri için erişilebilir gövde tasarımı sunar.", "Proje ölçülerine göre farklı uzunluk ve yerleşim seçenekleri sağlar."], "detailCards": [{"text": "Medikal gaz, elektrik, data ve çağrı bağlantılarını tek bir gövdede toplayarak bakım alanını düzenler.", "title": "Hasta Başı Organizasyonu", "imageUrl": ""}, {"text": "Oda tipi, yatak sayısı ve klinik ihtiyaçlara göre çıkış, priz, anahtar ve aksesuar yerleşimi yapılandırılabilir.", "title": "İhtiyaca Göre Konfigürasyon", "imageUrl": ""}, {"text": "Kolay temizlenebilen yüzey yapısı ve sağlam alüminyum gövdesi ile yoğun kullanıma uygun çözüm sunar.", "title": "Hijyenik ve Dayanıklı Gövde", "imageUrl": ""}], "featureTiles": [{"text": "Yatak sayısı, oda planı ve klinik ihtiyaçlara göre ölçülendirilebilir.", "title": "Proje Bazlı Tasarım"}, {"text": "Priz, data, USB ve çağrı sistemi seçenekleriyle yapılandırılabilir.", "title": "Elektrik ve Data Altyapısı"}, {"text": "Bağlantılar ve aydınlatma, sağlık personelinin hızlı erişebileceği konumda düzenlenir.", "title": "Ergonomik Kullanım"}, {"text": "Alüminyum gövde, yoğun kullanım için dayanıklı ve bakımı kolay bir yapı sunar.", "title": "Uzun Ömürlü Gövde"}], "heroSubtitle": "Modüler, güvenli ve ergonomik hasta başı çözümleri", "sectionOrder": ["detailCards", "technical", "useCases", "featureTiles", "faq"], "hiddenSections": [], "heroDescription": "Yatak Başı Ünitesi; oksijen, vakum, basınçlı hava, elektrik, data ve çağrı sistemi bağlantılarını hastanın bulunduğu noktada düzenli bir şekilde sunar. Farklı oda ve bakım seviyelerine göre gaz, priz, aydınlatma ve aksesuar seçenekleriyle yapılandırılabilir.", "templateVersion": 1}	{"costPrice": "75USD", "materials": []}	Yatak Başı Ünitesi	["O2, vakum ve basınçlı hava çıkışları", "LED aydınlatma seçenekleri", "Modüler priz, data ve çağrı sistemi altyapısı", "Proje ölçülerine göre yapılandırılabilir alüminyum gövde"]	OXM-YBU-01	\N	ADET	\N	Bed Head Unit	Bettkopfeinheit	Unité de tête de lit	Unità testaletto	وحدة رأس السرير	Прикроватная панель	یونیت هدبورد تخت	საწოლთანა ბლოკი	Болничен панел	Yataq başı bloku	t	1	\N
7	2	Anestezi Pendant Ünitesi	Ameliyathaneler için tüm medikal gaz ve elektrik çıkışlarını tek bir hareketli tavan kolunda toplayan anestezi pendant sistemi.	/assets/images/products/anestezi-pendant-hero.jpg	[{"label": "Ürün Adı", "value": "Anestezi Pendant Ünitesi"}, {"label": "Kullanım Alanı", "value": "Ameliyathane / Anestezi İstasyonu"}, {"label": "Gaz Çıkışları", "value": "O2, N2O, Medikal Hava, Vakum"}, {"label": "Elektrik Çıkışı", "value": "4-8 adet topraklı priz"}, {"label": "Kol Tipi", "value": "Tek / Çift kollu, 340° dönüş"}, {"label": "Yük Kapasitesi", "value": "80 - 150 kg"}, {"label": "Gövde Malzemesi", "value": "Elektrostatik boyalı alüminyum / paslanmaz çelik"}, {"label": "Montaj Tipi", "value": "Tavan Tipi (Sabit / Hareketli Kollu)"}, {"label": "Uygunluk", "value": "CE, ISO 13485 üretim standartlarına uygun"}]	7	f	2026-08-03 07:21:53.134666+00	2026-08-17 20:22:11.817+00	anestezi-pendant-unitesi	{"faq": [{"answer": "Standart konfigürasyonda Oksijen (O2), Azot Protoksit (N2O), Medikal Hava ve Vakum çıkışlarını destekler; talebe göre ek gaz hatları eklenebilir.", "question": "Anestezi pendant ünitesi hangi gazları destekler?"}, {"answer": "Kol tipine bağlı olarak 80 kg ile 150 kg arasında cihaz ve ekipman taşıma kapasitesine sahiptir.", "question": "Yük kapasitesi nedir?"}, {"answer": "Tavan tipi montaj için standart bağlantı noktaları kullanılır; kurulum yetkili teknik ekip tarafından gerçekleştirilir.", "question": "Montajı nasıl yapılır?"}, {"answer": "Yılda en az bir kez periyodik bakım ve gaz çıkış testleri önerilir. Modüler yapısı sayesinde bakım süreleri kısadır.", "question": "Bakımı ne sıklıkla yapılmalıdır?"}, {"answer": "CE belgeli olup ISO 13485 medikal cihaz üretim standartlarına uygun olarak üretilmektedir.", "question": "Hangi standartlara uygundur?"}], "specs": [{"label": "Ürün Adı", "value": "Anestezi Pendant Ünitesi"}, {"label": "Kullanım Alanı", "value": "Ameliyathane / Anestezi İstasyonu"}, {"label": "Gaz Çıkışları", "value": "O2, N2O, Medikal Hava, Vakum"}, {"label": "Elektrik Çıkışı", "value": "4-8 adet topraklı priz"}, {"label": "Kol Tipi", "value": "Tek / Çift kollu, 340° dönüş"}, {"label": "Yük Kapasitesi", "value": "80 - 150 kg"}, {"label": "Gövde Malzemesi", "value": "Elektrostatik boyalı alüminyum / paslanmaz çelik"}, {"label": "Montaj Tipi", "value": "Tavan Tipi (Sabit / Hareketli Kollu)"}, {"label": "Uygunluk", "value": "CE, ISO 13485 üretim standartlarına uygun"}], "locales": {"ar": {"faq": [{"answer": "يدعم في التكوين القياسي مخارج الأكسجين (O2) وأكسيد النيتروز (N2O) والهواء الطبي والشفط؛ ويمكن إضافة خطوط غازات إضافية حسب الطلب.", "question": "ما الغازات التي تدعمها وحدة بندانت التخدير؟"}, {"answer": "تتراوح سعة حمل الأجهزة والمعدات بين 80 kg و150 kg، بحسب نوع الذراع.", "question": "ما سعة التحميل؟"}, {"answer": "تُستخدم نقاط التثبيت القياسية للتركيب السقفي؛ ويُنفَّذ التركيب بواسطة فريق فني معتمد.", "question": "كيف يتم التركيب؟"}, {"answer": "يوصى بإجراء الصيانة الدورية واختبارات مخارج الغازات مرة واحدة على الأقل سنويًا. وبفضل هيكلها المعياري، تكون فترات الصيانة قصيرة.", "question": "كم مرة يجب إجراء الصيانة؟"}, {"answer": "حاصلة على شهادة CE ومصنّعة وفقًا لمعايير تصنيع الأجهزة الطبية ISO 13485.", "question": "ما المعايير التي تتوافق معها؟"}], "specs": [], "features": [{"icon": "sparkles", "text": "مخارج غازات بتوصيل سريع ومشفرة بالألوان لمنع التوصيل الخاطئ.", "title": "إدارة آمنة للغازات"}, {"icon": "sparkles", "text": "زاوية دوران واسعة لحرية الحركة حول طاولة العمليات.", "title": "قدرة دوران 340°"}, {"icon": "sparkles", "text": "منصة حمل متينة لجهاز التخدير والشاشة والمبخر.", "title": "رف أجهزة مدمج"}, {"icon": "sparkles", "text": "إمكانية الخدمة والصيانة السريعة بفضل الهيكل الداخلي المعياري.", "title": "صيانة سهلة"}], "useCases": [{"icon": "layers", "text": "غرف العمليات"}, {"icon": "layers", "text": "محطات التخدير"}, {"icon": "layers", "text": "غرف العمليات الهجينة"}, {"icon": "layers", "text": "وحدات جراحة القلب والأوعية الدموية"}, {"icon": "layers", "text": "غرف عمليات المستشفيات التعليمية"}], "advantages": ["مساحة عمل منظمة خالية من فوضى الكابلات والخراطيم", "ترميز لوني يضمن توصيل الغازات بسرعة ودون أخطاء", "آلية ذراع متينة ذات سعة تحميل عالية", "عدد وتوزيع المخارج قابلان للتخصيص حسب احتياجات المستشفى", "طلاء سطحي صحي سهل التنظيف"], "detailCards": [{"text": "وصلات توصيل سريع ملونة ومتوافقة مع المعايير لـ O2 وN2O والهواء والشفط، لمنع الالتباس.", "title": "مخارج غازات مشفرة بالألوان", "imageUrl": "/assets/images/products/anestezi-pendant-detail-1.jpg"}, {"text": "هيكل ذراع دوار طويل العمر بحركة سلسة بفضل نظام المحامل الخالي من الاحتكاك.", "title": "آلية ذراع متينة", "imageUrl": "/assets/images/products/anestezi-pendant-detail-2.jpg"}, {"text": "عدد كافٍ من المقابس الكهربائية المؤرضة لأجهزة التخدير والمعدات المساعدة.", "title": "مجموعة مقابس مدمجة", "imageUrl": ""}, {"text": "نظام رفوف متين وقابل للضبط للمبخر والشاشة ومضخات الحقن.", "title": "منصة حمل الأجهزة", "imageUrl": ""}], "featureTiles": [{"text": "يمكن إضافة وحدات الغازات والمقابس والرفوف حسب الحاجة.", "title": "تصميم معياري"}, {"text": "مكونات صناعية متينة تتحمل الاستخدام المكثف.", "title": "هيكل طويل العمر"}, {"text": "تركيب عملي باستخدام نقاط التثبيت السقفية القياسية.", "title": "تركيب سريع"}], "heroSubtitle": "نظام إدارة الغازات والكهرباء من النوع السقفي", "heroDescription": "تجمع وحدة بندانت التخدير Oxymed جميع مخارج الغازات الطبية والمقابس الكهربائية ونقاط حمل الأجهزة التي يحتاجها فريق التخدير على ذراع متحرك واحد، مما يزيل فوضى الكابلات في غرفة العمليات ويوفر أقصى مساحة عمل للفريق."}, "az": {"faq": [{"answer": "Standart konfiqurasiyada Oksigen (O2), Azot Protoksid (N2O), Tibbi Hava və Vakuum çıxışlarını dəstəkləyir; tələbdən asılı olaraq əlavə qaz xətləri əlavə edilə bilər.", "question": "Anesteziya pendant bölməsi hansı qazları dəstəkləyir?"}, {"answer": "Qolun növündən asılı olaraq 80 kg ilə 150 kg arasında cihaz və avadanlıq daşıma qabiliyyətinə malikdir.", "question": "Yükdaşıma qabiliyyəti nədir?"}, {"answer": "Tavan tipli montaj üçün standart qoşulma nöqtələrindən istifadə olunur; quraşdırma səlahiyyətli texniki heyət tərəfindən həyata keçirilir.", "question": "Montaj necə həyata keçirilir?"}, {"answer": "İldə ən azı bir dəfə dövri texniki xidmət və qaz çıxışlarının sınaqdan keçirilməsi tövsiyə olunur. Modul quruluşu sayəsində texniki xidmət müddətləri qısadır.", "question": "Texniki xidmət nə qədər tez-tez aparılmalıdır?"}, {"answer": "CE sertifikatlıdır və ISO 13485 tibbi cihaz istehsalı standartlarına uyğun olaraq istehsal edilir.", "question": "Hansı standartlara uyğundur?"}], "specs": [], "features": [{"icon": "sparkles", "text": "Rəng kodlu, yanlış qoşulmanın qarşısını alan quick-connect qaz çıxışları.", "title": "Təhlükəsiz Qaz İdarəetməsi"}, {"icon": "sparkles", "text": "Əməliyyat masası ətrafında sərbəst hərəkət üçün geniş fırlanma bucağı.", "title": "340° Fırlanma Qabiliyyəti"}, {"icon": "sparkles", "text": "Anesteziya aparatı, monitor və vaporizator üçün möhkəm daşıma platforması.", "title": "İnteqrə Edilmiş Cihaz Rəfi"}, {"icon": "sparkles", "text": "Modul daxili quruluş sayəsində sürətli servis və texniki xidmət imkanı.", "title": "Asan Texniki Xidmət"}], "useCases": [{"icon": "layers", "text": "Əməliyyatxanalar"}, {"icon": "layers", "text": "Anesteziya Stansiyaları"}, {"icon": "layers", "text": "Hibrid Əməliyyat Otaqları"}, {"icon": "layers", "text": "Ürək-Damar Cərrahiyyəsi Bölmələri"}, {"icon": "layers", "text": "Tədris Xəstəxanalarının Əməliyyatxanaları"}], "advantages": ["Kabel və şlanq qarışıqlığı olmayan səliqəli iş sahəsi", "Sürətli və səhvsiz qaz qoşulmasını təmin edən rəngli kodlaşdırma", "Yüksək yükdaşıma qabiliyyətli, davamlı qol mexanizmi", "Xəstəxananın ehtiyaclarına uyğun fərdiləşdirilə bilən çıxış sayı və yerləşimi", "Asan təmizlənən, gigiyenik səth örtüyü"], "detailCards": [{"text": "O2, N2O, Hava və Vakuum üçün standartlara uyğun, qarışıqlığın qarşısını alan rəngli quick-connect qoşulmalar.", "title": "Rəng Kodlu Qaz Çıxışları", "imageUrl": "/assets/images/products/anestezi-pendant-detail-1.jpg"}, {"text": "Sürtünməsiz podşipnik sistemi ilə yumşaq hərəkət edən, uzunömürlü fırlanan qol quruluşu.", "title": "Davamlı Qol Mexanizmi", "imageUrl": "/assets/images/products/anestezi-pendant-detail-2.jpg"}, {"text": "Anesteziya aparatları və köməkçi avadanlıqlar üçün kifayət sayda torpaqlamalı elektrik rozetkası.", "title": "İnteqrə Edilmiş Rozetka Qrupu", "imageUrl": ""}, {"text": "Vaporizator, monitor və şpris nasosları üçün möhkəm və tənzimlənən rəf sistemi.", "title": "Cihaz Daşıma Platforması", "imageUrl": ""}], "featureTiles": [{"text": "Ehtiyaca uyğun olaraq qaz, rozetka və rəf modulları əlavə edilə bilər.", "title": "Modul Dizayn"}, {"text": "İntensiv istifadəyə davamlı sənaye komponentləri.", "title": "Uzunömürlü Quruluş"}, {"text": "Standart tavan qoşulma nöqtələri ilə praktik montaj.", "title": "Sürətli Quraşdırma"}], "heroSubtitle": "Tavan Tipli Qaz və Elektrik İdarəetmə Sistemi", "heroDescription": "Anesteziya heyətinin ehtiyac duyduğu bütün tibbi qaz çıxışlarını, elektrik rozetkalarını və cihaz daşıma nöqtələrini vahid hərəkətli qol üzərində birləşdirən Oxymed Anesteziya Pendant Bölməsi əməliyyatxanada kabel qarışıqlığını aradan qaldırır və heyət üçün maksimum iş sahəsi təmin edir."}, "bg": {"faq": [{"answer": "В стандартна конфигурация поддържа изводи за Кислород (O2), Диазотен оксид (N2O), Медицински въздух и Вакуум; при поискване могат да бъдат добавени допълнителни газови линии.", "question": "Какви газове поддържа анестезиологичната конзола?"}, {"answer": "В зависимост от типа рамо, има капацитет за носене на апаратура и оборудване между 80 kg и 150 kg.", "question": "Каква е товароносимостта?"}, {"answer": "За таванен монтаж се използват стандартни точки за свързване; инсталацията се извършва от оторизиран технически екип.", "question": "Как се извършва монтажът?"}, {"answer": "Препоръчват се периодична поддръжка и тестове на газовите изводи най-малко веднъж годишно. Благодарение на модулната си конструкция времето за обслужване е кратко.", "question": "Колко често трябва да се извършва поддръжка?"}, {"answer": "Продуктът е CE сертифициран и се произвежда в съответствие със стандартите за производство на медицински изделия ISO 13485.", "question": "На кои стандарти отговаря?"}], "specs": [], "features": [{"icon": "sparkles", "text": "Цветово кодирани quick-connect газови изводи, предотвратяващи неправилно свързване.", "title": "Безопасно управление на газовете"}, {"icon": "sparkles", "text": "Широк ъгъл на завъртане за свободно движение около операционната маса.", "title": "340° възможност за завъртане"}, {"icon": "sparkles", "text": "Здрава носеща платформа за анестезиологичен апарат, монитор и изпарител.", "title": "Интегриран рафт за апаратура"}, {"icon": "sparkles", "text": "Бързо обслужване и поддръжка благодарение на модулната вътрешна конструкция.", "title": "Лесна поддръжка"}], "useCases": [{"icon": "layers", "text": "Операционни зали"}, {"icon": "layers", "text": "Анестезиологични станции"}, {"icon": "layers", "text": "Хибридни операционни зали"}, {"icon": "layers", "text": "Звена по сърдечно-съдова хирургия"}, {"icon": "layers", "text": "Операционни зали в учебни болници"}], "advantages": ["Организирано работно пространство без хаос от кабели и маркучи", "Цветово кодиране за бързо и безгрешно свързване на газовете", "Здрав механизъм на рамото с висока товароносимост", "Персонализируем брой и разположение на изводите според нуждите на болницата", "Лесна за почистване, хигиенична повърхностна облицовка"], "detailCards": [{"text": "Стандартизирани, цветово кодирани quick-connect връзки за O2, N2O, Въздух и Вакуум, предотвратяващи объркване.", "title": "Цветово кодирани газови изводи", "imageUrl": "/assets/images/products/anestezi-pendant-detail-1.jpg"}, {"text": "Дълготрайна конструкция на въртящото се рамо с плавно движение чрез безфрикционна лагерна система.", "title": "Здрав механизъм на рамото", "imageUrl": "/assets/images/products/anestezi-pendant-detail-2.jpg"}, {"text": "Достатъчен брой заземени електрически контакти за анестезиологични апарати и спомагателно оборудване.", "title": "Интегрирана група контакти", "imageUrl": ""}, {"text": "Здрава и регулируема рафтова система за изпарител, монитор и инфузионни помпи.", "title": "Платформа за носене на апаратура", "imageUrl": ""}], "featureTiles": [{"text": "Газови, контактни и рафтови модули могат да се добавят според нуждите.", "title": "Модулен дизайн"}, {"text": "Индустриални компоненти, устойчиви на интензивна употреба.", "title": "Дълготрайна конструкция"}, {"text": "Практичен монтаж със стандартни таванни точки за свързване.", "title": "Бърза инсталация"}], "heroSubtitle": "Таванна система за управление на газове и електрозахранване", "heroDescription": "Анестезиологичната конзола Oxymed обединява всички изводи за медицински газове, електрическите контакти и точките за носене на апаратура, необходими на анестезиологичния екип, върху едно подвижно рамо, като премахва хаоса от кабели в операционната зала и осигурява максимално работно пространство за екипа."}, "de": {"faq": [{"answer": "In der Standardkonfiguration unterstützt sie Auslässe für Sauerstoff (O2), Distickstoffmonoxid (N2O), medizinische Druckluft und Vakuum; zusätzliche Gasleitungen können auf Wunsch ergänzt werden.", "question": "Welche Gase unterstützt die Anästhesie-Pendanteinheit?"}, {"answer": "Je nach Ausführung des Tragarms verfügt sie über eine Tragfähigkeit für Geräte und Ausrüstung von 80 kg bis 150 kg.", "question": "Wie hoch ist die Tragfähigkeit?"}, {"answer": "Für die Deckenmontage werden standardmäßige Anschlusspunkte verwendet; die Installation erfolgt durch ein autorisiertes Technikteam.", "question": "Wie erfolgt die Montage?"}, {"answer": "Eine regelmäßige Wartung sowie Prüfungen der Gasauslässe werden mindestens einmal jährlich empfohlen. Dank der modularen Konstruktion sind die Wartungszeiten kurz.", "question": "Wie häufig sollte die Wartung durchgeführt werden?"}, {"answer": "CE-zertifiziert und hergestellt gemäß den Produktionsstandards für Medizinprodukte nach ISO 13485.", "question": "Welche Normen werden erfüllt?"}], "specs": [], "features": [{"icon": "sparkles", "text": "Farbcodierte Quick-Connect-Gasauslässe zur Vermeidung von Fehlanschlüssen.", "title": "Sicheres Gasmanagement"}, {"icon": "sparkles", "text": "Großer Schwenkbereich für freie Beweglichkeit rund um den Operationstisch.", "title": "340° Schwenkbereich"}, {"icon": "sparkles", "text": "Robuste Trägerplattform für Anästhesiegerät, Monitor und Vaporisator.", "title": "Integrierte Geräteablage"}, {"icon": "sparkles", "text": "Schneller Service und einfache Wartung dank modularer Innenkonstruktion.", "title": "Einfache Wartung"}], "useCases": [{"icon": "layers", "text": "Operationssäle"}, {"icon": "layers", "text": "Anästhesiearbeitsplätze"}, {"icon": "layers", "text": "Hybride Operationssäle"}, {"icon": "layers", "text": "Einheiten für Herz- und Gefäßchirurgie"}, {"icon": "layers", "text": "Operationssäle von Lehrkrankenhäusern"}], "advantages": ["Aufgeräumter Arbeitsbereich ohne Kabel- und Schlauchchaos", "Farbcodierung für schnelle und fehlerfreie Gasanschlüsse", "Robuste Tragarmmechanik mit hoher Tragfähigkeit", "Anzahl und Anordnung der Auslässe entsprechend den Anforderungen des Krankenhauses anpassbar", "Leicht zu reinigende, hygienische Oberflächenbeschichtung"], "detailCards": [{"text": "Normgerechte, farbcodierte Quick-Connect-Anschlüsse für O2, N2O, Druckluft und Vakuum zur Vermeidung von Verwechslungen.", "title": "Farbcodierte Gasauslässe", "imageUrl": "/assets/images/products/anestezi-pendant-detail-1.jpg"}, {"text": "Langlebige Dreharmkonstruktion mit reibungsarmem Lagersystem für sanfte Bewegungen.", "title": "Robuste Tragarmmechanik", "imageUrl": "/assets/images/products/anestezi-pendant-detail-2.jpg"}, {"text": "Ausreichende Anzahl geerdeter Steckdosen für Anästhesiegeräte und Zusatzgeräte.", "title": "Integrierte Steckdosengruppe", "imageUrl": ""}, {"text": "Stabiles und verstellbares Regalsystem für Vaporisatoren, Monitore und Spritzenpumpen.", "title": "Geräteträgerplattform", "imageUrl": ""}], "featureTiles": [{"text": "Gas-, Steckdosen- und Regalmodule können bedarfsgerecht ergänzt werden.", "title": "Modulares Design"}, {"text": "Industriekomponenten für den dauerhaften Einsatz unter hoher Belastung.", "title": "Langlebige Konstruktion"}, {"text": "Praktische Montage über standardmäßige Deckenanschlusspunkte.", "title": "Schnelle Installation"}], "heroSubtitle": "Deckengeführtes Gas- & Elektrikmanagementsystem", "heroDescription": "Die Oxymed Anästhesie-Pendanteinheit vereint alle für das Anästhesieteam erforderlichen Medizingasauslässe, Steckdosen und Geräteträgerpunkte an einem beweglichen Tragarm, beseitigt Kabelchaos im Operationssaal und schafft maximalen Arbeitsraum für das Team."}, "en": {"faq": [{"answer": "In the standard configuration, it supports Oxygen (O2), Nitrous Oxide (N2O), Medical Air and Vacuum outlets; additional gas lines can be added upon request.", "question": "Which gases does the anesthesia pendant unit support?"}, {"answer": "Depending on the arm type, it has an equipment and device load capacity between 80 kg and 150 kg.", "question": "What is the load capacity?"}, {"answer": "Standard connection points are used for ceiling-mounted installation; installation is performed by an authorized technical team.", "question": "How is it installed?"}, {"answer": "Periodic maintenance and gas outlet testing are recommended at least once a year. Its modular structure enables short maintenance times.", "question": "How often should maintenance be performed?"}, {"answer": "It is CE certified and manufactured in compliance with ISO 13485 medical device manufacturing standards.", "question": "Which standards does it comply with?"}], "specs": [], "features": [{"icon": "sparkles", "text": "Color-coded quick-connect gas outlets designed to prevent misconnections.", "title": "Safe Gas Management"}, {"icon": "sparkles", "text": "Wide rotation angle for unrestricted movement around the operating table.", "title": "340° Rotation Capability"}, {"icon": "sparkles", "text": "Robust support platform for anesthesia machines, monitors and vaporizers.", "title": "Integrated Equipment Shelf"}, {"icon": "sparkles", "text": "Fast service and maintenance enabled by the modular internal structure.", "title": "Easy Maintenance"}], "useCases": [{"icon": "layers", "text": "Operating Rooms"}, {"icon": "layers", "text": "Anesthesia Stations"}, {"icon": "layers", "text": "Hybrid Operating Rooms"}, {"icon": "layers", "text": "Cardiovascular Surgery Units"}, {"icon": "layers", "text": "Teaching Hospital Operating Rooms"}], "advantages": ["An organized workspace free of cable and hose clutter", "Color coding for fast and error-free gas connections", "Durable arm mechanism with high load capacity", "Customizable number and layout of outlets according to hospital requirements", "Easy-to-clean, hygienic surface coating"], "detailCards": [{"text": "Standards-compliant, color-coded quick-connect connections for O2, N2O, Air and Vacuum, designed to prevent confusion.", "title": "Color-Coded Gas Outlets", "imageUrl": "/assets/images/products/anestezi-pendant-detail-1.jpg"}, {"text": "Long-lasting articulated arm structure with smooth movement provided by a frictionless bearing system.", "title": "Durable Arm Mechanism", "imageUrl": "/assets/images/products/anestezi-pendant-detail-2.jpg"}, {"text": "Sufficient number of grounded electrical sockets for anesthesia machines and auxiliary equipment.", "title": "Integrated Socket Group", "imageUrl": ""}, {"text": "Robust and adjustable shelf system for vaporizers, monitors and syringe pumps.", "title": "Equipment Support Platform", "imageUrl": ""}], "featureTiles": [{"text": "Gas, socket and shelf modules can be added as required.", "title": "Modular Design"}, {"text": "Industrial-grade components designed for intensive use.", "title": "Long-Life Construction"}, {"text": "Practical installation using standard ceiling connection points.", "title": "Quick Installation"}], "heroSubtitle": "Ceiling-Mounted Gas & Electrical Management System", "heroDescription": "The Oxymed Anesthesia Pendant Unit consolidates all medical gas outlets, electrical sockets and equipment support points required by the anesthesia team on a single articulated arm, eliminating cable clutter in the operating room and providing maximum working space for the team."}, "fa": {"faq": [{"answer": "در پیکربندی استاندارد از خروجی‌های اکسیژن (O2)، نیتروس اکساید (N2O)، هوای پزشکی و وکیوم پشتیبانی می‌کند؛ بنا به درخواست، خطوط گاز اضافی قابل افزودن هستند.", "question": "یونیت پندانت بیهوشی از چه گازهایی پشتیبانی می‌کند؟"}, {"answer": "بسته به نوع بازو، ظرفیت تحمل دستگاه و تجهیزات بین 80 kg تا 150 kg است.", "question": "ظرفیت باربری چیست؟"}, {"answer": "برای نصب سقفی از نقاط اتصال استاندارد استفاده می‌شود؛ نصب توسط تیم فنی مجاز انجام می‌گیرد.", "question": "نصب آن چگونه انجام می‌شود؟"}, {"answer": "انجام سرویس دوره‌ای و آزمون خروجی‌های گاز حداقل سالی یک‌بار توصیه می‌شود. به‌دلیل ساختار ماژولار، زمان سرویس کوتاه است.", "question": "سرویس و نگهداری آن هر چند وقت یک‌بار باید انجام شود؟"}, {"answer": "دارای گواهی CE بوده و مطابق با استانداردهای تولید تجهیزات پزشکی ISO 13485 تولید می‌شود.", "question": "مطابق با چه استانداردهایی است؟"}], "specs": [], "features": [{"icon": "sparkles", "text": "خروجی‌های گاز quick-connect با کد رنگی که از اتصال نادرست جلوگیری می‌کنند.", "title": "مدیریت ایمن گاز"}, {"icon": "sparkles", "text": "زاویه چرخش گسترده برای حرکت آزادانه در اطراف میز جراحی.", "title": "قابلیت چرخش 340°"}, {"icon": "sparkles", "text": "پلتفرم حمل مستحکم برای دستگاه بیهوشی، مانیتور و وپاریزر.", "title": "قفسه یکپارچه تجهیزات"}, {"icon": "sparkles", "text": "امکان سرویس و نگهداری سریع به‌واسطه ساختار داخلی ماژولار.", "title": "نگهداری آسان"}], "useCases": [{"icon": "layers", "text": "اتاق‌های عمل"}, {"icon": "layers", "text": "ایستگاه‌های بیهوشی"}, {"icon": "layers", "text": "اتاق‌های عمل هیبریدی"}, {"icon": "layers", "text": "واحدهای جراحی قلب و عروق"}, {"icon": "layers", "text": "اتاق‌های عمل بیمارستان‌های آموزشی"}], "advantages": ["محیط کاری منظم و عاری از آشفتگی کابل و شلنگ", "کدگذاری رنگی برای اتصال سریع و بدون خطای گاز", "مکانیزم بازوی بادوام با ظرفیت باربری بالا", "تعداد و چیدمان خروجی‌ها قابل سفارشی‌سازی بر اساس نیاز بیمارستان", "پوشش سطحی بهداشتی و قابل تمیزکاری آسان"], "detailCards": [{"text": "اتصالات quick-connect رنگی و مطابق با استاندارد برای O2، N2O، هوا و وکیوم که از اشتباه جلوگیری می‌کنند.", "title": "خروجی‌های گاز با کد رنگی", "imageUrl": "/assets/images/products/anestezi-pendant-detail-1.jpg"}, {"text": "ساختار بازوی چرخان بادوام با حرکت روان و سیستم بلبرینگ بدون اصطکاک.", "title": "مکانیزم بازوی بادوام", "imageUrl": "/assets/images/products/anestezi-pendant-detail-2.jpg"}, {"text": "تعداد کافی پریز برق ارت‌دار برای دستگاه‌های بیهوشی و تجهیزات جانبی.", "title": "مجموعه پریز یکپارچه", "imageUrl": ""}, {"text": "سیستم قفسه مستحکم و قابل تنظیم برای وپاریزر، مانیتور و پمپ‌های سرنگ.", "title": "پلتفرم حمل تجهیزات", "imageUrl": ""}], "featureTiles": [{"text": "ماژول‌های گاز، پریز و قفسه بر اساس نیاز قابل افزودن هستند.", "title": "طراحی ماژولار"}, {"text": "اجزای صنعتی مقاوم در برابر استفاده فشرده.", "title": "ساختار بادوام"}, {"text": "نصب عملی با نقاط اتصال استاندارد سقفی.", "title": "نصب سریع"}], "heroSubtitle": "سیستم مدیریت گاز و برق سقفی", "heroDescription": "یونیت پندانت بیهوشی Oxymed تمامی خروجی‌های گاز پزشکی، پریزهای برق و نقاط حمل تجهیزات موردنیاز تیم بیهوشی را بر روی یک بازوی متحرک گرد هم می‌آورد، آشفتگی کابل‌ها را در اتاق عمل برطرف می‌کند و حداکثر فضای کاری را برای تیم فراهم می‌سازد."}, "fr": {"faq": [{"answer": "Dans la configuration standard, il prend en charge les sorties d’Oxygène (O2), de Protoxyde d’azote (N2O), d’Air médical et de Vide ; des lignes de gaz supplémentaires peuvent être ajoutées sur demande.", "question": "Quels gaz l’unité pendulaire d’anesthésie prend-elle en charge ?"}, {"answer": "Selon le type de bras, elle offre une capacité de charge pour appareils et équipements comprise entre 80 kg et 150 kg.", "question": "Quelle est la capacité de charge ?"}, {"answer": "Des points de fixation standard sont utilisés pour le montage au plafond ; l’installation est réalisée par une équipe technique agréée.", "question": "Comment s’effectue le montage ?"}, {"answer": "Un entretien périodique et des essais des sorties de gaz sont recommandés au moins une fois par an. Sa structure modulaire permet de réduire les temps de maintenance.", "question": "À quelle fréquence l’entretien doit-il être effectué ?"}, {"answer": "Certifiée CE, elle est fabriquée conformément aux normes de production des dispositifs médicaux ISO 13485.", "question": "À quelles normes est-elle conforme ?"}], "specs": [], "features": [{"icon": "sparkles", "text": "Sorties de gaz quick-connect codées par couleur, empêchant les erreurs de raccordement.", "title": "Gestion sécurisée des gaz"}, {"icon": "sparkles", "text": "Large angle de rotation pour une liberté de mouvement autour de la table d’opération.", "title": "Rotation à 340°"}, {"icon": "sparkles", "text": "Plateforme de support robuste pour appareil d’anesthésie, moniteur et vaporisateur.", "title": "Étagère intégrée pour équipements"}, {"icon": "sparkles", "text": "Structure interne modulaire permettant un entretien et une maintenance rapides.", "title": "Maintenance facile"}], "useCases": [{"icon": "layers", "text": "Blocs opératoires"}, {"icon": "layers", "text": "Postes d’anesthésie"}, {"icon": "layers", "text": "Salles d’opération hybrides"}, {"icon": "layers", "text": "Unités de chirurgie cardiovasculaire"}, {"icon": "layers", "text": "Blocs opératoires d’hôpitaux universitaires"}], "advantages": ["Espace de travail organisé, sans encombrement de câbles ni de flexibles", "Codage couleur assurant un raccordement rapide et sans erreur des gaz", "Mécanisme de bras robuste à haute capacité de charge", "Nombre et disposition des sorties personnalisables selon les besoins de l’hôpital", "Revêtement de surface hygiénique et facile à nettoyer"], "detailCards": [{"text": "Raccordements quick-connect codés par couleur, conformes aux normes et évitant toute confusion, pour O2, N2O, Air et Vide.", "title": "Sorties de gaz codées par couleur", "imageUrl": "/assets/images/products/anestezi-pendant-detail-1.jpg"}, {"text": "Structure de bras rotatif durable, à mouvement fluide grâce à un système de roulements sans friction.", "title": "Mécanisme de bras robuste", "imageUrl": "/assets/images/products/anestezi-pendant-detail-2.jpg"}, {"text": "Nombre suffisant de prises électriques avec mise à la terre pour les appareils d’anesthésie et équipements auxiliaires.", "title": "Bloc de prises intégré", "imageUrl": ""}, {"text": "Système d’étagères robuste et réglable pour vaporisateur, moniteur et pompes à seringue.", "title": "Plateforme de support des équipements", "imageUrl": ""}], "featureTiles": [{"text": "Des modules de gaz, de prises et d’étagères peuvent être ajoutés selon les besoins.", "title": "Conception modulaire"}, {"text": "Composants industriels résistants à une utilisation intensive.", "title": "Structure durable"}, {"text": "Installation pratique grâce à des points de fixation au plafond standard.", "title": "Installation rapide"}], "heroSubtitle": "Système de gestion des gaz et de l’électricité monté au plafond", "heroDescription": "L’unité pendulaire d’anesthésie Oxymed, qui regroupe sur un seul bras mobile toutes les sorties de gaz médicaux, les prises électriques et les points de support d’équipements requis par l’équipe d’anesthésie, élimine l’encombrement des câbles dans le bloc opératoire et offre un espace de travail maximal à l’équipe."}, "it": {"faq": [{"answer": "Nella configurazione standard supporta le prese di Ossigeno (O2), Protossido di Azoto (N2O), Aria medicale e Vuoto; su richiesta possono essere aggiunte ulteriori linee gas.", "question": "Quali gas supporta l'unità pensile per anestesia?"}, {"answer": "A seconda del tipo di braccio, ha una capacità di carico per dispositivi e apparecchiature compresa tra 80 kg e 150 kg.", "question": "Qual è la capacità di carico?"}, {"answer": "Per il montaggio a soffitto vengono utilizzati punti di fissaggio standard; l'installazione viene eseguita da personale tecnico autorizzato.", "question": "Come viene installata?"}, {"answer": "Si raccomandano manutenzione periodica e test delle prese gas almeno una volta all'anno. Grazie alla struttura modulare, i tempi di manutenzione sono brevi.", "question": "Con quale frequenza deve essere effettuata la manutenzione?"}, {"answer": "È certificata CE e prodotta in conformità agli standard di produzione di dispositivi medici ISO 13485.", "question": "A quali standard è conforme?"}], "specs": [], "features": [{"icon": "sparkles", "text": "Prese gas quick-connect codificate a colori, progettate per prevenire collegamenti errati.", "title": "Gestione Sicura dei Gas"}, {"icon": "sparkles", "text": "Ampio angolo di rotazione per la libera movimentazione attorno al tavolo operatorio.", "title": "Rotazione di 340°"}, {"icon": "sparkles", "text": "Robusta piattaforma di supporto per apparecchio di anestesia, monitor e vaporizzatore.", "title": "Ripiano Integrato per Dispositivi"}, {"icon": "sparkles", "text": "Interventi di assistenza e manutenzione rapidi grazie alla struttura interna modulare.", "title": "Manutenzione Semplificata"}], "useCases": [{"icon": "layers", "text": "Sale operatorie"}, {"icon": "layers", "text": "Postazioni di anestesia"}, {"icon": "layers", "text": "Sale operatorie ibride"}, {"icon": "layers", "text": "Unità di chirurgia cardiovascolare"}, {"icon": "layers", "text": "Sale operatorie di ospedali universitari"}], "advantages": ["Area di lavoro ordinata, priva di ingombri di cavi e tubi", "Codifica a colori per un collegamento dei gas rapido e senza errori", "Meccanismo a braccio resistente, ad alta capacità di carico", "Numero e disposizione delle prese personalizzabili in base alle esigenze ospedaliere", "Rivestimento superficiale igienico e facilmente pulibile"], "detailCards": [{"text": "Connessioni quick-connect codificate a colori e conformi agli standard per O2, N2O, Aria e Vuoto, progettate per evitare confusioni.", "title": "Prese Gas Codificate a Colori", "imageUrl": "/assets/images/products/anestezi-pendant-detail-1.jpg"}, {"text": "Struttura con braccio rotante di lunga durata, con movimento fluido grazie al sistema di cuscinetti a basso attrito.", "title": "Meccanismo del Braccio Resistente", "imageUrl": "/assets/images/products/anestezi-pendant-detail-2.jpg"}, {"text": "Numero adeguato di prese elettriche con messa a terra per apparecchi di anestesia e apparecchiature ausiliarie.", "title": "Gruppo Prese Integrato", "imageUrl": ""}, {"text": "Sistema di ripiani robusto e regolabile per vaporizzatore, monitor e pompe a siringa.", "title": "Piattaforma di Supporto per Dispositivi", "imageUrl": ""}], "featureTiles": [{"text": "È possibile aggiungere moduli gas, prese elettriche e ripiani in base alle necessità.", "title": "Design Modulare"}, {"text": "Componenti industriali resistenti all'uso intensivo.", "title": "Struttura di Lunga Durata"}, {"text": "Installazione pratica con punti di fissaggio standard a soffitto.", "title": "Installazione Rapida"}], "heroSubtitle": "Sistema di Gestione di Gas ed Elettricità a Soffitto", "heroDescription": "L'Unità Pensile per Anestesia Oxymed, che riunisce su un unico braccio mobile tutte le prese di gas medicali, le prese elettriche e i punti di supporto per dispositivi necessari al team di anestesia, elimina l'ingombro dei cavi in sala operatoria e garantisce al personale il massimo spazio di lavoro."}, "ka": {"faq": [{"answer": "სტანდარტულ კონფიგურაციაში მხარს უჭერს ჟანგბადის (O2), აზოტის პროტოქსიდის (N2O), სამედიცინო ჰაერისა და ვაკუუმის გამოსასვლელებს; მოთხოვნის შესაბამისად შეიძლება დაემატოს დამატებითი გაზის ხაზები.", "question": "რომელ გაზებს უჭერს მხარს ანესთეზიის პენდანტის ერთეული?"}, {"answer": "მკლავის ტიპის მიხედვით, მოწყობილობებისა და აღჭურვილობის ტარების მოცულობა 80 kg-დან 150 kg-მდეა.", "question": "რა არის დატვირთვის ტევადობა?"}, {"answer": "ჭერზე დასამონტაჟებლად გამოიყენება სტანდარტული სამონტაჟო წერტილები; ინსტალაციას ახორციელებს უფლებამოსილი ტექნიკური გუნდი.", "question": "როგორ ხდება მონტაჟი?"}, {"answer": "რეკომენდებულია პერიოდული ტექნიკური მომსახურება და გაზის გამოსასვლელების ტესტირება წელიწადში მინიმუმ ერთხელ. მოდულური სტრუქტურის წყალობით, მომსახურების დრო მოკლეა.", "question": "რა სიხშირით უნდა ჩატარდეს ტექნიკური მომსახურება?"}, {"answer": "აქვს CE სერტიფიკატი და იწარმოება ISO 13485 სამედიცინო მოწყობილობების წარმოების სტანდარტების შესაბამისად.", "question": "რომელ სტანდარტებს შეესაბამება?"}], "specs": [], "features": [{"icon": "sparkles", "text": "ფერთა კოდირებით აღჭურვილი quick-connect გაზის გამოსასვლელები, რომლებიც არასწორ შეერთებას აფერხებს.", "title": "გაზის უსაფრთხო მართვა"}, {"icon": "sparkles", "text": "ფართო ბრუნვის კუთხე საოპერაციო მაგიდის ირგვლივ თავისუფალი გადაადგილებისთვის.", "title": "340°-იანი ბრუნვის შესაძლებლობა"}, {"icon": "sparkles", "text": "მყარი სატარებელი პლატფორმა ანესთეზიის აპარატისთვის, მონიტორისა და ვაპორაიზერისთვის.", "title": "ინტეგრირებული მოწყობილობის თარო"}, {"icon": "sparkles", "text": "მოდულური შიდა სტრუქტურის წყალობით, უზრუნველყოფს სწრაფ სერვისსა და ტექნიკურ მომსახურებას.", "title": "მარტივი ტექნიკური მომსახურება"}], "useCases": [{"icon": "layers", "text": "საოპერაციო ოთახები"}, {"icon": "layers", "text": "ანესთეზიის სადგურები"}, {"icon": "layers", "text": "ჰიბრიდული საოპერაციო ოთახები"}, {"icon": "layers", "text": "კარდიოვასკულარული ქირურგიის განყოფილებები"}, {"icon": "layers", "text": "სასწავლო საავადმყოფოების საოპერაციო ოთახები"}], "advantages": ["მოწესრიგებული სამუშაო სივრცე კაბელებისა და შლანგების არეულობის გარეშე", "ფერთა კოდირება სწრაფი და შეცდომების გარეშე გაზის შეერთებისთვის", "მაღალი დატვირთვის ტევადობის მქონე, გამძლე მკლავის მექანიზმი", "საავადმყოფოს საჭიროებების შესაბამისად მორგებადი გამოსასვლელების რაოდენობა და განლაგება", "მარტივად გასაწმენდი, ჰიგიენური ზედაპირის საფარი"], "detailCards": [{"text": "O2, N2O, ჰაერისა და ვაკუუმისთვის სტანდარტებთან შესაბამისი, არეულობის თავიდან ამცილებელი ფერთა კოდირებული quick-connect შეერთებები.", "title": "ფერთა კოდირებული გაზის გამოსასვლელები", "imageUrl": "/assets/images/products/anestezi-pendant-detail-1.jpg"}, {"text": "ხანგრძლივი ექსპლუატაციის მქონე მბრუნავი მკლავის კონსტრუქცია, რომელიც ხახუნის გარეშე საკისრების სისტემით შეუფერხებლად მოძრაობს.", "title": "გამძლე მკლავის მექანიზმი", "imageUrl": "/assets/images/products/anestezi-pendant-detail-2.jpg"}, {"text": "ანესთეზიის აპარატებისა და დამხმარე აღჭურვილობისთვის საკმარისი რაოდენობის დამიწებული ელექტრო როზეტები.", "title": "ინტეგრირებული როზეტების ჯგუფი", "imageUrl": ""}, {"text": "მყარი და რეგულირებადი თაროს სისტემა ვაპორაიზერის, მონიტორისა და საინფუზიო ტუმბოებისთვის.", "title": "მოწყობილობების სატარებელი პლატფორმა", "imageUrl": ""}], "featureTiles": [{"text": "საჭიროების შესაბამისად შეიძლება დაემატოს გაზის, როზეტისა და თაროს მოდულები.", "title": "მოდულური დიზაინი"}, {"text": "ინტენსიური გამოყენებისადმი მდგრადი სამრეწველო კომპონენტები.", "title": "ხანგრძლივი ექსპლუატაციის კონსტრუქცია"}, {"text": "პრაქტიკული მონტაჟი სტანდარტული ჭერის სამონტაჟო წერტილებით.", "title": "სწრაფი ინსტალაცია"}], "heroSubtitle": "ჭერზე დასამონტაჟებელი გაზისა და ელექტროენერგიის მართვის სისტემა", "heroDescription": "Oxymed ანესთეზიის პენდანტის ერთეული, რომელიც ანესთეზიის გუნდისთვის საჭირო ყველა სამედიცინო გაზის გამოსასვლელს, ელექტრო როზეტსა და მოწყობილობების სატარებელ წერტილს ერთ მოძრავ მკლავზე აერთიანებს, საოპერაციო ოთახში გამორიცხავს კაბელების არეულობას და გუნდს მაქსიმალურ სამუშაო სივრცეს უზრუნველყოფს."}, "ru": {"faq": [{"answer": "В стандартной конфигурации поддерживает выходы Кислорода (O2), Закиси азота (N2O), Медицинского воздуха и Вакуума; по запросу могут быть добавлены дополнительные газовые линии.", "question": "Какие газы поддерживает анестезиологическая консоль?"}, {"answer": "В зависимости от типа кронштейна имеет грузоподъёмность для аппаратов и оборудования от 80 kg до 150 kg.", "question": "Какова грузоподъёмность?"}, {"answer": "Для потолочного монтажа используются стандартные точки крепления; установку выполняет уполномоченная техническая бригада.", "question": "Как выполняется монтаж?"}, {"answer": "Рекомендуется проводить периодическое техническое обслуживание и проверку газовых выходов не реже одного раза в год. Благодаря модульной конструкции сроки обслуживания сокращены.", "question": "Как часто следует проводить техническое обслуживание?"}, {"answer": "Имеет сертификацию CE и производится в соответствии со стандартами производства медицинских изделий ISO 13485.", "question": "Каким стандартам соответствует?"}], "specs": [], "features": [{"icon": "sparkles", "text": "Цветовая маркировка и быстроразъёмные газовые выходы, предотвращающие ошибочное подключение.", "title": "Безопасное управление газами"}, {"icon": "sparkles", "text": "Широкий угол поворота для свободного перемещения вокруг операционного стола.", "title": "Поворот на 340°"}, {"icon": "sparkles", "text": "Прочная платформа для размещения анестезиологического аппарата, монитора и испарителя.", "title": "Встроенная полка для оборудования"}, {"icon": "sparkles", "text": "Быстрый сервис и техническое обслуживание благодаря модульной внутренней конструкции.", "title": "Простое обслуживание"}], "useCases": [{"icon": "layers", "text": "Операционные"}, {"icon": "layers", "text": "Анестезиологические станции"}, {"icon": "layers", "text": "Гибридные операционные"}, {"icon": "layers", "text": "Отделения сердечно-сосудистой хирургии"}, {"icon": "layers", "text": "Операционные учебных больниц"}], "advantages": ["Организованное рабочее пространство без путаницы кабелей и шлангов", "Цветовая маркировка для быстрого и безошибочного подключения газов", "Прочный кронштейн с высокой грузоподъёмностью", "Настраиваемое количество и расположение выходов в соответствии с потребностями больницы", "Легко очищаемое гигиеничное покрытие поверхности"], "detailCards": [{"text": "Стандартизированные цветные быстроразъёмные соединения для O2, N2O, Воздуха и Вакуума, предотвращающие ошибочные подключения.", "title": "Газовые выходы с цветовой маркировкой", "imageUrl": "/assets/images/products/anestezi-pendant-detail-1.jpg"}, {"text": "Долговечная поворотная конструкция кронштейна с плавным ходом благодаря безфрикционной подшипниковой системе.", "title": "Прочный механизм кронштейна", "imageUrl": "/assets/images/products/anestezi-pendant-detail-2.jpg"}, {"text": "Достаточное количество заземлённых электрических розеток для анестезиологических аппаратов и вспомогательного оборудования.", "title": "Встроенная группа розеток", "imageUrl": ""}, {"text": "Прочная регулируемая система полок для испарителя, монитора и инфузионных насосов.", "title": "Платформа для оборудования", "imageUrl": ""}], "featureTiles": [{"text": "При необходимости могут быть добавлены модули газовых выходов, розеток и полок.", "title": "Модульная конструкция"}, {"text": "Промышленные компоненты, устойчивые к интенсивной эксплуатации.", "title": "Долговечная конструкция"}, {"text": "Практичный монтаж с использованием стандартных потолочных точек крепления.", "title": "Быстрая установка"}], "heroSubtitle": "Потолочная система управления газами и электропитанием", "heroDescription": "Анестезиологическая консоль Oxymed объединяет на одном подвижном кронштейне все необходимые анестезиологической бригаде выходы медицинских газов, электрические розетки и точки размещения оборудования, устраняет путаницу кабелей в операционной и обеспечивает персоналу максимальное рабочее пространство."}}, "features": [{"icon": "sparkles", "text": "Renk kodlu, yanlış bağlantıyı önleyen quick-connect gaz çıkışları.", "title": "Güvenli Gaz Yönetimi"}, {"icon": "sparkles", "text": "Ameliyat masası etrafında serbest hareket için geniş dönüş açısı.", "title": "340° Dönüş Kabiliyeti"}, {"icon": "sparkles", "text": "Anestezi cihazı, monitör ve vaporizatör için sağlam taşıma platformu.", "title": "Entegre Cihaz Rafı"}, {"icon": "sparkles", "text": "Modüler iç yapı sayesinde hızlı servis ve bakım imkanı.", "title": "Kolay Bakım"}], "useCases": [{"icon": "layers", "text": "Ameliyathaneler"}, {"icon": "layers", "text": "Anestezi İstasyonları"}, {"icon": "layers", "text": "Hibrit Ameliyat Odaları"}, {"icon": "layers", "text": "Kalp Damar Cerrahisi Üniteleri"}, {"icon": "layers", "text": "Eğitim Hastaneleri Ameliyathaneleri"}], "advantages": ["Kablo ve hortum karmaşası olmayan düzenli bir çalışma alanı", "Hızlı ve hatasız gaz bağlantısı sağlayan renkli kodlama", "Yüksek yük kapasiteli, dayanıklı kol mekanizması", "Hastane ihtiyacına göre özelleştirilebilir çıkış sayısı ve yerleşimi", "Kolay temizlenebilir, hijyenik yüzey kaplaması"], "detailCards": [{"text": "O2, N2O, Hava ve Vakum için standartlara uygun, karışıklığı önleyen renkli quick-connect bağlantılar.", "title": "Renk Kodlu Gaz Çıkışları", "imageUrl": "/assets/images/products/anestezi-pendant-detail-1.jpg"}, {"text": "Sürtünmesiz rulman sistemi ile yumuşak hareket eden, uzun ömürlü döner kol yapısı.", "title": "Dayanıklı Kol Mekanizması", "imageUrl": "/assets/images/products/anestezi-pendant-detail-2.jpg"}, {"text": "Anestezi cihazları ve yardımcı ekipmanlar için yeterli sayıda topraklı elektrik prizi.", "title": "Entegre Priz Grubu", "imageUrl": ""}, {"text": "Vaporizatör, monitör ve enjektör pompaları için sağlam ve ayarlanabilir raf sistemi.", "title": "Cihaz Taşıma Platformu", "imageUrl": ""}], "featureTiles": [{"text": "İhtiyaca göre gaz, priz ve raf modülleri eklenebilir.", "title": "Modüler Tasarım"}, {"text": "Yoğun kullanıma dayanıklı endüstriyel bileşenler.", "title": "Uzun Ömürlü Yapı"}, {"text": "Standart tavan bağlantı noktaları ile pratik montaj.", "title": "Hızlı Kurulum"}], "heroSubtitle": "Tavan Tipi Gaz & Elektrik Yönetim Sistemi", "sectionOrder": ["detailCards", "technical", "useCases", "featureTiles", "faq"], "hiddenSections": [], "heroDescription": "Anestezi ekibinin ihtiyaç duyduğu tüm medikal gaz çıkışlarını, elektrik prizlerini ve cihaz taşıma noktalarını tek bir hareketli kol üzerinde toplayan Oxymed Anestezi Pendant Ünitesi, ameliyathanede kablo karmaşasını ortadan kaldırır ve ekip için maksimum çalışma alanı sağlar.", "templateVersion": 1}	{"materials": []}	Anestezi Pendant Ünitesi	["O2 / N2O / Hava / Vakum çıkışları", "340° dönüş kollu", "Entegre priz grubu"]	OXM-APU-100	/assets/images/products/anestezi-pendant-hero.jpg	ADET	\N	Anesthesia Pendant Unit	Anästhesie-Pendantsystem	Système de pendant d’anesthésie	Sistema pensile per anestesia	وحدة بندانت التخدير	Анестезиологическая консоль	پندانت بیهوشی	ანესთეზიის პენდანტი	Анестезиологична конзола	Anesteziya pendant sistemi	f	2	\N
\.


--
-- Data for Name: quote_form_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quote_form_items (id, form_id, product_id, title, bullets, model_code, image_url, quantity, unit, unit_price, sort_order, item_type, parent_item_id, show_in_pdf, page_break_before, keep_with_previous, keep_with_next) FROM stdin;
7749	10	\N	Medikal Gaz Alarm Paneli	["HTM 2022 ye birebir uygun, Yüksek-Normal-Düşük Basınç Göstergeli", "Gazın anlık geçiş basıncını izleyebilen - Switchleri ile Komple"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/66921ec0-369a-415e-802a-d7b28b40def6	0	ADET	0.00	0	group	\N	t	f	f	f
4988	8	\N	Medikal Gaz Alarm Paneli	["HTM 2022 ye birebir uygun, Yüksek-Normal-Düşük Basınç Göstergeli", "Gazın anlık geçiş basıncını izleyebilen - Switchleri ile Komple"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/66921ec0-369a-415e-802a-d7b28b40def6	0	ADET	0.00	0	group	\N	t	f	f	f
3	4	4	Medikal Gaz Alarmı	[]	\N	/assets/images/product-electrical-data.png	1	ADET	0.00	0	single	\N	t	f	f	f
7750	10	\N	—	[]	1 Gaz İçin	\N	1	ADET	150.00	1	child	\N	t	f	f	f
7751	10	\N	—	[]	2 Gaz İçin	\N	0	ADET	140.00	2	child	\N	f	f	f	f
7752	10	\N	—	[]	3 Gaz İçin	\N	0	ADET	160.00	3	child	\N	f	f	f	f
7753	10	\N	—	[]	4 Gaz İçin	\N	0	ADET	180.00	4	child	\N	f	f	f	f
7754	10	\N	—	[]	5 Gaz İçin	\N	0	ADET	200.00	5	child	\N	f	f	f	f
7755	10	\N	Medikal Gaz Vana Kutusu	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/a60fdfb3-ca96-4175-99f0-b3e65b23e32a	0	ADET	0.00	6	group	\N	t	f	f	f
4989	8	\N	—	[]	1 Gaz İçin	\N	0	ADET	120.00	1	child	\N	f	f	f	f
4990	8	\N	—	[]	2 Gaz İçin	\N	0	ADET	140.00	2	child	\N	f	f	f	f
4991	8	\N	—	[]	3 Gaz İçin	\N	6	ADET	160.00	3	child	\N	t	f	f	f
4992	8	\N	—	[]	4 Gaz İçin	\N	0	ADET	180.00	4	child	\N	f	f	f	f
4993	8	\N	—	[]	5 Gaz İçin	\N	0	ADET	200.00	5	child	\N	f	f	f	f
4994	8	\N	Medikal Gaz Vana Kutusu	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/a60fdfb3-ca96-4175-99f0-b3e65b23e32a	0	ADET	0.00	6	group	\N	t	f	f	f
4995	8	\N	—	[]	1 Gaz İçin	\N	0	ADET	150.00	7	child	\N	f	f	f	f
4996	8	\N	—	[]	2 Gaz İçin	\N	0	ADET	190.00	8	child	\N	f	f	f	f
4997	8	\N	—	[]	3 Gaz İçin	\N	6	ADET	230.00	9	child	\N	t	f	f	f
4998	8	\N	—	[]	4 Gaz İçin	\N	0	ADET	270.00	10	child	\N	f	f	f	f
4999	8	\N	—	[]	5 Gaz İçin	\N	0	ADET	310.00	11	child	\N	f	f	f	f
5000	8	\N	Medikal Gaz Prizleri	["BS Standardı, Tamamıyla Metal Konstrüksiyon"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/dfc343ac-0192-49d2-95ea-fd38fd4b014f	0	ADET	0.00	12	group	\N	t	f	f	f
5001	8	\N	—	[]	Oksijen Prizi	\N	134	ADET	22.00	13	child	\N	t	f	f	f
5002	8	\N	—	[]	Vakum Prizi	\N	134	ADET	22.00	14	child	\N	t	f	f	f
5003	8	\N	—	[]	N2O Prizi	\N	0	ADET	22.00	15	child	\N	t	f	f	f
5004	8	\N	—	[]	Basınçlı Hava Prizi (MA4)	\N	134	ADET	22.00	16	child	\N	t	f	f	f
5005	8	\N	—	[]	Basınçlı Hava Prizi (SA7)	\N	0	ADET	22.00	17	child	\N	t	f	f	f
5006	8	\N	—	[]	AGSS Prizi VENTÜRİ	\N	0	ADET	45.00	18	child	\N	t	f	f	f
5007	8	\N	Medikal Bakır Boruları	["İtalya ,Almanya'dan ithal, EN 13348 standardında"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4795266d-90dc-4396-87ca-a020f6ca9255	0	ADET	0.00	19	group	\N	t	f	f	f
5008	8	\N	—	[]	Ø12X1 mm.	\N	2500	METRE	14.20	20	child	\N	t	f	f	f
5009	8	\N	—	[]	Ø15X1 mm.	\N	250	METRE	17.21	21	child	\N	t	f	f	f
5010	8	\N	—	[]	Ø22X1 mm.	\N	850	METRE	24.02	22	child	\N	t	f	f	f
5011	8	\N	—	[]	Ø28X1 mm.	\N	215	METRE	30.26	23	child	\N	t	f	f	f
5012	8	\N	—	[]	Ø35X1 mm.	\N	190	METRE	37.47	24	child	\N	t	f	f	f
5013	8	\N	—	[]	Ø42X1 mm.	\N	1	METRE	0.00	25	child	\N	f	f	f	f
5014	8	\N	—	[]	Ø54X1 mm.	\N	0	METRE	0.00	26	child	\N	f	f	f	f
5015	8	\N	—	[]	Ø76X1 mm.	\N	0	METRE	0.00	27	child	\N	f	f	f	f
5016	8	\N	—	[]	Ø108X1 mm.	\N	0	METRE	0.00	28	child	\N	f	f	f	f
5017	8	\N	Hastabaşı Ünitesi	["1 Kişilik Hasta Yoğun Bakım Ünitesi (150 cm.)", "Alüminyum Yatay Tip, Duvara montaj", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Ünite Boyunca Ray- Paslanmaz Çelik"]	OXY-HYB-100	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/f5780e62-9914-41b3-b36c-b57922244bd6	96	ADET	180.00	29	single	\N	t	f	f	f
5018	8	\N	Hasta Yoğun Bakım Ünitesi	["1 Kişilik Yoğun Bakım Ünitesi (150 - 180 cm.)", "Alüminyum Yatay Tip, Duvara montaj", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Ünite Boyunca Ray- Paslanmaz Çelik"]	OXY-YBU-200	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/206cf3a1-19d8-4108-bc72-5cfb20c00fd4	13	ADET	220.00	30	single	\N	t	f	f	f
5019	8	\N	Kolon Tipi Yoğun Bakım Ünitesi - (Tek Hasta İçin)	["Alüminyum Yan Gövdeler, MDF ön ve arka yüzey, Tavan yüksekliğinde", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Askı Rayı - Paslanmaz Çelik"]	OXY-KTYB-100	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/b8daca1b-e15d-413d-9c1d-194152466f8a	6	ADET	800.00	31	single	\N	t	f	t	f
5020	8	\N	ORTA BLOK MONTAJ İŞİ	[]	\N	\N	0	ADET	0.00	32	group	\N	t	f	f	f
5021	8	\N	—	[]	Pendant	\N	2	ADET	350.00	33	child	\N	t	f	f	f
5022	8	\N	—	[]	Anestezi Modül	\N	2	ADET	45.00	34	child	\N	t	f	f	f
5023	8	\N	—	[]	Cerrahi Modül	\N	2	ADET	35.00	35	child	\N	t	f	f	f
5024	8	\N	—	[]	Yoğun Bakım Ünitesi	\N	7	ADET	55.00	36	child	\N	t	f	f	f
5025	8	\N	—	[]	Hasta Yatak Başı Ünitesi	\N	26	ADET	35.00	37	child	\N	t	f	f	f
5026	8	\N	—	[]	3 Gazlı Bölgesel	\N	3	ADET	65.00	38	child	\N	t	f	f	f
5027	8	\N	—	[]	5 Gazlı Bölgesel	\N	2	ADET	100.00	39	child	\N	t	f	f	f
5028	8	\N	Tek Kişilik Dental Teknisyen Masası - Model 02	["Tek vakumlu teknisyen masası.", "220 V / AC 50 Hz. / Max. 1250 Watt.", "1 mm. kalınlığında çeliktan imal edilmiștir.", "Elektrostatik toz boya ile boyanmıștır..", "Ral renk seçenekleri mevcuttur.", "Gaz musluğu.", "3 mm PVC kenar korumalı", "30 mm șekillendirilmiș lamine", "Hava tabancası giriși", "Çalıșma alanında el motoru muhafaza alanları"]	DTM-02	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/f57c827c-e066-4a85-8b52-8be63fd03f57	1	ADET	0.00	40	single	\N	t	f	f	f
7756	10	\N	—	[]	1 Gaz İçin	\N	1	ADET	187.50	7	child	\N	t	f	f	f
7757	10	\N	—	[]	2 Gaz İçin	\N	0	ADET	190.00	8	child	\N	f	f	f	f
7758	10	\N	—	[]	3 Gaz İçin	\N	0	ADET	230.00	9	child	\N	f	f	f	f
7759	10	\N	—	[]	4 Gaz İçin	\N	0	ADET	270.00	10	child	\N	f	f	f	f
7760	10	\N	—	[]	5 Gaz İçin	\N	0	ADET	310.00	11	child	\N	f	f	f	f
7761	10	\N	Bölüm Kesme Vanaları	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/46d5478b-0f9b-4ab0-9c97-ed1a8abab053	0	ADET	0.00	12	group	\N	t	f	f	f
7762	10	\N	—	[]	12mm Çap	\N	24	ADET	21.88	13	child	\N	t	f	f	f
7763	10	\N	—	[]	15mm Çap	\N	0	ADET	19.30	14	child	\N	f	f	f	f
7764	10	\N	—	[]	22mm Çap	\N	0	ADET	26.00	15	child	\N	f	f	f	f
7765	10	\N	—	[]	28mm Çap	\N	0	ADET	32.00	16	child	\N	f	f	f	f
7766	10	\N	—	[]	35mm Çap	\N	0	ADET	38.00	17	child	\N	f	f	f	f
7767	10	\N	—	[]	42mm Çap	\N	0	ADET	43.00	18	child	\N	f	f	f	f
7768	10	\N	—	[]	54mm Çap	\N	0	ADET	56.00	19	child	\N	f	f	f	f
7769	10	\N	—	[]	1/4 0-10 BAR REGÜLATÖR	\N	24	ADET	56.25	20	child	\N	t	f	f	f
7770	10	\N	—	[]	5/2 ADAVALF	\N	24	ADET	50.00	21	child	\N	t	f	f	f
7771	10	\N	—	[]	Q 1"1/2  PİNÇ VANA	\N	24	ADET	375.00	22	child	\N	t	f	f	f
7772	10	\N	—	[]	\N	\N	1	ADET	0.00	23	child	\N	f	f	f	f
7773	10	\N	Medikal Bakır Boruları	["İtalya ,Almanya'dan ithal, EN 13348 standardında"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4795266d-90dc-4396-87ca-a020f6ca9255	0	ADET	0.00	24	group	\N	t	f	f	f
7774	10	\N	—	[]	Ø12X1 mm.	\N	50	METRE	17.50	25	child	\N	t	f	f	f
7775	10	\N	—	[]	Ø15X1 mm.	\N	25	METRE	21.25	26	child	\N	t	f	f	f
7776	10	\N	—	[]	Ø22X1 mm.	\N	120	METRE	30.00	27	child	\N	t	f	f	f
7777	10	\N	—	[]	Ø28X1 mm.	\N	0	METRE	37.83	28	child	\N	f	f	f	f
7778	10	\N	—	[]	Ø35X1 mm.	\N	0	METRE	37.47	29	child	\N	f	f	f	f
7779	10	\N	—	[]	Ø42X1 mm.	\N	0	METRE	0.00	30	child	\N	f	f	f	f
7780	10	\N	—	[]	Ø54X1 mm.	\N	0	METRE	0.00	31	child	\N	f	f	f	f
7781	10	\N	—	[]	Ø76X1 mm.	\N	0	METRE	0.00	32	child	\N	f	f	f	f
7782	10	\N	—	[]	Ø108X1 mm.	\N	0	METRE	0.00	33	child	\N	f	f	f	f
7783	10	\N	—	[]	Q 110 MM UPVC BORU VE MONTAJ MALZEMESİ	\N	30	METRE	31.25	34	child	\N	t	f	f	f
7784	10	\N	—	[]	Q 75 MM UPVC BORU VE MONTAJ MALZEMESİ	\N	36	METRE	28.75	35	child	\N	t	f	f	f
7785	10	\N	—	[]	Q 50 MM UPVC BORU VE MONTAJ MALZEMESİ	\N	24	METRE	22.50	36	child	\N	t	f	f	f
6524	12	\N	—	[]	Ø22X1 mm.	\N	120	METRE	24.02	26	child	\N	t	f	f	f
6525	12	\N	—	[]	Ø28X1 mm.	\N	0	METRE	30.26	27	child	\N	f	f	f	f
6526	12	\N	—	[]	Ø35X1 mm.	\N	0	METRE	37.47	28	child	\N	f	f	f	f
6527	12	\N	—	[]	Ø42X1 mm.	\N	0	METRE	0.00	29	child	\N	f	f	f	f
6528	12	\N	—	[]	Ø54X1 mm.	\N	0	METRE	0.00	30	child	\N	f	f	f	f
6529	12	\N	—	[]	Ø76X1 mm.	\N	0	METRE	0.00	31	child	\N	f	f	f	f
6530	12	\N	—	[]	Ø108X1 mm.	\N	0	METRE	0.00	32	child	\N	f	f	f	f
6531	12	\N	—	[]	Q 110 MM UPVC BORU VE MONTAJ MALZEMESİ	\N	30	METRE	30.00	33	child	\N	t	f	f	f
6532	12	\N	—	[]	Q 75 MM UPVC BORU VE MONTAJ MALZEMESİ	\N	36	METRE	25.00	34	child	\N	t	f	f	f
6533	12	\N	—	[]	Q 50 MM UPVC BORU VE MONTAJ MALZEMESİ	\N	24	METRE	20.00	35	child	\N	t	f	f	f
7786	10	\N	—	[]	\N	\N	1	ADET	0.00	37	child	\N	t	f	f	f
7787	10	\N	DENTAL TOZ ASPRATÖRÜ -  ( 1500 m³/h)	["1800-HV-INV (5,5kW) Filtre Ünitesi Sabit filtre ünitesi  1500m3/h – 5,5 kW - 400V 50hz 3P PE N PID Inverter Kontollü Kontrol panosu. Teflon membran kaplı Polyester non-woven filtreli", "Hava Atışı İç Ortama verilecekse Hepa Filitre İlave Gerekmekte Olup Filitre  Fiyatı 1650 usd Eklenecektir"]	OXY-DTA-1500	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/2aa47b3f-8367-4955-9721-f7c7ab8d88d9	1	ADET	16250.00	38	single	\N	t	f	f	f
6534	12	\N	DENTAL TOZ ASPRATÖRÜ -  ( 1500 m³/h)	["1800-HV-INV (5,5kW) Filtre Ünitesi Sabit filtre ünitesi  1500m3/h – 5,5 kW - 400V 50hz 3P PE N PID Inverter Kontollü Kontrol panosu. Teflon membran kaplı Polyester non-woven filtreli", "Hava Atışı İç Ortama verilecekse Hepa Filitre İlave Gerekmekte Olup Filitre  Fiyatı 1650 usd Eklenecektir"]	OXY-DTA-1500	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/2aa47b3f-8367-4955-9721-f7c7ab8d88d9	1	ADET	13500.00	36	single	\N	t	f	f	f
7788	10	\N	Tek Kişilik Dental Teknisyen Masası - Model 02	["Tek vakumlu teknisyen masası.", "220 V / AC 50 Hz. / Max. 1250 Watt.", "1 mm. kalınlığında çeliktan imal edilmiștir.", "Elektrostatik toz boya ile boyanmıștır..", "Ral renk seçenekleri mevcuttur.", "Gaz musluğu.", "3 mm PVC kenar korumalı", "30 mm șekillendirilmiș lamine", "Hava tabancası giriși", "Çalıșma alanında el motoru muhafaza alanları"]	DTM-02	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/f57c827c-e066-4a85-8b52-8be63fd03f57	24	ADET	2294.69	39	single	\N	t	f	f	f
7933	17	\N	Bölüm Kesme Vanaları	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/46d5478b-0f9b-4ab0-9c97-ed1a8abab053	0	ADET	0.00	0	group	\N	t	f	f	f
7934	17	\N	—	[]	12mm Çap	\N	6	ADET	17.50	1	child	\N	t	f	f	f
7935	17	\N	—	[]	15mm Çap	\N	4	ADET	19.30	2	child	\N	t	f	f	f
7936	17	\N	—	[]	22mm Çap	\N	0	ADET	26.00	3	child	\N	f	f	f	f
7937	17	\N	—	[]	28mm Çap	\N	0	ADET	32.00	4	child	\N	f	f	f	f
7938	17	\N	—	[]	35mm Çap	\N	0	ADET	38.00	5	child	\N	f	f	f	f
5029	8	\N	Tek Kişilik Dental Teknisyen Masası - Model 01	["Tek vakumlu teknisyen masası.", "220 V / AC 50 Hz. / Max. 1250 Watt.", "1 mm. kalınlığında çeliktan imal edilmiștir.", "Elektrostatik toz boya ile boyanmıștır..", "Ral renk seçenekleri mevcuttur.", "Gaz musluğu.", "3 mm PVC kenar korumalı", "30 mm șekillendirilmiș lamine", "Hava tabancası giriși", "Çalıșma alanında el motoru muhafaza alanları"]	DTM-01	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/06169fd7-f7d8-437f-bf68-08e9a3df3384	1	ADET	0.00	41	single	\N	t	f	f	f
7939	17	\N	—	[]	42mm Çap	\N	0	ADET	43.00	6	child	\N	f	f	f	f
7940	17	\N	—	[]	54mm Çap	\N	0	ADET	56.00	7	child	\N	f	f	f	f
7941	17	\N	Duvar Modülleri	["EN 737 ve EN 793'e Uygun, Alüminyum Profil, Elektrostatik Toz Boya"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/004f0e70-81bb-4493-8d38-3e38a38b7ecb	0	ADET	0.00	8	group	\N	t	f	f	f
7942	17	\N	—	[]	1 Gaz İçin	\N	17	ADET	25.00	9	child	\N	t	f	f	f
7943	17	\N	—	[]	2 Gaz İçin Klasik	\N	16	ADET	30.00	10	child	\N	t	f	f	f
7944	17	\N	—	[]	2 Gaz İçin TİP F	\N	0	ADET	100.00	11	child	\N	f	f	f	f
7945	17	\N	—	[]	3 Gaz İçin TİP C	\N	6	ADET	35.00	12	child	\N	t	f	f	f
7946	17	\N	—	[]	4 Gaz İçin TİP C	\N	3	ADET	40.00	13	child	\N	t	f	f	f
7947	17	\N	—	[]	5 Gaz İçin TİP D	\N	0	ADET	60.00	14	child	\N	f	f	f	f
7948	17	\N	—	[]	6 Gaz İçin TİP E	\N	2	ADET	50.00	15	child	\N	t	f	f	f
7949	17	\N	—	[]	Anestezi İçin	\N	3	ADET	150.00	16	child	\N	t	f	f	f
7950	17	\N	—	[]	Cerrahi İçin	\N	2	ADET	180.00	17	child	\N	t	f	f	f
7951	17	\N	Hastabaşı Ünitesi	["1 Kişilik Hasta Yoğun Bakım Ünitesi (150 cm.)", "Alüminyum Yatay Tip, Duvara montaj", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Ünite Boyunca Ray- Paslanmaz Çelik"]	OXY-HYB-100	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/f5780e62-9914-41b3-b36c-b57922244bd6	69	ADET	168.80	18	single	\N	t	f	f	f
7952	17	\N	Medikal Gaz Prizleri	["BS Standardı, Tamamıyla Metal Konstrüksiyon"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/dfc343ac-0192-49d2-95ea-fd38fd4b014f	0	ADET	0.00	19	group	\N	t	f	f	f
7953	17	\N	—	[]	Oksijen Prizi	\N	199	ADET	18.50	20	child	\N	t	f	f	f
7954	17	\N	—	[]	Vakum Prizi	\N	187	ADET	18.50	21	child	\N	t	f	f	f
7955	17	\N	—	[]	N2O Prizi	\N	4	ADET	18.50	22	child	\N	t	f	f	f
7956	17	\N	—	[]	Basınçlı Hava Prizi (MA4)	\N	57	ADET	18.50	23	child	\N	t	f	f	f
7957	17	\N	—	[]	Basınçlı Hava Prizi (SA7)	\N	15	ADET	18.50	24	child	\N	t	f	f	f
7958	17	\N	—	[]	AGSS Prizi VENTÜRİ	\N	4	ADET	35.00	25	child	\N	t	f	f	f
7959	17	\N	Kolon Tipi Yoğun Bakım Ünitesi - (Tek Hasta İçin)	["Alüminyum Yan Gövdeler, MDF ön ve arka yüzey, Tavan yüksekliğinde", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Askı Rayı - Paslanmaz Çelik"]	OXY-KTYB-100	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/b8daca1b-e15d-413d-9c1d-194152466f8a	16	ADET	706.00	26	single	\N	t	f	f	f
7960	17	\N	Hasta Yoğun Bakım Ünitesi	["1 Kişilik Yoğun Bakım Ünitesi (150 - 180 cm.)", "Alüminyum Yatay Tip, Duvara montaj", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Ünite Boyunca Ray- Paslanmaz Çelik"]	OXY-YBU-200	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/206cf3a1-19d8-4108-bc72-5cfb20c00fd4	5	ADET	180.00	27	single	\N	t	f	f	f
7961	17	\N	Cerrahi Pendant	["Motorlu, Çok yönlü hareket edebilen", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	2	ADET	2500.00	28	single	\N	t	f	f	f
7962	17	\N	Genel Tip Ameliyathane Pendantı	["Motorlu, Çok yönlü hareket edebilen", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	5	ADET	2500.00	29	single	\N	t	f	f	f
7963	17	\N	Hareketli Çift kollu Yoğun Bakım Pendantı	["Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/ce791833-7a7a-44f1-861d-4a8f8ca7a8b6	12	ADET	2107.97	30	single	\N	t	f	f	f
7964	17	\N	Vakum Santral Merkezi -  (3 x 100 m³/h)	["3x Vakum Pompası", "1x Vakum Kontrol Paneli ile Birlikte 500 Lt. 'lik Tank", "1x Bakteri Filtre Gurubu", "1x Vakum Elektrik Kontrol Paneli", "1x Vakustat", "1x Vakummetre"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4d17142e-41af-4130-a3cb-c638f41f1cf4	1	ADET	14000.00	31	single	\N	t	f	t	f
7965	17	\N	Basınçlı Hava Santral Merkezi -  (3 x 150  m³/h)	["3x  Basınçlı Hava Kompresörü", "3x  Hat Flitresi", "1x  Kimyasal Hava Kurutucu", "2x  1000 Lt. Tank", "1x  Elektrik Kontrol Paneli"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4297778e-7ab1-470e-9394-96efde66a49b	1	ADET	21000.00	32	single	\N	t	f	t	f
7966	17	\N	Oksijen Santral Merkezi - (2 x 5 Tüplük) +1*5	["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	2600.00	33	single	\N	t	f	f	t
7967	17	\N	Azot Prodoksit Santral Merkez  (2 x 3 Tüplük) +1*3	["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	2250.00	34	single	\N	t	f	f	f
7968	17	\N	AGS SANTRALİ	[]	\N	\N	1	ADET	2500.00	35	single	\N	t	f	f	f
8682	19	\N	Medikal Gaz Alarm Paneli	["HTM 2022 ye birebir uygun, Yüksek-Normal-Düşük Basınç Göstergeli", "Gazın anlık geçiş basıncını izleyebilen - Switchleri ile Komple"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/66921ec0-369a-415e-802a-d7b28b40def6	0	ADET	0.00	0	group	\N	t	f	f	f
8683	19	\N	—	[]	1 Gaz İçin	\N	1	ADET	120.00	1	child	\N	t	f	f	f
8684	19	\N	—	[]	2 Gaz İçin	\N	0	ADET	140.00	2	child	\N	f	f	f	f
8685	19	\N	—	[]	3 Gaz İçin	\N	5	ADET	160.00	3	child	\N	t	f	f	f
8009	18	\N	Vakum Santral Merkezi -  (4 x 300 m³/h)	["4 Adet  Vakum Pompası", "1 Adet  Vakum Kontrol Paneli ile Birlikte 300 Lt. 'lik Tank", "5 Adet  Bakteri Filtre Gurubu", "1 Adet  Vakum Elektrik Kontrol Paneli", "1 Adet  Vakustat", "1 Adet  Vakummetre"]	OXY-DVS	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/c94d2111-08d7-4fff-813a-b868f2ec4136	3	SET	30000.00	0	single	\N	t	f	f	f
8010	18	\N	AtlasCopco LF Serisi	["9 Adet %100 Yağsız(Oil Free), Pistonlu, Hava Soğutmalı, Sabit Devirli, Max. 10bar Basınç Üretimi, 86dB Ses Seviyesi, Direkt Akuple Tahrikli, IE3 Verimlilik ve IP55 Koruma Sınıflı 7,5kW Elektrik Motorlu", "3 Adet  Hat Flitresi", "3 Adet  Gaz Soğutmalı Hava kurutucu", "1 Adet  2500 Lt. Tank", "1 Adet  Elektrik kontrol paneli"]	LF	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/bbde7d79-2e27-47de-9def-169753bde2df	2	SET	65000.00	1	single	\N	t	f	t	f
8686	19	\N	—	[]	4 Gaz İçin	\N	0	ADET	180.00	4	child	\N	f	f	f	f
8687	19	\N	—	[]	5 Gaz İçin	\N	0	ADET	200.00	5	child	\N	f	f	f	f
8688	19	\N	Medikal Gaz Vana Kutusu	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/a60fdfb3-ca96-4175-99f0-b3e65b23e32a	0	ADET	0.00	6	group	\N	t	f	f	f
8689	19	\N	—	[]	1 Gaz İçin	\N	1	ADET	150.00	7	child	\N	t	f	f	f
8690	19	\N	—	[]	2 Gaz İçin	\N	0	ADET	190.00	8	child	\N	f	f	f	f
8691	19	\N	—	[]	3 Gaz İçin	\N	5	ADET	230.00	9	child	\N	t	f	f	f
8692	19	\N	—	[]	4 Gaz İçin	\N	0	ADET	270.00	10	child	\N	f	f	f	f
8693	19	\N	—	[]	5 Gaz İçin	\N	0	ADET	310.00	11	child	\N	f	f	f	f
8694	19	\N	Medikal Gaz Prizleri	["BS Standardı, Tamamıyla Metal Konstrüksiyon"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/dfc343ac-0192-49d2-95ea-fd38fd4b014f	0	ADET	0.00	12	group	\N	t	f	f	f
8695	19	\N	—	[]	Oksijen Prizi	\N	24	ADET	22.00	13	child	\N	t	f	f	f
8696	19	\N	—	[]	Vakum Prizi	\N	1	ADET	22.00	14	child	\N	t	f	f	f
8697	19	\N	—	[]	N2O Prizi	\N	0	ADET	22.00	15	child	\N	f	f	f	f
8698	19	\N	—	[]	Basınçlı Hava Prizi (MA4)	\N	0	ADET	22.00	16	child	\N	f	f	f	f
8699	19	\N	—	[]	Basınçlı Hava Prizi (SA7)	\N	3	ADET	22.00	17	child	\N	t	f	f	f
8700	19	\N	—	[]	AGSS Prizi VENTÜRİ	\N	0	ADET	45.00	18	child	\N	f	f	f	f
8701	19	\N	—	[]	POSTA BAŞI REGÜLATÖR GRUBU	\N	5	ADET	140.00	19	child	\N	t	f	f	f
8702	19	\N	Medikal Bakır Boruları	["İtalya ,Almanya'dan ithal, EN 13348 standardında"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4795266d-90dc-4396-87ca-a020f6ca9255	0	ADET	0.00	20	group	\N	t	f	f	f
8703	19	\N	—	[]	Ø12X1 mm.	\N	550	METRE	14.20	21	child	\N	t	f	f	f
8704	19	\N	—	[]	Ø15X1 mm.	\N	160	METRE	17.21	22	child	\N	t	f	f	f
8705	19	\N	—	[]	Ø22X1 mm.	\N	280	METRE	24.02	23	child	\N	t	f	f	f
8706	19	\N	—	[]	Ø28X1 mm.	\N	0	METRE	30.26	24	child	\N	f	f	f	f
8707	19	\N	—	[]	Ø35X1 mm.	\N	0	METRE	37.47	25	child	\N	f	f	f	f
8708	19	\N	—	[]	Ø42X1 mm.	\N	0	METRE	0.00	26	child	\N	f	f	f	f
8709	19	\N	—	[]	Ø54X1 mm.	\N	0	METRE	0.00	27	child	\N	f	f	f	f
8710	19	\N	—	[]	Ø76X1 mm.	\N	0	METRE	0.00	28	child	\N	f	f	f	f
8711	19	\N	—	[]	Ø108X1 mm.	\N	0	METRE	0.00	29	child	\N	f	f	f	f
8712	19	\N	—	[]	Q 40 MM 16 BAR UPVC BORU	\N	210	METRE	10.60	30	child	\N	t	f	f	f
8713	19	\N	—	[]	Q 50 MM 16 BAR UPVC BORU	\N	36	METRE	12.80	31	child	\N	t	f	f	f
8714	19	\N	—	[]	Q 63 MM 10 BAR UPVC BORU	\N	48	METRE	16.00	32	child	\N	t	f	f	f
8715	19	\N	—	[]	Q 75 MM 10 BAR UPVC BORU	\N	114	METRE	18.65	33	child	\N	t	f	f	f
8716	19	\N	—	[]	\N	\N	1	ADET	0.00	34	child	\N	t	f	f	f
8717	19	\N	Bölüm Kesme Vanaları	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/46d5478b-0f9b-4ab0-9c97-ed1a8abab053	0	ADET	0.00	35	group	\N	t	f	f	f
8718	19	\N	—	[]	12mm Çap	\N	26	ADET	17.50	36	child	\N	t	f	f	f
8719	19	\N	—	[]	15mm Çap	\N	23	ADET	19.30	37	child	\N	t	f	f	f
8720	19	\N	—	[]	22mm Çap	\N	0	ADET	26.00	38	child	\N	f	f	f	f
8721	19	\N	—	[]	28mm Çap	\N	0	ADET	32.00	39	child	\N	f	f	f	f
8722	19	\N	—	[]	35mm Çap	\N	0	ADET	38.00	40	child	\N	f	f	f	f
4342	9	\N	Medikal Gaz Alarm Paneli	["HTM 2022 ye birebir uygun, Yüksek-Normal-Düşük Basınç Göstergeli", "Gazın anlık geçiş basıncını izleyebilen - Switchleri ile Komple"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/66921ec0-369a-415e-802a-d7b28b40def6	0	ADET	0.00	0	group	\N	t	f	f	f
4343	9	\N	—	[]	1 Gaz İçin	\N	2	ADET	120.00	1	child	\N	t	f	f	f
4344	9	\N	—	[]	2 Gaz İçin	\N	5	ADET	140.00	2	child	\N	t	f	f	f
4345	9	\N	—	[]	3 Gaz İçin	\N	3	ADET	160.00	3	child	\N	t	f	f	f
4346	9	\N	—	[]	4 Gaz İçin	\N	4	ADET	180.00	4	child	\N	t	f	f	f
4347	9	\N	—	[]	5 Gaz İçin	\N	6	ADET	200.00	5	child	\N	t	f	f	f
4348	9	\N	Medikal Gaz Vana Kutusu	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/a60fdfb3-ca96-4175-99f0-b3e65b23e32a	0	ADET	0.00	6	group	\N	t	f	f	f
4349	9	\N	—	[]	1 Gaz İçin	\N	2	ADET	150.00	7	child	\N	t	f	f	f
4350	9	\N	—	[]	2 Gaz İçin	\N	5	ADET	190.00	8	child	\N	t	f	f	f
4351	9	\N	—	[]	3 Gaz İçin	\N	17	ADET	230.00	9	child	\N	t	f	f	f
4352	9	\N	—	[]	4 Gaz İçin	\N	3	ADET	270.00	10	child	\N	t	f	f	f
4353	9	\N	—	[]	5 Gaz İçin	\N	6	ADET	310.00	11	child	\N	t	f	f	f
4354	9	\N	Bölüm Kesme Vanaları	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/46d5478b-0f9b-4ab0-9c97-ed1a8abab053	0	ADET	0.00	12	group	\N	t	f	t	f
4355	9	\N	—	[]	12mm Çap	\N	6	ADET	17.50	13	child	\N	t	f	f	f
4356	9	\N	—	[]	15mm Çap	\N	0	ADET	19.30	14	child	\N	f	f	f	f
4357	9	\N	—	[]	22mm Çap	\N	0	ADET	26.00	15	child	\N	f	f	f	f
4358	9	\N	—	[]	28mm Çap	\N	0	ADET	32.00	16	child	\N	f	f	f	f
4359	9	\N	—	[]	35mm Çap	\N	0	ADET	38.00	17	child	\N	f	f	f	f
4360	9	\N	—	[]	42mm Çap	\N	0	ADET	43.00	18	child	\N	f	f	f	f
4361	9	\N	—	[]	54mm Çap	\N	0	ADET	56.00	19	child	\N	f	f	f	f
4362	9	\N	Duvar Modülleri	["EN 737 ve EN 793'e Uygun, Alüminyum Profil, Elektrostatik Toz Boya"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/004f0e70-81bb-4493-8d38-3e38a38b7ecb	0	ADET	0.00	20	group	\N	t	f	f	f
4363	9	\N	—	[]	1 Gaz İçin	\N	10	ADET	35.00	21	child	\N	t	f	f	f
4364	9	\N	—	[]	2 Gaz İçin Klasik	\N	11	ADET	35.00	22	child	\N	t	f	f	f
4365	9	\N	—	[]	2 Gaz İçin TİP F	\N	25	ADET	100.00	23	child	\N	t	f	f	f
4366	9	\N	—	[]	3 Gaz İçin TİP C	\N	2	ADET	100.00	24	child	\N	t	f	f	f
4367	9	\N	—	[]	3 Gaz İçin TİP C	\N	9	ADET	120.00	25	child	\N	t	f	f	f
4368	9	\N	—	[]	5 Gaz İçin TİP D	\N	3	ADET	60.00	26	child	\N	t	f	f	f
4369	9	\N	—	[]	6 Gaz İçin TİP E	\N	2	ADET	80.00	27	child	\N	t	f	f	f
4370	9	\N	—	[]	Anestezi İçin	\N	0	ADET	150.00	28	child	\N	f	f	f	f
4371	9	\N	—	[]	Cerrahi İçin	\N	0	ADET	180.00	29	child	\N	f	f	f	f
4372	9	\N	Medikal Gaz Prizleri	["BS Standardı, Tamamıyla Metal Konstrüksiyon"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/dfc343ac-0192-49d2-95ea-fd38fd4b014f	0	ADET	0.00	30	group	\N	t	f	t	f
4373	9	\N	—	[]	Oksijen Prizi	\N	226	ADET	22.00	31	child	\N	t	f	f	f
4374	9	\N	—	[]	Vakum Prizi	\N	223	ADET	22.00	32	child	\N	t	f	f	f
4375	9	\N	—	[]	N2O Prizi	\N	7	ADET	22.00	33	child	\N	t	f	f	f
4376	9	\N	—	[]	Basınçlı Hava Prizi (MA4)	\N	192	ADET	22.00	34	child	\N	t	f	f	f
4377	9	\N	—	[]	Basınçlı Hava Prizi (SA7)	\N	11	ADET	22.00	35	child	\N	t	f	f	f
4378	9	\N	—	[]	AGSS Prizi VENTÜRİ	\N	7	ADET	45.00	36	child	\N	t	f	f	f
4379	9	\N	—	[]	CO2 Prizi VENTÜRİ	\N	14	ADET	20.00	37	child	\N	t	f	f	f
4380	9	\N	Medikal Bakır Boruları	["İtalya ,Almanya'dan ithal, EN 13348 standardında"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4795266d-90dc-4396-87ca-a020f6ca9255	0	ADET	0.00	38	group	\N	t	f	f	f
4381	9	\N	—	[]	Ø12X1 mm.	\N	3060	METRE	14.20	39	child	\N	f	f	f	f
4382	9	\N	—	[]	Ø15X1 mm.	\N	1400	METRE	17.21	40	child	\N	f	f	f	f
4383	9	\N	—	[]	Ø22X1 mm.	\N	460	METRE	24.02	41	child	\N	f	f	f	f
4384	9	\N	—	[]	Ø28X1 mm.	\N	285	METRE	30.26	42	child	\N	f	f	f	f
4385	9	\N	—	[]	Ø35X1 mm.	\N	210	METRE	37.47	43	child	\N	f	f	f	f
4386	9	\N	—	[]	Ø42X1,2 mm.	\N	15	METRE	48.91	44	child	\N	f	f	f	f
4387	9	\N	—	[]	Ø54X1,5 mm.	\N	50	METRE	84.25	45	child	\N	f	f	f	f
4388	9	\N	—	[]	Ø76X1,5 mm.	\N	0	METRE	119.00	46	child	\N	f	f	f	f
4389	9	\N	—	[]	Ø108X1,5 mm.	\N	90	METRE	157.00	47	child	\N	f	f	f	f
4390	9	\N	Hasta Yoğun Bakım Ünitesi	["1 Kişilik Yoğun Bakım Ünitesi (150 - 180 cm.)", "Alüminyum Yatay Tip, Duvara montaj", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Ünite Boyunca Ray- Paslanmaz Çelik"]	OXY-YBU-200	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/206cf3a1-19d8-4108-bc72-5cfb20c00fd4	21	ADET	220.00	48	single	\N	t	f	f	f
4391	9	\N	Hastabaşı Ünitesi	["1 Kişilik Hasta Yoğun Bakım Ünitesi (150 cm.)", "Alüminyum Yatay Tip, Duvara montaj", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Ünite Boyunca Ray- Paslanmaz Çelik"]	OXY-HYB-100	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/f5780e62-9914-41b3-b36c-b57922244bd6	88	ADET	180.00	49	single	\N	t	f	t	f
7333	13	\N	Bölüm Kesme Vanaları	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/46d5478b-0f9b-4ab0-9c97-ed1a8abab053	0	ADET	0.00	0	group	\N	t	f	f	f
7334	13	\N	—	[]	12mm Çap	\N	6	ADET	17.50	1	child	\N	t	f	f	f
7335	13	\N	—	[]	15mm Çap	\N	4	ADET	19.30	2	child	\N	t	f	f	f
4392	9	\N	Cerrahi Pendant	["Motorlu, Çok yönlü hareket edebilen", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	2	ADET	2750.00	50	single	\N	t	f	t	f
4393	9	\N	Genel Tip Ameliyathane Pendantı	["Motorlu, Çok yönlü hareket edebilen", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	3	ADET	2750.00	51	single	\N	t	f	f	f
4394	9	\N	Hareketli Çift kollu Yoğun Bakım Pendantı	["Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/ce791833-7a7a-44f1-861d-4a8f8ca7a8b6	4	ADET	2250.00	52	single	\N	t	f	f	f
4395	9	\N	Köprü Tipi Yoğun Bakım Ünitesi	["Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/19b92874-7977-492d-8243-c4bdf7040dce	4	ADET	3500.00	53	single	\N	t	f	f	f
4396	9	\N	Vakum Santral Merkezi -  (3 x 100 m³/h)	["3x Vakum Pompası", "1x Vakum Kontrol Paneli ile Birlikte 500 Lt. 'lik Tank", "1x Bakteri Filtre Gurubu", "1x Vakum Elektrik Kontrol Paneli", "1x Vakustat", "1x Vakummetre"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4d17142e-41af-4130-a3cb-c638f41f1cf4	1	ADET	13500.00	54	single	\N	t	f	t	f
4397	9	\N	Basınçlı Hava Santral Merkezi -  (3 x 150  m³/h)	["3x  Basınçlı Hava Kompresörü", "3x  Hat Flitresi", "1x  Kimyasal Hava Kurutucu", "2x  1000 Lt. Tank", "1x  Elektrik Kontrol Paneli"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4297778e-7ab1-470e-9394-96efde66a49b	1	ADET	27500.00	55	single	\N	t	f	t	f
4398	9	\N	Oksijen Santral Merkezi - (2 x 5 Tüplük) +1*5	["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	3250.00	56	single	\N	t	f	f	t
4399	9	\N	Azot Prodoksit Santral Merkez  (2 x 3 Tüplük) +1*3	["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	2500.00	57	single	\N	t	f	f	f
4400	9	\N	CO2 Santral Merkez  (2 x 3 Tüplük) +1*3	["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	2500.00	58	single	\N	t	f	f	f
7336	13	\N	—	[]	22mm Çap	\N	0	ADET	26.00	3	child	\N	f	f	f	f
7337	13	\N	—	[]	28mm Çap	\N	0	ADET	32.00	4	child	\N	f	f	f	f
7338	13	\N	—	[]	35mm Çap	\N	0	ADET	38.00	5	child	\N	f	f	f	f
7339	13	\N	—	[]	42mm Çap	\N	0	ADET	43.00	6	child	\N	f	f	f	f
7340	13	\N	—	[]	54mm Çap	\N	0	ADET	56.00	7	child	\N	f	f	f	f
7341	13	\N	Duvar Modülleri	["EN 737 ve EN 793'e Uygun, Alüminyum Profil, Elektrostatik Toz Boya"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/004f0e70-81bb-4493-8d38-3e38a38b7ecb	0	ADET	0.00	8	group	\N	t	f	f	f
7342	13	\N	—	[]	1 Gaz İçin	\N	17	ADET	35.00	9	child	\N	t	f	f	f
7343	13	\N	—	[]	2 Gaz İçin Klasik	\N	16	ADET	35.00	10	child	\N	t	f	f	f
7344	13	\N	—	[]	2 Gaz İçin TİP F	\N	0	ADET	100.00	11	child	\N	f	f	f	f
7345	13	\N	—	[]	3 Gaz İçin TİP C	\N	6	ADET	100.00	12	child	\N	t	f	f	f
7346	13	\N	—	[]	3 Gaz İçin TİP C	\N	0	ADET	120.00	13	child	\N	f	f	f	f
7347	13	\N	—	[]	5 Gaz İçin TİP D	\N	0	ADET	60.00	14	child	\N	f	f	f	f
6362	11	\N	Medikal Gaz Vana Kutusu	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/a60fdfb3-ca96-4175-99f0-b3e65b23e32a	0	ADET	0.00	0	group	\N	t	f	f	f
6363	11	\N	—	[]	1 Gaz İçin	\N	0	ADET	150.00	1	child	\N	f	f	f	f
6364	11	\N	—	[]	2 Gaz İçin	\N	1	ADET	190.00	2	child	\N	t	f	f	f
7348	13	\N	—	[]	6 Gaz İçin TİP E	\N	0	ADET	80.00	15	child	\N	f	f	f	f
7349	13	\N	—	[]	Anestezi İçin	\N	3	ADET	150.00	16	child	\N	t	f	f	f
7350	13	\N	—	[]	Cerrahi İçin	\N	2	ADET	180.00	17	child	\N	t	f	f	f
8723	19	\N	—	[]	42mm Çap	\N	0	ADET	43.00	41	child	\N	f	f	f	f
6498	12	\N	Medikal Gaz Alarm Paneli	["HTM 2022 ye birebir uygun, Yüksek-Normal-Düşük Basınç Göstergeli", "Gazın anlık geçiş basıncını izleyebilen - Switchleri ile Komple"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/66921ec0-369a-415e-802a-d7b28b40def6	0	ADET	0.00	0	group	\N	t	f	f	f
6499	12	\N	—	[]	1 Gaz İçin	\N	1	ADET	120.00	1	child	\N	t	f	f	f
6500	12	\N	—	[]	2 Gaz İçin	\N	0	ADET	140.00	2	child	\N	f	f	f	f
6365	11	\N	—	[]	3 Gaz İçin	\N	0	ADET	230.00	3	child	\N	f	f	f	f
6366	11	\N	—	[]	4 Gaz İçin	\N	0	ADET	270.00	4	child	\N	f	f	f	f
6367	11	\N	—	[]	5 Gaz İçin	\N	0	ADET	310.00	5	child	\N	f	f	f	f
6368	11	\N	Medikal Gaz Alarm Paneli	["HTM 2022 ye birebir uygun, Yüksek-Normal-Düşük Basınç Göstergeli", "Gazın anlık geçiş basıncını izleyebilen - Switchleri ile Komple"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/66921ec0-369a-415e-802a-d7b28b40def6	0	ADET	0.00	6	group	\N	t	f	f	f
6369	11	\N	—	[]	1 Gaz İçin	\N	0	ADET	120.00	7	child	\N	f	f	f	f
6370	11	\N	—	[]	2 Gaz İçin	\N	1	ADET	140.00	8	child	\N	t	f	f	f
6371	11	\N	—	[]	3 Gaz İçin	\N	0	ADET	160.00	9	child	\N	f	f	f	f
6372	11	\N	—	[]	4 Gaz İçin	\N	0	ADET	180.00	10	child	\N	f	f	f	f
6373	11	\N	—	[]	5 Gaz İçin	\N	0	ADET	200.00	11	child	\N	f	f	f	f
6374	11	\N	Duvar Modülleri	["EN 737 ve EN 793'e Uygun, Alüminyum Profil, Elektrostatik Toz Boya"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/004f0e70-81bb-4493-8d38-3e38a38b7ecb	0	ADET	0.00	12	group	\N	t	f	f	f
6375	11	\N	—	[]	1 Gaz İçin	\N	1	ADET	35.00	13	child	\N	t	f	f	f
6376	11	\N	—	[]	2 Gaz İçin Klasik	\N	0	ADET	35.00	14	child	\N	f	f	f	f
6377	11	\N	—	[]	2 Gaz İçin TİP F	\N	0	ADET	100.00	15	child	\N	f	f	f	f
6378	11	\N	—	[]	3 Gaz İçin TİP C	\N	0	ADET	100.00	16	child	\N	f	f	f	f
6379	11	\N	—	[]	3 Gaz İçin TİP C	\N	0	ADET	120.00	17	child	\N	f	f	f	f
6380	11	\N	—	[]	5 Gaz İçin TİP D	\N	0	ADET	60.00	18	child	\N	f	f	f	f
6381	11	\N	—	[]	6 Gaz İçin TİP E	\N	0	ADET	80.00	19	child	\N	f	f	f	f
6382	11	\N	—	[]	Anestezi İçin	\N	0	ADET	150.00	20	child	\N	f	f	f	f
6383	11	\N	—	[]	Cerrahi İçin	\N	0	ADET	180.00	21	child	\N	f	f	f	f
6384	11	\N	Hastabaşı Ünitesi	["1 Kişilik Hasta Yoğun Bakım Ünitesi (150 cm.)", "Alüminyum Yatay Tip, Duvara montaj", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Ünite Boyunca Ray- Paslanmaz Çelik"]	OXY-HYB-100	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/f5780e62-9914-41b3-b36c-b57922244bd6	2	ADET	180.00	22	single	\N	t	f	t	f
6385	11	\N	Dalgakıran TIDY 5 Depoüstü Vidalı Hava Kompresörü	["7,5 bar / 110 PSI basınçta 0,56 m³/dk / 19,8 SCFM kapasiteye sahiptir.", "Hava tankı kapasitesi 200/250 litredir.", "Motor gücü 4,0 kW / 5,5 HP’dir.", "Hava bağlantısı 1/2”’dir.", "Boyutları 1500 mm en, 550 mm boy, 1350 mm yükseklik şeklindedir.", "Ağırlığı 250 kg’dır.", "Ses seviyesi 69 dB(A)’dır."]	TIDY5	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/3bd47d49-c714-4045-9e42-910e67d70d13	1	ADET	4250.00	23	single	\N	t	f	f	f
6386	11	\N	100 Litre 4 Hp Premium Sessiz Hava Kompresörü	["4 HP / 3000 Watt motor gücüne sahip bu kompresör, 100 litrelik tankı ve 500 litre/dakika hava üretimi ile güçlü performans sunar. 220 Volt / 50 Hz ile çalışır.", "Bakır sargılı motor, 63,7 mm piston çapı ve 2,75 mm tank sac kalınlığı ile dayanıklı kullanım sağlar. Ürünün net ağırlığı 58 kg, ölçüleri ise 107 × 40 × 64 cm’dir.", "***KURUTUCU FİLTRE VE REGÜLATÖR GRUBU FİYATA DAHİLDİR***"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/3ecf839e-435d-4fa4-9f02-1cffa4a41611	1	ADET	2500.00	24	single	\N	t	f	f	f
6501	12	\N	—	[]	3 Gaz İçin	\N	0	ADET	160.00	3	child	\N	f	f	f	f
6502	12	\N	—	[]	4 Gaz İçin	\N	0	ADET	180.00	4	child	\N	f	f	f	f
6503	12	\N	—	[]	5 Gaz İçin	\N	0	ADET	200.00	5	child	\N	f	f	f	f
6504	12	\N	Medikal Gaz Vana Kutusu	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/a60fdfb3-ca96-4175-99f0-b3e65b23e32a	0	ADET	0.00	6	group	\N	t	f	f	f
6505	12	\N	—	[]	1 Gaz İçin	\N	1	ADET	150.00	7	child	\N	t	f	f	f
6506	12	\N	—	[]	2 Gaz İçin	\N	0	ADET	190.00	8	child	\N	f	f	f	f
6507	12	\N	—	[]	3 Gaz İçin	\N	0	ADET	230.00	9	child	\N	f	f	f	f
6508	12	\N	—	[]	4 Gaz İçin	\N	0	ADET	270.00	10	child	\N	f	f	f	f
6509	12	\N	—	[]	5 Gaz İçin	\N	0	ADET	310.00	11	child	\N	f	f	f	f
6510	12	\N	Bölüm Kesme Vanaları	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/46d5478b-0f9b-4ab0-9c97-ed1a8abab053	0	ADET	0.00	12	group	\N	t	f	f	f
6511	12	\N	—	[]	12mm Çap	\N	24	ADET	17.50	13	child	\N	t	f	f	f
6512	12	\N	—	[]	15mm Çap	\N	0	ADET	19.30	14	child	\N	f	f	f	f
6513	12	\N	—	[]	22mm Çap	\N	0	ADET	26.00	15	child	\N	f	f	f	f
6514	12	\N	—	[]	28mm Çap	\N	0	ADET	32.00	16	child	\N	f	f	f	f
6515	12	\N	—	[]	35mm Çap	\N	0	ADET	38.00	17	child	\N	f	f	f	f
6516	12	\N	—	[]	42mm Çap	\N	0	ADET	43.00	18	child	\N	f	f	f	f
6517	12	\N	—	[]	54mm Çap	\N	0	ADET	56.00	19	child	\N	f	f	f	f
6518	12	\N	—	[]	1/4 0-10 BAR REGÜLATÖR	\N	0	ADET	55.00	20	child	\N	f	f	f	f
6519	12	\N	—	[]	5/2 ADAVALF	\N	0	ADET	40.00	21	child	\N	f	f	f	f
6520	12	\N	—	[]	Q 1"1/2  PİNÇ VANA	\N	0	ADET	325.00	22	child	\N	f	f	f	f
6521	12	\N	Medikal Bakır Boruları	["İtalya ,Almanya'dan ithal, EN 13348 standardında"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4795266d-90dc-4396-87ca-a020f6ca9255	0	ADET	0.00	23	group	\N	t	f	f	f
6522	12	\N	—	[]	Ø12X1 mm.	\N	50	METRE	14.20	24	child	\N	t	f	f	f
6523	12	\N	—	[]	Ø15X1 mm.	\N	25	METRE	17.21	25	child	\N	t	f	f	f
7351	13	\N	Hastabaşı Ünitesi	["1 Kişilik Hasta Yoğun Bakım Ünitesi (150 cm.)", "Alüminyum Yatay Tip, Duvara montaj", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Ünite Boyunca Ray- Paslanmaz Çelik"]	OXY-HYB-100	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/f5780e62-9914-41b3-b36c-b57922244bd6	69	ADET	180.00	18	single	\N	t	f	t	f
7352	13	\N	Medikal Gaz Prizleri	["BS Standardı, Tamamıyla Metal Konstrüksiyon"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/dfc343ac-0192-49d2-95ea-fd38fd4b014f	0	ADET	0.00	19	group	\N	t	f	f	f
7353	13	\N	—	[]	Oksijen Prizi	\N	199	ADET	22.00	20	child	\N	t	f	f	f
7354	13	\N	—	[]	Vakum Prizi	\N	187	ADET	22.00	21	child	\N	t	f	f	f
7355	13	\N	—	[]	N2O Prizi	\N	4	ADET	22.00	22	child	\N	t	f	f	f
7356	13	\N	—	[]	Basınçlı Hava Prizi (MA4)	\N	57	ADET	22.00	23	child	\N	t	f	f	f
7357	13	\N	—	[]	Basınçlı Hava Prizi (SA7)	\N	15	ADET	22.00	24	child	\N	t	f	f	f
7358	13	\N	—	[]	AGSS Prizi VENTÜRİ	\N	4	ADET	45.00	25	child	\N	t	f	f	f
7359	13	\N	Kolon Tipi Yoğun Bakım Ünitesi - (Tek Hasta İçin)	["Alüminyum Yan Gövdeler, MDF ön ve arka yüzey, Tavan yüksekliğinde", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Askı Rayı - Paslanmaz Çelik"]	OXY-KTYB-100	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/b8daca1b-e15d-413d-9c1d-194152466f8a	16	ADET	800.00	26	single	\N	t	f	f	f
7360	13	\N	Hasta Yoğun Bakım Ünitesi	["1 Kişilik Yoğun Bakım Ünitesi (150 - 180 cm.)", "Alüminyum Yatay Tip, Duvara montaj", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Ünite Boyunca Ray- Paslanmaz Çelik"]	OXY-YBU-200	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/206cf3a1-19d8-4108-bc72-5cfb20c00fd4	5	ADET	220.00	27	single	\N	t	f	f	f
7361	13	\N	Cerrahi Pendant	["Motorlu, Çok yönlü hareket edebilen", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	2	ADET	2750.00	28	single	\N	t	f	t	f
7362	13	\N	Genel Tip Ameliyathane Pendantı	["Motorlu, Çok yönlü hareket edebilen", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	5	ADET	2750.00	29	single	\N	t	f	f	f
7363	13	\N	Hareketli Çift kollu Yoğun Bakım Pendantı	["Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/ce791833-7a7a-44f1-861d-4a8f8ca7a8b6	12	ADET	2250.00	30	single	\N	t	f	f	f
7364	13	\N	Vakum Santral Merkezi -  (3 x 100 m³/h)	["3x Vakum Pompası", "1x Vakum Kontrol Paneli ile Birlikte 500 Lt. 'lik Tank", "1x Bakteri Filtre Gurubu", "1x Vakum Elektrik Kontrol Paneli", "1x Vakustat", "1x Vakummetre"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4d17142e-41af-4130-a3cb-c638f41f1cf4	1	ADET	13500.00	31	single	\N	t	f	t	f
7365	13	\N	Basınçlı Hava Santral Merkezi -  (3 x 150  m³/h)	["3x  Basınçlı Hava Kompresörü", "3x  Hat Flitresi", "1x  Kimyasal Hava Kurutucu", "2x  1000 Lt. Tank", "1x  Elektrik Kontrol Paneli"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4297778e-7ab1-470e-9394-96efde66a49b	1	ADET	27500.00	32	single	\N	t	f	t	f
7366	13	\N	Oksijen Santral Merkezi - (2 x 5 Tüplük) +1*5	["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	3250.00	33	single	\N	t	f	f	t
7367	13	\N	Azot Prodoksit Santral Merkez  (2 x 3 Tüplük) +1*3	["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	2500.00	34	single	\N	t	f	f	f
8724	19	\N	—	[]	54mm Çap	\N	0	ADET	56.00	42	child	\N	f	f	f	f
8725	19	\N	Duvar Modülleri	["EN 737 ve EN 793'e Uygun, Alüminyum Profil, Elektrostatik Toz Boya"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/004f0e70-81bb-4493-8d38-3e38a38b7ecb	0	ADET	0.00	43	group	\N	t	f	f	f
8726	19	\N	—	[]	1 Gaz İçin	\N	26	ADET	35.00	44	child	\N	t	f	f	f
8727	19	\N	—	[]	2 Gaz İçin Klasik	\N	1	ADET	35.00	45	child	\N	t	f	f	f
8728	19	\N	—	[]	2 Gaz İçin TİP F	\N	0	ADET	100.00	46	child	\N	f	f	f	f
8729	19	\N	—	[]	3 Gaz İçin TİP C	\N	0	ADET	100.00	47	child	\N	f	f	f	f
8730	19	\N	—	[]	3 Gaz İçin TİP C	\N	0	ADET	120.00	48	child	\N	f	f	f	f
7502	14	\N	Genel Tip Ameliyathane Pendantı	["Motorlu, Çok yönlü hareket edebilen", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	5	ADET	2500.00	29	single	\N	t	f	f	f
7503	14	\N	Hareketli Çift kollu Yoğun Bakım Pendantı	["Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/ce791833-7a7a-44f1-861d-4a8f8ca7a8b6	12	ADET	2000.00	30	single	\N	t	f	f	f
7504	14	\N	Vakum Santral Merkezi -  (3 x 100 m³/h)	["3x Vakum Pompası", "1x Vakum Kontrol Paneli ile Birlikte 500 Lt. 'lik Tank", "1x Bakteri Filtre Gurubu", "1x Vakum Elektrik Kontrol Paneli", "1x Vakustat", "1x Vakummetre"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4d17142e-41af-4130-a3cb-c638f41f1cf4	1	ADET	14000.00	31	single	\N	t	f	t	f
7505	14	\N	Basınçlı Hava Santral Merkezi -  (3 x 150  m³/h)	["3x  Basınçlı Hava Kompresörü", "3x  Hat Flitresi", "1x  Kimyasal Hava Kurutucu", "2x  1000 Lt. Tank", "1x  Elektrik Kontrol Paneli"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4297778e-7ab1-470e-9394-96efde66a49b	1	ADET	21000.00	32	single	\N	t	f	t	f
7506	14	\N	Oksijen Santral Merkezi - (2 x 5 Tüplük) +1*5	["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	2600.00	33	single	\N	t	f	f	t
7507	14	\N	Azot Prodoksit Santral Merkez  (2 x 3 Tüplük) +1*3	["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	2250.00	34	single	\N	t	f	f	f
7508	14	\N	AGS SANTRALİ	[]	\N	\N	1	ADET	2500.00	35	single	\N	t	f	f	f
8731	19	\N	—	[]	5 Gaz İçin TİP D	\N	0	ADET	60.00	49	child	\N	f	f	f	f
8732	19	\N	—	[]	6 Gaz İçin TİP E	\N	0	ADET	80.00	50	child	\N	f	f	f	f
8733	19	\N	—	[]	Anestezi İçin	\N	0	ADET	150.00	51	child	\N	f	f	f	f
8734	19	\N	—	[]	Cerrahi İçin	\N	0	ADET	180.00	52	child	\N	f	f	f	f
8735	19	\N	Dental Vakum Santrali	["3 × 160 m³/h Dezenfeksiyonlu Dental Vakum Santrali", "3 adet GEV veya DVP marka, İtalya menşeli vakum pompası", "1 adet 700 litre yatay vakum tankı", "1 adet 1.000 litre dikey vakum tankı", "2 adet 500 litre separatör tankı", "1 adet amalgam ayırıcı filtre", "1 adet vakum kontrol panosu", "1 adet dental otomasyon panosu"]	OXY-DVS-3160	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/0b677feb-5150-486b-b6f5-785735d7cf0c	1	SET	30000.00	53	single	\N	t	f	f	f
10710	27	\N	Genel Tip Ameliyathane Pendantı	["2 adet Oksijen Prizi (O2)", "1 adet Azot Protoksit Prizi (N2O)", "1 adet Medikal Hava 4 Bar Prizi", "2 adet Medikal Vakum Prizi", "1 adet Anestezik Gaz Atık Sistemi (AGSS) Prizi", "1 adet AGSS Pompa Çalıştırma Anahtarı", "2 adet Cihaz Askı Rayı"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	1	ADET	211500.00	0	single	\N	t	f	f	f
8821	22	\N	4*300 m3/h KAPASİTELİ 1 SET DENTAL VAKUM SİSTEMİ YEDEK PARÇA HARİÇ	["Üç Aylık Periyotlarla Bakım ve Onarım Hizmeti", "Bakımı yapılacak makinelere, üç aylık periyotlar halinde periyodik bakım ve onarım hizmeti verilecektir.", "Bu kapsamda aşağıdaki işlemler gerçekleştirilecektir:", "* Bakteri filtrelerinin kontrolü yapılacaktır.", "* Motor rulmanları kontrol edilerek gerekli yağlama işlemleri gerçekleştirilecektir.", "* Separatör tanklarının temizliği yapılacaktır.", "* Amalgam ayırıcı separatörler kontrol edilecek, doluluk oranına bağlı olarak gerektiğinde değiştirilecektir.", "* Atık tahliye pompalarının kontrol ve fonksiyon testleri yapılacaktır.", "* Blower motorlarının elektrik bağlantıları kontrol edilecek, motor akım değerleri ölçülerek uygunluğu denetlenecektir.", "* Bakım sırasında değiştirilmesi gerektiği tespit edilen parça ve malzemeler, servis formu ile idareye bildirilecektir."]	\N	\N	4	ADET	33750.00	0	single	\N	t	f	f	f
8822	22	\N	LZ 20-10 ( 2 ADET PİSTONLU) ATLAS COPCO MARKA HAVA KOMPRESÖR SETİ	["Üç Aylık Periyotlarla Bakım ve Onarım Hizmeti", "Kompresör sistemlerine üç aylık periyotlar halinde periyodik bakım ve onarım hizmeti verilecektir.", "Bu kapsamda aşağıdaki işlemler gerçekleştirilecektir:", "* Kompresörlerin hava filtreleri kontrol edilerek temizlenecek, gerekli görülen filtreler yenileri ile değiştirilecektir.", "* Sistemde bulunan **1 adet kurutucu** ve **1 adet hava tankının** genel kontrolleri yapılacaktır.", "* Hava tanklarının boşaltma sistemleri test edilecek ve tanklarda biriken yoğuşma suları tahliye edilecektir.", "* Otomatik tahliye solenoid valflerinin çalışması kontrol edilecektir.", "* Kompresörlerin elektrik bağlantıları kontrol edilecek, motorların akım ve elektriksel çalışma değerleri ölçülerek uygunluğu denetlenecektir.", "* Bakım sırasında değiştirilmesi gerektiği tespit edilen parça ve malzemeler, servis formu düzenlenerek idareye bildirilecektir."]	\N	\N	4	ADET	22500.00	1	single	\N	t	f	f	f
7473	14	\N	Bölüm Kesme Vanaları	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/46d5478b-0f9b-4ab0-9c97-ed1a8abab053	0	ADET	0.00	0	group	\N	t	f	f	f
7474	14	\N	—	[]	12mm Çap	\N	6	ADET	17.50	1	child	\N	t	f	f	f
7475	14	\N	—	[]	15mm Çap	\N	4	ADET	19.30	2	child	\N	t	f	f	f
7476	14	\N	—	[]	22mm Çap	\N	0	ADET	26.00	3	child	\N	f	f	f	f
7477	14	\N	—	[]	28mm Çap	\N	0	ADET	32.00	4	child	\N	f	f	f	f
7478	14	\N	—	[]	35mm Çap	\N	0	ADET	38.00	5	child	\N	f	f	f	f
7479	14	\N	—	[]	42mm Çap	\N	0	ADET	43.00	6	child	\N	f	f	f	f
7480	14	\N	—	[]	54mm Çap	\N	0	ADET	56.00	7	child	\N	f	f	f	f
7481	14	\N	Duvar Modülleri	["EN 737 ve EN 793'e Uygun, Alüminyum Profil, Elektrostatik Toz Boya"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/004f0e70-81bb-4493-8d38-3e38a38b7ecb	0	ADET	0.00	8	group	\N	t	f	f	f
7482	14	\N	—	[]	1 Gaz İçin	\N	17	ADET	25.00	9	child	\N	t	f	f	f
7483	14	\N	—	[]	2 Gaz İçin Klasik	\N	16	ADET	30.00	10	child	\N	t	f	f	f
7484	14	\N	—	[]	2 Gaz İçin TİP F	\N	0	ADET	100.00	11	child	\N	f	f	f	f
7485	14	\N	—	[]	3 Gaz İçin TİP C	\N	6	ADET	35.00	12	child	\N	t	f	f	f
7486	14	\N	—	[]	4 Gaz İçin TİP C	\N	3	ADET	40.00	13	child	\N	t	f	f	f
7487	14	\N	—	[]	5 Gaz İçin TİP D	\N	0	ADET	60.00	14	child	\N	f	f	f	f
7488	14	\N	—	[]	6 Gaz İçin TİP E	\N	2	ADET	50.00	15	child	\N	t	f	f	f
7489	14	\N	—	[]	Anestezi İçin	\N	3	ADET	150.00	16	child	\N	t	f	f	f
7490	14	\N	—	[]	Cerrahi İçin	\N	2	ADET	180.00	17	child	\N	t	f	f	f
7491	14	\N	Hastabaşı Ünitesi	["1 Kişilik Hasta Yoğun Bakım Ünitesi (150 cm.)", "Alüminyum Yatay Tip, Duvara montaj", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Ünite Boyunca Ray- Paslanmaz Çelik"]	OXY-HYB-100	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/f5780e62-9914-41b3-b36c-b57922244bd6	69	ADET	150.00	18	single	\N	t	f	t	f
7492	14	\N	Medikal Gaz Prizleri	["BS Standardı, Tamamıyla Metal Konstrüksiyon"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/dfc343ac-0192-49d2-95ea-fd38fd4b014f	0	ADET	0.00	19	group	\N	t	f	f	f
7493	14	\N	—	[]	Oksijen Prizi	\N	199	ADET	18.50	20	child	\N	t	f	f	f
7494	14	\N	—	[]	Vakum Prizi	\N	187	ADET	18.50	21	child	\N	t	f	f	f
7495	14	\N	—	[]	N2O Prizi	\N	4	ADET	18.50	22	child	\N	t	f	f	f
7496	14	\N	—	[]	Basınçlı Hava Prizi (MA4)	\N	57	ADET	18.50	23	child	\N	t	f	f	f
7497	14	\N	—	[]	Basınçlı Hava Prizi (SA7)	\N	15	ADET	18.50	24	child	\N	t	f	f	f
7498	14	\N	—	[]	AGSS Prizi VENTÜRİ	\N	4	ADET	35.00	25	child	\N	t	f	f	f
7499	14	\N	Kolon Tipi Yoğun Bakım Ünitesi - (Tek Hasta İçin)	["Alüminyum Yan Gövdeler, MDF ön ve arka yüzey, Tavan yüksekliğinde", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Askı Rayı - Paslanmaz Çelik"]	OXY-KTYB-100	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/b8daca1b-e15d-413d-9c1d-194152466f8a	16	ADET	625.00	26	single	\N	t	f	f	f
7500	14	\N	Hasta Yoğun Bakım Ünitesi	["1 Kişilik Yoğun Bakım Ünitesi (150 - 180 cm.)", "Alüminyum Yatay Tip, Duvara montaj", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Ünite Boyunca Ray- Paslanmaz Çelik"]	OXY-YBU-200	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/206cf3a1-19d8-4108-bc72-5cfb20c00fd4	5	ADET	180.00	27	single	\N	t	f	f	f
7501	14	\N	Cerrahi Pendant	["Motorlu, Çok yönlü hareket edebilen", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	2	ADET	2500.00	28	single	\N	t	f	t	f
10711	27	\N	Cerrahi Pendant	["2 adet Oksijen Prizi (O2)", "1 adet Azot Protoksit Prizi (N2O)", "1 adet Medikal Hava 4 Bar Prizi", "2 adet Medikal Vakum Prizi", "1 adet Medikal Hava 7 Bar Prizi", "Yanlarda Paslanmaz Çelik Cihaz Askı Rayı"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	1	ADET	211500.00	1	single	\N	t	f	f	f
10712	27	\N	Hastabaşı Ünitesi	["1 Kişilik Hasta Yoğun Bakım Ünitesi (150 cm.)", "Alüminyum Yatay Tip, Duvara montaj"]	OXY-HYB-100	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/f5780e62-9914-41b3-b36c-b57922244bd6	1	ADET	14100.00	2	single	\N	t	f	f	f
11310	36	\N	صندوق صمامات الغازات الطبية	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/a60fdfb3-ca96-4175-99f0-b3e65b23e32a	0	ADET	0.00	6	group	\N	t	f	f	f
13902	46	\N	Bölmə Kəsici Klapanları	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/46d5478b-0f9b-4ab0-9c97-ed1a8abab053	0	ADET	0.00	10	group	\N	t	f	f	f
10657	25	\N	—	[]	Q 25 MM PPRC BORU	\N	0	METRE	8.85	47	child	\N	f	f	f	f
10658	25	\N	—	[]	Q 32 MM PPRC BORU	\N	0	METRE	10.25	48	child	\N	f	f	f	f
11312	36	\N	وحدات الحائط	["متوافقة مع EN 737 وEN 793، بروفايل ألمنيوم، طلاء بودرة إلكتروستاتيكي", "(وحدة حائط لغازين 45CM)"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/004f0e70-81bb-4493-8d38-3e38a38b7ecb	0	ADET	0.00	20	group	\N	t	f	f	f
11313	36	\N	مخارج الغازات الطبية	["معيار BS، تصنيع معدني بالكامل"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/dfc343ac-0192-49d2-95ea-fd38fd4b014f	0	ADET	0.00	30	group	\N	t	f	f	f
11314	36	\N	أنابيب النحاس الطبية	["مستوردة من إيطاليا وألمانيا، ومتوافقة مع معيار EN 13348"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4795266d-90dc-4396-87ca-a020f6ca9255	0	ADET	0.00	37	group	\N	t	f	f	f
11316	36	\N	ذراع متحرك مزدوج للعناية المركزة	["فتحة مخرج شفط (مخارج الغاز تُسعّر بشكل منفصل)", "فتحة مخرج أكسجين (مخارج الغاز تُسعّر بشكل منفصل)", "فتحة مخرج MA4 (مخارج الغاز تُسعّر بشكل منفصل)", "فتحة مخرج N2O (مخارج الغاز تُسعّر بشكل منفصل)", "فتحة مخرج SA7 (مخارج الغاز تُسعّر بشكل منفصل)", "فتحة مخرج AGSS (مخارج الغاز تُسعّر بشكل منفصل)", "رف للشاشة", "مقبس مؤرّض", "نقطة تأريض"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/ce791833-7a7a-44f1-861d-4a8f8ca7a8b6	15	ADET	1550.00	50	single	\N	t	f	t	f
11318	36	\N	ذراع غرفة عمليات عامة	["مُشغّل بمحرك، حركة متعددة الاتجاهات", "فتحة مخرج شفط (مخارج الغاز تُسعّر بشكل منفصل)", "فتحة مخرج أكسجين (مخارج الغاز تُسعّر بشكل منفصل)", "فتحة مخرج MA4 (مخارج الغاز تُسعّر بشكل منفصل)", "فتحة مخرج N2O (مخارج الغاز تُسعّر بشكل منفصل)", "فتحة مخرج SA7 (مخارج الغاز تُسعّر بشكل منفصل)", "فتحة مخرج AGSS (مخارج الغاز تُسعّر بشكل منفصل)", "رف للشاشة", "مقبس مؤرّض", "نقطة تأريض"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	3	ADET	1850.00	52	single	\N	t	f	f	f
11319	36	\N	محطة شفط - (3 x 250 m³/h)	["3x مضخات شفط", "2*2000 Lt. خزان مع 1x لوحة تحكم بالشفط", "1x مجموعة فلتر بكتيري", "1x لوحة تحكم كهربائية للشفط", "1x مفتاح شفط", "1x مقياس شفط"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4d17142e-41af-4130-a3cb-c638f41f1cf4	1	ADET	19200.00	53	single	\N	t	f	t	f
13905	46	\N	—	[]	Ø15X1 mm.	\N	0	METRE	17.21	2	child	\N	f	f	f	f
13906	46	\N	—	[]	Ø22X1 mm.	\N	0	METRE	24.02	3	child	\N	f	f	f	f
13907	46	\N	—	[]	Ø28X1 mm.	\N	0	METRE	30.26	4	child	\N	f	f	f	f
11149	32	\N	—	[]	1 Gaz İçin	\N	1	ADET	75.00	1	child	\N	t	f	f	f
11150	32	\N	—	[]	2 Gaz İçin	\N	6	ADET	90.00	2	child	\N	t	f	f	f
11151	32	\N	—	[]	3 Gaz İçin	\N	23	ADET	105.00	3	child	\N	t	f	f	f
11152	32	\N	—	[]	4 Gaz İçin	\N	1	ADET	120.00	4	child	\N	t	f	f	f
11153	32	\N	—	[]	5 Gaz İçin	\N	6	ADET	135.00	5	child	\N	t	f	f	f
11154	32	\N	—	[]	1 Gaz İçin	\N	1	ADET	105.00	7	child	\N	t	f	f	f
11155	32	\N	—	[]	2 Gaz İçin	\N	6	ADET	155.00	8	child	\N	t	f	f	f
11156	32	\N	—	[]	3 Gaz İçin	\N	23	ADET	205.00	9	child	\N	t	f	f	f
11157	32	\N	—	[]	4 Gaz İçin	\N	1	ADET	250.00	10	child	\N	t	f	f	f
11158	32	\N	—	[]	5 Gaz İçin	\N	6	ADET	300.00	11	child	\N	t	f	f	f
11159	32	\N	—	[]	12mm Çap	\N	326	ADET	15.00	13	child	\N	t	f	f	f
11160	32	\N	—	[]	15mm Çap	\N	6	ADET	17.30	14	child	\N	t	f	f	f
11161	32	\N	—	[]	22mm Çap	\N	0	ADET	26.00	15	child	\N	f	f	f	f
11162	32	\N	—	[]	28mm Çap	\N	0	ADET	32.00	16	child	\N	f	f	f	f
11163	32	\N	—	[]	35mm Çap	\N	0	ADET	38.00	17	child	\N	f	f	f	f
11164	32	\N	—	[]	42mm Çap	\N	0	ADET	43.00	18	child	\N	f	f	f	f
11165	32	\N	—	[]	54mm Çap	\N	0	ADET	56.00	19	child	\N	f	f	f	f
11166	32	\N	—	[]	1 Gaz İçin	\N	21	ADET	15.00	21	child	\N	t	f	f	f
11167	32	\N	—	[]	2 Gaz İçin Klasik	\N	51	ADET	30.00	22	child	\N	t	f	f	f
11168	32	\N	—	[]	2 Gaz İçin TİP F	\N	0	ADET	100.00	23	child	\N	f	f	f	f
11169	32	\N	—	[]	3 Gaz İçin TİP C	\N	0	ADET	100.00	24	child	\N	f	f	f	f
11170	32	\N	—	[]	3 Gaz İçin TİP C	\N	0	ADET	120.00	25	child	\N	f	f	f	f
11171	32	\N	—	[]	5 Gaz İçin TİP D	\N	4	ADET	60.00	26	child	\N	t	f	f	f
11172	32	\N	—	[]	6 Gaz İçin TİP E	\N	4	ADET	80.00	27	child	\N	t	f	f	f
11173	32	\N	—	[]	Anestezi İçin	\N	0	ADET	150.00	28	child	\N	f	f	f	f
11174	32	\N	—	[]	Cerrahi İçin	\N	0	ADET	180.00	29	child	\N	f	f	f	f
11175	32	\N	—	[]	Oksijen Prizi	\N	392	ADET	19.00	31	child	\N	t	f	f	f
11148	32	\N	Nitrous Oxide Manifold System  (2 x 5 Cylinders) +1*5	["Fully Automatic Control and Pressure Reducing Panel", "Cylinder Holder with Safety Chain  (for 5 Cylinders)", "Automatic Changeover", "Plant Alarm", "Flexible Connection Between Cylinder and Manifold", "Flexible Connection Between Manifolds", "Combined Shut-Off Safety Valve"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	2850.00	56	single	\N	t	f	f	f
8808	21	\N	LZ20 ITR 1912994 SNO KOMPRESÖR FİLİTRESİ	[]	\N	\N	2	ADET	10750.00	0	single	\N	t	f	f	f
8809	21	\N	HAT FİLİTRESİ İÇ  ELEMENTİ	[]	\N	\N	3	ADET	3500.00	1	single	\N	t	f	f	f
8810	21	\N	EKSOZ HATTI HEPA FİLİTRE	[]	\N	\N	2	ADET	8000.00	2	single	\N	t	f	f	f
8811	21	\N	MOTOR RULMAN SETİ	[]	\N	\N	4	SET	4250.00	3	single	\N	t	f	f	f
13908	46	\N	—	[]	Ø35X1 mm.	\N	0	METRE	37.47	5	child	\N	f	f	f	f
13909	46	\N	—	[]	Ø42X1 mm.	\N	0	METRE	0.00	6	child	\N	f	f	f	f
13910	46	\N	—	[]	Ø54X1 mm.	\N	0	METRE	0.00	7	child	\N	f	f	f	f
13911	46	\N	—	[]	Ø76X1 mm.	\N	0	METRE	0.00	8	child	\N	f	f	f	f
13912	46	\N	—	[]	Ø108X1 mm.	\N	0	METRE	0.00	9	child	\N	f	f	f	f
13913	46	\N	—	[]	12mm Diametr	\N	9	ADET	17.50	11	child	\N	t	f	f	f
13914	46	\N	—	[]	15mm Diametr	\N	0	ADET	19.30	12	child	\N	f	f	f	f
13915	46	\N	—	[]	22mm Diametr	\N	0	ADET	26.00	13	child	\N	f	f	f	f
13916	46	\N	—	[]	28mm Diametr	\N	0	ADET	32.00	14	child	\N	f	f	f	f
13917	46	\N	—	[]	35mm Diametr	\N	0	ADET	38.00	15	child	\N	f	f	f	f
13918	46	\N	—	[]	42mm Diametr	\N	0	ADET	43.00	16	child	\N	f	f	f	f
13919	46	\N	—	[]	54mm Diametr	\N	0	ADET	56.00	17	child	\N	f	f	f	f
11176	32	\N	—	[]	Vakum Prizi	\N	260	ADET	18.99	32	child	\N	t	f	f	f
11177	32	\N	—	[]	N2O Prizi	\N	6	ADET	18.99	33	child	\N	t	f	f	f
11178	32	\N	—	[]	Basınçlı Hava Prizi (MA4)	\N	209	ADET	19.00	34	child	\N	t	f	f	f
11179	32	\N	—	[]	Basınçlı Hava Prizi (SA7)	\N	21	ADET	19.00	35	child	\N	t	f	f	f
11180	32	\N	—	[]	AGSS Prizi VENTÜRİ	\N	6	ADET	35.00	36	child	\N	t	f	f	f
11181	32	\N	—	[]	Ø12X1 mm.	\N	9470	METRE	8.20	38	child	\N	t	f	f	f
11182	32	\N	—	[]	Ø15X1 mm.	\N	1480	METRE	10.42	39	child	\N	t	f	f	f
11183	32	\N	—	[]	Ø22X1 mm.	\N	1720	METRE	15.60	40	child	\N	t	f	f	f
11184	32	\N	—	[]	Ø28X1 mm.	\N	670	METRE	20.30	41	child	\N	t	f	f	f
11185	32	\N	—	[]	Ø35X1 mm.	\N	520	METRE	20.76	42	child	\N	t	f	f	f
11186	32	\N	—	[]	Ø42X1 mm.	\N	340	METRE	31.35	43	child	\N	t	f	f	f
11187	32	\N	—	[]	Ø54X1 mm.	\N	110	METRE	43.20	44	child	\N	t	f	f	f
11188	32	\N	—	[]	Ø76X1 mm.	\N	0	METRE	0.00	45	child	\N	f	f	f	f
11189	32	\N	—	[]	Ø108X1 mm.	\N	0	METRE	0.00	46	child	\N	f	f	f	f
11190	32	\N	—	[]	Q 25 MM PPRC BORU	\N	0	METRE	8.85	47	child	\N	f	f	f	f
11191	32	\N	—	[]	Q 32 MM PPRC BORU	\N	0	METRE	10.25	48	child	\N	f	f	f	f
10146	23	\N	Medikal Gaz Alarm Paneli	["HTM 2022 ye birebir uygun, Yüksek-Normal-Düşük Basınç Göstergeli", "Gazın anlık geçiş basıncını izleyebilen - Switchleri ile Komple"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/66921ec0-369a-415e-802a-d7b28b40def6	0	ADET	0.00	0	group	\N	t	f	f	f
10147	23	\N	—	[]	1 Gaz İçin	\N	1	ADET	75.00	1	child	\N	t	f	f	f
10148	23	\N	—	[]	2 Gaz İçin	\N	6	ADET	90.00	2	child	\N	t	f	f	f
10149	23	\N	—	[]	3 Gaz İçin	\N	23	ADET	105.00	3	child	\N	t	f	f	f
10150	23	\N	—	[]	4 Gaz İçin	\N	1	ADET	120.00	4	child	\N	t	f	f	f
10151	23	\N	—	[]	5 Gaz İçin	\N	6	ADET	135.00	5	child	\N	t	f	f	f
10152	23	\N	Medikal Gaz Vana Kutusu	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/a60fdfb3-ca96-4175-99f0-b3e65b23e32a	0	ADET	0.00	6	group	\N	t	f	f	f
10153	23	\N	—	[]	1 Gaz İçin	\N	1	ADET	105.00	7	child	\N	t	f	f	f
10154	23	\N	—	[]	2 Gaz İçin	\N	6	ADET	155.00	8	child	\N	t	f	f	f
10155	23	\N	—	[]	3 Gaz İçin	\N	23	ADET	205.00	9	child	\N	t	f	f	f
10156	23	\N	—	[]	4 Gaz İçin	\N	1	ADET	250.00	10	child	\N	t	f	f	f
10157	23	\N	—	[]	5 Gaz İçin	\N	6	ADET	300.00	11	child	\N	t	f	f	f
10158	23	\N	Bölüm Kesme Vanaları	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/46d5478b-0f9b-4ab0-9c97-ed1a8abab053	0	ADET	0.00	12	group	\N	t	f	f	f
10159	23	\N	—	[]	12mm Çap	\N	326	ADET	15.00	13	child	\N	t	f	f	f
10160	23	\N	—	[]	15mm Çap	\N	6	ADET	17.30	14	child	\N	t	f	f	f
10161	23	\N	—	[]	22mm Çap	\N	0	ADET	26.00	15	child	\N	f	f	f	f
10162	23	\N	—	[]	28mm Çap	\N	0	ADET	32.00	16	child	\N	f	f	f	f
10163	23	\N	—	[]	35mm Çap	\N	0	ADET	38.00	17	child	\N	f	f	f	f
10164	23	\N	—	[]	42mm Çap	\N	0	ADET	43.00	18	child	\N	f	f	f	f
10165	23	\N	—	[]	54mm Çap	\N	0	ADET	56.00	19	child	\N	f	f	f	f
10166	23	\N	Duvar Modülleri	["EN 737 ve EN 793'e Uygun, Alüminyum Profil, Elektrostatik Toz Boya", "(2 Gazlı duvar modulü 45CM)"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/004f0e70-81bb-4493-8d38-3e38a38b7ecb	0	ADET	0.00	20	group	\N	t	f	f	f
10167	23	\N	—	[]	1 Gaz İçin	\N	21	ADET	15.00	21	child	\N	t	f	f	f
10168	23	\N	—	[]	2 Gaz İçin Klasik	\N	51	ADET	30.00	22	child	\N	t	f	f	f
10169	23	\N	—	[]	2 Gaz İçin TİP F	\N	0	ADET	100.00	23	child	\N	f	f	f	f
10170	23	\N	—	[]	3 Gaz İçin TİP C	\N	0	ADET	100.00	24	child	\N	f	f	f	f
10171	23	\N	—	[]	3 Gaz İçin TİP C	\N	0	ADET	120.00	25	child	\N	f	f	f	f
10172	23	\N	—	[]	5 Gaz İçin TİP D	\N	4	ADET	60.00	26	child	\N	t	f	f	f
10173	23	\N	—	[]	6 Gaz İçin TİP E	\N	4	ADET	80.00	27	child	\N	t	f	f	f
10174	23	\N	—	[]	Anestezi İçin	\N	0	ADET	150.00	28	child	\N	f	f	f	f
10175	23	\N	—	[]	Cerrahi İçin	\N	0	ADET	180.00	29	child	\N	f	f	f	f
10176	23	\N	Medikal Gaz Prizleri	["BS Standardı, Tamamıyla Metal Konstrüksiyon"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/dfc343ac-0192-49d2-95ea-fd38fd4b014f	0	ADET	0.00	30	group	\N	t	f	f	f
10177	23	\N	—	[]	Oksijen Prizi	\N	392	ADET	19.00	31	child	\N	t	f	f	f
10178	23	\N	—	[]	Vakum Prizi	\N	260	ADET	18.99	32	child	\N	t	f	f	f
10179	23	\N	—	[]	N2O Prizi	\N	6	ADET	18.99	33	child	\N	t	f	f	f
10180	23	\N	—	[]	Basınçlı Hava Prizi (MA4)	\N	209	ADET	19.00	34	child	\N	t	f	f	f
10181	23	\N	—	[]	Basınçlı Hava Prizi (SA7)	\N	21	ADET	19.00	35	child	\N	t	f	f	f
10182	23	\N	—	[]	AGSS Prizi VENTÜRİ	\N	6	ADET	35.00	36	child	\N	t	f	f	f
10183	23	\N	Medikal Bakır Boruları	["İtalya ,Almanya'dan ithal, EN 13348 standardında"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4795266d-90dc-4396-87ca-a020f6ca9255	0	ADET	0.00	37	group	\N	t	f	f	f
10184	23	\N	—	[]	Ø12X1 mm.	\N	9470	METRE	8.20	38	child	\N	t	f	f	f
10185	23	\N	—	[]	Ø15X1 mm.	\N	1480	METRE	10.42	39	child	\N	t	f	f	f
10186	23	\N	—	[]	Ø22X1 mm.	\N	1720	METRE	15.60	40	child	\N	t	f	f	f
10187	23	\N	—	[]	Ø28X1 mm.	\N	670	METRE	20.30	41	child	\N	t	f	f	f
10188	23	\N	—	[]	Ø35X1 mm.	\N	520	METRE	20.76	42	child	\N	t	f	f	f
10189	23	\N	—	[]	Ø42X1 mm.	\N	340	METRE	31.35	43	child	\N	t	f	f	f
10190	23	\N	—	[]	Ø54X1 mm.	\N	110	METRE	43.20	44	child	\N	t	f	f	f
10191	23	\N	—	[]	Ø76X1 mm.	\N	0	METRE	0.00	45	child	\N	f	f	f	f
10192	23	\N	—	[]	Ø108X1 mm.	\N	0	METRE	0.00	46	child	\N	f	f	f	f
10193	23	\N	—	[]	Q 25 MM PPRC BORU	\N	0	METRE	8.85	47	child	\N	f	f	f	f
10194	23	\N	—	[]	Q 32 MM PPRC BORU	\N	0	METRE	10.25	48	child	\N	f	f	f	f
10195	23	\N	Hastabaşı Ünitesi	["1 Kişilik Hasta Yoğun Bakım Ünitesi (150 cm.)", "Alüminyum Yatay Tip, Duvara montaj", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Ünite Boyunca Ray- Paslanmaz Çelik"]	OXY-HYB-100	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/f5780e62-9914-41b3-b36c-b57922244bd6	156	ADET	120.00	49	single	\N	t	f	f	f
10196	23	\N	Hareketli Çift kollu Yoğun Bakım Pendantı	["Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/ce791833-7a7a-44f1-861d-4a8f8ca7a8b6	15	ADET	1550.00	50	single	\N	t	f	t	f
10197	23	\N	Cerrahi Pendant	["Motorlu, Çok yönlü hareket edebilen", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	3	ADET	1850.00	51	single	\N	t	f	f	f
10198	23	\N	Genel Tip Ameliyathane Pendantı	["Motorlu, Çok yönlü hareket edebilen", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	3	ADET	1850.00	52	single	\N	t	f	f	f
10199	23	\N	Vakum Santral Merkezi -  (3 x 250 m³/h)	["3x Vakum Pompası", "1x Vakum Kontrol Paneli ile Birlikte 2*2000 Lt. 'lik Tank", "1x Bakteri Filtre Gurubu", "1x Vakum Elektrik Kontrol Paneli", "1x Vakustat", "1x Vakummetre"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4d17142e-41af-4130-a3cb-c638f41f1cf4	1	ADET	19200.00	53	single	\N	t	f	t	f
10200	23	\N	Basınçlı Hava Santral Merkezi -  (3 x 250  m³/h)	["3x  Basınçlı Hava Kompresörü", "3x  Hat Flitresi", "1x  Kimyasal Hava Kurutucu", "2x  1000 Lt. Tank", "1x  Elektrik Kontrol Paneli"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4297778e-7ab1-470e-9394-96efde66a49b	1	ADET	43500.00	54	single	\N	t	f	t	f
10201	23	\N	Oksijen Santral Merkezi - (2 x 20 Tüplük) +1*20	["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	5250.00	55	single	\N	t	f	f	t
10202	23	\N	Azot Prodoksit Santral Merkez  (2 x 5 Tüplük) +1*5	["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	2850.00	56	single	\N	t	f	f	f
12252	28	\N	Medikal Gaz Alarm Paneli	["HTM 2022 ye birebir uygun, Yüksek-Normal-Düşük Basınç Göstergeli", "Gazın anlık geçiş basıncını izleyebilen - Switchleri ile Komple"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/66921ec0-369a-415e-802a-d7b28b40def6	0	ADET	0.00	0	group	\N	t	f	f	f
11321	36	\N	نظام مشعب الأكسجين - (2 x 20 أسطوانة) +1*20	["لوحة تحكم وخفض ضغط أوتوماتيكية بالكامل", "حامل أسطوانات مزود بسلسلة أمان (لـ 5 أسطوانات)", "تحويل تلقائي", "إنذار المحطة", "وصلة مرنة بين الأسطوانة والمشعب", "وصلة مرنة بين المشعبات", "صمام أمان مركب للإغلاق"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	5250.00	55	single	\N	t	f	f	t
11141	32	\N	Bedhead Unit	["Single-Bed Intensive Care Unit (150 cm.)", "Horizontal aluminum type, wall-mounted", "Vacuum Outlet Recess (Gas Outlets Priced Separately)", "Oxygen Outlet Recess (Gas Outlets Priced Separately)", "MA4 Outlet Recess (Gas Outlets Priced Separately)", "RJ 45 Data Outlet", "Grounded Socket", "UPS Socket", "Grounding Node", "Rail Along the Unit - Stainless Steel"]	OXY-HYB-100	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/f5780e62-9914-41b3-b36c-b57922244bd6	156	ADET	120.00	49	single	\N	t	f	f	f
10545	24	\N	Medikal Gaz Alarm Paneli	["HTM 2022 ye birebir uygun, Yüksek-Normal-Düşük Basınç Göstergeli", "Gazın anlık geçiş basıncını izleyebilen - Switchleri ile Komple"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/66921ec0-369a-415e-802a-d7b28b40def6	0	ADET	0.00	0	group	\N	t	f	f	f
10546	24	\N	—	[]	1 Gaz İçin	\N	1	ADET	75.00	1	child	\N	t	f	f	f
10547	24	\N	—	[]	2 Gaz İçin	\N	6	ADET	90.00	2	child	\N	t	f	f	f
10548	24	\N	—	[]	3 Gaz İçin	\N	23	ADET	105.00	3	child	\N	t	f	f	f
10549	24	\N	—	[]	4 Gaz İçin	\N	1	ADET	120.00	4	child	\N	t	f	f	f
10550	24	\N	—	[]	5 Gaz İçin	\N	6	ADET	135.00	5	child	\N	t	f	f	f
10551	24	\N	Medikal Gaz Vana Kutusu	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/a60fdfb3-ca96-4175-99f0-b3e65b23e32a	0	ADET	0.00	6	group	\N	t	f	f	f
10552	24	\N	—	[]	1 Gaz İçin	\N	1	ADET	105.00	7	child	\N	t	f	f	f
10553	24	\N	—	[]	2 Gaz İçin	\N	6	ADET	155.00	8	child	\N	t	f	f	f
10554	24	\N	—	[]	3 Gaz İçin	\N	23	ADET	205.00	9	child	\N	t	f	f	f
10555	24	\N	—	[]	4 Gaz İçin	\N	1	ADET	250.00	10	child	\N	t	f	f	f
10556	24	\N	—	[]	5 Gaz İçin	\N	6	ADET	300.00	11	child	\N	t	f	f	f
10557	24	\N	Bölüm Kesme Vanaları	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/46d5478b-0f9b-4ab0-9c97-ed1a8abab053	0	ADET	0.00	12	group	\N	t	f	f	f
10558	24	\N	—	[]	12mm Çap	\N	326	ADET	15.00	13	child	\N	t	f	f	f
10559	24	\N	—	[]	15mm Çap	\N	6	ADET	17.30	14	child	\N	t	f	f	f
10560	24	\N	—	[]	22mm Çap	\N	0	ADET	26.00	15	child	\N	f	f	f	f
10561	24	\N	—	[]	28mm Çap	\N	0	ADET	32.00	16	child	\N	f	f	f	f
10562	24	\N	—	[]	35mm Çap	\N	0	ADET	38.00	17	child	\N	f	f	f	f
12253	28	\N	—	[]	1 Gaz İçin	\N	0	ADET	120.00	1	child	\N	f	f	f	f
12254	28	\N	—	[]	2 Gaz İçin	\N	1	ADET	140.00	2	child	\N	t	f	f	f
12255	28	\N	—	[]	3 Gaz İçin	\N	1	ADET	160.00	3	child	\N	t	f	f	f
10563	24	\N	—	[]	42mm Çap	\N	0	ADET	43.00	18	child	\N	f	f	f	f
10564	24	\N	—	[]	54mm Çap	\N	0	ADET	56.00	19	child	\N	f	f	f	f
10565	24	\N	Duvar Modülleri	["EN 737 ve EN 793'e Uygun, Alüminyum Profil, Elektrostatik Toz Boya", "(2 Gazlı duvar modulü 45CM)"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/004f0e70-81bb-4493-8d38-3e38a38b7ecb	0	ADET	0.00	20	group	\N	t	f	f	f
10566	24	\N	—	[]	1 Gaz İçin	\N	21	ADET	15.00	21	child	\N	t	f	f	f
10567	24	\N	—	[]	2 Gaz İçin Klasik	\N	51	ADET	30.00	22	child	\N	t	f	f	f
10568	24	\N	—	[]	2 Gaz İçin TİP F	\N	0	ADET	100.00	23	child	\N	f	f	f	f
10569	24	\N	—	[]	3 Gaz İçin TİP C	\N	0	ADET	100.00	24	child	\N	f	f	f	f
10570	24	\N	—	[]	3 Gaz İçin TİP C	\N	0	ADET	120.00	25	child	\N	f	f	f	f
10571	24	\N	—	[]	5 Gaz İçin TİP D	\N	4	ADET	60.00	26	child	\N	t	f	f	f
10572	24	\N	—	[]	6 Gaz İçin TİP E	\N	4	ADET	80.00	27	child	\N	t	f	f	f
10573	24	\N	—	[]	Anestezi İçin	\N	0	ADET	150.00	28	child	\N	f	f	f	f
10574	24	\N	—	[]	Cerrahi İçin	\N	0	ADET	180.00	29	child	\N	f	f	f	f
10575	24	\N	Medikal Gaz Prizleri	["BS Standardı, Tamamıyla Metal Konstrüksiyon"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/dfc343ac-0192-49d2-95ea-fd38fd4b014f	0	ADET	0.00	30	group	\N	t	f	f	f
10576	24	\N	—	[]	Oksijen Prizi	\N	392	ADET	19.00	31	child	\N	t	f	f	f
10577	24	\N	—	[]	Vakum Prizi	\N	260	ADET	18.99	32	child	\N	t	f	f	f
10578	24	\N	—	[]	N2O Prizi	\N	6	ADET	18.99	33	child	\N	t	f	f	f
10579	24	\N	—	[]	Basınçlı Hava Prizi (MA4)	\N	209	ADET	19.00	34	child	\N	t	f	f	f
10580	24	\N	—	[]	Basınçlı Hava Prizi (SA7)	\N	21	ADET	19.00	35	child	\N	t	f	f	f
10581	24	\N	—	[]	AGSS Prizi VENTÜRİ	\N	6	ADET	35.00	36	child	\N	t	f	f	f
10582	24	\N	Medikal Bakır Boruları	["İtalya ,Almanya'dan ithal, EN 13348 standardında"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4795266d-90dc-4396-87ca-a020f6ca9255	0	ADET	0.00	37	group	\N	t	f	f	f
10583	24	\N	—	[]	Ø12X1 mm.	\N	9470	METRE	7.60	38	child	\N	t	f	f	f
10584	24	\N	—	[]	Ø15X1 mm.	\N	1480	METRE	9.60	39	child	\N	t	f	f	f
10585	24	\N	—	[]	Ø22X1 mm.	\N	1720	METRE	14.35	40	child	\N	t	f	f	f
10586	24	\N	—	[]	Ø28X1 mm.	\N	670	METRE	18.70	41	child	\N	t	f	f	f
10587	24	\N	—	[]	Ø35X1 mm.	\N	520	METRE	23.72	42	child	\N	t	f	f	f
10588	24	\N	—	[]	Ø42X1 mm.	\N	340	METRE	28.85	43	child	\N	t	f	f	f
10589	24	\N	—	[]	Ø54X1 mm.	\N	110	METRE	39.70	44	child	\N	t	f	f	f
10590	24	\N	—	[]	Ø76X1 mm.	\N	0	METRE	0.00	45	child	\N	f	f	f	f
10591	24	\N	—	[]	Ø108X1 mm.	\N	0	METRE	0.00	46	child	\N	f	f	f	f
10592	24	\N	—	[]	Q 25 MM PPRC BORU	\N	0	METRE	8.85	47	child	\N	f	f	f	f
10593	24	\N	—	[]	Q 32 MM PPRC BORU	\N	0	METRE	10.25	48	child	\N	f	f	f	f
10594	24	\N	Hastabaşı Ünitesi	["1 Kişilik Hasta Yoğun Bakım Ünitesi (150 cm.)", "Alüminyum Yatay Tip, Duvara montaj", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Ünite Boyunca Ray- Paslanmaz Çelik"]	OXY-HYB-100	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/f5780e62-9914-41b3-b36c-b57922244bd6	156	ADET	120.00	49	single	\N	t	f	f	f
10595	24	\N	Hareketli Çift kollu Yoğun Bakım Pendantı	["Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/ce791833-7a7a-44f1-861d-4a8f8ca7a8b6	15	ADET	1550.00	50	single	\N	t	f	t	f
10596	24	\N	Cerrahi Pendant	["Motorlu, Çok yönlü hareket edebilen", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	3	ADET	1850.00	51	single	\N	t	f	f	f
10597	24	\N	Genel Tip Ameliyathane Pendantı	["Motorlu, Çok yönlü hareket edebilen", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	3	ADET	1850.00	52	single	\N	t	f	f	f
10598	24	\N	Vakum Santral Merkezi -  (3 x 250 m³/h)	["3x Vakum Pompası", "1x Vakum Kontrol Paneli ile Birlikte 2*2000 Lt. 'lik Tank", "1x Bakteri Filtre Gurubu", "1x Vakum Elektrik Kontrol Paneli", "1x Vakustat", "1x Vakummetre"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4d17142e-41af-4130-a3cb-c638f41f1cf4	1	ADET	19200.00	53	single	\N	t	f	t	f
10599	24	\N	Basınçlı Hava Santral Merkezi -  (3 x 250  m³/h)	["3x  Basınçlı Hava Kompresörü", "3x  Hat Flitresi", "1x  Kimyasal Hava Kurutucu", "2x  1000 Lt. Tank", "1x  Elektrik Kontrol Paneli"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4297778e-7ab1-470e-9394-96efde66a49b	1	ADET	27500.00	54	single	\N	t	f	t	f
12256	28	\N	—	[]	4 Gaz İçin	\N	1	ADET	180.00	4	child	\N	t	f	f	f
12257	28	\N	—	[]	5 Gaz İçin	\N	0	ADET	200.00	5	child	\N	f	f	f	f
10600	24	\N	Oksijen Santral Merkezi - (2 x 20 Tüplük) +1*20	["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	5250.00	55	single	\N	t	f	f	t
10601	24	\N	Azot Prodoksit Santral Merkez  (2 x 5 Tüplük) +1*5	["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	2850.00	56	single	\N	t	f	f	f
10611	25	\N	Genel Tip Ameliyathane Pendantı	["Motorlu, Çok yönlü hareket edebilen", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	3	ADET	1850.00	52	single	\N	t	f	f	f
10612	25	\N	Vakum Santral Merkezi -  (3 x 250 m³/h)	["3x Vakum Pompası", "1x Vakum Kontrol Paneli ile Birlikte 2*2000 Lt. 'lik Tank", "1x Bakteri Filtre Gurubu", "1x Vakum Elektrik Kontrol Paneli", "1x Vakustat", "1x Vakummetre"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4d17142e-41af-4130-a3cb-c638f41f1cf4	1	ADET	19200.00	53	single	\N	t	f	t	f
10613	25	\N	Basınçlı Hava Santral Merkezi -  (3 x 250  m³/h)	["3x  Basınçlı Hava Kompresörü", "3x  Hat Flitresi", "1x  Kimyasal Hava Kurutucu", "2x  1000 Lt. Tank", "1x  Elektrik Kontrol Paneli"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4297778e-7ab1-470e-9394-96efde66a49b	1	ADET	27500.00	54	single	\N	t	f	t	f
10614	25	\N	Oksijen Santral Merkezi - (2 x 20 Tüplük) +1*20	["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	5250.00	55	single	\N	t	f	f	t
10615	25	\N	Azot Prodoksit Santral Merkez  (2 x 5 Tüplük) +1*5	["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	2850.00	56	single	\N	t	f	f	f
10616	25	\N	—	[]	1 Gaz İçin	\N	1	ADET	75.00	1	child	\N	t	f	f	f
10617	25	\N	—	[]	2 Gaz İçin	\N	6	ADET	90.00	2	child	\N	t	f	f	f
10618	25	\N	—	[]	3 Gaz İçin	\N	23	ADET	105.00	3	child	\N	t	f	f	f
10619	25	\N	—	[]	4 Gaz İçin	\N	1	ADET	120.00	4	child	\N	t	f	f	f
10620	25	\N	—	[]	5 Gaz İçin	\N	6	ADET	135.00	5	child	\N	t	f	f	f
10621	25	\N	—	[]	1 Gaz İçin	\N	1	ADET	105.00	7	child	\N	t	f	f	f
10622	25	\N	—	[]	2 Gaz İçin	\N	6	ADET	155.00	8	child	\N	t	f	f	f
10623	25	\N	—	[]	3 Gaz İçin	\N	23	ADET	205.00	9	child	\N	t	f	f	f
10624	25	\N	—	[]	4 Gaz İçin	\N	1	ADET	250.00	10	child	\N	t	f	f	f
10625	25	\N	—	[]	5 Gaz İçin	\N	6	ADET	300.00	11	child	\N	t	f	f	f
10626	25	\N	—	[]	12mm Çap	\N	326	ADET	15.00	13	child	\N	t	f	f	f
10627	25	\N	—	[]	15mm Çap	\N	6	ADET	17.30	14	child	\N	t	f	f	f
10628	25	\N	—	[]	22mm Çap	\N	0	ADET	26.00	15	child	\N	f	f	f	f
10629	25	\N	—	[]	28mm Çap	\N	0	ADET	32.00	16	child	\N	f	f	f	f
10630	25	\N	—	[]	35mm Çap	\N	0	ADET	38.00	17	child	\N	f	f	f	f
10631	25	\N	—	[]	42mm Çap	\N	0	ADET	43.00	18	child	\N	f	f	f	f
10632	25	\N	—	[]	54mm Çap	\N	0	ADET	56.00	19	child	\N	f	f	f	f
10633	25	\N	—	[]	1 Gaz İçin	\N	21	ADET	15.00	21	child	\N	t	f	f	f
10634	25	\N	—	[]	2 Gaz İçin Klasik	\N	51	ADET	30.00	22	child	\N	t	f	f	f
10635	25	\N	—	[]	2 Gaz İçin TİP F	\N	0	ADET	100.00	23	child	\N	f	f	f	f
10636	25	\N	—	[]	3 Gaz İçin TİP C	\N	0	ADET	100.00	24	child	\N	f	f	f	f
10637	25	\N	—	[]	3 Gaz İçin TİP C	\N	0	ADET	120.00	25	child	\N	f	f	f	f
10638	25	\N	—	[]	5 Gaz İçin TİP D	\N	4	ADET	60.00	26	child	\N	t	f	f	f
10639	25	\N	—	[]	6 Gaz İçin TİP E	\N	4	ADET	80.00	27	child	\N	t	f	f	f
10640	25	\N	—	[]	Anestezi İçin	\N	0	ADET	150.00	28	child	\N	f	f	f	f
10641	25	\N	—	[]	Cerrahi İçin	\N	0	ADET	180.00	29	child	\N	f	f	f	f
10642	25	\N	—	[]	Oksijen Prizi	\N	392	ADET	19.00	31	child	\N	t	f	f	f
10643	25	\N	—	[]	Vakum Prizi	\N	260	ADET	18.99	32	child	\N	t	f	f	f
10644	25	\N	—	[]	N2O Prizi	\N	6	ADET	18.99	33	child	\N	t	f	f	f
10645	25	\N	—	[]	Basınçlı Hava Prizi (MA4)	\N	209	ADET	19.00	34	child	\N	t	f	f	f
10646	25	\N	—	[]	Basınçlı Hava Prizi (SA7)	\N	21	ADET	19.00	35	child	\N	t	f	f	f
10647	25	\N	—	[]	AGSS Prizi VENTÜRİ	\N	6	ADET	35.00	36	child	\N	t	f	f	f
10648	25	\N	—	[]	Ø12X1 mm.	\N	9470	METRE	7.60	38	child	\N	t	f	f	f
10649	25	\N	—	[]	Ø15X1 mm.	\N	1480	METRE	9.60	39	child	\N	t	f	f	f
10650	25	\N	—	[]	Ø22X1 mm.	\N	1720	METRE	14.35	40	child	\N	t	f	f	f
10651	25	\N	—	[]	Ø28X1 mm.	\N	670	METRE	18.70	41	child	\N	t	f	f	f
10652	25	\N	—	[]	Ø35X1 mm.	\N	520	METRE	23.72	42	child	\N	t	f	f	f
10653	25	\N	—	[]	Ø42X1 mm.	\N	340	METRE	28.85	43	child	\N	t	f	f	f
10654	25	\N	—	[]	Ø54X1 mm.	\N	110	METRE	39.70	44	child	\N	t	f	f	f
10655	25	\N	—	[]	Ø76X1 mm.	\N	0	METRE	0.00	45	child	\N	f	f	f	f
10602	25	\N	Medikal Gaz Alarm Paneli	["HTM 2022 ye birebir uygun, Yüksek-Normal-Düşük Basınç Göstergeli", "Gazın anlık geçiş basıncını izleyebilen - Switchleri ile Komple"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/66921ec0-369a-415e-802a-d7b28b40def6	0	ADET	0.00	0	group	\N	t	f	f	f
10603	25	\N	Medikal Gaz Vana Kutusu	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/a60fdfb3-ca96-4175-99f0-b3e65b23e32a	0	ADET	0.00	6	group	\N	t	f	f	f
11078	31	\N	Medikal Gaz Alarm Paneli	["HTM 2022 ye birebir uygun, Yüksek-Normal-Düşük Basınç Göstergeli", "Gazın anlık geçiş basıncını izleyebilen - Switchleri ile Komple"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/66921ec0-369a-415e-802a-d7b28b40def6	0	ADET	0.00	0	group	\N	t	f	f	f
11079	31	\N	Medikal Gaz Vana Kutusu	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/a60fdfb3-ca96-4175-99f0-b3e65b23e32a	0	ADET	0.00	6	group	\N	t	f	f	f
11080	31	\N	Bölüm Kesme Vanaları	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/46d5478b-0f9b-4ab0-9c97-ed1a8abab053	0	ADET	0.00	12	group	\N	t	f	f	f
11081	31	\N	Duvar Modülleri	["EN 737 ve EN 793'e Uygun, Alüminyum Profil, Elektrostatik Toz Boya", "(2 Gazlı duvar modulü 45CM)"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/004f0e70-81bb-4493-8d38-3e38a38b7ecb	0	ADET	0.00	20	group	\N	t	f	f	f
11082	31	\N	Medikal Gaz Prizleri	["BS Standardı, Tamamıyla Metal Konstrüksiyon"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/dfc343ac-0192-49d2-95ea-fd38fd4b014f	0	ADET	0.00	30	group	\N	t	f	f	f
11083	31	\N	Medikal Bakır Boruları	["İtalya ,Almanya'dan ithal, EN 13348 standardında"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4795266d-90dc-4396-87ca-a020f6ca9255	0	ADET	0.00	37	group	\N	t	f	f	f
10604	25	\N	Bölüm Kesme Vanaları	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/46d5478b-0f9b-4ab0-9c97-ed1a8abab053	0	ADET	0.00	12	group	\N	t	f	f	f
10605	25	\N	Duvar Modülleri	["EN 737 ve EN 793'e Uygun, Alüminyum Profil, Elektrostatik Toz Boya", "(2 Gazlı duvar modulü 45CM)"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/004f0e70-81bb-4493-8d38-3e38a38b7ecb	0	ADET	0.00	20	group	\N	t	f	f	f
10606	25	\N	Medikal Gaz Prizleri	["BS Standardı, Tamamıyla Metal Konstrüksiyon"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/dfc343ac-0192-49d2-95ea-fd38fd4b014f	0	ADET	0.00	30	group	\N	t	f	f	f
10607	25	\N	Medikal Bakır Boruları	["İtalya ,Almanya'dan ithal, EN 13348 standardında"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4795266d-90dc-4396-87ca-a020f6ca9255	0	ADET	0.00	37	group	\N	t	f	f	f
10608	25	\N	Hastabaşı Ünitesi	["1 Kişilik Hasta Yoğun Bakım Ünitesi (150 cm.)", "Alüminyum Yatay Tip, Duvara montaj", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Ünite Boyunca Ray- Paslanmaz Çelik"]	OXY-HYB-100	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/f5780e62-9914-41b3-b36c-b57922244bd6	156	ADET	120.00	49	single	\N	t	f	f	f
10609	25	\N	Hareketli Çift kollu Yoğun Bakım Pendantı	["Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/ce791833-7a7a-44f1-861d-4a8f8ca7a8b6	15	ADET	1550.00	50	single	\N	t	f	t	f
10610	25	\N	Cerrahi Pendant	["Motorlu, Çok yönlü hareket edebilen", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	3	ADET	1850.00	51	single	\N	t	f	f	f
10656	25	\N	—	[]	Ø108X1 mm.	\N	0	METRE	0.00	46	child	\N	f	f	f	f
11084	31	\N	Hastabaşı Ünitesi	["1 Kişilik Hasta Yoğun Bakım Ünitesi (150 cm.)", "Alüminyum Yatay Tip, Duvara montaj", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Ünite Boyunca Ray- Paslanmaz Çelik"]	OXY-HYB-100	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/f5780e62-9914-41b3-b36c-b57922244bd6	156	ADET	120.00	49	single	\N	t	f	f	f
11085	31	\N	Hareketli Çift kollu Yoğun Bakım Pendantı	["Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/ce791833-7a7a-44f1-861d-4a8f8ca7a8b6	15	ADET	1550.00	50	single	\N	t	f	t	f
12258	28	\N	Medikal Gaz Vana Kutusu	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/a60fdfb3-ca96-4175-99f0-b3e65b23e32a	0	ADET	0.00	6	group	\N	t	f	f	f
12259	28	\N	—	[]	1 Gaz İçin	\N	0	ADET	150.00	7	child	\N	f	f	f	f
11086	31	\N	Cerrahi Pendant	["Motorlu, Çok yönlü hareket edebilen", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	3	ADET	1850.00	51	single	\N	t	f	f	f
11087	31	\N	Genel Tip Ameliyathane Pendantı	["Motorlu, Çok yönlü hareket edebilen", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	3	ADET	1850.00	52	single	\N	t	f	f	f
11088	31	\N	Vakum Santral Merkezi -  (3 x 250 m³/h)	["3x Vakum Pompası", "1x Vakum Kontrol Paneli ile Birlikte 2*2000 Lt. 'lik Tank", "1x Bakteri Filtre Gurubu", "1x Vakum Elektrik Kontrol Paneli", "1x Vakustat", "1x Vakummetre"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4d17142e-41af-4130-a3cb-c638f41f1cf4	1	ADET	19200.00	53	single	\N	t	f	t	f
11089	31	\N	Basınçlı Hava Santral Merkezi -  (3 x 250  m³/h)	["3x  Basınçlı Hava Kompresörü", "3x  Hat Flitresi", "1x  Kimyasal Hava Kurutucu", "2x  1000 Lt. Tank", "1x  Elektrik Kontrol Paneli"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4297778e-7ab1-470e-9394-96efde66a49b	1	ADET	43500.00	54	single	\N	t	f	t	f
11090	31	\N	Oksijen Santral Merkezi - (2 x 20 Tüplük) +1*20	["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	5250.00	55	single	\N	t	f	f	t
12260	28	\N	—	[]	2 Gaz İçin	\N	0	ADET	190.00	8	child	\N	f	f	f	f
12261	28	\N	—	[]	3 Gaz İçin	\N	1	ADET	230.00	9	child	\N	t	f	f	f
12262	28	\N	—	[]	4 Gaz İçin	\N	1	ADET	270.00	10	child	\N	t	f	f	f
12263	28	\N	—	[]	5 Gaz İçin	\N	0	ADET	310.00	11	child	\N	f	f	f	f
13901	46	\N	Tibbi Mis Boruları	["İtaliya, Almaniyadan idxal olunmuş, EN 13348 standartına uyğun"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4795266d-90dc-4396-87ca-a020f6ca9255	0	ADET	0.00	0	group	\N	t	f	f	f
11323	36	\N	—	[]	لغاز واحد	\N	1	ADET	75.00	1	child	\N	t	f	f	f
11324	36	\N	—	[]	لغازين	\N	6	ADET	90.00	2	child	\N	t	f	f	f
11325	36	\N	—	[]	لـ 3 غازات	\N	23	ADET	105.00	3	child	\N	t	f	f	f
11327	36	\N	—	[]	لـ 5 غازات	\N	6	ADET	135.00	5	child	\N	t	f	f	f
11328	36	\N	—	[]	لغاز واحد	\N	1	ADET	105.00	7	child	\N	t	f	f	f
11329	36	\N	—	[]	لغازين	\N	6	ADET	155.00	8	child	\N	t	f	f	f
11330	36	\N	—	[]	لـ 3 غازات	\N	23	ADET	205.00	9	child	\N	t	f	f	f
11331	36	\N	—	[]	لـ 4 غازات	\N	1	ADET	250.00	10	child	\N	t	f	f	f
11332	36	\N	—	[]	لـ 5 غازات	\N	6	ADET	300.00	11	child	\N	t	f	f	f
11333	36	\N	—	[]	قطر 12mm	\N	326	ADET	15.00	13	child	\N	t	f	f	f
11334	36	\N	—	[]	قطر 15mm	\N	6	ADET	17.30	14	child	\N	t	f	f	f
11335	36	\N	—	[]	قطر 22mm	\N	0	ADET	26.00	15	child	\N	f	f	f	f
11336	36	\N	—	[]	قطر 28mm	\N	0	ADET	32.00	16	child	\N	f	f	f	f
11337	36	\N	—	[]	قطر 35mm	\N	0	ADET	38.00	17	child	\N	f	f	f	f
11338	36	\N	—	[]	قطر 42mm	\N	0	ADET	43.00	18	child	\N	f	f	f	f
11339	36	\N	—	[]	قطر 54mm	\N	0	ADET	56.00	19	child	\N	f	f	f	f
11341	36	\N	—	[]	لغازين، كلاسيكي	\N	51	ADET	30.00	22	child	\N	t	f	f	f
11342	36	\N	—	[]	لغازين، النوع F	\N	0	ADET	100.00	23	child	\N	f	f	f	f
11343	36	\N	—	[]	لـ 3 غازات، النوع C	\N	0	ADET	100.00	24	child	\N	f	f	f	f
11344	36	\N	—	[]	لـ 3 غازات، النوع C	\N	0	ADET	120.00	25	child	\N	f	f	f	f
11345	36	\N	—	[]	لـ 5 غازات، النوع D	\N	4	ADET	60.00	26	child	\N	t	f	f	f
11347	36	\N	—	[]	للتخدير	\N	0	ADET	150.00	28	child	\N	f	f	f	f
11348	36	\N	—	[]	للجراحة	\N	0	ADET	180.00	29	child	\N	f	f	f	f
11349	36	\N	—	[]	مخرج الأكسجين	\N	392	ADET	19.00	31	child	\N	t	f	f	f
11350	36	\N	—	[]	مخرج الشفط	\N	260	ADET	18.99	32	child	\N	t	f	f	f
11351	36	\N	—	[]	مخرج N2O	\N	6	ADET	18.99	33	child	\N	t	f	f	f
11352	36	\N	—	[]	مخرج الهواء المضغوط (MA4)	\N	209	ADET	19.00	34	child	\N	t	f	f	f
11353	36	\N	—	[]	مخرج الهواء المضغوط (SA7)	\N	21	ADET	19.00	35	child	\N	t	f	f	f
11354	36	\N	—	[]	مخرج AGSS فنتوري	\N	6	ADET	35.00	36	child	\N	t	f	f	f
11355	36	\N	—	[]	Ø12X1 mm.	\N	9470	METRE	8.20	38	child	\N	t	f	f	f
11356	36	\N	—	[]	Ø15X1 mm.	\N	1480	METRE	10.42	39	child	\N	t	f	f	f
11357	36	\N	—	[]	Ø22X1 mm.	\N	1720	METRE	15.60	40	child	\N	t	f	f	f
11358	36	\N	—	[]	Ø28X1 mm.	\N	670	METRE	20.30	41	child	\N	t	f	f	f
11359	36	\N	—	[]	Ø35X1 mm.	\N	520	METRE	20.76	42	child	\N	t	f	f	f
11360	36	\N	—	[]	Ø42X1 mm.	\N	340	METRE	31.35	43	child	\N	t	f	f	f
11361	36	\N	—	[]	Ø54X1 mm.	\N	110	METRE	43.20	44	child	\N	t	f	f	f
11362	36	\N	—	[]	Ø76X1 mm.	\N	0	METRE	0.00	45	child	\N	f	f	f	f
11364	36	\N	—	[]	أنبوب PPRC Q 25 MM	\N	0	METRE	8.85	47	child	\N	f	f	f	f
11365	36	\N	—	[]	أنبوب PPRC Q 32 MM	\N	0	METRE	10.25	48	child	\N	f	f	f	f
11091	31	\N	Azot Prodoksit Santral Merkez  (2 x 5 Tüplük) +1*5	["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	2850.00	56	single	\N	t	f	f	f
11092	31	\N	—	[]	1 Gaz İçin	\N	1	ADET	75.00	1	child	\N	t	f	f	f
11093	31	\N	—	[]	2 Gaz İçin	\N	6	ADET	90.00	2	child	\N	t	f	f	f
11094	31	\N	—	[]	3 Gaz İçin	\N	23	ADET	105.00	3	child	\N	t	f	f	f
11095	31	\N	—	[]	4 Gaz İçin	\N	1	ADET	120.00	4	child	\N	t	f	f	f
11096	31	\N	—	[]	5 Gaz İçin	\N	6	ADET	135.00	5	child	\N	t	f	f	f
11097	31	\N	—	[]	1 Gaz İçin	\N	1	ADET	105.00	7	child	\N	t	f	f	f
11098	31	\N	—	[]	2 Gaz İçin	\N	6	ADET	155.00	8	child	\N	t	f	f	f
11099	31	\N	—	[]	3 Gaz İçin	\N	23	ADET	205.00	9	child	\N	t	f	f	f
11100	31	\N	—	[]	4 Gaz İçin	\N	1	ADET	250.00	10	child	\N	t	f	f	f
11101	31	\N	—	[]	5 Gaz İçin	\N	6	ADET	300.00	11	child	\N	t	f	f	f
11102	31	\N	—	[]	12mm Çap	\N	326	ADET	15.00	13	child	\N	t	f	f	f
11103	31	\N	—	[]	15mm Çap	\N	6	ADET	17.30	14	child	\N	t	f	f	f
11104	31	\N	—	[]	22mm Çap	\N	0	ADET	26.00	15	child	\N	f	f	f	f
11105	31	\N	—	[]	28mm Çap	\N	0	ADET	32.00	16	child	\N	f	f	f	f
11106	31	\N	—	[]	35mm Çap	\N	0	ADET	38.00	17	child	\N	f	f	f	f
11107	31	\N	—	[]	42mm Çap	\N	0	ADET	43.00	18	child	\N	f	f	f	f
11108	31	\N	—	[]	54mm Çap	\N	0	ADET	56.00	19	child	\N	f	f	f	f
11109	31	\N	—	[]	1 Gaz İçin	\N	21	ADET	15.00	21	child	\N	t	f	f	f
11110	31	\N	—	[]	2 Gaz İçin Klasik	\N	51	ADET	30.00	22	child	\N	t	f	f	f
11111	31	\N	—	[]	2 Gaz İçin TİP F	\N	0	ADET	100.00	23	child	\N	f	f	f	f
11112	31	\N	—	[]	3 Gaz İçin TİP C	\N	0	ADET	100.00	24	child	\N	f	f	f	f
11113	31	\N	—	[]	3 Gaz İçin TİP C	\N	0	ADET	120.00	25	child	\N	f	f	f	f
11114	31	\N	—	[]	5 Gaz İçin TİP D	\N	4	ADET	60.00	26	child	\N	t	f	f	f
11115	31	\N	—	[]	6 Gaz İçin TİP E	\N	4	ADET	80.00	27	child	\N	t	f	f	f
11116	31	\N	—	[]	Anestezi İçin	\N	0	ADET	150.00	28	child	\N	f	f	f	f
11117	31	\N	—	[]	Cerrahi İçin	\N	0	ADET	180.00	29	child	\N	f	f	f	f
11118	31	\N	—	[]	Oksijen Prizi	\N	392	ADET	19.00	31	child	\N	t	f	f	f
11119	31	\N	—	[]	Vakum Prizi	\N	260	ADET	18.99	32	child	\N	t	f	f	f
11120	31	\N	—	[]	N2O Prizi	\N	6	ADET	18.99	33	child	\N	t	f	f	f
11121	31	\N	—	[]	Basınçlı Hava Prizi (MA4)	\N	209	ADET	19.00	34	child	\N	t	f	f	f
11309	36	\N	لوحة إنذار الغازات الطبية	["متوافقة بالكامل مع HTM 2022، ومزودة بمؤشرات الضغط العالي والطبيعي والمنخفض", "مكتملة بمفاتيح قادرة على مراقبة ضغط خط الغاز اللحظي"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/66921ec0-369a-415e-802a-d7b28b40def6	0	ADET	0.00	0	group	\N	t	f	f	f
11326	36	\N	—	[]	لـ 4 غازات	\N	1	ADET	120.00	4	child	\N	t	f	f	f
11311	36	\N	صمامات الإغلاق للمنطقة	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/46d5478b-0f9b-4ab0-9c97-ed1a8abab053	0	ADET	0.00	12	group	\N	t	f	f	f
11340	36	\N	—	[]	لغاز واحد	\N	21	ADET	15.00	21	child	\N	t	f	f	f
11346	36	\N	—	[]	لـ 6 غازات، النوع E	\N	4	ADET	80.00	27	child	\N	t	f	f	f
11122	31	\N	—	[]	Basınçlı Hava Prizi (SA7)	\N	21	ADET	19.00	35	child	\N	t	f	f	f
11123	31	\N	—	[]	AGSS Prizi VENTÜRİ	\N	6	ADET	35.00	36	child	\N	t	f	f	f
11124	31	\N	—	[]	Ø12X1 mm.	\N	9470	METRE	8.20	38	child	\N	t	f	f	f
11125	31	\N	—	[]	Ø15X1 mm.	\N	1480	METRE	10.42	39	child	\N	t	f	f	f
11126	31	\N	—	[]	Ø22X1 mm.	\N	1720	METRE	15.60	40	child	\N	t	f	f	f
11127	31	\N	—	[]	Ø28X1 mm.	\N	670	METRE	20.30	41	child	\N	t	f	f	f
11128	31	\N	—	[]	Ø35X1 mm.	\N	520	METRE	20.76	42	child	\N	t	f	f	f
11129	31	\N	—	[]	Ø42X1 mm.	\N	340	METRE	31.35	43	child	\N	t	f	f	f
11130	31	\N	—	[]	Ø54X1 mm.	\N	110	METRE	43.20	44	child	\N	t	f	f	f
11131	31	\N	—	[]	Ø76X1 mm.	\N	0	METRE	0.00	45	child	\N	f	f	f	f
11132	31	\N	—	[]	Ø108X1 mm.	\N	0	METRE	0.00	46	child	\N	f	f	f	f
11133	31	\N	—	[]	Q 25 MM PPRC BORU	\N	0	METRE	8.85	47	child	\N	f	f	f	f
11134	31	\N	—	[]	Q 32 MM PPRC BORU	\N	0	METRE	10.25	48	child	\N	f	f	f	f
11363	36	\N	—	[]	Ø108X1 mm.	\N	0	METRE	0.00	46	child	\N	f	f	f	f
11315	36	\N	وحدة رأس السرير	["وحدة عناية مركزة لسرير واحد (150 سم.)", "نوع أفقي من الألمنيوم، مثبت على الحائط", "فتحة مخرج شفط (مخارج الغاز تُسعّر بشكل منفصل)", "فتحة مخرج أكسجين (مخارج الغاز تُسعّر بشكل منفصل)", "فتحة مخرج MA4 (مخارج الغاز تُسعّر بشكل منفصل)", "مخرج بيانات RJ 45", "مقبس مؤرّض", "مقبس UPS", "نقطة تأريض", "سكة بطول الوحدة - ستانلس ستيل"]	OXY-HYB-100	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/f5780e62-9914-41b3-b36c-b57922244bd6	156	ADET	120.00	49	single	\N	t	f	f	f
11317	36	\N	ذراع جراحي	["مُشغّل بمحرك، حركة متعددة الاتجاهات", "فتحة مخرج شفط (مخارج الغاز تُسعّر بشكل منفصل)", "فتحة مخرج أكسجين (مخارج الغاز تُسعّر بشكل منفصل)", "فتحة مخرج MA4 (مخارج الغاز تُسعّر بشكل منفصل)", "فتحة مخرج N2O (مخارج الغاز تُسعّر بشكل منفصل)", "فتحة مخرج SA7 (مخارج الغاز تُسعّر بشكل منفصل)", "رف للشاشة", "مقبس مؤرّض", "نقطة تأريض"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	3	ADET	1850.00	51	single	\N	t	f	f	f
13904	46	\N	—	[]	Ø12X1 mm.	\N	120	METRE	14.00	1	child	\N	t	f	f	f
11320	36	\N	محطة هواء مضغوط - (3 x 250 m³/h)	["3x ضواغط هواء مضغوط", "3x فلاتر خطية", "1x مجفف هواء كيميائي", "2x خزانات 1000 Lt.", "1x لوحة تحكم كهربائية"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4297778e-7ab1-470e-9394-96efde66a49b	1	ADET	43500.00	54	single	\N	t	f	t	f
10708	26	\N	Dental Vakum Santrali	["3 × 300 m³/h Dezenfeksiyonlu Dental Vakum Santrali", "3 adet GEV veya DVP marka, İtalya menşeli vakum pompası", "2 adet 1.000 litre dikey vakum tankı", "2 adet 500 litre separatör tankı", "1 adet amalgam ayırıcı filtre", "1 adet vakum kontrol panosu", "1 adet dental otomasyon panosu"]	OXY-DVS-3160	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/0b677feb-5150-486b-b6f5-785735d7cf0c	1	SET	33000.00	0	single	\N	t	f	f	f
10709	26	\N	Basınçlı Hava Santral Merkezi -  (3 x 150  m³/h)	["3x  Basınçlı Hava Kompresörü DALGAKIRAN", "4x  Hat Flitresi", "1x  Kimyasal Hava Kurutucu 300 M3/H", "2x  1000 Lt. Tank", "1x  Elektrik Kontrol Paneli", "4  BAR REĞÜLATÖR GURUBU"]	OXY-MHS-3150	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4297778e-7ab1-470e-9394-96efde66a49b	1	ADET	28760.00	1	single	\N	t	f	f	f
11135	32	\N	Medical Gas Alarm Panel	["Fully compliant with HTM 2022, with High-Normal-Low Pressure Indicators", "Complete with switches capable of monitoring the instantaneous gas line pressure"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/66921ec0-369a-415e-802a-d7b28b40def6	0	ADET	0.00	0	group	\N	t	f	f	f
11136	32	\N	Medical Gas Valve Box	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/a60fdfb3-ca96-4175-99f0-b3e65b23e32a	0	ADET	0.00	6	group	\N	t	f	f	f
11137	32	\N	Zone Shut-Off Valves	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/46d5478b-0f9b-4ab0-9c97-ed1a8abab053	0	ADET	0.00	12	group	\N	t	f	f	f
11138	32	\N	Wall Modules	["Compliant with EN 737 and EN 793, Aluminum Profile, Electrostatic Powder Coating", "(2-gas wall module 45CM)"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/004f0e70-81bb-4493-8d38-3e38a38b7ecb	0	ADET	0.00	20	group	\N	t	f	f	f
11139	32	\N	Medical Gas Outlets	["BS Standard, All-Metal Construction"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/dfc343ac-0192-49d2-95ea-fd38fd4b014f	0	ADET	0.00	30	group	\N	t	f	f	f
11140	32	\N	Medical Copper Pipes	["Imported from Italy and Germany, compliant with EN 13348 standard"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4795266d-90dc-4396-87ca-a020f6ca9255	0	ADET	0.00	37	group	\N	t	f	f	f
11142	32	\N	Mobile Double-Arm Intensive Care Pendant	["Vacuum Outlet Recess (Gas Outlets Priced Separately)", "Oxygen Outlet Recess (Gas Outlets Priced Separately)", "MA4 Outlet Recess (Gas Outlets Priced Separately)", "N2O Outlet Recess (Gas Outlets Priced Separately)", "SA7 Outlet Recess (Gas Outlets Priced Separately)", "AGSS Outlet Recess (Gas Outlets Priced Separately)", "Monitor Shelf", "Grounded Socket", "Grounding Node"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/ce791833-7a7a-44f1-861d-4a8f8ca7a8b6	15	ADET	1550.00	50	single	\N	t	f	t	f
11143	32	\N	Surgical Pendant	["Motorized, multi-directional movement", "Vacuum Outlet Recess (Gas Outlets Priced Separately)", "Oxygen Outlet Recess (Gas Outlets Priced Separately)", "MA4 Outlet Recess (Gas Outlets Priced Separately)", "N2O Outlet Recess (Gas Outlets Priced Separately)", "SA7 Outlet Recess (Gas Outlets Priced Separately)", "Monitor Shelf", "Grounded Socket", "Grounding Node"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	3	ADET	1850.00	51	single	\N	t	f	f	f
11144	32	\N	General Operating Theatre Pendant	["Motorized, multi-directional movement", "Vacuum Outlet Recess (Gas Outlets Priced Separately)", "Oxygen Outlet Recess (Gas Outlets Priced Separately)", "MA4 Outlet Recess (Gas Outlets Priced Separately)", "N2O Outlet Recess (Gas Outlets Priced Separately)", "SA7 Outlet Recess (Gas Outlets Priced Separately)", "AGSS Outlet Recess (Gas Outlets Priced Separately)", "Monitor Shelf", "Grounded Socket", "Grounding Node"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	3	ADET	1850.00	52	single	\N	t	f	f	f
11145	32	\N	Vacuum Plant -  (3 x 250 m³/h)	["3x Vacuum Pumps", "2*2000 Lt. Tank with 1x Vacuum Control Panel", "1x Bacterial Filter Group", "1x Vacuum Electrical Control Panel", "1x Vacuum Switch", "1x Vacuum Gauge"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4d17142e-41af-4130-a3cb-c638f41f1cf4	1	ADET	19200.00	53	single	\N	t	f	t	f
11146	32	\N	Compressed Air Plant -  (3 x 250  m³/h)	["3x Compressed Air Compressors", "3x Line Filters", "1x Chemical Air Dryer", "2x 1000 Lt. Tanks", "1x Electrical Control Panel"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4297778e-7ab1-470e-9394-96efde66a49b	1	ADET	43500.00	54	single	\N	t	f	t	f
11147	32	\N	Oxygen Manifold System - (2 x 20 Cylinders) +1*20	["Fully Automatic Control and Pressure Reducing Panel", "Cylinder Holder with Safety Chain  (for 5 Cylinders)", "Automatic Changeover", "Plant Alarm", "Flexible Connection Between Cylinder and Manifold", "Flexible Connection Between Manifolds", "Combined Shut-Off Safety Valve"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	5250.00	55	single	\N	t	f	f	t
11322	36	\N	نظام مشعب أكسيد النيتروز (2 x 5 أسطوانات) +1*5	["لوحة تحكم وخفض ضغط أوتوماتيكية بالكامل", "حامل أسطوانات مزود بسلسلة أمان (لـ 5 أسطوانات)", "تحويل تلقائي", "إنذار المحطة", "وصلة مرنة بين الأسطوانة والمشعب", "وصلة مرنة بين المشعبات", "صمام أمان مركب للإغلاق"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	2850.00	56	single	\N	t	f	f	f
12264	28	\N	Medikal Bakır Boruları	["İtalya ,Almanya'dan ithal, EN 13348 standardında", "Bakır Fittings Malzemeleri Fiyatlara Dahildir."]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4795266d-90dc-4396-87ca-a020f6ca9255	0	ADET	0.00	12	group	\N	t	f	f	f
12265	28	\N	—	[]	Ø12X1 mm.	\N	315	METRE	10.20	13	child	\N	t	f	f	f
12266	28	\N	—	[]	Ø15X1 mm.	\N	1025	METRE	13.21	14	child	\N	t	f	f	f
12267	28	\N	—	[]	Ø22X1 mm.	\N	560	METRE	24.02	15	child	\N	t	f	f	f
12268	28	\N	—	[]	Ø28X1 mm.	\N	110	METRE	26.26	16	child	\N	t	f	f	f
12269	28	\N	—	[]	Ø35X1 mm.	\N	105	METRE	33.45	17	child	\N	t	f	f	f
12270	28	\N	—	[]	Ø42X1 mm.	\N	0	METRE	0.00	18	child	\N	f	f	f	f
12271	28	\N	—	[]	Ø54X1 mm.	\N	0	METRE	0.00	19	child	\N	f	f	f	f
12272	28	\N	—	[]	Ø76X1 mm.	\N	0	METRE	0.00	20	child	\N	f	f	f	f
12273	28	\N	—	[]	Ø108X1 mm.	\N	0	METRE	0.00	21	child	\N	f	f	f	f
12274	28	\N	Medikal Gaz Prizleri	["BS Standardı, Tamamıyla Metal Konstrüksiyon"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/dfc343ac-0192-49d2-95ea-fd38fd4b014f	0	ADET	0.00	22	group	\N	t	f	f	f
12275	28	\N	—	[]	Oksijen Prizi	\N	129	ADET	22.00	23	child	\N	t	f	f	f
12276	28	\N	—	[]	Vakum Prizi	\N	59	ADET	22.00	24	child	\N	t	f	f	f
12277	28	\N	—	[]	N2O Prizi	\N	6	ADET	22.00	25	child	\N	t	f	f	f
12278	28	\N	—	[]	Basınçlı Hava Prizi (MA4)	\N	23	ADET	22.00	26	child	\N	t	f	f	f
12279	28	\N	—	[]	Basınçlı Hava Prizi (SA7)	\N	0	ADET	22.00	27	child	\N	f	f	f	f
12280	28	\N	—	[]	\N	\N	0	ADET	40.00	28	child	\N	t	f	f	f
12281	28	\N	Bölüm Kesme Vanaları	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/46d5478b-0f9b-4ab0-9c97-ed1a8abab053	0	ADET	0.00	29	group	\N	t	f	f	f
12282	28	\N	—	[]	12mm Çap	\N	0	ADET	17.50	30	child	\N	f	f	f	f
12283	28	\N	—	[]	15mm Çap	\N	45	ADET	19.30	31	child	\N	t	f	f	f
12284	28	\N	—	[]	22mm Çap	\N	20	ADET	26.00	32	child	\N	t	f	f	f
12285	28	\N	—	[]	28mm Çap	\N	7	ADET	32.00	33	child	\N	t	f	f	f
12286	28	\N	—	[]	35mm Çap	\N	3	ADET	38.00	34	child	\N	t	f	f	f
12287	28	\N	—	[]	42mm Çap	\N	0	ADET	43.00	35	child	\N	f	f	f	f
12288	28	\N	—	[]	54mm Çap	\N	0	ADET	56.00	36	child	\N	f	f	f	f
12289	28	\N	Otomatik Oksijen Santral Merkezi - 2 x 8 = 16 Nokta	["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	4500.00	37	single	\N	t	f	f	f
12290	28	\N	Manuel Oksijen Santral Merkezi - 2 x 4= 8 Nokta	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	4000.00	38	single	\N	t	f	f	f
12291	28	\N	Manuel Azot Prodoksit Santral Merkezi  2 x 2 = 4 Nokta	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	0	ADET	2800.00	39	single	\N	t	f	f	f
12292	28	\N	Manuel Hava Santral Merkezi  4 x 2 = 8 Nokta	["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	0	ADET	2800.00	40	single	\N	t	f	f	f
12293	28	\N	Kavanozlu Vakum Regülatörü	["Vakum Kızağı (Vacuum Slide) Dahil Set Fiyatıdır."]	\N	\N	40	SET	45.00	41	single	\N	t	f	f	f
12294	28	\N	Basınç göstergesi (Manometre)	["Basınç aralığı: 0–30 kg. Gösterge tipi: Analog. Gövde malzemesi: Yumuşak çelik (mild steel)."]	\N	\N	16	ADET	50.00	42	single	\N	t	f	f	f
13903	46	\N	Oksigen Mərkəzi Stansiyası - (1 x 1 Balonlu) +1*1	["1 ədəd pnevmatik kollektor dəyişdiricisi / keçid qurğusu", "150 m³/h tutumlu, drenaj klapanlı tənzimləyici", "2 ədəd tənzimləyici giriş filtri", "2 ədəd yüksək təzyiq manometri", "4 ədəd aşağı təzyiq manometri", "3 ədəd ikinci pilləli təzyiq tənzimləyicisi, drenaj klapanlı", "3 ədəd təzyiq sensoru", "Yüksək təzyiq düşməsi qaz siqnalizatoru", "+2 ədəd oksigen balonu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	4500.00	18	single	\N	t	f	f	f
13933	47	\N	Dental Vakum Santrali	["4*530 m3/h Dental Vakum Santrali", "220 mmHg basınçta 23000 lt/d Hava Kapasitesi", "300lt Separatör Tank", "Amalgam ayırıcı filtre", "Drenaj pompası", "PLC Kontrolü Otomasyon Panosu"]	OXY-DVS	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/3d17b70d-8e44-4183-9c6b-a8027ef68e99	1	SET	32500.00	0	single	\N	t	f	f	f
13934	47	\N	AtlasCopco LF Serisi Yağsız Kompresör Seti	["2 adet Yağsız Pistonlu Hava Kompresörü", "930 lt/d Hava Kapasitesi", "7.5 kw Elektrik Gücü", "10 bar Çalışma Basıncı", "500lt Hava Tankı", "Gaz Soğutmalı Kurutucu", "Aktif Karbon Filtre", "Kullanım basıncı Regülatör Grubu"]	LF-Serisi	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/d69186e5-a4bb-4442-bdde-152b4626f8b6	1	SET	15000.00	1	single	\N	t	f	f	f
12295	37	\N	Medical Gas Alarm Panel	["Fully compliant with HTM 2022, with High-Normal-Low Pressure Indicator", "Complete with switches capable of monitoring the gas's instantaneous line pressure"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/66921ec0-369a-415e-802a-d7b28b40def6	0	ADET	0.00	0	group	\N	t	f	f	f
12306	37	\N	—	[]	For 1 Gas	\N	0	ADET	120.00	1	child	\N	f	f	f	f
12307	37	\N	—	[]	For 2 Gases	\N	1	ADET	140.00	2	child	\N	t	f	f	f
12308	37	\N	—	[]	For 3 Gases	\N	1	ADET	160.00	3	child	\N	t	f	f	f
12309	37	\N	—	[]	For 4 Gases	\N	1	ADET	180.00	4	child	\N	t	f	f	f
12310	37	\N	—	[]	For 5 Gases	\N	0	ADET	200.00	5	child	\N	f	f	f	f
12296	37	\N	Medical Gas Valve Box	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/a60fdfb3-ca96-4175-99f0-b3e65b23e32a	0	ADET	0.00	6	group	\N	t	f	f	f
12311	37	\N	—	[]	For 1 Gas	\N	0	ADET	150.00	7	child	\N	f	f	f	f
12312	37	\N	—	[]	For 2 Gases	\N	0	ADET	190.00	8	child	\N	f	f	f	f
12313	37	\N	—	[]	For 3 Gases	\N	1	ADET	230.00	9	child	\N	t	f	f	f
12314	37	\N	—	[]	For 4 Gases	\N	1	ADET	270.00	10	child	\N	t	f	f	f
12315	37	\N	—	[]	For 5 Gases	\N	0	ADET	310.00	11	child	\N	f	f	f	f
12297	37	\N	Medical Copper Pipes	["Imported from Italy and Germany, compliant with EN 13348 standard", "Copper fitting materials are included in the prices."]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4795266d-90dc-4396-87ca-a020f6ca9255	0	ADET	0.00	12	group	\N	t	f	f	f
12316	37	\N	—	[]	Ø12X1 mm.	\N	315	METRE	10.20	13	child	\N	t	f	f	f
12317	37	\N	—	[]	Ø15X1 mm.	\N	1025	METRE	13.21	14	child	\N	t	f	f	f
12318	37	\N	—	[]	Ø22X1 mm.	\N	560	METRE	24.02	15	child	\N	t	f	f	f
12319	37	\N	—	[]	Ø28X1 mm.	\N	110	METRE	26.26	16	child	\N	t	f	f	f
12320	37	\N	—	[]	Ø35X1 mm.	\N	105	METRE	33.45	17	child	\N	t	f	f	f
12321	37	\N	—	[]	Ø42X1 mm.	\N	0	METRE	0.00	18	child	\N	f	f	f	f
12322	37	\N	—	[]	Ø54X1 mm.	\N	0	METRE	0.00	19	child	\N	f	f	f	f
12323	37	\N	—	[]	Ø76X1 mm.	\N	0	METRE	0.00	20	child	\N	f	f	f	f
12324	37	\N	—	[]	Ø108X1 mm.	\N	0	METRE	0.00	21	child	\N	f	f	f	f
12298	37	\N	Medical Gas Outlets	["BS Standard, Fully Metal Construction"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/dfc343ac-0192-49d2-95ea-fd38fd4b014f	0	ADET	0.00	22	group	\N	t	f	f	f
12325	37	\N	—	[]	Oxygen Outlet	\N	129	ADET	22.00	23	child	\N	t	f	f	f
12326	37	\N	—	[]	Vacuum Outlet	\N	59	ADET	22.00	24	child	\N	t	f	f	f
12327	37	\N	—	[]	N2O Outlet	\N	6	ADET	22.00	25	child	\N	t	f	f	f
12328	37	\N	—	[]	Compressed Air Outlet (MA4)	\N	23	ADET	22.00	26	child	\N	t	f	f	f
12329	37	\N	—	[]	Compressed Air Outlet (SA7)	\N	0	ADET	22.00	27	child	\N	f	f	f	f
12330	37	\N	—	[]	\N	\N	0	ADET	40.00	28	child	\N	t	f	f	f
12299	37	\N	Zone Shut-Off Valves	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/46d5478b-0f9b-4ab0-9c97-ed1a8abab053	0	ADET	0.00	29	group	\N	t	f	f	f
12331	37	\N	—	[]	12mm Diameter	\N	0	ADET	17.50	30	child	\N	f	f	f	f
12332	37	\N	—	[]	15mm Diameter	\N	45	ADET	19.30	31	child	\N	t	f	f	f
12333	37	\N	—	[]	22mm Diameter	\N	20	ADET	26.00	32	child	\N	t	f	f	f
12334	37	\N	—	[]	28mm Diameter	\N	7	ADET	32.00	33	child	\N	t	f	f	f
12335	37	\N	—	[]	35mm Diameter	\N	3	ADET	38.00	34	child	\N	t	f	f	f
12336	37	\N	—	[]	42mm Diameter	\N	0	ADET	43.00	35	child	\N	f	f	f	f
12337	37	\N	—	[]	54mm Diameter	\N	0	ADET	56.00	36	child	\N	f	f	f	f
12300	37	\N	Automatic Oxygen Manifold System - 2 x 8 = 16 Points	["Fully Automatic Control and Pressure Reducing Panel", "Safety Chain Cylinder Holder (for 5 Cylinders)", "Automatic Changeover", "Manifold Alarm", "Flexible Connection Between Cylinder and Manifold", "Flexible Connection Between Manifolds", "Combined Shut-Off Safety Valve"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	4500.00	37	single	\N	t	f	f	f
12301	37	\N	Manual Oxygen Manifold System - 2 x 4= 8 Points	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	4000.00	38	single	\N	t	f	f	f
12302	37	\N	Manual Nitrous Oxide Manifold System  2 x 2 = 4 Points	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	0	ADET	2800.00	39	single	\N	t	f	f	f
12303	37	\N	Manual Air Manifold System  4 x 2 = 8 Points	["Fully Automatic Control and Pressure Reducing Panel", "Safety Chain Cylinder Holder (for 5 Cylinders)", "Automatic Changeover", "Manifold Alarm", "Flexible Connection Between Cylinder and Manifold", "Flexible Connection Between Manifolds", "Combined Shut-Off Safety Valve"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	0	ADET	2800.00	40	single	\N	t	f	f	f
12304	37	\N	Vacuum Regulator with Jar	["Set price includes Vacuum Slide."]	\N	\N	40	SET	45.00	41	single	\N	t	f	f	f
12305	37	\N	Pressure Gauge (Manometer)	["Pressure range: 0–30 kg. Indicator type: Analog. Body material: Mild steel."]	\N	\N	16	ADET	50.00	42	single	\N	t	f	f	f
12920	41	\N	Vakum Santral Merkezi -  (4 x 300 m³/h)	["4 Adet  Vakum Pompası", "1 Adet  Vakum Kontrol Paneli ile Birlikte 300 Lt. 'lik Tank", "5 Adet  Bakteri Filtre Gurubu", "1 Adet  Vakum Elektrik Kontrol Paneli", "1 Adet  Vakustat", "1 Adet  Vakummetre"]	OXY-DVS	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/c94d2111-08d7-4fff-813a-b868f2ec4136	3	SET	28000.00	0	single	\N	t	f	f	f
12921	41	\N	AtlasCopco LF Serisi	["9 Adet %100 Yağsız(Oil Free), Pistonlu, Hava Soğutmalı, Sabit Devirli, Max. 10bar Basınç Üretimi, 86dB Ses Seviyesi, Direkt Akuple Tahrikli, IE3 Verimlilik ve IP55 Koruma Sınıflı 7,5kW Elektrik Motorlu", "3 Adet  Hat Flitresi", "3 Adet  Gaz Soğutmalı Hava kurutucu", "1 Adet  2500 Lt. Tank", "1 Adet  Elektrik kontrol paneli"]	LF	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/bbde7d79-2e27-47de-9def-169753bde2df	2	SET	51500.00	1	single	\N	t	f	t	f
14070	48	\N	Hastabaşı Ünitesi (180cm)	["1 Kişilik Hasta Yatakbaşı Ünitesi (180 cm.)", "Alüminyum Yatay Tip, Duvara montaj", "1x RJ 45 Data Prizi", "1x Topraklı Priz", "2x UPS Prizi", "1x Topraklama Nodu", "1x Komütatör Anahtar", "1x Üst Aydinladma Lambası", "1x Alt Okuma Lambası"]	OXY-HYB-100	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/144ec908-1203-4605-9036-ddc0963750c9	1	ADET	110.00	0	single	\N	t	f	f	f
12864	39	\N	Medikal Gaz Alarm Paneli	["HTM 2022 ye birebir uygun, Yüksek-Normal-Düşük Basınç Göstergeli", "Gazın anlık geçiş basıncını izleyebilen - Switchleri ile Komple"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/66921ec0-369a-415e-802a-d7b28b40def6	0	ADET	0.00	0	group	\N	t	f	f	f
12865	39	\N	—	[]	1 Gaz İçin	\N	0	ADET	120.00	1	child	\N	f	f	f	f
12866	39	\N	—	[]	2 Gaz İçin	\N	0	ADET	140.00	2	child	\N	f	f	f	f
12867	39	\N	—	[]	3 Gaz İçin	\N	2	ADET	160.00	3	child	\N	t	f	f	f
12868	39	\N	—	[]	4 Gaz İçin	\N	1	ADET	180.00	4	child	\N	t	f	f	f
12869	39	\N	—	[]	5 Gaz İçin	\N	1	ADET	200.00	5	child	\N	t	f	f	f
12870	39	\N	—	[]	\N	\N	1	ADET	0.00	6	child	\N	t	f	f	f
12871	39	\N	Medikal Gaz Vana Kutusu	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/a60fdfb3-ca96-4175-99f0-b3e65b23e32a	0	ADET	0.00	7	group	\N	t	f	f	f
12872	39	\N	—	[]	1 Gaz İçin	\N	0	ADET	150.00	8	child	\N	f	f	f	f
12873	39	\N	—	[]	2 Gaz İçin	\N	0	ADET	190.00	9	child	\N	f	f	f	f
12874	39	\N	—	[]	3 Gaz İçin	\N	2	ADET	230.00	10	child	\N	t	f	f	f
12875	39	\N	—	[]	4 Gaz İçin	\N	1	ADET	270.00	11	child	\N	t	f	f	f
12876	39	\N	—	[]	5 Gaz İçin	\N	1	ADET	310.00	12	child	\N	t	f	f	f
12877	39	\N	Medikal Bakır Boruları	["İtalya ,Almanya'dan ithal, EN 13348 standardında"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4795266d-90dc-4396-87ca-a020f6ca9255	0	ADET	0.00	13	group	\N	t	t	f	f
12878	39	\N	—	[]	Ø12X1 mm.	\N	50	METRE	14.20	14	child	\N	t	f	f	f
12879	39	\N	—	[]	Ø15X1 mm.	\N	70	METRE	17.21	15	child	\N	t	f	f	f
12880	39	\N	—	[]	Ø22X1 mm.	\N	90	METRE	24.02	16	child	\N	t	f	f	f
12881	39	\N	—	[]	Ø28X1 mm.	\N	80	METRE	30.26	17	child	\N	t	f	f	f
12882	39	\N	—	[]	Ø35X1 mm.	\N	70	METRE	37.47	18	child	\N	t	f	f	f
12883	39	\N	—	[]	Ø42X1 mm.	\N	50	METRE	0.00	19	child	\N	t	f	f	f
12884	39	\N	—	[]	Ø54X1 mm.	\N	0	METRE	0.00	20	child	\N	f	f	f	f
12885	39	\N	—	[]	Ø76X1 mm.	\N	0	METRE	0.00	21	child	\N	f	f	f	f
12886	39	\N	—	[]	Ø108X1 mm.	\N	0	METRE	0.00	22	child	\N	f	f	f	f
12887	39	\N	—	[]	\N	\N	1	ADET	0.00	23	child	\N	t	f	f	f
12888	39	\N	PPRC POLİPROPİLEN BORULAR	[]	\N	\N	0	ADET	0.00	24	group	\N	t	f	f	f
12889	39	\N	—	[]	Q 1/2   20/3,2 MM POLİPROPİLEN TEMİZ SU BORUSU	\N	50	METRE	7.50	25	child	\N	t	f	f	f
12890	39	\N	—	[]	Q 3/4  25/4,2 MM POLİPROPİLEN TEMİZ SU BORUSU	\N	60	METRE	9.00	26	child	\N	t	f	f	f
12891	39	\N	—	[]	Q 1"  32/5,4 MM POLİPROPİLEN TEMİZ SU BORUSU	\N	90	METRE	11.50	27	child	\N	t	f	f	f
12892	39	\N	—	[]	Q 1"1/4  40/6,7 MM POLİPROPİLEN TEMİZ SU BORUSU	\N	80	MT	12.75	28	child	\N	t	f	f	f
12893	39	\N	—	[]	Q 1"1/2  50/8,4 MM POLİPROPİLEN TEMİZ SU BORUSU	\N	70	METRE	14.20	29	child	\N	t	f	f	f
12894	39	\N	—	[]	Q 2"  63/10,5 MM POLİPROPİLEN TEMİZ SU BORUSU	\N	60	METRE	15.50	30	child	\N	t	f	f	f
12895	39	\N	Medikal Gaz Prizleri	["BS Standardı, Tamamıyla Metal Konstrüksiyon"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/dfc343ac-0192-49d2-95ea-fd38fd4b014f	0	ADET	0.00	31	group	\N	t	f	f	t
12896	39	\N	—	[]	Oksijen Prizi	\N	0	ADET	22.00	32	child	\N	f	f	f	f
12897	39	\N	—	[]	Vakum Prizi	\N	30	ADET	22.00	33	child	\N	t	f	f	f
12898	39	\N	—	[]	N2O Prizi	\N	0	ADET	22.00	34	child	\N	f	f	f	f
12899	39	\N	—	[]	Basınçlı Hava Prizi (MA4)	\N	30	ADET	22.00	35	child	\N	t	f	f	f
12900	39	\N	—	[]	Basınçlı Hava Prizi (SA7)	\N	0	ADET	22.00	36	child	\N	f	f	f	f
12901	39	\N	—	[]	AGSS Prizi VENTÜRİ	\N	0	ADET	45.00	37	child	\N	f	f	f	f
12902	39	\N	Demontaj Vakum Santral Merkezi -  (3 x 60 m³/h)	["3x Vakum Pompası", "1x Vakum Kontrol Paneli ile Birlikte 500 Lt. 'lik Tank", "1x Bakteri Filtre Gurubu", "1x Vakum Elektrik Kontrol Paneli", "1x Vakustat", "1x Vakummetre"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4d17142e-41af-4130-a3cb-c638f41f1cf4	1	SET	500.00	38	single	\N	t	f	f	f
12903	39	\N	Dental Vakum Santrali	["3 ADET  İTALYAN MENŞEİ VAKUM POMPASI", "1 ADET 2000 LT VAKUM REZERV TANKI", "1 ADET 2000 LT VAKUM DENGELEME TANKI", "2 ADET DALDIRMA GALVANİZ  SEPARATÖR TANKI VE AKTÜATÖR VANALARI İLE BİRLİKTE", "1 ADET 100 LT DEZENFEKTAN TANKI", "1 ADET PLC KONTROLLÜ EŞ YAŞLANDIRMA PANOSU", "1 ADET PLC KONTROLLÜ SEPARATÖR TANK OTOMASYON PANOSU", "1 ADET AMALGAM AYIRICI SEPARATÖR FİLİTRE ABD MENŞE İLİ"]	OXY-DVS-Y-3300	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/0b677feb-5150-486b-b6f5-785735d7cf0c	1	SET	35000.00	39	single	\N	t	f	t	f
12904	39	\N	Basınçlı Hava Santral Merkezi -  (3 x 150  m³/h)	["3x  Basınçlı Hava Kompresörü", "3x  Hat Flitresi", "1x  Kimyasal Hava Kurutucu", "2x  2000 Lt. Tank", "4-7 BAR YEDEKLİ REĞÜLATÖR GURUBU", "1x  Elektrik EŞ YAŞLANDIRMA Kontrol Paneli"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4297778e-7ab1-470e-9394-96efde66a49b	1	ADET	30000.00	40	single	\N	t	f	f	f
12905	39	\N	Demontaj Basınçlı Hava Santral Merkezi -  (3 x 60  m³/h)	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4297778e-7ab1-470e-9394-96efde66a49b	1	SET	1000.00	41	single	\N	t	f	f	f
12926	42	\N	Dental Vakum Santralleri Dezenfektan ve Ortam Koku Giderme	["Miktar\\t1 Adet", "Ozon Sistemi Kapasitesi\\t25 gr/h", "Hava İhtiyacı\\t5 lt/dk", "Basınç \\t0.5-1.00 bar", "Ana Motor Gücü\\t200 w", "Ark Sistemi ve Ateşleme Ünitesi\\t1 Adet", "Trafo Sistemi\\t50 hz – 220 V", "Trafo Adedi\\t1 adet Yüksek Voltaj Trafosu", "Soğutma Sistemi\\thava", "Soğutma Kabin Hacmi\\t55x80x55", "Soğutma Pompası Motor Gücü", "Oksijen Konsantratör Tipi\\tKule tipi", "Gövde Yapısı\\tStatik toz boya", "Filtrasyon Hassasiyeti\\t20 micron"]	OXY-OZON	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/882044ea-a883-4887-b344-b09647a644cb	1	SET	10380.00	0	single	\N	t	f	f	f
12906	40	\N	Duvar Modülleri	["EN 737 ve EN 793'e Uygun, Alüminyum Profil, Elektrostatik Toz Boya"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/004f0e70-81bb-4493-8d38-3e38a38b7ecb	0	ADET	0.00	0	group	\N	t	f	f	f
12907	40	\N	—	[]	1 Gaz İçin	\N	0	ADET	35.00	1	child	\N	t	f	f	f
12908	40	\N	—	[]	2 Gaz İçin Klasik	\N	0	ADET	35.00	2	child	\N	f	f	f	f
12909	40	\N	—	[]	2 Gaz İçin TİP F	\N	0	ADET	100.00	3	child	\N	f	f	f	f
12910	40	\N	—	[]	3 Gaz İçin TİP C	\N	0	ADET	100.00	4	child	\N	f	f	f	f
12911	40	\N	—	[]	3 Gaz İçin TİP C	\N	0	ADET	120.00	5	child	\N	f	f	f	f
12912	40	\N	—	[]	5 Gaz İçin TİP D	\N	0	ADET	60.00	6	child	\N	f	f	f	f
12913	40	\N	—	[]	6 Gaz İçin TİP E	\N	0	ADET	80.00	7	child	\N	f	f	f	f
12914	40	\N	—	[]	Anestezi İçin	\N	0	ADET	150.00	8	child	\N	f	f	f	f
12915	40	\N	—	[]	Cerrahi İçin	\N	0	ADET	180.00	9	child	\N	f	f	f	f
12927	43	\N	Hastabaşı Ünitesi	["1 Adet Komütatör Anahtar", "2 Adet Topraklı Elektrik Prizi – UPS", "2 Adet Topraklı Elektrik Prizi – Şebeke", "1 Adet 1x18 W LED Üst Aydınlatma", "1 Adet 1x9 W LED Alt / Okuma Aydınlatması", "1 Adet RJ45 Data Prizi – CAT6", "Hemşire Çağrı Sistemi için gerekli provizyon mevcuttur."]	OXY-HYB-100	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/f5780e62-9914-41b3-b36c-b57922244bd6	1	ADET	15500.00	0	single	\N	t	f	f	f
13882	45	\N	Medikal Bakır Boruları	["İtalya ,Almanya'dan ithal, EN 13348 standardında"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4795266d-90dc-4396-87ca-a020f6ca9255	0	ADET	0.00	0	group	\N	t	f	f	f
13883	45	\N	—	[]	Ø12X1 mm.	\N	120	METRE	14.00	1	child	\N	t	f	f	f
13884	45	\N	—	[]	Ø15X1 mm.	\N	0	METRE	17.21	2	child	\N	f	f	f	f
13885	45	\N	—	[]	Ø22X1 mm.	\N	0	METRE	24.02	3	child	\N	f	f	f	f
13886	45	\N	—	[]	Ø28X1 mm.	\N	0	METRE	30.26	4	child	\N	f	f	f	f
13887	45	\N	—	[]	Ø35X1 mm.	\N	0	METRE	37.47	5	child	\N	f	f	f	f
13888	45	\N	—	[]	Ø42X1 mm.	\N	0	METRE	0.00	6	child	\N	f	f	f	f
13889	45	\N	—	[]	Ø54X1 mm.	\N	0	METRE	0.00	7	child	\N	f	f	f	f
13890	45	\N	—	[]	Ø76X1 mm.	\N	0	METRE	0.00	8	child	\N	f	f	f	f
13891	45	\N	—	[]	Ø108X1 mm.	\N	0	METRE	0.00	9	child	\N	f	f	f	f
13892	45	\N	Bölüm Kesme Vanaları	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/46d5478b-0f9b-4ab0-9c97-ed1a8abab053	0	ADET	0.00	10	group	\N	t	f	f	f
13893	45	\N	—	[]	12mm Çap	\N	9	ADET	17.50	11	child	\N	t	f	f	f
13894	45	\N	—	[]	15mm Çap	\N	0	ADET	19.30	12	child	\N	f	f	f	f
13895	45	\N	—	[]	22mm Çap	\N	0	ADET	26.00	13	child	\N	f	f	f	f
13896	45	\N	—	[]	28mm Çap	\N	0	ADET	32.00	14	child	\N	f	f	f	f
14071	48	\N	Hasta Yoğun Bakım Ünitesi	["1 Kişilik Yoğun Bakım Ünitesi 180 cm.", "Alüminyum Yatay Tip, Duvara montaj", "1x RJ 45 Data Prizi", "8x Topraklı Priz", "8x UPS Prizi", "4x Topraklama Nodu", "Ünite Boyunca Cihaz Askı Rayı"]	OXY-YBU-200	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fc0d410d-b197-47a1-902b-a3b34427731d	1	ADET	135.00	1	single	\N	t	f	f	f
14072	48	\N	Kolon Tipi Yoğun Bakım Ünitesi	["Alüminyum Yan Gövdeler, Kompozit ön ve arka yüzey,", "Tavan, Taban arası montaj", "1x RJ 45 Data Prizi", "8x Topraklı Priz", "8x UPS Prizi", "4x Topraklama Nodu", "Askı Rayı - Paslanmaz Çelik"]	OXY-KTYB-100	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/e5d91809-d68a-42d7-9b24-4dd5e4f32202	1	ADET	500.00	2	single	\N	t	f	t	f
14073	48	\N	Duvar Modülleri	["EN 737 ve EN 793'e Uygun, Alüminyum Profil, Elektrostatik Toz Boya"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/004f0e70-81bb-4493-8d38-3e38a38b7ecb	0	ADET	0.00	3	group	\N	t	f	f	f
14074	48	\N	—	[]	1 Gaz İçin	\N	1	ADET	10.00	4	child	\N	t	f	f	f
14075	48	\N	—	[]	2 Gaz İçin	\N	1	ADET	20.00	5	child	\N	t	f	f	f
14076	48	\N	—	[]	3 Gaz İçin	\N	1	ADET	30.00	6	child	\N	t	f	f	f
14077	48	\N	—	[]	4 Gaz İçin	\N	1	ADET	40.00	7	child	\N	t	f	f	f
14078	48	\N	—	[]	5 Gaz İçin	\N	1	ADET	50.00	8	child	\N	t	f	f	f
14079	48	\N	—	[]	5 Gaz İçin TİP D	\N	0	ADET	60.00	9	child	\N	f	f	f	f
14080	48	\N	—	[]	6 Gaz İçin TİP E	\N	0	ADET	80.00	10	child	\N	f	f	f	f
14081	48	\N	—	[]	Anestezi İçin	\N	0	ADET	150.00	11	child	\N	f	f	f	f
14082	48	\N	—	[]	Cerrahi İçin	\N	0	ADET	180.00	12	child	\N	f	f	f	f
14083	20	\N	Dental Vakum Santrali	["3 × 160 m³/h Dezenfeksiyonlu Dental Vakum Santrali", "3 adet GEV veya DVP marka, İtalya menşeli vakum pompası", "1 adet 700 litre yatay vakum tankı", "1 adet 1.000 litre dikey vakum tankı", "2 adet 500 litre separatör tankı", "1 adet amalgam ayırıcı filtre", "1 adet vakum kontrol panosu", "1 adet dental otomasyon panosu", "1 adet 300 m3/h bakteri filitresi", "1 adet 2\\"güvenlik kavanozu", "1 adet 300 m3/h Su Separatör Filitre"]	OXY-DVS-3160	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/0b677feb-5150-486b-b6f5-785735d7cf0c	1	SET	31500.00	0	single	\N	t	f	f	f
14085	49	\N	Dental Vakum Santrali	["3 × 160 m³/h Dezenfeksiyonlu Dental Vakum Santrali", "3 adet GEV veya DVP marka, İtalya menşeli vakum pompası", "1 adet 700 litre yatay vakum tankı", "1 adet 1.000 litre dikey vakum tankı", "2 adet 500 litre separatör tankı", "1 adet amalgam ayırıcı filtre", "1 adet vakum kontrol panosu", "1 adet dental otomasyon panosu", "1 adet 300 m3/h bakteri filitresi", "1 adet 2\\"güvenlik kavanozu", "1 adet 300 m3/h Su Separatör Filitre"]	OXY-DVS-3160	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/0b677feb-5150-486b-b6f5-785735d7cf0c	1	SET	31500.00	0	single	\N	t	f	f	f
13746	44	\N	Medikal Gaz Alarm Paneli	["HTM 2022 ye birebir uygun, Yüksek-Normal-Düşük Basınç Göstergeli", "Gazın anlık geçiş basıncını izleyebilen - Switchleri ile Komple"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/66921ec0-369a-415e-802a-d7b28b40def6	0	ADET	0.00	0	group	\N	t	f	f	f
13747	44	\N	—	[]	1 Gaz İçin	\N	2	ADET	100.00	1	child	\N	t	f	f	f
13748	44	\N	—	[]	2 Gaz İçin	\N	0	ADET	120.00	2	child	\N	f	f	f	f
13749	44	\N	—	[]	3 Gaz İçin	\N	17	ADET	140.00	3	child	\N	t	f	f	f
13750	44	\N	—	[]	4 Gaz İçin	\N	0	ADET	160.00	4	child	\N	f	f	f	f
13751	44	\N	—	[]	5 Gaz İçin	\N	10	ADET	180.00	5	child	\N	t	f	f	f
13752	44	\N	Medikal Gaz Vana Kutusu	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/a60fdfb3-ca96-4175-99f0-b3e65b23e32a	0	ADET	0.00	6	group	\N	t	f	f	f
13753	44	\N	—	[]	1 Gaz İçin	\N	2	ADET	150.00	7	child	\N	t	f	f	f
13754	44	\N	—	[]	2 Gaz İçin	\N	0	ADET	190.00	8	child	\N	f	f	f	f
13755	44	\N	—	[]	3 Gaz İçin	\N	17	ADET	230.00	9	child	\N	t	f	f	f
13756	44	\N	—	[]	4 Gaz İçin	\N	0	ADET	270.00	10	child	\N	f	f	f	f
13757	44	\N	—	[]	5 Gaz İçin	\N	10	ADET	310.00	11	child	\N	t	f	f	f
13758	44	\N	—	[]	\N	\N	1	ADET	0.00	12	child	\N	t	f	f	f
13759	44	\N	Medikal Gaz Prizleri	["BS Standardı, Tamamıyla Metal Konstrüksiyon"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/dfc343ac-0192-49d2-95ea-fd38fd4b014f	0	ADET	0.00	13	group	\N	t	f	f	f
13760	44	\N	—	[]	Oksijen Prizi	\N	445	ADET	20.00	14	child	\N	t	f	f	f
13761	44	\N	—	[]	Vakum Prizi	\N	440	ADET	20.00	15	child	\N	t	f	f	f
13762	44	\N	—	[]	N2O Prizi	\N	10	ADET	20.00	16	child	\N	t	f	f	f
13763	44	\N	—	[]	Basınçlı Hava Prizi (MA4)	\N	377	ADET	20.00	17	child	\N	t	f	f	f
13764	44	\N	—	[]	Basınçlı Hava Prizi (SA7)	\N	29	ADET	20.00	18	child	\N	t	f	f	f
13765	44	\N	—	[]	AGSS Prizi VENTÜRİ	\N	10	ADET	40.00	19	child	\N	t	f	f	f
13766	44	\N	Medikal Bakır Boruları	["İtalya ,Almanya'dan ithal, EN 13348 standardında"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4795266d-90dc-4396-87ca-a020f6ca9255	0	ADET	0.00	20	group	\N	t	f	f	f
13767	44	\N	—	[]	Ø12X1 mm.	\N	8330	METRE	13.90	21	child	\N	t	f	f	f
13768	44	\N	—	[]	Ø15X1 mm.	\N	5470	METRE	16.83	22	child	\N	t	f	f	f
13769	44	\N	—	[]	Ø22X1 mm.	\N	2045	METRE	23.62	23	child	\N	t	f	f	f
13770	44	\N	—	[]	Ø28X1 mm.	\N	220	METRE	29.81	24	child	\N	t	f	f	f
13771	44	\N	—	[]	Ø35X1,2 mm.	\N	650	METRE	44.79	25	child	\N	t	f	f	f
13772	44	\N	—	[]	Ø42X1,2 mm.	\N	285	METRE	53.83	26	child	\N	t	f	f	f
13773	44	\N	—	[]	Ø54X1,2 mm.	\N	85	METRE	71.10	27	child	\N	t	f	f	f
13774	44	\N	—	[]	Ø76X1,5 mm.	\N	210	METRE	123.12	28	child	\N	t	f	f	f
13775	44	\N	—	[]	Ø108X1 mm.	\N	0	METRE	0.00	29	child	\N	f	f	f	f
13776	44	\N	Duvar Modülleri	["EN 737 ve EN 793'e Uygun, Alüminyum Profil, Elektrostatik Toz Boya"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/004f0e70-81bb-4493-8d38-3e38a38b7ecb	0	ADET	0.00	30	group	\N	t	f	f	f
13777	44	\N	—	[]	1 Gaz İçin	\N	23	ADET	25.00	31	child	\N	t	f	f	f
13778	44	\N	—	[]	2 Gaz İçin Klasik	\N	63	ADET	35.00	32	child	\N	t	f	f	f
13779	44	\N	—	[]	2 Gaz İçin TİP F	\N	0	ADET	100.00	33	child	\N	f	f	f	f
13780	44	\N	—	[]	3 Gaz İçin Kasik	\N	60	ADET	45.00	34	child	\N	t	f	f	f
13781	44	\N	—	[]	3 Gaz İçin TİP C	\N	0	ADET	120.00	35	child	\N	f	f	f	f
13782	44	\N	—	[]	5 Gaz İçin TİP D	\N	0	ADET	60.00	36	child	\N	f	f	f	f
13783	44	\N	—	[]	6 Gaz İçin TİP E	\N	0	ADET	80.00	37	child	\N	f	f	f	f
13784	44	\N	—	[]	Anestezi İçin	\N	5	ADET	150.00	38	child	\N	t	f	f	f
13785	44	\N	—	[]	Cerrahi İçin	\N	5	ADET	180.00	39	child	\N	t	f	f	f
13786	44	\N	Hastabaşı Ünitesi	["1 Kişilik Hasta Yoğun Bakım Ünitesi (180 cm.)", "Alüminyum Yatay Tip, Duvara montaj", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Ünite Boyunca Ray- Paslanmaz Çelik"]	OXY-HYB-100	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/f5780e62-9914-41b3-b36c-b57922244bd6	245	ADET	180.00	40	single	\N	t	f	f	f
13787	44	\N	Köprü Tipi Yoğun Bakım Ünitesi	["Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/19b92874-7977-492d-8243-c4bdf7040dce	6	ADET	3000.00	41	single	\N	t	f	f	f
13788	44	\N	Cerrahi Pendant	["Motorlu, Çok yönlü hareket edebilen", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	5	ADET	2500.00	42	single	\N	t	f	f	f
13897	45	\N	—	[]	35mm Çap	\N	0	ADET	38.00	15	child	\N	f	f	f	f
13898	45	\N	—	[]	42mm Çap	\N	0	ADET	43.00	16	child	\N	f	f	f	f
13899	45	\N	—	[]	54mm Çap	\N	0	ADET	56.00	17	child	\N	f	f	f	f
13789	44	\N	Genel Tip Ameliyathane Pendantı	["Motorlu, Çok yönlü hareket edebilen", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	5	ADET	2500.00	43	single	\N	t	f	f	f
13790	44	\N	Hareketli TEK kollu Yoğun Bakım Pendantı	["Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/ce791833-7a7a-44f1-861d-4a8f8ca7a8b6	6	ADET	2250.00	44	single	\N	t	f	f	f
13791	44	\N	RİJİT Pendant	["MOTORSUZ, KENTİ EKSENİNDE hareket edebilen", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865	4	ADET	1250.00	45	single	\N	t	f	f	f
13792	44	\N	Vakum Santral Merkezi -  (3 x 160 m³/h)	["3x Vakum Pompası", "1x Vakum Kontrol Paneli", "2X 1000 Lt. 'lik Tank", "1x Bakteri Filtre Gurubu", "1x Vakum Elektrik Kontrol Paneli", "1x Vakustat", "1x Vakummetre"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4d17142e-41af-4130-a3cb-c638f41f1cf4	1	ADET	17500.00	46	single	\N	t	f	f	f
13793	44	\N	Basınçlı Hava Santral Merkezi -  (3 x 250  m³/h)	["3x  Basınçlı Hava Kompresörü", "3x  Hat Flitresi", "1x  Kimyasal Hava Kurutucu", "2x  1000 Lt. Tank", "1x  Elektrik Kontrol Paneli"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4297778e-7ab1-470e-9394-96efde66a49b	1	ADET	40500.00	47	single	\N	t	f	f	f
13794	44	\N	Oksijen Santral Merkezi - (2 x 20 Tüplük) +1*20	["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	4750.00	48	single	\N	t	f	f	f
13795	44	\N	Azot Prodoksit Santral Merkez  (2 x 5 Tüplük) +1*5	["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	2750.00	49	single	\N	t	f	f	f
13796	44	\N	70+70 m3/h AGSS SANTRALİ	[]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	4000.00	50	single	\N	t	f	f	f
13900	45	\N	Oksijen Santral Merkezi - (1 x 1 Tüplük) +1*1	["1 adet pnömatik kolektör değiştirici / change-over", "150 m³/h kapasiteli regülatör, drenaj vanalı", "2 adet regülatör giriş filtresi", "2 adet yüksek basınç manometresi", "4 adet düşük basınç manometresi", "3 adet ikinci kademe basınç regülatörü, drenaj vanalı", "3 adet basınç sensörü", "Yüksek basınç düşümü gaz alarm", "+2 adet oksijen tüpü"]	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3	1	ADET	4500.00	18	single	\N	t	f	f	f
\.


--
-- Data for Name: quote_forms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quote_forms (id, quote_no, firma_adi, firma_adres, firma_telefon, firma_email, firma_vergi_dairesi, firma_vergi_no, teslimat_adresi, teslimat_suresi, odeme_sekli, para_birimi, hizmetler, sartlar, notlar, iskonto, kdv, hazirlayan, hazirlayan_telefon, hazirlayan_email, onaylayan, onaylayan_gorev, onay_tarihi, created_at, updated_at, status, iskonto_tipi, hazirlayan_imza_url, show_kdv, show_genel_toplam, language, karsi_firma_logo_url) FROM stdin;
4	OXM-TFL-2026-240503	ZONE DIGITAL LLC	8 The Green STE B	5059751535	\N	\N	\N	\N	Sipariş onayından sonra 21 iş günü	%40 sipariş, %60 teslimat öncesi	EUR	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	\N	0	20	Yusuf Deliceoglu	\N	\N	\N	\N	\N	2026-05-24 15:28:38.418671+00	2026-05-28 19:28:19.154+00	approved	yuzde	\N	t	t	tr	\N
27	OXM-TFL-2026-280701	Ankara Ticaret Odası	Söğütözü Mahallesi 2176. Cadde No: 1/1 06530 Çankaya/ANKARA	0 312 201 81 67	seval.oz@atonet.org.tr	\N	\N	\N	Sipariş onayından sonra ... iş günü	.	TRY	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır.", "Fiyatlar sadece malzeme fiyatı olarak verilmiştir."]	Nakliye ve montaj hariç yalnızca malzeme birim fiyatı	0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	Seval ÖZ	İç Ticaret Müdürlüğü / Büro Görevlisi	\N	2026-07-28 11:33:32.272491+00	2026-07-28 11:51:35.339+00	sent	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	f	f	tr	\N
11	OXM-TFL-2026-220601	Elnur Musayev	Azerbaycan	\N	\N	\N	\N	Azerbaycan	Sipariş onayından sonra ... iş günü	\N	EUR	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	\N	0	20	Ercan DELİCEOĞLU	+90 543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	Elnur Musayev	\N	\N	2026-06-22 07:43:14.632458+00	2026-06-22 09:13:07.668+00	sent	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	f	f	tr	\N
9	OXM-TFL-2026-170601	Arkela Yapı Mimarlık A.Ş.	Mustafa Kemal Mah. 2141. Cad. No:24/17 Çankaya/Ankara	+90 312 219 47 37	info@arkela.com.tr	\N	\N	BİLECİK SÖĞÜT 50 YATAKLI DEVLET HASTANESİ	Sipariş onayından sonra 21 iş günü	%50 sipariş, %50 teslimat öncesi	USD	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	• Teklifimiz onaylı medikal gaz projesine göre hazırlanmıştır.\n• Oksijen ve azot protoksit tüpleri, flowmetreler, abone fişleri ve benzeri sarf malzemeler teklif kapsamı dışındadır.\n• Elektrik, inşaat ve altyapı işleri teklifimize dahil değildir.\n• Proje değişikliği, ilave imalat veya farklı ürün talepleri halinde fiyat revizyonu yapılacak veya ek teklif sunulacaktır.\n• Fiyatlarımıza işçilik ve montaj dahildir.	0	20	ERCAN DELİCEOĞLU	+90 (543) 205 15 35	info@batesmedical.com	\N	\N	\N	2026-06-17 13:19:12.307804+00	2026-06-17 21:34:15.21+00	draft	yuzde	\N	f	f	tr	\N
8	OXM-TFL-2026-280501	MEKATRONİK İNŞAAT MÜHENDİSLİK	Adres: Batı Sitesi Mahallesi 2322. Cadde Bina No: 5 Daire: 1 Yenimahalle / ANKARA	+90 312 212 8920	info@mekatronikinsaat.com.tr	\N	\N	ANKARA HASTANESİ	\N	\N	USD	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	Oksijen ve azot protoksit tüpleri, flowmetre, abone fişleri ve benzeri sarf malzemeler teklifimize dahil değildir.\n\nSonradan oluşabilecek ek imalat, proje değişikliği veya farklı ürün talepleri ayrıca değerlendirilecek ve fiyatlandırılacaktır.\n\nFiyatlarımıza işçilik ve montaj dahildir.\nKDV hariçtir.\n\nSaygılarımızla.	0	20	ERCAN DELİCEOĞLU	+90 543 205 1535	info@batesmedical.com	\N	\N	\N	2026-05-28 19:27:56.327443+00	2026-06-17 14:55:58.84+00	rejected	yuzde	\N	f	f	tr	\N
28	OXM-TFL-2026-310701	Medecom	34/2 East Shewrapara , Mirpur,  Dhaka-1216, Bangladesh.	+880 1711628592, +880 197 7628592	medecom.dhaka@yahoo.com , medecom.dhaka@gmail.com	\N	\N	Islami bank hospital dhaka bangladesh.	Sipariş onayından sonra 4-6 hafta	%60 sipariş, %40 kargo öncesi	USD	["Garanti kapsamındaki yedek parça ve işçilik", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlar EXW Fiyatıdır.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	Fiyatlar EXW Fiyatıdır.	0	20	Ercan DELİCEOĞLU	+90 543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	Sayedur Rahman	Director , Medecom	\N	2026-07-31 20:26:13.336753+00	2026-08-01 13:55:32.545+00	draft	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	f	f	tr	\N
12	OXM-TFL-2026-230601	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	Adnan Menderes Mah. 504 Sok.No: 11/5    Efeler/AYDIN	0 256 211 60 07	ilkersadi@dokuinsaat.com.tr	GÜZELHİSAR	0 590 007 4976	İZMİR BUCA 50 ÜNİT ADSM İNŞATI	Sipariş onayından sonra ..... iş günü	%60 sipariş, %40 teslimat öncesi	USD	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	\N	0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	\N	\N	\N	2026-06-23 09:58:39.458767+00	2026-06-23 09:58:39.458767+00	draft	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	f	f	tr	\N
10	OXM-TFL-2026-180601	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	Adnan Menderes Mah. 504 Sok.No: 11/5    Efeler/AYDIN	0 256 211 60 07	ilkersadi@dokuinsaat.com.tr	GÜZELHİSAR	0 590 007 4976	İZMİR BUCA 50 ÜNİT ADSM İNŞATI	Sipariş onayından sonra ..... iş günü	%60 sipariş, %40 teslimat öncesi	USD	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	\N	0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	\N	\N	\N	2026-06-18 06:55:59.623934+00	2026-06-23 12:29:44.847+00	approved	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	f	f	tr	\N
13	OXM-TFL-2026-230602	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	Adnan Menderes Mah. 504 Sok.No: 11/5    Efeler/AYDIN	0 256 211 60 07	ilkersadi@dokuinsaat.com.tr	GÜZELHİSAR	0 590 007 4976	İZMİR BUCA 50 ÜNİT ADSM İNŞATI	Sipariş onayından sonra ..... iş günü	%60 sipariş, %40 teslimat öncesi	USD	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	\N	0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	\N	\N	\N	2026-06-23 14:14:29.585804+00	2026-06-23 14:14:29.585804+00	draft	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	f	f	tr	\N
14	OXM-TFL-2026-230603	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	Adnan Menderes Mah. 504 Sok.No: 11/5    Efeler/AYDIN	0 256 211 60 07	ilkersadi@dokuinsaat.com.tr	GÜZELHİSAR	0 590 007 4976	İZMİR BUCA 50 ÜNİT ADSM İNŞATI	Sipariş onayından sonra ..... iş günü	%60 sipariş, %40 teslimat öncesi	USD	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	\N	0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	\N	\N	\N	2026-06-23 14:24:26.413563+00	2026-06-23 14:24:26.413563+00	draft	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	f	f	tr	\N
19	OXM-TFL-2026-150701	Makimsan Asfalt Taahhüt İnşaat Sanayi ve Ticaret A.Ş.	Ege Plaza, Mevlana Bulvarı 182/B-3 Çankaya, Ankara - Türkiye	+90 312 446 12 10	esma.tosun@makimsan.com.tr	\N	\N	CİZRE 75 YATAK KDC VE ADSM İNŞAATI	Sipariş onayından sonra 21 iş günü	%40 sipariş, %60 teslimat öncesi	USD	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	\N	0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	\N	\N	\N	2026-07-15 18:25:21.615903+00	2026-07-15 19:40:18.008+00	draft	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	f	f	tr	\N
18	OXM-TFL-2026-240601	UŞAK DİŞ HEKİMLİĞİ FAKULTESİ ERTAN BEY	\N	+90 532 393 2345	\N	\N	\N	UŞAK DİŞ HEKİMLİĞİ FAKULTESİ	Sipariş onayından sonra … iş günü	 %35 siparişde nakit  %30 60-90-120gün vadeli çek  %25 Kompresörler gümrüğe geldiğinde  %10 iş teslimatında	EUR	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	\N	0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	\N	\N	\N	2026-06-24 14:07:23.507756+00	2026-06-24 15:31:19.401+00	draft	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	f	f	tr	\N
17	OXM-TFL-2026-230604	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	Adnan Menderes Mah. 504 Sok.No: 11/5    Efeler/AYDIN	0 256 211 60 07	ilkersadi@dokuinsaat.com.tr	GÜZELHİSAR	0 590 007 4976	İZMİR SELÇUK 50 YATAKLI DEVLET HASTANESİ	Sipariş onayından sonra ..... iş günü	%60 sipariş, %40 teslimat öncesi	USD	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	\N	0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	\N	\N	\N	2026-06-23 15:03:55.26117+00	2026-07-06 13:20:27.127+00	draft	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	f	f	tr	\N
22	OXM-TFL-2026-170702	İZMİR DEMOKRASİ ÜNİVERSİTESİ DİŞ HEKİMLİĞİ FAKULTESİ	Uzundere, 3962/30. Sk. No:86, 35120 Karabağlar/İzmir	+90 (232) 299 06 00	agizdis@idu.edu.tr	\N	\N	\N	Sipariş onayından sonra ... iş günü	%40 sipariş, %60 teslimat öncesi	TRY	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	\N	0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	\N	\N	\N	2026-07-17 12:27:53.22787+00	2026-07-17 13:09:53.937+00	draft	yuzde	/api/storage/public-objects/objects/uploads/661f6c5a-c8c0-4942-9449-33d072d51dd1	f	f	tr	\N
25	OXM-TFL-2026-220701	MTB MEKANİK İKLİMLENDİRME SİSTEMLERİ VE İŞ GÜVENLİĞİ DANIŞMANLIK LTD.ŞTİ	KAVAKLI MAH.MÜMTAZ SOK.NO:8-6 BEYLİKDÜZÜ / İŞTANBUL	0 531 992 4900	\N	BEYLİKDÜZÜ	6232159025	VAN BAŞKALE HASTANE İNŞAATI	ŞANTİYE İŞ PROGRAMI	KARŞILIKLI GÖRÜŞME	USD	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	\N	0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	\N	\N	\N	2026-07-22 10:15:58.2028+00	2026-07-22 10:15:58.2028+00	draft	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	f	f	tr	\N
21	OXM-TFL-2026-170701	İZMİR DEMOKRASİ ÜNİVERSİTESİ DİŞ HEKİMLİĞİ FAKULTESİ	Uzundere, 3962/30. Sk. No:86, 35120 Karabağlar/İzmir	+90 (232) 299 06 00	agizdis@idu.edu.tr	\N	\N	\N	Sipariş onayından sonra ... iş günü	%40 sipariş, %60 teslimat öncesi	TRY	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	\N	0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	\N	\N	\N	2026-07-17 12:13:59.862887+00	2026-07-17 13:26:21.501+00	draft	yuzde	/api/storage/public-objects/objects/uploads/77800ed7-affc-4569-84d6-5fe82653c2fd	f	f	tr	\N
26	OXM-TFL-2026-220702	Makimsan Asfalt Taahhüt İnşaat Sanayi ve Ticaret A.Ş.	Ege Plaza, Mevlana Bulvarı 182/B-3 Çankaya, Ankara - Türkiye	+90 312 446 12 10	esma.tosun@makimsan.com.tr	\N	\N	Ankara Müşteri araç üstü	Sipariş onayından sonra 4-6 hafta.	%50 nakit, bakiye 90 gün çek.	USD	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	Montaj kurulum dahildir.	0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	\N	\N	\N	2026-07-22 10:18:18.809379+00	2026-07-22 10:18:18.809379+00	draft	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	f	f	tr	\N
24	OXM-TFL-2026-180701	MTB MEKANİK İKLİMLENDİRME SİSTEMLERİ VE İŞ GÜVENLİĞİ DANIŞMANLIK LTD.ŞTİ	KAVAKLI MAH.MÜMTAZ SOK.NO:8-6 BEYLİKDÜZÜ / İŞTANBUL	0 531 992 4900	\N	BEYLİKDÜZÜ	6232159025	VAN BAŞKALE HASTANE İNŞAATI	ŞANTİYE İŞ PROGRAMI	KARŞILIKLI GÖRÜŞME	USD	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	\N	0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	\N	\N	\N	2026-07-18 14:44:18.39439+00	2026-07-18 14:44:18.39439+00	draft	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	f	f	tr	\N
23	OXM-TFL-2026-170703	MTB MEKANİK İKLİMLENDİRME SİSTEMLERİ VE İŞ GÜVENLİĞİ DANIŞMANLIK LTD.ŞTİ	KAVAKLI MAH.MÜMTAZ SOK.NO:8-6 BEYLİKDÜZÜ / İŞTANBUL	0 531 992 4900	\N	BEYLİKDÜZÜ	6232159025	VAN BAŞKALE HASTANE İNŞAATI	ŞANTİYE İŞ PROGRAMI	KARŞILIKLI GÖRÜŞME	USD	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	\N	0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	\N	\N	\N	2026-07-17 20:18:56.160111+00	2026-07-18 14:46:40.705+00	rejected	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	f	f	tr	\N
31	OXM-TFL-2026-310702	MTB MEKANİK İKLİMLENDİRME SİSTEMLERİ VE İŞ GÜVENLİĞİ DANIŞMANLIK LTD.ŞTİ	KAVAKLI MAH.MÜMTAZ SOK.NO:8-6 BEYLİKDÜZÜ / İŞTANBUL	0 531 992 4900	\N	BEYLİKDÜZÜ	6232159025	VAN BAŞKALE HASTANE İNŞAATI	ŞANTİYE İŞ PROGRAMI	KARŞILIKLI GÖRÜŞME	USD	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	\N	0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	\N	\N	\N	2026-07-31 21:51:07.731428+00	2026-07-31 21:51:07.731428+00	draft	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	f	f	tr	\N
32	OXM-TFL-2026-310703	MTB MEKANİK İKLİMLENDİRME SİSTEMLERİ VE İŞ GÜVENLİĞİ DANIŞMANLIK LTD.ŞTİ	KAVAKLI MAH.MÜMTAZ SOK.NO:8-6 BEYLİKDÜZÜ / İŞTANBUL	0 531 992 4900	\N	BEYLİKDÜZÜ	6232159025	VAN BAŞKALE HASTANE İNŞAATI	CONSTRUCTION SITE WORK SCHEDULE	BY MUTUAL AGREEMENT	USD	["Project-specific technical survey and engineering support", "Installation and commissioning service", "User training", "Spare parts and labor covered under warranty", "Periodic maintenance and technical support", "24/7 technical support and consultancy"]	["This quotation is valid for 30 days.", "Prices exclude VAT.", "The delivery period will be specified following order confirmation.", "Payment shall be made under the specified terms and conditions.", "Oxymed Medikal reserves the right to make changes to the quotation content.", "Detailed technical specifications and drawings will be provided upon request."]		0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	\N		\N	2026-07-31 21:51:19.641993+00	2026-07-31 21:51:32.323+00	draft	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	f	f	en	\N
36	OXM-TFL-2026-310704	MTB MEKANİK İKLİMLENDİRME SİSTEMLERİ VE İŞ GÜVENLİĞİ DANIŞMANLIK LTD.ŞTİ	KAVAKLI MAH.MÜMTAZ SOK.NO:8-6 BEYLİKDÜZÜ / İŞTANBUL	0 531 992 4900	\N	BEYLİKDÜZÜ	6232159025	VAN BAŞKALE HASTANE İNŞAATI	جدول أعمال موقع الإنشاء	بالاتفاق المتبادل	USD	["مسح فني ودعم هندسي خاص بالمشروع", "خدمة التركيب والتشغيل", "تدريب المستخدمين", "قطع الغيار والعمالة مشمولة ضمن الضمان", "الصيانة الدورية والدعم الفني", "دعم فني واستشارات على مدار 24/7"]	["عرض الأسعار هذا صالح لمدة 30 يوماً.", "الأسعار لا تشمل ضريبة القيمة المضافة.", "سيتم تحديد فترة التسليم بعد تأكيد الطلب.", "يتم السداد وفقاً للشروط والأحكام المحددة.", "تحتفظ شركة Oxymed Medikal بالحق في إجراء تغييرات على محتوى عرض الأسعار.", "سيتم تقديم المواصفات الفنية التفصيلية والرسومات عند الطلب."]		0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	\N		\N	2026-07-31 22:32:48.032845+00	2026-07-31 22:33:11.218+00	draft	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	f	f	ar	\N
41	OXM-TFL-2026-110801	UŞAK DİŞ HEKİMLİĞİ FAKULTESİ BATUHAN BEY	\N	+90 532 393 2345	\N	\N	\N	UŞAK DİŞ HEKİMLİĞİ FAKULTESİ	Sipariş onayından sonra … iş günü	Siparişe Müteakip %25 Nakit Banka Havalesi Bakiye 60-90-120 gün vadeli çekler ile yapılacak olup Toplam tutarın %10 luk kısmı iş teslimine bırakılacaktır	EUR	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	\N	0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	\N	\N	\N	2026-08-11 06:43:02.479642+00	2026-08-11 06:46:49.8+00	draft	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	t	t	tr	\N
37	OXM-TFL-2026-010801	Medecom	34/2 East Shewrapara , Mirpur,  Dhaka-1216, Bangladesh.	+880 1711628592, +880 197 7628592	medecom.dhaka@yahoo.com , medecom.dhaka@gmail.com	\N	\N	Islami bank hospital dhaka bangladesh.	4-6 weeks after order confirmation	60% with order, 40% prior to shipment	USD	["Spare parts and labor covered under warranty", "24/7 technical support and consultancy"]	["This quotation is valid for 30 days.", "Prices are EXW.", "The delivery period will be specified following order confirmation.", "Payment shall be made according to the stated terms and conditions.", "Oxymed Medikal reserves the right to make changes to the quotation content.", "Detailed technical specifications and drawings will be provided upon request."]	Prices are EXW.\nCopper fitting materials are included in the prices.	0	20	Ercan DELİCEOĞLU	+90 543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	Sayedur Rahman	Director, Medecom	\N	2026-08-01 14:06:50.559163+00	2026-08-04 07:56:21.31+00	sent	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	f	f	en	\N
42	OXM-TFL-2026-110802	Malatya İnönü Üniversitesi	İnönü Üniversitesi Merkez Kampüsü (Elazığ Yolu 15.km) Pk:44280 Battalgazi/Malatya	+90 422 377 30 00	\N	\N	\N	İnönü Üniversitesi Merkez Kampüsü (Elazığ Yolu 15.km) Pk:44280 Battalgazi/Malatya	Sipariş onayından sonra 21 iş günü	\N	EUR	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar."]	Montaj kurulum dahildir.	0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	\N	\N	\N	2026-08-11 07:36:20.694703+00	2026-08-11 07:51:59.821+00	draft	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	f	f	tr	\N
39	OXM-TFL-2026-040801	ŞANLIURFA SİVEREV ADSM REVİZYON YAPIM İŞİ	\N	\N	\N	\N	\N	SİVEREK ADSM İNŞ.	Sipariş onayından sonra  Şantiye programıyla işe başlanır	%40 sipariş, %60 teslimat öncesi	USD	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	\N	0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	\N	\N	\N	2026-08-04 08:18:01.358689+00	2026-08-04 09:14:37.663+00	draft	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	f	f	tr	\N
40	OXM-TFL-2026-100801	\N	\N	\N	\N	\N	\N	\N	\N	\N	EUR	[]	[]	\N	0	20	\N	\N	\N	\N	\N	\N	2026-08-10 07:36:52.497344+00	2026-08-10 07:36:52.497344+00	draft	yuzde	\N	t	t	tr	\N
43	OXM-TFL-2026-110803	GİRESUN ÇEVRE ŞEHİRCİLİK İL MÜDÜRLÜĞÜ	Giresun	\N	\N	\N	\N	GİRESUN ÇEVRE ŞEHİRCİLİK İL MÜDÜRLÜĞÜ	Sipariş onayından sonra ... iş günü	\N	TRY	["Sadece Malzeme Satışı"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar."]	Gaz Prizleri dahil değildir.	0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	\N	\N	\N	2026-08-11 15:35:47.986977+00	2026-08-11 15:56:18.057+00	draft	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	t	t	tr	\N
44	OXM-TFL-2026-120801	AS MEKANİK MÜHENDİSLİK ELAZIĞ PALU 150 YATAK	\N	0532 477 80 68	\N	\N	\N	\N	Sipariş onayından sonra 10 iş günü İşe Başlama	%40 sipariş, %60 teslimat öncesi	USD	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	\N	0	20	Ercan Deliceoglu	543 205 15 35	info@batesmedical.com	\N	\N	\N	2026-08-12 20:59:55.995384+00	2026-08-12 21:40:03.963+00	draft	yuzde	/api/storage/public-objects/objects/uploads/bf8be97c-e14c-410d-b748-c42ae7e021c7	t	t	tr	\N
45	OXM-TFL-2026-170801	ADA Development Project – F3 G Block Laboratory Additional Works	\N	\N	\N	\N	\N	Azerbaijan	Sipariş onayından sonra 21 iş günü	%40 sipariş, %60 teslimat öncesi	USD	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	\N	0	20	Ercan Deliceoğlu	+90 543 205 1535	info@oxymedmedical.com, info@batesmedical.com	\N	\N	\N	2026-08-17 08:58:02.21998+00	2026-08-17 09:17:42.752+00	draft	yuzde	/api/storage/public-objects/objects/uploads/a8e88cc6-f587-46d7-80cf-0aac1e302b88	f	f	tr	\N
47	OXM-TFL-2026-170803	TÜRMAK MÜHENDİSLİK VE MİMARLIK	Ataköy 7-8-9-10. Kısım mah. Çobançeşme E-5 yan yol cad. A-B Blok No: 18/1 iç kapı no: 121 Bakırköy İST	+90 538 047 49 68	turmak.muhendislik@gmail.com	Bakırköy V.D.	10574888348	\N	Sipariş onayından sonra ... iş günü	%35 siparişte nakit 60-90-120 vadeli ceklerle	EUR	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	\N	0	20	Ercan Deliceoğlu	+90 543 205 1535	info@oxymedmedical.com, info@batesmedical.com	\N	\N	\N	2026-08-17 11:00:45.266479+00	2026-08-17 11:26:16.244+00	draft	yuzde	/api/storage/public-objects/objects/uploads/a8e88cc6-f587-46d7-80cf-0aac1e302b88	f	f	tr	\N
46	OXM-TFL-2026-170802	ADA Development Project – F3 G Block Laboratory Additional Works	\N	\N	\N	\N	\N	Azerbaijan	Sifariş təsdiqindən sonra ... iş günü	\N	USD	["Layihəyə xüsusi texniki baxış və mühəndislik dəstəyi", "Montaj və istismara vermə xidməti", "İstifadəçi təlimi", "Zəmanət çərçivəsində ehtiyat hissələri və işçilik", "Dövri texniki xidmət və texniki dəstək", "7/24 texniki dəstək və məsləhət"]	["Bu təklif forması 30 gün müddətində qüvvədədir.", "Qiymətlərə ƏDV daxil deyil.", "Çatdırılma müddəti sifariş təsdiqindən sonra bildiriləcəkdir.", "Ödəniş göstərilən müddət və şərtlərə uyğun həyata keçiriləcəkdir.", "Oxymed Medikal təklifin məzmununda dəyişiklik etmək hüququnu özündə saxlayır.", "Ətraflı texniki spesifikasiya və çertyojlar tələb olunduğu halda təqdim ediləcəkdir."]	\N	0	20	Ercan Deliceoğlu	+90 543 205 1535	info@oxymedmedical.com, info@batesmedical.com	\N	\N	\N	2026-08-17 09:17:51.164424+00	2026-08-17 09:23:26.978+00	draft	yuzde	/api/storage/public-objects/objects/uploads/a8e88cc6-f587-46d7-80cf-0aac1e302b88	f	f	az	\N
48	OXM-TFL-2026-170804	RÜŞTÜ ÜZÜMCÜ A.Ş.	Oğulbey Mahallesi, Kumludere Caddesi  No: 1 Gölbaşı/ANKARA	0 (312) 483 77 77	info@rustuuzumcu.com.tr	\N	\N	\N	Sipariş onayından sonra ... iş günü	\N	USD	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	\N	0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	Rüştü ÜZÜMCÜ	\N	\N	2026-08-17 14:56:27.164126+00	2026-08-17 19:46:24.947+00	draft	yuzde	\N	f	f	tr	/api/storage/public-objects/objects/uploads/f8de8bf9-8327-4063-9ff1-1b8516f5045a
20	OXM-TFL-2026-160701	Makimsan Asfalt Taahhüt İnşaat Sanayi ve Ticaret A.Ş. Sn:: Metin Aslantaş	Ege Plaza, Mevlana Bulvarı 182/B-3 Çankaya, Ankara - Türkiye	+90 312 446 12 10	esma.tosun@makimsan.com.tr	\N	\N	Ankara Müşteri araç üstü	Sipariş onayından sonra 4-6 hafta.	%50 nakit, bakiye 90 gün çek.	USD	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	Montaj kurulum dahildir.	0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	\N	\N	\N	2026-07-16 07:40:20.555389+00	2026-08-25 12:25:19.009+00	draft	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	f	f	tr	\N
49	OXM-TFL-2026-250801	Makimsan Asfalt Taahhüt İnşaat Sanayi ve Ticaret A.Ş. Sn:: Metin Aslantaş	Ege Plaza, Mevlana Bulvarı 182/B-3 Çankaya, Ankara - Türkiye	+90 312 446 12 10	esma.tosun@makimsan.com.tr	\N	\N	Ankara Müşteri araç üstü	Sipariş onayından sonra 4-6 hafta.	%50 nakit, bakiye 90 gün çek.	USD	["Projeye özel teknik keşif ve mühendislik desteği", "Montaj ve devreye alma hizmeti", "Kullanıcı eğitimi", "Garanti kapsamındaki yedek parça ve işçilik", "Periyodik bakım ve teknik destek", "7/24 teknik destek ve danışmanlık"]	["Bu teklif formu 30 gün süreyle geçerlidir.", "Fiyatlara KDV dahil değildir.", "Teslimat süresi, sipariş onayının ardından belirtilecektir.", "Ödeme, belirtilen vade ve koşullarda yapılacaktır.", "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.", "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır."]	Montaj kurulum dahildir.	0	20	Ercan DELİCEOĞLU	0543 205 15 35	info@batesmedical.com  / info@oxymedmedical.com	\N	\N	\N	2026-08-25 12:28:50.527151+00	2026-08-25 12:28:50.527151+00	draft	yuzde	/api/storage/public-objects/objects/uploads/2599ce5b-5ca2-4130-aa53-e8cc75bfff6c	f	f	tr	\N
\.


--
-- Data for Name: quote_group_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quote_group_templates (id, name, description, image_url, children, sort_order, created_at, updated_at, model_code, name_en, description_en, admin_notes) FROM stdin;
8	Medikal Gaz Alarm Paneli	HTM 2022 ye birebir uygun, Yüksek-Normal-Düşük Basınç Göstergeli\nGazın anlık geçiş basıncını izleyebilen - Switchleri ile Komple	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/66921ec0-369a-415e-802a-d7b28b40def6	[{"unit": "ADET", "title": "—", "quantity": 0, "modelCode": "1 Gaz İçin", "unitPrice": "120.00"}, {"unit": "ADET", "title": "—", "quantity": 0, "modelCode": "2 Gaz İçin", "unitPrice": "140.00"}, {"unit": "ADET", "title": "—", "quantity": 6, "modelCode": "3 Gaz İçin", "unitPrice": "160.00"}, {"unit": "ADET", "title": "—", "quantity": 0, "modelCode": "4 Gaz İçin", "unitPrice": "180.00"}, {"unit": "ADET", "title": "—", "quantity": 0, "modelCode": "5 Gaz İçin", "unitPrice": "200.00"}]	0	2026-06-17 14:24:30.147861+00	2026-06-17 14:24:30.147861+00	\N	\N	\N	\N
9	Medikal Gaz Vana Kutusu	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/a60fdfb3-ca96-4175-99f0-b3e65b23e32a	[{"unit": "ADET", "title": "—", "quantity": 0, "modelCode": "1 Gaz İçin", "unitPrice": "150.00"}, {"unit": "ADET", "title": "—", "quantity": 0, "modelCode": "2 Gaz İçin", "unitPrice": "190.00"}, {"unit": "ADET", "title": "—", "quantity": 6, "modelCode": "3 Gaz İçin", "unitPrice": "230.00"}, {"unit": "ADET", "title": "—", "quantity": 0, "modelCode": "4 Gaz İçin", "unitPrice": "270.00"}, {"unit": "ADET", "title": "—", "quantity": 0, "modelCode": "5 Gaz İçin", "unitPrice": "310.00"}]	0	2026-06-17 14:24:36.846312+00	2026-06-17 14:24:36.846312+00	\N	\N	\N	\N
10	Medikal Gaz Prizleri	BS Standardı, Tamamıyla Metal Konstrüksiyon	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/dfc343ac-0192-49d2-95ea-fd38fd4b014f	[{"unit": "ADET", "title": "—", "quantity": 134, "modelCode": "Oksijen Prizi", "unitPrice": "22.00"}, {"unit": "ADET", "title": "—", "quantity": 134, "modelCode": "Vakum Prizi", "unitPrice": "22.00"}, {"unit": "ADET", "title": "—", "quantity": 0, "modelCode": "N2O Prizi", "unitPrice": "22.00"}, {"unit": "ADET", "title": "—", "quantity": 134, "modelCode": "Basınçlı Hava Prizi (MA4)", "unitPrice": "22.00"}, {"unit": "ADET", "title": "—", "quantity": 0, "modelCode": "Basınçlı Hava Prizi (SA7)", "unitPrice": "22.00"}, {"unit": "ADET", "title": "—", "quantity": 0, "modelCode": "AGSS Prizi VENTÜRİ", "unitPrice": "45.00"}]	0	2026-06-17 14:24:49.209857+00	2026-06-17 14:24:49.209857+00	\N	\N	\N	\N
11	Medikal Bakır Boruları	İtalya ,Almanya'dan ithal, EN 13348 standardında	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4795266d-90dc-4396-87ca-a020f6ca9255	[{"unit": "METRE", "title": "—", "quantity": 2500, "modelCode": "Ø12X1 mm.", "unitPrice": "14.20"}, {"unit": "METRE", "title": "—", "quantity": 250, "modelCode": "Ø15X1 mm.", "unitPrice": "17.21"}, {"unit": "METRE", "title": "—", "quantity": 850, "modelCode": "Ø22X1 mm.", "unitPrice": "24.02"}, {"unit": "METRE", "title": "—", "quantity": 215, "modelCode": "Ø28X1 mm.", "unitPrice": "30.26"}, {"unit": "METRE", "title": "—", "quantity": 190, "modelCode": "Ø35X1 mm.", "unitPrice": "37.47"}, {"unit": "METRE", "title": "—", "quantity": 1, "modelCode": "Ø42X1 mm.", "unitPrice": "0.00"}, {"unit": "METRE", "title": "—", "quantity": 0, "modelCode": "Ø54X1 mm.", "unitPrice": "0.00"}, {"unit": "METRE", "title": "—", "quantity": 0, "modelCode": "Ø76X1 mm.", "unitPrice": "0.00"}, {"unit": "METRE", "title": "—", "quantity": 0, "modelCode": "Ø108X1 mm.", "unitPrice": "0.00"}]	0	2026-06-17 14:24:58.025767+00	2026-06-17 14:24:58.025767+00	\N	\N	\N	\N
12	Hastabaşı Ünitesi	__single_item_template	\N	[{"unit": "ADET", "title": "Hastabaşı Ünitesi", "bullets": ["1 Kişilik Hasta Yoğun Bakım Ünitesi (150 cm.)", "Alüminyum Yatay Tip, Duvara montaj", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Ünite Boyunca Ray- Paslanmaz Çelik"], "imageUrl": "https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/f5780e62-9914-41b3-b36c-b57922244bd6", "quantity": 96, "modelCode": "OXY-HYB-100", "unitPrice": "180.00"}]	0	2026-06-17 14:25:06.531925+00	2026-06-17 14:25:06.531925+00	\N	\N	\N	\N
13	Hasta Yoğun Bakım Ünitesi	__single_item_template	\N	[{"unit": "ADET", "title": "Hasta Yoğun Bakım Ünitesi", "bullets": ["1 Kişilik Yoğun Bakım Ünitesi (150 - 180 cm.)", "Alüminyum Yatay Tip, Duvara montaj", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Ünite Boyunca Ray- Paslanmaz Çelik"], "imageUrl": "https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/206cf3a1-19d8-4108-bc72-5cfb20c00fd4", "quantity": 13, "modelCode": "OXY-YBU-200", "unitPrice": "220.00"}]	0	2026-06-17 14:25:12.941794+00	2026-06-17 14:25:12.941794+00	\N	\N	\N	\N
14	Kolon Tipi Yoğun Bakım Ünitesi - (Tek Hasta İçin)	__single_item_template	\N	[{"unit": "ADET", "title": "Kolon Tipi Yoğun Bakım Ünitesi - (Tek Hasta İçin)", "bullets": ["Alüminyum Yan Gövdeler, MDF ön ve arka yüzey, Tavan yüksekliğinde", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "RJ 45 Data Prizi", "Topraklı Priz", "UPS Prizi", "Topraklama Nodu", "Askı Rayı - Paslanmaz Çelik"], "imageUrl": "https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/b8daca1b-e15d-413d-9c1d-194152466f8a", "quantity": 6, "modelCode": "OXY-KTYB-100", "unitPrice": "800.00"}]	0	2026-06-17 17:54:38.840956+00	2026-06-17 17:54:38.840956+00	\N	\N	\N	\N
15	Bölüm Kesme Vanaları	\N	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/46d5478b-0f9b-4ab0-9c97-ed1a8abab053	[{"unit": "ADET", "title": "—", "quantity": 6, "modelCode": "12mm Çap", "unitPrice": "17.50"}, {"unit": "ADET", "title": "—", "quantity": 0, "modelCode": "15mm Çap", "unitPrice": "19.30"}, {"unit": "ADET", "title": "—", "quantity": 0, "modelCode": "22mm Çap", "unitPrice": "26.00"}, {"unit": "ADET", "title": "—", "quantity": 0, "modelCode": "28mm Çap", "unitPrice": "32.00"}, {"unit": "ADET", "title": "—", "quantity": 0, "modelCode": "35mm Çap", "unitPrice": "38.00"}, {"unit": "ADET", "title": "—", "quantity": 0, "modelCode": "42mm Çap", "unitPrice": "43.00"}, {"unit": "ADET", "title": "—", "quantity": 0, "modelCode": "54mm Çap", "unitPrice": "56.00"}]	0	2026-06-18 06:56:38.934694+00	2026-06-18 06:56:38.934694+00	\N	\N	\N	\N
16	Cerrahi Pendant	__single_item_template	\N	[{"unit": "ADET", "title": "Cerrahi Pendant", "bullets": ["Motorlu, Çok yönlü hareket edebilen", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"], "imageUrl": "https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865", "quantity": 2, "unitPrice": "2750.00"}]	0	2026-06-18 06:56:53.302182+00	2026-06-18 06:56:53.302182+00	\N	\N	\N	\N
17	Genel Tip Ameliyathane Pendantı	__single_item_template	\N	[{"unit": "ADET", "title": "Genel Tip Ameliyathane Pendantı", "bullets": ["Motorlu, Çok yönlü hareket edebilen", "Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"], "imageUrl": "https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/453e2300-1af5-49ee-97dc-c98727915865", "quantity": 3, "unitPrice": "2750.00"}]	0	2026-06-18 06:56:56.875258+00	2026-06-18 06:56:56.875258+00	\N	\N	\N	\N
18	Hareketli Çift kollu Yoğun Bakım Pendantı	__single_item_template	\N	[{"unit": "ADET", "title": "Hareketli Çift kollu Yoğun Bakım Pendantı", "bullets": ["Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"], "imageUrl": "https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/ce791833-7a7a-44f1-861d-4a8f8ca7a8b6", "quantity": 4, "unitPrice": "2250.00"}]	0	2026-06-18 06:57:00.99224+00	2026-06-18 06:57:00.99224+00	\N	\N	\N	\N
19	Köprü Tipi Yoğun Bakım Ünitesi	__single_item_template	\N	[{"unit": "ADET", "title": "Köprü Tipi Yoğun Bakım Ünitesi", "bullets": ["Vakum Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Oksijen Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "MA4 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "N2O Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "SA7 Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "AGSS Prizi Yuvası ( Gaz Prizileri Ayrıca Fiyatlandırılmıştır )", "Monitör Sehpası", "Topraklı Priz", "Topraklama Nodu"], "imageUrl": "https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/19b92874-7977-492d-8243-c4bdf7040dce", "quantity": 4, "unitPrice": "3500.00"}]	0	2026-06-18 06:57:04.198595+00	2026-06-18 06:57:04.198595+00	\N	\N	\N	\N
20	Vakum Santral Merkezi -  (3 x 100 m³/h)	__single_item_template	\N	[{"unit": "ADET", "title": "Vakum Santral Merkezi -  (3 x 100 m³/h)", "bullets": ["3x Vakum Pompası", "1x Vakum Kontrol Paneli ile Birlikte 500 Lt. 'lik Tank", "1x Bakteri Filtre Gurubu", "1x Vakum Elektrik Kontrol Paneli", "1x Vakustat", "1x Vakummetre"], "imageUrl": "https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4d17142e-41af-4130-a3cb-c638f41f1cf4", "quantity": 1, "unitPrice": "13500.00"}]	0	2026-06-18 06:57:08.229182+00	2026-06-18 06:57:08.229182+00	\N	\N	\N	\N
21	Basınçlı Hava Santral Merkezi -  (3 x 150  m³/h)	__single_item_template	\N	[{"unit": "ADET", "title": "Basınçlı Hava Santral Merkezi -  (3 x 150  m³/h)", "bullets": ["3x  Basınçlı Hava Kompresörü", "3x  Hat Flitresi", "1x  Kimyasal Hava Kurutucu", "2x  1000 Lt. Tank", "1x  Elektrik Kontrol Paneli"], "imageUrl": "https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/4297778e-7ab1-470e-9394-96efde66a49b", "quantity": 1, "unitPrice": "27500.00"}]	0	2026-06-18 06:57:11.154717+00	2026-06-18 06:57:11.154717+00	\N	\N	\N	\N
22	Oksijen Santral Merkezi - (2 x 5 Tüplük) +1*5	__single_item_template	\N	[{"unit": "ADET", "title": "Oksijen Santral Merkezi - (2 x 5 Tüplük) +1*5", "bullets": ["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"], "imageUrl": "https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3", "quantity": 1, "unitPrice": "3250.00"}]	0	2026-06-18 06:57:14.093303+00	2026-06-18 06:57:14.093303+00	\N	\N	\N	\N
23	Azot Prodoksit Santral Merkez  (2 x 3 Tüplük) +1*3	__single_item_template	\N	[{"unit": "ADET", "title": "Azot Prodoksit Santral Merkez  (2 x 3 Tüplük) +1*3", "bullets": ["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"], "imageUrl": "https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3", "quantity": 1, "unitPrice": "2500.00"}]	0	2026-06-18 06:57:16.54622+00	2026-06-18 06:57:16.54622+00	\N	\N	\N	\N
24	CO2 Santral Merkez  (2 x 3 Tüplük) +1*3	__single_item_template	\N	[{"unit": "ADET", "title": "CO2 Santral Merkez  (2 x 3 Tüplük) +1*3", "bullets": ["Tam Otomatik Kontrol ve Basınç Düşürücü Paneli", "Emniyet Zincirli Tüp Sabitleyici  (5 Tüplük)", "Automatic Changeover", "Santral Alarmı", "Tüp-Rampa Arası Esnek Bağlantı", "Rampa-Rampa Arası Esnek Bağlantı", "Kombine Kesme Emniyet Ventili"], "imageUrl": "https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/fcdb8687-2a24-4622-bf69-4218629e19b3", "quantity": 1, "unitPrice": "2500.00"}]	0	2026-06-18 06:57:19.019629+00	2026-06-18 06:57:19.019629+00	\N	\N	\N	\N
25	Duvar Modülleri	EN 737 ve EN 793'e Uygun, Alüminyum Profil, Elektrostatik Toz Boya	https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/004f0e70-81bb-4493-8d38-3e38a38b7ecb	[{"unit": "ADET", "title": "—", "quantity": 10, "modelCode": "1 Gaz İçin", "unitPrice": "35.00"}, {"unit": "ADET", "title": "—", "quantity": 11, "modelCode": "2 Gaz İçin Klasik", "unitPrice": "35.00"}, {"unit": "ADET", "title": "—", "quantity": 25, "modelCode": "2 Gaz İçin TİP F", "unitPrice": "100.00"}, {"unit": "ADET", "title": "—", "quantity": 2, "modelCode": "3 Gaz İçin TİP C", "unitPrice": "100.00"}, {"unit": "ADET", "title": "—", "quantity": 9, "modelCode": "3 Gaz İçin TİP C", "unitPrice": "120.00"}, {"unit": "ADET", "title": "—", "quantity": 3, "modelCode": "5 Gaz İçin TİP D", "unitPrice": "60.00"}, {"unit": "ADET", "title": "—", "quantity": 2, "modelCode": "6 Gaz İçin TİP E", "unitPrice": "80.00"}, {"unit": "ADET", "title": "—", "quantity": 0, "modelCode": "Anestezi İçin", "unitPrice": "150.00"}, {"unit": "ADET", "title": "—", "quantity": 0, "modelCode": "Cerrahi İçin", "unitPrice": "180.00"}]	0	2026-06-18 07:00:03.503206+00	2026-06-18 07:00:03.503206+00	\N	\N	\N	\N
26	Tek Kişilik Dental Teknisyen Masası - Model 02	__single_item_template	\N	[{"unit": "ADET", "title": "Tek Kişilik Dental Teknisyen Masası - Model 02", "bullets": ["Tek vakumlu teknisyen masası.", "220 V / AC 50 Hz. / Max. 1250 Watt.", "1 mm. kalınlığında çeliktan imal edilmiștir.", "Elektrostatik toz boya ile boyanmıștır..", "Ral renk seçenekleri mevcuttur.", "Gaz musluğu.", "3 mm PVC kenar korumalı", "30 mm șekillendirilmiș lamine", "Hava tabancası giriși", "Çalıșma alanında el motoru muhafaza alanları"], "imageUrl": "https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/f57c827c-e066-4a85-8b52-8be63fd03f57", "quantity": 1, "modelCode": "DTM-02", "unitPrice": "0.00"}]	0	2026-06-18 11:51:02.397146+00	2026-06-18 11:51:02.397146+00	\N	\N	\N	\N
27	Tek Kişilik Dental Teknisyen Masası - Model 01	__single_item_template	\N	[{"unit": "ADET", "title": "Tek Kişilik Dental Teknisyen Masası - Model 01", "bullets": ["Tek vakumlu teknisyen masası.", "220 V / AC 50 Hz. / Max. 1250 Watt.", "1 mm. kalınlığında çeliktan imal edilmiștir.", "Elektrostatik toz boya ile boyanmıștır..", "Ral renk seçenekleri mevcuttur.", "Gaz musluğu.", "3 mm PVC kenar korumalı", "30 mm șekillendirilmiș lamine", "Hava tabancası giriși", "Çalıșma alanında el motoru muhafaza alanları"], "imageUrl": "https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/06169fd7-f7d8-437f-bf68-08e9a3df3384", "quantity": 1, "modelCode": "DTM-01", "unitPrice": "0.00"}]	0	2026-06-18 11:51:07.361202+00	2026-06-18 11:51:07.361202+00	\N	\N	\N	\N
28	DENTAL TOZ ASPRATÖRÜ -  ( 1500 m³/h)	__single_item_template	\N	[{"unit": "ADET", "title": "DENTAL TOZ ASPRATÖRÜ -  ( 1500 m³/h)", "bullets": ["1800-HV-INV (5,5kW) Filtre Ünitesi Sabit filtre ünitesi  1500m3/h – 5,5 kW - 400V 50hz 3P PE N PID Inverter Kontollü Kontrol panosu. Teflon membran kaplı Polyester non-woven filtreli", "Hava Atışı İç Ortama verilecekse Hepa Filitre İlave Gerekmekte Olup Filitre  Fiyatı 1650 usd Eklenecektir"], "imageUrl": "https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/2aa47b3f-8367-4955-9721-f7c7ab8d88d9", "quantity": 1, "modelCode": "OXY-DTA-1500", "unitPrice": "13500.00"}]	0	2026-06-19 16:26:50.418415+00	2026-06-19 16:26:50.418415+00	\N	\N	\N	\N
29	Tek Kişilik Dental Teknisyen Masası - Model 01	__single_item_template	\N	[{"unit": "ADET", "title": "Tek Kişilik Dental Teknisyen Masası - Model 01", "bullets": ["Tek vakumlu teknisyen masası.", "220 V / AC 50 Hz. / Max. 1250 Watt.", "1 mm. kalınlığında çeliktan imal edilmiștir.", "Elektrostatik toz boya ile boyanmıștır..", "Ral renk seçenekleri mevcuttur.", "Gaz musluğu.", "3 mm PVC kenar korumalı", "30 mm șekillendirilmiș lamine", "Hava tabancası giriși", "Çalıșma alanında el motoru muhafaza alanları"], "imageUrl": "https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/06169fd7-f7d8-437f-bf68-08e9a3df3384", "quantity": 0, "modelCode": "DTM-01", "unitPrice": "1800.00"}]	0	2026-06-19 16:27:11.781284+00	2026-06-19 16:27:11.781284+00	\N	\N	\N	\N
30	Tek Kişilik Dental Teknisyen Masası - Model 02	__single_item_template	\N	[{"unit": "ADET", "title": "Tek Kişilik Dental Teknisyen Masası - Model 02", "bullets": ["Tek vakumlu teknisyen masası.", "220 V / AC 50 Hz. / Max. 1250 Watt.", "1 mm. kalınlığında çeliktan imal edilmiștir.", "Elektrostatik toz boya ile boyanmıștır..", "Ral renk seçenekleri mevcuttur.", "Gaz musluğu.", "3 mm PVC kenar korumalı", "30 mm șekillendirilmiș lamine", "Hava tabancası giriși", "Çalıșma alanında el motoru muhafaza alanları"], "imageUrl": "https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/f57c827c-e066-4a85-8b52-8be63fd03f57", "quantity": 24, "modelCode": "DTM-02", "unitPrice": "2050.00"}]	0	2026-06-19 16:27:14.021141+00	2026-06-19 16:27:14.021141+00	\N	\N	\N	\N
31	Dental Vakum Santrali	__single_item_template	\N	[{"unit": "SET", "title": "Dental Vakum Santrali", "bullets": [], "imageUrl": "https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/0b677feb-5150-486b-b6f5-785735d7cf0c", "quantity": 1, "unitPrice": "0"}]	0	2026-07-15 19:10:19.404676+00	2026-07-15 19:10:19.404676+00	\N	\N	\N	\N
32	Dental Vakum Santrali	__single_item_template	\N	[{"unit": "SET", "title": "Dental Vakum Santrali", "bullets": ["3 × 160 m³/h Dezenfeksiyonlu Dental Vakum Santrali", "3 adet GEV veya DVP marka, İtalya menşeli vakum pompası", "1 adet 700 litre yatay vakum tankı", "1 adet 1.000 litre dikey vakum tankı", "2 adet 500 litre separatör tankı", "1 adet amalgam ayırıcı filtre", "1 adet vakum kontrol panosu", "1 adet dental otomasyon panosu"], "imageUrl": "https://7a9d7cfe-2568-4580-8931-10688e670350-00-3dcbxgjrdfd47.sisko.replit.dev/api/storage/public-objects//objects/uploads/0b677feb-5150-486b-b6f5-785735d7cf0c", "quantity": 1, "modelCode": "OXY-DVS-3160", "unitPrice": "30000.00"}]	0	2026-07-16 21:29:29.509056+00	2026-07-16 21:29:29.509056+00	\N	\N	\N	\N
\.


--
-- Data for Name: quote_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quote_requests (id, full_name, email, phone, company, job_title, project_type, city, application_area, notes, status, created_at, updated_at) FROM stdin;
1	Test Kullanıcı	test@test.com	5551234567	\N	\N	\N	\N	\N	\N	new	2026-05-16 20:42:48.778667+00	2026-05-16 20:42:48.778667+00
3	Test	t@t.com	555	\N	\N	\N	\N	\N	\N	resolved	2026-05-16 20:43:10.842625+00	2026-05-26 10:32:02.467+00
2	Test2	t2@t.com	555	\N	\N	\N	\N	\N	\N	in_progress	2026-05-16 20:42:48.902125+00	2026-05-26 10:32:03.961+00
4	KqG0nK	KqG0nK@example.com	5551234567	\N	\N	Yatak Başı Ünitesi	İzmir	Hastane	i18n test	new	2026-08-11 10:08:33.112194+00	2026-08-11 10:08:33.112194+00
\.


--
-- Data for Name: references; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."references" (id, title, project_type, capacity, city, image_url, category, created_at, updated_at, logo_url, show_in_marquee, locales) FROM stdin;
104	NAHCİVAN DİAGNOSTİKA MERKEZ 	Hastane	\N	NAHCİVAN	\N	Hastane	2026-08-03 15:14:28.977709+00	2026-08-27 07:24:11.557+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
50	Van Bahçesaray Devlet Hastanesi	Hastane	23 Yatak	Van	/api/storage/public-objects/objects/uploads/f98b5f63-e527-4fca-8f07-ab045c0d476c	Hastane	2026-08-03 12:43:26.525651+00	2026-08-27 07:22:14.411+00	\N	f	{"ar": {"capacity": "23 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "23 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "23 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "23 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "23 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "23 camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "23 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "23 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "23 Letti", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "23 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "23 койки", "category": "Больница", "projectType": "Больница"}}
58	Ankara Elmadağ Devlet Hastanesi	Hastane	75 Yatak	Ankara	/api/storage/public-objects/objects/uploads/9152a559-881b-41e0-b9f6-a0a8d1532599	Hastane	2026-08-03 12:59:21.29476+00	2026-08-27 07:22:14.415+00	\N	f	{"ar": {"capacity": "75 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "75 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "75 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "75 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "75 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "75 camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "75 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "75 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "75 Letti", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "75 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "75 коек", "category": "Больница", "projectType": "Больница"}}
62	ANKARA DEVLET HASTANESİ ACİL SERVİS BİNASI	Hastane	\N	Ankara	\N	Hastane	2026-08-03 13:23:19.217448+00	2026-08-27 07:22:14.418+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
69	Çankırı Atkaracalar Devlet Hastanesi	Hastane	30 Yatak	Çankırı	/api/storage/public-objects/objects/uploads/02c69ba1-7ca0-45de-a5df-6517dedd92b5	Hastane	2026-08-03 13:30:59.72783+00	2026-08-27 07:22:14.421+00	\N	f	{"ar": {"capacity": "30 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "30 Yatak", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "30 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "30 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "30 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "30 camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "30 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "30 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "30 Letti", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "30 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "30 коек", "category": "Больница", "projectType": "Больница"}}
74	NİGDE ÇOCUK HASTANESİ	Hastane	\N	Niğde	\N	Hastane	2026-08-03 14:43:25.322736+00	2026-08-27 07:22:14.424+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "болница", "projectType": "болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
105	 AZERBAYCAN AZERSU LABORATUVARLARI	Hastane	\N	\N	\N	Hastane	2026-08-03 15:14:49.899681+00	2026-08-27 07:24:14.028+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
112	Erciyes Üniversitesi Pilot Aşı, Üretim ve Ar-Ge Merkezi Laboratuvarı	Hastane	\N	Kayseri	/api/storage/public-objects/objects/uploads/b4219b6e-209d-40c4-9736-2bac65e90663	Hastane	2026-08-04 08:25:10.454166+00	2026-08-27 07:25:07.822+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
87	ANKARA G.A.T.A. EĞİTİM ARAŞTIRMA HASTANESİ	Hastane	\N	Ankara	/api/storage/public-objects/objects/uploads/34bf0b0d-3382-4602-8e80-589277b4e7e1	Hastane	2026-08-03 14:56:07.296838+00	2026-08-27 07:22:27.241+00	/api/storage/public-objects/objects/uploads/22ec7417-4d83-452d-aa11-7b9bcf1bcdbd	t	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
92	ÖZEL HİSAR GÜN HASTANESİ	Hastane	\N	Antalya	\N	Hastane	2026-08-03 15:01:37.295351+00	2026-08-27 07:23:03.528+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
99	Manisa Alaşehir Ağız ve Diş Sağlığı Merkezi	Hastane	20 Ünit	Manisa	/api/storage/public-objects/objects/uploads/8910af2a-e93d-4f07-a224-fda20b3d7474	Hastane	2026-08-03 15:09:03.436065+00	2026-08-27 07:23:22.347+00	\N	f	{"ar": {"capacity": "20 وحدة", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "20 Ünit", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "20 единици", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "20 Einheiten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "20 Units", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "20 unidades", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "20 واحد", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "20 unités", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "20 Unità", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "20 ერთეული", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "20 модулей", "category": "Больница", "projectType": "Больница"}}
59	BOLU ALMAN KIZILHAÇ HASTANESİ	Hastane	\N	Bolu	\N	Hastane	2026-08-03 13:02:42.809703+00	2026-08-27 07:25:10.293+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
9	MALATYA İNÖNÜ ÜNİVERSİTESİ DİŞ HEKİMLİĞİ FAKULTESİ	Hastane	245 Ünit	Malatya	/api/storage/public-objects/objects/uploads/568ce401-cb21-41d3-a34d-81ae383af3a7	Hastane	2026-08-03 12:23:06.614343+00	2026-08-27 07:25:10.3+00	/api/storage/public-objects/objects/uploads/a382a7cd-1a27-43e3-b815-3ec91e559c94	t	{"ar": {"capacity": "245 وحدة", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "245 Ünit", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "245 единици", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "245 Einheiten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "245 Units", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "245 Unidades", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "245 واحد", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "245 unités", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "245 Unità", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "245 ერთეული", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "245 Унит", "category": "Больница", "projectType": "Больница"}}
13	ÇANAKKALE BİGA ADSM	Hastane	30 Ünit	ÇANAKKALE	/api/storage/public-objects/objects/uploads/a72600a9-227d-4e75-8c93-28b92ed2c0cb	Hastane	2026-08-03 12:29:29.407567+00	2026-08-27 07:25:10.308+00	\N	f	{"ar": {"capacity": "30 وحدة", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "30 Ünit", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "30 единици", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "30 Einheiten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "30 Units", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "30 unidades", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "30 یونیت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "30 unités", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "30 Unità", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "30 ერთეული", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "30 единиц", "category": "Больница", "projectType": "Больница"}}
15	Isparta Ağız ve Diş Sağlığı Merkezi	Hastane	40 Ünit	ISPARTA	/api/storage/public-objects/objects/uploads/2ce89207-61a0-4049-8f10-49febb076bb0	Hastane	2026-08-03 12:32:29.817558+00	2026-08-27 07:25:10.316+00	\N	f	{"ar": {"capacity": "40 وحدة", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "40 Ünit", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "40 юнита", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "40 Einheiten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "40 Units", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "40 Unidades", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "40 یونیت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "40 unités", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "40 Unità", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "40 ერთეული", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "40 юнитов", "category": "Больница", "projectType": "Больница"}}
17	Manisa - Turgutlu Ağız ve Diş Sağlığı Merkezi	Hastane	23 Ünit	Manisa	/api/storage/public-objects/objects/uploads/4f759020-1147-47fc-86ca-08523543fdeb	Hastane	2026-08-03 12:34:03.025282+00	2026-08-27 07:25:10.322+00	\N	f	{"ar": {"capacity": "23 وحدة", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "23 Ünit", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "23 единици", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "23 Einheiten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "23 Units", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "23 Unidades", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "23 یونیت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "23 Unités", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "23 Unità", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "23 ერთეული", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "23 Units", "category": "Больница", "projectType": "Больница"}}
18	Akhisar Ağız ve Diş Sağlığı Merkezi	Hastane	23 Ünit	Manisa	/api/storage/public-objects/objects/uploads/ad76902f-0b2c-4f98-b3d7-0c48987d98bf	Hastane	2026-08-03 12:35:32.101758+00	2026-08-27 07:25:10.324+00	\N	f	{"ar": {"capacity": "23 وحدة", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "23 Ünit", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "23 юнита", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "23 Einheiten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "23 Units", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "23 Unidades", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "23 یونیت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "23 unités", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "23 Unità", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "23 ერთეული", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "23 единицы", "category": "Больница", "projectType": "Больница"}}
83	DR. EDİP SOMUNOĞLU PASİNLER DEVLET HASTANESİ	Hastane	\N	ERZURUM	/api/storage/public-objects/objects/uploads/9095e42f-8777-4ae5-b5e9-f954c0c44151	Hastane	2026-08-03 14:50:59.841289+00	2026-08-27 07:22:17.078+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
51	Konya Kulu Devlet Hastanesi	Hastane	75 Yatak	Konya	/api/storage/public-objects/objects/uploads/a78d91c7-4b1e-47f5-8fd1-eecd19720af7	Hastane	2026-08-03 12:46:18.933981+00	2026-08-27 07:25:10.34+00	\N	f	{"ar": {"capacity": "75 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "75 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "75 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "75 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "75 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "75 camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "75 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "75 Lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "75 Letti", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "75 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "75 коек", "category": "Больница", "projectType": "Больница"}}
52	Karabük Eskihisar Devlet Hastanesi	Hastane	25 Yatak	Karabük	/api/storage/public-objects/objects/uploads/3d334ba4-2787-4442-923c-1a260b471ba6	Hastane	2026-08-03 12:47:37.869079+00	2026-08-27 07:25:10.349+00	\N	f	{"ar": {"capacity": "25 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "25 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "25 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "25 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "25 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "25 camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "25 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "25 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "25 Letti", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "25 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "25 коек", "category": "Больница", "projectType": "Больница"}}
53	Karabük Yenice Devlet Hastanesi	Hastane	30 Yatak	Karabük	/api/storage/public-objects/objects/uploads/45d40177-e7f4-4d9e-a4fd-69d64eb2a981	Hastane	2026-08-03 12:48:45.726437+00	2026-08-27 07:25:10.353+00	\N	f	{"ar": {"capacity": "30 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "30 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "30 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "30 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "30 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "30 Camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "30 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "30 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "30 Letti", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "30 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "30 коек", "category": "Больница", "projectType": "Больница"}}
54	Konya Güney Sınır Devlet Hastanesi	Hastane	10 Yatak	Konya	/api/storage/public-objects/objects/uploads/da4aa253-0eb4-47fd-8bb1-e90e229e43fb	Hastane	2026-08-03 12:50:30.226118+00	2026-08-27 07:25:10.357+00	\N	f	{"ar": {"capacity": "10 أسرة", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "10 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "10 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "10 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "10 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "10 Camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "10 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "10 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "10 Letti", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "10 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "10 коек", "category": "Больница", "projectType": "Больница"}}
55	Bolu İzzet Baysal Devlet Hastanesi	Hastane	200 Yatak	Bolu	/api/storage/public-objects/objects/uploads/63216777-4d74-4cde-b9d7-e6bb6d41f3af	Hastane	2026-08-03 12:52:24.203041+00	2026-08-27 07:25:10.362+00	\N	f	{"ar": {"capacity": "200 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "200 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "200 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "200 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "200 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "200 camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "200 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "200 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "200 Posti letto", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "200 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "200 коек", "category": "Больница", "projectType": "Больница"}}
61	Bolu İzzet Baysal Devlet Hastanesi	Hastane	200 Yatak	Bolu	/api/storage/public-objects/objects/uploads/9231d873-11c5-434c-95e6-de917442d051	Hastane	2026-08-03 13:05:36.18488+00	2026-08-27 07:25:10.369+00	/api/storage/public-objects/objects/uploads/14b8fe9a-15ed-4330-a630-c1583ac8950c	t	{"ar": {"capacity": "200 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "200 Yatak", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "200 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "200 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "200 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "200 camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "200 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "200 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "200 Posti Letto", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "200 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "200 коек", "category": "Больница", "projectType": "Больница"}}
57	Samsun Terme Devlet Hastanesi	Hastane	100 Yatak	Samsun	/api/storage/public-objects/objects/uploads/a54d003c-3baa-4812-a740-cc10be3bc076	Hastane	2026-08-03 12:58:20.742315+00	2026-08-27 07:25:10.372+00	/api/storage/public-objects/objects/uploads/fbdb3787-eed7-47bb-a4e8-60f924ddf675	t	{"ar": {"capacity": "100 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "100 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "100 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "100 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "100 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "100 camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "100 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "100 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "100 Letti", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "100 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "100 коек", "category": "Больница", "projectType": "Больница"}}
64	YOZGAT SORGUN DEVLET HASTANESİ	Hastane	\N	Yozgat	/api/storage/public-objects/objects/uploads/2031606a-837a-4b1b-99bf-ab070bd6f473	Hastane	2026-08-03 13:26:00.418932+00	2026-08-27 07:25:10.377+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
65	YOZGAT YERKÖY DEVLET HASTANESİ	Hastane	50 Yatak	Yozgat	/api/storage/public-objects/objects/uploads/e4f0f744-c9e9-456a-b518-f5fff3c10837	Hastane	2026-08-03 13:26:49.612312+00	2026-08-27 07:25:10.38+00	\N	f	{"ar": {"capacity": "50 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "50 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "50 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "50 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "50 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "50 Camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "50 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "50 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "50 Letti", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "50 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "50 коек", "category": "Больница", "projectType": "Больница"}}
66	Çorum Ortaköy Devlet Hastanesi	Hastane	30 Yatak	Çorum	/api/storage/public-objects/objects/uploads/d6c27633-c10f-449e-8413-577ceaec0263	Hastane	2026-08-03 13:27:41.285517+00	2026-08-27 07:25:10.382+00	\N	f	{"ar": {"capacity": "30 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "30 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "30 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "30 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "30 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "30 Camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "30 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "30 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "30 Letti", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "30 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "30 коек", "category": "Больница", "projectType": "Больница"}}
67	Çorum Osmancık Devlet Hastanesi	Hastane	50 Yatak	Çorum	/api/storage/public-objects/objects/uploads/1da597c6-b7aa-40c1-847b-2e758aa97bc8	Hastane	2026-08-03 13:28:34.48124+00	2026-08-27 07:25:10.384+00	\N	f	{"ar": {"capacity": "50 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "50 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "50 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "50 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "50 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "50 camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "50 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "50 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "50 posti letto", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "50 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "50 коек", "category": "Больница", "projectType": "Больница"}}
68	Çankırı Kurşunlu Devlet Hastanesi	Hastane	30 Yatak	Çankırı	/api/storage/public-objects/objects/uploads/6dc0611b-5441-4cad-8b1d-f37cc5100c73	Hastane	2026-08-03 13:29:53.152343+00	2026-08-27 07:25:10.387+00	\N	f	{"ar": {"capacity": "30 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "30 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "30 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "30 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "30 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "30 camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "30 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "30 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "30 letti", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "30 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "30 коек", "category": "Больница", "projectType": "Больница"}}
71	TEKİRDAĞ ÇERKEZKÖY DEVLET HASTANESİ	Hastane	50 Yatak	Tekirdağ	/api/storage/public-objects/objects/uploads/e4466dd0-bee8-4806-a29e-c42394195924	Hastane	2026-08-03 13:33:02.2333+00	2026-08-27 07:25:10.393+00	\N	f	{"ar": {"capacity": "50 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "50 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "50 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "50 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "50 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "50 Camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "50 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "50 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "50 Letti", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "50 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "50 коек", "category": "Больница", "projectType": "Больница"}}
72	TEKİRDAĞ MALKARA DEVLET HASTANESİ	Hastane	100 Yatak	Tekirdağ	/api/storage/public-objects/objects/uploads/2e77700e-557a-41b5-9792-ad1126cbb026	Hastane	2026-08-03 14:41:45.368872+00	2026-08-27 07:25:10.396+00	\N	f	{"ar": {"capacity": "100 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "100 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "100 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "100 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "100 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "100 Camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "100 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "100 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "100 Letti", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "100 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "100 коек", "category": "Больница", "projectType": "Больница"}}
73	AKSARAY KADIN DOGUM VE ÇOCUK HASTANESİ	Hastane	\N	Aksaray	/api/storage/public-objects/objects/uploads/ca06881d-b94f-4b19-9f5c-041a125d7ca6	Hastane	2026-08-03 14:42:43.668328+00	2026-08-27 07:25:10.398+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
75	ADANA YUMURTALIK DEVLET HASTANESİ	Hastane	\N	Adana	\N	Hastane	2026-08-03 14:43:56.130081+00	2026-08-27 07:25:10.401+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
76	ARTVİN ARDANUÇ DEVLET HASTANESİ	Hastane	\N	Artvin	/api/storage/public-objects/objects/uploads/2abca883-5bd1-45f9-a9f3-5b8c611f0f3c	Hastane	2026-08-03 14:44:30.109186+00	2026-08-27 07:25:10.404+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
12	İZMİR BERGAMA ADSM	Hastane	30 Ünit	İZMİR	/api/storage/public-objects/objects/uploads/c5cb738a-bb70-4c7a-8e6a-32263aadb8c0	Hastane	2026-08-03 12:28:23.814555+00	2026-08-27 07:22:14.406+00	\N	f	{"ar": {"capacity": "30 وحدة", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "30 Ünit", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "30 единици", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "30 Einheiten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "30 Units", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "30 Unidades", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "30 واحد", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "30 Unités", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "30 Unità", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "30 ერთეული", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "30 единиц", "category": "Больница", "projectType": "Больница"}}
78	ISPARTA EĞİRDİR KEMİK HASTALIKLARI HASTANESİ	Hastane	\N	Isparta	/api/storage/public-objects/objects/uploads/940a4000-2b42-4159-b691-0d834cfda4bd	Hastane	2026-08-03 14:45:59.613076+00	2026-08-27 07:25:10.411+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
79	AKDENİZ ÜNÜVERSİTESİ AMELİYATHANE PENDANTLARI	Hastane	\N	Antalya	/api/storage/public-objects/objects/uploads/9f065308-4863-4ac7-bef9-2014e53e631c	Hastane	2026-08-03 14:47:20.902758+00	2026-08-27 07:25:10.416+00	/api/storage/public-objects/objects/uploads/57554b5c-48e2-4496-83e9-bf1172de0d89	t	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
80	BALIKESİR DEVLET HASTANESİ YOĞUN BAKIM ÜNİTELERİ	Hastane	\N	Balıkesir	/api/storage/public-objects/objects/uploads/644689f3-4e42-44bd-b6ac-affbad2c5d7b	Hastane	2026-08-03 14:48:08.001693+00	2026-08-27 07:25:10.419+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
82	BURSA DÖRT ÇELİK ÇOCUK HASTANESİ	Hastane	200 Yatak	Bursa	/api/storage/public-objects/objects/uploads/36c2d04b-0389-4a8a-9725-385dcfbe2088	Hastane	2026-08-03 14:50:04.510145+00	2026-08-27 07:25:10.421+00	\N	f	{"ar": {"capacity": "200 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "200 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "200 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "200 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "200 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "200 camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "200 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "200 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "200 Letti", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "200 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "200 коек", "category": "Больница", "projectType": "Больница"}}
84	AYDIN ATATÜRK DEVLET HASTANESİ YATAKLI SERVİS	Hastane	\N	Aydın	/api/storage/public-objects/objects/uploads/8efa9299-3925-463a-8ede-e2806c161c80	Hastane	2026-08-03 14:51:50.576634+00	2026-08-27 07:22:19.615+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
85	KARASU DEVLET HASTANESİ YOĞUN BAKIM ÜNİTELERİ	Hastane	75 Yatak	Sakarya	/api/storage/public-objects/objects/uploads/965c959b-0178-4c5e-8960-709bd3aae0f3	Hastane	2026-08-03 14:53:03.69739+00	2026-08-27 07:22:22.275+00	\N	f	{"ar": {"capacity": "75 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "75 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "75 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "75 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "75 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "75 Camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "75 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "75 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "75 Letti", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "75 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "75 коек", "category": "Больница", "projectType": "Больница"}}
86	TEPECİK EĞİTİM VE ARAŞTIRMA HASTANESİ	Hastane	\N	İzmir	/api/storage/public-objects/objects/uploads/457c6ae4-b3c4-42a4-81ca-4eea04286b07	Hastane	2026-08-03 14:53:46.752031+00	2026-08-27 07:22:24.794+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
88	Ankara Refik Saydam Hıfzıssıhha Enstitüsü Laboratuvarları	Hastane	\N	Ankara	/api/storage/public-objects/objects/uploads/2774963e-1558-4180-b0fa-2a0376067671	Hastane	2026-08-03 14:57:43.826581+00	2026-08-27 07:22:30.204+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
89	HARRAN ÜNİVERSİTESİ ZIRAAT FAKÜLTESİ	Hastane	\N	Urfa	/api/storage/public-objects/objects/uploads/916feb01-886c-45bc-bc2d-d9202763d156	Hastane	2026-08-03 14:58:24.48832+00	2026-08-27 07:22:32.621+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
90	ÖZEL ANKARA İNCEK  FİZİK TEDAVİ VE REHABİLİTASYON HASTANESİ 	Hastane	\N	Ankara	/api/storage/public-objects/objects/uploads/950a332e-29e4-485d-b3fd-679a2bca3fa8	Hastane	2026-08-03 14:59:43.824664+00	2026-08-27 07:22:35.207+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
91	Özel Oldcitydent Ağız ve Diş Sağlığı Hastanesi	Hastane	\N	Eskişehir	\N	Hastane	2026-08-03 15:01:05.6135+00	2026-08-27 07:23:00.957+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
93	ÖZEL DERMAN HASTANESİ	Hastane	\N	Diyarbakır	/api/storage/public-objects/objects/uploads/9c39a107-1e4e-4b5b-ba58-5d6a0fde95aa	Hastane	2026-08-03 15:02:12.581946+00	2026-08-27 07:23:06.065+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
94	ÖZEL VENİ VİDİ HASTANESİ	Hastane	\N	Diyarbakır	/api/storage/public-objects/objects/uploads/79222235-66c6-4c27-b3ab-b4d88d8b9773	Hastane	2026-08-03 15:03:02.899238+00	2026-08-27 07:23:08.892+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
95	ÖZEL VAN DİVAN HASTANESİ	Hastane	\N	Van	/api/storage/public-objects/objects/uploads/e564741b-7b27-4e9f-9e23-e82124e95f83	Hastane	2026-08-03 15:03:33.126455+00	2026-08-27 07:23:11.485+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "болница", "projectType": "болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
96	ÖZEL DORUK TIP MERKEZİ	Hastane	\N	Ankara	/api/storage/public-objects/objects/uploads/f1dd2ee8-7cd9-4016-b5d6-88b4db636386	Hastane	2026-08-03 15:04:33.059725+00	2026-08-27 07:23:14.117+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
97	İZMİR 9 EYLÜL ÜNİVERSİTESİ ANESTEZİ YOĞUNBAKIM ÜNİTELERİ 	Hastane	\N	İzmir	/api/storage/public-objects/objects/uploads/0fcf28c3-cdcf-4cf0-9dc7-535c9e15de03	Hastane	2026-08-03 15:06:39.630551+00	2026-08-27 07:23:16.705+00	/api/storage/public-objects/objects/uploads/0fed1b20-b19e-4620-9d3f-29f54a1f805b	t	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
98	EDİRNE UZUNKÖPRÜ 400 YATAKLI DEVLET HASTANESİ İNŞ 	Hastane	400 Yatak	Edirne	/api/storage/public-objects/objects/uploads/9dbc6719-f801-4a17-9715-9b1951da7e29	Hastane	2026-08-03 15:07:30.267935+00	2026-08-27 07:23:19.533+00	\N	f	{"ar": {"capacity": "400 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "400 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "400 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "400 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "400 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "400 Camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "400 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "400 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "400 Letti", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "400 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "400 коек", "category": "Больница", "projectType": "Больница"}}
100	BİNGÖL ÜNİVERSİTESİ DİŞ HEKİMLİĞİ FAKULTESİ	Hastane	105 Ünit	Bingöl	/api/storage/public-objects/objects/uploads/93f47b7a-2480-40ae-bfe7-f1087812f408	Hastane	2026-08-03 15:09:50.250013+00	2026-08-27 07:24:00.879+00	\N	f	{"ar": {"capacity": "105 وحدة", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "105 Ünit", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "105 юнита", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "105 Einheiten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "105 Units", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "105 Unidades", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "105 یونیت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "105 unités", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "105 Unità", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "105 ერთეული", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "105 единиц", "category": "Больница", "projectType": "Больница"}}
101	BAKÜ NERİMANOV 50 YATAKLI LUX HOSPİTAL 	Hastane	50 Yatak	Bakü	/api/storage/public-objects/objects/uploads/329a38cd-6881-4ca2-9bfc-8ce540117a24	Hastane	2026-08-03 15:11:31.25808+00	2026-08-27 07:24:03.884+00	\N	t	{"ar": {"capacity": "50 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "50 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "50 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "50 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "50 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "50 camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "50 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "50 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "50 Letti", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "50 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "50 коек", "category": "Больница", "projectType": "Больница"}}
102	BAKÜ DAHİLİ İŞLER NAZIRLIĞI HOSPİTALİ 380 YATAK	Hastane	380 Yatak	Bakü	/api/storage/public-objects/objects/uploads/d8090d6f-107e-4a28-bac9-090bc317517d	Hastane	2026-08-03 15:12:56.223952+00	2026-08-27 07:24:06.761+00	\N	f	{"ar": {"capacity": "380 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "380 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "380 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "380 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "380 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "380 Camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "380 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "380 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "380 Letti", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "380 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "380 коек", "category": "Больница", "projectType": "Больница"}}
103	BAKÜ 20 YANVAR DİAGNOSTİKA MERKEZ	Hastane	\N	Bakü	\N	Hastane	2026-08-03 15:13:13.775101+00	2026-08-27 07:24:09.158+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
106	ARNAVUTLUK TİRAN ASKERİ HASTANESİ 	Hastane	\N	\N	/api/storage/public-objects/objects/uploads/6e00025c-32c4-497f-b745-f8e58bdb2afd	Hastane	2026-08-03 15:15:21.867289+00	2026-08-27 07:24:16.511+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
107	ARNAVUTLUK TİRAN TÜRK HASTANESİ 	Hastane	\N	\N	/api/storage/public-objects/objects/uploads/816c7ff5-d29c-4d90-a935-9bb31fc309a1	Hastane	2026-08-03 15:15:51.704968+00	2026-08-27 07:24:19.452+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
108	LÜBNAN SAİDA TÜRK HASTANESİ 	Hastane	\N	\N	/api/storage/public-objects/objects/uploads/8a4cbdad-1096-4e7a-838a-24d182338f32	Hastane	2026-08-03 15:16:14.386956+00	2026-08-27 07:24:21.995+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
109	İZMİR BUCA ADSM İNŞAATI 70 ÜNİT	Hastane	70 Ünit	İzmir	/api/storage/public-objects/objects/uploads/84599783-c7c2-46ac-b7ac-caea5b3e70b6	Hastane	2026-08-04 08:00:49.310789+00	2026-08-27 07:24:24.927+00	\N	f	{"ar": {"capacity": "70 وحدة", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "70 Ünit", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "70 единици", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "70 Einheiten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "70 Units", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "70 Unidades", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "70 یونیت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "70 unités", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "70 Unità", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "70 ერთეული", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "70 единиц", "category": "Больница", "projectType": "Больница"}}
110	ANKARA MAMAK ADSM 50 ÜNİT	Hastane	50 Ünit	Ankara	/api/storage/public-objects/objects/uploads/7b05593a-546a-483d-9fd1-4d2ffa109501	Hastane	2026-08-04 08:04:58.651312+00	2026-08-27 07:25:02.591+00	\N	f	{"ar": {"capacity": "50 وحدة", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "50 Ünit", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "50 юнита", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "50 Einheiten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "50 Units", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "50 Unidades", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "50 یونیت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "50 unités", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "50 Unità", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "50 ერთეული", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "50 единиц", "category": "Больница", "projectType": "Больница"}}
111	Diyarbakır Bismil ADSM	Hastane	20 Ünit	Diyarbakır	/api/storage/public-objects/objects/uploads/e2a5f672-89bd-4b25-89ab-3ab8c8accf97	Hastane	2026-08-04 08:12:53.841096+00	2026-08-27 07:25:05.209+00	\N	f	{"ar": {"capacity": "20 وحدة", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "20 Ünit", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "20 единици", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "20 Einheiten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "20 Units", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "20 Unidades", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "20 یونیت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "20 unités", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "20 Unità", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "20 ერთეული", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "20 units", "category": "Больница", "projectType": "Больница"}}
81	CUMHURİYET ÜNİVERSİTESİ KARDİYOLOJİ YOĞUN BAKIM ACİL SERVİS	Hastane	\N	Sivas	/api/storage/public-objects/objects/uploads/729f0901-0e16-4d8b-81a9-f35784ce0fc3	Hastane	2026-08-03 14:49:06.955105+00	2026-08-27 07:25:07.827+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
113	Düzce Üniversitesi Kadın Doğum Ve Çocuk Acil Hastanesi	Hastane	\N	Düzce	/api/storage/public-objects/objects/uploads/fb8fb4a7-027b-47bf-91e4-e93b886119a5	Hastane	2026-08-04 08:26:16.707828+00	2026-08-27 07:25:10.289+00	\N	f	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
10	UŞAK ÜNİVERSİTESİ DİŞ HEKİMLİĞİ FAKULTESİ	Hastane	120 Ünit	UŞAK	/api/storage/public-objects/objects/uploads/d92fa03d-3787-4138-8b59-fd1efa67979c	Hastane	2026-08-03 12:25:10.667296+00	2026-08-27 07:25:10.296+00	/api/storage/public-objects/objects/uploads/625d8f39-9404-4cb1-96e3-9b270006c59d	t	{"ar": {"capacity": "120 وحدة", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "120 Ünit", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "120 юнита", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "120 Einheiten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "120 Units", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "120 Unidades", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "120 واحد", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "120 unités", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "120 Unità", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "120 ერთეული", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "120 единиц", "category": "Больница", "projectType": "Больница"}}
11	İZMİR DEMOKRASİ ÜNİVERSİTESİ DİŞ HEKİMLİĞİ FAKÜLTESİ 	Hastane	\N	İZMİR	/api/storage/public-objects/objects/uploads/312079ee-ceb1-4ee3-8353-ca243acf5983	Hastane	2026-08-03 12:26:35.719848+00	2026-08-27 07:25:10.305+00	/api/storage/public-objects/objects/uploads/a569a4d5-d8d8-4450-9102-61b3ba39ab70	t	{"ar": {"capacity": "", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "", "category": "Больница", "projectType": "Больница"}}
14	Karaman Ağız ve Diş Sağlığı Merkezi	Hastane	30 Ünit	Karaman	/api/storage/public-objects/objects/uploads/89b1357a-f5f6-4fdc-b111-e93740afc850	Hastane	2026-08-03 12:31:10.052991+00	2026-08-27 07:25:10.311+00	\N	f	{"ar": {"capacity": "30 وحدة", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "30 Ünit", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "30 единици", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "30 Einheiten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "30 Units", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "30 Unidades", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "30 یونیت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "30 unités", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "30 Unità", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "30 ერთეული", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "30 единиц", "category": "Больница", "projectType": "Больница"}}
16	Manisa - Salihli Ağız ve Diş Sağlığı Hastanesi	Hastane	30 Ünit	Manisa	/api/storage/public-objects/objects/uploads/6b339b20-3b1b-4d7f-b6d6-48d01f1882b2	Hastane	2026-08-03 12:33:23.130405+00	2026-08-27 07:25:10.319+00	\N	f	{"ar": {"capacity": "30 وحدة", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "30 Vahid", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "30 юнита", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "30 Einheiten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "30 Units", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "30 Unidades", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "30 یونیت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "30 unités", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "30 Unità", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "30 ერთეული", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "30 мест", "category": "Больница", "projectType": "Больница"}}
19	Yozgat Ağız ve Diş Sağlığı Merkezi	Hastane	30 Ünit	Yozgat	/api/storage/public-objects/objects/uploads/00e36fd6-08a5-459d-9573-56426d357379	Hastane	2026-08-03 12:36:26.376865+00	2026-08-27 07:25:10.328+00	\N	f	{"ar": {"capacity": "30 وحدة", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "30 Ünit", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "30 юнита", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "30 Einheiten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "30 Units", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "30 Unidades", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "30 واحد", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "30 unités", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "30 Unità", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "30 ერთეული", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "30 юнитов", "category": "Больница", "projectType": "Больница"}}
56	MANİSA AKHİSAR DEVLET HASTANESİ	Hastane	200 Yatak	Manisa	/api/storage/public-objects/objects/uploads/5f623b9b-4986-437c-8f2e-94ad392cfee0	Hastane	2026-08-03 12:56:23.585395+00	2026-08-27 07:25:10.359+00	\N	f	{"ar": {"capacity": "200 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "200 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "200 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "200 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "200 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "200 camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "۲۰۰ تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "200 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "200 Letti", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "200 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "200 коек", "category": "Больница", "projectType": "Больница"}}
60	Bolu İzzet Baysal Devlet Hastanesi Ek Binası	Hastane	50 Yatak	Bolu	/api/storage/public-objects/objects/uploads/858c63d5-dddd-4edf-8a40-9b9ddf16be99	Hastane	2026-08-03 13:04:44.714049+00	2026-08-27 07:25:10.366+00	\N	f	{"ar": {"capacity": "50 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "50 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "50 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "50 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "50 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "50 camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "50 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "50 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "50 Letti", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "50 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "50 коек", "category": "Больница", "projectType": "Больница"}}
63	MARDİN DEVLET HASTANESİ 	Hastane	150 Yatak	Mardin	/api/storage/public-objects/objects/uploads/01a4e98b-39a8-4724-92df-bde8df23a28b	Hastane	2026-08-03 13:25:10.67589+00	2026-08-27 07:25:10.374+00	/api/storage/public-objects/objects/uploads/5e85f80f-b47b-457c-b56b-19c49c8d32d9	t	{"ar": {"capacity": "150 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "150 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "150 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "150 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "150 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "150 Camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "150 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "150 Lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "150 Letti", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "150 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "150 коек", "category": "Больница", "projectType": "Больница"}}
70	ÇANKIRI ÇERKEŞ DEVLET HASTANESİ	Hastane	 30 Yatak	Çankırı	/api/storage/public-objects/objects/uploads/ab8f5dd2-1932-485a-b2aa-15681641b705	Hastane	2026-08-03 13:31:50.80846+00	2026-08-27 07:25:10.39+00	\N	f	{"ar": {"capacity": " 30 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": " 30 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": " 30 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": " 30 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": " 30 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": " 30 Camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": " 30 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": " 30 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": " 30 Posti letto", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": " 30 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": " 30 коек", "category": "Больница", "projectType": "Больница"}}
77	BİLECİK BOZÜYÜK DEVLET HASTANESİ	Hastane	100 Yatak	Bilecik	/api/storage/public-objects/objects/uploads/e53fd76e-e102-434d-9730-f8a564e2959d	Hastane	2026-08-03 14:45:20.144396+00	2026-08-27 07:25:10.408+00	\N	f	{"ar": {"capacity": "100 سرير", "category": "مستشفى", "projectType": "مستشفى"}, "az": {"capacity": "100 Yataq", "category": "Xəstəxana", "projectType": "Xəstəxana"}, "bg": {"capacity": "100 легла", "category": "Болница", "projectType": "Болница"}, "de": {"capacity": "100 Betten", "category": "Krankenhaus", "projectType": "Krankenhaus"}, "en": {"capacity": "100 Beds", "category": "Hospital", "projectType": "Hospital"}, "es": {"capacity": "100 Camas", "category": "Hospital", "projectType": "Hospital"}, "fa": {"capacity": "100 تخت", "category": "بیمارستان", "projectType": "بیمارستان"}, "fr": {"capacity": "100 lits", "category": "Hôpital", "projectType": "Hôpital"}, "it": {"capacity": "100 Letti", "category": "Ospedale", "projectType": "Ospedale"}, "ka": {"capacity": "100 საწოლი", "category": "საავადმყოფო", "projectType": "საავადმყოფო"}, "ru": {"capacity": "100 коек", "category": "Больница", "projectType": "Больница"}}
\.


--
-- Data for Name: serial_sequences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.serial_sequences (id, product_code, date_key, last_seq, created_at) FROM stdin;
1	OXY-GP-2000	262605	2	2026-05-26 22:16:41.234825+00
3	SRV	2026	6	2026-05-27 05:31:46.661298+00
9	DTM-02	262306	24	2026-06-23 12:32:05.883782+00
\.


--
-- Data for Name: service_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_records (id, device_id, service_date, service_type, service_personnel, description, work_hours, notes, photo_urls, report_no, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: service_report_email_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_report_email_logs (id, report_id, sent_to, sent_by, status, error_message, sent_at) FROM stdin;
1	2	yusufdeliceoglu@gmail.com	admin@oxymed.com.tr	success	\N	2026-05-27 06:32:00.546142+00
2	4	deliceogluyusuf@gmail.com	admin@oxymed.com.tr	success	\N	2026-05-27 07:20:03.578198+00
3	6	ercandeliceoglu@hotmail.com	admin@oxymed.com.tr	success	\N	2026-05-28 19:21:05.934938+00
\.


--
-- Data for Name: service_report_parts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_report_parts (id, report_id, part_name, part_code, quantity, condition, created_at) FROM stdin;
2	1	TEST	TEST	2	Yeni	2026-05-27 05:31:59.952113+00
9	5	TEST	TES01	1	Yeni	2026-05-27 08:11:26.349659+00
10	5	TEST2	TES021	3	Yeni	2026-05-27 08:11:26.349659+00
\.


--
-- Data for Name: service_report_photos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_report_photos (id, report_id, url, caption, sort_order, created_at) FROM stdin;
6	4	/api/storage/public-objects//objects/uploads/f6421e85-ceb2-4965-9deb-737063440a92		0	2026-05-27 07:44:27.396964+00
13	5	/api/storage/public-objects//objects/uploads/61210573-61a4-4fcd-a01a-074507ef9358		0	2026-05-27 08:11:26.323304+00
14	5	/api/storage/public-objects//objects/uploads/24ad910e-752d-4e13-b2b5-4feec11cfada		1	2026-05-27 08:11:26.323304+00
15	5	/api/storage/public-objects//objects/uploads/c7b3879c-db63-464d-b011-040c33b8e687		2	2026-05-27 08:11:26.323304+00
16	5	/api/storage/public-objects//objects/uploads/db2ecba4-30f7-491f-9344-8211a15ad33f		3	2026-05-27 08:11:26.323304+00
18	6	/api/storage/public-objects/objects/uploads/2b0ed1b2-acd2-4e6b-972f-ac9f7517e62e		0	2026-05-28 19:20:13.037807+00
\.


--
-- Data for Name: service_report_signatures; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_report_signatures (id, report_id, role, signer_name, image_data_url, signed_at) FROM stdin;
4	1	personel	TEST	data:image/png;base64,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	2026-05-27 05:31:59.941117+00
5	1	sorumlu	TEST	data:image/png;base64,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	2026-05-27 05:31:59.941117+00
6	1	yetkili	TEST	data:image/png;base64,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	2026-05-27 05:31:59.941117+00
22	4	personel	TEST	data:image/png;base64,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	2026-05-27 07:44:27.40506+00
23	4	sorumlu	TEST	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABkCAYAAAA8AQ3AAAALbUlEQVR4AeydX4wbRx3HfzPenculJdC0IYl9aSktERCQjqaJ7bu0QhSpjYBK0D4gHnhA4gmJPKAKXkBC4gVUIah4hAeeIiFagdSKqi3QNsnZuaNABQi1oS1JzvY1BEgEyZ3X3p3+Zu11fTlfzo7t9f75nna83vHuzG8+v/VHs2vfnST8gAAIgEBMCEBYMUkUwgQBECCCsHAWgAAIxIYAhBWbVA0fKFoAgbgTgLDinkHEDwIpIgBhpSjZGCoIxJ0AhBX3DCJ+EOhFIKF1EFZCE4thgUASCUBYScwqxgQCCSUAYSU0sRgWCCSRAITVK6uoAwEQiCQBCCuSaUFQIAACvQhAWL2ooA4EQCCSBCCsSKYFQYVHAD3FiQCEFadsIVYQSDkBCCvlJwCGDwJxIgBhxSlbiBUEUk5gSGGlnB6GDwIgECoBCCtU3OgMBEBgGAIQ1jD0cCwIgECoBCCsUHHHujMEDwITJwBhTTwFCAAEQKBfAhBWv6SwHwiAwMQJQFgTTwECAIHoEYhqRBBWVDODuEAABDYQgLA2IEEFCIBAVAlAWFHNDOICARDYQADC2oBk+Aq0AAIgMB4CENZ4uKJVEACBMRCAsMYAFU2CAAiMhwCENR6uaDUtBDDOUAlAWKHiRmcgAALDEICwhqGHY0EABEIlAGGFihudgQAIDENgssIaJnIcCwIgkDoCEFbqUo4Bg0B8CUBY8c0dIgeB1BGAsFKX8kkNGP2CwPAEIKzhGaIFEACBkAhAWCGBRjcgAALDE4CwhmeIFkAABNYTGNsWhDU2tGgYBEBg1AQgrFETRXsgAAJjIwBhjQ1tihved+QrKlvQdq44UFG5omfvPvxmislh6FsQgLC2ADSBl2PXZSabd1X2sKdyeU9l81p57s9ICBI8kkGK2V1YmTtZXNpiedHO4o+4DgsIdAhAWB0UeDIoAbW34Bm5ZISUJDLsJilIyE4zmp8NUojM3nwQL9yKUNN0zMzStt2ef4mrsIAA8XkBCiAwGAGWlMtFkxSi15Eu6YZTKYnGgMWplIUzdfN+9pYXyMt04LnyftOfmsn/tVd/qEsPAQgrPbkeeqQsjZaoiNadN83GTY8ZQQXFrZTVDXf25vNnnGopY+RFnlh/P0vLAyrH98b2zZ+54fYjdiDCGYzAuhNvsEOxd1oIBJd+PN53zxe+enN187cOz6K8Cy88zq+NfHFqC3eZ9snVbwUzLiJBwvPuVtmitrJzy4SfVBF49wRM1bAx2H4I8GzGv0dF3Zd+WhtV/Z1nQcKtLn26n3aG3cdZKX/Qn3GRe4ZM96ZBQRyWzqlcUdt7Dl8wVSjJJwBhJT/HfY3Q2l2o23y5ZQQQFKJ196i0k9Hfd6pl6VQWP0oT+OF+93P/Qgr3dHf3IpPZZWZcdMfBe7rr8Tx5BGItrOSlI/wR2XvnGkZQ0hJKkNgYgNDkePqnfGkm6Vz5Wxt3CL9mbXmxwPEI6eqT3TMu1VSvWNkiLhPDT0loPUJYoaGOVkc8o2oaUQmpre7IPCHqRgadslwWVCt/tXufqDxfWynfZ2ZcnqT/BPe4pKCczZeJlM1/LSpxIo7REYCwRscyFi1Z+/KOERXPqDLdAWuXmkZSzeWFbd31cXjePF+6tXWPi2+vccBmnqiE/ImVKzi8iSVBBCCsBCXzekOxs/m6yha09KTdvZ9uCteIqrFSWlffvU8knvcRhJGW9ui1YFdJwjZytnOFF4I6rONNQMY7fER/PQJWtuBf9pk3rRBSUdc9dH5ja19Uby+suyS8XntxeK1RK33YjMsjnjO2AxYkHmBZe+1NrGJMAMKKcfJ6hW5nC57N93CMpKQQ6y/7zAGaWqKqlRKd+2albNmOfsIM2S9CCMMkk83X/G08xJJAok/aWGZkk6DtvQVPZYvavOmuLUZQpph6fl8KcU0bWjc7vyrjVJMtqu6hX/lX+ZiZbZGg/wf1GSH3qFxB0+75h4M6rKNGYPN4IKzN2UTqFSHZQ9eaqB2hqTalvWlWPI9ytWOtPm3esI3qkjKVaS3Ocuk9jrIf9DzRbDEQpCzv1yo7x58utmrwGA8CMh5hIkryNEuo9eG9+SysZ9Hav9xjSUmnuijp7J8/B3JtAm+9/FyztmDbdvMJJtmqFPoWxZfPdNcnvtiqwGPUCUBYUc9QOz6nVmYJbfEXEKpl5LPNa7PVlX8uHWtUS8KjYLZFpNa2HVczxUubHYP66BDACR6dXIwoEjTTD4FmZcGmhvdkZ19N723Ntu7FbKsDJXpPIKzo5QQRhUTAuXD6Ub585tt/2gu6VGv2cSs7fzLYxjpaBCCsaOUD0UyAgFMpZzwtXw26lsKbt3OFK8E21tEhAGFFJxeIZIIEmtVTs443dTQIQZDY7l8ifmT2Q0FdBNepCwnCSl3KMeBNCdRefNZcInok6sE+6vL069tnDn032MZ6sgQgrMnyR+8RJMA35LeRFr/yQxNETW19Z2pm/i/+Nh4mSgDCmih+dB5VAk514fOOZR0k84U3DlJr72Mqm+/MvLgKywQIpFlYE8CNLmNF4OyJPzrVEs+xaM2PW0hlfj2KsgeP+Nt4CJ0AhBU6cnQYNwJ8X2va88Sf/LhZX0qoE2rv/M/9bTyESgDCChU3OosrgWZt4Z6pjPXNTvzS+7KayZ/vbONJKAQgrFAwo5NJExhF//87d+IHTmVqF7fVurOl5Yw9UzT3tbZzHZYQCEBYIUBGF0ki8OJFvkSUnhb/NqMSmpT/JdOZQ18w2yjjJQBhjZcvWk8ogWZ14TaW1nNmeIIEKW09ae3N/9Jso4yPgBxf02gZBJJNgKX1oK2bjwVffZBSPmLNFPBPXceY9r6ENcb+0TQIxJrAlerS445wZ6n9DxKlFrtUbq4Z60FFOHgIK8LJQWgxIVBZfNWplNlVZG7Ac9A6Y76vtX3P3Gd4A8sICUBYI4SJptJNoLFcMv/T8YxPQRA1M/ppOzv3Y38bDyMhAGGNBGOCGsFQhiLAnyDul574dtCIEPrrKju3FGxjPRwBCGs4fjgaBDYQWKstfM+py0Oa2n8YUOh77WzxMu+Y4YJlCAIQ1hDwcCgIbErg4qk/NCplFpRufV9L0A47V3Boz+wHNj0GL2xJAMLaEhF2AIEbJ8A3428TWj9rWhAkpJLT/6DsoX1me/IlfhFAWPHLGSKOGYF6tXw0I91v+L/PIyhjS+sNuvOB3YSfgQlAWAMjwwEgMDiB1fOLP7Rk5ktGWkKTbdevLkNag3OEsAZnhiNA4IYIrJ4/edxIyxwsBFm+tA4c2Gm2UfojAGH1x6nHXqgCgcEJGGllPP2IOdKX1qUdNYK0DI6+CoTVFybsBAKjI7BaKz/VkRaRso206JM3j66H5LYkkzs0jAwEokvASMsi97OktRYsLZWrr0Q32uhEBmFFJxeIJLoExhLZ1criM5Yk8/uG5l78TXauiL/0sAVpCGsLQHgZBMZJ4Opy+TcZ4RSJhMszrV0srYt08OB2wk9PAhBWTyyoBIHwCKwuv3Jaeo1P8dWhx9K61V5R5+juozvCiyA+PUFY8ckVIk0wgbXa0suS9ENEuiWt1ctnIa2NCQ9DWBt7RQ0IgMAGAvXq6eeFKx/mF/hGvH7f1NVLZ2imOM3bWNoEIKw2CKxAIAoE6isLz5DQj3Is5uPD9ytNv6dd+MoD8/AXCMvHgAcQiA4BZ7n8FGXkxzmi/3LJK1X/He3M454Ww4CwGAKW0RFAS6Mh4Jw79TeW1n2CxEVu8ZCali9BWkQQFp8NWEAgigR8aWlxRBO9zfHN+tK6/cgt/Dy1C4SV2tRj4HEgUK+eek2Sez9Ly3ypdNZ23V/EIe5xxQhhjYss2gWBERGoVxZfl1LMcXPnhCaX19FYJhAFhDUB6OgSBAYlUD+/8IZTKd3hVEsPDXpskvZ/BwAA//9ov2OvAAAABklEQVQDAD/ZI/Z2Ba1uAAAAAElFTkSuQmCC	2026-05-27 07:44:27.40506+00
24	4	yetkili	TEST	data:image/png;base64,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	2026-05-27 07:44:27.40506+00
34	5	personel	YUUSF	data:image/png;base64,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	2026-05-27 08:11:26.335927+00
35	5	sorumlu	ERC	data:image/png;base64,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	2026-05-27 08:11:26.335927+00
36	5	yetkili	OMR	data:image/png;base64,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	2026-05-27 08:11:26.335927+00
40	6	personel	Ercan	data:image/png;base64,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	2026-05-28 19:20:13.044525+00
41	6	sorumlu		data:image/png;base64,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F6ybPo5QpxrVSsdnslk26N69ju7dBebGcn3DPW8NjQzdpWlI60lVLXUW+zPXGPYT6HG2jzYOpF8cz8RIoP9xHWNhJjVrKCu4o9ZRrlWfzYv81d9D320B43DwEQX96Shl1kjq6CQ/9dWdSDi7GvXtzpfF//b/1E8axukmkMkXALHVPv5XFO2WwaNkEKCFNWY7eG8GIyqTv7o18hy3ybrNta7QTLxBobaeMMdGD+DsW8ZlUHye24QAnO1CrLqRXLSbROflZBOgwhqjfeBg/7NHI/mW1L5xtAbTT/5m0xLPO4vl9/sWwIi+CcThbPddOEYcmYC/x/7IYmczgcS63lBGR0S1/LXZJJC8Wpv1qLTdGs3cweQxmKYS0cIKsDXVYunWAMVRVAAEHGwWNuf08TsCEEcRJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJEACJBAvgf8DfwmMKrPiVqUAAAAASUVORK5CYII=	2026-05-28 19:20:13.044525+00
42	6	yetkili		data:image/png;base64,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	2026-05-28 19:20:13.044525+00
\.


--
-- Data for Name: service_reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_reports (id, report_no, device_id, service_date, service_time, service_type, priority, status, service_code, report_data_json, pdf_url, verification_token, created_by, created_at, updated_at) FROM stdin;
1	OXM-SRV-2026-000001	1	2026-05-27	00:33	periyodik_bakim	normal	taslak	\N	{"email": "yusufdeliceoglu@gmail.com", "notes": "TESTTESTTESTTESTTEST", "alarms": {"dusuk_vakum": "var", "termik_hata": "mudahale_edildi", "yuksek_sicaklik": "kontrol_edildi", "bakim_suresi_doldu": "var"}, "contact": "TEST", "hmiModel": "TEST", "location": "TEST", "minVacuum": "-0", "plcSystem": "TEST", "department": "TEST", "deviceType": "Gaz Merkezi Paneli", "operations": ["TEST", "Alarm sistemi test edildi", "Yağ filtreleri değiştirildi"], "pump1Hours": "1250", "pump2Hours": "1250", "pump3Hours": "1250", "pump4Hours": "3000", "testResult": "Başarılı", "deviceModel": "OXY-GP-2000", "hospitalName": "Ege Hastanesi", "testDuration": "30DK", "contactPerson": "TEST", "commissionDate": "TEST", "productionDate": "TEST", "totalWorkHours": "6750", "warrantyStatus": "Devam Ediyor", "maintenanceNote": "", "testDescription": "", "workingPressure": "-12", "customOperations": ["TEST"], "estimatedDuration": "", "maintenancePeriod": "6AY", "lastMaintenanceDate": "", "nextMaintenanceDate": "", "recommendedMaintenanceDate": "", "recommendedMaintenanceType": ""}	\N	2d04562a-3136-4f0c-9cc8-c04a15d43379	TEST	2026-05-27 05:31:46.705037+00	2026-05-27 05:31:59.923+00
2	OXM-SRV-2026-000002	2	2026-05-27	\N	periyodik_bakim	normal	tamamlandi	\N	{"email": "yusufdeliceoglu@gmail.com", "notes": "", "alarms": {}, "contact": "", "hmiModel": "", "location": "", "minVacuum": "", "plcSystem": "", "department": "", "deviceType": "Gaz Merkezi Paneli", "operations": [], "pump1Hours": "", "pump2Hours": "", "pump3Hours": "", "pump4Hours": "", "testResult": "", "deviceModel": "OXY-GP-2000", "hospitalName": "Ege Hastanesi", "testDuration": "", "contactPerson": "", "commissionDate": "", "productionDate": "", "totalWorkHours": "", "warrantyStatus": "", "maintenanceNote": "", "testDescription": "", "workingPressure": "", "customOperations": [], "estimatedDuration": "", "maintenancePeriod": "", "lastMaintenanceDate": "", "nextMaintenanceDate": "", "recommendedMaintenanceDate": "25.08.2026", "recommendedMaintenanceType": ""}	\N	caf68251-46d7-4f75-997d-98ec849adecd	\N	2026-05-27 06:22:35.86817+00	2026-05-27 06:34:41.672+00
3	OXM-SRV-2026-000003	2	2026-05-27	\N	periyodik_bakim	normal	taslak	\N	{"email": "", "notes": "", "alarms": {}, "contact": "", "hmiModel": "", "location": "", "minVacuum": "", "plcSystem": "", "department": "", "deviceType": "Gaz Merkezi Paneli", "operations": [], "pump1Hours": "", "pump2Hours": "", "pump3Hours": "", "pump4Hours": "", "testResult": "", "deviceModel": "OXY-GP-2000", "hospitalName": "Ege Hastanesi", "testDuration": "", "contactPerson": "", "commissionDate": "", "productionDate": "", "totalWorkHours": "", "warrantyStatus": "", "maintenanceNote": "", "testDescription": "", "workingPressure": "", "customOperations": [], "estimatedDuration": "", "maintenancePeriod": "", "lastMaintenanceDate": "", "nextMaintenanceDate": "", "recommendedMaintenanceDate": "22.01.2027", "recommendedMaintenanceType": ""}	/api/storage/public-objects//objects/uploads/9c1bd2d3-04b4-4e86-8eef-4d1bf1d224e9	7b739349-2140-4faf-9f39-082fcd89c350	\N	2026-05-27 07:16:45.252325+00	2026-05-27 07:16:54.357+00
4	OXM-SRV-2026-000004	2	2026-05-27	\N	periyodik_bakim	normal	tamamlandi	\N	{"email": "", "notes": "", "alarms": {"dusuk_vakum": "var", "termik_hata": "mudahale_edildi", "yuksek_sicaklik": "kontrol_edildi", "bakim_suresi_doldu": "var"}, "contact": "", "hmiModel": "", "location": "", "minVacuum": "", "plcSystem": "", "department": "", "deviceType": "Gaz Merkezi Paneli", "operations": ["Vakum filtresi kontrol edildi", "Vakum sensörü kalibrasyonu kontrol edildi", "HMI ekran kontrolü yapıldı", "Elektrik bağlantıları kontrol edildi", "Yağ filtreleri değiştirildi", "Yağ seviyesi kontrol edildi"], "pump1Hours": "", "pump2Hours": "", "pump3Hours": "", "pump4Hours": "", "testResult": "", "deviceModel": "OXY-GP-2000", "hospitalName": "Ege Hastanesi", "testDuration": "", "contactPerson": "", "commissionDate": "", "productionDate": "", "totalWorkHours": "", "warrantyStatus": "", "maintenanceNote": "testtesttesttesttest testtesttesttesttesttesttesttesttest testtest testtesttest testtest test", "testDescription": "", "workingPressure": "", "customOperations": [], "estimatedDuration": "1 Saat", "maintenancePeriod": "", "lastMaintenanceDate": "", "nextMaintenanceDate": "", "recommendedMaintenanceDate": "27.05.2027", "recommendedMaintenanceType": "Genel Kontrol"}	/api/storage/public-objects//objects/uploads/a9e86051-89c3-4218-83f0-d411af64f34c	3506e0ef-4330-4c21-b9b6-608e05a7c9ba	\N	2026-05-27 07:19:03.097568+00	2026-05-27 07:44:27.386+00
5	OXM-SRV-2026-000005	2	2026-05-27	\N	periyodik_bakim	normal	tamamlandi	\N	{"email": "TEST", "notes": "TEST BAŞARILI ONAYLIYORUZ", "alarms": {"dusuk_vakum": "var", "sensor_hata": "mudahale_edildi", "termik_hata": "var", "yuksek_sicaklik": "kontrol_edildi"}, "contact": "TEST", "hmiModel": "", "location": "TEST", "minVacuum": "-0", "plcSystem": "", "department": "TEST", "deviceType": "Gaz Merkezi Paneli", "operations": ["TEST"], "pump1Hours": "1250", "pump2Hours": "1250", "pump3Hours": "1240", "pump4Hours": "1250", "testResult": "Başarılı", "deviceModel": "OXY-GP-2000", "hospitalName": "Ege Hastanesi", "testDuration": "30dk", "contactPerson": "MEHMET", "commissionDate": "15.05.2024", "productionDate": "15.03.2024", "totalWorkHours": "4990", "warrantyStatus": "Devam Ediyor", "maintenanceNote": "ONAY", "testDescription": "test", "workingPressure": "-72", "customOperations": ["TEST"], "estimatedDuration": "2 Saat", "maintenancePeriod": "6 AY", "lastMaintenanceDate": "15.08.2024", "nextMaintenanceDate": "", "recommendedMaintenanceDate": "23.11.2026", "recommendedMaintenanceType": "Periyodik Bakım"}	\N	f89f40d0-aee6-4c26-9865-be73708ad195	\N	2026-05-27 07:48:34.705702+00	2026-05-27 08:11:26.3+00
6	OXM-SRV-2026-000006	2	2026-05-28	22:17	periyodik_bakim	normal	taslak	\N	{"email": "", "notes": "", "alarms": {"acil_ariza": "var", "dusuk_vakum": "var", "sensor_hata": "var"}, "contact": "", "hmiModel": "", "location": "", "minVacuum": "-1", "plcSystem": "", "department": "", "deviceType": "Gaz Merkezi Paneli", "operations": ["Test", "Alarm sistemi test edildi", "Kaçak kontrolü yapıldı"], "pump1Hours": "1000", "pump2Hours": "1200", "pump3Hours": "", "pump4Hours": "", "testResult": "Başarılı", "deviceModel": "OXY-GP-2000", "hospitalName": "Ege Hastanesi", "testDuration": "30dk", "contactPerson": "", "commissionDate": "", "productionDate": "", "totalWorkHours": "2200", "warrantyStatus": "", "maintenanceNote": "", "testDescription": "", "workingPressure": "-72", "customOperations": ["Test"], "estimatedDuration": "", "maintenancePeriod": "", "lastMaintenanceDate": "", "nextMaintenanceDate": "", "recommendedMaintenanceDate": "24.11.2026", "recommendedMaintenanceType": "Periyodik Bakım"}	\N	c18c5b01-a16e-46a4-96b1-be75b4759746	\N	2026-05-28 19:19:56.550619+00	2026-05-28 19:20:13.017+00
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_settings (id, setting_key, setting_value, created_at, updated_at) FROM stdin;
7	yearsExperience	15+	2026-05-16 20:08:37.570173+00	2026-05-16 20:08:37.570173+00
8	completedProjects	200+	2026-05-16 20:08:37.570173+00	2026-05-16 20:08:37.570173+00
9	exportCountries	50+	2026-05-16 20:08:37.570173+00	2026-05-16 20:08:37.570173+00
10	customerSatisfaction	100%	2026-05-16 20:08:37.570173+00	2026-05-16 20:08:37.570173+00
2	email	info@oxymedmedical.com	2026-05-16 20:08:37.570173+00	2026-05-25 22:03:19.357+00
12	stats_years	27	2026-05-25 22:04:07.384255+00	2026-05-25 22:04:07.384255+00
29	dvp_card_image	/api/storage/public-objects/objects/uploads/283fd90b-7501-4087-a217-2685b27ec45d	2026-08-03 09:20:09.231817+00	2026-08-03 09:20:09.231817+00
11	news_categories	["Genel","Sektör Haberleri","Ürün Haberleri","Duyuru","Blog"]	2026-05-16 23:37:21.539066+00	2026-05-27 09:43:02.44+00
23	dvs_img_0	/api/storage/public-objects/objects/uploads/5fdfeba8-d420-4de0-8b9e-9dd8f034f7c3	2026-08-03 07:48:37.436935+00	2026-08-03 07:48:37.436935+00
25	dvs_img_1	/api/storage/public-objects/objects/uploads/c55724f8-7812-427a-9f42-6be68603ceff	2026-08-03 07:48:37.454419+00	2026-08-03 07:48:37.454419+00
24	dvs_img_2	/api/storage/public-objects/objects/uploads/9c8a1b07-f565-48f0-af13-c2f383b370fb	2026-08-03 07:48:37.451433+00	2026-08-03 07:48:37.451433+00
13	ams_hero_eyebrow	OXYMED MEDİKAL	2026-06-21 09:55:37.905266+00	2026-08-03 10:50:22.765+00
17	ams_hero_title	AMALGAM SEPARATÖRÜ	2026-06-21 09:55:37.924674+00	2026-08-03 10:50:22.97+00
14	ams_hero_desc1	Oxymed Amalgam Separatörü, diş ünitelerinden aspirasyon sistemleriyle oluşan amalgam partiküllerini etkin şekilde ayırarak çevreye karışmasını önler.	2026-06-21 09:55:37.922195+00	2026-08-03 10:50:23.169+00
16	ams_hero_desc2	Hijyenik, dayanıklı ve verimli tasarımıyla güvenli bir çalışma ortamı sunar.	2026-06-21 09:55:37.923521+00	2026-08-03 10:50:23.293+00
15	ams_hero_image	/api/storage/public-objects/objects/uploads/d49d51b5-2d43-472c-ae6e-47bf439be942	2026-06-21 09:55:37.922633+00	2026-08-03 10:50:23.309+00
45	ams_hero_mobile_image	/api/storage/public-objects/objects/uploads/dcb72de2-7a43-46f9-b2c0-ae2e5e01acd6	2026-08-03 10:50:23.310053+00	2026-08-03 10:50:23.310053+00
20	dvs_hero_title	MERKEZİ DENTAL VAKUM SİSTEMİ	2026-08-03 07:32:07.030945+00	2026-08-17 21:35:07.553085+00
30	dvp_hero_eyebrow	OXYMED MEDİKAL	2026-08-03 09:21:28.987861+00	2026-08-17 21:21:30.127075+00
33	dvp_hero_desc2	Yüksek performanslı motor yapısı ve dayanıklı tasarımıyla uzun ömürlü, ekonomik ve hijyenik bir kullanım sağlar.	2026-08-03 09:21:29.193689+00	2026-08-03 09:49:29.038+00
34	dvp_hero_image	/api/storage/public-objects/objects/uploads/1aed5fd6-fc8d-4ee5-a432-b8a5a8858d4b	2026-08-03 09:21:29.201686+00	2026-08-03 09:49:29.041+00
35	dvp_hero_mobile_image	/api/storage/public-objects/objects/uploads/1aed5fd6-fc8d-4ee5-a432-b8a5a8858d4b	2026-08-03 09:21:29.202168+00	2026-08-03 09:49:29.041+00
36	dvp_drawing_image	/api/storage/public-objects/objects/uploads/4e9fc889-2278-4882-bc3c-c40f515916df	2026-08-03 10:19:43.350436+00	2026-08-03 10:19:43.350436+00
37	dvp_img_0	/api/storage/public-objects/objects/uploads/2a66cd7d-eaa8-4439-b210-511122d25c4c	2026-08-03 10:25:01.333166+00	2026-08-03 10:25:01.333166+00
38	dvp_img_1	/api/storage/public-objects/objects/uploads/196cad09-f6bc-4ebb-8223-7cbe919dd576	2026-08-03 10:25:01.344487+00	2026-08-03 10:25:01.344487+00
18	dvs_hero_eyebrow	OXY-DVS SERIES	2026-08-03 07:32:07.008652+00	2026-08-03 08:52:46.363+00
22	dvs_hero_desc1	Dental kliniklerin merkezi vakum ihtiyacını karşılamak için tasarlanmış, yüksek performanslı ve güvenilir sistem çözümü.	2026-08-03 07:32:07.033811+00	2026-08-03 08:52:46.379+00
21	dvs_hero_image	/api/storage/public-objects/objects/uploads/2276bbeb-5346-48b0-93d9-49b3e095fdce	2026-08-03 07:32:07.033038+00	2026-08-03 08:52:46.381+00
19	dvs_hero_desc2	Kesintisiz vakum gücü, sessiz çalışma ve uzun ömürlü yapı ile sağlık tesislerinde maksimum verimlilik sağlar.	2026-08-03 07:32:07.026504+00	2026-08-03 08:52:46.381+00
26	dvs_hero_mobile_image	/api/storage/public-objects/objects/uploads/ddb09734-ffcb-49af-9154-2c1284d63561	2026-08-03 08:52:46.587296+00	2026-08-03 08:52:46.587296+00
6	youtube	https://www.youtube.com/@oxymedmedical	2026-05-16 20:08:37.570173+00	2026-08-03 08:56:48.615+00
4	linkedin	https://www.linkedin.com/in/oxymed-medikal-750285426/	2026-05-16 20:08:37.570173+00	2026-08-03 08:57:05.787+00
5	instagram	https://www.instagram.com/oxymedmedical	2026-05-16 20:08:37.570173+00	2026-08-03 08:57:29.255+00
27	dvs_drawing_image	/api/storage/public-objects/objects/uploads/e9428f10-827f-41e1-a878-f195e82e53ae	2026-08-03 09:05:02.516225+00	2026-08-03 09:05:02.516225+00
28	dvs_card_image	/api/storage/public-objects/objects/uploads/a1fb9457-0860-4b65-a5b6-69fdd2154def	2026-08-03 09:07:22.979945+00	2026-08-03 09:07:22.979945+00
39	dvp_img_2	/api/storage/public-objects/objects/uploads/0819d6f6-efc4-4bb0-9ef4-31e499e31260	2026-08-03 10:25:01.346407+00	2026-08-03 10:25:01.346407+00
40	ams_img_0	/api/storage/public-objects/objects/uploads/2b3b2faf-5367-48cd-a183-fff599b67eb4	2026-08-03 10:41:03.834749+00	2026-08-03 10:41:03.834749+00
41	ams_img_1	/api/storage/public-objects/objects/uploads/90504a0e-5b68-477d-b2da-b7bae5fd5dd9	2026-08-03 10:41:03.865728+00	2026-08-03 10:41:03.865728+00
42	ams_img_2	/api/storage/public-objects/objects/uploads/6496d287-3a3d-4c43-88a5-15a69b662774	2026-08-03 10:41:03.875209+00	2026-08-03 10:41:03.875209+00
43	ams_img_3	/api/storage/public-objects/objects/uploads/0ef775d6-95ba-4d46-9d86-46158025bddd	2026-08-03 10:41:03.877425+00	2026-08-03 10:41:03.877425+00
44	ams_drawing_image	/api/storage/public-objects/objects/uploads/9f6ea014-0797-42e8-b594-a7f2557054a1	2026-08-03 10:50:20.454536+00	2026-08-03 10:50:20.454536+00
46	ams_card_image	/api/storage/public-objects/objects/uploads/64a70581-27d4-4551-9e65-d5d95e14c22d	2026-08-03 10:52:43.600026+00	2026-08-03 10:52:43.600026+00
47	gcp_card_image	/api/storage/public-objects/objects/uploads/da197172-f8d5-4e5d-9ece-cc689645f5a2	2026-08-03 10:56:46.240781+00	2026-08-03 10:56:46.240781+00
48	gcp_hero	{"title":"Medikal Gaz Kat Kontrol Panosu","description":"Medikal gaz sistemleriniz için güvenli, akıllı ve kesintisiz kontrol. 3+ farklı medikal gazın merkezi yönetimi tek panelde."}	2026-08-03 11:09:36.921817+00	2026-08-03 11:09:54.682+00
49	gcp_hero_image	/api/storage/public-objects/objects/uploads/82219002-aa11-4a43-a04c-a44bb0a5dda2	2026-08-03 11:28:57.142006+00	2026-08-03 11:28:57.142006+00
50	gcp_drawing_image	/api/storage/public-objects/objects/uploads/ecb210c3-06c7-4241-855c-8e4a972f7b87	2026-08-03 11:33:16.873498+00	2026-08-03 11:33:28.942+00
1	phone	+90 312 385 4912	2026-05-16 20:08:37.570173+00	2026-08-13 08:21:18.937+00
3	address	İvedik OSB. Süleyman Şah Cad. No:47 Yenimahalle / ANKARA	2026-05-16 20:08:37.570173+00	2026-08-13 08:22:00.403+00
54	hazirlayan_kisiler	[{"id":"487e4f9c-c278-45e9-a91c-93cf029401db","ad":"Ercan Deliceoğlu","telefon":"+90 543 205 1535","email":"info@oxymedmedical.com, info@batesmedical.com","imzaUrl":"/api/storage/public-objects/objects/uploads/a8e88cc6-f587-46d7-80cf-0aac1e302b88"}]	2026-08-13 08:23:21.780876+00	2026-08-13 08:23:21.780876+00
52	gcp_img_0	/api/storage/public-objects/objects/uploads/637cbeb8-aa50-41cb-bba9-cfb4f8ab594d	2026-08-03 11:34:02.221868+00	2026-08-03 12:06:12.274+00
51	gcp_img_1	/api/storage/public-objects/objects/uploads/2927e828-9953-45bb-9c62-1d1fa0cd568e	2026-08-03 11:34:02.220795+00	2026-08-03 12:06:12.284+00
53	gcp_img_2	/api/storage/public-objects/objects/uploads/f7fc933e-af6d-4516-a47e-61a1776e8f54	2026-08-03 11:34:02.223958+00	2026-08-03 12:06:12.473+00
55	dvs_specs_text	Ürün Adı::OXY-DVS Dental Vakum Sistemi\nVakum Kapasitesi::100 - 840 m³/h (isteğe bağlı)\nÇalışma Vakumu::-0,6 / -0,8 bar\nPompa Adedi::2 - 4 adet (yedekli)\nMotor Gücü::2,2 - 5,5 kW (pompa başı)\nGüç Beslemesi::380 VAC - 50 Hz\nSes Seviyesi::≤ 70 dB(A)\nManifold Malzemesi::Paslanmaz Çelik (AISI 304)\nBağlantı Çapı::DN40 - DN65\nÇalışma Sıcaklığı::-10 °C / +50 °C\nKoruma Sınıfı::IP54\nBoyutlar (YxGxD)::1300 x 600 x 1200 mm (örnek)	2026-08-14 11:03:18.724031+00	2026-08-14 11:03:18.724031+00
56	corporate_expert_team		2026-08-17 21:12:41.326937+00	2026-08-17 21:12:41.326937+00
57	corporate_completed_projects	75+	2026-08-17 21:12:41.326623+00	2026-08-17 21:12:41.326623+00
32	dvp_hero_title	MEDİKAL VAKUM SANTRALİ	2026-08-03 09:21:28.987989+00	2026-08-17 21:19:41.354262+00
31	dvp_hero_desc1	Oxymed Medikal Vakum Santrali, hastaneler ve sağlık tesisleri için güvenilir, sessiz ve kesintisiz merkezi vakum çözümü sunar.	2026-08-03 09:21:28.987646+00	2026-08-17 21:19:41.541945+00
58	corporate_years_experience	27+	2026-08-17 21:12:41.326356+00	2026-08-17 21:12:41.326356+00
59	corporate_export_countries	30+	2026-08-17 21:12:41.327494+00	2026-08-17 21:12:41.327494+00
\.


--
-- Data for Name: sliders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sliders (id, title, subtitle, description, image_url, cta_primary_text, cta_primary_href, cta_secondary_text, cta_secondary_href, sort_order, is_active, created_at, updated_at, show_catalog_button, overlay_enabled, overlay_color, overlay_from_opacity, overlay_to_opacity, text_color, cta_primary_bg, cta_secondary_bg, title_en, title_de, title_fr, title_it, title_ar, title_ru, title_fa, title_ka, title_bg, title_az, subtitle_en, subtitle_de, subtitle_fr, subtitle_it, subtitle_ar, subtitle_ru, subtitle_fa, subtitle_ka, subtitle_bg, subtitle_az, description_en, description_de, description_fr, description_it, description_ar, description_ru, description_fa, description_ka, description_bg, description_az, cta_primary_text_en, cta_primary_text_de, cta_primary_text_fr, cta_primary_text_it, cta_primary_text_ar, cta_primary_text_ru, cta_primary_text_fa, cta_primary_text_ka, cta_primary_text_bg, cta_primary_text_az, cta_secondary_text_en, cta_secondary_text_de, cta_secondary_text_fr, cta_secondary_text_it, cta_secondary_text_ar, cta_secondary_text_ru, cta_secondary_text_fa, cta_secondary_text_ka, cta_secondary_text_bg, cta_secondary_text_az, mobile_image_url, title_es, subtitle_es, description_es, cta_primary_text_es, cta_secondary_text_es) FROM stdin;
1	SAĞLIĞA HİZMET EDİYORUZ	MEDİKAL ÇÖZÜMLER	Hastaneler, klinikler ve sağlık merkezleri için yerli üretim, yüksek kalite medikal ekipman ve sistem çözümleri.	\N	Ürünleri İncele	/urunler	Teklif Al	/teklif	1	f	2026-05-16 20:08:37.547958+00	2026-08-17 14:16:40.83+00	f	t	#021423	92	12	#ffffff	#021423	rgba(255,255,255,0.06)	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2	YATAK BAŞI ÜNİTELERİ	YENİLİKÇİ TASARIM	Elektrik, medikal gaz ve data sistemlerini tek bir ünitede birleştiren modern ve ergonomik çözümler.	\N	Daha Fazla Bilgi	/urunler#yatak-basi-uniteleri	\N	\N	2	f	2026-05-16 20:08:37.547958+00	2026-08-17 14:16:46.122+00	f	t	#021423	92	12	#ffffff	#021423	rgba(255,255,255,0.06)	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
3	PENDANT SİSTEMLERİ	AMELİYATHANE & YOĞUN BAKIM	Ameliyathane ve yoğun bakım ünitelerine özel esnek, döner kollu medikal pendant çözümleri.	/api/storage/public-objects/objects/uploads/c34a0a11-63ab-4230-a833-226720ea32db	Pendant Sistemleri	/urunler#pendant-sistemleri	\N	\N	3	t	2026-05-16 20:08:37.547958+00	2026-08-17 20:08:50.134+00	f	f	#021423	77	0	#021423	#021423	rgba(255,255,255,0.06)	PENDANT SYSTEMS	PENDEL-SYSTEME	SYSTÈMES PENDANTS	SISTEMI PENDENTI	نُظُم الحَمَّالَات	ПОДВЕСНЫЕ СИСТЕМЫ	سیستم‌های آویز	მ::{PENDANT სისტემები}	ПЕНДАНТНИ СИСТЕМИ	PENDANT SİSTEMLƏRİ	OPERATING ROOM & INTENSIVE CARE	OPERATIONSZIMMER & INTENSIVSTATION	SALLE D’OPÉRATION & SOINS INTENSIFS	SALA OPERATORIA & TERAPIA INTENSIVA	غُرْفَةُ الْعَمَلِيَّات وَرِعَايَةٌ مُكثَّفَة	ОПЕРАЦИОННАЯ И ИНТЕНСИВНАЯ ТЕРАПИЯ	اتاق عمل و مراقبت‌های ویژه	ოპერაციული ოთახი და რეანიმაცია	ОПЕРАЦИОННА И ИНТЕНЗИВНА ГРИЖА	ƏMƏLİYYAT OTAĞI VƏ İNTENSİV BAKIM	Flexible medical pendant solutions with rotating arms specially designed for operating rooms and intensive care units.	Flexible medizinische Pendelsysteme mit Dreharme, speziell für Operationsräume und Intensivstationen entwickelt.	Solutions de pendants médicaux flexibles avec bras rotatifs, spécialement conçues pour les blocs opératoires et les unités de soins intensifs.	Soluzioni pendenti mediche flessibili con braccia rotanti, specificamente progettate per sale operatorie e unità di terapia intensiva.	حلول حَمَّالَات طبية مرنة ذات أذرع دوارة، مصممة خصيصًا لغرف العمليات ووحدات العناية المركزة.	Гибкие медицинские подвесные системы с поворотными кронштейнами, специально разработанные для операционных и отделений интенсивной терапии.	راه‌حل‌های انعطاف‌پذیر آویزهای پزشکی با بازوهای چرخان، مخصوص اتاق‌های عمل و بخش‌های مراقبت ویژه.	მორგებული, მოქნილი მედიკული პენდანტ სისტემები მბრუნავი ხელებით, ოპერაციული ოთახებისა და რეანიმაციის განყოფილებებისთვის.	Гъвкави медицински пендантни системи с въртящи се рамена, специално предназначени за операционни зали и интензивни отделения.	Əməliyyat otaqları və intensiv baxım bölmələri üçün xüsusi hazırlanmış, çevik və döner qol ilə təchiz olunmuş tibbi pendant həlləri.	Pendant Systems	Pendel-Systeme	Systèmes Pendants	Sistemi Pendenti	نُظُم الحَمَّالَات	Подвесные Системы	سیستم‌های آویز	PENDANT სისტემები	Пендантни Системи	Pendant Sistemləri	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: template_bom_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.template_bom_items (id, template_id, material_id, required_qty, created_at) FROM stdin;
\.


--
-- Data for Name: visitor_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.visitor_events (id, visitor_id, session_id, path, referrer_source, device_type, created_at, event_type, label) FROM stdin;
19	2195aeac-0311-454c-bafc-564bea3ece27	79c7760b-a269-4961-b4be-18c0d5b75561	/	direct	desktop	2026-07-06 14:07:44.746703+00	pageview	\N
20	2195aeac-0311-454c-bafc-564bea3ece27	79c7760b-a269-4961-b4be-18c0d5b75561	/urunler	internal	desktop	2026-07-06 14:07:52.542591+00	pageview	\N
21	2195aeac-0311-454c-bafc-564bea3ece27	79c7760b-a269-4961-b4be-18c0d5b75561	/kurumsal	internal	desktop	2026-07-06 14:07:55.324471+00	pageview	\N
22	2195aeac-0311-454c-bafc-564bea3ece27	79c7760b-a269-4961-b4be-18c0d5b75561	/servis	internal	desktop	2026-07-06 14:08:01.003282+00	pageview	\N
23	2195aeac-0311-454c-bafc-564bea3ece27	79c7760b-a269-4961-b4be-18c0d5b75561	/	internal	desktop	2026-07-06 14:08:04.966963+00	pageview	\N
24	2195aeac-0311-454c-bafc-564bea3ece27	79c7760b-a269-4961-b4be-18c0d5b75561	/haberler	internal	desktop	2026-07-06 14:08:07.590337+00	pageview	\N
25	2195aeac-0311-454c-bafc-564bea3ece27	79c7760b-a269-4961-b4be-18c0d5b75561	/haberler	internal	desktop	2026-07-06 14:08:08.529834+00	click	Teklif Al (Üst Menü)
26	2195aeac-0311-454c-bafc-564bea3ece27	79c7760b-a269-4961-b4be-18c0d5b75561	/teklif-al	internal	desktop	2026-07-06 14:08:08.787843+00	pageview	\N
27	2195aeac-0311-454c-bafc-564bea3ece27	79c7760b-a269-4961-b4be-18c0d5b75561	/	internal	desktop	2026-07-06 14:08:11.410119+00	pageview	\N
28	2195aeac-0311-454c-bafc-564bea3ece27	f141cb5b-6fd1-419c-ad9f-ec45ab048ea0	/	internal	desktop	2026-07-06 14:08:16.68672+00	pageview	\N
29	2195aeac-0311-454c-bafc-564bea3ece27	79c7760b-a269-4961-b4be-18c0d5b75561	/	internal	desktop	2026-07-06 14:10:06.767361+00	pageview	\N
30	0bda345b-df26-46ab-aec4-81cf36bb878e	0e098e42-9ef4-47ea-94aa-7305f49e405d	/	internal	desktop	2026-07-16 07:32:09.38458+00	pageview	\N
31	0bda345b-df26-46ab-aec4-81cf36bb878e	3706ec63-cfb0-460a-b1e8-805d60bfce54	/	internal	desktop	2026-07-16 07:37:38.542693+00	pageview	\N
32	f82e587f-3b7c-4c93-9026-a0e041b2df28	532397a1-bc4f-47c8-8c65-cadbf9c90419	/	direct	mobile	2026-07-16 09:41:17.53618+00	pageview	\N
33	0bda345b-df26-46ab-aec4-81cf36bb878e	bdd6e924-5766-4aab-ada1-d84e001a0fa2	/	internal	desktop	2026-07-16 10:09:37.343476+00	pageview	\N
34	0bda345b-df26-46ab-aec4-81cf36bb878e	8dd5beb7-d99d-40bc-9e1c-fbecd2515f8e	/	internal	desktop	2026-07-16 21:22:15.652542+00	pageview	\N
35	0bda345b-df26-46ab-aec4-81cf36bb878e	8dd5beb7-d99d-40bc-9e1c-fbecd2515f8e	/kurumsal	internal	desktop	2026-07-16 21:22:27.827324+00	pageview	\N
36	0bda345b-df26-46ab-aec4-81cf36bb878e	0544fe72-eaf6-428f-a9a3-ddd8aaa105cd	/	internal	desktop	2026-07-16 21:28:23.141068+00	pageview	\N
37	0bda345b-df26-46ab-aec4-81cf36bb878e	0544fe72-eaf6-428f-a9a3-ddd8aaa105cd	/	internal	desktop	2026-07-16 22:09:20.705156+00	pageview	\N
38	0bda345b-df26-46ab-aec4-81cf36bb878e	1f4bd0bf-24eb-45cb-84cb-bad566a139be	/	internal	desktop	2026-07-17 08:17:33.922777+00	pageview	\N
39	0bda345b-df26-46ab-aec4-81cf36bb878e	c7353ee8-f7cc-4f73-8383-bf3125c5296b	/	internal	desktop	2026-07-17 09:57:21.620486+00	pageview	\N
40	0bda345b-df26-46ab-aec4-81cf36bb878e	3afaacaf-5f4a-4d35-b220-54d91f42e133	/	internal	desktop	2026-07-17 10:19:49.698425+00	pageview	\N
41	0bda345b-df26-46ab-aec4-81cf36bb878e	1bebddaa-2583-42cd-93cf-2962c67e4147	/	internal	desktop	2026-07-17 10:36:40.0991+00	pageview	\N
42	0bda345b-df26-46ab-aec4-81cf36bb878e	1bebddaa-2583-42cd-93cf-2962c67e4147	/urunler	internal	desktop	2026-07-17 10:37:30.830277+00	pageview	\N
43	0bda345b-df26-46ab-aec4-81cf36bb878e	1bebddaa-2583-42cd-93cf-2962c67e4147	/urunler	internal	desktop	2026-07-17 10:37:39.391626+00	click	Ürün: Amalgam Separatörü
44	0bda345b-df26-46ab-aec4-81cf36bb878e	1bebddaa-2583-42cd-93cf-2962c67e4147	/urunler/amalgam-separator	internal	desktop	2026-07-17 10:37:39.421522+00	pageview	\N
45	0bda345b-df26-46ab-aec4-81cf36bb878e	1bebddaa-2583-42cd-93cf-2962c67e4147	/teklif-al	internal	desktop	2026-07-17 10:37:50.051517+00	pageview	\N
46	0bda345b-df26-46ab-aec4-81cf36bb878e	1bebddaa-2583-42cd-93cf-2962c67e4147	/urunler/amalgam-separator	internal	desktop	2026-07-17 10:37:51.423574+00	pageview	\N
47	0bda345b-df26-46ab-aec4-81cf36bb878e	5e1437a5-338d-4bac-9399-902e4d71c7a5	/	internal	desktop	2026-07-17 12:12:14.864198+00	pageview	\N
48	0bda345b-df26-46ab-aec4-81cf36bb878e	3c7513af-133e-4d34-8c1b-38789a7fe6be	/	internal	desktop	2026-07-17 12:46:48.343693+00	pageview	\N
49	0bda345b-df26-46ab-aec4-81cf36bb878e	bb26586e-477a-4356-95af-b965a3dbb7f9	/	internal	desktop	2026-07-17 12:56:51.95091+00	pageview	\N
50	0bda345b-df26-46ab-aec4-81cf36bb878e	d76a4bec-8050-46b5-ade3-d04efa14110c	/	internal	desktop	2026-07-17 13:13:25.208313+00	pageview	\N
51	0bda345b-df26-46ab-aec4-81cf36bb878e	b6c571dd-9870-4ef8-a6ab-afaa28fb3f51	/	internal	desktop	2026-07-17 20:14:51.340273+00	pageview	\N
52	0bda345b-df26-46ab-aec4-81cf36bb878e	b6c571dd-9870-4ef8-a6ab-afaa28fb3f51	/	internal	desktop	2026-07-17 20:54:30.796102+00	pageview	\N
53	0bda345b-df26-46ab-aec4-81cf36bb878e	b6c571dd-9870-4ef8-a6ab-afaa28fb3f51	/	internal	desktop	2026-07-17 20:55:24.020449+00	pageview	\N
54	0bda345b-df26-46ab-aec4-81cf36bb878e	8f7c791f-9fda-43ed-9969-f233773cf5d2	/	internal	desktop	2026-07-18 07:51:29.90863+00	pageview	\N
55	0bda345b-df26-46ab-aec4-81cf36bb878e	9015b0cf-ab13-47e6-af22-4109c43f94cd	/	internal	desktop	2026-07-18 13:46:17.422917+00	pageview	\N
56	0bda345b-df26-46ab-aec4-81cf36bb878e	c6aabed5-1356-48f9-a3e7-b20c61bdcfeb	/	internal	desktop	2026-07-19 19:58:47.287548+00	pageview	\N
57	0bda345b-df26-46ab-aec4-81cf36bb878e	c6aabed5-1356-48f9-a3e7-b20c61bdcfeb	/urunler	internal	desktop	2026-07-19 19:59:03.582824+00	pageview	\N
89	0bda345b-df26-46ab-aec4-81cf36bb878e	c6aabed5-1356-48f9-a3e7-b20c61bdcfeb	/	internal	desktop	2026-07-19 20:02:10.531822+00	pageview	\N
90	0bda345b-df26-46ab-aec4-81cf36bb878e	c6aabed5-1356-48f9-a3e7-b20c61bdcfeb	/kurumsal	internal	desktop	2026-07-19 20:02:15.392245+00	pageview	\N
91	0bda345b-df26-46ab-aec4-81cf36bb878e	c6aabed5-1356-48f9-a3e7-b20c61bdcfeb	/urunler	internal	desktop	2026-07-19 20:02:18.934995+00	pageview	\N
92	0bda345b-df26-46ab-aec4-81cf36bb878e	c6aabed5-1356-48f9-a3e7-b20c61bdcfeb	/referanslar	internal	desktop	2026-07-19 20:02:21.88818+00	pageview	\N
93	0bda345b-df26-46ab-aec4-81cf36bb878e	c6aabed5-1356-48f9-a3e7-b20c61bdcfeb	/haberler	internal	desktop	2026-07-19 20:02:23.216146+00	pageview	\N
94	0bda345b-df26-46ab-aec4-81cf36bb878e	c6aabed5-1356-48f9-a3e7-b20c61bdcfeb	/servis	internal	desktop	2026-07-19 20:02:37.102362+00	pageview	\N
95	0bda345b-df26-46ab-aec4-81cf36bb878e	c6aabed5-1356-48f9-a3e7-b20c61bdcfeb	/	internal	desktop	2026-07-19 20:02:41.191654+00	pageview	\N
96	0bda345b-df26-46ab-aec4-81cf36bb878e	c6aabed5-1356-48f9-a3e7-b20c61bdcfeb	/servis	internal	desktop	2026-07-19 20:02:43.918816+00	pageview	\N
97	0bda345b-df26-46ab-aec4-81cf36bb878e	c6aabed5-1356-48f9-a3e7-b20c61bdcfeb	/	internal	desktop	2026-07-19 20:02:44.388197+00	pageview	\N
98	0bda345b-df26-46ab-aec4-81cf36bb878e	c6aabed5-1356-48f9-a3e7-b20c61bdcfeb	/servis	internal	desktop	2026-07-19 20:02:47.054626+00	pageview	\N
99	0bda345b-df26-46ab-aec4-81cf36bb878e	c6aabed5-1356-48f9-a3e7-b20c61bdcfeb	/	internal	desktop	2026-07-19 20:02:47.739944+00	pageview	\N
100	0bda345b-df26-46ab-aec4-81cf36bb878e	c6aabed5-1356-48f9-a3e7-b20c61bdcfeb	/urunler	internal	desktop	2026-07-19 20:03:21.264804+00	pageview	\N
101	0bda345b-df26-46ab-aec4-81cf36bb878e	c6aabed5-1356-48f9-a3e7-b20c61bdcfeb	/	internal	desktop	2026-07-19 20:27:46.610716+00	pageview	\N
102	0bda345b-df26-46ab-aec4-81cf36bb878e	c6aabed5-1356-48f9-a3e7-b20c61bdcfeb	/teklif-al	internal	desktop	2026-07-19 20:27:51.034257+00	pageview	\N
103	0bda345b-df26-46ab-aec4-81cf36bb878e	c6aabed5-1356-48f9-a3e7-b20c61bdcfeb	/servis	internal	desktop	2026-07-19 20:27:52.649614+00	pageview	\N
104	0bda345b-df26-46ab-aec4-81cf36bb878e	c6aabed5-1356-48f9-a3e7-b20c61bdcfeb	/haberler	internal	desktop	2026-07-19 20:27:53.739204+00	pageview	\N
105	0bda345b-df26-46ab-aec4-81cf36bb878e	c6aabed5-1356-48f9-a3e7-b20c61bdcfeb	/referanslar	internal	desktop	2026-07-19 20:27:54.767477+00	pageview	\N
106	0bda345b-df26-46ab-aec4-81cf36bb878e	c6aabed5-1356-48f9-a3e7-b20c61bdcfeb	/urunler	internal	desktop	2026-07-19 20:28:02.583308+00	pageview	\N
107	3c232c33-8f57-449b-80c8-549d88452905	12e4189d-4899-4fdf-b83f-2ff0c57892fe	/	internal	desktop	2026-07-24 22:36:27.026325+00	pageview	\N
108	3c232c33-8f57-449b-80c8-549d88452905	1226565d-f13d-417d-b22f-25432b662ba6	/	internal	desktop	2026-07-28 11:30:17.019364+00	pageview	\N
109	3c232c33-8f57-449b-80c8-549d88452905	ac6d105a-2d94-4f0b-8c98-af72cd45c754	/	internal	desktop	2026-07-29 19:33:06.384283+00	pageview	\N
110	3c232c33-8f57-449b-80c8-549d88452905	51844010-8b53-4d45-9599-0d6a305a46cd	/	internal	desktop	2026-07-31 16:22:00.33011+00	pageview	\N
111	3c232c33-8f57-449b-80c8-549d88452905	9ea82e34-26a9-4693-8384-25155ad8f479	/	internal	desktop	2026-07-31 20:01:23.287536+00	pageview	\N
112	3c232c33-8f57-449b-80c8-549d88452905	9ea82e34-26a9-4693-8384-25155ad8f479	/	internal	desktop	2026-07-31 20:34:58.795152+00	pageview	\N
113	3c232c33-8f57-449b-80c8-549d88452905	9ea82e34-26a9-4693-8384-25155ad8f479	/	internal	desktop	2026-07-31 21:12:38.967872+00	pageview	\N
114	3c232c33-8f57-449b-80c8-549d88452905	17652b11-cd92-4f9b-b3bb-ab341678327a	/	internal	desktop	2026-08-01 13:13:49.043273+00	pageview	\N
115	3c232c33-8f57-449b-80c8-549d88452905	17652b11-cd92-4f9b-b3bb-ab341678327a	/minn	internal	desktop	2026-08-01 13:13:53.724786+00	pageview	\N
116	3c232c33-8f57-449b-80c8-549d88452905	17652b11-cd92-4f9b-b3bb-ab341678327a	/	internal	desktop	2026-08-01 13:13:53.748256+00	pageview	\N
117	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/	internal	desktop	2026-08-03 06:39:48.657808+00	pageview	\N
118	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/urunler	internal	desktop	2026-08-03 06:43:36.106977+00	pageview	\N
119	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/urunler	internal	desktop	2026-08-03 07:13:22.748945+00	pageview	\N
120	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/urunler	internal	desktop	2026-08-03 07:13:36.756949+00	click	Ürün: Kat Kontrol Panosu
121	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/urunler/kat-kontrol-panosu	internal	desktop	2026-08-03 07:13:36.775051+00	pageview	\N
122	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/urunler/kat-kontrol-panosu	internal	desktop	2026-08-03 07:16:56.005653+00	pageview	\N
123	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/urunler	internal	desktop	2026-08-03 07:17:14.238766+00	pageview	\N
124	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/urunler	internal	desktop	2026-08-03 07:22:37.598171+00	click	Ürün: Anestezi Pendant Ünitesi
125	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/urunler/anestezi-pendant-unitesi	internal	desktop	2026-08-03 07:22:37.596063+00	pageview	\N
126	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/urunler	internal	desktop	2026-08-03 07:22:46.350461+00	pageview	\N
127	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/urunler	internal	desktop	2026-08-03 07:22:51.478746+00	click	Ürün: Dental Vakum Sistemi
128	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 07:22:51.491875+00	pageview	\N
129	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	Twitter	desktop	2026-08-03 07:24:18.394525+00	pageview	\N
130	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler	Twitter	desktop	2026-08-03 07:27:27.120207+00	pageview	\N
131	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler	Twitter	desktop	2026-08-03 07:27:29.72283+00	click	Ürün: Anestezi Pendant Ünitesi
132	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/anestezi-pendant-unitesi	Twitter	desktop	2026-08-03 07:27:29.732607+00	pageview	\N
133	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler	Twitter	desktop	2026-08-03 07:32:12.186265+00	pageview	\N
134	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler	Twitter	desktop	2026-08-03 07:32:17.733861+00	click	Ürün: Anestezi Pendant Ünitesi
135	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/anestezi-pendant-unitesi	Twitter	desktop	2026-08-03 07:32:17.735018+00	pageview	\N
136	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler	Twitter	desktop	2026-08-03 07:32:18.418327+00	pageview	\N
137	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler	Twitter	desktop	2026-08-03 07:32:19.801925+00	click	Ürün: Dental Vakum Sistemi
138	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	Twitter	desktop	2026-08-03 07:32:19.809624+00	pageview	\N
139	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	Twitter	desktop	2026-08-03 07:32:26.818065+00	pageview	\N
140	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	Twitter	desktop	2026-08-03 07:41:34.961518+00	pageview	\N
141	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	Twitter	desktop	2026-08-03 07:48:46.667064+00	pageview	\N
142	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/	internal	desktop	2026-08-03 07:49:22.052759+00	pageview	\N
143	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 07:51:23.005428+00	pageview	\N
144	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 07:53:00.51626+00	pageview	\N
145	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 07:53:52.481224+00	pageview	\N
146	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 07:53:58.958896+00	pageview	\N
147	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 07:55:38.658647+00	pageview	\N
148	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/	internal	desktop	2026-08-03 07:55:43.979688+00	pageview	\N
149	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 07:56:38.653669+00	pageview	\N
150	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 07:56:54.852021+00	pageview	\N
151	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/	internal	desktop	2026-08-03 07:57:08.123843+00	pageview	\N
152	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 07:57:21.722129+00	pageview	\N
153	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 07:57:53.431849+00	pageview	\N
154	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 07:58:17.148453+00	click	Teklif Al (Üst Menü)
155	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/teklif-al	internal	desktop	2026-08-03 07:58:17.343755+00	pageview	\N
156	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/servis	internal	desktop	2026-08-03 07:58:19.942706+00	pageview	\N
157	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/haberler	internal	desktop	2026-08-03 07:58:21.522385+00	pageview	\N
158	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/referanslar	internal	desktop	2026-08-03 07:58:23.174045+00	pageview	\N
159	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler	internal	desktop	2026-08-03 07:58:32.305173+00	pageview	\N
161	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 07:59:15.398383+00	pageview	\N
160	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler	internal	desktop	2026-08-03 07:59:15.396727+00	click	Ürün: Dental Vakum Sistemi
162	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 07:59:23.985974+00	pageview	\N
163	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 07:59:38.645242+00	pageview	\N
164	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 08:01:15.435805+00	pageview	\N
165	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 08:02:14.996834+00	pageview	\N
166	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/	internal	desktop	2026-08-03 08:04:50.4887+00	pageview	\N
167	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/urunler	internal	desktop	2026-08-03 08:04:55.286772+00	pageview	\N
168	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/urunler	internal	desktop	2026-08-03 08:05:04.221184+00	click	Ürün: Dental Vakum Sistemi
169	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 08:05:04.230886+00	pageview	\N
170	f82e587f-3b7c-4c93-9026-a0e041b2df28	f9e86fe9-ec4c-4da7-b5ae-e2c74cf26363	/	direct	mobile	2026-08-03 08:06:05.343619+00	pageview	\N
171	f82e587f-3b7c-4c93-9026-a0e041b2df28	f9e86fe9-ec4c-4da7-b5ae-e2c74cf26363	/urunler	direct	mobile	2026-08-03 08:06:20.286615+00	pageview	\N
172	f82e587f-3b7c-4c93-9026-a0e041b2df28	f9e86fe9-ec4c-4da7-b5ae-e2c74cf26363	/urunler	direct	mobile	2026-08-03 08:06:25.839157+00	click	Ürün: Dental Vakum Sistemi
173	f82e587f-3b7c-4c93-9026-a0e041b2df28	f9e86fe9-ec4c-4da7-b5ae-e2c74cf26363	/urunler/dental-vakum-sistemi	direct	mobile	2026-08-03 08:06:26.492248+00	pageview	\N
174	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 08:06:47.479095+00	pageview	\N
175	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 08:13:29.537155+00	pageview	\N
176	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/	internal	desktop	2026-08-03 08:18:27.787302+00	pageview	\N
177	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 08:22:52.88772+00	pageview	\N
178	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 08:52:53.157973+00	pageview	\N
179	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 08:54:26.504006+00	pageview	\N
180	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/	internal	desktop	2026-08-03 08:55:30.130014+00	pageview	\N
181	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 08:57:30.678762+00	pageview	\N
182	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/teklif-al	internal	desktop	2026-08-03 08:58:55.373575+00	pageview	\N
183	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler	internal	desktop	2026-08-03 09:05:06.880925+00	pageview	\N
184	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler	internal	desktop	2026-08-03 09:05:08.50838+00	click	Ürün: Dental Vakum Sistemi
185	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 09:05:08.523504+00	pageview	\N
186	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/	internal	desktop	2026-08-03 09:06:32.532773+00	pageview	\N
187	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler	internal	desktop	2026-08-03 09:07:27.321587+00	pageview	\N
188	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler	internal	desktop	2026-08-03 09:07:43.886057+00	click	Ürün: Dental Vakum Pompası
189	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-03 09:07:43.891605+00	pageview	\N
190	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-03 09:08:34.394444+00	pageview	\N
191	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-03 09:20:16.521749+00	pageview	\N
192	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-03 09:20:39.595979+00	pageview	\N
193	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-03 09:21:43.469112+00	pageview	\N
194	8500f44e-b46b-413d-a2cd-d6acada2d0f8	774a5846-fa43-4c28-a64b-3e05024e4973	/	direct	desktop	2026-08-03 09:21:44.522063+00	pageview	\N
195	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-03 09:21:51.449717+00	pageview	\N
196	8500f44e-b46b-413d-a2cd-d6acada2d0f8	774a5846-fa43-4c28-a64b-3e05024e4973	/urunler	direct	desktop	2026-08-03 09:25:29.08908+00	pageview	\N
197	8500f44e-b46b-413d-a2cd-d6acada2d0f8	774a5846-fa43-4c28-a64b-3e05024e4973	/urunler	direct	desktop	2026-08-03 09:25:32.842435+00	click	Ürün: Dental Vakum Sistemi
198	8500f44e-b46b-413d-a2cd-d6acada2d0f8	774a5846-fa43-4c28-a64b-3e05024e4973	/urunler/dental-vakum-sistemi	direct	desktop	2026-08-03 09:25:32.869073+00	pageview	\N
199	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-03 09:34:18.585179+00	pageview	\N
200	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/	internal	desktop	2026-08-03 09:34:25.779752+00	pageview	\N
201	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-03 09:35:44.885435+00	pageview	\N
202	8500f44e-b46b-413d-a2cd-d6acada2d0f8	774a5846-fa43-4c28-a64b-3e05024e4973	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 09:36:17.794189+00	pageview	\N
203	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-03 09:36:59.023799+00	pageview	\N
204	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/	internal	desktop	2026-08-03 09:37:13.948605+00	pageview	\N
205	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/	internal	desktop	2026-08-03 09:38:46.929898+00	pageview	\N
206	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-03 09:39:08.04516+00	pageview	\N
207	8500f44e-b46b-413d-a2cd-d6acada2d0f8	774a5846-fa43-4c28-a64b-3e05024e4973	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 09:39:20.100919+00	pageview	\N
208	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/	internal	desktop	2026-08-03 09:40:07.638294+00	pageview	\N
209	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-03 09:42:17.366287+00	pageview	\N
210	8500f44e-b46b-413d-a2cd-d6acada2d0f8	774a5846-fa43-4c28-a64b-3e05024e4973	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 09:42:20.919132+00	pageview	\N
211	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/	internal	desktop	2026-08-03 09:42:45.351555+00	pageview	\N
212	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-03 09:43:26.94103+00	pageview	\N
213	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-03 09:49:44.380909+00	pageview	\N
214	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/	internal	desktop	2026-08-03 09:49:50.118858+00	pageview	\N
215	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/	internal	desktop	2026-08-03 09:51:32.330582+00	pageview	\N
216	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-03 09:51:54.809573+00	pageview	\N
217	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/urunler	internal	desktop	2026-08-03 09:52:28.16089+00	pageview	\N
218	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/urunler	internal	desktop	2026-08-03 09:52:30.566464+00	click	Ürün: Dental Vakum Pompası
219	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-03 09:52:30.575159+00	pageview	\N
220	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/	internal	desktop	2026-08-03 09:53:06.594848+00	pageview	\N
221	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-03 09:55:31.287762+00	pageview	\N
222	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-03 10:19:48.641445+00	pageview	\N
223	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/	internal	desktop	2026-08-03 10:21:56.312742+00	pageview	\N
224	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-03 10:24:25.422476+00	pageview	\N
225	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-03 10:25:17.606043+00	pageview	\N
226	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/teklif-al	internal	desktop	2026-08-03 10:25:35.199927+00	pageview	\N
227	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/kurumsal	internal	desktop	2026-08-03 10:25:39.71667+00	pageview	\N
228	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/	internal	desktop	2026-08-03 10:25:41.399764+00	pageview	\N
229	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/kurumsal	internal	desktop	2026-08-03 10:25:48.484869+00	pageview	\N
230	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler	internal	desktop	2026-08-03 10:26:05.668221+00	pageview	\N
231	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler	internal	desktop	2026-08-03 10:26:07.645409+00	click	Ürün: Amalgam Separatörü
232	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/amalgam-separator	internal	desktop	2026-08-03 10:26:07.658365+00	pageview	\N
233	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/amalgam-separator	internal	desktop	2026-08-03 10:30:58.727154+00	pageview	\N
234	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/	internal	desktop	2026-08-03 10:32:00.233596+00	pageview	\N
235	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/amalgam-separator	internal	desktop	2026-08-03 10:34:06.09653+00	pageview	\N
236	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/amalgam-separator	internal	desktop	2026-08-03 10:36:12.965723+00	pageview	\N
237	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/amalgam-separator	internal	desktop	2026-08-03 10:41:14.424742+00	pageview	\N
238	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/	internal	desktop	2026-08-03 10:41:27.844023+00	pageview	\N
239	3c232c33-8f57-449b-80c8-549d88452905	ebe4b78c-21d8-4c61-81d7-a63eae7cb33d	/	internal	desktop	2026-08-03 10:43:17.320228+00	pageview	\N
240	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/amalgam-separator	internal	desktop	2026-08-03 10:43:49.881426+00	pageview	\N
241	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c8bdace3-e914-4588-8e1f-133cef9501d7	/urunler/amalgam-separator	internal	desktop	2026-08-03 10:45:03.428072+00	pageview	\N
242	3c232c33-8f57-449b-80c8-549d88452905	add0c9ab-5acb-4635-bb6b-085e81e68679	/	internal	desktop	2026-08-03 10:48:40.249923+00	pageview	\N
243	3c232c33-8f57-449b-80c8-549d88452905	add0c9ab-5acb-4635-bb6b-085e81e68679	/urunler	internal	desktop	2026-08-03 10:48:48.953524+00	pageview	\N
244	3c232c33-8f57-449b-80c8-549d88452905	add0c9ab-5acb-4635-bb6b-085e81e68679	/urunler	internal	desktop	2026-08-03 10:48:51.174944+00	click	Ürün: Amalgam Separatörü
245	3c232c33-8f57-449b-80c8-549d88452905	add0c9ab-5acb-4635-bb6b-085e81e68679	/urunler/amalgam-separator	internal	desktop	2026-08-03 10:48:54.520261+00	pageview	\N
246	8500f44e-b46b-413d-a2cd-d6acada2d0f8	f7457cae-8a18-4ad5-8c2b-6b64eb4e3032	/urunler/amalgam-separator	Twitter	desktop	2026-08-03 10:49:13.161319+00	pageview	\N
247	8500f44e-b46b-413d-a2cd-d6acada2d0f8	f7457cae-8a18-4ad5-8c2b-6b64eb4e3032	/urunler/amalgam-separator	Twitter	desktop	2026-08-03 10:50:34.946807+00	pageview	\N
248	3c232c33-8f57-449b-80c8-549d88452905	add0c9ab-5acb-4635-bb6b-085e81e68679	/	internal	desktop	2026-08-03 10:52:16.624158+00	pageview	\N
249	8500f44e-b46b-413d-a2cd-d6acada2d0f8	f7457cae-8a18-4ad5-8c2b-6b64eb4e3032	/urunler	Twitter	desktop	2026-08-03 10:53:00.906308+00	pageview	\N
250	8500f44e-b46b-413d-a2cd-d6acada2d0f8	f7457cae-8a18-4ad5-8c2b-6b64eb4e3032	/urunler	internal	desktop	2026-08-03 10:54:11.113273+00	pageview	\N
251	8500f44e-b46b-413d-a2cd-d6acada2d0f8	f7457cae-8a18-4ad5-8c2b-6b64eb4e3032	/urunler	internal	desktop	2026-08-03 10:56:55.056711+00	pageview	\N
252	8500f44e-b46b-413d-a2cd-d6acada2d0f8	f7457cae-8a18-4ad5-8c2b-6b64eb4e3032	/urunler	internal	desktop	2026-08-03 10:57:06.54635+00	pageview	\N
253	8500f44e-b46b-413d-a2cd-d6acada2d0f8	f7457cae-8a18-4ad5-8c2b-6b64eb4e3032	/urunler	internal	desktop	2026-08-03 10:58:06.23858+00	pageview	\N
254	8500f44e-b46b-413d-a2cd-d6acada2d0f8	f7457cae-8a18-4ad5-8c2b-6b64eb4e3032	/urunler	internal	desktop	2026-08-03 10:58:37.891923+00	click	Ürün: Kat Kontrol Panosu
255	8500f44e-b46b-413d-a2cd-d6acada2d0f8	f7457cae-8a18-4ad5-8c2b-6b64eb4e3032	/urunler/kat-kontrol-panosu	internal	desktop	2026-08-03 10:58:37.921721+00	pageview	\N
256	8500f44e-b46b-413d-a2cd-d6acada2d0f8	f7457cae-8a18-4ad5-8c2b-6b64eb4e3032	/urunler	internal	desktop	2026-08-03 11:00:18.652506+00	pageview	\N
257	8500f44e-b46b-413d-a2cd-d6acada2d0f8	f7457cae-8a18-4ad5-8c2b-6b64eb4e3032	/urunler	internal	desktop	2026-08-03 11:00:25.507869+00	pageview	\N
258	8500f44e-b46b-413d-a2cd-d6acada2d0f8	f7457cae-8a18-4ad5-8c2b-6b64eb4e3032	/urunler	internal	desktop	2026-08-03 11:00:56.395525+00	click	Ürün: Dental Vakum Sistemi
259	8500f44e-b46b-413d-a2cd-d6acada2d0f8	f7457cae-8a18-4ad5-8c2b-6b64eb4e3032	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-03 11:01:01.767219+00	pageview	\N
260	3c232c33-8f57-449b-80c8-549d88452905	add0c9ab-5acb-4635-bb6b-085e81e68679	/	internal	desktop	2026-08-03 11:13:05.333175+00	pageview	\N
261	3c232c33-8f57-449b-80c8-549d88452905	add0c9ab-5acb-4635-bb6b-085e81e68679	/	internal	desktop	2026-08-03 11:15:36.228468+00	pageview	\N
262	8500f44e-b46b-413d-a2cd-d6acada2d0f8	f7457cae-8a18-4ad5-8c2b-6b64eb4e3032	/urunler	internal	desktop	2026-08-03 11:16:30.037833+00	pageview	\N
263	8500f44e-b46b-413d-a2cd-d6acada2d0f8	f7457cae-8a18-4ad5-8c2b-6b64eb4e3032	/urunler	internal	desktop	2026-08-03 11:17:00.964085+00	pageview	\N
264	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler/kat-kontrol-panosu	internal	desktop	2026-08-03 11:24:42.835369+00	pageview	\N
265	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler/kat-kontrol-panosu	internal	desktop	2026-08-03 11:29:04.772582+00	pageview	\N
266	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler/kat-kontrol-panosu	internal	desktop	2026-08-03 11:33:35.644784+00	pageview	\N
267	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler/kat-kontrol-panosu	internal	desktop	2026-08-03 11:33:57.615232+00	pageview	\N
268	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler/kat-kontrol-panosu	internal	desktop	2026-08-03 11:34:09.853508+00	pageview	\N
269	3c232c33-8f57-449b-80c8-549d88452905	add0c9ab-5acb-4635-bb6b-085e81e68679	/	internal	desktop	2026-08-03 11:40:36.983205+00	pageview	\N
270	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler/kat-kontrol-panosu	internal	desktop	2026-08-03 11:44:50.270106+00	pageview	\N
271	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler/kat-kontrol-panosu	internal	desktop	2026-08-03 12:06:19.065075+00	pageview	\N
272	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler/kat-kontrol-panosu	internal	desktop	2026-08-03 12:11:48.835006+00	pageview	\N
273	3c232c33-8f57-449b-80c8-549d88452905	add0c9ab-5acb-4635-bb6b-085e81e68679	/urunler	internal	desktop	2026-08-03 12:11:51.003132+00	pageview	\N
274	3c232c33-8f57-449b-80c8-549d88452905	add0c9ab-5acb-4635-bb6b-085e81e68679	/urunler	internal	desktop	2026-08-03 12:11:55.237685+00	click	Ürün: Kat Kontrol Panosu
275	3c232c33-8f57-449b-80c8-549d88452905	add0c9ab-5acb-4635-bb6b-085e81e68679	/urunler/kat-kontrol-panosu	internal	desktop	2026-08-03 12:11:55.850418+00	pageview	\N
276	3c232c33-8f57-449b-80c8-549d88452905	add0c9ab-5acb-4635-bb6b-085e81e68679	/	internal	desktop	2026-08-03 12:14:40.834195+00	pageview	\N
277	3c232c33-8f57-449b-80c8-549d88452905	add0c9ab-5acb-4635-bb6b-085e81e68679	/urunler/kat-kontrol-panosu	internal	desktop	2026-08-03 12:14:42.564196+00	pageview	\N
278	3c232c33-8f57-449b-80c8-549d88452905	add0c9ab-5acb-4635-bb6b-085e81e68679	/urunler	internal	desktop	2026-08-03 12:14:43.469238+00	pageview	\N
279	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler	internal	desktop	2026-08-03 12:15:32.805783+00	pageview	\N
280	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler	internal	desktop	2026-08-03 12:15:34.099225+00	click	Ürün: Anestezi Pendant Ünitesi
281	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler/anestezi-pendant-unitesi	internal	desktop	2026-08-03 12:15:34.109013+00	pageview	\N
282	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler	internal	desktop	2026-08-03 12:15:52.352523+00	pageview	\N
283	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler	internal	desktop	2026-08-03 12:15:56.725103+00	click	Ürün: Yoğun Bakım Pendant Ünitesi
284	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler/yogun-bakim-pendant-unitesi	internal	desktop	2026-08-03 12:15:56.740692+00	pageview	\N
285	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler	internal	desktop	2026-08-03 12:16:04.326872+00	pageview	\N
286	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler	internal	desktop	2026-08-03 12:16:06.355134+00	click	Ürün: Cerrahi Pendant Ünitesi
287	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler/cerrahi-pendant-unitesi	internal	desktop	2026-08-03 12:16:06.365819+00	pageview	\N
288	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler	internal	desktop	2026-08-03 12:16:08.17275+00	pageview	\N
289	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler	internal	desktop	2026-08-03 12:16:08.948452+00	click	Ürün: Anestezi Pendant Ünitesi
290	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler/anestezi-pendant-unitesi	internal	desktop	2026-08-03 12:16:08.959443+00	pageview	\N
291	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler	internal	desktop	2026-08-03 12:16:15.568767+00	pageview	\N
292	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler	internal	desktop	2026-08-03 12:16:16.788996+00	click	Ürün: Yoğun Bakım Pendant Ünitesi
293	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler/yogun-bakim-pendant-unitesi	internal	desktop	2026-08-03 12:16:16.798014+00	pageview	\N
294	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/urunler	internal	desktop	2026-08-03 12:17:25.2927+00	pageview	\N
295	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/referanslar	internal	desktop	2026-08-03 12:17:51.533082+00	pageview	\N
296	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/referanslar	internal	desktop	2026-08-03 12:31:32.806508+00	pageview	\N
297	3c232c33-8f57-449b-80c8-549d88452905	add0c9ab-5acb-4635-bb6b-085e81e68679	/	internal	desktop	2026-08-03 12:39:07.522983+00	pageview	\N
298	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/referanslar	internal	desktop	2026-08-03 12:39:18.413577+00	pageview	\N
299	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/	internal	desktop	2026-08-03 12:41:12.265818+00	pageview	\N
300	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/referanslar	internal	desktop	2026-08-03 12:41:20.86758+00	pageview	\N
301	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/	internal	desktop	2026-08-03 12:41:22.392954+00	pageview	\N
302	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/gizlilik-politikasi	internal	desktop	2026-08-03 12:42:13.929601+00	pageview	\N
303	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/	internal	desktop	2026-08-03 12:42:13.935769+00	pageview	\N
304	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/	internal	desktop	2026-08-03 12:42:21.90224+00	pageview	\N
305	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/	internal	desktop	2026-08-03 12:42:24.170277+00	pageview	\N
306	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/referanslar	internal	desktop	2026-08-03 12:43:31.666059+00	pageview	\N
307	3c232c33-8f57-449b-80c8-549d88452905	add0c9ab-5acb-4635-bb6b-085e81e68679	/	internal	desktop	2026-08-03 13:04:12.878764+00	pageview	\N
308	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/	internal	desktop	2026-08-03 13:17:38.206285+00	pageview	\N
309	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/	internal	desktop	2026-08-03 13:21:34.750424+00	pageview	\N
310	8500f44e-b46b-413d-a2cd-d6acada2d0f8	a73dcf4e-b526-426f-a9e5-f4cfdb48d37e	/	internal	desktop	2026-08-03 15:10:08.457546+00	pageview	\N
311	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/	internal	desktop	2026-08-04 05:56:30.803174+00	pageview	\N
312	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/urunler	internal	desktop	2026-08-04 05:56:37.23407+00	pageview	\N
313	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/urunler	internal	desktop	2026-08-04 05:56:44.129759+00	click	Ürün: Anestezi Pendant Ünitesi
314	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/urunler/anestezi-pendant-unitesi	internal	desktop	2026-08-04 05:56:44.130541+00	pageview	\N
315	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/urunler	internal	desktop	2026-08-04 05:57:25.822903+00	pageview	\N
316	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/urunler	internal	desktop	2026-08-04 05:57:27.195566+00	click	Ürün: Cerrahi Pendant Ünitesi
317	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/urunler/cerrahi-pendant-unitesi	internal	desktop	2026-08-04 05:57:27.204451+00	pageview	\N
318	8500f44e-b46b-413d-a2cd-d6acada2d0f8	83d391e4-ac4b-4e58-aff8-025c8c8ac9f5	/	direct	desktop	2026-08-04 06:16:17.600902+00	pageview	\N
319	8500f44e-b46b-413d-a2cd-d6acada2d0f8	83d391e4-ac4b-4e58-aff8-025c8c8ac9f5	/urunler	direct	desktop	2026-08-04 06:16:23.301701+00	pageview	\N
320	8500f44e-b46b-413d-a2cd-d6acada2d0f8	83d391e4-ac4b-4e58-aff8-025c8c8ac9f5	/urunler	direct	desktop	2026-08-04 06:16:26.312041+00	click	Katalog İndir: Basınçlı Hava Santralleri 2026 Katalog
321	8500f44e-b46b-413d-a2cd-d6acada2d0f8	9eb0a6aa-67ad-458d-bfda-da8a6c831bcc	/artifacts/oxymed-medikal/public/assets/BASIN%C3%87LI%20HAVA%20SANTRALLER%C4%B0%202026%20KATALOG.pdf	direct	desktop	2026-08-04 06:16:30.470518+00	pageview	\N
322	8500f44e-b46b-413d-a2cd-d6acada2d0f8	9eb0a6aa-67ad-458d-bfda-da8a6c831bcc	/	direct	desktop	2026-08-04 06:16:30.513084+00	pageview	\N
323	8500f44e-b46b-413d-a2cd-d6acada2d0f8	83d391e4-ac4b-4e58-aff8-025c8c8ac9f5	/urunler	direct	desktop	2026-08-04 06:16:37.56015+00	click	Katalog İndir: Basınçlı Hava Santralleri 2026 Katalog
324	8500f44e-b46b-413d-a2cd-d6acada2d0f8	7e61a486-5ff0-44ee-964f-ac01d630a56c	/artifacts/oxymed-medikal/public/assets/BASIN%C3%87LI%20HAVA%20SANTRALLER%C4%B0%202026%20KATALOG.pdf	direct	desktop	2026-08-04 06:16:41.105777+00	pageview	\N
325	8500f44e-b46b-413d-a2cd-d6acada2d0f8	7e61a486-5ff0-44ee-964f-ac01d630a56c	/	direct	desktop	2026-08-04 06:16:41.152379+00	pageview	\N
326	8500f44e-b46b-413d-a2cd-d6acada2d0f8	9eb0a6aa-67ad-458d-bfda-da8a6c831bcc	/urunler	direct	desktop	2026-08-04 06:49:38.073397+00	pageview	\N
327	8500f44e-b46b-413d-a2cd-d6acada2d0f8	9eb0a6aa-67ad-458d-bfda-da8a6c831bcc	/urunler	direct	desktop	2026-08-04 07:50:17.692628+00	click	Ürün: Dental Vakum Sistemi
328	8500f44e-b46b-413d-a2cd-d6acada2d0f8	9eb0a6aa-67ad-458d-bfda-da8a6c831bcc	/urunler/dental-vakum-sistemi	direct	desktop	2026-08-04 07:50:18.212925+00	pageview	\N
329	8500f44e-b46b-413d-a2cd-d6acada2d0f8	9eb0a6aa-67ad-458d-bfda-da8a6c831bcc	/urunler	direct	desktop	2026-08-04 07:51:40.813271+00	pageview	\N
330	8500f44e-b46b-413d-a2cd-d6acada2d0f8	9eb0a6aa-67ad-458d-bfda-da8a6c831bcc	/urunler	direct	desktop	2026-08-04 07:51:42.386868+00	click	Ürün: Yoğun Bakım Pendant Ünitesi
331	8500f44e-b46b-413d-a2cd-d6acada2d0f8	9eb0a6aa-67ad-458d-bfda-da8a6c831bcc	/urunler/yogun-bakim-pendant-unitesi	direct	desktop	2026-08-04 07:51:42.395197+00	pageview	\N
332	8500f44e-b46b-413d-a2cd-d6acada2d0f8	9eb0a6aa-67ad-458d-bfda-da8a6c831bcc	/urunler	direct	desktop	2026-08-04 07:52:25.597206+00	pageview	\N
333	8500f44e-b46b-413d-a2cd-d6acada2d0f8	9eb0a6aa-67ad-458d-bfda-da8a6c831bcc	/urunler	direct	desktop	2026-08-04 08:28:14.711808+00	click	Ürün: Dental Vakum Sistemi
334	8500f44e-b46b-413d-a2cd-d6acada2d0f8	9eb0a6aa-67ad-458d-bfda-da8a6c831bcc	/urunler/dental-vakum-sistemi	direct	desktop	2026-08-04 08:28:14.720933+00	pageview	\N
335	8500f44e-b46b-413d-a2cd-d6acada2d0f8	9eb0a6aa-67ad-458d-bfda-da8a6c831bcc	/urunler/dental-vakum-sistemi	direct	desktop	2026-08-04 08:28:20.762944+00	pageview	\N
336	8500f44e-b46b-413d-a2cd-d6acada2d0f8	9eb0a6aa-67ad-458d-bfda-da8a6c831bcc	/urunler/dental-vakum-sistemi	direct	desktop	2026-08-04 08:28:25.262187+00	click	E-posta (Üst Menü)
337	8500f44e-b46b-413d-a2cd-d6acada2d0f8	9eb0a6aa-67ad-458d-bfda-da8a6c831bcc	/urunler/dental-vakum-sistemi	direct	desktop	2026-08-04 08:28:26.999805+00	click	Telefon (Üst Menü)
338	8500f44e-b46b-413d-a2cd-d6acada2d0f8	9eb0a6aa-67ad-458d-bfda-da8a6c831bcc	/kurumsal	direct	desktop	2026-08-04 08:28:29.908782+00	pageview	\N
339	8500f44e-b46b-413d-a2cd-d6acada2d0f8	9eb0a6aa-67ad-458d-bfda-da8a6c831bcc	/urunler	direct	desktop	2026-08-04 08:31:12.069751+00	pageview	\N
340	8500f44e-b46b-413d-a2cd-d6acada2d0f8	9eb0a6aa-67ad-458d-bfda-da8a6c831bcc	/referanslar	direct	desktop	2026-08-04 08:31:14.962899+00	pageview	\N
341	8500f44e-b46b-413d-a2cd-d6acada2d0f8	9eb0a6aa-67ad-458d-bfda-da8a6c831bcc	/kurumsal	direct	desktop	2026-08-04 08:45:04.803841+00	pageview	\N
342	8500f44e-b46b-413d-a2cd-d6acada2d0f8	83d391e4-ac4b-4e58-aff8-025c8c8ac9f5	/haberler	direct	desktop	2026-08-04 08:46:21.72255+00	pageview	\N
343	8500f44e-b46b-413d-a2cd-d6acada2d0f8	83d391e4-ac4b-4e58-aff8-025c8c8ac9f5	/haberler/ankara-bilkent-sehir-hastanesi-yogun-bakim	direct	desktop	2026-08-04 08:46:31.863153+00	pageview	\N
344	8500f44e-b46b-413d-a2cd-d6acada2d0f8	83d391e4-ac4b-4e58-aff8-025c8c8ac9f5	/haberler	direct	desktop	2026-08-04 08:46:34.476628+00	pageview	\N
345	8500f44e-b46b-413d-a2cd-d6acada2d0f8	83d391e4-ac4b-4e58-aff8-025c8c8ac9f5	/kurumsal	direct	desktop	2026-08-04 09:01:51.69594+00	pageview	\N
346	8500f44e-b46b-413d-a2cd-d6acada2d0f8	83d391e4-ac4b-4e58-aff8-025c8c8ac9f5	/urunler	direct	desktop	2026-08-04 09:01:52.573195+00	pageview	\N
347	229131b1-82a4-4fe2-b5b2-321c40a24481	0d791581-c0a0-432f-95f3-18f1448f3efa	/referanslar	direct	desktop	2026-08-04 09:18:19.701109+00	pageview	\N
348	229131b1-82a4-4fe2-b5b2-321c40a24481	0d791581-c0a0-432f-95f3-18f1448f3efa	/urunler	direct	desktop	2026-08-04 09:24:20.908258+00	pageview	\N
349	229131b1-82a4-4fe2-b5b2-321c40a24481	0d791581-c0a0-432f-95f3-18f1448f3efa	/urunler	direct	desktop	2026-08-04 09:24:28.892153+00	click	Ürün: Kat Kontrol Panosu
350	229131b1-82a4-4fe2-b5b2-321c40a24481	0d791581-c0a0-432f-95f3-18f1448f3efa	/urunler/kat-kontrol-panosu	direct	desktop	2026-08-04 09:24:29.12986+00	pageview	\N
351	229131b1-82a4-4fe2-b5b2-321c40a24481	0d791581-c0a0-432f-95f3-18f1448f3efa	/urunler	direct	desktop	2026-08-04 09:26:26.312837+00	pageview	\N
352	229131b1-82a4-4fe2-b5b2-321c40a24481	0d791581-c0a0-432f-95f3-18f1448f3efa	/urunler	direct	desktop	2026-08-04 09:26:56.092613+00	click	Ürün: Dental Vakum Pompası
353	229131b1-82a4-4fe2-b5b2-321c40a24481	0d791581-c0a0-432f-95f3-18f1448f3efa	/urunler/dental-vakum-pompasi	direct	desktop	2026-08-04 09:26:56.360562+00	pageview	\N
354	229131b1-82a4-4fe2-b5b2-321c40a24481	0d791581-c0a0-432f-95f3-18f1448f3efa	/urunler	direct	desktop	2026-08-04 09:27:19.505733+00	pageview	\N
355	229131b1-82a4-4fe2-b5b2-321c40a24481	0d791581-c0a0-432f-95f3-18f1448f3efa	/urunler	direct	desktop	2026-08-04 09:27:20.238011+00	click	Ürün: Dental Vakum Sistemi
356	229131b1-82a4-4fe2-b5b2-321c40a24481	0d791581-c0a0-432f-95f3-18f1448f3efa	/urunler/dental-vakum-sistemi	direct	desktop	2026-08-04 09:27:24.241403+00	pageview	\N
357	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/	internal	desktop	2026-08-04 09:56:22.059535+00	pageview	\N
358	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/	internal	desktop	2026-08-04 12:53:16.378521+00	pageview	\N
359	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/	internal	desktop	2026-08-04 13:05:31.535228+00	pageview	\N
360	8500f44e-b46b-413d-a2cd-d6acada2d0f8	83d391e4-ac4b-4e58-aff8-025c8c8ac9f5	/urunler	internal	desktop	2026-08-04 13:09:12.511261+00	pageview	\N
361	8500f44e-b46b-413d-a2cd-d6acada2d0f8	9eb0a6aa-67ad-458d-bfda-da8a6c831bcc	/teklif-al	direct	desktop	2026-08-04 13:12:46.952828+00	pageview	\N
362	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/	internal	desktop	2026-08-04 13:15:47.474615+00	pageview	\N
363	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/urunler	internal	desktop	2026-08-04 13:15:55.894692+00	pageview	\N
364	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/urunler	internal	desktop	2026-08-04 13:16:06.552545+00	click	Ürün: Dental Vakum Pompası
365	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-04 13:16:06.764031+00	pageview	\N
366	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/urunler	internal	desktop	2026-08-04 13:16:20.147281+00	pageview	\N
367	229131b1-82a4-4fe2-b5b2-321c40a24481	0d791581-c0a0-432f-95f3-18f1448f3efa	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-04 13:53:29.179124+00	pageview	\N
368	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/	internal	desktop	2026-08-04 14:20:23.443972+00	pageview	\N
369	8500f44e-b46b-413d-a2cd-d6acada2d0f8	83d391e4-ac4b-4e58-aff8-025c8c8ac9f5	/urunler	internal	desktop	2026-08-04 14:20:24.053947+00	pageview	\N
370	8500f44e-b46b-413d-a2cd-d6acada2d0f8	83d391e4-ac4b-4e58-aff8-025c8c8ac9f5	/urunler	internal	desktop	2026-08-04 14:21:39.363406+00	pageview	\N
371	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/urunler	internal	desktop	2026-08-04 14:24:09.547466+00	pageview	\N
372	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/urunler	internal	desktop	2026-08-04 14:24:15.927661+00	click	Ürün: Dental Vakum Sistemi
373	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-04 14:24:19.623288+00	pageview	\N
374	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/	internal	desktop	2026-08-04 14:24:22.189291+00	pageview	\N
375	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/kurumsal	internal	desktop	2026-08-04 14:24:22.699718+00	pageview	\N
376	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/	internal	desktop	2026-08-04 14:24:25.974237+00	pageview	\N
377	3c232c33-8f57-449b-80c8-549d88452905	95158be0-006d-4116-b989-66dfae923148	/	internal	desktop	2026-08-04 14:25:38.130518+00	pageview	\N
378	3c232c33-8f57-449b-80c8-549d88452905	2ea316e5-f21c-402a-89ee-a7a3c3a765d0	/	internal	desktop	2026-08-09 22:11:08.946266+00	pageview	\N
379	3c232c33-8f57-449b-80c8-549d88452905	2ea316e5-f21c-402a-89ee-a7a3c3a765d0	/servis	internal	desktop	2026-08-09 22:11:14.122948+00	pageview	\N
380	3c232c33-8f57-449b-80c8-549d88452905	2ea316e5-f21c-402a-89ee-a7a3c3a765d0	/	internal	desktop	2026-08-09 23:04:31.107979+00	pageview	\N
381	3c232c33-8f57-449b-80c8-549d88452905	e2246d11-deb3-4f18-bb52-7c2a5e107430	/	internal	desktop	2026-08-10 07:34:57.573965+00	pageview	\N
382	3c232c33-8f57-449b-80c8-549d88452905	e2246d11-deb3-4f18-bb52-7c2a5e107430	/kurumsal	internal	desktop	2026-08-10 07:35:05.823762+00	pageview	\N
383	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 06:42:36.588718+00	pageview	\N
384	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 07:23:50.017871+00	pageview	\N
385	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	direct	desktop	2026-08-11 09:06:34.255605+00	pageview	\N
386	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/kurumsal	direct	desktop	2026-08-11 09:06:40.505371+00	pageview	\N
387	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/urunler	direct	desktop	2026-08-11 09:06:44.824319+00	pageview	\N
388	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/urunler	direct	desktop	2026-08-11 09:07:07.764391+00	click	Ürün: Kat Kontrol Panosu
389	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/urunler/kat-kontrol-panosu	direct	desktop	2026-08-11 09:07:08.063441+00	pageview	\N
390	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/urunler	direct	desktop	2026-08-11 09:07:18.391478+00	pageview	\N
391	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/urunler	direct	desktop	2026-08-11 09:07:19.847799+00	click	Ürün: Amalgam Separatörü
392	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/urunler/amalgam-separator	direct	desktop	2026-08-11 09:07:20.113578+00	pageview	\N
393	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/urunler	direct	desktop	2026-08-11 09:07:29.153347+00	pageview	\N
394	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/urunler	direct	desktop	2026-08-11 09:07:30.984155+00	click	Ürün: Dental Vakum Pompası
395	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/urunler/dental-vakum-pompasi	direct	desktop	2026-08-11 09:07:31.186632+00	pageview	\N
396	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/urunler	direct	desktop	2026-08-11 09:07:46.078788+00	pageview	\N
397	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/urunler	direct	desktop	2026-08-11 09:08:33.18981+00	click	Ürün: Dental Vakum Sistemi
398	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/urunler/dental-vakum-sistemi	direct	desktop	2026-08-11 09:08:36.267941+00	pageview	\N
399	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/referanslar	direct	desktop	2026-08-11 09:11:10.481544+00	pageview	\N
400	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/haberler	direct	desktop	2026-08-11 09:11:11.717997+00	pageview	\N
401	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/servis	direct	desktop	2026-08-11 09:11:15.366838+00	pageview	\N
402	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/teklif-al	direct	desktop	2026-08-11 09:11:24.673723+00	pageview	\N
403	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	direct	desktop	2026-08-11 09:14:01.123783+00	pageview	\N
404	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:36:29.952837+00	pageview	\N
405	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:39:55.054766+00	pageview	\N
406	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:40:00.062824+00	pageview	\N
407	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:40:03.074197+00	pageview	\N
408	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:40:06.070348+00	pageview	\N
409	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:40:16.052482+00	pageview	\N
410	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:40:25.053789+00	pageview	\N
411	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:40:31.06943+00	pageview	\N
412	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:40:37.087658+00	pageview	\N
413	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:40:44.055589+00	pageview	\N
414	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:41:03.982583+00	pageview	\N
415	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:48:06.088797+00	pageview	\N
416	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:49:22.070801+00	pageview	\N
417	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:49:25.088587+00	pageview	\N
418	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:49:38.067228+00	pageview	\N
419	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:49:43.062533+00	pageview	\N
420	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:50:31.106354+00	pageview	\N
421	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:50:39.081461+00	pageview	\N
422	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:50:50.062292+00	pageview	\N
423	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:50:56.061906+00	pageview	\N
424	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:51:10.087584+00	pageview	\N
425	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:51:19.08443+00	pageview	\N
426	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:51:40.055242+00	pageview	\N
427	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f85e03c-6497-4d46-ae58-8ba8670c4d3d	/	internal	desktop	2026-08-11 09:51:53.063258+00	pageview	\N
428	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 09:54:23.558017+00	pageview	\N
429	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 09:55:28.126287+00	pageview	\N
430	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 09:57:42.237+00	pageview	\N
431	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 09:58:33.424444+00	pageview	\N
432	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 09:59:21.143551+00	pageview	\N
433	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 09:59:43.097616+00	pageview	\N
434	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 10:01:10.927252+00	pageview	\N
435	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 10:01:13.388113+00	pageview	\N
436	1cdd5416-a478-49ca-9948-35f4691ff68d	d98c9fe2-0738-4330-89de-83cd990d9aa7	/	direct	desktop	2026-08-11 10:06:20.481771+00	pageview	\N
437	1cdd5416-a478-49ca-9948-35f4691ff68d	d98c9fe2-0738-4330-89de-83cd990d9aa7	/en	direct	desktop	2026-08-11 10:06:36.665627+00	pageview	\N
438	1cdd5416-a478-49ca-9948-35f4691ff68d	d98c9fe2-0738-4330-89de-83cd990d9aa7	/en/products	direct	desktop	2026-08-11 10:07:06.15119+00	pageview	\N
439	1cdd5416-a478-49ca-9948-35f4691ff68d	d98c9fe2-0738-4330-89de-83cd990d9aa7	/en/products	direct	desktop	2026-08-11 10:07:19.455358+00	pageview	\N
440	1cdd5416-a478-49ca-9948-35f4691ff68d	d98c9fe2-0738-4330-89de-83cd990d9aa7	/de/produkte/gas-kontrolltafel	direct	desktop	2026-08-11 10:07:28.460482+00	pageview	\N
441	1cdd5416-a478-49ca-9948-35f4691ff68d	d98c9fe2-0738-4330-89de-83cd990d9aa7	/ar	direct	desktop	2026-08-11 10:07:50.274143+00	pageview	\N
442	1cdd5416-a478-49ca-9948-35f4691ff68d	d98c9fe2-0738-4330-89de-83cd990d9aa7	/en/get-a-quote	direct	desktop	2026-08-11 10:08:01.266958+00	pageview	\N
443	1cdd5416-a478-49ca-9948-35f4691ff68d	d98c9fe2-0738-4330-89de-83cd990d9aa7	/en/get-a-quote	direct	desktop	2026-08-11 10:08:33.226944+00	click	Teklif Formu Gönderildi
444	1cdd5416-a478-49ca-9948-35f4691ff68d	d98c9fe2-0738-4330-89de-83cd990d9aa7	/ar	direct	desktop	2026-08-11 10:08:49.217145+00	pageview	\N
445	1cdd5416-a478-49ca-9948-35f4691ff68d	d98c9fe2-0738-4330-89de-83cd990d9aa7	/ar	direct	desktop	2026-08-11 10:11:16.212329+00	pageview	\N
446	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 10:11:21.214815+00	pageview	\N
447	084d3a73-b3b8-4b49-a158-449d03c733a1	8dac9d2a-d9ac-4d65-8d5b-9ede4c065c05	/en/products	direct	desktop	2026-08-11 10:13:29.452499+00	pageview	\N
448	084d3a73-b3b8-4b49-a158-449d03c733a1	8dac9d2a-d9ac-4d65-8d5b-9ede4c065c05	/en/products	direct	desktop	2026-08-11 10:13:42.402781+00	click	Ürün: Kat Kontrol Panosu
449	084d3a73-b3b8-4b49-a158-449d03c733a1	8dac9d2a-d9ac-4d65-8d5b-9ede4c065c05	/en/products/gas-control-panel	direct	desktop	2026-08-11 10:13:42.529585+00	pageview	\N
450	084d3a73-b3b8-4b49-a158-449d03c733a1	8dac9d2a-d9ac-4d65-8d5b-9ede4c065c05	/en/products	direct	desktop	2026-08-11 10:13:53.132112+00	pageview	\N
451	084d3a73-b3b8-4b49-a158-449d03c733a1	8dac9d2a-d9ac-4d65-8d5b-9ede4c065c05	/en/products	direct	desktop	2026-08-11 10:14:03.253734+00	click	Ürün: Dental Vacuum Pump
452	084d3a73-b3b8-4b49-a158-449d03c733a1	8dac9d2a-d9ac-4d65-8d5b-9ede4c065c05	/en/products/dental-vacuum-pump	direct	desktop	2026-08-11 10:14:03.316103+00	pageview	\N
453	084d3a73-b3b8-4b49-a158-449d03c733a1	8dac9d2a-d9ac-4d65-8d5b-9ede4c065c05	/de/produkte/dental-vakuumpumpe	direct	desktop	2026-08-11 10:14:21.31455+00	pageview	\N
454	084d3a73-b3b8-4b49-a158-449d03c733a1	8dac9d2a-d9ac-4d65-8d5b-9ede4c065c05	/ar	direct	desktop	2026-08-11 10:14:34.08018+00	pageview	\N
455	084d3a73-b3b8-4b49-a158-449d03c733a1	8dac9d2a-d9ac-4d65-8d5b-9ede4c065c05	/ar	direct	desktop	2026-08-11 10:14:44.513708+00	pageview	\N
456	1cdd5416-a478-49ca-9948-35f4691ff68d	d98c9fe2-0738-4330-89de-83cd990d9aa7	/ar	internal	desktop	2026-08-11 10:20:13.848325+00	pageview	\N
457	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 10:20:31.404573+00	pageview	\N
458	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/en	internal	desktop	2026-08-11 11:19:49.456115+00	pageview	\N
459	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 11:19:53.56623+00	pageview	\N
460	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/en	internal	desktop	2026-08-11 11:19:57.082815+00	pageview	\N
461	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/en/products	internal	desktop	2026-08-11 11:20:07.89795+00	pageview	\N
462	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 11:23:34.783153+00	pageview	\N
463	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/ar	internal	desktop	2026-08-11 11:23:41.641344+00	pageview	\N
464	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 11:23:45.960399+00	pageview	\N
465	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/en	internal	desktop	2026-08-11 11:23:49.555081+00	pageview	\N
466	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/haberler	internal	desktop	2026-08-11 11:24:26.946274+00	pageview	\N
467	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/en	internal	desktop	2026-08-11 11:24:32.442098+00	pageview	\N
468	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/en/products	internal	desktop	2026-08-11 11:24:34.36499+00	pageview	\N
469	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/haberler	internal	desktop	2026-08-11 11:24:36.580002+00	pageview	\N
470	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/urunler	internal	desktop	2026-08-11 11:24:38.013675+00	pageview	\N
471	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/urunler	internal	desktop	2026-08-11 11:24:42.874478+00	click	Ürün: Dental Vakum Sistemi
472	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-11 11:24:46.760841+00	pageview	\N
473	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/en/products/dental-vacuum-system	internal	desktop	2026-08-11 11:24:49.33846+00	pageview	\N
474	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/en/products/dental-vacuum-system	internal	desktop	2026-08-11 11:25:06.963062+00	click	Teklif Al (Üst Menü)
475	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/en/get-a-quote	internal	desktop	2026-08-11 11:25:06.973824+00	pageview	\N
476	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 11:31:45.28959+00	pageview	\N
477	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/en	internal	desktop	2026-08-11 11:31:47.915773+00	pageview	\N
478	1cdd5416-a478-49ca-9948-35f4691ff68d	d98c9fe2-0738-4330-89de-83cd990d9aa7	/ar	internal	desktop	2026-08-11 11:32:19.187816+00	pageview	\N
479	1cdd5416-a478-49ca-9948-35f4691ff68d	d98c9fe2-0738-4330-89de-83cd990d9aa7	/ar	internal	desktop	2026-08-11 11:32:38.029074+00	pageview	\N
480	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 11:32:50.525335+00	pageview	\N
481	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/en	internal	desktop	2026-08-11 11:32:50.95306+00	pageview	\N
482	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/de	internal	desktop	2026-08-11 11:33:08.623709+00	pageview	\N
483	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 11:33:10.335832+00	pageview	\N
484	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 11:33:32.498779+00	pageview	\N
485	1cdd5416-a478-49ca-9948-35f4691ff68d	d98c9fe2-0738-4330-89de-83cd990d9aa7	/ar	internal	desktop	2026-08-11 11:52:30.163411+00	pageview	\N
486	1cdd5416-a478-49ca-9948-35f4691ff68d	d98c9fe2-0738-4330-89de-83cd990d9aa7	/ar	internal	desktop	2026-08-11 11:52:49.042209+00	pageview	\N
487	1cdd5416-a478-49ca-9948-35f4691ff68d	d98c9fe2-0738-4330-89de-83cd990d9aa7	/ar	internal	desktop	2026-08-11 12:15:24.791453+00	pageview	\N
488	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 12:15:29.757956+00	pageview	\N
489	1cdd5416-a478-49ca-9948-35f4691ff68d	d98c9fe2-0738-4330-89de-83cd990d9aa7	/ar	internal	desktop	2026-08-11 12:15:37.129586+00	pageview	\N
490	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 12:15:40.754962+00	pageview	\N
491	1cdd5416-a478-49ca-9948-35f4691ff68d	d98c9fe2-0738-4330-89de-83cd990d9aa7	/ar	internal	desktop	2026-08-11 12:19:59.643099+00	pageview	\N
492	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 12:20:03.95173+00	pageview	\N
493	1cdd5416-a478-49ca-9948-35f4691ff68d	d98c9fe2-0738-4330-89de-83cd990d9aa7	/ar	internal	desktop	2026-08-11 12:23:51.845428+00	pageview	\N
494	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 12:23:54.369559+00	pageview	\N
495	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 12:37:14.81732+00	pageview	\N
496	1cdd5416-a478-49ca-9948-35f4691ff68d	d98c9fe2-0738-4330-89de-83cd990d9aa7	/ar	internal	desktop	2026-08-11 12:37:25.712105+00	pageview	\N
497	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 12:37:28.117237+00	pageview	\N
498	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/en	internal	desktop	2026-08-11 12:39:25.119019+00	pageview	\N
499	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/en/products	internal	desktop	2026-08-11 12:39:29.09301+00	pageview	\N
500	3c232c33-8f57-449b-80c8-549d88452905	f07724be-7a24-48f6-80dc-6a55583759b1	/	internal	desktop	2026-08-11 12:39:45.417284+00	pageview	\N
502	3c232c33-8f57-449b-80c8-549d88452905	f6f43323-6924-4d72-a154-2d15c2d5b12e	/en	internal	desktop	2026-08-11 15:35:20.69187+00	pageview	\N
501	3c232c33-8f57-449b-80c8-549d88452905	f6f43323-6924-4d72-a154-2d15c2d5b12e	/	internal	desktop	2026-08-11 15:35:20.696641+00	pageview	\N
504	3c232c33-8f57-449b-80c8-549d88452905	98d2e558-2a2b-4e58-b41a-a494e75ad0e4	/en	internal	desktop	2026-08-12 07:28:43.333409+00	pageview	\N
503	3c232c33-8f57-449b-80c8-549d88452905	98d2e558-2a2b-4e58-b41a-a494e75ad0e4	/	internal	desktop	2026-08-12 07:28:43.325669+00	pageview	\N
505	3c232c33-8f57-449b-80c8-549d88452905	98d2e558-2a2b-4e58-b41a-a494e75ad0e4	/	internal	desktop	2026-08-12 13:58:33.544202+00	pageview	\N
506	3c232c33-8f57-449b-80c8-549d88452905	98d2e558-2a2b-4e58-b41a-a494e75ad0e4	/en	internal	desktop	2026-08-12 13:58:33.982815+00	pageview	\N
507	3c232c33-8f57-449b-80c8-549d88452905	ca8770ae-bd35-4eb1-bf7e-9d6a4c0f4adf	/en	internal	desktop	2026-08-12 20:48:43.752729+00	pageview	\N
508	3c232c33-8f57-449b-80c8-549d88452905	ca8770ae-bd35-4eb1-bf7e-9d6a4c0f4adf	/	internal	desktop	2026-08-12 20:48:43.749992+00	pageview	\N
509	8500f44e-b46b-413d-a2cd-d6acada2d0f8	e46ed65b-e0e2-49b8-a1b8-c935d9cbda69	/	direct	desktop	2026-08-12 20:49:00.556762+00	pageview	\N
510	3c232c33-8f57-449b-80c8-549d88452905	ca8770ae-bd35-4eb1-bf7e-9d6a4c0f4adf	/	internal	desktop	2026-08-13 01:32:22.559914+00	pageview	\N
511	3c232c33-8f57-449b-80c8-549d88452905	ca8770ae-bd35-4eb1-bf7e-9d6a4c0f4adf	/en	internal	desktop	2026-08-13 01:32:22.901753+00	pageview	\N
512	3c232c33-8f57-449b-80c8-549d88452905	ca8770ae-bd35-4eb1-bf7e-9d6a4c0f4adf	/	internal	desktop	2026-08-13 02:48:36.680308+00	pageview	\N
513	3c232c33-8f57-449b-80c8-549d88452905	ca8770ae-bd35-4eb1-bf7e-9d6a4c0f4adf	/en	internal	desktop	2026-08-13 02:48:36.890535+00	pageview	\N
515	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 06:20:16.495203+00	pageview	\N
514	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/	internal	desktop	2026-08-13 06:20:16.493212+00	pageview	\N
516	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/tr	internal	desktop	2026-08-13 06:20:37.216455+00	pageview	\N
517	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/	internal	desktop	2026-08-13 06:20:37.229525+00	pageview	\N
518	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/urunler	internal	desktop	2026-08-13 06:20:56.436757+00	pageview	\N
519	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/teklif-al	internal	desktop	2026-08-13 06:22:09.042067+00	pageview	\N
520	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/haberler	internal	desktop	2026-08-13 06:22:23.458085+00	pageview	\N
521	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/teklif-al	internal	desktop	2026-08-13 06:22:58.265033+00	pageview	\N
522	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/kurumsal	internal	desktop	2026-08-13 06:23:00.73968+00	pageview	\N
523	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/urunler	internal	desktop	2026-08-13 06:23:21.926932+00	pageview	\N
524	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/kurumsal	internal	desktop	2026-08-13 06:41:46.486385+00	pageview	\N
525	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/kurumsal	internal	desktop	2026-08-13 06:51:38.70937+00	pageview	\N
526	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 06:51:38.915353+00	pageview	\N
527	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/kurumsal	internal	desktop	2026-08-13 06:52:20.352701+00	pageview	\N
528	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/kurumsal	internal	desktop	2026-08-13 06:58:19.770363+00	pageview	\N
529	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 06:58:19.774872+00	pageview	\N
530	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/kurumsal	internal	desktop	2026-08-13 06:58:22.145141+00	pageview	\N
531	8500f44e-b46b-413d-a2cd-d6acada2d0f8	8e7db1f9-c588-4e9b-8f97-406f8910926a	/kurumsal	Twitter	desktop	2026-08-13 06:59:54.911077+00	pageview	\N
532	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/sertifikalar	internal	desktop	2026-08-13 07:12:45.956641+00	pageview	\N
533	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/kurumsal	internal	desktop	2026-08-13 07:12:49.263299+00	pageview	\N
534	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/sertifikalar	internal	desktop	2026-08-13 07:12:50.338465+00	pageview	\N
535	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/kurumsal	internal	desktop	2026-08-13 07:12:52.144591+00	pageview	\N
536	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/kurumsal	internal	desktop	2026-08-13 07:13:10.409889+00	click	Teklif Al (Üst Menü)
537	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/teklif-al	internal	desktop	2026-08-13 07:13:10.6093+00	pageview	\N
538	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/teklif-al	internal	desktop	2026-08-13 07:19:33.372657+00	pageview	\N
539	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en/get-a-quote	internal	desktop	2026-08-13 07:19:33.557494+00	pageview	\N
540	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en/get-a-quote	internal	desktop	2026-08-13 07:20:23.361245+00	pageview	\N
541	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en/get-a-quote	internal	desktop	2026-08-13 07:21:11.520104+00	pageview	\N
542	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/	internal	desktop	2026-08-13 07:22:07.939526+00	pageview	\N
543	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 07:22:08.335115+00	pageview	\N
544	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 07:25:31.093709+00	pageview	\N
545	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/	internal	desktop	2026-08-13 07:26:13.06586+00	pageview	\N
546	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 07:26:13.449099+00	pageview	\N
547	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 07:39:58.165065+00	pageview	\N
548	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 07:40:04.349881+00	pageview	\N
549	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 07:40:56.128303+00	pageview	\N
550	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 07:42:05.20761+00	pageview	\N
551	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 07:45:43.124023+00	pageview	\N
552	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 07:46:54.483673+00	pageview	\N
553	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/	internal	desktop	2026-08-13 08:00:45.893969+00	pageview	\N
554	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 08:00:46.270187+00	pageview	\N
555	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en/news	internal	desktop	2026-08-13 08:07:34.379443+00	pageview	\N
556	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en/news	internal	desktop	2026-08-13 08:07:50.903929+00	click	Teklif Al (Üst Menü)
557	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en/get-a-quote	internal	desktop	2026-08-13 08:07:50.916382+00	pageview	\N
558	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en/get-a-quote	internal	desktop	2026-08-13 08:10:10.953864+00	pageview	\N
559	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/kurumsal	internal	desktop	2026-08-13 08:15:52.548567+00	pageview	\N
560	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/kurumsal	internal	desktop	2026-08-13 08:16:03.997011+00	pageview	\N
561	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 08:16:04.540562+00	pageview	\N
562	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 08:16:20.330344+00	pageview	\N
563	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 08:16:28.917656+00	pageview	\N
564	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 08:16:56.880827+00	pageview	\N
565	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 08:17:11.701886+00	pageview	\N
566	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/kurumsal	internal	desktop	2026-08-13 08:17:50.340834+00	pageview	\N
567	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 08:17:50.473845+00	pageview	\N
568	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 08:18:12.782983+00	pageview	\N
569	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 08:18:41.411401+00	pageview	\N
570	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 08:18:54.077019+00	pageview	\N
571	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en/news	internal	desktop	2026-08-13 08:18:56.581529+00	pageview	\N
572	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 08:20:06.710466+00	pageview	\N
573	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/kurumsal	internal	desktop	2026-08-13 08:20:32.059161+00	pageview	\N
574	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/	internal	desktop	2026-08-13 08:20:36.011053+00	pageview	\N
575	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/kurumsal	internal	desktop	2026-08-13 08:20:36.462674+00	pageview	\N
576	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 08:41:08.551761+00	pageview	\N
577	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 08:41:47.563774+00	pageview	\N
578	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 08:42:08.099652+00	pageview	\N
579	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 08:42:41.328749+00	pageview	\N
580	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 08:45:18.192024+00	pageview	\N
581	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 08:50:25.853243+00	pageview	\N
582	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 08:57:32.806881+00	pageview	\N
583	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 09:02:55.299894+00	pageview	\N
584	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/	internal	desktop	2026-08-13 09:10:24.117519+00	pageview	\N
585	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 09:10:24.493034+00	pageview	\N
586	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 09:10:32.299306+00	pageview	\N
587	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 09:11:55.521833+00	pageview	\N
588	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/	internal	desktop	2026-08-13 09:12:23.93165+00	pageview	\N
589	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 09:12:24.38322+00	pageview	\N
590	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 09:14:33.315138+00	pageview	\N
591	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 09:47:57.825919+00	pageview	\N
592	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en/products	internal	desktop	2026-08-13 09:48:25.046468+00	pageview	\N
593	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en/products	internal	desktop	2026-08-13 09:48:34.417025+00	click	Ürün: Dental Vakum Sistemi
594	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en/products/dental-vacuum-system	internal	desktop	2026-08-13 09:48:34.869748+00	pageview	\N
595	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en/products/dental-vacuum-system	internal	desktop	2026-08-13 09:54:38.508273+00	pageview	\N
596	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/	internal	desktop	2026-08-13 09:57:53.871189+00	pageview	\N
597	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 09:57:54.479728+00	pageview	\N
598	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 10:00:25.285618+00	pageview	\N
599	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/	internal	desktop	2026-08-13 10:03:42.643995+00	pageview	\N
600	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 10:03:42.835589+00	pageview	\N
601	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/	internal	desktop	2026-08-13 10:06:32.582176+00	pageview	\N
602	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 10:06:32.791588+00	pageview	\N
603	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 10:07:13.596282+00	pageview	\N
604	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en/products/1	internal	desktop	2026-08-13 10:08:50.592765+00	pageview	\N
605	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en	internal	desktop	2026-08-13 10:08:53.529886+00	pageview	\N
606	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en/products	internal	desktop	2026-08-13 10:08:59.419591+00	pageview	\N
607	3c232c33-8f57-449b-80c8-549d88452905	9a000b4a-cb6c-4235-812f-2ac126b0153f	/en/products	internal	desktop	2026-08-13 10:12:07.369951+00	click	Katalog İndir: Basınçlı Hava Santralleri 2026 Katalog
608	8500f44e-b46b-413d-a2cd-d6acada2d0f8	2d2973b5-189c-47cc-9bc5-7a4e181efd8e	/en/artifacts/oxymed-medikal/public/assets/BASIN%C3%87LI%20HAVA%20SANTRALLER%C4%B0%202026%20KATALOG.pdf	direct	desktop	2026-08-13 10:12:14.695018+00	pageview	\N
609	8500f44e-b46b-413d-a2cd-d6acada2d0f8	2d2973b5-189c-47cc-9bc5-7a4e181efd8e	/	direct	desktop	2026-08-13 10:12:15.079599+00	pageview	\N
610	8500f44e-b46b-413d-a2cd-d6acada2d0f8	2d2973b5-189c-47cc-9bc5-7a4e181efd8e	/kurumsal	direct	desktop	2026-08-13 10:12:20.743881+00	pageview	\N
611	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/	internal	desktop	2026-08-14 08:49:13.162166+00	pageview	\N
612	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en	internal	desktop	2026-08-14 08:49:13.465612+00	pageview	\N
613	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products	internal	desktop	2026-08-14 08:49:22.75694+00	pageview	\N
614	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products	internal	desktop	2026-08-14 08:49:28.356239+00	click	Ürün: Dental Vakum Pompası
615	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products/dental-vacuum-pump	internal	desktop	2026-08-14 08:49:28.592742+00	pageview	\N
616	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products	internal	desktop	2026-08-14 08:49:41.615408+00	pageview	\N
617	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products	internal	desktop	2026-08-14 08:49:50.172616+00	click	Ürün: Cerrahi Pendant Ünitesi
618	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products/cerrahi-pendant-unitesi	internal	desktop	2026-08-14 08:49:50.194722+00	pageview	\N
619	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products	internal	desktop	2026-08-14 08:49:51.319985+00	pageview	\N
620	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products	internal	desktop	2026-08-14 08:49:52.341437+00	click	Ürün: Cerrahi Pendant Ünitesi
621	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products/cerrahi-pendant-unitesi	internal	desktop	2026-08-14 08:49:52.345997+00	pageview	\N
622	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products	internal	desktop	2026-08-14 08:49:55.380814+00	pageview	\N
623	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products	internal	desktop	2026-08-14 08:49:56.639783+00	click	Ürün: Yoğun Bakım Pendant Ünitesi
624	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products/yogun-bakim-pendant-unitesi	internal	desktop	2026-08-14 08:49:56.645762+00	pageview	\N
625	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products	internal	desktop	2026-08-14 08:49:58.037323+00	pageview	\N
626	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products	internal	desktop	2026-08-14 08:49:59.585989+00	click	Ürün: Anestezi Pendant Ünitesi
627	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products/anestezi-pendant-unitesi	internal	desktop	2026-08-14 08:49:59.593947+00	pageview	\N
628	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products	internal	desktop	2026-08-14 08:50:30.241755+00	pageview	\N
629	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products	internal	desktop	2026-08-14 10:51:01.092472+00	click	Telefon (Üst Menü)
630	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products	internal	desktop	2026-08-14 10:51:28.531933+00	click	Ürün: Kat Kontrol Panosu
631	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products/gas-control-panel	internal	desktop	2026-08-14 10:51:28.732492+00	pageview	\N
632	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products	internal	desktop	2026-08-14 10:53:16.371545+00	pageview	\N
633	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products	internal	desktop	2026-08-14 10:53:22.515304+00	click	Ürün: Amalgam Separatörü
634	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products/amalgam-separator	internal	desktop	2026-08-14 10:53:26.038013+00	pageview	\N
635	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products	internal	desktop	2026-08-14 10:53:41.857407+00	pageview	\N
636	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products	internal	desktop	2026-08-14 10:53:48.872394+00	click	Ürün: Dental Vakum Sistemi
637	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products/dental-vacuum-system	internal	desktop	2026-08-14 10:53:52.645706+00	pageview	\N
638	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products	internal	desktop	2026-08-14 10:54:04.141877+00	pageview	\N
639	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f2332ee-013f-45ff-8998-9c6ef74130da	/en/products	Twitter	desktop	2026-08-14 10:54:16.90645+00	pageview	\N
640	8500f44e-b46b-413d-a2cd-d6acada2d0f8	19f38cc6-f912-4d60-b8ff-2472a964f7c9	/en/products/dental-vacuum-pump	internal	desktop	2026-08-14 10:54:27.403758+00	pageview	\N
641	8500f44e-b46b-413d-a2cd-d6acada2d0f8	34e019b0-09f0-4fe6-88e0-a9182ea4f023	/en/products/anestezi-pendant-unitesi	internal	desktop	2026-08-14 10:54:28.058958+00	pageview	\N
642	8500f44e-b46b-413d-a2cd-d6acada2d0f8	2893d680-9dfb-48e4-8846-13cd6e73b021	/en/products/yogun-bakim-pendant-unitesi	internal	desktop	2026-08-14 10:54:30.542561+00	pageview	\N
643	8500f44e-b46b-413d-a2cd-d6acada2d0f8	f4e84a02-fb03-4062-8413-db2571662bca	/en/products/cerrahi-pendant-unitesi	internal	desktop	2026-08-14 10:54:31.315386+00	pageview	\N
644	8500f44e-b46b-413d-a2cd-d6acada2d0f8	9a8de3f0-8df3-4705-a125-304817a40d0b	/en/products/dental-vacuum-system	internal	desktop	2026-08-14 11:01:12.829295+00	pageview	\N
645	8500f44e-b46b-413d-a2cd-d6acada2d0f8	9a8de3f0-8df3-4705-a125-304817a40d0b	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-14 11:01:40.941078+00	pageview	\N
646	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products	internal	desktop	2026-08-14 14:35:25.738686+00	pageview	\N
647	8500f44e-b46b-413d-a2cd-d6acada2d0f8	9a8de3f0-8df3-4705-a125-304817a40d0b	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-14 14:35:28.652147+00	pageview	\N
648	8500f44e-b46b-413d-a2cd-d6acada2d0f8	1f2332ee-013f-45ff-8998-9c6ef74130da	/en/products	Twitter	desktop	2026-08-14 14:35:28.818509+00	pageview	\N
649	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/	internal	desktop	2026-08-14 14:40:24.117123+00	pageview	\N
650	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en	internal	desktop	2026-08-14 14:40:24.598056+00	pageview	\N
651	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en	internal	desktop	2026-08-14 14:40:44.855471+00	pageview	\N
652	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/	internal	desktop	2026-08-14 14:42:35.547451+00	pageview	\N
653	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en	internal	desktop	2026-08-14 14:42:36.038715+00	pageview	\N
654	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en	internal	desktop	2026-08-14 14:43:07.751631+00	pageview	\N
655	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/referanslar	internal	desktop	2026-08-14 14:47:09.037141+00	pageview	\N
656	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/urunler	internal	desktop	2026-08-14 14:47:10.342657+00	pageview	\N
657	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/urunler	internal	desktop	2026-08-14 14:47:13.139793+00	click	Ürün: Dental Vakum Pompası
658	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-14 14:47:14.65602+00	pageview	\N
659	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products/dental-vacuum-pump	internal	desktop	2026-08-14 14:47:20.54102+00	pageview	\N
660	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/de/produkte/dental-vakuumpumpe	internal	desktop	2026-08-14 14:47:22.751415+00	pageview	\N
661	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-14 14:47:24.761824+00	pageview	\N
662	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/de/produkte/dental-vakuumpumpe	internal	desktop	2026-08-14 14:47:27.641983+00	pageview	\N
663	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products/dental-vacuum-pump	internal	desktop	2026-08-14 14:47:28.383834+00	pageview	\N
664	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products	internal	desktop	2026-08-14 14:47:29.581579+00	pageview	\N
665	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products	internal	desktop	2026-08-14 14:47:32.469034+00	click	Ürün: Cerrahi Pendant Ünitesi
666	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/products/cerrahi-pendant-unitesi	internal	desktop	2026-08-14 14:47:32.484685+00	pageview	\N
688	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/	internal	desktop	2026-08-14 14:49:10.017969+00	pageview	\N
689	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/urunler	internal	desktop	2026-08-14 14:49:51.605406+00	pageview	\N
690	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/urunler	internal	desktop	2026-08-14 14:49:58.000556+00	click	Ürün: Anestezi Pendant Ünitesi
691	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/urunler/anestezi-pendant-unitesi	internal	desktop	2026-08-14 14:49:58.010689+00	pageview	\N
692	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/urunler	internal	desktop	2026-08-14 14:50:00.061318+00	pageview	\N
693	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/	internal	desktop	2026-08-14 14:53:11.388995+00	pageview	\N
694	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/teklif-al	internal	desktop	2026-08-14 14:53:13.619197+00	pageview	\N
695	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/en/get-a-quote	internal	desktop	2026-08-14 14:53:18.716888+00	pageview	\N
696	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/referanslar	internal	desktop	2026-08-14 14:53:22.143208+00	pageview	\N
697	3c232c33-8f57-449b-80c8-549d88452905	608e8cd5-7d29-4072-804a-0a0f409f57e2	/	internal	desktop	2026-08-14 15:01:05.587374+00	pageview	\N
698	3c232c33-8f57-449b-80c8-549d88452905	79518a80-4a82-48e9-9dba-1e3b7e2d8b5c	/	internal	desktop	2026-08-16 12:39:28.55845+00	pageview	\N
699	3c232c33-8f57-449b-80c8-549d88452905	79518a80-4a82-48e9-9dba-1e3b7e2d8b5c	/en	internal	desktop	2026-08-16 12:39:28.758772+00	pageview	\N
700	3c232c33-8f57-449b-80c8-549d88452905	79518a80-4a82-48e9-9dba-1e3b7e2d8b5c	/en/products/13	internal	desktop	2026-08-16 12:42:22.652936+00	pageview	\N
701	3c232c33-8f57-449b-80c8-549d88452905	79518a80-4a82-48e9-9dba-1e3b7e2d8b5c	/kurumsal	internal	desktop	2026-08-16 12:43:25.59694+00	pageview	\N
702	3c232c33-8f57-449b-80c8-549d88452905	79518a80-4a82-48e9-9dba-1e3b7e2d8b5c	/urunler	internal	desktop	2026-08-16 12:43:28.033636+00	pageview	\N
703	3c232c33-8f57-449b-80c8-549d88452905	79518a80-4a82-48e9-9dba-1e3b7e2d8b5c	/urunler	internal	desktop	2026-08-16 12:43:31.361835+00	click	Ürün: Yoğun Bakım Pendant Ünitesi
704	3c232c33-8f57-449b-80c8-549d88452905	79518a80-4a82-48e9-9dba-1e3b7e2d8b5c	/urunler/yogun-bakim-pendant-unitesi	internal	desktop	2026-08-16 12:43:31.36974+00	pageview	\N
705	3c232c33-8f57-449b-80c8-549d88452905	79518a80-4a82-48e9-9dba-1e3b7e2d8b5c	/en	internal	desktop	2026-08-16 12:43:37.960943+00	pageview	\N
706	3c232c33-8f57-449b-80c8-549d88452905	79518a80-4a82-48e9-9dba-1e3b7e2d8b5c	/en/products/yogun-bakim-pendant-unitesi	internal	desktop	2026-08-16 12:43:41.933708+00	pageview	\N
707	3c232c33-8f57-449b-80c8-549d88452905	79518a80-4a82-48e9-9dba-1e3b7e2d8b5c	/en/products	internal	desktop	2026-08-16 12:49:17.255589+00	pageview	\N
708	3c232c33-8f57-449b-80c8-549d88452905	79518a80-4a82-48e9-9dba-1e3b7e2d8b5c	/en/products	internal	desktop	2026-08-16 12:50:16.058709+00	click	Ürün: Kat Kontrol Panosu
709	3c232c33-8f57-449b-80c8-549d88452905	79518a80-4a82-48e9-9dba-1e3b7e2d8b5c	/en/products/gas-control-panel	internal	desktop	2026-08-16 12:50:16.251469+00	pageview	\N
710	3c232c33-8f57-449b-80c8-549d88452905	79518a80-4a82-48e9-9dba-1e3b7e2d8b5c	/fa/mahsulat/panel-kontrol-gaz	internal	desktop	2026-08-16 12:50:33.577553+00	pageview	\N
711	3c232c33-8f57-449b-80c8-549d88452905	79518a80-4a82-48e9-9dba-1e3b7e2d8b5c	/fa/mahsulat/panel-kontrol-gaz	internal	desktop	2026-08-16 12:50:39.100195+00	click	E-posta (Üst Menü)
712	3c232c33-8f57-449b-80c8-549d88452905	79518a80-4a82-48e9-9dba-1e3b7e2d8b5c	/ar/muntajat/lawhat-altahakum-bialghaz	internal	desktop	2026-08-16 12:50:44.530428+00	pageview	\N
713	3c232c33-8f57-449b-80c8-549d88452905	79518a80-4a82-48e9-9dba-1e3b7e2d8b5c	/ar/muntajat	internal	desktop	2026-08-16 12:50:48.382674+00	pageview	\N
714	3c232c33-8f57-449b-80c8-549d88452905	79518a80-4a82-48e9-9dba-1e3b7e2d8b5c	/ar/muntajat	internal	desktop	2026-08-16 12:50:50.277279+00	click	Ürün: Dental Vakum Sistemi
715	3c232c33-8f57-449b-80c8-549d88452905	79518a80-4a82-48e9-9dba-1e3b7e2d8b5c	/ar/muntajat/nizam-tafrigh-alasnan	internal	desktop	2026-08-16 12:50:53.961092+00	pageview	\N
716	3c232c33-8f57-449b-80c8-549d88452905	79518a80-4a82-48e9-9dba-1e3b7e2d8b5c	/de/produkte/dental-vakuumsystem	internal	desktop	2026-08-16 12:51:10.176904+00	pageview	\N
717	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 07:03:30.550317+00	pageview	\N
718	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/de	internal	desktop	2026-08-17 07:03:30.780268+00	pageview	\N
719	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/de	internal	desktop	2026-08-17 07:09:19.562085+00	pageview	\N
720	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/de	internal	desktop	2026-08-17 07:15:20.095624+00	pageview	\N
721	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/de	internal	desktop	2026-08-17 07:15:35.75099+00	pageview	\N
722	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/de	internal	desktop	2026-08-17 07:15:52.296884+00	pageview	\N
723	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/de	internal	desktop	2026-08-17 07:16:01.883097+00	pageview	\N
724	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/de	internal	desktop	2026-08-17 07:16:12.268496+00	pageview	\N
725	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/de	internal	desktop	2026-08-17 07:16:49.409183+00	pageview	\N
726	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/de	internal	desktop	2026-08-17 07:17:07.861094+00	pageview	\N
727	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/de	internal	desktop	2026-08-17 07:17:16.955267+00	pageview	\N
728	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/de	internal	desktop	2026-08-17 07:17:23.865988+00	pageview	\N
729	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 07:18:01.097751+00	pageview	\N
730	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/de	internal	desktop	2026-08-17 07:18:01.442088+00	pageview	\N
731	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/de/nachrichten	internal	desktop	2026-08-17 07:20:10.542989+00	pageview	\N
732	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/haberler	internal	desktop	2026-08-17 07:20:14.809405+00	pageview	\N
733	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/en/news	internal	desktop	2026-08-17 07:20:18.748826+00	pageview	\N
734	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/en/news/what-are-medical-gas-systems	internal	desktop	2026-08-17 07:20:21.253124+00	pageview	\N
735	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/en/news	internal	desktop	2026-08-17 07:20:24.644298+00	pageview	\N
736	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/haberler	internal	desktop	2026-08-17 07:20:28.973632+00	pageview	\N
737	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/haberler	internal	desktop	2026-08-17 07:26:20.689869+00	pageview	\N
738	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/haberler	internal	desktop	2026-08-17 07:26:35.140944+00	pageview	\N
739	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/haberler	internal	desktop	2026-08-17 07:28:35.867088+00	pageview	\N
740	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/referanslar	internal	desktop	2026-08-17 07:32:07.487496+00	pageview	\N
741	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/referanslar	internal	desktop	2026-08-17 07:35:37.336978+00	pageview	\N
742	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 07:36:01.763994+00	pageview	\N
743	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 07:54:21.5232+00	pageview	\N
744	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/urunler	internal	desktop	2026-08-17 07:54:55.623341+00	pageview	\N
745	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/urunler	internal	desktop	2026-08-17 07:55:00.230522+00	click	Ürün: Anestezi Pendant Ünitesi
746	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/urunler/anestezi-pendant-unitesi	internal	desktop	2026-08-17 07:55:00.237468+00	pageview	\N
747	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/sertifikalar	internal	desktop	2026-08-17 07:55:06.27708+00	pageview	\N
748	8500f44e-b46b-413d-a2cd-d6acada2d0f8	66280500-7a2a-4307-b970-e4069b280594	/	direct	desktop	2026-08-17 08:27:15.085223+00	pageview	\N
749	8500f44e-b46b-413d-a2cd-d6acada2d0f8	66280500-7a2a-4307-b970-e4069b280594	/urunler	direct	desktop	2026-08-17 08:27:20.952986+00	pageview	\N
750	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 08:40:29.771348+00	pageview	\N
751	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 08:42:26.690557+00	pageview	\N
752	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/kurumsal	internal	desktop	2026-08-17 08:43:07.524275+00	pageview	\N
753	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/urunler	internal	desktop	2026-08-17 08:43:10.087741+00	pageview	\N
754	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/urunler	internal	desktop	2026-08-17 08:43:10.886138+00	click	Ürün: Yatak Başı Ünitesi
755	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/urunler/yatak-basi-unitesi	internal	desktop	2026-08-17 08:43:10.887448+00	pageview	\N
756	8500f44e-b46b-413d-a2cd-d6acada2d0f8	66280500-7a2a-4307-b970-e4069b280594	/urunler	internal	desktop	2026-08-17 08:45:12.342418+00	pageview	\N
757	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/teklif-al	internal	desktop	2026-08-17 09:04:49.071727+00	pageview	\N
758	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 09:04:53.363938+00	pageview	\N
759	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 09:50:08.526943+00	pageview	\N
760	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 09:50:50.645278+00	pageview	\N
761	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 09:51:10.670428+00	pageview	\N
762	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 09:51:20.967063+00	pageview	\N
763	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 09:51:44.559791+00	pageview	\N
764	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/kurumsal	internal	desktop	2026-08-17 09:52:29.651374+00	pageview	\N
765	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/urunler	internal	desktop	2026-08-17 09:52:31.817173+00	pageview	\N
766	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/referanslar	internal	desktop	2026-08-17 09:52:32.704221+00	pageview	\N
767	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/urunler	internal	desktop	2026-08-17 09:52:35.729337+00	pageview	\N
768	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 10:17:31.921732+00	pageview	\N
769	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 11:10:41.611266+00	pageview	\N
770	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 11:52:10.310438+00	pageview	\N
771	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/urunler	internal	desktop	2026-08-17 12:18:39.645568+00	pageview	\N
772	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/urunler	internal	desktop	2026-08-17 12:18:43.064224+00	click	Katalog İndir: Basınçlı Hava Santralleri 2026 Katalog
847	3c232c33-8f57-449b-80c8-549d88452905	b0a9f997-1302-4da2-998c-a8898546f686	/urunler	internal	desktop	2026-08-17 14:55:57.904502+00	pageview	\N
773	8500f44e-b46b-413d-a2cd-d6acada2d0f8	fda91af0-18a9-42a6-9d82-e3c3a1c13d3c	/artifacts/oxymed-medikal/public/assets/BASIN%C3%87LI%20HAVA%20SANTRALLER%C4%B0%202026%20KATALOG.pdf	direct	desktop	2026-08-17 12:18:48.674318+00	pageview	\N
774	8500f44e-b46b-413d-a2cd-d6acada2d0f8	fda91af0-18a9-42a6-9d82-e3c3a1c13d3c	/	direct	desktop	2026-08-17 12:18:48.728724+00	pageview	\N
775	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 12:20:54.912196+00	pageview	\N
776	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/urunler	internal	desktop	2026-08-17 13:02:02.877533+00	pageview	\N
777	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/urunler	internal	desktop	2026-08-17 13:02:07.394913+00	click	Ürün: Yatak Başı Ünitesi
778	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/urunler/yatak-basi-unitesi	internal	desktop	2026-08-17 13:02:07.408972+00	pageview	\N
779	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/urunler	internal	desktop	2026-08-17 13:02:09.982923+00	pageview	\N
780	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/urunler	internal	desktop	2026-08-17 13:02:10.616707+00	click	Ürün: Anestezi Pendant Ünitesi
781	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/urunler/anestezi-pendant-unitesi	internal	desktop	2026-08-17 13:02:10.622516+00	pageview	\N
782	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/urunler	internal	desktop	2026-08-17 13:02:15.451442+00	pageview	\N
809	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 13:03:26.03564+00	pageview	\N
810	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/en	internal	desktop	2026-08-17 13:03:35.758648+00	pageview	\N
811	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 13:03:49.765955+00	pageview	\N
812	8500f44e-b46b-413d-a2cd-d6acada2d0f8	fda91af0-18a9-42a6-9d82-e3c3a1c13d3c	/	internal	desktop	2026-08-17 13:06:43.370336+00	pageview	\N
813	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 13:07:28.720471+00	pageview	\N
814	8500f44e-b46b-413d-a2cd-d6acada2d0f8	fda91af0-18a9-42a6-9d82-e3c3a1c13d3c	/	internal	desktop	2026-08-17 13:07:30.444719+00	pageview	\N
815	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 13:07:34.807534+00	pageview	\N
816	8500f44e-b46b-413d-a2cd-d6acada2d0f8	fda91af0-18a9-42a6-9d82-e3c3a1c13d3c	/	internal	desktop	2026-08-17 13:07:36.443817+00	pageview	\N
817	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 13:07:54.828273+00	pageview	\N
818	8500f44e-b46b-413d-a2cd-d6acada2d0f8	fda91af0-18a9-42a6-9d82-e3c3a1c13d3c	/	internal	desktop	2026-08-17 13:07:59.523611+00	pageview	\N
819	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 13:08:10.56526+00	pageview	\N
820	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 13:08:39.608765+00	pageview	\N
821	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 13:09:18.520218+00	pageview	\N
822	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 13:09:32.332981+00	pageview	\N
823	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 13:10:15.244308+00	pageview	\N
824	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 13:11:12.424716+00	pageview	\N
825	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 13:11:32.887461+00	pageview	\N
826	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 13:12:07.081167+00	pageview	\N
827	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/en	internal	desktop	2026-08-17 13:13:13.390254+00	pageview	\N
828	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/en/catalogs	internal	desktop	2026-08-17 13:13:57.613241+00	pageview	\N
829	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 13:16:24.432928+00	pageview	\N
830	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/en	internal	desktop	2026-08-17 13:16:24.627336+00	pageview	\N
831	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/en	internal	desktop	2026-08-17 13:17:55.600925+00	pageview	\N
832	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/en	internal	desktop	2026-08-17 13:20:09.381859+00	pageview	\N
833	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/en/products	internal	desktop	2026-08-17 13:22:07.716837+00	pageview	\N
834	8500f44e-b46b-413d-a2cd-d6acada2d0f8	fda91af0-18a9-42a6-9d82-e3c3a1c13d3c	/	internal	desktop	2026-08-17 13:27:09.115717+00	pageview	\N
835	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/en	internal	desktop	2026-08-17 13:27:53.109231+00	pageview	\N
836	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 13:29:41.738369+00	pageview	\N
837	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/en	internal	desktop	2026-08-17 13:29:41.96769+00	pageview	\N
838	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/en	internal	desktop	2026-08-17 13:30:02.895131+00	pageview	\N
839	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/	internal	desktop	2026-08-17 13:30:57.062754+00	pageview	\N
840	3c232c33-8f57-449b-80c8-549d88452905	9401ac97-5e08-4ec3-81e1-35d70ceec782	/en	internal	desktop	2026-08-17 13:30:57.25559+00	pageview	\N
841	8500f44e-b46b-413d-a2cd-d6acada2d0f8	fda91af0-18a9-42a6-9d82-e3c3a1c13d3c	/	internal	desktop	2026-08-17 13:57:25.233811+00	pageview	\N
842	3c232c33-8f57-449b-80c8-549d88452905	b0a9f997-1302-4da2-998c-a8898546f686	/	internal	desktop	2026-08-17 14:03:46.083934+00	pageview	\N
843	3c232c33-8f57-449b-80c8-549d88452905	b0a9f997-1302-4da2-998c-a8898546f686	/en	internal	desktop	2026-08-17 14:03:46.597945+00	pageview	\N
844	3c232c33-8f57-449b-80c8-549d88452905	b0a9f997-1302-4da2-998c-a8898546f686	/	internal	desktop	2026-08-17 14:16:55.462911+00	pageview	\N
845	3c232c33-8f57-449b-80c8-549d88452905	b0a9f997-1302-4da2-998c-a8898546f686	/en	internal	desktop	2026-08-17 14:16:56.025434+00	pageview	\N
846	3c232c33-8f57-449b-80c8-549d88452905	b0a9f997-1302-4da2-998c-a8898546f686	/en/products	internal	desktop	2026-08-17 14:17:03.387936+00	pageview	\N
848	3c232c33-8f57-449b-80c8-549d88452905	b0a9f997-1302-4da2-998c-a8898546f686	/urunler	internal	desktop	2026-08-17 14:56:00.722803+00	click	Ürün: Yatak Başı Ünitesi
849	3c232c33-8f57-449b-80c8-549d88452905	b0a9f997-1302-4da2-998c-a8898546f686	/urunler/yatak-basi-unitesi	internal	desktop	2026-08-17 14:56:00.913554+00	pageview	\N
850	3c232c33-8f57-449b-80c8-549d88452905	b0a9f997-1302-4da2-998c-a8898546f686	/	internal	desktop	2026-08-17 15:12:18.238366+00	pageview	\N
851	3c232c33-8f57-449b-80c8-549d88452905	b0a9f997-1302-4da2-998c-a8898546f686	/	internal	desktop	2026-08-17 15:12:32.25032+00	pageview	\N
852	8500f44e-b46b-413d-a2cd-d6acada2d0f8	fda91af0-18a9-42a6-9d82-e3c3a1c13d3c	/	internal	desktop	2026-08-17 15:13:18.414495+00	pageview	\N
853	3c232c33-8f57-449b-80c8-549d88452905	b0a9f997-1302-4da2-998c-a8898546f686	/	internal	desktop	2026-08-17 15:19:31.040955+00	pageview	\N
854	8500f44e-b46b-413d-a2cd-d6acada2d0f8	fda91af0-18a9-42a6-9d82-e3c3a1c13d3c	/	internal	desktop	2026-08-17 15:19:47.008662+00	pageview	\N
855	3c232c33-8f57-449b-80c8-549d88452905	e2e50c29-5e71-4e6b-bc8a-45fad9e2819d	/	internal	desktop	2026-08-17 15:40:05.664126+00	pageview	\N
856	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 19:41:05.897121+00	pageview	\N
857	8500f44e-b46b-413d-a2cd-d6acada2d0f8	25ea4f3c-bf2b-4448-9a12-80ff21fe9d91	/	direct	desktop	2026-08-17 19:51:20.554187+00	pageview	\N
858	8500f44e-b46b-413d-a2cd-d6acada2d0f8	25ea4f3c-bf2b-4448-9a12-80ff21fe9d91	/kataloglar	direct	desktop	2026-08-17 19:52:10.46186+00	pageview	\N
859	8500f44e-b46b-413d-a2cd-d6acada2d0f8	25ea4f3c-bf2b-4448-9a12-80ff21fe9d91	/urunler	direct	desktop	2026-08-17 19:52:18.821104+00	pageview	\N
860	8500f44e-b46b-413d-a2cd-d6acada2d0f8	25ea4f3c-bf2b-4448-9a12-80ff21fe9d91	/urunler	direct	desktop	2026-08-17 19:52:34.999792+00	click	Ürün: Yatak Başı Ünitesi
861	8500f44e-b46b-413d-a2cd-d6acada2d0f8	25ea4f3c-bf2b-4448-9a12-80ff21fe9d91	/urunler/yatak-basi-unitesi	direct	desktop	2026-08-17 19:52:35.010905+00	pageview	\N
862	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 19:55:09.707378+00	pageview	\N
863	8500f44e-b46b-413d-a2cd-d6acada2d0f8	25ea4f3c-bf2b-4448-9a12-80ff21fe9d91	/urunler/yatak-basi-unitesi	internal	desktop	2026-08-17 19:55:13.035951+00	pageview	\N
864	8500f44e-b46b-413d-a2cd-d6acada2d0f8	25ea4f3c-bf2b-4448-9a12-80ff21fe9d91	/urunler/yatak-basi-unitesi	internal	desktop	2026-08-17 19:57:57.373296+00	pageview	\N
865	8500f44e-b46b-413d-a2cd-d6acada2d0f8	25ea4f3c-bf2b-4448-9a12-80ff21fe9d91	/urunler/yatak-basi-unitesi	internal	desktop	2026-08-17 20:02:09.392575+00	pageview	\N
866	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 20:03:27.602018+00	pageview	\N
867	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 20:04:16.337301+00	pageview	\N
868	8500f44e-b46b-413d-a2cd-d6acada2d0f8	25ea4f3c-bf2b-4448-9a12-80ff21fe9d91	/urunler/yatak-basi-unitesi	internal	desktop	2026-08-17 20:05:31.567582+00	pageview	\N
869	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 20:06:44.10458+00	pageview	\N
870	8500f44e-b46b-413d-a2cd-d6acada2d0f8	25ea4f3c-bf2b-4448-9a12-80ff21fe9d91	/	internal	desktop	2026-08-17 20:06:55.606789+00	pageview	\N
871	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 20:09:34.26032+00	pageview	\N
872	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/kurumsal	internal	desktop	2026-08-17 20:11:24.438145+00	pageview	\N
873	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 20:12:48.402292+00	pageview	\N
874	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 20:16:01.657854+00	pageview	\N
875	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 20:16:23.992125+00	pageview	\N
876	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 20:17:46.29911+00	pageview	\N
877	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 20:23:11.842545+00	pageview	\N
878	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/kurumsal	internal	desktop	2026-08-17 20:23:20.133046+00	pageview	\N
879	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 20:23:22.815461+00	pageview	\N
880	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 20:23:42.41939+00	click	Ürün: Kat Kontrol Panosu
881	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler/kat-kontrol-panosu	internal	desktop	2026-08-17 20:23:42.615456+00	pageview	\N
882	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 20:23:54.835863+00	pageview	\N
883	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/referanslar	internal	desktop	2026-08-17 20:24:00.261012+00	pageview	\N
884	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/haberler	internal	desktop	2026-08-17 20:24:12.079087+00	pageview	\N
885	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/servis	internal	desktop	2026-08-17 20:24:24.511032+00	pageview	\N
886	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 20:24:52.509198+00	pageview	\N
887	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 20:24:56.837825+00	click	Ürün: Yatak Başı Ünitesi
888	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler/yatak-basi-unitesi	internal	desktop	2026-08-17 20:24:56.844595+00	pageview	\N
889	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 20:26:28.203122+00	pageview	\N
890	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 20:26:31.333334+00	click	Teklif Al (Üst Menü)
891	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/teklif-al	internal	desktop	2026-08-17 20:26:31.345876+00	pageview	\N
892	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/haberler	internal	desktop	2026-08-17 20:26:34.756455+00	pageview	\N
893	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/haberler	internal	desktop	2026-08-17 20:35:05.185889+00	pageview	\N
894	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 20:35:57.88525+00	pageview	\N
895	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 20:37:06.753962+00	pageview	\N
896	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 20:39:15.587136+00	pageview	\N
897	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 20:40:55.767947+00	pageview	\N
898	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 20:41:11.662206+00	pageview	\N
899	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 20:42:05.334044+00	pageview	\N
900	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 20:47:12.792386+00	pageview	\N
901	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 20:47:14.379528+00	click	Ürün: Yatak Başı Ünitesi
902	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler/yatak-basi-unitesi	internal	desktop	2026-08-17 20:47:14.399378+00	pageview	\N
903	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 20:48:23.076781+00	pageview	\N
904	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 20:48:52.640305+00	pageview	\N
905	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 20:48:53.54201+00	click	Ürün: Yatak Başı Ünitesi
906	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler/yatak-basi-unitesi	internal	desktop	2026-08-17 20:48:53.547611+00	pageview	\N
907	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 20:49:17.762313+00	pageview	\N
908	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler/yatak-basi-unitesi	internal	desktop	2026-08-17 20:51:28.163076+00	pageview	\N
909	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/kurumsal	internal	desktop	2026-08-17 20:52:08.567015+00	pageview	\N
910	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 20:52:09.625907+00	pageview	\N
911	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 20:52:10.843417+00	click	Ürün: Dental Vakum Sistemi
912	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-17 20:52:15.491912+00	pageview	\N
913	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 20:52:51.60574+00	pageview	\N
914	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 20:52:53.183228+00	click	Ürün: Dental Vakum Pompası
915	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-17 20:52:53.388839+00	pageview	\N
916	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 20:52:56.089153+00	pageview	\N
917	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 20:52:56.810178+00	click	Ürün: Kat Kontrol Panosu
918	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler/kat-kontrol-panosu	internal	desktop	2026-08-17 20:52:56.954015+00	pageview	\N
919	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 20:53:08.310257+00	pageview	\N
920	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 20:53:09.680506+00	click	Ürün: Amalgam Separatörü
921	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler/amalgam-separator	internal	desktop	2026-08-17 20:53:13.207811+00	pageview	\N
922	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/haberler	internal	desktop	2026-08-17 20:53:18.062019+00	pageview	\N
923	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/servis	internal	desktop	2026-08-17 20:53:19.706616+00	pageview	\N
924	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 20:53:54.607018+00	pageview	\N
925	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 20:53:54.825+00	pageview	\N
926	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 20:56:25.463882+00	pageview	\N
927	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 20:56:26.435248+00	pageview	\N
928	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 21:02:53.289301+00	pageview	\N
929	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 21:03:47.050589+00	pageview	\N
930	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 21:03:56.404474+00	pageview	\N
931	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 21:04:08.415954+00	pageview	\N
932	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 21:04:30.939939+00	pageview	\N
933	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 21:05:54.637443+00	pageview	\N
934	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 21:07:51.542722+00	pageview	\N
935	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 21:08:37.520005+00	pageview	\N
936	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 21:09:02.208491+00	pageview	\N
937	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 21:09:59.857549+00	pageview	\N
938	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 21:10:03.658687+00	pageview	\N
939	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 21:10:04.482213+00	click	Ürün: Dental Vakum Pompası
940	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-17 21:10:04.68031+00	pageview	\N
941	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c465bbff-3740-438d-9ea7-cdf99bad1616	/urunler/dental-vakum-pompasi	Twitter	desktop	2026-08-17 21:10:47.283684+00	pageview	\N
942	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c465bbff-3740-438d-9ea7-cdf99bad1616	/kurumsal	Twitter	desktop	2026-08-17 21:10:56.343234+00	pageview	\N
943	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 21:13:47.44182+00	pageview	\N
944	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/kurumsal	internal	desktop	2026-08-17 21:13:57.528181+00	pageview	\N
945	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 21:15:23.564525+00	pageview	\N
946	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 21:16:22.839424+00	pageview	\N
947	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 21:17:09.745785+00	click	Ürün: Dental Vakum Pompası
948	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-17 21:17:09.750081+00	pageview	\N
949	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-17 21:20:08.133365+00	pageview	\N
950	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-17 21:21:24.493929+00	pageview	\N
951	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-17 21:22:10.04576+00	pageview	\N
952	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 21:22:31.871862+00	pageview	\N
953	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-17 21:32:41.923507+00	pageview	\N
954	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/kurumsal	internal	desktop	2026-08-17 21:32:50.072761+00	pageview	\N
955	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 21:32:50.887674+00	pageview	\N
956	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 21:32:52.58698+00	click	Ürün: Dental Vakum Sistemi
957	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-17 21:32:53.118639+00	pageview	\N
958	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-17 21:35:20.177879+00	pageview	\N
959	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 21:36:05.966237+00	pageview	\N
960	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-17 21:36:35.130952+00	pageview	\N
961	8500f44e-b46b-413d-a2cd-d6acada2d0f8	c465bbff-3740-438d-9ea7-cdf99bad1616	/kurumsal	internal	desktop	2026-08-17 21:39:24.694815+00	pageview	\N
962	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 21:39:35.285811+00	pageview	\N
963	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 21:39:37.455483+00	pageview	\N
964	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 21:39:38.649486+00	click	Ürün: Dental Vakum Sistemi
965	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-17 21:39:38.669901+00	pageview	\N
966	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/	internal	desktop	2026-08-17 21:41:24.65318+00	pageview	\N
967	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 21:41:30.730414+00	pageview	\N
968	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 21:41:32.03381+00	click	Ürün: Dental Vakum Sistemi
969	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-17 21:41:32.046941+00	pageview	\N
970	3c232c33-8f57-449b-80c8-549d88452905	dc09c4f6-0833-4dc3-bd1f-91d2c5d3b030	/urunler	internal	desktop	2026-08-17 21:41:42.378688+00	pageview	\N
971	3c232c33-8f57-449b-80c8-549d88452905	2b30dda8-b645-4b24-9051-9171dee92522	/	internal	desktop	2026-08-17 21:44:41.488945+00	pageview	\N
972	3c232c33-8f57-449b-80c8-549d88452905	2b30dda8-b645-4b24-9051-9171dee92522	/	internal	desktop	2026-08-17 22:32:28.054461+00	pageview	\N
973	3c232c33-8f57-449b-80c8-549d88452905	2b30dda8-b645-4b24-9051-9171dee92522	/	internal	desktop	2026-08-17 22:34:35.596288+00	pageview	\N
974	3c232c33-8f57-449b-80c8-549d88452905	2b30dda8-b645-4b24-9051-9171dee92522	/	internal	desktop	2026-08-17 22:45:06.366018+00	pageview	\N
975	3c232c33-8f57-449b-80c8-549d88452905	2b30dda8-b645-4b24-9051-9171dee92522	/	internal	desktop	2026-08-17 22:46:56.588313+00	pageview	\N
976	3c232c33-8f57-449b-80c8-549d88452905	2b30dda8-b645-4b24-9051-9171dee92522	/	internal	desktop	2026-08-17 22:47:04.859682+00	pageview	\N
977	3c232c33-8f57-449b-80c8-549d88452905	2b30dda8-b645-4b24-9051-9171dee92522	/	internal	desktop	2026-08-17 22:50:00.565314+00	pageview	\N
978	3c232c33-8f57-449b-80c8-549d88452905	2b30dda8-b645-4b24-9051-9171dee92522	/	internal	desktop	2026-08-17 22:51:51.725464+00	pageview	\N
979	3c232c33-8f57-449b-80c8-549d88452905	2b30dda8-b645-4b24-9051-9171dee92522	/	internal	desktop	2026-08-17 22:52:19.262967+00	pageview	\N
980	3c232c33-8f57-449b-80c8-549d88452905	2b30dda8-b645-4b24-9051-9171dee92522	/	internal	desktop	2026-08-17 22:57:53.315791+00	pageview	\N
981	3c232c33-8f57-449b-80c8-549d88452905	2b30dda8-b645-4b24-9051-9171dee92522	/	internal	desktop	2026-08-17 23:23:23.891233+00	pageview	\N
982	3c232c33-8f57-449b-80c8-549d88452905	2b30dda8-b645-4b24-9051-9171dee92522	/	internal	desktop	2026-08-18 01:41:23.443949+00	pageview	\N
983	3c232c33-8f57-449b-80c8-549d88452905	2b30dda8-b645-4b24-9051-9171dee92522	/	internal	desktop	2026-08-18 02:12:37.995475+00	pageview	\N
984	3c232c33-8f57-449b-80c8-549d88452905	2b30dda8-b645-4b24-9051-9171dee92522	/	internal	desktop	2026-08-18 03:09:40.930485+00	pageview	\N
985	3c232c33-8f57-449b-80c8-549d88452905	2b30dda8-b645-4b24-9051-9171dee92522	/	internal	desktop	2026-08-18 04:12:38.826036+00	pageview	\N
986	3c232c33-8f57-449b-80c8-549d88452905	2b30dda8-b645-4b24-9051-9171dee92522	/	internal	desktop	2026-08-18 07:41:16.765105+00	pageview	\N
987	3c232c33-8f57-449b-80c8-549d88452905	2b30dda8-b645-4b24-9051-9171dee92522	/	internal	desktop	2026-08-18 08:00:59.090231+00	pageview	\N
988	3c232c33-8f57-449b-80c8-549d88452905	2b30dda8-b645-4b24-9051-9171dee92522	/	internal	desktop	2026-08-18 08:01:04.824638+00	pageview	\N
989	3c232c33-8f57-449b-80c8-549d88452905	2b30dda8-b645-4b24-9051-9171dee92522	/	internal	desktop	2026-08-18 08:01:30.585223+00	pageview	\N
990	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/	internal	desktop	2026-08-18 11:05:14.513847+00	pageview	\N
991	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/urunler	internal	desktop	2026-08-18 11:08:31.472734+00	pageview	\N
992	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/kurumsal	internal	desktop	2026-08-18 11:08:32.532327+00	pageview	\N
993	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/referanslar	internal	desktop	2026-08-18 11:08:33.204346+00	pageview	\N
994	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:09:06.682152+00	pageview	\N
995	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler/medikal-gaz-sistemleri-nedir	internal	desktop	2026-08-18 11:09:09.654426+00	pageview	\N
996	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler/medikal-gaz-sistemleri-nedir	internal	desktop	2026-08-18 11:12:59.891888+00	pageview	\N
997	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:13:55.668715+00	pageview	\N
998	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler/medikal-gaz-sistemleri-nedir	internal	desktop	2026-08-18 11:14:03.863621+00	pageview	\N
999	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:14:09.686621+00	pageview	\N
1000	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler/medikal-gaz-sistemleri-nedir	internal	desktop	2026-08-18 11:14:12.142421+00	pageview	\N
1001	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:14:13.53825+00	pageview	\N
1002	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:20:05.329089+00	pageview	\N
1003	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:38:24.937156+00	pageview	\N
1004	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:38:57.564104+00	pageview	\N
1005	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:39:27.457767+00	pageview	\N
1006	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:39:50.122323+00	pageview	\N
1007	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:44:15.027655+00	pageview	\N
1008	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:48:04.47313+00	pageview	\N
1009	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:55:35.001342+00	pageview	\N
1010	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:55:39.367394+00	pageview	\N
1011	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:55:50.642931+00	pageview	\N
1012	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:56:07.025217+00	pageview	\N
1013	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:56:17.20408+00	pageview	\N
1014	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:56:29.986607+00	pageview	\N
1015	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:56:46.015862+00	pageview	\N
1016	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:56:58.791483+00	pageview	\N
1017	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:57:11.948929+00	pageview	\N
1018	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:57:28.490327+00	pageview	\N
1019	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:57:49.095789+00	pageview	\N
1020	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:58:08.002295+00	pageview	\N
1021	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:58:11.819017+00	pageview	\N
1022	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:58:18.108469+00	pageview	\N
1023	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:59:22.476254+00	pageview	\N
1024	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 11:59:44.817364+00	pageview	\N
1025	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 12:00:08.710169+00	pageview	\N
1026	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 12:00:32.655393+00	pageview	\N
1027	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 12:00:37.174335+00	pageview	\N
1028	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 12:00:41.307547+00	pageview	\N
1029	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 12:01:25.245529+00	pageview	\N
1030	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 12:02:15.60271+00	pageview	\N
1031	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 12:05:07.252485+00	pageview	\N
1032	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 12:05:23.315695+00	pageview	\N
1033	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 12:05:56.7495+00	pageview	\N
1034	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 12:06:20.988916+00	pageview	\N
1035	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 12:06:29.61033+00	pageview	\N
1036	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 12:06:37.248288+00	pageview	\N
1037	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 12:06:46.528201+00	pageview	\N
1038	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 12:07:05.426074+00	pageview	\N
1039	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 12:07:26.473643+00	pageview	\N
1040	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 12:07:41.716655+00	pageview	\N
1041	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 12:09:26.770005+00	pageview	\N
1042	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 12:10:14.781357+00	pageview	\N
1043	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 12:10:29.635614+00	pageview	\N
1044	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 12:13:03.695543+00	pageview	\N
1045	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 12:14:50.533124+00	pageview	\N
1046	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 12:26:14.800065+00	pageview	\N
1047	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/	internal	desktop	2026-08-18 12:26:58.785003+00	pageview	\N
1048	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/	internal	desktop	2026-08-18 12:27:16.024743+00	pageview	\N
1049	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/	internal	desktop	2026-08-18 12:29:14.444338+00	pageview	\N
1050	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/	internal	desktop	2026-08-18 12:29:26.954137+00	pageview	\N
1051	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/	internal	desktop	2026-08-18 12:29:58.334487+00	pageview	\N
1052	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/	internal	desktop	2026-08-18 12:30:09.206678+00	pageview	\N
1053	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/	internal	desktop	2026-08-18 12:30:14.606255+00	pageview	\N
1054	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/	internal	desktop	2026-08-18 12:30:23.999649+00	pageview	\N
1055	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/	internal	desktop	2026-08-18 12:36:13.371448+00	pageview	\N
1056	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/	internal	desktop	2026-08-18 12:40:26.291972+00	pageview	\N
1057	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/	internal	desktop	2026-08-18 12:45:37.361919+00	pageview	\N
1058	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/	internal	desktop	2026-08-18 12:45:59.611536+00	pageview	\N
1059	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/	internal	desktop	2026-08-18 13:01:31.263523+00	pageview	\N
1060	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/urunler	internal	desktop	2026-08-18 13:01:33.546808+00	pageview	\N
1061	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/urunler	internal	desktop	2026-08-18 13:01:35.477167+00	click	Ürün: Dental Vakum Sistemi
1062	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-18 13:01:35.506679+00	pageview	\N
1063	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/kurumsal	internal	desktop	2026-08-18 13:01:48.94251+00	pageview	\N
1064	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/urunler	internal	desktop	2026-08-18 13:01:50.22004+00	pageview	\N
1065	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/referanslar	internal	desktop	2026-08-18 13:01:52.371604+00	pageview	\N
1066	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/	internal	desktop	2026-08-18 13:01:57.03614+00	pageview	\N
1067	3c232c33-8f57-449b-80c8-549d88452905	0075eba8-2329-4a0c-9318-a61809134e96	/haberler	internal	desktop	2026-08-18 13:01:58.465023+00	pageview	\N
1068	3c232c33-8f57-449b-80c8-549d88452905	66113279-363a-45d5-9bba-52eeb13b3c72	/	internal	desktop	2026-08-19 07:15:19.688511+00	pageview	\N
1069	3c232c33-8f57-449b-80c8-549d88452905	7ff4063b-8e67-40c1-b72b-33ab4b12ac1f	/	internal	desktop	2026-08-19 09:53:15.425313+00	pageview	\N
1070	3c232c33-8f57-449b-80c8-549d88452905	7ff4063b-8e67-40c1-b72b-33ab4b12ac1f	/	internal	desktop	2026-08-19 10:02:47.319571+00	pageview	\N
1071	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 06:43:53.82444+00	pageview	\N
1072	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 06:47:19.737387+00	pageview	\N
1073	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/urunler	internal	desktop	2026-08-27 06:47:39.938798+00	pageview	\N
1074	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/urunler	internal	desktop	2026-08-27 06:47:48.418883+00	click	Ürün: Yatak Başı Ünitesi
1075	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/urunler/yatak-basi-unitesi	internal	desktop	2026-08-27 06:47:48.429587+00	pageview	\N
1076	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/urunler	internal	desktop	2026-08-27 06:47:51.737026+00	pageview	\N
1077	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/urunler	internal	desktop	2026-08-27 06:48:45.961252+00	pageview	\N
1078	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 06:52:47.595651+00	pageview	\N
1079	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 07:06:52.622897+00	pageview	\N
1080	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/urunler/medikal-vakum-santrali	internal	desktop	2026-08-27 07:41:49.593868+00	pageview	\N
1081	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-27 07:41:49.593448+00	pageview	\N
1082	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 07:41:57.039458+00	pageview	\N
1083	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/urunler/yatak-basi-unitesi	internal	desktop	2026-08-27 07:49:48.750914+00	pageview	\N
1084	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 07:49:49.637972+00	pageview	\N
1085	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/urunler/dental-vakum-pompasi	internal	desktop	2026-08-27 07:49:50.873416+00	pageview	\N
1086	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/urunler/medikal-vakum-santrali	internal	desktop	2026-08-27 07:49:50.877734+00	pageview	\N
1087	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 07:49:51.594754+00	pageview	\N
1088	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/urunler/dental-vakum-sistemi	internal	desktop	2026-08-27 07:49:52.951025+00	pageview	\N
1089	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 07:49:59.138415+00	pageview	\N
1090	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/urunler/kat-kontrol-panosu	internal	desktop	2026-08-27 07:49:59.925567+00	pageview	\N
1091	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/urunler	internal	desktop	2026-08-27 08:06:33.033516+00	pageview	\N
1092	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/urunler	internal	desktop	2026-08-27 08:06:47.391314+00	click	Ürün: Yatak Başı Ünitesi
1093	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/urunler/yatak-basi-unitesi	internal	desktop	2026-08-27 08:06:47.401734+00	pageview	\N
1094	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 08:40:03.659302+00	pageview	\N
1095	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 08:47:48.906906+00	pageview	\N
1096	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 08:49:00.767294+00	pageview	\N
1097	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 08:55:30.514631+00	pageview	\N
1098	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 09:21:46.548142+00	pageview	\N
1099	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 09:22:55.175375+00	pageview	\N
1100	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 09:52:10.84784+00	pageview	\N
1101	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 10:23:49.907327+00	pageview	\N
1102	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 10:29:00.640432+00	pageview	\N
1103	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 10:30:09.866716+00	pageview	\N
1104	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 10:30:58.572334+00	pageview	\N
1105	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 10:34:58.734122+00	pageview	\N
1106	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 10:35:55.013853+00	pageview	\N
1107	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 10:39:22.243445+00	pageview	\N
1108	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 10:39:32.14268+00	pageview	\N
1109	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 10:39:44.006437+00	pageview	\N
1110	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 10:39:57.51243+00	pageview	\N
1111	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 10:40:09.842613+00	pageview	\N
1112	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 10:40:22.365394+00	pageview	\N
1113	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 10:40:35.293051+00	pageview	\N
1114	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 10:41:09.21709+00	pageview	\N
1115	3c232c33-8f57-449b-80c8-549d88452905	f55ff4ae-45fb-4317-9524-7452cf3dac8c	/	internal	desktop	2026-08-27 11:07:22.126492+00	pageview	\N
\.


--
-- Data for Name: warranty_claims; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.warranty_claims (id, device_id, fault_type, fault_description, photo_urls, work_hours, personnel_note, decision_status, out_of_warranty_reason, admin_approval, admin_note, claimant_name, claimant_phone, claimant_email, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: warranty_devices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.warranty_devices (id, product_name, model, serial_number, qr_token, customer_firm, customer_contact, customer_phone, customer_email, install_date, warranty_start_date, warranty_end_date, warranty_type, maintenance_contract_status, last_maintenance_date, next_maintenance_date, status, notes, image_url, created_at, updated_at, production_order_item_id, device_type, plc_system, hmi_model, production_date, customer_department, customer_location) FROM stdin;
1	Gaz Merkezi Paneli	OXY-GP-2000	OXY-GP-200026260501	0a00a62f-1555-4bf1-988f-251a7aef320b	Ege Hastanesi	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-260501	\N	2026-05-26 22:16:41.243755+00	2026-05-26 22:16:41.243755+00	1	\N	\N	\N	\N	\N	\N
2	Gaz Merkezi Paneli	OXY-GP-2000	OXY-GP-200026260502	27d6c521-0576-429d-a830-e9d04435a00c	Ege Hastanesi	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-260501	\N	2026-05-26 22:16:41.262033+00	2026-05-26 22:16:41.262033+00	2	\N	\N	\N	\N	\N	\N
3	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230601	cc992c6f-de47-4221-896b-367d3a1ee13c	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:05.895794+00	2026-06-23 12:32:05.895794+00	3	\N	\N	\N	\N	\N	\N
4	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230602	fa172612-094b-4a2b-b361-267d08e696f2	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:05.913854+00	2026-06-23 12:32:05.913854+00	4	\N	\N	\N	\N	\N	\N
5	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230603	0792c5ee-3923-4f32-bf43-055e3149399b	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:05.92569+00	2026-06-23 12:32:05.92569+00	5	\N	\N	\N	\N	\N	\N
6	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230604	42e05f3c-c3ac-42e3-b1f7-2daf1441eeb4	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:05.936829+00	2026-06-23 12:32:05.936829+00	6	\N	\N	\N	\N	\N	\N
7	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230605	76d4c8b6-b2fc-4e97-8d3d-4b4d0ffbb9a1	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:05.947626+00	2026-06-23 12:32:05.947626+00	7	\N	\N	\N	\N	\N	\N
8	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230606	e4de82fa-81c5-4e41-bb4d-44261e111644	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:05.959797+00	2026-06-23 12:32:05.959797+00	8	\N	\N	\N	\N	\N	\N
9	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230607	749d1b37-9c0d-4214-b43d-01af8d56c311	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:05.97053+00	2026-06-23 12:32:05.97053+00	9	\N	\N	\N	\N	\N	\N
10	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230608	cecf46ec-deaf-4f1f-8d86-3b80fc61bd64	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:05.980895+00	2026-06-23 12:32:05.980895+00	10	\N	\N	\N	\N	\N	\N
11	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230609	498cb5ad-6c80-4dcd-9a86-a65fef9632b5	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:05.994133+00	2026-06-23 12:32:05.994133+00	11	\N	\N	\N	\N	\N	\N
12	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230610	77381fe5-1ed8-4543-8531-c3091e690bce	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:06.004849+00	2026-06-23 12:32:06.004849+00	12	\N	\N	\N	\N	\N	\N
13	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230611	68a4171d-af4d-4356-a73e-1c35fb65a887	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:06.015146+00	2026-06-23 12:32:06.015146+00	13	\N	\N	\N	\N	\N	\N
14	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230612	4c6bc121-c96b-4df8-9c65-64bdec03dd5e	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:06.025691+00	2026-06-23 12:32:06.025691+00	14	\N	\N	\N	\N	\N	\N
15	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230613	3868510d-39b8-4628-8b1b-2d690745df2b	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:06.036828+00	2026-06-23 12:32:06.036828+00	15	\N	\N	\N	\N	\N	\N
16	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230614	4d7734c2-d5ef-4bf2-bab5-605e36ad807e	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:06.050582+00	2026-06-23 12:32:06.050582+00	16	\N	\N	\N	\N	\N	\N
17	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230615	d4fcb8a6-4b2d-4e9d-8636-6ae5bf3cea59	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:06.060792+00	2026-06-23 12:32:06.060792+00	17	\N	\N	\N	\N	\N	\N
18	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230616	f03d6386-d7d0-4cb1-be98-dcf44fe5754b	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:06.073088+00	2026-06-23 12:32:06.073088+00	18	\N	\N	\N	\N	\N	\N
19	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230617	cfa95fc7-5589-4f6f-8473-9e77193e2417	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:06.083791+00	2026-06-23 12:32:06.083791+00	19	\N	\N	\N	\N	\N	\N
20	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230618	ea84f500-8609-4d11-9633-7673f48250a1	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:06.094448+00	2026-06-23 12:32:06.094448+00	20	\N	\N	\N	\N	\N	\N
21	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230619	4acc6672-baef-4fb3-ad1f-26d983e26a64	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:06.104526+00	2026-06-23 12:32:06.104526+00	21	\N	\N	\N	\N	\N	\N
22	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230620	d4dedee1-a8b4-4a0e-990a-456817446b96	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:06.11573+00	2026-06-23 12:32:06.11573+00	22	\N	\N	\N	\N	\N	\N
23	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230621	d9e4e75f-0253-4ef6-b4be-ea22e197f147	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:06.127498+00	2026-06-23 12:32:06.127498+00	23	\N	\N	\N	\N	\N	\N
24	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230622	13432bfe-69eb-4fc1-b7d7-1677d462a453	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:06.137965+00	2026-06-23 12:32:06.137965+00	24	\N	\N	\N	\N	\N	\N
25	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230623	07a73835-8e93-4f4f-9734-671f94ef9862	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:06.148181+00	2026-06-23 12:32:06.148181+00	25	\N	\N	\N	\N	\N	\N
26	Tek Kişilik Dental Teknisyen Masası - Model 02	DTM-02	DTM-0226230624	841ec94f-8ea5-4d39-9ded-2b22f951bf75	KROM İNŞ. TUR.İTH.İHR. SAN.ve TİC. LTD.ŞTİ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	taslak	Üretim emri: OXM-URT-2026-230614	\N	2026-06-23 12:32:06.158041+00	2026-06-23 12:32:06.158041+00	26	\N	\N	\N	\N	\N	\N
\.


--
-- Name: admin_audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admin_audit_logs_id_seq', 5, true);


--
-- Name: admin_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admin_users_id_seq', 2, true);


--
-- Name: catalogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.catalogs_id_seq', 1, true);


--
-- Name: certificates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.certificates_id_seq', 1, false);


--
-- Name: corporate_sections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.corporate_sections_id_seq', 3, true);


--
-- Name: email_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.email_logs_id_seq', 17, true);


--
-- Name: maintenance_kits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.maintenance_kits_id_seq', 1, false);


--
-- Name: material_reservations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.material_reservations_id_seq', 1, false);


--
-- Name: material_stock_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.material_stock_id_seq', 1, false);


--
-- Name: media_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.media_files_id_seq', 227, true);


--
-- Name: news_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.news_id_seq', 11, true);


--
-- Name: news_translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.news_translations_id_seq', 16, true);


--
-- Name: product_bom_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_bom_items_id_seq', 1, false);


--
-- Name: product_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_categories_id_seq', 6, true);


--
-- Name: product_stock_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_stock_id_seq', 1, false);


--
-- Name: production_order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.production_order_items_id_seq', 26, true);


--
-- Name: production_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.production_orders_id_seq', 30, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 19, true);


--
-- Name: quote_form_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quote_form_items_id_seq', 14085, true);


--
-- Name: quote_forms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quote_forms_id_seq', 49, true);


--
-- Name: quote_group_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quote_group_templates_id_seq', 32, true);


--
-- Name: quote_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quote_requests_id_seq', 18, true);


--
-- Name: references_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.references_id_seq', 113, true);


--
-- Name: serial_sequences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.serial_sequences_id_seq', 32, true);


--
-- Name: service_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.service_records_id_seq', 1, false);


--
-- Name: service_report_email_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.service_report_email_logs_id_seq', 3, true);


--
-- Name: service_report_parts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.service_report_parts_id_seq', 10, true);


--
-- Name: service_report_photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.service_report_photos_id_seq', 18, true);


--
-- Name: service_report_signatures_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.service_report_signatures_id_seq', 42, true);


--
-- Name: service_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.service_reports_id_seq', 6, true);


--
-- Name: site_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.site_settings_id_seq', 59, true);


--
-- Name: sliders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sliders_id_seq', 3, true);


--
-- Name: template_bom_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.template_bom_items_id_seq', 1, false);


--
-- Name: visitor_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.visitor_events_id_seq', 1115, true);


--
-- Name: warranty_claims_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.warranty_claims_id_seq', 1, false);


--
-- Name: warranty_devices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.warranty_devices_id_seq', 26, true);


--
-- Name: admin_audit_logs admin_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_audit_logs
    ADD CONSTRAINT admin_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_unique UNIQUE (email);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: catalogs catalogs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalogs
    ADD CONSTRAINT catalogs_pkey PRIMARY KEY (id);


--
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);


--
-- Name: corporate_sections corporate_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corporate_sections
    ADD CONSTRAINT corporate_sections_pkey PRIMARY KEY (id);


--
-- Name: corporate_sections corporate_sections_section_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corporate_sections
    ADD CONSTRAINT corporate_sections_section_key_unique UNIQUE (section_key);


--
-- Name: email_logs email_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_logs
    ADD CONSTRAINT email_logs_pkey PRIMARY KEY (id);


--
-- Name: maintenance_kits maintenance_kits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_kits
    ADD CONSTRAINT maintenance_kits_pkey PRIMARY KEY (id);


--
-- Name: material_reservations material_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_reservations
    ADD CONSTRAINT material_reservations_pkey PRIMARY KEY (id);


--
-- Name: material_stock material_stock_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_stock
    ADD CONSTRAINT material_stock_pkey PRIMARY KEY (id);


--
-- Name: media_files media_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_pkey PRIMARY KEY (id);


--
-- Name: news news_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- Name: news news_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_slug_unique UNIQUE (slug);


--
-- Name: news_translations news_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_translations
    ADD CONSTRAINT news_translations_pkey PRIMARY KEY (id);


--
-- Name: product_bom_items product_bom_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_bom_items
    ADD CONSTRAINT product_bom_items_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_slug_unique UNIQUE (slug);


--
-- Name: product_stock product_stock_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_stock
    ADD CONSTRAINT product_stock_pkey PRIMARY KEY (id);


--
-- Name: production_order_items production_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_order_items
    ADD CONSTRAINT production_order_items_pkey PRIMARY KEY (id);


--
-- Name: production_order_items production_order_items_qr_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_order_items
    ADD CONSTRAINT production_order_items_qr_token_unique UNIQUE (qr_token);


--
-- Name: production_order_items production_order_items_serial_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_order_items
    ADD CONSTRAINT production_order_items_serial_number_unique UNIQUE (serial_number);


--
-- Name: production_orders production_orders_order_no_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_orders
    ADD CONSTRAINT production_orders_order_no_unique UNIQUE (order_no);


--
-- Name: production_orders production_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_orders
    ADD CONSTRAINT production_orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: quote_form_items quote_form_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_form_items
    ADD CONSTRAINT quote_form_items_pkey PRIMARY KEY (id);


--
-- Name: quote_forms quote_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_forms
    ADD CONSTRAINT quote_forms_pkey PRIMARY KEY (id);


--
-- Name: quote_forms quote_forms_quote_no_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_forms
    ADD CONSTRAINT quote_forms_quote_no_unique UNIQUE (quote_no);


--
-- Name: quote_group_templates quote_group_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_group_templates
    ADD CONSTRAINT quote_group_templates_pkey PRIMARY KEY (id);


--
-- Name: quote_requests quote_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_requests
    ADD CONSTRAINT quote_requests_pkey PRIMARY KEY (id);


--
-- Name: references references_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."references"
    ADD CONSTRAINT references_pkey PRIMARY KEY (id);


--
-- Name: serial_sequences serial_seq_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.serial_sequences
    ADD CONSTRAINT serial_seq_unique UNIQUE (product_code, date_key);


--
-- Name: serial_sequences serial_sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.serial_sequences
    ADD CONSTRAINT serial_sequences_pkey PRIMARY KEY (id);


--
-- Name: service_records service_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_records
    ADD CONSTRAINT service_records_pkey PRIMARY KEY (id);


--
-- Name: service_report_email_logs service_report_email_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_report_email_logs
    ADD CONSTRAINT service_report_email_logs_pkey PRIMARY KEY (id);


--
-- Name: service_report_parts service_report_parts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_report_parts
    ADD CONSTRAINT service_report_parts_pkey PRIMARY KEY (id);


--
-- Name: service_report_photos service_report_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_report_photos
    ADD CONSTRAINT service_report_photos_pkey PRIMARY KEY (id);


--
-- Name: service_report_signatures service_report_signatures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_report_signatures
    ADD CONSTRAINT service_report_signatures_pkey PRIMARY KEY (id);


--
-- Name: service_reports service_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_reports
    ADD CONSTRAINT service_reports_pkey PRIMARY KEY (id);


--
-- Name: service_reports service_reports_report_no_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_reports
    ADD CONSTRAINT service_reports_report_no_unique UNIQUE (report_no);


--
-- Name: service_reports service_reports_verification_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_reports
    ADD CONSTRAINT service_reports_verification_token_unique UNIQUE (verification_token);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_setting_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_setting_key_unique UNIQUE (setting_key);


--
-- Name: sliders sliders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sliders
    ADD CONSTRAINT sliders_pkey PRIMARY KEY (id);


--
-- Name: template_bom_items template_bom_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_bom_items
    ADD CONSTRAINT template_bom_items_pkey PRIMARY KEY (id);


--
-- Name: visitor_events visitor_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visitor_events
    ADD CONSTRAINT visitor_events_pkey PRIMARY KEY (id);


--
-- Name: warranty_claims warranty_claims_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warranty_claims
    ADD CONSTRAINT warranty_claims_pkey PRIMARY KEY (id);


--
-- Name: warranty_devices warranty_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warranty_devices
    ADD CONSTRAINT warranty_devices_pkey PRIMARY KEY (id);


--
-- Name: warranty_devices warranty_devices_qr_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warranty_devices
    ADD CONSTRAINT warranty_devices_qr_token_unique UNIQUE (qr_token);


--
-- Name: warranty_devices warranty_devices_serial_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warranty_devices
    ADD CONSTRAINT warranty_devices_serial_number_unique UNIQUE (serial_number);


--
-- Name: news_translations_locale_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX news_translations_locale_idx ON public.news_translations USING btree (locale);


--
-- Name: news_translations_locale_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX news_translations_locale_slug_key ON public.news_translations USING btree (locale, slug);


--
-- Name: news_translations_news_locale_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX news_translations_news_locale_key ON public.news_translations USING btree (news_id, locale);


--
-- Name: visitor_events_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX visitor_events_created_at_idx ON public.visitor_events USING btree (created_at);


--
-- Name: visitor_events_event_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX visitor_events_event_type_idx ON public.visitor_events USING btree (event_type);


--
-- Name: visitor_events_visitor_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX visitor_events_visitor_id_idx ON public.visitor_events USING btree (visitor_id);


--
-- Name: maintenance_kits maintenance_kits_service_record_id_service_records_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_kits
    ADD CONSTRAINT maintenance_kits_service_record_id_service_records_id_fk FOREIGN KEY (service_record_id) REFERENCES public.service_records(id) ON DELETE CASCADE;


--
-- Name: news_translations news_translations_news_id_news_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_translations
    ADD CONSTRAINT news_translations_news_id_news_id_fk FOREIGN KEY (news_id) REFERENCES public.news(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_product_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_product_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.product_categories(id) ON DELETE SET NULL;


--
-- Name: quote_form_items quote_form_items_form_id_quote_forms_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_form_items
    ADD CONSTRAINT quote_form_items_form_id_quote_forms_id_fk FOREIGN KEY (form_id) REFERENCES public.quote_forms(id) ON DELETE CASCADE;


--
-- Name: service_records service_records_device_id_warranty_devices_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_records
    ADD CONSTRAINT service_records_device_id_warranty_devices_id_fk FOREIGN KEY (device_id) REFERENCES public.warranty_devices(id) ON DELETE CASCADE;


--
-- Name: service_report_email_logs service_report_email_logs_report_id_service_reports_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_report_email_logs
    ADD CONSTRAINT service_report_email_logs_report_id_service_reports_id_fk FOREIGN KEY (report_id) REFERENCES public.service_reports(id) ON DELETE CASCADE;


--
-- Name: service_report_parts service_report_parts_report_id_service_reports_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_report_parts
    ADD CONSTRAINT service_report_parts_report_id_service_reports_id_fk FOREIGN KEY (report_id) REFERENCES public.service_reports(id) ON DELETE CASCADE;


--
-- Name: service_report_photos service_report_photos_report_id_service_reports_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_report_photos
    ADD CONSTRAINT service_report_photos_report_id_service_reports_id_fk FOREIGN KEY (report_id) REFERENCES public.service_reports(id) ON DELETE CASCADE;


--
-- Name: service_report_signatures service_report_signatures_report_id_service_reports_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_report_signatures
    ADD CONSTRAINT service_report_signatures_report_id_service_reports_id_fk FOREIGN KEY (report_id) REFERENCES public.service_reports(id) ON DELETE CASCADE;


--
-- Name: service_reports service_reports_device_id_warranty_devices_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_reports
    ADD CONSTRAINT service_reports_device_id_warranty_devices_id_fk FOREIGN KEY (device_id) REFERENCES public.warranty_devices(id) ON DELETE CASCADE;


--
-- Name: warranty_claims warranty_claims_device_id_warranty_devices_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warranty_claims
    ADD CONSTRAINT warranty_claims_device_id_warranty_devices_id_fk FOREIGN KEY (device_id) REFERENCES public.warranty_devices(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Nt36VnZdR5ozOHOiyeJWhbuIytTVTDmjQPsWTmXoyRBd3mO4kunwCgv3tO1YInY

