let startTime = null; // 游戏启动时的时间，是接口获取一次
let promiseTemp;

export function getServerTime() {
  if (startTime) return startTime;
  if (promiseTemp) return promiseTemp;

  promiseTemp = new Promise((res, rej) => {
    wx.request({
      url: "https://sgp01.tp.hd.mi.com/gettimestamp",
      success(response) {
        console.log("返回了时间：", response.data);
        startTime = Number(response.data.split("=")[1]) * 1000 || null;
        res(startTime);
      },
      fail() {
        res(null);
      },
      complete() {
        promiseTemp = null;
      },
    });
  });

  return promiseTemp;
}

export default { getServerTime };
