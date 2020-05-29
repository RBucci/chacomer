(function(){
	var script = {
 "mouseWheelEnabled": true,
 "scripts": {
  "getPlayListItems": function(media, player){  var itemClass = (function() { switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': return 'PanoramaPlayListItem'; case 'Video360': return 'Video360PlayListItem'; case 'PhotoAlbum': return 'PhotoAlbumPlayListItem'; case 'Map': return 'MapPlayListItem'; case 'Video': return 'VideoPlayListItem'; } })(); if (itemClass != undefined) { var items = this.getByClassName(itemClass); for (var i = items.length-1; i>=0; --i) { var item = items[i]; if(item.get('media') != media || (player != undefined && item.get('player') != player)) { items.splice(i, 1); } } return items; } else { return []; } },
  "isCardboardViewMode": function(){  var players = this.getByClassName('PanoramaPlayer'); return players.length > 0 && players[0].get('viewMode') == 'cardboard'; },
  "setStartTimeVideoSync": function(video, player){  this.setStartTimeVideo(video, player.get('currentTime')); },
  "pauseGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ var audioData = audios[audio.get('id')]; if(audioData) audio = audioData.audio; } if(audio.get('state') == 'playing') audio.pause(); },
  "initGA": function(){  var sendFunc = function(category, event, label) { ga('send', 'event', category, event, label); }; var media = this.getByClassName('Panorama'); media = media.concat(this.getByClassName('Video360')); media = media.concat(this.getByClassName('Map')); for(var i = 0, countI = media.length; i<countI; ++i){ var m = media[i]; var mediaLabel = m.get('label'); var overlays = this.getOverlays(m); for(var j = 0, countJ = overlays.length; j<countJ; ++j){ var overlay = overlays[j]; var overlayLabel = overlay.get('data') != undefined ? mediaLabel + ' - ' + overlay.get('data')['label'] : mediaLabel; switch(overlay.get('class')) { case 'HotspotPanoramaOverlay': case 'HotspotMapOverlay': var areas = overlay.get('areas'); for (var z = 0; z<areas.length; ++z) { areas[z].bind('click', sendFunc.bind(this, 'Hotspot', 'click', overlayLabel), this); } break; case 'CeilingCapPanoramaOverlay': case 'TripodCapPanoramaOverlay': overlay.bind('click', sendFunc.bind(this, 'Cap', 'click', overlayLabel), this); break; } } } var components = this.getByClassName('Button'); components = components.concat(this.getByClassName('IconButton')); for(var i = 0, countI = components.length; i<countI; ++i){ var c = components[i]; var componentLabel = c.get('data')['name']; c.bind('click', sendFunc.bind(this, 'Skin', 'click', componentLabel), this); } var items = this.getByClassName('PlayListItem'); var media2Item = {}; for(var i = 0, countI = items.length; i<countI; ++i) { var item = items[i]; var media = item.get('media'); if(!(media.get('id') in media2Item)) { item.bind('begin', sendFunc.bind(this, 'Media', 'play', media.get('label')), this); media2Item[media.get('id')] = item; } } },
  "setMainMediaByName": function(name){  var items = this.mainPlayList.get('items'); for(var i = 0; i<items.length; ++i){ var item = items[i]; if(item.get('media').get('label') == name) { this.mainPlayList.set('selectedIndex', i); return item; } } },
  "changePlayListWithSameSpot": function(playList, newIndex){  var currentIndex = playList.get('selectedIndex'); if (currentIndex >= 0 && newIndex >= 0 && currentIndex != newIndex) { var currentItem = playList.get('items')[currentIndex]; var newItem = playList.get('items')[newIndex]; var currentPlayer = currentItem.get('player'); var newPlayer = newItem.get('player'); if ((currentPlayer.get('class') == 'PanoramaPlayer' || currentPlayer.get('class') == 'Video360Player') && (newPlayer.get('class') == 'PanoramaPlayer' || newPlayer.get('class') == 'Video360Player')) { var newCamera = this.cloneCamera(newItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, currentItem.get('media')); this.startPanoramaWithCamera(newItem.get('media'), newCamera); } } },
  "stopGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ var audioData = audios[audio.get('id')]; if(audioData){ audio = audioData.audio; delete audios[audio.get('id')]; if(Object.keys(audios).length == 0){ window.currentGlobalAudios = undefined; } } } if(audio) audio.stop(); },
  "setMapLocation": function(panoramaPlayListItem, mapPlayer){  var resetFunction = function(){ panoramaPlayListItem.unbind('stop', resetFunction, this); player.set('mapPlayer', null); }; panoramaPlayListItem.bind('stop', resetFunction, this); var player = panoramaPlayListItem.get('player'); player.set('mapPlayer', mapPlayer); },
  "startPanoramaWithCamera": function(media, camera){  if(window.currentPanoramasWithCameraChanged != undefined && window.currentPanoramasWithCameraChanged.indexOf(media) != -1){ return; } var playLists = this.getByClassName('PlayList'); if(playLists.length == 0) return; var restoreItems = []; for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media && (item.get('class') == 'PanoramaPlayListItem' || item.get('class') == 'Video360PlayListItem')){ restoreItems.push({camera: item.get('camera'), item: item}); item.set('camera', camera); } } } if(restoreItems.length > 0) { if(window.currentPanoramasWithCameraChanged == undefined) { window.currentPanoramasWithCameraChanged = [media]; } else { window.currentPanoramasWithCameraChanged.push(media); } var restoreCameraOnStop = function(){ var index = window.currentPanoramasWithCameraChanged.indexOf(media); if(index != -1) { window.currentPanoramasWithCameraChanged.splice(index, 1); } for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.set('camera', restoreItems[i].camera); restoreItems[i].item.unbind('stop', restoreCameraOnStop, this); } }; for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.bind('stop', restoreCameraOnStop, this); } } },
  "openLink": function(url, name){  if(url == location.href) { return; } var isElectron = (window && window.process && window.process.versions && window.process.versions['electron']) || (navigator && navigator.userAgent && navigator.userAgent.indexOf('Electron') >= 0); if (name == '_blank' && isElectron) { if (url.startsWith('/')) { var r = window.location.href.split('/'); r.pop(); url = r.join('/') + url; } var extension = url.split('.').pop().toLowerCase(); if(extension != 'pdf' || url.startsWith('file://')) { var shell = window.require('electron').shell; shell.openExternal(url); } else { window.open(url, name); } } else if(isElectron && (name == '_top' || name == '_self')) { window.location = url; } else { var newWindow = window.open(url, name); newWindow.focus(); } },
  "updateMediaLabelFromPlayList": function(playList, htmlText, playListItemStopToDispose){  var changeFunction = function(){ var index = playList.get('selectedIndex'); if(index >= 0){ var beginFunction = function(){ playListItem.unbind('begin', beginFunction); setMediaLabel(index); }; var setMediaLabel = function(index){ var media = playListItem.get('media'); var text = media.get('data'); if(!text) text = media.get('label'); setHtml(text); }; var setHtml = function(text){ if(text !== undefined) { htmlText.set('html', '<div style=\"text-align:left\"><SPAN STYLE=\"color:#FFFFFF;font-size:12px;font-family:Verdana\"><span color=\"white\" font-family=\"Verdana\" font-size=\"12px\">' + text + '</SPAN></div>'); } else { htmlText.set('html', ''); } }; var playListItem = playList.get('items')[index]; if(htmlText.get('html')){ setHtml('Loading...'); playListItem.bind('begin', beginFunction); } else{ setMediaLabel(index); } } }; var disposeFunction = function(){ htmlText.set('html', undefined); playList.unbind('change', changeFunction, this); playListItemStopToDispose.unbind('stop', disposeFunction, this); }; if(playListItemStopToDispose){ playListItemStopToDispose.bind('stop', disposeFunction, this); } playList.bind('change', changeFunction, this); changeFunction(); },
  "shareSocial": function(socialID, url, deepLink){  if(url == undefined) { url = deepLink ? location.href : location.href.split(location.search||location.hash||/[?#]/)[0]; } else if(deepLink) { url += location.hash; } url = (function(id){ switch(id){ case 'fb': return 'https://www.facebook.com/sharer/sharer.php?u='+url; case 'wa': return 'https://api.whatsapp.com/send/?text='+encodeURIComponent(url); case 'tw': return 'https://twitter.com/intent/tweet?source=webclient&url='+url; default: return undefined; } })(socialID); this.openLink(url, '_blank'); },
  "showPopupMedia": function(w, media, playList, popupMaxWidth, popupMaxHeight, autoCloseWhenFinished, stopAudios){  var self = this; var closeFunction = function(){ playList.set('selectedIndex', -1); self.MainViewer.set('toolTipEnabled', true); if(stopAudios) { self.resumeGlobalAudios(); } this.resumePlayers(playersPaused, !stopAudios); if(isVideo) { this.unbind('resize', resizeFunction, this); } w.unbind('close', closeFunction, this); }; var endFunction = function(){ w.hide(); }; var resizeFunction = function(){ var getWinValue = function(property){ return w.get(property) || 0; }; var parentWidth = self.get('actualWidth'); var parentHeight = self.get('actualHeight'); var mediaWidth = self.getMediaWidth(media); var mediaHeight = self.getMediaHeight(media); var popupMaxWidthNumber = parseFloat(popupMaxWidth) / 100; var popupMaxHeightNumber = parseFloat(popupMaxHeight) / 100; var windowWidth = popupMaxWidthNumber * parentWidth; var windowHeight = popupMaxHeightNumber * parentHeight; var footerHeight = getWinValue('footerHeight'); var headerHeight = getWinValue('headerHeight'); if(!headerHeight) { var closeButtonHeight = getWinValue('closeButtonIconHeight') + getWinValue('closeButtonPaddingTop') + getWinValue('closeButtonPaddingBottom'); var titleHeight = self.getPixels(getWinValue('titleFontSize')) + getWinValue('titlePaddingTop') + getWinValue('titlePaddingBottom'); headerHeight = closeButtonHeight > titleHeight ? closeButtonHeight : titleHeight; headerHeight += getWinValue('headerPaddingTop') + getWinValue('headerPaddingBottom'); } var contentWindowWidth = windowWidth - getWinValue('bodyPaddingLeft') - getWinValue('bodyPaddingRight') - getWinValue('paddingLeft') - getWinValue('paddingRight'); var contentWindowHeight = windowHeight - headerHeight - footerHeight - getWinValue('bodyPaddingTop') - getWinValue('bodyPaddingBottom') - getWinValue('paddingTop') - getWinValue('paddingBottom'); var parentAspectRatio = contentWindowWidth / contentWindowHeight; var mediaAspectRatio = mediaWidth / mediaHeight; if(parentAspectRatio > mediaAspectRatio) { windowWidth = contentWindowHeight * mediaAspectRatio + getWinValue('bodyPaddingLeft') + getWinValue('bodyPaddingRight') + getWinValue('paddingLeft') + getWinValue('paddingRight'); } else { windowHeight = contentWindowWidth / mediaAspectRatio + headerHeight + footerHeight + getWinValue('bodyPaddingTop') + getWinValue('bodyPaddingBottom') + getWinValue('paddingTop') + getWinValue('paddingBottom'); } if(windowWidth > parentWidth * popupMaxWidthNumber) { windowWidth = parentWidth * popupMaxWidthNumber; } if(windowHeight > parentHeight * popupMaxHeightNumber) { windowHeight = parentHeight * popupMaxHeightNumber; } w.set('width', windowWidth); w.set('height', windowHeight); w.set('x', (parentWidth - getWinValue('actualWidth')) * 0.5); w.set('y', (parentHeight - getWinValue('actualHeight')) * 0.5); }; if(autoCloseWhenFinished){ this.executeFunctionWhenChange(playList, 0, endFunction); } var mediaClass = media.get('class'); var isVideo = mediaClass == 'Video' || mediaClass == 'Video360'; playList.set('selectedIndex', 0); if(isVideo){ this.bind('resize', resizeFunction, this); resizeFunction(); playList.get('items')[0].get('player').play(); } else { w.set('width', popupMaxWidth); w.set('height', popupMaxHeight); } this.MainViewer.set('toolTipEnabled', false); if(stopAudios) { this.pauseGlobalAudios(); } var playersPaused = this.pauseCurrentPlayers(!stopAudios); w.bind('close', closeFunction, this); w.show(this, true); },
  "resumeGlobalAudios": function(caller){  if (window.pauseGlobalAudiosState == undefined || !(caller in window.pauseGlobalAudiosState)) return; var audiosPaused = window.pauseGlobalAudiosState[caller]; delete window.pauseGlobalAudiosState[caller]; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = audiosPaused.length-1; j>=0; --j) { var a = audiosPaused[j]; if(objAudios.indexOf(a) != -1) audiosPaused.splice(j, 1); } } for (var i = 0, count = audiosPaused.length; i<count; ++i) { var a = audiosPaused[i]; if (a.get('state') == 'paused') a.play(); } },
  "playGlobalAudioWhilePlay": function(playList, index, audio, endCallback, stopBackgroundAudio){  var changeFunction = function(event){ if(event.data.previousSelectedIndex == index){ this.stopGlobalAudio(audio); if(isPanorama) { var media = playListItem.get('media'); var audios = media.get('audios'); audios.splice(audios.indexOf(audio), 1); media.set('audios', audios); } playList.unbind('change', changeFunction, this); if(endCallback) endCallback(); } }; var audios = window.currentGlobalAudios; if(audios && audio.get('id') in audios){ audio = audios[audio.get('id')].audio; if(audio.get('state') != 'playing'){ audio.play(); } return audio; } playList.bind('change', changeFunction, this); var playListItem = playList.get('items')[index]; var isPanorama = playListItem.get('class') == 'PanoramaPlayListItem'; if(isPanorama) { var media = playListItem.get('media'); var audios = (media.get('audios') || []).slice(); if(audio.get('class') == 'MediaAudio') { var panoramaAudio = this.rootPlayer.createInstance('PanoramaAudio'); panoramaAudio.set('autoplay', false); panoramaAudio.set('audio', audio.get('audio')); panoramaAudio.set('loop', audio.get('loop')); panoramaAudio.set('id', audio.get('id')); var stateChangeFunctions = audio.getBindings('stateChange'); for(var i = 0; i<stateChangeFunctions.length; ++i){ var f = stateChangeFunctions[i]; if(typeof f == 'string') f = new Function('event', f); panoramaAudio.bind('stateChange', f, this); } audio = panoramaAudio; } audios.push(audio); media.set('audios', audios); } var src = this.playGlobalAudio(audio, endCallback); if(stopBackgroundAudio === true){ var stateChangeFunc = function(){ if(src.get('state') == 'playing'){ this.pauseGlobalAudios(src.get('id'), [src]); } else { this.resumeGlobalAudios(src.get('id')); src.unbind('stateChange', stateChangeFunc, this); } }; src.bind('stateChange', stateChangeFunc, this); } return src; },
  "setStartTimeVideo": function(video, time){  var items = this.getPlayListItems(video); var startTimeBackup = []; var restoreStartTimeFunc = function() { for(var i = 0; i<items.length; ++i){ var item = items[i]; item.set('startTime', startTimeBackup[i]); item.unbind('stop', restoreStartTimeFunc, this); } }; for(var i = 0; i<items.length; ++i) { var item = items[i]; var player = item.get('player'); if(player.get('video') == video && player.get('state') == 'playing') { player.seek(time); } else { startTimeBackup.push(item.get('startTime')); item.set('startTime', time); item.bind('stop', restoreStartTimeFunc, this); } } },
  "setEndToItemIndex": function(playList, fromIndex, toIndex){  var endFunction = function(){ if(playList.get('selectedIndex') == fromIndex) playList.set('selectedIndex', toIndex); }; this.executeFunctionWhenChange(playList, fromIndex, endFunction); },
  "unregisterKey": function(key){  delete window[key]; },
  "pauseGlobalAudios": function(caller, exclude){  if (window.pauseGlobalAudiosState == undefined) window.pauseGlobalAudiosState = {}; if (window.pauseGlobalAudiosList == undefined) window.pauseGlobalAudiosList = []; if (caller in window.pauseGlobalAudiosState) { return; } var audios = this.getByClassName('Audio').concat(this.getByClassName('VideoPanoramaOverlay')); if (window.currentGlobalAudios != undefined) audios = audios.concat(Object.values(window.currentGlobalAudios).map(function(v) { return v.audio })); var audiosPaused = []; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = 0; j<objAudios.length; ++j) { var a = objAudios[j]; if(audiosPaused.indexOf(a) == -1) audiosPaused.push(a); } } window.pauseGlobalAudiosState[caller] = audiosPaused; for (var i = 0, count = audios.length; i < count; ++i) { var a = audios[i]; if (a.get('state') == 'playing' && (exclude == undefined || exclude.indexOf(a) == -1)) { a.pause(); audiosPaused.push(a); } } },
  "keepCompVisible": function(component, keep){  var key = 'keepVisibility_' + component.get('id'); var value = this.getKey(key); if(value == undefined && keep) { this.registerKey(key, keep); } else if(value != undefined && !keep) { this.unregisterKey(key); } },
  "syncPlaylists": function(playLists){  var changeToMedia = function(media, playListDispatched){ for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(playList != playListDispatched){ var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ if(items[j].get('media') == media){ if(playList.get('selectedIndex') != j){ playList.set('selectedIndex', j); } break; } } } } }; var changeFunction = function(event){ var playListDispatched = event.source; var selectedIndex = playListDispatched.get('selectedIndex'); if(selectedIndex < 0) return; var media = playListDispatched.get('items')[selectedIndex].get('media'); changeToMedia(media, playListDispatched); }; var mapPlayerChangeFunction = function(event){ var panoramaMapLocation = event.source.get('panoramaMapLocation'); if(panoramaMapLocation){ var map = panoramaMapLocation.get('map'); changeToMedia(map); } }; for(var i = 0, count = playLists.length; i<count; ++i){ playLists[i].bind('change', changeFunction, this); } var mapPlayers = this.getByClassName('MapPlayer'); for(var i = 0, count = mapPlayers.length; i<count; ++i){ mapPlayers[i].bind('panoramaMapLocation_change', mapPlayerChangeFunction, this); } },
  "historyGoBack": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.back(); } },
  "existsKey": function(key){  return key in window; },
  "executeFunctionWhenChange": function(playList, index, endFunction, changeFunction){  var endObject = undefined; var changePlayListFunction = function(event){ if(event.data.previousSelectedIndex == index){ if(changeFunction) changeFunction.call(this); if(endFunction && endObject) endObject.unbind('end', endFunction, this); playList.unbind('change', changePlayListFunction, this); } }; if(endFunction){ var playListItem = playList.get('items')[index]; if(playListItem.get('class') == 'PanoramaPlayListItem'){ var camera = playListItem.get('camera'); if(camera != undefined) endObject = camera.get('initialSequence'); if(endObject == undefined) endObject = camera.get('idleSequence'); } else{ endObject = playListItem.get('media'); } if(endObject){ endObject.bind('end', endFunction, this); } } playList.bind('change', changePlayListFunction, this); },
  "getPanoramaOverlayByName": function(panorama, name){  var overlays = this.getOverlays(panorama); for(var i = 0, count = overlays.length; i<count; ++i){ var overlay = overlays[i]; var data = overlay.get('data'); if(data != undefined && data.label == name){ return overlay; } } return undefined; },
  "playGlobalAudio": function(audio, endCallback, asBackground){  var endFunction = function(){ audio.unbind('end', endFunction, this); this.stopGlobalAudio(audio); if(endCallback) endCallback(); }; audio = this.getGlobalAudio(audio); var audios = window.currentGlobalAudios; if(!audios){ audios = window.currentGlobalAudios = {}; } audios[audio.get('id')] = {'audio': audio, 'asBackground': asBackground || false}; if(audio.get('state') == 'playing'){ return audio; } if(!audio.get('loop')){ audio.bind('end', endFunction, this); } audio.play(); return audio; },
  "getGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios != undefined && audio.get('id') in audios){ audio = audios[audio.get('id')].audio; } return audio; },
  "getOverlays": function(media){  switch(media.get('class')){ case 'Panorama': var overlays = media.get('overlays').concat() || []; var frames = media.get('frames'); for(var j = 0; j<frames.length; ++j){ overlays = overlays.concat(frames[j].get('overlays') || []); } return overlays; case 'Video360': case 'Map': return media.get('overlays') || []; default: return []; } },
  "getPixels": function(value){  var result = new RegExp('((\\+|\\-)?\\d+(\\.\\d*)?)(px|vw|vh|vmin|vmax)?', 'i').exec(value); if (result == undefined) { return 0; } var num = parseFloat(result[1]); var unit = result[4]; var vw = this.rootPlayer.get('actualWidth') / 100; var vh = this.rootPlayer.get('actualHeight') / 100; switch(unit) { case 'vw': return num * vw; case 'vh': return num * vh; case 'vmin': return num * Math.min(vw, vh); case 'vmax': return num * Math.max(vw, vh); default: return num; } },
  "resumePlayers": function(players, onlyResumeCameraIfPanorama){  for(var i = 0; i<players.length; ++i){ var player = players[i]; if(onlyResumeCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.resumeCamera(); } else{ player.play(); } } },
  "showPopupPanoramaOverlay": function(popupPanoramaOverlay, closeButtonProperties, imageHD, toggleImage, toggleImageHD, autoCloseMilliSeconds, audio, stopBackgroundAudio){  var self = this; this.MainViewer.set('toolTipEnabled', false); var cardboardEnabled = this.isCardboardViewMode(); if(!cardboardEnabled) { var zoomImage = this.zoomImagePopupPanorama; var showDuration = popupPanoramaOverlay.get('showDuration'); var hideDuration = popupPanoramaOverlay.get('hideDuration'); var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); var popupMaxWidthBackup = popupPanoramaOverlay.get('popupMaxWidth'); var popupMaxHeightBackup = popupPanoramaOverlay.get('popupMaxHeight'); var showEndFunction = function() { var loadedFunction = function(){ if(!self.isCardboardViewMode()) popupPanoramaOverlay.set('visible', false); }; popupPanoramaOverlay.unbind('showEnd', showEndFunction, self); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', 1); self.showPopupImage(imageHD, toggleImageHD, popupPanoramaOverlay.get('popupMaxWidth'), popupPanoramaOverlay.get('popupMaxHeight'), null, null, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedFunction, hideFunction); }; var hideFunction = function() { var restoreShowDurationFunction = function(){ popupPanoramaOverlay.unbind('showEnd', restoreShowDurationFunction, self); popupPanoramaOverlay.set('visible', false); popupPanoramaOverlay.set('showDuration', showDuration); popupPanoramaOverlay.set('popupMaxWidth', popupMaxWidthBackup); popupPanoramaOverlay.set('popupMaxHeight', popupMaxHeightBackup); }; self.resumePlayers(playersPaused, audio == null || !stopBackgroundAudio); var currentWidth = zoomImage.get('imageWidth'); var currentHeight = zoomImage.get('imageHeight'); popupPanoramaOverlay.bind('showEnd', restoreShowDurationFunction, self, true); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', hideDuration); popupPanoramaOverlay.set('popupMaxWidth', currentWidth); popupPanoramaOverlay.set('popupMaxHeight', currentHeight); if(popupPanoramaOverlay.get('visible')) restoreShowDurationFunction(); else popupPanoramaOverlay.set('visible', true); self.MainViewer.set('toolTipEnabled', true); }; if(!imageHD){ imageHD = popupPanoramaOverlay.get('image'); } if(!toggleImageHD && toggleImage){ toggleImageHD = toggleImage; } popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); } else { var hideEndFunction = function() { self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } popupPanoramaOverlay.unbind('hideEnd', hideEndFunction, self); self.MainViewer.set('toolTipEnabled', true); }; var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } popupPanoramaOverlay.bind('hideEnd', hideEndFunction, this, true); } popupPanoramaOverlay.set('visible', true); },
  "getComponentByName": function(name){  var list = this.getByClassName('UIComponent'); for(var i = 0, count = list.length; i<count; ++i){ var component = list[i]; var data = component.get('data'); if(data != undefined && data.name == name){ return component; } } return undefined; },
  "setCameraSameSpotAsMedia": function(camera, media){  var player = this.getCurrentPlayerWithMedia(media); if(player != undefined) { var position = camera.get('initialPosition'); position.set('yaw', player.get('yaw')); position.set('pitch', player.get('pitch')); position.set('hfov', player.get('hfov')); } },
  "pauseCurrentPlayers": function(onlyPauseCameraIfPanorama){  var players = this.getCurrentPlayers(); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('state') == 'playing') { if(onlyPauseCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.pauseCamera(); } else { player.pause(); } } else { players.splice(i, 1); } } return players; },
  "getMediaByName": function(name){  var list = this.getByClassName('Media'); for(var i = 0, count = list.length; i<count; ++i){ var media = list[i]; if((media.get('class') == 'Audio' && media.get('data').label == name) || media.get('label') == name){ return media; } } return undefined; },
  "_initItemWithComps": function(playList, index, components, eventName, visible, effectToApply, delay, restoreStateAt){  var item = playList.get('items')[index]; var registerVisibility = restoreStateAt > 0; var rootPlayer = this.rootPlayer; var cloneEffect = function(visible) { var klass = effectToApply ? effectToApply.get('class') : undefined; var effect = undefined; switch(klass) { case 'FadeInEffect': case 'FadeOutEffect': effect = rootPlayer.createInstance(visible ? 'FadeInEffect' : 'FadeOutEffect'); break; case 'SlideInEffect': case 'SlideOutEffect': effect = rootPlayer.createInstance(visible ? 'SlideInEffect' : 'SlideOutEffect'); break; } if(effect){ effect.set('duration', effectToApply.get('duration')); effect.set('easing', effectToApply.get('easing')); if(klass.indexOf('Slide') != -1) effect.set(visible ? 'from' : 'to', effectToApply.get(visible ? 'from' : 'to')); } return effect; }; var endFunc = function() { for(var i = 0, count = components.length; i<count; ++i) { var component = components[i]; if(restoreStateAt > 0){ this.setComponentVisibility(component, !visible, 0, cloneEffect(!visible)); } else { var key = 'visibility_' + component.get('id'); if(this.existsKey(key)) { if(this.getKey(key)) this.setComponentVisibility(component, true, 0, cloneEffect(true)); else this.setComponentVisibility(component, false, 0, cloneEffect(false)); this.unregisterKey(key); } } } item.unbind('end', endFunc, this); if(addMediaEndEvent) media.unbind('end', endFunc, this); }; var stopFunc = function() { item.unbind('stop', stopFunc, this, true); item.unbind('stop', stopFunc, this); item.unbind('begin', stopFunc, this, true); item.unbind('begin', stopFunc, this); for(var i = 0, count = components.length; i<count; ++i) { this.keepCompVisible(components[i], false); } }; var addEvent = function(eventName, delay, restoreStateAt){ var changeFunc = function(){ var changeVisibility = function(component, visible, effect) { rootPlayer.setComponentVisibility(component, visible, delay, effect, visible ? 'showEffect' : 'hideEffect', false); if(restoreStateAt > 0){ var time = delay + restoreStateAt + (effect != undefined ? effect.get('duration') : 0); rootPlayer.setComponentVisibility(component, !visible, time, cloneEffect(!visible), visible ? 'hideEffect' : 'showEffect', true); } }; for(var i = 0, count = components.length; i<count; ++i){ var component = components[i]; if(visible == 'toggle'){ if(!component.get('visible')) changeVisibility(component, true, cloneEffect(true)); else changeVisibility(component, false, cloneEffect(false)); } else { changeVisibility(component, visible, cloneEffect(visible)); } } item.unbind(eventName, changeFunc, this); }; item.bind(eventName, changeFunc, this) }; if(eventName == 'begin'){ for(var i = 0, count = components.length; i<count; ++i){ var component = components[i]; this.keepCompVisible(component, true); if(registerVisibility) { var key = 'visibility_' + component.get('id'); this.registerKey(key, component.get('visible')); } } item.bind('stop', stopFunc, this, true); item.bind('stop', stopFunc, this); item.bind('begin', stopFunc, this, true); item.bind('begin', stopFunc, this); if(registerVisibility){ item.bind('end', endFunc, this); var media = item.get('media'); var addMediaEndEvent = media.get('loop') != undefined && !(media.get('loop')); if(addMediaEndEvent) media.bind('end', endFunc, this); } } else if(eventName == 'end' && restoreStateAt > 0){ addEvent('begin', restoreStateAt, 0); restoreStateAt = 0; } if(eventName != undefined) addEvent(eventName, delay, restoreStateAt); },
  "getActivePlayerWithViewer": function(viewerArea){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); players = players.concat(this.getByClassName('MapPlayer')); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('viewerArea') == viewerArea) { var playerClass = player.get('class'); if(playerClass == 'PanoramaPlayer' && (player.get('panorama') != undefined || player.get('video') != undefined)) return player; else if((playerClass == 'VideoPlayer' || playerClass == 'Video360Player') && player.get('video') != undefined) return player; else if(playerClass == 'PhotoAlbumPlayer' && player.get('photoAlbum') != undefined) return player; else if(playerClass == 'MapPlayer' && player.get('map') != undefined) return player; } } return undefined; },
  "registerKey": function(key, value){  window[key] = value; },
  "setComponentVisibility": function(component, visible, applyAt, effect, propertyEffect, ignoreClearTimeout){  var keepVisibility = this.getKey('keepVisibility_' + component.get('id')); if(keepVisibility) return; this.unregisterKey('visibility_'+component.get('id')); var changeVisibility = function(){ if(effect && propertyEffect){ component.set(propertyEffect, effect); } component.set('visible', visible); if(component.get('class') == 'ViewerArea'){ try{ if(visible) component.restart(); else if(component.get('playbackState') == 'playing') component.pause(); } catch(e){}; } }; var effectTimeoutName = 'effectTimeout_'+component.get('id'); if(!ignoreClearTimeout && window.hasOwnProperty(effectTimeoutName)){ var effectTimeout = window[effectTimeoutName]; if(effectTimeout instanceof Array){ for(var i=0; i<effectTimeout.length; i++){ clearTimeout(effectTimeout[i]) } }else{ clearTimeout(effectTimeout); } delete window[effectTimeoutName]; } else if(visible == component.get('visible') && !ignoreClearTimeout) return; if(applyAt && applyAt > 0){ var effectTimeout = setTimeout(function(){ if(window[effectTimeoutName] instanceof Array) { var arrayTimeoutVal = window[effectTimeoutName]; var index = arrayTimeoutVal.indexOf(effectTimeout); arrayTimeoutVal.splice(index, 1); if(arrayTimeoutVal.length == 0){ delete window[effectTimeoutName]; } }else{ delete window[effectTimeoutName]; } changeVisibility(); }, applyAt); if(window.hasOwnProperty(effectTimeoutName)){ window[effectTimeoutName] = [window[effectTimeoutName], effectTimeout]; }else{ window[effectTimeoutName] = effectTimeout; } } else{ changeVisibility(); } },
  "showWindow": function(w, autoCloseMilliSeconds, containsAudio){  if(w.get('visible') == true){ return; } var closeFunction = function(){ clearAutoClose(); this.resumePlayers(playersPaused, !containsAudio); w.unbind('close', closeFunction, this); }; var clearAutoClose = function(){ w.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ w.hide(); }; w.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } var playersPaused = this.pauseCurrentPlayers(!containsAudio); w.bind('close', closeFunction, this); w.show(this, true); },
  "getMediaWidth": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxW=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('width') > maxW) maxW = r.get('width'); } return maxW; }else{ return r.get('width') } default: return media.get('width'); } },
  "updateVideoCues": function(playList, index){  var playListItem = playList.get('items')[index]; var video = playListItem.get('media'); if(video.get('cues').length == 0) return; var player = playListItem.get('player'); var cues = []; var changeFunction = function(){ if(playList.get('selectedIndex') != index){ video.unbind('cueChange', cueChangeFunction, this); playList.unbind('change', changeFunction, this); } }; var cueChangeFunction = function(event){ var activeCues = event.data.activeCues; for(var i = 0, count = cues.length; i<count; ++i){ var cue = cues[i]; if(activeCues.indexOf(cue) == -1 && (cue.get('startTime') > player.get('currentTime') || cue.get('endTime') < player.get('currentTime')+0.5)){ cue.trigger('end'); } } cues = activeCues; }; video.bind('cueChange', cueChangeFunction, this); playList.bind('change', changeFunction, this); },
  "autotriggerAtStart": function(playList, callback, once){  var onChange = function(event){ callback(); if(once == true) playList.unbind('change', onChange, this); }; playList.bind('change', onChange, this); },
  "setMediaBehaviour": function(playList, index, mediaDispatcher){  var self = this; var stateChangeFunction = function(event){ if(event.data.state == 'stopped'){ dispose.call(this, true); } }; var onBeginFunction = function() { item.unbind('begin', onBeginFunction, self); var media = item.get('media'); if(media.get('class') != 'Panorama' || (media.get('camera') != undefined && media.get('camera').get('initialSequence') != undefined)){ player.bind('stateChange', stateChangeFunction, self); } }; var changeFunction = function(){ var index = playListDispatcher.get('selectedIndex'); if(index != -1){ indexDispatcher = index; dispose.call(this, false); } }; var disposeCallback = function(){ dispose.call(this, false); }; var dispose = function(forceDispose){ if(!playListDispatcher) return; var media = item.get('media'); if((media.get('class') == 'Video360' || media.get('class') == 'Video') && media.get('loop') == true && !forceDispose) return; playList.set('selectedIndex', -1); if(panoramaSequence && panoramaSequenceIndex != -1){ if(panoramaSequence) { if(panoramaSequenceIndex > 0 && panoramaSequence.get('movements')[panoramaSequenceIndex-1].get('class') == 'TargetPanoramaCameraMovement'){ var initialPosition = camera.get('initialPosition'); var oldYaw = initialPosition.get('yaw'); var oldPitch = initialPosition.get('pitch'); var oldHfov = initialPosition.get('hfov'); var previousMovement = panoramaSequence.get('movements')[panoramaSequenceIndex-1]; initialPosition.set('yaw', previousMovement.get('targetYaw')); initialPosition.set('pitch', previousMovement.get('targetPitch')); initialPosition.set('hfov', previousMovement.get('targetHfov')); var restoreInitialPositionFunction = function(event){ initialPosition.set('yaw', oldYaw); initialPosition.set('pitch', oldPitch); initialPosition.set('hfov', oldHfov); itemDispatcher.unbind('end', restoreInitialPositionFunction, this); }; itemDispatcher.bind('end', restoreInitialPositionFunction, this); } panoramaSequence.set('movementIndex', panoramaSequenceIndex); } } if(player){ item.unbind('begin', onBeginFunction, this); player.unbind('stateChange', stateChangeFunction, this); for(var i = 0; i<buttons.length; ++i) { buttons[i].unbind('click', disposeCallback, this); } } if(sameViewerArea){ var currentMedia = this.getMediaFromPlayer(player); if(currentMedia == undefined || currentMedia == item.get('media')){ playListDispatcher.set('selectedIndex', indexDispatcher); } if(playList != playListDispatcher) playListDispatcher.unbind('change', changeFunction, this); } else{ viewerArea.set('visible', viewerVisibility); } playListDispatcher = undefined; }; if(!mediaDispatcher){ var currentIndex = playList.get('selectedIndex'); var currentPlayer = (currentIndex != -1) ? playList.get('items')[playList.get('selectedIndex')].get('player') : this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer) { mediaDispatcher = this.getMediaFromPlayer(currentPlayer); } } var playListDispatcher = undefined; if(mediaDispatcher){ var playListsWithMedia = this.getPlayListsWithMedia(mediaDispatcher, true); playListDispatcher = playListsWithMedia.indexOf(playList) != -1 ? playList : (playListsWithMedia.length > 0 ? playListsWithMedia[0] : undefined); } if(!playListDispatcher){ playList.set('selectedIndex', index); return; } var indexDispatcher = playListDispatcher.get('selectedIndex'); if(playList.get('selectedIndex') == index || indexDispatcher == -1){ return; } var item = playList.get('items')[index]; var itemDispatcher = playListDispatcher.get('items')[indexDispatcher]; var player = item.get('player'); var viewerArea = player.get('viewerArea'); var viewerVisibility = viewerArea.get('visible'); var sameViewerArea = viewerArea == itemDispatcher.get('player').get('viewerArea'); if(sameViewerArea){ if(playList != playListDispatcher){ playListDispatcher.set('selectedIndex', -1); playListDispatcher.bind('change', changeFunction, this); } } else{ viewerArea.set('visible', true); } var panoramaSequenceIndex = -1; var panoramaSequence = undefined; var camera = itemDispatcher.get('camera'); if(camera){ panoramaSequence = camera.get('initialSequence'); if(panoramaSequence) { panoramaSequenceIndex = panoramaSequence.get('movementIndex'); } } playList.set('selectedIndex', index); var buttons = []; var addButtons = function(property){ var value = player.get(property); if(value == undefined) return; if(Array.isArray(value)) buttons = buttons.concat(value); else buttons.push(value); }; addButtons('buttonStop'); for(var i = 0; i<buttons.length; ++i) { buttons[i].bind('click', disposeCallback, this); } item.bind('begin', onBeginFunction, self); this.executeFunctionWhenChange(playList, index, disposeCallback);  },
  "showPopupImage": function(image, toggleImage, customWidth, customHeight, showEffect, hideEffect, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedCallback, hideCallback){  var self = this; var closed = false; var playerClickFunction = function() { zoomImage.unbind('loaded', loadedFunction, self); hideFunction(); }; var clearAutoClose = function(){ zoomImage.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var resizeFunction = function(){ setTimeout(setCloseButtonPosition, 0); }; var loadedFunction = function(){ self.unbind('click', playerClickFunction, self); veil.set('visible', true); setCloseButtonPosition(); closeButton.set('visible', true); zoomImage.unbind('loaded', loadedFunction, this); zoomImage.bind('userInteractionStart', userInteractionStartFunction, this); zoomImage.bind('userInteractionEnd', userInteractionEndFunction, this); zoomImage.bind('resize', resizeFunction, this); timeoutID = setTimeout(timeoutFunction, 200); }; var timeoutFunction = function(){ timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ hideFunction(); }; zoomImage.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } zoomImage.bind('backgroundClick', hideFunction, this); if(toggleImage) { zoomImage.bind('click', toggleFunction, this); zoomImage.set('imageCursor', 'hand'); } closeButton.bind('click', hideFunction, this); if(loadedCallback) loadedCallback(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); closed = true; if(timeoutID) clearTimeout(timeoutID); if (timeoutUserInteractionID) clearTimeout(timeoutUserInteractionID); if(autoCloseMilliSeconds) clearAutoClose(); if(hideCallback) hideCallback(); zoomImage.set('visible', false); if(hideEffect && hideEffect.get('duration') > 0){ hideEffect.bind('end', endEffectFunction, this); } else{ zoomImage.set('image', null); } closeButton.set('visible', false); veil.set('visible', false); self.unbind('click', playerClickFunction, self); zoomImage.unbind('backgroundClick', hideFunction, this); zoomImage.unbind('userInteractionStart', userInteractionStartFunction, this); zoomImage.unbind('userInteractionEnd', userInteractionEndFunction, this, true); zoomImage.unbind('resize', resizeFunction, this); if(toggleImage) { zoomImage.unbind('click', toggleFunction, this); zoomImage.set('cursor', 'default'); } closeButton.unbind('click', hideFunction, this); self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } }; var endEffectFunction = function() { zoomImage.set('image', null); hideEffect.unbind('end', endEffectFunction, this); }; var toggleFunction = function() { zoomImage.set('image', isToggleVisible() ? image : toggleImage); }; var isToggleVisible = function() { return zoomImage.get('image') == toggleImage; }; var setCloseButtonPosition = function() { var right = zoomImage.get('actualWidth') - zoomImage.get('imageLeft') - zoomImage.get('imageWidth') + 10; var top = zoomImage.get('imageTop') + 10; if(right < 10) right = 10; if(top < 10) top = 10; closeButton.set('right', right); closeButton.set('top', top); }; var userInteractionStartFunction = function() { if(timeoutUserInteractionID){ clearTimeout(timeoutUserInteractionID); timeoutUserInteractionID = undefined; } else{ closeButton.set('visible', false); } }; var userInteractionEndFunction = function() { if(!closed){ timeoutUserInteractionID = setTimeout(userInteractionTimeoutFunction, 300); } }; var userInteractionTimeoutFunction = function() { timeoutUserInteractionID = undefined; closeButton.set('visible', true); setCloseButtonPosition(); }; this.MainViewer.set('toolTipEnabled', false); var veil = this.veilPopupPanorama; var zoomImage = this.zoomImagePopupPanorama; var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } var timeoutID = undefined; var timeoutUserInteractionID = undefined; zoomImage.bind('loaded', loadedFunction, this); setTimeout(function(){ self.bind('click', playerClickFunction, self, false); }, 0); zoomImage.set('image', image); zoomImage.set('customWidth', customWidth); zoomImage.set('customHeight', customHeight); zoomImage.set('showEffect', showEffect); zoomImage.set('hideEffect', hideEffect); zoomImage.set('visible', true); return zoomImage; },
  "setOverlayBehaviour": function(overlay, media, action, preventDoubleClick){  var executeFunc = function() { switch(action){ case 'triggerClick': this.triggerOverlay(overlay, 'click'); break; case 'stop': case 'play': case 'pause': overlay[action](); break; case 'togglePlayPause': case 'togglePlayStop': if(overlay.get('state') == 'playing') overlay[action == 'togglePlayPause' ? 'pause' : 'stop'](); else overlay.play(); break; } if(preventDoubleClick){ if(window.overlaysDispatched == undefined) window.overlaysDispatched = {}; var id = overlay.get('id'); window.overlaysDispatched[id] = true; setTimeout(function(){ delete window.overlaysDispatched[id]; }, 1000); } }; if(preventDoubleClick && window.overlaysDispatched != undefined && overlay.get('id') in window.overlaysDispatched) return; var playList = this.getFirstPlayListWithMedia(media, true); if(playList != undefined){ var item = this.getPlayListItemByMedia(playList, media); if(playList.get('items').indexOf(item) != playList.get('selectedIndex')){ var beginFunc = function(e){ item.unbind('begin', beginFunc, this); executeFunc.call(this); }; item.bind('begin', beginFunc, this); return; } } executeFunc.call(this); },
  "getPlayListsWithMedia": function(media, onlySelected){  var result = []; var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(onlySelected && playList.get('selectedIndex') == -1) continue; if(this.getPlayListItemByMedia(playList, media) != undefined) result.push(playList); } return result; },
  "loopAlbum": function(playList, index){  var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var loopFunction = function(){ player.play(); }; this.executeFunctionWhenChange(playList, index, loopFunction); },
  "showComponentsWhileMouseOver": function(parentComponent, components, durationVisibleWhileOut){  var setVisibility = function(visible){ for(var i = 0, length = components.length; i<length; i++){ var component = components[i]; if(component.get('class') == 'HTMLText' && (component.get('html') == '' || component.get('html') == undefined)) { continue; } component.set('visible', visible); } }; if (this.rootPlayer.get('touchDevice') == true){ setVisibility(true); } else { var timeoutID = -1; var rollOverFunction = function(){ setVisibility(true); if(timeoutID >= 0) clearTimeout(timeoutID); parentComponent.unbind('rollOver', rollOverFunction, this); parentComponent.bind('rollOut', rollOutFunction, this); }; var rollOutFunction = function(){ var timeoutFunction = function(){ setVisibility(false); parentComponent.unbind('rollOver', rollOverFunction, this); }; parentComponent.unbind('rollOut', rollOutFunction, this); parentComponent.bind('rollOver', rollOverFunction, this); timeoutID = setTimeout(timeoutFunction, durationVisibleWhileOut); }; parentComponent.bind('rollOver', rollOverFunction, this); } },
  "getPlayListItemByMedia": function(playList, media){  var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media) return item; } return undefined; },
  "stopGlobalAudios": function(onlyForeground){  var audios = window.currentGlobalAudios; var self = this; if(audios){ Object.keys(audios).forEach(function(key){ var data = audios[key]; if(!onlyForeground || (onlyForeground && !data.asBackground)) { self.stopGlobalAudio(data.audio); } }); } },
  "stopAndGoCamera": function(camera, ms){  var sequence = camera.get('initialSequence'); sequence.pause(); var timeoutFunction = function(){ sequence.play(); }; setTimeout(timeoutFunction, ms); },
  "getMediaFromPlayer": function(player){  switch(player.get('class')){ case 'PanoramaPlayer': return player.get('panorama') || player.get('video'); case 'VideoPlayer': case 'Video360Player': return player.get('video'); case 'PhotoAlbumPlayer': return player.get('photoAlbum'); case 'MapPlayer': return player.get('map'); } },
  "getCurrentPlayerWithMedia": function(media){  var playerClass = undefined; var mediaPropertyName = undefined; switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'panorama'; break; case 'Video360': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'video'; break; case 'PhotoAlbum': playerClass = 'PhotoAlbumPlayer'; mediaPropertyName = 'photoAlbum'; break; case 'Map': playerClass = 'MapPlayer'; mediaPropertyName = 'map'; break; case 'Video': playerClass = 'VideoPlayer'; mediaPropertyName = 'video'; break; }; if(playerClass != undefined) { var players = this.getByClassName(playerClass); for(var i = 0; i<players.length; ++i){ var player = players[i]; if(player.get(mediaPropertyName) == media) { return player; } } } else { return undefined; } },
  "getCurrentPlayers": function(){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); return players; },
  "visibleComponentsIfPlayerFlagEnabled": function(components, playerFlag){  var enabled = this.get(playerFlag); for(var i in components){ components[i].set('visible', enabled); } },
  "setMainMediaByIndex": function(index){  var item = undefined; if(index >= 0 && index < this.mainPlayList.get('items').length){ this.mainPlayList.set('selectedIndex', index); item = this.mainPlayList.get('items')[index]; } return item; },
  "getMediaHeight": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxH=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('height') > maxH) maxH = r.get('height'); } return maxH; }else{ return r.get('height') } default: return media.get('height'); } },
  "historyGoForward": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.forward(); } },
  "showPopupPanoramaVideoOverlay": function(popupPanoramaOverlay, closeButtonProperties, stopAudios){  var self = this; var showEndFunction = function() { popupPanoramaOverlay.unbind('showEnd', showEndFunction); closeButton.bind('click', hideFunction, this); setCloseButtonPosition(); closeButton.set('visible', true); }; var endFunction = function() { if(!popupPanoramaOverlay.get('loop')) hideFunction(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); popupPanoramaOverlay.set('visible', false); closeButton.set('visible', false); closeButton.unbind('click', hideFunction, self); popupPanoramaOverlay.unbind('end', endFunction, self); popupPanoramaOverlay.unbind('hideEnd', hideFunction, self, true); self.resumePlayers(playersPaused, true); if(stopAudios) { self.resumeGlobalAudios(); } }; var setCloseButtonPosition = function() { var right = 10; var top = 10; closeButton.set('right', right); closeButton.set('top', top); }; this.MainViewer.set('toolTipEnabled', false); var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(true); if(stopAudios) { this.pauseGlobalAudios(); } popupPanoramaOverlay.bind('end', endFunction, this, true); popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); popupPanoramaOverlay.bind('hideEnd', hideFunction, this, true); popupPanoramaOverlay.set('visible', true); },
  "init": function(){  if(!Object.hasOwnProperty('values')) { Object.values = function(o){ return Object.keys(o).map(function(e) { return o[e]; }); }; } var history = this.get('data')['history']; var playListChangeFunc = function(e){ var playList = e.source; var index = playList.get('selectedIndex'); if(index < 0) return; var id = playList.get('id'); if(!history.hasOwnProperty(id)) history[id] = new HistoryData(playList); history[id].add(index); }; var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i) { var playList = playLists[i]; playList.bind('change', playListChangeFunc, this); } },
  "fixTogglePlayPauseButton": function(player){  var state = player.get('state'); var buttons = player.get('buttonPlayPause'); if(typeof buttons !== 'undefined' && player.get('state') == 'playing'){ if(!Array.isArray(buttons)) buttons = [buttons]; for(var i = 0; i<buttons.length; ++i) buttons[i].set('pressed', true); } },
  "triggerOverlay": function(overlay, eventName){  if(overlay.get('areas') != undefined) { var areas = overlay.get('areas'); for(var i = 0; i<areas.length; ++i) { areas[i].trigger(eventName); } } else { overlay.trigger(eventName); } },
  "loadFromCurrentMediaPlayList": function(playList, delta){  var currentIndex = playList.get('selectedIndex'); var totalItems = playList.get('items').length; var newIndex = (currentIndex + delta) % totalItems; while(newIndex < 0){ newIndex = totalItems + newIndex; }; if(currentIndex != newIndex){ playList.set('selectedIndex', newIndex); } },
  "setPanoramaCameraWithSpot": function(playListItem, yaw, pitch){  var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); var initialPosition = newCamera.get('initialPosition'); initialPosition.set('yaw', yaw); initialPosition.set('pitch', pitch); this.startPanoramaWithCamera(panorama, newCamera); },
  "getKey": function(key){  return window[key]; },
  "pauseGlobalAudiosWhilePlayItem": function(playList, index, exclude){  var self = this; var item = playList.get('items')[index]; var media = item.get('media'); var player = item.get('player'); var caller = media.get('id'); var endFunc = function(){ if(playList.get('selectedIndex') != index) { if(hasState){ player.unbind('stateChange', stateChangeFunc, self); } self.resumeGlobalAudios(caller); } }; var stateChangeFunc = function(event){ var state = event.data.state; if(state == 'stopped'){ this.resumeGlobalAudios(caller); } else if(state == 'playing'){ this.pauseGlobalAudios(caller, exclude); } }; var mediaClass = media.get('class'); var hasState = mediaClass == 'Video360' || mediaClass == 'Video'; if(hasState){ player.bind('stateChange', stateChangeFunc, this); } this.pauseGlobalAudios(caller, exclude); this.executeFunctionWhenChange(playList, index, endFunc, endFunc); },
  "setPanoramaCameraWithCurrentSpot": function(playListItem){  var currentPlayer = this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer == undefined){ return; } var playerClass = currentPlayer.get('class'); if(playerClass != 'PanoramaPlayer' && playerClass != 'Video360Player'){ return; } var fromMedia = currentPlayer.get('panorama'); if(fromMedia == undefined) { fromMedia = currentPlayer.get('video'); } var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, fromMedia); this.startPanoramaWithCamera(panorama, newCamera); },
  "getFirstPlayListWithMedia": function(media, onlySelected){  var playLists = this.getPlayListsWithMedia(media, onlySelected); return playLists.length > 0 ? playLists[0] : undefined; },
  "changeBackgroundWhilePlay": function(playList, index, color){  var stopFunction = function(event){ playListItem.unbind('stop', stopFunction, this); if((color == viewerArea.get('backgroundColor')) && (colorRatios == viewerArea.get('backgroundColorRatios'))){ viewerArea.set('backgroundColor', backgroundColorBackup); viewerArea.set('backgroundColorRatios', backgroundColorRatiosBackup); } }; var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var viewerArea = player.get('viewerArea'); var backgroundColorBackup = viewerArea.get('backgroundColor'); var backgroundColorRatiosBackup = viewerArea.get('backgroundColorRatios'); var colorRatios = [0]; if((color != backgroundColorBackup) || (colorRatios != backgroundColorRatiosBackup)){ viewerArea.set('backgroundColor', color); viewerArea.set('backgroundColorRatios', colorRatios); playListItem.bind('stop', stopFunction, this); } },
  "playAudioList": function(audios){  if(audios.length == 0) return; var currentAudioCount = -1; var currentAudio; var playGlobalAudioFunction = this.playGlobalAudio; var playNext = function(){ if(++currentAudioCount >= audios.length) currentAudioCount = 0; currentAudio = audios[currentAudioCount]; playGlobalAudioFunction(currentAudio, playNext, true); }; playNext(); },
  "registerTextVariable": function(obj){  var property = (function() { switch (obj.get('class')) { case 'Label': return 'text'; case 'Button': case 'BaseButton': return 'label'; case 'HTMLText': return 'html'; } })(); if (property == undefined) return; var re = new RegExp('\\{\\{\\s*(\\w+)\\s*\\}\\}', 'g'); var text = obj.get(property); var data = obj.get('data') || {}; data[property] = text; obj.set('data', data); var updateLabel = function(vars) { var text = data[property]; for (var i = 0; i < vars.length; ++i) { var info = vars[i]; var dispatchers = info.dispatchers; for (var j = 0; j < dispatchers.length; ++j) { var dispatcher = dispatchers[j]; var index = dispatcher.get('selectedIndex'); if (index >= 0) { var srcPropArray = info.src.split('.'); var src = dispatcher.get('items')[index]; if(src == undefined || (info.itemCondition !== undefined && !info.itemCondition.call(this, src))) continue; for (var z = 0; z < srcPropArray.length; ++z) src = 'get' in src ? src.get(srcPropArray[z]) : src[srcPropArray[z]]; text = text.replace(info.replace, src); } } } if(text != data[property]) obj.set(property, text); }; var vars = []; var addVars = function(dispatchers, eventName, src, replace, itemCondition) { vars.push({ 'dispatchers': dispatchers, 'eventName': eventName, 'src': src, 'replace': replace, 'itemCondition': itemCondition }); }; var viewerAreaItemCondition = function(item) { var player = item.get('player'); return player !== undefined && player.get('viewerArea') == this.MainViewer; }; while (null != (result = re.exec(text))) { switch (result[1]) { case 'title': var playLists = this._getPlayListsWithViewer(this.MainViewer); addVars(playLists, 'change', 'media.label', result[0], viewerAreaItemCondition); break; case 'subtitle': var playLists = this._getPlayListsWithViewer(this.MainViewer); addVars(playLists, 'change', 'media.data.subtitle', result[0], viewerAreaItemCondition); break; } } if (vars.length > 0) { var func = updateLabel.bind(this, vars); for (var i = 0; i < vars.length; ++i) { var info = vars[i]; var dispatchers = info.dispatchers; for (var j = 0; j < dispatchers.length; ++j) dispatchers[j].bind(info.eventName, func, this); } } },
  "cloneCamera": function(camera){  var newCamera = this.rootPlayer.createInstance(camera.get('class')); newCamera.set('id', camera.get('id') + '_copy'); newCamera.set('idleSequence', camera.get('initialSequence')); return newCamera; },
  "_getPlayListsWithViewer": function(viewer){  var playLists = this.getByClassName('PlayList'); var containsViewer = function(playList) { var items = playList.get('items'); for(var j=items.length-1; j>=0; --j) { var item = items[j]; var player = item.get('player'); if(player !== undefined && player.get('viewerArea') == viewer) return true; } return false; }; for(var i=playLists.length-1; i>=0; --i) { if(!containsViewer(playLists[i])) playLists.splice(i, 1); } return playLists; }
 },
 "scrollBarWidth": 10,
 "id": "rootPlayer",
 "vrPolyfillScale": 0.5,
 "width": "100%",
 "borderRadius": 0,
 "gap": 10,
 "children": [
  "this.MainViewer_mobile",
  "this.HTMLText_6BDD8039_64A6_31E4_41D7_D3C38C6C69F2_mobile",
  "this.HTMLText_524CEEAF_7E31_E3D9_41D5_A18634B5A288_mobile",
  "this.Container_2E6121EE_347D_0EFC_41AD_FCF661FCEEBC_mobile",
  "this.Container_685CC558_649E_53A4_41C3_031C34B7328A_mobile",
  "this.Container_7DE2D59A_6911_E2E0_41A7_D15D0A935C33_mobile",
  "this.Container_3A863D9B_3513_E8A1_41BD_38320457DF78_mobile",
  "this.Container_4C963A1A_5F77_E460_41D6_D714DC83B392",
  "this.Container_47EBA17C_5FE3_89F1_41C4_50BC03196235_mobile",
  "this.veilPopupPanorama",
  "this.zoomImagePopupPanorama",
  "this.closeButtonPopupPanorama"
 ],
 "buttonToggleFullscreen": "this.IconButton_2E6081ED_347D_0EFF_41AA_ECC3AD42DC4D_mobile",
 "paddingRight": 0,
 "horizontalAlign": "left",
 "creationPolicy": "inAdvance",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 20,
 "desktopMipmappingEnabled": false,
 "left": 577.55,
 "start": "this.playAudioList([this.audio_41D5ADEE_5F68_3FA0_41BA_A36CE8A90C09]); this['MainViewer'] = this.MainViewer_mobile; this.init(); this.visibleComponentsIfPlayerFlagEnabled([this.IconButton_2E60B1ED_347D_0EFF_41C3_3E7369236DCE_mobile], 'gyroscopeAvailable'); this.syncPlaylists([this.mainPlayList,this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist]); if(!this.get('fullscreenAvailable')) { [this.IconButton_2E6081ED_347D_0EFF_41AA_ECC3AD42DC4D_mobile].forEach(function(component) { component.set('visible', false); }) }",
 "buttonToggleMute": "this.IconButton_2E60A1ED_347D_0EFF_41BC_A36ED8CE8127_mobile",
 "contentOpaque": false,
 "height": "100%",
 "minWidth": 20,
 "verticalAlign": "top",
 "downloadEnabled": false,
 "class": "Player",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "definitions": [{
 "thumbnailUrl": "media/album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_t.png",
 "label": "Album de Fotos sz-rr-1",
 "class": "PhotoAlbum",
 "id": "album_6076EEE4_5DF7_EE80_41C0_70404B70EF36",
 "playList": "this.album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_AlbumPlayList"
},
{
 "scrollBarMargin": 2,
 "headerBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "id": "window_6B77DC71_602A_BEC8_41A2_22DCEDC0A401",
 "veilShowEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeInEffect"
 },
 "showEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeInEffect"
 },
 "shadowBlurRadius": 6,
 "veilColor": [
  "#000000",
  "#000000"
 ],
 "veilHideEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeOutEffect"
 },
 "gap": 10,
 "closeButtonBackgroundColorDirection": "vertical",
 "closeButtonRollOverBorderSize": 0,
 "bodyBackgroundColorRatios": [
  0,
  0.5,
  1
 ],
 "scrollBarColor": "#000000",
 "horizontalAlign": "center",
 "shadowVerticalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 20,
 "titlePaddingRight": 5,
 "closeButtonPaddingLeft": 5,
 "closeButtonPressedBorderColor": "#000000",
 "bodyPaddingTop": 0,
 "headerPaddingRight": 0,
 "bodyPaddingRight": 0,
 "bodyPaddingBottom": 0,
 "closeButtonPressedBorderSize": 0,
 "closeButtonPressedBackgroundColorDirection": "vertical",
 "modal": true,
 "class": "Window",
 "hideEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeOutEffect"
 },
 "closeButtonRollOverBackgroundColorDirection": "vertical",
 "closeButtonPaddingTop": 5,
 "minWidth": 20,
 "backgroundColor": [],
 "headerVerticalAlign": "middle",
 "titlePaddingLeft": 5,
 "closeButtonPressedBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "titlePaddingTop": 5,
 "closeButtonPressedBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "headerBackgroundOpacity": 0,
 "bodyBackgroundColor": [
  "#FFFFFF",
  "#DDDDDD",
  "#FFFFFF"
 ],
 "bodyPaddingLeft": 0,
 "veilOpacity": 0.4,
 "closeButtonPressedIconLineWidth": 5,
 "propagateClick": false,
 "closeButtonBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "closeButtonBackgroundOpacity": 0.3,
 "titleFontFamily": "Arial",
 "shadow": true,
 "scrollBarWidth": 10,
 "closeButtonBorderRadius": 0,
 "backgroundOpacity": 1,
 "closeButtonIconWidth": 20,
 "closeButtonPressedIconColor": "#888888",
 "closeButtonRollOverBorderColor": "#000000",
 "closeButtonRollOverBackgroundOpacity": 0.3,
 "children": [
  "this.viewer_uid732C1E22_6037_FA4B_41D2_00FFFA0AA62B"
 ],
 "closeButtonIconHeight": 20,
 "borderRadius": 5,
 "titlePaddingBottom": 5,
 "backgroundColorRatios": [],
 "closeButtonIconLineWidth": 5,
 "shadowColor": "#000000",
 "shadowOpacity": 0.5,
 "closeButtonRollOverBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "closeButtonRollOverIconLineWidth": 5,
 "paddingRight": 0,
 "closeButtonRollOverBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "closeButtonBorderColor": "#000000",
 "headerPaddingLeft": 10,
 "veilColorRatios": [
  0,
  1
 ],
 "headerPaddingBottom": 5,
 "footerHeight": 5,
 "headerBackgroundColorDirection": "vertical",
 "bodyBackgroundOpacity": 0,
 "footerBackgroundColorDirection": "vertical",
 "footerBackgroundColor": [
  "#FFFFFF",
  "#EEEEEE",
  "#DDDDDD"
 ],
 "closeButtonPressedBackgroundOpacity": 0.3,
 "closeButtonPaddingBottom": 5,
 "contentOpaque": false,
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "footerBackgroundOpacity": 0,
 "bodyBackgroundColorDirection": "vertical",
 "closeButtonBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "closeButtonPaddingRight": 5,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "titleFontSize": "1.29vmin",
 "backgroundColorDirection": "vertical",
 "layout": "vertical",
 "closeButtonBorderSize": 0,
 "shadowHorizontalLength": 3,
 "closeButtonIconColor": "#000000",
 "headerPaddingTop": 10,
 "overflow": "scroll",
 "closeButtonRollOverIconColor": "#666666",
 "paddingTop": 0,
 "headerBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "data": {
  "name": "Window534"
 },
 "footerBackgroundColorRatios": [
  0,
  0.9,
  1
 ],
 "shadowSpread": 1
},
{
 "duration": 5000,
 "height": 338,
 "thumbnailUrl": "media/album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_1_t.jpg",
 "label": "sz-rr-2",
 "id": "album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_1",
 "width": 600,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_1.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "class": "Photo"
},
{
 "items": [
  {
   "media": "this.album_705F61E7_5C4C_9281_41D4_67432D954851",
   "player": "this.ViewerAreaLabeled_3AEAC6FC_3514_3866_41BA_E46727E47B58_mobilePhotoAlbumPlayer",
   "begin": "this.loopAlbum(this.playList_73290E1E_6037_FA7B_41D3_5DA9DBBFAFF7, 0)",
   "class": "PhotoAlbumPlayListItem"
  }
 ],
 "id": "playList_73290E1E_6037_FA7B_41D3_5DA9DBBFAFF7",
 "class": "PlayList"
},
{
 "hfov": 360,
 "hfovMax": 110,
 "label": "Panorama 4",
 "id": "panorama_5373C82A_5C54_9183_41D5_746C6CF32C38",
 "adjacentPanoramas": [
  {
   "backwardYaw": -89.16,
   "yaw": -152.61,
   "distance": 1,
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE"
  }
 ],
 "pitch": 0,
 "hfovMin": "120%",
 "partial": false,
 "vfov": 180,
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/f/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/f/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/f/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/f/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/u/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/u/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/u/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/u/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/r/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/r/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/r/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/r/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/b/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/b/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/b/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/b/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/d/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/d/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/d/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/d/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/l/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/l/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/l/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/l/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "class": "CubicPanoramaFrame"
  }
 ],
 "thumbnailUrl": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_t.jpg",
 "overlays": [
  "this.overlay_4459C812_5C5D_9183_41D4_68F3FE8A5EC3",
  "this.panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_tcap0",
  "this.overlay_48083C12_5F78_3C60_41D4_DC6560511014",
  "this.overlay_48E8D0CC_5F78_25E0_41C3_27414998C55C"
 ],
 "class": "Panorama"
},
{
 "hfov": 360,
 "hfovMax": 110,
 "label": "Panorama 3",
 "id": "panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE",
 "adjacentPanoramas": [
  {
   "backwardYaw": 0.63,
   "yaw": -178.75,
   "distance": 1,
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00"
  },
  {
   "backwardYaw": -0.22,
   "yaw": -178.72,
   "distance": 1,
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_535281A0_5C55_92BF_41A4_79774B470AC0"
  },
  {
   "backwardYaw": -152.61,
   "yaw": -89.16,
   "distance": 1,
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_5373C82A_5C54_9183_41D5_746C6CF32C38"
  }
 ],
 "pitch": 0,
 "hfovMin": "120%",
 "partial": false,
 "vfov": 180,
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/f/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/f/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/f/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/f/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/u/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/u/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/u/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/u/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/r/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/r/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/r/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/r/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/b/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/b/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/b/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/b/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/d/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/d/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/d/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/d/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/l/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/l/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/l/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/l/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "class": "CubicPanoramaFrame"
  }
 ],
 "thumbnailUrl": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_t.jpg",
 "overlays": [
  "this.overlay_4BEED20E_5C5C_B183_41BE_7AA18AECD597",
  "this.overlay_44E9236D_5C5F_B781_41CD_320EDDC7D241",
  "this.overlay_4BA61F9E_5C53_EE83_41D1_2D44912BC0F5",
  "this.panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_tcap0",
  "this.overlay_626633AA_5DCC_9683_41CE_AADCC31A62FD",
  "this.overlay_626643AA_5DCC_9683_41A8_4FD581109B45",
  "this.overlay_626663AB_5DCC_9681_41A7_7894AF438316",
  "this.overlay_626673AB_5DCC_9681_41D2_9F49774B179B",
  "this.overlay_626183AB_5DCC_9681_41AD_7F4FB949C006",
  "this.overlay_626193AB_5DCC_9681_41AF_CD93E50D069B",
  "this.overlay_6261B3AB_5DCC_9681_41CF_1E61BB0A0FFB",
  "this.popup_6257F33E_5DCC_9783_41B0_97B5816F9903",
  "this.popup_6248E342_5DCC_9783_41D7_AF6FA03E6565",
  "this.overlay_48F077F1_5F78_6BA0_41C2_EE22BD0FCE94",
  "this.overlay_48DCE16B_5F78_24A0_41BD_D4BBACFB641A"
 ],
 "class": "Panorama"
},
{
 "children": [
  "this.Container_4671610E_5FE3_8911_41CA_52A3BC165C45_mobile"
 ],
 "scrollBarWidth": 10,
 "id": "Container_4670810E_5FE3_8911_4176_3DF8A11ABABF_mobile",
 "left": "5%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "shadowBlurRadius": 25,
 "shadowColor": "#000000",
 "borderRadius": 0,
 "right": "5%",
 "shadowOpacity": 0.3,
 "paddingRight": 0,
 "horizontalAlign": "left",
 "shadowVerticalLength": 0,
 "creationPolicy": "inAdvance",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "gap": 0,
 "minHeight": 1,
 "top": "5%",
 "contentOpaque": false,
 "class": "Container",
 "minWidth": 1,
 "verticalAlign": "top",
 "paddingBottom": 0,
 "bottom": "5%",
 "shadowHorizontalLength": 0,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "layout": "horizontal",
 "shadowSpread": 1,
 "overflow": "scroll",
 "shadow": true,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "Global"
 },
 "backgroundOpacity": 1
},
{
 "duration": 200,
 "easing": "linear",
 "id": "effect_E78445AC_ED52_6962_41E5_44E0250686CD",
 "class": "FadeOutEffect"
},
{
 "scrollBarMargin": 2,
 "headerBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "id": "window_71F4E104_5C4C_7380_419F_83FEF09E1B14",
 "veilHideEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeOutEffect"
 },
 "showEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeInEffect"
 },
 "width": 400,
 "veilColor": [
  "#000000",
  "#000000"
 ],
 "gap": 10,
 "veilShowEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeInEffect"
 },
 "shadowBlurRadius": 6,
 "bodyBackgroundColorRatios": [
  0,
  0.5,
  1
 ],
 "scrollBarColor": "#000000",
 "horizontalAlign": "center",
 "shadowVerticalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 20,
 "titlePaddingRight": 5,
 "bodyPaddingTop": 0,
 "headerPaddingRight": 0,
 "bodyPaddingRight": 0,
 "bodyPaddingBottom": 0,
 "titleFontWeight": "normal",
 "modal": true,
 "height": 600,
 "hideEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeOutEffect"
 },
 "minWidth": 20,
 "class": "Window",
 "headerVerticalAlign": "middle",
 "title": "",
 "titlePaddingLeft": 5,
 "backgroundColor": [],
 "closeButtonPressedBackgroundColor": [],
 "titlePaddingTop": 5,
 "closeButtonPressedBackgroundColorRatios": [
  0
 ],
 "headerBackgroundOpacity": 0,
 "bodyBackgroundColor": [
  "#FFFFFF",
  "#DDDDDD",
  "#FFFFFF"
 ],
 "bodyPaddingLeft": 0,
 "veilOpacity": 0.4,
 "closeButtonPressedIconLineWidth": 3,
 "propagateClick": false,
 "closeButtonBackgroundColor": [],
 "shadow": true,
 "titleTextDecoration": "none",
 "titleFontFamily": "Arial",
 "scrollBarWidth": 10,
 "closeButtonBorderRadius": 11,
 "backgroundOpacity": 1,
 "closeButtonIconWidth": 20,
 "closeButtonPressedIconColor": "#FFFFFF",
 "children": [
  "this.container_73286E1F_6037_FA79_4193_575593050D8C"
 ],
 "closeButtonIconHeight": 20,
 "borderRadius": 5,
 "titlePaddingBottom": 5,
 "backgroundColorRatios": [],
 "closeButtonIconLineWidth": 2,
 "shadowColor": "#000000",
 "headerBorderSize": 0,
 "shadowOpacity": 0.5,
 "closeButtonRollOverBackgroundColor": [],
 "paddingRight": 0,
 "closeButtonRollOverBackgroundColorRatios": [
  0
 ],
 "headerPaddingLeft": 10,
 "veilColorRatios": [
  0,
  1
 ],
 "headerPaddingBottom": 5,
 "footerHeight": 5,
 "headerBackgroundColorDirection": "vertical",
 "bodyBackgroundOpacity": 0,
 "footerBackgroundColorDirection": "vertical",
 "footerBackgroundColor": [
  "#FFFFFF",
  "#EEEEEE",
  "#DDDDDD"
 ],
 "titleFontStyle": "normal",
 "contentOpaque": false,
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "footerBackgroundOpacity": 0,
 "bodyBackgroundColorDirection": "vertical",
 "closeButtonBackgroundColorRatios": [],
 "shadowHorizontalLength": 3,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "titleFontSize": "1.29vmin",
 "backgroundColorDirection": "vertical",
 "layout": "vertical",
 "titleFontColor": "#000000",
 "closeButtonIconColor": "#B2B2B2",
 "veilColorDirection": "horizontal",
 "headerBorderColor": "#000000",
 "headerPaddingTop": 10,
 "overflow": "scroll",
 "closeButtonRollOverIconColor": "#FFFFFF",
 "paddingTop": 0,
 "headerBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "data": {
  "name": "Window46522"
 },
 "footerBackgroundColorRatios": [
  0,
  0.9,
  1
 ],
 "shadowSpread": 1
},
{
 "children": [
  "this.IconButton_2E6021ED_347D_0EFF_41BD_84BE6BEAB908_mobile"
 ],
 "id": "Container_2E6031ED_347D_0EFC_41A1_12EC3C0472FF_mobile",
 "width": 110,
 "borderRadius": 0,
 "right": "0%",
 "paddingRight": 0,
 "gap": 10,
 "horizontalAlign": "center",
 "creationPolicy": "inAdvance",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "top": "0%",
 "contentOpaque": false,
 "class": "Container",
 "minWidth": 1,
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": 110,
 "propagateClick": false,
 "layout": "horizontal",
 "overflow": "visible",
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "top"
 },
 "scrollBarWidth": 10,
 "backgroundOpacity": 0
},
{
 "duration": 500,
 "easing": "linear",
 "id": "effect_4635488F_5FE7_872E_41C1_FF3ECDA34F01",
 "class": "FadeInEffect"
},
{
 "levels": [
  {
   "url": "media/popup_6653B4B8_5DB3_928F_41C8_756BE38CA23E_0_0.jpg",
   "width": 1417,
   "class": "ImageResourceLevel",
   "height": 1417
  },
  {
   "url": "media/popup_6653B4B8_5DB3_928F_41C8_756BE38CA23E_0_1.jpg",
   "width": 1024,
   "class": "ImageResourceLevel",
   "height": 1024
  },
  {
   "url": "media/popup_6653B4B8_5DB3_928F_41C8_756BE38CA23E_0_2.jpg",
   "width": 512,
   "class": "ImageResourceLevel",
   "height": 512
  }
 ],
 "id": "ImageResource_1D48789B_5DD5_B281_41A6_10DCE3978D43",
 "class": "ImageResource"
},
{
 "duration": 200,
 "easing": "linear",
 "id": "effect_E78445AC_ED52_6962_41E7_337128A4BA87",
 "class": "FadeInEffect"
},
{
 "fontSize": "22px",
 "id": "Button_6B3517BB_64A6_3EE4_41D7_49868CE9F7A9_mobile",
 "width": 90,
 "shadowColor": "#000000",
 "borderRadius": 0,
 "shadowBlurRadius": 6,
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "horizontalAlign": "center",
 "paddingLeft": 0,
 "borderSize": 0,
 "iconBeforeLabel": true,
 "gap": 5,
 "borderColor": "#000000",
 "minHeight": 1,
 "fontColor": "#FFFFFF",
 "fontFamily": "Akhand-Bold",
 "minWidth": 1,
 "mode": "push",
 "verticalAlign": "middle",
 "class": "Button",
 "paddingBottom": 0,
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "label": "BUTTON",
 "fontStyle": "normal",
 "layout": "horizontal",
 "rollOverFontColor": "#FF0000",
 "height": "100%",
 "propagateClick": false,
 "iconHeight": 32,
 "data": {
  "name": "button 4"
 },
 "shadow": false,
 "shadowSpread": 1,
 "paddingTop": 0,
 "iconWidth": 32,
 "textDecoration": "none",
 "visible": false,
 "cursor": "hand",
 "fontWeight": "normal",
 "backgroundOpacity": 0
},
{
 "children": [
  "this.Container_7DE3E59A_6911_E2E0_41D7_0925C3250BD2_mobile",
  "this.Container_7DE3059A_6911_E2E0_41C7_5A5AF3BF1498_mobile"
 ],
 "scrollBarWidth": 10,
 "id": "Container_7DE2D59A_6911_E2E0_41A7_D15D0A935C33_mobile",
 "left": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "borderRadius": 0,
 "right": "0%",
 "paddingRight": 0,
 "horizontalAlign": "left",
 "creationPolicy": "inAdvance",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "gap": 10,
 "minHeight": 1,
 "top": "0%",
 "contentOpaque": false,
 "class": "Container",
 "minWidth": 1,
 "verticalAlign": "top",
 "bottom": "0%",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "click": "this.setComponentVisibility(this.Container_7DE2D59A_6911_E2E0_41A7_D15D0A935C33_mobile, false, 0, null, null, false)",
 "propagateClick": true,
 "layout": "absolute",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "--INFO"
 },
 "visible": false,
 "backgroundOpacity": 0.6
},
{
 "duration": 5000,
 "height": 338,
 "thumbnailUrl": "media/album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_2_t.jpg",
 "label": "sz-rr-3",
 "id": "album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_2",
 "width": 600,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_2.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "class": "Photo"
},
{
 "borderRadius": 0,
 "children": [
  "this.Container_7DE3459A_6911_E2E0_41CE_F97D3E361A8D_mobile"
 ],
 "scrollBarWidth": 10,
 "id": "Container_7DE3A59A_6911_E2E0_41D8_A93A28426D33_mobile",
 "width": "100%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "gap": 0,
 "horizontalAlign": "center",
 "creationPolicy": "inAdvance",
 "paddingLeft": 0,
 "paddingRight": 0,
 "scrollBarColor": "#0069A3",
 "minHeight": 1,
 "borderSize": 0,
 "contentOpaque": false,
 "class": "Container",
 "minWidth": 1,
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.51,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "layout": "vertical",
 "height": "100%",
 "overflow": "visible",
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "-right"
 },
 "backgroundOpacity": 1
},
{
 "scrollBarMargin": 2,
 "headerBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "id": "window_6B756C73_602A_BEC8_41A4_774861A8B196",
 "veilShowEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeInEffect"
 },
 "showEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeInEffect"
 },
 "shadowBlurRadius": 6,
 "veilColor": [
  "#000000",
  "#000000"
 ],
 "veilHideEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeOutEffect"
 },
 "gap": 10,
 "closeButtonBackgroundColorDirection": "vertical",
 "closeButtonRollOverBorderSize": 0,
 "bodyBackgroundColorRatios": [
  0,
  0.5,
  1
 ],
 "scrollBarColor": "#000000",
 "horizontalAlign": "center",
 "shadowVerticalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 20,
 "titlePaddingRight": 5,
 "closeButtonPaddingLeft": 5,
 "closeButtonPressedBorderColor": "#000000",
 "bodyPaddingTop": 0,
 "headerPaddingRight": 0,
 "bodyPaddingRight": 0,
 "bodyPaddingBottom": 0,
 "closeButtonPressedBorderSize": 0,
 "closeButtonPressedBackgroundColorDirection": "vertical",
 "modal": true,
 "class": "Window",
 "hideEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeOutEffect"
 },
 "closeButtonRollOverBackgroundColorDirection": "vertical",
 "closeButtonPaddingTop": 5,
 "minWidth": 20,
 "backgroundColor": [],
 "headerVerticalAlign": "middle",
 "titlePaddingLeft": 5,
 "closeButtonPressedBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "titlePaddingTop": 5,
 "closeButtonPressedBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "headerBackgroundOpacity": 0,
 "bodyBackgroundColor": [
  "#FFFFFF",
  "#DDDDDD",
  "#FFFFFF"
 ],
 "bodyPaddingLeft": 0,
 "veilOpacity": 0.4,
 "closeButtonPressedIconLineWidth": 5,
 "propagateClick": false,
 "closeButtonBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "closeButtonBackgroundOpacity": 0.3,
 "titleFontFamily": "Arial",
 "shadow": true,
 "scrollBarWidth": 10,
 "closeButtonBorderRadius": 0,
 "backgroundOpacity": 1,
 "closeButtonIconWidth": 20,
 "closeButtonPressedIconColor": "#888888",
 "closeButtonRollOverBorderColor": "#000000",
 "closeButtonRollOverBackgroundOpacity": 0.3,
 "children": [
  "this.viewer_uid7310BE26_6037_FA4B_41D1_EC617C477B18"
 ],
 "closeButtonIconHeight": 20,
 "borderRadius": 5,
 "titlePaddingBottom": 5,
 "backgroundColorRatios": [],
 "closeButtonIconLineWidth": 5,
 "shadowColor": "#000000",
 "shadowOpacity": 0.5,
 "closeButtonRollOverBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "closeButtonRollOverIconLineWidth": 5,
 "paddingRight": 0,
 "closeButtonRollOverBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "closeButtonBorderColor": "#000000",
 "headerPaddingLeft": 10,
 "veilColorRatios": [
  0,
  1
 ],
 "headerPaddingBottom": 5,
 "footerHeight": 5,
 "headerBackgroundColorDirection": "vertical",
 "bodyBackgroundOpacity": 0,
 "footerBackgroundColorDirection": "vertical",
 "footerBackgroundColor": [
  "#FFFFFF",
  "#EEEEEE",
  "#DDDDDD"
 ],
 "closeButtonPressedBackgroundOpacity": 0.3,
 "closeButtonPaddingBottom": 5,
 "contentOpaque": false,
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "footerBackgroundOpacity": 0,
 "bodyBackgroundColorDirection": "vertical",
 "closeButtonBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "closeButtonPaddingRight": 5,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "titleFontSize": "1.29vmin",
 "backgroundColorDirection": "vertical",
 "layout": "vertical",
 "closeButtonBorderSize": 0,
 "shadowHorizontalLength": 3,
 "closeButtonIconColor": "#000000",
 "headerPaddingTop": 10,
 "overflow": "scroll",
 "closeButtonRollOverIconColor": "#666666",
 "paddingTop": 0,
 "headerBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "data": {
  "name": "Window538"
 },
 "footerBackgroundColorRatios": [
  0,
  0.9,
  1
 ],
 "shadowSpread": 1
},
{
 "borderRadius": 0,
 "children": [
  "this.WebFrame_46186BDA_5FE4_B936_41B3_E3FA517EB4D7"
 ],
 "scrollBarWidth": 10,
 "id": "Container_4671610E_5FE3_8911_41CA_52A3BC165C45_mobile",
 "width": "100%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "gap": 0,
 "horizontalAlign": "center",
 "creationPolicy": "inAdvance",
 "paddingLeft": 0,
 "paddingRight": 0,
 "scrollBarColor": "#0069A3",
 "minHeight": 1,
 "borderSize": 0,
 "contentOpaque": false,
 "class": "Container",
 "minWidth": 1,
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.51,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "layout": "vertical",
 "height": "100%",
 "overflow": "visible",
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "-right"
 },
 "backgroundOpacity": 1
},
{
 "duration": 5000,
 "height": 338,
 "thumbnailUrl": "media/album_623D971A_5DD7_9F83_417C_6FB0FF992743_0_t.jpg",
 "label": "Yamaha-YCZ110",
 "id": "album_623D971A_5DD7_9F83_417C_6FB0FF992743_0",
 "width": 600,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_623D971A_5DD7_9F83_417C_6FB0FF992743_0.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "class": "Photo"
},
{
 "rollOverBackgroundOpacity": 0,
 "fontSize": "22px",
 "label": "INFORMACI\u00d3N",
 "id": "Button_750C11A1_648F_A89A_41C9_2E58278A81A6_mobile",
 "width": 130,
 "shadowColor": "#000000",
 "borderRadius": 0,
 "shadowBlurRadius": 6,
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "horizontalAlign": "center",
 "paddingLeft": 0,
 "borderSize": 0,
 "iconBeforeLabel": true,
 "gap": 5,
 "borderColor": "#000000",
 "rollOverBackgroundColor": [
  "#000000",
  "#FFFFFF"
 ],
 "minHeight": 1,
 "fontColor": "#FFFFFF",
 "fontFamily": "Akhand-Bold",
 "rollOverShadow": false,
 "rollOverBackgroundColorRatios": [
  1,
  1
 ],
 "minWidth": 1,
 "mode": "push",
 "verticalAlign": "middle",
 "click": "this.setComponentVisibility(this.Container_7DE2D59A_6911_E2E0_41A7_D15D0A935C33_mobile, true, 0, this.effect_48294A97_5F78_246F_41D3_97C6C718F84C, 'showEffect', false)",
 "class": "Button",
 "paddingBottom": 0,
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "fontStyle": "normal",
 "layout": "horizontal",
 "rollOverFontColor": "#FF0000",
 "height": "100%",
 "propagateClick": false,
 "rollOverShadowBlurRadius": 66,
 "iconHeight": 32,
 "data": {
  "name": "info"
 },
 "shadow": false,
 "shadowSpread": 1,
 "paddingTop": 0,
 "iconWidth": 32,
 "textDecoration": "none",
 "cursor": "hand",
 "fontWeight": "normal",
 "backgroundOpacity": 0
},
{
 "levels": [
  {
   "url": "media/popup_7091047F_5CB3_B181_41C4_0FD388D8E2D6_0_0.jpg",
   "width": 1417,
   "class": "ImageResourceLevel",
   "height": 1417
  },
  {
   "url": "media/popup_7091047F_5CB3_B181_41C4_0FD388D8E2D6_0_1.jpg",
   "width": 1024,
   "class": "ImageResourceLevel",
   "height": 1024
  },
  {
   "url": "media/popup_7091047F_5CB3_B181_41C4_0FD388D8E2D6_0_2.jpg",
   "width": 512,
   "class": "ImageResourceLevel",
   "height": 512
  }
 ],
 "id": "ImageResource_65255BFC_5C57_B687_41D5_CBD3185EEDE7",
 "class": "ImageResource"
},
{
 "maxHeight": 60,
 "maxWidth": 60,
 "id": "IconButton_4C961A19_5F77_E460_41C9_6FC9CD92F3CB",
 "rollOverIconURL": "skin/IconButton_4C961A19_5F77_E460_41C9_6FC9CD92F3CB_rollover.jpg",
 "width": "100%",
 "borderRadius": 0,
 "right": 20,
 "paddingRight": 0,
 "iconURL": "skin/IconButton_4C961A19_5F77_E460_41C9_6FC9CD92F3CB.jpg",
 "horizontalAlign": "right",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 50,
 "top": 20,
 "transparencyActive": false,
 "minWidth": 50,
 "mode": "push",
 "verticalAlign": "top",
 "class": "IconButton",
 "paddingBottom": 0,
 "height": "36.14%",
 "click": "this.setComponentVisibility(this.Container_4C963A1A_5F77_E460_41D6_D714DC83B392, false, 0, null, null, false)",
 "propagateClick": false,
 "pressedIconURL": "skin/IconButton_4C961A19_5F77_E460_41C9_6FC9CD92F3CB_pressed.jpg",
 "data": {
  "name": "IconButton X"
 },
 "shadow": false,
 "paddingTop": 0,
 "pressedRollOverIconURL": "skin/IconButton_4C961A19_5F77_E460_41C9_6FC9CD92F3CB_pressed_rollover.jpg",
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "change": "this.showComponentsWhileMouseOver(this.container_73286E1F_6037_FA79_4193_575593050D8C, [this.htmltext_73282E1F_6037_FA79_41C6_38A90FA44B44,this.component_732B0E20_6037_FA47_41CF_A6FF1A3D0DEA,this.component_732B3E20_6037_FA47_41CA_4EEB969BEA84], 2000)",
 "items": [
  "this.albumitem_73285E1F_6037_FA79_41C4_E4D4B1A15058"
 ],
 "id": "playList_73D5212D_602B_4658_41BE_30C570CD405B",
 "class": "PlayList"
},
{
 "maxWidth": 7,
 "id": "Image_6B6FAA55_64A6_71AF_41D3_F197980C21A5_mobile",
 "width": 7,
 "borderRadius": 0,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "url": "skin/Image_1FC09DB8_342E_F764_41A3_E939228A46A8.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "minWidth": 1,
 "verticalAlign": "middle",
 "class": "Image",
 "paddingBottom": 0,
 "height": "100%",
 "propagateClick": false,
 "scaleMode": "fit_inside",
 "data": {
  "name": "-"
 },
 "shadow": false,
 "paddingTop": 0,
 "visible": false,
 "backgroundOpacity": 0
},
{
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_73589E67_6037_FAC9_41D7_A46B2D64C271",
 "id": "camera_7358EE66_6037_FACB_41C7_674FEADBCB14",
 "class": "PanoramaCamera",
 "initialPosition": {
  "hfov": 95,
  "yaw": -179.47,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "maxHeight": 58,
 "maxWidth": 58,
 "id": "IconButton_2E60E1EE_347D_0EFC_41C3_A8DD2E2819ED_mobile",
 "rollOverIconURL": "skin/IconButton_2E60E1EE_347D_0EFC_41C3_A8DD2E2819ED_rollover.png",
 "width": 58,
 "borderRadius": 0,
 "paddingRight": 0,
 "iconURL": "skin/IconButton_2E60E1EE_347D_0EFC_41C3_A8DD2E2819ED.png",
 "horizontalAlign": "center",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "transparencyActive": true,
 "class": "IconButton",
 "minWidth": 1,
 "mode": "push",
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "height": 58,
 "click": "this.openLink('http://www.facebook.com/loremipsum', '_blank')",
 "propagateClick": false,
 "data": {
  "name": "fb"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "class": "Video",
 "thumbnailUrl": "media/video_636358BB_5DD5_9281_41D0_CDF25C2DBC6B_t.jpg",
 "label": "Yamaha YC-Z ",
 "scaleMode": "fit_inside",
 "width": 1280,
 "loop": false,
 "id": "video_636358BB_5DD5_9281_41D0_CDF25C2DBC6B",
 "height": 720,
 "video": {
  "width": 1280,
  "mp4Url": "media/video_636358BB_5DD5_9281_41D0_CDF25C2DBC6B.mp4",
  "class": "VideoResource",
  "height": 720
 }
},
{
 "change": "this.showComponentsWhileMouseOver(this.container_732EAE25_6037_FA49_41CE_0A91B7C623E6, [this.htmltext_73113E26_6037_FA4B_41C0_5F6F0E1291CA,this.component_73100E26_6037_FA4B_41D0_7B7AF048848F,this.component_73102E26_6037_FA4B_41D2_9BE814E6293F], 2000)",
 "items": [
  "this.albumitem_73107E25_6037_FA49_41D4_491D55159074"
 ],
 "id": "playList_742AA13C_602B_46B8_41D2_BD110DD5CDC2",
 "class": "PlayList"
},
{
 "borderRadius": 0,
 "id": "WebFrame_46186BDA_5FE4_B936_41B3_E3FA517EB4D7",
 "width": "100%",
 "backgroundColorRatios": [
  0
 ],
 "scrollEnabled": true,
 "url": "/360/mt-03/",
 "paddingLeft": 0,
 "paddingRight": 0,
 "minHeight": 1,
 "borderSize": 0,
 "class": "WebFrame",
 "minWidth": 1,
 "paddingBottom": 0,
 "backgroundColor": [
  "#FFFFFF"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "height": "100%",
 "data": {
  "name": "WebFrame10439"
 },
 "shadow": false,
 "paddingTop": 0,
 "insetBorder": false,
 "backgroundOpacity": 1
},
{
 "borderRadius": 0,
 "children": [
  "this.Button_46736112_5FE3_8931_41BA_1F6320EBC169_mobile"
 ],
 "id": "Container_46731112_5FE3_8931_41AB_4EE866373B18_mobile",
 "left": "5%",
 "right": "5%",
 "paddingRight": 20,
 "gap": 10,
 "horizontalAlign": "right",
 "creationPolicy": "inAdvance",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "top": "5%",
 "contentOpaque": false,
 "minWidth": 1,
 "verticalAlign": "top",
 "bottom": "88%",
 "class": "Container",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "propagateClick": false,
 "layout": "vertical",
 "overflow": "visible",
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 20,
 "data": {
  "name": "Container X"
 },
 "scrollBarWidth": 10,
 "backgroundOpacity": 0
},
{
 "levels": [
  {
   "url": "media/popup_6257F33E_5DCC_9783_41B0_97B5816F9903_0_0.jpg",
   "width": 1417,
   "class": "ImageResourceLevel",
   "height": 1417
  },
  {
   "url": "media/popup_6257F33E_5DCC_9783_41B0_97B5816F9903_0_1.jpg",
   "width": 1024,
   "class": "ImageResourceLevel",
   "height": 1024
  },
  {
   "url": "media/popup_6257F33E_5DCC_9783_41B0_97B5816F9903_0_2.jpg",
   "width": 512,
   "class": "ImageResourceLevel",
   "height": 512
  }
 ],
 "id": "ImageResource_63BE5A50_5DF3_919F_41BA_8AC8087C33EF",
 "class": "ImageResource"
},
{
 "rotationY": 0,
 "hfov": 6.53,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_6248E342_5DCC_9783_41D7_AF6FA03E6565",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "loop": false,
 "autoplay": true,
 "popupMaxHeight": "95%",
 "pitch": -24.98,
 "popupMaxWidth": "95%",
 "yaw": 103.82,
 "class": "PopupPanoramaOverlay",
 "showDuration": 500,
 "video": {
  "width": 1280,
  "mp4Url": "media/video_6138AF13_5DF4_6F81_41CF_B052B4DA69FF.mp4",
  "class": "VideoResource",
  "height": 720
 }
},
{
 "hfov": 360,
 "hfovMax": 110,
 "label": "Panorama 2",
 "id": "panorama_535281A0_5C55_92BF_41A4_79774B470AC0",
 "adjacentPanoramas": [
  {
   "backwardYaw": 0.53,
   "yaw": -179.59,
   "distance": 1,
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00"
  },
  {
   "backwardYaw": -178.72,
   "yaw": -0.22,
   "distance": 1,
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE"
  }
 ],
 "pitch": 0,
 "hfovMin": "120%",
 "partial": false,
 "vfov": 180,
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/f/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/f/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/f/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/f/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/u/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/u/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/u/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/u/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/r/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/r/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/r/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/r/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/b/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/b/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/b/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/b/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/d/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/d/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/d/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/d/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/l/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/l/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/l/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/l/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "class": "CubicPanoramaFrame"
  }
 ],
 "thumbnailUrl": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_t.jpg",
 "overlays": [
  "this.overlay_4B0DA32B_5C54_F781_41B6_1F1FC338D422",
  "this.overlay_441C4984_5C55_9287_4194_E42A944D6CE3",
  "this.panorama_535281A0_5C55_92BF_41A4_79774B470AC0_tcap0",
  "this.overlay_66792533_5DB3_9381_41CF_07142ED6B66C",
  "this.overlay_66793534_5DB3_9387_41A2_E3A18162C8A8",
  "this.overlay_6679C535_5DB3_9381_41C4_93D47DC5A849",
  "this.overlay_6679D535_5DB3_9381_41D4_6A5E729DF707",
  "this.overlay_6679E535_5DB3_9381_41D1_A9857FFC1604",
  "this.overlay_6679F535_5DB3_9381_41C5_3BD5A98D4728",
  "this.overlay_66798535_5DB3_9381_41C3_7E7E1C1042F6",
  "this.popup_6653B4B8_5DB3_928F_41C8_756BE38CA23E",
  "this.popup_665E54BC_5DB3_9287_41C8_4F0F2CE7DD7C",
  "this.overlay_48FC81CA_5F78_67E6_41D3_41B1CD687E9A",
  "this.overlay_48D6B9CB_5F78_67E0_41C0_AF64CB49E5C4"
 ],
 "class": "Panorama"
},
{
 "children": [
  "this.Container_4C95EA19_5F77_E460_41CA_5B9016BE64F4"
 ],
 "scrollBarWidth": 10,
 "id": "Container_4C963A1A_5F77_E460_41D6_D714DC83B392",
 "left": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "borderRadius": 0,
 "right": "0%",
 "paddingRight": 0,
 "horizontalAlign": "left",
 "creationPolicy": "inAdvance",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "gap": 10,
 "minHeight": 1,
 "top": "0%",
 "contentOpaque": false,
 "class": "Container",
 "minWidth": 1,
 "verticalAlign": "top",
 "bottom": "0%",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "click": "this.setComponentVisibility(this.Container_4C963A1A_5F77_E460_41D6_D714DC83B392, false, 0, null, null, false)",
 "propagateClick": true,
 "layout": "absolute",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "---PANORAMA LIST"
 },
 "visible": false,
 "backgroundOpacity": 0.6
},
{
 "children": [
  "this.Container_4670810E_5FE3_8911_4176_3DF8A11ABABF_mobile",
  "this.Container_46731112_5FE3_8931_41AB_4EE866373B18_mobile"
 ],
 "scrollBarWidth": 10,
 "id": "Container_47EBA17C_5FE3_89F1_41C4_50BC03196235_mobile",
 "left": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "borderRadius": 0,
 "right": "0%",
 "paddingRight": 0,
 "horizontalAlign": "left",
 "creationPolicy": "inAdvance",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "gap": 10,
 "minHeight": 1,
 "top": "0%",
 "contentOpaque": false,
 "class": "Container",
 "minWidth": 1,
 "verticalAlign": "top",
 "bottom": "0%",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "click": "this.setComponentVisibility(this.Container_47EBA17C_5FE3_89F1_41C4_50BC03196235_mobile, false, 0, null, null, false)",
 "propagateClick": true,
 "layout": "absolute",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "--360mt03"
 },
 "visible": false,
 "backgroundOpacity": 0.6
},
{
 "duration": 5000,
 "height": 338,
 "thumbnailUrl": "media/album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_3_t.jpg",
 "label": "Yamaha-MTZ 150 05",
 "id": "album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_3",
 "width": 600,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_3.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "class": "Photo"
},
{
 "duration": 500,
 "easing": "linear",
 "id": "effect_49090075_5F78_64A0_41BA_7D87CB61B700",
 "class": "FadeInEffect"
},
{
 "maxHeight": 58,
 "maxWidth": 58,
 "id": "IconButton_2E60B1ED_347D_0EFF_41C3_3E7369236DCE_mobile",
 "width": 58,
 "borderRadius": 0,
 "paddingRight": 0,
 "iconURL": "skin/IconButton_2E60B1ED_347D_0EFF_41C3_3E7369236DCE.png",
 "horizontalAlign": "center",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "transparencyActive": true,
 "class": "IconButton",
 "minWidth": 1,
 "mode": "toggle",
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "height": 58,
 "propagateClick": false,
 "pressedIconURL": "skin/IconButton_2E60B1ED_347D_0EFF_41C3_3E7369236DCE_pressed.png",
 "data": {
  "name": "gyroscopic"
 },
 "shadow": false,
 "paddingTop": 0,
 "pressedRollOverIconURL": "skin/IconButton_2E60B1ED_347D_0EFF_41C3_3E7369236DCE_pressed.png",
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "rollOverBackgroundOpacity": 1,
 "fontSize": "1.29vmin",
 "data": {
  "name": "X"
 },
 "maxHeight": 50,
 "maxWidth": 50,
 "id": "Button_78C5D2AD_6EF0_BD24_41BA_7914C520D22E_mobile",
 "pressedBackgroundOpacity": 1,
 "backgroundColorRatios": [
  0
 ],
 "width": 50,
 "shadowColor": "#000000",
 "borderRadius": 0,
 "shadowBlurRadius": 6,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "pressedBackgroundColor": [
  "#000000"
 ],
 "paddingLeft": 0,
 "borderSize": 0,
 "iconBeforeLabel": true,
 "gap": 5,
 "iconURL": "skin/Button_775D3775_6F10_A324_41B1_8092A2023E17.png",
 "minHeight": 30,
 "borderColor": "#000000",
 "rollOverBackgroundColor": [
  "#C50A01"
 ],
 "fontColor": "#FFFFFF",
 "fontFamily": "Arial",
 "pressedBackgroundColorRatios": [
  0
 ],
 "height": 50,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "minWidth": 30,
 "mode": "push",
 "verticalAlign": "middle",
 "click": "this.setComponentVisibility(this.Container_7DE2D59A_6911_E2E0_41A7_D15D0A935C33_mobile, false, 0, this.effect_7E0FE099_696E_E2E0_4183_0FC331E0D87C, 'hideEffect', false)",
 "class": "Button",
 "paddingBottom": 0,
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "layout": "horizontal",
 "backgroundColor": [
  "#E7392B"
 ],
 "iconHeight": 32,
 "fontStyle": "normal",
 "shadow": false,
 "shadowSpread": 1,
 "paddingTop": 0,
 "iconWidth": 32,
 "textDecoration": "none",
 "cursor": "hand",
 "fontWeight": "normal",
 "backgroundOpacity": 1
},
{
 "maxHeight": 60,
 "maxWidth": 60,
 "id": "IconButton_2E6021ED_347D_0EFF_41BD_84BE6BEAB908_mobile",
 "width": 60,
 "borderRadius": 0,
 "paddingRight": 0,
 "iconURL": "skin/IconButton_2E6021ED_347D_0EFF_41BD_84BE6BEAB908.png",
 "horizontalAlign": "center",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "transparencyActive": true,
 "class": "IconButton",
 "minWidth": 1,
 "mode": "toggle",
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "height": 60,
 "click": "if(!this.Container_2E6011ED_347D_0EFF_41C9_5AC77536D968_mobile.get('visible')){ this.setComponentVisibility(this.Container_2E6011ED_347D_0EFF_41C9_5AC77536D968_mobile, true, 0, this.effect_E78445AC_ED52_6962_41E7_337128A4BA87, 'showEffect', false) } else { this.setComponentVisibility(this.Container_2E6011ED_347D_0EFF_41C9_5AC77536D968_mobile, false, 0, this.effect_E78445AC_ED52_6962_41E5_44E0250686CD, 'hideEffect', false) }",
 "propagateClick": false,
 "pressedIconURL": "skin/IconButton_2E6021ED_347D_0EFF_41BD_84BE6BEAB908_pressed.png",
 "data": {
  "name": "settings button"
 },
 "shadow": false,
 "paddingTop": 0,
 "pressedRollOverIconURL": "skin/IconButton_2E6021ED_347D_0EFF_41BD_84BE6BEAB908_pressed.png",
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "children": [
  "this.Container_7DE3A59A_6911_E2E0_41D8_A93A28426D33_mobile"
 ],
 "scrollBarWidth": 10,
 "id": "Container_7DE3E59A_6911_E2E0_41D7_0925C3250BD2_mobile",
 "left": "5%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "shadowBlurRadius": 25,
 "shadowColor": "#000000",
 "borderRadius": 0,
 "right": "5%",
 "shadowOpacity": 0.3,
 "paddingRight": 0,
 "horizontalAlign": "left",
 "shadowVerticalLength": 0,
 "creationPolicy": "inAdvance",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "gap": 0,
 "minHeight": 1,
 "top": "5%",
 "contentOpaque": false,
 "class": "Container",
 "minWidth": 1,
 "verticalAlign": "top",
 "paddingBottom": 0,
 "bottom": "5%",
 "shadowHorizontalLength": 0,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "layout": "horizontal",
 "shadowSpread": 1,
 "overflow": "scroll",
 "shadow": true,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "Global"
 },
 "backgroundOpacity": 1
},
{
 "scrollBarMargin": 2,
 "headerBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "id": "window_6B76DC6D_602A_BED8_41D2_71A1CFCD081F",
 "veilShowEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeInEffect"
 },
 "showEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeInEffect"
 },
 "shadowBlurRadius": 6,
 "veilColor": [
  "#000000",
  "#000000"
 ],
 "veilHideEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeOutEffect"
 },
 "gap": 10,
 "closeButtonBackgroundColorDirection": "vertical",
 "closeButtonRollOverBorderSize": 0,
 "bodyBackgroundColorRatios": [
  0,
  0.5,
  1
 ],
 "scrollBarColor": "#000000",
 "horizontalAlign": "center",
 "shadowVerticalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 20,
 "titlePaddingRight": 5,
 "closeButtonPaddingLeft": 5,
 "closeButtonPressedBorderColor": "#000000",
 "bodyPaddingTop": 0,
 "headerPaddingRight": 0,
 "bodyPaddingRight": 0,
 "bodyPaddingBottom": 0,
 "closeButtonPressedBorderSize": 0,
 "closeButtonPressedBackgroundColorDirection": "vertical",
 "modal": true,
 "class": "Window",
 "hideEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeOutEffect"
 },
 "closeButtonRollOverBackgroundColorDirection": "vertical",
 "closeButtonPaddingTop": 5,
 "minWidth": 20,
 "backgroundColor": [],
 "headerVerticalAlign": "middle",
 "titlePaddingLeft": 5,
 "closeButtonPressedBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "titlePaddingTop": 5,
 "closeButtonPressedBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "headerBackgroundOpacity": 0,
 "bodyBackgroundColor": [
  "#FFFFFF",
  "#DDDDDD",
  "#FFFFFF"
 ],
 "bodyPaddingLeft": 0,
 "veilOpacity": 0.4,
 "closeButtonPressedIconLineWidth": 5,
 "propagateClick": false,
 "closeButtonBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "closeButtonBackgroundOpacity": 0.3,
 "titleFontFamily": "Arial",
 "shadow": true,
 "scrollBarWidth": 10,
 "closeButtonBorderRadius": 0,
 "backgroundOpacity": 1,
 "closeButtonIconWidth": 20,
 "closeButtonPressedIconColor": "#888888",
 "closeButtonRollOverBorderColor": "#000000",
 "closeButtonRollOverBackgroundOpacity": 0.3,
 "children": [
  "this.viewer_uid732B8E20_6037_FA47_41C0_43F64BFB44D2"
 ],
 "closeButtonIconHeight": 20,
 "borderRadius": 5,
 "titlePaddingBottom": 5,
 "backgroundColorRatios": [],
 "closeButtonIconLineWidth": 5,
 "shadowColor": "#000000",
 "shadowOpacity": 0.5,
 "closeButtonRollOverBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "closeButtonRollOverIconLineWidth": 5,
 "paddingRight": 0,
 "closeButtonRollOverBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "closeButtonBorderColor": "#000000",
 "headerPaddingLeft": 10,
 "veilColorRatios": [
  0,
  1
 ],
 "headerPaddingBottom": 5,
 "footerHeight": 5,
 "headerBackgroundColorDirection": "vertical",
 "bodyBackgroundOpacity": 0,
 "footerBackgroundColorDirection": "vertical",
 "footerBackgroundColor": [
  "#FFFFFF",
  "#EEEEEE",
  "#DDDDDD"
 ],
 "closeButtonPressedBackgroundOpacity": 0.3,
 "closeButtonPaddingBottom": 5,
 "contentOpaque": false,
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "footerBackgroundOpacity": 0,
 "bodyBackgroundColorDirection": "vertical",
 "closeButtonBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "closeButtonPaddingRight": 5,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "titleFontSize": "1.29vmin",
 "backgroundColorDirection": "vertical",
 "layout": "vertical",
 "closeButtonBorderSize": 0,
 "shadowHorizontalLength": 3,
 "closeButtonIconColor": "#000000",
 "headerPaddingTop": 10,
 "overflow": "scroll",
 "closeButtonRollOverIconColor": "#666666",
 "paddingTop": 0,
 "headerBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "data": {
  "name": "Window533"
 },
 "footerBackgroundColorRatios": [
  0,
  0.9,
  1
 ],
 "shadowSpread": 1
},
{
 "maxHeight": 58,
 "maxWidth": 58,
 "id": "IconButton_2E60F1ED_347D_0EFF_41C9_4BA017DDD347_mobile",
 "rollOverIconURL": "skin/IconButton_2E60F1ED_347D_0EFF_41C9_4BA017DDD347_rollover.png",
 "width": 58,
 "borderRadius": 0,
 "paddingRight": 0,
 "iconURL": "skin/IconButton_2E60F1ED_347D_0EFF_41C9_4BA017DDD347.png",
 "horizontalAlign": "center",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "transparencyActive": true,
 "class": "IconButton",
 "minWidth": 1,
 "mode": "push",
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "height": 58,
 "click": "this.openLink('http://twitter.com/loremipsum', '_blank')",
 "propagateClick": false,
 "data": {
  "name": "twitter"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "maxHeight": 60,
 "maxWidth": 60,
 "id": "IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC_mobile",
 "left": "1%",
 "width": 170,
 "borderRadius": 0,
 "rollOverIconURL": "skin/IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC_rollover.png",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC.png",
 "horizontalAlign": "center",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 40,
 "top": "42%",
 "transparencyActive": false,
 "minWidth": 40,
 "mode": "push",
 "verticalAlign": "middle",
 "bottom": "42%",
 "class": "IconButton",
 "paddingBottom": 0,
 "propagateClick": false,
 "pressedIconURL": "skin/IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC_pressed.png",
 "data": {
  "name": "<"
 },
 "shadow": false,
 "paddingTop": 0,
 "pressedRollOverIconURL": "skin/IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC_pressed.png",
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "thumbnailUrl": "media/album_623D971A_5DD7_9F83_417C_6FB0FF992743_t.png",
 "label": "Album de Fotos Yamaha-YCZ110",
 "class": "PhotoAlbum",
 "id": "album_623D971A_5DD7_9F83_417C_6FB0FF992743",
 "playList": "this.album_623D971A_5DD7_9F83_417C_6FB0FF992743_AlbumPlayList"
},
{
 "children": [
  "this.ViewerAreaLabeled_3AEAC6FC_3514_3866_41BA_E46727E47B58_mobile",
  "this.IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC_mobile",
  "this.IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4_mobile",
  "this.Button_7DC9A1F7_6916_6221_41A7_DA6068060007_mobile"
 ],
 "scrollBarWidth": 10,
 "id": "Container_3A26EF53_3514_E9A2_4159_FC2DDA226A54_mobile",
 "left": "14%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "borderRadius": 0,
 "right": "14%",
 "paddingRight": 0,
 "horizontalAlign": "left",
 "creationPolicy": "inAdvance",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "gap": 10,
 "minHeight": 1,
 "top": "10%",
 "contentOpaque": false,
 "class": "Container",
 "minWidth": 1,
 "verticalAlign": "top",
 "bottom": "10%",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "layout": "absolute",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "Global"
 },
 "backgroundOpacity": 1
},
{
 "rollOverBackgroundOpacity": 1,
 "fontSize": "1.29vmin",
 "data": {
  "name": "X"
 },
 "maxHeight": 50,
 "maxWidth": 50,
 "id": "Button_46736112_5FE3_8931_41BA_1F6320EBC169_mobile",
 "pressedBackgroundOpacity": 1,
 "backgroundColorRatios": [
  0
 ],
 "width": 50,
 "shadowColor": "#000000",
 "borderRadius": 0,
 "shadowBlurRadius": 6,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "pressedBackgroundColor": [
  "#000000"
 ],
 "paddingLeft": 0,
 "borderSize": 0,
 "iconBeforeLabel": true,
 "gap": 5,
 "iconURL": "skin/Button_775D3775_6F10_A324_41B1_8092A2023E17.png",
 "minHeight": 30,
 "borderColor": "#000000",
 "rollOverBackgroundColor": [
  "#C50A01"
 ],
 "fontColor": "#FFFFFF",
 "fontFamily": "Arial",
 "pressedBackgroundColorRatios": [
  0
 ],
 "height": 50,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "minWidth": 30,
 "mode": "push",
 "verticalAlign": "middle",
 "click": "this.setComponentVisibility(this.Container_47EBA17C_5FE3_89F1_41C4_50BC03196235_mobile, false, 0, this.effect_7E0FE099_696E_E2E0_4183_0FC331E0D87C, 'hideEffect', false)",
 "class": "Button",
 "paddingBottom": 0,
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "layout": "horizontal",
 "backgroundColor": [
  "#E7392B"
 ],
 "iconHeight": 32,
 "fontStyle": "normal",
 "shadow": false,
 "shadowSpread": 1,
 "paddingTop": 0,
 "iconWidth": 32,
 "textDecoration": "none",
 "cursor": "hand",
 "fontWeight": "normal",
 "backgroundOpacity": 1
},
{
 "duration": 5000,
 "height": 720,
 "thumbnailUrl": "media/album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_0_t.jpg",
 "label": "sz-rr-1",
 "id": "album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_0",
 "width": 1280,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_0.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "class": "Photo"
},
{
 "maxHeight": 58,
 "maxWidth": 58,
 "id": "IconButton_2E60A1ED_347D_0EFF_41BC_A36ED8CE8127_mobile",
 "width": 58,
 "borderRadius": 0,
 "paddingRight": 0,
 "iconURL": "skin/IconButton_2E60A1ED_347D_0EFF_41BC_A36ED8CE8127.png",
 "horizontalAlign": "center",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "transparencyActive": true,
 "class": "IconButton",
 "minWidth": 1,
 "mode": "toggle",
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "height": 58,
 "propagateClick": false,
 "pressedIconURL": "skin/IconButton_2E60A1ED_347D_0EFF_41BC_A36ED8CE8127_pressed.png",
 "data": {
  "name": "audio"
 },
 "shadow": false,
 "paddingTop": 0,
 "pressedRollOverIconURL": "skin/IconButton_2E60A1ED_347D_0EFF_41BC_A36ED8CE8127_pressed.png",
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "maxWidth": 7,
 "id": "Image_1FC43E22_342D_1564_41BB_A63B6F19A750_mobile",
 "width": 7,
 "borderRadius": 0,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "url": "skin/Image_1FC09DB8_342E_F764_41A3_E939228A46A8.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "minWidth": 1,
 "verticalAlign": "middle",
 "class": "Image",
 "paddingBottom": 0,
 "height": "98%",
 "propagateClick": false,
 "scaleMode": "fit_inside",
 "data": {
  "name": "-"
 },
 "shadow": false,
 "paddingTop": 0,
 "backgroundOpacity": 0
},
{
 "id": "HTMLText_6BDD8039_64A6_31E4_41D7_D3C38C6C69F2_mobile",
 "left": 10,
 "width": 369.9,
 "borderRadius": 0,
 "paddingRight": 0,
 "paddingLeft": 10,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "top": 18,
 "class": "HTMLText",
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": 124.05,
 "propagateClick": false,
 "data": {
  "name": "-STICKER"
 },
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-shadow:0px 0px 15px rgba(0,0,0,0.6);text-align:left;\"><SPAN STYLE=\"letter-spacing:0vmin; white-space:pre-wrap;color:#000000;font-family:'Segoe UI';\"><SPAN STYLE=\"color:#ffffff;font-size:7.43vmin;font-family:'Exo';\"><B><I>CHACOMER</I></B></SPAN></SPAN></DIV></div>",
 "backgroundOpacity": 0
},
{
 "hfov": 360,
 "hfovMax": 110,
 "label": "Panorama 1",
 "id": "panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00",
 "adjacentPanoramas": [
  {
   "backwardYaw": -179.59,
   "yaw": 0.53,
   "distance": 1,
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_535281A0_5C55_92BF_41A4_79774B470AC0"
  },
  {
   "backwardYaw": -178.75,
   "yaw": 0.63,
   "distance": 1,
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE"
  }
 ],
 "pitch": 0,
 "hfovMin": "120%",
 "partial": false,
 "vfov": 180,
 "frames": [
  {
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/f/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/f/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/f/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/f/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/u/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/u/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/u/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/u/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/r/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/r/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/r/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/r/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "thumbnailUrl": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_t.jpg",
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/b/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/b/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/b/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/b/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/d/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/d/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/d/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/d/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/l/0/{row}_{column}.jpg",
      "rowCount": 7,
      "height": 3584,
      "width": 3584,
      "colCount": 7,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/l/1/{row}_{column}.jpg",
      "rowCount": 4,
      "height": 2048,
      "width": 2048,
      "colCount": 4,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/l/2/{row}_{column}.jpg",
      "rowCount": 2,
      "height": 1024,
      "width": 1024,
      "colCount": 2,
      "tags": "ondemand",
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/l/3/{row}_{column}.jpg",
      "rowCount": 1,
      "height": 512,
      "width": 512,
      "colCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "class": "TiledImageResourceLevel"
     }
    ]
   },
   "class": "CubicPanoramaFrame"
  }
 ],
 "thumbnailUrl": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_t.jpg",
 "overlays": [
  "this.overlay_4B467524_5C4D_9387_41D4_FE380B89E883",
  "this.overlay_457513E3_5C4D_B681_41D5_C29B57F9222C",
  "this.panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_tcap0",
  "this.overlay_4215A49C_5DDC_9287_4197_A20A64EB886C",
  "this.overlay_43F20E1A_5DF4_B180_41C8_A5254D0B8997",
  "this.overlay_43DAC19D_5DCC_F281_41B5_CB50DF4B4D31",
  "this.overlay_4215E153_5DCC_7381_4139_4BFC1E7E89B8",
  "this.overlay_429A2AFB_5DCC_F681_41D5_0E61980C99DB",
  "this.overlay_76866CB1_5C4C_9281_41B8_9BFF2D75FD70",
  "this.overlay_7B869733_5DDC_9F81_41B8_814E71251A62",
  "this.popup_79373586_5DD4_7283_41BE_8F200EC72946",
  "this.popup_7091047F_5CB3_B181_41C4_0FD388D8E2D6",
  "this.overlay_69005F50_5C5C_6F9F_41CF_C9DE5DC5E977",
  "this.overlay_69004F50_5C5C_6F9F_41AA_797AD5218DF0",
  "this.overlay_69001F50_5C5C_6F9F_41C7_A19DC6FF0FEA",
  "this.overlay_69000F50_5C5C_6F9F_41A6_5AC2ABBEF1A6",
  "this.overlay_6901FF50_5C5C_6F9F_41C8_231691E68A0E",
  "this.overlay_6901CF50_5C5C_6F9F_41CA_3982EE239430",
  "this.overlay_69074F50_5C5C_6F9F_41C6_353298956340",
  "this.popup_69A9EED9_5C5C_6E81_41BD_BE0C02F1E982",
  "this.popup_695E2EDD_5C5C_6E81_41D3_FF26243DB19B",
  "this.overlay_46A4D789_5F78_EC60_41D3_58599F48EA5E",
  "this.overlay_4683F336_5F78_E4A0_41B9_66C64F5F92D6",
  "this.overlay_48313B5D_5FED_9933_41D6_4AFD6392D488"
 ],
 "class": "Panorama"
},
{
 "id": "HTMLText_524CEEAF_7E31_E3D9_41D5_A18634B5A288_mobile",
 "left": 10,
 "width": 546,
 "borderRadius": 0,
 "paddingRight": 0,
 "paddingLeft": 10,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "top": 81,
 "class": "HTMLText",
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": 85,
 "propagateClick": false,
 "data": {
  "name": "-STICKER"
 },
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-shadow:0px 0px 15px rgba(0,0,0,0.6);text-align:left;\"><SPAN STYLE=\"letter-spacing:0vmin; white-space:pre-wrap;color:#000000;font-family:'Segoe UI';\"><SPAN STYLE=\"color:#e7392b;font-size:5.25vmin;font-family:'Exo';\"><B><I>YAMAHA</I></B></SPAN></SPAN></DIV></div>",
 "backgroundOpacity": 0
},
{
 "maxWidth": 7,
 "id": "Image_1F5560D3_342D_0D24_41C3_009D491A3B6B_mobile",
 "width": 7,
 "borderRadius": 0,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "url": "skin/Image_1FC09DB8_342E_F764_41A3_E939228A46A8.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "minWidth": 1,
 "verticalAlign": "middle",
 "class": "Image",
 "paddingBottom": 0,
 "height": "98%",
 "propagateClick": false,
 "scaleMode": "fit_inside",
 "data": {
  "name": "-"
 },
 "shadow": false,
 "paddingTop": 0,
 "backgroundOpacity": 0
},
{
 "borderRadius": 0,
 "id": "Image_7DE3B59A_6911_E2E0_41D3_E1AF7DF208C7_mobile",
 "width": "100%",
 "paddingRight": 0,
 "horizontalAlign": "center",
 "url": "skin/Image_7DE3B59A_6911_E2E0_41D3_E1AF7DF208C7.jpg",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "minWidth": 1,
 "verticalAlign": "middle",
 "class": "Image",
 "paddingBottom": 0,
 "height": "44.444%",
 "propagateClick": false,
 "scaleMode": "fit_outside",
 "data": {
  "name": "Image"
 },
 "shadow": false,
 "paddingTop": 0,
 "backgroundOpacity": 0
},
{
 "buttonNext": "this.IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4_mobile",
 "id": "MainViewer_mobilePhotoAlbumPlayer",
 "class": "PhotoAlbumPlayer",
 "buttonPrevious": "this.IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC_mobile",
 "viewerArea": "this.MainViewer_mobile"
},
{
 "toolTipShadowSpread": 0,
 "transitionMode": "blending",
 "progressBackgroundColorDirection": "vertical",
 "id": "MainViewer_mobile",
 "left": 0,
 "playbackBarBorderSize": 0,
 "playbackBarBottom": 5,
 "width": "100%",
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowVerticalLength": 0,
 "toolTipShadowHorizontalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 50,
 "playbackBarHeadHeight": 15,
 "toolTipBorderRadius": 3,
 "displayTooltipInTouchScreens": true,
 "progressBackgroundColorRatios": [
  0
 ],
 "toolTipPaddingLeft": 6,
 "vrPointerSelectionTime": 2000,
 "playbackBarLeft": 0,
 "progressBorderColor": "#000000",
 "class": "ViewerArea",
 "firstTransitionDuration": 0,
 "minWidth": 100,
 "playbackBarHeadWidth": 6,
 "toolTipDisplayTime": 600,
 "toolTipFontStyle": "normal",
 "progressBorderSize": 0,
 "playbackBarHeadShadowColor": "#000000",
 "playbackBarHeadShadowVerticalLength": 0,
 "toolTipShadowBlurRadius": 3,
 "height": "100%",
 "propagateClick": false,
 "progressBottom": 0,
 "toolTipBackgroundColor": "#F6F6F6",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "toolTipFontFamily": "Arial",
 "playbackBarBorderRadius": 0,
 "progressOpacity": 1,
 "toolTipBorderSize": 1,
 "toolTipFontWeight": "normal",
 "playbackBarBackgroundColorDirection": "vertical",
 "shadow": false,
 "transitionDuration": 500,
 "toolTipPaddingBottom": 4,
 "toolTipFontSize": 12,
 "toolTipPaddingTop": 4,
 "progressHeight": 10,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarRight": 0,
 "progressLeft": 0,
 "borderRadius": 0,
 "progressBarBorderColor": "#000000",
 "playbackBarBackgroundOpacity": 1,
 "progressBackgroundOpacity": 1,
 "playbackBarHeadBorderRadius": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadShadowHorizontalLength": 0,
 "progressRight": 0,
 "paddingRight": 0,
 "playbackBarHeadShadow": true,
 "playbackBarOpacity": 1,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarHeadBorderSize": 0,
 "toolTipTextShadowOpacity": 0,
 "toolTipOpacity": 1,
 "playbackBarHeadShadowBlurRadius": 3,
 "top": 0,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "vrPointerColor": "#FFFFFF",
 "toolTipFontColor": "#606060",
 "progressBarOpacity": 1,
 "progressBorderRadius": 0,
 "toolTipPaddingRight": 6,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "vrPointerSelectionColor": "#FF6600",
 "paddingBottom": 0,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarProgressOpacity": 1,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "toolTipShadowColor": "#333333",
 "toolTipBorderColor": "#767676",
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarProgressBorderSize": 0,
 "toolTipTextShadowBlurRadius": 3,
 "progressBarBorderSize": 0,
 "playbackBarHeadOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "progressBarBorderRadius": 0,
 "data": {
  "name": "Main Viewer"
 },
 "toolTipShadowOpacity": 1,
 "paddingTop": 0,
 "playbackBarHeight": 10,
 "progressBarBackgroundColorDirection": "vertical"
},
{
 "items": [
  {
   "media": "this.video_636358BB_5DD5_9281_41D0_CDF25C2DBC6B",
   "start": "this.viewer_uid73117E24_6037_FA4F_41CD_81117C60F5A8VideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.playList_742B213C_602B_46B8_41B0_F1BFB3AAD667, 0, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.playList_742B213C_602B_46B8_41B0_F1BFB3AAD667, 0)",
   "begin": "this.fixTogglePlayPauseButton(this.viewer_uid73117E24_6037_FA4F_41CD_81117C60F5A8VideoPlayer)",
   "player": "this.viewer_uid73117E24_6037_FA4F_41CD_81117C60F5A8VideoPlayer",
   "class": "VideoPlayListItem"
  }
 ],
 "id": "playList_742B213C_602B_46B8_41B0_F1BFB3AAD667",
 "class": "PlayList"
},
{
 "duration": 5000,
 "height": 634,
 "thumbnailUrl": "media/album_705F61E7_5C4C_9281_41D4_67432D954851_1_t.jpg",
 "label": "Yamaha-MT320 02",
 "id": "album_705F61E7_5C4C_9281_41D4_67432D954851_1",
 "width": 850,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_705F61E7_5C4C_9281_41D4_67432D954851_1.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "class": "Photo"
},
{
 "scrollBarMargin": 2,
 "headerBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "id": "window_6A325B13_5C7C_B781_41BD_00CC4BEAF25C",
 "veilHideEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeOutEffect"
 },
 "showEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeInEffect"
 },
 "width": 400,
 "veilColor": [
  "#000000",
  "#000000"
 ],
 "gap": 10,
 "veilShowEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeInEffect"
 },
 "shadowBlurRadius": 6,
 "bodyBackgroundColorRatios": [
  0,
  0.5,
  1
 ],
 "scrollBarColor": "#000000",
 "horizontalAlign": "center",
 "shadowVerticalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 20,
 "titlePaddingRight": 5,
 "bodyPaddingTop": 0,
 "headerPaddingRight": 0,
 "bodyPaddingRight": 0,
 "bodyPaddingBottom": 0,
 "titleFontWeight": "normal",
 "modal": true,
 "height": 600,
 "hideEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeOutEffect"
 },
 "minWidth": 20,
 "class": "Window",
 "headerVerticalAlign": "middle",
 "title": "",
 "titlePaddingLeft": 5,
 "backgroundColor": [],
 "closeButtonPressedBackgroundColor": [],
 "titlePaddingTop": 5,
 "closeButtonPressedBackgroundColorRatios": [
  0
 ],
 "headerBackgroundOpacity": 0,
 "bodyBackgroundColor": [
  "#FFFFFF",
  "#DDDDDD",
  "#FFFFFF"
 ],
 "bodyPaddingLeft": 0,
 "veilOpacity": 0.4,
 "closeButtonPressedIconLineWidth": 3,
 "propagateClick": false,
 "closeButtonBackgroundColor": [],
 "shadow": true,
 "titleTextDecoration": "none",
 "titleFontFamily": "Arial",
 "scrollBarWidth": 10,
 "closeButtonBorderRadius": 11,
 "backgroundOpacity": 1,
 "closeButtonIconWidth": 20,
 "closeButtonPressedIconColor": "#FFFFFF",
 "children": [
  "this.container_732AEE21_6037_FA49_41CE_AE819BBD1ABB"
 ],
 "closeButtonIconHeight": 20,
 "borderRadius": 5,
 "titlePaddingBottom": 5,
 "backgroundColorRatios": [],
 "closeButtonIconLineWidth": 2,
 "shadowColor": "#000000",
 "headerBorderSize": 0,
 "shadowOpacity": 0.5,
 "closeButtonRollOverBackgroundColor": [],
 "paddingRight": 0,
 "closeButtonRollOverBackgroundColorRatios": [
  0
 ],
 "headerPaddingLeft": 10,
 "veilColorRatios": [
  0,
  1
 ],
 "headerPaddingBottom": 5,
 "footerHeight": 5,
 "headerBackgroundColorDirection": "vertical",
 "bodyBackgroundOpacity": 0,
 "footerBackgroundColorDirection": "vertical",
 "footerBackgroundColor": [
  "#FFFFFF",
  "#EEEEEE",
  "#DDDDDD"
 ],
 "titleFontStyle": "normal",
 "contentOpaque": false,
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "footerBackgroundOpacity": 0,
 "bodyBackgroundColorDirection": "vertical",
 "closeButtonBackgroundColorRatios": [],
 "shadowHorizontalLength": 3,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "titleFontSize": "1.29vmin",
 "backgroundColorDirection": "vertical",
 "layout": "vertical",
 "titleFontColor": "#000000",
 "closeButtonIconColor": "#B2B2B2",
 "veilColorDirection": "horizontal",
 "headerBorderColor": "#000000",
 "headerPaddingTop": 10,
 "overflow": "scroll",
 "closeButtonRollOverIconColor": "#FFFFFF",
 "paddingTop": 0,
 "headerBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "data": {
  "name": "Window49332"
 },
 "footerBackgroundColorRatios": [
  0,
  0.9,
  1
 ],
 "shadowSpread": 1
},
{
 "rotationY": 0,
 "hfov": 7.2,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_69A9EED9_5C5C_6E81_41BD_BE0C02F1E982",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_69A9EED9_5C5C_6E81_41BD_BE0C02F1E982_0_1.jpg",
    "width": 1024,
    "class": "ImageResourceLevel",
    "height": 1024
   }
  ]
 },
 "pitch": -1.35,
 "popupMaxWidth": "95%",
 "yaw": 85.18,
 "class": "PopupPanoramaOverlay",
 "showDuration": 500
},
{
 "change": "this.showComponentsWhileMouseOver(this.container_732F3E23_6037_FA49_41B3_189EBBF8103B, [this.htmltext_732F8E24_6037_FA4F_41BB_A3EBE6F80791,this.component_732EDE24_6037_FA4F_41AF_318F59D81763,this.component_732EEE24_6037_FA4F_41D5_62712980355A], 2000)",
 "items": [
  "this.albumitem_732F7E23_6037_FA49_4176_622C212C18EA"
 ],
 "id": "playList_742DB135_602B_4648_41D1_6A41261040D1",
 "class": "PlayList"
},
{
 "items": [
  {
   "media": "this.panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00",
   "begin": "this.setEndToItemIndex(this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist, 0, 1)",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_camera"
  },
  {
   "media": "this.panorama_535281A0_5C55_92BF_41A4_79774B470AC0",
   "begin": "this.setEndToItemIndex(this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist, 1, 2)",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_535281A0_5C55_92BF_41A4_79774B470AC0_camera"
  },
  {
   "media": "this.panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE",
   "begin": "this.setEndToItemIndex(this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist, 2, 3)",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_camera"
  },
  {
   "media": "this.panorama_5373C82A_5C54_9183_41D5_746C6CF32C38",
   "begin": "this.setEndToItemIndex(this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist, 3, 4)",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_camera"
  },
  {
   "media": "this.video_786B48A9_5DD5_9281_41D6_F860A1820E4B",
   "start": "this.MainViewer_mobileVideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist, 4, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist, 4)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewer_mobileVideoPlayer); this.setEndToItemIndex(this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist, 4, 5)",
   "player": "this.MainViewer_mobileVideoPlayer",
   "class": "VideoPlayListItem"
  },
  {
   "media": "this.album_705F61E7_5C4C_9281_41D4_67432D954851",
   "player": "this.MainViewer_mobilePhotoAlbumPlayer",
   "begin": "this.setEndToItemIndex(this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist, 5, 6)",
   "class": "PhotoAlbumPlayListItem"
  },
  {
   "media": "this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A",
   "player": "this.MainViewer_mobilePhotoAlbumPlayer",
   "begin": "this.setEndToItemIndex(this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist, 6, 7)",
   "class": "PhotoAlbumPlayListItem"
  },
  {
   "media": "this.video_6D28BB12_5C4D_9783_41D4_8A27FA748C2B",
   "start": "this.MainViewer_mobileVideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist, 7, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist, 7)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewer_mobileVideoPlayer); this.setEndToItemIndex(this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist, 7, 8)",
   "player": "this.MainViewer_mobileVideoPlayer",
   "class": "VideoPlayListItem"
  },
  {
   "media": "this.album_623D971A_5DD7_9F83_417C_6FB0FF992743",
   "player": "this.MainViewer_mobilePhotoAlbumPlayer",
   "begin": "this.setEndToItemIndex(this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist, 8, 9)",
   "class": "PhotoAlbumPlayListItem"
  },
  {
   "media": "this.video_636358BB_5DD5_9281_41D0_CDF25C2DBC6B",
   "start": "this.MainViewer_mobileVideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist, 9, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist, 9)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewer_mobileVideoPlayer); this.setEndToItemIndex(this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist, 9, 10)",
   "player": "this.MainViewer_mobileVideoPlayer",
   "class": "VideoPlayListItem"
  },
  {
   "media": "this.album_6076EEE4_5DF7_EE80_41C0_70404B70EF36",
   "player": "this.MainViewer_mobilePhotoAlbumPlayer",
   "begin": "this.setEndToItemIndex(this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist, 10, 11)",
   "class": "PhotoAlbumPlayListItem"
  },
  {
   "media": "this.video_6138AF13_5DF4_6F81_41CF_B052B4DA69FF",
   "start": "this.MainViewer_mobileVideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist, 11, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist, 11)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewer_mobileVideoPlayer); this.setEndToItemIndex(this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist, 11, 0)",
   "player": "this.MainViewer_mobileVideoPlayer",
   "class": "VideoPlayListItem"
  }
 ],
 "id": "ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist",
 "class": "PlayList"
},
{
 "maxWidth": 7,
 "id": "Image_1FC09DB8_342E_F764_41A3_E939228A46A8_mobile",
 "width": 7,
 "borderRadius": 0,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "url": "skin/Image_1FC09DB8_342E_F764_41A3_E939228A46A8.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "minWidth": 1,
 "verticalAlign": "middle",
 "class": "Image",
 "paddingBottom": 0,
 "height": "98%",
 "propagateClick": false,
 "scaleMode": "fit_inside",
 "data": {
  "name": "-"
 },
 "shadow": false,
 "paddingTop": 0,
 "backgroundOpacity": 0
},
{
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_61DC12C0_5DF5_B6FF_4198_5687742A7BA8.mp3",
  "oggUrl": "media/audio_61DC12C0_5DF5_B6FF_4198_5687742A7BA8.ogg",
  "class": "AudioResource"
 },
 "id": "audio_61DC12C0_5DF5_B6FF_4198_5687742A7BA8",
 "data": {
  "label": "Yamaha SZ-RR"
 },
 "class": "MediaAudio"
},
{
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_736C4E59_6037_FAF9_41D2_46D92D03655D",
 "id": "camera_736DBE59_6037_FAF9_41C3_8E7DA16B851A",
 "class": "PanoramaCamera",
 "initialPosition": {
  "hfov": 95,
  "yaw": 1.25,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "rotationY": 0,
 "hfov": 7.16,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_6653B4B8_5DB3_928F_41C8_756BE38CA23E",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_6653B4B8_5DB3_928F_41C8_756BE38CA23E_0_1.jpg",
    "width": 1024,
    "class": "ImageResourceLevel",
    "height": 1024
   }
  ]
 },
 "pitch": -6.16,
 "popupMaxWidth": "95%",
 "yaw": 84.29,
 "class": "PopupPanoramaOverlay",
 "showDuration": 500
},
{
 "id": "MainViewer_mobileVideoPlayer",
 "class": "VideoPlayer",
 "displayPlaybackBar": true,
 "viewerArea": "this.MainViewer_mobile"
},
{
 "duration": 5000,
 "height": 338,
 "thumbnailUrl": "media/album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_1_t.jpg",
 "label": "Yamaha-MTZ 150 03",
 "id": "album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_1",
 "width": 600,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_1.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "class": "Photo"
},
{
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_73447E75_6037_FAC9_41D0_C3D7F61FC764",
 "id": "camera_73445E75_6037_FAC9_418A_1AFDAFDDEF7C",
 "class": "PanoramaCamera",
 "initialPosition": {
  "hfov": 95,
  "yaw": 1.28,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "buttonNext": "this.IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4_mobile",
 "id": "ViewerAreaLabeled_3AEAC6FC_3514_3866_41BA_E46727E47B58_mobilePhotoAlbumPlayer",
 "class": "PhotoAlbumPlayer",
 "buttonPrevious": "this.IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC_mobile",
 "viewerArea": "this.ViewerAreaLabeled_3AEAC6FC_3514_3866_41BA_E46727E47B58_mobile"
},
{
 "thumbnailUrl": "media/album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_t.png",
 "label": "Album de Fotos Yamaha-MTZ 150 02",
 "class": "PhotoAlbum",
 "id": "album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A",
 "playList": "this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_AlbumPlayList"
},
{
 "items": [
  {
   "media": "this.panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 0, 1)",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_camera"
  },
  {
   "media": "this.panorama_535281A0_5C55_92BF_41A4_79774B470AC0",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 1, 2)",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_535281A0_5C55_92BF_41A4_79774B470AC0_camera"
  },
  {
   "media": "this.panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 2, 3)",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_camera"
  },
  {
   "media": "this.panorama_5373C82A_5C54_9183_41D5_746C6CF32C38",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 3, 4)",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_camera"
  },
  {
   "media": "this.video_786B48A9_5DD5_9281_41D6_F860A1820E4B",
   "start": "this.MainViewer_mobileVideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 4, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 4)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewer_mobileVideoPlayer); this.setEndToItemIndex(this.mainPlayList, 4, 5)",
   "player": "this.MainViewer_mobileVideoPlayer",
   "class": "VideoPlayListItem"
  },
  {
   "media": "this.album_705F61E7_5C4C_9281_41D4_67432D954851",
   "player": "this.MainViewer_mobilePhotoAlbumPlayer",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 5, 6)",
   "class": "PhotoAlbumPlayListItem"
  },
  {
   "media": "this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A",
   "player": "this.MainViewer_mobilePhotoAlbumPlayer",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 6, 7)",
   "class": "PhotoAlbumPlayListItem"
  },
  {
   "media": "this.video_6D28BB12_5C4D_9783_41D4_8A27FA748C2B",
   "start": "this.MainViewer_mobileVideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 7, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 7)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewer_mobileVideoPlayer); this.setEndToItemIndex(this.mainPlayList, 7, 8)",
   "player": "this.MainViewer_mobileVideoPlayer",
   "class": "VideoPlayListItem"
  },
  {
   "media": "this.album_623D971A_5DD7_9F83_417C_6FB0FF992743",
   "player": "this.MainViewer_mobilePhotoAlbumPlayer",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 8, 9)",
   "class": "PhotoAlbumPlayListItem"
  },
  {
   "media": "this.video_636358BB_5DD5_9281_41D0_CDF25C2DBC6B",
   "start": "this.MainViewer_mobileVideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 9, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 9)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewer_mobileVideoPlayer); this.setEndToItemIndex(this.mainPlayList, 9, 10)",
   "player": "this.MainViewer_mobileVideoPlayer",
   "class": "VideoPlayListItem"
  },
  {
   "media": "this.album_6076EEE4_5DF7_EE80_41C0_70404B70EF36",
   "player": "this.MainViewer_mobilePhotoAlbumPlayer",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 10, 11)",
   "class": "PhotoAlbumPlayListItem"
  },
  {
   "media": "this.video_6138AF13_5DF4_6F81_41CF_B052B4DA69FF",
   "end": "this.trigger('tourEnded')",
   "start": "this.MainViewer_mobileVideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 11, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 11)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewer_mobileVideoPlayer); this.setEndToItemIndex(this.mainPlayList, 11, 0)",
   "player": "this.MainViewer_mobileVideoPlayer",
   "class": "VideoPlayListItem"
  }
 ],
 "id": "mainPlayList",
 "class": "PlayList"
},
{
 "maxHeight": 58,
 "maxWidth": 58,
 "id": "IconButton_2E6081ED_347D_0EFF_41AA_ECC3AD42DC4D_mobile",
 "width": 58,
 "borderRadius": 0,
 "paddingRight": 0,
 "iconURL": "skin/IconButton_2E6081ED_347D_0EFF_41AA_ECC3AD42DC4D.png",
 "horizontalAlign": "center",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "transparencyActive": true,
 "class": "IconButton",
 "minWidth": 1,
 "mode": "toggle",
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "height": 58,
 "propagateClick": false,
 "pressedIconURL": "skin/IconButton_2E6081ED_347D_0EFF_41AA_ECC3AD42DC4D_pressed.png",
 "data": {
  "name": "fullscreen"
 },
 "shadow": false,
 "paddingTop": 0,
 "pressedRollOverIconURL": "skin/IconButton_2E6081ED_347D_0EFF_41AA_ECC3AD42DC4D_pressed.png",
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "visible": false,
 "borderRadius": 0,
 "children": [
  "this.IconButton_2E6041ED_347D_0EFF_41BF_3C82AFA80CBB_mobile",
  "this.IconButton_2E60B1ED_347D_0EFF_41C3_3E7369236DCE_mobile",
  "this.IconButton_2E60A1ED_347D_0EFF_41BC_A36ED8CE8127_mobile",
  "this.IconButton_2E6091ED_347D_0EFF_41C6_E6D253232DA1_mobile",
  "this.IconButton_2E6081ED_347D_0EFF_41AA_ECC3AD42DC4D_mobile",
  "this.IconButton_2E60F1ED_347D_0EFF_41C9_4BA017DDD347_mobile",
  "this.IconButton_2E60E1EE_347D_0EFC_41C3_A8DD2E2819ED_mobile"
 ],
 "id": "Container_2E6011ED_347D_0EFF_41C9_5AC77536D968_mobile",
 "width": "91.304%",
 "right": "0%",
 "paddingRight": 0,
 "gap": 3,
 "horizontalAlign": "center",
 "creationPolicy": "inAdvance",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "contentOpaque": false,
 "minWidth": 1,
 "verticalAlign": "top",
 "bottom": "0%",
 "class": "Container",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": "85.959%",
 "propagateClick": false,
 "layout": "vertical",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "down"
 },
 "scrollBarWidth": 10,
 "backgroundOpacity": 0
},
{
 "duration": 500,
 "easing": "linear",
 "id": "effect_7E0FE099_696E_E2E0_4183_0FC331E0D87C",
 "class": "FadeOutEffect"
},
{
 "rollOverBackgroundOpacity": 0,
 "fontSize": "22px",
 "label": "\u00c1LBUM DE FOTOS",
 "id": "Button_748008CC_648F_B8AA_41C2_97E5C5DE0CD2_mobile",
 "width": 139,
 "shadowColor": "#000000",
 "borderRadius": 0,
 "shadowBlurRadius": 6,
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "horizontalAlign": "center",
 "paddingLeft": 0,
 "borderSize": 0,
 "iconBeforeLabel": true,
 "gap": 5,
 "borderColor": "#000000",
 "minHeight": 1,
 "fontColor": "#FFFFFF",
 "fontFamily": "Akhand-Bold",
 "minWidth": 1,
 "mode": "push",
 "verticalAlign": "middle",
 "click": "this.setComponentVisibility(this.Container_3A863D9B_3513_E8A1_41BD_38320457DF78_mobile, true, 0, this.effect_77FFEBD0_6F11_A37D_41CF_E0702F0FF71B, 'showEffect', false); this.ViewerAreaLabeled_3AEAC6FC_3514_3866_41BA_E46727E47B58_mobile.bind('hide', function(e){ e.source.unbind('hide', arguments.callee, this); this.playList_73290E1E_6037_FA7B_41D3_5DA9DBBFAFF7.set('selectedIndex', -1); }, this); this.playList_73290E1E_6037_FA7B_41D3_5DA9DBBFAFF7.set('selectedIndex', 0)",
 "class": "Button",
 "paddingBottom": 0,
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "fontStyle": "normal",
 "layout": "horizontal",
 "rollOverFontColor": "#FF0000",
 "height": "100%",
 "propagateClick": false,
 "iconHeight": 32,
 "data": {
  "name": "photoalbum"
 },
 "shadow": false,
 "shadowSpread": 1,
 "paddingTop": 0,
 "iconWidth": 32,
 "textDecoration": "none",
 "cursor": "hand",
 "fontWeight": "normal",
 "backgroundOpacity": 0
},
{
 "duration": 500,
 "easing": "linear",
 "id": "effect_77FFEBD0_6F11_A37D_41CF_E0702F0FF71B",
 "class": "FadeInEffect"
},
{
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_63F1E49E_5DD3_9283_41D6_582E0D8140C0.mp3",
  "oggUrl": "media/audio_63F1E49E_5DD3_9283_41D6_582E0D8140C0.ogg",
  "class": "AudioResource"
 },
 "id": "audio_63F1E49E_5DD3_9283_41D6_582E0D8140C0",
 "data": {
  "label": "Yamaha YCZ110"
 },
 "class": "MediaAudio"
},
{
 "borderRadius": 0,
 "children": [
  "this.Image_7DE3B59A_6911_E2E0_41D3_E1AF7DF208C7_mobile",
  "this.HTMLText_7DE3759A_6911_E2E0_41A7_C2659986BA1F_mobile",
  "this.Button_7DE3659A_6911_E2E0_41C3_93316288CBE4_mobile"
 ],
 "scrollBarWidth": 10,
 "id": "Container_7DE3459A_6911_E2E0_41CE_F97D3E361A8D_mobile",
 "width": "100%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "gap": 10,
 "horizontalAlign": "center",
 "creationPolicy": "inAdvance",
 "paddingLeft": 0,
 "paddingRight": 0,
 "scrollBarColor": "#E73B2C",
 "minHeight": 300,
 "borderSize": 0,
 "contentOpaque": false,
 "class": "Container",
 "minWidth": 100,
 "verticalAlign": "middle",
 "paddingBottom": 19,
 "scrollBarOpacity": 0.79,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "layout": "vertical",
 "height": "100%",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "Container text"
 },
 "backgroundOpacity": 0.3
},
{
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_53439A1A_5C54_B183_41C4_02C53D863FE2",
 "id": "panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "hfov": 95,
  "yaw": 0.7,
  "class": "PanoramaCameraPosition",
  "pitch": -23.73
 }
},
{
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_73B42E82_6037_FA4B_41AE_EC976D31B623",
 "id": "camera_73B43E82_6037_FA4B_41D4_DDEA35EC638D",
 "class": "PanoramaCamera",
 "initialPosition": {
  "hfov": 95,
  "yaw": -179.37,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "duration": 500,
 "easing": "linear",
 "id": "effect_77AF96BF_6F11_E523_41B8_61E169A25F9B",
 "class": "FadeOutEffect"
},
{
 "duration": 500,
 "easing": "linear",
 "id": "effect_48294A97_5F78_246F_41D3_97C6C718F84C",
 "class": "FadeInEffect"
},
{
 "touchControlMode": "drag_rotation",
 "gyroscopeVerticalDraggingEnabled": true,
 "buttonToggleHotspots": "this.IconButton_2E6091ED_347D_0EFF_41C6_E6D253232DA1_mobile",
 "viewerArea": "this.MainViewer_mobile",
 "buttonCardboardView": "this.IconButton_2E6041ED_347D_0EFF_41BF_3C82AFA80CBB_mobile",
 "id": "MainViewer_mobilePanoramaPlayer",
 "mouseControlMode": "drag_rotation",
 "class": "PanoramaPlayer",
 "displayPlaybackBar": true,
 "buttonToggleGyroscope": "this.IconButton_2E60B1ED_347D_0EFF_41C3_3E7369236DCE_mobile"
},
{
 "scrollBarMargin": 2,
 "headerBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "id": "window_62499340_5DCC_97FF_41D6_BF532A97C63A",
 "veilHideEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeOutEffect"
 },
 "showEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeInEffect"
 },
 "width": 400,
 "veilColor": [
  "#000000",
  "#000000"
 ],
 "gap": 10,
 "veilShowEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeInEffect"
 },
 "shadowBlurRadius": 6,
 "bodyBackgroundColorRatios": [
  0,
  0.5,
  1
 ],
 "scrollBarColor": "#000000",
 "horizontalAlign": "center",
 "shadowVerticalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 20,
 "titlePaddingRight": 5,
 "bodyPaddingTop": 0,
 "headerPaddingRight": 0,
 "bodyPaddingRight": 0,
 "bodyPaddingBottom": 0,
 "titleFontWeight": "normal",
 "modal": true,
 "height": 600,
 "hideEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeOutEffect"
 },
 "minWidth": 20,
 "class": "Window",
 "headerVerticalAlign": "middle",
 "title": "",
 "titlePaddingLeft": 5,
 "backgroundColor": [],
 "closeButtonPressedBackgroundColor": [],
 "titlePaddingTop": 5,
 "closeButtonPressedBackgroundColorRatios": [
  0
 ],
 "headerBackgroundOpacity": 0,
 "bodyBackgroundColor": [
  "#FFFFFF",
  "#DDDDDD",
  "#FFFFFF"
 ],
 "bodyPaddingLeft": 0,
 "veilOpacity": 0.4,
 "closeButtonPressedIconLineWidth": 3,
 "propagateClick": false,
 "closeButtonBackgroundColor": [],
 "shadow": true,
 "titleTextDecoration": "none",
 "titleFontFamily": "Arial",
 "scrollBarWidth": 10,
 "closeButtonBorderRadius": 11,
 "backgroundOpacity": 1,
 "closeButtonIconWidth": 20,
 "closeButtonPressedIconColor": "#FFFFFF",
 "children": [
  "this.container_732EAE25_6037_FA49_41CE_0A91B7C623E6"
 ],
 "closeButtonIconHeight": 20,
 "borderRadius": 5,
 "titlePaddingBottom": 5,
 "backgroundColorRatios": [],
 "closeButtonIconLineWidth": 2,
 "shadowColor": "#000000",
 "headerBorderSize": 0,
 "shadowOpacity": 0.5,
 "closeButtonRollOverBackgroundColor": [],
 "paddingRight": 0,
 "closeButtonRollOverBackgroundColorRatios": [
  0
 ],
 "headerPaddingLeft": 10,
 "veilColorRatios": [
  0,
  1
 ],
 "headerPaddingBottom": 5,
 "footerHeight": 5,
 "headerBackgroundColorDirection": "vertical",
 "bodyBackgroundOpacity": 0,
 "footerBackgroundColorDirection": "vertical",
 "footerBackgroundColor": [
  "#FFFFFF",
  "#EEEEEE",
  "#DDDDDD"
 ],
 "titleFontStyle": "normal",
 "contentOpaque": false,
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "footerBackgroundOpacity": 0,
 "bodyBackgroundColorDirection": "vertical",
 "closeButtonBackgroundColorRatios": [],
 "shadowHorizontalLength": 3,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "titleFontSize": "1.29vmin",
 "backgroundColorDirection": "vertical",
 "layout": "vertical",
 "titleFontColor": "#000000",
 "closeButtonIconColor": "#B2B2B2",
 "veilColorDirection": "horizontal",
 "headerBorderColor": "#000000",
 "headerPaddingTop": 10,
 "overflow": "scroll",
 "closeButtonRollOverIconColor": "#FFFFFF",
 "paddingTop": 0,
 "headerBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "data": {
  "name": "Window46522"
 },
 "footerBackgroundColorRatios": [
  0,
  0.9,
  1
 ],
 "shadowSpread": 1
},
{
 "borderRadius": 0,
 "children": [
  "this.IconButton_4C961A19_5F77_E460_41C9_6FC9CD92F3CB"
 ],
 "scrollBarWidth": 10,
 "id": "Container_4C960A19_5F77_E460_41C2_253939CF6793",
 "backgroundColorRatios": [
  0,
  1
 ],
 "width": "100%",
 "gap": 10,
 "paddingRight": 0,
 "horizontalAlign": "left",
 "creationPolicy": "inAdvance",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "contentOpaque": false,
 "height": 140,
 "minWidth": 1,
 "verticalAlign": "top",
 "class": "Container",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "layout": "absolute",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "header"
 },
 "backgroundOpacity": 0.3
},
{
 "maxWidth": 7,
 "id": "Image_1F089AA1_342D_3D64_41C5_D320F4A4C707_mobile",
 "width": 7,
 "borderRadius": 0,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "url": "skin/Image_1FC09DB8_342E_F764_41A3_E939228A46A8.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "minWidth": 1,
 "verticalAlign": "middle",
 "class": "Image",
 "paddingBottom": 0,
 "height": "98%",
 "propagateClick": false,
 "scaleMode": "fit_inside",
 "data": {
  "name": "-"
 },
 "shadow": false,
 "paddingTop": 0,
 "backgroundOpacity": 0
},
{
 "rotationY": 0,
 "hfov": 7.17,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_6257F33E_5DCC_9783_41B0_97B5816F9903",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_6257F33E_5DCC_9783_41B0_97B5816F9903_0_1.jpg",
    "width": 1024,
    "class": "ImageResourceLevel",
    "height": 1024
   }
  ]
 },
 "pitch": -5.29,
 "popupMaxWidth": "95%",
 "yaw": 103.76,
 "class": "PopupPanoramaOverlay",
 "showDuration": 500
},
{
 "maxHeight": 58,
 "maxWidth": 58,
 "id": "IconButton_2E6091ED_347D_0EFF_41C6_E6D253232DA1_mobile",
 "width": 58,
 "borderRadius": 0,
 "paddingRight": 0,
 "iconURL": "skin/IconButton_2E6091ED_347D_0EFF_41C6_E6D253232DA1.png",
 "horizontalAlign": "center",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "transparencyActive": true,
 "class": "IconButton",
 "minWidth": 1,
 "mode": "toggle",
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "height": 58,
 "propagateClick": false,
 "pressedIconURL": "skin/IconButton_2E6091ED_347D_0EFF_41C6_E6D253232DA1_pressed.png",
 "data": {
  "name": "HS"
 },
 "shadow": false,
 "paddingTop": 0,
 "pressedRollOverIconURL": "skin/IconButton_2E6091ED_347D_0EFF_41C6_E6D253232DA1_pressed.png",
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "rotationY": 0,
 "hfov": 7.09,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_7091047F_5CB3_B181_41C4_0FD388D8E2D6",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_7091047F_5CB3_B181_41C4_0FD388D8E2D6_0_1.jpg",
    "width": 1024,
    "class": "ImageResourceLevel",
    "height": 1024
   }
  ]
 },
 "pitch": -9.99,
 "popupMaxWidth": "95%",
 "yaw": -117.95,
 "class": "PopupPanoramaOverlay",
 "showDuration": 500
},
{
 "scrollBarMargin": 2,
 "headerBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "id": "window_665D74BA_5DB3_9283_41D0_3F32A6E870CE",
 "veilHideEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeOutEffect"
 },
 "showEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeInEffect"
 },
 "width": 400,
 "veilColor": [
  "#000000",
  "#000000"
 ],
 "gap": 10,
 "veilShowEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeInEffect"
 },
 "shadowBlurRadius": 6,
 "bodyBackgroundColorRatios": [
  0,
  0.5,
  1
 ],
 "scrollBarColor": "#000000",
 "horizontalAlign": "center",
 "shadowVerticalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 20,
 "titlePaddingRight": 5,
 "bodyPaddingTop": 0,
 "headerPaddingRight": 0,
 "bodyPaddingRight": 0,
 "bodyPaddingBottom": 0,
 "titleFontWeight": "normal",
 "modal": true,
 "height": 600,
 "hideEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeOutEffect"
 },
 "minWidth": 20,
 "class": "Window",
 "headerVerticalAlign": "middle",
 "title": "",
 "titlePaddingLeft": 5,
 "backgroundColor": [],
 "closeButtonPressedBackgroundColor": [],
 "titlePaddingTop": 5,
 "closeButtonPressedBackgroundColorRatios": [
  0
 ],
 "headerBackgroundOpacity": 0,
 "bodyBackgroundColor": [
  "#FFFFFF",
  "#DDDDDD",
  "#FFFFFF"
 ],
 "bodyPaddingLeft": 0,
 "veilOpacity": 0.4,
 "closeButtonPressedIconLineWidth": 3,
 "propagateClick": false,
 "closeButtonBackgroundColor": [],
 "shadow": true,
 "titleTextDecoration": "none",
 "titleFontFamily": "Arial",
 "scrollBarWidth": 10,
 "closeButtonBorderRadius": 11,
 "backgroundOpacity": 1,
 "closeButtonIconWidth": 20,
 "closeButtonPressedIconColor": "#FFFFFF",
 "children": [
  "this.container_732F3E23_6037_FA49_41B3_189EBBF8103B"
 ],
 "closeButtonIconHeight": 20,
 "borderRadius": 5,
 "titlePaddingBottom": 5,
 "backgroundColorRatios": [],
 "closeButtonIconLineWidth": 2,
 "shadowColor": "#000000",
 "headerBorderSize": 0,
 "shadowOpacity": 0.5,
 "closeButtonRollOverBackgroundColor": [],
 "paddingRight": 0,
 "closeButtonRollOverBackgroundColorRatios": [
  0
 ],
 "headerPaddingLeft": 10,
 "veilColorRatios": [
  0,
  1
 ],
 "headerPaddingBottom": 5,
 "footerHeight": 5,
 "headerBackgroundColorDirection": "vertical",
 "bodyBackgroundOpacity": 0,
 "footerBackgroundColorDirection": "vertical",
 "footerBackgroundColor": [
  "#FFFFFF",
  "#EEEEEE",
  "#DDDDDD"
 ],
 "titleFontStyle": "normal",
 "contentOpaque": false,
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "footerBackgroundOpacity": 0,
 "bodyBackgroundColorDirection": "vertical",
 "closeButtonBackgroundColorRatios": [],
 "shadowHorizontalLength": 3,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "titleFontSize": "1.29vmin",
 "backgroundColorDirection": "vertical",
 "layout": "vertical",
 "titleFontColor": "#000000",
 "closeButtonIconColor": "#B2B2B2",
 "veilColorDirection": "horizontal",
 "headerBorderColor": "#000000",
 "headerPaddingTop": 10,
 "overflow": "scroll",
 "closeButtonRollOverIconColor": "#FFFFFF",
 "paddingTop": 0,
 "headerBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "data": {
  "name": "Window46522"
 },
 "footerBackgroundColorRatios": [
  0,
  0.9,
  1
 ],
 "shadowSpread": 1
},
{
 "borderRadius": 0,
 "children": [
  "this.Button_78C5D2AD_6EF0_BD24_41BA_7914C520D22E_mobile"
 ],
 "id": "Container_7DE3059A_6911_E2E0_41C7_5A5AF3BF1498_mobile",
 "left": "5%",
 "right": "5%",
 "paddingRight": 20,
 "gap": 10,
 "horizontalAlign": "right",
 "creationPolicy": "inAdvance",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "top": "5%",
 "contentOpaque": false,
 "minWidth": 1,
 "verticalAlign": "top",
 "bottom": "88%",
 "class": "Container",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "propagateClick": false,
 "layout": "vertical",
 "overflow": "visible",
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 20,
 "data": {
  "name": "Container X"
 },
 "scrollBarWidth": 10,
 "backgroundOpacity": 0
},
{
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_535C7A1A_5C54_B183_41BC_D9E72EB0D991",
 "id": "panorama_535281A0_5C55_92BF_41A4_79774B470AC0_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "hfov": 95,
  "yaw": 0.13,
  "class": "PanoramaCameraPosition",
  "pitch": -8.41
 }
},
{
 "duration": 5000,
 "height": 338,
 "thumbnailUrl": "media/album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_4_t.jpg",
 "label": "Yamaha-MTZ 150 06",
 "id": "album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_4",
 "width": 600,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_4.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "class": "Photo"
},
{
 "items": [
  {
   "media": "this.video_786B48A9_5DD5_9281_41D6_F860A1820E4B",
   "start": "this.viewer_uid732B8E20_6037_FA47_41C0_43F64BFB44D2VideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.playList_742F1133_602B_4648_41D5_3D5495588A8B, 0, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.playList_742F1133_602B_4648_41D5_3D5495588A8B, 0)",
   "begin": "this.fixTogglePlayPauseButton(this.viewer_uid732B8E20_6037_FA47_41C0_43F64BFB44D2VideoPlayer)",
   "player": "this.viewer_uid732B8E20_6037_FA47_41C0_43F64BFB44D2VideoPlayer",
   "class": "VideoPlayListItem"
  }
 ],
 "id": "playList_742F1133_602B_4648_41D5_3D5495588A8B",
 "class": "PlayList"
},
{
 "thumbnailUrl": "media/album_705F61E7_5C4C_9281_41D4_67432D954851_t.png",
 "label": "Album de Fotos Yamaha-MT320 01",
 "class": "PhotoAlbum",
 "id": "album_705F61E7_5C4C_9281_41D4_67432D954851",
 "playList": "this.album_705F61E7_5C4C_9281_41D4_67432D954851_AlbumPlayList"
},
{
 "duration": 5000,
 "height": 338,
 "thumbnailUrl": "media/album_623D971A_5DD7_9F83_417C_6FB0FF992743_1_t.jpg",
 "label": "Yamaha-YCZ110-2",
 "id": "album_623D971A_5DD7_9F83_417C_6FB0FF992743_1",
 "width": 600,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_623D971A_5DD7_9F83_417C_6FB0FF992743_1.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "class": "Photo"
},
{
 "items": [
  {
   "media": "this.video_6D28BB12_5C4D_9783_41D4_8A27FA748C2B",
   "start": "this.viewer_uid732C1E22_6037_FA4B_41D2_00FFFA0AA62BVideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.playList_742E1135_602B_4648_41C4_667E07FDE0CF, 0, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.playList_742E1135_602B_4648_41C4_667E07FDE0CF, 0)",
   "begin": "this.fixTogglePlayPauseButton(this.viewer_uid732C1E22_6037_FA4B_41D2_00FFFA0AA62BVideoPlayer)",
   "player": "this.viewer_uid732C1E22_6037_FA4B_41D2_00FFFA0AA62BVideoPlayer",
   "class": "VideoPlayListItem"
  }
 ],
 "id": "playList_742E1135_602B_4648_41C4_667E07FDE0CF",
 "class": "PlayList"
},
{
 "duration": 5000,
 "height": 720,
 "thumbnailUrl": "media/album_623D971A_5DD7_9F83_417C_6FB0FF992743_2_t.jpg",
 "label": "Yamaha-YCZ110-3",
 "id": "album_623D971A_5DD7_9F83_417C_6FB0FF992743_2",
 "width": 1280,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_623D971A_5DD7_9F83_417C_6FB0FF992743_2.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "class": "Photo"
},
{
 "class": "Video",
 "thumbnailUrl": "media/video_6D28BB12_5C4D_9783_41D4_8A27FA748C2B_t.jpg",
 "label": "Yamaha XTZ 150",
 "scaleMode": "fit_inside",
 "width": 1280,
 "loop": false,
 "id": "video_6D28BB12_5C4D_9783_41D4_8A27FA748C2B",
 "height": 720,
 "video": {
  "width": 1280,
  "mp4Url": "media/video_6D28BB12_5C4D_9783_41D4_8A27FA748C2B.mp4",
  "class": "VideoResource",
  "height": 720
 }
},
{
 "items": [
  {
   "media": "this.video_6138AF13_5DF4_6F81_41CF_B052B4DA69FF",
   "start": "this.viewer_uid7310BE26_6037_FA4B_41D1_EC617C477B18VideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.playList_7428C13E_602B_46B8_41C2_0DCE72188255, 0, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.playList_7428C13E_602B_46B8_41C2_0DCE72188255, 0)",
   "begin": "this.fixTogglePlayPauseButton(this.viewer_uid7310BE26_6037_FA4B_41D1_EC617C477B18VideoPlayer)",
   "player": "this.viewer_uid7310BE26_6037_FA4B_41D1_EC617C477B18VideoPlayer",
   "class": "VideoPlayListItem"
  }
 ],
 "id": "playList_7428C13E_602B_46B8_41C2_0DCE72188255",
 "class": "PlayList"
},
{
 "levels": [
  {
   "url": "media/popup_69A9EED9_5C5C_6E81_41BD_BE0C02F1E982_0_0.jpg",
   "width": 1417,
   "class": "ImageResourceLevel",
   "height": 1417
  },
  {
   "url": "media/popup_69A9EED9_5C5C_6E81_41BD_BE0C02F1E982_0_1.jpg",
   "width": 1024,
   "class": "ImageResourceLevel",
   "height": 1024
  },
  {
   "url": "media/popup_69A9EED9_5C5C_6E81_41BD_BE0C02F1E982_0_2.jpg",
   "width": 512,
   "class": "ImageResourceLevel",
   "height": 512
  }
 ],
 "id": "ImageResource_67227574_5C54_7387_41C8_00E1AFEDB3C2",
 "class": "ImageResource"
},
{
 "borderRadius": 0,
 "children": [
  "this.Image_6924E557_649A_33AC_41BA_A1E22386BC22_mobile",
  "this.Container_1830289D_3415_1D5C_41BC_8E6011E2CDF1_mobile"
 ],
 "id": "Container_685CC558_649E_53A4_41C3_031C34B7328A_mobile",
 "left": "0%",
 "width": "100%",
 "gap": 10,
 "paddingRight": 0,
 "horizontalAlign": "left",
 "creationPolicy": "inAdvance",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "contentOpaque": false,
 "class": "Container",
 "minWidth": 1,
 "verticalAlign": "top",
 "bottom": "0%",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": 144,
 "propagateClick": false,
 "layout": "absolute",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "---BUTTON SET"
 },
 "scrollBarWidth": 10,
 "backgroundOpacity": 0
},
{
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_535C5A1A_5C54_B183_41B4_3072914924C6",
 "id": "panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "hfov": 95,
  "yaw": -0.52,
  "class": "PanoramaCameraPosition",
  "pitch": -5.36
 }
},
{
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_6D474534_5C54_7380_41C9_5E0067534943.mp3",
  "oggUrl": "media/audio_6D474534_5C54_7380_41C9_5E0067534943.ogg",
  "class": "AudioResource"
 },
 "id": "audio_6D474534_5C54_7380_41C9_5E0067534943",
 "data": {
  "label": "Yamaha XTZ150"
 },
 "class": "MediaAudio"
},
{
 "toolTipShadowSpread": 0,
 "transitionMode": "blending",
 "progressBackgroundColorDirection": "vertical",
 "id": "ViewerAreaLabeled_3AEAC6FC_3514_3866_41BA_E46727E47B58_mobile",
 "left": "0%",
 "playbackBarBorderSize": 0,
 "playbackBarBottom": 0,
 "width": "100%",
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowVerticalLength": 0,
 "toolTipShadowHorizontalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "playbackBarHeadHeight": 15,
 "toolTipBorderRadius": 3,
 "displayTooltipInTouchScreens": true,
 "progressBackgroundColorRatios": [
  0
 ],
 "toolTipPaddingLeft": 6,
 "vrPointerSelectionTime": 2000,
 "playbackBarLeft": 0,
 "progressBorderColor": "#000000",
 "class": "ViewerArea",
 "firstTransitionDuration": 0,
 "minWidth": 1,
 "playbackBarHeadWidth": 6,
 "toolTipDisplayTime": 600,
 "toolTipFontStyle": "normal",
 "progressBorderSize": 0,
 "playbackBarHeadShadowColor": "#000000",
 "playbackBarHeadShadowVerticalLength": 0,
 "toolTipShadowBlurRadius": 3,
 "height": "100%",
 "propagateClick": false,
 "progressBottom": 2,
 "toolTipBackgroundColor": "#F6F6F6",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "toolTipFontFamily": "Arial",
 "playbackBarBorderRadius": 0,
 "progressOpacity": 1,
 "toolTipBorderSize": 1,
 "toolTipFontWeight": "normal",
 "playbackBarBackgroundColorDirection": "vertical",
 "shadow": false,
 "transitionDuration": 500,
 "toolTipPaddingBottom": 4,
 "toolTipFontSize": 12,
 "toolTipPaddingTop": 4,
 "progressHeight": 10,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarRight": 0,
 "progressLeft": 0,
 "borderRadius": 0,
 "progressBarBorderColor": "#000000",
 "playbackBarBackgroundOpacity": 1,
 "progressBackgroundOpacity": 1,
 "playbackBarHeadBorderRadius": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadShadowHorizontalLength": 0,
 "progressRight": 0,
 "paddingRight": 0,
 "playbackBarHeadShadow": true,
 "playbackBarOpacity": 1,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarHeadBorderSize": 0,
 "toolTipTextShadowOpacity": 0,
 "toolTipOpacity": 1,
 "playbackBarHeadShadowBlurRadius": 3,
 "top": "0%",
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "vrPointerColor": "#FFFFFF",
 "toolTipFontColor": "#606060",
 "progressBarOpacity": 1,
 "progressBorderRadius": 0,
 "toolTipPaddingRight": 6,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "vrPointerSelectionColor": "#FF6600",
 "paddingBottom": 0,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarProgressOpacity": 1,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "toolTipShadowColor": "#333333",
 "toolTipBorderColor": "#767676",
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarProgressBorderSize": 0,
 "toolTipTextShadowBlurRadius": 3,
 "progressBarBorderSize": 0,
 "playbackBarHeadOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "progressBarBorderRadius": 0,
 "data": {
  "name": "Viewer Photo"
 },
 "toolTipShadowOpacity": 1,
 "paddingTop": 0,
 "playbackBarHeight": 10,
 "progressBarBackgroundColorDirection": "vertical"
},
{
 "borderRadius": 0,
 "children": [
  "this.Image_1F5560D3_342D_0D24_41C3_009D491A3B6B_mobile",
  "this.Button_6B3DCC00_647A_DF9A_41D5_DC120403F72A_mobile",
  "this.Image_1F089AA1_342D_3D64_41C5_D320F4A4C707_mobile",
  "this.Button_750C11A1_648F_A89A_41C9_2E58278A81A6_mobile",
  "this.Image_1FC43E22_342D_1564_41BB_A63B6F19A750_mobile",
  "this.Button_748008CC_648F_B8AA_41C2_97E5C5DE0CD2_mobile",
  "this.Image_1FC09DB8_342E_F764_41A3_E939228A46A8_mobile",
  "this.Button_6B3517BB_64A6_3EE4_41D7_49868CE9F7A9_mobile",
  "this.Image_6B6FAA55_64A6_71AF_41D3_F197980C21A5_mobile"
 ],
 "id": "Container_1830289D_3415_1D5C_41BC_8E6011E2CDF1_mobile",
 "left": "0%",
 "right": "0%",
 "paddingRight": 0,
 "gap": 0,
 "horizontalAlign": "center",
 "creationPolicy": "inAdvance",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "contentOpaque": false,
 "class": "Container",
 "minWidth": 1,
 "verticalAlign": "bottom",
 "bottom": 0,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": 80,
 "propagateClick": false,
 "layout": "horizontal",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "buttons"
 },
 "scrollBarWidth": 10,
 "backgroundOpacity": 0
},
{
 "class": "Video",
 "thumbnailUrl": "media/video_786B48A9_5DD5_9281_41D6_F860A1820E4B_t.jpg",
 "label": "Yamaha MT-03 Features & Benefits",
 "scaleMode": "fit_inside",
 "width": 1280,
 "loop": false,
 "id": "video_786B48A9_5DD5_9281_41D6_F860A1820E4B",
 "height": 720,
 "video": {
  "width": 1280,
  "mp4Url": "media/video_786B48A9_5DD5_9281_41D6_F860A1820E4B.mp4",
  "class": "VideoResource",
  "height": 720
 }
},
{
 "maxHeight": 58,
 "maxWidth": 58,
 "id": "IconButton_2E6041ED_347D_0EFF_41BF_3C82AFA80CBB_mobile",
 "rollOverIconURL": "skin/IconButton_2E6041ED_347D_0EFF_41BF_3C82AFA80CBB_rollover.png",
 "width": 58,
 "borderRadius": 0,
 "paddingRight": 0,
 "iconURL": "skin/IconButton_2E6041ED_347D_0EFF_41BF_3C82AFA80CBB.png",
 "horizontalAlign": "center",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "transparencyActive": true,
 "class": "IconButton",
 "minWidth": 1,
 "mode": "push",
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "height": 58,
 "propagateClick": false,
 "data": {
  "name": "VR"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "rollOverBackgroundOpacity": 1,
 "fontSize": "1.29vmin",
 "data": {
  "name": "X"
 },
 "maxHeight": 50,
 "maxWidth": 50,
 "id": "Button_7DC9A1F7_6916_6221_41A7_DA6068060007_mobile",
 "pressedBackgroundOpacity": 1,
 "backgroundColorRatios": [
  0
 ],
 "width": 50,
 "shadowColor": "#000000",
 "borderRadius": 0,
 "right": 20,
 "shadowBlurRadius": 6,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "pressedBackgroundColor": [
  "#000000"
 ],
 "paddingLeft": 0,
 "borderSize": 0,
 "iconBeforeLabel": true,
 "iconURL": "skin/Button_775D3775_6F10_A324_41B1_8092A2023E17.png",
 "minHeight": 50,
 "borderColor": "#000000",
 "rollOverBackgroundColor": [
  "#C50A01"
 ],
 "fontColor": "#FFFFFF",
 "top": 20,
 "pressedBackgroundColorRatios": [
  0
 ],
 "gap": 5,
 "height": 50,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "minWidth": 50,
 "mode": "push",
 "verticalAlign": "middle",
 "click": "this.setComponentVisibility(this.Container_3A863D9B_3513_E8A1_41BD_38320457DF78_mobile, false, 0, this.effect_77AF96BF_6F11_E523_41B8_61E169A25F9B, 'hideEffect', false)",
 "class": "Button",
 "paddingBottom": 0,
 "backgroundColor": [
  "#E7392B"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "layout": "horizontal",
 "fontFamily": "Arial",
 "iconHeight": 32,
 "fontStyle": "normal",
 "shadow": false,
 "shadowSpread": 1,
 "paddingTop": 0,
 "iconWidth": 32,
 "textDecoration": "none",
 "cursor": "hand",
 "fontWeight": "normal",
 "backgroundOpacity": 1
},
{
 "duration": 5000,
 "height": 1080,
 "thumbnailUrl": "media/album_705F61E7_5C4C_9281_41D4_67432D954851_2_t.jpg",
 "label": "Yamaha-MT320 03",
 "id": "album_705F61E7_5C4C_9281_41D4_67432D954851_2",
 "width": 1620,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_705F61E7_5C4C_9281_41D4_67432D954851_2.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "class": "Photo"
},
{
 "change": "this.showComponentsWhileMouseOver(this.container_732AEE21_6037_FA49_41CE_AE819BBD1ABB, [this.htmltext_732D4E22_6037_FA4B_41C9_B08C4E719DE6,this.component_732D8E22_6037_FA4B_41D1_019F19E52FC0,this.component_732DAE22_6037_FA4B_41CD_01B19C21FB2E], 2000)",
 "items": [
  "this.albumitem_732A3E21_6037_FA49_41C2_428B4852AACC"
 ],
 "id": "playList_742F6133_602B_4648_41D2_DFA45A0896E6",
 "class": "PlayList"
},
{
 "duration": 5000,
 "height": 846,
 "thumbnailUrl": "media/album_705F61E7_5C4C_9281_41D4_67432D954851_0_t.jpg",
 "label": "Yamaha-MT320 01",
 "id": "album_705F61E7_5C4C_9281_41D4_67432D954851_0",
 "width": 1504,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_705F61E7_5C4C_9281_41D4_67432D954851_0.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "class": "Photo"
},
{
 "fontSize": "22px",
 "label": "PERSPECTIVAS",
 "id": "Button_6B3DCC00_647A_DF9A_41D5_DC120403F72A_mobile",
 "width": 135,
 "shadowColor": "#000000",
 "borderRadius": 0,
 "shadowBlurRadius": 6,
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "horizontalAlign": "center",
 "paddingLeft": 0,
 "borderSize": 0,
 "iconBeforeLabel": true,
 "gap": 5,
 "borderColor": "#000000",
 "minHeight": 1,
 "fontColor": "#FFFFFF",
 "fontFamily": "Akhand-Bold",
 "minWidth": 1,
 "mode": "push",
 "verticalAlign": "middle",
 "click": "this.setComponentVisibility(this.Container_4C963A1A_5F77_E460_41D6_D714DC83B392, true, 0, this.effect_49090075_5F78_64A0_41BA_7D87CB61B700, 'showEffect', false)",
 "class": "Button",
 "paddingBottom": 0,
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "fontStyle": "normal",
 "layout": "horizontal",
 "rollOverFontColor": "#FF0000",
 "height": "96.25%",
 "propagateClick": false,
 "iconHeight": 32,
 "data": {
  "name": "Perspectivas"
 },
 "shadow": false,
 "shadowSpread": 1,
 "paddingTop": 0,
 "iconWidth": 32,
 "textDecoration": "none",
 "cursor": "hand",
 "fontWeight": "normal",
 "backgroundOpacity": 0
},
{
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_73601E4A_6037_FADB_41C3_4B6D758997E4",
 "id": "camera_73606E4A_6037_FADB_41D3_7E6F20E66A96",
 "class": "PanoramaCamera",
 "initialPosition": {
  "hfov": 95,
  "yaw": 0.41,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "paddingTop": 0,
 "borderRadius": 0,
 "id": "HTMLText_7DE3759A_6911_E2E0_41A7_C2659986BA1F_mobile",
 "width": "100%",
 "paddingRight": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#FF0000",
 "minHeight": 1,
 "minWidth": 1,
 "class": "HTMLText",
 "paddingBottom": 10,
 "scrollBarOpacity": 0.2,
 "scrollBarVisible": "rollOver",
 "height": "50%",
 "propagateClick": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "HTMLText"
 },
 "shadow": false,
 "scrollBarWidth": 10,
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:center;\"><SPAN STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:6.94vw;font-family:'Exo';\"><B><I>CHACOMER</I></B></SPAN></SPAN></DIV><DIV STYLE=\"text-align:center;\"><SPAN STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#e7392b;font-size:4.03vw;font-family:'Exo';\"><B><I>Chacomer SAE - Comagro - Chacomer Automotores - R\u00edo Sur - Los Pioneros, Atlantic - Alas </I></B></SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:0.97vw;\"><BR STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-size:5vw;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:3.47vw;font-family:'Roboto Medium';\">Ubicado en el coraz\u00f3n de Am\u00e9rica del Sur, Paraguay es un pa\u00eds que re\u00fane las condiciones socioecon\u00f3micas ideales para el crecimiento de la industria y los negocios en una superficie de 406.752 km2, con 7 millones de habitantes.</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:3.47vw;\"><BR STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-size:5vw;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:3.47vw;font-family:'Roboto Medium';\">Es all\u00ed donde en 1956 se funda Chacomer por el Sr. Cornelius Walde.Con una cultura transparente de hacer negocios, basada en principios b\u00edblicos que nos gu\u00edan, y fuertes valores como Integridad, Efectividad, Lealtad, esp\u00edritu Innovador y Responsabilidad Social Medioambiental, que nos destacan y nos permiten marcar pautas a seguir por toda la industria.</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:3.47vw;\"><BR STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-size:5vw;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:3.47vw;font-family:'Roboto Medium';\">Nuestra visi\u00f3n es ser una Empresa competitiva con dimensi\u00f3n internacional que opera a trav\u00e9s de equipos humanos de alto rendimiento, calidad y excelencia. Buscar la calidad como ejemplo cristiano en el mercado global, obteniendo resultados para crecimiento de la Empresa y sus componentes.</SPAN></SPAN></DIV></div>",
 "backgroundOpacity": 0
},
{
 "itemBackgroundColorDirection": "vertical",
 "itemBackgroundOpacity": 0,
 "id": "ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C",
 "left": 0,
 "itemHeight": 160,
 "width": "100%",
 "itemThumbnailBorderRadius": 0,
 "itemPaddingTop": 3,
 "gap": 26,
 "paddingTop": 10,
 "scrollBarColor": "#F7931E",
 "horizontalAlign": "center",
 "selectedItemThumbnailShadow": true,
 "rollOverItemThumbnailShadowColor": "#F7931E",
 "paddingLeft": 70,
 "borderSize": 0,
 "itemVerticalAlign": "top",
 "selectedItemLabelFontColor": "#F7931E",
 "minHeight": 1,
 "itemPaddingRight": 3,
 "itemLabelGap": 7,
 "minWidth": 1,
 "itemLabelFontColor": "#666666",
 "class": "ThumbnailGrid",
 "itemMinWidth": 50,
 "rollOverItemThumbnailShadowHorizontalLength": 8,
 "height": "92%",
 "itemLabelPosition": "bottom",
 "propagateClick": false,
 "rollOverItemThumbnailShadowVerticalLength": 0,
 "itemLabelFontStyle": "normal",
 "itemLabelFontSize": 13,
 "shadow": false,
 "itemMode": "normal",
 "selectedItemThumbnailShadowVerticalLength": 0,
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "borderRadius": 5,
 "itemLabelHorizontalAlign": "center",
 "itemBackgroundColor": [],
 "paddingRight": 70,
 "rollOverItemThumbnailShadowBlurRadius": 0,
 "itemThumbnailHeight": 125,
 "playList": "this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C_playlist",
 "itemHorizontalAlign": "center",
 "itemThumbnailWidth": 220,
 "itemOpacity": 1,
 "itemThumbnailShadow": false,
 "itemMaxWidth": 1000,
 "itemWidth": 220,
 "selectedItemThumbnailShadowBlurRadius": 16,
 "verticalAlign": "middle",
 "paddingBottom": 70,
 "itemThumbnailOpacity": 1,
 "itemLabelTextDecoration": "none",
 "itemMinHeight": 50,
 "bottom": -0.2,
 "itemLabelFontFamily": "Montserrat",
 "scrollBarVisible": "rollOver",
 "itemBorderRadius": 0,
 "scrollBarOpacity": 0.5,
 "itemBackgroundColorRatios": [],
 "selectedItemLabelFontWeight": "bold",
 "itemThumbnailScaleMode": "fit_outside",
 "selectedItemThumbnailShadowHorizontalLength": 0,
 "scrollBarMargin": 2,
 "itemPaddingBottom": 3,
 "itemMaxHeight": 1000,
 "data": {
  "name": "ThumbnailList"
 },
 "rollOverItemThumbnailShadow": true,
 "itemPaddingLeft": 3,
 "rollOverItemLabelFontColor": "#F7931E",
 "itemLabelFontWeight": "normal"
},
{
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_7380BEAC_6037_FA5F_41C3_9EB31BADF642",
 "id": "camera_7380EEAC_6037_FA5F_41D6_7859DB22F25E",
 "class": "PanoramaCamera",
 "initialPosition": {
  "hfov": 95,
  "yaw": 90.84,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_5343BA1A_5C54_B183_41D6_CBD1E4B07337",
 "id": "panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_camera",
 "class": "PanoramaCamera",
 "initialPosition": {
  "hfov": 95,
  "yaw": -3.79,
  "class": "PanoramaCameraPosition",
  "pitch": -12.78
 }
},
{
 "class": "Video",
 "thumbnailUrl": "media/video_6138AF13_5DF4_6F81_41CF_B052B4DA69FF_t.jpg",
 "label": "Yamaha SZ-RR",
 "scaleMode": "fit_inside",
 "width": 1280,
 "loop": false,
 "id": "video_6138AF13_5DF4_6F81_41CF_B052B4DA69FF",
 "height": 720,
 "video": {
  "width": 1280,
  "mp4Url": "media/video_6138AF13_5DF4_6F81_41CF_B052B4DA69FF.mp4",
  "class": "VideoResource",
  "height": 720
 }
},
{
 "scrollBarMargin": 2,
 "headerBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "id": "window_6B74AC72_602A_BEC8_41B8_DEEF1E42A0A9",
 "veilShowEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeInEffect"
 },
 "showEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeInEffect"
 },
 "shadowBlurRadius": 6,
 "veilColor": [
  "#000000",
  "#000000"
 ],
 "veilHideEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeOutEffect"
 },
 "gap": 10,
 "closeButtonBackgroundColorDirection": "vertical",
 "closeButtonRollOverBorderSize": 0,
 "bodyBackgroundColorRatios": [
  0,
  0.5,
  1
 ],
 "scrollBarColor": "#000000",
 "horizontalAlign": "center",
 "shadowVerticalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 20,
 "titlePaddingRight": 5,
 "closeButtonPaddingLeft": 5,
 "closeButtonPressedBorderColor": "#000000",
 "bodyPaddingTop": 0,
 "headerPaddingRight": 0,
 "bodyPaddingRight": 0,
 "bodyPaddingBottom": 0,
 "closeButtonPressedBorderSize": 0,
 "closeButtonPressedBackgroundColorDirection": "vertical",
 "modal": true,
 "class": "Window",
 "hideEffect": {
  "easing": "cubic_in_out",
  "duration": 500,
  "class": "FadeOutEffect"
 },
 "closeButtonRollOverBackgroundColorDirection": "vertical",
 "closeButtonPaddingTop": 5,
 "minWidth": 20,
 "backgroundColor": [],
 "headerVerticalAlign": "middle",
 "titlePaddingLeft": 5,
 "closeButtonPressedBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "titlePaddingTop": 5,
 "closeButtonPressedBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "headerBackgroundOpacity": 0,
 "bodyBackgroundColor": [
  "#FFFFFF",
  "#DDDDDD",
  "#FFFFFF"
 ],
 "bodyPaddingLeft": 0,
 "veilOpacity": 0.4,
 "closeButtonPressedIconLineWidth": 5,
 "propagateClick": false,
 "closeButtonBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "closeButtonBackgroundOpacity": 0.3,
 "titleFontFamily": "Arial",
 "shadow": true,
 "scrollBarWidth": 10,
 "closeButtonBorderRadius": 0,
 "backgroundOpacity": 1,
 "closeButtonIconWidth": 20,
 "closeButtonPressedIconColor": "#888888",
 "closeButtonRollOverBorderColor": "#000000",
 "closeButtonRollOverBackgroundOpacity": 0.3,
 "children": [
  "this.viewer_uid73117E24_6037_FA4F_41CD_81117C60F5A8"
 ],
 "closeButtonIconHeight": 20,
 "borderRadius": 5,
 "titlePaddingBottom": 5,
 "backgroundColorRatios": [],
 "closeButtonIconLineWidth": 5,
 "shadowColor": "#000000",
 "shadowOpacity": 0.5,
 "closeButtonRollOverBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "closeButtonRollOverIconLineWidth": 5,
 "paddingRight": 0,
 "closeButtonRollOverBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "closeButtonBorderColor": "#000000",
 "headerPaddingLeft": 10,
 "veilColorRatios": [
  0,
  1
 ],
 "headerPaddingBottom": 5,
 "footerHeight": 5,
 "headerBackgroundColorDirection": "vertical",
 "bodyBackgroundOpacity": 0,
 "footerBackgroundColorDirection": "vertical",
 "footerBackgroundColor": [
  "#FFFFFF",
  "#EEEEEE",
  "#DDDDDD"
 ],
 "closeButtonPressedBackgroundOpacity": 0.3,
 "closeButtonPaddingBottom": 5,
 "contentOpaque": false,
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "footerBackgroundOpacity": 0,
 "bodyBackgroundColorDirection": "vertical",
 "closeButtonBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "closeButtonPaddingRight": 5,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "titleFontSize": "1.29vmin",
 "backgroundColorDirection": "vertical",
 "layout": "vertical",
 "closeButtonBorderSize": 0,
 "shadowHorizontalLength": 3,
 "closeButtonIconColor": "#000000",
 "headerPaddingTop": 10,
 "overflow": "scroll",
 "closeButtonRollOverIconColor": "#666666",
 "paddingTop": 0,
 "headerBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "data": {
  "name": "Window536"
 },
 "footerBackgroundColorRatios": [
  0,
  0.9,
  1
 ],
 "shadowSpread": 1
},
{
 "maxHeight": 60,
 "maxWidth": 60,
 "id": "IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4_mobile",
 "rollOverIconURL": "skin/IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4_rollover.png",
 "width": 70,
 "borderRadius": 0,
 "right": "1%",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4.png",
 "horizontalAlign": "center",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 40,
 "top": "45.9%",
 "transparencyActive": false,
 "minWidth": 40,
 "mode": "push",
 "verticalAlign": "middle",
 "bottom": "45.9%",
 "class": "IconButton",
 "paddingBottom": 0,
 "propagateClick": false,
 "pressedIconURL": "skin/IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4_pressed.png",
 "data": {
  "name": ">"
 },
 "shadow": false,
 "paddingTop": 0,
 "pressedRollOverIconURL": "skin/IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4_pressed.png",
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "duration": 5000,
 "height": 338,
 "thumbnailUrl": "media/album_623D971A_5DD7_9F83_417C_6FB0FF992743_3_t.jpg",
 "label": "Yamaha-YCZ110-4",
 "id": "album_623D971A_5DD7_9F83_417C_6FB0FF992743_3",
 "width": 600,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_623D971A_5DD7_9F83_417C_6FB0FF992743_3.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "class": "Photo"
},
{
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_73A21E90_6037_FA47_41BF_EB8E301260B5",
 "id": "camera_73A26E90_6037_FA47_41D0_F7E2344D9C0A",
 "class": "PanoramaCamera",
 "initialPosition": {
  "hfov": 95,
  "yaw": 179.78,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_749A3B4A_5DBC_9783_41C8_F9FEE5038B8C.mp3",
  "oggUrl": "media/audio_749A3B4A_5DBC_9783_41C8_F9FEE5038B8C.ogg",
  "class": "AudioResource"
 },
 "id": "audio_749A3B4A_5DBC_9783_41C8_F9FEE5038B8C",
 "data": {
  "label": "Yamaha MT03"
 },
 "class": "MediaAudio"
},
{
 "maxHeight": 130,
 "id": "Image_6924E557_649A_33AC_41BA_A1E22386BC22_mobile",
 "left": "0%",
 "borderRadius": 0,
 "right": "0%",
 "paddingRight": 0,
 "horizontalAlign": "center",
 "url": "skin/Image_6924E557_649A_33AC_41BA_A1E22386BC22.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 100,
 "class": "Image",
 "minWidth": 200,
 "verticalAlign": "bottom",
 "bottom": "0%",
 "paddingBottom": 0,
 "height": 100,
 "propagateClick": false,
 "scaleMode": "fit_to_height",
 "data": {
  "name": "img "
 },
 "shadow": false,
 "paddingTop": 0,
 "backgroundOpacity": 0
},
{
 "rollOverBackgroundOpacity": 1,
 "fontSize": "2.2vh",
 "data": {
  "name": "Button"
 },
 "click": "this.openLink('https://api.whatsapp.com/send?phone=595981408400&text=Chacomer%20-%20Paseo%20Digital', '_blank')",
 "id": "Button_7DE3659A_6911_E2E0_41C3_93316288CBE4_mobile",
 "pressedBackgroundOpacity": 1,
 "backgroundColorRatios": [
  0
 ],
 "width": 200,
 "shadowColor": "#000000",
 "borderRadius": 50,
 "shadowBlurRadius": 6,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "pressedBackgroundColor": [
  "#000000"
 ],
 "paddingLeft": 0,
 "borderSize": 0,
 "iconBeforeLabel": true,
 "gap": 5,
 "minHeight": 1,
 "borderColor": "#000000",
 "rollOverBackgroundColor": [
  "#C50A01"
 ],
 "fontColor": "#FFFFFF",
 "fontFamily": "Exo",
 "pressedBackgroundColorRatios": [
  0
 ],
 "height": 50,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "minWidth": 1,
 "mode": "push",
 "verticalAlign": "middle",
 "class": "Button",
 "paddingBottom": 0,
 "backgroundColorDirection": "vertical",
 "label": "CONTACTO",
 "propagateClick": false,
 "layout": "horizontal",
 "backgroundColor": [
  "#E7392B"
 ],
 "iconHeight": 32,
 "fontStyle": "italic",
 "shadow": false,
 "shadowSpread": 1,
 "paddingTop": 0,
 "iconWidth": 32,
 "textDecoration": "none",
 "cursor": "hand",
 "fontWeight": "bold",
 "backgroundOpacity": 1
},
{
 "children": [
  "this.Container_2E6031ED_347D_0EFC_41A1_12EC3C0472FF_mobile",
  "this.Container_2E6011ED_347D_0EFF_41C9_5AC77536D968_mobile"
 ],
 "scrollBarWidth": 10,
 "id": "Container_2E6121EE_347D_0EFC_41AD_FCF661FCEEBC_mobile",
 "width": 115,
 "borderRadius": 0,
 "right": "0%",
 "paddingRight": 0,
 "gap": 10,
 "horizontalAlign": "left",
 "creationPolicy": "inAdvance",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 400,
 "top": "0%",
 "contentOpaque": false,
 "class": "Container",
 "minWidth": 1,
 "verticalAlign": "top",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": 641,
 "propagateClick": false,
 "layout": "absolute",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "--- SETTINGS"
 },
 "backgroundOpacity": 0
},
{
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_73921E9E_6037_FA7B_41B6_D46DC4F19163",
 "id": "camera_73926E9E_6037_FA7B_4191_2BB8363893DE",
 "class": "PanoramaCamera",
 "initialPosition": {
  "hfov": 95,
  "yaw": 27.39,
  "class": "PanoramaCameraPosition",
  "pitch": 0
 }
},
{
 "rotationY": 0,
 "hfov": 6.5,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_665E54BC_5DB3_9287_41C8_4F0F2CE7DD7C",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "loop": false,
 "autoplay": true,
 "popupMaxHeight": "95%",
 "pitch": -25.56,
 "popupMaxWidth": "95%",
 "yaw": 84.25,
 "class": "PopupPanoramaOverlay",
 "showDuration": 500,
 "video": {
  "width": 1280,
  "mp4Url": "media/video_636358BB_5DD5_9281_41D0_CDF25C2DBC6B.mp4",
  "class": "VideoResource",
  "height": 720
 }
},
{
 "duration": 5000,
 "height": 720,
 "thumbnailUrl": "media/album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_5_t.jpg",
 "label": "Yamaha-MTZ 150",
 "id": "album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_5",
 "width": 1280,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_5.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "class": "Photo"
},
{
 "rotationY": 0,
 "hfov": 7.2,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_695E2EDD_5C5C_6E81_41D3_FF26243DB19B",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "loop": false,
 "autoplay": true,
 "popupMaxHeight": "95%",
 "pitch": -1.34,
 "popupMaxWidth": "95%",
 "yaw": 104.2,
 "class": "PopupPanoramaOverlay",
 "showDuration": 500,
 "video": {
  "width": 1280,
  "mp4Url": "media/video_6D28BB12_5C4D_9783_41D4_8A27FA748C2B.mp4",
  "class": "VideoResource",
  "height": 720
 }
},
{
 "duration": 5000,
 "height": 338,
 "thumbnailUrl": "media/album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_0_t.jpg",
 "label": "Yamaha-MTZ 150 02",
 "id": "album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_0",
 "width": 600,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_0.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "class": "Photo"
},
{
 "children": [
  "this.Container_3A26EF53_3514_E9A2_4159_FC2DDA226A54_mobile"
 ],
 "scrollBarWidth": 10,
 "id": "Container_3A863D9B_3513_E8A1_41BD_38320457DF78_mobile",
 "left": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "borderRadius": 0,
 "right": "0%",
 "paddingRight": 0,
 "horizontalAlign": "left",
 "creationPolicy": "inAdvance",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "gap": 10,
 "minHeight": 1,
 "top": "0%",
 "contentOpaque": false,
 "class": "Container",
 "minWidth": 1,
 "verticalAlign": "top",
 "bottom": "0%",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "layout": "absolute",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "---PHOTOALBUM"
 },
 "visible": false,
 "backgroundOpacity": 0.8
},
{
 "duration": 5000,
 "height": 338,
 "thumbnailUrl": "media/album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_2_t.jpg",
 "label": "Yamaha-MTZ 150 04",
 "id": "album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_2",
 "width": 600,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_2.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "class": "Photo"
},
{
 "children": [
  "this.Container_4C960A19_5F77_E460_41C2_253939CF6793",
  "this.ThumbnailGrid_4C962A19_5F77_E460_41C5_901E1E18A04C"
 ],
 "scrollBarWidth": 10,
 "id": "Container_4C95EA19_5F77_E460_41CA_5B9016BE64F4",
 "left": "5%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "shadowBlurRadius": 25,
 "shadowColor": "#000000",
 "borderRadius": 0,
 "right": "5%",
 "shadowOpacity": 0.3,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "shadowVerticalLength": 0,
 "creationPolicy": "inAdvance",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "gap": 10,
 "minHeight": 1,
 "top": "5%",
 "contentOpaque": false,
 "class": "Container",
 "minWidth": 1,
 "verticalAlign": "top",
 "paddingBottom": 0,
 "bottom": "5%",
 "shadowHorizontalLength": 0,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "layout": "absolute",
 "shadowSpread": 1,
 "overflow": "visible",
 "shadow": true,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "Global"
 },
 "backgroundOpacity": 1
},
{
 "rotationY": 0,
 "hfov": 7.1,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_79373586_5DD4_7283_41BE_8F200EC72946",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "loop": false,
 "autoplay": true,
 "popupMaxHeight": "95%",
 "pitch": -9.67,
 "popupMaxWidth": "95%",
 "yaw": -96.94,
 "class": "PopupPanoramaOverlay",
 "showDuration": 500,
 "video": {
  "width": 1280,
  "mp4Url": "media/video_786B48A9_5DD5_9281_41D6_F860A1820E4B.mp4",
  "class": "VideoResource",
  "height": 720
 }
},
{
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_41D5ADEE_5F68_3FA0_41BA_A36CE8A90C09.mp3",
  "oggUrl": "media/audio_41D5ADEE_5F68_3FA0_41BA_A36CE8A90C09.ogg",
  "class": "AudioResource"
 },
 "id": "audio_41D5ADEE_5F68_3FA0_41BA_A36CE8A90C09",
 "data": {
  "label": "Stylish Powerful Indie Rock (Full)"
 },
 "class": "MediaAudio"
},
{
 "id": "veilPopupPanorama",
 "left": 0,
 "backgroundColorRatios": [
  0
 ],
 "borderRadius": 0,
 "right": 0,
 "paddingRight": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 0,
 "top": 0,
 "class": "UIComponent",
 "minWidth": 0,
 "bottom": 0,
 "paddingBottom": 0,
 "backgroundColor": [
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "data": {
  "name": "UIComponent4053"
 },
 "shadow": false,
 "paddingTop": 0,
 "visible": false,
 "showEffect": {
  "easing": "cubic_in_out",
  "duration": 350,
  "class": "FadeInEffect"
 },
 "backgroundOpacity": 0.55
},
{
 "id": "zoomImagePopupPanorama",
 "left": 0,
 "backgroundColorRatios": [],
 "borderRadius": 0,
 "right": 0,
 "paddingRight": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 0,
 "top": 0,
 "class": "ZoomImage",
 "minWidth": 0,
 "bottom": 0,
 "paddingBottom": 0,
 "backgroundColor": [],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "scaleMode": "custom",
 "data": {
  "name": "ZoomImage4054"
 },
 "shadow": false,
 "paddingTop": 0,
 "visible": false,
 "backgroundOpacity": 1
},
{
 "borderRadius": 0,
 "fontSize": "1.29vmin",
 "id": "closeButtonPopupPanorama",
 "backgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "rollOverIconColor": "#666666",
 "shadowBlurRadius": 6,
 "shadowColor": "#000000",
 "right": 10,
 "showEffect": {
  "easing": "cubic_in_out",
  "duration": 350,
  "class": "FadeInEffect"
 },
 "paddingRight": 5,
 "horizontalAlign": "center",
 "paddingLeft": 5,
 "borderSize": 0,
 "iconLineWidth": 5,
 "minHeight": 0,
 "borderColor": "#000000",
 "fontColor": "#FFFFFF",
 "top": 10,
 "iconBeforeLabel": true,
 "gap": 5,
 "class": "CloseButton",
 "minWidth": 0,
 "mode": "push",
 "verticalAlign": "middle",
 "pressedIconColor": "#888888",
 "paddingBottom": 5,
 "backgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "backgroundColorDirection": "vertical",
 "label": "",
 "fontStyle": "normal",
 "propagateClick": false,
 "layout": "horizontal",
 "fontFamily": "Arial",
 "iconColor": "#000000",
 "iconHeight": 20,
 "data": {
  "name": "CloseButton4055"
 },
 "shadow": false,
 "shadowSpread": 1,
 "paddingTop": 5,
 "iconWidth": 20,
 "textDecoration": "none",
 "visible": false,
 "cursor": "hand",
 "fontWeight": "normal",
 "backgroundOpacity": 0.3
},
{
 "items": [
  {
   "media": "this.album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_0",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "initialPosition": {
     "x": "0.50",
     "zoomFactor": 1,
     "class": "PhotoCameraPosition",
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside",
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.53",
     "zoomFactor": 1.1,
     "class": "PhotoCameraPosition",
     "y": "0.73"
    }
   }
  },
  {
   "media": "this.album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_1",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "initialPosition": {
     "x": "0.50",
     "zoomFactor": 1,
     "class": "PhotoCameraPosition",
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside",
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.37",
     "zoomFactor": 1.1,
     "class": "PhotoCameraPosition",
     "y": "0.51"
    }
   }
  },
  {
   "media": "this.album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_2",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "initialPosition": {
     "x": "0.50",
     "zoomFactor": 1,
     "class": "PhotoCameraPosition",
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside",
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.66",
     "zoomFactor": 1.1,
     "class": "PhotoCameraPosition",
     "y": "0.27"
    }
   }
  }
 ],
 "id": "album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_AlbumPlayList",
 "class": "PhotoPlayList"
},
{
 "toolTipShadowSpread": 0,
 "transitionMode": "blending",
 "progressBackgroundColorDirection": "vertical",
 "id": "viewer_uid732C1E22_6037_FA4B_41D2_00FFFA0AA62B",
 "playbackBarBorderSize": 0,
 "playbackBarBottom": 0,
 "width": "100%",
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowVerticalLength": 0,
 "toolTipShadowHorizontalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 50,
 "playbackBarHeadHeight": 15,
 "toolTipBorderRadius": 3,
 "displayTooltipInTouchScreens": true,
 "progressBackgroundColorRatios": [
  0
 ],
 "toolTipPaddingLeft": 6,
 "vrPointerSelectionTime": 2000,
 "playbackBarLeft": 0,
 "progressBorderColor": "#000000",
 "class": "ViewerArea",
 "firstTransitionDuration": 0,
 "minWidth": 100,
 "playbackBarHeadWidth": 6,
 "toolTipDisplayTime": 600,
 "toolTipFontStyle": "normal",
 "progressBorderSize": 0,
 "playbackBarHeadShadowColor": "#000000",
 "playbackBarHeadShadowVerticalLength": 0,
 "toolTipShadowBlurRadius": 3,
 "height": "100%",
 "propagateClick": false,
 "progressBottom": 2,
 "toolTipBackgroundColor": "#F6F6F6",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "toolTipFontFamily": "Arial",
 "playbackBarBorderRadius": 0,
 "progressOpacity": 1,
 "toolTipBorderSize": 1,
 "toolTipFontWeight": "normal",
 "playbackBarBackgroundColorDirection": "vertical",
 "shadow": false,
 "transitionDuration": 500,
 "toolTipPaddingBottom": 4,
 "toolTipFontSize": "1.11vmin",
 "toolTipPaddingTop": 4,
 "progressHeight": 10,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarRight": 0,
 "borderRadius": 0,
 "progressLeft": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBarBorderColor": "#000000",
 "playbackBarBackgroundOpacity": 1,
 "progressBackgroundOpacity": 1,
 "playbackBarHeadBorderRadius": 0,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadShadowHorizontalLength": 0,
 "progressRight": 0,
 "paddingRight": 0,
 "playbackBarHeadShadow": true,
 "playbackBarOpacity": 1,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarHeadBorderSize": 0,
 "toolTipTextShadowOpacity": 0,
 "toolTipOpacity": 1,
 "playbackBarHeadShadowBlurRadius": 3,
 "progressBorderRadius": 0,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "vrPointerColor": "#FFFFFF",
 "toolTipFontColor": "#606060",
 "progressBarOpacity": 1,
 "vrPointerSelectionColor": "#FF6600",
 "toolTipPaddingRight": 6,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "paddingBottom": 0,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarProgressOpacity": 1,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "toolTipShadowColor": "#333333",
 "toolTipBorderColor": "#767676",
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarProgressBorderSize": 0,
 "toolTipTextShadowBlurRadius": 3,
 "progressBarBorderSize": 0,
 "playbackBarHeadOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "progressBarBorderRadius": 0,
 "data": {
  "name": "ViewerArea4038"
 },
 "toolTipShadowOpacity": 1,
 "paddingTop": 0,
 "playbackBarHeight": 10,
 "progressBarBackgroundColorDirection": "vertical"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_1_HS_0_0_0_map.gif",
      "width": 72,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": -152.61,
   "hfov": 15.87,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -19.2
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE, this.camera_7380EEAC_6037_FA5F_41D6_7859DB22F25E); this.mainPlayList.set('selectedIndex', 2)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Circle 02c"
 },
 "useHandCursor": true,
 "items": [
  {
   "hfov": 15.87,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_7D590EB9_5F99_FDA0_41D4_692B51201688",
   "pitch": -19.2,
   "yaw": -152.61,
   "distance": 100
  }
 ],
 "id": "overlay_4459C812_5C5D_9183_41D4_68F3FE8A5EC3",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "hfov": 39,
 "angle": 0,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_tcap0.png",
    "width": 1050,
    "class": "ImageResourceLevel",
    "height": 1050
   }
  ]
 },
 "rotate": false,
 "id": "panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_tcap0",
 "distance": 50,
 "class": "TripodCapPanoramaOverlay",
 "inertia": false
},
{
 "yaw": -96.34,
 "bleachingDistance": 0.4,
 "pitch": 64.88,
 "bleaching": 0.7,
 "id": "overlay_48083C12_5F78_3C60_41D4_DC6560511014",
 "class": "LensFlarePanoramaOverlay"
},
{
 "yaw": 135.53,
 "bleachingDistance": 0.4,
 "pitch": 51.56,
 "bleaching": 0.7,
 "id": "overlay_48E8D0CC_5F78_25E0_41C3_27414998C55C",
 "class": "LensFlarePanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_0_0_0_map.gif",
      "width": 72,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": -178.72,
   "hfov": 15.53,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -20.2
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_535281A0_5C55_92BF_41A4_79774B470AC0, this.camera_73A26E90_6037_FA47_41D0_F7E2344D9C0A); this.mainPlayList.set('selectedIndex', 1)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Circle 02c"
 },
 "useHandCursor": true,
 "items": [
  {
   "hfov": 15.53,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_7D5C4EB7_5F99_FDA0_41D5_F8A008C39ED4",
   "pitch": -20.2,
   "yaw": -178.72,
   "distance": 100
  }
 ],
 "id": "overlay_4BEED20E_5C5C_B183_41BE_7AA18AECD597",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_1_0_0_map.gif",
      "width": 72,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": -89.16,
   "hfov": 18.57,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -20.33
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_5373C82A_5C54_9183_41D5_746C6CF32C38, this.camera_73926E9E_6037_FA7B_4191_2BB8363893DE); this.mainPlayList.set('selectedIndex', 3)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Circle 02c"
 },
 "useHandCursor": true,
 "items": [
  {
   "hfov": 18.57,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_7D5C7EB7_5F99_FDA0_41D5_D12355328A4E",
   "pitch": -20.33,
   "yaw": -89.16,
   "distance": 100
  }
 ],
 "id": "overlay_44E9236D_5C5F_B781_41CD_320EDDC7D241",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_2_0_0_map.gif",
      "width": 72,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": -178.75,
   "hfov": 8.82,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -11.53
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00, this.camera_73B43E82_6037_FA4B_41D4_DDEA35EC638D); this.mainPlayList.set('selectedIndex', 0)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Circle 02c"
 },
 "useHandCursor": true,
 "items": [
  {
   "hfov": 8.82,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_7D5CDEB8_5F99_FDA0_41B3_D0A81F81F8B3",
   "pitch": -11.53,
   "yaw": -178.75,
   "distance": 100
  }
 ],
 "id": "overlay_4BA61F9E_5C53_EE83_41D1_2D44912BC0F5",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "hfov": 39,
 "angle": 0,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_tcap0.png",
    "width": 1050,
    "class": "ImageResourceLevel",
    "height": 1050
   }
  ]
 },
 "rotate": false,
 "id": "panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_tcap0",
 "distance": 50,
 "class": "TripodCapPanoramaOverlay",
 "inertia": false
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_3_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": 111.1,
   "hfov": 13.98,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -13.83
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.overlay_626643AA_5DCC_9683_41A8_4FD581109B45.set('enabled', true); this.overlay_626663AB_5DCC_9681_41A7_7894AF438316.set('enabled', true); this.overlay_626673AB_5DCC_9681_41D2_9F49774B179B.set('enabled', true); this.overlay_626183AB_5DCC_9681_41AD_7F4FB949C006.set('enabled', true); this.overlay_626193AB_5DCC_9681_41AF_CD93E50D069B.set('enabled', true); this.overlay_626633AA_5DCC_9683_41CE_AADCC31A62FD.set('enabled', false)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha YCZ INFO"
 },
 "useHandCursor": true,
 "items": [
  {
   "hfov": 13.98,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_7D5F3EB8_5F99_FDA0_41A6_6B7EED5ECF53",
   "pitch": -13.83,
   "yaw": 111.1,
   "distance": 100
  }
 ],
 "id": "overlay_626633AA_5DCC_9683_41CE_AADCC31A62FD",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_4_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": 103.76,
   "hfov": 7.17,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -5.29
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_6257F33E_5DCC_9783_41B0_97B5816F9903, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_63BE5A50_5DF3_919F_41BA_8AC8087C33EF, null, null, null, null, false)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha YCZ Informacion"
 },
 "useHandCursor": true,
 "enabled": false,
 "items": [
  {
   "hfov": 7.17,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_4_0.png",
      "width": 200,
      "class": "ImageResourceLevel",
      "height": 200
     }
    ]
   },
   "pitch": -5.29,
   "yaw": 103.76,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_626643AA_5DCC_9683_41A8_4FD581109B45",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_5_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": 103.65,
   "hfov": 6.96,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -14.87
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.showPopupMedia(this.window_62499340_5DCC_97FF_41D6_BF532A97C63A, this.album_6076EEE4_5DF7_EE80_41C0_70404B70EF36, this.playList_742AA13C_602B_46B8_41D2_BD110DD5CDC2, '90%', '90%', false, false)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "enabled": false,
 "items": [
  {
   "hfov": 6.96,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_5_0.png",
      "width": 200,
      "class": "ImageResourceLevel",
      "height": 200
     }
    ]
   },
   "pitch": -14.87,
   "yaw": 103.65,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_626663AB_5DCC_9681_41A7_7894AF438316",
 "data": {
  "label": "Yamaha YCZ Fotos"
 },
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_6_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": 103.82,
   "hfov": 6.53,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -24.98
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "if(this.isCardboardViewMode()) { this.showPopupPanoramaVideoOverlay(this.popup_6248E342_5DCC_9783_41D7_AF6FA03E6565, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, true) } else { this.showPopupMedia(this.window_6B756C73_602A_BEC8_41A4_774861A8B196, this.video_6138AF13_5DF4_6F81_41CF_B052B4DA69FF, this.playList_7428C13E_602B_46B8_41C2_0DCE72188255, '95%', '95%', true, true) }",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha YCZ Video"
 },
 "useHandCursor": true,
 "enabled": false,
 "items": [
  {
   "hfov": 6.53,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_6_0.png",
      "width": 200,
      "class": "ImageResourceLevel",
      "height": 200
     }
    ]
   },
   "pitch": -24.98,
   "yaw": 103.82,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_626673AB_5DCC_9681_41D2_9F49774B179B",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_7_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": 103.72,
   "hfov": 5.9,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -34.96
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.stopGlobalAudios(true); this.playGlobalAudioWhilePlay(this.mainPlayList, 2, this.audio_61DC12C0_5DF5_B6FF_4198_5687742A7BA8, undefined, true)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha YCZ Audio"
 },
 "useHandCursor": true,
 "enabled": false,
 "items": [
  {
   "hfov": 5.9,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_7_0.png",
      "width": 200,
      "class": "ImageResourceLevel",
      "height": 200
     }
    ]
   },
   "pitch": -34.96,
   "yaw": 103.72,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_626183AB_5DCC_9681_41AD_7F4FB949C006",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_8_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": 103.8,
   "hfov": 5.09,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -44.99
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.openLink('https://www.chacomer.com.py/moto-yamaha-sz-rr-blue-core.html', '_blank')",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha YCZ Link"
 },
 "useHandCursor": true,
 "enabled": false,
 "items": [
  {
   "hfov": 5.09,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_8_0.png",
      "width": 200,
      "class": "ImageResourceLevel",
      "height": 200
     }
    ]
   },
   "pitch": -44.99,
   "yaw": 103.8,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_626193AB_5DCC_9681_41AF_CD93E50D069B",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0_HS_9_1_0_map.gif",
      "width": 139,
      "class": "ImageResourceLevel",
      "height": 200
     }
    ]
   },
   "yaw": 111.89,
   "hfov": 45.22,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -24.84
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "rollOut": "this.overlay_626643AA_5DCC_9683_41A8_4FD581109B45.set('enabled', false); this.overlay_626663AB_5DCC_9681_41A7_7894AF438316.set('enabled', false); this.overlay_626673AB_5DCC_9681_41D2_9F49774B179B.set('enabled', false); this.overlay_626183AB_5DCC_9681_41AD_7F4FB949C006.set('enabled', false); this.overlay_626193AB_5DCC_9681_41AF_CD93E50D069B.set('enabled', false); this.overlay_626633AA_5DCC_9683_41CE_AADCC31A62FD.set('enabled', true)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha YCZ Poligon"
 },
 "useHandCursor": true,
 "id": "overlay_6261B3AB_5DCC_9681_41CF_1E61BB0A0FFB",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "yaw": 174.98,
 "bleachingDistance": 0.4,
 "pitch": 68.65,
 "bleaching": 0.7,
 "id": "overlay_48F077F1_5F78_6BA0_41C2_EE22BD0FCE94",
 "class": "LensFlarePanoramaOverlay"
},
{
 "yaw": 4.4,
 "bleachingDistance": 0.4,
 "pitch": 51.56,
 "bleaching": 0.7,
 "id": "overlay_48DCE16B_5F78_24A0_41BD_D4BBACFB641A",
 "class": "LensFlarePanoramaOverlay"
},
{
 "borderRadius": 0,
 "children": [
  "this.viewer_uid73298E1F_6037_FA79_41C6_DAC74417C2AD",
  {
   "borderRadius": 0,
   "children": [
    "this.htmltext_73282E1F_6037_FA79_41C6_38A90FA44B44"
   ],
   "scrollBarWidth": 7,
   "left": 0,
   "backgroundColorRatios": [],
   "right": 0,
   "paddingRight": 0,
   "horizontalAlign": "left",
   "paddingLeft": 0,
   "borderSize": 0,
   "scrollBarColor": "#FFFFFF",
   "gap": 10,
   "minHeight": 20,
   "contentOpaque": true,
   "class": "Container",
   "minWidth": 20,
   "verticalAlign": "bottom",
   "bottom": 0,
   "paddingBottom": 0,
   "scrollBarOpacity": 0.5,
   "scrollBarVisible": "rollOver",
   "backgroundColor": [],
   "backgroundColorDirection": "vertical",
   "propagateClick": false,
   "layout": "vertical",
   "height": "30%",
   "overflow": "scroll",
   "shadow": false,
   "scrollBarMargin": 2,
   "paddingTop": 0,
   "data": {
    "name": "Container4027"
   },
   "backgroundOpacity": 0.3
  },
  "this.component_732B0E20_6037_FA47_41CF_A6FF1A3D0DEA",
  "this.component_732B3E20_6037_FA47_41CA_4EEB969BEA84"
 ],
 "scrollBarWidth": 10,
 "id": "container_73286E1F_6037_FA79_4193_575593050D8C",
 "width": "100%",
 "backgroundColorRatios": [],
 "gap": 10,
 "horizontalAlign": "left",
 "paddingLeft": 0,
 "paddingRight": 0,
 "scrollBarColor": "#000000",
 "minHeight": 20,
 "borderSize": 0,
 "contentOpaque": false,
 "class": "Container",
 "minWidth": 20,
 "verticalAlign": "top",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "layout": "absolute",
 "height": "100%",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "Container4026"
 },
 "backgroundOpacity": 0.3
},
{
 "toolTipShadowSpread": 0,
 "transitionMode": "blending",
 "progressBackgroundColorDirection": "vertical",
 "id": "viewer_uid7310BE26_6037_FA4B_41D1_EC617C477B18",
 "playbackBarBorderSize": 0,
 "playbackBarBottom": 0,
 "width": "100%",
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowVerticalLength": 0,
 "toolTipShadowHorizontalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 50,
 "playbackBarHeadHeight": 15,
 "toolTipBorderRadius": 3,
 "displayTooltipInTouchScreens": true,
 "progressBackgroundColorRatios": [
  0
 ],
 "toolTipPaddingLeft": 6,
 "vrPointerSelectionTime": 2000,
 "playbackBarLeft": 0,
 "progressBorderColor": "#000000",
 "class": "ViewerArea",
 "firstTransitionDuration": 0,
 "minWidth": 100,
 "playbackBarHeadWidth": 6,
 "toolTipDisplayTime": 600,
 "toolTipFontStyle": "normal",
 "progressBorderSize": 0,
 "playbackBarHeadShadowColor": "#000000",
 "playbackBarHeadShadowVerticalLength": 0,
 "toolTipShadowBlurRadius": 3,
 "height": "100%",
 "propagateClick": false,
 "progressBottom": 2,
 "toolTipBackgroundColor": "#F6F6F6",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "toolTipFontFamily": "Arial",
 "playbackBarBorderRadius": 0,
 "progressOpacity": 1,
 "toolTipBorderSize": 1,
 "toolTipFontWeight": "normal",
 "playbackBarBackgroundColorDirection": "vertical",
 "shadow": false,
 "transitionDuration": 500,
 "toolTipPaddingBottom": 4,
 "toolTipFontSize": "1.11vmin",
 "toolTipPaddingTop": 4,
 "progressHeight": 10,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarRight": 0,
 "borderRadius": 0,
 "progressLeft": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBarBorderColor": "#000000",
 "playbackBarBackgroundOpacity": 1,
 "progressBackgroundOpacity": 1,
 "playbackBarHeadBorderRadius": 0,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadShadowHorizontalLength": 0,
 "progressRight": 0,
 "paddingRight": 0,
 "playbackBarHeadShadow": true,
 "playbackBarOpacity": 1,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarHeadBorderSize": 0,
 "toolTipTextShadowOpacity": 0,
 "toolTipOpacity": 1,
 "playbackBarHeadShadowBlurRadius": 3,
 "progressBorderRadius": 0,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "vrPointerColor": "#FFFFFF",
 "toolTipFontColor": "#606060",
 "progressBarOpacity": 1,
 "vrPointerSelectionColor": "#FF6600",
 "toolTipPaddingRight": 6,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "paddingBottom": 0,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarProgressOpacity": 1,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "toolTipShadowColor": "#333333",
 "toolTipBorderColor": "#767676",
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarProgressBorderSize": 0,
 "toolTipTextShadowBlurRadius": 3,
 "progressBarBorderSize": 0,
 "playbackBarHeadOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "progressBarBorderRadius": 0,
 "data": {
  "name": "ViewerArea4052"
 },
 "toolTipShadowOpacity": 1,
 "paddingTop": 0,
 "playbackBarHeight": 10,
 "progressBarBackgroundColorDirection": "vertical"
},
{
 "media": "this.album_705F61E7_5C4C_9281_41D4_67432D954851",
 "begin": "this.updateMediaLabelFromPlayList(this.album_705F61E7_5C4C_9281_41D4_67432D954851_AlbumPlayList, this.htmltext_73282E1F_6037_FA79_41C6_38A90FA44B44, this.albumitem_73285E1F_6037_FA79_41C4_E4D4B1A15058); this.loopAlbum(this.playList_73D5212D_602B_4658_41BE_30C570CD405B, 0)",
 "player": "this.viewer_uid73298E1F_6037_FA79_41C6_DAC74417C2ADPhotoAlbumPlayer",
 "id": "albumitem_73285E1F_6037_FA79_41C4_E4D4B1A15058",
 "class": "PhotoAlbumPlayListItem"
},
{
 "movements": [
  {
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  },
  {
   "easing": "linear",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 323
  },
  {
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  }
 ],
 "restartMovementOnUserInteraction": false,
 "id": "sequence_73589E67_6037_FAC9_41D7_A46B2D64C271",
 "class": "PanoramaCameraSequence"
},
{
 "media": "this.album_6076EEE4_5DF7_EE80_41C0_70404B70EF36",
 "begin": "this.updateMediaLabelFromPlayList(this.album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_AlbumPlayList, this.htmltext_73113E26_6037_FA4B_41C0_5F6F0E1291CA, this.albumitem_73107E25_6037_FA49_41D4_491D55159074); this.loopAlbum(this.playList_742AA13C_602B_46B8_41D2_BD110DD5CDC2, 0)",
 "player": "this.viewer_uid73104E25_6037_FA49_41CA_82E61F1B1BD5PhotoAlbumPlayer",
 "id": "albumitem_73107E25_6037_FA49_41D4_491D55159074",
 "class": "PhotoAlbumPlayListItem"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_0_0_0_map.gif",
      "width": 72,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": -179.59,
   "hfov": 17.67,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -26.82
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00, this.camera_7358EE66_6037_FACB_41C7_674FEADBCB14); this.mainPlayList.set('selectedIndex', 0)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Circle 02c"
 },
 "useHandCursor": true,
 "items": [
  {
   "hfov": 17.67,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_7D53EEB6_5F99_FDA0_41A7_1BAF32A305D1",
   "pitch": -26.82,
   "yaw": -179.59,
   "distance": 100
  }
 ],
 "id": "overlay_4B0DA32B_5C54_F781_41B6_1F1FC338D422",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_1_0_0_map.gif",
      "width": 72,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": -0.22,
   "hfov": 15.22,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -20.95
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE, this.camera_73445E75_6037_FAC9_418A_1AFDAFDDEF7C); this.mainPlayList.set('selectedIndex', 2)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Circle 02c"
 },
 "useHandCursor": true,
 "items": [
  {
   "hfov": 15.22,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_7D521EB6_5F99_FDA0_41D0_45E9DF3FAE63",
   "pitch": -20.95,
   "yaw": -0.22,
   "distance": 100
  }
 ],
 "id": "overlay_441C4984_5C55_9287_4194_E42A944D6CE3",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "hfov": 39,
 "angle": 0,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_tcap0.png",
    "width": 1050,
    "class": "ImageResourceLevel",
    "height": 1050
   }
  ]
 },
 "rotate": false,
 "id": "panorama_535281A0_5C55_92BF_41A4_79774B470AC0_tcap0",
 "distance": 50,
 "class": "TripodCapPanoramaOverlay",
 "inertia": false
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_2_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": 94.81,
   "hfov": 13.98,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -13.93
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.overlay_66793534_5DB3_9387_41A2_E3A18162C8A8.set('enabled', true); this.overlay_6679C535_5DB3_9381_41C4_93D47DC5A849.set('enabled', true); this.overlay_6679D535_5DB3_9381_41D4_6A5E729DF707.set('enabled', true); this.overlay_6679E535_5DB3_9381_41D1_A9857FFC1604.set('enabled', true); this.overlay_6679F535_5DB3_9381_41C5_3BD5A98D4728.set('enabled', true); this.overlay_66792533_5DB3_9381_41CF_07142ED6B66C.set('enabled', false)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha YCZ INFO"
 },
 "useHandCursor": true,
 "items": [
  {
   "hfov": 13.98,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_7D528EB6_5F99_FDA0_41D2_2ADED30B5704",
   "pitch": -13.93,
   "yaw": 94.81,
   "distance": 100
  }
 ],
 "id": "overlay_66792533_5DB3_9381_41CF_07142ED6B66C",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_3_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": 84.29,
   "hfov": 7.16,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -6.16
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_6653B4B8_5DB3_928F_41C8_756BE38CA23E, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_1D48789B_5DD5_B281_41A6_10DCE3978D43, null, null, null, null, false)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha YCZ Informacion"
 },
 "useHandCursor": true,
 "enabled": false,
 "items": [
  {
   "hfov": 7.16,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_3_0.png",
      "width": 200,
      "class": "ImageResourceLevel",
      "height": 200
     }
    ]
   },
   "pitch": -6.16,
   "yaw": 84.29,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_66793534_5DB3_9387_41A2_E3A18162C8A8",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_4_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": 84.28,
   "hfov": 6.92,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -16.12
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.showPopupMedia(this.window_665D74BA_5DB3_9283_41D0_3F32A6E870CE, this.album_623D971A_5DD7_9F83_417C_6FB0FF992743, this.playList_742DB135_602B_4648_41D1_6A41261040D1, '90%', '90%', false, false)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "enabled": false,
 "items": [
  {
   "hfov": 6.92,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_4_0.png",
      "width": 200,
      "class": "ImageResourceLevel",
      "height": 200
     }
    ]
   },
   "pitch": -16.12,
   "yaw": 84.28,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_6679C535_5DB3_9381_41C4_93D47DC5A849",
 "data": {
  "label": "Yamaha YCZ Fotos"
 },
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_5_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": 84.25,
   "hfov": 6.5,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -25.56
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "if(this.isCardboardViewMode()) { this.showPopupPanoramaVideoOverlay(this.popup_665E54BC_5DB3_9287_41C8_4F0F2CE7DD7C, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, true) } else { this.showPopupMedia(this.window_6B74AC72_602A_BEC8_41B8_DEEF1E42A0A9, this.video_636358BB_5DD5_9281_41D0_CDF25C2DBC6B, this.playList_742B213C_602B_46B8_41B0_F1BFB3AAD667, '95%', '95%', true, true) }",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha YCZ Video"
 },
 "useHandCursor": true,
 "enabled": false,
 "items": [
  {
   "hfov": 6.5,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_5_0.png",
      "width": 200,
      "class": "ImageResourceLevel",
      "height": 200
     }
    ]
   },
   "pitch": -25.56,
   "yaw": 84.25,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_6679D535_5DB3_9381_41D4_6A5E729DF707",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_6_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": 84.15,
   "hfov": 5.79,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -36.51
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.stopGlobalAudios(true); this.playGlobalAudioWhilePlay(this.mainPlayList, 1, this.audio_63F1E49E_5DD3_9283_41D6_582E0D8140C0, undefined, true)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha YCZ Audio"
 },
 "useHandCursor": true,
 "enabled": false,
 "items": [
  {
   "hfov": 5.79,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_6_0.png",
      "width": 200,
      "class": "ImageResourceLevel",
      "height": 200
     }
    ]
   },
   "pitch": -36.51,
   "yaw": 84.15,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_6679E535_5DB3_9381_41D1_A9857FFC1604",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_7_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": 84.24,
   "hfov": 4.99,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -46.15
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.openLink('https://www.chacomer.com.py/moto-yamaha-yc-z-110.html', '_blank')",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha YCZ Link"
 },
 "useHandCursor": true,
 "enabled": false,
 "items": [
  {
   "hfov": 4.99,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_7_0.png",
      "width": 200,
      "class": "ImageResourceLevel",
      "height": 200
     }
    ]
   },
   "pitch": -46.15,
   "yaw": 84.24,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_6679F535_5DB3_9381_41C5_3BD5A98D4728",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0_HS_8_1_0_map.gif",
      "width": 96,
      "class": "ImageResourceLevel",
      "height": 200
     }
    ]
   },
   "yaw": 89.73,
   "hfov": 34.05,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -29.53
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "rollOut": "this.overlay_66793534_5DB3_9387_41A2_E3A18162C8A8.set('enabled', false); this.overlay_6679C535_5DB3_9381_41C4_93D47DC5A849.set('enabled', false); this.overlay_6679D535_5DB3_9381_41D4_6A5E729DF707.set('enabled', false); this.overlay_6679E535_5DB3_9381_41D1_A9857FFC1604.set('enabled', false); this.overlay_6679F535_5DB3_9381_41C5_3BD5A98D4728.set('enabled', false); this.overlay_66792533_5DB3_9381_41CF_07142ED6B66C.set('enabled', true)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha YCZ Poligon"
 },
 "useHandCursor": true,
 "id": "overlay_66798535_5DB3_9381_41C3_7E7E1C1042F6",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "yaw": 10.93,
 "bleachingDistance": 0.4,
 "pitch": 69.15,
 "bleaching": 0.7,
 "id": "overlay_48FC81CA_5F78_67E6_41D3_41B1CD687E9A",
 "class": "LensFlarePanoramaOverlay"
},
{
 "yaw": 173.22,
 "bleachingDistance": 0.4,
 "pitch": 62.62,
 "bleaching": 0.7,
 "id": "overlay_48D6B9CB_5F78_67E0_41C0_AF64CB49E5C4",
 "class": "LensFlarePanoramaOverlay"
},
{
 "toolTipShadowSpread": 0,
 "transitionMode": "blending",
 "progressBackgroundColorDirection": "vertical",
 "id": "viewer_uid732B8E20_6037_FA47_41C0_43F64BFB44D2",
 "playbackBarBorderSize": 0,
 "playbackBarBottom": 0,
 "width": "100%",
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowVerticalLength": 0,
 "toolTipShadowHorizontalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 50,
 "playbackBarHeadHeight": 15,
 "toolTipBorderRadius": 3,
 "displayTooltipInTouchScreens": true,
 "progressBackgroundColorRatios": [
  0
 ],
 "toolTipPaddingLeft": 6,
 "vrPointerSelectionTime": 2000,
 "playbackBarLeft": 0,
 "progressBorderColor": "#000000",
 "class": "ViewerArea",
 "firstTransitionDuration": 0,
 "minWidth": 100,
 "playbackBarHeadWidth": 6,
 "toolTipDisplayTime": 600,
 "toolTipFontStyle": "normal",
 "progressBorderSize": 0,
 "playbackBarHeadShadowColor": "#000000",
 "playbackBarHeadShadowVerticalLength": 0,
 "toolTipShadowBlurRadius": 3,
 "height": "100%",
 "propagateClick": false,
 "progressBottom": 2,
 "toolTipBackgroundColor": "#F6F6F6",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "toolTipFontFamily": "Arial",
 "playbackBarBorderRadius": 0,
 "progressOpacity": 1,
 "toolTipBorderSize": 1,
 "toolTipFontWeight": "normal",
 "playbackBarBackgroundColorDirection": "vertical",
 "shadow": false,
 "transitionDuration": 500,
 "toolTipPaddingBottom": 4,
 "toolTipFontSize": "1.11vmin",
 "toolTipPaddingTop": 4,
 "progressHeight": 10,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarRight": 0,
 "borderRadius": 0,
 "progressLeft": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBarBorderColor": "#000000",
 "playbackBarBackgroundOpacity": 1,
 "progressBackgroundOpacity": 1,
 "playbackBarHeadBorderRadius": 0,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadShadowHorizontalLength": 0,
 "progressRight": 0,
 "paddingRight": 0,
 "playbackBarHeadShadow": true,
 "playbackBarOpacity": 1,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarHeadBorderSize": 0,
 "toolTipTextShadowOpacity": 0,
 "toolTipOpacity": 1,
 "playbackBarHeadShadowBlurRadius": 3,
 "progressBorderRadius": 0,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "vrPointerColor": "#FFFFFF",
 "toolTipFontColor": "#606060",
 "progressBarOpacity": 1,
 "vrPointerSelectionColor": "#FF6600",
 "toolTipPaddingRight": 6,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "paddingBottom": 0,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarProgressOpacity": 1,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "toolTipShadowColor": "#333333",
 "toolTipBorderColor": "#767676",
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarProgressBorderSize": 0,
 "toolTipTextShadowBlurRadius": 3,
 "progressBarBorderSize": 0,
 "playbackBarHeadOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "progressBarBorderRadius": 0,
 "data": {
  "name": "ViewerArea4031"
 },
 "toolTipShadowOpacity": 1,
 "paddingTop": 0,
 "playbackBarHeight": 10,
 "progressBarBackgroundColorDirection": "vertical"
},
{
 "items": [
  {
   "media": "this.album_623D971A_5DD7_9F83_417C_6FB0FF992743_0",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "initialPosition": {
     "x": "0.50",
     "zoomFactor": 1,
     "class": "PhotoCameraPosition",
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside",
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.32",
     "zoomFactor": 1.1,
     "class": "PhotoCameraPosition",
     "y": "0.28"
    }
   }
  },
  {
   "media": "this.album_623D971A_5DD7_9F83_417C_6FB0FF992743_1",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "initialPosition": {
     "x": "0.50",
     "zoomFactor": 1,
     "class": "PhotoCameraPosition",
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside",
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.40",
     "zoomFactor": 1.1,
     "class": "PhotoCameraPosition",
     "y": "0.26"
    }
   }
  },
  {
   "media": "this.album_623D971A_5DD7_9F83_417C_6FB0FF992743_2",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "initialPosition": {
     "x": "0.50",
     "zoomFactor": 1,
     "class": "PhotoCameraPosition",
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside",
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.49",
     "zoomFactor": 1.1,
     "class": "PhotoCameraPosition",
     "y": "0.39"
    }
   }
  },
  {
   "media": "this.album_623D971A_5DD7_9F83_417C_6FB0FF992743_3",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "initialPosition": {
     "x": "0.50",
     "zoomFactor": 1,
     "class": "PhotoCameraPosition",
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside",
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.72",
     "zoomFactor": 1.1,
     "class": "PhotoCameraPosition",
     "y": "0.63"
    }
   }
  }
 ],
 "id": "album_623D971A_5DD7_9F83_417C_6FB0FF992743_AlbumPlayList",
 "class": "PhotoPlayList"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_0_0_0_map.gif",
      "width": 72,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": 0.53,
   "hfov": 17.79,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -26.07
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_535281A0_5C55_92BF_41A4_79774B470AC0, this.camera_73606E4A_6037_FADB_41D3_7E6F20E66A96); this.mainPlayList.set('selectedIndex', 1)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Circle 02c"
 },
 "useHandCursor": true,
 "items": [
  {
   "hfov": 17.79,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_7D549EA5_5F99_FDA0_41C4_DED3015E7DC1",
   "pitch": -26.07,
   "yaw": 0.53,
   "distance": 100
  }
 ],
 "id": "overlay_4B467524_5C4D_9387_41D4_FE380B89E883",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_1_0_0_map.gif",
      "width": 72,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": 0.63,
   "hfov": 8.8,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -12.03
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE, this.camera_736DBE59_6037_FAF9_41C3_8E7DA16B851A); this.mainPlayList.set('selectedIndex', 2)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Circle 02c"
 },
 "useHandCursor": true,
 "items": [
  {
   "hfov": 8.8,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_7D54FEA6_5F99_FDA0_41CC_86BBD00DDB67",
   "pitch": -12.03,
   "yaw": 0.63,
   "distance": 100
  }
 ],
 "id": "overlay_457513E3_5C4D_B681_41D5_C29B57F9222C",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "hfov": 39,
 "angle": 0,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_tcap0.png",
    "width": 1050,
    "class": "ImageResourceLevel",
    "height": 1050
   }
  ]
 },
 "rotate": false,
 "id": "panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_tcap0",
 "distance": 50,
 "class": "TripodCapPanoramaOverlay",
 "inertia": false
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_2_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": -94.3,
   "hfov": 13.93,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -14.69
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.overlay_43F20E1A_5DF4_B180_41C8_A5254D0B8997.set('enabled', true); this.overlay_43DAC19D_5DCC_F281_41B5_CB50DF4B4D31.set('enabled', true); this.overlay_4215E153_5DCC_7381_4139_4BFC1E7E89B8.set('enabled', true); this.overlay_429A2AFB_5DCC_F681_41D5_0E61980C99DB.set('enabled', true); this.overlay_76866CB1_5C4C_9281_41B8_9BFF2D75FD70.set('enabled', true); this.overlay_48313B5D_5FED_9933_41D6_4AFD6392D488.set('enabled', true); this.overlay_4215A49C_5DDC_9287_4197_A20A64EB886C.set('enabled', false)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha MT03 INFO"
 },
 "useHandCursor": true,
 "items": [
  {
   "hfov": 13.93,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_7D57AEA7_5F99_FDA0_41C5_E457881BF40D",
   "pitch": -14.69,
   "yaw": -94.3,
   "distance": 100
  }
 ],
 "id": "overlay_4215A49C_5DDC_9287_4197_A20A64EB886C",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_3_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": -117.95,
   "hfov": 7.09,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -9.99
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_7091047F_5CB3_B181_41C4_0FD388D8E2D6, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_65255BFC_5C57_B687_41D5_CBD3185EEDE7, null, null, null, null, false)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha MT03 Informacion"
 },
 "useHandCursor": true,
 "enabled": false,
 "items": [
  {
   "hfov": 7.09,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_3_0.png",
      "width": 200,
      "class": "ImageResourceLevel",
      "height": 200
     }
    ]
   },
   "pitch": -9.99,
   "yaw": -117.95,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_43F20E1A_5DF4_B180_41C8_A5254D0B8997",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_4_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": -107.34,
   "hfov": 7.1,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -9.62
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.showPopupMedia(this.window_71F4E104_5C4C_7380_419F_83FEF09E1B14, this.album_705F61E7_5C4C_9281_41D4_67432D954851, this.playList_73D5212D_602B_4658_41BE_30C570CD405B, '90%', '90%', false, false)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "enabled": false,
 "items": [
  {
   "hfov": 7.1,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_4_0.png",
      "width": 200,
      "class": "ImageResourceLevel",
      "height": 200
     }
    ]
   },
   "pitch": -9.62,
   "yaw": -107.34,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_43DAC19D_5DCC_F281_41B5_CB50DF4B4D31",
 "data": {
  "label": "Yamaha MT03 Fotos"
 },
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_5_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": -96.94,
   "hfov": 7.1,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -9.67
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "if(this.isCardboardViewMode()) { this.showPopupPanoramaVideoOverlay(this.popup_79373586_5DD4_7283_41BE_8F200EC72946, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, true) } else { this.showPopupMedia(this.window_6B76DC6D_602A_BED8_41D2_71A1CFCD081F, this.video_786B48A9_5DD5_9281_41D6_F860A1820E4B, this.playList_742F1133_602B_4648_41D5_3D5495588A8B, '95%', '95%', true, true) }",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha MT03 Video"
 },
 "useHandCursor": true,
 "enabled": false,
 "items": [
  {
   "hfov": 7.1,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_5_0.png",
      "width": 200,
      "class": "ImageResourceLevel",
      "height": 200
     }
    ]
   },
   "pitch": -9.67,
   "yaw": -96.94,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_4215E153_5DCC_7381_4139_4BFC1E7E89B8",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_6_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": -86.58,
   "hfov": 7.11,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -9.27
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.stopGlobalAudios(true); this.playGlobalAudioWhilePlay(this.mainPlayList, 0, this.audio_749A3B4A_5DBC_9783_41C8_F9FEE5038B8C, undefined, true)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha MT03 Audio"
 },
 "useHandCursor": true,
 "enabled": false,
 "items": [
  {
   "hfov": 7.11,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_6_0.png",
      "width": 200,
      "class": "ImageResourceLevel",
      "height": 200
     }
    ]
   },
   "pitch": -9.27,
   "yaw": -86.58,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_429A2AFB_5DCC_F681_41D5_0E61980C99DB",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_9_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": -75.01,
   "hfov": 7.11,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -9.06
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.openLink('https://www.chacomer.com.py/moto/yamaha/moto-yamaha-mt-03.html', '_blank')",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha MT03 Link"
 },
 "useHandCursor": true,
 "enabled": false,
 "items": [
  {
   "hfov": 7.11,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_9_0.png",
      "width": 200,
      "class": "ImageResourceLevel",
      "height": 200
     }
    ]
   },
   "pitch": -9.06,
   "yaw": -75.01,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_76866CB1_5C4C_9281_41B8_9BFF2D75FD70",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0_HS_8_1_0_map.gif",
      "width": 200,
      "class": "ImageResourceLevel",
      "height": 118
     }
    ]
   },
   "yaw": -98.98,
   "hfov": 68.07,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -18.53
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "rollOut": "this.overlay_43F20E1A_5DF4_B180_41C8_A5254D0B8997.set('enabled', false); this.overlay_43DAC19D_5DCC_F281_41B5_CB50DF4B4D31.set('enabled', false); this.overlay_4215E153_5DCC_7381_4139_4BFC1E7E89B8.set('enabled', false); this.overlay_429A2AFB_5DCC_F681_41D5_0E61980C99DB.set('enabled', false); this.overlay_76866CB1_5C4C_9281_41B8_9BFF2D75FD70.set('enabled', false); this.overlay_4215A49C_5DDC_9287_4197_A20A64EB886C.set('enabled', true)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha MT03 Poligon"
 },
 "useHandCursor": true,
 "id": "overlay_7B869733_5DDC_9F81_41B8_814E71251A62",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_10_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": 99.74,
   "hfov": 14.22,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -9.13
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.overlay_69004F50_5C5C_6F9F_41AA_797AD5218DF0.set('enabled', true); this.overlay_69001F50_5C5C_6F9F_41C7_A19DC6FF0FEA.set('enabled', true); this.overlay_69000F50_5C5C_6F9F_41A6_5AC2ABBEF1A6.set('enabled', true); this.overlay_6901FF50_5C5C_6F9F_41C8_231691E68A0E.set('enabled', true); this.overlay_6901CF50_5C5C_6F9F_41CA_3982EE239430.set('enabled', true); this.overlay_69005F50_5C5C_6F9F_41CF_C9DE5DC5E977.set('enabled', false)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha MT03 INFO"
 },
 "useHandCursor": true,
 "enabled": false,
 "items": [
  {
   "hfov": 14.22,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_7D51CEB5_5F99_FDA0_41D3_5BDD57507F37",
   "pitch": -9.13,
   "yaw": 99.74,
   "distance": 100
  }
 ],
 "id": "overlay_69005F50_5C5C_6F9F_41CF_C9DE5DC5E977",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_11_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": 85.18,
   "hfov": 7.2,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -1.35
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_69A9EED9_5C5C_6E81_41BD_BE0C02F1E982, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_67227574_5C54_7387_41C8_00E1AFEDB3C2, null, null, null, null, false)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha MT03 Informacion"
 },
 "useHandCursor": true,
 "enabled": false,
 "items": [
  {
   "hfov": 7.2,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_11_0.png",
      "width": 200,
      "class": "ImageResourceLevel",
      "height": 200
     }
    ]
   },
   "pitch": -1.35,
   "yaw": 85.18,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_69004F50_5C5C_6F9F_41AA_797AD5218DF0",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_12_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": 94.39,
   "hfov": 7.2,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -1.32
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.showPopupMedia(this.window_6A325B13_5C7C_B781_41BD_00CC4BEAF25C, this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A, this.playList_742F6133_602B_4648_41D2_DFA45A0896E6, '90%', '90%', false, false)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "enabled": false,
 "items": [
  {
   "hfov": 7.2,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_12_0.png",
      "width": 200,
      "class": "ImageResourceLevel",
      "height": 200
     }
    ]
   },
   "pitch": -1.32,
   "yaw": 94.39,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_69001F50_5C5C_6F9F_41C7_A19DC6FF0FEA",
 "data": {
  "label": "Yamaha MT03 Fotos"
 },
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_13_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": 104.2,
   "hfov": 7.2,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -1.34
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "if(this.isCardboardViewMode()) { this.showPopupPanoramaVideoOverlay(this.popup_695E2EDD_5C5C_6E81_41D3_FF26243DB19B, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, true) } else { this.showPopupMedia(this.window_6B77DC71_602A_BEC8_41A2_22DCEDC0A401, this.video_6D28BB12_5C4D_9783_41D4_8A27FA748C2B, this.playList_742E1135_602B_4648_41C4_667E07FDE0CF, '95%', '95%', true, true) }",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha MT03 Video"
 },
 "useHandCursor": true,
 "enabled": false,
 "items": [
  {
   "hfov": 7.2,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_13_0.png",
      "width": 200,
      "class": "ImageResourceLevel",
      "height": 200
     }
    ]
   },
   "pitch": -1.34,
   "yaw": 104.2,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_69000F50_5C5C_6F9F_41A6_5AC2ABBEF1A6",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_14_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": 113.94,
   "hfov": 7.2,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -1.41
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.stopGlobalAudios(true); this.playGlobalAudioWhilePlay(this.mainPlayList, 0, this.audio_6D474534_5C54_7380_41C9_5E0067534943, undefined, true)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha MT03 Audio"
 },
 "useHandCursor": true,
 "enabled": false,
 "items": [
  {
   "hfov": 7.2,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_14_0.png",
      "width": 200,
      "class": "ImageResourceLevel",
      "height": 200
     }
    ]
   },
   "pitch": -1.41,
   "yaw": 113.94,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_6901FF50_5C5C_6F9F_41C8_231691E68A0E",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_15_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": 125,
   "hfov": 7.2,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -1.74
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.openLink('https://www.chacomer.com.py/moto-yamaha-xtz150.html', '_blank')",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha MT03 Link"
 },
 "useHandCursor": true,
 "enabled": false,
 "items": [
  {
   "hfov": 7.2,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_15_0.png",
      "width": 200,
      "class": "ImageResourceLevel",
      "height": 200
     }
    ]
   },
   "pitch": -1.74,
   "yaw": 125,
   "class": "HotspotPanoramaOverlayImage"
  }
 ],
 "id": "overlay_6901CF50_5C5C_6F9F_41CA_3982EE239430",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_16_1_0_map.gif",
      "width": 200,
      "class": "ImageResourceLevel",
      "height": 189
     }
    ]
   },
   "yaw": 108.3,
   "hfov": 63.64,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -23.69
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "rollOut": "this.overlay_69004F50_5C5C_6F9F_41AA_797AD5218DF0.set('enabled', false); this.overlay_69001F50_5C5C_6F9F_41C7_A19DC6FF0FEA.set('enabled', false); this.overlay_69000F50_5C5C_6F9F_41A6_5AC2ABBEF1A6.set('enabled', false); this.overlay_6901FF50_5C5C_6F9F_41C8_231691E68A0E.set('enabled', false); this.overlay_6901CF50_5C5C_6F9F_41CA_3982EE239430.set('enabled', false); this.overlay_69005F50_5C5C_6F9F_41CF_C9DE5DC5E977.set('enabled', true)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "data": {
  "label": "Yamaha MT03 Poligon"
 },
 "useHandCursor": true,
 "id": "overlay_69074F50_5C5C_6F9F_41C6_353298956340",
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay"
},
{
 "yaw": 0.88,
 "bleachingDistance": 0.4,
 "pitch": 37.75,
 "bleaching": 0.7,
 "id": "overlay_46A4D789_5F78_EC60_41D3_58599F48EA5E",
 "class": "LensFlarePanoramaOverlay"
},
{
 "yaw": -176.99,
 "bleachingDistance": 0.4,
 "pitch": 76.69,
 "bleaching": 0.7,
 "id": "overlay_4683F336_5F78_E4A0_41B9_66C64F5F92D6",
 "class": "LensFlarePanoramaOverlay"
},
{
 "maps": [
  {
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0_HS_18_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ]
   },
   "yaw": -76.66,
   "hfov": 5.93,
   "class": "HotspotPanoramaOverlayMap",
   "pitch": -19.36
  }
 ],
 "rollOverDisplay": false,
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.setComponentVisibility(this.Container_47EBA17C_5FE3_89F1_41C4_50BC03196235_mobile, true, 0, this.effect_4635488F_5FE7_872E_41C1_FF3ECDA34F01, 'showEffect', false)",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "enabled": false,
 "items": [
  {
   "hfov": 5.93,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_4143A243_5FE5_8B17_41C3_F135948B4F22",
   "pitch": -19.36,
   "yaw": -76.66,
   "distance": 100
  }
 ],
 "id": "overlay_48313B5D_5FED_9933_41D6_4AFD6392D488",
 "data": {
  "label": "mt-03 360 object"
 },
 "class": "HotspotPanoramaOverlay"
},
{
 "id": "viewer_uid73117E24_6037_FA4F_41CD_81117C60F5A8VideoPlayer",
 "class": "VideoPlayer",
 "displayPlaybackBar": true,
 "viewerArea": "this.viewer_uid73117E24_6037_FA4F_41CD_81117C60F5A8"
},
{
 "borderRadius": 0,
 "children": [
  "this.viewer_uid732A1E21_6037_FA49_41BE_F35B65F2C711",
  {
   "borderRadius": 0,
   "children": [
    "this.htmltext_732D4E22_6037_FA4B_41C9_B08C4E719DE6"
   ],
   "scrollBarWidth": 7,
   "left": 0,
   "backgroundColorRatios": [],
   "right": 0,
   "paddingRight": 0,
   "horizontalAlign": "left",
   "paddingLeft": 0,
   "borderSize": 0,
   "scrollBarColor": "#FFFFFF",
   "gap": 10,
   "minHeight": 20,
   "contentOpaque": true,
   "class": "Container",
   "minWidth": 20,
   "verticalAlign": "bottom",
   "bottom": 0,
   "paddingBottom": 0,
   "scrollBarOpacity": 0.5,
   "scrollBarVisible": "rollOver",
   "backgroundColor": [],
   "backgroundColorDirection": "vertical",
   "propagateClick": false,
   "layout": "vertical",
   "height": "30%",
   "overflow": "scroll",
   "shadow": false,
   "scrollBarMargin": 2,
   "paddingTop": 0,
   "data": {
    "name": "Container4034"
   },
   "backgroundOpacity": 0.3
  },
  "this.component_732D8E22_6037_FA4B_41D1_019F19E52FC0",
  "this.component_732DAE22_6037_FA4B_41CD_01B19C21FB2E"
 ],
 "scrollBarWidth": 10,
 "id": "container_732AEE21_6037_FA49_41CE_AE819BBD1ABB",
 "width": "100%",
 "backgroundColorRatios": [],
 "gap": 10,
 "horizontalAlign": "left",
 "paddingLeft": 0,
 "paddingRight": 0,
 "scrollBarColor": "#000000",
 "minHeight": 20,
 "borderSize": 0,
 "contentOpaque": false,
 "class": "Container",
 "minWidth": 20,
 "verticalAlign": "top",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "layout": "absolute",
 "height": "100%",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "Container4033"
 },
 "backgroundOpacity": 0.3
},
{
 "media": "this.album_623D971A_5DD7_9F83_417C_6FB0FF992743",
 "begin": "this.updateMediaLabelFromPlayList(this.album_623D971A_5DD7_9F83_417C_6FB0FF992743_AlbumPlayList, this.htmltext_732F8E24_6037_FA4F_41BB_A3EBE6F80791, this.albumitem_732F7E23_6037_FA49_4176_622C212C18EA); this.loopAlbum(this.playList_742DB135_602B_4648_41D1_6A41261040D1, 0)",
 "player": "this.viewer_uid732F4E23_6037_FA49_4188_C485ED17DD29PhotoAlbumPlayer",
 "id": "albumitem_732F7E23_6037_FA49_4176_622C212C18EA",
 "class": "PhotoAlbumPlayListItem"
},
{
 "movements": [
  {
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  },
  {
   "easing": "linear",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 323
  },
  {
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  }
 ],
 "restartMovementOnUserInteraction": false,
 "id": "sequence_736C4E59_6037_FAF9_41D2_46D92D03655D",
 "class": "PanoramaCameraSequence"
},
{
 "movements": [
  {
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  },
  {
   "easing": "linear",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 323
  },
  {
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  }
 ],
 "restartMovementOnUserInteraction": false,
 "id": "sequence_73447E75_6037_FAC9_41D0_C3D7F61FC764",
 "class": "PanoramaCameraSequence"
},
{
 "items": [
  {
   "media": "this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_0",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "initialPosition": {
     "x": "0.50",
     "zoomFactor": 1,
     "class": "PhotoCameraPosition",
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside",
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.38",
     "zoomFactor": 1.1,
     "class": "PhotoCameraPosition",
     "y": "0.32"
    }
   }
  },
  {
   "media": "this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_1",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "initialPosition": {
     "x": "0.50",
     "zoomFactor": 1,
     "class": "PhotoCameraPosition",
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside",
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.74",
     "zoomFactor": 1.1,
     "class": "PhotoCameraPosition",
     "y": "0.26"
    }
   }
  },
  {
   "media": "this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_2",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "initialPosition": {
     "x": "0.50",
     "zoomFactor": 1,
     "class": "PhotoCameraPosition",
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside",
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.35",
     "zoomFactor": 1.1,
     "class": "PhotoCameraPosition",
     "y": "0.52"
    }
   }
  },
  {
   "media": "this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_3",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "initialPosition": {
     "x": "0.50",
     "zoomFactor": 1,
     "class": "PhotoCameraPosition",
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside",
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.32",
     "zoomFactor": 1.1,
     "class": "PhotoCameraPosition",
     "y": "0.61"
    }
   }
  },
  {
   "media": "this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_4",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "initialPosition": {
     "x": "0.50",
     "zoomFactor": 1,
     "class": "PhotoCameraPosition",
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside",
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.56",
     "zoomFactor": 1.1,
     "class": "PhotoCameraPosition",
     "y": "0.54"
    }
   }
  },
  {
   "media": "this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_5",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "initialPosition": {
     "x": "0.50",
     "zoomFactor": 1,
     "class": "PhotoCameraPosition",
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside",
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.74",
     "zoomFactor": 1.1,
     "class": "PhotoCameraPosition",
     "y": "0.75"
    }
   }
  }
 ],
 "id": "album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_AlbumPlayList",
 "class": "PhotoPlayList"
},
{
 "movements": [
  {
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  },
  {
   "easing": "linear",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 323
  },
  {
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  }
 ],
 "restartMovementOnUserInteraction": false,
 "id": "sequence_53439A1A_5C54_B183_41C4_02C53D863FE2",
 "class": "PanoramaCameraSequence"
},
{
 "movements": [
  {
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  },
  {
   "easing": "linear",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 323
  },
  {
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  }
 ],
 "restartMovementOnUserInteraction": false,
 "id": "sequence_73B42E82_6037_FA4B_41AE_EC976D31B623",
 "class": "PanoramaCameraSequence"
},
{
 "borderRadius": 0,
 "children": [
  "this.viewer_uid73104E25_6037_FA49_41CA_82E61F1B1BD5",
  {
   "borderRadius": 0,
   "children": [
    "this.htmltext_73113E26_6037_FA4B_41C0_5F6F0E1291CA"
   ],
   "scrollBarWidth": 7,
   "left": 0,
   "backgroundColorRatios": [],
   "right": 0,
   "paddingRight": 0,
   "horizontalAlign": "left",
   "paddingLeft": 0,
   "borderSize": 0,
   "scrollBarColor": "#FFFFFF",
   "gap": 10,
   "minHeight": 20,
   "contentOpaque": true,
   "class": "Container",
   "minWidth": 20,
   "verticalAlign": "bottom",
   "bottom": 0,
   "paddingBottom": 0,
   "scrollBarOpacity": 0.5,
   "scrollBarVisible": "rollOver",
   "backgroundColor": [],
   "backgroundColorDirection": "vertical",
   "propagateClick": false,
   "layout": "vertical",
   "height": "30%",
   "overflow": "scroll",
   "shadow": false,
   "scrollBarMargin": 2,
   "paddingTop": 0,
   "data": {
    "name": "Container4048"
   },
   "backgroundOpacity": 0.3
  },
  "this.component_73100E26_6037_FA4B_41D0_7B7AF048848F",
  "this.component_73102E26_6037_FA4B_41D2_9BE814E6293F"
 ],
 "scrollBarWidth": 10,
 "id": "container_732EAE25_6037_FA49_41CE_0A91B7C623E6",
 "width": "100%",
 "backgroundColorRatios": [],
 "gap": 10,
 "horizontalAlign": "left",
 "paddingLeft": 0,
 "paddingRight": 0,
 "scrollBarColor": "#000000",
 "minHeight": 20,
 "borderSize": 0,
 "contentOpaque": false,
 "class": "Container",
 "minWidth": 20,
 "verticalAlign": "top",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "layout": "absolute",
 "height": "100%",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "Container4047"
 },
 "backgroundOpacity": 0.3
},
{
 "borderRadius": 0,
 "children": [
  "this.viewer_uid732F4E23_6037_FA49_4188_C485ED17DD29",
  {
   "borderRadius": 0,
   "children": [
    "this.htmltext_732F8E24_6037_FA4F_41BB_A3EBE6F80791"
   ],
   "scrollBarWidth": 7,
   "left": 0,
   "backgroundColorRatios": [],
   "right": 0,
   "paddingRight": 0,
   "horizontalAlign": "left",
   "paddingLeft": 0,
   "borderSize": 0,
   "scrollBarColor": "#FFFFFF",
   "gap": 10,
   "minHeight": 20,
   "contentOpaque": true,
   "class": "Container",
   "minWidth": 20,
   "verticalAlign": "bottom",
   "bottom": 0,
   "paddingBottom": 0,
   "scrollBarOpacity": 0.5,
   "scrollBarVisible": "rollOver",
   "backgroundColor": [],
   "backgroundColorDirection": "vertical",
   "propagateClick": false,
   "layout": "vertical",
   "height": "30%",
   "overflow": "scroll",
   "shadow": false,
   "scrollBarMargin": 2,
   "paddingTop": 0,
   "data": {
    "name": "Container4041"
   },
   "backgroundOpacity": 0.3
  },
  "this.component_732EDE24_6037_FA4F_41AF_318F59D81763",
  "this.component_732EEE24_6037_FA4F_41D5_62712980355A"
 ],
 "scrollBarWidth": 10,
 "id": "container_732F3E23_6037_FA49_41B3_189EBBF8103B",
 "width": "100%",
 "backgroundColorRatios": [],
 "gap": 10,
 "horizontalAlign": "left",
 "paddingLeft": 0,
 "paddingRight": 0,
 "scrollBarColor": "#000000",
 "minHeight": 20,
 "borderSize": 0,
 "contentOpaque": false,
 "class": "Container",
 "minWidth": 20,
 "verticalAlign": "top",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "layout": "absolute",
 "height": "100%",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "Container4040"
 },
 "backgroundOpacity": 0.3
},
{
 "movements": [
  {
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  },
  {
   "easing": "linear",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 323
  },
  {
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  }
 ],
 "restartMovementOnUserInteraction": false,
 "id": "sequence_535C7A1A_5C54_B183_41BC_D9E72EB0D991",
 "class": "PanoramaCameraSequence"
},
{
 "id": "viewer_uid732B8E20_6037_FA47_41C0_43F64BFB44D2VideoPlayer",
 "class": "VideoPlayer",
 "displayPlaybackBar": true,
 "viewerArea": "this.viewer_uid732B8E20_6037_FA47_41C0_43F64BFB44D2"
},
{
 "items": [
  {
   "media": "this.album_705F61E7_5C4C_9281_41D4_67432D954851_0",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "initialPosition": {
     "x": "0.50",
     "zoomFactor": 1,
     "class": "PhotoCameraPosition",
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside",
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.52",
     "zoomFactor": 1.1,
     "class": "PhotoCameraPosition",
     "y": "0.54"
    }
   }
  },
  {
   "media": "this.album_705F61E7_5C4C_9281_41D4_67432D954851_1",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "initialPosition": {
     "x": "0.50",
     "zoomFactor": 1,
     "class": "PhotoCameraPosition",
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside",
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.69",
     "zoomFactor": 1.1,
     "class": "PhotoCameraPosition",
     "y": "0.52"
    }
   }
  },
  {
   "media": "this.album_705F61E7_5C4C_9281_41D4_67432D954851_2",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "initialPosition": {
     "x": "0.50",
     "zoomFactor": 1,
     "class": "PhotoCameraPosition",
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside",
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.33",
     "zoomFactor": 1.1,
     "class": "PhotoCameraPosition",
     "y": "0.61"
    }
   }
  }
 ],
 "id": "album_705F61E7_5C4C_9281_41D4_67432D954851_AlbumPlayList",
 "class": "PhotoPlayList"
},
{
 "id": "viewer_uid732C1E22_6037_FA4B_41D2_00FFFA0AA62BVideoPlayer",
 "class": "VideoPlayer",
 "displayPlaybackBar": true,
 "viewerArea": "this.viewer_uid732C1E22_6037_FA4B_41D2_00FFFA0AA62B"
},
{
 "id": "viewer_uid7310BE26_6037_FA4B_41D1_EC617C477B18VideoPlayer",
 "class": "VideoPlayer",
 "displayPlaybackBar": true,
 "viewerArea": "this.viewer_uid7310BE26_6037_FA4B_41D1_EC617C477B18"
},
{
 "movements": [
  {
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  },
  {
   "easing": "linear",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 323
  },
  {
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  }
 ],
 "restartMovementOnUserInteraction": false,
 "id": "sequence_535C5A1A_5C54_B183_41B4_3072914924C6",
 "class": "PanoramaCameraSequence"
},
{
 "media": "this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A",
 "begin": "this.updateMediaLabelFromPlayList(this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_AlbumPlayList, this.htmltext_732D4E22_6037_FA4B_41C9_B08C4E719DE6, this.albumitem_732A3E21_6037_FA49_41C2_428B4852AACC); this.loopAlbum(this.playList_742F6133_602B_4648_41D2_DFA45A0896E6, 0)",
 "player": "this.viewer_uid732A1E21_6037_FA49_41BE_F35B65F2C711PhotoAlbumPlayer",
 "id": "albumitem_732A3E21_6037_FA49_41C2_428B4852AACC",
 "class": "PhotoAlbumPlayListItem"
},
{
 "movements": [
  {
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  },
  {
   "easing": "linear",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 323
  },
  {
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  }
 ],
 "restartMovementOnUserInteraction": false,
 "id": "sequence_73601E4A_6037_FADB_41C3_4B6D758997E4",
 "class": "PanoramaCameraSequence"
},
{
 "movements": [
  {
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  },
  {
   "easing": "linear",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 323
  },
  {
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  }
 ],
 "restartMovementOnUserInteraction": false,
 "id": "sequence_7380BEAC_6037_FA5F_41C3_9EB31BADF642",
 "class": "PanoramaCameraSequence"
},
{
 "movements": [
  {
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  },
  {
   "easing": "linear",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 323
  },
  {
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  }
 ],
 "restartMovementOnUserInteraction": false,
 "id": "sequence_5343BA1A_5C54_B183_41D6_CBD1E4B07337",
 "class": "PanoramaCameraSequence"
},
{
 "toolTipShadowSpread": 0,
 "transitionMode": "blending",
 "progressBackgroundColorDirection": "vertical",
 "id": "viewer_uid73117E24_6037_FA4F_41CD_81117C60F5A8",
 "playbackBarBorderSize": 0,
 "playbackBarBottom": 0,
 "width": "100%",
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowVerticalLength": 0,
 "toolTipShadowHorizontalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 50,
 "playbackBarHeadHeight": 15,
 "toolTipBorderRadius": 3,
 "displayTooltipInTouchScreens": true,
 "progressBackgroundColorRatios": [
  0
 ],
 "toolTipPaddingLeft": 6,
 "vrPointerSelectionTime": 2000,
 "playbackBarLeft": 0,
 "progressBorderColor": "#000000",
 "class": "ViewerArea",
 "firstTransitionDuration": 0,
 "minWidth": 100,
 "playbackBarHeadWidth": 6,
 "toolTipDisplayTime": 600,
 "toolTipFontStyle": "normal",
 "progressBorderSize": 0,
 "playbackBarHeadShadowColor": "#000000",
 "playbackBarHeadShadowVerticalLength": 0,
 "toolTipShadowBlurRadius": 3,
 "height": "100%",
 "propagateClick": false,
 "progressBottom": 2,
 "toolTipBackgroundColor": "#F6F6F6",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "toolTipFontFamily": "Arial",
 "playbackBarBorderRadius": 0,
 "progressOpacity": 1,
 "toolTipBorderSize": 1,
 "toolTipFontWeight": "normal",
 "playbackBarBackgroundColorDirection": "vertical",
 "shadow": false,
 "transitionDuration": 500,
 "toolTipPaddingBottom": 4,
 "toolTipFontSize": "1.11vmin",
 "toolTipPaddingTop": 4,
 "progressHeight": 10,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarRight": 0,
 "borderRadius": 0,
 "progressLeft": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBarBorderColor": "#000000",
 "playbackBarBackgroundOpacity": 1,
 "progressBackgroundOpacity": 1,
 "playbackBarHeadBorderRadius": 0,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadShadowHorizontalLength": 0,
 "progressRight": 0,
 "paddingRight": 0,
 "playbackBarHeadShadow": true,
 "playbackBarOpacity": 1,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarHeadBorderSize": 0,
 "toolTipTextShadowOpacity": 0,
 "toolTipOpacity": 1,
 "playbackBarHeadShadowBlurRadius": 3,
 "progressBorderRadius": 0,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "vrPointerColor": "#FFFFFF",
 "toolTipFontColor": "#606060",
 "progressBarOpacity": 1,
 "vrPointerSelectionColor": "#FF6600",
 "toolTipPaddingRight": 6,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "paddingBottom": 0,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarProgressOpacity": 1,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "toolTipShadowColor": "#333333",
 "toolTipBorderColor": "#767676",
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarProgressBorderSize": 0,
 "toolTipTextShadowBlurRadius": 3,
 "progressBarBorderSize": 0,
 "playbackBarHeadOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "progressBarBorderRadius": 0,
 "data": {
  "name": "ViewerArea4045"
 },
 "toolTipShadowOpacity": 1,
 "paddingTop": 0,
 "playbackBarHeight": 10,
 "progressBarBackgroundColorDirection": "vertical"
},
{
 "movements": [
  {
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  },
  {
   "easing": "linear",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 323
  },
  {
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  }
 ],
 "restartMovementOnUserInteraction": false,
 "id": "sequence_73A21E90_6037_FA47_41BF_EB8E301260B5",
 "class": "PanoramaCameraSequence"
},
{
 "movements": [
  {
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  },
  {
   "easing": "linear",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 323
  },
  {
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "class": "DistancePanoramaCameraMovement",
   "yawDelta": 18.5
  }
 ],
 "restartMovementOnUserInteraction": false,
 "id": "sequence_73921E9E_6037_FA7B_41B6_D46DC4F19163",
 "class": "PanoramaCameraSequence"
},
{
 "levels": [
  {
   "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_1_HS_0_0.png",
   "width": 1080,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D590EB9_5F99_FDA0_41D4_692B51201688",
 "class": "AnimatedImageResource",
 "frameDuration": 41
},
{
 "levels": [
  {
   "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_0_0.png",
   "width": 1080,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D5C4EB7_5F99_FDA0_41D5_F8A008C39ED4",
 "class": "AnimatedImageResource",
 "frameDuration": 41
},
{
 "levels": [
  {
   "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_1_0.png",
   "width": 1080,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D5C7EB7_5F99_FDA0_41D5_D12355328A4E",
 "class": "AnimatedImageResource",
 "frameDuration": 41
},
{
 "levels": [
  {
   "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_2_0.png",
   "width": 1080,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D5CDEB8_5F99_FDA0_41B3_D0A81F81F8B3",
 "class": "AnimatedImageResource",
 "frameDuration": 41
},
{
 "levels": [
  {
   "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_3_0.png",
   "width": 780,
   "class": "ImageResourceLevel",
   "height": 1170
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D5F3EB8_5F99_FDA0_41A6_6B7EED5ECF53",
 "class": "AnimatedImageResource",
 "frameDuration": 41
},
{
 "toolTipShadowSpread": 0,
 "transitionMode": "blending",
 "progressBackgroundColorDirection": "vertical",
 "id": "viewer_uid73298E1F_6037_FA79_41C6_DAC74417C2AD",
 "playbackBarBorderSize": 0,
 "playbackBarBottom": 0,
 "width": "100%",
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowVerticalLength": 0,
 "toolTipShadowHorizontalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 50,
 "playbackBarHeadHeight": 15,
 "toolTipBorderRadius": 3,
 "displayTooltipInTouchScreens": true,
 "progressBackgroundColorRatios": [
  0
 ],
 "toolTipPaddingLeft": 6,
 "vrPointerSelectionTime": 2000,
 "playbackBarLeft": 0,
 "progressBorderColor": "#000000",
 "class": "ViewerArea",
 "firstTransitionDuration": 0,
 "minWidth": 100,
 "playbackBarHeadWidth": 6,
 "toolTipDisplayTime": 600,
 "toolTipFontStyle": "normal",
 "progressBorderSize": 0,
 "playbackBarHeadShadowColor": "#000000",
 "playbackBarHeadShadowVerticalLength": 0,
 "toolTipShadowBlurRadius": 3,
 "height": "100%",
 "propagateClick": false,
 "progressBottom": 2,
 "toolTipBackgroundColor": "#F6F6F6",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "toolTipFontFamily": "Arial",
 "playbackBarBorderRadius": 0,
 "progressOpacity": 1,
 "toolTipBorderSize": 1,
 "toolTipFontWeight": "normal",
 "playbackBarBackgroundColorDirection": "vertical",
 "shadow": false,
 "transitionDuration": 500,
 "toolTipPaddingBottom": 4,
 "toolTipFontSize": "1.11vmin",
 "toolTipPaddingTop": 4,
 "progressHeight": 10,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarRight": 0,
 "borderRadius": 0,
 "progressLeft": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBarBorderColor": "#000000",
 "playbackBarBackgroundOpacity": 1,
 "progressBackgroundOpacity": 1,
 "playbackBarHeadBorderRadius": 0,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadShadowHorizontalLength": 0,
 "progressRight": 0,
 "paddingRight": 0,
 "playbackBarHeadShadow": true,
 "playbackBarOpacity": 1,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarHeadBorderSize": 0,
 "toolTipTextShadowOpacity": 0,
 "toolTipOpacity": 1,
 "playbackBarHeadShadowBlurRadius": 3,
 "progressBorderRadius": 0,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "vrPointerColor": "#FFFFFF",
 "toolTipFontColor": "#606060",
 "progressBarOpacity": 1,
 "vrPointerSelectionColor": "#FF6600",
 "toolTipPaddingRight": 6,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "paddingBottom": 0,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarProgressOpacity": 1,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "toolTipShadowColor": "#333333",
 "toolTipBorderColor": "#767676",
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarProgressBorderSize": 0,
 "toolTipTextShadowBlurRadius": 3,
 "progressBarBorderSize": 0,
 "playbackBarHeadOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "progressBarBorderRadius": 0,
 "data": {
  "name": "ViewerArea4025"
 },
 "toolTipShadowOpacity": 1,
 "paddingTop": 0,
 "playbackBarHeight": 10,
 "progressBarBackgroundColorDirection": "vertical"
},
{
 "borderRadius": 0,
 "scrollBarWidth": 10,
 "id": "htmltext_73282E1F_6037_FA79_41C6_38A90FA44B44",
 "backgroundColorRatios": [
  0
 ],
 "width": "100%",
 "paddingRight": 10,
 "paddingLeft": 10,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 0,
 "class": "HTMLText",
 "hideEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeOutEffect"
 },
 "minWidth": 0,
 "paddingBottom": 5,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "data": {
  "name": "HTMLText4028"
 },
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 5,
 "visible": false,
 "showEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeInEffect"
 },
 "html": "",
 "backgroundOpacity": 0.7
},
{
 "borderRadius": 0,
 "id": "component_732B0E20_6037_FA47_41CF_A6FF1A3D0DEA",
 "left": 10,
 "showEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeInEffect"
 },
 "paddingRight": 0,
 "iconURL": "skin/album_left.png",
 "horizontalAlign": "center",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 0,
 "top": "45%",
 "transparencyActive": true,
 "hideEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeOutEffect"
 },
 "minWidth": 0,
 "mode": "push",
 "verticalAlign": "middle",
 "class": "IconButton",
 "paddingBottom": 0,
 "click": "this.loadFromCurrentMediaPlayList(this.album_705F61E7_5C4C_9281_41D4_67432D954851_AlbumPlayList, -1)",
 "propagateClick": false,
 "data": {
  "name": "IconButton4029"
 },
 "shadow": false,
 "paddingTop": 0,
 "visible": false,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "borderRadius": 0,
 "id": "component_732B3E20_6037_FA47_41CA_4EEB969BEA84",
 "right": 10,
 "showEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeInEffect"
 },
 "paddingRight": 0,
 "iconURL": "skin/album_right.png",
 "horizontalAlign": "center",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 0,
 "top": "45%",
 "transparencyActive": true,
 "hideEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeOutEffect"
 },
 "minWidth": 0,
 "mode": "push",
 "verticalAlign": "middle",
 "class": "IconButton",
 "paddingBottom": 0,
 "click": "this.loadFromCurrentMediaPlayList(this.album_705F61E7_5C4C_9281_41D4_67432D954851_AlbumPlayList, 1)",
 "propagateClick": false,
 "data": {
  "name": "IconButton4030"
 },
 "shadow": false,
 "paddingTop": 0,
 "visible": false,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "buttonNext": "this.IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4_mobile",
 "id": "viewer_uid73298E1F_6037_FA79_41C6_DAC74417C2ADPhotoAlbumPlayer",
 "class": "PhotoAlbumPlayer",
 "buttonPrevious": "this.IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC_mobile",
 "viewerArea": "this.viewer_uid73298E1F_6037_FA79_41C6_DAC74417C2AD"
},
{
 "buttonNext": "this.IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4_mobile",
 "id": "viewer_uid73104E25_6037_FA49_41CA_82E61F1B1BD5PhotoAlbumPlayer",
 "class": "PhotoAlbumPlayer",
 "buttonPrevious": "this.IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC_mobile",
 "viewerArea": "this.viewer_uid73104E25_6037_FA49_41CA_82E61F1B1BD5"
},
{
 "levels": [
  {
   "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_0_0.png",
   "width": 1080,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D53EEB6_5F99_FDA0_41A7_1BAF32A305D1",
 "class": "AnimatedImageResource",
 "frameDuration": 41
},
{
 "levels": [
  {
   "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_1_0.png",
   "width": 1080,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D521EB6_5F99_FDA0_41D0_45E9DF3FAE63",
 "class": "AnimatedImageResource",
 "frameDuration": 41
},
{
 "levels": [
  {
   "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_2_0.png",
   "width": 780,
   "class": "ImageResourceLevel",
   "height": 1170
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D528EB6_5F99_FDA0_41D2_2ADED30B5704",
 "class": "AnimatedImageResource",
 "frameDuration": 41
},
{
 "levels": [
  {
   "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_0_0.png",
   "width": 1080,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D549EA5_5F99_FDA0_41C4_DED3015E7DC1",
 "class": "AnimatedImageResource",
 "frameDuration": 41
},
{
 "levels": [
  {
   "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_1_0.png",
   "width": 1080,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D54FEA6_5F99_FDA0_41CC_86BBD00DDB67",
 "class": "AnimatedImageResource",
 "frameDuration": 41
},
{
 "levels": [
  {
   "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_2_0.png",
   "width": 780,
   "class": "ImageResourceLevel",
   "height": 1170
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D57AEA7_5F99_FDA0_41C5_E457881BF40D",
 "class": "AnimatedImageResource",
 "frameDuration": 41
},
{
 "levels": [
  {
   "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_10_0.png",
   "width": 780,
   "class": "ImageResourceLevel",
   "height": 1170
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D51CEB5_5F99_FDA0_41D3_5BDD57507F37",
 "class": "AnimatedImageResource",
 "frameDuration": 41
},
{
 "levels": [
  {
   "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0_HS_18_0.png",
   "width": 580,
   "class": "ImageResourceLevel",
   "height": 870
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "rowCount": 6,
 "id": "AnimatedImageResource_4143A243_5FE5_8B17_41C3_F135948B4F22",
 "class": "AnimatedImageResource",
 "frameDuration": 41
},
{
 "toolTipShadowSpread": 0,
 "transitionMode": "blending",
 "progressBackgroundColorDirection": "vertical",
 "id": "viewer_uid732A1E21_6037_FA49_41BE_F35B65F2C711",
 "playbackBarBorderSize": 0,
 "playbackBarBottom": 0,
 "width": "100%",
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowVerticalLength": 0,
 "toolTipShadowHorizontalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 50,
 "playbackBarHeadHeight": 15,
 "toolTipBorderRadius": 3,
 "displayTooltipInTouchScreens": true,
 "progressBackgroundColorRatios": [
  0
 ],
 "toolTipPaddingLeft": 6,
 "vrPointerSelectionTime": 2000,
 "playbackBarLeft": 0,
 "progressBorderColor": "#000000",
 "class": "ViewerArea",
 "firstTransitionDuration": 0,
 "minWidth": 100,
 "playbackBarHeadWidth": 6,
 "toolTipDisplayTime": 600,
 "toolTipFontStyle": "normal",
 "progressBorderSize": 0,
 "playbackBarHeadShadowColor": "#000000",
 "playbackBarHeadShadowVerticalLength": 0,
 "toolTipShadowBlurRadius": 3,
 "height": "100%",
 "propagateClick": false,
 "progressBottom": 2,
 "toolTipBackgroundColor": "#F6F6F6",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "toolTipFontFamily": "Arial",
 "playbackBarBorderRadius": 0,
 "progressOpacity": 1,
 "toolTipBorderSize": 1,
 "toolTipFontWeight": "normal",
 "playbackBarBackgroundColorDirection": "vertical",
 "shadow": false,
 "transitionDuration": 500,
 "toolTipPaddingBottom": 4,
 "toolTipFontSize": "1.11vmin",
 "toolTipPaddingTop": 4,
 "progressHeight": 10,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarRight": 0,
 "borderRadius": 0,
 "progressLeft": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBarBorderColor": "#000000",
 "playbackBarBackgroundOpacity": 1,
 "progressBackgroundOpacity": 1,
 "playbackBarHeadBorderRadius": 0,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadShadowHorizontalLength": 0,
 "progressRight": 0,
 "paddingRight": 0,
 "playbackBarHeadShadow": true,
 "playbackBarOpacity": 1,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarHeadBorderSize": 0,
 "toolTipTextShadowOpacity": 0,
 "toolTipOpacity": 1,
 "playbackBarHeadShadowBlurRadius": 3,
 "progressBorderRadius": 0,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "vrPointerColor": "#FFFFFF",
 "toolTipFontColor": "#606060",
 "progressBarOpacity": 1,
 "vrPointerSelectionColor": "#FF6600",
 "toolTipPaddingRight": 6,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "paddingBottom": 0,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarProgressOpacity": 1,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "toolTipShadowColor": "#333333",
 "toolTipBorderColor": "#767676",
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarProgressBorderSize": 0,
 "toolTipTextShadowBlurRadius": 3,
 "progressBarBorderSize": 0,
 "playbackBarHeadOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "progressBarBorderRadius": 0,
 "data": {
  "name": "ViewerArea4032"
 },
 "toolTipShadowOpacity": 1,
 "paddingTop": 0,
 "playbackBarHeight": 10,
 "progressBarBackgroundColorDirection": "vertical"
},
{
 "borderRadius": 0,
 "scrollBarWidth": 10,
 "id": "htmltext_732D4E22_6037_FA4B_41C9_B08C4E719DE6",
 "backgroundColorRatios": [
  0
 ],
 "width": "100%",
 "paddingRight": 10,
 "paddingLeft": 10,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 0,
 "class": "HTMLText",
 "hideEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeOutEffect"
 },
 "minWidth": 0,
 "paddingBottom": 5,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "data": {
  "name": "HTMLText4035"
 },
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 5,
 "visible": false,
 "showEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeInEffect"
 },
 "html": "",
 "backgroundOpacity": 0.7
},
{
 "borderRadius": 0,
 "id": "component_732D8E22_6037_FA4B_41D1_019F19E52FC0",
 "left": 10,
 "showEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeInEffect"
 },
 "paddingRight": 0,
 "iconURL": "skin/album_left.png",
 "horizontalAlign": "center",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 0,
 "top": "45%",
 "transparencyActive": true,
 "hideEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeOutEffect"
 },
 "minWidth": 0,
 "mode": "push",
 "verticalAlign": "middle",
 "class": "IconButton",
 "paddingBottom": 0,
 "click": "this.loadFromCurrentMediaPlayList(this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_AlbumPlayList, -1)",
 "propagateClick": false,
 "data": {
  "name": "IconButton4036"
 },
 "shadow": false,
 "paddingTop": 0,
 "visible": false,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "borderRadius": 0,
 "id": "component_732DAE22_6037_FA4B_41CD_01B19C21FB2E",
 "right": 10,
 "showEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeInEffect"
 },
 "paddingRight": 0,
 "iconURL": "skin/album_right.png",
 "horizontalAlign": "center",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 0,
 "top": "45%",
 "transparencyActive": true,
 "hideEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeOutEffect"
 },
 "minWidth": 0,
 "mode": "push",
 "verticalAlign": "middle",
 "class": "IconButton",
 "paddingBottom": 0,
 "click": "this.loadFromCurrentMediaPlayList(this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_AlbumPlayList, 1)",
 "propagateClick": false,
 "data": {
  "name": "IconButton4037"
 },
 "shadow": false,
 "paddingTop": 0,
 "visible": false,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "buttonNext": "this.IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4_mobile",
 "id": "viewer_uid732F4E23_6037_FA49_4188_C485ED17DD29PhotoAlbumPlayer",
 "class": "PhotoAlbumPlayer",
 "buttonPrevious": "this.IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC_mobile",
 "viewerArea": "this.viewer_uid732F4E23_6037_FA49_4188_C485ED17DD29"
},
{
 "toolTipShadowSpread": 0,
 "transitionMode": "blending",
 "progressBackgroundColorDirection": "vertical",
 "id": "viewer_uid73104E25_6037_FA49_41CA_82E61F1B1BD5",
 "playbackBarBorderSize": 0,
 "playbackBarBottom": 0,
 "width": "100%",
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowVerticalLength": 0,
 "toolTipShadowHorizontalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 50,
 "playbackBarHeadHeight": 15,
 "toolTipBorderRadius": 3,
 "displayTooltipInTouchScreens": true,
 "progressBackgroundColorRatios": [
  0
 ],
 "toolTipPaddingLeft": 6,
 "vrPointerSelectionTime": 2000,
 "playbackBarLeft": 0,
 "progressBorderColor": "#000000",
 "class": "ViewerArea",
 "firstTransitionDuration": 0,
 "minWidth": 100,
 "playbackBarHeadWidth": 6,
 "toolTipDisplayTime": 600,
 "toolTipFontStyle": "normal",
 "progressBorderSize": 0,
 "playbackBarHeadShadowColor": "#000000",
 "playbackBarHeadShadowVerticalLength": 0,
 "toolTipShadowBlurRadius": 3,
 "height": "100%",
 "propagateClick": false,
 "progressBottom": 2,
 "toolTipBackgroundColor": "#F6F6F6",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "toolTipFontFamily": "Arial",
 "playbackBarBorderRadius": 0,
 "progressOpacity": 1,
 "toolTipBorderSize": 1,
 "toolTipFontWeight": "normal",
 "playbackBarBackgroundColorDirection": "vertical",
 "shadow": false,
 "transitionDuration": 500,
 "toolTipPaddingBottom": 4,
 "toolTipFontSize": "1.11vmin",
 "toolTipPaddingTop": 4,
 "progressHeight": 10,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarRight": 0,
 "borderRadius": 0,
 "progressLeft": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBarBorderColor": "#000000",
 "playbackBarBackgroundOpacity": 1,
 "progressBackgroundOpacity": 1,
 "playbackBarHeadBorderRadius": 0,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadShadowHorizontalLength": 0,
 "progressRight": 0,
 "paddingRight": 0,
 "playbackBarHeadShadow": true,
 "playbackBarOpacity": 1,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarHeadBorderSize": 0,
 "toolTipTextShadowOpacity": 0,
 "toolTipOpacity": 1,
 "playbackBarHeadShadowBlurRadius": 3,
 "progressBorderRadius": 0,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "vrPointerColor": "#FFFFFF",
 "toolTipFontColor": "#606060",
 "progressBarOpacity": 1,
 "vrPointerSelectionColor": "#FF6600",
 "toolTipPaddingRight": 6,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "paddingBottom": 0,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarProgressOpacity": 1,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "toolTipShadowColor": "#333333",
 "toolTipBorderColor": "#767676",
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarProgressBorderSize": 0,
 "toolTipTextShadowBlurRadius": 3,
 "progressBarBorderSize": 0,
 "playbackBarHeadOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "progressBarBorderRadius": 0,
 "data": {
  "name": "ViewerArea4046"
 },
 "toolTipShadowOpacity": 1,
 "paddingTop": 0,
 "playbackBarHeight": 10,
 "progressBarBackgroundColorDirection": "vertical"
},
{
 "borderRadius": 0,
 "scrollBarWidth": 10,
 "id": "htmltext_73113E26_6037_FA4B_41C0_5F6F0E1291CA",
 "backgroundColorRatios": [
  0
 ],
 "width": "100%",
 "paddingRight": 10,
 "paddingLeft": 10,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 0,
 "class": "HTMLText",
 "hideEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeOutEffect"
 },
 "minWidth": 0,
 "paddingBottom": 5,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "data": {
  "name": "HTMLText4049"
 },
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 5,
 "visible": false,
 "showEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeInEffect"
 },
 "html": "",
 "backgroundOpacity": 0.7
},
{
 "borderRadius": 0,
 "id": "component_73100E26_6037_FA4B_41D0_7B7AF048848F",
 "left": 10,
 "showEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeInEffect"
 },
 "paddingRight": 0,
 "iconURL": "skin/album_left.png",
 "horizontalAlign": "center",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 0,
 "top": "45%",
 "transparencyActive": true,
 "hideEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeOutEffect"
 },
 "minWidth": 0,
 "mode": "push",
 "verticalAlign": "middle",
 "class": "IconButton",
 "paddingBottom": 0,
 "click": "this.loadFromCurrentMediaPlayList(this.album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_AlbumPlayList, -1)",
 "propagateClick": false,
 "data": {
  "name": "IconButton4050"
 },
 "shadow": false,
 "paddingTop": 0,
 "visible": false,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "borderRadius": 0,
 "id": "component_73102E26_6037_FA4B_41D2_9BE814E6293F",
 "right": 10,
 "showEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeInEffect"
 },
 "paddingRight": 0,
 "iconURL": "skin/album_right.png",
 "horizontalAlign": "center",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 0,
 "top": "45%",
 "transparencyActive": true,
 "hideEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeOutEffect"
 },
 "minWidth": 0,
 "mode": "push",
 "verticalAlign": "middle",
 "class": "IconButton",
 "paddingBottom": 0,
 "click": "this.loadFromCurrentMediaPlayList(this.album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_AlbumPlayList, 1)",
 "propagateClick": false,
 "data": {
  "name": "IconButton4051"
 },
 "shadow": false,
 "paddingTop": 0,
 "visible": false,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "toolTipShadowSpread": 0,
 "transitionMode": "blending",
 "progressBackgroundColorDirection": "vertical",
 "id": "viewer_uid732F4E23_6037_FA49_4188_C485ED17DD29",
 "playbackBarBorderSize": 0,
 "playbackBarBottom": 0,
 "width": "100%",
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowVerticalLength": 0,
 "toolTipShadowHorizontalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 50,
 "playbackBarHeadHeight": 15,
 "toolTipBorderRadius": 3,
 "displayTooltipInTouchScreens": true,
 "progressBackgroundColorRatios": [
  0
 ],
 "toolTipPaddingLeft": 6,
 "vrPointerSelectionTime": 2000,
 "playbackBarLeft": 0,
 "progressBorderColor": "#000000",
 "class": "ViewerArea",
 "firstTransitionDuration": 0,
 "minWidth": 100,
 "playbackBarHeadWidth": 6,
 "toolTipDisplayTime": 600,
 "toolTipFontStyle": "normal",
 "progressBorderSize": 0,
 "playbackBarHeadShadowColor": "#000000",
 "playbackBarHeadShadowVerticalLength": 0,
 "toolTipShadowBlurRadius": 3,
 "height": "100%",
 "propagateClick": false,
 "progressBottom": 2,
 "toolTipBackgroundColor": "#F6F6F6",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "toolTipFontFamily": "Arial",
 "playbackBarBorderRadius": 0,
 "progressOpacity": 1,
 "toolTipBorderSize": 1,
 "toolTipFontWeight": "normal",
 "playbackBarBackgroundColorDirection": "vertical",
 "shadow": false,
 "transitionDuration": 500,
 "toolTipPaddingBottom": 4,
 "toolTipFontSize": "1.11vmin",
 "toolTipPaddingTop": 4,
 "progressHeight": 10,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarRight": 0,
 "borderRadius": 0,
 "progressLeft": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBarBorderColor": "#000000",
 "playbackBarBackgroundOpacity": 1,
 "progressBackgroundOpacity": 1,
 "playbackBarHeadBorderRadius": 0,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadShadowHorizontalLength": 0,
 "progressRight": 0,
 "paddingRight": 0,
 "playbackBarHeadShadow": true,
 "playbackBarOpacity": 1,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarHeadBorderSize": 0,
 "toolTipTextShadowOpacity": 0,
 "toolTipOpacity": 1,
 "playbackBarHeadShadowBlurRadius": 3,
 "progressBorderRadius": 0,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "vrPointerColor": "#FFFFFF",
 "toolTipFontColor": "#606060",
 "progressBarOpacity": 1,
 "vrPointerSelectionColor": "#FF6600",
 "toolTipPaddingRight": 6,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "paddingBottom": 0,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarProgressOpacity": 1,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "toolTipShadowColor": "#333333",
 "toolTipBorderColor": "#767676",
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarProgressBorderSize": 0,
 "toolTipTextShadowBlurRadius": 3,
 "progressBarBorderSize": 0,
 "playbackBarHeadOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "progressBarBorderRadius": 0,
 "data": {
  "name": "ViewerArea4039"
 },
 "toolTipShadowOpacity": 1,
 "paddingTop": 0,
 "playbackBarHeight": 10,
 "progressBarBackgroundColorDirection": "vertical"
},
{
 "borderRadius": 0,
 "scrollBarWidth": 10,
 "id": "htmltext_732F8E24_6037_FA4F_41BB_A3EBE6F80791",
 "backgroundColorRatios": [
  0
 ],
 "width": "100%",
 "paddingRight": 10,
 "paddingLeft": 10,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 0,
 "class": "HTMLText",
 "hideEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeOutEffect"
 },
 "minWidth": 0,
 "paddingBottom": 5,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "data": {
  "name": "HTMLText4042"
 },
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 5,
 "visible": false,
 "showEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeInEffect"
 },
 "html": "",
 "backgroundOpacity": 0.7
},
{
 "borderRadius": 0,
 "id": "component_732EDE24_6037_FA4F_41AF_318F59D81763",
 "left": 10,
 "showEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeInEffect"
 },
 "paddingRight": 0,
 "iconURL": "skin/album_left.png",
 "horizontalAlign": "center",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 0,
 "top": "45%",
 "transparencyActive": true,
 "hideEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeOutEffect"
 },
 "minWidth": 0,
 "mode": "push",
 "verticalAlign": "middle",
 "class": "IconButton",
 "paddingBottom": 0,
 "click": "this.loadFromCurrentMediaPlayList(this.album_623D971A_5DD7_9F83_417C_6FB0FF992743_AlbumPlayList, -1)",
 "propagateClick": false,
 "data": {
  "name": "IconButton4043"
 },
 "shadow": false,
 "paddingTop": 0,
 "visible": false,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "borderRadius": 0,
 "id": "component_732EEE24_6037_FA4F_41D5_62712980355A",
 "right": 10,
 "showEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeInEffect"
 },
 "paddingRight": 0,
 "iconURL": "skin/album_right.png",
 "horizontalAlign": "center",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 0,
 "top": "45%",
 "transparencyActive": true,
 "hideEffect": {
  "easing": "cubic_in_out",
  "duration": 250,
  "class": "FadeOutEffect"
 },
 "minWidth": 0,
 "mode": "push",
 "verticalAlign": "middle",
 "class": "IconButton",
 "paddingBottom": 0,
 "click": "this.loadFromCurrentMediaPlayList(this.album_623D971A_5DD7_9F83_417C_6FB0FF992743_AlbumPlayList, 1)",
 "propagateClick": false,
 "data": {
  "name": "IconButton4044"
 },
 "shadow": false,
 "paddingTop": 0,
 "visible": false,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "buttonNext": "this.IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4_mobile",
 "id": "viewer_uid732A1E21_6037_FA49_41BE_F35B65F2C711PhotoAlbumPlayer",
 "class": "PhotoAlbumPlayer",
 "buttonPrevious": "this.IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC_mobile",
 "viewerArea": "this.viewer_uid732A1E21_6037_FA49_41BE_F35B65F2C711"
}],
 "scrollBarVisible": "rollOver",
 "propagateClick": false,
 "layout": "absolute",
 "backgroundPreloadEnabled": true,
 "overflow": "hidden",
 "defaultVRPointer": "laser",
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "mobileMipmappingEnabled": false,
 "data": {
  "name": "Player464"
 }
};


	function HistoryData(playList) {
		this.playList = playList;
		this.list = [];
		this.pointer = -1;
	}

	HistoryData.prototype.add = function(index){
		if(this.pointer < this.list.length && this.list[this.pointer] == index) {
			return;
		}
		++this.pointer;
		this.list.splice(this.pointer, this.list.length - this.pointer, index);
	};

	HistoryData.prototype.back = function(){
		if(!this.canBack()) return;
		this.playList.set('selectedIndex', this.list[--this.pointer]);
	};

	HistoryData.prototype.forward = function(){
		if(!this.canForward()) return;
		this.playList.set('selectedIndex', this.list[++this.pointer]);
	};

	HistoryData.prototype.canBack = function(){
		return this.pointer > 0;
	};

	HistoryData.prototype.canForward = function(){
		return this.pointer >= 0 && this.pointer < this.list.length-1;
	};


	if(script.data == undefined)
		script.data = {};
	script.data["history"] = {};   

	TDV.PlayerAPI.defineScript(script);
})();
