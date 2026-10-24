<template>
  <div class="stat" :class="[`stat--${tone}`]">
    <div class="stat__icon" v-if="icon || $slots.icon">
      <slot name="icon">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8">
          <path v-if="icon === 'user'" stroke-linecap="round" d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" />
          <path v-else-if="icon === 'heart'" stroke-linecap="round" stroke-linejoin="round" d="M20.8 6.6a4.6 4.6 0 00-6.5 0L12 8.9l-2.3-2.3a4.6 4.6 0 10-6.5 6.5l8.8 8.7 8.8-8.7a4.6 4.6 0 000-6.5z" />
          <path v-else-if="icon === 'alert'" stroke-linecap="round" stroke-linejoin="round" d="M12 3l9.5 16.5H2.5L12 3zM12 9v5m0 3h.01" />
          <path v-else-if="icon === 'clock'" stroke-linecap="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2" />
          <path v-else-if="icon === 'staff'" stroke-linecap="round" d="M16 20v-1.5A3.5 3.5 0 0012.5 15h-5A3.5 3.5 0 004 18.5V20M10 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM20 20v-1.5a3.5 3.5 0 00-2.6-3.4M15 4.2a3.5 3.5 0 010 6.6" />
          <path v-else-if="icon === 'chart'" stroke-linecap="round" stroke-linejoin="round" d="M4 20V10m5 10V4m5 16v-7m5 7V8" />
          <path v-else-if="icon === 'service'" stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h10" />
          <path v-else stroke-linecap="round" d="M4 12h16M4 6h16M4 18h16" />
        </svg>
      </slot>
    </div>
    <div class="stat__main">
      <div class="stat__label">
        <span class="stat__text">{{ label }}</span>
        <el-tooltip v-if="tipText" :content="tipText" placement="top" :show-after="120" effect="light">
          <span class="stat__tip">?</span>
        </el-tooltip>
      </div>
      <div class="stat__value u-num">
        {{ value }}<span class="stat__unit" v-if="unit">{{ unit }}</span>
      </div>
      <div class="stat__foot" v-if="$slots.foot">
        <slot name="foot"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  unit: { type: String, default: '' },
  icon: { type: String, default: '' },
  tone: { type: String, default: 'primary' },
  tipText: { type: String, default: '' }
})
</script>

<style lang="scss" scoped>
.stat {
  position: relative;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 15px 16px;
  background: $panel;
  border: 1px solid $border;
  border-radius: $radius;
  box-shadow: $shadow-sm;
  overflow: hidden;
  transition: transform .18s ease, box-shadow .18s ease;

  &::after {
    content: '';
    position: absolute;
    right: -28px;
    top: -28px;
    width: 86px;
    height: 86px;
    border-radius: 50%;
    background: currentColor;
    opacity: .06;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
}

.stat__icon {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: currentColor;
  color: $primary;

  svg {
    color: #fff;
    stroke-width: 1.8;
  }
}

.stat__main {
  min-width: 0;
  flex: 1;
}

.stat__label {
  font-size: 12px;
  color: $text-3;
  display: flex;
  align-items: center;
  gap: 5px;
}

.stat__text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat__tip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: $border-soft;
  color: $text-3;
  font-size: 9px;
  line-height: 1;
  font-weight: 600;
  cursor: help;
  transition: background .18s ease, color .18s ease;

  &:hover {
    background: $primary;
    color: #fff;
  }
}

.stat__value {
  font-size: 25px;
  font-weight: 700;
  color: $text-1;
  line-height: 1.25;
  margin-top: 3px;
}

.stat__unit {
  font-size: 12px;
  font-weight: 500;
  color: $text-3;
  margin-left: 3px;
}

.stat__foot {
  margin-top: 3px;
  font-size: 11px;
  color: $text-3;
}

// —— 色调 ——
.stat--primary { color: $primary; }
.stat--teal    { color: $teal; }
.stat--amber   { color: $amber; }
.stat--red     { color: $red; }
.stat--green   { color: $green; }
.stat--purple  { color: $purple; }
.stat--cyan    { color: $cyan; }
</style>
