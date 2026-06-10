const EVENT_DATE = new Date("2026-08-21T19:00:00+03:00");
const dialog = document.querySelector("#rsvpDialog");
const form = document.querySelector("#rsvpForm");
const successState = document.querySelector("#successState");
const conditionalFields = document.querySelector("#conditionalFields");
const savedResponse = document.querySelector("#savedResponse");
const toast = document.querySelector("#toast");
const formProgress = document.querySelector("#formProgress");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("visible"), 2800);
}

document.querySelectorAll("[data-open-rsvp]").forEach((button) => {
  button.addEventListener("click", () => {
    form.hidden = false;
    successState.hidden = true;
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
    conditionalFields.hidden = radio.value !== "yes";
  });
});

function updateFormProgress() {
  const controls = Array.from(form.querySelectorAll("input, select, textarea"));
  const completed = controls.filter((control) => {
    if (control.type === "radio" || control.type === "checkbox") return control.checked;
    return control.value.trim().length > 0;
  }).length;
  formProgress.style.width = `${Math.min(100, (completed / controls.length) * 100)}%`;
}

form.addEventListener("input", updateFormProgress);
form.addEventListener("change", updateFormProgress);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  localStorage.setItem("aysen-saltuk-rsvp", JSON.stringify(data));
  form.hidden = true;
  successState.hidden = false;
  updateSavedResponse(data);
});

function updateSavedResponse(data) {
  if (!data) return;
  const attending = data.attendance === "yes";
  const selectedEvents = [
    data.eventHenna ? "kına" : "",
    data.eventWedding ? "düğün" : ""
  ].filter(Boolean).join(" ve ");
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
    summary: "Ayşen ve Saltuk - Kına Gecesi",
    location: "Aşk-ı Ala Düğün Salonu Alt Kat, Hendek, Sakarya"
  },
  wedding: {
    file: "aysen-saltuk-dugun.ics",
    start: "20260822T160000Z",
    end: "20260822T200000Z",
    summary: "Ayşen ve Saltuk - Düğün",
    location: "Göksu Başkent Sosyal Tesisleri, Etimesgut, Ankara"
  }
};

document.querySelectorAll("[data-calendar]").forEach((button) => {
  button.addEventListener("click", () => {
    const event = events[button.dataset.calendar];
    const calendar = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Aysen ve Saltuk//Davetiyesi//TR",
      "BEGIN:VEVENT",
      `UID:aysen-saltuk-${button.dataset.calendar}-2026@example.com`,
      "DTSTAMP:20260610T120000Z",
      `DTSTART:${event.start}`,
      `DTEND:${event.end}`,
      `SUMMARY:${event.summary}`,
      `LOCATION:${event.location}`,
      "DESCRIPTION:Ayşen ve Saltuk'un özel gününe davetlisiniz.",
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
  const shareData = {
    title: "Ayşen & Saltuk | 21–22 Ağustos 2026",
    text: "Ayşen ve Saltuk'un kına ve düğün davetiyesi",
    url: window.location.href
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Davetiye bağlantısı kopyalandı.");
    }
  } catch (error) {
    if (error.name !== "AbortError") showToast("Bağlantı kopyalanamadı.");
  }
});

try {
  updateSavedResponse(JSON.parse(localStorage.getItem("aysen-saltuk-rsvp")));
} catch {
  localStorage.removeItem("aysen-saltuk-rsvp");
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
