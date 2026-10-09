import { VaultDocument } from '../types/document';

export const initialDocuments: VaultDocument[] = [
{ id: 'd1', name: 'SOP_general_v3.docx', kind: 'SOP', sizeKb: 42, updated: '2026-09-22', linkedTo: ['UMass Amherst', 'Northeastern'], status: 'needs review' },
{ id: 'd2', name: 'Resume_Sep2026.pdf', kind: 'Resume', sizeKb: 186, updated: '2026-09-14', linkedTo: ['All programs'], status: 'final' },
{ id: 'd3', name: 'LOR_Prof_Rao.pdf', kind: 'LOR', sizeKb: 210, updated: '2026-09-02', linkedTo: ['UMass Amherst', 'Edinburgh', 'Northeastern'], status: 'final' },
{ id: 'd4', name: 'LOR_Prof_Iyer_draft.docx', kind: 'LOR', sizeKb: 38, updated: '2026-09-19', linkedTo: ['UMass Amherst'], status: 'reviewed' },
{ id: 'd5', name: 'LOR_Manager_Infosys.pdf', kind: 'LOR', sizeKb: 164, updated: '2026-08-28', linkedTo: ['Northeastern', 'Edinburgh'], status: 'final' },
{ id: 'd6', name: 'Transcript_BTech_VIT.pdf', kind: 'Transcript', sizeKb: 1240, updated: '2026-07-30', linkedTo: ['All programs'], status: 'final' },
{ id: 'd7', name: 'GRE_ScoreReport_318.pdf', kind: 'Test report', sizeKb: 320, updated: '2026-06-11', linkedTo: ['All programs'], status: 'final' },
{ id: 'd8', name: 'TOEFL_ScoreReport_104.pdf', kind: 'Test report', sizeKb: 298, updated: '2026-06-24', linkedTo: ['All programs'], status: 'final' }];