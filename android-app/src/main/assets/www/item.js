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

function Item() {
    this.x = null;
    this.y = null;
    
    this.draw = function() {
        if (this.x == null) {
            var position = [Math.random() * SCREEN_WIDTH, Math.random() * SCREEN_HEIGHT];
            var isValid = true;
            var distanceF1 = Math.sqrt(Math.pow(position[0] - FOCI_X, 2) + Math.pow(position[1] - FOCUS_1_Y, 2));
            var distanceF2 = Math.sqrt(Math.pow(position[0] - FOCI_X, 2) + Math.pow(position[1] - FOCUS_2_Y, 2));
            if (distanceF1 + distanceF2 < SCREEN_HEIGHT - LINEAR_WIDTH) {
                for (var i = 0; i < centers.length && isValid; i++) {
                    isValid = !centers[i].collide(position);
                }
            } else {
                isValid = false;
            }
            if (isValid) {
                this.x = position[0];
                this.y = position[1];
                this.actualDraw();
            }
        } else {
            this.actualDraw();
        }
    }
    
    this.actualDraw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, LINEAR_WIDTH / 2, 0, Math.PI * 2, false);
        ctx.fill();
    }
    
    this.reset = function() {
        this.x = this.y = null;
    }
    
    this.isDrawn = function() {
        return this.x != null;
    }
    
    this.getPosition = function() {
        return [this.x, this.y];
    }
}