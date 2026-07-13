import React from 'react';
import { AnimatedNumber, GlowPanel, ScrollReveal } from './HelperComponents';
import { TelemetryGridProps } from '../types';

export const TelemetryGrid = ({
  avgGateInflow, gates, acknowledgedAlarms, activeAlarmsCount, ingressQueueAccumulation, flowDelayMetric, transportAIResponse, activeSimSegment, setActiveSimSegment, lastEvaluationTime
}: TelemetryGridProps) => {
  return (<>
            <ScrollReveal delay={0.05} className="px-6 py-6 space-y-6 border-b border-theme-border bg-theme-bg">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

                {/* Card 01 */}
                <GlowPanel dominant={true} className="p-4 flex flex-col justify-between h-full">
                  <div>
                    <div className="text-[10px] text-theme-muted tracking-wider uppercase font-bold">01 - AVG GATE INFLOW INDEX</div>
                    <div className="text-4xl font-extrabold text-theme-text tracking-tight mt-1">
                      <AnimatedNumber value={avgGateInflow} formatter={val => `${val}%`} />
                    </div>
                  </div>
                  <div className="text-[9px] text-theme-muted mt-2 flex items-center justify-between">
                    <span>SYSTEM BALANCE:</span>
                    <span className="font-bold text-theme-text">OPTIMAL</span>
                  </div>
                </GlowPanel>

                {/* Card 02 */}
                <GlowPanel dominant={false} className={`p-4 flex flex-col justify-between h-full transition-colors duration-150 ${gates.some(g => g.status !== "NORMAL" && !acknowledgedAlarms.includes(g.id)) ? "border-theme-accent/50 bg-theme-accent/5" : ""}`}>
                  <div>
                    <div className="text-[10px] text-theme-muted tracking-wider uppercase font-bold">02 - ACTIVE DECONGESTION ALARMS</div>
                    <div className={`text-4xl font-extrabold tracking-tight mt-1 ${gates.some(g => g.status !== "NORMAL") ? "text-theme-accent" : "text-theme-text"}`}>
                      <AnimatedNumber value={activeAlarmsCount} />
                    </div>
                  </div>
                  <div className="text-[9px] text-theme-muted mt-2 flex items-center justify-between">
                    <span>SECTOR STRESS FACTOR:</span>
                    <span className={gates.some(g => g.status !== "NORMAL") ? "text-theme-accent font-bold" : "text-theme-muted"}>
                      {gates.some(g => g.status !== "NORMAL") ? "ATTN REQ" : "NOMINAL"}
                    </span>
                  </div>
                </GlowPanel>

                {/* Card 03 */}
                <GlowPanel dominant={false} className="p-4 flex flex-col justify-between h-full">
                  <div>
                    <div className="text-[10px] text-theme-muted tracking-wider uppercase font-bold">03 - INGRESS QUEUE ACCUMULATION</div>
                    <div className="text-4xl font-extrabold text-theme-text tracking-tight mt-1">
                      <AnimatedNumber value={ingressQueueAccumulation} formatter={val => `${val}`} />
                    </div>
                  </div>
                  <div className="text-[9px] text-theme-muted mt-2 flex items-center justify-between">
                    <span>FLOW DELAY METRIC:</span>
                    <span className="text-theme-text font-bold">~{flowDelayMetric} M/S</span>
                  </div>
                </GlowPanel>

                {/* Card 04 */}
                <GlowPanel dominant={false} className="p-4 flex flex-col justify-between h-full">
                  <div>
                    <div className="text-[10px] text-theme-muted tracking-wider uppercase font-bold">04 - TOURNAMENT TRANSIT METRIC</div>
                    <div className="text-4xl font-extrabold text-theme-text tracking-tight mt-1">
                      <AnimatedNumber value={transportAIResponse?.ecoShuttleDispatch?.co2SavedKgEst || 114} formatter={val => `${val} KG`} />
                    </div>
                  </div>
                  <div className="text-[9px] text-theme-muted mt-2 flex items-center justify-between">
                    <span>CO2 DISPLACEMENT:</span>
                    <span className="text-theme-text font-bold">ACTIVE</span>
                  </div>
                </GlowPanel>

              </div>

              {/* Subtitle/Selector panel */}
              <div className="bg-theme-panel/70 backdrop-blur-md border border-theme-border/40 p-2 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">ACTIVE MONITORING VECTOR</span>
                </div>

                {/* Simulation Mode Segment Selector */}
                <div className="flex flex-wrap sm:flex-nowrap gap-1 sm:space-x-1.5 p-0.5 bg-theme-bg/60 rounded-2xl border border-theme-border/30 relative overflow-hidden mt-2 md:mt-0 justify-center">
                  <button
                    onClick={() => setActiveSimSegment("crowd")}
                    className={`px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-xl text-[9px] sm:text-[10px] uppercase font-mono tracking-widest font-bold transition-colors duration-150 cursor-pointer ${activeSimSegment === "crowd" ? "bg-theme-text text-theme-panel" : "text-theme-muted hover:text-theme-text"
                      }`}
                  >
                    GATE MATRIX
                  </button>
                  <button
                    onClick={() => setActiveSimSegment("incident")}
                    className={`px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-xl text-[9px] sm:text-[10px] uppercase font-mono tracking-widest font-bold transition-colors duration-150 cursor-pointer ${activeSimSegment === "incident" ? "bg-theme-text text-theme-panel" : "text-theme-muted hover:text-theme-text"
                      }`}
                  >
                    COMM LOG
                  </button>
                  <button
                    onClick={() => setActiveSimSegment("transport")}
                    className={`px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-xl text-[9px] sm:text-[10px] uppercase font-mono tracking-widest font-bold transition-colors duration-150 cursor-pointer ${activeSimSegment === "transport" ? "bg-theme-text text-theme-panel" : "text-theme-muted hover:text-theme-text"
                      }`}
                  >
                    FLEET STREAM
                  </button>
                </div>

                {/* System Telemetry Refresh indicator */}
                <div className="hidden lg:flex items-center space-x-4 text-[10px] text-theme-muted font-mono mt-2 md:mt-0">
                  <span>REFRESH: <b className="text-theme-text">30S RUNTIME</b></span>
                  <span className="text-theme-border">|</span>
                  <span>LAST DISPATCH: <b className="text-theme-text">{lastEvaluationTime}</b></span>
                </div>
              </div>
            </ScrollReveal>
  </>);
};
