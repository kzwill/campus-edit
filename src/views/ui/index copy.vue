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
let box = null;
let app = null;
let time = Date.now();
// watchEffect(() => {
//   console.warn("mouse move", x.value, y.value);
//   if (app) {
//     const position = app.camera.screenToWorld(x.value, y.value);
//     console.warn("position", position);

//     if (position && Date.now() - time > 2000) {
//       time = Date.now();
//       box.position = [position[0], position[1] + 0.5, position[2]];
//     }

//     // setTimeout(() => {
//     //   box.position = [3, 0, 0];
//     // }, 2000);

//     // setTimeout(() => {
//     //   box.position = [3, 0, 3];
//     // }, 5000);
//   }
// });

onMounted(async () => {
  await THING.Utils.login("https://yunkan.uino.com/api/processRequest2");
  // 创建3D实例
  app = new THING.App({
    compatibleOptions: { rendering: true },
  });
  app.camera.near = 0.001;
  app.camera.far = 1000;
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
  // const campusEdit = new CampusEdit();

  createCamera();

  const car = app.query(".Entity")[0];
  // 定义小车移动路径
  var path = [
    [0, 0, 3],
    [5, 0, 3],
    [5, 0, -3],
    [0, 0, -5],
    [0, 0, 3],
  ];
  // 小车移动
  // car.movePath(path, {
  //   time: 10 * 1000,
  //   loopType: THING.LoopType.Repeat, // 循环类型
  //   lerpType: THING.LerpType.Linear.None, // 差值类型
  //   next: function (ev) {
  //     // 获取相对下一个目标点位的旋转值
  //     var quaternion = THING.Math.getQuatFromTarget(ev.from, ev.to, [0, 1, 0]);

  //     // 在 1 秒内将物体转向到目标点位
  //     ev.object.lerp.to({
  //       to: {
  //         quaternion,
  //       },
  //       time: 1000,
  //     });
  //   },
  // });

  THING.App.current.on("mousemove", ".Entity", (ev) => {
    const position = ev.pickedPosition;
    if (position && Date.now() - time > 100) {
      time = Date.now();
      box.position = [position[0], position[1], position[2]];
    }
  });
});

function createCamera() {
  box = new THING.Box({
    name: "box",
    id: "box",
    scale: [0.1, 0.1, 0.1],
    position: [0, 2, 0],
    style: { color: "red" },
  });
  box.visible = false;
  var cameras = [];
  var camera;
  const top = 10;
  const width = 400;
  const height = 400;
  camera = new THING.Camera();
  camera.enableViewport = true;
  camera.enable = false;
  camera.viewport = [1300, 300, 400, 400];
  camera.near = 0.001;
  camera.far = 1000;
  camera.projectionType = THING.ProjectionType.Perspective;
  camera.postEffect.FXAA.enable = true;
  camera.postEffect.MSAA.enable = true;
  cameras.push(camera);

  let component = new THING.EXTEND.FollowerComponent();
  cameras[0].addComponent(component, "follower");
  app.on(
    "update",
    function () {
      if (box.position[0] !== 0) {
        let screen0 = THING.App.current.camera.worldToScreen(...box.position);
        camera.viewport = [screen0[0] - 200, screen0[1] - 200, 400, 400];
        camera.position = box.selfToWorld([0, 0, 1.5]);
        camera.target = box.selfToWorld([0, 0, 0]);
      }
    },
    "firstCamera",
  );
}

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
