export default class CampusEdit {
  constructor() {
    this.object = null;
    this.handles = {}; // 存储各方向手柄的引用
    this.init();
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

  // 选中对象时，保存初始数据，并创建手柄
  choose(object) {
    this.unChoose();
    this.object = object;
    this.object.pickable = false;

    // 记录选中时的初始缩放、包围盒尺寸和包围盒中心（作为计算基准）
    this.initialScale = [...this.object.scale];
    this.initialSize = [...this.object.boundingBox.size]; // [width, height, depth]
    this.initialCenter = [...this.object.boundingBox.center];

    this.createHandles();

    // 显示辅助包围盒（选中效果）
    if (object.helper && object.helper.boundingBox) {
      object.helper.boundingBox.visible = true;
    }
    object.bounding.inheritType = THING.InheritType.Break;
  }

  unChoose() {
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
    this.object = null;
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

      // 拖拽过程中（dragging）根据当前手柄位置计算新的缩放，
      // 同时统一使用当前 boundingBox.center 和绝对“半尺寸”来调整手柄位置
      handle.on('dragging', () => {
        // 半透明提示正在编辑
        this.object.style.opacity = 0.5;
        // 使用当前的包围盒中心（保证每次都根据最新状态调整）
        const center = this.object.boundingBox.center;
        // 计算当前“半高度”，注意用绝对值保证为正
        const currentHalfHeight = (this.initialSize[1] / 2) * (Math.abs(this.object.scale[1]) / this.initialScale[1]);

        if (handleName === '左') {
          // 限制 x 轴运动，保持 y 与 z 由当前 center 和半高度确定
          const currentX = handle.position[0];
          handle.position = [currentX, center[1] - currentHalfHeight, center[2]];

          const distance = center[0] - currentX; // 左侧：center.x - handle.x（允许为负，实现反转）
          const ratio = distance / (this.initialSize[0] / 2);
          const newScaleX = this.initialScale[0] * ratio;
          this.object.scale = [newScaleX, this.object.scale[1], this.object.scale[2]];

        } else if (handleName === '右') {
          const currentX = handle.position[0];
          handle.position = [currentX, center[1] - currentHalfHeight, center[2]];

          const distance = currentX - center[0]; // 右侧：handle.x - center.x
          const ratio = distance / (this.initialSize[0] / 2);
          const newScaleX = this.initialScale[0] * ratio;
          this.object.scale = [newScaleX, this.object.scale[1], this.object.scale[2]];

        } else if (handleName === '前') {
          const currentZ = handle.position[2];
          handle.position = [center[0], center[1] - currentHalfHeight, currentZ];

          const distance = center[2] - currentZ; // 前侧：center.z - handle.z
          const ratio = distance / (this.initialSize[2] / 2);
          const newScaleZ = this.initialScale[2] * ratio;
          this.object.scale = [this.object.scale[0], this.object.scale[1], newScaleZ];

        } else if (handleName === '后') {
          const currentZ = handle.position[2];
          handle.position = [center[0], center[1] - currentHalfHeight, currentZ];

          const distance = currentZ - center[2]; // 后侧：handle.z - center.z
          const ratio = distance / (this.initialSize[2] / 2);
          const newScaleZ = this.initialScale[2] * ratio;
          this.object.scale = [this.object.scale[0], this.object.scale[1], newScaleZ];

        } else if (handleName === '上') {
          const currentY = handle.position[1];
          // 只允许 y 轴运动
          handle.position = [center[0], currentY, center[2]];

          const distance = currentY - center[1]; // 顶部：handle.y - center.y
          const ratio = distance / (this.initialSize[1] / 2);
          const newScaleY = this.initialScale[1] * ratio;
          this.object.scale = [this.object.scale[0], newScaleY, this.object.scale[2]];
        }

        // 每次拖拽过程中更新所有手柄位置
        this.updateHandles(handleName);
      });

      handle.on('dragend', () => {
        this.object.style.opacity = 1;
        handle.style.outlineColor = null;
        // 拖拽结束后更新初始数据，便于下一次计算
        this.initialScale = [...this.object.scale];
        // 这里建议使用最新的 boundingBox.center，确保后续计算与当前状态一致
        this.initialCenter = [...this.object.boundingBox.center];
        this.initialSize = [...this.object.boundingBox.size];
      });
    }
  }

  // 根据当前对象的状态，重新计算手柄的位置
  updateHandles(handleName) {
    if (!this.object) return;
    // 使用当前的 boundingBox.center（保证各手柄跟随当前形变后的模型）
    const center = this.object.boundingBox.center;
    // 计算各方向的“半尺寸”时，取绝对值确保长度为正
    const halfWidth = (this.initialSize[0] / 2) * (Math.abs(this.object.scale[0]) / this.initialScale[0]);
    const halfHeight = (this.initialSize[1] / 2) * (Math.abs(this.object.scale[1]) / this.initialScale[1]);
    const halfDepth = (this.initialSize[2] / 2) * (Math.abs(this.object.scale[2]) / this.initialScale[2]);

    if (this.handles['左'] && ['左', '右'].includes(handleName)) {
      this.handles['左'].position = [center[0] - halfWidth, center[1] - halfHeight, center[2]];
    }
    if (this.handles['右'] && ['左', '右'].includes(handleName)) {
      this.handles['右'].position = [center[0] + halfWidth, center[1] - halfHeight, center[2]];
    }
    if (this.handles['前'] && ['前', '后'].includes(handleName)) {
      this.handles['前'].position = [center[0], center[1] - halfHeight, center[2] - halfDepth];
    }
    if (this.handles['后'] && ['前', '后'].includes(handleName)) {
      this.handles['后'].position = [center[0], center[1] - halfHeight, center[2] + halfDepth];
    }
    if (this.handles['上'] && ['上'].includes(handleName)) {
      this.handles['上'].position = [center[0], center[1] + halfHeight, center[2]];
    }
  }

  // 创建一个小盒子作为手柄，并添加拖拽功能
  createBoxHandler(handleName, position) {
    return new Promise((resolve) => {
      new THING.Box({
        position: position,
        scale: [0.03, 0.03, 0.03],
        name: handleName,
        id: handleName,
        style: { color: 'red' },
        onComplete: ({ object: handle }) => {
          // 鼠标移入时设置 outline 和光标样式
          handle.on('mouseenter', () => {
            handle.style.outlineColor = '#ffffff';
            let cursor = 'n-resize';
            if (handleName === '左' || handleName === '右') {
              cursor = 'ew-resize';
            } else if (handleName === '前' || handleName === '后') {
              cursor = 'ns-resize';
            }
            document.body.style.cursor = cursor;
          });
          // 鼠标移出时还原样式
          handle.on('mouseleave', () => {
            handle.style.outlineColor = null;
            document.body.style.cursor = 'auto';
          });
          // 添加拖拽组件
          handle.addComponent(THING.EXTEND.DragComponent, 'drag', {
            outlineColor: '#ffffff'
          });
          handle.drag.enable = true;
          resolve(handle);
        },
      });
    });
  }
}
