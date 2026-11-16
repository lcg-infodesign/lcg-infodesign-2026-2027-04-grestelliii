let data;
let backgroundColor = '#1F1F2E';

// codice della scuola selezionata
let codiceSelezionato;

// riga del CSV che corrisponde alla scuola selezionata
let rigaScuola;

// margine e larghezza della colonna di testo a sinistra
let margine = 50;
let larghezzaColonna = 360;

// informazioni sulla scuola
let nome;
let tipologia;
let indirizzo;
let comune;
let studenti;
let colore;

// misure della griglia di pallini
let areaX;
let areaY;
let passo; // distanza tra due pallini vicini
let colonne;

// scuole, tipologie e colori
let tipologie = [
  { key: "LICEO SCIENTIFICO", label: "Liceo scientifico", color: '#66A9ED' },
  { key: "LICEO CLASSICO", label: "Liceo classico", color: '#ED6A5A' },
  { key: "LICEO ARTISTICO", label: "Liceo artistico", color: '#F4D35E' },
  { key: "ISTITUTO TECNICO COMMERCIALE", label: "Tecnico commerciale", color: '#9BC53D' },
  { key: "ISTITUTO TECNICO INDUSTRIALE", label: "Tecnico industriale", color: '#FA7921' },
  { key: "ISTITUTO TECNICO PER IL TURISMO", label: "Tecnico per il turismo", color: '#5BC0BE' },
  { key: "ISTITUTO TECNICO AGRARIO", label: "Tecnico agrario", color: '#8E7DBE' },
  { key: "ISTITUTO TECNICO PER GEOMETRI", label: "Tecnico per geometri", color: '#E56399' },
  { key: "ISTITUTO TECNICO PER ATTIVITA' SOCIALI (GIA' ITF)", label: "Tecnico attività sociali", color: '#C9ADA7' }
];

async function setup() {

  createCanvas(windowWidth, windowHeight);

  // carico il dataset
  data = await loadTable("assets/scuole_superiori_milano_2026.csv", ",", "header");

  // legge i parametri dell'URL
  let parametri = getURLParams();

  // salva il codice della scuola selezionata
  codiceSelezionato = parametri.school;

  // cerco nella tabella la riga con quel codice
  rigaScuola = data.findRow(codiceSelezionato, "CODICESCUOLA");

  // console.log(codiceSelezionato);
  //  if (rigaScuola) {
  //    console.log(rigaScuola.get("DENOMINAZIONESCUOLA"));
  //  }

  if (rigaScuola) {
    console.log(rigaScuola.get("DENOMINAZIONESCUOLA"));

    // legge le informazioni della scuola
    nome = rigaScuola.get("DENOMINAZIONESCUOLA");
    tipologia = rigaScuola.get("DESCRIZIONETIPOLOGIAGRADOISTRUZIONESCUOLA");
    indirizzo = rigaScuola.get("INDIRIZZOSCUOLA");
    comune = rigaScuola.get("DESCRIZIONECOMUNE");

    // trasforma gli studenti in numero
    studenti = int(rigaScuola.get("ALUNNI_STIMATI"));

    // colore della scuola (lo prende dalla legenda sopra)
    colore = tipologie.find(t => t.key === tipologia).color;

    // area a destra dove stanno i pallini
    areaX = larghezzaColonna + margine;
    areaY = margine;
    let areaLarghezza = width - areaX - margine;
    let areaAltezza = height - 2 * margine;

    // lato della cella di ogni pallino
    // parto da un valore teorico
    passo = sqrt((areaLarghezza * areaAltezza) / studenti);

    // riduco il valore di sopra finché righe x colonne bastano per tutti i pallini
    // in questo modo la griglia si adatta per ogni numero di pallini
    while (floor(areaLarghezza / passo) * floor(areaAltezza / passo) < studenti) {
      passo--;
    }

    // le scuole piccole non devono avere pallini enormi
    passo = min(passo, 40);

    // quanti pallini stanno in una riga
    colonne = floor(areaLarghezza / passo);
  }
}

function draw() {
  background(backgroundColor);

  // se il codice non corrisponde a nessuna scuola, non disegno nulla
  if (!rigaScuola) {
    return;
  }

  noStroke();
  textAlign(LEFT, TOP);

  // nome della scuola
  fill(255);
  textSize(36);
  textLeading(42);
  text(nome, margine, margine, larghezzaColonna - margine);

  // caratteristiche della scuola
  disegnaCampo("TIPOLOGIA", tipologia, 260);
  disegnaCampo("CODICE", codiceSelezionato, 360);
  disegnaCampo("INDIRIZZO", indirizzo + "\n" + comune, 460);

  // legenda
  fill(colore);
  circle(margine + 8, height - margine - 22, 14);
  fill(255);
  textSize(14);
  textLeading(20);
  text("1 pallino = 1 studente stimato\n(totale: " + studenti + ")", margine + 28, height - margine - 34);

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