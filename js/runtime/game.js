import Sprite from "../base/sprite";
import { makeImgSize, rpx, rpy, random, checkTimeEquals, drawRectRadius } from "../base/util";
import MessageServer from "./message";
import { onShow } from "../components/gameModal";

const BACK_SRC = "images/game/back-game.jpg";
const BACK_SUCCESS = "images/game/back-success.png";

const BTN_ARR_CENTER = "images/game/btn-arr-center.png";
const BTN_ARR_LEFT = "images/game/btn-arr-left.png";
const BTN_ARR_RIGHT = "images/game/btn-arr-right.png";
const BTN_BACK = "images/game/btn-back.png";
const BTN_BALL = "images/game/btn-ball.png";
const BTN_LEFT = "images/game/btn-left.png";
const BTN_SET = "images/game/btn-set.png";
const BTN_WH = "images/game/btn-wh.png";
const BTN_CHANGE = "images/game/btn-change.png";
const BTN_AGAIN = "images/game/btn-again.png";

const DOOR = "images/game/door.png";
const LOGO = "images/start/logo.png";
const TXT_NUM = "images/game/txt-num.png";
const FOOTBALL = "images/game/football.png";
const TXT_SAVED = "images/game/img-saved.png";

// 守门员
const MAN0 = "images/game/doorMan/default.png";
const MAN_LEFT = "images/game/doorMan/left.png";
const MAN_RIGHT = "images/game/doorMan/right.png";

const ICON_MH = "images/game/icon-mh.png";
const BTN_CHOSE = "images/game/btn-chose.png";
const BTN_SUBMIT = "images/game/btn-submit.png";
// 旗帜
const FLAG_EGDE = "images/game/flags/flag-egde.png";
const FLAG_HL = "images/game/flags/flag-hl.png";
const FLAG_KTE = "images/game/flags/flag-kte.png";
const FLAG_SNJE = "images/game/flags/flag-slje.png";

let back;
let backS;
let arrCenter;
let arrLeft;
let arrRight;
let btnBack;
let btnBall;
let btnLeft;
let btnSet;
let btnWh;
let btnAgain;
let door;
let logo;
let txtNum;
let txtSaved;
let doorMan;
let man;
let football;

let iconMh;
let btnChose1;
let btnChose2;
let btnChange;
let btnSubmit;
let flagEgde;
let flagHl;
let flagKte;
let flagSnje;

let alpha = 0;

const winW = window.innerWidth;
const winH = window.innerHeight;
const res = wx.getMenuButtonBoundingClientRect();
const sys = wx.getSystemInfoSync();
const topH = Math.max(res.bottom + 10, rpx(136) + sys.statusBarHeight);

// game logic
let ballNum = 10;
let userScores = { left: 0, right: 0 }; // 用户得分
let userScoresPrev = { left: 0, right: 0 }; // 用户上一次得分状态，用于撤回
let doorManAction = "center";
let loading;
let isPrevSuccess = -1; // 玩家上一次是否得分 -1还没踢球， 1得了，0没得
let nextDoorMan = -1; // 0左1中2右
let isShowChoseFlag = false; // 是否显示队伍选择
let choseGroup = 0; // 当前可选的球队
let choseSide = "left";
let isSuccessShow = false; // 一轮游戏是否结束
// TODO 今天可选的对战队伍
const nowGroups = [
  { left: { key: "hl", label: "荷兰" }, right: { key: "egde", label: "厄瓜多尔" } },
  { left: { key: "snje", label: "塞内加尔" }, right: { key: "kte", label: "卡塔尔" } },
];

// TODO 所有足球队球员图
const groups = [
  // 厄瓜多尔
  { name: "egde", label: "厄瓜多尔", pics: ["images/game/group/a/egde1.png", "images/game/group/a/egde2.png"] },
  // 荷兰
  { name: "hl", label: "荷兰", pics: ["images/game/group/a/hl1.png", "images/game/group/a/hl2.png"] },
  // 塞内加尔
  { name: "snje", label: "塞内加尔", pics: ["images/game/group/a/snje1.png", "images/game/group/a/snje2.png"] },
  // 卡塔尔
  { name: "kte", label: "卡塔尔", pics: ["images/game/group/a/kte1.png", "images/game/group/a/kte2.png"] },
];

