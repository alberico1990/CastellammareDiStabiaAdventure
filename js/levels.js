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
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LIVELLO 4 — Cassamonica
  // worldWidth 4500 · piazza · gazebo · palazzo Liberty · piccioni
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 4,
    name: "Cassamonica",
    worldWidth: 4500,
    background: {
      skyColor:    "#5BA8E0",
      groundColor: "#C8C0A8",
      vesuvio: false,
      mare:    false,
      colline: false
    },
    platforms: [
      { x:   80, y: 480, w: 200, h: 20, type: "pietra" },
      { x:  350, y: 440, w: 160, h: 20, type: "pietra" },
      { x:  580, y: 400, w: 140, h: 20, type: "pietra" },
      { x:  790, y: 360, w: 120, h: 20, type: "pietra" },
      { x: 1000, y: 420, w: 180, h: 20, type: "pietra" },
      { x: 1250, y: 380, w: 150, h: 20, type: "pietra" },
      { x: 1470, y: 340, w: 130, h: 20, type: "pietra" },
      { x: 1680, y: 400, w: 160, h: 20, type: "pietra" },
      { x: 1910, y: 360, w: 140, h: 20, type: "pietra" },
      { x: 2130, y: 320, w: 120, h: 20, type: "pietra" },
      { x: 2340, y: 380, w: 160, h: 20, type: "pietra" },
      { x: 2570, y: 340, w: 140, h: 20, type: "pietra" },
      { x: 2780, y: 300, w: 130, h: 20, type: "pietra" },
      { x: 2990, y: 360, w: 150, h: 20, type: "pietra" },
      { x: 3210, y: 320, w: 140, h: 20, type: "pietra" },
      { x: 3430, y: 280, w: 120, h: 20, type: "pietra" },
      { x: 3640, y: 340, w: 160, h: 20, type: "pietra" },
      { x: 3870, y: 300, w: 140, h: 20, type: "pietra" },
      { x: 4100, y: 360, w: 180, h: 20, type: "pietra" },
      { x: 4330, y: 400, w: 150, h: 20, type: "pietra" }
    ],
    enemies: [
      { x:  430, y: 428, type: "gabbiano" },
      { x:  660, y: 388, type: "gabbiano" },
      { x:  870, y: 348, type: "gabbiano" },
      { x: 1080, y: 408, type: "gabbiano" },
      { x: 1330, y: 368, type: "gabbiano" },
      { x: 1550, y: 328, type: "gabbiano" },
      { x: 1760, y: 388, type: "gabbiano" },
      { x: 1990, y: 348, type: "gabbiano" },
      { x: 2210, y: 308, type: "gabbiano" },
      { x: 2420, y: 368, type: "gabbiano" },
      { x: 2650, y: 328, type: "gabbiano" },
      { x: 2860, y: 288, type: "gabbiano" },
      { x: 3070, y: 348, type: "gabbiano" },
      { x: 3290, y: 308, type: "gabbiano" },
      { x: 3510, y: 268, type: "gabbiano" },
      { x: 3720, y: 328, type: "gabbiano" },
      { x: 3950, y: 288, type: "gabbiano" },
      { x: 4180, y: 348, type: "gabbiano" }
    ],
    collectibles: [
      { x:  130, y: 440, type: "graffa"       },
      { x:  390, y: 400, type: "bottiglietta" },
      { x:  620, y: 360, type: "graffa"       },
      { x:  830, y: 320, type: "bottiglietta" },
      { x: 1050, y: 380, type: "graffa"       },
      { x: 1290, y: 340, type: "bottiglietta" },
      { x: 1510, y: 300, type: "graffa"       },
      { x: 1720, y: 360, type: "bottiglietta" },
      { x: 1950, y: 320, type: "graffa"       },
      { x: 2170, y: 280, type: "bottiglietta" },
      { x: 2380, y: 340, type: "graffa"       },
      { x: 2610, y: 300, type: "bottiglietta" },
      { x: 2820, y: 260, type: "graffa"       },
      { x: 3030, y: 320, type: "bottiglietta" },
      { x: 3250, y: 280, type: "graffa"       },
      { x: 3470, y: 240, type: "bottiglietta" },
      { x: 3680, y: 300, type: "graffa"       },
      { x: 3910, y: 260, type: "bottiglietta" },
      { x: 4140, y: 320, type: "graffa"       },
      { x: 4370, y: 360, type: "bottiglietta" }
    ],
    flagX: 4420
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LIVELLO 5 — Piazza Spartaco
  // worldWidth 5000 · piazza · motorini · edifici storici
  // groundY 530 · motorino y = groundY - 85 = 445
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 5,
    name: "Piazza Spartaco",
    worldWidth: 5000,
    background: {
      skyColor:    "#5BA8E0",
      groundColor: "#C8B89A",
      vesuvio: false,
      mare:    false,
      colline: false
    },
    platforms: [
      { x:   80, y: 480, w: 200, h: 20, type: "pietra" },
      { x:  360, y: 445, w: 160, h: 20, type: "pietra" },
      { x:  590, y: 410, w: 150, h: 20, type: "pietra" },
      { x:  810, y: 370, w: 160, h: 20, type: "pietra" },
      { x: 1050, y: 425, w: 180, h: 20, type: "pietra" },
      { x: 1310, y: 385, w: 150, h: 20, type: "pietra" },
      { x: 1530, y: 345, w: 140, h: 20, type: "pietra" },
      { x: 1750, y: 405, w: 160, h: 20, type: "pietra" },
      { x: 1980, y: 365, w: 150, h: 20, type: "pietra" },
      { x: 2210, y: 325, w: 160, h: 20, type: "pietra" },
      { x: 2450, y: 385, w: 150, h: 20, type: "pietra" },
      { x: 2680, y: 345, w: 140, h: 20, type: "pietra" },
      { x: 2900, y: 305, w: 160, h: 20, type: "pietra" },
      { x: 3130, y: 365, w: 150, h: 20, type: "pietra" },
      { x: 3360, y: 325, w: 140, h: 20, type: "pietra" },
      { x: 3580, y: 285, w: 160, h: 20, type: "pietra" },
      { x: 3810, y: 345, w: 150, h: 20, type: "pietra" },
      { x: 4040, y: 305, w: 140, h: 20, type: "pietra" },
      { x: 4270, y: 365, w: 160, h: 20, type: "pietra" },
      { x: 4510, y: 410, w: 180, h: 20, type: "pietra" },
      { x: 4760, y: 450, w: 200, h: 20, type: "pietra" }
    ],
    enemies: [
      { x:  407, y: 378, type: "motorino" },
      { x:  632, y: 343, type: "motorino" },
      { x:  857, y: 303, type: "motorino" },
      { x: 1107, y: 358, type: "motorino" },
      { x: 1352, y: 318, type: "motorino" },
      { x: 1567, y: 278, type: "motorino" },
      { x: 1797, y: 338, type: "motorino" },
      { x: 2022, y: 298, type: "motorino" },
      { x: 2257, y: 258, type: "motorino" },
      { x: 2492, y: 318, type: "motorino" },
      { x: 2717, y: 278, type: "motorino" },
      { x: 2947, y: 238, type: "motorino" },
      { x: 3172, y: 298, type: "motorino" },
      { x: 3397, y: 258, type: "motorino" },
      { x: 3627, y: 218, type: "motorino" },
      { x: 3852, y: 278, type: "motorino" },
      { x: 4077, y: 238, type: "motorino" },
      { x: 4317, y: 298, type: "motorino" },
      { x: 4567, y: 343, type: "motorino" },
      { x: 4827, y: 383, type: "motorino" }
    ],
    collectibles: [
      { x:  180, y: 440, type: "graffa"       },
      { x:  440, y: 405, type: "bottiglietta" },
      { x:  665, y: 370, type: "graffa"       },
      { x:  890, y: 330, type: "bottiglietta" },
      { x: 1140, y: 385, type: "graffa"       },
      { x: 1385, y: 345, type: "bottiglietta" },
      { x: 1600, y: 305, type: "graffa"       },
      { x: 1830, y: 365, type: "bottiglietta" },
      { x: 2055, y: 325, type: "graffa"       },
      { x: 2290, y: 285, type: "bottiglietta" },
      { x: 2525, y: 345, type: "graffa"       },
      { x: 2750, y: 305, type: "bottiglietta" },
      { x: 2980, y: 265, type: "graffa"       },
      { x: 3205, y: 325, type: "bottiglietta" },
      { x: 3430, y: 285, type: "graffa"       },
      { x: 3660, y: 245, type: "bottiglietta" },
      { x: 3885, y: 305, type: "graffa"       },
      { x: 4110, y: 265, type: "bottiglietta" },
      { x: 4350, y: 325, type: "graffa"       },
      { x: 4600, y: 370, type: "bottiglietta" },
      { x: 4860, y: 410, type: "graffa"       }
    ],
    flagX: 4930
  }

];
