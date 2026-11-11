# Idham Hakim · Portfolio and résumé website

My personal portfolio and résumé site, live at **https://ezzzy01.github.io**.

It introduces who I am and what I build (AI integrated into the systems a business already uses), with my
featured project, other work, experience, education, skills, a downloadable résumé and ways to contact me.

> This repository is the **website only**. The featured project shown on it, SAP B1 AI (an AI assistant and dashboard
> for SAP Business One), is a separate project. The site links to its live demo; the demo itself runs on my own server.

## What's on the site

- **About me**: role, location, contact links and a résumé download (PDF).
- **What I build**: the kinds of AI solutions I make, a before/after comparison and how I work.
- **Featured project, SAP B1 AI**: challenge, approach and result; screenshots; an architecture diagram with a
  step-by-step "Follow a question" tour; and a demo inside the page (live when my server is reachable, otherwise a
  replay of real recorded answers).
- **What could AI do for you?**: pick your systems and goal to get a sketch of what I'd build.
- **Other work, experience, education and skills.**
- Extras: light/dark mode, a Ctrl+K quick menu, a sharing preview card and a custom 404 page.
- On phones: a menu, swipeable card rows, a phone-sized hero picture, an Email me bar at the bottom, and tap
  targets of at least 44px.

## How it's built

- Plain HTML, CSS and JavaScript in one page (`index.html`). No framework and no build step.
- Hosted on GitHub Pages from the `main` branch.
- Works on phones, in light and dark mode, by keyboard, and with "reduce motion" switched on.

```
index.html              the whole site (styles and scripts included)
404.html                page-not-found page
assets/img/             screenshots and the animated demo (SAP's public demo company, not client data)
assets/replay/          charts used by the demo replay
assets/fonts/           Inter (variable font)
assets/og.png           link-sharing preview image
assets/Resume_Idham_Hakim.pdf
robots.txt, sitemap.xml
```

Preview locally from this folder with `python3 -m http.server 8000`, then open http://localhost:8000.

## Credits

- [Inter](https://rsms.me/inter/) typeface: SIL Open Font License 1.1.
- [Lucide](https://lucide.dev) icons: ISC License.
- Technology logos from [Simple Icons](https://simpleicons.org): CC0. The logos are trademarks of their owners.
- SAP and SAP Business One are trademarks of SAP SE. This is an independent project.

© 2026 Idham Hakim
