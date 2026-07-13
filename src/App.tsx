import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Server,
  Activity,
  RefreshCw,
  BookOpen,
  Users,
  MessageSquare,
  Truck,
  Check,
  Sun,
  Moon,
} from "lucide-react";

export const SYSTEM_MODE = {
  UNCONFIGURED: "UNCONFIGURED" as const,
  LIVE_CORE: "LIVE_CORE" as const,
  DEGRADED: "DEGRADED" as const,
};

export const ALERT_STATUS = {
  NORMAL: "NORMAL" as const,
  WARNING: "WARNING" as const,
  CRITICAL: "CRITICAL" as const,
};

import { GateData, Signage, MultilingualReport, CrowdAIResponse, IncidentAIResponse, TransportAIResponse } from "./types";
import { AnimatedNumber, GlowPanel, ScrollReveal, MagneticButton } from "./components/HelperComponents";
import { TelemetryGrid } from './components/TelemetryGrid';
import { GateMatrixSector } from './components/GateMatrixSector';
import { CommunicationLog } from './components/CommunicationLog';
import { FleetStreamPanel } from './components/FleetStreamPanel';


export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"blueprint" | "simulation">("simulation");

  const [activeBlueprintSection, setActiveBlueprintSection] = useState<string>("overview");

  const [activeSimSegment, setActiveSimSegment] = useState<"crowd" | "incident" | "transport">("crowd");

  const [systemMode, setSystemMode] = useState<"UNCONFIGURED" | "LIVE_CORE" | "DEGRADED">("UNCONFIGURED");
  const [isSystemEvaluating, setIsSystemEvaluating] = useState<boolean>(false);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [lastEvaluationTime, setLastEvaluationTime] = useState<string>("Never");
  const [apiError, setApiError] = useState<string | null>(null);

  const [acknowledgedAlarms, setAcknowledgedAlarms] = useState<string[]>([]);

  const [gateHistory, setGateHistory] = useState<Record<string, number[]>>({
    GATE_A: [45, 45, 45, 45, 45, 45],
    GATE_C: [35, 35, 35, 35, 35, 35],
    GATE_E: [50, 50, 50, 50, 50, 50],
    GATE_G: [75, 78, 80, 84, 88, 88],
    GATE_K: [20, 20, 20, 20, 20, 20],
  });

  const generateSparklinePath = useCallback((gateId: string, currentVal: number) => {
    const baseHistory = gateHistory[gateId] || [40, 40, 40, 40, 40, 40];
    const history = [...baseHistory, currentVal];
    const points = history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * 60;
      const y = 20 - (val / 100) * 18 - 1;
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")}`;
  }, [gateHistory]);

  const [gates, setGates] = useState<GateData[]>([
    { id: "GATE_A", name: "Gate A (Metro Plaza)", loadPercentage: 45, queueLength: 120, status: "NORMAL" },
    { id: "GATE_C", name: "Gate C (North Perimeter)", loadPercentage: 35, queueLength: 90, status: "NORMAL" },
    { id: "GATE_E", name: "Gate E (West Car Park)", loadPercentage: 50, queueLength: 150, status: "NORMAL" },
    { id: "GATE_G", name: "Gate G (VIP & East Link)", loadPercentage: 88, queueLength: 420, status: "WARNING" },
    { id: "GATE_K", name: "Gate K (South Transit)", loadPercentage: 20, queueLength: 45, status: "NORMAL" },
  ]);

  const [physicalSignage, setPhysicalSignage] = useState<Signage[]>([
    { id: "SIGN_GATE_A", location: "North Concourse Entrance", text: "WELCOME TO MATCH DAY - STADIUM ENTRY VIA ALL OPEN GATES" },
    { id: "SIGN_NORTH_PLAZA", location: "Main Plaza Interchange", text: "ACCESS ALL SECTORS VIA GATE A AND GATE G" },
    { id: "SIGN_MAIN_DRIVE", location: "Transit Hub Crossroad", text: "STADIUM INGRESS UNDERWAY - PLEASE HAVE DIGITAL TICKETS READY" },
  ]);

  const [cameraVisionLogs, setCameraVisionLogs] = useState<string>(
    "North Concourse cameras detect dense crowd accumulation near food vendors spilling into ticket turnstile lanes."
  );

  const [crowdAIResponse, setCrowdAIResponse] = useState<CrowdAIResponse | null>(null);

  const [incidentReports, setIncidentReports] = useState<MultilingualReport[]>([
    {
      id: "R_01",
      reporter: "Enrique Gómez",
      role: "Gate G Security Lead",
      lang: "Spanish (ES)",
      text: "Hay un embotellamiento masivo de fanáticos en el túnel norte. Los escáneres de boletos 3 y 4 se han congelado. La gente empieza a empujar, necesitamos vallas de seguridad de inmediato.",
    },
    {
      id: "R_02",
      reporter: "Amélie Dubois",
      role: "Concourse Medic",
      lang: "French (FR)",
      text: "Urgence médicale mineure signalée en tribune B7. Un spectateur présente des signes d'épuisement par la chaleur. Besoin d'une équipe de secours avec civière pour évacuation.",
    },
    {
      id: "R_03",
      reporter: "Thiago Santos",
      role: "West Concourse Coordinator",
      lang: "Portuguese (PT)",
      text: "Falta de iluminação no corredor oeste do nível 2. Área escura está gerando lentidão no fluxo de saída pré-jogo.",
    },
  ]);

  const [newReporterName, setNewReporterName] = useState<string>("");
  const [newReporterLang, setNewReporterLang] = useState<string>("Spanish (ES)");
  const [newReportText, setNewReportText] = useState<string>("");
  const [incidentAIResponse, setIncidentAIResponse] = useState<IncidentAIResponse | null>(null);

  const [matchMinute, setMatchMinute] = useState<number>(75);
  const [scoreHome, setScoreHome] = useState<number>(2);
  const [scoreAway, setScoreAway] = useState<number>(2);
  const [extraTimePredicted, setExtraTimePredicted] = useState<boolean>(true);
  const [transitGridLoad, setTransitGridLoad] = useState<string>("Medium - Metro delays reported due to signaling issues");
  const [transportAIResponse, setTransportAIResponse] = useState<TransportAIResponse | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = ["https:", "", "fonts.googleapis.com", "css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"].join("/");
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (scoreHome === scoreAway && matchMinute >= 70) {
      setExtraTimePredicted(true);
    } else if (scoreHome !== scoreAway) {
      setExtraTimePredicted(false);
    }
  }, [scoreHome, scoreAway, matchMinute]);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        setSystemMode(data.mode);
        addLog(`System connected. Mode: ${data.mode}. Polling localized stadium hardware matrix... Network status active.`);
      } catch (err) {
        console.warn("Backend health check failed. Running in Simulator Mode.", err);
        setSystemMode("UNCONFIGURED");
        addLog("System offline. Operating in high-fidelity standalone simulator mode.");
      }
    };
    fetchHealth();
  }, []);

  const addLog = useCallback((msg: string) => {
    setSystemLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)]);
  }, []);

  const avgGateInflow = useMemo(() => Math.round(gates.reduce((acc, g) => acc + g.loadPercentage, 0) / gates.length), [gates]);
  const activeAlarmsCount = useMemo(() => gates.filter(g => g.status !== "NORMAL").length, [gates]);
  const ingressQueueAccumulation = useMemo(() => gates.reduce((acc, g) => acc + g.queueLength, 0), [gates]);
  const flowDelayMetric = useMemo(() => (ingressQueueAccumulation / 300).toFixed(1), [ingressQueueAccumulation]);
  const unacknowledgedAlarmsFiltered = useMemo(() => gates.filter(g => g.status !== "NORMAL" && !acknowledgedAlarms.includes(g.id)), [gates, acknowledgedAlarms]);

  /* Trigger evaluation for Use Case 1: Crowd */
  const runCrowdEvaluation = async () => {
    setIsSystemEvaluating(true);
    setApiError(null);
    addLog("Ingesting localized stadium hardware matrix & optical telemetry feeds...");
    try {
      const response = await fetch("/api/crowd-decongestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gatesData: gates,
          physicalSignage: physicalSignage,
          cameraVisionLogs,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      const resData = await response.json();
      setCrowdAIResponse(resData.data);
      setSystemMode(resData.mode);
      setLastEvaluationTime(new Date().toLocaleTimeString());

      /* Dynamically apply signage updates */
      if (resData.data && resData.data.updatedSignage) {
        setPhysicalSignage((prevSignage) =>
          prevSignage.map((sign) => {
            const update = resData.data.updatedSignage.find((u: any) => u.signId === sign.id);
            if (update) {
              return { ...sign, text: update.recommendedText };
            }
            return sign;
          })
        );
      }

      /* Rebalance Gate loads upon optimization */
      setGates((prevGates) =>
        prevGates.map((g) => {
          if (g.id === "GATE_G") {
            return { ...g, loadPercentage: 55, queueLength: 220, status: "NORMAL" };
          }
          if (g.id === "GATE_C") {
            return { ...g, loadPercentage: 48, queueLength: 140, status: "NORMAL" };
          }
          return g;
        })
      );

      /* Append new loads to historical trend registers */
      setGateHistory((prevHistory) => ({
        GATE_A: [...prevHistory.GATE_A.slice(-5), 45],
        GATE_C: [...prevHistory.GATE_C.slice(-5), 48],
        GATE_E: [...prevHistory.GATE_E.slice(-5), 50],
        GATE_G: [...prevHistory.GATE_G.slice(-5), 55],
        GATE_K: [...prevHistory.GATE_K.slice(-5), 20],
      }));

      /* Automatically acknowledge rebalanced gates */
      setAcknowledgedAlarms((prev) => [...prev, "GATE_G"]);

      addLog(`Crowd telemetry mapping complete. Grid status: ${resData.data.status}. Controls dispatched to localized hardware signs.`);
    } catch (err: any) {
      console.error(err);
      addLog(`Hardware error executing Crowd De-congestion telemetry matrix: ${err.message}`);
      setApiError(err.message || "TELEMETRY LINK DEGRADED");
      setSystemMode("DEGRADED");
    } finally {
      setIsSystemEvaluating(false);
    }
  };

  /* Trigger evaluation for Use Case 2: Incident */
  const runIncidentEvaluation = async () => {
    setIsSystemEvaluating(true);
    setApiError(null);
    addLog("Ingesting radio communication log stream...");
    try {
      const response = await fetch("/api/multilingual-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawReports: incidentReports }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      const resData = await response.json();
      setIncidentAIResponse(resData.data);
      setSystemMode(resData.mode);
      setLastEvaluationTime(new Date().toLocaleTimeString());
      addLog(`Incident correlation complete. Unified SitRep compiled with priority: ${resData.data.severity}. Procedures matched to physical checklist matrices.`);
    } catch (err: any) {
      console.error(err);
      addLog(`Error executing telemetry mapping on communication stream: ${err.message}`);
      setApiError(err.message || "TELEMETRY LINK DEGRADED");
      setSystemMode("DEGRADED");
    } finally {
      setIsSystemEvaluating(false);
    }
  };

  /* Trigger evaluation for Use Case 3: Transport */
  const runTransportEvaluation = async () => {
    setIsSystemEvaluating(true);
    setApiError(null);
    addLog("Executing matrix analysis: transit telematics vs egress parameters...");
    try {
      const response = await fetch("/api/predictive-transport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchMinute,
          currentScore: `${scoreHome}-${scoreAway}`,
          extraTimePredicted,
          transitGridLoad,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      const resData = await response.json();
      setTransportAIResponse(resData.data);
      setSystemMode(resData.mode);
      setLastEvaluationTime(new Date().toLocaleTimeString());
      addLog(`Transit fleet dispatch recalculated. Projected egress peak: ${resData.data.egressPeakTimeUtc}. Allocating ${resData.data.ecoShuttleDispatch.fleetSizeToDeploy} transit hardware nodes.`);
    } catch (err: any) {
      console.error(err);
      addLog(`Error during fleet optimization matrix execution: ${err.message}`);
      setApiError(err.message || "TELEMETRY LINK DEGRADED");
      setSystemMode("DEGRADED");
    } finally {
      setIsSystemEvaluating(false);
    }
  };

  const handleAddCustomReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportText.trim() || !newReporterName.trim()) return;
    const newReport: MultilingualReport = {
      id: `R_0${incidentReports.length + 1}`,
      reporter: newReporterName,
      role: "Field Steward",
      lang: newReporterLang,
      text: newReportText,
    };
    setIncidentReports((prev) => [...prev, newReport]);
    setNewReportText("");
    setNewReporterName("");
    addLog(`Custom report added in ${newReporterLang} by ${newReporterName}.`);
  };

  const removeIncidentReport = (id: string) => {
    setIncidentReports((prev) => prev.filter((r) => r.id !== id));
    addLog(`Removed report ID: ${id}.`);
  };

  /* Helper to adjust gate levels */
  const updateGateLoad = (gateId: string, value: number) => {
    const load = Math.min(100, Math.max(0, value));
    const queue = Math.round(load * 4.8);
    let status: "NORMAL" | "WARNING" | "CRITICAL" = "NORMAL";
    if (load > 85) status = "CRITICAL";
    else if (load > 65) status = "WARNING";

    setGates((prev) =>
      prev.map((g) => {
        if (g.id === gateId) {
          return { ...g, loadPercentage: load, queueLength: queue, status };
        }
        return g;
      })
    );

    /* Record load to history */
    setGateHistory((prevHistory) => {
      const history = prevHistory[gateId] || [40, 40, 40, 40, 40, 40];
      return {
        ...prevHistory,
        [gateId]: [...history.slice(-5), load],
      };
    });

    /* Reset acknowledged alarm state if it returns to NORMAL */
    if (status === "NORMAL") {
      setAcknowledgedAlarms((prev) => prev.filter((id) => id !== gateId));
    }
  };

  return (
    <div data-theme={theme} className="h-screen w-screen bg-theme-bg text-theme-text flex flex-col font-mono selection:bg-theme-accent selection:text-theme-panel relative overflow-hidden transition-colors duration-150">

      {/* FLOATING PILL NAVBAR */}
      <div className="fixed top-4 left-0 right-0 z-50 mx-auto w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-4xl">
        <header className="rounded-full bg-black/95 backdrop-blur-md text-white px-3 py-2 sm:px-7 sm:py-3.5 flex items-center justify-between shadow-2xl shadow-black/50 border border-neutral-800/80 transition-all duration-150">

          {/* Logo & Wordmark */}
          <a
            href={import.meta.env.BASE_URL}
            aria-label="Scope Home"
            className="flex items-center space-x-2 sm:space-x-2.5 cursor-pointer hover:opacity-85 active:scale-95 transition-all text-left focus:outline-none"
          >
            <img src={`${import.meta.env.BASE_URL}favicon.png`} alt="SCOPE Logo" className="w-8 h-8 sm:w-9 sm:h-9 object-contain mix-blend-screen invert brightness-200" />
            <span className="text-sm sm:text-xl font-black tracking-widest uppercase text-white leading-none">SCOPE</span>
          </a>

          {/* Thin Divider */}
          <div className="hidden md:block w-px h-6 bg-neutral-800/60" />

          {/* Navigation / Mode Switcher */}
          <div className="flex space-x-1.5 p-0.5 bg-neutral-950/80 rounded-full border border-neutral-800/60" role="tablist">
            <button
              onClick={() => setActiveWorkspaceTab("simulation")}
              role="tab"
              aria-selected={activeWorkspaceTab === "simulation"}
              aria-label="Live Simulator Tab"
              className={`px-2 py-1.5 sm:px-4 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-bold tracking-wider transition-all duration-150 cursor-pointer flex items-center space-x-1 whitespace-nowrap ${activeWorkspaceTab === "simulation"
                  ? "bg-neutral-800/80 text-white font-extrabold border border-neutral-700/50"
                  : "text-neutral-400 hover:text-white"
                }`}
            >
              <Activity className="w-3.5 h-3.5 shrink-0" />
              <span>LIVE SIMULATOR</span>
            </button>
            <button
              onClick={() => setActiveWorkspaceTab("blueprint")}
              role="tab"
              aria-selected={activeWorkspaceTab === "blueprint"}
              aria-label="Blueprint Reference Tab"
              className={`px-2 py-1.5 sm:px-4 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-bold tracking-wider transition-all duration-150 cursor-pointer flex items-center space-x-1 whitespace-nowrap ${activeWorkspaceTab === "blueprint"
                  ? "bg-neutral-800/80 text-white font-extrabold border border-neutral-700/50"
                  : "text-neutral-400 hover:text-white"
                }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>BLUEPRINT</span>
            </button>
          </div>

          {/* Thin Divider */}
          <div className="hidden lg:block w-px h-6 bg-neutral-800/60" />

          {/* Light/Dark Mode Toggle Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
              aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800/60 rounded-full cursor-pointer transition-all duration-300 relative flex items-center justify-center overflow-hidden active:scale-90 focus:outline-none"
              title="Toggle Theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -12, opacity: 0, rotate: -45 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 12, opacity: 0, rotate: 45 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex items-center justify-center"
                >
                  {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-theme-accent" />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>

        </header>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 overflow-auto relative pt-24">

        {/* API ERROR STRIP */}
        {apiError && (
          <ScrollReveal delay={0}>
            <div className="mx-6 mb-4 mt-4 border border-theme-accent bg-theme-accent/5 text-theme-accent px-6 py-3 rounded-xl flex flex-col md:flex-row items-center justify-between text-xs font-mono transition-colors duration-150">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-theme-accent animate-pulse" />
                <span><strong>SYSTEM ERROR:</strong> {apiError}</span>
              </div>
              <button
                onClick={() => setApiError(null)}
                className="bg-theme-accent text-white hover:opacity-90 px-2 py-0.5 rounded-xl font-bold cursor-pointer transition-colors text-[9px]"
              >
                DISMISS
              </button>
            </div>
          </ScrollReveal>
        )}

        {/* PERSISTENT TOP ALARM STRIP */}
        {gates.some(g => g.status !== "NORMAL" && !acknowledgedAlarms.includes(g.id)) && (
          <ScrollReveal delay={0}>
            <div className="mx-6 mb-4 mt-4 border border-theme-accent bg-theme-accent/5 text-theme-accent px-6 py-3 rounded-xl flex flex-col md:flex-row items-center justify-between text-xs font-mono transition-colors duration-150">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-theme-accent animate-pulse" />
                <span><strong>UNACKNOWLEDGED STATUS ALERT:</strong> Peripheral Gate telemetry values exceed optimal parameters.</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                {unacknowledgedAlarmsFiltered.map(g => (
                  <div key={g.id} className="flex items-center space-x-2 bg-theme-accent/10 border border-theme-accent/30 px-2 py-1 text-[9px]">
                    <span>{g.name.split(" (")[0]}: {g.loadPercentage}% LOAD</span>
                    <button
                      onClick={() => setAcknowledgedAlarms((prev) => [...prev, g.id])}
                      className="bg-theme-accent text-white hover:opacity-90 px-2 py-0.5 rounded-xl font-bold cursor-pointer transition-colors text-[9px]"
                    >
                      ACK
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}
        {/* TAP 1: LIVE SIMULATION SPACE */}
        {activeWorkspaceTab === "simulation" && (
          <div className="flex flex-col">

            {/* Section 1: Above the fold - KPI Cards & Segment Switcher */}
            <TelemetryGrid
              avgGateInflow={avgGateInflow}
              gates={gates}
              acknowledgedAlarms={acknowledgedAlarms}
              activeAlarmsCount={activeAlarmsCount}
              ingressQueueAccumulation={ingressQueueAccumulation}
              flowDelayMetric={flowDelayMetric}
              transportAIResponse={transportAIResponse}
              activeSimSegment={activeSimSegment}
              setActiveSimSegment={setActiveSimSegment}
              lastEvaluationTime={lastEvaluationTime}
            />

            {/* Section 2: Active Working Panel (unfolds on scroll) */}
            <ScrollReveal delay={0.1} className="p-6 space-y-6 bg-theme-bg/30 border-b border-theme-border">
              {/* INTERACTIVE SEGMENT: 1. CROWD & IoT SENSORS */}
              {activeSimSegment === "crowd" && (
                <GateMatrixSector
                  gates={gates}
                  acknowledgedAlarms={acknowledgedAlarms}
                  setAcknowledgedAlarms={setAcknowledgedAlarms}
                  generateSparklinePath={generateSparklinePath}
                  updateGateLoad={updateGateLoad}
                  setCameraVisionLogs={setCameraVisionLogs}
                  addLog={addLog}
                  isSystemEvaluating={isSystemEvaluating}
                  cameraVisionLogs={cameraVisionLogs}
                  runCrowdEvaluation={runCrowdEvaluation}
                />
              )}

              {/* INTERACTIVE SEGMENT: 2. MULTILINGUAL INCIDENTS */}
              {activeSimSegment === "incident" && (
                <CommunicationLog
                  incidentReports={incidentReports}
                  removeIncidentReport={removeIncidentReport}
                  handleAddCustomReport={handleAddCustomReport}
                  newReporterName={newReporterName}
                  setNewReporterName={setNewReporterName}
                  newReporterLang={newReporterLang}
                  setNewReporterLang={setNewReporterLang}
                  newReportText={newReportText}
                  setNewReportText={setNewReportText}
                  isSystemEvaluating={isSystemEvaluating}
                  runIncidentEvaluation={runIncidentEvaluation}
                />
              )}

              {/* INTERACTIVE SEGMENT: 3. TRANSPORT DISPATCH */}
              {activeSimSegment === "transport" && (
                <FleetStreamPanel
                  matchMinute={matchMinute}
                  setMatchMinute={setMatchMinute}
                  scoreHome={scoreHome}
                  setScoreHome={setScoreHome}
                  scoreAway={scoreAway}
                  setScoreAway={setScoreAway}
                  extraTimePredicted={extraTimePredicted}
                  transitGridLoad={transitGridLoad}
                  setTransitGridLoad={setTransitGridLoad}
                  runTransportEvaluation={runTransportEvaluation}
                  isSystemEvaluating={isSystemEvaluating}
                  transportAIResponse={transportAIResponse}
                />
              )}

              {/* INGESTION & PIPELINE LOGS */}
              <ScrollReveal delay={0.15}>
                <div className="bg-theme-panel border border-theme-border rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-theme-text tracking-wider font-mono">INGESTION PIPELINE LOGS</span>
                    <button
                      onClick={() => setSystemLogs([])}
                      className="text-[9px] text-theme-muted hover:text-theme-text font-mono font-bold cursor-pointer transition-colors"
                    >
                      CLEAR
                    </button>
                  </div>
                  <div className="bg-theme-bg p-2 border border-theme-border h-28 overflow-y-auto space-y-1.5 font-mono text-[10px] text-theme-muted">
                    {systemLogs.length === 0 ? (
                      <div className="text-theme-muted italic">No events triggered yet...</div>
                    ) : (
                      systemLogs.map((log, idx) => (
                        <div key={idx} className="leading-relaxed border-l-2 border-theme-border pl-2">
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </ScrollReveal>

            </ScrollReveal>

            {/* Section 3: Infrastructure Response Layer (unfolds on scroll) */}
            <ScrollReveal delay={0.1} className="p-6 space-y-6 bg-theme-panel border-b border-theme-border">

              {/* Visual Title / Interactive Result HUD Header */}
              <div className="border-b border-theme-border pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xs font-bold text-theme-text uppercase tracking-wider">
                    Section 3 - SCOPE Autonomic Infrastructure Dispatch Target
                  </h2>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] bg-theme-bg text-theme-text border border-theme-border px-2 py-0.5 rounded-xl uppercase tracking-widest">
                    SYSTEM BALANCING: OPTIMAL
                  </span>
                </div>
              </div>

              {/* DETAILED RESULTS VISUALIZED / INTERACTIVE ACTIONS DISPATCHED */}
              <div className="space-y-6">

                {/* Current Active Pipeline Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Visual Signage Control Output block (Mock Browser Window style) */}
                  <ScrollReveal delay={0}>
                    <div className="bg-theme-panel/70 backdrop-blur-md border border-theme-border/40 rounded-2xl shadow-lg flex flex-col h-full overflow-hidden">
                      {/* Mock Browser Header */}
                      <div className="bg-theme-panel/80 border-b border-theme-border/50 px-3 py-2 flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-full border border-neutral-600 inline-block" />
                          <span className="w-2.5 h-2.5 rounded-full border border-neutral-600 inline-block" />
                          <span className="w-2.5 h-2.5 rounded-full border border-neutral-600 inline-block" />
                        </div>
                        <span className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase">
                          M2M SIGNAGE CHANNEL - SECURE_PORTAL
                        </span>
                        <span className="text-[8px] text-theme-accent border border-theme-accent/30 bg-theme-accent/5 px-1.5 py-0.5 rounded-xl font-mono animate-pulse">
                          LIVE STREAM
                        </span>
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="text-[9px] font-bold text-theme-muted font-mono uppercase tracking-wider">
                          ACTIVE STADIUM PERIPHERAL DISPLAY STATE
                        </div>

                        <div className="space-y-3 my-2">
                          {physicalSignage.map((sign) => (
                            <div key={sign.id} className="bg-theme-panel border border-theme-border p-3 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] text-theme-text font-mono font-bold">{sign.id} ({sign.location})</span>
                                <span className="text-[8px] text-neutral-400 font-mono border border-theme-border px-1 py-0.5 rounded-xl">
                                  API SYNCED
                                </span>
                              </div>
                              <div className="bg-theme-bg px-4 py-3 rounded-xl border border-theme-border font-mono text-theme-text text-xs text-center font-bold tracking-wider uppercase">
                                {sign.text}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="text-[8px] text-neutral-500 font-mono tracking-tight mt-auto border-t border-theme-border pt-2">
                          API STATE LINK: SSL_CONNECTED &bull; PROTOCOL: JSON_RPC
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>

                  {/* Operational Dispatch webhooks triggered block */}
                  <ScrollReveal delay={0.05}>
                    <div className="bg-theme-panel/70 backdrop-blur-md border border-theme-border/40 rounded-2xl shadow-lg p-4 space-y-3 flex flex-col justify-between h-full">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-theme-muted font-mono uppercase tracking-wider">
                            AUTOMATED VOLUNTEER & STAFF DISPATCH
                          </span>
                          <span className="text-[8px] bg-theme-panel border border-theme-border px-2 py-0.5 rounded-xl text-theme-muted font-mono">
                            Webhook Target
                          </span>
                        </div>

                        {/* Dispatch Visual Card */}
                        <div className="bg-theme-panel border border-theme-border rounded-xl p-3 space-y-3">
                          {activeSimSegment === "crowd" && (
                            <>
                              <div className="space-y-1 text-xs">
                                <div className="font-bold text-theme-text font-mono text-[11px]">
                                  {crowdAIResponse?.volunteerDispatch?.dispatchNeeded ? "SQUAD DISPATCH REQUIRED" : "STANDARD MONITORING"}
                                </div>
                                <div className="text-[10px] text-theme-muted font-mono">
                                  ZONE: <b className="text-theme-text">{crowdAIResponse?.volunteerDispatch?.targetZone || "ALL GATES NORMAL"}</b>
                                </div>
                              </div>
                              <div className="bg-theme-bg border border-theme-border p-2 rounded-xl text-[10px] font-mono text-theme-muted leading-relaxed uppercase">
                                {crowdAIResponse?.volunteerDispatch?.actionInstructions || "Standing by. System running nominal gate operations logic."}
                              </div>
                              <div className="flex items-center justify-between text-[10px] font-mono text-theme-muted">
                                <span>Squad Size Allocated:</span>
                                <span className="font-bold text-theme-text">{crowdAIResponse?.volunteerDispatch?.staffCount || 0} pax</span>
                              </div>
                            </>
                          )}

                          {activeSimSegment === "incident" && (
                            <>
                              <div className="space-y-1 text-xs">
                                <div className="font-bold text-theme-text font-mono text-[11px]">
                                  {incidentAIResponse?.severity ? `INCIDENT DETECTED: [${incidentAIResponse.severity}]` : "NO ACTIVE DISPATCH"}
                                </div>
                                <div className="text-[10px] text-theme-muted font-mono">
                                  TARGET: <b className="text-theme-text">{incidentAIResponse?.dispatchAlert?.dispatchTarget || "AWAITING ANALYSIS"}</b>
                                </div>
                              </div>
                              <div className="bg-theme-bg border border-theme-border p-2 rounded-xl text-[10px] font-mono text-theme-muted leading-relaxed uppercase">
                                {incidentAIResponse?.dispatchAlert?.messagePayload || "Awaiting operational report consolidation triggers."}
                              </div>
                              <div className="flex items-center justify-between text-[10px] font-mono text-theme-muted">
                                <span>Checklist Executed:</span>
                                <span className="font-bold text-theme-text">
                                  {incidentAIResponse?.sopChecks?.filter((s: any) => s.completed).length || 0} of {incidentAIResponse?.sopChecks?.length || 0} Steps
                                </span>
                              </div>
                            </>
                          )}

                          {activeSimSegment === "transport" && (
                            <>
                              <div className="space-y-1 text-xs">
                                <div className="font-bold text-theme-text font-mono text-[11px]">
                                  {transportAIResponse?.ecoShuttleDispatch?.fleetSizeToDeploy ? "ECO-SHUTTLE RE-ALLOCATION" : "SHUTTLE ON-DEMAND CYCLE"}
                                </div>
                                <div className="text-[10px] text-theme-muted font-mono">
                                  TOTAL ELECTRIC FLEET: <b className="text-theme-text">{transportAIResponse?.ecoShuttleDispatch?.fleetSizeToDeploy || 0} BUSES</b>
                                </div>
                              </div>

                              {/* Route allocation progress bars */}
                              {transportAIResponse?.ecoShuttleDispatch && (
                                <div className="space-y-2">
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] font-mono text-theme-muted">
                                      <span>Route A (Metro Link):</span>
                                      <span className="text-theme-text font-bold">{transportAIResponse.ecoShuttleDispatch.routeAAllocation} units</span>
                                    </div>
                                    <div className="w-full bg-theme-bg h-1 rounded-xl">
                                      <div
                                        className="bg-theme-text h-1 rounded-xl transition-all"
                                        style={{ width: `${(transportAIResponse.ecoShuttleDispatch.routeAAllocation / transportAIResponse.ecoShuttleDispatch.fleetSizeToDeploy) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] font-mono text-theme-muted">
                                      <span>Route B (Park & Ride):</span>
                                      <span className="text-theme-text font-bold">{transportAIResponse.ecoShuttleDispatch.routeBAllocation} units</span>
                                    </div>
                                    <div className="w-full bg-theme-bg h-1 rounded-xl">
                                      <div
                                        className="bg-theme-text h-1 rounded-xl transition-all"
                                        style={{ width: `${(transportAIResponse.ecoShuttleDispatch.routeBAllocation / transportAIResponse.ecoShuttleDispatch.fleetSizeToDeploy) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] font-mono text-theme-muted">
                                      <span>Route C (Hotels Loop):</span>
                                      <span className="text-theme-text font-bold">{transportAIResponse.ecoShuttleDispatch.routeCAllocation} units</span>
                                    </div>
                                    <div className="w-full bg-theme-bg h-1 rounded-xl">
                                      <div
                                        className="bg-theme-text h-1 rounded-xl transition-all"
                                        style={{ width: `${(transportAIResponse.ecoShuttleDispatch.routeCAllocation / transportAIResponse.ecoShuttleDispatch.fleetSizeToDeploy) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between text-[10px] font-mono text-theme-muted">
                                <span>CO2 Saved (Simulated Est):</span>
                                <span className="font-bold text-theme-text">{transportAIResponse?.ecoShuttleDispatch?.co2SavedKgEst || 0} kg</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Webhook trigger button */}
                      <div className="pt-3 border-t border-theme-border flex justify-between items-center text-[10px] font-mono text-theme-muted">
                        <span>API ENDPOINT CALLED</span>
                        <span className="text-theme-text font-bold">{apiError ? "HTTP 503 ERROR" : (lastEvaluationTime !== "Never" ? "HTTP 200 OK" : "IDLE")}</span>
                      </div>
                    </div>
                  </ScrollReveal>

                </div>

                {/* ACTIVE TAB JSON CODE EDITOR TERMINAL VIEW */}
                <ScrollReveal delay={0.1}>
                  <div className="bg-theme-panel/70 backdrop-blur-md border border-theme-border/40 rounded-2xl shadow-lg overflow-hidden flex flex-col">
                    <div className="bg-theme-panel/40 px-4 py-2 border-b border-theme-border/40 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-theme-muted">hardware_io_map.cfg</span>
                      </div>
                      <span className="text-[10px] text-theme-muted bg-theme-bg/50 px-2 py-0.5 rounded border border-theme-border/30">
                        FIRMWARE HARDWARE EXECUTION RECOUTS
                      </span>
                    </div>

                    <div className="p-4 bg-theme-panel/30 text-xs text-theme-text overflow-auto max-h-[220px] leading-relaxed select-all">
                      {activeSimSegment === "crowd" && (
                        crowdAIResponse ? (
                          <pre className="text-theme-text">{JSON.stringify(crowdAIResponse, null, 2)}</pre>
                        ) : (
                          <div className="text-theme-muted h-full flex flex-col items-center justify-center font-mono">
                            <span>[SYSTEM STATUS: SECTOR_READY]</span>
                            <span>Awaiting Crowd Routing trigger event...</span>
                          </div>
                        )
                      )}

                      {activeSimSegment === "incident" && (
                        incidentAIResponse ? (
                          <pre className="text-theme-text">{JSON.stringify(incidentAIResponse, null, 2)}</pre>
                        ) : (
                          <div className="text-theme-muted h-full flex flex-col items-center justify-center font-mono">
                            <span>[SYSTEM STATUS: SECTOR_READY]</span>
                            <span>Awaiting Multilingual Incident report trigger...</span>
                          </div>
                        )
                      )}

                      {activeSimSegment === "transport" && (
                        transportAIResponse ? (
                          <pre className="text-theme-text">{JSON.stringify(transportAIResponse, null, 2)}</pre>
                        ) : (
                          <div className="text-theme-muted h-full flex flex-col items-center justify-center font-mono">
                            <span>[SYSTEM STATUS: SECTOR_READY]</span>
                            <span>Awaiting Match Egress transport trigger...</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </ScrollReveal>

                {/* Under the hood visual proof banner */}
                <ScrollReveal delay={0.15}>
                  <div className="bg-theme-panel/70 backdrop-blur-md border border-theme-border/40 rounded-2xl shadow-sm p-4 flex items-start space-x-3 text-xs text-theme-muted leading-relaxed">
                    <span className="w-1.5 h-1.5 mt-1.5 shrink-0 bg-theme-muted rounded-full" />
                    <div>
                      <strong className="text-theme-text">System Status Metadata:</strong> System Connectivity: Secure. Target Hardware Nodes Online. Operational dispatch channels active and synchronized with high-availability enterprise routing switches.
                    </div>
                  </div>
                </ScrollReveal>

              </div>
            </ScrollReveal>

          </div>
        )}

        {/* TAP 2: ARCHITECTURAL BLUEPRINT DOCUMENT VIEW */}
        {activeWorkspaceTab === "blueprint" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-12 gap-8 font-mono"
          >

            {/* SIDEBAR NAVIGATION (COL 3) */}
            <div className="md:col-span-3 space-y-2">
              <div className="text-[10px] font-bold text-theme-muted font-mono uppercase tracking-wider mb-3 px-3">
                Blueprint Sections
              </div>
              {[
                { id: "overview", label: "1. Overview & Value Prop" },
                { id: "usecases", label: "2. Operational Use Cases" },
                { id: "techstack", label: "3. Tech Stack & Architecture" },
                { id: "roadmap", label: "4. Step-by-Step Roadmap" },
                { id: "evaluation", label: "5. Evaluation Highlights" },
              ].map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveBlueprintSection(sec.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer border ${activeBlueprintSection === sec.id
                      ? "bg-theme-bg text-theme-text border-theme-border"
                      : "text-theme-muted border-transparent hover:text-theme-text hover:bg-theme-bg"
                    }`}
                >
                  <span>{sec.label}</span>
                </button>
              ))}

              <div className="pt-8 px-3">
                <div className="bg-theme-bg border border-theme-border p-4 rounded-xl space-y-2 text-[11px] text-theme-muted leading-relaxed">
                  <p>
                    <strong className="text-theme-text">World Cup 2026:</strong> Built specifically to address the extreme logistics scale of hosting multiple high-congestion matches.
                  </p>
                </div>
              </div>
            </div>

            {/* DOCUMENT CONTENT PANEL (COL 9) */}
            <div className="md:col-span-9 bg-theme-panel border border-theme-border rounded-xl p-8 space-y-6">

              {/* SECTION 1: ARCHITECTURAL OVERVIEW & CORE VALUE PROP */}
              {activeBlueprintSection === "overview" && (
                <div className="space-y-6">
                  <div className="space-y-2 border-b border-theme-border pb-4">
                    <h3 className="text-sm font-bold text-theme-text uppercase tracking-wider">
                      1. ARCHITECTURAL OVERVIEW & CORE VALUE PROP
                    </h3>
                    <p className="text-[10px] text-theme-muted uppercase tracking-widest font-mono">
                      SCOPE: Under-the-Hood Background Operational Automation
                    </p>
                  </div>

                  <div className="max-w-none text-theme-muted text-sm leading-relaxed space-y-4">
                    <p>
                      Traditional stadium operations software often runs on fragmented legacy interfaces or delayed communications. These setups fail to address the high-intensity complexity of grand tournament operations: <strong className="text-theme-text">real-time high-throughput logistics and emergency crowd coordination.</strong>
                    </p>
                    <p>
                      <strong className="text-theme-text">SCOPE</strong> fundamentally re-imagines operational monitoring at the <strong className="text-theme-text">FIFA World Cup 2026</strong>. By acting as an <strong className="text-theme-text">integrated centralized coordination core</strong>, SCOPE ingests complex, high-velocity, heterogeneous data streams:
                    </p>

                    <ul className="list-disc pl-5 space-y-2.5 text-theme-muted py-1">
                      <li>
                        <strong className="text-theme-text">Real-Time IoT Crowd Sensors:</strong> Continuous count of spectator arrival velocity, queue bottlenecks, and concourse pressure points.
                      </li>
                      <li>
                        <strong className="text-theme-text">Optical Camera Feed Diagnostics:</strong> High-density security cameras providing live video telemetry analysis of visual plaza blockage.
                      </li>
                      <li>
                        <strong className="text-theme-text">Transit Schedule Delays:</strong> Live local metro, rail, and highway bus congestion feeds.
                      </li>
                      <li>
                        <strong className="text-theme-text">Official Stadium SOP Manuals:</strong> Real-time contextual indexing of complex stadium operations guidelines, emergency procedures, and transit agreements.
                      </li>
                    </ul>

                    <p className="bg-theme-bg border-l-2 border-theme-text p-4 rounded-xl text-theme-muted italic">
                      "The primary innovation of SCOPE is the direct integration of real-time diagnostics into automated state-machine actions, outputting structured schema configurations directly to peripheral APIs."
                    </p>

                    <p>
                      Instead of manual administrative entry, SCOPE outputs deterministic, machine-readable system payloads containing <strong className="text-theme-text">signage text instructions, staff dispatch alerts, and transit routing updates.</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION 2: REAL-TIME OPERATIONAL USE CASES */}
              {activeBlueprintSection === "usecases" && (
                <div className="space-y-6">
                  <div className="space-y-2 border-b border-theme-border pb-4">
                    <h3 className="text-sm font-bold text-theme-text uppercase tracking-wider">
                      2. REAL-TIME OPERATIONAL USE CASES
                    </h3>
                    <p className="text-[10px] text-theme-muted uppercase tracking-widest font-mono">
                      Under-the-Hood Background Operational Automation
                    </p>
                  </div>

                  <div className="space-y-6 text-sm text-theme-muted leading-relaxed">

                    {/* USECASE 1 */}
                    <div className="bg-theme-bg border border-theme-border p-5 rounded-xl space-y-3">
                      <div className="flex items-center space-x-2 text-theme-text">
                        <Users className="w-4 h-4 text-theme-text" />
                        <h4 className="font-bold uppercase tracking-wide text-xs">A. Dynamic Crowd De-congestion & Smart Routing</h4>
                      </div>
                      <p>
                        During entry peaks (90-30 minutes pre-game), ticket ingress gates inevitably bottleneck. When IoT pressure sensors or optical telemetry feeds register gate loads exceeding 85%, SCOPE evaluates the surrounding topology and identifies alternative peripheral gates.
                      </p>
                      <p className="text-xs text-theme-muted">
                        <strong className="text-theme-text">Output Control Action:</strong> Sends JSON to updated physical digital signage (e.g. redirecting Gate A traffic to Gate C), while pushing live re-routing vectors to static fan app maps to evenly spread entry velocity.
                      </p>
                    </div>

                    {/* USECASE 2 */}
                    <div className="bg-theme-bg border border-theme-border p-5 rounded-xl space-y-3">
                      <div className="flex items-center space-x-2 text-theme-text">
                        <MessageSquare className="w-4 h-4 text-theme-text" />
                        <h4 className="font-bold uppercase tracking-wide text-xs">B. Multilingual Incident Coordination</h4>
                      </div>
                      <p>
                        Stewards, emergency responders, and police communicate in native languages (French, Spanish, Portuguese). Rather than forcing staff to manually translate, SCOPE instantly ingests and normalizes these disparate communication inputs.
                      </p>
                      <p className="text-xs text-theme-muted">
                        <strong className="text-theme-text">Output Control Action:</strong> Translates, normalizes, and synthesizes reports into a unified, prioritized Situational Report (SitRep). It automatically matches reports against official Standard Operating Procedures (SOPs) to recommend immediate, actionable triage tasks to organizers.
                      </p>
                    </div>

                    {/* USECASE 3 */}
                    <div className="bg-theme-bg border border-theme-border p-5 rounded-xl space-y-3">
                      <div className="flex items-center space-x-2 text-theme-text">
                        <Truck className="w-4 h-4 text-theme-text" />
                        <h4 className="font-bold uppercase tracking-wide text-xs">C. Predictive Transport & Sustainability Dispatch</h4>
                      </div>
                      <p>
                        Egress crowd flow depends heavily on match progression. Standard regular-time end matches require standard public transit capacity. However, a tight 2-2 score at the 75th minute creates high probability of Extra Time or a Penalty Shootout.
                      </p>
                      <p className="text-xs text-slate-400">
                        <strong>Output Control Action:</strong> Instantly pre-allocates eco-friendly electric transit bus routing patterns based on match progression, shifting dispatch peaks by 35-50 minutes, and optimizing green vehicle grid discharge.
                      </p>
                    </div>

                  </div>
                </div>
              )}

              {/* SECTION 3: TECH STACK & SYSTEM ARCHITECTURE */}
              {activeBlueprintSection === "techstack" && (
                <div className="space-y-6">
                  <div className="space-y-2 border-b border-theme-border pb-4">
                    <h3 className="text-sm font-bold text-theme-text uppercase tracking-wider">
                      3. TECH STACK & SYSTEM ARCHITECTURE
                    </h3>
                    <p className="text-[10px] text-theme-muted uppercase tracking-widest font-mono">
                      System Topology & Data Pipeline
                    </p>
                  </div>

                  <div className="space-y-6 text-sm text-theme-muted">
                    <p>
                      Below is the system topology showing the flow of high-velocity stadium data through our background system coordination core down to physical API integration.
                    </p>

                    {/* RESPONSIVE SVG SYSTEM MAP */}
                    <div className="bg-theme-bg border border-theme-border p-4 rounded-xl flex justify-center">
                      <svg viewBox="0 0 800 350" className="w-full h-auto text-xs text-theme-muted">
                        {/* Background Nodes */}
                        <g stroke="var(--border)" strokeWidth="1.5" fill="var(--bg)">
                          <rect x="20" y="20" width="180" height="250" rx="2" />
                          <rect x="250" y="80" width="280" height="130" rx="2" />
                          <rect x="580" y="20" width="200" height="250" rx="2" />
                        </g>

                        {/* Node Titles */}
                        <text x="35" y="45" className="fill-theme-text font-bold font-mono text-[10px] uppercase">1. DATA STREAM SOURCES</text>
                        <text x="270" y="105" className="fill-theme-text font-bold font-mono text-[11px] uppercase">2. STAD_OPS COORDINATION CORE</text>
                        <text x="595" y="45" className="fill-theme-text font-bold font-mono text-[10px] uppercase">3. DETERMINISTIC ACTION API</text>

                        {/* Sources */}
                        <g transform="translate(30, 60)">
                          <rect width="160" height="40" rx="2" fill="var(--bg-panel)" stroke="var(--border)" strokeWidth="1" />
                          <text x="10" y="25" className="fill-theme-text font-mono text-[11px]">IoT Gates (Inflow/Wait)</text>
                        </g>
                        <g transform="translate(30, 115)">
                          <rect width="160" height="40" rx="2" fill="var(--bg-panel)" stroke="var(--border)" strokeWidth="1" />
                          <text x="10" y="25" className="fill-theme-text font-mono text-[11px]">Vision Cam Logs (Scene)</text>
                        </g>
                        <g transform="translate(30, 170)">
                          <rect width="160" height="40" rx="2" fill="var(--bg-panel)" stroke="var(--border)" strokeWidth="1" />
                          <text x="10" y="25" className="fill-theme-text font-mono text-[11px]">Transit API Delays</text>
                        </g>

                        {/* Core Engine */}
                        <g transform="translate(265, 120)">
                          <rect width="250" height="70" rx="2" fill="var(--bg-panel)" stroke="var(--text-primary)" strokeWidth="1.5" />
                          <text x="15" y="25" className="fill-theme-text font-bold font-mono text-xs">High-Availability Ingestion Core</text>
                          <text x="15" y="45" className="fill-theme-muted font-mono text-[10px]">Strict System Schema Enforcement</text>
                          <text x="15" y="58" className="fill-theme-muted font-mono text-[9px]">(SYSTEM BALANCING: OPTIMAL)</text>
                        </g>

                        {/* Action Layers */}
                        <g transform="translate(595, 60)">
                          <rect width="170" height="40" rx="2" fill="var(--bg-panel)" stroke="var(--border)" strokeWidth="1" />
                          <text x="10" y="25" className="fill-theme-text font-mono text-[11px]">Digital Signs API</text>
                        </g>
                        <g transform="translate(595, 115)">
                          <rect width="170" height="40" rx="2" fill="var(--bg-panel)" stroke="var(--border)" strokeWidth="1" />
                          <text x="10" y="25" className="fill-theme-text font-mono text-[11px]">Emergency Dispatch Webhook</text>
                        </g>
                        <g transform="translate(595, 170)">
                          <rect width="170" height="40" rx="2" fill="var(--bg-panel)" stroke="var(--border)" strokeWidth="1" />
                          <text x="10" y="25" className="fill-theme-text font-mono text-[11px]">Eco-Shuttle Bus Allocation</text>
                        </g>

                        {/* Arrows */}
                        <path d="M 200 80 Q 225 80 250 120" stroke="var(--border)" strokeWidth="1.5" fill="none" />
                        <path d="M 200 135 L 250 145" stroke="var(--border)" strokeWidth="1.5" fill="none" />
                        <path d="M 200 190 Q 225 190 250 170" stroke="var(--border)" strokeWidth="1.5" fill="none" />

                        <path d="M 530 130 Q 555 100 595 80" stroke="var(--text-primary)" strokeWidth="1.5" fill="none" />
                        <path d="M 530 155 L 595 135" stroke="var(--text-primary)" strokeWidth="1.5" fill="none" />
                        <path d="M 530 180 Q 555 200 595 190" stroke="var(--text-primary)" strokeWidth="1.5" fill="none" />
                      </svg>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-theme-text uppercase text-xs">Critical Tech Stack Choices:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          <strong className="text-theme-text">Core Dispatch Processors:</strong> <code className="bg-theme-bg px-1.5 py-0.5 rounded-xl border border-theme-border text-theme-text">SCOPE Node Engine</code> serves as the central data consolidation and pattern-matching core due to its sub-second telemetry processing latency and flawless support for complex structured JSON schemas.
                        </li>
                        <li>
                          <strong className="text-theme-text">Structured Schema Enforcement:</strong> We leverage strict schema enforcement. Rather than standard text generation, the system's output is structurally locked to compile exactly with our operational database definitions.
                        </li>
                        <li>
                          <strong className="text-theme-text">Secure API Gateway:</strong> An Express server hosts secure endpoints that hide authentication secrets from the client-side, performing all telemetry processing securely on the backend as mandated by Lead Architects.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: STEP-BY-STEP IMPLEMENTATION ROADMAP */}
              {activeBlueprintSection === "roadmap" && (
                <div className="space-y-6">
                  <div className="space-y-2 border-b border-theme-border pb-4">
                    <h3 className="text-sm font-bold text-theme-text uppercase tracking-wider">
                      4. STEP-BY-STEP IMPLEMENTATION ROADMAP
                    </h3>
                    <p className="text-[10px] text-theme-muted uppercase tracking-widest font-mono">
                      Concrete Engineering Execution Plan
                    </p>
                  </div>

                  <div className="space-y-6 text-sm text-theme-muted">

                    {/* STEP 1 */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-theme-text flex items-center space-x-2">
                        <span className="bg-theme-bg text-theme-text border border-theme-border px-2 py-0.5 rounded-xl font-mono text-xs">STEP 1</span>
                        <span>Data Ingestion & Validation Schema Design</span>
                      </h4>
                      <p>
                        Create the ingestion pipelines for IoT sensors. Enforce a rigorous, unyielding schema template that compiles with strict structural JSON schemas for peripheral controls:
                      </p>
                      <div className="bg-theme-bg p-4 rounded-xl border border-theme-border font-mono text-[11px] text-theme-text overflow-x-auto">
                        <pre>{`const responseSchema = {
  type: Type.OBJECT,
  properties: {
    status: { type: Type.STRING },
    analysis: { type: Type.STRING },
    updatedSignage: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          signId: { type: Type.STRING },
          recommendedText: { type: Type.STRING },
          reasoning: { type: Type.STRING }
        },
        required: ["signId", "recommendedText", "reasoning"]
      }
    }
  },
  required: ["status", "analysis", "updatedSignage"]
};`}</pre>
                      </div>
                    </div>

                    {/* STEP 2 */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-theme-text flex items-center space-x-2">
                        <span className="bg-theme-bg text-theme-text border border-theme-border px-2 py-0.5 rounded-xl font-mono text-xs">STEP 2</span>
                        <span>Standard Operating Procedure Indexing</span>
                      </h4>
                      <p>
                        Compile official FIFA and stadium operations manuals into a high-availability indexing pipeline and synchronize with an operational database.
                      </p>
                      <p>
                        During incident correlation, perform a structured index search on active alert keywords to retrieve precise SOP guidelines, applying them directly to system task checklists.
                      </p>
                    </div>

                    {/* STEP 3 */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-theme-text flex items-center space-x-2">
                        <span className="bg-theme-bg text-theme-text border border-theme-border px-2 py-0.5 rounded-xl font-mono text-xs">STEP 3</span>
                        <span>Event-Driven Autonomic Execution Loops</span>
                      </h4>
                      <p>
                        Rather than waiting for manual user queries, the server schedules a cron evaluation every 30 seconds. The cron script queries live ingress tables and security log streams, evaluates differences, and dynamically fires the Action Layer webhooks when thresholds are breached.
                      </p>
                    </div>

                  </div>
                </div>
              )}

              {/* SECTION 5: SYSTEM INTEGRITY & OPERATIONAL EFFICIENCY */}
              {activeBlueprintSection === "evaluation" && (
                <div className="space-y-6">
                  <div className="space-y-2 border-b border-theme-border pb-4">
                    <h3 className="text-sm font-bold text-theme-text uppercase tracking-wider">
                      5. SYSTEM INTEGRITY & OPERATIONAL EFFICIENCY
                    </h3>
                    <p className="text-[10px] text-theme-muted uppercase tracking-widest font-mono">
                      System Resilience and High-Throughput Verification
                    </p>
                  </div>

                  <div className="space-y-4 text-xs text-theme-muted leading-relaxed font-mono uppercase">
                    <p>
                      Unlike basic informational interfaces, SCOPE is optimized for mission-critical tournament operations due to these core engineering dimensions:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="bg-theme-bg p-4 rounded-xl border border-theme-border space-y-2">
                        <strong className="text-theme-text block font-mono">A. Real Practical Scale</strong>
                        <p className="text-xs text-theme-muted font-mono">
                          Instead of toys, this system coordinates stadium gates holding 80,000+ spectators, addressing high-risk crush points and medical hazards.
                        </p>
                      </div>

                      <div className="bg-theme-bg p-4 rounded-xl border border-theme-border space-y-2">
                        <strong className="text-theme-text block font-mono">B. Machine-to-Machine Ingestion</strong>
                        <p className="text-xs text-theme-muted font-mono">
                          Showcasing background processing engines driving physical signage and API webhooks proves the system is ready for deep industrial control integration.
                        </p>
                      </div>

                      <div className="bg-theme-bg p-4 rounded-xl border border-theme-border space-y-2">
                        <strong className="text-theme-text block font-mono">C. Native Multimodal Synthesis</strong>
                        <p className="text-xs text-theme-muted font-mono">
                          Demonstrates combining voice/text incidents in French, Spanish, or Portuguese directly with numerical IoT load feeds and vector manuals.
                        </p>
                      </div>

                      <div className="bg-theme-bg p-4 rounded-xl border border-theme-border space-y-2">
                        <strong className="text-theme-text block font-mono">D. Environmental Sustainability</strong>
                        <p className="text-xs text-theme-muted font-mono">
                          Directly maps match-duration predictions to electric transportation pre-allocation, optimizing eco-bus battery charge cycles.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </motion.div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-theme-border/40 bg-theme-panel/50 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-theme-muted">
        {/* Left: Project name */}
        <div className="font-bold text-theme-text uppercase tracking-wider">
          SCOPE
        </div>

        {/* Middle: 3 words about it */}
        <div className="text-center font-medium tracking-wide">
          Stadium Telemetry Core
        </div>

        {/* Right: Built by link */}
        <div className="text-right">
          <a
            href={["https:", "", "github.com", "aryxncodes7"].join("/")}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-theme-text font-semibold transition-colors underline decoration-theme-accent/30 underline-offset-4 hover:decoration-theme-accent"
          >
            Built by Aryan Raj
          </a>
        </div>
      </footer>

    </div>
  );
}
