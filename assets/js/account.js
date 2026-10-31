const authView = document.querySelector("#auth-view");
const dashboardView = document.querySelector("#dashboard-view");
const loginTab = document.querySelector("#login-tab");
const registerTab = document.querySelector("#register-tab");
const forgotTab = document.querySelector("#forgot-tab");
const loginPanel = document.querySelector("#login-panel");
const registerPanel = document.querySelector("#register-panel");
const forgotPanel = document.querySelector("#forgot-panel");
const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const forgotRequestForm = document.querySelector("#forgot-request-form");
const forgotResetForm = document.querySelector("#forgot-reset-form");
const resetCodeSection = document.querySelector("#reset-code-section");
const tradeForm = document.querySelector("#trade-form");
const tradeList = document.querySelector("#trade-list");
const tradeEmpty = document.querySelector("#trade-empty");
const tradeMessage = document.querySelector("#trade-message");
const langSelect = document.querySelector("#language-select");
const themeToggle = document.querySelector("#theme-toggle");

let csrfToken = "";
let profile = null;
let trades = [];
let selectedTradeIds = new Set();
let currentEditId = "";

const marketNames = {
    forex: "Forex",
    crypto_spot: "Kripto spot",
    crypto_futures: "Kripto vadeli",
    bist: "BIST",
    viop: "VİOP",
    us_stocks: "ABD hisseleri",
    commodities: "Emtia",
    indices: "Endeks",
    options: "Opsiyon",
    other: "Diğer"
};

const intensityNames = {
    occasional: "Ara sıra",
    weekly: "Haftada birkaç",
    daily: "Günde birkaç",
    multiple_daily: "Günde çok sayıda"
};

