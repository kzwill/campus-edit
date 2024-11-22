<template>
  <div>这是一个用户页</div>
  <div>{{ formatted }}</div>
  <div>{{ formatted2 }}</div>
  <span>
    <span>
      isLoading: {{ isLoading }}
    </span>
    <br>
    <span>
      isReady:{{ isReady }}
    </span>
    <pre lang="json" class="ml-2">{{ YAML.dump(state) }}</pre>

    <button @click="execute(1000, { time: Date.now() })">
      刷新
    </button>
  </span>
</template>

<script setup>
import YAML from 'js-yaml'
const formatted = useDateFormat(useNow(), 'YYYY-MM-DD HH:mm:ss')
const formatted2 = useDateFormat(useNow(), 'YYYY-MM-DD (dddd)', { locales: 'zh-CN' })


import { useAsyncState } from '@vueuse/core'
import { get } from '../../api/request';

const { state, isReady, isLoading, execute } = useAsyncState(
  get('/api/list'),
  { id: null },
  {
    delay: 2000,
    resetOnExecute: true,
  },
)
</script>

<style scoped></style>
