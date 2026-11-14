let data;
let backgroundColor = '#1F1F2E';

// codice della scuola selezionata, letto dall'indirizzo della pagina
let codiceSelezionato;

// riga del CSV che corrisponde alla scuola selezionata
let rigaScuola;

// margine e larghezza della colonna di testo a sinistra
let margine = 50;
let larghezzaColonna = 360;

// le tipologie con i loro colori: uguali a quelle della pagina di insieme
let tipologie = [
  { key: "LICEO SCIENTIFICO", label: "Liceo scientifico", color: '#66A9ED' },
  { key: "LICEO CLASSICO", label: "Liceo classico", color: '#ED6A5A' },
  { key: "LICEO ARTISTICO", label: "Liceo artistico", color: '#F4D35E' },
  { key: "ISTITUTO TECNICO COMMERCIALE", label: "Tecnico commerciale", color: '#9BC53D' },
  { key: "ISTITUTO TECNICO INDUSTRIALE", label: "Tecnico industriale e Liceo", color: '#FA7921' },
  { key: "ISTITUTO TECNICO PER IL TURISMO", label: "Tecnico per il turismo e Liceo", color: '#5BC0BE' },
  { key: "ISTITUTO TECNICO AGRARIO", label: "Tecnico agrario", color: '#8E7DBE' },
  { key: "ISTITUTO TECNICO PER GEOMETRI", label: "Tecnico per geometri", color: '#E56399' },
  { key: "ISTITUTO TECNICO PER ATTIVITA' SOCIALI (GIA' ITF)", label: "Tecnico attività sociali", color: '#C9ADA7' }
];

async function setup() {
  // carico il dataset, come nella pagina di insieme
  data = await loadTable("assets/scuole_superiori_milano_2026.csv", ",", "header");

  // leggo i parametri dell'URL (es. ?school=MITF093013)
  let parametri = getURLParams();

  // salvo il codice della scuola selezionata
  codiceSelezionato = parametri.school;

  // creo l'area di disegno
  createCanvas(windowWidth, windowHeight);

  // cerco nella tabella la riga con quel codice
  rigaScuola = data.findRow(codiceSelezionato, "CODICESCUOLA");

  // controllo in console
  console.log(codiceSelezionato);
  if (rigaScuola) {
    console.log(rigaScuola.get("DENOMINAZIONESCUOLA"));
  }
}

function draw() {
  background(backgroundColor);

  // se il codice non corrisponde a nessuna scuola, non disegno altro
  if (!rigaScuola) {
    return;
  }

  // leggo le informazioni della scuola dalla sua riga
  let nome = rigaScuola.get("DENOMINAZIONESCUOLA");
  let tipologia = rigaScuola.get("DESCRIZIONETIPOLOGIAGRADOISTRUZIONESCUOLA");
  let indirizzo = rigaScuola.get("INDIRIZZOSCUOLA");
  let comune = rigaScuola.get("DESCRIZIONECOMUNE");

  // numero di studenti: il CSV lo dà come testo, int() lo trasforma in numero
  let studenti = int(rigaScuola.get("ALUNNI_STIMATI"));

  // colore della scuola: quello della sua tipologia
  let colore = tipologie.find(t => t.key === tipologia).color;

  noStroke();
  textAlign(LEFT, TOP);

  // nome della scuola in grande
  fill(255);
  textSize(36);
  textLeading(42);
  text(nome, margine, margine, larghezzaColonna - margine);

  // caratteristiche della scuola
  disegnaCampo("TIPOLOGIA", tipologia, 260);
  disegnaCampo("CODICE", codiceSelezionato, 360);
  disegnaCampo("INDIRIZZO", indirizzo + "\n" + comune, 460);

  // legenda: come leggere i pallini
  fill(colore);
  circle(margine + 8, height - margine - 22, 14);
  fill(255);
  textSize(14);
  textLeading(20);
  text("1 pallino = 1 studente stimato\n(totale: " + studenti + ")", margine + 28, height - margine - 34);

  // area a destra dove stanno i pallini
  let areaX = larghezzaColonna + margine;
  let areaY = margine;
  let areaLarghezza = width - areaX - margine;
  let areaAltezza = height - 2 * margine;

  // lato della cella di ogni pallino: parto da un valore teorico...
  let passo = sqrt((areaLarghezza * areaAltezza) / studenti);

  // ...e lo riduco finché righe x colonne bastano per tutti i pallini
  while (floor(areaLarghezza / passo) * floor(areaAltezza / passo) < studenti) {
    passo--;
  }

  // le scuole piccole non devono avere pallini enormi
  passo = min(passo, 40);

  // quanti pallini stanno in una riga
  let colonne = floor(areaLarghezza / passo);

  // disegno un pallino per ogni studente
  fill(colore);
  for (let i = 0; i < studenti; i++) {
    let colonna = i % colonne;
    let riga = floor(i / colonne);

    circle(
      areaX + colonna * passo + passo / 2,
      areaY + riga * passo + passo / 2,
      passo * 0.8
    );
  }
}

// scrive un'etichetta piccola grigia e, sotto, il suo valore in bianco
function disegnaCampo(etichetta, valore, y) {
  // etichetta
  textSize(13);
  fill(150);
  text(etichetta, margine, y);

  // valore
  textSize(18);
  textLeading(24);
  fill(255);
  text(valore, margine, y + 22, larghezzaColonna - margine);
}