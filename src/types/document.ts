export type DocumentKind = 'SOP' | 'LOR' | 'Resume' | 'Transcript' | 'Test report' | 'Other';

export interface VaultDocument {
  id: string;
  name: string;
  kind: DocumentKind;
  sizeKb: number;
  updated: string;
  linkedTo: string[];
  status: 'final' | 'needs review' | 'reviewed';
}

export interface UploadedFile {
  name: string;
  size: number;
  rawFile?: File;
}

export type SuggestionType = 'Specificity' | 'Clarity' | 'Program fit' | 'Structure';

export interface SopSuggestion {
  type: SuggestionType;
  note: string;
  replacement: string;
  impact: number;
}

export interface SopSegment {
  id: string;
  text: string;
  suggestion?: SopSuggestion;
}

export interface SopRubricItem {
  type: SuggestionType | 'Grammar & tone' | 'Length';
  base: number;
  explanation: string;
}

export type SopDecision = 'accepted' | 'dismissed';