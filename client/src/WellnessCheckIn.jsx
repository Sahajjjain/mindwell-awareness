import { useMemo, useState } from "react";
import { ArrowRight, ArrowLeft, Check, Heart, ShieldCheck, Sparkles } from "lucide-react";

const frequency = ["Never", "Rarely", "Sometimes", "Often", "Almost always"];
const questions = [
  { id: "mood", section: "Mood and emotions", text: "How often have you felt sad, low, or emotionally drained?" },
  { id: "interest", section: "Mood and emotions", text: "How often have things you usually enjoy felt less interesting?" },
  { id: "overwhelm", section: "Mood and emotions", text: "How often have your thoughts or emotions felt overwhelming?" },
  { id: "sleep", section: "Sleep and energy", text: "How often has your sleep felt unsatisfying or disrupted?" },
  { id: "tired", section: "Sleep and energy", text: "How often have you felt tired even after resting?" },
  { id: "energy", section: "Sleep and energy", text: "How often has it been difficult to find energy for everyday activities?" },
  { id: "worry", section: "Stress and thinking", text: "How often have worries made it difficult to relax?" },
  { id: "rumination", section: "Stress and thinking", text: "How often have you found yourself repeatedly thinking about upsetting situations?" },
  { id: "focus", section: "Stress and thinking", text: "How often has it been difficult to concentrate on study, work, or daily tasks?" },
  { id: "routine", section: "Daily life", text: "How often has it been difficult to keep your usual daily routine?" },
  { id: "responsibilities", section: "Daily life", text: "How often have everyday responsibilities felt hard to manage?" },
  { id: "withdrawal", section: "Daily life", text: "How often have you felt disconnected from activities or people that matter to you?" },
  { id: "lonely", section: "Relationships and support", text: "How often have you felt lonely, even when other people were around?" },
  { id: "talk", section: "Relationships and support", text: "How often has it felt difficult to tell someone you trust that you are struggling?" },
  { id: "help", section: "Relationships and support", text: "How often have you felt unsure where to find help when you need it?" }
];
const concernOptions = [
  "Breakup, rejection, or unrequited love",
  "Relationship conflict, trust, or communication",
  "Low marks, exams, or academic pressure",
  "Career uncertainty or pressure to succeed",
  "Unemployment, job search, or interview rejections",
  "Workplace stress or job insecurity",
  "Family conflict or expectations",
  "Loneliness or friendship difficulties",
  "Bullying, exclusion, or discrimination",
  "Low confidence or comparing myself with others",
  "Money worries or financial dependence",
  "Grief or losing someone important",
  "Physical health or caregiving responsibilities",
  "A major life change or uncertainty about the future",
  "Feeling unsafe or controlled in a relationship or at home",
  "Something else that is difficult to explain",
  "Prefer not to say"
];
const supportOptions = ["Someone to listen without judging", "Practical ideas for managing stress", "Support with sleep and daily routines", "Help understanding my emotions", "Information about professional support", "I'm not sure yet"];

