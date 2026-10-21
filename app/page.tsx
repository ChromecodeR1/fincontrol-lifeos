"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, CreditCard, Car, Activity,
  Brain, Settings, Plus, Bell, Eye, EyeOff, Lock, LogOut, Sparkles,
  CheckCircle2, AlertTriangle, Flame, LayoutDashboard, HandCoins,
  SlidersHorizontal, ArrowUpRight, ArrowDownRight, Check, X, Layers, UserCheck
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine
} from "recharts";
import SecondaryTabs from "./SecondaryTabs";
import {
  CostType, PaymentMethod, TxStatus, FlowType, CurveType, ThemeMode, ActiveTab,
  DashboardWidgetConfig, Transaction, CreditCardItem, StaticStatusItem,
  WishlistItem, BioLog, StravaStats, BrainNote, PersonalOKR, CustomAlertRule,
  ChartMilestone, ChartThemeColors, CategoryCatalogItem, StoredUserAccount,
  ToastMessage, SystemLogEntry, APP_VERSION, CHANGELOG_HISTORY,
  sanitizeText, normalizeStatus, formatBRL, addMonthsToDate,
  getPreviousMonthPrefix, hashPasswordPBKDF, validatePasswordRules,
  compressImageFileToBase64, DEFAULT_CATEGORIES_CATALOG, DEFAULT_PAYMENT_METHODS,
  DEFAULT_CATEGORY_COLORS, DEFAULT_CHART_THEME, DEFAULT_DASHBOARD_LAYOUT,
  getAutomaticStatus, INITIAL_CARDS, INITIAL_TRANSACTIONS, INITIAL_DEBTOR_MAP,
  INITIAL_STATIC_STATUS, INITIAL_MILESTONES, INITIAL_WISHLIST, INITIAL_BIO_LOGS,
  INITIAL_NOTES, INITIAL_OKRS, INITIAL_ALERT_RULES, HISTORICAL_INVESTMENTS,
  CustomCyberTooltip, ThemeSegmentedControl
} from "./lifeos-data";

