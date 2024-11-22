<script setup>
import { useAsyncState } from '@vueuse/core'
import YAML from 'js-yaml'
import { get } from '../../api/request';

const { isLoading, state, isReady, execute } = useAsyncState(
  () => get(`/api/list`, {}, '获取用户信息'),
  {},
  {
    delay: 0,
    resetOnExecute: false,
  },
)
</script>

<template>
  <div>
    <span>Ready: {{ isReady.toString() }}</span>
    <br>
    <span>Loading: {{ isLoading.toString() }}</span>
    <pre lang="json" class="ml-2">{{ YAML.dump(state) }}</pre>
    <button @click="execute(0)">
      Execute
    </button>
  </div>
</template>