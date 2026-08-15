/**
 * Host half of the decimal cache-hit presentation plugin.
 *
 * This package has no node-side behavior. The exported apply exists so the
 * DSH Loader can import the bundle root; the browser half is discovered from
 * the package's `dsh.client` declaration.
 */
export function apply(): void {}
