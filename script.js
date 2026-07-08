const EVENT_DATE = new Date("2026-08-21T19:00:00+03:00");

const dialog = document.querySelector("#rsvpDialog");
const form = document.querySelector("#rsvpForm");
const successState = document.querySelector("#successState");
const conditionalFields = document.querySelector("#conditionalFields");
const savedResponse = document.querySelector("#savedResponse");
const toast = document.querySelector("#toast");
const formProgress = document.querySelector("#formProgress");
const RSVP_STORAGE_KEY = "aysen-saltuk-rsvp";
const RSVP_WHATSAPP_NUMBER = "905365825495";

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("visible"), 2800);
}

function syncConditionalFields() {
  const attendance = form.elements.attendance.value;
  conditionalFields.hidden = attendance !== "yes";
}

function getSelectedEvents(data) {
  return [
    data.eventHenna ? "kına gecesi" : "",
    data.eventWedding ? "düğün" : ""
  ].filter(Boolean);
}

function composeRsvpMessage(data) {
  const attending = data.attendance === "yes";
  const lines = [
    "Merhaba Ayşen & Saltuk Buğrahan,",
    "",
    `LCV yanıtım: ${attending ? "Katılıyorum" : "Katılamıyorum"}`,
    `Ad soyad: ${data.name}`
  ];

  if (attending) {
    const selectedEvents = getSelectedEvents(data);
    lines.push(`Etkinlik: ${selectedEvents.join(" ve ")}`);
    lines.push(`Kişi sayısı: ${data.guests || 1}`);
  }

  if (data.message) {
    lines.push("");
    lines.push(`Mesaj: ${data.message}`);
  }

  return lines.join("\n");
}

function updateFormProgress() {
  const controls = Array.from(form.querySelectorAll("input, select, textarea")).filter((control) => {
    if (conditionalFields.hidden && conditionalFields.contains(control)) return false;
    return control.type !== "checkbox" || control.checked;
  });
  const completed = controls.filter((control) => {
    if (control.type === "radio") return control.checked;
    if (control.type === "checkbox") return true;
    return control.value.trim().length > 0;
  }).length;
  formProgress.style.width = `${Math.min(100, (completed / Math.max(controls.length, 1)) * 100)}%`;
}

document.querySelectorAll("[data-open-rsvp]").forEach((button) => {
  button.addEventListener("click", () => {
    form.hidden = false;
    successState.hidden = true;
    syncConditionalFields();
    updateFormProgress();
    dialog.showModal();
  });
});

document.querySelectorAll("[data-close-rsvp]").forEach((button) => {
  button.addEventListener("click", () => dialog.close());
});

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

Array.from(form.elements.attendance).forEach((radio) => {
  radio.addEventListener("change", () => {
    syncConditionalFields();
    updateFormProgress();
  });
});

form.addEventListener("input", updateFormProgress);
form.addEventListener("change", updateFormProgress);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (data.attendance === "yes" && !data.eventHenna && !data.eventWedding) {
    showToast("Lütfen katılacağınız etkinliği seçin.");
    conditionalFields.querySelector("input").focus();
    return;
  }

  localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(data));
  const whatsappUrl = `https://wa.me/${RSVP_WHATSAPP_NUMBER}?text=${encodeURIComponent(composeRsvpMessage(data))}`;
  const whatsappWindow = window.open(whatsappUrl, "_blank", "noopener");
  if (!whatsappWindow) window.location.href = whatsappUrl;
  form.hidden = true;
  successState.hidden = false;
  updateSavedResponse(data);
  showToast("WhatsApp mesajınız hazırlandı.");
});

function updateSavedResponse(data) {
  if (!data) return;
  const attending = data.attendance === "yes";
  const selectedEvents = getSelectedEvents(data).join(" ve ");
  savedResponse.hidden = false;
  savedResponse.textContent = attending
    ? `Yanıtınız kayıtlı: ${data.guests || 1} kişi${selectedEvents ? ` ${selectedEvents} programına` : ""} katılıyor.`
    : "Yanıtınız kayıtlı: Katılamıyorsunuz.";
}