// Comprehensive i18n Dictionary
const accountTranslations = {
    tr: {
        plansAndSupport: "Planlar ve destek",
        authEyebrow: "KİŞİSEL TRADING ALANIN",
        authMainTitle: "İşlemlerin<br><em>sana özel.</em>",
        authDescription: "Her kaydın hesabında şifreli saklanır. Piyasalarını ve işlem alışkanlıklarını belirle, profesyonel trade günlüğünü hemen kullanmaya başla.",
        authVaultNotice: "Trade ve hesap verilerin sana özel AES-256-GCM şifreli kasada korunur.",
        tabLogin: "Giriş yap",
        tabRegister: "Hesap oluştur",
        tabForgot: "Şifremi unuttum",
        loginTitle: "Tekrar hoş geldin",
        loginSubtitle: "Kişisel trade günlüğüne güvenli giriş yap.",
        labelEmail: "E-posta",
        labelPassword: "Şifre",
        labelPasswordHint: "(En az 12 karakter)",
        linkForgot: "Şifremi unuttum?",
        btnLogin: "Giriş yap",
        registerTitle: "Hesabını oluştur",
        registerSubtitle: "Günlüğünü trading tarzına göre 1 dakikada hazırla.",
        labelFullName: "Ad soyad",
        labelPhone: "Telefon",
        legendMarkets: "İşlem yaptığın piyasalar (Hızlı Seçim)",
        labelIntensity: "İşlem yoğunluğun",
        intensityOccasional: "Ara sıra",
        intensityWeekly: "Haftada birkaç",
        intensityDaily: "Günde birkaç",
        intensityActive: "Günde çok sayıda (Scalp)",
        labelCurrency: "Rapor para birimi",
        labelSymbols: "Takip ettiğin pariteler / semboller",
        labelSymbolsHint: "(Virgülle ayırabilirsin)",
        consentText: "Gizlilik bildirimini ve verilerimin AES-256-GCM ile şifrelenmesini onaylıyorum. ",
        btnRegister: "Güvenli Hesap Oluştur",
        forgotTitle: "Şifremi Unuttum",
        forgotSubtitle: "Kayıtlı e-posta adresini girerek şifreni güvenle sıfırla.",
        btnSendResetCode: "Sıfırlama Kodu Oluştur",
        resetNewPwdTitle: "Yeni Şifre Belirle",
        labelResetToken: "Sıfırlama Kodu / Token",
        labelNewPassword: "Yeni Şifreniz",
        btnApplyNewPassword: "Şifremi Güncelle ve Giriş Yap",
        dashEyebrow: "KİŞİSEL ALAN",
        dashGreeting: "Merhaba",
        dashSubtitle: "Trade günlüğün sadece senin hesabında şifreli olarak saklanır.",
        btnExportCsv: "Tümünü CSV İndir",
        btnExportJson: "JSON Yedeği",
        btnLogout: "Çıkış Yap ↗",
        vaultTitle: "Uçtan Uca Şifreli Kişisel Kasa",
        vaultDesc: "Profil ve trade kayıtların sunucuda sana özel anahtarla şifrelenmiş olarak saklanır. Dışa aktarma dosyaları şifresiz olacağından indirdiğin dosyayı güvenli yerde tut.",
        journalEyebrow: "YENİ KAYIT",
        journalHeading: "Trade Günlüğüne Ekle",
        journalStep: "01 / KAYIT",
        tradeMarket: "Piyasa",
        tradeSelect: "Piyasa seç",
        tradeSymbol: "Parite / Sembol",
        tradeSide: "Yön",
        tradeOpenedAt: "Açılış Tarihi",
        tradeClosedAt: "Kapanış Tarihi",
        tradeOrderType: "İşlem Tipi",
        tradeTimeframe: "Zaman Dilimi",
        tradeEntryPrice: "Giriş Fiyatı",
        tradeExitPrice: "Çıkış Fiyatı",
        tradeQuantity: "Miktar / Kontrat",
        tradeLeverage: "Kaldıraç",
        tradeStopLoss: "Stop Loss",
        tradeTakeProfit: "Take Profit",
        tradeRiskPercent: "Planlanan Risk (%)",
        tradeFees: "Komisyon / Ücret",
        tradeFunding: "Fonlama / Swap",
        tradeStrategy: "Strateji / Kurallar (5N1K)",
        tradeSession: "Seans",
        tradeMoodBefore: "İşlem Öncesi Duygu",
        tradeMoodAfter: "İşlem Sonrası Duygu",
        tradeCurrency: "Rapor Para Birimi",
        tradeNotes: "İşlem Notları & 5N1K Analizi",
        tradeFollowedPlan: "İşlem planıma ve kurallarıma sadık kaldım",
        btnSaveTrade: "Trade Kaydet",
        btnCancel: "Vazgeç",
        archiveEyebrow: "KİŞİSEL ARŞİV",
        archiveHeading: "Trade Geçmişin",
        searchPlaceholder: "Sembol / strateji ara",
        filterAllMarkets: "Tüm piyasalar",
        btnExportSelectedCsv: "Seçileni CSV İndir",
        btnExportSelectedJson: "Seçileni JSON İndir",
        emptyTrades: "Henüz trade kaydetmedin.",
        footerTagline: "Kişisel trading günlüğü",
        footerPrivacy: "Gizlilik ve kullanım"
    },
    en: {
        plansAndSupport: "Plans & Support",
        authEyebrow: "YOUR PRIVATE TRADING SPACE",
        authMainTitle: "Your trades,<br><em>private to you.</em>",
        authDescription: "Every record is stored encrypted in your vault. Set your markets and habits, and start keeping your edge today.",
        authVaultNotice: "Trades and account records are protected with client-isolated AES-256-GCM encryption.",
        tabLogin: "Sign in",
        tabRegister: "Create account",
        tabForgot: "Forgot password",
        loginTitle: "Welcome back",
        loginSubtitle: "Sign in securely to your personal trading journal.",
        labelEmail: "Email",
        labelPassword: "Password",
        labelPasswordHint: "(At least 12 characters)",
        linkForgot: "Forgot password?",
        btnLogin: "Sign in",
        registerTitle: "Create your account",
        registerSubtitle: "Set up your journal in 1 minute to match your style.",
        labelFullName: "Full name",
        labelPhone: "Phone",
        legendMarkets: "Active Markets (Quick Pick)",
        labelIntensity: "Trading intensity",
        intensityOccasional: "Occasional",
        intensityWeekly: "A few times a week",
        intensityDaily: "A few times a day",
        intensityActive: "Very active (Scalp)",
        labelCurrency: "Report currency",
        labelSymbols: "Tracked pairs / symbols",
        labelSymbolsHint: "(Comma separated)",
        consentText: "I agree to the privacy policy and AES-256-GCM vault encryption. ",
        btnRegister: "Create Secure Account",
        forgotTitle: "Forgot Password",
        forgotSubtitle: "Enter your registered email to reset your password safely.",
        btnSendResetCode: "Request Reset Token",
        resetNewPwdTitle: "Set New Password",
        labelResetToken: "Reset Token",
        labelNewPassword: "New Password",
        btnApplyNewPassword: "Update Password & Sign In",
        dashEyebrow: "PRIVATE VAULT",
        dashGreeting: "Welcome",
        dashSubtitle: "Your trading journal is encrypted and strictly accessible by you.",
        btnExportCsv: "Export All CSV",
        btnExportJson: "JSON Backup",
        btnLogout: "Sign Out ↗",
        vaultTitle: "End-to-End Encrypted Private Vault",
        vaultDesc: "Profile and trade entries are kept on disk with dedicated encryption keys. Keep unencrypted exports in a safe place.",
        journalEyebrow: "NEW ENTRY",
        journalHeading: "Log New Trade",
        journalStep: "01 / LOG",
        tradeMarket: "Market",
        tradeSelect: "Select market",
        tradeSymbol: "Pair / Symbol",
        tradeSide: "Side",
        tradeOpenedAt: "Open Date",
        tradeClosedAt: "Close Date",
        tradeOrderType: "Order Type",
        tradeTimeframe: "Timeframe",
        tradeEntryPrice: "Entry Price",
        tradeExitPrice: "Exit Price",
        tradeQuantity: "Quantity / Contracts",
        tradeLeverage: "Leverage",
        tradeStopLoss: "Stop Loss",
        tradeTakeProfit: "Take Profit",
        tradeRiskPercent: "Planned Risk (%)",
        tradeFees: "Fees & Commissions",
        tradeFunding: "Funding / Swap",
        tradeStrategy: "Strategy & Rules (5W1H)",
        tradeSession: "Session",
        tradeMoodBefore: "Mood Before",
        tradeMoodAfter: "Mood After",
        tradeCurrency: "Reporting Currency",
        tradeNotes: "Trade Notes & Analysis",
        tradeFollowedPlan: "I adhered strictly to my trade plan",
        btnSaveTrade: "Save Trade",
        btnCancel: "Cancel",
        archiveEyebrow: "PERSONAL ARCHIVE",
        archiveHeading: "Trade History",
        searchPlaceholder: "Search symbol / strategy",
        filterAllMarkets: "All markets",
        btnExportSelectedCsv: "Export Selected CSV",
        btnExportSelectedJson: "Export Selected JSON",
        emptyTrades: "No trades logged yet.",
        footerTagline: "Personal trading journal",
        footerPrivacy: "Privacy & Terms"
    },
    fr: {
        plansAndSupport: "Forfaits & Support",
        authEyebrow: "ESPACE DE TRADING PERSONNEL",
        authMainTitle: "Vos trades,<br><em>en toute intimité.</em>",
        authDescription: "Tous vos enregistrements sont chiffrés. Choisissez vos marchés et commencez à consigner vos décisions dès aujourd'hui.",
        authVaultNotice: "Vos données sont protégées par un coffre-fort chiffré AES-256-GCM dédié.",
        tabLogin: "Connexion",
        tabRegister: "Créer un compte",
        tabForgot: "Mot de passe oublié",
        loginTitle: "Bon retour",
        loginSubtitle: "Connectez-vous en sécurité à votre journal de trading.",
        labelEmail: "E-mail",
        labelPassword: "Mot de passe",
        labelPasswordHint: "(Au moins 12 caractères)",
        linkForgot: "Mot de passe oublié ?",
        btnLogin: "Se connecter",
        registerTitle: "Créer votre compte",
        registerSubtitle: "Configurez votre journal en 1 minute selon vos habitudes.",
        labelFullName: "Nom et prénom",
        labelPhone: "Téléphone",
        legendMarkets: "Marchés actifs (Sélection rapide)",
        labelIntensity: "Intensité de trading",
        intensityOccasional: "Occasionnel",
        intensityWeekly: "Quelques fois par semaine",
        intensityDaily: "Quelques fois par jour",
        intensityActive: "Très actif (Scalp)",
        labelCurrency: "Devise du rapport",
        labelSymbols: "Paires / symboles suivis",
        labelSymbolsHint: "(Séparés par des virgules)",
        consentText: "J'accepte la politique de confidentialité et le chiffrement AES-256-GCM. ",
        btnRegister: "Créer un compte sécurisé",
        forgotTitle: "Mot de passe oublié",
        forgotSubtitle: "Indiquez votre adresse e-mail pour réinitialiser votre mot de passe.",
        btnSendResetCode: "Générer le code de réinitialisation",
        resetNewPwdTitle: "Nouveau mot de passe",
        labelResetToken: "Code / Jeton de réinitialisation",
        labelNewPassword: "Nouveau mot de passe",
        btnApplyNewPassword: "Mettre à jour & Se connecter",
        dashEyebrow: "ESPACE PERSONNEL",
        dashGreeting: "Bienvenue",
        dashSubtitle: "Votre journal de trading est chiffré et strictement accessible par vous.",
        btnExportCsv: "Exporter tout en CSV",
        btnExportJson: "Sauvegarde JSON",
        btnLogout: "Déconnexion ↗",
        vaultTitle: "Coffre-fort chiffré de bout en bout",
        vaultDesc: "Vos données restent chiffrées sur le serveur. Conservez vos fichiers d'export en lieu sûr.",
        journalEyebrow: "NOUVELLE ENTRÉE",
        journalHeading: "Ajouter au journal",
        journalStep: "01 / ENREGISTRER",
        tradeMarket: "Marché",
        tradeSelect: "Choisir un marché",
        tradeSymbol: "Paire / Symbole",
        tradeSide: "Sens",
        tradeOpenedAt: "Date d'ouverture",
        tradeClosedAt: "Date de fermeture",
        tradeOrderType: "Type d'ordre",
        tradeTimeframe: "Unité de temps",
        tradeEntryPrice: "Prix d'entrée",
        tradeExitPrice: "Prix de sortie",
        tradeQuantity: "Quantité / Contrats",
        tradeLeverage: "Effet de levier",
        tradeStopLoss: "Stop Loss",
        tradeTakeProfit: "Take Profit",
        tradeRiskPercent: "Risque prévu (%)",
        tradeFees: "Frais / Commissions",
        tradeFunding: "Financement / Swap",
        tradeStrategy: "Stratégie & Règles (5W1H)",
        tradeSession: "Session",
        tradeMoodBefore: "Émotion avant",
        tradeMoodAfter: "Émotion après",
        tradeCurrency: "Devise de compte",
        tradeNotes: "Notes et analyse du trade",
        tradeFollowedPlan: "J'ai suivi strictement mon plan de trading",
        btnSaveTrade: "Enregistrer le trade",
        btnCancel: "Annuler",
        archiveEyebrow: "ARCHIVES",
        archiveHeading: "Historique des trades",
        searchPlaceholder: "Rechercher symbole / stratégie",
        filterAllMarkets: "Tous les marchés",
        btnExportSelectedCsv: "Exporter la sélection en CSV",
        btnExportSelectedJson: "Exporter la sélection en JSON",
        emptyTrades: "Aucun trade enregistré pour le moment.",
        footerTagline: "Journal de trading personnel",
        footerPrivacy: "Confidentialité et conditions"
    },
    es: {
        plansAndSupport: "Planes y apoyo",
        authEyebrow: "TU ESPACIO PERSONAL DE TRADING",
        authMainTitle: "Tus operaciones,<br><em>totalmente privadas.</em>",
        authDescription: "Cada registro se almacena cifrado en tu bóveda. Configura tus mercados y hábitos, y perfecciona tu método hoy mismo.",
        authVaultNotice: "Tus datos están protegidos en una bóveda cifrada con AES-256-GCM dedicada.",
        tabLogin: "Iniciar sesión",
        tabRegister: "Crear cuenta",
        tabForgot: "Olvidé mi contraseña",
        loginTitle: "Bienvenido de nuevo",
        loginSubtitle: "Inicia sesión con seguridad en tu diario de trading.",
        labelEmail: "Correo electrónico",
        labelPassword: "Contraseña",
        labelPasswordHint: "(Mínimo 12 caracteres)",
        linkForgot: "¿Olvidaste tu contraseña?",
        btnLogin: "Iniciar sesión",
        registerTitle: "Crea tu cuenta",
        registerSubtitle: "Prepara tu diario en 1 minuto según tu estilo operativo.",
        labelFullName: "Nombre completo",
        labelPhone: "Teléfono",
        legendMarkets: "Mercados que operas (Selección rápida)",
        labelIntensity: "Frecuencia de operativa",
        intensityOccasional: "Ocasional",
        intensityWeekly: "Varias veces por semana",
        intensityDaily: "Varias veces al día",
        intensityActive: "Muy activo (Scalp)",
        labelCurrency: "Moneda del informe",
        labelSymbols: "Pares / símbolos seguidos",
        labelSymbolsHint: "(Separados por comas)",
        consentText: "Acepto la política de privacidad y el cifrado de datos con AES-256-GCM. ",
        btnRegister: "Crear Cuenta Segura",
        forgotTitle: "Recuperar Contraseña",
        forgotSubtitle: "Introduce tu correo para restablecer tu contraseña con total seguridad.",
        btnSendResetCode: "Generar Código de Recuperación",
        resetNewPwdTitle: "Establecer Nueva Contraseña",
        labelResetToken: "Código / Token de recuperación",
        labelNewPassword: "Nueva contraseña",
        btnApplyNewPassword: "Actualizar Contraseña e Iniciar Sesión",
        dashEyebrow: "ÁREA PRIVADA",
        dashGreeting: "Hola",
        dashSubtitle: "Tu diario de trading está cifrado y accesible solo por ti.",
        btnExportCsv: "Descargar todo en CSV",
        btnExportJson: "Copia de respaldo JSON",
        btnLogout: "Cerrar sesión ↗",
        vaultTitle: "Bóveda Personal Cifrada de Extremo a Extremo",
        vaultDesc: "Tus registros se guardan con claves de cifrado únicas. Guarda tus archivos exportados en un lugar seguro.",
        journalEyebrow: "NUEVA ENTRADA",
        journalHeading: "Registrar Operación",
        journalStep: "01 / REGISTRO",
        tradeMarket: "Mercado",
        tradeSelect: "Seleccionar mercado",
        tradeSymbol: "Par / Símbolo",
        tradeSide: "Dirección",
        tradeOpenedAt: "Fecha de apertura",
        tradeClosedAt: "Fecha de cierre",
        tradeOrderType: "Tipo de orden",
        tradeTimeframe: "Temporalidad",
        tradeEntryPrice: "Precio de entrada",
        tradeExitPrice: "Precio de salida",
        tradeQuantity: "Cantidad / Contratos",
        tradeLeverage: "Apalancamiento",
        tradeStopLoss: "Stop Loss",
        tradeTakeProfit: "Take Profit",
        tradeRiskPercent: "Riesgo previsto (%)",
        tradeFees: "Comisiones / Tarifas",
        tradeFunding: "Financiación / Swap",
        tradeStrategy: "Estrategia y Reglas (5W1H)",
        tradeSession: "Sesión",
        tradeMoodBefore: "Estado antes",
        tradeMoodAfter: "Estado después",
        tradeCurrency: "Moneda",
        tradeNotes: "Notas y análisis de la operación",
        tradeFollowedPlan: "Seguí estrictamente mi plan de trading",
        btnSaveTrade: "Guardar Operación",
        btnCancel: "Cancelar",
        archiveEyebrow: "ARCHIVO PERSONAL",
        archiveHeading: "Historial de Operaciones",
        searchPlaceholder: "Buscar símbolo / estrategia",
        filterAllMarkets: "Todos los mercados",
        btnExportSelectedCsv: "Exportar selección CSV",
        btnExportSelectedJson: "Exportar selección JSON",
        emptyTrades: "Aún no has registrado ninguna operación.",
        footerTagline: "Diario personal de trading",
        footerPrivacy: "Privacidad y términos"
    },
    de: {
        plansAndSupport: "Tarife & Support",
        authEyebrow: "DEIN PRIVATER TRADING-BEREICH",
        authMainTitle: "Deine Trades,<br><em>vollständig privat.</em>",
        authDescription: "Jeder Datensatz wird verschlüsselt in deinem Tresor aufbewahrt. Wähle deine Märkte und starte noch heute.",
        authVaultNotice: "Deine Daten werden durch eine isolierte AES-256-GCM-Verschlüsselung geschützt.",
        tabLogin: "Anmelden",
        tabRegister: "Konto erstellen",
        tabForgot: "Passwort vergessen",
        loginTitle: "Willkommen zurück",
        loginSubtitle: "Sicher in dein persönliches Trading-Tagebuch einloggen.",
        labelEmail: "E-Mail",
        labelPassword: "Passwort",
        labelPasswordHint: "(Mindestens 12 Zeichen)",
        linkForgot: "Passwort vergessen?",
        btnLogin: "Anmelden",
        registerTitle: "Konto erstellen",
        registerSubtitle: "Richte dein Tagebuch in 1 Minute für deinen Trading-Stil ein.",
        labelFullName: "Vollständiger Name",
        labelPhone: "Telefon",
        legendMarkets: "Aktive Märkte (Schnellauswahl)",
        labelIntensity: "Trading-Häufigkeit",
        intensityOccasional: "Gelegentlich",
        intensityWeekly: "Mehrmals pro Woche",
        intensityDaily: "Mehrmals täglich",
        intensityActive: "Sehr aktiv (Scalping)",
        labelCurrency: "Berichtswährung",
        labelSymbols: "Beobachtete Paare / Symbole",
        labelSymbolsHint: "(Mit Komma trennen)",
        consentText: "Ich stimme der Datenschutzerklärung und der AES-256-GCM-Verschlüsselung zu. ",
        btnRegister: "Sicheres Konto erstellen",
        forgotTitle: "Passwort vergessen",
        forgotSubtitle: "Gib deine registrierte E-Mail-Adresse ein, um dein Passwort sicher zurückzusetzen.",
        btnSendResetCode: "Reset-Code anfordern",
        resetNewPwdTitle: "Neues Passwort festlegen",
        labelResetToken: "Reset-Code / Token",
        labelNewPassword: "Neues Passwort",
        btnApplyNewPassword: "Passwort aktualisieren & Anmelden",
        dashEyebrow: "PRIVATER BEREICH",
        dashGreeting: "Willkommen",
        dashSubtitle: "Dein Trading-Tagebuch ist verschlüsselt und nur für dich zugänglich.",
        btnExportCsv: "Alles als CSV exportieren",
        btnExportJson: "JSON-Sicherung",
        btnLogout: "Abmelden ↗",
        vaultTitle: "Ende-zu-Ende verschlüsselter Tresor",
        vaultDesc: "Deine Daten bleiben auf dem Server sicher verschlüsselt. Bewahre unverschlüsselte Exporte an einem sicheren Ort auf.",
        journalEyebrow: "NEUER EINTRAG",
        journalHeading: "In das Tagebuch eintragen",
        journalStep: "01 / EINTRAG",
        tradeMarket: "Markt",
        tradeSelect: "Markt auswählen",
        tradeSymbol: "Paar / Symbol",
        tradeSide: "Richtung",
        tradeOpenedAt: "Eröffnungsdatum",
        tradeClosedAt: "Schlussdatum",
        tradeOrderType: "Ordertyp",
        tradeTimeframe: "Zeiteinheit",
        tradeEntryPrice: "Einstiegspreis",
        tradeExitPrice: "Ausstiegspreis",
        tradeQuantity: "Menge / Kontrakte",
        tradeLeverage: "Hebel",
        tradeStopLoss: "Stop Loss",
        tradeTakeProfit: "Take Profit",
        tradeRiskPercent: "Geplantes Risiko (%)",
        tradeFees: "Gebühren / Provision",
        tradeFunding: "Finanzierung / Swap",
        tradeStrategy: "Strategie & Regeln (5W1H)",
        tradeSession: "Handelszeit",
        tradeMoodBefore: "Gefühl vorher",
        tradeMoodAfter: "Gefühl nachher",
        tradeCurrency: "Berichtswährung",
        tradeNotes: "Notizen & Analyse",
        tradeFollowedPlan: "Ich habe mich strikt an meinen Trading-Plan gehalten",
        btnSaveTrade: "Trade speichern",
        btnCancel: "Abbrechen",
        archiveEyebrow: "PERSÖNLICHES ARCHIV",
        archiveHeading: "Trade-Historie",
        searchPlaceholder: "Symbol / Strategie suchen",
        filterAllMarkets: "Alle Märkte",
        btnExportSelectedCsv: "Auswahl als CSV exportieren",
        btnExportSelectedJson: "Auswahl als JSON exportieren",
        emptyTrades: "Bisher wurden keine Trades erfasst.",
        footerTagline: "Persönliches Trading-Tagebuch",
        footerPrivacy: "Datenschutz & Nutzungsbedingungen"
    }
};

