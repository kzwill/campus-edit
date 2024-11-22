<template>
  <div>
    这是一个首页{{ count }}
    <br />
    <button @click="count++">点击</button>
  </div>
</template>

<script setup>
const count = ref(0);
console.log("🌟🌟🌟🌟🌟TEO", count.value);
</script>

<style scoped></style>
