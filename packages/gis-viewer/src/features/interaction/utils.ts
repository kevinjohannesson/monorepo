// https://stackoverflow.com/questions/10744645/detect-touchpad-vs-mouse-in-javascript/62415754#62415754

export const isTouchPadScroll = (event: globalThis.WheelEvent): boolean => {
  const { deltaY } = event;
  if (deltaY !== 0 && !Number.isInteger(deltaY)) {
    return false;
  }
  return true;
};
