import Sprite from "../base/sprite";
import { makeImgSize, rpx } from "../base/util";

const LOGO_SRC = "images/start/logo.png";
const START_SRC = "images/start/btn-start.png";
const BACK_SRC = "images/start/back-home.jpg";

let back;
let start;
let logo;
let alpha = 0;

const winW = window.innerWidth;
const winH = window.innerHeight;

export async function init() {
  const backInfo = makeImgSize(750, 1351, winW, winH);
  back = new Sprite(BACK_SRC, backInfo[2], backInfo[3], backInfo[0], backInfo[1]);
  start = new Sprite(START_SRC, rpx(300), rpx(100), (winW - rpx(300)) / 2, winH - rpx(180));
  logo = new Sprite(LOGO_SRC, rpx(634), rpx(337), (winW - rpx(634)) / 2, rpx(110));
  logo.scale = 0.4;
}

export function destroy() {
  start = null;
}

export function render(ctx, isDone) {
  ctx.save();
  ctx.globalAlpha = alpha;

  // 画背景
  back.drawToCanvas(ctx);
  start.drawToCanvas(ctx);
  logo.drawToCanvas(ctx, "scale");

  ctx.restore();
  alpha += 0.1;
  alpha = Math.min(alpha, 1);
}

export function checkClick(mouseX, mouseY) {
  console.log("点击", mouseX, mouseY);
  if (start.isClick(mouseX, mouseY)) {
    return "start";
  }
}

export default {
  init,
  destroy,
  render,
  checkClick,
};
