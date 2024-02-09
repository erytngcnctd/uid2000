export function decimalToHex(d, padding) {
    var hex = Number(d).toString(16)
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding

    while (hex.length < padding) {
        hex = "0" + hex
    }

    return hex
}

export const getMimeType = (file) => {
    return new Promise((resolve) => {
      const filereader = new FileReader()
      filereader.onloadend = function (e) {
        if (e.target.readyState === FileReader.DONE) {
          const uint = new Uint8Array(e.target.result)
          let bytes = []
          uint.forEach((byte) => {
            bytes.push(byte.toString(16))
          })
          const hex = bytes.join('').toUpperCase()
  
          let mimeType
  
          switch (hex) {
            case '7BA2020':
              mimeType = 'model/gltf+json'
              break
            case '676C5446':
              mimeType = 'model/gltf-binary'
              break
            default:
              mimeType = 'Unknown MimeType'
          }
  
          resolve(mimeType)
        }
      }
      filereader.onerror = () => resolve('Unknown MimeType')
      filereader.readAsArrayBuffer(file.slice(0, 4))
    })
  }