<template>
  <header class="top">
    <div class="top__left">
      <button class="top__toggle" @click="store.toggleCollapse()" title="折叠菜单">
        <AppIcon name="menu" :size="19" />
      </button>
      <div class="top__crumb">
        <span class="top__crumb-main">{{ pageTitle }}</span>
        <span class="top__crumb-sep">/</span>
        <span class="top__crumb-sub">{{ store.communityName }}</span>
      </div>
    </div>

    <div class="top__right">
      <!-- 社区筛选 -->
      <div class="top__filter">
        <AppIcon name="building" :size="15" class="top__filter-icon" />
        <el-select
          v-model="community"
          size="small"
          class="top__select"
          placeholder="选择社区"
          @change="onCommunityChange"
        >
          <el-option label="全部社区" value="all" />
          <el-option
            v-for="c in store.communityOptions"
            :key="c.value"
            :label="`${c.label}（${c.elders}人）`"
            :value="c.value"
          />
        </el-select>
      </div>

      <!-- 时间范围 -->
      <div class="top__filter">
        <AppIcon name="calendar" :size="15" class="top__filter-icon" />
        <el-select v-model="days" size="small" class="top__select top__select--sm" @change="onDaysChange">
          <el-option label="近 7 天" :value="7" />
          <el-option label="近 30 天" :value="30" />
          <el-option label="近 90 天" :value="90" />
        </el-select>
      </div>

      <!-- 刷新 -->
      <button class="top__btn" title="刷新数据" @click="emit('refresh')">
        <AppIcon name="refresh" :size="17" />
      </button>

      <!-- 告警 -->
      <el-popover placement="bottom-end" :width="320" trigger="click" popper-class="notice-pop">
        <template #reference>
          <div class="top__btn top__btn--bell">
            <AppIcon name="bell" :size="17" />
            <span class="top__badge" v-if="store.notices.length">{{ store.notices.length }}</span>
          </div>
        </template>
        <div class="notice">
          <div class="notice__head">实时告警通知</div>
          <ul class="notice__list">
            <li v-for="n in store.notices" :key="n.id" class="notice__item">
              <span class="notice__dot" :class="`notice__dot--${n.level}`"></span>
              <div class="notice__body">
                <div class="notice__title">{{ n.title }}</div>
                <div class="notice__time">{{ n.time }}</div>
              </div>
            </li>
            <li v-if="!store.notices.length" class="notice__empty">暂无告警</li>
          </ul>
        </div>
      </el-popover>

      <!-- 用户 -->
      <div class="top__user">
        <div class="top__avatar">管</div>
        <div class="top__user-info">
          <div class="top__user-name">社区管理员</div>
          <div class="top__user-role">数据管理平台</div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { useAppStore } from '@/stores/app'

const emit = defineEmits(['refresh'])

const route = useRoute()
const store = useAppStore()

const community = ref(store.community)
const days = ref(store.days)

watch(
  () => store.community,
  (v) => (community.value = v)
)
watch(
  () => store.days,
  (v) => (days.value = v)
)

const pageTitle = computed(() => route.meta.title || '首页')

function onCommunityChange(v) {
  store.setCommunity(v)
  emit('refresh')
}
function onDaysChange(v) {
  store.setDays(v)
  emit('refresh')
}
</script>

<style lang="scss" scoped>
.top {
  height: 58px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  background: $panel;
  border-bottom: 1px solid $border;
  box-shadow: $shadow-sm;
  z-index: 10;
}

.top__left,
.top__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.top__toggle {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: $panel-sub;
  color: $text-2;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .16s ease, color .16s ease;

  &:hover {
    background: $primary-soft;
    color: $primary;
  }
}

.top__crumb {
  display: flex;
  align-items: baseline;
  gap: 7px;
}

.top__crumb-main {
  font-size: 15px;
  font-weight: 600;
  color: $text-1;
}

.top__crumb-sep {
  color: $text-3;
}

.top__crumb-sub {
  font-size: 13px;
  color: $text-2;
}

.top__filter {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px 0 10px;
  height: 32px;
  border-radius: 8px;
  background: $panel-sub;
  border: 1px solid $border-soft;
}

.top__filter-icon {
  color: $text-3;
}

.top__select {
  width: 165px;

  :deep(.el-select__wrapper) {
    box-shadow: none !important;
    background: transparent;
    padding: 0;
    min-height: 30px;
  }

  :deep(.el-select__selected-item) {
    font-size: 13px;
    color: $text-1;
    font-weight: 500;
  }
}

.top__select--sm {
  width: 108px;
}

.top__btn {
  position: relative;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: $panel-sub;
  color: $text-2;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .16s ease, color .16s ease;

  &:hover {
    background: $primary-soft;
    color: $primary;
  }
}

.top__badge {
  position: absolute;
  top: -3px;
  right: -3px;
  min-width: 15px;
  height: 15px;
  padding: 0 4px;
  border-radius: 8px;
  background: $red;
  color: #fff;
  font-size: 10px;
  line-height: 15px;
  text-align: center;
  font-weight: 600;
}

.top__user {
  display: flex;
  align-items: center;
  gap: 9px;
  padding-left: 12px;
  border-left: 1px solid $border-soft;
}

.top__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary, $purple);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.top__user-name {
  font-size: 13px;
  font-weight: 600;
  color: $text-1;
  line-height: 1.2;
}

.top__user-role {
  font-size: 11px;
  color: $text-3;
  margin-top: 1px;
}
</style>

<style lang="scss">
.notice-pop {
  padding: 0 !important;
}

.notice {
  &__head {
    font-size: 13px;
    font-weight: 600;
    color: $text-1;
    padding: 12px 14px;
    border-bottom: 1px solid $border-soft;
  }

  &__list {
    max-height: 300px;
    overflow-y: auto;
    padding: 6px 0;
  }

  &__item {
    display: flex;
    gap: 9px;
    padding: 9px 14px;
    transition: background .15s ease;

    &:hover {
      background: $panel-sub;
    }
  }

  &__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    margin-top: 5px;
    flex-shrink: 0;

    &--danger { background: $red; }
    &--warning { background: $amber; }
    &--info { background: $primary; }
  }

  &__title {
    font-size: 12.5px;
    color: $text-1;
    line-height: 1.5;
  }

  &__time {
    font-size: 11px;
    color: $text-3;
    margin-top: 3px;
  }

  &__empty {
    padding: 22px;
    text-align: center;
    font-size: 12.5px;
    color: $text-3;
  }
}
</style>
