import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useDebounce } from '../src/hooks/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna el valor inicial inmediatamente', () => {
    const { result } = renderHook(() => useDebounce('inicial', 300))
    expect(result.current).toBe('inicial')
  })

  it('no actualiza el valor antes de que transcurra el delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'inicial' } },
    )

    rerender({ value: 'actualizado' })

    // Avanzar menos del delay — el valor no debe haber cambiado
    act(() => { vi.advanceTimersByTime(299) })

    expect(result.current).toBe('inicial')
  })

  it('actualiza el valor después de que transcurre el delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'inicial' } },
    )

    rerender({ value: 'actualizado' })

    act(() => { vi.advanceTimersByTime(300) })

    expect(result.current).toBe('actualizado')
  })

  it('reinicia el timer si el valor cambia antes de que expire', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } },
    )

    rerender({ value: 'b' })
    act(() => { vi.advanceTimersByTime(200) })

    rerender({ value: 'c' })
    act(() => { vi.advanceTimersByTime(200) })

    // Solo han pasado 200ms desde el último cambio — no debe actualizarse aún
    expect(result.current).toBe('a')

    act(() => { vi.advanceTimersByTime(100) })

    // Ahora sí han pasado 300ms desde el último cambio
    expect(result.current).toBe('c')
  })

  it('respeta un delay personalizado', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'inicial' } },
    )

    rerender({ value: 'actualizado' })

    act(() => { vi.advanceTimersByTime(499) })
    expect(result.current).toBe('inicial')

    act(() => { vi.advanceTimersByTime(1) })
    expect(result.current).toBe('actualizado')
  })
})