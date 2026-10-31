const translations = {
    tr: { free: "Ücretsiz", freeDescription: "Trading günlüğüne başlamak için gerekenler.", freePeriod: "/ her zaman", freeFeature1: "Sınırsız işlem kaydı", freeFeature2: "Temel performans özeti", freeFeature3: "Kişisel işlem notları", starter: "Başlangıç", starterDescription: "Disiplinli bir rutine ilk adım.", starterFeature1: "Sınırsız işlem günlüğü", starterFeature2: "Aylık performans grafiği", starterFeature3: "Etiketler ve işlem notları", trader: "Trader", traderDescription: "Daha derin analiz ve düzenli değerlendirme.", traderFeature1: "Gelişmiş performans analizi", traderFeature2: "Strateji ve piyasa etiketleri", traderFeature3: "İşlem sonrası hatırlatmalar", desk: "Desk", deskDescription: "Birden fazla piyasa için kapsamlı çalışma alanı.", deskFeature1: "Çoklu piyasa panosu", deskFeature2: "VİOP ve spot piyasa alanları", deskFeature3: "Öncelikli gelişmiş raporlar", monthly: "/ ay", loginError: "Kullanıcı adı veya şifre hatalı.", saved: "Paket kaydedildi.", deleteConfirm: "Bu paketi silmek istiyor musun?", edit: "Düzenle", delete: "Sil", empty: "Henüz paket yok." },
    en: { free: "Free", starter: "Starter", starterDescription: "Your first step toward a more deliberate routine.", starterFeature1: "Unlimited journal entries", starterFeature2: "Monthly performance chart", starterFeature3: "Trade tags and notes", trader: "Trader", traderDescription: "Deeper analysis and a more considered review.", traderFeature1: "Advanced performance analysis", traderFeature2: "Strategy and market tags", traderFeature3: "Post-trade reminders", desk: "Desk", deskDescription: "A broader workspace across multiple markets.", deskFeature1: "Multi-market dashboard", deskFeature2: "VIOP and spot-market workspaces", deskFeature3: "Priority advanced reports", loginError: "Username or password is incorrect.", saved: "Plan saved.", deleteConfirm: "Delete this plan?", edit: "Edit", delete: "Delete", empty: "No plans yet." },
    fr: { free: "Gratuit", starter: "Essentiel", starterDescription: "Un premier pas vers une routine plus réfléchie.", starterFeature1: "Journal de trades illimité", starterFeature2: "Graphique mensuel des performances", starterFeature3: "Tags et notes de trade", trader: "Trader", traderDescription: "Une analyse approfondie et un meilleur suivi.", traderFeature1: "Analyse avancée des performances", traderFeature2: "Tags de stratégie et de marché", traderFeature3: "Rappels après les trades", desk: "Desk", deskDescription: "Un espace de travail pour plusieurs marchés.", deskFeature1: "Tableau de bord multi-marchés", deskFeature2: "Espaces VIOP et marchés au comptant", deskFeature3: "Rapports avancés prioritaires", loginError: "Identifiant ou mot de passe incorrect.", saved: "Offre enregistrée.", deleteConfirm: "Supprimer cette offre ?", edit: "Modifier", delete: "Supprimer", empty: "Aucune offre pour le moment." },
    es: { free: "Gratis", starter: "Inicial", starterDescription: "El primer paso hacia una rutina más consciente.", starterFeature1: "Diario de operaciones ilimitado", starterFeature2: "Gráfico mensual de rendimiento", starterFeature3: "Etiquetas y notas de trading", trader: "Trader", traderDescription: "Análisis más profundo y seguimiento constante.", traderFeature1: "Análisis avanzado del rendimiento", traderFeature2: "Etiquetas de estrategia y mercado", traderFeature3: "Recordatorios tras operar", desk: "Desk", deskDescription: "Un espacio de trabajo para varios mercados.", deskFeature1: "Panel multidivisa", deskFeature2: "Espacios para VIOP y mercado al contado", deskFeature3: "Informes avanzados prioritarios", loginError: "El usuario o la contraseña no son correctos.", saved: "Plan guardado.", deleteConfirm: "¿Eliminar este plan?", edit: "Editar", delete: "Eliminar", empty: "Todavía no hay planes." },
    de: { free: "Kostenlos", starter: "Starter", starterDescription: "Der erste Schritt zu einer bewussteren Routine.", starterFeature1: "Unbegrenzte Tagebucheinträge", starterFeature2: "Monatliches Performance-Diagramm", starterFeature3: "Trade-Tags und Notizen", trader: "Trader", traderDescription: "Detailliertere Analysen und regelmäßige Reviews.", traderFeature1: "Erweiterte Performance-Analyse", traderFeature2: "Strategie- und Markt-Tags", traderFeature3: "Erinnerungen nach Trades", desk: "Desk", deskDescription: "Ein Arbeitsbereich für mehrere Märkte.", deskFeature1: "Multi-Markt-Dashboard", deskFeature2: "VIOP- und Spot-Marktbereiche", deskFeature3: "Erweiterte Berichte mit Priorität", loginError: "Benutzername oder Passwort ist falsch.", saved: "Tarif gespeichert.", deleteConfirm: "Diesen Tarif löschen?", edit: "Bearbeiten", delete: "Löschen", empty: "Noch keine Tarife." }
};

