/* GCompris - letter-in-word.js
 *
 * Copyright (C) 2014 Holger Kaelberer
 *               2016 Akshat Tandon
 *
 * Authors:
 *   Holger Kaelberer <holger.k@elberer.de> (Qt Quick port)
 *   Akshat Tandon    <akshat.tandon@research.iiit.ac.in>
 *
 *   This program is free software; you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation; either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program; if not, see <http://www.gnu.org/licenses/>.
 */

.pragma library
.import QtQuick 2.0 as Quick
.import GCompris 1.0 as GCompris //for ApplicationInfo
.import "qrc:/gcompris/src/core/core.js" as Core

var url = "qrc:/gcompris/src/activities/letter-in-word/resource/"
var defaultLevelsFile = ":/gcompris/src/activities/letter-in-word/resource/levels/levels-en.json";
var maxLettersPerLine = 6;

var levels;
var currentLevel;
var maxLevel;
var currentSubLevel;
var currentLetter;
var maxSubLevel;
var level;
var questions;
var words;
var items;

function start(_items)
{
    Core.checkForVoices(_items.main);

    items = _items;


    // register the voices for the locale
    var locale = GCompris.ApplicationInfo.getVoicesLocale(items.locale)
    GCompris.DownloadManager.updateResource(GCompris.DownloadManager.getVoicesResourceForLocale(locale))

    loadLevels();
    currentLevel = 0;
    currentSubLevel = 0;
    maxLevel = levels.length;
    initLevel();
}

function validateLevels(levels)
{
    var i;
    for (i = 0; i < levels.length; i++) {
        if (undefined === levels[i].questions
            || typeof levels[i].questions != "string"
            || levels[i].questions.length < 1
            || typeof levels[i].words != "object"
            || levels[i].words.length < 1)
            return false;
    }
    if (i < 1)
        return false;
    return true;
}

function loadLevels()
{
    var ret;
    var filename = GCompris.ApplicationInfo.getLocaleFilePath(url + "levels/levels-$LOCALE.json");
    levels = items.parser.parseFromUrl(filename);
    if (levels == null) {
        console.warn("Click_on_letter: Invalid levels file " + filename);
        // fallback to default Latin (levels-en.json) file:
        levels = items.parser.parseFromUrl(defaultLevelsFile);
        if (levels == null) {
            console.error("Click_on_letter: Invalid default levels file "
                + defaultLevelsFile + ". Can't continue!");
            // any way to error-exit here?
            return;
        }
    }
}

function stop()
{
     items.animateX.stop()
}

function shuffleString(s)
{
    var a = s.split("");
    var n = a.length;

    for(var i = n-1; i>0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}

function initLevel() {
    items.bar.level = currentLevel + 1;
    if (currentSubLevel == 0) {
        level = levels[currentLevel];
        maxSubLevel = level.questions.length;
        items.score.numberOfSubLevels = maxSubLevel;
        items.score.currentSubLevel = "1";
        questions = shuffleString(level.questions);
        items.wordsModel.clear();
        words = level.words.split(",")
        for (var i = 0; i < words.length; i++) {
            words[i] = words[i].trim()
            items.wordsModel.append({
                "spelling": words[i],
                "imgurl": url + "images/" + words[i] + ".svg",
                "selected": false
            });
        }
    } else {
        items.score.currentSubLevel = currentSubLevel + 1;
    }

    for(var i = 0; i < words.length; i++){
        items.wordsModel.setProperty(i, "selected", false);
    }

    var locale = GCompris.ApplicationInfo.getVoicesLocale(items.locale);
    currentLetter = questions.split("")[currentSubLevel];
    items.question = currentLetter
    items.animateX.restart()
    if (GCompris.ApplicationSettings.isAudioVoicesEnabled &&
            GCompris.DownloadManager.haveLocalResource(
                GCompris.DownloadManager.getVoicesResourceForLocale(locale))) {
        items.audioVoices.append(GCompris.ApplicationInfo.getAudioFilePath("voices-$CA/"+locale+"/misc/click_on_letter.$CA"));
        items.audioVoices.silence(100)
        playLetter(currentLetter)
        items.repeatItem.visible = true
    } else {
        // no sound -> show question
        items.repeatItem.visible = false
    }

}

function playLetter(letter) {
    var locale = GCompris.ApplicationInfo.getVoicesLocale(items.locale)
    items.audioVoices.append(GCompris.ApplicationInfo.getAudioFilePath("voices-$CA/"+locale+"/alphabet/"
                                                                       + Core.getSoundFilenamForChar(letter)))
}

function nextLevel() {
    items.audioVoices.clearQueue()
    if(maxLevel <= ++currentLevel ) {
        currentLevel = 0
    }
    currentSubLevel = 0;
    initLevel();
}

function previousLevel() {
    items.audioVoices.clearQueue()
    if(--currentLevel < 0) {
        currentLevel = maxLevel - 1
    }
    currentSubLevel = 0;
    initLevel();
}

function nextSubLevel() {
    if( ++currentSubLevel >= maxSubLevel) {
        currentSubLevel = 0
        nextLevel()
    }
    initLevel();
}

function checkAnswer()
{
    var checkFlag = false;
    var modelEntry;
    for(var i = 0; i < words.length; i++){
        modelEntry = items.wordsModel.get(i);
        for(var j = 0; j < modelEntry.spelling.length; j++){
            if(currentLetter == modelEntry.spelling.charAt(j) && modelEntry.selected == false){
                checkFlag = true;
                break;
            }
        }
    }
    if(checkFlag == false){
        items.bonus.good("flower");
    }
}

function checkWord(index)
{
    var modelEntry = items.wordsModel.get(index);
    for(var i = 0; i < modelEntry.spelling.length; i++){
        if(currentLetter ==  modelEntry.spelling.charAt(i)){
            items.wordsModel.setProperty(index, "selected", true);
            checkAnswer();
            return true;
        }
    }
    return false;
}