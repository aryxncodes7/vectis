import React from 'react';
import { RefreshCw } from 'lucide-react';
import { AnimatedNumber, GlowPanel, ScrollReveal, MagneticButton } from './HelperComponents';
import { FleetStreamPanelProps } from '../types';

export const FleetStreamPanel = ({
  matchMinute, setMatchMinute, scoreHome, setScoreHome, scoreAway, setScoreAway, extraTimePredicted, transitGridLoad, setTransitGridLoad, runTransportEvaluation, isSystemEvaluating, transportAIResponse
}: FleetStreamPanelProps) => {
  return (<>
                <div className="space-y-6">
                  <ScrollReveal delay={0}>
                    <GlowPanel dominant={true} className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-theme-text">
                          Match Progress & Timeline
                        </h3>
                        <span className="text-[9px] text-theme-muted font-mono bg-theme-bg border border-theme-border px-2 py-0.5 rounded-xl">Transit Dispatch API</span>
                      </div>

                      {/* Match Minute Slider */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-theme-muted">Match Timeline</span>
                          <span className="font-mono font-bold text-theme-text">
                            <AnimatedNumber value={matchMinute} />' Minute
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="120"
                          value={matchMinute}
                          onChange={(e) => setMatchMinute(parseInt(e.target.value))}
                          className="w-full accent-theme-text bg-theme-bg h-1 rounded-xl cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-theme-muted font-mono">
                          <span>10' (Ingress)</span>
                          <span>45' (Half)</span>
                          <span>90' (Fulltime)</span>
                          <span>120' (Extra)</span>
                        </div>
                      </div>

                      {/* Score control */}
                      <div className="bg-theme-bg p-4 rounded-xl border border-theme-border space-y-3">
                        <span className="text-[9px] text-theme-muted font-mono block uppercase">LIVE MATCH SCORE BOARD</span>
                        <div className="flex items-center justify-center space-x-6">
                          <div className="text-center space-y-1">
                            <span className="text-[10px] text-theme-muted font-mono uppercase block">Argentina</span>
                            <div className="flex items-center space-x-2 justify-center">
                              <MagneticButton
                                aria-label="Decrease Home Score"
                                onClick={() => setScoreHome((prev) => Math.max(0, prev - 1))}
                                className="bg-theme-panel hover:bg-theme-border/50 px-2 py-0.5 rounded-xl text-xs font-bold cursor-pointer text-theme-text"
                              >
                                -
                              </MagneticButton>
                              <span className="text-lg font-bold font-mono text-theme-text">
                                <AnimatedNumber value={scoreHome} />
                              </span>
                              <MagneticButton
                                aria-label="Increase Home Score"
                                onClick={() => setScoreHome((prev) => prev + 1)}
                                className="bg-theme-panel hover:bg-theme-border/50 px-2 py-0.5 rounded-xl text-xs font-bold cursor-pointer text-theme-text"
                              >
                                +
                              </MagneticButton>
                            </div>
                          </div>
                          <span className="text-theme-muted text-sm font-bold font-mono">VS</span>
                          <div className="text-center space-y-1">
                            <span className="text-[10px] text-theme-muted font-mono uppercase block">France</span>
                            <div className="flex items-center space-x-2 justify-center">
                              <MagneticButton
                                aria-label="Decrease Away Score"
                                onClick={() => setScoreAway((prev) => Math.max(0, prev - 1))}
                                className="bg-theme-panel hover:bg-theme-border/50 px-2 py-0.5 rounded-xl text-xs font-bold cursor-pointer text-theme-text"
                              >
                                -
                              </MagneticButton>
                              <span className="text-lg font-bold font-mono text-theme-text">
                                <AnimatedNumber value={scoreAway} />
                              </span>
                              <MagneticButton
                                aria-label="Increase Away Score"
                                onClick={() => setScoreAway((prev) => prev + 1)}
                                className="bg-theme-panel hover:bg-theme-border/50 px-2 py-0.5 rounded-xl text-xs font-bold cursor-pointer text-theme-text"
                              >
                                +
                              </MagneticButton>
                            </div>
                          </div>
                        </div>

                        {/* Extra Time locked indicator */}
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-theme-border">
                          <span className="text-theme-muted text-[10px] uppercase">Match Extended Outcome:</span>
                          <span className={`px-2 py-0.5 rounded-xl font-mono text-[9px] ${extraTimePredicted
                              ? "bg-theme-warn/10 text-theme-warn border border-theme-warn/30"
                              : "bg-theme-panel text-theme-muted border border-theme-border"
                            }`}>
                            {extraTimePredicted ? "⚠️ EXTRA TIME & PENALTIES HIGHLY LIKELY" : "REGULATION EXIT (90M)"}
                          </span>
                        </div>
                      </div>
                    </GlowPanel>
                  </ScrollReveal>

                  <ScrollReveal delay={0.05}>
                    <GlowPanel dominant={false} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-theme-text">
                          Transit Network & Schedule Delays
                        </h3>
                        <span className="text-[9px] text-theme-muted font-mono bg-theme-bg border border-theme-border px-2 py-0.5 rounded-xl">External API Feed</span>
                      </div>
                      <input
                        type="text"
                        value={transitGridLoad}
                        onChange={(e) => setTransitGridLoad(e.target.value)}
                        className="w-full text-xs font-mono p-2 bg-theme-bg border border-theme-border rounded-xl text-theme-text focus:ring-1 focus:ring-theme-text focus:border-theme-text focus:outline-none"
                      />
                      <p className="text-[10px] text-theme-muted leading-normal italic">
                        The control stack cross-references this telematics feed to coordinate eco-friendly bus dispatch pre-allocation prior to game final whistle.
                      </p>
                    </GlowPanel>
                  </ScrollReveal>

                  <ScrollReveal delay={0.1}>
                    <MagneticButton
                      onClick={runTransportEvaluation}
                      disabled={isSystemEvaluating}
                      className="w-full py-2.5 bg-theme-text hover:opacity-90 disabled:bg-theme-muted/20 text-theme-panel font-bold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      {isSystemEvaluating ? (
                        <>
                          <RefreshCw aria-hidden="true" className="w-4 h-4 animate-spin" />
                          <span>FLEET OPTIMIZATION RUNNING...</span>
                        </>
                      ) : (
                        <>
                          <span>FORCE TRANSIT FLEET DISPATCH OPTIMIZATION</span>
                        </>
                      )}
                    </MagneticButton>
                  </ScrollReveal>
                </div>
  </>);
};
