/* eslint-disable @typescript-eslint/ban-ts-ignore */
// @ts-ignore
import rangy from "rangy/lib/rangy-core";
import "rangy/lib/rangy-textrange";
rangy.init();

export default () => {
  return rangy.getSelection();
};
