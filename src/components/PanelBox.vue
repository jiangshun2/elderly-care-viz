<template>
  <div class="panel" :class="{ 'panel--flat': flat }">
    <div class="panel__head" v-if="title || $slots.extra || $slots.title">
      <div class="panel__title">
        <span class="panel__bar" v-if="showBar"></span>
        <slot name="title">{{ title }}</slot>
        <span class="panel__sub" v-if="sub">{{ sub }}</span>
      </div>
      <div class="panel__extra">
        <slot name="extra"></slot>
      </div>
    </div>
    <div class="panel__body" :class="{ 'panel__body--flush': flush }">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  sub: { type: String, default: '' },
  flat: { type: Boolean, default: false },
  flush: { type: Boolean, default: false },
  showBar: { type: Boolean, default: true }
})
</script>

<style lang="scss" scoped>
.panel {
  background: $panel;
  border: 1px solid $border;
  border-radius: $radius;
  box-shadow: $shadow-sm;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow .2s ease;

  &:hover {
    box-shadow: $shadow-md;
  }
}

.panel--flat {
  box-shadow: none;
}

.panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 16px;
  border-bottom: 1px solid $border-soft;
  flex-shrink: 0;
}

.panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: $text-1;
  min-width: 0;
}

.panel__bar {
  width: 3px;
  height: 13px;
  border-radius: 2px;
  background: linear-gradient(180deg, $primary, $teal);
}

.panel__sub {
  font-size: 12px;
  font-weight: 400;
  color: $text-3;
}

.panel__extra {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.panel__body {
  flex: 1;
  min-height: 0;
  padding: 14px 16px 16px;
}

.panel__body--flush {
  padding: 0;
}
</style>
