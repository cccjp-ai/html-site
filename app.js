const KEY_RING = [
  { major: "C", minor: "Am" },
  { major: "G", minor: "Em" },
  { major: "D", minor: "Bm" },
  { major: "A", minor: "F#m" },
  { major: "E", minor: "C#m" },
  { major: "B", minor: "G#m" },
  { major: "Gb", minor: "Ebm" },
  { major: "Db", minor: "Bbm" },
  { major: "Ab", minor: "Fm" },
  { major: "Eb", minor: "Cm" },
  { major: "Bb", minor: "Gm" },
  { major: "F", minor: "Dm" }
];

const MAJOR_SCALES = {
  C: ["C", "D", "E", "F", "G", "A", "B"],
  G: ["G", "A", "B", "C", "D", "E", "F#"],
  D: ["D", "E", "F#", "G", "A", "B", "C#"],
  A: ["A", "B", "C#", "D", "E", "F#", "G#"],
  E: ["E", "F#", "G#", "A", "B", "C#", "D#"],
  B: ["B", "C#", "D#", "E", "F#", "G#", "A#"],
  Gb: ["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F"],
  Db: ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
  Ab: ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
  Eb: ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
  Bb: ["Bb", "C", "D", "Eb", "F", "G", "A"],
  F: ["F", "G", "A", "Bb", "C", "D", "E"]
};

const DEGREE_META = {
  major: [
    { roman: "I", fn: "T" },
    { roman: "ii", fn: "S" },
    { roman: "iii", fn: "T" },
    { roman: "IV", fn: "S" },
    { roman: "V", fn: "D" },
    { roman: "vi", fn: "T" },
    { roman: "vii°", fn: "D" }
  ],
  minor: [
    { roman: "i", fn: "T" },
    { roman: "ii°", fn: "S" },
    { roman: "III", fn: "T" },
    { roman: "iv", fn: "S" },
    { roman: "V", fn: "D" },
    { roman: "VI", fn: "T" },
    { roman: "VII", fn: "D", omitted: true }
  ]
};

const state = {
  mode: "major",
  key: "C"
};

function getCurrentPair() {
  if (state.mode === "major") {
    return KEY_RING.find(k => k.major === state.key) || KEY_RING[0];
  }
  return KEY_RING.find(k => k.minor === state.key) || KEY_RING[0];
}

function getMajorScaleForState() {
  const pair = getCurrentPair();
  return MAJOR_SCALES[pair.major] || MAJOR_SCALES.C;
}

function buildMajorTriads(scale) {
  return [
    `${scale[0]}`,
    `${scale[1]}m`,
    `${scale[2]}m`,
    `${scale[3]}`,
    `${scale[4]}`,
    `${scale[5]}m`,
    `${scale[6]}dim`
  ];
}

function buildMinorTriads(scale) {
  const naturalMinor = [scale[5], scale[6], scale[0], scale[1], scale[2], scale[3], scale[4]];
  return [
    `${naturalMinor[0]}m`,
    `${naturalMinor[1]}dim`,
    `${naturalMinor[2]}`,
    `${naturalMinor[3]}m`,
    `${naturalMinor[4]}`,
    `${naturalMinor[5]}`,
    "—"
  ];
}

function renderTable() {
  const labelsRow = document.getElementById("degreeLabels");
  const chordsRow = document.getElementById("degreeChords");
  labelsRow.innerHTML = "";
  chordsRow.innerHTML = "";

  const scale = getMajorScaleForState();
  const chords = state.mode === "major" ? buildMajorTriads(scale) : buildMinorTriads(scale);
  const meta = DEGREE_META[state.mode];
  const cellClass = state.mode === "major" ? "is-major" : "is-minor";
  const toneClass = state.mode === "major" ? "tone-major" : "tone-minor";

  meta.forEach((item, idx) => {
    const labelCell = document.createElement("div");
    labelCell.className = `degree-cell ${toneClass}`;
    labelCell.innerHTML = `${item.roman}<span class="fn">${item.fn}</span>`;
    labelsRow.appendChild(labelCell);

    const chordCell = document.createElement("div");
    chordCell.className = `degree-cell ${cellClass}`;
    if (item.omitted) {
      chordCell.classList.add("is-absent");
    }
    chordCell.textContent = chords[idx] ?? "";
    chordsRow.appendChild(chordCell);
  });
}

function svgEl(name, attrs = {}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

function renderCircle() {
  const svg = document.getElementById("circleSvg");
  svg.innerHTML = "";

  const size = 640;
  const center = size / 2;
  const outerRadius = 260;
  const innerRadius = 175;

  const outerRing = svgEl("circle", {
    cx: center,
    cy: center,
    r: outerRadius + 22,
    class: "wheel-ring"
  });
  const innerRing = svgEl("circle", {
    cx: center,
    cy: center,
    r: innerRadius - 26,
    class: "wheel-ring"
  });
  svg.appendChild(outerRing);
  svg.appendChild(innerRing);

  KEY_RING.forEach((entry, idx) => {
    placeKey(svg, entry.major, "major", idx, outerRadius, center);
    placeKey(svg, entry.minor, "minor", idx, innerRadius, center);
  });
}

function placeKey(svg, label, mode, idx, radius, center) {
  const angle = (idx / KEY_RING.length) * Math.PI * 2 - Math.PI / 2;
  const x = center + Math.cos(angle) * radius;
  const y = center + Math.sin(angle) * radius;

  const group = svgEl("g", { class: "key-group", tabindex: 0, role: "button" });
  const isActive = state.mode === mode && state.key === label;
  if (isActive) {
    group.classList.add(mode === "major" ? "active-major" : "active-minor");
  } else {
    group.classList.add("inactive");
  }

  const hit = svgEl("circle", {
    cx: x,
    cy: y,
    r: mode === "major" ? 42 : 38,
    class: "key-hit"
  });

  const node = svgEl("circle", {
    cx: x,
    cy: y,
    r: mode === "major" ? 28 : 24,
    class: "key-circle"
  });

  const text = svgEl("text", {
    x,
    y,
    class: `key-label key-label--${mode}`,
    "aria-label": `${mode} ${label}`
  });
  text.textContent = label;

  const select = () => {
    if (isActive) return;
    state.mode = mode;
    state.key = label;
    renderAll();
  };

  group.addEventListener("click", select);
  group.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select();
    }
  });

  group.appendChild(hit);
  group.appendChild(node);
  group.appendChild(text);
  svg.appendChild(group);
}

function updateTags() {
  const pair = getCurrentPair();
  const keyTag = document.getElementById("keyTag");
  const modeTag = document.getElementById("modeTag");
  keyTag.textContent = state.mode === "major" ? pair.major : pair.minor;
  modeTag.textContent = state.mode === "major" ? "Major" : "Minor";
  keyTag.className = state.mode === "major" ? "pill pill--major" : "pill pill--minor";
  modeTag.className = "pill";
}

function renderAll() {
  renderCircle();
  renderTable();
  updateTags();
}

renderAll();
