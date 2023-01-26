/**
 * 游戏基础的精灵类
 */
import TWEEN from "../libs/tween";
export default class Sprite {
  constructor(imgSrc = "", width = 0, height = 0, x = 0, y = 0, onLoaded, actions) {
    this.img = new Image();
    this.img.onload = onLoaded;

    this.resetImg = imgSrc;
    this.img.src = imgSrc;

    this.width = width;
    this.height = height;

    this.resetX = x;
    this.resetY = y;

    this.position = { x, y };
    this.spriteIndex = { index: 0 };
    this.rotate = 0;

    this.isLoaded = false;
    this.actions = actions;
    this.tween = null;
    this.tween2 = null;
    this.scaleType = "center";

    // 为了动画
    this.alpha = 0;
    this.left = -x - width;
    this.scaleY = 1;
    this.scaleX = 1;

    // 为了点击效果
    this.clickOffset = 0;
  }

  /**
   * 重置精灵，为了动画
   */
  reset() {
    this.alpha = 0;
    this.scaleY = 1;
    this.scaleX = 1;
    this.left = -this.resetX - this.width;
    this.tween?.stop();
    this.tween = null;
    this.tween2?.stop();
    this.tween2 = null;
    this.position = { x: this.resetX, y: this.resetY };
    this.spriteIndex = { index: 0 };
    this.img.src = this.resetImg;
    this.scaleType = "center";
    this.rotate = 0;
  }

  // 开始某个动作
  startAction(actionName) {
    const actionInfo = this.actions[actionName];
    if (!actionInfo) return;

    this.tween?.stop();
    this.tween2?.stop();
    console.log("this.tween", this.tween);
    // 是精灵图动画
    if (actionInfo.isAniType === "pic") {
      this.spriteIndex = { index: 0 };

      this.tween = new TWEEN.Tween(this.spriteIndex)
        .to({ index: actionInfo.pics.length - 1 }, actionInfo.time)
        .repeat(actionInfo.repeat)
        .yoyo(!!actionInfo.yoyo)
        .onUpdate(object => {
          this.img.src = actionInfo.pics[Math.round(object.index)];
        })
        .start();
    } else if (actionInfo.isAniType === "act") {
      this.scaleType = actionInfo.scaleType ?? this.scaleType;
      this.tween = new TWEEN.Tween({ ...actionInfo.arr[0] })
        .to(actionInfo.arr[1], actionInfo.time)
        .repeat(actionInfo.repeat)
        .yoyo(!!actionInfo.yoyo)
        .onUpdate(object => {
          this.position.x = object.x ?? this.position.x;
          this.position.y = object.y ?? this.position.y;
          this.scaleX = object.scaleX ?? this.scaleX;
          this.scaleY = object.scaleY ?? this.scaleY;
          this.rotate = object.rotate ?? this.rotate;
        })
        .start();
    } else {
      this.scaleType = actionInfo.scaleType ?? this.scaleType;
      this.spriteIndex = { index: 0 };
      this.tween = new TWEEN.Tween(this.spriteIndex)
        .to({ index: actionInfo.pics.length - 1 }, actionInfo.time)
        .repeat(actionInfo.repeat)
        .yoyo(!!actionInfo.yoyo)
        .onUpdate(object => {
          this.img.src = actionInfo.pics[Math.round(object.index)];
        })
        .start();

      this.tween2 = new TWEEN.Tween({ ...actionInfo.arr[0] })
        .to(actionInfo.arr[1], actionInfo.time2)
        .repeat(actionInfo.repeat)
        .yoyo(!!actionInfo.yoyo)
        .onUpdate(object => {
          this.position.x = object.x ?? this.position.x;
          this.position.y = object.y ?? this.position.y;
          this.scaleX = object.scaleX ?? this.scaleX;
          this.scaleY = object.scaleY ?? this.scaleY;
          this.rotate = object.rotate ?? this.rotate;
        })
        .start();
    }
  }

  /**
   * 将精灵图绘制在canvas上
   * @param ctx
   * @param ani opacity逐渐出现/left从左边滑入
   * */
  drawToCanvas(ctx, ani) {
    switch (ani) {
      case "opacity":
        if (this.alpha < 1) {
          ctx.save();
          ctx.globalAlpha = Math.min(this.alpha, 1);
          this.drawToCanvasManual(ctx, this.position);
          this.alpha += 0.1;
          ctx.restore();
        } else {
          this.drawToCanvasManual(ctx, this.position);
        }
        break;
      case "scale":
        this.drawToCanvasManual(ctx, this.position, this.scaleX, this.scaleY);
        if (this.scaleX < 1) {
          this.scaleX += 0.05;
          this.scaleY += 0.05;
        }
        break;
      default:
        this.drawToCanvasManual(ctx, this.position, this.scaleX, this.scaleY, this.scaleType);
    }
  }

  /**
   * 根据手动定义的坐标，将精灵图绘制在canvas上
   * @param ctx
   * @param x
   * @param y
   * @param scaleX
   * @param scaleY
   * @param scaleTYpe center, top , left, right, bottom
   */
  drawToCanvasManual(ctx, p, scaleX = 1, scaleY = 1, scaleType = "center") {
    let sX = ((1 - scaleX) * this.width) / 2;
    let sY = ((1 - scaleY) * this.height) / 2;
    switch (scaleType) {
      case "center":
        break;
      case "left":
        sX = 0;
        break;
      case "right":
        sX = (1 - scaleX) * this.width;
        break;
      case "top":
        sY = 0;
        break;
      case "bottom":
        sY = (1 - scaleY) * this.height;
        break;
    }

    if (this.rotate !== 0) {
      ctx.save();
      ctx.translate(p.x + sX + (this.width * scaleX) / 2, p.y + sY + (this.height * scaleY) / 2);
      ctx.rotate((180 / Math.PI) * this.rotate);
      ctx.drawImage(this.img, (-this.width * scaleX) / 2, (-this.height * scaleY) / 2, this.width * scaleX, this.height * scaleY);
      ctx.restore();
    } else {
      ctx.drawImage(this.img, p.x + sX, p.y + this.clickOffset + sY, this.width * scaleX, this.height * scaleY);
    }

    if (this.clickOffset > 0) {
      this.clickOffset--;
    }
  }

  // 以动画的形式移除
  removeToCanvas(ctx, ani) {
    switch (ani) {
      case "opacity":
        if (this.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = Math.min(this.alpha, 1);
          this.drawToCanvasManual(ctx, this.position);
          this.alpha -= 0.1;
          this.alpha = Math.max(0, this.alpha);
          ctx.restore();
        }
        break;
      case "scale":
        if (this.scaleX < 1) {
          this.scaleX += 0.5;
          this.drawToCanvasManual(ctx, this.position, this.scaleX, this.scaleY);
        }
        break;
    }
  }

  // 是否点中检测
  isClick(mouseX, mouseY) {
    const isClick = !!(mouseX >= this.position.x && mouseX <= this.position.x + this.width && mouseY >= this.position.y && mouseY <= this.position.y + this.height);
    if (isClick) {
      this.clickOffset = 6;
      return true;
    }
    return false;
  }
}
