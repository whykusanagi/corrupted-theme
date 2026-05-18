/**
 * URL state serialization helpers.
 *
 * Round-trips HTML form state through URLSearchParams to produce
 * "share this view" links. Handles text inputs, checkboxes, and radio buttons.
 *
 * All functions guard against missing DOM globals for Node import compat.
 *
 * @module core/url-state
 */

/**
 * Serialize all named form fields to URLSearchParams.
 *
 * Checkbox / radio: appends name=value only when checked.
 * Other inputs: appends name=value when value is non-empty.
 *
 * @param {Element|null} formEl - Form (or any container with [name] children)
 * @returns {URLSearchParams} Serialized parameters (empty if formEl is falsy or has no fields)
 */
export function serializeFormToParams(formEl) {
  const params = new URLSearchParams();
  if (!formEl?.querySelectorAll) return params;

  for (const el of formEl.querySelectorAll('[name]')) {
    if (el.type === 'checkbox' || el.type === 'radio') {
      if (el.checked) params.append(el.name, el.value);
    } else if (el.value) {
      params.append(el.name, el.value);
    }
  }

  return params;
}

/**
 * Apply URLSearchParams back to a form's fields.
 *
 * For checkbox / radio inputs: checks the element when its value matches.
 * For other inputs: sets element.value.
 *
 * @param {Element|null} formEl - Form (or any container with [name] children)
 * @param {URLSearchParams} searchParams - Parameters to apply
 * @returns {void}
 */
export function applyParamsToForm(formEl, searchParams) {
  if (!formEl?.querySelector) return;

  for (const [name, value] of searchParams) {
    // CSS.escape may not exist in Node; fall back to manual escaping for quotes
    const safeName = (typeof CSS !== 'undefined' && CSS.escape)
      ? CSS.escape(name)
      : name.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

    const el = formEl.querySelector(`[name="${safeName}"]`);
    if (!el) continue;

    if (el.type === 'checkbox' || el.type === 'radio') {
      if (el.value === value) el.checked = true;
    } else {
      el.value = value;
    }
  }
}

/**
 * Build a full "share" URL by encoding a form's current state into the
 * search string of the given base URL.
 *
 * @param {Element|null} formEl - Form to serialize (null produces a clean URL)
 * @param {string} [baseUrl] - Base URL to attach params to.
 *   Defaults to window.location.href in browser, or 'http://localhost/' in Node.
 * @returns {string} Absolute URL string with serialized form state as query params
 */
export function buildShareUrl(formEl, baseUrl) {
  const base = baseUrl
    ?? (typeof window !== 'undefined' ? window.location.href : 'http://localhost/');
  const url = new URL(base);
  url.search = serializeFormToParams(formEl).toString();
  return url.toString();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { serializeFormToParams, applyParamsToForm, buildShareUrl };
}
