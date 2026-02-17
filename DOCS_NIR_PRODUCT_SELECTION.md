# NIR Product Selection Guide
## De unde selectezi și cum selectezi produsele pentru crearea NIR

### Sursa Produselor (Product Source)

Produsele afișate în dropdown-ul NIR provin din:

1. **Baza de Date - Tabela Product**
   - Toate produsele din sistem sunt stocate în tabela `Product`
   - Fiecare produs are: nume, preț, unitate măsură, departament, categorie

2. **API Endpoint: `/api/products`**
   - La deschiderea paginii NIR, se face un request GET către `/api/products`
   - API-ul returnează toate produsele active din sistem
   - Produsele includ și relațiile cu departamentul și categoria

3. **Organizare pe Departamente**
   - Produsele sunt grupate automat pe departamente:
     - **BAR** (12 produse): băuturi, cafea, alcool
     - **BUCATARIE** (14 produse): mâncăruri preparate, ingrediente
     - **BUFET** (2 produse): sucuri fresh
     - **DIVERSE** (2 produse): consumabile (servetele, paie)

### Cum Se Selectează Produsele (How to Select)

#### 1. Acces la Dropdown
- Accesați pagina **Gestiune → NIR**
- În formularul "NIR nou", localizați dropdown-ul produse
- Placeholder-ul arată: "📦 Selectați produs (30 disponibile)"

#### 2. Vizualizare Produse Organizate
Când deschideți dropdown-ul, veți vedea:

```
📦 Selectați produs (30 disponibile)
├── BAR (12)
│   ├── APA MINERALA • buc • 6.00 Lei
│   ├── APA PLATA • buc • 5.00 Lei
│   ├── BERE HEINEKEN • buc • 14.00 Lei
│   └── ... (alte produse BAR)
├── BUCATARIE (14)
│   ├── BACON • kg • 30.00 Lei
│   ├── CIORBA DE BURTA • buc • 22.00 Lei
│   └── ... (alte produse BUCATARIE)
├── BUFET (2)
│   └── ... (produse BUFET)
└── DIVERSE (2)
    └── ... (produse DIVERSE)
```

#### 3. Informații Afișate pentru Fiecare Produs

Format: **`Nume • Unitate Măsură • Preț`**

Exemple:
- `BERE URSUS • buc • 12.00 Lei`
- `FAINA • kg • 3.00 Lei`
- `VIN ALB • pahar • 18.00 Lei`

**Beneficii:**
- ✓ Vedeți prețul înainte de selecție
- ✓ Știți unitatea de măsură (kg, buc, l, pahar)
- ✓ Evitați confuziile între produse similare

#### 4. Procesul de Selecție

1. **Deschideți dropdown-ul** produse
2. **Navigați** la departamentul dorit (ex: BAR, BUCATARIE)
3. **Selectați produsul** dorit din listă
4. Produsul selectat va apărea în câmpul dropdown
5. **Completați** cantitatea, prețul unitar, TVA și adaosul comercial
6. **Adăugați** produse suplimentare cu butonul "+ Adaugă produs"
7. **Generați NIR** când ați terminat de adăugat produse

### Avantaje ale Noii Implementări

| Înainte | Acum |
|---------|------|
| Listă plată cu 30+ produse | Organizat pe 4 departamente |
| Doar nume produs | Nume + Unitate + Preț |
| Greu de navigat | Grupuri mici, ușor de parcurs |
| Fără informații suplimentare | Toate detaliile vizibile |
| "Denumire produs" | "📦 Selectați produs (30 disponibile)" |

### Adăugarea de Produse Noi

Dacă doriți să adăugați produse noi în sistem:

1. Accesați **Gestiune → Catalog Produse**
2. Adăugați produsul cu toate detaliile
3. Produsul va apărea automat în dropdown-ul NIR
4. Produsele sunt organizate automat pe departamente

### Exemplu Complet de Creare NIR

1. Selectați **Furnizorul** (ex: Metro Cash & Carry)
2. Introduceți **Nr. NIR** (ex: NIR-2024-001)
3. **Selectați primul produs**:
   - Deschideți dropdown
   - Mergeți la departamentul BAR
   - Selectați "BERE URSUS • buc • 12.00 Lei"
4. Completați: Cantitate (50), Preț unitar (10.00), TVA (21%), Adaos (30%)
5. Adăugați mai multe produse dacă este necesar
6. Apăsați **"Generează NIR"**

### Suport Tehnic

Produsele sunt:
- **Încărcate** automat la deschiderea paginii NIR
- **Sortate** alfabetic pe departamente
- **Actualizate** în timp real când se adaugă produse noi
- **Validate** - doar produsele active apar în listă

Pentru probleme sau sugestii, contactați echipa IT.