// Universal Language Controller
function applyAccountLanguage(lang) {
    const dict = accountTranslations[lang] || accountTranslations.tr;
    document.documentElement.lang = lang;
    localStorage.setItem("ledgerly-language", lang);
    document.cookie = `ledgerly-language=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`;

    if (langSelect && langSelect.value !== lang) {
        langSelect.value = lang;
    }

    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (dict[key]) {
            if (dict[key].includes("<br>") || dict[key].includes("<em>") || dict[key].includes("<span>")) {
                el.innerHTML = dict[key];
            } else {
                el.textContent = dict[key];
            }
        }
    });

    if (profile) renderTrades();
}

// Theme Controller
function initAccountTheme() {
    const savedTheme = localStorage.getItem("ledgerly-theme") || "dark";
    document.documentElement.dataset.theme = savedTheme;
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
            document.documentElement.dataset.theme = nextTheme;
            localStorage.setItem("ledgerly-theme", nextTheme);
            document.cookie = `ledgerly-theme=${nextTheme}; Path=/; Max-Age=31536000; SameSite=Lax`;
        });
    }
}

// Ambient Cursor Glow Spotlight
function initCursorGlow() {
    let ticking = false;
    window.addEventListener("pointermove", (e) => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
                document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// Password Visibility Toggles
function initPasswordToggles() {
    document.querySelectorAll(".pwd-visibility-toggle").forEach((btn) => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-target");
            const input = document.getElementById(targetId);
            if (!input) return;
            const isPassword = input.type === "password";
            input.type = isPassword ? "text" : "password";
            btn.textContent = isPassword ? "🙈" : "👁️";
        });
    });
}

