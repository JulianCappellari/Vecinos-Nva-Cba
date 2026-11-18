"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IoCheckmarkOutline, IoArrowForwardOutline } from "react-icons/io5";

const OPTIONS: { id: string; title: string; text: string; href: string; steps: { id: string; text: string; href: string | null }[] }[] = [
  { id: "gente", title: "Conocer gente", text: "El primer mate también cuenta.", href: "/comunidad/planes", steps: [{id:"plan", text:"Elegí un plan al que puedas ir solo.",href:"/comunidad/planes"},{id:"grupo",text:"Buscá un grupo por tus intereses o tu provincia.",href:"/comunidad/origenes"}] },
  { id: "estudiar", title: "Organizar el estudio", text: "Compartir la cursada cambia las cosas.", href: "/comunidad/estudio", steps: [{id:"materia",text:"Encontrá o proponé una mesa para tu próxima materia.",href:"/comunidad/estudio"},{id:"lugar",text:"Explorá lugares del barrio y consultá si permiten estudiar.",href:"/lugares"}] },
  { id: "casa", title: "Armar mi casa", text: "Lo necesario, de a poco.", href: "/comunidad/intercambio", steps: [{id:"lista",text:"Armá una lista de lo esencial antes de comprar.",href:null},{id:"intercambio",text:"Buscá muebles, libros y cosas para el departamento.",href:"/comunidad/intercambio"},{id:"oficio",text:"Guardá un profesional para los arreglos que necesites.",href:"/profesionales"}] },
  { id: "ahorrar", title: "Cuidar el presupuesto", text: "Un buen plan puede costar poco.", href: "/comunidad/presupuesto", steps: [{id:"gastos",text:"Separá gastos fijos, comida, transporte y salidas.",href:null},{id:"beneficio",text:"Revisá beneficios vigentes y sus condiciones.",href:"/comunidad/presupuesto"},{id:"gratis",text:"Buscá tu próximo plan gratuito.",href:"/comunidad/planes?maxCost=0"}] },
];
const KEY = "vnc:welcome:v1";
const ALL_STEPS: string[] = OPTIONS.flatMap(o => o.steps.map(s => s.id));
export function WelcomeGuide() {
  const [selected, setSelected] = useState<string[]>(["gente"]), [checked, setChecked] = useState<string[]>([]), [ready, setReady] = useState(false), [storage, setStorage] = useState(true);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (saved?.version === 1 && Array.isArray(saved.selected) && Array.isArray(saved.checked)) {
        setSelected(saved.selected.filter((s: unknown) => typeof s === "string" && OPTIONS.some(o => o.id === s)));
        setChecked(saved.checked.filter((s: unknown) => typeof s === "string" && ALL_STEPS.includes(s)));
      }
    } catch { setStorage(false); }
    setReady(true);
  }, []);
  function save(next: string[], done: string[]) {
    setSelected(next); setChecked(done);
    try { localStorage.setItem(KEY, JSON.stringify({ version: 1, selected: next, checked: done })); } catch { setStorage(false); }
  }
  const steps = OPTIONS.filter(o => selected.includes(o.id)).flatMap(o => o.steps);
  const completed = steps.filter(s => checked.includes(s.id)).length;
  return <div className="community-welcome">
    <div className="community-intro"><h2>Acabo de llegar.<br /><span>¿Por dónde empiezo?</span></h2><p>No hace falta resolver todo hoy. Elegí lo que necesitás y armá tu primera lista para hacerte un lugar en el barrio.</p></div>
    <fieldset className="welcome-options"><legend>¿Qué te vendría bien ahora?</legend>{OPTIONS.map(o => <label key={o.id} className={selected.includes(o.id) ? "selected" : ""}><input type="checkbox" checked={selected.includes(o.id)} disabled={!ready} onChange={() => save(selected.includes(o.id) ? selected.filter(s => s !== o.id) : [...selected, o.id], checked)} /><span><strong>{o.title}</strong><small>{o.text}</small></span><IoCheckmarkOutline aria-hidden="true" /></label>)}</fieldset>
    <section className="welcome-checklist" aria-labelledby="guide-heading"><div className="community-row"><h2 id="guide-heading">Tus primeros pasos</h2><span aria-live="polite">{completed} de {steps.length}</span></div><p className="community-muted">{storage ? "Tu avance se guarda en este dispositivo. No necesitás una cuenta." : "El navegador no permite guardar el avance. Podés usar la guía durante esta visita."}</p>
      {!ready ? <p role="status">Cargando tu guía…</p> : steps.length ? <ul>{steps.map(s => <li key={s.id}><label><input type="checkbox" checked={checked.includes(s.id)} onChange={() => save(selected, checked.includes(s.id) ? checked.filter(c => c !== s.id) : [...checked, s.id])} /><span>{s.text}</span></label>{s.href ? <Link href={s.href} aria-label={"Explorar: " + s.text}><IoArrowForwardOutline aria-hidden="true" /></Link> : null}</li>)}</ul> : <p>Elegí al menos una opción para preparar tu guía.</p>}
      <button className="c-text-button" type="button" onClick={() => save(["gente"], [])} disabled={!ready}>Empezar de nuevo</button>
    </section>
  </div>;
}
