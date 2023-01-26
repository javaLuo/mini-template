// 工具 - 设置图片尺寸cover方式贴合canvas尺寸 w/h
export function makeImgSize(imgWidth, imgHeight, canvasWidth, canvasHeight) {
  const imgScale = imgWidth / imgHeight;
  const canvasScale = canvasWidth / canvasHeight;
  let x = 0,
    y = 0,
    w = 0,
    h = 0;
  if (imgScale > canvasScale) {
    h = canvasHeight;
    w = imgScale * h;
    y = 0;
    x = (canvasWidth - w) / 2;
  } else {
    w = canvasWidth;
    h = w / imgScale;
    x = 0;
    y = (canvasHeight - h) / 2;
  }
  return [x, y, w, h];
}

// 工具 - 设置图片尺寸co方式贴合canvas尺寸 w/h
export function makeImgSize2(imgWidth, imgHeight, boxWidth, boxHeight) {
  const imgScale = imgWidth / imgHeight;
  const canvasScale = boxWidth / boxHeight;
  let x = 0,
    y = 0,
    w = 0,
    h = 0;
  if (imgScale > canvasScale) {
    // 图片宽度更大
    w = boxWidth;
    h = w / imgScale;
    x = 0;
    y = (boxHeight - h) / 2;
  } else {
    // 图片高度更大
    h = boxHeight;
    w = imgScale * h;
    y = 0;
    x = (boxWidth - w) / 2;
  }
  return [x, y, w, h];
}

/** 取范围随机数 整数 **/
export function random(min, max, isRound = true) {
  const r = Math.random() * (max - min + 1) + min;
  if (isRound) {
    return Math.floor(r);
  }
  return r;
}

// 工具- 判断时间是否和当前日期相等
export function checkTimeEquals(prevTime, nextTime) {
  const prevDate = new Date(prevTime);
  const nextDate = new Date(nextTime);

  const prevStr = `${prevDate.getFullYear()}/${prevDate.getMonth() + 1}/${prevDate.getDate()}`;
  const nextStr = `${nextDate.getFullYear()}/${nextDate.getMonth() + 1}/${nextDate.getDate()}`;

  return nextStr === prevStr;
}

// 获取当前时间，格式化的样子 （主要用于判断今日任务）
export function getTodayStr() {
  const today = new Date();
  return `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
}

// 格式化日期
export function formatTime(num) {
  const time = new Date(num);
  if (!time) {
    return "-";
  }
  return `${time.getFullYear()}/${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:${time.getMinutes()}`;
}

// 获取一行能放下多少个字
let lineLength = 0;
export function getLineLength(ctx) {
  if (lineLength) return lineLength;
  let num = 0;
  let txtArr = "我";
  ctx.save();
  ctx.font = "18px Patrick Hand, -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif";
  for (let i = 0; true; i++) {
    if (ctx.measureText(txtArr).width > window.innerWidth - 25) {
      num = i;
      break;
    } else {
      txtArr = `${txtArr}我`;
    }
  }
  ctx.restore();
  lineLength = num;
  return num;
}

/**绘制圆角矩形
 * @param x,y 起始坐标
 * @param w,h 宽高
 * @param r 圆角的半径
 * */
export function drawRectRadius(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function rpx(num) {
  const winW = window.innerWidth;
  return (winW / 750) * num;
}

export function rpy(num) {
  const winH = window.innerHeight;
  return (winH / 1351) * num;
}

export default {
  makeImgSize,
  makeImgSize2,
  random,
  checkTimeEquals,
  getTodayStr,
  formatTime,
  getLineLength,
  rpx,
  rpy,
  drawRectRadius,
};
