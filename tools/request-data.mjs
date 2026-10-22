// Single source for the invoice request forms (request/*.html, de/request/*.html).
// Run `npm run build:requests` after editing. Prices must match services.html
// and de/services.html (checked by request-data.test.mjs).
//
// Sub-service `per` sets how it counts in the live estimate:
//   session / piece / 1000words → price × quantity box   flat → fixed price
//   from → "from X"   quote → "quoted after review"   info → describes the work only
// `value`s and field names stay English on both languages, so every email looks alike.

export const PRICES = {
  lecture: { eur: 350, usd: 385 },
  tutoring: { eur: 100, usd: 120 },
  tutoringPack: { eur: 950, usd: 1000 },
  langEdit: { eur: 150, usd: 165 },
  sciEdit: { eur: 220, usd: 240 },
  writingFrom: { eur: 800, usd: 880 },
  piece: { eur: 180, usd: 198 },
  consultHour: { eur: 95, usd: 105 },
  consultFrom: { eur: 750, usd: 820 },
  dataHour: { eur: 90, usd: 99 },
  dataFrom: { eur: 900, usd: 985 },
};

const opt = (value, en, de) => ({ value, en, de });

export const SERVICES = [
  {
    slug: 'lectures',
    seo: { en: 'Science Guest Lectures & STEM Workshops', de: 'Gastvorträge & MINT-Workshops' },   // search phrase for the page title
    name: { en: 'Guest lectures & workshops', de: 'Gastvorträge & Workshops' },
    billing: null,
    subs: [
      { id: 'guest-lecture', en: 'Single guest lecture', de: 'Einzelner Gastvortrag', per: 'session', price: 'lecture' },
      { id: 'workshop-series', en: 'Multi-session workshop series', de: 'Workshop-Reihe mit mehreren Terminen', per: 'quote' },
      { id: 'keynote', en: 'Keynote talk', de: 'Keynote', per: 'session', price: 'lecture' },
      { id: 'panel', en: 'Panel / moderation', de: 'Podium / Moderation', per: 'session', price: 'lecture' },
      { id: 'lab-activity', en: 'Lab or hands-on activity', de: 'Labor- oder Praxisaktivität', per: 'session', price: 'lecture' },
      { id: 'teacher-training', en: 'Teacher training / PD session', de: 'Lehrkräftefortbildung', per: 'session', price: 'lecture' },
      { id: 'curriculum', en: 'Curriculum or course design', de: 'Lehrplan- oder Kursgestaltung', per: 'quote' },
      { id: 'career-talk', en: 'Career talk (first-gen / international path in STEM)', de: 'Karrierevortrag (erste Generation / internationaler Weg in MINT)', per: 'session', price: 'lecture' },
    ],
    questions: [
      { name: 'audience_level', type: 'select', en: 'Audience', de: 'Publikum', options: [
        opt('high school', 'High school', 'Schule (Oberstufe)'), opt('university', 'University', 'Hochschule'),
        opt('general public', 'General public', 'Allgemeines Publikum'), opt('professionals', 'Professionals', 'Fachpublikum'), opt('other', 'Other', 'Sonstiges')] },
      { name: 'group_size', type: 'number', en: 'Group size', de: 'Gruppengröße' },
      { name: 'topic', type: 'text', en: 'Topic', de: 'Thema' },
      { name: 'dates', type: 'text', en: 'Preferred date(s)', de: 'Gewünschte(r) Termin(e)' },
    ],
  },
  {
    slug: 'tutoring',
    seo: { en: 'Online Biology & Science Tutoring', de: 'Nachhilfe Biologie & MINT' },   // search phrase for the page title
    name: { en: 'Tutoring & mentorship', de: 'Nachhilfe & Mentoring' },
    billing: null,
    subs: [
      { id: 'single-session', en: 'Single session', de: 'Einzelsitzung', per: 'session', price: 'tutoring' },
      { id: 'ten-sessions', en: '10-session package', de: 'Paket mit 10 Sitzungen', per: 'flat', price: 'tutoringPack' },
      { id: 'exam-prep', en: 'Exam prep (AP, IB, Abitur, MCAT/GRE)', de: 'Prüfungsvorbereitung (AP, IB, Abitur, MCAT/GRE)', per: 'session', price: 'tutoring' },
      { id: 'homework', en: 'Homework & course support', de: 'Hausaufgaben- und Kursbegleitung', per: 'session', price: 'tutoring' },
      { id: 'research-mentoring', en: 'Research project mentoring', de: 'Mentoring für Forschungsprojekte', per: 'session', price: 'tutoring' },
      { id: 'science-fair', en: 'Science fair / competition prep', de: 'Vorbereitung auf Wettbewerbe (z. B. Jugend forscht)', per: 'session', price: 'tutoring' },
      { id: 'applications', en: 'College or grad-school application guidance', de: 'Beratung zu Studien- und Promotionsbewerbungen', per: 'session', price: 'tutoring' },
      { id: 'phd-mentoring', en: 'PhD / career mentoring', de: 'Promotions- und Karrierementoring', per: 'session', price: 'tutoring' },
      { id: 'scholarships', en: 'Scholarship & Fulbright guidance', de: 'Beratung zu Stipendien und Fulbright', per: 'session', price: 'tutoring' },
    ],
    questions: [
      { name: 'student_level', type: 'select', en: "Student's level", de: 'Bildungsstand', options: [
        opt('middle school', 'Middle school', 'Mittelstufe'), opt('high school', 'High school', 'Oberstufe'),
        opt('university', 'University', 'Studium'), opt('graduate', 'Graduate', 'Master / Promotion'), opt('professional', 'Professional', 'Berufstätig')] },
      { name: 'subject', type: 'text', en: 'Subject', de: 'Fach' },
      { name: 'goals', type: 'textarea', en: 'Goals', de: 'Ziele' },
      { name: 'schedule', type: 'text', en: 'Preferred schedule', de: 'Gewünschte Zeiten' },
      { name: 'payer', type: 'radio', en: 'Who is paying?', de: 'Wer bezahlt?', options: [
        opt('parent', 'Parent', 'Eltern'), opt('student', 'Student', 'Schüler/in bzw. Studierende/r'), opt('school', 'School', 'Schule'), opt('other', 'Other', 'Sonstige')] },
    ],
  },
  {
    slug: 'writing',
    seo: { en: 'Scientific Editing & Proofreading', de: 'Englisches Lektorat & Korrektorat' },   // search phrase for the page title
    name: { en: 'Scientific writing & editing', de: 'Wissenschaftliches Schreiben & Lektorat' },
    billing: null,
    subs: [
      { id: 'language-edit', en: 'Language & clarity edit', de: 'Sprach- und Verständlichkeitslektorat', per: '1000words', price: 'langEdit' },
      { id: 'scientific-edit', en: 'Scientific edit', de: 'Wissenschaftliches Lektorat', per: '1000words', price: 'sciEdit' },
      { id: 'grant-writing', en: 'Grant writing', de: 'Schreiben von Förderanträgen', per: 'from', price: 'writingFrom' },
      { id: 'grant-review', en: 'Grant review', de: 'Prüfung von Förderanträgen', per: 'quote' },
      { id: 'ghostwriting', en: 'Original writing / ghostwriting', de: 'Eigene Texte / Ghostwriting', per: 'from', price: 'writingFrom' },
      { id: 'thesis-edit', en: 'Thesis or dissertation edit', de: 'Lektorat von Abschlussarbeit oder Dissertation', per: '1000words', price: 'sciEdit' },
      { id: 'cover-letter', en: 'Cover letter to journals', de: 'Anschreiben an Fachzeitschriften', per: 'quote' },
      { id: 'reviewer-reply', en: 'Reply to reviewers', de: 'Antwort auf Gutachten', per: 'quote' },
      { id: 'literature-review', en: 'Literature review', de: 'Literaturübersicht', per: 'quote' },
      { id: 'abstract-poster', en: 'Abstract / poster', de: 'Abstract / Poster', per: 'quote' },
      { id: 'translation-edit', en: 'Translation-and-edit (DE→EN)', de: 'Übersetzung mit Lektorat (DE→EN)', per: 'quote' },
    ],
    questions: [
      { name: 'document_type', type: 'select', en: 'Document type', de: 'Art des Dokuments', options: [
        opt('manuscript', 'Manuscript', 'Manuskript'), opt('grant', 'Grant', 'Förderantrag'), opt('thesis', 'Thesis', 'Abschlussarbeit'),
        opt('book or chapter', 'Book or chapter', 'Buch oder Kapitel'), opt('other', 'Other', 'Sonstiges')] },
      { name: 'target', type: 'text', en: 'Target journal or funder', de: 'Ziel-Fachzeitschrift oder Förderer' },
      { name: 'citation_style', type: 'text', en: 'Citation style', de: 'Zitierstil' },
    ],
  },
  {
    slug: 'communication',
    seo: { en: 'Science Writing & Communication', de: 'Wissenschaftskommunikation & Fachtexte' },   // search phrase for the page title
    name: { en: 'Science communication', de: 'Wissenschaftskommunikation' },
    billing: null,
    subs: [
      { id: 'blog-article', en: 'Blog article', de: 'Blogartikel', per: 'piece', price: 'piece' },
      { id: 'press-release', en: 'Press release', de: 'Pressemitteilung', per: 'piece', price: 'piece' },
      { id: 'newsletter', en: 'Newsletter', de: 'Newsletter', per: 'piece', price: 'piece' },
      { id: 'social-posts', en: 'Social media posts', de: 'Social-Media-Beiträge', per: 'piece', price: 'piece' },
      { id: 'script', en: 'Talk or podcast script', de: 'Skript für Vortrag oder Podcast', per: 'piece', price: 'piece' },
      { id: 'explainer', en: 'Explainer for patients / public', de: 'Erklärtext für Patientinnen, Patienten und Öffentlichkeit', per: 'piece', price: 'piece' },
      { id: 'infographic', en: 'Infographic text', de: 'Text für Infografiken', per: 'piece', price: 'piece' },
      { id: 'website-copy', en: 'Website science copy', de: 'Wissenschaftliche Website-Texte', per: 'piece', price: 'piece' },
      { id: 'monthly-package', en: 'Ongoing monthly package', de: 'Fortlaufendes Monatspaket', per: 'quote' },
    ],
    questions: [
      { name: 'audience', type: 'text', en: 'Audience', de: 'Zielgruppe' },
      { name: 'platform', type: 'text', en: 'Platform', de: 'Plattform' },
      { name: 'tone', type: 'text', en: 'Tone', de: 'Tonalität' },
    ],
  },
  {
    slug: 'consulting',
    seo: { en: 'Scientific Consulting & Research Advice', de: 'Wissenschaftliche Beratung & Forschung' },   // search phrase for the page title
    name: { en: 'Scientific consulting', de: 'Wissenschaftliche Beratung' },
    billing: { hour: 'consultHour', from: 'consultFrom' },
    subs: [
      { id: 'hourly-advice', en: 'Hourly advice', de: 'Beratung nach Stunden', per: 'info' },
      { id: 'data-interpretation', en: 'Data interpretation', de: 'Dateninterpretation', per: 'info' },
      { id: 'study-review', en: 'Experimental / study review', de: 'Prüfung von Experimenten oder Studien', per: 'info' },
      { id: 'rd-strategy', en: 'R&D strategy', de: 'F&E-Strategie', per: 'info' },
      { id: 'landscape', en: 'Literature & market landscape', de: 'Literatur- und Marktüberblick', per: 'info' },
      { id: 'due-diligence', en: 'Scientific due diligence', de: 'Wissenschaftliche Due Diligence', per: 'info' },
      { id: 'advisory', en: 'Advisory board / expert opinion', de: 'Beirat / Gutachten', per: 'info' },
    ],
    questions: [
      { name: 'field', type: 'select', en: 'Field', de: 'Fachgebiet', options: [
        opt('oncology', 'Oncology', 'Onkologie'), opt('neuroscience', 'Neuroscience', 'Neurowissenschaften'),
        opt('molecular biology', 'Molecular biology', 'Molekularbiologie'), opt('other', 'Other', 'Sonstiges')] },
      { name: 'stage', type: 'text', en: 'Stage of your work', de: 'Stand Ihres Vorhabens' },
    ],
  },
  {
    slug: 'data-analysis',
    seo: { en: 'Biomedical Data Analysis & Statistics', de: 'Biomedizinische Datenanalyse' },   // search phrase for the page title
    name: { en: 'Research & data analysis', de: 'Forschungs- & Datenanalyse' },
    billing: { hour: 'dataHour', from: 'dataFrom' },
    subs: [
      { id: 'study-design', en: 'Study design', de: 'Studiendesign', per: 'info' },
      { id: 'statistics', en: 'Statistical analysis', de: 'Statistische Analyse', per: 'info' },
      { id: 'ml-model', en: 'Machine learning model', de: 'Machine-Learning-Modell', per: 'info' },
      { id: 'omics', en: 'Biomarker / omics analysis', de: 'Biomarker- / Omics-Analyse', per: 'info' },
      { id: 'data-cleaning', en: 'Data cleaning', de: 'Datenbereinigung', per: 'info' },
      { id: 'figures', en: 'Figures & visualisation', de: 'Abbildungen & Visualisierung', per: 'info' },
      { id: 'pipeline', en: 'Reproducible R / Python pipeline', de: 'Reproduzierbare R- / Python-Pipeline', per: 'info' },
      { id: 'methods-writeup', en: 'Methods & results write-up', de: 'Methoden- und Ergebnisteil', per: 'info' },
      { id: 'team-training', en: 'Training your team', de: 'Schulung Ihres Teams', per: 'info' },
    ],
    questions: [
      { name: 'data_type', type: 'text', en: 'Data type', de: 'Art der Daten' },
      { name: 'data_size', type: 'text', en: 'Approximate size', de: 'Ungefährer Umfang' },
      { name: 'tools_used', type: 'text', en: 'Tools you use', de: 'Verwendete Werkzeuge' },
      { name: 'sensitive_data', type: 'radio', en: 'Does it include patient or other sensitive data?', de: 'Enthalten die Daten Patienten- oder andere sensible Daten?', options: [
        opt('yes', 'Yes', 'Ja'), opt('no', 'No', 'Nein'), opt('not sure', 'Not sure', 'Unsicher')] },
    ],
  },
];

export const BUDGETS = [
  { value: 'under-500', eur: 'Under €500', usd: 'Under $550', de_eur: 'Unter 500 €', de_usd: 'Unter 550 $' },
  { value: '500-1500', eur: '€500–1,500', usd: '$550–1,650', de_eur: '500–1.500 €', de_usd: '550–1.650 $' },
  { value: '1500-5000', eur: '€1,500–5,000', usd: '$1,650–5,500', de_eur: '1.500–5.000 €', de_usd: '1.650–5.500 $' },
  { value: 'over-5000', eur: 'Over €5,000', usd: 'Over $5,500', de_eur: 'Über 5.000 €', de_usd: 'Über 5.500 $' },
  { value: 'not-sure', eur: 'Not sure', usd: 'Not sure', de_eur: 'Noch unklar', de_usd: 'Noch unklar' },
];
