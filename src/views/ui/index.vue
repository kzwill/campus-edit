<template>
  <div v-bind="$attrs">
    <div class="pos">pos: [{{ x }}, {{ y }}]</div>
    <div id="div3d"></div>
    <button id="div2d" @click="changeViewMode">2D/3D</button>
  </div>
</template>

<script setup>
import CampusEdit from "../../utils/CampusEdit.js";
const { x, y } = useMouse();

onMounted(async () => {
  await THING.Utils.login("https://yunkan.uino.com/api/processRequest2");
  // 创建3D实例
  const app = new THING.App({
    compatibleOptions: { rendering: true },
  });
  // 启用默认网格
  const grid = app.create({
    type: "Grid",
    size: 20, // 格网大小
    divisions: 20, // 细分的格网数
  });
  grid.style.color = "white";
  grid.style.opacity = 0.3;
  await app.load(
    "/tjs/", //scene-bundle文件路径
  );
  app.level.change(app.query(".Campus")[0]);
  const campusEdit = new CampusEdit();
});

function changeViewMode() {
  const app = THING.App.current;
  var viewMode = app.camera.getViewModeType();
  if (viewMode == null) {
    app.camera.setViewMode("Top"); // 切换为2D视图
    app.camera.enableRotate = false; // 禁用旋转
  } else {
    app.camera.setViewMode(); // 默认为3D视图
    app.camera.enableRotate = true;
  }
}
</script>

<style scoped>
.pos {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  color: #ffffff;
}
#div3d {
  width: 100%;
  height: 100%;
}

#div2d {
  position: absolute;
  top: 40px;
  right: 20px;
  z-index: 100;
  color: #00ff00;
  background-color: #000000;
  padding: 4px 10px;
}
</style>
