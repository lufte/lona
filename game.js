/*
 * Copyright (c) 2013, Javier Ayres
 *
 * This file is part of Lona.
 *
 * Lona is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Lona is distributed in the hope that it will
 * be useful, but WITHOUT ANY WARRANTY; without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * Lona. If not, see <http://www.gnu.org/licenses/>.
 */

//Snake constants
var SPEED = 0.003; //Rotation speed, in radians/ms.
var DISTANCE = 0.5; //Distance between body parts, in radians.
var RADIUS, LINEAR_WIDTH, CIRCULAR_WIDTH;

//Display constants
var SCREEN_WIDTH, SCREEN_HEIGHT, FOCI_X, FOCUS_1_Y, FOCUS_2_Y, BORDER_WIDTH;
var MAX_SCORE_KEY = 'hs';

//Global snake variables
var centers, item, rotDiff, now, lastRepaint, score, isPaused;
//Global screen variables
var container, canvas, svg, ellipse, ctx, scoreSpan, pauseButton, playButton,
    maxSpan, gameOverContainer, gameOverMessage, fontSize;

function initScreen() {
    container = document.getElementById('container');
    canvas = document.getElementById('c');
    svg = document.getElementById('s');
    ellipse = document.getElementById('e');
    scoreSpan = document.getElementById('score');
    pauseButton = document.getElementById('pause');
    playButton = document.getElementById('play');
    maxSpan = document.getElementById('max');
    gameOverContainer = document.getElementById('game-over-container');
    gameOverMessage = document.getElementById('game-over');

    //Get support for touch events
    if (!!('ontouchstart' in window)) {
        document.body.addEventListener('touchstart', tap, {
                passive: false
            },
            false);
    }
    // also enable click and keyboard on notebook with touchscreen
    document.body.addEventListener('mousedown', tap, {
        passive: false
    }, false);
    document.body.addEventListener('keydown', tap, {
        passive: false
    }, false);

    /**
     * Provides requestAnimationFrame in a cross browser way.
     * @author paulirish / http://paulirish.com/
     * https://gist.github.com/mrdoob/838785
     */
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = (function () {
            return window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function ( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
                    window.setTimeout(callback, 1000 / 60);
                };
        })();
    }

    //Get window size
    if (window.innerWidth / window.innerHeight > 2 / 3) {
        SCREEN_HEIGHT = window.innerHeight;
        SCREEN_WIDTH = Math.round(window.innerHeight * 2 / 3);
        //canvas.style.left = Math.round((window.innerWidth - SCREEN_WIDTH) / 2) + 'px';
        //svg.style.left = Math.round((window.innerWidth - SCREEN_WIDTH) / 2) + 'px';
    } else {
        SCREEN_WIDTH = window.innerWidth;
        SCREEN_HEIGHT = Math.round(window.innerWidth * 3 / 2);
    }
    BORDER_WIDTH = Math.round(SCREEN_WIDTH / 64);
    //Set lona's constants based on screen dimentions
    RADIUS = Math.round(SCREEN_WIDTH / 12.8);
    LINEAR_WIDTH = Math.round(SCREEN_WIDTH / 13.3);
    CIRCULAR_WIDTH = LINEAR_WIDTH / (RADIUS * 2);

    //Set canvas size
    container.style.width = SCREEN_WIDTH + 'px';
    container.style.height = SCREEN_HEIGHT + 'px';
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    svg.setAttribute('width', SCREEN_WIDTH);
    svg.setAttribute('height', SCREEN_HEIGHT);
    ellipse.setAttribute('cx', SCREEN_WIDTH / 2);
    ellipse.setAttribute('cy', SCREEN_HEIGHT / 2);
    ellipse.setAttribute('rx', SCREEN_WIDTH / 2 - BORDER_WIDTH);
    ellipse.setAttribute('ry', SCREEN_HEIGHT / 2 - BORDER_WIDTH);
    ellipse.setAttribute('stroke-width', BORDER_WIDTH * 2);
    fontSize = Math.round(SCREEN_WIDTH / 8) + 'px';
    document.body.style.fontSize = fontSize;
    document.querySelectorAll('svg.icon').forEach(function (icon) {
        icon.style.height = fontSize;
    })
    document.querySelectorAll('#play,#pause').forEach(function (icon) {
        icon.style.height = Math.round(SCREEN_WIDTH / 6) + 'px';
    })
    //Shrink SCREEN_WIDTH and SCREEN_HEIGHT to take the ellipse's border into account
    SCREEN_WIDTH -= BORDER_WIDTH * 4;
    SCREEN_HEIGHT -= BORDER_WIDTH * 4;

    //Set ellipse's centers
    FOCI_X = Math.round(SCREEN_WIDTH / 2) + BORDER_WIDTH * 2;
    //f² = a² - b²
    FOCUS_1_Y = SCREEN_HEIGHT / 2 - Math.sqrt(Math.pow((SCREEN_HEIGHT - LINEAR_WIDTH) / 2, 2) - Math.pow((SCREEN_WIDTH - LINEAR_WIDTH) / 2, 2)) + BORDER_WIDTH * 2;
    FOCUS_2_Y = SCREEN_HEIGHT / 2 + Math.sqrt(Math.pow((SCREEN_HEIGHT - LINEAR_WIDTH) / 2, 2) - Math.pow((SCREEN_WIDTH - LINEAR_WIDTH) / 2, 2)) + BORDER_WIDTH * 2;

    isPaused = false;
    if (typeof (Storage) !== "undefined") {
        max.innerHTML = localStorage.getItem(MAX_SCORE_KEY);
        if (max.innerHTML == '') {
            max.innerHTML = '0';
        }
    }

    ctx = canvas.getContext('2d');
    ctx.lineWidth = LINEAR_WIDTH;
    ctx.strokeStyle = '#FFDB21';
    ctx.fillStyle = '#FFDB21';
    ctx.lineCap = 'round';

    go();
}

