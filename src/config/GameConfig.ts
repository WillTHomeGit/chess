// Game rule configuration
export const GAME_CONFIG = {
  pieces: {
    imagePath: '/pieces/',
    imageExtension: '.svg'
  },
  castling: {
    kingsideKingCol: 6,
    queensideKingCol: 2,
    kingsideRookFromCol: 7,
    kingsideRookToCol: 5,
    queensideRookFromCol: 0,
    queensideRookToCol: 3
  },
  promotion: {
    ranks: { white: 7, black: 0 }
  }
} as const;