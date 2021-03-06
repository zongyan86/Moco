import DisplayObjectContainer from './DisplayObjectContainer';
import DisplayObject from './DisplayObject';
import Shape from './Shape';

export default class Sprite extends DisplayObjectContainer {
    constructor() {
        super();
        this.name = 'Sprite';
        this.graphics = null;
    }

    addChild(child) {
        if (child instanceof Shape) {
            console.error('shape object should be linked to Sprite\'s graphics property'); // jshint ignore:line
        } else {
            super.addChild(child);
        }
    }

    removeChild(child) {
        if (child instanceof Shape) {
            console.error('shape object should be linked to Sprite\'s graphics property'); // jshint ignore:line
        } else {
            super.removeChild(child);
        }
    }

    show(matrix) {
        let isDrew = super.show(matrix);
        if (!isDrew) {
            return isDrew;
        }

        let _me = this;
        if (_me.graphics && _me.graphics.show) {
            DisplayObject.prototype.show.call(_me, matrix);
            _me.graphics.show(_me._matrix);
        }

        if (_me._isSaved) {
            let ctx = _me.ctx || _me.stage.ctx;
            _me._isSaved = false;
            ctx.restore();
        }

        return isDrew;
    }

    isMouseOn(cord) {
        let _me = this;
        let isMouseOn = super.isMouseOn(cord);

        if (!isMouseOn && _me.graphics && _me.graphics instanceof Shape) {
            isMouseOn = _me.graphics.isMouseOn && _me.graphics.isMouseOn(cord);
        }

        return isMouseOn;
    }

    get width() {
        let _me = this;
        let bounds = super.getBounds();
        let shapeBounds = null;

        if (_me.graphics instanceof Shape) {
            shapeBounds = _me.graphics.getBounds();
        }

        if (shapeBounds) {
            bounds.sv.x = bounds.sv.x < shapeBounds.sv.x ? bounds.sv.x : shapeBounds.sv.x;
            bounds.ev.x = bounds.ev.x > shapeBounds.ev.x ? bounds.ev.x : shapeBounds.ev.x;
        }

        return Math.abs(bounds.ev.x - bounds.sv.x);
    }

    get height() {
        let _me = this;
        let bounds = super.getBounds();
        let shapeBounds = null;

        if (_me.graphics instanceof Shape) {
            shapeBounds = _me.graphics.getBounds();
        }

        if (shapeBounds) {
            bounds.sv.y = bounds.sv.y < shapeBounds.sv.y ? bounds.sv.y : shapeBounds.sv.y;
            bounds.ev.y = bounds.ev.y > shapeBounds.ev.y ? bounds.ev.y : shapeBounds.ev.y;
        }

        return Math.abs(bounds.ev.y - bounds.sv.y);
    }
}