import {
  normalizeDraperyDimension,
  validateDraperyDimension,
  normalizeShadeDimension,
  validateShadeDimension,
} from "../index";

// Drapery test
const d = normalizeDraperyDimension({
  widthInt: 120,
  heightInt: 100,
  heightFraction: 0.5,
});
validateDraperyDimension(d);
console.log("Drapery OK:", d);

// Shade test
const s = normalizeShadeDimension({
  widthInt: 48,
  widthFraction: 0.25,
  heightInt: 72,
  heightFraction: 0.125,
});
validateShadeDimension(s);
console.log("Shade OK:", s);