let userHave = [1, 1, 1]; // 用户当前拥有的道具
let userShareTime = [0, 0, 0]; // 用户上次分享的时间

const backInfo = makeImgSize(750, 1351, winW, winH);
export async function init() {
  wx.getStorage({
    key: "share-time",
    success(res) {
      userShareTime = res?.data || [0, 0, 0];
    },
  });

  wx.getStorage({
    key: "user-have",
    success(res) {
      userHave = res.data;
    },
  });

  reset();

  back = new Sprite(BACK_SRC, backInfo[2], backInfo[3], backInfo[0], backInfo[1]);
  backS = new Sprite(BACK_SUCCESS, rpx(655), rpx(235), winW / 2 - rpx(655) / 2, rpx(275));

  arrLeft = new Sprite(BTN_ARR_LEFT, rpx(86), rpx(99), winW / 2 - rpx(86 + 213), winH - rpx(300));
  arrCenter = new Sprite(BTN_ARR_CENTER, rpx(87), rpx(111), (winW - rpx(87)) / 2, winH - rpx(300));
  arrRight = new Sprite(BTN_ARR_RIGHT, rpx(89), rpx(94), winW / 2 + rpx(-45 + 250), winH - rpx(300));

  btnBack = new Sprite(BTN_BACK, rpx(100), rpx(100), rpx(45), (topH - rpx(100) - sys.statusBarHeight) / 2 + sys.statusBarHeight);
  logo = new Sprite(LOGO, rpx(220), rpx(110), (winW - rpx(220)) / 2, (topH - rpx(110) - sys.statusBarHeight) / 2 + sys.statusBarHeight);
  btnSet = new Sprite(BTN_SET, rpx(100), rpx(100), winW - rpx(45 + 100), (topH - rpx(100) - sys.statusBarHeight) / 2 + sys.statusBarHeight);
  btnLeft = new Sprite(BTN_LEFT, rpx(168), rpx(124), winW / 2 - rpx(84 + 250), winH - rpx(150));
  btnWh = new Sprite(BTN_WH, rpx(168), rpx(124), (winW - rpx(168)) / 2, winH - rpx(150));
  btnBall = new Sprite(BTN_BALL, rpx(168), rpx(124), winW / 2 + rpx(84 + 86), winH - rpx(150));
  txtNum = new Sprite(TXT_NUM, rpx(146), rpx(91), winW - rpx(280), winH - rpx(405));
  txtSaved = new Sprite(TXT_SAVED, rpx(652), rpx(100), winW / 2 - rpx(652) / 2, rpx(565));

  iconMh = new Sprite(ICON_MH, rpx(28), rpx(57), winW / 2 - rpx(28) / 2, rpx(375));
  btnChose1 = new Sprite(BTN_CHOSE, rpx(121), rpx(72), winW / 2 - rpx(121) / 2, rpx(500));
  btnChose2 = new Sprite(BTN_CHOSE, rpx(121), rpx(72), winW / 2 - rpx(121) / 2, rpx(850));
  btnChange = new Sprite(BTN_CHANGE, rpx(179), rpx(59), winW - rpx(179 + 40), winH - rpx(650));
  btnSubmit = new Sprite(BTN_SUBMIT, rpx(179), rpx(59), winW - rpx(179 + 40), winH - rpx(500));
  btnAgain = new Sprite(BTN_AGAIN, rpx(225), rpx(77), winW / 2 - rpx(225) / 2, rpx(700));

  flagEgde = new Sprite(FLAG_EGDE, rpx(228), rpx(212), 0, 0);
  flagHl = new Sprite(FLAG_HL, rpx(228), rpx(212), 0, 0);
  flagKte = new Sprite(FLAG_KTE, rpx(228), rpx(212), 0, 0);
  flagSnje = new Sprite(FLAG_SNJE, rpx(228), rpx(212), 0, 0);

  door = new Sprite(DOOR, backInfo[2], backInfo[3], backInfo[0], backInfo[1]);
  doorMan = new Sprite(MAN0, backInfo[2], backInfo[3], backInfo[0], backInfo[1], null, {
    stand: {
      isAniType: "act", // 是位移帧动画
      yoyo: true,
      repeat: Infinity,
      time: 1000,
      arr: [{ x: backInfo[0] - 5 }, { x: backInfo[0] + 5 }],
    },
    shotLeft: {
      isAniType: "picact", // 图片帧
      time: 0,
      time2: 800,
      repeat: 0,
      arr: [
        { x: backInfo[0], y: backInfo[1] },
        { x: backInfo[0] - 18, y: backInfo[1] - 26 },
      ],
      pics: [MAN0, MAN_LEFT],
    },
    shotCenter: {
      isAniType: "act", // 位移
      time: 800,
      repeat: 0,
      arr: [{ y: backInfo[1] }, { y: backInfo[1] - 26 }],
    },
    shotRight: {
      isAniType: "picact", // 图片帧 + 位移
      time: 0,
      time2: 800,
      repeat: 0,
      arr: [
        { x: backInfo[0], y: backInfo[1] },
        { x: backInfo[0] + 18, y: backInfo[1] - 26 },
      ],
      pics: [MAN0, MAN_RIGHT],
    },
  });

  // 获得选中的球队
  const group = nowGroups[choseGroup];
  const manNowImg = groups.find(item => {
    const side = choseSide === "left" ? group.left.key : group.right.key;
    return item.name === side;
  });
  man = new Sprite(manNowImg.pics[0], backInfo[2], backInfo[3], backInfo[0], backInfo[1], null, {
    stand: {
      isAniType: "act",
      time: 600,
      yoyo: true,
      repeat: Infinity,
      arr: [{ scaleY: 1 }, { scaleY: 0.99 }],
      scaleType: "bottom",
    },
    shot: {
      isAniType: "pic", // 是图片帧动画
      pics: manNowImg.pics,
      time: 0,
      repeat: 0,
    },
  });
  football = new Sprite(FOOTBALL, backInfo[2], backInfo[3], backInfo[0] - rpx(50), backInfo[1] + rpy(300), null, {
    shotLeft: {
      isAniType: "act", // 是位移帧动画
      time: 600,
      repeat: 0,
      arr: [
        { x: backInfo[0] - rpx(50), y: backInfo[1] + rpy(300), scaleX: 1, scaleY: 1, rotate: 0 },
        { x: backInfo[0] - rpx(180), y: backInfo[1] - rpy(360), scaleX: 0.5, scaleY: 0.5, rotate: 260 },
      ],
    },
    shotCenter: {
      isAniType: "act", // 是位移帧动画
      time: 600,
      repeat: 0,
      arr: [
        { x: backInfo[0] - rpx(50), y: backInfo[1] + rpy(300), scaleX: 1, scaleY: 1, rotate: 0 },
        { x: backInfo[0] - rpx(0), y: backInfo[1] - rpy(300), scaleX: 0.5, scaleY: 0.5, rotate: 260 },
      ],
    },
    shotRight: {
      isAniType: "act", // 是位移帧动画
      time: 600,
      repeat: 0,
      arr: [
        { x: backInfo[0] - rpx(50), y: backInfo[1] + rpy(300), scaleX: 1, scaleY: 1, rotate: 0 },
        { x: backInfo[0] + rpx(180), y: backInfo[1] - rpy(360), scaleX: 0.5, scaleY: 0.5, rotate: 260 },
      ],
    },
  });

  doorMan.startAction("stand");
  man.startAction("stand");
}

