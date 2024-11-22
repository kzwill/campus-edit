<script setup>
import { useAsyncState } from '@vueuse/core'
import YAML from 'js-yaml'
import { get, post } from '../../api/request';

const { isLoading, state, isReady, execute } = useAsyncState(
  () => post(`/api/post`, {}, '用户名单'),
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