export default class CampusEdit {
  constructor(options = {}) {
    // 默认配置参数，可通过 options 覆盖
    const defaultConfig = {
      handleScale: [0.03, 0.03, 0.03],
      handleColor: 'red',
      handleOutlineColor: '#ffffff',
      markerScale: [0.1, 0.1, 0.1],
      markerImageVertical: '/images/move1.png',
      markerImageHorizontal: '/images/move2.png',
      verticalOffset: 0.08,
      dragColor: '#00ff00',
      // 键盘控制移动距离（水平和垂直方向分别可配置）
      moveStep: 0.1,
      verticalMoveStep: 0.1
    };
    this.config = { ...defaultConfig, ...options };

    this.object = null;
    this.handles = {}; // 存储各方向手柄的引用
    this.markers = [];
    // 记录选中时的初始状态
    this.initialScale = [];
    this.initialSize = [];
    this.initialCenter = [];

    this.init();
    this.initKeyboard();
    console.log('CampusEdit init');
  }

  init() {
    // 左键选中对象，右键取消选中
    THING.App.current.on('click', ({ object, button }) => {
      if (button === 0) {
        if (!object || object.type !== 'Entity') return;
        this.choose(object);
      } else {
        this.unChoose();
      }
    });
  }

  // 初始化键盘事件监听
  initKeyboard() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  // 键盘事件处理：支持水平和垂直（shift+上下）移动
  handleKeyDown(e) {
    if (!this.object) return;
    let dx = 0, dy = 0, dz = 0;
    // 按住 shift 键时，上下键控制垂直方向移动
    if (e.shiftKey) {
      if (e.key === 'ArrowUp') {
        dy = this.config.verticalMoveStep;
      } else if (e.key === 'ArrowDown') {
        dy = -this.config.verticalMoveStep;
      }
    } else {
      // 否则，箭头键控制水平平面的移动：
      // 约定：ArrowUp → 前移（z轴负方向），ArrowDown → 后移（z轴正方向）
      //       ArrowLeft → 左移（x轴负方向），ArrowRight → 右移（x轴正方向）
      if (e.key === 'ArrowUp') {
        dz = -this.config.moveStep;
      } else if (e.key === 'ArrowDown') {
        dz = this.config.moveStep;
      } else if (e.key === 'ArrowLeft') {
        dx = -this.config.moveStep;
      } else if (e.key === 'ArrowRight') {
        dx = this.config.moveStep;
      }
    }
    if (dx !== 0 || dy !== 0 || dz !== 0) {
      const pos = this.object.position;
      this.object.position = [pos[0] + dx, pos[1] + dy, pos[2] + dz];
      // 同步更新 marker 位置（marker位置 = 物体位置 + marker 内部保存的局部偏移量）
      this.markers.forEach(marker => {
        marker.position = [
          this.object.position[0] + marker.userData.localPosition[0],
          this.object.position[1] + marker.userData.localPosition[1],
          this.object.position[2] + marker.userData.localPosition[2]
        ];
      });
      // 同步更新所有手柄的位置
      this.updateAllHandles();
    }
  }

  // 选中对象时，保存初始数据，并创建手柄
  choose(object) {
    this.unChoose();
    this.object = object;
    this.object.pickable = false;

    // 记录选中时的初始状态
    this.initialScale = [...object.scale];
    this.initialSize = [...object.boundingBox.size]; // [width, height, depth]
    this.initialCenter = [...object.boundingBox.center];

    this.createHandles();

    // 显示辅助包围盒（选中效果）
    if (object.helper && object.helper.boundingBox) {
      object.helper.boundingBox.visible = true;
    }
    object.bounding.inheritType = THING.InheritType.Break;

    // 创建移动标记，只在首次创建
    if (this.markers.length === 0) {
      this.createMoveMarkers();
    }
  }

  unChoose(obj) {
    if (!this.object) return;
    this.object.pickable = true;
    if (this.object.helper && this.object.helper.boundingBox) {
      this.object.helper.boundingBox.visible = false;
    }
    // 销毁所有手柄
    Object.values(this.handles).forEach(handle => {
      if (handle.destroy) handle.destroy();
    });
    this.handles = {};
    if (!obj) {
      this.object = null;
      this.markers.forEach(marker => marker.destroy());
      this.markers = [];
    }
  }

