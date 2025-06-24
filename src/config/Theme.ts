// Visual theme configuration
export const THEME = {
  board: {
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
    border: '#8b4513'
  },
  highlights: {
    lastMoveFromLight: 'rgb(170, 162, 58)', // A duller yellow for the origin square
    lastMoveFromDark: 'rgb(170, 162, 58)', // A duller yellow for the origin square
    lastMoveToLight: 'rgb(199, 190, 68)', // A brighter yellow-green for the destination
    lastMoveToDark: 'rgb(199, 190, 68)', // A brighter yellow-green for the destination
    selectedSquare: 'rgba(20, 85, 30, 0.33)',
    validMove: 'rgba(20, 85, 30, 0.5)',
    captureMove: 'rgba(255, 0, 0, 0.5)',
    check: 'rgba(255, 0, 0, 0.4)',
    promotionOverlay: 'rgba(0, 0, 0, 0.7)',

    highlightOutline: 'rgba(0, 0, 0, 0.4)', // A semi-transparent black for a gentle shadow effect.
    highlightOutlineBlur: 8,               // The blur radius of the shadow, creating the "soft" look.

    validMoveDotRadiusRatio: 6, // The radius of the dot is squareSize / ratio
    captureRingRadiusRatio: 4, // The radius of the ring is squareSize / ratio
    captureRingWidth: 6,
  },
  coordinates: {
    fontSize: 6, // Divisor for square size
    lightSquareColor: '#b58863',
    darkSquareColor: '#f0d9b5'
  }
} as const;