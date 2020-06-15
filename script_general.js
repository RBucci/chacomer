(function(){
	var script = {
 "class": "Player",
 "paddingLeft": 0,
 "borderRadius": 0,
 "scrollBarWidth": 10,
 "id": "rootPlayer",
 "vrPolyfillScale": 0.5,
 "width": "100%",
 "scripts": {
  "startPanoramaWithCamera": function(media, camera){  if(window.currentPanoramasWithCameraChanged != undefined && window.currentPanoramasWithCameraChanged.indexOf(media) != -1){ return; } var playLists = this.getByClassName('PlayList'); if(playLists.length == 0) return; var restoreItems = []; for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media && (item.get('class') == 'PanoramaPlayListItem' || item.get('class') == 'Video360PlayListItem')){ restoreItems.push({camera: item.get('camera'), item: item}); item.set('camera', camera); } } } if(restoreItems.length > 0) { if(window.currentPanoramasWithCameraChanged == undefined) { window.currentPanoramasWithCameraChanged = [media]; } else { window.currentPanoramasWithCameraChanged.push(media); } var restoreCameraOnStop = function(){ var index = window.currentPanoramasWithCameraChanged.indexOf(media); if(index != -1) { window.currentPanoramasWithCameraChanged.splice(index, 1); } for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.set('camera', restoreItems[i].camera); restoreItems[i].item.unbind('stop', restoreCameraOnStop, this); } }; for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.bind('stop', restoreCameraOnStop, this); } } },
  "registerKey": function(key, value){  window[key] = value; },
  "loopAlbum": function(playList, index){  var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var loopFunction = function(){ player.play(); }; this.executeFunctionWhenChange(playList, index, loopFunction); },
  "setStartTimeVideo": function(video, time){  var items = this.getPlayListItems(video); var startTimeBackup = []; var restoreStartTimeFunc = function() { for(var i = 0; i<items.length; ++i){ var item = items[i]; item.set('startTime', startTimeBackup[i]); item.unbind('stop', restoreStartTimeFunc, this); } }; for(var i = 0; i<items.length; ++i) { var item = items[i]; var player = item.get('player'); if(player.get('video') == video && player.get('state') == 'playing') { player.seek(time); } else { startTimeBackup.push(item.get('startTime')); item.set('startTime', time); item.bind('stop', restoreStartTimeFunc, this); } } },
  "setPanoramaCameraWithSpot": function(playListItem, yaw, pitch){  var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); var initialPosition = newCamera.get('initialPosition'); initialPosition.set('yaw', yaw); initialPosition.set('pitch', pitch); this.startPanoramaWithCamera(panorama, newCamera); },
  "pauseGlobalAudios": function(caller, exclude){  if (window.pauseGlobalAudiosState == undefined) window.pauseGlobalAudiosState = {}; if (window.pauseGlobalAudiosList == undefined) window.pauseGlobalAudiosList = []; if (caller in window.pauseGlobalAudiosState) { return; } var audios = this.getByClassName('Audio').concat(this.getByClassName('VideoPanoramaOverlay')); if (window.currentGlobalAudios != undefined) audios = audios.concat(Object.values(window.currentGlobalAudios).map(function(v) { return v.audio })); var audiosPaused = []; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = 0; j<objAudios.length; ++j) { var a = objAudios[j]; if(audiosPaused.indexOf(a) == -1) audiosPaused.push(a); } } window.pauseGlobalAudiosState[caller] = audiosPaused; for (var i = 0, count = audios.length; i < count; ++i) { var a = audios[i]; if (a.get('state') == 'playing' && (exclude == undefined || exclude.indexOf(a) == -1)) { a.pause(); audiosPaused.push(a); } } },
  "playAudioList": function(audios){  if(audios.length == 0) return; var currentAudioCount = -1; var currentAudio; var playGlobalAudioFunction = this.playGlobalAudio; var playNext = function(){ if(++currentAudioCount >= audios.length) currentAudioCount = 0; currentAudio = audios[currentAudioCount]; playGlobalAudioFunction(currentAudio, playNext, true); }; playNext(); },
  "historyGoForward": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.forward(); } },
  "unregisterKey": function(key){  delete window[key]; },
  "getActivePlayerWithViewer": function(viewerArea){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); players = players.concat(this.getByClassName('MapPlayer')); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('viewerArea') == viewerArea) { var playerClass = player.get('class'); if(playerClass == 'PanoramaPlayer' && (player.get('panorama') != undefined || player.get('video') != undefined)) return player; else if((playerClass == 'VideoPlayer' || playerClass == 'Video360Player') && player.get('video') != undefined) return player; else if(playerClass == 'PhotoAlbumPlayer' && player.get('photoAlbum') != undefined) return player; else if(playerClass == 'MapPlayer' && player.get('map') != undefined) return player; } } return undefined; },
  "getMediaFromPlayer": function(player){  switch(player.get('class')){ case 'PanoramaPlayer': return player.get('panorama') || player.get('video'); case 'VideoPlayer': case 'Video360Player': return player.get('video'); case 'PhotoAlbumPlayer': return player.get('photoAlbum'); case 'MapPlayer': return player.get('map'); } },
  "stopGlobalAudios": function(onlyForeground){  var audios = window.currentGlobalAudios; var self = this; if(audios){ Object.keys(audios).forEach(function(key){ var data = audios[key]; if(!onlyForeground || (onlyForeground && !data.asBackground)) { self.stopGlobalAudio(data.audio); } }); } },
  "stopAndGoCamera": function(camera, ms){  var sequence = camera.get('initialSequence'); sequence.pause(); var timeoutFunction = function(){ sequence.play(); }; setTimeout(timeoutFunction, ms); },
  "loadFromCurrentMediaPlayList": function(playList, delta){  var currentIndex = playList.get('selectedIndex'); var totalItems = playList.get('items').length; var newIndex = (currentIndex + delta) % totalItems; while(newIndex < 0){ newIndex = totalItems + newIndex; }; if(currentIndex != newIndex){ playList.set('selectedIndex', newIndex); } },
  "_getPlayListsWithViewer": function(viewer){  var playLists = this.getByClassName('PlayList'); var containsViewer = function(playList) { var items = playList.get('items'); for(var j=items.length-1; j>=0; --j) { var item = items[j]; var player = item.get('player'); if(player !== undefined && player.get('viewerArea') == viewer) return true; } return false; }; for(var i=playLists.length-1; i>=0; --i) { if(!containsViewer(playLists[i])) playLists.splice(i, 1); } return playLists; },
  "setStartTimeVideoSync": function(video, player){  this.setStartTimeVideo(video, player.get('currentTime')); },
  "stopGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ var audioData = audios[audio.get('id')]; if(audioData){ audio = audioData.audio; delete audios[audio.get('id')]; if(Object.keys(audios).length == 0){ window.currentGlobalAudios = undefined; } } } if(audio) audio.stop(); },
  "shareSocial": function(socialID, url, deepLink){  if(url == undefined) { url = deepLink ? location.href : location.href.split(location.search||location.hash||/[?#]/)[0]; } else if(deepLink) { url += location.hash; } url = (function(id){ switch(id){ case 'fb': return 'https://www.facebook.com/sharer/sharer.php?u='+url; case 'wa': return 'https://api.whatsapp.com/send/?text='+encodeURIComponent(url); case 'tw': return 'https://twitter.com/intent/tweet?source=webclient&url='+url; default: return undefined; } })(socialID); this.openLink(url, '_blank'); },
  "getMediaWidth": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxW=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('width') > maxW) maxW = r.get('width'); } return maxW; }else{ return r.get('width') } default: return media.get('width'); } },
  "autotriggerAtStart": function(playList, callback, once){  var onChange = function(event){ callback(); if(once == true) playList.unbind('change', onChange, this); }; playList.bind('change', onChange, this); },
  "getCurrentPlayerWithMedia": function(media){  var playerClass = undefined; var mediaPropertyName = undefined; switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'panorama'; break; case 'Video360': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'video'; break; case 'PhotoAlbum': playerClass = 'PhotoAlbumPlayer'; mediaPropertyName = 'photoAlbum'; break; case 'Map': playerClass = 'MapPlayer'; mediaPropertyName = 'map'; break; case 'Video': playerClass = 'VideoPlayer'; mediaPropertyName = 'video'; break; }; if(playerClass != undefined) { var players = this.getByClassName(playerClass); for(var i = 0; i<players.length; ++i){ var player = players[i]; if(player.get(mediaPropertyName) == media) { return player; } } } else { return undefined; } },
  "existsKey": function(key){  return key in window; },
  "syncPlaylists": function(playLists){  var changeToMedia = function(media, playListDispatched){ for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(playList != playListDispatched){ var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ if(items[j].get('media') == media){ if(playList.get('selectedIndex') != j){ playList.set('selectedIndex', j); } break; } } } } }; var changeFunction = function(event){ var playListDispatched = event.source; var selectedIndex = playListDispatched.get('selectedIndex'); if(selectedIndex < 0) return; var media = playListDispatched.get('items')[selectedIndex].get('media'); changeToMedia(media, playListDispatched); }; var mapPlayerChangeFunction = function(event){ var panoramaMapLocation = event.source.get('panoramaMapLocation'); if(panoramaMapLocation){ var map = panoramaMapLocation.get('map'); changeToMedia(map); } }; for(var i = 0, count = playLists.length; i<count; ++i){ playLists[i].bind('change', changeFunction, this); } var mapPlayers = this.getByClassName('MapPlayer'); for(var i = 0, count = mapPlayers.length; i<count; ++i){ mapPlayers[i].bind('panoramaMapLocation_change', mapPlayerChangeFunction, this); } },
  "playGlobalAudioWhilePlay": function(playList, index, audio, endCallback, stopBackgroundAudio){  var changeFunction = function(event){ if(event.data.previousSelectedIndex == index){ this.stopGlobalAudio(audio); if(isPanorama) { var media = playListItem.get('media'); var audios = media.get('audios'); audios.splice(audios.indexOf(audio), 1); media.set('audios', audios); } playList.unbind('change', changeFunction, this); if(endCallback) endCallback(); } }; var audios = window.currentGlobalAudios; if(audios && audio.get('id') in audios){ audio = audios[audio.get('id')].audio; if(audio.get('state') != 'playing'){ audio.play(); } return audio; } playList.bind('change', changeFunction, this); var playListItem = playList.get('items')[index]; var isPanorama = playListItem.get('class') == 'PanoramaPlayListItem'; if(isPanorama) { var media = playListItem.get('media'); var audios = (media.get('audios') || []).slice(); if(audio.get('class') == 'MediaAudio') { var panoramaAudio = this.rootPlayer.createInstance('PanoramaAudio'); panoramaAudio.set('autoplay', false); panoramaAudio.set('audio', audio.get('audio')); panoramaAudio.set('loop', audio.get('loop')); panoramaAudio.set('id', audio.get('id')); var stateChangeFunctions = audio.getBindings('stateChange'); for(var i = 0; i<stateChangeFunctions.length; ++i){ var f = stateChangeFunctions[i]; if(typeof f == 'string') f = new Function('event', f); panoramaAudio.bind('stateChange', f, this); } audio = panoramaAudio; } audios.push(audio); media.set('audios', audios); } var src = this.playGlobalAudio(audio, endCallback); if(stopBackgroundAudio === true){ var stateChangeFunc = function(){ if(src.get('state') == 'playing'){ this.pauseGlobalAudios(src.get('id'), [src]); } else { this.resumeGlobalAudios(src.get('id')); src.unbind('stateChange', stateChangeFunc, this); } }; src.bind('stateChange', stateChangeFunc, this); } return src; },
  "changeBackgroundWhilePlay": function(playList, index, color){  var stopFunction = function(event){ playListItem.unbind('stop', stopFunction, this); if((color == viewerArea.get('backgroundColor')) && (colorRatios == viewerArea.get('backgroundColorRatios'))){ viewerArea.set('backgroundColor', backgroundColorBackup); viewerArea.set('backgroundColorRatios', backgroundColorRatiosBackup); } }; var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var viewerArea = player.get('viewerArea'); var backgroundColorBackup = viewerArea.get('backgroundColor'); var backgroundColorRatiosBackup = viewerArea.get('backgroundColorRatios'); var colorRatios = [0]; if((color != backgroundColorBackup) || (colorRatios != backgroundColorRatiosBackup)){ viewerArea.set('backgroundColor', color); viewerArea.set('backgroundColorRatios', colorRatios); playListItem.bind('stop', stopFunction, this); } },
  "triggerOverlay": function(overlay, eventName){  if(overlay.get('areas') != undefined) { var areas = overlay.get('areas'); for(var i = 0; i<areas.length; ++i) { areas[i].trigger(eventName); } } else { overlay.trigger(eventName); } },
  "getPixels": function(value){  var result = new RegExp('((\\+|\\-)?\\d+(\\.\\d*)?)(px|vw|vh|vmin|vmax)?', 'i').exec(value); if (result == undefined) { return 0; } var num = parseFloat(result[1]); var unit = result[4]; var vw = this.rootPlayer.get('actualWidth') / 100; var vh = this.rootPlayer.get('actualHeight') / 100; switch(unit) { case 'vw': return num * vw; case 'vh': return num * vh; case 'vmin': return num * Math.min(vw, vh); case 'vmax': return num * Math.max(vw, vh); default: return num; } },
  "pauseCurrentPlayers": function(onlyPauseCameraIfPanorama){  var players = this.getCurrentPlayers(); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('state') == 'playing') { if(onlyPauseCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.pauseCamera(); } else { player.pause(); } } else { players.splice(i, 1); } } return players; },
  "init": function(){  if(!Object.hasOwnProperty('values')) { Object.values = function(o){ return Object.keys(o).map(function(e) { return o[e]; }); }; } var history = this.get('data')['history']; var playListChangeFunc = function(e){ var playList = e.source; var index = playList.get('selectedIndex'); if(index < 0) return; var id = playList.get('id'); if(!history.hasOwnProperty(id)) history[id] = new HistoryData(playList); history[id].add(index); }; var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i) { var playList = playLists[i]; playList.bind('change', playListChangeFunc, this); } },
  "getFirstPlayListWithMedia": function(media, onlySelected){  var playLists = this.getPlayListsWithMedia(media, onlySelected); return playLists.length > 0 ? playLists[0] : undefined; },
  "playGlobalAudio": function(audio, endCallback, asBackground){  var endFunction = function(){ audio.unbind('end', endFunction, this); this.stopGlobalAudio(audio); if(endCallback) endCallback(); }; audio = this.getGlobalAudio(audio); var audios = window.currentGlobalAudios; if(!audios){ audios = window.currentGlobalAudios = {}; } audios[audio.get('id')] = {'audio': audio, 'asBackground': asBackground || false}; if(audio.get('state') == 'playing'){ return audio; } if(!audio.get('loop')){ audio.bind('end', endFunction, this); } audio.play(); return audio; },
  "isCardboardViewMode": function(){  var players = this.getByClassName('PanoramaPlayer'); return players.length > 0 && players[0].get('viewMode') == 'cardboard'; },
  "showPopupMedia": function(w, media, playList, popupMaxWidth, popupMaxHeight, autoCloseWhenFinished, stopAudios){  var self = this; var closeFunction = function(){ playList.set('selectedIndex', -1); self.MainViewer.set('toolTipEnabled', true); if(stopAudios) { self.resumeGlobalAudios(); } this.resumePlayers(playersPaused, !stopAudios); if(isVideo) { this.unbind('resize', resizeFunction, this); } w.unbind('close', closeFunction, this); }; var endFunction = function(){ w.hide(); }; var resizeFunction = function(){ var getWinValue = function(property){ return w.get(property) || 0; }; var parentWidth = self.get('actualWidth'); var parentHeight = self.get('actualHeight'); var mediaWidth = self.getMediaWidth(media); var mediaHeight = self.getMediaHeight(media); var popupMaxWidthNumber = parseFloat(popupMaxWidth) / 100; var popupMaxHeightNumber = parseFloat(popupMaxHeight) / 100; var windowWidth = popupMaxWidthNumber * parentWidth; var windowHeight = popupMaxHeightNumber * parentHeight; var footerHeight = getWinValue('footerHeight'); var headerHeight = getWinValue('headerHeight'); if(!headerHeight) { var closeButtonHeight = getWinValue('closeButtonIconHeight') + getWinValue('closeButtonPaddingTop') + getWinValue('closeButtonPaddingBottom'); var titleHeight = self.getPixels(getWinValue('titleFontSize')) + getWinValue('titlePaddingTop') + getWinValue('titlePaddingBottom'); headerHeight = closeButtonHeight > titleHeight ? closeButtonHeight : titleHeight; headerHeight += getWinValue('headerPaddingTop') + getWinValue('headerPaddingBottom'); } var contentWindowWidth = windowWidth - getWinValue('bodyPaddingLeft') - getWinValue('bodyPaddingRight') - getWinValue('paddingLeft') - getWinValue('paddingRight'); var contentWindowHeight = windowHeight - headerHeight - footerHeight - getWinValue('bodyPaddingTop') - getWinValue('bodyPaddingBottom') - getWinValue('paddingTop') - getWinValue('paddingBottom'); var parentAspectRatio = contentWindowWidth / contentWindowHeight; var mediaAspectRatio = mediaWidth / mediaHeight; if(parentAspectRatio > mediaAspectRatio) { windowWidth = contentWindowHeight * mediaAspectRatio + getWinValue('bodyPaddingLeft') + getWinValue('bodyPaddingRight') + getWinValue('paddingLeft') + getWinValue('paddingRight'); } else { windowHeight = contentWindowWidth / mediaAspectRatio + headerHeight + footerHeight + getWinValue('bodyPaddingTop') + getWinValue('bodyPaddingBottom') + getWinValue('paddingTop') + getWinValue('paddingBottom'); } if(windowWidth > parentWidth * popupMaxWidthNumber) { windowWidth = parentWidth * popupMaxWidthNumber; } if(windowHeight > parentHeight * popupMaxHeightNumber) { windowHeight = parentHeight * popupMaxHeightNumber; } w.set('width', windowWidth); w.set('height', windowHeight); w.set('x', (parentWidth - getWinValue('actualWidth')) * 0.5); w.set('y', (parentHeight - getWinValue('actualHeight')) * 0.5); }; if(autoCloseWhenFinished){ this.executeFunctionWhenChange(playList, 0, endFunction); } var mediaClass = media.get('class'); var isVideo = mediaClass == 'Video' || mediaClass == 'Video360'; playList.set('selectedIndex', 0); if(isVideo){ this.bind('resize', resizeFunction, this); resizeFunction(); playList.get('items')[0].get('player').play(); } else { w.set('width', popupMaxWidth); w.set('height', popupMaxHeight); } this.MainViewer.set('toolTipEnabled', false); if(stopAudios) { this.pauseGlobalAudios(); } var playersPaused = this.pauseCurrentPlayers(!stopAudios); w.bind('close', closeFunction, this); w.show(this, true); },
  "setMainMediaByIndex": function(index){  var item = undefined; if(index >= 0 && index < this.mainPlayList.get('items').length){ this.mainPlayList.set('selectedIndex', index); item = this.mainPlayList.get('items')[index]; } return item; },
  "getMediaHeight": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxH=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('height') > maxH) maxH = r.get('height'); } return maxH; }else{ return r.get('height') } default: return media.get('height'); } },
  "changePlayListWithSameSpot": function(playList, newIndex){  var currentIndex = playList.get('selectedIndex'); if (currentIndex >= 0 && newIndex >= 0 && currentIndex != newIndex) { var currentItem = playList.get('items')[currentIndex]; var newItem = playList.get('items')[newIndex]; var currentPlayer = currentItem.get('player'); var newPlayer = newItem.get('player'); if ((currentPlayer.get('class') == 'PanoramaPlayer' || currentPlayer.get('class') == 'Video360Player') && (newPlayer.get('class') == 'PanoramaPlayer' || newPlayer.get('class') == 'Video360Player')) { var newCamera = this.cloneCamera(newItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, currentItem.get('media')); this.startPanoramaWithCamera(newItem.get('media'), newCamera); } } },
  "setCameraSameSpotAsMedia": function(camera, media){  var player = this.getCurrentPlayerWithMedia(media); if(player != undefined) { var position = camera.get('initialPosition'); position.set('yaw', player.get('yaw')); position.set('pitch', player.get('pitch')); position.set('hfov', player.get('hfov')); } },
  "getCurrentPlayers": function(){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); return players; },
  "showComponentsWhileMouseOver": function(parentComponent, components, durationVisibleWhileOut){  var setVisibility = function(visible){ for(var i = 0, length = components.length; i<length; i++){ var component = components[i]; if(component.get('class') == 'HTMLText' && (component.get('html') == '' || component.get('html') == undefined)) { continue; } component.set('visible', visible); } }; if (this.rootPlayer.get('touchDevice') == true){ setVisibility(true); } else { var timeoutID = -1; var rollOverFunction = function(){ setVisibility(true); if(timeoutID >= 0) clearTimeout(timeoutID); parentComponent.unbind('rollOver', rollOverFunction, this); parentComponent.bind('rollOut', rollOutFunction, this); }; var rollOutFunction = function(){ var timeoutFunction = function(){ setVisibility(false); parentComponent.unbind('rollOver', rollOverFunction, this); }; parentComponent.unbind('rollOut', rollOutFunction, this); parentComponent.bind('rollOver', rollOverFunction, this); timeoutID = setTimeout(timeoutFunction, durationVisibleWhileOut); }; parentComponent.bind('rollOver', rollOverFunction, this); } },
  "getPlayListItems": function(media, player){  var itemClass = (function() { switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': return 'PanoramaPlayListItem'; case 'Video360': return 'Video360PlayListItem'; case 'PhotoAlbum': return 'PhotoAlbumPlayListItem'; case 'Map': return 'MapPlayListItem'; case 'Video': return 'VideoPlayListItem'; } })(); if (itemClass != undefined) { var items = this.getByClassName(itemClass); for (var i = items.length-1; i>=0; --i) { var item = items[i]; if(item.get('media') != media || (player != undefined && item.get('player') != player)) { items.splice(i, 1); } } return items; } else { return []; } },
  "getGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios != undefined && audio.get('id') in audios){ audio = audios[audio.get('id')].audio; } return audio; },
  "setComponentVisibility": function(component, visible, applyAt, effect, propertyEffect, ignoreClearTimeout){  var keepVisibility = this.getKey('keepVisibility_' + component.get('id')); if(keepVisibility) return; this.unregisterKey('visibility_'+component.get('id')); var changeVisibility = function(){ if(effect && propertyEffect){ component.set(propertyEffect, effect); } component.set('visible', visible); if(component.get('class') == 'ViewerArea'){ try{ if(visible) component.restart(); else if(component.get('playbackState') == 'playing') component.pause(); } catch(e){}; } }; var effectTimeoutName = 'effectTimeout_'+component.get('id'); if(!ignoreClearTimeout && window.hasOwnProperty(effectTimeoutName)){ var effectTimeout = window[effectTimeoutName]; if(effectTimeout instanceof Array){ for(var i=0; i<effectTimeout.length; i++){ clearTimeout(effectTimeout[i]) } }else{ clearTimeout(effectTimeout); } delete window[effectTimeoutName]; } else if(visible == component.get('visible') && !ignoreClearTimeout) return; if(applyAt && applyAt > 0){ var effectTimeout = setTimeout(function(){ if(window[effectTimeoutName] instanceof Array) { var arrayTimeoutVal = window[effectTimeoutName]; var index = arrayTimeoutVal.indexOf(effectTimeout); arrayTimeoutVal.splice(index, 1); if(arrayTimeoutVal.length == 0){ delete window[effectTimeoutName]; } }else{ delete window[effectTimeoutName]; } changeVisibility(); }, applyAt); if(window.hasOwnProperty(effectTimeoutName)){ window[effectTimeoutName] = [window[effectTimeoutName], effectTimeout]; }else{ window[effectTimeoutName] = effectTimeout; } } else{ changeVisibility(); } },
  "pauseGlobalAudiosWhilePlayItem": function(playList, index, exclude){  var self = this; var item = playList.get('items')[index]; var media = item.get('media'); var player = item.get('player'); var caller = media.get('id'); var endFunc = function(){ if(playList.get('selectedIndex') != index) { if(hasState){ player.unbind('stateChange', stateChangeFunc, self); } self.resumeGlobalAudios(caller); } }; var stateChangeFunc = function(event){ var state = event.data.state; if(state == 'stopped'){ this.resumeGlobalAudios(caller); } else if(state == 'playing'){ this.pauseGlobalAudios(caller, exclude); } }; var mediaClass = media.get('class'); var hasState = mediaClass == 'Video360' || mediaClass == 'Video'; if(hasState){ player.bind('stateChange', stateChangeFunc, this); } this.pauseGlobalAudios(caller, exclude); this.executeFunctionWhenChange(playList, index, endFunc, endFunc); },
  "getOverlays": function(media){  switch(media.get('class')){ case 'Panorama': var overlays = media.get('overlays').concat() || []; var frames = media.get('frames'); for(var j = 0; j<frames.length; ++j){ overlays = overlays.concat(frames[j].get('overlays') || []); } return overlays; case 'Video360': case 'Map': return media.get('overlays') || []; default: return []; } },
  "updateMediaLabelFromPlayList": function(playList, htmlText, playListItemStopToDispose){  var changeFunction = function(){ var index = playList.get('selectedIndex'); if(index >= 0){ var beginFunction = function(){ playListItem.unbind('begin', beginFunction); setMediaLabel(index); }; var setMediaLabel = function(index){ var media = playListItem.get('media'); var text = media.get('data'); if(!text) text = media.get('label'); setHtml(text); }; var setHtml = function(text){ if(text !== undefined) { htmlText.set('html', '<div style=\"text-align:left\"><SPAN STYLE=\"color:#FFFFFF;font-size:12px;font-family:Verdana\"><span color=\"white\" font-family=\"Verdana\" font-size=\"12px\">' + text + '</SPAN></div>'); } else { htmlText.set('html', ''); } }; var playListItem = playList.get('items')[index]; if(htmlText.get('html')){ setHtml('Loading...'); playListItem.bind('begin', beginFunction); } else{ setMediaLabel(index); } } }; var disposeFunction = function(){ htmlText.set('html', undefined); playList.unbind('change', changeFunction, this); playListItemStopToDispose.unbind('stop', disposeFunction, this); }; if(playListItemStopToDispose){ playListItemStopToDispose.bind('stop', disposeFunction, this); } playList.bind('change', changeFunction, this); changeFunction(); },
  "initGA": function(){  var sendFunc = function(category, event, label) { ga('send', 'event', category, event, label); }; var media = this.getByClassName('Panorama'); media = media.concat(this.getByClassName('Video360')); media = media.concat(this.getByClassName('Map')); for(var i = 0, countI = media.length; i<countI; ++i){ var m = media[i]; var mediaLabel = m.get('label'); var overlays = this.getOverlays(m); for(var j = 0, countJ = overlays.length; j<countJ; ++j){ var overlay = overlays[j]; var overlayLabel = overlay.get('data') != undefined ? mediaLabel + ' - ' + overlay.get('data')['label'] : mediaLabel; switch(overlay.get('class')) { case 'HotspotPanoramaOverlay': case 'HotspotMapOverlay': var areas = overlay.get('areas'); for (var z = 0; z<areas.length; ++z) { areas[z].bind('click', sendFunc.bind(this, 'Hotspot', 'click', overlayLabel), this); } break; case 'CeilingCapPanoramaOverlay': case 'TripodCapPanoramaOverlay': overlay.bind('click', sendFunc.bind(this, 'Cap', 'click', overlayLabel), this); break; } } } var components = this.getByClassName('Button'); components = components.concat(this.getByClassName('IconButton')); for(var i = 0, countI = components.length; i<countI; ++i){ var c = components[i]; var componentLabel = c.get('data')['name']; c.bind('click', sendFunc.bind(this, 'Skin', 'click', componentLabel), this); } var items = this.getByClassName('PlayListItem'); var media2Item = {}; for(var i = 0, countI = items.length; i<countI; ++i) { var item = items[i]; var media = item.get('media'); if(!(media.get('id') in media2Item)) { item.bind('begin', sendFunc.bind(this, 'Media', 'play', media.get('label')), this); media2Item[media.get('id')] = item; } } },
  "registerTextVariable": function(obj){  var property = (function() { switch (obj.get('class')) { case 'Label': return 'text'; case 'Button': case 'BaseButton': return 'label'; case 'HTMLText': return 'html'; } })(); if (property == undefined) return; var re = new RegExp('\\{\\{\\s*(\\w+)\\s*\\}\\}', 'g'); var text = obj.get(property); var data = obj.get('data') || {}; data[property] = text; obj.set('data', data); var updateLabel = function(vars) { var text = data[property]; for (var i = 0; i < vars.length; ++i) { var info = vars[i]; var dispatchers = info.dispatchers; for (var j = 0; j < dispatchers.length; ++j) { var dispatcher = dispatchers[j]; var index = dispatcher.get('selectedIndex'); if (index >= 0) { var srcPropArray = info.src.split('.'); var src = dispatcher.get('items')[index]; if(src == undefined || (info.itemCondition !== undefined && !info.itemCondition.call(this, src))) continue; for (var z = 0; z < srcPropArray.length; ++z) src = 'get' in src ? src.get(srcPropArray[z]) : src[srcPropArray[z]]; text = text.replace(info.replace, src); } } } if(text != data[property]) obj.set(property, text); }; var vars = []; var addVars = function(dispatchers, eventName, src, replace, itemCondition) { vars.push({ 'dispatchers': dispatchers, 'eventName': eventName, 'src': src, 'replace': replace, 'itemCondition': itemCondition }); }; var viewerAreaItemCondition = function(item) { var player = item.get('player'); return player !== undefined && player.get('viewerArea') == this.MainViewer; }; while (null != (result = re.exec(text))) { switch (result[1]) { case 'title': var playLists = this._getPlayListsWithViewer(this.MainViewer); addVars(playLists, 'change', 'media.label', result[0], viewerAreaItemCondition); break; case 'subtitle': var playLists = this._getPlayListsWithViewer(this.MainViewer); addVars(playLists, 'change', 'media.data.subtitle', result[0], viewerAreaItemCondition); break; } } if (vars.length > 0) { var func = updateLabel.bind(this, vars); for (var i = 0; i < vars.length; ++i) { var info = vars[i]; var dispatchers = info.dispatchers; for (var j = 0; j < dispatchers.length; ++j) dispatchers[j].bind(info.eventName, func, this); } } },
  "cloneCamera": function(camera){  var newCamera = this.rootPlayer.createInstance(camera.get('class')); newCamera.set('id', camera.get('id') + '_copy'); newCamera.set('idleSequence', camera.get('initialSequence')); return newCamera; },
  "showPopupPanoramaOverlay": function(popupPanoramaOverlay, closeButtonProperties, imageHD, toggleImage, toggleImageHD, autoCloseMilliSeconds, audio, stopBackgroundAudio){  var self = this; this.MainViewer.set('toolTipEnabled', false); var cardboardEnabled = this.isCardboardViewMode(); if(!cardboardEnabled) { var zoomImage = this.zoomImagePopupPanorama; var showDuration = popupPanoramaOverlay.get('showDuration'); var hideDuration = popupPanoramaOverlay.get('hideDuration'); var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); var popupMaxWidthBackup = popupPanoramaOverlay.get('popupMaxWidth'); var popupMaxHeightBackup = popupPanoramaOverlay.get('popupMaxHeight'); var showEndFunction = function() { var loadedFunction = function(){ if(!self.isCardboardViewMode()) popupPanoramaOverlay.set('visible', false); }; popupPanoramaOverlay.unbind('showEnd', showEndFunction, self); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', 1); self.showPopupImage(imageHD, toggleImageHD, popupPanoramaOverlay.get('popupMaxWidth'), popupPanoramaOverlay.get('popupMaxHeight'), null, null, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedFunction, hideFunction); }; var hideFunction = function() { var restoreShowDurationFunction = function(){ popupPanoramaOverlay.unbind('showEnd', restoreShowDurationFunction, self); popupPanoramaOverlay.set('visible', false); popupPanoramaOverlay.set('showDuration', showDuration); popupPanoramaOverlay.set('popupMaxWidth', popupMaxWidthBackup); popupPanoramaOverlay.set('popupMaxHeight', popupMaxHeightBackup); }; self.resumePlayers(playersPaused, audio == null || !stopBackgroundAudio); var currentWidth = zoomImage.get('imageWidth'); var currentHeight = zoomImage.get('imageHeight'); popupPanoramaOverlay.bind('showEnd', restoreShowDurationFunction, self, true); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', hideDuration); popupPanoramaOverlay.set('popupMaxWidth', currentWidth); popupPanoramaOverlay.set('popupMaxHeight', currentHeight); if(popupPanoramaOverlay.get('visible')) restoreShowDurationFunction(); else popupPanoramaOverlay.set('visible', true); self.MainViewer.set('toolTipEnabled', true); }; if(!imageHD){ imageHD = popupPanoramaOverlay.get('image'); } if(!toggleImageHD && toggleImage){ toggleImageHD = toggleImage; } popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); } else { var hideEndFunction = function() { self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } popupPanoramaOverlay.unbind('hideEnd', hideEndFunction, self); self.MainViewer.set('toolTipEnabled', true); }; var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } popupPanoramaOverlay.bind('hideEnd', hideEndFunction, this, true); } popupPanoramaOverlay.set('visible', true); },
  "resumePlayers": function(players, onlyResumeCameraIfPanorama){  for(var i = 0; i<players.length; ++i){ var player = players[i]; if(onlyResumeCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.resumeCamera(); } else{ player.play(); } } },
  "setMediaBehaviour": function(playList, index, mediaDispatcher){  var self = this; var stateChangeFunction = function(event){ if(event.data.state == 'stopped'){ dispose.call(this, true); } }; var onBeginFunction = function() { item.unbind('begin', onBeginFunction, self); var media = item.get('media'); if(media.get('class') != 'Panorama' || (media.get('camera') != undefined && media.get('camera').get('initialSequence') != undefined)){ player.bind('stateChange', stateChangeFunction, self); } }; var changeFunction = function(){ var index = playListDispatcher.get('selectedIndex'); if(index != -1){ indexDispatcher = index; dispose.call(this, false); } }; var disposeCallback = function(){ dispose.call(this, false); }; var dispose = function(forceDispose){ if(!playListDispatcher) return; var media = item.get('media'); if((media.get('class') == 'Video360' || media.get('class') == 'Video') && media.get('loop') == true && !forceDispose) return; playList.set('selectedIndex', -1); if(panoramaSequence && panoramaSequenceIndex != -1){ if(panoramaSequence) { if(panoramaSequenceIndex > 0 && panoramaSequence.get('movements')[panoramaSequenceIndex-1].get('class') == 'TargetPanoramaCameraMovement'){ var initialPosition = camera.get('initialPosition'); var oldYaw = initialPosition.get('yaw'); var oldPitch = initialPosition.get('pitch'); var oldHfov = initialPosition.get('hfov'); var previousMovement = panoramaSequence.get('movements')[panoramaSequenceIndex-1]; initialPosition.set('yaw', previousMovement.get('targetYaw')); initialPosition.set('pitch', previousMovement.get('targetPitch')); initialPosition.set('hfov', previousMovement.get('targetHfov')); var restoreInitialPositionFunction = function(event){ initialPosition.set('yaw', oldYaw); initialPosition.set('pitch', oldPitch); initialPosition.set('hfov', oldHfov); itemDispatcher.unbind('end', restoreInitialPositionFunction, this); }; itemDispatcher.bind('end', restoreInitialPositionFunction, this); } panoramaSequence.set('movementIndex', panoramaSequenceIndex); } } if(player){ item.unbind('begin', onBeginFunction, this); player.unbind('stateChange', stateChangeFunction, this); for(var i = 0; i<buttons.length; ++i) { buttons[i].unbind('click', disposeCallback, this); } } if(sameViewerArea){ var currentMedia = this.getMediaFromPlayer(player); if(currentMedia == undefined || currentMedia == item.get('media')){ playListDispatcher.set('selectedIndex', indexDispatcher); } if(playList != playListDispatcher) playListDispatcher.unbind('change', changeFunction, this); } else{ viewerArea.set('visible', viewerVisibility); } playListDispatcher = undefined; }; if(!mediaDispatcher){ var currentIndex = playList.get('selectedIndex'); var currentPlayer = (currentIndex != -1) ? playList.get('items')[playList.get('selectedIndex')].get('player') : this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer) { mediaDispatcher = this.getMediaFromPlayer(currentPlayer); } } var playListDispatcher = undefined; if(mediaDispatcher){ var playListsWithMedia = this.getPlayListsWithMedia(mediaDispatcher, true); playListDispatcher = playListsWithMedia.indexOf(playList) != -1 ? playList : (playListsWithMedia.length > 0 ? playListsWithMedia[0] : undefined); } if(!playListDispatcher){ playList.set('selectedIndex', index); return; } var indexDispatcher = playListDispatcher.get('selectedIndex'); if(playList.get('selectedIndex') == index || indexDispatcher == -1){ return; } var item = playList.get('items')[index]; var itemDispatcher = playListDispatcher.get('items')[indexDispatcher]; var player = item.get('player'); var viewerArea = player.get('viewerArea'); var viewerVisibility = viewerArea.get('visible'); var sameViewerArea = viewerArea == itemDispatcher.get('player').get('viewerArea'); if(sameViewerArea){ if(playList != playListDispatcher){ playListDispatcher.set('selectedIndex', -1); playListDispatcher.bind('change', changeFunction, this); } } else{ viewerArea.set('visible', true); } var panoramaSequenceIndex = -1; var panoramaSequence = undefined; var camera = itemDispatcher.get('camera'); if(camera){ panoramaSequence = camera.get('initialSequence'); if(panoramaSequence) { panoramaSequenceIndex = panoramaSequence.get('movementIndex'); } } playList.set('selectedIndex', index); var buttons = []; var addButtons = function(property){ var value = player.get(property); if(value == undefined) return; if(Array.isArray(value)) buttons = buttons.concat(value); else buttons.push(value); }; addButtons('buttonStop'); for(var i = 0; i<buttons.length; ++i) { buttons[i].bind('click', disposeCallback, this); } item.bind('begin', onBeginFunction, self); this.executeFunctionWhenChange(playList, index, disposeCallback);  },
  "setMainMediaByName": function(name){  var items = this.mainPlayList.get('items'); for(var i = 0; i<items.length; ++i){ var item = items[i]; if(item.get('media').get('label') == name) { this.mainPlayList.set('selectedIndex', i); return item; } } },
  "visibleComponentsIfPlayerFlagEnabled": function(components, playerFlag){  var enabled = this.get(playerFlag); for(var i in components){ components[i].set('visible', enabled); } },
  "getPlayListItemByMedia": function(playList, media){  var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media) return item; } return undefined; },
  "pauseGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ var audioData = audios[audio.get('id')]; if(audioData) audio = audioData.audio; } if(audio.get('state') == 'playing') audio.pause(); },
  "getPlayListsWithMedia": function(media, onlySelected){  var result = []; var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(onlySelected && playList.get('selectedIndex') == -1) continue; if(this.getPlayListItemByMedia(playList, media) != undefined) result.push(playList); } return result; },
  "keepCompVisible": function(component, keep){  var key = 'keepVisibility_' + component.get('id'); var value = this.getKey(key); if(value == undefined && keep) { this.registerKey(key, keep); } else if(value != undefined && !keep) { this.unregisterKey(key); } },
  "historyGoBack": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.back(); } },
  "showPopupPanoramaVideoOverlay": function(popupPanoramaOverlay, closeButtonProperties, stopAudios){  var self = this; var showEndFunction = function() { popupPanoramaOverlay.unbind('showEnd', showEndFunction); closeButton.bind('click', hideFunction, this); setCloseButtonPosition(); closeButton.set('visible', true); }; var endFunction = function() { if(!popupPanoramaOverlay.get('loop')) hideFunction(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); popupPanoramaOverlay.set('visible', false); closeButton.set('visible', false); closeButton.unbind('click', hideFunction, self); popupPanoramaOverlay.unbind('end', endFunction, self); popupPanoramaOverlay.unbind('hideEnd', hideFunction, self, true); self.resumePlayers(playersPaused, true); if(stopAudios) { self.resumeGlobalAudios(); } }; var setCloseButtonPosition = function() { var right = 10; var top = 10; closeButton.set('right', right); closeButton.set('top', top); }; this.MainViewer.set('toolTipEnabled', false); var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(true); if(stopAudios) { this.pauseGlobalAudios(); } popupPanoramaOverlay.bind('end', endFunction, this, true); popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); popupPanoramaOverlay.bind('hideEnd', hideFunction, this, true); popupPanoramaOverlay.set('visible', true); },
  "getPanoramaOverlayByName": function(panorama, name){  var overlays = this.getOverlays(panorama); for(var i = 0, count = overlays.length; i<count; ++i){ var overlay = overlays[i]; var data = overlay.get('data'); if(data != undefined && data.label == name){ return overlay; } } return undefined; },
  "getKey": function(key){  return window[key]; },
  "updateVideoCues": function(playList, index){  var playListItem = playList.get('items')[index]; var video = playListItem.get('media'); if(video.get('cues').length == 0) return; var player = playListItem.get('player'); var cues = []; var changeFunction = function(){ if(playList.get('selectedIndex') != index){ video.unbind('cueChange', cueChangeFunction, this); playList.unbind('change', changeFunction, this); } }; var cueChangeFunction = function(event){ var activeCues = event.data.activeCues; for(var i = 0, count = cues.length; i<count; ++i){ var cue = cues[i]; if(activeCues.indexOf(cue) == -1 && (cue.get('startTime') > player.get('currentTime') || cue.get('endTime') < player.get('currentTime')+0.5)){ cue.trigger('end'); } } cues = activeCues; }; video.bind('cueChange', cueChangeFunction, this); playList.bind('change', changeFunction, this); },
  "showPopupImage": function(image, toggleImage, customWidth, customHeight, showEffect, hideEffect, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedCallback, hideCallback){  var self = this; var closed = false; var playerClickFunction = function() { zoomImage.unbind('loaded', loadedFunction, self); hideFunction(); }; var clearAutoClose = function(){ zoomImage.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var resizeFunction = function(){ setTimeout(setCloseButtonPosition, 0); }; var loadedFunction = function(){ self.unbind('click', playerClickFunction, self); veil.set('visible', true); setCloseButtonPosition(); closeButton.set('visible', true); zoomImage.unbind('loaded', loadedFunction, this); zoomImage.bind('userInteractionStart', userInteractionStartFunction, this); zoomImage.bind('userInteractionEnd', userInteractionEndFunction, this); zoomImage.bind('resize', resizeFunction, this); timeoutID = setTimeout(timeoutFunction, 200); }; var timeoutFunction = function(){ timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ hideFunction(); }; zoomImage.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } zoomImage.bind('backgroundClick', hideFunction, this); if(toggleImage) { zoomImage.bind('click', toggleFunction, this); zoomImage.set('imageCursor', 'hand'); } closeButton.bind('click', hideFunction, this); if(loadedCallback) loadedCallback(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); closed = true; if(timeoutID) clearTimeout(timeoutID); if (timeoutUserInteractionID) clearTimeout(timeoutUserInteractionID); if(autoCloseMilliSeconds) clearAutoClose(); if(hideCallback) hideCallback(); zoomImage.set('visible', false); if(hideEffect && hideEffect.get('duration') > 0){ hideEffect.bind('end', endEffectFunction, this); } else{ zoomImage.set('image', null); } closeButton.set('visible', false); veil.set('visible', false); self.unbind('click', playerClickFunction, self); zoomImage.unbind('backgroundClick', hideFunction, this); zoomImage.unbind('userInteractionStart', userInteractionStartFunction, this); zoomImage.unbind('userInteractionEnd', userInteractionEndFunction, this, true); zoomImage.unbind('resize', resizeFunction, this); if(toggleImage) { zoomImage.unbind('click', toggleFunction, this); zoomImage.set('cursor', 'default'); } closeButton.unbind('click', hideFunction, this); self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } }; var endEffectFunction = function() { zoomImage.set('image', null); hideEffect.unbind('end', endEffectFunction, this); }; var toggleFunction = function() { zoomImage.set('image', isToggleVisible() ? image : toggleImage); }; var isToggleVisible = function() { return zoomImage.get('image') == toggleImage; }; var setCloseButtonPosition = function() { var right = zoomImage.get('actualWidth') - zoomImage.get('imageLeft') - zoomImage.get('imageWidth') + 10; var top = zoomImage.get('imageTop') + 10; if(right < 10) right = 10; if(top < 10) top = 10; closeButton.set('right', right); closeButton.set('top', top); }; var userInteractionStartFunction = function() { if(timeoutUserInteractionID){ clearTimeout(timeoutUserInteractionID); timeoutUserInteractionID = undefined; } else{ closeButton.set('visible', false); } }; var userInteractionEndFunction = function() { if(!closed){ timeoutUserInteractionID = setTimeout(userInteractionTimeoutFunction, 300); } }; var userInteractionTimeoutFunction = function() { timeoutUserInteractionID = undefined; closeButton.set('visible', true); setCloseButtonPosition(); }; this.MainViewer.set('toolTipEnabled', false); var veil = this.veilPopupPanorama; var zoomImage = this.zoomImagePopupPanorama; var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } var timeoutID = undefined; var timeoutUserInteractionID = undefined; zoomImage.bind('loaded', loadedFunction, this); setTimeout(function(){ self.bind('click', playerClickFunction, self, false); }, 0); zoomImage.set('image', image); zoomImage.set('customWidth', customWidth); zoomImage.set('customHeight', customHeight); zoomImage.set('showEffect', showEffect); zoomImage.set('hideEffect', hideEffect); zoomImage.set('visible', true); return zoomImage; },
  "executeFunctionWhenChange": function(playList, index, endFunction, changeFunction){  var endObject = undefined; var changePlayListFunction = function(event){ if(event.data.previousSelectedIndex == index){ if(changeFunction) changeFunction.call(this); if(endFunction && endObject) endObject.unbind('end', endFunction, this); playList.unbind('change', changePlayListFunction, this); } }; if(endFunction){ var playListItem = playList.get('items')[index]; if(playListItem.get('class') == 'PanoramaPlayListItem'){ var camera = playListItem.get('camera'); if(camera != undefined) endObject = camera.get('initialSequence'); if(endObject == undefined) endObject = camera.get('idleSequence'); } else{ endObject = playListItem.get('media'); } if(endObject){ endObject.bind('end', endFunction, this); } } playList.bind('change', changePlayListFunction, this); },
  "setEndToItemIndex": function(playList, fromIndex, toIndex){  var endFunction = function(){ if(playList.get('selectedIndex') == fromIndex) playList.set('selectedIndex', toIndex); }; this.executeFunctionWhenChange(playList, fromIndex, endFunction); },
  "showWindow": function(w, autoCloseMilliSeconds, containsAudio){  if(w.get('visible') == true){ return; } var closeFunction = function(){ clearAutoClose(); this.resumePlayers(playersPaused, !containsAudio); w.unbind('close', closeFunction, this); }; var clearAutoClose = function(){ w.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ w.hide(); }; w.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } var playersPaused = this.pauseCurrentPlayers(!containsAudio); w.bind('close', closeFunction, this); w.show(this, true); },
  "_initItemWithComps": function(playList, index, components, eventName, visible, effectToApply, delay, restoreStateAt){  var item = playList.get('items')[index]; var registerVisibility = restoreStateAt > 0; var rootPlayer = this.rootPlayer; var cloneEffect = function(visible) { var klass = effectToApply ? effectToApply.get('class') : undefined; var effect = undefined; switch(klass) { case 'FadeInEffect': case 'FadeOutEffect': effect = rootPlayer.createInstance(visible ? 'FadeInEffect' : 'FadeOutEffect'); break; case 'SlideInEffect': case 'SlideOutEffect': effect = rootPlayer.createInstance(visible ? 'SlideInEffect' : 'SlideOutEffect'); break; } if(effect){ effect.set('duration', effectToApply.get('duration')); effect.set('easing', effectToApply.get('easing')); if(klass.indexOf('Slide') != -1) effect.set(visible ? 'from' : 'to', effectToApply.get(visible ? 'from' : 'to')); } return effect; }; var endFunc = function() { for(var i = 0, count = components.length; i<count; ++i) { var component = components[i]; if(restoreStateAt > 0){ this.setComponentVisibility(component, !visible, 0, cloneEffect(!visible)); } else { var key = 'visibility_' + component.get('id'); if(this.existsKey(key)) { if(this.getKey(key)) this.setComponentVisibility(component, true, 0, cloneEffect(true)); else this.setComponentVisibility(component, false, 0, cloneEffect(false)); this.unregisterKey(key); } } } item.unbind('end', endFunc, this); if(addMediaEndEvent) media.unbind('end', endFunc, this); }; var stopFunc = function() { item.unbind('stop', stopFunc, this, true); item.unbind('stop', stopFunc, this); item.unbind('begin', stopFunc, this, true); item.unbind('begin', stopFunc, this); for(var i = 0, count = components.length; i<count; ++i) { this.keepCompVisible(components[i], false); } }; var addEvent = function(eventName, delay, restoreStateAt){ var changeFunc = function(){ var changeVisibility = function(component, visible, effect) { rootPlayer.setComponentVisibility(component, visible, delay, effect, visible ? 'showEffect' : 'hideEffect', false); if(restoreStateAt > 0){ var time = delay + restoreStateAt + (effect != undefined ? effect.get('duration') : 0); rootPlayer.setComponentVisibility(component, !visible, time, cloneEffect(!visible), visible ? 'hideEffect' : 'showEffect', true); } }; for(var i = 0, count = components.length; i<count; ++i){ var component = components[i]; if(visible == 'toggle'){ if(!component.get('visible')) changeVisibility(component, true, cloneEffect(true)); else changeVisibility(component, false, cloneEffect(false)); } else { changeVisibility(component, visible, cloneEffect(visible)); } } item.unbind(eventName, changeFunc, this); }; item.bind(eventName, changeFunc, this) }; if(eventName == 'begin'){ for(var i = 0, count = components.length; i<count; ++i){ var component = components[i]; this.keepCompVisible(component, true); if(registerVisibility) { var key = 'visibility_' + component.get('id'); this.registerKey(key, component.get('visible')); } } item.bind('stop', stopFunc, this, true); item.bind('stop', stopFunc, this); item.bind('begin', stopFunc, this, true); item.bind('begin', stopFunc, this); if(registerVisibility){ item.bind('end', endFunc, this); var media = item.get('media'); var addMediaEndEvent = media.get('loop') != undefined && !(media.get('loop')); if(addMediaEndEvent) media.bind('end', endFunc, this); } } else if(eventName == 'end' && restoreStateAt > 0){ addEvent('begin', restoreStateAt, 0); restoreStateAt = 0; } if(eventName != undefined) addEvent(eventName, delay, restoreStateAt); },
  "resumeGlobalAudios": function(caller){  if (window.pauseGlobalAudiosState == undefined || !(caller in window.pauseGlobalAudiosState)) return; var audiosPaused = window.pauseGlobalAudiosState[caller]; delete window.pauseGlobalAudiosState[caller]; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = audiosPaused.length-1; j>=0; --j) { var a = audiosPaused[j]; if(objAudios.indexOf(a) != -1) audiosPaused.splice(j, 1); } } for (var i = 0, count = audiosPaused.length; i<count; ++i) { var a = audiosPaused[i]; if (a.get('state') == 'paused') a.play(); } },
  "fixTogglePlayPauseButton": function(player){  var state = player.get('state'); var buttons = player.get('buttonPlayPause'); if(typeof buttons !== 'undefined' && player.get('state') == 'playing'){ if(!Array.isArray(buttons)) buttons = [buttons]; for(var i = 0; i<buttons.length; ++i) buttons[i].set('pressed', true); } },
  "getMediaByName": function(name){  var list = this.getByClassName('Media'); for(var i = 0, count = list.length; i<count; ++i){ var media = list[i]; if((media.get('class') == 'Audio' && media.get('data').label == name) || media.get('label') == name){ return media; } } return undefined; },
  "getComponentByName": function(name){  var list = this.getByClassName('UIComponent'); for(var i = 0, count = list.length; i<count; ++i){ var component = list[i]; var data = component.get('data'); if(data != undefined && data.name == name){ return component; } } return undefined; },
  "setMapLocation": function(panoramaPlayListItem, mapPlayer){  var resetFunction = function(){ panoramaPlayListItem.unbind('stop', resetFunction, this); player.set('mapPlayer', null); }; panoramaPlayListItem.bind('stop', resetFunction, this); var player = panoramaPlayListItem.get('player'); player.set('mapPlayer', mapPlayer); },
  "setOverlayBehaviour": function(overlay, media, action, preventDoubleClick){  var executeFunc = function() { switch(action){ case 'triggerClick': this.triggerOverlay(overlay, 'click'); break; case 'stop': case 'play': case 'pause': overlay[action](); break; case 'togglePlayPause': case 'togglePlayStop': if(overlay.get('state') == 'playing') overlay[action == 'togglePlayPause' ? 'pause' : 'stop'](); else overlay.play(); break; } if(preventDoubleClick){ if(window.overlaysDispatched == undefined) window.overlaysDispatched = {}; var id = overlay.get('id'); window.overlaysDispatched[id] = true; setTimeout(function(){ delete window.overlaysDispatched[id]; }, 1000); } }; if(preventDoubleClick && window.overlaysDispatched != undefined && overlay.get('id') in window.overlaysDispatched) return; var playList = this.getFirstPlayListWithMedia(media, true); if(playList != undefined){ var item = this.getPlayListItemByMedia(playList, media); if(playList.get('items').indexOf(item) != playList.get('selectedIndex')){ var beginFunc = function(e){ item.unbind('begin', beginFunc, this); executeFunc.call(this); }; item.bind('begin', beginFunc, this); return; } } executeFunc.call(this); },
  "setPanoramaCameraWithCurrentSpot": function(playListItem){  var currentPlayer = this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer == undefined){ return; } var playerClass = currentPlayer.get('class'); if(playerClass != 'PanoramaPlayer' && playerClass != 'Video360Player'){ return; } var fromMedia = currentPlayer.get('panorama'); if(fromMedia == undefined) { fromMedia = currentPlayer.get('video'); } var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, fromMedia); this.startPanoramaWithCamera(panorama, newCamera); },
  "openLink": function(url, name){  if(url == location.href) { return; } var isElectron = (window && window.process && window.process.versions && window.process.versions['electron']) || (navigator && navigator.userAgent && navigator.userAgent.indexOf('Electron') >= 0); if (name == '_blank' && isElectron) { if (url.startsWith('/')) { var r = window.location.href.split('/'); r.pop(); url = r.join('/') + url; } var extension = url.split('.').pop().toLowerCase(); if(extension != 'pdf' || url.startsWith('file://')) { var shell = window.require('electron').shell; shell.openExternal(url); } else { window.open(url, name); } } else if(isElectron && (name == '_top' || name == '_self')) { window.location = url; } else { var newWindow = window.open(url, name); newWindow.focus(); } }
 },
 "left": 577.55,
 "gap": 10,
 "mouseWheelEnabled": true,
 "children": [
  "this.MainViewer",
  "this.HTMLText_6BDD8039_64A6_31E4_41D7_D3C38C6C69F2",
  "this.HTMLText_524CEEAF_7E31_E3D9_41D5_A18634B5A288",
  "this.Container_2E6121EE_347D_0EFC_41AD_FCF661FCEEBC",
  "this.Container_685CC558_649E_53A4_41C3_031C34B7328A",
  "this.Container_7DE2D59A_6911_E2E0_41A7_D15D0A935C33",
  "this.Container_7A542551_6EFF_A77C_41BD_77B516563B0F",
  "this.Container_3A863D9B_3513_E8A1_41BD_38320457DF78",
  "this.Container_48EE9E0B_5FEC_9B17_41D6_DE3A0A569909",
  "this.Container_B86F2C57_B592_DE0C_41D1_EEF22B2EF88F",
  "this.Container_BA602572_B591_6E04_41E5_3B3D95AF66C0",
  "this.Container_A4369CCB_B591_DE04_41D4_C21B82E1EAFF",
  "this.veilPopupPanorama",
  "this.zoomImagePopupPanorama",
  "this.closeButtonPopupPanorama"
 ],
 "buttonToggleFullscreen": "this.IconButton_2E6081ED_347D_0EFF_41AA_ECC3AD42DC4D",
 "creationPolicy": "inAdvance",
 "minHeight": 20,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "desktopMipmappingEnabled": false,
 "paddingRight": 0,
 "horizontalAlign": "left",
 "buttonToggleMute": "this.IconButton_2E60A1ED_347D_0EFF_41BC_A36ED8CE8127",
 "contentOpaque": false,
 "start": "this.playAudioList([this.audio_41D5ADEE_5F68_3FA0_41BA_A36CE8A90C09]); this.init(); this.visibleComponentsIfPlayerFlagEnabled([this.IconButton_2E60B1ED_347D_0EFF_41C3_3E7369236DCE], 'gyroscopeAvailable'); this.syncPlaylists([this.mainPlayList,this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist]); if(!this.get('fullscreenAvailable')) { [this.IconButton_2E6081ED_347D_0EFF_41AA_ECC3AD42DC4D].forEach(function(component) { component.set('visible', false); }) }",
 "verticalAlign": "top",
 "downloadEnabled": false,
 "minWidth": 20,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "definitions": [{
 "thumbnailUrl": "media/album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_1_t.jpg",
 "class": "Photo",
 "duration": 5000,
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
 "height": 338
},
{
 "class": "Container",
 "paddingLeft": 0,
 "borderRadius": 0,
 "children": [
  "this.Container_7A547551_6EFF_A77C_41C6_43235B32276F",
  "this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358"
 ],
 "scrollBarWidth": 10,
 "id": "Container_7A549551_6EFF_A77C_41D5_C1ADFF60CE66",
 "left": "24%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "shadowColor": "#000000",
 "right": "24%",
 "scrollBarColor": "#000000",
 "shadowHorizontalLength": 0,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "gap": 10,
 "shadowVerticalLength": 0,
 "shadowOpacity": 0.3,
 "paddingRight": 0,
 "top": "18%",
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": "18%",
 "verticalAlign": "top",
 "shadowBlurRadius": 25,
 "paddingBottom": 0,
 "horizontalAlign": "center",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "shadow": true,
 "shadowSpread": 1,
 "overflow": "visible",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "Global"
 },
 "layout": "absolute",
 "backgroundOpacity": 1
},
{
 "class": "PlayList",
 "change": "this.showComponentsWhileMouseOver(this.container_A3C1D1AC_B693_A61C_41DF_E616C4D89784, [this.htmltext_A3C121AC_B693_A61C_41E6_25BBA312DE9A,this.component_A3C6C1AD_B693_A61C_41DB_D753C2AB213A,this.component_A3C6D1AD_B693_A61C_41D4_D82DBA57888D], 2000)",
 "items": [
  "this.albumitem_A3C191AB_B693_A604_41A2_340DE9C236ED"
 ],
 "id": "playList_A55D8535_B591_AE0C_41DC_8DC0B36150A0"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_6653B4B8_5DB3_928F_41C8_756BE38CA23E_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 1417,
   "height": 1417
  },
  {
   "url": "media/popup_6653B4B8_5DB3_928F_41C8_756BE38CA23E_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 1024
  },
  {
   "url": "media/popup_6653B4B8_5DB3_928F_41C8_756BE38CA23E_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 512
  }
 ],
 "id": "ImageResource_1D48789B_5DD5_B281_41A6_10DCE3978D43"
},
{
 "class": "IconButton",
 "paddingLeft": 0,
 "maxHeight": 60,
 "id": "IconButton_2E6021ED_347D_0EFF_41BD_84BE6BEAB908",
 "width": 60,
 "borderRadius": 0,
 "iconURL": "skin/IconButton_2E6021ED_347D_0EFF_41BD_84BE6BEAB908.png",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "transparencyActive": true,
 "minWidth": 1,
 "mode": "toggle",
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "height": 60,
 "click": "if(!this.Container_2E6011ED_347D_0EFF_41C9_5AC77536D968.get('visible')){ this.setComponentVisibility(this.Container_2E6011ED_347D_0EFF_41C9_5AC77536D968, true, 0, this.effect_E78445AC_ED52_6962_41E7_337128A4BA87, 'showEffect', false) } else { this.setComponentVisibility(this.Container_2E6011ED_347D_0EFF_41C9_5AC77536D968, false, 0, this.effect_E78445AC_ED52_6962_41E5_44E0250686CD, 'hideEffect', false) }",
 "propagateClick": false,
 "pressedIconURL": "skin/IconButton_2E6021ED_347D_0EFF_41BD_84BE6BEAB908_pressed.png",
 "data": {
  "name": "settings button"
 },
 "paddingTop": 0,
 "pressedRollOverIconURL": "skin/IconButton_2E6021ED_347D_0EFF_41BD_84BE6BEAB908_pressed.png",
 "shadow": false,
 "cursor": "hand",
 "maxWidth": 60,
 "backgroundOpacity": 0
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_A0516241_B693_AA07_41D4_FF6C7804D1FA",
 "id": "camera_A0515241_B693_AA07_41D4_A245F545F9EA",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 95,
  "yaw": 1.28,
  "pitch": 0
 }
},
{
 "class": "PlayList",
 "change": "this.showComponentsWhileMouseOver(this.container_A3CEC1A5_B693_A60C_41E6_5174B1FA1473, [this.htmltext_A3CE11A6_B693_A60C_41CD_C7283FF4D447,this.component_A3CFE1A6_B693_A60C_41BC_F6E3E5C7C9F0,this.component_A3CFF1A6_B693_A60C_41A6_D06A56C7A8BE], 2000)",
 "items": [
  "this.albumitem_A3CE91A5_B693_A60C_41E3_31D8FEC5C148"
 ],
 "id": "playList_A557A525_B591_AE0F_41BB_E70F4F106F5D"
},
{
 "class": "Container",
 "paddingLeft": 0,
 "borderRadius": 0,
 "children": [
  "this.Container_7DE3E59A_6911_E2E0_41D7_0925C3250BD2",
  "this.Container_7DE3059A_6911_E2E0_41C7_5A5AF3BF1498"
 ],
 "scrollBarWidth": 10,
 "id": "Container_7DE2D59A_6911_E2E0_41A7_D15D0A935C33",
 "left": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "right": "0%",
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "top": "0%",
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": "0%",
 "verticalAlign": "top",
 "horizontalAlign": "left",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "click": "this.setComponentVisibility(this.Container_7DE2D59A_6911_E2E0_41A7_D15D0A935C33, false, 0, null, null, false)",
 "propagateClick": true,
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "--INFO"
 },
 "shadow": false,
 "visible": false,
 "layout": "absolute",
 "backgroundOpacity": 0.6
},
{
 "class": "FadeInEffect",
 "easing": "linear",
 "id": "effect_E78445AC_ED52_6962_41E7_337128A4BA87",
 "duration": 200
},
{
 "class": "FadeInEffect",
 "easing": "linear",
 "id": "effect_77FFEBD0_6F11_A37D_41CF_E0702F0FF71B",
 "duration": 500
},
{
 "class": "ViewerArea",
 "transitionMode": "blending",
 "playbackBarBottom": 0,
 "id": "ViewerAreaLabeled_3AEAC6FC_3514_3866_41BA_E46727E47B58",
 "left": "0%",
 "width": "100%",
 "toolTipShadowHorizontalLength": 0,
 "playbackBarHeadShadow": true,
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowVerticalLength": 0,
 "minHeight": 1,
 "borderSize": 0,
 "playbackBarHeadShadowHorizontalLength": 0,
 "toolTipBorderRadius": 3,
 "paddingRight": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderColor": "#000000",
 "toolTipPaddingLeft": 6,
 "vrPointerSelectionTime": 2000,
 "minWidth": 1,
 "playbackBarHeadWidth": 6,
 "progressBorderSize": 0,
 "toolTipDisplayTime": 600,
 "firstTransitionDuration": 0,
 "toolTipFontStyle": "normal",
 "progressLeft": 0,
 "playbackBarHeadShadowColor": "#000000",
 "toolTipShadowBlurRadius": 3,
 "progressBarBorderColor": "#000000",
 "playbackBarBorderRadius": 0,
 "progressBottom": 2,
 "toolTipBackgroundColor": "#F6F6F6",
 "toolTipFontWeight": "normal",
 "height": "100%",
 "propagateClick": false,
 "toolTipPaddingTop": 4,
 "playbackBarBackgroundColorDirection": "vertical",
 "toolTipBorderSize": 1,
 "toolTipPaddingBottom": 4,
 "toolTipFontFamily": "Arial",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "transitionDuration": 500,
 "progressRight": 0,
 "toolTipFontSize": 12,
 "progressHeight": 10,
 "playbackBarProgressBorderSize": 0,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "playbackBarRight": 0,
 "progressBarBorderRadius": 0,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "shadow": false,
 "playbackBarHeadShadowVerticalLength": 0,
 "borderRadius": 0,
 "playbackBarProgressOpacity": 1,
 "playbackBarHeadBorderRadius": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBackgroundOpacity": 1,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "progressOpacity": 1,
 "playbackBarBorderSize": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "toolTipTextShadowOpacity": 0,
 "toolTipOpacity": 1,
 "playbackBarHeadBorderSize": 0,
 "top": "0%",
 "progressBarOpacity": 1,
 "progressBorderRadius": 0,
 "toolTipFontColor": "#606060",
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "playbackBarHeadShadowBlurRadius": 3,
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadOpacity": 1,
 "vrPointerSelectionColor": "#FF6600",
 "progressBackgroundColorRatios": [
  0
 ],
 "playbackBarLeft": 0,
 "toolTipPaddingRight": 6,
 "toolTipShadowColor": "#333333",
 "vrPointerColor": "#FFFFFF",
 "progressBarBackgroundColorDirection": "vertical",
 "playbackBarHeadHeight": 15,
 "toolTipBorderColor": "#767676",
 "paddingBottom": 0,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipTextShadowBlurRadius": 3,
 "progressBarBorderSize": 0,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "data": {
  "name": "Viewer Photo"
 },
 "toolTipShadowOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "paddingLeft": 0,
 "playbackBarHeight": 10,
 "paddingTop": 0,
 "toolTipShadowSpread": 0,
 "progressBackgroundColorDirection": "vertical"
},
{
 "class": "WebFrame",
 "paddingLeft": 0,
 "borderRadius": 0,
 "id": "WebFrame_BA5AA207_B591_AA0C_41D5_97D2F2403567",
 "left": "0%",
 "width": "100%",
 "backgroundColorRatios": [
  0
 ],
 "scrollEnabled": true,
 "url": "/buscar/index.html",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 0,
 "top": "0%",
 "minWidth": 1,
 "paddingBottom": 0,
 "backgroundColor": [
  "#FFFFFF"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "height": "95.972%",
 "data": {
  "name": "iframebuscador"
 },
 "paddingTop": 0,
 "shadow": false,
 "insetBorder": false,
 "backgroundOpacity": 1
},
{
 "class": "Container",
 "paddingLeft": 0,
 "borderRadius": 0,
 "children": [
  "this.Image_7DE3B59A_6911_E2E0_41D3_E1AF7DF208C7"
 ],
 "scrollBarWidth": 10,
 "id": "Container_7DE3959A_6911_E2E0_41D2_9D01577E4575",
 "width": "65%",
 "backgroundColorRatios": [
  0
 ],
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "horizontalAlign": "center",
 "contentOpaque": false,
 "minWidth": 1,
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "height": "100%",
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "-left"
 },
 "shadow": false,
 "layout": "absolute",
 "backgroundOpacity": 1
},
{
 "class": "IconButton",
 "paddingLeft": 0,
 "maxHeight": 60,
 "id": "IconButton_B86F3C57_B592_DE0C_41DC_0A6A6AE29B75",
 "rollOverIconURL": "skin/IconButton_B86F3C57_B592_DE0C_41DC_0A6A6AE29B75_rollover.jpg",
 "width": "4.593%",
 "borderRadius": 0,
 "iconURL": "skin/IconButton_B86F3C57_B592_DE0C_41DC_0A6A6AE29B75.jpg",
 "minHeight": 25,
 "borderSize": 0,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "transparencyActive": false,
 "mode": "push",
 "verticalAlign": "middle",
 "minWidth": 25,
 "paddingBottom": 0,
 "height": "64.579%",
 "click": "this.setComponentVisibility(this.Container_B86F2C57_B592_DE0C_41D1_EEF22B2EF88F, false, 0, null, null, false)",
 "propagateClick": false,
 "pressedIconURL": "skin/IconButton_B86F3C57_B592_DE0C_41DC_0A6A6AE29B75_pressed.jpg",
 "data": {
  "name": "X"
 },
 "paddingTop": 0,
 "shadow": false,
 "cursor": "hand",
 "maxWidth": 60,
 "backgroundOpacity": 0
},
{
 "class": "MediaAudio",
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_6D474534_5C54_7380_41C9_5E0067534943.mp3",
  "class": "AudioResource",
  "oggUrl": "media/audio_6D474534_5C54_7380_41C9_5E0067534943.ogg"
 },
 "id": "audio_6D474534_5C54_7380_41C9_5E0067534943",
 "data": {
  "label": "Yamaha XTZ150"
 }
},
{
 "class": "IconButton",
 "paddingLeft": 0,
 "maxHeight": 60,
 "id": "IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4",
 "rollOverIconURL": "skin/IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4_rollover.png",
 "width": 70,
 "borderRadius": 0,
 "right": "1%",
 "iconURL": "skin/IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4.png",
 "minHeight": 40,
 "borderSize": 0,
 "paddingRight": 0,
 "top": "45.9%",
 "transparencyActive": false,
 "bottom": "45.9%",
 "mode": "push",
 "verticalAlign": "middle",
 "horizontalAlign": "center",
 "minWidth": 40,
 "paddingBottom": 0,
 "propagateClick": false,
 "pressedIconURL": "skin/IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4_pressed.png",
 "data": {
  "name": ">"
 },
 "paddingTop": 0,
 "pressedRollOverIconURL": "skin/IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4_pressed.png",
 "shadow": false,
 "cursor": "hand",
 "maxWidth": 60,
 "backgroundOpacity": 0
},
{
 "class": "IconButton",
 "paddingLeft": 0,
 "maxHeight": 58,
 "id": "IconButton_2E60B1ED_347D_0EFF_41C3_3E7369236DCE",
 "width": 58,
 "borderRadius": 0,
 "iconURL": "skin/IconButton_2E60B1ED_347D_0EFF_41C3_3E7369236DCE.png",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "transparencyActive": true,
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
 "paddingTop": 0,
 "pressedRollOverIconURL": "skin/IconButton_2E60B1ED_347D_0EFF_41C3_3E7369236DCE_pressed.png",
 "shadow": false,
 "cursor": "hand",
 "maxWidth": 58,
 "backgroundOpacity": 0
},
{
 "class": "MediaAudio",
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_63F1E49E_5DD3_9283_41D6_582E0D8140C0.mp3",
  "class": "AudioResource",
  "oggUrl": "media/audio_63F1E49E_5DD3_9283_41D6_582E0D8140C0.ogg"
 },
 "id": "audio_63F1E49E_5DD3_9283_41D6_582E0D8140C0",
 "data": {
  "label": "Yamaha YCZ110"
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
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
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 1024
   }
  ]
 },
 "pitch": -5.29,
 "popupMaxWidth": "95%",
 "yaw": 103.76,
 "showDuration": 500
},
{
 "class": "Container",
 "borderRadius": 0,
 "children": [
  "this.IconButton_2E6021ED_347D_0EFF_41BD_84BE6BEAB908"
 ],
 "id": "Container_2E6031ED_347D_0EFC_41A1_12EC3C0472FF",
 "paddingLeft": 0,
 "width": 110,
 "right": "0%",
 "scrollBarColor": "#000000",
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 0,
 "top": "0%",
 "contentOpaque": false,
 "minWidth": 1,
 "verticalAlign": "middle",
 "horizontalAlign": "center",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": 110,
 "propagateClick": false,
 "overflow": "visible",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "top"
 },
 "shadow": false,
 "scrollBarWidth": 10,
 "layout": "horizontal",
 "backgroundOpacity": 0
},
{
 "class": "PlayList",
 "items": [
  {
   "class": "VideoPlayListItem",
   "start": "this.viewer_uidA3CF21A7_B693_A60C_41D7_EA1BF066520DVideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.playList_A5541530_B591_AE04_41E2_21A0F1AACA17, 0, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.playList_A5541530_B591_AE04_41E2_21A0F1AACA17, 0)",
   "begin": "this.fixTogglePlayPauseButton(this.viewer_uidA3CF21A7_B693_A60C_41D7_EA1BF066520DVideoPlayer)",
   "media": "this.video_786B48A9_5DD5_9281_41D6_F860A1820E4B",
   "player": "this.viewer_uidA3CF21A7_B693_A60C_41D7_EA1BF066520DVideoPlayer"
  }
 ],
 "id": "playList_A5541530_B591_AE04_41E2_21A0F1AACA17"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
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
 "showDuration": 500,
 "video": {
  "width": 1280,
  "class": "VideoResource",
  "mp4Url": "media/video_6D28BB12_5C4D_9783_41D4_8A27FA748C2B.mp4",
  "height": 720
 }
},
{
 "thumbnailUrl": "media/video_636358BB_5DD5_9281_41D0_CDF25C2DBC6B_t.jpg",
 "class": "Video",
 "label": "Yamaha YC-Z ",
 "scaleMode": "fit_inside",
 "width": 1280,
 "loop": false,
 "id": "video_636358BB_5DD5_9281_41D0_CDF25C2DBC6B",
 "height": 720,
 "video": {
  "width": 1280,
  "class": "VideoResource",
  "mp4Url": "media/video_636358BB_5DD5_9281_41D0_CDF25C2DBC6B.mp4",
  "height": 720
 }
},
{
 "thumbnailUrl": "media/album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_t.png",
 "class": "PhotoAlbum",
 "playList": "this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_AlbumPlayList",
 "label": "Album de Fotos Yamaha-MTZ 150 02",
 "id": "album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A"
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_A02EF21F_B693_AA3C_41D4_AEA42AA09E8E",
 "id": "camera_A02ED21F_B693_AA3C_41E1_5F33E14B363E",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 95,
  "yaw": 1.25,
  "pitch": 0
 }
},
{
 "thumbnailUrl": "media/album_623D971A_5DD7_9F83_417C_6FB0FF992743_3_t.jpg",
 "class": "Photo",
 "duration": 5000,
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
 "height": 338
},
{
 "from": "top",
 "class": "SlideInEffect",
 "easing": "linear",
 "id": "effect_A78A24EF_B591_AE1B_41A5_2B61DD9A2922",
 "duration": 500
},
{
 "class": "FadeOutEffect",
 "easing": "linear",
 "id": "effect_7874758E_6EF0_67E5_41D8_CFAFDB1F2DCE",
 "duration": 500
},
{
 "class": "VideoPlayer",
 "displayPlaybackBar": true,
 "id": "MainViewerVideoPlayer",
 "viewerArea": "this.MainViewer"
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_535C5A1A_5C54_B183_41B4_3072914924C6",
 "id": "panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 95,
  "yaw": -0.52,
  "pitch": -5.36
 }
},
{
 "class": "Container",
 "borderRadius": 0,
 "children": [
  "this.Image_6924E557_649A_33AC_41BA_A1E22386BC22",
  "this.Container_1830289D_3415_1D5C_41BC_8E6011E2CDF1"
 ],
 "id": "Container_685CC558_649E_53A4_41C3_031C34B7328A",
 "left": "0%",
 "width": "100%",
 "gap": 10,
 "paddingLeft": 0,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 0,
 "horizontalAlign": "left",
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": "0%",
 "verticalAlign": "top",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": 144,
 "propagateClick": false,
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "---BUTTON SET"
 },
 "shadow": false,
 "scrollBarWidth": 10,
 "layout": "absolute",
 "backgroundOpacity": 0
},
{
 "thumbnailUrl": "media/album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_t.png",
 "class": "PhotoAlbum",
 "playList": "this.album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_AlbumPlayList",
 "label": "Album de Fotos sz-rr-1",
 "id": "album_6076EEE4_5DF7_EE80_41C0_70404B70EF36"
},
{
 "class": "Container",
 "borderRadius": 0,
 "children": [
  "this.IconButton_B86F3C57_B592_DE0C_41DC_0A6A6AE29B75"
 ],
 "id": "Container_B86F0C57_B592_DE0C_41E1_299FEA38FBB7",
 "left": "10%",
 "right": "10%",
 "paddingLeft": 0,
 "scrollBarColor": "#000000",
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 20,
 "top": "5%",
 "contentOpaque": false,
 "bottom": "87.27%",
 "verticalAlign": "top",
 "horizontalAlign": "right",
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "propagateClick": true,
 "overflow": "visible",
 "scrollBarMargin": 2,
 "paddingTop": 20,
 "data": {
  "name": "Container X global"
 },
 "shadow": false,
 "scrollBarWidth": 10,
 "layout": "vertical",
 "backgroundOpacity": 0
},
{
 "class": "IconButton",
 "paddingLeft": 0,
 "maxHeight": 58,
 "id": "IconButton_2E60A1ED_347D_0EFF_41BC_A36ED8CE8127",
 "width": 58,
 "borderRadius": 0,
 "iconURL": "skin/IconButton_2E60A1ED_347D_0EFF_41BC_A36ED8CE8127.png",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "transparencyActive": true,
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
 "paddingTop": 0,
 "pressedRollOverIconURL": "skin/IconButton_2E60A1ED_347D_0EFF_41BC_A36ED8CE8127_pressed.png",
 "shadow": false,
 "cursor": "hand",
 "maxWidth": 58,
 "backgroundOpacity": 0
},
{
 "class": "Button",
 "paddingLeft": 0,
 "maxHeight": 50,
 "rollOverBackgroundOpacity": 1,
 "fontSize": "1.29vmin",
 "data": {
  "name": "X"
 },
 "click": "this.setComponentVisibility(this.Container_3A863D9B_3513_E8A1_41BD_38320457DF78, false, 0, this.effect_77AF96BF_6F11_E523_41B8_61E169A25F9B, 'hideEffect', false)",
 "id": "Button_7DC9A1F7_6916_6221_41A7_DA6068060007",
 "pressedBackgroundOpacity": 1,
 "width": 50,
 "shadowColor": "#000000",
 "borderRadius": 0,
 "backgroundColorRatios": [
  0
 ],
 "right": 20,
 "fontFamily": "Arial",
 "pressedBackgroundColor": [
  "#000000"
 ],
 "minHeight": 50,
 "borderSize": 0,
 "iconBeforeLabel": true,
 "iconURL": "skin/Button_7DC9A1F7_6916_6221_41A7_DA6068060007.png",
 "borderColor": "#000000",
 "rollOverBackgroundColor": [
  "#C50A01"
 ],
 "gap": 5,
 "paddingRight": 0,
 "fontColor": "#FFFFFF",
 "top": 20,
 "layout": "horizontal",
 "backgroundColor": [
  "#E7392B"
 ],
 "rollOverBackgroundColorRatios": [
  0
 ],
 "mode": "push",
 "verticalAlign": "middle",
 "horizontalAlign": "center",
 "shadowBlurRadius": 6,
 "minWidth": 50,
 "paddingBottom": 0,
 "pressedBackgroundColorRatios": [
  0
 ],
 "height": 50,
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "shadow": false,
 "iconHeight": 32,
 "fontStyle": "normal",
 "textDecoration": "none",
 "shadowSpread": 1,
 "paddingTop": 0,
 "iconWidth": 32,
 "cursor": "hand",
 "maxWidth": 50,
 "fontWeight": "normal",
 "backgroundOpacity": 1
},
{
 "class": "IconButton",
 "paddingLeft": 0,
 "maxHeight": 60,
 "id": "IconButton_48EE8E0A_5FEC_9B11_41CB_0CA68B3691D0",
 "rollOverIconURL": "skin/IconButton_48EE8E0A_5FEC_9B11_41CB_0CA68B3691D0_rollover.jpg",
 "width": "25%",
 "borderRadius": 0,
 "iconURL": "skin/IconButton_48EE8E0A_5FEC_9B11_41CB_0CA68B3691D0.jpg",
 "minHeight": 25,
 "borderSize": 0,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "transparencyActive": false,
 "mode": "push",
 "verticalAlign": "middle",
 "minWidth": 25,
 "paddingBottom": 0,
 "height": "75%",
 "click": "this.setComponentVisibility(this.Container_48EE9E0B_5FEC_9B17_41D6_DE3A0A569909, false, 0, null, null, false)",
 "propagateClick": false,
 "pressedIconURL": "skin/IconButton_48EE8E0A_5FEC_9B11_41CB_0CA68B3691D0_pressed.jpg",
 "data": {
  "name": "X"
 },
 "paddingTop": 0,
 "pressedRollOverIconURL": "skin/IconButton_48EE8E0A_5FEC_9B11_41CB_0CA68B3691D0_pressed_rollover.jpg",
 "shadow": false,
 "cursor": "hand",
 "maxWidth": 60,
 "backgroundOpacity": 0
},
{
 "class": "Image",
 "paddingLeft": 0,
 "maxHeight": 130,
 "id": "Image_6924E557_649A_33AC_41BA_A1E22386BC22",
 "left": "0%",
 "borderRadius": 0,
 "right": "0%",
 "url": "skin/Image_6924E557_649A_33AC_41BA_A1E22386BC22.png",
 "horizontalAlign": "center",
 "borderSize": 0,
 "minHeight": 100,
 "paddingRight": 0,
 "minWidth": 1000,
 "bottom": "0%",
 "verticalAlign": "bottom",
 "paddingBottom": 0,
 "height": 100,
 "propagateClick": false,
 "scaleMode": "fit_to_height",
 "data": {
  "name": "img "
 },
 "paddingTop": 0,
 "shadow": false,
 "backgroundOpacity": 0
},
{
 "class": "IconButton",
 "paddingLeft": 0,
 "maxHeight": 250,
 "id": "IconButton_A54D866B_B593_EA04_41CA_D2B6B86856D8",
 "width": 50,
 "borderRadius": 0,
 "iconURL": "skin/IconButton_A54D866B_B593_EA04_41CA_D2B6B86856D8.png",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "transparencyActive": true,
 "minWidth": 1,
 "mode": "push",
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "height": 50,
 "click": "this.setComponentVisibility(this.Container_BA602572_B591_6E04_41E5_3B3D95AF66C0, true, 0, this.effect_A4915BD3_B5AF_BA04_41D0_3C41B920ADD8, 'showEffect', false); this.setComponentVisibility(this.Container_A4369CCB_B591_DE04_41D4_C21B82E1EAFF, false, 0, this.effect_A7303F5E_B592_BA3C_41C2_56ADC574A88E, 'hideEffect', false)",
 "propagateClick": false,
 "data": {
  "name": "boton de busqueda"
 },
 "paddingTop": 0,
 "shadow": false,
 "cursor": "hand",
 "maxWidth": 250,
 "backgroundOpacity": 0
},
{
 "thumbnailUrl": "media/video_786B48A9_5DD5_9281_41D6_F860A1820E4B_t.jpg",
 "class": "Video",
 "label": "Yamaha MT-03 Features & Benefits",
 "scaleMode": "fit_inside",
 "width": 1280,
 "loop": false,
 "id": "video_786B48A9_5DD5_9281_41D6_F860A1820E4B",
 "height": 720,
 "video": {
  "width": 1280,
  "class": "VideoResource",
  "mp4Url": "media/video_786B48A9_5DD5_9281_41D6_F860A1820E4B.mp4",
  "height": 720
 }
},
{
 "thumbnailUrl": "media/album_623D971A_5DD7_9F83_417C_6FB0FF992743_2_t.jpg",
 "class": "Photo",
 "duration": 5000,
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
 "height": 720
},
{
 "class": "Container",
 "paddingLeft": 0,
 "borderRadius": 0,
 "children": [
  "this.WebFrame_BB4DD52C_B593_6E1C_41E3_C820564735CC"
 ],
 "scrollBarWidth": 10,
 "id": "Container_B86E7C56_B592_DE0C_41E6_685F8C807929",
 "width": "99.97%",
 "backgroundColorRatios": [
  0
 ],
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "horizontalAlign": "center",
 "contentOpaque": false,
 "minWidth": 1,
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "height": "100%",
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "-left"
 },
 "shadow": false,
 "layout": "absolute",
 "backgroundOpacity": 1
},
{
 "class": "Window",
 "paddingTop": 0,
 "scrollBarMargin": 2,
 "id": "window_BE1EF745_B591_AA0C_41D7_676C3A0967A6",
 "headerPaddingLeft": 10,
 "veilColor": [
  "#000000",
  "#000000"
 ],
 "veilHideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 500
 },
 "gap": 10,
 "veilShowEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 500
 },
 "footerBackgroundColor": [
  "#FFFFFF",
  "#EEEEEE",
  "#DDDDDD"
 ],
 "scrollBarColor": "#000000",
 "headerBackgroundColorDirection": "vertical",
 "closeButtonRollOverBorderSize": 0,
 "closeButtonBackgroundColorDirection": "vertical",
 "minHeight": 20,
 "borderSize": 0,
 "shadowOpacity": 0.5,
 "headerVerticalAlign": "middle",
 "horizontalAlign": "center",
 "closeButtonPressedBorderColor": "#000000",
 "bodyPaddingTop": 0,
 "headerPaddingRight": 0,
 "bodyPaddingRight": 0,
 "bodyPaddingBottom": 0,
 "closeButtonPressedBorderSize": 0,
 "closeButtonPaddingLeft": 5,
 "closeButtonPressedBackgroundColorDirection": "vertical",
 "shadowVerticalLength": 0,
 "modal": true,
 "paddingRight": 0,
 "minWidth": 20,
 "titlePaddingRight": 5,
 "closeButtonPaddingTop": 5,
 "backgroundColor": [],
 "closeButtonPressedBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "headerBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "closeButtonPressedBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "veilOpacity": 0.4,
 "headerBackgroundOpacity": 0,
 "closeButtonPressedIconLineWidth": 5,
 "propagateClick": false,
 "titlePaddingTop": 5,
 "closeButtonBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "shadowHorizontalLength": 3,
 "closeButtonBackgroundOpacity": 0.3,
 "shadow": true,
 "titleFontFamily": "Arial",
 "bodyPaddingLeft": 0,
 "scrollBarWidth": 10,
 "closeButtonBorderRadius": 0,
 "footerBackgroundColorRatios": [
  0,
  0.9,
  1
 ],
 "backgroundOpacity": 1,
 "closeButtonIconWidth": 20,
 "closeButtonPressedIconColor": "#888888",
 "closeButtonRollOverBorderColor": "#000000",
 "borderRadius": 5,
 "closeButtonRollOverBackgroundOpacity": 0.3,
 "children": [
  "this.viewer_uidA3CD61A9_B693_A604_41E5_9F16A3775C27"
 ],
 "headerBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "bodyBackgroundColorRatios": [
  0,
  0.5,
  1
 ],
 "closeButtonIconHeight": 20,
 "bodyBackgroundColorDirection": "vertical",
 "shadowColor": "#000000",
 "backgroundColorRatios": [],
 "closeButtonRollOverBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "closeButtonIconLineWidth": 5,
 "closeButtonRollOverIconLineWidth": 5,
 "veilColorRatios": [
  0,
  1
 ],
 "closeButtonRollOverBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "layout": "vertical",
 "closeButtonBorderColor": "#000000",
 "footerHeight": 5,
 "bodyBackgroundOpacity": 0,
 "headerPaddingBottom": 5,
 "closeButtonPressedBackgroundOpacity": 0.3,
 "hideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 500
 },
 "contentOpaque": false,
 "titlePaddingLeft": 5,
 "closeButtonPaddingBottom": 5,
 "verticalAlign": "middle",
 "shadowBlurRadius": 6,
 "paddingBottom": 0,
 "bodyBackgroundColor": [
  "#FFFFFF",
  "#DDDDDD",
  "#FFFFFF"
 ],
 "closeButtonBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "titleFontSize": "1.29vmin",
 "backgroundColorDirection": "vertical",
 "footerBackgroundOpacity": 0,
 "closeButtonBorderSize": 0,
 "closeButtonPaddingRight": 5,
 "closeButtonIconColor": "#000000",
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 500
 },
 "titlePaddingBottom": 5,
 "headerPaddingTop": 10,
 "footerBackgroundColorDirection": "vertical",
 "overflow": "scroll",
 "closeButtonRollOverIconColor": "#666666",
 "paddingLeft": 0,
 "data": {
  "name": "Window536"
 },
 "shadowSpread": 1,
 "closeButtonRollOverBackgroundColorDirection": "vertical"
},
{
 "class": "Button",
 "paddingLeft": 0,
 "maxHeight": 50,
 "rollOverBackgroundOpacity": 1,
 "fontSize": "1.29vmin",
 "data": {
  "name": "X"
 },
 "click": "this.setComponentVisibility(this.Container_7DE2D59A_6911_E2E0_41A7_D15D0A935C33, false, 0, this.effect_7E0FE099_696E_E2E0_4183_0FC331E0D87C, 'hideEffect', false)",
 "id": "Button_78C5D2AD_6EF0_BD24_41BA_7914C520D22E",
 "pressedBackgroundOpacity": 1,
 "width": 50,
 "shadowColor": "#000000",
 "borderRadius": 0,
 "backgroundColorRatios": [
  0
 ],
 "fontFamily": "Arial",
 "pressedBackgroundColor": [
  "#000000"
 ],
 "minHeight": 30,
 "borderSize": 0,
 "iconBeforeLabel": true,
 "gap": 5,
 "iconURL": "skin/Button_7DC9A1F7_6916_6221_41A7_DA6068060007.png",
 "borderColor": "#000000",
 "rollOverBackgroundColor": [
  "#C50A01"
 ],
 "paddingRight": 0,
 "fontColor": "#FFFFFF",
 "horizontalAlign": "center",
 "layout": "horizontal",
 "backgroundColor": [
  "#E7392B"
 ],
 "rollOverBackgroundColorRatios": [
  0
 ],
 "mode": "push",
 "verticalAlign": "middle",
 "shadowBlurRadius": 6,
 "minWidth": 30,
 "paddingBottom": 0,
 "pressedBackgroundColorRatios": [
  0
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "height": 50,
 "shadow": false,
 "iconHeight": 32,
 "fontStyle": "normal",
 "textDecoration": "none",
 "shadowSpread": 1,
 "paddingTop": 0,
 "iconWidth": 32,
 "cursor": "hand",
 "maxWidth": 50,
 "fontWeight": "normal",
 "backgroundOpacity": 1
},
{
 "class": "Panorama",
 "hfov": 360,
 "label": "Panorama 2",
 "id": "panorama_535281A0_5C55_92BF_41A4_79774B470AC0",
 "adjacentPanoramas": [
  {
   "backwardYaw": -178.72,
   "class": "AdjacentPanorama",
   "yaw": -0.22,
   "distance": 1,
   "panorama": "this.panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE"
  },
  {
   "backwardYaw": 0.53,
   "class": "AdjacentPanorama",
   "yaw": -179.59,
   "distance": 1,
   "panorama": "this.panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00"
  }
 ],
 "pitch": 0,
 "vfov": 180,
 "partial": false,
 "thumbnailUrl": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_t.jpg",
 "frames": [
  {
   "thumbnailUrl": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_t.jpg",
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "hfovMin": "120%",
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
 "hfovMax": 110
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_A04C3253_B693_AA04_41E0_916172DE5D5A",
 "id": "camera_A04C1253_B693_AA04_41E0_03A80B78F384",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 95,
  "yaw": -179.47,
  "pitch": 0
 }
},
{
 "class": "Button",
 "paddingLeft": 0,
 "borderRadius": 0,
 "fontSize": "22px",
 "id": "Button_6B3517BB_64A6_3EE4_41D7_49868CE9F7A9",
 "width": 90,
 "shadowColor": "#000000",
 "fontFamily": "Akhand-Bold",
 "iconBeforeLabel": true,
 "backgroundColorRatios": [
  0,
  1
 ],
 "layout": "horizontal",
 "horizontalAlign": "center",
 "borderSize": 0,
 "gap": 5,
 "minHeight": 1,
 "paddingRight": 0,
 "fontColor": "#FFFFFF",
 "mode": "push",
 "verticalAlign": "middle",
 "shadowBlurRadius": 6,
 "minWidth": 1,
 "paddingBottom": 0,
 "borderColor": "#000000",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "label": "BUTTON",
 "fontStyle": "normal",
 "rollOverFontColor": "#FF0000",
 "height": "100%",
 "propagateClick": false,
 "iconHeight": 32,
 "data": {
  "name": "button 4"
 },
 "textDecoration": "none",
 "shadowSpread": 1,
 "paddingTop": 0,
 "iconWidth": 32,
 "shadow": false,
 "visible": false,
 "cursor": "hand",
 "fontWeight": "normal",
 "backgroundOpacity": 0
},
{
 "class": "Container",
 "borderRadius": 0,
 "children": [
  "this.IconButton_48EE8E0A_5FEC_9B11_41CB_0CA68B3691D0"
 ],
 "id": "Container_48EEBE0A_5FEC_9B11_41D0_96FC83B0AD00",
 "left": "5%",
 "right": "5%",
 "paddingLeft": 0,
 "scrollBarColor": "#000000",
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 20,
 "top": "5%",
 "contentOpaque": false,
 "bottom": "87%",
 "verticalAlign": "top",
 "horizontalAlign": "right",
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "propagateClick": false,
 "overflow": "visible",
 "scrollBarMargin": 2,
 "paddingTop": 20,
 "data": {
  "name": "Container X global"
 },
 "shadow": false,
 "scrollBarWidth": 10,
 "layout": "vertical",
 "backgroundOpacity": 0
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_535C7A1A_5C54_B183_41BC_D9E72EB0D991",
 "id": "panorama_535281A0_5C55_92BF_41A4_79774B470AC0_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 95,
  "yaw": 0.13,
  "pitch": -8.41
 }
},
{
 "thumbnailUrl": "media/album_705F61E7_5C4C_9281_41D4_67432D954851_2_t.jpg",
 "class": "Photo",
 "duration": 5000,
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
 "height": 1080
},
{
 "class": "SlideOutEffect",
 "easing": "linear",
 "id": "effect_A7303F5E_B592_BA3C_41C2_56ADC574A88E",
 "to": "top",
 "duration": 500
},
{
 "class": "IconButton",
 "paddingLeft": 0,
 "maxHeight": 58,
 "id": "IconButton_2E60E1EE_347D_0EFC_41C3_A8DD2E2819ED",
 "rollOverIconURL": "skin/IconButton_2E60E1EE_347D_0EFC_41C3_A8DD2E2819ED_rollover.png",
 "width": 58,
 "borderRadius": 0,
 "iconURL": "skin/IconButton_2E60E1EE_347D_0EFC_41C3_A8DD2E2819ED.png",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "transparencyActive": true,
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
 "paddingTop": 0,
 "shadow": false,
 "cursor": "hand",
 "maxWidth": 58,
 "backgroundOpacity": 0
},
{
 "thumbnailUrl": "media/album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_5_t.jpg",
 "class": "Photo",
 "duration": 5000,
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
 "height": 720
},
{
 "class": "Image",
 "paddingLeft": 0,
 "borderRadius": 0,
 "id": "Image_6B6FAA55_64A6_71AF_41D3_F197980C21A5",
 "width": 7,
 "url": "skin/Image_6B6FAA55_64A6_71AF_41D3_F197980C21A5.png",
 "horizontalAlign": "center",
 "borderSize": 0,
 "minHeight": 1,
 "paddingRight": 0,
 "verticalAlign": "middle",
 "minWidth": 1,
 "paddingBottom": 0,
 "height": "100%",
 "propagateClick": false,
 "scaleMode": "fit_inside",
 "data": {
  "name": "-"
 },
 "paddingTop": 0,
 "shadow": false,
 "visible": false,
 "maxWidth": 7,
 "backgroundOpacity": 0
},
{
 "class": "Panorama",
 "hfov": 360,
 "label": "Panorama 1",
 "id": "panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00",
 "adjacentPanoramas": [
  {
   "backwardYaw": -178.75,
   "class": "AdjacentPanorama",
   "yaw": 0.63,
   "distance": 1,
   "panorama": "this.panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE"
  },
  {
   "backwardYaw": -179.59,
   "class": "AdjacentPanorama",
   "yaw": 0.53,
   "distance": 1,
   "panorama": "this.panorama_535281A0_5C55_92BF_41A4_79774B470AC0"
  }
 ],
 "pitch": 0,
 "vfov": 180,
 "partial": false,
 "thumbnailUrl": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_t.jpg",
 "frames": [
  {
   "thumbnailUrl": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_t.jpg",
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "hfovMin": "120%",
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
 "hfovMax": 110
},
{
 "class": "PlayList",
 "items": [
  {
   "class": "VideoPlayListItem",
   "start": "this.viewer_uidA3C641AD_B693_A61C_41C9_5379014E9F2DVideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.playList_A55CA53D_B591_AE7C_41E1_0BBAFB249836, 0, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.playList_A55CA53D_B591_AE7C_41E1_0BBAFB249836, 0)",
   "begin": "this.fixTogglePlayPauseButton(this.viewer_uidA3C641AD_B693_A61C_41C9_5379014E9F2DVideoPlayer)",
   "media": "this.video_6138AF13_5DF4_6F81_41CF_B052B4DA69FF",
   "player": "this.viewer_uidA3C641AD_B693_A61C_41C9_5379014E9F2DVideoPlayer"
  }
 ],
 "id": "playList_A55CA53D_B591_AE7C_41E1_0BBAFB249836"
},
{
 "class": "Button",
 "paddingLeft": 0,
 "borderRadius": 0,
 "rollOverBackgroundOpacity": 0,
 "fontSize": "22px",
 "label": "INFORMACI\u00d3N",
 "id": "Button_750C11A1_648F_A89A_41C9_2E58278A81A6",
 "width": 130,
 "shadowColor": "#000000",
 "fontFamily": "Akhand-Bold",
 "iconBeforeLabel": true,
 "backgroundColorRatios": [
  0,
  1
 ],
 "layout": "horizontal",
 "minHeight": 1,
 "borderSize": 0,
 "gap": 5,
 "rollOverBackgroundColor": [
  "#000000",
  "#FFFFFF"
 ],
 "paddingRight": 0,
 "fontColor": "#FFFFFF",
 "horizontalAlign": "center",
 "rollOverShadow": false,
 "rollOverBackgroundColorRatios": [
  1,
  1
 ],
 "mode": "push",
 "verticalAlign": "middle",
 "click": "this.setComponentVisibility(this.Container_7DE2D59A_6911_E2E0_41A7_D15D0A935C33, true, 0, this.effect_757D2F2A_6F10_A32C_41C3_CCBEB7AD57F6, 'showEffect', false)",
 "shadowBlurRadius": 6,
 "minWidth": 1,
 "paddingBottom": 0,
 "borderColor": "#000000",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "fontStyle": "normal",
 "rollOverFontColor": "#FF0000",
 "height": "100%",
 "propagateClick": false,
 "rollOverShadowBlurRadius": 66,
 "iconHeight": 32,
 "data": {
  "name": "info"
 },
 "textDecoration": "none",
 "shadowSpread": 1,
 "paddingTop": 0,
 "iconWidth": 32,
 "shadow": false,
 "cursor": "hand",
 "fontWeight": "normal",
 "backgroundOpacity": 0
},
{
 "class": "Panorama",
 "hfov": 360,
 "label": "Panorama 4",
 "id": "panorama_5373C82A_5C54_9183_41D5_746C6CF32C38",
 "adjacentPanoramas": [
  {
   "backwardYaw": -89.16,
   "class": "AdjacentPanorama",
   "yaw": -152.61,
   "distance": 1,
   "panorama": "this.panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE"
  }
 ],
 "pitch": 0,
 "vfov": 180,
 "partial": false,
 "thumbnailUrl": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_t.jpg",
 "frames": [
  {
   "thumbnailUrl": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_t.jpg",
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "hfovMin": "120%",
 "overlays": [
  "this.overlay_4459C812_5C5D_9183_41D4_68F3FE8A5EC3",
  "this.panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_tcap0",
  "this.overlay_48083C12_5F78_3C60_41D4_DC6560511014",
  "this.overlay_48E8D0CC_5F78_25E0_41C3_27414998C55C"
 ],
 "hfovMax": 110
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_A007B1FF_B693_A9FC_41C0_F557D19328FE",
 "id": "camera_A00781FF_B693_A9FC_41D7_F0C6DB8C8C58",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 95,
  "yaw": 179.78,
  "pitch": 0
 }
},
{
 "thumbnailUrl": "media/video_6D28BB12_5C4D_9783_41D4_8A27FA748C2B_t.jpg",
 "class": "Video",
 "label": "Yamaha XTZ 150",
 "scaleMode": "fit_inside",
 "width": 1280,
 "loop": false,
 "id": "video_6D28BB12_5C4D_9783_41D4_8A27FA748C2B",
 "height": 720,
 "video": {
  "width": 1280,
  "class": "VideoResource",
  "mp4Url": "media/video_6D28BB12_5C4D_9783_41D4_8A27FA748C2B.mp4",
  "height": 720
 }
},
{
 "class": "IconButton",
 "paddingLeft": 0,
 "maxHeight": 58,
 "id": "IconButton_2E6091ED_347D_0EFF_41C6_E6D253232DA1",
 "width": 58,
 "borderRadius": 0,
 "iconURL": "skin/IconButton_2E6091ED_347D_0EFF_41C6_E6D253232DA1.png",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "transparencyActive": true,
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
 "paddingTop": 0,
 "pressedRollOverIconURL": "skin/IconButton_2E6091ED_347D_0EFF_41C6_E6D253232DA1_pressed.png",
 "shadow": false,
 "cursor": "hand",
 "maxWidth": 58,
 "backgroundOpacity": 0
},
{
 "class": "PhotoAlbumPlayer",
 "buttonNext": "this.IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4",
 "id": "MainViewerPhotoAlbumPlayer",
 "buttonPrevious": "this.IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC",
 "viewerArea": "this.MainViewer"
},
{
 "class": "FadeOutEffect",
 "easing": "linear",
 "id": "effect_77AF96BF_6F11_E523_41B8_61E169A25F9B",
 "duration": 500
},
{
 "class": "Panorama",
 "hfov": 360,
 "label": "Panorama 3",
 "id": "panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE",
 "adjacentPanoramas": [
  {
   "backwardYaw": -152.61,
   "class": "AdjacentPanorama",
   "yaw": -89.16,
   "distance": 1,
   "panorama": "this.panorama_5373C82A_5C54_9183_41D5_746C6CF32C38"
  },
  {
   "backwardYaw": 0.63,
   "class": "AdjacentPanorama",
   "yaw": -178.75,
   "distance": 1,
   "panorama": "this.panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00"
  },
  {
   "backwardYaw": -0.22,
   "class": "AdjacentPanorama",
   "yaw": -178.72,
   "distance": 1,
   "panorama": "this.panorama_535281A0_5C55_92BF_41A4_79774B470AC0"
  }
 ],
 "pitch": 0,
 "vfov": 180,
 "partial": false,
 "thumbnailUrl": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_t.jpg",
 "frames": [
  {
   "thumbnailUrl": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_t.jpg",
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "hfovMin": "120%",
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
 "hfovMax": 110
},
{
 "thumbnailUrl": "media/album_623D971A_5DD7_9F83_417C_6FB0FF992743_0_t.jpg",
 "class": "Photo",
 "duration": 5000,
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
 "height": 338
},
{
 "class": "FadeInEffect",
 "easing": "linear",
 "id": "effect_757D2F2A_6F10_A32C_41C3_CCBEB7AD57F6",
 "duration": 500
},
{
 "thumbnailUrl": "media/album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_3_t.jpg",
 "class": "Photo",
 "duration": 5000,
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
 "height": 338
},
{
 "class": "Container",
 "paddingLeft": 0,
 "borderRadius": 0,
 "children": [
  "this.HTMLText_7DE3759A_6911_E2E0_41A7_C2659986BA1F",
  "this.Button_7DE3659A_6911_E2E0_41C3_93316288CBE4"
 ],
 "scrollBarWidth": 10,
 "id": "Container_7DE3459A_6911_E2E0_41CE_F97D3E361A8D",
 "width": "100%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 300,
 "borderSize": 0,
 "scrollBarColor": "#E73B2C",
 "paddingRight": 0,
 "horizontalAlign": "left",
 "contentOpaque": false,
 "minWidth": 100,
 "verticalAlign": "top",
 "paddingBottom": 50,
 "scrollBarOpacity": 0.79,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "height": "100%",
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 70,
 "data": {
  "name": "Container text"
 },
 "shadow": false,
 "layout": "vertical",
 "backgroundOpacity": 0.3
},
{
 "class": "Window",
 "paddingTop": 0,
 "scrollBarMargin": 2,
 "id": "window_62499340_5DCC_97FF_41D6_BF532A97C63A",
 "width": 400,
 "veilColor": [
  "#000000",
  "#000000"
 ],
 "veilHideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 500
 },
 "gap": 10,
 "veilShowEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 500
 },
 "headerPaddingLeft": 10,
 "scrollBarColor": "#000000",
 "headerBackgroundColorDirection": "vertical",
 "footerBackgroundColor": [
  "#FFFFFF",
  "#EEEEEE",
  "#DDDDDD"
 ],
 "minHeight": 20,
 "borderSize": 0,
 "shadowOpacity": 0.5,
 "headerVerticalAlign": "middle",
 "horizontalAlign": "center",
 "shadowHorizontalLength": 3,
 "bodyPaddingTop": 0,
 "headerPaddingRight": 0,
 "bodyPaddingRight": 0,
 "bodyPaddingBottom": 0,
 "titleFontWeight": "normal",
 "shadowVerticalLength": 0,
 "modal": true,
 "paddingRight": 0,
 "backgroundColor": [],
 "titlePaddingRight": 5,
 "title": "",
 "minWidth": 20,
 "closeButtonPressedBackgroundColorRatios": [
  0
 ],
 "headerBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "height": 600,
 "closeButtonPressedBackgroundColor": [],
 "veilOpacity": 0.4,
 "headerBackgroundOpacity": 0,
 "closeButtonPressedIconLineWidth": 3,
 "propagateClick": false,
 "titlePaddingTop": 5,
 "closeButtonBackgroundColor": [],
 "headerBorderColor": "#000000",
 "shadow": true,
 "titleTextDecoration": "none",
 "titleFontFamily": "Arial",
 "bodyPaddingLeft": 0,
 "scrollBarWidth": 10,
 "closeButtonBorderRadius": 11,
 "footerBackgroundColorRatios": [
  0,
  0.9,
  1
 ],
 "backgroundOpacity": 1,
 "closeButtonIconWidth": 20,
 "closeButtonPressedIconColor": "#FFFFFF",
 "layout": "vertical",
 "borderRadius": 5,
 "children": [
  "this.container_A3C1D1AC_B693_A61C_41DF_E616C4D89784"
 ],
 "headerBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "bodyBackgroundColorRatios": [
  0,
  0.5,
  1
 ],
 "closeButtonIconHeight": 20,
 "bodyBackgroundColorDirection": "vertical",
 "shadowColor": "#000000",
 "backgroundColorRatios": [],
 "closeButtonRollOverBackgroundColor": [],
 "closeButtonIconLineWidth": 2,
 "veilColorRatios": [
  0,
  1
 ],
 "closeButtonRollOverBackgroundColorRatios": [
  0
 ],
 "footerHeight": 5,
 "bodyBackgroundOpacity": 0,
 "headerPaddingBottom": 5,
 "hideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 500
 },
 "contentOpaque": false,
 "titlePaddingLeft": 5,
 "titleFontStyle": "normal",
 "headerBorderSize": 0,
 "verticalAlign": "middle",
 "shadowBlurRadius": 6,
 "paddingBottom": 0,
 "bodyBackgroundColor": [
  "#FFFFFF",
  "#DDDDDD",
  "#FFFFFF"
 ],
 "closeButtonBackgroundColorRatios": [],
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "titleFontSize": "1.29vmin",
 "backgroundColorDirection": "vertical",
 "footerBackgroundOpacity": 0,
 "titleFontColor": "#000000",
 "closeButtonIconColor": "#B2B2B2",
 "veilColorDirection": "horizontal",
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 500
 },
 "titlePaddingBottom": 5,
 "headerPaddingTop": 10,
 "footerBackgroundColorDirection": "vertical",
 "overflow": "scroll",
 "closeButtonRollOverIconColor": "#FFFFFF",
 "paddingLeft": 0,
 "data": {
  "name": "Window46522"
 },
 "shadowSpread": 1
},
{
 "class": "Button",
 "paddingLeft": 0,
 "borderRadius": 50,
 "rollOverBackgroundOpacity": 1,
 "fontSize": "2.2vh",
 "data": {
  "name": "Button"
 },
 "click": "this.openLink('https://api.whatsapp.com/send?phone=595981408400&text=Chacomer%20-%20Paseo%20Digital', '_blank')",
 "id": "Button_7DE3659A_6911_E2E0_41C3_93316288CBE4",
 "pressedBackgroundOpacity": 1,
 "width": 160,
 "shadowColor": "#000000",
 "fontFamily": "Exo",
 "backgroundColorRatios": [
  0
 ],
 "gap": 5,
 "pressedBackgroundColor": [
  "#000000"
 ],
 "minHeight": 1,
 "borderSize": 0,
 "iconBeforeLabel": true,
 "borderColor": "#000000",
 "rollOverBackgroundColor": [
  "#C50A01"
 ],
 "paddingRight": 0,
 "fontColor": "#FFFFFF",
 "horizontalAlign": "center",
 "layout": "horizontal",
 "backgroundColor": [
  "#E7392B"
 ],
 "rollOverBackgroundColorRatios": [
  0
 ],
 "mode": "push",
 "verticalAlign": "middle",
 "shadowBlurRadius": 6,
 "minWidth": 1,
 "paddingBottom": 0,
 "pressedBackgroundColorRatios": [
  0
 ],
 "backgroundColorDirection": "vertical",
 "label": "CONTACTO",
 "propagateClick": false,
 "height": 44,
 "shadow": false,
 "iconHeight": 32,
 "fontStyle": "italic",
 "textDecoration": "none",
 "shadowSpread": 1,
 "paddingTop": 0,
 "iconWidth": 32,
 "cursor": "hand",
 "fontWeight": "bold",
 "backgroundOpacity": 1
},
{
 "class": "Image",
 "paddingLeft": 0,
 "borderRadius": 0,
 "id": "Image_1FC43E22_342D_1564_41BB_A63B6F19A750",
 "width": 7,
 "url": "skin/Image_6B6FAA55_64A6_71AF_41D3_F197980C21A5.png",
 "horizontalAlign": "center",
 "borderSize": 0,
 "minHeight": 1,
 "paddingRight": 0,
 "verticalAlign": "middle",
 "minWidth": 1,
 "paddingBottom": 0,
 "height": "98%",
 "propagateClick": false,
 "scaleMode": "fit_inside",
 "data": {
  "name": "-"
 },
 "paddingTop": 0,
 "shadow": false,
 "maxWidth": 7,
 "backgroundOpacity": 0
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
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
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 1024
   }
  ]
 },
 "pitch": -6.16,
 "popupMaxWidth": "95%",
 "yaw": 84.29,
 "showDuration": 500
},
{
 "class": "FadeOutEffect",
 "easing": "linear",
 "id": "effect_E78445AC_ED52_6962_41E5_44E0250686CD",
 "duration": 200
},
{
 "class": "SlideOutEffect",
 "easing": "linear",
 "id": "effect_A444350C_B59F_AE1C_41CB_192407011E81",
 "to": "top",
 "duration": 500
},
{
 "class": "Container",
 "paddingLeft": 0,
 "borderRadius": 0,
 "children": [
  "this.Container_B86E4C56_B592_DE0C_41C6_5DCAA479E3A4",
  "this.Container_B86F0C57_B592_DE0C_41E1_299FEA38FBB7"
 ],
 "scrollBarWidth": 10,
 "id": "Container_B86F2C57_B592_DE0C_41D1_EEF22B2EF88F",
 "left": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "right": "0%",
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "scrollBarColor": "#04A3E1",
 "paddingRight": 0,
 "top": "0%",
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": "0%",
 "verticalAlign": "top",
 "horizontalAlign": "left",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "click": "this.setComponentVisibility(this.Container_B86F2C57_B592_DE0C_41D1_EEF22B2EF88F, false, 0, null, null, false)",
 "propagateClick": true,
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "--Buscador"
 },
 "shadow": false,
 "visible": false,
 "layout": "absolute",
 "backgroundOpacity": 0.6
},
{
 "from": "top",
 "class": "SlideInEffect",
 "easing": "linear",
 "id": "effect_A7F0C8B7_B592_E60C_41DC_F2F8E60B7FCC",
 "duration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_6257F33E_5DCC_9783_41B0_97B5816F9903_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 1417,
   "height": 1417
  },
  {
   "url": "media/popup_6257F33E_5DCC_9783_41B0_97B5816F9903_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 1024
  },
  {
   "url": "media/popup_6257F33E_5DCC_9783_41B0_97B5816F9903_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 512
  }
 ],
 "id": "ImageResource_63BE5A50_5DF3_919F_41BA_8AC8087C33EF"
},
{
 "class": "IconButton",
 "paddingLeft": 0,
 "maxHeight": 58,
 "id": "IconButton_2E60F1ED_347D_0EFF_41C9_4BA017DDD347",
 "rollOverIconURL": "skin/IconButton_2E60F1ED_347D_0EFF_41C9_4BA017DDD347_rollover.png",
 "width": 58,
 "borderRadius": 0,
 "iconURL": "skin/IconButton_2E60F1ED_347D_0EFF_41C9_4BA017DDD347.png",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "transparencyActive": true,
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
 "paddingTop": 0,
 "shadow": false,
 "cursor": "hand",
 "maxWidth": 58,
 "backgroundOpacity": 0
},
{
 "class": "Container",
 "paddingLeft": 0,
 "borderRadius": 0,
 "children": [
  "this.Container_2E6031ED_347D_0EFC_41A1_12EC3C0472FF",
  "this.Container_2E6011ED_347D_0EFF_41C9_5AC77536D968"
 ],
 "scrollBarWidth": 10,
 "id": "Container_2E6121EE_347D_0EFC_41AD_FCF661FCEEBC",
 "width": 115,
 "right": "0%",
 "scrollBarColor": "#000000",
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 400,
 "borderSize": 0,
 "paddingRight": 0,
 "top": "0%",
 "contentOpaque": false,
 "minWidth": 1,
 "verticalAlign": "top",
 "horizontalAlign": "left",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": 641,
 "propagateClick": false,
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "--- SETTINGS"
 },
 "shadow": false,
 "layout": "absolute",
 "backgroundOpacity": 0
},
{
 "class": "HTMLText",
 "borderRadius": 0,
 "id": "HTMLText_6BDD8039_64A6_31E4_41D7_D3C38C6C69F2",
 "left": 10,
 "width": 546,
 "paddingLeft": 10,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 0,
 "top": 18,
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": 104,
 "propagateClick": false,
 "data": {
  "name": "-STICKER"
 },
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "shadow": false,
 "scrollBarWidth": 10,
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-shadow:0px 0px 15px rgba(0,0,0,0.6);text-align:left;\"><SPAN STYLE=\"letter-spacing:0vmin; white-space:pre-wrap;color:#000000;font-family:'Segoe UI';\"><SPAN STYLE=\"color:#ffffff;font-size:7.43vmin;font-family:'Exo';\"><B><I>CHACOMER</I></B></SPAN></SPAN></DIV></div>",
 "backgroundOpacity": 0
},
{
 "class": "WebFrame",
 "paddingLeft": 0,
 "borderRadius": 0,
 "id": "WebFrame_BB4DD52C_B593_6E1C_41E3_C820564735CC",
 "left": "0%",
 "width": "100%",
 "backgroundColorRatios": [
  0
 ],
 "scrollEnabled": true,
 "url": "/buscar/index.html",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 0,
 "top": "-0.05%",
 "minWidth": 1,
 "paddingBottom": 0,
 "backgroundColor": [
  "#FFFFFF"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "height": "100%",
 "data": {
  "name": "WebFrame3114"
 },
 "paddingTop": 0,
 "shadow": false,
 "insetBorder": false,
 "backgroundOpacity": 1
},
{
 "class": "PlayList",
 "change": "this.showComponentsWhileMouseOver(this.container_A3CCF1A8_B693_A604_41D4_1F994483516A, [this.htmltext_A3CC51A8_B693_A604_41B2_B37C9AB0A59C,this.component_A3CDE1A9_B693_A604_41D5_5E15E0317913,this.component_A3CDF1A9_B693_A604_41E0_836F6E5FD4F2], 2000)",
 "items": [
  "this.albumitem_A3CCB1A7_B693_A60C_41C3_0CBBF7E2AD7D"
 ],
 "id": "playList_A5545530_B591_AE04_41A8_064625E75C61"
},
{
 "class": "Container",
 "paddingLeft": 0,
 "borderRadius": 0,
 "children": [
  "this.Container_B86E7C56_B592_DE0C_41E6_685F8C807929"
 ],
 "scrollBarWidth": 10,
 "id": "Container_B86E4C56_B592_DE0C_41C6_5DCAA479E3A4",
 "left": "10%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "shadowColor": "#000000",
 "right": "10%",
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "gap": 10,
 "shadowHorizontalLength": 0,
 "shadowVerticalLength": 0,
 "shadowOpacity": 0.3,
 "paddingRight": 0,
 "top": "5%",
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": "5%",
 "verticalAlign": "top",
 "paddingBottom": 0,
 "horizontalAlign": "left",
 "shadowBlurRadius": 25,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "shadow": true,
 "shadowSpread": 1,
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "Global"
 },
 "layout": "horizontal",
 "backgroundOpacity": 1
},
{
 "class": "IconButton",
 "paddingLeft": 0,
 "borderRadius": 0,
 "id": "IconButton_BA2AFB30_B592_FA04_41C5_A7252D2F7E0C",
 "rollOverIconURL": "skin/IconButton_BA2AFB30_B592_FA04_41C5_A7252D2F7E0C_rollover.png",
 "width": 32,
 "right": "48.55%",
 "iconURL": "skin/IconButton_BA2AFB30_B592_FA04_41C5_A7252D2F7E0C.png",
 "minHeight": 0,
 "borderSize": 0,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "transparencyActive": true,
 "minWidth": 0,
 "bottom": "0%",
 "mode": "push",
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "height": 32,
 "click": "this.setComponentVisibility(this.Container_BA602572_B591_6E04_41E5_3B3D95AF66C0, false, 0, this.effect_A444350C_B59F_AE1C_41CB_192407011E81, 'hideEffect', false); this.setComponentVisibility(this.Container_A4369CCB_B591_DE04_41D4_C21B82E1EAFF, true, 0, this.effect_A7F0C8B7_B592_E60C_41DC_F2F8E60B7FCC, 'showEffect', false)",
 "propagateClick": false,
 "pressedIconURL": "skin/IconButton_BA2AFB30_B592_FA04_41C5_A7252D2F7E0C_pressed.png",
 "data": {
  "name": "boton de cerrar"
 },
 "paddingTop": 0,
 "shadow": false,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "class": "Container",
 "visible": false,
 "borderRadius": 0,
 "children": [
  "this.WebFrame_BA5AA207_B591_AA0C_41D5_97D2F2403567",
  "this.IconButton_BA2AFB30_B592_FA04_41C5_A7252D2F7E0C"
 ],
 "id": "Container_BA602572_B591_6E04_41E5_3B3D95AF66C0",
 "left": "0%",
 "width": "100%",
 "gap": 10,
 "paddingLeft": 0,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 0,
 "top": "0%",
 "contentOpaque": false,
 "verticalAlign": "top",
 "horizontalAlign": "left",
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0,
 "scrollBarVisible": "rollOver",
 "height": "47.204%",
 "propagateClick": false,
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "Buscador inline"
 },
 "shadow": false,
 "scrollBarWidth": 10,
 "layout": "absolute",
 "backgroundOpacity": 0
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
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
 "showDuration": 500,
 "video": {
  "width": 1280,
  "class": "VideoResource",
  "mp4Url": "media/video_6138AF13_5DF4_6F81_41CF_B052B4DA69FF.mp4",
  "height": 720
 }
},
{
 "class": "Image",
 "paddingLeft": 0,
 "borderRadius": 0,
 "id": "Image_1F5560D3_342D_0D24_41C3_009D491A3B6B",
 "width": 7,
 "url": "skin/Image_6B6FAA55_64A6_71AF_41D3_F197980C21A5.png",
 "horizontalAlign": "center",
 "borderSize": 0,
 "minHeight": 1,
 "paddingRight": 0,
 "verticalAlign": "middle",
 "minWidth": 1,
 "paddingBottom": 0,
 "height": "98%",
 "propagateClick": false,
 "scaleMode": "fit_inside",
 "data": {
  "name": "-"
 },
 "paddingTop": 0,
 "shadow": false,
 "maxWidth": 7,
 "backgroundOpacity": 0
},
{
 "class": "Button",
 "paddingLeft": 0,
 "maxHeight": 50,
 "rollOverBackgroundOpacity": 1,
 "fontSize": "1.29vmin",
 "data": {
  "name": "X"
 },
 "click": "this.setComponentVisibility(this.Container_7A542551_6EFF_A77C_41BD_77B516563B0F, false, 0, this.effect_7874758E_6EF0_67E5_41D8_CFAFDB1F2DCE, 'hideEffect', false)",
 "id": "Button_775D3775_6F10_A324_41B1_8092A2023E17",
 "pressedBackgroundOpacity": 1,
 "width": 50,
 "shadowColor": "#000000",
 "borderRadius": 0,
 "backgroundColorRatios": [
  0
 ],
 "right": 20,
 "fontFamily": "Arial",
 "pressedBackgroundColor": [
  "#000000"
 ],
 "minHeight": 50,
 "borderSize": 0,
 "iconBeforeLabel": true,
 "iconURL": "skin/Button_7DC9A1F7_6916_6221_41A7_DA6068060007.png",
 "borderColor": "#000000",
 "rollOverBackgroundColor": [
  "#C50A01"
 ],
 "gap": 5,
 "paddingRight": 0,
 "fontColor": "#FFFFFF",
 "top": 20,
 "layout": "horizontal",
 "backgroundColor": [
  "#E7392B"
 ],
 "rollOverBackgroundColorRatios": [
  0
 ],
 "mode": "push",
 "verticalAlign": "middle",
 "horizontalAlign": "center",
 "shadowBlurRadius": 6,
 "minWidth": 50,
 "paddingBottom": 0,
 "pressedBackgroundColorRatios": [
  0
 ],
 "height": 50,
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "shadow": false,
 "iconHeight": 32,
 "fontStyle": "normal",
 "textDecoration": "none",
 "shadowSpread": 1,
 "paddingTop": 0,
 "iconWidth": 32,
 "cursor": "hand",
 "maxWidth": 50,
 "fontWeight": "normal",
 "backgroundOpacity": 1
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_7091047F_5CB3_B181_41C4_0FD388D8E2D6_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 1417,
   "height": 1417
  },
  {
   "url": "media/popup_7091047F_5CB3_B181_41C4_0FD388D8E2D6_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 1024
  },
  {
   "url": "media/popup_7091047F_5CB3_B181_41C4_0FD388D8E2D6_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 512
  }
 ],
 "id": "ImageResource_65255BFC_5C57_B687_41D5_CBD3185EEDE7"
},
{
 "thumbnailUrl": "media/album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_2_t.jpg",
 "class": "Photo",
 "duration": 5000,
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
 "height": 338
},
{
 "class": "Container",
 "paddingLeft": 0,
 "borderRadius": 0,
 "children": [
  "this.WebFrame_4632AFB4_5FEC_9971_4192_CFEA1E19CDA3"
 ],
 "scrollBarWidth": 10,
 "id": "Container_48EF2E0A_5FEC_9B11_41D5_519E55AFBC97",
 "width": "100.034%",
 "backgroundColorRatios": [
  0
 ],
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "horizontalAlign": "center",
 "contentOpaque": false,
 "minWidth": 1,
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "height": "100%",
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "-left"
 },
 "shadow": false,
 "layout": "absolute",
 "backgroundOpacity": 1
},
{
 "class": "IconButton",
 "paddingLeft": 0,
 "maxHeight": 60,
 "id": "IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC",
 "left": "1%",
 "width": 170,
 "borderRadius": 0,
 "rollOverIconURL": "skin/IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC_rollover.png",
 "iconURL": "skin/IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC.png",
 "minHeight": 40,
 "borderSize": 0,
 "paddingRight": 0,
 "top": "42%",
 "transparencyActive": false,
 "bottom": "42%",
 "mode": "push",
 "verticalAlign": "middle",
 "horizontalAlign": "center",
 "minWidth": 40,
 "paddingBottom": 0,
 "propagateClick": false,
 "pressedIconURL": "skin/IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC_pressed.png",
 "data": {
  "name": "<"
 },
 "paddingTop": 0,
 "pressedRollOverIconURL": "skin/IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC_pressed.png",
 "shadow": false,
 "cursor": "hand",
 "maxWidth": 60,
 "backgroundOpacity": 0
},
{
 "class": "FadeInEffect",
 "easing": "linear",
 "id": "effect_78B5ED2F_6F10_6723_41CB_017231EE0D8C",
 "duration": 500
},
{
 "class": "Container",
 "paddingLeft": 0,
 "borderRadius": 0,
 "children": [
  "this.Container_3A26EF53_3514_E9A2_4159_FC2DDA226A54"
 ],
 "scrollBarWidth": 10,
 "id": "Container_3A863D9B_3513_E8A1_41BD_38320457DF78",
 "left": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "right": "0%",
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "top": "0%",
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": "0%",
 "verticalAlign": "top",
 "horizontalAlign": "left",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "---PHOTOALBUM"
 },
 "shadow": false,
 "visible": false,
 "layout": "absolute",
 "backgroundOpacity": 0.8
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
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
 "showDuration": 500,
 "video": {
  "width": 1280,
  "class": "VideoResource",
  "mp4Url": "media/video_636358BB_5DD5_9281_41D0_CDF25C2DBC6B.mp4",
  "height": 720
 }
},
{
 "class": "Container",
 "borderRadius": 0,
 "children": [
  "this.Button_78C5D2AD_6EF0_BD24_41BA_7914C520D22E"
 ],
 "id": "Container_7DE3059A_6911_E2E0_41C7_5A5AF3BF1498",
 "left": "12%",
 "right": "12%",
 "paddingLeft": 0,
 "scrollBarColor": "#000000",
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 20,
 "top": "10%",
 "contentOpaque": false,
 "bottom": "80%",
 "verticalAlign": "top",
 "horizontalAlign": "right",
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "propagateClick": false,
 "overflow": "visible",
 "scrollBarMargin": 2,
 "paddingTop": 20,
 "data": {
  "name": "Container X"
 },
 "shadow": false,
 "scrollBarWidth": 10,
 "layout": "vertical",
 "backgroundOpacity": 0
},
{
 "thumbnailUrl": "media/album_623D971A_5DD7_9F83_417C_6FB0FF992743_t.png",
 "class": "PhotoAlbum",
 "playList": "this.album_623D971A_5DD7_9F83_417C_6FB0FF992743_AlbumPlayList",
 "label": "Album de Fotos Yamaha-YCZ110",
 "id": "album_623D971A_5DD7_9F83_417C_6FB0FF992743"
},
{
 "class": "Window",
 "paddingTop": 0,
 "scrollBarMargin": 2,
 "id": "window_665D74BA_5DB3_9283_41D0_3F32A6E870CE",
 "width": 400,
 "veilColor": [
  "#000000",
  "#000000"
 ],
 "veilHideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 500
 },
 "gap": 10,
 "veilShowEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 500
 },
 "headerPaddingLeft": 10,
 "scrollBarColor": "#000000",
 "headerBackgroundColorDirection": "vertical",
 "footerBackgroundColor": [
  "#FFFFFF",
  "#EEEEEE",
  "#DDDDDD"
 ],
 "minHeight": 20,
 "borderSize": 0,
 "shadowOpacity": 0.5,
 "headerVerticalAlign": "middle",
 "horizontalAlign": "center",
 "shadowHorizontalLength": 3,
 "bodyPaddingTop": 0,
 "headerPaddingRight": 0,
 "bodyPaddingRight": 0,
 "bodyPaddingBottom": 0,
 "titleFontWeight": "normal",
 "shadowVerticalLength": 0,
 "modal": true,
 "paddingRight": 0,
 "backgroundColor": [],
 "titlePaddingRight": 5,
 "title": "",
 "minWidth": 20,
 "closeButtonPressedBackgroundColorRatios": [
  0
 ],
 "headerBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "height": 600,
 "closeButtonPressedBackgroundColor": [],
 "veilOpacity": 0.4,
 "headerBackgroundOpacity": 0,
 "closeButtonPressedIconLineWidth": 3,
 "propagateClick": false,
 "titlePaddingTop": 5,
 "closeButtonBackgroundColor": [],
 "headerBorderColor": "#000000",
 "shadow": true,
 "titleTextDecoration": "none",
 "titleFontFamily": "Arial",
 "bodyPaddingLeft": 0,
 "scrollBarWidth": 10,
 "closeButtonBorderRadius": 11,
 "footerBackgroundColorRatios": [
  0,
  0.9,
  1
 ],
 "backgroundOpacity": 1,
 "closeButtonIconWidth": 20,
 "closeButtonPressedIconColor": "#FFFFFF",
 "layout": "vertical",
 "borderRadius": 5,
 "children": [
  "this.container_A3C251AA_B693_A604_41D6_EC325181362C"
 ],
 "headerBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "bodyBackgroundColorRatios": [
  0,
  0.5,
  1
 ],
 "closeButtonIconHeight": 20,
 "bodyBackgroundColorDirection": "vertical",
 "shadowColor": "#000000",
 "backgroundColorRatios": [],
 "closeButtonRollOverBackgroundColor": [],
 "closeButtonIconLineWidth": 2,
 "veilColorRatios": [
  0,
  1
 ],
 "closeButtonRollOverBackgroundColorRatios": [
  0
 ],
 "footerHeight": 5,
 "bodyBackgroundOpacity": 0,
 "headerPaddingBottom": 5,
 "hideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 500
 },
 "contentOpaque": false,
 "titlePaddingLeft": 5,
 "titleFontStyle": "normal",
 "headerBorderSize": 0,
 "verticalAlign": "middle",
 "shadowBlurRadius": 6,
 "paddingBottom": 0,
 "bodyBackgroundColor": [
  "#FFFFFF",
  "#DDDDDD",
  "#FFFFFF"
 ],
 "closeButtonBackgroundColorRatios": [],
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "titleFontSize": "1.29vmin",
 "backgroundColorDirection": "vertical",
 "footerBackgroundOpacity": 0,
 "titleFontColor": "#000000",
 "closeButtonIconColor": "#B2B2B2",
 "veilColorDirection": "horizontal",
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 500
 },
 "titlePaddingBottom": 5,
 "headerPaddingTop": 10,
 "footerBackgroundColorDirection": "vertical",
 "overflow": "scroll",
 "closeButtonRollOverIconColor": "#FFFFFF",
 "paddingLeft": 0,
 "data": {
  "name": "Window46522"
 },
 "shadowSpread": 1
},
{
 "thumbnailUrl": "media/album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_0_t.jpg",
 "class": "Photo",
 "duration": 5000,
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
 "height": 720
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_5343BA1A_5C54_B183_41D6_CBD1E4B07337",
 "id": "panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 95,
  "yaw": -3.79,
  "pitch": -12.78
 }
},
{
 "class": "Container",
 "borderRadius": 0,
 "children": [
  "this.Image_1F5560D3_342D_0D24_41C3_009D491A3B6B",
  "this.Button_6B3DCC00_647A_DF9A_41D5_DC120403F72A",
  "this.Image_1F089AA1_342D_3D64_41C5_D320F4A4C707",
  "this.Button_750C11A1_648F_A89A_41C9_2E58278A81A6",
  "this.Image_1FC43E22_342D_1564_41BB_A63B6F19A750",
  "this.Button_748008CC_648F_B8AA_41C2_97E5C5DE0CD2",
  "this.Image_1FC09DB8_342E_F764_41A3_E939228A46A8",
  "this.Button_6B3517BB_64A6_3EE4_41D7_49868CE9F7A9",
  "this.Image_6B6FAA55_64A6_71AF_41D3_F197980C21A5"
 ],
 "id": "Container_1830289D_3415_1D5C_41BC_8E6011E2CDF1",
 "left": "0%",
 "right": "0%",
 "paddingLeft": 0,
 "scrollBarColor": "#000000",
 "gap": 0,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": 0,
 "verticalAlign": "bottom",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": 80,
 "propagateClick": false,
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "buttons"
 },
 "shadow": false,
 "scrollBarWidth": 10,
 "layout": "horizontal",
 "backgroundOpacity": 0
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
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
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 1024
   }
  ]
 },
 "pitch": -9.99,
 "popupMaxWidth": "95%",
 "yaw": -117.95,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
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
 "showDuration": 500,
 "video": {
  "width": 1280,
  "class": "VideoResource",
  "mp4Url": "media/video_786B48A9_5DD5_9281_41D6_F860A1820E4B.mp4",
  "height": 720
 }
},
{
 "class": "Container",
 "paddingLeft": 0,
 "borderRadius": 0,
 "children": [
  "this.Container_7A549551_6EFF_A77C_41D5_C1ADFF60CE66"
 ],
 "scrollBarWidth": 10,
 "id": "Container_7A542551_6EFF_A77C_41BD_77B516563B0F",
 "left": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "right": "0%",
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "top": "0%",
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": "0%",
 "verticalAlign": "top",
 "horizontalAlign": "left",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "click": "this.setComponentVisibility(this.Container_7A542551_6EFF_A77C_41BD_77B516563B0F, false, 0, null, null, false)",
 "propagateClick": true,
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "--PANORAMA LIST"
 },
 "shadow": false,
 "visible": false,
 "layout": "absolute",
 "backgroundOpacity": 0.6
},
{
 "class": "Button",
 "paddingLeft": 0,
 "borderRadius": 0,
 "rollOverBackgroundOpacity": 0,
 "fontSize": "22px",
 "label": "\u00c1LBUM DE FOTOS",
 "id": "Button_748008CC_648F_B8AA_41C2_97E5C5DE0CD2",
 "width": 139,
 "shadowColor": "#000000",
 "fontFamily": "Akhand-Bold",
 "iconBeforeLabel": true,
 "backgroundColorRatios": [
  0,
  1
 ],
 "layout": "horizontal",
 "minHeight": 1,
 "borderSize": 0,
 "gap": 5,
 "paddingRight": 0,
 "fontColor": "#FFFFFF",
 "horizontalAlign": "center",
 "mode": "push",
 "verticalAlign": "middle",
 "click": "this.setComponentVisibility(this.Container_3A863D9B_3513_E8A1_41BD_38320457DF78, true, 0, this.effect_77FFEBD0_6F11_A37D_41CF_E0702F0FF71B, 'showEffect', false)",
 "shadowBlurRadius": 6,
 "minWidth": 1,
 "paddingBottom": 0,
 "borderColor": "#000000",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "fontStyle": "normal",
 "rollOverFontColor": "#FF0000",
 "height": "100%",
 "propagateClick": false,
 "iconHeight": 32,
 "data": {
  "name": "photoalbum"
 },
 "textDecoration": "none",
 "shadowSpread": 1,
 "paddingTop": 0,
 "iconWidth": 32,
 "shadow": false,
 "cursor": "hand",
 "fontWeight": "normal",
 "backgroundOpacity": 0
},
{
 "thumbnailUrl": "media/video_6138AF13_5DF4_6F81_41CF_B052B4DA69FF_t.jpg",
 "class": "Video",
 "label": "Yamaha SZ-RR",
 "scaleMode": "fit_inside",
 "width": 1280,
 "loop": false,
 "id": "video_6138AF13_5DF4_6F81_41CF_B052B4DA69FF",
 "height": 720,
 "video": {
  "width": 1280,
  "class": "VideoResource",
  "mp4Url": "media/video_6138AF13_5DF4_6F81_41CF_B052B4DA69FF.mp4",
  "height": 720
 }
},
{
 "class": "Image",
 "paddingLeft": 0,
 "borderRadius": 0,
 "id": "Image_7DE3B59A_6911_E2E0_41D3_E1AF7DF208C7",
 "left": "0%",
 "width": "100%",
 "url": "skin/Image_7DE3B59A_6911_E2E0_41D3_E1AF7DF208C7.jpg",
 "horizontalAlign": "center",
 "borderSize": 0,
 "minHeight": 1,
 "paddingRight": 0,
 "top": "0%",
 "verticalAlign": "middle",
 "minWidth": 1,
 "paddingBottom": 0,
 "height": "100%",
 "propagateClick": false,
 "scaleMode": "fit_outside",
 "data": {
  "name": "Image"
 },
 "paddingTop": 0,
 "shadow": false,
 "backgroundOpacity": 0
},
{
 "class": "Window",
 "paddingTop": 0,
 "scrollBarMargin": 2,
 "id": "window_BE02C747_B591_AA0C_41E6_19D3B53B9752",
 "headerPaddingLeft": 10,
 "veilColor": [
  "#000000",
  "#000000"
 ],
 "veilHideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 500
 },
 "gap": 10,
 "veilShowEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 500
 },
 "footerBackgroundColor": [
  "#FFFFFF",
  "#EEEEEE",
  "#DDDDDD"
 ],
 "scrollBarColor": "#000000",
 "headerBackgroundColorDirection": "vertical",
 "closeButtonRollOverBorderSize": 0,
 "closeButtonBackgroundColorDirection": "vertical",
 "minHeight": 20,
 "borderSize": 0,
 "shadowOpacity": 0.5,
 "headerVerticalAlign": "middle",
 "horizontalAlign": "center",
 "closeButtonPressedBorderColor": "#000000",
 "bodyPaddingTop": 0,
 "headerPaddingRight": 0,
 "bodyPaddingRight": 0,
 "bodyPaddingBottom": 0,
 "closeButtonPressedBorderSize": 0,
 "closeButtonPaddingLeft": 5,
 "closeButtonPressedBackgroundColorDirection": "vertical",
 "shadowVerticalLength": 0,
 "modal": true,
 "paddingRight": 0,
 "minWidth": 20,
 "titlePaddingRight": 5,
 "closeButtonPaddingTop": 5,
 "backgroundColor": [],
 "closeButtonPressedBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "headerBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "closeButtonPressedBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "veilOpacity": 0.4,
 "headerBackgroundOpacity": 0,
 "closeButtonPressedIconLineWidth": 5,
 "propagateClick": false,
 "titlePaddingTop": 5,
 "closeButtonBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "shadowHorizontalLength": 3,
 "closeButtonBackgroundOpacity": 0.3,
 "shadow": true,
 "titleFontFamily": "Arial",
 "bodyPaddingLeft": 0,
 "scrollBarWidth": 10,
 "closeButtonBorderRadius": 0,
 "footerBackgroundColorRatios": [
  0,
  0.9,
  1
 ],
 "backgroundOpacity": 1,
 "closeButtonIconWidth": 20,
 "closeButtonPressedIconColor": "#888888",
 "closeButtonRollOverBorderColor": "#000000",
 "borderRadius": 5,
 "closeButtonRollOverBackgroundOpacity": 0.3,
 "children": [
  "this.viewer_uidA3C641AD_B693_A61C_41C9_5379014E9F2D"
 ],
 "headerBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "bodyBackgroundColorRatios": [
  0,
  0.5,
  1
 ],
 "closeButtonIconHeight": 20,
 "bodyBackgroundColorDirection": "vertical",
 "shadowColor": "#000000",
 "backgroundColorRatios": [],
 "closeButtonRollOverBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "closeButtonIconLineWidth": 5,
 "closeButtonRollOverIconLineWidth": 5,
 "veilColorRatios": [
  0,
  1
 ],
 "closeButtonRollOverBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "layout": "vertical",
 "closeButtonBorderColor": "#000000",
 "footerHeight": 5,
 "bodyBackgroundOpacity": 0,
 "headerPaddingBottom": 5,
 "closeButtonPressedBackgroundOpacity": 0.3,
 "hideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 500
 },
 "contentOpaque": false,
 "titlePaddingLeft": 5,
 "closeButtonPaddingBottom": 5,
 "verticalAlign": "middle",
 "shadowBlurRadius": 6,
 "paddingBottom": 0,
 "bodyBackgroundColor": [
  "#FFFFFF",
  "#DDDDDD",
  "#FFFFFF"
 ],
 "closeButtonBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "titleFontSize": "1.29vmin",
 "backgroundColorDirection": "vertical",
 "footerBackgroundOpacity": 0,
 "closeButtonBorderSize": 0,
 "closeButtonPaddingRight": 5,
 "closeButtonIconColor": "#000000",
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 500
 },
 "titlePaddingBottom": 5,
 "headerPaddingTop": 10,
 "footerBackgroundColorDirection": "vertical",
 "overflow": "scroll",
 "closeButtonRollOverIconColor": "#666666",
 "paddingLeft": 0,
 "data": {
  "name": "Window540"
 },
 "shadowSpread": 1,
 "closeButtonRollOverBackgroundColorDirection": "vertical"
},
{
 "class": "Button",
 "paddingLeft": 0,
 "borderRadius": 0,
 "fontSize": "22px",
 "label": "PERSPECTIVAS",
 "id": "Button_6B3DCC00_647A_DF9A_41D5_DC120403F72A",
 "width": 135,
 "shadowColor": "#000000",
 "fontFamily": "Akhand-Bold",
 "iconBeforeLabel": true,
 "backgroundColorRatios": [
  0,
  1
 ],
 "layout": "horizontal",
 "minHeight": 1,
 "borderSize": 0,
 "gap": 5,
 "paddingRight": 0,
 "fontColor": "#FFFFFF",
 "horizontalAlign": "center",
 "mode": "push",
 "verticalAlign": "middle",
 "click": "this.setComponentVisibility(this.Container_7A542551_6EFF_A77C_41BD_77B516563B0F, true, 0, this.effect_78B5ED2F_6F10_6723_41CB_017231EE0D8C, 'showEffect', false)",
 "shadowBlurRadius": 6,
 "minWidth": 1,
 "paddingBottom": 0,
 "borderColor": "#000000",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "fontStyle": "normal",
 "rollOverFontColor": "#FF0000",
 "height": "96.25%",
 "propagateClick": false,
 "iconHeight": 32,
 "data": {
  "name": "Perspectivas"
 },
 "textDecoration": "none",
 "shadowSpread": 1,
 "paddingTop": 0,
 "iconWidth": 32,
 "shadow": false,
 "cursor": "hand",
 "fontWeight": "normal",
 "backgroundOpacity": 0
},
{
 "class": "PlayList",
 "change": "this.showComponentsWhileMouseOver(this.container_A3C251AA_B693_A604_41D6_EC325181362C, [this.htmltext_A3C391AA_B693_A604_41C1_4A59A88426E9,this.component_A3C331AA_B693_A604_41D4_B3AC1857729A,this.component_A3C341AA_B693_A604_41E5_9DB878730ACF], 2000)",
 "items": [
  "this.albumitem_A3C211A9_B693_A604_41C9_D2D0AEA695D1"
 ],
 "id": "playList_A5593533_B591_AE04_41AF_C2D8A3F88499"
},
{
 "class": "Container",
 "borderRadius": 0,
 "children": [
  "this.IconButton_A54D866B_B593_EA04_41CA_D2B6B86856D8",
  "this.Label_A4D1C762_B592_AA04_41C6_FF649581B19E"
 ],
 "id": "Container_A4369CCB_B591_DE04_41D4_C21B82E1EAFF",
 "paddingLeft": 0,
 "width": "14.539%",
 "right": "40.48%",
 "scrollBarColor": "#000000",
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 0,
 "top": "0%",
 "contentOpaque": false,
 "verticalAlign": "middle",
 "horizontalAlign": "center",
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0,
 "scrollBarVisible": "rollOver",
 "height": "6.711%",
 "propagateClick": false,
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "Container9552"
 },
 "shadow": false,
 "scrollBarWidth": 10,
 "layout": "horizontal",
 "backgroundOpacity": 0
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_69A9EED9_5C5C_6E81_41BD_BE0C02F1E982_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 1417,
   "height": 1417
  },
  {
   "url": "media/popup_69A9EED9_5C5C_6E81_41BD_BE0C02F1E982_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 1024
  },
  {
   "url": "media/popup_69A9EED9_5C5C_6E81_41BD_BE0C02F1E982_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 512
  }
 ],
 "id": "ImageResource_67227574_5C54_7387_41C8_00E1AFEDB3C2"
},
{
 "class": "Container",
 "paddingLeft": 0,
 "borderRadius": 0,
 "children": [
  "this.ViewerAreaLabeled_3AEAC6FC_3514_3866_41BA_E46727E47B58",
  "this.IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC",
  "this.IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4",
  "this.Button_7DC9A1F7_6916_6221_41A7_DA6068060007"
 ],
 "scrollBarWidth": 10,
 "id": "Container_3A26EF53_3514_E9A2_4159_FC2DDA226A54",
 "left": "14%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "right": "14%",
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "top": "10%",
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": "10%",
 "verticalAlign": "top",
 "horizontalAlign": "left",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "Global"
 },
 "shadow": false,
 "layout": "absolute",
 "backgroundOpacity": 1
},
{
 "thumbnailUrl": "media/album_705F61E7_5C4C_9281_41D4_67432D954851_t.png",
 "class": "PhotoAlbum",
 "playList": "this.album_705F61E7_5C4C_9281_41D4_67432D954851_AlbumPlayList",
 "label": "Album de Fotos Yamaha-MT320 01",
 "id": "album_705F61E7_5C4C_9281_41D4_67432D954851"
},
{
 "class": "PlayList",
 "change": "if(event.source.get('selectedIndex') != -1) { this.setComponentVisibility(this.Container_7A542551_6EFF_A77C_41BD_77B516563B0F, false, 0, this.effect_7B8186D4_6EF3_A564_41D1_26B2B20529FE, 'hideEffect', false) }",
 "items": [
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist, 0, 1)",
   "media": "this.panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist, 1, 2)",
   "media": "this.panorama_535281A0_5C55_92BF_41A4_79774B470AC0",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_535281A0_5C55_92BF_41A4_79774B470AC0_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist, 2, 3)",
   "media": "this.panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist, 3, 4)",
   "media": "this.panorama_5373C82A_5C54_9183_41D5_746C6CF32C38",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_camera"
  },
  {
   "class": "VideoPlayListItem",
   "start": "this.MainViewerVideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist, 4, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist, 4)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerVideoPlayer); this.setEndToItemIndex(this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist, 4, 5)",
   "media": "this.video_786B48A9_5DD5_9281_41D6_F860A1820E4B",
   "player": "this.MainViewerVideoPlayer"
  },
  {
   "class": "PhotoAlbumPlayListItem",
   "media": "this.album_705F61E7_5C4C_9281_41D4_67432D954851",
   "begin": "this.setEndToItemIndex(this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist, 5, 6)",
   "player": "this.MainViewerPhotoAlbumPlayer"
  },
  {
   "class": "PhotoAlbumPlayListItem",
   "media": "this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A",
   "begin": "this.setEndToItemIndex(this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist, 6, 7)",
   "player": "this.MainViewerPhotoAlbumPlayer"
  },
  {
   "class": "VideoPlayListItem",
   "start": "this.MainViewerVideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist, 7, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist, 7)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerVideoPlayer); this.setEndToItemIndex(this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist, 7, 8)",
   "media": "this.video_6D28BB12_5C4D_9783_41D4_8A27FA748C2B",
   "player": "this.MainViewerVideoPlayer"
  },
  {
   "class": "PhotoAlbumPlayListItem",
   "media": "this.album_623D971A_5DD7_9F83_417C_6FB0FF992743",
   "begin": "this.setEndToItemIndex(this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist, 8, 9)",
   "player": "this.MainViewerPhotoAlbumPlayer"
  },
  {
   "class": "VideoPlayListItem",
   "start": "this.MainViewerVideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist, 9, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist, 9)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerVideoPlayer); this.setEndToItemIndex(this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist, 9, 10)",
   "media": "this.video_636358BB_5DD5_9281_41D0_CDF25C2DBC6B",
   "player": "this.MainViewerVideoPlayer"
  },
  {
   "class": "PhotoAlbumPlayListItem",
   "media": "this.album_6076EEE4_5DF7_EE80_41C0_70404B70EF36",
   "begin": "this.setEndToItemIndex(this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist, 10, 11)",
   "player": "this.MainViewerPhotoAlbumPlayer"
  },
  {
   "class": "VideoPlayListItem",
   "start": "this.MainViewerVideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist, 11, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist, 11)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerVideoPlayer); this.setEndToItemIndex(this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist, 11, 0)",
   "media": "this.video_6138AF13_5DF4_6F81_41CF_B052B4DA69FF",
   "player": "this.MainViewerVideoPlayer"
  }
 ],
 "id": "ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist"
},
{
 "class": "FadeOutEffect",
 "easing": "linear",
 "id": "effect_7E0FE099_696E_E2E0_4183_0FC331E0D87C",
 "duration": 500
},
{
 "class": "MediaAudio",
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_61DC12C0_5DF5_B6FF_4198_5687742A7BA8.mp3",
  "class": "AudioResource",
  "oggUrl": "media/audio_61DC12C0_5DF5_B6FF_4198_5687742A7BA8.ogg"
 },
 "id": "audio_61DC12C0_5DF5_B6FF_4198_5687742A7BA8",
 "data": {
  "label": "Yamaha SZ-RR"
 }
},
{
 "thumbnailUrl": "media/album_705F61E7_5C4C_9281_41D4_67432D954851_1_t.jpg",
 "class": "Photo",
 "duration": 5000,
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
 "height": 634
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_A025F230_B693_AA04_41D1_213C7398DF5D",
 "id": "camera_A025E230_B693_AA04_41D8_88A679B1C40D",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 95,
  "yaw": 0.41,
  "pitch": 0
 }
},
{
 "class": "WebFrame",
 "paddingLeft": 0,
 "borderRadius": 0,
 "id": "WebFrame_4632AFB4_5FEC_9971_4192_CFEA1E19CDA3",
 "width": "100%",
 "backgroundColorRatios": [
  0
 ],
 "right": "0%",
 "scrollEnabled": true,
 "url": "/360/mt-03/",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 0,
 "minWidth": 1,
 "bottom": "0%",
 "paddingBottom": 0,
 "backgroundColor": [
  "#FFFFFF"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "height": "100%",
 "data": {
  "name": "WebFrame9043"
 },
 "paddingTop": 0,
 "shadow": false,
 "insetBorder": false,
 "backgroundOpacity": 1
},
{
 "class": "ThumbnailGrid",
 "itemBackgroundColorDirection": "vertical",
 "itemBackgroundOpacity": 0,
 "id": "ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358",
 "left": 0,
 "itemHeight": 160,
 "width": "100%",
 "itemThumbnailBorderRadius": 0,
 "itemPaddingTop": 3,
 "gap": 26,
 "rollOverItemThumbnailShadowColor": "#E7392B",
 "scrollBarColor": "#E7392B",
 "selectedItemLabelFontColor": "#E7392B",
 "selectedItemThumbnailShadow": true,
 "paddingTop": 10,
 "minHeight": 1,
 "borderSize": 0,
 "itemVerticalAlign": "top",
 "horizontalAlign": "center",
 "rollOverItemThumbnailShadowVerticalLength": 0,
 "itemPaddingRight": 3,
 "paddingRight": 70,
 "itemLabelGap": 7,
 "rollOverItemThumbnailShadowHorizontalLength": 8,
 "itemLabelFontColor": "#666666",
 "minWidth": 1,
 "itemMinWidth": 50,
 "selectedItemThumbnailShadowVerticalLength": 0,
 "height": "92%",
 "itemLabelPosition": "bottom",
 "propagateClick": false,
 "itemLabelFontStyle": "normal",
 "itemLabelFontSize": 16,
 "itemMode": "normal",
 "shadow": false,
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "borderRadius": 5,
 "itemBackgroundColor": [],
 "itemLabelHorizontalAlign": "center",
 "playList": "this.ThumbnailGrid_7A545551_6EFF_A77C_4171_76469EB05358_mobile_playlist",
 "itemOpacity": 1,
 "itemThumbnailHeight": 125,
 "itemHorizontalAlign": "center",
 "itemThumbnailWidth": 220,
 "rollOverItemThumbnailShadowBlurRadius": 0,
 "itemThumbnailShadow": false,
 "itemMaxWidth": 1000,
 "itemWidth": 220,
 "selectedItemThumbnailShadowHorizontalLength": 0,
 "itemBorderRadius": 0,
 "bottom": -0.2,
 "verticalAlign": "middle",
 "itemMinHeight": 50,
 "selectedItemThumbnailShadowBlurRadius": 16,
 "itemLabelFontFamily": "Exo",
 "scrollBarVisible": "rollOver",
 "paddingBottom": 70,
 "scrollBarOpacity": 0.5,
 "itemBackgroundColorRatios": [],
 "itemLabelTextDecoration": "none",
 "itemThumbnailOpacity": 1,
 "itemThumbnailScaleMode": "fit_outside",
 "selectedItemLabelFontWeight": "bold",
 "scrollBarMargin": 2,
 "itemPaddingBottom": 3,
 "paddingLeft": 70,
 "itemMaxHeight": 1000,
 "data": {
  "name": "ThumbnailList"
 },
 "rollOverItemThumbnailShadow": true,
 "itemPaddingLeft": 3,
 "rollOverItemLabelFontColor": "#E7392B",
 "itemLabelFontWeight": "bold"
},
{
 "class": "FadeOutEffect",
 "easing": "linear",
 "id": "effect_7B8186D4_6EF3_A564_41D1_26B2B20529FE",
 "duration": 500
},
{
 "class": "IconButton",
 "paddingLeft": 0,
 "maxHeight": 58,
 "id": "IconButton_2E6041ED_347D_0EFF_41BF_3C82AFA80CBB",
 "rollOverIconURL": "skin/IconButton_2E6041ED_347D_0EFF_41BF_3C82AFA80CBB_rollover.png",
 "width": 58,
 "borderRadius": 0,
 "iconURL": "skin/IconButton_2E6041ED_347D_0EFF_41BF_3C82AFA80CBB.png",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "transparencyActive": true,
 "minWidth": 1,
 "mode": "push",
 "verticalAlign": "middle",
 "paddingBottom": 0,
 "height": 58,
 "propagateClick": false,
 "data": {
  "name": "VR"
 },
 "paddingTop": 0,
 "shadow": false,
 "cursor": "hand",
 "maxWidth": 58,
 "backgroundOpacity": 0
},
{
 "thumbnailUrl": "media/album_623D971A_5DD7_9F83_417C_6FB0FF992743_1_t.jpg",
 "class": "Photo",
 "duration": 5000,
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
 "height": 338
},
{
 "thumbnailUrl": "media/album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_0_t.jpg",
 "class": "Photo",
 "duration": 5000,
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
 "height": 338
},
{
 "class": "Image",
 "paddingLeft": 0,
 "borderRadius": 0,
 "id": "Image_1FC09DB8_342E_F764_41A3_E939228A46A8",
 "width": 7,
 "url": "skin/Image_6B6FAA55_64A6_71AF_41D3_F197980C21A5.png",
 "horizontalAlign": "center",
 "borderSize": 0,
 "minHeight": 1,
 "paddingRight": 0,
 "verticalAlign": "middle",
 "minWidth": 1,
 "paddingBottom": 0,
 "height": "98%",
 "propagateClick": false,
 "scaleMode": "fit_inside",
 "data": {
  "name": "-"
 },
 "paddingTop": 0,
 "shadow": false,
 "maxWidth": 7,
 "backgroundOpacity": 0
},
{
 "class": "Container",
 "paddingLeft": 0,
 "borderRadius": 0,
 "children": [
  "this.Button_775D3775_6F10_A324_41B1_8092A2023E17"
 ],
 "scrollBarWidth": 10,
 "id": "Container_7A547551_6EFF_A77C_41C6_43235B32276F",
 "left": 0,
 "width": "100%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "top": 0,
 "contentOpaque": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "verticalAlign": "top",
 "horizontalAlign": "left",
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "height": 167,
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "header"
 },
 "shadow": false,
 "layout": "absolute",
 "backgroundOpacity": 0.3
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_A03D4210_B693_AA04_41DE_50746334F0B0",
 "id": "camera_A03D3210_B693_AA04_41D9_2F9100DAB651",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 95,
  "yaw": 90.84,
  "pitch": 0
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_A013A1DB_B693_A604_41D3_7EB6F03A6AC1",
 "id": "camera_A01391DB_B693_A604_41E6_BE971DACD6E2",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 95,
  "yaw": 27.39,
  "pitch": 0
 }
},
{
 "class": "PlayList",
 "items": [
  {
   "class": "VideoPlayListItem",
   "start": "this.viewer_uidA3C0B1AB_B693_A604_41C9_8F6EE6EDEC12VideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.playList_A55E0535_B591_AE0C_41E4_5B6B2A39F6A3, 0, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.playList_A55E0535_B591_AE0C_41E4_5B6B2A39F6A3, 0)",
   "begin": "this.fixTogglePlayPauseButton(this.viewer_uidA3C0B1AB_B693_A604_41C9_8F6EE6EDEC12VideoPlayer)",
   "media": "this.video_636358BB_5DD5_9281_41D0_CDF25C2DBC6B",
   "player": "this.viewer_uidA3C0B1AB_B693_A604_41C9_8F6EE6EDEC12VideoPlayer"
  }
 ],
 "id": "playList_A55E0535_B591_AE0C_41E4_5B6B2A39F6A3"
},
{
 "class": "Window",
 "paddingTop": 0,
 "scrollBarMargin": 2,
 "id": "window_71F4E104_5C4C_7380_419F_83FEF09E1B14",
 "width": 400,
 "veilColor": [
  "#000000",
  "#000000"
 ],
 "veilHideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 500
 },
 "gap": 10,
 "veilShowEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 500
 },
 "headerPaddingLeft": 10,
 "scrollBarColor": "#000000",
 "headerBackgroundColorDirection": "vertical",
 "footerBackgroundColor": [
  "#FFFFFF",
  "#EEEEEE",
  "#DDDDDD"
 ],
 "minHeight": 20,
 "borderSize": 0,
 "shadowOpacity": 0.5,
 "headerVerticalAlign": "middle",
 "horizontalAlign": "center",
 "shadowHorizontalLength": 3,
 "bodyPaddingTop": 0,
 "headerPaddingRight": 0,
 "bodyPaddingRight": 0,
 "bodyPaddingBottom": 0,
 "titleFontWeight": "normal",
 "shadowVerticalLength": 0,
 "modal": true,
 "paddingRight": 0,
 "backgroundColor": [],
 "titlePaddingRight": 5,
 "title": "",
 "minWidth": 20,
 "closeButtonPressedBackgroundColorRatios": [
  0
 ],
 "headerBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "height": 600,
 "closeButtonPressedBackgroundColor": [],
 "veilOpacity": 0.4,
 "headerBackgroundOpacity": 0,
 "closeButtonPressedIconLineWidth": 3,
 "propagateClick": false,
 "titlePaddingTop": 5,
 "closeButtonBackgroundColor": [],
 "headerBorderColor": "#000000",
 "shadow": true,
 "titleTextDecoration": "none",
 "titleFontFamily": "Arial",
 "bodyPaddingLeft": 0,
 "scrollBarWidth": 10,
 "closeButtonBorderRadius": 11,
 "footerBackgroundColorRatios": [
  0,
  0.9,
  1
 ],
 "backgroundOpacity": 1,
 "closeButtonIconWidth": 20,
 "closeButtonPressedIconColor": "#FFFFFF",
 "layout": "vertical",
 "borderRadius": 5,
 "children": [
  "this.container_A3CEC1A5_B693_A60C_41E6_5174B1FA1473"
 ],
 "headerBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "bodyBackgroundColorRatios": [
  0,
  0.5,
  1
 ],
 "closeButtonIconHeight": 20,
 "bodyBackgroundColorDirection": "vertical",
 "shadowColor": "#000000",
 "backgroundColorRatios": [],
 "closeButtonRollOverBackgroundColor": [],
 "closeButtonIconLineWidth": 2,
 "veilColorRatios": [
  0,
  1
 ],
 "closeButtonRollOverBackgroundColorRatios": [
  0
 ],
 "footerHeight": 5,
 "bodyBackgroundOpacity": 0,
 "headerPaddingBottom": 5,
 "hideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 500
 },
 "contentOpaque": false,
 "titlePaddingLeft": 5,
 "titleFontStyle": "normal",
 "headerBorderSize": 0,
 "verticalAlign": "middle",
 "shadowBlurRadius": 6,
 "paddingBottom": 0,
 "bodyBackgroundColor": [
  "#FFFFFF",
  "#DDDDDD",
  "#FFFFFF"
 ],
 "closeButtonBackgroundColorRatios": [],
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "titleFontSize": "1.29vmin",
 "backgroundColorDirection": "vertical",
 "footerBackgroundOpacity": 0,
 "titleFontColor": "#000000",
 "closeButtonIconColor": "#B2B2B2",
 "veilColorDirection": "horizontal",
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 500
 },
 "titlePaddingBottom": 5,
 "headerPaddingTop": 10,
 "footerBackgroundColorDirection": "vertical",
 "overflow": "scroll",
 "closeButtonRollOverIconColor": "#FFFFFF",
 "paddingLeft": 0,
 "data": {
  "name": "Window46522"
 },
 "shadowSpread": 1
},
{
 "class": "Image",
 "paddingLeft": 0,
 "borderRadius": 0,
 "id": "Image_1F089AA1_342D_3D64_41C5_D320F4A4C707",
 "width": 7,
 "url": "skin/Image_6B6FAA55_64A6_71AF_41D3_F197980C21A5.png",
 "horizontalAlign": "center",
 "borderSize": 0,
 "minHeight": 1,
 "paddingRight": 0,
 "verticalAlign": "middle",
 "minWidth": 1,
 "paddingBottom": 0,
 "height": "98%",
 "propagateClick": false,
 "scaleMode": "fit_inside",
 "data": {
  "name": "-"
 },
 "paddingTop": 0,
 "shadow": false,
 "maxWidth": 7,
 "backgroundOpacity": 0
},
{
 "class": "PlayList",
 "items": [
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 0, 1)",
   "media": "this.panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 1, 2)",
   "media": "this.panorama_535281A0_5C55_92BF_41A4_79774B470AC0",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_535281A0_5C55_92BF_41A4_79774B470AC0_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 2, 3)",
   "media": "this.panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 3, 4)",
   "media": "this.panorama_5373C82A_5C54_9183_41D5_746C6CF32C38",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_camera"
  },
  {
   "class": "VideoPlayListItem",
   "start": "this.MainViewerVideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 4, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 4)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerVideoPlayer); this.setEndToItemIndex(this.mainPlayList, 4, 5)",
   "media": "this.video_786B48A9_5DD5_9281_41D6_F860A1820E4B",
   "player": "this.MainViewerVideoPlayer"
  },
  {
   "class": "PhotoAlbumPlayListItem",
   "media": "this.album_705F61E7_5C4C_9281_41D4_67432D954851",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 5, 6)",
   "player": "this.MainViewerPhotoAlbumPlayer"
  },
  {
   "class": "PhotoAlbumPlayListItem",
   "media": "this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 6, 7)",
   "player": "this.MainViewerPhotoAlbumPlayer"
  },
  {
   "class": "VideoPlayListItem",
   "start": "this.MainViewerVideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 7, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 7)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerVideoPlayer); this.setEndToItemIndex(this.mainPlayList, 7, 8)",
   "media": "this.video_6D28BB12_5C4D_9783_41D4_8A27FA748C2B",
   "player": "this.MainViewerVideoPlayer"
  },
  {
   "class": "PhotoAlbumPlayListItem",
   "media": "this.album_623D971A_5DD7_9F83_417C_6FB0FF992743",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 8, 9)",
   "player": "this.MainViewerPhotoAlbumPlayer"
  },
  {
   "class": "VideoPlayListItem",
   "start": "this.MainViewerVideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 9, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 9)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerVideoPlayer); this.setEndToItemIndex(this.mainPlayList, 9, 10)",
   "media": "this.video_636358BB_5DD5_9281_41D0_CDF25C2DBC6B",
   "player": "this.MainViewerVideoPlayer"
  },
  {
   "class": "PhotoAlbumPlayListItem",
   "media": "this.album_6076EEE4_5DF7_EE80_41C0_70404B70EF36",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 10, 11)",
   "player": "this.MainViewerPhotoAlbumPlayer"
  },
  {
   "class": "VideoPlayListItem",
   "end": "this.trigger('tourEnded')",
   "start": "this.MainViewerVideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 11, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 11)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerVideoPlayer); this.setEndToItemIndex(this.mainPlayList, 11, 0)",
   "media": "this.video_6138AF13_5DF4_6F81_41CF_B052B4DA69FF",
   "player": "this.MainViewerVideoPlayer"
  }
 ],
 "id": "mainPlayList"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
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
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 1024
   }
  ]
 },
 "pitch": -1.35,
 "popupMaxWidth": "95%",
 "yaw": 85.18,
 "showDuration": 500
},
{
 "thumbnailUrl": "media/album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_4_t.jpg",
 "class": "Photo",
 "duration": 5000,
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
 "height": 338
},
{
 "class": "Container",
 "paddingLeft": 0,
 "borderRadius": 0,
 "children": [
  "this.Container_7DE3959A_6911_E2E0_41D2_9D01577E4575",
  "this.Container_7DE3A59A_6911_E2E0_41D8_A93A28426D33"
 ],
 "scrollBarWidth": 10,
 "id": "Container_7DE3E59A_6911_E2E0_41D7_0925C3250BD2",
 "left": "12%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "shadowColor": "#000000",
 "right": "12%",
 "scrollBarColor": "#000000",
 "shadowHorizontalLength": 0,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "gap": 0,
 "shadowVerticalLength": 0,
 "shadowOpacity": 0.3,
 "paddingRight": 0,
 "top": "10%",
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": "10%",
 "verticalAlign": "top",
 "shadowBlurRadius": 25,
 "paddingBottom": 0,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "shadow": true,
 "shadowSpread": 1,
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "Global"
 },
 "layout": "horizontal",
 "backgroundOpacity": 1
},
{
 "class": "Window",
 "paddingTop": 0,
 "scrollBarMargin": 2,
 "id": "window_6A325B13_5C7C_B781_41BD_00CC4BEAF25C",
 "width": 400,
 "veilColor": [
  "#000000",
  "#000000"
 ],
 "veilHideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 500
 },
 "gap": 10,
 "veilShowEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 500
 },
 "headerPaddingLeft": 10,
 "scrollBarColor": "#000000",
 "headerBackgroundColorDirection": "vertical",
 "footerBackgroundColor": [
  "#FFFFFF",
  "#EEEEEE",
  "#DDDDDD"
 ],
 "minHeight": 20,
 "borderSize": 0,
 "shadowOpacity": 0.5,
 "headerVerticalAlign": "middle",
 "horizontalAlign": "center",
 "shadowHorizontalLength": 3,
 "bodyPaddingTop": 0,
 "headerPaddingRight": 0,
 "bodyPaddingRight": 0,
 "bodyPaddingBottom": 0,
 "titleFontWeight": "normal",
 "shadowVerticalLength": 0,
 "modal": true,
 "paddingRight": 0,
 "backgroundColor": [],
 "titlePaddingRight": 5,
 "title": "",
 "minWidth": 20,
 "closeButtonPressedBackgroundColorRatios": [
  0
 ],
 "headerBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "height": 600,
 "closeButtonPressedBackgroundColor": [],
 "veilOpacity": 0.4,
 "headerBackgroundOpacity": 0,
 "closeButtonPressedIconLineWidth": 3,
 "propagateClick": false,
 "titlePaddingTop": 5,
 "closeButtonBackgroundColor": [],
 "headerBorderColor": "#000000",
 "shadow": true,
 "titleTextDecoration": "none",
 "titleFontFamily": "Arial",
 "bodyPaddingLeft": 0,
 "scrollBarWidth": 10,
 "closeButtonBorderRadius": 11,
 "footerBackgroundColorRatios": [
  0,
  0.9,
  1
 ],
 "backgroundOpacity": 1,
 "closeButtonIconWidth": 20,
 "closeButtonPressedIconColor": "#FFFFFF",
 "layout": "vertical",
 "borderRadius": 5,
 "children": [
  "this.container_A3CCF1A8_B693_A604_41D4_1F994483516A"
 ],
 "headerBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "bodyBackgroundColorRatios": [
  0,
  0.5,
  1
 ],
 "closeButtonIconHeight": 20,
 "bodyBackgroundColorDirection": "vertical",
 "shadowColor": "#000000",
 "backgroundColorRatios": [],
 "closeButtonRollOverBackgroundColor": [],
 "closeButtonIconLineWidth": 2,
 "veilColorRatios": [
  0,
  1
 ],
 "closeButtonRollOverBackgroundColorRatios": [
  0
 ],
 "footerHeight": 5,
 "bodyBackgroundOpacity": 0,
 "headerPaddingBottom": 5,
 "hideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 500
 },
 "contentOpaque": false,
 "titlePaddingLeft": 5,
 "titleFontStyle": "normal",
 "headerBorderSize": 0,
 "verticalAlign": "middle",
 "shadowBlurRadius": 6,
 "paddingBottom": 0,
 "bodyBackgroundColor": [
  "#FFFFFF",
  "#DDDDDD",
  "#FFFFFF"
 ],
 "closeButtonBackgroundColorRatios": [],
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "titleFontSize": "1.29vmin",
 "backgroundColorDirection": "vertical",
 "footerBackgroundOpacity": 0,
 "titleFontColor": "#000000",
 "closeButtonIconColor": "#B2B2B2",
 "veilColorDirection": "horizontal",
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 500
 },
 "titlePaddingBottom": 5,
 "headerPaddingTop": 10,
 "footerBackgroundColorDirection": "vertical",
 "overflow": "scroll",
 "closeButtonRollOverIconColor": "#FFFFFF",
 "paddingLeft": 0,
 "data": {
  "name": "Window49332"
 },
 "shadowSpread": 1
},
{
 "class": "MediaAudio",
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_41D5ADEE_5F68_3FA0_41BA_A36CE8A90C09.mp3",
  "class": "AudioResource",
  "oggUrl": "media/audio_41D5ADEE_5F68_3FA0_41BA_A36CE8A90C09.ogg"
 },
 "id": "audio_41D5ADEE_5F68_3FA0_41BA_A36CE8A90C09",
 "data": {
  "label": "Stylish Powerful Indie Rock (Full)"
 }
},
{
 "class": "HTMLText",
 "borderRadius": 0,
 "id": "HTMLText_7DE3759A_6911_E2E0_41A7_C2659986BA1F",
 "paddingLeft": 0,
 "width": "100%",
 "scrollBarColor": "#FF0000",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 0,
 "minWidth": 1,
 "paddingBottom": 10,
 "scrollBarOpacity": 0.2,
 "scrollBarVisible": "rollOver",
 "height": "100%",
 "propagateClick": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "HTMLText"
 },
 "paddingTop": 0,
 "shadow": false,
 "scrollBarWidth": 10,
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:center;\"><SPAN STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:2.71vw;font-family:'Exo';\"><B><I>CHACOMER</I></B></SPAN></SPAN></DIV><DIV STYLE=\"text-align:center;\"><SPAN STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#e7392b;font-size:1.09vw;font-family:'Exo';\"><B><I>Chacomer SAE - Comagro - Chacomer Automotores - R\u00edo Sur - Los Pioneros, Atlantic - Alas </I></B></SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:0.97vw;\"><BR STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-size:5vw;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:0.9vw;font-family:'Roboto Medium';\">Ubicado en el coraz\u00f3n de Am\u00e9rica del Sur, Paraguay es un pa\u00eds que re\u00fane las condiciones socioecon\u00f3micas ideales para el crecimiento de la industria y los negocios en una superficie de 406.752 km2, con 7 millones de habitantes.</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:0.9vw;\"><BR STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-size:5vw;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:0.9vw;font-family:'Roboto Medium';\">Es all\u00ed donde en 1956 se funda Chacomer por el Sr. Cornelius Walde.Con una cultura transparente de hacer negocios, basada en principios b\u00edblicos que nos gu\u00edan, y fuertes valores como Integridad, Efectividad, Lealtad, esp\u00edritu Innovador y Responsabilidad Social Medioambiental, que nos destacan y nos permiten marcar pautas a seguir por toda la industria.</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:0.9vw;\"><BR STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-size:5vw;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:0.9vw;font-family:'Roboto Medium';\">Nuestra visi\u00f3n es ser una Empresa competitiva con dimensi\u00f3n internacional que opera a trav\u00e9s de equipos humanos de alto rendimiento, calidad y excelencia. Buscar la calidad como ejemplo cristiano en el mercado global, obteniendo resultados para crecimiento de la Empresa y sus componentes.</SPAN></SPAN></DIV></div>",
 "backgroundOpacity": 0
},
{
 "class": "Window",
 "paddingTop": 0,
 "scrollBarMargin": 2,
 "id": "window_BE1D2742_B591_AA04_41E1_9A06C5F2E580",
 "headerPaddingLeft": 10,
 "veilColor": [
  "#000000",
  "#000000"
 ],
 "veilHideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 500
 },
 "gap": 10,
 "veilShowEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 500
 },
 "footerBackgroundColor": [
  "#FFFFFF",
  "#EEEEEE",
  "#DDDDDD"
 ],
 "scrollBarColor": "#000000",
 "headerBackgroundColorDirection": "vertical",
 "closeButtonRollOverBorderSize": 0,
 "closeButtonBackgroundColorDirection": "vertical",
 "minHeight": 20,
 "borderSize": 0,
 "shadowOpacity": 0.5,
 "headerVerticalAlign": "middle",
 "horizontalAlign": "center",
 "closeButtonPressedBorderColor": "#000000",
 "bodyPaddingTop": 0,
 "headerPaddingRight": 0,
 "bodyPaddingRight": 0,
 "bodyPaddingBottom": 0,
 "closeButtonPressedBorderSize": 0,
 "closeButtonPaddingLeft": 5,
 "closeButtonPressedBackgroundColorDirection": "vertical",
 "shadowVerticalLength": 0,
 "modal": true,
 "paddingRight": 0,
 "minWidth": 20,
 "titlePaddingRight": 5,
 "closeButtonPaddingTop": 5,
 "backgroundColor": [],
 "closeButtonPressedBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "headerBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "closeButtonPressedBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "veilOpacity": 0.4,
 "headerBackgroundOpacity": 0,
 "closeButtonPressedIconLineWidth": 5,
 "propagateClick": false,
 "titlePaddingTop": 5,
 "closeButtonBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "shadowHorizontalLength": 3,
 "closeButtonBackgroundOpacity": 0.3,
 "shadow": true,
 "titleFontFamily": "Arial",
 "bodyPaddingLeft": 0,
 "scrollBarWidth": 10,
 "closeButtonBorderRadius": 0,
 "footerBackgroundColorRatios": [
  0,
  0.9,
  1
 ],
 "backgroundOpacity": 1,
 "closeButtonIconWidth": 20,
 "closeButtonPressedIconColor": "#888888",
 "closeButtonRollOverBorderColor": "#000000",
 "borderRadius": 5,
 "closeButtonRollOverBackgroundOpacity": 0.3,
 "children": [
  "this.viewer_uidA3CF21A7_B693_A60C_41D7_EA1BF066520D"
 ],
 "headerBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "bodyBackgroundColorRatios": [
  0,
  0.5,
  1
 ],
 "closeButtonIconHeight": 20,
 "bodyBackgroundColorDirection": "vertical",
 "shadowColor": "#000000",
 "backgroundColorRatios": [],
 "closeButtonRollOverBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "closeButtonIconLineWidth": 5,
 "closeButtonRollOverIconLineWidth": 5,
 "veilColorRatios": [
  0,
  1
 ],
 "closeButtonRollOverBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "layout": "vertical",
 "closeButtonBorderColor": "#000000",
 "footerHeight": 5,
 "bodyBackgroundOpacity": 0,
 "headerPaddingBottom": 5,
 "closeButtonPressedBackgroundOpacity": 0.3,
 "hideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 500
 },
 "contentOpaque": false,
 "titlePaddingLeft": 5,
 "closeButtonPaddingBottom": 5,
 "verticalAlign": "middle",
 "shadowBlurRadius": 6,
 "paddingBottom": 0,
 "bodyBackgroundColor": [
  "#FFFFFF",
  "#DDDDDD",
  "#FFFFFF"
 ],
 "closeButtonBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "titleFontSize": "1.29vmin",
 "backgroundColorDirection": "vertical",
 "footerBackgroundOpacity": 0,
 "closeButtonBorderSize": 0,
 "closeButtonPaddingRight": 5,
 "closeButtonIconColor": "#000000",
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 500
 },
 "titlePaddingBottom": 5,
 "headerPaddingTop": 10,
 "footerBackgroundColorDirection": "vertical",
 "overflow": "scroll",
 "closeButtonRollOverIconColor": "#666666",
 "paddingLeft": 0,
 "data": {
  "name": "Window534"
 },
 "shadowSpread": 1,
 "closeButtonRollOverBackgroundColorDirection": "vertical"
},
{
 "class": "Container",
 "paddingLeft": 50,
 "borderRadius": 0,
 "children": [
  "this.Container_7DE3459A_6911_E2E0_41CE_F97D3E361A8D"
 ],
 "scrollBarWidth": 10,
 "id": "Container_7DE3A59A_6911_E2E0_41D8_A93A28426D33",
 "width": "35%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "gap": 0,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "scrollBarColor": "#0069A3",
 "paddingRight": 50,
 "horizontalAlign": "left",
 "contentOpaque": false,
 "minWidth": 1,
 "verticalAlign": "top",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.51,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "height": "100%",
 "overflow": "visible",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "-right"
 },
 "shadow": false,
 "layout": "vertical",
 "backgroundOpacity": 1
},
{
 "from": "top",
 "class": "SlideInEffect",
 "easing": "cubic_in",
 "id": "effect_A4915BD3_B5AF_BA04_41D0_3C41B920ADD8",
 "duration": 500
},
{
 "class": "Window",
 "paddingTop": 0,
 "scrollBarMargin": 2,
 "id": "window_BE00D746_B591_AA0C_41D4_C30EFB05E4C6",
 "headerPaddingLeft": 10,
 "veilColor": [
  "#000000",
  "#000000"
 ],
 "veilHideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 500
 },
 "gap": 10,
 "veilShowEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 500
 },
 "footerBackgroundColor": [
  "#FFFFFF",
  "#EEEEEE",
  "#DDDDDD"
 ],
 "scrollBarColor": "#000000",
 "headerBackgroundColorDirection": "vertical",
 "closeButtonRollOverBorderSize": 0,
 "closeButtonBackgroundColorDirection": "vertical",
 "minHeight": 20,
 "borderSize": 0,
 "shadowOpacity": 0.5,
 "headerVerticalAlign": "middle",
 "horizontalAlign": "center",
 "closeButtonPressedBorderColor": "#000000",
 "bodyPaddingTop": 0,
 "headerPaddingRight": 0,
 "bodyPaddingRight": 0,
 "bodyPaddingBottom": 0,
 "closeButtonPressedBorderSize": 0,
 "closeButtonPaddingLeft": 5,
 "closeButtonPressedBackgroundColorDirection": "vertical",
 "shadowVerticalLength": 0,
 "modal": true,
 "paddingRight": 0,
 "minWidth": 20,
 "titlePaddingRight": 5,
 "closeButtonPaddingTop": 5,
 "backgroundColor": [],
 "closeButtonPressedBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "headerBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "closeButtonPressedBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "veilOpacity": 0.4,
 "headerBackgroundOpacity": 0,
 "closeButtonPressedIconLineWidth": 5,
 "propagateClick": false,
 "titlePaddingTop": 5,
 "closeButtonBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "shadowHorizontalLength": 3,
 "closeButtonBackgroundOpacity": 0.3,
 "shadow": true,
 "titleFontFamily": "Arial",
 "bodyPaddingLeft": 0,
 "scrollBarWidth": 10,
 "closeButtonBorderRadius": 0,
 "footerBackgroundColorRatios": [
  0,
  0.9,
  1
 ],
 "backgroundOpacity": 1,
 "closeButtonIconWidth": 20,
 "closeButtonPressedIconColor": "#888888",
 "closeButtonRollOverBorderColor": "#000000",
 "borderRadius": 5,
 "closeButtonRollOverBackgroundOpacity": 0.3,
 "children": [
  "this.viewer_uidA3C0B1AB_B693_A604_41C9_8F6EE6EDEC12"
 ],
 "headerBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "bodyBackgroundColorRatios": [
  0,
  0.5,
  1
 ],
 "closeButtonIconHeight": 20,
 "bodyBackgroundColorDirection": "vertical",
 "shadowColor": "#000000",
 "backgroundColorRatios": [],
 "closeButtonRollOverBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "closeButtonIconLineWidth": 5,
 "closeButtonRollOverIconLineWidth": 5,
 "veilColorRatios": [
  0,
  1
 ],
 "closeButtonRollOverBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "layout": "vertical",
 "closeButtonBorderColor": "#000000",
 "footerHeight": 5,
 "bodyBackgroundOpacity": 0,
 "headerPaddingBottom": 5,
 "closeButtonPressedBackgroundOpacity": 0.3,
 "hideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 500
 },
 "contentOpaque": false,
 "titlePaddingLeft": 5,
 "closeButtonPaddingBottom": 5,
 "verticalAlign": "middle",
 "shadowBlurRadius": 6,
 "paddingBottom": 0,
 "bodyBackgroundColor": [
  "#FFFFFF",
  "#DDDDDD",
  "#FFFFFF"
 ],
 "closeButtonBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "titleFontSize": "1.29vmin",
 "backgroundColorDirection": "vertical",
 "footerBackgroundOpacity": 0,
 "closeButtonBorderSize": 0,
 "closeButtonPaddingRight": 5,
 "closeButtonIconColor": "#000000",
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 500
 },
 "titlePaddingBottom": 5,
 "headerPaddingTop": 10,
 "footerBackgroundColorDirection": "vertical",
 "overflow": "scroll",
 "closeButtonRollOverIconColor": "#666666",
 "paddingLeft": 0,
 "data": {
  "name": "Window538"
 },
 "shadowSpread": 1,
 "closeButtonRollOverBackgroundColorDirection": "vertical"
},
{
 "class": "ViewerArea",
 "transitionMode": "blending",
 "playbackBarBottom": 5,
 "id": "MainViewer",
 "left": 0,
 "width": "100%",
 "toolTipShadowHorizontalLength": 0,
 "playbackBarHeadShadow": true,
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowVerticalLength": 0,
 "minHeight": 50,
 "borderSize": 0,
 "playbackBarHeadShadowHorizontalLength": 0,
 "toolTipBorderRadius": 3,
 "paddingRight": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderColor": "#000000",
 "toolTipPaddingLeft": 6,
 "vrPointerSelectionTime": 2000,
 "minWidth": 100,
 "playbackBarHeadWidth": 6,
 "progressBorderSize": 0,
 "toolTipDisplayTime": 600,
 "firstTransitionDuration": 0,
 "toolTipFontStyle": "normal",
 "progressLeft": 0,
 "playbackBarHeadShadowColor": "#000000",
 "toolTipShadowBlurRadius": 3,
 "progressBarBorderColor": "#000000",
 "playbackBarBorderRadius": 0,
 "progressBottom": 0,
 "toolTipBackgroundColor": "#F6F6F6",
 "toolTipFontWeight": "normal",
 "height": "100%",
 "propagateClick": false,
 "toolTipPaddingTop": 4,
 "playbackBarBackgroundColorDirection": "vertical",
 "toolTipBorderSize": 1,
 "toolTipPaddingBottom": 4,
 "toolTipFontFamily": "Arial",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "transitionDuration": 500,
 "progressRight": 0,
 "toolTipFontSize": 12,
 "progressHeight": 10,
 "playbackBarProgressBorderSize": 0,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "playbackBarRight": 0,
 "progressBarBorderRadius": 0,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "shadow": false,
 "playbackBarHeadShadowVerticalLength": 0,
 "borderRadius": 0,
 "playbackBarProgressOpacity": 1,
 "playbackBarHeadBorderRadius": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBackgroundOpacity": 1,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "progressOpacity": 1,
 "playbackBarBorderSize": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "toolTipTextShadowOpacity": 0,
 "toolTipOpacity": 1,
 "playbackBarHeadBorderSize": 0,
 "top": 0,
 "progressBarOpacity": 1,
 "progressBorderRadius": 0,
 "toolTipFontColor": "#606060",
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "playbackBarHeadShadowBlurRadius": 3,
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadOpacity": 1,
 "vrPointerSelectionColor": "#FF6600",
 "progressBackgroundColorRatios": [
  0
 ],
 "playbackBarLeft": 0,
 "toolTipPaddingRight": 6,
 "toolTipShadowColor": "#333333",
 "vrPointerColor": "#FFFFFF",
 "progressBarBackgroundColorDirection": "vertical",
 "playbackBarHeadHeight": 15,
 "toolTipBorderColor": "#767676",
 "paddingBottom": 0,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipTextShadowBlurRadius": 3,
 "progressBarBorderSize": 0,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "data": {
  "name": "Main Viewer"
 },
 "toolTipShadowOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "paddingLeft": 0,
 "playbackBarHeight": 10,
 "paddingTop": 0,
 "toolTipShadowSpread": 0,
 "progressBackgroundColorDirection": "vertical"
},
{
 "class": "HTMLText",
 "borderRadius": 0,
 "id": "HTMLText_524CEEAF_7E31_E3D9_41D5_A18634B5A288",
 "left": 10,
 "width": 546,
 "paddingLeft": 10,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 0,
 "top": 96,
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": 85,
 "propagateClick": false,
 "data": {
  "name": "-STICKER"
 },
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "shadow": false,
 "scrollBarWidth": 10,
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-shadow:0px 0px 15px rgba(0,0,0,0.6);text-align:left;\"><SPAN STYLE=\"letter-spacing:0vmin; white-space:pre-wrap;color:#000000;font-family:'Segoe UI';\"><SPAN STYLE=\"color:#e7392b;font-size:5.25vmin;font-family:'Exo';\"><B><I>YAMAHA</I></B></SPAN></SPAN></DIV></div>",
 "backgroundOpacity": 0
},
{
 "class": "Container",
 "paddingLeft": 0,
 "borderRadius": 0,
 "children": [
  "this.Container_48EF2E0A_5FEC_9B11_41D5_519E55AFBC97"
 ],
 "scrollBarWidth": 10,
 "id": "Container_48EFCE0A_5FEC_9B11_41A1_24A9E81FF4B2",
 "left": "5%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "shadowColor": "#000000",
 "right": "5%",
 "scrollBarColor": "#000000",
 "shadowHorizontalLength": 0,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "gap": 0,
 "shadowVerticalLength": 0,
 "shadowOpacity": 0.3,
 "paddingRight": 0,
 "top": "5%",
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": "5%",
 "verticalAlign": "top",
 "shadowBlurRadius": 25,
 "paddingBottom": 0,
 "horizontalAlign": "left",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "shadow": true,
 "shadowSpread": 1,
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "Global"
 },
 "layout": "horizontal",
 "backgroundOpacity": 1
},
{
 "class": "MediaAudio",
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_749A3B4A_5DBC_9783_41C8_F9FEE5038B8C.mp3",
  "class": "AudioResource",
  "oggUrl": "media/audio_749A3B4A_5DBC_9783_41C8_F9FEE5038B8C.ogg"
 },
 "id": "audio_749A3B4A_5DBC_9783_41C8_F9FEE5038B8C",
 "data": {
  "label": "Yamaha MT03"
 }
},
{
 "thumbnailUrl": "media/album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_2_t.jpg",
 "class": "Photo",
 "duration": 5000,
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
 "height": 338
},
{
 "class": "Container",
 "visible": false,
 "borderRadius": 0,
 "children": [
  "this.IconButton_2E6041ED_347D_0EFF_41BF_3C82AFA80CBB",
  "this.IconButton_2E60B1ED_347D_0EFF_41C3_3E7369236DCE",
  "this.IconButton_2E60A1ED_347D_0EFF_41BC_A36ED8CE8127",
  "this.IconButton_2E6091ED_347D_0EFF_41C6_E6D253232DA1",
  "this.IconButton_2E6081ED_347D_0EFF_41AA_ECC3AD42DC4D",
  "this.IconButton_2E60F1ED_347D_0EFF_41C9_4BA017DDD347",
  "this.IconButton_2E60E1EE_347D_0EFC_41C3_A8DD2E2819ED"
 ],
 "id": "Container_2E6011ED_347D_0EFF_41C9_5AC77536D968",
 "paddingLeft": 0,
 "width": "91.304%",
 "right": "0%",
 "scrollBarColor": "#000000",
 "gap": 3,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "contentOpaque": false,
 "bottom": "0%",
 "verticalAlign": "top",
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": "85.959%",
 "propagateClick": false,
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "down"
 },
 "shadow": false,
 "scrollBarWidth": 10,
 "layout": "vertical",
 "backgroundOpacity": 0
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_53439A1A_5C54_B183_41C4_02C53D863FE2",
 "id": "panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 95,
  "yaw": 0.7,
  "pitch": -23.73
 }
},
{
 "class": "Container",
 "paddingLeft": 0,
 "borderRadius": 0,
 "children": [
  "this.Container_48EFCE0A_5FEC_9B11_41A1_24A9E81FF4B2",
  "this.Container_48EEBE0A_5FEC_9B11_41D0_96FC83B0AD00"
 ],
 "scrollBarWidth": 10,
 "id": "Container_48EE9E0B_5FEC_9B17_41D6_DE3A0A569909",
 "left": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "right": "0%",
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "top": "0%",
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": "0%",
 "verticalAlign": "top",
 "horizontalAlign": "left",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "click": "this.setComponentVisibility(this.Container_48EE9E0B_5FEC_9B17_41D6_DE3A0A569909, false, 0, null, null, false)",
 "propagateClick": true,
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "---360mt03"
 },
 "shadow": false,
 "visible": false,
 "layout": "absolute",
 "backgroundOpacity": 0.6
},
{
 "thumbnailUrl": "media/album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_1_t.jpg",
 "class": "Photo",
 "duration": 5000,
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
 "height": 338
},
{
 "touchControlMode": "drag_rotation",
 "class": "PanoramaPlayer",
 "gyroscopeVerticalDraggingEnabled": true,
 "buttonToggleHotspots": "this.IconButton_2E6091ED_347D_0EFF_41C6_E6D253232DA1",
 "viewerArea": "this.MainViewer",
 "displayPlaybackBar": true,
 "buttonCardboardView": "this.IconButton_2E6041ED_347D_0EFF_41BF_3C82AFA80CBB",
 "id": "MainViewerPanoramaPlayer",
 "mouseControlMode": "drag_rotation",
 "buttonToggleGyroscope": "this.IconButton_2E60B1ED_347D_0EFF_41C3_3E7369236DCE"
},
{
 "thumbnailUrl": "media/album_705F61E7_5C4C_9281_41D4_67432D954851_0_t.jpg",
 "class": "Photo",
 "duration": 5000,
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
 "height": 846
},
{
 "class": "PlayList",
 "items": [
  {
   "class": "VideoPlayListItem",
   "start": "this.viewer_uidA3CD61A9_B693_A604_41E5_9F16A3775C27VideoPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.playList_A559D532_B591_AE04_41E0_0F11C1A66A4A, 0, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.playList_A559D532_B591_AE04_41E0_0F11C1A66A4A, 0)",
   "begin": "this.fixTogglePlayPauseButton(this.viewer_uidA3CD61A9_B693_A604_41E5_9F16A3775C27VideoPlayer)",
   "media": "this.video_6D28BB12_5C4D_9783_41D4_8A27FA748C2B",
   "player": "this.viewer_uidA3CD61A9_B693_A604_41E5_9F16A3775C27VideoPlayer"
  }
 ],
 "id": "playList_A559D532_B591_AE04_41E0_0F11C1A66A4A"
},
{
 "class": "FadeInEffect",
 "easing": "linear",
 "id": "effect_4635488F_5FE7_872E_41C1_FF3ECDA34F01",
 "duration": 500
},
{
 "class": "IconButton",
 "paddingLeft": 0,
 "maxHeight": 58,
 "id": "IconButton_2E6081ED_347D_0EFF_41AA_ECC3AD42DC4D",
 "width": 58,
 "borderRadius": 0,
 "iconURL": "skin/IconButton_2E6081ED_347D_0EFF_41AA_ECC3AD42DC4D.png",
 "minHeight": 1,
 "borderSize": 0,
 "paddingRight": 0,
 "horizontalAlign": "center",
 "transparencyActive": true,
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
 "paddingTop": 0,
 "pressedRollOverIconURL": "skin/IconButton_2E6081ED_347D_0EFF_41AA_ECC3AD42DC4D_pressed.png",
 "shadow": false,
 "cursor": "hand",
 "maxWidth": 58,
 "backgroundOpacity": 0
},
{
 "class": "Label",
 "paddingLeft": 0,
 "fontFamily": "Arial",
 "id": "Label_A4D1C762_B592_AA04_41C6_FF649581B19E",
 "width": "72.199%",
 "borderRadius": 0,
 "minHeight": 1,
 "borderSize": 0,
 "text": "¿Que estas Buscando?",
 "paddingRight": 0,
 "fontColor": "#000000",
 "horizontalAlign": "center",
 "verticalAlign": "middle",
 "minWidth": 1,
 "paddingBottom": 0,
 "fontSize": "1.7vmin",
 "click": "this.setComponentVisibility(this.Container_BA602572_B591_6E04_41E5_3B3D95AF66C0, true, 0, this.effect_A78A24EF_B591_AE1B_41A5_2B61DD9A2922, 'showEffect', false); this.setComponentVisibility(this.Container_A4369CCB_B591_DE04_41D4_C21B82E1EAFF, false, 0, this.effect_A711BF3A_B591_5A04_41E1_1C95DD2C5279, 'hideEffect', false)",
 "fontStyle": "normal",
 "height": "100%",
 "propagateClick": false,
 "data": {
  "name": "queestasbuscando"
 },
 "textDecoration": "none",
 "paddingTop": 0,
 "shadow": false,
 "cursor": "hand",
 "fontWeight": "bold",
 "backgroundOpacity": 0
},
{
 "class": "SlideOutEffect",
 "easing": "linear",
 "id": "effect_A711BF3A_B591_5A04_41E1_1C95DD2C5279",
 "to": "top",
 "duration": 500
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialSequence": "this.sequence_A00BC1EE_B693_A61C_41CD_A9C695D2E381",
 "id": "camera_A00BB1ED_B693_A61C_41D7_75B49C57F97D",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 95,
  "yaw": -179.37,
  "pitch": 0
 }
},
{
 "class": "UIComponent",
 "paddingLeft": 0,
 "borderRadius": 0,
 "id": "veilPopupPanorama",
 "left": 0,
 "backgroundColorRatios": [
  0
 ],
 "right": 0,
 "minHeight": 0,
 "borderSize": 0,
 "paddingRight": 0,
 "top": 0,
 "minWidth": 0,
 "bottom": 0,
 "paddingBottom": 0,
 "backgroundColor": [
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 350
 },
 "data": {
  "name": "UIComponent20979"
 },
 "paddingTop": 0,
 "shadow": false,
 "visible": false,
 "backgroundOpacity": 0.55
},
{
 "class": "ZoomImage",
 "paddingLeft": 0,
 "borderRadius": 0,
 "id": "zoomImagePopupPanorama",
 "left": 0,
 "backgroundColorRatios": [],
 "right": 0,
 "minHeight": 0,
 "borderSize": 0,
 "paddingRight": 0,
 "top": 0,
 "minWidth": 0,
 "bottom": 0,
 "paddingBottom": 0,
 "backgroundColor": [],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "scaleMode": "custom",
 "data": {
  "name": "ZoomImage20980"
 },
 "paddingTop": 0,
 "shadow": false,
 "visible": false,
 "backgroundOpacity": 1
},
{
 "class": "CloseButton",
 "paddingLeft": 5,
 "borderRadius": 0,
 "fontSize": "1.29vmin",
 "data": {
  "name": "CloseButton20981"
 },
 "id": "closeButtonPopupPanorama",
 "rollOverIconColor": "#666666",
 "shadowColor": "#000000",
 "fontFamily": "Arial",
 "backgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "right": 10,
 "layout": "horizontal",
 "minHeight": 0,
 "borderSize": 0,
 "iconLineWidth": 5,
 "gap": 5,
 "borderColor": "#000000",
 "paddingRight": 5,
 "fontColor": "#FFFFFF",
 "top": 10,
 "iconBeforeLabel": true,
 "minWidth": 0,
 "mode": "push",
 "verticalAlign": "middle",
 "horizontalAlign": "center",
 "shadowBlurRadius": 6,
 "paddingBottom": 5,
 "pressedIconColor": "#888888",
 "backgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "backgroundColorDirection": "vertical",
 "label": "",
 "fontStyle": "normal",
 "propagateClick": false,
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 350
 },
 "iconHeight": 20,
 "iconColor": "#000000",
 "textDecoration": "none",
 "shadowSpread": 1,
 "paddingTop": 5,
 "iconWidth": 20,
 "shadow": false,
 "visible": false,
 "cursor": "hand",
 "fontWeight": "normal",
 "backgroundOpacity": 0.3
},
{
 "class": "PhotoAlbumPlayListItem",
 "begin": "this.updateMediaLabelFromPlayList(this.album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_AlbumPlayList, this.htmltext_A3C121AC_B693_A61C_41E6_25BBA312DE9A, this.albumitem_A3C191AB_B693_A604_41A2_340DE9C236ED); this.loopAlbum(this.playList_A55D8535_B591_AE0C_41DC_8DC0B36150A0, 0)",
 "media": "this.album_6076EEE4_5DF7_EE80_41C0_70404B70EF36",
 "player": "this.viewer_uidA3C061AB_B693_A604_41B5_E2C6522E3154PhotoAlbumPlayer",
 "id": "albumitem_A3C191AB_B693_A604_41A2_340DE9C236ED"
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A0516241_B693_AA07_41D4_FF6C7804D1FA",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PhotoAlbumPlayListItem",
 "begin": "this.updateMediaLabelFromPlayList(this.album_705F61E7_5C4C_9281_41D4_67432D954851_AlbumPlayList, this.htmltext_A3CE11A6_B693_A60C_41CD_C7283FF4D447, this.albumitem_A3CE91A5_B693_A60C_41E3_31D8FEC5C148); this.loopAlbum(this.playList_A557A525_B591_AE0F_41BB_E70F4F106F5D, 0)",
 "media": "this.album_705F61E7_5C4C_9281_41D4_67432D954851",
 "player": "this.viewer_uidA3CE81A5_B693_A60C_41DE_F4C372E71AD2PhotoAlbumPlayer",
 "id": "albumitem_A3CE91A5_B693_A60C_41E3_31D8FEC5C148"
},
{
 "class": "VideoPlayer",
 "displayPlaybackBar": true,
 "id": "viewer_uidA3CF21A7_B693_A60C_41D7_EA1BF066520DVideoPlayer",
 "viewerArea": "this.viewer_uidA3CF21A7_B693_A60C_41D7_EA1BF066520D"
},
{
 "class": "PhotoPlayList",
 "items": [
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_0",
   "camera": {
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.38",
     "zoomFactor": 1.1,
     "y": "0.32"
    },
    "duration": 5000,
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_1",
   "camera": {
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.74",
     "zoomFactor": 1.1,
     "y": "0.26"
    },
    "duration": 5000,
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_2",
   "camera": {
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.35",
     "zoomFactor": 1.1,
     "y": "0.52"
    },
    "duration": 5000,
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_3",
   "camera": {
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.32",
     "zoomFactor": 1.1,
     "y": "0.61"
    },
    "duration": 5000,
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_4",
   "camera": {
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.56",
     "zoomFactor": 1.1,
     "y": "0.54"
    },
    "duration": 5000,
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_5",
   "camera": {
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.74",
     "zoomFactor": 1.1,
     "y": "0.75"
    },
    "duration": 5000,
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside"
   }
  }
 ],
 "id": "album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_AlbumPlayList"
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A02EF21F_B693_AA3C_41D4_AEA42AA09E8E",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_535C5A1A_5C54_B183_41B4_3072914924C6",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PhotoPlayList",
 "items": [
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_0",
   "camera": {
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.53",
     "zoomFactor": 1.1,
     "y": "0.73"
    },
    "duration": 5000,
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_1",
   "camera": {
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.37",
     "zoomFactor": 1.1,
     "y": "0.51"
    },
    "duration": 5000,
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_2",
   "camera": {
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.66",
     "zoomFactor": 1.1,
     "y": "0.27"
    },
    "duration": 5000,
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside"
   }
  }
 ],
 "id": "album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_AlbumPlayList"
},
{
 "class": "ViewerArea",
 "paddingTop": 0,
 "transitionMode": "blending",
 "playbackBarBottom": 0,
 "id": "viewer_uidA3CD61A9_B693_A604_41E5_9F16A3775C27",
 "width": "100%",
 "toolTipShadowHorizontalLength": 0,
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowVerticalLength": 0,
 "minHeight": 50,
 "borderSize": 0,
 "playbackBarHeadShadowHorizontalLength": 0,
 "toolTipBorderRadius": 3,
 "paddingRight": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderColor": "#000000",
 "toolTipPaddingLeft": 6,
 "vrPointerSelectionTime": 2000,
 "minWidth": 100,
 "playbackBarHeadWidth": 6,
 "progressBorderSize": 0,
 "toolTipDisplayTime": 600,
 "firstTransitionDuration": 0,
 "toolTipFontStyle": "normal",
 "progressLeft": 0,
 "playbackBarHeadShadowColor": "#000000",
 "toolTipShadowBlurRadius": 3,
 "progressBarBorderColor": "#000000",
 "playbackBarBorderRadius": 0,
 "progressBottom": 2,
 "toolTipBackgroundColor": "#F6F6F6",
 "toolTipFontWeight": "normal",
 "height": "100%",
 "propagateClick": false,
 "toolTipPaddingTop": 4,
 "playbackBarBackgroundColorDirection": "vertical",
 "toolTipBorderSize": 1,
 "toolTipPaddingBottom": 4,
 "toolTipFontFamily": "Arial",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "transitionDuration": 500,
 "progressRight": 0,
 "toolTipFontSize": "1.11vmin",
 "progressHeight": 10,
 "playbackBarProgressBorderSize": 0,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "playbackBarRight": 0,
 "progressBarBorderRadius": 0,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "shadow": false,
 "playbackBarHeadShadowVerticalLength": 0,
 "borderRadius": 0,
 "playbackBarProgressOpacity": 1,
 "playbackBarHeadBorderRadius": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBackgroundOpacity": 1,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "progressOpacity": 1,
 "playbackBarBorderSize": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "toolTipTextShadowOpacity": 0,
 "toolTipOpacity": 1,
 "playbackBarHeadBorderSize": 0,
 "vrPointerSelectionColor": "#FF6600",
 "progressBarOpacity": 1,
 "progressBorderRadius": 0,
 "toolTipFontColor": "#606060",
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "playbackBarHeadShadowBlurRadius": 3,
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadOpacity": 1,
 "progressBackgroundColorRatios": [
  0
 ],
 "playbackBarLeft": 0,
 "toolTipPaddingRight": 6,
 "toolTipShadowColor": "#333333",
 "vrPointerColor": "#FFFFFF",
 "progressBarBackgroundColorDirection": "vertical",
 "playbackBarHeadHeight": 15,
 "toolTipBorderColor": "#767676",
 "paddingBottom": 0,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipTextShadowBlurRadius": 3,
 "progressBarBorderSize": 0,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "data": {
  "name": "ViewerArea20964"
 },
 "toolTipShadowOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "paddingLeft": 0,
 "playbackBarHeight": 10,
 "playbackBarHeadShadow": true,
 "toolTipShadowSpread": 0,
 "progressBackgroundColorDirection": "vertical"
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 02c"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -179.59,
   "hfov": 17.67,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 72,
      "height": 16
     }
    ]
   },
   "pitch": -26.82
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 17.67,
   "image": "this.AnimatedImageResource_7D53EEB6_5F99_FDA0_41A7_1BAF32A305D1",
   "pitch": -26.82,
   "yaw": -179.59,
   "distance": 100
  }
 ],
 "id": "overlay_4B0DA32B_5C54_F781_41B6_1F1FC338D422",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00, this.camera_A04C1253_B693_AA04_41E0_03A80B78F384); this.mainPlayList.set('selectedIndex', 0)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 02c"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -0.22,
   "hfov": 15.22,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 72,
      "height": 16
     }
    ]
   },
   "pitch": -20.95
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 15.22,
   "image": "this.AnimatedImageResource_7D521EB6_5F99_FDA0_41D0_45E9DF3FAE63",
   "pitch": -20.95,
   "yaw": -0.22,
   "distance": 100
  }
 ],
 "id": "overlay_441C4984_5C55_9287_4194_E42A944D6CE3",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE, this.camera_A0515241_B693_AA07_41D4_A245F545F9EA); this.mainPlayList.set('selectedIndex', 2)"
  }
 ]
},
{
 "class": "TripodCapPanoramaOverlay",
 "hfov": 39,
 "angle": 0,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_tcap0.png",
    "class": "ImageResourceLevel",
    "width": 1050,
    "height": 1050
   }
  ]
 },
 "rotate": false,
 "id": "panorama_535281A0_5C55_92BF_41A4_79774B470AC0_tcap0",
 "distance": 50,
 "inertia": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha YCZ INFO"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 94.81,
   "hfov": 13.98,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -13.93
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 13.98,
   "image": "this.AnimatedImageResource_7D528EB6_5F99_FDA0_41D2_2ADED30B5704",
   "pitch": -13.93,
   "yaw": 94.81,
   "distance": 100
  }
 ],
 "id": "overlay_66792533_5DB3_9381_41CF_07142ED6B66C",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.overlay_66793534_5DB3_9387_41A2_E3A18162C8A8.set('enabled', true); this.overlay_6679C535_5DB3_9381_41C4_93D47DC5A849.set('enabled', true); this.overlay_6679D535_5DB3_9381_41D4_6A5E729DF707.set('enabled', true); this.overlay_6679E535_5DB3_9381_41D1_A9857FFC1604.set('enabled', true); this.overlay_6679F535_5DB3_9381_41C5_3BD5A98D4728.set('enabled', true); this.overlay_66792533_5DB3_9381_41CF_07142ED6B66C.set('enabled', false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha YCZ Informacion"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 84.29,
   "hfov": 7.16,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -6.16
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 7.16,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_3_0.png",
      "class": "ImageResourceLevel",
      "width": 200,
      "height": 200
     }
    ]
   },
   "pitch": -6.16,
   "yaw": 84.29
  }
 ],
 "id": "overlay_66793534_5DB3_9387_41A2_E3A18162C8A8",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_6653B4B8_5DB3_928F_41C8_756BE38CA23E, {'paddingTop':5,'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingLeft':5,'paddingRight':5,'iconWidth':20,'borderColor':'#000000','rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_1D48789B_5DD5_B281_41A6_10DCE3978D43, null, null, null, null, false)"
  }
 ],
 "enabled": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 84.28,
   "hfov": 6.92,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_4_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -16.12
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 6.92,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_4_0.png",
      "class": "ImageResourceLevel",
      "width": 200,
      "height": 200
     }
    ]
   },
   "pitch": -16.12,
   "yaw": 84.28
  }
 ],
 "id": "overlay_6679C535_5DB3_9381_41C4_93D47DC5A849",
 "data": {
  "label": "Yamaha YCZ Fotos"
 },
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupMedia(this.window_665D74BA_5DB3_9283_41D0_3F32A6E870CE, this.album_623D971A_5DD7_9F83_417C_6FB0FF992743, this.playList_A5593533_B591_AE04_41AF_C2D8A3F88499, '90%', '90%', false, false)"
  }
 ],
 "enabled": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha YCZ Video"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 84.25,
   "hfov": 6.5,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_5_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -25.56
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 6.5,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_5_0.png",
      "class": "ImageResourceLevel",
      "width": 200,
      "height": 200
     }
    ]
   },
   "pitch": -25.56,
   "yaw": 84.25
  }
 ],
 "id": "overlay_6679D535_5DB3_9381_41D4_6A5E729DF707",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "if(this.isCardboardViewMode()) { this.showPopupPanoramaVideoOverlay(this.popup_665E54BC_5DB3_9287_41C8_4F0F2CE7DD7C, {'paddingTop':5,'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingLeft':5,'paddingRight':5,'iconWidth':20,'borderColor':'#000000','rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, true) } else { this.showPopupMedia(this.window_BE00D746_B591_AA0C_41D4_C30EFB05E4C6, this.video_636358BB_5DD5_9281_41D0_CDF25C2DBC6B, this.playList_A55E0535_B591_AE0C_41E4_5B6B2A39F6A3, '95%', '95%', true, true) }"
  }
 ],
 "enabled": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha YCZ Audio"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 84.15,
   "hfov": 5.79,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_6_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -36.51
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 5.79,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_6_0.png",
      "class": "ImageResourceLevel",
      "width": 200,
      "height": 200
     }
    ]
   },
   "pitch": -36.51,
   "yaw": 84.15
  }
 ],
 "id": "overlay_6679E535_5DB3_9381_41D1_A9857FFC1604",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.stopGlobalAudios(true); this.playGlobalAudioWhilePlay(this.mainPlayList, 1, this.audio_63F1E49E_5DD3_9283_41D6_582E0D8140C0, undefined, true)"
  }
 ],
 "enabled": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha YCZ Link"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 84.24,
   "hfov": 4.99,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_7_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -46.15
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 4.99,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_7_0.png",
      "class": "ImageResourceLevel",
      "width": 200,
      "height": 200
     }
    ]
   },
   "pitch": -46.15,
   "yaw": 84.24
  }
 ],
 "id": "overlay_6679F535_5DB3_9381_41C5_3BD5A98D4728",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.openLink('https://www.chacomer.com.py/moto-yamaha-yc-z-110.html', '_blank')"
  }
 ],
 "enabled": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha YCZ Poligon"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 89.73,
   "hfov": 34.05,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_0_HS_8_1_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 96,
      "height": 200
     }
    ]
   },
   "pitch": -29.53
  }
 ],
 "id": "overlay_66798535_5DB3_9381_41C3_7E7E1C1042F6",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "rollOut": "this.overlay_66793534_5DB3_9387_41A2_E3A18162C8A8.set('enabled', false); this.overlay_6679C535_5DB3_9381_41C4_93D47DC5A849.set('enabled', false); this.overlay_6679D535_5DB3_9381_41D4_6A5E729DF707.set('enabled', false); this.overlay_6679E535_5DB3_9381_41D1_A9857FFC1604.set('enabled', false); this.overlay_6679F535_5DB3_9381_41C5_3BD5A98D4728.set('enabled', false); this.overlay_66792533_5DB3_9381_41CF_07142ED6B66C.set('enabled', true)"
  }
 ]
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": 10.93,
 "bleachingDistance": 0.4,
 "pitch": 69.15,
 "bleaching": 0.7,
 "id": "overlay_48FC81CA_5F78_67E6_41D3_41B1CD687E9A"
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": 173.22,
 "bleachingDistance": 0.4,
 "pitch": 62.62,
 "bleaching": 0.7,
 "id": "overlay_48D6B9CB_5F78_67E0_41C0_AF64CB49E5C4"
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A04C3253_B693_AA04_41E0_916172DE5D5A",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_535C7A1A_5C54_B183_41BC_D9E72EB0D991",
 "restartMovementOnUserInteraction": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 02c"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0.53,
   "hfov": 17.79,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 72,
      "height": 16
     }
    ]
   },
   "pitch": -26.07
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 17.79,
   "image": "this.AnimatedImageResource_7D549EA5_5F99_FDA0_41C4_DED3015E7DC1",
   "pitch": -26.07,
   "yaw": 0.53,
   "distance": 100
  }
 ],
 "id": "overlay_4B467524_5C4D_9387_41D4_FE380B89E883",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_535281A0_5C55_92BF_41A4_79774B470AC0, this.camera_A025E230_B693_AA04_41D8_88A679B1C40D); this.mainPlayList.set('selectedIndex', 1)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 02c"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0.63,
   "hfov": 8.8,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 72,
      "height": 16
     }
    ]
   },
   "pitch": -12.03
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 8.8,
   "image": "this.AnimatedImageResource_7D54FEA6_5F99_FDA0_41CC_86BBD00DDB67",
   "pitch": -12.03,
   "yaw": 0.63,
   "distance": 100
  }
 ],
 "id": "overlay_457513E3_5C4D_B681_41D5_C29B57F9222C",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE, this.camera_A02ED21F_B693_AA3C_41E1_5F33E14B363E); this.mainPlayList.set('selectedIndex', 2)"
  }
 ]
},
{
 "class": "TripodCapPanoramaOverlay",
 "hfov": 39,
 "angle": 0,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_tcap0.png",
    "class": "ImageResourceLevel",
    "width": 1050,
    "height": 1050
   }
  ]
 },
 "rotate": false,
 "id": "panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_tcap0",
 "distance": 50,
 "inertia": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha MT03 INFO"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -94.3,
   "hfov": 13.93,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -14.69
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 13.93,
   "image": "this.AnimatedImageResource_7D57AEA7_5F99_FDA0_41C5_E457881BF40D",
   "pitch": -14.69,
   "yaw": -94.3,
   "distance": 100
  }
 ],
 "id": "overlay_4215A49C_5DDC_9287_4197_A20A64EB886C",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.overlay_43F20E1A_5DF4_B180_41C8_A5254D0B8997.set('enabled', true); this.overlay_43DAC19D_5DCC_F281_41B5_CB50DF4B4D31.set('enabled', true); this.overlay_4215E153_5DCC_7381_4139_4BFC1E7E89B8.set('enabled', true); this.overlay_429A2AFB_5DCC_F681_41D5_0E61980C99DB.set('enabled', true); this.overlay_76866CB1_5C4C_9281_41B8_9BFF2D75FD70.set('enabled', true); this.overlay_48313B5D_5FED_9933_41D6_4AFD6392D488.set('enabled', true); this.overlay_4215A49C_5DDC_9287_4197_A20A64EB886C.set('enabled', false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha MT03 Informacion"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -117.95,
   "hfov": 7.09,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -9.99
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 7.09,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_3_0.png",
      "class": "ImageResourceLevel",
      "width": 200,
      "height": 200
     }
    ]
   },
   "pitch": -9.99,
   "yaw": -117.95
  }
 ],
 "id": "overlay_43F20E1A_5DF4_B180_41C8_A5254D0B8997",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_7091047F_5CB3_B181_41C4_0FD388D8E2D6, {'paddingTop':5,'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingLeft':5,'paddingRight':5,'iconWidth':20,'borderColor':'#000000','rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_65255BFC_5C57_B687_41D5_CBD3185EEDE7, null, null, null, null, false)"
  }
 ],
 "enabled": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -107.34,
   "hfov": 7.1,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_4_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -9.62
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 7.1,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_4_0.png",
      "class": "ImageResourceLevel",
      "width": 200,
      "height": 200
     }
    ]
   },
   "pitch": -9.62,
   "yaw": -107.34
  }
 ],
 "id": "overlay_43DAC19D_5DCC_F281_41B5_CB50DF4B4D31",
 "data": {
  "label": "Yamaha MT03 Fotos"
 },
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupMedia(this.window_71F4E104_5C4C_7380_419F_83FEF09E1B14, this.album_705F61E7_5C4C_9281_41D4_67432D954851, this.playList_A557A525_B591_AE0F_41BB_E70F4F106F5D, '90%', '90%', false, false)"
  }
 ],
 "enabled": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha MT03 Video"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -96.94,
   "hfov": 7.1,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_5_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -9.67
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 7.1,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_5_0.png",
      "class": "ImageResourceLevel",
      "width": 200,
      "height": 200
     }
    ]
   },
   "pitch": -9.67,
   "yaw": -96.94
  }
 ],
 "id": "overlay_4215E153_5DCC_7381_4139_4BFC1E7E89B8",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "if(this.isCardboardViewMode()) { this.showPopupPanoramaVideoOverlay(this.popup_79373586_5DD4_7283_41BE_8F200EC72946, {'paddingTop':5,'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingLeft':5,'paddingRight':5,'iconWidth':20,'borderColor':'#000000','rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, true) } else { this.showPopupMedia(this.window_BE1D2742_B591_AA04_41E1_9A06C5F2E580, this.video_786B48A9_5DD5_9281_41D6_F860A1820E4B, this.playList_A5541530_B591_AE04_41E2_21A0F1AACA17, '95%', '95%', true, true) }"
  }
 ],
 "enabled": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha MT03 Audio"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -86.58,
   "hfov": 7.11,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_6_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -9.27
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 7.11,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_6_0.png",
      "class": "ImageResourceLevel",
      "width": 200,
      "height": 200
     }
    ]
   },
   "pitch": -9.27,
   "yaw": -86.58
  }
 ],
 "id": "overlay_429A2AFB_5DCC_F681_41D5_0E61980C99DB",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.stopGlobalAudios(true); this.playGlobalAudioWhilePlay(this.mainPlayList, 0, this.audio_749A3B4A_5DBC_9783_41C8_F9FEE5038B8C, undefined, true)"
  }
 ],
 "enabled": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha MT03 Link"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -75.01,
   "hfov": 7.11,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_9_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -9.06
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 7.11,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_9_0.png",
      "class": "ImageResourceLevel",
      "width": 200,
      "height": 200
     }
    ]
   },
   "pitch": -9.06,
   "yaw": -75.01
  }
 ],
 "id": "overlay_76866CB1_5C4C_9281_41B8_9BFF2D75FD70",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.openLink('https://www.chacomer.com.py/moto/yamaha/moto-yamaha-mt-03.html', '_blank')"
  }
 ],
 "enabled": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha MT03 Poligon"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -98.98,
   "hfov": 68.07,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0_HS_8_1_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 200,
      "height": 118
     }
    ]
   },
   "pitch": -18.53
  }
 ],
 "id": "overlay_7B869733_5DDC_9F81_41B8_814E71251A62",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "rollOut": "this.overlay_43F20E1A_5DF4_B180_41C8_A5254D0B8997.set('enabled', false); this.overlay_43DAC19D_5DCC_F281_41B5_CB50DF4B4D31.set('enabled', false); this.overlay_4215E153_5DCC_7381_4139_4BFC1E7E89B8.set('enabled', false); this.overlay_429A2AFB_5DCC_F681_41D5_0E61980C99DB.set('enabled', false); this.overlay_76866CB1_5C4C_9281_41B8_9BFF2D75FD70.set('enabled', false); this.overlay_4215A49C_5DDC_9287_4197_A20A64EB886C.set('enabled', true)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha MT03 INFO"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 99.74,
   "hfov": 14.22,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_10_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -9.13
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 14.22,
   "image": "this.AnimatedImageResource_7D51CEB5_5F99_FDA0_41D3_5BDD57507F37",
   "pitch": -9.13,
   "yaw": 99.74,
   "distance": 100
  }
 ],
 "id": "overlay_69005F50_5C5C_6F9F_41CF_C9DE5DC5E977",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.overlay_69004F50_5C5C_6F9F_41AA_797AD5218DF0.set('enabled', true); this.overlay_69001F50_5C5C_6F9F_41C7_A19DC6FF0FEA.set('enabled', true); this.overlay_69000F50_5C5C_6F9F_41A6_5AC2ABBEF1A6.set('enabled', true); this.overlay_6901FF50_5C5C_6F9F_41C8_231691E68A0E.set('enabled', true); this.overlay_6901CF50_5C5C_6F9F_41CA_3982EE239430.set('enabled', true); this.overlay_69005F50_5C5C_6F9F_41CF_C9DE5DC5E977.set('enabled', false)"
  }
 ],
 "enabled": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha MT03 Informacion"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 85.18,
   "hfov": 7.2,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_11_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -1.35
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 7.2,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_11_0.png",
      "class": "ImageResourceLevel",
      "width": 200,
      "height": 200
     }
    ]
   },
   "pitch": -1.35,
   "yaw": 85.18
  }
 ],
 "id": "overlay_69004F50_5C5C_6F9F_41AA_797AD5218DF0",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_69A9EED9_5C5C_6E81_41BD_BE0C02F1E982, {'paddingTop':5,'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingLeft':5,'paddingRight':5,'iconWidth':20,'borderColor':'#000000','rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_67227574_5C54_7387_41C8_00E1AFEDB3C2, null, null, null, null, false)"
  }
 ],
 "enabled": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 94.39,
   "hfov": 7.2,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_12_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -1.32
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 7.2,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_12_0.png",
      "class": "ImageResourceLevel",
      "width": 200,
      "height": 200
     }
    ]
   },
   "pitch": -1.32,
   "yaw": 94.39
  }
 ],
 "id": "overlay_69001F50_5C5C_6F9F_41C7_A19DC6FF0FEA",
 "data": {
  "label": "Yamaha MT03 Fotos"
 },
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupMedia(this.window_6A325B13_5C7C_B781_41BD_00CC4BEAF25C, this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A, this.playList_A5545530_B591_AE04_41A8_064625E75C61, '90%', '90%', false, false)"
  }
 ],
 "enabled": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha MT03 Video"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 104.2,
   "hfov": 7.2,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_13_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -1.34
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 7.2,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_13_0.png",
      "class": "ImageResourceLevel",
      "width": 200,
      "height": 200
     }
    ]
   },
   "pitch": -1.34,
   "yaw": 104.2
  }
 ],
 "id": "overlay_69000F50_5C5C_6F9F_41A6_5AC2ABBEF1A6",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "if(this.isCardboardViewMode()) { this.showPopupPanoramaVideoOverlay(this.popup_695E2EDD_5C5C_6E81_41D3_FF26243DB19B, {'paddingTop':5,'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingLeft':5,'paddingRight':5,'iconWidth':20,'borderColor':'#000000','rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, true) } else { this.showPopupMedia(this.window_BE1EF745_B591_AA0C_41D7_676C3A0967A6, this.video_6D28BB12_5C4D_9783_41D4_8A27FA748C2B, this.playList_A559D532_B591_AE04_41E0_0F11C1A66A4A, '95%', '95%', true, true) }"
  }
 ],
 "enabled": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha MT03 Audio"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 113.94,
   "hfov": 7.2,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_14_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -1.41
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 7.2,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_14_0.png",
      "class": "ImageResourceLevel",
      "width": 200,
      "height": 200
     }
    ]
   },
   "pitch": -1.41,
   "yaw": 113.94
  }
 ],
 "id": "overlay_6901FF50_5C5C_6F9F_41C8_231691E68A0E",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.stopGlobalAudios(true); this.playGlobalAudioWhilePlay(this.mainPlayList, 0, this.audio_6D474534_5C54_7380_41C9_5E0067534943, undefined, true)"
  }
 ],
 "enabled": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha MT03 Link"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 125,
   "hfov": 7.2,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_15_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -1.74
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 7.2,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_15_0.png",
      "class": "ImageResourceLevel",
      "width": 200,
      "height": 200
     }
    ]
   },
   "pitch": -1.74,
   "yaw": 125
  }
 ],
 "id": "overlay_6901CF50_5C5C_6F9F_41CA_3982EE239430",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.openLink('https://www.chacomer.com.py/moto-yamaha-xtz150.html', '_blank')"
  }
 ],
 "enabled": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha MT03 Poligon"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 108.3,
   "hfov": 63.64,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_16_1_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 200,
      "height": 189
     }
    ]
   },
   "pitch": -23.69
  }
 ],
 "id": "overlay_69074F50_5C5C_6F9F_41C6_353298956340",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "rollOut": "this.overlay_69004F50_5C5C_6F9F_41AA_797AD5218DF0.set('enabled', false); this.overlay_69001F50_5C5C_6F9F_41C7_A19DC6FF0FEA.set('enabled', false); this.overlay_69000F50_5C5C_6F9F_41A6_5AC2ABBEF1A6.set('enabled', false); this.overlay_6901FF50_5C5C_6F9F_41C8_231691E68A0E.set('enabled', false); this.overlay_6901CF50_5C5C_6F9F_41CA_3982EE239430.set('enabled', false); this.overlay_69005F50_5C5C_6F9F_41CF_C9DE5DC5E977.set('enabled', true)"
  }
 ]
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": 0.88,
 "bleachingDistance": 0.4,
 "pitch": 37.75,
 "bleaching": 0.7,
 "id": "overlay_46A4D789_5F78_EC60_41D3_58599F48EA5E"
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": -176.99,
 "bleachingDistance": 0.4,
 "pitch": 76.69,
 "bleaching": 0.7,
 "id": "overlay_4683F336_5F78_E4A0_41B9_66C64F5F92D6"
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -76.66,
   "hfov": 5.93,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0_HS_18_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -19.36
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 5.93,
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
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.setComponentVisibility(this.Container_48EE9E0B_5FEC_9B17_41D6_DE3A0A569909, true, 0, this.effect_4635488F_5FE7_872E_41C1_FF3ECDA34F01, 'showEffect', false)"
  }
 ],
 "enabled": false
},
{
 "class": "VideoPlayer",
 "displayPlaybackBar": true,
 "id": "viewer_uidA3C641AD_B693_A61C_41C9_5379014E9F2DVideoPlayer",
 "viewerArea": "this.viewer_uidA3C641AD_B693_A61C_41C9_5379014E9F2D"
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 02c"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -152.61,
   "hfov": 15.87,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 72,
      "height": 16
     }
    ]
   },
   "pitch": -19.2
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 15.87,
   "image": "this.AnimatedImageResource_7D590EB9_5F99_FDA0_41D4_692B51201688",
   "pitch": -19.2,
   "yaw": -152.61,
   "distance": 100
  }
 ],
 "id": "overlay_4459C812_5C5D_9183_41D4_68F3FE8A5EC3",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE, this.camera_A03D3210_B693_AA04_41D9_2F9100DAB651); this.mainPlayList.set('selectedIndex', 2)"
  }
 ]
},
{
 "class": "TripodCapPanoramaOverlay",
 "hfov": 39,
 "angle": 0,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_tcap0.png",
    "class": "ImageResourceLevel",
    "width": 1050,
    "height": 1050
   }
  ]
 },
 "rotate": false,
 "id": "panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_tcap0",
 "distance": 50,
 "inertia": false
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": -96.34,
 "bleachingDistance": 0.4,
 "pitch": 64.88,
 "bleaching": 0.7,
 "id": "overlay_48083C12_5F78_3C60_41D4_DC6560511014"
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": 135.53,
 "bleachingDistance": 0.4,
 "pitch": 51.56,
 "bleaching": 0.7,
 "id": "overlay_48E8D0CC_5F78_25E0_41C3_27414998C55C"
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A007B1FF_B693_A9FC_41C0_F557D19328FE",
 "restartMovementOnUserInteraction": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 02c"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -178.72,
   "hfov": 15.53,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 72,
      "height": 16
     }
    ]
   },
   "pitch": -20.2
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 15.53,
   "image": "this.AnimatedImageResource_7D5C4EB7_5F99_FDA0_41D5_F8A008C39ED4",
   "pitch": -20.2,
   "yaw": -178.72,
   "distance": 100
  }
 ],
 "id": "overlay_4BEED20E_5C5C_B183_41BE_7AA18AECD597",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_535281A0_5C55_92BF_41A4_79774B470AC0, this.camera_A00781FF_B693_A9FC_41D7_F0C6DB8C8C58); this.mainPlayList.set('selectedIndex', 1)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 02c"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -89.16,
   "hfov": 18.57,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 72,
      "height": 16
     }
    ]
   },
   "pitch": -20.33
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 18.57,
   "image": "this.AnimatedImageResource_7D5C7EB7_5F99_FDA0_41D5_D12355328A4E",
   "pitch": -20.33,
   "yaw": -89.16,
   "distance": 100
  }
 ],
 "id": "overlay_44E9236D_5C5F_B781_41CD_320EDDC7D241",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_5373C82A_5C54_9183_41D5_746C6CF32C38, this.camera_A01391DB_B693_A604_41E6_BE971DACD6E2); this.mainPlayList.set('selectedIndex', 3)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 02c"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -178.75,
   "hfov": 8.82,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 72,
      "height": 16
     }
    ]
   },
   "pitch": -11.53
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 8.82,
   "image": "this.AnimatedImageResource_7D5CDEB8_5F99_FDA0_41B3_D0A81F81F8B3",
   "pitch": -11.53,
   "yaw": -178.75,
   "distance": 100
  }
 ],
 "id": "overlay_4BA61F9E_5C53_EE83_41D1_2D44912BC0F5",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00, this.camera_A00BB1ED_B693_A61C_41D7_75B49C57F97D); this.mainPlayList.set('selectedIndex', 0)"
  }
 ]
},
{
 "class": "TripodCapPanoramaOverlay",
 "hfov": 39,
 "angle": 0,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_tcap0.png",
    "class": "ImageResourceLevel",
    "width": 1050,
    "height": 1050
   }
  ]
 },
 "rotate": false,
 "id": "panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_tcap0",
 "distance": 50,
 "inertia": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha YCZ INFO"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 111.1,
   "hfov": 13.98,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -13.83
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 13.98,
   "image": "this.AnimatedImageResource_7D5F3EB8_5F99_FDA0_41A6_6B7EED5ECF53",
   "pitch": -13.83,
   "yaw": 111.1,
   "distance": 100
  }
 ],
 "id": "overlay_626633AA_5DCC_9683_41CE_AADCC31A62FD",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.overlay_626643AA_5DCC_9683_41A8_4FD581109B45.set('enabled', true); this.overlay_626663AB_5DCC_9681_41A7_7894AF438316.set('enabled', true); this.overlay_626673AB_5DCC_9681_41D2_9F49774B179B.set('enabled', true); this.overlay_626183AB_5DCC_9681_41AD_7F4FB949C006.set('enabled', true); this.overlay_626193AB_5DCC_9681_41AF_CD93E50D069B.set('enabled', true); this.overlay_626633AA_5DCC_9683_41CE_AADCC31A62FD.set('enabled', false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha YCZ Informacion"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 103.76,
   "hfov": 7.17,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_4_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -5.29
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 7.17,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_4_0.png",
      "class": "ImageResourceLevel",
      "width": 200,
      "height": 200
     }
    ]
   },
   "pitch": -5.29,
   "yaw": 103.76
  }
 ],
 "id": "overlay_626643AA_5DCC_9683_41A8_4FD581109B45",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_6257F33E_5DCC_9783_41B0_97B5816F9903, {'paddingTop':5,'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingLeft':5,'paddingRight':5,'iconWidth':20,'borderColor':'#000000','rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_63BE5A50_5DF3_919F_41BA_8AC8087C33EF, null, null, null, null, false)"
  }
 ],
 "enabled": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 103.65,
   "hfov": 6.96,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_5_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -14.87
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 6.96,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_5_0.png",
      "class": "ImageResourceLevel",
      "width": 200,
      "height": 200
     }
    ]
   },
   "pitch": -14.87,
   "yaw": 103.65
  }
 ],
 "id": "overlay_626663AB_5DCC_9681_41A7_7894AF438316",
 "data": {
  "label": "Yamaha YCZ Fotos"
 },
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupMedia(this.window_62499340_5DCC_97FF_41D6_BF532A97C63A, this.album_6076EEE4_5DF7_EE80_41C0_70404B70EF36, this.playList_A55D8535_B591_AE0C_41DC_8DC0B36150A0, '90%', '90%', false, false)"
  }
 ],
 "enabled": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha YCZ Video"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 103.82,
   "hfov": 6.53,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_6_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -24.98
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 6.53,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_6_0.png",
      "class": "ImageResourceLevel",
      "width": 200,
      "height": 200
     }
    ]
   },
   "pitch": -24.98,
   "yaw": 103.82
  }
 ],
 "id": "overlay_626673AB_5DCC_9681_41D2_9F49774B179B",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "if(this.isCardboardViewMode()) { this.showPopupPanoramaVideoOverlay(this.popup_6248E342_5DCC_9783_41D7_AF6FA03E6565, {'paddingTop':5,'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingLeft':5,'paddingRight':5,'iconWidth':20,'borderColor':'#000000','rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, true) } else { this.showPopupMedia(this.window_BE02C747_B591_AA0C_41E6_19D3B53B9752, this.video_6138AF13_5DF4_6F81_41CF_B052B4DA69FF, this.playList_A55CA53D_B591_AE7C_41E1_0BBAFB249836, '95%', '95%', true, true) }"
  }
 ],
 "enabled": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha YCZ Audio"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 103.72,
   "hfov": 5.9,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_7_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -34.96
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 5.9,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_7_0.png",
      "class": "ImageResourceLevel",
      "width": 200,
      "height": 200
     }
    ]
   },
   "pitch": -34.96,
   "yaw": 103.72
  }
 ],
 "id": "overlay_626183AB_5DCC_9681_41AD_7F4FB949C006",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.stopGlobalAudios(true); this.playGlobalAudioWhilePlay(this.mainPlayList, 2, this.audio_61DC12C0_5DF5_B6FF_4198_5687742A7BA8, undefined, true)"
  }
 ],
 "enabled": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha YCZ Link"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 103.8,
   "hfov": 5.09,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_8_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -44.99
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 5.09,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_8_0.png",
      "class": "ImageResourceLevel",
      "width": 200,
      "height": 200
     }
    ]
   },
   "pitch": -44.99,
   "yaw": 103.8
  }
 ],
 "id": "overlay_626193AB_5DCC_9681_41AF_CD93E50D069B",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.openLink('https://www.chacomer.com.py/moto-yamaha-sz-rr-blue-core.html', '_blank')"
  }
 ],
 "enabled": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Yamaha YCZ Poligon"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 111.89,
   "hfov": 45.22,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_0_HS_9_1_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 139,
      "height": 200
     }
    ]
   },
   "pitch": -24.84
  }
 ],
 "id": "overlay_6261B3AB_5DCC_9681_41CF_1E61BB0A0FFB",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "rollOut": "this.overlay_626643AA_5DCC_9683_41A8_4FD581109B45.set('enabled', false); this.overlay_626663AB_5DCC_9681_41A7_7894AF438316.set('enabled', false); this.overlay_626673AB_5DCC_9681_41D2_9F49774B179B.set('enabled', false); this.overlay_626183AB_5DCC_9681_41AD_7F4FB949C006.set('enabled', false); this.overlay_626193AB_5DCC_9681_41AF_CD93E50D069B.set('enabled', false); this.overlay_626633AA_5DCC_9683_41CE_AADCC31A62FD.set('enabled', true)"
  }
 ]
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": 174.98,
 "bleachingDistance": 0.4,
 "pitch": 68.65,
 "bleaching": 0.7,
 "id": "overlay_48F077F1_5F78_6BA0_41C2_EE22BD0FCE94"
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": 4.4,
 "bleachingDistance": 0.4,
 "pitch": 51.56,
 "bleaching": 0.7,
 "id": "overlay_48DCE16B_5F78_24A0_41BD_D4BBACFB641A"
},
{
 "class": "Container",
 "paddingLeft": 0,
 "borderRadius": 0,
 "children": [
  "this.viewer_uidA3C061AB_B693_A604_41B5_E2C6522E3154",
  {
   "class": "Container",
   "paddingLeft": 0,
   "borderRadius": 0,
   "children": [
    "this.htmltext_A3C121AC_B693_A61C_41E6_25BBA312DE9A"
   ],
   "scrollBarWidth": 7,
   "left": 0,
   "backgroundColorRatios": [],
   "right": 0,
   "gap": 10,
   "minHeight": 20,
   "borderSize": 0,
   "scrollBarColor": "#FFFFFF",
   "paddingRight": 0,
   "horizontalAlign": "left",
   "contentOpaque": true,
   "minWidth": 20,
   "bottom": 0,
   "verticalAlign": "bottom",
   "paddingBottom": 0,
   "scrollBarOpacity": 0.5,
   "scrollBarVisible": "rollOver",
   "backgroundColor": [],
   "backgroundColorDirection": "vertical",
   "propagateClick": false,
   "height": "30%",
   "overflow": "scroll",
   "scrollBarMargin": 2,
   "paddingTop": 0,
   "data": {
    "name": "Container20974"
   },
   "shadow": false,
   "layout": "vertical",
   "backgroundOpacity": 0.3
  },
  "this.component_A3C6C1AD_B693_A61C_41DB_D753C2AB213A",
  "this.component_A3C6D1AD_B693_A61C_41D4_D82DBA57888D"
 ],
 "scrollBarWidth": 10,
 "id": "container_A3C1D1AC_B693_A61C_41DF_E616C4D89784",
 "width": "100%",
 "backgroundColorRatios": [],
 "gap": 10,
 "minHeight": 20,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "horizontalAlign": "left",
 "contentOpaque": false,
 "minWidth": 20,
 "verticalAlign": "top",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "height": "100%",
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "Container20973"
 },
 "shadow": false,
 "layout": "absolute",
 "backgroundOpacity": 0.3
},
{
 "class": "PhotoAlbumPlayListItem",
 "begin": "this.updateMediaLabelFromPlayList(this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_AlbumPlayList, this.htmltext_A3CC51A8_B693_A604_41B2_B37C9AB0A59C, this.albumitem_A3CCB1A7_B693_A60C_41C3_0CBBF7E2AD7D); this.loopAlbum(this.playList_A5545530_B591_AE04_41A8_064625E75C61, 0)",
 "media": "this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A",
 "player": "this.viewer_uidA3CF71A7_B693_A60C_41DE_8A6DDB9CB1B1PhotoAlbumPlayer",
 "id": "albumitem_A3CCB1A7_B693_A60C_41C3_0CBBF7E2AD7D"
},
{
 "class": "PhotoPlayList",
 "items": [
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_623D971A_5DD7_9F83_417C_6FB0FF992743_0",
   "camera": {
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.32",
     "zoomFactor": 1.1,
     "y": "0.28"
    },
    "duration": 5000,
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_623D971A_5DD7_9F83_417C_6FB0FF992743_1",
   "camera": {
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.40",
     "zoomFactor": 1.1,
     "y": "0.26"
    },
    "duration": 5000,
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_623D971A_5DD7_9F83_417C_6FB0FF992743_2",
   "camera": {
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.49",
     "zoomFactor": 1.1,
     "y": "0.39"
    },
    "duration": 5000,
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_623D971A_5DD7_9F83_417C_6FB0FF992743_3",
   "camera": {
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.72",
     "zoomFactor": 1.1,
     "y": "0.63"
    },
    "duration": 5000,
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside"
   }
  }
 ],
 "id": "album_623D971A_5DD7_9F83_417C_6FB0FF992743_AlbumPlayList"
},
{
 "class": "Container",
 "paddingLeft": 0,
 "borderRadius": 0,
 "children": [
  "this.viewer_uidA3C2F1A9_B693_A604_41D7_50EB314CB2A5",
  {
   "class": "Container",
   "paddingLeft": 0,
   "borderRadius": 0,
   "children": [
    "this.htmltext_A3C391AA_B693_A604_41C1_4A59A88426E9"
   ],
   "scrollBarWidth": 7,
   "left": 0,
   "backgroundColorRatios": [],
   "right": 0,
   "gap": 10,
   "minHeight": 20,
   "borderSize": 0,
   "scrollBarColor": "#FFFFFF",
   "paddingRight": 0,
   "horizontalAlign": "left",
   "contentOpaque": true,
   "minWidth": 20,
   "bottom": 0,
   "verticalAlign": "bottom",
   "paddingBottom": 0,
   "scrollBarOpacity": 0.5,
   "scrollBarVisible": "rollOver",
   "backgroundColor": [],
   "backgroundColorDirection": "vertical",
   "propagateClick": false,
   "height": "30%",
   "overflow": "scroll",
   "scrollBarMargin": 2,
   "paddingTop": 0,
   "data": {
    "name": "Container20967"
   },
   "shadow": false,
   "layout": "vertical",
   "backgroundOpacity": 0.3
  },
  "this.component_A3C331AA_B693_A604_41D4_B3AC1857729A",
  "this.component_A3C341AA_B693_A604_41E5_9DB878730ACF"
 ],
 "scrollBarWidth": 10,
 "id": "container_A3C251AA_B693_A604_41D6_EC325181362C",
 "width": "100%",
 "backgroundColorRatios": [],
 "gap": 10,
 "minHeight": 20,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "horizontalAlign": "left",
 "contentOpaque": false,
 "minWidth": 20,
 "verticalAlign": "top",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "height": "100%",
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "Container20966"
 },
 "shadow": false,
 "layout": "absolute",
 "backgroundOpacity": 0.3
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_5343BA1A_5C54_B183_41D6_CBD1E4B07337",
 "restartMovementOnUserInteraction": false
},
{
 "class": "ViewerArea",
 "paddingTop": 0,
 "transitionMode": "blending",
 "playbackBarBottom": 0,
 "id": "viewer_uidA3C641AD_B693_A61C_41C9_5379014E9F2D",
 "width": "100%",
 "toolTipShadowHorizontalLength": 0,
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowVerticalLength": 0,
 "minHeight": 50,
 "borderSize": 0,
 "playbackBarHeadShadowHorizontalLength": 0,
 "toolTipBorderRadius": 3,
 "paddingRight": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderColor": "#000000",
 "toolTipPaddingLeft": 6,
 "vrPointerSelectionTime": 2000,
 "minWidth": 100,
 "playbackBarHeadWidth": 6,
 "progressBorderSize": 0,
 "toolTipDisplayTime": 600,
 "firstTransitionDuration": 0,
 "toolTipFontStyle": "normal",
 "progressLeft": 0,
 "playbackBarHeadShadowColor": "#000000",
 "toolTipShadowBlurRadius": 3,
 "progressBarBorderColor": "#000000",
 "playbackBarBorderRadius": 0,
 "progressBottom": 2,
 "toolTipBackgroundColor": "#F6F6F6",
 "toolTipFontWeight": "normal",
 "height": "100%",
 "propagateClick": false,
 "toolTipPaddingTop": 4,
 "playbackBarBackgroundColorDirection": "vertical",
 "toolTipBorderSize": 1,
 "toolTipPaddingBottom": 4,
 "toolTipFontFamily": "Arial",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "transitionDuration": 500,
 "progressRight": 0,
 "toolTipFontSize": "1.11vmin",
 "progressHeight": 10,
 "playbackBarProgressBorderSize": 0,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "playbackBarRight": 0,
 "progressBarBorderRadius": 0,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "shadow": false,
 "playbackBarHeadShadowVerticalLength": 0,
 "borderRadius": 0,
 "playbackBarProgressOpacity": 1,
 "playbackBarHeadBorderRadius": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBackgroundOpacity": 1,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "progressOpacity": 1,
 "playbackBarBorderSize": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "toolTipTextShadowOpacity": 0,
 "toolTipOpacity": 1,
 "playbackBarHeadBorderSize": 0,
 "vrPointerSelectionColor": "#FF6600",
 "progressBarOpacity": 1,
 "progressBorderRadius": 0,
 "toolTipFontColor": "#606060",
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "playbackBarHeadShadowBlurRadius": 3,
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadOpacity": 1,
 "progressBackgroundColorRatios": [
  0
 ],
 "playbackBarLeft": 0,
 "toolTipPaddingRight": 6,
 "toolTipShadowColor": "#333333",
 "vrPointerColor": "#FFFFFF",
 "progressBarBackgroundColorDirection": "vertical",
 "playbackBarHeadHeight": 15,
 "toolTipBorderColor": "#767676",
 "paddingBottom": 0,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipTextShadowBlurRadius": 3,
 "progressBarBorderSize": 0,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "data": {
  "name": "ViewerArea20978"
 },
 "toolTipShadowOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "paddingLeft": 0,
 "playbackBarHeight": 10,
 "playbackBarHeadShadow": true,
 "toolTipShadowSpread": 0,
 "progressBackgroundColorDirection": "vertical"
},
{
 "class": "PhotoAlbumPlayListItem",
 "begin": "this.updateMediaLabelFromPlayList(this.album_623D971A_5DD7_9F83_417C_6FB0FF992743_AlbumPlayList, this.htmltext_A3C391AA_B693_A604_41C1_4A59A88426E9, this.albumitem_A3C211A9_B693_A604_41C9_D2D0AEA695D1); this.loopAlbum(this.playList_A5593533_B591_AE04_41AF_C2D8A3F88499, 0)",
 "media": "this.album_623D971A_5DD7_9F83_417C_6FB0FF992743",
 "player": "this.viewer_uidA3C2F1A9_B693_A604_41D7_50EB314CB2A5PhotoAlbumPlayer",
 "id": "albumitem_A3C211A9_B693_A604_41C9_D2D0AEA695D1"
},
{
 "class": "PhotoPlayList",
 "items": [
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_705F61E7_5C4C_9281_41D4_67432D954851_0",
   "camera": {
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.52",
     "zoomFactor": 1.1,
     "y": "0.54"
    },
    "duration": 5000,
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_705F61E7_5C4C_9281_41D4_67432D954851_1",
   "camera": {
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.69",
     "zoomFactor": 1.1,
     "y": "0.52"
    },
    "duration": 5000,
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_705F61E7_5C4C_9281_41D4_67432D954851_2",
   "camera": {
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.33",
     "zoomFactor": 1.1,
     "y": "0.61"
    },
    "duration": 5000,
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "easing": "linear",
    "scaleMode": "fit_outside"
   }
  }
 ],
 "id": "album_705F61E7_5C4C_9281_41D4_67432D954851_AlbumPlayList"
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A025F230_B693_AA04_41D1_213C7398DF5D",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A03D4210_B693_AA04_41DE_50746334F0B0",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A013A1DB_B693_A604_41D3_7EB6F03A6AC1",
 "restartMovementOnUserInteraction": false
},
{
 "class": "VideoPlayer",
 "displayPlaybackBar": true,
 "id": "viewer_uidA3C0B1AB_B693_A604_41C9_8F6EE6EDEC12VideoPlayer",
 "viewerArea": "this.viewer_uidA3C0B1AB_B693_A604_41C9_8F6EE6EDEC12"
},
{
 "class": "Container",
 "paddingLeft": 0,
 "borderRadius": 0,
 "children": [
  "this.viewer_uidA3CE81A5_B693_A60C_41DE_F4C372E71AD2",
  {
   "class": "Container",
   "paddingLeft": 0,
   "borderRadius": 0,
   "children": [
    "this.htmltext_A3CE11A6_B693_A60C_41CD_C7283FF4D447"
   ],
   "scrollBarWidth": 7,
   "left": 0,
   "backgroundColorRatios": [],
   "right": 0,
   "gap": 10,
   "minHeight": 20,
   "borderSize": 0,
   "scrollBarColor": "#FFFFFF",
   "paddingRight": 0,
   "horizontalAlign": "left",
   "contentOpaque": true,
   "minWidth": 20,
   "bottom": 0,
   "verticalAlign": "bottom",
   "paddingBottom": 0,
   "scrollBarOpacity": 0.5,
   "scrollBarVisible": "rollOver",
   "backgroundColor": [],
   "backgroundColorDirection": "vertical",
   "propagateClick": false,
   "height": "30%",
   "overflow": "scroll",
   "scrollBarMargin": 2,
   "paddingTop": 0,
   "data": {
    "name": "Container20953"
   },
   "shadow": false,
   "layout": "vertical",
   "backgroundOpacity": 0.3
  },
  "this.component_A3CFE1A6_B693_A60C_41BC_F6E3E5C7C9F0",
  "this.component_A3CFF1A6_B693_A60C_41A6_D06A56C7A8BE"
 ],
 "scrollBarWidth": 10,
 "id": "container_A3CEC1A5_B693_A60C_41E6_5174B1FA1473",
 "width": "100%",
 "backgroundColorRatios": [],
 "gap": 10,
 "minHeight": 20,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "horizontalAlign": "left",
 "contentOpaque": false,
 "minWidth": 20,
 "verticalAlign": "top",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "height": "100%",
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "Container20952"
 },
 "shadow": false,
 "layout": "absolute",
 "backgroundOpacity": 0.3
},
{
 "class": "Container",
 "paddingLeft": 0,
 "borderRadius": 0,
 "children": [
  "this.viewer_uidA3CF71A7_B693_A60C_41DE_8A6DDB9CB1B1",
  {
   "class": "Container",
   "paddingLeft": 0,
   "borderRadius": 0,
   "children": [
    "this.htmltext_A3CC51A8_B693_A604_41B2_B37C9AB0A59C"
   ],
   "scrollBarWidth": 7,
   "left": 0,
   "backgroundColorRatios": [],
   "right": 0,
   "gap": 10,
   "minHeight": 20,
   "borderSize": 0,
   "scrollBarColor": "#FFFFFF",
   "paddingRight": 0,
   "horizontalAlign": "left",
   "contentOpaque": true,
   "minWidth": 20,
   "bottom": 0,
   "verticalAlign": "bottom",
   "paddingBottom": 0,
   "scrollBarOpacity": 0.5,
   "scrollBarVisible": "rollOver",
   "backgroundColor": [],
   "backgroundColorDirection": "vertical",
   "propagateClick": false,
   "height": "30%",
   "overflow": "scroll",
   "scrollBarMargin": 2,
   "paddingTop": 0,
   "data": {
    "name": "Container20960"
   },
   "shadow": false,
   "layout": "vertical",
   "backgroundOpacity": 0.3
  },
  "this.component_A3CDE1A9_B693_A604_41D5_5E15E0317913",
  "this.component_A3CDF1A9_B693_A604_41E0_836F6E5FD4F2"
 ],
 "scrollBarWidth": 10,
 "id": "container_A3CCF1A8_B693_A604_41D4_1F994483516A",
 "width": "100%",
 "backgroundColorRatios": [],
 "gap": 10,
 "minHeight": 20,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "paddingRight": 0,
 "horizontalAlign": "left",
 "contentOpaque": false,
 "minWidth": 20,
 "verticalAlign": "top",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "height": "100%",
 "overflow": "scroll",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "data": {
  "name": "Container20959"
 },
 "shadow": false,
 "layout": "absolute",
 "backgroundOpacity": 0.3
},
{
 "class": "ViewerArea",
 "paddingTop": 0,
 "transitionMode": "blending",
 "playbackBarBottom": 0,
 "id": "viewer_uidA3CF21A7_B693_A60C_41D7_EA1BF066520D",
 "width": "100%",
 "toolTipShadowHorizontalLength": 0,
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowVerticalLength": 0,
 "minHeight": 50,
 "borderSize": 0,
 "playbackBarHeadShadowHorizontalLength": 0,
 "toolTipBorderRadius": 3,
 "paddingRight": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderColor": "#000000",
 "toolTipPaddingLeft": 6,
 "vrPointerSelectionTime": 2000,
 "minWidth": 100,
 "playbackBarHeadWidth": 6,
 "progressBorderSize": 0,
 "toolTipDisplayTime": 600,
 "firstTransitionDuration": 0,
 "toolTipFontStyle": "normal",
 "progressLeft": 0,
 "playbackBarHeadShadowColor": "#000000",
 "toolTipShadowBlurRadius": 3,
 "progressBarBorderColor": "#000000",
 "playbackBarBorderRadius": 0,
 "progressBottom": 2,
 "toolTipBackgroundColor": "#F6F6F6",
 "toolTipFontWeight": "normal",
 "height": "100%",
 "propagateClick": false,
 "toolTipPaddingTop": 4,
 "playbackBarBackgroundColorDirection": "vertical",
 "toolTipBorderSize": 1,
 "toolTipPaddingBottom": 4,
 "toolTipFontFamily": "Arial",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "transitionDuration": 500,
 "progressRight": 0,
 "toolTipFontSize": "1.11vmin",
 "progressHeight": 10,
 "playbackBarProgressBorderSize": 0,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "playbackBarRight": 0,
 "progressBarBorderRadius": 0,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "shadow": false,
 "playbackBarHeadShadowVerticalLength": 0,
 "borderRadius": 0,
 "playbackBarProgressOpacity": 1,
 "playbackBarHeadBorderRadius": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBackgroundOpacity": 1,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "progressOpacity": 1,
 "playbackBarBorderSize": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "toolTipTextShadowOpacity": 0,
 "toolTipOpacity": 1,
 "playbackBarHeadBorderSize": 0,
 "vrPointerSelectionColor": "#FF6600",
 "progressBarOpacity": 1,
 "progressBorderRadius": 0,
 "toolTipFontColor": "#606060",
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "playbackBarHeadShadowBlurRadius": 3,
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadOpacity": 1,
 "progressBackgroundColorRatios": [
  0
 ],
 "playbackBarLeft": 0,
 "toolTipPaddingRight": 6,
 "toolTipShadowColor": "#333333",
 "vrPointerColor": "#FFFFFF",
 "progressBarBackgroundColorDirection": "vertical",
 "playbackBarHeadHeight": 15,
 "toolTipBorderColor": "#767676",
 "paddingBottom": 0,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipTextShadowBlurRadius": 3,
 "progressBarBorderSize": 0,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "data": {
  "name": "ViewerArea20957"
 },
 "toolTipShadowOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "paddingLeft": 0,
 "playbackBarHeight": 10,
 "playbackBarHeadShadow": true,
 "toolTipShadowSpread": 0,
 "progressBackgroundColorDirection": "vertical"
},
{
 "class": "ViewerArea",
 "paddingTop": 0,
 "transitionMode": "blending",
 "playbackBarBottom": 0,
 "id": "viewer_uidA3C0B1AB_B693_A604_41C9_8F6EE6EDEC12",
 "width": "100%",
 "toolTipShadowHorizontalLength": 0,
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowVerticalLength": 0,
 "minHeight": 50,
 "borderSize": 0,
 "playbackBarHeadShadowHorizontalLength": 0,
 "toolTipBorderRadius": 3,
 "paddingRight": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderColor": "#000000",
 "toolTipPaddingLeft": 6,
 "vrPointerSelectionTime": 2000,
 "minWidth": 100,
 "playbackBarHeadWidth": 6,
 "progressBorderSize": 0,
 "toolTipDisplayTime": 600,
 "firstTransitionDuration": 0,
 "toolTipFontStyle": "normal",
 "progressLeft": 0,
 "playbackBarHeadShadowColor": "#000000",
 "toolTipShadowBlurRadius": 3,
 "progressBarBorderColor": "#000000",
 "playbackBarBorderRadius": 0,
 "progressBottom": 2,
 "toolTipBackgroundColor": "#F6F6F6",
 "toolTipFontWeight": "normal",
 "height": "100%",
 "propagateClick": false,
 "toolTipPaddingTop": 4,
 "playbackBarBackgroundColorDirection": "vertical",
 "toolTipBorderSize": 1,
 "toolTipPaddingBottom": 4,
 "toolTipFontFamily": "Arial",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "transitionDuration": 500,
 "progressRight": 0,
 "toolTipFontSize": "1.11vmin",
 "progressHeight": 10,
 "playbackBarProgressBorderSize": 0,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "playbackBarRight": 0,
 "progressBarBorderRadius": 0,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "shadow": false,
 "playbackBarHeadShadowVerticalLength": 0,
 "borderRadius": 0,
 "playbackBarProgressOpacity": 1,
 "playbackBarHeadBorderRadius": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBackgroundOpacity": 1,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "progressOpacity": 1,
 "playbackBarBorderSize": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "toolTipTextShadowOpacity": 0,
 "toolTipOpacity": 1,
 "playbackBarHeadBorderSize": 0,
 "vrPointerSelectionColor": "#FF6600",
 "progressBarOpacity": 1,
 "progressBorderRadius": 0,
 "toolTipFontColor": "#606060",
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "playbackBarHeadShadowBlurRadius": 3,
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadOpacity": 1,
 "progressBackgroundColorRatios": [
  0
 ],
 "playbackBarLeft": 0,
 "toolTipPaddingRight": 6,
 "toolTipShadowColor": "#333333",
 "vrPointerColor": "#FFFFFF",
 "progressBarBackgroundColorDirection": "vertical",
 "playbackBarHeadHeight": 15,
 "toolTipBorderColor": "#767676",
 "paddingBottom": 0,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipTextShadowBlurRadius": 3,
 "progressBarBorderSize": 0,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "data": {
  "name": "ViewerArea20971"
 },
 "toolTipShadowOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "paddingLeft": 0,
 "playbackBarHeight": 10,
 "playbackBarHeadShadow": true,
 "toolTipShadowSpread": 0,
 "progressBackgroundColorDirection": "vertical"
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_53439A1A_5C54_B183_41C4_02C53D863FE2",
 "restartMovementOnUserInteraction": false
},
{
 "class": "VideoPlayer",
 "displayPlaybackBar": true,
 "id": "viewer_uidA3CD61A9_B693_A604_41E5_9F16A3775C27VideoPlayer",
 "viewerArea": "this.viewer_uidA3CD61A9_B693_A604_41E5_9F16A3775C27"
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A00BC1EE_B693_A61C_41CD_A9C695D2E381",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PhotoAlbumPlayer",
 "buttonNext": "this.IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4",
 "id": "viewer_uidA3C061AB_B693_A604_41B5_E2C6522E3154PhotoAlbumPlayer",
 "buttonPrevious": "this.IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC",
 "viewerArea": "this.viewer_uidA3C061AB_B693_A604_41B5_E2C6522E3154"
},
{
 "class": "PhotoAlbumPlayer",
 "buttonNext": "this.IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4",
 "id": "viewer_uidA3CE81A5_B693_A60C_41DE_F4C372E71AD2PhotoAlbumPlayer",
 "buttonPrevious": "this.IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC",
 "viewerArea": "this.viewer_uidA3CE81A5_B693_A60C_41DE_F4C372E71AD2"
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 360
  }
 ],
 "frameCount": 24,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D53EEB6_5F99_FDA0_41A7_1BAF32A305D1",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 360
  }
 ],
 "frameCount": 24,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D521EB6_5F99_FDA0_41D0_45E9DF3FAE63",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_535281A0_5C55_92BF_41A4_79774B470AC0_1_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 780,
   "height": 1170
  }
 ],
 "frameCount": 24,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D528EB6_5F99_FDA0_41D2_2ADED30B5704",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 360
  }
 ],
 "frameCount": 24,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D549EA5_5F99_FDA0_41C4_DED3015E7DC1",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 360
  }
 ],
 "frameCount": 24,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D54FEA6_5F99_FDA0_41CC_86BBD00DDB67",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 780,
   "height": 1170
  }
 ],
 "frameCount": 24,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D57AEA7_5F99_FDA0_41C5_E457881BF40D",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_1_HS_10_0.png",
   "class": "ImageResourceLevel",
   "width": 780,
   "height": 1170
  }
 ],
 "frameCount": 24,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D51CEB5_5F99_FDA0_41D3_5BDD57507F37",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_4CCB7E2D_5C55_9181_41CD_264CE5111D00_0_HS_18_0.png",
   "class": "ImageResourceLevel",
   "width": 580,
   "height": 870
  }
 ],
 "frameCount": 24,
 "rowCount": 6,
 "id": "AnimatedImageResource_4143A243_5FE5_8B17_41C3_F135948B4F22",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_5373C82A_5C54_9183_41D5_746C6CF32C38_1_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 360
  }
 ],
 "frameCount": 24,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D590EB9_5F99_FDA0_41D4_692B51201688",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 360
  }
 ],
 "frameCount": 24,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D5C4EB7_5F99_FDA0_41D5_F8A008C39ED4",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 360
  }
 ],
 "frameCount": 24,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D5C7EB7_5F99_FDA0_41D5_D12355328A4E",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 360
  }
 ],
 "frameCount": 24,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D5CDEB8_5F99_FDA0_41B3_D0A81F81F8B3",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_52AE04BC_5C54_7287_41C7_A55B25F95ADE_1_HS_3_0.png",
   "class": "ImageResourceLevel",
   "width": 780,
   "height": 1170
  }
 ],
 "frameCount": 24,
 "rowCount": 6,
 "id": "AnimatedImageResource_7D5F3EB8_5F99_FDA0_41A6_6B7EED5ECF53",
 "frameDuration": 41
},
{
 "class": "ViewerArea",
 "paddingTop": 0,
 "transitionMode": "blending",
 "playbackBarBottom": 0,
 "id": "viewer_uidA3C061AB_B693_A604_41B5_E2C6522E3154",
 "width": "100%",
 "toolTipShadowHorizontalLength": 0,
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowVerticalLength": 0,
 "minHeight": 50,
 "borderSize": 0,
 "playbackBarHeadShadowHorizontalLength": 0,
 "toolTipBorderRadius": 3,
 "paddingRight": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderColor": "#000000",
 "toolTipPaddingLeft": 6,
 "vrPointerSelectionTime": 2000,
 "minWidth": 100,
 "playbackBarHeadWidth": 6,
 "progressBorderSize": 0,
 "toolTipDisplayTime": 600,
 "firstTransitionDuration": 0,
 "toolTipFontStyle": "normal",
 "progressLeft": 0,
 "playbackBarHeadShadowColor": "#000000",
 "toolTipShadowBlurRadius": 3,
 "progressBarBorderColor": "#000000",
 "playbackBarBorderRadius": 0,
 "progressBottom": 2,
 "toolTipBackgroundColor": "#F6F6F6",
 "toolTipFontWeight": "normal",
 "height": "100%",
 "propagateClick": false,
 "toolTipPaddingTop": 4,
 "playbackBarBackgroundColorDirection": "vertical",
 "toolTipBorderSize": 1,
 "toolTipPaddingBottom": 4,
 "toolTipFontFamily": "Arial",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "transitionDuration": 500,
 "progressRight": 0,
 "toolTipFontSize": "1.11vmin",
 "progressHeight": 10,
 "playbackBarProgressBorderSize": 0,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "playbackBarRight": 0,
 "progressBarBorderRadius": 0,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "shadow": false,
 "playbackBarHeadShadowVerticalLength": 0,
 "borderRadius": 0,
 "playbackBarProgressOpacity": 1,
 "playbackBarHeadBorderRadius": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBackgroundOpacity": 1,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "progressOpacity": 1,
 "playbackBarBorderSize": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "toolTipTextShadowOpacity": 0,
 "toolTipOpacity": 1,
 "playbackBarHeadBorderSize": 0,
 "vrPointerSelectionColor": "#FF6600",
 "progressBarOpacity": 1,
 "progressBorderRadius": 0,
 "toolTipFontColor": "#606060",
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "playbackBarHeadShadowBlurRadius": 3,
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadOpacity": 1,
 "progressBackgroundColorRatios": [
  0
 ],
 "playbackBarLeft": 0,
 "toolTipPaddingRight": 6,
 "toolTipShadowColor": "#333333",
 "vrPointerColor": "#FFFFFF",
 "progressBarBackgroundColorDirection": "vertical",
 "playbackBarHeadHeight": 15,
 "toolTipBorderColor": "#767676",
 "paddingBottom": 0,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipTextShadowBlurRadius": 3,
 "progressBarBorderSize": 0,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "data": {
  "name": "ViewerArea20972"
 },
 "toolTipShadowOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "paddingLeft": 0,
 "playbackBarHeight": 10,
 "playbackBarHeadShadow": true,
 "toolTipShadowSpread": 0,
 "progressBackgroundColorDirection": "vertical"
},
{
 "class": "HTMLText",
 "paddingLeft": 10,
 "borderRadius": 0,
 "scrollBarWidth": 10,
 "id": "htmltext_A3C121AC_B693_A61C_41E6_25BBA312DE9A",
 "width": "100%",
 "backgroundColorRatios": [
  0
 ],
 "minHeight": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "hideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 250
 },
 "paddingRight": 10,
 "minWidth": 0,
 "paddingBottom": 5,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 250
 },
 "data": {
  "name": "HTMLText20975"
 },
 "scrollBarMargin": 2,
 "paddingTop": 5,
 "shadow": false,
 "visible": false,
 "html": "",
 "backgroundOpacity": 0.7
},
{
 "class": "IconButton",
 "paddingLeft": 0,
 "borderRadius": 0,
 "id": "component_A3C6C1AD_B693_A61C_41DB_D753C2AB213A",
 "left": 10,
 "iconURL": "skin/album_left.png",
 "minHeight": 0,
 "borderSize": 0,
 "paddingRight": 0,
 "hideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 250
 },
 "top": "45%",
 "transparencyActive": true,
 "mode": "push",
 "verticalAlign": "middle",
 "horizontalAlign": "center",
 "minWidth": 0,
 "paddingBottom": 0,
 "click": "this.loadFromCurrentMediaPlayList(this.album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_AlbumPlayList, -1)",
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 250
 },
 "propagateClick": false,
 "data": {
  "name": "IconButton20976"
 },
 "paddingTop": 0,
 "shadow": false,
 "visible": false,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "class": "IconButton",
 "paddingLeft": 0,
 "borderRadius": 0,
 "id": "component_A3C6D1AD_B693_A61C_41D4_D82DBA57888D",
 "right": 10,
 "iconURL": "skin/album_right.png",
 "minHeight": 0,
 "borderSize": 0,
 "paddingRight": 0,
 "hideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 250
 },
 "top": "45%",
 "transparencyActive": true,
 "mode": "push",
 "verticalAlign": "middle",
 "horizontalAlign": "center",
 "minWidth": 0,
 "paddingBottom": 0,
 "click": "this.loadFromCurrentMediaPlayList(this.album_6076EEE4_5DF7_EE80_41C0_70404B70EF36_AlbumPlayList, 1)",
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 250
 },
 "propagateClick": false,
 "data": {
  "name": "IconButton20977"
 },
 "paddingTop": 0,
 "shadow": false,
 "visible": false,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "class": "PhotoAlbumPlayer",
 "buttonNext": "this.IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4",
 "id": "viewer_uidA3CF71A7_B693_A60C_41DE_8A6DDB9CB1B1PhotoAlbumPlayer",
 "buttonPrevious": "this.IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC",
 "viewerArea": "this.viewer_uidA3CF71A7_B693_A60C_41DE_8A6DDB9CB1B1"
},
{
 "class": "ViewerArea",
 "paddingTop": 0,
 "transitionMode": "blending",
 "playbackBarBottom": 0,
 "id": "viewer_uidA3C2F1A9_B693_A604_41D7_50EB314CB2A5",
 "width": "100%",
 "toolTipShadowHorizontalLength": 0,
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowVerticalLength": 0,
 "minHeight": 50,
 "borderSize": 0,
 "playbackBarHeadShadowHorizontalLength": 0,
 "toolTipBorderRadius": 3,
 "paddingRight": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderColor": "#000000",
 "toolTipPaddingLeft": 6,
 "vrPointerSelectionTime": 2000,
 "minWidth": 100,
 "playbackBarHeadWidth": 6,
 "progressBorderSize": 0,
 "toolTipDisplayTime": 600,
 "firstTransitionDuration": 0,
 "toolTipFontStyle": "normal",
 "progressLeft": 0,
 "playbackBarHeadShadowColor": "#000000",
 "toolTipShadowBlurRadius": 3,
 "progressBarBorderColor": "#000000",
 "playbackBarBorderRadius": 0,
 "progressBottom": 2,
 "toolTipBackgroundColor": "#F6F6F6",
 "toolTipFontWeight": "normal",
 "height": "100%",
 "propagateClick": false,
 "toolTipPaddingTop": 4,
 "playbackBarBackgroundColorDirection": "vertical",
 "toolTipBorderSize": 1,
 "toolTipPaddingBottom": 4,
 "toolTipFontFamily": "Arial",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "transitionDuration": 500,
 "progressRight": 0,
 "toolTipFontSize": "1.11vmin",
 "progressHeight": 10,
 "playbackBarProgressBorderSize": 0,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "playbackBarRight": 0,
 "progressBarBorderRadius": 0,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "shadow": false,
 "playbackBarHeadShadowVerticalLength": 0,
 "borderRadius": 0,
 "playbackBarProgressOpacity": 1,
 "playbackBarHeadBorderRadius": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBackgroundOpacity": 1,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "progressOpacity": 1,
 "playbackBarBorderSize": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "toolTipTextShadowOpacity": 0,
 "toolTipOpacity": 1,
 "playbackBarHeadBorderSize": 0,
 "vrPointerSelectionColor": "#FF6600",
 "progressBarOpacity": 1,
 "progressBorderRadius": 0,
 "toolTipFontColor": "#606060",
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "playbackBarHeadShadowBlurRadius": 3,
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadOpacity": 1,
 "progressBackgroundColorRatios": [
  0
 ],
 "playbackBarLeft": 0,
 "toolTipPaddingRight": 6,
 "toolTipShadowColor": "#333333",
 "vrPointerColor": "#FFFFFF",
 "progressBarBackgroundColorDirection": "vertical",
 "playbackBarHeadHeight": 15,
 "toolTipBorderColor": "#767676",
 "paddingBottom": 0,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipTextShadowBlurRadius": 3,
 "progressBarBorderSize": 0,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "data": {
  "name": "ViewerArea20965"
 },
 "toolTipShadowOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "paddingLeft": 0,
 "playbackBarHeight": 10,
 "playbackBarHeadShadow": true,
 "toolTipShadowSpread": 0,
 "progressBackgroundColorDirection": "vertical"
},
{
 "class": "HTMLText",
 "paddingLeft": 10,
 "borderRadius": 0,
 "scrollBarWidth": 10,
 "id": "htmltext_A3C391AA_B693_A604_41C1_4A59A88426E9",
 "width": "100%",
 "backgroundColorRatios": [
  0
 ],
 "minHeight": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "hideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 250
 },
 "paddingRight": 10,
 "minWidth": 0,
 "paddingBottom": 5,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 250
 },
 "data": {
  "name": "HTMLText20968"
 },
 "scrollBarMargin": 2,
 "paddingTop": 5,
 "shadow": false,
 "visible": false,
 "html": "",
 "backgroundOpacity": 0.7
},
{
 "class": "IconButton",
 "paddingLeft": 0,
 "borderRadius": 0,
 "id": "component_A3C331AA_B693_A604_41D4_B3AC1857729A",
 "left": 10,
 "iconURL": "skin/album_left.png",
 "minHeight": 0,
 "borderSize": 0,
 "paddingRight": 0,
 "hideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 250
 },
 "top": "45%",
 "transparencyActive": true,
 "mode": "push",
 "verticalAlign": "middle",
 "horizontalAlign": "center",
 "minWidth": 0,
 "paddingBottom": 0,
 "click": "this.loadFromCurrentMediaPlayList(this.album_623D971A_5DD7_9F83_417C_6FB0FF992743_AlbumPlayList, -1)",
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 250
 },
 "propagateClick": false,
 "data": {
  "name": "IconButton20969"
 },
 "paddingTop": 0,
 "shadow": false,
 "visible": false,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "class": "IconButton",
 "paddingLeft": 0,
 "borderRadius": 0,
 "id": "component_A3C341AA_B693_A604_41E5_9DB878730ACF",
 "right": 10,
 "iconURL": "skin/album_right.png",
 "minHeight": 0,
 "borderSize": 0,
 "paddingRight": 0,
 "hideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 250
 },
 "top": "45%",
 "transparencyActive": true,
 "mode": "push",
 "verticalAlign": "middle",
 "horizontalAlign": "center",
 "minWidth": 0,
 "paddingBottom": 0,
 "click": "this.loadFromCurrentMediaPlayList(this.album_623D971A_5DD7_9F83_417C_6FB0FF992743_AlbumPlayList, 1)",
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 250
 },
 "propagateClick": false,
 "data": {
  "name": "IconButton20970"
 },
 "paddingTop": 0,
 "shadow": false,
 "visible": false,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "class": "PhotoAlbumPlayer",
 "buttonNext": "this.IconButton_253A0D7D_3513_E866_41BC_277EBE69ACB4",
 "id": "viewer_uidA3C2F1A9_B693_A604_41D7_50EB314CB2A5PhotoAlbumPlayer",
 "buttonPrevious": "this.IconButton_26A59E96_3534_28A2_419C_6C5ADD7D1CAC",
 "viewerArea": "this.viewer_uidA3C2F1A9_B693_A604_41D7_50EB314CB2A5"
},
{
 "class": "ViewerArea",
 "paddingTop": 0,
 "transitionMode": "blending",
 "playbackBarBottom": 0,
 "id": "viewer_uidA3CE81A5_B693_A60C_41DE_F4C372E71AD2",
 "width": "100%",
 "toolTipShadowHorizontalLength": 0,
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowVerticalLength": 0,
 "minHeight": 50,
 "borderSize": 0,
 "playbackBarHeadShadowHorizontalLength": 0,
 "toolTipBorderRadius": 3,
 "paddingRight": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderColor": "#000000",
 "toolTipPaddingLeft": 6,
 "vrPointerSelectionTime": 2000,
 "minWidth": 100,
 "playbackBarHeadWidth": 6,
 "progressBorderSize": 0,
 "toolTipDisplayTime": 600,
 "firstTransitionDuration": 0,
 "toolTipFontStyle": "normal",
 "progressLeft": 0,
 "playbackBarHeadShadowColor": "#000000",
 "toolTipShadowBlurRadius": 3,
 "progressBarBorderColor": "#000000",
 "playbackBarBorderRadius": 0,
 "progressBottom": 2,
 "toolTipBackgroundColor": "#F6F6F6",
 "toolTipFontWeight": "normal",
 "height": "100%",
 "propagateClick": false,
 "toolTipPaddingTop": 4,
 "playbackBarBackgroundColorDirection": "vertical",
 "toolTipBorderSize": 1,
 "toolTipPaddingBottom": 4,
 "toolTipFontFamily": "Arial",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "transitionDuration": 500,
 "progressRight": 0,
 "toolTipFontSize": "1.11vmin",
 "progressHeight": 10,
 "playbackBarProgressBorderSize": 0,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "playbackBarRight": 0,
 "progressBarBorderRadius": 0,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "shadow": false,
 "playbackBarHeadShadowVerticalLength": 0,
 "borderRadius": 0,
 "playbackBarProgressOpacity": 1,
 "playbackBarHeadBorderRadius": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBackgroundOpacity": 1,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "progressOpacity": 1,
 "playbackBarBorderSize": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "toolTipTextShadowOpacity": 0,
 "toolTipOpacity": 1,
 "playbackBarHeadBorderSize": 0,
 "vrPointerSelectionColor": "#FF6600",
 "progressBarOpacity": 1,
 "progressBorderRadius": 0,
 "toolTipFontColor": "#606060",
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "playbackBarHeadShadowBlurRadius": 3,
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadOpacity": 1,
 "progressBackgroundColorRatios": [
  0
 ],
 "playbackBarLeft": 0,
 "toolTipPaddingRight": 6,
 "toolTipShadowColor": "#333333",
 "vrPointerColor": "#FFFFFF",
 "progressBarBackgroundColorDirection": "vertical",
 "playbackBarHeadHeight": 15,
 "toolTipBorderColor": "#767676",
 "paddingBottom": 0,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipTextShadowBlurRadius": 3,
 "progressBarBorderSize": 0,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "data": {
  "name": "ViewerArea20951"
 },
 "toolTipShadowOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "paddingLeft": 0,
 "playbackBarHeight": 10,
 "playbackBarHeadShadow": true,
 "toolTipShadowSpread": 0,
 "progressBackgroundColorDirection": "vertical"
},
{
 "class": "HTMLText",
 "paddingLeft": 10,
 "borderRadius": 0,
 "scrollBarWidth": 10,
 "id": "htmltext_A3CE11A6_B693_A60C_41CD_C7283FF4D447",
 "width": "100%",
 "backgroundColorRatios": [
  0
 ],
 "minHeight": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "hideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 250
 },
 "paddingRight": 10,
 "minWidth": 0,
 "paddingBottom": 5,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 250
 },
 "data": {
  "name": "HTMLText20954"
 },
 "scrollBarMargin": 2,
 "paddingTop": 5,
 "shadow": false,
 "visible": false,
 "html": "",
 "backgroundOpacity": 0.7
},
{
 "class": "IconButton",
 "paddingLeft": 0,
 "borderRadius": 0,
 "id": "component_A3CFE1A6_B693_A60C_41BC_F6E3E5C7C9F0",
 "left": 10,
 "iconURL": "skin/album_left.png",
 "minHeight": 0,
 "borderSize": 0,
 "paddingRight": 0,
 "hideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 250
 },
 "top": "45%",
 "transparencyActive": true,
 "mode": "push",
 "verticalAlign": "middle",
 "horizontalAlign": "center",
 "minWidth": 0,
 "paddingBottom": 0,
 "click": "this.loadFromCurrentMediaPlayList(this.album_705F61E7_5C4C_9281_41D4_67432D954851_AlbumPlayList, -1)",
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 250
 },
 "propagateClick": false,
 "data": {
  "name": "IconButton20955"
 },
 "paddingTop": 0,
 "shadow": false,
 "visible": false,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "class": "IconButton",
 "paddingLeft": 0,
 "borderRadius": 0,
 "id": "component_A3CFF1A6_B693_A60C_41A6_D06A56C7A8BE",
 "right": 10,
 "iconURL": "skin/album_right.png",
 "minHeight": 0,
 "borderSize": 0,
 "paddingRight": 0,
 "hideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 250
 },
 "top": "45%",
 "transparencyActive": true,
 "mode": "push",
 "verticalAlign": "middle",
 "horizontalAlign": "center",
 "minWidth": 0,
 "paddingBottom": 0,
 "click": "this.loadFromCurrentMediaPlayList(this.album_705F61E7_5C4C_9281_41D4_67432D954851_AlbumPlayList, 1)",
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 250
 },
 "propagateClick": false,
 "data": {
  "name": "IconButton20956"
 },
 "paddingTop": 0,
 "shadow": false,
 "visible": false,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "class": "ViewerArea",
 "paddingTop": 0,
 "transitionMode": "blending",
 "playbackBarBottom": 0,
 "id": "viewer_uidA3CF71A7_B693_A60C_41DE_8A6DDB9CB1B1",
 "width": "100%",
 "toolTipShadowHorizontalLength": 0,
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowVerticalLength": 0,
 "minHeight": 50,
 "borderSize": 0,
 "playbackBarHeadShadowHorizontalLength": 0,
 "toolTipBorderRadius": 3,
 "paddingRight": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderColor": "#000000",
 "toolTipPaddingLeft": 6,
 "vrPointerSelectionTime": 2000,
 "minWidth": 100,
 "playbackBarHeadWidth": 6,
 "progressBorderSize": 0,
 "toolTipDisplayTime": 600,
 "firstTransitionDuration": 0,
 "toolTipFontStyle": "normal",
 "progressLeft": 0,
 "playbackBarHeadShadowColor": "#000000",
 "toolTipShadowBlurRadius": 3,
 "progressBarBorderColor": "#000000",
 "playbackBarBorderRadius": 0,
 "progressBottom": 2,
 "toolTipBackgroundColor": "#F6F6F6",
 "toolTipFontWeight": "normal",
 "height": "100%",
 "propagateClick": false,
 "toolTipPaddingTop": 4,
 "playbackBarBackgroundColorDirection": "vertical",
 "toolTipBorderSize": 1,
 "toolTipPaddingBottom": 4,
 "toolTipFontFamily": "Arial",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "transitionDuration": 500,
 "progressRight": 0,
 "toolTipFontSize": "1.11vmin",
 "progressHeight": 10,
 "playbackBarProgressBorderSize": 0,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "playbackBarRight": 0,
 "progressBarBorderRadius": 0,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "shadow": false,
 "playbackBarHeadShadowVerticalLength": 0,
 "borderRadius": 0,
 "playbackBarProgressOpacity": 1,
 "playbackBarHeadBorderRadius": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBackgroundOpacity": 1,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "progressOpacity": 1,
 "playbackBarBorderSize": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "toolTipTextShadowOpacity": 0,
 "toolTipOpacity": 1,
 "playbackBarHeadBorderSize": 0,
 "vrPointerSelectionColor": "#FF6600",
 "progressBarOpacity": 1,
 "progressBorderRadius": 0,
 "toolTipFontColor": "#606060",
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "playbackBarHeadShadowBlurRadius": 3,
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadOpacity": 1,
 "progressBackgroundColorRatios": [
  0
 ],
 "playbackBarLeft": 0,
 "toolTipPaddingRight": 6,
 "toolTipShadowColor": "#333333",
 "vrPointerColor": "#FFFFFF",
 "progressBarBackgroundColorDirection": "vertical",
 "playbackBarHeadHeight": 15,
 "toolTipBorderColor": "#767676",
 "paddingBottom": 0,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipTextShadowBlurRadius": 3,
 "progressBarBorderSize": 0,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "data": {
  "name": "ViewerArea20958"
 },
 "toolTipShadowOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "paddingLeft": 0,
 "playbackBarHeight": 10,
 "playbackBarHeadShadow": true,
 "toolTipShadowSpread": 0,
 "progressBackgroundColorDirection": "vertical"
},
{
 "class": "HTMLText",
 "paddingLeft": 10,
 "borderRadius": 0,
 "scrollBarWidth": 10,
 "id": "htmltext_A3CC51A8_B693_A604_41B2_B37C9AB0A59C",
 "width": "100%",
 "backgroundColorRatios": [
  0
 ],
 "minHeight": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "hideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 250
 },
 "paddingRight": 10,
 "minWidth": 0,
 "paddingBottom": 5,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 250
 },
 "data": {
  "name": "HTMLText20961"
 },
 "scrollBarMargin": 2,
 "paddingTop": 5,
 "shadow": false,
 "visible": false,
 "html": "",
 "backgroundOpacity": 0.7
},
{
 "class": "IconButton",
 "paddingLeft": 0,
 "borderRadius": 0,
 "id": "component_A3CDE1A9_B693_A604_41D5_5E15E0317913",
 "left": 10,
 "iconURL": "skin/album_left.png",
 "minHeight": 0,
 "borderSize": 0,
 "paddingRight": 0,
 "hideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 250
 },
 "top": "45%",
 "transparencyActive": true,
 "mode": "push",
 "verticalAlign": "middle",
 "horizontalAlign": "center",
 "minWidth": 0,
 "paddingBottom": 0,
 "click": "this.loadFromCurrentMediaPlayList(this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_AlbumPlayList, -1)",
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 250
 },
 "propagateClick": false,
 "data": {
  "name": "IconButton20962"
 },
 "paddingTop": 0,
 "shadow": false,
 "visible": false,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "class": "IconButton",
 "paddingLeft": 0,
 "borderRadius": 0,
 "id": "component_A3CDF1A9_B693_A604_41E0_836F6E5FD4F2",
 "right": 10,
 "iconURL": "skin/album_right.png",
 "minHeight": 0,
 "borderSize": 0,
 "paddingRight": 0,
 "hideEffect": {
  "easing": "cubic_in_out",
  "class": "FadeOutEffect",
  "duration": 250
 },
 "top": "45%",
 "transparencyActive": true,
 "mode": "push",
 "verticalAlign": "middle",
 "horizontalAlign": "center",
 "minWidth": 0,
 "paddingBottom": 0,
 "click": "this.loadFromCurrentMediaPlayList(this.album_6F2DDDE7_5C7D_F281_41D6_67018A3C863A_AlbumPlayList, 1)",
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 250
 },
 "propagateClick": false,
 "data": {
  "name": "IconButton20963"
 },
 "paddingTop": 0,
 "shadow": false,
 "visible": false,
 "cursor": "hand",
 "backgroundOpacity": 0
}],
 "scrollBarVisible": "rollOver",
 "propagateClick": false,
 "height": "100%",
 "shadow": false,
 "backgroundPreloadEnabled": true,
 "overflow": "hidden",
 "defaultVRPointer": "laser",
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "layout": "absolute",
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
