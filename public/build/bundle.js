
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if (typeof $$scope.dirty === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function add_resize_listener(element, fn) {
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        const object = document.createElement('object');
        object.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
        object.setAttribute('aria-hidden', 'true');
        object.type = 'text/html';
        object.tabIndex = -1;
        let win;
        object.onload = () => {
            win = object.contentDocument.defaultView;
            win.addEventListener('resize', fn);
        };
        if (/Trident/.test(navigator.userAgent)) {
            element.appendChild(object);
            object.data = 'about:blank';
        }
        else {
            object.data = 'about:blank';
            element.appendChild(object);
        }
        return {
            cancel: () => {
                win && win.removeEventListener && win.removeEventListener('resize', fn);
                element.removeChild(object);
            }
        };
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\TopBar\TopBarCommand.svelte generated by Svelte v3.19.1 */

    const file = "src\\TopBar\\TopBarCommand.svelte";

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			t = text(/*label*/ ctx[0]);
    			attr_dev(h1, "class", "svelte-1gxb3q1");
    			add_location(h1, file, 9, 8, 125);
    			attr_dev(main, "class", "svelte-1gxb3q1");
    			add_location(main, file, 8, 0, 87);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(h1, t);

    			dispose = listen_dev(
    				main,
    				"click",
    				function () {
    					if (is_function(/*onClick*/ ctx[1]())) /*onClick*/ ctx[1]().apply(this, arguments);
    				},
    				false,
    				false,
    				false
    			);
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*label*/ 1) set_data_dev(t, /*label*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { label = "Weeee" } = $$props;
    	let { onClick } = $$props;
    	const writable_props = ["label", "onClick"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TopBarCommand> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("onClick" in $$props) $$invalidate(1, onClick = $$props.onClick);
    	};

    	$$self.$capture_state = () => ({ label, onClick });

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("onClick" in $$props) $$invalidate(1, onClick = $$props.onClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [label, onClick];
    }

    class TopBarCommand extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { label: 0, onClick: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TopBarCommand",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onClick*/ ctx[1] === undefined && !("onClick" in props)) {
    			console.warn("<TopBarCommand> was created without expected prop 'onClick'");
    		}
    	}

    	get label() {
    		throw new Error("<TopBarCommand>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<TopBarCommand>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClick() {
    		throw new Error("<TopBarCommand>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<TopBarCommand>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\TopBar\TopBarGroup.svelte generated by Svelte v3.19.1 */

    const file$1 = "src\\TopBar\\TopBarGroup.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let h1;
    	let t;
    	let h1_style_value;
    	let main_style_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			t = text(/*label*/ ctx[0]);
    			attr_dev(h1, "style", h1_style_value = /*selected*/ ctx[1] ? "color: var(--mainbg);" : "");
    			attr_dev(h1, "class", "svelte-6zmu1a");
    			add_location(h1, file$1, 12, 8, 232);

    			attr_dev(main, "style", main_style_value = "\r\n        " + (/*selected*/ ctx[1]
    			? "background-color: var(--red);"
    			: "") + "\r\n    ");

    			attr_dev(main, "class", "svelte-6zmu1a");
    			add_location(main, file$1, 9, 0, 121);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(h1, t);

    			dispose = listen_dev(
    				main,
    				"click",
    				function () {
    					if (is_function(/*onClick*/ ctx[2]())) /*onClick*/ ctx[2]().apply(this, arguments);
    				},
    				false,
    				false,
    				false
    			);
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*label*/ 1) set_data_dev(t, /*label*/ ctx[0]);

    			if (dirty & /*selected*/ 2 && h1_style_value !== (h1_style_value = /*selected*/ ctx[1] ? "color: var(--mainbg);" : "")) {
    				attr_dev(h1, "style", h1_style_value);
    			}

    			if (dirty & /*selected*/ 2 && main_style_value !== (main_style_value = "\r\n        " + (/*selected*/ ctx[1]
    			? "background-color: var(--red);"
    			: "") + "\r\n    ")) {
    				attr_dev(main, "style", main_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { label = "Weeee" } = $$props;
    	let { selected = false } = $$props;
    	let { onClick } = $$props;
    	const writable_props = ["label", "selected", "onClick"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TopBarGroup> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("onClick" in $$props) $$invalidate(2, onClick = $$props.onClick);
    	};

    	$$self.$capture_state = () => ({ label, selected, onClick });

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("onClick" in $$props) $$invalidate(2, onClick = $$props.onClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [label, selected, onClick];
    }

    class TopBarGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { label: 0, selected: 1, onClick: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TopBarGroup",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onClick*/ ctx[2] === undefined && !("onClick" in props)) {
    			console.warn("<TopBarGroup> was created without expected prop 'onClick'");
    		}
    	}

    	get label() {
    		throw new Error("<TopBarGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<TopBarGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<TopBarGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<TopBarGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClick() {
    		throw new Error("<TopBarGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<TopBarGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\TopBar\TopBar.svelte generated by Svelte v3.19.1 */
    const file$2 = "src\\TopBar\\TopBar.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (84:16) {#if selected == null || selected == i}
    function create_if_block(ctx) {
    	let t;
    	let if_block_anchor;
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[10](/*i*/ ctx[14], ...args);
    	}

    	const topbargroup = new TopBarGroup({
    			props: {
    				label: /*group*/ ctx[12].label,
    				selected: /*selected*/ ctx[1] == /*i*/ ctx[14],
    				onClick: func
    			},
    			$$inline: true
    		});

    	let if_block = /*selected*/ ctx[1] == /*i*/ ctx[14] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			create_component(topbargroup.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(topbargroup, target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const topbargroup_changes = {};
    			if (dirty & /*selected*/ 2) topbargroup_changes.selected = /*selected*/ ctx[1] == /*i*/ ctx[14];
    			if (dirty & /*selected*/ 2) topbargroup_changes.onClick = func;
    			topbargroup.$set(topbargroup_changes);

    			if (/*selected*/ ctx[1] == /*i*/ ctx[14]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(topbargroup.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(topbargroup.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(topbargroup, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(84:16) {#if selected == null || selected == i}",
    		ctx
    	});

    	return block;
    }

    // (91:20) {#if selected == i}
    function create_if_block_1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*group*/ ctx[12].cmds;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*config*/ 4) {
    				each_value_1 = /*group*/ ctx[12].cmds;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(91:20) {#if selected == i}",
    		ctx
    	});

    	return block;
    }

    // (92:24) {#each group.cmds as cmd}
    function create_each_block_1(ctx) {
    	let current;

    	function func_1(...args) {
    		return /*func_1*/ ctx[11](/*cmd*/ ctx[15], ...args);
    	}

    	const topbarcommand = new TopBarCommand({
    			props: {
    				label: /*cmd*/ ctx[15].label,
    				onClick: func_1
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(topbarcommand.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(topbarcommand, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(topbarcommand.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(topbarcommand.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(topbarcommand, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(92:24) {#each group.cmds as cmd}",
    		ctx
    	});

    	return block;
    }

    // (83:12) {#each config as group, i}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = (/*selected*/ ctx[1] == null || /*selected*/ ctx[1] == /*i*/ ctx[14]) && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*selected*/ ctx[1] == null || /*selected*/ ctx[1] == /*i*/ ctx[14]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(83:12) {#each config as group, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let div0;
    	let svg0;
    	let path0;
    	let defs;
    	let linearGradient;
    	let stop0;
    	let stop1;
    	let t0;
    	let div2;
    	let div1;
    	let t1;
    	let div3;
    	let svg1;
    	let path1;
    	let current;
    	let dispose;
    	let each_value = /*config*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			defs = svg_element("defs");
    			linearGradient = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			div3 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M35 55H5V5H55V55H80");
    			attr_dev(path0, "stroke", "url(#paint0_linear_109_17)");
    			attr_dev(path0, "stroke-width", "10");
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-linejoin", "round");
    			add_location(path0, file$2, 71, 12, 1665);
    			attr_dev(stop0, "stop-color", "#EC2351");
    			add_location(stop0, file$2, 74, 12, 1949);
    			attr_dev(stop1, "offset", "1");
    			attr_dev(stop1, "stop-color", "#DB6239");
    			add_location(stop1, file$2, 75, 12, 1991);
    			attr_dev(linearGradient, "id", "paint0_linear_109_17");
    			attr_dev(linearGradient, "x1", "55");
    			attr_dev(linearGradient, "y1", "5");
    			attr_dev(linearGradient, "x2", "55");
    			attr_dev(linearGradient, "y2", "55");
    			attr_dev(linearGradient, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient, file$2, 73, 12, 1831);
    			add_location(defs, file$2, 72, 12, 1811);
    			attr_dev(svg0, "viewBox", "0 0 85 60");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "class", "svelte-1bmqjpv");
    			add_location(svg0, file$2, 70, 8, 1579);
    			attr_dev(div0, "class", "logoContainer svelte-1bmqjpv");
    			add_location(div0, file$2, 69, 4, 1542);
    			attr_dev(div1, "class", "frame neuIndentShadow svelte-1bmqjpv");
    			add_location(div1, file$2, 81, 8, 2154);
    			attr_dev(div2, "class", "frameContainer svelte-1bmqjpv");
    			add_location(div2, file$2, 80, 4, 2116);
    			attr_dev(path1, "d", "M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z");
    			add_location(path1, file$2, 104, 12, 3092);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 512 512");
    			attr_dev(svg1, "class", "svelte-1bmqjpv");
    			add_location(svg1, file$2, 103, 8, 3016);
    			attr_dev(div3, "class", "settingsButtonContainer svelte-1bmqjpv");
    			add_location(div3, file$2, 102, 4, 2943);
    			attr_dev(main, "class", "svelte-1bmqjpv");
    			add_location(main, file$2, 68, 0, 1530);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, svg0);
    			append_dev(svg0, path0);
    			append_dev(svg0, defs);
    			append_dev(defs, linearGradient);
    			append_dev(linearGradient, stop0);
    			append_dev(linearGradient, stop1);
    			append_dev(main, t0);
    			append_dev(main, div2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(main, t1);
    			append_dev(main, div3);
    			append_dev(div3, svg1);
    			append_dev(svg1, path1);
    			current = true;

    			dispose = listen_dev(
    				div3,
    				"click",
    				function () {
    					if (is_function(/*settingsAction*/ ctx[0])) /*settingsAction*/ ctx[0].apply(this, arguments);
    				},
    				false,
    				false,
    				false
    			);
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*config, selected*/ 6) {
    				each_value = /*config*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { toggleDebugConsole } = $$props;
    	let selected = null;
    	let { centerView } = $$props;
    	let { resetZoom } = $$props;
    	let { newFile } = $$props;
    	let { open } = $$props;
    	let { save } = $$props;
    	let { saveAs } = $$props;

    	const config = [
    		{
    			"label": "File",
    			"cmds": [
    				{ "label": "New", "func": newFile },
    				{ "label": "Open", "func": open },
    				{ "label": "Save", "func": save },
    				{ "label": "Save As", "func": saveAs }
    			]
    		},
    		{
    			"label": "Viewport",
    			"cmds": [
    				{ "label": "Center", "func": centerView },
    				{ "label": "Reset Zoom", "func": resetZoom }
    			]
    		},
    		{
    			"label": "Debug",
    			"cmds": [
    				{
    					"label": "Toggle Console",
    					"func": toggleDebugConsole
    				}
    			]
    		}
    	];

    	let { settingsAction } = $$props;

    	const writable_props = [
    		"toggleDebugConsole",
    		"centerView",
    		"resetZoom",
    		"newFile",
    		"open",
    		"save",
    		"saveAs",
    		"settingsAction"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TopBar> was created with unknown prop '${key}'`);
    	});

    	const func = i => {
    		$$invalidate(1, selected = selected == null ? i : null);
    	};

    	const func_1 = cmd => {
    		cmd.func();
    	};

    	$$self.$set = $$props => {
    		if ("toggleDebugConsole" in $$props) $$invalidate(3, toggleDebugConsole = $$props.toggleDebugConsole);
    		if ("centerView" in $$props) $$invalidate(4, centerView = $$props.centerView);
    		if ("resetZoom" in $$props) $$invalidate(5, resetZoom = $$props.resetZoom);
    		if ("newFile" in $$props) $$invalidate(6, newFile = $$props.newFile);
    		if ("open" in $$props) $$invalidate(7, open = $$props.open);
    		if ("save" in $$props) $$invalidate(8, save = $$props.save);
    		if ("saveAs" in $$props) $$invalidate(9, saveAs = $$props.saveAs);
    		if ("settingsAction" in $$props) $$invalidate(0, settingsAction = $$props.settingsAction);
    	};

    	$$self.$capture_state = () => ({
    		TopBarCommand,
    		TopBarGroup,
    		toggleDebugConsole,
    		selected,
    		centerView,
    		resetZoom,
    		newFile,
    		open,
    		save,
    		saveAs,
    		config,
    		settingsAction
    	});

    	$$self.$inject_state = $$props => {
    		if ("toggleDebugConsole" in $$props) $$invalidate(3, toggleDebugConsole = $$props.toggleDebugConsole);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("centerView" in $$props) $$invalidate(4, centerView = $$props.centerView);
    		if ("resetZoom" in $$props) $$invalidate(5, resetZoom = $$props.resetZoom);
    		if ("newFile" in $$props) $$invalidate(6, newFile = $$props.newFile);
    		if ("open" in $$props) $$invalidate(7, open = $$props.open);
    		if ("save" in $$props) $$invalidate(8, save = $$props.save);
    		if ("saveAs" in $$props) $$invalidate(9, saveAs = $$props.saveAs);
    		if ("settingsAction" in $$props) $$invalidate(0, settingsAction = $$props.settingsAction);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		settingsAction,
    		selected,
    		config,
    		toggleDebugConsole,
    		centerView,
    		resetZoom,
    		newFile,
    		open,
    		save,
    		saveAs,
    		func,
    		func_1
    	];
    }

    class TopBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			toggleDebugConsole: 3,
    			centerView: 4,
    			resetZoom: 5,
    			newFile: 6,
    			open: 7,
    			save: 8,
    			saveAs: 9,
    			settingsAction: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TopBar",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*toggleDebugConsole*/ ctx[3] === undefined && !("toggleDebugConsole" in props)) {
    			console.warn("<TopBar> was created without expected prop 'toggleDebugConsole'");
    		}

    		if (/*centerView*/ ctx[4] === undefined && !("centerView" in props)) {
    			console.warn("<TopBar> was created without expected prop 'centerView'");
    		}

    		if (/*resetZoom*/ ctx[5] === undefined && !("resetZoom" in props)) {
    			console.warn("<TopBar> was created without expected prop 'resetZoom'");
    		}

    		if (/*newFile*/ ctx[6] === undefined && !("newFile" in props)) {
    			console.warn("<TopBar> was created without expected prop 'newFile'");
    		}

    		if (/*open*/ ctx[7] === undefined && !("open" in props)) {
    			console.warn("<TopBar> was created without expected prop 'open'");
    		}

    		if (/*save*/ ctx[8] === undefined && !("save" in props)) {
    			console.warn("<TopBar> was created without expected prop 'save'");
    		}

    		if (/*saveAs*/ ctx[9] === undefined && !("saveAs" in props)) {
    			console.warn("<TopBar> was created without expected prop 'saveAs'");
    		}

    		if (/*settingsAction*/ ctx[0] === undefined && !("settingsAction" in props)) {
    			console.warn("<TopBar> was created without expected prop 'settingsAction'");
    		}
    	}

    	get toggleDebugConsole() {
    		throw new Error("<TopBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggleDebugConsole(value) {
    		throw new Error("<TopBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centerView() {
    		throw new Error("<TopBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centerView(value) {
    		throw new Error("<TopBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get resetZoom() {
    		throw new Error("<TopBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set resetZoom(value) {
    		throw new Error("<TopBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get newFile() {
    		throw new Error("<TopBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set newFile(value) {
    		throw new Error("<TopBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<TopBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<TopBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get save() {
    		throw new Error("<TopBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set save(value) {
    		throw new Error("<TopBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get saveAs() {
    		throw new Error("<TopBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set saveAs(value) {
    		throw new Error("<TopBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get settingsAction() {
    		throw new Error("<TopBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set settingsAction(value) {
    		throw new Error("<TopBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Viewport\Components\Header.svelte generated by Svelte v3.19.1 */

    const file$3 = "src\\Viewport\\Components\\Header.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let h1;
    	let t0;
    	let t1;
    	let div0;
    	let svg0;
    	let path0;
    	let t2;
    	let div1;
    	let svg1;
    	let path1;
    	let t3;
    	let div2;
    	let svg2;
    	let path2;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			t0 = text("Title");
    			t1 = space();
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t2 = space();
    			div1 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t3 = space();
    			div2 = element("div");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			attr_dev(h1, "contenteditable", "plaintext-only");
    			set_style(h1, "font-size", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(h1, "min-height", 2 * /*zoom*/ ctx[8] + "vh");
    			set_style(h1, "min-width", /*sizeX*/ ctx[2] * /*zoom*/ ctx[8] + "vh");
    			attr_dev(h1, "class", "svelte-18mi8sf");
    			if (/*text*/ ctx[0] === void 0) add_render_callback(() => /*h1_input_handler*/ ctx[19].call(h1));
    			add_location(h1, file$3, 52, 4, 1201);
    			attr_dev(path0, "d", "M278.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l9.4-9.4V224H109.3l9.4-9.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-9.4-9.4H224V402.7l-9.4-9.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-9.4 9.4V288H402.7l-9.4 9.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l9.4 9.4H288V109.3l9.4 9.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-64-64z");
    			add_location(path0, file$3, 72, 238, 1863);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 512 512");
    			attr_dev(svg0, "class", "svelte-18mi8sf");
    			add_location(svg0, file$3, 72, 8, 1633);
    			attr_dev(div0, "class", "dragHandle svelte-18mi8sf");
    			attr_dev(div0, "draggable", "true");
    			set_style(div0, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(div0, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			add_location(div0, file$3, 62, 4, 1431);
    			attr_dev(path1, "d", "M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z");
    			add_location(path1, file$3, 84, 238, 2959);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 448 512");
    			attr_dev(svg1, "class", "svelte-18mi8sf");
    			add_location(svg1, file$3, 84, 8, 2729);
    			attr_dev(div1, "class", "deleteAction svelte-18mi8sf");
    			set_style(div1, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(div1, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			add_location(div1, file$3, 75, 4, 2542);
    			attr_dev(path2, "d", "M32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z");
    			add_location(path2, file$3, 97, 238, 3686);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "viewBox", "0 0 448 512");
    			attr_dev(svg2, "class", "svelte-18mi8sf");
    			add_location(svg2, file$3, 97, 8, 3456);
    			attr_dev(div2, "class", "resizeHandle svelte-18mi8sf");
    			attr_dev(div2, "draggable", "true");
    			set_style(div2, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(div2, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			add_location(div2, file$3, 87, 4, 3251);
    			set_style(main, "left", ((/*posX*/ ctx[4] + /*simX*/ ctx[9]) * /*zoom*/ ctx[8] + /*offX*/ ctx[6]) * 2 + "vh");
    			set_style(main, "top", ((/*posY*/ ctx[5] + /*simY*/ ctx[10]) * /*zoom*/ ctx[8] + /*offY*/ ctx[7]) * 2 + "vh");
    			set_style(main, "width", Math.max(/*sizeBounds*/ ctx[1][0][0], Math.min(/*sizeX*/ ctx[2] + /*simResizeX*/ ctx[11], /*sizeBounds*/ ctx[1][0][1])) * 2 * /*zoom*/ ctx[8] + "vh");
    			set_style(main, "height", Math.max(/*sizeBounds*/ ctx[1][1][0], Math.min(/*sizeY*/ ctx[3] + /*simResizeY*/ ctx[12], /*sizeBounds*/ ctx[1][1][1])) * 2 * /*zoom*/ ctx[8] + "vh");
    			set_style(main, "border-radius", 1.5 * /*zoom*/ ctx[8] + "vh");
    			set_style(main, "transition", "border-radius .2s cubic-bezier(0, 0, 0, .9),\r\n");
    			attr_dev(main, "class", "svelte-18mi8sf");
    			add_location(main, file$3, 39, 0, 700);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(h1, t0);

    			if (/*text*/ ctx[0] !== void 0) {
    				h1.textContent = /*text*/ ctx[0];
    			}

    			append_dev(main, t1);
    			append_dev(main, div0);
    			append_dev(div0, svg0);
    			append_dev(svg0, path0);
    			append_dev(main, t2);
    			append_dev(main, div1);
    			append_dev(div1, svg1);
    			append_dev(svg1, path1);
    			append_dev(main, t3);
    			append_dev(main, div2);
    			append_dev(div2, svg2);
    			append_dev(svg2, path2);

    			dispose = [
    				listen_dev(h1, "input", /*h1_input_handler*/ ctx[19]),
    				listen_dev(div0, "dragstart", /*drag*/ ctx[13], false, false, false),
    				listen_dev(div1, "click", /*handleDelete*/ ctx[15], false, false, false),
    				listen_dev(div2, "dragstart", /*resize*/ ctx[14], false, false, false),
    				listen_dev(main, "mousedown", mousedown_handler, false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*zoom*/ 256) {
    				set_style(h1, "font-size", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(h1, "min-height", 2 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*sizeX, zoom*/ 260) {
    				set_style(h1, "min-width", /*sizeX*/ ctx[2] * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*text*/ 1 && /*text*/ ctx[0] !== h1.textContent) {
    				h1.textContent = /*text*/ ctx[0];
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div0, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div0, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div1, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div1, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div2, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div2, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*posX, simX, zoom, offX*/ 848) {
    				set_style(main, "left", ((/*posX*/ ctx[4] + /*simX*/ ctx[9]) * /*zoom*/ ctx[8] + /*offX*/ ctx[6]) * 2 + "vh");
    			}

    			if (dirty & /*posY, simY, zoom, offY*/ 1440) {
    				set_style(main, "top", ((/*posY*/ ctx[5] + /*simY*/ ctx[10]) * /*zoom*/ ctx[8] + /*offY*/ ctx[7]) * 2 + "vh");
    			}

    			if (dirty & /*sizeX, simResizeX, zoom*/ 2308) {
    				set_style(main, "width", Math.max(/*sizeBounds*/ ctx[1][0][0], Math.min(/*sizeX*/ ctx[2] + /*simResizeX*/ ctx[11], /*sizeBounds*/ ctx[1][0][1])) * 2 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*sizeY, simResizeY, zoom*/ 4360) {
    				set_style(main, "height", Math.max(/*sizeBounds*/ ctx[1][1][0], Math.min(/*sizeY*/ ctx[3] + /*simResizeY*/ ctx[12], /*sizeBounds*/ ctx[1][1][1])) * 2 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(main, "border-radius", 1.5 * /*zoom*/ ctx[8] + "vh");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const mousedown_handler = event => {
    	event.stopPropagation();
    };

    function instance$3($$self, $$props, $$invalidate) {
    	const sizeBounds = [/* X */ [5, 50], [3, 5]]; /* Y */
    	let { text } = $$props;
    	let { sizeX = 5 } = $$props;
    	let { sizeY = 2 } = $$props;
    	let { posX = 0 } = $$props;
    	let { posY = 0 } = $$props;
    	let { offX = 0 } = $$props;
    	let { offY = 0 } = $$props;
    	let { zoom = 1 } = $$props;
    	let { simX } = $$props;
    	let { simY } = $$props;
    	let { simResizeX } = $$props;
    	let { simResizeY } = $$props;
    	let { onDrag } = $$props;
    	let { onResize } = $$props;
    	let { onDelete } = $$props;

    	function drag(event) {
    		onDrag(event);
    	}

    	function resize(event) {
    		onResize(event);
    	}

    	function handleDelete() {
    		onDelete();
    	}

    	const writable_props = [
    		"text",
    		"sizeX",
    		"sizeY",
    		"posX",
    		"posY",
    		"offX",
    		"offY",
    		"zoom",
    		"simX",
    		"simY",
    		"simResizeX",
    		"simResizeY",
    		"onDrag",
    		"onResize",
    		"onDelete"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	function h1_input_handler() {
    		text = this.textContent;
    		$$invalidate(0, text);
    	}

    	$$self.$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("sizeX" in $$props) $$invalidate(2, sizeX = $$props.sizeX);
    		if ("sizeY" in $$props) $$invalidate(3, sizeY = $$props.sizeY);
    		if ("posX" in $$props) $$invalidate(4, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(5, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(6, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(7, offY = $$props.offY);
    		if ("zoom" in $$props) $$invalidate(8, zoom = $$props.zoom);
    		if ("simX" in $$props) $$invalidate(9, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(10, simY = $$props.simY);
    		if ("simResizeX" in $$props) $$invalidate(11, simResizeX = $$props.simResizeX);
    		if ("simResizeY" in $$props) $$invalidate(12, simResizeY = $$props.simResizeY);
    		if ("onDrag" in $$props) $$invalidate(16, onDrag = $$props.onDrag);
    		if ("onResize" in $$props) $$invalidate(17, onResize = $$props.onResize);
    		if ("onDelete" in $$props) $$invalidate(18, onDelete = $$props.onDelete);
    	};

    	$$self.$capture_state = () => ({
    		sizeBounds,
    		text,
    		sizeX,
    		sizeY,
    		posX,
    		posY,
    		offX,
    		offY,
    		zoom,
    		simX,
    		simY,
    		simResizeX,
    		simResizeY,
    		onDrag,
    		onResize,
    		onDelete,
    		drag,
    		resize,
    		handleDelete
    	});

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("sizeX" in $$props) $$invalidate(2, sizeX = $$props.sizeX);
    		if ("sizeY" in $$props) $$invalidate(3, sizeY = $$props.sizeY);
    		if ("posX" in $$props) $$invalidate(4, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(5, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(6, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(7, offY = $$props.offY);
    		if ("zoom" in $$props) $$invalidate(8, zoom = $$props.zoom);
    		if ("simX" in $$props) $$invalidate(9, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(10, simY = $$props.simY);
    		if ("simResizeX" in $$props) $$invalidate(11, simResizeX = $$props.simResizeX);
    		if ("simResizeY" in $$props) $$invalidate(12, simResizeY = $$props.simResizeY);
    		if ("onDrag" in $$props) $$invalidate(16, onDrag = $$props.onDrag);
    		if ("onResize" in $$props) $$invalidate(17, onResize = $$props.onResize);
    		if ("onDelete" in $$props) $$invalidate(18, onDelete = $$props.onDelete);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		text,
    		sizeBounds,
    		sizeX,
    		sizeY,
    		posX,
    		posY,
    		offX,
    		offY,
    		zoom,
    		simX,
    		simY,
    		simResizeX,
    		simResizeY,
    		drag,
    		resize,
    		handleDelete,
    		onDrag,
    		onResize,
    		onDelete,
    		h1_input_handler
    	];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			sizeBounds: 1,
    			text: 0,
    			sizeX: 2,
    			sizeY: 3,
    			posX: 4,
    			posY: 5,
    			offX: 6,
    			offY: 7,
    			zoom: 8,
    			simX: 9,
    			simY: 10,
    			simResizeX: 11,
    			simResizeY: 12,
    			onDrag: 16,
    			onResize: 17,
    			onDelete: 18
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*text*/ ctx[0] === undefined && !("text" in props)) {
    			console.warn("<Header> was created without expected prop 'text'");
    		}

    		if (/*simX*/ ctx[9] === undefined && !("simX" in props)) {
    			console.warn("<Header> was created without expected prop 'simX'");
    		}

    		if (/*simY*/ ctx[10] === undefined && !("simY" in props)) {
    			console.warn("<Header> was created without expected prop 'simY'");
    		}

    		if (/*simResizeX*/ ctx[11] === undefined && !("simResizeX" in props)) {
    			console.warn("<Header> was created without expected prop 'simResizeX'");
    		}

    		if (/*simResizeY*/ ctx[12] === undefined && !("simResizeY" in props)) {
    			console.warn("<Header> was created without expected prop 'simResizeY'");
    		}

    		if (/*onDrag*/ ctx[16] === undefined && !("onDrag" in props)) {
    			console.warn("<Header> was created without expected prop 'onDrag'");
    		}

    		if (/*onResize*/ ctx[17] === undefined && !("onResize" in props)) {
    			console.warn("<Header> was created without expected prop 'onResize'");
    		}

    		if (/*onDelete*/ ctx[18] === undefined && !("onDelete" in props)) {
    			console.warn("<Header> was created without expected prop 'onDelete'");
    		}
    	}

    	get sizeBounds() {
    		return this.$$.ctx[1];
    	}

    	set sizeBounds(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sizeX() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sizeX(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sizeY() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sizeY(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get posX() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set posX(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get posY() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set posY(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offX() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offX(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offY() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offY(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zoom() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zoom(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simX() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simX(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simY() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simY(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simResizeX() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simResizeX(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simResizeY() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simResizeY(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDrag() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDrag(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onResize() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onResize(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDelete() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDelete(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Viewport\Components\Paragraph.svelte generated by Svelte v3.19.1 */

    const file$4 = "src\\Viewport\\Components\\Paragraph.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let p;
    	let t0;
    	let t1;
    	let div0;
    	let svg0;
    	let path0;
    	let t2;
    	let div1;
    	let svg1;
    	let path1;
    	let t3;
    	let div2;
    	let svg2;
    	let path2;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			p = element("p");
    			t0 = text("Title");
    			t1 = space();
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t2 = space();
    			div1 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t3 = space();
    			div2 = element("div");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			attr_dev(p, "contenteditable", "plaintext-only");
    			set_style(p, "font-size", 2 * /*zoom*/ ctx[8] + "vh");
    			set_style(p, "min-height", 2 * /*zoom*/ ctx[8] + "vh");
    			set_style(p, "min-width", /*sizeX*/ ctx[2] * /*zoom*/ ctx[8] + "vh");
    			attr_dev(p, "class", "svelte-s7fs0x");
    			if (/*text*/ ctx[0] === void 0) add_render_callback(() => /*p_input_handler*/ ctx[19].call(p));
    			add_location(p, file$4, 52, 4, 1226);
    			attr_dev(path0, "d", "M278.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l9.4-9.4V224H109.3l9.4-9.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-9.4-9.4H224V402.7l-9.4-9.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-9.4 9.4V288H402.7l-9.4 9.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l9.4 9.4H288V109.3l9.4 9.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-64-64z");
    			add_location(path0, file$4, 71, 238, 1899);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 512 512");
    			attr_dev(svg0, "class", "svelte-s7fs0x");
    			add_location(svg0, file$4, 71, 8, 1669);
    			attr_dev(div0, "class", "dragHandle svelte-s7fs0x");
    			attr_dev(div0, "draggable", "true");
    			set_style(div0, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(div0, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			add_location(div0, file$4, 61, 4, 1467);
    			attr_dev(path1, "d", "M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z");
    			add_location(path1, file$4, 83, 238, 2995);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 448 512");
    			attr_dev(svg1, "class", "svelte-s7fs0x");
    			add_location(svg1, file$4, 83, 8, 2765);
    			attr_dev(div1, "class", "deleteAction svelte-s7fs0x");
    			set_style(div1, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(div1, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			add_location(div1, file$4, 74, 4, 2578);
    			attr_dev(path2, "d", "M32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z");
    			add_location(path2, file$4, 96, 238, 3722);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "viewBox", "0 0 448 512");
    			attr_dev(svg2, "class", "svelte-s7fs0x");
    			add_location(svg2, file$4, 96, 8, 3492);
    			attr_dev(div2, "class", "resizeHandle svelte-s7fs0x");
    			attr_dev(div2, "draggable", "true");
    			set_style(div2, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(div2, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			add_location(div2, file$4, 86, 4, 3287);
    			attr_dev(main, "class", "neuIndentShadow svelte-s7fs0x");
    			set_style(main, "left", ((/*posX*/ ctx[4] + /*simX*/ ctx[9]) * /*zoom*/ ctx[8] + /*offX*/ ctx[6]) * 2 + "vh");
    			set_style(main, "top", ((/*posY*/ ctx[5] + /*simY*/ ctx[10]) * /*zoom*/ ctx[8] + /*offY*/ ctx[7]) * 2 + "vh");
    			set_style(main, "width", Math.max(/*sizeBounds*/ ctx[1][0][0], Math.min(/*sizeX*/ ctx[2] + /*simResizeX*/ ctx[11], /*sizeBounds*/ ctx[1][0][1])) * 2 * /*zoom*/ ctx[8] + "vh");
    			set_style(main, "height", Math.max(/*sizeBounds*/ ctx[1][1][0], Math.min(/*sizeY*/ ctx[3] + /*simResizeY*/ ctx[12], /*sizeBounds*/ ctx[1][1][1])) * 2 * /*zoom*/ ctx[8] + "vh");
    			set_style(main, "border-radius", 1.5 * /*zoom*/ ctx[8] + "vh");
    			set_style(main, "transition", "border-radius .2s cubic-bezier(0, 0, 0, .9),\r\n");
    			add_location(main, file$4, 39, 0, 701);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, p);
    			append_dev(p, t0);

    			if (/*text*/ ctx[0] !== void 0) {
    				p.innerHTML = /*text*/ ctx[0];
    			}

    			append_dev(main, t1);
    			append_dev(main, div0);
    			append_dev(div0, svg0);
    			append_dev(svg0, path0);
    			append_dev(main, t2);
    			append_dev(main, div1);
    			append_dev(div1, svg1);
    			append_dev(svg1, path1);
    			append_dev(main, t3);
    			append_dev(main, div2);
    			append_dev(div2, svg2);
    			append_dev(svg2, path2);

    			dispose = [
    				listen_dev(p, "input", /*p_input_handler*/ ctx[19]),
    				listen_dev(div0, "dragstart", /*drag*/ ctx[13], false, false, false),
    				listen_dev(div1, "click", /*handleDelete*/ ctx[15], false, false, false),
    				listen_dev(div2, "dragstart", /*resize*/ ctx[14], false, false, false),
    				listen_dev(main, "mousedown", mousedown_handler$1, false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*zoom*/ 256) {
    				set_style(p, "font-size", 2 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(p, "min-height", 2 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*sizeX, zoom*/ 260) {
    				set_style(p, "min-width", /*sizeX*/ ctx[2] * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*text*/ 1 && /*text*/ ctx[0] !== p.innerHTML) {
    				p.innerHTML = /*text*/ ctx[0];
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div0, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div0, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div1, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div1, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div2, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div2, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*posX, simX, zoom, offX*/ 848) {
    				set_style(main, "left", ((/*posX*/ ctx[4] + /*simX*/ ctx[9]) * /*zoom*/ ctx[8] + /*offX*/ ctx[6]) * 2 + "vh");
    			}

    			if (dirty & /*posY, simY, zoom, offY*/ 1440) {
    				set_style(main, "top", ((/*posY*/ ctx[5] + /*simY*/ ctx[10]) * /*zoom*/ ctx[8] + /*offY*/ ctx[7]) * 2 + "vh");
    			}

    			if (dirty & /*sizeX, simResizeX, zoom*/ 2308) {
    				set_style(main, "width", Math.max(/*sizeBounds*/ ctx[1][0][0], Math.min(/*sizeX*/ ctx[2] + /*simResizeX*/ ctx[11], /*sizeBounds*/ ctx[1][0][1])) * 2 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*sizeY, simResizeY, zoom*/ 4360) {
    				set_style(main, "height", Math.max(/*sizeBounds*/ ctx[1][1][0], Math.min(/*sizeY*/ ctx[3] + /*simResizeY*/ ctx[12], /*sizeBounds*/ ctx[1][1][1])) * 2 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(main, "border-radius", 1.5 * /*zoom*/ ctx[8] + "vh");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const mousedown_handler$1 = event => {
    	event.stopPropagation();
    };

    function instance$4($$self, $$props, $$invalidate) {
    	const sizeBounds = [/* X */ [5, 30], [5, 30]]; /* Y */
    	let { text } = $$props;
    	let { sizeX = 5 } = $$props;
    	let { sizeY = 2 } = $$props;
    	let { posX = 0 } = $$props;
    	let { posY = 0 } = $$props;
    	let { offX = 0 } = $$props;
    	let { offY = 0 } = $$props;
    	let { zoom = 1 } = $$props;
    	let { simX } = $$props;
    	let { simY } = $$props;
    	let { simResizeX } = $$props;
    	let { simResizeY } = $$props;
    	let { onDrag } = $$props;
    	let { onResize } = $$props;
    	let { onDelete } = $$props;

    	function drag(event) {
    		onDrag(event);
    	}

    	function resize(event) {
    		onResize(event);
    	}

    	function handleDelete() {
    		onDelete();
    	}

    	const writable_props = [
    		"text",
    		"sizeX",
    		"sizeY",
    		"posX",
    		"posY",
    		"offX",
    		"offY",
    		"zoom",
    		"simX",
    		"simY",
    		"simResizeX",
    		"simResizeY",
    		"onDrag",
    		"onResize",
    		"onDelete"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Paragraph> was created with unknown prop '${key}'`);
    	});

    	function p_input_handler() {
    		text = this.innerHTML;
    		$$invalidate(0, text);
    	}

    	$$self.$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("sizeX" in $$props) $$invalidate(2, sizeX = $$props.sizeX);
    		if ("sizeY" in $$props) $$invalidate(3, sizeY = $$props.sizeY);
    		if ("posX" in $$props) $$invalidate(4, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(5, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(6, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(7, offY = $$props.offY);
    		if ("zoom" in $$props) $$invalidate(8, zoom = $$props.zoom);
    		if ("simX" in $$props) $$invalidate(9, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(10, simY = $$props.simY);
    		if ("simResizeX" in $$props) $$invalidate(11, simResizeX = $$props.simResizeX);
    		if ("simResizeY" in $$props) $$invalidate(12, simResizeY = $$props.simResizeY);
    		if ("onDrag" in $$props) $$invalidate(16, onDrag = $$props.onDrag);
    		if ("onResize" in $$props) $$invalidate(17, onResize = $$props.onResize);
    		if ("onDelete" in $$props) $$invalidate(18, onDelete = $$props.onDelete);
    	};

    	$$self.$capture_state = () => ({
    		sizeBounds,
    		text,
    		sizeX,
    		sizeY,
    		posX,
    		posY,
    		offX,
    		offY,
    		zoom,
    		simX,
    		simY,
    		simResizeX,
    		simResizeY,
    		onDrag,
    		onResize,
    		onDelete,
    		drag,
    		resize,
    		handleDelete
    	});

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("sizeX" in $$props) $$invalidate(2, sizeX = $$props.sizeX);
    		if ("sizeY" in $$props) $$invalidate(3, sizeY = $$props.sizeY);
    		if ("posX" in $$props) $$invalidate(4, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(5, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(6, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(7, offY = $$props.offY);
    		if ("zoom" in $$props) $$invalidate(8, zoom = $$props.zoom);
    		if ("simX" in $$props) $$invalidate(9, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(10, simY = $$props.simY);
    		if ("simResizeX" in $$props) $$invalidate(11, simResizeX = $$props.simResizeX);
    		if ("simResizeY" in $$props) $$invalidate(12, simResizeY = $$props.simResizeY);
    		if ("onDrag" in $$props) $$invalidate(16, onDrag = $$props.onDrag);
    		if ("onResize" in $$props) $$invalidate(17, onResize = $$props.onResize);
    		if ("onDelete" in $$props) $$invalidate(18, onDelete = $$props.onDelete);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		text,
    		sizeBounds,
    		sizeX,
    		sizeY,
    		posX,
    		posY,
    		offX,
    		offY,
    		zoom,
    		simX,
    		simY,
    		simResizeX,
    		simResizeY,
    		drag,
    		resize,
    		handleDelete,
    		onDrag,
    		onResize,
    		onDelete,
    		p_input_handler
    	];
    }

    class Paragraph extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			sizeBounds: 1,
    			text: 0,
    			sizeX: 2,
    			sizeY: 3,
    			posX: 4,
    			posY: 5,
    			offX: 6,
    			offY: 7,
    			zoom: 8,
    			simX: 9,
    			simY: 10,
    			simResizeX: 11,
    			simResizeY: 12,
    			onDrag: 16,
    			onResize: 17,
    			onDelete: 18
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Paragraph",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*text*/ ctx[0] === undefined && !("text" in props)) {
    			console.warn("<Paragraph> was created without expected prop 'text'");
    		}

    		if (/*simX*/ ctx[9] === undefined && !("simX" in props)) {
    			console.warn("<Paragraph> was created without expected prop 'simX'");
    		}

    		if (/*simY*/ ctx[10] === undefined && !("simY" in props)) {
    			console.warn("<Paragraph> was created without expected prop 'simY'");
    		}

    		if (/*simResizeX*/ ctx[11] === undefined && !("simResizeX" in props)) {
    			console.warn("<Paragraph> was created without expected prop 'simResizeX'");
    		}

    		if (/*simResizeY*/ ctx[12] === undefined && !("simResizeY" in props)) {
    			console.warn("<Paragraph> was created without expected prop 'simResizeY'");
    		}

    		if (/*onDrag*/ ctx[16] === undefined && !("onDrag" in props)) {
    			console.warn("<Paragraph> was created without expected prop 'onDrag'");
    		}

    		if (/*onResize*/ ctx[17] === undefined && !("onResize" in props)) {
    			console.warn("<Paragraph> was created without expected prop 'onResize'");
    		}

    		if (/*onDelete*/ ctx[18] === undefined && !("onDelete" in props)) {
    			console.warn("<Paragraph> was created without expected prop 'onDelete'");
    		}
    	}

    	get sizeBounds() {
    		return this.$$.ctx[1];
    	}

    	set sizeBounds(value) {
    		throw new Error("<Paragraph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Paragraph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Paragraph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sizeX() {
    		throw new Error("<Paragraph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sizeX(value) {
    		throw new Error("<Paragraph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sizeY() {
    		throw new Error("<Paragraph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sizeY(value) {
    		throw new Error("<Paragraph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get posX() {
    		throw new Error("<Paragraph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set posX(value) {
    		throw new Error("<Paragraph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get posY() {
    		throw new Error("<Paragraph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set posY(value) {
    		throw new Error("<Paragraph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offX() {
    		throw new Error("<Paragraph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offX(value) {
    		throw new Error("<Paragraph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offY() {
    		throw new Error("<Paragraph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offY(value) {
    		throw new Error("<Paragraph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zoom() {
    		throw new Error("<Paragraph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zoom(value) {
    		throw new Error("<Paragraph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simX() {
    		throw new Error("<Paragraph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simX(value) {
    		throw new Error("<Paragraph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simY() {
    		throw new Error("<Paragraph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simY(value) {
    		throw new Error("<Paragraph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simResizeX() {
    		throw new Error("<Paragraph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simResizeX(value) {
    		throw new Error("<Paragraph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simResizeY() {
    		throw new Error("<Paragraph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simResizeY(value) {
    		throw new Error("<Paragraph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDrag() {
    		throw new Error("<Paragraph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDrag(value) {
    		throw new Error("<Paragraph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onResize() {
    		throw new Error("<Paragraph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onResize(value) {
    		throw new Error("<Paragraph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDelete() {
    		throw new Error("<Paragraph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDelete(value) {
    		throw new Error("<Paragraph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Viewport\Components\Result.svelte generated by Svelte v3.19.1 */

    const { Object: Object_1 } = globals;
    const file$5 = "src\\Viewport\\Components\\Result.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let div0;
    	let h10;
    	let t0;
    	let t1;
    	let div2;
    	let div1;
    	let h11;
    	let t2_value = /*widgetData*/ ctx[0].value + "";
    	let t2;
    	let t3;
    	let div3;
    	let svg0;
    	let path0;
    	let t4;
    	let div4;
    	let svg1;
    	let path1;
    	let t5;
    	let div5;
    	let svg2;
    	let path2;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			h10 = element("h1");
    			t0 = text("Title");
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			h11 = element("h1");
    			t2 = text(t2_value);
    			t3 = space();
    			div3 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t4 = space();
    			div4 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t5 = space();
    			div5 = element("div");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			attr_dev(h10, "contenteditable", "true");
    			set_style(h10, "font-size", 2 * /*zoom*/ ctx[8] + "vh");
    			set_style(h10, "min-height", 2 * /*zoom*/ ctx[8] + "vh");
    			set_style(h10, "min-width", /*sizeX*/ ctx[2] * /*zoom*/ ctx[8] + "vh");
    			set_style(h10, "margin-left", 4 * /*zoom*/ ctx[8] + "vh");
    			attr_dev(h10, "class", "svelte-3guahe");
    			if (/*widgetData*/ ctx[0].title === void 0) add_render_callback(() => /*h10_input_handler*/ ctx[20].call(h10));
    			add_location(h10, file$5, 66, 8, 1723);
    			attr_dev(div0, "class", "titleStrip svelte-3guahe");
    			set_style(div0, "height", 4 * /*zoom*/ ctx[8] + "vh");
    			add_location(div0, file$5, 63, 4, 1645);
    			set_style(h11, "font-size", 2 * /*zoom*/ ctx[8] + "vh");
    			set_style(h11, "margin-left", /*zoom*/ ctx[8] + "vh");
    			attr_dev(h11, "class", "svelte-3guahe");
    			add_location(h11, file$5, 88, 12, 2421);
    			attr_dev(div1, "class", "valueDisplay neuIndentShadowNarrow svelte-3guahe");
    			set_style(div1, "height", 4 * /*zoom*/ ctx[8] + "vh");
    			set_style(div1, "width", "calc(100% - " + 4 * /*zoom*/ ctx[8] + "vh)");
    			set_style(div1, "border-radius", /*zoom*/ ctx[8] + "vh");
    			add_location(div1, file$5, 82, 8, 2222);
    			attr_dev(div2, "class", "content svelte-3guahe");
    			add_location(div2, file$5, 81, 4, 2191);
    			attr_dev(path0, "d", "M278.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l9.4-9.4V224H109.3l9.4-9.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-9.4-9.4H224V402.7l-9.4-9.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-9.4 9.4V288H402.7l-9.4 9.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l9.4 9.4H288V109.3l9.4 9.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-64-64z");
    			add_location(path0, file$5, 103, 234, 2931);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 512 512");
    			attr_dev(svg0, "class", "svelte-3guahe");
    			add_location(svg0, file$5, 103, 4, 2701);
    			attr_dev(div3, "class", "dragHandle svelte-3guahe");
    			attr_dev(div3, "draggable", "true");
    			set_style(div3, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(div3, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			add_location(div3, file$5, 93, 0, 2535);
    			attr_dev(path1, "d", "M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z");
    			add_location(path1, file$5, 115, 234, 3979);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 448 512");
    			attr_dev(svg1, "class", "svelte-3guahe");
    			add_location(svg1, file$5, 115, 4, 3749);
    			attr_dev(div4, "class", "deleteAction svelte-3guahe");
    			set_style(div4, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(div4, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			add_location(div4, file$5, 106, 0, 3602);
    			attr_dev(path2, "d", "M32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z");
    			add_location(path2, file$5, 128, 234, 4658);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "viewBox", "0 0 448 512");
    			attr_dev(svg2, "class", "svelte-3guahe");
    			add_location(svg2, file$5, 128, 4, 4428);
    			attr_dev(div5, "class", "resizeHandle svelte-3guahe");
    			attr_dev(div5, "draggable", "true");
    			set_style(div5, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(div5, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			add_location(div5, file$5, 118, 0, 4263);
    			attr_dev(main, "class", "neuOutdentShadowRim svelte-3guahe");
    			set_style(main, "left", ((/*posX*/ ctx[4] + /*simX*/ ctx[9]) * /*zoom*/ ctx[8] + /*offX*/ ctx[6]) * 2 + "vh");
    			set_style(main, "top", ((/*posY*/ ctx[5] + /*simY*/ ctx[10]) * /*zoom*/ ctx[8] + /*offY*/ ctx[7]) * 2 + "vh");
    			set_style(main, "width", Math.max(/*sizeBounds*/ ctx[1][0][0], Math.min(/*sizeX*/ ctx[2] + /*simResizeX*/ ctx[11], /*sizeBounds*/ ctx[1][0][1])) * 2 * /*zoom*/ ctx[8] + "vh");
    			set_style(main, "height", Math.max(/*sizeBounds*/ ctx[1][1][0], Math.min(/*sizeY*/ ctx[3] + /*simResizeY*/ ctx[12], /*sizeBounds*/ ctx[1][1][1])) * 2 * /*zoom*/ ctx[8] + "vh");
    			set_style(main, "border-radius", 1.5 * /*zoom*/ ctx[8] + "vh");
    			set_style(main, "transition", "border-radius .2s cubic-bezier(0, 0, 0, .9),\r\n");
    			add_location(main, file$5, 50, 0, 1116);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, h10);
    			append_dev(h10, t0);

    			if (/*widgetData*/ ctx[0].title !== void 0) {
    				h10.textContent = /*widgetData*/ ctx[0].title;
    			}

    			append_dev(main, t1);
    			append_dev(main, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h11);
    			append_dev(h11, t2);
    			append_dev(main, t3);
    			append_dev(main, div3);
    			append_dev(div3, svg0);
    			append_dev(svg0, path0);
    			append_dev(main, t4);
    			append_dev(main, div4);
    			append_dev(div4, svg1);
    			append_dev(svg1, path1);
    			append_dev(main, t5);
    			append_dev(main, div5);
    			append_dev(div5, svg2);
    			append_dev(svg2, path2);

    			dispose = [
    				listen_dev(h10, "input", /*h10_input_handler*/ ctx[20]),
    				listen_dev(h10, "keypress", keypress_handler, false, false, false),
    				listen_dev(div3, "dragstart", /*drag*/ ctx[13], false, false, false),
    				listen_dev(div4, "click", /*handleDelete*/ ctx[15], false, false, false),
    				listen_dev(div5, "dragstart", /*resize*/ ctx[14], false, false, false),
    				listen_dev(main, "mousedown", mousedown_handler$2, false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*zoom*/ 256) {
    				set_style(h10, "font-size", 2 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(h10, "min-height", 2 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*sizeX, zoom*/ 260) {
    				set_style(h10, "min-width", /*sizeX*/ ctx[2] * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(h10, "margin-left", 4 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*widgetData*/ 1 && /*widgetData*/ ctx[0].title !== h10.textContent) {
    				h10.textContent = /*widgetData*/ ctx[0].title;
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div0, "height", 4 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*widgetData*/ 1 && t2_value !== (t2_value = /*widgetData*/ ctx[0].value + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*zoom*/ 256) {
    				set_style(h11, "font-size", 2 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(h11, "margin-left", /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div1, "height", 4 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div1, "width", "calc(100% - " + 4 * /*zoom*/ ctx[8] + "vh)");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div1, "border-radius", /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div3, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div3, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div4, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div4, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div5, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div5, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*posX, simX, zoom, offX*/ 848) {
    				set_style(main, "left", ((/*posX*/ ctx[4] + /*simX*/ ctx[9]) * /*zoom*/ ctx[8] + /*offX*/ ctx[6]) * 2 + "vh");
    			}

    			if (dirty & /*posY, simY, zoom, offY*/ 1440) {
    				set_style(main, "top", ((/*posY*/ ctx[5] + /*simY*/ ctx[10]) * /*zoom*/ ctx[8] + /*offY*/ ctx[7]) * 2 + "vh");
    			}

    			if (dirty & /*sizeX, simResizeX, zoom*/ 2308) {
    				set_style(main, "width", Math.max(/*sizeBounds*/ ctx[1][0][0], Math.min(/*sizeX*/ ctx[2] + /*simResizeX*/ ctx[11], /*sizeBounds*/ ctx[1][0][1])) * 2 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*sizeY, simResizeY, zoom*/ 4360) {
    				set_style(main, "height", Math.max(/*sizeBounds*/ ctx[1][1][0], Math.min(/*sizeY*/ ctx[3] + /*simResizeY*/ ctx[12], /*sizeBounds*/ ctx[1][1][1])) * 2 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(main, "border-radius", 1.5 * /*zoom*/ ctx[8] + "vh");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const keypress_handler = event => {
    	// Prevent Multiline
    	if (event.key == "Enter") event.preventDefault();
    };

    const mousedown_handler$2 = event => {
    	event.stopPropagation();
    };

    function instance$5($$self, $$props, $$invalidate) {
    	const sizeBounds = [/* X */ [7, 50], [6, 6]]; /* Y */
    	let { widgetData } = $$props;
    	let { projectData } = $$props;
    	let { sizeX = 5 } = $$props;
    	let { sizeY = 6 } = $$props;
    	let { posX = 0 } = $$props;
    	let { posY = 0 } = $$props;
    	let { offX = 0 } = $$props;
    	let { offY = 0 } = $$props;
    	let { zoom = 1 } = $$props;
    	let { simX } = $$props;
    	let { simY } = $$props;
    	let { simResizeX } = $$props;
    	let { simResizeY } = $$props;
    	let { onDrag } = $$props;
    	let { onResize } = $$props;
    	let { onDelete } = $$props;

    	function drag(event) {
    		onDrag(event);
    	}

    	function resize(event) {
    		onResize(event);
    	}

    	function handleDelete() {
    		onDelete();
    	}

    	onMount(() => {
    		$$invalidate(
    			0,
    			widgetData.update = function (value) {
    				this.value = value;

    				/* let me = projectData.objects.result[projectData.objects.result.indexOf(this)];
    me = Object.assign({}, me); */
    				$$invalidate(16, projectData.objects.result = Object.assign([], projectData.objects.result), projectData);
    			},
    			widgetData
    		);
    	});

    	const writable_props = [
    		"widgetData",
    		"projectData",
    		"sizeX",
    		"sizeY",
    		"posX",
    		"posY",
    		"offX",
    		"offY",
    		"zoom",
    		"simX",
    		"simY",
    		"simResizeX",
    		"simResizeY",
    		"onDrag",
    		"onResize",
    		"onDelete"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Result> was created with unknown prop '${key}'`);
    	});

    	function h10_input_handler() {
    		widgetData.title = this.textContent;
    		$$invalidate(0, widgetData);
    	}

    	$$self.$set = $$props => {
    		if ("widgetData" in $$props) $$invalidate(0, widgetData = $$props.widgetData);
    		if ("projectData" in $$props) $$invalidate(16, projectData = $$props.projectData);
    		if ("sizeX" in $$props) $$invalidate(2, sizeX = $$props.sizeX);
    		if ("sizeY" in $$props) $$invalidate(3, sizeY = $$props.sizeY);
    		if ("posX" in $$props) $$invalidate(4, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(5, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(6, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(7, offY = $$props.offY);
    		if ("zoom" in $$props) $$invalidate(8, zoom = $$props.zoom);
    		if ("simX" in $$props) $$invalidate(9, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(10, simY = $$props.simY);
    		if ("simResizeX" in $$props) $$invalidate(11, simResizeX = $$props.simResizeX);
    		if ("simResizeY" in $$props) $$invalidate(12, simResizeY = $$props.simResizeY);
    		if ("onDrag" in $$props) $$invalidate(17, onDrag = $$props.onDrag);
    		if ("onResize" in $$props) $$invalidate(18, onResize = $$props.onResize);
    		if ("onDelete" in $$props) $$invalidate(19, onDelete = $$props.onDelete);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		sizeBounds,
    		widgetData,
    		projectData,
    		sizeX,
    		sizeY,
    		posX,
    		posY,
    		offX,
    		offY,
    		zoom,
    		simX,
    		simY,
    		simResizeX,
    		simResizeY,
    		onDrag,
    		onResize,
    		onDelete,
    		drag,
    		resize,
    		handleDelete,
    		Object
    	});

    	$$self.$inject_state = $$props => {
    		if ("widgetData" in $$props) $$invalidate(0, widgetData = $$props.widgetData);
    		if ("projectData" in $$props) $$invalidate(16, projectData = $$props.projectData);
    		if ("sizeX" in $$props) $$invalidate(2, sizeX = $$props.sizeX);
    		if ("sizeY" in $$props) $$invalidate(3, sizeY = $$props.sizeY);
    		if ("posX" in $$props) $$invalidate(4, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(5, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(6, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(7, offY = $$props.offY);
    		if ("zoom" in $$props) $$invalidate(8, zoom = $$props.zoom);
    		if ("simX" in $$props) $$invalidate(9, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(10, simY = $$props.simY);
    		if ("simResizeX" in $$props) $$invalidate(11, simResizeX = $$props.simResizeX);
    		if ("simResizeY" in $$props) $$invalidate(12, simResizeY = $$props.simResizeY);
    		if ("onDrag" in $$props) $$invalidate(17, onDrag = $$props.onDrag);
    		if ("onResize" in $$props) $$invalidate(18, onResize = $$props.onResize);
    		if ("onDelete" in $$props) $$invalidate(19, onDelete = $$props.onDelete);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		widgetData,
    		sizeBounds,
    		sizeX,
    		sizeY,
    		posX,
    		posY,
    		offX,
    		offY,
    		zoom,
    		simX,
    		simY,
    		simResizeX,
    		simResizeY,
    		drag,
    		resize,
    		handleDelete,
    		projectData,
    		onDrag,
    		onResize,
    		onDelete,
    		h10_input_handler
    	];
    }

    class Result extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			sizeBounds: 1,
    			widgetData: 0,
    			projectData: 16,
    			sizeX: 2,
    			sizeY: 3,
    			posX: 4,
    			posY: 5,
    			offX: 6,
    			offY: 7,
    			zoom: 8,
    			simX: 9,
    			simY: 10,
    			simResizeX: 11,
    			simResizeY: 12,
    			onDrag: 17,
    			onResize: 18,
    			onDelete: 19
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Result",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*widgetData*/ ctx[0] === undefined && !("widgetData" in props)) {
    			console.warn("<Result> was created without expected prop 'widgetData'");
    		}

    		if (/*projectData*/ ctx[16] === undefined && !("projectData" in props)) {
    			console.warn("<Result> was created without expected prop 'projectData'");
    		}

    		if (/*simX*/ ctx[9] === undefined && !("simX" in props)) {
    			console.warn("<Result> was created without expected prop 'simX'");
    		}

    		if (/*simY*/ ctx[10] === undefined && !("simY" in props)) {
    			console.warn("<Result> was created without expected prop 'simY'");
    		}

    		if (/*simResizeX*/ ctx[11] === undefined && !("simResizeX" in props)) {
    			console.warn("<Result> was created without expected prop 'simResizeX'");
    		}

    		if (/*simResizeY*/ ctx[12] === undefined && !("simResizeY" in props)) {
    			console.warn("<Result> was created without expected prop 'simResizeY'");
    		}

    		if (/*onDrag*/ ctx[17] === undefined && !("onDrag" in props)) {
    			console.warn("<Result> was created without expected prop 'onDrag'");
    		}

    		if (/*onResize*/ ctx[18] === undefined && !("onResize" in props)) {
    			console.warn("<Result> was created without expected prop 'onResize'");
    		}

    		if (/*onDelete*/ ctx[19] === undefined && !("onDelete" in props)) {
    			console.warn("<Result> was created without expected prop 'onDelete'");
    		}
    	}

    	get sizeBounds() {
    		return this.$$.ctx[1];
    	}

    	set sizeBounds(value) {
    		throw new Error("<Result>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get widgetData() {
    		throw new Error("<Result>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set widgetData(value) {
    		throw new Error("<Result>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get projectData() {
    		throw new Error("<Result>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set projectData(value) {
    		throw new Error("<Result>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sizeX() {
    		throw new Error("<Result>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sizeX(value) {
    		throw new Error("<Result>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sizeY() {
    		throw new Error("<Result>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sizeY(value) {
    		throw new Error("<Result>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get posX() {
    		throw new Error("<Result>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set posX(value) {
    		throw new Error("<Result>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get posY() {
    		throw new Error("<Result>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set posY(value) {
    		throw new Error("<Result>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offX() {
    		throw new Error("<Result>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offX(value) {
    		throw new Error("<Result>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offY() {
    		throw new Error("<Result>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offY(value) {
    		throw new Error("<Result>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zoom() {
    		throw new Error("<Result>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zoom(value) {
    		throw new Error("<Result>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simX() {
    		throw new Error("<Result>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simX(value) {
    		throw new Error("<Result>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simY() {
    		throw new Error("<Result>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simY(value) {
    		throw new Error("<Result>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simResizeX() {
    		throw new Error("<Result>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simResizeX(value) {
    		throw new Error("<Result>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simResizeY() {
    		throw new Error("<Result>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simResizeY(value) {
    		throw new Error("<Result>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDrag() {
    		throw new Error("<Result>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDrag(value) {
    		throw new Error("<Result>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onResize() {
    		throw new Error("<Result>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onResize(value) {
    		throw new Error("<Result>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDelete() {
    		throw new Error("<Result>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDelete(value) {
    		throw new Error("<Result>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Viewport\Components\Table.svelte generated by Svelte v3.19.1 */

    const { Object: Object_1$1 } = globals;
    const file$6 = "src\\Viewport\\Components\\Table.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[58] = list[i];
    	child_ctx[60] = i;
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[55] = list[i];
    	child_ctx[57] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[58] = list[i];
    	child_ctx[62] = i;
    	return child_ctx;
    }

    // (241:24) {:else}
    function create_else_block_3(ctx) {
    	let div4;
    	let div0;
    	let t0;
    	let div1;
    	let svg0;
    	let path0;
    	let t1;
    	let div2;
    	let svg1;
    	let path1;
    	let t2;
    	let div3;
    	let dispose;
    	let if_block0 = /*index*/ ctx[62] > 0 && create_if_block_9(ctx);

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[43](/*index*/ ctx[62], ...args);
    	}

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[44](/*index*/ ctx[62], ...args);
    	}

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[45](/*index*/ ctx[62], ...args);
    	}

    	let if_block1 = /*index*/ ctx[62] < /*numRows*/ ctx[2] - 1 && create_if_block_8(ctx);

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[46](/*index*/ ctx[62], ...args);
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t1 = space();
    			div2 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t2 = space();
    			div3 = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "editmodeRowIndicatorButton svelte-jqwsor");
    			add_location(div0, file$6, 242, 32, 6756);
    			attr_dev(path0, "d", "M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z");
    			add_location(path0, file$6, 248, 266, 7881);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 448 512");
    			attr_dev(svg0, "class", "svelte-jqwsor");
    			add_location(svg0, file$6, 248, 36, 7651);
    			attr_dev(div1, "class", "editmodeRowIndicatorButton svelte-jqwsor");
    			add_location(div1, file$6, 247, 32, 7521);
    			attr_dev(path1, "d", "M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z");
    			add_location(path1, file$6, 250, 266, 8512);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 448 512");
    			attr_dev(svg1, "class", "svelte-jqwsor");
    			add_location(svg1, file$6, 250, 36, 8282);
    			attr_dev(div2, "class", "editmodeRowIndicatorButton svelte-jqwsor");
    			add_location(div2, file$6, 249, 32, 8152);
    			attr_dev(div3, "class", "editmodeRowIndicatorButton svelte-jqwsor");
    			add_location(div3, file$6, 251, 32, 8702);
    			attr_dev(div4, "class", "editmodeRowIndicatorButtonContainer svelte-jqwsor");
    			add_location(div4, file$6, 241, 28, 6673);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div4, t0);
    			append_dev(div4, div1);
    			append_dev(div1, svg0);
    			append_dev(svg0, path0);
    			append_dev(div4, t1);
    			append_dev(div4, div2);
    			append_dev(div2, svg1);
    			append_dev(svg1, path1);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			if (if_block1) if_block1.m(div3, null);

    			dispose = [
    				listen_dev(div0, "click", click_handler, false, false, false),
    				listen_dev(div1, "click", click_handler_1, false, false, false),
    				listen_dev(div2, "click", click_handler_2, false, false, false),
    				listen_dev(div3, "click", click_handler_3, false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*index*/ ctx[62] < /*numRows*/ ctx[2] - 1) {
    				if (!if_block1) {
    					if_block1 = create_if_block_8(ctx);
    					if_block1.c();
    					if_block1.m(div3, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(241:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (234:24) {#if !editmode}
    function create_if_block_7(ctx) {
    	let p;
    	let t_value = /*index*/ ctx[62] + 1 + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "font-size", 1.5 * /*zoom*/ ctx[13] + "vh");
    			set_style(p, "height", 1.5 * /*zoom*/ ctx[13] + "vh");
    			attr_dev(p, "class", "svelte-jqwsor");
    			add_location(p, file$6, 234, 28, 6376);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(p, "font-size", 1.5 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(p, "height", 1.5 * /*zoom*/ ctx[13] + "vh");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(234:24) {#if !editmode}",
    		ctx
    	});

    	return block;
    }

    // (244:36) {#if index > 0}
    function create_if_block_9(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M201.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 205.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z");
    			add_location(path, file$6, 244, 270, 7186);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 448 512");
    			attr_dev(svg, "class", "svelte-jqwsor");
    			add_location(svg, file$6, 244, 40, 6956);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(244:36) {#if index > 0}",
    		ctx
    	});

    	return block;
    }

    // (253:36) {#if index < numRows - 1}
    function create_if_block_8(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z");
    			add_location(path, file$6, 253, 270, 9154);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 448 512");
    			attr_dev(svg, "class", "svelte-jqwsor");
    			add_location(svg, file$6, 253, 40, 8924);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(253:36) {#if index < numRows - 1}",
    		ctx
    	});

    	return block;
    }

    // (223:16) {#each Array(numRows) as y, index}
    function create_each_block_2(ctx) {
    	let div;
    	let t;
    	let div_style_value;

    	function select_block_type(ctx, dirty) {
    		if (!/*editmode*/ ctx[6]) return create_if_block_7;
    		return create_else_block_3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			t = space();
    			attr_dev(div, "class", "rowIndicator svelte-jqwsor");
    			attr_dev(div, "style", div_style_value = "\r\n                        height: " + 3 * /*zoom*/ ctx[13] + "vh;\r\n\r\n                        margin: " + 0.2 * /*zoom*/ ctx[13] + "vh 0 " + 0.2 * /*zoom*/ ctx[13] + "vh 0;\r\n\r\n                        " + (/*editmode*/ ctx[6] ? "cursor: pointer;" : "") + "\r\n\r\n                        border-top-left-radius: " + 0.5 * /*zoom*/ ctx[13] + "vh;\r\n                        border-bottom-left-radius: " + 0.5 * /*zoom*/ ctx[13] + "vh;\r\n                    ");
    			add_location(div, file$6, 223, 20, 5946);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, t);
    				}
    			}

    			if (dirty[0] & /*zoom, editmode*/ 8256 && div_style_value !== (div_style_value = "\r\n                        height: " + 3 * /*zoom*/ ctx[13] + "vh;\r\n\r\n                        margin: " + 0.2 * /*zoom*/ ctx[13] + "vh 0 " + 0.2 * /*zoom*/ ctx[13] + "vh 0;\r\n\r\n                        " + (/*editmode*/ ctx[6] ? "cursor: pointer;" : "") + "\r\n\r\n                        border-top-left-radius: " + 0.5 * /*zoom*/ ctx[13] + "vh;\r\n                        border-bottom-left-radius: " + 0.5 * /*zoom*/ ctx[13] + "vh;\r\n                    ")) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(223:16) {#each Array(numRows) as y, index}",
    		ctx
    	});

    	return block;
    }

    // (263:12) {#if cellContents}
    function create_if_block$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*cellContents*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*zoom, cellContents, scanLocked, onInput, editmode, alphabeticColName, colNames, numCols, moveColumnRight, deleteColumn, insertColumn, moveColumnLeft*/ 33300570) {
    				each_value = /*cellContents*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(263:12) {#if cellContents}",
    		ctx
    	});

    	return block;
    }

    // (300:24) {:else}
    function create_else_block_2(ctx) {
    	let div4;
    	let div0;
    	let t0;
    	let div1;
    	let svg0;
    	let path0;
    	let t1;
    	let div2;
    	let svg1;
    	let path1;
    	let t2;
    	let div3;
    	let dispose;
    	let if_block0 = /*indexX*/ ctx[57] > 0 && create_if_block_6(ctx);

    	function click_handler_4(...args) {
    		return /*click_handler_4*/ ctx[48](/*indexX*/ ctx[57], ...args);
    	}

    	function click_handler_5(...args) {
    		return /*click_handler_5*/ ctx[49](/*indexX*/ ctx[57], ...args);
    	}

    	function click_handler_6(...args) {
    		return /*click_handler_6*/ ctx[50](/*indexX*/ ctx[57], ...args);
    	}

    	let if_block1 = /*indexX*/ ctx[57] < /*numCols*/ ctx[1] - 1 && create_if_block_5(ctx);

    	function click_handler_7(...args) {
    		return /*click_handler_7*/ ctx[51](/*indexX*/ ctx[57], ...args);
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t1 = space();
    			div2 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t2 = space();
    			div3 = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "editmodeColumnIndicatorButton svelte-jqwsor");
    			add_location(div0, file$6, 301, 32, 11515);
    			attr_dev(path0, "d", "M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z");
    			add_location(path0, file$6, 307, 266, 12658);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 448 512");
    			attr_dev(svg0, "class", "svelte-jqwsor");
    			add_location(svg0, file$6, 307, 36, 12428);
    			attr_dev(div1, "class", "editmodeColumnIndicatorButton svelte-jqwsor");
    			add_location(div1, file$6, 306, 32, 12291);
    			attr_dev(path1, "d", "M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z");
    			add_location(path1, file$6, 310, 266, 13330);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 448 512");
    			attr_dev(svg1, "class", "svelte-jqwsor");
    			add_location(svg1, file$6, 310, 36, 13100);
    			attr_dev(div2, "class", "editmodeColumnIndicatorButton svelte-jqwsor");
    			add_location(div2, file$6, 309, 32, 12963);
    			attr_dev(div3, "class", "editmodeColumnIndicatorButton svelte-jqwsor");
    			add_location(div3, file$6, 311, 32, 13520);
    			set_style(div4, "height", 2 * /*zoom*/ ctx[13] + "vh");
    			attr_dev(div4, "class", "editmodeColumnIndicatorButtonContainer svelte-jqwsor");
    			add_location(div4, file$6, 300, 28, 11401);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div4, t0);
    			append_dev(div4, div1);
    			append_dev(div1, svg0);
    			append_dev(svg0, path0);
    			append_dev(div4, t1);
    			append_dev(div4, div2);
    			append_dev(div2, svg1);
    			append_dev(svg1, path1);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			if (if_block1) if_block1.m(div3, null);

    			dispose = [
    				listen_dev(div0, "click", click_handler_4, false, false, false),
    				listen_dev(div1, "click", click_handler_5, false, false, false),
    				listen_dev(div2, "click", click_handler_6, false, false, false),
    				listen_dev(div3, "click", click_handler_7, false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*indexX*/ ctx[57] < /*numCols*/ ctx[1] - 1) {
    				if (!if_block1) {
    					if_block1 = create_if_block_5(ctx);
    					if_block1.c();
    					if_block1.m(div3, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(div4, "height", 2 * /*zoom*/ ctx[13] + "vh");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(300:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (279:24) {#if !editmode && colNames}
    function create_if_block_3(ctx) {
    	let p;
    	let t;
    	let if_block_anchor;
    	let dispose;

    	function p_input_handler() {
    		/*p_input_handler*/ ctx[47].call(p, /*indexX*/ ctx[57]);
    	}

    	let if_block = !/*colNames*/ ctx[3][/*indexX*/ ctx[57]] && create_if_block_4(ctx);

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(p, "contenteditable", "plaintext-only");
    			set_style(p, "font-size", 1.2 * /*zoom*/ ctx[13] + "vh");
    			set_style(p, "height", 1.5 * /*zoom*/ ctx[13] + "vh");
    			attr_dev(p, "class", "svelte-jqwsor");
    			if (/*colNames*/ ctx[3][/*indexX*/ ctx[57]] === void 0) add_render_callback(p_input_handler);
    			add_location(p, file$6, 279, 28, 10288);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);

    			if (/*colNames*/ ctx[3][/*indexX*/ ctx[57]] !== void 0) {
    				p.textContent = /*colNames*/ ctx[3][/*indexX*/ ctx[57]];
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			dispose = [
    				listen_dev(p, "input", p_input_handler),
    				listen_dev(p, "keypress", keypress_handler_1, false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(p, "font-size", 1.2 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(p, "height", 1.5 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*colNames*/ 8 && /*colNames*/ ctx[3][/*indexX*/ ctx[57]] !== p.textContent) {
    				p.textContent = /*colNames*/ ctx[3][/*indexX*/ ctx[57]];
    			}

    			if (!/*colNames*/ ctx[3][/*indexX*/ ctx[57]]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_4(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(279:24) {#if !editmode && colNames}",
    		ctx
    	});

    	return block;
    }

    // (303:36) {#if indexX > 0}
    function create_if_block_6(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z");
    			add_location(path, file$6, 303, 270, 11956);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 320 512");
    			attr_dev(svg, "class", "svelte-jqwsor");
    			add_location(svg, file$6, 303, 40, 11726);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(303:36) {#if indexX > 0}",
    		ctx
    	});

    	return block;
    }

    // (313:36) {#if indexX < numCols - 1}
    function create_if_block_5(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z");
    			add_location(path, file$6, 313, 270, 13982);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 320 512");
    			attr_dev(svg, "class", "svelte-jqwsor");
    			add_location(svg, file$6, 313, 40, 13752);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(313:36) {#if indexX < numCols - 1}",
    		ctx
    	});

    	return block;
    }

    // (292:28) {#if !colNames[indexX]}
    function create_if_block_4(ctx) {
    	let p;
    	let t_value = /*alphabeticColName*/ ctx[19](/*indexX*/ ctx[57]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "columnIndicatorPlaceholder svelte-jqwsor");
    			set_style(p, "font-size", 1.2 * /*zoom*/ ctx[13] + "vh");
    			set_style(p, "height", 1.5 * /*zoom*/ ctx[13] + "vh");
    			add_location(p, file$6, 292, 32, 10984);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(p, "font-size", 1.2 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(p, "height", 1.5 * /*zoom*/ ctx[13] + "vh");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(292:28) {#if !colNames[indexX]}",
    		ctx
    	});

    	return block;
    }

    // (340:28) {:else}
    function create_else_block(ctx) {
    	let div;

    	function select_block_type_3(ctx, dirty) {
    		if (/*editmode*/ ctx[6]) return create_if_block_2;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "tableCell neuIndentShadowNarrow svelte-jqwsor");
    			set_style(div, "height", 3 * /*zoom*/ ctx[13] + "vh");
    			set_style(div, "margin", 0.2 * /*zoom*/ ctx[13] + "vh 0 " + 0.2 * /*zoom*/ ctx[13] + "vh 0");
    			set_style(div, "border-radius", 0.5 * /*zoom*/ ctx[13] + "vh");
    			add_location(div, file$6, 340, 32, 15571);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(div, "height", 3 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(div, "margin", 0.2 * /*zoom*/ ctx[13] + "vh 0 " + 0.2 * /*zoom*/ ctx[13] + "vh 0");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(div, "border-radius", 0.5 * /*zoom*/ ctx[13] + "vh");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(340:28) {:else}",
    		ctx
    	});

    	return block;
    }

    // (322:28) {#if scanLocked(indexX, indexY)}
    function create_if_block_1$1(ctx) {
    	let div1;
    	let p;
    	let t0_value = /*cellContents*/ ctx[4][/*indexX*/ ctx[57]][/*indexY*/ ctx[60]] + "";
    	let t0;
    	let t1;
    	let div0;
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			set_style(p, "font-size", 1.3 * /*zoom*/ ctx[13] + "vh");
    			attr_dev(p, "class", "svelte-jqwsor");
    			add_location(p, file$6, 329, 36, 14871);
    			attr_dev(path, "d", "M1 1H0L1 0V1Z");
    			add_location(path, file$6, 335, 44, 15342);
    			attr_dev(svg, "viewBox", "0 0 1 1");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "svelte-jqwsor");
    			add_location(svg, file$6, 334, 40, 15226);
    			attr_dev(div0, "class", "cellLabelContainer svelte-jqwsor");
    			set_style(div0, "width", 1.2 * /*zoom*/ ctx[13] + "vh");
    			set_style(div0, "height", 1.2 * /*zoom*/ ctx[13] + "vh");
    			add_location(div0, file$6, 330, 36, 14980);
    			attr_dev(div1, "class", "tableCell neuIndentShadowNarrow svelte-jqwsor");
    			set_style(div1, "height", 3 * /*zoom*/ ctx[13] + "vh");
    			set_style(div1, "margin", 0.2 * /*zoom*/ ctx[13] + "vh 0 " + 0.2 * /*zoom*/ ctx[13] + "vh 0");
    			set_style(div1, "border-radius", 0.5 * /*zoom*/ ctx[13] + "vh");
    			add_location(div1, file$6, 322, 32, 14545);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p);
    			append_dev(p, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cellContents*/ 16 && t0_value !== (t0_value = /*cellContents*/ ctx[4][/*indexX*/ ctx[57]][/*indexY*/ ctx[60]] + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(p, "font-size", 1.3 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(div0, "width", 1.2 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(div0, "height", 1.2 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(div1, "height", 3 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(div1, "margin", 0.2 * /*zoom*/ ctx[13] + "vh 0 " + 0.2 * /*zoom*/ ctx[13] + "vh 0");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(div1, "border-radius", 0.5 * /*zoom*/ ctx[13] + "vh");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(322:28) {#if scanLocked(indexX, indexY)}",
    		ctx
    	});

    	return block;
    }

    // (367:36) {:else}
    function create_else_block_1(ctx) {
    	let p;
    	let t_value = /*cellContents*/ ctx[4][/*indexX*/ ctx[57]][/*indexY*/ ctx[60]] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "font-size", 1.3 * /*zoom*/ ctx[13] + "vh");
    			attr_dev(p, "class", "svelte-jqwsor");
    			add_location(p, file$6, 367, 40, 17100);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cellContents*/ 16 && t_value !== (t_value = /*cellContents*/ ctx[4][/*indexX*/ ctx[57]][/*indexY*/ ctx[60]] + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(p, "font-size", 1.3 * /*zoom*/ ctx[13] + "vh");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(367:36) {:else}",
    		ctx
    	});

    	return block;
    }

    // (348:36) {#if editmode}
    function create_if_block_2(ctx) {
    	let p;
    	let t_value = /*cellContents*/ ctx[4][/*indexX*/ ctx[57]][/*indexY*/ ctx[60]] + "";
    	let t;
    	let dispose;

    	function p_input_handler_1() {
    		/*p_input_handler_1*/ ctx[52].call(p, /*indexX*/ ctx[57], /*indexY*/ ctx[60]);
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "contenteditable", "plaintext-only");
    			set_style(p, "font-size", 1.3 * /*zoom*/ ctx[13] + "vh");
    			attr_dev(p, "class", "svelte-jqwsor");
    			if (/*cellContents*/ ctx[4][/*indexX*/ ctx[57]][/*indexY*/ ctx[60]] === void 0) add_render_callback(p_input_handler_1);
    			add_location(p, file$6, 348, 40, 15953);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);

    			if (/*cellContents*/ ctx[4][/*indexX*/ ctx[57]][/*indexY*/ ctx[60]] !== void 0) {
    				p.textContent = /*cellContents*/ ctx[4][/*indexX*/ ctx[57]][/*indexY*/ ctx[60]];
    			}

    			dispose = [
    				listen_dev(p, "input", p_input_handler_1),
    				listen_dev(p, "keypress", /*keypress_handler_2*/ ctx[53], false, false, false),
    				listen_dev(p, "blur", /*blur_handler*/ ctx[54], false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*cellContents*/ 16 && t_value !== (t_value = /*cellContents*/ ctx[4][/*indexX*/ ctx[57]][/*indexY*/ ctx[60]] + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(p, "font-size", 1.3 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*cellContents*/ 16 && /*cellContents*/ ctx[4][/*indexX*/ ctx[57]][/*indexY*/ ctx[60]] !== p.textContent) {
    				p.textContent = /*cellContents*/ ctx[4][/*indexX*/ ctx[57]][/*indexY*/ ctx[60]];
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(348:36) {#if editmode}",
    		ctx
    	});

    	return block;
    }

    // (321:24) {#each x as y, indexY}
    function create_each_block_1$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*scanLocked*/ ctx[20](/*indexX*/ ctx[57], /*indexY*/ ctx[60])) return create_if_block_1$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(321:24) {#each x as y, indexY}",
    		ctx
    	});

    	return block;
    }

    // (264:16) {#each cellContents as x, indexX}
    function create_each_block$1(ctx) {
    	let div1;
    	let div0;
    	let div0_style_value;
    	let t0;
    	let t1;

    	function select_block_type_1(ctx, dirty) {
    		if (!/*editmode*/ ctx[6] && /*colNames*/ ctx[3]) return create_if_block_3;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value_1 = /*x*/ ctx[55];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if_block.c();
    			t0 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			attr_dev(div0, "class", "columnIndicator svelte-jqwsor");
    			attr_dev(div0, "style", div0_style_value = "\r\n                        border-top-left-radius: " + 0.5 * /*zoom*/ ctx[13] + "vh;\r\n                        border-top-right-radius: " + 0.5 * /*zoom*/ ctx[13] + "vh;\r\n\r\n                        " + (/*editmode*/ ctx[6] ? "cursor: pointer;" : "") + "\r\n\r\n                        margin-bottom: " + 0.5 * /*zoom*/ ctx[13] + "vh;\r\n\r\n                        height: " + 2 * /*zoom*/ ctx[13] + "vh;\r\n                    ");
    			add_location(div0, file$6, 267, 20, 9829);
    			attr_dev(div1, "class", "tableGridColumn svelte-jqwsor");
    			set_style(div1, "width", 10 * /*zoom*/ ctx[13] + "vh");
    			add_location(div1, file$6, 264, 20, 9702);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if_block.m(div0, null);
    			append_dev(div1, t0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}

    			if (dirty[0] & /*zoom, editmode*/ 8256 && div0_style_value !== (div0_style_value = "\r\n                        border-top-left-radius: " + 0.5 * /*zoom*/ ctx[13] + "vh;\r\n                        border-top-right-radius: " + 0.5 * /*zoom*/ ctx[13] + "vh;\r\n\r\n                        " + (/*editmode*/ ctx[6] ? "cursor: pointer;" : "") + "\r\n\r\n                        margin-bottom: " + 0.5 * /*zoom*/ ctx[13] + "vh;\r\n\r\n                        height: " + 2 * /*zoom*/ ctx[13] + "vh;\r\n                    ")) {
    				attr_dev(div0, "style", div0_style_value);
    			}

    			if (dirty[0] & /*zoom, cellContents, scanLocked, onInput, editmode*/ 1318992) {
    				each_value_1 = /*x*/ ctx[55];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, t1);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(div1, "width", 10 * /*zoom*/ ctx[13] + "vh");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(264:16) {#each cellContents as x, indexX}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let main;
    	let div0;
    	let h1;
    	let t0;
    	let t1;
    	let div3;
    	let div2;
    	let div1;
    	let t2;
    	let t3;
    	let div4;
    	let svg0;
    	let path0;
    	let t4;
    	let div5;
    	let svg1;
    	let path1;
    	let t5;
    	let div6;
    	let svg2;
    	let path2;
    	let t6;
    	let div7;
    	let svg3;
    	let path3;
    	let dispose;
    	let each_value_2 = Array(/*numRows*/ ctx[2]);
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let if_block = /*cellContents*/ ctx[4] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text("Title");
    			t1 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			div4 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t4 = space();
    			div5 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t5 = space();
    			div6 = element("div");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t6 = space();
    			div7 = element("div");
    			svg3 = svg_element("svg");
    			path3 = svg_element("path");
    			attr_dev(h1, "contenteditable", "true");
    			set_style(h1, "font-size", 2 * /*zoom*/ ctx[13] + "vh");
    			set_style(h1, "min-height", 2 * /*zoom*/ ctx[13] + "vh");
    			set_style(h1, "min-width", /*sizeX*/ ctx[7] * /*zoom*/ ctx[13] + "vh");
    			set_style(h1, "margin-left", 4 * /*zoom*/ ctx[13] + "vh");
    			attr_dev(h1, "class", "svelte-jqwsor");
    			if (/*title*/ ctx[0] === void 0) add_render_callback(() => /*h1_input_handler*/ ctx[42].call(h1));
    			add_location(h1, file$6, 196, 8, 5079);
    			attr_dev(div0, "class", "titleStrip svelte-jqwsor");
    			set_style(div0, "height", 4 * /*zoom*/ ctx[13] + "vh");
    			add_location(div0, file$6, 193, 4, 4999);
    			attr_dev(div1, "class", "rowIndicatorContainer svelte-jqwsor");
    			set_style(div1, "width", (/*editmode*/ ctx[6] ? 10 : 2) * /*zoom*/ ctx[13] + "vh");
    			set_style(div1, "margin-top", 2 * /*zoom*/ ctx[13] + "vh");
    			add_location(div1, file$6, 218, 12, 5719);
    			attr_dev(div2, "class", "tableGrid svelte-jqwsor");
    			set_style(div2, "width", "calc(100% - " + 4 * /*zoom*/ ctx[13] + "vh)");
    			set_style(div2, "height", "calc(100% - " + 4 * /*zoom*/ ctx[13] + "vh)");
    			add_location(div2, file$6, 213, 8, 5570);
    			attr_dev(div3, "class", "contents svelte-jqwsor");
    			add_location(div3, file$6, 212, 4, 5538);
    			attr_dev(path0, "d", "M278.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l9.4-9.4V224H109.3l9.4-9.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-9.4-9.4H224V402.7l-9.4-9.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-9.4 9.4V288H402.7l-9.4 9.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l9.4 9.4H288V109.3l9.4 9.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-64-64z");
    			add_location(path0, file$6, 394, 238, 17999);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 512 512");
    			attr_dev(svg0, "class", "svelte-jqwsor");
    			add_location(svg0, file$6, 394, 8, 17769);
    			attr_dev(div4, "class", "dragHandle svelte-jqwsor");
    			attr_dev(div4, "draggable", "true");
    			set_style(div4, "width", 3 * /*zoom*/ ctx[13] + "vh");
    			set_style(div4, "height", 3 * /*zoom*/ ctx[13] + "vh");
    			add_location(div4, file$6, 384, 4, 17567);
    			attr_dev(path1, "d", "M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z");
    			add_location(path1, file$6, 406, 238, 19095);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 448 512");
    			attr_dev(svg1, "class", "svelte-jqwsor");
    			add_location(svg1, file$6, 406, 8, 18865);
    			attr_dev(div5, "class", "deleteAction svelte-jqwsor");
    			set_style(div5, "width", 3 * /*zoom*/ ctx[13] + "vh");
    			set_style(div5, "height", 3 * /*zoom*/ ctx[13] + "vh");
    			add_location(div5, file$6, 397, 4, 18678);
    			attr_dev(path2, "d", "M32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z");
    			add_location(path2, file$6, 419, 238, 19822);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "viewBox", "0 0 448 512");
    			attr_dev(svg2, "class", "svelte-jqwsor");
    			add_location(svg2, file$6, 419, 8, 19592);
    			attr_dev(div6, "class", "resizeHandle svelte-jqwsor");
    			attr_dev(div6, "draggable", "true");
    			set_style(div6, "width", 3 * /*zoom*/ ctx[13] + "vh");
    			set_style(div6, "height", 3 * /*zoom*/ ctx[13] + "vh");
    			add_location(div6, file$6, 409, 4, 19387);
    			attr_dev(path3, "d", "M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.8 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z");
    			add_location(path3, file$6, 431, 238, 20444);
    			attr_dev(svg3, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg3, "viewBox", "0 0 512 512");
    			attr_dev(svg3, "class", "svelte-jqwsor");
    			add_location(svg3, file$6, 431, 8, 20214);
    			attr_dev(div7, "class", "editHandle svelte-jqwsor");
    			set_style(div7, "width", 3 * /*zoom*/ ctx[13] + "vh");
    			set_style(div7, "height", 3 * /*zoom*/ ctx[13] + "vh");
    			add_location(div7, file$6, 422, 4, 20045);
    			attr_dev(main, "class", "neuOutdentShadowRim svelte-jqwsor");
    			set_style(main, "left", ((/*posX*/ ctx[9] + /*simX*/ ctx[14]) * /*zoom*/ ctx[13] + /*offX*/ ctx[11]) * 2 + "vh");
    			set_style(main, "top", ((/*posY*/ ctx[10] + /*simY*/ ctx[15]) * /*zoom*/ ctx[13] + /*offY*/ ctx[12]) * 2 + "vh");
    			set_style(main, "width", Math.max(/*sizeBounds*/ ctx[5][0][0], Math.min(/*sizeX*/ ctx[7] + /*simResizeX*/ ctx[16], /*sizeBounds*/ ctx[5][0][1])) * 2 * /*zoom*/ ctx[13] + "vh");
    			set_style(main, "height", Math.max(/*sizeBounds*/ ctx[5][1][0], Math.min(/*sizeY*/ ctx[8] + /*simResizeY*/ ctx[17], /*sizeBounds*/ ctx[5][1][1])) * 2 * /*zoom*/ ctx[13] + "vh");
    			set_style(main, "border-radius", 1.5 * /*zoom*/ ctx[13] + "vh");
    			set_style(main, "transition", "border-radius .2s cubic-bezier(0, 0, 0, .9),\r\n");
    			add_location(main, file$6, 180, 0, 4470);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);

    			if (/*title*/ ctx[0] !== void 0) {
    				h1.textContent = /*title*/ ctx[0];
    			}

    			append_dev(main, t1);
    			append_dev(main, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div2, t2);
    			if (if_block) if_block.m(div2, null);
    			append_dev(main, t3);
    			append_dev(main, div4);
    			append_dev(div4, svg0);
    			append_dev(svg0, path0);
    			append_dev(main, t4);
    			append_dev(main, div5);
    			append_dev(div5, svg1);
    			append_dev(svg1, path1);
    			append_dev(main, t5);
    			append_dev(main, div6);
    			append_dev(div6, svg2);
    			append_dev(svg2, path2);
    			append_dev(main, t6);
    			append_dev(main, div7);
    			append_dev(div7, svg3);
    			append_dev(svg3, path3);

    			dispose = [
    				listen_dev(h1, "input", /*h1_input_handler*/ ctx[42]),
    				listen_dev(h1, "keypress", keypress_handler$1, false, false, false),
    				listen_dev(div4, "dragstart", /*drag*/ ctx[29], false, false, false),
    				listen_dev(div5, "click", /*handleDelete*/ ctx[31], false, false, false),
    				listen_dev(div6, "dragstart", /*resize*/ ctx[30], false, false, false),
    				listen_dev(div7, "click", /*edit*/ ctx[32], false, false, false),
    				listen_dev(main, "mousedown", mousedown_handler$3, false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(h1, "font-size", 2 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(h1, "min-height", 2 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*sizeX, zoom*/ 8320) {
    				set_style(h1, "min-width", /*sizeX*/ ctx[7] * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(h1, "margin-left", 4 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*title*/ 1 && /*title*/ ctx[0] !== h1.textContent) {
    				h1.textContent = /*title*/ ctx[0];
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(div0, "height", 4 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*zoom, editmode, numRows, moveRowDown, deleteRow, insertRow, moveRowUp*/ 503324740) {
    				each_value_2 = Array(/*numRows*/ ctx[2]);
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (dirty[0] & /*editmode, zoom*/ 8256) {
    				set_style(div1, "width", (/*editmode*/ ctx[6] ? 10 : 2) * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(div1, "margin-top", 2 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (/*cellContents*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(div2, "width", "calc(100% - " + 4 * /*zoom*/ ctx[13] + "vh)");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(div2, "height", "calc(100% - " + 4 * /*zoom*/ ctx[13] + "vh)");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(div4, "width", 3 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(div4, "height", 3 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(div5, "width", 3 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(div5, "height", 3 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(div6, "width", 3 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(div6, "height", 3 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(div7, "width", 3 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(div7, "height", 3 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*posX, simX, zoom, offX*/ 27136) {
    				set_style(main, "left", ((/*posX*/ ctx[9] + /*simX*/ ctx[14]) * /*zoom*/ ctx[13] + /*offX*/ ctx[11]) * 2 + "vh");
    			}

    			if (dirty[0] & /*posY, simY, zoom, offY*/ 46080) {
    				set_style(main, "top", ((/*posY*/ ctx[10] + /*simY*/ ctx[15]) * /*zoom*/ ctx[13] + /*offY*/ ctx[12]) * 2 + "vh");
    			}

    			if (dirty[0] & /*sizeX, simResizeX, zoom*/ 73856) {
    				set_style(main, "width", Math.max(/*sizeBounds*/ ctx[5][0][0], Math.min(/*sizeX*/ ctx[7] + /*simResizeX*/ ctx[16], /*sizeBounds*/ ctx[5][0][1])) * 2 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*sizeY, simResizeY, zoom*/ 139520) {
    				set_style(main, "height", Math.max(/*sizeBounds*/ ctx[5][1][0], Math.min(/*sizeY*/ ctx[8] + /*simResizeY*/ ctx[17], /*sizeBounds*/ ctx[5][1][1])) * 2 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(main, "border-radius", 1.5 * /*zoom*/ ctx[13] + "vh");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const keypress_handler$1 = event => {
    	// Prevent Multiline
    	if (event.key == "Enter") event.preventDefault();
    };

    const keypress_handler_1 = event => {
    	// Prevent Multiline
    	if (event.key == "Enter") event.preventDefault();
    };

    const mousedown_handler$3 = event => {
    	event.stopPropagation();
    };

    function instance$6($$self, $$props, $$invalidate) {
    	const sizeBounds = [/* X */ [10, 50], [10, 50]]; /* Y */
    	let { title } = $$props;
    	let { numCols = 4 } = $$props, { numRows = 9 } = $$props;
    	let { colNames } = $$props;

    	const alphabet = [
    		"a",
    		"b",
    		"c",
    		"d",
    		"e",
    		"f",
    		"g",
    		"h",
    		"i",
    		"j",
    		"k",
    		"l",
    		"m",
    		"n",
    		"o",
    		"p",
    		"q",
    		"r",
    		"s",
    		"t",
    		"u",
    		"v",
    		"w",
    		"x",
    		"y",
    		"z"
    	];

    	function alphabeticColName(index) {
    		return alphabet[index % 26];
    	}

    	let { lockedCells = [] } = $$props;

    	function scanLocked(x, y) {
    		let out = false;

    		lockedCells.forEach(element => {
    			if (element[0] === x && element[1] === y) out = true;
    		});

    		return out;
    	}

    	let { cellContents } = $$props;

    	onMount(() => {
    		if (!cellContents) $$invalidate(4, cellContents = Array.from(Array(numCols), () => Array.from(new Array(numRows), () => "")));
    		if (!colNames) $$invalidate(3, colNames = []);
    		$$invalidate(1, numCols = cellContents.length);
    		$$invalidate(2, numRows = cellContents[0].length);
    	});

    	beforeUpdate(() => {
    		if (!cellContents) return;
    		$$invalidate(1, numCols = cellContents.length);
    		$$invalidate(2, numRows = cellContents[0].length);
    	});

    	function getCellContents() {
    		return cellContents;
    	}

    	function setCell(col, row, val) {
    		$$invalidate(4, cellContents[col][row] = val, cellContents);
    	}

    	let { editmode = false } = $$props;

    	function deleteColumn(index) {
    		if (numCols <= 1) return;
    		cellContents.splice(index, 1);
    		$$invalidate(1, numCols--, numCols);
    		$$invalidate(4, cellContents = Object.assign([], cellContents));
    	}

    	function insertColumn(index) {
    		cellContents.splice(index + 1, 0, Array.from(new Array(numRows), () => ""));
    		$$invalidate(1, numCols++, numCols);
    		$$invalidate(4, cellContents = Object.assign([], cellContents));
    	}

    	function moveColumnRight(index) {
    		const buffer = cellContents[index + 1];
    		$$invalidate(4, cellContents[index + 1] = cellContents[index], cellContents);
    		$$invalidate(4, cellContents[index] = buffer, cellContents);
    		$$invalidate(4, cellContents = Object.assign([], cellContents));
    	}

    	function moveColumnLeft(index) {
    		const buffer = cellContents[index - 1];
    		$$invalidate(4, cellContents[index - 1] = cellContents[index], cellContents);
    		$$invalidate(4, cellContents[index] = buffer, cellContents);
    		$$invalidate(4, cellContents = Object.assign([], cellContents));
    	}

    	function deleteRow(index) {
    		if (numRows <= 1) return;

    		cellContents.forEach(col => {
    			col.splice(index, 1);
    		});

    		$$invalidate(2, numRows--, numRows);
    		$$invalidate(4, cellContents = Object.assign([], cellContents));
    	}

    	function insertRow(index) {
    		cellContents.forEach(col => {
    			col.splice(index + 1, 0, "");
    		});

    		$$invalidate(2, numRows++, numRows);
    		$$invalidate(4, cellContents = Object.assign([], cellContents));
    	}

    	function moveRowUp(index) {
    		cellContents.forEach(col => {
    			const buffer = col[index - 1];
    			col[index - 1] = col[index];
    			col[index] = buffer;
    		});

    		$$invalidate(4, cellContents = Object.assign([], cellContents));
    	}

    	function moveRowDown(index) {
    		cellContents.forEach(col => {
    			const buffer = col[index + 1];
    			col[index + 1] = col[index];
    			col[index] = buffer;
    		});

    		$$invalidate(4, cellContents = Object.assign([], cellContents));
    	}

    	function rerender() {
    		$$invalidate(4, cellContents = Object.assign([], cellContents));
    	}

    	let { sizeX = 5 } = $$props;
    	let { sizeY = 2 } = $$props;
    	let { posX = 0 } = $$props;
    	let { posY = 0 } = $$props;
    	let { offX = 0 } = $$props;
    	let { offY = 0 } = $$props;
    	let { zoom = 1 } = $$props;
    	let { simX } = $$props;
    	let { simY } = $$props;
    	let { simResizeX } = $$props;
    	let { simResizeY } = $$props;
    	let { onDrag } = $$props;
    	let { onResize } = $$props;
    	let { onDelete } = $$props;
    	let { onEdit } = $$props;
    	let { onInput } = $$props;

    	function drag(event) {
    		event.stopPropagation();
    		onDrag(event);
    	}

    	function resize(event) {
    		event.stopPropagation();
    		onResize(event);
    	}

    	function handleDelete() {
    		onDelete();
    	}

    	function edit() {
    		onEdit();
    	}

    	const writable_props = [
    		"title",
    		"numCols",
    		"numRows",
    		"colNames",
    		"lockedCells",
    		"cellContents",
    		"editmode",
    		"sizeX",
    		"sizeY",
    		"posX",
    		"posY",
    		"offX",
    		"offY",
    		"zoom",
    		"simX",
    		"simY",
    		"simResizeX",
    		"simResizeY",
    		"onDrag",
    		"onResize",
    		"onDelete",
    		"onEdit",
    		"onInput"
    	];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Table> was created with unknown prop '${key}'`);
    	});

    	function h1_input_handler() {
    		title = this.textContent;
    		$$invalidate(0, title);
    	}

    	const click_handler = index => {
    		if (editmode && index > 0) {
    			moveRowUp(index);
    		}
    	};

    	const click_handler_1 = index => {
    		if (editmode) {
    			insertRow(index);
    		}
    	};

    	const click_handler_2 = index => {
    		if (editmode) {
    			deleteRow(index);
    		}
    	};

    	const click_handler_3 = index => {
    		if (editmode && index < numRows - 1) {
    			moveRowDown(index);
    		}
    	};

    	function p_input_handler(indexX) {
    		colNames[indexX] = this.textContent;
    		$$invalidate(3, colNames);
    	}

    	const click_handler_4 = indexX => {
    		if (editmode && indexX > 0) {
    			moveColumnLeft(indexX);
    		}
    	};

    	const click_handler_5 = indexX => {
    		if (editmode) {
    			insertColumn(indexX);
    		}
    	};

    	const click_handler_6 = indexX => {
    		if (editmode) {
    			deleteColumn(indexX);
    		}
    	};

    	const click_handler_7 = indexX => {
    		if (editmode && indexX < numCols - 1) {
    			moveColumnRight(indexX);
    		}
    	};

    	function p_input_handler_1(indexX, indexY) {
    		cellContents[indexX][indexY] = this.textContent;
    		$$invalidate(4, cellContents);
    	}

    	const keypress_handler_2 = event => {
    		// Prevent Multiline
    		if (event.key == "Enter") {
    			event.preventDefault();
    			let active = document.activeElement;
    			if (active) active.blur();
    		}
    	};

    	const blur_handler = () => {
    		onInput();
    	};

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("numCols" in $$props) $$invalidate(1, numCols = $$props.numCols);
    		if ("numRows" in $$props) $$invalidate(2, numRows = $$props.numRows);
    		if ("colNames" in $$props) $$invalidate(3, colNames = $$props.colNames);
    		if ("lockedCells" in $$props) $$invalidate(33, lockedCells = $$props.lockedCells);
    		if ("cellContents" in $$props) $$invalidate(4, cellContents = $$props.cellContents);
    		if ("editmode" in $$props) $$invalidate(6, editmode = $$props.editmode);
    		if ("sizeX" in $$props) $$invalidate(7, sizeX = $$props.sizeX);
    		if ("sizeY" in $$props) $$invalidate(8, sizeY = $$props.sizeY);
    		if ("posX" in $$props) $$invalidate(9, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(10, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(11, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(12, offY = $$props.offY);
    		if ("zoom" in $$props) $$invalidate(13, zoom = $$props.zoom);
    		if ("simX" in $$props) $$invalidate(14, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(15, simY = $$props.simY);
    		if ("simResizeX" in $$props) $$invalidate(16, simResizeX = $$props.simResizeX);
    		if ("simResizeY" in $$props) $$invalidate(17, simResizeY = $$props.simResizeY);
    		if ("onDrag" in $$props) $$invalidate(37, onDrag = $$props.onDrag);
    		if ("onResize" in $$props) $$invalidate(38, onResize = $$props.onResize);
    		if ("onDelete" in $$props) $$invalidate(39, onDelete = $$props.onDelete);
    		if ("onEdit" in $$props) $$invalidate(40, onEdit = $$props.onEdit);
    		if ("onInput" in $$props) $$invalidate(18, onInput = $$props.onInput);
    	};

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		onMount,
    		sizeBounds,
    		title,
    		numCols,
    		numRows,
    		colNames,
    		alphabet,
    		alphabeticColName,
    		lockedCells,
    		scanLocked,
    		cellContents,
    		getCellContents,
    		setCell,
    		editmode,
    		deleteColumn,
    		insertColumn,
    		moveColumnRight,
    		moveColumnLeft,
    		deleteRow,
    		insertRow,
    		moveRowUp,
    		moveRowDown,
    		rerender,
    		sizeX,
    		sizeY,
    		posX,
    		posY,
    		offX,
    		offY,
    		zoom,
    		simX,
    		simY,
    		simResizeX,
    		simResizeY,
    		onDrag,
    		onResize,
    		onDelete,
    		onEdit,
    		onInput,
    		drag,
    		resize,
    		handleDelete,
    		edit,
    		Array,
    		Object
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("numCols" in $$props) $$invalidate(1, numCols = $$props.numCols);
    		if ("numRows" in $$props) $$invalidate(2, numRows = $$props.numRows);
    		if ("colNames" in $$props) $$invalidate(3, colNames = $$props.colNames);
    		if ("lockedCells" in $$props) $$invalidate(33, lockedCells = $$props.lockedCells);
    		if ("cellContents" in $$props) $$invalidate(4, cellContents = $$props.cellContents);
    		if ("editmode" in $$props) $$invalidate(6, editmode = $$props.editmode);
    		if ("sizeX" in $$props) $$invalidate(7, sizeX = $$props.sizeX);
    		if ("sizeY" in $$props) $$invalidate(8, sizeY = $$props.sizeY);
    		if ("posX" in $$props) $$invalidate(9, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(10, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(11, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(12, offY = $$props.offY);
    		if ("zoom" in $$props) $$invalidate(13, zoom = $$props.zoom);
    		if ("simX" in $$props) $$invalidate(14, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(15, simY = $$props.simY);
    		if ("simResizeX" in $$props) $$invalidate(16, simResizeX = $$props.simResizeX);
    		if ("simResizeY" in $$props) $$invalidate(17, simResizeY = $$props.simResizeY);
    		if ("onDrag" in $$props) $$invalidate(37, onDrag = $$props.onDrag);
    		if ("onResize" in $$props) $$invalidate(38, onResize = $$props.onResize);
    		if ("onDelete" in $$props) $$invalidate(39, onDelete = $$props.onDelete);
    		if ("onEdit" in $$props) $$invalidate(40, onEdit = $$props.onEdit);
    		if ("onInput" in $$props) $$invalidate(18, onInput = $$props.onInput);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		numCols,
    		numRows,
    		colNames,
    		cellContents,
    		sizeBounds,
    		editmode,
    		sizeX,
    		sizeY,
    		posX,
    		posY,
    		offX,
    		offY,
    		zoom,
    		simX,
    		simY,
    		simResizeX,
    		simResizeY,
    		onInput,
    		alphabeticColName,
    		scanLocked,
    		deleteColumn,
    		insertColumn,
    		moveColumnRight,
    		moveColumnLeft,
    		deleteRow,
    		insertRow,
    		moveRowUp,
    		moveRowDown,
    		drag,
    		resize,
    		handleDelete,
    		edit,
    		lockedCells,
    		getCellContents,
    		setCell,
    		rerender,
    		onDrag,
    		onResize,
    		onDelete,
    		onEdit,
    		alphabet,
    		h1_input_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		p_input_handler,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		p_input_handler_1,
    		keypress_handler_2,
    		blur_handler
    	];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$6,
    			create_fragment$6,
    			safe_not_equal,
    			{
    				sizeBounds: 5,
    				title: 0,
    				numCols: 1,
    				numRows: 2,
    				colNames: 3,
    				lockedCells: 33,
    				cellContents: 4,
    				getCellContents: 34,
    				setCell: 35,
    				editmode: 6,
    				rerender: 36,
    				sizeX: 7,
    				sizeY: 8,
    				posX: 9,
    				posY: 10,
    				offX: 11,
    				offY: 12,
    				zoom: 13,
    				simX: 14,
    				simY: 15,
    				simResizeX: 16,
    				simResizeY: 17,
    				onDrag: 37,
    				onResize: 38,
    				onDelete: 39,
    				onEdit: 40,
    				onInput: 18
    			},
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<Table> was created without expected prop 'title'");
    		}

    		if (/*colNames*/ ctx[3] === undefined && !("colNames" in props)) {
    			console.warn("<Table> was created without expected prop 'colNames'");
    		}

    		if (/*cellContents*/ ctx[4] === undefined && !("cellContents" in props)) {
    			console.warn("<Table> was created without expected prop 'cellContents'");
    		}

    		if (/*simX*/ ctx[14] === undefined && !("simX" in props)) {
    			console.warn("<Table> was created without expected prop 'simX'");
    		}

    		if (/*simY*/ ctx[15] === undefined && !("simY" in props)) {
    			console.warn("<Table> was created without expected prop 'simY'");
    		}

    		if (/*simResizeX*/ ctx[16] === undefined && !("simResizeX" in props)) {
    			console.warn("<Table> was created without expected prop 'simResizeX'");
    		}

    		if (/*simResizeY*/ ctx[17] === undefined && !("simResizeY" in props)) {
    			console.warn("<Table> was created without expected prop 'simResizeY'");
    		}

    		if (/*onDrag*/ ctx[37] === undefined && !("onDrag" in props)) {
    			console.warn("<Table> was created without expected prop 'onDrag'");
    		}

    		if (/*onResize*/ ctx[38] === undefined && !("onResize" in props)) {
    			console.warn("<Table> was created without expected prop 'onResize'");
    		}

    		if (/*onDelete*/ ctx[39] === undefined && !("onDelete" in props)) {
    			console.warn("<Table> was created without expected prop 'onDelete'");
    		}

    		if (/*onEdit*/ ctx[40] === undefined && !("onEdit" in props)) {
    			console.warn("<Table> was created without expected prop 'onEdit'");
    		}

    		if (/*onInput*/ ctx[18] === undefined && !("onInput" in props)) {
    			console.warn("<Table> was created without expected prop 'onInput'");
    		}
    	}

    	get sizeBounds() {
    		return this.$$.ctx[5];
    	}

    	set sizeBounds(value) {
    		throw new Error("<Table>: Cannot set read-only property 'sizeBounds'");
    	}

    	get title() {
    		return this.$$.ctx[0];
    	}

    	set title(title) {
    		this.$set({ title });
    		flush();
    	}

    	get numCols() {
    		return this.$$.ctx[1];
    	}

    	set numCols(numCols) {
    		this.$set({ numCols });
    		flush();
    	}

    	get numRows() {
    		return this.$$.ctx[2];
    	}

    	set numRows(numRows) {
    		this.$set({ numRows });
    		flush();
    	}

    	get colNames() {
    		return this.$$.ctx[3];
    	}

    	set colNames(colNames) {
    		this.$set({ colNames });
    		flush();
    	}

    	get lockedCells() {
    		return this.$$.ctx[33];
    	}

    	set lockedCells(lockedCells) {
    		this.$set({ lockedCells });
    		flush();
    	}

    	get cellContents() {
    		return this.$$.ctx[4];
    	}

    	set cellContents(cellContents) {
    		this.$set({ cellContents });
    		flush();
    	}

    	get getCellContents() {
    		return this.$$.ctx[34];
    	}

    	set getCellContents(value) {
    		throw new Error("<Table>: Cannot set read-only property 'getCellContents'");
    	}

    	get setCell() {
    		return this.$$.ctx[35];
    	}

    	set setCell(value) {
    		throw new Error("<Table>: Cannot set read-only property 'setCell'");
    	}

    	get editmode() {
    		return this.$$.ctx[6];
    	}

    	set editmode(editmode) {
    		this.$set({ editmode });
    		flush();
    	}

    	get rerender() {
    		return this.$$.ctx[36];
    	}

    	set rerender(value) {
    		throw new Error("<Table>: Cannot set read-only property 'rerender'");
    	}

    	get sizeX() {
    		return this.$$.ctx[7];
    	}

    	set sizeX(sizeX) {
    		this.$set({ sizeX });
    		flush();
    	}

    	get sizeY() {
    		return this.$$.ctx[8];
    	}

    	set sizeY(sizeY) {
    		this.$set({ sizeY });
    		flush();
    	}

    	get posX() {
    		return this.$$.ctx[9];
    	}

    	set posX(posX) {
    		this.$set({ posX });
    		flush();
    	}

    	get posY() {
    		return this.$$.ctx[10];
    	}

    	set posY(posY) {
    		this.$set({ posY });
    		flush();
    	}

    	get offX() {
    		return this.$$.ctx[11];
    	}

    	set offX(offX) {
    		this.$set({ offX });
    		flush();
    	}

    	get offY() {
    		return this.$$.ctx[12];
    	}

    	set offY(offY) {
    		this.$set({ offY });
    		flush();
    	}

    	get zoom() {
    		return this.$$.ctx[13];
    	}

    	set zoom(zoom) {
    		this.$set({ zoom });
    		flush();
    	}

    	get simX() {
    		return this.$$.ctx[14];
    	}

    	set simX(simX) {
    		this.$set({ simX });
    		flush();
    	}

    	get simY() {
    		return this.$$.ctx[15];
    	}

    	set simY(simY) {
    		this.$set({ simY });
    		flush();
    	}

    	get simResizeX() {
    		return this.$$.ctx[16];
    	}

    	set simResizeX(simResizeX) {
    		this.$set({ simResizeX });
    		flush();
    	}

    	get simResizeY() {
    		return this.$$.ctx[17];
    	}

    	set simResizeY(simResizeY) {
    		this.$set({ simResizeY });
    		flush();
    	}

    	get onDrag() {
    		return this.$$.ctx[37];
    	}

    	set onDrag(onDrag) {
    		this.$set({ onDrag });
    		flush();
    	}

    	get onResize() {
    		return this.$$.ctx[38];
    	}

    	set onResize(onResize) {
    		this.$set({ onResize });
    		flush();
    	}

    	get onDelete() {
    		return this.$$.ctx[39];
    	}

    	set onDelete(onDelete) {
    		this.$set({ onDelete });
    		flush();
    	}

    	get onEdit() {
    		return this.$$.ctx[40];
    	}

    	set onEdit(onEdit) {
    		this.$set({ onEdit });
    		flush();
    	}

    	get onInput() {
    		return this.$$.ctx[18];
    	}

    	set onInput(onInput) {
    		this.$set({ onInput });
    		flush();
    	}
    }

    /* src\Viewport\Components\PluginWrapper.svelte generated by Svelte v3.19.1 */

    const { console: console_1 } = globals;
    const file$7 = "src\\Viewport\\Components\\PluginWrapper.svelte";

    function create_fragment$7(ctx) {
    	let main;
    	let div0;
    	let t0;
    	let div1;
    	let svg0;
    	let path0;
    	let t1;
    	let div2;
    	let svg1;
    	let path1;
    	let t2;
    	let div3;
    	let svg2;
    	let path2;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t1 = space();
    			div2 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t2 = space();
    			div3 = element("div");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			attr_dev(div0, "class", "wrapper svelte-8p997g");
    			add_location(div0, file$7, 100, 4, 2594);
    			attr_dev(path0, "d", "M278.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l9.4-9.4V224H109.3l9.4-9.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-9.4-9.4H224V402.7l-9.4-9.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-9.4 9.4V288H402.7l-9.4 9.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l9.4 9.4H288V109.3l9.4 9.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-64-64z");
    			add_location(path0, file$7, 115, 238, 3089);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 512 512");
    			attr_dev(svg0, "class", "svelte-8p997g");
    			add_location(svg0, file$7, 115, 8, 2859);
    			attr_dev(div1, "class", "dragHandle svelte-8p997g");
    			attr_dev(div1, "draggable", "true");
    			set_style(div1, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			set_style(div1, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			add_location(div1, file$7, 105, 4, 2657);
    			attr_dev(path1, "d", "M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z");
    			add_location(path1, file$7, 127, 238, 4185);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 448 512");
    			attr_dev(svg1, "class", "svelte-8p997g");
    			add_location(svg1, file$7, 127, 8, 3955);
    			attr_dev(div2, "class", "deleteAction svelte-8p997g");
    			set_style(div2, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			set_style(div2, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			add_location(div2, file$7, 118, 4, 3768);
    			attr_dev(path2, "d", "M32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z");
    			add_location(path2, file$7, 140, 238, 4912);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "viewBox", "0 0 448 512");
    			attr_dev(svg2, "class", "svelte-8p997g");
    			add_location(svg2, file$7, 140, 8, 4682);
    			attr_dev(div3, "class", "resizeHandle svelte-8p997g");
    			attr_dev(div3, "draggable", "true");
    			set_style(div3, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			set_style(div3, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			add_location(div3, file$7, 130, 4, 4477);
    			attr_dev(main, "class", "neuIndentShadow svelte-8p997g");
    			set_style(main, "left", ((/*posX*/ ctx[3] + /*simX*/ ctx[8]) * /*zoom*/ ctx[7] + /*offX*/ ctx[5]) * 2 + "vh");
    			set_style(main, "top", ((/*posY*/ ctx[4] + /*simY*/ ctx[9]) * /*zoom*/ ctx[7] + /*offY*/ ctx[6]) * 2 + "vh");
    			set_style(main, "width", Math.max(/*sizeBounds*/ ctx[0][0][0], Math.min(/*sizeX*/ ctx[1] + /*simResizeX*/ ctx[10], /*sizeBounds*/ ctx[0][0][1])) * 2 * /*zoom*/ ctx[7] + "vh");
    			set_style(main, "height", Math.max(/*sizeBounds*/ ctx[0][1][0], Math.min(/*sizeY*/ ctx[2] + /*simResizeY*/ ctx[11], /*sizeBounds*/ ctx[0][1][1])) * 2 * /*zoom*/ ctx[7] + "vh");
    			set_style(main, "border-radius", 1.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(main, "transition", "border-radius .2s cubic-bezier(0, 0, 0, .9),\r\n");
    			add_location(main, file$7, 87, 0, 2069);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			/*div0_binding*/ ctx[27](div0);
    			append_dev(main, t0);
    			append_dev(main, div1);
    			append_dev(div1, svg0);
    			append_dev(svg0, path0);
    			append_dev(main, t1);
    			append_dev(main, div2);
    			append_dev(div2, svg1);
    			append_dev(svg1, path1);
    			append_dev(main, t2);
    			append_dev(main, div3);
    			append_dev(div3, svg2);
    			append_dev(svg2, path2);

    			dispose = [
    				listen_dev(div1, "dragstart", /*drag*/ ctx[13], false, false, false),
    				listen_dev(div2, "click", /*handleDelete*/ ctx[15], false, false, false),
    				listen_dev(div3, "dragstart", /*resize*/ ctx[14], false, false, false),
    				listen_dev(main, "mousedown", mousedown_handler$4, false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*zoom*/ 128) {
    				set_style(div1, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div1, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div2, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div2, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div3, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div3, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*posX, simX, zoom, offX*/ 424) {
    				set_style(main, "left", ((/*posX*/ ctx[3] + /*simX*/ ctx[8]) * /*zoom*/ ctx[7] + /*offX*/ ctx[5]) * 2 + "vh");
    			}

    			if (dirty & /*posY, simY, zoom, offY*/ 720) {
    				set_style(main, "top", ((/*posY*/ ctx[4] + /*simY*/ ctx[9]) * /*zoom*/ ctx[7] + /*offY*/ ctx[6]) * 2 + "vh");
    			}

    			if (dirty & /*sizeX, simResizeX, zoom*/ 1154) {
    				set_style(main, "width", Math.max(/*sizeBounds*/ ctx[0][0][0], Math.min(/*sizeX*/ ctx[1] + /*simResizeX*/ ctx[10], /*sizeBounds*/ ctx[0][0][1])) * 2 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*sizeY, simResizeY, zoom*/ 2180) {
    				set_style(main, "height", Math.max(/*sizeBounds*/ ctx[0][1][0], Math.min(/*sizeY*/ ctx[2] + /*simResizeY*/ ctx[11], /*sizeBounds*/ ctx[0][1][1])) * 2 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(main, "border-radius", 1.5 * /*zoom*/ ctx[7] + "vh");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			/*div0_binding*/ ctx[27](null);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const mousedown_handler$4 = event => {
    	event.stopPropagation();
    };

    function instance$7($$self, $$props, $$invalidate) {
    	const { ipcRenderer } = require("electron");
    	const fs = require("fs");
    	const path = require("path");
    	const sizeBounds = [/* X */ [5, 30], [5, 30]]; /* Y */
    	let { sizeX = 5 } = $$props;
    	let { sizeY = 2 } = $$props;
    	let { posX = 0 } = $$props;
    	let { posY = 0 } = $$props;
    	let { offX = 0 } = $$props;
    	let { offY = 0 } = $$props;
    	let { zoom = 1 } = $$props;
    	let { simX } = $$props;
    	let { simY } = $$props;
    	let { simResizeX } = $$props;
    	let { simResizeY } = $$props;
    	let { onDrag } = $$props;
    	let { onResize } = $$props;
    	let { onDelete } = $$props;

    	function drag(event) {
    		onDrag(event);
    	}

    	function resize(event) {
    		onResize(event);
    	}

    	function handleDelete() {
    		onDelete();
    	}

    	let { projectData } = $$props,
    		{ widgetData } = $$props,
    		{ widgetID } = $$props,
    		{ pluginID } = $$props;

    	let _main;
    	let controller;

    	onMount(() => {
    		console.log("im here");

    		try {
    			// Load HTML
    			const html = String(fs.readFileSync(path.join(ipcRenderer.sendSync("getSaveLocation"), ".plugins", pluginID, widgetID, `${widgetID}.html`)));

    			$$invalidate(12, _main.innerHTML = html, _main);

    			// Load CSS
    			const css = String(fs.readFileSync(path.join(ipcRenderer.sendSync("getSaveLocation"), ".plugins", pluginID, widgetID, `${widgetID}.css`)));

    			let styleElement = document.createElement("style");
    			styleElement.innerHTML = css;
    			_main.appendChild(styleElement);

    			// Load js module
    			const classModule = require(path.join(ipcRenderer.sendSync("getSaveLocation"), ".plugins", pluginID, widgetID, `${widgetID}.js`));

    			controller = new classModule(_main, projectData, widgetData);
    		} catch(err) {
    			console.error(err);
    		}
    	});

    	const writable_props = [
    		"sizeX",
    		"sizeY",
    		"posX",
    		"posY",
    		"offX",
    		"offY",
    		"zoom",
    		"simX",
    		"simY",
    		"simResizeX",
    		"simResizeY",
    		"onDrag",
    		"onResize",
    		"onDelete",
    		"projectData",
    		"widgetData",
    		"widgetID",
    		"pluginID"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<PluginWrapper> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(12, _main = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("sizeX" in $$props) $$invalidate(1, sizeX = $$props.sizeX);
    		if ("sizeY" in $$props) $$invalidate(2, sizeY = $$props.sizeY);
    		if ("posX" in $$props) $$invalidate(3, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(4, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(5, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(6, offY = $$props.offY);
    		if ("zoom" in $$props) $$invalidate(7, zoom = $$props.zoom);
    		if ("simX" in $$props) $$invalidate(8, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(9, simY = $$props.simY);
    		if ("simResizeX" in $$props) $$invalidate(10, simResizeX = $$props.simResizeX);
    		if ("simResizeY" in $$props) $$invalidate(11, simResizeY = $$props.simResizeY);
    		if ("onDrag" in $$props) $$invalidate(16, onDrag = $$props.onDrag);
    		if ("onResize" in $$props) $$invalidate(17, onResize = $$props.onResize);
    		if ("onDelete" in $$props) $$invalidate(18, onDelete = $$props.onDelete);
    		if ("projectData" in $$props) $$invalidate(19, projectData = $$props.projectData);
    		if ("widgetData" in $$props) $$invalidate(20, widgetData = $$props.widgetData);
    		if ("widgetID" in $$props) $$invalidate(21, widgetID = $$props.widgetID);
    		if ("pluginID" in $$props) $$invalidate(22, pluginID = $$props.pluginID);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		ipcRenderer,
    		fs,
    		path,
    		sizeBounds,
    		sizeX,
    		sizeY,
    		posX,
    		posY,
    		offX,
    		offY,
    		zoom,
    		simX,
    		simY,
    		simResizeX,
    		simResizeY,
    		onDrag,
    		onResize,
    		onDelete,
    		drag,
    		resize,
    		handleDelete,
    		projectData,
    		widgetData,
    		widgetID,
    		pluginID,
    		_main,
    		controller,
    		require,
    		console,
    		String,
    		document
    	});

    	$$self.$inject_state = $$props => {
    		if ("sizeX" in $$props) $$invalidate(1, sizeX = $$props.sizeX);
    		if ("sizeY" in $$props) $$invalidate(2, sizeY = $$props.sizeY);
    		if ("posX" in $$props) $$invalidate(3, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(4, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(5, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(6, offY = $$props.offY);
    		if ("zoom" in $$props) $$invalidate(7, zoom = $$props.zoom);
    		if ("simX" in $$props) $$invalidate(8, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(9, simY = $$props.simY);
    		if ("simResizeX" in $$props) $$invalidate(10, simResizeX = $$props.simResizeX);
    		if ("simResizeY" in $$props) $$invalidate(11, simResizeY = $$props.simResizeY);
    		if ("onDrag" in $$props) $$invalidate(16, onDrag = $$props.onDrag);
    		if ("onResize" in $$props) $$invalidate(17, onResize = $$props.onResize);
    		if ("onDelete" in $$props) $$invalidate(18, onDelete = $$props.onDelete);
    		if ("projectData" in $$props) $$invalidate(19, projectData = $$props.projectData);
    		if ("widgetData" in $$props) $$invalidate(20, widgetData = $$props.widgetData);
    		if ("widgetID" in $$props) $$invalidate(21, widgetID = $$props.widgetID);
    		if ("pluginID" in $$props) $$invalidate(22, pluginID = $$props.pluginID);
    		if ("_main" in $$props) $$invalidate(12, _main = $$props._main);
    		if ("controller" in $$props) controller = $$props.controller;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		sizeBounds,
    		sizeX,
    		sizeY,
    		posX,
    		posY,
    		offX,
    		offY,
    		zoom,
    		simX,
    		simY,
    		simResizeX,
    		simResizeY,
    		_main,
    		drag,
    		resize,
    		handleDelete,
    		onDrag,
    		onResize,
    		onDelete,
    		projectData,
    		widgetData,
    		widgetID,
    		pluginID,
    		controller,
    		ipcRenderer,
    		fs,
    		path,
    		div0_binding
    	];
    }

    class PluginWrapper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			sizeBounds: 0,
    			sizeX: 1,
    			sizeY: 2,
    			posX: 3,
    			posY: 4,
    			offX: 5,
    			offY: 6,
    			zoom: 7,
    			simX: 8,
    			simY: 9,
    			simResizeX: 10,
    			simResizeY: 11,
    			onDrag: 16,
    			onResize: 17,
    			onDelete: 18,
    			projectData: 19,
    			widgetData: 20,
    			widgetID: 21,
    			pluginID: 22
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PluginWrapper",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*simX*/ ctx[8] === undefined && !("simX" in props)) {
    			console_1.warn("<PluginWrapper> was created without expected prop 'simX'");
    		}

    		if (/*simY*/ ctx[9] === undefined && !("simY" in props)) {
    			console_1.warn("<PluginWrapper> was created without expected prop 'simY'");
    		}

    		if (/*simResizeX*/ ctx[10] === undefined && !("simResizeX" in props)) {
    			console_1.warn("<PluginWrapper> was created without expected prop 'simResizeX'");
    		}

    		if (/*simResizeY*/ ctx[11] === undefined && !("simResizeY" in props)) {
    			console_1.warn("<PluginWrapper> was created without expected prop 'simResizeY'");
    		}

    		if (/*onDrag*/ ctx[16] === undefined && !("onDrag" in props)) {
    			console_1.warn("<PluginWrapper> was created without expected prop 'onDrag'");
    		}

    		if (/*onResize*/ ctx[17] === undefined && !("onResize" in props)) {
    			console_1.warn("<PluginWrapper> was created without expected prop 'onResize'");
    		}

    		if (/*onDelete*/ ctx[18] === undefined && !("onDelete" in props)) {
    			console_1.warn("<PluginWrapper> was created without expected prop 'onDelete'");
    		}

    		if (/*projectData*/ ctx[19] === undefined && !("projectData" in props)) {
    			console_1.warn("<PluginWrapper> was created without expected prop 'projectData'");
    		}

    		if (/*widgetData*/ ctx[20] === undefined && !("widgetData" in props)) {
    			console_1.warn("<PluginWrapper> was created without expected prop 'widgetData'");
    		}

    		if (/*widgetID*/ ctx[21] === undefined && !("widgetID" in props)) {
    			console_1.warn("<PluginWrapper> was created without expected prop 'widgetID'");
    		}

    		if (/*pluginID*/ ctx[22] === undefined && !("pluginID" in props)) {
    			console_1.warn("<PluginWrapper> was created without expected prop 'pluginID'");
    		}
    	}

    	get sizeBounds() {
    		return this.$$.ctx[0];
    	}

    	set sizeBounds(value) {
    		throw new Error("<PluginWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sizeX() {
    		throw new Error("<PluginWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sizeX(value) {
    		throw new Error("<PluginWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sizeY() {
    		throw new Error("<PluginWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sizeY(value) {
    		throw new Error("<PluginWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get posX() {
    		throw new Error("<PluginWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set posX(value) {
    		throw new Error("<PluginWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get posY() {
    		throw new Error("<PluginWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set posY(value) {
    		throw new Error("<PluginWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offX() {
    		throw new Error("<PluginWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offX(value) {
    		throw new Error("<PluginWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offY() {
    		throw new Error("<PluginWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offY(value) {
    		throw new Error("<PluginWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zoom() {
    		throw new Error("<PluginWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zoom(value) {
    		throw new Error("<PluginWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simX() {
    		throw new Error("<PluginWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simX(value) {
    		throw new Error("<PluginWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simY() {
    		throw new Error("<PluginWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simY(value) {
    		throw new Error("<PluginWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simResizeX() {
    		throw new Error("<PluginWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simResizeX(value) {
    		throw new Error("<PluginWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simResizeY() {
    		throw new Error("<PluginWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simResizeY(value) {
    		throw new Error("<PluginWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDrag() {
    		throw new Error("<PluginWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDrag(value) {
    		throw new Error("<PluginWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onResize() {
    		throw new Error("<PluginWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onResize(value) {
    		throw new Error("<PluginWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDelete() {
    		throw new Error("<PluginWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDelete(value) {
    		throw new Error("<PluginWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get projectData() {
    		throw new Error("<PluginWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set projectData(value) {
    		throw new Error("<PluginWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get widgetData() {
    		throw new Error("<PluginWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set widgetData(value) {
    		throw new Error("<PluginWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get widgetID() {
    		throw new Error("<PluginWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set widgetID(value) {
    		throw new Error("<PluginWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pluginID() {
    		throw new Error("<PluginWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pluginID(value) {
    		throw new Error("<PluginWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Viewport\Viewport.svelte generated by Svelte v3.19.1 */

    const { Object: Object_1$2 } = globals;
    const file$8 = "src\\Viewport\\Viewport.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[57] = list[i];
    	child_ctx[58] = list;
    	child_ctx[59] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[57] = list[i];
    	child_ctx[60] = list;
    	child_ctx[59] = i;
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[57] = list[i];
    	child_ctx[61] = list;
    	child_ctx[59] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[57] = list[i];
    	child_ctx[62] = list;
    	child_ctx[59] = i;
    	return child_ctx;
    }

    // (435:12) {#each projectData.objects.header as object, index}
    function create_each_block_3(ctx) {
    	let updating_text;
    	let updating_sizeBounds;
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[30](/*index*/ ctx[59], /*object*/ ctx[57], ...args);
    	}

    	function func_1(...args) {
    		return /*func_1*/ ctx[31](/*index*/ ctx[59], ...args);
    	}

    	function func_2(...args) {
    		return /*func_2*/ ctx[32](/*index*/ ctx[59], ...args);
    	}

    	function header_text_binding(value) {
    		/*header_text_binding*/ ctx[33].call(null, value, /*object*/ ctx[57]);
    	}

    	function header_sizeBounds_binding(value) {
    		/*header_sizeBounds_binding*/ ctx[34].call(null, value, /*object*/ ctx[57]);
    	}

    	let header_props = {
    		onDrag: func,
    		onResize: func_1,
    		onDelete: func_2,
    		posX: /*object*/ ctx[57].posX,
    		posY: /*object*/ ctx[57].posY,
    		offX: (/*viewX*/ ctx[3] + /*mouseDrag*/ ctx[9].delta.x) / window.innerHeight * 50,
    		offY: (/*viewY*/ ctx[4] + /*mouseDrag*/ ctx[9].delta.y) / window.innerHeight * 50,
    		zoom: /*viewZoom*/ ctx[5],
    		sizeX: /*object*/ ctx[57].sizeX,
    		sizeY: /*object*/ ctx[57].sizeY,
    		simX: /*object*/ ctx[57].simX,
    		simY: /*object*/ ctx[57].simY,
    		simResizeX: /*object*/ ctx[57].simResizeX,
    		simResizeY: /*object*/ ctx[57].simResizeY
    	};

    	if (/*object*/ ctx[57].text !== void 0) {
    		header_props.text = /*object*/ ctx[57].text;
    	}

    	if (/*object*/ ctx[57].sizeBounds !== void 0) {
    		header_props.sizeBounds = /*object*/ ctx[57].sizeBounds;
    	}

    	const header = new Header({ props: header_props, $$inline: true });
    	binding_callbacks.push(() => bind(header, "text", header_text_binding));
    	binding_callbacks.push(() => bind(header, "sizeBounds", header_sizeBounds_binding));

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const header_changes = {};
    			if (dirty[0] & /*projectData*/ 1) header_changes.onDrag = func;
    			if (dirty[0] & /*projectData*/ 1) header_changes.posX = /*object*/ ctx[57].posX;
    			if (dirty[0] & /*projectData*/ 1) header_changes.posY = /*object*/ ctx[57].posY;
    			if (dirty[0] & /*viewX, mouseDrag*/ 520) header_changes.offX = (/*viewX*/ ctx[3] + /*mouseDrag*/ ctx[9].delta.x) / window.innerHeight * 50;
    			if (dirty[0] & /*viewY, mouseDrag*/ 528) header_changes.offY = (/*viewY*/ ctx[4] + /*mouseDrag*/ ctx[9].delta.y) / window.innerHeight * 50;
    			if (dirty[0] & /*viewZoom*/ 32) header_changes.zoom = /*viewZoom*/ ctx[5];
    			if (dirty[0] & /*projectData*/ 1) header_changes.sizeX = /*object*/ ctx[57].sizeX;
    			if (dirty[0] & /*projectData*/ 1) header_changes.sizeY = /*object*/ ctx[57].sizeY;
    			if (dirty[0] & /*projectData*/ 1) header_changes.simX = /*object*/ ctx[57].simX;
    			if (dirty[0] & /*projectData*/ 1) header_changes.simY = /*object*/ ctx[57].simY;
    			if (dirty[0] & /*projectData*/ 1) header_changes.simResizeX = /*object*/ ctx[57].simResizeX;
    			if (dirty[0] & /*projectData*/ 1) header_changes.simResizeY = /*object*/ ctx[57].simResizeY;

    			if (!updating_text && dirty[0] & /*projectData*/ 1) {
    				updating_text = true;
    				header_changes.text = /*object*/ ctx[57].text;
    				add_flush_callback(() => updating_text = false);
    			}

    			if (!updating_sizeBounds && dirty[0] & /*projectData*/ 1) {
    				updating_sizeBounds = true;
    				header_changes.sizeBounds = /*object*/ ctx[57].sizeBounds;
    				add_flush_callback(() => updating_sizeBounds = false);
    			}

    			header.$set(header_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(435:12) {#each projectData.objects.header as object, index}",
    		ctx
    	});

    	return block;
    }

    // (459:12) {#each projectData.objects.paragraph as object, index}
    function create_each_block_2$1(ctx) {
    	let updating_text;
    	let updating_sizeBounds;
    	let current;

    	function func_3(...args) {
    		return /*func_3*/ ctx[35](/*index*/ ctx[59], /*object*/ ctx[57], ...args);
    	}

    	function func_4(...args) {
    		return /*func_4*/ ctx[36](/*index*/ ctx[59], ...args);
    	}

    	function func_5(...args) {
    		return /*func_5*/ ctx[37](/*index*/ ctx[59], ...args);
    	}

    	function paragraph_text_binding(value) {
    		/*paragraph_text_binding*/ ctx[38].call(null, value, /*object*/ ctx[57]);
    	}

    	function paragraph_sizeBounds_binding(value) {
    		/*paragraph_sizeBounds_binding*/ ctx[39].call(null, value, /*object*/ ctx[57]);
    	}

    	let paragraph_props = {
    		onDrag: func_3,
    		onResize: func_4,
    		onDelete: func_5,
    		posX: /*object*/ ctx[57].posX,
    		posY: /*object*/ ctx[57].posY,
    		offX: (/*viewX*/ ctx[3] + /*mouseDrag*/ ctx[9].delta.x) / window.innerHeight * 50,
    		offY: (/*viewY*/ ctx[4] + /*mouseDrag*/ ctx[9].delta.y) / window.innerHeight * 50,
    		zoom: /*viewZoom*/ ctx[5],
    		sizeX: /*object*/ ctx[57].sizeX,
    		sizeY: /*object*/ ctx[57].sizeY,
    		simX: /*object*/ ctx[57].simX,
    		simY: /*object*/ ctx[57].simY,
    		simResizeX: /*object*/ ctx[57].simResizeX,
    		simResizeY: /*object*/ ctx[57].simResizeY
    	};

    	if (/*object*/ ctx[57].text !== void 0) {
    		paragraph_props.text = /*object*/ ctx[57].text;
    	}

    	if (/*object*/ ctx[57].sizeBounds !== void 0) {
    		paragraph_props.sizeBounds = /*object*/ ctx[57].sizeBounds;
    	}

    	const paragraph = new Paragraph({ props: paragraph_props, $$inline: true });
    	binding_callbacks.push(() => bind(paragraph, "text", paragraph_text_binding));
    	binding_callbacks.push(() => bind(paragraph, "sizeBounds", paragraph_sizeBounds_binding));

    	const block = {
    		c: function create() {
    			create_component(paragraph.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paragraph, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const paragraph_changes = {};
    			if (dirty[0] & /*projectData*/ 1) paragraph_changes.onDrag = func_3;
    			if (dirty[0] & /*projectData*/ 1) paragraph_changes.posX = /*object*/ ctx[57].posX;
    			if (dirty[0] & /*projectData*/ 1) paragraph_changes.posY = /*object*/ ctx[57].posY;
    			if (dirty[0] & /*viewX, mouseDrag*/ 520) paragraph_changes.offX = (/*viewX*/ ctx[3] + /*mouseDrag*/ ctx[9].delta.x) / window.innerHeight * 50;
    			if (dirty[0] & /*viewY, mouseDrag*/ 528) paragraph_changes.offY = (/*viewY*/ ctx[4] + /*mouseDrag*/ ctx[9].delta.y) / window.innerHeight * 50;
    			if (dirty[0] & /*viewZoom*/ 32) paragraph_changes.zoom = /*viewZoom*/ ctx[5];
    			if (dirty[0] & /*projectData*/ 1) paragraph_changes.sizeX = /*object*/ ctx[57].sizeX;
    			if (dirty[0] & /*projectData*/ 1) paragraph_changes.sizeY = /*object*/ ctx[57].sizeY;
    			if (dirty[0] & /*projectData*/ 1) paragraph_changes.simX = /*object*/ ctx[57].simX;
    			if (dirty[0] & /*projectData*/ 1) paragraph_changes.simY = /*object*/ ctx[57].simY;
    			if (dirty[0] & /*projectData*/ 1) paragraph_changes.simResizeX = /*object*/ ctx[57].simResizeX;
    			if (dirty[0] & /*projectData*/ 1) paragraph_changes.simResizeY = /*object*/ ctx[57].simResizeY;

    			if (!updating_text && dirty[0] & /*projectData*/ 1) {
    				updating_text = true;
    				paragraph_changes.text = /*object*/ ctx[57].text;
    				add_flush_callback(() => updating_text = false);
    			}

    			if (!updating_sizeBounds && dirty[0] & /*projectData*/ 1) {
    				updating_sizeBounds = true;
    				paragraph_changes.sizeBounds = /*object*/ ctx[57].sizeBounds;
    				add_flush_callback(() => updating_sizeBounds = false);
    			}

    			paragraph.$set(paragraph_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paragraph.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paragraph.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paragraph, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(459:12) {#each projectData.objects.paragraph as object, index}",
    		ctx
    	});

    	return block;
    }

    // (483:12) {#each projectData.objects.table as object, index}
    function create_each_block_1$2(ctx) {
    	let updating_title;
    	let updating_sizeBounds;
    	let object = /*object*/ ctx[57];
    	let updating_cellContents;
    	let updating_colNames;
    	let current;

    	function func_6(...args) {
    		return /*func_6*/ ctx[40](/*index*/ ctx[59], /*object*/ ctx[57], ...args);
    	}

    	function func_7(...args) {
    		return /*func_7*/ ctx[41](/*index*/ ctx[59], ...args);
    	}

    	function func_8(...args) {
    		return /*func_8*/ ctx[42](/*index*/ ctx[59], ...args);
    	}

    	function func_9(...args) {
    		return /*func_9*/ ctx[43](/*index*/ ctx[59], ...args);
    	}

    	function table_title_binding(value) {
    		/*table_title_binding*/ ctx[44].call(null, value, /*object*/ ctx[57]);
    	}

    	function table_sizeBounds_binding(value) {
    		/*table_sizeBounds_binding*/ ctx[45].call(null, value, /*object*/ ctx[57]);
    	}

    	const assign_table = () => /*table_binding*/ ctx[46](table, object);
    	const unassign_table = () => /*table_binding*/ ctx[46](null, object);

    	function table_cellContents_binding(value) {
    		/*table_cellContents_binding*/ ctx[47].call(null, value, /*object*/ ctx[57]);
    	}

    	function table_colNames_binding(value) {
    		/*table_colNames_binding*/ ctx[48].call(null, value, /*object*/ ctx[57]);
    	}

    	let table_props = {
    		editmode: /*edited*/ ctx[1] == /*index*/ ctx[59],
    		lockedCells: [],
    		onDrag: func_6,
    		onResize: func_7,
    		onDelete: func_8,
    		onEdit: func_9,
    		posX: /*object*/ ctx[57].posX,
    		posY: /*object*/ ctx[57].posY,
    		offX: (/*viewX*/ ctx[3] + /*mouseDrag*/ ctx[9].delta.x) / window.innerHeight * 50,
    		offY: (/*viewY*/ ctx[4] + /*mouseDrag*/ ctx[9].delta.y) / window.innerHeight * 50,
    		zoom: /*viewZoom*/ ctx[5],
    		sizeX: /*object*/ ctx[57].sizeX,
    		sizeY: /*object*/ ctx[57].sizeY,
    		simX: /*object*/ ctx[57].simX,
    		simY: /*object*/ ctx[57].simY,
    		simResizeX: /*object*/ ctx[57].simResizeX,
    		simResizeY: /*object*/ ctx[57].simResizeY,
    		onInput: /*invokeTableProcess*/ ctx[2]
    	};

    	if (/*object*/ ctx[57].title !== void 0) {
    		table_props.title = /*object*/ ctx[57].title;
    	}

    	if (/*object*/ ctx[57].sizeBounds !== void 0) {
    		table_props.sizeBounds = /*object*/ ctx[57].sizeBounds;
    	}

    	if (/*object*/ ctx[57].cellContents !== void 0) {
    		table_props.cellContents = /*object*/ ctx[57].cellContents;
    	}

    	if (/*object*/ ctx[57].colNames !== void 0) {
    		table_props.colNames = /*object*/ ctx[57].colNames;
    	}

    	const table = new Table({ props: table_props, $$inline: true });
    	binding_callbacks.push(() => bind(table, "title", table_title_binding));
    	binding_callbacks.push(() => bind(table, "sizeBounds", table_sizeBounds_binding));
    	assign_table();
    	binding_callbacks.push(() => bind(table, "cellContents", table_cellContents_binding));
    	binding_callbacks.push(() => bind(table, "colNames", table_colNames_binding));

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (object !== /*object*/ ctx[57]) {
    				unassign_table();
    				object = /*object*/ ctx[57];
    				assign_table();
    			}

    			const table_changes = {};
    			if (dirty[0] & /*edited*/ 2) table_changes.editmode = /*edited*/ ctx[1] == /*index*/ ctx[59];
    			if (dirty[0] & /*projectData*/ 1) table_changes.onDrag = func_6;
    			if (dirty[0] & /*edited*/ 2) table_changes.onDelete = func_8;
    			if (dirty[0] & /*edited*/ 2) table_changes.onEdit = func_9;
    			if (dirty[0] & /*projectData*/ 1) table_changes.posX = /*object*/ ctx[57].posX;
    			if (dirty[0] & /*projectData*/ 1) table_changes.posY = /*object*/ ctx[57].posY;
    			if (dirty[0] & /*viewX, mouseDrag*/ 520) table_changes.offX = (/*viewX*/ ctx[3] + /*mouseDrag*/ ctx[9].delta.x) / window.innerHeight * 50;
    			if (dirty[0] & /*viewY, mouseDrag*/ 528) table_changes.offY = (/*viewY*/ ctx[4] + /*mouseDrag*/ ctx[9].delta.y) / window.innerHeight * 50;
    			if (dirty[0] & /*viewZoom*/ 32) table_changes.zoom = /*viewZoom*/ ctx[5];
    			if (dirty[0] & /*projectData*/ 1) table_changes.sizeX = /*object*/ ctx[57].sizeX;
    			if (dirty[0] & /*projectData*/ 1) table_changes.sizeY = /*object*/ ctx[57].sizeY;
    			if (dirty[0] & /*projectData*/ 1) table_changes.simX = /*object*/ ctx[57].simX;
    			if (dirty[0] & /*projectData*/ 1) table_changes.simY = /*object*/ ctx[57].simY;
    			if (dirty[0] & /*projectData*/ 1) table_changes.simResizeX = /*object*/ ctx[57].simResizeX;
    			if (dirty[0] & /*projectData*/ 1) table_changes.simResizeY = /*object*/ ctx[57].simResizeY;
    			if (dirty[0] & /*invokeTableProcess*/ 4) table_changes.onInput = /*invokeTableProcess*/ ctx[2];

    			if (!updating_title && dirty[0] & /*projectData*/ 1) {
    				updating_title = true;
    				table_changes.title = /*object*/ ctx[57].title;
    				add_flush_callback(() => updating_title = false);
    			}

    			if (!updating_sizeBounds && dirty[0] & /*projectData*/ 1) {
    				updating_sizeBounds = true;
    				table_changes.sizeBounds = /*object*/ ctx[57].sizeBounds;
    				add_flush_callback(() => updating_sizeBounds = false);
    			}

    			if (!updating_cellContents && dirty[0] & /*projectData*/ 1) {
    				updating_cellContents = true;
    				table_changes.cellContents = /*object*/ ctx[57].cellContents;
    				add_flush_callback(() => updating_cellContents = false);
    			}

    			if (!updating_colNames && dirty[0] & /*projectData*/ 1) {
    				updating_colNames = true;
    				table_changes.colNames = /*object*/ ctx[57].colNames;
    				add_flush_callback(() => updating_colNames = false);
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			unassign_table();
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(483:12) {#each projectData.objects.table as object, index}",
    		ctx
    	});

    	return block;
    }

    // (518:12) {#each projectData.objects.result as object, index}
    function create_each_block$2(ctx) {
    	let updating_widgetData;
    	let updating_projectData;
    	let updating_sizeBounds;
    	let current;

    	function func_10(...args) {
    		return /*func_10*/ ctx[49](/*index*/ ctx[59], /*object*/ ctx[57], ...args);
    	}

    	function func_11(...args) {
    		return /*func_11*/ ctx[50](/*index*/ ctx[59], ...args);
    	}

    	function func_12(...args) {
    		return /*func_12*/ ctx[51](/*index*/ ctx[59], ...args);
    	}

    	function result_widgetData_binding(value) {
    		/*result_widgetData_binding*/ ctx[52].call(null, value, /*object*/ ctx[57], /*each_value*/ ctx[58], /*index*/ ctx[59]);
    	}

    	function result_projectData_binding(value) {
    		/*result_projectData_binding*/ ctx[53].call(null, value);
    	}

    	function result_sizeBounds_binding(value) {
    		/*result_sizeBounds_binding*/ ctx[54].call(null, value, /*object*/ ctx[57]);
    	}

    	let result_props = {
    		onDrag: func_10,
    		onResize: func_11,
    		onDelete: func_12,
    		posX: /*object*/ ctx[57].posX,
    		posY: /*object*/ ctx[57].posY,
    		offX: (/*viewX*/ ctx[3] + /*mouseDrag*/ ctx[9].delta.x) / window.innerHeight * 50,
    		offY: (/*viewY*/ ctx[4] + /*mouseDrag*/ ctx[9].delta.y) / window.innerHeight * 50,
    		zoom: /*viewZoom*/ ctx[5],
    		sizeX: /*object*/ ctx[57].sizeX,
    		sizeY: /*object*/ ctx[57].sizeY,
    		simX: /*object*/ ctx[57].simX,
    		simY: /*object*/ ctx[57].simY,
    		simResizeX: /*object*/ ctx[57].simResizeX,
    		simResizeY: /*object*/ ctx[57].simResizeY
    	};

    	if (/*object*/ ctx[57] !== void 0) {
    		result_props.widgetData = /*object*/ ctx[57];
    	}

    	if (/*projectData*/ ctx[0] !== void 0) {
    		result_props.projectData = /*projectData*/ ctx[0];
    	}

    	if (/*object*/ ctx[57].sizeBounds !== void 0) {
    		result_props.sizeBounds = /*object*/ ctx[57].sizeBounds;
    	}

    	const result = new Result({ props: result_props, $$inline: true });
    	binding_callbacks.push(() => bind(result, "widgetData", result_widgetData_binding));
    	binding_callbacks.push(() => bind(result, "projectData", result_projectData_binding));
    	binding_callbacks.push(() => bind(result, "sizeBounds", result_sizeBounds_binding));

    	const block = {
    		c: function create() {
    			create_component(result.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(result, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const result_changes = {};
    			if (dirty[0] & /*projectData*/ 1) result_changes.onDrag = func_10;
    			if (dirty[0] & /*projectData*/ 1) result_changes.posX = /*object*/ ctx[57].posX;
    			if (dirty[0] & /*projectData*/ 1) result_changes.posY = /*object*/ ctx[57].posY;
    			if (dirty[0] & /*viewX, mouseDrag*/ 520) result_changes.offX = (/*viewX*/ ctx[3] + /*mouseDrag*/ ctx[9].delta.x) / window.innerHeight * 50;
    			if (dirty[0] & /*viewY, mouseDrag*/ 528) result_changes.offY = (/*viewY*/ ctx[4] + /*mouseDrag*/ ctx[9].delta.y) / window.innerHeight * 50;
    			if (dirty[0] & /*viewZoom*/ 32) result_changes.zoom = /*viewZoom*/ ctx[5];
    			if (dirty[0] & /*projectData*/ 1) result_changes.sizeX = /*object*/ ctx[57].sizeX;
    			if (dirty[0] & /*projectData*/ 1) result_changes.sizeY = /*object*/ ctx[57].sizeY;
    			if (dirty[0] & /*projectData*/ 1) result_changes.simX = /*object*/ ctx[57].simX;
    			if (dirty[0] & /*projectData*/ 1) result_changes.simY = /*object*/ ctx[57].simY;
    			if (dirty[0] & /*projectData*/ 1) result_changes.simResizeX = /*object*/ ctx[57].simResizeX;
    			if (dirty[0] & /*projectData*/ 1) result_changes.simResizeY = /*object*/ ctx[57].simResizeY;

    			if (!updating_widgetData && dirty[0] & /*projectData*/ 1) {
    				updating_widgetData = true;
    				result_changes.widgetData = /*object*/ ctx[57];
    				add_flush_callback(() => updating_widgetData = false);
    			}

    			if (!updating_projectData && dirty[0] & /*projectData*/ 1) {
    				updating_projectData = true;
    				result_changes.projectData = /*projectData*/ ctx[0];
    				add_flush_callback(() => updating_projectData = false);
    			}

    			if (!updating_sizeBounds && dirty[0] & /*projectData*/ 1) {
    				updating_sizeBounds = true;
    				result_changes.sizeBounds = /*object*/ ctx[57].sizeBounds;
    				add_flush_callback(() => updating_sizeBounds = false);
    			}

    			result.$set(result_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(result.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(result.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(result, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(518:12) {#each projectData.objects.result as object, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let div1_resize_listener;
    	let current;
    	let dispose;
    	let each_value_3 = /*projectData*/ ctx[0].objects.header;
    	validate_each_argument(each_value_3);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_3[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const out = i => transition_out(each_blocks_3[i], 1, 1, () => {
    		each_blocks_3[i] = null;
    	});

    	let each_value_2 = /*projectData*/ ctx[0].objects.paragraph;
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	const out_1 = i => transition_out(each_blocks_2[i], 1, 1, () => {
    		each_blocks_2[i] = null;
    	});

    	let each_value_1 = /*projectData*/ ctx[0].objects.table;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const out_2 = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*projectData*/ ctx[0].objects.result;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out_3 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const pluginwrapper = new PluginWrapper({
    			props: {
    				posX: 0,
    				posY: 0,
    				sizeX: 8,
    				sizeY: 8,
    				simX: 0,
    				simY: 0,
    				simResizeX: 0,
    				simResizeY: 0,
    				projectData: /*projectData*/ ctx[0],
    				widgetData: { "count": 0 },
    				widgetID: "example",
    				pluginID: "std_example"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t0 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t1 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			create_component(pluginwrapper.$$.fragment);
    			attr_dev(div0, "class", "dottedBackground svelte-d3k9sp");
    			set_style(div0, "background-position-x", /*viewX*/ ctx[3] + /*mouseDrag*/ ctx[9].delta.x + "px");
    			set_style(div0, "background-position-y", /*viewY*/ ctx[4] + /*mouseDrag*/ ctx[9].delta.y + "px");
    			set_style(div0, "background-size", 2 * /*viewZoom*/ ctx[5] + "vh");
    			add_location(div0, file$8, 424, 12, 13733);
    			attr_dev(div1, "class", "frame neuIndentShadow svelte-d3k9sp");
    			add_render_callback(() => /*div1_elementresize_handler*/ ctx[56].call(div1));
    			add_location(div1, file$8, 409, 4, 13303);
    			attr_dev(main, "class", "svelte-d3k9sp");
    			add_location(main, file$8, 405, 0, 13234);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(div0, null);
    			}

    			append_dev(div0, t0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div0, null);
    			}

    			append_dev(div0, t1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div0, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div0, t3);
    			mount_component(pluginwrapper, div0, null);
    			/*div1_binding*/ ctx[55](div1);
    			div1_resize_listener = add_resize_listener(div1, /*div1_elementresize_handler*/ ctx[56].bind(div1));
    			current = true;

    			dispose = [
    				listen_dev(div1, "mousedown", /*mouseDown*/ ctx[10], false, false, false),
    				listen_dev(div1, "mousemove", /*mouseMove*/ ctx[11], false, false, false),
    				listen_dev(div1, "mouseup", /*mouseUp*/ ctx[12], false, false, false),
    				listen_dev(div1, "mouseleave", /*mouseUp*/ ctx[12], false, false, false),
    				listen_dev(div1, "mousewheel", /*scroll*/ ctx[13], false, false, false),
    				listen_dev(div1, "dragover", /*dragOver*/ ctx[16], false, false, false),
    				listen_dev(div1, "drop", /*drop*/ ctx[17], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*initObjectDrag, projectData, initObjectResize, deleteObject, viewX, mouseDrag, viewY, viewZoom*/ 311865) {
    				each_value_3 = /*projectData*/ ctx[0].objects.header;
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    						transition_in(each_blocks_3[i], 1);
    					} else {
    						each_blocks_3[i] = create_each_block_3(child_ctx);
    						each_blocks_3[i].c();
    						transition_in(each_blocks_3[i], 1);
    						each_blocks_3[i].m(div0, t0);
    					}
    				}

    				group_outros();

    				for (i = each_value_3.length; i < each_blocks_3.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*initObjectDrag, projectData, initObjectResize, deleteObject, viewX, mouseDrag, viewY, viewZoom*/ 311865) {
    				each_value_2 = /*projectData*/ ctx[0].objects.paragraph;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    						transition_in(each_blocks_2[i], 1);
    					} else {
    						each_blocks_2[i] = create_each_block_2$1(child_ctx);
    						each_blocks_2[i].c();
    						transition_in(each_blocks_2[i], 1);
    						each_blocks_2[i].m(div0, t1);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks_2.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*edited, initObjectDrag, projectData, initObjectResize, deleteObject, viewX, mouseDrag, viewY, viewZoom, invokeTableProcess*/ 311871) {
    				each_value_1 = /*projectData*/ ctx[0].objects.table;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1$2(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div0, t2);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out_2(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*initObjectDrag, projectData, initObjectResize, deleteObject, viewX, mouseDrag, viewY, viewZoom*/ 311865) {
    				each_value = /*projectData*/ ctx[0].objects.result;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, t3);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_3(i);
    				}

    				check_outros();
    			}

    			const pluginwrapper_changes = {};
    			if (dirty[0] & /*projectData*/ 1) pluginwrapper_changes.projectData = /*projectData*/ ctx[0];
    			pluginwrapper.$set(pluginwrapper_changes);

    			if (!current || dirty[0] & /*viewX, mouseDrag*/ 520) {
    				set_style(div0, "background-position-x", /*viewX*/ ctx[3] + /*mouseDrag*/ ctx[9].delta.x + "px");
    			}

    			if (!current || dirty[0] & /*viewY, mouseDrag*/ 528) {
    				set_style(div0, "background-position-y", /*viewY*/ ctx[4] + /*mouseDrag*/ ctx[9].delta.y + "px");
    			}

    			if (!current || dirty[0] & /*viewZoom*/ 32) {
    				set_style(div0, "background-size", 2 * /*viewZoom*/ ctx[5] + "vh");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_3.length; i += 1) {
    				transition_in(each_blocks_3[i]);
    			}

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_2[i]);
    			}

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(pluginwrapper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_3 = each_blocks_3.filter(Boolean);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				transition_out(each_blocks_3[i]);
    			}

    			each_blocks_2 = each_blocks_2.filter(Boolean);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				transition_out(each_blocks_2[i]);
    			}

    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(pluginwrapper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks_3, detaching);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			destroy_component(pluginwrapper);
    			/*div1_binding*/ ctx[55](null);
    			div1_resize_listener.cancel();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { debObjectDrag } = $$props, { debObjectResize } = $$props;
    	let viewX = 0, viewY = 0, viewZoom = 1;
    	const zoomBounds = [0.3, 5];
    	let viewportHeight, viewportWidth;
    	let viewportRef;
    	let { projectData } = $$props;
    	let { userSettings } = $$props;

    	const objectPrototypes = {
    		"header": {
    			"text": "Lorem",
    			"posX": 0,
    			"posY": 0,
    			"sizeX": 10,
    			"sizeY": 3,
    			"simX": 0,
    			"simY": 0,
    			"simResizeX": 0,
    			"simResizeY": 0,
    			"sizeBounds": []
    		},
    		"paragraph": {
    			"text": "Lorem ipsum",
    			"posX": 0,
    			"posY": 0,
    			"sizeX": 8,
    			"sizeY": 8,
    			"simX": 0,
    			"simY": 0,
    			"simResizeX": 0,
    			"simResizeY": 0,
    			"sizeBounds": []
    		},
    		"table": {
    			"title": "New Table",
    			"nodes": {
    				"input": [],
    				"output": [],
    				"literal": [],
    				"operator": [],
    				"annotation": [],
    				"result": []
    			},
    			"reference": undefined,
    			"cellContents": undefined,
    			"colNames": undefined,
    			"posX": 0,
    			"posY": 0,
    			"sizeX": 28,
    			"sizeY": 21,
    			"simX": 0,
    			"simY": 0,
    			"simResizeX": 0,
    			"simResizeY": 0,
    			"sizeBounds": []
    		},
    		"result": {
    			"title": "Result",
    			"value": undefined,
    			"posX": 0,
    			"posY": 0,
    			"sizeX": 10,
    			"sizeY": 3,
    			"simX": 0,
    			"simY": 0,
    			"simResizeX": 0,
    			"simResizeY": 0,
    			"sizeBounds": []
    		}
    	};

    	// MOUSE
    	//#region mouse
    	let mouseDrag = {
    		"ongoing": false,
    		"start": { "x": 0, "y": 0 },
    		"delta": { "x": 0, "y": 0 }
    	};

    	function mouseDown(event) {
    		if (userSettings.preferred_navigation_mb !== 3 && event.button != userSettings.preferred_navigation_mb) return;
    		$$invalidate(9, mouseDrag.ongoing = true, mouseDrag);
    		$$invalidate(9, mouseDrag.start.x = event.clientX, mouseDrag);
    		$$invalidate(9, mouseDrag.start.y = event.clientY, mouseDrag);
    	}

    	function mouseMove(event) {
    		if (!mouseDrag.ongoing) return;
    		$$invalidate(9, mouseDrag.delta.x = event.clientX - mouseDrag.start.x, mouseDrag);
    		$$invalidate(9, mouseDrag.delta.y = event.clientY - mouseDrag.start.y, mouseDrag);
    	}

    	function mouseUp(event) {
    		clearObjectDrag();
    		clearObjectResize();
    		if (!mouseDrag.ongoing || event.button != userSettings.preferred_navigation_mb && userSettings.preferred_navigation_mb !== 3) return;
    		$$invalidate(9, mouseDrag.ongoing = false, mouseDrag);
    		$$invalidate(3, viewX += mouseDrag.delta.x);
    		$$invalidate(4, viewY += mouseDrag.delta.y);
    		$$invalidate(9, mouseDrag.delta = { "x": 0, "y": 0 }, mouseDrag);
    	}

    	function scroll(event) {
    		let oldZoom = viewZoom;
    		$$invalidate(5, viewZoom -= event.deltaY / 1000);
    		$$invalidate(5, viewZoom = Math.max(zoomBounds[0], Math.min(viewZoom, zoomBounds[1])));

    		if (viewZoom == zoomBounds[0] || viewZoom == zoomBounds[1]) {
    			$$invalidate(5, viewZoom = oldZoom);
    			return;
    		}

    		$$invalidate(3, viewX = (viewX - viewportWidth / 2) * viewZoom / oldZoom + viewportWidth / 2 + (event.clientX - viewportRef.offsetLeft - viewportWidth / 2) * Math.sign(event.deltaY) / oldZoom / 10);
    		$$invalidate(4, viewY = (viewY - viewportHeight / 2) * viewZoom / oldZoom + viewportHeight / 2 + (event.clientY - viewportRef.offsetTop - viewportHeight / 2) * Math.sign(event.deltaY) / oldZoom / 10);
    	}

    	//#endregion
    	// DRAG AND DROP
    	//#region dragAndDrop
    	let objectDrag = {
    		"ongoing": false,
    		"start": { "x": 0, "y": 0 },
    		"delta": { "x": 0, "y": 0 },
    		"layer": { "x": 0, "y": 0 },
    		"objectInfo": {
    			"type": "",
    			"ID": 0,
    			"width": 0,
    			"height": 0
    		}
    	};

    	function clearObjectDrag() {
    		$$invalidate(24, objectDrag = {
    			"ongoing": false,
    			"start": { "x": 0, "y": 0 },
    			"delta": { "x": 0, "y": 0 },
    			"layer": { "x": 0, "y": 0 },
    			"objectInfo": {
    				"type": "",
    				"ID": 0,
    				"width": 0,
    				"height": 0
    			}
    		});
    	}

    	let objectResize = {
    		"ongoing": false,
    		"start": { "x": 0, "y": 0 },
    		"delta": { "x": 0, "y": 0 },
    		"objectInfo": { "type": "", "ID": 0 }
    	};

    	function clearObjectResize() {
    		$$invalidate(25, objectResize = {
    			"ongoing": false,
    			"start": { "x": 0, "y": 0 },
    			"delta": { "x": 0, "y": 0 },
    			"objectInfo": { "type": "", "ID": 0 }
    		});
    	}

    	function initObjectDrag(event, type, index, width, height) {
    		clearObjectDrag();
    		clearObjectResize();

    		// Override default drag image
    		let imageOverride = document.createElement("img");

    		event.dataTransfer.setDragImage(imageOverride, 0, 0);

    		// Append necessary info
    		event.dataTransfer.setData("command", "move");

    		event.dataTransfer.setData("objectID", index);
    		event.dataTransfer.setData("objectType", type);
    		event.dataTransfer.setData("startX", event.clientX);
    		event.dataTransfer.setData("startY", event.clientY);

    		// Update objectDrag
    		$$invalidate(24, objectDrag.ongoing = true, objectDrag);

    		$$invalidate(24, objectDrag.start.x = event.clientX, objectDrag);
    		$$invalidate(24, objectDrag.start.y = event.clientY, objectDrag);
    		$$invalidate(24, objectDrag.objectInfo.type = type, objectDrag);
    		$$invalidate(24, objectDrag.objectInfo.ID = index, objectDrag);
    		$$invalidate(24, objectDrag.objectInfo.width = width, objectDrag);
    		$$invalidate(24, objectDrag.objectInfo.height = height, objectDrag);
    	}

    	function initObjectResize(event, type, index) {
    		clearObjectDrag();
    		clearObjectResize();

    		// Override default drag image
    		let imageOverride = document.createElement("img");

    		event.dataTransfer.setDragImage(imageOverride, 0, 0);
    		event.dataTransfer.setData("command", "resize");
    		event.dataTransfer.setData("objectType", type);
    		event.dataTransfer.setData("objectID", index);
    		$$invalidate(25, objectResize.start.x = event.clientX, objectResize);
    		$$invalidate(25, objectResize.start.y = event.clientY, objectResize);
    		$$invalidate(25, objectResize.objectInfo.type = type, objectResize);
    		$$invalidate(25, objectResize.objectInfo.ID = index, objectResize);
    		$$invalidate(25, objectResize.ongoing = true, objectResize);
    	}

    	function dragOver(event) {
    		event.preventDefault();
    		let vhConverter = window.innerHeight / 100 * 2 * viewZoom;

    		if (objectDrag.ongoing) {
    			// Update objectDrag
    			$$invalidate(24, objectDrag.delta.x = Math.round((event.clientX - objectDrag.start.x) / vhConverter), objectDrag);

    			$$invalidate(24, objectDrag.delta.y = Math.round((event.clientY - objectDrag.start.y) / vhConverter), objectDrag);
    			$$invalidate(24, objectDrag.layer.x = event.layerX, objectDrag);
    			$$invalidate(24, objectDrag.layer.y = event.layerY, objectDrag);
    			$$invalidate(0, projectData.objects[objectDrag.objectInfo.type][objectDrag.objectInfo.ID].simX = objectDrag.delta.x, projectData);
    			$$invalidate(0, projectData.objects[objectDrag.objectInfo.type][objectDrag.objectInfo.ID].simY = objectDrag.delta.y, projectData);
    		}

    		if (objectResize.ongoing) {
    			// Update objectResize
    			$$invalidate(25, objectResize.delta.x = Math.round((event.clientX - objectResize.start.x) / vhConverter), objectResize);

    			$$invalidate(25, objectResize.delta.y = Math.round((event.clientY - objectResize.start.y) / vhConverter), objectResize);
    			$$invalidate(0, projectData.objects[objectResize.objectInfo.type][objectResize.objectInfo.ID].simResizeX = objectResize.delta.x, projectData);
    			$$invalidate(0, projectData.objects[objectResize.objectInfo.type][objectResize.objectInfo.ID].simResizeY = objectResize.delta.y, projectData);
    		}
    	}

    	function drop(event) {
    		event.preventDefault();

    		switch (event.dataTransfer.getData("command")) {
    			case "move":
    				$$invalidate(0, projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].posX += Math.round((event.clientX - event.dataTransfer.getData("startX")) / (window.innerHeight / 100 * 2 * viewZoom)), projectData);
    				$$invalidate(0, projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].posY += Math.round((event.clientY - event.dataTransfer.getData("startY")) / (window.innerHeight / 100 * 2 * viewZoom)), projectData);
    				$$invalidate(0, projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].simX = 0, projectData);
    				$$invalidate(0, projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].simY = 0, projectData);
    				$$invalidate(24, objectDrag.ongoing = false, objectDrag);
    				break;
    			case "resize":
    				$$invalidate(25, objectResize.ongoing = false, objectResize);
    				let sizeX = projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].sizeX;
    				let sizeY = projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].sizeY;
    				let sizeBounds = projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].sizeBounds;
    				$$invalidate(0, projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].sizeX = Math.max(sizeBounds[0][0], Math.min(sizeX + objectResize.delta.x, sizeBounds[0][1])), projectData);
    				$$invalidate(0, projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].sizeY = Math.max(sizeBounds[1][0], Math.min(sizeY + objectResize.delta.y, sizeBounds[1][1])), projectData);
    				$$invalidate(0, projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].simResizeX = 0, projectData);
    				$$invalidate(0, projectData.objects[event.dataTransfer.getData("objectType")][event.dataTransfer.getData("objectID")].simResizeY = 0, projectData);
    				break;
    			case "create":
    				let type = event.dataTransfer.getData("objectType");
    				let instanceIndex = projectData.objects[type].length;
    				projectData.objects[type].push(//Object.assign({}, objectPrototypes[type])
    				JSON.parse(JSON.stringify(objectPrototypes[type])));
    				$$invalidate(0, projectData.objects[type][instanceIndex].posX = Math.round((-viewX + event.layerX) / (window.innerHeight / 100 * 2 * viewZoom) - projectData.objects[type][instanceIndex].sizeX / 2), projectData);
    				$$invalidate(0, projectData.objects[type][instanceIndex].posY = Math.round((-viewY + event.layerY) / (window.innerHeight / 100 * 2 * viewZoom) - projectData.objects[type][instanceIndex].sizeY / 2), projectData);
    				break;
    		}

    		clearObjectDrag();
    		clearObjectResize();
    	}

    	function deleteObject(type, index) {
    		projectData.objects[type].splice(index, 1);
    		$$invalidate(0, projectData.objects[type] = Object.assign([], projectData.objects[type]), projectData);
    	}

    	let { edited = null } = $$props; // null when outside of editmode,

    	function centerView() {
    		$$invalidate(3, viewX = 0);
    		$$invalidate(4, viewY = 0);
    	}

    	function resetZoom() {
    		$$invalidate(5, viewZoom = 1);
    	}

    	let { invokeTableProcess } = $$props;

    	const writable_props = [
    		"debObjectDrag",
    		"debObjectResize",
    		"projectData",
    		"userSettings",
    		"edited",
    		"invokeTableProcess"
    	];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Viewport> was created with unknown prop '${key}'`);
    	});

    	const func = (index, object, event) => {
    		initObjectDrag(event, "header", index, object.sizeX, object.sizeY);
    	};

    	const func_1 = (index, event) => {
    		initObjectResize(event, "header", index);
    	};

    	const func_2 = index => {
    		deleteObject("header", index);
    	};

    	function header_text_binding(value, object) {
    		object.text = value;
    		$$invalidate(0, projectData);
    	}

    	function header_sizeBounds_binding(value, object) {
    		object.sizeBounds = value;
    		$$invalidate(0, projectData);
    	}

    	const func_3 = (index, object, event) => {
    		initObjectDrag(event, "paragraph", index, object.sizeX, object.sizeY);
    	};

    	const func_4 = (index, event) => {
    		initObjectResize(event, "paragraph", index);
    	};

    	const func_5 = index => {
    		deleteObject("paragraph", index);
    	};

    	function paragraph_text_binding(value, object) {
    		object.text = value;
    		$$invalidate(0, projectData);
    	}

    	function paragraph_sizeBounds_binding(value, object) {
    		object.sizeBounds = value;
    		$$invalidate(0, projectData);
    	}

    	const func_6 = (index, object, event) => {
    		initObjectDrag(event, "table", index, object.sizeX, object.sizeY);
    	};

    	const func_7 = (index, event) => {
    		initObjectResize(event, "table", index);
    	};

    	const func_8 = index => {
    		deleteObject("table", index);
    		if (edited == index) $$invalidate(1, edited = null);
    	};

    	const func_9 = index => {
    		$$invalidate(1, edited = edited == null ? index : null);
    	};

    	function table_title_binding(value, object) {
    		object.title = value;
    		$$invalidate(0, projectData);
    	}

    	function table_sizeBounds_binding(value, object) {
    		object.sizeBounds = value;
    		$$invalidate(0, projectData);
    	}

    	function table_binding($$value, object) {
    		if (object.reference === $$value) return;

    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			object.reference = $$value;
    			$$invalidate(57, object);
    		});
    	}

    	function table_cellContents_binding(value, object) {
    		object.cellContents = value;
    		$$invalidate(0, projectData);
    	}

    	function table_colNames_binding(value, object) {
    		object.colNames = value;
    		$$invalidate(0, projectData);
    	}

    	const func_10 = (index, object, event) => {
    		initObjectDrag(event, "result", index, object.sizeX, object.sizeY);
    	};

    	const func_11 = (index, event) => {
    		initObjectResize(event, "result", index);
    	};

    	const func_12 = index => {
    		deleteObject("result", index);
    	};

    	function result_widgetData_binding(value, object, each_value, index) {
    		each_value[index] = value;
    		$$invalidate(0, projectData);
    	}

    	function result_projectData_binding(value) {
    		projectData = value;
    		$$invalidate(0, projectData);
    	}

    	function result_sizeBounds_binding(value, object) {
    		object.sizeBounds = value;
    		$$invalidate(0, projectData);
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(8, viewportRef = $$value);
    		});
    	}

    	function div1_elementresize_handler() {
    		viewportHeight = this.offsetHeight;
    		viewportWidth = this.offsetWidth;
    		$$invalidate(6, viewportHeight);
    		$$invalidate(7, viewportWidth);
    	}

    	$$self.$set = $$props => {
    		if ("debObjectDrag" in $$props) $$invalidate(19, debObjectDrag = $$props.debObjectDrag);
    		if ("debObjectResize" in $$props) $$invalidate(20, debObjectResize = $$props.debObjectResize);
    		if ("projectData" in $$props) $$invalidate(0, projectData = $$props.projectData);
    		if ("userSettings" in $$props) $$invalidate(21, userSettings = $$props.userSettings);
    		if ("edited" in $$props) $$invalidate(1, edited = $$props.edited);
    		if ("invokeTableProcess" in $$props) $$invalidate(2, invokeTableProcess = $$props.invokeTableProcess);
    	};

    	$$self.$capture_state = () => ({
    		Header,
    		Paragraph,
    		Result,
    		Table,
    		PluginWrapper,
    		debObjectDrag,
    		debObjectResize,
    		viewX,
    		viewY,
    		viewZoom,
    		zoomBounds,
    		viewportHeight,
    		viewportWidth,
    		viewportRef,
    		projectData,
    		userSettings,
    		objectPrototypes,
    		mouseDrag,
    		mouseDown,
    		mouseMove,
    		mouseUp,
    		scroll,
    		objectDrag,
    		clearObjectDrag,
    		objectResize,
    		clearObjectResize,
    		initObjectDrag,
    		initObjectResize,
    		dragOver,
    		drop,
    		deleteObject,
    		edited,
    		centerView,
    		resetZoom,
    		invokeTableProcess,
    		undefined,
    		Math,
    		document,
    		window,
    		JSON,
    		Object
    	});

    	$$self.$inject_state = $$props => {
    		if ("debObjectDrag" in $$props) $$invalidate(19, debObjectDrag = $$props.debObjectDrag);
    		if ("debObjectResize" in $$props) $$invalidate(20, debObjectResize = $$props.debObjectResize);
    		if ("viewX" in $$props) $$invalidate(3, viewX = $$props.viewX);
    		if ("viewY" in $$props) $$invalidate(4, viewY = $$props.viewY);
    		if ("viewZoom" in $$props) $$invalidate(5, viewZoom = $$props.viewZoom);
    		if ("viewportHeight" in $$props) $$invalidate(6, viewportHeight = $$props.viewportHeight);
    		if ("viewportWidth" in $$props) $$invalidate(7, viewportWidth = $$props.viewportWidth);
    		if ("viewportRef" in $$props) $$invalidate(8, viewportRef = $$props.viewportRef);
    		if ("projectData" in $$props) $$invalidate(0, projectData = $$props.projectData);
    		if ("userSettings" in $$props) $$invalidate(21, userSettings = $$props.userSettings);
    		if ("mouseDrag" in $$props) $$invalidate(9, mouseDrag = $$props.mouseDrag);
    		if ("objectDrag" in $$props) $$invalidate(24, objectDrag = $$props.objectDrag);
    		if ("objectResize" in $$props) $$invalidate(25, objectResize = $$props.objectResize);
    		if ("edited" in $$props) $$invalidate(1, edited = $$props.edited);
    		if ("invokeTableProcess" in $$props) $$invalidate(2, invokeTableProcess = $$props.invokeTableProcess);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*objectDrag*/ 16777216) {
    			 $$invalidate(19, debObjectDrag = [
    				objectDrag.ongoing,
    				objectDrag.start.x,
    				objectDrag.start.y,
    				objectDrag.delta.x,
    				objectDrag.delta.y,
    				objectDrag.layer.x,
    				objectDrag.layer.y,
    				objectDrag.objectInfo.ID,
    				objectDrag.objectInfo.type
    			]);
    		}

    		if ($$self.$$.dirty[0] & /*objectResize*/ 33554432) {
    			 $$invalidate(20, debObjectResize = [
    				objectResize.ongoing,
    				objectResize.start.x,
    				objectResize.start.y,
    				objectResize.delta.x,
    				objectResize.delta.y,
    				objectResize.objectInfo.ID,
    				objectResize.objectInfo.type
    			]);
    		}
    	};

    	return [
    		projectData,
    		edited,
    		invokeTableProcess,
    		viewX,
    		viewY,
    		viewZoom,
    		viewportHeight,
    		viewportWidth,
    		viewportRef,
    		mouseDrag,
    		mouseDown,
    		mouseMove,
    		mouseUp,
    		scroll,
    		initObjectDrag,
    		initObjectResize,
    		dragOver,
    		drop,
    		deleteObject,
    		debObjectDrag,
    		debObjectResize,
    		userSettings,
    		centerView,
    		resetZoom,
    		objectDrag,
    		objectResize,
    		zoomBounds,
    		objectPrototypes,
    		clearObjectDrag,
    		clearObjectResize,
    		func,
    		func_1,
    		func_2,
    		header_text_binding,
    		header_sizeBounds_binding,
    		func_3,
    		func_4,
    		func_5,
    		paragraph_text_binding,
    		paragraph_sizeBounds_binding,
    		func_6,
    		func_7,
    		func_8,
    		func_9,
    		table_title_binding,
    		table_sizeBounds_binding,
    		table_binding,
    		table_cellContents_binding,
    		table_colNames_binding,
    		func_10,
    		func_11,
    		func_12,
    		result_widgetData_binding,
    		result_projectData_binding,
    		result_sizeBounds_binding,
    		div1_binding,
    		div1_elementresize_handler
    	];
    }

    class Viewport extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$8,
    			create_fragment$8,
    			safe_not_equal,
    			{
    				debObjectDrag: 19,
    				debObjectResize: 20,
    				projectData: 0,
    				userSettings: 21,
    				edited: 1,
    				centerView: 22,
    				resetZoom: 23,
    				invokeTableProcess: 2
    			},
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Viewport",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*debObjectDrag*/ ctx[19] === undefined && !("debObjectDrag" in props)) {
    			console.warn("<Viewport> was created without expected prop 'debObjectDrag'");
    		}

    		if (/*debObjectResize*/ ctx[20] === undefined && !("debObjectResize" in props)) {
    			console.warn("<Viewport> was created without expected prop 'debObjectResize'");
    		}

    		if (/*projectData*/ ctx[0] === undefined && !("projectData" in props)) {
    			console.warn("<Viewport> was created without expected prop 'projectData'");
    		}

    		if (/*userSettings*/ ctx[21] === undefined && !("userSettings" in props)) {
    			console.warn("<Viewport> was created without expected prop 'userSettings'");
    		}

    		if (/*invokeTableProcess*/ ctx[2] === undefined && !("invokeTableProcess" in props)) {
    			console.warn("<Viewport> was created without expected prop 'invokeTableProcess'");
    		}
    	}

    	get debObjectDrag() {
    		throw new Error("<Viewport>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set debObjectDrag(value) {
    		throw new Error("<Viewport>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get debObjectResize() {
    		throw new Error("<Viewport>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set debObjectResize(value) {
    		throw new Error("<Viewport>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get projectData() {
    		throw new Error("<Viewport>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set projectData(value) {
    		throw new Error("<Viewport>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get userSettings() {
    		throw new Error("<Viewport>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set userSettings(value) {
    		throw new Error("<Viewport>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get edited() {
    		throw new Error("<Viewport>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set edited(value) {
    		throw new Error("<Viewport>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centerView() {
    		return this.$$.ctx[22];
    	}

    	set centerView(value) {
    		throw new Error("<Viewport>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get resetZoom() {
    		return this.$$.ctx[23];
    	}

    	set resetZoom(value) {
    		throw new Error("<Viewport>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get invokeTableProcess() {
    		throw new Error("<Viewport>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set invokeTableProcess(value) {
    		throw new Error("<Viewport>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\NodeEditor\Node.svelte generated by Svelte v3.19.1 */

    const { console: console_1$1 } = globals;
    const file$9 = "src\\NodeEditor\\Node.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	child_ctx[30] = i;
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	child_ctx[30] = i;
    	return child_ctx;
    }

    // (106:0) {#if nodeObject !== null && nodeObject !== undefined && renderReady && !error}
    function create_if_block_1$2(ctx) {
    	let main;
    	let div0;
    	let h1;
    	let t0_value = /*nodeObject*/ ctx[1].title + "";
    	let t0;
    	let t1;
    	let div3;
    	let div1;
    	let t2;
    	let div2;
    	let t3;
    	let div4;
    	let svg;
    	let path_1;
    	let dispose;
    	let each_value_1 = /*nodeObject*/ ctx[1].inputs;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	let each_value = /*nodeObject*/ ctx[1].outputs;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			div3 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			div4 = element("div");
    			svg = svg_element("svg");
    			path_1 = svg_element("path");
    			set_style(h1, "font-size", 1.5 * /*zoom*/ ctx[8] + "vh");
    			set_style(h1, "margin-left", /*zoom*/ ctx[8] + "vh");
    			attr_dev(h1, "class", "svelte-g48peo");
    			add_location(h1, file$9, 133, 12, 3769);
    			attr_dev(div0, "class", "titleBar svelte-g48peo");
    			attr_dev(div0, "draggable", "true");
    			set_style(div0, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(div0, "background-color", /*nodeData*/ ctx[0].color);
    			add_location(div0, file$9, 115, 8, 3264);
    			set_style(div1, "padding-top", 0.5 * /*zoom*/ ctx[8] + "vh");
    			attr_dev(div1, "class", "inputs svelte-g48peo");
    			add_location(div1, file$9, 139, 12, 3963);
    			set_style(div2, "padding-top", 0.5 * /*zoom*/ ctx[8] + "vh");
    			attr_dev(div2, "class", "outputs svelte-g48peo");
    			add_location(div2, file$9, 165, 12, 5308);
    			attr_dev(div3, "class", "contents svelte-g48peo");
    			add_location(div3, file$9, 138, 8, 3927);
    			attr_dev(path_1, "d", "M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z");
    			add_location(path_1, file$9, 214, 242, 7705);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 448 512");
    			attr_dev(svg, "class", "svelte-g48peo");
    			add_location(svg, file$9, 214, 12, 7475);
    			attr_dev(div4, "class", "deleteAction svelte-g48peo");
    			set_style(div4, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(div4, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			add_location(div4, file$9, 205, 8, 7252);
    			attr_dev(main, "class", "neuOutdentShadowRim svelte-g48peo");
    			set_style(main, "left", ((/*posX*/ ctx[2] + /*simX*/ ctx[6]) * /*zoom*/ ctx[8] + /*offX*/ ctx[4]) * 2 + "vh");
    			set_style(main, "top", ((/*posY*/ ctx[3] + /*simY*/ ctx[7]) * /*zoom*/ ctx[8] + /*offY*/ ctx[5]) * 2 + "vh");
    			set_style(main, "width", 2 * /*nodeData*/ ctx[0].width * /*zoom*/ ctx[8] + "vh");
    			set_style(main, "height", /*zoom*/ ctx[8] * 4 + 3 * /*zoom*/ ctx[8] * Math.max(/*nodeObject*/ ctx[1].inputs.length, /*nodeObject*/ ctx[1].outputs.length) + "vh");
    			set_style(main, "border-radius", /*zoom*/ ctx[8] + "vh");
    			add_location(main, file$9, 106, 4, 2854);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(main, t1);
    			append_dev(main, div3);
    			append_dev(div3, div1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append_dev(div3, t2);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(main, t3);
    			append_dev(main, div4);
    			append_dev(div4, svg);
    			append_dev(svg, path_1);

    			dispose = [
    				listen_dev(div0, "dragstart", /*drag*/ ctx[17], false, false, false),
    				listen_dev(div0, "dragend", /*dragend_handler*/ ctx[24], false, false, false),
    				listen_dev(div4, "click", /*handleDelete*/ ctx[18], false, false, false),
    				listen_dev(main, "mousedown", mousedown_handler$5, false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*nodeObject*/ 2 && t0_value !== (t0_value = /*nodeObject*/ ctx[1].title + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(h1, "font-size", 1.5 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(h1, "margin-left", /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(div0, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*nodeData*/ 1) {
    				set_style(div0, "background-color", /*nodeData*/ ctx[0].color);
    			}

    			if (dirty[0] & /*zoom, handleConnect, nodeData, nodeObject*/ 65795) {
    				each_value_1 = /*nodeObject*/ ctx[1].inputs;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$3(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(div1, "padding-top", 0.5 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*zoom, initConnectionDrag, nodeObject, onInitConnect, nodeData, clearDrag, onConnectDrop, dragState*/ 59139) {
    				each_value = /*nodeObject*/ ctx[1].outputs;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(div2, "padding-top", 0.5 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(div4, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(div4, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*posX, simX, zoom, offX*/ 340) {
    				set_style(main, "left", ((/*posX*/ ctx[2] + /*simX*/ ctx[6]) * /*zoom*/ ctx[8] + /*offX*/ ctx[4]) * 2 + "vh");
    			}

    			if (dirty[0] & /*posY, simY, zoom, offY*/ 424) {
    				set_style(main, "top", ((/*posY*/ ctx[3] + /*simY*/ ctx[7]) * /*zoom*/ ctx[8] + /*offY*/ ctx[5]) * 2 + "vh");
    			}

    			if (dirty[0] & /*nodeData, zoom*/ 257) {
    				set_style(main, "width", 2 * /*nodeData*/ ctx[0].width * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*zoom, nodeObject*/ 258) {
    				set_style(main, "height", /*zoom*/ ctx[8] * 4 + 3 * /*zoom*/ ctx[8] * Math.max(/*nodeObject*/ ctx[1].inputs.length, /*nodeObject*/ ctx[1].outputs.length) + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(main, "border-radius", /*zoom*/ ctx[8] + "vh");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(106:0) {#if nodeObject !== null && nodeObject !== undefined && renderReady && !error}",
    		ctx
    	});

    	return block;
    }

    // (141:16) {#each nodeObject.inputs as input, index}
    function create_each_block_1$3(ctx) {
    	let div2;
    	let div0;
    	let svg;
    	let rect0;
    	let rect1;
    	let rect1_fill_value;
    	let t0;
    	let div1;
    	let p;
    	let t1_value = /*input*/ ctx[31].label + "";
    	let t1;
    	let t2;
    	let dispose;

    	function drop_handler(...args) {
    		return /*drop_handler*/ ctx[25](/*index*/ ctx[30], ...args);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			svg = svg_element("svg");
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(rect0, "x", "2.5");
    			attr_dev(rect0, "y", "2.5");
    			attr_dev(rect0, "width", "10");
    			attr_dev(rect0, "height", "10");
    			attr_dev(rect0, "rx", "5");
    			attr_dev(rect0, "stroke", "#999999");
    			attr_dev(rect0, "stroke-dasharray", "2 2");
    			add_location(rect0, file$9, 150, 32, 4651);
    			attr_dev(rect1, "x", "5");
    			attr_dev(rect1, "y", "5");
    			attr_dev(rect1, "width", "5");
    			attr_dev(rect1, "height", "5");
    			attr_dev(rect1, "rx", "2.5");
    			attr_dev(rect1, "fill", rect1_fill_value = /*nodeData*/ ctx[0].color);
    			add_location(rect1, file$9, 151, 32, 4778);
    			set_style(svg, "width", 2 * /*zoom*/ ctx[8] + "vh");
    			set_style(svg, "height", 2 * /*zoom*/ ctx[8] + "vh");
    			attr_dev(svg, "viewBox", "0 0 15 15");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$9, 149, 28, 4498);
    			set_style(div0, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			attr_dev(div0, "class", "inputTetherCircleContainer svelte-g48peo");
    			add_location(div0, file$9, 148, 24, 4401);
    			set_style(p, "font-size", /*zoom*/ ctx[8] + "vh");
    			set_style(p, "color", /*nodeData*/ ctx[0].color);
    			attr_dev(p, "class", "svelte-g48peo");
    			add_location(p, file$9, 155, 28, 5014);
    			attr_dev(div1, "class", "inputTetherLabelContainer svelte-g48peo");
    			add_location(div1, file$9, 154, 24, 4945);
    			set_style(div2, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			attr_dev(div2, "class", "inputTether svelte-g48peo");
    			add_location(div2, file$9, 141, 20, 4098);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, svg);
    			append_dev(svg, rect0);
    			append_dev(svg, rect1);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(p, t1);
    			append_dev(div2, t2);

    			dispose = [
    				listen_dev(div2, "dragover", dragOver, false, false, false),
    				listen_dev(div2, "drop", drop_handler, false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*nodeData*/ 1 && rect1_fill_value !== (rect1_fill_value = /*nodeData*/ ctx[0].color)) {
    				attr_dev(rect1, "fill", rect1_fill_value);
    			}

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(svg, "width", 2 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(svg, "height", 2 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(div0, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*nodeObject*/ 2 && t1_value !== (t1_value = /*input*/ ctx[31].label + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(p, "font-size", /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*nodeData*/ 1) {
    				set_style(p, "color", /*nodeData*/ ctx[0].color);
    			}

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(div2, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(141:16) {#each nodeObject.inputs as input, index}",
    		ctx
    	});

    	return block;
    }

    // (167:16) {#each nodeObject.outputs as output, index}
    function create_each_block$3(ctx) {
    	let div2;
    	let div0;
    	let svg;
    	let rect0;
    	let rect1;
    	let rect1_fill_value;
    	let svg_style_value;
    	let t0;
    	let div1;
    	let p;
    	let t1_value = /*output*/ ctx[28].label + "";
    	let t1;
    	let t2;
    	let dispose;

    	function dragstart_handler(...args) {
    		return /*dragstart_handler*/ ctx[26](/*output*/ ctx[28], /*index*/ ctx[30], ...args);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			svg = svg_element("svg");
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(rect0, "x", "2.5");
    			attr_dev(rect0, "y", "2.5");
    			attr_dev(rect0, "width", "10");
    			attr_dev(rect0, "height", "10");
    			attr_dev(rect0, "rx", "5");
    			attr_dev(rect0, "stroke", "#999999");
    			attr_dev(rect0, "stroke-dasharray", "2 2");
    			add_location(rect0, file$9, 189, 32, 6577);
    			attr_dev(rect1, "x", "5");
    			attr_dev(rect1, "y", "5");
    			attr_dev(rect1, "width", "5");
    			attr_dev(rect1, "height", "5");
    			attr_dev(rect1, "rx", "2.5");
    			attr_dev(rect1, "fill", rect1_fill_value = /*nodeData*/ ctx[0].color);
    			add_location(rect1, file$9, 190, 32, 6704);

    			attr_dev(svg, "style", svg_style_value = "\r\n                                width: " + 2 * /*zoom*/ ctx[8] + "vh;\r\n                                height: " + 2 * /*zoom*/ ctx[8] + "vh;\r\n                                " + (/*dragState*/ ctx[13] === /*index*/ ctx[30]
    			? "transform: scale(1.5) rotate(360deg);"
    			: "") + "\r\n                                transition: transform .5s cubic-bezier(0, 0, 0, .9);\r\n                            ");

    			attr_dev(svg, "viewBox", "0 0 15 15");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$9, 183, 28, 6139);
    			set_style(div0, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			attr_dev(div0, "class", "outputTetherCircleContainer svelte-g48peo");
    			add_location(div0, file$9, 182, 24, 6041);
    			set_style(p, "font-size", /*zoom*/ ctx[8] + "vh");
    			set_style(p, "color", /*nodeData*/ ctx[0].color);
    			attr_dev(p, "class", "svelte-g48peo");
    			add_location(p, file$9, 194, 28, 6941);
    			attr_dev(div1, "class", "outputTetherLabelContainer svelte-g48peo");
    			add_location(div1, file$9, 193, 24, 6871);
    			set_style(div2, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			attr_dev(div2, "class", "outputTether svelte-g48peo");
    			attr_dev(div2, "draggable", "true");
    			add_location(div2, file$9, 167, 20, 5446);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, svg);
    			append_dev(svg, rect0);
    			append_dev(svg, rect1);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(p, t1);
    			append_dev(div2, t2);

    			dispose = [
    				listen_dev(div2, "dragstart", dragstart_handler, false, false, false),
    				listen_dev(div2, "dragend", /*dragend_handler_1*/ ctx[27], false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*nodeData*/ 1 && rect1_fill_value !== (rect1_fill_value = /*nodeData*/ ctx[0].color)) {
    				attr_dev(rect1, "fill", rect1_fill_value);
    			}

    			if (dirty[0] & /*zoom, dragState*/ 8448 && svg_style_value !== (svg_style_value = "\r\n                                width: " + 2 * /*zoom*/ ctx[8] + "vh;\r\n                                height: " + 2 * /*zoom*/ ctx[8] + "vh;\r\n                                " + (/*dragState*/ ctx[13] === /*index*/ ctx[30]
    			? "transform: scale(1.5) rotate(360deg);"
    			: "") + "\r\n                                transition: transform .5s cubic-bezier(0, 0, 0, .9);\r\n                            ")) {
    				attr_dev(svg, "style", svg_style_value);
    			}

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(div0, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*nodeObject*/ 2 && t1_value !== (t1_value = /*output*/ ctx[28].label + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(p, "font-size", /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*nodeData*/ 1) {
    				set_style(p, "color", /*nodeData*/ ctx[0].color);
    			}

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(div2, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(167:16) {#each nodeObject.outputs as output, index}",
    		ctx
    	});

    	return block;
    }

    // (220:0) {#if error}
    function create_if_block$2(ctx) {
    	let main;
    	let div0;
    	let svg0;
    	let path0;
    	let t0;
    	let h1;
    	let t1;
    	let t2;
    	let div1;
    	let p;
    	let t3;
    	let t4;
    	let div2;
    	let svg1;
    	let path1;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t0 = space();
    			h1 = element("h1");
    			t1 = text("Error");
    			t2 = space();
    			div1 = element("div");
    			p = element("p");
    			t3 = text("Node resource could not be located.");
    			t4 = space();
    			div2 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z");
    			add_location(path0, file$9, 242, 235, 8882);
    			set_style(svg0, "height", 1.5 * /*zoom*/ ctx[8] + "vh");
    			set_style(svg0, "margin-left", /*zoom*/ ctx[8] + "vh");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 512 512");
    			attr_dev(svg0, "class", "svelte-g48peo");
    			add_location(svg0, file$9, 239, 8, 8562);
    			set_style(h1, "font-size", 1.5 * /*zoom*/ ctx[8] + "vh");
    			set_style(h1, "margin-left", /*zoom*/ ctx[8] + "vh");
    			attr_dev(h1, "class", "svelte-g48peo");
    			add_location(h1, file$9, 243, 8, 9213);
    			attr_dev(div0, "class", "titleBar svelte-g48peo");
    			attr_dev(div0, "draggable", "true");
    			set_style(div0, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(div0, "background-color", "var(--red)");
    			add_location(div0, file$9, 229, 4, 8356);
    			set_style(p, "font-size", /*zoom*/ ctx[8] + "vh");
    			attr_dev(p, "class", "svelte-g48peo");
    			add_location(p, file$9, 249, 8, 9424);
    			set_style(div1, "align-items", "center");
    			set_style(div1, "justify-content", "center");
    			attr_dev(div1, "class", "contents svelte-g48peo");
    			add_location(div1, file$9, 248, 4, 9338);
    			attr_dev(path1, "d", "M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z");
    			add_location(path1, file$9, 264, 238, 9958);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 448 512");
    			attr_dev(svg1, "class", "svelte-g48peo");
    			add_location(svg1, file$9, 264, 8, 9728);
    			attr_dev(div2, "class", "deleteAction svelte-g48peo");
    			set_style(div2, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(div2, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			add_location(div2, file$9, 255, 4, 9541);
    			attr_dev(main, "class", "neuOutdentShadowRim svelte-g48peo");
    			set_style(main, "left", ((/*posX*/ ctx[2] + /*simX*/ ctx[6]) * /*zoom*/ ctx[8] + /*offX*/ ctx[4]) * 2 + "vh");
    			set_style(main, "top", ((/*posY*/ ctx[3] + /*simY*/ ctx[7]) * /*zoom*/ ctx[8] + /*offY*/ ctx[5]) * 2 + "vh");
    			set_style(main, "width", 2 * /*nodeData*/ ctx[0].width * /*zoom*/ ctx[8] + "vh");
    			set_style(main, "height", /*zoom*/ ctx[8] * 4 + 3 * /*zoom*/ ctx[8] * 2 + "vh");
    			set_style(main, "border-radius", /*zoom*/ ctx[8] + "vh");
    			add_location(main, file$9, 220, 0, 8034);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, svg0);
    			append_dev(svg0, path0);
    			append_dev(div0, t0);
    			append_dev(div0, h1);
    			append_dev(h1, t1);
    			append_dev(main, t2);
    			append_dev(main, div1);
    			append_dev(div1, p);
    			append_dev(p, t3);
    			append_dev(main, t4);
    			append_dev(main, div2);
    			append_dev(div2, svg1);
    			append_dev(svg1, path1);

    			dispose = [
    				listen_dev(div0, "dragstart", /*drag*/ ctx[17], false, false, false),
    				listen_dev(div2, "click", /*handleDelete*/ ctx[18], false, false, false),
    				listen_dev(main, "mousedown", mousedown_handler_1, false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(svg0, "height", 1.5 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(svg0, "margin-left", /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(h1, "font-size", 1.5 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(h1, "margin-left", /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(div0, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(p, "font-size", /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(div2, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(div2, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*posX, simX, zoom, offX*/ 340) {
    				set_style(main, "left", ((/*posX*/ ctx[2] + /*simX*/ ctx[6]) * /*zoom*/ ctx[8] + /*offX*/ ctx[4]) * 2 + "vh");
    			}

    			if (dirty[0] & /*posY, simY, zoom, offY*/ 424) {
    				set_style(main, "top", ((/*posY*/ ctx[3] + /*simY*/ ctx[7]) * /*zoom*/ ctx[8] + /*offY*/ ctx[5]) * 2 + "vh");
    			}

    			if (dirty[0] & /*nodeData, zoom*/ 257) {
    				set_style(main, "width", 2 * /*nodeData*/ ctx[0].width * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(main, "height", /*zoom*/ ctx[8] * 4 + 3 * /*zoom*/ ctx[8] * 2 + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 256) {
    				set_style(main, "border-radius", /*zoom*/ ctx[8] + "vh");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(220:0) {#if error}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*nodeObject*/ ctx[1] !== null && /*nodeObject*/ ctx[1] !== undefined && /*renderReady*/ ctx[11] && !/*error*/ ctx[12] && create_if_block_1$2(ctx);
    	let if_block1 = /*error*/ ctx[12] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*nodeObject*/ ctx[1] !== null && /*nodeObject*/ ctx[1] !== undefined && /*renderReady*/ ctx[11] && !/*error*/ ctx[12]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*error*/ ctx[12]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function dragOver(event) {
    	event.preventDefault();
    } //event.stopPropagation();

    const mousedown_handler$5 = event => {
    	event.stopPropagation();
    };

    const mousedown_handler_1 = event => {
    	event.stopPropagation();
    };

    function instance$9($$self, $$props, $$invalidate) {
    	const path = require("path");
    	let { posX = 0 } = $$props;
    	let { posY = 0 } = $$props;
    	let { offX = 0 } = $$props;
    	let { offY = 0 } = $$props;
    	let { simX = 0 } = $$props;
    	let { simY = 0 } = $$props;
    	let { zoom = 1 } = $$props;
    	let { nodeData } = $$props;
    	let { context } = $$props;
    	let { nodeObject } = $$props;
    	let renderReady = false;
    	let error = false;

    	onMount(() => {
    		// Load Node on the fly and subscribe to outputs
    		try {
    			console.log(context);
    			const classRef = require(path.join(__dirname, "../src/_NodeResources/NodeTypes/") + nodeData.id);
    			$$invalidate(1, nodeObject = new classRef(nodeData.outputs, context, nodeData));

    			// Restore Input Connections
    			for (let i = 0; i < nodeData.inputs.length; i++) {
    				nodeObject.inputs[i].connect(nodeData.inputs[i]);
    			}

    			console.log("Node " + nodeData.id + " subscribed outputs " + nodeObject.outputs, context);
    			$$invalidate(11, renderReady = true);
    		} catch(err) {
    			$$invalidate(12, error = true);
    			console.error(err);
    		}
    	});

    	let dragState = null;

    	function initConnectionDrag(event, id, index) {
    		// Clear default drag image
    		let imageOverride = document.createElement("img");

    		event.dataTransfer.setDragImage(imageOverride, 0, 0);
    		event.dataTransfer.setData("command", "connectNode");
    		event.dataTransfer.setData("outputID", id);
    		$$invalidate(13, dragState = index);
    	}

    	function clearDrag() {
    		$$invalidate(13, dragState = null);
    	}

    	let { connectionCallback } = $$props;

    	function handleConnect(event, index) {
    		event.preventDefault();
    		event.stopPropagation();
    		console.log("connected");

    		switch (event.dataTransfer.getData("command")) {
    			case "connectNode":
    				let removeOld = nodeData.inputs[index] != null;
    				let outputId = event.dataTransfer.getData("outputID");
    				nodeObject.inputs[index].connect(outputId);
    				$$invalidate(0, nodeData.inputs[index] = outputId, nodeData);
    				connectionCallback(nodeData, outputId, index, removeOld);
    				break;
    		}
    	}

    	let { onDrag } = $$props;
    	let { onDelete } = $$props;
    	let { onInitConnect } = $$props;
    	let { onConnectDrop } = $$props;

    	function drag(event) {
    		onDrag(event);
    	}

    	function handleDelete() {
    		for (let i = 0; i < nodeData.outputs.length; i++) {
    			nodeObject.outputs[i].dismount();
    		}

    		onDelete();
    	}

    	const writable_props = [
    		"posX",
    		"posY",
    		"offX",
    		"offY",
    		"simX",
    		"simY",
    		"zoom",
    		"nodeData",
    		"context",
    		"nodeObject",
    		"connectionCallback",
    		"onDrag",
    		"onDelete",
    		"onInitConnect",
    		"onConnectDrop"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Node> was created with unknown prop '${key}'`);
    	});

    	const dragend_handler = () => {
    		$$invalidate(0, nodeData.posX += nodeData.simX, nodeData);
    		$$invalidate(0, nodeData.posY += nodeData.simY, nodeData);
    		$$invalidate(0, nodeData.simX = 0, nodeData);
    		$$invalidate(0, nodeData.simY = 0, nodeData);
    		clearDrag();
    	};

    	const drop_handler = (index, event) => {
    		handleConnect(event, index);
    	};

    	const dragstart_handler = (output, index, event) => {
    		initConnectionDrag(event, output.id, index);
    		onInitConnect(nodeData, index);
    	};

    	const dragend_handler_1 = () => {
    		clearDrag();
    		onConnectDrop();
    	};

    	$$self.$set = $$props => {
    		if ("posX" in $$props) $$invalidate(2, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(3, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(4, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(5, offY = $$props.offY);
    		if ("simX" in $$props) $$invalidate(6, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(7, simY = $$props.simY);
    		if ("zoom" in $$props) $$invalidate(8, zoom = $$props.zoom);
    		if ("nodeData" in $$props) $$invalidate(0, nodeData = $$props.nodeData);
    		if ("context" in $$props) $$invalidate(19, context = $$props.context);
    		if ("nodeObject" in $$props) $$invalidate(1, nodeObject = $$props.nodeObject);
    		if ("connectionCallback" in $$props) $$invalidate(20, connectionCallback = $$props.connectionCallback);
    		if ("onDrag" in $$props) $$invalidate(21, onDrag = $$props.onDrag);
    		if ("onDelete" in $$props) $$invalidate(22, onDelete = $$props.onDelete);
    		if ("onInitConnect" in $$props) $$invalidate(9, onInitConnect = $$props.onInitConnect);
    		if ("onConnectDrop" in $$props) $$invalidate(10, onConnectDrop = $$props.onConnectDrop);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		path,
    		posX,
    		posY,
    		offX,
    		offY,
    		simX,
    		simY,
    		zoom,
    		nodeData,
    		context,
    		nodeObject,
    		renderReady,
    		error,
    		dragState,
    		initConnectionDrag,
    		clearDrag,
    		dragOver,
    		connectionCallback,
    		handleConnect,
    		onDrag,
    		onDelete,
    		onInitConnect,
    		onConnectDrop,
    		drag,
    		handleDelete,
    		require,
    		console,
    		__dirname,
    		document
    	});

    	$$self.$inject_state = $$props => {
    		if ("posX" in $$props) $$invalidate(2, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(3, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(4, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(5, offY = $$props.offY);
    		if ("simX" in $$props) $$invalidate(6, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(7, simY = $$props.simY);
    		if ("zoom" in $$props) $$invalidate(8, zoom = $$props.zoom);
    		if ("nodeData" in $$props) $$invalidate(0, nodeData = $$props.nodeData);
    		if ("context" in $$props) $$invalidate(19, context = $$props.context);
    		if ("nodeObject" in $$props) $$invalidate(1, nodeObject = $$props.nodeObject);
    		if ("renderReady" in $$props) $$invalidate(11, renderReady = $$props.renderReady);
    		if ("error" in $$props) $$invalidate(12, error = $$props.error);
    		if ("dragState" in $$props) $$invalidate(13, dragState = $$props.dragState);
    		if ("connectionCallback" in $$props) $$invalidate(20, connectionCallback = $$props.connectionCallback);
    		if ("onDrag" in $$props) $$invalidate(21, onDrag = $$props.onDrag);
    		if ("onDelete" in $$props) $$invalidate(22, onDelete = $$props.onDelete);
    		if ("onInitConnect" in $$props) $$invalidate(9, onInitConnect = $$props.onInitConnect);
    		if ("onConnectDrop" in $$props) $$invalidate(10, onConnectDrop = $$props.onConnectDrop);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		nodeData,
    		nodeObject,
    		posX,
    		posY,
    		offX,
    		offY,
    		simX,
    		simY,
    		zoom,
    		onInitConnect,
    		onConnectDrop,
    		renderReady,
    		error,
    		dragState,
    		initConnectionDrag,
    		clearDrag,
    		handleConnect,
    		drag,
    		handleDelete,
    		context,
    		connectionCallback,
    		onDrag,
    		onDelete,
    		path,
    		dragend_handler,
    		drop_handler,
    		dragstart_handler,
    		dragend_handler_1
    	];
    }

    class Node extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$9,
    			create_fragment$9,
    			safe_not_equal,
    			{
    				posX: 2,
    				posY: 3,
    				offX: 4,
    				offY: 5,
    				simX: 6,
    				simY: 7,
    				zoom: 8,
    				nodeData: 0,
    				context: 19,
    				nodeObject: 1,
    				connectionCallback: 20,
    				onDrag: 21,
    				onDelete: 22,
    				onInitConnect: 9,
    				onConnectDrop: 10
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Node",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nodeData*/ ctx[0] === undefined && !("nodeData" in props)) {
    			console_1$1.warn("<Node> was created without expected prop 'nodeData'");
    		}

    		if (/*context*/ ctx[19] === undefined && !("context" in props)) {
    			console_1$1.warn("<Node> was created without expected prop 'context'");
    		}

    		if (/*nodeObject*/ ctx[1] === undefined && !("nodeObject" in props)) {
    			console_1$1.warn("<Node> was created without expected prop 'nodeObject'");
    		}

    		if (/*connectionCallback*/ ctx[20] === undefined && !("connectionCallback" in props)) {
    			console_1$1.warn("<Node> was created without expected prop 'connectionCallback'");
    		}

    		if (/*onDrag*/ ctx[21] === undefined && !("onDrag" in props)) {
    			console_1$1.warn("<Node> was created without expected prop 'onDrag'");
    		}

    		if (/*onDelete*/ ctx[22] === undefined && !("onDelete" in props)) {
    			console_1$1.warn("<Node> was created without expected prop 'onDelete'");
    		}

    		if (/*onInitConnect*/ ctx[9] === undefined && !("onInitConnect" in props)) {
    			console_1$1.warn("<Node> was created without expected prop 'onInitConnect'");
    		}

    		if (/*onConnectDrop*/ ctx[10] === undefined && !("onConnectDrop" in props)) {
    			console_1$1.warn("<Node> was created without expected prop 'onConnectDrop'");
    		}
    	}

    	get posX() {
    		throw new Error("<Node>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set posX(value) {
    		throw new Error("<Node>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get posY() {
    		throw new Error("<Node>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set posY(value) {
    		throw new Error("<Node>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offX() {
    		throw new Error("<Node>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offX(value) {
    		throw new Error("<Node>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offY() {
    		throw new Error("<Node>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offY(value) {
    		throw new Error("<Node>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simX() {
    		throw new Error("<Node>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simX(value) {
    		throw new Error("<Node>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simY() {
    		throw new Error("<Node>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simY(value) {
    		throw new Error("<Node>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zoom() {
    		throw new Error("<Node>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zoom(value) {
    		throw new Error("<Node>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nodeData() {
    		throw new Error("<Node>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nodeData(value) {
    		throw new Error("<Node>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get context() {
    		throw new Error("<Node>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set context(value) {
    		throw new Error("<Node>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nodeObject() {
    		throw new Error("<Node>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nodeObject(value) {
    		throw new Error("<Node>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get connectionCallback() {
    		throw new Error("<Node>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set connectionCallback(value) {
    		throw new Error("<Node>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDrag() {
    		throw new Error("<Node>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDrag(value) {
    		throw new Error("<Node>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDelete() {
    		throw new Error("<Node>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDelete(value) {
    		throw new Error("<Node>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onInitConnect() {
    		throw new Error("<Node>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onInitConnect(value) {
    		throw new Error("<Node>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onConnectDrop() {
    		throw new Error("<Node>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onConnectDrop(value) {
    		throw new Error("<Node>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\NodeEditor\InputNode.svelte generated by Svelte v3.19.1 */

    const { Object: Object_1$3, console: console_1$2 } = globals;
    const file$a = "src\\NodeEditor\\InputNode.svelte";

    function create_fragment$a(ctx) {
    	let main;
    	let div0;
    	let h1;
    	let t0;
    	let t1;
    	let div10;
    	let div6;
    	let div1;
    	let t2;
    	let div5;
    	let div4;
    	let div2;
    	let svg0;
    	let rect0;
    	let rect1;
    	let rect1_fill_value;
    	let svg0_style_value;
    	let t3;
    	let div3;
    	let p;
    	let t4;
    	let t5;
    	let div9;
    	let div7;
    	let h20;
    	let t6;
    	let t7;
    	let input0;
    	let input0_updating = false;
    	let t8;
    	let div8;
    	let h21;
    	let t9;
    	let t10;
    	let input1;
    	let input1_updating = false;
    	let t11;
    	let div11;
    	let svg1;
    	let path_1;
    	let dispose;

    	function input0_input_handler() {
    		input0_updating = true;
    		/*input0_input_handler*/ ctx[27].call(input0);
    	}

    	function input1_input_handler() {
    		input1_updating = true;
    		/*input1_input_handler*/ ctx[28].call(input1);
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text("Grab");
    			t1 = space();
    			div10 = element("div");
    			div6 = element("div");
    			div1 = element("div");
    			t2 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div2 = element("div");
    			svg0 = svg_element("svg");
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			t3 = space();
    			div3 = element("div");
    			p = element("p");
    			t4 = text("Value");
    			t5 = space();
    			div9 = element("div");
    			div7 = element("div");
    			h20 = element("h2");
    			t6 = text("Column");
    			t7 = space();
    			input0 = element("input");
    			t8 = space();
    			div8 = element("div");
    			h21 = element("h2");
    			t9 = text("Row");
    			t10 = space();
    			input1 = element("input");
    			t11 = space();
    			div11 = element("div");
    			svg1 = svg_element("svg");
    			path_1 = svg_element("path");
    			set_style(h1, "font-size", 1.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(h1, "margin-left", /*zoom*/ ctx[7] + "vh");
    			attr_dev(h1, "class", "svelte-1f8zvs5");
    			add_location(h1, file$a, 138, 8, 3301);
    			attr_dev(div0, "class", "titleBar svelte-1f8zvs5");
    			attr_dev(div0, "draggable", "true");
    			set_style(div0, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			set_style(div0, "background-color", /*nodeData*/ ctx[0].color);
    			add_location(div0, file$a, 120, 4, 2864);
    			set_style(div1, "padding-top", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div1, "class", "inputs svelte-1f8zvs5");
    			add_location(div1, file$a, 147, 12, 3552);
    			attr_dev(rect0, "x", "2.5");
    			attr_dev(rect0, "y", "2.5");
    			attr_dev(rect0, "width", "10");
    			attr_dev(rect0, "height", "10");
    			attr_dev(rect0, "rx", "5");
    			attr_dev(rect0, "stroke", "#999999");
    			attr_dev(rect0, "stroke-dasharray", "2 2");
    			add_location(rect0, file$a, 176, 28, 4787);
    			attr_dev(rect1, "x", "5");
    			attr_dev(rect1, "y", "5");
    			attr_dev(rect1, "width", "5");
    			attr_dev(rect1, "height", "5");
    			attr_dev(rect1, "rx", "2.5");
    			attr_dev(rect1, "fill", rect1_fill_value = /*nodeData*/ ctx[0].color);
    			add_location(rect1, file$a, 177, 28, 4910);

    			attr_dev(svg0, "style", svg0_style_value = "\r\n                            width: " + 2 * /*zoom*/ ctx[7] + "vh;\r\n                            height: " + 2 * /*zoom*/ ctx[7] + "vh;\r\n                            " + (/*dragState*/ ctx[11] === 0
    			? "transform: scale(1.5) rotate(360deg);"
    			: "") + "\r\n                            transition: transform .5s cubic-bezier(0, 0, 0, .9);\r\n                        ");

    			attr_dev(svg0, "viewBox", "0 0 15 15");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file$a, 170, 24, 4377);
    			set_style(div2, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div2, "class", "outputTetherCircleContainer svelte-1f8zvs5");
    			add_location(div2, file$a, 169, 20, 4283);
    			set_style(p, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(p, "color", /*nodeData*/ ctx[0].color);
    			attr_dev(p, "class", "svelte-1f8zvs5");
    			add_location(p, file$a, 181, 24, 5131);
    			attr_dev(div3, "class", "outputTetherLabelContainer svelte-1f8zvs5");
    			add_location(div3, file$a, 180, 20, 5065);
    			set_style(div4, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div4, "class", "outputTether svelte-1f8zvs5");
    			attr_dev(div4, "draggable", "true");
    			add_location(div4, file$a, 154, 16, 3749);
    			set_style(div5, "padding-top", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div5, "class", "outputs svelte-1f8zvs5");
    			add_location(div5, file$a, 152, 12, 3670);
    			attr_dev(div6, "class", "tetherContainer svelte-1f8zvs5");
    			set_style(div6, "height", 4 * /*zoom*/ ctx[7] + "vh");
    			add_location(div6, file$a, 144, 8, 3457);
    			set_style(h20, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(h20, "margin-left", /*zoom*/ ctx[7] + "vh");
    			set_style(h20, "margin-right", 0.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(h20, "color", /*nodeData*/ ctx[0].color);
    			add_location(h20, file$a, 193, 16, 5472);
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "name", "col");
    			attr_dev(input0, "min", "0");
    			set_style(input0, "width", 4 * /*zoom*/ ctx[7] + "vh");
    			set_style(input0, "height", 1.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(input0, "margin-right", /*zoom*/ ctx[7] + "vh");
    			set_style(input0, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(input0, "color", /*nodeData*/ ctx[0].textcolor);
    			set_style(input0, "border-radius", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(input0, "class", "svelte-1f8zvs5");
    			add_location(input0, file$a, 199, 16, 5712);
    			attr_dev(div7, "class", "setting svelte-1f8zvs5");
    			add_location(div7, file$a, 192, 12, 5433);
    			set_style(h21, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(h21, "margin-left", /*zoom*/ ctx[7] + "vh");
    			set_style(h21, "margin-right", 0.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(h21, "color", /*nodeData*/ ctx[0].color);
    			add_location(h21, file$a, 209, 16, 6155);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "name", "row");
    			attr_dev(input1, "min", "0");
    			set_style(input1, "width", 4 * /*zoom*/ ctx[7] + "vh");
    			set_style(input1, "height", 1.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(input1, "margin-right", /*zoom*/ ctx[7] + "vh");
    			set_style(input1, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(input1, "color", /*nodeData*/ ctx[0].textcolor);
    			set_style(input1, "border-radius", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(input1, "class", "svelte-1f8zvs5");
    			add_location(input1, file$a, 215, 16, 6392);
    			attr_dev(div8, "class", "setting svelte-1f8zvs5");
    			add_location(div8, file$a, 208, 12, 6116);
    			attr_dev(div9, "class", "settingsContainer svelte-1f8zvs5");
    			add_location(div9, file$a, 191, 8, 5388);
    			attr_dev(div10, "class", "contents svelte-1f8zvs5");
    			add_location(div10, file$a, 143, 4, 3425);
    			attr_dev(path_1, "d", "M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z");
    			add_location(path_1, file$a, 239, 238, 7261);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 448 512");
    			attr_dev(svg1, "class", "svelte-1f8zvs5");
    			add_location(svg1, file$a, 239, 8, 7031);
    			attr_dev(div11, "class", "deleteAction svelte-1f8zvs5");
    			set_style(div11, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			set_style(div11, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			add_location(div11, file$a, 230, 4, 6844);
    			attr_dev(main, "class", "neuOutdentShadowRim svelte-1f8zvs5");
    			set_style(main, "left", ((/*posX*/ ctx[1] + /*simX*/ ctx[5]) * /*zoom*/ ctx[7] + /*offX*/ ctx[3]) * 2 + "vh");
    			set_style(main, "top", ((/*posY*/ ctx[2] + /*simY*/ ctx[6]) * /*zoom*/ ctx[7] + /*offY*/ ctx[4]) * 2 + "vh");
    			set_style(main, "width", 2 * /*nodeData*/ ctx[0].width * /*zoom*/ ctx[7] + "vh");
    			set_style(main, "height", /*zoom*/ ctx[7] * 12 + "vh");
    			set_style(main, "border-radius", /*zoom*/ ctx[7] + "vh");
    			add_location(main, file$a, 111, 0, 2556);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(main, t1);
    			append_dev(main, div10);
    			append_dev(div10, div6);
    			append_dev(div6, div1);
    			append_dev(div6, t2);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, svg0);
    			append_dev(svg0, rect0);
    			append_dev(svg0, rect1);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, p);
    			append_dev(p, t4);
    			append_dev(div10, t5);
    			append_dev(div10, div9);
    			append_dev(div9, div7);
    			append_dev(div7, h20);
    			append_dev(h20, t6);
    			append_dev(div7, t7);
    			append_dev(div7, input0);
    			set_input_value(input0, /*nodeData*/ ctx[0].selectedCol);
    			append_dev(div9, t8);
    			append_dev(div9, div8);
    			append_dev(div8, h21);
    			append_dev(h21, t9);
    			append_dev(div8, t10);
    			append_dev(div8, input1);
    			set_input_value(input1, /*nodeData*/ ctx[0].selectedRow);
    			append_dev(main, t11);
    			append_dev(main, div11);
    			append_dev(div11, svg1);
    			append_dev(svg1, path_1);

    			dispose = [
    				listen_dev(div0, "dragstart", /*drag*/ ctx[14], false, false, false),
    				listen_dev(div0, "dragend", /*dragend_handler*/ ctx[24], false, false, false),
    				listen_dev(div4, "dragstart", /*dragstart_handler*/ ctx[25], false, false, false),
    				listen_dev(div4, "dragend", /*dragend_handler_1*/ ctx[26], false, false, false),
    				listen_dev(input0, "input", input0_input_handler),
    				listen_dev(input1, "input", input1_input_handler),
    				listen_dev(div11, "click", /*handleDelete*/ ctx[15], false, false, false),
    				listen_dev(main, "mousedown", mousedown_handler$6, false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*zoom*/ 128) {
    				set_style(h1, "font-size", 1.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(h1, "margin-left", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div0, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*nodeData*/ 1) {
    				set_style(div0, "background-color", /*nodeData*/ ctx[0].color);
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div1, "padding-top", 0.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*nodeData*/ 1 && rect1_fill_value !== (rect1_fill_value = /*nodeData*/ ctx[0].color)) {
    				attr_dev(rect1, "fill", rect1_fill_value);
    			}

    			if (dirty & /*zoom, dragState*/ 2176 && svg0_style_value !== (svg0_style_value = "\r\n                            width: " + 2 * /*zoom*/ ctx[7] + "vh;\r\n                            height: " + 2 * /*zoom*/ ctx[7] + "vh;\r\n                            " + (/*dragState*/ ctx[11] === 0
    			? "transform: scale(1.5) rotate(360deg);"
    			: "") + "\r\n                            transition: transform .5s cubic-bezier(0, 0, 0, .9);\r\n                        ")) {
    				attr_dev(svg0, "style", svg0_style_value);
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div2, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(p, "font-size", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*nodeData*/ 1) {
    				set_style(p, "color", /*nodeData*/ ctx[0].color);
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div4, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div5, "padding-top", 0.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div6, "height", 4 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(h20, "font-size", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(h20, "margin-left", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(h20, "margin-right", 0.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*nodeData*/ 1) {
    				set_style(h20, "color", /*nodeData*/ ctx[0].color);
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(input0, "width", 4 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(input0, "height", 1.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(input0, "margin-right", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(input0, "font-size", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*nodeData*/ 1) {
    				set_style(input0, "color", /*nodeData*/ ctx[0].textcolor);
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(input0, "border-radius", 0.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (!input0_updating && dirty & /*nodeData*/ 1) {
    				set_input_value(input0, /*nodeData*/ ctx[0].selectedCol);
    			}

    			input0_updating = false;

    			if (dirty & /*zoom*/ 128) {
    				set_style(h21, "font-size", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(h21, "margin-left", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(h21, "margin-right", 0.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*nodeData*/ 1) {
    				set_style(h21, "color", /*nodeData*/ ctx[0].color);
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(input1, "width", 4 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(input1, "height", 1.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(input1, "margin-right", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(input1, "font-size", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*nodeData*/ 1) {
    				set_style(input1, "color", /*nodeData*/ ctx[0].textcolor);
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(input1, "border-radius", 0.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (!input1_updating && dirty & /*nodeData*/ 1) {
    				set_input_value(input1, /*nodeData*/ ctx[0].selectedRow);
    			}

    			input1_updating = false;

    			if (dirty & /*zoom*/ 128) {
    				set_style(div11, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div11, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*posX, simX, zoom, offX*/ 170) {
    				set_style(main, "left", ((/*posX*/ ctx[1] + /*simX*/ ctx[5]) * /*zoom*/ ctx[7] + /*offX*/ ctx[3]) * 2 + "vh");
    			}

    			if (dirty & /*posY, simY, zoom, offY*/ 212) {
    				set_style(main, "top", ((/*posY*/ ctx[2] + /*simY*/ ctx[6]) * /*zoom*/ ctx[7] + /*offY*/ ctx[4]) * 2 + "vh");
    			}

    			if (dirty & /*nodeData, zoom*/ 129) {
    				set_style(main, "width", 2 * /*nodeData*/ ctx[0].width * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(main, "height", /*zoom*/ ctx[7] * 12 + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(main, "border-radius", /*zoom*/ ctx[7] + "vh");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function dragOver$1(event) {
    	event.preventDefault();
    	event.stopPropagation();
    }

    const mousedown_handler$6 = event => {
    	event.stopPropagation();
    };

    function instance$a($$self, $$props, $$invalidate) {
    	const path = require("path");
    	let { posX = 0 } = $$props;
    	let { posY = 0 } = $$props;
    	let { offX = 0 } = $$props;
    	let { offY = 0 } = $$props;
    	let { simX = 0 } = $$props;
    	let { simY = 0 } = $$props;
    	let { zoom = 1 } = $$props;
    	let { nodeData } = $$props;
    	let { context } = $$props;
    	let { tableData } = $$props;
    	let dragState = null;

    	function initConnectionDrag(event, id, index) {
    		// Clear default drag image
    		let imageOverride = document.createElement("img");

    		event.dataTransfer.setDragImage(imageOverride, 0, 0);
    		event.dataTransfer.setData("command", "connectNode");
    		event.dataTransfer.setData("outputID", id);
    		$$invalidate(11, dragState = index);
    	}

    	function clearDrag() {
    		$$invalidate(11, dragState = null);
    	}

    	let { connectionCallback } = $$props;

    	function handleConnect(event, index) {
    		event.preventDefault();
    		event.stopPropagation();
    		console.log("connected");

    		switch (event.dataTransfer.getData("command")) {
    			case "connectNode":
    				let outputId = event.dataTransfer.getData("outputID");
    				nodeObject.inputs[index].connect(outputId);
    				$$invalidate(0, nodeData.inputs[index] = outputId, nodeData);
    				connectionCallback(nodeData, outputId, index);
    				break;
    		}
    	}

    	let { onDrag } = $$props;
    	let { onDelete } = $$props;
    	let { onInitConnect } = $$props;
    	let { onConnectDrop } = $$props;

    	function drag(event) {
    		onDrag(event);
    	}

    	function handleDelete() {
    		delete context[outputID];
    		onDelete();
    	}

    	let { outputID } = $$props;

    	onMount(() => {
    		console.log("Input Node mounted with tether ID " + outputID);

    		let simObject = {
    			process,
    			"superNode": {
    				"rawNodeData": Object.assign(nodeData, { "outputs": [outputID] })
    			}
    		};

    		$$invalidate(16, context[outputID] = simObject, context);
    		console.log(context[outputID]);
    	});

    	function process() {
    		return new Promise(async (resolve, reject) => {
    				// Logic here
    				resolve(tableData.cellContents[nodeData.selectedCol][nodeData.selectedRow]);
    			});
    	}

    	const writable_props = [
    		"posX",
    		"posY",
    		"offX",
    		"offY",
    		"simX",
    		"simY",
    		"zoom",
    		"nodeData",
    		"context",
    		"tableData",
    		"connectionCallback",
    		"onDrag",
    		"onDelete",
    		"onInitConnect",
    		"onConnectDrop",
    		"outputID"
    	];

    	Object_1$3.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<InputNode> was created with unknown prop '${key}'`);
    	});

    	const dragend_handler = () => {
    		$$invalidate(0, nodeData.posX += nodeData.simX, nodeData);
    		$$invalidate(0, nodeData.posY += nodeData.simY, nodeData);
    		$$invalidate(0, nodeData.simX = 0, nodeData);
    		$$invalidate(0, nodeData.simY = 0, nodeData);
    		clearDrag();
    	};

    	const dragstart_handler = event => {
    		initConnectionDrag(event, outputID, 0);
    		onInitConnect(nodeData, 0);
    	};

    	const dragend_handler_1 = () => {
    		clearDrag();
    		onConnectDrop();
    	};

    	function input0_input_handler() {
    		nodeData.selectedCol = to_number(this.value);
    		$$invalidate(0, nodeData);
    	}

    	function input1_input_handler() {
    		nodeData.selectedRow = to_number(this.value);
    		$$invalidate(0, nodeData);
    	}

    	$$self.$set = $$props => {
    		if ("posX" in $$props) $$invalidate(1, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(2, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(3, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(4, offY = $$props.offY);
    		if ("simX" in $$props) $$invalidate(5, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(6, simY = $$props.simY);
    		if ("zoom" in $$props) $$invalidate(7, zoom = $$props.zoom);
    		if ("nodeData" in $$props) $$invalidate(0, nodeData = $$props.nodeData);
    		if ("context" in $$props) $$invalidate(16, context = $$props.context);
    		if ("tableData" in $$props) $$invalidate(17, tableData = $$props.tableData);
    		if ("connectionCallback" in $$props) $$invalidate(18, connectionCallback = $$props.connectionCallback);
    		if ("onDrag" in $$props) $$invalidate(19, onDrag = $$props.onDrag);
    		if ("onDelete" in $$props) $$invalidate(20, onDelete = $$props.onDelete);
    		if ("onInitConnect" in $$props) $$invalidate(8, onInitConnect = $$props.onInitConnect);
    		if ("onConnectDrop" in $$props) $$invalidate(9, onConnectDrop = $$props.onConnectDrop);
    		if ("outputID" in $$props) $$invalidate(10, outputID = $$props.outputID);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		path,
    		posX,
    		posY,
    		offX,
    		offY,
    		simX,
    		simY,
    		zoom,
    		nodeData,
    		context,
    		tableData,
    		dragState,
    		initConnectionDrag,
    		clearDrag,
    		dragOver: dragOver$1,
    		connectionCallback,
    		handleConnect,
    		onDrag,
    		onDelete,
    		onInitConnect,
    		onConnectDrop,
    		drag,
    		handleDelete,
    		outputID,
    		process,
    		require,
    		document,
    		console,
    		nodeObject,
    		Object,
    		Promise
    	});

    	$$self.$inject_state = $$props => {
    		if ("posX" in $$props) $$invalidate(1, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(2, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(3, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(4, offY = $$props.offY);
    		if ("simX" in $$props) $$invalidate(5, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(6, simY = $$props.simY);
    		if ("zoom" in $$props) $$invalidate(7, zoom = $$props.zoom);
    		if ("nodeData" in $$props) $$invalidate(0, nodeData = $$props.nodeData);
    		if ("context" in $$props) $$invalidate(16, context = $$props.context);
    		if ("tableData" in $$props) $$invalidate(17, tableData = $$props.tableData);
    		if ("dragState" in $$props) $$invalidate(11, dragState = $$props.dragState);
    		if ("connectionCallback" in $$props) $$invalidate(18, connectionCallback = $$props.connectionCallback);
    		if ("onDrag" in $$props) $$invalidate(19, onDrag = $$props.onDrag);
    		if ("onDelete" in $$props) $$invalidate(20, onDelete = $$props.onDelete);
    		if ("onInitConnect" in $$props) $$invalidate(8, onInitConnect = $$props.onInitConnect);
    		if ("onConnectDrop" in $$props) $$invalidate(9, onConnectDrop = $$props.onConnectDrop);
    		if ("outputID" in $$props) $$invalidate(10, outputID = $$props.outputID);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		nodeData,
    		posX,
    		posY,
    		offX,
    		offY,
    		simX,
    		simY,
    		zoom,
    		onInitConnect,
    		onConnectDrop,
    		outputID,
    		dragState,
    		initConnectionDrag,
    		clearDrag,
    		drag,
    		handleDelete,
    		context,
    		tableData,
    		connectionCallback,
    		onDrag,
    		onDelete,
    		path,
    		handleConnect,
    		process,
    		dragend_handler,
    		dragstart_handler,
    		dragend_handler_1,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class InputNode extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			posX: 1,
    			posY: 2,
    			offX: 3,
    			offY: 4,
    			simX: 5,
    			simY: 6,
    			zoom: 7,
    			nodeData: 0,
    			context: 16,
    			tableData: 17,
    			connectionCallback: 18,
    			onDrag: 19,
    			onDelete: 20,
    			onInitConnect: 8,
    			onConnectDrop: 9,
    			outputID: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputNode",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nodeData*/ ctx[0] === undefined && !("nodeData" in props)) {
    			console_1$2.warn("<InputNode> was created without expected prop 'nodeData'");
    		}

    		if (/*context*/ ctx[16] === undefined && !("context" in props)) {
    			console_1$2.warn("<InputNode> was created without expected prop 'context'");
    		}

    		if (/*tableData*/ ctx[17] === undefined && !("tableData" in props)) {
    			console_1$2.warn("<InputNode> was created without expected prop 'tableData'");
    		}

    		if (/*connectionCallback*/ ctx[18] === undefined && !("connectionCallback" in props)) {
    			console_1$2.warn("<InputNode> was created without expected prop 'connectionCallback'");
    		}

    		if (/*onDrag*/ ctx[19] === undefined && !("onDrag" in props)) {
    			console_1$2.warn("<InputNode> was created without expected prop 'onDrag'");
    		}

    		if (/*onDelete*/ ctx[20] === undefined && !("onDelete" in props)) {
    			console_1$2.warn("<InputNode> was created without expected prop 'onDelete'");
    		}

    		if (/*onInitConnect*/ ctx[8] === undefined && !("onInitConnect" in props)) {
    			console_1$2.warn("<InputNode> was created without expected prop 'onInitConnect'");
    		}

    		if (/*onConnectDrop*/ ctx[9] === undefined && !("onConnectDrop" in props)) {
    			console_1$2.warn("<InputNode> was created without expected prop 'onConnectDrop'");
    		}

    		if (/*outputID*/ ctx[10] === undefined && !("outputID" in props)) {
    			console_1$2.warn("<InputNode> was created without expected prop 'outputID'");
    		}
    	}

    	get posX() {
    		throw new Error("<InputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set posX(value) {
    		throw new Error("<InputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get posY() {
    		throw new Error("<InputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set posY(value) {
    		throw new Error("<InputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offX() {
    		throw new Error("<InputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offX(value) {
    		throw new Error("<InputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offY() {
    		throw new Error("<InputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offY(value) {
    		throw new Error("<InputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simX() {
    		throw new Error("<InputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simX(value) {
    		throw new Error("<InputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simY() {
    		throw new Error("<InputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simY(value) {
    		throw new Error("<InputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zoom() {
    		throw new Error("<InputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zoom(value) {
    		throw new Error("<InputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nodeData() {
    		throw new Error("<InputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nodeData(value) {
    		throw new Error("<InputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get context() {
    		throw new Error("<InputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set context(value) {
    		throw new Error("<InputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tableData() {
    		throw new Error("<InputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tableData(value) {
    		throw new Error("<InputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get connectionCallback() {
    		throw new Error("<InputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set connectionCallback(value) {
    		throw new Error("<InputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDrag() {
    		throw new Error("<InputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDrag(value) {
    		throw new Error("<InputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDelete() {
    		throw new Error("<InputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDelete(value) {
    		throw new Error("<InputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onInitConnect() {
    		throw new Error("<InputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onInitConnect(value) {
    		throw new Error("<InputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onConnectDrop() {
    		throw new Error("<InputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onConnectDrop(value) {
    		throw new Error("<InputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outputID() {
    		throw new Error("<InputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outputID(value) {
    		throw new Error("<InputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\NodeEditor\OutputNode.svelte generated by Svelte v3.19.1 */

    const { console: console_1$3 } = globals;
    const file$b = "src\\NodeEditor\\OutputNode.svelte";

    function create_fragment$b(ctx) {
    	let main;
    	let div0;
    	let h1;
    	let t0;
    	let t1;
    	let div10;
    	let div6;
    	let div4;
    	let div3;
    	let div1;
    	let svg0;
    	let rect0;
    	let rect1;
    	let rect1_fill_value;
    	let t2;
    	let div2;
    	let p;
    	let t3;
    	let t4;
    	let div5;
    	let t5;
    	let div9;
    	let div7;
    	let h20;
    	let t6;
    	let t7;
    	let input0;
    	let input0_updating = false;
    	let t8;
    	let div8;
    	let h21;
    	let t9;
    	let t10;
    	let input1;
    	let input1_updating = false;
    	let t11;
    	let div11;
    	let svg1;
    	let path_1;
    	let dispose;

    	function input0_input_handler() {
    		input0_updating = true;
    		/*input0_input_handler*/ ctx[24].call(input0);
    	}

    	function input1_input_handler() {
    		input1_updating = true;
    		/*input1_input_handler*/ ctx[25].call(input1);
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text("Put");
    			t1 = space();
    			div10 = element("div");
    			div6 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			svg0 = svg_element("svg");
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			t2 = space();
    			div2 = element("div");
    			p = element("p");
    			t3 = text("Data");
    			t4 = space();
    			div5 = element("div");
    			t5 = space();
    			div9 = element("div");
    			div7 = element("div");
    			h20 = element("h2");
    			t6 = text("Column");
    			t7 = space();
    			input0 = element("input");
    			t8 = space();
    			div8 = element("div");
    			h21 = element("h2");
    			t9 = text("Row");
    			t10 = space();
    			input1 = element("input");
    			t11 = space();
    			div11 = element("div");
    			svg1 = svg_element("svg");
    			path_1 = svg_element("path");
    			set_style(h1, "font-size", 1.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(h1, "margin-left", /*zoom*/ ctx[7] + "vh");
    			attr_dev(h1, "class", "svelte-1f8zvs5");
    			add_location(h1, file$b, 142, 8, 3557);
    			attr_dev(div0, "class", "titleBar svelte-1f8zvs5");
    			attr_dev(div0, "draggable", "true");
    			set_style(div0, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			set_style(div0, "background-color", /*nodeData*/ ctx[0].color);
    			add_location(div0, file$b, 124, 4, 3120);
    			attr_dev(rect0, "x", "2.5");
    			attr_dev(rect0, "y", "2.5");
    			attr_dev(rect0, "width", "10");
    			attr_dev(rect0, "height", "10");
    			attr_dev(rect0, "rx", "5");
    			attr_dev(rect0, "stroke", "#999999");
    			attr_dev(rect0, "stroke-dasharray", "2 2");
    			add_location(rect0, file$b, 161, 28, 4392);
    			attr_dev(rect1, "x", "5");
    			attr_dev(rect1, "y", "5");
    			attr_dev(rect1, "width", "5");
    			attr_dev(rect1, "height", "5");
    			attr_dev(rect1, "rx", "2.5");
    			attr_dev(rect1, "fill", rect1_fill_value = /*nodeData*/ ctx[0].color);
    			add_location(rect1, file$b, 162, 28, 4515);
    			set_style(svg0, "width", 2 * /*zoom*/ ctx[7] + "vh");
    			set_style(svg0, "height", 2 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(svg0, "viewBox", "0 0 15 15");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file$b, 160, 24, 4243);
    			set_style(div1, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div1, "class", "inputTetherCircleContainer svelte-1f8zvs5");
    			add_location(div1, file$b, 159, 20, 4150);
    			set_style(p, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(p, "color", /*nodeData*/ ctx[0].color);
    			attr_dev(p, "class", "svelte-1f8zvs5");
    			add_location(p, file$b, 166, 24, 4735);
    			attr_dev(div2, "class", "inputTetherLabelContainer svelte-1f8zvs5");
    			add_location(div2, file$b, 165, 20, 4670);
    			set_style(div3, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div3, "class", "inputTether svelte-1f8zvs5");
    			add_location(div3, file$b, 152, 16, 3879);
    			set_style(div4, "padding-top", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div4, "class", "inputs svelte-1f8zvs5");
    			add_location(div4, file$b, 151, 12, 3807);
    			set_style(div5, "padding-top", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div5, "class", "outputs svelte-1f8zvs5");
    			add_location(div5, file$b, 175, 12, 4983);
    			attr_dev(div6, "class", "tetherContainer svelte-1f8zvs5");
    			set_style(div6, "height", 4 * /*zoom*/ ctx[7] + "vh");
    			add_location(div6, file$b, 148, 8, 3712);
    			set_style(h20, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(h20, "margin-left", /*zoom*/ ctx[7] + "vh");
    			set_style(h20, "margin-right", 0.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(h20, "color", /*nodeData*/ ctx[0].color);
    			add_location(h20, file$b, 184, 16, 5200);
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "name", "col");
    			attr_dev(input0, "min", "0");
    			set_style(input0, "width", 4 * /*zoom*/ ctx[7] + "vh");
    			set_style(input0, "height", 1.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(input0, "margin-right", /*zoom*/ ctx[7] + "vh");
    			set_style(input0, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(input0, "color", /*nodeData*/ ctx[0].textcolor);
    			set_style(input0, "border-radius", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(input0, "class", "svelte-1f8zvs5");
    			add_location(input0, file$b, 190, 16, 5440);
    			attr_dev(div7, "class", "setting svelte-1f8zvs5");
    			add_location(div7, file$b, 183, 12, 5161);
    			set_style(h21, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(h21, "margin-left", /*zoom*/ ctx[7] + "vh");
    			set_style(h21, "margin-right", 0.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(h21, "color", /*nodeData*/ ctx[0].color);
    			add_location(h21, file$b, 200, 16, 5883);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "name", "row");
    			attr_dev(input1, "min", "0");
    			set_style(input1, "width", 4 * /*zoom*/ ctx[7] + "vh");
    			set_style(input1, "height", 1.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(input1, "margin-right", /*zoom*/ ctx[7] + "vh");
    			set_style(input1, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(input1, "color", /*nodeData*/ ctx[0].textcolor);
    			set_style(input1, "border-radius", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(input1, "class", "svelte-1f8zvs5");
    			add_location(input1, file$b, 206, 16, 6120);
    			attr_dev(div8, "class", "setting svelte-1f8zvs5");
    			add_location(div8, file$b, 199, 12, 5844);
    			attr_dev(div9, "class", "settingsContainer svelte-1f8zvs5");
    			add_location(div9, file$b, 182, 8, 5116);
    			attr_dev(div10, "class", "contents svelte-1f8zvs5");
    			add_location(div10, file$b, 147, 4, 3680);
    			attr_dev(path_1, "d", "M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z");
    			add_location(path_1, file$b, 230, 238, 6989);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 448 512");
    			attr_dev(svg1, "class", "svelte-1f8zvs5");
    			add_location(svg1, file$b, 230, 8, 6759);
    			attr_dev(div11, "class", "deleteAction svelte-1f8zvs5");
    			set_style(div11, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			set_style(div11, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			add_location(div11, file$b, 221, 4, 6572);
    			attr_dev(main, "class", "neuOutdentShadowRim svelte-1f8zvs5");
    			set_style(main, "left", ((/*posX*/ ctx[1] + /*simX*/ ctx[5]) * /*zoom*/ ctx[7] + /*offX*/ ctx[3]) * 2 + "vh");
    			set_style(main, "top", ((/*posY*/ ctx[2] + /*simY*/ ctx[6]) * /*zoom*/ ctx[7] + /*offY*/ ctx[4]) * 2 + "vh");
    			set_style(main, "width", 2 * /*nodeData*/ ctx[0].width * /*zoom*/ ctx[7] + "vh");
    			set_style(main, "height", /*zoom*/ ctx[7] * 12 + "vh");
    			set_style(main, "border-radius", /*zoom*/ ctx[7] + "vh");
    			add_location(main, file$b, 115, 0, 2812);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(main, t1);
    			append_dev(main, div10);
    			append_dev(div10, div6);
    			append_dev(div6, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, svg0);
    			append_dev(svg0, rect0);
    			append_dev(svg0, rect1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, p);
    			append_dev(p, t3);
    			append_dev(div6, t4);
    			append_dev(div6, div5);
    			append_dev(div10, t5);
    			append_dev(div10, div9);
    			append_dev(div9, div7);
    			append_dev(div7, h20);
    			append_dev(h20, t6);
    			append_dev(div7, t7);
    			append_dev(div7, input0);
    			set_input_value(input0, /*nodeData*/ ctx[0].selectedCol);
    			append_dev(div9, t8);
    			append_dev(div9, div8);
    			append_dev(div8, h21);
    			append_dev(h21, t9);
    			append_dev(div8, t10);
    			append_dev(div8, input1);
    			set_input_value(input1, /*nodeData*/ ctx[0].selectedRow);
    			append_dev(main, t11);
    			append_dev(main, div11);
    			append_dev(div11, svg1);
    			append_dev(svg1, path_1);

    			dispose = [
    				listen_dev(div0, "dragstart", /*drag*/ ctx[10], false, false, false),
    				listen_dev(div0, "dragend", /*dragend_handler*/ ctx[22], false, false, false),
    				listen_dev(div3, "dragover", dragOver$2, false, false, false),
    				listen_dev(div3, "drop", /*drop_handler*/ ctx[23], false, false, false),
    				listen_dev(input0, "input", input0_input_handler),
    				listen_dev(input1, "input", input1_input_handler),
    				listen_dev(div11, "click", /*handleDelete*/ ctx[11], false, false, false),
    				listen_dev(main, "mousedown", mousedown_handler$7, false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*zoom*/ 128) {
    				set_style(h1, "font-size", 1.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(h1, "margin-left", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div0, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*nodeData*/ 1) {
    				set_style(div0, "background-color", /*nodeData*/ ctx[0].color);
    			}

    			if (dirty & /*nodeData*/ 1 && rect1_fill_value !== (rect1_fill_value = /*nodeData*/ ctx[0].color)) {
    				attr_dev(rect1, "fill", rect1_fill_value);
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(svg0, "width", 2 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(svg0, "height", 2 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div1, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(p, "font-size", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*nodeData*/ 1) {
    				set_style(p, "color", /*nodeData*/ ctx[0].color);
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div3, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div4, "padding-top", 0.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div5, "padding-top", 0.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div6, "height", 4 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(h20, "font-size", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(h20, "margin-left", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(h20, "margin-right", 0.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*nodeData*/ 1) {
    				set_style(h20, "color", /*nodeData*/ ctx[0].color);
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(input0, "width", 4 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(input0, "height", 1.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(input0, "margin-right", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(input0, "font-size", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*nodeData*/ 1) {
    				set_style(input0, "color", /*nodeData*/ ctx[0].textcolor);
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(input0, "border-radius", 0.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (!input0_updating && dirty & /*nodeData*/ 1) {
    				set_input_value(input0, /*nodeData*/ ctx[0].selectedCol);
    			}

    			input0_updating = false;

    			if (dirty & /*zoom*/ 128) {
    				set_style(h21, "font-size", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(h21, "margin-left", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(h21, "margin-right", 0.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*nodeData*/ 1) {
    				set_style(h21, "color", /*nodeData*/ ctx[0].color);
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(input1, "width", 4 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(input1, "height", 1.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(input1, "margin-right", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(input1, "font-size", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*nodeData*/ 1) {
    				set_style(input1, "color", /*nodeData*/ ctx[0].textcolor);
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(input1, "border-radius", 0.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (!input1_updating && dirty & /*nodeData*/ 1) {
    				set_input_value(input1, /*nodeData*/ ctx[0].selectedRow);
    			}

    			input1_updating = false;

    			if (dirty & /*zoom*/ 128) {
    				set_style(div11, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div11, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*posX, simX, zoom, offX*/ 170) {
    				set_style(main, "left", ((/*posX*/ ctx[1] + /*simX*/ ctx[5]) * /*zoom*/ ctx[7] + /*offX*/ ctx[3]) * 2 + "vh");
    			}

    			if (dirty & /*posY, simY, zoom, offY*/ 212) {
    				set_style(main, "top", ((/*posY*/ ctx[2] + /*simY*/ ctx[6]) * /*zoom*/ ctx[7] + /*offY*/ ctx[4]) * 2 + "vh");
    			}

    			if (dirty & /*nodeData, zoom*/ 129) {
    				set_style(main, "width", 2 * /*nodeData*/ ctx[0].width * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(main, "height", /*zoom*/ ctx[7] * 12 + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(main, "border-radius", /*zoom*/ ctx[7] + "vh");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function dragOver$2(event) {
    	event.preventDefault();
    } //event.stopPropagation();

    const mousedown_handler$7 = event => {
    	event.stopPropagation();
    };

    function instance$b($$self, $$props, $$invalidate) {
    	const path = require("path");
    	let { posX = 0 } = $$props;
    	let { posY = 0 } = $$props;
    	let { offX = 0 } = $$props;
    	let { offY = 0 } = $$props;
    	let { simX = 0 } = $$props;
    	let { simY = 0 } = $$props;
    	let { zoom = 1 } = $$props;
    	let { nodeData } = $$props;
    	let { context } = $$props;
    	let { tableRef } = $$props;
    	let { tableData } = $$props;
    	let dragState = null;

    	/*     //5000 iq
        export let superNode = this;
        export let rawNodeData = nodeData; */
    	function initConnectionDrag(event, id, index) {
    		// Clear default drag image
    		let imageOverride = document.createElement("img");

    		event.dataTransfer.setDragImage(imageOverride, 0, 0);
    		event.dataTransfer.setData("command", "connectNode");
    		event.dataTransfer.setData("outputID", id);
    		dragState = index;
    	}

    	function clearDrag() {
    		dragState = null;
    	}

    	let { connectionCallback } = $$props;

    	function handleConnect(event, index) {
    		event.preventDefault();
    		event.stopPropagation();
    		console.log("connected");

    		switch (event.dataTransfer.getData("command")) {
    			case "connectNode":
    				let removeOld = nodeData.input != null;
    				let outputId = event.dataTransfer.getData("outputID");
    				$$invalidate(0, nodeData.input = outputId, nodeData);
    				connectionCallback(nodeData, outputId, index, removeOld);
    				break;
    		}

    		process();
    	}

    	let { onDrag } = $$props;
    	let { onDelete } = $$props;

    	function drag(event) {
    		onDrag(event);
    	}

    	function handleDelete() {
    		try {
    			delete context[outputID];
    		} catch(err) {
    			console.log(err);
    		}

    		onDelete();
    	}

    	async function process() {
    		context[nodeData.input].process().then(value => {
    			$$invalidate(12, tableData.cellContents[nodeData.selectedCol][nodeData.selectedRow] = value, tableData);
    			tableData.reference.rerender();
    		}).catch(err => {
    			console.error(err);
    		});
    	}

    	const writable_props = [
    		"posX",
    		"posY",
    		"offX",
    		"offY",
    		"simX",
    		"simY",
    		"zoom",
    		"nodeData",
    		"context",
    		"tableRef",
    		"tableData",
    		"connectionCallback",
    		"onDrag",
    		"onDelete"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<OutputNode> was created with unknown prop '${key}'`);
    	});

    	const dragend_handler = () => {
    		$$invalidate(0, nodeData.posX += nodeData.simX, nodeData);
    		$$invalidate(0, nodeData.posY += nodeData.simY, nodeData);
    		$$invalidate(0, nodeData.simX = 0, nodeData);
    		$$invalidate(0, nodeData.simY = 0, nodeData);
    		clearDrag();
    	};

    	const drop_handler = event => {
    		handleConnect(event, 0);
    	};

    	function input0_input_handler() {
    		nodeData.selectedCol = to_number(this.value);
    		$$invalidate(0, nodeData);
    	}

    	function input1_input_handler() {
    		nodeData.selectedRow = to_number(this.value);
    		$$invalidate(0, nodeData);
    	}

    	$$self.$set = $$props => {
    		if ("posX" in $$props) $$invalidate(1, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(2, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(3, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(4, offY = $$props.offY);
    		if ("simX" in $$props) $$invalidate(5, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(6, simY = $$props.simY);
    		if ("zoom" in $$props) $$invalidate(7, zoom = $$props.zoom);
    		if ("nodeData" in $$props) $$invalidate(0, nodeData = $$props.nodeData);
    		if ("context" in $$props) $$invalidate(13, context = $$props.context);
    		if ("tableRef" in $$props) $$invalidate(14, tableRef = $$props.tableRef);
    		if ("tableData" in $$props) $$invalidate(12, tableData = $$props.tableData);
    		if ("connectionCallback" in $$props) $$invalidate(15, connectionCallback = $$props.connectionCallback);
    		if ("onDrag" in $$props) $$invalidate(16, onDrag = $$props.onDrag);
    		if ("onDelete" in $$props) $$invalidate(17, onDelete = $$props.onDelete);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		path,
    		posX,
    		posY,
    		offX,
    		offY,
    		simX,
    		simY,
    		zoom,
    		nodeData,
    		context,
    		tableRef,
    		tableData,
    		dragState,
    		initConnectionDrag,
    		clearDrag,
    		dragOver: dragOver$2,
    		connectionCallback,
    		handleConnect,
    		onDrag,
    		onDelete,
    		drag,
    		handleDelete,
    		process,
    		require,
    		document,
    		console,
    		outputID
    	});

    	$$self.$inject_state = $$props => {
    		if ("posX" in $$props) $$invalidate(1, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(2, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(3, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(4, offY = $$props.offY);
    		if ("simX" in $$props) $$invalidate(5, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(6, simY = $$props.simY);
    		if ("zoom" in $$props) $$invalidate(7, zoom = $$props.zoom);
    		if ("nodeData" in $$props) $$invalidate(0, nodeData = $$props.nodeData);
    		if ("context" in $$props) $$invalidate(13, context = $$props.context);
    		if ("tableRef" in $$props) $$invalidate(14, tableRef = $$props.tableRef);
    		if ("tableData" in $$props) $$invalidate(12, tableData = $$props.tableData);
    		if ("dragState" in $$props) dragState = $$props.dragState;
    		if ("connectionCallback" in $$props) $$invalidate(15, connectionCallback = $$props.connectionCallback);
    		if ("onDrag" in $$props) $$invalidate(16, onDrag = $$props.onDrag);
    		if ("onDelete" in $$props) $$invalidate(17, onDelete = $$props.onDelete);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		nodeData,
    		posX,
    		posY,
    		offX,
    		offY,
    		simX,
    		simY,
    		zoom,
    		clearDrag,
    		handleConnect,
    		drag,
    		handleDelete,
    		tableData,
    		context,
    		tableRef,
    		connectionCallback,
    		onDrag,
    		onDelete,
    		process,
    		dragState,
    		path,
    		initConnectionDrag,
    		dragend_handler,
    		drop_handler,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class OutputNode extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			posX: 1,
    			posY: 2,
    			offX: 3,
    			offY: 4,
    			simX: 5,
    			simY: 6,
    			zoom: 7,
    			nodeData: 0,
    			context: 13,
    			tableRef: 14,
    			tableData: 12,
    			connectionCallback: 15,
    			onDrag: 16,
    			onDelete: 17,
    			process: 18
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OutputNode",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nodeData*/ ctx[0] === undefined && !("nodeData" in props)) {
    			console_1$3.warn("<OutputNode> was created without expected prop 'nodeData'");
    		}

    		if (/*context*/ ctx[13] === undefined && !("context" in props)) {
    			console_1$3.warn("<OutputNode> was created without expected prop 'context'");
    		}

    		if (/*tableRef*/ ctx[14] === undefined && !("tableRef" in props)) {
    			console_1$3.warn("<OutputNode> was created without expected prop 'tableRef'");
    		}

    		if (/*tableData*/ ctx[12] === undefined && !("tableData" in props)) {
    			console_1$3.warn("<OutputNode> was created without expected prop 'tableData'");
    		}

    		if (/*connectionCallback*/ ctx[15] === undefined && !("connectionCallback" in props)) {
    			console_1$3.warn("<OutputNode> was created without expected prop 'connectionCallback'");
    		}

    		if (/*onDrag*/ ctx[16] === undefined && !("onDrag" in props)) {
    			console_1$3.warn("<OutputNode> was created without expected prop 'onDrag'");
    		}

    		if (/*onDelete*/ ctx[17] === undefined && !("onDelete" in props)) {
    			console_1$3.warn("<OutputNode> was created without expected prop 'onDelete'");
    		}
    	}

    	get posX() {
    		throw new Error("<OutputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set posX(value) {
    		throw new Error("<OutputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get posY() {
    		throw new Error("<OutputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set posY(value) {
    		throw new Error("<OutputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offX() {
    		throw new Error("<OutputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offX(value) {
    		throw new Error("<OutputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offY() {
    		throw new Error("<OutputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offY(value) {
    		throw new Error("<OutputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simX() {
    		throw new Error("<OutputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simX(value) {
    		throw new Error("<OutputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simY() {
    		throw new Error("<OutputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simY(value) {
    		throw new Error("<OutputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zoom() {
    		throw new Error("<OutputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zoom(value) {
    		throw new Error("<OutputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nodeData() {
    		throw new Error("<OutputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nodeData(value) {
    		throw new Error("<OutputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get context() {
    		throw new Error("<OutputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set context(value) {
    		throw new Error("<OutputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tableRef() {
    		throw new Error("<OutputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tableRef(value) {
    		throw new Error("<OutputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tableData() {
    		throw new Error("<OutputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tableData(value) {
    		throw new Error("<OutputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get connectionCallback() {
    		throw new Error("<OutputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set connectionCallback(value) {
    		throw new Error("<OutputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDrag() {
    		throw new Error("<OutputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDrag(value) {
    		throw new Error("<OutputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDelete() {
    		throw new Error("<OutputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDelete(value) {
    		throw new Error("<OutputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get process() {
    		return this.$$.ctx[18];
    	}

    	set process(value) {
    		throw new Error("<OutputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\NodeEditor\ResultNode.svelte generated by Svelte v3.19.1 */

    const { console: console_1$4 } = globals;
    const file$c = "src\\NodeEditor\\ResultNode.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    // (172:20) {#each resultWidgets as rW}
    function create_each_block$4(ctx) {
    	let option;
    	let t_value = /*rW*/ ctx[23].title + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*rW*/ ctx[23].title;
    			option.value = option.__value;
    			add_location(option, file$c, 172, 24, 5170);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resultWidgets*/ 256 && t_value !== (t_value = /*rW*/ ctx[23].title + "")) set_data_dev(t, t_value);

    			if (dirty & /*resultWidgets*/ 256 && option_value_value !== (option_value_value = /*rW*/ ctx[23].title)) {
    				prop_dev(option, "__value", option_value_value);
    			}

    			option.value = option.__value;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(172:20) {#each resultWidgets as rW}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let main;
    	let div0;
    	let h1;
    	let t0;
    	let t1;
    	let div9;
    	let div6;
    	let div4;
    	let div3;
    	let div1;
    	let svg0;
    	let rect0;
    	let rect1;
    	let rect1_fill_value;
    	let t2;
    	let div2;
    	let p;
    	let t3;
    	let t4;
    	let div5;
    	let t5;
    	let div8;
    	let div7;
    	let h2;
    	let t6;
    	let t7;
    	let select;
    	let t8;
    	let div10;
    	let svg1;
    	let path;
    	let dispose;
    	let each_value = /*resultWidgets*/ ctx[8];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text("Result");
    			t1 = space();
    			div9 = element("div");
    			div6 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			svg0 = svg_element("svg");
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			t2 = space();
    			div2 = element("div");
    			p = element("p");
    			t3 = text("Data");
    			t4 = space();
    			div5 = element("div");
    			t5 = space();
    			div8 = element("div");
    			div7 = element("div");
    			h2 = element("h2");
    			t6 = text("Widget");
    			t7 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t8 = space();
    			div10 = element("div");
    			svg1 = svg_element("svg");
    			path = svg_element("path");
    			set_style(h1, "font-size", 1.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(h1, "margin-left", /*zoom*/ ctx[7] + "vh");
    			attr_dev(h1, "class", "svelte-bj4wx1");
    			add_location(h1, file$c, 115, 8, 2801);
    			attr_dev(div0, "class", "titleBar svelte-bj4wx1");
    			attr_dev(div0, "draggable", "true");
    			set_style(div0, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			set_style(div0, "background-color", /*nodeData*/ ctx[0].color);
    			add_location(div0, file$c, 97, 4, 2364);
    			attr_dev(rect0, "x", "2.5");
    			attr_dev(rect0, "y", "2.5");
    			attr_dev(rect0, "width", "10");
    			attr_dev(rect0, "height", "10");
    			attr_dev(rect0, "rx", "5");
    			attr_dev(rect0, "stroke", "#999999");
    			attr_dev(rect0, "stroke-dasharray", "2 2");
    			add_location(rect0, file$c, 134, 28, 3639);
    			attr_dev(rect1, "x", "5");
    			attr_dev(rect1, "y", "5");
    			attr_dev(rect1, "width", "5");
    			attr_dev(rect1, "height", "5");
    			attr_dev(rect1, "rx", "2.5");
    			attr_dev(rect1, "fill", rect1_fill_value = /*nodeData*/ ctx[0].color);
    			add_location(rect1, file$c, 135, 28, 3762);
    			set_style(svg0, "width", 2 * /*zoom*/ ctx[7] + "vh");
    			set_style(svg0, "height", 2 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(svg0, "viewBox", "0 0 15 15");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file$c, 133, 24, 3490);
    			set_style(div1, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div1, "class", "inputTetherCircleContainer svelte-bj4wx1");
    			add_location(div1, file$c, 132, 20, 3397);
    			set_style(p, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(p, "color", /*nodeData*/ ctx[0].color);
    			attr_dev(p, "class", "svelte-bj4wx1");
    			add_location(p, file$c, 139, 24, 3982);
    			attr_dev(div2, "class", "inputTetherLabelContainer svelte-bj4wx1");
    			add_location(div2, file$c, 138, 20, 3917);
    			set_style(div3, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div3, "class", "inputTether svelte-bj4wx1");
    			add_location(div3, file$c, 125, 16, 3126);
    			set_style(div4, "padding-top", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div4, "class", "inputs svelte-bj4wx1");
    			add_location(div4, file$c, 124, 12, 3054);
    			set_style(div5, "padding-top", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div5, "class", "outputs svelte-bj4wx1");
    			add_location(div5, file$c, 148, 12, 4230);
    			attr_dev(div6, "class", "tetherContainer svelte-bj4wx1");
    			set_style(div6, "height", 4 * /*zoom*/ ctx[7] + "vh");
    			add_location(div6, file$c, 121, 8, 2959);
    			set_style(h2, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(h2, "margin-left", /*zoom*/ ctx[7] + "vh");
    			set_style(h2, "margin-right", 0.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(h2, "color", /*nodeData*/ ctx[0].color);
    			add_location(h2, file$c, 157, 16, 4447);
    			attr_dev(select, "name", "resultWidget");
    			set_style(select, "width", 8 * /*zoom*/ ctx[7] + "vh");
    			set_style(select, "height", 1.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(select, "margin-right", /*zoom*/ ctx[7] + "vh");
    			set_style(select, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(select, "color", /*nodeData*/ ctx[0].textcolor);
    			set_style(select, "border-radius", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(select, "class", "svelte-bj4wx1");
    			if (/*nodeData*/ ctx[0].selectedResult === void 0) add_render_callback(() => /*select_change_handler*/ ctx[22].call(select));
    			add_location(select, file$c, 163, 16, 4687);
    			attr_dev(div7, "class", "setting svelte-bj4wx1");
    			add_location(div7, file$c, 156, 12, 4408);
    			attr_dev(div8, "class", "settingsContainer svelte-bj4wx1");
    			add_location(div8, file$c, 155, 8, 4363);
    			attr_dev(div9, "class", "contents svelte-bj4wx1");
    			add_location(div9, file$c, 120, 4, 2927);
    			attr_dev(path, "d", "M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z");
    			add_location(path, file$c, 190, 238, 5769);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 448 512");
    			attr_dev(svg1, "class", "svelte-bj4wx1");
    			add_location(svg1, file$c, 190, 8, 5539);
    			attr_dev(div10, "class", "deleteAction svelte-bj4wx1");
    			set_style(div10, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			set_style(div10, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			add_location(div10, file$c, 181, 4, 5352);
    			attr_dev(main, "class", "neuOutdentShadowRim svelte-bj4wx1");
    			set_style(main, "left", ((/*posX*/ ctx[1] + /*simX*/ ctx[5]) * /*zoom*/ ctx[7] + /*offX*/ ctx[3]) * 2 + "vh");
    			set_style(main, "top", ((/*posY*/ ctx[2] + /*simY*/ ctx[6]) * /*zoom*/ ctx[7] + /*offY*/ ctx[4]) * 2 + "vh");
    			set_style(main, "width", 2 * /*nodeData*/ ctx[0].width * /*zoom*/ ctx[7] + "vh");
    			set_style(main, "height", /*zoom*/ ctx[7] * 12 + "vh");
    			set_style(main, "border-radius", /*zoom*/ ctx[7] + "vh");
    			add_location(main, file$c, 88, 0, 2056);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(main, t1);
    			append_dev(main, div9);
    			append_dev(div9, div6);
    			append_dev(div6, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, svg0);
    			append_dev(svg0, rect0);
    			append_dev(svg0, rect1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, p);
    			append_dev(p, t3);
    			append_dev(div6, t4);
    			append_dev(div6, div5);
    			append_dev(div9, t5);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div7, h2);
    			append_dev(h2, t6);
    			append_dev(div7, t7);
    			append_dev(div7, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*nodeData*/ ctx[0].selectedResult);
    			append_dev(main, t8);
    			append_dev(main, div10);
    			append_dev(div10, svg1);
    			append_dev(svg1, path);

    			dispose = [
    				listen_dev(div0, "dragstart", /*drag*/ ctx[10], false, false, false),
    				listen_dev(div0, "dragend", /*dragend_handler*/ ctx[19], false, false, false),
    				listen_dev(div3, "dragover", dragOver$3, false, false, false),
    				listen_dev(div3, "drop", /*drop_handler*/ ctx[20], false, false, false),
    				listen_dev(select, "input", /*input_handler*/ ctx[21], false, false, false),
    				listen_dev(select, "change", /*select_change_handler*/ ctx[22]),
    				listen_dev(div10, "click", /*handleDelete*/ ctx[12], false, false, false),
    				listen_dev(main, "mousedown", mousedown_handler$8, false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*zoom*/ 128) {
    				set_style(h1, "font-size", 1.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(h1, "margin-left", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div0, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*nodeData*/ 1) {
    				set_style(div0, "background-color", /*nodeData*/ ctx[0].color);
    			}

    			if (dirty & /*nodeData*/ 1 && rect1_fill_value !== (rect1_fill_value = /*nodeData*/ ctx[0].color)) {
    				attr_dev(rect1, "fill", rect1_fill_value);
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(svg0, "width", 2 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(svg0, "height", 2 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div1, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(p, "font-size", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*nodeData*/ 1) {
    				set_style(p, "color", /*nodeData*/ ctx[0].color);
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div3, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div4, "padding-top", 0.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div5, "padding-top", 0.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div6, "height", 4 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(h2, "font-size", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(h2, "margin-left", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(h2, "margin-right", 0.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*nodeData*/ 1) {
    				set_style(h2, "color", /*nodeData*/ ctx[0].color);
    			}

    			if (dirty & /*resultWidgets*/ 256) {
    				each_value = /*resultWidgets*/ ctx[8];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(select, "width", 8 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(select, "height", 1.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(select, "margin-right", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(select, "font-size", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*nodeData*/ 1) {
    				set_style(select, "color", /*nodeData*/ ctx[0].textcolor);
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(select, "border-radius", 0.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*nodeData*/ 1) {
    				select_option(select, /*nodeData*/ ctx[0].selectedResult);
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div10, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(div10, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*posX, simX, zoom, offX*/ 170) {
    				set_style(main, "left", ((/*posX*/ ctx[1] + /*simX*/ ctx[5]) * /*zoom*/ ctx[7] + /*offX*/ ctx[3]) * 2 + "vh");
    			}

    			if (dirty & /*posY, simY, zoom, offY*/ 212) {
    				set_style(main, "top", ((/*posY*/ ctx[2] + /*simY*/ ctx[6]) * /*zoom*/ ctx[7] + /*offY*/ ctx[4]) * 2 + "vh");
    			}

    			if (dirty & /*nodeData, zoom*/ 129) {
    				set_style(main, "width", 2 * /*nodeData*/ ctx[0].width * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(main, "height", /*zoom*/ ctx[7] * 12 + "vh");
    			}

    			if (dirty & /*zoom*/ 128) {
    				set_style(main, "border-radius", /*zoom*/ ctx[7] + "vh");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function dragOver$3(event) {
    	event.preventDefault();
    } //event.stopPropagation();

    const mousedown_handler$8 = event => {
    	event.stopPropagation();
    };

    function instance$c($$self, $$props, $$invalidate) {
    	let { posX = 0 } = $$props;
    	let { posY = 0 } = $$props;
    	let { offX = 0 } = $$props;
    	let { offY = 0 } = $$props;
    	let { simX = 0 } = $$props;
    	let { simY = 0 } = $$props;
    	let { zoom = 1 } = $$props;
    	let { nodeData } = $$props;
    	let { context } = $$props;
    	let { resultWidgets } = $$props;
    	let { connectionCallback } = $$props;

    	function handleConnect(event, index) {
    		event.preventDefault();
    		event.stopPropagation();
    		console.log("connected");

    		switch (event.dataTransfer.getData("command")) {
    			case "connectNode":
    				let removeOld = nodeData.input != null;
    				let outputId = event.dataTransfer.getData("outputID");
    				$$invalidate(0, nodeData.input = outputId, nodeData);
    				connectionCallback(nodeData, outputId, index, removeOld);
    				break;
    		}

    		process();
    	}

    	let { onDrag } = $$props;
    	let { onDelete } = $$props;

    	function drag(event) {
    		onDrag(event);
    	}

    	function clearDrag() {
    		dragState = null;
    	}

    	let dragState = null;

    	function handleDelete() {
    		try {
    			delete context[outputID];
    		} catch(err) {
    			console.log(err);
    		}

    		onDelete();
    	}

    	async function process() {
    		console.log(nodeData);
    		if (nodeData.selectedResult == null) return;

    		context[nodeData.input].process().then(value => {
    			resultWidgets.forEach(widget => {
    				if (widget.title == nodeData.selectedResult) {
    					//widget.value = value;
    					widget.update(value);

    					return;
    				}
    			});
    		}).catch(err => {
    			console.error(err);
    		});
    	}

    	onMount(() => {
    		console.log(resultWidgets);
    	});

    	const writable_props = [
    		"posX",
    		"posY",
    		"offX",
    		"offY",
    		"simX",
    		"simY",
    		"zoom",
    		"nodeData",
    		"context",
    		"resultWidgets",
    		"connectionCallback",
    		"onDrag",
    		"onDelete"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<ResultNode> was created with unknown prop '${key}'`);
    	});

    	const dragend_handler = () => {
    		$$invalidate(0, nodeData.posX += nodeData.simX, nodeData);
    		$$invalidate(0, nodeData.posY += nodeData.simY, nodeData);
    		$$invalidate(0, nodeData.simX = 0, nodeData);
    		$$invalidate(0, nodeData.simY = 0, nodeData);
    		clearDrag();
    	};

    	const drop_handler = event => {
    		handleConnect(event, 0);
    	};

    	const input_handler = function () {
    		console.log(nodeData);
    	};

    	function select_change_handler() {
    		nodeData.selectedResult = select_value(this);
    		$$invalidate(0, nodeData);
    		$$invalidate(8, resultWidgets);
    	}

    	$$self.$set = $$props => {
    		if ("posX" in $$props) $$invalidate(1, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(2, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(3, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(4, offY = $$props.offY);
    		if ("simX" in $$props) $$invalidate(5, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(6, simY = $$props.simY);
    		if ("zoom" in $$props) $$invalidate(7, zoom = $$props.zoom);
    		if ("nodeData" in $$props) $$invalidate(0, nodeData = $$props.nodeData);
    		if ("context" in $$props) $$invalidate(13, context = $$props.context);
    		if ("resultWidgets" in $$props) $$invalidate(8, resultWidgets = $$props.resultWidgets);
    		if ("connectionCallback" in $$props) $$invalidate(14, connectionCallback = $$props.connectionCallback);
    		if ("onDrag" in $$props) $$invalidate(15, onDrag = $$props.onDrag);
    		if ("onDelete" in $$props) $$invalidate(16, onDelete = $$props.onDelete);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		posX,
    		posY,
    		offX,
    		offY,
    		simX,
    		simY,
    		zoom,
    		nodeData,
    		context,
    		resultWidgets,
    		connectionCallback,
    		handleConnect,
    		onDrag,
    		onDelete,
    		drag,
    		clearDrag,
    		dragOver: dragOver$3,
    		dragState,
    		handleDelete,
    		process,
    		console,
    		outputID
    	});

    	$$self.$inject_state = $$props => {
    		if ("posX" in $$props) $$invalidate(1, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(2, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(3, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(4, offY = $$props.offY);
    		if ("simX" in $$props) $$invalidate(5, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(6, simY = $$props.simY);
    		if ("zoom" in $$props) $$invalidate(7, zoom = $$props.zoom);
    		if ("nodeData" in $$props) $$invalidate(0, nodeData = $$props.nodeData);
    		if ("context" in $$props) $$invalidate(13, context = $$props.context);
    		if ("resultWidgets" in $$props) $$invalidate(8, resultWidgets = $$props.resultWidgets);
    		if ("connectionCallback" in $$props) $$invalidate(14, connectionCallback = $$props.connectionCallback);
    		if ("onDrag" in $$props) $$invalidate(15, onDrag = $$props.onDrag);
    		if ("onDelete" in $$props) $$invalidate(16, onDelete = $$props.onDelete);
    		if ("dragState" in $$props) dragState = $$props.dragState;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		nodeData,
    		posX,
    		posY,
    		offX,
    		offY,
    		simX,
    		simY,
    		zoom,
    		resultWidgets,
    		handleConnect,
    		drag,
    		clearDrag,
    		handleDelete,
    		context,
    		connectionCallback,
    		onDrag,
    		onDelete,
    		process,
    		dragState,
    		dragend_handler,
    		drop_handler,
    		input_handler,
    		select_change_handler
    	];
    }

    class ResultNode extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			posX: 1,
    			posY: 2,
    			offX: 3,
    			offY: 4,
    			simX: 5,
    			simY: 6,
    			zoom: 7,
    			nodeData: 0,
    			context: 13,
    			resultWidgets: 8,
    			connectionCallback: 14,
    			onDrag: 15,
    			onDelete: 16,
    			process: 17
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResultNode",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nodeData*/ ctx[0] === undefined && !("nodeData" in props)) {
    			console_1$4.warn("<ResultNode> was created without expected prop 'nodeData'");
    		}

    		if (/*context*/ ctx[13] === undefined && !("context" in props)) {
    			console_1$4.warn("<ResultNode> was created without expected prop 'context'");
    		}

    		if (/*resultWidgets*/ ctx[8] === undefined && !("resultWidgets" in props)) {
    			console_1$4.warn("<ResultNode> was created without expected prop 'resultWidgets'");
    		}

    		if (/*connectionCallback*/ ctx[14] === undefined && !("connectionCallback" in props)) {
    			console_1$4.warn("<ResultNode> was created without expected prop 'connectionCallback'");
    		}

    		if (/*onDrag*/ ctx[15] === undefined && !("onDrag" in props)) {
    			console_1$4.warn("<ResultNode> was created without expected prop 'onDrag'");
    		}

    		if (/*onDelete*/ ctx[16] === undefined && !("onDelete" in props)) {
    			console_1$4.warn("<ResultNode> was created without expected prop 'onDelete'");
    		}
    	}

    	get posX() {
    		throw new Error("<ResultNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set posX(value) {
    		throw new Error("<ResultNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get posY() {
    		throw new Error("<ResultNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set posY(value) {
    		throw new Error("<ResultNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offX() {
    		throw new Error("<ResultNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offX(value) {
    		throw new Error("<ResultNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offY() {
    		throw new Error("<ResultNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offY(value) {
    		throw new Error("<ResultNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simX() {
    		throw new Error("<ResultNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simX(value) {
    		throw new Error("<ResultNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simY() {
    		throw new Error("<ResultNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simY(value) {
    		throw new Error("<ResultNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zoom() {
    		throw new Error("<ResultNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zoom(value) {
    		throw new Error("<ResultNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nodeData() {
    		throw new Error("<ResultNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nodeData(value) {
    		throw new Error("<ResultNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get context() {
    		throw new Error("<ResultNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set context(value) {
    		throw new Error("<ResultNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get resultWidgets() {
    		throw new Error("<ResultNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set resultWidgets(value) {
    		throw new Error("<ResultNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get connectionCallback() {
    		throw new Error("<ResultNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set connectionCallback(value) {
    		throw new Error("<ResultNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDrag() {
    		throw new Error("<ResultNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDrag(value) {
    		throw new Error("<ResultNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDelete() {
    		throw new Error("<ResultNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDelete(value) {
    		throw new Error("<ResultNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get process() {
    		return this.$$.ctx[17];
    	}

    	set process(value) {
    		throw new Error("<ResultNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\NodeEditor\NodePickerSlot.svelte generated by Svelte v3.19.1 */

    const file$d = "src\\NodeEditor\\NodePickerSlot.svelte";

    function create_fragment$d(ctx) {
    	let main;
    	let p;
    	let t_value = splitCamelCase(/*id*/ ctx[0]) + "";
    	let t;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "color", /*color*/ ctx[1]);
    			attr_dev(p, "class", "svelte-4tb4h5");
    			add_location(p, file$d, 28, 4, 669);
    			attr_dev(main, "draggable", "true");
    			set_style(main, "border-color", /*color*/ ctx[1]);
    			attr_dev(main, "class", "svelte-4tb4h5");
    			add_location(main, file$d, 25, 0, 575);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, p);
    			append_dev(p, t);
    			dispose = listen_dev(main, "dragstart", /*initDrag*/ ctx[2], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*id*/ 1 && t_value !== (t_value = splitCamelCase(/*id*/ ctx[0]) + "")) set_data_dev(t, t_value);

    			if (dirty & /*color*/ 2) {
    				set_style(p, "color", /*color*/ ctx[1]);
    			}

    			if (dirty & /*color*/ 2) {
    				set_style(main, "border-color", /*color*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function splitCamelCase(string) {
    	let spread = string.split("");
    	let out = "";

    	spread.forEach(letter => {
    		if (letter == letter.toUpperCase()) out += " ";
    		out += letter;
    	});

    	return out;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { id } = $$props;
    	let { type } = $$props;
    	let { color } = $$props;

    	function initDrag(event) {
    		event.dataTransfer.setData("command", "createNode");
    		event.dataTransfer.setData("nodeID", id);
    		event.dataTransfer.setData("nodeType", type);
    	}

    	const writable_props = ["id", "type", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NodePickerSlot> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("type" in $$props) $$invalidate(3, type = $$props.type);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		id,
    		type,
    		color,
    		initDrag,
    		splitCamelCase
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("type" in $$props) $$invalidate(3, type = $$props.type);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [id, color, initDrag, type];
    }

    class NodePickerSlot extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { id: 0, type: 3, color: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NodePickerSlot",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<NodePickerSlot> was created without expected prop 'id'");
    		}

    		if (/*type*/ ctx[3] === undefined && !("type" in props)) {
    			console.warn("<NodePickerSlot> was created without expected prop 'type'");
    		}

    		if (/*color*/ ctx[1] === undefined && !("color" in props)) {
    			console.warn("<NodePickerSlot> was created without expected prop 'color'");
    		}
    	}

    	get id() {
    		throw new Error("<NodePickerSlot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<NodePickerSlot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<NodePickerSlot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<NodePickerSlot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<NodePickerSlot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<NodePickerSlot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\NodeEditor\LiteralNode.svelte generated by Svelte v3.19.1 */

    const { Object: Object_1$4, console: console_1$5 } = globals;
    const file$e = "src\\NodeEditor\\LiteralNode.svelte";

    // (195:16) {#if nodeData.id == "Number"}
    function create_if_block_1$3(ctx) {
    	let input;
    	let input_updating = false;
    	let dispose;

    	function input_input_handler() {
    		input_updating = true;
    		/*input_input_handler*/ ctx[28].call(input);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "name", "val");
    			set_style(input, "width", "80%");
    			set_style(input, "height", 1.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(input, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(input, "color", /*nodeData*/ ctx[0].textcolor);
    			set_style(input, "border-radius", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(input, "class", "svelte-uw54u");
    			add_location(input, file$e, 195, 20, 5503);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*nodeData*/ ctx[0].value);

    			dispose = [
    				listen_dev(
    					input,
    					"change",
    					function () {
    						if (is_function(/*onChange*/ ctx[10]())) /*onChange*/ ctx[10]().apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(input, "input", input_input_handler),
    				listen_dev(input, "keypress", /*keypress_handler*/ ctx[29], false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*zoom*/ 128) {
    				set_style(input, "height", 1.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 128) {
    				set_style(input, "font-size", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty[0] & /*nodeData*/ 1) {
    				set_style(input, "color", /*nodeData*/ ctx[0].textcolor);
    			}

    			if (dirty[0] & /*zoom*/ 128) {
    				set_style(input, "border-radius", 0.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (!input_updating && dirty[0] & /*nodeData*/ 1) {
    				set_input_value(input, /*nodeData*/ ctx[0].value);
    			}

    			input_updating = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(195:16) {#if nodeData.id == \\\"Number\\\"}",
    		ctx
    	});

    	return block;
    }

    // (213:16) {#if nodeData.id == "Text"}
    function create_if_block$3(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", "val");
    			set_style(input, "width", "80%");
    			set_style(input, "height", 1.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(input, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(input, "color", /*nodeData*/ ctx[0].textcolor);
    			set_style(input, "border-radius", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(input, "class", "svelte-uw54u");
    			add_location(input, file$e, 213, 20, 6256);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*nodeData*/ ctx[0].value);

    			dispose = [
    				listen_dev(
    					input,
    					"change",
    					function () {
    						if (is_function(/*onChange*/ ctx[10]())) /*onChange*/ ctx[10]().apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(input, "input", /*input_input_handler_1*/ ctx[30]),
    				listen_dev(input, "keypress", /*keypress_handler_1*/ ctx[31], false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*zoom*/ 128) {
    				set_style(input, "height", 1.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 128) {
    				set_style(input, "font-size", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty[0] & /*nodeData*/ 1) {
    				set_style(input, "color", /*nodeData*/ ctx[0].textcolor);
    			}

    			if (dirty[0] & /*zoom*/ 128) {
    				set_style(input, "border-radius", 0.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty[0] & /*nodeData*/ 1 && input.value !== /*nodeData*/ ctx[0].value) {
    				set_input_value(input, /*nodeData*/ ctx[0].value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(213:16) {#if nodeData.id == \\\"Text\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let main;
    	let div0;
    	let h1;
    	let t0_value = /*nodeData*/ ctx[0].id + "";
    	let t0;
    	let t1;
    	let div9;
    	let div6;
    	let div1;
    	let t2;
    	let div5;
    	let div4;
    	let div2;
    	let svg0;
    	let rect0;
    	let rect1;
    	let rect1_fill_value;
    	let svg0_style_value;
    	let t3;
    	let div3;
    	let p;
    	let t4;
    	let t5;
    	let div8;
    	let div7;
    	let t6;
    	let t7;
    	let div10;
    	let svg1;
    	let path_1;
    	let dispose;
    	let if_block0 = /*nodeData*/ ctx[0].id == "Number" && create_if_block_1$3(ctx);
    	let if_block1 = /*nodeData*/ ctx[0].id == "Text" && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			div9 = element("div");
    			div6 = element("div");
    			div1 = element("div");
    			t2 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div2 = element("div");
    			svg0 = svg_element("svg");
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			t3 = space();
    			div3 = element("div");
    			p = element("p");
    			t4 = text("Value");
    			t5 = space();
    			div8 = element("div");
    			div7 = element("div");
    			if (if_block0) if_block0.c();
    			t6 = space();
    			if (if_block1) if_block1.c();
    			t7 = space();
    			div10 = element("div");
    			svg1 = svg_element("svg");
    			path_1 = svg_element("path");
    			set_style(h1, "font-size", 1.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(h1, "margin-left", /*zoom*/ ctx[7] + "vh");
    			attr_dev(h1, "class", "svelte-uw54u");
    			add_location(h1, file$e, 139, 8, 3273);
    			attr_dev(div0, "class", "titleBar svelte-uw54u");
    			attr_dev(div0, "draggable", "true");
    			set_style(div0, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			set_style(div0, "background-color", /*nodeData*/ ctx[0].color);
    			add_location(div0, file$e, 121, 4, 2836);
    			set_style(div1, "padding-top", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div1, "class", "inputs svelte-uw54u");
    			add_location(div1, file$e, 148, 12, 3533);
    			attr_dev(rect0, "x", "2.5");
    			attr_dev(rect0, "y", "2.5");
    			attr_dev(rect0, "width", "10");
    			attr_dev(rect0, "height", "10");
    			attr_dev(rect0, "rx", "5");
    			attr_dev(rect0, "stroke", "#999999");
    			attr_dev(rect0, "stroke-dasharray", "2 2");
    			add_location(rect0, file$e, 177, 28, 4767);
    			attr_dev(rect1, "x", "5");
    			attr_dev(rect1, "y", "5");
    			attr_dev(rect1, "width", "5");
    			attr_dev(rect1, "height", "5");
    			attr_dev(rect1, "rx", "2.5");
    			attr_dev(rect1, "fill", rect1_fill_value = /*nodeData*/ ctx[0].color);
    			add_location(rect1, file$e, 178, 28, 4890);

    			attr_dev(svg0, "style", svg0_style_value = "\r\n                            width: " + 2 * /*zoom*/ ctx[7] + "vh;\r\n                            height: " + 2 * /*zoom*/ ctx[7] + "vh;\r\n                            " + (/*dragState*/ ctx[12] === 0
    			? "transform: scale(1.5) rotate(360deg);"
    			: "") + "\r\n                            transition: transform .5s cubic-bezier(0, 0, 0, .9);\r\n                        ");

    			attr_dev(svg0, "viewBox", "0 0 15 15");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file$e, 171, 24, 4357);
    			set_style(div2, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div2, "class", "outputTetherCircleContainer svelte-uw54u");
    			add_location(div2, file$e, 170, 20, 4263);
    			set_style(p, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(p, "color", /*nodeData*/ ctx[0].color);
    			attr_dev(p, "class", "svelte-uw54u");
    			add_location(p, file$e, 182, 24, 5111);
    			attr_dev(div3, "class", "outputTetherLabelContainer svelte-uw54u");
    			add_location(div3, file$e, 181, 20, 5045);
    			set_style(div4, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div4, "class", "outputTether svelte-uw54u");
    			attr_dev(div4, "draggable", "true");
    			add_location(div4, file$e, 155, 16, 3730);
    			set_style(div5, "padding-top", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div5, "class", "outputs svelte-uw54u");
    			add_location(div5, file$e, 153, 12, 3651);
    			attr_dev(div6, "class", "tetherContainer svelte-uw54u");
    			set_style(div6, "height", 4 * /*zoom*/ ctx[7] + "vh");
    			add_location(div6, file$e, 145, 8, 3438);
    			attr_dev(div7, "class", "setting svelte-uw54u");
    			add_location(div7, file$e, 193, 12, 5413);
    			attr_dev(div8, "class", "settingsContainer svelte-uw54u");
    			add_location(div8, file$e, 192, 8, 5368);
    			attr_dev(div9, "class", "contents svelte-uw54u");
    			add_location(div9, file$e, 144, 4, 3406);
    			attr_dev(path_1, "d", "M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z");
    			add_location(path_1, file$e, 246, 238, 7439);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 448 512");
    			attr_dev(svg1, "class", "svelte-uw54u");
    			add_location(svg1, file$e, 246, 8, 7209);
    			attr_dev(div10, "class", "deleteAction svelte-uw54u");
    			set_style(div10, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			set_style(div10, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			add_location(div10, file$e, 237, 4, 7022);
    			attr_dev(main, "class", "neuOutdentShadowRim svelte-uw54u");
    			set_style(main, "left", ((/*posX*/ ctx[1] + /*simX*/ ctx[5]) * /*zoom*/ ctx[7] + /*offX*/ ctx[3]) * 2 + "vh");
    			set_style(main, "top", ((/*posY*/ ctx[2] + /*simY*/ ctx[6]) * /*zoom*/ ctx[7] + /*offY*/ ctx[4]) * 2 + "vh");
    			set_style(main, "width", 2 * /*nodeData*/ ctx[0].width * /*zoom*/ ctx[7] + "vh");
    			set_style(main, "height", /*zoom*/ ctx[7] * 10 + "vh");
    			set_style(main, "border-radius", /*zoom*/ ctx[7] + "vh");
    			add_location(main, file$e, 112, 0, 2528);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(main, t1);
    			append_dev(main, div9);
    			append_dev(div9, div6);
    			append_dev(div6, div1);
    			append_dev(div6, t2);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, svg0);
    			append_dev(svg0, rect0);
    			append_dev(svg0, rect1);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, p);
    			append_dev(p, t4);
    			append_dev(div9, t5);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			if (if_block0) if_block0.m(div7, null);
    			append_dev(div7, t6);
    			if (if_block1) if_block1.m(div7, null);
    			append_dev(main, t7);
    			append_dev(main, div10);
    			append_dev(div10, svg1);
    			append_dev(svg1, path_1);

    			dispose = [
    				listen_dev(div0, "dragstart", /*drag*/ ctx[15], false, false, false),
    				listen_dev(div0, "dragend", /*dragend_handler*/ ctx[25], false, false, false),
    				listen_dev(div4, "dragstart", /*dragstart_handler*/ ctx[26], false, false, false),
    				listen_dev(div4, "dragend", /*dragend_handler_1*/ ctx[27], false, false, false),
    				listen_dev(div10, "click", /*handleDelete*/ ctx[16], false, false, false),
    				listen_dev(main, "mousedown", mousedown_handler$9, false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*nodeData*/ 1 && t0_value !== (t0_value = /*nodeData*/ ctx[0].id + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*zoom*/ 128) {
    				set_style(h1, "font-size", 1.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 128) {
    				set_style(h1, "margin-left", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 128) {
    				set_style(div0, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty[0] & /*nodeData*/ 1) {
    				set_style(div0, "background-color", /*nodeData*/ ctx[0].color);
    			}

    			if (dirty[0] & /*zoom*/ 128) {
    				set_style(div1, "padding-top", 0.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty[0] & /*nodeData*/ 1 && rect1_fill_value !== (rect1_fill_value = /*nodeData*/ ctx[0].color)) {
    				attr_dev(rect1, "fill", rect1_fill_value);
    			}

    			if (dirty[0] & /*zoom, dragState*/ 4224 && svg0_style_value !== (svg0_style_value = "\r\n                            width: " + 2 * /*zoom*/ ctx[7] + "vh;\r\n                            height: " + 2 * /*zoom*/ ctx[7] + "vh;\r\n                            " + (/*dragState*/ ctx[12] === 0
    			? "transform: scale(1.5) rotate(360deg);"
    			: "") + "\r\n                            transition: transform .5s cubic-bezier(0, 0, 0, .9);\r\n                        ")) {
    				attr_dev(svg0, "style", svg0_style_value);
    			}

    			if (dirty[0] & /*zoom*/ 128) {
    				set_style(div2, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 128) {
    				set_style(p, "font-size", /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty[0] & /*nodeData*/ 1) {
    				set_style(p, "color", /*nodeData*/ ctx[0].color);
    			}

    			if (dirty[0] & /*zoom*/ 128) {
    				set_style(div4, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 128) {
    				set_style(div5, "padding-top", 0.5 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 128) {
    				set_style(div6, "height", 4 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (/*nodeData*/ ctx[0].id == "Number") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					if_block0.m(div7, t6);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*nodeData*/ ctx[0].id == "Text") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					if_block1.m(div7, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty[0] & /*zoom*/ 128) {
    				set_style(div10, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 128) {
    				set_style(div10, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty[0] & /*posX, simX, zoom, offX*/ 170) {
    				set_style(main, "left", ((/*posX*/ ctx[1] + /*simX*/ ctx[5]) * /*zoom*/ ctx[7] + /*offX*/ ctx[3]) * 2 + "vh");
    			}

    			if (dirty[0] & /*posY, simY, zoom, offY*/ 212) {
    				set_style(main, "top", ((/*posY*/ ctx[2] + /*simY*/ ctx[6]) * /*zoom*/ ctx[7] + /*offY*/ ctx[4]) * 2 + "vh");
    			}

    			if (dirty[0] & /*nodeData, zoom*/ 129) {
    				set_style(main, "width", 2 * /*nodeData*/ ctx[0].width * /*zoom*/ ctx[7] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 128) {
    				set_style(main, "height", /*zoom*/ ctx[7] * 10 + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 128) {
    				set_style(main, "border-radius", /*zoom*/ ctx[7] + "vh");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function dragOver$4(event) {
    	event.preventDefault();
    	event.stopPropagation();
    }

    const mousedown_handler$9 = event => {
    	event.stopPropagation();
    };

    function instance$e($$self, $$props, $$invalidate) {
    	const path = require("path");
    	let { posX = 0 } = $$props;
    	let { posY = 0 } = $$props;
    	let { offX = 0 } = $$props;
    	let { offY = 0 } = $$props;
    	let { simX = 0 } = $$props;
    	let { simY = 0 } = $$props;
    	let { zoom = 1 } = $$props;
    	let { nodeData } = $$props;
    	let { context } = $$props;
    	let { tableData } = $$props;
    	let dragState = null;

    	function initConnectionDrag(event, id, index) {
    		// Clear default drag image
    		let imageOverride = document.createElement("img");

    		event.dataTransfer.setDragImage(imageOverride, 0, 0);
    		event.dataTransfer.setData("command", "connectNode");
    		event.dataTransfer.setData("outputID", id);
    		$$invalidate(12, dragState = index);
    	}

    	function clearDrag() {
    		$$invalidate(12, dragState = null);
    	}

    	let { connectionCallback } = $$props;

    	function handleConnect(event, index) {
    		event.preventDefault();
    		event.stopPropagation();
    		console.log("connected");

    		switch (event.dataTransfer.getData("command")) {
    			case "connectNode":
    				let outputId = event.dataTransfer.getData("outputID");
    				nodeObject.inputs[index].connect(outputId);
    				$$invalidate(0, nodeData.inputs[index] = outputId, nodeData);
    				connectionCallback(nodeData, outputId, index);
    				break;
    		}
    	}

    	let { onDrag } = $$props;
    	let { onDelete } = $$props;
    	let { onInitConnect } = $$props;
    	let { onConnectDrop } = $$props;

    	function drag(event) {
    		onDrag(event);
    	}

    	function handleDelete() {
    		delete context[outputID];
    		onDelete();
    	}

    	let { onChange } = $$props;
    	let { outputID } = $$props;

    	onMount(() => {
    		console.log("Input Node mounted with tether ID " + outputID);

    		let simObject = {
    			process,
    			"superNode": {
    				"rawNodeData": Object.assign(nodeData, { "outputs": [outputID] })
    			}
    		};

    		$$invalidate(17, context[outputID] = simObject, context);
    		console.log(context[outputID]);
    	});

    	function process() {
    		return new Promise(async (resolve, reject) => {
    				// Logic here
    				resolve(nodeData.value);
    			});
    	}

    	const writable_props = [
    		"posX",
    		"posY",
    		"offX",
    		"offY",
    		"simX",
    		"simY",
    		"zoom",
    		"nodeData",
    		"context",
    		"tableData",
    		"connectionCallback",
    		"onDrag",
    		"onDelete",
    		"onInitConnect",
    		"onConnectDrop",
    		"onChange",
    		"outputID"
    	];

    	Object_1$4.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$5.warn(`<LiteralNode> was created with unknown prop '${key}'`);
    	});

    	const dragend_handler = () => {
    		$$invalidate(0, nodeData.posX += nodeData.simX, nodeData);
    		$$invalidate(0, nodeData.posY += nodeData.simY, nodeData);
    		$$invalidate(0, nodeData.simX = 0, nodeData);
    		$$invalidate(0, nodeData.simY = 0, nodeData);
    		clearDrag();
    	};

    	const dragstart_handler = event => {
    		initConnectionDrag(event, outputID, 0);
    		onInitConnect(nodeData, 0);
    	};

    	const dragend_handler_1 = () => {
    		clearDrag();
    		onConnectDrop();
    	};

    	function input_input_handler() {
    		nodeData.value = to_number(this.value);
    		$$invalidate(0, nodeData);
    	}

    	const keypress_handler = event => {
    		if (event.key == "Enter") document.activeElement.blur();
    	};

    	function input_input_handler_1() {
    		nodeData.value = this.value;
    		$$invalidate(0, nodeData);
    	}

    	const keypress_handler_1 = event => {
    		if (event.key == "Enter") document.activeElement.blur();
    	};

    	$$self.$set = $$props => {
    		if ("posX" in $$props) $$invalidate(1, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(2, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(3, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(4, offY = $$props.offY);
    		if ("simX" in $$props) $$invalidate(5, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(6, simY = $$props.simY);
    		if ("zoom" in $$props) $$invalidate(7, zoom = $$props.zoom);
    		if ("nodeData" in $$props) $$invalidate(0, nodeData = $$props.nodeData);
    		if ("context" in $$props) $$invalidate(17, context = $$props.context);
    		if ("tableData" in $$props) $$invalidate(18, tableData = $$props.tableData);
    		if ("connectionCallback" in $$props) $$invalidate(19, connectionCallback = $$props.connectionCallback);
    		if ("onDrag" in $$props) $$invalidate(20, onDrag = $$props.onDrag);
    		if ("onDelete" in $$props) $$invalidate(21, onDelete = $$props.onDelete);
    		if ("onInitConnect" in $$props) $$invalidate(8, onInitConnect = $$props.onInitConnect);
    		if ("onConnectDrop" in $$props) $$invalidate(9, onConnectDrop = $$props.onConnectDrop);
    		if ("onChange" in $$props) $$invalidate(10, onChange = $$props.onChange);
    		if ("outputID" in $$props) $$invalidate(11, outputID = $$props.outputID);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		path,
    		posX,
    		posY,
    		offX,
    		offY,
    		simX,
    		simY,
    		zoom,
    		nodeData,
    		context,
    		tableData,
    		dragState,
    		initConnectionDrag,
    		clearDrag,
    		dragOver: dragOver$4,
    		connectionCallback,
    		handleConnect,
    		onDrag,
    		onDelete,
    		onInitConnect,
    		onConnectDrop,
    		drag,
    		handleDelete,
    		onChange,
    		outputID,
    		process,
    		require,
    		document,
    		console,
    		nodeObject,
    		Object,
    		Promise
    	});

    	$$self.$inject_state = $$props => {
    		if ("posX" in $$props) $$invalidate(1, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(2, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(3, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(4, offY = $$props.offY);
    		if ("simX" in $$props) $$invalidate(5, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(6, simY = $$props.simY);
    		if ("zoom" in $$props) $$invalidate(7, zoom = $$props.zoom);
    		if ("nodeData" in $$props) $$invalidate(0, nodeData = $$props.nodeData);
    		if ("context" in $$props) $$invalidate(17, context = $$props.context);
    		if ("tableData" in $$props) $$invalidate(18, tableData = $$props.tableData);
    		if ("dragState" in $$props) $$invalidate(12, dragState = $$props.dragState);
    		if ("connectionCallback" in $$props) $$invalidate(19, connectionCallback = $$props.connectionCallback);
    		if ("onDrag" in $$props) $$invalidate(20, onDrag = $$props.onDrag);
    		if ("onDelete" in $$props) $$invalidate(21, onDelete = $$props.onDelete);
    		if ("onInitConnect" in $$props) $$invalidate(8, onInitConnect = $$props.onInitConnect);
    		if ("onConnectDrop" in $$props) $$invalidate(9, onConnectDrop = $$props.onConnectDrop);
    		if ("onChange" in $$props) $$invalidate(10, onChange = $$props.onChange);
    		if ("outputID" in $$props) $$invalidate(11, outputID = $$props.outputID);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		nodeData,
    		posX,
    		posY,
    		offX,
    		offY,
    		simX,
    		simY,
    		zoom,
    		onInitConnect,
    		onConnectDrop,
    		onChange,
    		outputID,
    		dragState,
    		initConnectionDrag,
    		clearDrag,
    		drag,
    		handleDelete,
    		context,
    		tableData,
    		connectionCallback,
    		onDrag,
    		onDelete,
    		path,
    		handleConnect,
    		process,
    		dragend_handler,
    		dragstart_handler,
    		dragend_handler_1,
    		input_input_handler,
    		keypress_handler,
    		input_input_handler_1,
    		keypress_handler_1
    	];
    }

    class LiteralNode extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$e,
    			create_fragment$e,
    			safe_not_equal,
    			{
    				posX: 1,
    				posY: 2,
    				offX: 3,
    				offY: 4,
    				simX: 5,
    				simY: 6,
    				zoom: 7,
    				nodeData: 0,
    				context: 17,
    				tableData: 18,
    				connectionCallback: 19,
    				onDrag: 20,
    				onDelete: 21,
    				onInitConnect: 8,
    				onConnectDrop: 9,
    				onChange: 10,
    				outputID: 11
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LiteralNode",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nodeData*/ ctx[0] === undefined && !("nodeData" in props)) {
    			console_1$5.warn("<LiteralNode> was created without expected prop 'nodeData'");
    		}

    		if (/*context*/ ctx[17] === undefined && !("context" in props)) {
    			console_1$5.warn("<LiteralNode> was created without expected prop 'context'");
    		}

    		if (/*tableData*/ ctx[18] === undefined && !("tableData" in props)) {
    			console_1$5.warn("<LiteralNode> was created without expected prop 'tableData'");
    		}

    		if (/*connectionCallback*/ ctx[19] === undefined && !("connectionCallback" in props)) {
    			console_1$5.warn("<LiteralNode> was created without expected prop 'connectionCallback'");
    		}

    		if (/*onDrag*/ ctx[20] === undefined && !("onDrag" in props)) {
    			console_1$5.warn("<LiteralNode> was created without expected prop 'onDrag'");
    		}

    		if (/*onDelete*/ ctx[21] === undefined && !("onDelete" in props)) {
    			console_1$5.warn("<LiteralNode> was created without expected prop 'onDelete'");
    		}

    		if (/*onInitConnect*/ ctx[8] === undefined && !("onInitConnect" in props)) {
    			console_1$5.warn("<LiteralNode> was created without expected prop 'onInitConnect'");
    		}

    		if (/*onConnectDrop*/ ctx[9] === undefined && !("onConnectDrop" in props)) {
    			console_1$5.warn("<LiteralNode> was created without expected prop 'onConnectDrop'");
    		}

    		if (/*onChange*/ ctx[10] === undefined && !("onChange" in props)) {
    			console_1$5.warn("<LiteralNode> was created without expected prop 'onChange'");
    		}

    		if (/*outputID*/ ctx[11] === undefined && !("outputID" in props)) {
    			console_1$5.warn("<LiteralNode> was created without expected prop 'outputID'");
    		}
    	}

    	get posX() {
    		throw new Error("<LiteralNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set posX(value) {
    		throw new Error("<LiteralNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get posY() {
    		throw new Error("<LiteralNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set posY(value) {
    		throw new Error("<LiteralNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offX() {
    		throw new Error("<LiteralNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offX(value) {
    		throw new Error("<LiteralNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offY() {
    		throw new Error("<LiteralNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offY(value) {
    		throw new Error("<LiteralNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simX() {
    		throw new Error("<LiteralNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simX(value) {
    		throw new Error("<LiteralNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simY() {
    		throw new Error("<LiteralNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simY(value) {
    		throw new Error("<LiteralNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zoom() {
    		throw new Error("<LiteralNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zoom(value) {
    		throw new Error("<LiteralNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nodeData() {
    		throw new Error("<LiteralNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nodeData(value) {
    		throw new Error("<LiteralNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get context() {
    		throw new Error("<LiteralNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set context(value) {
    		throw new Error("<LiteralNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tableData() {
    		throw new Error("<LiteralNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tableData(value) {
    		throw new Error("<LiteralNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get connectionCallback() {
    		throw new Error("<LiteralNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set connectionCallback(value) {
    		throw new Error("<LiteralNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDrag() {
    		throw new Error("<LiteralNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDrag(value) {
    		throw new Error("<LiteralNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDelete() {
    		throw new Error("<LiteralNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDelete(value) {
    		throw new Error("<LiteralNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onInitConnect() {
    		throw new Error("<LiteralNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onInitConnect(value) {
    		throw new Error("<LiteralNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onConnectDrop() {
    		throw new Error("<LiteralNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onConnectDrop(value) {
    		throw new Error("<LiteralNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onChange() {
    		throw new Error("<LiteralNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onChange(value) {
    		throw new Error("<LiteralNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outputID() {
    		throw new Error("<LiteralNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outputID(value) {
    		throw new Error("<LiteralNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\NodeEditor\AnnotationNode.svelte generated by Svelte v3.19.1 */

    const file$f = "src\\NodeEditor\\AnnotationNode.svelte";

    function create_fragment$f(ctx) {
    	let main;
    	let div0;
    	let svg0;
    	let path0;
    	let t0;
    	let div1;
    	let p;
    	let t1;
    	let div2;
    	let svg1;
    	let path1;
    	let t2;
    	let div3;
    	let svg2;
    	let path2;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			t1 = space();
    			div2 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t2 = space();
    			div3 = element("div");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			attr_dev(path0, "d", "M278.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l9.4-9.4V224H109.3l9.4-9.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-9.4-9.4H224V402.7l-9.4-9.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-9.4 9.4V288H402.7l-9.4 9.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l9.4 9.4H288V109.3l9.4 9.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-64-64z");
    			add_location(path0, file$f, 69, 238, 1828);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 512 512");
    			attr_dev(svg0, "class", "svelte-36byt6");
    			add_location(svg0, file$f, 69, 8, 1598);
    			attr_dev(div0, "class", "dragHandle svelte-36byt6");
    			attr_dev(div0, "draggable", "true");
    			set_style(div0, "width", 3 * /*zoom*/ ctx[9] + "vh");
    			set_style(div0, "height", 3 * /*zoom*/ ctx[9] + "vh");
    			add_location(div0, file$f, 52, 4, 1202);
    			attr_dev(p, "contenteditable", "plaintext-only");
    			set_style(p, "font-size", 2 * /*zoom*/ ctx[9] + "vh");
    			set_style(p, "min-height", 2 * /*zoom*/ ctx[9] + "vh");
    			set_style(p, "min-width", /*sizeX*/ ctx[10] * /*zoom*/ ctx[9] + "vh");
    			attr_dev(p, "class", "svelte-36byt6");
    			if (/*text*/ ctx[1] === void 0) add_render_callback(() => /*p_input_handler*/ ctx[22].call(p));
    			add_location(p, file$f, 72, 8, 2537);
    			attr_dev(div1, "class", "contents svelte-36byt6");
    			add_location(div1, file$f, 71, 4, 2505);
    			attr_dev(path1, "d", "M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z");
    			add_location(path1, file$f, 92, 238, 3204);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 448 512");
    			attr_dev(svg1, "class", "svelte-36byt6");
    			add_location(svg1, file$f, 92, 8, 2974);
    			attr_dev(div2, "class", "deleteAction svelte-36byt6");
    			set_style(div2, "width", 3 * /*zoom*/ ctx[9] + "vh");
    			set_style(div2, "height", 3 * /*zoom*/ ctx[9] + "vh");
    			add_location(div2, file$f, 83, 4, 2787);
    			attr_dev(path2, "d", "M32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z");
    			add_location(path2, file$f, 105, 238, 3937);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "viewBox", "0 0 448 512");
    			attr_dev(svg2, "class", "svelte-36byt6");
    			add_location(svg2, file$f, 105, 8, 3707);
    			attr_dev(div3, "class", "resizeHandle svelte-36byt6");
    			attr_dev(div3, "draggable", "true");
    			set_style(div3, "width", 3 * /*zoom*/ ctx[9] + "vh");
    			set_style(div3, "height", 3 * /*zoom*/ ctx[9] + "vh");
    			add_location(div3, file$f, 95, 4, 3496);
    			attr_dev(main, "class", "neuOutdentShadowRim svelte-36byt6");
    			set_style(main, "left", ((/*posX*/ ctx[3] + /*simX*/ ctx[7]) * /*zoom*/ ctx[9] + /*offX*/ ctx[5]) * 2 + "vh");
    			set_style(main, "top", ((/*posY*/ ctx[4] + /*simY*/ ctx[8]) * /*zoom*/ ctx[9] + /*offY*/ ctx[6]) * 2 + "vh");
    			set_style(main, "width", Math.max(/*sizeBounds*/ ctx[2][0][0], Math.min(/*sizeX*/ ctx[10] + /*simResizeX*/ ctx[12], /*sizeBounds*/ ctx[2][0][1])) * 2 * /*zoom*/ ctx[9] + "vh");
    			set_style(main, "height", Math.max(/*sizeBounds*/ ctx[2][1][0], Math.min(/*sizeY*/ ctx[11] + /*simResizeY*/ ctx[13], /*sizeBounds*/ ctx[2][1][1])) * 2 * /*zoom*/ ctx[9] + "vh");
    			set_style(main, "border-radius", /*zoom*/ ctx[9] + "vh");
    			add_location(main, file$f, 43, 0, 754);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, svg0);
    			append_dev(svg0, path0);
    			append_dev(main, t0);
    			append_dev(main, div1);
    			append_dev(div1, p);

    			if (/*text*/ ctx[1] !== void 0) {
    				p.innerHTML = /*text*/ ctx[1];
    			}

    			append_dev(main, t1);
    			append_dev(main, div2);
    			append_dev(div2, svg1);
    			append_dev(svg1, path1);
    			append_dev(main, t2);
    			append_dev(main, div3);
    			append_dev(div3, svg2);
    			append_dev(svg2, path2);

    			dispose = [
    				listen_dev(div0, "dragstart", /*drag*/ ctx[14], false, false, false),
    				listen_dev(div0, "dragend", /*dragend_handler*/ ctx[21], false, false, false),
    				listen_dev(p, "input", /*p_input_handler*/ ctx[22]),
    				listen_dev(div2, "click", /*handleDelete*/ ctx[15], false, false, false),
    				listen_dev(div3, "dragstart", /*handleResize*/ ctx[16], false, false, false),
    				listen_dev(main, "mousedown", mousedown_handler$a, false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*zoom*/ 512) {
    				set_style(div0, "width", 3 * /*zoom*/ ctx[9] + "vh");
    			}

    			if (dirty & /*zoom*/ 512) {
    				set_style(div0, "height", 3 * /*zoom*/ ctx[9] + "vh");
    			}

    			if (dirty & /*zoom*/ 512) {
    				set_style(p, "font-size", 2 * /*zoom*/ ctx[9] + "vh");
    			}

    			if (dirty & /*zoom*/ 512) {
    				set_style(p, "min-height", 2 * /*zoom*/ ctx[9] + "vh");
    			}

    			if (dirty & /*sizeX, zoom*/ 1536) {
    				set_style(p, "min-width", /*sizeX*/ ctx[10] * /*zoom*/ ctx[9] + "vh");
    			}

    			if (dirty & /*text*/ 2 && /*text*/ ctx[1] !== p.innerHTML) {
    				p.innerHTML = /*text*/ ctx[1];
    			}

    			if (dirty & /*zoom*/ 512) {
    				set_style(div2, "width", 3 * /*zoom*/ ctx[9] + "vh");
    			}

    			if (dirty & /*zoom*/ 512) {
    				set_style(div2, "height", 3 * /*zoom*/ ctx[9] + "vh");
    			}

    			if (dirty & /*zoom*/ 512) {
    				set_style(div3, "width", 3 * /*zoom*/ ctx[9] + "vh");
    			}

    			if (dirty & /*zoom*/ 512) {
    				set_style(div3, "height", 3 * /*zoom*/ ctx[9] + "vh");
    			}

    			if (dirty & /*posX, simX, zoom, offX*/ 680) {
    				set_style(main, "left", ((/*posX*/ ctx[3] + /*simX*/ ctx[7]) * /*zoom*/ ctx[9] + /*offX*/ ctx[5]) * 2 + "vh");
    			}

    			if (dirty & /*posY, simY, zoom, offY*/ 848) {
    				set_style(main, "top", ((/*posY*/ ctx[4] + /*simY*/ ctx[8]) * /*zoom*/ ctx[9] + /*offY*/ ctx[6]) * 2 + "vh");
    			}

    			if (dirty & /*sizeX, simResizeX, zoom*/ 5632) {
    				set_style(main, "width", Math.max(/*sizeBounds*/ ctx[2][0][0], Math.min(/*sizeX*/ ctx[10] + /*simResizeX*/ ctx[12], /*sizeBounds*/ ctx[2][0][1])) * 2 * /*zoom*/ ctx[9] + "vh");
    			}

    			if (dirty & /*sizeY, simResizeY, zoom*/ 10752) {
    				set_style(main, "height", Math.max(/*sizeBounds*/ ctx[2][1][0], Math.min(/*sizeY*/ ctx[11] + /*simResizeY*/ ctx[13], /*sizeBounds*/ ctx[2][1][1])) * 2 * /*zoom*/ ctx[9] + "vh");
    			}

    			if (dirty & /*zoom*/ 512) {
    				set_style(main, "border-radius", /*zoom*/ ctx[9] + "vh");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const mousedown_handler$a = event => {
    	event.stopPropagation();
    };

    function instance$f($$self, $$props, $$invalidate) {
    	const path = require("path");
    	const sizeBounds = [/* X */ [5, 30], [5, 30]]; /* Y */
    	let { posX = 0 } = $$props;
    	let { posY = 0 } = $$props;
    	let { offX = 0 } = $$props;
    	let { offY = 0 } = $$props;
    	let { simX = 0 } = $$props;
    	let { simY = 0 } = $$props;
    	let { zoom = 1 } = $$props;
    	let { nodeData } = $$props;
    	let { onDrag } = $$props;
    	let { onDelete } = $$props;

    	function drag(event) {
    		onDrag(event);
    	}

    	function handleDelete() {
    		onDelete();
    	}

    	function handleResize(event) {
    		onResize(event);
    	}

    	let { text } = $$props;
    	let { sizeX = 5 } = $$props;
    	let { sizeY = 2 } = $$props;
    	let { simResizeX } = $$props;
    	let { simResizeY } = $$props;
    	let { onResize } = $$props;

    	const writable_props = [
    		"posX",
    		"posY",
    		"offX",
    		"offY",
    		"simX",
    		"simY",
    		"zoom",
    		"nodeData",
    		"onDrag",
    		"onDelete",
    		"text",
    		"sizeX",
    		"sizeY",
    		"simResizeX",
    		"simResizeY",
    		"onResize"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AnnotationNode> was created with unknown prop '${key}'`);
    	});

    	const dragend_handler = () => {
    		$$invalidate(0, nodeData.posX += nodeData.simX, nodeData);
    		$$invalidate(0, nodeData.posY += nodeData.simY, nodeData);
    		$$invalidate(0, nodeData.simX = 0, nodeData);
    		$$invalidate(0, nodeData.simY = 0, nodeData);
    	};

    	function p_input_handler() {
    		text = this.innerHTML;
    		$$invalidate(1, text);
    	}

    	$$self.$set = $$props => {
    		if ("posX" in $$props) $$invalidate(3, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(4, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(5, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(6, offY = $$props.offY);
    		if ("simX" in $$props) $$invalidate(7, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(8, simY = $$props.simY);
    		if ("zoom" in $$props) $$invalidate(9, zoom = $$props.zoom);
    		if ("nodeData" in $$props) $$invalidate(0, nodeData = $$props.nodeData);
    		if ("onDrag" in $$props) $$invalidate(17, onDrag = $$props.onDrag);
    		if ("onDelete" in $$props) $$invalidate(18, onDelete = $$props.onDelete);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("sizeX" in $$props) $$invalidate(10, sizeX = $$props.sizeX);
    		if ("sizeY" in $$props) $$invalidate(11, sizeY = $$props.sizeY);
    		if ("simResizeX" in $$props) $$invalidate(12, simResizeX = $$props.simResizeX);
    		if ("simResizeY" in $$props) $$invalidate(13, simResizeY = $$props.simResizeY);
    		if ("onResize" in $$props) $$invalidate(19, onResize = $$props.onResize);
    	};

    	$$self.$capture_state = () => ({
    		path,
    		sizeBounds,
    		posX,
    		posY,
    		offX,
    		offY,
    		simX,
    		simY,
    		zoom,
    		nodeData,
    		onDrag,
    		onDelete,
    		drag,
    		handleDelete,
    		handleResize,
    		text,
    		sizeX,
    		sizeY,
    		simResizeX,
    		simResizeY,
    		onResize,
    		require
    	});

    	$$self.$inject_state = $$props => {
    		if ("posX" in $$props) $$invalidate(3, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(4, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(5, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(6, offY = $$props.offY);
    		if ("simX" in $$props) $$invalidate(7, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(8, simY = $$props.simY);
    		if ("zoom" in $$props) $$invalidate(9, zoom = $$props.zoom);
    		if ("nodeData" in $$props) $$invalidate(0, nodeData = $$props.nodeData);
    		if ("onDrag" in $$props) $$invalidate(17, onDrag = $$props.onDrag);
    		if ("onDelete" in $$props) $$invalidate(18, onDelete = $$props.onDelete);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("sizeX" in $$props) $$invalidate(10, sizeX = $$props.sizeX);
    		if ("sizeY" in $$props) $$invalidate(11, sizeY = $$props.sizeY);
    		if ("simResizeX" in $$props) $$invalidate(12, simResizeX = $$props.simResizeX);
    		if ("simResizeY" in $$props) $$invalidate(13, simResizeY = $$props.simResizeY);
    		if ("onResize" in $$props) $$invalidate(19, onResize = $$props.onResize);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		nodeData,
    		text,
    		sizeBounds,
    		posX,
    		posY,
    		offX,
    		offY,
    		simX,
    		simY,
    		zoom,
    		sizeX,
    		sizeY,
    		simResizeX,
    		simResizeY,
    		drag,
    		handleDelete,
    		handleResize,
    		onDrag,
    		onDelete,
    		onResize,
    		path,
    		dragend_handler,
    		p_input_handler
    	];
    }

    class AnnotationNode extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			sizeBounds: 2,
    			posX: 3,
    			posY: 4,
    			offX: 5,
    			offY: 6,
    			simX: 7,
    			simY: 8,
    			zoom: 9,
    			nodeData: 0,
    			onDrag: 17,
    			onDelete: 18,
    			text: 1,
    			sizeX: 10,
    			sizeY: 11,
    			simResizeX: 12,
    			simResizeY: 13,
    			onResize: 19
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AnnotationNode",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nodeData*/ ctx[0] === undefined && !("nodeData" in props)) {
    			console.warn("<AnnotationNode> was created without expected prop 'nodeData'");
    		}

    		if (/*onDrag*/ ctx[17] === undefined && !("onDrag" in props)) {
    			console.warn("<AnnotationNode> was created without expected prop 'onDrag'");
    		}

    		if (/*onDelete*/ ctx[18] === undefined && !("onDelete" in props)) {
    			console.warn("<AnnotationNode> was created without expected prop 'onDelete'");
    		}

    		if (/*text*/ ctx[1] === undefined && !("text" in props)) {
    			console.warn("<AnnotationNode> was created without expected prop 'text'");
    		}

    		if (/*simResizeX*/ ctx[12] === undefined && !("simResizeX" in props)) {
    			console.warn("<AnnotationNode> was created without expected prop 'simResizeX'");
    		}

    		if (/*simResizeY*/ ctx[13] === undefined && !("simResizeY" in props)) {
    			console.warn("<AnnotationNode> was created without expected prop 'simResizeY'");
    		}

    		if (/*onResize*/ ctx[19] === undefined && !("onResize" in props)) {
    			console.warn("<AnnotationNode> was created without expected prop 'onResize'");
    		}
    	}

    	get sizeBounds() {
    		return this.$$.ctx[2];
    	}

    	set sizeBounds(value) {
    		throw new Error("<AnnotationNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get posX() {
    		throw new Error("<AnnotationNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set posX(value) {
    		throw new Error("<AnnotationNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get posY() {
    		throw new Error("<AnnotationNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set posY(value) {
    		throw new Error("<AnnotationNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offX() {
    		throw new Error("<AnnotationNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offX(value) {
    		throw new Error("<AnnotationNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offY() {
    		throw new Error("<AnnotationNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offY(value) {
    		throw new Error("<AnnotationNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simX() {
    		throw new Error("<AnnotationNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simX(value) {
    		throw new Error("<AnnotationNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simY() {
    		throw new Error("<AnnotationNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simY(value) {
    		throw new Error("<AnnotationNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zoom() {
    		throw new Error("<AnnotationNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zoom(value) {
    		throw new Error("<AnnotationNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nodeData() {
    		throw new Error("<AnnotationNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nodeData(value) {
    		throw new Error("<AnnotationNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDrag() {
    		throw new Error("<AnnotationNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDrag(value) {
    		throw new Error("<AnnotationNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onDelete() {
    		throw new Error("<AnnotationNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onDelete(value) {
    		throw new Error("<AnnotationNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<AnnotationNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<AnnotationNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sizeX() {
    		throw new Error("<AnnotationNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sizeX(value) {
    		throw new Error("<AnnotationNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sizeY() {
    		throw new Error("<AnnotationNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sizeY(value) {
    		throw new Error("<AnnotationNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simResizeX() {
    		throw new Error("<AnnotationNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simResizeX(value) {
    		throw new Error("<AnnotationNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simResizeY() {
    		throw new Error("<AnnotationNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simResizeY(value) {
    		throw new Error("<AnnotationNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onResize() {
    		throw new Error("<AnnotationNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onResize(value) {
    		throw new Error("<AnnotationNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\NodeEditor\NodeEditor.svelte generated by Svelte v3.19.1 */

    const { Object: Object_1$5, console: console_1$6 } = globals;
    const file$g = "src\\NodeEditor\\NodeEditor.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[79] = list[i];
    	child_ctx[81] = i;
    	return child_ctx;
    }

    function get_each_context_2$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[83] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[79] = list[i];
    	child_ctx[81] = i;
    	return child_ctx;
    }

    function get_each_context_3$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[86] = list[i];
    	child_ctx[81] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[88] = list[i];
    	child_ctx[89] = list;
    	child_ctx[81] = i;
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[88] = list[i];
    	child_ctx[81] = i;
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[88] = list[i];
    	child_ctx[81] = i;
    	return child_ctx;
    }

    function get_each_context_7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[88] = list[i];
    	child_ctx[81] = i;
    	return child_ctx;
    }

    function get_each_context_8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[88] = list[i];
    	child_ctx[81] = i;
    	return child_ctx;
    }

    function get_each_context_9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[88] = list[i];
    	child_ctx[94] = list;
    	child_ctx[81] = i;
    	return child_ctx;
    }

    // (664:12) {#if node}
    function create_if_block_6$1(ctx) {
    	let updating_nodeObject;
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[47](/*index*/ ctx[81], ...args);
    	}

    	function func_1(...args) {
    		return /*func_1*/ ctx[48](/*index*/ ctx[81], ...args);
    	}

    	function node_nodeObject_binding(value) {
    		/*node_nodeObject_binding*/ ctx[50].call(null, value, /*node*/ ctx[88]);
    	}

    	let node_props = {
    		onDrag: func,
    		onDelete: func_1,
    		posX: /*node*/ ctx[88].posX,
    		posY: /*node*/ ctx[88].posY,
    		offX: (/*viewX*/ ctx[5] + /*mouseDrag*/ ctx[12].delta.x) / window.innerHeight * 50,
    		offY: (/*viewY*/ ctx[6] + /*mouseDrag*/ ctx[12].delta.y) / window.innerHeight * 50,
    		simX: /*node*/ ctx[88].simX,
    		simY: /*node*/ ctx[88].simY,
    		zoom: /*viewZoom*/ ctx[7],
    		nodeData: /*node*/ ctx[88],
    		context: /*context*/ ctx[11],
    		onInitConnect: /*initSimConnection*/ ctx[27],
    		onConnectDrop: /*terminateSimConnection*/ ctx[28],
    		connectionCallback: /*func_2*/ ctx[49]
    	};

    	if (/*node*/ ctx[88].reference !== void 0) {
    		node_props.nodeObject = /*node*/ ctx[88].reference;
    	}

    	const node = new Node({ props: node_props, $$inline: true });
    	binding_callbacks.push(() => bind(node, "nodeObject", node_nodeObject_binding));

    	const block = {
    		c: function create() {
    			create_component(node.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(node, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const node_changes = {};
    			if (dirty[0] & /*nodeData*/ 1) node_changes.posX = /*node*/ ctx[88].posX;
    			if (dirty[0] & /*nodeData*/ 1) node_changes.posY = /*node*/ ctx[88].posY;
    			if (dirty[0] & /*viewX, mouseDrag*/ 4128) node_changes.offX = (/*viewX*/ ctx[5] + /*mouseDrag*/ ctx[12].delta.x) / window.innerHeight * 50;
    			if (dirty[0] & /*viewY, mouseDrag*/ 4160) node_changes.offY = (/*viewY*/ ctx[6] + /*mouseDrag*/ ctx[12].delta.y) / window.innerHeight * 50;
    			if (dirty[0] & /*nodeData*/ 1) node_changes.simX = /*node*/ ctx[88].simX;
    			if (dirty[0] & /*nodeData*/ 1) node_changes.simY = /*node*/ ctx[88].simY;
    			if (dirty[0] & /*viewZoom*/ 128) node_changes.zoom = /*viewZoom*/ ctx[7];
    			if (dirty[0] & /*nodeData*/ 1) node_changes.nodeData = /*node*/ ctx[88];
    			if (dirty[0] & /*context*/ 2048) node_changes.context = /*context*/ ctx[11];

    			if (!updating_nodeObject && dirty[0] & /*nodeData*/ 1) {
    				updating_nodeObject = true;
    				node_changes.nodeObject = /*node*/ ctx[88].reference;
    				add_flush_callback(() => updating_nodeObject = false);
    			}

    			node.$set(node_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(node.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(node.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(node, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(664:12) {#if node}",
    		ctx
    	});

    	return block;
    }

    // (663:8) {#each nodeData.operator as node, index}
    function create_each_block_9(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*node*/ ctx[88] && create_if_block_6$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*node*/ ctx[88]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_6$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_9.name,
    		type: "each",
    		source: "(663:8) {#each nodeData.operator as node, index}",
    		ctx
    	});

    	return block;
    }

    // (694:12) {#if node}
    function create_if_block_5$1(ctx) {
    	let current;

    	function func_3(...args) {
    		return /*func_3*/ ctx[51](/*index*/ ctx[81], ...args);
    	}

    	function func_4(...args) {
    		return /*func_4*/ ctx[52](/*index*/ ctx[81], ...args);
    	}

    	const literalnode = new LiteralNode({
    			props: {
    				onDrag: func_3,
    				onDelete: func_4,
    				onChange: /*invokeOutputs*/ ctx[4],
    				posX: /*node*/ ctx[88].posX,
    				posY: /*node*/ ctx[88].posY,
    				offX: (/*viewX*/ ctx[5] + /*mouseDrag*/ ctx[12].delta.x) / window.innerHeight * 50,
    				offY: (/*viewY*/ ctx[6] + /*mouseDrag*/ ctx[12].delta.y) / window.innerHeight * 50,
    				simX: /*node*/ ctx[88].simX,
    				simY: /*node*/ ctx[88].simY,
    				zoom: /*viewZoom*/ ctx[7],
    				outputID: /*node*/ ctx[88].outputID,
    				nodeData: /*node*/ ctx[88],
    				context: /*context*/ ctx[11],
    				onInitConnect: /*initSimConnection*/ ctx[27],
    				onConnectDrop: /*terminateSimConnection*/ ctx[28],
    				connectionCallback: /*recalculateConnections*/ ctx[29]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(literalnode.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(literalnode, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const literalnode_changes = {};
    			if (dirty[0] & /*nodeData*/ 1) literalnode_changes.posX = /*node*/ ctx[88].posX;
    			if (dirty[0] & /*nodeData*/ 1) literalnode_changes.posY = /*node*/ ctx[88].posY;
    			if (dirty[0] & /*viewX, mouseDrag*/ 4128) literalnode_changes.offX = (/*viewX*/ ctx[5] + /*mouseDrag*/ ctx[12].delta.x) / window.innerHeight * 50;
    			if (dirty[0] & /*viewY, mouseDrag*/ 4160) literalnode_changes.offY = (/*viewY*/ ctx[6] + /*mouseDrag*/ ctx[12].delta.y) / window.innerHeight * 50;
    			if (dirty[0] & /*nodeData*/ 1) literalnode_changes.simX = /*node*/ ctx[88].simX;
    			if (dirty[0] & /*nodeData*/ 1) literalnode_changes.simY = /*node*/ ctx[88].simY;
    			if (dirty[0] & /*viewZoom*/ 128) literalnode_changes.zoom = /*viewZoom*/ ctx[7];
    			if (dirty[0] & /*nodeData*/ 1) literalnode_changes.outputID = /*node*/ ctx[88].outputID;
    			if (dirty[0] & /*nodeData*/ 1) literalnode_changes.nodeData = /*node*/ ctx[88];
    			if (dirty[0] & /*context*/ 2048) literalnode_changes.context = /*context*/ ctx[11];
    			literalnode.$set(literalnode_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(literalnode.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(literalnode.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(literalnode, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(694:12) {#if node}",
    		ctx
    	});

    	return block;
    }

    // (693:8) {#each nodeData.literal as node, index}
    function create_each_block_8(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*node*/ ctx[88] && create_if_block_5$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*node*/ ctx[88]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_5$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_8.name,
    		type: "each",
    		source: "(693:8) {#each nodeData.literal as node, index}",
    		ctx
    	});

    	return block;
    }

    // (723:12) {#if node}
    function create_if_block_4$1(ctx) {
    	let current;

    	function func_5(...args) {
    		return /*func_5*/ ctx[53](/*index*/ ctx[81], ...args);
    	}

    	function func_6(...args) {
    		return /*func_6*/ ctx[54](/*index*/ ctx[81], ...args);
    	}

    	const inputnode = new InputNode({
    			props: {
    				onDrag: func_5,
    				onDelete: func_6,
    				posX: /*node*/ ctx[88].posX,
    				posY: /*node*/ ctx[88].posY,
    				offX: (/*viewX*/ ctx[5] + /*mouseDrag*/ ctx[12].delta.x) / window.innerHeight * 50,
    				offY: (/*viewY*/ ctx[6] + /*mouseDrag*/ ctx[12].delta.y) / window.innerHeight * 50,
    				simX: /*node*/ ctx[88].simX,
    				simY: /*node*/ ctx[88].simY,
    				zoom: /*viewZoom*/ ctx[7],
    				outputID: /*node*/ ctx[88].outputID,
    				nodeData: /*node*/ ctx[88],
    				context: /*context*/ ctx[11],
    				tableRef: /*tableRef*/ ctx[2],
    				tableData: /*tableData*/ ctx[3],
    				onInitConnect: /*initSimConnection*/ ctx[27],
    				onConnectDrop: /*terminateSimConnection*/ ctx[28],
    				connectionCallback: /*addConnection*/ ctx[30]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(inputnode.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(inputnode, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const inputnode_changes = {};
    			if (dirty[0] & /*nodeData*/ 1) inputnode_changes.posX = /*node*/ ctx[88].posX;
    			if (dirty[0] & /*nodeData*/ 1) inputnode_changes.posY = /*node*/ ctx[88].posY;
    			if (dirty[0] & /*viewX, mouseDrag*/ 4128) inputnode_changes.offX = (/*viewX*/ ctx[5] + /*mouseDrag*/ ctx[12].delta.x) / window.innerHeight * 50;
    			if (dirty[0] & /*viewY, mouseDrag*/ 4160) inputnode_changes.offY = (/*viewY*/ ctx[6] + /*mouseDrag*/ ctx[12].delta.y) / window.innerHeight * 50;
    			if (dirty[0] & /*nodeData*/ 1) inputnode_changes.simX = /*node*/ ctx[88].simX;
    			if (dirty[0] & /*nodeData*/ 1) inputnode_changes.simY = /*node*/ ctx[88].simY;
    			if (dirty[0] & /*viewZoom*/ 128) inputnode_changes.zoom = /*viewZoom*/ ctx[7];
    			if (dirty[0] & /*nodeData*/ 1) inputnode_changes.outputID = /*node*/ ctx[88].outputID;
    			if (dirty[0] & /*nodeData*/ 1) inputnode_changes.nodeData = /*node*/ ctx[88];
    			if (dirty[0] & /*context*/ 2048) inputnode_changes.context = /*context*/ ctx[11];
    			if (dirty[0] & /*tableRef*/ 4) inputnode_changes.tableRef = /*tableRef*/ ctx[2];
    			if (dirty[0] & /*tableData*/ 8) inputnode_changes.tableData = /*tableData*/ ctx[3];
    			inputnode.$set(inputnode_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputnode.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputnode.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(inputnode, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(723:12) {#if node}",
    		ctx
    	});

    	return block;
    }

    // (722:8) {#each nodeData.input as node, index}
    function create_each_block_7(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*node*/ ctx[88] && create_if_block_4$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*node*/ ctx[88]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_4$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_7.name,
    		type: "each",
    		source: "(722:8) {#each nodeData.input as node, index}",
    		ctx
    	});

    	return block;
    }

    // (753:12) {#if node}
    function create_if_block_3$1(ctx) {
    	let updating_process;
    	let current;

    	function func_7(...args) {
    		return /*func_7*/ ctx[55](/*index*/ ctx[81], ...args);
    	}

    	function func_8(...args) {
    		return /*func_8*/ ctx[56](/*index*/ ctx[81], ...args);
    	}

    	function outputnode_process_binding(value) {
    		/*outputnode_process_binding*/ ctx[58].call(null, value, /*index*/ ctx[81]);
    	}

    	let outputnode_props = {
    		onDrag: func_7,
    		onDelete: func_8,
    		posX: /*node*/ ctx[88].posX,
    		posY: /*node*/ ctx[88].posY,
    		offX: (/*viewX*/ ctx[5] + /*mouseDrag*/ ctx[12].delta.x) / window.innerHeight * 50,
    		offY: (/*viewY*/ ctx[6] + /*mouseDrag*/ ctx[12].delta.y) / window.innerHeight * 50,
    		simX: /*node*/ ctx[88].simX,
    		simY: /*node*/ ctx[88].simY,
    		zoom: /*viewZoom*/ ctx[7],
    		nodeData: /*node*/ ctx[88],
    		context: /*context*/ ctx[11],
    		tableData: /*tableData*/ ctx[3],
    		connectionCallback: /*func_9*/ ctx[57]
    	};

    	if (/*outputProcessCallbacks*/ ctx[17][/*index*/ ctx[81]] !== void 0) {
    		outputnode_props.process = /*outputProcessCallbacks*/ ctx[17][/*index*/ ctx[81]];
    	}

    	const outputnode = new OutputNode({ props: outputnode_props, $$inline: true });
    	binding_callbacks.push(() => bind(outputnode, "process", outputnode_process_binding));

    	const block = {
    		c: function create() {
    			create_component(outputnode.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(outputnode, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const outputnode_changes = {};
    			if (dirty[0] & /*nodeData*/ 1) outputnode_changes.posX = /*node*/ ctx[88].posX;
    			if (dirty[0] & /*nodeData*/ 1) outputnode_changes.posY = /*node*/ ctx[88].posY;
    			if (dirty[0] & /*viewX, mouseDrag*/ 4128) outputnode_changes.offX = (/*viewX*/ ctx[5] + /*mouseDrag*/ ctx[12].delta.x) / window.innerHeight * 50;
    			if (dirty[0] & /*viewY, mouseDrag*/ 4160) outputnode_changes.offY = (/*viewY*/ ctx[6] + /*mouseDrag*/ ctx[12].delta.y) / window.innerHeight * 50;
    			if (dirty[0] & /*nodeData*/ 1) outputnode_changes.simX = /*node*/ ctx[88].simX;
    			if (dirty[0] & /*nodeData*/ 1) outputnode_changes.simY = /*node*/ ctx[88].simY;
    			if (dirty[0] & /*viewZoom*/ 128) outputnode_changes.zoom = /*viewZoom*/ ctx[7];
    			if (dirty[0] & /*nodeData*/ 1) outputnode_changes.nodeData = /*node*/ ctx[88];
    			if (dirty[0] & /*context*/ 2048) outputnode_changes.context = /*context*/ ctx[11];
    			if (dirty[0] & /*tableData*/ 8) outputnode_changes.tableData = /*tableData*/ ctx[3];

    			if (!updating_process && dirty[0] & /*outputProcessCallbacks*/ 131072) {
    				updating_process = true;
    				outputnode_changes.process = /*outputProcessCallbacks*/ ctx[17][/*index*/ ctx[81]];
    				add_flush_callback(() => updating_process = false);
    			}

    			outputnode.$set(outputnode_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(outputnode.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(outputnode.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(outputnode, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(753:12) {#if node}",
    		ctx
    	});

    	return block;
    }

    // (752:8) {#each nodeData.output as node, index}
    function create_each_block_6(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*node*/ ctx[88] && create_if_block_3$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*node*/ ctx[88]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_3$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(752:8) {#each nodeData.output as node, index}",
    		ctx
    	});

    	return block;
    }

    // (782:12) {#if node}
    function create_if_block_2$1(ctx) {
    	let updating_resultWidgets;
    	let updating_process;
    	let current;

    	function func_10(...args) {
    		return /*func_10*/ ctx[59](/*index*/ ctx[81], ...args);
    	}

    	function func_11(...args) {
    		return /*func_11*/ ctx[60](/*index*/ ctx[81], ...args);
    	}

    	function resultnode_resultWidgets_binding(value) {
    		/*resultnode_resultWidgets_binding*/ ctx[62].call(null, value);
    	}

    	function resultnode_process_binding(value) {
    		/*resultnode_process_binding*/ ctx[63].call(null, value, /*index*/ ctx[81]);
    	}

    	let resultnode_props = {
    		onDrag: func_10,
    		onDelete: func_11,
    		posX: /*node*/ ctx[88].posX,
    		posY: /*node*/ ctx[88].posY,
    		offX: (/*viewX*/ ctx[5] + /*mouseDrag*/ ctx[12].delta.x) / window.innerHeight * 50,
    		offY: (/*viewY*/ ctx[6] + /*mouseDrag*/ ctx[12].delta.y) / window.innerHeight * 50,
    		simX: /*node*/ ctx[88].simX,
    		simY: /*node*/ ctx[88].simY,
    		zoom: /*viewZoom*/ ctx[7],
    		nodeData: /*node*/ ctx[88],
    		context: /*context*/ ctx[11],
    		connectionCallback: /*func_12*/ ctx[61]
    	};

    	if (/*resultWidgets*/ ctx[1] !== void 0) {
    		resultnode_props.resultWidgets = /*resultWidgets*/ ctx[1];
    	}

    	if (/*resultProcessCallbacks*/ ctx[18][/*index*/ ctx[81]] !== void 0) {
    		resultnode_props.process = /*resultProcessCallbacks*/ ctx[18][/*index*/ ctx[81]];
    	}

    	const resultnode = new ResultNode({ props: resultnode_props, $$inline: true });
    	binding_callbacks.push(() => bind(resultnode, "resultWidgets", resultnode_resultWidgets_binding));
    	binding_callbacks.push(() => bind(resultnode, "process", resultnode_process_binding));

    	const block = {
    		c: function create() {
    			create_component(resultnode.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(resultnode, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const resultnode_changes = {};
    			if (dirty[0] & /*nodeData*/ 1) resultnode_changes.posX = /*node*/ ctx[88].posX;
    			if (dirty[0] & /*nodeData*/ 1) resultnode_changes.posY = /*node*/ ctx[88].posY;
    			if (dirty[0] & /*viewX, mouseDrag*/ 4128) resultnode_changes.offX = (/*viewX*/ ctx[5] + /*mouseDrag*/ ctx[12].delta.x) / window.innerHeight * 50;
    			if (dirty[0] & /*viewY, mouseDrag*/ 4160) resultnode_changes.offY = (/*viewY*/ ctx[6] + /*mouseDrag*/ ctx[12].delta.y) / window.innerHeight * 50;
    			if (dirty[0] & /*nodeData*/ 1) resultnode_changes.simX = /*node*/ ctx[88].simX;
    			if (dirty[0] & /*nodeData*/ 1) resultnode_changes.simY = /*node*/ ctx[88].simY;
    			if (dirty[0] & /*viewZoom*/ 128) resultnode_changes.zoom = /*viewZoom*/ ctx[7];
    			if (dirty[0] & /*nodeData*/ 1) resultnode_changes.nodeData = /*node*/ ctx[88];
    			if (dirty[0] & /*context*/ 2048) resultnode_changes.context = /*context*/ ctx[11];

    			if (!updating_resultWidgets && dirty[0] & /*resultWidgets*/ 2) {
    				updating_resultWidgets = true;
    				resultnode_changes.resultWidgets = /*resultWidgets*/ ctx[1];
    				add_flush_callback(() => updating_resultWidgets = false);
    			}

    			if (!updating_process && dirty[0] & /*resultProcessCallbacks*/ 262144) {
    				updating_process = true;
    				resultnode_changes.process = /*resultProcessCallbacks*/ ctx[18][/*index*/ ctx[81]];
    				add_flush_callback(() => updating_process = false);
    			}

    			resultnode.$set(resultnode_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resultnode.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resultnode.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resultnode, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(782:12) {#if node}",
    		ctx
    	});

    	return block;
    }

    // (781:8) {#each nodeData.result as node, index}
    function create_each_block_5(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*node*/ ctx[88] && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*node*/ ctx[88]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(781:8) {#each nodeData.result as node, index}",
    		ctx
    	});

    	return block;
    }

    // (811:12) {#if node}
    function create_if_block_1$4(ctx) {
    	let updating_sizeBounds;
    	let updating_text;
    	let current;

    	function func_13(...args) {
    		return /*func_13*/ ctx[64](/*index*/ ctx[81], ...args);
    	}

    	function func_14(...args) {
    		return /*func_14*/ ctx[65](/*index*/ ctx[81], ...args);
    	}

    	function func_15(...args) {
    		return /*func_15*/ ctx[66](/*index*/ ctx[81], ...args);
    	}

    	function annotationnode_sizeBounds_binding(value) {
    		/*annotationnode_sizeBounds_binding*/ ctx[67].call(null, value, /*node*/ ctx[88]);
    	}

    	function annotationnode_text_binding(value) {
    		/*annotationnode_text_binding*/ ctx[68].call(null, value, /*node*/ ctx[88]);
    	}

    	let annotationnode_props = {
    		onDrag: func_13,
    		onDelete: func_14,
    		onResize: func_15,
    		posX: /*node*/ ctx[88].posX,
    		posY: /*node*/ ctx[88].posY,
    		offX: (/*viewX*/ ctx[5] + /*mouseDrag*/ ctx[12].delta.x) / window.innerHeight * 50,
    		offY: (/*viewY*/ ctx[6] + /*mouseDrag*/ ctx[12].delta.y) / window.innerHeight * 50,
    		simX: /*node*/ ctx[88].simX,
    		simY: /*node*/ ctx[88].simY,
    		zoom: /*viewZoom*/ ctx[7],
    		sizeX: /*node*/ ctx[88].sizeX,
    		sizeY: /*node*/ ctx[88].sizeY,
    		simResizeX: /*node*/ ctx[88].simResizeX,
    		simResizeY: /*node*/ ctx[88].simResizeY,
    		nodeData: /*node*/ ctx[88]
    	};

    	if (/*node*/ ctx[88].sizeBounds !== void 0) {
    		annotationnode_props.sizeBounds = /*node*/ ctx[88].sizeBounds;
    	}

    	if (/*node*/ ctx[88].text !== void 0) {
    		annotationnode_props.text = /*node*/ ctx[88].text;
    	}

    	const annotationnode = new AnnotationNode({
    			props: annotationnode_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(annotationnode, "sizeBounds", annotationnode_sizeBounds_binding));
    	binding_callbacks.push(() => bind(annotationnode, "text", annotationnode_text_binding));

    	const block = {
    		c: function create() {
    			create_component(annotationnode.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(annotationnode, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const annotationnode_changes = {};
    			if (dirty[0] & /*nodeData*/ 1) annotationnode_changes.posX = /*node*/ ctx[88].posX;
    			if (dirty[0] & /*nodeData*/ 1) annotationnode_changes.posY = /*node*/ ctx[88].posY;
    			if (dirty[0] & /*viewX, mouseDrag*/ 4128) annotationnode_changes.offX = (/*viewX*/ ctx[5] + /*mouseDrag*/ ctx[12].delta.x) / window.innerHeight * 50;
    			if (dirty[0] & /*viewY, mouseDrag*/ 4160) annotationnode_changes.offY = (/*viewY*/ ctx[6] + /*mouseDrag*/ ctx[12].delta.y) / window.innerHeight * 50;
    			if (dirty[0] & /*nodeData*/ 1) annotationnode_changes.simX = /*node*/ ctx[88].simX;
    			if (dirty[0] & /*nodeData*/ 1) annotationnode_changes.simY = /*node*/ ctx[88].simY;
    			if (dirty[0] & /*viewZoom*/ 128) annotationnode_changes.zoom = /*viewZoom*/ ctx[7];
    			if (dirty[0] & /*nodeData*/ 1) annotationnode_changes.sizeX = /*node*/ ctx[88].sizeX;
    			if (dirty[0] & /*nodeData*/ 1) annotationnode_changes.sizeY = /*node*/ ctx[88].sizeY;
    			if (dirty[0] & /*nodeData*/ 1) annotationnode_changes.simResizeX = /*node*/ ctx[88].simResizeX;
    			if (dirty[0] & /*nodeData*/ 1) annotationnode_changes.simResizeY = /*node*/ ctx[88].simResizeY;
    			if (dirty[0] & /*nodeData*/ 1) annotationnode_changes.nodeData = /*node*/ ctx[88];

    			if (!updating_sizeBounds && dirty[0] & /*nodeData*/ 1) {
    				updating_sizeBounds = true;
    				annotationnode_changes.sizeBounds = /*node*/ ctx[88].sizeBounds;
    				add_flush_callback(() => updating_sizeBounds = false);
    			}

    			if (!updating_text && dirty[0] & /*nodeData*/ 1) {
    				updating_text = true;
    				annotationnode_changes.text = /*node*/ ctx[88].text;
    				add_flush_callback(() => updating_text = false);
    			}

    			annotationnode.$set(annotationnode_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(annotationnode.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(annotationnode.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(annotationnode, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(811:12) {#if node}",
    		ctx
    	});

    	return block;
    }

    // (810:8) {#each nodeData.annotation as node, index}
    function create_each_block_4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*node*/ ctx[88] && create_if_block_1$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*node*/ ctx[88]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_1$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(810:8) {#each nodeData.annotation as node, index}",
    		ctx
    	});

    	return block;
    }

    // (838:8) {#each connections as c, index}
    function create_each_block_3$1(ctx) {
    	let div;
    	let svg;
    	let path_1;
    	let path_1_d_value;
    	let path_1_stroke_value;
    	let defs;
    	let linearGradient;
    	let stop0;
    	let stop0_stop_color_value;
    	let stop1;
    	let stop1_stop_color_value;
    	let linearGradient_id_value;
    	let linearGradient_x__value;
    	let svg_viewBox_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path_1 = svg_element("path");
    			defs = svg_element("defs");
    			linearGradient = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			attr_dev(path_1, "d", path_1_d_value = "M0 0 C " + Math.abs(/*c*/ ctx[86].width / 2) + " 0 " + Math.abs(/*c*/ ctx[86].width / 2) + " " + Math.abs(/*c*/ ctx[86].height) + " " + Math.abs(/*c*/ ctx[86].width) + " " + Math.abs(/*c*/ ctx[86].height));
    			attr_dev(path_1, "stroke", path_1_stroke_value = "url(#paint0_linear_102_1243_" + /*index*/ ctx[81] + ")");
    			attr_dev(path_1, "stroke-width", ".15");
    			attr_dev(path_1, "class", "svelte-7vmm62");
    			add_location(path_1, file$g, 856, 20, 32478);
    			attr_dev(stop0, "stop-color", stop0_stop_color_value = /*c*/ ctx[86].destColor);
    			add_location(stop0, file$g, 859, 24, 32882);
    			attr_dev(stop1, "offset", "1");
    			attr_dev(stop1, "stop-color", stop1_stop_color_value = /*c*/ ctx[86].originColor);
    			add_location(stop1, file$g, 860, 24, 32942);
    			attr_dev(linearGradient, "id", linearGradient_id_value = "paint0_linear_102_1243_" + /*index*/ ctx[81]);
    			attr_dev(linearGradient, "x1", "0");
    			attr_dev(linearGradient, "y1", "1");
    			attr_dev(linearGradient, "x2", linearGradient_x__value = Math.abs(/*c*/ ctx[86].width));
    			attr_dev(linearGradient, "y2", "1");
    			attr_dev(linearGradient, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient, file$g, 858, 24, 32727);
    			add_location(defs, file$g, 857, 20, 32695);
    			set_style(svg, "position", "absolute");
    			set_style(svg, "top", "0");
    			set_style(svg, "left", "0");
    			set_style(svg, "width", "100%");
    			set_style(svg, "height", "calc(100%)");
    			attr_dev(svg, "preserveAspectRatio", "none");

    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + Math.abs(/*c*/ ctx[86].width) + " " + (/*c*/ ctx[86].height != 0
    			? Math.abs(/*c*/ ctx[86].height)
    			: 1));

    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "svelte-7vmm62");
    			add_location(svg, file$g, 850, 16, 32121);
    			set_style(div, "left", 2 * (/*c*/ ctx[86].posX * /*viewZoom*/ ctx[7] + (/*viewX*/ ctx[5] + /*mouseDrag*/ ctx[12].delta.x) / window.innerHeight * 50) + "vh");
    			set_style(div, "top", 2 * (/*c*/ ctx[86].posY * /*viewZoom*/ ctx[7] + (/*viewY*/ ctx[6] + /*mouseDrag*/ ctx[12].delta.y) / window.innerHeight * 50) + "vh");
    			set_style(div, "width", Math.abs(/*c*/ ctx[86].width) * /*viewZoom*/ ctx[7] * 2 + "vh");
    			set_style(div, "height", Math.abs(/*c*/ ctx[86].height != 0 ? /*c*/ ctx[86].height : 1) * /*viewZoom*/ ctx[7] * 2 + "vh");
    			set_style(div, "transform", "translate(" + (/*c*/ ctx[86].posX > /*c*/ ctx[86].destX ? "-100%" : "0") + ",\r\n                    " + (/*c*/ ctx[86].posY > /*c*/ ctx[86].destY ? "-100%" : "0") + ") scale(" + (/*c*/ ctx[86].destX > /*c*/ ctx[86].posX ? "-" : "") + "1,  " + (/*c*/ ctx[86].destY > /*c*/ ctx[86].posY ? "-" : "") + "1)");
    			attr_dev(div, "class", "inputFlowContainer svelte-7vmm62");
    			add_location(div, file$g, 838, 12, 31463);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path_1);
    			append_dev(svg, defs);
    			append_dev(defs, linearGradient);
    			append_dev(linearGradient, stop0);
    			append_dev(linearGradient, stop1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*connections*/ 8192 && path_1_d_value !== (path_1_d_value = "M0 0 C " + Math.abs(/*c*/ ctx[86].width / 2) + " 0 " + Math.abs(/*c*/ ctx[86].width / 2) + " " + Math.abs(/*c*/ ctx[86].height) + " " + Math.abs(/*c*/ ctx[86].width) + " " + Math.abs(/*c*/ ctx[86].height))) {
    				attr_dev(path_1, "d", path_1_d_value);
    			}

    			if (dirty[0] & /*connections*/ 8192 && stop0_stop_color_value !== (stop0_stop_color_value = /*c*/ ctx[86].destColor)) {
    				attr_dev(stop0, "stop-color", stop0_stop_color_value);
    			}

    			if (dirty[0] & /*connections*/ 8192 && stop1_stop_color_value !== (stop1_stop_color_value = /*c*/ ctx[86].originColor)) {
    				attr_dev(stop1, "stop-color", stop1_stop_color_value);
    			}

    			if (dirty[0] & /*connections*/ 8192 && linearGradient_x__value !== (linearGradient_x__value = Math.abs(/*c*/ ctx[86].width))) {
    				attr_dev(linearGradient, "x2", linearGradient_x__value);
    			}

    			if (dirty[0] & /*connections*/ 8192 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + Math.abs(/*c*/ ctx[86].width) + " " + (/*c*/ ctx[86].height != 0
    			? Math.abs(/*c*/ ctx[86].height)
    			: 1))) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if (dirty[0] & /*connections, viewZoom, viewX, mouseDrag*/ 12448) {
    				set_style(div, "left", 2 * (/*c*/ ctx[86].posX * /*viewZoom*/ ctx[7] + (/*viewX*/ ctx[5] + /*mouseDrag*/ ctx[12].delta.x) / window.innerHeight * 50) + "vh");
    			}

    			if (dirty[0] & /*connections, viewZoom, viewY, mouseDrag*/ 12480) {
    				set_style(div, "top", 2 * (/*c*/ ctx[86].posY * /*viewZoom*/ ctx[7] + (/*viewY*/ ctx[6] + /*mouseDrag*/ ctx[12].delta.y) / window.innerHeight * 50) + "vh");
    			}

    			if (dirty[0] & /*connections, viewZoom*/ 8320) {
    				set_style(div, "width", Math.abs(/*c*/ ctx[86].width) * /*viewZoom*/ ctx[7] * 2 + "vh");
    			}

    			if (dirty[0] & /*connections, viewZoom*/ 8320) {
    				set_style(div, "height", Math.abs(/*c*/ ctx[86].height != 0 ? /*c*/ ctx[86].height : 1) * /*viewZoom*/ ctx[7] * 2 + "vh");
    			}

    			if (dirty[0] & /*connections*/ 8192) {
    				set_style(div, "transform", "translate(" + (/*c*/ ctx[86].posX > /*c*/ ctx[86].destX ? "-100%" : "0") + ",\r\n                    " + (/*c*/ ctx[86].posY > /*c*/ ctx[86].destY ? "-100%" : "0") + ") scale(" + (/*c*/ ctx[86].destX > /*c*/ ctx[86].posX ? "-" : "") + "1,  " + (/*c*/ ctx[86].destY > /*c*/ ctx[86].posY ? "-" : "") + "1)");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3$1.name,
    		type: "each",
    		source: "(838:8) {#each connections as c, index}",
    		ctx
    	});

    	return block;
    }

    // (868:8) {#if simConnection.shown}
    function create_if_block$4(ctx) {
    	let div;
    	let svg;
    	let path_1;
    	let path_1_d_value;
    	let defs;
    	let linearGradient;
    	let stop0;
    	let stop0_stop_color_value;
    	let stop1;
    	let stop1_stop_color_value;
    	let linearGradient_x__value;
    	let svg_viewBox_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path_1 = svg_element("path");
    			defs = svg_element("defs");
    			linearGradient = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			set_style(path_1, "pointer-events", "none");
    			attr_dev(path_1, "d", path_1_d_value = "M0 0 C " + Math.abs(/*simConnection*/ ctx[16].width / 2) + " 0 " + Math.abs(/*simConnection*/ ctx[16].width / 2) + " " + Math.abs(/*simConnection*/ ctx[16].height) + " " + Math.abs(/*simConnection*/ ctx[16].width) + " " + Math.abs(/*simConnection*/ ctx[16].height));
    			attr_dev(path_1, "stroke", "url(#paint0_linear_102_1243_SIM)");
    			attr_dev(path_1, "stroke-width", ".15");
    			attr_dev(path_1, "class", "svelte-7vmm62");
    			add_location(path_1, file$g, 887, 20, 34406);
    			attr_dev(stop0, "stop-color", stop0_stop_color_value = /*simConnection*/ ctx[16].node.color);
    			add_location(stop0, file$g, 890, 24, 34904);
    			attr_dev(stop1, "offset", "1");
    			attr_dev(stop1, "stop-color", stop1_stop_color_value = /*simConnection*/ ctx[16].node.color);
    			add_location(stop1, file$g, 891, 24, 34977);
    			attr_dev(linearGradient, "id", "paint0_linear_102_1243_SIM");
    			attr_dev(linearGradient, "x1", "0");
    			attr_dev(linearGradient, "y1", "1");
    			attr_dev(linearGradient, "x2", linearGradient_x__value = Math.abs(/*simConnection*/ ctx[16].width));
    			attr_dev(linearGradient, "y2", "1");
    			attr_dev(linearGradient, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient, file$g, 889, 24, 34741);
    			add_location(defs, file$g, 888, 20, 34709);
    			set_style(svg, "position", "absolute");
    			set_style(svg, "top", "0");
    			set_style(svg, "left", "0");
    			set_style(svg, "width", "100%");
    			set_style(svg, "height", "calc(100%)");
    			attr_dev(svg, "preserveAspectRatio", "none");

    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + Math.abs(/*simConnection*/ ctx[16].width) + " " + (Math.abs(/*simConnection*/ ctx[16].height) > 0.1
    			? Math.abs(/*simConnection*/ ctx[16].height)
    			: 0.05));

    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "svelte-7vmm62");
    			add_location(svg, file$g, 881, 16, 34001);
    			set_style(div, "left", 2 * (/*simConnection*/ ctx[16].posX * /*viewZoom*/ ctx[7] + (/*viewX*/ ctx[5] + /*mouseDrag*/ ctx[12].delta.x) / window.innerHeight * 50) + "vh");
    			set_style(div, "top", 2 * (/*simConnection*/ ctx[16].posY * /*viewZoom*/ ctx[7] + (/*viewY*/ ctx[6] + /*mouseDrag*/ ctx[12].delta.y) / window.innerHeight * 50) + "vh");
    			set_style(div, "width", Math.abs(/*simConnection*/ ctx[16].width) * /*viewZoom*/ ctx[7] * 2 + "vh");

    			set_style(div, "height", Math.abs(Math.abs(/*simConnection*/ ctx[16].height) > 0.1
    			? /*simConnection*/ ctx[16].height
    			: 0.05) * /*viewZoom*/ ctx[7] * 2 + "vh");

    			set_style(div, "transform", "translate(" + (/*simConnection*/ ctx[16].posX > /*simConnection*/ ctx[16].destX
    			? "-100%"
    			: "0") + ",\r\n                    " + (/*simConnection*/ ctx[16].posY > /*simConnection*/ ctx[16].destY
    			? "-100%"
    			: "0") + ") scale(" + (/*simConnection*/ ctx[16].destX > /*simConnection*/ ctx[16].posX
    			? "-"
    			: "") + "1,  " + (/*simConnection*/ ctx[16].destY > /*simConnection*/ ctx[16].posY
    			? "-"
    			: "") + "1)");

    			attr_dev(div, "class", "inputFlowContainer svelte-7vmm62");
    			add_location(div, file$g, 868, 12, 33173);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path_1);
    			append_dev(svg, defs);
    			append_dev(defs, linearGradient);
    			append_dev(linearGradient, stop0);
    			append_dev(linearGradient, stop1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*simConnection*/ 65536 && path_1_d_value !== (path_1_d_value = "M0 0 C " + Math.abs(/*simConnection*/ ctx[16].width / 2) + " 0 " + Math.abs(/*simConnection*/ ctx[16].width / 2) + " " + Math.abs(/*simConnection*/ ctx[16].height) + " " + Math.abs(/*simConnection*/ ctx[16].width) + " " + Math.abs(/*simConnection*/ ctx[16].height))) {
    				attr_dev(path_1, "d", path_1_d_value);
    			}

    			if (dirty[0] & /*simConnection*/ 65536 && stop0_stop_color_value !== (stop0_stop_color_value = /*simConnection*/ ctx[16].node.color)) {
    				attr_dev(stop0, "stop-color", stop0_stop_color_value);
    			}

    			if (dirty[0] & /*simConnection*/ 65536 && stop1_stop_color_value !== (stop1_stop_color_value = /*simConnection*/ ctx[16].node.color)) {
    				attr_dev(stop1, "stop-color", stop1_stop_color_value);
    			}

    			if (dirty[0] & /*simConnection*/ 65536 && linearGradient_x__value !== (linearGradient_x__value = Math.abs(/*simConnection*/ ctx[16].width))) {
    				attr_dev(linearGradient, "x2", linearGradient_x__value);
    			}

    			if (dirty[0] & /*simConnection*/ 65536 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + Math.abs(/*simConnection*/ ctx[16].width) + " " + (Math.abs(/*simConnection*/ ctx[16].height) > 0.1
    			? Math.abs(/*simConnection*/ ctx[16].height)
    			: 0.05))) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if (dirty[0] & /*simConnection, viewZoom, viewX, mouseDrag*/ 69792) {
    				set_style(div, "left", 2 * (/*simConnection*/ ctx[16].posX * /*viewZoom*/ ctx[7] + (/*viewX*/ ctx[5] + /*mouseDrag*/ ctx[12].delta.x) / window.innerHeight * 50) + "vh");
    			}

    			if (dirty[0] & /*simConnection, viewZoom, viewY, mouseDrag*/ 69824) {
    				set_style(div, "top", 2 * (/*simConnection*/ ctx[16].posY * /*viewZoom*/ ctx[7] + (/*viewY*/ ctx[6] + /*mouseDrag*/ ctx[12].delta.y) / window.innerHeight * 50) + "vh");
    			}

    			if (dirty[0] & /*simConnection, viewZoom*/ 65664) {
    				set_style(div, "width", Math.abs(/*simConnection*/ ctx[16].width) * /*viewZoom*/ ctx[7] * 2 + "vh");
    			}

    			if (dirty[0] & /*simConnection, viewZoom*/ 65664) {
    				set_style(div, "height", Math.abs(Math.abs(/*simConnection*/ ctx[16].height) > 0.1
    				? /*simConnection*/ ctx[16].height
    				: 0.05) * /*viewZoom*/ ctx[7] * 2 + "vh");
    			}

    			if (dirty[0] & /*simConnection*/ 65536) {
    				set_style(div, "transform", "translate(" + (/*simConnection*/ ctx[16].posX > /*simConnection*/ ctx[16].destX
    				? "-100%"
    				: "0") + ",\r\n                    " + (/*simConnection*/ ctx[16].posY > /*simConnection*/ ctx[16].destY
    				? "-100%"
    				: "0") + ") scale(" + (/*simConnection*/ ctx[16].destX > /*simConnection*/ ctx[16].posX
    				? "-"
    				: "") + "1,  " + (/*simConnection*/ ctx[16].destY > /*simConnection*/ ctx[16].posY
    				? "-"
    				: "") + "1)");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(868:8) {#if simConnection.shown}",
    		ctx
    	});

    	return block;
    }

    // (967:16) {#each nodeConfig[category] as id}
    function create_each_block_2$2(ctx) {
    	let current;

    	const nodepickerslot = new NodePickerSlot({
    			props: {
    				id: /*id*/ ctx[83],
    				type: "operator",
    				color: "var(--orange)"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(nodepickerslot.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(nodepickerslot, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const nodepickerslot_changes = {};
    			if (dirty[0] & /*nodeConfig, nodeCategories*/ 49152) nodepickerslot_changes.id = /*id*/ ctx[83];
    			nodepickerslot.$set(nodepickerslot_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nodepickerslot.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nodepickerslot.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nodepickerslot, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$2.name,
    		type: "each",
    		source: "(967:16) {#each nodeConfig[category] as id}",
    		ctx
    	});

    	return block;
    }

    // (963:12) {#each nodeCategories as category, index}
    function create_each_block_1$4(ctx) {
    	let div;
    	let h2;
    	let t0_value = /*category*/ ctx[79] + "";
    	let t0;
    	let index = /*index*/ ctx[81];
    	let t1;
    	let each_1_anchor;
    	let current;
    	const assign_div = () => /*div_binding*/ ctx[72](div, index);
    	const unassign_div = () => /*div_binding*/ ctx[72](null, index);
    	let each_value_2 = /*nodeConfig*/ ctx[14][/*category*/ ctx[79]];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$2(get_each_context_2$2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(h2, "class", "svelte-7vmm62");
    			add_location(h2, file$g, 964, 20, 37889);
    			attr_dev(div, "class", "nodePickerGroupTitle svelte-7vmm62");
    			add_location(div, file$g, 963, 16, 37795);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			assign_div();
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty[0] & /*nodeCategories*/ 32768) && t0_value !== (t0_value = /*category*/ ctx[79] + "")) set_data_dev(t0, t0_value);

    			if (index !== /*index*/ ctx[81]) {
    				unassign_div();
    				index = /*index*/ ctx[81];
    				assign_div();
    			}

    			if (dirty[0] & /*nodeConfig, nodeCategories*/ 49152) {
    				each_value_2 = /*nodeConfig*/ ctx[14][/*category*/ ctx[79]];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			unassign_div();
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$4.name,
    		type: "each",
    		source: "(963:12) {#each nodeCategories as category, index}",
    		ctx
    	});

    	return block;
    }

    // (989:16) {#each nodeCategories as category, index}
    function create_each_block$5(ctx) {
    	let div;
    	let h2;
    	let t0_value = /*category*/ ctx[79] + "";
    	let t0;
    	let t1;
    	let dispose;

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[76](/*index*/ ctx[81], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(h2, "class", "svelte-7vmm62");
    			add_location(h2, file$g, 990, 24, 39094);
    			attr_dev(div, "class", "nodePickerGroupTitle navigationLabel svelte-7vmm62");
    			add_location(div, file$g, 989, 20, 38980);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(div, t1);
    			dispose = listen_dev(div, "click", click_handler_3, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*nodeCategories*/ 32768 && t0_value !== (t0_value = /*category*/ ctx[79] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(989:16) {#each nodeCategories as category, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let main;
    	let div15;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let div14;
    	let div3;
    	let div1;
    	let svg;
    	let path_1;
    	let t8;
    	let div2;
    	let h20;
    	let t10;
    	let div13;
    	let div7;
    	let div4;
    	let h21;
    	let t12;
    	let t13;
    	let t14;
    	let t15;
    	let div5;
    	let h22;
    	let t17;
    	let t18;
    	let t19;
    	let div6;
    	let h23;
    	let t21;
    	let t22;
    	let t23;
    	let div8;
    	let t24;
    	let div12;
    	let div9;
    	let h24;
    	let t26;
    	let div10;
    	let h25;
    	let t28;
    	let div11;
    	let h26;
    	let t30;
    	let div15_resize_listener;
    	let current;
    	let dispose;
    	let each_value_9 = /*nodeData*/ ctx[0].operator;
    	validate_each_argument(each_value_9);
    	let each_blocks_8 = [];

    	for (let i = 0; i < each_value_9.length; i += 1) {
    		each_blocks_8[i] = create_each_block_9(get_each_context_9(ctx, each_value_9, i));
    	}

    	const out = i => transition_out(each_blocks_8[i], 1, 1, () => {
    		each_blocks_8[i] = null;
    	});

    	let each_value_8 = /*nodeData*/ ctx[0].literal;
    	validate_each_argument(each_value_8);
    	let each_blocks_7 = [];

    	for (let i = 0; i < each_value_8.length; i += 1) {
    		each_blocks_7[i] = create_each_block_8(get_each_context_8(ctx, each_value_8, i));
    	}

    	const out_1 = i => transition_out(each_blocks_7[i], 1, 1, () => {
    		each_blocks_7[i] = null;
    	});

    	let each_value_7 = /*nodeData*/ ctx[0].input;
    	validate_each_argument(each_value_7);
    	let each_blocks_6 = [];

    	for (let i = 0; i < each_value_7.length; i += 1) {
    		each_blocks_6[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
    	}

    	const out_2 = i => transition_out(each_blocks_6[i], 1, 1, () => {
    		each_blocks_6[i] = null;
    	});

    	let each_value_6 = /*nodeData*/ ctx[0].output;
    	validate_each_argument(each_value_6);
    	let each_blocks_5 = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks_5[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	const out_3 = i => transition_out(each_blocks_5[i], 1, 1, () => {
    		each_blocks_5[i] = null;
    	});

    	let each_value_5 = /*nodeData*/ ctx[0].result;
    	validate_each_argument(each_value_5);
    	let each_blocks_4 = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks_4[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	const out_4 = i => transition_out(each_blocks_4[i], 1, 1, () => {
    		each_blocks_4[i] = null;
    	});

    	let each_value_4 = /*nodeData*/ ctx[0].annotation;
    	validate_each_argument(each_value_4);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks_3[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	const out_5 = i => transition_out(each_blocks_3[i], 1, 1, () => {
    		each_blocks_3[i] = null;
    	});

    	let each_value_3 = /*connections*/ ctx[13];
    	validate_each_argument(each_value_3);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_2[i] = create_each_block_3$1(get_each_context_3$1(ctx, each_value_3, i));
    	}

    	let if_block = /*simConnection*/ ctx[16].shown && create_if_block$4(ctx);

    	const nodepickerslot0 = new NodePickerSlot({
    			props: {
    				id: "Grab",
    				type: "input",
    				color: "var(--red)"
    			},
    			$$inline: true
    		});

    	const nodepickerslot1 = new NodePickerSlot({
    			props: {
    				id: "Put",
    				type: "output",
    				color: "var(--purple)"
    			},
    			$$inline: true
    		});

    	const nodepickerslot2 = new NodePickerSlot({
    			props: {
    				id: "Result",
    				type: "result",
    				color: "var(--blue)"
    			},
    			$$inline: true
    		});

    	const nodepickerslot3 = new NodePickerSlot({
    			props: {
    				id: "Number",
    				type: "literal",
    				color: "var(--velvet)"
    			},
    			$$inline: true
    		});

    	const nodepickerslot4 = new NodePickerSlot({
    			props: {
    				id: "Text",
    				type: "literal",
    				color: "var(--velvet)"
    			},
    			$$inline: true
    		});

    	const nodepickerslot5 = new NodePickerSlot({
    			props: {
    				id: "Annotation",
    				type: "annotation",
    				color: "var(--text1)"
    			},
    			$$inline: true
    		});

    	let each_value_1 = /*nodeCategories*/ ctx[15];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$4(get_each_context_1$4(ctx, each_value_1, i));
    	}

    	const out_6 = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*nodeCategories*/ ctx[15];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div15 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_8.length; i += 1) {
    				each_blocks_8[i].c();
    			}

    			t0 = space();

    			for (let i = 0; i < each_blocks_7.length; i += 1) {
    				each_blocks_7[i].c();
    			}

    			t1 = space();

    			for (let i = 0; i < each_blocks_6.length; i += 1) {
    				each_blocks_6[i].c();
    			}

    			t2 = space();

    			for (let i = 0; i < each_blocks_5.length; i += 1) {
    				each_blocks_5[i].c();
    			}

    			t3 = space();

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].c();
    			}

    			t4 = space();

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t5 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t6 = space();
    			if (if_block) if_block.c();
    			t7 = space();
    			div14 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			svg = svg_element("svg");
    			path_1 = svg_element("path");
    			t8 = space();
    			div2 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Node Picker";
    			t10 = space();
    			div13 = element("div");
    			div7 = element("div");
    			div4 = element("div");
    			h21 = element("h2");
    			h21.textContent = "I/O";
    			t12 = space();
    			create_component(nodepickerslot0.$$.fragment);
    			t13 = space();
    			create_component(nodepickerslot1.$$.fragment);
    			t14 = space();
    			create_component(nodepickerslot2.$$.fragment);
    			t15 = space();
    			div5 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Literals";
    			t17 = space();
    			create_component(nodepickerslot3.$$.fragment);
    			t18 = space();
    			create_component(nodepickerslot4.$$.fragment);
    			t19 = space();
    			div6 = element("div");
    			h23 = element("h2");
    			h23.textContent = "Annotation";
    			t21 = space();
    			create_component(nodepickerslot5.$$.fragment);
    			t22 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t23 = space();
    			div8 = element("div");
    			t24 = space();
    			div12 = element("div");
    			div9 = element("div");
    			h24 = element("h2");
    			h24.textContent = "I/O";
    			t26 = space();
    			div10 = element("div");
    			h25 = element("h2");
    			h25.textContent = "Literals";
    			t28 = space();
    			div11 = element("div");
    			h26 = element("h2");
    			h26.textContent = "Annotation";
    			t30 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "crossBackground svelte-7vmm62");
    			set_style(div0, "background-position-x", /*viewX*/ ctx[5] + /*mouseDrag*/ ctx[12].delta.x + "px");
    			set_style(div0, "background-position-y", /*viewY*/ ctx[6] + /*mouseDrag*/ ctx[12].delta.y + "px");
    			set_style(div0, "background-size", 2 * /*viewZoom*/ ctx[7] + "vh");
    			add_location(div0, file$g, 656, 8, 24694);
    			attr_dev(path_1, "d", "M7.724 65.49C13.36 55.11 21.79 46.47 32 40.56C39.63 36.15 48.25 33.26 57.46 32.33C59.61 32.11 61.79 32 64 32H448C483.3 32 512 60.65 512 96V416C512 451.3 483.3 480 448 480H64C28.65 480 0 451.3 0 416V96C0 93.79 .112 91.61 .3306 89.46C1.204 80.85 3.784 72.75 7.724 65.49V65.49zM48 416C48 424.8 55.16 432 64 432H448C456.8 432 464 424.8 464 416V224H48V416z");
    			attr_dev(path_1, "class", "svelte-7vmm62");
    			add_location(path_1, file$g, 907, 246, 35757);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			attr_dev(svg, "class", "svelte-7vmm62");
    			add_location(svg, file$g, 907, 16, 35527);
    			attr_dev(div1, "class", "nodePickerIcon svelte-7vmm62");
    			add_location(div1, file$g, 906, 12, 35481);
    			attr_dev(h20, "class", "svelte-7vmm62");
    			add_location(h20, file$g, 910, 16, 36219);
    			attr_dev(div2, "class", "nodePickerTitle svelte-7vmm62");
    			add_location(div2, file$g, 909, 12, 36172);
    			attr_dev(div3, "class", "nodePickerHeader svelte-7vmm62");
    			add_location(div3, file$g, 905, 8, 35437);
    			set_style(h21, "color", "var(--red)");
    			attr_dev(h21, "class", "svelte-7vmm62");
    			add_location(h21, file$g, 916, 16, 36460);
    			attr_dev(div4, "class", "nodePickerGroupTitle svelte-7vmm62");
    			add_location(div4, file$g, 915, 12, 36378);
    			set_style(h22, "color", "var(--velvet)");
    			attr_dev(h22, "class", "svelte-7vmm62");
    			add_location(h22, file$g, 938, 16, 37044);
    			attr_dev(div5, "class", "nodePickerGroupTitle svelte-7vmm62");
    			add_location(div5, file$g, 937, 12, 36962);
    			set_style(h23, "color", "var(--text1)");
    			attr_dev(h23, "class", "svelte-7vmm62");
    			add_location(h23, file$g, 954, 16, 37501);
    			attr_dev(div6, "class", "nodePickerGroupTitle svelte-7vmm62");
    			add_location(div6, file$g, 953, 12, 37419);
    			attr_dev(div7, "class", "slotScrollContainer svelte-7vmm62");
    			add_location(div7, file$g, 914, 12, 36331);
    			attr_dev(div8, "class", "verticalSeparator svelte-7vmm62");
    			add_location(div8, file$g, 976, 12, 38250);
    			set_style(h24, "color", "var(--red)");
    			attr_dev(h24, "class", "svelte-7vmm62");
    			add_location(h24, file$g, 980, 20, 38453);
    			attr_dev(div9, "class", "nodePickerGroupTitle navigationLabel svelte-7vmm62");
    			add_location(div9, file$g, 979, 16, 38351);
    			set_style(h25, "color", "var(--velvet)");
    			attr_dev(h25, "class", "svelte-7vmm62");
    			add_location(h25, file$g, 983, 20, 38636);
    			attr_dev(div10, "class", "nodePickerGroupTitle navigationLabel svelte-7vmm62");
    			add_location(div10, file$g, 982, 16, 38534);
    			set_style(h26, "color", "var(--text1)");
    			attr_dev(h26, "class", "svelte-7vmm62");
    			add_location(h26, file$g, 986, 20, 38827);
    			attr_dev(div11, "class", "nodePickerGroupTitle navigationLabel svelte-7vmm62");
    			add_location(div11, file$g, 985, 16, 38725);
    			attr_dev(div12, "class", "navigationPannel svelte-7vmm62");
    			add_location(div12, file$g, 978, 12, 38303);
    			attr_dev(div13, "class", "nodePickerContents svelte-7vmm62");
    			add_location(div13, file$g, 913, 8, 36285);
    			attr_dev(div14, "class", "nodePickerFrame neuOutdentShadow svelte-7vmm62");
    			add_location(div14, file$g, 899, 4, 35186);
    			attr_dev(div15, "class", "frame neuIndentShadow svelte-7vmm62");
    			add_render_callback(() => /*div15_elementresize_handler*/ ctx[78].call(div15));
    			add_location(div15, file$g, 642, 4, 24285);
    			attr_dev(main, "class", "svelte-7vmm62");
    			add_location(main, file$g, 641, 0, 24273);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div15);
    			append_dev(div15, div0);

    			for (let i = 0; i < each_blocks_8.length; i += 1) {
    				each_blocks_8[i].m(div0, null);
    			}

    			append_dev(div0, t0);

    			for (let i = 0; i < each_blocks_7.length; i += 1) {
    				each_blocks_7[i].m(div0, null);
    			}

    			append_dev(div0, t1);

    			for (let i = 0; i < each_blocks_6.length; i += 1) {
    				each_blocks_6[i].m(div0, null);
    			}

    			append_dev(div0, t2);

    			for (let i = 0; i < each_blocks_5.length; i += 1) {
    				each_blocks_5[i].m(div0, null);
    			}

    			append_dev(div0, t3);

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].m(div0, null);
    			}

    			append_dev(div0, t4);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(div0, null);
    			}

    			append_dev(div0, t5);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div0, null);
    			}

    			append_dev(div0, t6);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div15, t7);
    			append_dev(div15, div14);
    			append_dev(div14, div3);
    			append_dev(div3, div1);
    			append_dev(div1, svg);
    			append_dev(svg, path_1);
    			append_dev(div3, t8);
    			append_dev(div3, div2);
    			append_dev(div2, h20);
    			append_dev(div14, t10);
    			append_dev(div14, div13);
    			append_dev(div13, div7);
    			append_dev(div7, div4);
    			append_dev(div4, h21);
    			/*div4_binding*/ ctx[69](div4);
    			append_dev(div7, t12);
    			mount_component(nodepickerslot0, div7, null);
    			append_dev(div7, t13);
    			mount_component(nodepickerslot1, div7, null);
    			append_dev(div7, t14);
    			mount_component(nodepickerslot2, div7, null);
    			append_dev(div7, t15);
    			append_dev(div7, div5);
    			append_dev(div5, h22);
    			/*div5_binding*/ ctx[70](div5);
    			append_dev(div7, t17);
    			mount_component(nodepickerslot3, div7, null);
    			append_dev(div7, t18);
    			mount_component(nodepickerslot4, div7, null);
    			append_dev(div7, t19);
    			append_dev(div7, div6);
    			append_dev(div6, h23);
    			/*div6_binding*/ ctx[71](div6);
    			append_dev(div7, t21);
    			mount_component(nodepickerslot5, div7, null);
    			append_dev(div7, t22);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div7, null);
    			}

    			append_dev(div13, t23);
    			append_dev(div13, div8);
    			append_dev(div13, t24);
    			append_dev(div13, div12);
    			append_dev(div12, div9);
    			append_dev(div9, h24);
    			append_dev(div12, t26);
    			append_dev(div12, div10);
    			append_dev(div10, h25);
    			append_dev(div12, t28);
    			append_dev(div12, div11);
    			append_dev(div11, h26);
    			append_dev(div12, t30);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div12, null);
    			}

    			/*div15_binding*/ ctx[77](div15);
    			div15_resize_listener = add_resize_listener(div15, /*div15_elementresize_handler*/ ctx[78].bind(div15));
    			current = true;

    			dispose = [
    				listen_dev(div9, "click", /*click_handler*/ ctx[73], false, false, false),
    				listen_dev(div10, "click", /*click_handler_1*/ ctx[74], false, false, false),
    				listen_dev(div11, "click", /*click_handler_2*/ ctx[75], false, false, false),
    				listen_dev(div14, "mousedown", mousedown_handler$b, false, false, false),
    				listen_dev(div14, "mousewheel", mousewheel_handler, false, false, false),
    				listen_dev(div15, "mousedown", /*mouseDown*/ ctx[20], false, false, false),
    				listen_dev(div15, "mousemove", /*mouseMove*/ ctx[21], false, false, false),
    				listen_dev(div15, "mouseup", /*mouseUp*/ ctx[22], false, false, false),
    				listen_dev(div15, "mouseleave", /*mouseUp*/ ctx[22], false, false, false),
    				listen_dev(div15, "mousewheel", /*scroll*/ ctx[23], false, false, false),
    				listen_dev(div15, "drop", /*drop*/ ctx[26], false, false, false),
    				listen_dev(div15, "dragover", /*dragOver*/ ctx[25], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*initNodeDrag, nodeData, viewX, mouseDrag, viewY, viewZoom, context, initSimConnection, terminateSimConnection, addConnection, recalculateConnections*/ 2030049505 | dirty[1] & /*deleteNode*/ 1) {
    				each_value_9 = /*nodeData*/ ctx[0].operator;
    				validate_each_argument(each_value_9);
    				let i;

    				for (i = 0; i < each_value_9.length; i += 1) {
    					const child_ctx = get_each_context_9(ctx, each_value_9, i);

    					if (each_blocks_8[i]) {
    						each_blocks_8[i].p(child_ctx, dirty);
    						transition_in(each_blocks_8[i], 1);
    					} else {
    						each_blocks_8[i] = create_each_block_9(child_ctx);
    						each_blocks_8[i].c();
    						transition_in(each_blocks_8[i], 1);
    						each_blocks_8[i].m(div0, t0);
    					}
    				}

    				group_outros();

    				for (i = each_value_9.length; i < each_blocks_8.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*initNodeDrag, invokeOutputs, nodeData, viewX, mouseDrag, viewY, viewZoom, context, initSimConnection, terminateSimConnection, recalculateConnections*/ 956307697 | dirty[1] & /*deleteNode*/ 1) {
    				each_value_8 = /*nodeData*/ ctx[0].literal;
    				validate_each_argument(each_value_8);
    				let i;

    				for (i = 0; i < each_value_8.length; i += 1) {
    					const child_ctx = get_each_context_8(ctx, each_value_8, i);

    					if (each_blocks_7[i]) {
    						each_blocks_7[i].p(child_ctx, dirty);
    						transition_in(each_blocks_7[i], 1);
    					} else {
    						each_blocks_7[i] = create_each_block_8(child_ctx);
    						each_blocks_7[i].c();
    						transition_in(each_blocks_7[i], 1);
    						each_blocks_7[i].m(div0, t1);
    					}
    				}

    				group_outros();

    				for (i = each_value_8.length; i < each_blocks_7.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*initNodeDrag, nodeData, viewX, mouseDrag, viewY, viewZoom, context, tableRef, tableData, initSimConnection, terminateSimConnection, addConnection*/ 1493178605 | dirty[1] & /*deleteNode*/ 1) {
    				each_value_7 = /*nodeData*/ ctx[0].input;
    				validate_each_argument(each_value_7);
    				let i;

    				for (i = 0; i < each_value_7.length; i += 1) {
    					const child_ctx = get_each_context_7(ctx, each_value_7, i);

    					if (each_blocks_6[i]) {
    						each_blocks_6[i].p(child_ctx, dirty);
    						transition_in(each_blocks_6[i], 1);
    					} else {
    						each_blocks_6[i] = create_each_block_7(child_ctx);
    						each_blocks_6[i].c();
    						transition_in(each_blocks_6[i], 1);
    						each_blocks_6[i].m(div0, t2);
    					}
    				}

    				group_outros();

    				for (i = each_value_7.length; i < each_blocks_6.length; i += 1) {
    					out_2(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*initNodeDrag, nodeData, viewX, mouseDrag, viewY, viewZoom, context, tableData, addConnection, recalculateConnections, outputProcessCallbacks*/ 1627527401 | dirty[1] & /*deleteNode*/ 1) {
    				each_value_6 = /*nodeData*/ ctx[0].output;
    				validate_each_argument(each_value_6);
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6(ctx, each_value_6, i);

    					if (each_blocks_5[i]) {
    						each_blocks_5[i].p(child_ctx, dirty);
    						transition_in(each_blocks_5[i], 1);
    					} else {
    						each_blocks_5[i] = create_each_block_6(child_ctx);
    						each_blocks_5[i].c();
    						transition_in(each_blocks_5[i], 1);
    						each_blocks_5[i].m(div0, t3);
    					}
    				}

    				group_outros();

    				for (i = each_value_6.length; i < each_blocks_5.length; i += 1) {
    					out_3(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*initNodeDrag, nodeData, viewX, mouseDrag, viewY, viewZoom, context, addConnection, recalculateConnections, resultWidgets, resultProcessCallbacks*/ 1627658467 | dirty[1] & /*deleteNode*/ 1) {
    				each_value_5 = /*nodeData*/ ctx[0].result;
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks_4[i]) {
    						each_blocks_4[i].p(child_ctx, dirty);
    						transition_in(each_blocks_4[i], 1);
    					} else {
    						each_blocks_4[i] = create_each_block_5(child_ctx);
    						each_blocks_4[i].c();
    						transition_in(each_blocks_4[i], 1);
    						each_blocks_4[i].m(div0, t4);
    					}
    				}

    				group_outros();

    				for (i = each_value_5.length; i < each_blocks_4.length; i += 1) {
    					out_4(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*initNodeDrag, nodeData, viewX, mouseDrag, viewY, viewZoom*/ 16781537 | dirty[1] & /*deleteNode, initNodeResize*/ 5) {
    				each_value_4 = /*nodeData*/ ctx[0].annotation;
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    						transition_in(each_blocks_3[i], 1);
    					} else {
    						each_blocks_3[i] = create_each_block_4(child_ctx);
    						each_blocks_3[i].c();
    						transition_in(each_blocks_3[i], 1);
    						each_blocks_3[i].m(div0, t5);
    					}
    				}

    				group_outros();

    				for (i = each_value_4.length; i < each_blocks_3.length; i += 1) {
    					out_5(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*connections, viewZoom, viewX, mouseDrag, viewY*/ 12512) {
    				each_value_3 = /*connections*/ ctx[13];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3$1(ctx, each_value_3, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_3$1(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div0, t6);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_3.length;
    			}

    			if (/*simConnection*/ ctx[16].shown) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (!current || dirty[0] & /*viewX, mouseDrag*/ 4128) {
    				set_style(div0, "background-position-x", /*viewX*/ ctx[5] + /*mouseDrag*/ ctx[12].delta.x + "px");
    			}

    			if (!current || dirty[0] & /*viewY, mouseDrag*/ 4160) {
    				set_style(div0, "background-position-y", /*viewY*/ ctx[6] + /*mouseDrag*/ ctx[12].delta.y + "px");
    			}

    			if (!current || dirty[0] & /*viewZoom*/ 128) {
    				set_style(div0, "background-size", 2 * /*viewZoom*/ ctx[7] + "vh");
    			}

    			if (dirty[0] & /*nodeConfig, nodeCategories, categoryLabels*/ 573440) {
    				each_value_1 = /*nodeCategories*/ ctx[15];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$4(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1$4(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div7, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out_6(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*nodeCategories*/ 32768 | dirty[1] & /*navJump*/ 2) {
    				each_value = /*nodeCategories*/ ctx[15];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div12, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_9.length; i += 1) {
    				transition_in(each_blocks_8[i]);
    			}

    			for (let i = 0; i < each_value_8.length; i += 1) {
    				transition_in(each_blocks_7[i]);
    			}

    			for (let i = 0; i < each_value_7.length; i += 1) {
    				transition_in(each_blocks_6[i]);
    			}

    			for (let i = 0; i < each_value_6.length; i += 1) {
    				transition_in(each_blocks_5[i]);
    			}

    			for (let i = 0; i < each_value_5.length; i += 1) {
    				transition_in(each_blocks_4[i]);
    			}

    			for (let i = 0; i < each_value_4.length; i += 1) {
    				transition_in(each_blocks_3[i]);
    			}

    			transition_in(nodepickerslot0.$$.fragment, local);
    			transition_in(nodepickerslot1.$$.fragment, local);
    			transition_in(nodepickerslot2.$$.fragment, local);
    			transition_in(nodepickerslot3.$$.fragment, local);
    			transition_in(nodepickerslot4.$$.fragment, local);
    			transition_in(nodepickerslot5.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_8 = each_blocks_8.filter(Boolean);

    			for (let i = 0; i < each_blocks_8.length; i += 1) {
    				transition_out(each_blocks_8[i]);
    			}

    			each_blocks_7 = each_blocks_7.filter(Boolean);

    			for (let i = 0; i < each_blocks_7.length; i += 1) {
    				transition_out(each_blocks_7[i]);
    			}

    			each_blocks_6 = each_blocks_6.filter(Boolean);

    			for (let i = 0; i < each_blocks_6.length; i += 1) {
    				transition_out(each_blocks_6[i]);
    			}

    			each_blocks_5 = each_blocks_5.filter(Boolean);

    			for (let i = 0; i < each_blocks_5.length; i += 1) {
    				transition_out(each_blocks_5[i]);
    			}

    			each_blocks_4 = each_blocks_4.filter(Boolean);

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				transition_out(each_blocks_4[i]);
    			}

    			each_blocks_3 = each_blocks_3.filter(Boolean);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				transition_out(each_blocks_3[i]);
    			}

    			transition_out(nodepickerslot0.$$.fragment, local);
    			transition_out(nodepickerslot1.$$.fragment, local);
    			transition_out(nodepickerslot2.$$.fragment, local);
    			transition_out(nodepickerslot3.$$.fragment, local);
    			transition_out(nodepickerslot4.$$.fragment, local);
    			transition_out(nodepickerslot5.$$.fragment, local);
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks_8, detaching);
    			destroy_each(each_blocks_7, detaching);
    			destroy_each(each_blocks_6, detaching);
    			destroy_each(each_blocks_5, detaching);
    			destroy_each(each_blocks_4, detaching);
    			destroy_each(each_blocks_3, detaching);
    			destroy_each(each_blocks_2, detaching);
    			if (if_block) if_block.d();
    			/*div4_binding*/ ctx[69](null);
    			destroy_component(nodepickerslot0);
    			destroy_component(nodepickerslot1);
    			destroy_component(nodepickerslot2);
    			/*div5_binding*/ ctx[70](null);
    			destroy_component(nodepickerslot3);
    			destroy_component(nodepickerslot4);
    			/*div6_binding*/ ctx[71](null);
    			destroy_component(nodepickerslot5);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			/*div15_binding*/ ctx[77](null);
    			div15_resize_listener.cancel();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function makeid(length) {
    	var result = "";
    	var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    	var charactersLength = characters.length;

    	for (var i = 0; i < length; i++) {
    		result += characters.charAt(Math.floor(Math.random() * charactersLength));
    	}

    	return result;
    }

    const mousedown_handler$b = event => {
    	event.stopPropagation();
    };

    const mousewheel_handler = /* Disable Node Editor Scroll on Hover*/
    event => {
    	event.stopPropagation();
    };

    function instance$g($$self, $$props, $$invalidate) {
    	const path = require("path");
    	const fs = require("fs");
    	let viewX = 0, viewY = 0, viewZoom = 1;
    	const zoomBounds = [0.3, 5];
    	let viewportHeight, viewportWidth, viewportTop, viewportLeft;
    	let viewportRef;
    	let { nodeData } = $$props;
    	let { tableRef } = $$props;
    	let { tableData } = $$props;
    	let { resultWidgets } = $$props;
    	let { userSettings } = $$props;
    	let context = {};

    	//#region mouse
    	let mouseDrag = {
    		"ongoing": false,
    		"start": { "x": 0, "y": 0 },
    		"delta": { "x": 0, "y": 0 }
    	};

    	function mouseDown(event) {
    		if (userSettings.preferred_navigation_mb !== 3 && event.button != userSettings.preferred_navigation_mb) return;
    		$$invalidate(12, mouseDrag.ongoing = true, mouseDrag);
    		$$invalidate(12, mouseDrag.start.x = event.clientX, mouseDrag);
    		$$invalidate(12, mouseDrag.start.y = event.clientY, mouseDrag);
    	}

    	function mouseMove(event) {
    		if (!mouseDrag.ongoing) return;
    		$$invalidate(12, mouseDrag.delta.x = event.clientX - mouseDrag.start.x, mouseDrag);
    		$$invalidate(12, mouseDrag.delta.y = event.clientY - mouseDrag.start.y, mouseDrag);
    	}

    	function mouseUp(event) {
    		if (!mouseDrag.ongoing || event.button != userSettings.preferred_navigation_mb && userSettings.preferred_navigation_mb !== 3) return;
    		$$invalidate(12, mouseDrag.ongoing = false, mouseDrag);
    		$$invalidate(5, viewX += mouseDrag.delta.x);
    		$$invalidate(6, viewY += mouseDrag.delta.y);
    		$$invalidate(12, mouseDrag.delta = { "x": 0, "y": 0 }, mouseDrag);
    	}

    	function scroll(event) {
    		let oldZoom = viewZoom;
    		$$invalidate(7, viewZoom -= event.deltaY / 1000);
    		$$invalidate(7, viewZoom = Math.max(zoomBounds[0], Math.min(viewZoom, zoomBounds[1])));

    		if (viewZoom == zoomBounds[0] || viewZoom == zoomBounds[1]) {
    			$$invalidate(7, viewZoom = oldZoom);
    			return;
    		}

    		$$invalidate(5, viewX = (viewX - viewportWidth / 2) * viewZoom / oldZoom + viewportWidth / 2 + (event.clientX - viewportRef.offsetLeft - viewportWidth / 2) * Math.sign(event.deltaY) / oldZoom / 10);
    		$$invalidate(6, viewY = (viewY - viewportHeight / 2) * viewZoom / oldZoom + viewportHeight / 2 + (event.clientY - viewportRef.offsetTop - viewportHeight / 2) * Math.sign(event.deltaY) / oldZoom / 10);
    	}

    	function getNewId() {
    		let newId;

    		do {
    			newId = makeid(4);
    		} while (context[newId] != undefined);

    		$$invalidate(11, context[newId] = "Pending...", context);
    		return newId;
    	}

    	let nodeDrag = {
    		"ongoing": false,
    		"start": { "x": 0, "y": 0 },
    		"delta": { "x": 0, "y": 0 },
    		"layer": { "x": 0, "y": 0 },
    		"objectInfo": {
    			"type": "",
    			"ID": 0,
    			"width": 0,
    			"height": 0
    		}
    	};

    	function clearNodeDrag() {
    		nodeDrag = {
    			"ongoing": false,
    			"start": { "x": 0, "y": 0 },
    			"delta": { "x": 0, "y": 0 },
    			"layer": { "x": 0, "y": 0 },
    			"objectInfo": { "type": "", "ID": 0 }
    		};
    	}

    	function initNodeDrag(event, type, index) {
    		clearNodeDrag();

    		// Override default drag image
    		let imageOverride = document.createElement("img");

    		event.dataTransfer.setDragImage(imageOverride, 0, 0);

    		// Append necessary info
    		event.dataTransfer.setData("command", "moveNode");

    		event.dataTransfer.setData("nodeID", index);
    		event.dataTransfer.setData("nodeType", type);
    		event.dataTransfer.setData("startX", event.clientX);
    		event.dataTransfer.setData("startY", event.clientY);

    		// Update nodeDrag
    		nodeDrag.ongoing = true;

    		nodeDrag.start.x = event.clientX;
    		nodeDrag.start.y = event.clientY;
    		nodeDrag.objectInfo.type = type;
    		nodeDrag.objectInfo.ID = index;
    	}

    	function dragOver(event) {
    		event.preventDefault();
    		event.stopPropagation();
    		let vhConverter = window.innerHeight / 100 * 2 * viewZoom;

    		if (nodeDrag.ongoing) {
    			// Update objectDrag
    			nodeDrag.delta.x = Math.round((event.clientX - nodeDrag.start.x) / vhConverter);

    			nodeDrag.delta.y = Math.round((event.clientY - nodeDrag.start.y) / vhConverter);
    			nodeDrag.layer.x = event.layerX;
    			nodeDrag.layer.y = event.layerY;
    			$$invalidate(0, nodeData[nodeDrag.objectInfo.type][nodeDrag.objectInfo.ID].simX = nodeDrag.delta.x, nodeData);
    			$$invalidate(0, nodeData[nodeDrag.objectInfo.type][nodeDrag.objectInfo.ID].simY = nodeDrag.delta.y, nodeData);

    			connections.forEach(c => {
    				c.update();
    			});
    		}

    		if (simConnection.shown) {
    			simConnection.update(event);
    			$$invalidate(16, simConnection = Object.assign({}, simConnection));
    		}

    		if (nodeResize.ongoing) {
    			// Update nodeResize
    			nodeResize.delta.x = Math.round((event.clientX - nodeResize.start.x) / vhConverter);

    			nodeResize.delta.y = Math.round((event.clientY - nodeResize.start.y) / vhConverter);
    			$$invalidate(0, nodeData[nodeResize.nodeInfo.type][nodeResize.nodeInfo.ID].simResizeX = nodeResize.delta.x, nodeData);
    			$$invalidate(0, nodeData[nodeResize.nodeInfo.type][nodeResize.nodeInfo.ID].simResizeY = nodeResize.delta.y, nodeData);
    		}
    	}

    	function drop(event) {
    		event.stopPropagation();

    		switch (event.dataTransfer.getData("command")) {
    			case "createNode":
    				switch (event.dataTransfer.getData("nodeType")) {
    					case "input":
    						{
    							let newObj = {
    								"posX": Math.round((-viewX + event.layerX) / (window.innerHeight / 100 * 2 * viewZoom)),
    								"posY": Math.round((-viewY + event.layerY) / (window.innerHeight / 100 * 2 * viewZoom)),
    								"simX": 0,
    								"simY": 0,
    								"width": 6,
    								"outputID": getNewId(),
    								"color": "var(--red)",
    								"textcolor": "var(--text1)",
    								"selectedCol": 0,
    								"selectedRow": 0
    							};

    							nodeData[event.dataTransfer.getData("nodeType")].push(newObj);
    							return;
    						}
    					case "output":
    						{
    							let newObj = {
    								"posX": Math.round((-viewX + event.layerX) / (window.innerHeight / 100 * 2 * viewZoom)),
    								"posY": Math.round((-viewY + event.layerY) / (window.innerHeight / 100 * 2 * viewZoom)),
    								"simX": 0,
    								"simY": 0,
    								"width": 6,
    								"input": null,
    								"color": "var(--purple)",
    								"textcolor": "var(--text1)",
    								"selectedCol": 0,
    								"selectedRow": 0
    							};

    							nodeData[event.dataTransfer.getData("nodeType")].push(newObj);
    							$$invalidate(0, nodeData[event.dataTransfer.getData("nodeType")] = Object.assign([], nodeData[event.dataTransfer.getData("nodeType")]), nodeData);
    							return;
    						}
    					case "literal":
    						{
    							let newObj = {
    								"posX": Math.round((-viewX + event.layerX) / (window.innerHeight / 100 * 2 * viewZoom)),
    								"posY": Math.round((-viewY + event.layerY) / (window.innerHeight / 100 * 2 * viewZoom)),
    								"simX": 0,
    								"simY": 0,
    								"width": 6,
    								"outputID": getNewId(),
    								"color": "var(--velvet)",
    								"textcolor": "var(--text1)",
    								"id": event.dataTransfer.getData("nodeID"),
    								"value": undefined
    							};

    							nodeData[event.dataTransfer.getData("nodeType")].push(newObj);
    							return;
    						}
    					case "annotation":
    						{
    							let newObj = {
    								"posX": Math.round((-viewX + event.layerX) / (window.innerHeight / 100 * 2 * viewZoom)),
    								"posY": Math.round((-viewY + event.layerY) / (window.innerHeight / 100 * 2 * viewZoom)),
    								"simX": 0,
    								"simY": 0,
    								"sizeX": 10,
    								"sizeY": 5,
    								"simResizeX": 0,
    								"simResizeY": 0,
    								"width": 6,
    								"sizeBounds": [],
    								"id": event.dataTransfer.getData("nodeID"),
    								"text": "Annotation"
    							};

    							nodeData[event.dataTransfer.getData("nodeType")].push(newObj);
    							$$invalidate(0, nodeData[event.dataTransfer.getData("nodeType")] = Object.assign([], nodeData[event.dataTransfer.getData("nodeType")]), nodeData);
    							return;
    						}
    					case "result":
    						{
    							let newObj = {
    								"posX": Math.round((-viewX + event.layerX) / (window.innerHeight / 100 * 2 * viewZoom)),
    								"posY": Math.round((-viewY + event.layerY) / (window.innerHeight / 100 * 2 * viewZoom)),
    								"simX": 0,
    								"simY": 0,
    								"width": 8,
    								"input": null,
    								"color": "var(--blue)",
    								"textcolor": "var(--text1)",
    								"selectedResult": undefined
    							};

    							nodeData[event.dataTransfer.getData("nodeType")].push(newObj);
    							$$invalidate(0, nodeData[event.dataTransfer.getData("nodeType")] = Object.assign([], nodeData[event.dataTransfer.getData("nodeType")]), nodeData);
    							return;
    						}
    					default:
    						try {
    							const classRef = require(path.join(__dirname, "../src/_NodeResources/NodeTypes/") + event.dataTransfer.getData("nodeID"));
    							let nodeObject = new classRef([""], {});
    							let inputs = nodeObject.inputs.map(x => null);
    							let outputs = nodeObject.outputs.map(x => getNewId());

    							let newObj = {
    								"id": event.dataTransfer.getData("nodeID"),
    								"posX": Math.round((-viewX + event.layerX) / (window.innerHeight / 100 * 2 * viewZoom)),
    								"posY": Math.round((-viewY + event.layerY) / (window.innerHeight / 100 * 2 * viewZoom)),
    								"simX": 0,
    								"simY": 0,
    								"width": 6,
    								"reference": null,
    								inputs,
    								outputs,
    								"color": "var(--orange)"
    							};

    							nodeData[event.dataTransfer.getData("nodeType")].push(newObj);
    						} catch(err) {
    							let newObj = {
    								"id": event.dataTransfer.getData("nodeID"),
    								"posX": Math.round((-viewX + event.layerX) / (window.innerHeight / 100 * 2 * viewZoom)),
    								"posY": Math.round((-viewY + event.layerY) / (window.innerHeight / 100 * 2 * viewZoom)),
    								"simX": 0,
    								"simY": 0,
    								"width": 6,
    								"reference": null,
    								"inputs": [],
    								"outputs": [],
    								"color": "var(--red)"
    							};

    							nodeData[event.dataTransfer.getData("nodeType")].push(newObj);
    							$$invalidate(0, nodeData[event.dataTransfer.getData("nodeType")] = Object.assign([], nodeData[event.dataTransfer.getData("nodeType")]), nodeData);
    							console.error(err);
    						}
    						return;
    				}
    			case "moveNode":
    				$$invalidate(0, nodeData[event.dataTransfer.getData("nodeType")][event.dataTransfer.getData("nodeID")].posX += Math.round((event.clientX - event.dataTransfer.getData("startX")) / (window.innerHeight / 100 * 2 * viewZoom)), nodeData);
    				$$invalidate(0, nodeData[event.dataTransfer.getData("nodeType")][event.dataTransfer.getData("nodeID")].posY += Math.round((event.clientY - event.dataTransfer.getData("startY")) / (window.innerHeight / 100 * 2 * viewZoom)), nodeData);
    				$$invalidate(0, nodeData[event.dataTransfer.getData("nodeType")][event.dataTransfer.getData("nodeID")].simX = 0, nodeData);
    				$$invalidate(0, nodeData[event.dataTransfer.getData("nodeType")][event.dataTransfer.getData("nodeID")].simY = 0, nodeData);
    				clearNodeDrag();
    				//recalculateConnections();
    				break;
    			case "resize":
    				nodeResize.ongoing = false;
    				let sizeX = nodeData[event.dataTransfer.getData("nodeType")][event.dataTransfer.getData("nodeID")].sizeX;
    				let sizeY = nodeData[event.dataTransfer.getData("nodeType")][event.dataTransfer.getData("nodeID")].sizeY;
    				let sizeBounds = nodeData[event.dataTransfer.getData("nodeType")][event.dataTransfer.getData("nodeID")].sizeBounds;
    				$$invalidate(0, nodeData[event.dataTransfer.getData("nodeType")][event.dataTransfer.getData("nodeID")].sizeX = Math.max(sizeBounds[0][0], Math.min(sizeX + nodeResize.delta.x, sizeBounds[0][1])), nodeData);
    				$$invalidate(0, nodeData[event.dataTransfer.getData("nodeType")][event.dataTransfer.getData("nodeID")].sizeY = Math.max(sizeBounds[1][0], Math.min(sizeY + nodeResize.delta.y, sizeBounds[1][1])), nodeData);
    				$$invalidate(0, nodeData[event.dataTransfer.getData("nodeType")][event.dataTransfer.getData("nodeID")].simResizeX = 0, nodeData);
    				$$invalidate(0, nodeData[event.dataTransfer.getData("nodeType")][event.dataTransfer.getData("nodeID")].simResizeY = 0, nodeData);
    				break;
    		}
    	}

    	// Generate Connection Display Objects
    	let connections = [];

    	onMount(() => {
    		console.log(resultWidgets);
    		recalculateConnections();
    		constructNodePicker();
    	});

    	let nodeConfig = {};
    	let nodeCategories = [];

    	async function constructNodePicker() {
    		fs.readFile(path.join(__dirname, "../src/config/nodesConfig.json"), (err, file) => {
    			if (err) return;
    			$$invalidate(14, nodeConfig = JSON.parse(file));
    			$$invalidate(15, nodeCategories = Object.keys(nodeConfig));
    		});
    	}

    	let simConnection = {
    		"shown": false,
    		"node": null,
    		"index": 0,
    		"destX": 0,
    		"destY": 0,
    		"posX": 0,
    		"posY": 0,
    		"width": 0,
    		"height": 0,
    		"opacity": 0,
    		"update"(event) {
    			let mouseX = (-viewX + (event.pageX - viewportRef.offsetLeft)) / (window.innerHeight / 100 * 2 * viewZoom);
    			let mouseY = (-viewY + (event.pageY - viewportRef.offsetTop)) / (window.innerHeight / 100 * 2 * viewZoom);
    			this.posX = mouseX;
    			this.posY = mouseY;
    			this.destX = this.node.posX + this.node.simX + this.node.width - 0.75;
    			this.destY = this.node.posY + this.node.simY + (1 + (this.index + 1) * 1.5);
    			this.width = this.posX - this.destX;
    			this.height = this.posY - this.destY;
    		}
    	};

    	function initSimConnection(node, outputIndex) {
    		$$invalidate(16, simConnection.node = node, simConnection);
    		$$invalidate(16, simConnection.index = outputIndex, simConnection);
    		$$invalidate(16, simConnection.shown = true, simConnection);
    	}

    	function terminateSimConnection() {
    		$$invalidate(16, simConnection.shown = false, simConnection);
    		$$invalidate(16, simConnection.node = null, simConnection);
    		$$invalidate(16, simConnection.index = 0, simConnection);
    	}

    	function recalculateConnections(needsRefresh) {
    		$$invalidate(13, connections = []);

    		nodeData.operator.forEach(n => {
    			for (let i = 0; i < n.inputs.length; i++) {
    				if (n.inputs[i] != null) {
    					addConnection(n, n.inputs[i], i);
    				}
    			}
    		});

    		nodeData.output.forEach(n => {
    			if (n.input != null) {
    				addConnection(n, n.input, 0);
    			}
    		});

    		nodeData.result.forEach(n => {
    			if (n.input != null) {
    				addConnection(n, n.input, 0);
    			}
    		});

    		$$invalidate(13, connections = Object.assign([], connections));
    		if (needsRefresh) invokeOutputs();
    		console.log(connections);
    	}

    	function addConnection(node, output, index) {
    		try {
    			let destData = context[output].superNode.rawNodeData;

    			let newConnection = {
    				"posX": node.posX + node.simX + 0.75,
    				"posY": node.posY + node.simY + (1 + (index + 1) * 1.5),
    				"destX": destData.posX + destData.simX + destData.width - 0.75,
    				"destY": destData.posY + destData.simY + (1 + (destData.outputs.indexOf(output) + 1) * 1.5),
    				"width": destData.posX + destData.width - 0.75 - (node.posX + 0.75),
    				"height": destData.posY + (1 + (destData.outputs.indexOf(output) + 1) * 1.5) - (node.posY + (1 + (index + 1) * 1.5)),
    				"originColor": node.color,
    				"destColor": destData.color,
    				"inputHolder": node,
    				"outputHolder": context[output].superNode.rawNodeData,
    				"inputIndex": index,
    				"outputIndex": destData.outputs.indexOf(output),
    				"update"() {
    					this.posX = this.inputHolder.posX + this.inputHolder.simX + 0.75;
    					this.posY = this.inputHolder.posY + this.inputHolder.simY + (1 + (this.inputIndex + 1) * 1.5);
    					this.destX = this.outputHolder.posX + this.outputHolder.simX + this.outputHolder.width - 0.75;
    					this.destY = this.outputHolder.posY + this.outputHolder.simY + (1 + (this.outputIndex + 1) * 1.5);
    					this.width = this.posX - this.destX;
    					this.height = this.posY - this.destY;
    					$$invalidate(13, connections[connections.indexOf(this)] = Object.assign({}, this), connections);
    				}
    			};

    			connections.push(newConnection);
    			invokeOutputs();
    			$$invalidate(13, connections = Object.assign([], connections));
    		} catch(err) {
    			console.error(err);
    		}
    	}

    	function mutateConnection(connection, io, index, newX, newY, nodeWidth) {
    		if (!io) {
    			let oldPosX = connection.posX;
    			let oldPosY = connection.posY;
    			connection.posX = newX + 0.75;
    			connection.posY = newY + (1 + (index + 1) * 1.5);
    			connection.width = connection.width - (oldPosX - connection.posX);
    			connection.height = connection.height - (oldPosY - connection.posY);
    		} else {
    			let oldDestX = connection.destX;
    			let oldDestY = connection.destY;
    			connection.destX = newX + nodeWidth - 0.75;
    			connection.destY = newY + (1 + (index + 1) * 1.5);
    			connection.width = connection.width - (oldDestX - connection.destX);
    			connection.height = connection.height - (oldDestY - connection.destY);
    		}

    		/* let newConnection = {
        "posX": node.posX + .75,
        "posY": node.posY + (1 + (index + 1)*1.5),
        "destX": destData.posX + destData.width - .75,
        "destY": destData.posY + (1 + (destData.outputs.indexOf(input) + 1) * 1.5),
        "width": (destData.posX + destData.width - .75) - (node.posX + .75),
        "height": (destData.posY + (1 + (destData.outputs.indexOf(input) + 1) * 1.5)) - (node.posY + (1 + (index + 1)*1.5)),
        "originColor": node.color,
        "destColor": destData.color
    }; */
    		console.log(newConnection, destData);

    		$$invalidate(13, connections = Object.assign([], connections));
    	}

    	function deleteNode(type, index) {
    		nodeData[type].splice(index, 1);
    		$$invalidate(0, nodeData[type] = Object.assign([], nodeData[type]), nodeData);
    		recalculateConnections();
    	}

    	let outputProcessCallbacks = [];
    	let resultProcessCallbacks = [];

    	function invokeOutputs() {
    		outputProcessCallbacks.forEach(callback => {
    			try {
    				callback();
    			} catch(err) {
    				console.error(err);
    			}
    		});

    		resultProcessCallbacks.forEach(callback => {
    			try {
    				callback();
    			} catch(err) {
    				console.error(err);
    			}
    		});
    	}

    	// Node Picker Navigator
    	let categoryLabels = [];

    	function navJump(index) {
    		console.log(categoryLabels[index]);
    		if (!categoryLabels[index]) return;
    		categoryLabels[index].scrollIntoView({ behavior: "smooth" });
    	}

    	function initNodeResize(event, type, index) {
    		clearNodeDrag();
    		clearNodeResize();

    		// Override default drag image
    		let imageOverride = document.createElement("img");

    		event.dataTransfer.setDragImage(imageOverride, 0, 0);
    		event.dataTransfer.setData("command", "resize");
    		event.dataTransfer.setData("nodeType", type);
    		event.dataTransfer.setData("nodeID", index);
    		nodeResize.start.x = event.clientX;
    		nodeResize.start.y = event.clientY;
    		nodeResize.nodeInfo.type = type;
    		nodeResize.nodeInfo.ID = index;
    		nodeResize.ongoing = true;
    	}

    	let nodeResize = {
    		"ongoing": false,
    		"start": { "x": 0, "y": 0 },
    		"delta": { "x": 0, "y": 0 },
    		"nodeInfo": { "type": "", "ID": 0 }
    	};

    	function clearNodeResize() {
    		nodeResize = {
    			"ongoing": false,
    			"start": { "x": 0, "y": 0 },
    			"delta": { "x": 0, "y": 0 },
    			"nodeInfo": { "type": "", "ID": 0 }
    		};
    	}

    	const writable_props = ["nodeData", "tableRef", "tableData", "resultWidgets", "userSettings"];

    	Object_1$5.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$6.warn(`<NodeEditor> was created with unknown prop '${key}'`);
    	});

    	const func = (index, event) => initNodeDrag(event, "operator", index);

    	const func_1 = index => {
    		deleteNode("operator", index);
    	};

    	const func_2 = (node, output, index, removeOld) => {
    		addConnection(node, output, index);
    		if (removeOld) recalculateConnections();
    	};

    	function node_nodeObject_binding(value, node) {
    		node.reference = value;
    		$$invalidate(0, nodeData);
    	}

    	const func_3 = (index, event) => initNodeDrag(event, "literal", index);

    	const func_4 = index => {
    		deleteNode("literal", index);
    	};

    	const func_5 = (index, event) => initNodeDrag(event, "input", index);

    	const func_6 = index => {
    		deleteNode("input", index);
    	};

    	const func_7 = (index, event) => initNodeDrag(event, "output", index);

    	const func_8 = index => {
    		deleteNode("output", index);
    	};

    	const func_9 = (node, output, index, removeOld) => {
    		addConnection(node, output, index);
    		if (removeOld) recalculateConnections();
    	};

    	function outputnode_process_binding(value, index) {
    		outputProcessCallbacks[index] = value;
    		$$invalidate(17, outputProcessCallbacks);
    	}

    	const func_10 = (index, event) => initNodeDrag(event, "result", index);

    	const func_11 = index => {
    		deleteNode("result", index);
    	};

    	const func_12 = (node, output, index, removeOld) => {
    		addConnection(node, output, index);
    		if (removeOld) recalculateConnections();
    	};

    	function resultnode_resultWidgets_binding(value) {
    		resultWidgets = value;
    		$$invalidate(1, resultWidgets);
    	}

    	function resultnode_process_binding(value, index) {
    		resultProcessCallbacks[index] = value;
    		$$invalidate(18, resultProcessCallbacks);
    	}

    	const func_13 = (index, event) => initNodeDrag(event, "annotation", index);

    	const func_14 = index => {
    		deleteNode("annotation", index);
    	};

    	const func_15 = (index, event) => {
    		initNodeResize(event, "annotation", index);
    	};

    	function annotationnode_sizeBounds_binding(value, node) {
    		node.sizeBounds = value;
    		$$invalidate(0, nodeData);
    	}

    	function annotationnode_text_binding(value, node) {
    		node.text = value;
    		$$invalidate(0, nodeData);
    	}

    	function div4_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			categoryLabels[0] = $$value;
    			$$invalidate(19, categoryLabels);
    		});
    	}

    	function div5_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			categoryLabels[1] = $$value;
    			$$invalidate(19, categoryLabels);
    		});
    	}

    	function div6_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			categoryLabels[2] = $$value;
    			$$invalidate(19, categoryLabels);
    		});
    	}

    	function div_binding($$value, index) {
    		if (categoryLabels[index + 3] === $$value) return;

    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			categoryLabels[index + 3] = $$value;
    			$$invalidate(19, categoryLabels);
    		});
    	}

    	const click_handler = () => {
    		navJump(0);
    	};

    	const click_handler_1 = () => {
    		navJump(1);
    	};

    	const click_handler_2 = () => {
    		navJump(2);
    	};

    	const click_handler_3 = index => {
    		navJump(index + 3);
    	};

    	function div15_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(10, viewportRef = $$value);
    		});
    	}

    	function div15_elementresize_handler() {
    		viewportHeight = this.offsetHeight;
    		viewportWidth = this.offsetWidth;
    		$$invalidate(8, viewportHeight);
    		$$invalidate(9, viewportWidth);
    	}

    	$$self.$set = $$props => {
    		if ("nodeData" in $$props) $$invalidate(0, nodeData = $$props.nodeData);
    		if ("tableRef" in $$props) $$invalidate(2, tableRef = $$props.tableRef);
    		if ("tableData" in $$props) $$invalidate(3, tableData = $$props.tableData);
    		if ("resultWidgets" in $$props) $$invalidate(1, resultWidgets = $$props.resultWidgets);
    		if ("userSettings" in $$props) $$invalidate(34, userSettings = $$props.userSettings);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Node,
    		InputNode,
    		OutputNode,
    		ResultNode,
    		NodePickerSlot,
    		LiteralNode,
    		AnnotationNode,
    		path,
    		fs,
    		viewX,
    		viewY,
    		viewZoom,
    		zoomBounds,
    		viewportHeight,
    		viewportWidth,
    		viewportTop,
    		viewportLeft,
    		viewportRef,
    		nodeData,
    		tableRef,
    		tableData,
    		resultWidgets,
    		userSettings,
    		context,
    		mouseDrag,
    		mouseDown,
    		mouseMove,
    		mouseUp,
    		scroll,
    		makeid,
    		getNewId,
    		nodeDrag,
    		clearNodeDrag,
    		initNodeDrag,
    		dragOver,
    		drop,
    		connections,
    		nodeConfig,
    		nodeCategories,
    		constructNodePicker,
    		simConnection,
    		initSimConnection,
    		terminateSimConnection,
    		recalculateConnections,
    		addConnection,
    		mutateConnection,
    		deleteNode,
    		outputProcessCallbacks,
    		resultProcessCallbacks,
    		invokeOutputs,
    		categoryLabels,
    		navJump,
    		initNodeResize,
    		nodeResize,
    		clearNodeResize,
    		require,
    		Math,
    		undefined,
    		document,
    		window,
    		Object,
    		__dirname,
    		console,
    		JSON,
    		newConnection,
    		destData
    	});

    	$$self.$inject_state = $$props => {
    		if ("viewX" in $$props) $$invalidate(5, viewX = $$props.viewX);
    		if ("viewY" in $$props) $$invalidate(6, viewY = $$props.viewY);
    		if ("viewZoom" in $$props) $$invalidate(7, viewZoom = $$props.viewZoom);
    		if ("viewportHeight" in $$props) $$invalidate(8, viewportHeight = $$props.viewportHeight);
    		if ("viewportWidth" in $$props) $$invalidate(9, viewportWidth = $$props.viewportWidth);
    		if ("viewportTop" in $$props) viewportTop = $$props.viewportTop;
    		if ("viewportLeft" in $$props) viewportLeft = $$props.viewportLeft;
    		if ("viewportRef" in $$props) $$invalidate(10, viewportRef = $$props.viewportRef);
    		if ("nodeData" in $$props) $$invalidate(0, nodeData = $$props.nodeData);
    		if ("tableRef" in $$props) $$invalidate(2, tableRef = $$props.tableRef);
    		if ("tableData" in $$props) $$invalidate(3, tableData = $$props.tableData);
    		if ("resultWidgets" in $$props) $$invalidate(1, resultWidgets = $$props.resultWidgets);
    		if ("userSettings" in $$props) $$invalidate(34, userSettings = $$props.userSettings);
    		if ("context" in $$props) $$invalidate(11, context = $$props.context);
    		if ("mouseDrag" in $$props) $$invalidate(12, mouseDrag = $$props.mouseDrag);
    		if ("nodeDrag" in $$props) nodeDrag = $$props.nodeDrag;
    		if ("connections" in $$props) $$invalidate(13, connections = $$props.connections);
    		if ("nodeConfig" in $$props) $$invalidate(14, nodeConfig = $$props.nodeConfig);
    		if ("nodeCategories" in $$props) $$invalidate(15, nodeCategories = $$props.nodeCategories);
    		if ("simConnection" in $$props) $$invalidate(16, simConnection = $$props.simConnection);
    		if ("outputProcessCallbacks" in $$props) $$invalidate(17, outputProcessCallbacks = $$props.outputProcessCallbacks);
    		if ("resultProcessCallbacks" in $$props) $$invalidate(18, resultProcessCallbacks = $$props.resultProcessCallbacks);
    		if ("categoryLabels" in $$props) $$invalidate(19, categoryLabels = $$props.categoryLabels);
    		if ("nodeResize" in $$props) nodeResize = $$props.nodeResize;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		nodeData,
    		resultWidgets,
    		tableRef,
    		tableData,
    		invokeOutputs,
    		viewX,
    		viewY,
    		viewZoom,
    		viewportHeight,
    		viewportWidth,
    		viewportRef,
    		context,
    		mouseDrag,
    		connections,
    		nodeConfig,
    		nodeCategories,
    		simConnection,
    		outputProcessCallbacks,
    		resultProcessCallbacks,
    		categoryLabels,
    		mouseDown,
    		mouseMove,
    		mouseUp,
    		scroll,
    		initNodeDrag,
    		dragOver,
    		drop,
    		initSimConnection,
    		terminateSimConnection,
    		recalculateConnections,
    		addConnection,
    		deleteNode,
    		navJump,
    		initNodeResize,
    		userSettings,
    		nodeDrag,
    		nodeResize,
    		path,
    		fs,
    		zoomBounds,
    		viewportTop,
    		viewportLeft,
    		getNewId,
    		clearNodeDrag,
    		constructNodePicker,
    		mutateConnection,
    		clearNodeResize,
    		func,
    		func_1,
    		func_2,
    		node_nodeObject_binding,
    		func_3,
    		func_4,
    		func_5,
    		func_6,
    		func_7,
    		func_8,
    		func_9,
    		outputnode_process_binding,
    		func_10,
    		func_11,
    		func_12,
    		resultnode_resultWidgets_binding,
    		resultnode_process_binding,
    		func_13,
    		func_14,
    		func_15,
    		annotationnode_sizeBounds_binding,
    		annotationnode_text_binding,
    		div4_binding,
    		div5_binding,
    		div6_binding,
    		div_binding,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		div15_binding,
    		div15_elementresize_handler
    	];
    }

    class NodeEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$g,
    			create_fragment$g,
    			safe_not_equal,
    			{
    				nodeData: 0,
    				tableRef: 2,
    				tableData: 3,
    				resultWidgets: 1,
    				userSettings: 34,
    				invokeOutputs: 4
    			},
    			[-1, -1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NodeEditor",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nodeData*/ ctx[0] === undefined && !("nodeData" in props)) {
    			console_1$6.warn("<NodeEditor> was created without expected prop 'nodeData'");
    		}

    		if (/*tableRef*/ ctx[2] === undefined && !("tableRef" in props)) {
    			console_1$6.warn("<NodeEditor> was created without expected prop 'tableRef'");
    		}

    		if (/*tableData*/ ctx[3] === undefined && !("tableData" in props)) {
    			console_1$6.warn("<NodeEditor> was created without expected prop 'tableData'");
    		}

    		if (/*resultWidgets*/ ctx[1] === undefined && !("resultWidgets" in props)) {
    			console_1$6.warn("<NodeEditor> was created without expected prop 'resultWidgets'");
    		}

    		if (/*userSettings*/ ctx[34] === undefined && !("userSettings" in props)) {
    			console_1$6.warn("<NodeEditor> was created without expected prop 'userSettings'");
    		}
    	}

    	get nodeData() {
    		throw new Error("<NodeEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nodeData(value) {
    		throw new Error("<NodeEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tableRef() {
    		throw new Error("<NodeEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tableRef(value) {
    		throw new Error("<NodeEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tableData() {
    		throw new Error("<NodeEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tableData(value) {
    		throw new Error("<NodeEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get resultWidgets() {
    		throw new Error("<NodeEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set resultWidgets(value) {
    		throw new Error("<NodeEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get userSettings() {
    		throw new Error("<NodeEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set userSettings(value) {
    		throw new Error("<NodeEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get invokeOutputs() {
    		return this.$$.ctx[4];
    	}

    	set invokeOutputs(value) {
    		throw new Error("<NodeEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Toolkit\CategoryButton.svelte generated by Svelte v3.19.1 */

    const file$h = "src\\Toolkit\\CategoryButton.svelte";

    function create_fragment$h(ctx) {
    	let main;
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let h1;
    	let t1;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div2 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			t1 = text(/*label*/ ctx[0]);
    			attr_dev(div0, "class", "slotContainer svelte-aaopqf");
    			add_location(div0, file$h, 13, 8, 225);
    			attr_dev(h1, "class", "svelte-aaopqf");
    			add_location(h1, file$h, 17, 12, 342);
    			attr_dev(div1, "class", "labelContainer svelte-aaopqf");
    			add_location(div1, file$h, 16, 8, 300);
    			attr_dev(div2, "class", "frame neuOutdentShadow svelte-aaopqf");
    			add_location(div2, file$h, 12, 4, 156);
    			attr_dev(main, "class", "svelte-aaopqf");
    			add_location(main, file$h, 11, 0, 144);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div2);
    			append_dev(div2, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t1);
    			current = true;
    			dispose = listen_dev(div2, "click", /*handleClick*/ ctx[1], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 8) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[3], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null));
    			}

    			if (!current || dirty & /*label*/ 1) set_data_dev(t1, /*label*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { onClick } = $$props;

    	function handleClick() {
    		onClick();
    	}

    	let { label = "Label" } = $$props;
    	const writable_props = ["onClick", "label"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CategoryButton> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("onClick" in $$props) $$invalidate(2, onClick = $$props.onClick);
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ onClick, handleClick, label });

    	$$self.$inject_state = $$props => {
    		if ("onClick" in $$props) $$invalidate(2, onClick = $$props.onClick);
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [label, handleClick, onClick, $$scope, $$slots];
    }

    class CategoryButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { onClick: 2, label: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CategoryButton",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onClick*/ ctx[2] === undefined && !("onClick" in props)) {
    			console.warn("<CategoryButton> was created without expected prop 'onClick'");
    		}
    	}

    	get onClick() {
    		throw new Error("<CategoryButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<CategoryButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<CategoryButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<CategoryButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Toolkit\ToolkitWidget.svelte generated by Svelte v3.19.1 */

    const file$i = "src\\Toolkit\\ToolkitWidget.svelte";

    function create_fragment$i(ctx) {
    	let main;
    	let div0;
    	let t0;
    	let div1;
    	let h3;
    	let t1;
    	let t2;
    	let hr;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			div1 = element("div");
    			h3 = element("h3");
    			t1 = text(/*label*/ ctx[0]);
    			t2 = space();
    			hr = element("hr");
    			attr_dev(div0, "class", "svgContainer svelte-bz36hf");
    			add_location(div0, file$i, 16, 4, 347);
    			attr_dev(h3, "class", "svelte-bz36hf");
    			add_location(h3, file$i, 20, 8, 447);
    			attr_dev(div1, "class", "labelContainer svelte-bz36hf");
    			add_location(div1, file$i, 19, 4, 409);
    			attr_dev(hr, "class", "svelte-bz36hf");
    			add_location(hr, file$i, 22, 4, 481);
    			attr_dev(main, "draggable", "true");
    			attr_dev(main, "class", "svelte-bz36hf");
    			add_location(main, file$i, 15, 0, 292);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(main, t0);
    			append_dev(main, div1);
    			append_dev(div1, h3);
    			append_dev(h3, t1);
    			append_dev(main, t2);
    			append_dev(main, hr);
    			current = true;
    			dispose = listen_dev(main, "dragstart", /*initDrag*/ ctx[1], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 16) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[4], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null));
    			}

    			if (!current || dirty & /*label*/ 1) set_data_dev(t1, /*label*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { label = "unknown" } = $$props;
    	let { animationDelay = 0 } = $$props;
    	let { objectType } = $$props;

    	function initDrag(event) {
    		event.dataTransfer.setData("command", "create");
    		event.dataTransfer.setData("objectType", objectType);
    	}

    	const writable_props = ["label", "animationDelay", "objectType"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ToolkitWidget> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("animationDelay" in $$props) $$invalidate(2, animationDelay = $$props.animationDelay);
    		if ("objectType" in $$props) $$invalidate(3, objectType = $$props.objectType);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		label,
    		animationDelay,
    		objectType,
    		initDrag
    	});

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("animationDelay" in $$props) $$invalidate(2, animationDelay = $$props.animationDelay);
    		if ("objectType" in $$props) $$invalidate(3, objectType = $$props.objectType);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [label, initDrag, animationDelay, objectType, $$scope, $$slots];
    }

    class ToolkitWidget extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {
    			label: 0,
    			animationDelay: 2,
    			objectType: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToolkitWidget",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*objectType*/ ctx[3] === undefined && !("objectType" in props)) {
    			console.warn("<ToolkitWidget> was created without expected prop 'objectType'");
    		}
    	}

    	get label() {
    		throw new Error("<ToolkitWidget>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<ToolkitWidget>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get animationDelay() {
    		throw new Error("<ToolkitWidget>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set animationDelay(value) {
    		throw new Error("<ToolkitWidget>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get objectType() {
    		throw new Error("<ToolkitWidget>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set objectType(value) {
    		throw new Error("<ToolkitWidget>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Toolkit\Toolkit.svelte generated by Svelte v3.19.1 */
    const file$j = "src\\Toolkit\\Toolkit.svelte";

    // (31:4) {:else}
    function create_else_block$1(ctx) {
    	let div0;
    	let svg;
    	let path;
    	let t0;
    	let div1;
    	let t1;
    	let current;
    	let dispose;
    	let if_block0 = /*category*/ ctx[0] == 0 && create_if_block_2$2(ctx);
    	let if_block1 = /*category*/ ctx[0] == 1 && create_if_block_1$5(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(path, "d", "M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z");
    			add_location(path, file$j, 32, 242, 1714);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 320 512");
    			attr_dev(svg, "class", "svelte-1qmj3si");
    			add_location(svg, file$j, 32, 12, 1484);
    			attr_dev(div0, "class", "backButtonContainer neuOutdentShadow svelte-1qmj3si");
    			add_location(div0, file$j, 31, 8, 1385);
    			attr_dev(div1, "class", "listFrame neuOutdentShadow svelte-1qmj3si");
    			add_location(div1, file$j, 34, 8, 1926);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t1);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;
    			dispose = listen_dev(div0, "click", /*click_handler*/ ctx[3], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (/*category*/ ctx[0] == 0) {
    				if (!if_block0) {
    					if_block0 = create_if_block_2$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div1, t1);
    				} else {
    					transition_in(if_block0, 1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*category*/ ctx[0] == 1) {
    				if (!if_block1) {
    					if_block1 = create_if_block_1$5(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				} else {
    					transition_in(if_block1, 1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(31:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (11:4) {#if category == null}
    function create_if_block$5(ctx) {
    	let div;
    	let t;
    	let current;

    	const categorybutton0 = new CategoryButton({
    			props: {
    				onClick: /*func*/ ctx[1],
    				label: "Text",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const categorybutton1 = new CategoryButton({
    			props: {
    				onClick: /*func_1*/ ctx[2],
    				label: "Data",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(categorybutton0.$$.fragment);
    			t = space();
    			create_component(categorybutton1.$$.fragment);
    			attr_dev(div, "class", "categoryButtonLayout svelte-1qmj3si");
    			add_location(div, file$j, 11, 8, 215);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(categorybutton0, div, null);
    			append_dev(div, t);
    			mount_component(categorybutton1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const categorybutton0_changes = {};
    			if (dirty & /*category*/ 1) categorybutton0_changes.onClick = /*func*/ ctx[1];

    			if (dirty & /*$$scope*/ 16) {
    				categorybutton0_changes.$$scope = { dirty, ctx };
    			}

    			categorybutton0.$set(categorybutton0_changes);
    			const categorybutton1_changes = {};
    			if (dirty & /*category*/ 1) categorybutton1_changes.onClick = /*func_1*/ ctx[2];

    			if (dirty & /*$$scope*/ 16) {
    				categorybutton1_changes.$$scope = { dirty, ctx };
    			}

    			categorybutton1.$set(categorybutton1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(categorybutton0.$$.fragment, local);
    			transition_in(categorybutton1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(categorybutton0.$$.fragment, local);
    			transition_out(categorybutton1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(categorybutton0);
    			destroy_component(categorybutton1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(11:4) {#if category == null}",
    		ctx
    	});

    	return block;
    }

    // (37:12) {#if category == 0}
    function create_if_block_2$2(ctx) {
    	let t;
    	let current;

    	const toolkitwidget0 = new ToolkitWidget({
    			props: {
    				label: "Header",
    				objectType: "header",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const toolkitwidget1 = new ToolkitWidget({
    			props: {
    				label: "Paragraph",
    				objectType: "paragraph",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(toolkitwidget0.$$.fragment);
    			t = space();
    			create_component(toolkitwidget1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toolkitwidget0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(toolkitwidget1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toolkitwidget0.$$.fragment, local);
    			transition_in(toolkitwidget1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toolkitwidget0.$$.fragment, local);
    			transition_out(toolkitwidget1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toolkitwidget0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(toolkitwidget1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(37:12) {#if category == 0}",
    		ctx
    	});

    	return block;
    }

    // (38:16) <ToolkitWidget                       label="Header"                      objectType="header"                  >
    function create_default_slot_5(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM336 152V256 360c0 13.3-10.7 24-24 24s-24-10.7-24-24V280H160l0 80c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-208c0-13.3 10.7-24 24-24s24 10.7 24 24v80H288V152c0-13.3 10.7-24 24-24s24 10.7 24 24z");
    			add_location(path, file$j, 42, 24, 2240);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 448 512");
    			attr_dev(svg, "class", "svelte-1qmj3si");
    			add_location(svg, file$j, 41, 20, 2152);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(38:16) <ToolkitWidget                       label=\\\"Header\\\"                      objectType=\\\"header\\\"                  >",
    		ctx
    	});

    	return block;
    }

    // (46:16) <ToolkitWidget                      label="Paragraph"                      objectType="paragraph"                  >
    function create_default_slot_4(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM336 152V256 360c0 13.3-10.7 24-24 24s-24-10.7-24-24V280H160l0 80c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-208c0-13.3 10.7-24 24-24s24 10.7 24 24v80H288V152c0-13.3 10.7-24 24-24s24 10.7 24 24z");
    			add_location(path, file$j, 50, 24, 2851);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 448 512");
    			attr_dev(svg, "class", "svelte-1qmj3si");
    			add_location(svg, file$j, 49, 20, 2763);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(46:16) <ToolkitWidget                      label=\\\"Paragraph\\\"                      objectType=\\\"paragraph\\\"                  >",
    		ctx
    	});

    	return block;
    }

    // (56:12) {#if category == 1}
    function create_if_block_1$5(ctx) {
    	let t;
    	let current;

    	const toolkitwidget0 = new ToolkitWidget({
    			props: {
    				label: "Smart Table",
    				objectType: "table",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const toolkitwidget1 = new ToolkitWidget({
    			props: {
    				label: "Result",
    				objectType: "result",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(toolkitwidget0.$$.fragment);
    			t = space();
    			create_component(toolkitwidget1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toolkitwidget0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(toolkitwidget1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toolkitwidget0.$$.fragment, local);
    			transition_in(toolkitwidget1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toolkitwidget0.$$.fragment, local);
    			transition_out(toolkitwidget1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toolkitwidget0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(toolkitwidget1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(56:12) {#if category == 1}",
    		ctx
    	});

    	return block;
    }

    // (57:16) <ToolkitWidget                      label="Smart Table"                      objectType="table"                  >
    function create_default_slot_3(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm88 64v64H64V96h88zm56 0h88v64H208V96zm240 0v64H360V96h88zM64 224h88v64H64V224zm232 0v64H208V224h88zm64 0h88v64H360V224zM152 352v64H64V352h88zm56 0h88v64H208V352zm240 0v64H360V352h88z");
    			add_location(path, file$j, 60, 246, 3652);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			attr_dev(svg, "class", "svelte-1qmj3si");
    			add_location(svg, file$j, 60, 16, 3422);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(57:16) <ToolkitWidget                      label=\\\"Smart Table\\\"                      objectType=\\\"table\\\"                  >",
    		ctx
    	});

    	return block;
    }

    // (64:16) <ToolkitWidget                      label="Result"                      objectType="result"                  >
    function create_default_slot_2(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M342.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 178.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l80 80c12.5 12.5 32.8 12.5 45.3 0l160-160zm96 128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 402.7 54.6 297.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l256-256z");
    			add_location(path, file$j, 67, 247, 4370);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 448 512");
    			attr_dev(svg, "class", "svelte-1qmj3si");
    			add_location(svg, file$j, 67, 16, 4139);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(64:16) <ToolkitWidget                      label=\\\"Result\\\"                      objectType=\\\"result\\\"                  >",
    		ctx
    	});

    	return block;
    }

    // (13:12) <CategoryButton                  onClick={() => {category = 0}}                  label="Text"              >
    function create_default_slot_1(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "var(--red)");
    			attr_dev(path, "d", "M254 52.8C249.3 40.3 237.3 32 224 32s-25.3 8.3-30 20.8L57.8 416H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32h-1.8l18-48H303.8l18 48H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H390.2L254 52.8zM279.8 304H168.2L224 155.1 279.8 304z");
    			add_location(path, file$j, 17, 20, 473);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 448 512");
    			add_location(svg, file$j, 16, 16, 389);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(13:12) <CategoryButton                  onClick={() => {category = 0}}                  label=\\\"Text\\\"              >",
    		ctx
    	});

    	return block;
    }

    // (22:12) <CategoryButton                  onClick={() => {category = 1}}                  label="Data"              >
    function create_default_slot(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "var(--red)");
    			attr_dev(path, "d", "M64 256V160H224v96H64zm0 64H224v96H64V320zm224 96V320H448v96H288zM448 256H288V160H448v96zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64z");
    			add_location(path, file$j, 26, 16, 1072);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			add_location(svg, file$j, 25, 12, 992);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(22:12) <CategoryButton                  onClick={() => {category = 1}}                  label=\\\"Data\\\"              >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$5, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*category*/ ctx[0] == null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			attr_dev(main, "class", "svelte-1qmj3si");
    			add_location(main, file$j, 9, 0, 171);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_blocks[current_block_type_index].m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(main, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let category = null;

    	const func = () => {
    		$$invalidate(0, category = 0);
    	};

    	const func_1 = () => {
    		$$invalidate(0, category = 1);
    	};

    	const click_handler = () => {
    		$$invalidate(0, category = null);
    	};

    	$$self.$capture_state = () => ({ CategoryButton, ToolkitWidget, category });

    	$$self.$inject_state = $$props => {
    		if ("category" in $$props) $$invalidate(0, category = $$props.category);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [category, func, func_1, click_handler];
    }

    class Toolkit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toolkit",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src\DebugConsole.svelte generated by Svelte v3.19.1 */

    const file$k = "src\\DebugConsole.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (9:8) {#each info as line}
    function create_each_block$6(ctx) {
    	let p;
    	let t_value = /*line*/ ctx[1] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-9oaxaq");
    			add_location(p, file$k, 9, 12, 145);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*info*/ 1 && t_value !== (t_value = /*line*/ ctx[1] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(9:8) {#each info as line}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let main;
    	let div;
    	let each_value = /*info*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "frame neuIndentShadow svelte-9oaxaq");
    			add_location(div, file$k, 7, 4, 66);
    			attr_dev(main, "class", "svelte-9oaxaq");
    			add_location(main, file$k, 6, 0, 54);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*info*/ 1) {
    				each_value = /*info*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { info = [] } = $$props;
    	const writable_props = ["info"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DebugConsole> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("info" in $$props) $$invalidate(0, info = $$props.info);
    	};

    	$$self.$capture_state = () => ({ info });

    	$$self.$inject_state = $$props => {
    		if ("info" in $$props) $$invalidate(0, info = $$props.info);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [info];
    }

    class DebugConsole extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { info: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DebugConsole",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get info() {
    		throw new Error("<DebugConsole>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set info(value) {
    		throw new Error("<DebugConsole>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Settings\SettingsCategory.svelte generated by Svelte v3.19.1 */

    const file$l = "src\\Settings\\SettingsCategory.svelte";

    function create_fragment$l(ctx) {
    	let main;
    	let div0;
    	let t0;
    	let div1;
    	let p;
    	let t1;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			t1 = text(/*label*/ ctx[0]);
    			attr_dev(div0, "class", "iconContainer svelte-1j3r14m");
    			add_location(div0, file$l, 12, 4, 245);
    			attr_dev(p, "class", "svelte-1j3r14m");
    			add_location(p, file$l, 16, 8, 357);
    			attr_dev(div1, "class", "descriptionContainer svelte-1j3r14m");
    			add_location(div1, file$l, 15, 4, 313);
    			set_style(main, "opacity", /*selected*/ ctx[1] ? "1" : ".5");
    			set_style(main, "transform", "translateX(" + (/*selected*/ ctx[1] ? ".2" : "0") + "vh)");
    			attr_dev(main, "class", "svelte-1j3r14m");
    			add_location(main, file$l, 8, 0, 105);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(main, t0);
    			append_dev(main, div1);
    			append_dev(div1, p);
    			append_dev(p, t1);
    			current = true;

    			dispose = listen_dev(
    				main,
    				"click",
    				function () {
    					if (is_function(/*clickAction*/ ctx[2])) /*clickAction*/ ctx[2].apply(this, arguments);
    				},
    				false,
    				false,
    				false
    			);
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 8) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[3], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null));
    			}

    			if (!current || dirty & /*label*/ 1) set_data_dev(t1, /*label*/ ctx[0]);

    			if (!current || dirty & /*selected*/ 2) {
    				set_style(main, "opacity", /*selected*/ ctx[1] ? "1" : ".5");
    			}

    			if (!current || dirty & /*selected*/ 2) {
    				set_style(main, "transform", "translateX(" + (/*selected*/ ctx[1] ? ".2" : "0") + "vh)");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { label } = $$props;
    	let { selected } = $$props;
    	let { clickAction } = $$props;
    	const writable_props = ["label", "selected", "clickAction"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SettingsCategory> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("clickAction" in $$props) $$invalidate(2, clickAction = $$props.clickAction);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ label, selected, clickAction });

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("clickAction" in $$props) $$invalidate(2, clickAction = $$props.clickAction);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [label, selected, clickAction, $$scope, $$slots];
    }

    class SettingsCategory extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { label: 0, selected: 1, clickAction: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SettingsCategory",
    			options,
    			id: create_fragment$l.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*label*/ ctx[0] === undefined && !("label" in props)) {
    			console.warn("<SettingsCategory> was created without expected prop 'label'");
    		}

    		if (/*selected*/ ctx[1] === undefined && !("selected" in props)) {
    			console.warn("<SettingsCategory> was created without expected prop 'selected'");
    		}

    		if (/*clickAction*/ ctx[2] === undefined && !("clickAction" in props)) {
    			console.warn("<SettingsCategory> was created without expected prop 'clickAction'");
    		}
    	}

    	get label() {
    		throw new Error("<SettingsCategory>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<SettingsCategory>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<SettingsCategory>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<SettingsCategory>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clickAction() {
    		throw new Error("<SettingsCategory>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clickAction(value) {
    		throw new Error("<SettingsCategory>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Settings\inputTypes\Radio.svelte generated by Svelte v3.19.1 */

    const file$m = "src\\Settings\\inputTypes\\Radio.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (16:8) {#each choices as choice, index}
    function create_each_block$7(ctx) {
    	let div1;
    	let div0;
    	let div0_style_value;
    	let t0;
    	let p;
    	let t1_value = /*choice*/ ctx[5] + "";
    	let t1;
    	let t2;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[4](/*index*/ ctx[7], ...args);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			p = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(div0, "class", "radio svelte-6ak4p1");

    			attr_dev(div0, "style", div0_style_value = "\r\n                    " + (/*value*/ ctx[0] == /*index*/ ctx[7]
    			? "background-color: var(--red);"
    			: "") + "\r\n                ");

    			add_location(div0, file$m, 17, 16, 339);
    			attr_dev(p, "class", "svelte-6ak4p1");
    			add_location(p, file$m, 21, 16, 564);
    			attr_dev(div1, "class", "choiceContainer svelte-6ak4p1");
    			add_location(div1, file$m, 16, 12, 292);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, p);
    			append_dev(p, t1);
    			append_dev(div1, t2);
    			dispose = listen_dev(div0, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*value*/ 1 && div0_style_value !== (div0_style_value = "\r\n                    " + (/*value*/ ctx[0] == /*index*/ ctx[7]
    			? "background-color: var(--red);"
    			: "") + "\r\n                ")) {
    				attr_dev(div0, "style", div0_style_value);
    			}

    			if (dirty & /*choices*/ 4 && t1_value !== (t1_value = /*choice*/ ctx[5] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(16:8) {#each choices as choice, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let main;
    	let div0;
    	let p;
    	let t0;
    	let t1;
    	let div1;
    	let each_value = /*choices*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			p = element("p");
    			t0 = text(/*label*/ ctx[1]);
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p, "class", "svelte-6ak4p1");
    			add_location(p, file$m, 12, 8, 176);
    			attr_dev(div0, "class", "labelContainer svelte-6ak4p1");
    			add_location(div0, file$m, 11, 4, 138);
    			attr_dev(div1, "class", "inputContainer svelte-6ak4p1");
    			add_location(div1, file$m, 14, 4, 208);
    			attr_dev(main, "class", "svelte-6ak4p1");
    			add_location(main, file$m, 10, 0, 126);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, p);
    			append_dev(p, t0);
    			append_dev(main, t1);
    			append_dev(main, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*label*/ 2) set_data_dev(t0, /*label*/ ctx[1]);

    			if (dirty & /*choices, value, onChange*/ 13) {
    				each_value = /*choices*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { label } = $$props;
    	let { choices } = $$props;
    	let { value } = $$props;
    	let { onChange } = $$props;
    	const writable_props = ["label", "choices", "value", "onChange"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Radio> was created with unknown prop '${key}'`);
    	});

    	const click_handler = index => {
    		$$invalidate(0, value = index);
    		if (onChange) onChange();
    	};

    	$$self.$set = $$props => {
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("choices" in $$props) $$invalidate(2, choices = $$props.choices);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("onChange" in $$props) $$invalidate(3, onChange = $$props.onChange);
    	};

    	$$self.$capture_state = () => ({ label, choices, value, onChange });

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("choices" in $$props) $$invalidate(2, choices = $$props.choices);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("onChange" in $$props) $$invalidate(3, onChange = $$props.onChange);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, label, choices, onChange, click_handler];
    }

    class Radio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {
    			label: 1,
    			choices: 2,
    			value: 0,
    			onChange: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Radio",
    			options,
    			id: create_fragment$m.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*label*/ ctx[1] === undefined && !("label" in props)) {
    			console.warn("<Radio> was created without expected prop 'label'");
    		}

    		if (/*choices*/ ctx[2] === undefined && !("choices" in props)) {
    			console.warn("<Radio> was created without expected prop 'choices'");
    		}

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<Radio> was created without expected prop 'value'");
    		}

    		if (/*onChange*/ ctx[3] === undefined && !("onChange" in props)) {
    			console.warn("<Radio> was created without expected prop 'onChange'");
    		}
    	}

    	get label() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get choices() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set choices(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onChange() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onChange(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Settings\Settings.svelte generated by Svelte v3.19.1 */
    const file$n = "src\\Settings\\Settings.svelte";

    // (24:4) {:else}
    function create_else_block$2(ctx) {
    	let div;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "blurAgent " + (/*opened*/ ctx[1] ? "" : "deblur") + " svelte-gu5jek");
    			add_location(div, file$n, 24, 4, 521);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*opened*/ 2 && div_class_value !== (div_class_value = "blurAgent " + (/*opened*/ ctx[1] ? "" : "deblur") + " svelte-gu5jek")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(24:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (22:4) {#if userSettings.settings_theme == 1}
    function create_if_block_2$3(ctx) {
    	let div;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "plainBackgroundAgent " + (/*opened*/ ctx[1] ? "" : "disappear") + " svelte-gu5jek");
    			add_location(div, file$n, 22, 4, 434);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*opened*/ 2 && div_class_value !== (div_class_value = "plainBackgroundAgent " + (/*opened*/ ctx[1] ? "" : "disappear") + " svelte-gu5jek")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(22:4) {#if userSettings.settings_theme == 1}",
    		ctx
    	});

    	return block;
    }

    // (33:16) <SettingsCategory                      label="Appearance"                      selected={selected == 0}                      clickAction={() => {selected = 0}}                  >
    function create_default_slot_1$1(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "var(--red)");
    			attr_dev(path, "d", "M339.3 367.1c27.3-3.9 51.9-19.4 67.2-42.9L568.2 74.1c12.6-19.5 9.4-45.3-7.6-61.2S517.7-4.4 499.1 9.6L262.4 187.2c-24 18-38.2 46.1-38.4 76.1L339.3 367.1zm-19.6 25.4l-116-104.4C143.9 290.3 96 339.6 96 400c0 3.9 .2 7.8 .6 11.6C98.4 429.1 86.4 448 68.8 448H64c-17.7 0-32 14.3-32 32s14.3 32 32 32H208c61.9 0 112-50.1 112-112c0-2.5-.1-5-.2-7.5z");
    			add_location(path, file$n, 38, 24, 1242);
    			attr_dev(svg, "height", "40%");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 576 512");
    			add_location(svg, file$n, 37, 20, 973);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(33:16) <SettingsCategory                      label=\\\"Appearance\\\"                      selected={selected == 0}                      clickAction={() => {selected = 0}}                  >",
    		ctx
    	});

    	return block;
    }

    // (43:16) <SettingsCategory                      label="Workflow"                      selected={selected == 1}                      clickAction={() => {selected = 1}}                  >
    function create_default_slot$1(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "var(--red)");
    			attr_dev(path, "d", "M352 320c88.4 0 160-71.6 160-160c0-15.3-2.2-30.1-6.2-44.2c-3.1-10.8-16.4-13.2-24.3-5.3l-76.8 76.8c-3 3-7.1 4.7-11.3 4.7H336c-8.8 0-16-7.2-16-16V118.6c0-4.2 1.7-8.3 4.7-11.3l76.8-76.8c7.9-7.9 5.4-21.2-5.3-24.3C382.1 2.2 367.3 0 352 0C263.6 0 192 71.6 192 160c0 19.1 3.4 37.5 9.5 54.5L19.9 396.1C7.2 408.8 0 426.1 0 444.1C0 481.6 30.4 512 67.9 512c18 0 35.3-7.2 48-19.9L297.5 310.5c17 6.2 35.4 9.5 54.5 9.5zM80 408a24 24 0 1 1 0 48 24 24 0 1 1 0-48z");
    			add_location(path, file$n, 48, 20, 2154);
    			attr_dev(svg, "height", "40%");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			add_location(svg, file$n, 47, 16, 1889);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(43:16) <SettingsCategory                      label=\\\"Workflow\\\"                      selected={selected == 1}                      clickAction={() => {selected = 1}}                  >",
    		ctx
    	});

    	return block;
    }

    // (58:16) {#if selected === 0}
    function create_if_block_1$6(ctx) {
    	let updating_value;
    	let t;
    	let updating_value_1;
    	let current;

    	function radio0_value_binding(value) {
    		/*radio0_value_binding*/ ctx[7].call(null, value);
    	}

    	let radio0_props = {
    		label: "Interface Theme",
    		choices: ["Light", "Dark", "Use System"]
    	};

    	if (/*userSettings*/ ctx[0].theme !== void 0) {
    		radio0_props.value = /*userSettings*/ ctx[0].theme;
    	}

    	const radio0 = new Radio({ props: radio0_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio0, "value", radio0_value_binding));

    	function radio1_value_binding(value) {
    		/*radio1_value_binding*/ ctx[8].call(null, value);
    	}

    	let radio1_props = {
    		label: "Settings Background",
    		choices: ["Background Blur", "Basic"]
    	};

    	if (/*userSettings*/ ctx[0].settings_theme !== void 0) {
    		radio1_props.value = /*userSettings*/ ctx[0].settings_theme;
    	}

    	const radio1 = new Radio({ props: radio1_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio1, "value", radio1_value_binding));

    	const block = {
    		c: function create() {
    			create_component(radio0.$$.fragment);
    			t = space();
    			create_component(radio1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(radio0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(radio1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const radio0_changes = {};

    			if (!updating_value && dirty & /*userSettings*/ 1) {
    				updating_value = true;
    				radio0_changes.value = /*userSettings*/ ctx[0].theme;
    				add_flush_callback(() => updating_value = false);
    			}

    			radio0.$set(radio0_changes);
    			const radio1_changes = {};

    			if (!updating_value_1 && dirty & /*userSettings*/ 1) {
    				updating_value_1 = true;
    				radio1_changes.value = /*userSettings*/ ctx[0].settings_theme;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			radio1.$set(radio1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radio0.$$.fragment, local);
    			transition_in(radio1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radio0.$$.fragment, local);
    			transition_out(radio1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radio0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(radio1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(58:16) {#if selected === 0}",
    		ctx
    	});

    	return block;
    }

    // (72:16) {#if selected === 1}
    function create_if_block$6(ctx) {
    	let updating_value;
    	let current;

    	function radio_value_binding(value) {
    		/*radio_value_binding*/ ctx[9].call(null, value);
    	}

    	let radio_props = {
    		label: "Preferred Navigation Button",
    		choices: [
    			"Left Mouse Button",
    			"Middle Mouse Button (Wheel)",
    			"Right Mouse Button",
    			"Any"
    		]
    	};

    	if (/*userSettings*/ ctx[0].preferred_navigation_mb !== void 0) {
    		radio_props.value = /*userSettings*/ ctx[0].preferred_navigation_mb;
    	}

    	const radio = new Radio({ props: radio_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio, "value", radio_value_binding));

    	const block = {
    		c: function create() {
    			create_component(radio.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(radio, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const radio_changes = {};

    			if (!updating_value && dirty & /*userSettings*/ 1) {
    				updating_value = true;
    				radio_changes.value = /*userSettings*/ ctx[0].preferred_navigation_mb;
    				add_flush_callback(() => updating_value = false);
    			}

    			radio.$set(radio_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radio.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radio.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radio, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(72:16) {#if selected === 1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let main;
    	let t0;
    	let div8;
    	let div0;
    	let t1;
    	let div6;
    	let div1;
    	let t2;
    	let t3;
    	let div4;
    	let div2;
    	let t4;
    	let div3;
    	let t5;
    	let t6;
    	let t7;
    	let div5;
    	let t8;
    	let div7;
    	let button;
    	let main_class_value;
    	let current;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*userSettings*/ ctx[0].settings_theme == 1) return create_if_block_2$3;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	const settingscategory0 = new SettingsCategory({
    			props: {
    				label: "Appearance",
    				selected: /*selected*/ ctx[2] == 0,
    				clickAction: /*func*/ ctx[5],
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const settingscategory1 = new SettingsCategory({
    			props: {
    				label: "Workflow",
    				selected: /*selected*/ ctx[2] == 1,
    				clickAction: /*func_1*/ ctx[6],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block1 = /*selected*/ ctx[2] === 0 && create_if_block_1$6(ctx);
    	let if_block2 = /*selected*/ ctx[2] === 1 && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block0.c();
    			t0 = space();
    			div8 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div6 = element("div");
    			div1 = element("div");
    			create_component(settingscategory0.$$.fragment);
    			t2 = space();
    			create_component(settingscategory1.$$.fragment);
    			t3 = space();
    			div4 = element("div");
    			div2 = element("div");
    			t4 = space();
    			div3 = element("div");
    			t5 = space();
    			if (if_block1) if_block1.c();
    			t6 = space();
    			if (if_block2) if_block2.c();
    			t7 = space();
    			div5 = element("div");
    			t8 = space();
    			div7 = element("div");
    			button = element("button");
    			button.textContent = "Close Settings";
    			attr_dev(div0, "class", "top svelte-gu5jek");
    			add_location(div0, file$n, 27, 8, 635);
    			attr_dev(div1, "class", "leftWing mainLayoutWing svelte-gu5jek");
    			add_location(div1, file$n, 31, 12, 718);
    			attr_dev(div2, "class", "dashLeft dash svelte-gu5jek");
    			add_location(div2, file$n, 54, 16, 2766);
    			attr_dev(div3, "class", "dashRight dash svelte-gu5jek");
    			add_location(div3, file$n, 55, 16, 2817);
    			attr_dev(div4, "class", "center svelte-gu5jek");
    			add_location(div4, file$n, 53, 12, 2728);
    			attr_dev(div5, "class", "rightWing mainLayoutWing svelte-gu5jek");
    			add_location(div5, file$n, 82, 12, 3785);
    			attr_dev(div6, "class", "mainLayout svelte-gu5jek");
    			add_location(div6, file$n, 30, 8, 680);
    			attr_dev(button, "class", "close svelte-gu5jek");
    			add_location(button, file$n, 87, 12, 3905);
    			attr_dev(div7, "class", "bottom svelte-gu5jek");
    			add_location(div7, file$n, 86, 8, 3871);
    			attr_dev(div8, "class", "mainLayoutContainer svelte-gu5jek");
    			add_location(div8, file$n, 26, 4, 592);
    			attr_dev(main, "class", main_class_value = "" + (null_to_empty(/*opened*/ ctx[1] ? "" : "deblur") + " svelte-gu5jek"));
    			add_location(main, file$n, 20, 0, 345);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_block0.m(main, null);
    			append_dev(main, t0);
    			append_dev(main, div8);
    			append_dev(div8, div0);
    			append_dev(div8, t1);
    			append_dev(div8, div6);
    			append_dev(div6, div1);
    			mount_component(settingscategory0, div1, null);
    			append_dev(div1, t2);
    			mount_component(settingscategory1, div1, null);
    			append_dev(div6, t3);
    			append_dev(div6, div4);
    			append_dev(div4, div2);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div4, t5);
    			if (if_block1) if_block1.m(div4, null);
    			append_dev(div4, t6);
    			if (if_block2) if_block2.m(div4, null);
    			append_dev(div6, t7);
    			append_dev(div6, div5);
    			append_dev(div8, t8);
    			append_dev(div8, div7);
    			append_dev(div7, button);
    			current = true;
    			dispose = listen_dev(button, "click", /*closeRoutine*/ ctx[3], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(main, t0);
    				}
    			}

    			const settingscategory0_changes = {};
    			if (dirty & /*selected*/ 4) settingscategory0_changes.selected = /*selected*/ ctx[2] == 0;
    			if (dirty & /*selected*/ 4) settingscategory0_changes.clickAction = /*func*/ ctx[5];

    			if (dirty & /*$$scope*/ 1024) {
    				settingscategory0_changes.$$scope = { dirty, ctx };
    			}

    			settingscategory0.$set(settingscategory0_changes);
    			const settingscategory1_changes = {};
    			if (dirty & /*selected*/ 4) settingscategory1_changes.selected = /*selected*/ ctx[2] == 1;
    			if (dirty & /*selected*/ 4) settingscategory1_changes.clickAction = /*func_1*/ ctx[6];

    			if (dirty & /*$$scope*/ 1024) {
    				settingscategory1_changes.$$scope = { dirty, ctx };
    			}

    			settingscategory1.$set(settingscategory1_changes);

    			if (/*selected*/ ctx[2] === 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block_1$6(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div4, t6);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*selected*/ ctx[2] === 1) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    					transition_in(if_block2, 1);
    				} else {
    					if_block2 = create_if_block$6(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div4, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*opened*/ 2 && main_class_value !== (main_class_value = "" + (null_to_empty(/*opened*/ ctx[1] ? "" : "deblur") + " svelte-gu5jek"))) {
    				attr_dev(main, "class", main_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(settingscategory0.$$.fragment, local);
    			transition_in(settingscategory1.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(settingscategory0.$$.fragment, local);
    			transition_out(settingscategory1.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block0.d();
    			destroy_component(settingscategory0);
    			destroy_component(settingscategory1);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { closeAction } = $$props;
    	let opened = true;

    	function closeRoutine() {
    		closeAction();
    		$$invalidate(1, opened = false);
    	}

    	let selected = 0;
    	let { userSettings } = $$props;
    	const writable_props = ["closeAction", "userSettings"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	const func = () => {
    		$$invalidate(2, selected = 0);
    	};

    	const func_1 = () => {
    		$$invalidate(2, selected = 1);
    	};

    	function radio0_value_binding(value) {
    		userSettings.theme = value;
    		$$invalidate(0, userSettings);
    	}

    	function radio1_value_binding(value) {
    		userSettings.settings_theme = value;
    		$$invalidate(0, userSettings);
    	}

    	function radio_value_binding(value) {
    		userSettings.preferred_navigation_mb = value;
    		$$invalidate(0, userSettings);
    	}

    	$$self.$set = $$props => {
    		if ("closeAction" in $$props) $$invalidate(4, closeAction = $$props.closeAction);
    		if ("userSettings" in $$props) $$invalidate(0, userSettings = $$props.userSettings);
    	};

    	$$self.$capture_state = () => ({
    		SettingsCategory,
    		Radio,
    		closeAction,
    		opened,
    		closeRoutine,
    		selected,
    		userSettings
    	});

    	$$self.$inject_state = $$props => {
    		if ("closeAction" in $$props) $$invalidate(4, closeAction = $$props.closeAction);
    		if ("opened" in $$props) $$invalidate(1, opened = $$props.opened);
    		if ("selected" in $$props) $$invalidate(2, selected = $$props.selected);
    		if ("userSettings" in $$props) $$invalidate(0, userSettings = $$props.userSettings);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		userSettings,
    		opened,
    		selected,
    		closeRoutine,
    		closeAction,
    		func,
    		func_1,
    		radio0_value_binding,
    		radio1_value_binding,
    		radio_value_binding
    	];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { closeAction: 4, userSettings: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$n.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*closeAction*/ ctx[4] === undefined && !("closeAction" in props)) {
    			console.warn("<Settings> was created without expected prop 'closeAction'");
    		}

    		if (/*userSettings*/ ctx[0] === undefined && !("userSettings" in props)) {
    			console.warn("<Settings> was created without expected prop 'userSettings'");
    		}
    	}

    	get closeAction() {
    		throw new Error("<Settings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeAction(value) {
    		throw new Error("<Settings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get userSettings() {
    		throw new Error("<Settings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set userSettings(value) {
    		throw new Error("<Settings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\NotificationCard.svelte generated by Svelte v3.19.1 */
    const file$o = "src\\NotificationCard.svelte";

    // (20:8) {#if type == "note"}
    function create_if_block_2$4(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M123.6 391.3c12.9-9.4 29.6-11.8 44.6-6.4c26.5 9.6 56.2 15.1 87.8 15.1c124.7 0 208-80.5 208-160s-83.3-160-208-160S48 160.5 48 240c0 32 12.4 62.8 35.7 89.2c8.6 9.7 12.8 22.5 11.8 35.5c-1.4 18.1-5.7 34.7-11.3 49.4c17-7.9 31.1-16.7 39.4-22.7zM21.2 431.9c1.8-2.7 3.5-5.4 5.1-8.1c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208s-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6c-15.1 6.6-32.3 12.6-50.1 16.1c-.8 .2-1.6 .3-2.4 .5c-4.4 .8-8.7 1.5-13.2 1.9c-.2 0-.5 .1-.7 .1c-5.1 .5-10.2 .8-15.3 .8c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4c4.1-4.2 7.8-8.7 11.3-13.5c1.7-2.3 3.3-4.6 4.8-6.9c.1-.2 .2-.3 .3-.5z");
    			attr_dev(path, "class", "svelte-1ss4g0j");
    			add_location(path, file$o, 20, 243, 680);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			attr_dev(svg, "class", "svelte-1ss4g0j");
    			add_location(svg, file$o, 20, 12, 449);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(20:8) {#if type == \\\"note\\\"}",
    		ctx
    	});

    	return block;
    }

    // (23:8) {#if type == "warning"}
    function create_if_block_1$7(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z");
    			attr_dev(path, "class", "svelte-1ss4g0j");
    			add_location(path, file$o, 23, 243, 1672);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			attr_dev(svg, "class", "svelte-1ss4g0j");
    			add_location(svg, file$o, 23, 12, 1441);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$7.name,
    		type: "if",
    		source: "(23:8) {#if type == \\\"warning\\\"}",
    		ctx
    	});

    	return block;
    }

    // (26:8) {#if type == "error"}
    function create_if_block$7(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M37.6 4.2C28-2.3 15.2-1.1 7 7s-9.4 21-2.8 30.5l112 163.3L16.6 233.2C6.7 236.4 0 245.6 0 256s6.7 19.6 16.6 22.8l103.1 33.4L66.8 412.8c-4.9 9.3-3.2 20.7 4.3 28.1s18.8 9.2 28.1 4.3l100.6-52.9 33.4 103.1c3.2 9.9 12.4 16.6 22.8 16.6s19.6-6.7 22.8-16.6l33.4-103.1 100.6 52.9c9.3 4.9 20.7 3.2 28.1-4.3s9.2-18.8 4.3-28.1L392.3 312.2l103.1-33.4c9.9-3.2 16.6-12.4 16.6-22.8s-6.7-19.6-16.6-22.8L388.9 198.7l25.7-70.4c3.2-8.8 1-18.6-5.6-25.2s-16.4-8.8-25.2-5.6l-70.4 25.7L278.8 16.6C275.6 6.7 266.4 0 256 0s-19.6 6.7-22.8 16.6l-32.3 99.6L37.6 4.2z");
    			attr_dev(path, "class", "svelte-1ss4g0j");
    			add_location(path, file$o, 26, 243, 2284);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			attr_dev(svg, "class", "svelte-1ss4g0j");
    			add_location(svg, file$o, 26, 12, 2053);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(26:8) {#if type == \\\"error\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let main;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let div1;
    	let p;
    	let t3;
    	let t4;
    	let div3;
    	let div2;
    	let svg;
    	let path;
    	let dispose;
    	let if_block0 = /*type*/ ctx[0] == "note" && create_if_block_2$4(ctx);
    	let if_block1 = /*type*/ ctx[0] == "warning" && create_if_block_1$7(ctx);
    	let if_block2 = /*type*/ ctx[0] == "error" && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			div1 = element("div");
    			p = element("p");
    			t3 = text(/*message*/ ctx[1]);
    			t4 = space();
    			div3 = element("div");
    			div2 = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(div0, "class", "iconContainer svelte-1ss4g0j");
    			add_location(div0, file$o, 18, 4, 378);
    			attr_dev(p, "class", "svelte-1ss4g0j");
    			add_location(p, file$o, 30, 8, 2907);
    			attr_dev(div1, "class", "textContainer svelte-1ss4g0j");
    			add_location(div1, file$o, 29, 4, 2870);
    			attr_dev(path, "d", "M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z");
    			attr_dev(path, "class", "svelte-1ss4g0j");
    			add_location(path, file$o, 34, 243, 3274);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 384 512");
    			attr_dev(svg, "class", "svelte-1ss4g0j");
    			add_location(svg, file$o, 34, 12, 3043);
    			attr_dev(div2, "class", "closeAction svelte-1ss4g0j");
    			add_location(div2, file$o, 33, 8, 2981);
    			attr_dev(div3, "class", "actionsContainer svelte-1ss4g0j");
    			add_location(div3, file$o, 32, 4, 2941);
    			set_style(main, "background-color", /*bgLookup*/ ctx[3][/*type*/ ctx[0]]);
    			attr_dev(main, "class", "svelte-1ss4g0j");
    			add_location(main, file$o, 17, 0, 322);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t0);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t1);
    			if (if_block2) if_block2.m(div0, null);
    			append_dev(main, t2);
    			append_dev(main, div1);
    			append_dev(div1, p);
    			append_dev(p, t3);
    			append_dev(main, t4);
    			append_dev(main, div3);
    			append_dev(div3, div2);
    			append_dev(div2, svg);
    			append_dev(svg, path);

    			dispose = listen_dev(
    				div2,
    				"click",
    				function () {
    					if (is_function(/*onClose*/ ctx[2]())) /*onClose*/ ctx[2]().apply(this, arguments);
    				},
    				false,
    				false,
    				false
    			);
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (/*type*/ ctx[0] == "note") {
    				if (!if_block0) {
    					if_block0 = create_if_block_2$4(ctx);
    					if_block0.c();
    					if_block0.m(div0, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*type*/ ctx[0] == "warning") {
    				if (!if_block1) {
    					if_block1 = create_if_block_1$7(ctx);
    					if_block1.c();
    					if_block1.m(div0, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*type*/ ctx[0] == "error") {
    				if (!if_block2) {
    					if_block2 = create_if_block$7(ctx);
    					if_block2.c();
    					if_block2.m(div0, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*message*/ 2) set_data_dev(t3, /*message*/ ctx[1]);

    			if (dirty & /*type*/ 1) {
    				set_style(main, "background-color", /*bgLookup*/ ctx[3][/*type*/ ctx[0]]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { type = "note" } = $$props;

    	const bgLookup = {
    		"error": "var(--red)",
    		"warning": "var(--orange)",
    		"note": "var(--velvet)"
    	};

    	let { message } = $$props;
    	let { onClose } = $$props;
    	const writable_props = ["type", "message", "onClose"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NotificationCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("message" in $$props) $$invalidate(1, message = $$props.message);
    		if ("onClose" in $$props) $$invalidate(2, onClose = $$props.onClose);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		type,
    		bgLookup,
    		message,
    		onClose
    	});

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("message" in $$props) $$invalidate(1, message = $$props.message);
    		if ("onClose" in $$props) $$invalidate(2, onClose = $$props.onClose);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [type, message, onClose, bgLookup];
    }

    class NotificationCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, { type: 0, message: 1, onClose: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotificationCard",
    			options,
    			id: create_fragment$o.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*message*/ ctx[1] === undefined && !("message" in props)) {
    			console.warn("<NotificationCard> was created without expected prop 'message'");
    		}

    		if (/*onClose*/ ctx[2] === undefined && !("onClose" in props)) {
    			console.warn("<NotificationCard> was created without expected prop 'onClose'");
    		}
    	}

    	get type() {
    		throw new Error("<NotificationCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<NotificationCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get message() {
    		throw new Error("<NotificationCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error("<NotificationCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClose() {
    		throw new Error("<NotificationCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClose(value) {
    		throw new Error("<NotificationCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.19.1 */
    const file$p = "src\\App.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[35] = list[i];
    	child_ctx[37] = i;
    	return child_ctx;
    }

    // (216:1) {#if settingsShown}
    function create_if_block_2$5(ctx) {
    	let updating_userSettings;
    	let current;

    	function settings_userSettings_binding(value) {
    		/*settings_userSettings_binding*/ ctx[25].call(null, value);
    	}

    	let settings_props = { closeAction: /*func*/ ctx[24] };

    	if (/*userSettings*/ ctx[0] !== void 0) {
    		settings_props.userSettings = /*userSettings*/ ctx[0];
    	}

    	const settings = new Settings({ props: settings_props, $$inline: true });
    	binding_callbacks.push(() => bind(settings, "userSettings", settings_userSettings_binding));

    	const block = {
    		c: function create() {
    			create_component(settings.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(settings, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const settings_changes = {};
    			if (dirty[0] & /*settingsShown*/ 256) settings_changes.closeAction = /*func*/ ctx[24];

    			if (!updating_userSettings && dirty[0] & /*userSettings*/ 1) {
    				updating_userSettings = true;
    				settings_changes.userSettings = /*userSettings*/ ctx[0];
    				add_flush_callback(() => updating_userSettings = false);
    			}

    			settings.$set(settings_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(settings.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(settings.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(settings, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$5.name,
    		type: "if",
    		source: "(216:1) {#if settingsShown}",
    		ctx
    	});

    	return block;
    }

    // (253:3) {#if debugConsoleOpen}
    function create_if_block_1$8(ctx) {
    	let current;

    	const debugconsole = new DebugConsole({
    			props: { info: /*debugContents*/ ctx[9] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(debugconsole.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(debugconsole, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const debugconsole_changes = {};
    			if (dirty[0] & /*debugContents*/ 512) debugconsole_changes.info = /*debugContents*/ ctx[9];
    			debugconsole.$set(debugconsole_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(debugconsole.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(debugconsole.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(debugconsole, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$8.name,
    		type: "if",
    		source: "(253:3) {#if debugConsoleOpen}",
    		ctx
    	});

    	return block;
    }

    // (257:2) {#if edited != null}
    function create_if_block$8(ctx) {
    	let updating_resultWidgets;
    	let updating_invokeOutputs;
    	let current;

    	function nodeeditor_resultWidgets_binding(value) {
    		/*nodeeditor_resultWidgets_binding*/ ctx[32].call(null, value);
    	}

    	function nodeeditor_invokeOutputs_binding(value) {
    		/*nodeeditor_invokeOutputs_binding*/ ctx[33].call(null, value);
    	}

    	let nodeeditor_props = {
    		nodeData: /*projectData*/ ctx[6].objects["table"][/*edited*/ ctx[7]].nodes,
    		tableRef: /*projectData*/ ctx[6].objects["table"][/*edited*/ ctx[7]].reference,
    		tableData: /*projectData*/ ctx[6].objects["table"][/*edited*/ ctx[7]],
    		userSettings: /*userSettings*/ ctx[0]
    	};

    	if (/*projectData*/ ctx[6].objects.result !== void 0) {
    		nodeeditor_props.resultWidgets = /*projectData*/ ctx[6].objects.result;
    	}

    	if (/*invokeProcessCallback*/ ctx[5] !== void 0) {
    		nodeeditor_props.invokeOutputs = /*invokeProcessCallback*/ ctx[5];
    	}

    	const nodeeditor = new NodeEditor({ props: nodeeditor_props, $$inline: true });
    	binding_callbacks.push(() => bind(nodeeditor, "resultWidgets", nodeeditor_resultWidgets_binding));
    	binding_callbacks.push(() => bind(nodeeditor, "invokeOutputs", nodeeditor_invokeOutputs_binding));

    	const block = {
    		c: function create() {
    			create_component(nodeeditor.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(nodeeditor, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const nodeeditor_changes = {};
    			if (dirty[0] & /*projectData, edited*/ 192) nodeeditor_changes.nodeData = /*projectData*/ ctx[6].objects["table"][/*edited*/ ctx[7]].nodes;
    			if (dirty[0] & /*projectData, edited*/ 192) nodeeditor_changes.tableRef = /*projectData*/ ctx[6].objects["table"][/*edited*/ ctx[7]].reference;
    			if (dirty[0] & /*projectData, edited*/ 192) nodeeditor_changes.tableData = /*projectData*/ ctx[6].objects["table"][/*edited*/ ctx[7]];
    			if (dirty[0] & /*userSettings*/ 1) nodeeditor_changes.userSettings = /*userSettings*/ ctx[0];

    			if (!updating_resultWidgets && dirty[0] & /*projectData*/ 64) {
    				updating_resultWidgets = true;
    				nodeeditor_changes.resultWidgets = /*projectData*/ ctx[6].objects.result;
    				add_flush_callback(() => updating_resultWidgets = false);
    			}

    			if (!updating_invokeOutputs && dirty[0] & /*invokeProcessCallback*/ 32) {
    				updating_invokeOutputs = true;
    				nodeeditor_changes.invokeOutputs = /*invokeProcessCallback*/ ctx[5];
    				add_flush_callback(() => updating_invokeOutputs = false);
    			}

    			nodeeditor.$set(nodeeditor_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nodeeditor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nodeeditor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nodeeditor, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(257:2) {#if edited != null}",
    		ctx
    	});

    	return block;
    }

    // (272:2) {#each notifications as n, index}
    function create_each_block$8(ctx) {
    	let current;

    	function func_3(...args) {
    		return /*func_3*/ ctx[34](/*index*/ ctx[37], ...args);
    	}

    	const notificationcard = new NotificationCard({
    			props: {
    				type: /*n*/ ctx[35].type,
    				message: /*n*/ ctx[35].message,
    				onClose: func_3
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(notificationcard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(notificationcard, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const notificationcard_changes = {};
    			if (dirty[0] & /*notifications*/ 16) notificationcard_changes.type = /*n*/ ctx[35].type;
    			if (dirty[0] & /*notifications*/ 16) notificationcard_changes.message = /*n*/ ctx[35].message;
    			notificationcard.$set(notificationcard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notificationcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notificationcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(notificationcard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(272:2) {#each notifications as n, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let main;
    	let t0;
    	let div1;
    	let t1;
    	let div0;
    	let t2;
    	let updating_edited;
    	let updating_debObjectDrag;
    	let updating_debObjectResize;
    	let t3;
    	let t4;
    	let t5;
    	let div2;
    	let main_class_value;
    	let current;
    	let if_block0 = /*settingsShown*/ ctx[8] && create_if_block_2$5(ctx);

    	const topbar = new TopBar({
    			props: {
    				toggleDebugConsole: /*func_1*/ ctx[26],
    				centerView: /*centerViewport*/ ctx[12],
    				resetZoom: /*resetZoom*/ ctx[13],
    				newFile: /*newFile*/ ctx[15],
    				open: /*open*/ ctx[16],
    				save: /*save*/ ctx[17],
    				saveAs: /*saveAs*/ ctx[18],
    				settingsAction: /*func_2*/ ctx[27]
    			},
    			$$inline: true
    		});

    	const toolkit = new Toolkit({ $$inline: true });

    	function viewport_edited_binding(value) {
    		/*viewport_edited_binding*/ ctx[29].call(null, value);
    	}

    	function viewport_debObjectDrag_binding(value) {
    		/*viewport_debObjectDrag_binding*/ ctx[30].call(null, value);
    	}

    	function viewport_debObjectResize_binding(value) {
    		/*viewport_debObjectResize_binding*/ ctx[31].call(null, value);
    	}

    	let viewport_props = {
    		projectData: /*projectData*/ ctx[6],
    		userSettings: /*userSettings*/ ctx[0],
    		invokeTableProcess: /*invokeProcessCallback*/ ctx[5]
    	};

    	if (/*edited*/ ctx[7] !== void 0) {
    		viewport_props.edited = /*edited*/ ctx[7];
    	}

    	if (/*debugInfo*/ ctx[2].objectDrag !== void 0) {
    		viewport_props.debObjectDrag = /*debugInfo*/ ctx[2].objectDrag;
    	}

    	if (/*debugInfo*/ ctx[2].objectResize !== void 0) {
    		viewport_props.debObjectResize = /*debugInfo*/ ctx[2].objectResize;
    	}

    	const viewport = new Viewport({ props: viewport_props, $$inline: true });
    	/*viewport_binding*/ ctx[28](viewport);
    	binding_callbacks.push(() => bind(viewport, "edited", viewport_edited_binding));
    	binding_callbacks.push(() => bind(viewport, "debObjectDrag", viewport_debObjectDrag_binding));
    	binding_callbacks.push(() => bind(viewport, "debObjectResize", viewport_debObjectResize_binding));
    	let if_block1 = /*debugConsoleOpen*/ ctx[1] && create_if_block_1$8(ctx);
    	let if_block2 = /*edited*/ ctx[7] != null && create_if_block$8(ctx);
    	let each_value = /*notifications*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			create_component(topbar.$$.fragment);
    			t1 = space();
    			div0 = element("div");
    			create_component(toolkit.$$.fragment);
    			t2 = space();
    			create_component(viewport.$$.fragment);
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			if (if_block2) if_block2.c();
    			t5 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "centerRow svelte-1g7e7k1");
    			add_location(div0, file$p, 238, 2, 6124);
    			attr_dev(div1, "class", "mainLayout svelte-1g7e7k1");
    			add_location(div1, file$p, 225, 1, 5823);
    			attr_dev(div2, "class", "notificationsContainer svelte-1g7e7k1");
    			add_location(div2, file$p, 270, 1, 6929);

    			attr_dev(main, "class", main_class_value = "\r\n\t" + (/*userSettings*/ ctx[0].theme == 1 || /*userSettings*/ ctx[0].theme == 2 && /*ipcRenderer*/ ctx[10].sendSync("sysDarkmode")
    			? "darkmode"
    			: "") + "\r\n" + " svelte-1g7e7k1");

    			add_location(main, file$p, 209, 0, 5479);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t0);
    			append_dev(main, div1);
    			mount_component(topbar, div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			mount_component(toolkit, div0, null);
    			append_dev(div0, t2);
    			mount_component(viewport, div0, null);
    			append_dev(div0, t3);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div1, t4);
    			if (if_block2) if_block2.m(div1, null);
    			append_dev(main, t5);
    			append_dev(main, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*settingsShown*/ ctx[8]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_2$5(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			const topbar_changes = {};
    			if (dirty[0] & /*debugConsoleOpen*/ 2) topbar_changes.toggleDebugConsole = /*func_1*/ ctx[26];
    			if (dirty[0] & /*settingsShown*/ 256) topbar_changes.settingsAction = /*func_2*/ ctx[27];
    			topbar.$set(topbar_changes);
    			const viewport_changes = {};
    			if (dirty[0] & /*projectData*/ 64) viewport_changes.projectData = /*projectData*/ ctx[6];
    			if (dirty[0] & /*userSettings*/ 1) viewport_changes.userSettings = /*userSettings*/ ctx[0];
    			if (dirty[0] & /*invokeProcessCallback*/ 32) viewport_changes.invokeTableProcess = /*invokeProcessCallback*/ ctx[5];

    			if (!updating_edited && dirty[0] & /*edited*/ 128) {
    				updating_edited = true;
    				viewport_changes.edited = /*edited*/ ctx[7];
    				add_flush_callback(() => updating_edited = false);
    			}

    			if (!updating_debObjectDrag && dirty[0] & /*debugInfo*/ 4) {
    				updating_debObjectDrag = true;
    				viewport_changes.debObjectDrag = /*debugInfo*/ ctx[2].objectDrag;
    				add_flush_callback(() => updating_debObjectDrag = false);
    			}

    			if (!updating_debObjectResize && dirty[0] & /*debugInfo*/ 4) {
    				updating_debObjectResize = true;
    				viewport_changes.debObjectResize = /*debugInfo*/ ctx[2].objectResize;
    				add_flush_callback(() => updating_debObjectResize = false);
    			}

    			viewport.$set(viewport_changes);

    			if (/*debugConsoleOpen*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block_1$8(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*edited*/ ctx[7] != null) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    					transition_in(if_block2, 1);
    				} else {
    					if_block2 = create_if_block$8(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div1, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*notifications, deleteNotification*/ 16400) {
    				each_value = /*notifications*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div2, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty[0] & /*userSettings*/ 1 && main_class_value !== (main_class_value = "\r\n\t" + (/*userSettings*/ ctx[0].theme == 1 || /*userSettings*/ ctx[0].theme == 2 && /*ipcRenderer*/ ctx[10].sendSync("sysDarkmode")
    			? "darkmode"
    			: "") + "\r\n" + " svelte-1g7e7k1")) {
    				attr_dev(main, "class", main_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(topbar.$$.fragment, local);
    			transition_in(toolkit.$$.fragment, local);
    			transition_in(viewport.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(if_block2);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(topbar.$$.fragment, local);
    			transition_out(toolkit.$$.fragment, local);
    			transition_out(viewport.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			destroy_component(topbar);
    			destroy_component(toolkit);
    			/*viewport_binding*/ ctx[28](null);
    			destroy_component(viewport);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	const fs = require("fs");
    	const path = require("path");
    	const { ipcRenderer } = require("electron");
    	let userSettings = getUserData();

    	function getUserData() {
    		const dir = ipcRenderer.sendSync("getSaveLocation");
    		const location = path.join(dir, "userSettings.json");
    		if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    		if (fs.existsSync(location)) return JSON.parse(fs.readFileSync(location));
    		return JSON.parse(fs.readFileSync(path.join(__dirname, "../src/config/defaultUserSettings.json")));
    	}

    	async function saveUserSettings() {
    		const location = path.join(ipcRenderer.sendSync("getSaveLocation"), "userSettings.json");
    		fs.writeFileSync(location, JSON.stringify(userSettings));
    	}

    	// DEBUG CONSOLE
    	let debugConsoleOpen = false;

    	let debugInfo = { "objectDrag": [], "objectResize": [] };

    	// Top Bar
    	let viewportRef;

    	function centerViewport() {
    		viewportRef.centerView();
    	}

    	function resetZoom() {
    		viewportRef.resetZoom();
    	}

    	onMount(() => {
    		document.onkeydown = event => {
    			event = event || window.event;

    			if (event.ctrlKey) {
    				switch (event.key) {
    					case "s":
    						save();
    						break;
    				}
    			}
    		};

    		document.addEventListener("notificationEvent", event => {
    			const newObj = Object.assign(
    				{
    					"delete": () => {
    						notifications.splice(notifications.indexOf(this), 1);
    						$$invalidate(4, notifications = Object.assign([], notifications));
    					}
    				},
    				event.detail
    			);

    			notifications.push(newObj);

    			setTimeout(
    				function () {
    					newObj.delete();
    					$$invalidate(4, notifications = Object.assign([], notifications));
    				},
    				10000
    			);

    			$$invalidate(4, notifications = Object.assign([], notifications));
    		});

    		console.log(ipcRenderer.sendSync("scanPlugins"));
    	});

    	// Notifications
    	let notifications = [];

    	function deleteNotification(index) {
    		notifications.splice(index, 1);
    		$$invalidate(4, notifications = Object.assign([], notifications));
    	}

    	// Table and Nodes
    	let processCallback;

    	function invokeProcessCallback() {
    		if (processCallback) processCallback();
    	}

    	// Project Data
    	// !!! NOTICE !!! THIS CONSTELLATION IS FOR DEV PURPOSES ONLY!!!
    	let projectData = {
    		"targetFilePath": "",
    		"objects": {
    			"header": [],
    			"paragraph": [],
    			"table": [],
    			"result": []
    		}
    	};

    	function newFile() {
    		$$invalidate(7, edited = null);
    		$$invalidate(6, projectData = JSON.parse(fs.readFileSync(path.join(__dirname, "../src/config/basicTemplate.json"))));
    	}

    	function open() {
    		$$invalidate(7, edited = null);
    		let path = ipcRenderer.sendSync("getOpenFilePath");
    		if (!path) return;

    		// Nice try hecker :)
    		let rawData = fs.readFileSync(path[0]).toString();

    		rawData = rawData.replace("<script>", "");
    		rawData = rawData.replace("</script>", "");
    		$$invalidate(6, projectData = JSON.parse(rawData));
    		console.log(projectData);
    	}

    	function save() {
    		if (projectData.targetFilePath) {
    			let fileContents = stringifyCircularJSON(projectData);
    			fs.writeFileSync(projectData.targetFilePath, fileContents);

    			document.dispatchEvent(new CustomEvent("notificationEvent",
    			{
    					detail: { "type": "note", "message": "File saved!" }
    				}));
    		} else saveAs();
    	}

    	function saveAs() {
    		let path = ipcRenderer.sendSync("getSaveFilePath");
    		if (!path) return;
    		$$invalidate(6, projectData.targetFilePath = path, projectData);
    		let fileContents = stringifyCircularJSON(projectData);
    		fs.writeFileSync(path, fileContents);

    		document.dispatchEvent(new CustomEvent("notificationEvent",
    		{
    				detail: { "type": "note", "message": "File saved!" }
    			}));
    	}

    	// Removes circular references resulting from trying to serialize classes
    	// ADDED:	Objects with key "reference" are no longer serialized
    	//			This cuts down file size and fixed nodes being parsed as null
    	const stringifyCircularJSON = obj => {
    		const seen = new WeakSet();

    		return JSON.stringify(obj, (k, v) => {
    			if (v !== null && typeof v === "object") {
    				if (seen.has(v) || k == "reference") return;
    				seen.add(v);
    			}

    			return v;
    		});
    	};

    	// States //
    	let edited = null;

    	let settingsShown = false;

    	const func = () => {
    		setTimeout(
    			() => {
    				$$invalidate(8, settingsShown = false);
    			},
    			500
    		);

    		saveUserSettings();
    	};

    	function settings_userSettings_binding(value) {
    		userSettings = value;
    		$$invalidate(0, userSettings);
    	}

    	const func_1 = () => {
    		$$invalidate(1, debugConsoleOpen = !debugConsoleOpen);
    	};

    	const func_2 = () => {
    		$$invalidate(8, settingsShown = true);
    	};

    	function viewport_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(3, viewportRef = $$value);
    		});
    	}

    	function viewport_edited_binding(value) {
    		edited = value;
    		$$invalidate(7, edited);
    	}

    	function viewport_debObjectDrag_binding(value) {
    		debugInfo.objectDrag = value;
    		$$invalidate(2, debugInfo);
    	}

    	function viewport_debObjectResize_binding(value) {
    		debugInfo.objectResize = value;
    		$$invalidate(2, debugInfo);
    	}

    	function nodeeditor_resultWidgets_binding(value) {
    		projectData.objects.result = value;
    		$$invalidate(6, projectData);
    	}

    	function nodeeditor_invokeOutputs_binding(value) {
    		invokeProcessCallback = value;
    		$$invalidate(5, invokeProcessCallback);
    	}

    	const func_3 = index => {
    		deleteNotification(index);
    	};

    	$$self.$capture_state = () => ({
    		TopBar,
    		Viewport,
    		NodeEditor,
    		Toolkit,
    		DebugConsole,
    		Settings,
    		NotificationCard,
    		onDestroy,
    		onMount,
    		fs,
    		path,
    		ipcRenderer,
    		userSettings,
    		getUserData,
    		saveUserSettings,
    		debugConsoleOpen,
    		debugInfo,
    		viewportRef,
    		centerViewport,
    		resetZoom,
    		notifications,
    		deleteNotification,
    		processCallback,
    		invokeProcessCallback,
    		projectData,
    		newFile,
    		open,
    		save,
    		saveAs,
    		stringifyCircularJSON,
    		edited,
    		settingsShown,
    		require,
    		JSON,
    		__dirname,
    		debugContents,
    		document,
    		window,
    		Object,
    		setTimeout,
    		console,
    		CustomEvent,
    		WeakSet
    	});

    	$$self.$inject_state = $$props => {
    		if ("userSettings" in $$props) $$invalidate(0, userSettings = $$props.userSettings);
    		if ("debugConsoleOpen" in $$props) $$invalidate(1, debugConsoleOpen = $$props.debugConsoleOpen);
    		if ("debugInfo" in $$props) $$invalidate(2, debugInfo = $$props.debugInfo);
    		if ("viewportRef" in $$props) $$invalidate(3, viewportRef = $$props.viewportRef);
    		if ("notifications" in $$props) $$invalidate(4, notifications = $$props.notifications);
    		if ("processCallback" in $$props) processCallback = $$props.processCallback;
    		if ("projectData" in $$props) $$invalidate(6, projectData = $$props.projectData);
    		if ("edited" in $$props) $$invalidate(7, edited = $$props.edited);
    		if ("settingsShown" in $$props) $$invalidate(8, settingsShown = $$props.settingsShown);
    		if ("debugContents" in $$props) $$invalidate(9, debugContents = $$props.debugContents);
    	};

    	let debugContents;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*debugInfo*/ 4) {
    			 $$invalidate(9, debugContents = [
    				"::Object Drag::",
    				"Ongoing:" + debugInfo.objectDrag[0],
    				"StartX:" + debugInfo.objectDrag[1],
    				"StartY:" + debugInfo.objectDrag[2],
    				"DeltaX:" + debugInfo.objectDrag[3],
    				"DeltaY:" + debugInfo.objectDrag[4],
    				"LayerX:" + debugInfo.objectDrag[5],
    				"LayerY:" + debugInfo.objectDrag[6],
    				"ObjectID:" + debugInfo.objectDrag[7],
    				"ObjectType:" + debugInfo.objectDrag[8],
    				"---",
    				"::Object Resize::",
    				"Ongoing:" + debugInfo.objectResize[0],
    				"StartX:" + debugInfo.objectResize[1],
    				"StartY:" + debugInfo.objectResize[2],
    				"DeltaX:" + debugInfo.objectResize[3],
    				"DeltaY:" + debugInfo.objectResize[4],
    				"ObjectID:" + debugInfo.objectResize[5],
    				"ObjectType:" + debugInfo.objectResize[6]
    			]);
    		}
    	};

    	return [
    		userSettings,
    		debugConsoleOpen,
    		debugInfo,
    		viewportRef,
    		notifications,
    		invokeProcessCallback,
    		projectData,
    		edited,
    		settingsShown,
    		debugContents,
    		ipcRenderer,
    		saveUserSettings,
    		centerViewport,
    		resetZoom,
    		deleteNotification,
    		newFile,
    		open,
    		save,
    		saveAs,
    		fs,
    		path,
    		getUserData,
    		processCallback,
    		stringifyCircularJSON,
    		func,
    		settings_userSettings_binding,
    		func_1,
    		func_2,
    		viewport_binding,
    		viewport_edited_binding,
    		viewport_debObjectDrag_binding,
    		viewport_debObjectResize_binding,
    		nodeeditor_resultWidgets_binding,
    		nodeeditor_invokeOutputs_binding,
    		func_3
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$p.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
