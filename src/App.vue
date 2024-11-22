<template>
  <h1>Hello App!</h1>
  <nav>
    <RouterLink class="router-link" to="/">首页</RouterLink>
    <RouterLink class="router-link" to="/ui">ui</RouterLink>
    <RouterLink class="router-link" to="/user">用户</RouterLink>
    <RouterLink class="router-link" to="/use">get</RouterLink>
    <RouterLink class="router-link" to="/post">post</RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.router-link {
  margin-right: 20px;
}
</style>
