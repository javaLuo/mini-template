let instance; // 单例化

/**
 * 统一的音效管理器
 */
export default class Music {
  constructor() {
    if (instance) return instance;

    instance = this;

    this.playing = true;
    this.bgmAudio = new Audio();
    this.bgmAudio.loop = true;
    this.bgmAudio.src = "audio/music.mp3";

    this.btnAudio = new Audio();
    this.btnAudio.src = "audio/btn.mp3";

    this.successAudio = new Audio();
    this.successAudio.src = "audio/success.mp3";

    this.isCanPlay = wx.getStorageSync("music-play") !== false;
    // console.log("是否可以播放音乐：", this.isCanPlay);

    if (this.isCanPlay) {
      this.playBgm();
    }
  }

  playBgm() {
    if (!this.isCanPlay) return;
    this.bgmAudio.play();
    this.playing = true;
  }

  pauseBgm() {
    this.bgmAudio.pause();
    this.playing = false;
  }

  stopBgm() {
    this.bgmAudio.currentTime = 0;
    this.bgmAudio.pause();
  }

  triggerBgm() {
    if (this.isCanPlay) {
      this.isCanPlay = false;
      this.pauseBgm();
      wx.setStorage({ key: "music-play", data: false });
    } else {
      this.isCanPlay = true;
      this.playBgm();
      wx.setStorage({ key: "music-play", data: true });
    }
  }

  playBtn() {
    if (!this.isCanPlay) return;
    this.btnAudio.pause();
    this.btnAudio.currentTime = 0;
    this.btnAudio.play();
  }

  playSuccess() {
    this.successAudio.currentTime = 0;
    this.successAudio.play();
  }

  isPlaying() {
    return this.playing;
  }

  getCanPlay() {
    return this.isCanPlay;
  }
}
