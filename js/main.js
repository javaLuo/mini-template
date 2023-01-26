import Music from "./runtime/music";
import GlobalUI from "./runtime/globalUI";

import TWEEN from "./libs/tween";
import HomeService from "./runtime/loading";
import GameService from "./runtime/game";
import MessageServer from "./runtime/message";

import gameModal from "./components/gameModal";

const ctx = canvas.getContext("2d");

// 必要的资源是否加载完毕
const allAssets = {
  back: false,
  backControl: false,
  btn1: false,
};

/**=======================================
 * 游戏主函数
======================================== */
export default class Main {
  constructor() {
    this.aniId = 0; // 帧循环的ID
    this.isDone = true; // 初始化是否完毕

    this.isPageShow = true; // 页面是否激活
    this.pageType = 1; // 1开始页面 2用户页面 3游戏页面
    this.pageClickType = 0; // 为了区分同一个页面不同状态的点击

    this.initWx();
    this.init();
  }

  /**==================
   * 初始化微信 生命周期
   * ================== **/
  initWx() {
    wx.onShow(() => {
      this.isPageShow = true;
      this.music.playBgm();
    });

    wx.onHide(() => {
      this.isPageShow = false;
      this.music.pauseBgm();
    });

    wx.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"],
    });

    wx.onShareAppMessage(function () {
      return {
        imageUrlId: "K61r2CPVRuCIp+xzFvu9Iw==",
        imageUrl: "https://mmocgame.qpic.cn/wechatgame/icglZ3icGeSMognW9WIR9xEOxgLib022TbcTVibiahMibeaiaI6aK7q1rVsicpF3Fia9plOAO/0",
      };
    });

    wx.loadFont("font/PatrickHand-Regular.ttf");
  }

  /**==================
   * 初始化
   * ================== **/
  async init() {
    const dpr = wx.getSystemInfoSync().pixelRatio;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    this.bindCheckLoaded = this.checkLoaded.bind(this);

    await HomeService.init();

    GlobalUI.init();

    this.music = new Music();

    // touch事件
    this.touchHandler = this.onTouch.bind(this);
    canvas.addEventListener("touchstart", this.touchHandler);

    // 开始帧循环先
    this.bindLoop = this.loop.bind(this);
    this.startAnime();
  }

  // 检查资源是否全部加载完毕 两个背景和按钮加载完毕就认为完毕
  checkLoaded(type) {
    allAssets[type] = true;
    const isOK = Object.values(allAssets).reduce((res, item) => {
      return res && item;
    }, true);
    if (!this.isDone && isOK) {
      this.isDone = true;
    }
  }

  // 开始帧循环
  startAnime() {
    window.cancelAnimationFrame(this.aniId);
    this.aniId = window.requestAnimationFrame(this.bindLoop, canvas);
  }

  /**==================
   * 场景切换处理
   * ================== **/
  changeScene(next) {
    const prev = this.pageType;

    switch (prev) {
      case 1:
        HomeService.destroy();
        break;
      case 2:
        GameService.destroy();
        gameModal.destroy();
        break;
      case 3:
        break;
    }

    switch (next) {
      case 1:
        HomeService.init();
        break;
      case 2:
        GameService.init();
        gameModal.init();
        break;
      case 3:
        break;
    }

    this.pageType = next;
  }

  /**==================
   * 页面中的所有触摸事件
   * ================== **/
  onTouch(e) {
    e.preventDefault();

    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;

    const isSound = this.music.isPlaying();

    if (GlobalUI.checkClick(x, y) === "music") {
      GlobalUI.changeMusicBtn(!isSound);
      this.music.triggerBgm();
    }

    if (!this.isDone) return;

    if (this.pageType === 1) {
      // 游戏尚未开始时
      const type = HomeService.checkClick(x, y);
      if (type === "start") {
        this.changeScene(2);
      }
    } else if (this.pageType === 2) {
      if (gameModal.getShow()) {
        const modalType = gameModal.checkClick(x, y);
        if (modalType.includes("share")) {
          GameService.onShare(modalType);
        }
        return;
      }

      const type = GameService.checkClick(x, y);
      switch (type) {
        case "back":
          this.changeScene(1);
          break;
        case "right":
          isSound && this.music.playBtn();
          break;
        case "shot-success":
          setTimeout(() => {
            this.music.playSuccess();
          }, 700);
          break;
        case "shot-fail":
          break;
        case 0:
      }
    } else if (this.pageType === 3) {
    }
  }

  /**=======================
   * 绘制一帧
   * 每一帧重新绘制所有的需要展示的元素
   ========================= **/
  render() {
    if (!this.isPageShow) return;
  }

  /** =========================
   * 实现游戏帧循环
  ========================= **/
  loop() {
    TWEEN.update();
    switch (this.pageType) {
      case 1:
        HomeService.render(ctx);
        break;
      case 2:
        GameService.render(ctx);
        gameModal.render(ctx);
        break;
    }
    MessageServer.render(ctx);

    this.aniId = window.requestAnimationFrame(this.bindLoop, canvas);
  }
}
