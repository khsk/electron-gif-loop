(function() {
	'use strict';

	console.time('index')

	var tags = []
	var loopCount = 1

	// 移動時にリクエストを中止するためのrequestの返り値
	var watchRequest

	var initSetting = function() {
		var settings = JSON.parse(localStorage.getItem('settings')) || {};
		tags = 'tag' in settings ? settings.tag : 'random';
		loopCount = 'loop_count' in settings ? settings.loop_count : 1;
	}

	var initWindow = function(win) {

		// ウィンドウ位置を復元
		if (localStorage.getItem("windowPosition")) {
			var pos = JSON.parse(localStorage.getItem("windowPosition"));
			win.setPosition(pos[0], pos[1]);
		}

		// ウィンドウサイズを復元
		if (localStorage.getItem("windowSize")) {
			var pos = JSON.parse(localStorage.getItem("windowSize"));
			win.setSize(pos[0], pos[1]);
		}

		// クローズ時にウィンドウ位置を保存
		win.on('close', function() {
			localStorage.setItem('windowPosition', JSON.stringify(win.getPosition()));
			localStorage.setItem('windowSize', JSON.stringify(win.getSize()));
		})

		// リロード対策。リロード時はcloseは呼ばれない。
		// main processに解放済みのrendererのイベントが残って、closeイベントが重複登録されるのを防ぐ。
		window.addEventListener('beforeunload', function() {
			console.log('before')
			win.removeAllListeners('close')
			watchRequest.abort()
		})

		initSetting()

		// wait read css and show 
		win.show()
	}

	const ipcRenderer = require('electron').ipcRenderer;
	ipcRenderer.on('set-tag', function(e, arg){
		//window.prompt();
		console.info('Electron未対応。そのうちどうにかユーザー入力を取る」')
	})

	const mainWindow = require('electron').remote.getCurrentWindow()
	initWindow(mainWindow)
	console.log('mainWindow',mainWindow)

	//
	// init End
	//


	window.jDataView = require("./src/js/lib/jdataview.js");
	const gify = require("./src/js/lib/gify.js");
	const url = 'http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag='
	const request = require('electron').remote.require('request')

	// giphy APi から取得したランダムな.gif URL
	var randomUrl = ''

	// HTMLで作ってidで呼び出してもいい。ここで作る必要はない
	const image = document.createElement('img')
	document.getElementById('contents').appendChild(image)

	// ランダムなURLだけ先にバッファする
	function fetchRandomUrl() {
		if (randomUrl) {
			return
		}

		var tag = tags[Math.floor(Math.random() * tags.length)]
		watchRequest = request.get({url: url + tag, json:true} ,function (error, response, body) {
			if (error || response.statusCode != 200) {
				console.log('error: ' + response.statusCode)
			}
			//image = document.createElement('img')
			//image.src = body.data.image_url
			randomUrl = body.data.image_url
			//console.log('get!')
		})
	}
	// 定期的にランダムgifを取りつづける
	setInterval(fetchRandomUrl, 1000);


	var duration = '';
	// randomUrlを移して空にして、imgタグの作成フラグとして扱う
	var showUrl = '';
	// アニメーション時間もバッファする
	function fetchGifDuration() {
		if(!randomUrl || (duration != '')) {
			// 対象gifが未決定 または、前回取得した時間が未消費なら再実行で待ち続ける
			return
		}

		showUrl = randomUrl
		// 先読み開始可能に
		randomUrl = ''

		var xhr = new XMLHttpRequest();
		xhr.overrideMimeType('text/plain; charset=x-user-defined');
		xhr.addEventListener("loadend", function(e){
			var info = gify.getInfo(xhr.responseText)
			duration = info.durationChrome || info.duration || 0

			}
		});
		xhr.open("GET", showUrl);
		xhr.send();
	}
	setInterval(fetchGifDuration, 1000)

	// 現在表示中のアニメーション時間(バッッファ待ちループに使用) 初回待ちのために1秒に設定
	var nowDuration = 1000;

	function showGif() {

		if (duration == '') {
			// バッファがまだならもう一度ループ
			setTimeout(showGif, nowDuration)
			return;
		}

		image.src = showUrl;

		setTimeout(showGif, duration * loopCount)
		// 現在のdurationは記憶しておく
		nowDuration = duration;
		// バッファを消費
		duration = 0;
		showUrl  = '';
	}
	// 初期実行 初回表示は最低3秒後
	setTimeout(showGif, 3000);


	console.timeEnd('index')
})()
