// 装饰物控制器 目前主要是水中的泡泡
import Sprite from "../base/sprite";
import { drawRectRadius, rpx } from "../base/util";

const BACK = "images/game/back-modal.png";
const GET = "images/game/btn-get.png";
const NO = "images/game/btn-no.png";
const CLOSE = "images/game/icon-close.png";
const PREV = "images/game/icon-prev.png";

let back;
let get;
let no;
let close;
let prev;
let alpha = 0;
const winW = window.innerWidth;

let isShow = false;
let type = 0; // 0 时间回溯 1章鱼哥预言 2加一颗球

const title = ["时间回溯", "章鱼哥预言", "再来一颗"];
const info = ["撤回上一场踢的球并放回原位", "让章鱼哥预判守门员的动作", "增加一颗点球"];

const backX = (winW - rpx(479)) / 2;
const backY = rpx(300);

export function init() {
  back = new Sprite(BACK, rpx(479), rpx(670), backX, backY);
  prev = new Sprite(PREV, rpx(194), rpx(194), (winW - rpx(194)) / 2, backY + rpx(50));
  close = new Sprite(CLOSE, rpx(55), rpx(55), backX + rpx(445), backY - rpx(28));
  get = new Sprite(GET, rpx(373), rpx(80), (winW - rpx(373)) / 2, backY + rpx(415));
  no = new Sprite(NO, rpx(373), rpx(80), (winW - rpx(373)) / 2, backY + rpx(520));
}

export function destroy() {
  back = null;
  get = null;
  no = null;
  close = null;
  prev = null;
}

export function render(ctx) {
  if (!isShow) return;

  ctx.save();
  ctx.globalAlpha = alpha;

  back.drawToCanvas(ctx);
  prev.drawToCanvas(ctx);
  close.drawToCanvas(ctx);
  get.drawToCanvas(ctx);
  no.drawToCanvas(ctx);

  let w = 250;
  if (type === 1) {
    w = 300;
  }

  drawRectRadius(ctx, (winW - rpx(w)) / 2, backY - rpx(70 / 2), rpx(w), rpx(70), 4);
  ctx.fillStyle = "#3d1d07";
  ctx.fill();

  ctx.fillStyle = "#e9c301";
  ctx.font = `bold ${rpx(40)}px Patrick Hand, -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif`;
  let titleTxt = title[type];
  const titleTxtInfo = ctx.measureText(titleTxt);
  ctx.fillText(titleTxt, (winW - titleTxtInfo.width) / 2, backY + rpx(10));

  // 中间的字
  ctx.fillStyle = "#3d1d07";
  let infoTxt = info[type];
  const lineLength = 8;
  let y = backY + rpx(300);
  for (let i = 0; i < infoTxt.length; i += 8) {
    const txtNow = infoTxt.substring(i, i + lineLength);
    const txtNowInfo = ctx.measureText(txtNow);
    ctx.fillText(txtNow, (winW - txtNowInfo.width) / 2, y);
    y += rpx(52);
  }

  alpha += 0.1;
  alpha = Math.min(alpha, 1);
  ctx.restore();
}

export function onShow(t) {
  alpha = 0;
  isShow = true;
  type = t;
}

export function checkClick(mouseX, mouseY) {
  if (close.isClick(mouseX, mouseY)) {
    isShow = false;
    return "close";
  } else if (get.isClick(mouseX, mouseY)) {
    isShow = false;
    return `share-${type}`;
  } else if (no.isClick(mouseX, mouseY)) {
    isShow = false;
    return "close";
  }
  return "";
}

export function getShow() {
  return isShow;
}

export default {
  init,
  render,
  checkClick,
  getShow,
  onShow,
  destroy,
};