function go() {
    centers = new Array(new Center(Math.round(SCREEN_WIDTH / 2), Math.round(SCREEN_HEIGHT / 2), 1, 0, DISTANCE * 9));
    item = new Item();
    lastRepaint = new Date().getTime();
    score = 0;
    scoreSpan.innerHTML = score + '';
    requestAnimationFrame(loop);
}

function loop() {
    if (!isPaused) {
        now = new Date().getTime();
        rotDiff = SPEED * (now - lastRepaint);
        ctx.clearRect(0, 0, SCREEN_WIDTH + BORDER_WIDTH * 4, SCREEN_HEIGHT + BORDER_WIDTH * 4);
        centers[centers.length - 1].moveStart(rotDiff);
        if (item.isDrawn() && centers[centers.length - 1].collide(item.getPosition())) {
            item.reset();
            centers[0].grow();
            score++;
            scoreSpan.innerHTML = score + '';
            if (parseInt(max.innerHTML, 10) < score) {
                max.innerHTML = scoreSpan.innerHTML;
            }
        }
        item.draw();
        var i = 0;
        while (i < centers.length && rotDiff > 0) {
            rotDiff = centers[i].moveEnd(rotDiff);
            if (centers[i].mustShift()) {
                centers.shift();
            } else {
                i++;
            }
        }
        var collision = false;
        var offBorders = false;
        var currentLength = 0;
        for (var j = centers.length - 1; j >= 0; j--) {
            currentLength += centers[j].getLength();
            if (currentLength >= 2 * Math.PI - 2 * CIRCULAR_WIDTH && !collision) {
                if (j == centers.length - 1) {
                    collision = centers[j].collideSelf();
                    offBorders = centers[j].isOffBorders();
                } else {
                    collision = centers[j].collide(centers[centers.length - 1].getEndPosition());
                }
            }
            if (j == centers.length - 1) {
                offBorders = centers[j].isOffBorders();
            }
            centers[j].draw();
        }
        if (collision || offBorders) {
            gameOver();
            setTelegramHighScore(score);
            if (score > localStorage.getItem(MAX_SCORE_KEY)) {
                localStorage.setItem(MAX_SCORE_KEY, score);
            }
        } else {
            requestAnimationFrame(loop);
            lastRepaint = now;
        }
    }
}

function tap(event) {
    if (
        !isPaused &&
        event.target.id != 'pause' &&
        event.target.id != 'play' &&
        event.target.id != 'about' &&
        event.target.id != 'restart'
    ) {
        event.preventDefault();
        var last = centers[centers.length - 1];
        centers.push(
            new Center(
                last.x + Math.cos(last.direction > 0 ? last.endRot : last.startRot) * 2 * RADIUS,
                last.y + Math.sin(last.direction > 0 ? last.endRot : last.startRot) * 2 * RADIUS,
                -last.direction,
                (Math.PI + (last.direction > 0 ? last.endRot : last.startRot)),
                (Math.PI + (last.direction > 0 ? last.endRot : last.startRot))
            )
        );
    }
}

function normalizeAngle(angle) {
    return angle >= 0 ? angle % (Math.PI * 2) : angle % (Math.PI * 2) + (Math.PI * 2);
}

function pause() {
    if (isPaused) {
        isPaused = false;
        lastRepaint = new Date().getTime();
        pauseButton.style.display = 'inherit';
        playButton.style.display = 'none';
        loop();
    } else {
        isPaused = true;
        pauseButton.style.display = 'none';
        playButton.style.display = 'inherit';
    }
}

function showAbout() {
    window.location = 'about.html';
}

function gameOver() {
    gameOverContainer.style.visibility = 'visible';
    gameOverMessage.style.visibility = 'visible';
    gameOverContainer.style.opacity = 0.3;
    gameOverMessage.style.opacity = 1;
    setTimeout(function () {
        gameOverContainer.addEventListener('click', restart, false);
        gameOverMessage.addEventListener('click', restart, false);
    }, 1000);

}

function restart() {
    gameOverContainer.style.visibility = 'hidden';
    gameOverMessage.style.visibility = 'hidden';
    gameOverContainer.style.opacity = 0;
    gameOverMessage.style.opacity = 0;
    gameOverContainer.removeEventListener('click', restart);
    gameOverMessage.removeEventListener('click', restart);
    go();
}

/**
 * Check if this game was initiated from a Telegram chat and set the highscore.
 */
function setTelegramHighScore(score) {
    if (location.hash.indexOf('user_id') > -1 && location.hash.indexOf('inline_message_id') > -1) {
        var req = new XMLHttpRequest();
        req.open('POST', 'https://lonagamebot-b0.rhcloud.com/sethighscore');
        req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        req.send(location.hash.substring(1).split('#')[0] + '&highscore=' + score);
    }
}