async function apiRequest(path, options = {}) {
    const headers = { "content-type": "application/json", ...options.headers };
    if (csrfToken && options.method && options.method !== "GET") headers["x-csrf-token"] = csrfToken;
    const response = await fetch(path, { credentials: "same-origin", cache: "no-store", ...options, headers });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `İstek başarısız (${response.status})`);
    return result;
}

function showAuthTab(tab) {
    const isLogin = tab === "login";
    const isRegister = tab === "register";
    const isForgot = tab === "forgot";

    loginTab.setAttribute("aria-selected", String(isLogin));
    registerTab.setAttribute("aria-selected", String(isRegister));
    forgotTab.setAttribute("aria-selected", String(isForgot));

    loginPanel.hidden = !isLogin;
    registerPanel.hidden = !isRegister;
    forgotPanel.hidden = !isForgot;
}

function showError(id, message) {
    const target = document.querySelector(id);
    if (!target) return;
    target.textContent = message;
    target.hidden = !message;
}

function showMessage(id, message) {
    const target = document.querySelector(id);
    if (!target) return;
    target.textContent = message;
    target.hidden = !message;
}

function showUserDashboard(user) {
    profile = user;
    authView.hidden = true;
    dashboardView.hidden = false;
    document.querySelector("#user-name").textContent = user.name;
    const preferenceSummary = document.querySelector("#user-preferences");
    const preferenceMarkets = (user.preferences?.markets || []).map((market) => marketNames[market] || market).join(", ");
    preferenceSummary.textContent = `Piyasalar: ${preferenceMarkets || "Belirtilmedi"} · İşlem yoğunluğu: ${intensityNames[user.preferences?.intensity] || "Belirtilmedi"} · Takip edilenler: ${(user.preferences?.symbols || []).join(", ") || "Henüz eklenmedi"}`;
    const currencySelect = tradeForm.elements.currency;
    if (user.preferences?.currency && [...currencySelect.options].some((option) => option.value === user.preferences.currency)) {
        currencySelect.value = user.preferences.currency;
    }
}

