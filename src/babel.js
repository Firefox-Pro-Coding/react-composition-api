const transformImports = [
  'observable',
  'reaction',
  'autorun',
  'when',
]

const transform = (t, path) => {
  const body = path.get('body')
  const importNodePaths = body.filter((p) => p.isImportDeclaration())
  const mboxImportNodes = importNodePaths.map((p) => p.node).filter((p) => p.source.value === 'mobx')
  const needTransformImports = []
  mboxImportNodes.forEach((imp) => {
    imp.specifiers.forEach((s) => {
      if (!t.isImportSpecifier(s)) {
        return
      }
      if (transformImports.includes(s.imported.name)) {
        needTransformImports.push({
          name: s.imported.name,
          localName: s.local.name,
        })
      }
    })
    imp.specifiers = imp.specifiers.filter((s) => !t.isImportSpecifier(s) || !transformImports.includes(s.imported.name))
  })

  if (needTransformImports.length) {
    const specifiers = needTransformImports.map((item) => t.importSpecifier(
      t.identifier(item.localName),
      t.identifier(item.name),
    ))
    const rcaImport = t.importDeclaration(specifiers, t.stringLiteral('@firefox-pro-coding/react-composition-api'))
    const lastImport = body.filter((p) => p.isImportDeclaration()).pop()
    lastImport.insertAfter(
      rcaImport,
    )
  }

  mboxImportNodes.forEach((p) => {
    if (p.node && !p.node.specifiers.length) {
      p.remove()
    }
  })
}

module.exports = ({ types: t }) => ({
  visitor: {
    Program(path) {
      transform(t, path)
    },
  },
})