const planLabels = {
    tr: { packageFree: "Ücretsiz", packageFreeDescription: "Trading günlüğüne başlamak için gerekenler.", packageFreePeriod: "/ her zaman", packageFreeFeature1: "Sınırsız işlem kaydı", packageFreeFeature2: "Temel performans özeti", packageFreeFeature3: "Kişisel işlem notları", packageStarter: "Başlangıç", packageMonthly: "/ ay", packageStarterDescription: "Disiplinli bir rutine ilk adım.", packageStarterFeature1: "Sınırsız işlem günlüğü", packageStarterFeature2: "Aylık performans grafiği", packageStarterFeature3: "Etiketler ve işlem notları", packageTrader: "Trader", packageTraderDescription: "Daha derin analiz ve düzenli değerlendirme.", packageTraderFeature1: "Gelişmiş performans analizi", packageTraderFeature2: "Strateji ve piyasa etiketleri", packageTraderFeature3: "İşlem sonrası hatırlatmalar", packageDesk: "Desk", packageDeskDescription: "Birden fazla piyasa için kapsamlı çalışma alanı.", packageDeskFeature1: "Çoklu piyasa panosu", packageDeskFeature2: "VİOP ve spot piyasa alanları", packageDeskFeature3: "Öncelikli gelişmiş raporlar" },
    en: { packageFree: "Free", packageFreeDescription: "The essentials to start your trading journal.", packageFreePeriod: "/ forever", packageFreeFeature1: "Unlimited trade entries", packageFreeFeature2: "Core performance summary", packageFreeFeature3: "Personal trade notes", packageStarter: "Starter", packageMonthly: "/ month", packageStarterDescription: "Your first step toward a more deliberate routine.", packageStarterFeature1: "Unlimited journal entries", packageStarterFeature2: "Monthly performance chart", packageStarterFeature3: "Trade tags and notes", packageTrader: "Trader", packageTraderDescription: "Deeper analysis and a more considered review.", packageTraderFeature1: "Advanced performance analysis", packageTraderFeature2: "Strategy and market tags", packageTraderFeature3: "Post-trade reminders", packageDesk: "Desk", packageDeskDescription: "A broader workspace across multiple markets.", packageDeskFeature1: "Multi-market dashboard", packageDeskFeature2: "VIOP and spot-market workspaces", packageDeskFeature3: "Priority advanced reports" },
    fr: { packageFree: "Gratuit", packageFreeDescription: "L’essentiel pour commencer votre journal de trading.", packageFreePeriod: "/ pour toujours", packageFreeFeature1: "Trades illimités", packageFreeFeature2: "Résumé des performances", packageFreeFeature3: "Notes personnelles", packageStarter: "Essentiel", packageMonthly: "/ mois", packageStarterDescription: "Un premier pas vers une routine plus réfléchie.", packageStarterFeature1: "Journal de trades illimité", packageStarterFeature2: "Graphique mensuel des performances", packageStarterFeature3: "Tags et notes de trade", packageTrader: "Trader", packageTraderDescription: "Une analyse approfondie et un meilleur suivi.", packageTraderFeature1: "Analyse avancée des performances", packageTraderFeature2: "Tags de stratégie et de marché", packageTraderFeature3: "Rappels après les trades", packageDesk: "Desk", packageDeskDescription: "Un espace de travail pour plusieurs marchés.", packageDeskFeature1: "Tableau de bord multi-marchés", packageDeskFeature2: "Espaces VIOP et marchés au comptant", packageDeskFeature3: "Rapports avancés prioritaires" },
    es: { packageFree: "Gratis", packageFreeDescription: "Lo esencial para empezar tu diario de trading.", packageFreePeriod: "/ para siempre", packageFreeFeature1: "Operaciones ilimitadas", packageFreeFeature2: "Resumen básico de rendimiento", packageFreeFeature3: "Notas personales", packageStarter: "Inicial", packageMonthly: "/ mes", packageStarterDescription: "El primer paso hacia una rutina más consciente.", packageStarterFeature1: "Diario de operaciones ilimitado", packageStarterFeature2: "Gráfico mensual de rendimiento", packageStarterFeature3: "Etiquetas y notas de trading", packageTrader: "Trader", packageTraderDescription: "Análisis más profundo y seguimiento constante.", packageTraderFeature1: "Análisis avanzado del rendimiento", packageTraderFeature2: "Etiquetas de estrategia y mercado", packageTraderFeature3: "Recordatorios tras operar", packageDesk: "Desk", packageDeskDescription: "Un espacio de trabajo para varios mercados.", packageDeskFeature1: "Panel multidivisa", packageDeskFeature2: "Espacios para VIOP y mercado al contado", packageDeskFeature3: "Informes avanzados prioritarios" },
    de: { packageFree: "Kostenlos", packageFreeDescription: "Alles für den Einstieg ins Trading-Tagebuch.", packageFreePeriod: "/ dauerhaft", packageFreeFeature1: "Unbegrenzte Trade-Einträge", packageFreeFeature2: "Kompakte Performance-Übersicht", packageFreeFeature3: "Persönliche Notizen", packageStarter: "Starter", packageMonthly: "/ Monat", packageStarterDescription: "Der erste Schritt zu einer bewussteren Routine.", packageStarterFeature1: "Unbegrenzte Tagebucheinträge", packageStarterFeature2: "Monatliches Performance-Diagramm", packageStarterFeature3: "Trade-Tags und Notizen", packageTrader: "Trader", packageTraderDescription: "Detailliertere Analysen und regelmäßige Reviews.", packageTraderFeature1: "Erweiterte Performance-Analyse", packageTraderFeature2: "Strategie- und Markt-Tags", packageTraderFeature3: "Erinnerungen nach Trades", packageDesk: "Desk", packageDeskDescription: "Ein Arbeitsbereich für mehrere Märkte.", packageDeskFeature1: "Multi-Markt-Dashboard", packageDeskFeature2: "VIOP- und Spot-Marktbereiche", packageDeskFeature3: "Erweiterte Berichte mit Priorität" }
};