export default function FinControlLifeOS() {
  const [isHydrated, setIsHydrated] = useState(false);

  // Autenticação e Contas Persistidas
  const [accounts, setAccounts] = useState<StoredUserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string>("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Interface e Tema
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [themeMode, setThemeMode] = useState<ThemeMode>("tradicional");
  const [privacyMode, setPrivacyMode] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("2026-10");
  const [curveType, setCurveType] = useState<CurveType>("monotone");
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [bellTab, setBellTab] = useState<"unread" | "read">("unread");
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Dados Principais
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [debtorMap, setDebtorMap] = useState<Record<string, string>>(INITIAL_DEBTOR_MAP);
  const [cards, setCards] = useState<CreditCardItem[]>(INITIAL_CARDS);
  const [staticStatus, setStaticStatus] = useState<StaticStatusItem[]>(INITIAL_STATIC_STATUS);
  const [wishlist, setWishlist] = useState<WishlistItem[]>(INITIAL_WISHLIST);
  const [bioLogs, setBioLogs] = useState<BioLog[]>(INITIAL_BIO_LOGS);
  const [notes, setNotes] = useState<BrainNote[]>(INITIAL_NOTES);
  const [okrs, setOkrs] = useState<PersonalOKR[]>(INITIAL_OKRS);
  const [alertRules, setAlertRules] = useState<CustomAlertRule[]>(INITIAL_ALERT_RULES);
  const [milestones] = useState<ChartMilestone[]>(INITIAL_MILESTONES);
  const [dashboardLayout] = useState<DashboardWidgetConfig[]>(DEFAULT_DASHBOARD_LAYOUT);

  // Catálogos e Cores
  const [categoriesCatalog, setCategoriesCatalog] = useState<CategoryCatalogItem[]>(DEFAULT_CATEGORIES_CATALOG);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>(DEFAULT_CATEGORY_COLORS);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(DEFAULT_PAYMENT_METHODS);
  const [chartTheme, setChartTheme] = useState<ChartThemeColors>(DEFAULT_CHART_THEME);

  // Metas
  const [personalBudgetLimit, setPersonalBudgetLimit] = useState(350);
  const [monthlyInvestmentGoal, setMonthlyInvestmentGoal] = useState(1450);
  const [patrimonyTarget, setPatrimonyTarget] = useState(25000);
  const [annualRunGoalKm, setAnnualRunGoalKm] = useState(600);

  // Integrações e Diagnósticos
  const [sheetApiUrl, setSheetApiUrl] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [sheetsSyncStatus, setSheetsSyncStatus] = useState<{
    state: "idle" | "success" | "error";
    message: string;
    timestamp?: string;
  }>({ state: "idle", message: "" });

  const [stravaConfig, setStravaConfig] = useState({
    athleteId: "",
    clientId: "",
    clientSecret: "",
    refreshToken: ""
  });
  const [stravaStats, setStravaStats] = useState<StravaStats>({
    ytdKm: 342,
    ytdRuns: 48,
    allTimeKm: 1280,
    allTimeRuns: 195,
    lastSync: "Local"
  });
  const [isSyncingStrava, setIsSyncingStrava] = useState(false);
  const [stravaSyncStatus, setStravaSyncStatus] = useState<{
    state: "idle" | "success" | "error";
    message: string;
    timestamp?: string;
  }>({ state: "idle", message: "" });

  // Logs
  const [systemLogs, setSystemLogs] = useState<SystemLogEntry[]>([]);
  const [logFilter, setLogFilter] = useState("ALL");

  // Modal de Lançamento e Formulários
  const [showTxModal, setShowTxModal] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTx, setNewTx] = useState({
    date: "2026-10-20",
    description: "",
    amount: "",
    category: "Alimentação",
    costType: "Variável" as CostType,
    paymentMethod: "PIX",
    cardUsed: "Nubank Ultravioleta",
    status: "Pago" as TxStatus,
    km: "",
    liters: "",
    installments: "1",
    debtor: ""
  });

  // Estados de Formulários Secundários
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [newStatusItem, setNewStatusItem] = useState({ title: "", type: "Custo Fixo" as StaticStatusItem["type"], amount: "", notes: "" });
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [newCard, setNewCard] = useState({ name: "", brand: "Mastercard Black", limit: "", closingDay: "25", dueDay: "5", logoUrl: "" });
  const [editingWishId, setEditingWishId] = useState<string | null>(null);
  const [newWish, setNewWish] = useState({ title: "", institution: "Nubank Ultravioleta", targetAmount: "", savedAmount: "0", priority: "Média" as WishlistItem["priority"] });
  const [editingBioId, setEditingBioId] = useState<string | null>(null);
  const [newBio, setNewBio] = useState({ date: "2026-10-20", weight: "", bf: "" });
  const [newOkr, setNewOkr] = useState({ title: "", category: "Finanças", current: "", target: "", unit: "R$" });
  const [selectedNoteTag, setSelectedNoteTag] = useState("ALL");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "", tag: "#Ideias" as BrainNote["tag"] });
  const [newMethodName, setNewMethodName] = useState("");
  const [newCategoryForm, setNewCategoryForm] = useState({ name: "", flow: "EXPENSE" as FlowType, isAuto: false, color: "#6366f1" });
  const [newAlert, setNewAlert] = useState({ title: "", type: "ODOMETER_KM" as CustomAlertRule["type"], targetValue: "", warningLead: "500" });

  // Notificações Toast + Logs
  const notify = useCallback(
    (title: string, subtitle?: string, type: "success" | "warning" | "info" = "info", logCategory?: SystemLogEntry["category"]) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, subtitle, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);

      if (logCategory) {
        const entry: SystemLogEntry = {
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toLocaleString("pt-BR"),
          user: currentUser ? currentUser : "Sistema",
          category: logCategory,
          action: title,
          details: subtitle ? subtitle : ""
        };
        setSystemLogs((prev) => {
          const updated = [entry, ...prev].slice(0, 200);
          localStorage.setItem("lifeos_system_logs_v8", JSON.stringify(updated));
          return updated;
        });
      }
    },
    [currentUser]
  );

  // Hidratação Inicial Segura (Sem apagar contas nem deslogar no F5)
  useEffect(() => {
    try {
      // 1. Contas e Sessão Ativa (Lê tanto a chave nova quanto possíveis chaves anteriores)
      const rawAccV8 = localStorage.getItem("lifeos_accounts_v8") || localStorage.getItem("lifeos_accounts_v4") || localStorage.getItem("lifeos_accounts");
      let loadedAccounts: StoredUserAccount[] = [];
      if (rawAccV8) {
        loadedAccounts = JSON.parse(rawAccV8);
        setAccounts(loadedAccounts);
      }

      const savedSession = localStorage.getItem("lifeos_active_session");
      if (savedSession && loadedAccounts.some((a) => a.username.toLowerCase() === savedSession.toLowerCase())) {
        const matched = loadedAccounts.find((a) => a.username.toLowerCase() === savedSession.toLowerCase());
        if (matched) {
          setCurrentUser(matched.username);
          setCurrentUserAvatar(matched.avatarUrl || "");
        }
      } else if (loadedAccounts.length > 0) {
        setAuthMode("login");
        setAuthUsername(loadedAccounts[0].username);
      } else {
        setAuthMode("register");
      }

      // 2. Notificações já lidas
      const savedReadNotifs = localStorage.getItem("lifeos_read_notifications_v1");
      if (savedReadNotifs) setReadNotificationIds(JSON.parse(savedReadNotifs));

      // 3. Dados do ERP
      const sTxs = localStorage.getItem("lifeos_txs_v8");
      if (sTxs) setTransactions(JSON.parse(sTxs));
      const sDebtors = localStorage.getItem("lifeos_debtors_v8");
      if (sDebtors) setDebtorMap(JSON.parse(sDebtors));
      const sCards = localStorage.getItem("lifeos_cards_v8");
      if (sCards) setCards(JSON.parse(sCards));
      const sStatus = localStorage.getItem("lifeos_status_v8");
      if (sStatus) setStaticStatus(JSON.parse(sStatus));
      const sWish = localStorage.getItem("lifeos_wish_v8");
      if (sWish) setWishlist(JSON.parse(sWish));
      const sBio = localStorage.getItem("lifeos_bio_v8");
      if (sBio) setBioLogs(JSON.parse(sBio));
      const sNotes = localStorage.getItem("lifeos_notes_v8");
      if (sNotes) setNotes(JSON.parse(sNotes));
      const sOkrs = localStorage.getItem("lifeos_okrs_v8");
      if (sOkrs) setOkrs(JSON.parse(sOkrs));
      const sAlerts = localStorage.getItem("lifeos_alerts_v8");
      if (sAlerts) setAlertRules(JSON.parse(sAlerts));
      const sLogs = localStorage.getItem("lifeos_system_logs_v8");
      if (sLogs) setSystemLogs(JSON.parse(sLogs));

      // 4. Aparência e Integrações (Sem disparar sync automático ao carregar/digitar)
      const sTheme = localStorage.getItem("lifeos_theme_mode") as ThemeMode | null;
      if (sTheme) setThemeMode(sTheme);
      const sUrl = localStorage.getItem("lifeos_sheets_url");
      if (sUrl) setSheetApiUrl(sUrl);
      const sStrava = localStorage.getItem("lifeos_strava_config");
      if (sStrava) setStravaConfig(JSON.parse(sStrava));
      const sStravaStats = localStorage.getItem("lifeos_strava_stats");
      if (sStravaStats) setStravaStats(JSON.parse(sStravaStats));
    } catch (e) {
      console.error("Erro ao hidratar dados:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const changeThemeMode = (m: ThemeMode) => {
    setThemeMode(m);
    localStorage.setItem("lifeos_theme_mode", m);
  };

  // Helpers de Persistência
  const saveTransactions = useCallback(
    async (updated: Transaction[], syncWithCloud = true) => {
      setTransactions(updated);
      localStorage.setItem("lifeos_txs_v8", JSON.stringify(updated));

      // Se a URL do Google Sheets estiver configurada e já tiver sido validada ou ativada, envia a atualização em segundo plano
      if (syncWithCloud && sheetApiUrl && sheetApiUrl.startsWith("https://script.google.com/macros/s/")) {
        try {
          const res = await fetch("/api/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sheetApiUrl,
              payload: { action: "syncAll", transactions: updated }
            })
          });
          const data = await res.json();
          if (!res.ok || data.status === "error") {
            setSheetsSyncStatus({
              state: "error",
              message: data.message || "Falha ao gravar lançamento na planilha.",
              timestamp: new Date().toLocaleTimeString("pt-BR")
            });
          } else {
            setSheetsSyncStatus({
              state: "success",
              message: `Planilha atualizada automaticamente (${updated.length} lançamentos sincronizados).`,
              timestamp: new Date().toLocaleTimeString("pt-BR")
            });
          }
        } catch (err: any) {
          setSheetsSyncStatus({
            state: "error",
            message: err?.message || "Erro de rede ao tentar gravar na planilha.",
            timestamp: new Date().toLocaleTimeString("pt-BR")
          });
        }
      }
    },
    [sheetApiUrl]
  );

  // Sincronização Manual Google Sheets (Baixar + Mesclar + Enviar)
  const syncFromGoogleSheets = async () => {
    if (!sheetApiUrl.trim()) {
      const msg = "Você ainda não preencheu a URL do Google Apps Script.";
      setSheetsSyncStatus({ state: "error", message: msg, timestamp: new Date().toLocaleTimeString("pt-BR") });
      notify("URL Vazia", msg, "warning");
      return;
    }

    setIsSyncing(true);
    try {
      const res = await fetch(`/api/sync?url=${encodeURIComponent(sheetApiUrl.trim())}`);
      const data = await res.json();

      if (!res.ok || data.status === "error") {
        const reason = data.message || "Não foi possível conectar à planilha. Verifique a URL e as permissões.";
        setSheetsSyncStatus({
          state: "error",
          message: reason,
          timestamp: new Date().toLocaleTimeString("pt-BR")
        });
        notify("Falha no Google Sheets", reason, "warning", "CONFIG");
        return;
      }

      // Mescla os lançamentos da planilha com os locais
      const cloudTxs: Transaction[] = Array.isArray(data.transactions) ? data.transactions : [];
      const mergedMap = new Map<string, Transaction>();
      transactions.forEach((t) => mergedMap.set(t.id, t));
      cloudTxs.forEach((ct) => {
        if (!ct.id) return;
        const local = mergedMap.get(ct.id);
        if (!local) {
          mergedMap.set(ct.id, { ...ct, status: normalizeStatus(ct.status) });
        } else {
          const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
          const cloudTime = ct.updatedAt ? new Date(ct.updatedAt).getTime() : 0;
          if (cloudTime > localTime) {
            mergedMap.set(ct.id, { ...ct, status: normalizeStatus(ct.status) });
          }
        }
      });

      const finalTxs = Array.from(mergedMap.values()).sort((a, b) => b.date.localeCompare(a.date));
      setTransactions(finalTxs);
      localStorage.setItem("lifeos_txs_v8", JSON.stringify(finalTxs));

      // Agora envia a lista consolidada de volta para garantir que a planilha tenha todos os lançamentos locais
      const postRes = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetApiUrl: sheetApiUrl.trim(),
          payload: { action: "syncAll", transactions: finalTxs }
        })
      });
      const postData = await postRes.json();

      if (!postRes.ok || postData.status === "error") {
        const postReason = postData.message || "Leitura funcionou, mas houve falha ao gravar os lançamentos na planilha.";
        setSheetsSyncStatus({
          state: "error",
          message: postReason,
          timestamp: new Date().toLocaleTimeString("pt-BR")
        });
        notify("Erro ao Gravar na Planilha", postReason, "warning", "CONFIG");
        return;
      }

      const okMsg = `Sincronização concluída! ${finalTxs.length} lançamentos estão salvos e espelhados na aba 'Lancamentos' da sua planilha.`;
      setSheetsSyncStatus({
        state: "success",
        message: okMsg,
        timestamp: new Date().toLocaleTimeString("pt-BR")
      });
      notify("Google Sheets Sincronizado!", okMsg, "success", "CONFIG");
    } catch (err: any) {
      const netMsg = `Erro de comunicação: ${err?.message || "Falha inesperada"}`;
      setSheetsSyncStatus({ state: "error", message: netMsg, timestamp: new Date().toLocaleTimeString("pt-BR") });
      notify("Erro no Google Sheets", netMsg, "warning", "CONFIG");
    } finally {
      setIsSyncing(false);
    }
  };

  const pushAllToGoogleSheets = async () => {
    if (!sheetApiUrl.trim()) {
      const msg = "Informe a URL do Google Apps Script antes de enviar.";
      setSheetsSyncStatus({ state: "error", message: msg, timestamp: new Date().toLocaleTimeString("pt-BR") });
      notify("URL Vazia", msg, "warning");
      return;
    }
    setIsSyncing(true);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetApiUrl: sheetApiUrl.trim(),
          payload: { action: "syncAll", transactions }
        })
      });
      const data = await res.json();
      if (!res.ok || data.status === "error") {
        const errReason = data.message || "Falha ao gravar lançamentos na planilha.";
        setSheetsSyncStatus({ state: "error", message: errReason, timestamp: new Date().toLocaleTimeString("pt-BR") });
        notify("Falha ao Enviar p/ Planilha", errReason, "warning", "CONFIG");
      } else {
        const okMsg = `Todos os ${transactions.length} lançamentos foram gravados na planilha com sucesso!`;
        setSheetsSyncStatus({ state: "success", message: okMsg, timestamp: new Date().toLocaleTimeString("pt-BR") });
        notify("Lançamentos Enviados!", okMsg, "success", "FINANCE");
      }
    } catch (err: any) {
      const msg = `Erro ao enviar: ${err?.message || "Falha de rede"}`;
      setSheetsSyncStatus({ state: "error", message: msg, timestamp: new Date().toLocaleTimeString("pt-BR") });
      notify("Erro ao Enviar", msg, "warning");
    } finally {
      setIsSyncing(false);
    }
  };

  // Sincronização Strava com Diagnóstico Detalhado
  const syncStravaFromApi = async () => {
    const { athleteId, clientId, clientSecret, refreshToken } = stravaConfig;
    const missing: string[] = [];
    if (!athleteId.trim()) missing.push("Athlete ID");
    if (!clientId.trim()) missing.push("Client ID");
    if (!clientSecret.trim()) missing.push("Client Secret");
    if (!refreshToken.trim()) missing.push("Refresh Token");

    if (missing.length > 0) {
      const msg = `Campos obrigatórios faltando: ${missing.join(", ")}. Preencha todos os 4 campos no painel do Strava.`;
      setStravaSyncStatus({ state: "error", message: msg, timestamp: new Date().toLocaleTimeString("pt-BR") });
      notify("Configuração Strava Incompleta", msg, "warning");
      return;
    }

    setIsSyncingStrava(true);
    try {
      const tokenRes = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId.trim(),
          client_secret: clientSecret.trim(),
          refresh_token: refreshToken.trim(),
          grant_type: "refresh_token"
        })
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        const errDetail = tokenData.message
          ? `Strava recusou as credenciais (${tokenData.message}). Verifique se o Client ID, Client Secret e Refresh Token estão corretos.`
          : "Não foi possível obter o token de acesso do Strava. Confira suas chaves.";
        setStravaSyncStatus({ state: "error", message: errDetail, timestamp: new Date().toLocaleTimeString("pt-BR") });
        notify("Falha na Autenticação Strava", errDetail, "warning", "CONFIG");
        return;
      }

      const statsRes = await fetch(`https://www.strava.com/api/v3/athletes/${athleteId.trim()}/stats`, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const statsData = await statsRes.json();

      if (!statsRes.ok || !statsData.ytd_run_totals) {
        const errStats = statsData.message
          ? `Erro ao buscar estatísticas do Atleta ID ${athleteId}: ${statsData.message}. Verifique se o Athlete ID contém apenas os números do seu perfil.`
          : "O Strava autenticou, mas não encontrou o Athlete ID informado.";
        setStravaSyncStatus({ state: "error", message: errStats, timestamp: new Date().toLocaleTimeString("pt-BR") });
        notify("Erro no Athlete ID do Strava", errStats, "warning", "CONFIG");
        return;
      }

      const updatedStats: StravaStats = {
        ytdKm: Math.round((statsData.ytd_run_totals.distance || 0) / 1000),
        ytdRuns: statsData.ytd_run_totals.count || 0,
        allTimeKm: Math.round((statsData.all_run_totals?.distance || 0) / 1000),
        allTimeRuns: statsData.all_run_totals?.count || 0,
        lastSync: new Date().toLocaleString("pt-BR")
      };

      setStravaStats(updatedStats);
      localStorage.setItem("lifeos_strava_stats", JSON.stringify(updatedStats));

      const okMsg = `Dados importados! Ano: ${updatedStats.ytdKm} km (${updatedStats.ytdRuns} corridas) • Total: ${updatedStats.allTimeKm} km.`;
      setStravaSyncStatus({ state: "success", message: okMsg, timestamp: new Date().toLocaleTimeString("pt-BR") });
      notify("Strava Sincronizado!", okMsg, "success", "CONFIG");
    } catch (err: any) {
      const netErr = `Falha de conexão com a API do Strava: ${err?.message || "Verifique sua internet."}`;
      setStravaSyncStatus({ state: "error", message: netErr, timestamp: new Date().toLocaleTimeString("pt-BR") });
      notify("Erro de Rede Strava", netErr, "warning");
    } finally {
      setIsSyncingStrava(false);
    }
  };

  // Autenticação: Login e Registro
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const cleanUser = sanitizeText(authUsername);
    if (!cleanUser || !authPassword) {
      setAuthError("Preencha o nome de usuário e a senha.");
      return;
    }

    if (authMode === "register") {
      const rules = validatePasswordRules(authPassword);
      if (!rules.minLength) {
        setAuthError("A senha precisa ter pelo menos 8 caracteres.");
        return;
      }
      if (accounts.some((a) => a.username.toLowerCase() === cleanUser.toLowerCase())) {
        setAuthError("Este usuário já existe neste navegador. Clique na aba 'Entrar na Minha Conta' acima.");
        return;
      }
      const salt = `salt_${Date.now()}`;
      const passwordHash = await hashPasswordPBKDF(authPassword, salt);
      const newAcc: StoredUserAccount = {
        username: cleanUser,
        passwordHash,
        salt,
        createdAt: new Date().toISOString()
      };
      const updatedAccounts = [...accounts, newAcc];
      setAccounts(updatedAccounts);
      localStorage.setItem("lifeos_accounts_v8", JSON.stringify(updatedAccounts));
      localStorage.setItem("lifeos_active_session", cleanUser);
      setCurrentUser(cleanUser);
      notify("Conta Criada e Salva!", `Bem-vindo ao FinControl, ${cleanUser}. Sua sessão permanecerá ativa neste dispositivo.`, "success", "AUTH");
    } else {
      const found = accounts.find((a) => a.username.toLowerCase() === cleanUser.toLowerCase());
      if (!found) {
        setAuthError("Usuário não encontrado neste navegador. Verifique o nome ou crie sua conta.");
        return;
      }
      const checkHash = await hashPasswordPBKDF(authPassword, found.salt);
      if (checkHash !== found.passwordHash) {
        setAuthError("Senha incorreta. Tente novamente.");
        return;
      }
      localStorage.setItem("lifeos_active_session", found.username);
      setCurrentUser(found.username);
      setCurrentUserAvatar(found.avatarUrl || "");
      notify("Acesso Liberado", `Bem-vindo de volta, ${found.username}!`, "success", "AUTH");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("lifeos_active_session");
    setCurrentUser(null);
    setAuthPassword("");
    setAuthMode("login");
  };

  // Classificação de Fluxo
  const getFlowType = useCallback(
    (category: string): FlowType => {
      const found = categoriesCatalog.find((c) => c.name === category);
      return found ? found.flow : "EXPENSE";
    },
    [categoriesCatalog]
  );

  // Filtro de Lançamentos por Mês e Busca
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => (selectedMonth === "ALL" ? true : t.date.startsWith(selectedMonth)))
      .filter((t) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.paymentMethod.toLowerCase().includes(q) ||
          (t.debtor && t.debtor.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, selectedMonth, searchQuery]);

  // Cálculos do Mês Atual vs Anterior
  const monthSummary = useMemo(() => {
    const calcFor = (list: Transaction[]) => {
      const income = list.filter((t) => getFlowType(t.category) === "INCOME").reduce((a, b) => a + b.amount, 0);
      const expense = list.filter((t) => getFlowType(t.category) === "EXPENSE").reduce((a, b) => a + b.amount, 0);
      const invested = list.filter((t) => getFlowType(t.category) === "INVESTMENT").reduce((a, b) => a + b.amount, 0);
      const personalSpent = list.filter((t) => t.category === "Gastos Pessoais / Besteiras").reduce((a, b) => a + b.amount, 0);
      return { income, expense, invested, balance: income - expense - invested, personalSpent };
    };

    const current = calcFor(filteredTransactions);
    const prevPrefix = getPreviousMonthPrefix(selectedMonth);
    const prevList = prevPrefix ? transactions.filter((t) => t.date.startsWith(prevPrefix)) : [];
    const prev = calcFor(prevList);

    const pctDiff = (currVal: number, prevVal: number) => {
      if (!prevVal) return 0;
      return Math.round(((currVal - prevVal) / prevVal) * 100);
    };

    return {
      ...current,
      incomeDiff: pctDiff(current.income, prev.income),
      expenseDiff: pctDiff(current.expense, prev.expense),
      investedDiff: pctDiff(current.invested, prev.invested)
    };
  }, [filteredTransactions, transactions, selectedMonth, getFlowType]);

  // Evolução Patrimonial Dinâmica
  const patrimonyChartData = useMemo(() => {
    const base = [...HISTORICAL_INVESTMENTS];
    let runningTotal = base[base.length - 1]?.acumulado || 8200;

    const monthsMap = new Map<string, number>();
    transactions
      .filter((t) => getFlowType(t.category) === "INVESTMENT")
      .forEach((t) => {
        const m = t.date.slice(0, 7);
        if (m > "2026-08") {
          monthsMap.set(m, (monthsMap.get(m) || 0) + t.amount);
        }
      });

    Array.from(monthsMap.keys())
      .sort()
      .forEach((m) => {
        const ap = monthsMap.get(m) || 0;
        runningTotal += ap;
        const [y, mm] = m.split("-");
        base.push({ month: m, label: `${mm}/${y.slice(2)}`, aportado: ap, acumulado: runningTotal });
      });

    return base;
  }, [transactions, getFlowType]);

  // Gráfico de Categorias
  const categoryChartData = useMemo(() => {
    const map = new Map<string, number>();
    filteredTransactions
      .filter((t) => getFlowType(t.category) === "EXPENSE")
      .forEach((t) => {
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
      });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value, color: categoryColors[name] || "#6366f1" }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions, getFlowType, categoryColors]);

  // Métricas de Cartões
  const creditChartData = useMemo(() => {
    return cards.map((c) => {
      const usado = transactions
        .filter((t) => t.paymentMethod === "Cartão de Crédito" && t.cardUsed === c.name && t.status === "Pendente / Na Fatura")
        .reduce((a, b) => a + b.amount, 0);
      return {
        name: c.name,
        usado: Number(usado.toFixed(2)),
        disponivel: Math.max(0, Number((c.limit - usado).toFixed(2)))
      };
    });
  }, [cards, transactions]);

  // Métricas do Veículo (Auto)
  const autoMetrics = useMemo(() => {
    const autoCategories = new Set(categoriesCatalog.filter((c) => c.isAuto).map((c) => c.name));
    const autoTxs = transactions
      .filter((t) => autoCategories.has(t.category) || t.km != null)
      .sort((a, b) => a.date.localeCompare(b.date));

    const kms = autoTxs.map((t) => t.km || 0).filter((k) => k > 0);
    const maxKm = kms.length ? Math.max(...kms) : 0;
    const minKm = kms.length ? Math.min(...kms) : 0;
    const distanceDriven = Math.max(0, maxKm - minKm);
    const totalLiters = autoTxs.reduce((a, b) => a + (b.liters || 0), 0);
    const avgKmPerLiter = totalLiters > 0 && distanceDriven > 0 ? distanceDriven / totalLiters : 11.4;
    const fuelTotal = autoTxs.filter((t) => t.category.includes("Gasolina")).reduce((a, b) => a + b.amount, 0);
    const maintenanceTotal = autoTxs.filter((t) => !t.category.includes("Gasolina")).reduce((a, b) => a + b.amount, 0);
    const totalAutoSpent = fuelTotal + maintenanceTotal;
    const costPerKm = distanceDriven > 0 ? totalAutoSpent / distanceDriven : 0;

    return {
      autoTxs: autoTxs.slice().reverse(),
      kmRecords: autoTxs.filter((t) => t.km).map((t) => ({ date: t.date, km: t.km })),
      maxKm,
      distanceDriven,
      avgKmPerLiter,
      fuelTotal,
      maintenanceTotal,
      totalAutoSpent,
      costPerKm
    };
  }, [transactions, categoriesCatalog]);

  // Valores a Receber 2.0
  const receivableItems = useMemo(() => {
    return transactions
      .filter((t) => t.category === "A Receber")
      .map((t) => {
        const debtorName = t.debtor ? t.debtor : debtorMap[t.id] ? debtorMap[t.id] : "";
        const effectivePaid = t.status === "Pago" ? t.amount : Math.min(t.amount, t.paidAmount || 0);
        const remaining = Math.max(0, Number((t.amount - effectivePaid).toFixed(2)));
        return { ...t, debtorName, effectivePaid, remaining };
      });
  }, [transactions, debtorMap]);

  const receivablesAnalytics = useMemo(() => {
    let totalOpen = 0;
    let totalPaid = 0;
    let totalLoaned = 0;
    const byPersonMap = new Map<string, { person: string; aberto: number; pago: number; totalEmprestado: number }>();

    receivableItems.forEach((item) => {
      totalOpen += item.remaining;
      totalPaid += item.effectivePaid;
      totalLoaned += item.amount;
      const pName = item.debtorName.trim() ? item.debtorName.trim() : "Não Atribuído";
      const curr = byPersonMap.get(pName) || { person: pName, aberto: 0, pago: 0, totalEmprestado: 0 };
      curr.aberto = Number((curr.aberto + item.remaining).toFixed(2));
      curr.pago = Number((curr.pago + item.effectivePaid).toFixed(2));
      curr.totalEmprestado = Number((curr.totalEmprestado + item.amount).toFixed(2));
      byPersonMap.set(pName, curr);
    });

    const list = Array.from(byPersonMap.values());
    return { totalOpen, totalPaid, totalLoaned, openByPerson: list, historyByPerson: list };
  }, [receivableItems]);

  // Central de Notificações Inteligentes (Com ID único e suporte a "Já vista")
  const activeNotifications = useMemo(() => {
    const list: { id: string; title: string; detail: string; severity: "warning" | "info" }[] = [];

    // 1. Alerta de Orçamento Pessoal
    if (monthSummary.personalSpent >= personalBudgetLimit * 0.8) {
      list.push({
        id: `notif-budget-${selectedMonth}-${Math.floor(monthSummary.personalSpent / 50)}`,
        title: monthSummary.personalSpent > personalBudgetLimit ? "Limite de Gastos Pessoais Ultrapassado!" : "Atenção ao Termômetro Pessoal",
        detail: `Você utilizou ${formatBRL(monthSummary.personalSpent)} de ${formatBRL(personalBudgetLimit)} em ${selectedMonth}.`,
        severity: monthSummary.personalSpent > personalBudgetLimit ? "warning" : "info"
      });
    }

    // 2. Alertas do Odômetro / Revisão
    alertRules.forEach((rule) => {
      if (rule.type === "ODOMETER_KM") {
        const diff = rule.targetValue - autoMetrics.maxKm;
        if (diff <= rule.warningLead) {
          list.push({
            id: `notif-rule-${rule.id}`,
            title: diff <= 0 ? `Revisão Vencida: ${rule.title}` : `Revisão Próxima: ${rule.title}`,
            detail: diff <= 0 ? `O veículo atingiu ${autoMetrics.maxKm} km (Alvo: ${rule.targetValue} km).` : `Faltam apenas ${diff} km para ${rule.title} (${rule.targetValue} km).`,
            severity: diff <= 0 ? "warning" : "info"
          });
        }
      }
    });

    // 3. Alerta de Valores a Receber em Aberto
    if (receivablesAnalytics.totalOpen > 0) {
      list.push({
        id: `notif-receivables-${receivablesAnalytics.totalOpen}`,
        title: "Valores a Receber em Aberto",
        detail: `Você possui ${formatBRL(receivablesAnalytics.totalOpen)} pendentes de reembolso na aba A Receber.`,
        severity: "info"
      });
    }

    return list;
  }, [monthSummary.personalSpent, personalBudgetLimit, selectedMonth, alertRules, autoMetrics.maxKm, receivablesAnalytics.totalOpen]);

  const unreadNotifications = useMemo(
    () => activeNotifications.filter((n) => !readNotificationIds.includes(n.id)),
    [activeNotifications, readNotificationIds]
  );

  const readNotificationsList = useMemo(
    () => activeNotifications.filter((n) => readNotificationIds.includes(n.id)),
    [activeNotifications, readNotificationIds]
  );

  const markNotificationAsRead = (id: string) => {
    const updated = Array.from(new Set([...readNotificationIds, id]));
    setReadNotificationIds(updated);
    localStorage.setItem("lifeos_read_notifications_v1", JSON.stringify(updated));
  };

  const markAllNotificationsAsRead = () => {
    const allIds = activeNotifications.map((n) => n.id);
    const updated = Array.from(new Set([...readNotificationIds, ...allIds]));
    setReadNotificationIds(updated);
    localStorage.setItem("lifeos_read_notifications_v1", JSON.stringify(updated));
    notify("Notificações Lidas", "Todas as notificações atuais foram marcadas como vistas.", "success");
  };

  const markNotificationAsUnread = (id: string) => {
    const updated = readNotificationIds.filter((item) => item !== id);
    setReadNotificationIds(updated);
    localStorage.setItem("lifeos_read_notifications_v1", JSON.stringify(updated));
  };

  // Ações de Lançamentos (Com suporte a 1x–24x e sincronização com Planilha)
  const handleOpenNewTxModal = (defaultCat?: string) => {
    setEditingTxId(null);
    const cat = defaultCat || "Alimentação";
    setNewTx({
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: "",
      category: cat,
      costType: "Variável",
      paymentMethod: "PIX",
      cardUsed: cards[0]?.name || "Nubank Ultravioleta",
      status: getAutomaticStatus("PIX", cat),
      km: "",
      liters: "",
      installments: "1",
      debtor: ""
    });
    setShowTxModal(true);
  };

  const handleStartEditTransaction = (tx: Transaction) => {
    setEditingTxId(tx.id);
    setNewTx({
      date: tx.date,
      description: tx.description,
      amount: String(tx.amount),
      category: tx.category,
      costType: tx.costType,
      paymentMethod: tx.paymentMethod,
      cardUsed: tx.cardUsed || cards[0]?.name || "Nubank Ultravioleta",
      status: tx.status,
      km: tx.km ? String(tx.km) : "",
      liters: tx.liters ? String(tx.liters) : "",
      installments: "1",
      debtor: tx.debtor || debtorMap[tx.id] || ""
    });
    setShowTxModal(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = parseFloat(newTx.amount);
    if (!newTx.description.trim() || isNaN(totalAmount) || totalAmount <= 0) return;

    const nowIso = new Date().toISOString();
    const installmentsCount = Math.max(1, Math.min(24, parseInt(newTx.installments || "1", 10)));

    if (editingTxId) {
      const updated = transactions.map((t) =>
        t.id === editingTxId
          ? {
              ...t,
              date: newTx.date,
              description: sanitizeText(newTx.description),
              amount: totalAmount,
              category: newTx.category,
              costType: newTx.costType,
              paymentMethod: newTx.paymentMethod,
              cardUsed: newTx.paymentMethod === "Cartão de Crédito" ? newTx.cardUsed : undefined,
              status: newTx.status,
              km: newTx.km ? Number(newTx.km) : undefined,
              liters: newTx.liters ? Number(newTx.liters) : undefined,
              debtor: newTx.category === "A Receber" ? sanitizeText(newTx.debtor) : t.debtor,
              updatedAt: nowIso
            }
          : t
      );
      saveTransactions(updated, true);
      notify("Lançamento Atualizado", `${newTx.description} (${formatBRL(totalAmount)})`, "success", "FINANCE");
    } else if (installmentsCount > 1 && newTx.paymentMethod === "Cartão de Crédito") {
      const groupId = `grp-${Date.now()}`;
      const baseSlice = Math.floor((totalAmount / installmentsCount) * 100) / 100;
      const firstSlice = Number((totalAmount - baseSlice * (installmentsCount - 1)).toFixed(2));
      const createdList: Transaction[] = [];

      for (let i = 0; i < installmentsCount; i++) {
        createdList.push({
          id: `tx-${Date.now()}-${i}`,
          date: addMonthsToDate(newTx.date, i),
          description: sanitizeText(newTx.description),
          amount: i === 0 ? firstSlice : baseSlice,
          category: newTx.category,
          costType: newTx.costType,
          paymentMethod: newTx.paymentMethod,
          cardUsed: newTx.cardUsed,
          status: "Pendente / Na Fatura",
          installmentInfo: `${i + 1}/${installmentsCount}`,
          installmentGroupId: groupId,
          debtor: newTx.category === "A Receber" ? sanitizeText(newTx.debtor) : undefined,
          updatedAt: nowIso
        });
      }
      saveTransactions([...createdList, ...transactions], true);
      notify("Compra Parcelada Criada!", `${installmentsCount}x de ${formatBRL(baseSlice)} distribuídas nos meses seguintes.`, "success", "FINANCE");
    } else {
      const item: Transaction = {
        id: `tx-${Date.now()}`,
        date: newTx.date,
        description: sanitizeText(newTx.description),
        amount: totalAmount,
        category: newTx.category,
        costType: newTx.costType,
        paymentMethod: newTx.paymentMethod,
        cardUsed: newTx.paymentMethod === "Cartão de Crédito" ? newTx.cardUsed : undefined,
        status: newTx.status,
        km: newTx.km ? Number(newTx.km) : undefined,
        liters: newTx.liters ? Number(newTx.liters) : undefined,
        debtor: newTx.category === "A Receber" ? sanitizeText(newTx.debtor) : undefined,
        updatedAt: nowIso
      };
      saveTransactions([item, ...transactions], true);
      notify("Lançamento Registrado!", `${item.description} — ${formatBRL(item.amount)}`, "success", "FINANCE");
    }

    setShowTxModal(false);
  };

  const handleToggleStatus = (tx: Transaction) => {
    const nextStatus: TxStatus = tx.status === "Pago" ? "Pendente / Na Fatura" : "Pago";
    const updated = transactions.map((t) =>
      t.id === tx.id
        ? { ...t, status: nextStatus, paidAmount: nextStatus === "Pago" ? t.amount : 0, updatedAt: new Date().toISOString() }
        : t
    );
    saveTransactions(updated, true);
    notify("Situação Alterada", `${tx.description} marcado como ${nextStatus}.`, "info", "FINANCE");
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    saveTransactions(updated, true);
    notify("Lançamento Removido", "Item excluído e sincronizado.", "warning", "FINANCE");
  };

  const handleAssignDebtor = (txId: string, debtorName: string) => {
    const clean = sanitizeText(debtorName);
    const nextMap = { ...debtorMap, [txId]: clean };
    setDebtorMap(nextMap);
    localStorage.setItem("lifeos_debtors_v8", JSON.stringify(nextMap));
    const updated = transactions.map((t) => (t.id === txId ? { ...t, debtor: clean, updatedAt: new Date().toISOString() } : t));
    saveTransactions(updated, true);
    notify("Devedor Vinculado", `Atribuído a ${clean || "Não Atribuído"}.`, "success", "FINANCE");
  };

  const handlePartialPaymentReceivable = (tx: Transaction, addAmount: number) => {
    const currPaid = tx.paidAmount || 0;
    const nextPaid = Math.min(tx.amount, Number((currPaid + addAmount).toFixed(2)));
    const nextStatus: TxStatus = nextPaid >= tx.amount ? "Pago" : "Pendente / Na Fatura";
    const updated = transactions.map((t) =>
      t.id === tx.id ? { ...t, paidAmount: nextPaid, status: nextStatus, updatedAt: new Date().toISOString() } : t
    );
    saveTransactions(updated, true);
    notify("Abatimento Registrado!", `Abatido ${formatBRL(addAmount)} em ${tx.description}.`, "success", "FINANCE");
  };

  // Handlers das Abas Secundárias
  const saveStaticStatus = (items: StaticStatusItem[]) => {
    setStaticStatus(items);
    localStorage.setItem("lifeos_status_v8", JSON.stringify(items));
  };

  const handleSaveStaticStatus = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newStatusItem.amount);
    if (!newStatusItem.title.trim() || isNaN(val)) return;
    if (editingStatusId) {
      saveStaticStatus(staticStatus.map((s) => (s.id === editingStatusId ? { ...s, title: newStatusItem.title, type: newStatusItem.type, amount: val, notes: newStatusItem.notes } : s)));
      setEditingStatusId(null);
    } else {
      saveStaticStatus([...staticStatus, { id: `st-${Date.now()}`, title: newStatusItem.title, type: newStatusItem.type, amount: val, notes: newStatusItem.notes }]);
    }
    setNewStatusItem({ title: "", type: "Custo Fixo", amount: "", notes: "" });
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    const lim = parseFloat(newCard.limit);
    if (!newCard.name.trim() || isNaN(lim)) return;
    const updated = editingCardId
      ? cards.map((c) => (c.id === editingCardId ? { ...c, name: newCard.name, brand: newCard.brand, limit: lim, closingDay: Number(newCard.closingDay), dueDay: Number(newCard.dueDay), logoUrl: newCard.logoUrl || undefined } : c))
      : [...cards, { id: `card-${Date.now()}`, name: newCard.name, brand: newCard.brand, limit: lim, closingDay: Number(newCard.closingDay), dueDay: Number(newCard.dueDay), logoUrl: newCard.logoUrl || undefined }];
    setCards(updated);
    localStorage.setItem("lifeos_cards_v8", JSON.stringify(updated));
    setEditingCardId(null);
    setNewCard({ name: "", brand: "Mastercard Black", limit: "", closingDay: "25", dueDay: "5", logoUrl: "" });
  };

  const handleDeleteCard = (id: string) => {
    const updated = cards.filter((c) => c.id !== id);
    setCards(updated);
    localStorage.setItem("lifeos_cards_v8", JSON.stringify(updated));
  };

  const handlePayCardInvoice = (cardName: string) => {
    const updated = transactions.map((t) =>
      t.paymentMethod === "Cartão de Crédito" && t.cardUsed === cardName && t.status === "Pendente / Na Fatura"
        ? { ...t, status: "Pago" as TxStatus, updatedAt: new Date().toISOString() }
        : t
    );
    saveTransactions(updated, true);
    notify("Fatura Quitada!", `Todos os lançamentos abertos do cartão ${cardName} foram marcados como Pagos.`, "success", "FINANCE");
  };

  const handleSaveWish = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newWish.targetAmount);
    const saved = parseFloat(newWish.savedAmount || "0");
    if (!newWish.title.trim() || isNaN(target)) return;
    const updated = editingWishId
      ? wishlist.map((w) => (w.id === editingWishId ? { ...w, title: newWish.title, institution: newWish.institution, targetAmount: target, savedAmount: saved, priority: newWish.priority } : w))
      : [...wishlist, { id: `w-${Date.now()}`, title: newWish.title, institution: newWish.institution, targetAmount: target, savedAmount: saved, priority: newWish.priority }];
    setWishlist(updated);
    localStorage.setItem("lifeos_wish_v8", JSON.stringify(updated));
    setEditingWishId(null);
    setNewWish({ title: "", institution: "Nubank Ultravioleta", targetAmount: "", savedAmount: "0", priority: "Média" });
  };

  const handleIncrementWish = (w: WishlistItem, inc: number) => {
    const updated = wishlist.map((item) => (item.id === w.id ? { ...item, savedAmount: item.savedAmount + inc } : item));
    setWishlist(updated);
    localStorage.setItem("lifeos_wish_v8", JSON.stringify(updated));
    const newTxItem: Transaction = {
      id: `tx-wish-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      description: `Aporte Caixinha: ${w.title}`,
      amount: inc,
      category: "Aporte / Investimento",
      costType: "Variável",
      paymentMethod: "PIX",
      status: "Pago",
      wishlistId: w.id,
      updatedAt: new Date().toISOString()
    };
    saveTransactions([newTxItem, ...transactions], true);
    notify("Guardado na Caixinha!", `+ ${formatBRL(inc)} em ${w.title}`, "success", "FINANCE");
  };

  const handleDeleteWish = (id: string) => {
    const updated = wishlist.filter((w) => w.id !== id);
    setWishlist(updated);
    localStorage.setItem("lifeos_wish_v8", JSON.stringify(updated));
  };

  const handleSaveBioLog = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newBio.weight);
    const bf = newBio.bf ? parseFloat(newBio.bf) : undefined;
    if (isNaN(w)) return;
    const updated = editingBioId
      ? bioLogs.map((b) => (b.id === editingBioId ? { ...b, date: newBio.date, weight: w, bf } : b))
      : [...bioLogs, { id: `bio-${Date.now()}`, date: newBio.date, weight: w, bf }].sort((a, b) => a.date.localeCompare(b.date));
    setBioLogs(updated);
    localStorage.setItem("lifeos_bio_v8", JSON.stringify(updated));
    setEditingBioId(null);
    setNewBio({ date: new Date().toISOString().split("T")[0], weight: "", bf: "" });
  };

  const handleDeleteBioLog = (id: string) => {
    const updated = bioLogs.filter((b) => b.id !== id);
    setBioLogs(updated);
    localStorage.setItem("lifeos_bio_v8", JSON.stringify(updated));
  };

  const saveOkrs = (items: PersonalOKR[]) => {
    setOkrs(items);
    localStorage.setItem("lifeos_okrs_v8", JSON.stringify(items));
  };

  const handleAddOkr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOkr.title.trim()) return;
    saveOkrs([...okrs, { id: `okr-${Date.now()}`, title: newOkr.title, category: newOkr.category, current: Number(newOkr.current || 0), target: Number(newOkr.target || 100), unit: newOkr.unit || "R$" }]);
    setNewOkr({ title: "", category: "Finanças", current: "", target: "", unit: "R$" });
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim()) return;
    const updated = editingNoteId
      ? notes.map((n) => (n.id === editingNoteId ? { ...n, title: newNote.title, content: newNote.content, tag: newNote.tag } : n))
      : [{ id: `n-${Date.now()}`, date: new Date().toISOString().split("T")[0], title: newNote.title, content: newNote.content, tag: newNote.tag }, ...notes];
    setNotes(updated);
    localStorage.setItem("lifeos_notes_v8", JSON.stringify(updated));
    setEditingNoteId(null);
    setNewNote({ title: "", content: "", tag: "#Ideias" });
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem("lifeos_notes_v8", JSON.stringify(updated));
  };

  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeText(newMethodName);
    if (!clean || paymentMethods.includes(clean)) return;
    const updated = [...paymentMethods, clean];
    setPaymentMethods(updated);
    setNewMethodName("");
  };

  const handleDeletePaymentMethod = (m: string) => {
    setPaymentMethods(paymentMethods.filter((item) => item !== m));
  };

  const handleAddCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeText(newCategoryForm.name);
    if (!clean) return;
    setCategoriesCatalog([...categoriesCatalog, { name: clean, flow: newCategoryForm.flow, isAuto: newCategoryForm.isAuto }]);
    setCategoryColors({ ...categoryColors, [clean]: newCategoryForm.color });
    setNewCategoryForm({ name: "", flow: "EXPENSE", isAuto: false, color: "#6366f1" });
  };

  const handleDeleteCategory = (name: string) => {
    setCategoriesCatalog(categoriesCatalog.filter((c) => c.name !== name));
  };

  const updateChartThemeColor = (k: keyof ChartThemeColors, c: string) => {
    setChartTheme((prev) => ({ ...prev, [k]: c }));
  };

  const updateGoalsStorage = (b: number, i: number, p: number, r: number) => {
    localStorage.setItem("lifeos_goals_v8", JSON.stringify({ b, i, p, r }));
  };

  const saveAlertRules = (r: CustomAlertRule[]) => {
    setAlertRules(r);
    localStorage.setItem("lifeos_alerts_v8", JSON.stringify(r));
  };

  const handleAddAlertRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.title.trim() || !newAlert.targetValue) return;
    saveAlertRules([...alertRules, { id: `al-${Date.now()}`, title: newAlert.title, type: newAlert.type, targetValue: Number(newAlert.targetValue), warningLead: Number(newAlert.warningLead || 500) }]);
    setNewAlert({ title: "", type: "ODOMETER_KM", targetValue: "", warningLead: "500" });
  };

  const handleExportCSV = () => {
    const headers = ["Data", "Descricao", "Categoria", "Tipo", "Metodo", "Situacao", "Valor"];
    const rows = filteredTransactions.map((t) => [t.date, `"${t.description}"`, t.category, t.costType, t.paymentMethod, t.status, t.amount]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fincontrol-lancamentos-${selectedMonth}.csv`;
    a.click();
  };

  const handleExportFullBackupJSON = () => {
    const dump = { transactions, cards, staticStatus, wishlist, bioLogs, notes, okrs, alertRules };
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fincontrol-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  const handleImportFullBackupJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const d = JSON.parse(String(ev.target?.result));
        if (d.transactions) saveTransactions(d.transactions, false);
        if (d.cards) setCards(d.cards);
        if (d.staticStatus) saveStaticStatus(d.staticStatus);
        if (d.wishlist) setWishlist(d.wishlist);
        if (d.bioLogs) setBioLogs(d.bioLogs);
        if (d.notes) setNotes(d.notes);
        if (d.okrs) saveOkrs(d.okrs);
        notify("Backup Restaurado!", "Seus dados foram carregados com sucesso.", "success", "CONFIG");
      } catch {
        notify("Erro no Backup", "Arquivo JSON inválido.", "warning");
      }
    };
    reader.readAsText(file);
  };

  const handleUpdateProfileAvatar = (file: File) => {
    compressImageFileToBase64(file, (b64) => {
      setCurrentUserAvatar(b64);
      const updated = accounts.map((a) => (a.username === currentUser ? { ...a, avatarUrl: b64 } : a));
      setAccounts(updated);
      localStorage.setItem("lifeos_accounts_v8", JSON.stringify(updated));
    });
  };

  const moneyBlur = privacyMode ? "blur-md select-none" : "";

  if (!isHydrated) {
    return <div className="min-h-screen bg-[#070a14] flex items-center justify-center text-slate-400 text-xs">Carregando FinControl Life OS...</div>;
  }

  // TELA DE LOGIN / REGISTRO COM MEMÓRIA DE CONTAS SALVAS
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#070a14] text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-slate-900/90 border border-indigo-500/30 p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 text-white shadow-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white">FinControl BI & Auto</h1>
              <p className="text-xs text-slate-400">Life OS v{APP_VERSION} • Acesso Seguro</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950 border border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setAuthMode("login"); setAuthError(""); }}
              className={`py-2.5 rounded-xl transition ${authMode === "login" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
            >
              Entrar na Minha Conta
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("register"); setAuthError(""); }}
              className={`py-2.5 rounded-xl transition ${authMode === "register" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
            >
              Criar Nova Conta
            </button>
          </div>

          {accounts.length > 0 && authMode === "login" && (
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 block">Contas salvas neste dispositivo (clique para selecionar):</span>
              <div className="flex flex-wrap gap-2">
                {accounts.map((acc) => (
                  <button
                    key={acc.username}
                    type="button"
                    onClick={() => setAuthUsername(acc.username)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                      authUsername.toLowerCase() === acc.username.toLowerCase()
                        ? "bg-indigo-500/20 border-indigo-400 text-indigo-200"
                        : "bg-slate-950 border-white/10 text-slate-300"
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {acc.username}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Usuário</label>
              <input
                type="text"
                required
                placeholder="Digite seu nome de usuário..."
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Senha</label>
              <input
                type="password"
                required
                placeholder="Mínimo de 8 caracteres..."
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-indigo-500"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-extrabold text-white shadow-lg transition ${
                authMode === "login" ? "bg-indigo-600 hover:bg-indigo-500" : "bg-emerald-600 hover:bg-emerald-500"
              }`}
            >
              {authMode === "login" ? "Acessar Painel (Manter Conectado)" : "Cadastrar e Salvar Conta"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 pb-24 lg:pb-12 ${
      themeMode === "branco" ? "bg-slate-100 text-slate-900" : themeMode === "noturno" ? "bg-black text-slate-100" : "bg-[#070a14] text-slate-100"
    }`}>
      <style jsx global>{`
        .glass-card {
          background: ${themeMode === "branco" ? "rgba(255,255,255,0.92)" : themeMode === "noturno" ? "rgba(12,12,14,0.95)" : "rgba(15,23,42,0.72)"};
          backdrop-filter: blur(16px);
        }
        .color-circle {
          -webkit-appearance: none;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 9999px;
          cursor: pointer;
          background: transparent;
        }
        .color-circle::-webkit-color-swatch-wrapper { padding: 0; }
        .color-circle::-webkit-color-swatch { border: 2px solid rgba(255,255,255,0.25); border-radius: 9999px; }
      `}</style>

      {/* TOASTS FLUTUANTES */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto p-4 rounded-2xl bg-slate-900/95 border border-indigo-500/40 shadow-2xl text-xs flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-white block">{t.title}</strong>
              {t.subtitle && <span className="text-slate-300 text-[11px]">{t.subtitle}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* BARRA SUPERIOR */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-slate-950/85 backdrop-blur-xl px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 text-white shadow-lg">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base text-white">FinControl BI & Auto</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">v{APP_VERSION}</span>
              </div>
              <p className="text-[11px] text-slate-400">Olá, {currentUser} • Gestão Financeira e Telemetria Pessoal</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white font-semibold"
            >
              <option value="2026-10">Outubro / 2026</option>
              <option value="2026-09">Setembro / 2026</option>
              <option value="2026-11">Novembro / 2026</option>
              <option value="2026-12">Dezembro / 2026</option>
              <option value="ALL">Todos os Meses</option>
            </select>

            <ThemeSegmentedControl themeMode={themeMode} onChange={changeThemeMode} />

            {/* SININHO COM OPÇÃO "MARCAR COMO VISTA" */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowBellDropdown((prev) => !prev)}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 relative transition"
                title="Central de Notificações"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {showBellDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-950 border border-indigo-500/30 shadow-2xl p-4 z-50 text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div>
                      <strong className="text-white font-bold block">Notificações do Sistema</strong>
                      <span className="text-[10px] text-slate-400">
                        {unreadNotifications.length} não lida(s) • {readNotificationsList.length} já vista(s)
                      </span>
                    </div>
                    {unreadNotifications.length > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsAsRead}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 transition"
                      >
                        <Check className="w-3 h-3" /> Marcar todas como vistas
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setBellTab("unread")}
                      className={`py-1.5 rounded-lg transition ${bellTab === "unread" ? "bg-indigo-600 text-white" : "text-slate-400"}`}
                    >
                      Não Vistas ({unreadNotifications.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBellTab("read")}
                      className={`py-1.5 rounded-lg transition ${bellTab === "read" ? "bg-slate-800 text-white" : "text-slate-400"}`}
                    >
                      Já Vistas ({readNotificationsList.length})
                    </button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {bellTab === "unread" ? (
                      unreadNotifications.length === 0 ? (
                        <p className="text-center text-slate-400 py-6">Tudo em dia! Nenhuma notificação pendente.</p>
                      ) : (
                        unreadNotifications.map((n) => (
                          <div key={n.id} className="p-3 rounded-xl bg-slate-900/90 border border-white/10 flex items-start justify-between gap-2.5">
                            <div className="space-y-0.5">
                              <strong className={`block font-bold ${n.severity === "warning" ? "text-amber-400" : "text-indigo-300"}`}>{n.title}</strong>
                              <p className="text-[11px] text-slate-300 leading-snug">{n.detail}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => markNotificationAsRead(n.id)}
                              title="Marcar como já vista"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold shrink-0 flex items-center gap-1 transition"
                            >
                              <Check className="w-3 h-3" /> Já vi
                            </button>
                          </div>
                        ))
                      )
                    ) : readNotificationsList.length === 0 ? (
                      <p className="text-center text-slate-400 py-6">Nenhuma notificação arquivada ainda.</p>
                    ) : (
                      readNotificationsList.map((n) => (
                        <div key={n.id} className="p-3 rounded-xl bg-slate-900/40 border border-white/5 flex items-start justify-between gap-2.5 opacity-75">
                          <div>
                            <strong className="block font-bold text-slate-300">{n.title}</strong>
                            <p className="text-[11px] text-slate-400">{n.detail}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => markNotificationAsUnread(n.id)}
                            className="text-[10px] text-indigo-400 hover:underline shrink-0"
                          >
                            Reabrir
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setPrivacyMode(!privacyMode)}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200"
              title="Modo Privacidade"
            >
              {privacyMode ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => handleOpenNewTxModal()}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" /> Novo Lançamento
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30"
              title="Sair da Conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <nav className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto pt-3 mt-3 border-t border-white/[0.06] text-xs">
          {[
            { id: "dashboard", label: "Visão Geral", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
            { id: "status", label: "Meu Status Atual", icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
            { id: "transactions", label: "Lançamentos", icon: <Wallet className="w-3.5 h-3.5" /> },
            { id: "receivables", label: "Valores a Receber", icon: <HandCoins className="w-3.5 h-3.5" /> },
            { id: "cards", label: "Cartões & Caixinhas", icon: <CreditCard className="w-3.5 h-3.5" /> },
            { id: "auto", label: "Meu Veículo", icon: <Car className="w-3.5 h-3.5" /> },
            { id: "bio", label: "Bio & Strava", icon: <Activity className="w-3.5 h-3.5" /> },
            { id: "brain", label: "Metas & Notas", icon: <Brain className="w-3.5 h-3.5" /> },
            { id: "settings", label: "Configurações", icon: <Settings className="w-3.5 h-3.5" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25" : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {activeTab === "dashboard" ? (
          <div className="space-y-6">
            {/* TERMÔMETRO PESSOAL */}
            <div className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-extrabold text-white">Termômetro de Gastos Pessoais / Besteiras</h2>
                  <p className="text-xs text-slate-400">Orçamento mensal livre para compras pessoais: {formatBRL(personalBudgetLimit)}</p>
                </div>
                <span className={`text-sm font-extrabold ${moneyBlur} ${monthSummary.personalSpent > personalBudgetLimit ? "text-rose-400" : "text-emerald-400"}`}>
                  {formatBRL(monthSummary.personalSpent)} / {formatBRL(personalBudgetLimit)}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ${
                    monthSummary.personalSpent > personalBudgetLimit ? "bg-rose-500" : "bg-gradient-to-r from-emerald-500 to-indigo-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.round((monthSummary.personalSpent / Math.max(1, personalBudgetLimit)) * 100))}%` }}
                />
              </div>
            </div>

            {/* KPIS DO MÊS */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${moneyBlur}`}>
              <div className="glass-card p-5 rounded-2xl border border-white/[0.07]">
                <span className="text-xs text-slate-400 flex items-center justify-between">
                  Entradas do Mês <TrendingUp className="w-4 h-4 text-emerald-400" />
                </span>
                <p className="text-2xl font-extrabold text-emerald-400 mt-1">{formatBRL(monthSummary.income)}</p>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3 text-emerald-400" /> {monthSummary.incomeDiff >= 0 ? `+${monthSummary.incomeDiff}%` : `${monthSummary.incomeDiff}%`} vs. mês anterior
                </span>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-white/[0.07]">
                <span className="text-xs text-slate-400 flex items-center justify-between">
                  Saídas e Despesas <TrendingDown className="w-4 h-4 text-rose-400" />
                </span>
                <p className="text-2xl font-extrabold text-rose-400 mt-1">{formatBRL(monthSummary.expense)}</p>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                  <ArrowDownRight className="w-3 h-3 text-rose-400" /> {monthSummary.expenseDiff >= 0 ? `+${monthSummary.expenseDiff}%` : `${monthSummary.expenseDiff}%`} vs. mês anterior
                </span>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-white/[0.07]">
                <span className="text-xs text-slate-400 flex items-center justify-between">
                  Aportes / Investido <PiggyBank className="w-4 h-4 text-indigo-400" />
                </span>
                <p className="text-2xl font-extrabold text-indigo-400 mt-1">{formatBRL(monthSummary.invested)}</p>
                <span className="text-[11px] text-slate-400 mt-1 block">Meta mensal: {formatBRL(monthlyInvestmentGoal)}</span>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-white/[0.07]">
                <span className="text-xs text-slate-400 flex items-center justify-between">
                  Saldo Livre Líquido <Wallet className="w-4 h-4 text-sky-400" />
                </span>
                <p className={`text-2xl font-extrabold mt-1 ${monthSummary.balance >= 0 ? "text-sky-400" : "text-rose-400"}`}>
                  {formatBRL(monthSummary.balance)}
                </p>
                <span className="text-[11px] text-slate-400 mt-1 block">Disponível após aportes e contas</span>
              </div>
            </div>

            {/* GRÁFICOS PRINCIPAIS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Evolução do Meu Patrimônio</h3>
                  <p className="text-xs text-slate-400">Crescimento acumulado somando seus aportes mensais.</p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={patrimonyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                      <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip content={<CustomCyberTooltip isCurrency={true} />} />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                      {milestones.map((m) => (
                        <ReferenceLine key={m.id} y={m.value} stroke={m.color} strokeDasharray="3 3" />
                      ))}
                      <Area type={curveType} dataKey="acumulado" name="Patrimônio Acumulado" stroke={chartTheme.patrimonyLine} fill={chartTheme.patrimonyLine} fillOpacity={0.2} />
                      <Area type={curveType} dataKey="aportado" name="Aporte no Mês" stroke={chartTheme.aporteLine} fill={chartTheme.aporteLine} fillOpacity={0.15} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Limite Disponível vs. Limite Usado nos Cartões</h3>
                  <p className="text-xs text-slate-400">Faturas em aberto comparadas ao limite disponível.</p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={creditChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip content={<CustomCyberTooltip isCurrency={true} />} />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                      <Bar dataKey="usado" name="Fatura Aberta" fill={chartTheme.creditUsedBar} radius={[6, 6, 0, 0]} />
                      <Bar dataKey="disponivel" name="Limite Livre" fill={chartTheme.creditAvailableBar} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <SecondaryTabs
            activeTab={activeTab}
            moneyBlur={moneyBlur}
            currentUser={currentUser}
            currentUserAvatar={currentUserAvatar}
            themeMode={themeMode}
            changeThemeMode={changeThemeMode}
            setShowChangelogModal={setShowChangelogModal}
            staticStatus={staticStatus}
            editingStatusId={editingStatusId}
            setEditingStatusId={setEditingStatusId}
            newStatusItem={newStatusItem}
            setNewStatusItem={setNewStatusItem}
            handleSaveStaticStatus={handleSaveStaticStatus}
            saveStaticStatus={saveStaticStatus}
            filteredTransactions={filteredTransactions}
            transactions={transactions}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleExportCSV={handleExportCSV}
            handleOpenNewTxModal={handleOpenNewTxModal}
            getFlowType={getFlowType}
            cards={cards}
            categoryColors={categoryColors}
            handleToggleStatus={handleToggleStatus}
            handleStartEditTransaction={handleStartEditTransaction}
            handleDeleteTransaction={handleDeleteTransaction}
            receivableItems={receivableItems}
            receivablesAnalytics={receivablesAnalytics}
            handleAssignDebtor={handleAssignDebtor}
            handlePartialPaymentReceivable={handlePartialPaymentReceivable}
            notify={notify}
            editingCardId={editingCardId}
            setEditingCardId={setEditingCardId}
            newCard={newCard}
            setNewCard={setNewCard}
            handleSaveCard={handleSaveCard}
            handleDeleteCard={handleDeleteCard}
            handlePayCardInvoice={handlePayCardInvoice}
            wishlist={wishlist}
            editingWishId={editingWishId}
            setEditingWishId={setEditingWishId}
            newWish={newWish}
            setNewWish={setNewWish}
            handleSaveWish={handleSaveWish}
            handleIncrementWish={handleIncrementWish}
            handleDeleteWish={handleDeleteWish}
            personalBudgetLimit={personalBudgetLimit}
            autoMetrics={autoMetrics}
            chartTheme={chartTheme}
            updateChartThemeColor={updateChartThemeColor}
            stravaStats={stravaStats}
            isSyncingStrava={isSyncingStrava}
            syncStravaFromApi={syncStravaFromApi}
            bioLogs={bioLogs}
            editingBioId={editingBioId}
            setEditingBioId={setEditingBioId}
            newBio={newBio}
            setNewBio={setNewBio}
            handleSaveBioLog={handleSaveBioLog}
            handleDeleteBioLog={handleDeleteBioLog}
            okrs={okrs}
            saveOkrs={saveOkrs}
            newOkr={newOkr}
            setNewOkr={setNewOkr}
            handleAddOkr={handleAddOkr}
            notes={notes}
            selectedNoteTag={selectedNoteTag}
            setSelectedNoteTag={setSelectedNoteTag}
            editingNoteId={editingNoteId}
            setEditingNoteId={setEditingNoteId}
            newNote={newNote}
            setNewNote={setNewNote}
            handleSaveNote={handleSaveNote}
            handleDeleteNote={handleDeleteNote}
            handleExportFullBackupJSON={handleExportFullBackupJSON}
            handleImportFullBackupJSON={handleImportFullBackupJSON}
            handleUpdateProfileAvatar={handleUpdateProfileAvatar}
            sheetApiUrl={sheetApiUrl}
            setSheetApiUrl={setSheetApiUrl}
            isSyncing={isSyncing}
            syncFromGoogleSheets={syncFromGoogleSheets}
            pushAllToGoogleSheets={pushAllToGoogleSheets}
            sheetsSyncStatus={sheetsSyncStatus}
            stravaConfig={stravaConfig}
            setStravaConfig={setStravaConfig}
            stravaSyncStatus={stravaSyncStatus}
            paymentMethods={paymentMethods}
            newMethodName={newMethodName}
            setNewMethodName={setNewMethodName}
            handleAddPaymentMethod={handleAddPaymentMethod}
            handleDeletePaymentMethod={handleDeletePaymentMethod}
            categoriesCatalog={categoriesCatalog}
            newCategoryForm={newCategoryForm}
            setNewCategoryForm={setNewCategoryForm}
            handleAddCustomCategory={handleAddCustomCategory}
            handleDeleteCategory={handleDeleteCategory}
            monthlyInvestmentGoal={monthlyInvestmentGoal}
            patrimonyTarget={patrimonyTarget}
            annualRunGoalKm={annualRunGoalKm}
            setPersonalBudgetLimit={setPersonalBudgetLimit}
            setMonthlyInvestmentGoal={setMonthlyInvestmentGoal}
            setPatrimonyTarget={setPatrimonyTarget}
            setAnnualRunGoalKm={setAnnualRunGoalKm}
            updateGoalsStorage={updateGoalsStorage}
            alertRules={alertRules}
            saveAlertRules={saveAlertRules}
            newAlert={newAlert}
            setNewAlert={setNewAlert}
            handleAddAlertRule={handleAddAlertRule}
            systemLogs={systemLogs}
            setSystemLogs={setSystemLogs}
            logFilter={logFilter}
            setLogFilter={setLogFilter}
          />
        )}
      </main>

      {/* MODAL DE NOVO / EDITAR LANÇAMENTO */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveTransaction} className="w-full max-w-lg rounded-3xl bg-slate-900 border border-indigo-500/30 p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-extrabold text-white">{editingTxId ? "Editar Lançamento" : "Novo Lançamento"}</h3>
              <button type="button" onClick={() => setShowTxModal(false)} className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Data</label>
                <input type="date" required value={newTx.date} onChange={(e) => setNewTx({ ...newTx, date: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Valor Total (R$)</label>
                <input type="number" step="0.01" required placeholder="0,00" value={newTx.amount} onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white" />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Descrição</label>
              <input type="text" required placeholder="Ex: Supermercado, Gasolina, Empréstimo..." value={newTx.description} onChange={(e) => setNewTx({ ...newTx, description: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Categoria</label>
                <select
                  value={newTx.category}
                  onChange={(e) => {
                    const c = e.target.value;
                    setNewTx({ ...newTx, category: c, status: getAutomaticStatus(newTx.paymentMethod, c) });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white"
                >
                  {categoriesCatalog.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Método de Pagamento</label>
                <select
                  value={newTx.paymentMethod}
                  onChange={(e) => {
                    const m = e.target.value;
                    setNewTx({ ...newTx, paymentMethod: m, status: getAutomaticStatus(m, newTx.category) });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white"
                >
                  {paymentMethods.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {newTx.paymentMethod === "Cartão de Crédito" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Cartão Utilizado</label>
                  <select value={newTx.cardUsed} onChange={(e) => setNewTx({ ...newTx, cardUsed: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white">
                    {cards.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                {!editingTxId && (
                  <div>
                    <label className="text-slate-400 block mb-1">Parcelamento</label>
                    <select value={newTx.installments} onChange={(e) => setNewTx({ ...newTx, installments: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white">
                      {Array.from({ length: 24 }, (_, idx) => idx + 1).map((n) => (
                        <option key={n} value={String(n)}>{n}x {n === 1 ? "(À vista)" : "parcelas"}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {newTx.category === "A Receber" && (
              <div>
                <label className="text-amber-300 font-bold block mb-1">Nome da Pessoa (Devedor)</label>
                <input type="text" placeholder="Ex: Lucas (Primo), Matheus..." value={newTx.debtor} onChange={(e) => setNewTx({ ...newTx, debtor: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-white" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Odômetro / KM (Opcional)</label>
                <input type="number" placeholder="Ex: 49120" value={newTx.km} onChange={(e) => setNewTx({ ...newTx, km: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Litros Abastecidos (Opcional)</label>
                <input type="number" step="0.1" placeholder="Ex: 42.5" value={newTx.liters} onChange={(e) => setNewTx({ ...newTx, liters: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowTxModal(false)} className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancelar</button>
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold">Salvar Lançamento</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CHANGELOG */}
      {showChangelogModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-indigo-500/30 p-6 shadow-2xl space-y-4 text-xs max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-extrabold text-white">Histórico de Versões (Changelog)</h3>
              <button type="button" onClick={() => setShowChangelogModal(false)} className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            {CHANGELOG_HISTORY.map((ch) => (
              <div key={ch.version} className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-emerald-400 font-bold">Versão {ch.version} — {ch.title}</strong>
                  <span className="text-[10px] text-slate-400 font-mono">{ch.date}</span>
                </div>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {ch.highlights.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}