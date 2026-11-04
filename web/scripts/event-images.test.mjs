import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const events = JSON.parse(await fs.readFile(path.join(root, 'src/data/eventos.json'), 'utf8'));
const readPage = (name) => fs.readFile(path.join(root, 'dist', name, 'index.html'), 'utf8');
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
const diskPath = (url) => path.join(root, 'dist', url.replace(/^\//, ''));

test('inline event images use real resized AVIF/WebP candidates and explicit sizes', async () => {
  const pages = await Promise.all(['', 'eventos', ...events.map((e) => `eventos/${e.slug}`)].map(readPage));
  const seen = new Set();
  let count = 0;
  for (const html of pages) {
    for (const [picture] of html.matchAll(/<picture\b[^>]*>[\s\S]*?<\/picture>/g)) {
      const img = picture.match(/<img\b[^>]*data-event-image="[^"]+"[^>]*>/)?.[0];
      if (!img) continue;
      count++;
      const image = attrs(img);
      const source = attrs(picture.match(/<source\b[^>]*>/)[0]);
      const max = { thumbnail: 288, card: 864, poster: 600 }[image['data-event-image']];
      assert.ok(Number(image.width) > 0 && Number(image.height) > 0);
      assert.ok(image.alt && image.sizes && source.sizes);
      assert.equal(source.type, 'image/avif');
      assert.ok(image.src.endsWith('.webp'));
      for (const [set, format] of [[source.srcset, '.avif'], [image.srcset, '.webp']]) {
        assert.ok(set);
        for (const candidate of set.split(',')) {
          const [url, descriptor] = candidate.trim().split(/\s+/);
          const width = Number.parseInt(descriptor, 10);
          assert.ok(width <= max, `${url}: ${width} > ${max}`);
          assert.ok(url.endsWith(format));
          if (seen.has(url)) continue;
          seen.add(url);
          const metadata = await sharp(diskPath(url)).metadata();
          assert.equal(metadata.width, width, `srcset descriptor matches physical width: ${url}`);
        }
      }
    }
  }
  assert.ok(count >= events.length * 2, 'all event detail and agenda images use the shared pipeline');
});

test('full posters have original dimensions but no active image source before opening', async () => {
  for (const event of events) {
    const html = await readPage(`eventos/${event.slug}`);
    const dialog = html.match(/<dialog\b[^>]*>[\s\S]*?<\/dialog>/)[0];
    const source = attrs(dialog.match(/<source\b[^>]*>/)[0]);
    const image = attrs(dialog.match(/<img\b[^>]*>/)[0]);
    assert.equal(image.src, undefined);
    assert.equal(image.srcset, undefined);
    assert.equal(source.srcset, undefined);
    const original = await sharp(path.join(root, 'src/assets/eventos', event.img)).metadata();
    for (const url of [source['data-full-srcset'], image['data-full-src']]) {
      const full = await sharp(diskPath(url)).metadata();
      assert.equal(full.width, original.width);
      assert.equal(full.height, original.height);
    }
    assert.ok(dialog.includes('aria-label="Cartel del evento ampliado"'));
    assert.ok(dialog.includes('autofocus'));
  }
});

// Exercise our event handlers without a browser. Native dialog rendering/focus trapping
// is provided by the browser; these checks cover our deferred loading and close lifecycle.
test('lightbox handlers defer loading, restore focus/scroll and preserve modified clicks', async () => {
  class Element {
    dataset = {};
    attributes = new Map();
    handlers = new Map();
    addEventListener(type, listener) {
      const listeners = this.handlers.get(type) || [];
      listeners.push(listener);
      this.handlers.set(type, listeners);
    }
    emit(type, event = {}) { for (const fn of this.handlers.get(type) || []) fn(event); }
    hasAttribute(name) { return this.attributes.has(name); }
    removeAttribute(name) { this.attributes.delete(name); }
    set src(value) { this.attributes.set('src', value); }
    get src() { return this.attributes.get('src'); }
    set srcset(value) { this.attributes.set('srcset', value); }
    get srcset() { return this.attributes.get('srcset'); }
    focus() { this.focused = true; }
  }
  const trigger = new Element();
  const dialog = new Element();
  const image = new Element();
  const source = new Element();
  const close = new Element();
  const status = new Element();
  image.dataset.fullSrc = '/full.webp';
  source.dataset.fullSrcset = '/full.avif';
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => { dialog.open = false; dialog.emit('close'); };
  dialog.getBoundingClientRect = () => ({ left: 10, top: 10, right: 100, bottom: 100 });
  dialog.querySelector = (selector) => ({ img: image, source, button: close, '[role="status"]': status })[selector];
  class Host extends Element {
    querySelector(selector) { return { '.poster-trigger': trigger, dialog }[selector]; }
  }
  const registry = new Map();
  const document = { documentElement: { style: { overflow: 'auto' } } };
  const component = await fs.readFile(path.join(root, 'src/components/EventPoster.astro'), 'utf8');
  const script = component.match(/<script>([\s\S]*?)<\/script>/)[1];
  vm.runInNewContext(stripTypeScriptTypes(script), {
    HTMLElement: Host,
    document,
    customElements: { get: (name) => registry.get(name), define: (name, value) => registry.set(name, value) },
  });
  new (registry.get('event-poster'))().connectedCallback();
  assert.equal(image.src, undefined);
  assert.equal(source.srcset, undefined);
  let prevented = false;
  trigger.emit('click', { preventDefault: () => { prevented = true; } });
  assert.ok(prevented && dialog.open);
  assert.equal(image.src, '/full.webp');
  assert.equal(source.srcset, '/full.avif');
  assert.equal(document.documentElement.style.overflow, 'hidden');
  image.emit('load');
  assert.equal(status.textContent, '');
  close.emit('click');
  assert.ok(!dialog.open && trigger.focused);
  assert.equal(document.documentElement.style.overflow, 'auto');
  trigger.emit('click', { ctrlKey: true, preventDefault: () => assert.fail('modified link click intercepted') });
  assert.ok(!dialog.open);
  trigger.emit('click', { preventDefault() {} });
  dialog.emit('click', { target: dialog, clientX: 0, clientY: 0 });
  assert.ok(!dialog.open);
  assert.equal(document.documentElement.style.overflow, 'auto');
});
