
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/globals.css";

const SERVICES = [
  "NOM-005-ASEA-2016 (Operación/Mantenimiento, Diseño y Construcción)",
  "NOM-016-CRE-2016",
  "Controles Volumétricos (RMF Anexo 30 y 31)",
  "SASISOPA Comercial",
  "SASISOPA Industrial",
  "Auditorías Internas SASISOPA",
  "NOM-005-SCFI-2017",
  "DACG SASISOPA Comercial",
  "DACG SASISOPA Industrial",
  "DACG Auditorías Externas",
  "DACG Investigaciones de Causa Raíz",
  "Gestión Portales OPE CRE",
  "Gestión Portales OPE ASEA",
  "Registro de Regulados RENAGAS",
  "Cédula de Operación Anual (COA)",
  "Número de Registro Ambiental",
  "Calibración de Tanques y Sistemas de Medición",
  "ARSH — Análisis de Riesgos del Sector Hidrocarburos",
  "Protocolos de Respuesta a Emergencias",
  "Manifestación/Manifiesto de Impacto Ambiental",
  "Informes Preventivos",
  "Programa Interno de Protección Civil (personal acreditado)",
  "Análisis de Riesgos de Protección Civil (personal acreditado)",
  "Registro de Generador de Residuos Peligrosos",
  "Licencia de Funcionamiento",
  "Actualizaciones de Permiso",
  "Reportes Anuales (obtención y realización)",
  "Avisos de Control a Distancia",
  "Capacitaciones Industriales",
  "Capacitaciones en Seguridad, Ambientales y Normativas",
  "Sistema de Gestión de Medición (implementación)",
  "Capacitación/Asesoría inspecciones PROFECO",
];

const CANDIDATE_ORDER = Array.from({length: 30}, (_,i)=>i+1);
const IMG_EXT = ["jpg","jpeg","png","webp"];
const VID_EXT = ["mp4","webm","ogg","mov"];

// Try to load media.json; if not found, guess slide1..slide30.*
async function loadMediaList() {
  try {
    const res = await fetch("/imagenes/media.json", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) return data;
    }
  } catch {}
  // Fallback: try predictable names
  const candidates = [];
  for (const n of CANDIDATE_ORDER) {
    for (const e of [...IMG_EXT, ...VID_EXT]) {
      candidates.push({ src: `/imagenes/slide${n}.${e}`, type: VID_EXT.includes(e) ? "video" : "image" });
    }
  }
  // Probe existence by attempting to load quickly
  const exists = await Promise.all(candidates.map(c => probeAsset(c)));
  return candidates.filter((_,i)=>exists[i]);
}

function probeAsset(item) {
  return new Promise((resolve) => {
    if (item.type === "image") {
      const im = new Image();
      im.onload = () => resolve(true);
      im.onerror = () => resolve(false);
      im.src = item.src;
    } else {
      const v = document.createElement("video");
      v.onloadedmetadata = () => resolve(true);
      v.onerror = () => resolve(false);
      v.src = item.src;
      v.muted = true;
      v.playsInline = true;
    }
  });
}

