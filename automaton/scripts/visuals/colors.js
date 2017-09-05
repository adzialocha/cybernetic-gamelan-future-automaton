import {
  Color,
} from 'three'

export const COLORS = {
  BLACK: new Color(0x000000),
  CREAM: new Color(0xf8eed8),
  DARK_BLUE: new Color(0x3c5a7a),
  DARK_GRAY: new Color(0x111111),
  DARKER_BLUE: new Color(0x323a48),
  GREEN: new Color(0x0fbcab),
  LIGHT_GRAY: new Color(0xefefef),
  LIGHT_GREEN: new Color(0x00cc00),
  LIGHT_RED: new Color(0xff4d4d),
  WHITE: new Color(0xffffff),
}

export function getColor(name) {
  return COLORS[name]
}
