# Tréninkový deník (PWA)

Mobilní webová aplikace na zápis tréninků v posilovně. Funguje offline, data se ukládají jen v prohlížeči (localStorage).

## Spuštění

```bash
npm install
npm run dev
```

Otevři adresu z terminálu (např. `http://localhost:5173`). Díky `--host` se vypíše i adresa v lokální síti
(`http://192.168.x.x:5173`), kterou otevřeš na telefonu – service worker a instalace na plochu ale fungují jen
přes HTTPS (nebo localhost), proto instalaci zkoušej až na nasazené verzi.

Produkční build: `npm run build`, náhled: `npm run preview`.

## Nasazení zdarma

### Vercel
1. Nahraj projekt na GitHub.
2. Na [vercel.com](https://vercel.com) → *Add New Project* → vyber repozitář.
3. Vercel sám rozpozná Vite (build `npm run build`, výstup `dist`) → *Deploy*.

### GitHub Pages
1. Nahraj projekt na GitHub do větve `main`.
2. V repozitáři: *Settings → Pages → Source: GitHub Actions*.
3. Workflow `.github/workflows/deploy.yml` aplikaci při každém pushi sestaví a nasadí na
   `https://<uživatel>.github.io/<repozitář>/`.

## Instalace na telefon
- **Android (Chrome):** menu ⋮ → *Přidat na plochu / Instalovat aplikaci*.
- **iPhone (Safari):** tlačítko Sdílet → *Přidat na plochu*.

## Zálohy
Data jsou jen v prohlížeči daného zařízení. V *Nastavení → Záloha dat* si pravidelně exportuj JSON.
