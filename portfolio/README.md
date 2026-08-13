# Rayhan Aditya — Portfolio

React + Tailwind CSS portfolio, built from the reference design, with Vitest tests.

## Setup

```bash
npm install
npm run dev        # start the dev server
npm run test       # run the vitest suite once
npm run test:watch # run tests in watch mode
npm run build       # production build
```

## Where things live

- `src/components/Hero.jsx` — the big "PORTFOLIO" header, portrait, stats, first "Contact Me" button.
- `src/components/Projects.jsx` — selected projects grid + the row-aware "View All Projects" button.
- `src/components/EducationProcess.jsx` — education, skills, the 5-step work process, and the pull quote.
- `src/components/Footer.jsx` — contact details + a second "Contact Me" trigger.
- `src/components/ContactModal.jsx` — the shared popup form (name / number / project) with a smooth open/close transition and a thank-you state.
- `src/components/Reveal.jsx` + `src/hooks/useReveal.js` — the scroll-in fade-up animation wrapper used across every section.
- `src/hooks/useIsMobile.js` — small viewport hook used to decide when the project grid counts as "more than N rows".

## Things you'll likely want to tweak

- **Photo**: `src/components/Hero.jsx` has a `HINT` comment right above the `<img src="...">` — swap that URL for your own portrait.
- **Fonts**: `index.html` loads Archivo Black + Inter from Google Fonts; change the `<link>` there and `fontFamily` in `tailwind.config.js` to swap them.
- **Colors**: all of the palette lives in `tailwind.config.js` under `theme.extend.colors` (`ink`, `blood`, `bone`, etc.) — change the hex values there and the whole site follows.
- **Contact form submit**: `ContactModal.jsx` has a `HINT` comment in `handleSubmit` where you'd wire up a real request (Formspree, your own API route, etc.) instead of the simulated success.
- **Projects**: edit the `projects` array in `Projects.jsx`. Add a 4th project and watch the "View All Projects" button switch into its glowing/pulsing state automatically once there's more than one row (more than two rows on phone).
