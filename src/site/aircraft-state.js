const states = new WeakMap();

// Late completion of a hidden model must not overwrite the selected model's UI.
export function setAircraftState(stage, id, state) {
  const models = states.get(stage) || new Map();
  models.set(id, state);
  states.set(stage, models);
  if (stage.dataset.platform === id) syncAircraftState(stage);
}

export function syncAircraftState(stage) {
  const state = states.get(stage)?.get(stage.dataset.platform) || 'loading';
  stage.dataset.modelState = state;
  stage.setAttribute('aria-busy', String(state === 'loading'));
  return state;
}
