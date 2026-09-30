import { nextTick, onBeforeUnmount, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface DialogFocusOptions {
  initialFocus?: Ref<HTMLElement | null>;
  lockScroll?: boolean;
}

export function useDialogFocus(
  open: MaybeRefOrGetter<boolean>,
  dialog: Ref<HTMLElement | null>,
  close: () => void,
  options: DialogFocusOptions = {},
) {
  let previouslyFocused: HTMLElement | null = null;
  let previousBodyOverflow = '';

  function focusableElements() {
    return Array.from(dialog.value?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [])
      .filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!toValue(open)) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key !== 'Tab') return;
    const focusable = focusableElements();
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!first || !last) {
      event.preventDefault();
      dialog.value?.focus();
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function deactivate(restoreFocus = true) {
    document.removeEventListener('keydown', handleKeydown);
    if (options.lockScroll !== false) document.body.style.overflow = previousBodyOverflow;
    if (restoreFocus && previouslyFocused?.isConnected) previouslyFocused.focus();
    previouslyFocused = null;
  }

  watch(
    () => toValue(open),
    async (isOpen) => {
      if (!isOpen) {
        deactivate();
        return;
      }

      previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      previousBodyOverflow = document.body.style.overflow;
      if (options.lockScroll !== false) document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeydown);
      await nextTick();
      options.initialFocus?.value?.focus();
      if (!options.initialFocus?.value) (focusableElements()[0] ?? dialog.value)?.focus();
    },
    { flush: 'post' },
  );

  onBeforeUnmount(() => deactivate(false));
}
