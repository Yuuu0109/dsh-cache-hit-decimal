import { SlotCore } from '@deepseek-ai/dsh-client-ui-slots'
import { describe, expect, it } from 'vitest'

describe('conversation.composer.dock shadowing', () => {
  it('shadows and then restores the native stats cell', () => {
    const slots = new SlotCore()
    const native = () => null
    const decimal = () => null

    slots.register({
      name: 'root',
      children: {
        conversation: { kind: 'single', scope: 'root' },
      },
    } as never, () => null)
    slots.register({
      name: 'conversation',
      children: {
        'conversation.composer.dock': { kind: 'list', scope: 'session' },
      },
    } as never, () => null)
    slots.register({
      name: 'conversation.composer.dock',
      id: 'stats',
    }, native)

    const disposeDecimal = slots.register({
      name: 'conversation.composer.dock',
      id: 'stats',
      priority: -1,
    }, decimal)

    expect(slots.entriesOfSlot('conversation.composer.dock')[0]?.component).toBe(decimal)

    disposeDecimal()
    expect(slots.entriesOfSlot('conversation.composer.dock')[0]?.component).toBe(native)
  })
})