export function destroy() {
  back = null;
  arrCenter = null;
  arrLeft = null;
  arrRight = null;
  btnBack = null;
  btnBall = null;
  btnLeft = null;
  btnSet = null;
  btnWh = null;
  door = null;
  logo = null;
  txtNum = null;
  doorMan = null;
  man = null;
  football = null;
}

/**==============================================================================================================================
 * render
================================================================================================================================*/
export function render(ctx) {
  ctx.save();
  ctx.globalAlpha = Math.min(alpha, 1);

  // 画背景
  back.drawToCanvas(ctx);

  ctx.fillStyle = "#67b257";
  ctx.rect(0, 0, winW, topH);
  ctx.fill();

  door.drawToCanvas(ctx);
  if (!isShowChoseFlag) {
    doorMan.drawToCanvas(ctx);
    football.drawToCanvas(ctx);
    man.drawToCanvas(ctx);
  }

  // control
  btnBack.drawToCanvas(ctx);
  logo.drawToCanvas(ctx);
  btnSet.drawToCanvas(ctx);
  arrCenter.drawToCanvas(ctx);
  arrLeft.drawToCanvas(ctx);
  arrRight.drawToCanvas(ctx);
  btnLeft.drawToCanvas(ctx);
  btnWh.drawToCanvas(ctx);
  btnBall.drawToCanvas(ctx);

  // 选择球队
  if (isShowChoseFlag) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, winW, winH);
    ctx.restore();
    // 画第一队
    iconMh.position = { ...iconMh.position, y: rpx(350) };
    iconMh.drawToCanvas(ctx);
    flagHl.position = { x: winW / 2 - rpx(228 + 100), y: rpx(350 - 50) };
    flagHl.drawToCanvas(ctx);
    flagEgde.position = { x: winW / 2 + rpx(100), y: rpx(350 - 50) };
    flagEgde.drawToCanvas(ctx);
    btnChose1.drawToCanvas(ctx);

    iconMh.position = { ...iconMh.position, y: rpx(700) };
    iconMh.drawToCanvas(ctx);
    flagSnje.position = { x: winW / 2 - rpx(228 + 100), y: rpx(700 - 50) };
    flagSnje.drawToCanvas(ctx);
    flagKte.position = { x: winW / 2 + rpx(100), y: rpx(700 - 50) };
    flagKte.drawToCanvas(ctx);
    btnChose2.drawToCanvas(ctx);
  } else {
    ctx.fillStyle = "#f8f41d";
    ctx.strokeStyle = "#4e4820";
    ctx.font = `bold ${rpx(40)}px Patrick Hand, -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif`;

    // 球队：XX
    const groupLabel = `球队:${nowGroups[choseGroup][choseSide].label}`;
    const groupLabelInfo = ctx.measureText(groupLabel);
    const groupLabelX = winW - groupLabelInfo.width - rpx(40);
    ctx.fillText(groupLabel, groupLabelX, winH - rpx(670));
    ctx.strokeText(groupLabel, groupLabelX, winH - rpx(670));
    btnChange.drawToCanvas(ctx);

    // 我的竞猜
    const myTxt = "我的竞猜";
    const myTxtInfo = ctx.measureText(myTxt);
    const myTxtX = winW - myTxtInfo.width - rpx(40);
    ctx.fillText(myTxt, myTxtX, winH - rpx(520));
    ctx.strokeText(myTxt, myTxtX, winH - rpx(520));
    btnSubmit.drawToCanvas(ctx);

    txtNum.drawToCanvas(ctx);

    ctx.font = `bold ${rpx(100)}px Patrick Hand, -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif`;
    const ballNumInfo = ctx.measureText(ballNum);
    ctx.fillText(ballNum, winW - rpx(40) - ballNumInfo.width, winH - rpx(330));
    ctx.strokeText(ballNum, winW - rpx(40) - ballNumInfo.width, winH - rpx(330));

    // 顶部比分
    ctx.fillStyle = "#3d1d07";
    drawRectRadius(ctx, winW / 2 - rpx(180), topH + rpx(8), rpx(360), rpx(48), rpx(12));
    ctx.fill();
    ctx.fillStyle = "#f8f41d";
    drawRectRadius(ctx, winW / 2 - rpx(180 - 2), topH + rpx(12), rpx(190), rpx(40), rpx(12));
    ctx.fill();
    ctx.fillStyle = "#3d1d07";
    ctx.fillRect(winW / 2, topH + rpx(8), rpx(50), rpx(48));

    ctx.font = `bold ${rpx(26)}px Patrick Hand, -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif`;
    ctx.fillStyle = "#3d1d07";
    const leftSource = `${nowGroups[choseGroup]["left"].label}  ${userScores.left}`;
    const leftSourceInfo = ctx.measureText(leftSource);
    ctx.fillText(leftSource, winW / 2 - rpx(180) / 2 - leftSourceInfo.width / 2, topH + rpx(40));

    ctx.fillStyle = "#f8f41d";
    const rightSource = `${nowGroups[choseGroup]["right"].label}  ${userScores.right}`;
    const rightSourceInfo = ctx.measureText(rightSource);
    ctx.fillText(rightSource, winW / 2 + rpx(180) / 2 - rightSourceInfo.width / 2, topH + rpx(40));
  }

  // 结算
  if (isSuccessShow) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, winW, winH);
    ctx.restore();

    backS.drawToCanvas(ctx);
    txtSaved.drawToCanvas(ctx);
    btnAgain.drawToCanvas(ctx);

    ctx.fillStyle = "#3d1d07";
    ctx.font = `bold ${rpx(52)}px Patrick Hand, -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif`;

    const txt1 = "最终竞猜比分";
    const txt1Info = ctx.measureText(txt1);

    const txt2 = `${nowGroups[choseGroup]["left"].label}  ${userScores.left} : ${userScores.right}  ${nowGroups[choseGroup]["right"].label}`;
    const txt2Info = ctx.measureText(txt2);

    ctx.fillText(txt1, winW / 2 - txt1Info.width / 2, rpx(365));
    ctx.fillText(txt2, winW / 2 - txt2Info.width / 2, rpx(445));
  }

  ctx.restore();
  alpha += 0.1;
}

