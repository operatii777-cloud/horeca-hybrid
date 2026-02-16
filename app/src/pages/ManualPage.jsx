export default function ManualPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-amber-400 mb-6">
        📘 Manual de Utilizare — HoReCa Hybrid
      </h1>

      <div className="space-y-6">
        {/* 1. Overview */}
        <Section title="1. Prezentare Generală" icon="🏠">
          <p>
            <strong>HoReCa Hybrid</strong> este o aplicație unificată de gestiune și vânzare
            pentru restaurante, baruri și cafenele. Accesul se face prin introducerea unui PIN:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li><code className="bg-gray-700 px-1.5 py-0.5 rounded text-amber-300">0000</code> — Admin (acces complet la toate modulele)</li>
            <li><code className="bg-gray-700 px-1.5 py-0.5 rounded text-blue-300">1111</code> — Ospătar 1 (POS + Display + Manual)</li>
            <li><code className="bg-gray-700 px-1.5 py-0.5 rounded text-blue-300">2222</code> — Ospătar 2, <code className="bg-gray-700 px-1.5 py-0.5 rounded text-blue-300">3333</code> — Ospătar 3, etc.</li>
          </ul>
          <p className="mt-3">Sidebar-ul din stânga conține 7 secțiuni: Operațional, Front Desk, Gestiune, Administrare, IT & Securitate, Display, Suport.</p>
        </Section>

        {/* 2. Operational */}
        <Section title="2. Operațional" icon="⚡">
          <h4 className="font-bold text-blue-300 mt-3 mb-1">2.1 Dashboard</h4>
          <p>Panou general cu indicatori cheie: total produse, comenzi deschise, comenzi închise azi, venituri, nivel stoc.</p>

          <h4 className="font-bold text-blue-300 mt-3 mb-1">2.2 POS Vânzare</h4>
          <ol className="list-decimal ml-6 space-y-1">
            <li>Selectați masa din bara de sus (1-10)</li>
            <li>Filtrați produsele pe categorii (Bucatarie, Bar, Alcoolice, etc.)</li>
            <li>Click pe produs pentru a-l adăuga în coș</li>
            <li>Folosiți butoanele <strong>+</strong> și <strong>−</strong> pentru a ajusta cantitatea</li>
            <li>Apăsați <strong>„Trimite comanda"</strong> pentru a trimite la bucătărie</li>
          </ol>

          <h4 className="font-bold text-blue-300 mt-3 mb-1">2.3 Plan Mese</h4>
          <p>Vizualizare grafică a celor 10 mese. Mesele ocupate apar în roșu, cele libere în verde. Click pe o masă pentru detalii comandă.</p>

          <h4 className="font-bold text-blue-300 mt-3 mb-1">2.4 KDS Bucătărie</h4>
          <p>Kitchen Display System — afișează comenzile active cu articole din departamentul BUCĂTĂRIE. Carduri codificate pe urgență (verde/galben/roșu). Se reîmprospătează automat la 5 secunde.</p>

          <h4 className="font-bold text-blue-300 mt-3 mb-1">2.5 KDS Bar</h4>
          <p>Același concept ca KDS Bucătărie, dar filtrează articolele din departamentele BAR și BUFET.</p>

          <h4 className="font-bold text-blue-300 mt-3 mb-1">2.6 Scoreboard Bucătărie</h4>
          <p>Clasament ospătari: afișează număr comenzi, venituri totale și media per comandă, ordonat descrescător.</p>

          <h4 className="font-bold text-blue-300 mt-3 mb-1">2.7 Pontaj (Time Clock)</h4>
          <p>Sistem de pontaj simplu: intrare/ieșire tura cu timestamp. Vizualizare ore lucrate per angajat.</p>

          <h4 className="font-bold text-blue-300 mt-3 mb-1">2.8 Raport Ospătari Live</h4>
          <p>Status în timp real al ospătarilor: comenzi deschise, valoare totală, comenzi închise azi.</p>
        </Section>

        {/* 3. Front Desk */}
        <Section title="3. Front Desk" icon="🛎️">
          <h4 className="font-bold text-purple-300 mt-3 mb-1">3.1 Rezervări</h4>
          <p>Gestionare rezervări: adăugare cu nume, dată, oră, număr persoane, masă, telefon. Vizualizare listă rezervări.</p>

          <h4 className="font-bold text-purple-300 mt-3 mb-1">3.2 Monitor Clienți</h4>
          <p>Ecran pentru clienți ce arată statusul comenzii în curs de preparare cu fonturi mari și design optimizat.</p>
        </Section>

        {/* 4. Gestiune */}
        <Section title="4. Gestiune (doar Admin)" icon="📦">
          <h4 className="font-bold text-amber-300 mt-3 mb-1">4.1 Catalog Produse</h4>
          <p>Adăugați, editați sau ștergeți produse. Fiecare produs are: denumire, preț, unitate de măsură, departament și categorie. Coloana Stoc arată cantitatea disponibilă.</p>

          <h4 className="font-bold text-amber-300 mt-3 mb-1">4.2 Rețetar & Fișe</h4>
          <p>Definiți compoziția unui produs final din ingrediente cu cantități. La vânzare, stocul de ingrediente scade automat conform rețetei.</p>

          <h4 className="font-bold text-amber-300 mt-3 mb-1">4.3 Stocuri</h4>
          <p>Vizualizați stocul curent per produs și departament, cu filtrare pe departament.</p>

          <h4 className="font-bold text-amber-300 mt-3 mb-1">4.4 NIR (Notă de Intrare Recepție)</h4>
          <p>Înregistrați recepția mărfii de la furnizori. La salvare, stocul crește automat cu cantitățile recepționate.</p>

          <h4 className="font-bold text-amber-300 mt-3 mb-1">4.5 Bon Consum</h4>
          <p>Înregistrați consumul intern (pierderi, probe, consum personal). Scade stocul fără a genera vânzare.</p>

          <h4 className="font-bold text-amber-300 mt-3 mb-1">4.6 Inventar</h4>
          <p>Creați un inventar pe departament. Sistemul populează automat stocul din sistem, iar dumneavoastră completați stocul real. Diferențele se calculează automat.</p>

          <h4 className="font-bold text-amber-300 mt-3 mb-1">4.7 Transferuri</h4>
          <p>Mutați produse între departamente (ex: din BUCATARIE în BAR). Stocul se ajustează automat la ambele departamente.</p>

          <h4 className="font-bold text-amber-300 mt-3 mb-1">4.8 Retur</h4>
          <p>Returnați produse către furnizor. Stocul scade automat cu cantitățile returnate.</p>

          <h4 className="font-bold text-amber-300 mt-3 mb-1">4.9 Waste</h4>
          <p>Evidență pierderi și risipă: produs, cantitate, motiv, dată. Raport sumar per produs.</p>

          <h4 className="font-bold text-amber-300 mt-3 mb-1">4.10 Furnizori</h4>
          <p>Gestionați lista furnizorilor de materii prime.</p>

          <h4 className="font-bold text-amber-300 mt-3 mb-1">4.11 HACCP & Igienizare</h4>
          <p>Checklist zilnic de conformitate: verificări temperatură, curățenie, igienă mâini. Cu timestamp automat.</p>

          <h4 className="font-bold text-amber-300 mt-3 mb-1">4.12 Categorii & Departamente</h4>
          <p>Adăugați sau editați categorii de produse și departamente.</p>
        </Section>

        {/* 5. Administrare */}
        <Section title="5. Administrare" icon="⚙️">
          <h4 className="font-bold text-cyan-300 mt-3 mb-1">5.1 Raport Vânzări</h4>
          <p>Total vânzări (Lei), număr comenzi închise, defalcare pe metodă de plată (Cash / Card).</p>

          <h4 className="font-bold text-cyan-300 mt-3 mb-1">5.2 Raport X</h4>
          <p>Raport de tură curent (fără închidere): total cash, total card, grand total, număr comenzi.</p>

          <h4 className="font-bold text-cyan-300 mt-3 mb-1">5.3 Raport Z</h4>
          <p>Raport de închidere de zi, cu buton „Închide Ziua". Afișează totaluri și interval de date.</p>

          <h4 className="font-bold text-cyan-300 mt-3 mb-1">5.4 Jurnal Tură</h4>
          <p>Predare tură: note, numerar în sertar, probleme raportate. Timestamp automat.</p>

          <h4 className="font-bold text-cyan-300 mt-3 mb-1">5.5 Comenzi Deschise & Istoric</h4>
          <p>Vizualizare comenzi deschise și toate comenzile închise cu detalii.</p>

          <h4 className="font-bold text-cyan-300 mt-3 mb-1">5.6 Ospătari & Staff</h4>
          <p>Gestionare utilizatori, roluri, PIN-uri.</p>

          <h4 className="font-bold text-cyan-300 mt-3 mb-1">5.7 Setări</h4>
          <p>Configurare restaurant: denumire, adresă, CUI, număr mese. Secțiuni: General, Imprimantă, Display.</p>
        </Section>

        {/* 6. IT & Securitate */}
        <Section title="6. IT & Securitate" icon="🔒">
          <h4 className="font-bold text-red-300 mt-3 mb-1">6.1 Audit Logs</h4>
          <p>Timeline cu toate acțiunile din sistem: deschidere/închidere comenzi, modificări stoc, login-uri.</p>
        </Section>

        {/* 7. Display */}
        <Section title="7. Display" icon="📺">
          <h4 className="font-bold text-green-300 mt-3 mb-1">7.1 Self-Service Kiosk</h4>
          <p>Interfață pentru clienți: produse cu butoane mari, categorii, coș, buton „Comandă". Optimizat pentru ecran tactil.</p>

          <h4 className="font-bold text-green-300 mt-3 mb-1">7.2 Feedback Terminal</h4>
          <p>Terminal de feedback cu 5 emoji-uri de rating + comentariu opțional. Confirmare „Mulțumim!".</p>

          <h4 className="font-bold text-green-300 mt-3 mb-1">7.3 TV Monitor Comenzi</h4>
          <p>Afișaj în timp real al comenzilor active, codificat pe urgență (verde/galben/roșu). Auto-refresh 5s.</p>

          <h4 className="font-bold text-green-300 mt-3 mb-1">7.4 TV Meniu Digital</h4>
          <p>Meniu digital pe TV: produse grupate pe categorii, carduri mari vizuale, auto-scroll între categorii.</p>

          <h4 className="font-bold text-green-300 mt-3 mb-1">7.5 Display Client (CDS)</h4>
          <p>Ecran orientat spre client cu comanda curentă, articole și total. Fonturi mari pentru vizibilitate.</p>
        </Section>

        {/* 8. Interconnection */}
        <Section title="8. Interconectare Vânzare ↔ Gestiune" icon="🔗">
          <p>Sistemul funcționează integrat:</p>
          <div className="mt-2 space-y-2">
            <div className="bg-gray-700/50 rounded-lg p-3">
              <strong className="text-green-400">NIR → Stoc ↑</strong>
              <p className="text-sm text-gray-300 mt-1">La recepție marfă, stocul crește automat.</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <strong className="text-blue-400">Transfer → Stoc ↔</strong>
              <p className="text-sm text-gray-300 mt-1">La transfer, stocul scade la sursă și crește la destinație.</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <strong className="text-red-400">Retur → Stoc ↓</strong>
              <p className="text-sm text-gray-300 mt-1">La retur către furnizor, stocul scade.</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <strong className="text-amber-400">Vânzare (închidere comandă) → Stoc ↓</strong>
              <p className="text-sm text-gray-300 mt-1">
                La închiderea comenzii, dacă produsul are rețetă, stocul ingredientelor scade conform rețetei.
                Dacă nu are rețetă, stocul produsului scade direct.
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <strong className="text-purple-400">Bon Consum / Waste → Stoc ↓</strong>
              <p className="text-sm text-gray-300 mt-1">Consumul intern și pierderile scad stocul fără a genera vânzare.</p>
            </div>
          </div>
        </Section>

        {/* 9. Tips */}
        <Section title="9. Sfaturi & Navigare" icon="⌨️">
          <ul className="list-disc ml-6 space-y-1">
            <li>Sidebar-ul din stânga are 7 secțiuni expandabile cu click</li>
            <li>Admin-ul vede toate secțiunile; ospătarii doar Operațional, Display și Suport</li>
            <li>KDS Bucătărie și KDS Bar sunt ideale pe ecrane dedicate în bucătărie/bar</li>
            <li>TV Monitor și TV Meniu Digital — proiectați pe televizoare în restaurant</li>
            <li>Self-Service Kiosk — pe tabletă/ecran tactil pentru clienți</li>
            <li>Feedback Terminal — la ieșirea din restaurant</li>
            <li>Tabelele AG Grid suportă sortare și filtrare pe coloane</li>
            <li>Toate ecranele KDS/Monitor se reîmprospătează automat</li>
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <h2 className="text-lg font-bold text-white mb-3">
        {icon} {title}
      </h2>
      <div className="text-gray-300 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
