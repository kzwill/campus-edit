<template>
  <nav class="nav">
    <RouterLink class="router-link" to="/">首页</RouterLink>
    <RouterLink class="router-link" to="/ui">ui</RouterLink>
    <RouterLink class="router-link" to="/user">用户</RouterLink>
    <RouterLink class="router-link" to="/use">get</RouterLink>
    <RouterLink class="router-link" to="/post">post</RouterLink>
  </nav>
  <main class="view">
    <RouterView class="view" />
  </main>
</template>

<style scoped>
.nav {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 10px;
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 999;
}
.router-link {
  margin-right: 20px;
}
.view {
  width: 100%;
}
</style>
