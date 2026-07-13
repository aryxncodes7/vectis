import React from 'react';
import { RefreshCw } from 'lucide-react';
import { AnimatedNumber, GlowPanel, ScrollReveal, MagneticButton } from './HelperComponents';
import { GateMatrixSectorProps } from '../types';

export const GateMatrixSector = ({
  gates, acknowledgedAlarms, setAcknowledgedAlarms, generateSparklinePath, updateGateLoad, setCameraVisionLogs, addLog, isSystemEvaluating, cameraVisionLogs, runCrowdEvaluation
}: GateMatrixSectorProps) => {
  return (<>
                <div className="space-y-6">
                  <ScrollReveal delay={0}>
                    <GlowPanel dominant={true} className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-theme-text">
                          PERIPHERAL GATE TELEMETRY MATRIX
                        </h3>
                        <span className="text-[9px] text-theme-muted font-mono bg-theme-bg border border-theme-border px-2 py-0.5 rounded-xl">
                          LIVE FEED
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed text-left border-collapse text-[11px] font-mono">
                          <thead>
                            <tr className="bg-theme-bg text-[9px] text-theme-muted uppercase border border-theme-border">
                              <th className="p-2 border border-theme-border w-[8%]">ID</th>
                              <th className="p-2 border border-theme-border w-[30%]">NODE LOCATION</th>
                              <th className="p-2 border border-theme-border w-[25%]">GRID LOAD</th>
                              <th className="p-2 border border-theme-border w-[20%]">STATUS</th>
                              <th className="p-2 border border-theme-border w-[17%] text-right">ACTION</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gates.map((g) => {
                              const isWarn = g.status !== "NORMAL";
                              const isAcked = acknowledgedAlarms.includes(g.id);

                              let rowStyle = "text-theme-text hover:bg-theme-border/25";
                              if (isWarn) {
                                rowStyle = !isAcked
                                  ? "bg-theme-accent/5 text-theme-accent border-l-2 border-l-theme-accent font-medium"
                                  : "text-theme-muted opacity-75 hover:bg-theme-border/25";
                              }

                              return (
                                <tr key={g.id} className={`transition-all duration-150 border-b border-theme-border ${rowStyle}`}>
                                  <td className="p-2 border border-theme-border font-bold">{g.id.replace("GATE_", "")}</td>
                                  <td className="p-2 border border-theme-border truncate max-w-[120px]">{g.name.split(" (")[0]}</td>
                                  <td className="p-2 border border-theme-border">
                                    <div className="flex items-center space-x-1.5">
                                      <span className="font-bold">
                                        <AnimatedNumber value={g.loadPercentage} formatter={val => `${val}%`} />
                                      </span>
                                      <svg aria-hidden="true" className="w-10 h-4 stroke-theme-muted fill-none shrink-0" viewBox="0 0 60 20">
                                        <path strokeWidth="1.5" d={generateSparklinePath(g.id, g.loadPercentage)} />
                                      </svg>
                                    </div>
                                  </td>
                                  <td className="p-2 border border-theme-border">
                                    <div className="flex items-center space-x-1.5">
                                      <span className={`w-2 h-2 inline-block shrink-0 rounded-full ${g.status === "CRITICAL" ? "bg-theme-accent animate-pulse" :
                                          g.status === "WARNING" ? "bg-theme-warn" : "bg-theme-muted/50"
                                        }`} />
                                      <span className="text-[9px] font-bold uppercase">
                                        {isWarn && isAcked ? "ACKD" : g.status}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-2 border border-theme-border text-right">
                                    <div className="flex items-center justify-end space-x-1.5">
                                      <input
                                        type="range"
                                        aria-label="Adjust Gate Load"
                                        min="10"
                                        max="100"
                                        value={g.loadPercentage}
                                        onChange={(e) => updateGateLoad(g.id, parseInt(e.target.value))}
                                        className="w-10 accent-theme-text bg-theme-bg h-1 cursor-pointer"
                                      />
                                      {isWarn && !isAcked && (
                                        <button
                                          aria-label="Acknowledge Alarm"
                                          onClick={() => setAcknowledgedAlarms((prev) => [...prev, g.id])}
                                          className="text-[8px] bg-theme-accent hover:opacity-90 border border-transparent text-white px-1.5 py-0.5 font-bold uppercase rounded-xl transition-all cursor-pointer"
                                        >
                                          ACK
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="pt-3 border-t border-theme-border flex items-center space-x-2">
                        <span className="text-[9px] text-theme-muted font-mono">SCENARIO INGESTS:</span>
                        <MagneticButton
                          onClick={() => {
                            updateGateLoad("GATE_A", 95);
                            updateGateLoad("GATE_C", 20);
                            updateGateLoad("GATE_G", 92);
                            updateGateLoad("GATE_K", 15);
                            setCameraVisionLogs("Vision Log: Large crowd congestion forming at North Plaza Transit Dropoff. Fans overflowing primary Gate A corridor.");
                            addLog("Injected Gate A & G bottleneck scenario.");
                          }}
                          disabled={isSystemEvaluating}
                          className="text-[9px] bg-theme-accent/10 hover:bg-theme-accent/20 disabled:opacity-50 text-theme-accent border border-theme-accent/30 px-2.5 py-1 rounded-xl font-mono font-bold cursor-pointer transition-colors"
                        >
                          PLAZA BOTTLE_NECK
                        </MagneticButton>
                        <MagneticButton
                          onClick={() => {
                            updateGateLoad("GATE_A", 40);
                            updateGateLoad("GATE_C", 35);
                            updateGateLoad("GATE_E", 45);
                            updateGateLoad("GATE_G", 40);
                            updateGateLoad("GATE_K", 30);
                            setCameraVisionLogs("Vision Log: Normal flow. All plaza gates presenting nominal throughput rates.");
                            addLog("Reset all gates to standard nominal flow loads.");
                          }}
                          disabled={isSystemEvaluating}
                          className="text-[9px] bg-theme-bg hover:bg-theme-border/50 disabled:opacity-50 text-theme-muted hover:text-theme-text border border-theme-border px-2.5 py-1 rounded-xl font-mono font-bold cursor-pointer transition-colors"
                        >
                          CLEAR ALL
                        </MagneticButton>
                      </div>
                    </GlowPanel>
                  </ScrollReveal>

                  <ScrollReveal delay={0.05}>
                    <GlowPanel dominant={false} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-theme-text">
                          OPTICAL CAMERA FEED DIAGNOSTICS
                        </h3>
                        <span className="text-[9px] text-theme-muted bg-theme-bg border border-theme-border px-2 py-0.5 rounded-xl font-mono">
                          VIDEO ANALYTICS MATRIX
                        </span>
                      </div>
                      <p className="text-[10px] text-theme-muted leading-relaxed uppercase">
                        Edge-computed camera metadata synced via localized visual telemetry matrix.
                      </p>
                      <textarea
                        aria-label="Camera Vision Logs"
                        value={cameraVisionLogs}
                        onChange={(e) => setCameraVisionLogs(e.target.value)}
                        className="w-full text-xs font-mono p-3 bg-theme-bg border border-theme-border rounded-xl text-theme-text h-20 focus:ring-1 focus:ring-theme-text focus:outline-none focus:border-theme-text transition-colors duration-150"
                      />
                    </GlowPanel>
                  </ScrollReveal>

                  <ScrollReveal delay={0.1}>
                    <MagneticButton
                      onClick={runCrowdEvaluation}
                      disabled={isSystemEvaluating}
                      className="w-full py-2.5 bg-theme-text hover:opacity-90 disabled:bg-theme-muted/20 text-theme-panel font-bold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      {isSystemEvaluating ? (
                        <>
                          <RefreshCw aria-hidden="true" className="w-4 h-4 animate-spin" />
                          <span>MATRIX EXECUTION RUNNING...</span>
                        </>
                      ) : (
                        <>
                          <span>FORCE TELEMETRY REBALANCING</span>
                        </>
                      )}
                    </MagneticButton>
                  </ScrollReveal>
                </div>
  </>);
};
