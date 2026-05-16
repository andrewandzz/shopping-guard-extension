export enum AnalysisStatus {
  NOT_ANALYZED = 'not_analyzed', // if the user excluded from analysis
  ANALYZING = 'analyzing',
  ANALYZED = 'analyzed',
  NOT_APPLICABLE = 'not_applicable', // if the page is not product
  ERROR = 'error',
}