var fs = require('fs-extra')
var pug = require('pug')

var ENV_IOS = "iOS"
var ENV_CHROME = "Google Chrome 71+"
var ENV_OTHER = "Firefox, MS Edge, etc."
var RES_NO_SOUND = "何をしても鳴らない"
var RES_SOUND_BY_INTERACTION = "画面タップ（クリック）で再生"
var RES_SOUND_IMMEDIATE = "即座に再生される"

var PUG_OPTION = { pretty: true }
var DIST = "./cases"
var PUG_TEMPLATE_PATH = "./src/layout.pug"

var SAMPLE_MP3_NAME = 'sample.mp3'
var SAMPLE_MP3_PATH = `../shared/${SAMPLE_MP3_NAME}`
var pages = [
  // 事前ロード編
  {
    fileName: 'preload1.html',
    pageTitle: 'ページ読み込みと同時にロード＆再生',
    results: [
      { env: ENV_IOS, message: RES_NO_SOUND },
      { env: ENV_CHROME, message: RES_NO_SOUND },
      { env: ENV_OTHER, message: RES_SOUND_IMMEDIATE },
    ],
    script: `
    window.onload = function() {
      // ページ読み込みと同時にロード
      wa.loadFile('${SAMPLE_MP3_PATH}', function(buffer) {
        wa.play(buffer);
      });
    }
    `,
  },
  {
    fileName: 'preload2.html',
    pageTitle: 'ページ読み込みと同時にロード＆再生、そしてタップイベントに無音再生',
    results: [
      { env: ENV_IOS, message: RES_SOUND_BY_INTERACTION },
      { env: ENV_CHROME, message: RES_SOUND_BY_INTERACTION },
      { env: ENV_OTHER, message: RES_SOUND_IMMEDIATE },
    ],
    script: `
    window.onload = function() {
      wa.loadFile('${SAMPLE_MP3_PATH}', function(buffer) {
        wa.play(buffer);

        // ユーザーイベント
        var event = 'click';
        document.addEventListener(event, function() {
          wa.playSilent();
        });
      });
    }
    `,
  },
  {
    fileName: 'preload3.html',
    pageTitle: 'ページ読み込みと同時にロード、タップイベントにサウンド再生',
    results: [
      { env: ENV_IOS, message: RES_SOUND_BY_INTERACTION },
      { env: ENV_CHROME, message: RES_SOUND_BY_INTERACTION },
      { env: ENV_OTHER, message: RES_SOUND_IMMEDIATE },
    ],
    script: `
    window.onload = function() {
      // ページ読み込みと同時にロード
      wa.loadFile('${SAMPLE_MP3_PATH}', function(buffer) {
        wa.play(buffer);

        // ユーザーイベント
        var event = 'click';
        document.addEventListener(event, function() {
          wa.play('${SAMPLE_MP3_NAME}');
        });
      });
    }
    `,
  },
  {
    fileName: 'preload4.html',
    pageTitle: 'ページ読み込みと同時にロード、タップイベントに非同期処理をはさんで再生',
    results: [
      { env: ENV_IOS, message: RES_NO_SOUND },
      { env: ENV_CHROME, message: RES_SOUND_BY_INTERACTION },
      { env: ENV_OTHER, message: RES_SOUND_BY_INTERACTION },
    ],
    script: `
    window.onload = function() {
      // ページ読み込みと同時にロード
      wa.loadFile('${SAMPLE_MP3_PATH}', function(buffer) {

        // ユーザーイベント
        var event = 'click';
        document.addEventListener(event, function() {
          // 非同期処理
          wa.loadFile('${SAMPLE_MP3_PATH}', function() {
            wa.play('${SAMPLE_MP3_NAME}');
          });
        });
      });
    }
    `,
  },
  {
    fileName: 'preload5.html',
    pageTitle: 'ページ読み込みと同時にロード、タップイベントに無音再生＆非同期処理をはさんで再生',
    results: [
      { env: ENV_IOS, message: RES_SOUND_BY_INTERACTION },
      { env: ENV_CHROME, message: RES_SOUND_BY_INTERACTION },
      { env: ENV_OTHER, message: RES_SOUND_BY_INTERACTION },
    ],
    script: `
    window.onload = function() {
      // ページ読み込みと同時にロード
      wa.loadFile('${SAMPLE_MP3_PATH}', function(buffer) {

        // ユーザーイベント
        var event = 'click';
        document.addEventListener(event, function() {
          wa.playSilent();

          // 非同期処理
          wa.loadFile('${SAMPLE_MP3_PATH}', function() {
            wa.play('${SAMPLE_MP3_NAME}');
          });
        });
      });
    }
    `,
  },

  // 動的ロード編
  {
    fileName: 'dynaload1.html',
    pageTitle: '画面タップでロード → 再生',
    results: [
      { env: ENV_IOS, message: RES_NO_SOUND },
      { env: ENV_CHROME, message: RES_SOUND_BY_INTERACTION },
      { env: ENV_OTHER, message: RES_SOUND_BY_INTERACTION },
    ],
    script: `
    var event = 'click';
    document.addEventListener(event, function() {
      wa.loadFile('${SAMPLE_MP3_PATH}', function(buffer) {
        wa.play(buffer);
      });
    });
    `,
  },
  {
    fileName: 'dynaload2.html',
    pageTitle: '画面タップでロード＆無音再生 → 再生',
    results: [
      { env: ENV_IOS, message: RES_SOUND_BY_INTERACTION },
      { env: ENV_CHROME, message: RES_SOUND_BY_INTERACTION },
      { env: ENV_OTHER, message: RES_SOUND_BY_INTERACTION },
    ],
    script: `
    var event = 'click';
    document.addEventListener(event, function() {
      wa.playSilent();
      wa.loadFile('${SAMPLE_MP3_PATH}', function(buffer) {
        wa.play(buffer);
      });
    });
    `,
  },
];

// Output
fs.emptyDir(DIST)
  .then(() => {
    // 各htmlファイル出力
    var fn = pug.compileFile(PUG_TEMPLATE_PATH, PUG_OPTION);
    pages.forEach((pageParams)=> {
      fs.outputFile(`${DIST}/${pageParams.fileName}`, fn(pageParams))
    });

    // index作成
    fs.outputFile(`${DIST}/index.html`, pug.compileFile("./src/index.pug", PUG_OPTION)({ pages: pages }))
  })
  .catch((e)=> {
    console.error(e);
  });