/**==============================================================================================================================
 * checkClick
================================================================================================================================*/
export function checkClick(mouseX, mouseY) {
  if (loading) return;

  // 选球队
  if (isShowChoseFlag) {
    if (btnChose1.isClick(mouseX, mouseY)) {
      choseGroup = 0;
      initGroup();
      isShowChoseFlag = false;
    } else if (btnChose2.isClick(mouseX, mouseY)) {
      choseGroup = 1;
      initGroup();
      isShowChoseFlag = false;
    }
    return;
  }

  // 游戏结算
  if (isSuccessShow) {
    if (btnAgain.isClick(mouseX, mouseY)) {
      reset();
    }

    return;
  }

  if (btnBack.isClick(mouseX, mouseY)) {
    return "back";
  } else if (arrLeft.isClick(mouseX, mouseY)) {
    const res = shot("left");
    if (res) return "shot-success";
    else return "shot-fail";
  } else if (arrCenter.isClick(mouseX, mouseY)) {
    const res = shot("center");
    if (res) return "shot-success";
    else return "shot-fail";
  } else if (arrRight.isClick(mouseX, mouseY)) {
    const res = shot("right");
    if (res) return "shot-success";
    else return "shot-fail";
  } else if (btnWh.isClick(mouseX, mouseY)) {
    makeUserHave(1);
  } else if (btnLeft.isClick(mouseX, mouseY)) {
    makeUserHave(0);
  } else if (btnBall.isClick(mouseX, mouseY)) {
    makeUserHave(2);
  } else if (btnChange.isClick(mouseX, mouseY)) {
    changeGroup();
  } else if (btnSubmit.isClick(mouseX, mouseY)) {
    // TODO 接口保存用户结果
    isSuccessShow = true;
  }
}

