<script setup lang="ts">
const emit = defineEmits<{ (e: 'change', value: string | null): void }>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let drawing = false
let hasDrawn = false
let lastX = 0
let lastY = 0

function setupCanvas() {
  const canvas = canvasEl.value
  if (!canvas) return
  // Backing store needs to be scaled by devicePixelRatio for a crisp line on
  // high-DPI screens, but pointer coordinates below stay in CSS pixels.
  const ratio = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * ratio
  canvas.height = rect.height * ratio
  ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(ratio, ratio)
  ctx.lineWidth = 2.25
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#14171F'
}

function pointFromEvent(e: PointerEvent) {
  const rect = canvasEl.value!.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function start(e: PointerEvent) {
  if (!ctx) return
  drawing = true
  const { x, y } = pointFromEvent(e)
  lastX = x
  lastY = y
  canvasEl.value?.setPointerCapture(e.pointerId)
}

function move(e: PointerEvent) {
  if (!drawing || !ctx) return
  const { x, y } = pointFromEvent(e)
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(x, y)
  ctx.stroke()
  lastX = x
  lastY = y
  hasDrawn = true
}

function stop() {
  if (!drawing) return
  drawing = false
  emit('change', hasDrawn && canvasEl.value ? canvasEl.value.toDataURL('image/png') : null)
}

function clear() {
  const canvas = canvasEl.value
  if (!canvas || !ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  hasDrawn = false
  emit('change', null)
}

onMounted(setupCanvas)

defineExpose({ clear })
</script>

<template>
  <div>
    <canvas
      ref="canvasEl"
      class="focus-ring h-36 w-full touch-none rounded-lg border border-line bg-white"
      style="touch-action: none"
      @pointerdown="start"
      @pointermove="move"
      @pointerup="stop"
      @pointerleave="stop"
      @pointercancel="stop"
    />
    <div class="mt-2 flex items-center justify-between">
      <span class="font-body text-xs text-muted">Signez ici avec le doigt ou la souris</span>
      <button type="button" class="font-body text-xs font-medium text-indigo underline" @click="clear">
        Effacer
      </button>
    </div>
  </div>
</template>
