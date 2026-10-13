-- Chromatus Consulting — MySQL schema
-- Run with: mysql -u <user> -p <database> < database/schema.sql
-- or via:   npm run db:migrate

CREATE TABLE IF NOT EXISTS site_pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  path VARCHAR(255) NOT NULL UNIQUE,
  section VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FULLTEXT KEY ft_site_pages (title, summary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS insights_articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('blog', 'whitepaper', 'case_study', 'report', 'webinar') NOT NULL,
  tag VARCHAR(60) NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  body MEDIUMTEXT,
  author VARCHAR(150) DEFAULT 'Chromatus Consulting',
  published_at DATE NOT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FULLTEXT KEY ft_insights_articles (title, summary, body)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) UNIQUE,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(150) NOT NULL,
  location VARCHAR(150) NOT NULL,
  type VARCHAR(60) NOT NULL DEFAULT 'Full-time',
  description TEXT,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  posted_at DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Candidate applications submitted from a job's public Apply page
-- (/careers/jobs/<slug>). job_title/job_department are a snapshot at
-- submission time so a record still makes sense if the posting changes later.
CREATE TABLE IF NOT EXISTS job_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  job_department VARCHAR(150),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(60),
  resume_url VARCHAR(500),
  cover_note TEXT,
  status ENUM('new','reviewed','shortlisted','rejected','hired') NOT NULL DEFAULT 'new',
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contact_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source ENUM('contact', 'chromatus_pro') NOT NULL DEFAULT 'contact',
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255) DEFAULT NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Admin CMS tables (added for admin panel)
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(150) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stores admin overrides for every editable page's content object.
-- page_key matches the keys in src/lib/cmsRegistry.js (one row per
-- editable page/section group). When a row is missing or unpublished,
-- the site falls back to the original static content so the design
-- and copy never break even before the CMS has been touched.
CREATE TABLE IF NOT EXISTS page_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_key VARCHAR(150) NOT NULL UNIQUE,
  data LONGTEXT NOT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS media_library (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255) DEFAULT NULL,
  mime_type VARCHAR(100) DEFAULT NULL,
  size_bytes INT DEFAULT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Section-level ordering for array-based content blocks (cards, stats,
-- list items, etc.) is stored inline inside page_content.data as JSON
-- arrays, so no separate table is required for reordering.

-- ============================================================
-- Site-wide theme / brand settings (single row, id = 1)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  site_name VARCHAR(150) NOT NULL DEFAULT 'Chromatus Consulting',
  tagline VARCHAR(255) DEFAULT NULL,
  logo_url VARCHAR(500) DEFAULT NULL,
  color_navy VARCHAR(20) NOT NULL DEFAULT '#0E4A6B',
  color_navy_light VARCHAR(20) NOT NULL DEFAULT '#15619B',
  color_navy_dark VARCHAR(20) NOT NULL DEFAULT '#0A3350',
  color_brandblue VARCHAR(20) NOT NULL DEFAULT '#1F82C5',
  color_brandblue_dark VARCHAR(20) NOT NULL DEFAULT '#15619B',
  color_brandorange VARCHAR(20) NOT NULL DEFAULT '#EA9322',
  color_brandorange_dark VARCHAR(20) NOT NULL DEFAULT '#C97814',
  -- SEO sitewide defaults (Admin → SEO → Global Defaults)
  default_meta_title VARCHAR(255) DEFAULT NULL,
  default_meta_description VARCHAR(500) DEFAULT NULL,
  default_og_image VARCHAR(500) DEFAULT NULL,
  twitter_handle VARCHAR(60) DEFAULT NULL,
  organization_name VARCHAR(255) DEFAULT NULL,
  organization_logo VARCHAR(500) DEFAULT NULL,
  organization_description VARCHAR(500) DEFAULT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO site_settings (id) VALUES (1);

-- ============================================================
-- Testimonials (global, reusable, orderable, publishable)
-- ============================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quote TEXT NOT NULL,
  author_name VARCHAR(150) NOT NULL,
  author_role VARCHAR(150) DEFAULT NULL,
  company VARCHAR(150) DEFAULT NULL,
  avatar_url VARCHAR(500) DEFAULT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- FAQs (global, reusable, orderable, publishable)
