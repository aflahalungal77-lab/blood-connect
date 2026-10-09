
"use client";
import InstallPrompt from "@/components/InstallPrompt";
import { useCallback, useEffect, useMemo, useState } from "react";

const groups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const areas = [
  "Meenarkuzhi",
  "Makkaraparamba",
  "Kuruva",
  "Angadipuram",
  "Perinthalmanna",
  "Malappuram",
  "Other nearby area",
];

type Donor = {
  id: string;
  name: string;
  bloodGroup: string;
  location: string;
  phone: string;
};

type RequestItem = {
  id: string;
  patientLabel: string;
  bloodGroup: string;
  hospital: string;
  location: string;
  units: number;
  urgency: string;
  phone: string;
  createdAt: string;
};

async function sendForm(
  url: string,
  body: Record<string, unknown>
): Promise<string> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }

  return data.message || "Submitted successfully.";
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="section-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2 style={{ marginTop: 13 }}>{title}</h2>
        <p className="muted" style={{ margin: 0 }}>
          {description}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const [lang, setLang] = useState<"en" | "ml">("en");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  const [donors, setDonors] = useState<Donor[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(true);

  const [donorMessage, setDonorMessage] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  const [donorBusy, setDonorBusy] = useState(false);
  const [requestBusy, setRequestBusy] = useState(false);

  const t = (en: string, ml: string) =>
    lang === "en" ? en : ml;

  const loadDonors = useCallback(async () => {
    setLoading(true);

    try {
      const query = new URLSearchParams();

      if (filterGroup) query.set("bloodGroup", filterGroup);
      if (filterLocation) query.set("location", filterLocation);

      const response = await fetch(
        `/api/donors?${query.toString()}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load donors.");
      }

      setDonors(data.donors || []);
    } catch {
      setDonors([]);
    } finally {
      setLoading(false);
    }
  }, [filterGroup, filterLocation]);

  const loadRequests = useCallback(async () => {
    setRequestLoading(true);

    try {
      const response = await fetch("/api/requests", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load requests.");
      }

      setRequests(data.requests || []);
    } catch {
      setRequests([]);
    } finally {
      setRequestLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDonors();
    void loadRequests();
  }, []); // Initial load only

  const visibleRequests = useMemo(() => requests, [requests]);

  async function donorSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    // Save the form element before awaiting the network request.
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    setDonorBusy(true);
    setDonorMessage("");

    try {
      const message = await sendForm("/api/donors", {
        name: form.get("name"),
        bloodGroup: form.get("bloodGroup"),
        location: form.get("location"),
        phone: form.get("phone"),
        consent: form.get("consent") === "on",
      });

      setDonorMessage(message);
      formElement.reset();
    } catch (error) {
      setDonorMessage(
        error instanceof Error
          ? error.message
          : "Could not register. Please try again."
      );
    } finally {
      setDonorBusy(false);
    }
  }

  async function requestSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    // Keep a reference to the form before the async operation.
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    setRequestBusy(true);
    setRequestMessage("");

    try {
      const message = await sendForm("/api/requests", {
        patientLabel: form.get("patientLabel"),
        bloodGroup: form.get("bloodGroup"),
        hospital: form.get("hospital"),
        location: form.get("location"),
        phone: form.get("phone"),
        units: Number(form.get("units")),
        urgency: form.get("urgency"),
        consent: form.get("consent") === "on",
      });

      setRequestMessage(message);
      formElement.reset();
    } catch (error) {
      setRequestMessage(
        error instanceof Error
          ? error.message
          : "Could not submit request."
      );
    } finally {
      setRequestBusy(false);
    }
  }

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <main>
      {/* Desktop / top navigation */}
      <InstallPrompt appName="Blood Connect" />
      <header className="container nav">
        <a className="brand" href="#home" aria-label="Blood Connect home">
          <span className="brand-mark">♥</span>
          <span>
            Blood Connect
            <br />
            <small
              style={{
                fontWeight: 600,
                color: "#7b808a",
                letterSpacing: 1,
              }}
            >
              MEENARKUZHI
            </small>
          </span>
        </a>

        <nav className="navlinks" aria-label="Main navigation">
          <a href="#donors">{t("Find donors", "ഡോണർമാർ")}</a>
          <a href="#requests">{t("Blood requests", "അഭ്യർത്ഥനകൾ")}</a>
          <a href="#register">{t("Become a donor", "ഡോണറാകാം")}</a>

          <button
            type="button"
            className="language"
            onClick={() => setLang(lang === "en" ? "ml" : "en")}
          >
            {lang === "en" ? "മലയാളം" : "English"}
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section id="home" className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">
              ♥ {t("A community that cares", "കരുതലുള്ള ഒരു കൂട്ടായ്മ")}
            </span>

            <h1>
              {t("Every drop can", "ഓരോ തുള്ളിക്കും")}
              <br />
              <span>{t("save a life.", "ജീവൻ രക്ഷിക്കാം.")}</span>
            </h1>

            <p className="lead">
              {t(
                "Find blood donors and share urgent blood requests around Meenarkuzhi and nearby areas. A small connection can make a big difference.",
                "മീനാർകുഴിയിലും സമീപ പ്രദേശങ്ങളിലും രക്തദാതാക്കളെ കണ്ടെത്താനും രക്തത്തിനായുള്ള അഭ്യർത്ഥനകൾ പങ്കിടാനും സഹായിക്കുന്ന ഒരു കൂട്ടായ്മ."
              )}
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="btn"
                onClick={() => scrollToSection("donors")}
              >
                {t("Find a donor →", "ഡോണറെ കണ്ടെത്താം →")}
              </button>

              <button
                type="button"
                className="btn secondary"
                onClick={() => scrollToSection("request")}
              >
                {t("Request blood", "രക്തം അഭ്യർത്ഥിക്കുക")}
              </button>
            </div>

            <div className="noticebar">
              {t(
                "For medical emergencies, contact a hospital or licensed blood bank directly. Website listings do not guarantee donor availability.",
                "അടിയന്തര സാഹചര്യങ്ങളിൽ ആശുപത്രിയെയോ അംഗീകൃത ബ്ലഡ് ബാങ്കിനെയോ നേരിട്ട് ബന്ധപ്പെടുക. വെബ്സൈറ്റിലെ പട്ടിക ഡോണർ ലഭ്യത ഉറപ്പാക്കുന്നില്ല."
              )}
            </div>
          </div>

          <div className="hero-card">
            <span className="eyebrow">
              ● {t("8 blood groups", "8 രക്തഗ്രൂപ്പുകൾ")}
            </span>

            <h3 style={{ marginTop: 16 }}>
              {t("Find the match you need", "ആവശ്യമായ രക്തഗ്രൂപ്പ് കണ്ടെത്താം")}
            </h3>

            <p className="muted">
              {t(
                "Choose a blood group to start your search.",
                "രക്തഗ്രൂപ്പ് തിരഞ്ഞെടുത്ത് തിരയാം."
              )}
            </p>

            <div className="blood-grid">
              {groups.map((group) => (
                <button
                  type="button"
                  key={group}
                  className={`blood-chip ${
                    filterGroup === group ? "selected" : ""
                  }`}
                  aria-pressed={filterGroup === group}
                  onClick={() => {
                    setFilterGroup(group);
                    scrollToSection("donors");
                  }}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Donor directory */}
      <section id="donors" className="section">
        <div className="container">
          <SectionTitle
            eyebrow={t("DONOR DIRECTORY", "ഡോണർ പട്ടിക")}
            title={t("Find blood donors", "രക്തദാതാക്കളെ കണ്ടെത്താം")}
            description={t(
              "Search verified donor listings by blood group and area.",
              "രക്തഗ്രൂപ്പും സ്ഥലവും ഉപയോഗിച്ച് പരിശോധിച്ച ഡോണർമാരെ തിരയാം."
            )}
          />

          <div className="panel">
            <div className="filters">
              <div className="field">
                <label htmlFor="filter-group">
                  {t("Blood group", "രക്തഗ്രൂപ്പ്")}
                </label>

                <select
                  id="filter-group"
                  value={filterGroup}
                  onChange={(event) => setFilterGroup(event.target.value)}
                >
                  <option value="">{t("All groups", "എല്ലാ ഗ്രൂപ്പുകളും")}</option>
                  {groups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="filter-area">{t("Area", "സ്ഥലം")}</label>

                <select
                  id="filter-area"
                  value={filterLocation}
                  onChange={(event) => setFilterLocation(event.target.value)}
                >
                  <option value="">
                    {t("All nearby areas", "എല്ലാ സമീപ പ്രദേശങ്ങളും")}
                  </option>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-action">
                <button
                  type="button"
                  className="btn"
                  disabled={loading}
                  onClick={() => void loadDonors()}
                >
                  {loading
                    ? t("Searching…", "തിരയുന്നു…")
                    : t("Search donors", "ഡോണർമാരെ തിരയുക")}
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="empty" role="status">
              {t("Searching donors…", "ഡോണർമാരെ തിരയുന്നു…")}
            </div>
          ) : donors.length === 0 ? (
            <div className="empty">
              {t(
                "No verified donors found for this filter yet. Try another area or check back later.",
                "ഈ തിരച്ചിലിൽ പരിശോധിച്ച ഡോണർമാരെ കണ്ടെത്താനായില്ല. മറ്റൊരു സ്ഥലം തിരഞ്ഞെടുക്കുക."
              )}
            </div>
          ) : (
            <div className="cards">
              {donors.map((donor) => (
                <article className="person-card" key={donor.id}>
                  <div className="person-top">
                    <div className="blood-badge">{donor.bloodGroup}</div>

                    <div className="person-heading">
                      <h3>{donor.name}</h3>
                      <span className="tag">
                        ✓ {t("Verified listing", "പരിശോധിച്ചത്")}
                      </span>
                    </div>
                  </div>

                  <p className="muted">⌖ {donor.location}</p>

                  <div className="card-foot">
                    <span className="muted contact-label">
                      {t("Contact donor", "ഡോണറെ ബന്ധപ്പെടുക")}
                    </span>

                    <a className="btn small" href={`tel:${donor.phone}`}>
                      {t("Call", "വിളിക്കുക")}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Public blood requests */}
      <section id="requests" className="section soft">
        <div className="container">
          <SectionTitle
            eyebrow={t("COMMUNITY REQUESTS", "രക്ത അഭ്യർത്ഥനകൾ")}
            title={t("Blood requests", "രക്തത്തിനായുള്ള അഭ്യർത്ഥനകൾ")}
            description={t(
              "Requests appear publicly only after admin review.",
              "അഡ്മിൻ പരിശോധിച്ചശേഷം മാത്രമേ അഭ്യർത്ഥനകൾ പ്രസിദ്ധീകരിക്കൂ."
            )}
          />

          {requestLoading ? (
            <div className="empty" role="status">
              {t("Loading requests…", "അഭ്യർത്ഥനകൾ ലോഡ് ചെയ്യുന്നു…")}
            </div>
          ) : visibleRequests.length === 0 ? (
            <div className="empty">
              {t(
                "No approved open requests right now.",
                "ഇപ്പോൾ അംഗീകരിച്ച തുറന്ന അഭ്യർത്ഥനകളില്ല."
              )}
            </div>
          ) : (
            <div className="cards">
              {visibleRequests.map((item) => (
                <article className="person-card" key={item.id}>
                  <div className="person-top">
                    <div className="blood-badge">{item.bloodGroup}</div>

                    <div className="person-heading">
                      <h3>{item.patientLabel}</h3>
                      <span
                        className={`tag ${
                          item.urgency === "critical" ? "critical" : ""
                        }`}
                      >
                        {item.urgency === "urgent"
                          ? t("High", "ഉയർന്ന അടിയന്തരത")
                          : item.urgency === "critical"
                            ? t("Critical", "ഗുരുതരം")
                            : t("Normal", "സാധാരണ")}
                      </span>
                    </div>
                  </div>

                  <p className="muted">⌖ {item.location}</p>
                  <p className="hospital-name">{item.hospital}</p>

                  <p className="muted units">
                    {item.units} {t("unit(s) requested", "യൂണിറ്റ് ആവശ്യമാണ്")}
                  </p>

                  <div className="card-foot">
                    <span className="muted contact-label">
                      {t("Contact requester", "ബന്ധപ്പെടുക")}
                    </span>
                    <a className="btn small" href={`tel:${item.phone}`}>
                      {t("Call", "വിളിക്കുക")}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Donor registration */}
      <section id="register" className="section">
        <div className="container form-layout">
          <div className="form-intro">
            <span className="eyebrow">
              ♥ {t("BECOME A DONOR", "ഡോണറാകാം")}
            </span>

            <h2>
              {t(
                "Your kindness could save a life.",
                "നിങ്ങളുടെ കരുതൽ ഒരു ജീവൻ രക്ഷിച്ചേക്കാം."
              )}
            </h2>

            <p className="muted">
              {t(
                "Register your details. An admin will review the information before your listing becomes public.",
                "നിങ്ങളുടെ വിവരങ്ങൾ രജിസ്റ്റർ ചെയ്യുക. പൊതുവായി കാണിക്കുന്നതിന് മുമ്പ് അഡ്മിൻ പരിശോധിക്കും."
              )}
            </p>

            <p className="muted privacy-note">
              {t(
                "Only register if you consent to being contacted by people looking for blood. Never share OTPs or banking details.",
                "രക്തം അന്വേഷിക്കുന്നവർ നിങ്ങളെ ബന്ധപ്പെടാൻ സമ്മതമുണ്ടെങ്കിൽ മാത്രം രജിസ്റ്റർ ചെയ്യുക."
              )}
            </p>
          </div>

          <form className="panel form-grid" onSubmit={donorSubmit}>
            <div className="field">
              <label htmlFor="donor-name">
                {t("Full name *", "പൂർണ്ണ പേര് *")}
              </label>
              <input
                id="donor-name"
                name="name"
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
                placeholder="Your name"
              />
            </div>

            <div className="field">
              <label htmlFor="donor-group">
                {t("Blood group *", "രക്തഗ്രൂപ്പ് *")}
              </label>
              <select
                id="donor-group"
                name="bloodGroup"
                required
                defaultValue=""
              >
                <option value="" disabled>
                  {t("Choose group", "തിരഞ്ഞെടുക്കുക")}
                </option>
                {groups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="donor-area">{t("Area *", "സ്ഥലം *")}</label>
              <select
                id="donor-area"
                name="location"
                required
                defaultValue=""
              >
                <option value="" disabled>
                  {t("Choose area", "സ്ഥലം തിരഞ്ഞെടുക്കുക")}
                </option>
                {areas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="donor-phone">
                {t("Mobile number *", "മൊബൈൽ നമ്പർ *")}
              </label>
              <input
                id="donor-phone"
                name="phone"
                required
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                minLength={10}
                placeholder="10-digit mobile number"
              />
            </div>

            <label className="checkline full">
              <input type="checkbox" name="consent" required />
              <span>
                {t(
                  "I agree that my name, blood group, area and phone number may be shown to people seeking blood after admin verification. I can ask the admin to remove my listing.",
                  "അഡ്മിൻ പരിശോധിച്ചതിന് ശേഷം രക്തം അന്വേഷിക്കുന്നവർക്ക് എന്റെ പേര്, രക്തഗ്രൂപ്പ്, സ്ഥലം, ഫോൺ നമ്പർ എന്നിവ കാണിക്കാൻ ഞാൻ സമ്മതിക്കുന്നു."
                )}
              </span>
            </label>

            <button className="btn full" disabled={donorBusy}>
              {donorBusy
                ? t("Submitting…", "സമർപ്പിക്കുന്നു…")
                : t("Register as donor", "ഡോണറായി രജിസ്റ്റർ ചെയ്യുക")}
            </button>

            {donorMessage && (
              <div
                className={`notice full ${
                  /please|could not|already|error/i.test(donorMessage)
                    ? "error"
                    : ""
                }`}
                role="status"
              >
                {donorMessage}
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Blood request form */}
      <section id="request" className="section soft">
        <div className="container form-layout">
          <div className="form-intro">
            <span className="eyebrow">
              ⚠ {t("URGENT NEED", "അടിയന്തര ആവശ്യം")}
            </span>

            <h2>{t("Request blood support", "രക്തസഹായം അഭ്യർത്ഥിക്കാം")}</h2>

            <p className="muted">
              {t(
                "Share the hospital and contact details. Requests are reviewed before publication to reduce misuse.",
                "ആശുപത്രി വിവരങ്ങളും ബന്ധപ്പെടാനുള്ള നമ്പറും നൽകുക. പരിശോധിച്ചശേഷം മാത്രമേ അഭ്യർത്ഥന പ്രസിദ്ധീകരിക്കൂ."
              )}
            </p>
          </div>

          <form className="panel form-grid" onSubmit={requestSubmit}>
            <div className="field">
              <label htmlFor="request-patient">
                {t("Patient name / label", "രോഗിയുടെ പേര് / തിരിച്ചറിയൽ")}
              </label>
              <input
                id="request-patient"
                name="patientLabel"
                maxLength={60}
                placeholder="Patient / കുടുംബാംഗം"
              />
            </div>

            <div className="field">
              <label htmlFor="request-group">
                {t("Required blood group *", "ആവശ്യമായ രക്തഗ്രൂപ്പ് *")}
              </label>
              <select
                id="request-group"
                name="bloodGroup"
                required
                defaultValue=""
              >
                <option value="" disabled>
                  {t("Choose group", "തിരഞ്ഞെടുക്കുക")}
                </option>
                {groups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="request-hospital">
                {t("Hospital *", "ആശുപത്രി *")}
              </label>
              <input
                id="request-hospital"
                name="hospital"
                required
                maxLength={120}
                placeholder="Hospital name"
              />
            </div>

            <div className="field">
              <label htmlFor="request-area">{t("Area *", "സ്ഥലം *")}</label>
              <select
                id="request-area"
                name="location"
                required
                defaultValue=""
              >
                <option value="" disabled>
                  {t("Choose area", "സ്ഥലം തിരഞ്ഞെടുക്കുക")}
                </option>
                {areas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="request-phone">
                {t("Contact mobile *", "ബന്ധപ്പെടാനുള്ള നമ്പർ *")}
              </label>
              <input
                id="request-phone"
                name="phone"
                required
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                pattern="[6-9][0-9]{9}"
                minLength={10}
                maxLength={10}
                placeholder="10-digit mobile number"
              />
            </div>

            <div className="field">
              <label htmlFor="request-units">
                {t("Units needed *", "ആവശ്യമായ യൂണിറ്റ് *")}
              </label>
              <select
                id="request-units"
                name="units"
                required
                defaultValue="1"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
                  <option key={number} value={number}>
                    {number}
                  </option>
                ))}
              </select>
            </div>

            <div className="field full">
              <label htmlFor="request-urgency">
                {t("Urgency *", "അടിയന്തര നില *")}
              </label>
              <select
                id="request-urgency"
                name="urgency"
                required
                defaultValue="urgent"
              >
                <option value="critical">Critical</option>
                <option value="urgent">High</option>
                <option value="normal">Normal</option>
              </select>
            </div>

            <label className="checkline full">
              <input type="checkbox" name="consent" required />
              <span>
                {t(
                  "I confirm I am authorized to share this request and consent to publishing the provided contact number after admin review.",
                  "ഈ അഭ്യർത്ഥന നൽകാൻ എനിക്ക് അധികാരമുണ്ടെന്നും അഡ്മിൻ പരിശോധനയ്ക്ക് ശേഷം ബന്ധപ്പെടാനുള്ള നമ്പർ പ്രസിദ്ധീകരിക്കാൻ സമ്മതമാണെന്നും സ്ഥിരീകരിക്കുന്നു."
                )}
              </span>
            </label>

            <button className="btn full" disabled={requestBusy}>
              {requestBusy
                ? t("Submitting…", "സമർപ്പിക്കുന്നു…")
                : t("Submit blood request", "അഭ്യർത്ഥന സമർപ്പിക്കുക")}
            </button>

            {requestMessage && (
              <div
                className={`notice full ${
                  /please|could not|error/i.test(requestMessage) ? "error" : ""
                }`}
                role="status"
              >
                {requestMessage}
              </div>
            )}
          </form>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-row">
          <span>♥ Blood Connect Meenarkuzhi</span>
          <span>
            {t(
              "Community-led • Privacy matters • Verify before acting",
              "കൂട്ടായ്മ • സ്വകാര്യത പ്രധാനമാണ് • ഉറപ്പാക്കിയ ശേഷം മാത്രം പ്രവർത്തിക്കുക"
            )}
          </span>
          <a href="/admin">Admin</a>
        </div>
      </footer>

      {/* Fixed mobile bottom navigation */}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <a href="#home" className="mobile-nav-item">
          <span className="mobile-nav-icon">⌂</span>
          <span>{t("Home", "ഹോം")}</span>
        </a>

        <a href="#donors" className="mobile-nav-item">
          <span className="mobile-nav-icon">♥</span>
          <span>{t("Donors", "ഡോണർമാർ")}</span>
        </a>

        <a href="#requests" className="mobile-nav-item">
          <span className="mobile-nav-icon">＋</span>
          <span>{t("Requests", "അഭ്യർത്ഥന")}</span>
        </a>

        <a href="#register" className="mobile-nav-item">
          <span className="mobile-nav-icon">♙</span>
          <span>{t("Register", "രജിസ്റ്റർ")}</span>
        </a>
      </nav>
    </main>
  );
}