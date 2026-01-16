window.editorDnd = function () {
  return {
    draggingId: null,
    dragOverIndex: null,

    get isDragging() {
      return !!this.draggingId;
    },

    startDrag(id, event) {
      if (this.ui && this.ui.isPreview) return;
      this.draggingId = id;
      this.dragOverIndex = null;
      this.blockMenuId = null;
      if (event && event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', id);
      }
      if (typeof this.selectBlock === 'function') {
        this.selectBlock(id);
      }
    },

    dragOver(index, event) {
      if (!this.draggingId) return;
      if (event && event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
      this.dragOverIndex = index;
    },

    dragLeave(index) {
      if (this.dragOverIndex === index) {
        this.dragOverIndex = null;
      }
    },

    dropAt(index) {
      if (!this.draggingId) return;
      const fromIndex = this.blocks.findIndex((block) => block.id === this.draggingId);
      if (fromIndex === -1) {
        this.endDrag();
        return;
      }
      let toIndex = index;
      if (toIndex > fromIndex) {
        toIndex -= 1;
      }
      if (toIndex === fromIndex) {
        this.endDrag();
        return;
      }
      const [moved] = this.blocks.splice(fromIndex, 1);
      const maxIndex = this.blocks.length;
      if (toIndex < 0) toIndex = 0;
      if (toIndex > maxIndex) toIndex = maxIndex;
      this.blocks.splice(toIndex, 0, moved);
      if (typeof this.pushHistory === 'function') {
        this.pushHistory('reorder');
      }
      if (typeof this.queueSave === 'function') {
        this.queueSave();
      }
      if (typeof this.selectBlock === 'function') {
        this.selectBlock(moved.id);
      }
      this.endDrag();
    },

    endDrag() {
      this.draggingId = null;
      this.dragOverIndex = null;
    },

    dropzoneClass(index) {
      return this.dragOverIndex === index ? 'paper-dropzone-active' : '';
    },
  };
};

window.editor = function () {
  const core = typeof window.editorCore === 'function' ? window.editorCore() : {};
  const dnd = typeof window.editorDnd === 'function' ? window.editorDnd() : {};
  return { ...core, ...dnd };
};
