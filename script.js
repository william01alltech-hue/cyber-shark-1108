// 音效合成器 (使用 Web Audio API，無需外載音訊檔)
class SoundFX {
  constructor() {
    this.ctx = null;
    this.buffers = {};
    this.isPreloading = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 手機版音訊解碼預載 (Web Audio API Buffer 模式，不受手機 setTimeout 限制)
  preloadVoices() {
    if (this.isPreloading) return;
    this.isPreloading = true;
    this.init();
    if (!this.ctx) return;

    const files = {
      hello: 'assets/shark_hello.wav',
      want_apple: 'assets/shark_want_apple.wav',
      pick_fish: 'assets/shark_pick_fish.wav',
      give_me: 'assets/shark_give_me.wav'
    };

    Object.entries(files).forEach(([id, url]) => {
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error('Fetch failed');
          return res.arrayBuffer();
        })
        .then((arrBuf) => {
          this.ctx.decodeAudioData(
            arrBuf,
            (decoded) => {
              this.buffers[id] = decoded;
            },
            () => {}
          );
        })
        .catch(() => {});
    });
  }

  // 播放 Web Audio 解碼後的緩衝音訊 (手機 iOS / Android 100% 穩定相容)
  playBuffer(id, onFinished) {
    this.init();
    if (!this.ctx || !this.buffers[id]) return false;

    try {
      const source = this.ctx.createBufferSource();
      source.buffer = this.buffers[id];
      source.connect(this.ctx.destination);
      if (typeof onFinished === 'function') {
        source.onended = onFinished;
      }
      source.start(0);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Logo 進場鈴聲 (清新晶瑩的和弦音)
  playLogoJingle() {
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.12);

      gain.gain.setValueAtTime(0, this.ctx.currentTime + index * 0.12);
      gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + index * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + index * 0.12 + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + index * 0.12);
      osc.stop(this.ctx.currentTime + index * 0.12 + 1.3);
    });
  }

  // 開心領養歡慶鈴聲 (輕快上揚的琶音)
  playHappyJingle() {
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.5]; // C5, E5, G5, B5, C6, E6
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.09);

      gain.gain.setValueAtTime(0, this.ctx.currentTime + index * 0.09);
      gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + index * 0.09 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + index * 0.09 + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + index * 0.09);
      osc.stop(this.ctx.currentTime + index * 0.09 + 0.75);
    });
  }

  // 摘花音效 (清脆向上輕彈的拔起音效)
  playFlowerPickSound() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  }

  // 戴上花朵音效 (夢幻靈動的琶音閃爍和弦)
  playFlowerWearSound() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const freqs = [1046.5, 1318.5, 1567.98, 2093.0];
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.06);
        gain.gain.setValueAtTime(0.2, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.26);
      });
    } catch (e) {}
  }

  // 吃小魚音效 (清脆的咀嚼/吞下音效)
  playEatSound() {
    this.init();
    if (!this.ctx) return;

    [0, 0.08].forEach((delay, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const startF = i === 0 ? 350 : 520;
      const endF = i === 0 ? 600 : 850;
      osc.frequency.setValueAtTime(startF, this.ctx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(endF, this.ctx.currentTime + delay + 0.06);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + 0.08);
    });
  }

  // 窗台小鴨叫聲 (可愛呱呱音)
  playDuckSound() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1180, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // 默認的合成打招呼聲音 (若尚未自定義錄音時使用)
  playDefaultGreetingSound() {
    this.init();
    if (!this.ctx) return;

    // 「你-好」兩個音節音
    const notes = [659.25, 880.00]; // E5 -> A5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const t = this.ctx.currentTime + idx * 0.16;
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.23);
    });
  }

  // 結局 11 通關鈴聲 (悠閒喜悅的和弦)
  playEndingJingle() {
    this.init();
    if (!this.ctx) return;

    const chord = [392.00, 493.88, 587.33, 783.99, 987.77]; // G4, B4, D5, G5, B5
    chord.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.1);

      gain.gain.setValueAtTime(0, this.ctx.currentTime + index * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + index * 0.1 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + index * 0.1 + 1.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + index * 0.1);
      osc.stop(this.ctx.currentTime + index * 0.1 + 1.7);
    });
  }

  // 按鈕點擊音效
  playClickSound() {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  // 拒絕/逃跑音效 (俏皮滑音)
  playSlideSound(pitchMultiplier = 1) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = 260 * pitchMultiplier;
    const endFreq = 480 * pitchMultiplier;
    osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.13);
  }
}

// 語系字典
const I18N = {
  zh: {
    title: '妹妹 1108',
    btnStart: '進入房間',
    btnLoad: '讀取存檔',
    btnSettings: '系統設定',
    btnLang: '切換語言 (Language)',
    btnReplay: '重播開場 Logo',
    btnBackMenu: '‹ 選單',
    foodLabel: '小魚',
    greetingText: '你好！',
    devAlert: '功能開發中...',
    adoptLine1: '要領養一只',
    adoptLine2: '電子小鯊魚嗎？',
    adoptYes: '好的',
    adoptNo: '不要',
    happyCheer: '太棒了！小鯊魚超開心！✨',
    rejectPrompt1: '咦？不要嗎？',
    rejectPrompt2: '真的不要嗎...？',
    rejectPrompt3: '小鯊魚在看著你呢！',
    rejectPrompt4: '再按一次試試看？',
    btnRestart: '重新開始'
  },
  ja: {
    title: '妹 1108',
    btnStart: 'お部屋に入る',
    btnLoad: 'ロード',
    btnSettings: '系統設定',
    btnLang: '言語切替 (Language)',
    btnReplay: 'オープニング再生',
    btnBackMenu: '‹ メニュー',
    foodLabel: 'お魚',
    greetingText: 'こんにちは！',
    devAlert: '開発中の機能です...',
    adoptLine1: '電子サメちゃんを',
    adoptLine2: 'お迎えしますか？',
    adoptYes: 'はい',
    adoptNo: 'いいえ',
    happyCheer: 'やったー！サメちゃん大喜び！✨',
    rejectPrompt1: 'あれ？いらないの？',
    rejectPrompt2: '本当にお迎えしないの…？',
    rejectPrompt3: 'サメちゃんが見てるよ！',
    rejectPrompt4: 'もう一回押してみる…？',
    btnRestart: '最初からやり直す'
  },
  en: {
    title: 'Sister 1108',
    btnStart: 'Enter Room',
    btnLoad: 'Load Game',
    btnSettings: 'Settings',
    btnLang: 'Change Language',
    btnReplay: 'Replay Intro Logo',
    btnBackMenu: '‹ Menu',
    foodLabel: 'Fish',
    greetingText: 'Hello!',
    devAlert: 'Feature under development...',
    adoptLine1: 'Would you like to',
    adoptLine2: 'adopt a cyber shark?',
    adoptYes: 'Yes',
    adoptNo: 'No',
    happyCheer: 'Yay! The cyber shark is so happy!✨',
    rejectPrompt1: 'Huh? You don\'t want it?',
    rejectPrompt2: 'Are you really sure...?',
    rejectPrompt3: 'The shark is watching you!',
    rejectPrompt4: 'Try clicking one more time?',
    btnRestart: 'Restart'
  }
};