-- ============================================================
CREATE TABLE IF NOT EXISTS faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(150) NOT NULL DEFAULT 'General',
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Fully dynamic, admin-creatable pages (page -> sections -> content)
-- These live alongside the fixed routes above; admins can add a brand
-- new page at /pages/<slug> without any developer involvement.
-- ============================================================
CREATE TABLE IF NOT EXISTS custom_pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  meta_description VARCHAR(500) DEFAULT NULL,
  -- 'custom'   -> lives at /pages/<slug>            (Admin → Website → Custom Pages)
  -- 'service'  -> lives at /services/<slug>          (Admin → Services)
  -- 'industry' -> lives at /industries/<slug>        (Admin → Industries)
  -- Fixed, developer-built routes (e.g. /services/technology-consulting) always take
  -- priority over these, so admin-added entries never collide with existing pages.
  page_type ENUM('custom', 'service', 'industry') NOT NULL DEFAULT 'custom',
  sort_order INT NOT NULL DEFAULT 0,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS custom_page_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  data LONGTEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_custom_page_sections_page
    FOREIGN KEY (page_id) REFERENCES custom_pages(id) ON DELETE CASCADE,
  INDEX idx_custom_page_sections_page (page_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Cookie consent management (banner + preference-center modal)
-- Single row (id = 1), edited from Admin → Theme & Settings →
-- Cookie & Privacy. `categories` and `scripts` are JSON blobs so the
-- four cookie categories (necessary, analytics, functional, marketing)
-- can carry editable copy and per-category tracking-script snippets
-- without extra tables. If this table is empty/unreachable, the site
-- falls back to sensible defaults defined in src/lib/cookieConsent.js
-- so the banner still renders correctly before first CMS setup.
-- ============================================================
CREATE TABLE IF NOT EXISTS cookie_consent_settings (
  id INT PRIMARY KEY DEFAULT 1,
  banner_enabled TINYINT(1) NOT NULL DEFAULT 1,
  banner_title VARCHAR(255) NOT NULL DEFAULT 'We value your privacy',
  banner_message TEXT,
  accept_all_label VARCHAR(100) NOT NULL DEFAULT 'Accept All Cookies',
  reject_all_label VARCHAR(100) NOT NULL DEFAULT 'Reject All',
  settings_label VARCHAR(100) NOT NULL DEFAULT 'Cookie Settings',
  save_preferences_label VARCHAR(100) NOT NULL DEFAULT 'Save Preferences',
  policy_link_label VARCHAR(100) NOT NULL DEFAULT 'Cookie Policy',
  policy_link_url VARCHAR(500) NOT NULL DEFAULT '/cookie-policy',
  categories LONGTEXT,
  scripts LONGTEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO cookie_consent_settings (id) VALUES (1);

-- ============================================================
-- SEO — page-level metadata overrides (Admin → SEO)
-- One row per route (fixed route, custom/service/industry page, or
-- insight article). If a route has no row, the page's own hard-coded
-- <title>/description keeps working exactly as before. Every field is
-- optional; empty ones fall back to the sitewide defaults stored on
-- site_settings, then to the page's own hard-coded fallback.
-- ============================================================
CREATE TABLE IF NOT EXISTS seo_meta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_path VARCHAR(255) NOT NULL UNIQUE,
  page_label VARCHAR(255) DEFAULT NULL,
  meta_title VARCHAR(255) DEFAULT NULL,
  meta_description VARCHAR(500) DEFAULT NULL,
  canonical_url VARCHAR(500) DEFAULT NULL,
  robots_index TINYINT(1) NOT NULL DEFAULT 1,
  robots_follow TINYINT(1) NOT NULL DEFAULT 1,
  robots VARCHAR(60) NOT NULL DEFAULT 'index,follow',
  og_title VARCHAR(255) DEFAULT NULL,
  og_description VARCHAR(500) DEFAULT NULL,
  og_image VARCHAR(500) DEFAULT NULL,
  og_type VARCHAR(30) NOT NULL DEFAULT 'website',
  og_url VARCHAR(500) DEFAULT NULL,
  twitter_card VARCHAR(30) NOT NULL DEFAULT 'summary_large_image',
  twitter_title VARCHAR(255) DEFAULT NULL,
  twitter_description VARCHAR(500) DEFAULT NULL,
  twitter_image VARCHAR(500) DEFAULT NULL,
  author VARCHAR(255) DEFAULT NULL,
  published_time VARCHAR(40) DEFAULT NULL,
  modified_time VARCHAR(40) DEFAULT NULL,
  focus_keyword VARCHAR(255) DEFAULT NULL,
  meta_keywords VARCHAR(500) DEFAULT NULL,
  schema_json LONGTEXT DEFAULT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Redirects (Admin → Redirects). Applied live on every frontend request
-- via middleware — no rebuild/deploy needed to add, edit, or remove one.
-- ============================================================
CREATE TABLE IF NOT EXISTS redirects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  from_path VARCHAR(500) NOT NULL UNIQUE,
  to_path VARCHAR(500) NOT NULL,
  status_code SMALLINT NOT NULL DEFAULT 301,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  notes VARCHAR(255) DEFAULT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Global elements — header CTA, footer content, social links, and
-- brand fonts (Admin → Theme & Branding). Single row (id = 1).
-- ============================================================
CREATE TABLE IF NOT EXISTS global_elements (
  id INT PRIMARY KEY DEFAULT 1,
  header_cta_label VARCHAR(100) NOT NULL DEFAULT 'CHROMATUS PRO',
  header_cta_href VARCHAR(255) NOT NULL DEFAULT '/chromatus-pro',
  cta_band_heading VARCHAR(500) NOT NULL DEFAULT 'Schedule a consultation and let''s solve something extraordinary together.',
  cta_band_primary_label VARCHAR(100) NOT NULL DEFAULT 'Talk to an expert',
  cta_band_primary_href VARCHAR(255) NOT NULL DEFAULT '/contact-us',
  cta_band_secondary_label VARCHAR(100) NOT NULL DEFAULT 'CHROMATUS PRO',
  cta_band_secondary_href VARCHAR(255) NOT NULL DEFAULT '/chromatus-pro',
  footer_tagline VARCHAR(255) NOT NULL DEFAULT 'Make what''s next meaningful.',
  footer_note VARCHAR(500) DEFAULT NULL,
  social_links LONGTEXT,
  font_heading VARCHAR(150) NOT NULL DEFAULT 'inherit',
  font_body VARCHAR(150) NOT NULL DEFAULT 'inherit',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO global_elements (id) VALUES (1);
