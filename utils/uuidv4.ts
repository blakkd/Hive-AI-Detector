function uuidv4() {
  return '00000000-0000-4000-y000-000000000000'
  // return '[1e7]+-1e3+-4e3+-8e3 +-1e11'.replace(/[018]/g, (c) =>
  //   (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16)
  //)
}
export { uuidv4 }
