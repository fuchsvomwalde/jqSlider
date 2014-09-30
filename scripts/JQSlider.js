"use strict";

// FRAMEWORK
function JQSlider(type, args) {
    var self = this;

    // Input Validation
    if (typeof args.data !== 'object') {
        console.log("Initialization failed. Argument 'data' undefined.");
        return;
    }

    // Attributes
    this._element = {
        dom: document.querySelector(type),
        tracks: []
    };
    this._unit;
    if (args.unit) this._unit = args.unit;
    this._size = 300;
    if (args.maxSize) this._size = args.maxSize;
    this._backgroundColor = "#000000";
    if (args.backgroundColor) this._backgroundColor = args.backgroundColor;
    this._minValue = 0
    if (args.minValue) this._minValue = args.minValue;
    this._maxValue = 100;
    if (args.maxValue) this._maxValue = args.maxValue;
    this._globalFixedSum = true;
    if (args.globalFixedSum) this._globalFixedSum = args.globalFixedSum;
    this._wrapper;
    this._spinner;
    this._slideContainer;
    this._status = JQSlider.STATUS_DISPLAY;
    this._currentTrack;

    // Methods
    this._closeAfterTimeout;
    this._valueToDegree = function(value) {
        var degree;
        if (value >= self._maxValue) {
            degree = 360;
        } else if (value <= self._minValue) {
            degree = 0;
        } else {
            var spectrum = self._maxValue - self._minValue;
            var degree = 360 / spectrum * (value - self._minValue);
        }
        degree = degree + self._currentTrack.start % 360;
        return degree;
    };
    this._degreeToValue = function(degree) {
        degree = (degree + 360 - self._currentTrack.start) % 360;
        var spectrum = self._maxValue - self._minValue;
        var value = (spectrum / 360 * degree) + self._minValue;
        return value;
    };
    this.spinStart = function(e) {
        console.log("Spin Start");

        self._setStyle(0);
        self._status = JQSlider.STATUS_ACTIVE;
        window.clearTimeout(self._closeAfterTimeout);

        var theta = self._getTouchPosition(e);
        self._currentTrack = self._getTrackForPosition(theta);
        self._spinner.style.backgroundColor = self._currentTrack.color;
        var spinnerPosition = self._valueToDegree(self._currentTrack.value);
        self._setSpinnerPosition(spinnerPosition);

        window.addEventListener("touchend", self.spinStop, false);
        window.addEventListener("touchcancel", self.spinStop, false);
        window.addEventListener("touchleave", self.spinStop, false);
        window.addEventListener("touchmove", self.spinMove, false);

        window.onmousemove = self.spinMove;
        window.onmouseup = self.spinStop;
    };
    this.spinMove = function(e) {
        console.log("Spin Move");
        self._status = JQSlider.STATUS_SLIDING;

        var spinnerPosition = self._getTouchPosition(e);
        self._setSpinnerPosition(spinnerPosition);
        var spinnerValue = self._degreeToValue(spinnerPosition);
        self._updateTrackValue(spinnerValue);

        console.log(spinnerPosition);
    };
    this.spinStop = function(e) {
        console.log("Spin Stop");
        self._status = JQSlider.STATUS_DISPLAY;
        self._closeAfterTimeout = window.setTimeout(self._editStop, 1000);

        window.onmousemove = null;
        window.onmouseup = null;

        window.removeEventListener("touchend", self.spinStop, false);
        window.removeEventListener("touchcancel", self.spinStop, false);
        window.removeEventListener("touchleave", self.spinStop, false);
        window.removeEventListener("touchmove", self.spinMove, false);
    };
    this._updateTrackValue = function(value) {
        // var sum = 0;
        // var changeableSum = 0;
        // var countChangableTracks = 0;
        for (var i = 0; i < self._element.tracks.length; i++) {
            var track = self._element.tracks[i];
            // sum += track.value;
            if (track.label === self._currentTrack.label) {
                value = Math.round(value);
                self._element.tracks[i].value = value;
                track.dom.querySelector(".JQ-track-value").textContent = value;
            } else if (track.lock == false) {
                // changeableSum += track.value;
                // countChangableTracks++;
            }
        }

        // if (self._globalFixedSum == true) {
        //     if (sum != self._maxValue) {
        //         var missingValue = self._maxValue - sum;
        //         var delta = missingValue / countChangableTracks;
        //         for (var i = 0; i < self._element.tracks.length; i++) {
        //             var track = self._element.tracks[i];
        //             if (track.label !== self._currentTrack.label && track.lock == false) {
        //                 value = Math.round(track.value + delta);
        //                 self._element.tracks[i].value = value;
        //                 track.dom.querySelector(".JQ-track-value").textContent = value;
        //             }
        //         }
        //     } 
        // }
    };
    this._setSpinnerPosition = function(degree) {

        self._slideContainer.style.transform = "rotate(" + (180 + self._currentTrack.start % 360) + "deg)";

        self._spinner.style.transform = "rotate(" + (180 + degree + 360 - self._currentTrack.start % 360) + "deg)";
        if ((degree + 360 - self._currentTrack.start) % 360 >= 180) {
            self._wrapper.style.overflow = "visible";
            self._wrapper.style.background = self._currentTrack.color;
        } else {
            self._wrapper.style.overflow = "hidden";
            self._wrapper.style.background = "transparent";
        }
    };
    this._editStop = function() {
        if (self._status === JQSlider.STATUS_DISPLAY) {
            self._setStyle(50);
        }
    };
    this._getTouchPosition = function(e) {
        var touchX = 0;
        var touchY = 0;

        if (e.changedTouches) {
            var touches = e.changedTouches;
            // for (var i=0; i < touches.length; i++) {
            touchX = touches[0].pageX;
            touchY = touches[0].pageY;
            // }
        } else {
            touchX = e.pageX;
            touchY = e.pageY;
        }

        var x = touchX - self._element.dom.offsetLeft - self._element.dom.offsetWidth / 2;
        var y = touchY - self._element.dom.offsetTop - self._element.dom.offsetHeight / 2;
        var theta = Math.atan2(y, x)
        if (theta < 0) theta += 2 * Math.PI;
        theta = (theta * 180 / Math.PI + 90) % 360;

        return theta;
    };
    this._getTrackForPosition = function(degree) {
        for (var i = 0; i < self._element.tracks.length; i++) {
            var track = self._element.tracks[i];
            if (degree > track.start && degree <= track.end) {
                // console.log("Deg: " + degree);
                // console.log("Start: " + track.start);
                // console.log("End: " + track.end);
                // console.log(track.label);
                return track;
            } else if ((track.end - track.start) < 0 && (degree <= track.end || degree > track.start)) {
                // console.log("Deg: " + degree);
                // console.log("Start: " + track.start);
                // console.log("End: " + track.end);
                // console.log(track.label);
                return track;
            } else {
                continue;
            }
        }
        return null;
    };
    this._setStyle = function(margin) {
        var startSize = self._size - margin;
        var t = ".5s"

        self._element.dom.style.height = startSize + "px";
        self._element.dom.style.width = startSize + "px";
        self._element.dom.style.margin = margin / 2 + "px";
        self._element.dom.style.borderRadius = startSize / 2 + "px";
        self._element.dom.style.transition = "height " + t + ", width " + t + ", margin " + t + ", border-radius " + t;

        self._slideContainer.style.height = startSize + "px";
        self._slideContainer.style.width = startSize + "px";
        self._slideContainer.style.borderRadius = startSize / 2 + "px";
        self._slideContainer.style.transition = "height " + t + ", width " + t + ", border-radius " + t;

        self._wrapper.style.height = startSize + "px";
        self._wrapper.style.width = startSize / 2 + "px";
        self._wrapper.style.borderRadius = startSize / 2 + "px 0 0 " + startSize / 2 + "px";
        self._wrapper.style.transition = "height " + t + ", width " + t + ", border-radius " + t;

        self._spinner.style.height = startSize + "px";
        self._spinner.style.width = startSize + "px";
        self._spinner.style.borderRadius = startSize / 2 + "px 0 0 " + startSize / 2 + "px";
        self._spinner.style.clip = "rect(0px," + startSize / 2 + "px," + startSize + "px,0px)";
        self._spinner.style.transition = "height " + t + ", width " + t + ", border-radius " + t + ", clip " + t;
    };

    // Constructor/Initialization
    this._element.dom.style.backgroundColor = this._backgroundColor;

    var innerCircle = document.createElement('div');
    innerCircle.className = "JQ-inner-circle";
    innerCircle.style.backgroundColor = this._backgroundColor;
    this._element.dom.appendChild(innerCircle);

    this._slideContainer = document.createElement('div');
    this._slideContainer.className = "JQ-radial-slide-container";

    this._wrapper = document.createElement('div');
    this._wrapper.className = "JQ-radial-slide-mask";
    this._slideContainer.appendChild(this._wrapper);

    this._spinner = document.createElement('div');
    this._spinner.className = "JQ-radial-slide-spinner";
    this._spinner.style.transform = "rotate(180deg)";
    this._wrapper.appendChild(this._spinner);
    this._setStyle(50);

    this._element.dom.appendChild(this._slideContainer);

    for (var i = 0; i < args.data.length; i++) {
        var startPosition;
        var trackLength;
        var track = {};

        track.label = args.data[i].label;
        track.color = args.data[i].color;
        track.value = args.data[i].value;
        track.lock = false;

        startPosition = 360 * i * 1 / args.data.length;
        trackLength = 360 / args.data.length;
        console.log("ID:" + i);
        console.log("START:" + startPosition);
        console.log("LENGTH:" + trackLength);

        track.start = startPosition + trackLength / 2; //(startPosition + 360 - trackLength) % 360;
        track.end = (startPosition + trackLength + trackLength / 2) % 360; //(startPosition + trackLength + 360 - trackLength) % 360;

        var trackContainer = document.createElement('div');
        trackContainer.id = "JQ-track-" + i;
        trackContainer.style.transform = "rotate(" + (startPosition + trackLength / 2 + 180) % 360 + "deg)";
        trackContainer.className = "JQ-handle-track-container";

        var wrapper = document.createElement('div');
        wrapper.className = "JQ-handle-track-mask";
        if (trackLength >= 180) {
            wrapper.style.overflow = "visible";
            wrapper.style.background = track.color;
            wrapper.onmousedown = this.spinStart;
            wrapper.addEventListener("touchstart", this.spinStart, false);
        } else {
            wrapper.style.overflow = "hidden";
            wrapper.style.background = "transparent";
        }
        trackContainer.appendChild(wrapper);

        var trackPiece = document.createElement('div');
        trackPiece.className = "JQ-handle-track-piece";
        trackPiece.style.backgroundColor = track.color;
        trackPiece.style.transform = "rotate(" + (trackLength + 180) % 360 + "deg)";
        // trackPiece.onmousedown = this.spinStart;
        // trackPiece.addEventListener("touchstart", this.spinStart, false);
        wrapper.appendChild(trackPiece);

        var labelContainer = document.createElement('div');
        labelContainer.className = "JQ-handle-track-label JQ-unselectable";
        labelContainer.style.transform = "rotate(" + (trackLength / 2 + 180) % 360 + "deg)";
        // labelContainer.onmousedown = this.spinStart;
        // labelContainer.addEventListener("touchstart", this.spinStart, false);
        wrapper.appendChild(labelContainer);

        var label = document.createElement('span');
        label.className = "JQ-track-label";
        label.textContent = track.label;
        labelContainer.appendChild(label);

        var value = document.createElement('span');
        value.className = "JQ-track-value";
        value.textContent = track.value;
        labelContainer.appendChild(value);

        var unit = document.createElement('span');
        unit.className = "JQ-track-unit";
        unit.textContent = this._unit;
        labelContainer.appendChild(unit);

        track.dom = trackContainer;
        this._element.dom.appendChild(trackContainer);
        this._element.tracks.push(track);
        this._element.dom.onmousedown = this.spinStart;
        this._element.dom.addEventListener("touchstart", this.spinStart, false);
    };
}