function calculatePnl(trade) {
    if (trade.exitPrice === null || trade.exitPrice === undefined || trade.exitPrice === "") return null;
    const direction = trade.side === "short" ? -1 : 1;
    const gross = (Number(trade.exitPrice) - Number(trade.entryPrice)) * Number(trade.quantity) * direction;
    return gross - (Number(trade.fees) || 0) - (Number(trade.funding) || 0);
}

function formatNumber(value, currency) {
    if (value === null || value === undefined || value === "") return "—";
    const curLang = localStorage.getItem("ledgerly-language") || "tr";
    return new Intl.NumberFormat(curLang, { maximumFractionDigits: 6 }).format(Number(value)) + (currency ? ` ${currency}` : "");
}

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    const curLang = localStorage.getItem("ledgerly-language") || "tr";
    const options = value.includes("T") ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" };
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(curLang, options).format(date);
}

function addMetric(container, label, value) {
    const metric = document.createElement("div");
    metric.className = "trade-metric";
    const title = document.createElement("small");
    title.textContent = label;
    const content = document.createElement("strong");
    content.textContent = value;
    metric.append(title, content);
    container.append(metric);
}

function renderTrades() {
    const query = document.querySelector("#trade-search").value.trim().toLowerCase();
    const market = document.querySelector("#market-filter").value;
    const filtered = trades.filter((trade) => (!market || trade.market === market) && (!query || `${trade.symbol} ${trade.strategy} ${trade.notes}`.toLowerCase().includes(query)));
    tradeList.replaceChildren();
    tradeEmpty.hidden = filtered.length !== 0;

    const curLang = localStorage.getItem("ledgerly-language") || "tr";
    const dict = accountTranslations[curLang] || accountTranslations.tr;

    filtered.forEach((trade) => {
        const card = document.createElement("article");
        card.className = "trade-card";
        const header = document.createElement("div");
        header.className = "trade-card-head";
        const titleGroup = document.createElement("div");

        const symbol = document.createElement("h3");
        symbol.className = "trade-symbol";
        symbol.textContent = trade.symbol;
        const meta = document.createElement("p");
        meta.className = "trade-meta";
        meta.textContent = `${marketNames[trade.market] || trade.market} · ${trade.side === "short" ? "Short" : "Long"} · ${trade.timeframe || "Zaman dilimi yok"} · ${formatDate(trade.openedAt)}`;
        titleGroup.append(symbol, meta);
        const pnl = calculatePnl(trade);
        const pnlLabel = document.createElement("strong");
        pnlLabel.className = `trade-pnl${pnl === null ? "" : pnl >= 0 ? " positive" : " negative"}`;
        pnlLabel.textContent = pnl === null ? (curLang === "en" ? "Open Position" : "Açık İşlem") : new Intl.NumberFormat(curLang, { style: "currency", currency: trade.currency || "TRY" }).format(pnl);
        header.append(titleGroup, pnlLabel);

        const grid = document.createElement("div");
        grid.className = "trade-card-grid";
        addMetric(grid, curLang === "en" ? "Entry" : "Giriş", formatNumber(trade.entryPrice));
        addMetric(grid, curLang === "en" ? "Exit" : "Çıkış", formatNumber(trade.exitPrice));
        addMetric(grid, curLang === "en" ? "Qty" : "Miktar", formatNumber(trade.quantity));
        addMetric(grid, curLang === "en" ? "SL / TP" : "Stop / Hedef", `${formatNumber(trade.stopLoss)} / ${formatNumber(trade.takeProfit)}`);
        addMetric(grid, curLang === "en" ? "Strategy" : "Strateji", trade.strategy || "—");
        addMetric(grid, curLang === "en" ? "Risk" : "Risk", trade.riskPercent === null ? "—" : `%${formatNumber(trade.riskPercent)}`);
        addMetric(grid, curLang === "en" ? "Session" : "Seans", trade.session || "—");
        addMetric(grid, curLang === "en" ? "Fees" : "Komisyon", formatNumber(trade.fees, trade.currency));
        addMetric(grid, curLang === "en" ? "Funding" : "Fonlama", formatNumber(trade.funding, trade.currency));
        addMetric(grid, curLang === "en" ? "Plan Met" : "Plana Uyum", trade.followedPlan ? (curLang === "en" ? "Yes" : "Evet") : (curLang === "en" ? "No" : "Hayır"));

        const actions = document.createElement("div");
        actions.className = "trade-card-actions";
        const select = document.createElement("input");
        select.type = "checkbox";
        select.checked = selectedTradeIds.has(trade.id);
        select.setAttribute("aria-label", `${trade.symbol} export selection`);
        select.addEventListener("change", () => {
            if (select.checked) selectedTradeIds.add(trade.id);
            else selectedTradeIds.delete(trade.id);
        });
        const edit = document.createElement("button");
        edit.type = "button";
        edit.textContent = curLang === "en" ? "Edit" : "Düzenle";
        edit.addEventListener("click", () => beginEdit(trade));
        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = curLang === "en" ? "Delete" : "Sil";
        remove.addEventListener("click", () => removeTrade(trade.id));
        actions.append(select, edit, remove);
        card.append(header, grid, actions);
        if (trade.notes) {
            const notes = document.createElement("p");
            notes.className = "trade-notes";
            notes.textContent = trade.notes;
            card.append(notes);
        }
        tradeList.append(card);
    });
}

