# Saeed Iqbal Portfolio

React + Vite site with an animated 3D terrain hero, four project domains, and an avatar that changes outfit with the section on screen.

## Run it locally
```
npm install
npm run dev        # http://localhost:5173
```

## Build for hosting
```
npm run build      # outputs the static site to /dist
```
Upload the **dist** folder to any static host (Netlify drag-and-drop, Vercel, GitHub Pages, cPanel).
It uses relative paths, so it also works from a sub-folder.

## Edit content
- **Projects, text, career, contact:** `src/data/projects.js`. Each project has a title, tag, summary, points, stack and media.
- **Media:** `public/media/`. Images are `.webp`; videos are `.mp4`, each with a `.jpg` poster of the same name.
  Add a file there, then reference it in projects.js with `i('name')` for an image or `v('name')` for a video.
- **Avatar outfits:** `src/components/Avatar.jsx` (`blazer`, `hoodie`, `flight`, `field`, `engineer`).
- **Colours per domain:** the `accent` field of each domain in projects.js.

Featured projects (`featured: true`) get the large tile and autoplay their video.

