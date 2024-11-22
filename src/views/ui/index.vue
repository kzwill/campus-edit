<template>
  <div>这是一个UI页</div>
  <div>pos: {{ x }}, {{ y }}</div>
</template>

<script setup>
const { x, y } = useMouse()
</script>

<style scoped></style>
