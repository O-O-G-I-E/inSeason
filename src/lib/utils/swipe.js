// Swipe Detection Utility
export function swipe(node, { onSwipeLeft, onSwipeRight, threshold = 50 }) {
  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;

  function handleTouchStart(event) {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
  }

  function handleTouchMove(event) {
    endX = event.touches[0].clientX;
    endY = event.touches[0].clientY;
  }

  function handleTouchEnd() {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    
    // Nur horizontale Swipes (nicht vertikal scrollen)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }
  }

  node.addEventListener('touchstart', handleTouchStart);
  node.addEventListener('touchmove', handleTouchMove);
  node.addEventListener('touchend', handleTouchEnd);

  return {
    destroy() {
      node.removeEventListener('touchstart', handleTouchStart);
      node.removeEventListener('touchmove', handleTouchMove);
      node.removeEventListener('touchend', handleTouchEnd);
    }
  };
}
