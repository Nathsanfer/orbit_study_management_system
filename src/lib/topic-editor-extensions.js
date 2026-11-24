import { mergeAttributes, Node } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import HorizontalRule from '@tiptap/extension-horizontal-rule';

export const TopicImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      storagePath: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-storage-path'),
        renderHTML: ({ storagePath }) => (
          storagePath ? { 'data-storage-path': storagePath } : {}
        ),
      },
    };
  },
});

export const TopicHorizontalRule = HorizontalRule.extend({
  addAttributes() {
    return {
      variant: {
        default: 'subtle',
        parseHTML: (element) => element.getAttribute('data-variant') || 'subtle',
        renderHTML: ({ variant }) => (
          variant === 'accent' ? { 'data-variant': 'accent' } : {}
        ),
      },
    };
  },
});

export const TopicCallout = Node.create({
  name: 'topicCallout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      kind: {
        default: 'info',
        parseHTML: (element) => element.getAttribute('data-callout-kind') || 'info',
        renderHTML: ({ kind }) => ({ 'data-callout-kind': kind }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'aside[data-topic-callout]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['aside', mergeAttributes(HTMLAttributes, { 'data-topic-callout': '' }), 0];
  },
});
