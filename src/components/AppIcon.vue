<template>
  <div class="icon" :style="{ width: size + 'px', height: size + 'px' }">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" :stroke-width="strokeWidth"
      stroke-linecap="round" stroke-linejoin="round">
      <template v-if="name === 'dashboard'">
        <rect x="3" y="3" width="7.5" height="9" rx="1.6" />
        <rect x="13.5" y="3" width="7.5" height="5.5" rx="1.6" />
        <rect x="13.5" y="12" width="7.5" height="9" rx="1.6" />
        <rect x="3" y="15.5" width="7.5" height="5.5" rx="1.6" />
      </template>
      <template v-else-if="name === 'health'">
        <path d="M3 12.5h3.4l1.7-4 2.6 8 2.3-5.5 1.4 2.6H21" />
        <path d="M20.8 6.6a4.6 4.6 0 00-6.5 0L12 8.9l-2.3-2.3a4.6 4.6 0 10-6.5 6.5l8.8 8.7 8.8-8.7a4.6 4.6 0 000-6.5z" />
      </template>
      <template v-else-if="name === 'service'">
        <rect x="3" y="4" width="18" height="16" rx="2.4" />
        <path d="M3 9h18M8.5 13.5h7M8.5 16.5h4" />
      </template>
      <template v-else-if="name === 'emergency'">
        <path d="M12 3.2l9 15.6H3l9-15.6z" />
        <path d="M12 9.5v4.2M12 16.6h.01" />
      </template>
      <template v-else-if="name === 'staff'">
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 20a5.5 5.5 0 0111 0" />
        <path d="M16 5.6a3.2 3.2 0 010 5.8M17.5 14.6a5.5 5.5 0 013 5.4" />
      </template>
      <template v-else-if="name === 'archive'">
        <path d="M3 7.5h18v12a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 19.5v-12z" />
        <path d="M2.5 4h19v3.5h-19zM9.5 12h5" />
      </template>
      <template v-else-if="name === 'bell'">
        <path d="M18 8.5a6 6 0 10-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5z" />
        <path d="M13.7 19a2 2 0 01-3.4 0" />
      </template>
      <template v-else-if="name === 'search'">
        <circle cx="11" cy="11" r="6.5" />
        <path d="M20 20l-3.6-3.6" />
      </template>
      <template v-else-if="name === 'refresh'">
        <path d="M20.5 12a8.5 8.5 0 01-14.6 5.9L3.5 15.5" />
        <path d="M3.5 12A8.5 8.5 0 0118.1 6.1l2.4 2.4" />
        <path d="M20.5 4.5v4h-4M3.5 19.5v-4h4" />
      </template>
      <template v-else-if="name === 'menu'">
        <path d="M4 7h16M4 12h16M4 17h16" />
      </template>
      <template v-else-if="name === 'calendar'">
        <rect x="3.5" y="5" width="17" height="15.5" rx="2.2" />
        <path d="M3.5 10h17M8 3v4M16 3v4" />
      </template>
      <template v-else-if="name === 'download'">
        <path d="M12 3.5v11M7.5 10.5L12 15l4.5-4.5M4 19.5h16" />
      </template>
      <template v-else-if="name === 'filter'">
        <path d="M4 5.5h16l-6.2 7.2v5.6l-3.6 1.8v-7.4L4 5.5z" />
      </template>
      <template v-else-if="name === 'building'">
        <path d="M4 21V6.5L12 3v18M12 21h8V9.5l-8-3" />
        <path d="M7 10v.01M7 13.5v.01M7 17v.01M15.5 11v.01M15.5 14.5v.01M15.5 18v.01" />
      </template>
      <template v-else>
        <circle cx="12" cy="12" r="8" />
      </template>
    </svg>
  </div>
</template>

<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 18 },
  strokeWidth: { type: [Number, String], default: 1.7 }
})
</script>

<style scoped>
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.icon svg {
  width: 100%;
  height: 100%;
}
</style>