// 畫面切換控制器
class SceneManager {
  constructor() {
    this.screens = {
      splash: document.getElementById('splash-screen'),
      lang: document.getElementById('lang-select-screen'),
      easter: document.getElementById('easter-egg-screen'),
      easter2: document.getElementById('easter-egg-2-screen'),
      adopt: document.getElementById('adopt-screen'),
      ending: document.getElementById('ending-screen'),
      menu: document.getElementById('main-menu'),
      game: document.getElementById('game-scene'),
      outdoor: document.getElementById('outdoor-scene')
    };

    this.sfx = new SoundFX();
    this.splashTimeout = null;
    this.currentScreen = 'splash';
    this.currentLang = 'zh';

    // 吃蘋果次數與彩蛋輪流狀態
    this.applesEatenCount = 0;
    this.isFromRoomFeeding = false;

    // 飢餓計時器與結局 3 / 結局 1 形態狀態
    this.starveTimer = null;
    this.starveStep = 0;
    this.isFeedingLocked = false;
    this.currentSharkStage = null; // null | 1 | 2 | 3 | 4

    // 清理舊版遺留的錯誤快取，確保「你好！」使用作者正確錄音
    try {
      localStorage.removeItem('shark_voice_hello');
    } catch (e) {}

    // 拒絕點擊計數器
    this.rejectCount = 0;

    // 鯊魚佩戴小花狀態 (戶外摘花放鯊魚頭上)
    this.isSharkWearingFlower = false;
    this.hasGreetedInRoom = false;

    // 滑動座標陣列 (第 1、2、3、4 次點擊滑動位置)
    this.slideOffsets = [
      { x: 75,  y: -30 },
      { x: -85, y: 40 },
      { x: 95,  y: 50 },
      { x: -110, y: -45 }
    ];

    // 錄音機相關
    this.currentVoiceId = 'pick_fish'; // 預設聚焦在第三句「對對就是那個」
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.recordedAudioBlob = null;
    this.recordedAudioUrl = null;
    this.dialogueIndex = 0; // 對話輪播計數器

    // 手機預熱音訊池 (避免手機瀏覽器阻擋非同步 Audio 物件)
    this.audioPool = {
      hello: new Audio('assets/shark_hello.wav'),
      want_apple: new Audio('assets/shark_want_apple.wav'),
      pick_fish: new Audio('assets/shark_pick_fish.wav'),
      give_me: new Audio('assets/shark_give_me.wav')
    };

    this.initEvents();
    this.initVoiceRecorder();
    this.startSplashScreen();
  }

  setLanguage(lang) {
    if (!I18N[lang]) return;
    this.currentLang = lang;
    const dict = I18N[lang];

    // 主選單
    document.getElementById('txt-title').textContent = dict.title;
    document.getElementById('txt-btn-start').textContent = dict.btnStart;
    document.getElementById('txt-btn-load').textContent = dict.btnLoad;
    document.getElementById('txt-btn-settings').textContent = dict.btnSettings;
    document.getElementById('txt-btn-lang').textContent = dict.btnLang;
    document.getElementById('txt-btn-replay').textContent = dict.btnReplay;
    const btnBack = document.getElementById('btn-back-menu');
    if (btnBack) btnBack.textContent = dict.btnBackMenu;

    // 房間台詞
    const txtSpeech = document.getElementById('txt-shark-speech');
    if (txtSpeech) txtSpeech.textContent = dict.greetingText;

    // 房間食物標籤
    const txtFood = document.getElementById('txt-food-label');
    if (txtFood) txtFood.textContent = dict.foodLabel;

    // 領養畫面
    document.getElementById('txt-adopt-line1').textContent = dict.adoptLine1;
    document.getElementById('txt-adopt-line2').textContent = dict.adoptLine2;
    document.getElementById('txt-adopt-yes').textContent = dict.adoptYes;
    document.getElementById('txt-adopt-no').textContent = dict.adoptNo;
    document.getElementById('txt-happy-cheer').textContent = dict.happyCheer;

    // 結局畫面
    document.getElementById('txt-restart').textContent = dict.btnRestart;
  }

  switchScreen(screenName) {
    Object.keys(this.screens).forEach((name) => {
      this.screens[name].classList.remove('active');
    });

    if (this.screens[screenName]) {
      this.screens[screenName].classList.add('active');
      this.currentScreen = screenName;
    }
  }

  startSplashScreen() {
    this.switchScreen('splash');

    const tryPlayAudio = () => {
      this.sfx.playLogoJingle();
      window.removeEventListener('pointerdown', tryPlayAudio);
      window.removeEventListener('keydown', tryPlayAudio);
    };
    window.addEventListener('pointerdown', tryPlayAudio, { once: true });
    window.addEventListener('keydown', tryPlayAudio, { once: true });

    // Logo 播放 3.2 秒後進入語言選擇畫面
    if (this.splashTimeout) clearTimeout(this.splashTimeout);
    this.splashTimeout = setTimeout(() => {
      if (this.currentScreen === 'splash') {
        this.goToLangSelect();
      }
    }, 3200);
  }

  goToLangSelect() {
    if (this.splashTimeout) clearTimeout(this.splashTimeout);
    this.clearStarveTimer();
    this.isFeedingLocked = false;
    this.applesEatenCount = 0;
    this.currentSharkStage = null;
    const roomShark = document.getElementById('room-shark');
    if (roomShark) {
      roomShark.classList.remove('room-shark-walkout');
      roomShark.style.transform = '';
      roomShark.style.opacity = '1';
    }
    this.showSharkStage('normal');
    this.switchScreen('lang');
  }

  // 第 1 個小彩蛋問答畫面 (于凱有照顧小家庭嗎？，支援語言選擇進入或吃蘋果輪流進入)
  goToEasterEgg(fromRoom = false) {
    this.isFromRoomFeeding = fromRoom;
    const feedback = document.getElementById('easter-feedback');
    if (feedback) {
      feedback.classList.add('hidden');
      feedback.textContent = '';
    }
    const btnYes = document.getElementById('btn-easter-yes');
    const btnNo = document.getElementById('btn-easter-no');
    if (btnYes) {
      btnYes.disabled = false;
      btnYes.style.pointerEvents = 'auto';
    }
    if (btnNo) {
      btnNo.disabled = false;
      btnNo.style.animation = '';
      btnNo.style.pointerEvents = 'auto';
    }
    this.switchScreen('easter');
  }

  // 第 2 個小彩蛋問答畫面 (Care you ! Yu care ! 是誰的口號？)
  goToEasterEgg2() {
    this.isFromRoomFeeding = true;
    const feedback = document.getElementById('easter2-feedback');
    if (feedback) {
      feedback.classList.add('hidden');
      feedback.textContent = '';
    }
    const btn1 = document.getElementById('btn-easter2-opt1');
    const btn2 = document.getElementById('btn-easter2-opt2');
    if (btn1) {
      btn1.disabled = false;
      btn1.style.animation = '';
    }
    if (btn2) {
      btn2.disabled = false;
      btn2.style.animation = '';
    }
    this.switchScreen('easter2');
  }

  goToAdopt() {
    this.rejectCount = 0;
    const btnAdoptNo = document.getElementById('btn-adopt-no');
    if (btnAdoptNo) {
      btnAdoptNo.style.transform = 'none';
    }

    const celebration = document.getElementById('happy-celebration');
    if (celebration) celebration.classList.remove('active');

    const dict = I18N[this.currentLang];
    document.getElementById('txt-adopt-line1').textContent = dict.adoptLine1;
    document.getElementById('txt-adopt-line2').textContent = dict.adoptLine2;

    this.switchScreen('adopt');
  }

  // 支援多結局畫面 (結局 1 胖胖鯊 / 結局 3 流浪的鯊魚 / 結局 11 一個人也很自在)
  goToEnding(endingId = 11) {
    this.sfx.playEndingJingle();
    const endingImg = document.getElementById('ending-img');
    if (endingImg) {
      if (endingId === 1) {
        endingImg.src = 'assets/ending_1.jpg?v=' + Date.now();
        endingImg.alt = '你通關啦！ 結局 1 胖胖鯊';
      } else if (endingId === 3) {
        endingImg.src = 'assets/ending_3.jpg?v=' + Date.now();
        endingImg.alt = '你通關啦！ 結局 3 流浪的鯊魚';
      } else {
        endingImg.src = 'assets/ending_11.jpg?v=' + Date.now();
        endingImg.alt = '結局 11: 一個人也很自在';
      }
    }
    this.switchScreen('ending');
  }

  goToMenu() {
    this.switchScreen('menu');
  }

