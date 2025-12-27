import { ref } from 'vue'

export function useToast() {
  const toastMessage = ref<string>('')
  const showToast = (msg: string, ms = 2000): void => {
    toastMessage.value = msg
    setTimeout(() => (toastMessage.value = ''), ms)
  }
  return { toastMessage, showToast }
}
