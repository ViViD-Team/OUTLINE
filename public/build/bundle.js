
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
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    			attr_dev(h1, "class", "svelte-i9imca");
    			add_location(h1, file, 9, 8, 125);
    			attr_dev(main, "class", "svelte-i9imca");
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
    			attr_dev(h1, "style", h1_style_value = /*selected*/ ctx[1] ? "color: var(--white);" : "");
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

    			if (dirty & /*selected*/ 2 && h1_style_value !== (h1_style_value = /*selected*/ ctx[1] ? "color: var(--white);" : "")) {
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
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (76:16) {#if selected == null || selected == i}
    function create_if_block(ctx) {
    	let t;
    	let if_block_anchor;
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[5](/*i*/ ctx[9], ...args);
    	}

    	const topbargroup = new TopBarGroup({
    			props: {
    				label: /*group*/ ctx[7].label,
    				selected: /*selected*/ ctx[0] == /*i*/ ctx[9],
    				onClick: func
    			},
    			$$inline: true
    		});

    	let if_block = /*selected*/ ctx[0] == /*i*/ ctx[9] && create_if_block_1(ctx);

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
    			if (dirty & /*selected*/ 1) topbargroup_changes.selected = /*selected*/ ctx[0] == /*i*/ ctx[9];
    			if (dirty & /*selected*/ 1) topbargroup_changes.onClick = func;
    			topbargroup.$set(topbargroup_changes);

    			if (/*selected*/ ctx[0] == /*i*/ ctx[9]) {
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
    		source: "(76:16) {#if selected == null || selected == i}",
    		ctx
    	});

    	return block;
    }

    // (83:20) {#if selected == i}
    function create_if_block_1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*group*/ ctx[7].cmds;
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
    			if (dirty & /*config*/ 2) {
    				each_value_1 = /*group*/ ctx[7].cmds;
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
    		source: "(83:20) {#if selected == i}",
    		ctx
    	});

    	return block;
    }

    // (84:24) {#each group.cmds as cmd}
    function create_each_block_1(ctx) {
    	let current;

    	function func_1(...args) {
    		return /*func_1*/ ctx[6](/*cmd*/ ctx[10], ...args);
    	}

    	const topbarcommand = new TopBarCommand({
    			props: {
    				label: /*cmd*/ ctx[10].label,
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
    		source: "(84:24) {#each group.cmds as cmd}",
    		ctx
    	});

    	return block;
    }

    // (75:12) {#each config as group, i}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = (/*selected*/ ctx[0] == null || /*selected*/ ctx[0] == /*i*/ ctx[9]) && create_if_block(ctx);

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
    			if (/*selected*/ ctx[0] == null || /*selected*/ ctx[0] == /*i*/ ctx[9]) {
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
    		source: "(75:12) {#each config as group, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let div0;
    	let svg;
    	let path;
    	let defs;
    	let linearGradient;
    	let stop0;
    	let stop1;
    	let t;
    	let div2;
    	let div1;
    	let current;
    	let each_value = /*config*/ ctx[1];
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
    			svg = svg_element("svg");
    			path = svg_element("path");
    			defs = svg_element("defs");
    			linearGradient = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			t = space();
    			div2 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(path, "d", "M35 55H5V5H55V55H80");
    			attr_dev(path, "stroke", "url(#paint0_linear_109_17)");
    			attr_dev(path, "stroke-width", "10");
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			add_location(path, file$2, 63, 12, 1565);
    			attr_dev(stop0, "stop-color", "#EC2351");
    			add_location(stop0, file$2, 66, 12, 1849);
    			attr_dev(stop1, "offset", "1");
    			attr_dev(stop1, "stop-color", "#DB6239");
    			add_location(stop1, file$2, 67, 12, 1891);
    			attr_dev(linearGradient, "id", "paint0_linear_109_17");
    			attr_dev(linearGradient, "x1", "55");
    			attr_dev(linearGradient, "y1", "5");
    			attr_dev(linearGradient, "x2", "55");
    			attr_dev(linearGradient, "y2", "55");
    			attr_dev(linearGradient, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient, file$2, 65, 12, 1731);
    			add_location(defs, file$2, 64, 12, 1711);
    			attr_dev(svg, "viewBox", "0 0 85 60");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "svelte-5pp07c");
    			add_location(svg, file$2, 62, 8, 1479);
    			attr_dev(div0, "class", "logoContainer svelte-5pp07c");
    			add_location(div0, file$2, 61, 4, 1442);
    			attr_dev(div1, "class", "frame neuIndentShadow svelte-5pp07c");
    			add_location(div1, file$2, 73, 8, 2054);
    			attr_dev(div2, "class", "frameContainer svelte-5pp07c");
    			add_location(div2, file$2, 72, 4, 2016);
    			attr_dev(main, "class", "svelte-5pp07c");
    			add_location(main, file$2, 60, 0, 1430);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    			append_dev(svg, defs);
    			append_dev(defs, linearGradient);
    			append_dev(linearGradient, stop0);
    			append_dev(linearGradient, stop1);
    			append_dev(main, t);
    			append_dev(main, div2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*config, selected*/ 3) {
    				each_value = /*config*/ ctx[1];
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

    	const config = [
    		{
    			"label": "File",
    			"cmds": [
    				{
    					"label": "New",
    					"func"() {
    						
    					}
    				},
    				{
    					"label": "Open",
    					"func"() {
    						
    					}
    				},
    				{
    					"label": "Save",
    					"func"() {
    						
    					}
    				},
    				{
    					"label": "Save As",
    					"func"() {
    						
    					}
    				}
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

    	const writable_props = ["toggleDebugConsole", "centerView", "resetZoom"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TopBar> was created with unknown prop '${key}'`);
    	});

    	const func = i => {
    		$$invalidate(0, selected = selected == null ? i : null);
    	};

    	const func_1 = cmd => {
    		cmd.func();
    	};

    	$$self.$set = $$props => {
    		if ("toggleDebugConsole" in $$props) $$invalidate(2, toggleDebugConsole = $$props.toggleDebugConsole);
    		if ("centerView" in $$props) $$invalidate(3, centerView = $$props.centerView);
    		if ("resetZoom" in $$props) $$invalidate(4, resetZoom = $$props.resetZoom);
    	};

    	$$self.$capture_state = () => ({
    		TopBarCommand,
    		TopBarGroup,
    		toggleDebugConsole,
    		selected,
    		centerView,
    		resetZoom,
    		config
    	});

    	$$self.$inject_state = $$props => {
    		if ("toggleDebugConsole" in $$props) $$invalidate(2, toggleDebugConsole = $$props.toggleDebugConsole);
    		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
    		if ("centerView" in $$props) $$invalidate(3, centerView = $$props.centerView);
    		if ("resetZoom" in $$props) $$invalidate(4, resetZoom = $$props.resetZoom);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selected, config, toggleDebugConsole, centerView, resetZoom, func, func_1];
    }

    class TopBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			toggleDebugConsole: 2,
    			centerView: 3,
    			resetZoom: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TopBar",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*toggleDebugConsole*/ ctx[2] === undefined && !("toggleDebugConsole" in props)) {
    			console.warn("<TopBar> was created without expected prop 'toggleDebugConsole'");
    		}

    		if (/*centerView*/ ctx[3] === undefined && !("centerView" in props)) {
    			console.warn("<TopBar> was created without expected prop 'centerView'");
    		}

    		if (/*resetZoom*/ ctx[4] === undefined && !("resetZoom" in props)) {
    			console.warn("<TopBar> was created without expected prop 'resetZoom'");
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
    			attr_dev(h1, "contenteditable", "true");
    			set_style(h1, "font-size", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(h1, "min-height", 2 * /*zoom*/ ctx[8] + "vh");
    			set_style(h1, "min-width", /*sizeX*/ ctx[2] * /*zoom*/ ctx[8] + "vh");
    			attr_dev(h1, "class", "svelte-1dxmul8");
    			if (/*text*/ ctx[0] === void 0) add_render_callback(() => /*h1_input_handler*/ ctx[19].call(h1));
    			add_location(h1, file$3, 52, 4, 1148);
    			attr_dev(path0, "d", "M278.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l9.4-9.4V224H109.3l9.4-9.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-9.4-9.4H224V402.7l-9.4-9.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-9.4 9.4V288H402.7l-9.4 9.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l9.4 9.4H288V109.3l9.4 9.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-64-64z");
    			add_location(path0, file$3, 68, 238, 1773);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 512 512");
    			attr_dev(svg0, "class", "svelte-1dxmul8");
    			add_location(svg0, file$3, 68, 8, 1543);
    			attr_dev(div0, "class", "dragHandle svelte-1dxmul8");
    			attr_dev(div0, "draggable", "true");
    			set_style(div0, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(div0, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			add_location(div0, file$3, 58, 4, 1341);
    			attr_dev(path1, "d", "M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z");
    			add_location(path1, file$3, 80, 238, 2869);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 448 512");
    			attr_dev(svg1, "class", "svelte-1dxmul8");
    			add_location(svg1, file$3, 80, 8, 2639);
    			attr_dev(div1, "class", "deleteAction svelte-1dxmul8");
    			set_style(div1, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(div1, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			add_location(div1, file$3, 71, 4, 2452);
    			attr_dev(path2, "d", "M32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z");
    			add_location(path2, file$3, 93, 238, 3596);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "viewBox", "0 0 448 512");
    			attr_dev(svg2, "class", "svelte-1dxmul8");
    			add_location(svg2, file$3, 93, 8, 3366);
    			attr_dev(div2, "class", "resizeHandle svelte-1dxmul8");
    			attr_dev(div2, "draggable", "true");
    			set_style(div2, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(div2, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			add_location(div2, file$3, 83, 4, 3161);
    			set_style(main, "left", ((/*posX*/ ctx[4] + /*simX*/ ctx[9]) * /*zoom*/ ctx[8] + /*offX*/ ctx[6]) * 2 + "vh");
    			set_style(main, "top", ((/*posY*/ ctx[5] + /*simY*/ ctx[10]) * /*zoom*/ ctx[8] + /*offY*/ ctx[7]) * 2 + "vh");
    			set_style(main, "width", Math.max(/*sizeBounds*/ ctx[1][0][0], Math.min(/*sizeX*/ ctx[2] + /*simResizeX*/ ctx[11], /*sizeBounds*/ ctx[1][0][1])) * 2 * /*zoom*/ ctx[8] + "vh");
    			set_style(main, "height", Math.max(/*sizeBounds*/ ctx[1][1][0], Math.min(/*sizeY*/ ctx[3] + /*simResizeY*/ ctx[12], /*sizeBounds*/ ctx[1][1][1])) * 2 * /*zoom*/ ctx[8] + "vh");
    			set_style(main, "border-radius", 1.5 * /*zoom*/ ctx[8] + "vh");
    			set_style(main, "transition", "border-radius .2s cubic-bezier(0, 0, 0, .9),\r\n");
    			attr_dev(main, "class", "svelte-1dxmul8");
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
    				listen_dev(div2, "dragstart", /*resize*/ ctx[14], false, false, false)
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
    			attr_dev(p, "contenteditable", "true");
    			set_style(p, "font-size", 2 * /*zoom*/ ctx[8] + "vh");
    			set_style(p, "min-height", 2 * /*zoom*/ ctx[8] + "vh");
    			set_style(p, "min-width", /*sizeX*/ ctx[2] * /*zoom*/ ctx[8] + "vh");
    			attr_dev(p, "class", "svelte-1oclkah");
    			if (/*text*/ ctx[0] === void 0) add_render_callback(() => /*p_input_handler*/ ctx[19].call(p));
    			add_location(p, file$4, 52, 4, 1173);
    			attr_dev(path0, "d", "M278.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l9.4-9.4V224H109.3l9.4-9.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-9.4-9.4H224V402.7l-9.4-9.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-9.4 9.4V288H402.7l-9.4 9.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l9.4 9.4H288V109.3l9.4 9.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-64-64z");
    			add_location(path0, file$4, 68, 238, 1796);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 512 512");
    			attr_dev(svg0, "class", "svelte-1oclkah");
    			add_location(svg0, file$4, 68, 8, 1566);
    			attr_dev(div0, "class", "dragHandle svelte-1oclkah");
    			attr_dev(div0, "draggable", "true");
    			set_style(div0, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(div0, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			add_location(div0, file$4, 58, 4, 1364);
    			attr_dev(path1, "d", "M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z");
    			add_location(path1, file$4, 80, 238, 2892);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 448 512");
    			attr_dev(svg1, "class", "svelte-1oclkah");
    			add_location(svg1, file$4, 80, 8, 2662);
    			attr_dev(div1, "class", "deleteAction svelte-1oclkah");
    			set_style(div1, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(div1, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			add_location(div1, file$4, 71, 4, 2475);
    			attr_dev(path2, "d", "M32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z");
    			add_location(path2, file$4, 93, 238, 3619);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "viewBox", "0 0 448 512");
    			attr_dev(svg2, "class", "svelte-1oclkah");
    			add_location(svg2, file$4, 93, 8, 3389);
    			attr_dev(div2, "class", "resizeHandle svelte-1oclkah");
    			attr_dev(div2, "draggable", "true");
    			set_style(div2, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(div2, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			add_location(div2, file$4, 83, 4, 3184);
    			attr_dev(main, "class", "neuIndentShadow svelte-1oclkah");
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
    				p.textContent = /*text*/ ctx[0];
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
    				listen_dev(div2, "dragstart", /*resize*/ ctx[14], false, false, false)
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

    			if (dirty & /*text*/ 1 && /*text*/ ctx[0] !== p.textContent) {
    				p.textContent = /*text*/ ctx[0];
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

    /* src\Viewport\Components\Table.svelte generated by Svelte v3.19.1 */

    const { Object: Object_1 } = globals;
    const file$5 = "src\\Viewport\\Components\\Table.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[55] = list[i];
    	child_ctx[57] = i;
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[52] = list[i];
    	child_ctx[54] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[55] = list[i];
    	child_ctx[59] = i;
    	return child_ctx;
    }

    // (217:24) {:else}
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
    	let if_block0 = /*index*/ ctx[59] > 0 && create_if_block_8(ctx);

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[42](/*index*/ ctx[59], ...args);
    	}

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[43](/*index*/ ctx[59], ...args);
    	}

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[44](/*index*/ ctx[59], ...args);
    	}

    	let if_block1 = /*index*/ ctx[59] < /*numRows*/ ctx[2] - 1 && create_if_block_7(ctx);

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[45](/*index*/ ctx[59], ...args);
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
    			attr_dev(div0, "class", "editmodeRowIndicatorButton svelte-645jd5");
    			add_location(div0, file$5, 218, 32, 6084);
    			attr_dev(path0, "d", "M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z");
    			add_location(path0, file$5, 224, 266, 7209);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 448 512");
    			attr_dev(svg0, "class", "svelte-645jd5");
    			add_location(svg0, file$5, 224, 36, 6979);
    			attr_dev(div1, "class", "editmodeRowIndicatorButton svelte-645jd5");
    			add_location(div1, file$5, 223, 32, 6849);
    			attr_dev(path1, "d", "M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z");
    			add_location(path1, file$5, 226, 266, 7840);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 448 512");
    			attr_dev(svg1, "class", "svelte-645jd5");
    			add_location(svg1, file$5, 226, 36, 7610);
    			attr_dev(div2, "class", "editmodeRowIndicatorButton svelte-645jd5");
    			add_location(div2, file$5, 225, 32, 7480);
    			attr_dev(div3, "class", "editmodeRowIndicatorButton svelte-645jd5");
    			add_location(div3, file$5, 227, 32, 8030);
    			attr_dev(div4, "class", "editmodeRowIndicatorButtonContainer svelte-645jd5");
    			add_location(div4, file$5, 217, 28, 6001);
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

    			if (/*index*/ ctx[59] < /*numRows*/ ctx[2] - 1) {
    				if (!if_block1) {
    					if_block1 = create_if_block_7(ctx);
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
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(217:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (210:24) {#if !editmode}
    function create_if_block_6(ctx) {
    	let p;
    	let t_value = /*index*/ ctx[59] + 1 + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "font-size", 1.5 * /*zoom*/ ctx[13] + "vh");
    			set_style(p, "height", 1.5 * /*zoom*/ ctx[13] + "vh");
    			attr_dev(p, "class", "svelte-645jd5");
    			add_location(p, file$5, 210, 28, 5704);
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
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(210:24) {#if !editmode}",
    		ctx
    	});

    	return block;
    }

    // (220:36) {#if index > 0}
    function create_if_block_8(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M201.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 205.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z");
    			add_location(path, file$5, 220, 270, 6514);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 448 512");
    			attr_dev(svg, "class", "svelte-645jd5");
    			add_location(svg, file$5, 220, 40, 6284);
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
    		source: "(220:36) {#if index > 0}",
    		ctx
    	});

    	return block;
    }

    // (229:36) {#if index < numRows - 1}
    function create_if_block_7(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z");
    			add_location(path, file$5, 229, 270, 8482);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 448 512");
    			attr_dev(svg, "class", "svelte-645jd5");
    			add_location(svg, file$5, 229, 40, 8252);
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
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(229:36) {#if index < numRows - 1}",
    		ctx
    	});

    	return block;
    }

    // (199:16) {#each Array(numRows) as y, index}
    function create_each_block_2(ctx) {
    	let div;
    	let t;
    	let div_style_value;

    	function select_block_type(ctx, dirty) {
    		if (!/*editmode*/ ctx[6]) return create_if_block_6;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			t = space();
    			attr_dev(div, "class", "rowIndicator svelte-645jd5");
    			attr_dev(div, "style", div_style_value = "\r\n                        height: " + 3 * /*zoom*/ ctx[13] + "vh;\r\n\r\n                        margin: " + 0.2 * /*zoom*/ ctx[13] + "vh 0 " + 0.2 * /*zoom*/ ctx[13] + "vh 0;\r\n\r\n                        " + (/*editmode*/ ctx[6] ? "cursor: pointer;" : "") + "\r\n\r\n                        border-top-left-radius: " + 0.5 * /*zoom*/ ctx[13] + "vh;\r\n                        border-bottom-left-radius: " + 0.5 * /*zoom*/ ctx[13] + "vh;\r\n                    ");
    			add_location(div, file$5, 199, 20, 5274);
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
    		source: "(199:16) {#each Array(numRows) as y, index}",
    		ctx
    	});

    	return block;
    }

    // (239:12) {#if cellContents}
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
    			if (dirty[0] & /*zoom, cellContents, scanLocked, editmode, alphabeticColName, colNames, numCols, moveColumnRight, deleteColumn, insertColumn, moveColumnLeft*/ 16523354) {
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
    		source: "(239:12) {#if cellContents}",
    		ctx
    	});

    	return block;
    }

    // (272:24) {:else}
    function create_else_block_1(ctx) {
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
    	let if_block0 = /*indexX*/ ctx[54] > 0 && create_if_block_5(ctx);

    	function click_handler_4(...args) {
    		return /*click_handler_4*/ ctx[47](/*indexX*/ ctx[54], ...args);
    	}

    	function click_handler_5(...args) {
    		return /*click_handler_5*/ ctx[48](/*indexX*/ ctx[54], ...args);
    	}

    	function click_handler_6(...args) {
    		return /*click_handler_6*/ ctx[49](/*indexX*/ ctx[54], ...args);
    	}

    	let if_block1 = /*indexX*/ ctx[54] < /*numCols*/ ctx[1] - 1 && create_if_block_4(ctx);

    	function click_handler_7(...args) {
    		return /*click_handler_7*/ ctx[50](/*indexX*/ ctx[54], ...args);
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
    			attr_dev(div0, "class", "editmodeColumnIndicatorButton svelte-645jd5");
    			add_location(div0, file$5, 273, 32, 10581);
    			attr_dev(path0, "d", "M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z");
    			add_location(path0, file$5, 279, 266, 11724);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 448 512");
    			attr_dev(svg0, "class", "svelte-645jd5");
    			add_location(svg0, file$5, 279, 36, 11494);
    			attr_dev(div1, "class", "editmodeColumnIndicatorButton svelte-645jd5");
    			add_location(div1, file$5, 278, 32, 11357);
    			attr_dev(path1, "d", "M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z");
    			add_location(path1, file$5, 282, 266, 12396);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 448 512");
    			attr_dev(svg1, "class", "svelte-645jd5");
    			add_location(svg1, file$5, 282, 36, 12166);
    			attr_dev(div2, "class", "editmodeColumnIndicatorButton svelte-645jd5");
    			add_location(div2, file$5, 281, 32, 12029);
    			attr_dev(div3, "class", "editmodeColumnIndicatorButton svelte-645jd5");
    			add_location(div3, file$5, 283, 32, 12586);
    			set_style(div4, "height", 2 * /*zoom*/ ctx[13] + "vh");
    			attr_dev(div4, "class", "editmodeColumnIndicatorButtonContainer svelte-645jd5");
    			add_location(div4, file$5, 272, 28, 10467);
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

    			if (/*indexX*/ ctx[54] < /*numCols*/ ctx[1] - 1) {
    				if (!if_block1) {
    					if_block1 = create_if_block_4(ctx);
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
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(272:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (255:24) {#if !editmode}
    function create_if_block_2(ctx) {
    	let p;
    	let t;
    	let if_block_anchor;
    	let dispose;

    	function p_input_handler() {
    		/*p_input_handler*/ ctx[46].call(p, /*indexX*/ ctx[54]);
    	}

    	let if_block = !/*colNames*/ ctx[3][/*indexX*/ ctx[54]] && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(p, "contenteditable", "true");
    			set_style(p, "font-size", 1.2 * /*zoom*/ ctx[13] + "vh");
    			set_style(p, "height", 1.5 * /*zoom*/ ctx[13] + "vh");
    			attr_dev(p, "class", "svelte-645jd5");
    			if (/*colNames*/ ctx[3][/*indexX*/ ctx[54]] === void 0) add_render_callback(p_input_handler);
    			add_location(p, file$5, 255, 28, 9604);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);

    			if (/*colNames*/ ctx[3][/*indexX*/ ctx[54]] !== void 0) {
    				p.textContent = /*colNames*/ ctx[3][/*indexX*/ ctx[54]];
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			dispose = listen_dev(p, "input", p_input_handler);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(p, "font-size", 1.2 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(p, "height", 1.5 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*colNames*/ 8 && /*colNames*/ ctx[3][/*indexX*/ ctx[54]] !== p.textContent) {
    				p.textContent = /*colNames*/ ctx[3][/*indexX*/ ctx[54]];
    			}

    			if (!/*colNames*/ ctx[3][/*indexX*/ ctx[54]]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3(ctx);
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
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(255:24) {#if !editmode}",
    		ctx
    	});

    	return block;
    }

    // (275:36) {#if indexX > 0}
    function create_if_block_5(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z");
    			add_location(path, file$5, 275, 270, 11022);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 320 512");
    			attr_dev(svg, "class", "svelte-645jd5");
    			add_location(svg, file$5, 275, 40, 10792);
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
    		source: "(275:36) {#if indexX > 0}",
    		ctx
    	});

    	return block;
    }

    // (285:36) {#if indexX < numCols - 1}
    function create_if_block_4(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z");
    			add_location(path, file$5, 285, 270, 13048);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 320 512");
    			attr_dev(svg, "class", "svelte-645jd5");
    			add_location(svg, file$5, 285, 40, 12818);
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
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(285:36) {#if indexX < numCols - 1}",
    		ctx
    	});

    	return block;
    }

    // (264:28) {#if !colNames[indexX]}
    function create_if_block_3(ctx) {
    	let p;
    	let t_value = /*alphabeticColName*/ ctx[18](/*indexX*/ ctx[54]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "columnIndicatorPlaceholder svelte-645jd5");
    			set_style(p, "font-size", 1.2 * /*zoom*/ ctx[13] + "vh");
    			set_style(p, "height", 1.5 * /*zoom*/ ctx[13] + "vh");
    			add_location(p, file$5, 264, 32, 10050);
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
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(264:28) {#if !colNames[indexX]}",
    		ctx
    	});

    	return block;
    }

    // (312:28) {:else}
    function create_else_block(ctx) {
    	let div;
    	let p;
    	let t_value = /*cellContents*/ ctx[4][/*indexX*/ ctx[54]][/*indexY*/ ctx[57]] + "";
    	let t;
    	let dispose;

    	function p_input_handler_1() {
    		/*p_input_handler_1*/ ctx[51].call(p, /*indexX*/ ctx[54], /*indexY*/ ctx[57]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "contenteditable", "true");
    			set_style(p, "font-size", 1.3 * /*zoom*/ ctx[13] + "vh");
    			attr_dev(p, "class", "svelte-645jd5");
    			if (/*cellContents*/ ctx[4][/*indexX*/ ctx[54]][/*indexY*/ ctx[57]] === void 0) add_render_callback(p_input_handler_1);
    			add_location(p, file$5, 319, 36, 14963);
    			attr_dev(div, "class", "tableCell neuIndentShadowNarrow svelte-645jd5");
    			set_style(div, "height", 3 * /*zoom*/ ctx[13] + "vh");
    			set_style(div, "margin", 0.2 * /*zoom*/ ctx[13] + "vh 0 " + 0.2 * /*zoom*/ ctx[13] + "vh 0");
    			set_style(div, "border-radius", 0.5 * /*zoom*/ ctx[13] + "vh");
    			add_location(div, file$5, 312, 32, 14637);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t);

    			if (/*cellContents*/ ctx[4][/*indexX*/ ctx[54]][/*indexY*/ ctx[57]] !== void 0) {
    				p.textContent = /*cellContents*/ ctx[4][/*indexX*/ ctx[54]][/*indexY*/ ctx[57]];
    			}

    			dispose = listen_dev(p, "input", p_input_handler_1);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*cellContents*/ 16 && t_value !== (t_value = /*cellContents*/ ctx[4][/*indexX*/ ctx[54]][/*indexY*/ ctx[57]] + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*zoom*/ 8192) {
    				set_style(p, "font-size", 1.3 * /*zoom*/ ctx[13] + "vh");
    			}

    			if (dirty[0] & /*cellContents*/ 16 && /*cellContents*/ ctx[4][/*indexX*/ ctx[54]][/*indexY*/ ctx[57]] !== p.textContent) {
    				p.textContent = /*cellContents*/ ctx[4][/*indexX*/ ctx[54]][/*indexY*/ ctx[57]];
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
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(312:28) {:else}",
    		ctx
    	});

    	return block;
    }

    // (294:28) {#if scanLocked(indexX, indexY)}
    function create_if_block_1$1(ctx) {
    	let div1;
    	let p;
    	let t0_value = /*cellContents*/ ctx[4][/*indexX*/ ctx[54]][/*indexY*/ ctx[57]] + "";
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
    			attr_dev(p, "class", "svelte-645jd5");
    			add_location(p, file$5, 301, 36, 13937);
    			attr_dev(path, "d", "M1 1H0L1 0V1Z");
    			add_location(path, file$5, 307, 44, 14408);
    			attr_dev(svg, "viewBox", "0 0 1 1");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "svelte-645jd5");
    			add_location(svg, file$5, 306, 40, 14292);
    			attr_dev(div0, "class", "cellLabelContainer svelte-645jd5");
    			set_style(div0, "width", 1.2 * /*zoom*/ ctx[13] + "vh");
    			set_style(div0, "height", 1.2 * /*zoom*/ ctx[13] + "vh");
    			add_location(div0, file$5, 302, 36, 14046);
    			attr_dev(div1, "class", "tableCell neuIndentShadowNarrow svelte-645jd5");
    			set_style(div1, "height", 3 * /*zoom*/ ctx[13] + "vh");
    			set_style(div1, "margin", 0.2 * /*zoom*/ ctx[13] + "vh 0 " + 0.2 * /*zoom*/ ctx[13] + "vh 0");
    			set_style(div1, "border-radius", 0.5 * /*zoom*/ ctx[13] + "vh");
    			add_location(div1, file$5, 294, 32, 13611);
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
    			if (dirty[0] & /*cellContents*/ 16 && t0_value !== (t0_value = /*cellContents*/ ctx[4][/*indexX*/ ctx[54]][/*indexY*/ ctx[57]] + "")) set_data_dev(t0, t0_value);

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
    		source: "(294:28) {#if scanLocked(indexX, indexY)}",
    		ctx
    	});

    	return block;
    }

    // (293:24) {#each x as y, indexY}
    function create_each_block_1$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*scanLocked*/ ctx[19](/*indexX*/ ctx[54], /*indexY*/ ctx[57])) return create_if_block_1$1;
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
    		source: "(293:24) {#each x as y, indexY}",
    		ctx
    	});

    	return block;
    }

    // (240:16) {#each cellContents as x, indexX}
    function create_each_block$1(ctx) {
    	let div1;
    	let div0;
    	let div0_style_value;
    	let t0;
    	let t1;

    	function select_block_type_1(ctx, dirty) {
    		if (!/*editmode*/ ctx[6]) return create_if_block_2;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value_1 = /*x*/ ctx[52];
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
    			attr_dev(div0, "class", "columnIndicator svelte-645jd5");
    			attr_dev(div0, "style", div0_style_value = "\r\n                        border-top-left-radius: " + 0.5 * /*zoom*/ ctx[13] + "vh;\r\n                        border-top-right-radius: " + 0.5 * /*zoom*/ ctx[13] + "vh;\r\n\r\n                        " + (/*editmode*/ ctx[6] ? "cursor: pointer;" : "") + "\r\n\r\n                        margin-bottom: " + 0.5 * /*zoom*/ ctx[13] + "vh;\r\n\r\n                        height: " + 2 * /*zoom*/ ctx[13] + "vh;\r\n                    ");
    			add_location(div0, file$5, 243, 20, 9157);
    			attr_dev(div1, "class", "tableGridColumn svelte-645jd5");
    			set_style(div1, "width", 10 * /*zoom*/ ctx[13] + "vh");
    			add_location(div1, file$5, 240, 20, 9030);
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

    			if (dirty[0] & /*zoom, cellContents, scanLocked*/ 532496) {
    				each_value_1 = /*x*/ ctx[52];
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
    		source: "(240:16) {#each cellContents as x, indexX}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
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
    			attr_dev(h1, "class", "svelte-645jd5");
    			if (/*title*/ ctx[0] === void 0) add_render_callback(() => /*h1_input_handler*/ ctx[41].call(h1));
    			add_location(h1, file$5, 179, 8, 4604);
    			attr_dev(div0, "class", "titleStrip svelte-645jd5");
    			set_style(div0, "height", 4 * /*zoom*/ ctx[13] + "vh");
    			add_location(div0, file$5, 176, 4, 4524);
    			attr_dev(div1, "class", "rowIndicatorContainer svelte-645jd5");
    			set_style(div1, "width", (/*editmode*/ ctx[6] ? 10 : 2) * /*zoom*/ ctx[13] + "vh");
    			set_style(div1, "margin-top", 2 * /*zoom*/ ctx[13] + "vh");
    			add_location(div1, file$5, 194, 12, 5047);
    			attr_dev(div2, "class", "tableGrid svelte-645jd5");
    			set_style(div2, "width", "calc(100% - " + 4 * /*zoom*/ ctx[13] + "vh)");
    			set_style(div2, "height", "calc(100% - " + 4 * /*zoom*/ ctx[13] + "vh)");
    			add_location(div2, file$5, 189, 8, 4898);
    			attr_dev(div3, "class", "contents svelte-645jd5");
    			add_location(div3, file$5, 188, 4, 4866);
    			attr_dev(path0, "d", "M278.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l9.4-9.4V224H109.3l9.4-9.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-9.4-9.4H224V402.7l-9.4-9.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-9.4 9.4V288H402.7l-9.4 9.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l9.4 9.4H288V109.3l9.4 9.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-64-64z");
    			add_location(path0, file$5, 348, 238, 16003);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 512 512");
    			attr_dev(svg0, "class", "svelte-645jd5");
    			add_location(svg0, file$5, 348, 8, 15773);
    			attr_dev(div4, "class", "dragHandle svelte-645jd5");
    			attr_dev(div4, "draggable", "true");
    			set_style(div4, "width", 3 * /*zoom*/ ctx[13] + "vh");
    			set_style(div4, "height", 3 * /*zoom*/ ctx[13] + "vh");
    			add_location(div4, file$5, 338, 4, 15571);
    			attr_dev(path1, "d", "M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z");
    			add_location(path1, file$5, 360, 238, 17099);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 448 512");
    			attr_dev(svg1, "class", "svelte-645jd5");
    			add_location(svg1, file$5, 360, 8, 16869);
    			attr_dev(div5, "class", "deleteAction svelte-645jd5");
    			set_style(div5, "width", 3 * /*zoom*/ ctx[13] + "vh");
    			set_style(div5, "height", 3 * /*zoom*/ ctx[13] + "vh");
    			add_location(div5, file$5, 351, 4, 16682);
    			attr_dev(path2, "d", "M32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z");
    			add_location(path2, file$5, 373, 238, 17826);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "viewBox", "0 0 448 512");
    			attr_dev(svg2, "class", "svelte-645jd5");
    			add_location(svg2, file$5, 373, 8, 17596);
    			attr_dev(div6, "class", "resizeHandle svelte-645jd5");
    			attr_dev(div6, "draggable", "true");
    			set_style(div6, "width", 3 * /*zoom*/ ctx[13] + "vh");
    			set_style(div6, "height", 3 * /*zoom*/ ctx[13] + "vh");
    			add_location(div6, file$5, 363, 4, 17391);
    			attr_dev(path3, "d", "M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.8 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z");
    			add_location(path3, file$5, 385, 238, 18448);
    			attr_dev(svg3, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg3, "viewBox", "0 0 512 512");
    			attr_dev(svg3, "class", "svelte-645jd5");
    			add_location(svg3, file$5, 385, 8, 18218);
    			attr_dev(div7, "class", "editHandle svelte-645jd5");
    			set_style(div7, "width", 3 * /*zoom*/ ctx[13] + "vh");
    			set_style(div7, "height", 3 * /*zoom*/ ctx[13] + "vh");
    			add_location(div7, file$5, 376, 4, 18049);
    			attr_dev(main, "class", "neuOutdentShadowRim svelte-645jd5");
    			set_style(main, "left", ((/*posX*/ ctx[9] + /*simX*/ ctx[14]) * /*zoom*/ ctx[13] + /*offX*/ ctx[11]) * 2 + "vh");
    			set_style(main, "top", ((/*posY*/ ctx[10] + /*simY*/ ctx[15]) * /*zoom*/ ctx[13] + /*offY*/ ctx[12]) * 2 + "vh");
    			set_style(main, "width", Math.max(/*sizeBounds*/ ctx[5][0][0], Math.min(/*sizeX*/ ctx[7] + /*simResizeX*/ ctx[16], /*sizeBounds*/ ctx[5][0][1])) * 2 * /*zoom*/ ctx[13] + "vh");
    			set_style(main, "height", Math.max(/*sizeBounds*/ ctx[5][1][0], Math.min(/*sizeY*/ ctx[8] + /*simResizeY*/ ctx[17], /*sizeBounds*/ ctx[5][1][1])) * 2 * /*zoom*/ ctx[13] + "vh");
    			set_style(main, "border-radius", 1.5 * /*zoom*/ ctx[13] + "vh");
    			set_style(main, "transition", "border-radius .2s cubic-bezier(0, 0, 0, .9),\r\n");
    			add_location(main, file$5, 163, 0, 4048);
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
    				listen_dev(h1, "input", /*h1_input_handler*/ ctx[41]),
    				listen_dev(div4, "dragstart", /*drag*/ ctx[28], false, false, false),
    				listen_dev(div5, "click", /*handleDelete*/ ctx[30], false, false, false),
    				listen_dev(div6, "dragstart", /*resize*/ ctx[29], false, false, false),
    				listen_dev(div7, "click", /*edit*/ ctx[31], false, false, false)
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

    			if (dirty[0] & /*zoom, editmode, numRows, moveRowDown, deleteRow, insertRow, moveRowUp*/ 251666500) {
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const sizeBounds = [/* X */ [10, 50], [10, 50]]; /* Y */
    	let { title } = $$props;
    	let { numCols = 4 } = $$props, { numRows = 9 } = $$props;
    	let { colNames = [] } = $$props;

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
    		$$invalidate(4, cellContents = Array.from(Array(numCols), () => Array.from(new Array(numRows), () => "")));
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

    	function drag(event) {
    		onDrag(event);
    	}

    	function resize(event) {
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
    		"onEdit"
    	];

    	Object_1.keys($$props).forEach(key => {
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

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("numCols" in $$props) $$invalidate(1, numCols = $$props.numCols);
    		if ("numRows" in $$props) $$invalidate(2, numRows = $$props.numRows);
    		if ("colNames" in $$props) $$invalidate(3, colNames = $$props.colNames);
    		if ("lockedCells" in $$props) $$invalidate(32, lockedCells = $$props.lockedCells);
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
    		if ("onDrag" in $$props) $$invalidate(36, onDrag = $$props.onDrag);
    		if ("onResize" in $$props) $$invalidate(37, onResize = $$props.onResize);
    		if ("onDelete" in $$props) $$invalidate(38, onDelete = $$props.onDelete);
    		if ("onEdit" in $$props) $$invalidate(39, onEdit = $$props.onEdit);
    	};

    	$$self.$capture_state = () => ({
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
    		if ("lockedCells" in $$props) $$invalidate(32, lockedCells = $$props.lockedCells);
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
    		if ("onDrag" in $$props) $$invalidate(36, onDrag = $$props.onDrag);
    		if ("onResize" in $$props) $$invalidate(37, onResize = $$props.onResize);
    		if ("onDelete" in $$props) $$invalidate(38, onDelete = $$props.onDelete);
    		if ("onEdit" in $$props) $$invalidate(39, onEdit = $$props.onEdit);
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
    		p_input_handler_1
    	];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$5,
    			create_fragment$5,
    			safe_not_equal,
    			{
    				sizeBounds: 5,
    				title: 0,
    				numCols: 1,
    				numRows: 2,
    				colNames: 3,
    				lockedCells: 32,
    				cellContents: 4,
    				getCellContents: 33,
    				setCell: 34,
    				editmode: 6,
    				rerender: 35,
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
    				onDrag: 36,
    				onResize: 37,
    				onDelete: 38,
    				onEdit: 39
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<Table> was created without expected prop 'title'");
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

    		if (/*onDrag*/ ctx[36] === undefined && !("onDrag" in props)) {
    			console.warn("<Table> was created without expected prop 'onDrag'");
    		}

    		if (/*onResize*/ ctx[37] === undefined && !("onResize" in props)) {
    			console.warn("<Table> was created without expected prop 'onResize'");
    		}

    		if (/*onDelete*/ ctx[38] === undefined && !("onDelete" in props)) {
    			console.warn("<Table> was created without expected prop 'onDelete'");
    		}

    		if (/*onEdit*/ ctx[39] === undefined && !("onEdit" in props)) {
    			console.warn("<Table> was created without expected prop 'onEdit'");
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
    		return this.$$.ctx[32];
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
    		return this.$$.ctx[33];
    	}

    	set getCellContents(value) {
    		throw new Error("<Table>: Cannot set read-only property 'getCellContents'");
    	}

    	get setCell() {
    		return this.$$.ctx[34];
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
    		return this.$$.ctx[35];
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
    		return this.$$.ctx[36];
    	}

    	set onDrag(onDrag) {
    		this.$set({ onDrag });
    		flush();
    	}

    	get onResize() {
    		return this.$$.ctx[37];
    	}

    	set onResize(onResize) {
    		this.$set({ onResize });
    		flush();
    	}

    	get onDelete() {
    		return this.$$.ctx[38];
    	}

    	set onDelete(onDelete) {
    		this.$set({ onDelete });
    		flush();
    	}

    	get onEdit() {
    		return this.$$.ctx[39];
    	}

    	set onEdit(onEdit) {
    		this.$set({ onEdit });
    		flush();
    	}
    }

    /* src\Viewport\Viewport.svelte generated by Svelte v3.19.1 */

    const { Object: Object_1$1 } = globals;
    const file$6 = "src\\Viewport\\Viewport.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[46] = list[i];
    	child_ctx[47] = list;
    	child_ctx[48] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[46] = list[i];
    	child_ctx[49] = list;
    	child_ctx[48] = i;
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[46] = list[i];
    	child_ctx[50] = list;
    	child_ctx[48] = i;
    	return child_ctx;
    }

    // (404:12) {#each projectData.objects.header as object, index}
    function create_each_block_2$1(ctx) {
    	let updating_text;
    	let updating_sizeBounds;
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[27](/*index*/ ctx[48], /*object*/ ctx[46], ...args);
    	}

    	function func_1(...args) {
    		return /*func_1*/ ctx[28](/*index*/ ctx[48], ...args);
    	}

    	function func_2(...args) {
    		return /*func_2*/ ctx[29](/*index*/ ctx[48], ...args);
    	}

    	function header_text_binding(value) {
    		/*header_text_binding*/ ctx[30].call(null, value, /*object*/ ctx[46]);
    	}

    	function header_sizeBounds_binding(value) {
    		/*header_sizeBounds_binding*/ ctx[31].call(null, value, /*object*/ ctx[46]);
    	}

    	let header_props = {
    		onDrag: func,
    		onResize: func_1,
    		onDelete: func_2,
    		posX: /*object*/ ctx[46].posX,
    		posY: /*object*/ ctx[46].posY,
    		offX: (/*viewX*/ ctx[2] + /*mouseDrag*/ ctx[7].delta.x) / window.innerHeight * 50,
    		offY: (/*viewY*/ ctx[3] + /*mouseDrag*/ ctx[7].delta.y) / window.innerHeight * 50,
    		zoom: /*viewZoom*/ ctx[4],
    		sizeX: /*object*/ ctx[46].sizeX,
    		sizeY: /*object*/ ctx[46].sizeY,
    		simX: /*object*/ ctx[46].simX,
    		simY: /*object*/ ctx[46].simY,
    		simResizeX: /*object*/ ctx[46].simResizeX,
    		simResizeY: /*object*/ ctx[46].simResizeY
    	};

    	if (/*object*/ ctx[46].text !== void 0) {
    		header_props.text = /*object*/ ctx[46].text;
    	}

    	if (/*object*/ ctx[46].sizeBounds !== void 0) {
    		header_props.sizeBounds = /*object*/ ctx[46].sizeBounds;
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
    			if (dirty[0] & /*projectData*/ 1) header_changes.posX = /*object*/ ctx[46].posX;
    			if (dirty[0] & /*projectData*/ 1) header_changes.posY = /*object*/ ctx[46].posY;
    			if (dirty[0] & /*viewX, mouseDrag*/ 132) header_changes.offX = (/*viewX*/ ctx[2] + /*mouseDrag*/ ctx[7].delta.x) / window.innerHeight * 50;
    			if (dirty[0] & /*viewY, mouseDrag*/ 136) header_changes.offY = (/*viewY*/ ctx[3] + /*mouseDrag*/ ctx[7].delta.y) / window.innerHeight * 50;
    			if (dirty[0] & /*viewZoom*/ 16) header_changes.zoom = /*viewZoom*/ ctx[4];
    			if (dirty[0] & /*projectData*/ 1) header_changes.sizeX = /*object*/ ctx[46].sizeX;
    			if (dirty[0] & /*projectData*/ 1) header_changes.sizeY = /*object*/ ctx[46].sizeY;
    			if (dirty[0] & /*projectData*/ 1) header_changes.simX = /*object*/ ctx[46].simX;
    			if (dirty[0] & /*projectData*/ 1) header_changes.simY = /*object*/ ctx[46].simY;
    			if (dirty[0] & /*projectData*/ 1) header_changes.simResizeX = /*object*/ ctx[46].simResizeX;
    			if (dirty[0] & /*projectData*/ 1) header_changes.simResizeY = /*object*/ ctx[46].simResizeY;

    			if (!updating_text && dirty[0] & /*projectData*/ 1) {
    				updating_text = true;
    				header_changes.text = /*object*/ ctx[46].text;
    				add_flush_callback(() => updating_text = false);
    			}

    			if (!updating_sizeBounds && dirty[0] & /*projectData*/ 1) {
    				updating_sizeBounds = true;
    				header_changes.sizeBounds = /*object*/ ctx[46].sizeBounds;
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
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(404:12) {#each projectData.objects.header as object, index}",
    		ctx
    	});

    	return block;
    }

    // (428:12) {#each projectData.objects.paragraph as object, index}
    function create_each_block_1$2(ctx) {
    	let updating_text;
    	let updating_sizeBounds;
    	let current;

    	function func_3(...args) {
    		return /*func_3*/ ctx[32](/*index*/ ctx[48], /*object*/ ctx[46], ...args);
    	}

    	function func_4(...args) {
    		return /*func_4*/ ctx[33](/*index*/ ctx[48], ...args);
    	}

    	function func_5(...args) {
    		return /*func_5*/ ctx[34](/*index*/ ctx[48], ...args);
    	}

    	function paragraph_text_binding(value) {
    		/*paragraph_text_binding*/ ctx[35].call(null, value, /*object*/ ctx[46]);
    	}

    	function paragraph_sizeBounds_binding(value) {
    		/*paragraph_sizeBounds_binding*/ ctx[36].call(null, value, /*object*/ ctx[46]);
    	}

    	let paragraph_props = {
    		onDrag: func_3,
    		onResize: func_4,
    		onDelete: func_5,
    		posX: /*object*/ ctx[46].posX,
    		posY: /*object*/ ctx[46].posY,
    		offX: (/*viewX*/ ctx[2] + /*mouseDrag*/ ctx[7].delta.x) / window.innerHeight * 50,
    		offY: (/*viewY*/ ctx[3] + /*mouseDrag*/ ctx[7].delta.y) / window.innerHeight * 50,
    		zoom: /*viewZoom*/ ctx[4],
    		sizeX: /*object*/ ctx[46].sizeX,
    		sizeY: /*object*/ ctx[46].sizeY,
    		simX: /*object*/ ctx[46].simX,
    		simY: /*object*/ ctx[46].simY,
    		simResizeX: /*object*/ ctx[46].simResizeX,
    		simResizeY: /*object*/ ctx[46].simResizeY
    	};

    	if (/*object*/ ctx[46].text !== void 0) {
    		paragraph_props.text = /*object*/ ctx[46].text;
    	}

    	if (/*object*/ ctx[46].sizeBounds !== void 0) {
    		paragraph_props.sizeBounds = /*object*/ ctx[46].sizeBounds;
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
    			if (dirty[0] & /*projectData*/ 1) paragraph_changes.posX = /*object*/ ctx[46].posX;
    			if (dirty[0] & /*projectData*/ 1) paragraph_changes.posY = /*object*/ ctx[46].posY;
    			if (dirty[0] & /*viewX, mouseDrag*/ 132) paragraph_changes.offX = (/*viewX*/ ctx[2] + /*mouseDrag*/ ctx[7].delta.x) / window.innerHeight * 50;
    			if (dirty[0] & /*viewY, mouseDrag*/ 136) paragraph_changes.offY = (/*viewY*/ ctx[3] + /*mouseDrag*/ ctx[7].delta.y) / window.innerHeight * 50;
    			if (dirty[0] & /*viewZoom*/ 16) paragraph_changes.zoom = /*viewZoom*/ ctx[4];
    			if (dirty[0] & /*projectData*/ 1) paragraph_changes.sizeX = /*object*/ ctx[46].sizeX;
    			if (dirty[0] & /*projectData*/ 1) paragraph_changes.sizeY = /*object*/ ctx[46].sizeY;
    			if (dirty[0] & /*projectData*/ 1) paragraph_changes.simX = /*object*/ ctx[46].simX;
    			if (dirty[0] & /*projectData*/ 1) paragraph_changes.simY = /*object*/ ctx[46].simY;
    			if (dirty[0] & /*projectData*/ 1) paragraph_changes.simResizeX = /*object*/ ctx[46].simResizeX;
    			if (dirty[0] & /*projectData*/ 1) paragraph_changes.simResizeY = /*object*/ ctx[46].simResizeY;

    			if (!updating_text && dirty[0] & /*projectData*/ 1) {
    				updating_text = true;
    				paragraph_changes.text = /*object*/ ctx[46].text;
    				add_flush_callback(() => updating_text = false);
    			}

    			if (!updating_sizeBounds && dirty[0] & /*projectData*/ 1) {
    				updating_sizeBounds = true;
    				paragraph_changes.sizeBounds = /*object*/ ctx[46].sizeBounds;
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
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(428:12) {#each projectData.objects.paragraph as object, index}",
    		ctx
    	});

    	return block;
    }

    // (452:12) {#each projectData.objects.table as object, index}
    function create_each_block$2(ctx) {
    	let updating_title;
    	let updating_sizeBounds;
    	let object = /*object*/ ctx[46];
    	let updating_cellContents;
    	let current;

    	function func_6(...args) {
    		return /*func_6*/ ctx[37](/*index*/ ctx[48], /*object*/ ctx[46], ...args);
    	}

    	function func_7(...args) {
    		return /*func_7*/ ctx[38](/*index*/ ctx[48], ...args);
    	}

    	function func_8(...args) {
    		return /*func_8*/ ctx[39](/*index*/ ctx[48], ...args);
    	}

    	function func_9(...args) {
    		return /*func_9*/ ctx[40](/*index*/ ctx[48], ...args);
    	}

    	function table_title_binding(value) {
    		/*table_title_binding*/ ctx[41].call(null, value, /*object*/ ctx[46]);
    	}

    	function table_sizeBounds_binding(value) {
    		/*table_sizeBounds_binding*/ ctx[42].call(null, value, /*object*/ ctx[46]);
    	}

    	const assign_table = () => /*table_binding*/ ctx[43](table, object);
    	const unassign_table = () => /*table_binding*/ ctx[43](null, object);

    	function table_cellContents_binding(value) {
    		/*table_cellContents_binding*/ ctx[44].call(null, value, /*object*/ ctx[46]);
    	}

    	let table_props = {
    		editmode: /*edited*/ ctx[1] == /*index*/ ctx[48],
    		lockedCells: [],
    		onDrag: func_6,
    		onResize: func_7,
    		onDelete: func_8,
    		onEdit: func_9,
    		posX: /*object*/ ctx[46].posX,
    		posY: /*object*/ ctx[46].posY,
    		offX: (/*viewX*/ ctx[2] + /*mouseDrag*/ ctx[7].delta.x) / window.innerHeight * 50,
    		offY: (/*viewY*/ ctx[3] + /*mouseDrag*/ ctx[7].delta.y) / window.innerHeight * 50,
    		zoom: /*viewZoom*/ ctx[4],
    		sizeX: /*object*/ ctx[46].sizeX,
    		sizeY: /*object*/ ctx[46].sizeY,
    		simX: /*object*/ ctx[46].simX,
    		simY: /*object*/ ctx[46].simY,
    		simResizeX: /*object*/ ctx[46].simResizeX,
    		simResizeY: /*object*/ ctx[46].simResizeY
    	};

    	if (/*object*/ ctx[46].title !== void 0) {
    		table_props.title = /*object*/ ctx[46].title;
    	}

    	if (/*object*/ ctx[46].sizeBounds !== void 0) {
    		table_props.sizeBounds = /*object*/ ctx[46].sizeBounds;
    	}

    	if (/*object*/ ctx[46].cellContents !== void 0) {
    		table_props.cellContents = /*object*/ ctx[46].cellContents;
    	}

    	const table = new Table({ props: table_props, $$inline: true });
    	binding_callbacks.push(() => bind(table, "title", table_title_binding));
    	binding_callbacks.push(() => bind(table, "sizeBounds", table_sizeBounds_binding));
    	assign_table();
    	binding_callbacks.push(() => bind(table, "cellContents", table_cellContents_binding));

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

    			if (object !== /*object*/ ctx[46]) {
    				unassign_table();
    				object = /*object*/ ctx[46];
    				assign_table();
    			}

    			const table_changes = {};
    			if (dirty[0] & /*edited*/ 2) table_changes.editmode = /*edited*/ ctx[1] == /*index*/ ctx[48];
    			if (dirty[0] & /*projectData*/ 1) table_changes.onDrag = func_6;
    			if (dirty[0] & /*edited*/ 2) table_changes.onDelete = func_8;
    			if (dirty[0] & /*edited*/ 2) table_changes.onEdit = func_9;
    			if (dirty[0] & /*projectData*/ 1) table_changes.posX = /*object*/ ctx[46].posX;
    			if (dirty[0] & /*projectData*/ 1) table_changes.posY = /*object*/ ctx[46].posY;
    			if (dirty[0] & /*viewX, mouseDrag*/ 132) table_changes.offX = (/*viewX*/ ctx[2] + /*mouseDrag*/ ctx[7].delta.x) / window.innerHeight * 50;
    			if (dirty[0] & /*viewY, mouseDrag*/ 136) table_changes.offY = (/*viewY*/ ctx[3] + /*mouseDrag*/ ctx[7].delta.y) / window.innerHeight * 50;
    			if (dirty[0] & /*viewZoom*/ 16) table_changes.zoom = /*viewZoom*/ ctx[4];
    			if (dirty[0] & /*projectData*/ 1) table_changes.sizeX = /*object*/ ctx[46].sizeX;
    			if (dirty[0] & /*projectData*/ 1) table_changes.sizeY = /*object*/ ctx[46].sizeY;
    			if (dirty[0] & /*projectData*/ 1) table_changes.simX = /*object*/ ctx[46].simX;
    			if (dirty[0] & /*projectData*/ 1) table_changes.simY = /*object*/ ctx[46].simY;
    			if (dirty[0] & /*projectData*/ 1) table_changes.simResizeX = /*object*/ ctx[46].simResizeX;
    			if (dirty[0] & /*projectData*/ 1) table_changes.simResizeY = /*object*/ ctx[46].simResizeY;

    			if (!updating_title && dirty[0] & /*projectData*/ 1) {
    				updating_title = true;
    				table_changes.title = /*object*/ ctx[46].title;
    				add_flush_callback(() => updating_title = false);
    			}

    			if (!updating_sizeBounds && dirty[0] & /*projectData*/ 1) {
    				updating_sizeBounds = true;
    				table_changes.sizeBounds = /*object*/ ctx[46].sizeBounds;
    				add_flush_callback(() => updating_sizeBounds = false);
    			}

    			if (!updating_cellContents && dirty[0] & /*projectData*/ 1) {
    				updating_cellContents = true;
    				table_changes.cellContents = /*object*/ ctx[46].cellContents;
    				add_flush_callback(() => updating_cellContents = false);
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
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(452:12) {#each projectData.objects.table as object, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let div1_resize_listener;
    	let current;
    	let dispose;
    	let each_value_2 = /*projectData*/ ctx[0].objects.header;
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks_2[i], 1, 1, () => {
    		each_blocks_2[i] = null;
    	});

    	let each_value_1 = /*projectData*/ ctx[0].objects.paragraph;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const out_1 = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*projectData*/ ctx[0].objects.table;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out_2 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t0 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "dottedBackground svelte-1f6heyz");
    			set_style(div0, "background-position-x", /*viewX*/ ctx[2] + /*mouseDrag*/ ctx[7].delta.x + "px");
    			set_style(div0, "background-position-y", /*viewY*/ ctx[3] + /*mouseDrag*/ ctx[7].delta.y + "px");
    			set_style(div0, "background-size", 2 * /*viewZoom*/ ctx[4] + "vh");
    			add_location(div0, file$6, 393, 12, 12421);
    			attr_dev(div1, "class", "frame neuIndentShadow svelte-1f6heyz");
    			add_render_callback(() => /*div1_elementresize_handler*/ ctx[45].call(div1));
    			add_location(div1, file$6, 379, 4, 12026);
    			attr_dev(main, "class", "svelte-1f6heyz");
    			add_location(main, file$6, 375, 0, 11957);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div0, null);
    			}

    			append_dev(div0, t0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div0, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			div1_resize_listener = add_resize_listener(div1, /*div1_elementresize_handler*/ ctx[45].bind(div1));
    			current = true;

    			dispose = [
    				listen_dev(div1, "mousedown", /*mouseDown*/ ctx[8], false, false, false),
    				listen_dev(div1, "mousemove", /*mouseMove*/ ctx[9], false, false, false),
    				listen_dev(div1, "mouseup", /*mouseUp*/ ctx[10], false, false, false),
    				listen_dev(div1, "mouseleave", /*mouseUp*/ ctx[10], false, false, false),
    				listen_dev(div1, "mousewheel", /*scroll*/ ctx[11], false, false, false),
    				listen_dev(div1, "dragover", /*dragOver*/ ctx[14], false, false, false),
    				listen_dev(div1, "drop", /*drop*/ ctx[15], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*initObjectDrag, projectData, initObjectResize, deleteObject, viewX, mouseDrag, viewY, viewZoom*/ 77981) {
    				each_value_2 = /*projectData*/ ctx[0].objects.header;
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
    						each_blocks_2[i].m(div0, t0);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks_2.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*initObjectDrag, projectData, initObjectResize, deleteObject, viewX, mouseDrag, viewY, viewZoom*/ 77981) {
    				each_value_1 = /*projectData*/ ctx[0].objects.paragraph;
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
    						each_blocks_1[i].m(div0, t1);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*edited, initObjectDrag, projectData, initObjectResize, deleteObject, viewX, mouseDrag, viewY, viewZoom*/ 77983) {
    				each_value = /*projectData*/ ctx[0].objects.table;
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
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_2(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty[0] & /*viewX, mouseDrag*/ 132) {
    				set_style(div0, "background-position-x", /*viewX*/ ctx[2] + /*mouseDrag*/ ctx[7].delta.x + "px");
    			}

    			if (!current || dirty[0] & /*viewY, mouseDrag*/ 136) {
    				set_style(div0, "background-position-y", /*viewY*/ ctx[3] + /*mouseDrag*/ ctx[7].delta.y + "px");
    			}

    			if (!current || dirty[0] & /*viewZoom*/ 16) {
    				set_style(div0, "background-size", 2 * /*viewZoom*/ ctx[4] + "vh");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_2[i]);
    			}

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
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

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			div1_resize_listener.cancel();
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

    function instance$6($$self, $$props, $$invalidate) {
    	let { debObjectDrag } = $$props, { debObjectResize } = $$props;
    	let viewX = 0, viewY = 0, viewZoom = 1;
    	const zoomBounds = [0.75, 3];
    	let viewportHeight, viewportWidth;
    	let { projectData } = $$props;

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
    				"operator": []
    			},
    			"reference": undefined,
    			"cellContents": undefined,
    			"posX": 0,
    			"posY": 0,
    			"sizeX": 28,
    			"sizeY": 21,
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
    		if (event.button != 1) return;
    		$$invalidate(7, mouseDrag.ongoing = true, mouseDrag);
    		$$invalidate(7, mouseDrag.start.x = event.clientX, mouseDrag);
    		$$invalidate(7, mouseDrag.start.y = event.clientY, mouseDrag);
    	}

    	function mouseMove(event) {
    		if (!mouseDrag.ongoing) return;
    		$$invalidate(7, mouseDrag.delta.x = event.clientX - mouseDrag.start.x, mouseDrag);
    		$$invalidate(7, mouseDrag.delta.y = event.clientY - mouseDrag.start.y, mouseDrag);
    	}

    	function mouseUp(event) {
    		clearObjectDrag();
    		clearObjectResize();
    		if (!mouseDrag.ongoing || event.button != 1) return;
    		$$invalidate(7, mouseDrag.ongoing = false, mouseDrag);
    		$$invalidate(2, viewX += mouseDrag.delta.x);
    		$$invalidate(3, viewY += mouseDrag.delta.y);
    		$$invalidate(7, mouseDrag.delta = { "x": 0, "y": 0 }, mouseDrag);
    	}

    	function scroll(event) {
    		let oldZoom = viewZoom;
    		$$invalidate(4, viewZoom -= event.deltaY / 1000);
    		$$invalidate(4, viewZoom = Math.max(zoomBounds[0], Math.min(viewZoom, zoomBounds[1])));
    		$$invalidate(2, viewX = (viewX - viewportWidth / 2) * viewZoom / oldZoom + viewportWidth / 2);
    		$$invalidate(3, viewY = (viewY - viewportHeight / 2) * viewZoom / oldZoom + viewportHeight / 2);
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
    		$$invalidate(21, objectDrag = {
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
    		$$invalidate(22, objectResize = {
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
    		$$invalidate(21, objectDrag.ongoing = true, objectDrag);

    		$$invalidate(21, objectDrag.start.x = event.clientX, objectDrag);
    		$$invalidate(21, objectDrag.start.y = event.clientY, objectDrag);
    		$$invalidate(21, objectDrag.objectInfo.type = type, objectDrag);
    		$$invalidate(21, objectDrag.objectInfo.ID = index, objectDrag);
    		$$invalidate(21, objectDrag.objectInfo.width = width, objectDrag);
    		$$invalidate(21, objectDrag.objectInfo.height = height, objectDrag);
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
    		$$invalidate(22, objectResize.start.x = event.clientX, objectResize);
    		$$invalidate(22, objectResize.start.y = event.clientY, objectResize);
    		$$invalidate(22, objectResize.objectInfo.type = type, objectResize);
    		$$invalidate(22, objectResize.objectInfo.ID = index, objectResize);
    		$$invalidate(22, objectResize.ongoing = true, objectResize);
    	}

    	function dragOver(event) {
    		event.preventDefault();
    		let vhConverter = window.innerHeight / 100 * 2 * viewZoom;

    		if (objectDrag.ongoing) {
    			// Update objectDrag
    			$$invalidate(21, objectDrag.delta.x = Math.round((event.clientX - objectDrag.start.x) / vhConverter), objectDrag);

    			$$invalidate(21, objectDrag.delta.y = Math.round((event.clientY - objectDrag.start.y) / vhConverter), objectDrag);
    			$$invalidate(21, objectDrag.layer.x = event.layerX, objectDrag);
    			$$invalidate(21, objectDrag.layer.y = event.layerY, objectDrag);
    			$$invalidate(0, projectData.objects[objectDrag.objectInfo.type][objectDrag.objectInfo.ID].simX = objectDrag.delta.x, projectData);
    			$$invalidate(0, projectData.objects[objectDrag.objectInfo.type][objectDrag.objectInfo.ID].simY = objectDrag.delta.y, projectData);
    		}

    		if (objectResize.ongoing) {
    			// Update objectResize
    			$$invalidate(22, objectResize.delta.x = Math.round((event.clientX - objectResize.start.x) / vhConverter), objectResize);

    			$$invalidate(22, objectResize.delta.y = Math.round((event.clientY - objectResize.start.y) / vhConverter), objectResize);
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
    				$$invalidate(21, objectDrag.ongoing = false, objectDrag);
    				break;
    			case "resize":
    				$$invalidate(22, objectResize.ongoing = false, objectResize);
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
    				projectData.objects[type].push(Object.assign({}, objectPrototypes[type]));
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
    		$$invalidate(2, viewX = 0);
    		$$invalidate(3, viewY = 0);
    	}

    	function resetZoom() {
    		$$invalidate(4, viewZoom = 1);
    	}

    	const writable_props = ["debObjectDrag", "debObjectResize", "projectData", "edited"];

    	Object_1$1.keys($$props).forEach(key => {
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
    		$$invalidate(1, edited = edited == null ? index : edited != index ? index : null);
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
    			$$invalidate(46, object);
    		});
    	}

    	function table_cellContents_binding(value, object) {
    		object.cellContents = value;
    		$$invalidate(0, projectData);
    	}

    	function div1_elementresize_handler() {
    		viewportHeight = this.offsetHeight;
    		viewportWidth = this.offsetWidth;
    		$$invalidate(5, viewportHeight);
    		$$invalidate(6, viewportWidth);
    	}

    	$$self.$set = $$props => {
    		if ("debObjectDrag" in $$props) $$invalidate(17, debObjectDrag = $$props.debObjectDrag);
    		if ("debObjectResize" in $$props) $$invalidate(18, debObjectResize = $$props.debObjectResize);
    		if ("projectData" in $$props) $$invalidate(0, projectData = $$props.projectData);
    		if ("edited" in $$props) $$invalidate(1, edited = $$props.edited);
    	};

    	$$self.$capture_state = () => ({
    		Header,
    		Paragraph,
    		Table,
    		debObjectDrag,
    		debObjectResize,
    		viewX,
    		viewY,
    		viewZoom,
    		zoomBounds,
    		viewportHeight,
    		viewportWidth,
    		projectData,
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
    		undefined,
    		Math,
    		document,
    		window,
    		Object
    	});

    	$$self.$inject_state = $$props => {
    		if ("debObjectDrag" in $$props) $$invalidate(17, debObjectDrag = $$props.debObjectDrag);
    		if ("debObjectResize" in $$props) $$invalidate(18, debObjectResize = $$props.debObjectResize);
    		if ("viewX" in $$props) $$invalidate(2, viewX = $$props.viewX);
    		if ("viewY" in $$props) $$invalidate(3, viewY = $$props.viewY);
    		if ("viewZoom" in $$props) $$invalidate(4, viewZoom = $$props.viewZoom);
    		if ("viewportHeight" in $$props) $$invalidate(5, viewportHeight = $$props.viewportHeight);
    		if ("viewportWidth" in $$props) $$invalidate(6, viewportWidth = $$props.viewportWidth);
    		if ("projectData" in $$props) $$invalidate(0, projectData = $$props.projectData);
    		if ("mouseDrag" in $$props) $$invalidate(7, mouseDrag = $$props.mouseDrag);
    		if ("objectDrag" in $$props) $$invalidate(21, objectDrag = $$props.objectDrag);
    		if ("objectResize" in $$props) $$invalidate(22, objectResize = $$props.objectResize);
    		if ("edited" in $$props) $$invalidate(1, edited = $$props.edited);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*objectDrag*/ 2097152) {
    			 $$invalidate(17, debObjectDrag = [
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

    		if ($$self.$$.dirty[0] & /*objectResize*/ 4194304) {
    			 $$invalidate(18, debObjectResize = [
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
    		viewX,
    		viewY,
    		viewZoom,
    		viewportHeight,
    		viewportWidth,
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
    		div1_elementresize_handler
    	];
    }

    class Viewport extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$6,
    			create_fragment$6,
    			safe_not_equal,
    			{
    				debObjectDrag: 17,
    				debObjectResize: 18,
    				projectData: 0,
    				edited: 1,
    				centerView: 19,
    				resetZoom: 20
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Viewport",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*debObjectDrag*/ ctx[17] === undefined && !("debObjectDrag" in props)) {
    			console.warn("<Viewport> was created without expected prop 'debObjectDrag'");
    		}

    		if (/*debObjectResize*/ ctx[18] === undefined && !("debObjectResize" in props)) {
    			console.warn("<Viewport> was created without expected prop 'debObjectResize'");
    		}

    		if (/*projectData*/ ctx[0] === undefined && !("projectData" in props)) {
    			console.warn("<Viewport> was created without expected prop 'projectData'");
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

    	get edited() {
    		throw new Error("<Viewport>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set edited(value) {
    		throw new Error("<Viewport>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centerView() {
    		return this.$$.ctx[19];
    	}

    	set centerView(value) {
    		throw new Error("<Viewport>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get resetZoom() {
    		return this.$$.ctx[20];
    	}

    	set resetZoom(value) {
    		throw new Error("<Viewport>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\NodeEditor\Node.svelte generated by Svelte v3.19.1 */

    const { console: console_1 } = globals;
    const file$7 = "src\\NodeEditor\\Node.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	child_ctx[24] = i;
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	child_ctx[24] = i;
    	return child_ctx;
    }

    // (97:0) {#if nodeObject !== null && nodeObject !== undefined}
    function create_if_block$2(ctx) {
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
    			attr_dev(h1, "class", "svelte-7xj96q");
    			add_location(h1, file$7, 116, 12, 3176);
    			attr_dev(div0, "class", "titleBar svelte-7xj96q");
    			attr_dev(div0, "draggable", "true");
    			set_style(div0, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(div0, "background-color", /*nodeData*/ ctx[0].color);
    			add_location(div0, file$7, 106, 8, 2928);
    			set_style(div1, "padding-top", 0.5 * /*zoom*/ ctx[8] + "vh");
    			attr_dev(div1, "class", "inputs svelte-7xj96q");
    			add_location(div1, file$7, 122, 12, 3370);
    			set_style(div2, "padding-top", 0.5 * /*zoom*/ ctx[8] + "vh");
    			attr_dev(div2, "class", "outputs svelte-7xj96q");
    			add_location(div2, file$7, 148, 12, 4715);
    			attr_dev(div3, "class", "contents svelte-7xj96q");
    			add_location(div3, file$7, 121, 8, 3334);
    			attr_dev(path_1, "d", "M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z");
    			add_location(path_1, file$7, 191, 242, 6879);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 448 512");
    			attr_dev(svg, "class", "svelte-7xj96q");
    			add_location(svg, file$7, 191, 12, 6649);
    			attr_dev(div4, "class", "deleteAction svelte-7xj96q");
    			set_style(div4, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			set_style(div4, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			add_location(div4, file$7, 182, 8, 6426);
    			attr_dev(main, "class", "neuOutdentShadowRim svelte-7xj96q");
    			set_style(main, "left", ((/*posX*/ ctx[2] + /*simX*/ ctx[6]) * /*zoom*/ ctx[8] + /*offX*/ ctx[4]) * 2 + "vh");
    			set_style(main, "top", ((/*posY*/ ctx[3] + /*simY*/ ctx[7]) * /*zoom*/ ctx[8] + /*offY*/ ctx[5]) * 2 + "vh");
    			set_style(main, "width", 2 * /*nodeData*/ ctx[0].width * /*zoom*/ ctx[8] + "vh");
    			set_style(main, "height", /*zoom*/ ctx[8] * 4 + 3 * /*zoom*/ ctx[8] * Math.max(/*nodeObject*/ ctx[1].inputs.length, /*nodeObject*/ ctx[1].outputs.length) + "vh");
    			set_style(main, "border-radius", /*zoom*/ ctx[8] + "vh");
    			add_location(main, file$7, 97, 4, 2571);
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
    				listen_dev(div0, "dragstart", /*drag*/ ctx[13], false, false, false),
    				listen_dev(div4, "click", /*handleDelete*/ ctx[14], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*nodeObject*/ 2 && t0_value !== (t0_value = /*nodeObject*/ ctx[1].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*zoom*/ 256) {
    				set_style(h1, "font-size", 1.5 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(h1, "margin-left", /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div0, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*nodeData*/ 1) {
    				set_style(div0, "background-color", /*nodeData*/ ctx[0].color);
    			}

    			if (dirty & /*zoom, dragOver, handleConnect, nodeData, nodeObject*/ 4355) {
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

    			if (dirty & /*zoom*/ 256) {
    				set_style(div1, "padding-top", 0.5 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom, initConnectionDrag, nodeObject, clearDrag, nodeData, dragState*/ 3843) {
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

    			if (dirty & /*zoom*/ 256) {
    				set_style(div2, "padding-top", 0.5 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div4, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div4, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*posX, simX, zoom, offX*/ 340) {
    				set_style(main, "left", ((/*posX*/ ctx[2] + /*simX*/ ctx[6]) * /*zoom*/ ctx[8] + /*offX*/ ctx[4]) * 2 + "vh");
    			}

    			if (dirty & /*posY, simY, zoom, offY*/ 424) {
    				set_style(main, "top", ((/*posY*/ ctx[3] + /*simY*/ ctx[7]) * /*zoom*/ ctx[8] + /*offY*/ ctx[5]) * 2 + "vh");
    			}

    			if (dirty & /*nodeData, zoom*/ 257) {
    				set_style(main, "width", 2 * /*nodeData*/ ctx[0].width * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom, nodeObject*/ 258) {
    				set_style(main, "height", /*zoom*/ ctx[8] * 4 + 3 * /*zoom*/ ctx[8] * Math.max(/*nodeObject*/ ctx[1].inputs.length, /*nodeObject*/ ctx[1].outputs.length) + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(97:0) {#if nodeObject !== null && nodeObject !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (124:16) {#each nodeObject.inputs as input, index}
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
    	let t1_value = /*input*/ ctx[25].label + "";
    	let t1;
    	let t2;
    	let dispose;

    	function drop_handler(...args) {
    		return /*drop_handler*/ ctx[20](/*index*/ ctx[24], ...args);
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
    			add_location(rect0, file$7, 133, 32, 4058);
    			attr_dev(rect1, "x", "5");
    			attr_dev(rect1, "y", "5");
    			attr_dev(rect1, "width", "5");
    			attr_dev(rect1, "height", "5");
    			attr_dev(rect1, "rx", "2.5");
    			attr_dev(rect1, "fill", rect1_fill_value = /*nodeData*/ ctx[0].color);
    			add_location(rect1, file$7, 134, 32, 4185);
    			set_style(svg, "width", 2 * /*zoom*/ ctx[8] + "vh");
    			set_style(svg, "height", 2 * /*zoom*/ ctx[8] + "vh");
    			attr_dev(svg, "viewBox", "0 0 15 15");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$7, 132, 28, 3905);
    			set_style(div0, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			attr_dev(div0, "class", "inputTetherCircleContainer svelte-7xj96q");
    			add_location(div0, file$7, 131, 24, 3808);
    			set_style(p, "font-size", /*zoom*/ ctx[8] + "vh");
    			set_style(p, "color", /*nodeData*/ ctx[0].color);
    			attr_dev(p, "class", "svelte-7xj96q");
    			add_location(p, file$7, 138, 28, 4421);
    			attr_dev(div1, "class", "inputTetherLabelContainer svelte-7xj96q");
    			add_location(div1, file$7, 137, 24, 4352);
    			set_style(div2, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			attr_dev(div2, "class", "inputTether svelte-7xj96q");
    			add_location(div2, file$7, 124, 20, 3505);
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

    			if (dirty & /*nodeData*/ 1 && rect1_fill_value !== (rect1_fill_value = /*nodeData*/ ctx[0].color)) {
    				attr_dev(rect1, "fill", rect1_fill_value);
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(svg, "width", 2 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(svg, "height", 2 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div0, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*nodeObject*/ 2 && t1_value !== (t1_value = /*input*/ ctx[25].label + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*zoom*/ 256) {
    				set_style(p, "font-size", /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*nodeData*/ 1) {
    				set_style(p, "color", /*nodeData*/ ctx[0].color);
    			}

    			if (dirty & /*zoom*/ 256) {
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
    		source: "(124:16) {#each nodeObject.inputs as input, index}",
    		ctx
    	});

    	return block;
    }

    // (150:16) {#each nodeObject.outputs as output, index}
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
    	let t1_value = /*output*/ ctx[22].label + "";
    	let t1;
    	let t2;
    	let dispose;

    	function dragstart_handler(...args) {
    		return /*dragstart_handler*/ ctx[21](/*output*/ ctx[22], /*index*/ ctx[24], ...args);
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
    			add_location(rect0, file$7, 166, 32, 5751);
    			attr_dev(rect1, "x", "5");
    			attr_dev(rect1, "y", "5");
    			attr_dev(rect1, "width", "5");
    			attr_dev(rect1, "height", "5");
    			attr_dev(rect1, "rx", "2.5");
    			attr_dev(rect1, "fill", rect1_fill_value = /*nodeData*/ ctx[0].color);
    			add_location(rect1, file$7, 167, 32, 5878);

    			attr_dev(svg, "style", svg_style_value = "\r\n                                width: " + 2 * /*zoom*/ ctx[8] + "vh;\r\n                                height: " + 2 * /*zoom*/ ctx[8] + "vh;\r\n                                " + (/*dragState*/ ctx[9] === /*index*/ ctx[24]
    			? "transform: scale(1.5) rotate(360deg);"
    			: "") + "\r\n                                transition: transform .5s cubic-bezier(0, 0, 0, .9);\r\n                            ");

    			attr_dev(svg, "viewBox", "0 0 15 15");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$7, 160, 28, 5313);
    			set_style(div0, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			attr_dev(div0, "class", "outputTetherCircleContainer svelte-7xj96q");
    			add_location(div0, file$7, 159, 24, 5215);
    			set_style(p, "font-size", /*zoom*/ ctx[8] + "vh");
    			set_style(p, "color", /*nodeData*/ ctx[0].color);
    			attr_dev(p, "class", "svelte-7xj96q");
    			add_location(p, file$7, 171, 28, 6115);
    			attr_dev(div1, "class", "outputTetherLabelContainer svelte-7xj96q");
    			add_location(div1, file$7, 170, 24, 6045);
    			set_style(div2, "height", 3 * /*zoom*/ ctx[8] + "vh");
    			attr_dev(div2, "class", "outputTether svelte-7xj96q");
    			attr_dev(div2, "draggable", "true");
    			add_location(div2, file$7, 150, 20, 4853);
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
    				listen_dev(div2, "dragend", /*clearDrag*/ ctx[11], false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*nodeData*/ 1 && rect1_fill_value !== (rect1_fill_value = /*nodeData*/ ctx[0].color)) {
    				attr_dev(rect1, "fill", rect1_fill_value);
    			}

    			if (dirty & /*zoom, dragState*/ 768 && svg_style_value !== (svg_style_value = "\r\n                                width: " + 2 * /*zoom*/ ctx[8] + "vh;\r\n                                height: " + 2 * /*zoom*/ ctx[8] + "vh;\r\n                                " + (/*dragState*/ ctx[9] === /*index*/ ctx[24]
    			? "transform: scale(1.5) rotate(360deg);"
    			: "") + "\r\n                                transition: transform .5s cubic-bezier(0, 0, 0, .9);\r\n                            ")) {
    				attr_dev(svg, "style", svg_style_value);
    			}

    			if (dirty & /*zoom*/ 256) {
    				set_style(div0, "width", 3 * /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*nodeObject*/ 2 && t1_value !== (t1_value = /*output*/ ctx[22].label + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*zoom*/ 256) {
    				set_style(p, "font-size", /*zoom*/ ctx[8] + "vh");
    			}

    			if (dirty & /*nodeData*/ 1) {
    				set_style(p, "color", /*nodeData*/ ctx[0].color);
    			}

    			if (dirty & /*zoom*/ 256) {
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
    		source: "(150:16) {#each nodeObject.outputs as output, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let if_block_anchor;
    	let if_block = /*nodeObject*/ ctx[1] !== null && /*nodeObject*/ ctx[1] !== undefined && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*nodeObject*/ ctx[1] !== null && /*nodeObject*/ ctx[1] !== undefined) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    function dragOver(event) {
    	event.preventDefault();
    	event.stopPropagation();
    }

    function instance$7($$self, $$props, $$invalidate) {
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
    		} catch(err) {
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
    		$$invalidate(9, dragState = index);
    	}

    	function clearDrag() {
    		$$invalidate(9, dragState = null);
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
    		"onDelete"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Node> was created with unknown prop '${key}'`);
    	});

    	const drop_handler = (index, event) => {
    		handleConnect(event, index);
    	};

    	const dragstart_handler = (output, index, event) => initConnectionDrag(event, output.id, index);

    	$$self.$set = $$props => {
    		if ("posX" in $$props) $$invalidate(2, posX = $$props.posX);
    		if ("posY" in $$props) $$invalidate(3, posY = $$props.posY);
    		if ("offX" in $$props) $$invalidate(4, offX = $$props.offX);
    		if ("offY" in $$props) $$invalidate(5, offY = $$props.offY);
    		if ("simX" in $$props) $$invalidate(6, simX = $$props.simX);
    		if ("simY" in $$props) $$invalidate(7, simY = $$props.simY);
    		if ("zoom" in $$props) $$invalidate(8, zoom = $$props.zoom);
    		if ("nodeData" in $$props) $$invalidate(0, nodeData = $$props.nodeData);
    		if ("context" in $$props) $$invalidate(15, context = $$props.context);
    		if ("nodeObject" in $$props) $$invalidate(1, nodeObject = $$props.nodeObject);
    		if ("connectionCallback" in $$props) $$invalidate(16, connectionCallback = $$props.connectionCallback);
    		if ("onDrag" in $$props) $$invalidate(17, onDrag = $$props.onDrag);
    		if ("onDelete" in $$props) $$invalidate(18, onDelete = $$props.onDelete);
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
    		dragState,
    		initConnectionDrag,
    		clearDrag,
    		dragOver,
    		connectionCallback,
    		handleConnect,
    		onDrag,
    		onDelete,
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
    		if ("context" in $$props) $$invalidate(15, context = $$props.context);
    		if ("nodeObject" in $$props) $$invalidate(1, nodeObject = $$props.nodeObject);
    		if ("dragState" in $$props) $$invalidate(9, dragState = $$props.dragState);
    		if ("connectionCallback" in $$props) $$invalidate(16, connectionCallback = $$props.connectionCallback);
    		if ("onDrag" in $$props) $$invalidate(17, onDrag = $$props.onDrag);
    		if ("onDelete" in $$props) $$invalidate(18, onDelete = $$props.onDelete);
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
    		drop_handler,
    		dragstart_handler
    	];
    }

    class Node extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			posX: 2,
    			posY: 3,
    			offX: 4,
    			offY: 5,
    			simX: 6,
    			simY: 7,
    			zoom: 8,
    			nodeData: 0,
    			context: 15,
    			nodeObject: 1,
    			connectionCallback: 16,
    			onDrag: 17,
    			onDelete: 18
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Node",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nodeData*/ ctx[0] === undefined && !("nodeData" in props)) {
    			console_1.warn("<Node> was created without expected prop 'nodeData'");
    		}

    		if (/*context*/ ctx[15] === undefined && !("context" in props)) {
    			console_1.warn("<Node> was created without expected prop 'context'");
    		}

    		if (/*nodeObject*/ ctx[1] === undefined && !("nodeObject" in props)) {
    			console_1.warn("<Node> was created without expected prop 'nodeObject'");
    		}

    		if (/*connectionCallback*/ ctx[16] === undefined && !("connectionCallback" in props)) {
    			console_1.warn("<Node> was created without expected prop 'connectionCallback'");
    		}

    		if (/*onDrag*/ ctx[17] === undefined && !("onDrag" in props)) {
    			console_1.warn("<Node> was created without expected prop 'onDrag'");
    		}

    		if (/*onDelete*/ ctx[18] === undefined && !("onDelete" in props)) {
    			console_1.warn("<Node> was created without expected prop 'onDelete'");
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
    }

    /* src\NodeEditor\InputNode.svelte generated by Svelte v3.19.1 */

    const { Object: Object_1$2, console: console_1$1 } = globals;
    const file$8 = "src\\NodeEditor\\InputNode.svelte";

    function create_fragment$8(ctx) {
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
    		/*input0_input_handler*/ ctx[23].call(input0);
    	}

    	function input1_input_handler() {
    		input1_updating = true;
    		/*input1_input_handler*/ ctx[24].call(input1);
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text("Input");
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
    			attr_dev(h1, "class", "svelte-z7fwe5");
    			add_location(h1, file$8, 126, 8, 2953);
    			attr_dev(div0, "class", "titleBar svelte-z7fwe5");
    			attr_dev(div0, "draggable", "true");
    			set_style(div0, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			set_style(div0, "background-color", /*nodeData*/ ctx[0].color);
    			add_location(div0, file$8, 116, 4, 2741);
    			set_style(div1, "padding-top", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div1, "class", "inputs svelte-z7fwe5");
    			add_location(div1, file$8, 135, 12, 3205);
    			attr_dev(rect0, "x", "2.5");
    			attr_dev(rect0, "y", "2.5");
    			attr_dev(rect0, "width", "10");
    			attr_dev(rect0, "height", "10");
    			attr_dev(rect0, "rx", "5");
    			attr_dev(rect0, "stroke", "#999999");
    			attr_dev(rect0, "stroke-dasharray", "2 2");
    			add_location(rect0, file$8, 158, 28, 4235);
    			attr_dev(rect1, "x", "5");
    			attr_dev(rect1, "y", "5");
    			attr_dev(rect1, "width", "5");
    			attr_dev(rect1, "height", "5");
    			attr_dev(rect1, "rx", "2.5");
    			attr_dev(rect1, "fill", rect1_fill_value = /*nodeData*/ ctx[0].color);
    			add_location(rect1, file$8, 159, 28, 4358);

    			attr_dev(svg0, "style", svg0_style_value = "\r\n                            width: " + 2 * /*zoom*/ ctx[7] + "vh;\r\n                            height: " + 2 * /*zoom*/ ctx[7] + "vh;\r\n                            " + (/*dragState*/ ctx[9] === 0
    			? "transform: scale(1.5) rotate(360deg);"
    			: "") + "\r\n                            transition: transform .5s cubic-bezier(0, 0, 0, .9);\r\n                        ");

    			attr_dev(svg0, "viewBox", "0 0 15 15");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file$8, 152, 24, 3825);
    			set_style(div2, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div2, "class", "outputTetherCircleContainer svelte-z7fwe5");
    			add_location(div2, file$8, 151, 20, 3731);
    			set_style(p, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(p, "color", /*nodeData*/ ctx[0].color);
    			attr_dev(p, "class", "svelte-z7fwe5");
    			add_location(p, file$8, 163, 24, 4579);
    			attr_dev(div3, "class", "outputTetherLabelContainer svelte-z7fwe5");
    			add_location(div3, file$8, 162, 20, 4513);
    			set_style(div4, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div4, "class", "outputTether svelte-z7fwe5");
    			attr_dev(div4, "draggable", "true");
    			add_location(div4, file$8, 142, 16, 3402);
    			set_style(div5, "padding-top", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div5, "class", "outputs svelte-z7fwe5");
    			add_location(div5, file$8, 140, 12, 3323);
    			attr_dev(div6, "class", "tetherContainer svelte-z7fwe5");
    			set_style(div6, "height", 4 * /*zoom*/ ctx[7] + "vh");
    			add_location(div6, file$8, 132, 8, 3110);
    			set_style(h20, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(h20, "margin-left", /*zoom*/ ctx[7] + "vh");
    			set_style(h20, "margin-right", 0.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(h20, "color", /*nodeData*/ ctx[0].color);
    			add_location(h20, file$8, 175, 16, 4920);
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "name", "col");
    			attr_dev(input0, "min", "0");
    			set_style(input0, "width", 4 * /*zoom*/ ctx[7] + "vh");
    			set_style(input0, "height", 1.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(input0, "margin-right", /*zoom*/ ctx[7] + "vh");
    			set_style(input0, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(input0, "color", /*nodeData*/ ctx[0].color);
    			set_style(input0, "border-radius", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(input0, "class", "svelte-z7fwe5");
    			add_location(input0, file$8, 181, 16, 5160);
    			attr_dev(div7, "class", "setting svelte-z7fwe5");
    			add_location(div7, file$8, 174, 12, 4881);
    			set_style(h21, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(h21, "margin-left", /*zoom*/ ctx[7] + "vh");
    			set_style(h21, "margin-right", 0.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(h21, "color", /*nodeData*/ ctx[0].color);
    			add_location(h21, file$8, 191, 16, 5599);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "name", "row");
    			attr_dev(input1, "min", "0");
    			set_style(input1, "width", 4 * /*zoom*/ ctx[7] + "vh");
    			set_style(input1, "height", 1.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(input1, "margin-right", /*zoom*/ ctx[7] + "vh");
    			set_style(input1, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(input1, "color", /*nodeData*/ ctx[0].color);
    			set_style(input1, "border-radius", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(input1, "class", "svelte-z7fwe5");
    			add_location(input1, file$8, 197, 16, 5836);
    			attr_dev(div8, "class", "setting svelte-z7fwe5");
    			add_location(div8, file$8, 190, 12, 5560);
    			attr_dev(div9, "class", "settingsContainer svelte-z7fwe5");
    			add_location(div9, file$8, 173, 8, 4836);
    			attr_dev(div10, "class", "contents svelte-z7fwe5");
    			add_location(div10, file$8, 131, 4, 3078);
    			attr_dev(path_1, "d", "M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z");
    			add_location(path_1, file$8, 221, 238, 6701);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 448 512");
    			attr_dev(svg1, "class", "svelte-z7fwe5");
    			add_location(svg1, file$8, 221, 8, 6471);
    			attr_dev(div11, "class", "deleteAction svelte-z7fwe5");
    			set_style(div11, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			set_style(div11, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			add_location(div11, file$8, 212, 4, 6284);
    			attr_dev(main, "class", "neuOutdentShadowRim svelte-z7fwe5");
    			set_style(main, "left", ((/*posX*/ ctx[1] + /*simX*/ ctx[5]) * /*zoom*/ ctx[7] + /*offX*/ ctx[3]) * 2 + "vh");
    			set_style(main, "top", ((/*posY*/ ctx[2] + /*simY*/ ctx[6]) * /*zoom*/ ctx[7] + /*offY*/ ctx[4]) * 2 + "vh");
    			set_style(main, "width", 2 * /*nodeData*/ ctx[0].width * /*zoom*/ ctx[7] + "vh");
    			set_style(main, "height", /*zoom*/ ctx[7] * 12 + "vh");
    			set_style(main, "border-radius", /*zoom*/ ctx[7] + "vh");
    			add_location(main, file$8, 107, 0, 2486);
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
    				listen_dev(div0, "dragstart", /*drag*/ ctx[12], false, false, false),
    				listen_dev(div4, "dragstart", /*dragstart_handler*/ ctx[22], false, false, false),
    				listen_dev(div4, "dragend", /*clearDrag*/ ctx[11], false, false, false),
    				listen_dev(input0, "input", input0_input_handler),
    				listen_dev(input1, "input", input1_input_handler),
    				listen_dev(div11, "click", /*handleDelete*/ ctx[13], false, false, false)
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

    			if (dirty & /*zoom, dragState*/ 640 && svg0_style_value !== (svg0_style_value = "\r\n                            width: " + 2 * /*zoom*/ ctx[7] + "vh;\r\n                            height: " + 2 * /*zoom*/ ctx[7] + "vh;\r\n                            " + (/*dragState*/ ctx[9] === 0
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
    				set_style(input0, "color", /*nodeData*/ ctx[0].color);
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
    				set_style(input1, "color", /*nodeData*/ ctx[0].color);
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
    		id: create_fragment$8.name,
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

    function instance$8($$self, $$props, $$invalidate) {
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
    		$$invalidate(9, dragState = index);
    	}

    	function clearDrag() {
    		$$invalidate(9, dragState = null);
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

    		$$invalidate(14, context[outputID] = simObject, context);
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
    		"outputID"
    	];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<InputNode> was created with unknown prop '${key}'`);
    	});

    	const dragstart_handler = event => initConnectionDrag(event, outputID, 0);

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
    		if ("context" in $$props) $$invalidate(14, context = $$props.context);
    		if ("tableData" in $$props) $$invalidate(15, tableData = $$props.tableData);
    		if ("connectionCallback" in $$props) $$invalidate(16, connectionCallback = $$props.connectionCallback);
    		if ("onDrag" in $$props) $$invalidate(17, onDrag = $$props.onDrag);
    		if ("onDelete" in $$props) $$invalidate(18, onDelete = $$props.onDelete);
    		if ("outputID" in $$props) $$invalidate(8, outputID = $$props.outputID);
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
    		if ("context" in $$props) $$invalidate(14, context = $$props.context);
    		if ("tableData" in $$props) $$invalidate(15, tableData = $$props.tableData);
    		if ("dragState" in $$props) $$invalidate(9, dragState = $$props.dragState);
    		if ("connectionCallback" in $$props) $$invalidate(16, connectionCallback = $$props.connectionCallback);
    		if ("onDrag" in $$props) $$invalidate(17, onDrag = $$props.onDrag);
    		if ("onDelete" in $$props) $$invalidate(18, onDelete = $$props.onDelete);
    		if ("outputID" in $$props) $$invalidate(8, outputID = $$props.outputID);
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
    		dragstart_handler,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class InputNode extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			posX: 1,
    			posY: 2,
    			offX: 3,
    			offY: 4,
    			simX: 5,
    			simY: 6,
    			zoom: 7,
    			nodeData: 0,
    			context: 14,
    			tableData: 15,
    			connectionCallback: 16,
    			onDrag: 17,
    			onDelete: 18,
    			outputID: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputNode",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nodeData*/ ctx[0] === undefined && !("nodeData" in props)) {
    			console_1$1.warn("<InputNode> was created without expected prop 'nodeData'");
    		}

    		if (/*context*/ ctx[14] === undefined && !("context" in props)) {
    			console_1$1.warn("<InputNode> was created without expected prop 'context'");
    		}

    		if (/*tableData*/ ctx[15] === undefined && !("tableData" in props)) {
    			console_1$1.warn("<InputNode> was created without expected prop 'tableData'");
    		}

    		if (/*connectionCallback*/ ctx[16] === undefined && !("connectionCallback" in props)) {
    			console_1$1.warn("<InputNode> was created without expected prop 'connectionCallback'");
    		}

    		if (/*onDrag*/ ctx[17] === undefined && !("onDrag" in props)) {
    			console_1$1.warn("<InputNode> was created without expected prop 'onDrag'");
    		}

    		if (/*onDelete*/ ctx[18] === undefined && !("onDelete" in props)) {
    			console_1$1.warn("<InputNode> was created without expected prop 'onDelete'");
    		}

    		if (/*outputID*/ ctx[8] === undefined && !("outputID" in props)) {
    			console_1$1.warn("<InputNode> was created without expected prop 'outputID'");
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

    	get outputID() {
    		throw new Error("<InputNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outputID(value) {
    		throw new Error("<InputNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\NodeEditor\OutputNode.svelte generated by Svelte v3.19.1 */

    const { console: console_1$2 } = globals;
    const file$9 = "src\\NodeEditor\\OutputNode.svelte";

    function create_fragment$9(ctx) {
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
    		/*input0_input_handler*/ ctx[23].call(input0);
    	}

    	function input1_input_handler() {
    		input1_updating = true;
    		/*input1_input_handler*/ ctx[24].call(input1);
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text("Output");
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
    			attr_dev(h1, "class", "svelte-z7fwe5");
    			add_location(h1, file$9, 130, 8, 3132);
    			attr_dev(div0, "class", "titleBar svelte-z7fwe5");
    			attr_dev(div0, "draggable", "true");
    			set_style(div0, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			set_style(div0, "background-color", /*nodeData*/ ctx[0].color);
    			add_location(div0, file$9, 120, 4, 2920);
    			attr_dev(rect0, "x", "2.5");
    			attr_dev(rect0, "y", "2.5");
    			attr_dev(rect0, "width", "10");
    			attr_dev(rect0, "height", "10");
    			attr_dev(rect0, "rx", "5");
    			attr_dev(rect0, "stroke", "#999999");
    			attr_dev(rect0, "stroke-dasharray", "2 2");
    			add_location(rect0, file$9, 149, 28, 3970);
    			attr_dev(rect1, "x", "5");
    			attr_dev(rect1, "y", "5");
    			attr_dev(rect1, "width", "5");
    			attr_dev(rect1, "height", "5");
    			attr_dev(rect1, "rx", "2.5");
    			attr_dev(rect1, "fill", rect1_fill_value = /*nodeData*/ ctx[0].color);
    			add_location(rect1, file$9, 150, 28, 4093);
    			set_style(svg0, "width", 2 * /*zoom*/ ctx[7] + "vh");
    			set_style(svg0, "height", 2 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(svg0, "viewBox", "0 0 15 15");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file$9, 148, 24, 3821);
    			set_style(div1, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div1, "class", "inputTetherCircleContainer svelte-z7fwe5");
    			add_location(div1, file$9, 147, 20, 3728);
    			set_style(p, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(p, "color", /*nodeData*/ ctx[0].color);
    			attr_dev(p, "class", "svelte-z7fwe5");
    			add_location(p, file$9, 154, 24, 4313);
    			attr_dev(div2, "class", "inputTetherLabelContainer svelte-z7fwe5");
    			add_location(div2, file$9, 153, 20, 4248);
    			set_style(div3, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div3, "class", "inputTether svelte-z7fwe5");
    			add_location(div3, file$9, 140, 16, 3457);
    			set_style(div4, "padding-top", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div4, "class", "inputs svelte-z7fwe5");
    			add_location(div4, file$9, 139, 12, 3385);
    			set_style(div5, "padding-top", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(div5, "class", "outputs svelte-z7fwe5");
    			add_location(div5, file$9, 163, 12, 4561);
    			attr_dev(div6, "class", "tetherContainer svelte-z7fwe5");
    			set_style(div6, "height", 4 * /*zoom*/ ctx[7] + "vh");
    			add_location(div6, file$9, 136, 8, 3290);
    			set_style(h20, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(h20, "margin-left", /*zoom*/ ctx[7] + "vh");
    			set_style(h20, "margin-right", 0.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(h20, "color", /*nodeData*/ ctx[0].color);
    			add_location(h20, file$9, 172, 16, 4778);
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "name", "col");
    			attr_dev(input0, "min", "0");
    			set_style(input0, "width", 4 * /*zoom*/ ctx[7] + "vh");
    			set_style(input0, "height", 1.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(input0, "margin-right", /*zoom*/ ctx[7] + "vh");
    			set_style(input0, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(input0, "color", /*nodeData*/ ctx[0].color);
    			set_style(input0, "border-radius", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(input0, "class", "svelte-z7fwe5");
    			add_location(input0, file$9, 178, 16, 5018);
    			attr_dev(div7, "class", "setting svelte-z7fwe5");
    			add_location(div7, file$9, 171, 12, 4739);
    			set_style(h21, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(h21, "margin-left", /*zoom*/ ctx[7] + "vh");
    			set_style(h21, "margin-right", 0.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(h21, "color", /*nodeData*/ ctx[0].color);
    			add_location(h21, file$9, 188, 16, 5457);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "name", "row");
    			attr_dev(input1, "min", "0");
    			set_style(input1, "width", 4 * /*zoom*/ ctx[7] + "vh");
    			set_style(input1, "height", 1.5 * /*zoom*/ ctx[7] + "vh");
    			set_style(input1, "margin-right", /*zoom*/ ctx[7] + "vh");
    			set_style(input1, "font-size", /*zoom*/ ctx[7] + "vh");
    			set_style(input1, "color", /*nodeData*/ ctx[0].color);
    			set_style(input1, "border-radius", 0.5 * /*zoom*/ ctx[7] + "vh");
    			attr_dev(input1, "class", "svelte-z7fwe5");
    			add_location(input1, file$9, 194, 16, 5694);
    			attr_dev(div8, "class", "setting svelte-z7fwe5");
    			add_location(div8, file$9, 187, 12, 5418);
    			attr_dev(div9, "class", "settingsContainer svelte-z7fwe5");
    			add_location(div9, file$9, 170, 8, 4694);
    			attr_dev(div10, "class", "contents svelte-z7fwe5");
    			add_location(div10, file$9, 135, 4, 3258);
    			attr_dev(path_1, "d", "M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z");
    			add_location(path_1, file$9, 218, 238, 6559);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 448 512");
    			attr_dev(svg1, "class", "svelte-z7fwe5");
    			add_location(svg1, file$9, 218, 8, 6329);
    			attr_dev(div11, "class", "deleteAction svelte-z7fwe5");
    			set_style(div11, "width", 3 * /*zoom*/ ctx[7] + "vh");
    			set_style(div11, "height", 3 * /*zoom*/ ctx[7] + "vh");
    			add_location(div11, file$9, 209, 4, 6142);
    			attr_dev(main, "class", "neuOutdentShadowRim svelte-z7fwe5");
    			set_style(main, "left", ((/*posX*/ ctx[1] + /*simX*/ ctx[5]) * /*zoom*/ ctx[7] + /*offX*/ ctx[3]) * 2 + "vh");
    			set_style(main, "top", ((/*posY*/ ctx[2] + /*simY*/ ctx[6]) * /*zoom*/ ctx[7] + /*offY*/ ctx[4]) * 2 + "vh");
    			set_style(main, "width", 2 * /*nodeData*/ ctx[0].width * /*zoom*/ ctx[7] + "vh");
    			set_style(main, "height", /*zoom*/ ctx[7] * 12 + "vh");
    			set_style(main, "border-radius", /*zoom*/ ctx[7] + "vh");
    			add_location(main, file$9, 111, 0, 2665);
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
    				listen_dev(div0, "dragstart", /*drag*/ ctx[9], false, false, false),
    				listen_dev(div3, "dragover", dragOver$2, false, false, false),
    				listen_dev(div3, "drop", /*drop_handler*/ ctx[22], false, false, false),
    				listen_dev(input0, "input", input0_input_handler),
    				listen_dev(input1, "input", input1_input_handler),
    				listen_dev(div11, "click", /*handleDelete*/ ctx[10], false, false, false)
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
    				set_style(input0, "color", /*nodeData*/ ctx[0].color);
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
    				set_style(input1, "color", /*nodeData*/ ctx[0].color);
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function dragOver$2(event) {
    	event.preventDefault();
    	event.stopPropagation();
    }

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
    				let outputId = event.dataTransfer.getData("outputID");
    				$$invalidate(0, nodeData.input = outputId, nodeData);
    				connectionCallback(nodeData, outputId, index);
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
    		delete context[outputID];
    		onDelete();
    	}

    	// THIS IS SPECIFIC FOR INPUT NODES
    	// As they only have one output tether the class can be simulated
    	/* export let outputID;
    onMount(() => {

        console.log("Input Node mounted with tether ID " + outputID);

        let simObject = {
            "process": process,
            "superNode": {
                "rawNodeData": Object.assign(nodeData, {"outputs": [outputID]}),
            },
        }

        context[outputID] = simObject;

        console.log(context[outputID]);
    }); */
    	async function process() {
    		context[nodeData.input].process().then(value => {
    			$$invalidate(11, tableData.cellContents[nodeData.selectedCol][nodeData.selectedRow] = value, tableData);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<OutputNode> was created with unknown prop '${key}'`);
    	});

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
    		if ("context" in $$props) $$invalidate(12, context = $$props.context);
    		if ("tableRef" in $$props) $$invalidate(13, tableRef = $$props.tableRef);
    		if ("tableData" in $$props) $$invalidate(11, tableData = $$props.tableData);
    		if ("connectionCallback" in $$props) $$invalidate(14, connectionCallback = $$props.connectionCallback);
    		if ("onDrag" in $$props) $$invalidate(15, onDrag = $$props.onDrag);
    		if ("onDelete" in $$props) $$invalidate(16, onDelete = $$props.onDelete);
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
    		if ("context" in $$props) $$invalidate(12, context = $$props.context);
    		if ("tableRef" in $$props) $$invalidate(13, tableRef = $$props.tableRef);
    		if ("tableData" in $$props) $$invalidate(11, tableData = $$props.tableData);
    		if ("dragState" in $$props) dragState = $$props.dragState;
    		if ("connectionCallback" in $$props) $$invalidate(14, connectionCallback = $$props.connectionCallback);
    		if ("onDrag" in $$props) $$invalidate(15, onDrag = $$props.onDrag);
    		if ("onDelete" in $$props) $$invalidate(16, onDelete = $$props.onDelete);
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
    		handleConnect,
    		drag,
    		handleDelete,
    		tableData,
    		context,
    		tableRef,
    		connectionCallback,
    		onDrag,
    		onDelete,
    		dragState,
    		path,
    		initConnectionDrag,
    		clearDrag,
    		process,
    		drop_handler,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class OutputNode extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			posX: 1,
    			posY: 2,
    			offX: 3,
    			offY: 4,
    			simX: 5,
    			simY: 6,
    			zoom: 7,
    			nodeData: 0,
    			context: 12,
    			tableRef: 13,
    			tableData: 11,
    			connectionCallback: 14,
    			onDrag: 15,
    			onDelete: 16
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OutputNode",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nodeData*/ ctx[0] === undefined && !("nodeData" in props)) {
    			console_1$2.warn("<OutputNode> was created without expected prop 'nodeData'");
    		}

    		if (/*context*/ ctx[12] === undefined && !("context" in props)) {
    			console_1$2.warn("<OutputNode> was created without expected prop 'context'");
    		}

    		if (/*tableRef*/ ctx[13] === undefined && !("tableRef" in props)) {
    			console_1$2.warn("<OutputNode> was created without expected prop 'tableRef'");
    		}

    		if (/*tableData*/ ctx[11] === undefined && !("tableData" in props)) {
    			console_1$2.warn("<OutputNode> was created without expected prop 'tableData'");
    		}

    		if (/*connectionCallback*/ ctx[14] === undefined && !("connectionCallback" in props)) {
    			console_1$2.warn("<OutputNode> was created without expected prop 'connectionCallback'");
    		}

    		if (/*onDrag*/ ctx[15] === undefined && !("onDrag" in props)) {
    			console_1$2.warn("<OutputNode> was created without expected prop 'onDrag'");
    		}

    		if (/*onDelete*/ ctx[16] === undefined && !("onDelete" in props)) {
    			console_1$2.warn("<OutputNode> was created without expected prop 'onDelete'");
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
    }

    /* src\NodeEditor\NodePickerSlot.svelte generated by Svelte v3.19.1 */

    const file$a = "src\\NodeEditor\\NodePickerSlot.svelte";

    function create_fragment$a(ctx) {
    	let main;
    	let p;
    	let t;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			p = element("p");
    			t = text(/*id*/ ctx[0]);
    			attr_dev(p, "class", "svelte-p1trme");
    			add_location(p, file$a, 18, 4, 409);
    			attr_dev(main, "draggable", "true");
    			set_style(main, "background-color", /*color*/ ctx[1]);
    			attr_dev(main, "class", "svelte-p1trme");
    			add_location(main, file$a, 15, 0, 311);
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
    			if (dirty & /*id*/ 1) set_data_dev(t, /*id*/ ctx[0]);

    			if (dirty & /*color*/ 2) {
    				set_style(main, "background-color", /*color*/ ctx[1]);
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
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

    	$$self.$capture_state = () => ({ id, type, color, initDrag });

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
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { id: 0, type: 3, color: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NodePickerSlot",
    			options,
    			id: create_fragment$a.name
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

    /* src\NodeEditor\NodeEditor.svelte generated by Svelte v3.19.1 */

    const { Object: Object_1$3, console: console_1$3 } = globals;
    const file$b = "src\\NodeEditor\\NodeEditor.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[35] = list[i];
    	child_ctx[37] = i;
    	return child_ctx;
    }

    function get_each_context_1$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[38] = list[i];
    	child_ctx[37] = i;
    	return child_ctx;
    }

    function get_each_context_2$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[38] = list[i];
    	child_ctx[37] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[38] = list[i];
    	child_ctx[41] = list;
    	child_ctx[37] = i;
    	return child_ctx;
    }

    // (384:8) {#each nodeData.operator as node, index}
    function create_each_block_3(ctx) {
    	let updating_nodeObject;
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[27](/*index*/ ctx[37], ...args);
    	}

    	function func_1(...args) {
    		return /*func_1*/ ctx[28](/*index*/ ctx[37], ...args);
    	}

    	function node_nodeObject_binding(value) {
    		/*node_nodeObject_binding*/ ctx[29].call(null, value, /*node*/ ctx[38]);
    	}

    	let node_props = {
    		onDrag: func,
    		onDelete: func_1,
    		posX: /*node*/ ctx[38].posX,
    		posY: /*node*/ ctx[38].posY,
    		offX: (/*viewX*/ ctx[3] + /*mouseDrag*/ ctx[9].delta.x) / window.innerHeight * 50,
    		offY: (/*viewY*/ ctx[4] + /*mouseDrag*/ ctx[9].delta.y) / window.innerHeight * 50,
    		simX: /*node*/ ctx[38].simX,
    		simY: /*node*/ ctx[38].simY,
    		zoom: /*viewZoom*/ ctx[5],
    		nodeData: /*node*/ ctx[38],
    		context: /*context*/ ctx[8],
    		connectionCallback: /*addConnection*/ ctx[18]
    	};

    	if (/*node*/ ctx[38].reference !== void 0) {
    		node_props.nodeObject = /*node*/ ctx[38].reference;
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
    			if (dirty[0] & /*nodeData*/ 1) node_changes.posX = /*node*/ ctx[38].posX;
    			if (dirty[0] & /*nodeData*/ 1) node_changes.posY = /*node*/ ctx[38].posY;
    			if (dirty[0] & /*viewX, mouseDrag*/ 520) node_changes.offX = (/*viewX*/ ctx[3] + /*mouseDrag*/ ctx[9].delta.x) / window.innerHeight * 50;
    			if (dirty[0] & /*viewY, mouseDrag*/ 528) node_changes.offY = (/*viewY*/ ctx[4] + /*mouseDrag*/ ctx[9].delta.y) / window.innerHeight * 50;
    			if (dirty[0] & /*nodeData*/ 1) node_changes.simX = /*node*/ ctx[38].simX;
    			if (dirty[0] & /*nodeData*/ 1) node_changes.simY = /*node*/ ctx[38].simY;
    			if (dirty[0] & /*viewZoom*/ 32) node_changes.zoom = /*viewZoom*/ ctx[5];
    			if (dirty[0] & /*nodeData*/ 1) node_changes.nodeData = /*node*/ ctx[38];
    			if (dirty[0] & /*context*/ 256) node_changes.context = /*context*/ ctx[8];

    			if (!updating_nodeObject && dirty[0] & /*nodeData*/ 1) {
    				updating_nodeObject = true;
    				node_changes.nodeObject = /*node*/ ctx[38].reference;
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
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(384:8) {#each nodeData.operator as node, index}",
    		ctx
    	});

    	return block;
    }

    // (406:8) {#each nodeData.input as node, index}
    function create_each_block_2$2(ctx) {
    	let current;

    	function func_2(...args) {
    		return /*func_2*/ ctx[30](/*index*/ ctx[37], ...args);
    	}

    	function func_3(...args) {
    		return /*func_3*/ ctx[31](/*index*/ ctx[37], ...args);
    	}

    	const inputnode = new InputNode({
    			props: {
    				onDrag: func_2,
    				onDelete: func_3,
    				posX: /*node*/ ctx[38].posX,
    				posY: /*node*/ ctx[38].posY,
    				offX: (/*viewX*/ ctx[3] + /*mouseDrag*/ ctx[9].delta.x) / window.innerHeight * 50,
    				offY: (/*viewY*/ ctx[4] + /*mouseDrag*/ ctx[9].delta.y) / window.innerHeight * 50,
    				simX: /*node*/ ctx[38].simX,
    				simY: /*node*/ ctx[38].simY,
    				zoom: /*viewZoom*/ ctx[5],
    				outputID: /*node*/ ctx[38].outputID,
    				nodeData: /*node*/ ctx[38],
    				context: /*context*/ ctx[8],
    				tableRef: /*tableRef*/ ctx[1],
    				tableData: /*tableData*/ ctx[2],
    				connectionCallback: /*addConnection*/ ctx[18]
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
    			if (dirty[0] & /*nodeData*/ 1) inputnode_changes.posX = /*node*/ ctx[38].posX;
    			if (dirty[0] & /*nodeData*/ 1) inputnode_changes.posY = /*node*/ ctx[38].posY;
    			if (dirty[0] & /*viewX, mouseDrag*/ 520) inputnode_changes.offX = (/*viewX*/ ctx[3] + /*mouseDrag*/ ctx[9].delta.x) / window.innerHeight * 50;
    			if (dirty[0] & /*viewY, mouseDrag*/ 528) inputnode_changes.offY = (/*viewY*/ ctx[4] + /*mouseDrag*/ ctx[9].delta.y) / window.innerHeight * 50;
    			if (dirty[0] & /*nodeData*/ 1) inputnode_changes.simX = /*node*/ ctx[38].simX;
    			if (dirty[0] & /*nodeData*/ 1) inputnode_changes.simY = /*node*/ ctx[38].simY;
    			if (dirty[0] & /*viewZoom*/ 32) inputnode_changes.zoom = /*viewZoom*/ ctx[5];
    			if (dirty[0] & /*nodeData*/ 1) inputnode_changes.outputID = /*node*/ ctx[38].outputID;
    			if (dirty[0] & /*nodeData*/ 1) inputnode_changes.nodeData = /*node*/ ctx[38];
    			if (dirty[0] & /*context*/ 256) inputnode_changes.context = /*context*/ ctx[8];
    			if (dirty[0] & /*tableRef*/ 2) inputnode_changes.tableRef = /*tableRef*/ ctx[1];
    			if (dirty[0] & /*tableData*/ 4) inputnode_changes.tableData = /*tableData*/ ctx[2];
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
    		id: create_each_block_2$2.name,
    		type: "each",
    		source: "(406:8) {#each nodeData.input as node, index}",
    		ctx
    	});

    	return block;
    }

    // (431:8) {#each nodeData.output as node, index}
    function create_each_block_1$4(ctx) {
    	let current;

    	function func_4(...args) {
    		return /*func_4*/ ctx[32](/*index*/ ctx[37], ...args);
    	}

    	function func_5(...args) {
    		return /*func_5*/ ctx[33](/*index*/ ctx[37], ...args);
    	}

    	const outputnode = new OutputNode({
    			props: {
    				onDrag: func_4,
    				onDelete: func_5,
    				posX: /*node*/ ctx[38].posX,
    				posY: /*node*/ ctx[38].posY,
    				offX: (/*viewX*/ ctx[3] + /*mouseDrag*/ ctx[9].delta.x) / window.innerHeight * 50,
    				offY: (/*viewY*/ ctx[4] + /*mouseDrag*/ ctx[9].delta.y) / window.innerHeight * 50,
    				simX: /*node*/ ctx[38].simX,
    				simY: /*node*/ ctx[38].simY,
    				zoom: /*viewZoom*/ ctx[5],
    				nodeData: /*node*/ ctx[38],
    				context: /*context*/ ctx[8],
    				tableData: /*tableData*/ ctx[2],
    				connectionCallback: /*addConnection*/ ctx[18]
    			},
    			$$inline: true
    		});

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
    			if (dirty[0] & /*nodeData*/ 1) outputnode_changes.posX = /*node*/ ctx[38].posX;
    			if (dirty[0] & /*nodeData*/ 1) outputnode_changes.posY = /*node*/ ctx[38].posY;
    			if (dirty[0] & /*viewX, mouseDrag*/ 520) outputnode_changes.offX = (/*viewX*/ ctx[3] + /*mouseDrag*/ ctx[9].delta.x) / window.innerHeight * 50;
    			if (dirty[0] & /*viewY, mouseDrag*/ 528) outputnode_changes.offY = (/*viewY*/ ctx[4] + /*mouseDrag*/ ctx[9].delta.y) / window.innerHeight * 50;
    			if (dirty[0] & /*nodeData*/ 1) outputnode_changes.simX = /*node*/ ctx[38].simX;
    			if (dirty[0] & /*nodeData*/ 1) outputnode_changes.simY = /*node*/ ctx[38].simY;
    			if (dirty[0] & /*viewZoom*/ 32) outputnode_changes.zoom = /*viewZoom*/ ctx[5];
    			if (dirty[0] & /*nodeData*/ 1) outputnode_changes.nodeData = /*node*/ ctx[38];
    			if (dirty[0] & /*context*/ 256) outputnode_changes.context = /*context*/ ctx[8];
    			if (dirty[0] & /*tableData*/ 4) outputnode_changes.tableData = /*tableData*/ ctx[2];
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
    		id: create_each_block_1$4.name,
    		type: "each",
    		source: "(431:8) {#each nodeData.output as node, index}",
    		ctx
    	});

    	return block;
    }

    // (453:8) {#each connections as c, index}
    function create_each_block$4(ctx) {
    	let div;
    	let svg;
    	let path_1;
    	let path_1_stroke_value;
    	let path_1_stroke_width_value;
    	let defs;
    	let linearGradient;
    	let stop0;
    	let stop0_stop_color_value;
    	let stop1;
    	let stop1_stop_color_value;
    	let linearGradient_id_value;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path_1 = svg_element("path");
    			defs = svg_element("defs");
    			linearGradient = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			t = space();
    			attr_dev(path_1, "d", "M0 1C47.3934 1 52.6066 101 100 101");
    			attr_dev(path_1, "stroke", path_1_stroke_value = "url(#paint0_linear_102_1243_" + /*index*/ ctx[37] + ")");
    			attr_dev(path_1, "stroke-width", path_1_stroke_width_value = 2 * /*viewZoom*/ ctx[5]);
    			attr_dev(path_1, "class", "svelte-51n9tr");
    			add_location(path_1, file$b, 469, 24, 16707);
    			attr_dev(stop0, "stop-color", stop0_stop_color_value = /*c*/ ctx[35].destColor);
    			add_location(stop0, file$b, 472, 28, 17042);
    			attr_dev(stop1, "offset", "1");
    			attr_dev(stop1, "stop-color", stop1_stop_color_value = /*c*/ ctx[35].originColor);
    			add_location(stop1, file$b, 473, 28, 17106);
    			attr_dev(linearGradient, "id", linearGradient_id_value = "paint0_linear_102_1243_" + /*index*/ ctx[37]);
    			attr_dev(linearGradient, "x1", "0");
    			attr_dev(linearGradient, "y1", "1");
    			attr_dev(linearGradient, "x2", "103.056");
    			attr_dev(linearGradient, "y2", "4.25514");
    			attr_dev(linearGradient, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient, file$b, 471, 28, 16889);
    			add_location(defs, file$b, 470, 24, 16853);
    			set_style(svg, "width", "100%");
    			set_style(svg, "height", "calc(100% + " + /*viewZoom*/ ctx[5] + "px)");
    			set_style(svg, "transform", "translateY(-" + 0.5 * /*viewZoom*/ ctx[5] + "px)");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			attr_dev(svg, "viewBox", "0 0 100 102");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "svelte-51n9tr");
    			add_location(svg, file$b, 465, 20, 16408);
    			set_style(div, "left", 2 * (/*c*/ ctx[35].posX * /*viewZoom*/ ctx[5] + (/*viewX*/ ctx[3] + /*mouseDrag*/ ctx[9].delta.x) / window.innerHeight * 50) + "vh");
    			set_style(div, "top", 2 * (/*c*/ ctx[35].posY * /*viewZoom*/ ctx[5] + (/*viewY*/ ctx[4] + /*mouseDrag*/ ctx[9].delta.y) / window.innerHeight * 50) + "vh");
    			set_style(div, "width", Math.abs(/*c*/ ctx[35].width) * /*viewZoom*/ ctx[5] * 2 + "vh");
    			set_style(div, "height", Math.abs(/*c*/ ctx[35].height) * /*viewZoom*/ ctx[5] * 2 + "vh");
    			set_style(div, "transform", "translate(" + (/*c*/ ctx[35].posX > /*c*/ ctx[35].destX ? "-100%" : "0") + ",\r\n                        " + (/*c*/ ctx[35].posY > /*c*/ ctx[35].destY ? "-100%" : "0") + ") scale(1,  " + (/*c*/ ctx[35].destY > /*c*/ ctx[35].posY ? "-" : "") + "1)");
    			attr_dev(div, "class", "inputFlowContainer svelte-51n9tr");
    			add_location(div, file$b, 453, 16, 15763);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path_1);
    			append_dev(svg, defs);
    			append_dev(defs, linearGradient);
    			append_dev(linearGradient, stop0);
    			append_dev(linearGradient, stop1);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*viewZoom*/ 32 && path_1_stroke_width_value !== (path_1_stroke_width_value = 2 * /*viewZoom*/ ctx[5])) {
    				attr_dev(path_1, "stroke-width", path_1_stroke_width_value);
    			}

    			if (dirty[0] & /*connections*/ 1024 && stop0_stop_color_value !== (stop0_stop_color_value = /*c*/ ctx[35].destColor)) {
    				attr_dev(stop0, "stop-color", stop0_stop_color_value);
    			}

    			if (dirty[0] & /*connections*/ 1024 && stop1_stop_color_value !== (stop1_stop_color_value = /*c*/ ctx[35].originColor)) {
    				attr_dev(stop1, "stop-color", stop1_stop_color_value);
    			}

    			if (dirty[0] & /*viewZoom*/ 32) {
    				set_style(svg, "height", "calc(100% + " + /*viewZoom*/ ctx[5] + "px)");
    			}

    			if (dirty[0] & /*viewZoom*/ 32) {
    				set_style(svg, "transform", "translateY(-" + 0.5 * /*viewZoom*/ ctx[5] + "px)");
    			}

    			if (dirty[0] & /*connections, viewZoom, viewX, mouseDrag*/ 1576) {
    				set_style(div, "left", 2 * (/*c*/ ctx[35].posX * /*viewZoom*/ ctx[5] + (/*viewX*/ ctx[3] + /*mouseDrag*/ ctx[9].delta.x) / window.innerHeight * 50) + "vh");
    			}

    			if (dirty[0] & /*connections, viewZoom, viewY, mouseDrag*/ 1584) {
    				set_style(div, "top", 2 * (/*c*/ ctx[35].posY * /*viewZoom*/ ctx[5] + (/*viewY*/ ctx[4] + /*mouseDrag*/ ctx[9].delta.y) / window.innerHeight * 50) + "vh");
    			}

    			if (dirty[0] & /*connections, viewZoom*/ 1056) {
    				set_style(div, "width", Math.abs(/*c*/ ctx[35].width) * /*viewZoom*/ ctx[5] * 2 + "vh");
    			}

    			if (dirty[0] & /*connections, viewZoom*/ 1056) {
    				set_style(div, "height", Math.abs(/*c*/ ctx[35].height) * /*viewZoom*/ ctx[5] * 2 + "vh");
    			}

    			if (dirty[0] & /*connections*/ 1024) {
    				set_style(div, "transform", "translate(" + (/*c*/ ctx[35].posX > /*c*/ ctx[35].destX ? "-100%" : "0") + ",\r\n                        " + (/*c*/ ctx[35].posY > /*c*/ ctx[35].destY ? "-100%" : "0") + ") scale(1,  " + (/*c*/ ctx[35].destY > /*c*/ ctx[35].posY ? "-" : "") + "1)");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(453:8) {#each connections as c, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let main;
    	let div7;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let div6;
    	let div3;
    	let div1;
    	let svg;
    	let path_1;
    	let t4;
    	let div2;
    	let h20;
    	let t6;
    	let div5;
    	let t7;
    	let t8;
    	let div4;
    	let h21;
    	let t10;
    	let div7_resize_listener;
    	let current;
    	let dispose;
    	let each_value_3 = /*nodeData*/ ctx[0].operator;
    	validate_each_argument(each_value_3);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_3[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const out = i => transition_out(each_blocks_3[i], 1, 1, () => {
    		each_blocks_3[i] = null;
    	});

    	let each_value_2 = /*nodeData*/ ctx[0].input;
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2$2(get_each_context_2$2(ctx, each_value_2, i));
    	}

    	const out_1 = i => transition_out(each_blocks_2[i], 1, 1, () => {
    		each_blocks_2[i] = null;
    	});

    	let each_value_1 = /*nodeData*/ ctx[0].output;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$4(get_each_context_1$4(ctx, each_value_1, i));
    	}

    	const out_2 = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*connections*/ ctx[10];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const nodepickerslot0 = new NodePickerSlot({
    			props: {
    				id: "Input",
    				type: "input",
    				color: "var(--red)"
    			},
    			$$inline: true
    		});

    	const nodepickerslot1 = new NodePickerSlot({
    			props: {
    				id: "Output",
    				type: "output",
    				color: "var(--blue)"
    			},
    			$$inline: true
    		});

    	const nodepickerslot2 = new NodePickerSlot({
    			props: {
    				id: "Sum",
    				type: "operator",
    				color: "var(--orange)"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div7 = element("div");
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
    			div6 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			svg = svg_element("svg");
    			path_1 = svg_element("path");
    			t4 = space();
    			div2 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Node Picker";
    			t6 = space();
    			div5 = element("div");
    			create_component(nodepickerslot0.$$.fragment);
    			t7 = space();
    			create_component(nodepickerslot1.$$.fragment);
    			t8 = space();
    			div4 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Math - Basic";
    			t10 = space();
    			create_component(nodepickerslot2.$$.fragment);
    			attr_dev(div0, "class", "crossBackground svelte-51n9tr");
    			set_style(div0, "background-position-x", /*viewX*/ ctx[3] + /*mouseDrag*/ ctx[9].delta.x + "px");
    			set_style(div0, "background-position-y", /*viewY*/ ctx[4] + /*mouseDrag*/ ctx[9].delta.y + "px");
    			set_style(div0, "background-size", 2 * /*viewZoom*/ ctx[5] + "vh");
    			add_location(div0, file$b, 377, 8, 13162);
    			attr_dev(path_1, "d", "M7.724 65.49C13.36 55.11 21.79 46.47 32 40.56C39.63 36.15 48.25 33.26 57.46 32.33C59.61 32.11 61.79 32 64 32H448C483.3 32 512 60.65 512 96V416C512 451.3 483.3 480 448 480H64C28.65 480 0 451.3 0 416V96C0 93.79 .112 91.61 .3306 89.46C1.204 80.85 3.784 72.75 7.724 65.49V65.49zM48 416C48 424.8 55.16 432 64 432H448C456.8 432 464 424.8 464 416V224H48V416z");
    			attr_dev(path_1, "class", "svelte-51n9tr");
    			add_location(path_1, file$b, 485, 246, 17704);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			attr_dev(svg, "class", "svelte-51n9tr");
    			add_location(svg, file$b, 485, 16, 17474);
    			attr_dev(div1, "class", "nodePickerIcon svelte-51n9tr");
    			add_location(div1, file$b, 484, 12, 17428);
    			attr_dev(h20, "class", "svelte-51n9tr");
    			add_location(h20, file$b, 488, 16, 18166);
    			attr_dev(div2, "class", "nodePickerTitle svelte-51n9tr");
    			add_location(div2, file$b, 487, 12, 18119);
    			attr_dev(div3, "class", "nodePickerHeader svelte-51n9tr");
    			add_location(div3, file$b, 483, 8, 17384);
    			attr_dev(h21, "class", "svelte-51n9tr");
    			add_location(h21, file$b, 505, 16, 18615);
    			attr_dev(div4, "class", "nodePickerGroupTitle svelte-51n9tr");
    			add_location(div4, file$b, 504, 12, 18563);
    			attr_dev(div5, "class", "nodePickerContents svelte-51n9tr");
    			add_location(div5, file$b, 491, 8, 18232);
    			attr_dev(div6, "class", "nodePickerFrame neuOutdentShadow svelte-51n9tr");
    			add_location(div6, file$b, 482, 4, 17328);
    			attr_dev(div7, "class", "frame neuIndentShadow svelte-51n9tr");
    			add_render_callback(() => /*div7_elementresize_handler*/ ctx[34].call(div7));
    			add_location(div7, file$b, 364, 4, 12788);
    			attr_dev(main, "class", "svelte-51n9tr");
    			add_location(main, file$b, 363, 0, 12776);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div7);
    			append_dev(div7, div0);

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

    			append_dev(div7, t3);
    			append_dev(div7, div6);
    			append_dev(div6, div3);
    			append_dev(div3, div1);
    			append_dev(div1, svg);
    			append_dev(svg, path_1);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, h20);
    			append_dev(div6, t6);
    			append_dev(div6, div5);
    			mount_component(nodepickerslot0, div5, null);
    			append_dev(div5, t7);
    			mount_component(nodepickerslot1, div5, null);
    			append_dev(div5, t8);
    			append_dev(div5, div4);
    			append_dev(div4, h21);
    			append_dev(div5, t10);
    			mount_component(nodepickerslot2, div5, null);
    			div7_resize_listener = add_resize_listener(div7, /*div7_elementresize_handler*/ ctx[34].bind(div7));
    			current = true;

    			dispose = [
    				listen_dev(div7, "mousedown", /*mouseDown*/ ctx[11], false, false, false),
    				listen_dev(div7, "mousemove", /*mouseMove*/ ctx[12], false, false, false),
    				listen_dev(div7, "mouseup", /*mouseUp*/ ctx[13], false, false, false),
    				listen_dev(div7, "mouseleave", /*mouseUp*/ ctx[13], false, false, false),
    				listen_dev(div7, "mousewheel", /*scroll*/ ctx[14], false, false, false),
    				listen_dev(div7, "drop", /*drop*/ ctx[17], false, false, false),
    				listen_dev(div7, "dragover", /*dragOver*/ ctx[16], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*initNodeDrag, deleteNode, nodeData, viewX, mouseDrag, viewY, viewZoom, context, addConnection*/ 820025) {
    				each_value_3 = /*nodeData*/ ctx[0].operator;
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

    			if (dirty[0] & /*initNodeDrag, deleteNode, nodeData, viewX, mouseDrag, viewY, viewZoom, context, tableRef, tableData, addConnection*/ 820031) {
    				each_value_2 = /*nodeData*/ ctx[0].input;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    						transition_in(each_blocks_2[i], 1);
    					} else {
    						each_blocks_2[i] = create_each_block_2$2(child_ctx);
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

    			if (dirty[0] & /*initNodeDrag, deleteNode, nodeData, viewX, mouseDrag, viewY, viewZoom, context, tableData, addConnection*/ 820029) {
    				each_value_1 = /*nodeData*/ ctx[0].output;
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
    						each_blocks_1[i].m(div0, t2);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out_2(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*connections, viewZoom, viewX, mouseDrag, viewY*/ 1592) {
    				each_value = /*connections*/ ctx[10];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

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

    			transition_in(nodepickerslot0.$$.fragment, local);
    			transition_in(nodepickerslot1.$$.fragment, local);
    			transition_in(nodepickerslot2.$$.fragment, local);
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

    			transition_out(nodepickerslot0.$$.fragment, local);
    			transition_out(nodepickerslot1.$$.fragment, local);
    			transition_out(nodepickerslot2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks_3, detaching);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			destroy_component(nodepickerslot0);
    			destroy_component(nodepickerslot1);
    			destroy_component(nodepickerslot2);
    			div7_resize_listener.cancel();
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

    function makeid(length) {
    	var result = "";
    	var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    	var charactersLength = characters.length;

    	for (var i = 0; i < length; i++) {
    		result += characters.charAt(Math.floor(Math.random() * charactersLength));
    	}

    	return result;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	const path = require("path");
    	let viewX = 0, viewY = 0, viewZoom = 1;
    	const zoomBounds = [0.6, 3];
    	let viewportHeight, viewportWidth;
    	let { nodeData } = $$props;
    	let { tableRef } = $$props;
    	let { tableData } = $$props;
    	let context = {};

    	//#region mouse
    	let mouseDrag = {
    		"ongoing": false,
    		"start": { "x": 0, "y": 0 },
    		"delta": { "x": 0, "y": 0 }
    	};

    	function mouseDown(event) {
    		if (event.button != 1) return;
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
    		if (!mouseDrag.ongoing || event.button != 1) return;
    		$$invalidate(9, mouseDrag.ongoing = false, mouseDrag);
    		$$invalidate(3, viewX += mouseDrag.delta.x);
    		$$invalidate(4, viewY += mouseDrag.delta.y);
    		$$invalidate(9, mouseDrag.delta = { "x": 0, "y": 0 }, mouseDrag);
    	}

    	function scroll(event) {
    		let oldZoom = viewZoom;
    		$$invalidate(5, viewZoom -= event.deltaY / 1000);
    		$$invalidate(5, viewZoom = Math.max(zoomBounds[0], Math.min(viewZoom, zoomBounds[1])));
    		$$invalidate(3, viewX = (viewX - viewportWidth / 2) * viewZoom / oldZoom + viewportWidth / 2);
    		$$invalidate(4, viewY = (viewY - viewportHeight / 2) * viewZoom / oldZoom + viewportHeight / 2);
    	}

    	function getNewId() {
    		let newId;

    		do {
    			newId = makeid(4);
    		} while (context[newId] != undefined);

    		$$invalidate(8, context[newId] = "Pending...", context);
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
    								"color": "var(--blue)",
    								"selectedCol": 0,
    								"selectedRow": 0
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
    				recalculateConnections();
    				break;
    		}
    	}

    	// Generate Connection Display Objects
    	let connections = [];

    	onMount(() => {
    		console.log(nodeData);
    		recalculateConnections();
    		$$invalidate(10, connections = Object.assign([], connections));
    	});

    	function recalculateConnections() {
    		$$invalidate(10, connections = []);

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

    		$$invalidate(10, connections = Object.assign([], connections));
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
    				"destColor": destData.color
    			};

    			connections.push(newConnection);
    			console.log(newConnection, destData);
    			$$invalidate(10, connections = Object.assign([], connections));
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

    		$$invalidate(10, connections = Object.assign([], connections));
    	}

    	function deleteNode(type, index) {
    		nodeData[type].splice(index, 1);
    		$$invalidate(0, nodeData[type] = Object.assign([], nodeData[type]), nodeData);
    		recalculateConnections();
    	}

    	const writable_props = ["nodeData", "tableRef", "tableData"];

    	Object_1$3.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<NodeEditor> was created with unknown prop '${key}'`);
    	});

    	const func = (index, event) => initNodeDrag(event, "operator", index);

    	const func_1 = index => {
    		deleteNode("operator", index);
    	};

    	function node_nodeObject_binding(value, node) {
    		node.reference = value;
    		$$invalidate(0, nodeData);
    	}

    	const func_2 = (index, event) => initNodeDrag(event, "input", index);

    	const func_3 = index => {
    		deleteNode("input", index);
    	};

    	const func_4 = (index, event) => initNodeDrag(event, "output", index);

    	const func_5 = index => {
    		deleteNode("output", index);
    	};

    	function div7_elementresize_handler() {
    		viewportHeight = this.offsetHeight;
    		viewportWidth = this.offsetWidth;
    		$$invalidate(6, viewportHeight);
    		$$invalidate(7, viewportWidth);
    	}

    	$$self.$set = $$props => {
    		if ("nodeData" in $$props) $$invalidate(0, nodeData = $$props.nodeData);
    		if ("tableRef" in $$props) $$invalidate(1, tableRef = $$props.tableRef);
    		if ("tableData" in $$props) $$invalidate(2, tableData = $$props.tableData);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Node,
    		InputNode,
    		OutputNode,
    		NodePickerSlot,
    		path,
    		viewX,
    		viewY,
    		viewZoom,
    		zoomBounds,
    		viewportHeight,
    		viewportWidth,
    		nodeData,
    		tableRef,
    		tableData,
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
    		recalculateConnections,
    		addConnection,
    		mutateConnection,
    		deleteNode,
    		require,
    		Math,
    		undefined,
    		document,
    		window,
    		Object,
    		__dirname,
    		console,
    		newConnection,
    		destData
    	});

    	$$self.$inject_state = $$props => {
    		if ("viewX" in $$props) $$invalidate(3, viewX = $$props.viewX);
    		if ("viewY" in $$props) $$invalidate(4, viewY = $$props.viewY);
    		if ("viewZoom" in $$props) $$invalidate(5, viewZoom = $$props.viewZoom);
    		if ("viewportHeight" in $$props) $$invalidate(6, viewportHeight = $$props.viewportHeight);
    		if ("viewportWidth" in $$props) $$invalidate(7, viewportWidth = $$props.viewportWidth);
    		if ("nodeData" in $$props) $$invalidate(0, nodeData = $$props.nodeData);
    		if ("tableRef" in $$props) $$invalidate(1, tableRef = $$props.tableRef);
    		if ("tableData" in $$props) $$invalidate(2, tableData = $$props.tableData);
    		if ("context" in $$props) $$invalidate(8, context = $$props.context);
    		if ("mouseDrag" in $$props) $$invalidate(9, mouseDrag = $$props.mouseDrag);
    		if ("nodeDrag" in $$props) nodeDrag = $$props.nodeDrag;
    		if ("connections" in $$props) $$invalidate(10, connections = $$props.connections);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		nodeData,
    		tableRef,
    		tableData,
    		viewX,
    		viewY,
    		viewZoom,
    		viewportHeight,
    		viewportWidth,
    		context,
    		mouseDrag,
    		connections,
    		mouseDown,
    		mouseMove,
    		mouseUp,
    		scroll,
    		initNodeDrag,
    		dragOver,
    		drop,
    		addConnection,
    		deleteNode,
    		nodeDrag,
    		path,
    		zoomBounds,
    		getNewId,
    		clearNodeDrag,
    		recalculateConnections,
    		mutateConnection,
    		func,
    		func_1,
    		node_nodeObject_binding,
    		func_2,
    		func_3,
    		func_4,
    		func_5,
    		div7_elementresize_handler
    	];
    }

    class NodeEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { nodeData: 0, tableRef: 1, tableData: 2 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NodeEditor",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nodeData*/ ctx[0] === undefined && !("nodeData" in props)) {
    			console_1$3.warn("<NodeEditor> was created without expected prop 'nodeData'");
    		}

    		if (/*tableRef*/ ctx[1] === undefined && !("tableRef" in props)) {
    			console_1$3.warn("<NodeEditor> was created without expected prop 'tableRef'");
    		}

    		if (/*tableData*/ ctx[2] === undefined && !("tableData" in props)) {
    			console_1$3.warn("<NodeEditor> was created without expected prop 'tableData'");
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
    }

    /* src\Toolkit\CategoryButton.svelte generated by Svelte v3.19.1 */

    const file$c = "src\\Toolkit\\CategoryButton.svelte";

    function create_fragment$c(ctx) {
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
    			attr_dev(div0, "class", "slotContainer svelte-1qwt2j4");
    			add_location(div0, file$c, 13, 8, 225);
    			attr_dev(h1, "class", "svelte-1qwt2j4");
    			add_location(h1, file$c, 17, 12, 342);
    			attr_dev(div1, "class", "labelContainer svelte-1qwt2j4");
    			add_location(div1, file$c, 16, 8, 300);
    			attr_dev(div2, "class", "frame neuOutdentShadow svelte-1qwt2j4");
    			add_location(div2, file$c, 12, 4, 156);
    			attr_dev(main, "class", "svelte-1qwt2j4");
    			add_location(main, file$c, 11, 0, 144);
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { onClick: 2, label: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CategoryButton",
    			options,
    			id: create_fragment$c.name
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

    const file$d = "src\\Toolkit\\ToolkitWidget.svelte";

    function create_fragment$d(ctx) {
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
    			add_location(div0, file$d, 16, 4, 347);
    			attr_dev(h3, "class", "svelte-bz36hf");
    			add_location(h3, file$d, 20, 8, 447);
    			attr_dev(div1, "class", "labelContainer svelte-bz36hf");
    			add_location(div1, file$d, 19, 4, 409);
    			attr_dev(hr, "class", "svelte-bz36hf");
    			add_location(hr, file$d, 22, 4, 481);
    			attr_dev(main, "draggable", "true");
    			attr_dev(main, "class", "svelte-bz36hf");
    			add_location(main, file$d, 15, 0, 292);
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
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			label: 0,
    			animationDelay: 2,
    			objectType: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToolkitWidget",
    			options,
    			id: create_fragment$d.name
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
    const file$e = "src\\Toolkit\\Toolkit.svelte";

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
    	let if_block0 = /*category*/ ctx[0] == 0 && create_if_block_2$1(ctx);
    	let if_block1 = /*category*/ ctx[0] == 1 && create_if_block_1$2(ctx);

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
    			add_location(path, file$e, 32, 242, 1714);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 320 512");
    			attr_dev(svg, "class", "svelte-1qmj3si");
    			add_location(svg, file$e, 32, 12, 1484);
    			attr_dev(div0, "class", "backButtonContainer neuOutdentShadow svelte-1qmj3si");
    			add_location(div0, file$e, 31, 8, 1385);
    			attr_dev(div1, "class", "listFrame neuOutdentShadow svelte-1qmj3si");
    			add_location(div1, file$e, 34, 8, 1926);
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
    					if_block0 = create_if_block_2$1(ctx);
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
    					if_block1 = create_if_block_1$2(ctx);
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
    function create_if_block$3(ctx) {
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
    			add_location(div, file$e, 11, 8, 215);
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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(11:4) {#if category == null}",
    		ctx
    	});

    	return block;
    }

    // (37:12) {#if category == 0}
    function create_if_block_2$1(ctx) {
    	let t;
    	let current;

    	const toolkitwidget0 = new ToolkitWidget({
    			props: {
    				label: "Header",
    				objectType: "header",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const toolkitwidget1 = new ToolkitWidget({
    			props: {
    				label: "Paragraph",
    				objectType: "paragraph",
    				$$slots: { default: [create_default_slot_3] },
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
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(37:12) {#if category == 0}",
    		ctx
    	});

    	return block;
    }

    // (38:16) <ToolkitWidget                       label="Header"                      objectType="header"                  >
    function create_default_slot_4(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM336 152V256 360c0 13.3-10.7 24-24 24s-24-10.7-24-24V280H160l0 80c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-208c0-13.3 10.7-24 24-24s24 10.7 24 24v80H288V152c0-13.3 10.7-24 24-24s24 10.7 24 24z");
    			add_location(path, file$e, 42, 24, 2240);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 448 512");
    			attr_dev(svg, "class", "svelte-1qmj3si");
    			add_location(svg, file$e, 41, 20, 2152);
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
    		source: "(38:16) <ToolkitWidget                       label=\\\"Header\\\"                      objectType=\\\"header\\\"                  >",
    		ctx
    	});

    	return block;
    }

    // (46:16) <ToolkitWidget                      label="Paragraph"                      objectType="paragraph"                  >
    function create_default_slot_3(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM336 152V256 360c0 13.3-10.7 24-24 24s-24-10.7-24-24V280H160l0 80c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-208c0-13.3 10.7-24 24-24s24 10.7 24 24v80H288V152c0-13.3 10.7-24 24-24s24 10.7 24 24z");
    			add_location(path, file$e, 50, 24, 2851);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 448 512");
    			attr_dev(svg, "class", "svelte-1qmj3si");
    			add_location(svg, file$e, 49, 20, 2763);
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
    		source: "(46:16) <ToolkitWidget                      label=\\\"Paragraph\\\"                      objectType=\\\"paragraph\\\"                  >",
    		ctx
    	});

    	return block;
    }

    // (56:12) {#if category == 1}
    function create_if_block_1$2(ctx) {
    	let current;

    	const toolkitwidget = new ToolkitWidget({
    			props: {
    				label: "Smart Table",
    				objectType: "table",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(toolkitwidget.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toolkitwidget, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toolkitwidget.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toolkitwidget.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toolkitwidget, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(56:12) {#if category == 1}",
    		ctx
    	});

    	return block;
    }

    // (57:16) <ToolkitWidget                      label="Smart Table"                      objectType="table"                  >
    function create_default_slot_2(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm88 64v64H64V96h88zm56 0h88v64H208V96zm240 0v64H360V96h88zM64 224h88v64H64V224zm232 0v64H208V224h88zm64 0h88v64H360V224zM152 352v64H64V352h88zm56 0h88v64H208V352zm240 0v64H360V352h88z");
    			add_location(path, file$e, 60, 246, 3652);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			attr_dev(svg, "class", "svelte-1qmj3si");
    			add_location(svg, file$e, 60, 16, 3422);
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
    		source: "(57:16) <ToolkitWidget                      label=\\\"Smart Table\\\"                      objectType=\\\"table\\\"                  >",
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
    			add_location(path, file$e, 17, 20, 473);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 448 512");
    			add_location(svg, file$e, 16, 16, 389);
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
    			add_location(path, file$e, 26, 16, 1072);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			add_location(svg, file$e, 25, 12, 992);
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

    function create_fragment$e(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$1];
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
    			add_location(main, file$e, 9, 0, 171);
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
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toolkit",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\DebugConsole.svelte generated by Svelte v3.19.1 */

    const file$f = "src\\DebugConsole.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (9:8) {#each info as line}
    function create_each_block$5(ctx) {
    	let p;
    	let t_value = /*line*/ ctx[1] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-1cf9cjr");
    			add_location(p, file$f, 9, 12, 145);
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
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(9:8) {#each info as line}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let main;
    	let div;
    	let each_value = /*info*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "frame neuIndentShadow svelte-1cf9cjr");
    			add_location(div, file$f, 7, 4, 66);
    			attr_dev(main, "class", "svelte-1cf9cjr");
    			add_location(main, file$f, 6, 0, 54);
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
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
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
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { info: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DebugConsole",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get info() {
    		throw new Error("<DebugConsole>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set info(value) {
    		throw new Error("<DebugConsole>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    class NodeData {

        constructor(title, inputs, outputs, rawNodeData) {
            this.title = title;

            this.inputs = inputs;
            this.outputs = outputs;

            this.rawNodeData = rawNodeData;

            this.outputs.forEach((o) => {
                o.superNode = this;
            });

            this.inputs.forEach((i) => {
                i.superNode = this;
            });
        }
    }

    var NodeData_1 = NodeData;

    class NodeInputTether {
        
        constructor(label, context) {
            this.label = label;
            this.connection = null;

            this.context = context;

            this.superNode = null;
        }

        getValue() {
            return new Promise(async (resolve, reject) => {
                if (this.connection === null) reject((this.label || "Unknown Tether") + " not connected");

                let output = this.context[this.connection];

                await output.process()
                    .then((value) => {resolve(value);})
                    .catch((err) => {reject(err);});
            });
        }

        connect(otherEnd) {
            this.connection = otherEnd;
        }
    }

    var NodeInputTether_1 = NodeInputTether;

    class NodeOutputTether {

        constructor(label, inputs, id, context) {
            this.label = label;
            this.inputs = inputs;

            this.id = id;

            // Subscribe to context
            this.ctx = context;
            context[id] = this;

            this.superNode = null;

            this.process = function() {
                return new Promise(async (resolve, reject) => {
                    // Logic here
                    reject((this.label || "Unknown Tether") + ": Prototype Logic");
                });
            };
        }

        dismount() {
            delete this.ctx[this.id];
        }
    }

    var NodeOutputTether_1 = NodeOutputTether;

    class SumNodeData extends NodeData_1 {

        constructor(outputRefs, context, rawNodeData) {
            let inputs = [
                new NodeInputTether_1("A", context),
                new NodeInputTether_1("B", context),
            ];
            let outputs = [
                new SumNodeDataOutput("Sum", inputs, outputRefs[0], context),
            ];

            super("Sum", inputs, outputs, rawNodeData);
        }
    }


    class SumNodeDataOutput extends NodeOutputTether_1 {

        constructor(reqInputs, puts, id, context) {
            super(reqInputs, puts, id, context);

            this.process = function() {
                return new Promise(async (resolve, reject) => {
                    let a = await this.inputs[0].getValue();
                    let b = await this.inputs[1].getValue();
        
                    resolve(parseFloat(a) + parseFloat(b));
                });
            };
        }
    }

    var Sum = SumNodeData;

    /* src\App.svelte generated by Svelte v3.19.1 */
    const file$g = "src\\App.svelte";

    // (144:3) {#if debugConsoleOpen}
    function create_if_block_1$3(ctx) {
    	let current;

    	const debugconsole = new DebugConsole({
    			props: { info: /*debugContents*/ ctx[4] },
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
    			if (dirty & /*debugContents*/ 16) debugconsole_changes.info = /*debugContents*/ ctx[4];
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
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(144:3) {#if debugConsoleOpen}",
    		ctx
    	});

    	return block;
    }

    // (148:2) {#if edited != null}
    function create_if_block$4(ctx) {
    	let current;

    	const nodeeditor = new NodeEditor({
    			props: {
    				nodeData: /*projectData*/ ctx[7].objects["table"][/*edited*/ ctx[3]].nodes,
    				tableRef: /*projectData*/ ctx[7].objects["table"][/*edited*/ ctx[3]].reference,
    				tableData: /*projectData*/ ctx[7].objects["table"][/*edited*/ ctx[3]]
    			},
    			$$inline: true
    		});

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
    			if (dirty & /*edited*/ 8) nodeeditor_changes.nodeData = /*projectData*/ ctx[7].objects["table"][/*edited*/ ctx[3]].nodes;
    			if (dirty & /*edited*/ 8) nodeeditor_changes.tableRef = /*projectData*/ ctx[7].objects["table"][/*edited*/ ctx[3]].reference;
    			if (dirty & /*edited*/ 8) nodeeditor_changes.tableData = /*projectData*/ ctx[7].objects["table"][/*edited*/ ctx[3]];
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
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(148:2) {#if edited != null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let main;
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let updating_edited;
    	let updating_debObjectDrag;
    	let updating_debObjectResize;
    	let t2;
    	let t3;
    	let current;

    	const topbar = new TopBar({
    			props: {
    				toggleDebugConsole: /*func*/ ctx[8],
    				centerView: /*centerViewport*/ ctx[5],
    				resetZoom: /*resetZoom*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const toolkit = new Toolkit({ $$inline: true });

    	function viewport_edited_binding(value) {
    		/*viewport_edited_binding*/ ctx[10].call(null, value);
    	}

    	function viewport_debObjectDrag_binding(value) {
    		/*viewport_debObjectDrag_binding*/ ctx[11].call(null, value);
    	}

    	function viewport_debObjectResize_binding(value) {
    		/*viewport_debObjectResize_binding*/ ctx[12].call(null, value);
    	}

    	let viewport_props = { projectData: /*projectData*/ ctx[7] };

    	if (/*edited*/ ctx[3] !== void 0) {
    		viewport_props.edited = /*edited*/ ctx[3];
    	}

    	if (/*debugInfo*/ ctx[1].objectDrag !== void 0) {
    		viewport_props.debObjectDrag = /*debugInfo*/ ctx[1].objectDrag;
    	}

    	if (/*debugInfo*/ ctx[1].objectResize !== void 0) {
    		viewport_props.debObjectResize = /*debugInfo*/ ctx[1].objectResize;
    	}

    	const viewport = new Viewport({ props: viewport_props, $$inline: true });
    	/*viewport_binding*/ ctx[9](viewport);
    	binding_callbacks.push(() => bind(viewport, "edited", viewport_edited_binding));
    	binding_callbacks.push(() => bind(viewport, "debObjectDrag", viewport_debObjectDrag_binding));
    	binding_callbacks.push(() => bind(viewport, "debObjectResize", viewport_debObjectResize_binding));
    	let if_block0 = /*debugConsoleOpen*/ ctx[0] && create_if_block_1$3(ctx);
    	let if_block1 = /*edited*/ ctx[3] != null && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			create_component(topbar.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			create_component(toolkit.$$.fragment);
    			t1 = space();
    			create_component(viewport.$$.fragment);
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "centerRow svelte-7vtnx9");
    			add_location(div0, file$g, 132, 2, 2994);
    			attr_dev(div1, "class", "mainLayout svelte-7vtnx9");
    			add_location(div1, file$g, 126, 1, 2821);
    			attr_dev(main, "class", "svelte-7vtnx9");
    			add_location(main, file$g, 125, 0, 2812);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			mount_component(topbar, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			mount_component(toolkit, div0, null);
    			append_dev(div0, t1);
    			mount_component(viewport, div0, null);
    			append_dev(div0, t2);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div1, t3);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const topbar_changes = {};
    			if (dirty & /*debugConsoleOpen*/ 1) topbar_changes.toggleDebugConsole = /*func*/ ctx[8];
    			topbar.$set(topbar_changes);
    			const viewport_changes = {};

    			if (!updating_edited && dirty & /*edited*/ 8) {
    				updating_edited = true;
    				viewport_changes.edited = /*edited*/ ctx[3];
    				add_flush_callback(() => updating_edited = false);
    			}

    			if (!updating_debObjectDrag && dirty & /*debugInfo*/ 2) {
    				updating_debObjectDrag = true;
    				viewport_changes.debObjectDrag = /*debugInfo*/ ctx[1].objectDrag;
    				add_flush_callback(() => updating_debObjectDrag = false);
    			}

    			if (!updating_debObjectResize && dirty & /*debugInfo*/ 2) {
    				updating_debObjectResize = true;
    				viewport_changes.debObjectResize = /*debugInfo*/ ctx[1].objectResize;
    				add_flush_callback(() => updating_debObjectResize = false);
    			}

    			viewport.$set(viewport_changes);

    			if (/*debugConsoleOpen*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*edited*/ ctx[3] != null) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
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
    			transition_in(topbar.$$.fragment, local);
    			transition_in(toolkit.$$.fragment, local);
    			transition_in(viewport.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(topbar.$$.fragment, local);
    			transition_out(toolkit.$$.fragment, local);
    			transition_out(viewport.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(topbar);
    			destroy_component(toolkit);
    			/*viewport_binding*/ ctx[9](null);
    			destroy_component(viewport);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
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

    function instance$g($$self, $$props, $$invalidate) {
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

    	// Project Data
    	// !!! NOTICE !!! THIS CONSTELLATION IS FOR DEV PURPOSES ONLY!!!
    	let projectData = {
    		"objects": {
    			"header": [],
    			"paragraph": [],
    			"table": [
    				{
    					"title": "New Table",
    					"nodes": {
    						"input": [],
    						"output": [],
    						"operator": [
    							{
    								"id": "Sum",
    								"posX": 40,
    								"posY": 4,
    								"width": 6,
    								"simX": 0,
    								"simY": 0,
    								"color": "var(--orange)",
    								"reference": null,
    								"inputs": [null, null],
    								"outputs": ["a4g7"]
    							},
    							{
    								"id": "Sum",
    								"posX": 50,
    								"posY": 5,
    								"width": 6,
    								"simX": 0,
    								"simY": 0,
    								"color": "var(--orange)",
    								"reference": null,
    								"inputs": [null, null],
    								"outputs": ["ef87"]
    							}
    						]
    					},
    					"reference": undefined,
    					"cellContents": undefined,
    					"posX": 25,
    					"posY": 5,
    					"sizeX": 28,
    					"sizeY": 21,
    					"width": 6,
    					"simX": 0,
    					"simY": 0,
    					"simResizeX": 0,
    					"simResizeY": 0,
    					"sizeBounds": []
    				}
    			]
    		}
    	};

    	// TODO: Delete the "= 0" part when I'm done! 
    	let edited = 0;

    	const func = () => {
    		$$invalidate(0, debugConsoleOpen = !debugConsoleOpen);
    	};

    	function viewport_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(2, viewportRef = $$value);
    		});
    	}

    	function viewport_edited_binding(value) {
    		edited = value;
    		$$invalidate(3, edited);
    	}

    	function viewport_debObjectDrag_binding(value) {
    		debugInfo.objectDrag = value;
    		$$invalidate(1, debugInfo);
    	}

    	function viewport_debObjectResize_binding(value) {
    		debugInfo.objectResize = value;
    		$$invalidate(1, debugInfo);
    	}

    	$$self.$capture_state = () => ({
    		TopBar,
    		Viewport,
    		NodeEditor,
    		Toolkit,
    		DebugConsole,
    		SumNodeData: Sum,
    		debugConsoleOpen,
    		debugInfo,
    		viewportRef,
    		centerViewport,
    		resetZoom,
    		projectData,
    		edited,
    		debugContents,
    		undefined
    	});

    	$$self.$inject_state = $$props => {
    		if ("debugConsoleOpen" in $$props) $$invalidate(0, debugConsoleOpen = $$props.debugConsoleOpen);
    		if ("debugInfo" in $$props) $$invalidate(1, debugInfo = $$props.debugInfo);
    		if ("viewportRef" in $$props) $$invalidate(2, viewportRef = $$props.viewportRef);
    		if ("projectData" in $$props) $$invalidate(7, projectData = $$props.projectData);
    		if ("edited" in $$props) $$invalidate(3, edited = $$props.edited);
    		if ("debugContents" in $$props) $$invalidate(4, debugContents = $$props.debugContents);
    	};

    	let debugContents;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*debugInfo*/ 2) {
    			 $$invalidate(4, debugContents = [
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
    		debugConsoleOpen,
    		debugInfo,
    		viewportRef,
    		edited,
    		debugContents,
    		centerViewport,
    		resetZoom,
    		projectData,
    		func,
    		viewport_binding,
    		viewport_edited_binding,
    		viewport_debObjectDrag_binding,
    		viewport_debObjectResize_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$g.name
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
