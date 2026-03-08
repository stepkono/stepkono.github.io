"use strict";

(function initContactForm() {
  const form = document.querySelector("#contact-form");
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const statusNode = document.querySelector("#form-status");
  const linksWrap = document.querySelector("#social-links-wrap");
  const addLinkButton = document.querySelector("#add-social-link");
  const summaryField = document.querySelector("#request-summary");
  const emailInput = form.querySelector("#email");

  const config = window.SCHAUFENSTER_CONFIG || {};
  const endpoint = typeof config.formEndpoint === "string" ? config.formEndpoint : "";
  const bootTime = Date.now();
  const emailPattern = /^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,62}[A-Za-z0-9])?@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

  function setStatus(text, state) {
    if (!statusNode) {
      return;
    }
    statusNode.textContent = text;
    statusNode.setAttribute("data-state", state || "");
  }

  function collectSocialLinks() {
    const nodes = form.querySelectorAll('input[name="social_links[]"]');
    const values = [];

    nodes.forEach((node) => {
      const value = node.value.trim();
      if (value) {
        values.push(value);
      }
    });

    return values;
  }

  function sanitize(value) {
    return value.replace(/[\u0000-\u001F\u007F]/g, " ").trim();
  }

  function buildSummary() {
    const data = new FormData(form);
    const socialLinks = collectSocialLinks();

    const summaryLines = [
      "Neue Anfrage ueber schaufenster_site",
      "",
      `Name: ${sanitize(String(data.get("name") || ""))}`,
      `E-Mail: ${sanitize(String(data.get("email") || ""))}`,
      `Anzahl Mitarbeiter: ${sanitize(String(data.get("employees") || ""))}`,
      `Taetigkeit: ${sanitize(String(data.get("business_type") || ""))}`,
      `Jahresumsatz (optional): ${sanitize(String(data.get("annual_revenue") || "Nicht angegeben"))}`,
      `Bestehende Website (optional): ${sanitize(String(data.get("existing_site") || "Nicht angegeben"))}`,
      `Social Links (optional): ${socialLinks.length ? socialLinks.join(", ") : "Keine"}`,
      "",
      "Nachricht:",
      sanitize(String(data.get("message") || ""))
    ];

    return summaryLines.join("\n");
  }

  function syncSummary() {
    const summary = buildSummary();
    if (summaryField instanceof HTMLInputElement || summaryField instanceof HTMLTextAreaElement) {
      summaryField.value = summary;
    }
  }

  function validateEmailField() {
    if (!(emailInput instanceof HTMLInputElement)) {
      return true;
    }

    const emailValue = emailInput.value.trim();
    if (!emailValue) {
      emailInput.setCustomValidity("");
      return false;
    }
    const isValid = emailPattern.test(emailValue);
    emailInput.setCustomValidity(isValid ? "" : "Bitte gib eine gültige E-Mail im Format name@domain.tld ein.");
    return isValid;
  }

  form.addEventListener("input", () => {
    syncSummary();
    validateEmailField();
  });
  syncSummary();

  if (addLinkButton && linksWrap) {
    addLinkButton.addEventListener("click", () => {
      const field = document.createElement("div");
      field.className = "field field--full";

      const label = document.createElement("label");
      label.textContent = "Weiterer Social Link (optional)";

      const input = document.createElement("input");
      input.type = "url";
      input.name = "social_links[]";
      input.placeholder = "https://...";
      input.autocomplete = "url";

      field.append(label, input);
      linksWrap.appendChild(field);
      input.focus();
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const honeypotValue = String((form.querySelector('input[name="company_website"]') || {}).value || "").trim();
    if (honeypotValue) {
      setStatus("Anfrage blockiert.", "error");
      return;
    }

    if (Date.now() - bootTime < 3000) {
      setStatus("Bitte nehmen Sie sich einen Moment Zeit und versuchen Sie es erneut.", "error");
      return;
    }

    if (!form.checkValidity()) {
      setStatus("Bitte überprüfen Sie Ihre Eingaben.", "error");
      form.reportValidity();
      return;
    }

    if (!validateEmailField()) {
      setStatus("Bitte gib eine gültige E-Mail-Adresse ein.", "error");
      if (emailInput instanceof HTMLInputElement) {
        emailInput.reportValidity();
        emailInput.focus();
      }
      return;
    }

    if (!endpoint || endpoint.includes("YOUR_FORM_ID")) {
      setStatus("Formular ist noch nicht konfiguriert. Bitte Formspree-ID in scripts/config.js eintragen.", "error");
      return;
    }

    syncSummary();
    setStatus("Sende Anfrage ...", "");

    const payload = new FormData(form);
    payload.set("_subject", "Neue Schaufenster-Anfrage");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: payload,
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
      }

      form.reset();
      if (emailInput instanceof HTMLInputElement) {
        emailInput.setCustomValidity("");
      }
      syncSummary();
      setStatus("Danke! Ihre Anfrage wurde erfolgreich gesendet.", "ok");
    } catch (error) {
      setStatus("Senden fehlgeschlagen. Bitte versuche es spaeter erneut oder schreibe direkt per E-Mail.", "error");
    }
  });
})();