export default function Page() {
  const [media, setMedia] = useState([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timeoutRef = useRef(null);
  const videoRefs = useRef([]);

  const [empresa, setEmpresa] = useState("");
  const [contacto, setContacto] = useState("");
  const [servicio, setServicio] = useState("");

  const waNumber = "522292120786";
  const waNumber2 = "522291610542";

  const waMessage = (() => {
    const parts = [];
    parts.push(contacto ? `Hola, soy ${contacto}` : "Hola");
    if (empresa) parts.push(`de ${empresa}`);
    parts.push(servicio ? `y me interesa ${servicio}` : "y me gustaría información sobre sus servicios");
    return parts.join(" ") + ".";
  })();

  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;
  const waLink2 = `https://wa.me/${waNumber2}?text=${encodeURIComponent(waMessage)}`;

  useEffect(() => {
    loadMediaList().then(list => setMedia(list));
  }, []);

  const scheduleNext = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const m = media[current];
    let delay = 5000; // default 5s for images
    if (m?.type === "video") {
      const vid = videoRefs.current[current];
      if (vid && !isNaN(vid.duration) && vid.duration > 0) delay = Math.max(1000, vid.duration * 1000);
    }
    timeoutRef.current = setTimeout(() => setCurrent((i) => (i + 1) % media.length), delay);
  };

  useEffect(() => {
    if (paused || !media.length) return;
    scheduleNext();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [current, paused, media]);

  return (
    <div>
      <header className="sticky">
        <div className="container" style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0" }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <img src="/SAFEGUARD.png" alt="SAFEGUARD SOLUTIONS" style={{ height:40, width:40, borderRadius:12, objectFit:"cover", border:"1px solid #e2e8f0" }} />
            <div style={{ lineHeight:1.1 }}>
              <div style={{ fontWeight:600,color:"var(--accent)" }}>SAFEGUARD SOLUTIONS</div>
              <div style={{ fontSize:12,color:"#64748b" }}>Calidad, seguridad y auditoría. Soluciones ambientales para tu empresa.</div>
            </div>
          </div>
          <a href="#contacto" className="btn btn-brand">Solicitar cotización</a>
        </div>
      </header>

      {/* Carousel */}
      <section className="container" style={{ marginBottom:16 }}>
        <div
          className="card"
          style={{ overflow:"hidden", height:360, position:"relative" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          aria-roledescription="carousel"
          aria-label="Galería de servicios"
        >
          {media.map((m, idx) => (
            m.type === "video" ? (
              <video
                key={m.src}
                src={m.src}
                muted
                playsInline
                autoPlay={idx === current}
                ref={el => videoRefs.current[idx] = el}
                onLoadedMetadata={() => (idx === current) && scheduleNext()}
                onEnded={() => setCurrent((i) => (i + 1) % media.length)}
                aria-hidden={idx === current ? "false" : "true"}
                style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity: idx === current ? 1 : 0, transition: "opacity 600ms ease" }}
              />
            ) : (
              <img
                key={m.src}
                src={m.src}
                alt={`Slide ${idx + 1}`}
                aria-hidden={idx === current ? "false" : "true"}
                style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity: idx === current ? 1 : 0, transition: "opacity 600ms ease" }}
              />
            )
          ))}
          <div style={{ position:"absolute", bottom:10, left:"50%", transform:"translateX(-50%)", display:"flex", gap:8 }}>
            {media.map((_, idx)=>(
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                aria-label={`Ir a elemento ${idx+1}`}
                className="chip"
                style={{ width:10, height:10, padding:0, borderRadius:9999, background: idx===current ? "var(--brand)" : "#fff", borderColor:"#e2e8f0" }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contacto" className="container" style={{ padding:"24px 0 40px" }}>
        <h2 style={{ fontSize:24,fontWeight:800,color:"var(--accent)",margin:0 }}>Contacto</h2>

        <div className="card" style={{ padding:16, marginTop:12, marginBottom:12 }}>
          <div style={{ display:"grid", gap:10, gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))" }}>
            <input placeholder="Nombre de la empresa" value={empresa} onChange={e=>setEmpresa(e.target.value)} />
            <input placeholder="Nombre del contacto" value={contacto} onChange={e=>setContacto(e.target.value)} />
            <select value={servicio} onChange={e=>setServicio(e.target.value)}>
              <option value="">Selecciona un servicio…</option>
              {SERVICES.map(s => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
          <div style={{ fontSize:12, color:"#64748b", marginTop:8 }}>Este texto se enviará en WhatsApp: “{waMessage}”</div>
        </div>

        <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-brand" aria-label="Chatear por WhatsApp (línea 1)" style={{ width:44, height:44, borderRadius:9999 }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="22" height="22" fill="#FFFFFF" aria-hidden="true">
              <path d="M19.11 17.36c-.27-.14-1.6-.79-1.85-.89-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.35-.8-.71-1.34-1.58-1.5-1.85-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.02-.22-.53-.44-.46-.61-.47l-.52-.01c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3 0 1.35.99 2.65 1.13 2.83.14.18 1.95 2.98 4.73 4.18.66.28 1.18.45 1.58.58.66.21 1.27.18 1.74.11.53-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z"/>
              <path d="M26.7 5.3C23.9 2.5 20.2 1 16.2 1 8.6 1 2.4 7.2 2.4 14.8c0 2.4.6 4.8 1.9 6.9L2 31l9.5-2.2c2 .9 4.2 1.4 6.5 1.4 7.6 0 13.8-6.2 13.8-13.8 0-3.7-1.5-7.4-4.1-10.1zM18 27.3c-2.1 0-4.1-.5-6-1.4l-.4-.2-5.6 1.3 1.2-5.5-.2-.4c-1.2-1.9-1.8-4-1.8-6.3 0-6.6 5.4-12 12-12 3.2 0 6.2 1.2 8.5 3.5 2.3 2.3 3.5 5.3 3.5 8.5 0 6.6-5.4 12-12 12z"/>
            </svg>
          </a>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="chip" style={{ color:"var(--brand)", fontWeight:700 }}>+52 229 212 0786</a>

          <a href={waLink2} target="_blank" rel="noopener noreferrer" className="btn btn-brand" aria-label="Chatear por WhatsApp (línea 2)" style={{ width:44, height:44, borderRadius:9999 }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="22" height="22" fill="#FFFFFF" aria-hidden="true">
              <path d="M19.11 17.36c-.27-.14-1.6-.79-1.85-.89-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.35-.8-.71-1.34-1.58-1.5-1.85-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.02-.22-.53-.44-.46-.61-.47l-.52-.01c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3 0 1.35.99 2.65 1.13 2.83.14.18 1.95 2.98 4.73 4.18.66.28 1.18.45 1.58.58.66.21 1.27.18 1.74.11.53-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z"/>
              <path d="M26.7 5.3C23.9 2.5 20.2 1 16.2 1 8.6 1 2.4 7.2 2.4 14.8c0 2.4.6 4.8 1.9 6.9L2 31l9.5-2.2c2 .9 4.2 1.4 6.5 1.4 7.6 0 13.8-6.2 13.8-13.8 0-3.7-1.5-7.4-4.1-10.1zM18 27.3c-2.1 0-4.1-.5-6-1.4l-.4-.2-5.6 1.3 1.2-5.5-.2-.4c-1.2-1.9-1.8-4-1.8-6.3 0-6.6 5.4-12 12-12 3.2 0 6.2 1.2 8.5 3.5 2.3 2.3 3.5 5.3 3.5 8.5 0 6.6-5.4 12-12 12z"/>
            </svg>
          </a>
          <a href={waLink2} target="_blank" rel="noopener noreferrer" className="chip" style={{ color:"var(--brand)", fontWeight:700 }}>+52 229 161 0542</a>
        </div>
      </section>
    </div>
  );
}
