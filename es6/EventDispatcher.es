class EventDispatcher {
	on(target, eventName, callback, useCapture) {
		let _me = this;

		if (typeof target == "string") {
			[target, eventName, callback, useCapture] = [_me, target, eventName, callback];
		}

		if (eventName && callback) {
			useCapture = useCapture ? useCapture : false;

			if (Util.isType(eventName, "Array")) {
				Util.each(eventName, (item) => {
					_me.on(item, callback, useCapture);
				});
			} else {
				let handlers = target._handlers;
				let fn = (event) => {
					let callbacks = handlers[eventName];
					let ev = _me._fixEvent(event);

					for (let i = 0, len = callbacks.length; i < len; i++) {
						let item = callbacks[i];
						if (ev.isImmediatePropagationStopped()) {
							break;
						} else if (item._guid == fn._guid) {
							item._callback.call(_me, ev);
						}
					}
				};

				fn._fnStr = callback._fntStr ? callback._fnStr : callback.toString().replace(fnRegExp, '');
				fn._callback = callback;
				fn._useCapture = useCapture;
				fn._guid = guid++;

				if (!handlers) {
					handlers = target._handlers = {};
				}

				if (!handlers[eventName]) {
					handlers[eventName] = [];
				}

				handlers[eventName].push(fn);

				if (handlers[eventName].length) {
					if (target.addEventListener) {
						target.addEventListener(eventName, fn, useCapture);
					} else if (target.attachEvent) {
						target.attachEvent(eventName, fn);
					}
				}
			}
		}

		return _me;
	}

	off(target, eventName, callback) {
		let _me = this;

		if (typeof target == "string") {
			[target, eventName, callback] = [_me, target, eventName];
		}

		if (eventName || callback) {
			if (Util.isType(eventName, "Array")) {
				Util.each(eventName, function(item) {
					_me.off(target, item, callback);
				});
			} else if (!callback) {
				let handlers = target._handlers;

				if (handlers) {
					let callbacks = handlers[eventName] ? handlers[eventName] : [];
					Util.each(callbacks, function(item) {
						_me.off(target, eventName, item);
					});
				}
			} else {
				let handlers = target._handlers;

				if (handlers) {
					let fnStr = callback.fnStr ? callback.fnStr : callback.toString().replace(fnRegExp, '');
					let callbacks = handlers[eventName] ? handlers[eventName] : [];

					for (let i = callbacks.length - 1; i >= 0; i--) {
						let item = callbacks[i];
						if (item._fnStr == fnStr) {
							Array.prototype.splice.call(callbacks, i, 1);
						}
					}
				}
			}
		}

		return _me;
	}

	once(target, eventName, callback, useCapture) {
		var _me = this;

		if (typeof target == "string") {
			[target, eventName, callback, useCapture] = [_me, target, eventName, callback];
		}

		let fn = function(event) {
			callback.call(_me, event);

			if (event.isImmediatePropagationStopped()) {
				_me.off(target, eventName, fn);
			}

			if (useCapture) {
				if (event.eventPhase == 0) {
					_me.off(target, eventName, fn);
				}
			} else {
				_me.off(target, eventName, fn);
			}
		};

		fn._fnStr = callback.toString().replace(fnRegExp, '');

		return _me.on(target, eventName, fn, useCapture);
	}

	trigger(target, eventName, event) {
		let _me = this;

		if (!target && !eventName) {
			return;
		} else if (typeof target == "string") {
			[target, eventName, event] = [_me, target, eventName];
		}

		let handlers = target && target._handlers;

		if (!handlers) {
			return _me;
		}

		let callbacks = handlers[eventName] ? handlers[eventName] : [];

		//自定义事件trigger的时候需要修正target和currentTarget
		let ev = event || {};
		if (ev.target == null) {
			ev.target = ev.currentTarget = target;
		}

		ev = _me._fixEvent(ev);

		// 此处分开冒泡阶段函数和捕获阶段函数
		let parent = null;
		let handlerList = {
			propagations: [],
			useCaptures: []
		};

		if (parent = target.parentNode) {
			while (parent) {
				let handlers = null;
				if (handlers = parent._handlers) {
					let callbacks = handlers[eventName] ? handlers[eventName] : [];
					for (let i = 0, len = callbacks.length; i < len; i++) {
						let useCapture = callbacks[i]._useCapture;
						if (!useCapture) {
							handlerList.propagations.push({
								target: parent,
								callback: callbacks[i]
							});
						} else {
							handlerList.useCaptures.push({
								target: parent,
								callback: callbacks[i]
							});
						}
					}
				}
				parent = parent.parentNode;
			}
		}

		// 捕获阶段的模拟
		let useCaptures = handlerList.useCaptures;
		let prevTarget = null;
		ev.eventPhase = 0;
		for (let i = 0, len = useCaptures.length; i < len; i++) {
			let handler = useCaptures[i];
			target = handler.target;
			if (ev.isImmediatePropagationStopped()) {
				break;
			} else if (prevTarget == target && ev.isPropagationStopped()) {
				handler.callback.call(_me, ev);
			} else {
				handler.callback.call(_me, ev);
				prevTarget = target;
			}

		}

		let isUseCapturePhaseStopped = false;
		if (useCaptures.length) {
			isUseCapturePhaseStopped = ev.isImmediatePropagationStopped() || ev.isPropagationStopped();
		}

		// 目标阶段
		ev.eventPhase = 1;
		for (let i = 0, len = callbacks.length; i < len; i++) {
			let item = callbacks[i];
			if (isUseCapturePhaseStopped) {
				break;
			} else {
				item.call(_me, ev);
			}
		}

		// 冒泡的模拟
		let propagations = handlerList.propagations;
		prevTarget = null;
		ev.eventPhase = 2;
		for (let i = 0, len = propagations.length; i < len; i++) {
			let handler = propagations[i];
			target = handler.target;
			ev.target = target;
			if (isUseCapturePhaseStopped) {
				if (ev.isImmediatePropagationStopped() || ev.isPropagationStopped()) {
					break;
				} else {
					handler.callback.call(_me, ev);
					prevTarget = target;
				}
			} else {
				if (ev.isImmediatePropagationStopped()) {
					break;
				} else if (ev.isPropagationStopped()) {
					if (prevTarget == target) {
						handler.callback.call(_me, ev);
					} else {
						break;
					}
				} else {
					handler.callback.call(_me, ev);
					prevTarget = target;
				}
			}
		}
	}

	_fixEvent(event) {
		let _me = this;
		let returnTrue = () => {
			return true
		};
		let returnFalse = () => {
			return false
		};

		if (!event || !event.isPropagationStopped) {
			event = event ? event : {};

			let preventDefault = event.preventDefault;
			let stopPropagation = event.stopPropagation;
			let stopImmediatePropagation = event.stopImmediatePropagation;


			if (!event.target) {
				event.target = event.srcElement || document;
			}

			if (!event.currentTarget) {
				event.currentTarget = _me;
			}

			event.relatedTarget = event.fromElement === event.target ?
				event.toElement :
				event.fromElement;

			event.preventDefault = () => {
				if (preventDefault) {
					preventDefault.call(event);
				}
				event.returnValue = false;
				event.isDefaultPrevented = returnTrue;
				event.defaultPrevented = true;
			};

			event.isDefaultPrevented = returnFalse;
			event.defaultPrevented = false;

			event.stopPropagation = () => {
				if (stopPropagation) {
					stopPropagation.call(event);
				}
				event.cancelBubble = true;
				event.isPropagationStopped = returnTrue;
			};

			event.isPropagationStopped = returnFalse;

			event.stopImmediatePropagation = () => {
				if (stopImmediatePropagation) {
					stopImmediatePropagation.call(event);
				}
				event.isImmediatePropagationStopped = returnTrue;
				event.stopPropagation();
			};

			event.isImmediatePropagationStopped = returnFalse;

			if (event.clientX != null) {
				var doc = document.documentElement,
					body = document.body;

				event.pageX = event.clientX +
					(doc && doc.scrollLeft || body && body.scrollLeft || 0) -
					(doc && doc.clientLeft || body && body.clientLeft || 0);

				event.pageY = event.clientY +
					(doc && doc.scrollTop || body && body.scrollTop || 0) -
					(doc && doc.clientTop || body && body.clientTop || 0);
			}

			event.which = event.charCode || event.keyCode;
		}

		return event;
	}
}

Moco.EventDispatcher = EventDispatcher;