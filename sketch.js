let data;
let backgroundColor = '#1F1F2E';

let scuole = [];

// tutte le tipologie di scuole con il colore associato e la denominazione
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

// la scuola più piccola avrà un cerchio di raggio 4 e la più grande di raggio 30
let raggioMin = 4;
let raggioMax = 30;
let studentiMin = 15;
let studentiMax = 800;

// spazio per la legenda a sinistra e margine attorno al grafico
let larghezzaLegenda = 300;
let margine = 20;

// distanza dal centro del punto di attrazione di ogni tipologia
let distanzaGruppi = 120;

// spazio minimo tra due cerchi vicini
let spazio = 1;

async function setup() {
  createCanvas(windowWidth, windowHeight);

  // carico il mio dataset
  data = await loadTable("assets/scuole_superiori_milano_2026.csv", ",", "header");

  // area dello schermo dove sta la nuvola (a destra della legenda)
  let areaX = larghezzaLegenda + margine;
  let areaLarghezza = width - areaX - margine;
  let areaAltezza = height - 2 * margine;

  // centro unico della nuvola di scuole
  let centroNuvolaX = areaX + areaLarghezza / 2;
  let centroNuvolaY = margine + areaAltezza / 2;

  // legge le righe del dataset
  for (let numeroRiga = 0; numeroRiga < data.getRowCount(); numeroRiga++) {
    let codice = data.getString(numeroRiga, "CODICESCUOLA");
    let nome = data.getString(numeroRiga, "DENOMINAZIONESCUOLA");
    let comune = data.getString(numeroRiga, "DESCRIZIONECOMUNE");
    let tipologia = data.getString(numeroRiga, "DESCRIZIONETIPOLOGIAGRADOISTRUZIONESCUOLA");
    let studenti = data.getNum(numeroRiga, "ALUNNI_STIMATI");

    let typeIndex = tipologie.findIndex(t => t.key === tipologia);

    let r = map(sqrt(studenti), sqrt(studentiMin), sqrt(studentiMax), raggioMin, raggioMax);

    // ogni tipologia ha il suo punto di attrazione, su un cerchio attorno al centro
    let angolo = typeIndex * TWO_PI / tipologie.length;
    let centroX = centroNuvolaX + cos(angolo) * distanzaGruppi;
    let centroY = centroNuvolaY + sin(angolo) * distanzaGruppi;

    scuole.push({
      id: codice,
      name: nome,
      inMilano: comune.trim().toUpperCase() === "MILANO",
      studenti: studenti,
      color: tipologie[typeIndex].color,
      r: r,
      x: random(width),
      y: random(height),
      centroX: centroX,
      centroY: centroY
    });
  }

  console.log(scuole.length);
  console.log(scuole[0]);
}

function draw() {
  background(backgroundColor);

  noStroke();

  // i cerchi si muovono solo nei primi 300 fotogrammi, poi restano fermi
  if (frameCount < 300) {

    // ogni scuola si avvicina al punto di attrazione della propria tipologia
    for (let s of scuole) {
      s.x += (s.centroX - s.x) * 0.01;
      s.y += (s.centroY - s.y) * 0.01;
    }

    // collisioni: se due cerchi si sovrappongono, li allontano
    for (let iterazione = 0; iterazione < 4; iterazione++) {
      for (let i = 0; i < scuole.length; i++) {
        for (let j = i + 1; j < scuole.length; j++) {
          let a = scuole[i];
          let b = scuole[j];

          let distanza = dist(a.x, a.y, b.x, b.y);
          let distanzaMinima = a.r + b.r + spazio;

          if (distanza < distanzaMinima && distanza > 0) {
            let spinta = (distanzaMinima - distanza) / 2;
            let dx = (b.x - a.x) / distanza;
            let dy = (b.y - a.y) / distanza;

            a.x -= dx * spinta;
            a.y -= dy * spinta;
            b.x += dx * spinta;
            b.y += dy * spinta;
          }
        }
      }
    }
  }

  // il disegno invece avviene sempre
  for (let s of scuole) {
    fill(s.color);
    circle(s.x, s.y, s.r * 2);
  }
}