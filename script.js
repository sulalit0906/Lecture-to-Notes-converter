const { useEffect, useMemo, useState } = React;
const motion = window.framerMotion?.motion || {};

const STORAGE_KEY = "lecture-notes-converter:v1";
const PROFILE_KEY = "lecture-notes-converter:profile";

const sampleTranscript = `Good morning everyone. Today we study photosynthesis and its role in plant energy conversion. Photosynthesis happens mainly in chloroplasts, where chlorophyll absorbs light energy. The overall equation is 6CO2 + 6H2O -> C6H12O6 + 6O2. In 1779, Jan Ingenhousz showed that plants release oxygen in light. The light-dependent reactions produce ATP and NADPH, while the Calvin cycle uses carbon dioxide to synthesize glucose. Remember that stomata control gas exchange, and limiting factors include light intensity, carbon dioxide concentration, and temperature. For exams, compare C3, C4, and CAM plants, define chlorophyll, explain the Calvin cycle, and describe why photosynthesis supports food chains.`;

const demoLecture = {
  title: "Photosynthesis Lecture",
  transcript: sampleTranscript
};

const iconNames = {
  upload: "upload-cloud",
  file: "file-audio",
  brain: "brain-circuit",
  cards: "layers",
  quiz: "list-checks",
  map: "network",
  search: "search",
  settings: "settings",
  moon: "moon",
  sun: "sun",
  user: "user-circle",
  bot: "bot",
  download: "download",
  trash: "trash-2",
  play: "play",
  check: "check-circle-2",
  alert: "alert-circle",
  google: "chrome",
  lock: "lock",
  chart: "bar-chart-3",
  book: "book-open",
  spark: "sparkles",
  calendar: "calendar-days",
  formula: "sigma",
  menu: "panel-left",
  logout: "log-out"
};

function Icon({ name, className = "h-4 w-4" }) {
  return <i data-lucide={iconNames[name] || name} className={className} aria-hidden="true" />;
}

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uniqueId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function extractDefinitions(transcript) {
  const terms = [
    ["Photosynthesis", "Process by which green plants convert light energy into chemical energy stored as glucose."],
    ["Chlorophyll", "Green pigment in chloroplasts that absorbs light energy for photosynthesis."],
    ["Calvin cycle", "Light-independent pathway that uses carbon dioxide, ATP, and NADPH to form sugar."],
    ["Stomata", "Tiny leaf openings that regulate gas exchange and water vapor loss."]
  ];
  return terms.filter(([term]) => transcript.toLowerCase().includes(term.toLowerCase()));
}

function extractFormulas(transcript) {
  const formulas = [];
  if (/6co2|c6h12o6|6h2o/i.test(transcript)) {
    formulas.push("6CO2 + 6H2O -> C6H12O6 + 6O2");
  }
  return formulas;
}

function generateStudyPack(title, transcript) {
  const definitions = extractDefinitions(transcript);
  const formulas = extractFormulas(transcript);
  const names = ["Jan Ingenhousz", "1779"].filter((item) => transcript.includes(item));

  return {
    summary:
      "The lecture explains how plants use chlorophyll in chloroplasts to capture light energy and convert carbon dioxide and water into glucose and oxygen. It separates the light-dependent reactions from the Calvin cycle, then highlights exam themes such as limiting factors and plant adaptations.",
    keyPoints: [
      "Photosynthesis is the foundation of most food chains because it stores solar energy as glucose.",
      "Light-dependent reactions generate ATP and NADPH.",
      "The Calvin cycle fixes carbon dioxide into sugar molecules.",
      "Light intensity, carbon dioxide, and temperature can limit the rate of photosynthesis.",
      "C3, C4, and CAM plants use different strategies to handle carbon fixation and water stress."
    ],
    definitions,
    formulas,
    datesNames: names,
    examNotes: [
      "Draw and label a chloroplast, then connect thylakoids to light reactions and stroma to the Calvin cycle.",
      "Practice the balanced photosynthesis equation with reactants and products.",
      "Prepare a comparison table for C3, C4, and CAM plants.",
      "Use limiting-factor graphs to explain rate changes in exam answers."
    ],
    flashcards: [
      { q: "What is photosynthesis?", a: "The process plants use to convert light energy into chemical energy stored as glucose." },
      { q: "Where does photosynthesis mainly occur?", a: "In chloroplasts, especially in leaf cells." },
      { q: "What are ATP and NADPH used for?", a: "They provide energy and reducing power for the Calvin cycle." },
      { q: "Who showed that plants release oxygen in light?", a: "Jan Ingenhousz in 1779." }
    ],
    mcqs: [
      {
        difficulty: "Easy",
        q: "Which pigment absorbs light for photosynthesis?",
        options: ["Chlorophyll", "Hemoglobin", "Keratin", "Insulin"],
        answer: "Chlorophyll"
      },
      {
        difficulty: "Medium",
        q: "Which stage uses carbon dioxide to synthesize glucose?",
        options: ["Calvin cycle", "Glycolysis", "Krebs cycle", "Transpiration"],
        answer: "Calvin cycle"
      },
      {
        difficulty: "Hard",
        q: "Why are C4 plants often efficient in hot climates?",
        options: ["They reduce photorespiration", "They avoid chloroplasts", "They consume oxygen only", "They stop transpiration completely"],
        answer: "They reduce photorespiration"
      }
    ],
    importantQuestions: {
      short: [
        "Define chlorophyll.",
        "Name two limiting factors of photosynthesis.",
        "Write the balanced photosynthesis equation."
      ],
      long: [
        "Explain the light-dependent reactions and the Calvin cycle.",
        "Compare C3, C4, and CAM plants with examples.",
        "Describe how environmental factors affect photosynthesis."
      ],
      faqs: [
        "Why is photosynthesis important for life on Earth?",
        "How does chlorophyll help plants make food?",
        "What is the difference between respiration and photosynthesis?"
      ]
    },
    mindMap: [
      ["Photosynthesis", "Chloroplasts"],
      ["Photosynthesis", "Light reactions"],
      ["Photosynthesis", "Calvin cycle"],
      ["Light reactions", "ATP"],
      ["Light reactions", "NADPH"],
      ["Calvin cycle", "Glucose"],
      ["Photosynthesis", "Limiting factors"],
      ["Limiting factors", "Light"],
      ["Limiting factors", "CO2"],
      ["Limiting factors", "Temperature"]
    ],
    title
  };
}