function buildGuidance(answers) {
  const often = (id) => Number(answers[id]) >= 2;
  const areas = [];
  const tips = [];
  const concerns = answers.concerns || [];
  const add = (area, tip) => { areas.push(area); tips.push(tip); };

  if (["mood", "interest", "overwhelm"].some(often)) {
    add("mood and emotions", "Try naming what you are feeling without judging yourself. If it feels manageable, write down one thing that has been weighing on you and one kind thing you need today.");
  }
  if (["sleep", "tired", "energy"].some(often)) {
    add("sleep and energy", "Where possible, keep a gentle, consistent wake-up time and create a low-pressure wind-down routine. Ongoing sleep or energy changes can have many causes, so consider discussing them with a healthcare professional.");
  }
  if (["worry", "rumination", "focus"].some(often)) {
    add("stress and concentration", "Choose one small next step instead of solving everything at once. A short break, a grounding exercise, or writing down the next manageable task may help you reset.");
  }
  if (["routine", "responsibilities", "withdrawal"].some(often)) {
    add("daily routines", "Lower the bar for today: pick one necessary task, break it into a smaller step, and allow rest between activities. If daily life keeps feeling difficult, professional support is worth considering.");
  }
  if (["lonely", "talk", "help"].some(often) || concerns.some((c) => /Loneliness|friendship|Bullying|exclusion|discrimination/i.test(c))) {
    add("connection and support", "Consider reaching out to one person who feels relatively safe, or spending time in a welcoming place. You do not have to explain everything at once, and support can also come from a qualified professional.");
  }

  const concernGuidance = [
    { match: /Breakup|rejection|unrequited love/i, area: "heartbreak and relationships", tip: "If this is about heartbreak or rejection, it is understandable if your feelings come in waves. Give yourself some space from reminders if that helps, keep one gentle daily routine, and talk with someone who will listen without pressuring you to move on. There is no fixed timetable for healing." },
    { match: /Relationship conflict|trust|communication/i, area: "relationship stress", tip: "If relationship conflict is weighing on you, consider what you need to feel heard and respected. A calm conversation may help when it is safe, but you do not have to resolve everything immediately. If you feel threatened or controlled, prioritise safety and reach out to a trusted person or local support service." },
    { match: /Low marks|exams|academic pressure/i, area: "academic pressure", tip: "For marks or exam pressure, try separating your worth from a result. Pick one practical next step—such as reviewing one topic, speaking with a teacher, or making a realistic study plan—and include breaks. If pressure feels unmanageable, tell someone you trust." },
    { match: /Career uncertainty|pressure to succeed/i, area: "career uncertainty", tip: "When the future feels uncertain, shrink the decision to one next step: identify one skill to practise, one person to ask for advice, or one option to research. You do not need to solve your whole career today." },
    { match: /Unemployment|job search|interview rejections/i, area: "job search and rejection", tip: "Repeated job rejections can feel personal, but they do not define your value or your future. If useful, set a sustainable job-search routine, ask for feedback where available, and balance applications with rest and support from someone you trust." },
    { match: /Workplace stress|job insecurity/i, area: "workplace stress", tip: "For workplace pressure, identify what is within your control today and what needs support or a conversation. Small boundaries, documenting practical concerns, and talking with a trusted mentor may help where safe and possible." },
    { match: /Family conflict|expectations/i, area: "family pressure", tip: "When family expectations feel heavy, it may help to name what you need privately first, then talk with a trusted person who can listen without taking sides. You do not have to make a major decision immediately. If home does not feel safe, seek support from someone outside the situation." },
    { match: /Money worries|financial dependence/i, area: "financial stress", tip: "Money worries can make everything feel urgent. If it is safe and practical, write down the most immediate need and one person or service that could help you explore options. You deserve emotional support alongside practical problem-solving." },
    { match: /Low confidence|comparing myself/i, area: "confidence and self-comparison", tip: "When comparison gets loud, try reducing exposure to accounts or situations that leave you feeling worse and notice one effort you made rather than only the outcome. You do not need to outperform someone else to deserve care and respect." },
    { match: /Grief|losing someone/i, area: "grief and loss", tip: "Grief can look different from day to day; there is no single correct way or timetable. Consider making room for your feelings, keeping one basic routine, and reaching out to someone who can sit with you without trying to fix it." },
    { match: /Physical health|caregiving/i, area: "health and caregiving demands", tip: "Health concerns or caring for someone can be exhausting. If possible, ask for one specific form of help, make room for short breaks, and discuss persistent changes in mood, sleep, or energy with a healthcare professional." },
    { match: /Bullying|exclusion|discrimination/i, area: "exclusion or mistreatment", tip: "Being excluded, bullied, or treated unfairly is not something you deserve. Consider documenting what is happening and speaking with a trusted person, teacher, manager, or support service who can help you think through safe options." },
    { match: /A major life change|uncertainty about the future/i, area: "life changes and uncertainty", tip: "During a major change, focus on what can support you this week rather than having every answer. Keeping a small routine and talking through options with someone you trust may make the next step feel more manageable." },
    { match: /Feeling unsafe|controlled/i, area: "safety and control", tip: "You deserve to feel safe and respected. If someone is controlling, threatening, or hurting you, consider contacting a trusted person or a local professional support service from a device that feels safe. If you are in immediate danger in India, call 112." }
  ];
  concernGuidance.forEach(({ match, area, tip }) => {
    if (concerns.some((concern) => match.test(concern))) add(area, tip);
  });

  if (!tips.length) {
    add("maintaining your wellbeing", "Keep noticing what helps you feel steady, make room for rest and connection, and reach out early if your feelings start to become difficult to manage.");
  }
  const preferred = answers.preferred;
  if (preferred === "Someone to listen without judging") {
    tips.unshift("Your selected priority is to be heard. You might tell a trusted person, “I don't need you to fix this right now; could you listen for a few minutes?”");
  } else if (preferred === "Information about professional support") {
    tips.unshift("You asked for information about professional support. A qualified mental-health professional or healthcare provider can help you understand what you are experiencing and discuss suitable options.");
  } else if (preferred === "Support with sleep and daily routines") {
    tips.unshift("You chose routines as a helpful starting point. Pick one small, realistic change rather than trying to change your whole day at once.");
  } else if (preferred === "Practical ideas for managing stress") {
    tips.unshift("You prefer practical steps. Choose one action small enough to try today, and treat it as an experiment—not a test you can fail.");
  }
  return { areas: [...new Set(areas)], tips: [...new Set(tips)].slice(0, 5), concerns };
}

