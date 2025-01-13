if (!Array.prototype.flat) {
  Array.prototype.flat = function (depth) {
    const flattened = []

    function flatten (arr, currentDepth) {
      for (let i = 0; i < arr.length; i++) {
        if (Array.isArray(arr[i]) && currentDepth < depth) {
          flatten(arr[i], currentDepth + 1)
        } else {
          flattened.push(arr[i])
        }
      }
    }

    flatten(this, 0)

    return flattened
  }
}
