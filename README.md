# Erinnern statt vergessen – Lernwebsite

Lernwebsite zum Workshop „Erinnern statt vergessen“ zur Pogromnacht am 9./10. November 1938 in Dortmund-Hörde, Marie-Reinders-Realschule Dortmund.

Die Seite stellt die Texte und Quellen bereit. Die Arbeitsaufträge bearbeiten die Schülerinnen und Schüler auf Papier.

Es ist eine statische Website ohne Build-Schritt. Alle Schriften, Bilder und Skripte liegen im Projekt. Es werden keine externen Dienste geladen, also auch kein Google Fonts und keine Tracker.

## Aufbau

```
index.html                Startseite (Reiter per Adresse: #start, #text1, #text2, #hoerde, #hilfe, #glossar)
favicon.svg
netlify.toml              Netlify-Einstellungen (Publish-Ordner, Sicherheits-Header, noindex)
robots.txt                Seite wird nicht von Suchmaschinen erfasst
assets/css/style.css      Gestaltung (hell/dunkel, iPad und Smartphone)
assets/js/content.js      Texte, Abschnitte, Kurzfassungen, Selbstcheck-Fragen, Hilfe zu Aufgaben
assets/js/glossary.js     Glossar in leichter Sprache
assets/js/images.js       Bildverweise
assets/js/app.js          Oberfläche: Lernlandkarte, Lesemodus, Glossar, Vorlesen, Selbstcheck
assets/img/               4 Abbildungen
assets/fonts/             Atkinson Hyperlegible (SIL Open Font License)
```

## Veröffentlichen über GitHub und Netlify

1. Auf GitHub ein neues Repository anlegen, am besten **privat**.
2. Den **Inhalt** dieses Ordners hochladen („Add file → Upload files“). Wichtig: `index.html` muss im Hauptverzeichnis des Repositorys liegen, nicht in einem Unterordner.
3. In Netlify: **Add new site → Import an existing project → GitHub** und das Repository auswählen.
4. Die Einstellungen übernehmen: *Build command* leer lassen, *Publish directory* `.` (steht bereits in `netlify.toml`).
5. Auf **Deploy** klicken. Danach wird jede Änderung im Repository automatisch veröffentlicht.
6. Unter *Site configuration → Change site name* kann eine kurze Adresse gewählt werden, z. B. `erinnern-hoerde.netlify.app`.

Zum lokalen Testen genügt ein Doppelklick auf `index.html`.

## Inhalte ändern

- **Texte, Kurzfassungen, Fragen, Hilfen:** `assets/js/content.js`. Jeder Abschnitt hat `h` (Überschrift), `p` (Absätze), `easy` (Kurzfassung), `quiz` (Fragen: Frage, Antworten, Index der richtigen Antwort, Erklärung).
- **Glossar:** `assets/js/glossary.js`. Jeder Eintrag: `[Begriff, Artikel, [Wortformen im Text], Erklärung]`. Ein Wort wird im Text nur unterstrichen, wenn eine der Wortformen genau so im Text vorkommt.

## Hinweise

- Fortschritt (gelesene Abschnitte, Selbstcheck) und Leseeinstellungen werden nur im jeweiligen Browser gespeichert (localStorage). Es werden keine Daten übertragen.
- Die Vorlesefunktion nutzt die Sprachausgabe des Geräts. Auf iPads klingt sie besser, wenn unter *Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen → Deutsch* eine erweiterte Stimme geladen ist.
- Quellen: Bernward Dörner (Topographie des Terrors, 2018); Adam Tooze, *Ökonomie der Zerstörung*; Arbeitskreis „Hörde damals“, *9. November 1938: Die Nacht des Unrechts* (2018); Horst Richter, *Die Geschichte der Juden in Hörde*; juedisches-dortmund.de. Vor einer öffentlichen Freigabe bitte die Bild- und Textrechte klären. Die Seite ist deshalb auf `noindex` gestellt.
