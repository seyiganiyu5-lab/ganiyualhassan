# Ganiyu Al-Hassan Oluwaseyi — Portfolio

A minimal, multi-page portfolio built with Next.js 16, with an admin dashboard
for managing projects, messages, CV and site settings.

## Site map

| Route          | What's there                                             |
| -------------- | -------------------------------------------------------- |
| `/`            | Short intro, selected (featured) work, services, CTA     |
| `/work`        | All projects, filterable by category (`?category=…`)     |
| `/work/[id]`   | One project: description, tools, links, all images/PDFs  |
| `/about`       | Bio, experience, education, skills, services, CV download |
| `/contact`     | Direct channels and a message form                       |
| `/admin`       | Dashboard (projects, messages, CV, media, settings, SEO) |

## Structure

```
src/
  app/
    (site)/          public pages — share one header/footer layout
    admin/           admin dashboard
    api/             projects, messages, settings, upload, auth…
  components/
    site/            public UI (header, footer, project card, page views)
    admin/           admin UI
    ui/              shadcn/ui primitives
  lib/
    data.ts          server-side data access (projects, settings)
    media.ts         image/PDF helpers, project categories
    i18n/            EN/FR strings (public strings live under `site`)
```

Public pages are server-rendered from the database, so anything changed in the
admin panel shows up on the next page load. Contact details (email, phone,
WhatsApp, LinkedIn), the profile photo and the CV all come from admin Settings.