JQSlider.prototype.THEME_DEFAULT = 1;
JQSlider.prototype.STATUS_DISPLAY = 1;
JQSlider.prototype.STATUS_SLIDING = 2;
JQSlider.prototype.STATUS_ACTIVE = 3;

// RUNTIME
var spinner = new JQSlider('.radial-slider', {
    minValue: 0,
    maxValue: 100,
    globalFixedSum: true,
    lockMechanism: true,
    unit: '%',
    unitDecimals: 0,
    maxSize: 300, // Size in pixel
    backgroundColor: "#FFFFFF", //"rgba(0,0,0,1)",
    theme: JQSlider.THEME_DEFAULT, // Possible themes: "default"
    data: [{
        label: "Akku",
        color: "#674D42", // "rgba(255,0,0,1)" OR "#FF0000"
        value: 20 // 0 - 100
        // }]
    }, {
        label: "Internet",
        color: "#ED7802", // "rgba(255,0,0,1)" OR "#FF0000"
        value: 20 // 0 - 100
    }, {
        label: "App Store",
        color: "#BE3907", // "rgba(255,0,0,1)" OR "#FF0000"
        value: 10 // 0 - 100
    }, {
        label: "Funktionen",
        color: "#9D1711", // "rgba(255,0,0,1)" OR "#FF0000"
        value: 20 // 0 - 100
    }, {
        label: "Display",
        color: "#5C0D0C", // "rgba(255,0,0,1)" OR "#FF0000"
        value: 20 // 0 - 100
    }, {
        label: "Kamera",
        color: "#430D0C", // "rgba(255,0,0,1)" OR "#FF0000"
        value: 10 // 0 - 100
    }]
});
