const language = localStorage.getItem("ledgerly-language") || "tr";
const translations = {
    tr: ["Ödeme sonucu bekleniyor", "PayTR’den doğrulanmış bildirim bekleniyor. Bu sayfayı açık tutabilir veya daha sonra tekrar kontrol edebilirsin.", "Desteğin için teşekkürler", "PayTR ödemenin başarılı olduğunu doğruladı.", "Ödeme tamamlanmadı", "PayTR ödeme işlemini onaylamadı. Fiyatlandırma sayfasına dönüp tekrar deneyebilirsin."],
    en: ["Waiting for payment confirmation", "We are waiting for PayTR’s verified notification. You can check this page again later.", "Thank you for your support", "PayTR confirmed your payment.", "Payment was not completed", "PayTR did not approve the payment. Return to pricing and try again."],
    fr: ["Confirmation du paiement en attente", "Nous attendons la notification vérifiée de PayTR. Vous pouvez revenir consulter cette page plus tard.", "Merci pour votre soutien", "PayTR a confirmé votre paiement.", "Le paiement n’a pas abouti", "PayTR n’a pas validé le paiement. Réessayez depuis la page des tarifs."],
    es: ["Esperando la confirmación del pago", "Esperamos la notificación verificada de PayTR. Puedes volver a consultar esta página más tarde.", "Gracias por tu apoyo", "PayTR confirmó el pago.", "El pago no se completó", "PayTR no aprobó el pago. Vuelve a precios e inténtalo de nuevo."],
    de: ["Warte auf Zahlungsbestätigung", "Wir warten auf die verifizierte Benachrichtigung von PayTR. Du kannst diese Seite später erneut aufrufen.", "Vielen Dank für deine Unterstützung", "PayTR hat die Zahlung bestätigt.", "Zahlung nicht abgeschlossen", "PayTR hat die Zahlung nicht bestätigt. Versuche es über die Tarifseite erneut."]
};

const copy = translations[language] || translations.en;
const title = document.querySelector("#payment-result-title");
const message = document.querySelector("#payment-result-message");
const orderId = new URLSearchParams(location.search).get("order");

document.documentElement.lang = translations[language] ? language : "en";
document.title = `Ledgerly — ${language === "tr" ? "Ödeme durumu" : "Payment status"}`;

async function checkPaymentStatus() {
    if (!orderId || !/^[a-zA-Z0-9_-]{1,100}$/.test(orderId)) {
        title.textContent = copy[0];
        message.textContent = copy[1];
        return;
    }

    for (let attempt = 0; attempt < 15; attempt += 1) {
        try {
            const response = await fetch(`/api/payments/status/${encodeURIComponent(orderId)}`, { cache: "no-store" });
            if (response.ok) {
                const result = await response.json();
                if (result.status === "paid") {
                    title.textContent = copy[2];
                    message.textContent = copy[3];
                    return;
                }
                if (result.status === "failed") {
                    title.textContent = copy[4];
                    message.textContent = copy[5];
                    return;
                }
            }
        } catch { /* The signed PayTR callback may still be processing. */ }
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    title.textContent = copy[0];
    message.textContent = copy[1];
}

checkPaymentStatus();
