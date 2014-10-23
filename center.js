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

function Center(x, y, direction, startRot, endRot) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.startRot = startRot;
    this.endRot = endRot;
    this.growth = 0;
    
    this.moveStart = function(rotDiff) {
        if (this.direction > 0) {
            this.endRot += rotDiff;
        } else {
            this.startRot -= rotDiff;
        }
    }
    
    this.moveEnd = function(rotDiff) {
        if (this.growth > 0) {
            var tempGrowth = this.growth;
            this.growth -= rotDiff;
            rotDiff -= tempGrowth;
        }
        if (rotDiff > 0) {
            if (this.direction > 0) {
                this.startRot += rotDiff;
            } else {
                this.endRot -= rotDiff;
            }
        }
        return this.startRot - this.endRot;
    }
    
    this.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, RADIUS, this.startRot, this.endRot, false);
        ctx.stroke();
    }
    
    this.mustShift = function() {
        return this.startRot >= this.endRot;
    }
    
    this.collide = function(position) {
        var distance = Math.sqrt(Math.pow(position[0] - this.x, 2) + Math.pow(position[1] - this.y, 2));
        if (distance >= RADIUS - LINEAR_WIDTH && distance <= RADIUS + LINEAR_WIDTH) {
            var angle = Math.acos((position[0] - this.x) / distance);
            if (this.y > position[1]) {
                angle = 2 * Math.PI - angle;
            }
            nStartRot = normalizeAngle(this.startRot - CIRCULAR_WIDTH);
            nEndRot = normalizeAngle(this.endRot + CIRCULAR_WIDTH);
            if (nStartRot < nEndRot) {
                return angle >= nStartRot && angle <= nEndRot;
            } else {
                return !(angle >= nEndRot && angle <= nStartRot);
            }
        } else {
            return false;
        }
    }
    
    this.collideSelf = function() {
        return this.endRot - this.startRot >= 2 * Math.PI - 2 * CIRCULAR_WIDTH;
    }
    
    this.getEndPosition = function() {
        if (this.direction > 0) {
            return [this.x + Math.cos(this.endRot) * RADIUS, this.y + Math.sin(this.endRot) * RADIUS];
        } else {
            return [this.x + Math.cos(this.startRot) * RADIUS, this.y + Math.sin(this.startRot) * RADIUS];
        }
    }
    
    this.getLength = function() {
        return Math.abs(this.endRot - this.startRot);
    }
    
    this.isOffBorders = function() {
        var endPosition = this.getEndPosition();
        var distanceF1 = Math.sqrt(Math.pow(endPosition[0] - FOCI_X, 2) + Math.pow(endPosition[1] - FOCUS_1_Y, 2));
        var distanceF2 = Math.sqrt(Math.pow(endPosition[0] - FOCI_X, 2) + Math.pow(endPosition[1] - FOCUS_2_Y, 2));
        return distanceF1 + distanceF2 >= SCREEN_HEIGHT - LINEAR_WIDTH;
    }
    
    this.grow = function() {
        this.growth = DISTANCE;
    }
}