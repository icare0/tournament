// Simple toast hook placeholder
export function useToast() {
  return {
    toast: (props: { title: string; description: string; variant?: 'default' | 'destructive' }) => {
      // Use browser alert for now - can be replaced with a proper toast implementation
      if (props.variant === 'destructive') {
        alert(`Error: ${props.title}\n${props.description}`)
      } else {
        alert(`${props.title}\n${props.description}`)
      }
    },
  }
}
