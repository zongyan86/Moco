import Global from './Global';
import Matrix3 from './Matrix3';
import Util from './Util';
import EventDispatcher from './EventDispatcher';

export default class DisplayObject extends EventDispatcher {
    constructor() {
        super();
        this.name = 'DisplayObject';
        this.mask = null;
        this.parent = null;
        this.globalCompositeOperation = '';
        this._x = 0;
        this._y = 0;
        this._rotate = 0;
        this._scaleX = 1;
        this._scaleY = 1;
        this._height = 0;
        this._width = 0;
        this._alpha = 1;
        this.visible = true;
        this._isSaved = false;
        this._matrix = Matrix3.identity();
        this.aIndex = this.objectIndex = '' + Global.guid;
        Global.guid += 1;
    }

    on() {
        super.bind.apply(this, arguments);
    }

    off() {
        super.bind.apply(this, arguments);
    }

    show(matrix) {
        let _me = this;
        let ctx = _me.ctx || _me.stage.ctx;
        let {
            x, y, scaleX, scaleY, alpha, rotate, visible, mask
        } = _me;

        _me._matrix = Matrix3.identity();

        if (!visible || !alpha) {
            return false;
        }


        if (
            (_me.mask !== null && _me.mask.show) ||
            _me.globalCompositeOperation !== '' ||
            rotate !== 0 ||
            scaleX !== 1 ||
            scaleY !== 1 ||
            x !== 0 ||
            y !== 0
        ) {
            _me._isSaved = true;
            ctx.save();
        }

        if (mask !== null && mask.show) {
            mask.show();
            ctx.clip();
        }

        if (alpha < 1) {
            ctx.globalAlpha = alpha;
        }

        _me._matrix.multi(matrix);

        if (x !== 0 || y !== 0) {
            _me._matrix.multi(Matrix3.translation(x, y));
            ctx.translate(x, y);
        }

        if (rotate !== 0) {
            _me._matrix.multi(Matrix3.rotation(rotate));
            ctx.rotate(Util.deg2rad(rotate));
        }

        if (scaleX !== 1 || scaleY !== 1) {
            _me._matrix.multi(Matrix3.scaling(scaleX, scaleY));
            ctx.scale(scaleX, scaleY);
        }

        return true;
    }

    // jshint ignore:start

    isMouseon(cord) {
        // abstrct method, child class need to realize
    }

    getBounds() {
        // abstrct method, child class need to realize
    }

    // jshint ignore:end

    dispose() {
        let _me = this;
        let eventNames = Util.keys(_me._handlers);
        _me.off(eventNames);
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get x() {
        return this._x;
    }

    set x(x) {
        this._x = x;
    }

    get y() {
        return this._y;
    }

    set y(y) {
        this._y = y;
    }

    get rotate() {
        return this._rotate;
    }

    set rotate(rotate) {
        this._rotate = rotate;
    }

    get scaleX() {
        return this._scaleX;
    }

    set scaleX(scaleX) {
        this._scaleX = scaleX;
    }

    get scaleY() {
        return this._scaleY;
    }

    set scaleY(scaleY) {
        this._scaleY = scaleY;
    }

    get alpha() {
        return this._alpha;
    }

    set alpha(alpha) {
        if (alpha > 1) {
            alpha = 1;
        } else if (alpha < 0.001) {
            alpha = 0;
        }
        this._alpha = alpha;
    }
}