const language = localStorage.getItem("ledgerly-language") || "tr";
const copy = translations[language] || translations.tr;
const loginView = document.querySelector("#login-view");
const panelView = document.querySelector("#panel-view");
const loginForm = document.querySelector("#login-form");
const packageForm = document.querySelector("#package-form");
const packageList = document.querySelector("#package-list");
const packageTranslationKeys = {
    packageFree: "free", packageFreeDescription: "freeDescription", packageFreePeriod: "freePeriod", packageFreeFeature1: "freeFeature1", packageFreeFeature2: "freeFeature2", packageFreeFeature3: "freeFeature3",
    packageStarter: "starter", packageStarterDescription: "starterDescription", packageStarterFeature1: "starterFeature1", packageStarterFeature2: "starterFeature2", packageStarterFeature3: "starterFeature3",
    packageTrader: "trader", packageTraderDescription: "traderDescription", packageTraderFeature1: "traderFeature1", packageTraderFeature2: "traderFeature2", packageTraderFeature3: "traderFeature3",
    packageDesk: "desk", packageDeskDescription: "deskDescription", packageDeskFeature1: "deskFeature1", packageDeskFeature2: "deskFeature2", packageDeskFeature3: "deskFeature3", packageMonthly: "monthly"
};
let plans = [];

async function apiRequest(path, options = {}) {
    const response = await fetch(path, { credentials: "same-origin", ...options, headers: { "content-type": "application/json", ...options.headers } });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `Request failed (${response.status})`);
    return result;
}

function localizedValue(plan, property) {
    const key = plan[`${property}Key`];
    const localizedKey = key === "packageTraderPeriod" ? "packageMonthly" : key;
    return localizedKey && packageTranslationKeys[localizedKey] && planLabels[language]?.[localizedKey] ? planLabels[language][localizedKey] : plan[property] || "";
}

function localizedFeature(feature) {
    return planLabels[language]?.[feature] || feature;
}

function resetForm() {
    packageForm.reset();
    packageForm.elements.packageId.value = "";
    document.querySelector("#form-status").textContent = "";
}