function makeUserHave(type) {
  const isHave = userHave[type];
  if (isHave) {
    switch (type) {
      case 0:
        if (isPrevSuccess !== -1) {
          ballNum++;
          userScores = { ...userScoresPrev };
          userHave[type] = Math.max(userHave[type] - 1, 0);
          isPrevSuccess = -1;
          MessageServer.push("已撤回");
        } else {
          MessageServer.push("无法再撤回");
        }
        break;
      case 1:
        type1logic(type);
        break;
      case 2:
        ballNum++;
        userHave[type] = Math.max(userHave[type] - 1, 0);
        MessageServer.push("点球+1");
    }
    wx.setStorage({
      key: "user-have",
      data: [...userHave],
    });
  } else {
    if (type === 1 && nextDoorMan !== -1) {
      // 已预言了，不要重复预言
      type1logic(type);
      return;
    }
    onShow(type);
  }
}

// 章鱼哥预言逻辑
function type1logic(type) {
  // 随机左中右
  if (nextDoorMan === -1) {
    userHave[type] = Math.max(userHave[type] - 1, 0);
    nextDoorMan = random(1, 3);
  }

  let txt;
  switch (nextDoorMan) {
    case 1:
      txt = "你的左侧";
      break;
    case 2:
      txt = "中间";
      break;
    case 3:
      txt = "你的右侧";
      break;
  }
  txt = `章鱼哥：守门员大概率会扑向${txt}`;
  MessageServer.push(txt);
}