function createLecture(fileName, transcript = sampleTranscript) {
  const title = fileName.replace(/\.[^/.]+$/, "") || demoLecture.title;
  const pack = generateStudyPack(title, transcript);
  return {
    id: uniqueId("lecture"),
    title,
    fileName,
    duration: "48 min",
    createdAt: new Date().toISOString(),
    transcript,
    notes: pack,
    quizScores: []
  };
}

function downloadBlob(name, type, content) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapePdfText(text) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\n/g, " ");
}

function makeSimplePdf(title, body) {
  const lines = [`${title}`, "", ...body.split("\n")].slice(0, 34);
  const commands = lines.map((line, index) => `BT /F1 11 Tf 50 ${760 - index * 20} Td (${escapePdfText(line.slice(0, 92))}) Tj ET`).join("\n");
  const stream = commands;
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((obj) => {
    offsets.push(pdf.length);
    pdf += `${obj}\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

function formatMarkdown(lecture) {
  const notes = lecture.notes;
  return `# ${lecture.title}

## Summary
${notes.summary}

## Key Points
${notes.keyPoints.map((item) => `- ${item}`).join("\n")}

## Definitions
${notes.definitions.map(([term, value]) => `- **${term}:** ${value}`).join("\n")}

## Formulas
${notes.formulas.map((item) => `- ${item}`).join("\n") || "- No formulas found."}

## Important Dates and Names
${notes.datesNames.map((item) => `- ${item}`).join("\n") || "- None detected."}

## Exam-Oriented Notes
${notes.examNotes.map((item) => `- ${item}`).join("\n")}
`;
}

function StatCard({ icon, label, value, helper }) {
  return (
    <section className="card float-in p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-slate-500 dark:text-slate-400">{label}</p>
          <strong className="mt-2 block text-3xl text-slate-950 dark:text-white">{value}</strong>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-ocean-100 text-ocean-700 dark:bg-ocean-500/15 dark:text-ocean-100">
          <Icon name={icon} className="h-6 w-6" />
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{helper}</p>
    </section>
  );
}

function SectionTitle({ icon, title, text, action }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-normal text-ocean-600 dark:text-ocean-100">
          <Icon name={icon} /> Study workspace
        </p>
        <h2 className="text-2xl font-black text-slate-950 dark:text-white">{title}</h2>
        {text ? <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{text}</p> : null}
      </div>
      {action}
    </div>
  );
}

function Sidebar({ active, setActive, dark, setDark, user, onLogout }) {
  const nav = [
    ["dashboard", "chart", "Dashboard"],
    ["upload", "upload", "Upload"],
    ["notes", "book", "Notes"],
    ["flashcards", "cards", "Flashcards"],
    ["quiz", "quiz", "Quiz"],
    ["mindmap", "map", "Mind Map"],
    ["search", "search", "Search"],
    ["assistant", "bot", "AI Chat"],
    ["settings", "settings", "Settings"]
  ];

  return (
    <aside className="glass-panel sticky top-4 hidden h-[calc(100vh-2rem)] w-72 shrink-0 rounded-lg p-4 lg:block">
      <div className="flex items-center gap-3 px-2 py-2">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-ocean-600 text-white">
          <Icon name="brain" className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-base font-black leading-tight text-slate-950 dark:text-white">Lecture to Notes Converter</h1>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">NotebookLM-style study OS</p>
        </div>
      </div>

      <nav className="mt-6 grid gap-2">
        {nav.map(([id, icon, label]) => (
          <button key={id} onClick={() => setActive(id)} className={`chip-button justify-start px-3 ${active === id ? "active" : ""}`}>
            <Icon name={icon} />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-6 rounded-lg border border-slate-200/70 bg-white/60 p-3 dark:border-slate-700/70 dark:bg-slate-950/20">
        <div className="flex items-center gap-3">
          <Icon name="user" className="h-9 w-9 text-ocean-600 dark:text-ocean-100" />
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-950 dark:text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="icon-button" onClick={() => setDark(!dark)} title="Change theme">
            <Icon name={dark ? "sun" : "moon"} />
          </button>
          <button className="icon-button" onClick={onLogout} title="Log out">
            <Icon name="logout" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function MobileNav({ active, setActive }) {
  const nav = [
    ["dashboard", "chart", "Dashboard"],
    ["upload", "upload", "Upload"],
    ["notes", "book", "Notes"],
    ["quiz", "quiz", "Quiz"],
    ["assistant", "bot", "AI Chat"],
    ["settings", "settings", "Settings"]
  ];
  return (
    <div className="mobile-scroll lg:hidden">
      {nav.map(([id, icon, label]) => (
        <button key={id} onClick={() => setActive(id)} className={`chip-button px-3 ${active === id ? "active" : ""}`}>
          <Icon name={icon} />
          {label}
        </button>
      ))}
    </div>
  );
}

function AuthScreen({ onLogin }) {
  const [email, setEmail] = useState("student@example.com");
  const [password, setPassword] = useState("notebook123");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    if (!email.includes("@") || password.length < 6) {
      setError("Use a valid email and at least 6 characters for the password.");
      return;
    }
    onLogin({ name: email.split("@")[0], email, provider: "Email" });
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="glass-panel grid w-full max-w-5xl overflow-hidden rounded-lg lg:grid-cols-[1.05fr_0.95fr]">
        <div className="p-8 sm:p-10">
          <div className="mb-8 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-ocean-600 text-white">
              <Icon name="brain" className="h-7 w-7" />
            </span>
            <div>
              <p className="text-sm font-black uppercase tracking-normal text-ocean-600">Lecture to Notes Converter</p>
              <h1 className="text-2xl font-black text-slate-950 dark:text-white">Sign in to your study dashboard</h1>
            </div>
          </div>

          <form onSubmit={submit} className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Email</span>
              <input className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950/40" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Password</span>
              <input className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950/40" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700 dark:bg-red-500/10 dark:text-red-200">{error}</p> : null}
            <button className="primary-button px-5" type="submit">
              <Icon name="lock" /> Email login
            </button>
            <button className="ghost-button px-5" type="button" onClick={() => onLogin({ name: "Google Student", email: "student.google@example.com", provider: "Google" })}>
              <Icon name="google" /> Google Sign-In
            </button>
          </form>
        </div>
        <div className="hidden bg-ocean-600 p-10 text-white lg:grid">
          <div className="self-center">
            <p className="text-sm font-black uppercase tracking-normal text-ocean-100">AI study automation</p>
            <h2 className="mt-3 text-5xl font-black leading-none">Audio in. Exam-ready notes out.</h2>
            <div className="mt-8 grid gap-3">
              {["Speech-to-text transcripts", "AI notes, flashcards, MCQs", "Quiz mode with progress", "PDF, DOCX, Markdown exports"].map((item) => (
                <p key={item} className="flex items-center gap-3 rounded-lg bg-white/12 p-3 font-bold">
                  <Icon name="check" /> {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function UploadPanel({ onCreate, processing, setProcessing, pushToast }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  function validate(nextFile) {
    if (!nextFile) return false;
    const ok = /\.(mp3|wav|m4a)$/i.test(nextFile.name);
    if (!ok) {
      setError("Please upload an MP3, WAV, or M4A lecture recording.");
      return false;
    }
    setError("");
    setFile(nextFile);
    return true;
  }

  function process() {
    if (!file) {
      setError("Choose an audio file first.");
      return;
    }
    setProcessing(true);
    setProgress(8);
    const timer = setInterval(() => {
      setProgress((value) => {
        const next = Math.min(100, value + Math.round(Math.random() * 18));
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onCreate(createLecture(file.name));
            setProcessing(false);
            setProgress(0);
            setFile(null);
            pushToast("Transcript, notes, flashcards, quiz, and mind map generated.");
          }, 500);
        }
        return next;
      });
    }, 360);
  }

  return (
    <section className="card p-5">
      <SectionTitle icon="upload" title="Audio Upload" text="Upload MP3, WAV, or M4A lectures. Processing is simulated here and structured for a Gemini plus Firebase backend." />
      <label className="upload-zone grid cursor-pointer place-items-center p-8 text-center">
        <input className="sr-only" type="file" accept=".mp3,.wav,.m4a,audio/*" onChange={(event) => validate(event.target.files[0])} />
        <Icon name="file" className="h-12 w-12 text-ocean-600 dark:text-ocean-100" />
        <strong className="mt-4 text-xl text-slate-950 dark:text-white">{file ? file.name : "Drop a lecture recording here"}</strong>
        <span className="mt-2 text-sm text-slate-500 dark:text-slate-400">Speech-to-text, AI notes, flashcards, MCQs, and quiz assets will be generated automatically.</span>
      </label>
      {error ? <p className="mt-3 flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-200"><Icon name="alert" /> {error}</p> : null}
      {processing ? (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-600 dark:text-slate-300">
            <span>Uploading and transcribing</span>
            <span>{progress}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full bg-ocean-600 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="skeleton h-20 rounded-lg" />
            <div className="skeleton h-20 rounded-lg" />
            <div className="skeleton h-20 rounded-lg" />
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="primary-button px-5" onClick={process}>
            <Icon name="spark" /> Generate study pack
          </button>
          <button className="ghost-button px-5" onClick={() => onCreate(createLecture("Photosynthesis Demo.m4a"))}>
            <Icon name="play" /> Use demo lecture
          </button>
        </div>
      )}
    </section>
  );
}

function NotesPanel({ lecture }) {
  if (!lecture) return <EmptyState title="No notes yet" text="Upload a lecture or use the demo lecture to generate a complete study pack." />;
  const notes = lecture.notes;
  return (
    <section className="card p-5">
      <SectionTitle icon="book" title="AI Notes Generator" text={lecture.title} />
      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/20">
          <h3 className="mb-3 text-lg font-black text-slate-950 dark:text-white">Transcript</h3>
          <textarea className="scroll-area h-80 w-full resize-none rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 dark:border-slate-700 dark:bg-slate-950/40" readOnly value={lecture.transcript} />
        </div>
        <div className="grid gap-4">
          <InfoBlock title="Summary Notes" items={[notes.summary]} />
          <InfoBlock title="Key Points" items={notes.keyPoints} />
          <InfoBlock title="Important Definitions" items={notes.definitions.map(([term, value]) => `${term}: ${value}`)} icon="book" />
          <InfoBlock title="Formulas" items={notes.formulas.length ? notes.formulas : ["No formulas detected."]} icon="formula" />
          <InfoBlock title="Important Dates and Names" items={notes.datesNames.length ? notes.datesNames : ["None detected."]} icon="calendar" />
          <InfoBlock title="Exam-Oriented Notes" items={notes.examNotes} />
        </div>
      </div>
    </section>
  );
}

function InfoBlock({ title, items, icon = "check" }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/20">
      <h3 className="mb-3 flex items-center gap-2 font-black text-slate-950 dark:text-white">
        <Icon name={icon} /> {title}
      </h3>
      <ul className="grid gap-2 text-sm text-slate-600 dark:text-slate-300">
        {items.map((item, index) => (
          <li key={index} className="leading-6">{item}</li>
        ))}
      </ul>
    </article>
  );
}

function Flashcards({ lecture }) {
  const [flipped, setFlipped] = useState({});
  if (!lecture) return <EmptyState title="No flashcards yet" text="Generate notes first to create question-answer flashcards." />;
  return (
    <section className="card p-5">
      <SectionTitle icon="cards" title="Flashcard Generator" text="Click any card to flip between question and answer." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {lecture.notes.flashcards.map((card, index) => (
          <button key={card.q} className={`flip-card relative text-left ${flipped[index] ? "flipped" : ""}`} onClick={() => setFlipped({ ...flipped, [index]: !flipped[index] })}>
            <div className="flip-inner relative">
              <div className="flip-face card p-5">
                <p className="text-xs font-black uppercase tracking-normal text-ocean-600">Question</p>
                <h3 className="mt-3 text-xl font-black text-slate-950 dark:text-white">{card.q}</h3>
              </div>
              <div className="flip-face flip-back card bg-ocean-600 p-5 text-white">
                <p className="text-xs font-black uppercase tracking-normal text-ocean-100">Answer</p>
                <h3 className="mt-3 text-lg font-black">{card.a}</h3>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function QuizPanel({ lecture, onScore }) {
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const score = lecture ? lecture.notes.mcqs.filter((q, i) => answers[i] === q.answer).length : 0;

  if (!lecture) return <EmptyState title="No quiz yet" text="Upload a lecture to create easy, medium, and hard MCQs." />;

  function finish() {
    setDone(true);
    onScore(score, lecture.notes.mcqs.length);
  }

  return (
    <section className="card p-5">
      <SectionTitle icon="quiz" title="Quiz Mode" text="Answer generated MCQs and receive your score after completion." />
      <div className="grid gap-4">
        {lecture.notes.mcqs.map((question, index) => (
          <article key={question.q} className="rounded-lg border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/20">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-black text-slate-950 dark:text-white">{index + 1}. {question.q}</h3>
              <span className="rounded-full bg-ocean-100 px-3 py-1 text-xs font-black text-ocean-700 dark:bg-ocean-500/15 dark:text-ocean-100">{question.difficulty}</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {question.options.map((option) => {
                const selected = answers[index] === option;
                const correct = done && option === question.answer;
                const wrong = done && selected && option !== question.answer;
                return (
                  <button key={option} onClick={() => !done && setAnswers({ ...answers, [index]: option })} className={`rounded-lg border px-4 py-3 text-left font-bold transition ${correct ? "border-green-400 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-200" : wrong ? "border-red-400 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-200" : selected ? "border-ocean-500 bg-ocean-50 text-ocean-700 dark:bg-ocean-500/10 dark:text-ocean-100" : "border-slate-200 bg-white/60 text-slate-600 dark:border-slate-700 dark:bg-slate-950/20 dark:text-slate-300"}`}>
                    {option}
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button className="primary-button px-5" onClick={finish} disabled={Object.keys(answers).length < lecture.notes.mcqs.length}>
          <Icon name="check" /> Finish quiz
        </button>
        {done ? <p className="text-lg font-black text-slate-950 dark:text-white">Score: {score}/{lecture.notes.mcqs.length}</p> : null}
      </div>
    </section>
  );
}

function MindMap({ lecture }) {
  if (!lecture) return <EmptyState title="No mind map yet" text="Generate a lecture first to see topic relationships." />;
  const nodes = [
    ["Photosynthesis", 50, 50],
    ["Chloroplasts", 22, 26],
    ["Light reactions", 78, 27],
    ["Calvin cycle", 78, 72],
    ["Limiting factors", 25, 74],
    ["ATP + NADPH", 52, 18],
    ["Glucose", 54, 86]
  ];
  const links = [[0, 1], [0, 2], [0, 3], [0, 4], [2, 5], [3, 6]];
  return (
    <section className="card p-5">
      <SectionTitle icon="map" title="Visual Mind Map" text="A topic graph showing relationships extracted from lecture content." />
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950/20">
        <svg viewBox="0 0 100 100" className="h-[430px] w-full">
          <defs>
            <linearGradient id="nodeGradient" x1="0" x2="1">
              <stop stopColor="#0f6fd6" />
              <stop offset="1" stopColor="#1d8cf8" />
            </linearGradient>
          </defs>
          {links.map(([from, to]) => (
            <line key={`${from}-${to}`} x1={nodes[from][1]} y1={nodes[from][2]} x2={nodes[to][1]} y2={nodes[to][2]} stroke="#8bbce8" strokeWidth="0.7" />
          ))}
          {nodes.map(([label, x, y], index) => (
            <g key={label} className="mind-node">
              <rect x={x - (index === 0 ? 14 : 11)} y={y - 4.2} width={index === 0 ? 28 : 22} height="8.4" rx="2" fill={index === 0 ? "url(#nodeGradient)" : "#eff8ff"} stroke="#79afe3" />
              <text x={x} y={y + 1} textAnchor="middle" fontSize="2.6" fontWeight="800" fill={index === 0 ? "white" : "#0b58af"}>{label}</text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}

function ImportantQuestions({ lecture }) {
  if (!lecture) return null;
  return (
    <section className="card p-5">
      <SectionTitle icon="spark" title="Important Questions" text="Short-answer, long-answer, and frequently asked exam questions." />
      <div className="grid gap-4 lg:grid-cols-3">
        <InfoBlock title="Short Answer" items={lecture.notes.importantQuestions.short} />
        <InfoBlock title="Long Answer" items={lecture.notes.importantQuestions.long} />
        <InfoBlock title="Frequently Asked" items={lecture.notes.importantQuestions.faqs} />
      </div>
    </section>
  );
}

function SearchPanel({ lectures, setSelectedId }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return lectures;
    return lectures.filter((lecture) => `${lecture.title} ${lecture.transcript} ${formatMarkdown(lecture)}`.toLowerCase().includes(term));
  }, [query, lectures]);

  return (
    <section className="card p-5">
      <SectionTitle icon="search" title="Search Notes" text="Search across saved lectures, transcripts, generated notes, and questions." />
      <div className="relative">
        <Icon name="search" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-12 pr-4 dark:border-slate-700 dark:bg-slate-950/40" placeholder="Search photosynthesis, formula, Jan Ingenhousz..." value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div className="mt-4 grid gap-3">
        {results.map((lecture) => (
          <button key={lecture.id} className="rounded-lg border border-slate-200 bg-white/70 p-4 text-left transition hover:border-ocean-400 dark:border-slate-700 dark:bg-slate-950/20" onClick={() => setSelectedId(lecture.id)}>
            <h3 className="font-black text-slate-950 dark:text-white">{lecture.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{lecture.notes.summary}</p>
          </button>
        ))}
        {!results.length ? <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No saved lecture matches that search.</p> : null}
      </div>
    </section>
  );
}

function Assistant({ lecture }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Ask me about the active lecture. I can explain concepts, make examples, or help plan exam revision." }
  ]);
  const [input, setInput] = useState("");

  function ask() {
    if (!input.trim()) return;
    const lower = input.toLowerCase();
    let answer = "Based on the lecture, focus on the summary, key points, and exam notes. A strong answer should define the topic, explain the process, and include one concrete example.";
    if (lower.includes("formula") || lower.includes("equation")) answer = "The key formula is 6CO2 + 6H2O -> C6H12O6 + 6O2. Mention that carbon dioxide and water are reactants, while glucose and oxygen are products.";
    if (lower.includes("calvin")) answer = "The Calvin cycle is the light-independent stage. It uses CO2, ATP, and NADPH to build sugar molecules in the chloroplast stroma.";
    if (lower.includes("exam")) answer = "For exams, prepare the balanced equation, definitions, limiting factors, and a C3/C4/CAM comparison table.";
    setMessages([...messages, { role: "user", text: input }, { role: "assistant", text: answer }]);
    setInput("");
  }

  return (
    <section className="card p-5">
      <SectionTitle icon="bot" title="AI Chat Assistant" text={lecture ? `Answering questions about ${lecture.title}` : "Generate a lecture to ground the chat in your transcript."} />
      <div className="scroll-area grid max-h-[420px] gap-3 overflow-auto rounded-lg border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/20">
        {messages.map((message, index) => (
          <div key={index} className={`max-w-[84%] rounded-lg px-4 py-3 text-sm leading-6 ${message.role === "user" ? "ml-auto bg-ocean-600 text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>
            {message.text}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950/40" placeholder="Ask about the lecture..." value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && ask()} />
        <button className="primary-button px-5" onClick={ask}>
          <Icon name="spark" /> Ask
        </button>
      </div>
    </section>
  );
}

function ExportPanel({ lecture, pushToast }) {
  if (!lecture) return null;
  const markdown = formatMarkdown(lecture);
  function exportFile(type) {
    if (type === "md") downloadBlob(`${lecture.title}.md`, "text/markdown", markdown);
    if (type === "docx") downloadBlob(`${lecture.title}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", `<html><body><pre>${markdown}</pre></body></html>`);
    if (type === "pdf") downloadBlob(`${lecture.title}.pdf`, "application/pdf", makeSimplePdf(lecture.title, markdown));
    pushToast(`${type.toUpperCase()} export downloaded.`);
  }
  return (
    <section className="card p-5">
      <SectionTitle icon="download" title="Export Options" text="Download generated notes in study-friendly formats." />
      <div className="grid gap-3 sm:grid-cols-3">
        <button className="ghost-button px-5" onClick={() => exportFile("pdf")}><Icon name="download" /> PDF</button>
        <button className="ghost-button px-5" onClick={() => exportFile("docx")}><Icon name="download" /> DOCX</button>
        <button className="ghost-button px-5" onClick={() => exportFile("md")}><Icon name="download" /> Markdown</button>
      </div>
    </section>
  );
}

function Settings({ dark, setDark, fontScale, setFontScale, lectures, deleteLecture, user, updateUser }) {
  return (
    <section className="card p-5">
      <SectionTitle icon="settings" title="Settings and Profile" text="Manage theme, font size, saved lectures, and account details." />
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/20">
          <h3 className="mb-4 font-black text-slate-950 dark:text-white">Appearance</h3>
          <div className="flex flex-wrap gap-3">
            <button className="ghost-button px-4" onClick={() => setDark(!dark)}><Icon name={dark ? "sun" : "moon"} /> {dark ? "Light mode" : "Dark mode"}</button>
            <label className="flex min-h-[42px] items-center gap-3 rounded-lg border border-slate-200 px-4 font-bold dark:border-slate-700">
              Font size
              <input type="range" min="95" max="115" value={fontScale} onChange={(event) => setFontScale(Number(event.target.value))} />
            </label>
          </div>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/20">
          <h3 className="mb-4 font-black text-slate-950 dark:text-white">User Profile</h3>
          <div className="grid gap-3">
            <input className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950/40" value={user.name} onChange={(event) => updateUser({ ...user, name: event.target.value })} />
            <input className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950/40" value={user.email} onChange={(event) => updateUser({ ...user, email: event.target.value })} />
            <p className="text-sm text-slate-500 dark:text-slate-400">Provider: {user.provider}</p>
          </div>
        </article>
      </div>
      <article className="mt-4 rounded-lg border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/20">
        <h3 className="mb-4 font-black text-slate-950 dark:text-white">Delete Saved Lectures</h3>
        <div className="grid gap-2">
          {lectures.map((lecture) => (
            <div key={lecture.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <span className="font-bold text-slate-700 dark:text-slate-200">{lecture.title}</span>
              <button className="icon-button px-3 text-red-600" onClick={() => deleteLecture(lecture.id)} title="Delete lecture">
                <Icon name="trash" />
              </button>
            </div>
          ))}
          {!lectures.length ? <p className="text-sm text-slate-500 dark:text-slate-400">No lectures saved.</p> : null}
        </div>
      </article>
    </section>
  );
}

function EmptyState({ title, text }) {
  return (
    <section className="card grid min-h-[320px] place-items-center p-8 text-center">
      <div>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-ocean-100 text-ocean-700 dark:bg-ocean-500/15 dark:text-ocean-100">
          <Icon name="spark" className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-2 max-w-md text-slate-500 dark:text-slate-400">{text}</p>
      </div>
    </section>
  );
}

function Dashboard({ lectures, selectedLecture, setActive }) {
  const quizCount = lectures.reduce((sum, lecture) => sum + lecture.quizScores.length, 0);
  const progress = Math.min(100, lectures.length * 24 + quizCount * 12);
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="upload" label="Lectures uploaded" value={lectures.length} helper="Audio files saved to the local lecture database" />
        <StatCard icon="book" label="Notes generated" value={lectures.length} helper="Summaries, definitions, formulas, and exam notes" />
        <StatCard icon="quiz" label="Quizzes taken" value={quizCount} helper="Interactive MCQ attempts completed" />
        <StatCard icon="chart" label="Study progress" value={`${progress}%`} helper="Based on uploads and quiz activity" />
      </div>
      <section className="card p-5">
        <SectionTitle icon="brain" title="Study Dashboard" text="Upload lectures, search generated notes, run quizzes, and export revision material from one workspace." action={<button className="primary-button px-5" onClick={() => setActive("upload")}><Icon name="upload" /> New lecture</button>} />
        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-lg border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/20">
            <h3 className="mb-3 font-black text-slate-950 dark:text-white">Recent lectures</h3>
            <div className="grid gap-3">
              {lectures.slice(0, 4).map((lecture) => (
                <article key={lecture.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-black text-slate-950 dark:text-white">{lecture.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{lecture.duration} | {new Date(lecture.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Icon name="file" className="h-5 w-5 text-ocean-600" />
                  </div>
                </article>
              ))}
              {!lectures.length ? <EmptyMini /> : null}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-ocean-600 p-5 text-white dark:border-ocean-500">
            <p className="text-sm font-black uppercase tracking-normal text-ocean-100">Active lecture</p>
            <h3 className="mt-2 text-3xl font-black">{selectedLecture?.title || "No lecture selected"}</h3>
            <p className="mt-3 text-ocean-50">{selectedLecture?.notes.summary || "Use the upload panel to generate transcripts, notes, flashcards, MCQs, mind maps, and exports."}</p>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyMini() {
  return <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm font-bold text-slate-500 dark:border-slate-700 dark:text-slate-400">No lectures yet. Try the demo upload to populate the dashboard.</p>;
}

function App() {
  const [lectures, setLectures] = useState(() => loadJson(STORAGE_KEY, []));
  const [user, setUser] = useState(() => loadJson(PROFILE_KEY, null));
  const [selectedId, setSelectedId] = useState(() => loadJson(STORAGE_KEY, [])[0]?.id || "");
  const [active, setActive] = useState("dashboard");
  const [dark, setDark] = useState(() => localStorage.getItem("lecture-theme") === "dark");
  const [fontScale, setFontScale] = useState(() => Number(localStorage.getItem("lecture-font-scale")) || 100);
  const [processing, setProcessing] = useState(false);
  const [toasts, setToasts] = useState([]);

  const selectedLecture = lectures.find((lecture) => lecture.id === selectedId) || lectures[0] || null;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("lecture-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}%`;
    localStorage.setItem("lecture-font-scale", String(fontScale));
  }, [fontScale]);

  useEffect(() => {
    saveJson(STORAGE_KEY, lectures);
  }, [lectures]);

  useEffect(() => {
    if (user) saveJson(PROFILE_KEY, user);
  }, [user]);

  useEffect(() => {
    window.lucide?.createIcons();
  });

  function pushToast(text) {
    const toast = { id: uniqueId("toast"), text };
    setToasts((items) => [...items, toast]);
    setTimeout(() => setToasts((items) => items.filter((item) => item.id !== toast.id)), 3400);
  }

  function addLecture(lecture) {
    setLectures((items) => [lecture, ...items]);
    setSelectedId(lecture.id);
    setActive("notes");
  }

  function deleteLecture(id) {
    const next = lectures.filter((lecture) => lecture.id !== id);
    setLectures(next);
    setSelectedId(next[0]?.id || "");
    pushToast("Saved lecture deleted.");
  }

  function saveScore(score, total) {
    if (!selectedLecture) return;
    setLectures((items) => items.map((lecture) => lecture.id === selectedLecture.id ? { ...lecture, quizScores: [...lecture.quizScores, { score, total, at: new Date().toISOString() }] } : lecture));
    pushToast(`Quiz completed: ${score}/${total}`);
  }

  function logout() {
    localStorage.removeItem(PROFILE_KEY);
    setUser(null);
  }

  if (!user) return <AuthScreen onLogin={setUser} />;

  return (
    <main className="app-shell p-4 lg:p-6">
      <div className="mx-auto flex max-w-[1520px] gap-5">
        <Sidebar active={active} setActive={setActive} dark={dark} setDark={setDark} user={user} onLogout={logout} />
        <section className="min-w-0 flex-1">
          <header className="glass-panel mb-5 rounded-lg p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-black uppercase tracking-normal text-ocean-600 dark:text-ocean-100">
                  <Icon name="spark" /> Gemini-ready AI workspace
                </p>
                <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">Lecture to Notes Converter</h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-400">A responsive study dashboard for transcripts, AI notes, flashcards, MCQs, quiz scores, mind maps, exports, and lecture chat.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="icon-button px-3 lg:hidden" onClick={() => setDark(!dark)}><Icon name={dark ? "sun" : "moon"} /></button>
                <button className="primary-button px-5" onClick={() => setActive("upload")}><Icon name="upload" /> Upload audio</button>
              </div>
            </div>
            <div className="mt-4"><MobileNav active={active} setActive={setActive} /></div>
          </header>

          <div className="grid gap-5">
            {active === "dashboard" ? <Dashboard lectures={lectures} selectedLecture={selectedLecture} setActive={setActive} /> : null}
            {active === "upload" ? <UploadPanel onCreate={addLecture} processing={processing} setProcessing={setProcessing} pushToast={pushToast} /> : null}
            {active === "notes" ? (
              <>
                <NotesPanel lecture={selectedLecture} />
                <ImportantQuestions lecture={selectedLecture} />
                <ExportPanel lecture={selectedLecture} pushToast={pushToast} />
              </>
            ) : null}
            {active === "flashcards" ? <Flashcards lecture={selectedLecture} /> : null}
            {active === "quiz" ? <QuizPanel lecture={selectedLecture} onScore={saveScore} /> : null}
            {active === "mindmap" ? <MindMap lecture={selectedLecture} /> : null}
            {active === "search" ? <SearchPanel lectures={lectures} setSelectedId={setSelectedId} /> : null}
            {active === "assistant" ? <Assistant lecture={selectedLecture} /> : null}
            {active === "settings" ? <Settings dark={dark} setDark={setDark} fontScale={fontScale} setFontScale={setFontScale} lectures={lectures} deleteLecture={deleteLecture} user={user} updateUser={setUser} /> : null}
          </div>
        </section>
      </div>

      <div className="fixed right-4 top-4 z-50 grid gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-2xl">
            <Icon name="check" /> {toast.text}
          </div>
        ))}
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
