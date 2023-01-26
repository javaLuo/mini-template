let windowInfo = {};

// 获取系统信息
export async function getWindowInfo(){
  if(windowInfo.screenWidth){
    return windowInfo;
  }

  try{
    const info = await new Promise((res, rej)=>{
      wx.getSystemInfo({
        success: (result) => {
          res(result)
        },
        fail: (err) => {
          rej(err)
        },
      })
    });
    windowInfo = info;
    return info;
  }catch(err){
    console.info('获取系统信息失败', err);
    return {};
  }
}

export default {
  getWindowInfo
}