  // 创建各方向的拖拽手柄
  async createHandles() {
    const [width, height, depth] = this.initialSize;
    const centerBox = this.object.boundingBox.center;
    // 初始各手柄位置：左右在 x 轴，前后在 z 轴，上在 y 轴
    const positions = {
      '左': [centerBox[0] - width / 2, centerBox[1] - height / 2, centerBox[2]],
      '右': [centerBox[0] + width / 2, centerBox[1] - height / 2, centerBox[2]],
      '前': [centerBox[0], centerBox[1] - height / 2, centerBox[2] - depth / 2],
      '后': [centerBox[0], centerBox[1] - height / 2, centerBox[2] + depth / 2],
      '上': [centerBox[0], centerBox[1] + height / 2, centerBox[2]]
    };

    for (const handleName in positions) {
      const handle = await this.createBoxHandler(handleName, positions[handleName]);
      this.handles[handleName] = handle;

      // 拖拽过程中根据手柄位置计算新的缩放，并更新所有手柄的位置
      handle.on('dragging', () => {
        this.object.style.opacity = 0.5;
        const center = this.object.boundingBox.center;
        // 计算当前“半高度”
        const currentHalfHeight =
          (this.initialSize[1] / 2) * (Math.abs(this.object.scale[1]) / this.initialScale[1]);

        if (handleName === '左') {
          const currentX = handle.position[0];
          handle.position = [currentX, center[1] - currentHalfHeight, center[2]];
          const distance = center[0] - currentX;
          const ratio = distance / (this.initialSize[0] / 2);
          const newScaleX = this.initialScale[0] * ratio;
          this.object.scale = [newScaleX, this.object.scale[1], this.object.scale[2]];

        } else if (handleName === '右') {
          const currentX = handle.position[0];
          handle.position = [currentX, center[1] - currentHalfHeight, center[2]];
          const distance = currentX - center[0];
          const ratio = distance / (this.initialSize[0] / 2);
          const newScaleX = this.initialScale[0] * ratio;
          this.object.scale = [newScaleX, this.object.scale[1], this.object.scale[2]];

        } else if (handleName === '前') {
          const currentZ = handle.position[2];
          handle.position = [center[0], center[1] - currentHalfHeight, currentZ];
          const distance = center[2] - currentZ;
          const ratio = distance / (this.initialSize[2] / 2);
          const newScaleZ = this.initialScale[2] * ratio;
          this.object.scale = [this.object.scale[0], this.object.scale[1], newScaleZ];

        } else if (handleName === '后') {
          const currentZ = handle.position[2];
          handle.position = [center[0], center[1] - currentHalfHeight, currentZ];
          const distance = currentZ - center[2];
          const ratio = distance / (this.initialSize[2] / 2);
          const newScaleZ = this.initialScale[2] * ratio;
          this.object.scale = [this.object.scale[0], this.object.scale[1], newScaleZ];

        } else if (handleName === '上') {
          const currentY = handle.position[1];
          handle.position = [center[0], currentY, center[2]];
          const distance = currentY - center[1];
          const ratio = distance / (this.initialSize[1] / 2);
          const newScaleY = this.initialScale[1] * ratio;
          this.object.scale = [this.object.scale[0], newScaleY, this.object.scale[2]];
        }

        // 更新所有手柄位置（位移或缩放变化）
        this.updateAllHandles();
      });

      handle.on('dragend', () => {
        this.object.style.opacity = 1;
        handle.style.outlineColor = null;
        // 拖拽结束后更新初始数据，便于下一次计算
        this.initialScale = [...this.object.scale];
        this.initialCenter = [...this.object.boundingBox.center];
        this.initialSize = [...this.object.boundingBox.size];
      });
    }
  }

  // 更新所有手柄的位置（同步到物体最新状态）
  updateAllHandles() {
    if (!this.object) return;
    const center = this.object.boundingBox.center;
    const halfWidth =
      (this.initialSize[0] / 2) * (Math.abs(this.object.scale[0]) / this.initialScale[0]);
    const halfHeight =
      (this.initialSize[1] / 2) * (Math.abs(this.object.scale[1]) / this.initialScale[1]);
    const halfDepth =
      (this.initialSize[2] / 2) * (Math.abs(this.object.scale[2]) / this.initialScale[2]);

    if (this.handles['左']) {
      this.handles['左'].position = [center[0] - halfWidth, center[1] - halfHeight, center[2]];
    }
    if (this.handles['右']) {
      this.handles['右'].position = [center[0] + halfWidth, center[1] - halfHeight, center[2]];
    }
    if (this.handles['前']) {
      this.handles['前'].position = [center[0], center[1] - halfHeight, center[2] - halfDepth];
    }
    if (this.handles['后']) {
      this.handles['后'].position = [center[0], center[1] - halfHeight, center[2] + halfDepth];
    }
    if (this.handles['上']) {
      this.handles['上'].position = [center[0], center[1] + halfHeight, center[2]];
    }
  }

