# Rocrown Roofing Materials Website

Static multilingual B2B website for Rocrown roofing materials, focused on ASA
synthetic resin roof tile, PVC roof sheet, UPVC hollow roof sheet, aluminium
sandwich panel, and clear transparent roof sheet.

## Pages

- `/en/` English homepage
- `/es/` Spanish homepage
- `/fr/` French homepage
- `/ar/` Arabic homepage with RTL layout
- `/ru/` Russian homepage
- `/zh/` Chinese homepage
- `/en/inquiry.html` and matching language inquiry pages

## Local Preview

```bash
python3 -m http.server 6173
```

Then open:

```text
http://127.0.0.1:6173/en/
```

## i18n

Language dictionaries are stored in `/locales/*.json`. The frontend i18n runtime
is in `/i18n.js` and supports:

- language path detection
- localStorage language memory
- English fallback
- automatic `html lang`
- RTL direction for Arabic
- SEO title, description, canonical, and hreflang updates
