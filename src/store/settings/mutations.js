export function updateSettings (state, payload) {
  state[payload.name] = payload.value
}