  // 创建一个小盒子作为手柄，并添加拖拽功能
  createBoxHandler(handleName, position) {
    return new Promise((resolve) => {
      new THING.Box({
        position,
        scale: this.config.handleScale,
        name: handleName,
        id: handleName,
        style: { color: this.config.handleColor },
        onComplete: ({ object: handle }) => {
          // 鼠标移入时设置 outline 和光标样式
          handle.on('mouseenter', () => {
            handle.style.outlineColor = this.config.handleOutlineColor;
            let cursor = 'n-resize';
            if (handleName === '左' || handleName === '右') {
              cursor = 'ew-resize';
            } else if (handleName === '前' || handleName === '后') {
              cursor = 'ns-resize';
            }
            document.body.style.cursor = cursor;
          });
          handle.on('mouseleave', () => {
            handle.style.outlineColor = null;
            document.body.style.cursor = 'auto';
          });
          // 添加拖拽组件
          handle.addComponent(THING.EXTEND.DragComponent, 'drag', {
            outlineColor: this.config.handleOutlineColor
          });
          handle.drag.enable = true;
          resolve(handle);
        },
      });
    });
  }

  // 创建移动标记（marker）
  createMoveMarkers() {
    const verticalOffset = this.config.verticalOffset;
    let centerBox = this.object.boundingBox.center;
    const markerConfigs = [
      {
        position: [centerBox[0] + verticalOffset, centerBox[1], centerBox[2]],
        style: { image: new THING.ImageTexture(this.config.markerImageVertical) },
        name: '纵向移动标记',
        step: verticalOffset
      },
      {
        position: [centerBox[0] - verticalOffset, centerBox[1], centerBox[2]],
        style: { image: new THING.ImageTexture(this.config.markerImageHorizontal) },
        name: '横向移动标记',
        step: -verticalOffset
      }
    ];

    markerConfigs.forEach(async (item) => {
      const marker = await this.createMarker(item);
      // 记录 marker 与物体的局部偏移量，用于后续同步移动
      marker.userData = {
        localPosition: [
          marker.position[0] - this.object.position[0],
          marker.position[1] - this.object.position[1],
          marker.position[2] - this.object.position[2],
        ]
      };
      this.markers.push(marker);

      marker.on('dragstart', () => {
        this.unChoose(this.object);
        this.object.style.opacity = 0.5;
        this.object.pickable = false;
        this.object.style.outlineColor = '#ff8000';
        this.markers
          .filter(m => m.name !== item.name)
          .forEach(m => { m.visible = false; });
      });
      let timer = Date.now();
      marker.on('dragging', () => {
        if (item.name === '横向移动标记') {
          marker.position = [marker.position[0], centerBox[1], marker.position[2]];
        } else if (item.name === '纵向移动标记') {
          marker.position = [centerBox[0] + verticalOffset, marker.position[1], centerBox[2]];
        }
        // 节流，每10毫秒更新一次
        if (Date.now() - timer > 10) {
          timer = Date.now();
          this.object.position = [
            marker.position[0] - marker.userData.localPosition[0],
            marker.position[1] - marker.userData.localPosition[1],
            marker.position[2] - marker.userData.localPosition[2]
          ];
          // 同步更新 marker 的位置
          this.markers
            .filter(m => m.name !== item.name)
            .forEach(m => {
              m.position = [
                this.object.position[0] + m.userData.localPosition[0],
                this.object.position[1] + m.userData.localPosition[1],
                this.object.position[2] + m.userData.localPosition[2],
              ];
            });
          // 更新手柄的位置
          this.updateAllHandles();
        }
      });

      marker.on('dragend', () => {
        this.object.style.opacity = 1;
        this.object.style.outlineColor = null;
        this.object.pickable = true;
        marker.style.color = null;
        this.markers
          .filter(m => m.name !== item.name)
          .forEach(m => { m.visible = true; });
        centerBox = this.object.boundingBox.center;
        this.choose(this.object);
      });
    });
  }

  // 创建一个标记（图片标注）
  createMarker(params) {
    return new Promise((resolve) => {
      new THING.Marker({
        name: 'verticalMarker',
        position: [0, 0, 0],
        pivot: [0.5, 0.5],
        scale: this.config.markerScale,
        style: { image: new THING.ImageTexture(this.config.markerImageVertical) },
        alwaysOnTop: true,
        ...params,
        onComplete: ({ object: marker }) => {
          marker.addComponent(THING.EXTEND.DragComponent, 'drag', {
            color: this.config.dragColor
          });
          marker.drag.enable = true;
          marker.on('mouseenter', () => {
            marker.style.color = this.config.dragColor;
            document.body.style.cursor = 'pointer';
          });
          marker.on('mouseleave', () => {
            marker.style.color = null;
            document.body.style.cursor = 'auto';
          });
          resolve(marker);
        }
      });
    });
  }
}
