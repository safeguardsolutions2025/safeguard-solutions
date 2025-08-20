
"use client";
import { useEffect, useRef, useState } from "react";
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
  "Manifestación de Impacto Ambiental",
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

const ADDRESS = "Av. Jiménez 1807, Zona Centro, C.P. 91700. Veracruz, Ver.";
const MAPSRC =
  "https://www.google.com/maps?q=Av.+Jim%C3%A9nez+1807,+Zona+Centro,+91700+Veracruz,+Ver.&output=embed";

const CANDIDATE_ORDER = Array.from({ length: 30 }, (_, i) => i + 1);
const IMG_EXT = ["jpg", "jpeg", "png", "webp"];
const VID_EXT = ["mp4", "webm", "ogg", "mov"];

async function loadMediaList() {
  try {
    const r = await fetch("/imagenes/media.json", { cache: "no-store" });
    if (r.ok) {
      const d = await r.json();
      if (Array.isArray(d) && d.length) return d;
    }
  } catch {}
  const candidates = [];
  for (const n of CANDIDATE_ORDER) {
    for (const ext of [...IMG_EXT, ...VID_EXT]) {
      candidates.push({
        src: `/imagenes/slide${n}.${ext}`,
        type: VID_EXT.includes(ext) ? "video" : "image",
      });
    }
  }
  const exists = await Promise.all(candidates.map(probeAsset));
  return candidates.filter((_, i) => exists[i]);
}

function probeAsset(item) {
  return new Promise((res) => {
    if (item.type === "image") {
      const im = new Image();
      im.onload = () => res(true);
      im.onerror = () => res(false);
      im.src = item.src;
    } else {
      const v = document.createElement("video");
      v.onloadedmetadata = () => res(true);
      v.onerror = () => res(false);
      v.src = item.src;
      v.muted = true;
      v.playsInline = true;
    }
  });
}

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(720px,92vw)",
          maxHeight: "90vh",
          overflow: "auto",
          padding: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 800,
              color: "var(--accent)",
            }}
          >
            Solicitar cotización
          </h3>
          <button className="chip" onClick={onClose} aria-label="Cerrar">
            Cerrar
          </button>
        </div>
        <div style={{ marginTop: 12 }}>{children}</div>
      </div>
    </div>
  );
}

