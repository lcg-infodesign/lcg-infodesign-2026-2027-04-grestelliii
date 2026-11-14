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

// margine di titolo e legenda (da sopra e da sinistra)
let margineLegenda = 50;

// distanza dal centro del punto di attrazione di ogni tipologia
let distanzaGruppi = 120;

// spazio minimo tra due cerchi vicini
let spazio = 5;

// variabili per l'interazione col mouse
let sopraScuola = false;
let nomeSotto = "";
let codiceSotto = null;

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

  // a ogni fotogramma riparto da "il mouse non è sopra nessuna scuola"
  sopraScuola = false;

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
    // colore di riempimento: quello della tipologia
    fill(s.color);

    // bordo: bianco e spesso 2 pixel solo se la scuola è nel comune di Milano
    if (s.inMilano) {
      stroke(255);
      strokeWeight(2);
    } else {
      noStroke();
    }

    // diametro = raggio * 2 (circle() vuole il diametro, non il raggio)
    circle(s.x, s.y, s.r * 2);

    // se il mouse è dentro questo cerchio, ricordo quale scuola è
    if (dist(mouseX, mouseY, s.x, s.y) < s.r) {
      nomeSotto = s.name;
      codiceSotto = s.id;
      sopraScuola = true;
    }
  }

  // titolo e legenda
  disegnaLegenda();

  // il nome si disegna DOPO tutti i cerchi, così sta sopra
  if (sopraScuola) {
    cursor(HAND);
    noStroke();
    textSize(14);
    textAlign(LEFT, TOP);

    // riquadro scuro dietro al testo, largo quanto il testo
    let larghezzaTesto = textWidth(nomeSotto);
    fill(backgroundColor);
    rect(mouseX + 8, mouseY + 8, larghezzaTesto + 16, 28, 4);

    // testo bianco
    fill(255);
    text(nomeSotto, mouseX + 16, mouseY + 14);
  } else {
    cursor(ARROW);
  }
}

// viene eseguita una volta ogni volta che clicchi con il mouse
function mousePressed() {
  // vado al dettaglio solo se il mouse è sopra una scuola
  if (sopraScuola) {
    // costruisco il nuovo indirizzo: stessa cartella, pagina detail.html,
    // e dopo il "?" il parametro school con il codice della scuola
    let nuovoURL = "detail.html?school=" + codiceSotto;

    console.log(nuovoURL);

    // apro la nuova pagina nella stessa scheda
    window.location.href = nuovoURL;
  }
}

// disegna titolo e legenda nella fascia a sinistra
function disegnaLegenda() {
  // niente bordo sui cerchietti e sul testo
  noStroke();
  fill(255);
  textAlign(LEFT, TOP);

  // titolo
  textSize(28);
  text("SCUOLE SUPERIORI", margineLegenda, margineLegenda);
  textSize(16);
  text("in provincia di Milano nel 2026", margineLegenda, margineLegenda + 36);

  // legenda dei colori
  textSize(14);
  text("COLORE · tipologia di istituto", margineLegenda, margineLegenda + 110);

  // y è la posizione verticale della riga che sto disegnando
  let y = margineLegenda + 138;
  for (let t of tipologie) {
    // cerchietto del colore della tipologia
    fill(t.color);
    circle(margineLegenda + 8, y + 8, 14);

    // nome della tipologia accanto al cerchietto
    fill(255);
    text(t.label, margineLegenda + 28, y);

    // scendo di 24 pixel per la riga successiva
    y += 24;
  }

  // legenda delle dimensioni
  y += 20;
  fill(255);
  textAlign(LEFT, TOP);
  textSize(14);
  text("DIMENSIONE · alunni stimati", margineLegenda, y);
  y += 28;

  // tre esempi di scuole: una piccola, una media, una grande
  let esempi = [studentiMin, 400, studentiMax];

  // x è la posizione orizzontale del prossimo cerchio d'esempio
  let x = margineLegenda;

  for (let n of esempi) {
    // stesso calcolo del raggio usato per i cerchi veri
    let r = map(sqrt(n), sqrt(studentiMin), sqrt(studentiMax), raggioMin, raggioMax);

    // cerchio d'esempio: solo contorno grigio, senza colore
    noFill();
    stroke(150);
    strokeWeight(1);
    circle(x + r, y + raggioMax, r * 2);

    // numero di alunni sotto al cerchio, centrato
    noStroke();
    fill(255);
    textAlign(CENTER, TOP);
    text(n, x + r, y + 2 * raggioMax + 6);

    // preparo la posizione del cerchio successivo
    x += 2 * r + 30;
  }

  // scendo sotto i cerchi d'esempio e sotto i loro numeri
  y += 2 * raggioMax + 34;

  // legenda del bordo
  fill(255);
  textAlign(LEFT, TOP);
  textSize(14);
  text("BORDO · comune dell'istituto", margineLegenda, y);
  y += 28;

  // esempio con bordo bianco: scuola nel comune di Milano
  fill(130);
  stroke(255);
  strokeWeight(2);
  circle(margineLegenda + 8, y + 8, 14);
  noStroke();
  fill(255);
  text("Scuola nel comune di Milano", margineLegenda + 28, y);
  y += 24;

  // esempio senza bordo: scuola in un altro comune
  fill(130);
  noStroke();
  circle(margineLegenda + 8, y + 8, 14);
  fill(255);
  text("Scuola in un altro comune", margineLegenda + 28, y);
  y += 34;

  // come interagire con la visualizzazione
  fill(180);
  textSize(12);
  text("Passa sopra a un cerchio per il nome,\nclicca per aprire il dettaglio", margineLegenda, y);

  fill(180);
  textSize(12);
  text("Alcune scuola hanno all'interno sia \nil liceo sia l'istituto tecnico, ma il \ndataset li inserisce in quest'ultimo.", margineLegenda, y + 50);

  // riporto l'allineamento del testo com'era
  textAlign(LEFT, TOP);
}