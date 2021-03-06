import InteractiveObject from './InteractiveObject';
import DisplayObject from './DisplayObject';
import Util from './Util';
import Matrix3 from './Matrix3';
import Vec3 from './Vec3';
import Global from './Global';
import Event from './Event';

export default class DisplayObjectContainer extends InteractiveObject {
    constructor() {
        super();
        this.name = 'DisplayObjectContainer';
        this._childList = [];
    }

    addChild(child) {
        let _me = this;
        if (child instanceof DisplayObject) {
            let isNotExists = Util.inArray(child, _me._childList, (child, item) => {
                    return child.aIndex === item.aIndex;
                }) === -1;

            if (isNotExists) {
                child.parent = _me;
                child.stage = child.stage ? child.stage : _me.stage;
                child.objectIndex = _me.objectIndex + '.' + (_me._childList.length + 1);
                _me._childList.push(child);
            }
        }
    }

    removeChild(child) {
        let _me = this;
        if (child instanceof DisplayObject) {
            for (let i = _me._childList.length - 1; i >= 0; i -= 1) {
                let item = _me._childList[i];
                if (item.aIndex === child.aIndex) {
                    item.parent = null;
                    item.stage = null;
                    Array.prototype.splice.call(_me._childList, i, 1);
                    break;
                }
            }
        }
    }

    getAllChild() {
        let _me = this;
        return Util.clone(_me._childList);
    }

    getChildAt(index) {
        let _me = this;
        let len = _me._childList.length;

        if (Math.abs(index) > len) {
            return;
        } else if (index < 0) {
            index = len + index;
        }

        return _me._childList[index];
    }

    contains(child) {
        let _me = this;
        if (child instanceof DisplayObject) {
            return Util.inArray(child, _me._childList, (child, item) => {
                    return child.aIndex === item.aIndex;
                }) !== -1;
        }
    }

    show(matrix) {
        let _me = this;

        if (matrix === null) {
            matrix = Matrix3.clone(_me._matrix);
        }

        let isDrew = super.show(matrix);

        if (isDrew) {
            let ctx = _me.ctx || _me.stage.ctx;
            for (let i = 0, len = _me._childList.length; i < len; i += 1) {
                let item = _me._childList[i];
                if (item.show) {
                    item.show(_me._matrix);
                    if (item._isSaved) {
                        item._isSaved = false;
                        ctx.restore();
                    }
                }
                item.trigger(Event.ENTER_FRAME);
            }

            if (_me._isSaved) {
                _me._isSaved = false;
                ctx.restore();
            }
        }

        _me.trigger(Event.ENTER_FRAME);

        return isDrew;
    }

    dispose() {
        let _me = this;
        Util.each(_me._childList, (child) => {
            _me.removeChild(child);
            if (child.dispose) {
                child.dispose();
            }
        });
        super.dispose();
    }

    isMouseOn(cord) {
        let _me = this;

        for (let i = 0, len = _me._childList.length; i < len; i += 1) {
            let item = _me._childList[i];
            if (item.isMouseOn && item.isMouseOn(cord)) {
                return true;
            }
        }

        return false;
    }

    getBounds() {
        let _me = this;
        let childList = _me._childList;
        let sv = Vec3.clone(Global.maxNumberVec3);
        let ev = Vec3.clone(Global.minNumberVec3);

        Util.each(childList, (child) => {
            if (typeof child.getBounds === 'function') {
                let bounds = child.getBounds();
                sv.x = bounds.sv.x < sv.x ? bounds.sv.x : sv.x;
                sv.y = bounds.sv.y < sv.y ? bounds.sv.y : sv.y;
                ev.x = bounds.ev.x > ev.x ? bounds.ev.x : ev.x;
                ev.y = bounds.ev.y > ev.y ? bounds.ev.y : ev.y;
            }
        });

        if (sv.x === Global.maxNumber ||
            ev.x === Global.minNumber ||
            sv.y === Global.maxNumber ||
            ev.y === Global.minNumber) {
            sv = ev = Vec3.zero();
        }

        return {
            sv: sv,
            ev: ev
        };
    }

    get width() {
        let _me = this;
        let bounds = _me.getBounds();
        return Math.abs(bounds.ev.x - bounds.sv.x);
    }

    get height() {
        let _me = this;
        let bounds = _me.getBounds();
        return Math.abs(bounds.ev.y - bounds.sv.y);
    }
}