  // 切換小鯊魚房間內的形狀狀態
  showSharkStage(stage) {
    this.currentSharkStage = stage;
    const stage1 = document.getElementById('room-shark-stage-1');
    const stage2 = document.getElementById('room-shark-stage-2');
    const stage3 = document.getElementById('room-shark-stage-3');
    const stage4 = document.getElementById('room-shark-stage-4');

    const allStages = [stage1, stage2, stage3, stage4];
    allStages.forEach(el => { if (el) el.classList.add('hidden'); });

    if ((stage === 1 || stage === 'chubby') && stage1) {
      stage1.classList.remove('hidden');
    } else if ((stage === 2 || stage === 'stuck') && stage2) {
      stage2.classList.remove('hidden');
    } else if ((stage === 3 || stage === 'square') && stage3) {
      stage3.classList.remove('hidden');
    } else if ((stage === 4 || stage === 'full') && stage4) {
      stage4.classList.remove('hidden');
    }
  }

  goToRoom() {
    this.switchScreen('game');
    this.syncFlowerState();

    // 若小鯊魚有變形狀態，恢復目前形狀
    if (this.currentSharkStage) {
      this.showSharkStage(this.currentSharkStage);
    }

    // 若是從房間吃蘋果問答回來的，不重複打招呼
    if (this.isFromRoomFeeding) {
      this.isFromRoomFeeding = false;
      return;
    }

    // 首次進入房間後的標準對話流程 (僅在首次進入且未變形時播放，從戶外返回或已變身時不重複打擾)：
    if (!this.hasGreetedInRoom && !this.currentSharkStage) {
      this.hasGreetedInRoom = true;
      setTimeout(() => {
        this.playSharkGreeting('hello', () => {
          setTimeout(() => {
            this.playSharkGreeting('want_apple');
          }, 600);
        });
      }, 500);
    }
  }

  goToOutdoor() {
    this.switchScreen('outdoor');
    this.syncFlowerState();
  }

