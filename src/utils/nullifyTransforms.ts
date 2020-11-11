import { LTWH } from 'src/types'

const nullifyTransforms = ({ top, left, width, height }: LTWH, transformArr: number[]): LTWH => {
  if (transformArr.length == 6) {
    // 2D matrix
    // That is the matrix of the transformation of the element
    // a scale x
    // b shear y
    // c shear x
    // d scale y
    // e translate x
    // f translate y
    const t = transformArr
    const det = t[0] * t[3] - t[1] * t[2]

    return {
      width: width / t[0],
      height: height / t[3],
      left: (left * t[3] - top * t[2] + t[2] * t[5] - t[4] * t[3]) / det,
      top: (-left * t[1] + top * t[0] + t[4] * t[1] - t[0] * t[5]) / det,
    }
  } else {
    return { top, left, width, height }
  }
}

export default nullifyTransforms