// 射门
function shot(type) {
  if (ballNum <= 0) {
    return;
  }
  loading = true;

  // 守门员动作
  if (nextDoorMan !== -1) {
    // 已预言
    switch (nextDoorMan) {
      case 1:
        doorManAction = "left";
        doorMan.startAction("shotLeft");
        break;
      case 2:
        doorManAction = "center";
        doorMan.startAction("shotCenter");
        break;
      case 3:
        doorManAction = "right";
        doorMan.startAction("shotRight");
        break;
    }
    nextDoorMan = -1;
  } else {
    // 随机
    const random = Math.random();
    if (random <= 0.333) {
      doorManAction = "left";
      doorMan.startAction("shotLeft");
    } else if (random <= 0.666) {
      doorManAction = "center";
      doorMan.startAction("shotCenter");
    } else {
      doorManAction = "right";
      doorMan.startAction("shotRight");
    }
  }

  man.startAction("shot");

  if (type === "left") {
    football.startAction("shotLeft");
  } else if (type === "center") {
    football.startAction("shotCenter");
  } else if (type === "right") {
    football.startAction("shotRight");
  }

  // 计算结果
  setTimeout(() => {
    if (type !== doorManAction) {
      // 玩家得分
      isPrevSuccess = 1;
      userScoresPrev = { ...userScores };
      userScores[choseSide]++;
      ballNum--;
      MessageServer.push(`球进啦！[比分：${userScores.left}:${userScores.right}]`);
    } else {
      ballNum--;
      isPrevSuccess = 0;
    }
    loading = false;

    // 重置
    doorMan.reset();

    football.reset();
    man.reset();

    doorMan.startAction("stand");
    man.startAction("stand");
  }, 1500);

  return type !== doorManAction;
}

function initGroup() {
  const group = nowGroups[choseGroup];
  const manNowImg = groups.find(item => {
    const side = choseSide === "left" ? group.left.key : group.right.key;
    return item.name === side;
  });
  man.img.src = manNowImg.pics[0];
  man.resetImg = manNowImg.pics[0];
  man.actions.shot.pics = manNowImg.pics;
}

function changeGroup() {
  choseSide = choseSide === "left" ? "right" : "left";
  initGroup();
}

export async function onShare(type) {
  wx.shareAppMessage({
    imageUrlId: "K61r2CPVRuCIp+xzFvu9Iw==",
    imageUrl: "https://mmocgame.qpic.cn/wechatgame/icglZ3icGeSMognW9WIR9xEOxgLib022TbcTVibiahMibeaiaI6aK7q1rVsicpF3Fia9plOAO/0",
  });

  const msg = await new Promise((res, rej) => {
    wx.getStorage({
      key: "share-time",
      success(obj) {
        res(obj);
      },
      fail(err) {
        res(null);
      },
    });
  });

  console.log("缓存得到：", res);

  let prev = [0, 0, 0];
  if (msg?.data) {
    prev = msg.data;
  }

  const t = Number(type.split("-")[1]);
  let prevTime = prev[t];

  const isEqual = checkTimeEquals(prevTime, Date.now());
  if (isEqual) {
    // 今天已经领取 ，不可再获得该道具
    MessageServer.push("今日领取已达上限");
  } else {
    userHave[t]++;
    userShareTime[t] = Date.now();
    const txt = ["时间回溯", "章鱼哥预言", "点球道具"];
    MessageServer.push(`[${txt[t]}]+1`);

    wx.setStorage({
      key: "share-time",
      data: [...userShareTime],
    });

    setTimeout(() => {
      wx.setStorage({
        key: "user-have",
        data: [...userHave],
      });
    }, 100);
  }
}

// 重置所有状态
function reset() {
  ballNum = Math.max(10, ballNum);
  userScores = { left: 0, right: 0 };
  userScoresPrev = { left: 0, right: 0 };
  loading = false;
  alpha = 0;
  isPrevSuccess = -1;
  nextDoorMan = -1;
  isShowChoseFlag = true; // 是否显示队伍选择
  choseGroup = 0; // 当前可选的球队
  choseSide = "left";
  isSuccessShow = false; // 一轮游戏是否结束
}

export default {
  init,
  destroy,
  render,
  checkClick,
  onShare,
};