function buildPersonalNote(answers) {
  const concerns = answers.concerns || [];
  const selected = concerns.filter((c) => c !== "Prefer not to say");
  const names = selected.slice(0, 2).join(" and ");
  let opening = names
    ? `You shared that ${names.toLowerCase()} may be weighing on you.`
    : "You took a moment to check in with yourself, and that matters.";
  if (selected.length > 2) opening += ` You also selected ${selected.length - 2} other area${selected.length - 2 === 1 ? "" : "s"}, so there may be several things competing for your energy.`;
  const often = (id) => Number(answers[id]) >= 3;
  if (often("mood") || often("overwhelm")) opening += " You also indicated that your emotions have felt difficult at times.";
  if (often("sleep") || often("tired") || often("energy")) opening += " You mentioned some difficulty with sleep or energy, which can make other pressures harder to carry.";
  if (often("focus") || often("responsibilities")) opening += " You also described some strain with concentration or everyday responsibilities.";
  return `${opening} You do not have to solve everything at once, and these answers do not define you. Start with one small step that feels realistic, and consider reaching out to someone safe and supportive. If these difficulties persist, worsen, or affect daily life, a qualified mental-health professional can help you explore what is going on. You deserve support without judgement.`;
}

export default function WellnessCheckIn() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ concerns: [] });
  const [showResults, setShowResults] = useState(false);
  const [safetyPath, setSafetyPath] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [error, setError] = useState("");
  const total = 18;
  const guidance = useMemo(() => buildGuidance(answers), [answers]);
  const personalNote = useMemo(() => buildPersonalNote(answers), [answers]);
  const currentQuestion = step < 15 ? questions[step] : null;
  const canContinue = step < 15 ? answers[currentQuestion?.id] !== undefined : step === 15 ? (answers.concerns || []).length > 0 : step === 16 ? Boolean(answers.preferred) : Boolean(answers.safety);

  function reset() {
    setStarted(false); setStep(0); setAnswers({ concerns: [] }); setShowResults(false); setSafetyPath(false); setShowSafety(false); setError("");
  }
  function next() {
    setError("");
    if (!canContinue) { setError("Choose an answer to continue, or select “Prefer not to say” where available."); return; }
    if (step === 17) {
      if (answers.safety === "yes" || answers.safety === "unsure") setSafetyPath(true);
      else setShowResults(true);
      return;
    }
    setStep((value) => value + 1);
  }
  function back() {
    setError("");
    if (step === 0) { setStarted(false); return; }
    setStep((value) => value - 1);
  }
  function chooseConcern(option) {
    setAnswers((previous) => {
      const existing = previous.concerns || [];
      const nextConcerns = option === "Prefer not to say" ? (existing.includes(option) ? [] : [option]) : existing.filter((item) => item !== "Prefer not to say").includes(option) ? existing.filter((item) => item !== option && item !== "Prefer not to say") : [...existing.filter((item) => item !== "Prefer not to say"), option];
      return { ...previous, concerns: nextConcerns };
    });
  }
  const progress = showResults || safetyPath ? 100 : Math.round(((step + 1) / total) * 100);

  return <section className="checkin-section" id="checkin">
    <div className="checkin-wrap">
      <div className="checkin-heading"><span className="eyebrow"><Heart size={14}/> A PRIVATE MOMENT FOR YOU</span><h2>MindWell <span>Check-In</span></h2><p>A gentle reflection on how things have been feeling lately. Your answers stay in this page and are not sent to our server or saved by MindWell.</p></div>
      {!started && !showResults && !safetyPath && <div className="checkin-welcome"><div className="checkin-welcome-icon"><Sparkles size={26}/></div><span className="eyebrow">NO RIGHT OR WRONG ANSWERS</span><h3>Let's check in with yourself.</h3><p>Sometimes life feels heavier than we can explain. Answer 18 short questions at your own pace, choose the life situations that fit, and we’ll offer supportive ideas based on your selections.</p><ul><li><Check size={16}/> About 3–5 minutes</li><li><Check size={16}/> No account or sign-up</li><li><Check size={16}/> No diagnosis or score label</li></ul><p className="checkin-disclaimer">This is a self-reflection and educational tool, not a validated screening test, diagnosis, or treatment plan. You can leave any time.</p><button className="button button-primary" onClick={() => setStarted(true)}>Start my check-in <ArrowRight size={16}/></button></div>}
      {started && !showResults && !safetyPath && <div className="checkin-card">
        <div className="checkin-progress-row"><span>Question {step + 1} of {total}</span><span>{progress}%</span></div><div className="checkin-progress"><span style={{ width: `${progress}%` }}/></div>
        {currentQuestion ? <><span className="checkin-section-label">{currentQuestion.section}</span><h3 className="checkin-question">{currentQuestion.text}</h3><p className="checkin-hint">Thinking about the past two weeks may help. Choose what feels closest to your experience.</p><div className="checkin-options">{frequency.map((option, index) => <button type="button" key={option} className={`checkin-option ${answers[currentQuestion.id] === index ? "selected" : ""}`} onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: index }))}><span>{option}</span>{answers[currentQuestion.id] === index && <Check size={17}/>}</button>)}</div></>
          : step === 15 ? <><span className="checkin-section-label">What is going on for you?</span><h3 className="checkin-question">What has been weighing on you most recently?</h3><p className="checkin-hint">Choose any that feel relevant. You can also prefer not to say.</p><div className="checkin-options checkin-multi">{concernOptions.map((option) => <button type="button" key={option} className={`checkin-option ${answers.concerns?.includes(option) ? "selected" : ""}`} onClick={() => chooseConcern(option)}>{option}{answers.concerns?.includes(option) && <Check size={17}/>}</button>)}</div></>
          : step === 16 ? <><span className="checkin-section-label">What would feel useful?</span><h3 className="checkin-question">What kind of support would feel most helpful right now?</h3><div className="checkin-options">{supportOptions.map((option) => <button type="button" key={option} className={`checkin-option ${answers.preferred === option ? "selected" : ""}`} onClick={() => setAnswers((prev) => ({ ...prev, preferred: option }))}>{option}{answers.preferred === option && <Check size={17}/>}</button>)}</div></>
          : <><span className="checkin-section-label safety-label">Your safety matters</span><h3 className="checkin-question">Right now, do you feel safe, or are you having thoughts of hurting yourself?</h3><p className="checkin-hint">This question helps us show appropriate support options. You can choose not to answer.</p><div className="checkin-options">{[{value:"no",label:"I feel safe and am not having thoughts of hurting myself"},{value:"yes",label:"I have had thoughts of hurting myself or may not be safe"},{value:"unsure",label:"I'm not sure I feel safe"},{value:"skip",label:"Prefer not to answer"}].map((option) => <button type="button" key={option.value} className={`checkin-option ${answers.safety === option.value ? "selected" : ""}`} onClick={() => setAnswers((prev) => ({ ...prev, safety: option.value }))}>{option.label}{answers.safety === option.value && <Check size={17}/>}</button>)}</div></>}
        {error && <p className="checkin-error" role="alert">{error}</p>}
        <div className="checkin-actions"><button type="button" className="button button-light" onClick={back}><ArrowLeft size={16}/> Back</button><button type="button" className="button button-primary" onClick={next}>{step === 17 ? "See my guidance" : "Continue"} <ArrowRight size={16}/></button></div>
        <p className="checkin-privacy"><ShieldCheck size={14}/> Answers are processed in this page only. They are not stored in your account or database.</p>
      </div>}
      {safetyPath && <div className="checkin-results safety-results" role="alert" aria-live="assertive"><div className="results-icon safety-icon"><Heart size={24}/></div><span className="eyebrow">PLEASE PAUSE HERE</span><h3>You deserve support right now.</h3><p>Your answer suggests it may be important to get support rather than continue to a general wellness note. You don't have to handle this alone.</p><div className="safety-steps"><p><strong>If you may act on thoughts of hurting yourself or are in immediate danger:</strong> call India's emergency number <a href="tel:112">112</a> or go to the nearest emergency department. If possible, move near a trusted person and tell them directly that you need support.</p><p><strong>For mental-health support in India:</strong> call Tele-MANAS at <a href="tel:14416">14416</a> or <a href="tel:18008914416">1800-891-4416</a>. If one option is unavailable, try the other or contact local emergency services.</p><p>If it feels hard to make a call, consider asking someone you trust to stay with you while you reach out. This website cannot monitor your safety or provide emergency response.</p></div><div className="checkin-actions"><button className="button button-light" onClick={reset}>Close check-in</button><button className="button button-primary" onClick={() => { setSafetyPath(false); setStarted(false); setShowSafety(true); }}>Continue to general resources</button></div><p className="checkin-disclaimer">These links are offered as support options, not a diagnosis. If you selected this by mistake, you can return to the survey or close it.</p></div>}
      {showSafety && !safetyPath && !showResults && <div className="checkin-card"><span className="checkin-section-label">Support options</span><h3 className="checkin-question">You can choose what happens next.</h3><p>If you are in immediate danger, call 112. Tele-MANAS is available at 14416 or 1800-891-4416. You can also return to the questionnaire or close it.</p><div className="checkin-actions"><button className="button button-light" onClick={() => { setShowSafety(false); setStarted(true); }}>Return to questions</button><button className="button button-primary" onClick={reset}>Close check-in</button></div></div>}
      {showResults && <div className="checkin-results" aria-live="polite"><div className="results-icon"><Heart size={24}/></div><span className="eyebrow">YOUR PERSONAL REFLECTION</span><h3>Thank you for checking in with yourself.</h3><p className="results-lead">Your answers aren't a diagnosis, and they don't define you. They can simply help you notice what may need care and attention.</p><div className="results-areas"><strong>Areas you may want to give attention</strong><div>{guidance.areas.map((area) => <span key={area}>{area}</span>)}</div></div><div className="results-note"><h4>A note for you</h4><p>{personalNote}</p><p>{answers.preferred === "I'm not sure yet" ? "It is okay not to know what would help yet. You can explore options slowly and change your mind." : `You said that ${answers.preferred?.toLowerCase() || "some support"} may be helpful. Let that preference guide your next small step.`}</p></div><div className="results-tips"><h4>Small next steps to consider</h4>{guidance.tips.map((tip, index) => <div className="results-tip" key={tip}><span>{String(index + 1).padStart(2, "0")}</span><p>{tip}</p></div>)}</div><div className="results-professional"><ShieldCheck size={18}/><p>If these feelings persist, get worse, or interfere with everyday life, consider speaking with a qualified mental-health professional or healthcare provider. You don't need to wait until things feel unbearable.</p></div><div className="results-support"><h4>Support in India</h4><p><strong>Tele-MANAS:</strong> <a href="tel:14416">14416</a> or <a href="tel:18008914416">1800-891-4416</a> for mental-health support. For immediate danger, call <a href="tel:112">112</a>.</p><p><a href="https://dghs.mohfw.gov.in/national-mental-health-programme.php" target="_blank" rel="noreferrer">Official MoHFW information <ArrowRight size={14}/></a></p></div><div className="checkin-actions"><button className="button button-light" onClick={reset}>Start again</button><a className="button button-primary" href="#resources">Explore support resources <ArrowRight size={16}/></a></div><p className="checkin-disclaimer">MindWell is an independent educational project. This check-in is not clinically validated and cannot diagnose, treat, or cure a condition. Your responses are not saved.</p></div>}
    </div>
  </section>;
}
