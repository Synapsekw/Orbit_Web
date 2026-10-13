const paths = {
  'up-right': 'M5 19 19 5M5 5h14v14',
  up: 'M12 20V4m-7 7 7-7 7 7',
  down: 'M12 4v16m-7-7 7 7 7-7',
  right: 'M4 12h16m-7-7 7 7-7 7',
  'down-left': 'M19 5 5 19M5 5v14h14',
  'rotate-left': 'M3 10h6M3 10V4m0 6a9 9 0 1 1 0 5',
  'rotate-right': 'M21 10h-6m6 0V4m0 6a9 9 0 1 0 0 5',
};

// Explicit vectors avoid platform emoji substitution, including iPhone Chrome.
export function arrowIcon(direction = 'up-right') {
  if (!Object.hasOwn(paths, direction)) throw new Error('Unknown icon direction');
  return `<svg class="orbit-icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="vertical-align:-.12em;flex:none"><path d="${paths[direction]}"/></svg>`;
}