function renderPlanList() {
    packageList.replaceChildren();
    if (!plans.length) {
        const empty = document.createElement("p");
        empty.className = "empty-list";
        empty.textContent = copy.empty;
        packageList.append(empty);
        return;
    }

    const order = new Map(starterPlans.map((plan, index) => [plan.id, index]));
    plans.sort((first, second) => (order.get(first.id) ?? starterPlans.length) - (order.get(second.id) ?? starterPlans.length));
    plans.forEach((plan) => {
        const row = document.createElement("div");
        row.className = "package-row";
        const details = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = localizedValue(plan, "name");
        const summary = document.createElement("small");
        summary.textContent = `${new Intl.NumberFormat(language, { style: "currency", currency: language === "tr" ? "TRY" : language === "en" ? "USD" : "EUR" }).format(Number(plan.price) || 0)} ${localizedValue(plan, "period")}`;
        details.append(name, summary);
        const actions = document.createElement("div");
        actions.className = "package-actions";
        const edit = document.createElement("button");
        edit.type = "button";
        edit.dataset.editId = plan.id;
        edit.textContent = copy.edit;
        const remove = document.createElement("button");
        remove.type = "button";
        remove.dataset.deleteId = plan.id;
        remove.textContent = copy.delete;
        actions.append(edit, remove);
        row.append(details, actions);
        packageList.append(row);
    });
}

async function refreshPlans() {
    const result = await apiRequest("/api/admin/packages");
    plans = result.plans;
    renderPlanList();
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const error = document.querySelector("#login-error");
    const submit = loginForm.querySelector("button[type='submit']");
    submit.disabled = true;
    error.hidden = true;
    try {
        await apiRequest("/api/admin/login", { method: "POST", body: JSON.stringify({ username: loginForm.elements.username.value, password: loginForm.elements.password.value }) });
        loginView.hidden = true;
        panelView.hidden = false;
        await refreshPlans();
        resetForm();
    } catch (loginError) {
        error.textContent = loginError.message.includes("Failed to fetch") ? "Sunucuya bağlanılamadı. Terminalde npm start komutuyla sunucuyu başlat." : loginError.message || copy.loginError;
        error.hidden = false;
    } finally {
        submit.disabled = false;
    }
});

packageForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const plan = {
        id: form.elements.packageId.value || (crypto.randomUUID ? crypto.randomUUID() : `plan-${Date.now()}`),
        name: form.elements.name.value.trim(),
        description: form.elements.description.value.trim(),
        price: Number(form.elements.price.value),
        period: form.elements.period.value.trim(),
        features: form.elements.features.value.split("\n").map((feature) => feature.trim()).filter(Boolean),
        featured: form.elements.featured.checked
    };
    const status = document.querySelector("#form-status");
    try {
        await apiRequest("/api/admin/packages", { method: "POST", body: JSON.stringify(plan) });
        await refreshPlans();
        resetForm();
        status.textContent = copy.saved;
    } catch (saveError) {
        status.textContent = saveError.message;
        status.classList.add("is-error");
    }
});

document.querySelector("#new-package").addEventListener("click", resetForm);
packageList.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit-id]");
    const deleteButton = event.target.closest("[data-delete-id]");
    if (editButton) {
        const plan = plans.find((entry) => entry.id === editButton.dataset.editId);
        if (!plan) return;
        packageForm.elements.packageId.value = plan.id;
        packageForm.elements.name.value = localizedValue(plan, "name");
        packageForm.elements.price.value = plan.price;
        packageForm.elements.period.value = localizedValue(plan, "period");
        packageForm.elements.description.value = localizedValue(plan, "description");
        packageForm.elements.features.value = (plan.features || plan.featureKeys || []).map(localizedFeature).join("\n");
        packageForm.elements.featured.checked = Boolean(plan.featured);
        packageForm.elements.name.focus();
    }
    if (deleteButton && window.confirm(copy.deleteConfirm)) {
        try {
            await apiRequest(`/api/admin/packages/${encodeURIComponent(deleteButton.dataset.deleteId)}`, { method: "DELETE" });
            await refreshPlans();
        } catch (deleteError) {
            document.querySelector("#form-status").textContent = deleteError.message;
            document.querySelector("#form-status").classList.add("is-error");
        }
    }
});

document.querySelector("#logout-button").addEventListener("click", () => {
    apiRequest("/api/admin/logout", { method: "POST", body: "{}" }).finally(() => {
        resetForm();
        panelView.hidden = true;
        loginView.hidden = false;
        loginForm.reset();
    });
});

apiRequest("/api/admin/session")
    .then(() => {
        loginView.hidden = true;
        panelView.hidden = false;
        return refreshPlans();
    })
    .catch(() => {});
