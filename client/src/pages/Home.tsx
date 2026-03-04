/**
 * NET-60 GENERATOR
 * Design Philosophy: Brutalist editorial — monospaced output, stark contrast,
 * newspaper-column layout. The tool should feel like a production terminal,
 * not a consumer app. Dark background, amber/white accents, no rounded corners.
 *
 * Layout: Left sidebar (parameters) | Right main (output)
 * Typography: JetBrains Mono for output blocks, Inter for UI chrome
 *
 * Two-Prompt Output:
 *   Prompt 1 — Scene (satirical beat, no CTA)
 *   Prompt 2 — CTA Cutaway (artistically framed object + tagline + client name)
 */

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Copy, Check, Download, Zap, RefreshCw,
  ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Film, Megaphone, Plus, X,
} from "lucide-react";
import {
  generateEpisode,
  generateBatch,
  validateEpisode,
  ALL_DOMAINS,
  DEFAULT_BATCH_DOMAINS,
  NET60_TOKENS,
  BLUR_LANGUAGE,
  type EpisodeParams,
  type BatchParams,
  type GeneratedEpisode,
  type Domain,
  type Mode,
  type UrgencyLevel,
  type VisualStyle,
  type CTAFocus,
  type ToneIntensity,
  type BlurIntensity,
} from "@/lib/net60Engine";

type AppMode = "single" | "batch";

// ── Custom option lists (user-extensible) ─────────────────────
const DEFAULT_VISUAL_STYLES: VisualStyle[] = [
  "Locked tripod",
  "Subtle handheld",
  "Symmetrical frame",
  "Close-up realism",
  "Slow push-in",
  "Slow pull-out",
  "Overhead / bird's eye",
  "Dutch angle",
  "Rack focus",
  "Tracking shot",
];

const DEFAULT_TONE_OPTIONS: ToneIntensity[] = [
  "Deadpan neutral",
  "Slightly ironic",
  "Clinical",
  "Corporate calm",
  "Dry seriousness",
  "Bureaucratic warmth",
  "Cheerful indifference",
  "Apologetically firm",
  "Overly formal",
  "Robotic sincerity",
  "Passive aggressive",
  "Sympathetic but unhelpful",
];

const DEFAULT_CTA_OPTIONS: CTAFocus[] = [
  "Cash flow",
  "Payroll",
  "Working capital",
  "Growth",
  "Momentum",
  "Operations",
  "General AR",
  "Invoice financing",
  "Bridge funding",
  "Supply chain",
  "Vendor payments",
  "Client retention",
];

