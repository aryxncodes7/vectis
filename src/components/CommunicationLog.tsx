import React from 'react';
import { RefreshCw } from 'lucide-react';
import { GlowPanel, ScrollReveal, MagneticButton } from './HelperComponents';

export const CommunicationLog = ({
  incidentReports, removeIncidentReport, handleAddCustomReport, newReporterName, setNewReporterName, newReporterLang, setNewReporterLang, newReportText, setNewReportText, isSystemEvaluating, runIncidentEvaluation
}: any) => {
  return (<>
                <div className="space-y-6">
                  <ScrollReveal delay={0}>
                    <GlowPanel dominant={true} className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-theme-text">
                          Radio Communication Log Stream
                        </h3>
                        <span className="text-[9px] text-theme-muted font-mono bg-theme-bg border border-theme-border px-2 py-0.5 rounded-xl">
                          {incidentReports.length} REPORTS LOGGED
                        </span>
                      </div>

                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                        {incidentReports.map((report) => (
                          <div key={report.id} className="bg-theme-bg border border-theme-border p-2.5 rounded-xl relative group">
                            <button
                              onClick={() => removeIncidentReport(report.id)}
                              className="absolute top-2 right-2 text-theme-muted hover:text-theme-accent text-xs transition-colors cursor-pointer font-bold"
                              title="Delete Report"
                            >
                              &times;
                            </button>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-[9px] font-bold text-theme-text bg-theme-panel border border-theme-border px-1.5 py-0.2 rounded-xl">
                                {report.lang}
                              </span>
                              <span className="text-[9px] text-theme-muted font-mono font-medium">
                                {report.reporter} ({report.role})
                              </span>
                            </div>
                            <p className="text-[10px] text-theme-text italic leading-relaxed">
                              "{report.text}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </GlowPanel>
                  </ScrollReveal>

                  {/* Form to submit custom report inside a GlowPanel */}
                  <ScrollReveal delay={0.05}>
                    <GlowPanel dominant={false} className="p-4">
                      <form onSubmit={handleAddCustomReport} className="space-y-3">
                        <h4 className="text-[10px] font-bold text-theme-muted uppercase tracking-wider">Add Field Staff Report</h4>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] text-theme-muted font-mono uppercase">STAFF NAME</label>
                            <input
                              type="text"
                              placeholder="Marc Girard"
                              value={newReporterName}
                              onChange={(e) => setNewReporterName(e.target.value)}
                              className="w-full text-xs p-2 bg-theme-bg border border-theme-border rounded-xl text-theme-text focus:ring-1 focus:ring-theme-text focus:border-theme-text focus:outline-none"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-theme-muted font-mono uppercase">LANGUAGE</label>
                            <select
                              value={newReporterLang}
                              onChange={(e) => setNewReporterLang(e.target.value)}
                              className="w-full text-xs p-1.5 bg-theme-bg border border-theme-border rounded-xl text-theme-text focus:ring-1 focus:ring-theme-text focus:border-theme-text focus:outline-none"
                            >
                              <option value="Spanish (ES)">Spanish (ES)</option>
                              <option value="French (FR)">French (FR)</option>
                              <option value="Portuguese (PT)">Portuguese (PT)</option>
                              <option value="German (DE)">German (DE)</option>
                              <option value="Arabic (AR)">Arabic (AR)</option>
                              <option value="English (EN)">English (EN)</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-theme-muted font-mono uppercase">TRANSMITTED MESSAGE LOG</label>
                          <textarea
                            placeholder="Enter field-level Spanish, French, or Portuguese transmissions..."
                            value={newReportText}
                            onChange={(e) => setNewReportText(e.target.value)}
                            className="w-full text-xs p-2 bg-theme-bg border border-theme-border rounded-xl text-theme-text h-14 focus:ring-1 focus:ring-theme-text focus:border-theme-text focus:outline-none"
                            required
                          />
                        </div>

                        <MagneticButton
                          type="submit"
                          className="w-full py-1.5 bg-theme-bg hover:bg-theme-border/50 text-theme-text border border-theme-border font-bold text-[10px] uppercase rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                        >
                          <span>Inject to Ingestion Stream</span>
                        </MagneticButton>
                      </form>
                    </GlowPanel>
                  </ScrollReveal>

                  <ScrollReveal delay={0.1}>
                    <MagneticButton
                      onClick={runIncidentEvaluation}
                      disabled={isSystemEvaluating}
                      className="w-full py-2.5 bg-theme-text hover:opacity-90 disabled:bg-theme-muted/20 text-theme-panel font-bold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      {isSystemEvaluating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>SOP CHECKLIST INDEXING...</span>
                        </>
                      ) : (
                        <>
                          <span>FORCE PROTOCOL EXECUTION & SITREP MAPPING</span>
                        </>
                      )}
                    </MagneticButton>
                  </ScrollReveal>
                </div>
  </>);
};