  // 小鯊魚開口說話動畫與聲音播放 (支援完整 18 句台詞、語音錄音與 TTS 智能朗讀)
  playSharkGreeting(targetVoiceId = 'hello', onFinished = null) {
    const bubble = document.getElementById('shark-speech-bubble');
    const txtSpeech = document.getElementById('txt-shark-speech');
    if (!bubble || !txtSpeech) {
      if (onFinished) onFinished();
      return;
    }

    const voiceId = targetVoiceId || 'hello';

    const dialogueMap = {
      hello: {
        zh: '你好！',
        ja: 'こんにちは！',
        en: 'Hello!',
        file: 'assets/shark_hello.wav'
      },
      want_apple: {
        zh: '我想吃蘋果！',
        ja: 'リンゴが食べたいな！',
        en: 'I want to eat an apple!',
        file: 'assets/shark_want_apple.wav'
      },
      pick_fish: {
        zh: '對對就是那個',
        ja: 'そうそう、それだよ！',
        en: 'Yes! That\'s the one!',
        file: 'assets/shark_pick_fish.wav'
      },
      give_me: {
        zh: '可以給我蘋果嗎？',
        ja: 'リンゴをくれる？',
        en: 'Can you give me the apple?',
        file: 'assets/shark_give_me.wav'
      },
      // 結局 3：飢餓流浪台詞 (地上有蘋果一直不餵)
      starve_1: {
        zh: '可以給我蘋果嗎？',
        ja: 'リンゴをくれる？',
        en: 'Can you give me the apple?',
        file: 'assets/shark_give_me.wav'
      },
      starve_2: {
        zh: '拜託？',
        ja: 'お願い？',
        en: 'Please?',
        file: null
      },
      starve_3: {
        zh: '我聞到甜甜的香味了',
        ja: '甘い香りがしてきたよ',
        en: 'I smell a sweet scent...',
        file: null
      },
      starve_4: {
        zh: '好餓喔',
        ja: 'お腹すいたな',
        en: 'So hungry...',
        file: null
      },
      starve_5: {
        zh: '明明蘋果就在那麼近的地方',
        ja: 'リンゴがこんなに近くにあるのに',
        en: 'The apple is right there...',
        file: null
      },
      starve_6: {
        zh: '可以幫幫我嗎？',
        ja: '助けてくれる？',
        en: 'Can you help me?',
        file: null
      },
      starve_7: {
        zh: '莫非其實你討厭我？',
        ja: 'もしかして私のこと嫌い？',
        en: 'Could it be that you hate me?',
        file: null
      },
      starve_8: {
        zh: '養一個寵物那麼難嗎？',
        ja: 'ペットを飼うのってそんなに大変？',
        en: 'Is keeping a pet that hard?',
        file: null
      },
      starve_9: {
        zh: '好餓，快餓死了',
        ja: 'お腹すいた、死んじゃいそう',
        en: 'So hungry, starving to death...',
        file: null
      },
      starve_10: {
        zh: '蘋果是屬於你的，我吃不到（嘆氣）我要出門找食物去了',
        ja: 'リンゴはあなたのもの、私には食べられない（ため息）食べ物を探しに出ていくね',
        en: 'The apple is yours, I cannot eat it (sigh) I will go outside to find food...',
        file: null
      },
      // 結局 1：吃蘋果變方台詞
      eat_2: {
        zh: '鯊魚應該吃魚肉？',
        ja: 'サメは魚を食べるべき？',
        en: 'Should sharks eat fish?',
        file: null
      },
      eat_3: {
        zh: '鯊魚吃蘋果也很正常',
        ja: 'サメがリンゴを食べるのも普通だよ',
        en: 'It is normal for sharks to eat apples too.',
        file: null
      },
      eat_4: {
        zh: '好像身體卡住了',
        ja: '体が引っかかっちゃったみたい',
        en: 'Looks like my body is stuck.',
        file: null
      },
      eat_5: {
        zh: '它變得越來越方了',
        ja: 'どんどん四角くなってきた',
        en: 'It is getting more and more square.',
        file: null
      },
      eat_6: {
        zh: '我怎麼…',
        ja: '私どうして…',
        en: 'How did I...',
        file: null
      }
    };

    const currentLine = dialogueMap[voiceId] || dialogueMap.hello;
    const lineText = currentLine[this.currentLang] || currentLine.zh;
    txtSpeech.textContent = lineText;

    const bottomPrompt = document.getElementById('txt-bottom-prompt');
    if (bottomPrompt) {
      bottomPrompt.textContent = lineText;
    }

    // 說話時顯示對話氣泡字幕，並加入生動可愛的微跳動態，不重疊覆蓋第二隻鯊魚圖層
    const roomShark = document.getElementById('room-shark');
    if (roomShark) {
      roomShark.classList.add('shark-speaking-bounce');
    }
    bubble.classList.remove('hidden');

    let hasEnded = false;
    const finishTalking = () => {
      if (hasEnded) return;
      hasEnded = true;
      if (roomShark) {
        roomShark.classList.remove('shark-speaking-bounce');
      }
      setTimeout(() => {
        bubble.classList.add('hidden');
        if (bottomPrompt) {
          bottomPrompt.textContent = this.isFeedingLocked ? '鯊魚已經出門了…' : '給它吃蘋果吧';
        }
        if (typeof onFinished === 'function') onFinished();
      }, 350);
    };

    // 1. 優先檢查使用者是否有自行錄製或上傳的自訂語音 (localStorage)
    const savedAudioData = localStorage.getItem('shark_voice_' + voiceId);
    if (savedAudioData) {
      const audioMem = new Audio(savedAudioData);
      audioMem.onended = finishTalking;
      audioMem.play().catch(() => {
        this.speakWithTTS(lineText, finishTalking);
      });
      setTimeout(() => { if (!hasEnded) finishTalking(); }, 4000);
      return;
    }

    // 2. 優先使用 Web Audio API 解碼 Buffer 播放
    if (this.sfx.buffers[voiceId]) {
      const played = this.sfx.playBuffer(voiceId, finishTalking);
      if (played) return;
    }

    // 3. 若 Buffer 正在下載或尚未載入，使用預熱好的 Audio 池播放
    const pooledAudio = this.audioPool && this.audioPool[voiceId];
    if (pooledAudio) {
      pooledAudio.currentTime = 0;
      pooledAudio.onended = finishTalking;
      const playPromise = pooledAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          this.playFallbackVoice(voiceId, finishTalking, lineText);
        });
      }
      return;
    }

    // 4. 若有實體音檔，嘗試載入播放
    if (currentLine.file) {
      const audioDisk = new Audio(currentLine.file + '?v=' + Date.now());
      let hasPlayed = false;

      const tryPlay = () => {
        if (hasPlayed || hasEnded) return;
        hasPlayed = true;
        audioDisk.play().catch(() => {
          this.playFallbackVoice(voiceId, finishTalking, lineText);
        });
      };

      audioDisk.oncanplaythrough = tryPlay;
      audioDisk.onloadeddata = tryPlay;
      tryPlay();

      audioDisk.onended = finishTalking;

      audioDisk.onerror = () => {
        if (!hasEnded) {
          this.playFallbackVoice(voiceId, finishTalking, lineText);
        }
      };

      setTimeout(() => {
        if (!hasEnded) finishTalking();
      }, 3500);
      return;
    }

    // 5. 若無預設音檔，使用 Web Speech API 或語音合成可愛朗讀！
    this.playFallbackVoice(voiceId, finishTalking, lineText);
  }

  playFallbackVoice(voiceId, onEnd, lineText = '') {
    const savedAudioData = localStorage.getItem('shark_voice_' + voiceId);
    if (savedAudioData) {
      const audioMem = new Audio(savedAudioData);
      audioMem.onended = onEnd;
      audioMem.play().catch(() => {
        this.speakWithTTS(lineText, onEnd);
      });
      setTimeout(onEnd, 3500);
      return;
    }

    if (lineText && 'speechSynthesis' in window) {
      this.speakWithTTS(lineText, onEnd);
      return;
    }

    this.sfx.playDefaultGreetingSound();
    setTimeout(onEnd, 1000);
  }

  // 可愛童音語音合成（適用於未錄製的台詞，保證每句都有生動聲音）
  speakWithTTS(text, onEnd) {
    if (!('speechSynthesis' in window) || !text) {
      this.sfx.playDefaultGreetingSound();
      if (typeof onEnd === 'function') setTimeout(onEnd, 800);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1.35; // 高萌小鯊魚音調
      if (this.currentLang === 'zh') utterance.lang = 'zh-TW';
      else if (this.currentLang === 'ja') utterance.lang = 'ja-JP';
      else utterance.lang = 'en-US';

      let ended = false;
      const done = () => {
        if (ended) return;
        ended = true;
        if (typeof onEnd === 'function') onEnd();
      };

      utterance.onend = done;
      utterance.onerror = done;
      setTimeout(done, 3800);

      this.sfx.playSlideSound(1.3);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      this.sfx.playDefaultGreetingSound();
      if (typeof onEnd === 'function') setTimeout(onEnd, 800);
    }
  }

  // 錄音機模態窗邏輯 (支援雙台詞切換)
  initVoiceRecorder() {
    const modal = document.getElementById('voice-recorder-modal');
    const btnOpen = document.getElementById('btn-open-recorder');
    const btnClose = document.getElementById('btn-close-modal');
    const btnToggleRec = document.getElementById('btn-record-toggle');
    const txtRecStatus = document.getElementById('txt-rec-status');
    const btnPlayRec = document.getElementById('btn-record-play');
    const btnSaveRec = document.getElementById('btn-record-save');
    const statusTip = document.getElementById('rec-status-tip');
    const fileInput = document.getElementById('audio-file-input');
    const modalDesc = document.getElementById('modal-voice-desc');

    const tabHello = document.getElementById('tab-voice-hello');
    const tabApple = document.getElementById('tab-voice-apple');
    const tabFish = document.getElementById('tab-voice-fish');
    const tabGive = document.getElementById('tab-voice-give');
    const badgeHello = document.getElementById('badge-hello');
    const badgeApple = document.getElementById('badge-apple');
    const badgeFish = document.getElementById('badge-fish');
    const badgeGive = document.getElementById('badge-give');

    if (!modal) return;

    const phraseMap = {
      hello: '你好！',
      want_apple: '我想吃蘋果！',
      pick_fish: '對對就是那個',
      give_me: '可以給我蘋果嗎？',
      starve_1: '可以給我蘋果嗎？',
      starve_2: '拜託？',
      starve_3: '我聞到甜甜的香味了',
      starve_4: '好餓喔',
      starve_5: '明明蘋果就在那麼近的地方',
      starve_6: '可以幫幫我嗎？',
      starve_7: '莫非其實你討厭我？',
      starve_8: '養一個寵物那麼難嗎？',
      starve_9: '好餓，快餓死了',
      starve_10: '蘋果是屬於你的，我吃不到（嘆氣）我要出門找食物去了',
      eat_2: '鯊魚應該吃魚肉？',
      eat_3: '鯊魚吃蘋果也很正常',
      eat_4: '好像身體卡住了',
      eat_5: '它變得越來越方了',
      eat_6: '我怎麼…'
    };

    const phraseSelect = document.getElementById('voice-phrase-select');

    const updateTabUI = () => {
      [tabHello, tabApple, tabFish, tabGive].forEach((t) => t && t.classList.remove('active'));

      if (this.currentVoiceId === 'hello' && tabHello) tabHello.classList.add('active');
      else if (this.currentVoiceId === 'want_apple' && tabApple) tabApple.classList.add('active');
      else if (this.currentVoiceId === 'pick_fish' && tabFish) tabFish.classList.add('active');
      else if ((this.currentVoiceId === 'give_me' || this.currentVoiceId === 'starve_1') && tabGive) tabGive.classList.add('active');

      const phraseName = phraseMap[this.currentVoiceId] || '自訂語音';
      modalDesc.innerHTML = `當前錄製：用自己的聲音說「<strong>${phraseName}</strong>」！`;
      statusTip.textContent = `點擊「開始錄音」後，請清晰說出：「${phraseName}」`;

      if (phraseSelect) {
        phraseSelect.value = this.currentVoiceId;
      }

      // 檢查目前標籤是否已有錄音
      const hasVoice = localStorage.getItem('shark_voice_' + this.currentVoiceId);
      btnPlayRec.disabled = !hasVoice && !this.recordedAudioUrl;
      btnSaveRec.disabled = !this.recordedAudioBlob;
    };

    if (phraseSelect) {
      phraseSelect.addEventListener('change', () => {
        this.currentVoiceId = phraseSelect.value;
        this.sfx.playClickSound();
        updateTabUI();
      });
    }

    if (tabHello) {
      tabHello.addEventListener('click', () => {
        this.currentVoiceId = 'hello';
        this.sfx.playClickSound();
        updateTabUI();
      });
    }

    if (tabApple) {
      tabApple.addEventListener('click', () => {
        this.currentVoiceId = 'want_apple';
        this.sfx.playClickSound();
        updateTabUI();
      });
    }

    if (tabFish) {
      tabFish.addEventListener('click', () => {
        this.currentVoiceId = 'pick_fish';
        this.sfx.playClickSound();
        updateTabUI();
      });
    }

    if (tabGive) {
      tabGive.addEventListener('click', () => {
        this.currentVoiceId = 'give_me';
        this.sfx.playClickSound();
        updateTabUI();
      });
    }

    // 快捷鍵 'R' 或 'V' 開啟錄音面板
    window.addEventListener('keydown', (e) => {
      if ((e.key === 'r' || e.key === 'R' || e.key === 'v' || e.key === 'V') && this.currentScreen === 'game') {
        modal.classList.remove('hidden');
        updateTabUI();
      }
    });

    // 雙擊聲音按鈕開啟錄音面板
    const btnSound = document.getElementById('btn-sound-toggle');
    if (btnSound) {
      btnSound.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        modal.classList.remove('hidden');
        updateTabUI();
      });
    }

    // 開啟錄音窗 (若存在時綁定)
    if (btnOpen) {
      btnOpen.addEventListener('click', () => {
        this.sfx.playClickSound();
        this.currentVoiceId = 'give_me';
        modal.classList.remove('hidden');
        updateTabUI();
      });
    }

    // 關閉錄音窗
    btnClose.addEventListener('click', () => {
      this.sfx.playClickSound();
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
      }
      modal.classList.add('hidden');
    });

    // 開始/停止錄音
    btnToggleRec.addEventListener('click', async () => {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
        btnToggleRec.classList.remove('recording');
        txtRecStatus.textContent = '🔴 重新錄音';
        statusTip.textContent = '錄音完成！點擊「試聽」確認，滿意請點「保存為正式版語音」。';
      } else {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          this.recordedChunks = [];
          this.mediaRecorder = new MediaRecorder(stream);

          this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) this.recordedChunks.push(e.data);
          };

          this.mediaRecorder.onstop = () => {
            this.recordedAudioBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
            this.recordedAudioUrl = URL.createObjectURL(this.recordedAudioBlob);
            btnPlayRec.disabled = false;
            btnSaveRec.disabled = false;
            stream.getTracks().forEach((track) => track.stop());
          };

          this.mediaRecorder.start();
          btnToggleRec.classList.add('recording');
          txtRecStatus.textContent = '⏹ 停止錄音';
          let targetPhrase = '「可以給我嗎？」';
          if (this.currentVoiceId === 'hello') targetPhrase = '「你好！」';
          if (this.currentVoiceId === 'want_apple') targetPhrase = '「我想吃蘋果」';
          if (this.currentVoiceId === 'pick_fish') targetPhrase = '「對對就是那個」';
          statusTip.textContent = `正在錄音中... 請清晰地說 ${targetPhrase}！`;
        } catch (err) {
          statusTip.textContent = '無法取得麥克風權限：' + err.message + '，請確認瀏覽器已允許麥克風。';
        }
      }
    });

    // 試聽錄音
    btnPlayRec.addEventListener('click', () => {
      if (this.recordedAudioUrl) {
        const audio = new Audio(this.recordedAudioUrl);
        audio.play();
      } else {
        const audioDisk = new Audio(`assets/shark_${this.currentVoiceId}.wav?t=` + Date.now());
        audioDisk.play().catch(() => {
          const saved = localStorage.getItem('shark_voice_' + this.currentVoiceId);
          if (saved) {
            const audio = new Audio(saved);
            audio.play();
          }
        });
      }
    });

    // 保存錄音
    btnSaveRec.addEventListener('click', async () => {
      if (!this.recordedAudioBlob) return;

      statusTip.textContent = '⏳ 正在寫入專案正式檔案中...';
      const targetId = this.currentVoiceId;

      try {
        const resp = await fetch(`/save-audio?id=${targetId}`, {
          method: 'POST',
          body: this.recordedAudioBlob
        });
        const resJson = await resp.json();
        console.log('音檔已寫入硬碟：', resJson.file_saved);
      } catch (err) {
        console.warn('伺服器寫入硬碟略過或使用本地備份：', err);
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result;
        try {
          localStorage.setItem('shark_voice_' + targetId, base64Audio);
        } catch (e) {}

        let phrase = '「可以給我嗎？」';
        if (targetId === 'hello') phrase = '「你好！」';
        if (targetId === 'want_apple') phrase = '「我想吃蘋果」';
        if (targetId === 'pick_fish') phrase = '「對對就是那個」';

        statusTip.textContent = `✅ 保存成功！${phrase} 已保存至專案正式版！`;
        this.sfx.playHappyJingle();

        if (targetId === 'want_apple' && badgeApple) {
          badgeApple.textContent = '已錄製 ✓';
        }
        if (targetId === 'pick_fish' && badgeFish) {
          badgeFish.textContent = '已錄製 ✓';
        }
        if (targetId === 'give_me' && badgeGive) {
          badgeGive.textContent = '已錄製 ✓';
        }

        setTimeout(() => {
          modal.classList.add('hidden');
          // 立即演示小鯊魚說這句話
          this.playSharkGreeting(targetId);
        }, 1200);
      };
      reader.readAsDataURL(this.recordedAudioBlob);
    });

    // 檔案上傳支援
    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          const targetId = this.currentVoiceId;
          statusTip.textContent = '⏳ 正在保存至專案...';
          try {
            await fetch(`/save-audio?id=${targetId}`, {
              method: 'POST',
              body: file
            });
          } catch (err) {}

          const reader = new FileReader();
          reader.onload = (evt) => {
            const base64Audio = evt.target.result;
            try {
              localStorage.setItem('shark_voice_' + targetId, base64Audio);
              this.recordedAudioUrl = base64Audio;
              btnPlayRec.disabled = false;
              statusTip.textContent = `✅ 檔案 "${file.name}" 已保存至專案正式版！`;
              this.sfx.playHappyJingle();
              if (targetId === 'want_apple' && badgeApple) {
                badgeApple.textContent = '已錄製 ✓';
              }
            } catch (err) {
              statusTip.textContent = `✅ 檔案已保存至專案！`;
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  // 掉落蘋果的物理動畫邏輯 (垂直向下掉落，由玩家拿起或點擊並觸發「對對就是那個」)
  dropAppleFromButton() {
    const container = document.getElementById('food-drop-container');
    const viewport = document.querySelector('.room-viewport');
    if (!container || !viewport) return;

    this.sfx.playClickSound();

    const apple = document.createElement('img');
    apple.src = 'assets/apple_transparent.png?v=clean_v4';
    apple.className = 'falling-apple';

    const stage = document.querySelector('.room-stage') || viewport;
    const stageRect = stage.getBoundingClientRect();
    const vpRect = viewport.getBoundingClientRect();
    const dialog = document.querySelector('.room-bottom-dialog');

    // 垂直在左側偏中開闊木地板掉落 (x ~ 28%)，避開邊界與按鈕，居於坐墊左前方
    let posX = Math.round(vpRect.width * 0.28);
    let posY = Math.round(stageRect.height * 0.15);

    apple.style.left = `${posX}px`;
    apple.style.top = `${posY}px`;
    container.appendChild(apple);

    // 計算木地板著陸高度 (確保 100% 穩穩掉在地板上，且在底部對話框上方)
    const stageTopInVp = stageRect.top - vpRect.top;
    const appleHeight = 52;
    // 地板高度：在小鯊魚坐墊前方木地板區域 (約舞台高度的 72%)
    let targetFloorY = Math.round(stageTopInVp + stageRect.height * 0.72);

    if (dialog) {
      const dialogRect = dialog.getBoundingClientRect();
      const dialogTopInVp = dialogRect.top - vpRect.top;
      // 確保在對話框頂部上方至少 20px
      targetFloorY = Math.min(targetFloorY, dialogTopInVp - appleHeight - 20);
    }
    const floorY = targetFloorY;

    // 垂直掉落參數 (vx = 0 嚴格垂直下墜)
    let vy = 1.2;
    const gravity = 0.62;
    let hasLanded = false;
    let bounceCount = 0;

    const fallLoop = () => {
      if (hasLanded) return;

      vy += gravity;
      posY += vy;

      if (posY >= floorY) {
        posY = floorY;
        bounceCount++;
        if (bounceCount <= 2) {
          vy = -vy * 0.35; // 輕微彈跳兩下停在地上
        } else {
          hasLanded = true;
          posY = floorY;
          apple.style.top = `${posY}px`;
          this.makeAppleInteractable(apple, viewport);
          // 蘋果掉在地上，若玩家不餵，啟動飢餓離家出走計時器 (結局 3)
          this.startStarveTimer();
          return;
        }
      }

      apple.style.top = `${posY}px`;
      requestAnimationFrame(fallLoop);
    };

    requestAnimationFrame(fallLoop);
  }

  // 結局 3：飢餓計時器邏輯 (把蘋果放在地上一直不餵他，觸發 10 句飢餓台詞與離家出走結局)
  startStarveTimer() {
    this.clearStarveTimer();
    if (this.isFeedingLocked) return;
    this.starveStep = 0;

    const starveSteps = [
      { id: 'starve_1', delay: 4000 },
      { id: 'starve_2', delay: 4500 },
      { id: 'starve_3', delay: 4500 },
      { id: 'starve_4', delay: 4500 },
      { id: 'starve_5', delay: 4500 },
      { id: 'starve_6', delay: 4500 },
      { id: 'starve_7', delay: 4500 },
      { id: 'starve_8', delay: 4500, onStep: () => {
        // 第 8 句「養一個寵物那麼難嗎？」：正式鎖定不可再餵食！
        this.isFeedingLocked = true;
      }},
      { id: 'starve_9', delay: 4500 },
      { id: 'starve_10', delay: 4500, onStep: () => {
        this.isFeedingLocked = true;
      }, onDone: () => {
        // 說完第 10 句「我要出門找食物去了」：小鯊魚離家出走，獲得結局 3「流浪的鯊魚」
        const roomShark = document.getElementById('room-shark');
        if (roomShark) {
          roomShark.classList.add('room-shark-walkout');
        }
        setTimeout(() => {
          this.goToEnding(3);
        }, 1800);
      }}
    ];

    const runNext = () => {
      if (this.starveStep >= starveSteps.length) return;
      const cur = starveSteps[this.starveStep];
      this.starveStep++;

      this.starveTimer = setTimeout(() => {
        if (cur.onStep) cur.onStep();
        this.playSharkGreeting(cur.id, () => {
          if (cur.onDone) {
            cur.onDone();
          } else {
            runNext();
          }
        });
      }, cur.delay);
    };

    runNext();
  }

  clearStarveTimer() {
    if (this.starveTimer) {
      clearTimeout(this.starveTimer);
      this.starveTimer = null;
    }
  }

  // 讓掉在地上的蘋果可供玩家「拿起」與「餵食」(支援手機觸控拖拽、點擊餵食與點擊小鯊魚餵食)
  makeAppleInteractable(apple, viewport) {
    let isDragging = false;
    let hasSaidQuote = false;
    let startPointerX = 0;
    let startPointerY = 0;
    apple.style.touchAction = 'none';

    const onPointerDown = (e) => {
      if (this.isFeedingLocked) return;
      e.stopPropagation();
      isDragging = true;
      startPointerX = e.clientX;
      startPointerY = e.clientY;
      apple.classList.add('picked-up');
      try {
        apple.setPointerCapture(e.pointerId);
      } catch (err) {}

      // 玩家拿起蘋果時暫停飢餓計時器
      this.clearStarveTimer();

      // 玩家拿起蘋果的瞬間：先說第三句「對對就是那個」，緊接著說第四句「可以給我蘋果嗎？」！
      if (!hasSaidQuote) {
        hasSaidQuote = true;
        this.playSharkGreeting('pick_fish', () => {
          setTimeout(() => {
            this.playSharkGreeting('give_me');
          }, 450);
        });
      }

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const vpRect = viewport.getBoundingClientRect();
      const curX = e.clientX - vpRect.left - (apple.offsetWidth / 2 || 26);
      const curY = e.clientY - vpRect.top - (apple.offsetHeight / 2 || 26);
      apple.style.left = `${curX}px`;
      apple.style.top = `${curY}px`;
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      apple.classList.remove('picked-up');
      try {
        apple.releasePointerCapture(e.pointerId);
      } catch (err) {}
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      if (this.isFeedingLocked) return;

      const vpRect = viewport.getBoundingClientRect();
      const curX = e.clientX - vpRect.left;
      const curY = e.clientY - vpRect.top;

      const stage = document.querySelector('.room-stage') || viewport;
      const stageRect = stage.getBoundingClientRect();
      const stageTopInVp = stageRect.top - vpRect.top;

      // 若只是輕點蘋果（位移小於 14px），直接觸發順暢餵食動效，對手機直式全頁操作極度友善！
      const distMoved = Math.hypot(e.clientX - startPointerX, e.clientY - startPointerY);
      if (distMoved < 14) {
        apple.style.transition = 'all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)';
        apple.style.left = `${vpRect.width * 0.44}px`;
        apple.style.top = `${stageTopInVp + stageRect.height * 0.48}px`;
        apple.style.transform = 'scale(0.85)';
        setTimeout(() => {
          apple.remove();
          this.sharkEatApple();
        }, 220);
        return;
      }

      // 檢查是否拖拽至小鯊魚墊子附近 (餵給小鯊魚吃，適應手機全頁直式與桌面任何比例)
      const sharkCenterX = vpRect.width * 0.48;
      const sharkCenterY = stageTopInVp + stageRect.height * 0.58;
      const dist = Math.hypot(curX - sharkCenterX, curY - sharkCenterY);
      const hitRadius = Math.max(130, vpRect.width * 0.35);

      const inSharkArea = (curX >= vpRect.width * 0.16 && curX <= vpRect.width * 0.84 &&
                           curY >= stageTopInVp && curY <= stageTopInVp + stageRect.height * 0.88);

      if (dist < hitRadius || inSharkArea) {
        // 餵食成功
        apple.remove();
        this.sharkEatApple();
      } else {
        // 蘋果放回地上，重啟飢餓計時器
        this.startStarveTimer();
      }
    };

    apple.addEventListener('pointerdown', onPointerDown);

    // 手機點擊小鯊魚時，若有已掉落的蘋果，也觸發餵食
    const roomShark = document.getElementById('room-shark');
    if (roomShark && !roomShark._hasAppleFeedListener) {
      roomShark._hasAppleFeedListener = true;
      roomShark.addEventListener('click', () => {
        if (this.isFeedingLocked) return;
        const existingApple = document.querySelector('.falling-apple');
        if (existingApple) {
          existingApple.remove();
          this.sharkEatApple();
        }
      });
    }
  }

  // 鯊魚吃掉蘋果的反應與變形 (結局 1：胖胖鯊 / 方形鯊魚)
  sharkEatApple() {
    if (this.isFeedingLocked) return;
    this.clearStarveTimer();
    this.sfx.playEatSound();
    this.applesEatenCount++;

    const roomShark = document.getElementById('room-shark');
    if (roomShark) {
      roomShark.classList.add('shark-speaking-bounce');
      setTimeout(() => {
        roomShark.classList.remove('shark-speaking-bounce');
      }, 450);
    }

    // 依據吃蘋果次數進行對話與變形 (已移除答題干擾，流暢進行主線互動與結局 1)：
    // 第 1 顆：吃掉，露出開心笑臉
    // 第 2 顆：說「鯊魚應該吃魚肉？」
    // 第 3 顆：說「鯊魚吃蘋果也很正常」，變身為胖胖鯊 (Stage 1)
    // 第 4 顆：說「好像身體卡住了」，變身為卡住小鯊魚 (Stage 2)
    // 第 5 顆：說「它變得越來越方了」，變身為方形小鯊魚 (Stage 3)
    // 第 6 顆：說「我怎麼…」，變身為全景大方塊 (Stage 4)，然後通關進入結局 1「胖胖鯊」！
    if (this.applesEatenCount === 1) {
      const happySprite = document.getElementById('room-shark-happy');
      if (happySprite) {
        happySprite.classList.remove('hidden');
        setTimeout(() => {
          happySprite.classList.add('hidden');
        }, 900);
      }
    } else if (this.applesEatenCount === 2) {
      this.playSharkGreeting('eat_2');
    } else if (this.applesEatenCount === 3) {
      this.showSharkStage(1);
      this.playSharkGreeting('eat_3');
    } else if (this.applesEatenCount === 4) {
      this.showSharkStage(2);
      this.playSharkGreeting('eat_4');
    } else if (this.applesEatenCount === 5) {
      this.showSharkStage(3);
      this.playSharkGreeting('eat_5');
    } else if (this.applesEatenCount >= 6) {
      this.showSharkStage(4);
      this.playSharkGreeting('eat_6', () => {
        setTimeout(() => {
          this.goToEnding(1);
        }, 1600);
      });
    }
  }

  // 掉落小魚的物理動畫邏輯 (向下相容)
  dropFishFromButton() {
    this.dropAppleFromButton();
  }

  makeFishInteractable(fish, viewport) {
    this.makeAppleInteractable(fish, viewport);
  }

  sharkEatFish() {
    this.sharkEatApple();
  }

  initEvents() {
    // 手機瀏覽器音訊解鎖機制 (針對 iOS Safari / Android Chrome 的 Autoplay 嚴格限制)
    const unlockMobileAudio = () => {
      this.sfx.init();
      if (this.sfx.ctx) {
        if (this.sfx.ctx.state === 'suspended') {
          this.sfx.ctx.resume();
        }
        // 播放微秒級無聲音訊喚醒 iOS 硬體喇叭通道
        try {
          const buffer = this.sfx.ctx.createBuffer(1, 1, 22050);
          const source = this.sfx.ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(this.sfx.ctx.destination);
          source.start(0);
        } catch (e) {}

        this.sfx.preloadVoices();
      }

      // 預熱所有 Audio 物件
      if (this.audioPool) {
        Object.values(this.audioPool).forEach((audio) => {
          try {
            audio.load();
          } catch (e) {}
        });
      }
    };

    ['touchstart', 'touchend', 'pointerdown', 'click'].forEach((evt) => {
      window.addEventListener(evt, unlockMobileAudio, { once: true, passive: true });
    });

    // 點擊或鍵盤跳過 Logo -> 進入語言選擇
    const skipSplash = () => {
      if (this.currentScreen === 'splash') {
        this.sfx.playClickSound();
        this.goToLangSelect();
      }
    };

    this.screens.splash.addEventListener('click', skipSplash);
    window.addEventListener('keydown', (e) => {
      if (this.currentScreen === 'splash' && (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape')) {
        skipSplash();
      }
    });

    // 語言選擇按鈕事件 -> 直接進入領養確認畫面 (已移除問答)
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        this.sfx.playClickSound();
        this.setLanguage(lang);
        this.goToAdopt();
      });
    });

    // 第 1 個小彩蛋問答按鈕事件 (于凱有照顧小家庭嗎？)
    const btnEasterYes = document.getElementById('btn-easter-yes');
    const btnEasterNo = document.getElementById('btn-easter-no');
    const easterFeedback = document.getElementById('easter-feedback');

    if (btnEasterYes && btnEasterNo) {
      btnEasterYes.addEventListener('click', (e) => {
        e.stopPropagation();
        btnEasterYes.disabled = true;
        btnEasterNo.disabled = true;
        this.sfx.playHappyJingle();

        if (easterFeedback) {
          easterFeedback.textContent = '太棒了！于凱有好好照顧小家庭！🥰';
          easterFeedback.style.color = '#1fba54';
          easterFeedback.classList.remove('hidden');
        }

        setTimeout(() => {
          if (this.isFromRoomFeeding) {
            this.goToRoom();
          } else {
            this.goToAdopt();
          }
        }, 1200);
      });

      btnEasterNo.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sfx.playSlideSound(0.9);
        btnEasterNo.style.animation = 'easterShake 0.4s ease';
        setTimeout(() => {
          btnEasterNo.style.animation = '';
        }, 420);

        if (easterFeedback) {
          easterFeedback.textContent = '咦？！怎麼會沒有呢～要好好照顧啦！💦';
          easterFeedback.style.color = '#f25f5c';
          easterFeedback.classList.remove('hidden');
        }

        setTimeout(() => {
          if (this.isFromRoomFeeding) {
            this.goToRoom();
          } else {
            this.goToAdopt();
          }
        }, 1500);
      });
    }

    // 第 2 個小彩蛋問答按鈕事件 (Care you ! Yu care ! 是誰的口號？)
    const btnEaster2Opt1 = document.getElementById('btn-easter2-opt1');
    const btnEaster2Opt2 = document.getElementById('btn-easter2-opt2');
    const easter2Feedback = document.getElementById('easter2-feedback');

    if (btnEaster2Opt1 && btnEaster2Opt2) {
      // 選項 1：「1 林🐟凱」 (幽默干擾項)
      btnEaster2Opt1.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sfx.playSlideSound(0.9);
        btnEaster2Opt1.style.animation = 'easterShake 0.4s ease';
        setTimeout(() => {
          btnEaster2Opt1.style.animation = '';
        }, 420);

        if (easter2Feedback) {
          easter2Feedback.textContent = '🐟 哈哈～那是「林魚凱」啦！不過也很幽默！';
          easter2Feedback.style.color = '#e05a8b';
          easter2Feedback.classList.remove('hidden');
        }

        setTimeout(() => {
          this.goToRoom();
        }, 1800);
      });

      // 選項 2：「2 林于凱」 (正確答案：Yu care = 于凱！)
      btnEaster2Opt2.addEventListener('click', (e) => {
        e.stopPropagation();
        btnEaster2Opt1.disabled = true;
        btnEaster2Opt2.disabled = true;
        this.sfx.playHappyJingle();

        if (easter2Feedback) {
          easter2Feedback.textContent = '🎉 答對了！Yu care 就是于凱！超棒！';
          easter2Feedback.style.color = '#1fba54';
          easter2Feedback.classList.remove('hidden');
        }

        setTimeout(() => {
          this.goToRoom();
        }, 1500);
      });
    }

    // 領養畫面按鈕事件
    const btnAdoptYes = document.getElementById('btn-adopt-yes');
    const btnAdoptNo = document.getElementById('btn-adopt-no');
    const celebration = document.getElementById('happy-celebration');

    // 點擊「好的」 -> 觸發開心小鯊魚歡慶，然後直接進入小鯊魚的溫馨房間！
    btnAdoptYes.addEventListener('click', () => {
      this.sfx.playHappyJingle();
      celebration.classList.add('active');

      setTimeout(() => {
        this.goToRoom();
      }, 1800);
    });

    // 點擊「不要」 -> 前 4 次滑動避開，第 5 次進入結局 11
    btnAdoptNo.addEventListener('click', () => {
      this.rejectCount++;
      const dict = I18N[this.currentLang];

      if (this.rejectCount <= 4) {
        this.sfx.playSlideSound(1 + this.rejectCount * 0.15);
        const offset = this.slideOffsets[this.rejectCount - 1];
        btnAdoptNo.style.transform = `translate(${offset.x}px, ${offset.y}px)`;

        const promptKey = `rejectPrompt${this.rejectCount}`;
        if (dict[promptKey]) {
          document.getElementById('txt-adopt-line1').textContent = dict[promptKey];
          document.getElementById('txt-adopt-line2').textContent = '';
        }

        // 當顯示「小鯊魚在看著你呢！」時，小鯊魚眨眼彈跳
        const singleShark = document.querySelector('.adopt-single-shark');
        if (singleShark) {
          singleShark.style.transform = 'translateY(-18px) scale(1.15)';
          setTimeout(() => { singleShark.style.transform = ''; }, 300);
        }
      } else {
        this.goToEnding();
      }
    });

    // 結局畫面「重新開始」按鈕
    const btnRestart = document.getElementById('btn-restart-from-ending');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        this.sfx.playClickSound();
        this.goToLangSelect();
      });
    }

    // 左上角按鈕：按一次掉落一顆蘋果
    const btnSpawnApple = document.getElementById('btn-spawn-apple');
    if (btnSpawnApple) {
      btnSpawnApple.addEventListener('click', () => {
        this.dropAppleFromButton();
      });
    }

    const btnSpawnFish = document.getElementById('btn-spawn-fish');
    if (btnSpawnFish) {
      btnSpawnFish.addEventListener('click', () => {
        this.dropAppleFromButton();
      });
    }

    // 點擊領養畫面的黃色小鯊魚可互動彈跳
    const adoptShark = document.querySelector('.adopt-single-shark');
    if (adoptShark) {
      adoptShark.addEventListener('click', () => {
        this.sfx.playClickSound();
        adoptShark.style.transform = 'scale(1.25) translateY(-16px) rotate(-8deg)';
        setTimeout(() => {
          adoptShark.style.transform = '';
        }, 250);
      });
    }

    // 點擊房間中小鯊魚也可以跟牠互動對話（觸發「我想吃蘋果！」）
    const roomShark = document.getElementById('room-shark');
    if (roomShark) {
      roomShark.style.pointerEvents = 'auto';
      roomShark.style.cursor = 'pointer';
      roomShark.addEventListener('click', () => {
        this.playSharkGreeting('want_apple');
      });
    }

    // 點擊窗台上的黃色小鴨可以發出可愛叫聲
    const rubberDuck = document.getElementById('window-rubber-duck');
    if (rubberDuck) {
      rubberDuck.addEventListener('click', () => {
        this.sfx.playDuckSound();
        rubberDuck.style.transform = 'scale(1.25) translateY(-8px) rotate(-10deg)';
        setTimeout(() => {
          rubberDuck.style.transform = '';
        }, 220);
      });
    }

    // 房間右上角「🔊 聲音」按鈕 (手動點擊解鎖與測試聲音)
    const btnSoundToggle = document.getElementById('btn-sound-toggle');
    if (btnSoundToggle) {
      btnSoundToggle.addEventListener('click', () => {
        this.sfx.init();
        if (this.sfx.ctx && this.sfx.ctx.state === 'suspended') {
          this.sfx.ctx.resume();
        }
        this.sfx.playHappyJingle();

        // 立即演示小鯊魚說第一句話「你好！」
        this.playSharkGreeting('hello');

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        if (isIOS) {
          const bottomPrompt = document.getElementById('txt-bottom-prompt');
          if (bottomPrompt) {
            bottomPrompt.textContent = '🔊 若無聲音，請關閉 iPhone 側邊靜音撥鈕並調大音量！';
          }
        }
      });
    }

    // 房間右上角「🌿 外出」按鈕
    const btnGoOutdoor = document.getElementById('btn-go-outdoor');
    if (btnGoOutdoor) {
      btnGoOutdoor.addEventListener('click', () => {
        this.sfx.playClickSound();
        this.goToOutdoor();
      });
    }

    // 戶外場景左下角「🏠 回家」按鈕
    const btnReturnHome = document.getElementById('btn-return-home');
    if (btnReturnHome) {
      btnReturnHome.addEventListener('click', () => {
        this.sfx.playClickSound();
        this.goToRoom();
      });
    }

    // 房間右上角「‹ 選單」按鈕
    const btnBackMenu = document.getElementById('btn-back-menu');
    if (btnBackMenu) {
      btnBackMenu.addEventListener('click', () => {
        this.sfx.playClickSound();
        this.goToMenu();
      });
    }

    // 主選單各按鈕
    const btnStart = document.getElementById('btn-start');
    const btnLoad = document.getElementById('btn-load');
    const btnSettings = document.getElementById('btn-settings');
    const btnSwitchLang = document.getElementById('btn-switch-lang');
    const btnReplayLogo = document.getElementById('btn-replay-logo');

    btnStart.addEventListener('click', () => {
      this.sfx.playClickSound();
      this.goToRoom();
    });

    btnLoad.addEventListener('click', () => {
      this.sfx.playClickSound();
      alert(I18N[this.currentLang].devAlert);
    });

    btnSettings.addEventListener('click', () => {
      this.sfx.playClickSound();
      const modal = document.getElementById('voice-recorder-modal');
      if (modal) {
        modal.classList.remove('hidden');
      }
    });

    btnSwitchLang.addEventListener('click', () => {
      this.sfx.playClickSound();
      this.goToLangSelect();
    });

    btnReplayLogo.addEventListener('click', () => {
      this.sfx.playClickSound();
      this.startSplashScreen();
      this.sfx.playLogoJingle();
    });

    // 初始化戶外摘花與佩戴在鯊魚頭上的互動系統
    this.initFlowerInteraction();
  }

  // 戶外摘花與佩戴在鯊魚頭上的互動系統
  initFlowerInteraction() {
    const flower = document.getElementById('outdoor-flower-container');
    const sharkWrapper = document.getElementById('outdoor-shark-wrapper');
    const sharkFlower = document.getElementById('outdoor-shark-flower');
    const roomSharkFlower = document.getElementById('room-shark-flower');
    const viewport = document.querySelector('.outdoor-viewport');

    if (!flower || !sharkWrapper) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;

    const onPointerDown = (e) => {
      if (this.isSharkWearingFlower) return;
      e.stopPropagation();
      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;
      isDragging = false;

      try {
        flower.setPointerCapture(e.pointerId);
      } catch (err) {}

      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    };

    const onPointerMove = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!isDragging && (Math.hypot(dx, dy) > 4)) {
        isDragging = true;
        this.sfx.playFlowerPickSound();
        flower.classList.add('picked');
      }

      if (isDragging && viewport) {
        e.preventDefault();
        const vpRect = viewport.getBoundingClientRect();
        const curX = e.clientX - vpRect.left - flower.offsetWidth / 2;
        const curY = e.clientY - vpRect.top - flower.offsetHeight / 2;
        flower.style.left = `${curX}px`;
        flower.style.top = `${curY}px`;

        // 偵測是否接觸或覆蓋小鯊魚
        const sharkRect = sharkWrapper.getBoundingClientRect();
        const flowerRect = flower.getBoundingClientRect();
        const isOverShark = !(
          flowerRect.right < sharkRect.left ||
          flowerRect.left > sharkRect.right ||
          flowerRect.bottom < sharkRect.top ||
          flowerRect.top > sharkRect.bottom
        );
        sharkWrapper.classList.toggle('shark-drop-target', isOverShark);
      }
    };

    const onPointerUp = (e) => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      sharkWrapper.classList.remove('shark-drop-target');

      if (!isDragging) {
        // 單純點擊花朵：直接摘下並佩戴至小鯊魚頭上！
        this.sfx.playFlowerPickSound();
        this.wearFlowerOnShark(true);
        return;
      }

      // 拖曳結束：判斷是否落在小鯊魚身上
      const sharkRect = sharkWrapper.getBoundingClientRect();
      const flowerRect = flower.getBoundingClientRect();
      const isOverShark = !(
        flowerRect.right < sharkRect.left ||
        flowerRect.left > sharkRect.right ||
        flowerRect.bottom < sharkRect.top ||
        flowerRect.top > sharkRect.bottom
      );

      if (isOverShark) {
        this.wearFlowerOnShark(false);
      } else {
        // 放開在其他位置：彈回草地花莖上
        flower.classList.remove('picked');
        flower.style.left = '';
        flower.style.top = '';
      }
    };

    flower.addEventListener('pointerdown', onPointerDown);

    // 點擊小鯊魚頭上的花朵可摘下放回草地花莖
    const takeOffFlower = (e) => {
      e.stopPropagation();
      this.sfx.playFlowerPickSound();
      this.takeOffFlower();
    };

    if (sharkFlower) sharkFlower.addEventListener('click', takeOffFlower);
    if (roomSharkFlower) roomSharkFlower.addEventListener('click', takeOffFlower);
  }

  // 將花朵佩戴在小鯊魚頭上
  wearFlowerOnShark(animateFromStem = false) {
    this.isSharkWearingFlower = true;
    this.sfx.playFlowerWearSound();

    const flower = document.getElementById('outdoor-flower-container');
    const sharkImg = document.getElementById('outdoor-shark-img');
    const speech = document.getElementById('outdoor-shark-speech');

    if (flower) {
      flower.classList.remove('picked');
      flower.classList.add('hidden');
      flower.style.left = '';
      flower.style.top = '';
    }

    this.syncFlowerState();

    if (sharkImg) {
      sharkImg.style.transform = 'scale(1.25) translateY(-16px) rotate(4deg)';
      setTimeout(() => {
        sharkImg.style.transform = '';
      }, 380);
    }

    if (speech) {
      speech.classList.remove('hidden');
      setTimeout(() => {
        speech.classList.add('hidden');
      }, 2600);
    }
  }

  // 將花朵從鯊魚頭上摘下放回草地花莖
  takeOffFlower() {
    this.isSharkWearingFlower = false;
    const flower = document.getElementById('outdoor-flower-container');
    if (flower) {
      flower.classList.remove('hidden', 'picked');
      flower.style.left = '';
      flower.style.top = '';
    }
    this.syncFlowerState();
  }

  // 同步房間與戶外小鯊魚戴花狀態
  syncFlowerState() {
    const outdoorSharkFlower = document.getElementById('outdoor-shark-flower');
    const roomSharkFlower = document.getElementById('room-shark-flower');
    const flower = document.getElementById('outdoor-flower-container');

    if (outdoorSharkFlower) {
      outdoorSharkFlower.classList.toggle('hidden', !this.isSharkWearingFlower);
    }
    if (roomSharkFlower) {
      roomSharkFlower.classList.toggle('hidden', !this.isSharkWearingFlower);
    }
    if (flower) {
      flower.classList.toggle('hidden', this.isSharkWearingFlower);
    }
  }
}

// 頁面載入完成後啟動
document.addEventListener('DOMContentLoaded', () => {
  new SceneManager();
});