function updateCountdown() {
  const difference = Math.max(0, EVENT_DATE.getTime() - Date.now());
  const days = Math.floor(difference / 86_400_000);
  const hours = Math.floor((difference / 3_600_000) % 24);
  const minutes = Math.floor((difference / 60_000) % 60);
  const seconds = Math.floor((difference / 1_000) % 60);
  document.querySelector("[data-days]").textContent = String(days).padStart(3, "0");
  document.querySelector("[data-hours]").textContent = String(hours).padStart(2, "0");
  document.querySelector("[data-minutes]").textContent = String(minutes).padStart(2, "0");
  document.querySelector("[data-seconds]").textContent = String(seconds).padStart(2, "0");
}

const events = {
  henna: {
    file: "aysen-saltuk-kina.ics",
    start: "20260821T160000Z",
    end: "20260821T200000Z",
    summary: "Ayşen ve Saltuk Buğrahan - Kına Gecesi",
    location: "Aşk-ı Ala Düğün Salonu Alt Kat, Hendek, Sakarya"
  },
  wedding: {
    file: "aysen-saltuk-dugun.ics",
    start: "20260822T160000Z",
    end: "20260822T200000Z",
    summary: "Ayşen ve Saltuk Buğrahan - Düğün",
    location: "Göksu Başkent Sosyal Tesisleri, Etimesgut, Ankara"
  }
};

document.querySelectorAll("[data-calendar]").forEach((button) => {
  button.addEventListener("click", () => {
    const event = events[button.dataset.calendar];
    const calendar = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Aysen ve Saltuk Bugrahan//Davetiyesi//TR",
      "BEGIN:VEVENT",
      `UID:aysen-saltuk-${button.dataset.calendar}-2026@example.com`,
      "DTSTAMP:20260707T120000Z",
      `DTSTART:${event.start}`,
      `DTEND:${event.end}`,
      `SUMMARY:${event.summary}`,
      `LOCATION:${event.location}`,
      "DESCRIPTION:Ayşen ve Saltuk Buğrahan'ın özel gününe davetlisiniz.",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
    const link = document.createElement("a");
    const calendarUrl = URL.createObjectURL(new Blob([calendar], { type: "text/calendar;charset=utf-8" }));
    link.href = calendarUrl;
    link.download = event.file;
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    window.setTimeout(() => {
      link.remove();
      URL.revokeObjectURL(calendarUrl);
    }, 1000);
    showToast("Takvim dosyası hazırlandı.");
  });
});

document.querySelector("#shareButton").addEventListener("click", async () => {
  const invitationText = [
    "Sevgili ailemiz ve dostlarımız,",
    "",
    "Bu güzel yolculuğumuzun en özel günlerinde sizleri de yanımızda görmekten mutluluk duyarız.",
    "",
    "Kına gecemiz 21 Ağustos 2026 Cuma günü Sakarya Hendek'te, düğünümüz ise 22 Ağustos 2026 Cumartesi günü Ankara Etimesgut'ta olacak.",
    "",
    "Program detayları, yol tarifi, takvim ve LCV için davetiyemizi buradan inceleyebilirsiniz:",
    window.location.href,
    "",
    "Sevgilerimizle,",
    "Ayşen & Saltuk Buğrahan"
  ].join("\n");
  const shareData = {
    title: "Ayşen & Saltuk Buğrahan | 21-22 Ağustos 2026",
    text: invitationText,
    url: window.location.href
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(invitationText);
      showToast("Davetiye mesajı kopyalandı.");
    }
  } catch (error) {
    if (error.name !== "AbortError") showToast("Davetiye mesajı kopyalanamadı.");
  }
});

try {
  updateSavedResponse(JSON.parse(localStorage.getItem(RSVP_STORAGE_KEY)));
} catch {
  localStorage.removeItem(RSVP_STORAGE_KEY);
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const navigationLinks = document.querySelectorAll(".desktop-nav a");
const navigationObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navigationLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
    });
  });
}, { rootMargin: "-35% 0px -55% 0px" });
document.querySelectorAll("#kina, #dugun, #aileler, #lcv").forEach((section) => navigationObserver.observe(section));

updateCountdown();
window.setInterval(updateCountdown, 1000);
