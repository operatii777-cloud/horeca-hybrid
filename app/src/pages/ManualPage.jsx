export default function ManualPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-amber-400 mb-6">
        📘 Manual de Instrucțiuni — HoReCa Hybrid
      </h1>

      <div className="space-y-6">
        {/* 1. Overview */}
        <Section title="1. Prezentare Generală" icon="🏠">
          <p>
            <strong>HoReCa Hybrid</strong> este o aplicație unificată de gestiune și vânzare
            pentru restaurante, baruri și cafenele. Accesul se face prin introducerea unui PIN:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li><code className="bg-gray-700 px-1.5 py-0.5 rounded text-amber-300">0000</code> — Admin (acces la Gestiune + Vânzare + toate funcțiile)</li>
            <li><code className="bg-gray-700 px-1.5 py-0.5 rounded text-blue-300">1111</code> — Ospătar 1 (acces la Vânzare POS)</li>
            <li><code className="bg-gray-700 px-1.5 py-0.5 rounded text-blue-300">2222</code> — Ospătar 2, <code className="bg-gray-700 px-1.5 py-0.5 rounded text-blue-300">3333</code> — Ospătar 3, etc.</li>
          </ul>
        </Section>

        {/* 2. POS / Sales */}
        <Section title="2. Interfața de Vânzare (POS)" icon="💰">
          <h4 className="font-bold text-blue-300 mt-3 mb-1">2.1 Comandă Nouă</h4>
          <ol className="list-decimal ml-6 space-y-1">
            <li>Selectați masa din bara de sus (1-10)</li>
            <li>Filtrați produsele pe categorii (Bucatarie, Bar, Alcoolice, etc.)</li>
            <li>Click pe produs pentru a-l adăuga în coș</li>
            <li>Folosiți butoanele <strong>+</strong> și <strong>−</strong> pentru a ajusta cantitatea</li>
            <li>Apăsați <strong>„Trimite comanda"</strong> pentru a trimite la bucătărie</li>
          </ol>

          <h4 className="font-bold text-blue-300 mt-3 mb-1">2.2 Comenzi Deschise</h4>
          <p>Vizualizați toate comenzile active. Pentru fiecare comandă puteți:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Închide cu plată <strong>Cash</strong> sau <strong>Card</strong></li>
            <li>La închidere, stocul se actualizează automat (prin rețete sau direct)</li>
          </ul>

          <h4 className="font-bold text-blue-300 mt-3 mb-1">2.3 Istoric Comenzi</h4>
          <p>Toate comenzile închise, cu detalii despre produse, total și metoda de plată.</p>
        </Section>

        {/* 3. TV Monitor */}
        <Section title="3. TV Monitor" icon="📺">
          <p>
            Afișaj în timp real al comenzilor active, ideal pentru monitorizare în bucătărie sau bar.
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li><span className="text-green-400 font-bold">Verde</span> — Comandă nouă (&lt;10 min)</li>
            <li><span className="text-yellow-400 font-bold">Galben</span> — În așteptare (10-20 min)</li>
            <li><span className="text-red-400 font-bold">Roșu</span> — Urgentă (&gt;20 min)</li>
          </ul>
          <p className="mt-2">Se reîmprospătează automat la fiecare 5 secunde.</p>
        </Section>

        {/* 4. Management */}
        <Section title="4. Gestiune (doar Admin)" icon="📦">
          <h4 className="font-bold text-amber-300 mt-3 mb-1">4.1 Produse</h4>
          <p>Adăugați, editați sau ștergeți produse. Fiecare produs are: denumire, preț, unitate de măsură, departament și categorie. Coloana Stoc arată cantitatea disponibilă.</p>

          <h4 className="font-bold text-amber-300 mt-3 mb-1">4.2 Rețete</h4>
          <p>Definiți compoziția unui produs final din ingrediente cu cantități. La vânzare, stocul de ingrediente scade automat conform rețetei.</p>

          <h4 className="font-bold text-amber-300 mt-3 mb-1">4.3 Furnizori</h4>
          <p>Gestionați lista furnizorilor de materii prime.</p>

          <h4 className="font-bold text-amber-300 mt-3 mb-1">4.4 NIR (Notă de Intrare Recepție)</h4>
          <p>Înregistrați recepția mărfii de la furnizori. La salvare, stocul crește automat cu cantitățile recepționate.</p>

          <h4 className="font-bold text-amber-300 mt-3 mb-1">4.5 Transfer</h4>
          <p>Mutați produse între departamente (ex: din BUCATARIE în BAR). Stocul se ajustează automat la ambele departamente.</p>

          <h4 className="font-bold text-amber-300 mt-3 mb-1">4.6 Retur</h4>
          <p>Returnați produse către furnizor. Stocul scade automat cu cantitățile returnate.</p>

          <h4 className="font-bold text-amber-300 mt-3 mb-1">4.7 Inventar</h4>
          <p>Creați un inventar pe departament. Sistemul populează automat stocul din sistem, iar dumneavoastră completați stocul real. Diferențele se calculează automat.</p>

          <h4 className="font-bold text-amber-300 mt-3 mb-1">4.8 Stoc</h4>
          <p>Vizualizați stocul curent per produs și departament, cu filtrare pe departament.</p>

          <h4 className="font-bold text-amber-300 mt-3 mb-1">4.9 Categorii & Departamente</h4>
          <p>Adăugați sau editați categorii de produse și departamente.</p>
        </Section>

        {/* 5. Reports */}
        <Section title="5. Rapoarte" icon="📊">
          <p>Raportul de vânzări afișează:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Total vânzări (Lei)</li>
            <li>Număr comenzi închise</li>
            <li>Defalcare pe metodă de plată (Cash / Card)</li>
          </ul>
        </Section>

        {/* 6. Interconnection */}
        <Section title="6. Interconectare Vânzare ↔ Gestiune" icon="🔗">
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
          </div>
        </Section>

        {/* 7. Keyboard shortcuts */}
        <Section title="7. Sfaturi & Comenzi Rapide" icon="⌨️">
          <ul className="list-disc ml-6 space-y-1">
            <li>Folosiți sidebar-ul din stânga pentru navigare rapidă între module</li>
            <li>Meniurile cu ▼ se pot expanda/collapsa cu un click</li>
            <li>TV Monitor se reîmprospătează automat — ideal pe un ecran separat</li>
            <li>Admin-ul are acces la toate funcțiile; ospătarii doar la vânzare și monitor</li>
            <li>Tabelele AG Grid suportă sortare și filtrare pe coloane</li>
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