async function loadTrades() {
    const result = await apiRequest("/api/trades");
    trades = result.trades || [];
    renderTrades();
}

function beginEdit(trade) {
    currentEditId = trade.id;
    Object.entries(trade).forEach(([key, value]) => {
        const field = tradeForm.elements.namedItem(key);
        if (!field) return;
        if (field.type === "checkbox") field.checked = Boolean(value);
        else field.value = value ?? "";
    });
    document.querySelector("#cancel-edit").hidden = false;
    const curLang = localStorage.getItem("ledgerly-language") || "tr";
    document.querySelector("#journal-heading").textContent = curLang === "en" ? "Edit Trade Record" : "Trade kaydını düzenle";
    tradeForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetTradeForm() {
    tradeForm.reset();
    tradeForm.elements.tradeId.value = "";
    currentEditId = "";
    tradeForm.elements.fees.value = "0";
    tradeForm.elements.funding.value = "0";
    document.querySelector("#cancel-edit").hidden = true;
    const curLang = localStorage.getItem("ledgerly-language") || "tr";
    document.querySelector("#journal-heading").textContent = curLang === "en" ? "Log New Trade" : "Trade günlüğüne ekle";
}

async function removeTrade(id) {
    const curLang = localStorage.getItem("ledgerly-language") || "tr";
    const confirmPrompt = curLang === "en" ? "Are you sure you want to delete this trade record?" : "Bu trade kaydını silmek istiyor musun?";
    if (!window.confirm(confirmPrompt)) return;
    try {
        await apiRequest(`/api/trades/${encodeURIComponent(id)}`, { method: "DELETE", body: "{}" });
        selectedTradeIds.delete(id);
        await loadTrades();
    } catch (error) {
        tradeMessage.textContent = error.message;
        tradeMessage.classList.add("is-error");
    }
}

function exportTrades(format, selectedOnly = false) {
    const curLang = localStorage.getItem("ledgerly-language") || "tr";
    const records = selectedOnly ? trades.filter((trade) => selectedTradeIds.has(trade.id)) : trades;
    if (!records.length) {
        tradeMessage.textContent = selectedOnly
            ? (curLang === "en" ? "Select trades to export first." : "Önce dışa aktarmak için trade seç.")
            : (curLang === "en" ? "No trades to export." : "Dışa aktarılacak trade yok.");
        tradeMessage.classList.add("is-error");
        return;
    }
    const fields = ["id", "market", "symbol", "side", "openedAt", "closedAt", "orderType", "timeframe", "entryPrice", "exitPrice", "quantity", "leverage", "stopLoss", "takeProfit", "riskPercent", "fees", "funding", "strategy", "session", "moodBefore", "moodAfter", "followedPlan", "currency", "notes", "createdAt", "updatedAt"];
    const csvEscape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const content = format === "json"
        ? JSON.stringify(records, null, 2)
        : [fields.map(csvEscape).join(","), ...records.map((record) => fields.map((field) => csvEscape(record[field])).join(","))].join("\r\n");
    const blob = new Blob(["\ufeff", content], { type: format === "json" ? "application/json;charset=utf-8" : "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ledgerly-trades-${new Date().toISOString().slice(0, 10)}.${format === "json" ? "json" : "csv"}`;
    link.click();
    URL.revokeObjectURL(link.href);
}

// Event Listeners
loginTab.addEventListener("click", () => showAuthTab("login"));
registerTab.addEventListener("click", () => showAuthTab("register"));
forgotTab.addEventListener("click", () => showAuthTab("forgot"));
document.querySelector("#goto-forgot-btn")?.addEventListener("click", () => showAuthTab("forgot"));

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showError("#login-error", "");
    try {
        const result = await apiRequest("/api/auth/login", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(loginForm))) });
        csrfToken = result.csrfToken;
        showUserDashboard(result.profile);
        await loadTrades();
    } catch (error) {
        showError("#login-error", error.message);
    }
});

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showError("#register-error", "");
    const formData = new FormData(registerForm);
    const data = Object.fromEntries(formData);
    data.markets = formData.getAll("markets");
    data.symbols = String(data.symbols || "").split(",").map((item) => item.trim()).filter(Boolean);
    data.privacyAccepted = formData.has("privacyAccepted");
    if (!data.markets.length) {
        showError("#register-error", "En az bir piyasa seçmelisin.");
        return;
    }
    try {
        const result = await apiRequest("/api/auth/register", { method: "POST", body: JSON.stringify(data) });
        csrfToken = result.csrfToken;
        showUserDashboard(result.profile);
        await loadTrades();
    } catch (error) {
        showError("#register-error", error.message);
    }
});

