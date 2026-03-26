/**
 * 频率分配策略 (Strategy Pattern)
 * symmetric: 双耳对称 ±½ beat
 * left:      仅左耳下移
 * right:     仅右耳上移
 */

const strategies = {
  symmetric: {
    pure(carrier, beat) {
      return { left: carrier - beat / 2, right: carrier + beat / 2 };
    },
    music(beat) {
      return { left: -beat / 2, right: beat / 2 };
    },
    drone(center, beat) {
      return { left: center - beat / 2, right: center + beat / 2 };
    }
  },
  left: {
    pure(carrier, beat) {
      return { left: carrier - beat, right: carrier };
    },
    music(beat) {
      return { left: -beat, right: 0 };
    },
    drone(center, beat) {
      return { left: center - beat, right: center };
    }
  },
  right: {
    pure(carrier, beat) {
      return { left: carrier, right: carrier + beat };
    },
    music(beat) {
      return { left: 0, right: beat };
    },
    drone(center, beat) {
      return { left: center, right: center + beat };
    }
  }
};

export function getStrategy(name) {
  return strategies[name] || strategies.symmetric;
}

export function getPureFreqs(carrier, beat, distName) {
  return getStrategy(distName).pure(carrier, beat);
}

export function getMusicShifts(beat, distName) {
  return getStrategy(distName).music(beat);
}

export function getDroneFreqs(baseFreq, ratio, beat, distName) {
  const center = baseFreq * ratio;
  return getStrategy(distName).drone(center, beat);
}

export const DIST_LABELS = {
  symmetric: '对称分配',
  left: '仅左耳频移',
  right: '仅右耳频移'
};
