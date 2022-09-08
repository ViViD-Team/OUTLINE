
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
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

    /* src\TopBar\TopBar.svelte generated by Svelte v3.19.1 */

    const file = "src\\TopBar\\TopBar.svelte";

    function create_fragment(ctx) {
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
    			attr_dev(path, "d", "M35 55H5V5H55V55H80");
    			attr_dev(path, "stroke", "url(#paint0_linear_109_17)");
    			attr_dev(path, "stroke-width", "10");
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			add_location(path, file, 9, 12, 164);
    			attr_dev(stop0, "stop-color", "#EC2351");
    			add_location(stop0, file, 12, 12, 448);
    			attr_dev(stop1, "offset", "1");
    			attr_dev(stop1, "stop-color", "#DB6239");
    			add_location(stop1, file, 13, 12, 490);
    			attr_dev(linearGradient, "id", "paint0_linear_109_17");
    			attr_dev(linearGradient, "x1", "55");
    			attr_dev(linearGradient, "y1", "5");
    			attr_dev(linearGradient, "x2", "55");
    			attr_dev(linearGradient, "y2", "55");
    			attr_dev(linearGradient, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient, file, 11, 12, 330);
    			add_location(defs, file, 10, 12, 310);
    			attr_dev(svg, "viewBox", "0 0 85 60");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "svelte-2ix7ni");
    			add_location(svg, file, 8, 8, 78);
    			attr_dev(div0, "class", "logoContainer svelte-2ix7ni");
    			add_location(div0, file, 7, 4, 41);
    			attr_dev(div1, "class", "frame neuIndentShadow svelte-2ix7ni");
    			add_location(div1, file, 19, 8, 653);
    			attr_dev(div2, "class", "frameContainer svelte-2ix7ni");
    			add_location(div2, file, 18, 4, 615);
    			attr_dev(main, "class", "svelte-2ix7ni");
    			add_location(main, file, 6, 0, 29);
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
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
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

    class TopBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TopBar",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\Viewport\Viewport.svelte generated by Svelte v3.19.1 */

    const file$1 = "src\\Viewport\\Viewport.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let t0;
    	let h1;
    	let t1;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			h1 = element("h1");
    			t1 = text(/*viewZoom*/ ctx[2]);
    			attr_dev(div0, "class", "dottedBackground svelte-je475u");
    			set_style(div0, "background-position-x", /*viewX*/ ctx[0] + /*mouseDrag*/ ctx[3].delta.x + "px");
    			set_style(div0, "background-position-y", /*viewY*/ ctx[1] + /*mouseDrag*/ ctx[3].delta.y + "px");
    			set_style(div0, "background-size", 2 * /*viewZoom*/ ctx[2] + "vh");
    			add_location(div0, file$1, 56, 8, 1341);
    			add_location(h1, file$1, 62, 8, 1590);
    			attr_dev(div1, "class", "frame neuIndentShadow svelte-je475u");
    			add_location(div1, file$1, 48, 4, 1112);
    			attr_dev(main, "class", "svelte-je475u");
    			add_location(main, file$1, 47, 0, 1100);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, h1);
    			append_dev(h1, t1);

    			dispose = [
    				listen_dev(div1, "mousedown", /*mouseDown*/ ctx[4], false, false, false),
    				listen_dev(div1, "mousemove", /*mouseMove*/ ctx[5], false, false, false),
    				listen_dev(div1, "mouseup", /*mouseUp*/ ctx[6], false, false, false),
    				listen_dev(div1, "mouseleave", /*mouseUp*/ ctx[6], false, false, false),
    				listen_dev(div1, "mousewheel", /*scroll*/ ctx[7], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*viewX, mouseDrag*/ 9) {
    				set_style(div0, "background-position-x", /*viewX*/ ctx[0] + /*mouseDrag*/ ctx[3].delta.x + "px");
    			}

    			if (dirty & /*viewY, mouseDrag*/ 10) {
    				set_style(div0, "background-position-y", /*viewY*/ ctx[1] + /*mouseDrag*/ ctx[3].delta.y + "px");
    			}

    			if (dirty & /*viewZoom*/ 4) {
    				set_style(div0, "background-size", 2 * /*viewZoom*/ ctx[2] + "vh");
    			}

    			if (dirty & /*viewZoom*/ 4) set_data_dev(t1, /*viewZoom*/ ctx[2]);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let viewX = 0, viewY = 0, viewZoom = 1;
    	const zoomBounds = [0.2, 3];

    	let mouseDrag = {
    		"ongoing": false,
    		"start": { "x": 0, "y": 0 },
    		"delta": { "x": 0, "y": 0 }
    	};

    	function mouseDown(event) {
    		$$invalidate(3, mouseDrag.ongoing = true, mouseDrag);
    		$$invalidate(3, mouseDrag.start.x = event.clientX, mouseDrag);
    		$$invalidate(3, mouseDrag.start.y = event.clientY, mouseDrag);
    	}

    	function mouseMove(event) {
    		if (!mouseDrag.ongoing) return;
    		$$invalidate(3, mouseDrag.delta.x = event.clientX - mouseDrag.start.x, mouseDrag);
    		$$invalidate(3, mouseDrag.delta.y = event.clientY - mouseDrag.start.y, mouseDrag);
    	}

    	function mouseUp(event) {
    		if (!mouseDrag.ongoing) return;
    		$$invalidate(3, mouseDrag.ongoing = false, mouseDrag);
    		$$invalidate(0, viewX += mouseDrag.delta.x);
    		$$invalidate(1, viewY += mouseDrag.delta.y);
    		$$invalidate(3, mouseDrag.delta = { "x": 0, "y": 0 }, mouseDrag);
    	}

    	function scroll(event) {
    		$$invalidate(2, viewZoom -= event.deltaY / 1000);
    		$$invalidate(2, viewZoom = Math.max(zoomBounds[0], Math.min(viewZoom, zoomBounds[1])));
    	}

    	$$self.$capture_state = () => ({
    		viewX,
    		viewY,
    		viewZoom,
    		zoomBounds,
    		mouseDrag,
    		mouseDown,
    		mouseMove,
    		mouseUp,
    		scroll,
    		Math
    	});

    	$$self.$inject_state = $$props => {
    		if ("viewX" in $$props) $$invalidate(0, viewX = $$props.viewX);
    		if ("viewY" in $$props) $$invalidate(1, viewY = $$props.viewY);
    		if ("viewZoom" in $$props) $$invalidate(2, viewZoom = $$props.viewZoom);
    		if ("mouseDrag" in $$props) $$invalidate(3, mouseDrag = $$props.mouseDrag);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [viewX, viewY, viewZoom, mouseDrag, mouseDown, mouseMove, mouseUp, scroll];
    }

    class Viewport extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Viewport",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\NodeEditor\NodeEditor.svelte generated by Svelte v3.19.1 */

    const file$2 = "src\\NodeEditor\\NodeEditor.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let div;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			attr_dev(div, "class", "frame neuIndentShadow svelte-18io9co");
    			add_location(div, file$2, 7, 4, 41);
    			attr_dev(main, "class", "svelte-18io9co");
    			add_location(main, file$2, 6, 0, 29);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
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

    class NodeEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NodeEditor",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Toolkit\CategoryButton.svelte generated by Svelte v3.19.1 */

    const file$3 = "src\\Toolkit\\CategoryButton.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "frame neuOutdentShadow svelte-1o5fvc");
    			add_location(div, file$3, 11, 4, 123);
    			attr_dev(main, "class", "svelte-1o5fvc");
    			add_location(main, file$3, 10, 0, 111);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 4) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[2], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null));
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

    function instance$1($$self, $$props, $$invalidate) {
    	let { onClick } = $$props;

    	function handleClick() {
    		onClick();
    	}

    	const writable_props = ["onClick"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CategoryButton> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("onClick" in $$props) $$invalidate(0, onClick = $$props.onClick);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ onClick, handleClick });

    	$$self.$inject_state = $$props => {
    		if ("onClick" in $$props) $$invalidate(0, onClick = $$props.onClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [onClick, handleClick, $$scope, $$slots];
    }

    class CategoryButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$3, safe_not_equal, { onClick: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CategoryButton",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onClick*/ ctx[0] === undefined && !("onClick" in props)) {
    			console.warn("<CategoryButton> was created without expected prop 'onClick'");
    		}
    	}

    	get onClick() {
    		throw new Error("<CategoryButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<CategoryButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Toolkit\Toolkit.svelte generated by Svelte v3.19.1 */
    const file$4 = "src\\Toolkit\\Toolkit.svelte";

    // (16:4) {:else}
    function create_else_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "listFrame neuOutdentShadow svelte-1y6yiko");
    			add_location(div, file$4, 16, 8, 309);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(16:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (10:4) {#if category == null}
    function create_if_block(ctx) {
    	let div;
    	let current;

    	const categorybutton = new CategoryButton({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(categorybutton.$$.fragment);
    			attr_dev(div, "class", "categoryButtonLayout svelte-1y6yiko");
    			add_location(div, file$4, 10, 8, 157);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(categorybutton, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(categorybutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(categorybutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(categorybutton);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(10:4) {#if category == null}",
    		ctx
    	});

    	return block;
    }

    // (12:12) <CategoryButton>
    function create_default_slot(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(12:12) <CategoryButton>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
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
    			attr_dev(main, "class", "svelte-1y6yiko");
    			add_location(main, file$4, 8, 0, 113);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_blocks[current_block_type_index].m(main, null);
    			current = true;
    		},
    		p: noop,
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let category = null;
    	$$self.$capture_state = () => ({ CategoryButton, category });

    	$$self.$inject_state = $$props => {
    		if ("category" in $$props) $$invalidate(0, category = $$props.category);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [category];
    }

    class Toolkit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toolkit",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.19.1 */
    const file$5 = "src\\App.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let t2;
    	let current;
    	const topbar = new TopBar({ $$inline: true });
    	const toolkit = new Toolkit({ $$inline: true });
    	const viewport = new Viewport({ $$inline: true });
    	const nodeeditor = new NodeEditor({ $$inline: true });

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
    			create_component(nodeeditor.$$.fragment);
    			attr_dev(div0, "class", "centerRow svelte-7vtnx9");
    			add_location(div0, file$5, 11, 2, 285);
    			attr_dev(div1, "class", "mainLayout svelte-7vtnx9");
    			add_location(div1, file$5, 9, 1, 243);
    			attr_dev(main, "class", "svelte-7vtnx9");
    			add_location(main, file$5, 8, 0, 234);
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
    			append_dev(div1, t2);
    			mount_component(nodeeditor, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(topbar.$$.fragment, local);
    			transition_in(toolkit.$$.fragment, local);
    			transition_in(viewport.$$.fragment, local);
    			transition_in(nodeeditor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(topbar.$$.fragment, local);
    			transition_out(toolkit.$$.fragment, local);
    			transition_out(viewport.$$.fragment, local);
    			transition_out(nodeeditor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(topbar);
    			destroy_component(toolkit);
    			destroy_component(viewport);
    			destroy_component(nodeeditor);
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

    function instance$3($$self, $$props, $$invalidate) {
    	$$self.$capture_state = () => ({ TopBar, Viewport, NodeEditor, Toolkit });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
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
