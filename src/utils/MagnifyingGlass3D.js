/**
 * @classdesc 3D放大镜效果
 */
export default class MagnifyingGlass3D {
  /**
   * @param {Object} options 配置参数
   * @param {number} [options.size=60] 放大镜的尺寸（宽高）
   * @param {string} [options.canvasId='circleDiv'] 用于显示放大效果的 canvas 元素 id
   * @param {number} [options.cameraFov=2] 放大镜相机的视野
   * @param {Array<number>} [options.cameraViewport=[0, 0, size, size]] 放大镜相机的视口配置
   * @param {number} [options.cameraNear=0.001] 放大镜相机的近裁剪面
   * @param {number} [options.cameraFar=1000] 放大镜相机的远裁剪面
   * @param {number} [options.layerMask=1] 放大镜相机的层级
   * @param {THING.ProjectionType} [options.cameraProjectionType=THING.ProjectionType.Perspective] 放大镜相机的投影类型
   */
  constructor(options = {}) {
    const {
      size = 60,
      canvasId = 'circleDiv',
      cameraFov = 2,
      cameraViewport = [0, 0, size, size],
      cameraNear = 0.001,
      cameraFar = 1000,
      cameraProjectionType = THING.ProjectionType.Perspective,
      layerMask = 1,
    } = options;

    this.size = size;
    this.canvasId = canvasId;
    this.cameraFov = cameraFov;
    this.cameraViewport = cameraViewport;
    this.cameraNear = cameraNear;
    this.cameraFar = cameraFar;
    this.cameraProjectionType = cameraProjectionType;
    this.layerMask = layerMask;

    // 当前应用实例
    this.app = THING.App.current;

    // 用于存储后续需要销毁的对象与事件句柄
    this.camera = null;
    this.renderTexture = null;
    this.canvasElement = null;
    this.handleAppMouseMove = null;
    this.handleDocumentMouseMove = null;
  }

  /**
   * 初始化放大镜效果
   */
  init() {
    // 创建渲染纹理，尺寸使用配置的 size
    this.renderTexture = new THING.RenderTexture({ size: [this.size, this.size] });

    // 创建放大镜专用相机，并赋予相关配置
    this.camera = new THING.Camera();
    this.camera.enableViewport = true;
    this.camera.viewport = this.cameraViewport;
    this.camera.postEffect.FXAA.enable = true;
    this.camera.postEffect.MSAA.enable = true;
    this.camera.near = this.cameraNear;
    this.camera.far = this.cameraFar;
    this.camera.projectionType = this.cameraProjectionType;
    this.camera.renderTexture = this.renderTexture;
    this.camera.control.enable = false;
    this.camera.position = this.app.camera.position;
    this.camera.angles = this.app.camera.angles;
    this.camera.fov = this.cameraFov;
    this.camera.layerMask = this.layerMask;

    // 获取用于显示放大效果的 canvas 元素
    this.canvasElement = document.getElementById(this.canvasId);
    if (!this.canvasElement) {
      console.error(`找不到 id 为 "${this.canvasId}" 的 canvas 元素`);
      return;
    }
    this.canvasElement.width = this.size;
    this.canvasElement.height = this.size;
    const ctx = this.canvasElement.getContext('2d');

    // 定义事件：更新放大镜相机目标，使其跟随主相机的视角
    this.handleAppMouseMove = (ev) => {
      this.camera.position = this.app.camera.position;
      this.camera.target = this.app.camera.screenToWorld(ev.x, ev.y, 0);
    };

    // 定义事件：更新 canvas 显示内容（绘制 renderTexture 及圆形遮罩，并移动 canvas）
    this.handleDocumentMouseMove = (ev) => {
      ctx.clearRect(0, 0, this.size, this.size);
      const imageData = new ImageData(new Uint8ClampedArray(this.renderTexture.pixelBuffer), this.size, this.size);
      ctx.putImageData(imageData, 0, 0);

      // 应用圆形遮罩效果
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(this.size / 2, this.size / 2, this.size / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      // 根据鼠标位置平移 canvas
      this.canvasElement.style.transform = `translate3d(${ev.clientX - this.size / 2}px, ${ev.clientY - this.size / 2}px, 0)`;
    };

    // 添加事件监听
    this.app.on('mousemove', this.handleAppMouseMove);
    document.addEventListener('mousemove', this.handleDocumentMouseMove);
  }

  /**
   * 销毁放大镜效果，移除事件监听并销毁相机
   */
  destroy() {
    if (this.camera) {
      this.camera.destroy();
      this.camera = null;
    }
    this.renderTexture = null;
    if (this.handleAppMouseMove) {
      this.app.off('mousemove', this.handleAppMouseMove);
      this.handleAppMouseMove = null;
    }
    if (this.handleDocumentMouseMove) {
      document.removeEventListener('mousemove', this.handleDocumentMouseMove);
      this.handleDocumentMouseMove = null;
    }
    this.canvasElement = null;
  }
}
