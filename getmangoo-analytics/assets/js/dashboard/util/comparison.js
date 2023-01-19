const COMPARISON_PERIOD_TEXT = {
  "previous_period": "Previous period",
  "same_period_last_year": "Same period last year"
}

const DEFAULT_AVAILABLE_COMPARISON = ['', 'previous_period', 'same_period_last_year']

const PERIODO_AVAILABLE_COMPARISON = {
  "day": DEFAULT_AVAILABLE_COMPARISON,
  "realtime": [''],
  "7d": DEFAULT_AVAILABLE_COMPARISON,
  "30d": DEFAULT_AVAILABLE_COMPARISON,
  "month": DEFAULT_AVAILABLE_COMPARISON,
  "year": ['', 'previous_period'],
  "12mo": ['', 'previous_period'],
  "all": [''],
  "custom": [''],
}

export function getComparisonText(comparison_period) {
  return COMPARISON_PERIOD_TEXT[comparison_period] || 'Compare to'
}

export function isComparisonAvailable(period, comparison_period) {
  if (PERIODO_AVAILABLE_COMPARISON[period])
    return PERIODO_AVAILABLE_COMPARISON[period].indexOf(comparison_period) !== -1;
  return false;
}