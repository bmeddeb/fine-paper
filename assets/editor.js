window.editorCore = function () {
  const storageKey = 'paper-editor-state';
  const createId = () => `block_${Math.random().toString(16).slice(2, 10)}`;
  const clone = (value) => JSON.parse(JSON.stringify(value));

  const blockLibrary = {
    heading: {
      label: 'Heading',
      icon: 'nc-paper-2',
      defaults: {
        content: 'Add a heading',
        settings: {
          level: 'h2',
          alignment: 'left',
          textColor: 'default',
          fontSize: 'xl',
          lineHeight: 'normal',
        },
      },
    },
    paragraph: {
      label: 'Paragraph',
      icon: 'nc-paper-2',
      defaults: {
        content: 'Start writing or type / to insert a block.',
        settings: {
          alignment: 'left',
          fontSize: 'base',
          lineHeight: 'relaxed',
          textColor: 'default',
        },
      },
    },
    list: {
      label: 'List',
      icon: 'nc-bullet-list-67',
      defaults: {
        content: 'First item\nSecond item\nThird item',
        settings: {
          textColor: 'default',
        },
      },
    },
    quote: {
      label: 'Quote',
      icon: 'nc-paper-2',
      defaults: {
        content: 'A thoughtful quote sets the tone for the story.',
        settings: {
          citation: 'Source name',
          textColor: 'default',
        },
      },
    },
    image: {
      label: 'Image',
      icon: 'nc-camera-20',
      defaults: {
        content: '../../assets/img/bg/luke-chesser.jpg',
        settings: {
          alignment: 'center',
          caption: 'Add an optional caption',
          alt: '',
        },
      },
    },
    gallery: {
      label: 'Gallery',
      icon: 'nc-grid-45',
      defaults: {
        content: '',
        settings: {
          columns: 3,
          images: [
            '../../assets/img/bg/ben-white.jpg',
            '../../assets/img/bg/daniel-olahh.jpg',
            '../../assets/img/bg/joshua-earles.jpg',
          ],
        },
      },
    },
    video: {
      label: 'Video',
      icon: 'nc-button-play',
      defaults: {
        content: 'https://vimeo.com/123456',
        settings: {},
      },
    },
    buttons: {
      label: 'Buttons',
      icon: 'nc-tile-56',
      defaults: {
        content: 'Get started',
        settings: {
          variant: 'primary',
          link: '',
        },
      },
    },
    columns: {
      label: 'Columns',
      icon: 'nc-layout-11',
      defaults: {
        content: '',
        settings: {
          columnCount: 2,
          columns: ['Add block content', 'Drop content here'],
          background: 'none',
        },
      },
    },
    separator: {
      label: 'Separator',
      icon: 'nc-minimal-down',
      defaults: {
        content: '',
        settings: {},
      },
    },
    spacer: {
      label: 'Spacer',
      icon: 'nc-minimal-right',
      defaults: {
        content: '',
        settings: {
          height: 40,
        },
      },
    },
    shortcode: {
      label: 'Shortcode',
      icon: 'nc-settings-gear-65',
      defaults: {
        content: '[contact-form id="42"]',
        settings: {},
      },
    },
    html: {
      label: 'Custom HTML',
      icon: 'nc-settings-gear-65',
      defaults: {
        content: '<div class="callout">Custom HTML block</div>',
        settings: {},
      },
    },
  };

  const defaultDocument = {
    id: 'doc_123',
    title: '',
    status: 'draft',
    type: 'page',
    visibility: 'public',
    publishAt: '',
    meta: {
      categories: [],
      tags: [],
      featuredImage: null,
      featuredAlt: '',
      excerpt: '',
      settings: {
        allowComments: true,
        allowTrackbacks: false,
      },
    },
  };

  const defaultBlocks = [
    {
      id: 'block_1',
      type: 'heading',
      content: 'Welcome to the editor',
      settings: {
        level: 'h1',
        alignment: 'left',
        textColor: 'default',
        fontSize: 'xl',
        lineHeight: 'normal',
      },
    },
    {
      id: 'block_2',
      type: 'paragraph',
      content: 'Select a block to reveal block-specific settings on the right.',
      settings: {
        alignment: 'left',
        fontSize: 'base',
        lineHeight: 'relaxed',
        textColor: 'default',
      },
    },
    {
      id: 'block_3',
      type: 'image',
      content: '../../assets/img/bg/ben-white.jpg',
      settings: {
        alignment: 'center',
        caption: 'Optional caption text for the image block.',
        alt: '',
      },
    },
  ];

  const defaultUi = {
    selectedBlockId: null,
    sidebarMode: 'document',
    isPreview: false,
    viewMode: 'desktop',
    inserterOpen: false,
    listView: false,
    settingsOpen: true,
  };

  const availableCategories = ['Design', 'Product', 'Research', 'Culture'];

  return {
    editorState: {
      document: clone(defaultDocument),
      blocks: clone(defaultBlocks),
      ui: clone(defaultUi),
      history: [],
      historyIndex: -1,
    },
    availableCategories,
    tagInput: '',
    isSaving: false,
    lastSaved: '',
    saveTimer: null,
    autosaveTimer: null,
    blockMenuId: null,

    init() {
      this.load();
      this.applyHash();
      this.resetHistory();
      this.startAutosave();
    },

    get doc() {
      return this.editorState.document;
    },

    get blocks() {
      return this.editorState.blocks;
    },

    get ui() {
      return this.editorState.ui;
    },

    get selectedBlock() {
      return this.blocks.find((block) => block.id === this.ui.selectedBlockId) || null;
    },

    get titleHint() {
      return this.doc.title ? 'Auto-saves on blur' : 'Add a descriptive title';
    },

    get sidebarTitle() {
      if (this.ui.sidebarMode === 'document') {
        return `${this.docTypeLabel()} settings`;
      }
      if (!this.selectedBlock) return 'Block settings';
      return `Block: ${this.blockLabel(this.selectedBlock.type)}`;
    },

    get sidebarIcon() {
      if (this.ui.sidebarMode === 'document') {
        return 'nc-settings-gear-65';
      }
      if (!this.selectedBlock) return 'nc-settings-gear-65';
      return this.blockIcon(this.selectedBlock.type);
    },

    get sidebarHint() {
      return this.ui.sidebarMode === 'document'
        ? 'Configure document-wide settings and metadata.'
        : 'Adjust the styling and behavior of the selected block.';
    },

    docTypeLabel() {
      if (this.doc.type === 'post') return 'Post';
      if (this.doc.type === 'site') return 'Site';
      return 'Page';
    },

    blockLabel(type) {
      return blockLibrary[type] ? blockLibrary[type].label : 'Block';
    },

    blockIcon(type) {
      return blockLibrary[type] ? blockLibrary[type].icon : 'nc-paper-2';
    },

    isSelected(id) {
      return this.ui.selectedBlockId === id;
    },

    isTextBlock(type) {
      return ['heading', 'paragraph', 'list', 'quote'].includes(type);
    },

    addBlock(type) {
      const block = this.buildBlock(type);
      const index = this.blocks.findIndex((item) => item.id === this.ui.selectedBlockId);
      if (index === -1) {
        this.blocks.push(block);
      } else {
        this.blocks.splice(index + 1, 0, block);
      }
      this.ui.inserterOpen = false;
      this.selectBlock(block.id);
      this.pushHistory('add');
      this.queueSave();
    },

    buildBlock(type) {
      const blueprint = blockLibrary[type] ? blockLibrary[type].defaults : null;
      const block = blueprint ? clone(blueprint) : { content: '', settings: {} };
      return {
        id: createId(),
        type,
        content: block.content,
        settings: block.settings || {},
      };
    },

    selectBlock(id) {
      this.ui.selectedBlockId = id;
      this.ui.sidebarMode = 'block';
      this.updateHash();
    },

    clearSelection() {
      this.ui.selectedBlockId = null;
      this.ui.sidebarMode = 'document';
      this.blockMenuId = null;
      this.updateHash();
    },

    toggleBlockMenu(id) {
      this.blockMenuId = this.blockMenuId === id ? null : id;
    },

    duplicateBlock(id) {
      const index = this.blocks.findIndex((block) => block.id === id);
      if (index === -1) return;
      const cloneBlock = clone(this.blocks[index]);
      cloneBlock.id = createId();
      this.blocks.splice(index + 1, 0, cloneBlock);
      this.selectBlock(cloneBlock.id);
      this.pushHistory('duplicate');
      this.queueSave();
    },

    deleteBlock(id) {
      const index = this.blocks.findIndex((block) => block.id === id);
      if (index === -1) return;
      this.blocks.splice(index, 1);
      const next = this.blocks[index] || this.blocks[index - 1];
      if (next) {
        this.selectBlock(next.id);
      } else {
        this.clearSelection();
      }
      this.pushHistory('delete');
      this.queueSave();
    },

    moveBlock(id, direction) {
      const index = this.blocks.findIndex((block) => block.id === id);
      const nextIndex = index + direction;
      if (index === -1 || nextIndex < 0 || nextIndex >= this.blocks.length) return;
      const temp = this.blocks[index];
      this.blocks.splice(index, 1);
      this.blocks.splice(nextIndex, 0, temp);
      this.pushHistory('move');
      this.queueSave();
    },

    convertBlock(id, type) {
      const index = this.blocks.findIndex((block) => block.id === id);
      if (index === -1) return;
      const newBlock = this.buildBlock(type);
      newBlock.id = id;
      this.blocks.splice(index, 1, newBlock);
      this.selectBlock(id);
      this.pushHistory('convert');
      this.queueSave();
    },

    updateBlockContent(id, content) {
      const block = this.blocks.find((item) => item.id === id);
      if (!block) return;
      block.content = content;
      this.queueSave();
    },

    commitHistory() {
      this.pushHistory('edit');
    },

    resetHistory() {
      this.editorState.history = [this.snapshot()];
      this.editorState.historyIndex = 0;
    },

    pushHistory(reason) {
      const snapshot = this.snapshot();
      if (!snapshot) return;
      const history = this.editorState.history.slice(0, this.editorState.historyIndex + 1);
      history.push(snapshot);
      this.editorState.history = history;
      this.editorState.historyIndex = history.length - 1;
    },

    snapshot() {
      return {
        document: clone(this.doc),
        blocks: clone(this.blocks),
      };
    },

    undo() {
      if (this.editorState.historyIndex <= 0) return;
      this.editorState.historyIndex -= 1;
      const snapshot = this.editorState.history[this.editorState.historyIndex];
      this.doc.title = snapshot.document.title;
      this.doc.status = snapshot.document.status;
      this.doc.visibility = snapshot.document.visibility;
      this.doc.publishAt = snapshot.document.publishAt;
      this.doc.meta = clone(snapshot.document.meta);
      this.blocks.splice(0, this.blocks.length, ...clone(snapshot.blocks));
      this.queueSave();
    },

    redo() {
      if (this.editorState.historyIndex >= this.editorState.history.length - 1) return;
      this.editorState.historyIndex += 1;
      const snapshot = this.editorState.history[this.editorState.historyIndex];
      this.doc.title = snapshot.document.title;
      this.doc.status = snapshot.document.status;
      this.doc.visibility = snapshot.document.visibility;
      this.doc.publishAt = snapshot.document.publishAt;
      this.doc.meta = clone(snapshot.document.meta);
      this.blocks.splice(0, this.blocks.length, ...clone(snapshot.blocks));
      this.queueSave();
    },

    togglePreview() {
      this.ui.isPreview = !this.ui.isPreview;
    },

    toggleSettings() {
      this.ui.settingsOpen = !this.ui.settingsOpen;
    },

    listItems(block) {
      if (!block.content) return [];
      return block.content.split('\n').filter((item) => item.trim() !== '');
    },

    galleryGridStyle(columns) {
      return `grid-template-columns: repeat(${columns || 3}, minmax(0, 1fr))`;
    },

    columnGridStyle(columnCount) {
      return `grid-template-columns: repeat(${columnCount || 2}, minmax(0, 1fr))`;
    },

    columnItems(block) {
      if (!block.settings) return [];
      const count = block.settings.columnCount || 2;
      const items = Array.isArray(block.settings.columns) ? block.settings.columns : [];
      if (items.length !== count) {
        const next = [];
        for (let i = 0; i < count; i += 1) {
          next.push(items[i] || 'Add column content');
        }
        block.settings.columns = next;
      }
      return block.settings.columns;
    },

    textAlignClass(alignment) {
      if (alignment === 'center') return 'text-center';
      if (alignment === 'right') return 'text-right';
      return 'text-left';
    },

    textSizeClass(size) {
      if (size === 'sm') return 'text-sm';
      if (size === 'lg') return 'text-lg';
      if (size === 'xl') return 'text-xl';
      return 'text-base';
    },

    headingSizeClass(level) {
      if (level === 'h1') return 'text-4xl';
      if (level === 'h2') return 'text-3xl';
      if (level === 'h3') return 'text-2xl';
      if (level === 'h4') return 'text-xl';
      if (level === 'h5') return 'text-lg';
      if (level === 'h6') return 'text-base';
      return 'text-2xl';
    },

    lineHeightClass(height) {
      if (height === 'relaxed') return 'leading-relaxed';
      if (height === 'loose') return 'leading-loose';
      return 'leading-normal';
    },

    textColorClass(color) {
      if (color === 'muted') return 'text-[var(--paper-muted)]';
      if (color === 'accent') return 'text-[var(--paper-danger)]';
      return 'text-[var(--paper-text)]';
    },

    imageAlignClass(alignment) {
      if (alignment === 'right') return 'ml-auto';
      if (alignment === 'center') return 'mx-auto';
      return 'mr-auto';
    },

    addTag() {
      const value = this.tagInput.trim();
      if (!value) return;
      if (!this.doc.meta.tags.includes(value)) {
        this.doc.meta.tags.push(value);
      }
      this.tagInput = '';
      this.queueSave();
    },

    removeTag(tag) {
      this.doc.meta.tags = this.doc.meta.tags.filter((item) => item !== tag);
      this.queueSave();
    },

    toggleCategory(category) {
      const index = this.doc.meta.categories.indexOf(category);
      if (index === -1) {
        this.doc.meta.categories.push(category);
      } else {
        this.doc.meta.categories.splice(index, 1);
      }
      this.queueSave();
    },

    setFeaturedImage(url) {
      this.doc.meta.featuredImage = url;
      this.queueSave();
    },

    clearFeaturedImage() {
      this.doc.meta.featuredImage = null;
      this.queueSave();
    },

    generateExcerpt() {
      const paragraph = this.blocks.find((block) => block.type === 'paragraph');
      if (paragraph && paragraph.content) {
        this.doc.meta.excerpt = paragraph.content.slice(0, 160).trim();
      }
      this.queueSave();
    },

    handleKeydown(event) {
      const tag = event.target.tagName ? event.target.tagName.toLowerCase() : '';
      if (event.target.isContentEditable || ['input', 'textarea', 'select'].includes(tag)) {
        return;
      }
      if (event.key === 'Delete' && this.ui.selectedBlockId) {
        this.deleteBlock(this.ui.selectedBlockId);
        event.preventDefault();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
        if (this.ui.selectedBlockId) {
          this.duplicateBlock(this.ui.selectedBlockId);
          event.preventDefault();
        }
      }
    },

    updateHash() {
      const params = new URLSearchParams();
      if (this.doc.type) {
        params.set('type', this.doc.type);
      }
      if (this.ui.selectedBlockId) {
        params.set('block', this.ui.selectedBlockId);
      }
      const base = window.location.href.split('#')[0];
      const hash = params.toString();
      window.history.replaceState(null, '', hash ? `${base}#${hash}` : base);
      this.updateNavActive();
    },

    applyHash() {
      const params = new URLSearchParams(window.location.hash.replace('#', ''));
      const type = params.get('type');
      const blockId = params.get('block');
      if (type) {
        this.setDocType(type);
      }
      if (blockId) {
        const exists = this.blocks.find((block) => block.id === blockId);
        if (exists) {
          this.selectBlock(blockId);
        }
      } else {
        this.clearSelection();
      }
      this.updateNavActive();
    },

    setDocType(type) {
      if (!['page', 'post', 'site'].includes(type)) return;
      this.doc.type = type;
      this.queueSave();
    },

    updateNavActive() {
      const links = document.querySelectorAll('[data-editor-link]');
      links.forEach((link) => link.classList.remove('active'));
      const active = document.querySelector(`[data-editor-link="${this.doc.type}"]`);
      if (active) {
        active.classList.add('active');
      }
    },

    queueSave() {
      if (this.saveTimer) {
        clearTimeout(this.saveTimer);
      }
      this.saveTimer = setTimeout(() => {
        this.save('debounced');
      }, 500);
    },

    save(reason) {
      try {
        this.isSaving = true;
        const payload = {
          document: this.doc,
          blocks: this.blocks,
          ui: this.ui,
        };
        localStorage.setItem(storageKey, JSON.stringify(payload));
        this.lastSaved = new Date().toLocaleTimeString();
      } catch (error) {
        // Silently ignore storage errors in demo mode.
      } finally {
        this.isSaving = false;
      }
    },

    startAutosave() {
      if (this.autosaveTimer) return;
      this.autosaveTimer = setInterval(() => {
        this.save('autosave');
      }, 30000);
    },

    load() {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed.document) {
          this.editorState.document = { ...this.editorState.document, ...parsed.document };
          this.editorState.document.meta = { ...this.editorState.document.meta, ...parsed.document.meta };
        }
        if (Array.isArray(parsed.blocks)) {
          this.editorState.blocks = parsed.blocks;
        }
        if (parsed.ui) {
          this.editorState.ui = { ...this.editorState.ui, ...parsed.ui };
        }
      } catch (error) {
        // Ignore invalid stored data.
      }
    },
  };
};
