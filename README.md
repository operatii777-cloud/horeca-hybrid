# HoReCa Hybrid

Aplicație unificată pentru managementul restaurantelor — interfață de **gestiune** (admin) și **vânzare** (ospătari) într-o singură aplicație web.

## Tehnologii

- **Frontend**: React, Vite, Tailwind CSS, AG Grid
- **Backend**: Node.js, Express
- **Baza de date**: SQLite cu Prisma ORM

## Autentificare prin PIN

| PIN    | Rol       | Interfață  |
|--------|-----------|------------|
| `0000` | Admin     | Gestiune   |
| `1111` | Ospătar 1 | Vânzare    |
| `2222` | Ospătar 2 | Vânzare    |
| `3333` | Ospătar 3 | Vânzare    |
| ...    | ...       | ...        |
| `9999` | Ospătar 9 | Vânzare    |

## Instalare și pornire

```bash
cd app
npm install
npm run setup    # Creează baza de date și adaugă date demo
npm run server   # Pornește serverul API pe http://localhost:3001
npm run dev      # Pornește interfața pe http://localhost:5173
```

## Scripturi disponibile

| Script           | Descriere                              |
|------------------|----------------------------------------|
| `npm run dev`    | Pornește serverul de dezvoltare Vite   |
| `npm run build`  | Compilează aplicația pentru producție   |
| `npm run server` | Pornește serverul Express API          |
| `npm run seed`   | Populează baza de date cu date demo    |
| `npm run setup`  | Inițializează BD + seed               |
| `npm test`       | Rulează testele                        |

