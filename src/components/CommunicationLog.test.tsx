import test from "node:test";
import assert from "node:assert";
import React from "react";
import { render, screen } from "@testing-library/react";
import { CommunicationLog } from "./CommunicationLog";



test('CommunicationLog Component renders correctly', () => {
  
  const mockReports = [
    { id: '1', reporter: 'Test', role: 'Staff', lang: 'English (EN)', text: 'Hello' }
  ];
  const mockProps = {
    incidentReports: mockReports,
    removeIncidentReport: () => {},
    handleAddCustomReport: () => {},
    newReporterName: '',
    setNewReporterName: () => {},
    newReporterLang: '',
    setNewReporterLang: () => {},
    newReportText: '',
    setNewReportText: () => {},
    isSystemEvaluating: false,
    runIncidentEvaluation: async () => {}
  };

  render(<CommunicationLog {...mockProps} />);
  assert.ok(screen.getByText(/Hello/i));
});
