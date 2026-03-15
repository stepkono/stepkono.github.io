# Schaufenster Site

Moderne, responsive Multi-Page-Website für den Service **Schaufenster**.

## Inhalt
- Landing Page mit Mission, Zielgruppe, Vorteilen und Statistik-Sektion inkl. Quellen
- Dienstleistungsseite (Ablauf, optionale SEO-Bausteine, transparente Kosten)
- Bedingungsseite
- Über-mich-Seite
- Kontaktseite mit strukturiertem Formular
- FAQ-Seite
- Impressum-Seite
- Datenschutz-Seite

## Projektstruktur

```text
.
├── index.html
├── service.html
├── bedingungen.html
├── ueber-mich.html
├── kontakt.html
├── faq.html
├── impressum.html
├── datenschutz.html
├── 404.html
├── robots.txt
├── sitemap.xml
├── assets/
│   ├── images/
│   └── logos/
├── styles/
│   └── main.css
└── scripts/
    ├── main.js
    ├── contact.js
    └── config.js
```

## Lokales Öffnen

Da es eine statische Website ist, genügt das Öffnen von `index.html` im Browser.

Für realistische Tests (Formular + Routing auf GitHub Pages) empfiehlt sich ein lokaler Server, z. B.:

```bash
python3 -m http.server 8080
```

Dann `http://localhost:8080` öffnen.

## Kontaktformular konfigurieren (E-Mail-Weiterleitung)

Die Seite nutzt einen Formular-Endpunkt (Formspree) und sendet alle Felder plus formatierte Zusammenfassung.

1. Kostenloses Formular bei [Formspree](https://formspree.io/) erstellen.
2. Endpunkt in `scripts/config.js` eintragen:

```js
window.SCHAUFENSTER_CONFIG = Object.freeze({
  formEndpoint: "https://formspree.io/f/DEINE_FORM_ID"
});
```

Bereits integriert:
- Pflichtfeld-Validierung
- strukturierte Zusammenfassung der Anfrage
- Honeypot-Feld gegen Bots
- einfacher Timing-Check gegen sehr schnelle Bot-Submits

## GitHub Pages Deployment

1. Repository zu GitHub pushen.
2. In GitHub: `Settings` → `Pages`.
3. Source: `Deploy from a branch`.
4. Branch: `main` (oder gewünschter Branch), Folder: `/ (root)`.
5. Speichern und auf Veröffentlichung warten.

Wenn dein finaler Domain-Name nicht `https://stepankonoplianko.github.io/schaufenster_site/` ist:
- `sitemap.xml` und `robots.txt` auf deine echte URL anpassen.

## Vor Live-Schaltung prüfen

- Impressum in `impressum.html` vervollständigen
- Datenschutz in `datenschutz.html` vervollständigen
- Formular-Endpunkt (`scripts/config.js`) setzen
- Optional: eigene Domain verbinden
- Finalen Text-Feinschliff und letzte Mobiltests durchführen

## Quellen der Statistik-Sektion

- BrightLocal – Local Consumer Review Survey 2026
- Eurostat News (13.12.2024)
- KfW Pressemitteilung (18.09.2024)

Die Quellen sind auf der Landing Page direkt verlinkt.
