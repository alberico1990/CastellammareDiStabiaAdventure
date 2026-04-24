'use strict';

const LEVELS = [

  // ─────────────────────────────────────────────────────────────────────────
  // LIVELLO 1 — Porto
  // worldWidth 3000 · mare · Vesuvio · piattaforme su moli e barche · gabbiani
  // y calibrati su canvas h ≈ 600, groundY ≈ 530
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 1,
    name: "Porto",
    worldWidth: 3000,
    background: {
      skyColor:    "#87CEEB",
      groundColor: "#8B7355",
      vesuvio: true,
      mare:    true,
      colline: false
    },
    platforms: [
      { x:   80, y: 480, w: 220, h: 20, type: "legno" },
      { x:  380, y: 455, w: 130, h: 22, type: "legno" },
      { x:  575, y: 470, w: 190, h: 20, type: "legno" },
      { x:  830, y: 440, w: 130, h: 22, type: "legno" },
      { x: 1020, y: 460, w: 210, h: 20, type: "legno" },
      { x: 1300, y: 420, w: 130, h: 22, type: "legno" },
      { x: 1500, y: 445, w: 200, h: 20, type: "legno" },
      { x: 1760, y: 410, w: 130, h: 22, type: "legno" },
      { x: 1960, y: 460, w: 220, h: 20, type: "legno" },
      { x: 2250, y: 430, w: 130, h: 22, type: "legno" },
      { x: 2450, y: 400, w: 180, h: 20, type: "legno" },
      { x: 2700, y: 380, w: 200, h: 20, type: "legno" }
    ],
    enemies: [
      { x:  440, y: 340, type: "gabbiano" },
      { x:  660, y: 310, type: "gabbiano" },
      { x:  920, y: 330, type: "gabbiano" },
      { x: 1140, y: 300, type: "gabbiano" },
      { x: 1420, y: 280, type: "gabbiano" },
      { x: 1650, y: 310, type: "gabbiano" },
      { x: 1870, y: 290, type: "gabbiano" },
      { x: 2130, y: 270, type: "gabbiano" },
      { x: 2380, y: 295, type: "gabbiano" },
      { x: 2630, y: 275, type: "gabbiano" }
    ],
    collectibles: [
      { x:  145, y: 440, type: "graffa"        },
      { x:  430, y: 415, type: "bottiglietta"  },
      { x:  630, y: 430, type: "graffa"        },
      { x:  875, y: 400, type: "bottiglietta"  },
      { x: 1070, y: 420, type: "graffa"        },
      { x: 1345, y: 380, type: "bottiglietta"  },
      { x: 1560, y: 405, type: "graffa"        },
      { x: 1805, y: 370, type: "bottiglietta"  },
      { x: 2020, y: 420, type: "graffa"        },
      { x: 2295, y: 390, type: "bottiglietta"  },
      { x: 2500, y: 360, type: "graffa"        },
      { x: 2750, y: 340, type: "bottiglietta"  },
      { x: 2855, y: 355, type: "graffa"        }
    ],
    flagX: 2920
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LIVELLO 2 — Centro Storico
  // worldWidth 3500 · palazzi · scalinate di pietra · turisti
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 2,
    name: "Centro Storico",
    worldWidth: 3500,
    background: {
      skyColor:    "#B0C4DE",
      groundColor: "#9B8B6B",
      vesuvio: true,
      mare:    false,
      colline: false
    },
    platforms: [
      { x:   80, y: 490, w: 160, h: 20, type: "pietra" },
      { x:  300, y: 460, w: 160, h: 20, type: "pietra" },
      { x:  520, y: 430, w: 160, h: 20, type: "pietra" },
      { x:  750, y: 445, w: 190, h: 20, type: "pietra" },
      { x: 1010, y: 405, w: 150, h: 20, type: "pietra" },
      { x: 1220, y: 435, w: 190, h: 20, type: "pietra" },
      { x: 1480, y: 390, w: 160, h: 20, type: "pietra" },
      { x: 1700, y: 415, w: 160, h: 20, type: "pietra" },
      { x: 1920, y: 445, w: 160, h: 20, type: "pietra" },
      { x: 2140, y: 400, w: 200, h: 20, type: "pietra" },
      { x: 2410, y: 365, w: 180, h: 20, type: "pietra" },
      { x: 2650, y: 385, w: 160, h: 20, type: "pietra" },
      { x: 2880, y: 440, w: 150, h: 20, type: "pietra" },
      { x: 3090, y: 410, w: 150, h: 20, type: "pietra" },
      { x: 3300, y: 380, w: 180, h: 20, type: "pietra" }
    ],
    enemies: [
      { x:  380, y: 395, type: "turista" },
      { x:  615, y: 365, type: "turista" },
      { x:  855, y: 380, type: "turista" },
      { x: 1115, y: 340, type: "turista" },
      { x: 1565, y: 325, type: "turista" },
      { x: 1995, y: 380, type: "turista" },
      { x: 2225, y: 335, type: "turista" },
      { x: 2695, y: 320, type: "turista" },
      { x: 3145, y: 345, type: "turista" }
    ],
    collectibles: [
      { x:  135, y: 450, type: "graffa"        },
      { x:  345, y: 420, type: "bottiglietta"  },
      { x:  565, y: 390, type: "graffa"        },
      { x:  800, y: 405, type: "bottiglietta"  },
      { x: 1055, y: 365, type: "graffa"        },
      { x: 1265, y: 395, type: "bottiglietta"  },
      { x: 1525, y: 350, type: "graffa"        },
      { x: 1745, y: 375, type: "bottiglietta"  },
      { x: 1965, y: 405, type: "graffa"        },
      { x: 2190, y: 360, type: "bottiglietta"  },
      { x: 2455, y: 325, type: "graffa"        },
      { x: 2695, y: 345, type: "bottiglietta"  },
      { x: 2925, y: 400, type: "graffa"        },
      { x: 3135, y: 370, type: "bottiglietta"  },
      { x: 3345, y: 340, type: "graffa"        }
    ],
    flagX: 3420
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LIVELLO 3 — Terme Varano
  // worldWidth 4000 · colline · rovine romane · lucertole
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 3,
    name: "Terme Varano",
    worldWidth: 4000,
    background: {
      skyColor:    "#90C9E8",
      groundColor: "#7A6A4A",
      vesuvio: false,
      mare:    false,
      colline: true
    },
    platforms: [
      { x:   80, y: 480, w: 250, h: 20, type: "rovina" },
      { x:  400, y: 450, w: 150, h: 18, type: "rovina" },
      { x:  610, y: 420, w: 180, h: 22, type: "rovina" },
      { x:  860, y: 460, w: 120, h: 18, type: "rovina" },
      { x: 1040, y: 430, w: 200, h: 20, type: "rovina" },
      { x: 1310, y: 390, w: 140, h: 22, type: "rovina" },
      { x: 1520, y: 420, w: 180, h: 18, type: "rovina" },
      { x: 1770, y: 380, w: 160, h: 22, type: "rovina" },
      { x: 2000, y: 350, w: 200, h: 20, type: "rovina" },
      { x: 2270, y: 375, w: 140, h: 18, type: "rovina" },
      { x: 2480, y: 410, w: 180, h: 22, type: "rovina" },
      { x: 2730, y: 380, w: 150, h: 20, type: "rovina" },
      { x: 2950, y: 355, w: 200, h: 22, type: "rovina" },
      { x: 3220, y: 380, w: 140, h: 18, type: "rovina" },
      { x: 3430, y: 415, w: 180, h: 20, type: "rovina" },
      { x: 3680, y: 440, w: 200, h: 20, type: "rovina" }
    ],
    enemies: [
      { x:  450, y: 438, type: "lucertola" },
      { x:  650, y: 408, type: "lucertola" },
      { x:  900, y: 448, type: "lucertola" },
      { x: 1095, y: 418, type: "lucertola" },
      { x: 1365, y: 378, type: "lucertola" },
      { x: 1575, y: 408, type: "lucertola" },
      { x: 1825, y: 368, type: "lucertola" },
      { x: 2055, y: 338, type: "lucertola" },
      { x: 2325, y: 363, type: "lucertola" },
      { x: 2535, y: 398, type: "lucertola" },
      { x: 2785, y: 368, type: "lucertola" },
      { x: 3005, y: 343, type: "lucertola" },
      { x: 3485, y: 403, type: "lucertola" }
    ],
    collectibles: [
      { x:  155, y: 440, type: "graffa"        },
      { x:  445, y: 410, type: "bottiglietta"  },
      { x:  660, y: 380, type: "graffa"        },
      { x:  905, y: 420, type: "bottiglietta"  },
      { x: 1090, y: 390, type: "graffa"        },
      { x: 1360, y: 350, type: "bottiglietta"  },
      { x: 1570, y: 380, type: "graffa"        },
      { x: 1820, y: 340, type: "bottiglietta"  },
      { x: 2050, y: 310, type: "graffa"        },
      { x: 2320, y: 335, type: "bottiglietta"  },
      { x: 2530, y: 370, type: "graffa"        },
      { x: 2780, y: 340, type: "bottiglietta"  },
      { x: 3000, y: 315, type: "graffa"        },
      { x: 3270, y: 340, type: "bottiglietta"  },
      { x: 3480, y: 375, type: "graffa"        },
      { x: 3730, y: 400, type: "bottiglietta"  },
      { x: 3850, y: 420, type: "graffa"        }
    ],
    flagX: 3900
  }

];