// Forgot Password Request
forgotRequestForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showError("#forgot-error", "");
    showMessage("#forgot-message", "");
    const email = document.querySelector("#forgot-email").value.trim();
    try {
        const result = await apiRequest("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
        showMessage("#forgot-message", result.message || "Sıfırlama kodu oluşturuldu.");
        resetCodeSection.hidden = false;
        if (result.resetToken) {
            document.querySelector("#reset-token").value = result.resetToken;
        }
    } catch (error) {
        showError("#forgot-error", error.message);
    }
});

// Forgot Password Reset
forgotResetForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showError("#reset-error", "");
    showMessage("#reset-success-message", "");
    const token = document.querySelector("#reset-token").value.trim();
    const password = document.querySelector("#reset-new-password").value;
    try {
        const result = await apiRequest("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });
        showMessage("#reset-success-message", result.message || "Şifreniz güncellendi. Giriş ekranına yönlendiriliyorsunuz...");
        setTimeout(() => {
            showAuthTab("login");
            const emailInput = document.querySelector("#login-email");
            const forgotEmail = document.querySelector("#forgot-email").value;
            if (forgotEmail) emailInput.value = forgotEmail;
        }, 1500);
    } catch (error) {
        showError("#reset-error", error.message);
    }
});

tradeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    tradeMessage.textContent = "";
    tradeMessage.classList.remove("is-error");
    const data = Object.fromEntries(new FormData(tradeForm));
    data.followedPlan = tradeForm.elements.followedPlan.checked;
    try {
        await apiRequest(currentEditId ? `/api/trades/${encodeURIComponent(currentEditId)}` : "/api/trades", { method: currentEditId ? "PUT" : "POST", body: JSON.stringify(data) });
        resetTradeForm();
        tradeMessage.textContent = "Trade kaydedildi.";
        await loadTrades();
    } catch (error) {
        tradeMessage.textContent = error.message;
        tradeMessage.classList.add("is-error");
    }
});