export default function Home() {
  const [appMode, setAppMode] = useState<AppMode>("single");

  // Single episode params
  const [mode, setMode] = useState<Mode>("POC_SINGLE");
  const [domain, setDomain] = useState<Domain>("Health");
  const [scenarioOverride, setScenarioOverride] = useState<string>("__auto__");
  const [delorification, setDelorification] = useState(false);
  const [urgency, setUrgency] = useState<UrgencyLevel>("Moderate");
  const [visualStyle, setVisualStyle] = useState<VisualStyle>("Locked tripod");
  const [settingConstraints, setSettingConstraints] = useState("No recurring characters");
  const [ctaFocus, setCtaFocus] = useState<CTAFocus>("Cash flow");
  const [toneIntensity, setToneIntensity] = useState<ToneIntensity>("Deadpan neutral");
  const [maxRuntime, setMaxRuntime] = useState(false);
  const [clientSubjectName, setClientSubjectName] = useState("");
  const [blurIntensity, setBlurIntensity] = useState<BlurIntensity>("medium");

  // Batch params
  const [batchStructure, setBatchStructure] = useState<"POC_SINGLE" | "POC_DOUBLE">("POC_SINGLE");
  const [delorRatio, setDelorRatio] = useState(3);
  const [batchDomains, setBatchDomains] = useState<Domain[]>(DEFAULT_BATCH_DOMAINS);
  const [batchVisualStyle, setBatchVisualStyle] = useState<VisualStyle | "Mixed but restrained">("Locked tripod");
  const [batchCtaFocus, setBatchCtaFocus] = useState<CTAFocus | "Mixed">("Mixed");
  const [batchTone, setBatchTone] = useState<ToneIntensity>("Deadpan neutral");
  const [experimentalSlot, setExperimentalSlot] = useState(false);
  const [batchMaxRuntime, setBatchMaxRuntime] = useState(false);
  const [urgencyDist, setUrgencyDist] = useState({ low: 3, moderate: 3, high: 3, critical: 1 });
  const [batchClientName, setBatchClientName] = useState("");

  // Custom option lists (user-extensible)
  const [visualStyles, setVisualStyles] = useState<VisualStyle[]>(DEFAULT_VISUAL_STYLES);
  const [toneOptions, setToneOptions] = useState<ToneIntensity[]>(DEFAULT_TONE_OPTIONS);
  const [ctaOptions, setCtaOptions] = useState<CTAFocus[]>(DEFAULT_CTA_OPTIONS);

  // Add-option dialog state
  const [addDialogTarget, setAddDialogTarget] = useState<"visual" | "tone" | "cta" | null>(null);
  const [addDialogValue, setAddDialogValue] = useState("");

  const handleAddOption = () => {
    const val = addDialogValue.trim();
    if (!val) return;
    if (addDialogTarget === "visual") {
      if (!visualStyles.includes(val)) setVisualStyles(prev => [...prev, val]);
      setVisualStyle(val);
    } else if (addDialogTarget === "tone") {
      if (!toneOptions.includes(val)) setToneOptions(prev => [...prev, val]);
      setToneIntensity(val);
    } else if (addDialogTarget === "cta") {
      if (!ctaOptions.includes(val)) setCtaOptions(prev => [...prev, val]);
      setCtaFocus(val);
    }
    setAddDialogTarget(null);
    setAddDialogValue("");
    toast.success(`Added "${val}" to options`);
  };

  // Output state
  const [episodes, setEpisodes] = useState<GeneratedEpisode[]>([]);
  const [expandedEpisode, setExpandedEpisode] = useState<number | null>(0);
  const [generating, setGenerating] = useState(false);
  const [lastSingleParams, setLastSingleParams] = useState<EpisodeParams | null>(null);

  // Sync domain when scenario override changes
  const handleScenarioOverride = (val: string) => {
    setScenarioOverride(val);
    if (val !== "__auto__") {
      const token = NET60_TOKENS.find(t => t.scenario_id === val);
      if (token) setDomain(token.domain);
    }
  };

  // Filtered scenario list for current domain (or all if auto)
  const scenariosForDomain = scenarioOverride === "__auto__"
    ? NET60_TOKENS.filter(t => t.domain === domain)
    : NET60_TOKENS;

  const buildSingleParams = (): EpisodeParams => ({
    mode,
    domain,
    delorification,
    urgency_level: urgency,
    visual_style: visualStyle,
    setting_constraints: settingConstraints,
    cta_focus: ctaFocus,
    tone_intensity: toneIntensity,
    max_runtime_mode: maxRuntime,
    client_subject_name: clientSubjectName.trim() || undefined,
    scenario_id_override: scenarioOverride !== "__auto__" ? scenarioOverride : undefined,
    blur_intensity: blurIntensity,
  });

  const handleGenerateSingle = () => {
    setGenerating(true);
    setTimeout(() => {
      const params = buildSingleParams();
      setLastSingleParams(params);
      const episode = generateEpisode(params);
      const validation = validateEpisode(episode);
      if (!validation.valid) {
        toast.error(`Validation failed: ${validation.issues.join(", ")}`);
      } else {
        setEpisodes([episode]);
        setExpandedEpisode(0);
        toast.success("Episode generated");
      }
      setGenerating(false);
    }, 300);
  };

  const handleRegenerate = () => {
    if (!lastSingleParams) return;
    setGenerating(true);
    setTimeout(() => {
      const episode = generateEpisode(lastSingleParams);
      const validation = validateEpisode(episode);
      if (!validation.valid) {
        toast.error(`Validation failed: ${validation.issues.join(", ")}`);
      } else {
        setEpisodes([episode]);
        setExpandedEpisode(0);
        toast.success("Regenerated");
      }
      setGenerating(false);
    }, 300);
  };

  const handleGenerateBatch = () => {
    setGenerating(true);
    setTimeout(() => {
      const params: BatchParams = {
        structure_mode: batchStructure,
        delorification_ratio: delorRatio,
        urgency_distribution: urgencyDist,
        domains: batchDomains,
        visual_style_consistency: batchVisualStyle,
        cta_focus: batchCtaFocus,
        tone_baseline: batchTone,
        experimental_slot: experimentalSlot,
        max_runtime_mode: batchMaxRuntime,
        client_subject_name: batchClientName.trim() || undefined,
      };
      const batch = generateBatch(params);
      setEpisodes(batch);
      setExpandedEpisode(0);
      toast.success(`Batch of ${batch.length} episodes generated`);
      setGenerating(false);
    }, 400);
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyPrompt = useCallback((prompt: string, id: string) => {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopiedId(id);
      toast.success("Prompt copied — paste directly into VEO 3");
      setTimeout(() => setCopiedId(null), 2500);
    });
  }, []);

  const exportAll = () => {
    const content = episodes
      .map(
        (ep, i) =>
          `## Episode ${String(i + 1).padStart(2, "0")} — ${ep.scenario_id}\n\n` +
          `**MODE:** ${ep.mode}  |  **DOMAIN:** ${ep.domain}  |  **DELORIFIED:** ${ep.delorified ? "YES" : "NO"}\n\n` +
          `### SPOT BREAKDOWN\n` +
          `**S:** ${ep.spot_breakdown.S}\n\n` +
          `**P:** ${ep.spot_breakdown.P}\n\n` +
          `**O:** ${ep.spot_breakdown.O}\n\n` +
          `**T:** ${ep.spot_breakdown.T}\n\n` +
          `### PROMPT 1 — SCENE\n\`\`\`\n${ep.veo_prompt_1}\n\`\`\`\n\n` +
          `### PROMPT 2 — CTA CUTAWAY\n\`\`\`\n${ep.veo_prompt_2}\n\`\`\`\n\n` +
          `### CTA\n> ${ep.cta}\n\n---\n`
      )
      .join("\n");

    const blob = new Blob([`# NET-60 GENERATED EPISODES\n\n${content}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `net60-episodes-${Date.now()}.md`;
    a.click();
    toast.success("Exported all episodes");
  };

  const toggleDomain = (d: Domain) => {
    setBatchDomains((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : prev.length < 10 ? [...prev, d] : prev
    );
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e8e8e8] font-mono">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest uppercase text-white">
            NET-60 GENERATOR
          </h1>
          <p className="text-xs text-[#666] mt-0.5 tracking-wider">
            EVERYTHING IS NET-60 · VEO 3 PROMPT ENGINE · SPOT COMPLIANT
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAppMode("single")}
            className={`px-4 py-1.5 text-xs tracking-widest uppercase border transition-colors ${
              appMode === "single"
                ? "border-[#f5a623] text-[#f5a623] bg-[#f5a62315]"
                : "border-[#333] text-[#666] hover:border-[#555] hover:text-[#999]"
            }`}
          >
            Single Episode
          </button>
          <button
            onClick={() => setAppMode("batch")}
            className={`px-4 py-1.5 text-xs tracking-widest uppercase border transition-colors ${
              appMode === "batch"
                ? "border-[#f5a623] text-[#f5a623] bg-[#f5a62315]"
                : "border-[#333] text-[#666] hover:border-[#555] hover:text-[#999]"
            }`}
          >
            ⚡ Rapid Batch (10)
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-65px)]">
        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
        <aside className="w-80 border-r border-[#2a2a2a] overflow-y-auto flex-shrink-0">
          <div className="p-5 space-y-5">

            {appMode === "single" ? (
              <>
                {/* SCENARIO SELECTOR */}
                <ParamBlock label="SCENARIO">
                  <Select value={scenarioOverride} onValueChange={handleScenarioOverride}>
                    <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-[#e8e8e8] font-mono text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#333] font-mono text-xs max-h-72">
                      <SelectItem value="__auto__">AUTO — match by domain</SelectItem>
                      <div className="border-t border-[#2a2a2a] my-1" />
                      {NET60_TOKENS.map((t) => (
                        <SelectItem key={t.scenario_id} value={t.scenario_id}>
                          {t.scenario_id} · {t.domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {scenarioOverride !== "__auto__" && (
                    <p className="text-[10px] text-[#f5a623] mt-1">
                      ↳ Scenario locked. Domain auto-synced.
                    </p>
                  )}
                </ParamBlock>

                {/* DOMAIN (shown when auto) */}
                {scenarioOverride === "__auto__" && (
                  <ParamBlock label="DOMAIN">
                    <Select value={domain} onValueChange={(v) => setDomain(v as Domain)}>
                      <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-[#e8e8e8] font-mono text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#333] font-mono text-xs max-h-60">
                        {ALL_DOMAINS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-[#555] mt-1">
                      {NET60_TOKENS.filter(t => t.domain === domain).length} token(s) in domain
                    </p>
                  </ParamBlock>
                )}

                {/* MODE */}
                <ParamBlock label="MODE">
                  <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
                    <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-[#e8e8e8] font-mono text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#333] font-mono text-xs">
                      <SelectItem value="POC_SINGLE">POC_SINGLE — 1 shot, ≤8s</SelectItem>
                      <SelectItem value="POC_DOUBLE">POC_DOUBLE — 2 shots, ≤8s each</SelectItem>
                      <SelectItem value="EPISODIC">EPISODIC — up to 4 shots</SelectItem>
                    </SelectContent>
                  </Select>
                </ParamBlock>

                {/* DELORIFICATION */}
                <ParamBlock label="DELORIFICATION">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#999]">{delorification ? "TRUE — Delores active" : "FALSE — Contextual authority"}</span>
                    <Switch
                      checked={delorification}
                      onCheckedChange={setDelorification}
                      className="data-[state=checked]:bg-[#f5a623]"
                    />
                  </div>
                  {delorification && (
                    <p className="text-[10px] text-[#f5a623] mt-1 italic">
                      "Accounts Payable. This is Delores speaking."
                    </p>
                  )}
                </ParamBlock>

                {/* URGENCY LEVEL */}
                <ParamBlock label="URGENCY LEVEL">
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["Low", "Moderate", "High", "Critical"] as UrgencyLevel[]).map((u) => (
                      <button
                        key={u}
                        onClick={() => setUrgency(u)}
                        className={`px-2 py-1.5 text-[10px] tracking-wider uppercase border transition-colors ${
                          urgency === u
                            ? "border-[#f5a623] text-[#f5a623] bg-[#f5a62315]"
                            : "border-[#333] text-[#555] hover:border-[#555] hover:text-[#999]"
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </ParamBlock>

                {/* VISUAL STYLE */}
                <ParamBlock label="VISUAL STYLE">
                  <Select value={visualStyle} onValueChange={(v) => {
                    if (v === "__add__") { setAddDialogTarget("visual"); setAddDialogValue(""); }
                    else setVisualStyle(v as VisualStyle);
                  }}>
                    <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-[#e8e8e8] font-mono text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#333] font-mono text-xs max-h-64">
                      {visualStyles.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                      <div className="border-t border-[#2a2a2a] my-1" />
                      <SelectItem value="__add__" className="text-[#f5a623]">
                        <span className="flex items-center gap-1.5"><Plus size={10} /> Add custom style…</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </ParamBlock>

                {/* CTA FOCUS */}
                <ParamBlock label="CTA FOCUS">
                  <Select value={ctaFocus} onValueChange={(v) => {
                    if (v === "__add__") { setAddDialogTarget("cta"); setAddDialogValue(""); }
                    else setCtaFocus(v as CTAFocus);
                  }}>
                    <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-[#e8e8e8] font-mono text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#333] font-mono text-xs max-h-64">
                      {ctaOptions.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                      <div className="border-t border-[#2a2a2a] my-1" />
                      <SelectItem value="__add__" className="text-[#f5a623]">
                        <span className="flex items-center gap-1.5"><Plus size={10} /> Add custom focus…</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </ParamBlock>

                {/* TONE INTENSITY */}
                <ParamBlock label="TONE INTENSITY">
                  <Select value={toneIntensity} onValueChange={(v) => {
                    if (v === "__add__") { setAddDialogTarget("tone"); setAddDialogValue(""); }
                    else setToneIntensity(v as ToneIntensity);
                  }}>
                    <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-[#e8e8e8] font-mono text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#333] font-mono text-xs max-h-64">
                      {toneOptions.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                      <div className="border-t border-[#2a2a2a] my-1" />
                      <SelectItem value="__add__" className="text-[#f5a623]">
                        <span className="flex items-center gap-1.5"><Plus size={10} /> Add custom tone…</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </ParamBlock>

                {/* CLIENT / SUBJECT NAME */}
                <ParamBlock label="CLIENT / SUBJECT NAME">
                  <input
                    type="text"
                    value={clientSubjectName}
                    onChange={(e) => setClientSubjectName(e.target.value)}
                    placeholder="e.g. Capstone Financial"
                    className="w-full bg-[#1a1a1a] border border-[#333] text-[#e8e8e8] font-mono text-xs px-3 py-2 placeholder:text-[#444] focus:outline-none focus:border-[#f5a623] transition-colors"
                  />
                  <p className="text-[10px] text-[#555] mt-1">
                    Spoken in Prompt 2 CTA voiceover. Leave blank to omit.
                  </p>
                </ParamBlock>

                {/* BLUR INTENSITY — PROMPT 2 */}
                <ParamBlock label={`PROMPT 2 BLUR: ${BLUR_LANGUAGE[blurIntensity].label.toUpperCase()}`}>
                  <Slider
                    value={[(["subtle", "light", "medium", "heavy", "maximum"] as BlurIntensity[]).indexOf(blurIntensity)]}
                    onValueChange={([v]) => setBlurIntensity((["subtle", "light", "medium", "heavy", "maximum"] as BlurIntensity[])[v])}
                    min={0} max={4} step={1}
                    className="[&_[role=slider]]:bg-[#4a9eff] [&_[role=slider]]:border-[#4a9eff] [&_.relative]:bg-[#1a1a1a] [&_[data-orientation=horizontal]_.absolute]:bg-[#4a9eff]"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-[#444] uppercase tracking-wider">Subtle</span>
                    <span className="text-[9px] text-[#444] uppercase tracking-wider">Maximum</span>
                  </div>
                  <p className="text-[10px] text-[#4a9eff] mt-1 leading-relaxed">
                    {BLUR_LANGUAGE[blurIntensity].description.split("—")[0].trim()}
                  </p>
                </ParamBlock>

                {/* MAX RUNTIME MODE */}
                <ParamBlock label="MAX RUNTIME MODE">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#999]">{maxRuntime ? "Ultra-compact 8s" : "Standard"}</span>
                    <Switch
                      checked={maxRuntime}
                      onCheckedChange={setMaxRuntime}
                      className="data-[state=checked]:bg-[#f5a623]"
                    />
                  </div>
                </ParamBlock>

                {/* GENERATE + REGENERATE */}
                <div className="space-y-2">
                  <button
                    onClick={handleGenerateSingle}
                    disabled={generating}
                    className="w-full py-3 bg-[#f5a623] text-black text-xs font-bold tracking-widest uppercase hover:bg-[#e09510] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> GENERATING...</>
                    ) : (
                      <><Zap className="w-3.5 h-3.5" /> GENERATE EPISODE</>
                    )}
                  </button>
                  {episodes.length > 0 && appMode === "single" && (
                    <button
                      onClick={handleRegenerate}
                      disabled={generating}
                      className="w-full py-2.5 bg-transparent border border-[#333] text-[#666] text-xs font-bold tracking-widest uppercase hover:border-[#555] hover:text-[#999] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> REGENERATE
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* BATCH MODE PARAMS */}
                <ParamBlock label="STRUCTURE MODE">
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["POC_SINGLE", "POC_DOUBLE"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setBatchStructure(s)}
                        className={`px-2 py-1.5 text-[10px] tracking-wider uppercase border transition-colors ${
                          batchStructure === s
                            ? "border-[#f5a623] text-[#f5a623] bg-[#f5a62315]"
                            : "border-[#333] text-[#555] hover:border-[#555] hover:text-[#999]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </ParamBlock>

                <ParamBlock label={`DELORIFICATION RATIO: ${delorRatio}/10`}>
                  <Slider
                    value={[delorRatio]}
                    onValueChange={([v]) => setDelorRatio(v)}
                    min={0} max={10} step={1}
                    className="[&_[role=slider]]:bg-[#f5a623] [&_[role=slider]]:border-[#f5a623]"
                  />
                  <p className="text-[10px] text-[#555] mt-1">
                    {delorRatio} of 10 episodes will use Delores voice
                  </p>
                </ParamBlock>

                <ParamBlock label="URGENCY DISTRIBUTION">
                  <div className="space-y-2">
                    {(["low", "moderate", "high", "critical"] as const).map((u) => (
                      <div key={u} className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-[#666]">{u}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setUrgencyDist(prev => ({ ...prev, [u]: Math.max(0, prev[u] - 1) }))}
                            className="w-5 h-5 border border-[#333] text-[#666] hover:border-[#555] hover:text-[#999] text-xs flex items-center justify-center"
                          >−</button>
                          <span className="text-xs w-4 text-center text-[#e8e8e8]">{urgencyDist[u]}</span>
                          <button
                            onClick={() => setUrgencyDist(prev => ({ ...prev, [u]: Math.min(10, prev[u] + 1) }))}
                            className="w-5 h-5 border border-[#333] text-[#666] hover:border-[#555] hover:text-[#999] text-xs flex items-center justify-center"
                          >+</button>
                        </div>
                      </div>
                    ))}
                    <p className="text-[10px] text-[#555]">
                      Total: {urgencyDist.low + urgencyDist.moderate + urgencyDist.high + urgencyDist.critical} / 10
                    </p>
                  </div>
                </ParamBlock>

                <ParamBlock label={`DOMAIN ROTATION (${batchDomains.length}/10)`}>
                  <div className="flex flex-wrap gap-1">
                    {ALL_DOMAINS.map((d) => (
                      <button
                        key={d}
                        onClick={() => toggleDomain(d)}
                        className={`px-1.5 py-0.5 text-[9px] tracking-wider uppercase border transition-colors ${
                          batchDomains.includes(d)
                            ? "border-[#f5a623] text-[#f5a623] bg-[#f5a62315]"
                            : "border-[#333] text-[#555] hover:border-[#555]"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </ParamBlock>

                <ParamBlock label="VISUAL STYLE CONSISTENCY">
                  <Select value={batchVisualStyle} onValueChange={(v) => setBatchVisualStyle(v as any)}>
                    <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-[#e8e8e8] font-mono text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#333] font-mono text-xs">
                      <SelectItem value="Locked tripod">Locked tripod</SelectItem>
                      <SelectItem value="Subtle handheld">Subtle handheld</SelectItem>
                      <SelectItem value="Symmetrical frame">Symmetrical frame</SelectItem>
                      <SelectItem value="Mixed but restrained">Mixed but restrained</SelectItem>
                    </SelectContent>
                  </Select>
                </ParamBlock>

                <ParamBlock label="CTA FOCUS">
                  <Select value={batchCtaFocus} onValueChange={(v) => setBatchCtaFocus(v as any)}>
                    <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-[#e8e8e8] font-mono text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#333] font-mono text-xs">
                      <SelectItem value="Mixed">Mixed</SelectItem>
                      {(["Cash flow", "Payroll", "Working capital", "Growth", "Momentum", "Operations", "General AR"] as CTAFocus[]).map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </ParamBlock>

                <ParamBlock label="TONE BASELINE">
                  <Select value={batchTone} onValueChange={(v) => setBatchTone(v as ToneIntensity)}>
                    <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-[#e8e8e8] font-mono text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#333] font-mono text-xs">
                      {(["Deadpan neutral", "Slightly ironic", "Clinical", "Corporate calm", "Dry seriousness"] as ToneIntensity[]).map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </ParamBlock>

                {/* BATCH CLIENT NAME */}
                <ParamBlock label="CLIENT / SUBJECT NAME">
                  <input
                    type="text"
                    value={batchClientName}
                    onChange={(e) => setBatchClientName(e.target.value)}
                    placeholder="e.g. Capstone Financial"
                    className="w-full bg-[#1a1a1a] border border-[#333] text-[#e8e8e8] font-mono text-xs px-3 py-2 placeholder:text-[#444] focus:outline-none focus:border-[#f5a623] transition-colors"
                  />
                  <p className="text-[10px] text-[#555] mt-1">
                    Applied to all CTA cutaway prompts in batch.
                  </p>
                </ParamBlock>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-[#666]">Experimental Slot (Ep. 10)</span>
                    <Switch checked={experimentalSlot} onCheckedChange={setExperimentalSlot} className="data-[state=checked]:bg-[#f5a623]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-[#666]">Max Runtime Mode</span>
                    <Switch checked={batchMaxRuntime} onCheckedChange={setBatchMaxRuntime} className="data-[state=checked]:bg-[#f5a623]" />
                  </div>
                </div>

                <button
                  onClick={handleGenerateBatch}
                  disabled={generating || batchDomains.length < 1}
                  className="w-full py-3 bg-[#f5a623] text-black text-xs font-bold tracking-widest uppercase hover:bg-[#e09510] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> GENERATING BATCH...</>
                  ) : (
                    <><Zap className="w-3.5 h-3.5" /> GENERATE 10 EPISODES</>
                  )}
                </button>
              </>
            )}
          </div>
        </aside>

        {/* ── ADD CUSTOM OPTION MODAL ─────────────────────────────────────── */}
        {addDialogTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setAddDialogTarget(null)}>
            <div
              className="bg-[#1a1a1a] border border-[#f5a623] p-6 w-96 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold tracking-widest uppercase text-[#f5a623]">
                  ADD CUSTOM {addDialogTarget === "visual" ? "VISUAL STYLE" : addDialogTarget === "tone" ? "TONE" : "CTA FOCUS"}
                </p>
                <button onClick={() => setAddDialogTarget(null)} className="text-[#555] hover:text-[#e8e8e8] transition-colors">
                  <X size={14} />
                </button>
              </div>
              <input
                autoFocus
                type="text"
                value={addDialogValue}
                onChange={(e) => setAddDialogValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddOption(); if (e.key === "Escape") setAddDialogTarget(null); }}
                placeholder={
                  addDialogTarget === "visual" ? "e.g. Slow dolly push-in" :
                  addDialogTarget === "tone" ? "e.g. Cheerful indifference" :
                  "e.g. Invoice financing"
                }
                className="w-full bg-[#0f0f0f] border border-[#333] text-[#e8e8e8] font-mono text-xs px-3 py-2.5 placeholder:text-[#444] focus:outline-none focus:border-[#f5a623] transition-colors"
              />
              <p className="text-[10px] text-[#555] leading-relaxed">
                {addDialogTarget === "visual" && "Describe the camera movement or framing style. This will be injected directly into the generated prompt."}
                {addDialogTarget === "tone" && "Describe the delivery tone. This will be used to characterize how the authority figure delivers the Net 60 line."}
                {addDialogTarget === "cta" && "Describe the CTA focus area. This will shape the tagline and voiceover in Prompt 2."}
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleAddOption}
                  disabled={!addDialogValue.trim()}
                  className="flex-1 px-4 py-2 bg-[#f5a623] text-black text-xs font-bold tracking-widest uppercase hover:bg-[#f5a623]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ADD &amp; SELECT
                </button>
                <button
                  onClick={() => setAddDialogTarget(null)}
                  className="px-4 py-2 border border-[#333] text-xs text-[#666] hover:border-[#555] hover:text-[#999] transition-colors uppercase tracking-wider"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── RIGHT MAIN: Output ───────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          {episodes.length === 0 ? (
            <EmptyState mode={appMode} />
          ) : (
            <div className="p-6 space-y-4">
              {episodes.length > 1 && (
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-sm font-bold tracking-widest uppercase text-white">
                      BATCH OUTPUT — {episodes.length} EPISODES
                    </h2>
                    <p className="text-[10px] text-[#555] mt-0.5">
                      {episodes.filter(e => e.delorified).length} Delorified · {episodes.filter(e => !e.delorified).length} Contextual Authority
                    </p>
                  </div>
                  <button
                    onClick={exportAll}
                    className="flex items-center gap-2 px-4 py-2 border border-[#333] text-xs text-[#999] hover:border-[#555] hover:text-[#e8e8e8] transition-colors uppercase tracking-wider"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export All (.md)
                  </button>
                </div>
              )}

              {episodes.map((ep, idx) => (
                <EpisodeCard
                  key={ep.scenario_id}
                  episode={ep}
                  index={idx}
                  expanded={expandedEpisode === idx}
                  onToggle={() => setExpandedEpisode(expandedEpisode === idx ? null : idx)}
                  onCopy={copyPrompt}
                  copiedId={copiedId}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ParamBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] tracking-widest uppercase text-[#555] font-bold">{label}</p>
      {children}
    </div>
  );
}

function PromptBlock({
  label,
  icon,
  prompt,
  promptId,
  onCopy,
  copiedId,
  accentColor = "#f5a623",
  note,
}: {
  label: string;
  icon: React.ReactNode;
  prompt: string;
  promptId: string;
  onCopy: (prompt: string, id: string) => void;
  copiedId: string | null;
  accentColor?: string;
  note?: string;
}) {
  const isCopied = copiedId === promptId;
  const [editedPrompt, setEditedPrompt] = useState(prompt);
  const [isEditing, setIsEditing] = useState(false);

  // Sync when a new prompt is generated
  const prevPromptRef = useRef(prompt);
  if (prevPromptRef.current !== prompt) {
    prevPromptRef.current = prompt;
    setEditedPrompt(prompt);
    setIsEditing(false);
  }

  const isDirty = editedPrompt !== prompt;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-[10px] tracking-widest uppercase font-bold" style={{ color: accentColor }}>{label}</p>
          {note && <span className="text-[9px] text-[#444] italic ml-1">{note}</span>}
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              onClick={() => { setEditedPrompt(prompt); setIsEditing(false); }}
              className="text-[9px] text-[#555] hover:text-[#999] uppercase tracking-wider transition-colors"
            >
              ↺ Reset
            </button>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`text-[9px] uppercase tracking-wider transition-colors px-2 py-0.5 border ${
              isEditing
                ? "border-[#555] text-[#999] bg-[#1a1a1a]"
                : "border-[#333] text-[#555] hover:border-[#555] hover:text-[#999]"
            }`}
          >
            {isEditing ? "✓ Done" : "✎ Edit"}
          </button>
        </div>
      </div>
      <div className="relative">
        {isEditing ? (
          <textarea
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            className="w-full bg-[#0a0a0a] border p-4 text-[11px] text-[#e8e8e8] leading-relaxed font-mono resize-y focus:outline-none pb-14"
            style={{ borderColor: accentColor, minHeight: "220px" }}
            spellCheck={false}
            autoFocus
          />
        ) : (
          <pre
            onClick={() => setIsEditing(true)}
            title="Click to edit"
            className="bg-[#0a0a0a] border p-4 text-[11px] text-[#e8e8e8] whitespace-pre-wrap leading-relaxed overflow-x-auto pb-14 cursor-text"
            style={{ borderColor: isDirty ? accentColor : "#1e1e1e" }}
          >
            {editedPrompt}
          </pre>
        )}
        {isDirty && !isEditing && (
          <span
            className="absolute top-2 right-2 text-[9px] uppercase tracking-wider px-1.5 py-0.5"
            style={{ color: accentColor, backgroundColor: "#0a0a0a", border: `1px solid ${accentColor}` }}
          >
            edited
          </span>
        )}
        <button
          onClick={() => onCopy(editedPrompt, promptId)}
          className={`absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 py-2.5 text-xs font-bold tracking-widest uppercase transition-all duration-200 ${
            isCopied
              ? "bg-green-600 text-white border-t border-green-500"
              : "text-black border-t hover:opacity-90"
          }`}
          style={isCopied ? {} : { backgroundColor: accentColor, borderColor: accentColor }}
        >
          {isCopied ? (
            <><Check className="w-3.5 h-3.5" /> COPIED — PASTE INTO VEO 3</>
          ) : (
            <><Copy className="w-3.5 h-3.5" /> COPY PROMPT TO CLIPBOARD</>
          )}
        </button>
      </div>
    </div>
  );
}

function EpisodeCard({
  episode,
  index,
  expanded,
  onToggle,
  onCopy,
  copiedId,
}: {
  episode: GeneratedEpisode;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onCopy: (prompt: string, id: string) => void;
  copiedId: string | null;
}) {
  const validation = validateEpisode(episode);

  return (
    <div className="border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors">
      {/* Card Header */}
      <div
        className="flex items-center justify-between px-5 py-3 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#555] font-bold w-8">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <p className="text-xs font-bold text-white tracking-wider">{episode.scenario_id}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] text-[#555] uppercase tracking-wider">{episode.domain}</span>
              <span className="text-[#333]">·</span>
              <span className="text-[9px] text-[#555] uppercase tracking-wider">{episode.mode}</span>
              {episode.delorified && (
                <>
                  <span className="text-[#333]">·</span>
                  <span className="text-[9px] text-[#f5a623] uppercase tracking-wider">DELORES</span>
                </>
              )}
              {episode.client_subject_name && (
                <>
                  <span className="text-[#333]">·</span>
                  <span className="text-[9px] text-[#7ec8e3] uppercase tracking-wider">{episode.client_subject_name}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {validation.valid ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[#555]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#555]" />
          )}
        </div>
      </div>

      {/* Card Body */}
      {expanded && (
        <div className="border-t border-[#2a2a2a] px-5 py-4 space-y-5">
          {/* SPOT Breakdown */}
          <div className="space-y-2">
            <p className="text-[10px] tracking-widest uppercase text-[#555] font-bold">SPOT BREAKDOWN</p>
            <div className="space-y-1.5 text-xs">
              {(["S", "P", "O", "T"] as const).map((key) => (
                <div key={key} className="flex gap-3">
                  <span className="text-[#f5a623] font-bold w-4 flex-shrink-0">{key}</span>
                  <span className="text-[#999]">{episode.spot_breakdown[key]}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-[#2a2a2a]" />

          {/* Shot Structure */}
          <div className="space-y-2">
            <p className="text-[10px] tracking-widest uppercase text-[#555] font-bold">
              SHOT STRUCTURE ({episode.shot_structure.length} shot{episode.shot_structure.length > 1 ? "s" : ""})
            </p>
            <div className="space-y-3">
              {episode.shot_structure.map((shot) => (
                <div key={shot.number} className="border-l-2 border-[#2a2a2a] pl-3 space-y-0.5">
                  <p className="text-[10px] text-[#f5a623] font-bold uppercase tracking-wider">
                    Shot {shot.number} · {shot.time_range}
                  </p>
                  <p className="text-[10px] text-[#666]"><span className="text-[#555]">Setting:</span> {shot.setting}</p>
                  {shot.authority && <p className="text-[10px] text-[#666]"><span className="text-[#555]">Authority:</span> {shot.authority}</p>}
                  {shot.dialogue && <p className="text-[10px] text-[#e8e8e8] italic">"{shot.dialogue}"</p>}
                  <p className="text-[10px] text-[#666]"><span className="text-[#555]">Ambient:</span> {shot.ambient}</p>
                  <p className="text-[10px] text-[#666]"><span className="text-[#555]">End Beat:</span> {shot.visual_end_beat}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-[#2a2a2a]" />

          {/* PROMPT 1 — SCENE */}
          <PromptBlock
            label="PROMPT 1 — SCENE"
            icon={<Film className="w-3.5 h-3.5 text-[#f5a623]" />}
            prompt={episode.veo_prompt_1}
            promptId={`${episode.scenario_id}_p1`}
            onCopy={onCopy}
            copiedId={copiedId}
            accentColor="#f5a623"
            note="Satirical beat · No CTA · 8s"
          />

          <Separator className="bg-[#2a2a2a]" />

          {/* PROMPT 2 — CTA CUTAWAY */}
          <PromptBlock
            label="PROMPT 2 — CTA CUTAWAY"
            icon={<Megaphone className="w-3.5 h-3.5 text-[#7ec8e3]" />}
            prompt={episode.veo_prompt_2}
            promptId={`${episode.scenario_id}_p2`}
            onCopy={onCopy}
            copiedId={copiedId}
            accentColor="#7ec8e3"
            note="Graphic overlay ready · Stitch in post · 8s"
          />

          {/* CTA */}
          <div className="bg-[#1a1a1a] border-l-4 border-[#f5a623] px-4 py-3">
            <p className="text-[9px] text-[#555] uppercase tracking-widest mb-1">CTA LINE</p>
            <p className="text-sm text-white italic">"{episode.cta}"</p>
            {episode.client_subject_name && (
              <p className="text-xs text-[#7ec8e3] mt-1">— {episode.client_subject_name}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ mode }: { mode: AppMode }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-12">
      <div className="border border-[#2a2a2a] p-8 max-w-md">
        <p className="text-[10px] tracking-widest uppercase text-[#555] mb-4">
          {mode === "single" ? "SINGLE EPISODE MODE" : "RAPID BATCH MODE"}
        </p>
        <p className="text-sm text-[#666] leading-relaxed mb-6">
          {mode === "single"
            ? "Select a scenario or domain, configure parameters, and generate two SPOT-compliant VEO prompts — one scene, one CTA cutaway."
            : "Set batch parameters to generate 10 episodes with controlled urgency distribution, domain rotation, and Delores ratio."}
        </p>
        <div className="text-[10px] text-[#444] space-y-1 text-left">
          <p className="text-[#f5a623]">→ PROMPT 1: Satirical scene (no CTA)</p>
          <p className="text-[#7ec8e3]">→ PROMPT 2: CTA cutaway (graphic overlay ready)</p>
          <p>→ SPOT breakdown included</p>
          <p>→ Shot structure validated</p>
          <p>→ Stitch both prompts in post-production</p>
        </div>
      </div>
      <p className="text-[10px] text-[#333] mt-8 italic">
        "Imagine if everything worked like Net-60."
      </p>
    </div>
  );
}
