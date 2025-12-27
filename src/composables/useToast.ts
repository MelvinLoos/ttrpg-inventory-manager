import { ref } from 'vue'

export function useToast() {
  const toastMessage = ref('')
  const showToast = (msg: string, ms = 2000) => {
    toastMessage.value = msg
    setTimeout(() => (toastMessage.value = ''), ms)
  }
  return { toastMessage, showToast }
}
