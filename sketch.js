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

// numero minimo e massimo degli studenti
let studentiMin = 15;
let studentiMax = 800;

// spazio per la legenda a sinistra e margine attorno al grafico
let larghezzaLegenda = 300;
let margine = 20;

// margine di titolo e legenda (sopra e sinistra)
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

  // area dello schermo dove stanno i cerchi (a destra della legenda)
  let areaX = larghezzaLegenda + margine;
  let areaLarghezza = width - areaX - margine;
  let areaAltezza = height - 2 * margine;

  // centro dell'area dove stanno i cerchi
  let centroNuvolaX = areaX + areaLarghezza / 2;
  let centroNuvolaY = margine + areaAltezza / 2;

  // ciclo che legge ogni riga del dataset
  for (let numeroRiga = 0; numeroRiga < data.getRowCount(); numeroRiga++) {
    let codice = data.getString(numeroRiga, "CODICESCUOLA");
    let nome = data.getString(numeroRiga, "DENOMINAZIONESCUOLA");
    let comune = data.getString(numeroRiga, "DESCRIZIONECOMUNE");
    let tipologia = data.getString(numeroRiga, "DESCRIZIONETIPOLOGIAGRADOISTRUZIONESCUOLA");
    let studenti = data.getNum(numeroRiga, "ALUNNI_STIMATI");

    // scorre la lista delle tipologie (in alto) e per ogni elemento t controlla se la sua key è uguale al testo tipologia letto dal csv
    let tipologiaIndex = tipologie.findIndex(t => t.key === tipologia);

    // i cerchi sono propozionali al numero di studenti, uso la radice quadrata per non farli troppo grandi
    let r = map(sqrt(studenti), sqrt(studentiMin), sqrt(studentiMax), raggioMin, raggioMax);

    // ogni tipologia ha il suo punto di attrazione, su un cerchio attorno al centro
    let angolo = tipologiaIndex * TWO_PI / tipologie.length;
    let centroX = centroNuvolaX + cos(angolo) * distanzaGruppi;
    let centroY = centroNuvolaY + sin(angolo) * distanzaGruppi;

    // crea la scheda di una scuola con tutte le sue informazioni e la aggiunge ad una lista "scuole"
    // questo comando viene eseguito per ogni riga del csv
    scuole.push({
      id: codice,
      name: nome,
      inMilano: comune.trim().toUpperCase() === "MILANO",
      studenti: studenti,
      color: tipologie[tipologiaIndex].color,
      r: r,
      x: random(width),
      y: random(height),
      centroX: centroX,
      centroY: centroY
    });
  }

  // console.log(scuole.length);
  // console.log(scuole[0]);
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

    // COLLISIONI: se due cerchi si sovrappongono, li allontano
    // ripeto tutto 4 volte per evitare nuovi scontri
    for (let iterazione = 0; iterazione < 4; iterazione++) {

      // controlla ogni scuola
      // impone che ogni coppia di scuola sia controllata solo una volta
      for (let i = 0; i < scuole.length; i++) {

        for (let j = i + 1; j < scuole.length; j++) {
          let a = scuole[i];
          let b = scuole[j];

          let distanza = dist(a.x, a.y, b.x, b.y);
          let distanzaMinima = a.r + b.r + spazio;

          // questa cosa avviene solo se i cerchi sono troppo vicini
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
    // colore di riempimento è quello della tipologia
    fill(s.color);

    // bordo: bianco solo se la scuola è nel comune di Milano
    if (s.inMilano) {
      stroke(255);
      strokeWeight(2);
    } else {
      noStroke();
    }

    circle(s.x, s.y, s.r * 2);

    // se il mouse è dentro un cerchio vedo le informazioni della scuola
    if (dist(mouseX, mouseY, s.x, s.y) < s.r) {
      nomeSotto = s.name;
      codiceSotto = s.id;
      sopraScuola = true;
    }
  }

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

    fill(255);
    text(nomeSotto, mouseX + 16, mouseY + 14);

  } else {
    cursor(ARROW);
  }
}

// viene eseguita una volta ogni volta che clicco con il mouse
function mousePressed() {

  // vado al dettaglio solo se il mouse è sopra una scuola
  if (sopraScuola) {

    // inserisco il nuovo indirizzo
    let nuovoURL = "detail.html?school=" + codiceSotto;

    // console.log(nuovoURL);

    // apro la nuova pagina nella stessa scheda
    window.location.href = nuovoURL;
  }
}

function disegnaLegenda() {
  
  // info generali che valgono per tutto quello che c'è sotto
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
  text("COLORE = tipologia di istituto", margineLegenda, margineLegenda + 110);

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
  text("DIMENSIONE = alunni stimati", margineLegenda, y);
  y += 28;

  // tre esempi di scuole: una piccola, una media, una grande
  let esempi = [studentiMin, 400, studentiMax];

  // x è la posizione orizzontale del prossimo cerchio d'esempio
  let x = margineLegenda;

  for (let n of esempi) {

    // stesso calcolo del raggio usato per i cerchi veri
    let r = map(sqrt(n), sqrt(studentiMin), sqrt(studentiMax), raggioMin, raggioMax);

    noFill();
    stroke(150);
    strokeWeight(1);
    circle(x + r, y + raggioMax, r * 2);

    // numero di alunni sotto al cerchio
    noStroke();
    fill(255);
    textAlign(CENTER, TOP);
    text(n, x + r, y + 2 * raggioMax + 6);

    // posizione del cerchio successivo
    x += 2 * r + 30;
  }

  // spazio tra i cerchi d'esempio (e i loro numeri) e la legenda del bordo
  y += 2 * raggioMax + 34;

  // legenda del bordo
  fill(255);
  textAlign(LEFT, TOP);
  textSize(14);
  text("BORDO = comune dell'istituto", margineLegenda, y);
  y += 28;

  // esempio con bordo bianco
  fill(130);
  stroke(255);
  strokeWeight(2);
  circle(margineLegenda + 8, y + 8, 14);
  noStroke();
  fill(255);
  text("Scuola nel comune di Milano", margineLegenda + 28, y);
  y += 24;

  // esempio senza bordo
  fill(130);
  noStroke();
  circle(margineLegenda + 8, y + 8, 14);
  fill(255);
  text("Scuola in un altro comune", margineLegenda + 28, y);
  y += 34;

  // didascalie
  fill(180);
  textSize(12);
  
  text("Passa sopra a un cerchio per il nome,\nclicca per aprire il dettaglio", margineLegenda, y);

  text("Alcune scuole hanno all'interno sia \nil liceo sia l'istituto tecnico, ma il \ndataset le inserisce in quest'ultimo.", margineLegenda, y + 50);

  // riporto l'allineamento del testo com'era
  textAlign(LEFT, TOP);
}