export default function Page() {
  const [media, setMedia] = useState([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const tRef = useRef(null);
  const vRefs = useRef([]);

  const [empresa, setEmpresa] = useState("");
  const [contacto, setContacto] = useState("");
  const [servicio, setServicio] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const waNumber = "522292120786";
  const waNumber2 = "522291610542";

  const waMessage = (() => {
    const parts = [];
    parts.push(contacto ? `Hola, soy ${contacto}` : "Hola");
    if (empresa) parts.push(`de ${empresa}`);
    parts.push(
      servicio
        ? `y me interesa ${servicio}`
        : "y me gustaría información sobre sus servicios"
    );
    if (mensaje) parts.push(`Detalles: ${mensaje}`);
    return parts.join(" ") + ".";
  })();

  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    waMessage
  )}`;
  const waLink2 = `https://wa.me/${waNumber2}?text=${encodeURIComponent(
    waMessage
  )}`;

  useEffect(() => {
    loadMediaList().then(setMedia);
  }, []);

  const scheduleNext = () => {
    if (tRef.current) clearTimeout(tRef.current);
    const m = media[current];
    let delay = 5000;
    if (m?.type === "video") {
      const vid = vRefs.current[current];
      if (vid && !isNaN(vid.duration) && vid.duration > 0) {
        delay = Math.max(1000, vid.duration * 1000);
      }
    }
    tRef.current = setTimeout(
      () => setCurrent((i) => (i + 1) % media.length),
      delay
    );
  };

  useEffect(() => {
    if (paused || !media.length) return;
    scheduleNext();
    return () => {
      if (tRef.current) clearTimeout(tRef.current);
    };
  }, [current, paused, media]);

  return (
    <div>
      <header className="sticky">
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src="/imagenes/logo.png"
              alt="SAFEGUARD SOLUTIONS"
              style={{
                height: 40,
                width: 40,
                objectFit: "contain",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
              }}
            />
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontWeight: 700, color: "var(--accent)" }}>
                SAFEGUARD SOLUTIONS
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Calidad, seguridad y auditoría. Soluciones ambientales para tu
                empresa.
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpenModal(true)}
            className="btn btn-brand"
          >
            Solicitar cotización
          </button>
        </div>
      </header>

      {/* Carrusel */}
      <section className="container" style={{ marginBottom: 16 }}>
        <div
          className="card"
          style={{ overflow: "hidden", height: 360, position: "relative" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          aria-roledescription="carousel"
          aria-label="Galería de servicios"
        >
          {media.map((m, idx) =>
            m.type === "video" ? (
              <video
                key={m.src}
                src={m.src}
                muted
                playsInline
                autoPlay={idx === current}
                ref={(el) => (vRefs.current[idx] = el)}
                onLoadedMetadata={() => idx === current && scheduleNext()}
                onEnded={() =>
                  setCurrent((i) => (i + 1) % media.length)
                }
                aria-hidden={idx !== current}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: idx === current ? 1 : 0,
                  transition: "opacity 600ms ease",
                }}
              />
            ) : (
              <img
                key={m.src}
                src={m.src}
                alt={`Slide ${idx + 1}`}
                aria-hidden={idx !== current}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: idx === current ? 1 : 0,
                  transition: "opacity 600ms ease",
                }}
              />
            )
          )}

          {/* Indicadores */}
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 8,
            }}
          >
            {media.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                aria-label={`Ir a elemento ${idx + 1}`}
                className="chip"
                style={{
                  width: 10,
                  height: 10,
                  padding: 0,
                  borderRadius: 9999,
                  background: idx === current ? "var(--brand)" : "#fff",
                  borderColor: "#e2e8f0",
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section
        id="contacto"
        className="container"
        style={{ padding: "24px 0 16px" }}
      >
        <h2
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "var(--accent)",
            margin: 0,
          }}
        >
          Contacto
        </h2>
        <div className="card" style={{ padding: 16, marginTop: 12, marginBottom: 12 }}>
          <div className="grid grid-cols-2">
            <div className="grid" style={{ gap: 10 }}>
              <input
                placeholder="Nombre de la empresa"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
              />
              <input
                placeholder="Nombre del contacto"
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
              />
              <select
                value={servicio}
                onChange={(e) => setServicio(e.target.value)}
              >
                <option value="">Selecciona un servicio…</option>
                {SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <textarea
                rows={5}
                placeholder="Escribe tu solicitud (sitio, normativas, fechas, etc.)"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
              />
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Este texto se enviará en WhatsApp o en el correo del formulario.
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: 8,
                }}
              >
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-brand"
                  aria-label="WhatsApp (línea 1)"
                  style={{ width: 44, height: 44, borderRadius: 9999 }}
                >
                  WA
                </a>
                <a href="#" className="chip" style={{ color: "var(--brand)", fontWeight: 700 }}>
                  +52 229 212 0786
                </a>
                <a
                  href={waLink2}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-brand"
                  aria-label="WhatsApp (línea 2)"
                  style={{ width: 44, height: 44, borderRadius: 9999 }}
                >
                  WA
                </a>
                <a href="#" className="chip" style={{ color: "var(--brand)", fontWeight: 700 }}>
                  +52 229 161 0542
                </a>
              </div>
            </div>

            <div className="grid" style={{ gap: 10 }}>
              <div className="card" style={{ padding: 12 }}>
                <div style={{ fontWeight: 700, color: "var(--accent)", marginBottom: 6 }}>
                  Domicilio
                </div>
                <div style={{ color: "#334155" }}>{ADDRESS}</div>
                <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <a className="chip" href="mailto:safeguard.solutions@outlook.es">
                    safeguard.solutions@outlook.es
                  </a>
                  <a className="chip" href="tel:+522292120786">
                    +52 229 212 0786
                  </a>
                  <a className="chip" href="tel:+522291610542">
                    +52 229 161 0542
                  </a>
                </div>
              </div>

              <div className="map-wrap">
                <iframe
                  src={MAPSRC}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  aria-label="Mapa de ubicación"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de cotización */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setSending(true);
            try {
              const ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || "";
              if (ENDPOINT) {
                const r = await fetch(ENDPOINT, {
                  method: "POST",
                  headers: { Accept: "application/json" },
                  body: new FormData(e.currentTarget),
                });
                if (!r.ok) throw new Error("Error");
                setSent(true);
              } else {
                const to = "safeguard.solutions@outlook.es";
                const asunto = `Cotización — ${empresa || "Empresa"}`;
                const cuerpo = [
                  contacto ? `Contacto: ${contacto}` : "",
                  empresa ? `Empresa: ${empresa}` : "",
                  servicio ? `Servicio: ${servicio}` : "",
                  tel ? `Teléfono: ${tel}` : "",
                  email ? `Correo: ${email}` : "",
                  "\n",
                  mensaje || "Hola, me gustaría información.",
                ]
                  .filter(Boolean)
                  .join("\n");
                window.location.href = `mailto:${to}?subject=${encodeURIComponent(
                  asunto
                )}&body=${encodeURIComponent(cuerpo)}`;
                setSent(true);
              }
            } catch (err) {
              alert("No se pudo enviar. Intenta de nuevo.");
            } finally {
              setSending(false);
            }
          }}
          style={{ display: "grid", gap: 12 }}
        >
          <div
            style={{
              display: "grid",
              gap: 10,
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            }}
          >
            <input
              name="empresa"
              placeholder="Nombre de la empresa"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              required
            />
            <input
              name="contacto"
              placeholder="Nombre del contacto"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              required
            />
            <select
              name="servicio"
              value={servicio}
              onChange={(e) => setServicio(e.target.value)}
              required
            >
              <option value="">Selecciona un servicio…</option>
              {SERVICES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              name="telefono"
              placeholder="Teléfono de contacto"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
            />
            <input
              name="email"
              type="email"
              placeholder="Correo de contacto"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <textarea
            name="mensaje"
            rows={5}
            placeholder="Cuéntanos tu necesidad (sitios, normativas, fechas, etc.)"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            required
          />

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn btn-brand" type="submit" disabled={sending}>
              {sending ? "Enviando..." : "Enviar cotización"}
            </button>
            {sent && (
              <span className="chip" style={{ color: "var(--brand)" }}>
                ¡Enviado! Te contactamos pronto.
              </span>
            )}
          </div>

          {/* Hidden fields por si usas Formspree */}
          <input
            type="hidden"
            name="_subject"
            value="Nueva solicitud de cotización — SAFEGUARD SOLUTIONS"
          />
          <input type="hidden" name="_replyto" value={email} />
        </form>
      </Modal>

      <footer className="footer">
        <div className="container footer-inner">
          <div style={{ fontSize: 12, color: "#64748b" }}>
            © {new Date().getFullYear()} SAFEGUARD SOLUTIONS
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a className="chip" href="#contacto">
              Contacto
            </a>
            <a className="chip" href="mailto:safeguard.solutions@outlook.es">
              Correo
            </a>
            <a className="chip" href="tel:+522292120786">
              Línea 1
            </a>
            <a className="chip" href="tel:+522291610542">
              Línea 2
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}