document.querySelector("#cancel-edit").addEventListener("click", resetTradeForm);
document.querySelector("#trade-search").addEventListener("input", renderTrades);
document.querySelector("#market-filter").addEventListener("change", renderTrades);
document.querySelector("#export-all-csv").addEventListener("click", () => exportTrades("csv"));
document.querySelector("#export-all-json").addEventListener("click", () => exportTrades("json"));
document.querySelector("#export-selected-csv").addEventListener("click", () => exportTrades("csv", true));
document.querySelector("#export-selected-json").addEventListener("click", () => exportTrades("json", true));

document.querySelector("#logout-button").addEventListener("click", async () => {
    try { await apiRequest("/api/auth/logout", { method: "POST", body: "{}" }); } catch { /* Session cleared server-side */ }
    csrfToken = "";
    profile = null;
    trades = [];
    selectedTradeIds.clear();
    dashboardView.hidden = true;
    authView.hidden = false;
    loginForm.reset();
    showAuthTab("login");
});

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    initAccountTheme();
    initCursorGlow();
    initPasswordToggles();

    const savedLanguage = localStorage.getItem("ledgerly-language") || "tr";
    if (langSelect) {
        langSelect.value = savedLanguage;
        langSelect.addEventListener("change", (e) => applyAccountLanguage(e.target.value));
    }
    applyAccountLanguage(savedLanguage);

    if (new URLSearchParams(location.search).get("mode") === "register") {
        showAuthTab("register");
    }

    apiRequest("/api/auth/me").then(async (result) => {
        csrfToken = result.csrfToken;
        showUserDashboard(result.profile);
        await loadTrades();
    }).catch(() => {});
});
